/*
 * @Author: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Date: 2024-01-23 10:25:08
 * @LastEditors: Tom tong.jiang@pwc.com
 * @LastEditTime: 2024-03-04 16:47:16
 */
import _ from 'lodash'
import BaseInstance from '../../../../common/BaseInstance'
import { Log } from '../../../../common/enums/Log'
import { getIdClause } from '../../../../common/utils/CommonUtils'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { PriceCustomerDealConstant, PriceDealConstant, PriceTypeCode } from '../../../enum/Common'
import { MyDayVisitModel } from '../../../interface/MyDayVisit'
import { compareDateToToday } from '../../../utils/CommonUtil'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

class CSGridDealPrice {
    static async getCSGirdDeals(
        activeProdArr: Array<string>,
        store: MyDayVisitModel,
        today: string,
        greaterThan6weeks: string,
        buId: string,
        pricePriority: number
    ) {
        try {
            const customerDeals = await BaseInstance.sfSoupEngine.retrieve(
                'Customer_Deal__c',
                ['Id', 'Customer_Group_ID__c', 'Customer_Group_Member_ID__c'],
                `SELECT CGM.{Customer_Deal__c:Id}, CGM.{Customer_Deal__c:Customer_Group_ID__c},CGM.{Customer_Deal__c:Customer_Group_Member_ID__c}
                    FROM {Customer_Deal__c} CGM
                        LEFT JOIN {Customer_Deal__c} CGC
                        ON CGC.{Customer_Deal__c:Customer_Group_ID__c} = CGM.{Customer_Deal__c:Customer_Group_Member_ID__c} 
                    WHERE CGM.{Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_CGM}' 
                    AND CGM.{Customer_Deal__c:IsActive__c} IS TRUE
                    AND CGC.{Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_CGC}'
                    AND CGC.{Customer_Deal__c:IsActive__c} IS TRUE
                    AND CGC.{Customer_Deal__c:Cust_Id__c} = '${store.CustUniqId}'
                `
            )
            // Customer_Group_ID__c from api has .0, but Customer_Group_ID__c from csv does not include .0,
            // so in order to unify Customer_Group_ID__c, we keep Customer_Group_ID__c as .0 from csv.
            // here remove .0 from Customer_Group_ID__c, because Target_Value_Number__c does not have .0 at the end.
            const customerGroupIds = customerDeals.map((cus: any) => {
                const id = cus.Customer_Group_ID__c ? parseInt(cus.Customer_Group_ID__c).toString() : ''
                return id
            })
            const CSGirdDeals = await BaseInstance.sfSoupEngine.retrieve(
                'Deal__c',
                [
                    'Id',
                    'Deal_Id__c',
                    'Deal_Name__c',
                    'Net_Price__c',
                    'Effective_Date__c',
                    'Expiration_Date__c',
                    'Deal_Category_Code__c',
                    'Inven_Id__c',
                    'minimumQuantity'
                ],
                `
                SELECT
                    {Deal__c:Id},
                    {Deal__c:Deal_Id__c},
                    {Deal__c:Deal_Name__c},
                    {Deal__c:Net_Price__c},
                    {Deal__c:Effective_Date__c},
                    {Deal__c:Expiration_Date__c},
                    {Deal__c:Deal_Category_Code__c},
                    {Deal_Product_List__c:Inven_Id__c},
                    {Deal__c:Volume_Quantity__c}
                FROM {Deal__c}
                LEFT JOIN {Deal_Product_List__c}
                    ON {Deal_Product_List__c:Deal_Id__c} = {Deal__c:Deal_Id__c}
                LEFT JOIN {Customer_Deal__c} CD1
                LEFT JOIN {Customer_Deal__c} CD2
                    ON CD2.{Customer_Deal__c:Target_Id__c} = {Deal__c:Target_Id__c}
                WHERE
                    {Deal_Product_List__c:Inven_Id__c} IN (${getIdClause(activeProdArr)})
                    AND {Deal_Product_List__c:Is_Active__c} = true
                    AND {Deal_Product_List__c:Bu_Id__c} = '${buId}'
                    AND CD1.{Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_QTV}'
                    AND CD1.{Customer_Deal__c:Target_Name__c} = '${PriceCustomerDealConstant.CD_TARGET_NAME_CG}'
                    AND CD1.{Customer_Deal__c:Target_Value_Number__c} IN (${getIdClause(customerGroupIds)})
                    AND CD1.{Customer_Deal__c:Delete_Flag__c} IS FALSE
                    AND CD2.{Customer_Deal__c:Target_Field__c} = '${PriceCustomerDealConstant.CD_TARGET_NAME_CQT}'
                    AND CD2.{Customer_Deal__c:IsActive__c} = true
                    AND CD2.{Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_TL}'
                    AND CD2.{Customer_Deal__c:Target_Table_Id__c} = CD1.{Customer_Deal__c:Query_Target_Id__c}
                    AND {Deal__c:Effective_Date__c} <= '${greaterThan6weeks}'
                    AND {Deal__c:Expiration_Date__c} > '${today}'
                    AND {Deal__c:Bu_Id__c} = '${buId}'
                    AND {Deal__c:Forced_Deal_Flag__c} = false
                    AND {Deal__c:Is_Active__c} = true
                    AND {Deal__c:Send_Flag__c} = true
                    AND {Deal__c:Pricing_Level_Id__c} = '${buId.replaceAll('_RE', '')}'
                    AND {Deal__c:Pricing_Level_Type_Code__c} = '${PriceDealConstant.DEAL_TYPE_CODE_BU}'
                `
            )
            if (!_.isEmpty(CSGirdDeals) && Array.isArray(CSGirdDeals)) {
                const outputTemptDeal: Array<any> = []
                CSGirdDeals.forEach((CSGirdDeal) => {
                    const relativeStartVal = compareDateToToday(
                        `${CSGirdDeal?.Effective_Date__c || new Date().toString()}`
                    )
                    const relativeEndVal = compareDateToToday(
                        `${CSGirdDeal?.Expiration_Date__c || new Date().toString()}`
                    )
                    outputTemptDeal.push({
                        Cust_Id__c: store?.CustUniqId,
                        Inven_Id__c: CSGirdDeal?.Inven_Id__c,
                        Force_Deal_Flag__c: false,
                        Price: CSGirdDeal?.Net_Price__c,
                        Deal_Name__c: CSGirdDeal?.Deal_Name__c,
                        Priority: pricePriority,
                        Minimum_Quantity: CSGirdDeal.minimumQuantity,
                        Type_Code__c: PriceTypeCode.TRI,
                        Effective_Date: CSGirdDeal?.Effective_Date__c,
                        Expiration_Date: CSGirdDeal?.Expiration_Date__c,
                        Relative_Start_Value: relativeStartVal > 0 ? relativeStartVal : 0,
                        Deal_Id__c: CSGirdDeal.Deal_Id__c,
                        Relative_End_Value:
                            Number(relativeEndVal) > Number(greaterThan6weeks)
                                ? Number(greaterThan6weeks)
                                : relativeEndVal,
                        BuId: buId,
                        Deal_Category_Code__c: CSGirdDeal.Deal_Category_Code__c
                    })
                })
                return await BaseInstance.sfSoupEngine.upsert('Tmp_fd_prc', outputTemptDeal)
            }
            return []
        } catch (e) {
            await storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: GridDealQueries.ts',
                `getCSGirdDeals: ${ErrorUtils.error2String(e)}`
            )
            throw new Error(ErrorUtils.error2String(e))
        }
    }
}

export default CSGridDealPrice

/*
 * @Author: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Date: 2024-01-23 14:39:25
 * @LastEditors: Tom tong.jiang@pwc.com
 * @LastEditTime: 2024-02-27 14:48:27
 */
import _ from 'lodash'
import BaseInstance from '../../../../common/BaseInstance'
import { Log } from '../../../../common/enums/Log'
import { getIdClause } from '../../../../common/utils/CommonUtils'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { PriceCustomerDealConstant, PriceDealConstant, PricePriority, PriceTypeCode } from '../../../enum/Common'
import { MyDayVisitModel } from '../../../interface/MyDayVisit'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import AccountData from '../../account/AccountData'
import { compareDateToToday } from '../../../utils/CommonUtil'

class OtherNonForcedPrice {
    static async getOtherNonForcedPrice(
        store: MyDayVisitModel,
        today: string,
        todayAfter43: string,
        activeProdArr: Array<string>,
        buId: string,
        pricePriorityMap: Map<string, string>,
        greaterThan6weeks: string
    ) {
        try {
            // 1.get related account data
            const results = await AccountData.getAccountBsAndPz(store.AccountId)
            const pzIds = results?.filter((item) => !_.isEmpty(item.pzId))
            const pzId = (pzIds && pzIds.length > 0 && pzIds[0].pzId) || ''
            let prodOtherNonForcedPrice: Array<any> = []
            if (_.isEmpty(pzId)) {
                prodOtherNonForcedPrice = await BaseInstance.sfSoupEngine.retrieve(
                    'Deal__c',
                    [
                        'inventoryId',
                        'price',
                        'dealId',
                        'dealName',
                        'effectiveDate',
                        'expirationDate',
                        'Deal_Category_Code__c',
                        'minimumQuantity'
                    ],
                    `
                    SELECT
                        {Deal_Product_List__c:Inven_Id__c},
                        {Deal__c:Net_Price__c},
                        {Deal__c:Deal_Id__c},
                        {Deal__c:Deal_Name__c},
                        {Deal__c:Effective_Date__c},
                        {Deal__c:Expiration_Date__c},
                        {Deal__c:Deal_Category_Code__c},
                        {Deal__c:Volume_Quantity__c}
                    FROM {Deal__c} 
                    LEFT JOIN {Deal_Product_List__c} ON {Deal_Product_List__c:Deal_Id__c} = {Deal__c:Deal_Id__c}
                    AND {Deal_Product_List__c:Bu_Id__c} = {Deal__c:Bu_Id__c}
                    WHERE {Deal__c:Target_Id__c} IN (
                        SELECT {Customer_Deal__c:Target_Id__c}
                        FROM {Customer_Deal__c}
                        WHERE {Customer_Deal__c:Cust_Id__c} = '${store.CustUniqId}'
                        AND {Customer_Deal__c:IsActive__c} IS TRUE
                        AND ({Customer_Deal__c:Type__c} = '${
                            PriceCustomerDealConstant.CD_TYPE_TL
                        }' OR {Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_CT}')
                    )
                    AND {Deal__c:Effective_Date__c} <= '${todayAfter43}'
                    AND {Deal__c:Expiration_Date__c} > '${today}'
                    AND {Deal__c:Effective_Date__c} <= {Deal__c:Expiration_Date__c}
                    AND {Deal__c:Send_Flag__c} IS TRUE
                    AND {Deal__c:Is_Active__c} IS TRUE
                    AND {Deal__c:Forced_Deal_Flag__c} IS FALSE 
                    AND {Deal__c:Pricing_Level_Type_Code__c} != '${PriceDealConstant.DEAL_TYPE_CODE_PZ}'
                    AND {Deal_Product_List__c:Is_Active__c} IS TRUE
                    AND {Deal_Product_List__c:Inven_Id__c} IN (${getIdClause(activeProdArr)})
                    `,
                    [],
                    {},
                    false,
                    false
                )
            } else {
                // 2.get related price data from deal__c table
                prodOtherNonForcedPrice = await BaseInstance.sfSoupEngine.retrieve(
                    'Deal__c',
                    [
                        'inventoryId',
                        'price',
                        'dealId',
                        'dealName',
                        'effectiveDate',
                        'expirationDate',
                        'Deal_Category_Code__c',
                        'minimumQuantity'
                    ],
                    `
                SELECT
                    {Deal_Product_List__c:Inven_Id__c},
                    {Deal__c:Net_Price__c},
                    {Deal__c:Deal_Id__c},
                    {Deal__c:Deal_Name__c},
                    {Deal__c:Effective_Date__c},
                    {Deal__c:Expiration_Date__c},
                    {Deal__c:Deal_Category_Code__c},
                    {Deal__c:Volume_Quantity__c}
                FROM {Deal__c} 
                LEFT JOIN {Deal_Product_List__c} ON {Deal_Product_List__c:Deal_Id__c} = {Deal__c:Deal_Id__c}
                AND {Deal_Product_List__c:Bu_Id__c} = {Deal__c:Bu_Id__c}
                WHERE {Deal__c:Target_Id__c} IN (
                    SELECT {Customer_Deal__c:Target_Id__c}
                    FROM {Customer_Deal__c}
                    WHERE {Customer_Deal__c:Cust_Id__c} = '${store.CustUniqId}'
                    AND {Customer_Deal__c:IsActive__c} IS TRUE
                    AND ({Customer_Deal__c:Type__c} = '${
                        PriceCustomerDealConstant.CD_TYPE_TL
                    }' OR {Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_CT}')
                )
                AND {Deal__c:Effective_Date__c} <= '${todayAfter43}'
                AND {Deal__c:Expiration_Date__c} > '${today}'
                AND {Deal__c:Effective_Date__c} <= {Deal__c:Expiration_Date__c}
                AND {Deal__c:Send_Flag__c} IS TRUE
                AND {Deal__c:Is_Active__c} IS TRUE
                AND {Deal__c:Forced_Deal_Flag__c} IS FALSE 
                AND (
                    ({Deal__c:Pricing_Level_Id__c} = '${pzId}'
                    AND {Deal__c:Pricing_Level_Type_Code__c} = '${PriceDealConstant.DEAL_TYPE_CODE_PZ}')
                    OR {Deal__c:Pricing_Level_Type_Code__c} != '${PriceDealConstant.DEAL_TYPE_CODE_PZ}'
                )
                AND {Deal_Product_List__c:Is_Active__c} IS TRUE
                AND {Deal_Product_List__c:Inven_Id__c} IN (${getIdClause(activeProdArr)})
                `,
                    [],
                    {},
                    false,
                    false
                )
            }

            if (_.isEmpty(prodOtherNonForcedPrice)) {
                return
            }

            const tempPriceList = prodOtherNonForcedPrice.map((prod) => {
                const relativeStartVal = compareDateToToday(prod.effectiveDate)
                const relativeEndVal = compareDateToToday(prod.expirationDate)
                return {
                    Cust_Id__c: store.CustUniqId,
                    Inven_Id__c: prod.inventoryId,
                    Deal_Id__c: prod.dealId,
                    Force_Deal_Flag__c: false,
                    Price: prod.price,
                    Deal_Name__c: prod.dealName,
                    Priority: pricePriorityMap.get(PricePriority.OTHER_DEALS),
                    Minimum_Quantity: prod.minimumQuantity,
                    Effective_Date: prod.effectiveDate,
                    Expiration_Date: prod.expirationDate,
                    Relative_Start_Value: relativeStartVal > 0 ? relativeStartVal : 0,
                    Relative_End_Value:
                        relativeEndVal > Number(greaterThan6weeks) ? Number(greaterThan6weeks) : relativeEndVal,
                    BuId: buId,
                    Type_Code__c: PriceTypeCode.CST,
                    Deal_Category_Code__c: prod.Deal_Category_Code__c
                }
            })
            await BaseInstance.sfSoupEngine.upsert('Tmp_fd_prc', tempPriceList)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: prodOtherNonForcedPrice',
                `prodOtherNonForcedPrice failed` + ErrorUtils.error2String(err)
            )
            throw new Error(ErrorUtils.error2String(err))
        }
    }
}

export default OtherNonForcedPrice

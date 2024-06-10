/*
 * @Author: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Date: 2024-01-17 19:16:09
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @LastEditTime: 2024-01-24 18:03:54
 */
import BaseInstance from '../../../../common/BaseInstance'
import { Log } from '../../../../common/enums/Log'
import { getIdClause } from '../../../../common/utils/CommonUtils'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { PriceCustomerDealConstant, PriceDealConstant, PricePriority, PriceTypeCode } from '../../../enum/Common'
import { compareDateToToday } from '../../../utils/CommonUtil'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

class SDCPrice {
    static async getSDCPrice(
        store: any,
        today: string,
        todayAfter43: string,
        activeProdArr: Array<string>,
        buId: string,
        pricePriorityMap: Map<string, string>,
        greaterThan6weeks: string
    ) {
        try {
            const prodSDCPrice: Array<any> = await BaseInstance.sfSoupEngine.retrieve(
                'Tmp_fd_prc',
                [
                    'DealId',
                    'DealName',
                    'Inven_Id__c',
                    'dealEffectiveDate',
                    'dealExpirationDate',
                    'Pricing_Level_Type_Code__c',
                    'Net_Price__c',
                    'Volume_Quantity__c',
                    'Deal_Category_Code__c'
                ],
                `
        SELECT
            {Deal__c:Deal_Id__c},
            {Deal__c:Deal_Name__c},
            {Deal_Product_List__c:Inven_Id__c},
            {Deal__c:Effective_Date__c},
            {Deal__c:Expiration_Date__c},
            {Deal__c:Pricing_Level_Type_Code__c},
            {Deal__c:Net_Price__c},
            {Deal__c:Volume_Quantity__c},
            {Deal__c:Deal_Category_Code__c}
        FROM {Deal__c} DEAL
        LEFT JOIN (SELECT * FROM {Customer_Deal__c} 
            WHERE {Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_CT}'
            OR {Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_TL}') CDC 
        ON CDC.{Customer_Deal__c:Cust_Id__c} = '${store.CustUniqId}'
        AND DEAL.{Deal__c:Target_Id__c} = CDC.{Customer_Deal__c:Target_Id__c}
        LEFT JOIN (SELECT * FROM {Deal_Product_List__c} 
            WHERE {Deal_Product_List__c:Inven_Id__c} IN (${getIdClause(activeProdArr)})
            AND {Deal_Product_List__c:Is_Active__c} IS TRUE
            AND {Deal_Product_List__c:Bu_Id__c} = '${buId}') DPL 
            ON DEAL.{Deal__c:Deal_Id__c} = DPL.{Deal_Product_List__c:Deal_Id__c}
        WHERE DEAL.{Deal__c:Priority_Level_Code__c} = '${PricePriority.SDC}'
        AND DEAL.{Deal__c:Effective_Date__c} <= '${todayAfter43}'
        AND DEAL.{Deal__c:Expiration_Date__c} > '${today}'
        AND DEAL.{Deal__c:Send_Flag__c} IS TRUE
        AND CDC.{Customer_Deal__c:IsActive__c} IS TRUE
        AND DEAL.{Deal__c:Is_Active__c} IS TRUE
        AND DEAL.{Deal__c:Bu_Id__c} = DPL.{Deal_Product_List__c:Bu_Id__c}
        AND DEAL.{Deal__c:Forced_Deal_Flag__c} IS FALSE
        AND DEAL.{Deal__c:Volume_Quantity__c} >= ${PriceDealConstant.DEAL_VOLUME_QUANTITY_O}
            `,
                [],
                {},
                false,
                false
            )
            const tempPriceList = prodSDCPrice.map((prod) => {
                const relativeStartVal = compareDateToToday(prod.dealEffectiveDate)
                const relativeEndVal = compareDateToToday(prod.dealExpirationDate)
                return {
                    Force_Deal_Flag__c: false,
                    Type_Code__c: PriceTypeCode.CST,
                    Deal_Id__c: prod.DealId,
                    Cust_Id__c: store.CustUniqId,
                    Deal_Name__c: prod.DealName,
                    Inven_Id__c: prod.Inven_Id__c,
                    Priority: pricePriorityMap.get(PricePriority.SDC),
                    Price: prod.Net_Price__c,
                    Effective_Date: prod.dealEffectiveDate,
                    Expiration_Date: prod.dealExpirationDate,
                    Minimum_Quantity: prod.Volume_Quantity__c,
                    Relative_Start_Value: relativeStartVal > 0 ? relativeStartVal : 0,
                    Relative_End_Value:
                        relativeEndVal > Number(greaterThan6weeks) ? Number(greaterThan6weeks) : relativeEndVal,
                    Deal_Category_Code__c: prod.Deal_Category_Code__c
                }
            })
            await BaseInstance.sfSoupEngine.upsert('Tmp_fd_prc', tempPriceList)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getSDCPrice',
                `getSDCPrice failed` + ErrorUtils.error2String(err)
            )
        }
    }
}
export default SDCPrice

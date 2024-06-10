import BaseInstance from '../../../../common/BaseInstance'
import { Log } from '../../../../common/enums/Log'
import { getIdClause, isTrueInDB } from '../../../../common/utils/CommonUtils'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { PriceCustomerDealConstant, PriceDealConstant, PricePriority } from '../../../enum/Common'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import AccountData from '../../account/AccountData'
import { compareDateToToday } from '../../../utils/CommonUtil'

class AllForcedDealPrice {
    static async getAllForcedDealPrice(
        store: any,
        today: string,
        todayAfter43: string,
        activeProdArr: Array<string>,
        buId: string,
        pricePriorityMap: Map<string, string>,
        greaterThan6weeks: string
    ) {
        try {
            const pzId = await AccountData.getPzId(store)
            const prodAllForcedDealPrice: Array<any> = await BaseInstance.sfSoupEngine.retrieve(
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
                    'Deal_Rstr_Flg__c',
                    'Option_Priority__c',
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
            {Deal__c:Deal_Rstr_Flg__c},
            {Deal__c:Option_Priority__c},
            {Deal__c:Deal_Category_Code__c}
        FROM {Deal__c} DEAL1
        LEFT JOIN (SELECT * FROM {Customer_Deal__c} 
            WHERE {Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_CT}'
            OR {Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_TL}') CDC1 
        ON CDC1.{Customer_Deal__c:Cust_Id__c} = '${store.CustUniqId}'
        AND DEAL1.{Deal__c:Target_Id__c} = CDC1.{Customer_Deal__c:Target_Id__c}
        LEFT JOIN (SELECT * FROM {Deal_Product_List__c} 
            WHERE {Deal_Product_List__c:Inven_Id__c} IN (${getIdClause(activeProdArr)})
            AND {Deal_Product_List__c:Is_Active__c} IS TRUE
            AND {Deal_Product_List__c:Bu_Id__c} = '${buId}') DPL1 
            ON DEAL1.{Deal__c:Deal_Id__c} = DPL1.{Deal_Product_List__c:Deal_Id__c}
        WHERE DEAL1.{Deal__c:Effective_Date__c} <= '${todayAfter43}'
        AND DEAL1.{Deal__c:Expiration_Date__c} > '${today}'
        AND DEAL1.{Deal__c:Send_Flag__c} IS TRUE
        AND CDC1.{Customer_Deal__c:IsActive__c} IS TRUE
        AND DEAL1.{Deal__c:Bu_Id__c} = DPL1.{Deal_Product_List__c:Bu_Id__c}
        AND DEAL1.{Deal__c:Forced_Deal_Flag__c} IS TRUE
        AND DEAL1.{Deal__c:Is_Active__c} IS TRUE
        AND DEAL1.{Deal__c:Pricing_Level_Type_Code__c} != '${PriceDealConstant.DEAL_TYPE_CODE_PZ}'
        AND (DEAL1.{Deal__c:Deal_Type_Id__c} != '${PriceDealConstant.DEAL_TYPE_ID_5}'
        OR DEAL1.{Deal__c:Deal_Type_Id__c} IS NULL)
        UNION
        SELECT
            {Deal__c:Deal_Id__c},
            {Deal__c:Deal_Name__c},
            {Deal_Product_List__c:Inven_Id__c},
            {Deal__c:Effective_Date__c},
            {Deal__c:Expiration_Date__c},
            {Deal__c:Pricing_Level_Type_Code__c},
            {Deal__c:Net_Price__c},
            {Deal__c:Volume_Quantity__c},
            {Deal__c:Deal_Rstr_Flg__c},
            {Deal__c:Option_Priority__c},
            {Deal__c:Deal_Category_Code__c}
        FROM {Deal__c} DEAL2
        LEFT JOIN (SELECT * FROM {Customer_Deal__c} 
            WHERE {Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_CT}'
            OR {Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_TL}') CDC2 
        ON CDC2.{Customer_Deal__c:Cust_Id__c} = '${store.CustUniqId}'
        AND DEAL2.{Deal__c:Target_Id__c} = CDC2.{Customer_Deal__c:Target_Id__c}
        LEFT JOIN (SELECT * FROM {Deal_Product_List__c} 
            WHERE {Deal_Product_List__c:Inven_Id__c} IN (${getIdClause(activeProdArr)})
            AND {Deal_Product_List__c:Is_Active__c} IS TRUE
            AND {Deal_Product_List__c:Bu_Id__c} = '${buId}') DPL2 
            ON DEAL2.{Deal__c:Deal_Id__c} = DPL2.{Deal_Product_List__c:Deal_Id__c}
        WHERE DEAL2.{Deal__c:Effective_Date__c} <= '${todayAfter43}'
        AND DEAL2.{Deal__c:Expiration_Date__c} > '${today}'
        AND DEAL2.{Deal__c:Send_Flag__c} IS TRUE
        AND CDC2.{Customer_Deal__c:IsActive__c} IS TRUE
        AND DEAL2.{Deal__c:Pricing_Level_Id__c} = '${pzId}'
        AND DEAL2.{Deal__c:Forced_Deal_Flag__c} IS TRUE
        AND DEAL2.{Deal__c:Is_Active__c} IS TRUE
        AND DEAL2.{Deal__c:Bu_Id__c} = DPL2.{Deal_Product_List__c:Bu_Id__c}
        AND DEAL2.{Deal__c:Pricing_Level_Type_Code__c} = '${PriceDealConstant.DEAL_TYPE_CODE_PZ}'
        AND (DEAL2.{Deal__c:Deal_Type_Id__c} != '${PriceDealConstant.DEAL_TYPE_ID_5}'
        OR DEAL2.{Deal__c:Deal_Type_Id__c} IS NULL)
            `,
                [],
                {},
                false,
                false
            )
            const tempPriceList = prodAllForcedDealPrice.map((prod) => {
                const relativeStartVal = compareDateToToday(prod.dealEffectiveDate)
                const relativeEndVal = compareDateToToday(prod.dealExpirationDate)
                return {
                    Force_Deal_Flag__c: true,
                    Deal_Id__c: prod.DealId,
                    Deal_Name__c: prod.DealName,
                    Inven_Id__c: prod.Inven_Id__c,
                    Option_Priority: prod.Option_Priority__c,
                    Minimum_Quantity: prod.Volume_Quantity__c,
                    Cust_Id__c: store.CustUniqId,
                    Priority:
                        prod.Pricing_Level_Type_Code__c === PriceDealConstant.DEAL_TYPE_CODE_BU &&
                        isTrueInDB(prod.Deal_Rstr_Flg__c)
                            ? pricePriorityMap.get(PricePriority.BU_RESTRICTED_DEAL)
                            : pricePriorityMap.get(PricePriority.CUSTOMER_DEAL),
                    Price: prod.Net_Price__c,
                    Effective_Date: prod.dealEffectiveDate,
                    Expiration_Date: prod.dealExpirationDate,
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
                'Orderade: getAllForcedDealPrice',
                `getAllForcedDealPrice failed` + ErrorUtils.error2String(err)
            )
            throw new Error(ErrorUtils.error2String(err))
        }
    }
}

export default AllForcedDealPrice

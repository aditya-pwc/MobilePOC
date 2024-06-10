import BaseInstance from '../../../../common/BaseInstance'
import { Log } from '../../../../common/enums/Log'
import { getIdClause } from '../../../../common/utils/CommonUtils'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import {
    NationalAccountPriceConstant,
    PriceCustomerDealConstant,
    PriceDealConstant,
    PricePriority
} from '../../../enum/Common'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import AccountData from '../../account/AccountData'
import { compareDateToToday } from '../../../utils/CommonUtil'
import { MyDayVisitModel } from '../../../interface/MyDayVisit'

class FlexFundPrice {
    static async getProdFlexFundPrice(
        store: MyDayVisitModel,
        today: string,
        todayAfter43: string,
        activeProdArr: Array<string>,
        buId: string,
        pricePriorityMap: Map<string, string>,
        greaterThan6weeks: string
    ) {
        try {
            const nationalAccountFlag = await AccountData.isNationalAccount(store)
            if (nationalAccountFlag) {
                const prodFlexFundPrice: Array<any> = await BaseInstance.sfSoupEngine.retrieve(
                    'Natl_Account_Pricing__c',
                    [
                        'Inven_Id__c',
                        'Price__c',
                        'Dollar_Off__c',
                        'DealId',
                        'DealName',
                        'dealEffectiveDate',
                        'dealExpirationDate',
                        'Deal_Category_Code__c',
                        'napStartDate',
                        'napEndDate'
                    ],
                    `
                    SELECT
                        {Natl_Account_Pricing__c:Inven_Id__c},
                        {Natl_Account_Pricing__c:Price__c},
                        {Deal__c:Dollar_Off__c},
                        {Deal__c:Deal_Id__c},
                        {Deal__c:Deal_Name__c},
                        {Deal__c:Effective_Date__c},
                        {Deal__c:Expiration_Date__c},
                        {Deal__c:Deal_Category_Code__c},
                        {Natl_Account_Pricing__c:Price_Start_Date__c},
                        {Natl_Account_Pricing__c:Price_End_Date__c}
                    FROM {Natl_Account_Pricing__c} NAP
                    LEFT JOIN (SELECT * FROM {Customer_Deal__c} 
                    WHERE {Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_CT}'
                    OR {Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_TL}') CDC 
                    ON CDC.{Customer_Deal__c:Cust_Id__c} = '${store.CustUniqId}'        
                    LEFT JOIN {Deal__c} DEAL ON CDC.{Customer_Deal__c:Target_Id__c} = DEAL.{Deal__c:Target_Id__c}
                    LEFT JOIN (SELECT * FROM {Deal_Product_List__c} 
                    WHERE {Deal_Product_List__c:Inven_Id__c} IN (${getIdClause(activeProdArr)})
                    AND {Deal_Product_List__c:Is_Active__c} IS TRUE
                    AND {Deal_Product_List__c:Bu_Id__c} = '${buId}') DPL 
                    ON NAP.{Natl_Account_Pricing__c:Inven_Id__c} = DPL.{Deal_Product_List__c:Inven_Id__c}
                    AND DEAL.{Deal__c:Deal_Id__c} = DPL.{Deal_Product_List__c:Deal_Id__c}
                    WHERE 
                    DPL.{Deal_Product_List__c:Deal_Id__c} IS NOT NULL
                    AND DEAL.{Deal__c:Bu_Id__c} = '${buId}'
                    AND DEAL.{Deal__c:Effective_Date__c} <= '${todayAfter43}'
                    AND DEAL.{Deal__c:Expiration_Date__c} > '${today}'
                    AND DEAL.{Deal__c:Effective_Date__c} < DEAL.{Deal__c:Expiration_Date__c}
                    AND DEAL.{Deal__c:Is_Active__c} IS TRUE
                    AND DEAL.{Deal__c:National_Account_Type_Id__c} != '${NationalAccountPriceConstant.ACC_TYPE_ID_000}'
                    AND DEAL.{Deal__c:Deal_Type_Id__c} = '${PriceDealConstant.DEAL_TYPE_ID_5}'
                    AND DEAL.{Deal__c:Send_Flag__c} IS TRUE
                    AND DEAL.{Deal__c:Forced_Deal_Flag__c} IS TRUE
                    AND CDC.{Customer_Deal__c:IsActive__c} IS TRUE
                    AND NAP.{Natl_Account_Pricing__c:Bu_Id__c} = '${buId}'
                    AND NAP.{Natl_Account_Pricing__c:Price_Start_Date__c} <= '${todayAfter43}'
                    AND NAP.{Natl_Account_Pricing__c:Price_End_Date__c} > '${today}'
                    AND NAP.{Natl_Account_Pricing__c:Is_Active__c} IS TRUE
                    AND NAP.{Natl_Account_Pricing__c:Volume_Hurdle__c} = '${
                        NationalAccountPriceConstant.ACC_VOLUME_HURDLE_O
                    }'
                    `,
                    [],
                    {},
                    false,
                    false
                )
                const tempPriceList = prodFlexFundPrice.map((prod) => {
                    const relativeDealStartVal = compareDateToToday(prod.dealEffectiveDate)
                    const relativeDealEndVal = compareDateToToday(prod.dealExpirationDate)
                    const relativeNAPStartVal = compareDateToToday(prod.napStartDate)
                    const relativeNAPEndVal = compareDateToToday(prod.napEndDate)
                    const relativeStartVal = Math.max(relativeDealStartVal, relativeNAPStartVal)
                    const relativeEndVal = Math.min(relativeDealEndVal, relativeNAPEndVal)
                    return {
                        Force_Deal_Flag__c: true,
                        Price: (Number(prod.Price__c) - Number(prod.Dollar_Off__c)).toFixed(2),
                        Deal_Id__c: prod.DealId,
                        Deal_Name__c: prod.DealName,
                        Cust_Id__c: store.CustUniqId,
                        Inven_Id__c: prod.Inven_Id__c,
                        BuId: buId,
                        Effective_Date: prod.dealEffectiveDate,
                        Expiration_Date: prod.dealExpirationDate,
                        Priority: pricePriorityMap.get(PricePriority.NATIONAL_ACCOUNT_DEAL),
                        Relative_Start_Value: relativeStartVal > 0 ? relativeStartVal : 0,
                        Relative_End_Value:
                            relativeEndVal > Number(greaterThan6weeks) ? Number(greaterThan6weeks) : relativeEndVal,
                        Minimum_Quantity: 0,
                        Deal_Category_Code__c: prod.Deal_Category_Code__c
                    }
                })
                await BaseInstance.sfSoupEngine.upsert('Tmp_fd_prc', tempPriceList)
            }
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getProdFlexFundPrice',
                `getProdFlexFundPrice failed` + ErrorUtils.error2String(err)
            )
            throw new Error(ErrorUtils.error2String(err))
        }
    }
}

export default FlexFundPrice

/*
 * @Author: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Date: 2024-01-23 14:07:27
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @LastEditTime: 2024-01-29 16:25:57
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

class BUPrice {
    private static async getCustomerTargetId(buId: string, validBsId: string) {
        const customerDLs = await BaseInstance.sfSoupEngine.retrieve(
            'Customer_Deal__c',
            ['Query_Target_Id__c'],
            `
            SELECT {Customer_Deal__c:Query_Target_Id__c}
            FROM {Customer_Deal__c} 
            WHERE {Customer_Deal__c:Target_Name__c} = '${PriceCustomerDealConstant.CD_TARGET_NAME_BU}'
            AND {Customer_Deal__c:Target_Value_Number__c} = '${buId.replaceAll('_RE', '')}'
            AND {Customer_Deal__c:Delete_Flag__c} IS FALSE
            AND {Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_QTV}'
            AND {Customer_Deal__c:Query_Target_Id__c} IN (
                SELECT {Customer_Deal__c:Query_Target_Id__c} 
                FROM {Customer_Deal__c}
                WHERE {Customer_Deal__c:Target_Name__c} = '${PriceCustomerDealConstant.CD_TARGET_NAME_BS}'
                AND {Customer_Deal__c:Target_Value_Number__c} = '${validBsId}'
                AND {Customer_Deal__c:Delete_Flag__c} IS FALSE
                AND {Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_QTV}'
            )
            `,
            [],
            {},
            false,
            false
        )
        return customerDLs
    }

    private static async getQueryTargetId(combineQueryTargetIds: Array<string>, queryTargetIds: string) {
        const customerDLs2 = await BaseInstance.sfSoupEngine.retrieve(
            'Customer_Deal__c',
            ['Target_Id__c', 'Target_Table_Id__c'],
            `
            SELECT {Customer_Deal__c:Target_Id__c}, {Customer_Deal__c:Target_Table_Id__c}
                FROM {Customer_Deal__c}
                WHERE {Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_TL}'
                AND {Customer_Deal__c:Target_Field__c} = '${PriceCustomerDealConstant.CD_TARGET_FIELD_QT}'
                AND {Customer_Deal__c:Target_Id__c} IN (${getIdClause(combineQueryTargetIds)})
                AND {Customer_Deal__c:Target_Table_Id__c} IN (${queryTargetIds})
                AND {Customer_Deal__c:IsActive__c} IS TRUE
            `,
            [],
            {},
            false,
            false
        )
        return customerDLs2
    }

    static async getBuPrice(
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
            const bsIds = results?.filter((item) => !_.isEmpty(item.bsId))
            const accountBsId = (bsIds && bsIds.length > 0 && bsIds[0].bsId) || ''
            const validBsId = Number.isNaN(parseInt(accountBsId as string))
                ? ''
                : parseInt(accountBsId as string).toString()
            // 2.get target ids from customer Customer_Deal__c table
            const customerDLs = await this.getCustomerTargetId(buId, validBsId)
            const queryTargetIds = customerDLs
                .map((c) => {
                    return c.Query_Target_Id__c
                })
                .join(',')
            const combineQueryTargetIds = customerDLs.map((c) => {
                return 'QueryTarget' + parseInt(c.Query_Target_Id__c + '')
            })

            const customerDLs2 = await this.getQueryTargetId(combineQueryTargetIds, queryTargetIds)

            const finalTargetIds = _.uniq(customerDLs2.map((c) => c.Target_Id__c as string))

            // 3.get related price data from Deal__c and Deal_Product_List__c table
            const prodBUPrice: Array<any> = await BaseInstance.sfSoupEngine.retrieve(
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
                WHERE {Deal__c:Target_Id__c} IN (${getIdClause(finalTargetIds)})
                AND {Deal__c:Effective_Date__c} <= '${todayAfter43}'
                AND {Deal__c:Expiration_Date__c} > '${today}'
                AND {Deal__c:Effective_Date__c} <= {Deal__c:Expiration_Date__c}
                AND {Deal__c:Send_Flag__c} IS TRUE
                AND {Deal__c:Is_Active__c} IS TRUE
                AND {Deal__c:Pricing_Level_Id__c} = '${buId.replaceAll('_RE', '')}'
                AND {Deal__c:Pricing_Level_Type_Code__c} = '${PriceDealConstant.DEAL_TYPE_CODE_BU}'
                AND {Deal__c:Forced_Deal_Flag__c} IS FALSE
                AND {Deal_Product_List__c:Is_Active__c} IS TRUE
                AND {Deal_Product_List__c:Inven_Id__c} IN (${getIdClause(activeProdArr)})
                `,
                [],
                {},
                false,
                false
            )
            const tempPriceList = prodBUPrice.map((prod) => {
                const relativeStartVal = compareDateToToday(prod.effectiveDate)
                const relativeEndVal = compareDateToToday(prod.expirationDate)
                return {
                    Cust_Id__c: store.CustUniqId,
                    Inven_Id__c: prod.inventoryId,
                    Deal_Id__c: prod.dealId,
                    Force_Deal_Flag__c: false,
                    Price: prod.price,
                    Deal_Name__c: prod.dealName,
                    Priority: pricePriorityMap.get(PricePriority.BU_QUERY_TARGET),
                    Minimum_Quantity: prod.minimumQuantity,
                    Effective_Date: prod.effectiveDate,
                    Expiration_Date: prod.expirationDate,
                    Relative_Start_Value: relativeStartVal > 0 ? relativeStartVal : 0,
                    Relative_End_Value:
                        relativeEndVal > Number(greaterThan6weeks) ? Number(greaterThan6weeks) : relativeEndVal,
                    BuId: buId,
                    Type_Code__c: PriceTypeCode.TRI,
                    Deal_Category_Code__c: prod.Deal_Category_Code__c
                }
            })
            await BaseInstance.sfSoupEngine.upsert('Tmp_fd_prc', tempPriceList)
        } catch (err) {
            storeClassLog(Log.MOBILE_ERROR, 'Orderade: getBuPrice', `getBuPrice failed` + ErrorUtils.error2String(err))
            throw new Error(ErrorUtils.error2String(err))
        }
    }
}

export default BUPrice

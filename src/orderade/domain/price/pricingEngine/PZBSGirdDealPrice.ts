/*
 * @Author: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Date: 2024-01-23 10:47:30
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @LastEditTime: 2024-01-29 16:26:44
 */
import _ from 'lodash'
import BaseInstance from '../../../../common/BaseInstance'
import {
    NationalAccountPriceConstant,
    PriceCustomerDealConstant,
    PriceDealConstant,
    PriceTypeCode
} from '../../../enum/Common'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { Log } from '../../../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { getIdClause } from '../../../../common/utils/CommonUtils'
import { MyDayVisitModel } from '../../../interface/MyDayVisit'
import AccountData from '../../account/AccountData'
import { compareDateToToday } from '../../../utils/CommonUtil'

const QUERY_TARGET_PREFIX = 'QueryTarget'
class PZBSGirdDealPrice {
    private static async getCustDealId(pzId: string, bsId: string): Promise<Array<string>> {
        try {
            let outputCustomerDealData: Array<string> = []
            const isBSIdValid = !Number.isNaN(parseInt(bsId))
            if (isBSIdValid) {
                const rawCustomerDealData = await BaseInstance.sfSoupEngine.retrieve(
                    'Customer_Deal__c',
                    ['Query_Target_Id__c'],
                    `
                    SELECT
                        PZCD.{Customer_Deal__c:Query_Target_Id__c}
                    FROM
                        {Customer_Deal__c} PZCD
                    LEFT JOIN {Customer_Deal__c} BSCD
                        ON PZCD.{Customer_Deal__c:Query_Target_Id__c} = BSCD.{Customer_Deal__c:Query_Target_Id__c} 
                    WHERE
                        PZCD.{Customer_Deal__c:Target_Name__c} = '${PriceCustomerDealConstant.CD_TARGET_NAME_PZ}'
                        AND PZCD.{Customer_Deal__c:Target_Value_Number__c} = '${pzId}'
                        AND PZCD.{Customer_Deal__c:Delete_Flag__c} = false
                        AND PZCD.{Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_QTV}'
                        AND BSCD.{Customer_Deal__c:Target_Value_Number__c} = '${parseInt(bsId).toString()}'
                        AND BSCD.{Customer_Deal__c:Target_Name__c} = '${PriceCustomerDealConstant.CD_TARGET_NAME_BS}'
                        AND BSCD.{Customer_Deal__c:Delete_Flag__c} = false
                        AND BSCD.{Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_QTV}'
                    `
                )
                if (!_.isEmpty(rawCustomerDealData)) {
                    outputCustomerDealData = rawCustomerDealData.map((customerDeal) => {
                        const targetId = _.isEmpty(customerDeal?.Query_Target_Id__c)
                            ? NationalAccountPriceConstant.ACC_VOLUME_HURDLE_O
                            : `${customerDeal?.Query_Target_Id__c}`
                        return `${QUERY_TARGET_PREFIX + parseInt(targetId).toString()}`
                    })
                }
            }
            return outputCustomerDealData
        } catch (e) {
            await storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: GridDealQueries.ts',
                `getCustDealId: ${ErrorUtils.error2String(e)}`
            )
            return []
        }
    }

    static async getPriceZoneBusinessSegmentGirdDeals(
        activeProdArr: Array<string>,
        store: MyDayVisitModel,
        today: string,
        greaterThan6weeks: string,
        buId: string,
        pricePriority: number
    ) {
        try {
            const pzIdArr = await AccountData.getAccountBsAndPz(store.AccountId)
            const validData = pzIdArr?.filter((IdRecord) => !_.isEmpty(IdRecord.pzId))
            const pzId = (validData && validData.length > 0 && validData[0].pzId) || ''
            const bsId = (validData && validData.length > 0 && validData[0].bsId) || ''
            const queryTargetIds =
                _.isEmpty(pzId) && _.isEmpty(bsId) ? [] : await this.getCustDealId(`${pzId}`, `${bsId}`)
            let PriceZoneBusinessSegmentGirdDeals: Array<any> = []
            if (!_.isEmpty(queryTargetIds)) {
                PriceZoneBusinessSegmentGirdDeals = await BaseInstance.sfSoupEngine.retrieve(
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
                        'CD_IsActive__c',
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
                        {Customer_Deal__c:IsActive__c},
                        {Deal__c:Volume_Quantity__c}
                    FROM {Deal__c}
                    LEFT JOIN {Deal_Product_List__c} 
                        ON {Deal_Product_List__c:Deal_Id__c} = {Deal__c:Deal_Id__c}
                    LEFT JOIN {Customer_Deal__c}
                        ON {Customer_Deal__c:Target_Id__c} = {Deal__c:Target_Id__c}
                    WHERE 
                        {Deal_Product_List__c:Inven_Id__c} IN (${getIdClause(activeProdArr)})
                        AND {Customer_Deal__c:IsActive__c} = TRUE
                        AND {Customer_Deal__c:Type__c} = '${PriceCustomerDealConstant.CD_TYPE_TL}'
                        AND {Customer_Deal__c:Target_Field__c} = '${PriceCustomerDealConstant.CD_TARGET_FIELD_QT}'
                        AND {Customer_Deal__c:Target_Id__c} IN (${getIdClause(queryTargetIds)})
                        AND {Deal__c:Effective_Date__c} <= '${greaterThan6weeks}'
                        AND {Deal__c:Expiration_Date__c} > '${today}'
                        AND {Deal__c:Bu_Id__c} = '${buId}'
                        AND {Deal__c:Forced_Deal_Flag__c} = false
                        AND {Deal__c:Is_Active__c} = true
                        AND {Deal__c:Send_Flag__c} = true
                        AND {Deal__c:Pricing_Level_Id__c} = '${pzId}'
                        AND {Deal__c:Pricing_Level_Type_Code__c} = '${PriceDealConstant.DEAL_TYPE_CODE_PZ}'
                 `
                )
            }
            if (!_.isEmpty(PriceZoneBusinessSegmentGirdDeals)) {
                const outputPriceZoneBusinessSegmentGirdDeals: Array<any> = []
                PriceZoneBusinessSegmentGirdDeals.forEach((PriceZoneBusinessSegmentGirdDeal) => {
                    const relativeStartVal = compareDateToToday(
                        `${PriceZoneBusinessSegmentGirdDeal?.Effective_Date__c || new Date().toString()}`
                    )
                    const relativeEndVal = compareDateToToday(
                        `${PriceZoneBusinessSegmentGirdDeal?.Expiration_Date__c || new Date().toString()}`
                    )
                    outputPriceZoneBusinessSegmentGirdDeals.push({
                        Deal_Id__c: PriceZoneBusinessSegmentGirdDeal?.Deal_Id__c,
                        Cust_Id__c: store?.CustUniqId,
                        Inven_Id__c: PriceZoneBusinessSegmentGirdDeal?.Inven_Id__c,
                        Force_Deal_Flag__c: false,
                        Price: PriceZoneBusinessSegmentGirdDeal?.Net_Price__c,
                        Type_Code__c: PriceTypeCode.TRI,
                        Deal_Name__c: PriceZoneBusinessSegmentGirdDeal?.Deal_Name__c,
                        Priority: pricePriority,
                        Minimum_Quantity: PriceZoneBusinessSegmentGirdDeal.minimumQuantity,
                        Effective_Date: PriceZoneBusinessSegmentGirdDeal?.Effective_Date__c,
                        Expiration_Date: PriceZoneBusinessSegmentGirdDeal?.Expiration_Date__c,
                        Relative_Start_Value: relativeStartVal > 0 ? relativeStartVal : 0,
                        Relative_End_Value:
                            relativeEndVal > Number(greaterThan6weeks) ? Number(greaterThan6weeks) : relativeEndVal,
                        BuId: buId,
                        Deal_Category_Code__c: PriceZoneBusinessSegmentGirdDeal.Deal_Category_Code__c
                    })
                })
                return await BaseInstance.sfSoupEngine.upsert('Tmp_fd_prc', outputPriceZoneBusinessSegmentGirdDeals)
            }
            return []
        } catch (e) {
            await storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: GridDealQueries.ts',
                `getPriceZoneBusinessSegmentGirdDeals: ${ErrorUtils.error2String(e)}`
            )
            throw new Error(ErrorUtils.error2String(e))
        }
    }
}

export default PZBSGirdDealPrice

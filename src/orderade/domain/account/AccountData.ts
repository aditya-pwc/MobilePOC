/*
 * @Author: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Date: 2024-01-17 19:07:14
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @LastEditTime: 2024-01-29 16:34:32
 */
import _ from 'lodash'
import BaseInstance from '../../../common/BaseInstance'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { CommonParam } from '../../../common/CommonParam'
import { getIdClause } from '../../../common/utils/CommonUtils'
import { MyDayVisitModel } from '../../interface/MyDayVisit'
import { DropDownType } from '../../enum/Common'
import { useDropDown } from '../../../common/contexts/DropdownContext'

class AccountData {
    static async isNationalAccount(store: MyDayVisitModel) {
        const nationalAccount = await BaseInstance.sfSoupEngine.retrieve(
            'RetailStore',
            ['Id'],
            `SELECT
            {RetailStore:Account.Is_Natl_Acct__c}
        FROM {RetailStore}
        WHERE {RetailStore:AccountId} = '${store.AccountId}'
        AND {RetailStore:Account.Is_Natl_Acct__c} = TRUE
        `,
            [],
            {},
            false,
            false
        )
        return !_.isEmpty(nationalAccount)
    }

    static async getPzId(store: any) {
        try {
            const pzIdArr = await BaseInstance.sfSoupEngine.retrieve(
                'RetailStore',
                ['aPzId', 'pPzId'],
                `SELECT
                {RetailStore:Account.Pz_Id__c},
                {Price_Zone__c:Pz_Id__c}
            FROM {RetailStore}
            LEFT JOIN {Price_Zone__c} ON {Price_Zone__c:PBG_Pz_Id__c} = {RetailStore:Account.Pz_Id__c}
            WHERE {RetailStore:AccountId} = '${store.AccountId}'
            `,
                [],
                {},
                false,
                false
            )
            return pzIdArr[0]?.pPzId || ''
        } catch (err) {
            storeClassLog(Log.MOBILE_ERROR, 'Orderade: getPzId', `getPzId failed` + ErrorUtils.error2String(err))
        }
    }

    static async getRouteBuId() {
        const buId = await BaseInstance.sfSoupEngine
            .dynamicRetrieve('Route_Sales_Geo__c')
            .select(['Region_Code__c'])
            .where([
                {
                    leftField: 'GTMU_RTE_ID__c',
                    operator: '=',
                    rightField: `'${CommonParam.userRouteGTMUId}'`
                }
            ])
            .getData(false)
        return (buId[0].Region_Code__c as string) || ''
    }

    static async getAccountBsAndPz(accountIds: string | string[]) {
        try {
            if (typeof accountIds === 'string') {
                accountIds = [accountIds]
            }
            const results = await BaseInstance.sfSoupEngine.retrieve(
                'RetailStore',
                ['bsId', 'pzId'],
                `
                    SELECT {RetailStore:Account.BUSN_SGMNTTN_LVL_1_CDV__c}, {Price_Zone__c:Pz_Id__c}
                    FROM {RetailStore}
                    LEFT JOIN {Price_Zone__c} 
                        ON {Price_Zone__c:PBG_Pz_Id__c} = {RetailStore:Account.Pz_Id__c}
                    WHERE {RetailStore:AccountId} IN (${getIdClause(accountIds)})
                `,
                [],
                {},
                false,
                false
            )
            return results
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getAccountBsAndPz',
                `getAccountBsAndPz failed` + ErrorUtils.error2String(err)
            )
        }
    }

    static async getRetailStoreBySearch(searchText: string) {
        try {
            const results = await BaseInstance.sfSoupEngine.retrieve(
                'RetailStore',
                [
                    'Id',
                    'AccountId',
                    'Name',
                    'Account.CUST_UNIQ_ID_VAL__c',
                    'State',
                    'StateCode',
                    'PostalCode',
                    'Street',
                    'City',
                    'IsOTS',
                    'CDAMedal',
                    'RouteId',
                    'GTMUId'
                ],
                `
                    SELECT
                    {RetailStore:Id},
                    {RetailStore:AccountId},
                    {RetailStore:Name},
                    {RetailStore:Account.CUST_UNIQ_ID_VAL__c},
                    {RetailStore:State},
                    {RetailStore:StateCode},
                    {RetailStore:PostalCode},
                    {RetailStore:Street},
                    {RetailStore:City},
                    {RetailStore:Account.IsOTSCustomer__c},
                    {RetailStore:Account.CDA_Medal__c},
                    {Customer_to_Route__c:Route__c},
                    {Customer_to_Route__c:Route__r.GTMU_RTE_ID__c}
                    FROM {RetailStore}
                    LEFT JOIN {Customer_to_Route__c} ON
                        {RetailStore:AccountId} = {Customer_to_Route__c:Customer__c}
                    WHERE ({RetailStore:Name} LIKE '%${searchText}%'
                        OR  {RetailStore:State} LIKE '%${searchText}%'
                        OR  {RetailStore:StateCode} LIKE '%${searchText}%'
                        OR  {RetailStore:PostalCode} LIKE '%${searchText}%'
                        OR  {RetailStore:Street} LIKE '%${searchText}%'
                        OR  {RetailStore:City} LIKE '%${searchText}%'
                        OR  {RetailStore:Account.CUST_UNIQ_ID_VAL__c} LIKE '%${searchText}%')
                        AND {RetailStore:Account.LOC_PROD_ID__c} = '${CommonParam.userLocationId}'
                    ORDER BY (
                        CASE
                            WHEN {RetailStore:Name} = '${searchText}' THEN 1
                            WHEN {RetailStore:Name} LIKE '%${searchText}%' THEN 2
                            ELSE 3
                        END
                    ), {RetailStore:Name} ASC
                    `,
                [],
                {},
                false,
                false
            )
            return results
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: Add New Visit Screen',
                `Fetch retail store list failed: ${ErrorUtils.error2String(err)}`
            )
            const { dropDownRef } = useDropDown()
            dropDownRef.current.alertWithType(DropDownType.ERROR, 'Failed to get customer list data : ', err)
        }
    }

    public static async retrieveBCDTaxRate(accountId: string) {
        try {
            return await BaseInstance.sfSoupEngine
                .dynamicRetrieve('RetailStore')
                .select(['Id', 'Account.BCD_Tax_Rate__c', 'Account.CUST_UNIQ_ID_VAL__c', 'Account.tax_exempt_flg__c'])
                .where([
                    {
                        leftField: 'AccountId',
                        operator: '=',
                        rightField: `'${accountId}'`
                    },
                    {
                        type: 'AND',
                        leftField: 'Account.tax_exempt_flg__c',
                        operator: '=',
                        rightField: '0'
                    }
                ])
                .getData(false)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: retrieveBCDTaxRate',
                `fetch BCD tax rate failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    static getRetailStoreCurRouteWhere() {
        return `WHERE {RetailStore:AccountId} IN (SELECT {Customer_to_Route__c:Customer__c} 
            FROM {Customer_to_Route__c} WHERE 
            {Customer_to_Route__c:Route__c} = '${CommonParam.userRouteId}'  
            AND {Customer_to_Route__c:ACTV_FLG__c} = true 
            AND {Customer_to_Route__c:Merch_Flag__c} = false 
            AND {Customer_to_Route__c:RecordType.Name} = 'CTR')`
    }

    public static async getCustUniqIdsOnCurRoute() {
        return BaseInstance.sfSoupEngine.retrieve('RetailStore', ['Account.CUST_UNIQ_ID_VAL__c'], '', [
            AccountData.getRetailStoreCurRouteWhere()
        ])
    }

    static async getRetailStoreByRoute() {
        try {
            return await BaseInstance.sfSoupEngine.retrieve(
                'RetailStore',
                ['Id'],
                '',
                [AccountData.getRetailStoreCurRouteWhere()],
                {},
                false,
                false
            )
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getRetailStoreByRoute',
                `getRetailStoreByRoute failed` + ErrorUtils.error2String(err)
            )
            return []
        }
    }
}

export default AccountData

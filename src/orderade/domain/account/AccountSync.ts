import BaseInstance from '../../../common/BaseInstance'
import { CommonParam } from '../../../common/CommonParam'
import { Log } from '../../../common/enums/Log'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { CustomerToRouteConstant } from '../../enum/Common'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { batchSynDown } from '../../utils/CommonUtil'
import { getIdClause } from '../../../common/utils/CommonUtils'

export default class AccountSync {
    static async getCurRouteAccountData(accountFields: string[]) {
        return BaseInstance.sfSyncEngine.syncDown({
            name: 'Account',
            whereClause: `Id IN 
                (SELECT Customer__c FROM Customer_to_Route__c 
                    WHERE Route__c = '${CommonParam.userRouteId}' 
                    AND ACTV_FLG__c = true 
                    AND Merch_Flag__c = false 
                    AND RecordType.Name = 'CTR'
                    AND (Route__r.RTE_END_DT__c = null OR Route__r.RTE_END_DT__c >= TODAY)
                    AND (Route__r.RTE_STRT_DT__c = null OR Route__r.RTE_STRT_DT__c <= TODAY)
                    AND (Route__r.RTE_TYP_CDV__c IN ('001', '003'))) 
                    AND Account.IS_ACTIVE__c = true 
                    `,
            updateLocalSoup: true,
            fields: accountFields,
            allOrNone: true
        })
    }

    static async getAccountsForPullingRelatedDataWhenCSVBatchFail(accountFields: string[]) {
        try {
            const routeAccounts = await BaseInstance.sfSyncEngine.syncDown({
                name: 'Account',
                whereClause: `Id IN 
                    (SELECT Customer__c FROM Customer_to_Route__c 
                        WHERE Route__c = '${CommonParam.userRouteId}' 
                        AND SLS_MTHD_CDE__c = '${CustomerToRouteConstant.CTR_SMC_003}'
                        AND RecordType.Name = '${CustomerToRouteConstant.CTR_RECORD_TYPE_NAME_CTR}'
                        AND ACTV_FLG__c = TRUE)  
                        AND IS_ACTIVE__c = TRUE
                        `,
                updateLocalSoup: false,
                fields: accountFields,
                allOrNone: true
            })
            return routeAccounts.length > 0 ? routeAccounts : []
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'getAccountsForPullingRelatedDataWhenCSVBatchFail',
                'getAccountsForPullingRelatedDataWhenCSVBatchFail Fail: ' + ErrorUtils.error2String(e)
            )
            return []
        }
    }

    static async syncDownAccountAndCTR(
        _accountIds: string[],
        accountFields: string[],
        customerToRouteFields: string[],
        isInitial?: boolean
    ) {
        const Accounts = await batchSynDown(_accountIds, {
            name: 'Account',
            whereClause: `Id IN {BatchIds}`,
            updateLocalSoup: true,
            fields: accountFields,
            allOrNone: true
        })
        if (isInitial) {
            await BaseInstance.sfSyncEngine.syncDown({
                name: 'Customer_to_Route__c',
                whereClause: `Customer__c IN (${getIdClause(_accountIds)})`,
                updateLocalSoup: true,
                fields: customerToRouteFields,
                allOrNone: true
            })
        }
        return Accounts
    }

    static async deltaSyncDownRetailStoreAndCTR(
        lastModifiedDate: string,
        retailStoreSyncFields: string[],
        ctrSyncFields: string[]
    ) {
        return Promise.all([
            BaseInstance.sfSyncEngine.syncDown({
                name: 'RetailStore',
                whereClause: `AccountId IN 
                (SELECT Customer__c FROM Customer_to_Route__c WHERE Route__r.LOC_ID__c='${CommonParam.userLocationId}' 
                AND ACTV_FLG__c=true AND Merch_Flag__c=false 
                AND RecordType.Name = 'CTR') 
                AND Account.IS_ACTIVE__c = true
                AND (LastModifiedDate > ${lastModifiedDate}
                OR Account.LastModifiedDate > ${lastModifiedDate})`,
                updateLocalSoup: true,
                fields: retailStoreSyncFields,
                allOrNone: true
            }),
            BaseInstance.sfSyncEngine.syncDown({
                name: 'Customer_to_Route__c',
                whereClause: `Route__c='${CommonParam.userRouteId}'
                AND LastModifiedDate > ${lastModifiedDate}`,
                updateLocalSoup: true,
                fields: ctrSyncFields,
                allOrNone: true
            })
        ])
    }
}

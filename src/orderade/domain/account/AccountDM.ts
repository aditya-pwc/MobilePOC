import CommonData from '../common/CommonData'
import AccountData from './AccountData'
import AccountSync from './AccountSync'
import _ from 'lodash'
export default class AccountDM {
    static getRetailStoreBySearch = AccountData.getRetailStoreBySearch
    static retrieveBCDTaxRate = AccountData.retrieveBCDTaxRate
    static getRouteBuId = AccountData.getRouteBuId
    static getAccountBsAndPz = AccountData.getAccountBsAndPz

    static getRetailStoreByRoute = AccountData.getRetailStoreByRoute
    static getCustUniqIdsOnCurRoute = AccountData.getCustUniqIdsOnCurRoute

    public static getCurRouteAccountData() {
        const accountFields = CommonData.getAllFieldsByObjName('Account', 'Remote')
        return AccountSync.getCurRouteAccountData(accountFields)
    }

    public static async getAccountsForPullingRelatedDataWhenCSVBatchFail() {
        const accountFields = CommonData.getAllFieldsByObjName('Account', 'Remote')
        return await AccountSync.getAccountsForPullingRelatedDataWhenCSVBatchFail(accountFields)
    }

    public static async getUniqIdsFromRoutes(): Promise<Array<string>> {
        const accountFields = CommonData.getAllFieldsByObjName('Account', 'Remote')
        const routeAccounts = await AccountSync.getCurRouteAccountData(accountFields)
        return routeAccounts.length > 0 ? _.uniq(_.map(routeAccounts, 'Id')) : []
    }

    public static async syncDownAccountAndCTR(_accountIds: string[], isInitial?: boolean) {
        const accountFields = CommonData.getAllFieldsByObjName('Account', 'Remote')
        let customerToRouteFields: string[] = []
        if (isInitial) {
            customerToRouteFields = CommonData.getAllFieldsByObjName('Customer_to_Route__c', 'Remote')
        }
        return await AccountSync.syncDownAccountAndCTR(_accountIds, accountFields, customerToRouteFields, isInitial)
    }

    public static async deltaSyncDownRetailStoreAndCTR(lastModifiedDate: string) {
        const retailStoreSyncFields = CommonData.getAllFieldsByObjName('RetailStore', 'Remote')
        const ctrSyncFields = CommonData.getAllFieldsByObjName('Customer_to_Route__c', 'Remote')
        return await AccountSync.deltaSyncDownRetailStoreAndCTR(lastModifiedDate, retailStoreSyncFields, ctrSyncFields)
    }
}

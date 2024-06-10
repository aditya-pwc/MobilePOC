import BaseInstance from '../../../common/BaseInstance'
import _ from 'lodash'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import { VisitList } from '../../interface/VisitListModel'
import { CommonParam } from '../../../common/CommonParam'
import { getIdClause } from '../../../common/utils/CommonUtils'
import { batchSynDown } from '../../utils/CommonUtil'

class VisitSync {
    static async getRouteInfoByAccountList(accountIds: string, ctrFields: string[]) {
        return await BaseInstance.sfSyncEngine.syncDown({
            name: 'Customer_to_Route__c',
            whereClause: `Customer__c IN (${accountIds})`,
            updateLocalSoup: true,
            fields: ctrFields,
            allOrNone: true
        })
    }

    public static async syncUpVLLocalData(vlObjsToUpdate: any[], vlObjsToInsert: any[]) {
        try {
            if (!_.isEmpty(vlObjsToUpdate)) {
                await BaseInstance.sfSyncEngine.syncUp({
                    name: 'Visit_List__c',
                    records: vlObjsToUpdate,
                    type: 'PATCH',
                    queryLatestData: true
                })
            }
            if (!_.isEmpty(vlObjsToInsert)) {
                await BaseInstance.sfSyncEngine.syncUp({
                    name: 'Visit_List__c',
                    records: vlObjsToInsert,
                    type: 'POST',
                    queryLatestData: true
                })
            }
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: syncUpVLLocalData',
                `orderade sync up visit list failed: ${JSON.stringify(err)}`
            )
        }
    }

    public static async syncUpVisitLocalData(visitData: any[]) {
        const insertVisits = visitData.filter((v) => _.isEmpty(v.Id))
        const updateVisits = visitData.filter((v) => !_.isEmpty(v.Id))
        try {
            if (!_.isEmpty(insertVisits)) {
                await BaseInstance.sfSyncEngine.syncUp({
                    name: 'Visit',
                    records: insertVisits,
                    type: 'POST',
                    queryLatestData: true
                })
            }
            if (!_.isEmpty(updateVisits)) {
                await BaseInstance.sfSyncEngine.syncUp({
                    name: 'Visit',
                    records: updateVisits,
                    type: 'PATCH',
                    queryLatestData: true
                })
            }
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: syncUpVisitLocalData',
                `orderade sync up visit failed: ${JSON.stringify(err)}`
            )
        }
    }

    static syncDownCurUserUVLs(visitListSyncFields: string[]) {
        return BaseInstance.sfSyncEngine.syncDown({
            name: 'Visit_List__c',
            whereClause: `Status__c != 'Pre-Processed'
                AND (Visit_List_Subtype__c = 'User Visit List' AND User__c = '${CommonParam.userId}')
            AND (
                Visit_Date__c >= LAST_N_DAYS:14 
                OR Visit_Date__c <= NEXT_N_DAYS:7
            )
            AND IsRemoved__c = false
            AND RecordType.DeveloperName = 'Sales_Daily_Visit_List'`,
            updateLocalSoup: true,
            fields: visitListSyncFields,
            allOrNone: true
        }) as unknown as Promise<Array<VisitList>>
    }

    static syncDownUVLVisits(uvls: VisitList[], visitSyncFields: string[]) {
        if (!_.isEmpty(uvls) && !_.isEmpty(CommonParam.userLocationId)) {
            return BaseInstance.sfSyncEngine.syncDown({
                name: 'Visit',
                whereClause: `User_Visit_List__c IN (${getIdClause(uvls.map((el) => el.Id))}) 
                AND Planned_Date__c>=LAST_N_DAYS:14 
                AND Planned_Date__c <= NEXT_N_DAYS:7 
                AND Status__c NOT IN ('Pre-Processed', 'Removed', 'Failed') 
                AND RecordType.DeveloperName = 'Sales' 
                AND Retail_Store__r.Account.LOC_PROD_ID__c = '${CommonParam.userLocationId}'`,
                updateLocalSoup: true,
                fields: visitSyncFields,
                allOrNone: true
            })
        }
        return []
    }

    static async deltaSyncDownVLs(vlDateQuery: string, lastModifiedDate: string, visitListSyncFields: string[]) {
        try {
            await BaseInstance.sfSyncEngine.syncDown({
                name: 'Visit_List__c',
                whereClause: `Status__c != 'Pre-Processed'
                        AND ((Visit_List_Subtype__c = 'Route Visit List' AND Route_Sales_Geo__c = '${CommonParam.userRouteId}')
                            OR (Visit_List_Subtype__c = 'User Visit List' AND User__c = '${CommonParam.userId}'))
                    AND ${vlDateQuery}
                    AND IsRemoved__c = false
                    AND RecordType.DeveloperName = 'Sales_Daily_Visit_List'
                    AND LastModifiedDate > ${lastModifiedDate}`,
                updateLocalSoup: true,
                fields: visitListSyncFields,
                allOrNone: true
            })
        } catch (error) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: deltaSyncDownVLs',
                `orderade deltaSyncDownVLs failed: ${JSON.stringify(error)}`
            )
        }
    }

    static async deltaSyncDownVisits(visitListIds: string, lastModifiedDate: string, visitSyncFields: string[]) {
        try {
            await BaseInstance.sfSyncEngine.syncDown({
                name: 'Visit',
                whereClause: `(Visit_List__c IN (${visitListIds}) OR  User_Visit_List__c IN (${visitListIds})) 
                    AND Planned_Date__c >= LAST_N_DAYS:14 
                    AND Planned_Date__c <= NEXT_N_DAYS:7 
                    AND Status__c NOT IN ('Pre-Processed', 'Removed', 'Failed') 
                    AND RecordType.DeveloperName = 'Sales'
                    AND Retail_Store__r.Account.LOC_PROD_ID__c = '${CommonParam.userLocationId}'
                    AND LastModifiedDate > ${lastModifiedDate}`,
                updateLocalSoup: true,
                fields: visitSyncFields,
                allOrNone: true
            })
        } catch (error) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: deltaSyncDownVisits',
                `orderade deltaSyncDownVisits failed: ${JSON.stringify(error)}`
            )
        }
    }

    public static async syncUpCurrentVisitData(currentVisit: any[]) {
        try {
            await BaseInstance.sfSyncEngine.syncUp({
                name: 'Visit',
                records: currentVisit,
                type: 'PATCH',
                queryLatestData: true
            })
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: syncUpCurrentVisitData',
                `orderade sync up visit failed: ${JSON.stringify(err)}`
            )
        }
    }

    static getVisitDataByRoute(store: any[], visitSyncFields: string[]) {
        return batchSynDown(store, {
            name: 'Visit',
            whereClause: `Planned_Date__c>=LAST_N_DAYS:14
            AND Planned_Date__c <= NEXT_N_DAYS:7
            AND RecordType.DeveloperName IN ('Delivery','Merchandising', 'Sales') 
            AND PlaceId IN {BatchIds} `,
            updateLocalSoup: true,
            fields: visitSyncFields,
            allOrNone: true
        })
    }
}
export default VisitSync

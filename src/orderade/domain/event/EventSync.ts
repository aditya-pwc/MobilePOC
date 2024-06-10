import _ from 'lodash'
import BaseInstance from '../../../common/BaseInstance'
import { CommonParam } from '../../../common/CommonParam'
import { Log } from '../../../common/enums/Log'
import { storeClassLog } from '../../../common/utils/LogUtils'

class EventSync {
    public static async syncUpEvent(events: any[]) {
        const needCreateEvents = events.filter((e) => !e.Id)
        const needUpdateEvents = events.filter((e) => e.Id)
        CommonParam.isSyncing = true
        try {
            await BaseInstance.sfSyncEngine.syncUp({
                name: 'Event',
                records: needCreateEvents,
                type: 'POST',
                queryLatestData: true
            })
            await BaseInstance.sfSyncEngine.syncUp({
                name: 'Event',
                records: needUpdateEvents,
                type: 'PATCH',
                queryLatestData: true
            })
            CommonParam.isSyncing = false
            return 'done'
        } catch (err) {
            CommonParam.isSyncing = false
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: syncUpEvent',
                `orderade sync up event failed: ${JSON.stringify(err)}`
            )
            return null
        }
    }

    public static async syncDownEventDataForMyDayScreen(userVisitListIds: string, eventListSyncFields: string[]) {
        try {
            if (_.isEmpty(userVisitListIds)) {
                return []
            }
            return await BaseInstance.sfSyncEngine.syncDown({
                name: 'Event',
                whereClause: `
                    Visit_List__c in (${userVisitListIds}) 
                    AND OwnerId='${CommonParam.userId}'`,
                updateLocalSoup: true,
                fields: eventListSyncFields,
                allOrNone: true
            })
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: syncDownEventDataForMyDayScreen',
                `orderade sync down event failed: ${JSON.stringify(err)}`
            )
            return null
        }
    }
}

export default EventSync

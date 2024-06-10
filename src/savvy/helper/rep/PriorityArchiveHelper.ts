import BaseInstance from '../../../common/BaseInstance'
import { Log } from '../../../common/enums/Log'
import { getStringValue } from '../../utils/LandingUtils'
import { filterExistFields } from '../../utils/SyncUtils'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { getStorePriorityFromExeId } from '../../utils/InnovationProductUtils'

export const updateStorePriorityStatus = async (
    retailStoreId: string,
    status: string,
    priorityExtId?: string,
    storePriority?: any
) => {
    try {
        let isSuccess
        let sp
        if (!storePriority && priorityExtId) {
            sp = await getStorePriorityFromExeId(priorityExtId, retailStoreId)
        } else {
            sp = storePriority
        }
        if (sp) {
            sp.Status__c = status
            if (status === 'Action') {
                sp.Date_NoSale__c = null
            } else {
                sp.Date_NoSale__c = new Date().toISOString()
            }

            await BaseInstance.sfSoupEngine.upsert('StorePriority__c', [sp])

            await BaseInstance.sfSyncEngine.syncUp({
                name: 'StorePriority__c',
                records: filterExistFields('StorePriority__c', [sp], ['Id', 'Status__c', 'Date_NoSale__c']),
                type: 'PATCH',
                queryLatestData: true
            })
            isSuccess = true
        }
        return { isSuccess }
    } catch (e) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'updateStorePriorityStatus',
            'Update Store Priority Status:' + getStringValue(e)
        )
        return { isSuccess: false }
    }
}

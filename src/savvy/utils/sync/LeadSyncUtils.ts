import AsyncStorage from '@react-native-async-storage/async-storage'
import { getAllFieldsByObjName } from '../SyncUtils'
import { LstSyncBodyProps } from '../../../common/interface/SyncInterface'
import { mobileCustomSyncService } from '../../api/ApexApis'
import moment from 'moment'
import { setLoggedInUserTimezone } from '../TimeZoneUtils'
import { Log } from '../../../common/enums/Log'
import { CommonParam } from '../../../common/CommonParam'
import { SoupService } from '../../service/SoupService'
import { storeClassLog } from '../../../common/utils/LogUtils'

const genLeadDetailArray = (leadExternalId: string, lastSyncTime?: string): Array<LstSyncBodyProps> => {
    return [
        {
            fields: getAllFieldsByObjName('Lead__x'),
            name: 'Lead__x',
            whereClause: `Id='${leadExternalId}'`,
            lastSyncTime,
            needSync: false
        },
        {
            fields: getAllFieldsByObjName('Contact'),
            name: 'Contact',
            whereClause: `Lead__c='${leadExternalId}'`,
            lastSyncTime,
            needSync: false
        },
        {
            fields: getAllFieldsByObjName('Task'),
            name: 'Task',
            whereClause: `Lead__c='${leadExternalId}'`,
            lastSyncTime,
            needSync: false
        },
        {
            fields: getAllFieldsByObjName('Customer_to_Route__c'),
            name: 'Customer_to_Route__c',
            whereClause: `Lead__c='${leadExternalId}'`,
            lastSyncTime,
            needSync: false
        },
        {
            fields: getAllFieldsByObjName('Request__c'),
            name: 'Request__c',
            whereClause: `Lead__c='${leadExternalId}'`,
            lastSyncTime,
            needSync: false
        }
    ]
}

const upsertData = async (data) => {
    for (const d of data) {
        await SoupService.upsertDataIntoSoupWithExternalId(d.name, d.data, false, true)
    }
}

export const syncDownLeadDetail = async (leadExternalId: string): Promise<void> => {
    try {
        setLoggedInUserTimezone()
        const syncTimeString = moment().toISOString()
        const obj = AsyncStorage.getItem('leadDetailSyncTable')
        if (obj && obj[leadExternalId]) {
            const { data } = await mobileCustomSyncService({
                syncType: 'down',
                lstSyncBody: genLeadDetailArray(leadExternalId, obj[leadExternalId])
            })
            await upsertData(data)
        } else {
            const { data } = await mobileCustomSyncService({
                syncType: 'down',
                lstSyncBody: genLeadDetailArray(leadExternalId)
            })
            await upsertData(data)
        }
        const newObj = { ...obj }
        newObj[leadExternalId] = syncTimeString
        await AsyncStorage.setItem('leadDetailSyncTable', JSON.stringify(newObj))
    } catch (e) {
        await storeClassLog(
            Log.MOBILE_ERROR,
            'LeadSyncUtils.syncDownLeadDetail',
            `${CommonParam.PERSONA__c} sync down data error: ${e}`
        )
    }
}

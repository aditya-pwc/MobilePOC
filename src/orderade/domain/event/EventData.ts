import BaseInstance from '../../../common/BaseInstance'
import { CommonParam } from '../../../common/CommonParam'
import { Log } from '../../../common/enums/Log'
import { storeClassLog } from '../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

class EventData {
    public static async updateEventIntoSoup(event: object) {
        try {
            await BaseInstance.sfSoupEngine.upsert('Event', [event], true, false)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: updateEventIntoSoup',
                `upsert event into soup failed: ${ErrorUtils.error2String(err)}`
            )
        }
    }

    public static async getEventsToSyncUp(start: any) {
        try {
            const events = await BaseInstance.sfSoupEngine.retrieve(
                'Event',
                [],
                '',
                [
                    ` WHERE date(REPLACE({Event:StartDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') >= date("${start}") 
                AND ({Event:Subject}='Lunch' OR {Event:Subject}='Break' OR {Event:Subject}='Meeting' 
                OR {Event:Manager_Scheduled__c}='1' OR {Event:Subject}='Personal Time') AND 
                {Event:OwnerId}='${CommonParam.userId}' AND {Event:IsRemoved__c} IS NOT TRUE AND {Event:Visit_List__c} IS NOT NULL ORDER BY {Event:StartDateTime} DESC`
                ],
                {},
                false,
                false
            )
            return events
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getEventsToSyncUp',
                `Fetch event list failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async getActiveEvent(start: any) {
        try {
            const events = await BaseInstance.sfSoupEngine.retrieve(
                'Event',
                [],
                '',
                [
                    ` WHERE date(REPLACE({Event:StartDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') >= date("${start}") 
                AND ({Event:Subject}='Lunch' OR {Event:Subject}='Break' OR {Event:Subject}='Meeting' 
                OR {Event:Manager_Scheduled__c}='1' OR {Event:Subject}='Personal Time') AND 
                {Event:OwnerId}='${CommonParam.userId}' AND {Event:Actual_End_Time__c} IS NULL AND 
                {Event:Actual_Start_Time__c} IS NOT NULL AND {Event:IsRemoved__c} IS NOT TRUE AND {Event:Visit_List__c} IS NOT NULL ORDER BY {Event:StartDateTime} DESC`
                ],
                {},
                false,
                false
            )
            return events
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getActiveEvent',
                `Fetch active event list failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }
}

export default EventData

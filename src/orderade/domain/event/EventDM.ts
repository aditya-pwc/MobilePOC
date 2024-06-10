import { CommonParam } from '../../../common/CommonParam'
import EventData from './EventData'
import EventSync from './EventSync'
import { getLastSundayDate, formatWithTimeZone, todayDateWithTimeZone } from '../../../common/utils/TimeZoneUtils'
import moment from 'moment'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import CommonData from '../common/CommonData'

class EventDM {
    public static async updateEventIntoSoup(event: object) {
        await EventData.updateEventIntoSoup(event)
    }

    public static redefinePositionCoords(latitude: any, longitude: any) {
        return {
            longitude: (longitude || 0).toString(),
            latitude: (latitude || 0).toString()
        }
    }

    public static async syncUpEvent() {
        const start = getLastSundayDate()
        const events = await EventData.getEventsToSyncUp(start)
        const syncUpEvents = events.map((e) => {
            const temp: any = {}
            Object.keys(e).forEach((key) => {
                if (key !== 'LastModifiedDate' && key !== 'Start_Location__c' && key !== 'End_Location__c') {
                    temp[key] = e[key]
                }
            })
            return temp
        })
        return await EventSync.syncUpEvent(syncUpEvents)
    }

    public static async getActiveEvent() {
        CommonParam.inMeeting = false
        const start = getLastSundayDate()
        const events = await EventData.getActiveEvent(start)
        const activeEvents = events.filter((e: any) => {
            const startDate = formatWithTimeZone(moment(e.Actual_Start_Time__c), TIME_FORMAT.Y_MM_DD, true)
            return startDate === todayDateWithTimeZone(true)
        })
        if (activeEvents.length > 0) {
            const event = activeEvents[0]
            if (!event.Type) {
                event.Type = event.Subject
            }
            if (!event.Manager_Scheduled__c) {
                event.Manager_Scheduled__c = '0'
            }
            return event
        }
        return null
    }

    public static async syncDownEventDataForMyDayScreen(userVisitListIds: string) {
        const eventListSyncFields = CommonData.getAllFieldsByObjName('Event', 'Remote')
        return await EventSync.syncDownEventDataForMyDayScreen(userVisitListIds, eventListSyncFields)
    }
}

export default EventDM

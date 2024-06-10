import { VisitList } from '../interface/VisitListModel'
import { VisitListStatus } from '../enum/VisitListStatus'
import VisitDM from '../domain/visit/VisitDM'
import { CommonParam } from '../../common/CommonParam'
import LocationService from './LocationService'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import EventDM from '../domain/event/EventDM'
import NetInfo from '@react-native-community/netinfo'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { getIdClause } from '../../common/utils/CommonUtils'
import moment from 'moment'

class EventService {
    public static async createEventLocalData(type: string, userVls: VisitList[], item?: any) {
        const inProgressVisit = userVls.find((visitList) => visitList.Status === VisitListStatus.IN_PROGRESS)
        // if there is not in progress visit list, we can't start an event
        if (!inProgressVisit) {
            return
        }
        // resolve the scenario when visit list have been uploaded but not updated in local yet
        const vlSoupEntryId = inProgressVisit._soupEntryId
        const inProgressVisits = await VisitDM.getVisitListBySoupEntryId(vlSoupEntryId)
        inProgressVisit.Id = inProgressVisits[0].Id
        const now = moment().toISOString()
        const event: any = {
            Type: item.Type || type,
            Subject: item.Type || type,
            StartDateTime: item.StartDateTime || now,
            EndDateTime: item.EndDateTime || new Date(new Date(now).getTime() + 60 * 1000 * 60).toISOString(),
            OwnerId: CommonParam.userId,
            Subject__c: item.Subject__c || null,
            SubType__c: item.SubType__c || null,
            Visit_List__c: inProgressVisit.Id,
            Location__c: CommonParam.userLocationId,
            Manager_Scheduled__c: item.Manager_Scheduled__c || null,
            MeetingName__c: item.MeetingName || null,
            Start_Location__longitude__s: '0',
            Start_Location__latitude__s: '0'
        }
        event.Actual_Start_Time__c = now
        storeClassLog(
            Log.MOBILE_INFO,
            'Orderade: createLocalEvent',
            `event start time=${event.Actual_Start_Time__c}, type=${type}, inProgressVisit=${JSON.stringify(
                inProgressVisit
            )}, eventItem=${JSON.stringify(item)}`
        )
        let position: any
        const info = {
            UserId: CommonParam.userId,
            VisitListId: inProgressVisit?.Id || '',
            position
        }
        try {
            position = await LocationService.getCurrentPosition(1200)
            if (position && position.coords) {
                const coords = EventDM.redefinePositionCoords(position.coords.latitude, position.coords.longitude)
                if (event.Subject === 'Break' || event.Subject === 'Meeting' || event.SubType__c) {
                    event.Start_Location__longitude__s = coords.longitude
                    event.Start_Location__latitude__s = coords.latitude
                }
            }
        } catch (err) {
            if (event.Start_Location__longitude__s === '0' || event.Start_Location__latitude__s === '0') {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'Orderade: createEventLocalData',
                    `orderade get position failed for start event: ${JSON.stringify(info)}, ${JSON.stringify(err)}`
                )
            }
        }
        try {
            await EventDM.updateEventIntoSoup(event)
            CommonParam.inMeeting = true
            return event
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: createEventLocalData',
                `orderade insert event to local failed:${JSON.stringify(info)}, ${JSON.stringify(err)}`
            )
            return event
        }
    }

    public static async syncUpEvent() {
        try {
            const state = await NetInfo.fetch()
            if (state.isInternetReachable) {
                return await EventDM.syncUpEvent()
            }
            CommonParam.isSyncing = false
            storeClassLog(Log.MOBILE_INFO, 'Orderade: syncUpEvent', 'orderade sync up network not avaiable')
            return null
        } catch (err) {
            storeClassLog(Log.MOBILE_ERROR, 'Orderade: syncUpEvent', `${ErrorUtils.error2String(err)}`)
            return null
        }
    }

    private static parseStartLocation(obj: any) {
        if (obj.Start_Location__c) {
            try {
                const coords = JSON.parse(obj.Start_Location__c)
                obj.Start_Location__latitude__s = coords.latitude || null
                obj.Start_Location__longitude__s = coords.longitude || null
            } catch (err) {}
        }
        return obj
    }

    public static async updateEventLocalData(item: any) {
        CommonParam.inMeeting = false
        let eventToUpdate = JSON.parse(JSON.stringify(item))
        eventToUpdate.MeetingName__c = item.MeetingName
        eventToUpdate.Planned_Duration__c = item.PlannedDuration || item.Planned_Duration__c
        eventToUpdate.Actual_End_Time__c = moment().toISOString()
        eventToUpdate.End_Location__longitude__s = '0'
        eventToUpdate.End_Location__latitude__s = '0'
        let position: any
        const info = {
            UserId: CommonParam.userId,
            VisitListId: eventToUpdate.Visit_List__c || '',
            position
        }
        try {
            position = await LocationService.getCurrentPosition(1200)
            eventToUpdate = EventService.parseStartLocation(eventToUpdate)
            if (position && position.coords) {
                const coords = EventDM.redefinePositionCoords(position.coords.latitude, position.coords.longitude)
                if (
                    eventToUpdate.Subject === 'Break' ||
                    eventToUpdate.Subject === 'Meeting' ||
                    eventToUpdate.SubType__c
                ) {
                    eventToUpdate.End_Location__longitude__s = coords.longitude
                    eventToUpdate.End_Location__latitude__s = coords.latitude
                }
            }
        } catch (err) {
            if (eventToUpdate.End_Location__longitude__s === '0' || eventToUpdate.End_Location__latitude__s === '0') {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'Orderade: updateEventLocalData',
                    `orderade get position failed for end event: ${JSON.stringify(info)}, ${JSON.stringify(err)}`
                )
            }
        }
        try {
            // update the event in local database
            await EventDM.updateEventIntoSoup(eventToUpdate)
            return eventToUpdate
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: updateEventLocalData',
                `orderade update event to local failed: ${JSON.stringify(info)}, ${JSON.stringify(err)}`
            )
            return eventToUpdate
        }
    }

    public static async getActiveEvent() {
        return await EventDM.getActiveEvent()
    }

    static async syncDownEventDataForMyDayScreen() {
        const uvlIds = await VisitDM.getUVLIdsCurUser()
        const userVisitListIds = getIdClause(uvlIds)
        return await EventDM.syncDownEventDataForMyDayScreen(userVisitListIds)
    }
}

export default EventService

/* eslint-disable camelcase */
/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-07-28 11:24:47
 * @LastEditTime: 2023-11-13 14:29:35
 * @LastEditors: Mary Qian
 */

import NetInfo from '@react-native-community/netinfo'
import _ from 'lodash'
import { CommonApi } from '../../../common/api/CommonApi'
import { restApexCommonCall } from '../../api/SyncUtils'
import { CommonParam } from '../../../common/CommonParam'
import { redefinePositionCoords } from '../../components/merchandiser/VisitDetail'
import { Log } from '../../../common/enums/Log'
import MyVisitQueries from '../../queries/MyVisitQueries'
import BreadcrumbsService from '../../service/BreadcrumbsService'
import LocationService from '../../service/LocationService'
import { SoupService } from '../../service/SoupService'
import SyncService from '../../service/SyncService'
import { formatString } from '../../utils/CommonUtils'
import { getTimeFromMins } from '../../utils/MerchManagerUtils'
import { getLastSundayDate } from '../../utils/TimeZoneUtils'
import { addDaysToToday } from '../../../common/utils/YMDUtils'
import { isCurrentVlPastAndShiftUser } from './MyVisitDataHelper'
import { recordSyncingLogs } from './MyVisitHelper'
import { storeClassLog } from '../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const getEventData = (start: string, end: string, visitlist?: string) => {
    return new Promise((resolve: (res: any[]) => void, reject) => {
        const queryPastEvent = visitlist ? `AND {Event:Visit_List__c}= "${visitlist}"` : ''
        const employeeQuery = [
            'Id',
            'VLSoupId',
            'VisitList',
            'VlStatus',
            'StartTime',
            'EndTime',
            'VisitDate',
            'ActivityDate',
            'Parent_Event__c',
            'Location',
            'MeetingName',
            'Planned_Duration__c',
            'VirtualLocation__c',
            'Actual_Start_Time__c',
            'Actual_End_Time__c',
            'Attendees_Count__c',
            'Subject',
            'Finished',
            'SubType',
            'OwnerId',
            'StartDateTime',
            'EndDateTime',
            'Manager_Scheduled__c',
            'Description',
            '_soupEntryId',
            ''
        ]
        const query = ` SELECT
            {Event:Id} AS Id,
            {Visit_List__c:_soupEntryId},
            {Event:Visit_List__c} AS VisitList,

            {Visit_List__c:Status__c} AS VlStatus,
            {Visit_List__c:Start_Date_Time__c},
            {Visit_List__c:End_Date_Time__c},

            COALESCE({Visit_List__c:Visit_Date__c}, date(REPLACE({Event:StartDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}')) AS VisitDate,
            {Event:ActivityDate},
            {Event:Parent_Event__c},
            {Event:Location},
            {Event:MeetingName__c},
            {Event:Planned_Duration__c},
            {Event:VirtualLocation__c},
            {Event:Actual_Start_Time__c},
            {Event:Actual_End_Time__c},
            {Event:Attendees_Count__c},
            {Event:Subject},
            {Event:Actual_End_Time__c} IS NULL AS Finished,
            {Event:SubType__c} AS SubType,
            {Event:OwnerId},
            {Event:StartDateTime},
            {Event:EndDateTime},
            {Event:Manager_Scheduled__c},
            {Event:Description},
            {Event:_soupEntryId}
            FROM {Event}
            LEFT JOIN {Visit_List__c} ON {Visit_List__c:Id} = {Event:Visit_List__c}
            WHERE {Event:OwnerId}="${CommonParam.userId}"  
            ${queryPastEvent}
            AND date(REPLACE({Event:StartDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') >= date("${start}", 'start of day') 
            AND date(REPLACE({Event:EndDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') < date("${end}", 'start of day', '+1 day')
            ORDER BY VisitList, Finished NULLS LAST, {Event:Actual_Start_Time__c} NULLS LAST, {Event:StartDateTime} DESC
        `

        SoupService.retrieveDataFromSoup('Event', {}, employeeQuery, query)
            .then((values) => {
                values.forEach((value) => {
                    value.meetingDuration = getTimeFromMins(parseFloat(value.Planned_Duration__c || 0))
                    value.ChildMeetingCount = parseInt(value.Attendees_Count__c) || 0
                })
                resolve(values || [])
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const getTodayEventRes = () => {
    const start = addDaysToToday(-2, true)
    const end = addDaysToToday(2, true)
    return getEventData(start, end)
}

export const getPastFutureEventRes = () => {
    const start = getLastSundayDate()
    const end = addDaysToToday(7, true)
    return getEventData(start, end)
}

export const getYesterdayInprogressVlEventFromLocal = () => {
    if (isCurrentVlPastAndShiftUser()) {
        const start = addDaysToToday(-1, true)
        const end = addDaysToToday(1, true)
        return getEventData(start, end, CommonParam.visitList.Id)
    }
}

export interface MeetingProps {
    schMeetings: Array<any>
    endMeetings: Array<any>
}

export const getScheduleMeetingData = () => {
    return new Promise((resolve: (res: MeetingProps) => void) => {
        let schMeetings = []
        let endMeetings = []

        const { targetValues, startMeeting, endMeeting } = MyVisitQueries.getMeetingDataQuery
        Promise.all([
            SoupService.retrieveDataFromSoup(
                'Event',
                {},
                targetValues,
                formatString(startMeeting, [CommonParam.userId])
            ),
            SoupService.retrieveDataFromSoup('Event', {}, targetValues, formatString(endMeeting, [CommonParam.userId]))
        ])
            .then((res) => {
                schMeetings = (res[0] || []).map((ele) => {
                    ele.meetingDuration = getTimeFromMins(parseFloat(ele.PlannedDuration || 0))
                    ele.ChildMeetingCount = parseInt(ele.Attendees_Count__c) || 0
                    return ele
                })
                endMeetings = (res[1] || []).map((evt) => {
                    evt.IsActive = 'false'
                    evt.meetingDuration = getTimeFromMins(parseFloat(evt.PlannedDuration || 0))
                    evt.ChildMeetingCount = parseInt(evt.Attendees_Count__c) || 0
                    return evt
                })
                resolve({ schMeetings, endMeetings })
            })
            .catch((err) => {
                resolve({ schMeetings, endMeetings })
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'MD-getScheduleMeetingData',
                    `Get schedule meeting failed: ${ErrorUtils.error2String(err)}`
                )
            })
    })
}

export const getCurrentMeeting = async (visitListId) => {
    const result = await SoupService.retrieveDataFromSoup('Event', {}, [], null, [
        ` WHERE ({Event:Subject}='Lunch' OR {Event:Subject}='Break' OR {Event:Subject}='Meeting' OR {Event:Subject}='Personal Time' OR {Event:Manager_Scheduled__c}='1') 
        AND {Event:Visit_List__c}='${visitListId}' 
        AND {Event:Actual_Start_Time__c} IS NOT NULL 
        AND {Event:IsRemoved__c} IS NOT TRUE 
        ORDER BY {Event:StartDateTime} DESC`
    ])

    if (result?.length > 0) {
        const event = result[0]
        const { StartDateTime } = event
        return !!StartDateTime
    }

    return false
}

interface EventModal {
    Actual_Start_Time__c
    Type
    SubType__c
    Manager_Scheduled__c
}

export const getActiveEvent = () => {
    return new Promise<EventModal>((resolve) => {
        CommonParam.inMeeting = false
        const start = getLastSundayDate()
        SoupService.retrieveDataFromSoup('Event', {}, [], null, [
            ` WHERE date(REPLACE({Event:StartDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') >= date("${start}") 
            AND ({Event:Subject}='Lunch' OR {Event:Subject}='Break' OR {Event:Subject}='Meeting' 
            OR {Event:Manager_Scheduled__c}='1' OR {Event:Subject}='Personal Time') AND 
            {Event:OwnerId}='${CommonParam.userId}' AND {Event:Actual_End_Time__c} IS NULL AND 
            {Event:Actual_Start_Time__c} IS NOT NULL AND {Event:IsRemoved__c} IS NOT TRUE ORDER BY {Event:StartDateTime} DESC`
        ]).then((events: any) => {
            if (events.length > 0) {
                const event = events[0]
                if (!event.Type) {
                    event.Type = event.Subject
                }
                if (!event.Manager_Scheduled__c) {
                    event.Manager_Scheduled__c = '0'
                }
                event.MeetingName = event.MeetingName__c
                event.meetingDuration = getTimeFromMins(parseFloat(event.PlannedDuration || 0))
                event.ChildMeetingCount = parseInt(event.Attendees_Count__c) || 0
                resolve(event)
            } else {
                resolve(null)
            }
        })
    })
}

export const getAttendeesWithEvent = (events) => {
    return new Promise((resolve: (res: any[]) => void, reject) => {
        const parentIdArr = []
        events.forEach((element) => {
            if (element.Parent_Event__c) {
                parentIdArr.push(element.Parent_Event__c)
            }
        })
        if (parentIdArr.length === 0) {
            resolve(events)
            return
        }
        restApexCommonCall(`${CommonApi.PBNA_MOBILE_API_EVENT_USER_INFO}/`, 'POST', {
            parentEventIdList: parentIdArr
        })
            .then((resultArr) => {
                const attendeesData = JSON.parse(resultArr.data)
                const attendeesArr = []
                _.forEach(attendeesData, (val, keyStr) => {
                    attendeesArr.push({
                        parentEventId: keyStr,
                        items: val
                    })
                })
                const resultEvents = events.map((item) => {
                    const eventItem = _.cloneDeep(item)
                    attendeesArr.forEach((parentItem) => {
                        if (eventItem.Parent_Event__c && eventItem.Parent_Event__c === parentItem.parentEventId) {
                            eventItem.attendees = parentItem.items
                            eventItem.ChildMeetingCount = parentItem.items.length
                        }
                    })
                    return eventItem
                })
                resolve(resultEvents)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const syncUpEvent = () => {
    return new Promise((resolve) => {
        NetInfo.fetch().then((state) => {
            if (state.isInternetReachable) {
                recordSyncingLogs('syncUpEvent: CommonParam.isSyncing setting true')
                CommonParam.isSyncing = true
                SyncService.syncUp({ soupName: 'Event' })
                    .then((res) => {
                        recordSyncingLogs('syncUpEvent: CommonParam.isSyncing setting false')
                        CommonParam.isSyncing = false
                        resolve(res)
                    })
                    .catch((err) => {
                        recordSyncingLogs(
                            `syncUpEvent: CommonParam.isSyncing setting false with err ${ErrorUtils.error2String(err)}`
                        )
                        CommonParam.isSyncing = false
                        CommonParam.pendingSync.scheduledMeeting = true
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'MD-StartEvent',
                            `SyncUp event failed: ${ErrorUtils.error2String(err)}`
                        )
                        resolve(null)
                    })
            } else {
                CommonParam.pendingSync.scheduledMeeting = true
                resolve(null)
            }
        })
    })
}

interface EventResponseModal {
    eventToDo: any
    event: any
}

export const startEventHelper = (type, item?) => {
    return new Promise<EventResponseModal>((resolve) => {
        const visitList = CommonParam.visitList
        const now = new Date().toISOString()
        let event: any = {
            Type: item.Type || type,
            Subject: item.Type || type,
            StartDateTime: item.StartDateTime || now,
            EndDateTime: item.EndDateTime || new Date(new Date(now).getTime() + 60 * 1000 * 60).toISOString(),
            OwnerId: CommonParam.userId,
            Subject__c: item.Subject__c || null,
            SubType__c: item.SubType__c || null,
            Visit_List__c: visitList.Id,
            Location__c: CommonParam.userLocationId,
            Manager_Scheduled__c: item.Manager_Scheduled__c,
            MeetingName__c: item.MeetingName
        }
        if (item.Manager_Scheduled__c === '1') {
            event = item
            event.Visit_List__c = item.VisitList
            event.Location__c = CommonParam.userLocationId
            event.MeetingName__c = item.MeetingName
        }
        event.Actual_Start_Time__c = now
        LocationService.getCurrentPosition().then((position: any) => {
            if (position && position.coords) {
                const coords = redefinePositionCoords(position.coords.latitude, position.coords.longitude)
                if (event.Subject === 'Break' || event.Subject === 'Meeting' || event.SubType__c) {
                    event.Start_Location__longitude__s = coords.longitude
                    event.Start_Location__latitude__s = coords.latitude
                }
            } else {
                storeClassLog(
                    Log.MOBILE_WARN,
                    'MD-startEventHelper',
                    `Get position failed for start event: ${JSON.stringify(position)}`
                )
            }

            SoupService.upsertDataIntoSoup('Event', [event])
                .then(async (result) => {
                    CommonParam.inMeeting = true
                    const eventToDo = JSON.parse(JSON.stringify(result[0]))
                    resolve({
                        eventToDo,
                        event
                    })
                })
                .catch((err) => {
                    resolve({ eventToDo: null, event: null })
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'MD-StartEvent',
                        `Update local event failed: ${ErrorUtils.error2String(err)}`
                    )
                })
        })
    })
}

const parseStartLocation = (obj) => {
    if (obj.Start_Location__c) {
        try {
            let coords = JSON.parse(obj.Start_Location__c)
            coords = redefinePositionCoords(coords.latitude, coords.longitude)
            obj.Start_Location__latitude__s = coords.latitude
            obj.Start_Location__longitude__s = coords.longitude
        } catch (err) {}
    }
    return obj
}

export const endEventHelper = (item) => {
    return new Promise<any>((resolve) => {
        CommonParam.inMeeting = false
        let eventToUpdate = JSON.parse(JSON.stringify(item))
        eventToUpdate.MeetingName__c = item.MeetingName
        eventToUpdate.Planned_Duration__c = item.PlannedDuration || item.Planned_Duration__c
        eventToUpdate.Actual_End_Time__c = new Date().toISOString()
        if (eventToUpdate.Manager_Scheduled__c !== '1') {
            eventToUpdate.EndDateTime = new Date().toISOString()
        }
        LocationService.getCurrentPosition()
            .then((position: any) => {
                eventToUpdate = parseStartLocation(eventToUpdate)
                if (position && position.coords) {
                    const coords = redefinePositionCoords(position.coords.latitude, position.coords.longitude)
                    if (
                        eventToUpdate.Subject === 'Break' ||
                        eventToUpdate.Subject === 'Meeting' ||
                        eventToUpdate.SubType__c
                    ) {
                        eventToUpdate.End_Location__longitude__s = coords.longitude
                        eventToUpdate.End_Location__latitude__s = coords.latitude
                    }
                } else {
                    storeClassLog(
                        Log.MOBILE_WARN,
                        'MD-endEventHelper',
                        `Get position failed for end day: ${JSON.stringify(position)}`
                    )
                }
                resolve(eventToUpdate)
            })
            .catch((err) => {
                resolve(eventToUpdate)
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'MD-endEventHelper',
                    `Get location failed: ${ErrorUtils.error2String(err)}`
                )
            })
    })
}

export const stopWatchIfBreak = (type) => {
    if (type === 'Lunch' || type === 'Break' || type === 'Personal Time' || type === 'Meeting') {
        BreadcrumbsService.startBreak(type)
    } else {
        storeClassLog(Log.MOBILE_WARN, 'stopWatchIfBreak', `start event: ${type}`)
    }
}

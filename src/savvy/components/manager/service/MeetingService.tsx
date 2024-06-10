import { SoupService } from '../../../service/SoupService'
import ScheduleQuery from '../../../queries/ScheduleQuery'
import { CommonParam } from '../../../../common/CommonParam'
import moment from 'moment'
import {
    getOverworkStatus,
    getTotalHours,
    getWeekLabel,
    getWorkingStatus
} from '../../../utils/MerchManagerComputeUtils'
import { Alert } from 'react-native'
import { formatStringByComma, getTimeFromMins } from '../../../utils/MerchManagerUtils'
import { getSQLFormatScheduleDateArr, navigateToAddMeeting } from '../helper/MerchManagerHelper'
import { formatString } from '../../../utils/CommonUtils'
import { VisitListStatus } from '../../../enums/VisitList'
import { BooleanStr } from '../../../enums/Manager'
import { setLoggedInUserTimezone } from '../../../utils/TimeZoneUtils'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'

const FORMAT_DATE_STRING = TIME_FORMAT.Y_MM_DD
setLoggedInUserTimezone()
export const getDayMeetingSql = (day) => {
    return `
    AND NEV.{Event:Id} IS NOT NULL
    AND OEV.{Event:Visit_List__c} IS NOT NULL
    AND OEV.{Event:Location__c} = '${CommonParam.userLocationId}'
    AND date(REPLACE(OEV.{Event:StartDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') >= date("${day}", 'start of day') 
    AND date(REPLACE(OEV.{Event:EndDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') < date("${day}", 'start of day', '+1 day')
    ORDER BY OEV.{Event:StartDateTime}`
}

export const getWeekMeetingSql = (start, end) => {
    return `AND NEV.{Event:Id} IS NOT NULL
        AND OEV.{Event:Visit_List__c} IS NOT NULL
        AND OEV.{Event:Location__c} = '${CommonParam.userLocationId}'
        AND date(REPLACE(OEV.{Event:StartDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') >= date("${start}", 'start of day')
        AND date(REPLACE(OEV.{Event:EndDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') < date("${end}", 'start of day', '+1 day')
        ORDER BY OEV.{Event:StartDateTime}
        `
}
const svgStatusSql = (svgStatus) => {
    return `JOIN {Visit_List__c} VL ON VL.{Visit_List__c:Id} = OEV.{Event:Visit_List__c} 
    AND VL.{Visit_List__c:Status__c} = '${svgStatus}' AND VL.{Visit_List__c:IsRemoved__c} IS FALSE`
}

export const getRNSWeekMeetingSql = (scheduleDate: string) => {
    const formatDateArr = getSQLFormatScheduleDateArr(scheduleDate)
    return getWeekMeetingSql(formatDateArr[0], formatDateArr[1])
}

export const getMeetingList = async (sql, scheduleMode?) => {
    const result = await SoupService.retrieveDataFromSoup(
        'Event',
        {},
        ScheduleQuery.getManagerMeetingDetail.f,
        formatString(ScheduleQuery.getManagerMeetingDetail.q, [svgStatusSql(scheduleMode)]) + sql
    )

    const tempObj = {}
    result.forEach((item: any) => {
        if (tempObj[item.Id]) {
            tempObj[item.Id].chMeetingIdArr.push(item.ChildId)
            tempObj[item.Id].chSoupEntryIdArr.push(item.ChildSoupEntryId)
            tempObj[item.Id].childOwnerIdArr.push(item.OwnerId)
            tempObj[item.Id].ChildMeetingCount++
        } else {
            tempObj[item.Id] = {
                chMeetingIdArr: [item.ChildId],
                chSoupEntryIdArr: [item.ChildSoupEntryId],
                childOwnerIdArr: [item.OwnerId],
                ChildMeetingCount: 1,
                index: item.Id,
                meetingDuration: getTimeFromMins(parseFloat(item.PlannedDuration || 0)),
                ChildActualStartTimeObj: {},
                ChildActualEndTimeObj: {},
                ChildVisitListIdObj: {},
                ...item
            }
        }
        if (item.OwnerId) {
            tempObj[item.Id].ChildActualStartTimeObj[item.OwnerId] = item.ChildActualStartTime
            tempObj[item.Id].ChildActualEndTimeObj[item.OwnerId] = item.ChildActualEndTime
            tempObj[item.Id].ChildVisitListIdObj[item.OwnerId] = item.ChildVisitListId
        }
    })
    const list = Object.values(tempObj)
    return list
}
const getOneMeetingTime = (isPub: boolean, item: any) => {
    return isPub ? parseFloat(item.PlannedDuration || 0) : parseFloat(item.AggregateDuration || 0)
}

export const getMeetingSumData = async (list?: any, employeeId?: any, isPub?: boolean) => {
    const weekLabel = getWeekLabel()
    const allWeekMeetings = {}
    let meetingTime = 0
    let meetingCost = 0
    let userActive = true
    if (employeeId) {
        const employee = await SoupService.retrieveDataFromSoup(
            'User',
            {},
            ['IsActive'],
            formatString(
                `SELECT 
                    {User:IsActive}
                FROM {User}
                WHERE {User:Id} = '%s'
            `,
                [employeeId]
            )
        )
        userActive = employee[0]?.IsActive === BooleanStr.STR_TRUE
    }
    list.forEach((item: any) => {
        if (employeeId) {
            const childMArr = item.childOwnerIdArr || []
            const childMList = childMArr.filter((OwnerId) => {
                return OwnerId === employeeId && userActive
            })
            if (!childMList.length) {
                return
            }
        }
        const oneMeetingTime = getOneMeetingTime(isPub, item)
        meetingTime += oneMeetingTime
        meetingCost += parseFloat(item.PlannedCost || 0)
        const dateTime = item.StartDateTime
        const weekName = isPub ? moment(dateTime).format(FORMAT_DATE_STRING) : weekLabel[moment(dateTime).weekday()]
        if (allWeekMeetings[weekName]) {
            allWeekMeetings[weekName].push(item)
        } else {
            allWeekMeetings[weekName] = [item]
        }
    })
    const meetingCostStr = meetingCost.toFixed(1)
    const headData = {
        meetingCount: list.length,
        meetingTotalTime: isPub ? meetingTime : getTotalHours(meetingTime, 0),
        meetingCost: formatStringByComma(meetingCostStr)
    }
    return { headData: headData, weekObj: allWeekMeetings }
}

export const computePubDayMeeting = (list: any) => {
    let meetingTime = 0
    list.forEach((item: any) => {
        meetingTime += parseFloat(item.PlannedDuration || 0)
    })
    return { meetingCount: list.length, meetingTotalTime: meetingTime }
}
export const getRNSMeetings = async (scheduleDate, employeeId?: string) => {
    const sql = getRNSWeekMeetingSql(scheduleDate)
    const list = await getMeetingList(sql, VisitListStatus.COMPLETED)
    if (!list) {
        return
    }
    return getMeetingSumData(list, employeeId)
}
export const getPubDayMeeting = async (day) => {
    const sql = getDayMeetingSql(day)
    const list = await getMeetingList(sql, VisitListStatus.ACCEPTED)
    const headData = computePubDayMeeting(list)
    return { headData: headData, list: list }
}

export const getPubEEMeetings = async (start, end, employeeId, isPub) => {
    const sql = getWeekMeetingSql(start, end)
    const list = await getMeetingList(sql, VisitListStatus.ACCEPTED)
    return getMeetingSumData(list, employeeId, isPub)
}
export const deleteMeetingAlert = (onRemove?: any, onCancel?: any) => {
    Alert.alert('Delete Meeting', 'Are you sure you want to delete this meeting and remove from participants’ view?', [
        {
            text: 'No',
            onPress: () => onCancel()
        },
        {
            text: 'Yes',
            onPress: () => onRemove()
        }
    ])
}

export const duplicateMeeting = (params) => {
    const { navigation, item, meetingList, closeOtherRows, isRNSMeeting, dateOptions, setIsLoading, dropDownRef } =
        params
    Alert.alert('Duplicate Meeting', 'Are you sure you want to duplicate this meeting?', [
        {
            text: 'No',
            onPress: () => closeOtherRows(item.index, meetingList)
        },
        {
            text: 'Yes',
            onPress: () => {
                closeOtherRows(item.index, meetingList)
                navigateToAddMeeting({
                    routerParams: { Id: item.Id, isReadOnly: false, isDuplicate: true, isRNSMeeting, dateOptions },
                    setIsLoading,
                    navigation,
                    dropDownRef
                })
            }
        }
    ])
}
const getMeetingAttendsItem = (visit, weekName, DAILY_OVER_WORK_LIMIT_MINUTE) => {
    const totMins = parseFloat(visit?.meetingTime || 0)
    return {
        id: visit?.UserId,
        totMTime: totMins,
        userStatsId: visit?.UserStatsId,
        name: visit?.Username,
        totalVisit: 0,
        visitor: visit?.UserId,
        firstName: visit?.FirstName,
        lastName: visit?.LastName,
        title: visit?.Title,
        ftFlag: visit?.FT_EMPLYE_FLG_VAL__c?.toLocaleLowerCase(),
        gpid: visit?.GPID,
        totalDuration: 0,
        totalMinus: totMins,
        totalHours: getTotalHours(totMins, 0),
        travelTime: 0,
        totalCases: 0,
        totalMiles: 0,
        workingStatus: getWorkingStatus(visit),
        weeklyVisitList: {
            id: visit.WVisitListId,
            startDate: visit.WStart_Date__c,
            endDate: visit.WEnd_Date__c
        },
        dailyVisitList: {
            [visit.DVisitListId]: {
                id: visit.DVisitListId,
                date: visit.DVisit_Date__c,
                updated: false,
                weeklyVisitId: visit.DVisit_List_Group__c,
                totalDuration: 0,
                totalTravelTime: 0
            }
        },
        visits: {},
        overwork: {
            [weekName]: {
                totalPlannedTime: totMins,
                owStatus: getOverworkStatus(totMins, DAILY_OVER_WORK_LIMIT_MINUTE)
            }
        },
        dayMeetingTime: { [weekName]: totMins },
        lineCode: visit.LC_ID__c
    }
}
export const getMeetingAttendsList = async (getEmployeeData) => {
    const { scheduleDate, visitListId } = getEmployeeData
    const formatDateArr = getSQLFormatScheduleDateArr(scheduleDate)
    const start = formatDateArr[0]
    const end = formatDateArr[1]
    const DAILY_OVER_WORK_LIMIT_MINUTE = CommonParam.dailyHourThreshold * 60
    const weekLabel = getWeekLabel()

    try {
        const visits = await SoupService.retrieveDataFromSoup(
            'Event',
            {},
            ['meetingTime', 'mStartTime', ...ScheduleQuery.retrieveRNSEmployeeData.f],
            `
            SELECT
            OEV.{Event:Planned_Duration__c},
            OEV.{Event:StartDateTime},
            {Visit:Id},
            {Visit:OwnerId},
            {Visit:VisitorId},
            {Visit:Status__c},
            {Visit:Planned_Date__c},
            {Visit:Planned_Duration_Minutes__c},
            {Visit:Sales_Visit__c},
            {Visit:Sequence__c},
            {Visit:Pull_Number__c},
            {Visit:Planned_Travel_Time__c},
            {Visit:Scheduled_Case_Quantity__c},
            {Visit:Planned_Mileage__c},
            {Visit:Visit_Subtype__c},
            {Visit:Take_Order_Flag__c},
            {Visit:InstructionDescription},
            {Visit:Manager_Ad_Hoc__c},
            {Visit:Route_Group__c},
            {Visit:Dynamic_Frequency_Add__c},
            DVL.{Visit_List__c:Id},
            DVL.{Visit_List__c:OwnerId},
            DVL.{Visit_List__c:Visit_Date__c},
            DVL.{Visit_List__c:RecordTypeId},
            DVL.{Visit_List__c:Visit_List_Group__c},
            DVL.{Visit_List__c:Total_Planned_Time__c},
            DVL.{Visit_List__c:Planned_Travel_Time__c},
            WVL.{Visit_List__c:Id},
            WVL.{Visit_List__c:Start_Date__c},
            WVL.{Visit_List__c:End_Date__c},
            WVL.{Visit_List__c:OwnerId},
            WVL.{Visit_List__c:Visit_Date__c},
            WVL.{Visit_List__c:RecordTypeId},
            {User:Id},
            {User:Name},
            {User:FirstName},
            {User:LastName},
            {User:GM_LOC_ID__c},
            {User:GPID__c},
            {User:Title},
            {User:MobilePhone},
            {User:FT_EMPLYE_FLG_VAL__c},
            {User:LC_ID__c},
            {RetailStore:Id},
            {RetailStore:Name},
            {RetailStore:Street},
            {RetailStore:City},
            {RetailStore:State},
            {RetailStore:Country},
            {RetailStore:PostalCode},
            {RetailStore:OwnerId},
            {RetailStore:Account.Phone},
            {RetailStore:Account.Name},
            {RetailStore:Account.ShippingAddress},
            {RetailStore:Latitude},
            {RetailStore:Longitude},
            {RetailStore:Store_Location__c},
            {User_Stats__c:Id},
            {User_Stats__c:User__c},
            {User_Stats__c:Start_Time__c},
            {User_Stats__c:Sunday__c},
            {User_Stats__c:Monday__c},
            {User_Stats__c:Tuesday__c},
            {User_Stats__c:Wednesday__c},
            {User_Stats__c:Thursday__c},
            {User_Stats__c:Friday__c},
            {User_Stats__c:Saturday__c}
            FROM {Event} OEV
            LEFT JOIN {Event} NEV ON NEV.{Event:Parent_Event__c} = OEV.{Event:Id} 
            LEFT JOIN {User} ON NEV.{Event:OwnerId} = {User:Id}
            LEFT JOIN {Visit} ON ({Visit:Schedule_Visit_Group__c} = '${visitListId}' AND {Visit:Status__c} != 'Removed' AND {Visit:Status__c} != 'Failed' AND {Visit:Id} IS NULL)
            LEFT JOIN {RetailStore} ON {RetailStore:Id} = {Visit:PlaceId}
            LEFT JOIN {Visit_List__c} DVL ON DVL.{Visit_List__c:Id} = NEV.{Event:Visit_List__c} 
            AND DVL.{Visit_List__c:IsRemoved__c} IS FALSE
            LEFT JOIN {Visit_List__c} WVL ON WVL.{Visit_List__c:Id} = DVL.{Visit_List__c:Visit_List_Group__c}
            AND WVL.{Visit_List__c:IsRemoved__c} IS FALSE
            JOIN {Visit_List__c} SVL ON SVL.{Visit_List__c:Id} = OEV.{Event:Visit_List__c} 
            AND SVL.{Visit_List__c:Status__c} = '${VisitListStatus.COMPLETED}' AND SVL.{Visit_List__c:IsRemoved__c} IS FALSE
            LEFT JOIN {User_Stats__c} ON {User_Stats__c:User__c} = {User:Id}
            WHERE OEV.{Event:Manager_Scheduled__c} IS TRUE
            AND OEV.{Event:Parent_Event__c} IS NULL 
            AND OEV.{Event:Location__c} = '${CommonParam.userLocationId}'
            AND NEV.{Event:Id} IS NOT NULL
            AND OEV.{Event:Visit_List__c} IS NOT NULL
            AND NEV.{Event:IsRemoved__c} IS FALSE
            AND OEV.{Event:IsRemoved__c} IS FALSE
            AND date(REPLACE(OEV.{Event:StartDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') >= date("${start}", 'start of day')
            AND date(REPLACE(OEV.{Event:EndDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') < date("${end}", 'start of day', '+1 day')   
            AND {User:IsActive} IS TRUE   
`
        )
        const tempObj = {}
        visits.forEach((visit) => {
            if (!visit.UserId) {
                return
            }
            const userId = visit.UserId
            const weekName = weekLabel[moment(visit?.mStartTime).weekday()]
            const mTime = parseFloat(visit?.meetingTime || 0)
            if (!tempObj[userId]) {
                tempObj[userId] = getMeetingAttendsItem(visit, weekName, DAILY_OVER_WORK_LIMIT_MINUTE)
            } else {
                tempObj[visit.UserId].totalMinus += mTime
                tempObj[visit.UserId].totMTime += mTime
                tempObj[visit.UserId].dayMeetingTime[weekName] += mTime
                tempObj[visit.UserId].totalHours = getTotalHours(tempObj[visit.UserId].totalMinus, 0)
                if (tempObj[visit.UserId].overwork[weekName]) {
                    tempObj[visit.UserId].overwork[weekName].totalPlannedTime += mTime
                    tempObj[visit.UserId].overwork[weekName].owStatus = getOverworkStatus(
                        tempObj[visit.UserId].totalMinus,
                        DAILY_OVER_WORK_LIMIT_MINUTE
                    )
                } else {
                    tempObj[visit.UserId].overwork[weekName] = {
                        totalPlannedTime: mTime,
                        owStatus: getOverworkStatus(mTime, DAILY_OVER_WORK_LIMIT_MINUTE)
                    }
                }
            }
        })
        return tempObj
    } catch (error) {
        return []
    }
}
export const meetingOnClick = async (params) => {
    const { setIsLoading, routerParams, navigation, dropDownRef } = params
    navigateToAddMeeting({
        routerParams: routerParams,
        setIsLoading,
        navigation,
        dropDownRef
    })
}

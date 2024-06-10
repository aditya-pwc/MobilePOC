/**
 * @description Employee Schedule component
 * @author Jiahua ZANG
 * @email jiahua.zang@pwc.com
 * @date 2021-05-25
 */

import moment from 'moment'
import { formatClock } from '../../../common/DateTimeUtils'
import { VisitStatus, VisitType } from '../../../enums/Visit'
import WorkOrderService from '../../../module/work-order/WorkOrderService'
import ScheduleQuery from '../../../queries/ScheduleQuery'
import { SoupService } from '../../../service/SoupService'
import { getDeliveryFooter } from '../../../utils/MerchandiserUtils'
import { getTotalMinus, getWorkingStatus } from '../../../utils/MerchManagerComputeUtils'
import { BooleanStr, MeetingType, MerchEventType } from '../../../enums/Manager'
import { t } from '../../../../common/i18n/t'
import { CommonParam } from '../../../../common/CommonParam'
import { sortArrByParamsASC } from '../helper/MerchManagerHelper'
import _ from 'lodash'
import { MOMENT_UNIT } from '../../../../common/enums/MomentUnit'
import { MOMENT_STARTOF } from '../../../../common/enums/MomentStartOf'

export const getClockTime = (visit, resultData, unit?) => {
    if (!visit.ActualVisitStartTime) {
        return ''
    }
    const timeUnit = !_.isEmpty(unit) ? unit : MOMENT_UNIT.SECONDS
    let finishMoment = 0
    let gapTime = moment(new Date())
    const events = resultData.filter(
        (a) =>
            a.SubType !== VisitType.VISIT &&
            (visit.visitList === a.visitList || a.visitList === null) &&
            moment(a.ActualVisitStartTime) >= moment(visit.ActualVisitStartTime) &&
            moment(a.ActualVisitStartTime) <= moment(new Date())
    )
    events.forEach((event) => {
        if (event.ActualVisitStartTime && event.Actual_End_Time__c) {
            finishMoment = finishMoment + moment(event.Actual_End_Time__c).diff(event.Actual_Start_Time__c, timeUnit)
        } else if (event.ActualVisitStartTime && !event.Actual_End_Time__c) {
            gapTime = moment(event.ActualVisitStartTime)
        }
    })
    const secondsGap = gapTime.diff(moment(visit.ActualVisitStartTime), timeUnit) - finishMoment
    let fullGap = Math.floor(secondsGap / 60 || 0)
    if (timeUnit === MOMENT_UNIT.MINUTES) {
        fullGap = gapTime.diff(moment(visit.ActualVisitStartTime), MOMENT_UNIT.MINUTES) - finishMoment
    }
    return formatClock({
        hour: Math.floor(fullGap >= 60 ? fullGap / 60 : 0),
        min: fullGap % 60
    })
}

export const assignWorkDay = (dayIndex, workSchedule) => {
    let workDay = null
    switch (parseInt(dayIndex)) {
        case 0:
            workDay = workSchedule.Sunday__c
            break
        case 1:
            workDay = workSchedule.Monday__c
            break
        case 2:
            workDay = workSchedule.Tuesday__c
            break
        case 3:
            workDay = workSchedule.Wednesday__c
            break
        case 4:
            workDay = workSchedule.Thursday__c
            break
        case 5:
            workDay = workSchedule.Friday__c
            break
        case 6:
            workDay = workSchedule.Saturday__c
            break
        default:
            break
    }
    return workDay
}

export const getUserStatus = (visitDate, visitTime, workSchedule) => {
    const timeStr = visitDate + ' ' + workSchedule.Start_Time__c
    const dayIndex = moment(visitTime).format('d')
    const workDay = assignWorkDay(dayIndex, workSchedule)
    if (workDay === '1' || workDay === true) {
        const workTime = timeStr.replace('.000Z', '')
        const timeLabe = parseInt(t.labels.PBNA_MOBILE_OVER_TIME) || 5
        const timeGap = moment(visitTime).diff(moment(workTime), 'minute')
        return timeGap > timeLabe
    }
    return false
}
export const itemCanSelected = (item) => {
    return (
        item.SubType === VisitType.VISIT &&
        item.status !== VisitStatus.IN_PROGRESS &&
        item.status !== VisitStatus.COMPLETE
    )
}
export const ifDayCanEdit = (day) => {
    const CurDay = moment(day).diff(moment(), 'days')
    return CurDay >= 0
}
export const handleListData = (date, result, employeeData, employeeItemData, setEmployeeItemData, edit) => {
    const plannedTime = result.reduce(
        (a, b) => a + parseFloat(b.PlannedDurationMinutes || 0) + parseFloat(b.PlannedTravelTime || 0),
        0
    )
    const totalPlannedDurMin = result.reduce((a, b) => a + parseFloat(b.PlannedDurationMinutes || 0), 0)
    const plannedDis = result.reduce((a, b) => a + parseFloat(b.Planned_Mileage__c || 0), 0)
    employeeItemData[date] = {
        name: employeeData.name,
        totalHours: plannedTime,
        gpid: employeeData.gpid,
        buid: employeeData.buid,
        persona: result[0]?.RecordTypeName || employeeData.persona,
        totalPlannedDurMin,
        totalVisit: result.filter((a) => a.SubType && a.SubType === VisitType.VISIT).length,
        totalMiles: plannedDis,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        userStatsId: employeeData.userStatsId,
        id: employeeData.id
    }
    setEmployeeItemData(employeeItemData)
    const schMeetingList = result
        .filter((a) => !a.visitList)
        .map((a) => {
            a.Subject = a.name
            a.SubType__c = a.SubType
            a.StartDateTime = a.PlanStartTime
            a.EndDateTime = a.PlanEndTime
            a.Actual_Start_Time__c = a.ActualVisitStartTime
            a.Actual_End_Time__c = a.ActualVisitEndTime
            return a
        })
    const finalData = result
        .filter((a) => a.visitList)
        .reduce((a, b, index) => {
            const vl = a.find((x) => x.vlId === b.visitList)
            b.Subject = b.name
            b.SubType__c = b.SubType
            b.StartDateTime = b.PlanStartTime
            b.EndDateTime = b.PlanEndTime
            b.PlannedVisitStartTime = b.PlanStartTime
            b.Actual_Start_Time__c = b.ActualVisitStartTime
            b.Actual_End_Time__c = b.ActualVisitEndTime
            b.inLocation = b.InLocation === BooleanStr.STR_TRUE
            b.showNew = b.ManagerAdHoc === BooleanStr.STR_TRUE
            b.showNewHollow = b.AdHoc === BooleanStr.STR_TRUE
            b.date = b.VisitDate
            b.id = b.Id
            b.isEdit = itemCanSelected(b) && edit && ifDayCanEdit(b.VisitDate)
            b.select = false
            b.visitDetailRelated = employeeData?.visitDetailRelated || {}
            b.visitDetailRelated.durationMinutes = b.Planned_Duration_Minutes__c
            b.visitDetailRelated.plannedDate = b.Planned_Date__c
            b.visitDetailRelated.pullNum = b.Pull_Number__c
            b.visitDetailRelated.subtype = b.Visit_Subtype__c
            b.visitDetailRelated.takeOrder = b.Take_Order_Flag__c
            b.visitDetailRelated.insDescription = b.InstructionDescription
            b.totalMinus = getTotalMinus(parseFloat(b.PlannedDurationMinutes), parseFloat(b.PlannedTravelTime))
            if (b.SubType === VisitType.VISIT && b.ActualVisitStartTime && !b.ActualVisitEndTime) {
                b.clockTime = getClockTime(b, result)
            }
            if (!vl) {
                return a.concat({
                    title: b.StartTime,
                    footTitle: b.EndTime,
                    punchIn: b.KronosPunchIn,
                    punchOut: b.KronosPunchOut,
                    visitDate: b.VisitDate,
                    vlId: b.visitList,
                    id: index,
                    overTime: false,
                    data: [b]
                })
            }
            vl.data.push(b)
            return a
        }, [])
    if (schMeetingList.length > 0) {
        const vl = finalData[0] || {
            title: '',
            footTitle: '',
            visitDate: '',
            vlId: null,
            overTime: false,
            data: []
        }
        schMeetingList.forEach((meeting) => {
            const findIndex = vl.data
                .concat({
                    ActualVisitEndTime: null,
                    ActualVisitStartTime: null
                })
                .findIndex(
                    (a) =>
                        (meeting.ActualVisitEndTime &&
                            moment(meeting.ActualVisitStartTime) <= moment(a.ActualVisitStartTime)) ||
                        (meeting.ActualVisitEndTime && !a.ActualVisitEndTime) ||
                        (meeting.ActualVisitEndTime && !a.ActualVisitStartTime) ||
                        (!meeting.ActualVisitEndTime && meeting.ActualVisitStartTime && !a.ActualVisitEndTime) ||
                        (!meeting.ActualVisitStartTime && !a.ActualVisitStartTime)
                )
            vl.data.splice(findIndex > -1 ? findIndex : 0, 0, meeting)
        })
    }
    return finalData
}
export const ifDayCanSequence = (day) => {
    const canSeq = moment(day).diff(moment(), 'days')
    return canSeq >= 0
}
export const getOriginData = async (eid, currWeekDays, selDay) => {
    return new Promise((resolve, reject) => {
        const start = currWeekDays[0].fullYearDate
        const end = currWeekDays[currWeekDays.length - 1].fullYearDate
        const date1 = selDay
        Promise.all([
            SoupService.retrieveDataFromSoup(
                'Event',
                {},
                ScheduleQuery.getEmployeeScheduleQuery.f,
                ScheduleQuery.getEmployeeScheduleQuery.queryScheduleMeeting +
                    ` FROM  {Event}
              WHERE  {Event:Visit_List__c} IS NULL AND
              {Event:OwnerId}="${eid}"  AND
              {Event:Manager_Scheduled__c} = '0' AND
              {Event:SubType__c} IS NOT NULL AND
              date(REPLACE({Event:StartDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') >= date("${date1}", 'start of day') AND
              date(REPLACE({Event:StartDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') < date("${date1}", 'start of day', '+1 day')
              ORDER BY VisitList, StartTime NULLS LAST, Finished NULLS LAST, ActualStartTime NULLS LAST, Sequence NULLS LAST, PlannedStartTime DESC
              `
            ),
            SoupService.retrieveDataFromSoup(
                'Visit_List__c',
                {},
                ScheduleQuery.getEmployeeScheduleQuery.merchF,
                `SELECT
              {Visit:Id} AS Id,
              {Visit:VisitorId},
              {Visit:PlaceId},
              {Visit:Pull_Number__c},
              {Visit:Take_Order_Flag__c},
              {Visit:Visit_Subtype__c},
              {Visit:Planned_Date__c},
              {Visit:Planned_Duration_Minutes__c},
              {Visit:InstructionDescription},
              {Visit:Visit_List__c} AS VisitList,
              {Visit_List__c:Start_Date_Time__c} AS StartTime,
              {Visit_List__c:Visit_Date__c} AS VisitDate,
              {Visit_List__c:Status__c} AS VlStatus,
              {Visit_List__c:Total_Planned_Time__c} AS TotalPlannedTime,
              {Visit_List__c:Planned_Mileage__c} AS PlannedMileage,
              {Visit_List__c:End_Date_Time__c} AS EndTime,
              {Visit_List__c:Start_Gap__c} AS StartGap,
              {Visit_List__c:End_Gap__c} AS EndGap,
              {Visit_List__c:Kronos_Punch_In__c},
              {Visit_List__c:Kronos_Punch_Out__c},
              {Visit:ActualVisitStartTime} AS ActualStartTime,
              {Visit:ActualVisitEndTime} AS ActualEndTime,
              {Visit:Actual_Duration_Minutes__c} AS Actual_Duration_Minutes__c,
              {Visit:Check_Out_Location_Flag__c},
              {RetailStore:Id} AS StoreId,
              {RetailStore:AccountId} AS AccountId,
              {RetailStore:Name} AS Name,
              {Visit:ActualVisitEndTime} IS NULL AS Finished,
              {Visit:Sequence__c} AS Sequence,
              {Visit:Status__c} AS Status,
              {RetailStore:Street} AS Street,
              ({RetailStore:City} || ', ' || {RetailStore:State} || ' ' || {RetailStore:PostalCode}) AS Address,
              {RetailStore:Latitude} AS Latitude,
              {RetailStore:Longitude} AS Longitude,
              {RetailStore:Store_Location__c} AS StoreLocation,
              {RetailStore:Account.Phone} AS AccountPhone,
              {RetailStore:Account.Merchandising_Order_Days__c} AS OrderDays,
              {Visit:Ad_Hoc__c} AS AdHoc,
              {Visit:Manager_Ad_Hoc__c} AS ManagerAdHoc,
              {Visit:Planned_Duration_Minutes__c},
              {Visit:Planned_Travel_Time__c},
              {Visit:Planned_Mileage__c},
              (${WorkOrderService.workOrderQuery()}) WorkOrder,
              (${WorkOrderService.completeWorkOrderInOneDayQuery()}) CompletedWorkOrders,
              'Visit' AS SubType,
          {Visit:OwnerId} AS OwnerId,
          {Visit:PlannedVisitStartTime} AS PlannedStartTime,
          {Visit:PlannedVisitEndTime} AS PlannedEndTime,
          null AS Manager_Scheduled,
          {Visit:AMAS_Compliant__c} AS InLocation,
          {Visit:RecordType.DeveloperName} AS RecordTypeName
          FROM {Visit_List__c}
          LEFT JOIN {Visit} ON
          {Visit:Visit_List__c} = {Visit_List__c:Id} AND {Visit:RecordType.DeveloperName} = 'Merchandising'
          JOIN {RetailStore} ON
          {Visit:PlaceId} = {RetailStore:Id}
          AND {Visit:Id} IS NOT NULL
          AND {Visit_List__c:Visit_Date__c} >= date("${start}")
          AND {Visit_List__c:Visit_Date__c} <= date("${end}")
          AND {Visit:Status__c} != 'Planned' AND {Visit:Status__c} != 'Removed'
          AND {Visit:Status__c} != 'Failed'
          WHERE {Visit:VisitorId} = "${eid}"
          AND {Visit_List__c:RecordType.DeveloperName} = 'Daily_Visit_List'
          AND {Visit_List__c:IsRemoved__c} IS NOT TRUE
          OR ({Visit:Route_Group__c} = "${eid}" AND {Visit:VisitorId} IS NULL)
          UNION
          SELECT
            {Event:Id} AS Id,
            null AS VisitorId,
            null AS PlaceId,
            null AS Pull_Number__c,
            null AS Take_Order_Flag__c,
            null AS Visit_Subtype__c,
            null AS Planned_Date__c,
            null AS Planned_Duration_Minutes__c,
            null AS InstructionDescription,
            {Visit_List__c:Id} AS VisitList,
            {Visit_List__c:Start_Date_Time__c} AS StartTime,
            {Visit_List__c:Visit_Date__c} AS VisitDate,
            {Visit_List__c:Status__c} AS VlStatus,
            '0' AS TotalPlannedTime,
            '0' AS PlannedMileage,
            {Visit_List__c:End_Date_Time__c} AS EndTime,
            {Visit_List__c:Start_Gap__c} AS StartGap,
            {Visit_List__c:End_Gap__c} AS EndGap,
            {Visit_List__c:Kronos_Punch_In__c} AS KronosPunchIn,
            {Visit_List__c:Kronos_Punch_Out__c} AS KronosPunchOut,
            {Event:Actual_Start_Time__c} AS ActualStartTime,
            {Event:Actual_End_Time__c} AS ActualEndTime,
            null AS Actual_Duration_Minutes__c,
            null AS Check_Out_Location_Flag__c,
            null AS StoreId,
            null AS AccountId,
            {Event:Subject} AS Name,
            {Event:Actual_End_Time__c} IS NULL AS Finished,
            null AS Sequence,
            null AS Status,
            null AS Street,
            null AS Address,
            null AS Latitude,
            null AS Longitude,
            null AS StoreLocation,
            null AS AccountPhone,
            null AS OrderDays,
            null AS AdHoc,
            null AS ManagerAdHoc,
            null AS Planned_Duration_Minutes__c,
            null AS Planned_Travel_Time__c,
            null AS Planned_Mileage__c,
            0 AS WorkOrder,
            0 AS CompletedWorkOrders,
            {Event:SubType__c} AS SubType,
            {Event:OwnerId} AS OwnerId,
            {Event:StartDateTime} AS PlannedStartTime,
            {Event:EndDateTime} AS PlannedEndTime,
            {Event:Manager_Scheduled__c} AS Manager_Scheduled,
            '0' AS InLocation,
            null AS RecordTypeName
            FROM {Visit_List__c} LEFT JOIN {Event} ON {Visit_List__c:Id} = {Event:Visit_List__c}
            WHERE
            {Event:Id} IS NOT NULL
            AND ({Visit_List__c:Visit_Date__c} >= date("${start}")
            AND {Visit_List__c:Visit_Date__c} <= date("${end}")
            AND {Visit_List__c:OwnerId}= "${eid}"
            AND {Visit_List__c:IsRemoved__c} IS NOT TRUE
            AND {Visit_List__c:RecordType.DeveloperName}='Daily_Visit_List')
            AND {Event:Manager_Scheduled__c} = '0'
            OR ({Event:Visit_List__c} IS NULL AND
              {Event:SubType__c} IS NOT NULL AND
              {Event:OwnerId}="${eid}" AND
              date(REPLACE({Event:StartDateTime}, '+0000', ''), '${
                  CommonParam.userTimeZoneOffset
              }') >= date("${date1}", 'start of day') AND
              date(REPLACE({Event:StartDateTime}, '+0000', ''), '${
                  CommonParam.userTimeZoneOffset
              }') < date("${date1}", 'start of day', '+1 day'))
             ORDER BY VisitList, StartTime NULLS LAST, Finished NULLS LAST, ActualStartTime NULLS LAST, Sequence NULLS LAST, PlannedStartTime DESC
              `
            )
        ])
            .then((values) => {
                if (values.length > 1) {
                    values[1].forEach((v) => {
                        v.storeId = v.storeId || v.PlaceId
                        v.CompletedWorkOrders = v.CompletedWorkOrders || 0
                    })
                    getDeliveryFooter(values[1], date1).then((res: any) => {
                        values[1].forEach((r) => {
                            const v = res.find((val) => val.visitId === r.storeId)
                            if (v) {
                                r.deliveryInfo = v
                            }
                        })
                        const result = [...values[0], ...values[1]]
                        resolve(result)
                    })
                }
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const getWorkScheduleFromLocal = (workSchedule, employeeData) => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'User_Stats__c',
            {},
            [
                'Id',
                'Start_Time__c',
                'Sunday__c',
                'Monday__c',
                'Tuesday__c',
                'Wednesday__c',
                'Thursday__c',
                'Friday__c',
                'Saturday__c',
                'Friday_Start_Time__c',
                'Monday_Start_Time__c',
                'Saturday_Start_Time__c',
                'Sunday_Start_Time__c',
                'Thursday_Start_Time__c',
                'Wednesday_Start_Time__c',
                'User__c',
                'OwnerId',
                'Title',
                'MobilePhone',
                'FT_EMPLYE_FLG_VAL__c'
            ],
            ` SELECT
        {User_Stats__c:Id},
        {User_Stats__c:Start_Time__c},
        {User_Stats__c:Sunday__c},
        {User_Stats__c:Monday__c},
        {User_Stats__c:Tuesday__c},
        {User_Stats__c:Wednesday__c},
        {User_Stats__c:Thursday__c},
        {User_Stats__c:Friday__c},
        {User_Stats__c:Saturday__c},
        {User_Stats__c:Friday_Start_Time__c},
        {User_Stats__c:Monday_Start_Time__c},
        {User_Stats__c:Saturday_Start_Time__c},
        {User_Stats__c:Sunday_Start_Time__c},
        {User_Stats__c:Thursday_Start_Time__c},
        {User_Stats__c:Wednesday_Start_Time__c},
        {User_Stats__c:User__c},
        {User_Stats__c:OwnerId},
        {User:Title},
        {User:MobilePhone},
        {User:FT_EMPLYE_FLG_VAL__c}
        FROM {User_Stats__c}
        JOIN {User} ON {User:Id} = {User_Stats__c:User__c}
        WHERE {User_Stats__c:User__c} = '${employeeData.id}'
        `
        ).then((res) => {
            if (res.length > 0) {
                workSchedule = res[0] || {}
                if (!employeeData.visitDetailRelated) {
                    const user = res[0]
                    employeeData.visitDetailRelated = {
                        id: employeeData.id,
                        name: employeeData.name,
                        userStatsId: employeeData.userStatsId,
                        firstName: employeeData.firstName,
                        lastName: employeeData.lastName,
                        title: user.Title,
                        phone: user.MobilePhone,
                        ftFlag: user.FT_EMPLYE_FLG_VAL__c && user.FT_EMPLYE_FLG_VAL__c.toLocaleLowerCase(),
                        startTime: user.Start_Time__c,
                        workingStatus: getWorkingStatus(user),
                        avatar: employeeData.avatar
                    }
                }
                resolve(workSchedule)
            } else {
                reject('fail')
            }
        })
    })
}
export const isToday = (dayStr) => {
    const todayDate = moment(new Date())
    const listDate = moment(dayStr)
    return todayDate.isSame(listDate, MOMENT_STARTOF.DAY)
}

export const updateCanSequenceListEditStatus = (list, edit) => {
    list.map((item) => {
        if (itemCanSelected(item)) {
            item.isEdit = edit
            item.select = false
        }
        return item
    })
    return list
}

export const SORTABLE_LIST_TIPS = 'tips'
export const GAP_TIME = 'Gap Time'
export const FIVE_MIN_GAP = 5
export const sortCompletedMeetingAndVisitByDate = (dataArr, employeeData) => {
    const completedVisitAndMeeting = []
    const notCompletedVisitAndMeeting = []
    for (const vmItem of dataArr) {
        if (
            vmItem.status === VisitStatus.COMPLETE ||
            vmItem.SubType === MeetingType.SCHEDULED_MEETING ||
            [MerchEventType.MEETING, MerchEventType.LUNCH, MerchEventType.BREAK, MerchEventType.PERSONAL_TIME].includes(
                vmItem.Subject
            )
        ) {
            if (vmItem.SubType === MeetingType.SCHEDULED_MEETING) {
                vmItem.Actual_Start_Time__c = vmItem.ChildActualStartTimeObj[employeeData.id]
            }
            if (!_.isEmpty(vmItem.Actual_Start_Time__c)) {
                completedVisitAndMeeting.push(vmItem)
            } else {
                notCompletedVisitAndMeeting.push(vmItem)
            }
        } else if (vmItem.type !== SORTABLE_LIST_TIPS && vmItem.type !== GAP_TIME) {
            notCompletedVisitAndMeeting.push(vmItem)
        }
    }
    sortArrByParamsASC(completedVisitAndMeeting, 'Actual_Start_Time__c')
    return [...completedVisitAndMeeting, ...notCompletedVisitAndMeeting]
}

// calculate actual travel time between visits
export const calculateActualTravelTime = (visitArray) => {
    visitArray.forEach((visit, index) => {
        if (
            index > 0 &&
            !_.isEmpty(visit.ActualVisitStartTime) &&
            !_.isEmpty(visitArray[index - 1].ActualVisitEndTime)
        ) {
            visit.actualTravelTime =
                moment(visit.ActualVisitStartTime).diff(
                    visitArray[index - 1].ActualVisitEndTime,
                    MOMENT_UNIT.MINUTES
                ) || 0
            visit.showTravelTime = true
        }
    })
}

export const formatTravelTime = (item) => {
    const plannedTravelTime = item.PlannedTravelTime || 0
    /* 
        if actualTravelTime is less than 0, then just show 0, it calculated between visits, 
        could be negative when multiple visits executed in the same store from business
    */
    const actualTravelTime = item.actualTravelTime > 0 ? item.actualTravelTime : 0
    const plannedTravelTimeStr = formatClock({
        hour: Math.floor(plannedTravelTime >= 60 ? plannedTravelTime / 60 : 0),
        min: Math.floor(plannedTravelTime % 60)
    })
    const actualTravelTimeStr = formatClock({
        hour: Math.floor(actualTravelTime >= 60 ? actualTravelTime / 60 : 0),
        min: Math.floor(actualTravelTime % 60)
    })
    return { plannedTravelTime, plannedTravelTimeStr, actualTravelTimeStr }
}

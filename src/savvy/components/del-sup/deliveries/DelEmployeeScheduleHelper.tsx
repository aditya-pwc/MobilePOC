/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-01-05 03:11:27
 * @LastEditTime: 2024-03-11 16:50:23
 * @LastEditors: Yi Li
 */

import moment from 'moment'
import _ from 'lodash'
import ScheduleQuery from '../../../queries/ScheduleQuery'
import { SoupService } from '../../../service/SoupService'
import { t } from '../../../../common/i18n/t'
import { isTrueInDB } from '../../../utils/CommonUtils'
import { CommonParam } from '../../../../common/CommonParam'
import { getIdClause } from '../../manager/helper/MerchManagerHelper'
import { restDataCommonCall } from '../../../api/SyncUtils'
import { sortByDateFieldAscNullAsLast } from '../../sales/my-day/MydayHelper'
import { assignOverTime } from '../../MyDay/SalesMyDayHelper'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { MOMENT_UNIT } from '../../../../common/enums/MomentUnit'
import { exeAsyncFunc } from '../../../../common/utils/CommonUtils'

export const noTimeValue = 'N/A'

export const getUserStatus = (visitDate, visitTime, workSchedule) => {
    const dddd = moment(visitTime).format('dddd')
    const workDay = workSchedule[`${dddd}__c`]

    if (isTrueInDB(workDay)) {
        const workTime = (visitDate + ' ' + workSchedule.Start_Time__c).replace('.000Z', '')
        const standardGap = parseInt(t.labels.PBNA_MOBILE_OVER_TIME) || 5
        const timeGap = moment(visitTime).diff(moment(workTime), 'minute')
        return timeGap > standardGap
    }
    return false
}

// Actual Tab: Order visits based on ActualVisitStartTime
export const orderActualVisitList = (list: any[]) => {
    const actualData = _.cloneDeep(list)
    actualData.forEach((item) => {
        item.data.sort((a, b) => {
            if (a.ActualVisitStartTime === null && b.ActualVisitStartTime === null) {
                return a.sequence - b.sequence
            }
            return sortByDateFieldAscNullAsLast(a, b, 'ActualVisitStartTime')
        })
    })
    actualData.forEach((item) => {
        item.data.forEach((visit: any, index: number) => {
            visit.actualSequence = index + 1
        })
    })
    return actualData
}

// Planned Tab: Order visits based on Sequence__c
export const orderPlannedVisitList = (list: any[]) => {
    const plannedData = _.cloneDeep(list)
    plannedData.forEach((item) => {
        item.data.sort((a, b) => {
            return a.sequence - b.sequence
        })
    })
    return plannedData
}

export const handleListData = (result, workSchedule) => {
    const groupData = _.groupBy(result, 'visitList')
    const finalData: any = []

    for (const key in groupData) {
        const { first, overTime } = assignOverTime(groupData, key, workSchedule, finalData)
        const calculateOutTime = first.ManifestOut ? first.ManifestOut : first.GateCheckOut
        const calculateInTime = first.ManifestIn ? first.ManifestIn : first.GateCheckIn
        const fenceIn =
            calculateInTime && first.EndTime
                ? Math.round(moment(first.EndTime).diff(moment(calculateInTime), MOMENT_UNIT.MINUTES, true))
                : noTimeValue
        const fenceOut =
            calculateOutTime && first.StartTime
                ? Math.round(moment(calculateOutTime).diff(moment(first.StartTime), MOMENT_UNIT.MINUTES, true))
                : noTimeValue
        const newItem = {
            title: first.StartTime ? first.StartTime : first.GateCheckOut,
            footTitle: first.EndTime ? first.EndTime : first.GateCheckIn,
            visitDate: first.VisitDate,
            vlId: first.visitList,
            overTime,
            data: groupData[key],
            notHaveStartTime: _.isEmpty(first.StartTime),
            notHaveEndTime: _.isEmpty(first.EndTime),
            gateCheckIn: first.GateCheckIn || null,
            gateCheckOut: first.GateCheckOut || null,
            manifestStartTime: first.ManifestOut || null,
            manifestEndTime: first.ManifestIn || null,
            fenceIn,
            fenceOut,
            status: first.VlStatus
        }
        finalData.push(newItem)
    }
    finalData.sort((a, b) => sortByDateFieldAscNullAsLast(a?.data?.[0], b?.data?.[0], 'ActualVisitStartTime'))
    finalData.forEach((item: any, index: number) => {
        item.indexSection = index
        const secondVLOutTime = item.manifestStartTime ? item.manifestStartTime : item.gateCheckOut
        if (index > 0) {
            const lastVLInTime = finalData[index - 1].manifestEndTime
                ? finalData[index - 1].manifestEndTime
                : finalData[index - 1].gateCheckIn
            item.optTimeBetweenVL =
                lastVLInTime && secondVLOutTime
                    ? Math.round(moment(secondVLOutTime).diff(moment(lastVLInTime), MOMENT_UNIT.MINUTES, true))
                    : noTimeValue
        }
    })
    return finalData
}

export const orderSumQuery = (property: string, hasFilter?: boolean) => {
    const shipmentTableQ = hasFilter ? ' LEFT JOIN {Shipment} ON {Shipment:Order_Id__c} = {Order:Ordr_Id__c}' : ''
    const shipmentFiled = hasFilter ? ' AND {Shipment:Id} IS NOT NULL' : ''
    return `
    SELECT COALESCE(SUM({Order:${property}}), 0) 
    FROM {Order}
    ${shipmentTableQ}
    WHERE {RetailStore:Id} = {Order:RetailStore__c}
    AND date(REPLACE({Order:Dlvry_Rqstd_Dtm__c}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') = {Visit:Planned_Date__c}
    ${shipmentFiled} 
    `
}

export const orderOffScheduleSumQuery = () => `
    SELECT COUNT({Order:Id})
    FROM {Order}
    WHERE {RetailStore:Id} = {Order:RetailStore__c}
    AND {Order:Off_Schedule__c} = true
    AND date(REPLACE({Order:Dlvry_Rqstd_Dtm__c}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') = {Visit:Planned_Date__c}
    `

export const shipmentSumQuery = (property: string) => {
    return `
    SELECT COALESCE(SUM({Shipment:${property}}), 0)  
    FROM {Order}
    LEFT JOIN {Shipment} ON {Shipment:Order_Id__c} = {Order:Ordr_Id__c}
    WHERE {Order:RetailStore__c} = {RetailStore:Id}
    AND (
        date(REPLACE({Order:Dlvry_Rqstd_Dtm__c}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') = {Visit:Planned_Date__c}
        OR 
        date(REPLACE({Shipment:ActualDeliveryDate}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') = {Visit:Planned_Date__c}
        )
    `
}

export const visitRelatedShipmentSumQuery = () => {
    return `
    SELECT COUNT({Shipment:Id})
    FROM {Shipment}
    WHERE {Shipment:Visit__c} = {Visit:Id}
    `
}

export const getOrderData = async (visitArr) => {
    const visitIds = _.cloneDeep(visitArr).map((visit) => visit.Id)
    if (_.isEmpty(visitIds)) {
        return []
    }
    return await SoupService.retrieveDataFromSoup('Order', {}, [], null, [
        ` WHERE {Order:Visit__c} IN (${getIdClause(visitIds)})`
    ])
}

export const getGeoFenceData = async (visitArr, startDay, endDay) => {
    const Ids = visitArr.map((visit) => visit.storeId)
    const userId = visitArr[0].uid
    if (_.isEmpty(userId)) {
        return []
    }
    const queryString = `SELECT Id, Customer__c, Geofence_Direction__c, Time__c, Visit__c, User__c, Visit_List__c FROM Breadcrumb_Timestamps__c
        WHERE Customer__c IN (${getIdClause(Ids)})
        AND Geofence_Direction__c = 'IN'
        AND User__c = '${userId}'
        AND Time__c >= ${moment(startDay).toISOString()}
        AND Time__c <= ${moment(endDay).toISOString()}`
    const path = `query/?q=${queryString}`
    const geoFenceVal = await restDataCommonCall(path, 'GET')
    return geoFenceVal?.data?.records || []
}

export const getGeoFenceDataInDeliver = async (visitArr, startDay) => {
    const endAddOneDay = moment(startDay).clone().add(1, 'days').format('YYYY-MM-DD')
    const Ids = visitArr.map((visit) => visit.storeId)
    const userIds = visitArr.map((visit) => visit.UserId || visit.OwnerId)
    const uniqIds: Array<string> = _.uniq(userIds)
    const queryString = `SELECT Id, Customer__c, Geofence_Direction__c, Time__c, Visit__c, User__c, Visit_List__c FROM Breadcrumb_Timestamps__c
        WHERE Customer__c IN (${getIdClause(Ids)})
        AND Geofence_Direction__c = 'IN'
        AND User__c IN (${getIdClause(uniqIds)})
        AND Time__c >= ${moment(startDay).toISOString()}
        AND Time__c <= ${moment(endAddOneDay).toISOString()}`
    const path = `query/?q=${queryString}`
    const geoFenceVal = await restDataCommonCall(path, 'GET')
    return geoFenceVal?.data?.records || []
}

export const getOriginData = (eid, currWeekDays, dvlRecordTypeId, dvRecordTypeId, loadNum) => {
    return new Promise<any>((resolve, reject) => {
        const start = currWeekDays[0].fullYearDate
        const end = currWeekDays[currWeekDays.length - 1].fullYearDate
        const employeeQuery = _.cloneDeep(ScheduleQuery.getEmployeeScheduleQuery.deliveryF)
        employeeQuery.splice(-1, 0, 'inLocation', 'schCs', 'actCs', 'schPlt', 'delPlt', 'uid')
        let visitListLoadNumCond = ''
        if (!eid && loadNum !== '-') {
            visitListLoadNumCond = ` AND {Visit_List__c:Load_Number__c} = "${loadNum}"`
        }

        const query =
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
        {Visit_List__c:Gate_Check_Out__c} AS GateCheckOut,
        {Visit_List__c:Gate_Check_In__c} AS GateCheckIn,
        {Visit_List__c:Manifest_Fence_Check_Out__c} AS ManifestOut,
        {Visit_List__c:Manifest_Fence_Check_In__c} AS ManifestIn,
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
        0 WorkOrder,
        null AS SubType,
        {Visit:OwnerId} AS OwnerId,
        {Visit:PlannedVisitStartTime} AS PlannedStartTime,
        {Visit:PlannedVisitEndTime} AS PlannedEndTime,
        null AS Manager_Scheduled,
        {Visit:Check_In_Location_Flag__c} AS InLocation,
        {Visit:RecordType.DeveloperName} AS RecordTypeName,
        ({Visit:Check_In_Location_Flag__c} = '1') AS inLocation,
        (${orderSumQuery('Total_Ordered_IntCount__c')}) schCs,
        (${shipmentSumQuery('Total_Delivered__c')}) actCs,
        (${orderSumQuery('Pallet_Total_IntCount__c')}) schPlt,
        (${orderSumQuery('Pallet_Total_IntCount__c', true)}) delPlt,
        {User:Id}
        FROM {Visit_List__c}
        LEFT JOIN {Visit} ON
        {Visit:Visit_List__c} = {Visit_List__c:Id}
        LEFT JOIN {User} ON
        {Visit:VisitorId} = {User:Id}
        JOIN {RetailStore} ON
        {Visit:PlaceId} = {RetailStore:Id}
        AND {Visit:Id} IS NOT NULL
        AND {Visit_List__c:Visit_Date__c} >= date("${start}")
        AND {Visit_List__c:Visit_Date__c} <= date("${end}")
        AND {Visit_List__c:RecordTypeId} = '${dvlRecordTypeId}'
        ${visitListLoadNumCond}
        WHERE {Visit:Status__c} != 'Planned' AND {Visit:Status__c} != 'Removed' AND {Visit:Status__c} != 'Failed'
        AND {Visit:RecordTypeId} = '${dvRecordTypeId}'
        ` +
            (eid ? `AND {Visit:VisitorId} = "${eid}"` : 'AND {User:Id} IS NULL') +
            `
        ORDER BY VisitList, Sequence ASC NULLS LAST
        `
        SoupService.retrieveDataFromSoup('Visit_List__c', {}, employeeQuery, query)
            .then((values) => {
                if (values.length > 0) {
                    let geoFenceData = []
                    exeAsyncFunc(async () => {
                        geoFenceData = await getGeoFenceData(values, start, end)
                    }).then(() => {
                        resolve({
                            visitData: values || [],
                            geoFenceData
                        })
                    })
                } else {
                    resolve({
                        visitData: [],
                        geoFenceData: []
                    })
                }
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const getWeekDataAndSelectDay = (obj, currWeekDays, selDay, monthWeekFilter) => {
    const tempW = {}
    let flg = true

    currWeekDays.forEach((item) => {
        const day = item.fullYearDate
        const dayArr = obj[day] || []

        tempW[day] = { sel: false, abled: dayArr.length > 0, fullSel: false }
        if (obj[day] && flg && !obj[selDay] && moment(day) > moment(selDay)) {
            selDay = day
            flg = false
        }
    })

    if (!tempW[selDay]?.abled) {
        Object.keys(tempW).forEach((day) => {
            if (flg && tempW[day].abled) {
                selDay = day
                flg = false
            }
        })
    }

    const daySelIndex = moment(selDay).day()
    monthWeekFilter.current?.selectDay(daySelIndex)
    return tempW
}

export const setDayAndWeek = (manager, route, selDay, currWeekDays, getWeekLabelArrObj) => {
    const day = manager?.selectedDate || route?.params?.reloadDate || moment()
    const tempSelDay = day.format(TIME_FORMAT.Y_MM_DD)
    if (!currWeekDays || currWeekDays.length === 0) {
        const weekLabelArrObj = getWeekLabelArrObj()
        currWeekDays = weekLabelArrObj.tempWeekArr
    }
    return { selDay: tempSelDay || selDay, currWeekDays }
}

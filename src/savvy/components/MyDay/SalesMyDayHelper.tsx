/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-08-11 01:09:51
 * @LastEditTime: 2023-07-18 10:59:38
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 */

import _ from 'lodash'
import moment from 'moment'
import { restDataCommonCall } from '../../api/SyncUtils'
import { CommonParam } from '../../../common/CommonParam'
import { Log } from '../../../common/enums/Log'
import { isPersonaPSR, Persona } from '../../../common/enums/Persona'
import { RecordTypeEnum, VisitListRecordTypeEnum } from '../../enums/RecordType'
import { VisitStatus } from '../../enums/Visit'
import { t } from '../../../common/i18n/t'
import ScheduleQuery from '../../queries/ScheduleQuery'
import { SoupService } from '../../service/SoupService'
import { getRecordTypeIdByDeveloperName } from '../../utils/CommonUtils'
import { getStringValue } from '../../utils/LandingUtils'
import { setLoggedInUserTimezone } from '../../utils/TimeZoneUtils'
import { getGeoFenceData, getOrderData, getUserStatus } from '../del-sup/deliveries/DelEmployeeScheduleHelper'
import { getIdClause } from '../manager/helper/MerchManagerHelper'
import { calculateActualTravelTime } from '../manager/schedule/EmployeeScheduleListHelper'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { exeAsyncFunc } from '../../../common/utils/CommonUtils'

export const getWorkScheduleFromLocal = (employeeData) => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup('User_Stats__c', {}, [], null, [
            ` WHERE {User_Stats__c:User__c} = '${employeeData.Id}'`
        ])
            .then((res) => {
                if (res.length > 0) {
                    resolve(res[0] || {})
                }
                resolve({})
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const getOrderLabel = (visit, order) => {
    if (CommonParam.PERSONA__c === Persona.PSR) {
        return t.labels.PBNA_MOBILE_ORDER
    }
    setLoggedInUserTimezone()
    const orderDays = !_.isEmpty(visit.OrderDays) ? visit.OrderDays.split(';') : []
    const isOrderDay = orderDays.includes(moment(visit.Planned_Date__c).format('dddd'))
    if (isOrderDay && visit.status === VisitStatus.COMPLETE && _.isEmpty(order)) {
        return t.labels.PBNA_MOBILE_ORDER_MISSED
    }
    if (isOrderDay && !_.isEmpty(order)) {
        return t.labels.PBNA_MOBILE_ORDER_TAKEN
    }
    if (!isOrderDay && !_.isEmpty(order)) {
        return t.labels.PBNA_MOBILE_ORDER_OFF_SCHEDULE
    }
    return t.labels.PBNA_MOBILE_ORDER
}

const mergeSalesAndMerchVisits = (visitArray: any[], orderData: any[]) => {
    const visitsToBeDelete = []

    for (const item of visitArray) {
        let pills = []

        if (!visitsToBeDelete.includes(item.Id)) {
            if (item.RecordTypeName === RecordTypeEnum.SALES) {
                const tempVisits = visitArray.filter((vis) => {
                    return (
                        vis.Id !== item.Id &&
                        vis.RecordTypeName === RecordTypeEnum.MERCHANDISING &&
                        item.PlaceId === vis.PlaceId
                    )
                })
                const orderLabel = getOrderLabel(
                    item,
                    orderData.filter((order) => order.Visit__c === item.Id)
                )
                if (tempVisits.length > 0) {
                    visitsToBeDelete.push(...tempVisits.map((tempI) => tempI.Id))
                    pills = [orderLabel, t.labels.PBNA_MOBILE_MERCH]
                } else {
                    pills = [orderLabel]
                }
            }

            if (item.RecordTypeName === RecordTypeEnum.MERCHANDISING) {
                pills = [t.labels.PBNA_MOBILE_MERCH]
            }
            item.pills = pills
        }
    }

    return visitArray.filter((item) => !visitsToBeDelete.includes(item.Id))
}

export const assignOverTime = (groupData, key, workSchedule, finalData) => {
    const first = groupData[key][0] || {}
    let overTime

    const titleStr = first.StartTime || ''
    if (titleStr.indexOf('+000') > -1) {
        const timeStr = titleStr.replace('+000', '')
        const hasIcon = getUserStatus(first.VisitDate, timeStr, workSchedule)
        overTime = hasIcon && finalData.length === 0
    }
    return { first, overTime }
}

const handleListData = (result, workSchedule, orderData) => {
    const temp = mergeSalesAndMerchVisits(result, orderData)
    const groupData = _.groupBy(temp, 'visitList')
    const finalData = []

    for (const key in groupData) {
        if (Object.prototype.hasOwnProperty.call(groupData, key)) {
            const { first, overTime } = assignOverTime(groupData, key, workSchedule, finalData)

            const visitArray = groupData[key]
            calculateActualTravelTime(visitArray)
            const newItem = {
                title: first.StartTime,
                footTitle: first.EndTime,
                punchIn: first.punchIn,
                punchOut: first.punchOut,
                visitDate: first.VisitDate,
                vlId: first.visitList,
                overTime,
                indexSection: finalData.length,
                data: visitArray
            }
            finalData.push(newItem)
        }
    }
    return finalData
}

const getOriginData = (eid, currWeekDays, svlRecordTypeId, mvlRecordTypeId, routeIds?) => {
    return new Promise<any>((resolve, reject) => {
        const start = currWeekDays[0].fullYearDate
        const end = currWeekDays[currWeekDays.length - 1].fullYearDate
        const retailStoreCondition = isPersonaPSR()
            ? ''
            : `AND {RetailStore:Account.LOC_PROD_ID__c} = '${CommonParam.userLocationId}'`
        const employeeQuery = ScheduleQuery.getEmployeeScheduleQuery.salesF
        let routeOrUserCond = eid ? `AND {Visit:VisitorId} = "${eid}"` : 'AND {User:Id} IS NULL'
        if (isPersonaPSR()) {
            routeOrUserCond = ''
        }
        let routeIdCond = ''
        if (!_.isEmpty(routeIds)) {
            if (_.isArray(routeIds)) {
                routeIdCond = ` AND {Visit:RTE_ID__c} IN (${getIdClause(routeIds)})`
            } else {
                routeIdCond = ` AND {Visit:RTE_ID__c} = "${routeIds}"`
            }
        }
        const specialQuery = isPersonaPSR()
            ? `AND ((RecordTypeName = '${RecordTypeEnum.MERCHANDISING}' AND {Visit:VisitorId} = '${eid}') OR (RecordTypeName = '${RecordTypeEnum.SALES}' AND {Visit:RTE_ID__c} = '${CommonParam.userRouteId}'))`
            : `AND ((RecordTypeName = '${RecordTypeEnum.SALES}'${routeIdCond}) OR RecordTypeName = '${RecordTypeEnum.MERCHANDISING}')`
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
        0 WorkOrder,
        null AS SubType,
        {Visit:OwnerId} AS OwnerId,
        {Visit:PlannedVisitStartTime} AS PlannedStartTime,
        {Visit:PlannedVisitEndTime} AS PlannedEndTime,
        null AS Manager_Scheduled,
        {Visit:Check_In_Location_Flag__c} AS InLocation,
        ({Visit:Check_In_Location_Flag__c} = '1') AS inLocation,
        {Visit:RecordType.DeveloperName} AS RecordTypeName,
        {User:Id}
        FROM {Visit_List__c}
        LEFT JOIN {Visit} ON
        {Visit:Visit_List__c} = {Visit_List__c:Id}
        LEFT JOIN {User} ON
        {Visit:VisitorId} = {User:Id}
        JOIN {RetailStore} ON
        {Visit:PlaceId} = {RetailStore:Id} 
        ${retailStoreCondition}
        AND {Visit:Id} IS NOT NULL
        AND {Visit_List__c:Visit_Date__c} >= date("${start}")
        AND {Visit_List__c:Visit_Date__c} <= date("${end}")
        AND {Visit_List__c:RecordTypeId} IN ('${svlRecordTypeId}' , '${mvlRecordTypeId}')
        WHERE {Visit:Status__c} != 'Planned' AND {Visit:Status__c} != 'Removed' AND {Visit:Status__c} != 'Failed'
        ` +
            routeOrUserCond +
            `
        ${specialQuery} 
        ORDER BY StartTime NULLS LAST, Finished NULLS LAST, ActualStartTime NULLS LAST, ManagerAdHoc ASC, Sequence NULLS LAST, PlannedStartTime DESC, Name ASC
        `

        SoupService.retrieveDataFromSoup('Visit_List__c', {}, employeeQuery, query)
            .then((values) => {
                if (values.length > 0) {
                    let geoFenceData = []
                    let orderData = []
                    exeAsyncFunc(async () => {
                        geoFenceData = await getGeoFenceData(values, start, end)
                    }).then(() => {
                        exeAsyncFunc(async () => {
                            orderData = await getOrderData(values)
                        }).then(() => {
                            resolve({
                                visitData: values || [],
                                geoFenceData,
                                orderData
                            })
                        })
                    })
                } else {
                    resolve({
                        visitData: [],
                        geoFenceData: [],
                        orderData: []
                    })
                }
            })
            .catch((err) => {
                reject(err)
            })
    })
}

const handleOriginData = async (data, workSchedule, orderData) => {
    const obj: {} = _.groupBy(data, 'VisitDate')
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const element = obj[key] || []
            obj[key] = handleListData(element, workSchedule, orderData)
        }
    }

    return obj
}

export const getSalesMyDayData = async (employeeId, weekDay, workSchedule, routeIds?) => {
    const svlRecordTypeId = await getRecordTypeIdByDeveloperName(
        VisitListRecordTypeEnum.SalesDailyVisitList,
        'Visit_List__c'
    )
    const mvlRecordTypeId = await getRecordTypeIdByDeveloperName(
        VisitListRecordTypeEnum.MerchDailyVisitList,
        'Visit_List__c'
    )

    const res = await getOriginData(employeeId, weekDay, svlRecordTypeId, mvlRecordTypeId, routeIds)
    return {
        geoFenceData: res.geoFenceData,
        obj: await handleOriginData(res.visitData, workSchedule, res.orderData)
    }
}

export const fetchSalesVisitsBreadcrumb = async (userIds: Array<string>, date: string) => {
    try {
        const chunkIdArr = _.chunk(userIds, 200)
        const breadcrumbRecords: Array<string> = []
        const promiseRequests = []
        for (const idArr of chunkIdArr) {
            const queryString = `SELECT Id, User__c, Customer__c, Time__c FROM Breadcrumb_Timestamps__c
                WHERE User__c IN (${getIdClause(idArr)})
                AND Function__c = 'Sales'
                AND Time__c>=${moment(date).subtract(1, 'day').toISOString()} AND Time__c<=${moment(date)
                .add(1, 'day')
                .toISOString()}`
            const path = `query/?q=${queryString}`
            promiseRequests.push(restDataCommonCall(path, 'GET'))
        }
        const resArr = await Promise.all(promiseRequests)
        for (const res of resArr) {
            breadcrumbRecords.push(...(res?.data?.records || []))
        }
        return breadcrumbRecords
    } catch (err) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'SDL-fetchSalesVisitsBreadcrumb',
            `failed to fetch breadcrumb timestamps for sales visits: ${getStringValue(err)}`
        )
        return []
    }
}

/* eslint-disable camelcase */

/*
 * @Description: DeliveryTimelineService
 * @Author: Mary Qian
 * @Date: 2021-08-11 02:20:26
 * @LastEditTime: 2022-03-24 20:56:54
 * @LastEditors: Aimee Zhang
 */

import _ from 'lodash'
import moment from 'moment'
import { restDataCommonCall } from '../api/SyncUtils'
import { getStartAndEndTimeForBreadcrumbRecord } from '../components/manager/schedule/GeofenceBarHelper'
import { TimelineDataProps } from '../components/manager/schedule/VisitTimelineItem'
import { RANGE_TYPE } from '../enums/MerchandiserEnums'
import { isDelSupTab, isSDLTab } from '../../common/enums/Persona'
import { ShipmentStatus, VisitStatus } from '../enums/Visit'
import { t } from '../../common/i18n/t'
import { SoupService } from './SoupService'
import { getEmptyTimelineData, VisitForTimelineProps } from './VisitTimelineService'

export interface DeliveryForTimelineProps extends VisitForTimelineProps {
    brStartTime: string
    brEndTime: string
    storeId: string
    accountId: string
}

const getVisitObjById = async (visitId: string) => {
    const configuration = await SoupService.retrieveDataFromSoup('Time_Interval_Configuration__mdt', {}, [], null)
    const result = await SoupService.retrieveDataFromSoup(
        'Visit',
        {},
        [
            'Id',
            'OwnerId',
            'PlaceId',
            'Planned_Date__c',
            'VisitorId',
            'ActualVisitStartTime',
            'ActualVisitEndTime',
            'Status__c',
            'AccountId'
        ],
        `SELECT
        {Visit:Id},
        {Visit:OwnerId},
        {Visit:PlaceId},
        {Visit:Planned_Date__c},
        {Visit:VisitorId},
        {Visit:ActualVisitStartTime},
        {Visit:ActualVisitEndTime},
        {Visit:Status__c},
        {RetailStore:AccountId}
        FROM {Visit} LEFT JOIN {RetailStore} ON
        {Visit:PlaceId} = {RetailStore:Id}
        WHERE {Visit:Id} = '${visitId}'
        `
    )

    if (result.length > 0) {
        const visit = result[0]
        const {
            ActualVisitStartTime,
            ActualVisitEndTime,
            Id,
            OwnerId,
            PlaceId,
            Planned_Date__c,
            VisitorId,
            AccountId
        } = visit

        const recordTimeData = getStartAndEndTimeForBreadcrumbRecord(visit, configuration)
        const startTime = recordTimeData.startTime
        const endTime = recordTimeData.endTime
        if (!VisitorId) {
            return
        }
        const queryString = `SELECT Id, Geofence_Direction__c, Time__c, Visit__c, User__c FROM Breadcrumb_Timestamps__c
                WHERE Customer__c='${PlaceId}' AND User__c='${VisitorId}'
                AND Time__c >= ${startTime.toISOString()} AND Time__c <= ${endTime.toISOString()} ORDER BY Time__c ASC`

        const resultArr = await restDataCommonCall(`query/?q=${queryString}`, 'GET')
        const breadcrumbs = resultArr?.data?.records
        if (!breadcrumbs) {
            return
        }

        const beforeBreadcrumbs = breadcrumbs.filter((item) => moment(item.Time__c) < moment(ActualVisitStartTime))
        const afterBreadcrumbs = breadcrumbs.filter((item) => moment(item.Time__c) > moment(ActualVisitStartTime))
        const beforeItem: any = _.last(beforeBreadcrumbs) || {}
        const afterItem: any = _.last(afterBreadcrumbs) || {}

        const checkInLocation = beforeItem?.Geofence_Direction__c === RANGE_TYPE.IN
        let checkOutLocation = false
        if (afterItem?.Geofence_Direction__c === RANGE_TYPE.OUT) {
            checkOutLocation = afterItem?.Geofence_Direction__c === RANGE_TYPE.OUT
        }

        const userCondition = [`WHERE {User:Id} = '${VisitorId}'`]
        const userResult = await SoupService.retrieveDataFromSoup('User', {}, [], null, userCondition)
        const userName = userResult[0]?.Name || ''

        return {
            Id,
            status: visit.Status__c,
            OwnerId,
            startTime: Planned_Date__c,
            date: Planned_Date__c,
            Planned_Date__c,
            inLocation: checkInLocation,
            UserName: userName,
            Check_Out_Location_Flag__c: checkOutLocation,
            ActualVisitStartTime,
            ActualVisitEndTime,
            brStartTime: beforeItem.Time__c,
            brEndTime: checkOutLocation ? afterItem.Time__c : undefined,
            storeId: PlaceId,
            visitDetailRelated: { name: userName },
            accountId: AccountId
        }
    }

    return null
}

const getMerchName = (visit: DeliveryForTimelineProps) => {
    return visit.UserName || visit.visitDetailRelated?.name || ''
}

const isClosedShipment = (wo: any) => {
    return wo.Status === ShipmentStatus.CLOSED
}

const formatShipmentData = (visit: DeliveryForTimelineProps, item, time, isClosed): TimelineDataProps => {
    const msg = isClosed
        ? ` ${t.labels.PBNA_MOBILE_COMPLETED_INVOICE}`
        : ` ${t.labels.PBNA_MOBILE_NOT_COMPLETED_INVOICE}`
    return {
        id: item.Id,
        time,
        isRed: !isClosed,
        merchName: getMerchName(visit),
        message: msg
    }
}

const formatOrderData = (visit: DeliveryForTimelineProps, item): TimelineDataProps => {
    return {
        id: item.Id,
        time: item.Ordr_Rcvd__c,
        merchName: getMerchName(visit),
        message: ` ${t.labels.PBNA_MOBILE_WROTE_ORDER}`
    }
}

const formatEndVisitData = (visit: DeliveryForTimelineProps, isFromSDLVisitDetail): TimelineDataProps => {
    const { ActualVisitEndTime, brEndTime } = visit
    const msg =
        isSDLTab() || isFromSDLVisitDetail ? ` ${t.labels.PBNA_MOBILE_ENDED_VISIT}` : ` ${t.labels.PBNA_MOBILE_END_DEL}`
    let flag = false

    if (ActualVisitEndTime > brEndTime || brEndTime === undefined) {
        flag = true
    }
    return {
        id: ActualVisitEndTime,
        time: ActualVisitEndTime,
        merchName: getMerchName(visit),
        message: msg,
        hideBottomLine: flag
    }
}

const formatCheckOutData = (visit: DeliveryForTimelineProps): TimelineDataProps => {
    const { ActualVisitEndTime, brEndTime } = visit
    let checkOutFlag = visit.Check_Out_Location_Flag__c
    let flag = false

    if (ActualVisitEndTime < brEndTime) {
        flag = true
    }
    if (ActualVisitEndTime > brEndTime) {
        checkOutFlag = false
    }

    return {
        id: brEndTime,
        time: brEndTime,
        isRed: !checkOutFlag,
        merchName: getMerchName(visit),
        message: `  ${t.labels.PBNA_MOBILE_CHECK_OUT}`,
        hideBottomLine: flag
    }
}

const prepareShipmentData = async (visit: DeliveryForTimelineProps): Promise<TimelineDataProps[]> => {
    const queryString = `SELECT Id, ActualDeliveryDate, Status FROM Shipment
    WHERE (Status='Closed' or Status='Open') AND Visit__c ='${visit.Id}' ORDER BY ActualDeliveryDate ASC`

    const resultArr = await restDataCommonCall(`query/?q=${queryString}`, 'GET')
    const res = resultArr?.data?.records
    if (!res) {
        return []
    }

    const dataList = []
    res.forEach((item) => {
        if (isClosedShipment(item)) {
            const shipmentData = formatShipmentData(visit, item, item.ActualDeliveryDate, true)
            dataList.push(shipmentData)
        }
    })

    if (visit.status === VisitStatus.COMPLETE) {
        res.forEach((item) => {
            if (!isClosedShipment(item)) {
                const shipmentData = formatShipmentData(visit, item, visit.ActualVisitEndTime, false)
                dataList.push(shipmentData)
            }
        })
    }

    return dataList
}

const prepareOrderData = async (visit: DeliveryForTimelineProps): Promise<TimelineDataProps[]> => {
    const queryString = `SELECT Id, Ordr_Rcvd__c, Visit__c FROM Order 
        WHERE Visit__c = '${visit.Id}' ORDER BY Ordr_Rcvd__c ASC`

    const resultArr = await restDataCommonCall(`query/?q=${queryString}`, 'GET')
    const res = resultArr?.data?.records
    if (!res) {
        return []
    }
    const dataList = []
    res.forEach((item) => {
        const shipmentData = formatOrderData(visit, item)
        dataList.push(shipmentData)
    })

    return dataList
}

const prepareLocationDeliveryData = (visit: DeliveryForTimelineProps): TimelineDataProps => {
    const { inLocation, brStartTime } = visit

    return {
        id: brStartTime,
        time: brStartTime,
        isRed: !inLocation,
        merchName: getMerchName(visit),
        message: `  ${t.labels.PBNA_MOBILE_CHECK_IN}`,
        hideTopLine: true
    }
}

const prepareStartVisitDeliveryData = (visit: DeliveryForTimelineProps, isFromSDLVisitDetail): TimelineDataProps => {
    const { ActualVisitStartTime, inLocation } = visit
    const msg =
        isSDLTab() || isFromSDLVisitDetail
            ? ` ${t.labels.PBNA_MOBILE_STARTED_VISIT}`
            : ` ${t.labels.PBNA_MOBILE_START_DEL}`

    return {
        id: ActualVisitStartTime,
        time: ActualVisitStartTime,
        isRed: !inLocation,
        merchName: getMerchName(visit),
        message: msg,
        hideTopLine: !inLocation
    }
}

const prepareVisit = async (vis: DeliveryForTimelineProps, isFromSDLVisitDetail: boolean) => {
    const visit = await getVisitObjById(vis.Id)
    if (!visit) {
        return []
    }

    const status = visit.status

    let list = []
    if (status === VisitStatus.PUBLISH) {
        list.push(getEmptyTimelineData(vis, true))
        list.push(getEmptyTimelineData(vis, false))
        return list
    }

    if (visit.inLocation) {
        list.push(prepareLocationDeliveryData(visit))
    }
    list.push(prepareStartVisitDeliveryData(visit, isFromSDLVisitDetail))

    if (isSDLTab() || isFromSDLVisitDetail) {
        const orderData = await prepareOrderData(visit)
        list = list.concat(_.sortBy(orderData, ['time']))
    }

    if (isDelSupTab()) {
        const shipmentData = await prepareShipmentData(visit)
        list = list.concat(_.sortBy(shipmentData, ['time']))
    }

    if (visit.ActualVisitEndTime) {
        if (!visit.Check_Out_Location_Flag__c) {
            list.push(formatEndVisitData(visit, isFromSDLVisitDetail))
        } else {
            if (visit.ActualVisitEndTime > visit.brEndTime) {
                list.push(formatCheckOutData(visit))
                list.push(formatEndVisitData(visit, isFromSDLVisitDetail))
            } else {
                list.push(formatEndVisitData(visit, isFromSDLVisitDetail))
                list.push(formatCheckOutData(visit))
            }
        }
    } else {
        list.push(getEmptyTimelineData(vis, false))
    }

    return list
}

export const DeliveryTimelineService = {
    getVisitObjById,
    prepareVisit
}

export default DeliveryTimelineService

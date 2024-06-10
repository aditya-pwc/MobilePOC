/*
 * @Description: GeofenceBarHelper
 * @Author: Yi Li
 * @Date: 2022-01-05 03:12:55
 * @LastEditTime: 2022-07-08 04:03:43
 * @LastEditors: Mary Qian
 */

import _ from 'lodash'
import moment from 'moment'
import { restDataCommonCall } from '../../../api/SyncUtils'
import { CommonParam } from '../../../../common/CommonParam'
import { formatClock } from '../../../common/DateTimeUtils'
import { COLOR_TYPE, ENTRY_TYPE, NUMBER_VALUE, POINT_TYPE } from '../../../enums/MerchandiserEnums'
import { isDelSupTab, isTabDelSupOrSDL, Persona } from '../../../../common/enums/Persona'
import { VisitStatus } from '../../../enums/Visit'
import { SoupService } from '../../../service/SoupService'
import { MOMENT_UNIT } from '../../../../common/enums/MomentUnit'
export interface VisitModal {
    Id: string
    // eslint-disable-next-line camelcase
    Status__c: string
    PlaceId: string
    OwnerId: string
    VisitorId: string
    ActualVisitStartTime: string
    ActualVisitEndTime: string
}
export interface PointModal {
    Id: string
    colorType: string
    timePoint: string
    pointType: string
    pointTitle: string
    entryType: string
    timeLength: number
}

export interface ConfigurationModal {
    Id: string
    // eslint-disable-next-line camelcase
    AfterEndTime__c: string
    // eslint-disable-next-line camelcase
    BeforeStartTime__c: string
    // eslint-disable-next-line camelcase
    Persona__c: string
    // eslint-disable-next-line camelcase
    Status__c: string
}

const IN_GEOFENCE = 'IN'
const OUT_GEOFENCE = 'OUT'
const beforeMins = 10
const afterMins = 10

export const getTimeWithNum = (timeNum: number) => {
    let timeResult = ''
    if (timeNum < NUMBER_VALUE.TIME_UNIT) {
        timeResult = timeNum.toString() + ' s'
    } else {
        const d = timeNum / NUMBER_VALUE.TIME_UNIT
        timeResult = formatClock({
            hour: Math.floor(d >= NUMBER_VALUE.TIME_UNIT ? d / NUMBER_VALUE.TIME_UNIT : NUMBER_VALUE.ZERO_NUM),
            min: Math.floor(d % NUMBER_VALUE.TIME_UNIT)
        })
    }
    return timeResult
}

export const isDelInProgress = (visitInfo: VisitModal) => {
    return isTabDelSupOrSDL() && visitInfo.Status__c === VisitStatus.IN_PROGRESS
}

export const showGrayLine = (visitInfo: VisitModal) => {
    const isSDL = isTabDelSupOrSDL()
    return (!isSDL && !visitInfo.ActualVisitEndTime) || (isSDL && !visitInfo.ActualVisitStartTime)
}

export const isDelEndInProgressFlag = (visitInfo: VisitModal, progressItem: PointModal) => {
    return (
        progressItem.pointType === POINT_TYPE.FLAG &&
        isDelInProgress(visitInfo) &&
        progressItem.entryType === ENTRY_TYPE.END
    )
}
const getFirstObject = (arrData) => {
    return arrData.length > 0 ? arrData[0] : {}
}

export const getTimeIntervalConfiguration = (visitInfo: VisitModal, configuration: any[]) => {
    if (isTabDelSupOrSDL()) {
        const filterString = isDelSupTab() ? Persona.DELIVERY_SUPERVISOR : Persona.SALES_DISTRICT_LEADER
        const sdlConfigs = configuration.filter((item) => item.Persona__c === filterString)
        const inProgressConfigs = sdlConfigs.filter((item) => item.Status__c === VisitStatus.IN_PROGRESS)
        const completeConfigs = sdlConfigs.filter((item) => item.Status__c === VisitStatus.COMPLETE)
        return visitInfo.Status__c === VisitStatus.IN_PROGRESS
            ? getFirstObject(inProgressConfigs)
            : getFirstObject(completeConfigs)
    }
    return null
}

export const getStartAndEndTimeForBreadcrumbRecord = (visitInfo: VisitModal, configuration: any[]) => {
    let recordStartTime = null
    let recordEndTime = null
    if (isTabDelSupOrSDL()) {
        const currentConfig = getTimeIntervalConfiguration(visitInfo, configuration)
        recordStartTime = visitInfo.ActualVisitStartTime
            ? moment(visitInfo.ActualVisitStartTime).subtract(
                  parseInt(currentConfig.BeforeStartTime__c || NUMBER_VALUE.ZERO_NUM),
                  MOMENT_UNIT.MINUTES
              )
            : moment()
        recordEndTime = visitInfo.ActualVisitEndTime
            ? moment(visitInfo.ActualVisitEndTime).add(
                  parseInt(currentConfig.AfterEndTime__c || NUMBER_VALUE.ZERO_NUM),
                  MOMENT_UNIT.MINUTES
              )
            : moment()
    } else {
        recordStartTime = visitInfo.ActualVisitStartTime
            ? moment(visitInfo.ActualVisitStartTime).subtract(beforeMins, MOMENT_UNIT.MINUTES)
            : moment()
        recordEndTime = visitInfo.ActualVisitEndTime
            ? moment(visitInfo.ActualVisitEndTime).add(afterMins, MOMENT_UNIT.MINUTES)
            : moment()
    }
    return {
        startTime: recordStartTime,
        endTime: recordEndTime
    }
}

const getEventTimePoint = (events: any[]) => {
    const eventPoints = []
    events.forEach((element) => {
        const startPoint = {
            Id: element.Id,
            colorType: COLOR_TYPE.YELLOW,
            timePoint: moment(element.Actual_Start_Time__c),
            pointType: POINT_TYPE.EVENT,
            pointTitle: element.Subject,
            entryType: ENTRY_TYPE.START,
            timeLength: moment(element.Actual_End_Time__c).diff(
                moment(element.Actual_Start_Time__c),
                MOMENT_UNIT.SECONDS
            )
        }
        eventPoints.push(startPoint)
        const endPoint = {
            Id: element.Id,
            colorType: COLOR_TYPE.EMPTY,
            timePoint: moment(element.Actual_End_Time__c),
            pointType: POINT_TYPE.EVENT,
            pointTitle: element.Subject,
            entryType: ENTRY_TYPE.END,
            timeLength: NUMBER_VALUE.ZERO_NUM
        }
        eventPoints.push(endPoint)
    })
    return eventPoints
}

const getBreadcrumbPoint = (
    breadcrumbs: any[],
    currentVisit: VisitModal,
    compareStartTime: moment.Moment,
    compareEndTime: moment.Moment
) => {
    const baseBread = []
    breadcrumbs.forEach((element, index) => {
        if (index === 0) {
            baseBread.push(element)
        } else {
            const lastBread = breadcrumbs[index - 1]
            if (lastBread.Geofence_Direction__c !== element.Geofence_Direction__c) {
                baseBread.push(element)
            }
        }
    })
    const beforeStartBreadcrumbs = baseBread.filter((item) => moment(item.Time__c) <= compareStartTime)
    const centerBreadcrumbs = baseBread.filter(
        (item) =>
            moment(item.Time__c) < moment(compareEndTime) &&
            moment(item.Time__c) > moment(compareStartTime) &&
            item.Visit__c === currentVisit.Id
    )
    const afterBreadcrumbs = baseBread.filter((item) => moment(item.Time__c) >= moment(compareEndTime))
    const breadcrumbsLength = beforeStartBreadcrumbs.length
    const beforeItem =
        breadcrumbsLength > NUMBER_VALUE.ZERO_NUM
            ? beforeStartBreadcrumbs[beforeStartBreadcrumbs.length - NUMBER_VALUE.ONE_NUM]
            : {}
    const afterItem = afterBreadcrumbs.length > NUMBER_VALUE.ZERO_NUM ? afterBreadcrumbs[NUMBER_VALUE.ZERO_NUM] : {}
    const beforeArr = beforeItem.Geofence_Direction__c === IN_GEOFENCE ? [beforeItem] : []
    const afterArr = afterItem.Geofence_Direction__c === OUT_GEOFENCE ? [afterItem] : []
    const validbreadcrumb = [...beforeArr, ...centerBreadcrumbs, ...afterArr]
    const uniqueBread = _.uniqBy(validbreadcrumb, 'Time__c')
    const longBreadcrumb = []
    uniqueBread.forEach((element, index) => {
        let isShort = false
        if (index < uniqueBread.length - NUMBER_VALUE.ONE_NUM) {
            const currentBread = uniqueBread[index]
            const nextBread = uniqueBread[index + NUMBER_VALUE.ONE_NUM]
            if (
                moment(nextBread.Time__c).diff(moment(currentBread.Time__c), MOMENT_UNIT.SECONDS) <
                NUMBER_VALUE.THIRTY_NUM
            ) {
                isShort = true
            }
        }
        if (!isShort) {
            longBreadcrumb.push(element)
        }
    })
    const breadcrumbPoints = []
    longBreadcrumb.forEach((element) => {
        const singlePoint = {
            Id: element.Id,
            colorType: element.Geofence_Direction__c === IN_GEOFENCE ? COLOR_TYPE.GREEN : COLOR_TYPE.RED, //
            timePoint: moment(element.Time__c),
            pointType: POINT_TYPE.BREADCRUMB,
            pointTitle: '',
            entryType: element.Geofence_Direction__c === IN_GEOFENCE ? ENTRY_TYPE.START : ENTRY_TYPE.END,
            timeLength: NUMBER_VALUE.ZERO_NUM //
        }
        breadcrumbPoints.push(singlePoint)
    })
    return breadcrumbPoints
}

const getFlagPointWithPersonal = (visitInfo: VisitModal, compareEndTime: moment.Moment) => {
    const startPoint = {
        Id: '',
        colorType: COLOR_TYPE.BLUE,
        timePoint: moment(visitInfo.ActualVisitStartTime),
        pointType: POINT_TYPE.FLAG,
        pointTitle: '',
        entryType: ENTRY_TYPE.START,
        timeLength: NUMBER_VALUE.ZERO_NUM
    }
    const endPoint = {
        Id: '',
        colorType: COLOR_TYPE.BLUE,
        timePoint: compareEndTime,
        pointType: POINT_TYPE.FLAG,
        pointTitle: '',
        entryType: ENTRY_TYPE.END,
        timeLength: NUMBER_VALUE.ZERO_NUM
    }
    return [startPoint, endPoint]
}

const getMixturePoint = (
    eventPoints: any[],
    breadcrumbPoints: any[],
    flagPoints: any[],
    visitInfo: VisitModal,
    compareStartTime: moment.Moment,
    compareEndTime: moment.Moment,
    recordEndTime: moment.Moment
) => {
    let resultEndTime = moment().tz(CommonParam.userTimeZone)
    if (recordEndTime < moment().tz(CommonParam.userTimeZone)) {
        resultEndTime = recordEndTime
    }
    const sortPoints = _.sortBy([...eventPoints, ...breadcrumbPoints, ...flagPoints], function (o) {
        return o.timePoint
    })
    const mixPoints = []
    sortPoints.forEach((element, index) => {
        const resultItem = _.cloneDeep(element)
        let colorResult = ''
        let timeLengthResult = NUMBER_VALUE.ZERO_NUM
        if (element.pointType === POINT_TYPE.EVENT) {
            if (element.entryType === ENTRY_TYPE.START) {
                colorResult = COLOR_TYPE.YELLOW
                timeLengthResult = element.timeLength
            } else {
                const beforeArr = sortPoints.filter(
                    (a) => a.pointType === POINT_TYPE.BREADCRUMB && moment(a.timePoint) < moment(element.timePoint)
                )
                const lastBreadcrumb =
                    beforeArr.length > NUMBER_VALUE.ZERO_NUM ? beforeArr[beforeArr.length - NUMBER_VALUE.ONE_NUM] : {}
                colorResult = lastBreadcrumb.entryType === ENTRY_TYPE.START ? COLOR_TYPE.GREEN : COLOR_TYPE.RED
                const nextPoint = sortPoints[index + NUMBER_VALUE.ONE_NUM]
                timeLengthResult = moment(nextPoint.timePoint).diff(moment(element.timePoint), MOMENT_UNIT.SECONDS)
            }
        } else if (element.pointType === POINT_TYPE.BREADCRUMB) {
            const lastPoint = index > NUMBER_VALUE.ZERO_NUM ? sortPoints[index - NUMBER_VALUE.ONE_NUM] : {}
            const nextPoint =
                index < sortPoints.length - NUMBER_VALUE.ONE_NUM ? sortPoints[index + NUMBER_VALUE.ONE_NUM] : {}
            if (element.entryType === ENTRY_TYPE.START) {
                if (lastPoint.entryType === ENTRY_TYPE.START && lastPoint.pointType === POINT_TYPE.EVENT) {
                    colorResult = COLOR_TYPE.YELLOW
                } else {
                    colorResult =
                        moment(element.timePoint) < moment(compareStartTime) ? COLOR_TYPE.PURPLE : COLOR_TYPE.GREEN
                }
                const nextTimePoint = nextPoint.timePoint || resultEndTime
                timeLengthResult = moment(nextTimePoint).diff(moment(element.timePoint), MOMENT_UNIT.SECONDS)
            } else {
                if (
                    index === sortPoints.length - NUMBER_VALUE.ONE_NUM &&
                    moment(element.timePoint) > moment(compareEndTime)
                ) {
                    colorResult = COLOR_TYPE.EMPTY
                } else {
                    colorResult =
                        lastPoint.entryType === ENTRY_TYPE.START && lastPoint.pointType === POINT_TYPE.EVENT
                            ? COLOR_TYPE.YELLOW
                            : COLOR_TYPE.RED
                    const nextTimePoint = nextPoint.timePoint || compareEndTime
                    timeLengthResult = moment(nextTimePoint).diff(moment(element.timePoint), MOMENT_UNIT.SECONDS)
                }
            }
        } else if (element.pointType === POINT_TYPE.FLAG) {
            const beforeArr = sortPoints.filter(
                (a) => a.pointType === POINT_TYPE.BREADCRUMB && moment(a.timePoint) <= moment(element.timePoint)
            )
            const afterArr = sortPoints.filter(
                (a) => a.pointType === POINT_TYPE.BREADCRUMB && moment(a.timePoint) >= moment(element.timePoint)
            )
            if (element.entryType === ENTRY_TYPE.START) {
                colorResult = beforeArr.length > NUMBER_VALUE.ZERO_NUM ? COLOR_TYPE.GREEN : COLOR_TYPE.RED
                const nextPoint = sortPoints[index + NUMBER_VALUE.ONE_NUM]
                timeLengthResult = moment(nextPoint.timePoint).diff(moment(element.timePoint), MOMENT_UNIT.SECONDS)
            } else {
                const lastBreadcrumb =
                    beforeArr.length > NUMBER_VALUE.ZERO_NUM ? beforeArr[beforeArr.length - NUMBER_VALUE.ONE_NUM] : {}
                colorResult = lastBreadcrumb.entryType === ENTRY_TYPE.START ? COLOR_TYPE.PURPLE : COLOR_TYPE.EMPTY
                const finalBreadcrumb = afterArr.length > NUMBER_VALUE.ZERO_NUM ? afterArr[NUMBER_VALUE.ZERO_NUM] : {}
                if (lastBreadcrumb.entryType === ENTRY_TYPE.START && !isDelInProgress(visitInfo)) {
                    timeLengthResult = moment(finalBreadcrumb.timePoint || resultEndTime).diff(
                        moment(element.timePoint),
                        MOMENT_UNIT.SECONDS
                    )
                }
            }
        }
        resultItem.colorType = colorResult
        resultItem.timeLength = timeLengthResult || NUMBER_VALUE.ZERO_NUM
        mixPoints.push(resultItem)
    })
    return mixPoints
}

const filterToDeleteInvalidPoints = (eventPoints: any[], mixPoints: any[]) => {
    const validPoints = []
    mixPoints.forEach((element) => {
        let isInvalid = false
        if (element.pointType === POINT_TYPE.BREADCRUMB) {
            eventPoints.forEach((eventItem) => {
                if (
                    moment(element.timePoint) > moment(eventItem.Actual_Start_Time__c) &&
                    moment(element.timePoint) < moment(eventItem.Actual_End_Time__c)
                ) {
                    isInvalid = true
                }
            })
        }
        if (!isInvalid) {
            validPoints.push(element)
        }
    })
    return validPoints
}

export const getOriginDataWithNet = (visitInfo: VisitModal, configuration: any[]) => {
    return new Promise<any>((resolve, reject) => {
        if (!visitInfo.ActualVisitStartTime && !visitInfo.ActualVisitEndTime) {
            return
        }
        const recordTimeData = getStartAndEndTimeForBreadcrumbRecord(visitInfo, configuration)
        const recordStartTime = recordTimeData.startTime
        const recordEndTime = recordTimeData.endTime
        const compareStartTime = moment(visitInfo.ActualVisitStartTime)
        const compareEndTime = isDelInProgress(visitInfo) ? moment() : moment(visitInfo.ActualVisitEndTime)
        const queryString = `SELECT Id, Customer__c, Geofence_Direction__c, Time__c, Visit__c, User__c, Visit_List__c FROM Breadcrumb_Timestamps__c
    WHERE Customer__c='${visitInfo.PlaceId}' AND User__c='${visitInfo.VisitorId}'
     AND Time__c>=${recordStartTime.toISOString()} AND Time__c<=${recordEndTime.toISOString()} ORDER BY Time__c ASC`
        const path = `query/?q=${queryString}`
        Promise.all([
            SoupService.retrieveDataFromSoup(
                'Event',
                {},
                ['Id', 'Subject', 'Actual_Start_Time__c', 'Actual_End_Time__c'],
                `SELECT
        {Event:Id},
        {Event:Subject},
        {Event:Actual_Start_Time__c},
        {Event:Actual_End_Time__c}
        FROM {Event}
        WHERE {Event:OwnerId}='${visitInfo.OwnerId}'  AND
        {Event:Actual_Start_Time__c} >= '${visitInfo.ActualVisitStartTime}' AND
        {Event:Actual_End_Time__c} <= '${visitInfo.ActualVisitEndTime}' AND
        {Event:Actual_Start_Time__c} IS NOT NULL
        ORDER BY {Event:Actual_Start_Time__c} ASC
        `
            ),
            restDataCommonCall(path, 'GET')
        ])
            .then((resultArr) => {
                const eventPoints = getEventTimePoint(resultArr[NUMBER_VALUE.ZERO_NUM] || [])
                const breadcrumbPoints = getBreadcrumbPoint(
                    resultArr[NUMBER_VALUE.ONE_NUM]?.data?.records || [],
                    visitInfo,
                    compareStartTime,
                    compareEndTime
                )
                const flagPoints = getFlagPointWithPersonal(visitInfo, compareEndTime)
                const mixPoints = getMixturePoint(
                    eventPoints,
                    breadcrumbPoints,
                    flagPoints,
                    visitInfo,
                    compareStartTime,
                    compareEndTime,
                    recordEndTime
                )
                const finalData = filterToDeleteInvalidPoints(eventPoints, mixPoints)
                const totalPointTime = finalData.reduce(
                    (a, b) => a + parseFloat(b.timeLength || NUMBER_VALUE.ZERO_NUM),
                    NUMBER_VALUE.ZERO_NUM
                )
                const redTotal = finalData.reduce((a, b) => {
                    if (b.colorType === COLOR_TYPE.RED) {
                        return a + parseFloat(b.timeLength) || NUMBER_VALUE.ZERO_NUM
                    }
                    return a
                }, NUMBER_VALUE.ZERO_NUM)
                const purpleTotal = finalData.reduce((a, b) => {
                    if (b.colorType === COLOR_TYPE.GREEN) {
                        return a + parseFloat(b.timeLength) || NUMBER_VALUE.ZERO_NUM
                    }
                    return a
                }, NUMBER_VALUE.ZERO_NUM)
                resolve({
                    purpleTime: getTimeWithNum(purpleTotal),
                    redTime: getTimeWithNum(redTotal),
                    totalTime: totalPointTime,
                    originSource: finalData
                })
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const getVisitInfoAndRecordRange = (visit) => {
    return new Promise((resolve, reject) => {
        Promise.all([
            SoupService.retrieveDataFromSoup(
                'Visit',
                {},
                ['Id', 'Status__c', 'PlaceId', 'OwnerId', 'VisitorId', 'ActualVisitStartTime', 'ActualVisitEndTime'],
                `SELECT
            {Visit:Id},
            {Visit:Status__c},
            {Visit:PlaceId},
            {Visit:OwnerId},
            {Visit:VisitorId},
            {Visit:ActualVisitStartTime},
            {Visit:ActualVisitEndTime}
            FROM {Visit}
            WHERE {Visit:Id}='${visit.Id}'
            `
            ),
            SoupService.retrieveDataFromSoup(
                'Time_Interval_Configuration__mdt',
                {},
                ['Id', 'AfterEndTime__c', 'BeforeStartTime__c', 'Persona__c', 'Status__c'],
                `SELECT
            {Time_Interval_Configuration__mdt:Id},
            {Time_Interval_Configuration__mdt:AfterEndTime__c},
            {Time_Interval_Configuration__mdt:BeforeStartTime__c},
            {Time_Interval_Configuration__mdt:Persona__c},
            {Time_Interval_Configuration__mdt:Status__c}
            FROM {Time_Interval_Configuration__mdt}
            `
            )
        ])
            .then((result: Array<any>) => {
                if (result.length < NUMBER_VALUE.TWO_NUM) {
                    reject()
                }
                const visitArr = result[NUMBER_VALUE.ZERO_NUM] || []
                resolve({
                    visitInfo: visitArr.length > NUMBER_VALUE.ZERO_NUM ? visitArr[0] : [],
                    configuration: result[NUMBER_VALUE.ONE_NUM] || []
                })
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const getGeoTimeConfig = () => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'Time_Interval_Configuration__mdt',
            {},
            ['Id', 'AfterEndTime__c', 'BeforeStartTime__c', 'Persona__c', 'Status__c'],
            `SELECT
            {Time_Interval_Configuration__mdt:Id},
            {Time_Interval_Configuration__mdt:AfterEndTime__c},
            {Time_Interval_Configuration__mdt:BeforeStartTime__c},
            {Time_Interval_Configuration__mdt:Persona__c},
            {Time_Interval_Configuration__mdt:Status__c}
            FROM {Time_Interval_Configuration__mdt}
            `
        )
            .then((result: Array<any>) => {
                resolve(result || [])
            })
            .catch((err) => {
                reject(err)
            })
    })
}

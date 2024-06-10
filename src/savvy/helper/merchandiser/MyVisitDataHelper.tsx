/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-06-01 11:06:41
 * @LastEditTime: 2023-09-12 19:11:25
 * @LastEditors: Mary Qian
 */
import _ from 'lodash'
import moment from 'moment'
import { CommonParam } from '../../../common/CommonParam'
import { getMetricDataByVisitsInOneVL } from '../../components/MyVisit/VisitMetric'
import { VisitListRecordTypeEnum } from '../../enums/RecordType'
import { VisitStatus } from '../../enums/Visit'
import { SoupService } from '../../service/SoupService'
import { getRecordTypeIdByDeveloperName, isTrueInDB } from '../../utils/CommonUtils'
import { getDeliveryFooter } from '../../utils/MerchandiserUtils'
import { getLastSundayDate, todayDateWithTimeZone } from '../../utils/TimeZoneUtils'
import { addDaysToToday } from '../../../common/utils/YMDUtils'
import { getPastFutureEventRes, getTodayEventRes, getYesterdayInprogressVlEventFromLocal } from './MyVisitEventHelper'
import { getVisitListFromLocalById } from './MyVisitHelper'
import { myVisitBaseFields, pastFutureQuery, todayQuery, visitListByDateQuery } from './MyVisitQuery'

export interface VisitInfoProps {
    metricData: any
    status: string
    StartTime: string
    EndTime: string
    index: number
    isMerchVisitList: number
}
export interface SingleVisitListProps {
    visitListInfo: VisitInfoProps
    data: any[]
}
export interface PastFutureDataModel {
    managerMeetingArray: any[]
    visitAndEventArray: SingleVisitListProps[]
    mapList: any[]
    isAllPastVisitCompleted?: boolean
    showEndMyDayButton?: boolean
    hasInProgressVisitOrEvent?: boolean
}

export const isEventItem = (item) => {
    return item.attributes.type === 'Event'
}

const sortVisitAndEventInOneVisitList = (a, b) => {
    const aTime = isEventItem(a) ? a.Actual_Start_Time__c : a.ActualVisitStartTime
    const bTime = isEventItem(b) ? b.Actual_Start_Time__c : b.ActualVisitStartTime
    if (aTime && !bTime) {
        return -1
    }
    if (!aTime && bTime) {
        return 1
    }

    if (!aTime && !bTime) {
        if (a.sequence && b.sequence) {
            return a.sequence < b.sequence ? -1 : 1
        } else if (a.sequence && !b.sequence) {
            return 1
        } else if (!a.sequence && b.sequence) {
            return -1
        }
        return moment(a.StartDateTime).isBefore(moment(b.StartDateTime)) ? -1 : 1
    }

    return moment(aTime).isBefore(moment(bTime)) ? -1 : 1
}

const handleDeliveryFooterInfo = (vlData: any, footerData: any) => {
    vlData.forEach((vl: any) => {
        vl.showNew = isTrueInDB(vl.adHoc) || isTrueInDB(vl.Manager_Ad_Hoc__c) || isTrueInDB(vl.Reassigned_Flag__c)
        if (!vl.storeLocation) {
            vl.storeLocation = JSON.stringify({
                latitude: vl.latitude,
                longitude: vl.longitude
            })
        }
        const v = footerData.find((val: any) => val.visitId === vl.storeId)
        if (v) {
            vl.deliveryInfo = v
        }
    })
    return vlData
}

const sortVisitListInOneDay = (a, b) => {
    const aTime = a.visitListInfo.StartTime
    const bTime = b.visitListInfo.StartTime
    if (aTime && !bTime) {
        return -1
    }
    if (!aTime && bTime) {
        return 1
    }
    return moment(a.visitListInfo.StartTime).isBefore(moment(b.visitListInfo.StartTime)) ? -1 : 1
}

const sortManagerMeetings = (a, b) => {
    const isACompleted = !!a.Actual_End_Time__c
    const isBCompleted = !!b.Actual_End_Time__c

    if (isACompleted && !isBCompleted) {
        return 1
    }

    if (!isACompleted && isBCompleted) {
        return -1
    }

    if (!isACompleted && !isBCompleted) {
        return moment(a.StartDateTime).isBefore(moment(b.StartDateTime)) ? -1 : 1
    }

    if (isACompleted && isBCompleted) {
        return moment(a.Actual_End_Time__c).isBefore(moment(b.Actual_End_Time__c)) ? -1 : 1
    }
}

export const isEventBelongToVisitList = (e, visitList) => {
    const { StartTime, EndTime } = visitList
    if (isTrueInDB(e.Manager_Scheduled__c)) {
        return false
    }
    if (e.Actual_Start_Time__c && e.Actual_End_Time__c) {
        return (
            moment(e.Actual_Start_Time__c).isAfter(moment(StartTime)) &&
            moment(e.Actual_End_Time__c).isBefore(moment(EndTime))
        )
    }
    return false
}

export const setupInProgressVisitList = async (visitListId) => {
    await getVisitListFromLocalById(visitListId)
    CommonParam.shiftStatus = 'started'
}

const processDataInOneDay = (visitAndEventArray) => {
    let showEndMyDayButton = false
    let isAllPastVisitCompleted = true
    let hasInProgressVisitOrEvent = false

    visitAndEventArray.forEach((item, index) => {
        item.visitListInfo.index = index

        if (item.visitListInfo.isMerchVisitList === 0) {
            return true
        }

        if (!showEndMyDayButton) {
            let hasInProgressVisitList = false
            if (item.visitListInfo.status === VisitStatus.IN_PROGRESS) {
                if (
                    (CommonParam.Is_Night_Shift__c &&
                        CommonParam.visitList?.Visit_Date__c !== addDaysToToday(-1, true)) ||
                    !CommonParam.Is_Night_Shift__c
                ) {
                    hasInProgressVisitList = true
                    setupInProgressVisitList(item.visitListInfo.visitListId)
                }
            }
            let hasNotStartedVisitOrEvent = false
            item.data.forEach((ve) => {
                if (ve.status === VisitStatus.IN_PROGRESS && !hasInProgressVisitOrEvent) {
                    hasInProgressVisitOrEvent = true
                    if (isEventItem(ve)) {
                        CommonParam.inMeeting = true
                    } else {
                        CommonParam.visitStatus = ve
                    }
                }
                if (ve.status === VisitStatus.NOT_STARTED) {
                    hasNotStartedVisitOrEvent = true
                }
            })

            showEndMyDayButton = !hasInProgressVisitOrEvent && hasInProgressVisitList
            isAllPastVisitCompleted = !hasNotStartedVisitOrEvent
        }
    })

    return { showEndMyDayButton, isAllPastVisitCompleted, hasInProgressVisitOrEvent }
}

export const handleDataInOneDay = (VEData: any[]): PastFutureDataModel => {
    if (!VEData || VEData.length === 0) {
        return { visitAndEventArray: [], managerMeetingArray: [], mapList: [], showEndMyDayButton: false }
    }

    const eventArray = VEData.filter((v) => isEventItem(v))
    const mapList = VEData.filter((v) => !isEventItem(v)).filter((vi) => vi.Id !== null)

    const merchVEData = VEData.filter((v) => v.isMerchVisitList || isEventItem(v))
    const visitInOneDayGroupByVL = _.groupBy(merchVEData, 'VLSoupId')

    const visitAndEventArray = Object.keys(visitInOneDayGroupByVL).map((v) => {
        const first = visitInOneDayGroupByVL[v][0]

        let visitInVL = visitInOneDayGroupByVL[v]
        const visitListInfo = {
            index: 0,
            metricData: getMetricDataByVisitsInOneVL(visitInVL),
            status: first.VlStatus,
            StartTime: first.StartTime,
            EndTime: first.EndTime,
            isMerchVisitList: first.isMerchVisitList || isEventItem(first),
            visitListId: first.visitList || first.VisitList
        }

        if (visitInVL.length === 1 && !visitInVL[0].Id) {
            visitInVL = []
        }

        visitInVL.sort(sortVisitAndEventInOneVisitList)
        visitInVL = visitInVL.filter((vi) => vi.Id !== null || isEventItem(vi))
        return {
            visitListInfo,
            data: visitInVL
        }
    })

    visitAndEventArray.sort(sortVisitListInOneDay)
    const { showEndMyDayButton, isAllPastVisitCompleted, hasInProgressVisitOrEvent } =
        processDataInOneDay(visitAndEventArray)

    const managerMeetingArray = eventArray.filter((e) => isTrueInDB(e.Manager_Scheduled__c))
    managerMeetingArray.sort(sortManagerMeetings)

    const merchVisitAndEventArray = _.cloneDeep(visitAndEventArray).filter(
        (i) => i.visitListInfo.isMerchVisitList !== 0
    )

    return {
        visitAndEventArray: merchVisitAndEventArray,
        managerMeetingArray,
        mapList,
        showEndMyDayButton,
        isAllPastVisitCompleted,
        hasInProgressVisitOrEvent
    }
}

export const handleAllVisitAndEventData = (allPastList: any[]) => {
    if (!allPastList || allPastList.length === 0) {
        return {}
    }

    const allData = {}

    const visitArrGroup = _.groupBy(allPastList, 'VisitDate')
    Object.keys(visitArrGroup)
        .sort()
        .forEach((dayData) => {
            allData[dayData] = handleDataInOneDay(visitArrGroup[dayData])
        })
    return allData
}

// find inProgress VisitList or first NotStarted VisitList in Today's VisitList
export const findCurrentVisitListInTodayData = (dataOfToday) => {
    const todayVisitAndEventArray = dataOfToday.visitAndEventArray || []

    let findNotStarted = false
    let visitArray = []
    let vlIndex = -1

    for (const visitIndex in todayVisitAndEventArray) {
        if (todayVisitAndEventArray[visitIndex].visitListInfo.status === VisitStatus.IN_PROGRESS) {
            visitArray = _.cloneDeep(todayVisitAndEventArray[visitIndex].data)
            vlIndex = visitIndex
            break
        }

        if (todayVisitAndEventArray[visitIndex].visitListInfo.status === VisitStatus.NOT_STARTED && !findNotStarted) {
            findNotStarted = true
            visitArray = _.cloneDeep(todayVisitAndEventArray[visitIndex].data)
            vlIndex = visitIndex
        }
    }
    return { index: vlIndex, data: visitArray }
}

export const isCurrentVlPastAndShiftUser = () => {
    if (!CommonParam.visitList) {
        return false
    }
    const isShiftUser = CommonParam.Is_Night_Shift__c
    return (
        isShiftUser &&
        CommonParam.visitList.Visit_Date__c === addDaysToToday(-1, true) &&
        CommonParam.visitList.Status__c === VisitStatus.IN_PROGRESS
    )
}

export const getYesterdayInProgressVisitArrayFromLocal = async () => {
    if (!CommonParam.visitList || !CommonParam.visitList?.Id) {
        return Promise.resolve([])
    }
    if (!isCurrentVlPastAndShiftUser()) {
        return Promise.resolve([])
    }
    const merchVisitListRecordTypeId = await getRecordTypeIdByDeveloperName(
        VisitListRecordTypeEnum.MerchDailyVisitList,
        'Visit_List__c'
    )
    const query = visitListByDateQuery(merchVisitListRecordTypeId, addDaysToToday(-1, true))
    const res = await SoupService.retrieveDataFromSoup('Visit_List__c', {}, myVisitBaseFields, query)
    const delivery: any = await getDeliveryFooter(res, '', true)
    return handleDeliveryFooterInfo(res, delivery)
}

export const getVisitArrayFromLocal = async (isToday: boolean, startDate?: string, endDate?: string) => {
    const merchVisitListRecordTypeId = await getRecordTypeIdByDeveloperName(
        VisitListRecordTypeEnum.MerchDailyVisitList,
        'Visit_List__c'
    )

    const query = isToday
        ? todayQuery(merchVisitListRecordTypeId)
        : pastFutureQuery(merchVisitListRecordTypeId, startDate, endDate)

    const res = await SoupService.retrieveDataFromSoup('Visit_List__c', {}, myVisitBaseFields, query)

    const delivery: any = await getDeliveryFooter(res)
    return handleDeliveryFooterInfo(res, delivery)
}

export const getVisitAndEventDataForPastAndFutureTab = () => {
    const start = getLastSundayDate()
    const end = addDaysToToday(7, true)
    return new Promise((resolve, reject) => {
        Promise.all([
            getPastFutureEventRes(),
            getVisitArrayFromLocal(false, start, end),
            getYesterdayInprogressVlEventFromLocal()
        ])
            .then((values) => {
                if (values[2] && values[2].length > 0) {
                    values[2]?.forEach((yesterdayEvent) => {
                        values[0]?.forEach((event, index) => {
                            if (event.Id === yesterdayEvent.Id) {
                                values[0].splice(index, 1)
                            }
                        })
                    })
                }
                const visitAndEventData = [...values[0], ...values[1]] || []
                let excludeSomeData
                if (CommonParam.Is_Night_Shift__c) {
                    excludeSomeData = visitAndEventData.filter(
                        (data) =>
                            (data.VisitDate !== todayDateWithTimeZone(true) &&
                                data.VisitDate !== addDaysToToday(-1, true)) ||
                            (data.VisitDate === addDaysToToday(-1, true) && data.VlStatus !== 'In Progress')
                    )
                } else {
                    excludeSomeData = visitAndEventData.filter((data) => data.VisitDate !== todayDateWithTimeZone(true))
                }
                resolve(handleAllVisitAndEventData(excludeSomeData))
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const getVisitAndEventDataForTodayTab = () => {
    return new Promise((resolve, reject) => {
        Promise.all([getTodayEventRes(), getVisitArrayFromLocal(true), getYesterdayInProgressVisitArrayFromLocal()])
            .then((values) => {
                const visitRes = [...values[1], ...values[2]]
                const visitAndEventData = [...values[0], ...visitRes] || []
                const tempData = handleAllVisitAndEventData(visitAndEventData)
                let fullData = tempData[todayDateWithTimeZone(true)] || {}
                if (values[2] && values[2].length > 0) {
                    const yesterday = addDaysToToday(-1, true)
                    const yesterdayData = tempData[yesterday]
                    if (!_.isEmpty(fullData)) {
                        yesterdayData.visitAndEventArray = [
                            ...yesterdayData.visitAndEventArray,
                            ...fullData?.visitAndEventArray
                        ]
                        yesterdayData.managerMeetingArray = [
                            ...yesterdayData.managerMeetingArray,
                            ...fullData?.managerMeetingArray
                        ]
                    }
                    yesterdayData.mapList = visitAndEventData
                        .filter((v) => !isEventItem(v))
                        .filter((vi) => vi.Id !== null)
                    fullData = yesterdayData
                }
                const visitData = visitRes
                resolve({ fullData, visitData })
            })
            .catch((err) => {
                reject(err)
            })
    })
}

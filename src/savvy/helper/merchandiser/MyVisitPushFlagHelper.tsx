/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-07-28 12:06:35
 * @LastEditTime: 2022-11-20 23:09:29
 * @LastEditors: Mary Qian
 */

import moment from 'moment'
import { CommonParam } from '../../../common/CommonParam'
import { Log } from '../../../common/enums/Log'
import { setLoggedInUserTimezone } from '../../utils/TimeZoneUtils'
import { getCurrentMeeting } from './MyVisitEventHelper'
import { getVisitsByVL } from './MyVisitHelper'
import { getStringValue } from '../../utils/LandingUtils'
import { updateVLPushFlag } from '../../service/UpdateVisitListService'
import { isEventItem } from './MyVisitDataHelper'
import { MOMENT_UNIT } from '../../../common/enums/MomentUnit'
import { storeClassLog } from '../../../common/utils/LogUtils'

const FIVE_MINUTES = 5 * 60
let fiveMinutesTimer = null

export const clearPushTimer = () => {
    clearInterval(fiveMinutesTimer)
    fiveMinutesTimer = null
}

const updatePushFlagIfNeeded = async (todayList) => {
    const visitList = JSON.parse(JSON.stringify(CommonParam.visitList))
    const hasStartedVisit =
        todayList.findIndex((vi) => {
            if (isEventItem(vi)) {
                return !!vi.Actual_Start_Time__c
            }
            return !!vi.ActualVisitStartTime
        }) !== -1

    const hasStartedMyDay = visitList.Start_Date_Time__c !== null

    const hasEvent = await getCurrentMeeting(visitList.Id)

    if (!hasStartedVisit && !hasEvent && hasStartedMyDay) {
        visitList.Push_Flag__c = true
        CommonParam.visitList = visitList
        await updateVLPushFlag(visitList)
    }
    clearPushTimer()
}

const setupPushFlagWhenNecessary = (todayList) => {
    let tempTodayList = JSON.parse(JSON.stringify(todayList))
    getVisitsByVL()
        .then((res: any) => {
            tempTodayList = res.todayList
            updatePushFlagIfNeeded(tempTodayList)
        })
        .catch((err) => {
            storeClassLog(
                Log.MOBILE_ERROR,
                'setupPushFlagWhenNecessary',
                `setupPushFlagWhenNecessary getVisitsByVL error ${getStringValue(err)}`
            )
            updatePushFlagIfNeeded(tempTodayList)
        })
}

const checkPushFlagStatus = (pushFlag: any) => {
    return pushFlag === '1' || pushFlag === true || pushFlag === 'true'
}

export const setupTimerAfterStartMyDay = (tempTodayList) => {
    clearPushTimer()
    const visitList = JSON.parse(JSON.stringify(CommonParam.visitList))

    const hasStartedMyDay = visitList.Start_Date_Time__c !== null
    const todayList = tempTodayList
    const hasStartedVisit = todayList.findIndex((vi) => vi.ActualVisitStartTime !== null) !== -1
    if (!checkPushFlagStatus(visitList.Push_Flag__c) && hasStartedMyDay && !hasStartedVisit) {
        fiveMinutesTimer = setTimeout(() => {
            setupPushFlagWhenNecessary(todayList)
        }, FIVE_MINUTES * 1000)
    }
}

export const setupTimerWhenInit = (todayList) => {
    clearPushTimer()
    setLoggedInUserTimezone()
    const visitList = JSON.parse(JSON.stringify(CommonParam.visitList))

    if (checkPushFlagStatus(visitList.Push_Flag__c) || !visitList.Start_Date_Time__c) {
        return
    }
    const startTimeStr = visitList.Start_Date_Time__c
    const startTime = moment(startTimeStr)
    if (!startTime) {
        return
    }

    const diffSeconds = moment().diff(startTime, MOMENT_UNIT.SECONDS)

    if (isNaN(diffSeconds)) {
        return
    }
    if (diffSeconds < FIVE_MINUTES) {
        fiveMinutesTimer = setTimeout(() => {
            setupPushFlagWhenNecessary(todayList)
        }, 1000 * (FIVE_MINUTES - diffSeconds))
    } else {
        setupPushFlagWhenNecessary(todayList)
    }
}

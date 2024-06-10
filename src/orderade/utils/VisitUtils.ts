import { todayDateWithTimeZone, formatWithTimeZone } from '../../common/utils/TimeZoneUtils'
import moment from 'moment'
import NetInfo from '@react-native-community/netinfo'
import { BreadcrumbVisibility, Instrumentation } from '@appdynamics/react-native-agent'
import { Alert } from 'react-native'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { appendLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import { t } from '../../common/i18n/t'
import _ from 'lodash'
import React, { useState } from 'react'
import { DropDownType } from '../enum/Common'
import { NavigationProp } from '@react-navigation/native'
import { MyDayVisitModel } from '../interface/MyDayVisit'
import VisitService from '../service/VisitService'
import OrderService from '../service/OrderService'
import SyncUpService from '../service/SyncUpService'

export const redefinePositionCoords = (latitude: any, longitude: any) => {
    return {
        longitude: (longitude || 0).toString(),
        latitude: (latitude || 0).toString()
    }
}

export const subjectMap = (subject: any) => {
    const subjectMapObj = {
        Lunch: t.labels.PBNA_MOBILE_LUNCH,
        Break: t.labels.PBNA_MOBILE_BREAK,
        Meeting: t.labels.PBNA_MOBILE_MEETING,
        'Personal Time': t.labels.PBNA_MOBILE_PERSONAL_TIME
    }
    return subjectMapObj[subject]
}

export const addADLog = (message: string) => {
    try {
        const time = moment().format('YYYY-MM-DDTHH:mm:ss.SSSS Z')
        Instrumentation.leaveBreadcrumb(message + time, BreadcrumbVisibility.CRASHES_AND_SESSIONS)
    } catch (err) {}
}

export const showEndMyDayAlert = (
    onConfirm: () => void,
    closeAllRows: Function,
    visitRowRefs: React.RefObject<Object>
) => {
    Alert.alert(t.labels.PBNA_MOBILE_END_DAY, t.labels.PBNA_MOBILE_END_DAY_ALERT, [
        { text: t.labels.PBNA_MOBILE_YES, onPress: onConfirm },
        { text: t.labels.PBNA_MOBILE_NO, onPress: () => closeAllRows(visitRowRefs) }
    ])
}

export const formatClock = (time: any) => {
    let returnStr = ''
    if (time.hour !== 0) {
        returnStr += time.hour + ' ' + t.labels.PBNA_MOBILE_HR + (time.hour > 1 ? 's' : '') + ' '
    }
    if (time.min !== 0) {
        returnStr += time.min + ' ' + t.labels.PBNA_MOBILE_MIN + (parseInt(time.min) > 1 ? 's' : '')
    }
    if (time.hour === 0 && time.min === 0) {
        returnStr += '0 ' + t.labels.PBNA_MOBILE_MIN
    }
    return returnStr
}

export const showExistProductAlert = (storeName: string, isRoute = false) => {
    const title = `${storeName} ${
        isRoute
            ? t.labels.PBNA_MOBILE_HAS_ORDER_IN_PROGRESS_FOR_SWITCH_ROUTE
            : t.labels.PBNA_MOBILE_HAS_ORDER_IN_PROGRESS
    }`
    Alert.alert(title, undefined, [
        {
            text: t.labels.PBNA_MOBILE_CANCEL
        }
    ])
}

export const showExistInProgressVisitAlert = (storeName: string, isRoute = false) => {
    const title = `${storeName} ${
        isRoute
            ? t.labels.PBNA_MOBILE_HAS_VISIT_IN_PROGRESS_FOR_SWITCH_ROUTE
            : t.labels.PBNA_MOBILE_HAS_VISIT_IN_PROGRESS
    }`
    Alert.alert(title, undefined, [
        {
            text: t.labels.PBNA_MOBILE_CANCEL
        }
    ])
}

export const showCopilotAlert = (title: string, onPress?: Function) => {
    const opts: object[] = [{ text: t.labels.PBNA_MOBILE_CANCEL }]
    if (onPress) {
        opts.push({
            text: t.labels.PBNA_MOBILE_YES,
            onPress: () => {
                onPress()
            }
        })
    }
    Alert.alert(title, undefined, opts)
}

export const isCopilotInternetReachable = async (title: string) => {
    const state = await NetInfo.fetch()
    if (!state?.isInternetReachable) {
        showCopilotAlert(title)
        return false
    }
    return true
}

export const areOrdersSentToOCH = async (title: string) => {
    const orderStatus = await OrderService.getTodayLocalOrdersStatus()
    if (orderStatus.total > 0 && orderStatus.completed < orderStatus.total) {
        showCopilotAlert(title)
        return false
    }
    return true
}

export const onPSRLogout = async (logoutFunc: Function) => {
    const isSubmittedOrdersOK = await areOrdersSentToOCH(t.labels.PBNA_MOBILE_LOGOUT_UNCOMPLETED_ORDERS)
    if (!isSubmittedOrdersOK) {
        return false
    }
    const isNetInfoOK = await isCopilotInternetReachable(t.labels.PBNA_MOBILE_LOGOUT_OFFLINE)
    if (!isNetInfoOK) {
        return false
    }
    const res = await VisitService.getTodayVisitsWithOrderInProgress()
    if (res?.inProgressOrder) {
        showCopilotAlert(
            `${res.inProgressOrder['RS.Name']} ${t.labels.PBNA_MOBILE_LOGOUT_IN_PROGRESS_ORDERS}`,
            logoutFunc
        )
        return false
    }
    return true
}

export const onPSRSwitchLocation = async () => {
    const res = await VisitService.getTodayVisitsWithOrderInProgress()
    if (res?.inProgressOrder) {
        showCopilotAlert(
            `${res.inProgressOrder['RS.Name']} ${t.labels.PBNA_MOBILE_HAS_ORDER_IN_PROGRESS_FOR_SWITCH_ROUTE}`
        )
        return false
    }
    const isSubmittedOrdersOK = await areOrdersSentToOCH(t.labels.PBNA_MOBILE_SWITCH_LOCATION_UNCOMPLETED_ORDERS)
    if (!isSubmittedOrdersOK) {
        return false
    }
    if (res?.inProgressVisit) {
        showCopilotAlert(
            `${res.inProgressVisit['RS.Name']} ${t.labels.PBNA_MOBILE_HAS_VISIT_IN_PROGRESS_FOR_SWITCH_ROUTE}`
        )
        return false
    }
    const isNetInfoOK = await isCopilotInternetReachable(t.labels.PBNA_MOBILE_SWITCH_LOCATION_OFFLINE)
    if (!isNetInfoOK) {
        return false
    }
    return true
}

export const onPSRSwitchRoute = async () => {
    const res = await VisitService.getTodayVisitsWithOrderInProgress()
    if (res?.inProgressOrder) {
        showCopilotAlert(
            `${res.inProgressOrder['RS.Name']} ${t.labels.PBNA_MOBILE_HAS_ORDER_IN_PROGRESS_FOR_SWITCH_ROUTE}`
        )
        return false
    }
    const isNetInfoOK = await isCopilotInternetReachable(t.labels.PBNA_MOBILE_SWITCH_LOCATION_OFFLINE)
    if (!isNetInfoOK) {
        return false
    }
    return true
}
export interface RemoveVisitFucProp {
    item: Partial<MyDayVisitModel>
    setIsShowRemoveVisitModal: Function
    removedStore: React.RefObject<string>
    rowRefs: React.RefObject<Object>
    setNeedRefresh: Function
    dropDownRef: any
    setSelectedDate: Function
    navigation: NavigationProp<any>
}

export const useMyDayCartClickable = () => {
    const [myDayCardClickable, setMyDayCardClickable] = useState<boolean>(true)
    return { myDayCardClickable, setMyDayCardClickable }
}

const logicalDeleteVisit = async (props: RemoveVisitFucProp) => {
    const {
        item,
        setIsShowRemoveVisitModal,
        removedStore,
        rowRefs,
        setNeedRefresh,
        dropDownRef,
        setSelectedDate,
        navigation
    } = props
    try {
        global.$globalModal.openModal()
        const logMsg = `User removed a visit: ${item.OrderCartIdentifier} at ${formatWithTimeZone(
            moment(),
            TIME_FORMAT.YMDTHMS,
            true,
            true
        )}`
        Instrumentation.leaveBreadcrumb(logMsg, BreadcrumbVisibility.CRASHES_AND_SESSIONS)
        appendLog(Log.MOBILE_INFO, 'orderade:remove a adhoc visit', logMsg)
        const localRes = await VisitService.updateRemovedVisitIntoSoup(item._soupEntryId)
        if (!_.isEmpty(localRes)) {
            await SyncUpService.syncUpLocalData()
            removedStore.current = `${item?.StoreName}`
            global.$globalModal.closeModal()
            setTimeout(() => {
                setNeedRefresh(true)
                rowRefs?.current[item._soupEntryId]?.closeRow()
                setIsShowRemoveVisitModal(true)
                setSelectedDate(todayDateWithTimeZone(true))
                navigation.navigate('MyVisit')
            }, 500)
        }
        // }
    } catch (err) {
        global.$globalModal.closeModal()
        dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_NETWORK_ERR, err)
    }
}

export const showRemoveVisitAlert = (props: RemoveVisitFucProp) => {
    const {
        item,
        setIsShowRemoveVisitModal,
        removedStore,
        rowRefs,
        setNeedRefresh,
        dropDownRef,
        setSelectedDate,
        navigation
    } = props
    Alert.alert(t.labels.PBNA_MOBILE_REMOVE_VISIT, t.labels.PBNA_MOBILE_REMOVE_VISIT_ALERT, [
        { text: t.labels.PBNA_MOBILE_CANCEL, onPress: () => rowRefs?.current[item._soupEntryId]?.closeRow() },
        {
            text: _.capitalize(t.labels.PBNA_MOBILE_REMOVE),
            onPress: () =>
                logicalDeleteVisit({
                    item,
                    setIsShowRemoveVisitModal,
                    removedStore,
                    rowRefs,
                    setNeedRefresh,
                    dropDownRef,
                    setSelectedDate,
                    navigation
                })
        }
    ])
}

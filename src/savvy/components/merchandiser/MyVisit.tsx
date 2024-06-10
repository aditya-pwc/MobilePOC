/**
 * @description Today's visits and future visit page.
 * @author Christopher ZANG
 * @email jiahua.zang@pwc.com
 * @date 2021-02-18
 * @LastModifiedDate 2021-03-22 Shangmin added Visit Float Button.
 */

import React, { useState, useEffect, useRef, useImperativeHandle, useCallback } from 'react'
import NetInfo, { useNetInfo } from '@react-native-community/netinfo'

import {
    View,
    SafeAreaView,
    StatusBar,
    Animated,
    Dimensions,
    NativeAppEventEmitter,
    Easing,
    EmitterSubscription,
    AppState,
    StyleSheet
} from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { SoupService } from '../../service/SoupService'
import { CommonParam } from '../../../common/CommonParam'
import 'moment-timezone'
import LocationService from '../../service/LocationService'
import BreadcrumbsService from '../../service/BreadcrumbsService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import BreakModal from './BreakModal'
import StartMyDayBar from './StartMyDayBar'
import EndMyDayBar from './EndMyDayBar'
import EndMyDayModal from './EndMyDayModal'
import VisitFloatButton from './VisitFloatButton'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import { TodayMetricProps } from '../MyVisit/VisitMetric'
import { WeekBarItemProps } from '../../../common/components/WeekBar'
import MapScreen from '../../pages/MapScreen'
import Draggable from 'react-native-draggable'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import {
    reLoadData,
    syncVLData,
    syncWorkOrders,
    startWatchingUtil,
    updateStartGap
} from '../../utils/MerchandiserUtils'
import { Log } from '../../../common/enums/Log'
import { Instrumentation } from '@appdynamics/react-native-agent'
import Orientation from 'react-native-orientation-locker'
import {
    endDayHelper,
    getCurrentVLFromLocal,
    getVisitsByVL,
    refreshGeoFence,
    resetVariables,
    startDayHelper,
    recordSyncingLogs,
    addADLog
} from '../../helper/merchandiser/MyVisitHelper'
import {
    startEventHelper,
    endEventHelper,
    getActiveEvent,
    syncUpEvent,
    stopWatchIfBreak
} from '../../helper/merchandiser/MyVisitEventHelper'
import {
    setupTimerWhenInit,
    setupTimerAfterStartMyDay,
    clearPushTimer
} from '../../helper/merchandiser/MyVisitPushFlagHelper'
import { EVENT_EMITTER } from '../../enums/MerchandiserEnums'
import { t } from '../../../common/i18n/t'
import AutoRefreshOfSchedule from './AutoRefreshOfSchedule'
import { todayDateWithTimeZone, formatWithTimeZone, tomorrowDateWithTimeZone } from '../../utils/TimeZoneUtils'
import { syncVisitListData } from '../../api/SyncUtils'
import PastFutureList from './MyVisitTab/PastFutureList'
import EndDaySuccessModal from './MyVisitTab/EndDaySuccessModal'
import TodayList from './MyVisitTab/TodayList'
import {
    findCurrentVisitListInTodayData,
    getVisitAndEventDataForPastAndFutureTab,
    isCurrentVlPastAndShiftUser,
    PastFutureDataModel
} from '../../helper/merchandiser/MyVisitDataHelper'
import _ from 'lodash'
import MyEvent from './MyVisitTab/MyEvent'
import { isPersonaMD, Persona } from '../../../common/enums/Persona'
import {
    showEndMyDayAlert,
    showVisitOutDatedAlert,
    cancelDurationAlert,
    setupDurationAlert,
    getAlertMinutes
} from './MyVisitTab/InAppNoti'
import MyVisitMetricHeader from '../MyVisit/MyVisitMetricHeader'
import { DropDownType } from '../../enums/Manager'
import { commonStyle } from '../../../common/styles/CommonStyle'
import CText from '../../../common/components/CText'
import { getStringValue } from '../../utils/LandingUtils'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { addDaysToToday } from '../../../common/utils/TimeZoneUtils'
import { getDBConnection, saveCustomerCB } from '../../../../db-service'
import { Buffer } from 'buffer'
interface MyVisitModal {
    props
    navigation
}
interface VisitListModal {
    visitList: any
}

export const getOverlapVisits = (visitList, deliveryList) => {
    return [...deliveryList].filter((delivery) =>
        [...visitList].some((visit) => {
            return (
                visit.Planned_Date__c === delivery.Planned_Date__c &&
                visit.storeId === (delivery.storeId || delivery.PlaceId)
            )
        })
    )
}

export interface TodayDataModel {
    managerMeetingArray: any[]
    visitAndEventArray: any[]
    mapList: any[]
}

const styles = StyleSheet.create({
    metricHeaderColor: {
        backgroundColor: '#f3f4f7'
    },
    todayListSafeArea: {
        overflow: 'scroll',
        paddingTop: StatusBar.currentHeight,
        marginTop: -20
    },
    marginTop40: {
        marginTop: -40
    },
    animatedView: {
        backgroundColor: '#f3f4f7'
    },
    nightShiftStyle: {
        flex: 1,
        marginHorizontal: 20,
        marginTop: 8,
        height: 1,
        backgroundColor: '#aaa'
    },
    nightShiftLine: {
        display: 'flex',
        flexDirection: 'row'
    }
})
const GETOKTA_URL =
    'https://secure.ite.pepsico.com/oauth2/default/v1/token?grant_type=client_credentials&client_id=0oa1l1a1j5ugmmKnG0h8&client_secret=gVfSzOaODk4PUJ_39k1mSOUz51gm-5DdM4fy9pKB'
const GET_CUSTOMER_URL =
    'https://shonline.dev.mypepsico.com/qamerch/master/schedules/71086034/20240404/Customers_20240404.json'
const GET_SCHEDULE_URL =
    'https://shonline.dev.mypepsico.com/qamerch/master/schedules/71086034/20240404/Schedule_20240404.json'
async function getBearer() {
    const url = 'https://secure.ite.pepsico.com/oauth2/default/v1/token'
    const clientId = '0oa1l1a1j5ugmmKnG0h8'
    const clientSecret = 'gVfSzOaODk4PUJ_39k1mSOUz51gm-5DdM4fy9pKB'
    const requestBody = {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: Object.keys(requestBody)
                .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(requestBody[key]))
                .join('&')
        })

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        const data = await response.json()
        return data.access_token
    } catch (error) {
        console.error('Error:', error)
        return null // or handle error accordingly
    }
}

async function getCustomer(BearerToken) {
    try {
        const response = await fetch(GET_CUSTOMER_URL, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${BearerToken}`,
                Accept: 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Network error')
        }

        const data = await response.json()
        return data.Cust
    } catch (error) {
        throw new Error('Error fetching customer data: ' + error.message)
    }
}

function getSchedule(BearerToken) {
    fetch(GET_SCHEDULE_URL, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${BearerToken}`,
            Accept: 'application/json'
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network error')
            }
            return response.json()
        })
        .then((data) => {
            console.log(data)
        })
}
let customerData = []
async function fetchBearerAndLog() {
    console.log('calling api')
    try {
        const bearer = await getBearer()
        console.log(bearer)
        customerData = await getCustomer(bearer)
        console.log('customer await' + JSON.stringify(customerData))
    } catch (error) {
        console.error('Error:', error)
    }
}

fetchBearerAndLog()
const tableName = 'Customer'

let timeRangeIndex = 0
function useForceUpdateForMyVisit() {
    const [, setValue] = useState(0)
    return () => setValue((value) => value + 1)
}

const MyVisit = (parentProps: MyVisitModal) => {
    let tempTodayList: any[] = []
    const { width, height } = Dimensions.get('window')

    const mapIconSize = 56
    const { navigation } = parentProps
    let watchingEvent = ''
    const netInfo = useNetInfo()
    const animatedHeight = useRef(new Animated.Value(260)).current
    const buttonPad = useRef(new Animated.Value(20)).current
    const breakModal: any = useRef()
    const endDayModal: any = useRef()
    const myVisitMetricHeaderRef: any = useRef()
    const forceUpdate = useForceUpdateForMyVisit()

    const heightIn = (y) => {
        Animated.timing(animatedHeight, {
            toValue: Math.max(260 - 2 * y, 110),
            duration: 500,
            easing: Easing.elastic(1.1),
            useNativeDriver: false
            // bounciness: 0
        }).start()
        Animated.timing(buttonPad, {
            toValue: Math.max(20 - y, 0),
            duration: 500,
            easing: Easing.elastic(1.1),
            useNativeDriver: false
        }).start()
    }

    const isFocused = useIsFocused()
    const { dropDownRef } = useDropDown()
    const [dayStart, setDayStart] = useState(false)
    const [currentVisitListHasVisitOrEvent, setCurrentVisitListHasVisitOrEvent] = useState(false)
    const [dayEnd, setDayEnd] = useState(false)
    const [todayData, setTodayData] = useState<TodayDataModel>(null)
    const todayDataRef = useRef(null)
    const [todayMetric, setTodayMetric] = useState<TodayMetricProps>()

    const [selectedDate, setSelectedDate] = useState(todayDateWithTimeZone(true))
    const [pastFutureFullData, setPastFutureFullData] = useState<any>([])
    const [pastFutureData, setPastFutureData] = useState<PastFutureDataModel>(null)

    const [isLoading, setIsLoading] = useState(false)
    const [clockStart, setClockStart] = useState(false)

    const [breakEvent, setBreakEvent] = useState({
        SubType__c: '',
        Type: '',
        Actual_Start_Time__c: '',
        Manager_Scheduled__c: ''
    })
    const [isAllCompleted, setAllCompleted] = useState(false)
    const [hasInProgressVisit, setHasInProgressVisit] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [mapVisible, setMapVisible] = useState(false)

    const appState = useRef(AppState.currentState)
    const [appStateVal, setAppStateVal] = useState(appState.current)

    let loadData: any = null

    const refreshVisitRef = useRef<{ refreshDataWhenReceiveNotification: () => void }>(null)
    useImperativeHandle(refreshVisitRef, () => ({
        refreshDataWhenReceiveNotification: () => {
            loadData()
        }
    }))

    startWatchingUtil()

    const isTodaySelected = () => {
        return timeRangeIndex === 0
    }

    const onChangePastFutureDate = (value: WeekBarItemProps, pfData = pastFutureFullData) => {
        setSelectedDate(value.date)
        setPastFutureData(pfData[value.date] || {})
    }

    const refreshVisitAndVlIfDateChange = () => {
        if (selectedDate === todayDateWithTimeZone()) {
            timeRangeIndex = 0
        }
        if (isTodaySelected() && selectedDate === todayDateWithTimeZone() && CommonParam.isProcessInitialJobDone) {
            // Need a timer to refresh the screen data
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            getVisitsAndVisitLists('refreshVisitAndVlIfDateChange')
        }
    }

    const onMetricHeaderDateChanged = (date: string, tabIndex: number) => {
        // select Past or Future tab
        if (tabIndex !== 0) {
            timeRangeIndex = tabIndex
            onChangePastFutureDate({ date })
            if (timeRangeIndex === -1 && date === selectedDate) {
                forceUpdate()
            }
            return
        }
        // select Today tab
        timeRangeIndex = tabIndex
        setSelectedDate(date)
    }

    const changeHeaderDate = (date: string, tabIndex: number) => {
        myVisitMetricHeaderRef.current.changeDate(date, tabIndex)
    }

    const checkInProgressVisitList = (pastFutureRes) => {
        const data = Object.keys(pastFutureRes).sort().reverse()
        for (const key of data) {
            const item = pastFutureRes[key]
            if (todayDateWithTimeZone(true) !== key && (item.showEndMyDayButton || item.hasInProgressVisitOrEvent)) {
                if (!isCurrentVlPastAndShiftUser()) {
                    changeHeaderDate(key, todayDateWithTimeZone(true) > key ? -1 : 1)
                    showVisitOutDatedAlert()
                    break
                }
            }
        }
    }

    const refreshInLocationStatus = (cLocation, dataOfToday, watchingClick) => {
        if (!dataOfToday || !dataOfToday.visitAndEventArray) {
            return
        }
        if (
            !cLocation ||
            !cLocation.coords ||
            cLocation.coords.latitude == null ||
            cLocation.coords.longitude == null
        ) {
            storeClassLog(Log.MOBILE_WARN, 'GetPositionFailed', `refreshInLocationStatus: ${getStringValue(cLocation)}`)
            return
        }
        const { data, index } = findCurrentVisitListInTodayData(dataOfToday)

        if (index === -1 || !data || data.length === 0) {
            return
        }

        let tmpTL = data

        const { newData, noNeedRefresh } = refreshGeoFence(cLocation, tmpTL, watchingEvent, watchingClick)
        if (noNeedRefresh) {
            return
        }
        tmpTL = JSON.parse(JSON.stringify(newData))

        const newVisitAndEventArray = _.cloneDeep(dataOfToday.visitAndEventArray)
        newVisitAndEventArray[index].data = tmpTL

        const tempTodayData = { ...dataOfToday, visitAndEventArray: newVisitAndEventArray }

        setTimeout(() => {
            setTodayData(tempTodayData)
        })
    }

    const addInLocationStatusToCurrentVisitList = (dataOfToday) => {
        LocationService.getCurrentPosition(500).then((cLocation: any) => {
            refreshInLocationStatus(cLocation, dataOfToday, true)
        })
    }

    const getPastFutureData = async () => {
        const pastFutureRes = await getVisitAndEventDataForPastAndFutureTab()
        setPastFutureFullData(pastFutureRes)
        if (isTodaySelected()) {
            checkInProgressVisitList(pastFutureRes)
        }
    }

    const checkIsAbleToStartMyDay = (todayDataParams, endDayFlag?) => {
        // for night shift vl end my day can immediately start another vl
        const ifDayStart = endDayFlag ? false : dayStart
        if (_.isEmpty(todayDataParams) || ifDayStart) {
            setCurrentVisitListHasVisitOrEvent(false)
            return
        }

        const { visitAndEventArray, managerMeetingArray } = todayDataParams

        if (_.isEmpty(visitAndEventArray)) {
            setCurrentVisitListHasVisitOrEvent(false)
            return
        }

        const hasMeeting =
            managerMeetingArray?.findIndex((meeting) => meeting.VisitList === CommonParam.visitList.Id) > -1
        const hasVisit =
            visitAndEventArray?.findIndex(
                (ve) => ve.data.length && ve.visitListInfo.visitListId === CommonParam.visitList.Id
            ) > -1

        setCurrentVisitListHasVisitOrEvent(hasMeeting || hasVisit)
    }

    const prepareVisitList = (endDayFlag?) => {
        return new Promise((resolve, reject) => {
            getVisitsByVL()
                .then(async (res) => {
                    setHasInProgressVisit(res.inprogress)
                    setAllCompleted(res.allCompleted)
                    setTodayMetric(res.metricData)
                    setTodayData(res.todayData)
                    addInLocationStatusToCurrentVisitList(res.todayData)

                    tempTodayList = res.todayList

                    checkIsAbleToStartMyDay(res.todayData, endDayFlag)
                    // sort list by sequence. If sequence is null or 0, display at bottom
                    if (tempTodayList.length > 1) {
                        tempTodayList.sort((a, b) => (a.sequence || Infinity) - (b.sequence || Infinity))
                    }

                    resolve(res)
                })
                .catch((err) => {
                    storeClassLog(Log.MOBILE_ERROR, 'prepareVisitList', `err: ${ErrorUtils.error2String(err)}`)
                    reject(err)
                    dropDownRef.current.alertWithType('error', 'prepareVisitList failed', ErrorUtils.error2String(err))
                })
        })
    }

    const setupCurrentVisitListRelatedData = (fromPress?) => {
        return new Promise((resolve) => {
            getCurrentVLFromLocal().then((res: VisitListModal) => {
                const list = res.visitList || {}
                if (list.Status__c) {
                    if (list.Status__c === 'Completed' || list.Status__c === 'Not Started') {
                        setDayStart(false)
                        setDayEnd(true)
                        CommonParam.shiftStatus = 'ended'
                    } else if (!fromPress && list.Status__c === 'In Progress') {
                        setDayStart(true)
                        setDayEnd(false)
                        CommonParam.shiftStatus = 'started'
                    }
                } else {
                    setDayStart(false)
                    setDayEnd(false)
                    CommonParam.shiftStatus = ''
                }
                resolve(res)
            })
        })
    }

    const getVisitsAndVisitLists = async (func: string, fromPress = false, endDayFlag?) => {
        try {
            await setupCurrentVisitListRelatedData(fromPress)
            await getPastFutureData()
            if (
                CommonParam.visitList?.Visit_Date__c === todayDateWithTimeZone(true) ||
                _.isEmpty(CommonParam.visitList) ||
                (CommonParam.Is_Night_Shift__c && CommonParam.visitList?.Visit_Date__c >= addDaysToToday(-1, true))
            ) {
                await prepareVisitList(endDayFlag)
            }
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, `'${func}'`, `err: ${ErrorUtils.error2String(error)}`)
            throw error
        }
    }

    const syncVisitList = async (withRefresh = false, vlOnly = false, endDayFlag?) => {
        if (CommonParam.isSyncing) {
            recordSyncingLogs('syncVisitList: CommonParam.isSyncing is false, so return')
            CommonParam.pendingSync.visitList = true
            dropDownRef.current.alertWithType('info', t.labels.PBNA_MOBILE_COPILOT_SYNC_IN_PROGRESS)
        } else {
            try {
                recordSyncingLogs('syncVisitList: CommonParam.isSyncing setting true')
                CommonParam.isSyncing = true
                if (vlOnly) {
                    await syncVisitListData()
                } else {
                    await syncVLData()
                }
                if (endDayFlag) {
                    await getVisitsAndVisitLists('syncVisitList', false, true)
                } else {
                    await getVisitsAndVisitLists('syncVisitList')
                }
                CommonParam.pendingSync.visitList = false
                CommonParam.pendingSync.visit = false
                CommonParam.pendingSync.scheduledMeeting = false
                AsyncStorage.setItem('pendingSyncItems', JSON.stringify(CommonParam.pendingSync))
                if (withRefresh) {
                    AutoRefreshOfSchedule.autoRefresh()
                }
                recordSyncingLogs('syncVisitList: CommonParam.isSyncing setting false')
                CommonParam.isSyncing = false
            } catch (err) {
                CommonParam.pendingSync.visitList = true
                CommonParam.pendingSync.visit = true
                CommonParam.pendingSync.scheduledMeeting = true
                recordSyncingLogs(
                    `syncVisitList: CommonParam.isSyncing setting false with err ${ErrorUtils.error2String(err)}`
                )
                CommonParam.isSyncing = false
                storeClassLog(Log.MOBILE_ERROR, 'MyVisit.syncVisitList', ErrorUtils.error2String(err))
            }
        }
    }
    const syncAllData = async (withTotalRefresh = false) => {
        if (!CommonParam.isSyncing) {
            try {
                let promiseArr = []
                if (withTotalRefresh) {
                    promiseArr = [syncVisitList(), syncWorkOrders(true)]
                } else {
                    if (
                        CommonParam.pendingSync &&
                        (CommonParam.pendingSync.visitList ||
                            CommonParam.pendingSync.visit ||
                            CommonParam.pendingSync.scheduledMeeting)
                    ) {
                        promiseArr.push(syncVisitList())
                    }
                    if (CommonParam.pendingSync && CommonParam.pendingSync.workOrder) {
                        promiseArr.push(syncWorkOrders())
                    }
                }
                recordSyncingLogs('syncAllData: CommonParam.isSyncing setting true')
                CommonParam.isSyncing = true
                await Promise.all(promiseArr)
                recordSyncingLogs('syncAllData: CommonParam.isSyncing setting false')
                CommonParam.isSyncing = false
                addADLog('syncAllData sync finish')
            } catch (err) {
                addADLog('syncAllData err')
                recordSyncingLogs(
                    `syncAllData: CommonParam.isSyncing setting false err ${ErrorUtils.error2String(err)}`
                )
                CommonParam.isSyncing = false
            }
        }
    }

    const setupEvent = (event) => {
        const hasEvent = !!event
        watchingEvent = hasEvent ? event.Type : ''
        setBreakEvent(event)
        setClockStart(hasEvent)
        CommonParam.inMeeting = hasEvent
    }

    const getEvent = () => {
        getActiveEvent().then((event) => {
            setupEvent(event)
        })
    }

    const registerVisitDurationAlertIfNeeded = (visit) => {
        if (visit.status === 'In Progress') {
            const alertPlanTime = getAlertMinutes(visit.plannedDuration)
            const alertTime =
                (new Date(visit.ActualVisitStartTime).getTime() + alertPlanTime * 60000 - Date.now()) / 60000
            if (alertTime > 0) {
                setupDurationAlert(visit, true, alertTime, alertPlanTime)
            }
        }
    }

    loadData = async () => {
        addADLog(`loadData ${netInfo.isInternetReachable}`)
        if (netInfo.isInternetReachable) {
            if (CommonParam.isSyncing) {
                dropDownRef.current.alertWithType('info', t.labels.PBNA_MOBILE_COPILOT_SYNC_IN_PROGRESS)
                recordSyncingLogs('loadData: CommonParam.isSyncing is false, so return')
            } else {
                resetVariables()
                setIsLoading(true)
                const lastModifiedDate = new Date().toISOString()
                addADLog('syncUp start - pulldown sync')
                await syncAllData(true)
                recordSyncingLogs('loadData: CommonParam.isSyncing setting true')
                CommonParam.isSyncing = true
                addADLog('reLoadData start - pulldown sync')
                reLoadData()
                    .then(() => {
                        addADLog('reLoadData end - pulldown sync')
                        return getVisitsAndVisitLists('loadData')
                    })
                    .then(() => {
                        addADLog(`vl ${tempTodayList.length} ${CommonParam.visitList.Id} - pulldown sync`)
                        getEvent()
                        setIsLoading(false)
                        recordSyncingLogs('loadData: CommonParam.isSyncing setting false')
                        CommonParam.isSyncing = false
                        CommonParam.lastModifiedDate = lastModifiedDate
                        AsyncStorage.setItem('lastModifiedDate', lastModifiedDate)
                    })
                    .catch((err) => {
                        storeClassLog(Log.MOBILE_ERROR, 'MyVisit.loadData', ErrorUtils.error2String(err))
                        setIsLoading(false)
                        recordSyncingLogs(
                            `loadData: CommonParam.isSyncing setting false with err ${ErrorUtils.error2String(err)}`
                        )
                        CommonParam.isSyncing = false
                        if (err.error?.status === 'E97') {
                            dropDownRef.current.alertWithType(
                                'error',
                                'Please try again in a few minutes',
                                'We are having trouble connecting to the server.'
                            )
                        } else {
                            dropDownRef.current.alertWithType('error', 'Failed to download data')
                        }
                    })
            }
        }
    }

    const endDay = () => {
        Instrumentation.reportMetric('End day clicked', 1)
        endDayHelper()
            .then(() => {
                addADLog('endDay endDayHelper finish')
                clearPushTimer()
                setTodayData(null)
                setModalVisible(true)
                // new add
                getVisitsAndVisitLists('endDay-1')
                setTimeout(() => {
                    setDayStart(false)
                    setDayEnd(true)
                    setModalVisible(false)
                }, 2000)
                NetInfo.fetch().then((state) => {
                    Instrumentation.reportMetric('End day sync start', 1)
                    if (state.isInternetReachable) {
                        syncVisitList(true, false, CommonParam.Is_Night_Shift__c ? 'from end' : '')
                        Instrumentation.reportMetric('End day sync end', 1)
                    } else {
                        getVisitsAndVisitLists('endDay-2', false, CommonParam.Is_Night_Shift__c ? 'from end' : '')
                    }
                })
            })
            .catch((err) => {
                if (err === 'sync') {
                    dropDownRef.current.alertWithType('info', t.labels.PBNA_MOBILE_COPILOT_SYNC_IN_PROGRESS)
                } else {
                    setDayStart(false)
                    dropDownRef.current.alertWithType('error', 'Failed to end day', ErrorUtils.error2String(err))
                    storeClassLog(Log.MOBILE_ERROR, 'MD-EndMyDay', `endDay failed: ${ErrorUtils.error2String(err)}`)
                }
            })
    }
    const handleEndDay = () => {
        if (isAllCompleted) {
            endDay()
        } else {
            endDayModal.current.openModal()
        }
    }
    const onClickEndMyDayForPast = (isAllPastVisitCompleted) => {
        if (isAllPastVisitCompleted) {
            endDay()
        } else {
            endDayModal.current.openModal()
        }
    }
    const startDay = () => {
        startDayHelper()
            .then(() => {
                NetInfo.fetch()
                    .then(async (state) => {
                        if (state.isInternetReachable) {
                            syncVisitList(true)
                        } else {
                            await getVisitsAndVisitLists('startDay', true)
                            CommonParam.pendingSync.visitList = true
                            AsyncStorage.setItem('pendingSyncItems', JSON.stringify(CommonParam.pendingSync))
                        }
                    })
                    .catch((err) => {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'MD-StartMyDay',
                            `fetch netInfo failed: ${ErrorUtils.error2String(err)}`
                        )
                    })
                try {
                    setupTimerAfterStartMyDay(tempTodayList)
                } catch (error) {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'MyVisit.startDay.setupTimerAfterStartMyDay',
                        ErrorUtils.error2String(error)
                    )
                }

                setTimeout(() => {
                    setDayStart(true)
                    setDayEnd(false)
                    BreadcrumbsService.startMyDay()
                }, 2000)
            })
            .catch((err) => {
                if (err === 'sync') {
                    dropDownRef.current.alertWithType('info', t.labels.PBNA_MOBILE_COPILOT_SYNC_IN_PROGRESS)
                } else {
                    setDayStart(false)
                    dropDownRef.current.alertWithType('error', 'Failed to start day', ErrorUtils.error2String(err))
                    storeClassLog(Log.MOBILE_ERROR, 'MD-StartMyDay', `startDay failed: ${ErrorUtils.error2String(err)}`)
                }
            })
    }

    const onStartEvent = (type, item?) => {
        addADLog(`onStartEvent ${type}`)
        if (CommonParam.isSyncing) {
            dropDownRef.current.alertWithType('info', t.labels.PBNA_MOBILE_COPILOT_SYNC_IN_PROGRESS)
            return
        }

        stopWatchIfBreak(type)
        startEventHelper(type, item).then(async (result) => {
            setupEvent(result.eventToDo)

            if (result.event.Manager_Scheduled__c === '1') {
                await prepareVisitList()
            }
            syncUpEvent().then(() => {
                getEvent()
            })
            updateStartGap()
        })
    }
    const onEndEvent = (item) => {
        if (CommonParam.isSyncing) {
            dropDownRef.current.alertWithType('info', t.labels.PBNA_MOBILE_COPILOT_SYNC_IN_PROGRESS)
            return
        }
        return new Promise((resolve, reject) => {
            endEventHelper(item).then((eventToUpdate) => {
                SoupService.updateDataWithPartialParamsIntoSoupWithQuery(
                    'Event',
                    ` WHERE {Event:_soupEntryId} = '${eventToUpdate._soupEntryId}'`,
                    eventToUpdate
                )
                    .then(async (res: any) => {
                        if (res?.length > 0) {
                            const updatedEvent = res[0]
                            if (
                                formatWithTimeZone(updatedEvent.StartDateTime, TIME_FORMAT.Y_MM_DD, true, false) ===
                                todayDateWithTimeZone(true)
                            ) {
                                // refresh today's visit if end today's event
                                prepareVisitList()
                            } else {
                                // refresh all visit if end past event
                                getVisitsAndVisitLists('onEndEvent')
                            }
                        } else {
                            prepareVisitList()
                        }

                        setupEvent(null)
                        syncUpEvent()
                        resolve('done')
                    })
                    .catch((err) => {
                        CommonParam.pendingSync.scheduledMeeting = false
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'MD-EndEvent',
                            `End event failed-Local: ${ErrorUtils.error2String(err)}`
                        )
                        reject(err)
                    })
            })
        })
    }

    const onOpen = () => {
        breakModal.current.openModal()
    }

    const onAppEnterForeground = async () => {
        if (CommonParam.PERSONA__c !== Persona.MERCHANDISER) {
            return
        }

        const lastSyncDate = await AsyncStorage.getItem('lastSyncDate')
        if (lastSyncDate !== todayDateWithTimeZone()) {
            return
        }

        await getVisitsAndVisitLists('onAppEnterForeground', false)
    }

    const handleAppStateChange = async (nextAppState) => {
        appState.current = nextAppState
        setAppStateVal(appState.current)
    }

    const [localCustomer, setLocalCustomer] = useState([])
    const loadDataCallback = useCallback(async () => {
        try {
            console.log('calling loadDatacallback')
            await getDBConnection()

            const data = await saveCustomerCB(customerData)
            console.log('new saveCustomerCB' + data)
            const mod= JSON.parse(data)

            const mod2= mod[0].Customer
            // const newData = data?.map((item) => item.Customer)
            // setLocalCustomer([...newData])
            //  await saveCustomerCB(customerData)

            // await createCustomerTableCB()

            // await db.executeSql(`DROP TABLE IF EXISTS ${tableName}`)
            // await createCustomerTable(db)

            // console.log(customerData)
            // await saveCustomerItems(db, customerData)
            // const data = await getCustomerData(db)
            setLocalCustomer([mod2])
            // console.log('customerData')
            // console.log(data)
            // setLocalCustomer([...data])
        } catch (error) {
            console.error(error)
        }
    }, [])
    useEffect(() => {
        console.log('inside useEffect')
        loadDataCallback()
    }, [])

    useEffect(() => {
        todayDataRef.current = todayData
    }, [todayData])

    useEffect(() => {
        cancelDurationAlert()
        for (const visitDate in pastFutureFullData) {
            pastFutureFullData[visitDate]?.mapList.forEach((visit) => {
                registerVisitDurationAlertIfNeeded(visit)
            })
        }
        setPastFutureData(pastFutureFullData[selectedDate])
    }, [pastFutureFullData])

    useEffect(() => {
        if (appStateVal === 'active' && CommonParam.isProcessInitialJobDone) {
            onAppEnterForeground()
        }
    }, [appStateVal])

    const emitterPosition = () => {
        return NativeAppEventEmitter.addListener(
            'WatchPosition',
            _.throttle(async function (cLocation) {
                refreshInLocationStatus(cLocation, todayDataRef.current, false)
            }, 3000)
        )
    }

    useEffect(() => {
        refreshVisitAndVlIfDateChange()
    }, [selectedDate])

    useEffect(() => {
        Orientation.lockToPortrait()
        let notificationEmitter: EmitterSubscription
        let positionEmitter: EmitterSubscription
        if (isFocused) {
            setIsLoading(true)
            CommonParam.isProcessInitialJobDone = false
            notificationEmitter = NativeAppEventEmitter.addListener('notification', (data) => {
                addADLog(`notification ${data.IsToday}`)
                getVisitsAndVisitLists('notification', false).then(() => {
                    setMapVisible(false)
                    setModalVisible(false)
                    breakModal.current.closeModal()
                    endDayModal.current.closeModal()
                    if (data.IsToday === 'false') {
                        changeHeaderDate(tomorrowDateWithTimeZone(true), 1)
                    } else {
                        changeHeaderDate(todayDateWithTimeZone(true), 0)
                    }
                })
            })
            getEvent()
            getVisitsAndVisitLists('isFocused').then(() => {
                addADLog(`Enter my visit ${tempTodayList.length} ${CommonParam.visitList.Id}`)
                positionEmitter = emitterPosition()
                BreadcrumbsService.startBreadcrumbsService(dayEnd, clockStart)
                if (CommonParam.visitList?.Visit_Date__c === todayDateWithTimeZone(true)) {
                    setupTimerWhenInit(tempTodayList)
                }
                CommonParam.isProcessInitialJobDone = true
                setIsLoading(false)
            })
        } else {
            positionEmitter = emitterPosition()
        }
        return () => {
            CommonParam.isProcessInitialJobDone = false
            notificationEmitter && notificationEmitter.remove()
            positionEmitter && positionEmitter.remove()
        }
    }, [isFocused])

    useEffect(() => {
        if (netInfo.isInternetReachable) {
            addADLog('NetInfo isInternetReachable')
            syncAllData()
        }
    }, [netInfo.isInternetReachable])

    useEffect(() => {
        const myVisitRefreshListener = NativeAppEventEmitter.addListener(EVENT_EMITTER.REFRESH_MY_VISITS, async () => {
            addADLog('RefreshMyVisits')
            refreshVisitRef.current.refreshDataWhenReceiveNotification()
            addADLog(`RefreshMyVisits done ${tempTodayList.length} ${CommonParam.visitList.Id}`)
        })
        AppState.addEventListener('change', handleAppStateChange)
        return () => {
            CommonParam.isProcessInitialJobDone = false
            myVisitRefreshListener && myVisitRefreshListener.remove()
            AppState.removeEventListener('change', handleAppStateChange)
        }
    }, [])

    const renderEndMyDayIfVisible = () => {
        if (!CommonParam.isProcessInitialJobDone) {
            return null
        }
        let isNightShiftVl = false
        const vlDate = CommonParam.visitList?.Visit_Date__c
        if (vlDate !== todayDateWithTimeZone(true)) {
            if (isCurrentVlPastAndShiftUser()) {
                isNightShiftVl = true
            }
        }

        const isEndMyDayButtonVisible = dayStart && !dayEnd && !hasInProgressVisit && !clockStart
        if (!isEndMyDayButtonVisible) {
            if (isNightShiftVl) {
                return (
                    <View style={styles.nightShiftLine}>
                        <View style={styles.nightShiftStyle} />
                        <CText>{t.labels.PBNA_MOBILE_NIGHT_SHIFT}</CText>
                        <View style={styles.nightShiftStyle} />
                    </View>
                )
            }
            return null
        }

        return (
            <EndMyDayBar
                isAllCompleted={isAllCompleted}
                onEnd={() => {
                    if (isLoading) {
                        dropDownRef.current.alertWithType(DropDownType.INFO, t.labels.PBNA_WAIT_SYNC_FINISH)
                    } else {
                        showEndMyDayAlert(handleEndDay)
                    }
                }}
            />
        )
    }

    const renderEndMyDayForPastTab = () => {
        const { showEndMyDayButton, isAllPastVisitCompleted } = pastFutureData
        if (showEndMyDayButton) {
            return (
                <EndMyDayBar
                    isAllCompleted={isAllPastVisitCompleted}
                    onEnd={() => {
                        onClickEndMyDayForPast(isAllPastVisitCompleted)
                    }}
                />
            )
        }
        return null
    }

    const renderTodayList = () => {
        return (
            <SafeAreaView style={[styles.todayListSafeArea, commonStyle.flex_1]}>
                <SafeAreaView style={commonStyle.flex_1}>
                    {!dayStart && CommonParam.isProcessInitialJobDone && (
                        <StartMyDayBar onStart={startDay} disabled={!currentVisitListHasVisitOrEvent || clockStart} />
                    )}

                    {clockStart && (
                        <MyEvent
                            breakEvent={breakEvent}
                            onEndEvent={() => {
                                onEndEvent(breakEvent)
                            }}
                        />
                    )}
                    <Animated.View
                        style={[
                            commonStyle.flex_1,
                            styles.animatedView,
                            { top: buttonPad },
                            clockStart && breakEvent && styles.marginTop40
                        ]}
                    >
                        <TodayList
                            navigation={navigation}
                            todayData={todayData}
                            isLoading={isLoading}
                            dayStart={dayStart}
                            onContentOffsetYChange={heightIn}
                            onPullDownRefresh={loadData}
                            clockStart={clockStart}
                            onStartMeeting={onStartEvent}
                            onEndMeeting={onEndEvent}
                            footerComponent={renderEndMyDayIfVisible}
                        />
                    </Animated.View>
                </SafeAreaView>
            </SafeAreaView>
        )
    }
    const url =
        'https://zalu452hr1nzt1yc.apps.cloud.couchbase.com:4984/demoemployee/_all_docs?include_docs=true&limit=5'
    const username = 'halomobile'
    const password = 'Halo@123'
    const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64')

    let cbData = []
    let outputData = []
    const CBfetchData = async () => {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: 'Basic ' + encodedCredentials
                }
            })

            if (!response.ok) {
                throw new Error('Netwrok response was not ok. Status' + response.status)
            }
            const jsonData = await response.json()
            console.log('here1')
            cbData = jsonData.rows
            console.log(cbData)
            outputData = cbData.map((item) => item.doc)
            return outputData
        } catch (e) {
            console.error('Error', e)
        }
    }

    // const callcbfetch = async()=>{
    //     console.log('Couchbase response')
    //     const cb= await CBfetchData()
    //     console.log(cb)

    // }
    // callcbfetch()

    const renderMetricHeader = () => {
        return (
            <MyVisitMetricHeader
                cRef={myVisitMetricHeaderRef}
                onDateChanged={onMetricHeaderDateChanged}
                animatedHeight={animatedHeight}
                todayMetric={todayMetric}
            />
        )
    }

    const isTodayChosen = isTodaySelected()
    return (
        <View style={[styles.metricHeaderColor, commonStyle.flex_1]}>
            <EndDaySuccessModal modalVisible={modalVisible} setModalVisible={setModalVisible} />
            <BreakModal cRef={breakModal} navigation={navigation} enterClock={onStartEvent} />
            <EndMyDayModal cRef={endDayModal} navigation={navigation} onEnd={endDay} />

            {renderMetricHeader()}
            {mapVisible && (
                <MapScreen
                    incomingVisits={isTodayChosen ? todayData?.mapList || [] : pastFutureData?.mapList || []}
                    navigation={navigation}
                    // dynamic style
                    mapScreenStyle={{ height: isTodayChosen ? 590 : 680 }}
                    selectedDay={selectedDate}
                    isMM={false}
                />
            )}
            {!mapVisible && (
                <SafeAreaView style={commonStyle.flex_1}>
                    {isTodayChosen && renderTodayList()}
                    {pastFutureData && !isTodayChosen && (
                        <PastFutureList
                            // dayList={pastFutureData.visitAndEventArray || []}
                            dayList={localCustomer}
                            meetingList={pastFutureData.managerMeetingArray || []}
                            navigation={navigation}
                            isLoading={isLoading}
                            footerComponent={renderEndMyDayForPastTab}
                            onPullDownRefresh={loadData}
                        />
                    )}
                </SafeAreaView>
            )}
            {isPersonaMD() && (
                <Draggable
                    x={width * 0.75}
                    y={height * 0.75}
                    minX={0}
                    minY={90}
                    maxX={width}
                    maxY={height - 80}
                    renderSize={mapIconSize}
                    isCircle
                    imageSource={mapVisible ? ImageSrc.IMG_ICON_LIST : ImageSrc.IMG_ICON_MAP}
                    onShortPressRelease={() => {
                        if (!mapVisible) {
                            heightIn(0)
                            Instrumentation.reportMetric('Merchandiser MAP VIEW BTN', 1)
                        }
                        setMapVisible(!mapVisible)
                    }}
                />
            )}
            {!mapVisible && isPersonaMD() && (
                <VisitFloatButton
                    navigation={navigation}
                    dayStart={dayStart}
                    inClockStart={clockStart}
                    timeRangeIndex={timeRangeIndex}
                    disableForPastVL={isCurrentVlPastAndShiftUser()}
                    onPressClock={() => {
                        onOpen()
                    }}
                />
            )}
        </View>
    )
}

export default MyVisit

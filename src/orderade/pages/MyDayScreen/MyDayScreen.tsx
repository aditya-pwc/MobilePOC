import React, { createContext, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Animated, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native'
import { NavigationProp, useIsFocused } from '@react-navigation/native'
import MyDayScreenHeader from '../../component/visits/MyDayScreenHeader'
import { MyDayVisitList } from '../../component/visits/SalesMyDay'
import VisitFloatButton from '../../component/visits/VisitFloatButton'
import { getStartEndButtonStatus, useOrderStatus, useRouteInfoData, useVisitsData } from './VisitsHooks'
import { formatWithTimeZone, todayDateWithTimeZone } from '../../../common/utils/TimeZoneUtils'
import StartMyDayButton from '../../component/visits/StartMyDayButton'
import EndMyDayButton from '../../component/visits/EndMyDayButton'
import PushOrderBar from '../../component/visits/PushOrderBar'
import NetInfo from '@react-native-community/netinfo'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { addADLog, showEndMyDayAlert } from '../../utils/VisitUtils'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import { DropDownType } from '../../enum/Common'
import CModal from '../../../common/components/CModal'
import BreakModal from '../../component/visits/BreakModal'
import MyEvent from '../../component/visits/MyEvent'
import { CommonParam } from '../../../common/CommonParam'
import EndDaySuccessModal from '../../component/visits/EndDaySuccessModal'
import EndMyDayModal from '../../component/visits/EndMyDayModal'
import { formatString } from '../../utils/CommonUtil'
import SyncUpService from '../../service/SyncUpService'
import { VisitListStatus } from '../../enum/VisitListStatus'
import { appendLog, storeClassLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import { t } from '../../../common/i18n/t'
import RemoveVisitSuccessModal from '../../component/visits/RemoveVisitSuccessModal'
import _ from 'lodash'
import moment from 'moment'
import { BreadcrumbVisibility, Instrumentation } from '@appdynamics/react-native-agent'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { useAppDispatch, useAppSelector } from '../../../savvy/redux/ReduxHooks'
import { myDaySelectedDateSelector, MyDayTabEnum, myDayTabSelector } from '../../redux/slice/MyDaySlice'
import { useRouteInfoMetrics } from '../../hooks/MyDayHooks'
import EventService from '../../service/EventService'
import VisitService from '../../service/VisitService'
import SyncDownService from '../../service/SyncDownService'
import RouteInfoModal from '../../component/visits/RouteInfoModal'
import { FullScreenModalRef } from '../../../savvy/components/rep/lead/common/FullScreenModal'
import RouteInfoService from '../../service/RouteInfoService'

interface MyDayScreenProps {
    navigation: NavigationProp<any>
    route: any
}

const style = StyleSheet.create({
    flex1: {
        flex: 1
    }
})

const MIN_HEADER_HEIGHT = 115
const MAX_HEADER_HEIGHT = 260
const MAX_HEADER_HEIGHT_WITH_ORDERING = 324

export const RouteModalContext = createContext<FullScreenModalRef>()

const MyDayScreen = (props: MyDayScreenProps) => {
    const { navigation } = props
    const myVisitMetricHeaderRef: any = useRef()
    const visitRowRefs = useRef({})
    const animatedHeight = useRef(new Animated.Value(MAX_HEADER_HEIGHT)).current
    const [selectedDate, setSelectedDate] = useState(todayDateWithTimeZone(true))
    const isToday = selectedDate === todayDateWithTimeZone(true)
    const routeModalRef = useRef<FullScreenModalRef>(null)
    const [routeInfoFlag, setRouteInfoFlag] = useState(0)
    const dispatch = useAppDispatch()
    useRouteInfoMetrics(dispatch, routeInfoFlag)
    const tab = useAppSelector(myDayTabSelector)
    const selectedDateRoute = useAppSelector(myDaySelectedDateSelector)
    const [maxHeaderHeight, setMaxHeaderHeight] = useState(324)
    useEffect(() => {
        if (CommonParam.OrderingFeatureToggle) {
            setMaxHeaderHeight(MAX_HEADER_HEIGHT_WITH_ORDERING)
            animatedHeight.setValue(MAX_HEADER_HEIGHT_WITH_ORDERING)
        } else {
            setMaxHeaderHeight(MAX_HEADER_HEIGHT)
        }
    }, [])
    const maxScrollHeight = useMemo(() => {
        return maxHeaderHeight - MIN_HEADER_HEIGHT
    }, [maxHeaderHeight])
    let localMaxHeight = 0
    const mapNumRange = (num: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
        return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
    }
    const onVisitsListScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent
        if (selectedDate !== todayDateWithTimeZone(true)) {
            return
        }
        const offsetY = contentOffset.y
        // This is the max scroll offset Y length that user can reach
        const tempMaxHeight = contentSize.height - layoutMeasurement.height
        localMaxHeight = tempMaxHeight > localMaxHeight ? tempMaxHeight : localMaxHeight
        // Limit the max height so that when the list is too long
        // The metric won't take forever to fold
        const scrollThrottle = localMaxHeight > maxScrollHeight ? maxScrollHeight : localMaxHeight
        // Map the input scroll offset Y to a range
        const outputHeight = maxHeaderHeight - mapNumRange(offsetY, 0, scrollThrottle, 0, maxScrollHeight)
        // Prevent the metric from stretching too long or shrinking too short
        let finalOutputHeight
        if (outputHeight > maxHeaderHeight) {
            finalOutputHeight = maxHeaderHeight
        } else if (outputHeight < MIN_HEADER_HEIGHT) {
            finalOutputHeight = MIN_HEADER_HEIGHT
        } else {
            finalOutputHeight = outputHeight
        }
        animatedHeight.setValue(finalOutputHeight)
    }
    const [needRefresh, setNeedRefresh] = useState<boolean>(false)
    const { allData } = useVisitsData(selectedDate, needRefresh, setNeedRefresh)
    const { myVisitsSectionList, metric, userVisitLists } = allData
    const [clockStart, setClockStart] = useState(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isShowEndedModal, setIsShowEndedModal] = useState<boolean>(false)
    const [isShowNotCompleteEndModal, setIsShowNotCompleteEndModal] = useState<boolean>(false)
    const [isShowRemoveVisitModal, setIsShowRemoveVisitModal] = useState<boolean>(false)
    const [isInprogressVisits, setInProgressVisit] = useState<boolean>(false)
    const { dropDownRef } = useDropDown()
    const removedStore = useRef<string>('')
    const isFocused = useIsFocused()
    const [startEndButtonStatus, setStartEndButtonStatus] = useState({
        showStartButton: false,
        startButtonDisabled: false,
        showEndButton: false
    })
    const breakModal: any = useRef()
    const [breakEvent, setBreakEvent] = useState({
        SubType__c: '',
        Type: '',
        Actual_Start_Time__c: '',
        Manager_Scheduled__c: ''
    })
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
    const isExistInProgressVl = !!userVisitLists.find((vl) => vl.Status === VisitListStatus.IN_PROGRESS)
    const [isShowOCHSuccessModal, setIsShowOCHSuccessModal] = useState<boolean>(false)
    const { orderStatus, updateOrderStatus } = useOrderStatus(myVisitsSectionList)
    const hasUncompletedOrders = !!(orderStatus.total && orderStatus.completed < orderStatus.total)
    const [isSyncing, setIsSyncing] = useState(false)
    const isSyncingRef = useRef({})
    const routeInfoData = useRouteInfoData(selectedDateRoute, routeInfoFlag)

    useEffect(() => {
        VisitService.checkIsAnyCurrentUserVisitsInProgress(
            selectedDate,
            setInProgressVisit,
            myVisitsSectionList,
            dropDownRef
        )
        setStartEndButtonStatus(getStartEndButtonStatus(userVisitLists, isToday, tab))
    }, [userVisitLists, allData, tab])

    useEffect(() => {
        if (selectedDate !== todayDateWithTimeZone(true)) {
            NetInfo.fetch()
                .then(async (state) => {
                    if (!state.isInternetReachable) {
                        setSelectedDate(todayDateWithTimeZone(true))
                    }
                })
                .catch(() => {
                    setSelectedDate(todayDateWithTimeZone(true))
                })
        }
    }, [isFocused])

    // refresh geo fence every 2 minutes
    const refreshGeoFence = () => {
        return setInterval(() => {
            setNeedRefresh(true)
        }, 2 * 60 * 1000)
    }

    useEffect(() => {
        const intervalId = refreshGeoFence()
        return () => {
            clearInterval(intervalId)
        }
    }, [isFocused])

    const onMetricHeaderDateChanged = (date: string) => {
        setSelectedDate(date)
    }

    const openBreakModal = () => {
        breakModal.current.openModal()
    }

    const renderMetricHeader = () => {
        return (
            <MyDayScreenHeader
                cRef={myVisitMetricHeaderRef}
                onDateChanged={onMetricHeaderDateChanged}
                animatedHeight={animatedHeight}
                todayMetric={metric}
                isRefreshing={isRefreshing}
                startEndButtonStatus={startEndButtonStatus}
            />
        )
    }

    const closeAllRows = (allRowRefs: React.RefObject<Object>) => {
        if (!_.isEmpty(allRowRefs?.current)) {
            for (const key in allRowRefs?.current) {
                if (allRowRefs?.current[key]?.isOpen) {
                    allRowRefs?.current[key]?.closeRow()
                }
            }
        }
    }

    const onStart = async () => {
        if (isLoading) {
            return
        }
        closeAllRows(visitRowRefs)
        setIsLoading(true)
        // the button has an animation time of 2000,
        // if the logic is faster than that, we need to wait for the full animation
        global.$globalModal.openModal()
        const res = await Promise.all([
            VisitService.startDay(userVisitLists).catch((e) => e),
            new Promise((resolve) => {
                setTimeout(resolve, 2000)
            })
        ])
        global.$globalModal.closeModal()
        if (res[0] instanceof Error) {
            dropDownRef.current.alertWithType('error', 'Start My Day failed', res[0].message)
        }
        setNeedRefresh(true)
        setIsLoading(false)
    }

    const _onEnd = async () => {
        if (isLoading) {
            return
        }
        closeAllRows(visitRowRefs)
        setIsLoading(true)
        global.$globalModal.openModal()
        try {
            await VisitService.endDay(userVisitLists)
            global.$globalModal.closeModal()
            setTimeout(() => {
                setNeedRefresh(true)
                setIsShowEndedModal(true)
                setIsLoading(false)
            }, 1000)
            setTimeout(() => {
                setIsShowEndedModal(false)
            }, 3000)
        } catch (err) {
            dropDownRef.current.alertWithType('error', 'End My Day failed', JSON.stringify(err))
            storeClassLog(Log.MOBILE_ERROR, '_onEnd', 'End My Day failed' + JSON.stringify(err))
            global.$globalModal.closeModal()
        }
    }

    const { showStartButton, startButtonDisabled, showEndButton } = startEndButtonStatus

    const handleEnd = () => {
        // uncompleted orders take priority over in progress visit
        // if orders are not pushed to OCH, show <EndMyDayModal />
        // if there are in progress visits, execute showEndMyDayAlert
        // please check hasUncompletedOrders prop in <EndMyDayModal />
        if (hasUncompletedOrders) {
            setIsShowNotCompleteEndModal(true)
        } else if (isInprogressVisits) {
            showEndMyDayAlert(_onEnd, closeAllRows, visitRowRefs)
        } else {
            setIsShowNotCompleteEndModal(true)
        }
    }

    const startMyDayButtonProps = {
        onStart,
        disabled: startButtonDisabled
    }

    const endMyDayButtonProps = {
        onEnd: handleEnd,
        // hasUncompletedOrders has other routes' orders, may need calculate orders based on current route
        isAllCompleted: isInprogressVisits && !hasUncompletedOrders
    }

    const setupEvent = (event) => {
        const hasEvent = !!event
        setBreakEvent(event)
        setClockStart(hasEvent)
        CommonParam.inMeeting = hasEvent
    }

    const getEvent = async () => {
        const event = await EventService.getActiveEvent()
        setupEvent(event)
    }

    useEffect(() => {
        getEvent()
        isSyncingRef.current = CommonParam.isSyncing
        setIsSyncing(CommonParam.isSyncing)
        Object.defineProperty(CommonParam, 'isSyncing', {
            get() {
                return isSyncingRef.current
            },
            set(value) {
                isSyncingRef.current = value
                setIsSyncing(value)
            },
            enumerable: true,
            configurable: true
        })
        return () => {
            Object.defineProperty(CommonParam, 'isSyncing', {
                value: isSyncingRef.current,
                enumerable: true,
                configurable: true,
                writable: true
            })
        }
    }, [])

    const onStartEvent = async (type, item?) => {
        addADLog(`onStartEvent ${type}`)
        if (CommonParam.isSyncing) {
            dropDownRef.current.alertWithType('info', t.labels.PBNA_MOBILE_COPILOT_SYNC_IN_PROGRESS)
            return
        }
        const eventTodo = await EventService.createEventLocalData(type, userVisitLists, item)
        setupEvent(eventTodo)
        // make it asynchronous, so it will not block UI render
        EventService.syncUpEvent().then((result: any) => {
            if (result) {
                getEvent()
            }
        })
    }

    const onEndEvent = async (item) => {
        if (CommonParam.isSyncing) {
            dropDownRef.current.alertWithType('info', t.labels.PBNA_MOBILE_COPILOT_SYNC_IN_PROGRESS)
            return
        }
        await EventService.updateEventLocalData(item)
        setupEvent(null)
        setNeedRefresh(true)
        EventService.syncUpEvent()
    }

    const onPlusButtonPress = () => {
        // Since there will be animation before it fully opens
        // Add a buffer to close it after all rows fully open
        setTimeout(() => closeAllRows(visitRowRefs), 650)
    }

    const onRefresh = async () => {
        if (isRefreshing) {
            return
        }
        setIsRefreshing(true)
        const state = await NetInfo.fetch()
        if (!state?.isInternetReachable) {
            Alert.alert(t.labels.PBNA_MOBILE_OFFLINE_SYNC, undefined, [
                {
                    text: t.labels.PBNA_MOBILE_CANCEL,
                    onPress: () => {
                        setIsRefreshing(false)
                    }
                },
                {
                    text: t.labels.PBNA_MOBILE_RETRY,
                    style: 'default',
                    onPress: onRefresh
                }
            ])
            return
        }
        if (tab === MyDayTabEnum.RouteInfo) {
            await RouteInfoService.syncMyDayRoutInfoData()
            setRouteInfoFlag((v) => v + 1)
            setIsRefreshing(false)
        } else {
            let tabDay
            if (isToday) {
                tabDay = 'today'
            } else if (moment(selectedDate) < moment(todayDateWithTimeZone(true))) {
                tabDay = 'past'
            } else {
                tabDay = 'future'
            }
            Instrumentation.startTimer(`User pull down refresh on My Day ${tabDay} Tab`)
            // if today, we push och and sync up only today's order now
            // past order push och and sync up is moved to past tab pull down
            // since past visit will not change, its safe that we invoke a separate _syncUpLocalData
            if (tabDay === 'today') {
                await SyncUpService.syncUpLocalData()
            } else if (tabDay === 'past') {
                await SyncUpService._syncUpLocalData(true)
            }
            await SyncDownService.deltaSyncDown(selectedDate, dropDownRef)
            Instrumentation.stopTimer(`User pull down refresh on My Day ${tabDay} Tab`)
            const logMsg = `${
                CommonParam.GPID__c
            } has refreshed their My Day screen on ${tabDay} page at ${formatWithTimeZone(
                moment(),
                TIME_FORMAT.YMDTHMS,
                true,
                true
            )}`
            appendLog(Log.MOBILE_INFO, 'orderade:refresh my day page', logMsg)
            setIsRefreshing(false)
            setNeedRefresh(true)
        }
    }

    const onPushOrders = async () => {
        if (isRefreshing) {
            return
        }
        const state = await NetInfo.fetch()
        if (!state?.isInternetReachable) {
            Alert.alert(t.labels.PBNA_MOBILE_PUSH_ORDERS_OFFLINE, undefined, [
                { text: t.labels.PBNA_MOBILE_CANCEL },
                { text: t.labels.PBNA_MOBILE_PUSH_ORDERS_RETRY, onPress: onPushOrders }
            ])
            return
        }
        const logMsg = `User pushed order(s) to OCH using purple banner at ${formatWithTimeZone(
            moment(),
            TIME_FORMAT.YMDTHMS,
            true,
            true
        )}`
        Instrumentation.leaveBreadcrumb(logMsg, BreadcrumbVisibility.CRASHES_AND_SESSIONS)
        appendLog(Log.MOBILE_INFO, 'orderade: start push orders to och', logMsg)
        Instrumentation.startTimer('User pushed order(s) to OCH using purple banner')
        global.$globalModal.openModal()
        const curSyncUpPromise = SyncUpService.syncUpLocalData()
        curSyncUpPromise
            .catch((e: any) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'Orderade: onPushOrders',
                    'Push Orders Fail' + ErrorUtils.error2String(e)
                )
                const logMsg = `User pushed order(s) to OCH using purple banner failed: ${ErrorUtils.error2String(
                    e
                )} at ${formatWithTimeZone(moment(), TIME_FORMAT.YMDTHMS, true, true)}`
                Instrumentation.leaveBreadcrumb(logMsg, BreadcrumbVisibility.CRASHES_AND_SESSIONS)
                appendLog(Log.MOBILE_ERROR, 'orderade: failed to push orders to och', logMsg)
                Instrumentation.stopTimer('User pushed order(s) to OCH using purple banner')
                dropDownRef.current.alertWithType(DropDownType.ERROR, 'Push Orders Fail', e)
            })
            .finally(async () => {
                global.$globalModal.closeModal()
                const orderStatus = await updateOrderStatus()
                Instrumentation.stopTimer('User pushed order(s) to OCH using purple banner')
                if (orderStatus.total && orderStatus.completed >= orderStatus.total) {
                    setTimeout(() => {
                        setIsShowOCHSuccessModal(true)
                    }, 1000)
                    setTimeout(() => {
                        setIsShowOCHSuccessModal(false)
                    }, 3000)
                }
            })
    }

    const endDaySuccessModalProps = {
        isShowEndedModal,
        setIsShowEndedModal
    }
    const endMyDayModalProps = {
        isShowNotCompleteEndModal,
        setIsShowNotCompleteEndModal,
        navigation,
        onEnd: _onEnd
    }
    const myDayListProps = {
        myVisitsSectionList,
        userVisitLists,
        endDayButton: isToday && showEndButton ? <EndMyDayButton {...endMyDayButtonProps} /> : null,
        navigation,
        showStartButton,
        selectedDate,
        setIsShowRemoveVisitModal,
        removedStore,
        setNeedRefresh,
        isToday,
        dropDownRef,
        visitRowRefs,
        isRefreshing,
        onRefresh,
        setSelectedDate,
        routeInfoData,
        selectedDateRoute
    }

    return (
        <RouteModalContext.Provider value={routeModalRef}>
            <View style={style.flex1}>
                {renderMetricHeader()}
                {showStartButton && isToday && <StartMyDayButton {...startMyDayButtonProps} />}
                {clockStart && isToday && (
                    <MyEvent
                        breakEvent={breakEvent}
                        onEndEvent={() => {
                            onEndEvent(breakEvent)
                        }}
                        isShowStartMyDay={showStartButton}
                    />
                )}
                <MyDayVisitList
                    {...myDayListProps}
                    hasUncompletedOrders={hasUncompletedOrders}
                    onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
                        onVisitsListScroll(e)
                    }}
                    isRouteInfo={tab === 1}
                />
                <VisitFloatButton
                    showButton={isToday}
                    navigation={navigation}
                    dayStart={isExistInProgressVl}
                    inClockStart={clockStart}
                    timeRangeIndex={0}
                    onPressClock={openBreakModal}
                    onPlusButtonPress={onPlusButtonPress}
                />
                {isToday && hasUncompletedOrders && (
                    <PushOrderBar
                        icon={ImageSrc.ICON_PUSH_ORDER}
                        text={formatString(t.labels.PBNA_MOBILE_PUSH_ORDER_TEXT, [
                            orderStatus.total - orderStatus.completed + '',
                            orderStatus.total + ''
                        ])}
                        buttonText={t.labels.PBNA_MOBILE_PUSH_ORDER_BUTTON.toLocaleUpperCase()}
                        onPress={onPushOrders}
                        disabled={isSyncing || isRefreshing}
                    />
                )}
                <CModal
                    imgSrc={ImageSrc.IMG_SUCCESS_ICON}
                    showModal={isShowOCHSuccessModal}
                    content={t.labels.PBNA_MOBILE_PUSH_ORDERS_SUCCESSFULLY}
                    disabled
                />
                <BreakModal cRef={breakModal} navigation={navigation} enterClock={onStartEvent} />
                <EndDaySuccessModal {...endDaySuccessModalProps} />
                <RemoveVisitSuccessModal
                    isShowRemoveVisitModal={isShowRemoveVisitModal}
                    setIsShowRemoveVisitModal={setIsShowRemoveVisitModal}
                    storeName={removedStore}
                />
                <EndMyDayModal {...endMyDayModalProps} hasUncompletedOrders={hasUncompletedOrders} />
                <RouteInfoModal cRef={routeModalRef} navigation={navigation} />
            </View>
        </RouteModalContext.Provider>
    )
}

export default MyDayScreen

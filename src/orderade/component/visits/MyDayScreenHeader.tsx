import React, { useEffect, useImperativeHandle } from 'react'
import { Animated, ImageBackground, StyleSheet, View } from 'react-native'
import { addDaysToToday, formatWithTimeZone } from '../../../common/utils/TimeZoneUtils'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import PastTodayFutureTab from './PastTodayFutureTab'
import VisitMetric, { renderMyVisitMetricCase } from './VisitMetric'
import WeekBar from '../../../common/components/WeekBar'
import { BreadcrumbVisibility, Instrumentation } from '@appdynamics/react-native-agent'
import { appendLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import { CommonParam } from '../../../common/CommonParam'
import moment from 'moment'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import SelectTab from '../../../savvy/components/common/SelectTab'
import { t } from '../../../common/i18n/t'
import OrderMetric from '../order/OrderMetric'
import { useAppDispatch, useAppSelector } from '../../../savvy/redux/ReduxHooks'
import {
    MyDayTabEnum,
    myDayTabSelector,
    selectTab,
    selectTimeRange,
    MyDayTimeRangeEnum,
    myDayTimeRangeSelector,
    selectDate,
    myDaySelectedDateSelector
} from '../../redux/slice/MyDaySlice'
import { startEndButtonStatus } from '../../pages/MyDayScreen/VisitsHooks'

interface TodayMetricFrontProps {
    totalNum: number
    completeNum: number
    remainNum: number
    orderTotalNum: number
    orderCompleteNum: number
}

interface MyDayScreenProps {
    cRef: any
    onDateChanged: (date: string, tabIndex: number) => void
    animatedHeight: Animated.Value
    todayMetric: any
    startEndButtonStatus: startEndButtonStatus
    visitNum?: TodayMetricFrontProps
    showMetric?: boolean
    isRefreshing?: boolean
}

const styles = StyleSheet.create({
    metricHeaderContainer: {
        paddingLeft: 22,
        paddingRight: 0
    },
    visitMetricWrapper: {
        paddingRight: 20
    },
    selectTabWrapper: {
        marginTop: 30,
        marginLeft: -22
    }
})

const MyDayScreenHeader = (props: MyDayScreenProps) => {
    const {
        cRef,
        onDateChanged,
        animatedHeight,
        todayMetric,
        showMetric = true,
        isRefreshing,
        startEndButtonStatus
    } = props
    const tabList = [
        { name: t.labels.PBNA_MOBILE_MY_DAY.toUpperCase() },
        { name: t.labels.PBNA_MOBILE_ROUTE_INFO.toUpperCase() }
    ]
    const timeRangeIndex = useAppSelector(myDayTimeRangeSelector)
    const selectedDate = useAppSelector(myDaySelectedDateSelector)
    const pastFutureHeight = timeRangeIndex === MyDayTimeRangeEnum.Past ? 250 : 200
    const dispatch = useAppDispatch()
    const tab = useAppSelector(myDayTabSelector)

    const isTodaySelected = () => {
        return timeRangeIndex === MyDayTimeRangeEnum.Today
    }

    const changeDate = (date: string, tabIndex: number) => {
        if (isRefreshing) {
            return
        }
        Instrumentation.leaveBreadcrumb(
            `User selected ${date} on My Day at ${new Date().toISOString()}`,
            BreadcrumbVisibility.CRASHES_AND_SESSIONS
        )
        dispatch(selectTimeRange(tabIndex))
        dispatch(selectDate(date))
        onDateChanged(date, tabIndex)
    }

    useImperativeHandle(cRef, () => ({
        changeDate
    }))

    const getCurrentDay = (index: number) => {
        let currentDay = ''
        switch (index) {
            case 0:
                currentDay = 'today'
                break
            case -1:
                currentDay = 'past'
                break
            default:
                currentDay = 'future'
        }
        return currentDay
    }

    const onSwitchTimeRangeTab = (index: number, title: string) => {
        if (isRefreshing) {
            return
        }
        Instrumentation.leaveBreadcrumb(
            `User clicked ${title} tab on My Day at ${new Date().toISOString()}`,
            BreadcrumbVisibility.CRASHES_AND_SESSIONS
        )
        const currentDay = getCurrentDay(index)
        const logMsg = `${
            CommonParam.GPID__c
        } has navigated to ${currentDay} page of my day screen at ${formatWithTimeZone(
            moment(),
            TIME_FORMAT.YMDTHMS,
            true,
            true
        )}`
        appendLog(Log.MOBILE_INFO, `orderade: navigate to ${currentDay} page`, logMsg)
        dispatch(selectTimeRange(index))
        changeDate(addDaysToToday(index, true), index)
    }

    useEffect(() => {
        const logMsg = `${CommonParam.GPID__c} has navigated to today page of my day screen at ${formatWithTimeZone(
            moment(),
            TIME_FORMAT.YMDTHMS,
            true,
            true
        )}`
        appendLog(Log.MOBILE_INFO, `orderade: navigate to today page`, logMsg)
    }, [])

    const renderHeaderSectionHeight = () => {
        if (isTodaySelected() && showMetric && tab === MyDayTabEnum.MyDay) {
            return animatedHeight
        }
        return pastFutureHeight
    }

    const renderRouteInfoMetric = () => {
        return (
            <View style={[styles.visitMetricWrapper]}>
                <OrderMetric isTodaySelected={isTodaySelected()} selectedDate={selectedDate} />
            </View>
        )
    }

    const renderMetrics = () => {
        if (tab === MyDayTabEnum.MyDay) {
            return isTodaySelected() ? (
                <View style={styles.visitMetricWrapper}>
                    <VisitMetric metricData={todayMetric} showMetric={showMetric} />
                </View>
            ) : (
                <View>
                    <WeekBar
                        timeRangeIndex={timeRangeIndex}
                        selectedDate={selectedDate}
                        onPressDay={(item: any) => {
                            changeDate(item.date, timeRangeIndex)
                        }}
                    />
                    {timeRangeIndex === MyDayTimeRangeEnum.Past &&
                        renderMyVisitMetricCase(todayMetric?.caseInfo, showMetric)}
                </View>
            )
        } else if (tab === MyDayTabEnum.RouteInfo) {
            return renderRouteInfoMetric()
        }
    }

    return (
        <Animated.View
            style={isTodaySelected() && tab === MyDayTabEnum.MyDay && { height: renderHeaderSectionHeight() }}
        >
            <ImageBackground
                source={!isTodaySelected() ? ImageSrc.PATTERN_BLUE_FUTURE_PAST_BG : ImageSrc.PATTERN_BLUE_BACKGROUND}
                resizeMode="cover"
                style={[
                    styles.metricHeaderContainer,
                    { paddingBottom: startEndButtonStatus.showStartButton ? 44 : 22 },
                    isTodaySelected() && tab === MyDayTabEnum.MyDay && { flex: 1 }
                ]}
            >
                <View>
                    <PastTodayFutureTab tabIndex={timeRangeIndex} onClick={onSwitchTimeRangeTab} />
                    {CommonParam.OrderingFeatureToggle && (
                        <View style={styles.selectTabWrapper}>
                            <SelectTab
                                listData={tabList}
                                changeTab={(v) => {
                                    dispatch(selectTab(v))
                                }}
                                activeTab={tab}
                            />
                        </View>
                    )}
                    {renderMetrics()}
                </View>
            </ImageBackground>
        </Animated.View>
    )
}

export default MyDayScreenHeader

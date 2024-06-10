/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-08-04 01:42:20
 * @LastEditTime: 2022-11-21 14:47:13
 * @LastEditors: Mary Qian
 */

import React, { useEffect, useImperativeHandle, useState } from 'react'
import { StyleSheet, View, ImageBackground, Animated } from 'react-native'
import { isPersonaPSR } from '../../../common/enums/Persona'
import { todayDateWithTimeZone } from '../../utils/TimeZoneUtils'
import { addDaysToToday } from '../../../common/utils/YMDUtils'
import PastTodayFutureTab from './PastTodayFutureTab'
import VisitMetric, { renderMyVisitMetricCase, TodayMetricFrontProps } from './VisitMetric'
import WeekBar from '../../../common/components/WeekBar'

const styles = StyleSheet.create({
    metricHeaderContainer: {
        flex: 1,
        height: '100%',
        paddingLeft: 22,
        paddingRight: 0
    },
    visitMetricWrapper: {
        paddingRight: 20
    }
})

export interface MyVisitMetricHeaderProps {
    cRef
    onDateChanged: (date: string, tabIndex: number) => void
    animatedHeight: Animated.Value
    todayMetric: any
    visitNum?: TodayMetricFrontProps
}

let timeRangeIndex = 0

const MyVisitMetricHeader = (props: MyVisitMetricHeaderProps) => {
    const { cRef, onDateChanged, animatedHeight, todayMetric, visitNum } = props

    const [selectedDate, setSelectedDate] = useState(todayDateWithTimeZone(true))

    const isPastTabForPSR = isPersonaPSR() && timeRangeIndex === -1
    const pastFutureHeight = isPastTabForPSR ? 250 : 200

    const isTodaySelected = () => {
        return timeRangeIndex === 0
    }

    const changeDate = (date: string, tabIndex: number) => {
        timeRangeIndex = tabIndex
        setSelectedDate(date)
        onDateChanged(date, tabIndex)
    }

    useImperativeHandle(cRef, () => ({
        changeDate
    }))

    const onSwitchTimeRangeTab = (index: number) => {
        timeRangeIndex = index
        changeDate(addDaysToToday(index, true), index)
    }

    useEffect(() => {
        if (selectedDate === todayDateWithTimeZone(true) && timeRangeIndex !== 0) {
            timeRangeIndex = 0
        }
    }, [selectedDate])

    return (
        <Animated.View style={{ height: isTodaySelected() ? animatedHeight : pastFutureHeight }}>
            <ImageBackground
                source={
                    !isTodaySelected()
                        ? require('../../../../assets/image/PATTERN-BLUE-BG-IMG-Future-Visit.png')
                        : require('../../../../assets/image/PATTERN-BLUE-BG-IMG.png')
                }
                resizeMode="cover"
                style={styles.metricHeaderContainer}
            >
                <View>
                    <PastTodayFutureTab tabIndex={timeRangeIndex} onClick={onSwitchTimeRangeTab} />
                    {isTodaySelected() ? (
                        <View style={styles.visitMetricWrapper}>
                            <VisitMetric metricData={todayMetric} visitNum={visitNum} />
                        </View>
                    ) : (
                        <View>
                            <WeekBar
                                timeRangeIndex={timeRangeIndex}
                                selectedDate={selectedDate}
                                onPressDay={(item) => {
                                    changeDate(item.date, timeRangeIndex)
                                }}
                            />
                            {isPastTabForPSR && renderMyVisitMetricCase(todayMetric?.caseInfo)}
                        </View>
                    )}
                </View>
            </ImageBackground>
        </Animated.View>
    )
}

export default MyVisitMetricHeader

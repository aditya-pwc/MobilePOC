/*
 * @Description:
 * @Author: Yi Li
 * @Date: 2021-10-19 02:58:20
 * @LastEditTime: 2022-11-27 12:08:16
 * @LastEditors: Mary Qian
 */
import moment from 'moment'
import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { commonStyle } from '../styles/CommonStyle'
import CText from './CText'
import { TIME_FORMAT } from '../enums/TimeFormat'
import { MOMENT_STARTOF } from '../enums/MomentStartOf'

const styles = StyleSheet.create({
    weekBarContainer: {
        flexDirection: 'row',
        height: 52,
        marginTop: 28
    },
    weekItemContainer: {
        width: 50,
        height: 52,
        marginRight: 4,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    selectedWeekItem: {
        backgroundColor: '#00A2D9'
    },
    dayNameText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12
    }
})

interface WeekBarProps {
    timeRangeIndex: number
    selectedDate?: string
    onPressDay: Function
}

export interface WeekBarItemProps {
    date: string
    week?: string
    day?: string
}

const DATE_FMT = TIME_FORMAT.Y_MM_DD
const WEEK_FMT = TIME_FORMAT.DDD
const MONTH_DAY_FMT = TIME_FORMAT.MDD

export const getPastDays = () => {
    const todayString = moment().format(DATE_FMT)
    const date = moment(todayString)
    const begin = moment(todayString).day(-7)
    const dateArray: WeekBarItemProps[] = []

    while (true) {
        if (begin.format(DATE_FMT) === date.format(DATE_FMT)) {
            break
        }
        dateArray.push({
            date: begin.format(DATE_FMT),
            week: begin.format(WEEK_FMT).toUpperCase(),
            day: begin.format(MONTH_DAY_FMT)
        })
        begin.add(1, 'd')
    }

    return dateArray
}

const getFutureDays = () => {
    const dateArray: WeekBarItemProps[] = []
    const today = moment()
    for (let i = 1; i <= 7; i++) {
        const dt = today.add(1, MOMENT_STARTOF.DAY)

        dateArray.push({
            date: dt.format(DATE_FMT),
            week: dt.format(WEEK_FMT).toUpperCase(),
            day: dt.format(MONTH_DAY_FMT)
        })
    }
    return dateArray
}

const WeekBar = (props: WeekBarProps) => {
    const { timeRangeIndex, onPressDay, selectedDate } = props

    const weekArr = timeRangeIndex === -1 ? getPastDays() : getFutureDays()
    const scrollViewRef: any = useRef()

    const renderDayBox = (value) => {
        return (
            <TouchableOpacity key={value.date} onPress={() => onPressDay(value)}>
                <View style={[styles.weekItemContainer, selectedDate === value.date ? styles.selectedWeekItem : null]}>
                    <CText style={[styles.dayNameText]}> {value.week} </CText>
                    <CText style={[styles.dayNameText, { marginTop: 8 }]}> {value.day} </CText>
                </View>
            </TouchableOpacity>
        )
    }

    useEffect(() => {
        if (timeRangeIndex === -1 && weekArr?.length > 0) {
            const index = weekArr.findIndex((i) => i.date === selectedDate)
            if (index > 0) {
                setTimeout(() => {
                    scrollViewRef?.current?.scrollTo({ x: 50 * index, y: 0, animated: true })
                }, 500)
            }
        }
    }, [selectedDate, timeRangeIndex])

    return (
        <ScrollView
            horizontal
            ref={scrollViewRef}
            showsHorizontalScrollIndicator={false}
            style={styles.weekBarContainer}
        >
            <View style={commonStyle.flexDirectionRow}>{weekArr.map((value) => renderDayBox(value))}</View>
        </ScrollView>
    )
}

export default WeekBar

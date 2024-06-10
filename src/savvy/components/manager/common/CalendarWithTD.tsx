/**
 * @description calendar for current week and PTD, WTD etc.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2023-06-29
 */

import { useIsFocused } from '@react-navigation/native'
import _ from 'lodash'
import moment from 'moment'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import CText from '../../../../common/components/CText'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { t } from '../../../../common/i18n/t'
import MonthWeekFilterStyle from '../../../styles/manager/MonthWeekFilterStyle'
import { CalendarWeekObj, DEFAULT_DELAY_TIME, getWeekLabelArrObj } from '../../../utils/MerchManagerUtils'

interface CalendarWithTDProps {
    needPTD?: boolean
    needWTD?: boolean
    onDateChange?: Function
    style?: any
}

const styles = MonthWeekFilterStyle

const getPTDObj = () => {
    return {
        weekLabel: t.labels.PBNA_MOBILE_PTD,
        dateLabel: t.labels.PBNA_MOBILE_TOTAL.toUpperCase(),
        fullYearDate: t.labels.PBNA_MOBILE_PERIOD_TO_DATE
    }
}
const getWTDObj = () => {
    return {
        weekLabel: t.labels.PBNA_MOBILE_COPILOT_WTD,
        dateLabel: t.labels.PBNA_MOBILE_TOTAL.toUpperCase(),
        fullYearDate: t.labels.PBNA_MOBILE_WEEK_TO_DATE
    }
}

const PTD_INDEX = 14
const ONE_WEEK_LENGTH = 7

const renderCalendar = (finalWeekArr: CalendarWeekObj[], activeDay: number, throttleSelectDay: Function) => {
    return finalWeekArr.map((value, index: number) => {
        return (
            <TouchableOpacity
                style={[
                    activeDay === index ? styles.bgBlue : styles.bgTrans,
                    styles.dateBgStyle,
                    styles.paddingHorizontal_5
                ]}
                key={value.weekLabel + value.dateLabel}
                onPress={() => {
                    throttleSelectDay(index)
                }}
            >
                <View style={styles.ADASView}>
                    <CText style={[activeDay === index ? styles.dateWeekText : styles.dateSingleWeekText]}>
                        {value.weekLabel}
                    </CText>
                    <CText
                        style={[
                            styles.dateWeekText,
                            index < PTD_INDEX && styles.marginTop_10,
                            activeDay !== index && index >= PTD_INDEX && styles.dateSingleWeekText
                        ]}
                    >
                        {value.dateLabel}
                    </CText>
                </View>
            </TouchableOpacity>
        )
    })
}

const CalendarWithTD: FC<CalendarWithTDProps> = (props: CalendarWithTDProps) => {
    const { needPTD, needWTD, onDateChange, style } = props
    const weekArrObj = getWeekLabelArrObj()
    const scrollDateRef = useRef(null)
    const isFocused = useIsFocused()
    const [activeDay, setActiveDay] = useState(weekArrObj?.todayIndex + ONE_WEEK_LENGTH)
    const finalWeekArr = getWeekLabelArrObj(
        moment().weekday(-ONE_WEEK_LENGTH).format(TIME_FORMAT.Y_MM_DD)
    ).tempWeekArr.concat(weekArrObj?.tempWeekArr) as Array<CalendarWeekObj>

    if (needWTD) {
        finalWeekArr.push(getWTDObj())
    }
    if (needPTD) {
        finalWeekArr.push(getPTDObj())
    }

    useEffect(() => {
        // default today, the first day of today is sunday, minim scroll distance 400 to sunday
        setTimeout(() => {
            // @ts-ignore
            scrollDateRef?.current?.scrollTo({ x: 400, animated: true })
        })
    }, [isFocused])

    const throttleSelectDay = useCallback(
        _.throttle(
            (index) => {
                setActiveDay(index)
                onDateChange && onDateChange(finalWeekArr[index].fullYearDate)
            },
            DEFAULT_DELAY_TIME,
            { leading: true, trailing: false }
        ),
        []
    )

    return (
        <ScrollView
            style={style}
            ref={scrollDateRef}
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.dateASASContainerView, styles.bgDeepBlue]}
        >
            <View style={styles.adasDateView}>{renderCalendar(finalWeekArr, activeDay, throttleSelectDay)}</View>
        </ScrollView>
    )
}

export default CalendarWithTD

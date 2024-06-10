/**
 * @description Select schedule component.
 * @author Xupeng Bao
 * @email xupeng.bao@pwc.com
 * @date 2021-05-17
 */
import moment from 'moment'
import React, { useEffect, useImperativeHandle, useState, FC } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { useSelector } from 'react-redux'
import CText from '../../../common/components/CText'
import MonthWeekStyle from '../../styles/manager/MonthWeekStyle'
import { setLoggedInUserTimezone } from '../../utils/TimeZoneUtils'
import _ from 'lodash'
import { CommonLabel } from '../../enums/CommonLabel'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../../common/enums/MomentStartOf'

const MonthWeekStyles = MonthWeekStyle

export const MonthWeekType = {
    MonthWeekType_Default: 'showDay',
    MonthWeekType_WithoutDay: 'withOutDay'
}
interface MonthWeekProps {
    weekDays: Object
    startDay?: string
    onclick: Function
    cRef?: any
    addVisitDate?: string
    type?: string
    activeDayIndex?: number
    isEmptyFromRNS?: boolean
}
const managerReducer = (state) => state.manager
setLoggedInUserTimezone()

const getThisSunday = (dateArr, startDay) => {
    let start
    if (dateArr.length > 1 && _.isEmpty(startDay)) {
        if (moment(dateArr[0]).format(TIME_FORMAT.Y_MM_DD) !== dateArr[0]) {
            start = dateArr[0] ? moment(dateArr[0] + CommonLabel.END_OF_DAY_TIME) : moment()
        } else {
            start = dateArr[0] ? moment(dateArr[0]) : moment()
        }
    } else {
        start = startDay ? moment(startDay) : moment()
    }
    return start.clone().day(0)
}

const getWeekArr = (thisSunday) => {
    const weekArr = []
    for (let i = 0; i <= 6; i++) {
        const wl = thisSunday.clone().add(i, MOMENT_STARTOF.DAY).format('ddd').toUpperCase()
        const dl = thisSunday.clone().add(i, MOMENT_STARTOF.DAY).format('M/D')
        const fullYearDate = thisSunday.clone().add(i, MOMENT_STARTOF.DAY).format(TIME_FORMAT.Y_MM_DD)
        weekArr.push({ weekLabel: wl, dateLabel: dl, fullYearDate })
    }
    return weekArr
}

const getSelectIndex = (weekDays, addVisitDate, weekArr) => {
    let selectIndex = 0
    if (addVisitDate) {
        selectIndex = weekArr.findIndex((item) => item.fullYearDate === addVisitDate)
    } else {
        for (let index = 0; index < weekArr.length; index++) {
            if (Object.keys(weekDays).includes(weekArr[index].weekLabel)) {
                selectIndex = index
                break
            }
        }
    }
    return selectIndex
}

const refreshSelect = (weekDay, dayKey, weekArr, setActiveDay) => {
    for (let index = 0; index < weekArr.length; index++) {
        if (Object.keys(weekDay).includes(weekArr[index].weekLabel) && dayKey === weekArr[index].weekLabel) {
            setActiveDay(index)
            break
        }
    }
}

const getColor = (weekDays, value) => {
    if (Object.keys(weekDays).includes(value.weekLabel) && weekDays[value.weekLabel]) {
        return '#F2F4F7'
    }
    return 'transparent'
}

const getWeekDayLabelColor = (activeDay, index) => {
    if (activeDay === index) {
        return '#FFF'
    }
    return '#00A2D9'
}

const getDateLabelColor = (activeDay, index) => {
    if (activeDay === index) {
        return '#FFF'
    }
    return '#000'
}

const getWithoutDayLabelColor = (activeDay, index) => {
    if (activeDay === index) {
        return '#FFF'
    }
    return '#D3D3D3'
}

const getBackgroundColor = (activeDay, index, weekDays, value, isEmptyFromRNS?) => {
    if (activeDay === index && !isEmptyFromRNS) {
        return '#00A2D9'
    }
    return getColor(weekDays, value)
}

const getDefaultAndWeekDayColor = (activeDay, index, weekDays, value, isEmptyFromRNS?) => {
    if (!Object.keys(weekDays).includes(value.weekLabel) || isEmptyFromRNS) {
        return '#D3D3D3'
    }
    return getWeekDayLabelColor(activeDay, index)
}

const getDefaultAndDateColor = (activeDay, index, weekDays, value, isEmptyFromRNS?) => {
    if (!Object.keys(weekDays).includes(value.weekLabel) || isEmptyFromRNS) {
        return '#D3D3D3'
    }
    return getDateLabelColor(activeDay, index)
}

const getWithoutAndWeekDayColor = (activeDay, index, weekDays, value) => {
    if (!Object.keys(weekDays).includes(value.weekLabel)) {
        return getWithoutDayLabelColor(activeDay, index)
    }
    return getWeekDayLabelColor(activeDay, index)
}

const MonthWeek: FC<MonthWeekProps> = ({
    weekDays,
    onclick,
    cRef,
    addVisitDate,
    isEmptyFromRNS,
    startDay,
    type = MonthWeekType.MonthWeekType_Default
}: MonthWeekProps) => {
    const manager = useSelector(managerReducer)
    const dateArr = manager.scheduleDate
    const thisSunday = getThisSunday(dateArr, startDay)
    const weekArr = getWeekArr(thisSunday)
    const selectIndex = getSelectIndex(weekDays, addVisitDate, weekArr)

    const [activeDay, setActiveDay] = useState(selectIndex)

    const weekDayClick = (value, index) => {
        setActiveDay(index)
        onclick && onclick(value)
    }

    const setSelectIndex = (weekDay, dayKey) => {
        refreshSelect(weekDay, dayKey, weekArr, setActiveDay)
    }

    useEffect(() => {
        if (weekArr && selectIndex) {
            weekDayClick && weekDayClick(weekArr[selectIndex], selectIndex)
        }
    }, [])

    useImperativeHandle(cRef, () => ({
        setSelectIndex: (weekDay, dayKey) => {
            setSelectIndex(weekDay, dayKey)
        }
    }))

    let view = (
        <View style={MonthWeekStyles.container}>
            {weekArr.map((value, index) => {
                return (
                    <TouchableOpacity
                        style={[
                            { backgroundColor: getBackgroundColor(activeDay, index, weekDays, value, isEmptyFromRNS) },
                            MonthWeekStyles.dateBgStyle
                        ]}
                        key={value.weekLabel}
                        onPress={() => {
                            Object.keys(weekDays).includes(value.weekLabel) && weekDayClick(value, index)
                        }}
                    >
                        <View style={[MonthWeekStyles.dateView]}>
                            <CText
                                style={[
                                    MonthWeekStyles.dateSingleWeekText,
                                    {
                                        color: getDefaultAndWeekDayColor(
                                            activeDay,
                                            index,
                                            weekDays,
                                            value,
                                            isEmptyFromRNS
                                        )
                                    }
                                ]}
                            >
                                {value.weekLabel}
                            </CText>
                            <CText
                                style={[
                                    MonthWeekStyles.dateSingleText,
                                    { color: getDefaultAndDateColor(activeDay, index, weekDays, value, isEmptyFromRNS) }
                                ]}
                            >
                                {value.dateLabel}
                            </CText>
                        </View>
                        {Object.keys(weekDays).includes(value.weekLabel) && weekDays[value.weekLabel] && (
                            <View style={MonthWeekStyles.checkedDot} />
                        )}
                    </TouchableOpacity>
                )
            })}
        </View>
    )
    if (type === MonthWeekType.MonthWeekType_WithoutDay) {
        view = (
            <View style={MonthWeekStyles.container}>
                {weekArr.map((value, index) => {
                    return (
                        <TouchableOpacity
                            style={[
                                { backgroundColor: getBackgroundColor(activeDay, index, weekDays, value) },
                                MonthWeekStyles.dateBgStyle2
                            ]}
                            key={value.weekLabel}
                            onPress={() => {
                                weekDayClick(value, index)
                            }}
                        >
                            <View style={[MonthWeekStyles.dateView]}>
                                <CText
                                    style={[
                                        MonthWeekStyles.dateSingleWeekText,
                                        { color: getWithoutAndWeekDayColor(activeDay, index, weekDays, value) }
                                    ]}
                                >
                                    {value.weekLabel}
                                </CText>
                            </View>
                            {Object.keys(weekDays).includes(value.weekLabel) && weekDays[value.weekLabel] && (
                                <View style={MonthWeekStyles.checkedDot2} />
                            )}
                        </TouchableOpacity>
                    )
                })}
            </View>
        )
    }
    return view
}

export default MonthWeek

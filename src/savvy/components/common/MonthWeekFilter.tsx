/**
 * @description month and week filter component
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-03-18
 */

import React, { useState, useEffect, useRef, useImperativeHandle, FC, useCallback } from 'react'
import moment from 'moment'
import 'moment-timezone'
import { View, ScrollView, TouchableOpacity, ImageBackground, Image, ActivityIndicator } from 'react-native'
import { compose } from '@reduxjs/toolkit'
import CText from '../../../common/components/CText'
import { useIsFocused } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import MonthWeekFilterStyle from '../../styles/manager/MonthWeekFilterStyle'
import managerAction from '../../redux/action/H01_Manager/managerAction'
import { setLoggedInUserTimezone } from '../../utils/TimeZoneUtils'
import WarningImg from '../../../../assets/image/schedule_exclamation.svg'
import _ from 'lodash'
import { getWeekLabelArrObj, getWeekArrByDate } from '../../utils/MerchManagerUtils'
import { CommonLabel } from '../../enums/CommonLabel'
import { t } from '../../../common/i18n/t'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../../common/enums/MomentStartOf'

const styles = MonthWeekFilterStyle
const ICON_TRIANGLE_UP = ImageSrc.ICON_TRIANGLE_UP
const IMG_BACKGROUND = ImageSrc.IMG_BACKGROUND
const IMG_GREEN_CHECK = ImageSrc.ICON_CHECKMARK_CIRCLE
const PASS_TWO_WEEK_DAY = -14
const NEXT_FOUR_WEEK_DAY = 28
const SUNDAY_NUM = 0
const A_WEEK_COUNT = 7
const SIX_WEEK_LENGTH = 6
const A_WEEK_DAY_LENGTH = 6
const SCROLL_EVENT_THROTTLE = 16
const FOUR_DAY = 4
const FOUR_DAY_SCROLL_OFFSET = 150
const ONE_DAY_OFFSET = 50
const ONE_WEEK_STEP = 1
const LEFT_OFFSET_COUNT = 0
const RIGHT_OFFSET_COUNT = 5
const PASS_THREE_WEEK = 3
const NEXT_FOUR_WEEK = 4
const NEXT_WEEK_OFFSET = 60
const PASS_WEEK_OFFSET = 10

setLoggedInUserTimezone()

const sundayLabelDateMap = new Map()
const getCalendarSundayLabel = () => {
    const start = moment().add(PASS_TWO_WEEK_DAY, 'd')
    const end = moment().add(NEXT_FOUR_WEEK_DAY, 'd')
    const sundays = []
    const sunday = start.clone().day(SUNDAY_NUM)
    if (sunday.isAfter(start, 'd')) {
        sundays.push(sunday.format('M/D'))
    }
    while (sunday.isBefore(end)) {
        sunday.add(A_WEEK_COUNT, 'days')
        if (sunday.isSame(new Date(), MOMENT_STARTOF.WEEK)) {
            sundays.push(t.labels.PBNA_MOBILE_THIS_WEEK.toUpperCase())
        } else {
            sundays.push(sunday.format('M/D'))
        }
        sundayLabelDateMap.set(sunday.format('M/D'), sunday.format(TIME_FORMAT.Y_MM_DD))
        if (sundays.length === SIX_WEEK_LENGTH) {
            break
        }
    }
    return sundays
}

const focusActiveDate = (scrollDateRef) => {
    scrollDateRef.current.scrollTo({ x: 0, y: 0, animated: true })
}
const formateDateFun = (currentDate) => {
    const currentDateArray = moment(currentDate).format('DD MMM, YYYY').split(',')
    return `${moment(currentDate).format('dddd')}, ${currentDateArray[0]}${currentDateArray[1]}`
}

const setListData = (index, weeks, setActiveDay, selectDate, props, setFormateCurrentDate) => {
    setActiveDay(index)
    if (!props.fromEmployeeSchedule && !props.fromADAS && !props.scheduleDate) {
        selectDate(moment(weeks[index].fullYearDate))
    }
    props.onchangeDate && props.onchangeDate(moment(weeks[index].fullYearDate))
    props.onSelectDay && props.onSelectDay(index)
    setFormateCurrentDate &&
        setFormateCurrentDate(
            formateDateFun(
                weeks[index].fullYearDate
                    ? weeks[index].fullYearDate
                    : ` ${weeks[index].dateLabel}${moment().format('ll').split(',')[1]}`
            )
        )
}

const computeWeekArr = (select) => {
    const tmpWeekArr = []
    if (select === t.labels.PBNA_MOBILE_THIS_WEEK.toUpperCase()) {
        select = moment().clone().day(SUNDAY_NUM).format('M/D')
    }
    const currentSunday = moment(sundayLabelDateMap.get(select)).clone().day(SUNDAY_NUM)
    let selectedDay = 0
    for (let i = 0; i <= A_WEEK_DAY_LENGTH; i++) {
        const wl = currentSunday.clone().add(i, MOMENT_STARTOF.DAY).format('ddd').toUpperCase()
        const dl = currentSunday.clone().add(i, MOMENT_STARTOF.DAY).format('M/D')
        const fullYearDate = currentSunday.clone().add(i, MOMENT_STARTOF.DAY).format(TIME_FORMAT.Y_MM_DD)
        if (
            moment()
                .startOf(MOMENT_STARTOF.DAY)
                .isSame(currentSunday.clone().add(i, MOMENT_STARTOF.DAY).startOf(MOMENT_STARTOF.DAY))
        ) {
            tmpWeekArr.push({ weekLabel: t.labels.PBNA_MOBILE_TODAY.toUpperCase(), dateLabel: dl, fullYearDate })
            selectedDay = i
        } else {
            tmpWeekArr.push({ weekLabel: wl, dateLabel: dl, fullYearDate })
        }
    }
    return { tmpWeekArr, selectedDay }
}

const selectWeek = (select, setActiveDay, setWeekArr, setSelectDate, props, setFormateCurrentDate) => {
    const { tmpWeekArr, selectedDay } = computeWeekArr(select)
    setActiveDay(selectedDay)
    setWeekArr(tmpWeekArr)
    setListData(selectedDay, tmpWeekArr, setActiveDay, setSelectDate, props, setFormateCurrentDate)
    props.onSetWeekArr && props.onSetWeekArr(tmpWeekArr)
}

const getDisplayStyle = (props, activeWeek, index) => {
    if (props.editEmployeeSchedule && activeWeek === index) {
        return 'flex'
    }
    return 'none'
}

const getActiveStyle = (props, activeWeek, index) => {
    if (!props.editEmployeeSchedule) {
        return 'flex'
    }
    return getDisplayStyle(props, activeWeek, index)
}

const hookWithReducer = (params) => {
    const { selectDate, activeWeek, setActiveWeek, setActiveDay, setWeekArr, scrollWeekRef, props, sundays } = params
    if (selectDate) {
        const selectedDate = moment(selectDate)
        const index = sundays.indexOf(selectedDate.clone().day(SUNDAY_NUM).format('M/D'))
        const selectWeekIndex = index > -1 ? index : sundays.indexOf(t.labels.PBNA_MOBILE_THIS_WEEK.toUpperCase())
        if (selectWeekIndex !== activeWeek) {
            setActiveWeek(selectWeekIndex)
        }
        const { tmpWeekArr } = computeWeekArr(sundays[selectWeekIndex])
        setWeekArr(tmpWeekArr)
        props.onSetWeekArr && props.onSetWeekArr(tmpWeekArr)
        setActiveDay(selectedDate.clone().day())
        selectWeekIndex < RIGHT_OFFSET_COUNT
            ? scrollWeekRef.current.scrollTo({ x: ONE_DAY_OFFSET * selectWeekIndex, animated: true })
            : scrollWeekRef.current.scrollToEnd({ animated: true })
    }
}

const hookWithProps = (props, setActiveDay, setActiveWeek, setWeekArr) => {
    if (props.selectedDay) {
        setActiveDay(props.selectedDay)
    }
    if (props.selectedWeek) {
        setActiveWeek(props.selectedWeek)
    }
    if (props.tmpWeekArr) {
        setWeekArr(props.tmpWeekArr)
        props.onSetWeekArr && props.onSetWeekArr(props.tmpWeekArr)
    }
}

const autoScroll = (props, activeDay, scrollDateRef) => {
    if (props.isShowWeek && activeDay >= FOUR_DAY) {
        scrollDateRef.current.scrollTo({ x: FOUR_DAY_SCROLL_OFFSET })
    }
}

const handleScrollDate = (event, activeWeek, setSelectedWeek, scrollWeekRef, sundays) => {
    if (event.nativeEvent.contentOffset.x > ONE_DAY_OFFSET) {
        if (sundays[activeWeek + ONE_WEEK_STEP]) {
            setSelectedWeek(activeWeek + ONE_WEEK_STEP, sundays[activeWeek + ONE_WEEK_STEP])
        }
        if (activeWeek + ONE_WEEK_STEP >= PASS_THREE_WEEK) {
            scrollWeekRef.current.scrollTo({ x: (activeWeek + ONE_WEEK_STEP) * NEXT_WEEK_OFFSET, y: 0, animated: true })
        }
    } else if (event.nativeEvent.contentOffset.x < -ONE_DAY_OFFSET) {
        if (sundays[activeWeek - ONE_WEEK_STEP]) {
            setSelectedWeek(activeWeek - ONE_WEEK_STEP, sundays[activeWeek - ONE_WEEK_STEP])
        }
        if (activeWeek - ONE_WEEK_STEP < NEXT_FOUR_WEEK) {
            scrollWeekRef.current.scrollTo({ x: (activeWeek - ONE_WEEK_STEP) * PASS_WEEK_OFFSET, y: 0, animated: true })
        }
    }
}

const renderWarning = (props, value) => {
    let tmpWeek
    if (value === t.labels.PBNA_MOBILE_THIS_WEEK.toUpperCase()) {
        tmpWeek = moment().clone().day(SUNDAY_NUM).format('M/D')
    }
    if (!_.isEmpty(props?.completedWeek) && (props.completedWeek[0] === tmpWeek || props.completedWeek[0] === value)) {
        return <WarningImg width={16} height={16} style={[styles.checkImg, styles.waringPos]} />
    }
    return null
}

const renderWeek = (props, activeWeek, setSelectedWeek, sundays) => {
    return sundays.map((value, index) => {
        return (
            <TouchableOpacity
                disabled={props?.disable}
                style={{ display: getActiveStyle(props, activeWeek, index) }}
                key={value}
                onPress={() => {
                    setSelectedWeek(index, value)
                }}
            >
                <View style={styles.dateView}>
                    <View style={styles.dateWithIcon}>
                        <CText style={[styles.weekLabel, activeWeek === index ? styles.blackColor : styles.greyColor]}>
                            {value !== t.labels.PBNA_MOBILE_THIS_WEEK.toUpperCase()
                                ? CommonLabel.WK_LABEL + value
                                : value}
                        </CText>
                        {props?.checkedWeek?.includes(value) && (
                            <Image source={IMG_GREEN_CHECK} style={styles.checkImg} />
                        )}
                        {renderWarning(props, value)}
                    </View>
                    {activeWeek === index && <Image style={styles.imgTriangle} source={ICON_TRIANGLE_UP} />}
                </View>
            </TouchableOpacity>
        )
    })
}

const renderDate = (
    weekArr,
    tempWeekArr,
    props,
    activeDay,
    setActiveDay,
    selectDate,
    setFormateCurrentDate,
    throttleSelectDay
) => {
    let finalWeekArr = []
    if (!_.isEqual(tempWeekArr, weekArr) && tempWeekArr[0]?.fullYearDate === weekArr[0]?.fullYearDate) {
        finalWeekArr = tempWeekArr
    } else {
        finalWeekArr = weekArr
    }
    if (props.fromADAS) {
        finalWeekArr.push({
            weekLabel: t.labels.PBNA_MOBILE_COPILOT_WTD,
            dateLabel: t.labels.PBNA_MOBILE_TOTAL.toUpperCase(),
            fullYearDate: t.labels.PBNA_MOBILE_COPILOT_WTD_TOTAL
        })
    }
    return finalWeekArr.map((value, index) => {
        const { weekDaySel, fromEmployeeSchedule } = props
        let dayAbled = true
        let daySel = false
        let disabledStyle = {}
        let ADASDisable = true
        if (fromEmployeeSchedule) {
            const day = weekDaySel && weekDaySel[index]
            dayAbled = day && day.abled
            daySel = day && day.sel
            disabledStyle = !dayAbled ? { color: 'gray' } : {}
        }
        if (props.fromADAS) {
            ADASDisable = moment().isBefore(value.fullYearDate)
            disabledStyle = ADASDisable ? { color: 'gray' } : {}
        }
        return (
            <TouchableOpacity
                style={[activeDay === index && dayAbled ? styles.bgBlue : styles.bgTrans, styles.dateBgStyle]}
                key={JSON.stringify(value)}
                disabled={props.fromADAS ? ADASDisable : props?.disable}
                onPress={() =>
                    throttleSelectDay(dayAbled, index, weekArr, setActiveDay, selectDate, props, setFormateCurrentDate)
                }
            >
                <View style={props.fromADAS ? styles.ADASView : styles.dateView}>
                    <CText
                        style={[
                            props?.fromADAS || props.scheduleDate
                                ? [activeDay === index ? styles.dateWeekText : styles.dateSingleWeekText, disabledStyle]
                                : [styles.dateWeekText, disabledStyle]
                        ]}
                    >
                        {value.weekLabel}
                    </CText>
                    <CText
                        style={
                            props.fromADAS || props.scheduleDate
                                ? [
                                      index === 7 ? styles.dateSingleWeekText : styles.ADASDate,
                                      activeDay === index && styles.whiteColor,
                                      disabledStyle
                                  ]
                                : [
                                      styles.dateText,
                                      activeDay === index ? styles.whiteColor : styles.d3Color,
                                      disabledStyle
                                  ]
                        }
                    >
                        {value.dateLabel}
                    </CText>
                </View>
                {props.fromEmployeeSchedule && daySel && <View style={styles.activePot} />}
                {props.isLoading && activeDay === index && (
                    <ActivityIndicator style={styles.loadingView} color={'black'} size={'large'} />
                )}
            </TouchableOpacity>
        )
    })
}
interface MonthWeekFilterProps {
    isShowWeek?: boolean
    selectedWeek?: number
    selectedDay?: number
    tmpWeekArr?: any
    completedWeek?: any
    onSelectWeek?: Function
    onSelectDay?: Function
    onTabChange?: Function
    onSetWeekArr?: Function
    fromEmployeeSchedule?: boolean
    onchangeDate?: Function
    checkedWeek?: Array<string>
    weekDaySel?: Array<object>
    editEmployeeSchedule?: boolean
    cRef?: any
    setFormateCurrentDate?: Function
    disable?: boolean
    fromADAS?: boolean
    scheduleDate?: string
    isLoading?: boolean
}
const managerReducer = (state) => state.manager
const MonthWeekFilter: FC<MonthWeekFilterProps> = (props: MonthWeekFilterProps) => {
    const sundays = getCalendarSundayLabel()
    const weekArrObj = getWeekLabelArrObj()
    const scheduleWeekArrObj = getWeekArrByDate(moment(props?.scheduleDate))
    const { setFormateCurrentDate = null } = props
    const isFocused = useIsFocused()
    const [activeWeek, setActiveWeek] = useState(sundays.indexOf(t.labels.PBNA_MOBILE_THIS_WEEK.toUpperCase()))
    const [activeDay, setActiveDay] = useState(props?.scheduleDate ? 0 : weekArrObj?.todayIndex)
    const [weekArr, setWeekArr] = useState(props?.scheduleDate ? scheduleWeekArrObj : weekArrObj?.tempWeekArr)
    const scrollWeekRef = useRef(null)
    const scrollDateRef = useRef(null)
    const dispatch = useDispatch()
    const manager = useSelector(managerReducer)
    const selectDate = compose(dispatch, managerAction.setSelectDate)

    const setSelectedWeek = (index, value) => {
        selectWeek(value, setActiveDay, setWeekArr, selectDate, props, setFormateCurrentDate)
        setActiveWeek(index)
        focusActiveDate(scrollDateRef)
        props.onSelectWeek && props.onSelectWeek(index)
    }

    useEffect(() => {
        if (!manager.selectedDate && setFormateCurrentDate) {
            const formateDateStr = formateDateFun(moment().format(TIME_FORMAT.Y_MM_DD))
            setFormateCurrentDate(formateDateStr)
        }
        if (!props.fromADAS && !props.scheduleDate) {
            hookWithReducer({
                selectDate: manager.selectedDate,
                activeWeek,
                setActiveWeek,
                setActiveDay,
                setWeekArr,
                scrollWeekRef,
                props,
                sundays
            })
        }
    }, [manager.selectedDate])

    useEffect(() => {
        hookWithProps(props, setActiveDay, setActiveWeek, setWeekArr)
    }, [props.selectedDay, props.selectedWeek, props.tmpWeekArr])

    useEffect(() => {
        if (!props.scheduleDate) {
            autoScroll(props, activeDay, scrollDateRef)
        }
    }, [props, isFocused, activeDay])

    useImperativeHandle(props.cRef, () => ({
        selectDay: (index: number) => {
            setActiveDay(index)
        }
    }))

    const throttleSelectDay = useCallback(
        _.throttle(
            (dayAbled, index, weekArr, setActiveDay, selectDate, props, setFormateCurrentDate) => {
                if (props.fromEmployeeSchedule) {
                    dayAbled && setListData(index, weekArr, setActiveDay, selectDate, props, setFormateCurrentDate)
                    return
                }

                setListData(index, weekArr, setActiveDay, selectDate, props, setFormateCurrentDate)
            },
            2000,
            { leading: true, trailing: false }
        ),
        []
    )

    useEffect(() => {
        if (props.onTabChange) {
            props.onTabChange()
        }
    }, [activeDay, activeWeek])

    const handleWeekScroll = (event) => {
        const offset = event.nativeEvent.contentOffset.x
        let active = Math.round(offset / ONE_DAY_OFFSET)
        active = active < LEFT_OFFSET_COUNT ? LEFT_OFFSET_COUNT : active
        active = active >= RIGHT_OFFSET_COUNT ? RIGHT_OFFSET_COUNT : active
        if (sundays[active]) {
            setSelectedWeek(active, sundays[active])
        }
    }

    const handleDateScroll = (event) => {
        handleScrollDate(event, activeWeek, setSelectedWeek, scrollWeekRef, sundays)
    }

    return (
        <View>
            {props.isShowWeek && !props.fromADAS && !props.scheduleDate && (
                <View style={props.fromEmployeeSchedule ? styles.dayListEmployee : styles.dayList}>
                    <ScrollView
                        horizontal
                        scrollEnabled={!props.editEmployeeSchedule}
                        showsHorizontalScrollIndicator={false}
                        style={styles.flexDirectionRow}
                        onScrollEndDrag={handleWeekScroll}
                        scrollEventThrottle={SCROLL_EVENT_THROTTLE}
                        ref={scrollWeekRef}
                    >
                        <View style={styles.flexDirectionRow}>
                            {renderWeek(props, activeWeek, setSelectedWeek, sundays)}
                        </View>
                    </ScrollView>
                    <View>
                        <ImageBackground
                            source={IMG_BACKGROUND}
                            resizeMode="cover"
                            style={props.fromEmployeeSchedule ? styles.imgBgroundNoSeg : styles.imgBground}
                        >
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                onScrollEndDrag={!props.fromEmployeeSchedule && handleDateScroll}
                                scrollEventThrottle={SCROLL_EVENT_THROTTLE}
                                contentContainerStyle={styles.dateContainerView}
                                ref={scrollDateRef}
                            >
                                {renderDate(
                                    weekArr,
                                    weekArrObj?.tempWeekArr,
                                    props,
                                    activeDay,
                                    setActiveDay,
                                    selectDate,
                                    setFormateCurrentDate,
                                    throttleSelectDay
                                )}
                            </ScrollView>
                        </ImageBackground>
                    </View>
                </View>
            )}
            {props.fromADAS && (
                <View style={styles.ADASList}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        // scrollEventThrottle={SCROLL_EVENT_THROTTLE}
                        contentContainerStyle={styles.dateADASContainerView}
                        ref={scrollDateRef}
                    >
                        {renderDate(
                            weekArr,
                            weekArrObj?.tempWeekArr,
                            props,
                            activeDay,
                            setActiveDay,
                            selectDate,
                            setFormateCurrentDate,
                            throttleSelectDay
                        )}
                    </ScrollView>
                </View>
            )}
            {props.scheduleDate && (
                <View style={styles.ADASList}>
                    <View style={styles.adasDateView}>
                        {renderDate(
                            weekArr,
                            weekArrObj?.tempWeekArr,
                            props,
                            activeDay,
                            setActiveDay,
                            selectDate,
                            setFormateCurrentDate,
                            throttleSelectDay
                        )}
                    </View>
                </View>
            )}
        </View>
    )
}

export default MonthWeekFilter

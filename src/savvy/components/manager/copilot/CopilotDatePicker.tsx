/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-10-28 03:44:10
 * @LastEditTime: 2022-07-12 00:13:57
 * @LastEditors: Mary Qian
 */

import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import moment, { Moment } from 'moment'

import CText from '../../../../common/components/CText'
import Arrow from '../../../../../assets/image/ios-chevron-left-BLUE.svg'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { formatWithTimeZone } from '../../../utils/TimeZoneUtils'
import { NUMBER_VALUE } from '../../../enums/MerchandiserEnums'
import { t } from '../../../../common/i18n/t'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { MOMENT_UNIT } from '../../../../common/enums/MomentUnit'
import { MOMENT_STARTOF } from '../../../../common/enums/MomentStartOf'
import { getPortraitModeScreenWidthAndHeight } from '../../../../common/utils/CommonUtils'

const screenWidth = getPortraitModeScreenWidthAndHeight().width
const styles = StyleSheet.create({
    titleContain: {
        flexDirection: 'row',
        width: screenWidth
    },
    titleStyle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: baseStyle.color.white,
        marginLeft: 22
    },
    arrowContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginRight: baseStyle.margin.mg_22
    },
    rightArrow: {
        transform: [{ rotate: '180deg' }]
    }
})

const CopilotDatePicker = (props: any) => {
    const { onDateChanged, containerStyle, isShowWholeMonth } = props

    const [currentDate, setCurrentDate] = useState('')
    const [leftActive, setLeftActive] = useState(false)
    const [rightActive, setRightActive] = useState(true)
    const [leftDisable, setLeftDisable] = useState(false)
    const [rightDisable, setRightDisable] = useState(false)
    const [fromToday, setFromToday] = useState(0)

    const timeRange = {
        startTime: moment()
            .subtract(NUMBER_VALUE.ONE_NUM, MOMENT_UNIT.WEEKS)
            .startOf(MOMENT_STARTOF.WEEK)
            .format(TIME_FORMAT.Y_MM_DD),
        endTime: moment()
            .add(NUMBER_VALUE.FOUR_NUM, MOMENT_UNIT.WEEKS)
            .endOf(MOMENT_STARTOF.WEEK)
            .format(TIME_FORMAT.Y_MM_DD)
    }

    const formateDateToTitle = (date: Moment): string => {
        return formatWithTimeZone(date, isShowWholeMonth ? TIME_FORMAT.DDDDMMMMDO : TIME_FORMAT.DDDDMMMDO, true, false)
    }

    const setNewDate = (date: Moment) => {
        const formateDataStr = formateDateToTitle(date)
        if (formateDataStr === formateDateToTitle(moment())) {
            setCurrentDate(`${t.labels.PBNA_MOBILE_TODAY}, ${formateDataStr.split(',')[NUMBER_VALUE.ONE_NUM]}`)
        } else {
            setCurrentDate(formateDataStr)
        }

        const formattedDate = formatWithTimeZone(date, TIME_FORMAT.Y_MM_DD, true, false)
        onDateChanged(formattedDate)
    }

    const handleArrDisable = (date: Moment) => {
        const currentDateTmp = date.format(TIME_FORMAT.Y_MM_DD)
        setLeftDisable(currentDateTmp === timeRange.startTime)
        setRightDisable(currentDateTmp === timeRange.endTime)
    }

    const handleChangeDate = (num: number): void => {
        setLeftActive(num === -1)
        setRightActive(num === NUMBER_VALUE.ONE_NUM)

        const newDate = moment().add(fromToday + num, MOMENT_UNIT.DAYS)

        setNewDate(newDate)
        setFromToday(fromToday + num)
        handleArrDisable(newDate)
    }

    useEffect(() => {
        setNewDate(moment())
    }, [])

    const disableColor = baseStyle.color.borderGray
    const leftColor = leftActive ? baseStyle.color.white : baseStyle.color.tabBlue
    const rightColor = rightActive ? baseStyle.color.white : baseStyle.color.tabBlue
    return (
        <View style={[styles.titleContain, containerStyle]}>
            <CText style={styles.titleStyle}>{currentDate}</CText>
            <View style={styles.arrowContainer}>
                {leftDisable ? (
                    <Arrow width={25} color={disableColor} />
                ) : (
                    <TouchableOpacity
                        onPress={() => {
                            handleChangeDate(-1)
                        }}
                    >
                        <Arrow width={25} color={leftColor} />
                    </TouchableOpacity>
                )}

                {rightDisable ? (
                    <Arrow width={25} style={styles.rightArrow} color={disableColor} />
                ) : (
                    <TouchableOpacity
                        onPress={() => {
                            handleChangeDate(+1)
                        }}
                    >
                        <Arrow width={25} style={[styles.rightArrow]} color={rightColor} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

export default CopilotDatePicker

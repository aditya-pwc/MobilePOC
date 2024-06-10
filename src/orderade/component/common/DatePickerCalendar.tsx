import React, { FC, useState, useImperativeHandle } from 'react'
import { View, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native'
import dayjs from 'dayjs'
import DateTimePicker from '@react-native-community/datetimepicker'
import { CommonLabel } from '../../enum/CommonLabel'
import moment from 'moment'
import { CommonParam } from '../../../common/CommonParam'
import { commonStyle } from '../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    ...commonStyle,
    calendarCont: {
        borderRadius: 8,
        marginHorizontal: 2
    }
})

const { width } = Dimensions.get('window')

interface DatePickerCalendarProps {
    cRef: any
    onPickDate: Function
    minDate?: string
    maxDate?: string
    currValue?: string
}

export const DatePickerCalendar: FC<DatePickerCalendarProps> = (props: DatePickerCalendarProps) => {
    const { cRef, onPickDate, currValue, minDate, maxDate } = props
    const [isAvailable, setCalendarVisible] = useState(false)
    const dateStr = currValue
    const value = dateStr
        ? moment(dateStr).tz(CommonParam.userTimeZone).toDate()
        : moment(new Date()).tz(CommonParam.userTimeZone).toDate()
    const [hadChangedDate, setHadChangedDate] = useState(false)

    const onClickToHide = () => {
        if (!hadChangedDate) {
            onPickDate(value)
        }
        setCalendarVisible(false)
    }

    useImperativeHandle(cRef, () => ({
        show: () => {
            setHadChangedDate(false)
            setCalendarVisible(true)
        },
        hide: () => {
            onClickToHide()
        }
    }))

    const getMaxDate = () => {
        if (moment(maxDate).isBefore(moment(minDate), 'seconds')) {
            return dayjs(minDate).toDate()
        }
        return dayjs(maxDate).toDate()
    }

    const renderDateTimePicker = () => {
        if (maxDate) {
            return (
                <DateTimePicker
                    textColor={'red'}
                    mode={'date'}
                    themeVariant={CommonLabel.LIGHT}
                    display={'inline'}
                    style={{ height: width * 0.85, width: width - 64 }}
                    timeZoneOffsetInMinutes={moment.tz(CommonParam.userTimeZone).utcOffset()}
                    minimumDate={dayjs(minDate).toDate()}
                    maximumDate={getMaxDate()}
                    value={value}
                    onChange={(e, date) => {
                        onPickDate(date)
                        setHadChangedDate(true)
                        setCalendarVisible(false)
                    }}
                />
            )
        }
        return (
            <DateTimePicker
                textColor={'red'}
                mode={'date'}
                themeVariant={CommonLabel.LIGHT}
                display={'inline'}
                style={{ height: width * 0.85, width: width - 64 }}
                minimumDate={moment(minDate).tz(CommonParam.userTimeZone).toDate()}
                timeZoneOffsetInMinutes={moment.tz(CommonParam.userTimeZone).utcOffset()}
                value={value}
                onChange={(e, date) => {
                    onPickDate(date)
                    setHadChangedDate(true)
                    setCalendarVisible(false)
                }}
            />
        )
    }

    return (
        <Modal visible={isAvailable} animationType="fade" transparent>
            <TouchableOpacity
                style={[styles.modalBg, styles.alignCenter]}
                onPress={() => {
                    onClickToHide()
                }}
            >
                <View style={[styles.calendarCont, styles.alignCenter, styles.bgWhite]}>{renderDateTimePicker()}</View>
            </TouchableOpacity>
        </Modal>
    )
}

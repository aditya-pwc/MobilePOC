import { Dimensions, Modal, TouchableOpacity, View, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { Calendar } from 'react-native-calendars'
import CText from '../../../common/components/CText'
import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { todayDateWithTimeZone } from '../../../common/utils/TimeZoneUtils'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { t } from '../../../common/i18n/t'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'

const { width } = Dimensions.get('window')
const styles = StyleSheet.create({
    buttonText: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.LightBlue,
        fontWeight: baseStyle.fontWeight.fw_600
    },
    grayText: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.cGray,
        fontWeight: baseStyle.fontWeight.fw_600
    },
    dotStyle: {
        width: 6,
        height: 6,
        borderRadius: 12
    },
    OrderDaysCycle: {
        backgroundColor: baseStyle.color.deepBlue,
        borderRadius: 15,
        width: 8,
        height: 8,
        marginRight: 5
    },
    modalView: {
        justifyContent: 'center',
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        height: 500,
        paddingTop: 22,
        paddingHorizontal: 30
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        width: width - 64,
        alignItems: 'center',
        borderTopLeftRadius: 12.39,
        borderTopRightRadius: 12.39,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.cGray,
        height: 50,
        paddingHorizontal: 15
    },
    calendarFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 50,
        backgroundColor: baseStyle.color.white,
        borderBottomLeftRadius: 12.39,
        borderBottomRightRadius: 12.39,
        width: width - 64,
        paddingHorizontal: 22,
        paddingBottom: 10
    },
    leftBottomLabel: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    rightBottomLabel: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    verticalLine: {
        height: 12,
        width: 1,
        backgroundColor: baseStyle.color.cGray,
        marginHorizontal: 8
    }
})

const DateDotCalendar = (props: any) => {
    const { visible, setVisible, frequency, startDate, endDate, onCalendarDone } = props
    const [deliveryDate, setDeliveryDate] = useState('')
    const [nextDeliveryDate, setNextDeliveryDate] = useState('')
    const [selectedDay, setSelectedDay] = useState('')
    const [isDeliveryDate, setIsDeliveryDate] = useState(true)
    const [canClickArrow, setCanClickArrow] = useState(false)
    const [orderDay1, setOrderDay1] = useState('')
    const [orderDay2, setOrderDay2] = useState('')
    const [cycleColor, selectedColor] = [baseStyle.color.deepBlue, baseStyle.color.lightBluePlus]
    const today = moment().format(TIME_FORMAT.Y_MM_DD)
    const currentMonth = moment().format(TIME_FORMAT.MONTH)
    const handleMonthChange = (date: any) => {
        if (moment(date.dateString || currentMonth).isAfter(currentMonth, 'month')) {
            setCanClickArrow(true)
        } else {
            setCanClickArrow(false)
        }
    }
    const handlePressCancel = () => {
        setVisible(false)
        setIsDeliveryDate(true)
        setDeliveryDate(startDate ? moment(startDate).format(TIME_FORMAT.Y_MM_DD) : '')
        setNextDeliveryDate(endDate ? moment(endDate).format(TIME_FORMAT.Y_MM_DD) : '')
        setSelectedDay(startDate ? moment(startDate).format(TIME_FORMAT.Y_MM_DD) : '')
    }
    useEffect(() => {
        setDeliveryDate(startDate ? moment(startDate).format(TIME_FORMAT.Y_MM_DD) : '')
        setNextDeliveryDate(endDate ? moment(endDate).format(TIME_FORMAT.Y_MM_DD) : '')
        setSelectedDay(startDate ? moment(startDate).format(TIME_FORMAT.Y_MM_DD) : '')
    }, [startDate, endDate])
    useEffect(() => {
        isDeliveryDate ? setSelectedDay(deliveryDate || '') : setSelectedDay(nextDeliveryDate || '')
        setOrderDay1(moment().add(frequency, 'days').format(TIME_FORMAT.Y_MM_DD))
        setOrderDay2(
            moment()
                .add(frequency * 2, 'days')
                .format(TIME_FORMAT.Y_MM_DD)
        )
    }, [isDeliveryDate, frequency])

    const handleNextPage = () => {
        setIsDeliveryDate(!isDeliveryDate)
    }
    return (
        <Modal visible={visible} animationType="fade" transparent>
            <TouchableOpacity style={styles.modalView} onPressOut={() => handlePressCancel()}>
                <TouchableWithoutFeedback>
                    <View>
                        <View style={styles.calendarHeader}>
                            {isDeliveryDate && <CText>{t.labels.PBNA_MOBILE_DELIVERY_DATE}</CText>}
                            {!isDeliveryDate && (
                                <CText>{`${t.labels.PBNA_MOBILE_NEXT} ${t.labels.PBNA_MOBILE_DELIVERY_DATE}`}</CText>
                            )}
                            <TouchableOpacity onPress={() => handlePressCancel()}>
                                <CText style={styles.buttonText}>
                                    {t.labels.PBNA_MOBILE_CANCEL.toLocaleUpperCase()}
                                </CText>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Calendar
                                style={{
                                    width: width - 64
                                }}
                                hideExtraDays
                                onMonthChange={handleMonthChange}
                                disableArrowLeft={!canClickArrow}
                                minDate={
                                    isDeliveryDate
                                        ? todayDateWithTimeZone(true)
                                        : moment(deliveryDate).add(1, 'day').format(TIME_FORMAT.Y_MM_DD)
                                }
                                maxDate={
                                    isDeliveryDate && nextDeliveryDate
                                        ? moment(nextDeliveryDate).add(-1, 'day').format(TIME_FORMAT.Y_MM_DD)
                                        : moment(todayDateWithTimeZone(true))
                                              .add(6, 'weeks')
                                              .format(TIME_FORMAT.Y_MM_DD)
                                }
                                theme={{
                                    backgroundColor: baseStyle.color.white,
                                    calendarBackground: baseStyle.color.white,
                                    selectedDayBackgroundColor: selectedColor,
                                    selectedDayTextColor: cycleColor,
                                    textDayFontWeight: baseStyle.fontWeight.fw_500,
                                    todayTextColor: cycleColor,
                                    dotStyle: styles.dotStyle
                                }}
                                onDayPress={(day) => {
                                    isDeliveryDate
                                        ? setDeliveryDate(moment(day.dateString).format(TIME_FORMAT.Y_MM_DD))
                                        : setNextDeliveryDate(moment(day.dateString).format(TIME_FORMAT.Y_MM_DD))
                                    setSelectedDay(day.dateString)
                                }}
                                markedDates={{
                                    [today]: {
                                        disableTouchEvent: true,
                                        marked: true,
                                        dotColor: cycleColor
                                    },
                                    [orderDay1]: {
                                        disableTouchEvent: orderDay1 === today,
                                        marked: true,
                                        dotColor: cycleColor
                                    },
                                    [orderDay2]: {
                                        disableTouchEvent: orderDay1 === today,
                                        marked: true,
                                        dotColor: cycleColor
                                    },
                                    [selectedDay]: {
                                        selected: true,
                                        selectedTextColor: cycleColor,
                                        selectedColor: selectedColor
                                    }
                                }}
                            />
                        </View>
                        <View style={styles.calendarFooter}>
                            <View style={styles.leftBottomLabel}>
                                <View style={styles.OrderDaysCycle} />
                                <CText>{t.labels.PBNA_MOBILE_ORDER_DAYS}</CText>
                            </View>
                            <View style={styles.rightBottomLabel}>
                                <TouchableOpacity
                                    onPress={() => {
                                        onCalendarDone(deliveryDate, nextDeliveryDate)
                                        setVisible(false)
                                        setIsDeliveryDate(true)
                                    }}
                                >
                                    <CText style={isDeliveryDate ? styles.grayText : styles.buttonText}>
                                        {t.labels.PBNA_MOBILE_DONE}
                                    </CText>
                                </TouchableOpacity>
                                <View style={styles.verticalLine} />
                                <TouchableOpacity onPress={() => handleNextPage()}>
                                    <CText style={styles.buttonText}>
                                        {isDeliveryDate
                                            ? t.labels.PBNA_MOBILE_NEXT.toLocaleUpperCase()
                                            : t.labels.PBNA_MOBILE_PREVIOUS.toLocaleUpperCase()}
                                    </CText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    )
}

export default DateDotCalendar

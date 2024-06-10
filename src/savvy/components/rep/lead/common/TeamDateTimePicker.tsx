import React, { useEffect, useImperativeHandle, useState } from 'react'
import { Image, Modal, TouchableOpacity, TouchableWithoutFeedback, useColorScheme, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import moment from 'moment'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import DateTimePicker from '@react-native-community/datetimepicker'
import { t } from '../../../../../common/i18n/t'
import { CommonParam } from '../../../../../common/CommonParam'
import { DatePickerLocale } from '../../../../enums/i18n'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { dateTimePickerStyle } from '../../../../styles/DateTimePickerStyle'
import { MOMENT_STARTOF } from '../../../../../common/enums/MomentStartOf'
interface TeamDateTimePickerProps {
    fieldLabel: string
    fieldApiName?: string
    section?: string
    onChange?: any
    deferred?: boolean
    value?: any
    cRef?: any
    minDate?: any
}

const TeamDateTimePicker = (props: TeamDateTimePickerProps) => {
    const { fieldLabel, onChange, value, cRef, minDate } = props
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [tempDate, setTempDate] = useState(moment().toDate())
    const [tempDateLabel, setTempDateLabel] = useState(moment().toDate())
    const [disableDone, setDisableDone] = useState(false)
    useImperativeHandle(cRef, () => ({
        setValue: (v) => {
            setTempDate(moment(v).toDate())
            setTempDateLabel(moment(v).toDate())
        }
    }))
    const onDateChange = (event, selectedDate) => {
        setTempDate(selectedDate)
    }

    const calculateDisableDone = () => {
        setDisableDone(
            !(
                moment().endOf(MOMENT_STARTOF.DAY).isAfter(moment(tempDate)) &&
                moment(tempDate).endOf(MOMENT_STARTOF.DAY).isAfter(minDate)
            )
        )
    }

    const handleClickDone = () => {
        setTempDateLabel(tempDate)
        setShowDatePicker(false)
        onChange(tempDate)
    }
    useEffect(() => {
        if (value) {
            setTempDate(moment(value).toDate())
            setTempDateLabel(moment(value).toDate())
        } else {
            setTempDate(moment().toDate())
            setTempDateLabel(moment().toDate())
        }
    }, [])
    useEffect(() => {
        calculateDisableDone()
    }, [tempDate])

    return (
        <View>
            <View style={dateTimePickerStyle.formItem}>
                <CText style={dateTimePickerStyle.title}>{fieldLabel}</CText>
                <TouchableOpacity
                    onPress={() => {
                        setShowDatePicker(true)
                    }}
                    style={commonStyle.flexDirectionRow}
                >
                    <CText style={[dateTimePickerStyle.inputStyle, dateTimePickerStyle.lookUpStyle]}>
                        {tempDateLabel ? moment(tempDateLabel).format('MMM DD, YYYY') : '-'}
                    </CText>
                    <View style={dateTimePickerStyle.absoluteRight}>
                        <Image style={dateTimePickerStyle.imgCalendar} source={ImageSrc.IMG_CALENDAR} />
                    </View>
                </TouchableOpacity>
            </View>
            <Modal animationType="fade" transparent visible={showDatePicker}>
                <View style={dateTimePickerStyle.centeredView}>
                    <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
                        <View style={dateTimePickerStyle.touchableStyle} />
                    </TouchableWithoutFeedback>
                    <View
                        style={[
                            dateTimePickerStyle.modalView,
                            { backgroundColor: useColorScheme() === 'dark' ? '#acacac' : 'white' }
                        ]}
                    >
                        <View style={dateTimePickerStyle.pickerContainer}>
                            <DateTimePicker
                                style={dateTimePickerStyle.datePicker}
                                testID={'dateTimePicker'}
                                textColor={'red'}
                                mode={'date'}
                                display={'inline'}
                                // timeZoneOffsetInMinutes={0}
                                // @ts-ignore
                                // This is a third party library type definition issue.
                                value={tempDate}
                                onChange={onDateChange}
                                minimumDate={moment(minDate).toDate()}
                                maximumDate={moment().toDate()}
                                locale={DatePickerLocale[CommonParam.locale]}
                            />
                        </View>
                        <View style={commonStyle.alignItemsEnd}>
                            <TouchableOpacity
                                onPress={() => {
                                    handleClickDone()
                                }}
                                style={dateTimePickerStyle.doneView}
                                disabled={disableDone}
                            >
                                <CText
                                    style={[
                                        dateTimePickerStyle.doneText,
                                        {
                                            color: disableDone ? 'gray' : 'black'
                                        }
                                    ]}
                                >
                                    {t.labels.PBNA_MOBILE_DONE}
                                </CText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default TeamDateTimePicker

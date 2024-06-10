/**
 * @description Component to show lead delivery and execution.
 * @author Shangmin Dou
 * @date 2021-05-25
 */
import React, { useEffect, useState } from 'react'
import {
    Image,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    useColorScheme,
    View
} from 'react-native'
import CText from '../../../../../common/components/CText'
import moment from 'moment'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import DateTimePicker from '@react-native-community/datetimepicker'
import store from '../../../../redux/store/Store'
import { useDispatch } from 'react-redux'
import { updateTempLeadAction } from '../../../../redux/action/LeadActionType'
import { t } from '../../../../../common/i18n/t'
import { isPersonaCRMBusinessAdmin } from '../../../../../common/enums/Persona'
import { CommonParam } from '../../../../../common/CommonParam'
import { DatePickerLocale } from '../../../../enums/i18n'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { dateTimePickerStyle } from '../../../../styles/DateTimePickerStyle'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../../../../common/enums/MomentStartOf'

const styles = StyleSheet.create({
    pickerStyle: {
        width: 350,
        height: 350
    }
})
interface LeadDateTimePickerProps {
    fieldLabel: string
    fieldApiName?: string
    section?: string
    onChange?: any
    deferred?: boolean
    value?: any
    isInputDate?: boolean
    placeHolder?: string
    maximumDate?: any
    minimumDate?: any
}

const LeadDateTimePicker = (props: LeadDateTimePickerProps) => {
    const {
        fieldLabel,
        fieldApiName,
        section,
        onChange,
        deferred,
        value,
        isInputDate = false,
        placeHolder,
        maximumDate,
        minimumDate
    } = props
    const [showDatePicker, setShowDatePicker] = useState(false)
    const dispatch = useDispatch()
    const setInitialState = () => {
        if (store.getState().leadReducer.negotiateLeadEditReducer[fieldApiName] !== null) {
            return moment(store.getState().leadReducer.negotiateLeadEditReducer[fieldApiName]).toDate()
        }
        return moment().toDate()
    }
    const setInitialStateLabel = () => {
        if (store.getState().leadReducer.negotiateLeadEditReducer[fieldApiName] !== null) {
            return moment(store.getState().leadReducer.negotiateLeadEditReducer[fieldApiName]).toDate()
        }
        return ''
    }
    const [tempDate, setTempDate] = useState(setInitialState())
    const [tempDateLabel, setTempDateLabel] = useState(setInitialStateLabel())
    const [disableDone, setDisableDone] = useState(false)
    const datePlaceHolder = placeHolder || '-'
    const isPlaceHolder = !tempDateLabel && datePlaceHolder
    const onDateChange = (event, selectedDate) => {
        setTempDate(selectedDate)
    }

    const haveValue = () => {
        return fieldApiName === 'Seasonal_Close_Start_Date_c__c' || fieldApiName === 'Seasonal_Close_End_Date_c__c'
    }

    const calculateDisableDone = () => {
        if (haveValue()) {
            if (
                fieldApiName === 'Seasonal_Close_Start_Date_c__c' &&
                store.getState().leadReducer.negotiateLeadEditReducer.Seasonal_Close_End_Date_c__c !== null &&
                !moment(tempDate).isSame(
                    moment(store.getState().leadReducer.negotiateLeadEditReducer.Seasonal_Close_End_Date_c__c),
                    MOMENT_STARTOF.DAY
                ) &&
                tempDate > new Date(store.getState().leadReducer.negotiateLeadEditReducer.Seasonal_Close_End_Date_c__c)
            ) {
                setDisableDone(true)
                return
            }
            if (
                fieldApiName === 'Seasonal_Close_End_Date_c__c' &&
                store.getState().leadReducer.negotiateLeadEditReducer.Seasonal_Close_Start_Date_c__c !== null &&
                !moment(tempDate).isSame(
                    moment(store.getState().leadReducer.negotiateLeadEditReducer.Seasonal_Close_Start_Date_c__c),
                    MOMENT_STARTOF.DAY
                ) &&
                tempDate <
                    new Date(store.getState().leadReducer.negotiateLeadEditReducer.Seasonal_Close_Start_Date_c__c)
            ) {
                setDisableDone(true)
                return
            }
        }
        setDisableDone(false)
    }

    const calculateDisableDone2 = () => {
        setDisableDone(true)
        if (moment().endOf(MOMENT_STARTOF.DAY).isBefore(moment(tempDate))) {
            setDisableDone(false)
        }
    }

    const calculateDisableDone3 = () => {
        setDisableDone(true)
        if (
            moment(tempDate).isAfter(moment().startOf(MOMENT_STARTOF.DAY)) ||
            moment(tempDate).isSame(moment(), MOMENT_STARTOF.DAY)
        ) {
            setDisableDone(false)
        }
    }

    const handleClickDone = () => {
        setTempDateLabel(tempDate)
        setShowDatePicker(false)
        const newObj = {}
        if (onChange) {
            onChange(tempDate)
        } else {
            newObj[fieldApiName] = moment(tempDate).format(TIME_FORMAT.Y_MM_DD)
            dispatch(updateTempLeadAction(newObj, section))
        }
    }
    useEffect(() => {
        if (!onChange) {
            return store.subscribe(() => {
                setTempDate(setInitialState())
                setTempDateLabel(setInitialStateLabel())
            })
        }
        if (value) {
            if (isInputDate) {
                setTempDate(moment(value + 'T00:00:00.000Z').toDate())
                setTempDateLabel(moment(value + 'T00:00:00.000Z').toDate())
            } else {
                setTempDate(moment(value).toDate())
                setTempDateLabel(moment(value).toDate())
            }
        } else {
            setTempDate(moment().toDate())
            setTempDateLabel('')
        }
    }, [])
    useEffect(() => {
        if (!onChange) {
            if (deferred) {
                calculateDisableDone3()
            } else {
                calculateDisableDone()
            }
        } else {
            if (deferred) {
                calculateDisableDone3()
            } else {
                calculateDisableDone2()
            }
        }
    }, [tempDate])

    return (
        <View>
            <View style={dateTimePickerStyle.formItem}>
                <CText style={dateTimePickerStyle.title}>{fieldLabel}</CText>
                <TouchableOpacity
                    onPress={() => {
                        !isPersonaCRMBusinessAdmin() && setShowDatePicker(true)
                    }}
                    style={commonStyle.flexDirectionRow}
                >
                    <CText
                        style={[
                            isPlaceHolder ? dateTimePickerStyle.placeHolderStyle : dateTimePickerStyle.inputStyle,
                            dateTimePickerStyle.lookUpStyle
                        ]}
                    >
                        {tempDateLabel ? moment(tempDateLabel).format(TIME_FORMAT.MMM_DD_YYYY) : datePlaceHolder}
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
                        <View style={styles.pickerStyle}>
                            <DateTimePicker
                                style={dateTimePickerStyle.datePicker}
                                testID={'dateTimePicker'}
                                textColor={'red'}
                                mode={'date'}
                                display={'inline'}
                                // timeZoneOffsetInMinutes={0}
                                // @ts-ignore
                                // This is a third party library type definition issue.
                                timeZoneOffsetInMinutes={moment.tz(CommonParam.userTimeZone).utcOffset()}
                                value={tempDate}
                                onChange={onDateChange}
                                locale={DatePickerLocale[CommonParam.locale]}
                                maximumDate={maximumDate}
                                minimumDate={minimumDate}
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

export default LeadDateTimePicker

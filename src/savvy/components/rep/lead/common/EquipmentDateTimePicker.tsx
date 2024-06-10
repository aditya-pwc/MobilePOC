/**
 * @description Component to show Equipment install date.
 * @author Kiren Cao
 * @date 2022-01-17
 */
import React, { useEffect, useImperativeHandle, useState } from 'react'
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
import { CommonParam } from '../../../../../common/CommonParam'
import { DatePickerLocale } from '../../../../enums/i18n'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { dateTimePickerStyle } from '../../../../styles/DateTimePickerStyle'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../../../../common/enums/MomentStartOf'

const styles = StyleSheet.create({
    absoluteRight_8: {
        position: 'absolute',
        right: 8
    },
    redStarBox: {
        flexDirection: 'row'
    },
    displayNone: {
        display: 'none'
    },
    titleHorizontalStyle: {
        marginRight: 16,
        flex: 1,
        fontSize: 14
    },
    inputStyle: {
        marginRight: 38
    },
    redStarText: {
        fontSize: 12,
        color: '#EB445A',
        fontWeight: '500'
    }
})

interface EquipmentDateTimePickerProps {
    fieldLabel: string
    fieldApiName?: string
    section?: string
    onChange?: any
    deferred?: boolean
    value?: any
    cRef?: any
    minimumDate?: Date
    weekAfter?: boolean
    require?: boolean
    titleHorizontal?: boolean
}

const EquipmentDateTimePicker = (props: EquipmentDateTimePickerProps) => {
    const {
        fieldLabel,
        fieldApiName,
        section,
        onChange,
        deferred,
        value,
        cRef,
        minimumDate,
        weekAfter,
        require,
        titleHorizontal
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
    const toDay = moment().toDate()
    const weekAfterDate = moment(toDay).add(7, 'days')
    useImperativeHandle(cRef, () => ({
        setValue: (v) => {
            setTempDate(moment(v).toDate())
            setTempDateLabel(moment(v).toDate())
        }
    }))
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
        setDisableDone(false)
        if (weekAfter) {
            if (
                moment(weekAfterDate).endOf(MOMENT_STARTOF.DAY).isBefore(moment(tempDate)) ||
                moment(weekAfterDate).endOf(MOMENT_STARTOF.DAY).isSame(moment(tempDate).endOf(MOMENT_STARTOF.DAY))
            ) {
                setDisableDone(false)
            }
        } else {
            setDisableDone(true)
            if (moment().endOf(MOMENT_STARTOF.DAY).isBefore(moment(tempDate))) {
                setDisableDone(false)
            }
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
            setTempDate(moment(value).toDate())
            setTempDateLabel(moment(value).toDate())
        } else if (weekAfter) {
            setTempDate(moment().add(7, 'days').toDate())
            setTempDateLabel('')
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
                <View style={[styles.redStarBox, titleHorizontal ? styles.displayNone : null]}>
                    <CText style={dateTimePickerStyle.title}>{fieldLabel}</CText>
                    {require && <CText style={styles.redStarText}>*</CText>}
                </View>

                <TouchableOpacity
                    onPress={() => {
                        setShowDatePicker(true)
                    }}
                    style={commonStyle.flexDirectionRow}
                >
                    <CText
                        style={[
                            dateTimePickerStyle.title,
                            dateTimePickerStyle.lookUpStyle,
                            titleHorizontal ? styles.titleHorizontalStyle : styles.displayNone
                        ]}
                    >
                        {fieldLabel}
                    </CText>
                    <CText
                        style={[
                            dateTimePickerStyle.inputStyle,
                            dateTimePickerStyle.lookUpStyle,
                            titleHorizontal ? styles.inputStyle : null
                        ]}
                    >
                        {tempDateLabel ? moment(tempDateLabel).format(TIME_FORMAT.MMM_DD_YYYY) : '-'}
                    </CText>
                    <View style={styles.absoluteRight_8}>
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
                                minimumDate={minimumDate || (weekAfter ? weekAfterDate.toDate() : moment().toDate())}
                                timeZoneOffsetInMinutes={moment.tz(CommonParam.userTimeZone).utcOffset()}
                                locale={DatePickerLocale[CommonParam.locale]}
                            />
                        </View>
                        <View style={commonStyle.alignItemsEnd}>
                            <TouchableOpacity
                                onPress={() => {
                                    handleClickDone()
                                }}
                                style={dateTimePickerStyle.doneView}
                                disabled={!minimumDate && disableDone}
                            >
                                <CText
                                    style={[
                                        dateTimePickerStyle.doneText,
                                        {
                                            color: !minimumDate && disableDone ? 'gray' : 'black'
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

export default EquipmentDateTimePicker

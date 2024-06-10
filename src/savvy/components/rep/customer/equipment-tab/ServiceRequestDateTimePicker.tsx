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
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../../../../common/enums/MomentStartOf'

const styles = StyleSheet.create({
    formItem: {
        paddingRight: 0,
        marginBottom: 22,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    title: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    inputStyle: {
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Gotham-Book'
    },
    lookUpStyle: {
        height: 40,
        lineHeight: 40
    },
    imgCalendar: {
        marginTop: 12,
        width: 20,
        height: 20,
        resizeMode: 'stretch'
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.001)'
    },
    modalView: {
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderRadius: 20
    },
    datePicker: {
        width: '100%',
        height: '100%'
    },
    calendarStyle: {
        position: 'absolute',
        right: 0
    },
    background: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,.5)'
    },
    timePickerContainer: {
        width: 350,
        height: 350
    },
    alignItemsEnd: {
        alignItems: 'flex-end'
    },
    marginBottom_10: {
        marginBottom: 10
    }
})

interface ServiceRequestDateTimePickerProps {
    fieldLabel: string
    fieldApiName?: string
    section?: string
    onChange?: any
    deferred?: boolean
    value?: any
    cRef?: any
    weekAfter?: boolean
}

const ServiceRequestDateTimePicker = (props: ServiceRequestDateTimePickerProps) => {
    const { fieldLabel, fieldApiName, section, onChange, deferred, value, cRef, weekAfter } = props
    const [showDatePicker, setShowDatePicker] = useState(false)
    const dispatch = useDispatch()
    const setInitialState = () => {
        if (store.getState().leadReducer.negotiateLeadEditReducer[fieldApiName] !== null) {
            return moment(store.getState().leadReducer.negotiateLeadEditReducer[fieldApiName]).toDate()
        }
        return moment().add(1, 'days').toDate()
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
            setTempDate(moment(value).toDate())
            setTempDateLabel(moment(value).toDate())
        } else if (weekAfter) {
            setTempDate(moment().add(7, 'days').toDate())
            setTempDateLabel('')
        } else {
            setTempDate(moment().add(1, 'days').toDate())
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
            <View style={styles.formItem}>
                <CText style={styles.title}>{fieldLabel}</CText>
                <TouchableOpacity
                    onPress={() => {
                        setShowDatePicker(true)
                    }}
                    style={commonStyle.flexDirectionRow}
                >
                    <CText style={[styles.inputStyle, styles.lookUpStyle]}>
                        {tempDateLabel ? moment(tempDateLabel).format('MMM DD, YYYY') : '-'}
                    </CText>
                    <View style={styles.calendarStyle}>
                        <Image style={styles.imgCalendar} source={ImageSrc.IMG_CALENDAR} />
                    </View>
                </TouchableOpacity>
            </View>
            <Modal animationType="fade" transparent visible={showDatePicker}>
                <View style={styles.centeredView}>
                    <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
                        <View style={styles.background} />
                    </TouchableWithoutFeedback>
                    <View
                        style={[
                            styles.modalView,
                            { backgroundColor: useColorScheme() === 'dark' ? '#acacac' : 'white' }
                        ]}
                    >
                        <View style={styles.timePickerContainer}>
                            <DateTimePicker
                                style={styles.datePicker}
                                testID={'dateTimePicker'}
                                textColor={'red'}
                                mode={'date'}
                                display={'inline'}
                                timeZoneOffsetInMinutes={moment.tz(CommonParam.userTimeZone).utcOffset()}
                                // @ts-ignore
                                // This is a third party library type definition issue.
                                value={tempDate}
                                onChange={onDateChange}
                                minimumDate={weekAfter ? weekAfterDate.toDate() : moment().add(1, 'days').toDate()}
                                locale={DatePickerLocale[CommonParam.locale]}
                            />
                        </View>
                        <View style={styles.alignItemsEnd}>
                            <TouchableOpacity
                                onPress={() => {
                                    handleClickDone()
                                }}
                                style={styles.marginBottom_10}
                                disabled={disableDone}
                            >
                                <CText
                                    style={{
                                        fontSize: 16,
                                        fontWeight: '500',
                                        color: disableDone ? 'gray' : 'black'
                                    }}
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

export default ServiceRequestDateTimePicker

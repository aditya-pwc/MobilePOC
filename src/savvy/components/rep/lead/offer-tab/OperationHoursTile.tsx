import React, { useEffect, useState } from 'react'
import { Modal, Switch, TouchableOpacity, TouchableWithoutFeedback, View, StyleSheet } from 'react-native'
import CText from '../../../../../common/components/CText'
import Collapsible from 'react-native-collapsible'
import _ from 'lodash'
import { TimePicker } from 'react-native-simple-time-picker'
import moment from 'moment'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    operationHoursTileContainer: {
        width: '100%',
        marginTop: 20,
        paddingBottom: 5,
        borderBottomColor: '#CDCDCD',
        borderBottomWidth: 1
    },
    switchContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    timeContainer: {
        flexDirection: 'row',
        height: 40
    },
    timeTextContainer: {
        justifyContent: 'center',
        flexDirection: 'column',
        width: '50%'
    },
    modalViewContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    withoutFeedBackView: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,.5)'
    },
    timeOpeContainer: {
        padding: 20,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderRadius: 20,
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    setTimeContainer: {
        width: '50%',
        alignItems: 'center'
    },
    color_black: {
        color: 'black'
    },
    color_gray: {
        color: 'gray'
    },
    fontWeight_500: {
        fontWeight: '500'
    }
})

interface OperationHoursTileProps {
    daysOpen: Array<any>
    setDaysOpen: (daysOpen: Array<any>) => void
    weekDay: any
}

const DATE_PLACEHOLDER = '2021-04-01'
const TIME_PLACEHOLDER = '00:00:00.000Z'

const OperationHoursTile = (props: OperationHoursTileProps) => {
    const { daysOpen, setDaysOpen, weekDay } = props
    const [showModal, setShowModal] = useState(false)
    const [disableDone, setDisableDone] = useState(true)
    const setSwitch = (v) => {
        const daysOpenNew = _.cloneDeep(daysOpen)
        daysOpenNew[weekDay].open = v
        if (v) {
            setShowModal(true)
            daysOpenNew[weekDay].from = TIME_PLACEHOLDER
            daysOpenNew[weekDay].to = TIME_PLACEHOLDER
        } else {
            daysOpenNew[weekDay].from = ''
            daysOpenNew[weekDay].to = ''
        }
        setDaysOpen(daysOpenNew)
    }

    const timeStringToNumber = (s) => {
        const hours = parseInt(s.slice(0, 2))
        const minutes = parseInt(s.slice(3, 5))
        return { hours, minutes }
    }

    const numberToTimeString = ({ hours, minutes }) => {
        return `${hours < 10 ? '0' + hours : hours + ''}:${minutes < 10 ? '0' + minutes : minutes + ''}:00.000Z`
    }

    const setDatetimePickerValue = (type) => {
        if (daysOpen[weekDay][type] === '') {
            return { minutes: 0, hours: 0 }
        }
        return timeStringToNumber(daysOpen[weekDay][type])
    }
    const setTime = (v, type) => {
        let timeString = numberToTimeString(v)
        const formatTime = new Date(DATE_PLACEHOLDER + numberToTimeString(v))
        if (
            type === 'from' &&
            daysOpen[weekDay].to !== null &&
            daysOpen[weekDay].to !== '' &&
            daysOpen[weekDay].to !== '00:00:00.000Z' &&
            formatTime > new Date(DATE_PLACEHOLDER + daysOpen[weekDay].to)
        ) {
            timeString = daysOpen[weekDay].from
        }
        if (
            type === 'to' &&
            daysOpen[weekDay].from !== null &&
            daysOpen[weekDay].from !== '' &&
            formatTime < new Date(DATE_PLACEHOLDER + daysOpen[weekDay].from)
        ) {
            timeString = daysOpen[weekDay].to
        }
        const daysOpenNew = _.cloneDeep(daysOpen)
        daysOpenNew[weekDay][type] = timeString
        setDaysOpen(daysOpenNew)
    }

    const formatFromTime = () => {
        return moment(
            moment(new Date()).format('MM/DD/YYYY ') +
                (daysOpen[weekDay].from !== null ? daysOpen[weekDay].from : '').split('.')[0]
        ).format('h:mm A')
    }

    const formatToTime = () => {
        return moment(
            moment(new Date()).format('MM/DD/YYYY ') +
                (daysOpen[weekDay].to !== null ? daysOpen[weekDay].to : '').split('.')[0]
        ).format('h:mm A')
    }

    useEffect(() => {
        if (new Date('2021-04-01T' + daysOpen[weekDay].from) < new Date('2021-04-01T' + daysOpen[weekDay].to)) {
            setDisableDone(false)
            return
        }
        setDisableDone(true)
    }, [daysOpen[weekDay]])
    return (
        <View style={styles.operationHoursTileContainer}>
            <View style={styles.switchContainer}>
                <CText>{weekDay}</CText>
                <Switch
                    value={daysOpen[weekDay].open}
                    onValueChange={(v) => {
                        setSwitch(v)
                    }}
                />
            </View>
            <Collapsible collapsed={!daysOpen[weekDay].open}>
                <TouchableOpacity
                    onPress={() => {
                        setShowModal(true)
                    }}
                >
                    <View style={styles.timeContainer}>
                        <View style={styles.timeTextContainer}>
                            {daysOpen[weekDay].from !== null && daysOpen[weekDay].from !== '' ? (
                                <CText>
                                    {_.capitalize(t.labels.PBNA_MOBILE_FROM)}&nbsp;{formatFromTime()}
                                </CText>
                            ) : (
                                <CText>{_.capitalize(t.labels.PBNA_MOBILE_FROM)}&nbsp;- </CText>
                            )}
                        </View>
                        <View style={styles.timeTextContainer}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowModal(true)
                                }}
                            >
                                {daysOpen[weekDay].from !== null && daysOpen[weekDay].from !== '' ? (
                                    <CText>
                                        {_.capitalize(t.labels.PBNA_MOBILE_TO)}&nbsp;{formatToTime()}
                                    </CText>
                                ) : (
                                    <CText>{_.capitalize(t.labels.PBNA_MOBILE_TO)}&nbsp;- </CText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Collapsible>
            <Modal animationType="fade" transparent visible={showModal}>
                <View style={styles.modalViewContainer}>
                    <TouchableWithoutFeedback>
                        <View style={styles.withoutFeedBackView} />
                    </TouchableWithoutFeedback>
                    <View style={styles.timeOpeContainer}>
                        <View style={[commonStyle.flexRowCenter, commonStyle.fullWidth]}>
                            <View style={styles.setTimeContainer}>
                                <CText>{_.capitalize(t.labels.PBNA_MOBILE_FROM)}</CText>
                                <TimePicker
                                    value={setDatetimePickerValue('from')}
                                    onChange={(v) => {
                                        setTime(v, 'from')
                                    }}
                                />
                            </View>
                            <View style={styles.setTimeContainer}>
                                <CText>{_.capitalize(t.labels.PBNA_MOBILE_TO)}</CText>
                                <TimePicker
                                    value={setDatetimePickerValue('to')}
                                    onChange={(v) => {
                                        setTime(v, 'to')
                                    }}
                                />
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                setShowModal(false)
                            }}
                            disabled={disableDone}
                        >
                            <CText
                                style={[disableDone ? styles.color_gray : styles.color_black, styles.fontWeight_500]}
                            >
                                {_.capitalize(t.labels.PBNA_MOBILE_DONE)}
                            </CText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default OperationHoursTile

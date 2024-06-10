/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2023-12-08 15:36:07
 * @LastEditTime: 2024-01-30 14:55:21
 * @LastEditors: Mary Qian
 */

import React, { useEffect, useState } from 'react'
import { TouchableOpacity, View, StyleSheet, Image, Modal, Alert, DeviceEventEmitter } from 'react-native'
import CText from '../../../../../common/components/CText'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { t } from '../../../../../common/i18n/t'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import _ from 'lodash'
import { TimePicker, ValueMap } from 'react-native-simple-time-picker'
import { ScrollView } from 'react-native-gesture-handler'
import AddButton from '../../../common/AddButton'
import {
    DTW_DEFAULT_END_TIME_2,
    DTW_DEFAULT_START_TIME_2,
    DefaultDeliveryTimeWindow,
    DefaultTimeBox,
    DeliveryTimeObjProps,
    DeliveryTimeProps,
    TimeBoxProps,
    getBody,
    getDoubleString,
    getFullNameOfWeek,
    uploadToSharePoint
} from './EditDeliveryTimeWindowHelper'
import { useDropDown } from '../../../../../common/contexts/DropdownContext'
import Loading from '../../../../../common/components/Loading'
import { DTWEmailInfo, DelTimeWindowEmailEvent, getDTWEmailInfo } from './DeliveryTimeWindowEmail'

const styles = StyleSheet.create({
    containerView: {
        backgroundColor: 'white',
        flex: 1
    },
    contentView: {
        flex: 1,
        paddingHorizontal: 22,
        marginBottom: 100
    },
    titleText: {
        marginTop: 55,
        fontSize: 24,
        fontWeight: '900',
        color: '#000'
    },
    hintText: {
        marginTop: 40,
        fontSize: 16,
        fontWeight: '700',
        color: '#000'
    },
    weekView: {
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F7',
        paddingTop: 20,
        paddingBottom: 20
    },
    dayText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000'
    },
    dayTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 50,
        marginTop: 20
    },
    oneTimeView: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    timeTitleText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656'
    },
    timeClockContainer: {
        flex: 1,
        ...commonStyle.flexRowSpaceCenter,
        paddingVertical: 15,
        height: 36
    },
    timeText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
        height: 36,
        lineHeight: 36,
        color: baseStyle.color.black
    },
    clockImage: {
        width: 18,
        height: 18,
        marginLeft: 10,
        marginRight: 10
    },
    placeholderBetweenTime: {
        width: 25
    },
    placeholderForTrash: {
        width: 33
    },
    trashView: {
        marginLeft: 9
    },
    trashImage: {
        width: 24,
        height: 27,
        backgroundColor: 'white'
    },
    addSecondTimeView: {
        ...commonStyle.flexRowAlignCenter,
        paddingTop: 20
    },
    addSecondTimeText: {
        marginLeft: 7,
        color: '#00A2D9',
        fontSize: 12,
        fontWeight: '700'
    },
    bottomContainer: {
        position: 'absolute',
        left: 0,
        bottom: 30,
        flexDirection: 'row',
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10
    },
    bottomButton: {
        flexGrow: 1,
        width: '50%',
        backgroundColor: baseStyle.color.white,
        height: 60,
        ...commonStyle.alignCenter
    },
    cancelButton: {
        borderRightWidth: 1,
        borderRightColor: baseStyle.color.modalBlack
    },
    submitButtonActive: {
        backgroundColor: baseStyle.color.purple
    },
    submitButtonInActive: {
        backgroundColor: baseStyle.color.white
    },
    cancelText: {
        color: baseStyle.color.purple,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    submitText: {
        color: baseStyle.color.borderGray,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    submitTextActive: {
        color: baseStyle.color.white
    },
    submitTextInActive: {
        color: baseStyle.color.borderGray
    },
    centeredView: {
        ...commonStyle.flexCenter,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 300,
        width: '90%'
    },
    modalHeader: {
        ...commonStyle.flexRowSpaceCenter,
        marginHorizontal: 20,
        paddingVertical: 20,
        borderBottomColor: baseStyle.color.borderGray,
        borderBottomWidth: 1
    },
    modalDoneText: {
        color: baseStyle.color.tabBlue,
        fontWeight: baseStyle.fontWeight.fw_bold,
        fontSize: baseStyle.fontSize.fs_12
    }
})

const initDeliveryTimeObj = (deliveryTimeObj: DeliveryTimeObjProps): DeliveryTimeObjProps => {
    const newObj: DeliveryTimeObjProps = _.cloneDeep(DefaultDeliveryTimeWindow)
    for (const [day, timeWindow] of Object.entries(deliveryTimeObj)) {
        const newTimeWindow = {
            ...timeWindow
        }
        newObj[day] = newTimeWindow
    }

    return newObj
}

interface EditDeliveryTimeWindowProps {
    route: any
    navigation: any
}

const EditDeliveryTimeWindow = (props: EditDeliveryTimeWindowProps) => {
    const { route, navigation } = props
    const obj = route.params.deliveryTimeObj
    const accountId = route.params.accountId

    const [isLoading, setIsLoading] = useState(false)
    const [showTimeModal, setShowTimeModal] = useState(false)
    const [currentTimeBox, setCurrentTimeBox] = useState<TimeBoxProps>(DefaultTimeBox)
    const [deliveryTimeObj, setDeliveryTimeObj] = useState(initDeliveryTimeObj(obj))
    const [isSubmitActive, setIsSubmitActive] = useState(false)

    const { dropDownRef } = useDropDown()

    const onClickCancel = () => {
        navigation?.goBack()
    }

    const onClickTrash = (day: string) => {
        const newObj = {
            ...deliveryTimeObj,
            [day]: {
                ...deliveryTimeObj[day],
                startTime2: null,
                endTime2: null,
                localStartTime2: '',
                localEndTime2: ''
            }
        }

        setDeliveryTimeObj(newObj)
    }

    const checkIfUserChangedTimeWindow = () => {
        const changedWeekdays = []

        for (const week in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, week)) {
                const oldItem = obj[week]
                const newItem: DeliveryTimeProps = deliveryTimeObj[week]
                if (
                    !(
                        oldItem.startTime1 === newItem.startTime1 &&
                        oldItem.startTime2 === newItem.startTime2 &&
                        oldItem.endTime1 === newItem.endTime1 &&
                        oldItem.endTime2 === newItem.endTime2
                    )
                ) {
                    changedWeekdays.push({
                        ...newItem,
                        week,
                        fullTimeString: `${newItem.startTime1}-${newItem.endTime1}-${newItem.startTime2}-${newItem.endTime2}`
                    })
                }
            }
        }

        return changedWeekdays
    }

    const getChangedTimeWindows = async () => {
        const changedWeekdays = checkIfUserChangedTimeWindow()
        const groupedData = _.groupBy(changedWeekdays, 'fullTimeString')
        const body = await getBody(groupedData, accountId)
        if (_.isEmpty(body)) {
            dropDownRef?.current?.alertWithType('error', 'Submitted Failed', 'Please sync the data')
            return
        }
        const res = await uploadToSharePoint(body)

        if (!_.isEmpty(res?.error)) {
            dropDownRef?.current?.alertWithType('error', 'Submitted Failed', res?.error)
        } else {
            setTimeout(() => {
                navigation?.goBack()
            }, 500)

            const mailInfo: DTWEmailInfo = await getDTWEmailInfo(deliveryTimeObj, accountId)
            setTimeout(async () => {
                DeviceEventEmitter.emit(DelTimeWindowEmailEvent, mailInfo)
            }, 1000)
        }
    }

    const checkIfTimeWindowValid = () => {
        let isValid = true

        for (const [day, dayTimeWindow] of Object.entries(deliveryTimeObj)) {
            const { localStartTime1, localEndTime1, localStartTime2, localEndTime2 } = dayTimeWindow

            const isTime1NotFilled =
                (!_.isEmpty(localEndTime1) && _.isEmpty(localStartTime1)) ||
                (!_.isEmpty(localStartTime1) && _.isEmpty(localEndTime1))
            const isTime1Invalid =
                !_.isEmpty(localEndTime1) && !_.isEmpty(localStartTime1) && localEndTime1 <= localStartTime1
            const isTime2Invalid =
                !_.isEmpty(localEndTime2) && !_.isEmpty(localStartTime2) && localEndTime2 <= localStartTime2
            if (isTime1NotFilled || isTime1Invalid || isTime2Invalid) {
                Alert.alert(`${t.labels.PBNA_MOBILE_EDIT_TIME_WINDOW_CHECK1} ${getFullNameOfWeek(day)}`)
                isValid = false
                break
            }

            if (!_.isEmpty(localEndTime1) && !_.isEmpty(localStartTime2) && localEndTime1 >= localStartTime2) {
                Alert.alert(`${t.labels.PBNA_MOBILE_EDIT_TIME_WINDOW_CHECK2} ${getFullNameOfWeek(day)}`)
                isValid = false
                break
            }
        }

        return isValid
    }

    const onClickProceed = async () => {
        setIsLoading(true)
        setIsSubmitActive(false)
        try {
            await getChangedTimeWindows()
        } finally {
            setIsSubmitActive(true)
            setIsLoading(false)
        }
    }

    const onClickSubmit = async () => {
        const result = checkIfTimeWindowValid()
        if (!result) {
            return
        }

        Alert.alert(t.labels.PBNA_MOBILE_TIME_WINDOW_REQUEST, t.labels.PBNA_MOBILE_TIME_WINDOW_REQUEST_INFO, [
            {
                text: t.labels.PBNA_MOBILE_GO_BACK
            },
            {
                text: t.labels.PBNA_MOBILE_YES_PROCEED,
                onPress: onClickProceed
            }
        ])
    }

    const handleDurationChange = (params: ValueMap) => {
        setCurrentTimeBox({ ...currentTimeBox, defaultHour: params.hours || 0, defaultMinute: params.minutes || 0 })
    }

    const getNewObj = (modalTitle: string, newSFTime: string, newLocalTime: string) => {
        switch (modalTitle) {
            case `${t.labels.PBNA_MOBILE_OPEN_TIME} 1`:
                return {
                    localStartTime1: newLocalTime,
                    startTime1: newSFTime
                }
            case `${t.labels.PBNA_MOBILE_CLOSE_TIME} 1`:
                return {
                    localEndTime1: newLocalTime,
                    endTime1: newSFTime
                }
            case `${t.labels.PBNA_MOBILE_OPEN_TIME} 2`:
                return {
                    localStartTime2: newLocalTime,
                    startTime2: newSFTime
                }
            case `${t.labels.PBNA_MOBILE_CLOSE_TIME} 2`:
                return {
                    localEndTime2: newLocalTime,
                    endTime2: newSFTime
                }
            default:
                return {}
        }
    }

    const onClickDoneTimeModal = () => {
        setShowTimeModal(!showTimeModal)

        const { week, modalTitle, defaultHour, defaultMinute } = currentTimeBox

        const newLocalTime = `${getDoubleString(defaultHour)}:${getDoubleString(defaultMinute)}`
        const newSFTime = newLocalTime

        const newObj = {
            ...deliveryTimeObj,
            [week]: {
                ...deliveryTimeObj[week],
                ...getNewObj(modalTitle, newSFTime, newLocalTime)
            }
        }
        setDeliveryTimeObj(newObj)
    }

    const onClickAddSecondWindow = (day: string) => {
        const newObj = {
            ...deliveryTimeObj,
            [day]: {
                ...deliveryTimeObj[day],
                startTime2: DTW_DEFAULT_START_TIME_2,
                endTime2: DTW_DEFAULT_END_TIME_2,
                localStartTime2: DTW_DEFAULT_START_TIME_2,
                localEndTime2: DTW_DEFAULT_END_TIME_2
            }
        }
        setDeliveryTimeObj(newObj)
    }

    useEffect(() => {
        const changedWeekdays = checkIfUserChangedTimeWindow()
        setIsSubmitActive(changedWeekdays.length > 0)
    }, [deliveryTimeObj])

    const renderTime = (day: string, title: string, time: string) => {
        return (
            <View style={styles.oneTimeView}>
                <CText style={styles.timeTitleText}>{title}</CText>

                <TouchableOpacity
                    style={styles.timeClockContainer}
                    onPress={() => {
                        setCurrentTimeBox({
                            week: day,
                            modalTitle: title,
                            defaultHour: Number(time.split(':')[0] || 0),
                            defaultMinute: Number(time.split(':')[1] || 0)
                        })
                        setShowTimeModal(true)
                    }}
                >
                    <CText style={styles.timeText}>{time}</CText>
                    <Image source={ImageSrc.IMG_CLOCK_BLUE} style={styles.clockImage} />
                </TouchableOpacity>
            </View>
        )
    }

    const renderTimeRow = (day: string, startTime: string, endTime: string, isSecondTime: boolean) => {
        const index = isSecondTime ? '2' : '1'
        return (
            <View style={styles.dayTimeContainer}>
                {renderTime(day, `${t.labels.PBNA_MOBILE_OPEN_TIME} ${index}`, startTime)}
                <View style={styles.placeholderBetweenTime} />
                {renderTime(day, `${t.labels.PBNA_MOBILE_CLOSE_TIME} ${index}`, endTime)}
                {!isSecondTime && <View style={styles.placeholderForTrash} />}

                {isSecondTime && (
                    <TouchableOpacity
                        onPress={() => {
                            onClickTrash(day)
                        }}
                        style={styles.trashView}
                    >
                        <Image source={require('../../../../../../assets/image/trash.png')} style={styles.trashImage} />
                    </TouchableOpacity>
                )}
            </View>
        )
    }

    const renderDayTimeWindow = (day: string, deliveryTime: DeliveryTimeProps) => {
        const { localStartTime1, localEndTime1, localStartTime2, localEndTime2 } = deliveryTime

        const haveSecondTime = !_.isEmpty(localStartTime2) || !_.isEmpty(localEndTime2)
        const isFirstTimeEmpty = _.isEmpty(localStartTime1) || _.isEmpty(localEndTime1)
        const addSecondItemColor = isFirstTimeEmpty ? baseStyle.color.borderGray : '#00A2D9'

        return (
            <View style={styles.weekView} key={day}>
                <CText style={styles.dayText}>{getFullNameOfWeek(day)}</CText>
                {renderTimeRow(
                    day,
                    _.isEmpty(localStartTime1) ? '' : localStartTime1,
                    _.isEmpty(localEndTime1) ? '' : localEndTime1,
                    false
                )}
                {haveSecondTime && renderTimeRow(day, localStartTime2, localEndTime2, true)}

                {!haveSecondTime && (
                    <TouchableOpacity
                        style={styles.addSecondTimeView}
                        onPress={() => {
                            if (!isFirstTimeEmpty) {
                                onClickAddSecondWindow(day)
                            }
                        }}
                    >
                        <AddButton color={addSecondItemColor} />
                        <CText style={[styles.addSecondTimeText, { color: addSecondItemColor }]}>
                            {t.labels.PBNA_MOBILE_ADD_SECOND_TIME_WINDOW}
                        </CText>
                    </TouchableOpacity>
                )}
            </View>
        )
    }

    return (
        <View style={styles.containerView}>
            <View style={styles.contentView}>
                <CText style={styles.titleText}>{t.labels.PBNA_MOBILE_DELIVERY_TIME_WINDOW}</CText>
                <CText style={styles.hintText}>{t.labels.PBNA_MOBILE_EDIT_TIME_WINDOW_DESCRIPTION}</CText>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {Object.keys(deliveryTimeObj).map((day) => {
                        return renderDayTimeWindow(day, deliveryTimeObj[day])
                    })}
                </ScrollView>
            </View>

            <Modal
                animationType="fade"
                transparent
                visible={showTimeModal}
                onRequestClose={() => {
                    setShowTimeModal(!showTimeModal)
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.modalHeader}>
                            <CText>{currentTimeBox.modalTitle}</CText>
                            <TouchableOpacity hitSlop={commonStyle.smallHitSlop} onPress={onClickDoneTimeModal}>
                                <CText style={styles.modalDoneText}>{t.labels.PBNA_MOBILE_DONE}</CText>
                            </TouchableOpacity>
                        </View>
                        <TimePicker
                            hoursUnit={''}
                            minutesUnit={''}
                            zeroPadding
                            value={{
                                hours: currentTimeBox.defaultHour,
                                minutes: currentTimeBox.defaultMinute,
                                seconds: 0
                            }}
                            onChange={handleDurationChange}
                            minutesInterval={15}
                        />
                    </View>
                </View>
            </Modal>
            <View style={styles.bottomContainer}>
                <TouchableOpacity onPress={onClickCancel} style={[styles.bottomButton, styles.cancelButton]}>
                    <CText style={styles.cancelText}>{t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}</CText>
                </TouchableOpacity>
                {
                    <TouchableOpacity
                        disabled={!isSubmitActive}
                        onPress={onClickSubmit}
                        style={[
                            styles.bottomButton,
                            !isSubmitActive ? styles.submitButtonInActive : styles.submitButtonActive
                        ]}
                    >
                        <CText
                            style={[
                                styles.submitText,
                                !isSubmitActive ? styles.submitTextInActive : styles.submitTextActive
                            ]}
                        >
                            {t.labels.PBNA_MOBILE_SUBMIT.toUpperCase()}
                        </CText>
                    </TouchableOpacity>
                }
            </View>
            <Loading isLoading={isLoading} />
        </View>
    )
}

export default EditDeliveryTimeWindow

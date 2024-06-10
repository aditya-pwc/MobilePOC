/*
 * @Description:
 * @Author: Fangfang Ji
 * @Date: 2021-11-23 20:53:03
 * @LastEditTime: 2023-11-23 13:52:17
 */

import React, { useEffect, useState } from 'react'
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Image, Modal, ScrollView } from 'react-native'
import CText from '../../../../common/components/CText'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import moment from 'moment'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { CheckBox } from 'react-native-elements'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import DateTimePicker from '@react-native-community/datetimepicker'
import { CommonLabel } from '../../../enums/CommonLabel'
import { t } from '../../../../common/i18n/t'
import PickerModal from '../../manager/common/PickerModal'
import { getOrderDispatchActionArr } from '../deliveries/DeliveriesHelper'
import { NUMBER_VALUE } from '../../../enums/MerchandiserEnums'
import { DEFAULT_DELAY_TIME, getDefaultStartTime, getTimeList } from '../../../utils/MerchManagerUtils'
import { Comments, EditList, Header } from './DispatchCompoents'
import _ from 'lodash'
import { isSameDayWithTimeZone, setDefaultTimezone } from '../../../utils/TimeZoneUtils'
import { restApexCommonCall, syncDownObj } from '../../../api/SyncUtils'
import ReassignResultModal from '../../manager/common/ReassignResultModal'
import Loading from '../../../../common/components/Loading'
import { Log } from '../../../../common/enums/Log'
import { DispatchActionTypeEnum, DropDownType, PalletType } from '../../../enums/Manager'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import 'moment-timezone'
import { CommonParam } from '../../../../common/CommonParam'
import { DatePickerLocale } from '../../../enums/i18n'
import { getStringValue } from '../../../utils/LandingUtils'
import { getTimeAfterElevenThirty } from '../../manager/schedule/AddAMeeting'
import { meetingClickFunction } from '../../../helper/manager/AllManagerMyDayHelper'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { MOMENT_UNIT } from '../../../../common/enums/MomentUnit'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const START_TIME_MODAL = 0
const END_TIME_MODAL = 1
let SUC_MSG = ''

const styles = StyleSheet.create({
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    imgCalendar: {
        width: 20,
        height: 18,
        marginLeft: 5
    },
    grayText: {
        fontFamily: 'Gotham',
        fontSize: 14,
        color: '#565656'
    },
    dateText: {
        fontFamily: 'Gotham',
        fontSize: 14,
        fontWeight: '400',
        color: '#000'
    },
    checkCircle: {
        width: 20,
        height: 20,
        marginRight: 10
    },
    centeredView: {
        ...commonStyle.flexCenter,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    calendarModalView: {
        borderRadius: 8,
        margin: 20,
        backgroundColor: 'white',
        shadowColor: baseStyle.color.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 350,
        width: '90%'
    },
    datePicker: {
        margin: 20
    },
    con: { flex: 1, backgroundColor: '#fff' },

    title: {
        fontFamily: 'Gotham',
        fontSize: 18,
        fontWeight: '900',
        marginTop: 40,
        marginBottom: 30
    },
    dateCon: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        height: 50,
        marginTop: 30
    },
    deliveryTypeTitle: {
        marginTop: 30,
        marginBottom: 10,
        color: '#565656',
        fontSize: 12
    },
    deliveryTypeCon: {
        marginLeft: 0
    },
    cContainerStyle: { backgroundColor: '#fff', borderWidth: 0, padding: 0, marginLeft: 0 },
    checkText: { fontFamily: 'Gotham', fontSize: 14, fontWeight: '400', color: '#000', marginLeft: 0 },
    durationStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 30
    },
    contentContainer: {
        borderBottomColor: baseStyle.color.borderGray,
        borderBottomWidth: 1,
        marginBottom: 30,
        flex: 1
    },
    MR_10: {
        marginRight: 10
    },
    titleLabel: {
        fontSize: baseStyle.fontSize.fs_12,
        height: 14,
        marginBottom: 11,
        color: baseStyle.color.titleGray
    },
    contentLabel: {
        marginBottom: 8,
        fontSize: baseStyle.fontSize.fs_14,
        color: baseStyle.color.black
    },
    oneLineLabel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    selectText: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black
    },
    imgClock: {
        width: 18,
        height: 18
    },
    MH_10: {
        marginHorizontal: 10
    },
    ML_10: {
        marginLeft: 10
    },
    actionTypeText: {
        color: '#565656',
        fontSize: 12
    },
    actionTypeCon: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 36,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    actionText: {
        color: '#000',
        fontSize: 14
    },
    flex: { flex: 1 },
    triangle: { width: 10, height: 5 },
    dispatchActionContainer: {
        flex: 1,
        marginHorizontal: 22
    }
})
interface DispatchActionInterface {
    navigation?: any
    route?: any
}

const CHECK_CIRCLE = <Image style={styles.checkCircle} source={ImageSrc.IMG_CHECK_CIRCLE} />
const UNCHECK_CIRCLE = <Image style={styles.checkCircle} source={ImageSrc.IMG_UNCHECK_CIRCLE} />
const DispatchAction = (props: DispatchActionInterface) => {
    const timeFormat = CommonParam.userTimeZone ? ` (${moment().tz(CommonParam.userTimeZone).zoneName()})` : ''
    moment.tz.setDefault(CommonParam.userTimeZone)
    const { dropDownRef } = useDropDown()
    const { navigation, route } = props
    const { dispatchParams, date } = route.params
    const [selectOrderMap, setSelectOrderMap] = useState(route.params.selectOrderMap)
    const dispatchActions = Object.values(selectOrderMap as Object)?.[0]?.DispatchActions
    const weekOfDay = parseInt(moment().format('d'))
    const minDate = moment().add(1, 'days').toDate()
    const maxDate = moment()
        .add(7 + 7 * 4 - weekOfDay - 1, 'days')
        .toDate()

    const [deliveryDate, setDeliveryDate] = useState(
        dispatchParams?.deliveryDate ? moment(dispatchParams?.deliveryDate).toDate() : minDate
    )
    const [nextDeliveryDate, setNextDeliveryDate] = useState(null)
    const [showDatePicker, setShowDatePicker] = useState(false)

    const [comments, setComments] = useState(dispatchParams?.comments)
    const [activePalletType, setActivePalletType] = useState(
        dispatchParams?.activePalletType || PalletType.LARGE_PALLET
    )
    const { actions } = getOrderDispatchActionArr(date || moment())
    const [currentAction, setCurrentAction] = useState(
        actions.filter((item) => item.toUpperCase() === route.params.action)[0]
    )
    const [actionModal, setActionModal] = useState(false)
    const [startModalVisible, setStartModalVisible] = useState(false)
    const [endModalVisible, setEndModalVisible] = useState(false)
    const [resultVisible, setResultVisible] = useState(false)

    const disableSave = (date = deliveryDate) => {
        const orderNum = _.size(selectOrderMap)
        let disabled = orderNum > 0
        if (currentAction === t.labels.PBNA_MOBILE_RESCHEDULE) {
            disabled = disabled && !isSameDayWithTimeZone(route.params.date, date, true)
        }
        return !disabled
    }
    const [applyDisable, setApplyDisable] = useState(disableSave())
    const [isLoading, setIsLoading] = useState(false)
    const [palletTypeListData] = useState([
        {
            Id: PalletType.LARGE_PALLET,
            palletType: t.labels.PBNA_MOBILE_LARGE_PALLET
        },
        {
            Id: PalletType.HALF_PALLET,
            palletType: t.labels.PBNA_MOBILE_HALF_PALLET
        }
    ])

    const updateApplyStatus = (date = deliveryDate) => {
        setApplyDisable(disableSave(date))
    }
    let defaultStartTime = getDefaultStartTime().format(TIME_FORMAT.HMMA)
    const planDate = moment().toDate()

    if (getTimeAfterElevenThirty(defaultStartTime, planDate)) {
        defaultStartTime = CommonLabel.MIDNIGHT
    }
    const getDefaultEndTime = (sTime) => {
        if (sTime === CommonLabel.ELEVEN_THIRTY) {
            return moment(sTime, TIME_FORMAT.HMMA)
                .tz(CommonParam.userTimeZone)
                .add(CommonLabel.FIFTEEN_MINUTE, MOMENT_UNIT.MINUTES)
        }
        return moment(sTime, TIME_FORMAT.HMMA)
            .tz(CommonParam.userTimeZone)
            .add(CommonLabel.THIRTY_MINUTE, MOMENT_UNIT.MINUTES)
    }
    const [startTime, setStartTime] = useState(
        moment(dispatchActions?.[0]?.Dock_Start_Time__c).format(TIME_FORMAT.HMMA) || defaultStartTime
    )
    const defaultEndTime = getDefaultEndTime(startTime).format(TIME_FORMAT.HMMA)
    const [endTime, setEndTime] = useState(
        moment(dispatchActions?.[0]?.Dock_End_Time__c).format(TIME_FORMAT.HMMA) || defaultEndTime
    )

    const { onOutsideClick, onDoneClick } = meetingClickFunction({
        setStartTime,
        setStartModalVisible,
        setEndTime,
        setEndModalVisible,
        defaultStartTime,
        defaultEndTime,
        startTime
    })
    const getDoneDisabled = (isEndTime?: any, selectedTimeValue?: any) => {
        const timeList = Array.from(
            {
                length: 96
            },
            (_index, hour) =>
                moment({
                    hour: Math.floor(hour / NUMBER_VALUE.FOUR_NUM),
                    minutes: (hour % NUMBER_VALUE.FOUR_NUM) * CommonLabel.FIFTEEN_MINUTE
                }).format(TIME_FORMAT.HMMA)
        )
        if (isEndTime) {
            return timeList.indexOf(selectedTimeValue) < timeList.indexOf(startTime) + CommonLabel.NUMBER_ONE
        }
        return false
    }
    const goBack = () => {
        navigation.goBack()
    }
    const cancelAction = () => {
        route.params.cancel && route.params.cancel()
        goBack()
    }
    const getFullTime = (timeStr) => {
        const curDate = route.params.date
        return moment(moment(curDate).format(TIME_FORMAT.MMDDY) + timeStr, TIME_FORMAT.MMDDY + TIME_FORMAT.HMMA)
            .utc()
            .toISOString()
    }
    const applyAction = async () => {
        SUC_MSG = ''
        const params = []
        try {
            setIsLoading(true)
            const orderIdList = Object.keys(selectOrderMap)
            const orderCount = orderIdList.length
            if (orderCount === 1) {
                SUC_MSG = `${
                    Object.values(selectOrderMap)[0]?.RetailStoreName
                } ${t.labels.PBNA_MOBILE_ORDER_SUCCESSFULLY_SUBMITTED_TO.toLocaleLowerCase()} `
            } else {
                SUC_MSG = `${orderCount} ${t.labels.PBNA_MOBILE_ORDER_SUCCESSFULLY_SUBMITTED_FOR} `
            }
            const paramsItem = {
                additionalComments: comments,
                dispatchAction: null,
                dockEndTime: null,
                dockStartTime: null,
                newDeliveryDate: null,
                orderID: null,
                palletType: null
            }
            if (currentAction === t.labels.PBNA_MOBILE_DELETE) {
                orderIdList.forEach((Id) => {
                    const temp = _.cloneDeep(paramsItem)
                    temp.orderID = Id
                    temp.dispatchAction = DispatchActionTypeEnum.DELETE
                    params.push(temp)
                })
            } else if (currentAction === t.labels.PBNA_MOBILE_RESCHEDULE) {
                orderIdList.forEach((Id) => {
                    const temp = _.cloneDeep(paramsItem)
                    temp.orderID = Id
                    temp.newDeliveryDate = moment(deliveryDate).format(TIME_FORMAT.Y_MM_DD)
                    temp.dispatchAction = DispatchActionTypeEnum.RESCHEDULE
                    params.push(temp)
                })
            } else if (currentAction === t.labels.PBNA_MOBILE_GEO_PALLET_OVERRIDE) {
                orderIdList.forEach((Id) => {
                    const temp = _.cloneDeep(paramsItem)
                    temp.orderID = Id
                    temp.dispatchAction = DispatchActionTypeEnum.GEO_PALLET_OVERRIDE
                    temp.palletType = activePalletType
                    params.push(temp)
                })
            } else {
                orderIdList.forEach((Id) => {
                    const temp = _.cloneDeep(paramsItem)
                    temp.orderID = Id
                    temp.dispatchAction = DispatchActionTypeEnum.ORDER_SPECIFIC_TIME_WINDOW
                    temp.dockStartTime = getFullTime(startTime)
                    temp.dockEndTime = getFullTime(endTime)
                    params.push(temp)
                })
            }
            const res = await restApexCommonCall('doDispatchAction', 'POST', params)
            if (res?.data === 'Success') {
                SUC_MSG += currentAction.toLowerCase()
                setIsLoading(false)
                setResultVisible(true)
            } else {
                setIsLoading(false)
            }
            setTimeout(() => {
                cancelAction()
            }, DEFAULT_DELAY_TIME)
        } catch (error) {
            setIsLoading(false)
            storeClassLog(Log.MOBILE_ERROR, 'DispatchAction.applyAction', getStringValue(error))
            dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_FAILED_DISPATCH_ACTION, error)
        }
    }

    const changeDate = (_event, selectedDate) => {
        setDeliveryDate(selectedDate)
        setShowDatePicker(false)
        updateApplyStatus(selectedDate)
    }
    const getNextDeliveryDay = async () => {
        if (Object.values(selectOrderMap).length !== 1 && currentAction === t.labels.PBNA_MOBILE_RESCHEDULE) {
            return
        }
        try {
            const enWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            const orderMap = route.params.selectOrderMap
            const accountId = Object.values(orderMap)[0]?.AccountId
            if (_.isEmpty(accountId)) {
                return
            }
            const res = await syncDownObj(
                'Account',
                `SELECT Id, Merchandising_Delivery_Days__c FROM Account
        WHERE Id = '${accountId}'`,
                false
            )
            const account = res?.data || []
            if (_.isEmpty(account)) {
                return
            }
            const mDeliveryDayStr = account[0]?.Merchandising_Delivery_Days__c
            let daysArr = mDeliveryDayStr ? mDeliveryDayStr.split(';') : []

            if (_.isEmpty(daysArr)) {
                return
            }
            daysArr = daysArr.filter((item) => !_.isEmpty(item))
            daysArr = daysArr.map((item) => {
                return item.replace(/(^\s*)|(\s*$)/g, '')
            })
            const today = moment()
            const theDay = moment(date).isBefore(today) ? today : date
            const weekOfTheDay = parseInt(moment(theDay).format('d')) - 1
            let nextDay = enWeekdays.findIndex((day) => day === daysArr[0])
            for (const item of daysArr) {
                const dayIndex = enWeekdays.findIndex((day) => day === item)
                if (dayIndex > weekOfTheDay) {
                    nextDay = dayIndex
                    break
                }
            }
            const dayAdd = nextDay - weekOfTheDay > 0 ? nextDay - weekOfTheDay : 7 - weekOfTheDay + nextDay
            setNextDeliveryDate(moment(theDay).add(dayAdd, 'days'))
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'DispatchAction.getNextDeliveryDay', ErrorUtils.error2String(error))
        }
    }
    useEffect(() => {
        updateApplyStatus()
        getNextDeliveryDay()
    }, [currentAction, selectOrderMap])
    useEffect(() => {
        return setDefaultTimezone
    }, [])
    const renderPalletType = () => {
        return (
            <>
                <CText style={styles.deliveryTypeTitle}>{t.labels.PBNA_MOBILE_PALLET_TYPE}</CText>
                <View style={styles.deliveryTypeCon}>
                    {palletTypeListData.map((item) => {
                        return (
                            <CheckBox
                                key={item.Id}
                                containerStyle={styles.cContainerStyle}
                                textStyle={styles.checkText}
                                fontFamily={'Gotham'}
                                title={item.palletType}
                                checkedIcon={CHECK_CIRCLE}
                                uncheckedIcon={UNCHECK_CIRCLE}
                                checked={activePalletType === item.Id}
                                onPress={() => setActivePalletType(item.Id)}
                            />
                        )
                    })}
                </View>
            </>
        )
    }
    const renderActionType = () => {
        return (
            <TouchableOpacity
                onPress={() => {
                    setActionModal(true)
                }}
            >
                <CText style={styles.actionTypeText}>{t.labels.PBNA_MOBILE_DISPATCH_ACTIONS}</CText>
                <View style={styles.actionTypeCon}>
                    <CText style={styles.actionText}>{currentAction}</CText>
                    <View style={styles.flex} />
                    <Image source={ImageSrc.IMG_TRIANGLE} style={styles.triangle} />
                </View>
            </TouchableOpacity>
        )
    }
    const renderStartEndTime = () => {
        return (
            <View style={styles.durationStyle}>
                <View style={[styles.contentContainer, styles.MR_10]}>
                    <CText style={styles.titleLabel}>{t.labels.PBNA_MOBILE_DOCK_START_TIME}</CText>
                    <TouchableOpacity
                        activeOpacity={0.2}
                        onPress={() => {
                            setStartModalVisible(true)
                        }}
                    >
                        <View style={[styles.contentLabel, styles.oneLineLabel]}>
                            <CText style={styles.selectText}>
                                {startTime}
                                {timeFormat}
                            </CText>
                            <Image source={ImageSrc.IMG_CLOCK_BLUE} style={[styles.imgClock, styles.MH_10]} />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={[styles.contentContainer, styles.ML_10]}>
                    <CText style={styles.titleLabel}>{t.labels.PBNA_MOBILE_DOCK_END_TIME}</CText>
                    <TouchableOpacity
                        activeOpacity={0.2}
                        onPress={() => {
                            setEndModalVisible(true)
                        }}
                    >
                        <View style={[styles.contentLabel, styles.oneLineLabel]}>
                            <CText style={styles.selectText}>
                                {endTime}
                                {timeFormat}
                            </CText>
                            <Image source={ImageSrc.IMG_CLOCK_BLUE} style={[styles.imgClock, styles.MH_10]} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    const renderDate = () => {
        return (
            <View>
                <View style={styles.dateCon}>
                    <CText style={styles.grayText}>
                        {t.labels.PBNA_MOBILE_IP_NEW} {t.labels.PBNA_MOBILE_DELIVERY_DATE}
                    </CText>
                    <TouchableOpacity
                        style={styles.dateContainer}
                        onPress={() => {
                            updateApplyStatus()
                            setShowDatePicker(true)
                        }}
                    >
                        <CText style={styles.dateText}>{moment(deliveryDate).format('MMM DD, YYYY')}</CText>
                        <Image style={styles.imgCalendar} source={ImageSrc.IMG_CALENDAR} />
                    </TouchableOpacity>
                </View>
                {_.size(selectOrderMap) === 1 && nextDeliveryDate && (
                    <CText style={[styles.grayText, { marginTop: 10 }]}>
                        {t.labels.PBNA_MOBILE_NEXT_PLANNED_DELIVERY_DATE}
                        <CText style={styles.dateText}>
                            {' '}
                            {moment(nextDeliveryDate).format(TIME_FORMAT.D + TIME_FORMAT.DDD_MMM_D_YYYY)}
                        </CText>
                    </CText>
                )}
            </View>
        )
    }
    const renderOrderList = () => {
        return (
            <EditList
                title={t.labels.PBNA_MOBILE_ORDERS_SELECTED}
                addMoreText={t.labels.PBNA_MOBILE_ADD_MORE_ORDERS.toUpperCase()}
                list={Object.values(selectOrderMap)}
                clearOrderPress={(item) => {
                    delete selectOrderMap[item.Id]
                    setSelectOrderMap({ ...selectOrderMap })
                    updateApplyStatus()
                }}
                addMoreAction={() => {
                    const params = {
                        comments,
                        currentAction,
                        startTime,
                        endTime,
                        deliveryDate,
                        activePalletType
                    }
                    route.params.refresh && route.params.refresh(selectOrderMap, params)
                    goBack()
                }}
            />
        )
    }
    return (
        <SafeAreaView style={styles.con}>
            <ScrollView style={styles.dispatchActionContainer}>
                <Header title={t.labels.PBNA_MOBILE_DISPATCH_ACTIONS} onPress={cancelAction} />
                {renderActionType()}
                {currentAction === t.labels.PBNA_MOBILE_GEO_PALLET_OVERRIDE && renderPalletType()}
                {currentAction === t.labels.PBNA_MOBILE_ORDER_SPECIFIC_TIME_WINDOW && renderStartEndTime()}
                {currentAction === t.labels.PBNA_MOBILE_RESCHEDULE && renderDate()}
                <Comments
                    title={t.labels.PBNA_MOBILE_ADDITIONAL_COMMENTS_OPTIONAL}
                    value={comments}
                    onChangeText={(val) => setComments(val)}
                />
                {renderOrderList()}
            </ScrollView>
            <FormBottomButton
                disableSave={applyDisable}
                leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL}
                rightButtonLabel={t.labels.PBNA_MOBILE_APPLY}
                onPressCancel={cancelAction}
                onPressSave={applyAction}
            />
            <Modal animationType="fade" transparent visible={showDatePicker}>
                <TouchableOpacity style={styles.centeredView} onPress={() => setShowDatePicker(false)}>
                    <View style={styles.calendarModalView}>
                        <DateTimePicker
                            style={styles.datePicker}
                            themeVariant={CommonLabel.LIGHT}
                            testID={'dateTimePicker'}
                            textColor={'red'}
                            value={deliveryDate}
                            mode={'date'}
                            display={'inline'}
                            onChange={changeDate}
                            minimumDate={minDate}
                            maximumDate={maxDate}
                            timeZoneOffsetInMinutes={moment.tz(CommonParam.userTimeZone).utcOffset()}
                            locale={DatePickerLocale[CommonParam.locale]}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
            <PickerModal
                modalVisible={actionModal}
                onDoneClick={() => setActionModal(false)}
                optionsList={actions}
                modalTitle={t.labels.PBNA_MOBILE_DISPATCH_ACTIONS}
                selectedVal={currentAction}
                defaultVal={currentAction}
                DEFAULT_LABEL={''}
                updateSelectedVal={setCurrentAction}
            />
            <PickerModal
                modalVisible={startModalVisible}
                onOutsideClick={() => {
                    onOutsideClick(START_TIME_MODAL)
                }}
                onDoneClick={() => {
                    onDoneClick(START_TIME_MODAL)
                }}
                optionsList={getTimeList(NUMBER_VALUE.FOUR_NUM, true)}
                DEFAULT_LABEL={timeFormat}
                modalTitle={t.labels.PBNA_MOBILE_START_TIME}
                selectedVal={startTime}
                defaultVal={defaultStartTime}
                updateSelectedVal={setStartTime}
                isEndTimeModal={false}
                getDoneDisabled={getDoneDisabled}
            />
            <PickerModal
                modalVisible={endModalVisible}
                onOutsideClick={() => {
                    onOutsideClick(END_TIME_MODAL)
                }}
                onDoneClick={() => {
                    onDoneClick(END_TIME_MODAL)
                }}
                optionsList={getTimeList(NUMBER_VALUE.FOUR_NUM)}
                DEFAULT_LABEL={timeFormat}
                modalTitle={t.labels.PBNA_MOBILE_END_TIME}
                selectedVal={endTime}
                defaultVal={defaultEndTime}
                updateSelectedVal={setEndTime}
                isEndTimeModal
                getDoneDisabled={getDoneDisabled}
            />
            <ReassignResultModal
                isLocationSwitchSuc
                switchSucMsg={SUC_MSG}
                modalVisible={resultVisible}
                setModalVisible={setResultVisible}
            />
            <Loading isLoading={isLoading} />
        </SafeAreaView>
    )
}

export default DispatchAction

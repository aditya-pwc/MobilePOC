/*
 * @Author: fangfang ji
 * @Date: 2021-09-16
 */
import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, FlatList, NativeAppEventEmitter, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import CText from '../../../../common/components/CText'
import MonthWeek from '../../common/MonthWeek'
import { useSelector } from 'react-redux'
import SwipeableRow from '../../common/SwipeableRow'
import { MeetingItem, MeetingSumDataView } from './MeetingItem'
import { deleteMeetingAlert, duplicateMeeting, getRNSMeetings, meetingOnClick } from '../service/MeetingService'
import { closeOtherRows, closeAllOpenRow, syncDownDataByTableNames } from '../../../utils/MerchManagerUtils'
import Loading from '../../../../common/components/Loading'
import ReassignResultModal from '../common/ReassignResultModal'
import { handleDeleteMeeting, navigateToAddMeeting } from '../helper/MerchManagerHelper'
import { Log } from '../../../../common/enums/Log'
import NavigationBar from '../../common/NavigationBar'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { checkMeetingDataCheck, checkSVGDataModifiedById } from '../service/DataCheckService'
import {
    DataCheckMsgIndex,
    DropDownType,
    EventEmitterType,
    NavigationPopNum,
    NavigationRoute
} from '../../../enums/Manager'
import ErrorMsgModal from '../common/ErrorMsgModal'
import moment from 'moment'
import { CommonLabel } from '../../../enums/CommonLabel'
import { t } from '../../../../common/i18n/t'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import _ from 'lodash'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'

const IMG_BACK = ImageSrc.IMG_BACK
const ICON_ADD = ImageSrc.ADD_BLUE_CIRCLE

const managerReducer = (state) => state.manager
interface ReviewNewMeetingProps {
    navigation: any
    route: any
}
const styles = StyleSheet.create({
    con: { flex: 1, backgroundColor: '#fff' },
    mTitle: {
        marginVertical: 34,
        marginHorizontal: 22
    },
    boldText: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    title: {
        height: 40,
        justifyContent: 'center',
        marginTop: 31
    },
    listStyle: { backgroundColor: '#F2F4F7', flex: 1 },
    titleText: { fontSize: 12, height: 40, lineHeight: 40 },
    topIconStyle: {
        bottom: 10
    },
    imgAdd: {
        width: 36,
        height: 36
    },
    imgChevron: {
        width: 12,
        height: 22
    },
    topStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 22
    }
})
let meetings = {}
let selDay = ''
const ReviewNewMeeting = ({ navigation }: ReviewNewMeetingProps) => {
    const refMonthWeek: any = useRef()
    const { dropDownRef } = useDropDown()
    const manager = useSelector(managerReducer)
    const [weekDays, setWeekDays] = useState({})
    const [mList, setMList] = useState([])
    const [sumData, setSumData] = useState({})
    const [swipeableRows, setSwipeableRows] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [meetingDeletedModalVisible, setMeetingDeletedModalVisible] = useState(false)
    const [isErrorShow, setIsErrorShow] = useState(false)
    const [errorMsgType, setErrorMsgType] = useState(DataCheckMsgIndex.COMMON_MSG)
    const getData = async () => {
        try {
            let selIndex = 0
            if (selDay) {
                const mmWeeks = Object.keys(meetings)
                selIndex = mmWeeks.findIndex((item) => item === selDay)
            }
            const { headData, weekObj } = await getRNSMeetings(manager.scheduleDate)
            meetings = weekObj
            const mWeeks = Object.keys(meetings)
            selDay = mWeeks[selIndex] || mWeeks[0]
            if (!mWeeks.length) {
                navigation.goBack()
                setIsLoading(false)
                return
            }
            const tempWeekDay = {}
            mWeeks.forEach((daykey) => {
                tempWeekDay[daykey] = false
            })
            setWeekDays(tempWeekDay)
            const meetingList = meetings[selDay] || []
            refMonthWeek.current?.setSelectIndex(tempWeekDay, selDay)
            setMList(meetingList)
            setSumData(headData)
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            storeClassLog(Log.MOBILE_ERROR, 'RNM.getData', getStringValue(error))
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_REVIEW_NEW_MEETING_FAILED_TO_QUERY,
                error
            )
        }
    }
    const refreshGetData = async (isDelete?) => {
        if (errorMsgType === DataCheckMsgIndex.COMMON_MSG) {
            setIsLoading(true)
            await syncDownDataByTableNames()
            await getData()
            isDelete && setMeetingDeletedModalVisible(true)
        }
        if (
            errorMsgType === DataCheckMsgIndex.SVG_PUBLISHED_MSG ||
            errorMsgType === DataCheckMsgIndex.SVG_CANCELLED_MSG
        ) {
            navigation.pop(NavigationPopNum.POP_TWO)
        }
    }
    const weekDayClick = async (value) => {
        const modified = await checkSVGDataModifiedById(manager.visitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            setIsLoading(false)
            return
        }
        selDay = value.weekLabel
        closeAllOpenRow(swipeableRows)
        refreshGetData()
    }

    const onRemoveMeetingClick = (item: any) => {
        deleteMeetingAlert(
            async () => {
                setIsLoading(true)
                const modified = await checkSVGDataModifiedById(manager.visitListId, setErrorMsgType, setIsErrorShow)
                if (modified) {
                    setIsLoading(false)
                    return
                }
                const eventIds = [item.Id, ...item.chMeetingIdArr]
                const plannedDateStr = moment(item.StartDateTime).format(TIME_FORMAT.Y_MM_DD)
                const vlDataCheck = await checkMeetingDataCheck(
                    eventIds,
                    item.childOwnerIdArr,
                    plannedDateStr,
                    null,
                    setIsLoading
                )
                if (!vlDataCheck) {
                    setIsLoading(false)
                    setErrorMsgType(DataCheckMsgIndex.COMMON_MSG)
                    setIsErrorShow(true)
                    return
                }
                await handleDeleteMeeting({
                    setIsLoading: null,
                    EventIds: eventIds,
                    SoupEntryIds: [item.SoupEntryId, ...item.chSoupEntryIdArr],
                    setMeetingDeletedModalVisible: null,
                    dropDownRef,
                    scheduleVisitListId: manager.visitListId,
                    isFromRNM: true
                })
            },
            () => closeAllOpenRow(swipeableRows)
        )
    }
    const duplicateBtnClick = (item) => {
        duplicateMeeting({
            navigation,
            item,
            meetingList: mList,
            closeOtherRows,
            isRNSMeeting: true,
            dateOptions: manager.scheduleDate,
            setIsLoading,
            dropDownRef
        })
    }
    useEffect(() => {
        selDay = ''
        getData()
    }, [])
    useEffect(() => {
        const refreshEvent = NativeAppEventEmitter.addListener(EventEmitterType.REFRESH_RNM, (params) => {
            refreshGetData(params?.isDelete)
        })
        return () => {
            refreshEvent && refreshEvent.remove()
        }
    }, [])

    const meetingItemClick = async (item) => {
        setSwipeableRows({ ...swipeableRows })
        const modified = await checkSVGDataModifiedById(manager.visitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            setIsLoading(false)
            return
        }
        meetingOnClick({
            setIsLoading,
            routerParams: { Id: item.Id, isReadOnly: true, isRNSMeeting: true, dateOptions: manager.scheduleDate },
            navigation,
            dropDownRef
        })
    }
    const checkIfDeleteDisabled = (val) => {
        return moment(val.StartDateTime).isBefore(new Date()) || !_.isEmpty(val.ChildActualStartTime)
    }

    const renderMeetingItem = ({ item }) => {
        const disabled = checkIfDeleteDisabled(item)
        const swipeButtonProps = [
            {
                label: t.labels.PBNA_MOBILE_DUPLICATE,
                color: baseStyle.color.loadingGreen,
                width: CommonLabel.SWIPE_BTN_WIDTH,
                onBtnClick: duplicateBtnClick
            },
            {
                label: t.labels.PBNA_MOBILE_DELETE.toUpperCase(),
                color: disabled ? baseStyle.color.titleGray : baseStyle.color.red,
                width: CommonLabel.SWIPE_BTN_WIDTH,
                onBtnClick: onRemoveMeetingClick,
                disabled: disabled
            }
        ]
        return (
            <SwipeableRow
                uniqKey={item.Id}
                swipeableRows={swipeableRows}
                closeOtherRows={closeOtherRows}
                showBorderRadius={false}
                params={item}
                swipeButtonConfig={swipeButtonProps}
            >
                <MeetingItem item={item} onPress={meetingItemClick} />
            </SwipeableRow>
        )
    }
    return (
        <SafeAreaView style={styles.con}>
            <NavigationBar
                style={styles.topStyle}
                title={t.labels.PBNA_MOBILE_NEW_SCHEDULE}
                left={
                    <TouchableOpacity
                        style={styles.topIconStyle}
                        onPress={async () => {
                            const modified = await checkSVGDataModifiedById(
                                manager.visitListId,
                                setErrorMsgType,
                                setIsErrorShow
                            )
                            if (modified) {
                                setIsLoading(false)
                                return
                            }
                            navigation?.navigate(NavigationRoute.REVIEW_NEW_SCHEDULE)
                        }}
                        hitSlop={commonStyle.hitSlop}
                    >
                        <Image style={styles.imgChevron} source={IMG_BACK} />
                    </TouchableOpacity>
                }
                right={
                    <TouchableOpacity
                        style={styles.topIconStyle}
                        onPress={async () => {
                            const modified = await checkSVGDataModifiedById(
                                manager.visitListId,
                                setErrorMsgType,
                                setIsErrorShow
                            )
                            if (modified) {
                                setIsLoading(false)
                                return
                            }
                            navigateToAddMeeting({
                                routerParams: {
                                    isReadOnly: false,
                                    isRNSMeeting: true,
                                    dateOptions: manager.scheduleDate
                                },
                                setIsLoading,
                                navigation,
                                dropDownRef
                            })
                        }}
                    >
                        <Image style={styles.imgAdd} source={ICON_ADD} />
                    </TouchableOpacity>
                }
            />
            <CText style={[styles.mTitle, styles.boldText]}>{t.labels.PBNA_MOBILE_ALL_MEETINGS}</CText>
            <View style={commonStyle.paddingHorizontal_22}>
                <MeetingSumDataView data={sumData} />
                <MonthWeek
                    cRef={refMonthWeek}
                    weekDays={weekDays}
                    onclick={weekDayClick}
                    // addVisitDate={addVisitDate}
                />
                <View style={styles.title}>
                    <CText style={styles.titleText}>
                        {mList.length} {t.labels.PBNA_MOBILE_MEETINGS}
                    </CText>
                </View>
            </View>
            <FlatList
                style={styles.listStyle}
                data={mList}
                extraData={mList}
                renderItem={renderMeetingItem}
                keyExtractor={(item, index) => item.Id + index}
            />
            <ReassignResultModal
                navigation={navigation}
                isMeetingDeletedSuccess
                modalVisible={meetingDeletedModalVisible}
                setModalVisible={setMeetingDeletedModalVisible}
            />
            <Loading isLoading={isLoading} />
            <ErrorMsgModal
                index={errorMsgType}
                visible={isErrorShow}
                setModalVisible={setIsErrorShow}
                handleClick={refreshGetData}
            />
        </SafeAreaView>
    )
}

export default ReviewNewMeeting

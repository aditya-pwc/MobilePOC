/**
 * @description Published Schedule and RNS visit details.
 * @author Hao xiao
 * @email hao.xiao@pwc.com
 * @date 2021-07-09
 */

import React, { useEffect, useMemo, useState } from 'react'
import {
    Alert,
    Image,
    Modal,
    NativeAppEventEmitter,
    SafeAreaView,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { VisitDetailsStyle } from '../../../styles/manager/VisitCardDetailStyle'
import EmployeeDetailStyle from '../../../styles/manager/EmployeeDetailStyle'
import {
    calculateDistanceAndTravelTime,
    DEFAULT_DELAY_TIME,
    E_CARD_HEIGHT,
    getRecordTypeIdByDeveloperName,
    getScheduleTotalSundays,
    getTimeFromMins,
    getWeekArrByDate,
    queryAndSyncScheduleVisitList,
    queryCustomerList,
    queryVisitList,
    queryScheduleVisit,
    reSequenceByVisitListId,
    initVisitList,
    syncUpVisitListUpdateFields
} from '../../../utils/MerchManagerUtils'
import CText from '../../../../common/components/CText'
import CSwitch from '../../../../common/components/c-switch/CSwitch'
import BlueClear from '../../../../../assets/image/ios-close-circle-outline-blue.svg'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import SwipDeliveryCard from '../../merchandiser/SwipDeliveryCard'
import EmployeeItem from '../common/EmployeeItem'
import { SoupService } from '../../../service/SoupService'
import { filterExistFields, getAllFieldsByObjName, getObjByName } from '../../../utils/SyncUtils'
import {
    syncDownObj,
    syncUpObjCreate,
    syncUpObjCreateFromMem,
    syncUpObjUpdate,
    syncUpObjUpdateFromMem
} from '../../../api/SyncUtils'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import CustomerItem from '../common/CustomerItem'
import moment from 'moment'
import DateTimePicker from '@react-native-community/datetimepicker'
import { TimePicker } from 'react-native-simple-time-picker'
import Loading from '../../../../common/components/Loading'
import SubTypeModal from '../common/SubTypeModal'
import RecurringVisitDetailStyle from '../../../styles/manager/RecurringVisitDetailStyle'
import { LocationService } from '../../../service/LocationService'
import { useDispatch, useSelector } from 'react-redux'
import { CommonParam } from '../../../../common/CommonParam'
import ScheduleQuery from '../../../queries/ScheduleQuery'
import _, { isObject, max } from 'lodash'
import { compose } from '@reduxjs/toolkit'
import managerAction from '../../../redux/action/H01_Manager/managerAction'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {
    DataCheckMsgIndex,
    NavigationPopNum,
    BooleanStr,
    EventEmitterType,
    NavigationRoute,
    DropDownType,
    VisitDurationIncrement
} from '../../../enums/Manager'
import {
    getCustomerETRData,
    renderUnassignCard,
    renderUnassignRouteCard,
    updateUnscheduledVisitListByDVLId,
    updateVisitListToUnscheduled
} from '../helper/MerchManagerHelper'
import { VisitOperationType, VisitStatus } from '../../../enums/Visit'
import VDWorkOrderAndTimeline from './VDWorkOrderAndTimeline'
import {
    checkSVGDataModifiedById,
    checkVisitListForReassignVisit,
    dataCheckWithAction
} from '../service/DataCheckService'
import ErrorMsgModal from '../common/ErrorMsgModal'
import { formatString } from '../../../utils/CommonUtils'
import { getWorkingStatus } from '../../../utils/MerchManagerComputeUtils'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { CommonLabel } from '../../../enums/CommonLabel'
import { t } from '../../../../common/i18n/t'
import { recalculatePullNumberWithCustomerIdAndVisitDate } from '../service/AddAVisitService'
import { isPersonaDelSupOrSDL, Persona } from '../../../../common/enums/Persona'
import ReassignResultModal from '../common/ReassignResultModal'
import {
    getVisitDetailsUnassignedRouteInfo,
    getVisitSubtypes,
    onCancelSubType,
    onRemoveSubType,
    getLocationPosition,
    updateVisitSubType
} from '../helper/VisitHelper'
import store from '../../../redux/store/Store'
import { goToCustomerDetail } from '../../merchandiser/VisitCard'
import { DatePickerLocale } from '../../../enums/i18n'
import { pushNotificationToMerch } from '../../../api/ApexApis'
import { Log } from '../../../../common/enums/Log'
import { VisitListStatus } from '../../../enums/VisitList'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../../../common/enums/MomentStartOf'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'

interface VisitDetailProps {
    navigation?: any
    route?: any
    isFromRNSView?: boolean
}

const SLICE_START = 0
const TEXT_LENGTH_MAX = 80
const IMG_TRIANGLE = ImageSrc.IMG_TRIANGLE
const styles = Object.assign(RecurringVisitDetailStyle, VisitDetailsStyle, EmployeeDetailStyle)
const FORMAT_DATE_STRING = TIME_FORMAT.Y_MM_DD
const managerReducer = (s) => s.manager

const getInitialSubType = (visitDetailData) => {
    return JSON.parse(JSON.stringify(getVisitSubtypes())).map((item) => {
        if (visitDetailData?.subtype?.includes(item.id)) {
            item.select = true
        }
        return item
    })
}

const handleETRData = (
    allDetailData,
    visitDetailData,
    setAllDetailData,
    dropDownRef,
    setIsLoading,
    isFromRep = false
) => {
    getCustomerETRData(visitDetailData?.retailStoreId, dropDownRef, isFromRep)
        .then((res) => {
            if (isObject(res)) {
                allDetailData.customerCardData = Object.values(res)[0]
                setAllDetailData(_.cloneDeep(allDetailData))
                setIsLoading(false)
            }
        })
        .catch(() => {
            setIsLoading(false)
        })
}

const getMinDate = (isFromRNSView, dateArr, isAdHoc) => {
    const currentDay = moment()
    const tomorrow = moment(moment().add(1, MOMENT_STARTOF.DAY).format(TIME_FORMAT.Y_MM_DD))
    const firstDay = moment(dateArr[0])
    if (isFromRNSView) {
        if (isAdHoc) {
            return firstDay.isBefore(tomorrow) ? tomorrow.toDate() : firstDay.toDate()
        }
        if (moment(dateArr[0]).format(TIME_FORMAT.Y_MM_DD) !== dateArr[0]) {
            return moment(dateArr[0] + CommonLabel.END_OF_DAY_TIME).isBefore(currentDay)
                ? currentDay.toDate()
                : moment(dateArr[0] + CommonLabel.END_OF_DAY_TIME).toDate()
        }
        return moment(dateArr[0]).isBefore(currentDay) ? currentDay.toDate() : moment(dateArr[0]).toDate()
    }
    return currentDay.clone().toDate()
}

const queryVisit = async (params) => {
    const {
        visitId,
        setIsLoading,
        setOriginDate,
        setNotEditable,
        notEditable,
        setPlannedDate,
        setIsEnabledTakeOrder,
        setInsDescription,
        setDurationHours,
        setDurationMinutes,
        setDurationTime,
        setDurationString,
        setSubTypeArray,
        setSelectedSubType,
        setVisitDetailData,
        setPullNum,
        dropDownRef,
        isFromRNSView,
        allDetailData,
        setAllDetailData,
        isFromRep,
        setMinDate,
        dateArr,
        manager
    } = params
    try {
        !isFromRep && setIsLoading(true)
        let visitDetailData: any = {}
        const res = await SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            ScheduleQuery.retrieveVisitDetailsData.f,
            formatString(ScheduleQuery.retrieveVisitDetailsData.q, [visitId])
        )
        if (res.length > 0) {
            let routeUserInfo
            if (!_.isEmpty(res[0].Route_Group__c)) {
                routeUserInfo = await getVisitDetailsUnassignedRouteInfo(
                    res[0].Route_Group__c,
                    res[0].Schedule_Visit_Group__c,
                    isFromRNSView
                )
                if (!_.isEmpty(routeUserInfo)) {
                    routeUserInfo[0].manager = manager
                }
            }
            const visit = res[0]
            visitDetailData = {
                id: visit.UserId,
                visitId: visit.Id,
                name: visit.UserName,
                firstName: visit.FirstName,
                lastName: visit.LastName,
                title: visit.Title,
                phone: visit.MobilePhone,
                ftFlag: visit.FT_EMPLYE_FLG_VAL__c && visit.FT_EMPLYE_FLG_VAL__c.toLocaleLowerCase(),
                startTime: visit.Start_Time__c,
                workingStatus: getWorkingStatus(visit),
                userStatsId: visit.UserStatsId,
                pullNum: visit.Pull_Number__c,
                takeOrder: visit.Take_Order_Flag__c,
                subtype: visit.Visit_Subtype__c,
                plannedDate: visit.Planned_Date__c,
                durationMinutes: visit.Planned_Duration_Minutes__c || 0,
                insDescription: visit.InstructionDescription,
                retailStoreId: visit.RetailStoreId,
                userMerchandisingBase: visit.Merchandising_Base__c === BooleanStr.STR_TRUE,
                visitListId: visit.Visit_List__c,
                routeGroup: visit.Route_Group__c,
                routeUserInfo: routeUserInfo || []
            }
            setMinDate(getMinDate(isFromRNSView, dateArr, visit.Manager_Ad_Hoc__c === BooleanStr.STR_TRUE))
            setOriginDate(moment(visitDetailData.plannedDate))
            if (isFromRep) {
                setNotEditable(true)
            } else {
                setNotEditable(
                    notEditable || moment(visitDetailData.plannedDate).isBefore(moment(), MOMENT_STARTOF.DAY)
                )
            }
            setPlannedDate(moment(visitDetailData.plannedDate).toDate())
            setIsEnabledTakeOrder(visitDetailData.takeOrder === '1')
            setInsDescription(visitDetailData?.insDescription)
            setDurationHours(Math.floor(parseFloat(visitDetailData.durationMinutes) / 60) || 0)
            setDurationMinutes(Math.floor(parseFloat(visitDetailData.durationMinutes) % 60) || 0)
            setDurationTime(parseFloat(visitDetailData.durationMinutes))
            setDurationString(getTimeFromMins(parseFloat(visitDetailData.durationMinutes)))
            const initialSubType = getInitialSubType(visitDetailData)
            setSubTypeArray(JSON.parse(JSON.stringify(initialSubType)))
            setSelectedSubType(JSON.parse(JSON.stringify(initialSubType)))
            setVisitDetailData(visitDetailData)
            setPullNum(visitDetailData.pullNum ? 'P' + parseInt(visitDetailData.pullNum) : '')
            handleETRData(allDetailData, visitDetailData, setAllDetailData, dropDownRef, setIsLoading, isFromRep)
        } else {
            setIsLoading(false)
        }
    } catch (err) {
        dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_VISIT_DETAILS_QUERY_VISIT, err)
        setIsLoading(false)
    }
}

const onLocationIconClick = (item, type, mapInfo) => {
    if (type === CommonLabel.CUSTOMER_ITEM_CLICK_LOCATION) {
        const originLocation = { latitude: mapInfo.region?.latitude, longitude: mapInfo.region?.longitude }
        const targetLocation = { latitude: item?.latitude, longitude: item?.longitude }
        if (!targetLocation.latitude || !targetLocation.longitude) {
            Alert.alert(t.labels.PBNA_MOBILE_VISIT_DETAILS_LOCATION)
        } else {
            LocationService.gotoLocation(originLocation, targetLocation)
        }
    }
}

const onPlannedDateChange = (
    selectedDate,
    setPlannedDate,
    plannedDate,
    setShowDatePicker,
    originDate,
    setIsVisitDayChanged
) => {
    setPlannedDate(selectedDate)
    if (moment(selectedDate).format('DD') !== moment(plannedDate).format('DD')) {
        setShowDatePicker(false)
    }
    if (!moment(selectedDate).isSame(moment(originDate))) {
        setIsVisitDayChanged(true)
    } else {
        setIsVisitDayChanged(false)
    }
}

const checkToShowBottomButtons = (
    originDate,
    plannedDate,
    visitDetailData,
    durationTime,
    isEnabledTakeOrder,
    selectedSubType,
    insDescription
) => {
    if (!originDate.isSame(plannedDate)) {
        return true
    }
    if (parseFloat(visitDetailData.durationMinutes) !== durationTime) {
        return true
    }
    if (isEnabledTakeOrder !== (visitDetailData.takeOrder === '1')) {
        return true
    }
    let subTypeChanged = false
    selectedSubType.forEach((item) => {
        if (
            (!item.select && visitDetailData.subtype?.includes(item.id)) ||
            (item.select && !visitDetailData.subtype?.includes(item.id))
        ) {
            subTypeChanged = true
        }
    })
    if (subTypeChanged) {
        return subTypeChanged
    }
    return insDescription !== visitDetailData.insDescription
}

const shouldDisableSaveBtn = (selectedSubType, durationTime) => {
    return selectedSubType.filter((item: any) => item.select).length === 0 || durationTime === 0
}

const handleDailyVisitList = async (params) => {
    const { originDailyVisitList, dropDownRef, setIsLoading } = params
    if (originDailyVisitList[0].Id === 'NeedCreate') {
        try {
            delete originDailyVisitList[0].Id
            await syncUpObjCreateFromMem('Visit_List__c', originDailyVisitList)
        } catch (err) {
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_VISIT_DETAILS_SYNC_CREATE_DVL,
                err
            )
            setIsLoading(false)
        }
    } else {
        try {
            await syncUpObjUpdateFromMem(
                'Visit_List__c',
                filterExistFields('Visit_List__c', originDailyVisitList, syncUpVisitListUpdateFields)
            )
        } catch (err) {
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_VISIT_DETAILS_SYNC_UPDATE_DVL,
                err
            )
            setIsLoading(false)
        }
    }
}

const updateVisitList = async (
    updatedVisit,
    plannedDate,
    dropDownRef,
    isFromRNSView,
    setIsLoading,
    visitDetailData,
    originDate
) => {
    try {
        const visitorId = updatedVisit.VisitorId || updatedVisit.Route_Group__c
        const customerId = updatedVisit.PlaceId
        let scheduleVisitId = updatedVisit.Schedule_Visit_Group__c
        const originVisitDate = moment(originDate).format(FORMAT_DATE_STRING)
        const visitDate = moment(plannedDate).format(FORMAT_DATE_STRING)
        const startDate = moment(visitDate).clone().day(0).format(FORMAT_DATE_STRING)
        const endDate = moment(visitDate).clone().day(6).format(FORMAT_DATE_STRING)
        const scheduleRecordTypeId = await getRecordTypeIdByDeveloperName('Schedule_Visit_Group', 'Visit_List__c')
        const weeklyRecordTypeId = await getRecordTypeIdByDeveloperName('Visit_List_Group', 'Visit_List__c')
        const dailyRecordTypeId = await getRecordTypeIdByDeveloperName('Daily_Visit_List', 'Visit_List__c')
        const originScheduleVisit: any = await queryScheduleVisit(
            CommonParam.userId,
            startDate,
            endDate,
            scheduleRecordTypeId,
            setIsLoading
        )
        const username = visitDetailData?.name || visitDetailData?.routeUserInfo[0]?.name
        if (!_.isEmpty(visitorId)) {
            await syncDownObj(
                'Visit_List__c',
                `SELECT ${getAllFieldsByObjName(
                    'Visit_List__c'
                ).join()} FROM Visit_List__c WHERE OwnerId = '${visitorId}'
        AND (Visit_Date__c = ${visitDate} OR Visit_Date__c = ${originVisitDate}) 
        AND IsRemoved__c = FALSE
        AND RecordTypeId = '${dailyRecordTypeId}'`
            )
        }

        // handle schedule visit list, only if from published schedule
        let scheduleAdHoc = false
        if (!isFromRNSView) {
            const scheduleVisit = await queryAndSyncScheduleVisitList({ startDate, endDate, dropDownRef, setIsLoading })
            scheduleVisitId = scheduleVisit[0].Id
            scheduleAdHoc = scheduleVisit[0].Manager_Ad_Hoc__c
        }

        if (visitorId) {
            // handle weekly visit list
            const originWeeklyVisitList: any = await queryVisitList(
                visitorId,
                startDate,
                endDate,
                weeklyRecordTypeId,
                setIsLoading
            )

            if (originWeeklyVisitList.length === 0) {
                const newWeekly = {
                    ...initVisitList,
                    Name: `${startDate} - ${endDate} - ${username}`.slice(SLICE_START, TEXT_LENGTH_MAX),
                    OwnerId: visitorId,
                    Start_Date__c: startDate,
                    End_Date__c: endDate,
                    RecordTypeId: weeklyRecordTypeId,
                    Location_Id__c: CommonParam.userLocationId,
                    Updated__c: true,
                    Manager_Ad_Hoc__c: scheduleAdHoc,
                    Status__c: 'Not Started'
                }
                await SoupService.upsertDataIntoSoup('Visit_List__c', [newWeekly])
                await syncUpObjCreate(
                    'Visit_List__c',
                    getObjByName('Visit_List__c').syncUpCreateFields,
                    getObjByName('Visit_List__c').syncUpCreateQuery +
                        ` WHERE {Visit_List__c:OwnerId} = '${visitorId}'
                        AND {Visit_List__c:Start_Date__c} = '${startDate}'
                        AND {Visit_List__c:End_Date__c} = '${endDate}'
                        AND {Visit_List__c:Location_Id__c} = '${CommonParam.userLocationId}'
                        AND {Visit_List__c:RecordTypeId} = '${weeklyRecordTypeId}'
                    `
                )
            } else {
                originWeeklyVisitList[0].OwnerId = visitorId
                originWeeklyVisitList[0].Updated__c = true
                originWeeklyVisitList[0].Manager_Ad_Hoc__c = scheduleAdHoc
                await syncUpObjUpdateFromMem(
                    'Visit_List__c',
                    filterExistFields('Visit_List__c', originWeeklyVisitList, [
                        'Id',
                        'OwnerId',
                        'Updated__c',
                        'Manager_Ad_Hoc__c'
                    ])
                )
            }

            const weeklyVisitList = await queryVisitList(
                visitorId,
                startDate,
                endDate,
                weeklyRecordTypeId,
                setIsLoading
            )

            // handle daily visit list
            let originDailyVisitList = []
            const originDailyVLRes = await SoupService.retrieveDataFromSoup(
                'Visit_List__c',
                {},
                ScheduleQuery.retrieveVisitListData.f,
                ScheduleQuery.retrieveVisitListData.q +
                    `
                WHERE {Visit_List__c:OwnerId} = '${visitorId}'
                AND {Visit_List__c:Visit_Date__c} = '${visitDate}'
                AND {Visit_List__c:IsRemoved__c} IS FALSE
                AND {Visit_List__c:RecordTypeId} = '${dailyRecordTypeId}'
                AND {Visit_List__c:Status__c} != '${VisitListStatus.COMPLETED}'
                `
            )
            if (originDailyVLRes.length === 0) {
                const newDaily = {
                    ...initVisitList,
                    Name: `${visitDate} - ${username}`.slice(SLICE_START, TEXT_LENGTH_MAX),
                    OwnerId: visitorId,
                    Visit_Date__c: visitDate,
                    Visit_List_Group__c: weeklyVisitList[0].Id,
                    RecordTypeId: dailyRecordTypeId,
                    Location_Id__c: CommonParam.userLocationId,
                    Updated__c: true,
                    Manager_Ad_Hoc__c: scheduleAdHoc,
                    Status__c: 'Not Started'
                }
                originDailyVisitList.push(newDaily)
            } else {
                originDailyVisitList = originDailyVLRes.map((visitListItem) => {
                    visitListItem.Visit_List_Group__c = weeklyVisitList[0].Id
                    visitListItem.Updated__c = true
                    visitListItem.Manager_Ad_Hoc__c = scheduleAdHoc
                    return visitListItem
                })
            }

            await handleDailyVisitList({ originDailyVisitList, dropDownRef, setIsLoading })

            // get daily visit list
            const queryDaily = await SoupService.retrieveDataFromSoup(
                'Visit_List__c',
                {},
                ScheduleQuery.retrieveVisitListData.f,
                ScheduleQuery.retrieveVisitListData.q +
                    `
                WHERE {Visit_List__c:OwnerId} = '${visitorId}'
                AND {Visit_List__c:Visit_Date__c} = '${visitDate}'
                AND {Visit_List__c:IsRemoved__c} IS FALSE
                AND {Visit_List__c:RecordTypeId} = '${dailyRecordTypeId}'
                AND {Visit_List__c:Status__c} != '${VisitListStatus.COMPLETED}'
                `
            )

            // update sequence
            const oldVisitListIds = []
            let currentVisit: any = []
            const currentVisitRes: any = await SoupService.retrieveDataFromSoup(
                'Visit',
                {},
                ScheduleQuery.retrieveVisitData.f,
                ScheduleQuery.retrieveVisitData.q +
                    `
                WHERE {Visit:OwnerId} = '${visitorId}' AND {Visit:Planned_Date__c} = '${visitDate}'
                AND {Visit:Status__c} != 'Removed'
                AND {Visit:Status__c} != 'Failed'
                `
            )
            currentVisitRes.forEach((visit) => {
                if (!oldVisitListIds.includes(visit.Visit_List__c)) {
                    oldVisitListIds.push(visit.Visit_List__c)
                }
            })
            if (originScheduleVisit[0]?.Status__c === 'Completed') {
                updatedVisit.Status__c = 'Planned'
            }
            if (!moment(plannedDate).isSame(moment(originDate))) {
                const allSequence = currentVisitRes.map((item) => {
                    return parseInt(item.Sequence__c)
                })
                const maxSequence = max(allSequence)
                updatedVisit.Sequence__c = parseInt(maxSequence?.toString() || BooleanStr.STR_FALSE) + 1
                updatedVisit.Visit_List__c = queryDaily[0].Id
            }
            if (!isFromRNSView) {
                updatedVisit.Schedule_Visit_Group__c = scheduleVisitId
            }
            currentVisit = updatedVisit
            // update unscheduled field on visit list
            if (queryDaily[0].Id) {
                updateUnscheduledVisitListByDVLId(queryDaily[0].Id)
            }
            // update pull number
            const res = await SoupService.retrieveDataFromSoup(
                'Visit',
                {},
                ScheduleQuery.retrieveVisitData.f,
                ScheduleQuery.retrieveVisitData.q +
                    `
                    WHERE {Visit:PlaceId} = '${customerId}' AND {Visit:Planned_Date__c} = '${visitDate}'
                    `
            )
            if (!moment(plannedDate).isSame(moment(originDate))) {
                const allPN = res.map((item) => {
                    return item.Pull_Number__c
                })
                const maxPN = max(allPN)
                currentVisit.Pull_Number__c = parseInt(maxPN?.toString() || BooleanStr.STR_FALSE) + 1
            }
            return currentVisit
        }
        return updatedVisit
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'VisitDetails.updateVisitList', getStringValue(error))
        return updatedVisit
    }
}

const handlePublishNavigate = (newDate, setSelectDate, navigation, visitDetailData) => {
    const selectedDate = moment(newDate)
    const dayIndex = selectedDate.format('d')
    const selectSunday = selectedDate.clone().day(0).format('M/D')
    const sundays = getScheduleTotalSundays()
    const weekArr = getWeekArrByDate(selectedDate)
    setSelectDate(selectedDate)
    navigation.navigate(NavigationRoute.EMPLOYEE_SCHEDULE_LIST, {
        navigation: navigation,
        selectedDay: parseInt(dayIndex),
        employeeData: {
            avatar: visitDetailData.avatar || '',
            firstName: visitDetailData.firstName,
            lastName: visitDetailData.lastName,
            name: visitDetailData.name,
            id: visitDetailData.id,
            visitDetailRelated: visitDetailData,
            userStatsId: visitDetailData.userStatsId,
            unassignedRoute: !_.isEmpty(visitDetailData.routeGroup)
        },
        selectedWeek: sundays.indexOf(selectSunday),
        tmpWeekArr: weekArr
    })
}

const handleRNSNavigate = async (params) => {
    const {
        allDetailData,
        getRNSEmployeeList,
        visitListId,
        dropDownRef,
        visitDetailData,
        setIsLoading,
        navigation,
        plannedDate,
        getRNSCustomerList,
        setUpdateVisitModalVisible
    } = params
    if (allDetailData.isESchedule) {
        await getRNSEmployeeList({
            visitListId,
            dropDownRef
        })
        const employeeList = store.getState().manager.RNSEmployeeList
        const employee = employeeList.filter((item: any) =>
            item.unassignedRoute ? item.id === visitDetailData.routeGroup : item.visitor === visitDetailData.id
        )
        setIsLoading(false)
        setUpdateVisitModalVisible(true)
        setTimeout(() => {
            navigation?.replace('SelectSchedule', {
                isESchedule: true,
                userData: employee[0],
                addVisitDate: moment(plannedDate).format(FORMAT_DATE_STRING)
            })
        }, DEFAULT_DELAY_TIME)
    } else {
        await getRNSCustomerList({
            visitListId,
            dropDownRef
        })
        const customerList = await queryCustomerList({
            visitListId,
            dropDownRef
        })
        const customer = customerList.filter((item: any) => item.id === visitDetailData.retailStoreId)
        setIsLoading(false)
        setUpdateVisitModalVisible(true)
        setTimeout(() => {
            navigation?.replace('SelectSchedule', {
                isESchedule: false,
                customerData: customer[0],
                addVisitDate: moment(plannedDate).format(FORMAT_DATE_STRING)
            })
        }, DEFAULT_DELAY_TIME)
    }
}

const handleNavigationAfterSaved = (params) => {
    const {
        isFromRNSView,
        setIsLoading,
        originDate,
        plannedDate,
        isFromScheduleCustomer,
        setSelectDate,
        navigation,
        visitDetailData,
        goBack,
        allDetailData,
        getRNSEmployeeList,
        visitListId,
        dropDownRef,
        getRNSCustomerList,
        setUpdateVisitModalVisible
    } = params
    if (!isFromRNSView) {
        setIsLoading(false)
        setUpdateVisitModalVisible(true)
        setTimeout(() => {
            if (!originDate.isSame(plannedDate)) {
                if (!isFromScheduleCustomer) {
                    handlePublishNavigate(plannedDate, setSelectDate, navigation, visitDetailData)
                } else {
                    setSelectDate(moment(plannedDate))
                    !isFromScheduleCustomer && NativeAppEventEmitter.emit(EventEmitterType.REFRESH_ESL)
                    goBack()
                }
            } else {
                !isFromScheduleCustomer && NativeAppEventEmitter.emit(EventEmitterType.REFRESH_ESL)
                goBack()
            }
        }, DEFAULT_DELAY_TIME)
    } else {
        handleRNSNavigate({
            allDetailData,
            getRNSEmployeeList,
            visitListId,
            dropDownRef,
            visitDetailData,
            setIsLoading,
            navigation,
            plannedDate,
            getRNSCustomerList,
            setUpdateVisitModalVisible
        })
    }
}

const updateVisit = async (params) => {
    const { updatedVisit, visitId, setIsLoading, dropDownRef } = params
    try {
        await SoupService.upsertDataIntoSoup('Visit', updatedVisit, true, false)
        await syncUpObjUpdate(
            'Visit',
            getObjByName('Visit').syncUpCreateFields,
            getObjByName('Visit').syncUpCreateQuery + ` WHERE {Visit:Id} = '${visitId}'`
        )
    } catch (err) {
        setIsLoading(false)
        dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_VISIT_INSERT_VISIT_DETAIL, err)
    }
}

const onSaveClick = async (params) => {
    const {
        visitId,
        setIsLoading,
        plannedDate,
        originDate,
        dropDownRef,
        isFromRNSView,
        visitDetailData,
        selectedSubType,
        isEnabledTakeOrder,
        durationTime,
        insDescription,
        isFromScheduleCustomer,
        setSelectDate,
        navigation,
        goBack,
        allDetailData,
        getRNSEmployeeList,
        visitListId,
        getRNSCustomerList,
        setErrorMsgType,
        setIsErrorShow,
        setUpdateVisitModalVisible
    } = params
    if (!visitId) {
        return
    }
    try {
        setIsLoading(true)
        const svgList = await SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            ['scheduleVisitGroup'],
            `SELECT
            {Visit:Schedule_Visit_Group__c}
            FROM {Visit} WHERE {Visit:Id} = '${visitId}'
            `
        )
        const svgId = svgList[0].scheduleVisitGroup
        const modified = await checkSVGDataModifiedById(svgId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            setIsLoading(false)
            return
        }
        let vlCheck: boolean = true
        const isAssigned = !_.isEmpty(visitDetailData?.visitListId)
        if (moment(plannedDate).isSame(moment(originDate))) {
            const originVlCheck = isAssigned
                ? await checkVisitListForReassignVisit(
                      visitDetailData.id,
                      [moment(originDate).format(FORMAT_DATE_STRING)],
                      setIsLoading
                  )
                : true
            const originVisitCheck = await dataCheckWithAction('Visit', `WHERE Id = '${visitId}'`, '', false)
            vlCheck = originVlCheck && originVisitCheck
        } else {
            const originCheck = isAssigned
                ? await checkVisitListForReassignVisit(
                      visitDetailData.id,
                      [moment(originDate).format(FORMAT_DATE_STRING)],
                      setIsLoading
                  )
                : true
            const editCheck = isAssigned
                ? await checkVisitListForReassignVisit(
                      visitDetailData.id,
                      [moment(plannedDate).format(FORMAT_DATE_STRING)],
                      setIsLoading
                  )
                : true
            const vCheck = await dataCheckWithAction('Visit', `WHERE Id = '${visitId}'`, '', false)
            vlCheck = originCheck && editCheck && vCheck
        }
        if (!vlCheck && _.isEmpty(visitDetailData?.routeGroup)) {
            setIsLoading(false)
            setErrorMsgType(DataCheckMsgIndex.COMMON_MSG)
            setIsErrorShow(true)
            return
        }
        const updatedVisit = []
        const res = await SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            getObjByName('Visit').syncUpCreateFields,
            getObjByName('Visit').syncUpCreateQuery + ` WHERE {Visit:Id} = '${visitId}'`
        )
        if (res?.length > 0) {
            let visit
            const oldDuration = parseFloat(visitDetailData.durationMinutes || 0)
            if (!moment(plannedDate).isSame(moment(originDate)) || oldDuration !== durationTime) {
                visit = await updateVisitList(
                    _.cloneDeep(res[0]),
                    plannedDate,
                    dropDownRef,
                    isFromRNSView,
                    setIsLoading,
                    visitDetailData,
                    originDate
                )
            }
            if (visit) {
                updatedVisit.push(visit)
            } else {
                updatedVisit.push(res[0])
            }
            updatedVisit[0].Visit_Subtype__c = selectedSubType
                .filter((item) => item.select === true)
                .map((item) => item.id)
                .join(';')
            updatedVisit[0].Take_Order_Flag__c = isEnabledTakeOrder
            updatedVisit[0].Planned_Date__c = moment(plannedDate).format(FORMAT_DATE_STRING)
            updatedVisit[0].Planned_Duration_Minutes__c = durationTime
            updatedVisit[0].InstructionDescription = insDescription
            await updateVisit({
                updatedVisit,
                visitId,
                setIsLoading,
                dropDownRef
            })
            if (!_.isEmpty(updatedVisit[0]?.Visit_List__c)) {
                if (!moment(plannedDate).isSame(moment(originDate))) {
                    try {
                        await recalculatePullNumberWithCustomerIdAndVisitDate(updatedVisit[0].PlaceId, originDate)
                        if (!isFromRNSView) {
                            pushNotificationToMerch({
                                type: VisitOperationType.RESCHEDULE,
                                lstVisitId: [visitId]
                            }).catch((err) => {
                                storeClassLog(
                                    Log.MOBILE_ERROR,
                                    'VisitDetails.onSaveClick.pushNotificationToMerch',
                                    getStringValue(err)
                                )
                            })
                        }
                    } catch (error) {
                        setIsLoading(false)
                    }
                }
                // resequence old visits
                await reSequenceByVisitListId(res[0]?.Visit_List__c)
                // resequence new visits
                await reSequenceByVisitListId(updatedVisit[0]?.Visit_List__c)
                await calculateDistanceAndTravelTime(updatedVisit[0]?.Visit_List__c)
                if (_.isEmpty(updatedVisit[0].Route_Group__c)) {
                    await updateVisitListToUnscheduled(res[0].Visit_List__c, !isFromRNSView)
                }
            }
        }
        handleNavigationAfterSaved({
            isFromRNSView,
            setIsLoading,
            originDate,
            plannedDate,
            isFromScheduleCustomer,
            setSelectDate,
            navigation,
            visitDetailData,
            goBack,
            allDetailData,
            getRNSEmployeeList,
            visitListId,
            dropDownRef,
            getRNSCustomerList,
            setUpdateVisitModalVisible
        })
    } catch (err) {
        setIsLoading(false)
        dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_VISIT_QUERY_VISIT_DETAIL, err)
    }
}

const renderEECard = (visitDetailData, navigation, isFromRNSView, onEECardClick, isFromRep, isFromMyDay, visitList) => {
    const eeCard = (
        <EmployeeItem
            item={visitDetailData}
            showContact
            showWorkingDays={visitDetailData?.userMerchandisingBase}
            containerHeight={E_CARD_HEIGHT}
            navigation={navigation}
            isClickable={!isFromRNSView && !isFromRep}
            onCardClick={!isFromRNSView && onEECardClick}
        />
    )
    const userId = visitDetailData?.id
    if (isFromRNSView || isFromRep) {
        return !_.isEmpty(userId) && eeCard
    }
    if (isFromMyDay) {
        return !_.isEmpty(userId) && !_.isEmpty(visitList) && eeCard
    }
    return eeCard
}

const checkSubTypeSelectAtLeastOne = (selectedSubType) => {
    return selectedSubType.filter((item: any) => item.select).length > 0
}

const renderSelectedSubtype = (selectedSubType, notEditable, onRemoveSubType, isReadOnly) => {
    return selectedSubType
        .filter((item: any) => item.select)
        .map((item: any) => {
            return (
                <View style={styles.subTypeCell} key={`select${item.id}`}>
                    <CText>{item.name}</CText>
                    {!isReadOnly && (
                        <TouchableOpacity
                            disabled={notEditable}
                            onPress={() => onRemoveSubType(item)}
                            style={styles.clearSubTypeContainer}
                        >
                            <Image style={styles.imgClear} source={ImageSrc.IMG_CLEAR} />
                        </TouchableOpacity>
                    )}
                </View>
            )
        })
}

const renderPullNum = (isVisitDayChanged, pullNum) => {
    return isVisitDayChanged && pullNum ? 'TBD' : pullNum
}

const getCustomerCardData = (allDetailData) => {
    return { item: allDetailData?.customerCardData }
}

const renderSubtypeView = (params) => {
    const { notEditable, selectedSubType, setTypeModalVisible, onRemoveSubType, isReadOnly } = params
    return (
        <View>
            <TouchableOpacity
                disabled={notEditable || isReadOnly}
                style={[
                    styles.flexRow,
                    styles.flexSelectRow,
                    checkSubTypeSelectAtLeastOne(selectedSubType) && styles.noBottomLine,
                    selectedSubType.filter((item: any) => item.select).length === 0 && styles.marginBottom_30
                ]}
                onPress={() => {
                    setTypeModalVisible(true)
                }}
            >
                <View style={styles.flexDirectionRow}>
                    <CText style={styles.selectLabel}>{t.labels.PBNA_MOBILE_VISIT_SUBTYPE}</CText>
                </View>
                {!isReadOnly && (
                    <View style={styles.flexRowAlignCenter}>
                        <Image source={IMG_TRIANGLE} style={styles.imgTriangle} />
                    </View>
                )}
            </TouchableOpacity>
            <View
                style={[
                    checkSubTypeSelectAtLeastOne(selectedSubType) && styles.bottomLine,
                    checkSubTypeSelectAtLeastOne(selectedSubType) && styles.marginBottom_20
                ]}
            >
                <View style={styles.selectedContainer}>
                    {renderSelectedSubtype(selectedSubType, notEditable, onRemoveSubType, isReadOnly)}
                </View>
            </View>
        </View>
    )
}

const RenderDeliveryCard = (params) => {
    const {
        isFromRNSView,
        visitDetailData,
        navigation,
        onEECardClick,
        allDetailData,
        isFromRep,
        visitList,
        isFromMyDay
    } = params
    const userId = visitDetailData?.id
    return (
        <View>
            <View style={[styles.userInfoCard, isFromRNSView && styles.marginBottom_120]}>
                {!visitDetailData?.routeGroup &&
                    renderEECard(
                        visitDetailData,
                        navigation,
                        isFromRNSView,
                        onEECardClick,
                        isFromRep,
                        isFromMyDay,
                        visitList
                    )}
                {!visitDetailData?.routeGroup &&
                    ((_.isEmpty(userId) && (isFromRNSView || isFromRep)) ||
                        (isFromMyDay && _.isEmpty(userId) && _.isEmpty(visitList))) &&
                    renderUnassignCard()}
                {visitDetailData?.routeGroup &&
                    renderUnassignRouteCard(visitDetailData?.routeUserInfo[0], false, false, true)}
                <View style={styles.swipDeliveryCardStyle}>
                    {useMemo(() => {
                        return <SwipDeliveryCard visit={allDetailData} navigation={navigation} showHalfDeliveryCard />
                    }, [allDetailData])}
                </View>
            </View>
            {!isFromRNSView && (
                <View style={styles.marginTop_60}>
                    <VDWorkOrderAndTimeline visit={allDetailData} />
                </View>
            )}
        </View>
    )
}

const renderBottomButton = (params) => {
    const {
        originDate,
        plannedDate,
        durationTime,
        isEnabledTakeOrder,
        selectedSubType,
        insDescription,
        notEditable,
        visitId,
        setIsLoading,
        dropDownRef,
        isFromRNSView,
        visitDetailData,
        isFromScheduleCustomer,
        setSelectDate,
        navigation,
        goBack,
        allDetailData,
        getRNSEmployeeList,
        visitListId,
        getRNSCustomerList,
        setErrorMsgType,
        setIsErrorShow,
        isReadOnly,
        setUpdateVisitModalVisible
    } = params
    return (
        checkToShowBottomButtons(
            originDate,
            plannedDate,
            visitDetailData,
            durationTime,
            isEnabledTakeOrder,
            selectedSubType,
            insDescription
        ) && (
            <View style={[styles.bottomContainer, styles.marginBottom_30]}>
                <TouchableOpacity
                    disabled={notEditable || isReadOnly}
                    onPress={() => {
                        goBack()
                    }}
                    style={styles.reBtnCancel}
                >
                    <CText style={styles.textCancel}>{t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}</CText>
                </TouchableOpacity>
                {
                    <TouchableOpacity
                        onPress={() => {
                            onSaveClick({
                                visitId,
                                setIsLoading,
                                plannedDate,
                                originDate,
                                dropDownRef,
                                isFromRNSView,
                                visitDetailData,
                                selectedSubType,
                                isEnabledTakeOrder,
                                durationTime,
                                insDescription,
                                isFromScheduleCustomer,
                                setSelectDate,
                                navigation,
                                goBack,
                                allDetailData,
                                getRNSEmployeeList,
                                visitListId,
                                getRNSCustomerList,
                                setErrorMsgType,
                                setIsErrorShow,
                                setUpdateVisitModalVisible
                            })
                        }}
                        style={[
                            styles.reBtnSave,
                            shouldDisableSaveBtn(selectedSubType, durationTime) && styles.disabledReBtnSave
                        ]}
                        disabled={shouldDisableSaveBtn(selectedSubType, durationTime) || notEditable || isReadOnly}
                    >
                        <CText
                            style={[
                                styles.textSave,
                                shouldDisableSaveBtn(selectedSubType, durationTime) && styles.disabledTextSave
                            ]}
                        >
                            {t.labels.PBNA_MOBILE_SAVE}
                        </CText>
                    </TouchableOpacity>
                }
            </View>
        )
    )
}

const getEditableByStatus = (allDetailData) => {
    return allDetailData.status === VisitStatus.IN_PROGRESS || allDetailData.status === VisitStatus.COMPLETE
}

const VisitDetails = (props: VisitDetailProps) => {
    const { navigation, route } = props
    const { dropDownRef } = useDropDown()
    const [allDetailData, setAllDetailData] = useState(route.params.item || { customerCardData: {} })
    const isFromRNSView = route.params.isFromRNSView
    const isFromMyDay = route.params.isFromMyDay
    const visitListId = route.params.visitListId
    const isFromRep = route.params.isFromRep || false
    const visitId = allDetailData.Id || allDetailData.id
    const [visitDetailData, setVisitDetailData] = useState(allDetailData.visitDetailRelated || {})
    const isFromScheduleCustomer = allDetailData.fromScheduleCustomer
    const visitList = allDetailData.Visit_List__c || ''
    const [notEditable, setNotEditable] = useState(getEditableByStatus(allDetailData))
    const manager = useSelector(managerReducer)
    const dateArr = manager.scheduleDate
    const [minDate, setMinDate] = useState(moment().toDate())
    const NOW_PLUS_ONE_YEAR = isFromRNSView
        ? moment(dateArr[0] + CommonLabel.END_OF_DAY_TIME)
              .endOf(MOMENT_STARTOF.WEEK)
              .toDate()
        : moment().clone().add(4, 'w').endOf(MOMENT_STARTOF.WEEK).toDate()
    const [isLoading, setIsLoading] = useState(false)
    const [originDate, setOriginDate] = useState(
        visitDetailData.plannedDate ? moment(visitDetailData.plannedDate) : moment()
    )
    const [plannedDate, setPlannedDate] = useState(originDate.isValid() ? originDate.toDate() : moment().toDate())
    const [isEnabledTakeOrder, setIsEnabledTakeOrder] = useState(visitDetailData.takeOrder === '1')
    const [pullNum, setPullNum] = useState(visitDetailData.pullNum ? 'P' + visitDetailData.pullNum : '')
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [isVisitDayChanged, setIsVisitDayChanged] = useState(false)
    const [durationModalVisible, setDurationModalVisible] = useState(false)
    const [durationHours, setDurationHours] = useState(
        Math.floor(parseFloat(visitDetailData.durationMinutes) / 60) || 0
    )
    const [durationMinutes, setDurationMinutes] = useState(
        Math.floor(parseFloat(visitDetailData.durationMinutes) % 60) || 0
    )
    const [durationTime, setDurationTime] = useState(parseFloat(visitDetailData.durationMinutes))
    const [durationString, setDurationString] = useState(getTimeFromMins(parseFloat(visitDetailData.durationMinutes)))
    const initialSubType = getInitialSubType(visitDetailData)
    const [typeModalVisible, setTypeModalVisible] = useState(false)
    const [subTypeArray, setSubTypeArray] = useState(JSON.parse(JSON.stringify(initialSubType)))
    const [selectedSubType, setSelectedSubType] = useState(JSON.parse(JSON.stringify(initialSubType)))
    const [insDescription, setInsDescription] = useState('')
    const [mapInfo, setMapInfo] = useState({
        region: null
    })
    const [isErrorShow, setIsErrorShow] = useState(false)
    const [errorMsgType, setErrorMsgType] = useState(DataCheckMsgIndex.COMMON_MSG)
    const dispatch = useDispatch()
    const setSelectDate = compose(dispatch, managerAction.setSelectDate)
    const getRNSEmployeeList = compose(dispatch, managerAction.getRNSEmployeeList)
    const getRNSCustomerList = compose(dispatch, managerAction.getRNSCustomerList)
    const isReadOnly = CommonParam.PERSONA__c !== Persona.MERCH_MANAGER
    const [updateVisitModalVisible, setUpdateVisitModalVisible] = useState(false)

    useEffect(() => {
        setIsLoading(false)
        queryVisit({
            visitId,
            setIsLoading,
            setOriginDate,
            setNotEditable,
            notEditable,
            setPlannedDate,
            setIsEnabledTakeOrder,
            setInsDescription,
            setDurationHours,
            setDurationMinutes,
            setDurationTime,
            setDurationString,
            setSubTypeArray,
            setSelectedSubType,
            setVisitDetailData,
            setPullNum,
            dropDownRef,
            isFromRNSView,
            allDetailData,
            setAllDetailData,
            isFromRep,
            setMinDate,
            dateArr,
            manager
        })
    }, [])

    const onRemoveSubTypeClick = (item) => {
        onRemoveSubType(item, subTypeArray, setSubTypeArray, setSelectedSubType)
    }

    const checkClick = (index) => {
        subTypeArray[index].select = !subTypeArray[index].select
        setSubTypeArray([...subTypeArray])
    }

    const goBack = () => {
        navigation.goBack()
    }

    useEffect(() => {
        navigation.setOptions({ tabBarVisible: false })
        getLocationPosition(setMapInfo)
    }, [])

    const toggleSwitch = () => {
        setIsEnabledTakeOrder(!isEnabledTakeOrder)
    }

    const onCustomerItemClick = (item, type) => {
        if (_.isEmpty(item)) {
            return
        }
        if (type === CommonLabel.CUSTOMER_ITEM_CLICK_MODAL) {
            if (isPersonaDelSupOrSDL()) {
                goToCustomerDetail(navigation, allDetailData?.customerCardData?.accountId)
            } else {
                navigation.push(NavigationRoute.CUSTOMER_DETAIL, { customerData: item, mapInfo })
            }
        } else if (type === CommonLabel.CUSTOMER_ITEM_CLICK_LOCATION) {
            onLocationIconClick(item, type, mapInfo)
        }
    }

    const handlePlannedDateChange = (event, selectedDate) => {
        onPlannedDateChange(
            selectedDate,
            setPlannedDate,
            plannedDate,
            setShowDatePicker,
            originDate,
            setIsVisitDayChanged
        )
    }

    const handleDurationChange = (value: { hours: number; minutes: number }) => {
        const hoursNum = Number(value.hours)
        const minsNum = Number(value.minutes)
        const tempMins = minsNum % VisitDurationIncrement.FIFTEEN_MINUTES === 0 ? minsNum : 0
        setDurationHours(hoursNum)
        setDurationMinutes(tempMins)
        setDurationTime(hoursNum * 60 + tempMins)
        setDurationString(getTimeFromMins(hoursNum * 60 + tempMins))
    }

    const onEECardClick = () => {
        handlePublishNavigate(originDate, setSelectDate, navigation, visitDetailData)
    }
    const dataCheckAction = () => {
        if (errorMsgType === DataCheckMsgIndex.COMMON_MSG) {
            navigation.pop(NavigationPopNum.POP_TWO)
        } else if (
            errorMsgType === DataCheckMsgIndex.SVG_PUBLISHED_MSG ||
            errorMsgType === DataCheckMsgIndex.SVG_CANCELLED_MSG
        ) {
            navigation.pop(NavigationPopNum.POP_THREE)
        }
    }
    return (
        <View style={styles.flex_1}>
            <SafeAreaView style={styles.container}>
                <ScrollView style={[styles.flex_1]}>
                    <KeyboardAwareScrollView behavior={'padding'}>
                        <View style={styles.deHeader}>
                            <CText style={styles.deTitle}>{t.labels.PBNA_MOBILE_VISIT_DETAILS}</CText>
                            <View>
                                <TouchableOpacity onPress={goBack}>
                                    <BlueClear height={36} width={36} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.visitCard}>
                            <CustomerItem
                                containerStyle={styles.topCustomerCardView}
                                item={getCustomerCardData(allDetailData)}
                                showIcon
                                itemClick={onCustomerItemClick}
                            />
                        </TouchableOpacity>
                        <View style={styles.ScrollViewBoder}>
                            <View style={styles.planContent}>
                                <View style={[styles.planLabelRow, styles.noBottomLine]}>
                                    <View style={[styles.planBox]}>
                                        <CText style={styles.smallSelectLabel}>
                                            {t.labels.PBNA_MOBILE_PLANNED_DATE}
                                        </CText>
                                    </View>
                                    <View style={[styles.planBox]}>
                                        <CText style={styles.smallSelectLabel}>
                                            {t.labels.PBNA_MOBILE_PLANNED_DURATION}
                                        </CText>
                                    </View>
                                </View>

                                <View style={[styles.planValueRow, styles.noBottomLine]}>
                                    <TouchableOpacity
                                        disabled={notEditable || isReadOnly || !_.isEmpty(visitDetailData.routeGroup)}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <View style={[styles.planValueBox, styles.bottomLine]}>
                                            <CText style={styles.instructionsText}>
                                                {moment(plannedDate).format(TIME_FORMAT.MMMDDYYYY)}
                                            </CText>
                                            {!isReadOnly && (
                                                <Image style={styles.cellImgIcon} source={ImageSrc.IMG_CALENDAR} />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        disabled={notEditable || isReadOnly}
                                        onPress={() => {
                                            setDurationModalVisible(true)
                                        }}
                                    >
                                        <View style={[styles.planValueBox, styles.bottomLine]}>
                                            <CText style={styles.instructionsText}>{durationString}</CText>
                                            {!isReadOnly && (
                                                <Image style={styles.cellImgIcon} source={ImageSrc.IMG_CLOCK_BLUE} />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                {renderSubtypeView({
                                    notEditable,
                                    selectedSubType,
                                    setTypeModalVisible,
                                    onRemoveSubType: onRemoveSubTypeClick,
                                    isReadOnly
                                })}

                                <View style={styles.marginBottom_20}>
                                    <CSwitch
                                        disabled={notEditable || isReadOnly}
                                        label={t.labels.PBNA_MOBILE_TAKE_ORDER}
                                        labelStyle={styles.selectLabel}
                                        showBottomLine
                                        checked={isEnabledTakeOrder}
                                        toggleSwitch={() => {
                                            toggleSwitch()
                                        }}
                                    />
                                </View>

                                <View
                                    style={[
                                        styles.flexRow,
                                        styles.flexSelectRow,
                                        styles.bottomLine,
                                        styles.marginBottom_30
                                    ]}
                                >
                                    <View style={styles.flexDirectionRow}>
                                        <CText style={styles.selectLabel}>{t.labels.PBNA_MOBILE_PULL_POSITION}</CText>
                                    </View>
                                    <View style={[styles.flexRowAlignCenter]}>
                                        <CText style={[styles.selectLabel, styles.selectValue]}>
                                            {renderPullNum(isVisitDayChanged, pullNum)}
                                        </CText>
                                    </View>
                                </View>

                                <View style={[styles.bottomLine, styles.marginBottom_20]}>
                                    <View style={styles.flexDirectionRow}>
                                        <CText style={styles.selectLabel}>
                                            {t.labels.PBNA_MOBILE_SPECIAL_INSTRUCTIONS}
                                        </CText>
                                    </View>
                                    <TextInput
                                        style={styles.inputStyle}
                                        autoCorrect={false}
                                        editable={!notEditable && !isReadOnly}
                                        multiline
                                        onChangeText={setInsDescription}
                                        value={insDescription}
                                    />
                                </View>
                            </View>
                            {RenderDeliveryCard({
                                isFromRNSView,
                                visitDetailData,
                                navigation,
                                onEECardClick,
                                isFromMyDay,
                                visitList,
                                allDetailData,
                                isFromRep
                            })}
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>
                {renderBottomButton({
                    originDate,
                    plannedDate,
                    durationTime,
                    isEnabledTakeOrder,
                    selectedSubType,
                    insDescription,
                    notEditable,
                    visitId,
                    setIsLoading,
                    dropDownRef,
                    isFromRNSView,
                    visitDetailData,
                    isFromScheduleCustomer,
                    setSelectDate,
                    navigation,
                    goBack,
                    allDetailData,
                    getRNSEmployeeList,
                    visitListId,
                    getRNSCustomerList,
                    setErrorMsgType,
                    setIsErrorShow,
                    isReadOnly,
                    setUpdateVisitModalVisible
                })}
            </SafeAreaView>
            <Modal animationType="fade" transparent visible={showDatePicker}>
                <TouchableOpacity style={styles.centeredView} onPress={() => setShowDatePicker(false)}>
                    <View style={styles.calendarModalView}>
                        <DateTimePicker
                            style={styles.datePicker}
                            themeVariant={'light'}
                            testID={'dateTimePicker'}
                            textColor={'red'}
                            minimumDate={minDate}
                            maximumDate={NOW_PLUS_ONE_YEAR}
                            value={plannedDate}
                            mode={'date'}
                            display={'inline'}
                            onChange={handlePlannedDateChange}
                            timeZoneOffsetInMinutes={moment.tz(CommonParam.userTimeZone).utcOffset()}
                            locale={DatePickerLocale[CommonParam.locale]}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
            <Modal
                animationType="fade"
                transparent
                visible={durationModalVisible}
                onRequestClose={() => {
                    setDurationModalVisible(!durationModalVisible)
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.durationModalView}>
                        <View style={styles.modalHeader}>
                            <CText>{t.labels.PBNA_MOBILE_PLANNED_DURATION}</CText>
                            <TouchableOpacity
                                onPress={() => {
                                    setDurationModalVisible(!durationModalVisible)
                                }}
                                hitSlop={commonStyle.smallHitSlop}
                            >
                                <CText style={styles.modalButton}>{t.labels.PBNA_MOBILE_DONE}</CText>
                            </TouchableOpacity>
                        </View>
                        <TimePicker
                            hoursUnit={MOMENT_STARTOF.HOUR}
                            minutesUnit={t.labels.PBNA_MOBILE_MIN}
                            value={{
                                hours: durationHours,
                                minutes: durationMinutes,
                                seconds: null
                            }}
                            onChange={handleDurationChange}
                            minutesInterval={VisitDurationIncrement.FIFTEEN_MINUTES}
                        />
                    </View>
                </View>
            </Modal>
            <SubTypeModal
                subTypeArray={subTypeArray}
                typeModalVisible={typeModalVisible}
                setTypeModalVisible={setTypeModalVisible}
                onCheckClick={(index) => {
                    checkClick(index)
                }}
                onCancelSubType={() => {
                    onCancelSubType(setTypeModalVisible, typeModalVisible, selectedSubType, setSubTypeArray)
                }}
                updateVisitSubType={() => {
                    updateVisitSubType(setTypeModalVisible, typeModalVisible, subTypeArray, setSelectedSubType)
                }}
            />
            <ErrorMsgModal
                index={errorMsgType}
                visible={isErrorShow}
                setModalVisible={setIsErrorShow}
                handleClick={dataCheckAction}
            />
            <Loading isLoading={isLoading} />
            <ReassignResultModal
                navigation={navigation}
                isUpdatedServiceDetail
                modalVisible={updateVisitModalVisible}
                setModalVisible={setUpdateVisitModalVisible}
            />
        </View>
    )
}

export default VisitDetails

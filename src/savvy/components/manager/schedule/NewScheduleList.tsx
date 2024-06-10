/**
 * @description Employee list component
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-03-18
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, DeviceEventEmitter, FlatList, Image, ScrollView, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'
import { SoupService } from '../../../service/SoupService'
import CText from '../../../../common/components/CText'
import { useIsFocused } from '@react-navigation/native'
import MonthWeekFilter from '../../common/MonthWeekFilter'
import SearchBarFilter from '../common/SearchBarFilter'
import EmployeeCell, { UnassignedRouteCell } from '../common/EmployeeCell'
import moment from 'moment'
import { CommonParam } from '../../../../common/CommonParam'
import { useDispatch, useSelector } from 'react-redux'
import ScheduleQuery from '../../../queries/ScheduleQuery'
import { formatString } from '../../../utils/CommonUtils'
import NewScheduleMap from './NewScheduleMap'
import LoadingBanner from './LoadingBanner'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import {
    closeOtherRows,
    closeAllOpenRow,
    getRecordTypeIdByDeveloperName,
    getScheduleTotalSundays,
    refreshManager,
    syncDownDataByTableNames,
    updateLocationInfoInCopilot,
    getUserCityName,
    removeDataOnCancelClick
} from '../../../utils/MerchManagerUtils'
import Draggable from 'react-native-draggable'
import NewScheduleListStyle from '../../../styles/manager/NewScheduleListStyle'
import { compose } from '@reduxjs/toolkit'
import managerAction from '../../../redux/action/H01_Manager/managerAction'
import EmptyImage from '../../../../../assets/image/empty_visit.svg'
import { VisitListStatus } from '../../../enums/VisitList'
import { VisitStatus, VisitType } from '../../../enums/Visit'
import RefreshControlM from '../common/RefreshControlM'
import Orientation, { useDeviceOrientationChange } from 'react-native-orientation-locker'
import LandScapeView from './LandScapeView'
import PortraitView from './PortraitView'
import BlueClear from '../../../../../assets/image/ios-close-circle-outline-blue.svg'
import Collapsible from 'react-native-collapsible'
import { MeetingHeader, MeetingItem } from './MeetingItem'
import SwipeableRow from '../../common/SwipeableRow'
import ReassignResultModal from '../common/ReassignResultModal'
import { deleteMeetingAlert, duplicateMeeting, getPubDayMeeting, meetingOnClick } from '../service/MeetingService'
import {
    compositeMyDayVisitListStatus,
    getIdClause,
    getUnassignedVisits,
    handleDeleteMeeting,
    navigateToAddMeeting,
    renderAddMeetingDropdownItem,
    renderExportDropdownItem,
    renderUnassignVisitBar
} from '../helper/MerchManagerHelper'
import { Log } from '../../../../common/enums/Log'
import _ from 'lodash'
import store from '../../../redux/store/Store'
import UserLocationModal from '../../common/UserLocationModal'
import { checkMeetingDataCheck, checkSVGDataModifiedById } from '../service/DataCheckService'
import { BooleanStr, DataCheckMsgIndex, DropDownType, NavigationRoute, ScrollThreshold } from '../../../enums/Manager'
import ErrorMsgModal from '../common/ErrorMsgModal'
import { getDeliveryFooter } from '../../../utils/MerchandiserUtils'
import ScheduleVisitCard from '../../merchandiser/ScheduleVisitCard'
import { CommonLabel } from '../../../enums/CommonLabel'
import { Constants } from '../../../../common/Constants'
import { t } from '../../../../common/i18n/t'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { floatIconSize, floatPosition, ICON_LIST, ICON_MAP } from '../../../helper/manager/NewScheduleListHelper'
import ManagerMap from '../../sales/my-day/ManagerMap'
import NewScheduleModal from './NewScheduleModal'
import { isPersonaMerchManager, isPersonaUGM, Persona } from '../../../../common/enums/Persona'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { setLoggedInUserTimezone } from '../../../utils/TimeZoneUtils'
import { getDurationTruncHours } from '../../../utils/MerchManagerComputeUtils'
import { getUnassignedRouteUserByDate } from '../helper/VisitHelper'
import { DragSortableView } from 'react-native-drag-sort'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FavoriteBar from '../common/FavoriteBar'
import { SwipeToDo } from '../../common/SwipeToDo'
import {
    getFavoriteBarOpenStatus,
    handleFavoriteEmployee,
    renderFavoriteHiddenItem,
    renderRemoveFavoriteHiddenItem,
    setFavoriteBarOpenStatus
} from '../helper/FavoriteEmployeeHelper'
import SwipeCollapsible from '../../common/SwipeCollapsible'
import { Locale } from '../../../enums/i18n'
import { getData } from '../../../utils/sync/ManagerSyncUtils'
import {
    handleScroll,
    handleSwipeCollapsibleRef,
    IN_PROGRESS,
    MyDayStatusOrder,
    renderStatusBarItem,
    sortListByStatusArr,
    updateLocalStatusSortArr,
    YET_2_START
} from '../../../helper/manager/AllManagerMyDayHelper'
import { cancelGeneratingSchedule } from '../../../api/ApexApis'
import { getStringValue } from '../../../utils/LandingUtils'
import { getClockTime } from './EmployeeScheduleListHelper'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { MOMENT_UNIT } from '../../../../common/enums/MomentUnit'
import { MOMENT_STARTOF } from '../../../../common/enums/MomentStartOf'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { DeviceEvent } from '../../../enums/DeviceEvent'

const styles = { ...NewScheduleListStyle, ...commonStyle }

const IMG_SCHEDULE = ImageSrc.IMG_NEW_SCHEDULE
const iconAdd = ImageSrc.ADD_BLUE_CIRCLE
const IMG_GEN_SCHEDULE = ImageSrc.IMG_GEN_INPROGRESS

const NEXT_OPEN_WEEK = 5
const SUNDAY_NUM = 0
const SATURDAY_NUM = 6
const ACTIVE_TAB_1 = 1
const ACTIVE_TAB_2 = 2

const FORMAT_DATE_STRING = TIME_FORMAT.Y_MM_DD
const LANDSCAPE_RIGHT = 'LANDSCAPE-RIGHT'
const LANDSCAPE_LEFT = 'LANDSCAPE-LEFT'
const PORTRAIT = 'PORTRAIT'
const PORTRAIT_UPSIDEDOWN = 'PORTRAIT-UPSIDEDOWN'
const TEXT_FORMAT_TYPE_MD = TIME_FORMAT.MD
const HEIGHT_FOR_SCROLL = 60
const HIDE_CARD_HEIGHT = 20
const SHOW_CARD_HEIGHT = 92
const managerReducer = (state) => state.manager
interface NewScheduleListProps {
    props?: any
    setIsLandscapePage: Function
    navigation?: any
    cRef: any
}

const computeStatus = (
    item,
    scheduledVisitList,
    tempCheckedWeek,
    completedSVGList,
    tempCompletedWeek,
    setInProgressWeek,
    tempInProgress
) => {
    if (
        item.Start_Date__c &&
        item.Status__c !== VisitListStatus.CANCELLED &&
        item.Status__c !== VisitListStatus.FAILED
    ) {
        if (item.Status__c === VisitListStatus.ACCEPTED) {
            scheduledVisitList.push(item)
            if (moment(item.Start_Date__c).day(SUNDAY_NUM).isSame(new Date(), MOMENT_STARTOF.WEEK)) {
                tempCheckedWeek.push(t.labels.PBNA_MOBILE_THIS_WEEK.toUpperCase())
            } else {
                tempCheckedWeek.push(moment(item.Start_Date__c).day(SUNDAY_NUM).format(TEXT_FORMAT_TYPE_MD))
            }
        }
        if (
            item.Status__c === VisitListStatus.COMPLETED &&
            moment(item.Start_Date__c)
                .day(SUNDAY_NUM)
                .isAfter(moment().subtract(Constants.ONE_WEEK, MOMENT_STARTOF.WEEK), MOMENT_STARTOF.WEEK)
        ) {
            completedSVGList.push(item)
            tempCompletedWeek.push(moment(item.Start_Date__c).day(SUNDAY_NUM).format(TEXT_FORMAT_TYPE_MD))
        }
        if (
            item.Status__c === VisitListStatus.IN_PROGRESS &&
            moment(item.Start_Date__c)
                .day(SUNDAY_NUM)
                .isAfter(moment().subtract(Constants.ONE_WEEK, MOMENT_STARTOF.WEEK), MOMENT_STARTOF.WEEK)
        ) {
            setInProgressWeek(true)
            tempInProgress.push(moment(item.Start_Date__c).day(SUNDAY_NUM).format(TEXT_FORMAT_TYPE_MD))
        }
    }
}

const getScheduleDateArray = (visitDate) => {
    if (!_.isEmpty(visitDate)) {
        return [
            visitDate.clone().day(SUNDAY_NUM).format(TIME_FORMAT.Y_MM_DD).toString(),
            visitDate.clone().day(SATURDAY_NUM).format(TIME_FORMAT.Y_MM_DD).toString()
        ]
    }
    return []
}

export const calSCHeights = (filterUnassignVisits, showStatusCard, height, heightHideCard, heightShowCard) => {
    let result = 0
    if (filterUnassignVisits.length > 0) {
        result = result + height
        if (!showStatusCard) {
            result = result + heightHideCard
        }
    }
    if (showStatusCard) {
        result = result + heightShowCard
    }
    return result + (CommonParam.locale === Locale.fr ? ScrollThreshold.SCROLL_UP_THRESHOLD : 0)
}

const queryVisitListStatus = async (params) => {
    const {
        dropDownRef,
        isGenerating,
        setCheckedWeek,
        setCompletedSVGList,
        updateVisitListId,
        updateScheduleDate,
        setCompletedWeek,
        setInProgressWeek,
        setPublishedSVGList,
        isCanceling
    } = params
    const scheduledVisitList = []
    const tempCheckedWeek = []
    const tempCompletedWeek = []
    const completedSVGList = []
    const tempInProgress = []
    setInProgressWeek(false)
    const recordTypeId = await getRecordTypeIdByDeveloperName('Schedule_Visit_Group', 'Visit_List__c')
    try {
        if (!isGenerating) {
            const result = await SoupService.retrieveDataFromSoup(
                'Visit_List__c',
                {},
                ScheduleQuery.retrieveVisitListData.f,
                ScheduleQuery.retrieveVisitListData.q +
                    ` WHERE {Visit_List__c:Location_Id__c}='${CommonParam.userLocationId}'
            AND {Visit_List__c:RecordTypeId}='${recordTypeId}'
            AND {Visit_List__c:Manager_Ad_Hoc__c}='0'
            ORDER BY {Visit_List__c:Start_Date__c}
            `
            )
            setInProgressWeek(false)
            result.forEach((item) => {
                computeStatus(
                    item,
                    scheduledVisitList,
                    tempCheckedWeek,
                    completedSVGList,
                    tempCompletedWeek,
                    setInProgressWeek,
                    tempInProgress
                )
            })
            if (!_.isEmpty(completedSVGList)) {
                updateVisitListId(completedSVGList[completedSVGList.length - 1].Id)
                updateScheduleDate(
                    getScheduleDateArray(moment(completedSVGList[completedSVGList.length - 1].Start_Date__c))
                )
            }
            setPublishedSVGList(scheduledVisitList)
            setCheckedWeek(tempCheckedWeek)
            setCompletedSVGList(isCanceling ? [] : completedSVGList)
            setCompletedWeek(isCanceling ? [] : tempCompletedWeek)
            return { scheduledVisitList, completedSVGList, tempInProgress }
        }
    } catch (err) {
        dropDownRef.current.alertWithType(
            DropDownType.ERROR,
            t.labels.PBNA_MOBILE_NEW_SCHEDULE_LIST_FAILED_TO_QUERY_VL,
            err
        )
    }
}

const onNewClick = async (params) => {
    const {
        setIsNewBtnClicked,
        setIsCanceled,
        setIsCompleted,
        setIsCancelBtnClicked,
        updateVisitListId,
        newScheduleModal,
        setScheduleDate,
        updateScheduleDate,
        dropDownRef,
        isGenerating,
        setCheckedWeek,
        setCompletedSVGList,
        completedSVGList,
        setCompletedWeek,
        setInProgressWeek,
        reviewSchedule,
        setIsUpdateLoading,
        setPublishedSVGList,
        resetSearchBar
    } = params
    const isNewBtn = _.isEmpty(_.cloneDeep(completedSVGList))
    setIsNewBtnClicked(true)
    setIsCanceled(false)
    setIsCompleted(false)
    setIsCancelBtnClicked(false)
    updateVisitListId('')
    resetSearchBar()
    setIsUpdateLoading(true)
    await syncDownDataByTableNames()
    setIsUpdateLoading(false)
    const startDay = moment()
    const allOpenWeek = []
    const res: any = await queryVisitListStatus({
        dropDownRef,
        isGenerating,
        setCheckedWeek,
        setCompletedSVGList,
        updateVisitListId,
        updateScheduleDate,
        setCompletedWeek,
        setInProgressWeek,
        setPublishedSVGList
    })
    if (!_.isEmpty(res.tempInProgress) && _.isEmpty(res.completedSVGList)) {
        setIsNewBtnClicked(false)
        return
    }
    if (!isNewBtn && _.isEmpty(res.completedSVGList)) {
        setIsNewBtnClicked(false)
        return
    }
    if (isNewBtn && !_.isEmpty(res.completedSVGList)) {
        setIsNewBtnClicked(false)
        return
    }
    for (let i = 0; i < NEXT_OPEN_WEEK; i++) {
        allOpenWeek.push(
            startDay.clone().add(i, MOMENT_UNIT.WEEKS).day(SATURDAY_NUM).format(FORMAT_DATE_STRING).toString()
        )
    }
    const existStartDate = []
    res?.scheduledVisitList?.forEach((item) => {
        const tmpData = moment(item.Start_Date__c).clone().day(SATURDAY_NUM).format(FORMAT_DATE_STRING).toString()
        if (allOpenWeek.indexOf(tmpData) >= 0 && existStartDate.indexOf(tmpData) < 0) {
            existStartDate.push(tmpData)
        }
    })
    let visitDate
    if (existStartDate.length === NEXT_OPEN_WEEK && _.isEmpty(completedSVGList)) {
        Alert.alert(t.labels.PBNA_MOBILE_NEW_SCHEDULE_LIST_LIMIT_REACHED)
        setIsNewBtnClicked(false)
    } else {
        if (existStartDate.length === 0) {
            visitDate = moment(allOpenWeek[0])
        } else {
            const tempOpenWeek = JSON.parse(JSON.stringify(allOpenWeek))
            existStartDate.forEach((item) => {
                tempOpenWeek.splice(tempOpenWeek.indexOf(item), 1)
            })
            visitDate = moment(tempOpenWeek[0])
        }
        setIsNewBtnClicked(false)
        setScheduleDate(visitDate.clone().day(SUNDAY_NUM).format(FORMAT_DATE_STRING).toString())
        if (_.isEmpty(completedSVGList)) {
            updateScheduleDate(getScheduleDateArray(visitDate))
        }
        if (!_.isEmpty(completedSVGList)) {
            reviewSchedule()
        } else {
            newScheduleModal.current.openModal()
        }
    }
}
const getMeetings = async (setMeetingList, dropDownRef, date, setMeetingHeadData) => {
    try {
        const { headData, list } = await getPubDayMeeting(date.format(FORMAT_DATE_STRING))
        setMeetingList([...list])
        setMeetingHeadData(headData)
        return list
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'NSL.getMeetings', getStringValue(error))
        dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_NEW_SCHEDULE_LIST_QUERY, error)
    }
}
export const getTotalMinus = (durationTime: any, travelTime: any) => {
    durationTime = durationTime ? Number(durationTime) : 0
    travelTime = travelTime ? Number(travelTime) : 0
    return durationTime + travelTime
}
const getUserVl = async (ids, startDate, endDate, dropDownRef) => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'Visit_List__c',
            {},
            ['Start_Date_Time__c', 'End_Date_Time__c', 'Status__c', 'plannedDate', 'Id', 'OwnerId'],
            `
            SELECT
            {Visit_List__c:Start_Date_Time__c},
            {Visit_List__c:End_Date_Time__c},
            {Visit_List__c:Status__c},
            {Visit_List__c:Visit_Date__c},
            {Visit_List__c:Id},
            {Visit_List__c:OwnerId}
            
            FROM {Visit_List__c} WHERE {Visit_List__c:OwnerId} IN (${getIdClause(ids)})
            AND {Visit_List__c:Visit_Date__c} >= date("${startDate}", 'start of day') 
            AND {Visit_List__c:Visit_Date__c} < date("${endDate}", 'start of day', '+1 day')
            AND {Visit_List__c:IsRemoved__c} = ${BooleanStr.STR_FALSE}
            AND ({Visit_List__c:Status__c} = '${VisitStatus.COMPLETED}'
            OR {Visit_List__c:Status__c} = '${VisitListStatus.IN_PROGRESS}') 
            `
        )
            .then((res) => {
                resolve(res)
            })
            .catch((error) => {
                reject(error)
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_NEW_SCHEDULE_LIST_FAILED_TO_QUERY_VL + error
                )
                storeClassLog(Log.MOBILE_ERROR, 'NSL.getUserVl', getStringValue(error))
            })
    })
}
const getTotalPlannedTimeByUnscheduleStatus = (user) => {
    return user.Unscheduled__c === '1' ? 0 : Math.trunc(user.Total_Planned_Time__c / CommonLabel.SIXTY_MINUTE)
}
const getEmployeeData = async (params) => {
    const {
        date,
        searchText,
        setEmployeeListLength,
        setOriginEmployeeList,
        setEmployeeList,
        setEmployeeMetrics,
        dropDownRef,
        setIsELoading,
        currentCardId = null,
        setMeetingList,
        setMeetingHeadData,
        eeSearchBar,
        setUnassignedRouteUsers
    } = params
    const meetingList = await getMeetings(setMeetingList, dropDownRef, date, setMeetingHeadData)
    const userIdsWhoHasMeeting = []
    meetingList?.forEach((meeting: any) => {
        for (const ownerId of meeting.childOwnerIdArr) {
            if (!userIdsWhoHasMeeting.includes(ownerId)) {
                userIdsWhoHasMeeting.push(ownerId)
            }
        }
    })
    const currentPublishedSVG = store.getState().manager.publishedSVGList.find((item) => {
        return moment(date).clone().day(SUNDAY_NUM).isSame(moment(item.Start_Date__c), MOMENT_STARTOF.DAY)
    })
    const unassignedRouteUsers = await getUnassignedRouteUserByDate(date.format(FORMAT_DATE_STRING))
    setUnassignedRouteUsers(unassignedRouteUsers)
    await SoupService.retrieveDataFromSoup(
        'User',
        {},
        ScheduleQuery.getEmployeeQuery.f,
        formatString(ScheduleQuery.getEmployeeQuery.q, [CommonParam.userLocationId, date.format(FORMAT_DATE_STRING)])
    )
        .then(async (result: any) => {
            const items = []
            const tempMetrics = { completed: 0, inProgress: 0, yet2Start: 0 }
            const ids = []
            result.forEach((user) => {
                const plannedDate = moment(user.Visit_Date__c)
                if (
                    plannedDate >= date.clone().startOf(MOMENT_STARTOF.DAY) &&
                    plannedDate < date.clone().endOf(MOMENT_STARTOF.DAY)
                ) {
                    const item = {
                        id: user.Id,
                        name: user.Name,
                        storeName: user.StoreName,
                        AccountPhone: user.AccountPhone,
                        lineCode: user.LC_ID__c,
                        firstName: user.FirstName,
                        lastName: user.LastName,
                        VisitListId: user.Visit_List__c,
                        VisitListData: [],
                        VisitListIds: [],
                        gpid: user.GPID__c,
                        buid: user.BU_ID__c,
                        persona: user.PERSONA__c,
                        visits: [],
                        all: 0,
                        finished: 0,
                        status: '',
                        phone: user.MobilePhone,
                        MobilePhone: user.MobilePhone,
                        totalDuration: 0,
                        address: `${user.Street || ''}`,
                        storeLocation: user.Store_Location__c,
                        cityStateZip: `${user.City || ''}, ${user.State || ''}, ${user.PostalCode || ''} `,
                        userStatsId: user.UserStatsId,
                        plannedDate: user.Visit_Date__c,
                        title: user.Title,
                        ftFlag: user.FT_EMPLYE_FLG_VAL__c,
                        startTime: user.Start_Date_Time__c,
                        endTime: user.End_Date_Time__c,
                        totalPlannedTime: 0,
                        totalVisit: 0,
                        totalMiles: 0,
                        workedHours: 0,
                        WTDHours: 0,
                        isFavorited: user.Schedule_Favorited__c?.includes(CommonParam.userId),
                        isMyDirect: user.Manager_Directs__c?.includes(CommonParam.userId)
                    }

                    if (
                        !searchText ||
                        (item.name && item.name.toUpperCase().indexOf(searchText.toUpperCase()) >= 0) ||
                        (item.gpid && item.gpid.toUpperCase().indexOf(searchText.toUpperCase()) >= 0)
                    ) {
                        if (ids.indexOf(user.Id) < 0) {
                            // visit status
                            if (
                                (user.Status__c !== VisitStatus.CANCELLED && user.Status__c !== VisitStatus.PLANNED) ||
                                _.isEmpty(user.Status__c)
                            ) {
                                item.totalDuration =
                                    !_.isEmpty(user.Visits_Id) && user.Unscheduled__c === BooleanStr.STR_FALSE
                                        ? Number(user.Total_Planned_Time__c) || 0
                                        : 0
                                item.visits.push(user)
                            }
                            ids.push(user.Id)
                            item.VisitListIds.push(user.Visit_List__c)
                            item.VisitListData.push({
                                id: user.Visit_List__c,
                                status: user.Visit_List_Status,
                                startTime: user.Start_Date_Time__c,
                                endTime: user.End_Date_Time__c,
                                totalPlannedTime: getTotalPlannedTimeByUnscheduleStatus(user)
                            })
                            items.push(item)
                        } else {
                            items.forEach((it) => {
                                if (it.id === user.Id) {
                                    if (
                                        (user.Status__c !== VisitStatus.CANCELLED &&
                                            user.Status__c !== VisitStatus.PLANNED) ||
                                        _.isEmpty(user.Status__c)
                                    ) {
                                        it.visits.push(user)
                                    }
                                    if (it.VisitListIds.indexOf(user.Visit_List__c) < 0) {
                                        it.VisitListIds.push(user.Visit_List__c)
                                        it.VisitListData.push({
                                            id: user.Visit_List__c,
                                            status: user.Visit_List_Status,
                                            startTime: user.Start_Date_Time__c,
                                            endTime: user.End_Date_Time__c,
                                            totalPlannedTime: getTotalPlannedTimeByUnscheduleStatus(user)
                                        })
                                    }
                                }
                            })
                        }
                    }
                }
            })
            // Remove empty visit
            items &&
                items.forEach((item) => {
                    const tempVisits = item.visits.filter(({ VisitId }) => VisitId !== null)
                    item.visits = _.uniqBy(tempVisits, 'VisitId')
                    const finishedArr = item.visits.filter((i) => i.Status__c === VisitStatus.COMPLETE)
                    const allArr = item.visits.filter(
                        (i) => i.Status__c !== VisitStatus.CANCELLED && i.Status__c !== VisitStatus.PLANNED
                    )
                    item.all = allArr.length
                    item.finished = finishedArr.length
                    item.amas = []

                    allArr.forEach((result) => {
                        item.amas.push({
                            Status__c: result.Status__c,
                            AMAS_Compliant__c: result.AMAS_Compliant__c
                        })
                    })
                })
            // visit list status
            const visitIds = items.map((v) => v.id)
            const wtdVisitLists: any = await getUserVl(
                visitIds,
                date.clone().day(SUNDAY_NUM).format(FORMAT_DATE_STRING),
                date.format(FORMAT_DATE_STRING),
                dropDownRef
            )
            for (const item of items) {
                compositeMyDayVisitListStatus(item, tempMetrics, IN_PROGRESS, YET_2_START)

                item.landScapeEItemSelected = item.id === currentCardId

                // calculate the employeeCell metrics
                !_.isEmpty(item.visits) &&
                    item.visits.forEach((e) => {
                        item.totalMiles += Number(e.Planned_Mileage__c)
                        item.totalVisit++
                    })
                item.VisitListData.forEach((e) => {
                    if (moment(item.plannedDate).isAfter(date)) {
                        return
                    }
                    item.totalPlannedTime += e.totalPlannedTime
                    if (e.status === VisitStatus.COMPLETED) {
                        item.workedHours += getDurationTruncHours(e.startTime, e.endTime)
                    }
                    if (e.startTime && e.status === VisitStatus.IN_PROGRESS) {
                        item.workedHours += getDurationTruncHours(e.startTime)
                    }
                })

                if (!_.isEmpty(wtdVisitLists)) {
                    wtdVisitLists
                        .filter((v) => v.OwnerId === item.id)
                        .forEach((e) => {
                            if (moment(e.plannedDate).isAfter(date)) {
                                return
                            }
                            if (e.Status__c === VisitListStatus.COMPLETED) {
                                if (!_.isEmpty(e.Start_Date_Time__c) && !_.isEmpty(e.End_Date_Time__c)) {
                                    item.WTDHours += getDurationTruncHours(e.Start_Date_Time__c, e.End_Date_Time__c)
                                }
                            }
                            if (!_.isEmpty(e.Start_Date_Time__c) && e.Status__c === VisitStatus.IN_PROGRESS) {
                                if (!_.isEmpty(e.End_Date_Time__c)) {
                                    item.WTDHours += getDurationTruncHours(e.Start_Date_Time__c, e.End_Date_Time__c)
                                } else {
                                    item.WTDHours += getDurationTruncHours(e.Start_Date_Time__c)
                                }
                            }
                        })
                }
            }
            let renderItems = items.filter(
                (i) =>
                    (!_.isEmpty(currentPublishedSVG) ? i?.visits?.length >= 0 : i?.visits?.length > 0) ||
                    userIdsWhoHasMeeting.includes(i.id)
            )
            renderItems = _.unionBy(unassignedRouteUsers, renderItems, 'id')

            if (!searchText) {
                setEmployeeListLength(renderItems?.length || 0)
            }
            setOriginEmployeeList(renderItems)
            setEmployeeList(renderItems)
            setEmployeeMetrics(tempMetrics)
            eeSearchBar?.current?.onApplyClick(renderItems)
            setIsELoading(false)
            return renderItems
        })
        .catch((err) => {
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_NEW_SCHEDULE_LIST_FAILED_TO_QUERY_EE,
                err
            )
            return err
        })
}

const getCustomerData = async (params) => {
    const {
        date,
        setOriginCustomerList,
        setCustomerList,
        setCustomerMetrics,
        dropDownRef,
        setIsCLoading,
        setCustomerListLength,
        customerSearchBar
    } = params
    const dateStr = date.format(FORMAT_DATE_STRING)
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            ScheduleQuery.getPublishVisitList.f,
            formatString(
                ScheduleQuery.getPublishVisitList.baseQuery + ScheduleQuery.getPublishVisitList.myDayCondition,
                [dateStr, CommonParam.userLocationId]
            )
        )
            .then((re: any[]) => {
                let result = _.unionBy(re, 'Id')
                const tempMetrics = { completed: 0, inProgress: 0, yet2Start: 0 }
                const tempVisitList = []
                result = result.filter((visit) => {
                    return visit.Planned_Date__c === dateStr
                })
                result.forEach((item) => {
                    if (item.status === VisitStatus.COMPLETE) {
                        tempMetrics.completed++
                    } else if (item.status === VisitStatus.IN_PROGRESS) {
                        tempMetrics.inProgress++
                    } else if (item.status === VisitStatus.PUBLISHED) {
                        tempMetrics.yet2Start++
                    }
                    const address = JSON.parse(item.ShippingAddress)
                    item.cityStateZip = `${address?.city ? address?.city + ', ' : ''}${
                        address?.state ? address?.state : ''
                    }${address?.postalCode ? ' ' + address?.postalCode : ''} `
                    item.address = address?.street || ''
                    item.Subject = item.name
                    item.SubType__c = item.SubType
                    item.StartDateTime = item.PlanStartTime
                    item.EndDateTime = item.PlanEndTime
                    item.PlannedVisitStartTime = item.PlanStartTime
                    item.Actual_Start_Time__c = item.ActualVisitStartTime
                    item.Actual_End_Time__c = item.ActualVisitEndTime
                    item.inLocation = item.InLocation === BooleanStr.STR_TRUE
                    item.salesRoute = item.LOCL_RTE_ID__c
                    item.nrid = item.GTMU_RTE_ID__c
                    item.repName = _.isEmpty(item.Sales_Rep_Info__c) ? null : JSON.parse(item.Sales_Rep_Info__c).Name
                    if (item.SubType === VisitType.VISIT && item.ActualVisitStartTime && !item.ActualVisitEndTime) {
                        item.clockTime = getClockTime(item, result, MOMENT_UNIT.MINUTES)
                    }
                    item.showNew = item.Manager_Ad_Hoc__c === BooleanStr.STR_TRUE
                    item.showNewHollow = item.AdHoc === BooleanStr.STR_TRUE
                    item.unassignedRoute = !_.isEmpty(item.Route_Group__c)
                    tempVisitList.push(item)
                })
                setCustomerListLength(tempVisitList.length)
                getDeliveryFooter(tempVisitList, date).then((res: any) => {
                    res.forEach((r) => {
                        const v = tempVisitList.find((val) => val.storeId === r.visitId)
                        if (v) {
                            v.deliveryInfo = r
                        }
                    })
                    const newList = [...tempVisitList]
                    setCustomerMetrics(tempMetrics)
                    setOriginCustomerList(newList)
                    setCustomerList(newList)
                    customerSearchBar?.current?.onApplyClick(newList)
                    setIsCLoading(false)
                    resolve(tempVisitList)
                })
            })
            .catch((err) => {
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_NEW_SCHEDULE_LIST_FAILED_TO_QUERY_VISIT,
                    err
                )
                reject(err)
            })
    })
}

const cancelGenerateWithParams = (params) => {
    const {
        visitListId,
        setIsCancelBtnClicked,
        setIsCanceling,
        setIsCompleted,
        setDisableCancelBtn,
        setIsGenerating,
        dropDownRef,
        setIsCanceled,
        setIsRestartInterval,
        setIsUpdateLoading
    } = params
    const body = { scheduleVisitListId: visitListId }
    setIsCancelBtnClicked(true)
    Alert.alert(t.labels.PBNA_MOBILE_NEW_SCHEDULE_LIST_CANCEL, '', [
        {
            text: t.labels.PBNA_MOBILE_YES,
            onPress: () => {
                setIsCanceling(true)
                setIsCompleted(false)
                setDisableCancelBtn(true)
                if (!visitListId) {
                    return
                }
                removeDataOnCancelClick(visitListId, dropDownRef)
                cancelGeneratingSchedule(body)
                    .then(() => {
                        setIsCanceled(true)
                        setIsCanceling(false)
                        setIsGenerating(false)
                        setDisableCancelBtn(false)
                    })
                    .catch((err) => {
                        dropDownRef.current.alertWithType(
                            DropDownType.INFO,
                            t.labels.PBNA_MOBILE_NEW_SCHEDULE_LIST_FAILED_TO_CANCEL_SCHEDULE,
                            t.labels.PBNA_MOBILE_PLEASE_TRY_AGAIN_IN_RNS_LATER
                        )
                        setIsRestartInterval(true)
                        setIsCancelBtnClicked(false)
                        setIsUpdateLoading(false)
                        setIsGenerating(true)
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'cancelGenerateSchedule',
                            `cancelGenerateSchedule: ${getStringValue(err)}`
                        )
                    })
            }
        },
        {
            text: t.labels.PBNA_MOBILE_NO,
            onPress: () => {
                setDisableCancelBtn(false)
                setIsRestartInterval(true)
                setIsCancelBtnClicked(false)
                setIsGenerating(true)
            }
        }
    ])
}

const isShowStatusCard = (manager, activeTab, employeeListLength, customerListLength) => {
    const isToday =
        moment(manager.selectedDate || moment()).format(FORMAT_DATE_STRING) <= moment().format(FORMAT_DATE_STRING)
    if (activeTab === ACTIVE_TAB_1) {
        return employeeListLength > 0 && isToday
    } else if (activeTab === ACTIVE_TAB_2) {
        return customerListLength > 0 && isToday
    }
}

let clickToCellDetail = false
const NewScheduleList = ({ navigation, setIsLandscapePage, cRef }: NewScheduleListProps) => {
    const isFocused = useIsFocused()
    const [activeTab, setActiveTab] = useState(ACTIVE_TAB_1)
    const initialMetrics = { yet2Start: 0, inProgress: 0, completed: 0 }
    const [employeeMetrics, setEmployeeMetrics] = useState(initialMetrics)
    const [originEmployeeList, setOriginEmployeeList] = useState([])
    const [employeeList, setEmployeeList] = useState([])
    const [customerMetrics, setCustomerMetrics] = useState(initialMetrics)
    const [originCustomerList, setOriginCustomerList] = useState([])
    const [customerList, setCustomerList] = useState([])
    const [unassignVisits, setUnassignVisits] = useState([])
    const [unassignCustomerList, setUnassignCustomerList] = useState([])
    const [isUpdateLoading, setIsUpdateLoading] = useState(false)
    const eFlatListRef = useRef<FlatList>()
    const cFlatListRef = useRef<FlatList>()
    const newScheduleModal: any = useRef()
    const [isGenerating, setIsGenerating] = useState(false)
    const [scheduleDate, setScheduleDate] = useState('')
    const [isRestartInterval, setIsRestartInterval] = useState(false)
    const [isNewBtnClicked, setIsNewBtnClicked] = useState(false)
    const [disableCancelBtn, setDisableCancelBtn] = useState(false)
    const [isListView, setListView] = useState(true)
    const { dropDownRef } = useDropDown()
    const eeSearchBar: any = useRef()
    const customerSearchBar: any = useRef()
    const topSwipeCollapsibleRef: any = useRef()
    const downSwipeCollapsibleRef: any = useRef()
    const [, setMapModalVisible] = useState(false)
    const manager = useSelector(managerReducer)
    const isCompleted = manager.isCompleted
    const visitListId = manager.visitListId
    const dispatch = useDispatch()
    const updateScheduleDate = compose(dispatch, managerAction.setScheduleDate)
    const updateVisitListId = compose(dispatch, managerAction.setVisitListId)
    const setIsCompleted = compose(dispatch, managerAction.setIsCompleted)
    const setIsCanceled = compose(dispatch, managerAction.setIsCanceled)
    const setIsCanceling = compose(dispatch, managerAction.setIsCanceling)
    const setIsCancelBtnClicked = compose(dispatch, managerAction.setIsCancelBtnClicked)
    const updateLocationInfo = compose(dispatch, managerAction.setUserLocationInfo)
    const updateIsInCanada = compose(dispatch, managerAction.setIsInCanada)
    const [activeWeek, setActiveWeek] = useState(Constants.THIS_WEEK_LABEL_INDEX)
    const [activeDay, setActiveDay] = useState(null)
    const [weekArr, setWeekArr] = useState(null)
    const [checkedWeek, setCheckedWeek] = useState([])
    const [completedWeek, setCompletedWeek] = useState([])
    const [inProgressWeek, setInProgressWeek] = useState(false)
    const [employeeListLength, setEmployeeListLength] = useState(0)
    const [customerListLength, setCustomerListLength] = useState(0)
    const [meetingList, setMeetingList] = useState([])
    const [showMeeting, setShowMeeting] = useState(true)
    const [meetingHeadData, setMeetingHeadData] = useState({})
    const [meetingDeletedModalVisible, setMeetingDeletedModalVisible] = useState(false)
    const [swipeableRows, setSwipeableRows] = useState({})
    const [isELoading, setIsELoading] = useState(false)
    const [isCLoading, setIsCLoading] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [isLandScape, setIsLandScape] = useState(false)
    const [shouldFilterReset, setShouldFilterReset] = useState(false)
    const [currentCardId, setCurrentCardId] = useState(null)
    const [currentOrientation, setOrientation] = useState(PORTRAIT)
    const [formateCurrentDate, setFormateCurrentDate] = useState(null)
    const [dropDownModalVisible, setDropDownModalVisible] = useState(false)
    const [locationModalVisible, setLocationModalVisible] = useState(false)
    const [exportModalVisible, setExportModalVisible] = useState(false)
    const [locationAddSuccessModalVisible, setLocationAddSuccessModalVisible] = useState(false)
    const [showLocation, setShowLocation] = useState(false)
    const [isErrorShow, setIsErrorShow] = useState(false)
    const [errorMsgType, setErrorMsgType] = useState(DataCheckMsgIndex.COMMON_MSG)
    const scrollViewRef = useRef<FlatList>()
    const setCompletedSVGList = compose(dispatch, managerAction.setCompletedSVGList)
    const setPublishedSVGList = compose(dispatch, managerAction.setPublishedSVGList)
    const getLineCodeMap = compose(dispatch, managerAction.getLineCodeMap)
    const completedSVGList = store.getState().manager.completedSVGList
    const isReadOnly = CommonParam.PERSONA__c !== Persona.MERCH_MANAGER
    const [, setUnassignedRouteUsers] = useState([])
    const [visitStatusArr, setVisitStatusArr] = useState([])
    const [showFavorites, setShowFavorites] = useState(false)

    const showStatusCard =
        isShowStatusCard(manager, activeTab, employeeListLength, customerListLength) &&
        (isPersonaMerchManager() || isPersonaUGM())

    const [isListExpended, setIsListExpended] = useState(false)
    const [lastOffset, setLastOffset] = useState(0)

    useEffect(() => {
        getUserCityName(updateIsInCanada)
        getLineCodeMap()
        getFavoriteBarOpenStatus(setShowFavorites)
    }, [])

    const cancelGenerate = () => {
        cancelGenerateWithParams({
            visitListId,
            setIsCancelBtnClicked,
            setIsCanceling,
            setIsCompleted,
            setDisableCancelBtn,
            setIsGenerating,
            dropDownRef,
            setIsCanceled,
            setIsRestartInterval,
            setIsUpdateLoading
        })
    }

    const reviewSchedule = () => {
        setIsGenerating(false)
        setIsCompleted(false)
        setIsCanceled(false)
        navigation.navigate(NavigationRoute.REVIEW_NEW_SCHEDULE, {
            visitListId: visitListId
        })
    }

    const { toExpend, toInitialPosition } = handleSwipeCollapsibleRef(
        topSwipeCollapsibleRef,
        downSwipeCollapsibleRef,
        navigation,
        cRef
    )

    useEffect(() => {
        if ((isUpdateLoading || isELoading) && isListExpended) {
            if (clickToCellDetail) {
                clickToCellDetail = false
            } else {
                setIsListExpended(false)
                !isELoading && scrollViewRef?.current?.scrollToOffset({ offset: 0, animated: false })
                toInitialPosition()
            }
        }
    }, [isUpdateLoading, isELoading])

    const resetSearchBar = () => {
        if (activeTab === ACTIVE_TAB_1) {
            eeSearchBar?.current?.onResetClick()
        } else {
            customerSearchBar?.current?.onResetClick()
        }
    }

    const refreshUtil = async (val, refreshFunc?) => {
        try {
            setIsUpdateLoading(true)
            if (!clickToCellDetail) {
                if (val === ACTIVE_TAB_1) {
                    setOriginEmployeeList([])
                    setEmployeeList([])
                    setEmployeeMetrics(initialMetrics)
                    setMeetingList([])
                    setMeetingHeadData({})
                } else {
                    setOriginCustomerList([])
                    setCustomerList([])
                    setCustomerMetrics(initialMetrics)
                }
            }

            if (refreshFunc) {
                await refreshFunc(store.getState().manager.selectedDate)
            }
            await queryVisitListStatus({
                dropDownRef,
                isGenerating,
                setCheckedWeek,
                setCompletedSVGList,
                updateVisitListId,
                updateScheduleDate,
                setCompletedWeek,
                setInProgressWeek,
                setPublishedSVGList,
                isCanceling: store.getState().manager.isCanceling
            })
            if (val === ACTIVE_TAB_1) {
                await getEmployeeData({
                    date: store.getState().manager.selectedDate || moment(),
                    searchText,
                    setEmployeeListLength,
                    setOriginEmployeeList,
                    setEmployeeList,
                    setEmployeeMetrics,
                    dropDownRef,
                    setIsELoading,
                    setMeetingList,
                    setMeetingHeadData,
                    eeSearchBar,
                    setUnassignedRouteUsers
                })
            } else {
                await getCustomerData({
                    date: store.getState().manager.selectedDate || moment(),
                    setOriginCustomerList,
                    setCustomerList,
                    setCustomerMetrics,
                    dropDownRef,
                    setIsCLoading,
                    setCustomerListLength,
                    customerSearchBar
                })
            }
            await getUnassignedVisits({
                date: store.getState().manager.selectedDate || moment(),
                setIsCLoading,
                setUnassignVisits,
                setUnassignCustomerList
            })
            !store.getState().manager.isCanceling && setIsUpdateLoading(false)
        } catch (error) {
            setIsUpdateLoading(false)
            dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_REFRESH_MANAGER_FAILED + error)
            storeClassLog(Log.MOBILE_ERROR, 'NSL.refreshUtil', getStringValue(error))
        }
    }

    const onTabChange = async (active) => {
        await refreshUtil(active, getData)
        !store.getState().manager.isCanceling && setIsUpdateLoading(false)
    }

    const handleSwitchView = async () => {
        setListView(!isListView)
        if (!isUpdateLoading) {
            if (isListView && activeTab === ACTIVE_TAB_1) {
                if (currentOrientation === LANDSCAPE_RIGHT || currentOrientation === LANDSCAPE_LEFT) {
                    setIsLandScape(true)
                    setIsLandscapePage && setIsLandscapePage(true)
                } else if (currentOrientation === PORTRAIT || currentOrientation === PORTRAIT_UPSIDEDOWN) {
                    setIsLandScape(false)
                    setIsLandscapePage && setIsLandscapePage(false)
                }
            } else {
                setIsLandScape(false)
                setIsLandscapePage && setIsLandscapePage(false)
            }
        }
    }

    const initDataQuery = async () => {
        await onTabChange(activeTab)
        setShowMeeting(true)
        setShowLocation(true)
    }

    const deltaSync = async (val?) => {
        await refreshUtil(val || activeTab, getData)
        await queryVisitListStatus({
            dropDownRef,
            isGenerating,
            setCheckedWeek,
            setCompletedSVGList,
            updateVisitListId,
            updateScheduleDate,
            setCompletedWeek,
            setInProgressWeek,
            setPublishedSVGList,
            isCanceling: store.getState().manager.isCanceling
        })
        setShowLocation(true)
    }

    useEffect(() => {
        setLoggedInUserTimezone()
        isFocused && initDataQuery()
    }, [isFocused, isListView, manager.isCanceling])

    useEffect(() => {
        if (showLocation && isPersonaMerchManager()) {
            updateLocationInfoInCopilot(updateLocationInfo).then((hasNoLocation) => {
                hasNoLocation && setLocationModalVisible(true)
            })
        }
    }, [showLocation])

    useDeviceOrientationChange((o) => {
        if (!isUpdateLoading) {
            if (activeTab === ACTIVE_TAB_1) {
                setOrientation(o)
                if (!isListView) {
                    if (o === LANDSCAPE_RIGHT || o === LANDSCAPE_LEFT) {
                        setIsLandScape(true)
                        setIsLandscapePage && setIsLandscapePage(true)
                    } else if (o === PORTRAIT || o === PORTRAIT_UPSIDEDOWN) {
                        setIsLandScape(false)
                        setIsLandscapePage && setIsLandscapePage(false)
                    }
                } else {
                    setIsLandScape(false)
                    setIsLandscapePage && setIsLandscapePage(false)
                }
            }
        }
    })

    useEffect(() => {
        if (activeTab === ACTIVE_TAB_1 && isFocused) {
            if (!isListView && !isUpdateLoading) {
                if (currentOrientation === LANDSCAPE_RIGHT) {
                    Orientation.lockToLandscapeRight()
                    DeviceEventEmitter.emit(DeviceEvent.IS_LANDSCAPE_MODE, true)
                } else if (currentOrientation === LANDSCAPE_LEFT) {
                    Orientation.lockToLandscapeLeft()
                    DeviceEventEmitter.emit(DeviceEvent.IS_LANDSCAPE_MODE, true)
                } else if (currentOrientation === PORTRAIT || currentOrientation === PORTRAIT_UPSIDEDOWN) {
                    Orientation.lockToPortrait()
                    DeviceEventEmitter.emit(DeviceEvent.IS_LANDSCAPE_MODE, false)
                }
            } else {
                Orientation.lockToPortrait()
                DeviceEventEmitter.emit(DeviceEvent.IS_LANDSCAPE_MODE, false)
            }
        }
    }, [isListView, currentOrientation, activeTab, isFocused])

    useEffect(() => {
        AsyncStorage.getItem(MyDayStatusOrder.MERCH).then((sortStatus) => {
            if (sortStatus) {
                setVisitStatusArr(JSON.parse(sortStatus))
            }
        })
    }, [])

    const onSelectedWeek = (weekIndex) => {
        setActiveWeek(weekIndex)
    }

    const onSelectedDay = async (dayIndex) => {
        if (activeTab === ACTIVE_TAB_1) {
            eeSearchBar?.current?.onResetClick()
        }
        setActiveDay(dayIndex)
        await deltaSync()
    }

    const setTmpWeekArr = (arrData) => {
        setWeekArr(arrData)
    }

    const handelSelectedDay = () => {
        onSelectedWeek(activeWeek)
        onSelectedDay(activeDay)
    }

    const renderStatusBar = (item) => {
        const topMetrics = activeTab === ACTIVE_TAB_1 ? employeeMetrics : customerMetrics
        return renderStatusBarItem(item, topMetrics)
    }

    const changeLocalSortArr = (item) => {
        updateLocalStatusSortArr(item, setVisitStatusArr, MyDayStatusOrder.MERCH)
    }

    const sortECByStatusArr = () => {
        return sortListByStatusArr(
            activeTab,
            ACTIVE_TAB_1,
            employeeList,
            customerList,
            visitStatusArr,
            originEmployeeList
        )
    }
    const { wholeArr, favoriteEmployees } = sortECByStatusArr()

    const renderVisitStatusCard = () => {
        return (
            <View style={styles.statusCard}>
                <DragSortableView
                    parentWidth={428}
                    dataSource={visitStatusArr}
                    keyExtractor={(item) => item.status}
                    renderItem={renderStatusBar}
                    childrenHeight={40}
                    childrenWidth={120}
                    onDataChange={changeLocalSortArr}
                    onDragEnd={sortECByStatusArr}
                    marginChildrenRight={12}
                />
            </View>
        )
    }

    const onAddClick = async (index) => {
        setDropDownModalVisible(!dropDownModalVisible)
        resetSearchBar()
        if (index === 0) {
            setIsUpdateLoading(true)
            await syncDownDataByTableNames()
            const selectedDay = manager.selectedDate || moment()
            navigation?.navigate(NavigationRoute.ADD_A_VISIT, {
                isESchedule: false,
                isPublished: true,
                planDate: moment(selectedDay).isBefore(moment()) ? moment() : selectedDay
            })
            setIsUpdateLoading(false)
        } else if (index === 1) {
            navigateToAddMeeting({
                routerParams: { isReadOnly: false },
                setIsLoading: setIsUpdateLoading,
                navigation,
                dropDownRef
            })
        }
    }

    const onMoreButtonClick = () => {
        setExportModalVisible(!exportModalVisible)
        navigation?.navigate(NavigationRoute.EXPORT_SCHEDULE, {
            isPublished: true,
            employeePublish: true
        })
    }

    const isDayAfterToday = (item) => {
        if (!_.isEmpty(item)) {
            return moment(moment().format(FORMAT_DATE_STRING)).isBefore(item.plannedDate, 'day')
        }
    }

    const onUnassignedRouteCardClick = async (item) => {
        try {
            clickToCellDetail = true
            navigation?.navigate(NavigationRoute.EMPLOYEE_SCHEDULE_LIST, {
                navigation: navigation,
                employeeData: item,
                selectedWeek: activeWeek,
                selectedDay: activeDay,
                tmpWeekArr: weekArr
            })
        } catch (error) {
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_NEW_SCHEDULE_LIST_REFRESH_MANAGER,
                error
            )
            setIsUpdateLoading(false)
        }
    }

    const renderEItem = ({ item, index }) => {
        const isLastItem = index === favoriteEmployees.length - 1
        if (item.unassignedRoute) {
            return (
                <UnassignedRouteCell
                    item={item}
                    manager={manager}
                    onCellPress={() => onUnassignedRouteCardClick(item)}
                />
            )
        }
        return (
            <EmployeeCell
                itemKey={item?.id}
                isLastItem={isLastItem}
                hasCallIcon
                item={item}
                index={index}
                navigation={navigation}
                isFuture={isDayAfterToday(item)}
                onCellPress={() => onUnassignedRouteCardClick(item)}
            />
        )
    }

    const renderLandScapeEItem = ({ item, index }) => {
        return (
            <EmployeeCell
                itemKey={item?.id}
                hasCallIcon
                isLandScape
                item={item}
                index={index}
                navigation={navigation}
                onCellPress={(val) => {
                    employeeList.forEach((element) => {
                        if (element.id === val.id) {
                            element.landScapeEItemSelected = !val.landScapeEItemSelected
                        } else {
                            element.landScapeEItemSelected = false
                        }
                    })
                    setMapModalVisible(false)
                    setEmployeeList([...employeeList])

                    if (val.landScapeEItemSelected === false) {
                        setCurrentCardId(null)
                    } else {
                        setCurrentCardId(val.id)
                    }
                }}
            />
        )
    }

    const onRemoveMeetingClick = (item) => {
        deleteMeetingAlert(
            async () => {
                setIsUpdateLoading(true)
                const modified = await checkSVGDataModifiedById(item.VisitListId, setErrorMsgType, setIsErrorShow)
                if (modified) {
                    setIsUpdateLoading(false)
                    return
                }
                const eventIds = [item.Id, ...item.chMeetingIdArr]
                const plannedDateStr = moment(item.StartDateTime).format(FORMAT_DATE_STRING)
                const vlDataCheck = await checkMeetingDataCheck(
                    eventIds,
                    item.childOwnerIdArr,
                    plannedDateStr,
                    null,
                    setIsUpdateLoading
                )
                if (!vlDataCheck) {
                    setIsUpdateLoading(false)
                    setErrorMsgType(DataCheckMsgIndex.COMMON_MSG)
                    setIsErrorShow(true)
                    return
                }
                await handleDeleteMeeting({
                    EventIds: [item.Id, ...item.chMeetingIdArr],
                    SoupEntryIds: [item.SoupEntryId, ...item.chSoupEntryIdArr],
                    dropDownRef,
                    scheduleVisitListId: item.VisitListId,
                    isFromPublished: true,
                    setIsLoading: null
                })
                setShowMeeting(!showMeeting)
                await getData(store.getState().manager.selectedDate)
                await getEmployeeData({
                    date: manager.selectedDate || moment(),
                    searchText,
                    setEmployeeListLength,
                    setOriginEmployeeList,
                    setEmployeeList,
                    setEmployeeMetrics,
                    dropDownRef,
                    setIsELoading,
                    setMeetingList,
                    setMeetingHeadData,
                    eeSearchBar,
                    setUnassignedRouteUsers
                })
                setIsUpdateLoading(false)
                setMeetingDeletedModalVisible(true)
            },
            () => closeAllOpenRow(swipeableRows)
        )
    }

    const duplicateBtnClick = (item) => {
        duplicateMeeting({
            navigation,
            item,
            meetingList,
            closeOtherRows,
            isRNSMeeting: false,
            dateOptions: '',
            setIsLoading: setIsUpdateLoading,
            dropDownRef
        })
    }

    const resetEmployeeFilter = () => {
        setShouldFilterReset(true)
    }

    const meetingItemClick = async (item) => {
        setSwipeableRows({ ...swipeableRows })
        meetingOnClick({
            setIsLoading: setIsUpdateLoading,
            routerParams: { Id: item.Id, isReadOnly: true },
            navigation,
            dropDownRef
        })
    }

    const checkIfDeleteDisabled = (val) => {
        return moment(val.StartDateTime).isBefore(new Date()) || !_.isEmpty(val.ChildActualStartTime)
    }

    const renderMeetingItem = (meetingListData) => {
        return _.map(meetingListData, (item) => {
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
                    key={item.Id}
                    swipeableRows={swipeableRows}
                    closeOtherRows={closeOtherRows}
                    showBorderRadius={false}
                    params={item}
                    swipeButtonConfig={swipeButtonProps}
                >
                    <MeetingItem key={item.Id} item={item} fromNewSchedule onPress={meetingItemClick} />
                </SwipeableRow>
            )
        })
    }

    const handleCustomerSchedulePress = async (tempId) => {
        try {
            setIsUpdateLoading(true)
            let tempData = {}
            const temp: any = await getCustomerData({
                date: manager.selectedDate || moment(),
                setOriginCustomerList,
                setCustomerList,
                setCustomerMetrics,
                dropDownRef,
                setIsCLoading,
                setCustomerListLength,
                customerSearchBar
            })
            temp.forEach((val) => {
                if (val.Id === tempId) {
                    tempData = val
                }
            })
            setIsUpdateLoading(false)
            if (!_.isEmpty(tempData)) {
                clickToCellDetail = true
                navigation.navigate(NavigationRoute.VISIT_DETAILS, {
                    item: tempData,
                    isFromMyDay: true
                })
            }
        } catch (error) {
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_NEW_SCHEDULE_LIST_REFRESH_MANAGER,
                error
            )
            setIsUpdateLoading(false)
        }
    }

    const renderCItem = ({ item }) => {
        const cellItem = item || {}
        const cellType = item.SubType !== VisitType.VISIT
        cellItem.fromScheduleCustomer = true
        if (cellType) {
            return <View />
        }
        return (
            <ScheduleVisitCard
                navigation={navigation}
                item={cellItem}
                deliveryInfo={cellItem.deliveryInfo || {}}
                withoutCallIcon
                hasUserInfo
                isVisitList
                isAddVisit={false}
                hideSequence
                fromEmployeeSchedule
                handleCustomerSchedulePress={() => handleCustomerSchedulePress(item.Id)}
            />
        )
    }

    const renderEERefresh = () => {
        return (
            <RefreshControlM
                loading={isELoading}
                refreshAction={async () => {
                    setIsELoading(true)
                    await refreshManager()
                    await queryVisitListStatus({
                        dropDownRef,
                        isGenerating,
                        setCheckedWeek,
                        setCompletedSVGList,
                        updateVisitListId,
                        updateScheduleDate,
                        setCompletedWeek,
                        setInProgressWeek,
                        setPublishedSVGList
                    })
                    await getEmployeeData({
                        date: manager.selectedDate || moment(),
                        searchText,
                        setEmployeeListLength,
                        setOriginEmployeeList,
                        setEmployeeList,
                        setEmployeeMetrics,
                        dropDownRef,
                        setIsELoading,
                        setMeetingList,
                        setMeetingHeadData,
                        eeSearchBar,
                        setUnassignedRouteUsers
                    })
                    await getUnassignedVisits({
                        date: manager.selectedDate || moment(),
                        setIsELoading,
                        setUnassignVisits,
                        setUnassignCustomerList
                    })
                }}
            />
        )
    }

    const renderListEmptyView = () => {
        return (
            <View style={styles.alignCenter}>
                <EmptyImage style={styles.emptyImg} />
                <CText style={styles.emptyText}>{t.labels.PBNA_MOBILE_NO_VISITS_HAVE_BEEN}</CText>
                <CText style={styles.emptyText}>{t.labels.PBNA_MOBILE_SCHEDULED_FOR_THIS_DAY}</CText>
            </View>
        )
    }

    const renderSVGInProgressView = () => {
        return (
            <View style={styles.alignCenter}>
                <Image source={IMG_GEN_SCHEDULE} style={styles.inProgressImg} />
                <CText style={[styles.emptyText, styles.MB_20]}>
                    {t.labels.PBNA_MOBILE_DRAFT_SCHEDULE_IN_PROGRESS}
                </CText>
                <CText style={styles.emptySubText}>{t.labels.PBNA_MOBILE_HAVE_DRAFT_SCHEDULE_IN_PROGRESS}</CText>
                <CText style={styles.emptySubText}>{t.labels.PBNA_MOBILE_TAP_DRAFT_BUTTON}</CText>
                <CText style={styles.emptySubText}>{t.labels.PBNA_MOBILE_VIEW_EDIT}</CText>
            </View>
        )
    }

    const toViewVisits = async () => {
        resetSearchBar()
        unassignCustomerList?.forEach((store) => {
            for (const key in store.visits) {
                store?.visits[key].forEach((visit) => {
                    if (moment(visit?.date).isBefore(moment().format(TIME_FORMAT.Y_MM_DD))) {
                        visit.canSelect = false
                    }
                })
            }
        })
        const selectedDay = _.isEmpty(weekArr) ? moment().format(FORMAT_DATE_STRING) : weekArr[activeDay]?.fullYearDate
        navigation?.navigate(NavigationRoute.UNASSIGN_VISIT, {
            originData: unassignCustomerList,
            isFromMyDay: true,
            selectedDay: selectedDay,
            employeeScheduleParams: {
                employeeData: {},
                selectedWeek: activeWeek,
                selectedDay: activeDay,
                tmpWeekArr: weekArr
            }
        })
    }

    const filterUnassignVisit = () => {
        const tmp = store.getState().manager.selectedDate || moment()
        const selectedDate = moment(tmp).format(FORMAT_DATE_STRING)
        return unassignVisits.filter((visit) => {
            return visit.date === selectedDate
        })
    }

    const sundays = getScheduleTotalSundays()
    const getListEmptyComponent = () => {
        if (completedSVGList?.length > 0 && sundays.indexOf(completedWeek[0]) === activeWeek) {
            return renderSVGInProgressView()
        }
        return renderListEmptyView()
    }

    const onTabClick = async (val) => {
        setActiveTab(val)
        eeSearchBar?.current?.onResetClick()
        customerSearchBar?.current?.onResetClick()
        await deltaSync(val)
        setIsUpdateLoading(false)
    }

    const getNewBtnShow = () => {
        return _.isEmpty(completedSVGList) || (inProgressWeek && _.isEmpty(completedSVGList))
    }

    const getDraftButton = () => {
        return !_.isEmpty(completedSVGList)
    }

    const getBtnDisabled = () => {
        return (
            isGenerating ||
            (isCompleted && !manager.isCanceled) ||
            isNewBtnClicked ||
            manager.isCanceling ||
            (inProgressWeek && _.isEmpty(completedSVGList))
        )
    }

    const getIconDisabled = () => {
        return _.isEmpty(completedSVGList) && getBtnDisabled()
    }

    const renderFavoriteHeaderAndMeeting = useMemo(() => {
        return (
            <View>
                {meetingList.length > 0 && (
                    <MeetingHeader
                        isPub
                        data={meetingHeadData}
                        onPress={() => {
                            setShowMeeting(!showMeeting)
                            closeAllOpenRow(swipeableRows)
                        }}
                        showMeeting={showMeeting}
                    />
                )}
                <View style={commonStyle.flexGrow_0}>
                    <ScrollView>
                        <Collapsible collapsed={showMeeting}>{renderMeetingItem(meetingList)}</Collapsible>
                    </ScrollView>
                </View>
                <FavoriteBar
                    count={favoriteEmployees?.length}
                    isOpen={showFavorites}
                    onClick={() => setFavoriteBarOpenStatus(setShowFavorites, showFavorites)}
                />
                {showFavorites && (
                    <SwipeToDo
                        isUndo
                        allData={employeeList}
                        listData={favoriteEmployees}
                        setListData={setEmployeeList}
                        renderItem={renderEItem}
                        renderHiddenItem={renderRemoveFavoriteHiddenItem}
                        swipeCallback={handleFavoriteEmployee}
                        setIsLoading={setIsUpdateLoading}
                        style={[styles.favoriteItem]}
                    />
                )}
            </View>
        )
    }, [meetingList, showMeeting, favoriteEmployees, showFavorites])

    if (!isLandScape) {
        return (
            <PortraitView
                navigation={navigation}
                handelSelectedDay={handelSelectedDay}
                employeeList={employeeList}
                setIsELoading={setIsELoading}
                setMapModalVisible={setMapModalVisible}
                setCurrentCardId={setCurrentCardId}
                setEmployeeList={setEmployeeList}
            >
                {!isReadOnly &&
                    renderAddMeetingDropdownItem({
                        dropDownModalVisible,
                        setDropDownModalVisible,
                        onAddClick,
                        fromSchedule: true
                    })}
                {renderExportDropdownItem({
                    exportModalVisible,
                    setExportModalVisible,
                    onMoreButtonClick,
                    fromSchedule: true
                })}
                <NewScheduleModal
                    cRef={newScheduleModal}
                    navigation={navigation}
                    setIsGenerating={setIsGenerating}
                    startDate={scheduleDate}
                    restartInterval={isRestartInterval}
                    setIsRestartInterval={setIsRestartInterval}
                    setDisableCancelBtn={setDisableCancelBtn}
                    reviewSchedule={reviewSchedule}
                    isLoading={isUpdateLoading}
                    setIsLoading={setIsUpdateLoading}
                    isGenerating={isGenerating}
                />
                <SwipeCollapsible cRef={topSwipeCollapsibleRef} height={-80} topToBottom>
                    <View style={styles.titleRow}>
                        <CText style={styles.titleText}>{t.labels.PBNA_MOBILE_MY_DAY}</CText>
                        {!isReadOnly && (
                            <View style={styles.rightBtn}>
                                <TouchableOpacity
                                    activeOpacity={getBtnDisabled() ? 1 : 0.2}
                                    onPress={() => {
                                        !getBtnDisabled() &&
                                            onNewClick({
                                                setIsNewBtnClicked,
                                                setIsCanceled,
                                                setIsCompleted,
                                                setIsCancelBtnClicked,
                                                updateVisitListId,
                                                newScheduleModal,
                                                setScheduleDate,
                                                updateScheduleDate,
                                                dropDownRef,
                                                isGenerating,
                                                setCheckedWeek,
                                                setCompletedSVGList,
                                                completedSVGList,
                                                setCompletedWeek,
                                                setInProgressWeek,
                                                reviewSchedule,
                                                setIsUpdateLoading,
                                                setPublishedSVGList,
                                                resetSearchBar
                                            })
                                    }}
                                >
                                    <View style={styles.newBtn}>
                                        <Image
                                            style={[styles.imgCal, getIconDisabled() && styles.tintColorGray]}
                                            source={IMG_SCHEDULE}
                                        />
                                        {getNewBtnShow() &&
                                            (getBtnDisabled() ? (
                                                <CText style={[styles.newText, styles.colorGray]}>
                                                    {t.labels.PBNA_MOBILE_NEW}
                                                </CText>
                                            ) : (
                                                <CText style={styles.newText}>{t.labels.PBNA_MOBILE_NEW}</CText>
                                            ))}
                                        {getDraftButton() && (
                                            <CText style={styles.newText}>{t.labels.PBNA_MOBILE_DRAFT}</CText>
                                        )}
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.imgAddButton}
                                    onPress={() => {
                                        setDropDownModalVisible(!dropDownModalVisible)
                                    }}
                                    activeOpacity={1}
                                >
                                    {dropDownModalVisible ? (
                                        <BlueClear height={36} width={36} />
                                    ) : (
                                        <Image style={styles.imgAdd} source={iconAdd} />
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.moreOptionButton}
                                    onPress={() => {
                                        setExportModalVisible(!exportModalVisible)
                                    }}
                                    activeOpacity={1}
                                >
                                    <Icon
                                        name="ellipsis-vertical"
                                        type="ionicon"
                                        color="#000000"
                                        size={26}
                                        tvParallaxProperties={undefined}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </SwipeCollapsible>
                <MonthWeekFilter
                    setFormateCurrentDate={setFormateCurrentDate}
                    isShowWeek
                    onSelectDay={onSelectedDay}
                    onSelectWeek={onSelectedWeek}
                    onSetWeekArr={setTmpWeekArr}
                    onTabChange={resetEmployeeFilter}
                    checkedWeek={checkedWeek}
                    tmpWeekArr={weekArr}
                    completedWeek={completedWeek}
                    isLoading={isUpdateLoading}
                />
                <>
                    {isListView && (
                        <View style={commonStyle.flex_1}>
                            <View style={styles.tabRow}>
                                <TouchableOpacity
                                    style={styles.tabWidth}
                                    onPress={() => {
                                        onTabClick(ACTIVE_TAB_1)
                                    }}
                                >
                                    <View style={[styles.tabView, activeTab !== ACTIVE_TAB_1 && styles.bgWhite]}>
                                        <CText
                                            style={[
                                                styles.tabText,
                                                activeTab === ACTIVE_TAB_1 ? styles.whiteColor : styles.blueColor
                                            ]}
                                        >
                                            {t.labels.PBNA_MOBILE_EMPLOYEES.toLocaleUpperCase()}
                                        </CText>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.tabWidth}
                                    onPress={() => {
                                        onTabClick(ACTIVE_TAB_2)
                                    }}
                                >
                                    <View style={[styles.tabView, activeTab === ACTIVE_TAB_1 && styles.bgWhite]}>
                                        <CText
                                            style={[
                                                styles.tabText,
                                                activeTab === ACTIVE_TAB_2 ? styles.whiteColor : styles.blueColor
                                            ]}
                                        >
                                            {t.labels.PBNA_MOBILE_CUSTOMERS}
                                        </CText>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <SwipeCollapsible
                                cRef={downSwipeCollapsibleRef}
                                height={calSCHeights(
                                    filterUnassignVisit(),
                                    showStatusCard,
                                    HEIGHT_FOR_SCROLL,
                                    HIDE_CARD_HEIGHT,
                                    SHOW_CARD_HEIGHT
                                )}
                            >
                                {renderUnassignVisitBar(filterUnassignVisit(), toViewVisits, styles)}
                                {showStatusCard &&
                                    (isPersonaMerchManager() || isPersonaUGM()) &&
                                    renderVisitStatusCard()}
                            </SwipeCollapsible>
                            {((activeTab === ACTIVE_TAB_1 && employeeListLength > 0) ||
                                (activeTab !== ACTIVE_TAB_1 && customerListLength > 0)) && (
                                <View style={styles.metrics}>
                                    {activeTab === ACTIVE_TAB_1
                                        ? employeeListLength > 0 && (
                                              <SearchBarFilter
                                                  cRef={eeSearchBar}
                                                  setListData={setEmployeeList}
                                                  originListData={originEmployeeList}
                                                  originData={originEmployeeList}
                                                  setEmployeeMetrics={setEmployeeMetrics}
                                                  employeeMetrics={employeeMetrics}
                                                  isEmployee
                                                  shouldFilterReset={shouldFilterReset}
                                                  setShouldFilterReset={setShouldFilterReset}
                                                  isMerch
                                                  isPublished
                                                  needFavoriteOnly
                                                  needMyDirectOnly
                                                  placeholder={t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES}
                                                  apply={(realClick) => {
                                                      if (realClick) {
                                                          setShowMeeting(true)
                                                      }
                                                  }}
                                                  searchTextChange={() => {
                                                      setShowMeeting(true)
                                                  }}
                                                  onFilterClick={() => closeAllOpenRow(swipeableRows)}
                                                  onFocus={() => closeAllOpenRow(swipeableRows)}
                                              />
                                          )
                                        : customerListLength > 0 && (
                                              <SearchBarFilter
                                                  cRef={customerSearchBar}
                                                  setListData={setCustomerList}
                                                  originListData={originCustomerList}
                                                  originData={originCustomerList}
                                                  isEmployee={false}
                                                  isPublished
                                                  isCustomer
                                                  isReview
                                                  placeholder={t.labels.PBNA_MOBILE_SEARCH_BY_C_R_R}
                                                  notShowFilterBtn={CommonParam.PERSONA__c !== Persona.MERCH_MANAGER}
                                              />
                                          )}
                                </View>
                            )}
                            {(activeTab === ACTIVE_TAB_1 || activeTab !== ACTIVE_TAB_1) && (
                                <View style={styles.flexPadding}>
                                    {activeTab === ACTIVE_TAB_1 ? (
                                        <View style={[styles.scrollContainer, commonStyle.flexGrow_1]}>
                                            <SwipeToDo
                                                cRef={scrollViewRef}
                                                allData={employeeList}
                                                listData={wholeArr}
                                                setListData={setEmployeeList}
                                                renderItem={renderEItem}
                                                renderHiddenItem={renderFavoriteHiddenItem}
                                                swipeCallback={handleFavoriteEmployee}
                                                setIsLoading={setIsUpdateLoading}
                                                refreshControl={renderEERefresh()}
                                                renderListHeader={renderFavoriteHeaderAndMeeting}
                                                onScroll={(e) =>
                                                    handleScroll(
                                                        e,
                                                        isListExpended,
                                                        setIsListExpended,
                                                        toExpend,
                                                        toInitialPosition,
                                                        lastOffset,
                                                        setLastOffset
                                                    )
                                                }
                                                ListEmptyComponent={_.isEmpty(employeeList) && getListEmptyComponent()}
                                            />
                                        </View>
                                    ) : (
                                        <FlatList
                                            ref={cFlatListRef}
                                            style={styles.customerCon}
                                            data={wholeArr}
                                            extraData={wholeArr}
                                            renderItem={renderCItem}
                                            keyExtractor={(item) => item.Id}
                                            contentContainerStyle={styles.paddingBottom_22}
                                            ListEmptyComponent={getListEmptyComponent()}
                                            refreshControl={
                                                <RefreshControlM
                                                    loading={isCLoading}
                                                    refreshAction={async () => {
                                                        setIsCLoading(true)
                                                        await refreshManager()
                                                        await queryVisitListStatus({
                                                            dropDownRef,
                                                            isGenerating,
                                                            setCheckedWeek,
                                                            setCompletedSVGList,
                                                            updateVisitListId,
                                                            updateScheduleDate,
                                                            setCompletedWeek,
                                                            setInProgressWeek,
                                                            setPublishedSVGList
                                                        })
                                                        await getCustomerData({
                                                            date: manager.selectedDate || moment(),
                                                            setOriginCustomerList,
                                                            setCustomerList,
                                                            setCustomerMetrics,
                                                            dropDownRef,
                                                            setIsCLoading,
                                                            setCustomerListLength,
                                                            customerSearchBar
                                                        })
                                                        await getUnassignedVisits({
                                                            date: manager.selectedDate || moment(),
                                                            setIsCLoading,
                                                            setUnassignVisits,
                                                            setUnassignCustomerList
                                                        })
                                                    }}
                                                />
                                            }
                                        />
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                    {!isListView && (
                        <ManagerMap
                            isLandscape={false}
                            employeeList={employeeList}
                            navigation={navigation}
                            selectedDay={manager.selectedDate}
                        />
                    )}
                </>
                <LoadingBanner
                    isLoading={isGenerating}
                    isCompleted={isCompleted}
                    cancelGenerate={cancelGenerate}
                    reviewSchedule={reviewSchedule}
                    visitListId={visitListId}
                    disableCancelBtn={disableCancelBtn}
                    setDisableCancelBtn={setDisableCancelBtn}
                />
                <Draggable
                    x={428 * floatPosition}
                    y={858 * floatPosition}
                    minX={0}
                    minY={90}
                    maxX={428}
                    maxY={848}
                    renderSize={floatIconSize}
                    isCircle
                    imageSource={isListView ? ICON_MAP : ICON_LIST}
                    onShortPressRelease={handleSwitchView}
                />
                <ReassignResultModal
                    navigation={navigation}
                    isMeetingDeletedSuccess
                    modalVisible={meetingDeletedModalVisible}
                    setModalVisible={setMeetingDeletedModalVisible}
                />

                <UserLocationModal
                    modalVisible={locationModalVisible}
                    setLocationModalVisible={setLocationModalVisible}
                    locationAddSuccessModalVisible={locationAddSuccessModalVisible}
                    setLocationAddSuccessModalVisible={setLocationAddSuccessModalVisible}
                />
                <ErrorMsgModal
                    index={errorMsgType}
                    visible={isErrorShow}
                    setModalVisible={setIsErrorShow}
                    handleClick={async () => {
                        setIsUpdateLoading(true)
                        await deltaSync(activeTab)
                    }}
                />
            </PortraitView>
        )
    }

    return (
        <>
            <LandScapeView
                navigation={navigation}
                employeeList={employeeList}
                setMapModalVisible={setMapModalVisible}
                setCurrentCardId={setCurrentCardId}
                setIsELoading={setIsELoading}
                setEmployeeList={setEmployeeList}
            >
                <View style={styles.landScapeView}>
                    <View style={styles.landScapeLeftView}>
                        <View style={styles.topContent}>
                            <View style={styles.titleContent}>
                                <CText style={styles.landscapeTitleText}>{formateCurrentDate}</CText>
                            </View>

                            <View>
                                <SearchBarFilter
                                    cRef={eeSearchBar}
                                    setListData={setEmployeeList}
                                    originListData={originEmployeeList}
                                    originData={originEmployeeList}
                                    isEmployee
                                    isMerch
                                    isPublished
                                    notShowFilterBtn
                                    placeholder={t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES}
                                    searchTextChange={(text) => {
                                        setSearchText(text)
                                    }}
                                    reset={() => {
                                        setSearchText('')
                                    }}
                                />
                            </View>
                        </View>

                        <View style={styles.listView}>
                            <FlatList
                                ref={eFlatListRef}
                                // filtered out unassigned route in landscape map view
                                data={employeeList.filter((item) => !item?.unassignedRoute)}
                                extraData={currentCardId}
                                renderItem={renderLandScapeEItem}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={styles.paddingBottom_22}
                                refreshControl={renderEERefresh()}
                            />
                        </View>
                    </View>
                    <View style={styles.landScapeRightView}>
                        <NewScheduleMap
                            isLandscape
                            handleSelectedEmployee={(id) => {
                                if (id) {
                                    employeeList.forEach((element) => {
                                        element.landScapeEItemSelected = element.id === id
                                    })
                                    setCurrentCardId(id)
                                    setEmployeeList([...employeeList])
                                } else {
                                    employeeList.forEach((element) => {
                                        element.landScapeEItemSelected = false
                                    })
                                    setCurrentCardId(null)
                                    setEmployeeList([...employeeList])
                                }
                            }}
                            currentCardId={currentCardId}
                            employeeList={employeeList.filter((item) => !item?.unassignedRoute)}
                            navigation={navigation}
                            params={undefined}
                            formateCurrentDate={manager.selectedDate}
                        />
                    </View>
                </View>
            </LandScapeView>
        </>
    )
}

export default NewScheduleList

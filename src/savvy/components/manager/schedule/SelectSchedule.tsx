/**
 * @description Select schedule component.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-03-31
 */

import React, { useEffect, useRef, useState } from 'react'
import { Dimensions, Image, NativeAppEventEmitter, TouchableOpacity, View } from 'react-native'
import { SoupService } from '../../../service/SoupService'
import CText from '../../../../common/components/CText'
import { SelectEmployeeCell, UnassignedRouteCell } from '../common/EmployeeCell'
import { SelectCustomerCell } from '../common/CustomerCell'
import CCheckBox from '../../../../common/components/CCheckBox'
import ReassignModal from '../common/ReassignModal'
import SortableList from 'react-native-sortable-list'
import { useDispatch, useSelector } from 'react-redux'
import ReassignResultModal from '../common/ReassignResultModal'
import { CommonParam } from '../../../../common/CommonParam'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { database } from '../../../common/SmartSql'
import {
    calculateDistanceAndTravelTime,
    calculateVisitAndVisitList,
    DEFAULT_DELAY_TIME,
    getTimeFromMins,
    queryEmployeeList,
    syncDownDataByTableNames,
    transferMilesIntoKilometerForCanada
} from '../../../utils/MerchManagerUtils'
import { getWeekLabel, unionMListAndUser } from '../../../utils/MerchManagerComputeUtils'
import MonthWeek from '../../common/MonthWeek'
import NavigationBar from '../../common/NavigationBar'
import BackButton from '../../common/BackButton'
import { compose } from '@reduxjs/toolkit'
import managerAction from '../../../redux/action/H01_Manager/managerAction'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import SelectScheduleStyle from '../../../styles/manager/SelectScheduleStyle'
import UserAvatar from '../../common/UserAvatar'
import IMG_STORE_PLACEHOLDER from '../../../../../assets/image/Icon-store-placeholder.svg'
import Loading from '../../../../common/components/Loading'
import { syncUpObjUpdate } from '../../../api/SyncUtils'
import { getObjByName } from '../../../utils/SyncUtils'
import {
    navigateToAddMeeting,
    renderAddMeetingDropdownItem,
    renderWorkingDayStatus,
    updateVisitListToUnscheduled
} from '../helper/MerchManagerHelper'
import { getMeetingAttendsList, getRNSMeetings, meetingOnClick } from '../service/MeetingService'
import { MeetingItem } from './MeetingItem'
import BlueClear from '../../../../../assets/image/ios-close-circle-outline-blue.svg'

import { Log } from '../../../../common/enums/Log'
import _ from 'lodash'
import moment from 'moment'
import ErrorMsgModal from '../common/ErrorMsgModal'
import { checkSVGDataModifiedById, checkDataForDeleteVisit } from '../service/DataCheckService'
import {
    DataCheckMsgIndex,
    DropDownType,
    EventEmitterType,
    NavigationPopNum,
    NavigationRoute
} from '../../../enums/Manager'
import { VisitStatus, VisitOperationType } from '../../../enums/Visit'
import { t } from '../../../../common/i18n/t'
import store from '../../../redux/store/Store'
import { formatScheduleDate } from '../helper/VisitHelper'
import { getTimeFromMinsWithHrs } from '../../../common/DateTimeUtils'
import { getStringValue } from '../../../utils/LandingUtils'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { storeClassLog } from '../../../../common/utils/LogUtils'

const kScreenHeight = Dimensions.get('window').height
const ICON_ADD = ImageSrc.ADD_BLUE_CIRCLE
const IMG_MODAL_CLEAR = ImageSrc.IMG_MODAL_CLEAR
const IMG_MODAL_DELETE = ImageSrc.IMG_MODAL_DELETE
const IMG_MODAL_REASSIGN = ImageSrc.IMG_MODAL_REASSIGN

const handleDaySelect = (data) => {
    const obj = {}
    Object.keys(data).forEach((dayKey) => {
        obj[dayKey] = false
    })
    return obj
}

const getSelectDay = (weeks) => {
    const allWeeks = getWeekLabel()
    for (const weekDay of allWeeks) {
        if (weeks.includes(weekDay)) {
            return weekDay
        }
    }
    return ''
}

const mainViewMarginTop = 60
const selectViewHeight = 143
let meetings = {}
let selDay = ''
const managerReducer = (state) => state.manager
interface SelectScheduleProps {
    route: any
    navigation: any
}

const styles = SelectScheduleStyle

const SelectSchedule = ({ route, navigation }: SelectScheduleProps) => {
    const { isESchedule, userData, customerData, addVisitDate, isFromScheduleSummary } = route.params
    const sortListRef = useRef<SortableList<any>>()
    const reassignModal: any = useRef()
    const refMonthWeek: any = useRef()
    const deleteResultModal = useRef(null)
    const assignResultModal = useRef(null)
    const reassignResultModal = useRef(null)

    const manager = useSelector(managerReducer)
    const visitListId = manager.visitListId
    const [originData, setOriginData] = useState(isESchedule ? userData : customerData)

    const handleListData = (data) => {
        if (!Array.isArray(data)) {
            const keys = Object.keys(data).sort((a, b) => {
                return parseInt(a) - parseInt(b)
            })
            const tempData = []
            keys.forEach((item) => {
                tempData.push(data[item])
            })
            data = tempData
        }
        const obj = {}
        let preIndex = 1
        data.forEach((item) => {
            if (!item.isDelete) {
                item.sequence = preIndex
                obj[preIndex] = item
                preIndex++
            }
        })
        return obj
    }
    const handleOriginData = (dataModal) => {
        const obj = {}
        if (!_.isEmpty(dataModal)) {
            Object.keys(dataModal).forEach((dayKey) => {
                obj[dayKey] = handleListData(dataModal[dayKey])
            })
        }
        return obj
    }
    const [currUserData, setCurrUserData] = useState(originData)
    const [data, setData] = useState(() => handleOriginData(originData?.visits))
    const [selectData, setSelectData] = useState([])
    const [deleteSelectData, setDeleteSelectData] = useState({})
    const [weekDays, setWeekDays] = useState(() => (isESchedule ? {} : handleDaySelect(originData?.visits)))
    const [selectDayKey, setSelectDayKey] = useState(() => (isESchedule ? {} : getSelectDay(Object.keys(weekDays))))
    const [sortList, setSortList] = useState(isESchedule ? [] : data[selectDayKey])
    const [totalAssign, setTotalAssign] = useState('1')
    const [modalVisible, setModalVisible] = useState(false)

    const [totalDelete, setTotalDelete] = useState('1')
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [unAssignModalVisible, setUnAssignModalVisible] = useState(false)
    const [totalMinus, setTotalMinus] = useState(originData?.totalMinus)
    const [totalHours, setTotalHours] = useState(originData?.totalHours)
    const [totalCases, setTotalCases] = useState(originData?.totalCases)
    const [totalMiles, setTotalMiles] = useState(originData?.totalMiles)
    const [totalVisit, setTotalVisit] = useState(originData?.totalVisit)
    const [selectedTime, setSelectedTime] = useState('')
    const [selectedMinus, setSelectedMinus] = useState(0)
    const [selectedCase, setSelectedCase] = useState(0)
    const [selectedMiles, setSelectedMiles] = useState(0)
    const [isSelectedUnassign, setIsSelectedUnassign] = useState(false)
    const { dropDownRef } = useDropDown()
    const [planDate, setPlanDate] = useState()
    const [selectedItemKey, setSelectedItemKey] = useState(-1)
    const [isLoading, setIsLoading] = useState(false)
    const [mList, setMList] = useState([])

    const dispatch = useDispatch()
    const resetData = compose(dispatch, managerAction.resetData)
    const getEmployeeListForReassign = compose(dispatch, managerAction.getEmployeeListForReassign)
    const getRNSEmployeeList = compose(dispatch, managerAction.getRNSEmployeeList)
    const getRNSCustomerList = compose(dispatch, managerAction.getRNSCustomerList)
    const [dropDownModalVisible, setDropDownModalVisible] = useState(false)
    const [showList, setShowList] = useState(true)
    const [isErrorShow, setIsErrorShow] = useState(false)
    const [errorMsgType, setErrorMsgType] = useState(DataCheckMsgIndex.COMMON_MSG)
    const cellHeight = isESchedule ? 110 : 80
    const refreshSelectDay = (weeks, selectWeekDay) => {
        if (selectWeekDay) {
            const allWeeks = getWeekLabel()
            const sliceIndex = allWeeks.indexOf(selectWeekDay)
            const beforeSelect = allWeeks.slice(0, sliceIndex)
            const behindSelect = allWeeks.slice(sliceIndex + 1)
            for (const behindDay of behindSelect) {
                if (weeks.includes(behindDay)) {
                    return behindDay
                }
            }
            for (const beforeDay of beforeSelect) {
                if (weeks.includes(beforeDay)) {
                    return beforeDay
                }
            }
        }
    }
    const getSelectDayCount = () => {
        const tempSelectData = []
        let tmpMinus = 0
        let tmpDuration = 0
        let tmpCase = 0
        let tmpMiles = 0
        let selectedUnassign = false
        for (const weekKey in data) {
            const tempSortList = data[weekKey]
            for (const key in tempSortList) {
                if (tempSortList[key].select) {
                    tempSelectData.push(tempSortList[key])
                    tmpMinus += parseFloat(tempSortList[key].totalMinus)
                    tmpDuration += parseFloat(tempSortList[key].totalDuration)
                    tmpCase += tempSortList[key].totalCases
                    tmpMiles += tempSortList[key].totalMiles
                    if (!tempSortList[key].visitor) {
                        selectedUnassign = true
                    }
                }
            }
        }
        setIsSelectedUnassign(selectedUnassign)
        setSelectData(tempSelectData)
        setSelectedMinus(Math.round(tmpMinus))
        setSelectedTime(getTimeFromMins(tmpDuration))
        setSelectedCase(tmpCase)
        setSelectedMiles(tmpMiles)
    }

    const changeDay = (value) => {
        setSelectDayKey(value)
        setSortList(data[value] || [])
        selDay = value
        sortListRef?.current?._scrollView?.scrollTo({ x: 0, y: 0, animated: true })
    }

    const updateSequenceToSoup = async (callback) => {
        const modified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            setIsLoading(false)
            return
        }
        setIsLoading(true)
        const updatedVisits = []
        const allSequence = {}
        const whereClauseArr = []
        let syncUpClause = ''
        const selectedDayIds = []
        const dvlIdSet: Set<any> = new Set()
        for (let index = 0; index < Object.keys(data[selectDayKey]).length; index++) {
            const key = Object.keys(data[selectDayKey])[index]
            const id = data[selectDayKey][key].id
            const clauseForSmartSql = {
                leftTable: 'Visit',
                leftField: 'Id',
                rightField: `'${id}'`,
                operator: '=',
                type: index === 0 ? null : 'OR'
            }
            syncUpClause += index === 0 ? ` WHERE {Visit:Id} = '${id}'` : ` OR {Visit:Id} = '${id}'`
            whereClauseArr.push(clauseForSmartSql)
            allSequence[id] = data[selectDayKey][Object.keys(data[selectDayKey])[index]].sequence
            selectedDayIds.push(id)
            dvlIdSet.add(data[selectDayKey][Object.keys(data[selectDayKey])[index]].dVisitListId)
        }
        const dvlIds: Array<string> = Array.from(dvlIdSet)
        const visitDataCheck = await checkDataForDeleteVisit(selectedDayIds, dvlIds)
        if (!visitDataCheck) {
            setIsLoading(false)
            setIsErrorShow(true)
            setErrorMsgType(DataCheckMsgIndex.COMMON_MSG)
            return
        }
        database()
            .use('Visit')
            .select()
            .where(whereClauseArr)
            .getData()
            .then((res: any) => {
                let VisitListId = ''
                if (res?.length > 0) {
                    VisitListId = res[0].Visit_List__c
                    res.forEach((visit) => {
                        visit.Sequence__c = allSequence[visit.Id]
                        // visit.Pull_Number__c = sequence
                        updatedVisits.push(visit)
                    })
                }
                if (updatedVisits.length > 0) {
                    SoupService.upsertDataIntoSoup('Visit', updatedVisits, true, false)
                        .then(() => {
                            return syncUpObjUpdate(
                                'Visit',
                                getObjByName('Visit').syncUpCreateFields,
                                getObjByName('Visit').syncUpCreateQuery + syncUpClause
                            )
                        })
                        .then(() => {
                            return calculateDistanceAndTravelTime(VisitListId)
                        })
                        .then((re: any) => {
                            const originTravelTime = originData?.dailyVisitList[VisitListId].totalTravelTime || 0
                            const totalTravelTime = re.totalTravelTime || 0
                            const totalMileage = re.weekTotalDistance || 0
                            setTotalHours(
                                Math.round(((originData?.totalMinus - originTravelTime + totalTravelTime) / 60) * 10) /
                                    10
                            )
                            setTotalMiles(parseInt(totalMileage))
                            setIsLoading(false)
                            return getRNSEmployeeList({
                                visitListId,
                                dropDownRef
                            })
                        })
                        .then(() => {
                            setIsLoading(false)
                            callback && callback()
                        })
                } else {
                    setIsLoading(false)
                    callback && callback()
                }
            })
            .catch((err) => {
                setIsLoading(false)
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_SELECT_SCHEDULE_UPDATE_SEQUENCE_TO_SOUP,
                    err
                )
            })
    }

    const updateSequence = (key, order) => {
        if (isESchedule) {
            const reSequenceSortList = {}
            for (let index = 0; index < order.length; index++) {
                const v = index + 1
                sortList[order[index]].sequence = v
                reSequenceSortList[v] = sortList[order[index]]
            }
            data[selectDayKey] = reSequenceSortList
            updateSequenceToSoup(null)
        }
    }

    const weekDayClick = (value) => {
        setPlanDate(value?.fullYearDate)
        changeDay(value?.weekLabel)
        setMList(meetings[value?.weekLabel] || [])
    }

    const isAllDaySelect = () => {
        const selectDayData = data[selectDayKey] || {}
        if (Object.keys(selectDayData)?.length === 0) {
            return false
        }
        for (const key in selectDayData) {
            if (!selectDayData[key]?.select) {
                return false
            }
        }
        return true
    }

    const isAllWeekSelect = () => {
        const visits = Object.values(data)
        let visitCount = 0
        visits.forEach((visit) => {
            visitCount += Object.values(visit).length
        })
        if (!visitCount) {
            return false
        }

        for (const weekKey in data) {
            const selectDayData = data[weekKey]
            for (const key in selectDayData) {
                if (!_.isEmpty(selectDayData[key]) && !selectDayData[key].select) {
                    return false
                }
            }
        }
        return true
    }

    const isDaySelect = () => {
        for (const key in sortList) {
            if (sortList[key].select) {
                return true
            }
        }
        return false
    }

    const selectAllDay = () => {
        const obj = {}
        if (Object.keys(sortList || {}).length === 0) {
            return
        }
        if (isAllDaySelect()) {
            for (const key in sortList) {
                obj[key] = sortList[key]
                obj[key].select = false
            }
            weekDays[selectDayKey] = false
            setWeekDays({ ...weekDays })
            setSortList(obj)
        } else {
            for (const key in sortList) {
                obj[key] = sortList[key]
                obj[key].select = true
            }
            weekDays[selectDayKey] = true
            setWeekDays({ ...weekDays })
            setSortList(obj)
        }
        getSelectDayCount()
    }
    const dataCheckSVGAndNavigateRNS = async () => {
        const modified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            return
        }
        navigation && navigation?.navigate(NavigationRoute.REVIEW_NEW_SCHEDULE)
    }
    const updateMeetingWeekDays = (visitData?) => {
        const mWeeks = Object.keys(meetings || {})
        const tempWeekDays = {}
        mWeeks.forEach((day) => {
            tempWeekDays[day] = false
        })
        const visits = visitData || data
        const vWeeks = Object.keys(visits)
        vWeeks.forEach((day) => {
            tempWeekDays[day] = false
        })
        if (!Object.keys(tempWeekDays).includes(selDay)) {
            selDay = refreshSelectDay(Object.keys(tempWeekDays), selectDayKey)
        }
        setSelectDayKey(selDay)
        const meetingList = !_.isEmpty(meetings) ? meetings[selDay] : []
        setMList(meetingList)
        setSortList(visits[selDay] || [])
        setWeekDays(tempWeekDays)
        refMonthWeek.current?.setSelectIndex(tempWeekDays, selDay)
    }
    const selectAllWeekDay = () => {
        if (isAllWeekSelect()) {
            for (const weekKey in data) {
                if (Object.keys(data[weekKey]).length === 0) {
                    continue
                }
                for (const key in data[weekKey]) {
                    data[weekKey][key].select = false
                }
                weekDays[weekKey] = false
            }
            setWeekDays({ ...weekDays })
            setSortList(data[selectDayKey])
        } else {
            for (const weekKey in data) {
                if (Object.keys(data[weekKey]).length === 0) {
                    continue
                }
                for (const key in data[weekKey]) {
                    data[weekKey][key].select = true
                }
                weekDays[weekKey] = true
            }
            setWeekDays({ ...weekDays })
            setSortList(data[selectDayKey])
        }
        getSelectDayCount()
    }
    const getMeetingData = async (visitData?) => {
        try {
            const { weekObj } = await getRNSMeetings(manager.scheduleDate, originData?.id)
            meetings = weekObj
            updateMeetingWeekDays(visitData)
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'SelectSchedule.getMeetingData', getStringValue(error))
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_REVIEW_NEW_MEETING_FAILED_TO_QUERY,
                error
            )
        }
    }
    const getNewData = async () => {
        if (isESchedule) {
            await getRNSEmployeeList({
                visitListId,
                dropDownRef
            })
            await getMeetingData()
            if (originData?.unassignedRoute) {
                const tempOriginData = store.getState().manager.RNSEmployeeList.find((val) => val.id === originData?.id)
                if (!_.isEmpty(tempOriginData)) {
                    setOriginData(tempOriginData)
                }
            }
        } else {
            await getRNSCustomerList({
                visitListId,
                dropDownRef
            })
        }
        await getEmployeeListForReassign({
            visitListId,
            userLocationId: CommonParam.userLocationId,
            dropDownRef
        })
        setIsLoading(false)
    }
    const refreshUtil = async () => {
        try {
            setIsLoading(true)
            await syncDownDataByTableNames()
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
        }
    }
    const getNewEEData = async () => {
        const params = {
            visitListId,
            dropDownRef,
            scheduleDate: manager.scheduleDate
        }
        let employeeList = []
        if (isESchedule) {
            const mAttObj = await getMeetingAttendsList(params)
            const uData = await queryEmployeeList(params)
            employeeList = unionMListAndUser(mAttObj, uData) || []
        } else {
            employeeList = await queryEmployeeList({
                visitListId,
                dropDownRef
            })
        }
        const eeList = employeeList.filter((item: any) => item.visitor === originData?.id)
        return eeList || []
    }
    useEffect(() => {
        const weekLabel = getWeekLabel()
        selDay = addVisitDate && weekLabel[moment(addVisitDate).weekday()]
    }, [])

    useEffect(() => {
        if (selectData.length === 1) {
            const layout = sortListRef?.current?._rows[selectedItemKey]?._layout
            if (!layout) {
                return
            }
            const offsetY = sortListRef?.current?._contentOffset?.y
            const viewHeightY = 366
            const viewHeight = layout.y - offsetY
            const selectY = viewHeightY + viewHeight
            if (selectY + cellHeight + selectViewHeight + mainViewMarginTop > kScreenHeight) {
                sortListRef?.current?._scrollView?.scrollTo({
                    x: 0,
                    y: offsetY + selectViewHeight + cellHeight,
                    animated: true
                })
            }
        }
    }, [selectData])

    const resetAndGetData = async () => {
        resetData()
        await getNewData()
    }

    useEffect(() => {
        resetAndGetData()
    }, [])

    useEffect(() => {
        const refreshMeeting = NativeAppEventEmitter.addListener(EventEmitterType.REFRESH_SS_MEETING, async () => {
            setIsLoading(true)
            await syncDownDataByTableNames()
            const currentEmployee: any = await getNewEEData()
            const newData = handleOriginData(currentEmployee[0]?.visits || data)
            setCurrUserData(currentEmployee[0] || originData)
            setTotalHours(currentEmployee[0]?.totalHours || 0)
            setData(newData)
            getMeetingData(newData)
            setIsLoading(false)
        })
        return () => {
            refreshMeeting && refreshMeeting.remove()
        }
    }, [])

    const sortItemClick = (key) => {
        setSelectedItemKey(key)
        sortList[key].select = !sortList[key].select
        const tempWeekDays = { ...weekDays }
        tempWeekDays[selectDayKey] = isDaySelect()
        getSelectDayCount()
        setWeekDays(tempWeekDays)
        setSortList({ ...sortList })
    }

    const goToDetails = async (item) => {
        const modified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            return
        }
        const visitDataCheck = await checkDataForDeleteVisit([item?.id], [item?.dVisitListId])
        if (!visitDataCheck && !_.isEmpty(item?.dVisitListId)) {
            setIsLoading(false)
            setIsErrorShow(true)
            setErrorMsgType(DataCheckMsgIndex.COMMON_MSG)
            return
        }
        await refreshUtil()
        item.isESchedule = isESchedule
        navigation.navigate(NavigationRoute.VISIT_DETAILS, {
            item: item,
            isFromRNSView: true,
            visitListId: visitListId
        })
    }

    const renderRow = ({ data, index, key }: { data: any; index: any; key: any }) => {
        if (isESchedule) {
            return (
                <SelectCustomerCell
                    onCellPress={goToDetails}
                    itemKey={key}
                    disabled
                    item={data}
                    index={index}
                    onCheckBoxClick={sortItemClick}
                />
            )
        }
        return (
            <SelectEmployeeCell
                onCellPress={goToDetails}
                itemKey={key}
                disabled
                item={data}
                index={index}
                onCheckBoxClick={sortItemClick}
            />
        )
    }

    const onReassignClick = () => {
        const selectDataForReassign = {
            ...originData,
            visits: {}
        }
        for (const weekDay in data) {
            const selectDayData = data[weekDay]
            for (const key in selectDayData) {
                if (!_.isEmpty(selectDayData[key]) && selectDayData[key].select) {
                    selectDataForReassign.visits[weekDay] = selectDataForReassign.visits[weekDay] || []
                    selectDataForReassign.visits[weekDay].push(selectDayData[key])
                }
            }
        }
        reassignModal.current?.openModal(selectDataForReassign)
    }

    const handleDeleteSelectWeekDay = (dataModal) => {
        const tempWeekDays = {}
        for (const weekKey in dataModal) {
            if (Object.keys(dataModal[weekKey]).length > 0) {
                tempWeekDays[weekKey] = false
            }
        }
        setSelectData([])
        if (Object.keys(tempWeekDays).length === 0 && Object.keys(meetings).length === 0) {
            setSortList([])
            const timeoutId = setTimeout(() => {
                clearTimeout(timeoutId)
                dataCheckSVGAndNavigateRNS()
            }, DEFAULT_DELAY_TIME)
            return
        }
        if (isESchedule) {
            const mWeeks = Object.keys(meetings)
            mWeeks.forEach((day) => {
                tempWeekDays[day] = false
            })
        }
        setWeekDays(tempWeekDays)
        let selectDay = selectDayKey
        if (!Object.keys(tempWeekDays).includes(selectDayKey)) {
            selectDay = refreshSelectDay(Object.keys(tempWeekDays), selectDayKey)
        }
        setSelectDayKey(selectDay)
        setMList(meetings[selectDay] || [])
        setSortList(dataModal[selectDay] || [])
        refMonthWeek.current?.setSelectIndex(tempWeekDays, selectDay)
    }
    const showReassignResult = async (event: any) => {
        setShowList(false)
        setTotalAssign(String(event.count))
        const currentEmployee: any = await getNewEEData()
        for (const argData of selectData) {
            if (isESchedule) {
                argData.isDelete = true
                argData.select = false
            } else {
                argData.visitor = event.item.id
                argData.user.id = event.item.id
                argData.user.name = event.item.name
                argData.user.userStatsId = event.item.userStatsId
                argData.user.firstName = event.item.firstName
                argData.user.lastName = event.item.lastName
                argData.select = false
            }
        }
        const newData = handleOriginData(currentEmployee?.visits || data)
        setData(newData)
        if (isESchedule) {
            setCurrUserData(currentEmployee[0])
        }
        await getNewData()
        if (event) {
            setTotalCases(parseInt(totalCases) - selectedCase)
            setTotalMinus(totalMinus - selectedMinus)
            setTotalHours(Math.round(((totalMinus - selectedMinus) / 60) * 10) / 10)
            setTotalMiles(parseInt(totalMiles) - selectedMiles)
            setTotalVisit(parseInt(totalVisit) - parseInt(String(event.count)))
        }
        handleDeleteSelectWeekDay(newData)
        // reassignModal.current?.closeModal()
        setModalVisible(true)
        setTimeout(() => {
            setShowList(true)
        }, 0)
        setIsLoading(false)
    }

    const getAllVisitObject = () => {
        const allData = { ...deleteSelectData }
        for (const weekKey in data) {
            for (const dayKey in data[weekKey]) {
                const id = data[weekKey][dayKey].id
                const temp = {}
                temp[id] = data[weekKey][dayKey]
                Object.assign(allData, temp)
            }
        }
        return allData
    }

    const deleteSelectToSoup = async (callback) => {
        const modified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            setIsLoading(false)
            return
        }
        const oldVisitListIds = []
        let allUpdate = []
        const deleteVisits = []
        const whereClauseArr = []
        const allData = getAllVisitObject()
        const dvlIdSet: Set<any> = new Set()
        // select
        const deleteIds = Object.keys(deleteSelectData)

        for (let index = 0; index < Object.keys(allData).length; index++) {
            const key = Object.keys(allData)[index]
            const id = allData[key].id
            const clauseForSmartSql = {
                leftTable: 'Visit',
                leftField: 'Id',
                rightField: `'${id}'`,
                operator: '=',
                type: index === 0 ? null : 'OR'
            }
            whereClauseArr.push(clauseForSmartSql)
            if (allData[key].isDelete) {
                dvlIdSet.add(allData[key].dVisitListId)
            }
        }
        const dvlIds: Array<string> = Array.from(dvlIdSet)
        const visitDataCheck = await checkDataForDeleteVisit(deleteIds, dvlIds, true)
        if (!visitDataCheck) {
            setIsLoading(false)
            setIsErrorShow(true)
            setErrorMsgType(DataCheckMsgIndex.COMMON_MSG)
            return
        }
        database()
            .use('Visit')
            .select()
            .where(whereClauseArr)
            .getData()
            .then(async (res: Array<any>) => {
                if (res?.length > 0) {
                    res.forEach((visit) => {
                        if (deleteIds.includes(visit.Id)) {
                            if (!oldVisitListIds.includes(visit.Visit_List__c)) {
                                oldVisitListIds.push(visit.Visit_List__c)
                            }
                            visit.Status__c = VisitStatus.REMOVED
                            visit.Visit_List__c = ''
                            visit.Route_Group__c = null
                            deleteVisits.push(visit)
                        }
                    })
                }
                allUpdate = [...deleteVisits]
                if (allUpdate.length > 0) {
                    try {
                        await calculateVisitAndVisitList(oldVisitListIds, allUpdate, 'Delete')
                        if (!originData?.unassignedRoute) {
                            await updateVisitListToUnscheduled(oldVisitListIds[0], false)
                        }
                        callback && callback(deleteVisits.length.toString())
                    } catch (error) {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'SelectSchedule.deleteSelectToSoup',
                            `${t.labels.PBNA_MOBILE_SELECT_SCHEDULE_DELETE_SELECT_TO_SOUP}: ${getStringValue(error)}`
                        )
                    }
                } else {
                    callback && callback()
                }
            })
            .catch((err) => {
                setIsLoading(false)
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_SELECT_SCHEDULE_DELETE_SELECT_TO_SOUP,
                    err
                )
            })
    }

    const unAssignSelectToSoup = async (callback) => {
        const modified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            setIsLoading(false)
            return
        }
        const oldVisitListIds = []
        let allUpdate = []
        const deleteVisits = []
        const whereClauseArr = []
        const allData = getAllVisitObject()
        const dvlIdSet: Set<any> = new Set()
        const deleteIds = Object.keys(deleteSelectData)
        for (let index = 0; index < Object.keys(allData).length; index++) {
            const key = Object.keys(allData)[index]
            const id = allData[key].id
            const clauseForSmartSql = {
                leftTable: 'Visit',
                leftField: 'Id',
                rightField: `'${id}'`,
                operator: '=',
                type: index === 0 ? null : 'OR'
            }
            whereClauseArr.push(clauseForSmartSql)
        }
        const dVisits = Object.values(deleteSelectData)
        dVisits.forEach((item: any) => {
            dvlIdSet.add(item.dVisitListId)
        })
        const dvlIds: Array<string> = Array.from(dvlIdSet)
        const visitDataCheck = await checkDataForDeleteVisit(deleteIds, dvlIds)
        if (!visitDataCheck) {
            setIsLoading(false)
            setIsErrorShow(true)
            setErrorMsgType(DataCheckMsgIndex.COMMON_MSG)
            return
        }
        database()
            .use('Visit')
            .select()
            .where(whereClauseArr)
            .getData()
            .then(async (res: any) => {
                if (res?.length > 0) {
                    res.forEach((visit) => {
                        if (deleteIds.includes(visit.Id)) {
                            if (!oldVisitListIds.includes(visit.Visit_List__c)) {
                                oldVisitListIds.push(visit.Visit_List__c)
                            }
                            visit.VisitorId = ''
                            visit.Visit_List__c = ''
                            visit.OwnerId = CommonParam.userId
                            deleteVisits.push(visit)
                        }
                    })
                }
                allUpdate = [...deleteVisits]
                if (allUpdate.length > 0) {
                    try {
                        await calculateVisitAndVisitList(oldVisitListIds, allUpdate, 'Unassign')
                        await updateVisitListToUnscheduled(oldVisitListIds[0], false)
                        callback && callback(deleteVisits.length.toString())
                    } catch (error) {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'SelectSchedule.unAssignSelectToSoup',
                            `${t.labels.PBNA_MOBILE_SELECT_SCHEDULE_UNASSIGN_SELECT_TO_SOUP}: ${getStringValue(error)}`
                        )
                    }
                } else {
                    callback && callback()
                }
            })
            .catch((err) => {
                setIsLoading(false)
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_SELECT_SCHEDULE_UNASSIGN_SELECT_TO_SOUP,
                    err
                )
            })
    }

    const handleDelete = async (count, type) => {
        setShowList(false)
        setTotalDelete(count)
        setTotalCases(parseInt(totalCases) - selectedCase)
        setTotalHours(Math.round(((totalMinus - selectedMinus) / 60) * 10) / 10)
        setTotalMinus(totalMinus - selectedMinus)
        setTotalMiles(parseInt(totalMiles) - selectedMiles)
        setTotalVisit(parseInt(totalVisit) - parseInt(count))
        setDeleteSelectData({})
        const currentEmployee: any = await getNewEEData()
        if (type === VisitOperationType.DELETE) {
            setDeleteModalVisible(true)
        } else {
            setUnAssignModalVisible(true)
        }
        const newData = handleOriginData(currentEmployee?.visits || data)
        setData(newData)
        if (isESchedule) {
            setCurrUserData(currentEmployee[0])
        }
        await getNewData()
        handleDeleteSelectWeekDay(newData)
        setTimeout(() => {
            setShowList(true)
        }, 0)
        setIsLoading(false)
    }

    const deleteData = async (type) => {
        setIsLoading(true)
        for (const argData of selectData) {
            if (isESchedule) {
                argData.isDelete = true
                argData.select = false
            } else {
                if (type === VisitOperationType.DELETE) {
                    argData.isDelete = true
                    argData.select = false
                } else {
                    argData.visitor = ''
                    argData.select = false
                }
            }
        }
        setDeleteSelectData(
            Object.assign(
                deleteSelectData,
                ...selectData.map((item) => {
                    const obj = {}
                    obj[item.id] = item
                    return obj
                })
            )
        )
        if (type === VisitOperationType.DELETE) {
            deleteSelectToSoup(async (count) => {
                await getNewData()
                if (count) {
                    handleDelete(count, type)
                }
            })
        } else {
            unAssignSelectToSoup(async (count) => {
                await getNewData()
                if (count) {
                    handleDelete(count, type)
                }
            })
        }
    }
    const onAddClick = async (index) => {
        setDropDownModalVisible(!dropDownModalVisible)
        const modified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            return
        }
        if (index === 0) {
            setIsLoading(true)
            await syncDownDataByTableNames()
            navigation?.navigate(NavigationRoute.ADD_A_VISIT, {
                isESchedule,
                customerData,
                userData,
                planDate,
                isFromSelectSchedule: true
            })
            setIsLoading(false)
        } else if (index === 1) {
            navigateToAddMeeting({
                routerParams: { isReadOnly: false, isRNSMeeting: true, dateOptions: manager.scheduleDate },
                setIsLoading,
                navigation,
                dropDownRef
            })
        }
    }
    const meetingItemClick = async (item) => {
        setIsLoading(true)
        const modified = await checkSVGDataModifiedById(manager.visitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            setIsLoading(false)
            return
        }
        meetingOnClick({
            setIsLoading,
            routerParams: {
                Id: item.Id,
                isReadOnly: true,
                isEmployee: true,
                isRNSMeeting: true,
                dateOptions: manager.scheduleDate
            },
            navigation,
            dropDownRef
        })
    }
    const renderMeetingItem = (item) => {
        return <MeetingItem key={item.Id} item={item} onPress={meetingItemClick} />
    }
    const renderMeetingList = () => {
        if (!_.isEmpty(mList) && isESchedule) {
            return <View>{mList.map(renderMeetingItem)}</View>
        }
    }
    const goBackAndRefresh = async () => {
        if (errorMsgType === DataCheckMsgIndex.COMMON_MSG) {
            navigation.navigate(NavigationRoute.REVIEW_NEW_SCHEDULE)
        } else if (
            errorMsgType === DataCheckMsgIndex.SVG_PUBLISHED_MSG ||
            errorMsgType === DataCheckMsgIndex.SVG_CANCELLED_MSG
        ) {
            navigation.pop(isFromScheduleSummary ? NavigationPopNum.POP_THREE : NavigationPopNum.POP_TWO)
        }
    }
    const checkEmptyMeetingAndVisit = () => {
        return _.isEmpty(mList) && isESchedule && _.isEmpty(sortList)
    }

    const getRenderUserInfo = () => {
        if (originData?.unassignedRoute) {
            return <UnassignedRouteCell item={originData} manager={manager} />
        }
        return (
            <View style={styles.headerUserContainer}>
                <UserAvatar
                    userStatsId={currUserData?.userStatsId}
                    firstName={currUserData?.firstName}
                    lastName={currUserData?.lastName}
                    avatarStyle={styles.headerUserImage}
                    userNameText={{ fontSize: 20 }}
                />
                <View style={styles.headerUserInfoContainer}>
                    <View style={styles.headerUserInfoTopContainer}>
                        <View style={styles.headerUserInfoTopNameContainer}>
                            <CText numberOfLines={1} ellipsizeMode="tail" style={styles.headerUserInfoTopName}>
                                {originData?.name}
                            </CText>
                        </View>
                        <View style={styles.headerUserWeekInfoContainer}>{renderWorkingDayStatus(currUserData)}</View>
                    </View>
                    <View style={styles.status}>
                        <CText
                            style={[
                                styles.totalHours,
                                totalHours >= CommonParam.weeklyHourThreshold && styles.totalHoursActive
                            ]}
                        >
                            {totalHours}
                            {` ${t.labels.PBNA_MOBILE_HRS}`}
                        </CText>
                        <CText style={styles.line}> | </CText>
                        <CText style={styles.totalVisits}>
                            {totalVisit}
                            {` ${t.labels.PBNA_MOBILE_VISITS.toLocaleLowerCase()}`}
                        </CText>
                        <CText style={styles.line}> | </CText>
                        {manager.isInCanada ? (
                            <CText style={styles.statusText}>
                                {transferMilesIntoKilometerForCanada(totalMiles)}
                                {` ${t.labels.PBNA_MOBILE_KM}`}
                            </CText>
                        ) : (
                            <CText style={styles.statusText}>
                                {totalMiles}
                                {` ${t.labels.PBNA_MOBILE_MI}`}
                            </CText>
                        )}
                    </View>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.mainContainer}>
                <View style={styles.headerContainer}>
                    <NavigationBar
                        left={<BackButton navigation={navigation} onBackPress={() => dataCheckSVGAndNavigateRNS()} />}
                        title={t.labels.PBNA_MOBILE_NEW_SCHEDULE}
                        right={
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
                                    <Image style={styles.imgAdd} source={ICON_ADD} />
                                )}
                            </TouchableOpacity>
                        }
                    />
                    <View style={[styles.headerTitleContainer, originData?.unassignedRoute && { marginBottom: 5 }]}>
                        <CText style={styles.headerTitle}>{t.labels.PBNA_MOBILE_REVIEW_NEW_SCHEDULE}</CText>
                        <CText style={styles.headerTitleDate}>{formatScheduleDate(manager.scheduleDate)}</CText>
                    </View>
                    <View style={[styles.mainContentContainer, originData?.unassignedRoute && { paddingVertical: 5 }]}>
                        {isESchedule ? (
                            getRenderUserInfo()
                        ) : (
                            <View style={styles.headerUserWrapper}>
                                <View style={styles.emHeaderUserContainer}>
                                    <IMG_STORE_PLACEHOLDER style={styles.headerStoreImage} />
                                    <View style={styles.flexShrinkCol}>
                                        <CText numberOfLines={2} ellipsizeMode="tail" style={styles.storeName}>
                                            {originData?.name}
                                        </CText>
                                        <View style={styles.flexShrinkCol}>
                                            <CText numberOfLines={1} ellipsizeMode="tail" style={styles.itemSubTile}>
                                                {originData?.address}
                                            </CText>
                                            <CText style={styles.itemSubTile}>{originData?.cityStateZip}</CText>
                                            <View style={commonStyle.flexRowJustifyCenter}>
                                                <CText style={[styles.regularText, styles.marginTop_6]}>
                                                    {getTimeFromMinsWithHrs(originData?.totalPlanedVisitDuration)}
                                                </CText>
                                                {/* will be add back in future */}
                                                {/* <CText style={[styles.regularText, styles.marginTop_6]}>{ originData?.dfVisitNum > 0 ? ' | ' : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}</CText> */}
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.salesRepContainer}>
                                    <UserAvatar
                                        userStatsId={originData?.repUserStatsID}
                                        firstName={originData.repFirstName}
                                        lastName={originData.repLastName}
                                        avatarStyle={styles.salesRepImage}
                                        userNameText={{ fontSize: 12 }}
                                    />
                                    <View style={[styles.salesRepInfo, styles.marginLeft_10]}>
                                        <CText numberOfLines={1} ellipsizeMode="tail" style={styles.regularText}>
                                            {originData?.repName}
                                            {_.isEmpty(originData?.repName) && (
                                                <CText style={[styles.regularText, styles.fontWeight_700]}>-</CText>
                                            )}
                                        </CText>
                                        <CText numberOfLines={1} ellipsizeMode="tail" style={styles.regularText}>
                                            {t.labels.PBNA_MOBILE_SALES_ROUTE}
                                            <CText style={styles.fontWeight_700}> {originData.salesRoute || '-'}</CText>
                                        </CText>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                    {selectData.length > 0 && (
                        <View style={styles.selectedBox}>
                            <View style={styles.boxTitle}>
                                <CText style={styles.selectedVisit}>
                                    {selectData.length}
                                    {selectData.length === 1
                                        ? ` ${t.labels.PBNA_MOBILE_VISIT}`
                                        : ` ${t.labels.PBNA_MOBILE_VISITS}`}
                                    {` ${t.labels.PBNA_MOBILE_SELECTED}`}
                                </CText>
                                <CText style={styles.selectedInfo}>{selectedTime}</CText>
                            </View>
                            <View style={styles.btnGroup}>
                                <TouchableOpacity
                                    style={styles.flexRowCenter}
                                    onPress={() => !isSelectedUnassign && deleteData(VisitOperationType.UNASSIGN)}
                                >
                                    <Image
                                        source={IMG_MODAL_CLEAR}
                                        style={isSelectedUnassign ? styles.inactiveBtnIcon : styles.btnIcon}
                                    />
                                    <CText style={isSelectedUnassign ? styles.inactiveBtnText : styles.btnText}>
                                        {t.labels.PBNA_MOBILE_UNASSIGN}
                                    </CText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.flexRowCenter}
                                    onPress={() => deleteData(VisitOperationType.DELETE)}
                                >
                                    <Image source={IMG_MODAL_DELETE} style={styles.btnIcon} />
                                    <CText style={styles.btnText}>{t.labels.PBNA_MOBILE_DELETE.toUpperCase()}</CText>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.flexRowCenter} onPress={onReassignClick}>
                                    <Image source={IMG_MODAL_REASSIGN} style={styles.btnIcon} />
                                    <CText style={styles.btnText}>{t.labels.PBNA_MOBILE_REASSIGN.toUpperCase()}</CText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    <View style={styles.weekContainer}>
                        <MonthWeek
                            cRef={refMonthWeek}
                            weekDays={weekDays}
                            onclick={weekDayClick}
                            addVisitDate={addVisitDate}
                            isEmptyFromRNS={checkEmptyMeetingAndVisit()}
                        />
                    </View>
                    <View style={styles.checkBoxContainer}>
                        <CText style={styles.checkBoxTitle}>
                            {Object.keys(sortList || {}).length}
                            {Object.keys(sortList || {}).length === 1
                                ? ' ' + t.labels.PBNA_MOBILE_VISIT
                                : ' ' + t.labels.PBNA_MOBILE_VISITS}
                        </CText>
                        <View style={styles.checkBoxItemContainer}>
                            <CCheckBox
                                onPress={selectAllDay}
                                title={
                                    <CText style={styles.checkBoxItemText}>
                                        {t.labels.PBNA_MOBILE_FULL_DAY.toLocaleUpperCase()}
                                    </CText>
                                }
                                checked={!!isAllDaySelect()}
                                containerStyle={styles.checkBoxItem}
                            />
                            <CCheckBox
                                onPress={selectAllWeekDay}
                                title={
                                    <CText style={styles.checkBoxItemText}>
                                        {t.labels.PBNA_MOBILE_FULL_WEEK.toLocaleUpperCase()}
                                    </CText>
                                }
                                checked={!!isAllWeekSelect()}
                                containerStyle={styles.checkBoxItem}
                            />
                        </View>
                    </View>
                </View>
                <View style={styles.sortListContainer}>
                    {showList && (
                        <SortableList
                            key={selectDayKey}
                            style={styles.sortList}
                            ref={sortListRef}
                            data={sortList}
                            decelerationRate={null}
                            sortingEnabled
                            onReleaseRow={updateSequence}
                            onPressRow={sortItemClick}
                            renderRow={renderRow}
                            renderHeader={renderMeetingList}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </View>

            <ReassignModal
                cRef={reassignModal}
                navigation={navigation}
                userData={originData}
                isEmployee={isESchedule}
                data={manager.employeeListForReassign}
                selectDataLength={selectData.length}
                selectedTime={selectedTime}
                selectedCase={selectedCase}
                reassignCallBack={(count) => showReassignResult(count)}
                setIsLoading={setIsLoading}
                setErrorMsgType={setErrorMsgType}
                setIsErrorShow={setIsErrorShow}
                visitListId={visitListId}
            />
            <ReassignResultModal
                cRef={deleteResultModal}
                navigation={navigation}
                reassignType={VisitOperationType.DELETE}
                totalAssign={totalDelete}
                modalVisible={deleteModalVisible}
                setModalVisible={setDeleteModalVisible}
            />
            <ReassignResultModal
                cRef={assignResultModal}
                navigation={navigation}
                reassignType={VisitOperationType.UNASSIGN}
                totalAssign={totalDelete}
                modalVisible={unAssignModalVisible}
                setModalVisible={setUnAssignModalVisible}
            />
            <ReassignResultModal
                cRef={reassignResultModal}
                navigation={navigation}
                reassignType={VisitOperationType.REASSIGN}
                totalAssign={totalAssign}
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
            />
            <Loading isLoading={isLoading} />
            {renderAddMeetingDropdownItem({
                dropDownModalVisible,
                setDropDownModalVisible,
                onAddClick
            })}
            <ErrorMsgModal
                index={errorMsgType}
                visible={isErrorShow}
                setModalVisible={setIsErrorShow}
                handleClick={goBackAndRefresh}
            />
        </View>
    )
}

export default SelectSchedule

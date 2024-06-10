/**
 * @description Employee Schedule component
 * @author Yi Li
 * @email yi.b.li@pwc.com
 * @date 2021-05-25
 */

import React, { useEffect, useState, useRef } from 'react'
import { View, SectionList, StyleSheet, Image, Alert, NativeAppEventEmitter, TouchableOpacity } from 'react-native'
import MonthWeekFilter from '../../common/MonthWeekFilter'
import NavigationBar from '../../common/NavigationBar'
import BackButton from '../../common/BackButton'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { SoupService } from '../../../service/SoupService'
import moment from 'moment'
import MapScreen from '../../../pages/MapScreen'
import MeetingList from '../../merchandiser/MeetingList'
import EmployeeCell, { UnassignedRouteCell } from '../common/EmployeeCell'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import CText from '../../../../common/components/CText'
import CCheckBox from '../../../../common/components/CCheckBox'
import SelectScheduleStyle from '../../../styles/manager/SelectScheduleStyle'
import ReassignModal from '../common/ReassignModal'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { CommonParam } from '../../../../common/CommonParam'
import { compose } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import managerAction from '../../../redux/action/H01_Manager/managerAction'
import {
    calculateDistanceAndTravelTime,
    DEFAULT_DELAY_TIME,
    getTimeFromMins,
    getWeekLabelArrObj,
    ReassignModalType,
    reSequenceByVisitListId,
    syncDownDataByTableNames,
    updateOldVisitList
} from '../../../utils/MerchManagerUtils'
import { getTotalHours, getTotalTruncHours, getWeekLabel } from '../../../utils/MerchManagerComputeUtils'
import { database } from '../../../common/SmartSql'
import { filterExistFields, getObjByName } from '../../../utils/SyncUtils'
import { syncUpObjUpdateFromMem } from '../../../api/SyncUtils'
import ReassignResultModal from '../common/ReassignResultModal'
import ERROR_DELIVERY from '../../../../../assets/image/icon-error-visit-list.svg'
import SortableList from 'react-native-sortable-list'
import Loading from '../../../../common/components/Loading'
import RefreshControlM from '../common/RefreshControlM'
import {
    calculateActualTravelTime,
    FIVE_MIN_GAP,
    formatTravelTime,
    GAP_TIME,
    getOriginData,
    getUserStatus,
    getWorkScheduleFromLocal,
    handleListData,
    ifDayCanEdit,
    ifDayCanSequence,
    isToday,
    itemCanSelected,
    SORTABLE_LIST_TIPS,
    sortCompletedMeetingAndVisitByDate,
    updateCanSequenceListEditStatus
} from './EmployeeScheduleListHelper'
import { MeetingItem } from './MeetingItem'
import { getPubEEMeetings, meetingOnClick } from '../service/MeetingService'
import { formatWithTimeZone, setLoggedInUserTimezone } from '../../../utils/TimeZoneUtils'
import { Log } from '../../../../common/enums/Log'
import { getIdClause, getReassignEmployeeList, updateVisitListToUnscheduled } from '../helper/MerchManagerHelper'
import _, { cloneDeep } from 'lodash'
import { checkDataForDeleteVisit } from '../service/DataCheckService'
import ErrorMsgModal from '../common/ErrorMsgModal'
import { DataCheckMsgIndex, DropDownType, EventEmitterType, MeetingType, NavigationRoute } from '../../../enums/Manager'
import ScheduleVisitCard from '../../merchandiser/ScheduleVisitCard'
import { VisitStatus, VisitOperationType, VisitType } from '../../../enums/Visit'
import { t } from '../../../../common/i18n/t'
import { Persona } from '../../../../common/enums/Persona'
import MapDraggable from '../../common/MapDraggable'
import { getIncomingVisits } from '../../../helper/manager/mapHelper'
import { pushNotificationToMerch } from '../../../api/ApexApis'
import { getStringValue } from '../../../utils/LandingUtils'
import { getData } from '../../../utils/sync/ManagerSyncUtils'
import store from '../../../redux/store/Store'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { MOMENT_UNIT } from '../../../../common/enums/MomentUnit'
import { MOMENT_STARTOF } from '../../../../common/enums/MomentStartOf'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getPortraitModeScreenWidthAndHeight } from '../../../../common/utils/CommonUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const { width } = getPortraitModeScreenWidthAndHeight()

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    headerContainer: {
        paddingLeft: 22,
        paddingRight: 22,
        marginTop: 44
    },
    imgAddButton: {
        right: 0,
        bottom: 10
    },
    imgAdd: {
        width: 36,
        height: 36
    },
    editView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: 60,
        backgroundColor: '#FFFFFF'
    },
    visitsCountLabel: {
        marginLeft: 22,
        fontSize: 12,
        color: '#000000',
        fontWeight: '400'
    },
    editLabel: {
        marginRight: 22,
        fontSize: 12,
        color: '#00A2D9',
        fontWeight: '700'
    },
    flexPadding: {
        flex: 1,
        backgroundColor: '#F2F4F7'
    },
    paddingBottom22: {
        paddingBottom: 22
    },
    sectionHeader: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20
    },
    endTimeStyle: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5
    },
    startTimeStyle: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10
    },
    headerTitle: {
        fontFamily: 'Gotham',
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    timeTitle: {
        fontFamily: 'Gotham',
        fontSize: 12,
        color: '#000000',
        fontWeight: '400'
    },
    overTime: {
        marginLeft: 7
    },
    checkBoxContainer: {
        paddingHorizontal: 22,
        backgroundColor: baseStyle.color.white
    },
    editCon: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 22,
        height: 40,
        backgroundColor: baseStyle.color.white
    },
    unassgin: {
        color: '#D3D3D3'
    },
    unassiginIcon: {
        tintColor: '#D3D3D3'
    },
    editText: {
        color: baseStyle.color.tabBlue,
        fontWeight: 'bold'
    },
    editBtn: {
        height: 40,
        justifyContent: 'center'
    },
    doneBtn: {
        height: 40,
        justifyContent: 'center',
        marginLeft: 5,
        marginRight: 10
    },
    sectionLine: {
        marginLeft: 38,
        marginRight: 38,
        height: 1,
        backgroundColor: '#000'
    },
    meetingList: { backgroundColor: '#F2F4F7', paddingBottom: 20 },
    sectionList: { paddingTop: 15 },
    sortableList: { flex: 1, width: width, paddingTop: 15, paddingBottom: 20 },
    sortableListInner: { flex: 1, width: width },
    marginLeft_22: { marginLeft: 22 },
    gapTimeView: { marginBottom: 15, alignItems: 'center', justifyContent: 'center' },
    gapTimeTitle: { fontSize: 12, color: '#565656' },
    gapTimeText: { color: '#000' },
    gapTimeTextRed: { color: '#EB445A' },
    travelTimeView: {
        marginTop: 5,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    grey: { color: '#D3D3D3' },
    divideLine: { height: 1, backgroundColor: '#000', flex: 1, marginHorizontal: 38, marginTop: 20, marginBottom: 0 },
    kronosText: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    marginTop_10: {
        marginTop: 10
    },
    marginBottom_10: {
        marginBottom: 10
    }
})

interface EmployeeScheduleListInterface {
    props: any
    route: any
    navigation: any
}

const managerReducer = (state) => state.manager

const IMG_MODAL_CLEAR = ImageSrc.IMG_MODAL_CLEAR
const IMG_MODAL_DELETE = ImageSrc.IMG_MODAL_DELETE
const IMG_MODAL_REASSIGN = ImageSrc.IMG_MODAL_REASSIGN
const iconAdd = ImageSrc.ADD_BLUE_CIRCLE
const FORMAT_DATE_STRING = TIME_FORMAT.Y_MM_DD

let selDay = ''
let currWeekDays = []
let workSchedule = {}
let weekVisits = {}
let allWeekMeetings = {}

export const renderGapTime = (title, gapTime) => {
    return (
        <View style={styles.gapTimeView}>
            <CText style={styles.gapTimeTitle}>
                {title}{' '}
                <CText style={[gapTime > FIVE_MIN_GAP ? styles.gapTimeTextRed : styles.gapTimeText]}>
                    {gapTime || 0} {t.labels.PBNA_MOBILE_MIN}
                </CText>
            </CText>
        </View>
    )
}

export const renderTravelTime = (
    plannedTravelTime,
    actualTravelTime,
    plannedTravelTimeStr,
    actualTravelTimeStr,
    needPlanned = true
) => {
    return (
        <View style={styles.travelTimeView}>
            {needPlanned && (
                <>
                    <CText style={styles.gapTimeTitle}>
                        {t.labels.PBNA_MOBILE_ESTIMATED_TRAVEL_TIME}{' '}
                        <CText style={styles.gapTimeText}>{plannedTravelTimeStr}</CText>
                    </CText>
                    <CText style={styles.grey}> | </CText>
                </>
            )}
            <CText style={styles.gapTimeTitle}>
                {t.labels.PBNA_MOBILE_ACTUAL_TRAVEL_TIME}
                <CText
                    style={[
                        styles.gapTimeText,
                        needPlanned && actualTravelTime > plannedTravelTime && styles.gapTimeTextRed
                    ]}
                >
                    {' '}
                    {actualTravelTimeStr}
                </CText>
            </CText>
        </View>
    )
}

export const renderKronosActual = (punchTime: string, containerStyle?: any, titleStyle?: any) => {
    return (
        <View style={[styles.kronosText, containerStyle]}>
            <CText style={[styles.gapTimeTitle, titleStyle]}>{t.labels.PBNA_MOBILE_KRONOS_ACTUAL}:</CText>
            <CText style={styles.timeTitle}>{punchTime}</CText>
        </View>
    )
}

const EmployeeScheduleList = ({ route, navigation }: EmployeeScheduleListInterface) => {
    const employeeData = route.params.employeeData ? route.params.employeeData : {}
    const showMap = route.params.showMap ? route.params.showMap : false
    const notificationDate = route.params.reloadDate || null
    const defaultEeItem = {
        name: employeeData.name,
        totalHours: 0,
        totalVisit: 0,
        totalMiles: 0,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        userStatsId: employeeData.userStatsId,
        ...employeeData
    }
    const manager = useSelector(managerReducer)
    const dispatch = useDispatch()
    const getEmployeeListForReassign = compose(dispatch, managerAction.getEmployeeListForReassign)
    const [isMapView, setIsMapView] = useState(showMap)
    const [employeeItemData, setEmployeeItemData] = useState([])
    const [employeeListData, setEmployeeListData] = useState([])
    const [weekData, setWeekData] = useState({})
    const [employItem, setEmployeeItem] = useState({
        totalHours: 0,
        totalMiles: 0,
        gpid: 0,
        buid: 0,
        persona: '',
        totalPlannedDurMin: 0,
        ...defaultEeItem
    })
    const [isCurDay, setIsCurDay] = useState(false)
    const [canSequence, setCanSequence] = useState(false)
    const [edit, setEdit] = useState(false)
    const [selAllWeek, setSelAllWeek] = useState(false)
    const [selectData, setSelectData] = useState([])
    const reassignModal: any = useRef()
    const sectionList: any = useRef()
    const deleteResultModal = useRef(null)
    const reassignResultModal = useRef(null)
    const unassignResultModal = useRef(null)
    const monthWeekFilter = useRef(null)
    const [selectedTime, setSelectedTime] = useState('')
    const [weekDaySel, setWeekDaysSel] = useState({})
    const [weekDayVisitCount, setWeekDayVisitCount] = useState({})
    const [isInit, setIsInnit] = useState(true)
    const [dayVisitCount, setDayVisitCount] = useState(0)
    const [totalDelete, setTotalDelete] = useState('1')
    const [totalAssign, setTotalAssign] = useState('1')
    const [modalVisible, setModalVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [dataLoading, setDataLoading] = useState(false)
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [meetingList, setMeetingList] = useState([])
    const [showList, setShowList] = useState(true)

    const { dropDownRef } = useDropDown()
    const [isErrorShow, setIsErrorShow] = useState(false)
    const [errorMsgType, setErrorMsgType] = useState(DataCheckMsgIndex.COMMON_MSG)
    const [SVGId, setSVGId] = useState('')

    const [listOrder, setListOrder] = useState([])
    const [vlListSortById, setVlListSortById] = useState({})
    const [todayVlStatus, setTodayVlStatus] = useState([])
    const [unassignModalVisible, setUnassignModalVisible] = useState(false)
    const [totalUnassign, setTotalUnassign] = useState('1')
    const isReadOnly = CommonParam.PERSONA__c !== Persona.MERCH_MANAGER
    // show the visits with the logic: 1.complete => in progress => not start. 2.ascending in order of sequence
    const sortDataByVisitStatusAndSequence = (dvList) => {
        const tempList = []
        // dvList = _.orderBy(dvList, ['sequence'], ['asc'])
        dvList.forEach((e) => {
            if (e.status === VisitStatus.COMPLETE) {
                tempList.push(e)
            }
        })
        dvList.forEach((e) => {
            if (e.status === VisitStatus.IN_PROGRESS) {
                tempList.push(e)
            }
        })
        dvList.forEach((e) => {
            if (e.status !== VisitStatus.COMPLETE && e.status !== VisitStatus.IN_PROGRESS) {
                tempList.push(e)
            }
        })
        return tempList
    }
    const meetingItemClick = (item) => {
        meetingOnClick({
            setIsLoading,
            routerParams: { Id: item.Id, isReadOnly: true, isEmployee: true, isFromESL: true },
            navigation,
            dropDownRef
        })
    }
    const renderMeetingItem = (item) => {
        return <MeetingItem key={item.Id} item={item} employeeId={employeeData.id} onPress={meetingItemClick} />
    }

    const calculateActualTimeAndSequence = (visitArray: any[]) => {
        const completedVisits = []
        const inProgressVisits = []
        const realVisitArray: any = []
        visitArray.forEach((visit) => {
            if (visit.status === VisitStatus.COMPLETE) {
                completedVisits.push(visit)
            }
            if (visit.status === VisitStatus.IN_PROGRESS) {
                inProgressVisits.push(visit)
            }
            if (visit.SubType__c === VisitType.VISIT) {
                realVisitArray.push(visit)
            }
        })
        calculateActualTravelTime(realVisitArray)
        // set actualTravelTime to original visit and events array
        realVisitArray.forEach((visit, index) => {
            visitArray.forEach((item) => {
                if (visit.id === item.id) {
                    item.actualSequence = index + 1
                    item.actualTravelTime = visit.actualTravelTime || 0
                }
            })
        })
        // subtract event time form actual travel time calculated between visits
        let tempEventTime = 0
        let tempVisitItem: any = {}
        visitArray.forEach((visit, index) => {
            // if is event, to see whether start time and end time of this event is between two visits
            if (_.isEmpty(visit.SubType__c)) {
                const actualStartTime = visit.actualStartTime || visit.ActualVisitStartTime
                const actualEndTime = visit.actualEndTime || visit.ActualVisitEndTime
                const firstVisitEndTime = tempVisitItem?.ActualVisitEndTime
                // get the next complete or in progress visit that needs to show travel time
                const secondVisitStartTime =
                    visitArray.find((value, ind) => ind > index && value.showTravelTime)?.ActualVisitStartTime || ''
                // if event ends before visit or starts after next in progress visit, will not subtract that event time
                if (
                    (!_.isEmpty(actualEndTime) && moment(actualEndTime).isBefore(moment(firstVisitEndTime))) ||
                    (!_.isEmpty(actualStartTime) &&
                        !_.isEmpty(secondVisitStartTime) &&
                        moment(actualStartTime).isAfter(moment(secondVisitStartTime)))
                ) {
                    return
                }
                // if manager scheduled meeting, else md's events
                if (visit?.SubType === MeetingType.SCHEDULED_MEETING) {
                    tempEventTime += moment(visit.actualEndTime).diff(visit.actualStartTime, MOMENT_UNIT.MINUTES) || 0
                } else {
                    tempEventTime +=
                        moment(visit.ActualVisitEndTime).diff(visit.ActualVisitStartTime, MOMENT_UNIT.MINUTES) || 0
                }
            } else {
                tempVisitItem = visit
            }
            if (visit.showTravelTime) {
                visit.actualTravelTime = visit.actualTravelTime - tempEventTime
                tempEventTime = 0
            }
        })
        inProgressVisits.forEach((visit, index) => {
            visitArray.forEach((item) => {
                if (visit.id === item.id) {
                    item.actualSequence = index + 1 + completedVisits.length
                }
            })
        })
    }

    const redefineListData = async (list) => {
        // for today
        if (isToday(selDay) && list[0]?.type !== SORTABLE_LIST_TIPS) {
            const vlIdList = _.groupBy(list, 'visitList')
            for (const key in vlIdList) {
                vlIdList[key] = sortCompletedMeetingAndVisitByDate(vlIdList[key], employeeData)
            }
            // Assemble the data for the SortableList
            const sortableListWithTips = _.cloneDeepWith(vlIdList)
            const sortableData = []
            const hasDayStarted = []
            const idKeys = []
            for (const key in sortableListWithTips) {
                // in order to compare actual sequence and planned sequence
                calculateActualTimeAndSequence(sortableListWithTips[key])
                if (
                    Object.prototype.hasOwnProperty.call(sortableListWithTips, key) &&
                    !_.isEmpty(sortableListWithTips[key])
                ) {
                    idKeys.push(key)
                    // day started at only appear once
                    const dayStartedLabel = _.isEmpty(hasDayStarted)
                        ? t.labels.PBNA_MOBILE_DAY_STARTED_AT
                        : t.labels.PBNA_MOBILE_SHIFT_STARTED_AT
                    if (_.isEmpty(hasDayStarted)) {
                        hasDayStarted.push(t.labels.PBNA_MOBILE_DAY_STARTED_AT)
                    }
                    // day ended at only appear once
                    const dayEndedLabel =
                        idKeys.length === Object.keys(sortableListWithTips).length
                            ? t.labels.PBNA_MOBILE_DAY_ENDED_AT
                            : t.labels.PBNA_MOBILE_SHIFT_ENDED_AT
                    const firstVisit = sortableListWithTips[key].filter(
                        (item) => item?.SubType === VisitType.VISIT || item.Subject
                    )[0]
                    if (firstVisit?.VlStatus === VisitStatus.COMPLETED) {
                        sortableListWithTips[key].unshift({
                            type: GAP_TIME,
                            content: t.labels.PBNA_MOBILE_GAP_TIME,
                            startGap: firstVisit.StartGap,
                            Id: Math.random().toString()
                        })
                        sortableListWithTips[key].unshift({
                            type: SORTABLE_LIST_TIPS,
                            content: dayStartedLabel,
                            startTime: firstVisit.StartTime,
                            punchIn: firstVisit.KronosPunchIn,
                            punchOut: firstVisit.KronosPunchOut,
                            Id: Math.random().toString()
                        })
                        sortableListWithTips[key].push({
                            type: GAP_TIME,
                            content: t.labels.PBNA_MOBILE_GAP_TIME,
                            endGap: firstVisit.EndGap,
                            Id: Math.random().toString()
                        })
                        sortableListWithTips[key].push({
                            type: SORTABLE_LIST_TIPS,
                            content: dayEndedLabel,
                            punchIn: firstVisit.KronosPunchIn,
                            punchOut: firstVisit.KronosPunchOut,
                            endTime: firstVisit.EndTime,
                            Id: Math.random().toString()
                        })
                    } else if (firstVisit?.VlStatus === VisitStatus.IN_PROGRESS) {
                        sortableListWithTips[key].unshift({
                            type: GAP_TIME,
                            content: t.labels.PBNA_MOBILE_GAP_TIME,
                            startGap: firstVisit.StartGap,
                            Id: Math.random().toString()
                        })
                        sortableListWithTips[key].unshift({
                            type: SORTABLE_LIST_TIPS,
                            content: dayStartedLabel,
                            startTime: firstVisit.StartTime,
                            punchIn: firstVisit.KronosPunchIn,
                            punchOut: firstVisit.KronosPunchOut,
                            Id: Math.random().toString()
                        })
                    }
                }
            }
            for (const key in sortableListWithTips) {
                if (Object.prototype.hasOwnProperty.call(sortableListWithTips, key)) {
                    sortableListWithTips[key].forEach((t) => {
                        sortableData.push(t)
                    })
                }
            }
            setVlListSortById(vlIdList)
            list = sortableData
        } else {
            const firstSection = list[0] || {}
            const titleStr = firstSection.title || ''
            const hadStarted = titleStr.indexOf('+000') > -1
            // for past days
            if (hadStarted) {
                // sort completed visits and events for past days
                for (const listItem of list) {
                    const tempSortedDataArr = sortCompletedMeetingAndVisitByDate(listItem?.data || [], employeeData)
                    if (!_.isEmpty(listItem)) {
                        listItem.data = tempSortedDataArr
                    }
                }
                const timeStr = firstSection.title.replace('+000', '')
                const hasIcon = getUserStatus(firstSection.visitDate, timeStr, workSchedule)
                list.map((item, index) => {
                    // to compose actualSequence and actualTravelTime
                    calculateActualTimeAndSequence(item?.data || [])

                    item.indexSection = index
                    if (index === 0) {
                        item.overTime = hasIcon
                    }
                    return item
                })
            } else {
                list.map((item) => {
                    calculateActualTimeAndSequence(item?.data || [])
                    return item
                })
            }
        }
        setEmployeeListData([...list])
    }

    const getVisitCount = (item, dayVisitCountObj) => {
        if (item?.SubType === VisitType.VISIT) {
            dayVisitCountObj[item.VisitDate]++
            weekVisits[item.VisitDate].push(item)
        }
    }
    const formatDayVisit = (data, obj, dayVisitCountObj) => {
        data.forEach((item) => {
            if (!item.Id) {
                return
            }
            if (!item.VisitDate) {
                const dateStr = moment(item.PlanStartTime).format(FORMAT_DATE_STRING)
                if (!obj[dateStr]) {
                    obj[dateStr] = [item]
                } else {
                    obj[dateStr].push(item)
                }
            } else {
                getVisitCount(item, dayVisitCountObj)
                if (!obj[item.VisitDate]) {
                    obj[item.VisitDate] = [item]
                } else {
                    obj[item.VisitDate].push(item)
                }
            }
        })
        const today = moment(new Date()).format(TIME_FORMAT.Y_MM_DD)
        if (Object.prototype.hasOwnProperty.call(obj, today)) {
            obj[today] = sortDataByVisitStatusAndSequence(obj[today])
        }
    }
    const getWeekObj = (tempW, obj) => {
        let flg = true
        currWeekDays.forEach((item) => {
            const day = item.fullYearDate
            const dayArr = obj[day] || []
            const dayMeetings = allWeekMeetings[day] || []
            if (dayArr.length) {
                const sectionArr = handleListData(
                    day,
                    dayArr,
                    employeeData,
                    employeeItemData,
                    setEmployeeItemData,
                    edit
                )
                if (ifDayCanSequence(day)) {
                    if (_.isEmpty(obj[day])) {
                        obj[day] = sectionArr[0].data
                    }
                } else {
                    if (!_.isEmpty(obj[day]) && _.isEmpty(obj[day][0]?.data)) {
                        obj[day] = sectionArr
                    } else {
                        obj[day] = [...obj[day], ...sectionArr]
                    }
                }
            }
            if (dayArr.length || dayMeetings.length) {
                tempW[day].abled = true

                if (flg && !obj[selDay] && !allWeekMeetings[selDay] && moment(day) > moment(selDay)) {
                    selDay = day
                    flg = false
                }
                const meetingTime = dayMeetings.reduce((a, b) => a + parseFloat(b.PlannedDuration || 0), 0)
                const dayEE = cloneDeep(dayArr.length ? employeeItemData[day] : defaultEeItem)
                if (employeeData.unassignedRoute) {
                    dayEE.totalDurationAndTravelTimeMins = dayEE?.totalHours
                } else {
                    dayEE.totalHours = getTotalTruncHours(dayEE?.totalHours, meetingTime)
                }
                employeeItemData[day] = dayEE
            }
        })
        const daysArr = Object.keys(tempW)
        if (!tempW[selDay]?.abled) {
            daysArr.forEach((day) => {
                if (flg && tempW[day].abled) {
                    selDay = day
                    flg = false
                }
            })
        }
    }

    const handleSortableListSticky = () => {
        setShowList(false)
        setTimeout(() => {
            setShowList(true)
        }, 0)
    }

    const handleOriginData = async (data, isRefresh?) => {
        const obj = {}
        const tempW = {}
        const dayVisitCountObj = {}
        weekVisits = {}
        currWeekDays.forEach((item) => {
            const day = item.fullYearDate
            tempW[day] = { sel: false, abled: false, fullSel: false }
            dayVisitCountObj[day] = 0
            weekVisits[day] = []
        })
        formatDayVisit(data, obj, dayVisitCountObj)
        getWeekObj(tempW, obj)
        const visits = Object.keys(obj)
        const meetings = Object.values(allWeekMeetings)

        const curDayMeetings = allWeekMeetings[selDay]
        const finishedCurDayMeetings = []
        curDayMeetings &&
            curDayMeetings.forEach((meeting) => {
                const startTime = meeting?.ChildActualStartTimeObj[employeeData.id]
                const endTime = meeting?.ChildActualEndTimeObj[employeeData.id]
                if (startTime && endTime) {
                    meeting.SubType = MeetingType.SCHEDULED_MEETING
                    meeting.actualStartTime = startTime
                    meeting.actualEndTime = endTime
                    meeting.visitList = meeting?.ChildVisitListIdObj[employeeData.id]
                    finishedCurDayMeetings.push(meeting)
                }
            })
        if (!visits.length && edit && !meetings.length) {
            const timeoutId = setTimeout(() => {
                clearTimeout(timeoutId)
                setModalVisible(false)
                setDeleteModalVisible(false)
                navigation.goBack()
            }, DEFAULT_DELAY_TIME)
            return
        }
        const daySelIndex = moment(selDay).day()
        const list = obj[selDay] || []
        // push past completed meetings to sectionList by visit list id
        if (!_.isEmpty(finishedCurDayMeetings)) {
            if (_.isArray(list)) {
                // sortable list data source
                if (_.isEmpty(list[0]?.data)) {
                    list.push(...finishedCurDayMeetings)
                } else {
                    // section list data source
                    for (const meetingItem of finishedCurDayMeetings) {
                        for (const listItem of list) {
                            if (listItem.vlId === meetingItem?.ChildVisitListIdObj[employeeData.id]) {
                                if (_.isArray(listItem?.data)) {
                                    listItem?.data.push(meetingItem)
                                }
                            }
                        }
                    }
                }
            } else {
                list.push(...finishedCurDayMeetings)
            }
        }
        if (isRefresh) {
            const tmp = []
            for (const key in weekData) {
                if (Object.prototype.hasOwnProperty.call(weekData, key)) {
                    weekData[key].forEach((e) => {
                        e.select && tmp.push(e.Id)
                    })
                }
            }
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    obj[key].forEach((t) => {
                        t.isEdit = edit
                        if (tmp.includes(t.Id)) {
                            t.select = true
                        }
                    })
                }
            }
        }
        monthWeekFilter.current?.selectDay(daySelIndex)
        const tempVlStatus = []
        const tempID = []
        data.forEach((e) => {
            if (e.VisitDate === selDay && tempID.indexOf(e.visitList) < 0) {
                tempVlStatus.push({
                    status: e.VlStatus,
                    Id: e.visitList
                })
                tempID.push(e.visitList)
            }
        })

        setTodayVlStatus(tempVlStatus)

        setIsCurDay(ifDayCanEdit(selDay))
        setCanSequence(ifDayCanSequence(selDay))
        setWeekData(obj)
        redefineListData(list)
        setEmployeeItem(employeeItemData[selDay])
        setWeekDaysSel({ ...tempW })
        setWeekDayVisitCount(dayVisitCountObj)
        setDayVisitCount(dayVisitCountObj[selDay])
        setDataLoading(false)
        setMeetingList(allWeekMeetings[selDay] || [])
        setIsInnit(false)
        setIsLoading(false)
        handleSortableListSticky()
    }
    const getManagerMeeting = async () => {
        const start = currWeekDays[0]?.fullYearDate
        const end = currWeekDays[currWeekDays.length - 1]?.fullYearDate
        try {
            const { weekObj } = await getPubEEMeetings(start, end, employeeData.id, true)
            allWeekMeetings = weekObj
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'ESL.getManagerMeeting', getStringValue(error))
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_EMPLOYEE_SCHEDULE_LIST_QUERY,
                error
            )
        }
    }
    const getTotalEvent = async (isRefresh?: boolean) => {
        try {
            _.isEmpty(notificationDate) && !isRefresh && setIsLoading(true)
            await getManagerMeeting()
            const res = await getOriginData(employeeData.id, currWeekDays, selDay)
            await handleOriginData(res, isRefresh)
        } catch (err) {
            setIsLoading(false)
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_EMPLOYEE_SCHEDULE_LIST_FAILED_TO_QUERY,
                err
            )
        }
    }

    const updateTodayListEditStatus = (list, canEdit) => {
        let firCanEditItemIndex = 0
        let firCanEditItemSection = 0
        let flg = true
        list.map((section, sectionIndex) => {
            const dataArr = section.data || []
            dataArr.map((item, index) => {
                if (itemCanSelected(item)) {
                    item.isEdit = canEdit
                    item.select = false
                    if (flg) {
                        firCanEditItemIndex = index
                        firCanEditItemSection = sectionIndex
                    }
                    flg = false
                }
                return item
            })

            return section
        })
        const params = {
            animated: true,
            itemIndex: firCanEditItemIndex,
            sectionIndex: firCanEditItemSection,
            viewOffset: 0,
            viewPosition: 0
        }
        !edit && isToday(selDay) && sectionList?.current?.scrollToLocation(params)
        return list
    }

    const queryDaily = async (ids) => {
        try {
            return await SoupService.retrieveDataFromSoup(
                'Visit_List__c',
                {},
                getObjByName('Visit_List__c').syncUpCreateFields,
                getObjByName('Visit_List__c').syncUpCreateQuery +
                    `
                WHERE {Visit_List__c:Id} IN (${getIdClause(ids)})
                `
            )
        } catch (error) {
            dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_VISIT_DETAILS_QUERY_DAILY, error)
            setIsLoading(false)
        }
    }

    const updateEmployeeInfoAfterSequence = (res: any) => {
        const totalTravelTime = res.totalTravelTime || '0'
        const totalMiles = res.totalDistance || '0'
        employItem.totalHours = getTotalHours(parseFloat(totalTravelTime), employItem.totalPlannedDurMin)
        employItem.totalMiles = parseFloat(totalMiles)
        setEmployeeItem({ ...employItem })
    }

    const updateSequenceData = async (whereClauseArr, allSequence) => {
        try {
            const updatedVisits: any[] = []
            const res = await database().use('Visit').select().where(whereClauseArr).getData()
            const existReSequenced = res.find((item) => allSequence[item.Id] !== item.Sequence__c)
            if (existReSequenced) {
                res.forEach((visit) => {
                    visit.Sequence__c = allSequence[visit.Id]
                    updatedVisits.push(visit)
                })
                await syncUpObjUpdateFromMem('Visit', filterExistFields('Visit', updatedVisits, ['Id', 'Sequence__c']))
                const vListId =
                    !_.isEmpty(todayVlStatus) && todayVlStatus.filter((e) => e.status !== VisitStatus.COMPLETED)[0]?.Id
                if (vListId) {
                    const calRes = await calculateDistanceAndTravelTime(vListId)
                    updateEmployeeInfoAfterSequence(calRes)
                } else {
                    setIsLoading(false)
                }
                await pushNotificationToMerch({
                    type: VisitOperationType.RE_SEQUENCE,
                    lstVisitId: updatedVisits?.map((item: any) => item.Id)
                })
            }
        } catch (err) {
            setIsLoading(false)
            storeClassLog(Log.MOBILE_ERROR, 'ESL.updateSequenceData', ErrorUtils.error2String(err))
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_SELECT_SCHEDULE_UPDATE_SEQUENCE_TO_SOUP,
                err
            )
        }
    }

    const checkDataAndReCalculate = async (checkVisitsOnly?, isGoBack?) => {
        try {
            setIsLoading(true)
            // current sort item
            const dayVisitsCount = weekVisits[selDay].length
            const tempDataArr = []
            const whereClauseArr = []
            const allSequence = {}
            const visitIds = []
            let visitListIds = []
            let currSequence = 1
            const employeeListDataLength = listOrder?.length || employeeListData?.length
            const allVisits = employeeListData.filter((item) => item?.SubType === VisitType.VISIT)
            let newWhereClauseArr = []
            for (let i = 0; i < employeeListDataLength; i++) {
                const index = !_.isEmpty(listOrder) ? parseInt(listOrder[i]) : i
                const item = employeeListData[index]
                if (item?.SubType === VisitType.VISIT) {
                    if (i === 0 || employeeListData[i]?.visitList !== employeeListData[i - 1]?.visitList) {
                        currSequence = 1
                        item.sequence = currSequence
                    } else {
                        currSequence++
                        item.sequence = currSequence
                    }
                    allSequence[item.Id] = currSequence
                    const clauseForSmartSql = {
                        leftTable: 'Visit',
                        leftField: 'Id',
                        rightField: `'${item.Id}'`,
                        operator: '=',
                        type: allVisits[0]?.Id === item?.Id || dayVisitsCount < 2 ? null : 'OR'
                    }
                    !_.isEmpty(clauseForSmartSql) && whereClauseArr.push(clauseForSmartSql)
                    visitIds.push(item.Id)
                    visitListIds.push(item?.visitList)
                }
                tempDataArr[i] = employeeListData[index]
            }
            const firstOrCondClause = whereClauseArr?.filter((item) => item.type === null)
            whereClauseArr?.splice(whereClauseArr.indexOf(firstOrCondClause[0]), 1)
            newWhereClauseArr = [...firstOrCondClause, ...whereClauseArr]
            visitListIds = _.uniq(visitListIds)
            setEmployeeListData(tempDataArr)
            const visitDataCheck = await checkDataForDeleteVisit(visitIds, visitListIds, checkVisitsOnly)
            if (!visitDataCheck) {
                setIsErrorShow(true)
                setIsLoading(false)
                setErrorMsgType(DataCheckMsgIndex.COMMON_MSG)
                return
            }
            const oldDailyVisitList = await queryDaily(visitListIds)
            oldDailyVisitList
                .filter((e) => e.Status__c !== VisitStatus.COMPLETED)
                .forEach((e) => {
                    e.Resequenced__c = true
                })
            await syncUpObjUpdateFromMem(
                'Visit_List__c',
                filterExistFields('Visit_List__c', oldDailyVisitList, ['Id', 'Resequenced__c'])
            )
            if (newWhereClauseArr.length > 0) {
                await updateSequenceData(newWhereClauseArr, allSequence)
            }
            if (!_.isEmpty(tempDataArr)) {
                const visitAndEvent = tempDataArr.filter((visit) => visit?.VisitDate)
                if (!_.isEmpty(visitAndEvent)) {
                    weekData[visitAndEvent[0]?.VisitDate] = tempDataArr
                }
            }
            setWeekData({ ...weekData })
            isGoBack && navigation.goBack()
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'ESL.checkDataAndReCalculate', getStringValue(e))
        }
    }

    const updateAllDataEditStatus = async (edit) => {
        if (!edit && canSequence && listOrder.length > 0) {
            handleSortableListSticky()
            await checkDataAndReCalculate()
        }
        try {
            const tempWeekData = _.cloneDeep(weekData)
            for (const [key, value] of Object.entries(tempWeekData)) {
                if (ifDayCanSequence(key)) {
                    tempWeekData[key] = updateCanSequenceListEditStatus(value, edit)
                } else if (isToday(key)) {
                    tempWeekData[key] = updateTodayListEditStatus(value, edit)
                } else {
                    tempWeekData[key] = updateTodayListEditStatus(value, false)
                }
            }
            for (const key in weekDaySel) {
                weekDaySel[key].fullSel = false
                weekDaySel[key].sel = false
            }
            setWeekDaysSel({ ...weekDaySel })
            setEdit(edit)
            setSelectData([])
            setSelAllWeek(false)
            !edit && setListOrder([])
            redefineListData(tempWeekData[selDay])
            setWeekData(tempWeekData)
            handleSortableListSticky()
            setIsLoading(false)
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'ESL.updateAllDataEditStatus', getStringValue(e))
        }
    }

    const onBackPress = async () => {
        if (edit && isToday(selDay)) {
            await checkDataAndReCalculate(false, true)
            setIsLoading(false)
        } else {
            navigation.goBack()
        }
    }
    const getSelectVisitHours = (item, tempArr) => {
        if (itemCanSelected(item) && item.select) {
            tempArr.push(item)
            return parseFloat(item.PlannedDurationMinutes || 0)
        }
        return 0
    }
    const getSelectDayCount = () => {
        let tempHours = 0
        const tempArr = []
        for (const [key, value] of Object.entries(weekData)) {
            if (isToday(key)) {
                value.forEach((section) => {
                    const dataArr = section.data || []
                    dataArr.forEach((item) => {
                        tempHours += getSelectVisitHours(item, tempArr)
                    })
                })
            }
            if (ifDayCanSequence(key)) {
                value.forEach((item) => {
                    tempHours += getSelectVisitHours(item, tempArr)
                })
            }
        }
        setSelectData([...tempArr])
        setSelectedTime(getTimeFromMins(tempHours))
    }
    const getDayCanEdit = (day?) => {
        const vDay = day || selDay
        const dayVisits = weekVisits[vDay] || []
        const canEditVisits = dayVisits.filter((item) => itemCanSelected(item))
        return canEditVisits.length > 0 && !isReadOnly
    }
    const updateWeekSelStatus = (wDaySel) => {
        let allWeekSel = true
        for (const [key] of Object.entries(weekVisits)) {
            const CurDay = ifDayCanEdit(key)
            if (CurDay && getDayCanEdit(key)) {
                allWeekSel = allWeekSel && wDaySel[key]?.fullSel
            }
        }
        return allWeekSel
    }

    const updateTodayVisitSelect = (list, select) => {
        list.forEach((section) => {
            const dataArr = section.data || []
            if (!_.isEmpty(dataArr)) {
                dataArr.forEach((item) => {
                    if (itemCanSelected(item)) {
                        item.select = select
                    }
                    return item
                })
            } else {
                if (itemCanSelected(section)) {
                    section.select = select
                }
            }
            return section
        })
        return list
    }
    const updateCanSequenceVisitSelect = (list, select) => {
        list.map((item) => {
            if (itemCanSelected(item)) {
                item.select = select
            }
            return item
        })
        return list
    }
    const selectAllDay = () => {
        const fullSel = !weekDaySel[selDay].fullSel
        weekDaySel[selDay].fullSel = fullSel
        weekDaySel[selDay].sel = fullSel
        let list: any[]
        if (isToday(selDay)) {
            list = updateTodayVisitSelect(employeeListData, fullSel)
            weekData[selDay] = list
            setWeekData({ ...weekData })
        } else {
            list = updateCanSequenceVisitSelect(weekData[selDay], fullSel)
        }
        const allWeekSel = updateWeekSelStatus(weekDaySel)
        setSelAllWeek(allWeekSel)
        setWeekDaysSel({ ...weekDaySel })
        getSelectDayCount()
        redefineListData(list)
    }
    const selectAllWeekDay = () => {
        const sel = !selAllWeek
        setSelAllWeek(sel)
        for (const [key, value] of Object.entries(weekData)) {
            const CurDay = ifDayCanEdit(key)
            if (!CurDay) {
                continue
            }
            weekDaySel[key].fullSel = sel && getDayCanEdit(key)
            weekDaySel[key].sel = sel && getDayCanEdit(key)
            let tempList: any[] = []
            if (isToday(key)) {
                tempList = updateTodayVisitSelect(value, sel)
            } else {
                tempList = updateCanSequenceVisitSelect(value, sel)
            }
            weekData[key] = tempList
            if (selDay === key) {
                redefineListData(tempList)
            }
        }
        getSelectDayCount()
        setWeekDaysSel({ ...weekDaySel })
        setWeekData({ ...weekData })
    }
    const onReassignClick = async () => {
        const visitObj = {}
        const allWeeks = getWeekLabel()
        selectData.forEach((item) => {
            const day = allWeeks[moment(item.VisitDate).day()]
            if (visitObj[day]) {
                visitObj[day].push(item)
            } else {
                visitObj[day] = [item]
            }
        })
        const selectDataForReassign = {
            ...employeeData,
            visits: visitObj
        }
        await checkDataAndReCalculate(true)
        setIsLoading(false)
        reassignModal.current?.openModal(selectDataForReassign)
    }
    const showReassignResult = async (event: any) => {
        setModalVisible(true)
        if (event) {
            pushNotificationToMerch({
                type: VisitOperationType.REASSIGN,
                lstVisitId: event.lstVisitId
            }).catch((err) => {
                storeClassLog(Log.MOBILE_ERROR, 'ESL.pushNotificationToMerch', getStringValue(err))
            })
            setSelectData([])
            getTotalEvent()
            setTotalAssign(String(event.count))
        }
        reassignModal.current?.closeModal()
        setIsLoading(false)
    }
    const deleteSelectToSoup = async (clausArr, deleteIds, callback) => {
        const oldVisitListIds = []
        let allUpdate = []
        const deleteVisits = []
        database()
            .use('Visit')
            .select()
            .where(clausArr)
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
                            deleteVisits.push(visit)
                        }
                    })
                }
                allUpdate = [...deleteVisits]
                if (allUpdate.length > 0) {
                    await updateOldVisitList(oldVisitListIds)
                    await syncUpObjUpdateFromMem(
                        'Visit',
                        filterExistFields('Visit', allUpdate, ['Id', 'Status__c', 'Route_Group__c', 'Visit_List__c'])
                    )
                    await updateVisitListToUnscheduled(oldVisitListIds[0], true)
                    for (const id of oldVisitListIds) {
                        await reSequenceByVisitListId(id)
                        await calculateDistanceAndTravelTime(id)
                    }
                    callback && callback(deleteVisits.length.toString())
                } else {
                    callback && callback()
                }
            })
            .catch((err) => {
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_EMPLOYEE_SCHEDULE_LIST_DELETE_SELECT_TO_SOUP,
                    err
                )
            })
    }

    const deleteAction = async () => {
        setIsLoading(true)
        const deleteIds = []
        const clausArr = []
        const dvlIdSet: Set<any> = new Set()
        for (let index = 0; index < selectData.length; index++) {
            const visit = selectData[index]
            const clauseForSmartSql = {
                leftTable: 'Visit',
                leftField: 'Id',
                rightField: `'${visit.Id}'`,
                operator: '=',
                type: index === 0 ? null : 'OR'
            }
            clausArr.push(clauseForSmartSql)
            deleteIds.push(visit.Id)
            dvlIdSet.add(visit.visitList)
        }

        const dvlIds: Array<string> = Array.from(dvlIdSet)
        const visitDataCheck = await checkDataForDeleteVisit(deleteIds, dvlIds, true)
        // use dvlId query dvl
        if (!visitDataCheck) {
            setIsLoading(false)
            setIsErrorShow(true)
            setErrorMsgType(DataCheckMsgIndex.COMMON_MSG)
            return
        }
        deleteSelectToSoup(clausArr, deleteIds, async (count) => {
            setSelectData([])
            setTotalDelete(count)
            setIsLoading(false)
            setDeleteModalVisible(true)
            await getTotalEvent()
        })
    }

    const deleteData = () => {
        let titleVisit = t.labels.PBNA_MOBILE_VISIT
        let contentVisit = t.labels.PBNA_MOBILE_THIS_VISIT
        let change = t.labels.PBNA_MOBILE_CHANGE
        if (selectData.length > 1) {
            titleVisit = t.labels.PBNA_MOBILE_VISITS
            contentVisit = t.labels.PBNA_MOBILE_THESE_VISITS
            change = t.labels.PBNA_MOBILE_CHANGES
        }
        Alert.alert(
            `${t.labels.PBNA_MOBILE_DELETE} ${titleVisit}?`,
            `${t.labels.PBNA_MOBILE_DELETE_VISIT_ALERT_LEFT} ${contentVisit}? ${t.labels.PBNA_MOBILE_YOUR} ${change} ${t.labels.PBNA_MOBILE_DELETE_VISIT_ALERT_RIGHT}.`,
            [
                {
                    text: t.labels.PBNA_MOBILE_NO
                },
                {
                    text: t.labels.PBNA_MOBILE_YES_DELETE,
                    onPress: deleteAction
                }
            ]
        )
    }
    const getCurWeekArr = () => {
        // initial week Data
        const days = route.params.tmpWeekArr
        if (days) {
            return days
        }
        const weekLabelArrObj = getWeekLabelArrObj()
        return weekLabelArrObj.tempWeekArr
    }
    const syncRefresh = async (isRefresh?) => {
        setIsLoading(true)
        setSelectData([])
        setSelAllWeek(false)
        await getData(store.getState().manager.selectedDate)
        await getTotalEvent(isRefresh)
    }
    const onChangeDate = async (date) => {
        const date1 = date.format(FORMAT_DATE_STRING)
        selDay = date1
        try {
            if (!edit) {
                await syncRefresh(true)
            } else {
                const CurDay = ifDayCanEdit(selDay)
                const list = weekData[date1] || []
                setDataLoading(false)

                setIsCurDay(CurDay)
                setCanSequence(ifDayCanSequence(selDay))
                redefineListData(list)
                setDayVisitCount(weekDayVisitCount[selDay])
                setEmployeeItem(employeeItemData[selDay])
                setMeetingList(allWeekMeetings[selDay] || [])
                handleSortableListSticky()
            }
        } catch (error) {
            setIsLoading(false)
        }
    }
    const refresh = async () => {
        setDataLoading(true)
        await syncDownDataByTableNames()
        getTotalEvent(true)
    }
    const updateSequence = async (key, order) => {
        try {
            setIsLoading(true)
            // prevent user from re-sequence visits which status is completed or inProgress.
            const tmpOrder = order.toString().split(',')
            const tmpData = _.cloneDeep(employeeListData)
            let flag = false
            let wholeCanSequenceVisitsAmount = 0
            // find the visitList with status is not COMPLETED and calculate the amount of the visits which be sequenced
            todayVlStatus.forEach((e) => {
                if (e.status !== VisitStatus.COMPLETED) {
                    wholeCanSequenceVisitsAmount = vlListSortById[e.Id]?.filter(
                        (item) => item.status !== VisitStatus.IN_PROGRESS && item.status !== VisitStatus.COMPLETE
                    ).length
                }
            })
            const wholeCantSequenceVisitsAmount = employeeListData.length - wholeCanSequenceVisitsAmount
            for (let i = 0; i < wholeCantSequenceVisitsAmount; i++) {
                if (parseInt(tmpOrder[i]) !== i) {
                    flag = true
                }
            }
            if (flag) {
                setEmployeeListData(tmpData)
                setIsLoading(false)
                return
            }
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'ESL.updateSequence', ErrorUtils.error2String(e))
            setIsLoading(false)
        }
        setListOrder(order)
        setIsLoading(false)
    }
    const getEditView = () => {
        if (isCurDay && getDayCanEdit()) {
            return (
                <TouchableOpacity style={styles.editBtn} onPress={() => dayVisitCount && updateAllDataEditStatus(true)}>
                    <CText style={styles.editText}>{t.labels.PBNA_MOBILE_EDIT}</CText>
                </TouchableOpacity>
            )
        }
        return <View />
    }
    const sortItemClick = (key) => {
        if (edit) {
            let dayFullSel = true
            let daySel = false
            employeeListData.forEach((item) => {
                if (itemCanSelected(item)) {
                    if (item.Id === key.Id) {
                        item.select = !item.select
                    }
                    dayFullSel = dayFullSel && item.select
                    daySel = daySel || item.select
                }
            })
            const tempWeekDaySel = _.cloneDeep(weekDaySel)
            tempWeekDaySel[selDay].fullSel = dayFullSel
            tempWeekDaySel[selDay].sel = daySel
            weekData[selDay] = employeeListData
            const tempWeekSel = updateWeekSelStatus(tempWeekDaySel)
            getSelectDayCount()
            setWeekDaysSel({ ...tempWeekDaySel })
            setSelAllWeek(tempWeekSel)
            setWeekData({ ...weekData })
            setEmployeeListData([...employeeListData])
        }
    }

    const renderSortableVisitCard = (cellItem) => {
        const { plannedTravelTime, plannedTravelTimeStr, actualTravelTimeStr } = formatTravelTime(cellItem)
        return (
            <View>
                {cellItem?.showTravelTime &&
                    renderTravelTime(
                        plannedTravelTime,
                        cellItem.actualTravelTime,
                        plannedTravelTimeStr,
                        actualTravelTimeStr
                    )}
                <ScheduleVisitCard
                    navigation={navigation}
                    item={cellItem}
                    deliveryInfo={cellItem.deliveryInfo || {}}
                    isVisitList
                    addVisits={false}
                    fromEmployeeSchedule
                    showCompletedWO
                    onCheckBoxClick={sortItemClick}
                />
            </View>
        )
    }

    const renderHeaderAndFooter = (title, section, isStart, isSortableList?, dataObj?) => {
        let timeAM = null
        let showHeard = false
        let showTime = false
        const titleStr = (isStart ? section.title : section.footTitle) || ''
        const todayDate = moment(new Date())
        const listDate = moment(section.visitDate)
        const isToday = todayDate.isSame(listDate, MOMENT_STARTOF.DAY)
        const hadStarted = titleStr.indexOf('+000') > -1
        const isFirstSec = section.id === 0
        let dateStr = ''
        const punchInTime =
            section?.punchIn || dataObj?.punchIn
                ? ` ${formatWithTimeZone(section.punchIn || dataObj.punchIn, TIME_FORMAT.HMMA, true, false)}`
                : null
        const punchOutTime =
            section?.punchOut || dataObj?.punchOut
                ? ` ${formatWithTimeZone(section.punchOut || dataObj.punchOut, TIME_FORMAT.HMMA, true, false)}`
                : null
        if (isToday && !hadStarted && isStart && isFirstSec) {
            timeAM = (employeeData.firstName || '') + ' ' + t.labels.PBNA_MOBILE_NOT_START
            showHeard = true
        } else if (hadStarted) {
            timeAM = ` ${formatWithTimeZone(titleStr, TIME_FORMAT.HMMA, true, true)}`
            dateStr = ` | ${formatWithTimeZone(titleStr, TIME_FORMAT.DDD_MMM_DD_YYYY, true, false)}`
            showHeard = true
            showTime = true
        }
        const showLineSec = section.indexSection > 0
        if (showHeard) {
            return (
                <View>
                    <View>
                        {isStart && showLineSec && <View style={styles.sectionLine} />}
                        {(title === t.labels.PBNA_MOBILE_DAY_ENDED_AT ||
                            title === t.labels.PBNA_MOBILE_SHIFT_ENDED_AT) &&
                            renderGapTime(t.labels.PBNA_MOBILE_GAP_TIME, section?.data[0]?.EndGap)}
                        {(title === t.labels.PBNA_MOBILE_DAY_STARTED_AT ||
                            title === t.labels.PBNA_MOBILE_SHIFT_STARTED_AT) &&
                            punchInTime &&
                            renderKronosActual(punchInTime, styles.marginTop_10)}
                        <View style={styles.sectionHeader}>
                            {showTime && <CText style={styles.headerTitle}>{title}</CText>}
                            <CText style={styles.timeTitle}>{timeAM}</CText>
                            <CText style={styles.headerTitle}>{dateStr}</CText>
                            {isStart && section.overTime && (
                                <ERROR_DELIVERY width={12} height={12} style={styles.overTime} />
                            )}
                        </View>
                        {(title === t.labels.PBNA_MOBILE_DAY_STARTED_AT ||
                            title === t.labels.PBNA_MOBILE_SHIFT_STARTED_AT) &&
                            renderGapTime(t.labels.PBNA_MOBILE_GAP_TIME, section?.data[0]?.StartGap)}
                    </View>
                    {(title === t.labels.PBNA_MOBILE_DAY_ENDED_AT || title === t.labels.PBNA_MOBILE_SHIFT_ENDED_AT) &&
                        punchOutTime &&
                        renderKronosActual(punchOutTime, styles.marginBottom_10)}
                </View>
            )
        }
        if (isSortableList) {
            let titleStr = ''
            if (dataObj.endTime) {
                titleStr = dataObj.endTime
            } else {
                titleStr = dataObj.startTime
            }
            timeAM = ` ${formatWithTimeZone(titleStr, TIME_FORMAT.HMMA, true, true)}`
            dateStr = ` | ${formatWithTimeZone(titleStr, TIME_FORMAT.DDD_MMM_DD_YYYY, true, false)}`
            return (
                <>
                    <View>
                        {(title === t.labels.PBNA_MOBILE_DAY_STARTED_AT ||
                            title === t.labels.PBNA_MOBILE_SHIFT_STARTED_AT) &&
                            punchInTime &&
                            renderKronosActual(punchInTime, styles.marginTop_10)}
                        <View style={dataObj.endTime ? styles.endTimeStyle : styles.startTimeStyle}>
                            <CText style={styles.headerTitle}>{title}</CText>
                            <CText style={styles.timeTitle}>{timeAM}</CText>
                            <CText style={styles.headerTitle}>{dateStr}</CText>
                        </View>
                        {(title === t.labels.PBNA_MOBILE_DAY_ENDED_AT ||
                            title === t.labels.PBNA_MOBILE_SHIFT_ENDED_AT) &&
                            punchOutTime &&
                            renderKronosActual(punchOutTime, styles.marginTop_10)}
                    </View>
                    {title === t.labels.PBNA_MOBILE_SHIFT_ENDED_AT && <View style={styles.divideLine} />}
                </>
            )
        }
        if ((punchInTime || punchOutTime) && !titleStr) {
            return (
                <View>
                    {(title === t.labels.PBNA_MOBILE_DAY_STARTED_AT ||
                        title === t.labels.PBNA_MOBILE_SHIFT_STARTED_AT) &&
                        punchInTime &&
                        renderKronosActual(punchInTime, styles.marginBottom_10)}
                    {(title === t.labels.PBNA_MOBILE_DAY_ENDED_AT || title === t.labels.PBNA_MOBILE_SHIFT_ENDED_AT) &&
                        punchOutTime &&
                        renderKronosActual(punchOutTime)}
                </View>
            )
        }
    }

    // for current day
    const renderSortableItem = ({ data, index }: { data: any; index: any; key: any }) => {
        const cellItem = data || {}
        const currentId = cellItem.Id
        if (!currentId) {
            return null
        }
        const cellType =
            data.SubType !== VisitType.VISIT &&
            data.type !== SORTABLE_LIST_TIPS &&
            data.SubType !== MeetingType.SCHEDULED_MEETING &&
            data.type !== GAP_TIME
        cellItem.index = index
        if (cellType) {
            return <MeetingList item={cellItem} fromEmployeeSchedule />
        }
        if (data.SubType === MeetingType.SCHEDULED_MEETING) {
            return renderMeetingItem(data)
        }
        if (data.type === SORTABLE_LIST_TIPS) {
            return renderHeaderAndFooter(data.content, {}, true, true, data)
        }
        if (data.type === GAP_TIME) {
            const gapTime = data.startGap || data.endGap
            return renderGapTime(data.content, gapTime || 0)
        }
        if (edit) {
            return renderSortableVisitCard(cellItem)
        }
        return <TouchableOpacity>{renderSortableVisitCard(cellItem)}</TouchableOpacity>
    }

    useEffect(() => {
        setLoggedInUserTimezone()
        setIsInnit(true)
        // when swipe back to previous page
        navigation.addListener(EventEmitterType.BEFORE_REMOVE, () => {
            NativeAppEventEmitter.emit(EventEmitterType.REFRESH_NSL)
        })
        return () => {
            navigation.removeListener(EventEmitterType.BEFORE_REMOVE)
        }
    }, [])

    const getReassignEEList = async () => {
        const startDate = currWeekDays[0].fullYearDate
        const endDate = currWeekDays[currWeekDays.length - 1].fullYearDate
        getReassignEmployeeList(startDate, endDate, setIsLoading, getEmployeeListForReassign, dropDownRef, setSVGId)
    }
    useEffect(() => {
        let refreshEvent = null
        if (!isReadOnly) {
            refreshEvent = NativeAppEventEmitter.addListener(EventEmitterType.REFRESH_ESL, () => {
                const timeoutId = setTimeout(async () => {
                    clearTimeout(timeoutId)
                    setEdit(false)
                    setSelectData([])
                    await syncRefresh()
                    await getReassignEEList()
                    setIsLoading(false)
                }, DEFAULT_DELAY_TIME / 2)
            })
        }
        return () => {
            refreshEvent && refreshEvent.remove()
        }
    }, [])
    useEffect(() => {
        currWeekDays = getCurWeekArr()
        const day = notificationDate || manager.selectedDate || moment()
        selDay = day.format(FORMAT_DATE_STRING)
        const CurDay = ifDayCanEdit(selDay)
        setIsCurDay(CurDay)
        !isReadOnly && getReassignEEList()
        getWorkScheduleFromLocal(workSchedule, employeeData)
            .then((res) => {
                workSchedule = res
                getTotalEvent()
            })
            .catch(() => {
                getTotalEvent()
            })
    }, [manager.selectedDate, employeeData])

    // for past days
    const renderSectionListItem = (item) => {
        const cellItem = item || {}
        const currentId = cellItem.Id
        if (!currentId) {
            return null
        }

        cellItem.Longitude = cellItem.longitude
        cellItem.Latitude = cellItem.latitude
        if (cellItem.storeLocation) {
            const location = JSON.parse(cellItem.storeLocation)
            if (location && location.longitude && location.latitude) {
                cellItem.Longitude = location.longitude
                cellItem.Latitude = location.latitude
            }
        }
        if (item.SubType === MeetingType.SCHEDULED_MEETING) {
            return renderMeetingItem(item)
        }
        if (item.SubType === VisitType.VISIT) {
            return renderSortableVisitCard(cellItem)
        }
        return <MeetingList item={cellItem} fromEmployeeSchedule />
    }

    const renderMapView = () => {
        // there is two  type List . The data structure of each list is different .If can not  Sequence there is sectionArr

        return (
            <MapScreen
                selectedDay={selDay}
                navigation={navigation}
                mapScreenStyle={commonStyle.flex_1}
                incomingVisits={getIncomingVisits(canSequence, employeeListData)}
                employeeListData={employeeListData}
                isMM
                employItem={employItem}
            />
        )
    }
    const renderReassinView = () => {
        if (!edit || !getDayCanEdit() || !isCurDay) {
            return <View />
        }

        return (
            <View style={styles.editCon}>
                <CText style={SelectScheduleStyle.checkBoxTitle}>
                    {dayVisitCount} {dayVisitCount === 1 ? 'VISIT' : 'VISITS'}
                </CText>
                <View style={SelectScheduleStyle.checkBoxItemContainer}>
                    <CCheckBox
                        onPress={selectAllDay}
                        title={
                            <CText style={SelectScheduleStyle.checkBoxItemText}>
                                {t.labels.PBNA_MOBILE_FULL_DAY.toLocaleUpperCase()}
                            </CText>
                        }
                        checked={weekDaySel[selDay] && weekDaySel[selDay].fullSel}
                        containerStyle={SelectScheduleStyle.checkBoxItem}
                    />
                    <CCheckBox
                        onPress={selectAllWeekDay}
                        title={
                            <CText style={SelectScheduleStyle.checkBoxItemText}>
                                {t.labels.PBNA_MOBILE_FULL_WEEK.toLocaleUpperCase()}
                            </CText>
                        }
                        checked={selAllWeek}
                        containerStyle={SelectScheduleStyle.checkBoxItem}
                    />
                    <TouchableOpacity style={styles.doneBtn} onPress={() => updateAllDataEditStatus(false)}>
                        <CText style={styles.editText}>{t.labels.PBNA_MOBILE_DONE}</CText>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const renderEditView = () => {
        if (!dayVisitCount) {
            return <View />
        }
        return (
            <View>
                {!edit && (
                    <View style={styles.editCon}>
                        <CText style={SelectScheduleStyle.checkBoxTitle}>
                            {dayVisitCount}{' '}
                            {dayVisitCount === 1
                                ? t.labels.PBNA_MOBILE_VISIT.toLocaleUpperCase()
                                : t.labels.PBNA_MOBILE_VISITS.toLocaleUpperCase()}
                        </CText>
                        {getEditView()}
                    </View>
                )}
                {edit && (!isCurDay || !getDayCanEdit()) && (
                    <View style={styles.editCon}>
                        <CText style={SelectScheduleStyle.checkBoxTitle}>
                            {dayVisitCount}{' '}
                            {dayVisitCount === 1
                                ? t.labels.PBNA_MOBILE_VISIT.toLocaleUpperCase()
                                : t.labels.PBNA_MOBILE_VISITS.toLocaleUpperCase()}
                        </CText>
                        <View />
                    </View>
                )}
                {renderReassinView()}
            </View>
        )
    }

    const renderMeetingList = () => {
        const unfinishedMeetingList = meetingList.filter((meeting) => {
            const isCompleted = meeting?.ChildActualEndTimeObj[employeeData.id]
            return !isCompleted
        })
        if (!unfinishedMeetingList.length) {
            return null
        }
        return <View style={styles.meetingList}>{unfinishedMeetingList.map(renderMeetingItem)}</View>
    }

    const renderSortableList = () => {
        if (!canSequence) {
            return
        }
        return (
            <SortableList
                keyExtractor={(item) => item.Id}
                style={[styles.sortableList, { display: canSequence ? 'flex' : 'none' }]}
                sortingEnabled={edit}
                innerContainerStyle={styles.sortableListInner}
                data={employeeListData}
                decelerationRate={null}
                onReleaseRow={updateSequence}
                onPressRow={sortItemClick}
                renderRow={renderSortableItem}
                renderHeader={renderMeetingList}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControlM loading={dataLoading} refreshAction={refresh} />}
            />
        )
    }
    const renderSectionList = () => {
        if (canSequence) {
            return
        }
        const list = employeeListData[0]?.data ? employeeListData : []
        return (
            <SectionList
                style={styles.sectionList}
                ref={sectionList}
                sections={list}
                extraData={list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => renderSectionListItem(item)}
                ListHeaderComponent={renderMeetingList}
                keyExtractor={(item, index) => item + index}
                renderSectionHeader={({ section }) => {
                    return renderHeaderAndFooter(
                        section.indexSection === 0
                            ? t.labels.PBNA_MOBILE_DAY_STARTED_AT
                            : t.labels.PBNA_MOBILE_SHIFT_STARTED_AT,
                        section,
                        true
                    )
                }}
                renderSectionFooter={({ section }) => {
                    return renderHeaderAndFooter(
                        section.indexSection === list.length - 1
                            ? t.labels.PBNA_MOBILE_DAY_ENDED_AT
                            : t.labels.PBNA_MOBILE_SHIFT_ENDED_AT,
                        section,
                        false
                    )
                }}
                contentContainerStyle={styles.paddingBottom22}
                stickySectionHeadersEnabled={false}
                refreshControl={<RefreshControlM loading={dataLoading} refreshAction={refresh} />}
            />
        )
    }
    const renderListView = () => {
        return (
            <View style={styles.flexPadding}>
                {renderEditView()}
                {showList && renderSortableList()}
                {renderSectionList()}
            </View>
        )
    }
    const handleUnassignVisits = async () => {
        const updateIds = []
        const oldVisitListIds = []
        for (const key in weekData) {
            if (Object.prototype.hasOwnProperty.call(weekData, key)) {
                const element = weekData[key].filter((item) => item?.SubType === VisitType.VISIT)
                if (_.isEmpty(element[0]?.data)) {
                    element.forEach((e) => {
                        e.select && updateIds.push(e.id)
                    })
                }
            }
        }
        const selectData = await SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            getObjByName('Visit').syncUpCreateFields,
            getObjByName('Visit').syncUpCreateQuery +
                `
            WHERE {Visit:Id} IN (${getIdClause(updateIds)})
            `
        )
        selectData.forEach((e) => {
            if (!oldVisitListIds.includes(e.Visit_List__c) && e.Visit_List__c) {
                oldVisitListIds.push(e.Visit_List__c)
            }
            e.VisitorId = ''
            e.Visit_List__c = ''
            e.OwnerId = CommonParam.userId
        })
        setTotalUnassign(selectData.length.toString())
        return { selectData, updateIds, oldVisitListIds }
    }
    const onUnassignClick = async () => {
        try {
            await checkDataAndReCalculate(true)
            setIsLoading(true)
            const { selectData, oldVisitListIds } = await handleUnassignVisits()
            await syncUpObjUpdateFromMem(
                'Visit',
                filterExistFields('Visit', selectData, ['Id', 'VisitorId', 'Visit_List__c', 'OwnerId'])
            )
            await updateOldVisitList(oldVisitListIds)
            await updateVisitListToUnscheduled(oldVisitListIds[0], true)
            for (const id of oldVisitListIds) {
                await reSequenceByVisitListId(id)
                await calculateDistanceAndTravelTime(id)
            }
            await getTotalEvent()
            setIsLoading(false)
            setSelectData([])
            setUnassignModalVisible(true)
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'ESL.onUnassignClick', getStringValue(e))
            setIsLoading(false)
        }
    }
    const renderOperationView = () => {
        return (
            <>
                {selectData.length > 0 && (
                    <View style={[SelectScheduleStyle.selectedBox, { marginHorizontal: 22 }]}>
                        <View style={SelectScheduleStyle.boxTitle}>
                            <CText style={SelectScheduleStyle.selectedVisit}>
                                {selectData.length}
                                {selectData.length === 1
                                    ? ` ${t.labels.PBNA_MOBILE_VISIT}`
                                    : ` ${t.labels.PBNA_MOBILE_VISITS}`}
                                {` ${t.labels.PBNA_MOBILE_SELECTED}`}
                            </CText>
                            <CText style={SelectScheduleStyle.selectedInfo}>{selectedTime}</CText>
                        </View>
                        <View style={SelectScheduleStyle.btnGroup}>
                            <TouchableOpacity
                                style={SelectScheduleStyle.flexRowCenter}
                                onPress={!defaultEeItem?.unassignedRoute && onUnassignClick}
                                disabled={defaultEeItem?.unassignedRoute}
                            >
                                <Image
                                    source={IMG_MODAL_CLEAR}
                                    style={[
                                        SelectScheduleStyle.btnIcon,
                                        defaultEeItem?.unassignedRoute && SelectScheduleStyle.inactiveBtnIcon
                                    ]}
                                />
                                <CText
                                    style={[
                                        SelectScheduleStyle.btnText,
                                        defaultEeItem?.unassignedRoute && SelectScheduleStyle.inactiveBtnText
                                    ]}
                                >
                                    {t.labels.PBNA_MOBILE_UNASSIGN}
                                </CText>
                            </TouchableOpacity>
                            <TouchableOpacity style={SelectScheduleStyle.flexRowCenter} onPress={deleteData}>
                                <Image source={IMG_MODAL_DELETE} style={SelectScheduleStyle.btnIcon} />
                                <CText style={SelectScheduleStyle.btnText}>
                                    {t.labels.PBNA_MOBILE_DELETE.toUpperCase()}
                                </CText>
                            </TouchableOpacity>
                            <TouchableOpacity style={SelectScheduleStyle.flexRowCenter} onPress={onReassignClick}>
                                <Image source={IMG_MODAL_REASSIGN} style={SelectScheduleStyle.btnIcon} />
                                <CText style={SelectScheduleStyle.btnText}>
                                    {t.labels.PBNA_MOBILE_REASSIGN.toUpperCase()}
                                </CText>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <NavigationBar
                    left={<BackButton navigation={navigation} onBackPress={onBackPress} />}
                    title={t.labels.PBNA_MOBILE_EMPLOYEE_SCHEDULE}
                    right={
                        !isReadOnly && (
                            <TouchableOpacity
                                style={styles.imgAddButton}
                                onPress={() => {
                                    navigation?.navigate(NavigationRoute.ADD_A_VISIT, {
                                        isESchedule: false,
                                        isPublished: true,
                                        planDate: moment(selDay).isBefore(moment()) ? moment() : selDay,
                                        userData: employeeData,
                                        employeePublish: true
                                    })
                                }}
                            >
                                <Image style={styles.imgAdd} source={iconAdd} />
                            </TouchableOpacity>
                        )
                    }
                />
            </View>
            {!defaultEeItem?.unassignedRoute && (
                <EmployeeCell
                    item={employItem || defaultEeItem}
                    index={0}
                    isReview
                    fromEmployeeSchedule
                    navigation={navigation}
                />
            )}
            {defaultEeItem?.unassignedRoute && (
                <View style={styles.marginLeft_22}>
                    <UnassignedRouteCell item={employItem || defaultEeItem} manager={manager} />
                </View>
            )}
            {renderOperationView()}
            <MonthWeekFilter
                cRef={monthWeekFilter}
                isShowWeek
                fromEmployeeSchedule
                editEmployeeSchedule={edit}
                selectedDay={route.params.selectedDay}
                selectedWeek={route.params.selectedWeek}
                tmpWeekArr={route.params.tmpWeekArr}
                weekDaySel={Object.values(weekDaySel)}
                onchangeDate={(date) => onChangeDate(date)}
                onSetWeekArr={(week) => {
                    currWeekDays = week
                    if (!isInit) {
                        getTotalEvent()
                    }
                    getReassignEEList()
                }}
            />
            {!isMapView ? renderListView() : renderMapView()}
            <MapDraggable setIsMapView={setIsMapView} isMapView={isMapView} />

            <ReassignModal
                type={ReassignModalType.ReassignModalType_Published}
                cRef={reassignModal}
                navigation={navigation}
                userData={employeeData}
                isEmployee
                data={manager.employeeListForReassign}
                selectDataLength={selectData.length}
                selectedTime={selectedTime}
                reassignCallBack={(count) => showReassignResult(count)}
                setIsLoading={setIsLoading}
                setErrorMsgType={setErrorMsgType}
                setIsErrorShow={setIsErrorShow}
                visitListId={SVGId}
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
                cRef={reassignResultModal}
                navigation={navigation}
                reassignType={VisitOperationType.REASSIGN}
                totalAssign={totalAssign}
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
            />
            <ReassignResultModal
                cRef={unassignResultModal}
                navigation={navigation}
                reassignType={VisitOperationType.UNASSIGN}
                totalAssign={totalUnassign}
                modalVisible={unassignModalVisible}
                setModalVisible={setUnassignModalVisible}
            />
            <ErrorMsgModal
                index={errorMsgType}
                visible={isErrorShow}
                setModalVisible={setIsErrorShow}
                handleClick={syncRefresh}
            />
            <Loading isLoading={isLoading} />
        </View>
    )
}

export default EmployeeScheduleList

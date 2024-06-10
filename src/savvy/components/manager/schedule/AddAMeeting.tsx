/**
 * @description Add a meeting.
 * @author Beichen Li
 * @email beichen.a.li@pwc.com
 * @date 2021-08-18
 */

import React, { useEffect, useState } from 'react'
import {
    View,
    Image,
    ScrollView,
    Modal,
    TextInput,
    TouchableOpacity,
    NativeAppEventEmitter,
    SafeAreaView,
    Alert
} from 'react-native'
import CText from '../../../../common/components/CText'
import DateTimePicker from '@react-native-community/datetimepicker'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import moment from 'moment-timezone'

import {
    DEFAULT_DELAY_TIME,
    getDefaultStartTime,
    getQuerySeq,
    getRandomBetweenTwoNum,
    getTimeList,
    promisesOneByOne,
    queryAndSyncScheduleVisitList,
    queryScheduleVisit,
    getRecordTypeIdByDeveloperName
} from '../../../utils/MerchManagerUtils'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import PickerModal from '../common/PickerModal'
import _ from 'lodash'
import BlueClear from '../../../../../assets/image/ios-close-circle-outline-blue.svg'
import { getObjByName, syncDownObj, syncUpObjUpdate, syncUpObjUpdateFromMem } from '../../../api/SyncUtils'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import ReassignResultModal from '../common/ReassignResultModal'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Loading from '../../../../common/components/Loading'
import AddAMeetingStyle from '../../../styles/manager/AddAMeetingStyle'
import { SoupService } from '../../../service/SoupService'
import ScheduleQuery from '../../../queries/ScheduleQuery'
import { formatString } from '../../../utils/CommonUtils'
import { CommonParam } from '../../../../common/CommonParam'
import {
    computeMyTeamData,
    getIdClause,
    handleDeleteMeeting,
    isNullSpace,
    recalculateKPIBySVGAccepted,
    removeAlert,
    updateUnscheduledVisitListByDVLId,
    updateVisitListToUnscheduled
} from '../helper/MerchManagerHelper'
import { queryAndSyncDailyForAdd, queryAndSyncWeeklyForAdd } from '../service/AddAVisitService'
import { database } from '../../../common/SmartSql'
import { computeSmartClause } from '../../../utils/MerchManagerComputeUtils'
import { useSelector } from 'react-redux'
import ErrorMsgModal from '../common/ErrorMsgModal'
import {
    CommonString,
    DataCheckMsgIndex,
    DropDownType,
    EventEmitterType,
    NavigationPopNum,
    NavigationRoute,
    SVGDataCheckStatus
} from '../../../enums/Manager'
import { checkMeetingDataCheck, checkSVGDataModifiedById, dataCheckWithSVG } from '../service/DataCheckService'
import MeetingBar, { BAR_TYPE } from '../../merchandiser/MeetingBar'
import { formatWithTimeZone, isTodayDayWithTimeZone, setLoggedInUserTimezone } from '../../../utils/TimeZoneUtils'
import { formatClock } from '../../../common/DateTimeUtils'
import { NUMBER_VALUE } from '../../../enums/MerchandiserEnums'
import { VisitListStatus } from '../../../enums/VisitList'
import { CommonLabel } from '../../../enums/CommonLabel'
import { getMeetingInfo } from '../../../api/ApexApis'
import { t } from '../../../../common/i18n/t'
import { isPersonaDelSupOrSDL } from '../../../../common/enums/Persona'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { getAttendeesWithEvent } from '../../../helper/merchandiser/MyVisitEventHelper'
import { DatePickerLocale } from '../../../enums/i18n'
import { filterExistFields } from '../../../utils/SyncUtils'
import { abortExecutionAndAlertWhenCanceling } from '../helper/VisitHelper'
import { isCurrentVlPastAndShiftUser } from '../../../helper/merchandiser/MyVisitDataHelper'
import { meetingClickFunction } from '../../../helper/manager/AllManagerMyDayHelper'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { MOMENT_UNIT } from '../../../../common/enums/MomentUnit'
import { MOMENT_STARTOF } from '../../../../common/enums/MomentStartOf'
import { addDaysToToday } from '../../../../common/utils/YMDUtils'
import { IntervalTime } from '../../../enums/Contract'

const styles = AddAMeetingStyle
const IMG_CLOCK_BLUE = ImageSrc.IMG_CLOCK_BLUE
const START_TIME_MODAL = 0
const END_TIME_MODAL = 1
interface AddAMeetingProps {
    navigation?: any
    route?: any
}
setLoggedInUserTimezone()
const getTitle = (isEdit: boolean) => {
    if (isEdit) {
        return t.labels.PBNA_MOBILE_MEETING_DETAILS
    }
    return t.labels.PBNA_MOBILE_ADD_A_MEETING
}

const getLocation = (currentLocation) => {
    if (currentLocation === CommonString.EMPTY) {
        return t.labels.PBNA_MOBILE_SEARCH_LOCATION
    }
    return currentLocation
}
const getMeetingStatus = (tempInfo) => {
    if (tempInfo.Actual_Start_Time__c && tempInfo.Actual_End_Time__c) {
        return BAR_TYPE.FINISH
    } else if (tempInfo.Actual_Start_Time__c && !tempInfo.Actual_End_Time__c) {
        return BAR_TYPE.INPROGRESS
    }
    return BAR_TYPE.UNSTART
}

const getMeetingBarDisable = (currentEvent, dayStart, clockStart) => {
    let condition
    if (isCurrentVlPastAndShiftUser()) {
        condition = addDaysToToday(-1, true) !== moment(currentEvent.StartDateTime).format(TIME_FORMAT.Y_MM_DD)
    } else {
        condition = !isTodayDayWithTimeZone(currentEvent.StartDateTime, true)
    }
    return (
        getMeetingStatus(currentEvent) === BAR_TYPE.FINISH ||
        (clockStart && getMeetingStatus(currentEvent) !== BAR_TYPE.INPROGRESS) ||
        CommonParam.isSyncing ||
        (!isTodayDayWithTimeZone(currentEvent.StartDateTime, true) && condition) ||
        !dayStart
    )
}

const managerReducer = (store) => store.manager

export const getTimeAfterElevenThirty = (defaultStartTime: any, planDate: any) => {
    return (
        (defaultStartTime === CommonLabel.MIDNIGHT &&
            moment(planDate).format(TIME_FORMAT.MMDDY) === moment().format(TIME_FORMAT.MMDDY)) ||
        defaultStartTime === CommonLabel.ELEVEN_FORTY_FIVE
    )
}

const AddAMeeting = (props: AddAMeetingProps) => {
    // isEmployee   judge whether the user enter the meeting page from the employee details page or not,
    // hide the duplicate&remove button if yes
    // isReadOnly   judge whether the user enter the meeting page from the readonly page or not,
    // isDuplicate   judge whether the user enter the meeting page from the duplicate details page or not,
    // bind the value and change the validation rules if yes
    // isRNSMeeting judge whether the user enter the meeting page from rnsMeeting details or rnsMeeting add,
    // restrict the datetime option
    // dateOptions   if isRNSmeeting true, get the datetime picker options
    // isMerchandiser  judge whether the user is merchandiser
    const { navigation, route } = props
    let serviceInterval = null
    const isReadOnly = route.params.isReadOnly
    let EventId = CommonString.EMPTY
    let isEmployee = CommonString.EMPTY
    let isRNSMeeting = false
    let isMerchandiser = false
    let clockStart = false
    let dayStart = false
    let eventItem: any = {}
    let onPressStartMeeting = null
    let onPressEndMeeting = null
    const isSDLOrDelSup = isPersonaDelSupOrSDL()
    const isFromESL = route.params.isFromESL
    const isFromRNSView = route.params.isFromRNSView
    if (route.params.Id) {
        EventId = route.params.Id
    }
    if (route.params.isEmployee) {
        isEmployee = route.params.isEmployee
    }
    if (route.params.isMerchandiser) {
        isMerchandiser = route.params.isMerchandiser
        clockStart = route.params.clockStart
        dayStart = route.params.dayStart
        eventItem = route.params.eventItem || {}
        onPressStartMeeting = route.params.onPressStartMeeting
        onPressEndMeeting = route.params.onPressEndMeeting
    }
    if (route.params.isRNSMeeting) {
        isRNSMeeting = route.params.isRNSMeeting
    }
    const [isDuplicate, setIsDuplicate] = useState(!!route.params?.isDuplicate)
    const [isReadOnlyMode, setIsReadOnlyMode] = useState(isReadOnly)
    const [isEdit, setIsEdit] = useState(false)
    const DEFAULT_LABEL = isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [startModalVisible, setStartModalVisible] = useState(false)
    const [endModalVisible, setEndModalVisible] = useState(false)
    const [currentLocation, setCurrentLocation] = useState(CommonString.EMPTY)
    const [selectedAttendees, setSelectedAttendees] = useState({})
    const [selectedAttendeesTemp, setSelectedAttendeesTemp] = useState({})
    const [instructions, setInstructions] = useState(CommonString.EMPTY)
    const [meetingTitle, setMeetingTitle] = useState(CommonString.EMPTY)
    const [virtualLocation, setVirtualLocation] = useState(CommonString.EMPTY)
    const [resultModalVisible, setResultModalVisible] = useState(false)
    const [saveBtnDisabled, setSaveBtnDisabled] = useState(false)
    const [editBtnDisabled, setEditBtnDisabled] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedTempArr, setSelectedTempArr] = useState([])
    const [isShowMore, setIsShowMore] = useState(false)
    const [meetingDeletedModalVisible, setMeetingDeletedModalVisible] = useState(false)
    const [meetingUpdateModalVisible, setMeetingUpdateModalVisible] = useState(false)
    const [tempInfo, setTempInfo] = useState({
        MeetingName__c: CommonString.EMPTY,
        StartDateTime: CommonString.EMPTY,
        EndDateTime: CommonString.EMPTY,
        Location: CommonString.EMPTY,
        VirtualLocation: CommonString.EMPTY,
        Description: CommonString.EMPTY,
        ChildId: [],
        SoupEntryId: CommonString.EMPTY,
        ChildSoupEntryId: [],
        Id: CommonString.EMPTY,
        OwnerId: [],
        ChildOwnerIdIdMapSoupEntryId: {},
        PlannedDuration: CommonLabel.NUMBER_ZERO,
        ChildOwnerIdIdMapVisitListId: {},
        VisitListId: CommonString.EMPTY,
        ChildActualStartTime: ''
    })
    const { dropDownRef } = useDropDown()
    const [isErrorShow, setIsErrorShow] = useState(false)
    const [errorMsgType, setErrorMsgType] = useState(DataCheckMsgIndex.COMMON_MSG)
    const [eventStatus, setEventStatus] = useState(BAR_TYPE.UNSTART)
    const [eventDisable, setEventDisable] = useState(true)
    const [breakDuration, setBreakDuration] = useState(CommonLabel.NUMBER_ZERO)
    const tz = CommonParam.userTimeZone
    const defaultStartDateStr = route?.params?.dateOptions ? route?.params?.dateOptions[0] : ''

    const getMinDate = () => {
        const currentDay = moment()
        if (isRNSMeeting) {
            const firstDay =
                moment(defaultStartDateStr).format(TIME_FORMAT.Y_MM_DD) !== defaultStartDateStr
                    ? moment(defaultStartDateStr + CommonLabel.END_OF_DAY_TIME)
                    : moment(defaultStartDateStr)
            return firstDay.isBefore(currentDay) ? currentDay.toDate() : firstDay.toDate()
        }
        return currentDay.clone().toDate()
    }
    const getMaxDate = () => {
        if (isRNSMeeting) {
            return moment(defaultStartDateStr + CommonLabel.END_OF_DAY_TIME)
                .endOf(MOMENT_STARTOF.WEEK)
                .toDate()
        }
        return moment().clone().add(NUMBER_VALUE.FOUR_NUM, TIME_FORMAT.W).endOf(MOMENT_STARTOF.WEEK).toDate()
    }
    let defaultStartTime = getDefaultStartTime().format(TIME_FORMAT.HMMA)
    let minDate = getMinDate()
    let maxDate = getMaxDate()
    let planDate = moment().toDate()
    if (getTimeAfterElevenThirty(defaultStartTime, planDate)) {
        planDate = moment().add(NUMBER_VALUE.ONE_NUM, TIME_FORMAT.D).toDate()
        defaultStartTime = CommonLabel.MIDNIGHT
        if (!isRNSMeeting) {
            minDate = moment().clone().add(NUMBER_VALUE.ONE_NUM, TIME_FORMAT.D).toDate()
            maxDate = moment()
                .clone()
                .add(NUMBER_VALUE.ONE_NUM, TIME_FORMAT.D)
                .add(NUMBER_VALUE.FOUR_NUM, TIME_FORMAT.W)
                .endOf(MOMENT_STARTOF.WEEK)
                .toDate()
        }
    }
    const [startTime, setStartTime] = useState(defaultStartTime)
    const getDefaultEndTime = (startTime) => {
        if (startTime === CommonLabel.ELEVEN_THIRTY) {
            return moment(startTime, TIME_FORMAT.HMMA).add(CommonLabel.FIFTEEN_MINUTE, MOMENT_UNIT.MINUTES)
        }
        return moment(startTime, TIME_FORMAT.HMMA).add(CommonLabel.THIRTY_MINUTE, MOMENT_UNIT.MINUTES)
    }
    const getFilterDate = () => {
        const currentDay = moment()
        const firstDay =
            moment(defaultStartDateStr).format(TIME_FORMAT.Y_MM_DD) !== defaultStartDateStr
                ? moment(defaultStartDateStr + CommonLabel.END_OF_DAY_TIME)
                : moment(defaultStartDateStr)
        if (isRNSMeeting) {
            return moment(firstDay).isBefore(currentDay) ? planDate : firstDay.toDate()
        }
        return planDate
    }
    const defaultEndTime = getDefaultEndTime(startTime).format(TIME_FORMAT.HMMA)
    const [endTime, setEndTime] = useState(defaultEndTime)
    const filterDate = getFilterDate()
    const [plannedDate, setPlannedDate] = useState(filterDate)
    const startDate = moment(plannedDate).clone().day(CommonLabel.NUMBER_ZERO).format(TIME_FORMAT.Y_MM_DD)
    const endDate = moment(plannedDate).clone().day(CommonLabel.NUMBER_SIX).format(TIME_FORMAT.Y_MM_DD)
    const manager = useSelector(managerReducer)
    const visitListId = manager.visitListId

    const getCurrentAttendees = async (ownerIds) => {
        SoupService.retrieveDataFromSoup(
            'User',
            {},
            ScheduleQuery.retrieveMyTeamList.f,
            formatString(ScheduleQuery.retrieveMyTeamList.q + ScheduleQuery.retrieveMyTeamList.c, [
                CommonParam.userLocationId,
                ownerIds
            ]) + ` AND {User:Id} IN (${getIdClause(ownerIds)}) ORDER BY {User:LastName}`
        )
            .then(async (result: any) => {
                const items = await computeMyTeamData(result)
                setSelectedAttendees(items)
                setSelectedAttendeesTemp(items)
            })
            .catch((err) => {
                dropDownRef?.current?.alertWithType(
                    CommonLabel.ERROR_TIP,
                    t.labels.PBNA_MOBILE_ADD_A_MEETING_FAILED_TO_QUERY_ATTENDEES,
                    err
                )
            })
    }

    const setCurrentData = (info) => {
        setMeetingTitle(info.MeetingName__c)
        // when duplicating a meeting, if the old meeting date is in the past, set the new date as current date
        if (moment(info.StartDateTime) < moment()) {
            setPlannedDate(moment().toDate())
            setStartTime(defaultStartTime)
            setEndTime(defaultEndTime)
        } else {
            setPlannedDate(moment(info.StartDateTime).toDate())
            setStartTime(moment(info.StartDateTime).tz(tz).format(TIME_FORMAT.HMMA))
            setEndTime(moment(info.EndDateTime).tz(tz).format(TIME_FORMAT.HMMA))
        }
        setCurrentLocation(info.Location)
        setInstructions(info.Description)
        setVirtualLocation(info.VirtualLocation)
    }

    const getEventData = async (eventId) => {
        const queryString = isMerchandiser
            ? formatString(ScheduleQuery.getManagerMeetingDetail.merchdiserQ, ['']) + `AND {Event:Id} = '${eventId}' `
            : formatString(ScheduleQuery.getManagerMeetingDetail.q, ['']) + `AND OEV.{Event:Id} = '${eventId}' `
        return new Promise((resolve, reject) => {
            SoupService.retrieveDataFromSoup('Event', {}, ScheduleQuery.getManagerMeetingDetail.f, queryString)
                .then((res) => {
                    resolve(res)
                })
                .catch((err) => {
                    dropDownRef?.current?.alertWithType(
                        CommonLabel.ERROR_TIP,
                        t.labels.PBNA_MOBILE_ADD_A_MEETING_FAILED_TO_QUERY_EVENT,
                        err
                    )
                    reject(err)
                })
        })
    }

    const getBreakDuration = (temp) => {
        if (!isMerchandiser) {
            return
        }
        setEventDisable(getMeetingBarDisable(temp, dayStart, clockStart))
        setEventStatus(getMeetingStatus(temp))
        if (!temp.Actual_Start_Time__c) {
            return
        }

        if (temp.Actual_Start_Time__c && !temp.Actual_End_Time__c) {
            setBreakDuration(moment().diff(moment(temp.Actual_Start_Time__c), MOMENT_UNIT.MINUTES))
            serviceInterval = setInterval(() => {
                setBreakDuration(moment().diff(moment(temp.Actual_Start_Time__c), MOMENT_UNIT.MINUTES))
            }, 60000)
        } else if (temp.Actual_Start_Time__c && temp.Actual_End_Time__c) {
            setBreakDuration(
                moment(temp.Actual_End_Time__c).diff(moment(temp.Actual_Start_Time__c), MOMENT_UNIT.MINUTES)
            )
        }
    }

    const getAndComposeEventData = () => {
        getEventData(EventId).then(async (res: Array<any>) => {
            if (res.length === 0) {
                return
            }
            const temp = _.cloneDeep(res[0])
            temp.MeetingName__c = temp.MeetingName
            if (!isMerchandiser) {
                temp.ChildId = []
                temp.OwnerId = []
                temp.ChildSoupEntryId = []
                temp.ChildOwnerIdIdMapSoupEntryId = {}
                temp.ChildOwnerIdIdMapVisitListId = {}
                res.forEach((val) => {
                    if (!_.isEmpty(val.ChildId)) {
                        temp.ChildId.push(val.ChildId)
                    }
                    if (!_.isEmpty(val.OwnerId)) {
                        temp.OwnerId.push(val.OwnerId)
                        temp.ChildOwnerIdIdMapSoupEntryId[val.OwnerId] = val.ChildSoupEntryId
                        temp.ChildOwnerIdIdMapVisitListId[val.OwnerId] = val.ChildVisitListId
                    }
                    if (val.ChildActualStartTime) {
                        temp.ChildActualStartTime = val.ChildActualStartTime
                    }
                    if (!_.isEmpty(val.ChildSoupEntryId.toString())) {
                        temp.ChildSoupEntryId.push(val.ChildSoupEntryId)
                    }
                })
                await getCurrentAttendees(temp.OwnerId)
            }
            if (isDuplicate) {
                setCurrentData(temp)
            }
            getBreakDuration(temp)
            setTempInfo(temp)
        })
    }

    const showAttendees = () => {
        if (isMerchandiser) {
            getAttendeesWithEvent([eventItem]).then((resultEvents: Array<any>) => {
                if (resultEvents.length === 0) {
                    return
                }
                const attendeesEvent = resultEvents[0] || {}
                const attendees = attendeesEvent.attendees || []
                const resultAttendees = attendees.map((item) => {
                    item.name = `${item.Owner.FirstName || isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)} ${
                        item.Owner.LastName || isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)
                    }`
                    return item
                })
                setSelectedTempArr(resultAttendees)
                setIsShowMore(resultAttendees.length > CommonLabel.NUMBER_EIGHT)
            })
            return
        }
        if (!_.isEmpty(selectedAttendees)) {
            const selectedArr = Object.values(selectedAttendees).sort(function (a: any, b: any) {
                const nameA = a.lastName.toUpperCase()
                const nameB = b.lastName.toUpperCase()
                if (nameA < nameB) {
                    return CommonLabel.NUMBER_MINUS_ONE
                }
                if (nameA > nameB) {
                    return CommonLabel.NUMBER_ONE
                }
                return CommonLabel.NUMBER_ZERO
            })
            setSelectedTempArr(selectedArr)
            setIsShowMore(selectedArr.length > CommonLabel.NUMBER_EIGHT)
        } else {
            setSelectedTempArr([])
            setIsShowMore(false)
        }
    }
    const eventDataCheck = async () => {
        try {
            if (_.isEmpty(EventId)) {
                return
            }
            const localMeeting = await SoupService.retrieveDataFromSoup('Event', {}, [], null, [
                `
                    WHERE {Event:Id} = '${EventId}' AND {Event:IsRemoved__c} IS FALSE`
            ])
            if (localMeeting.length === 0) {
                isRNSMeeting && NativeAppEventEmitter.emit(EventEmitterType.REFRESH_SS_MEETING)
                isFromESL && NativeAppEventEmitter.emit(EventEmitterType.REFRESH_ESL)
                isRNSMeeting && NativeAppEventEmitter.emit(EventEmitterType.REFRESH_RNM)
                navigation.goBack()
                return
            }
            if (isReadOnlyMode && !_.isEmpty(EventId)) {
                getAndComposeEventData()
            }
        } catch (err) {
            dropDownRef?.current?.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_ADD_A_MEETING_FAILED_TO_QUERY_EVENT,
                err
            )
        }
    }

    useEffect(() => {
        eventDataCheck()
        const locationDataListener = NativeAppEventEmitter.addListener(
            EventEmitterType.TRANSFER_LOCATION_DATA,
            (item) => {
                setCurrentLocation(item)
            }
        )
        const attendeesDataListener = NativeAppEventEmitter.addListener(
            EventEmitterType.TRANSFER_ATTENDEES_ITEM,
            (item) => {
                setSelectedAttendees(item)
            }
        )
        return () => {
            clearInterval(serviceInterval)
            locationDataListener && locationDataListener.remove()
            attendeesDataListener && attendeesDataListener.remove()
        }
    }, [])

    useEffect(() => {
        showAttendees()
    }, [selectedAttendees])

    useEffect(() => {
        isDuplicate && getAndComposeEventData()
    }, [isDuplicate])

    useEffect(() => {
        if (isMerchandiser) {
            setEventDisable(getMeetingBarDisable(eventItem, dayStart, clockStart))
        }
    }, [route.params])

    const onPlannedDateChange = (_event, selectedDate) => {
        setPlannedDate(selectedDate)
        setStartTime(defaultStartTime)
        setEndTime(getDefaultEndTime(defaultStartTime).format(TIME_FORMAT.HMMA))
        if (moment(selectedDate).format(TIME_FORMAT.DD) !== moment(plannedDate).format(TIME_FORMAT.DD)) {
            setShowDatePicker(false)
        }
    }
    const openStartTimModal = () => {
        setStartModalVisible(true)
    }
    const openEndTimModal = () => {
        setEndModalVisible(true)
    }

    const { onOutsideClick, onDoneClick } = meetingClickFunction({
        setStartTime,
        setStartModalVisible,
        setEndTime,
        setEndModalVisible,
        defaultStartTime,
        defaultEndTime,
        startTime
    })
    const handlePressCancel = () => {
        if (isEdit && !editBtnDisabled) {
            Alert.alert(
                t.labels.PBNA_MOBILE_ADD_A_MEETING_UNSAVED_INFO,
                t.labels.PBNA_MOBILE_ADD_A_MEETING_UNSAVED_INFO_MSG,
                [
                    {
                        text: t.labels.PBNA_MOBILE_NO
                    },
                    {
                        text: t.labels.PBNA_MOBILE_YES,
                        onPress: () => {
                            navigation.goBack()
                        }
                    }
                ]
            )
        } else {
            navigation.goBack()
        }
    }
    const searchLocation = () => {
        navigation?.navigate(NavigationRoute.SEARCH_MODAL, {
            searchType: CommonLabel.LOCATION
        })
    }
    const searchAttendees = () => {
        navigation?.navigate(CommonLabel.ADD_ATTENDEES, { selectedAttendees })
    }
    const onRemoveAttendees = (item: any) => {
        if (isMerchandiser) {
            return
        }
        const tempAttendees = _.cloneDeep(selectedAttendees)
        delete tempAttendees[item]
        setSelectedAttendees(tempAttendees)
    }
    const getOpacity = (params) => {
        return params.length === 0 ? 0.2 : 1
    }
    const formValidation = () => {
        const plannedDateEmpty = plannedDate || ''
        return (
            _.isEmpty(meetingTitle) ||
            plannedDateEmpty.toString().length <= CommonLabel.NUMBER_ZERO ||
            _.isEmpty(startTime) ||
            _.isEmpty(endTime) ||
            _.isEmpty(currentLocation) ||
            Object.keys(selectedAttendees).length <= CommonLabel.NUMBER_ZERO
        )
    }
    const duplicateValidation = () => {
        return (
            startTime === moment(tempInfo.StartDateTime).tz(tz).format(TIME_FORMAT.HMMA) &&
            moment(plannedDate).tz(tz).format(TIME_FORMAT.DDD_MMM_DD_YYYY) ===
                moment(tempInfo.StartDateTime).tz(tz).format(TIME_FORMAT.DDD_MMM_DD_YYYY)
        )
    }
    const checkFormChanged = () => {
        return (
            tempInfo.MeetingName__c !== meetingTitle ||
            moment(plannedDate).tz(tz).format(TIME_FORMAT.DDD_MMM_DD_YYYY) !==
                moment(tempInfo.StartDateTime).tz(tz).format(TIME_FORMAT.DDD_MMM_DD_YYYY) ||
            moment(tempInfo.StartDateTime).tz(tz).format(TIME_FORMAT.HMMA) !== startTime ||
            moment(tempInfo.EndDateTime).tz(tz).format(TIME_FORMAT.HMMA) !== endTime ||
            tempInfo.VirtualLocation !== virtualLocation ||
            tempInfo.Description !== instructions ||
            tempInfo.Location !== currentLocation ||
            selectedAttendeesTemp !== selectedAttendees
        )
    }
    useEffect(() => {
        setSaveBtnDisabled(isDuplicate ? formValidation() || duplicateValidation() : formValidation())
        setEditBtnDisabled(!checkFormChanged() || formValidation())
    }, [
        meetingTitle,
        plannedDate,
        startTime,
        endTime,
        currentLocation,
        selectedAttendees,
        virtualLocation,
        instructions
    ])

    const getSyncUpInfo = async () => {
        let whatId
        if (!isRNSMeeting) {
            const scheduleRecordTypeId = await getRecordTypeIdByDeveloperName('Schedule_Visit_Group', 'Visit_List__c')
            const originScheduleVisit: any = await queryScheduleVisit(
                CommonParam.userId,
                startDate,
                endDate,
                scheduleRecordTypeId,
                setIsLoading
            )
            if (!_.isEmpty(originScheduleVisit[0]?.Id)) {
                const svgCheck = await checkSVGDataModifiedById(
                    originScheduleVisit[0]?.Id,
                    setErrorMsgType,
                    setIsErrorShow
                )
                if (svgCheck) {
                    setIsLoading(false)
                    return
                }
            } else {
                const newSVGCheck = await dataCheckWithSVG([], true, dropDownRef, startDate, endDate)
                if (newSVGCheck === SVGDataCheckStatus.CREATE_BUT_EXIST) {
                    setIsLoading(false)
                    setErrorMsgType(DataCheckMsgIndex.COMMON_MSG)
                    setIsErrorShow(true)
                    return
                }
            }
            const scheduleVisitList = await queryAndSyncScheduleVisitList({
                startDate,
                endDate,
                dropDownRef,
                setIsLoading
            })
            whatId = scheduleVisitList[0]?.Id
        } else {
            whatId = visitListId
            const modified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
            if (modified) {
                setIsLoading(false)
                return
            }
        }
        const eventDate = moment(plannedDate).format(TIME_FORMAT.MMDDY)
        setLoggedInUserTimezone()
        const temp = {
            objTargetEvent: {
                Location__c: CommonParam.userLocationId,
                Subject: CommonLabel.MEETING,
                Type: CommonLabel.MEETING,
                Manager_Scheduled__c: true,
                MeetingName__c: meetingTitle,
                StartDateTime: moment(eventDate + startTime, TIME_FORMAT.MMDDY + TIME_FORMAT.HMMA)
                    .utc()
                    .toISOString(),
                EndDateTime: moment(eventDate + endTime, TIME_FORMAT.MMDDY + TIME_FORMAT.HMMA)
                    .utc()
                    .toISOString(),
                Location: currentLocation,
                Description: instructions,
                VirtualLocation__c: virtualLocation,
                OwnerId: CommonParam.userId,
                Id: tempInfo.Id,
                WhatId: whatId
            },
            lstAttendeeId: Object.keys(selectedAttendees)
        }
        if (!isEdit) {
            delete temp.objTargetEvent.Id
        }
        setLoggedInUserTimezone()
        return temp
    }

    const getSyncDownRequest = (needSyncEvent?) => {
        const requests = []
        getQuerySeq().forEach((m) => {
            if (m.name === 'Event' && needSyncEvent) {
                requests.push(syncDownObj(m.name, m.q))
            }
            if (m.name === 'Visit_List__c') {
                requests.push(syncDownObj(m.name, m.q))
            }
        })
        return requests
    }

    const updateAllEventVisitListId = async (eventIds, eventVisitListIdMap) => {
        try {
            const allEvent = await SoupService.retrieveDataFromSoup(
                'Event',
                {},
                getObjByName('Event').syncUpCreateFields,
                getObjByName('Event').syncUpCreateQuery +
                    `
                WHERE {Event:Id} IN (${getIdClause(eventIds)})
                `
            )
            let scheduleVisitListId
            if (!isRNSMeeting) {
                const scheduleVisitList = await queryAndSyncScheduleVisitList({
                    startDate,
                    endDate,
                    dropDownRef,
                    setIsLoading
                })
                scheduleVisitListId = scheduleVisitList[0]?.Id
            } else {
                scheduleVisitListId = visitListId
            }

            allEvent.forEach((event) => {
                if (!_.isEmpty(event.Parent_Event__c)) {
                    event.Visit_List__c = eventVisitListIdMap[event.Id] || CommonString.EMPTY
                    event.WhatId = eventVisitListIdMap[event.Id] || CommonString.EMPTY
                } else {
                    event.Visit_List__c = scheduleVisitListId || CommonString.EMPTY
                    event.WhatId = scheduleVisitListId || CommonString.EMPTY
                }
            })
            await SoupService.upsertDataIntoSoup('Event', allEvent)
            await syncUpObjUpdate(
                'Event',
                getObjByName('Event').syncUpCreateFields,
                getObjByName('Event').syncUpCreateQuery +
                    `
                WHERE {Event:Id} IN (${getIdClause(eventIds)})
                `
            )
            // if change meeting date to a new week, recalculate old SVG KPI, only in published
            if (!_.isEmpty(tempInfo.StartDateTime) && isEdit && !isRNSMeeting) {
                const oldStartDate = moment(tempInfo.StartDateTime)
                    .clone()
                    .day(CommonLabel.NUMBER_ZERO)
                    .format(TIME_FORMAT.Y_MM_DD)
                const oldEndDate = moment(tempInfo.StartDateTime)
                    .clone()
                    .day(CommonLabel.NUMBER_SIX)
                    .format(TIME_FORMAT.Y_MM_DD)
                const oldScheduleVisitList = await queryAndSyncScheduleVisitList({
                    startDate: oldStartDate,
                    endDate: oldEndDate,
                    dropDownRef,
                    setIsLoading
                })
                if (!_.isEmpty(oldScheduleVisitList[0]?.Id) && oldScheduleVisitList[0]?.Id !== scheduleVisitListId) {
                    await recalculateKPIBySVGAccepted({
                        visitListId: oldScheduleVisitList[0]?.Id,
                        setIsLoading: null,
                        isRecalculate: false,
                        needNavigation: false,
                        navigation,
                        setModalVisible: null,
                        dropDownRef,
                        isPublished: !isRNSMeeting
                    })
                }
            }
            await recalculateKPIBySVGAccepted({
                visitListId: scheduleVisitListId,
                setIsLoading: null,
                isRecalculate: isRNSMeeting,
                needNavigation: false,
                navigation,
                setModalVisible: null,
                dropDownRef,
                isPublished: !isRNSMeeting
            })
        } catch (err) {
            dropDownRef?.current?.alertWithType(
                CommonLabel.ERROR_TIP,
                t.labels.PBNA_MOBILE_ADD_A_MEETING_FAILED_TO_LOOK_UP_EVENT,
                err
            )
        }
    }

    // will delete meetings if edit attendees
    const updateOrDeleteOldVisitListWithMeetingTime = async (employeeId, visitDate, oldMeetingDuration) => {
        const dailyRecordTypeId = await getRecordTypeIdByDeveloperName('Daily_Visit_List', 'Visit_List__c')
        const res = await SoupService.retrieveDataFromSoup(
            'Visit_List__c',
            {},
            getObjByName('Visit_List__c').syncUpCreateFields,
            getObjByName('Visit_List__c').syncUpCreateQuery +
                `
            WHERE {Visit_List__c:OwnerId} = '${employeeId}'
            AND {Visit_List__c:Visit_Date__c} = '${visitDate}'
            AND {Visit_List__c:Status__c} != '${VisitListStatus.COMPLETED}'
            AND {Visit_List__c:IsRemoved__c} IS FALSE
            AND {Visit_List__c:RecordTypeId} = '${dailyRecordTypeId}'
            `
        )
        if (!_.isEmpty(res[0])) {
            const updatedMeetingTime = res[0].Planned_Meeting_Time__c - parseInt(oldMeetingDuration)
            res[0].Planned_Meeting_Time__c =
                updatedMeetingTime > CommonLabel.NUMBER_ZERO ? updatedMeetingTime : CommonLabel.NUMBER_ZERO
            await syncUpObjUpdateFromMem(
                'Visit_List__c',
                filterExistFields('Visit_List__c', res, ['Id', 'Planned_Meeting_Time__c'])
            )
            await updateVisitListToUnscheduled(res[0].Id, !isRNSMeeting)
            return true
        }
        return false
    }

    const updateNewVisitListMeetingTime = async (employeeId, meetingDurationTime, userName) => {
        const scheduleAdHoc = !isRNSMeeting
        const durationTime = CommonLabel.NUMBER_ZERO
        const dailyRecordTypeId = await getRecordTypeIdByDeveloperName('Daily_Visit_List', 'Visit_List__c')
        const visitCase = getRandomBetweenTwoNum(CommonLabel.RANDOM_NUM_MIN, CommonLabel.RANDOM_NUM_MAX)
        try {
            const weeklyVisitList = await queryAndSyncWeeklyForAdd({
                employeeId,
                startDate,
                endDate,
                searchEmployeeText: userName,
                scheduleAdHoc,
                durationTime,
                visitCase,
                setIsLoading,
                dropDownRef
            })

            const queryDaily = await queryAndSyncDailyForAdd({
                employeeId,
                visitDate: moment(plannedDate).format(TIME_FORMAT.Y_MM_DD),
                searchEmployeeText: userName,
                weeklyVisitList,
                scheduleAdHoc,
                durationTime,
                visitCase,
                setIsLoading,
                dropDownRef
            })
            queryDaily[0].Planned_Meeting_Time__c += parseInt(meetingDurationTime)
            await SoupService.upsertDataIntoSoup('Visit_List__c', queryDaily)
            await syncUpObjUpdate(
                'Visit_List__c',
                getObjByName('Visit_List__c').syncUpCreateFields,
                getObjByName('Visit_List__c').syncUpCreateQuery +
                    `
                WHERE {Visit_List__c:OwnerId} = '${employeeId}'
                AND {Visit_List__c:Visit_Date__c} = '${moment(plannedDate).format(TIME_FORMAT.Y_MM_DD)}'
                AND {Visit_List__c:Status__c} != '${VisitListStatus.COMPLETED}'
                AND {Visit_List__c:IsRemoved__c} IS FALSE
                AND {Visit_List__c:RecordTypeId} = '${dailyRecordTypeId}'
                `
            )
            await updateUnscheduledVisitListByDVLId(queryDaily[0]?.Id)
            return queryDaily[0].Id
        } catch (err) {
            setIsLoading(false)
            dropDownRef?.current?.alertWithType(
                CommonLabel.ERROR_TIP,
                t.labels.PBNA_MOBILE_ADD_A_MEETING_FAILED_TO_UPDATE_DAILY_VL,
                err
            )
        }
    }

    const getMeetingDurationTime = async (eventId) => {
        const fields = {
            Id: eventId
        }
        const whereClauseArr = computeSmartClause('Event', fields)
        return new Promise((resolve, reject) => {
            database()
                .use('Event')
                .select(['Planned_Duration__c'])
                .where(whereClauseArr)
                .getData()
                .then((res: Array<any>) => {
                    if (!_.isEmpty(res)) {
                        resolve(res[0].Planned_Duration__c)
                    }
                    resolve(CommonLabel.NUMBER_ZERO)
                })
                .catch((err) => {
                    dropDownRef?.current?.alertWithType(
                        CommonLabel.ERROR_TIP,
                        t.labels.PBNA_MOBILE_ADD_A_MEETING_FAILED_TO_QUERY_MEETING_DURATION_TIME,
                        err
                    )
                    reject(err)
                })
        })
    }

    const getUserName = async (userIds) => {
        return new Promise((resolve, reject) => {
            SoupService.retrieveDataFromSoup(
                'User',
                {},
                ['Id', 'Name'],
                `
                    SELECT {User:Id}, {User:Name} 
                    FROM {User}
                    WHERE {User:Id} IN (${getIdClause(userIds)})
                `
            )
                .then((res: Array<any>) => {
                    if (!_.isEmpty(res)) {
                        const idNameMap = {}
                        res.forEach((item) => {
                            idNameMap[item.Id] = item.Name
                        })
                        resolve(idNameMap)
                    }
                    resolve({})
                })
                .catch((err) => {
                    dropDownRef?.current?.alertWithType(
                        CommonLabel.ERROR_TIP,
                        t.labels.PBNA_MOBILE_ADD_A_MEETING_FAILED_TO_QUERY_USER_NAME,
                        err
                    )
                    reject(err)
                })
        })
    }

    const updateVisitListMeetingDurationAndLookUpEvent = async (params) => {
        const { ownerIds, meetingDurationTime, idNameMap, eventVisitListIdMap, eventOwnerIdMap, eventIds } = params
        return new Promise((resolve, reject) => {
            try {
                const visitListIds = []
                ownerIds.forEach(async (ownerId) => {
                    const tmpVisitListId = await updateNewVisitListMeetingTime(
                        ownerId,
                        meetingDurationTime,
                        idNameMap[ownerId]
                    )
                    if (!_.isEmpty(tmpVisitListId)) {
                        visitListIds.push(tmpVisitListId)
                        eventVisitListIdMap[eventOwnerIdMap[ownerId]] = tmpVisitListId
                    }
                    if (visitListIds.length === ownerIds.length) {
                        await updateAllEventVisitListId(eventIds, eventVisitListIdMap)
                        resolve(CommonLabel.NUMBER_ONE)
                    }
                })
            } catch (err) {
                reject(err)
            }
        })
    }
    const handlePressSave = _.debounce(async () => {
        Instrumentation.startTimer('Merch Manager add meeting')
        const meetingInfo = await getSyncUpInfo()
        if (!meetingInfo) {
            setIsLoading(false)
            return
        }
        const ifAbortExecution = await abortExecutionAndAlertWhenCanceling(
            meetingInfo?.objTargetEvent?.WhatId,
            setIsLoading,
            dropDownRef
        )
        if (ifAbortExecution) {
            return
        }
        const newOwnerIds = Object.keys(selectedAttendees)
        let userIds = newOwnerIds
        let checkEventIds = null
        let oldDateStr = null
        const oldOwnerIds = tempInfo.OwnerId || []
        if (isEdit) {
            const tempUserIds = _.concat(userIds, oldOwnerIds)
            userIds = _.unionWith(tempUserIds, (a: string, b: string) => a === b)
            checkEventIds = [EventId, ...tempInfo.ChildId]
            oldDateStr = moment(tempInfo.StartDateTime).format(TIME_FORMAT.Y_MM_DD)
        }
        const planDateStr = moment(plannedDate).format(TIME_FORMAT.Y_MM_DD)
        const vlDataCheck = await checkMeetingDataCheck(checkEventIds, userIds, planDateStr, oldDateStr, setIsLoading)
        if (isEdit && !vlDataCheck) {
            setIsLoading(false)
            setErrorMsgType(DataCheckMsgIndex.COMMON_MSG)
            setIsErrorShow(true)
            return
        }
        getMeetingInfo(meetingInfo)
            .then(async (res) => {
                try {
                    const eventId = res.data
                    const requests = getSyncDownRequest(true)
                    await promisesOneByOne(requests)
                    const meetingDurationTime = await getMeetingDurationTime(eventId)
                    const ownerIds = JSON.parse(res.config.data).lstAttendeeId
                    const updatedOldDVL = []
                    if (isEdit) {
                        for (const ownerId of oldOwnerIds) {
                            const result = await updateOrDeleteOldVisitListWithMeetingTime(
                                ownerId,
                                moment(tempInfo.StartDateTime).format(TIME_FORMAT.Y_MM_DD),
                                tempInfo.PlannedDuration
                            )
                            updatedOldDVL.push(result)
                        }
                    }
                    if ((isEdit && updatedOldDVL.length === oldOwnerIds.length) || !isEdit) {
                        const idNameMap = await getUserName(ownerIds)
                        const allEventData: any = await getEventData(eventId)
                        const eventIds = [eventId]
                        const eventOwnerIdMap = {}
                        const eventVisitListIdMap = {}
                        allEventData.forEach((event) => {
                            eventIds.push(event.ChildId)
                            eventOwnerIdMap[event.OwnerId] = event.ChildId
                        })
                        await updateVisitListMeetingDurationAndLookUpEvent({
                            ownerIds,
                            meetingDurationTime,
                            idNameMap,
                            eventVisitListIdMap,
                            eventOwnerIdMap,
                            eventIds,
                            setIsLoading
                        })
                        const syncReq = getSyncDownRequest()
                        await promisesOneByOne(syncReq)
                        setIsLoading(false)
                        isEdit ? setMeetingUpdateModalVisible(true) : setResultModalVisible(true)
                        Instrumentation.stopTimer('Merch Manager add meeting')
                        setTimeout(() => {
                            isRNSMeeting && NativeAppEventEmitter.emit(EventEmitterType.REFRESH_SS_MEETING)
                            isFromESL && NativeAppEventEmitter.emit(EventEmitterType.REFRESH_ESL)
                            isRNSMeeting && NativeAppEventEmitter.emit(EventEmitterType.REFRESH_RNM)
                            navigation.goBack()
                        }, DEFAULT_DELAY_TIME)
                    }
                } catch (error) {
                    setIsLoading(false)
                    dropDownRef?.current?.alertWithType(
                        CommonLabel.ERROR_TIP,
                        t.labels.PBNA_MOBILE_ADD_A_MEETING_FAILED_TO_HANDLE_MEETING,
                        error
                    )
                }
            })
            .catch((err) => {
                setIsLoading(false)
                dropDownRef?.current?.alertWithType(
                    CommonLabel.ERROR_TIP,
                    t.labels.PBNA_MOBILE_ADD_A_MEETING_FAILED_TO_ADD_UPDATE_MEETING,
                    err
                )
            })
    }, IntervalTime.FIVE_HUNDRED)

    const handleDatePickerClick = () => {
        setShowDatePicker(true)
    }
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
        if (
            moment(moment().toDate()).format(TIME_FORMAT.MMM_DD_YYYY) ===
            moment(plannedDate).format(TIME_FORMAT.MMM_DD_YYYY)
        ) {
            if (!isEndTime) {
                return (
                    timeList.indexOf(selectedTimeValue) <
                    timeList.indexOf(getDefaultStartTime().format(TIME_FORMAT.HMMA))
                )
            }
            return timeList.indexOf(selectedTimeValue) < timeList.indexOf(startTime) + CommonLabel.NUMBER_ONE
        }
        if (isEndTime) {
            return timeList.indexOf(selectedTimeValue) < timeList.indexOf(startTime) + CommonLabel.NUMBER_ONE
        }
        return false
    }

    const onHandleEdit = () => {
        setIsEdit(!isEdit)
        setIsReadOnlyMode(!isReadOnlyMode)
        setCurrentData(tempInfo)
    }
    const onHandleDuplicateMeeting = () => {
        Alert.alert(
            t.labels.PBNA_MOBILE_ADD_A_MEETING_DUPLICATE_MEETING,
            t.labels.PBNA_MOBILE_ADD_A_MEETING_DUPLICATE_MEETING_MSG,
            [
                {
                    text: t.labels.PBNA_MOBILE_NO
                },
                {
                    text: t.labels.PBNA_MOBILE_YES,
                    onPress: () => {
                        setIsReadOnlyMode(!isReadOnlyMode)
                        setIsDuplicate(true)
                        setCurrentData(tempInfo)
                    }
                }
            ]
        )
    }

    const getAttendeesList = () => {
        return isShowMore ? selectedTempArr.slice(CommonLabel.NUMBER_ZERO, CommonLabel.NUMBER_EIGHT) : selectedTempArr
    }

    const onHandleDeleteMeeting = async () => {
        setIsLoading(true)
        const eventIds = [EventId, ...tempInfo.ChildId]
        const svgId = tempInfo.VisitListId
        const modified = await checkSVGDataModifiedById(svgId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            setIsLoading(false)
            return
        }
        const plannedDateStr = moment(tempInfo.StartDateTime).format(TIME_FORMAT.Y_MM_DD)
        const vlDataCheck = await checkMeetingDataCheck(eventIds, tempInfo.OwnerId, plannedDateStr, null, setIsLoading)
        if (!vlDataCheck) {
            setIsLoading(false)
            setErrorMsgType(DataCheckMsgIndex.COMMON_MSG)
            setIsErrorShow(true)
            return
        }
        handleDeleteMeeting({
            setIsLoading,
            EventIds: eventIds,
            SoupEntryIds: [tempInfo.SoupEntryId, ...tempInfo.ChildSoupEntryId],
            setMeetingDeletedModalVisible,
            navigation,
            dropDownRef,
            isFromPublished: !isRNSMeeting,
            isFromRNM: isRNSMeeting,
            scheduleVisitListId: svgId
        })
    }

    const onRemoveClick = () => {
        removeAlert({ Alert, onHandleDeleteMeeting })
    }

    const getDisableSave = () => {
        return isEdit ? editBtnDisabled : saveBtnDisabled
    }

    const getRightButtonLabel = () => {
        return isEdit ? t.labels.PBNA_MOBILE_SAVE_CHANGES : t.labels.PBNA_MOBILE_ADD_MEETING
    }

    const onClickMeetingStatusBtn = async () => {
        if (getMeetingBarDisable(eventItem, dayStart, clockStart)) {
            return
        }
        const currentEvent: any = _.cloneDeep(tempInfo)
        if (eventStatus === BAR_TYPE.UNSTART) {
            eventItem.MeetingName__c = eventItem.MeetingName
            eventItem.Planned_Duration__c = eventItem.PlannedDuration || eventItem.Planned_Duration__c
            eventItem.Actual_Start_Time__c = moment()
            currentEvent.Actual_Start_Time__c = moment()
            onPressStartMeeting(eventItem)
        } else if (eventStatus === BAR_TYPE.INPROGRESS) {
            const endEvent = _.cloneDeep(eventItem)
            endEvent.Actual_End_Time__c = moment()
            currentEvent.Actual_End_Time__c = moment()
            onPressEndMeeting(endEvent)
        }
        setTempInfo(currentEvent)
        getBreakDuration(currentEvent)
    }
    const renderItem = () => {
        return isShowMore ? (
            <CText style={[styles.attendeesText, styles.showMoreText]}>
                +{selectedTempArr.length - CommonLabel.NUMBER_EIGHT} {t.labels.PBNA_MOBILE_MORE}
            </CText>
        ) : (
            <CText style={[styles.attendeesText, styles.showMoreText]}>{t.labels.PBNA_MOBILE_HIDE}</CText>
        )
    }

    const refreshData = async () => {
        if (errorMsgType === DataCheckMsgIndex.COMMON_MSG) {
            isFromESL && NativeAppEventEmitter.emit(EventEmitterType.REFRESH_ESL)
            !isRNSMeeting && navigation?.goBack()
            if (isRNSMeeting) {
                if (isFromRNSView) {
                    navigation?.pop()
                } else {
                    navigation?.pop(NavigationPopNum.POP_TWO)
                }
            }
        }
        if (
            errorMsgType === DataCheckMsgIndex.SVG_PUBLISHED_MSG ||
            errorMsgType === DataCheckMsgIndex.SVG_CANCELLED_MSG
        ) {
            navigation.pop(NavigationPopNum.POP_THREE)
        }
    }
    const clockView = (serviceTime) => {
        const timeStr = formatClock({
            hour: Math.floor(
                serviceTime >= CommonLabel.SIXTY_MINUTE
                    ? serviceTime / CommonLabel.SIXTY_MINUTE
                    : CommonLabel.NUMBER_ZERO
            ),
            min: serviceTime % CommonLabel.SIXTY_MINUTE
        })

        return (
            <View style={styles.clockContainer}>
                <Image style={styles.clockImg} source={require('../../../../../assets/image/ios-clock.png')} />
                <View style={styles.clockContent}>
                    <CText style={styles.clockTime}>{timeStr}</CText>
                    <CText style={[styles.clockTime, styles.clockStatus]}>{t.labels.PBNA_MOBILE_COMPLETED}</CText>
                </View>
            </View>
        )
    }

    const getDeleteDisabled = () => {
        return moment(tempInfo.StartDateTime).isBefore(new Date()) || !_.isEmpty(tempInfo.ChildActualStartTime)
    }

    const getDateFormat = () => {
        return isMerchandiser ? `${TIME_FORMAT.HHMMA} (z)` : `${TIME_FORMAT.HHMMA}`
    }

    return (
        <View style={styles.container}>
            {!isReadOnlyMode ? (
                <SafeAreaView style={styles.content}>
                    <View style={styles.content}>
                        <ScrollView style={styles.mainContainer}>
                            <KeyboardAwareScrollView behavior={'padding'}>
                                <View style={styles.headerContainer}>
                                    <CText style={styles.navigationHeaderTitle}>{getTitle(isEdit)}</CText>
                                    <TouchableOpacity
                                        hitSlop={styles.hitSlop}
                                        onPress={() => {
                                            handlePressCancel()
                                        }}
                                    >
                                        <BlueClear height={36} width={36} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.contentContainer}>
                                    <CText style={styles.titleLabel}>{t.labels.PBNA_MOBILE_MEETING_TITLE}</CText>
                                    <TextInput
                                        blurOnSubmit
                                        style={styles.inputStyle}
                                        autoCorrect={false}
                                        multiline
                                        onChangeText={setMeetingTitle}
                                        value={meetingTitle}
                                        placeholder={t.labels.PBNA_MOBILE_ADD_TITLE}
                                        maxLength={100}
                                    />
                                </View>
                                <View style={styles.contentContainer}>
                                    <CText style={styles.titleLabel}>{t.labels.PBNA_MOBILE_START_DATE}</CText>
                                    <View style={styles.contentLabel}>
                                        <TouchableOpacity style={styles.oneLineLabel} onPress={handleDatePickerClick}>
                                            <CText>{moment(plannedDate).format(TIME_FORMAT.DDD_MMM_DD_YYYY)}</CText>
                                            <Image
                                                style={[styles.imgCalendar, styles.MH_10]}
                                                source={ImageSrc.IMG_CALENDAR}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.durationStyle}>
                                    <View style={[styles.contentContainer, styles.MR_10]}>
                                        <CText style={styles.titleLabel}>{t.labels.PBNA_MOBILE_START_TIME}</CText>
                                        <TouchableOpacity
                                            style={styles.durationLabel}
                                            activeOpacity={0.2}
                                            onPress={() => {
                                                openStartTimModal()
                                            }}
                                        >
                                            <View style={[styles.contentLabel, styles.oneLineLabel]}>
                                                <CText style={styles.selectText}>{startTime || defaultStartTime}</CText>
                                                <Image
                                                    source={IMG_CLOCK_BLUE}
                                                    style={[styles.imgClock, styles.MH_10]}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={[styles.contentContainer, styles.ML_10]}>
                                        <CText style={styles.titleLabel}>{t.labels.PBNA_MOBILE_END_TIME}</CText>
                                        <TouchableOpacity
                                            style={styles.durationLabel}
                                            activeOpacity={0.2}
                                            onPress={() => {
                                                openEndTimModal()
                                            }}
                                        >
                                            <View style={[styles.contentLabel, styles.oneLineLabel]}>
                                                <CText style={styles.selectText}>{endTime || defaultEndTime}</CText>
                                                <Image
                                                    source={IMG_CLOCK_BLUE}
                                                    style={[styles.imgClock, styles.MH_10]}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.contentContainer}>
                                    <CText style={styles.titleLabel}>{t.labels.PBNA_MOBILE_MEETING_LOCATION}</CText>
                                    <TouchableOpacity
                                        onPress={() => {
                                            searchLocation()
                                        }}
                                        style={styles.locationLabelStyle}
                                    >
                                        <Image style={styles.imgSearch} source={ImageSrc.IMG_SEARCH} />
                                        <CText
                                            style={[
                                                styles.locationTextStyle,
                                                styles.ML_10,
                                                !currentLocation && styles.placeHolderStyle
                                            ]}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {getLocation(currentLocation)}
                                        </CText>
                                        {currentLocation !== CommonString.EMPTY && (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setCurrentLocation(CommonString.EMPTY)
                                                }}
                                            >
                                                <Image
                                                    style={[styles.imgClear, styles.MH_10]}
                                                    source={ImageSrc.IMG_CLEAR}
                                                />
                                            </TouchableOpacity>
                                        )}
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.contentContainer}>
                                    <CText style={styles.titleLabel}>
                                        {t.labels.PBNA_MOBILE_VIDEO_CONFERENCING_LINK_OPTIONAL}
                                    </CText>
                                    <TextInput
                                        blurOnSubmit
                                        style={styles.inputStyle}
                                        autoCorrect={false}
                                        multiline
                                        onChangeText={setVirtualLocation}
                                        value={virtualLocation}
                                        placeholder={t.labels.PBNA_MOBILE_VIDEO_CONFERENCING_LINK}
                                    />
                                </View>
                                <View style={styles.contentContainer}>
                                    <CText style={styles.titleLabel}>
                                        {t.labels.PBNA_MOBILE_SPECIAL_INSTRUCTIONS_OPTIONAL}
                                    </CText>
                                    <TextInput
                                        placeholder={t.labels.PBNA_MOBILE_ADD_INSTRUCTIONS_IF_ANY}
                                        style={styles.inputStyle}
                                        autoCorrect={false}
                                        multiline
                                        onChangeText={setInstructions}
                                        value={instructions}
                                        blurOnSubmit
                                    />
                                </View>
                                <View style={[styles.contentContainer]}>
                                    <CText style={styles.titleLabel}>{t.labels.PBNA_MOBILE_ADD_ATTENDEES}</CText>
                                    <TouchableOpacity
                                        activeOpacity={getOpacity(selectedAttendees)}
                                        onPress={() => {
                                            searchAttendees()
                                        }}
                                        style={styles.locationLabelStyle}
                                    >
                                        <Image style={styles.imgSearch} source={ImageSrc.IMG_SEARCH} />
                                        <CText style={[styles.placeHolderStyle, styles.ML_10, styles.MT_3]}>
                                            {t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES}
                                        </CText>
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.contentContainer, styles.MB_200, styles.BorderBottom_none]}>
                                    <CText style={styles.titleLabel}>
                                        {t.labels.PBNA_MOBILE_MEETING_ATTENDEES} (
                                        {Object.keys(selectedAttendees).length})
                                    </CText>
                                    <View style={styles.selectedContainer}>
                                        {selectedTempArr.map((item: any) => {
                                            return (
                                                <View style={styles.subTypeCell} key={item.id}>
                                                    <CText style={styles.attendeesText}>{item.name}</CText>
                                                    <TouchableOpacity
                                                        onPress={() => onRemoveAttendees(item.id)}
                                                        style={styles.clearSubTypeContainer}
                                                    >
                                                        <Image style={styles.imgClear} source={ImageSrc.IMG_CLEAR} />
                                                    </TouchableOpacity>
                                                </View>
                                            )
                                        })}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>
                        <View style={styles.emptyBlock} />
                        <FormBottomButton
                            onPressCancel={handlePressCancel}
                            onPressSave={() => {
                                setIsLoading(true)
                                handlePressSave()
                            }}
                            disableSave={getDisableSave() || isLoading}
                            rightButtonLabel={getRightButtonLabel()}
                        />
                    </View>
                </SafeAreaView>
            ) : (
                <SafeAreaView style={styles.content}>
                    <View style={styles.content}>
                        <ScrollView style={styles.mainContainer}>
                            <View style={styles.headerContainer}>
                                <CText style={styles.navigationHeaderTitle}>
                                    {t.labels.PBNA_MOBILE_MEETING_DETAILS}
                                </CText>
                                <TouchableOpacity
                                    hitSlop={styles.hitSlop}
                                    onPress={() => {
                                        handlePressCancel()
                                    }}
                                >
                                    <BlueClear height={36} width={36} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.clockOutView}>
                                <View style={styles.onlyReadContentContainer}>
                                    <View style={styles.onlyReadTitle}>
                                        <CText style={styles.titleLabel}>{t.labels.PBNA_MOBILE_MEETING_TITLE}</CText>
                                        {!isMerchandiser && !isSDLOrDelSup && (
                                            <TouchableOpacity onPress={onHandleEdit} disabled={getDeleteDisabled()}>
                                                <CText
                                                    style={[
                                                        styles.editBtn,
                                                        getDeleteDisabled() ? styles.editBtnDisabled : styles.editBtn
                                                    ]}
                                                >
                                                    {t.labels.PBNA_MOBILE_EDIT}
                                                </CText>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <CText style={styles.onlyReadInput}>{tempInfo.MeetingName__c}</CText>
                                </View>
                                {isMerchandiser && eventStatus === BAR_TYPE.FINISH && clockView(breakDuration)}
                            </View>

                            <View style={styles.onlyReadContentContainer}>
                                <CText style={styles.titleLabel}>{t.labels.PBNA_MOBILE_START_DATE}</CText>
                                <CText style={styles.onlyReadInput}>
                                    {moment(tempInfo.StartDateTime).format(TIME_FORMAT.DDD_MMM_DD_YYYY)}
                                </CText>
                            </View>
                            <View style={styles.durationStyle}>
                                <View style={[styles.onlyReadContentContainer, styles.MR_10]}>
                                    <CText style={styles.titleLabel}>{t.labels.PBNA_MOBILE_START_TIME}</CText>
                                    <View style={styles.oneLineLabel}>
                                        <CText style={styles.selectText}>
                                            {formatWithTimeZone(tempInfo.StartDateTime, getDateFormat(), true, false)}
                                        </CText>
                                    </View>
                                </View>
                                <View style={[styles.onlyReadContentContainer, styles.ML_10]}>
                                    <CText style={styles.titleLabel}>{t.labels.PBNA_MOBILE_END_TIME}</CText>
                                    <View style={styles.oneLineLabel}>
                                        <CText style={styles.selectText}>
                                            {formatWithTimeZone(tempInfo.EndDateTime, getDateFormat(), true, false)}
                                        </CText>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.onlyReadContentContainer}>
                                <CText style={styles.titleLabel}>{t.labels.PBNA_MOBILE_MEETING_LOCATION}</CText>
                                <CText style={styles.selectText}>{tempInfo.Location}</CText>
                            </View>
                            <View style={styles.onlyReadContentContainer}>
                                <CText style={styles.titleLabel}>
                                    {t.labels.PBNA_MOBILE_VIDEO_CONFERENCING_LINK_OPTIONAL}
                                </CText>
                                <TextInput
                                    style={styles.selectText}
                                    dataDetectorTypes="link"
                                    multiline
                                    editable={false}
                                >
                                    {tempInfo.VirtualLocation || t.labels.PBNA_MOBILE_DASH}
                                </TextInput>
                            </View>
                            <View style={styles.onlyReadContentContainer}>
                                <CText style={styles.titleLabel}>
                                    {t.labels.PBNA_MOBILE_SPECIAL_INSTRUCTIONS_OPTIONAL}
                                </CText>
                                <CText style={styles.selectText}>
                                    {tempInfo.Description || t.labels.PBNA_MOBILE_DASH}
                                </CText>
                            </View>
                            <View style={[styles.onlyReadContentContainer, styles.BorderBottom_none]}>
                                <CText style={styles.titleLabel}>
                                    {t.labels.PBNA_MOBILE_MEETING_ATTENDEES} ({selectedTempArr.length})
                                </CText>
                                <View style={styles.selectedContainer}>
                                    {getAttendeesList().map((item) => {
                                        return (
                                            <View style={styles.subTypeCell} key={item.id}>
                                                <CText style={styles.attendeesText}>{item.name}</CText>
                                            </View>
                                        )
                                    })}
                                    {selectedTempArr.length > CommonLabel.NUMBER_EIGHT && (
                                        <TouchableOpacity
                                            style={[styles.subTypeCell, styles.readonlyShowMoreCell]}
                                            onPress={() => {
                                                setIsShowMore(!isShowMore)
                                            }}
                                        >
                                            {renderItem()}
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                            {!isEmployee && !isSDLOrDelSup && (
                                <TouchableOpacity
                                    disabled={getDeleteDisabled()}
                                    onPress={() => {
                                        onRemoveClick()
                                    }}
                                    style={[
                                        styles.MB_200,
                                        styles.deleteBtn,
                                        getDeleteDisabled() && styles.disabledDeleteBtn
                                    ]}
                                >
                                    <CText
                                        style={[
                                            styles.deleteBtnText,
                                            getDeleteDisabled() && styles.disabledDeleteBtnText
                                        ]}
                                    >
                                        {t.labels.PBNA_MOBILE_DELETE_MEETING}
                                    </CText>
                                </TouchableOpacity>
                            )}
                        </ScrollView>
                        {!isEmployee && !isSDLOrDelSup && (
                            <TouchableOpacity style={styles.duplicateBtn} onPress={onHandleDuplicateMeeting}>
                                <CText style={styles.duplicateText}>{t.labels.PBNA_MOBILE_DUPLICATE_MEETING}</CText>
                            </TouchableOpacity>
                        )}
                        {isMerchandiser && (
                            <MeetingBar
                                eventDisable={eventDisable}
                                heightFromProps={{ height: 44 }}
                                barStatus={eventStatus}
                                d={breakDuration}
                                endMeeting={() => {
                                    onClickMeetingStatusBtn()
                                }}
                            />
                        )}
                    </View>
                </SafeAreaView>
            )}
            <Modal animationType="fade" transparent visible={showDatePicker}>
                <TouchableOpacity style={styles.centeredView} onPress={() => setShowDatePicker(false)}>
                    <View style={styles.calendarModalView}>
                        <DateTimePicker
                            style={styles.datePicker}
                            themeVariant={CommonLabel.LIGHT}
                            testID={'dateTimePicker'}
                            textColor={'red'}
                            value={plannedDate}
                            mode={'date'}
                            display={'inline'}
                            onChange={onPlannedDateChange}
                            minimumDate={minDate}
                            maximumDate={maxDate}
                            timeZoneOffsetInMinutes={moment.tz(CommonParam.userTimeZone).utcOffset()}
                            locale={DatePickerLocale[CommonParam.locale]}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
            <PickerModal
                modalVisible={startModalVisible}
                onOutsideClick={() => {
                    onOutsideClick(START_TIME_MODAL)
                }}
                onDoneClick={() => {
                    onDoneClick(START_TIME_MODAL)
                }}
                optionsList={getTimeList(NUMBER_VALUE.FOUR_NUM, true)}
                DEFAULT_LABEL={DEFAULT_LABEL}
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
                DEFAULT_LABEL={DEFAULT_LABEL}
                modalTitle={t.labels.PBNA_MOBILE_END_TIME}
                selectedVal={endTime}
                defaultVal={defaultEndTime}
                updateSelectedVal={setEndTime}
                isEndTimeModal
                getDoneDisabled={getDoneDisabled}
            />
            <ReassignResultModal
                navigation={navigation}
                isAddMeetingSuccess
                modalVisible={resultModalVisible}
                setModalVisible={setResultModalVisible}
            />
            <ReassignResultModal
                navigation={navigation}
                isMeetingDeletedSuccess
                modalVisible={meetingDeletedModalVisible}
                setModalVisible={setMeetingDeletedModalVisible}
            />
            <ReassignResultModal
                navigation={navigation}
                isMeetingUpdatedSuccess
                modalVisible={meetingUpdateModalVisible}
                setModalVisible={setMeetingUpdateModalVisible}
            />
            <Loading isLoading={isLoading} />
            {!isMerchandiser && (
                <ErrorMsgModal
                    index={errorMsgType}
                    visible={isErrorShow}
                    setModalVisible={setIsErrorShow}
                    handleClick={refreshData}
                />
            )}
        </View>
    )
}

export default AddAMeeting

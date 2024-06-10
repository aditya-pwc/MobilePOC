import React, { useEffect, useRef, useState } from 'react'
import { FlatList, Image, NativeAppEventEmitter, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import CCheckBox from '../../../../common/components/CCheckBox'
import CText from '../../../../common/components/CText'
import { SummaryCustomerList } from '../common/CustomerCell'
import { UnassignEmployeeCell } from '../common/EmployeeCell'
import MonthWeek from '../../common/MonthWeek'
import ReassignModal from '../common/ReassignModal'
import ReassignResultModal from '../common/ReassignResultModal'
import _, { isArray } from 'lodash'
import { compose } from '@reduxjs/toolkit'
import managerAction from '../../../redux/action/H01_Manager/managerAction'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { database } from '../../../common/SmartSql'
import {
    calculateVisitAndVisitList,
    DEFAULT_DELAY_TIME,
    ReassignModalType,
    transferMilesIntoKilometerForCanada
} from '../../../utils/MerchManagerUtils'
import { getWeekLabel } from '../../../utils/MerchManagerComputeUtils'
import Loading from '../../../../common/components/Loading'
import { Log } from '../../../../common/enums/Log'
import ErrorMsgModal from '../common/ErrorMsgModal'
import {
    DataCheckMsgIndex,
    EventEmitterType,
    NavigationPopNum,
    NavigationRoute,
    WeekDayIndex
} from '../../../enums/Manager'
import {
    goBackAndRefreshInRNS,
    getHourAndMin,
    getReassignEmployeeList,
    renderUnassignRouteCard,
    getCurrentSvgId
} from '../helper/MerchManagerHelper'
import { checkDataForDeleteVisit, checkSVGDataModifiedById } from '../service/DataCheckService'
import moment from 'moment'
import { VisitOperationType } from '../../../enums/Visit'
import { t } from '../../../../common/i18n/t'
import store from '../../../redux/store/Store'
import SelectTab from '../../common/SelectTab'
import { getUnassignedRouteUserBySVGID } from '../helper/VisitHelper'
import { isPersonaMerchManager } from '../../../../common/enums/Persona'
import { pushNotificationToMerch } from '../../../api/ApexApis'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        flex: 1
    },
    mainContainer: {
        marginTop: 60,
        flex: 1
    },
    headerContainer: {
        paddingLeft: 22,
        paddingRight: 22
    },
    navigationHeaderTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 22,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    navigationHeaderTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000',
        marginTop: 3
    },
    backButton: {
        width: 30,
        height: 30,
        position: 'absolute',
        left: 0,
        top: 0
    },
    backButtonImage: {
        width: 12,
        height: 21
    },
    headerTitleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#000'
    },
    headerInfoContainer: {
        flexDirection: 'row'
    },
    headerInfoItem: {
        flex: 1,
        marginTop: 30
    },
    headerInfoItemTitle: {
        fontSize: 12
    },
    headerInfoItemNum: {
        marginTop: 4,
        fontWeight: '700',
        fontSize: 16
    },
    headerInfoItemTitleUnit: {
        fontWeight: '400'
    },

    selectedBox: {
        height: 120,
        marginTop: 15,
        marginBottom: 8,
        borderRadius: 8,
        shadowColor: '#004C97',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D3D3D3'
    },
    boxTitle: {
        height: 75,
        backgroundColor: '#6C0CC3',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
    },
    selectedVisit: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF'
    },
    selectedInfo: {
        fontSize: 12,
        fontWeight: '400',
        color: '#FFF',
        marginTop: 6
    },
    btnGroup: {
        height: 45,
        paddingLeft: 20,
        paddingRight: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    btnIcon: {
        width: 17,
        height: 17,
        marginRight: 8
    },
    inactiveBtnIcon: {
        width: 17,
        height: 17,
        marginRight: 8,
        tintColor: '#D3D3D3'
    },
    btnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000'
    },
    unActiveBtText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#D3D3D3'
    },
    flexRowCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    weekContainer: {
        marginTop: 20
    },
    checkBoxContainer: {
        marginTop: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    checkBoxTitle: {
        fontSize: 12,
        fontWeight: '400',
        color: '#000'
    },
    checkBoxItemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end'
    },
    checkBoxItemText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000'
    },
    checkBoxItem: {
        backgroundColor: '#FFF',
        borderWidth: 0,
        padding: 0,
        width: 120
    },
    listContainer: {
        paddingHorizontal: 22,
        marginVertical: 22
    },
    storeItemStyle: {
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.2,
        backgroundColor: 'white',
        margin: 5,
        padding: 5,
        borderRadius: 5
    },
    tabBar: {
        marginTop: 40,
        width: '100%'
    },
    height_30: {
        height: 30
    },
    marginVertical_22: {
        marginVertical: 22
    },
    storeList: {
        borderRadius: 5,
        overflow: 'hidden'
    }
})

const handleDaySelect = (dataArray) => {
    const obj = {}
    dataArray.forEach((data) => {
        Object.keys(data.visits).forEach((dayKey) => {
            obj[dayKey] = false
        })
    })
    return obj
}

const getSelectDay = (weeks: Array<any>) => {
    const allWeeks = getWeekLabel()
    for (const day of allWeeks) {
        if (weeks.includes(day)) {
            return day
        }
    }
    return ''
}

const handleUnassign = (summaryCustomerList) => {
    const unAssignVisit = []
    let allTotalCases = 0
    const returnArray: [Array<any>, number] = [[], 0]
    summaryCustomerList.forEach((store: any) => {
        for (const key in store.visits) {
            store.visits[key].forEach((visit: any) => {
                if (!visit.visitor) {
                    unAssignVisit.push(visit)
                    allTotalCases += visit.totalCases
                }
            })
        }
    })
    returnArray[0] = unAssignVisit
    returnArray[1] = Math.round(allTotalCases)
    return returnArray
}

interface UnassignVisitProps {
    props: any
    route: any
    navigation: any
}

const managerReducer = (state) => state.manager

const getUnassignedTabList = () => {
    return [{ name: _.upperCase(t.labels.PBNA_MOBILE_VISITS) }, { name: _.upperCase(t.labels.PBNA_MOBILE_ROUTES) }]
}

const VISITS_TAB = 0
const ROUTES_TAB = 1

const getUnassignedRoutes = async (
    visitListId,
    setUnassignedRoutesObj,
    isFromMyDay,
    date,
    setIsLoading,
    setVisitListId
) => {
    const svgId = await getCurrentSvgId(date || moment(), setIsLoading)
    if (isFromMyDay) {
        setVisitListId(svgId)
    }
    const unassignedRoutes = await getUnassignedRouteUserBySVGID(isFromMyDay ? svgId : visitListId, isFromMyDay)
    let totalMiles = 0
    let totalMinutes = 0
    unassignedRoutes.forEach((visit) => {
        totalMiles += visit.totalMiles
        totalMinutes += visit.totalMinutes
    })
    setUnassignedRoutesObj({ unassignedRoutes, totalMiles, totalMinutes })
}

const UnassignVisit = ({ route, navigation }: UnassignVisitProps) => {
    const { originData, isFromScheduleSummary, isFromMyDay, selectedDay, employeeScheduleParams } = route.params
    const manager = useSelector(managerReducer)
    const [visitListId, setVisitListId] = useState(manager.visitListId)

    const [storeData, setStoreData] = useState(originData)

    const headerData: [Array<any>, number] = handleUnassign(storeData)
    const [unassignVisitList, setUnassignVisitList] = useState(headerData[0])

    const [selectData, setSelectData] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [showAction, setShowAction] = useState(false)

    const [weekDays, setWeekDays] = useState(handleDaySelect(storeData))
    const [selectDayKey, setSelectDayKey] = useState(getSelectDay(Object.keys(weekDays)))

    const [selectedTime, setSelectedTime] = useState('')

    const [deleteSelectData, setDeleteSelectData] = useState({})

    const [totalDelete, setTotalDelete] = useState('1')
    const [totalAssign, setTotalAssign] = useState('1')
    const refMonthWeek: any = useRef()
    const deleteResultModal = useRef(null)
    const reassignResultModal = useRef(null)
    const reassignModal: any = useRef()
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [reassignModalVisible, setReassignModalVisible] = useState(false)

    const dropDownRef = useDropDown()

    const dispatch = useDispatch()
    const getRNSEmployeeList = compose(dispatch, managerAction.getRNSEmployeeList)
    const getRNSCustomerList = compose(dispatch, managerAction.getRNSCustomerList)
    const [isErrorShow, setIsErrorShow] = useState(false)
    const [errorMsgType, setErrorMsgType] = useState(DataCheckMsgIndex.COMMON_MSG)
    const getEmployeeListForReassign = compose(dispatch, managerAction.getEmployeeListForReassign)
    const [activeTab, setActiveTab] = useState(VISITS_TAB)
    const [unassignedRoutesObj, setUnassignedRoutesObj] = useState(null)

    useEffect(() => {
        getReassignEmployeeList(
            moment(selectedDay || moment())
                .day(WeekDayIndex.SUNDAY_NUM)
                .format(TIME_FORMAT.Y_MM_DD),
            moment(selectedDay || moment())
                .day(WeekDayIndex.SATURDAY_NUM)
                .format(TIME_FORMAT.Y_MM_DD),
            setIsLoading,
            getEmployeeListForReassign,
            dropDownRef
        )
        getUnassignedRoutes(
            visitListId,
            setUnassignedRoutesObj,
            isFromMyDay,
            manager.selectedDate,
            setIsLoading,
            setVisitListId
        )
    }, [])

    const onReassignClick = () => {
        if (isArray(storeData) && storeData.length > 0) {
            const selectDataForReassign = {
                ...storeData[0],
                visits: {}
            }
            const customerMap: any = {}
            for (const store of storeData) {
                const data = store.visits

                for (const weekDay in data) {
                    const sortList = data[weekDay]

                    for (const item of sortList) {
                        if (item.select) {
                            customerMap[store.id] = store
                            selectDataForReassign.visits[weekDay] = selectDataForReassign.visits[weekDay] || []
                            selectDataForReassign.visits[weekDay].push(item)
                        }
                    }
                }
            }
            const firstItem = customerMap[Object.keys(customerMap)[0]]
            const userData = {
                canShow: Object.keys(customerMap).length === 1,
                name: firstItem.name,
                address: firstItem.address,
                cityStateZip: firstItem.cityStateZip
            }
            reassignModal.current?.openModal(selectDataForReassign, userData)
        }
    }

    const deleteDataFromList = () => {
        for (const storeItem of storeData) {
            const data = storeItem.visits
            for (const dayKey in data) {
                const dayList = data[dayKey]
                const newDayListUnassign = []
                const newDayListNormal = []
                let hasUnassignData = false
                for (const visit of dayList) {
                    if (!visit.isDelete) {
                        if (!visit.visitor) {
                            hasUnassignData = true
                            newDayListUnassign.push(visit)
                        } else {
                            newDayListNormal.push(visit)
                        }
                    }
                }
                if (hasUnassignData) {
                    data[dayKey] = [...newDayListUnassign, ...newDayListNormal]
                } else {
                    data[dayKey] = []
                }
            }
        }
    }

    const deleteSelectToSoup = async (callback) => {
        const modified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            setIsLoading(false)
            return
        }
        let allUpdate = []
        const deleteVisits = []
        const whereClauseArr = []
        for (let index = 0; index < Object.keys(deleteSelectData).length; index++) {
            const key = Object.keys(deleteSelectData)[index]
            const id = deleteSelectData[key].id
            const clauseForSmartSql = {
                leftTable: 'Visit',
                leftField: 'Id',
                rightField: `'${id}'`,
                operator: '=',
                type: index === 0 ? null : 'OR'
            }
            whereClauseArr.push(clauseForSmartSql)
        }
        const deleteIds = Object.keys(deleteSelectData)
        const visitDataCheck = await checkDataForDeleteVisit(deleteIds, [])
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
                            visit.Status__c = 'Removed'
                            deleteVisits.push(visit)
                        }
                    })
                }
                allUpdate = [...deleteVisits]
                if (allUpdate.length > 0) {
                    await calculateVisitAndVisitList([], allUpdate, 'Delete')
                    callback && callback(deleteVisits.length.toString())
                } else {
                    callback && callback()
                }
            })
            .catch((err) => {
                setIsLoading(false)
                storeClassLog(Log.MOBILE_ERROR, 'UnassignVisit.deleteSelectToSoup', getStringValue(err))
            })
    }

    const handleDeleteSelectWeekDay = () => {
        const tempWeekDays = {}
        for (const store of storeData) {
            const data = store.visits
            for (const dayKey in data) {
                if (data[dayKey].length > 0) {
                    tempWeekDays[dayKey] = false
                }
            }
        }
        setSelectData([])
        setWeekDays(tempWeekDays)
        if (Object.keys(tempWeekDays).length === 0) {
            const timeoutId = setTimeout(() => {
                clearTimeout(timeoutId)
                setIsLoading(false)
                setDeleteModalVisible(false)
                setReassignModalVisible(false)
                navigation && navigation.goBack()
            }, DEFAULT_DELAY_TIME)
            return
        }
        let selectDay = selectDayKey
        if (!Object.keys(tempWeekDays).includes(selectDayKey)) {
            selectDay = getSelectDay(Object.keys(tempWeekDays))
        }
        setSelectDayKey(selectDay)
        setIsLoading(false)
        refMonthWeek.current?.setSelectIndex(tempWeekDays, selectDay)
        const selectDate = moment(selectedDay).day(selectDay).format(TIME_FORMAT.Y_MM_DD)
        moment(selectDate).isBefore(moment().format(TIME_FORMAT.Y_MM_DD)) ? setShowAction(false) : setShowAction(true)
    }

    const getNewData = async () => {
        await getRNSEmployeeList({
            visitListId,
            dropDownRef
        })
        await getRNSCustomerList({
            visitListId,
            dropDownRef
        })
        setIsLoading(false)
    }

    const deleteData = () => {
        setIsLoading(true)
        if (Array.isArray(selectData)) {
            selectData.forEach((data, index) => {
                selectData[index].isDelete = true
                selectData[index].select = false
            })
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
        setStoreData([...storeData])
        deleteSelectToSoup(async (count) => {
            deleteDataFromList()
            await getNewData()
            if (count) {
                setTotalDelete(count)
                setIsLoading(false)
                setDeleteModalVisible(true)
                const headerData = handleUnassign(storeData)
                setUnassignVisitList(headerData[0])
                setDeleteSelectData({})
            }
            handleDeleteSelectWeekDay()
            setIsLoading(false)
        })
    }

    const weekDayClick = (value) => {
        moment(value.fullYearDate).isBefore(moment().format(TIME_FORMAT.Y_MM_DD))
            ? setShowAction(false)
            : setShowAction(true)
        setSelectDayKey(value.weekLabel)
    }

    const getSelectedTimeFormat = (mins) => {
        const { hour, min } = getHourAndMin(mins)
        return hour + ` ${t.labels.PBNA_MOBILE_HRS} ` + min + ` ${t.labels.PBNA_MOBILE_MINS}`
    }

    const getSelectDayCount = () => {
        const tempSelectData = []
        let tmpDuration = 0

        for (const storeItem of storeData) {
            const data = storeItem.visits

            for (const dayKey in data) {
                const dayList = data[dayKey]

                if (dayList) {
                    for (const visit of dayList) {
                        if (visit.select && visit.canSelect) {
                            tempSelectData.push(visit)
                            tmpDuration += parseFloat(visit.totalDuration)
                        }
                    }
                }
            }
        }

        setSelectData(tempSelectData)
        setSelectedTime(getSelectedTimeFormat(tmpDuration))
    }

    const isAllDaySelect = () => {
        let dayHasData = false
        for (const store of storeData) {
            const data = store.visits
            const dayList = data[selectDayKey]
            if (dayList) {
                if (dayList.length !== 0) {
                    dayHasData = true
                }
                for (const visit of dayList) {
                    if (!visit.select && visit.canSelect) {
                        return false
                    }
                }
            }
        }
        return dayHasData
    }

    const isAllWeekSelect = () => {
        let weekHasData = false
        for (const store of storeData) {
            const data = store.visits
            for (const dayKey in data) {
                const dayList = data[dayKey]
                if (dayList) {
                    if (dayList.length !== 0) {
                        weekHasData = true
                    }
                    for (const visit of dayList) {
                        if (!visit.select && visit.canSelect) {
                            return false
                        }
                    }
                }
            }
        }
        return weekHasData
    }

    const isDaySelect = () => {
        for (const store of storeData) {
            const data = store.visits
            const dayList = data[selectDayKey]

            if (dayList) {
                for (const visit of dayList) {
                    if (visit.select) {
                        return true
                    }
                }
            }
        }
        return false
    }

    const changeWeekDayStatus = (inputWeekDays: any, inputDay: string, inputVal: boolean) => {
        const tempWeekArr = _.cloneDeep(inputWeekDays)
        tempWeekArr[inputDay] = inputVal
        return tempWeekArr
    }

    const selectAllDay = () => {
        if (isAllDaySelect()) {
            for (const data of storeData) {
                const visitsData = data.visits
                const dayList = visitsData[selectDayKey]
                if (dayList) {
                    for (const dayListItem of dayList) {
                        dayListItem.select = false
                    }
                }
            }
            setWeekDays(changeWeekDayStatus(weekDays, selectDayKey, false))
        } else {
            for (const data of storeData) {
                const visitsData = data.visits
                const dayList = visitsData[selectDayKey]
                if (dayList) {
                    for (const dayListItem of dayList) {
                        dayListItem.select = true
                    }
                }
            }
            setWeekDays(changeWeekDayStatus(weekDays, selectDayKey, true))
        }
        setStoreData([...storeData])
        getSelectDayCount()
    }

    const selectAllWeekDay = () => {
        const tempWeekDays: any = _.cloneDeep(weekDays)
        if (isAllWeekSelect()) {
            for (const data of storeData) {
                const visitsData = data.visits
                for (const dayKey in visitsData) {
                    const dayList = visitsData[dayKey]
                    if (dayList) {
                        if (
                            dayList.length === 0 ||
                            (isFromMyDay && moment(dayList[0]?.date).isBefore(moment().format(TIME_FORMAT.Y_MM_DD)))
                        ) {
                            continue
                        }
                        for (const dayListItem of dayList) {
                            dayListItem.select = false
                        }
                    }
                    tempWeekDays[dayKey] = false
                }
            }
            setWeekDays(tempWeekDays)
        } else {
            for (const data of storeData) {
                const visitsData = data.visits
                for (const dayKey in visitsData) {
                    const dayList = visitsData[dayKey]
                    if (dayList) {
                        if (
                            dayList.length === 0 ||
                            (isFromMyDay && moment(dayList[0]?.date).isBefore(moment().format(TIME_FORMAT.Y_MM_DD)))
                        ) {
                            continue
                        }
                        for (const dayListItem of dayList) {
                            dayListItem.select = true
                        }
                    }
                    tempWeekDays[dayKey] = true
                }
            }
            setWeekDays(tempWeekDays)
        }
        setStoreData([...storeData])
        getSelectDayCount()
    }

    const getSelectView = () => {
        return (
            <View style={styles.selectedBox}>
                <View style={styles.boxTitle}>
                    <CText style={styles.selectedVisit}>
                        {selectData.length}
                        {selectData.length === 1 ? ` ${t.labels.PBNA_MOBILE_VISIT}` : ` ${t.labels.PBNA_MOBILE_VISITS}`}
                        {` ${t.labels.PBNA_MOBILE_SELECTED}`}
                    </CText>
                    <CText style={styles.selectedInfo}>{selectedTime}</CText>
                </View>
                <View style={styles.btnGroup}>
                    <TouchableOpacity style={styles.flexRowCenter} activeOpacity={1}>
                        <Image
                            source={require('../../../../../assets/image/clear.png')}
                            style={styles.inactiveBtnIcon}
                        />
                        <CText style={styles.unActiveBtText}>{t.labels.PBNA_MOBILE_UNASSIGN}</CText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.flexRowCenter} onPress={() => deleteData()}>
                        <Image source={require('../../../../../assets/image/delete.png')} style={styles.btnIcon} />
                        <CText style={styles.btnText}>{t.labels.PBNA_MOBILE_DELETE.toUpperCase()}</CText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.flexRowCenter} onPress={onReassignClick}>
                        <Image source={require('../../../../../assets/image/reassign.png')} style={styles.btnIcon} />
                        <CText style={styles.btnText}>{t.labels.PBNA_MOBILE_REASSIGN.toUpperCase()}</CText>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const employeeItemClick = (itemKey) => {
        const dayList = storeData[itemKey[0]].visits[selectDayKey]
        dayList[itemKey[1]].select = !dayList[itemKey[1]].select
        const tempWeekDays = { ...weekDays }
        tempWeekDays[selectDayKey] = isDaySelect()
        getSelectDayCount()
        setWeekDays(tempWeekDays)
        setStoreData([...storeData])
    }

    const showReassignResult = async (event: any) => {
        setTotalAssign(String(event.count))
        for (const item of selectData) {
            const typedItem = item as any
            typedItem.visitor = event.item.id
            typedItem.user.id = event.item.id
            typedItem.user.name = event.item.name
            typedItem.user.avatar = event.item.avatar
            typedItem.user.firstName = event.item.firstName
            typedItem.user.lastName = event.item.lastName
            typedItem.select = false
            typedItem.canSelect = false
        }
        deleteDataFromList()
        await getNewData()
        if (event) {
            if (isFromMyDay) {
                pushNotificationToMerch({
                    type: VisitOperationType.REASSIGN,
                    lstVisitId: event?.lstVisitId
                }).catch((err) => {
                    storeClassLog(Log.MOBILE_ERROR, 'UnassignVisit.pushNotificationToMerch', getStringValue(err))
                })
            }
            const newHeaderData = handleUnassign(storeData)
            setUnassignVisitList(newHeaderData[0])
            setDeleteSelectData({})
            setReassignModalVisible(true)
        }
        handleDeleteSelectWeekDay()
        setIsLoading(false)
    }

    const renderEmployeeItem = (item, customerIndex) => {
        if (!isPersonaMerchManager() && item.item) {
            item.item.canSelect = false
        }
        return (
            <UnassignEmployeeCell
                click={employeeItemClick}
                extraItemKey={[customerIndex, item.index]}
                disabled
                item={item.item}
                index={item.index}
            />
        )
    }

    const renderStoreItem = (storeItem) => {
        let employeeList = []
        if (storeItem.item.visits[selectDayKey]) {
            employeeList = Object.values(storeItem?.item?.visits[selectDayKey])
        }
        if (employeeList.length > 0) {
            return (
                <View style={styles.storeItemStyle}>
                    <SummaryCustomerList disabled item={storeItem.item} index={storeItem.index} />
                    <FlatList
                        style={styles.storeList}
                        data={Object.values(storeItem.item.visits[selectDayKey])}
                        renderItem={(item) => renderEmployeeItem(item, storeItem.index)}
                        keyExtractor={(item: any) => item.id}
                    />
                </View>
            )
        }
        return null
    }

    useEffect(() => {
        if (isFromScheduleSummary) {
            // when swipe back to previous page
            navigation.addListener(EventEmitterType.BEFORE_REMOVE, () => {
                NativeAppEventEmitter.emit(EventEmitterType.REFRESH_SCHEDULE_SUMMARY)
            })
            return () => {
                navigation.removeListener(EventEmitterType.BEFORE_REMOVE)
            }
        }
        if (isFromMyDay) {
            const formattedDay = moment(selectedDay).format('ddd').toUpperCase()
            refMonthWeek.current?.setSelectIndex(weekDays, formattedDay)
            setSelectDayKey(formattedDay)
            moment(selectedDay).isBefore(moment().format(TIME_FORMAT.Y_MM_DD))
                ? setShowAction(false)
                : setShowAction(true)
        }
    }, [])

    const getTotalDuration = () => {
        let totalDuration = 0
        unassignVisitList.forEach((visit) => {
            totalDuration += visit.totalDuration
        })
        if (activeTab === ROUTES_TAB) {
            totalDuration = unassignedRoutesObj?.totalMinutes
        }

        const { hour, min } = getHourAndMin(totalDuration)

        return (
            <CText style={styles.headerInfoItemNum}>
                <CText>{hour}</CText>
                <CText style={styles.headerInfoItemTitleUnit}>{` ${t.labels.PBNA_MOBILE_HRS} `}</CText>
                <CText>{min}</CText>
                <CText style={styles.headerInfoItemTitleUnit}>{` ${t.labels.PBNA_MOBILE_MINS} `}</CText>
            </CText>
        )
    }

    const goBackAndRefresh = async () => {
        goBackAndRefreshInRNS(NavigationPopNum.POP_THREE, errorMsgType, setIsLoading, navigation)
    }

    const onTabChange = (index) => {
        setActiveTab(index)
    }

    const handleRouteItemClick = (routeItem) => {
        if (isFromMyDay) {
            employeeScheduleParams.employeeData = routeItem
            navigation?.replace(NavigationRoute.EMPLOYEE_SCHEDULE_LIST, employeeScheduleParams)
            return
        }
        const employeeList = store.getState().manager.RNSEmployeeList
        const employee = employeeList.filter((item: any) => item.id === routeItem.id)
        navigation?.replace(NavigationRoute.SELECT_SCHEDULE, {
            isESchedule: true,
            userData: employee[0]
        })
    }

    const renderRouteItem = (item) => {
        return (
            <TouchableOpacity
                onPress={() => {
                    handleRouteItemClick(item?.item)
                }}
            >
                {renderUnassignRouteCard(item?.item, false, false, true)}
            </TouchableOpacity>
        )
    }

    const renderMileage = () => {
        if (manager.isInCanada) {
            return (
                <CText style={styles.headerInfoItemNum}>
                    {transferMilesIntoKilometerForCanada(unassignedRoutesObj?.totalMiles)}
                    <CText style={styles.headerInfoItemTitleUnit}>{` ${t.labels.PBNA_MOBILE_KM}`}</CText>
                </CText>
            )
        }
        return (
            <CText style={styles.headerInfoItemNum}>
                {unassignedRoutesObj?.totalMiles}
                <CText style={styles.headerInfoItemTitleUnit}>{` ${t.labels.PBNA_MOBILE_MI}`}</CText>
            </CText>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.mainContainer}>
                <View style={styles.headerContainer}>
                    <View style={styles.navigationHeaderTitleContainer}>
                        <TouchableOpacity onPress={navigation && navigation.goBack} style={styles.backButton}>
                            <Image
                                source={require('../../../../../assets/image/icon-back.png')}
                                style={styles.backButtonImage}
                            />
                        </TouchableOpacity>
                        <CText style={styles.navigationHeaderTitle}>{t.labels.PBNA_MOBILE_NEW_SCHEDULE}</CText>
                    </View>
                    <View style={styles.headerTitleContainer}>
                        {activeTab === VISITS_TAB && (
                            <CText style={styles.headerTitle}>{t.labels.PBNA_MOBILE_UNASSIGNED_VISITS}</CText>
                        )}
                        {activeTab === ROUTES_TAB && (
                            <CText style={styles.headerTitle}>
                                {_.capitalize(t.labels.PBNA_MOBILE_UNASSIGNED) + ' ' + t.labels.PBNA_MOBILE_ROUTES}
                            </CText>
                        )}
                        <View style={styles.tabBar}>
                            <SelectTab
                                style={commonStyle.marginHorizontal_0}
                                listData={getUnassignedTabList()}
                                changeTab={onTabChange}
                                activeTab={activeTab}
                            />
                        </View>
                        {activeTab === VISITS_TAB ? (
                            <View style={styles.headerInfoContainer}>
                                <View style={styles.headerInfoItem}>
                                    <CText style={[styles.headerInfoItemTitle, styles.height_30]}>
                                        {t.labels.PBNA_MOBILE_OF_UNASSIGNED_VISITS}
                                    </CText>
                                    <CText style={styles.headerInfoItemNum}>{unassignVisitList.length}</CText>
                                </View>
                                <View style={styles.headerInfoItem}>
                                    <CText style={[styles.headerInfoItemTitle, styles.height_30]}>
                                        {t.labels.PBNA_MOBILE_OF_UNASSIGNED_CASES}
                                    </CText>
                                    <CText style={styles.headerInfoItemNum}>
                                        {headerData[1]}
                                        <CText style={styles.headerInfoItemTitleUnit}>
                                            {' '}
                                            {t.labels.PBNA_MOBILE_ORDER_CS.toLowerCase()}
                                        </CText>
                                    </CText>
                                </View>
                                <View style={styles.headerInfoItem}>
                                    <CText style={[styles.headerInfoItemTitle, styles.height_30]}>
                                        {t.labels.PBNA_MOBILE_HOURS}
                                    </CText>
                                    {getTotalDuration()}
                                </View>
                            </View>
                        ) : (
                            <View style={styles.headerInfoContainer}>
                                <View style={styles.headerInfoItem}>
                                    <CText style={[styles.headerInfoItemTitle, styles.height_30]}>
                                        {t.labels.PBNA_MOBILE_OF_UNASSIGNED_ROUTES}
                                    </CText>
                                    <CText style={styles.headerInfoItemNum}>
                                        {unassignedRoutesObj?.unassignedRoutes?.length}
                                    </CText>
                                </View>
                                <View style={styles.headerInfoItem}>
                                    <CText style={[styles.headerInfoItemTitle, styles.height_30]}>
                                        {t.labels.PBNA_MOBILE_MILEAGE_OF_THE_WEEK}
                                    </CText>
                                    {renderMileage()}
                                </View>
                                <View style={styles.headerInfoItem}>
                                    <CText style={[styles.headerInfoItemTitle, styles.height_30]}>
                                        {t.labels.PBNA_MOBILE_HOURS}
                                    </CText>
                                    {getTotalDuration()}
                                </View>
                            </View>
                        )}
                    </View>
                    {selectData.length > 0 && activeTab === VISITS_TAB && getSelectView()}
                    {activeTab === VISITS_TAB && (
                        <View style={styles.weekContainer}>
                            {isFromMyDay ? (
                                <MonthWeek
                                    cRef={refMonthWeek}
                                    startDay={selectedDay}
                                    weekDays={weekDays}
                                    onclick={weekDayClick}
                                />
                            ) : (
                                <MonthWeek cRef={refMonthWeek} weekDays={weekDays} onclick={weekDayClick} />
                            )}
                        </View>
                    )}
                    {activeTab === VISITS_TAB && (
                        <View style={styles.checkBoxContainer}>
                            <View />
                            {(!isFromMyDay || (isFromMyDay && showAction)) &&
                                !_.isEmpty(unassignVisitList) &&
                                isPersonaMerchManager() && (
                                    <View style={styles.checkBoxItemContainer}>
                                        <CCheckBox
                                            onPress={selectAllDay}
                                            title={
                                                <CText style={styles.checkBoxItemText}>
                                                    {t.labels.PBNA_MOBILE_FULL_DAY.toLocaleUpperCase()}
                                                </CText>
                                            }
                                            checked={isAllDaySelect()}
                                            containerStyle={styles.checkBoxItem}
                                        />
                                        <CCheckBox
                                            onPress={selectAllWeekDay}
                                            title={
                                                <CText style={styles.checkBoxItemText}>
                                                    {t.labels.PBNA_MOBILE_FULL_WEEK.toLocaleUpperCase()}
                                                </CText>
                                            }
                                            checked={isAllWeekSelect()}
                                            containerStyle={styles.checkBoxItem}
                                        />
                                    </View>
                                )}
                        </View>
                    )}
                </View>
                {activeTab === VISITS_TAB ? (
                    <FlatList
                        style={styles.listContainer}
                        data={storeData}
                        renderItem={renderStoreItem}
                        keyExtractor={(item) => item.id}
                    />
                ) : (
                    <FlatList
                        contentContainerStyle={styles.marginVertical_22}
                        data={unassignedRoutesObj?.unassignedRoutes}
                        renderItem={renderRouteItem}
                        keyExtractor={(item) => item.id}
                    />
                )}
            </View>
            <ReassignResultModal
                cRef={deleteResultModal}
                navigation={navigation}
                reassignType={VisitOperationType.DELETE}
                totalAssign={totalDelete}
                modalVisible={deleteModalVisible}
                setModalVisible={setDeleteModalVisible}
            />
            <ReassignModal
                cRef={reassignModal}
                navigation={navigation}
                isEmployee={false}
                type={
                    isFromMyDay
                        ? ReassignModalType.ReassignModalType_UnassignVisit_From_MyDay
                        : ReassignModalType.ReassignModalType_UnassignVisit
                }
                data={store.getState().manager.employeeListForReassign}
                selectDataLength={selectData.length}
                selectedTime={selectedTime}
                reassignCallBack={(count) => showReassignResult(count)}
                setIsLoading={setIsLoading}
                setErrorMsgType={setErrorMsgType}
                setIsErrorShow={setIsErrorShow}
                visitListId={visitListId}
            />
            <ReassignResultModal
                cRef={reassignResultModal}
                navigation={navigation}
                reassignType={VisitOperationType.REASSIGN}
                totalAssign={totalAssign}
                modalVisible={reassignModalVisible}
                setModalVisible={setReassignModalVisible}
            />
            <Loading isLoading={isLoading} />
            <ErrorMsgModal
                index={errorMsgType}
                visible={isErrorShow}
                setModalVisible={setIsErrorShow}
                handleClick={goBackAndRefresh}
            />
        </View>
    )
}
export default UnassignVisit

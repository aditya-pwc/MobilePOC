/**
 * @description Review New Schedule Component.
 * @author Jack Niu
 * @email chuang.niu@pwc.com
 * @date 2021-03-31
 */

import React, { useEffect, useState, useRef } from 'react'
import { View, FlatList, Image, TouchableOpacity, Alert, AppState } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import 'moment-timezone'
import { useDispatch, useSelector } from 'react-redux'
import SearchBarFilter from '../common/SearchBarFilter'
import EmployeeCell, { UnassignedRouteCell } from '../common/EmployeeCell'
import CustomerCell from '../common/CustomerCell'
import CText from '../../../../common/components/CText'
import ReassignResultModal from '../common/ReassignResultModal'
import { CommonParam } from '../../../../common/CommonParam'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import NavigationBar from '../../common/NavigationBar'
import Loading from '../../../../common/components/Loading'
import { compose } from '@reduxjs/toolkit'
import managerAction from '../../../redux/action/H01_Manager/managerAction'
import ReviewNewScheduleStyle from '../../../styles/manager/ReviewNewScheduleStyle'
import {
    goBackAndRefreshInRNS,
    handleUnassignData,
    navigateToAddMeeting,
    recalculateOrPublishSchedule,
    renderAddMeetingDropdownItem,
    renderUnassignVisitBar
} from '../helper/MerchManagerHelper'
import { removeDataOnCancelClick, syncDownDataByTableNames, replaceSpace } from '../../../utils/MerchManagerUtils'
import { MeetingHeader } from './MeetingItem'
import { getRNSMeetings } from '../service/MeetingService'
import { Log } from '../../../../common/enums/Log'
import BlueClear from '../../../../../assets/image/ios-close-circle-outline-blue.svg'
import { setLoggedInUserTimezone } from '../../../utils/TimeZoneUtils'
import store from '../../../redux/store/Store'
import ErrorMsgModal from '../common/ErrorMsgModal'
import { DataCheckMsgIndex, DropDownType, NavigationPopNum, NavigationRoute } from '../../../enums/Manager'
import { checkSVGDataModifiedById } from '../service/DataCheckService'
import { cancelSchedule } from '../../../api/ApexApis'
import _ from 'lodash'
import { t } from '../../../../common/i18n/t'
import {
    abortExecutionAndAlertWhenCanceling,
    formatScheduleDate,
    getDynamicFrequencyFlag,
    SCHEDULE_VISIT_GROUP_IS_BEING_USED
} from '../helper/VisitHelper'
import OptimizedVisitsCard from './OptimizedVisitsCard'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { restDataCommonCall } from '../../../api/SyncUtils'
import { getStringValue } from '../../../utils/LandingUtils'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { SwipeToDo } from '../../common/SwipeToDo'
import { handleScroll, handleSwipeCollapsibleRef } from '../../../helper/manager/AllManagerMyDayHelper'
import SwipeCollapsible from '../../common/SwipeCollapsible'
import { calSCHeights } from './NewScheduleList'
import { storeClassLog } from '../../../../common/utils/LogUtils'

const styles = ReviewNewScheduleStyle

setLoggedInUserTimezone()

const ICON_ADD = ImageSrc.ADD_BLUE_CIRCLE
const managerReducer = (state) => state.manager
const DEFAULT_ACTIVE_TAB = 1
const CUSTOMER_TAB = 2
const HEIGHT_TO_SCROLL = 0
const HIDE_CARD_HEIGHT_RNS = 10
const SHOW_CARD_HEIGHT_RNS = 220
export enum RNSAppStatus {
    ENTER_PAGE = 'EnterPage',
    APP_ACTIVE = 'AppActive',
    APP_INACTIVE = 'AppInactive',
    KILLED_APP = 'KilledApp',
    BACK_TO_MYDAY = 'backToMyDay',
    LOGGED_OUT = 'LoggedOut',
    PUBLISH = 'Publish'
}
interface ReviewNewScheduleProps {
    props?: any
    route?: any
    navigation?: any
}
const filterEmployeeTemp = (params) => {
    const { searchText, eeSearchBar, newList } = params
    if (!searchText) {
        eeSearchBar?.current?.onApplyClick(newList, searchText, 'clearText')
    } else {
        const filteredEmployees = []
        newList.forEach((employee) => {
            const fullName = (employee.firstName + ' ' + employee.lastName)?.toUpperCase()
            const gpid = employee.gpid?.toUpperCase()
            if (fullName?.indexOf(searchText) >= 0 || gpid?.indexOf(searchText) >= 0) {
                filteredEmployees.push(employee)
            }
        })
        eeSearchBar?.current?.onApplyClick(filteredEmployees, searchText)
    }
}
const filterCustomerTemp = (params) => {
    const { searchText, customerSearchBar, newList } = params
    if (!searchText) {
        customerSearchBar?.current?.onApplyClick(newList, searchText, 'clearText')
    } else {
        const filteredCustomers = []
        const filteredCustomersByLocId = []
        let result = []
        newList.forEach((customer) => {
            const name = replaceSpace(customer.name)
            const address = replaceSpace(customer.address + ', ' + customer.cityStateZip)?.toUpperCase()
            const cof = replaceSpace(customer.cof?.toUpperCase())
            const storeNumber = replaceSpace(customer.storeNumber?.toUpperCase())
            const repName = replaceSpace(customer.repName)?.toUpperCase()
            const salesRoute = replaceSpace(customer.salesRoute)?.toUpperCase()
            const nrid = replaceSpace(customer.nrid)?.toUpperCase()
            if (searchText === salesRoute) {
                filteredCustomersByLocId.push(customer)
            } else if (
                name.indexOf(searchText) >= 0 ||
                repName?.indexOf(searchText) >= 0 ||
                nrid?.indexOf(searchText) >= 0 ||
                address?.indexOf(searchText) >= 0 ||
                cof?.indexOf(searchText) >= 0 ||
                storeNumber?.indexOf(searchText) >= 0
            ) {
                filteredCustomers.push(customer)
            }
        })
        result = filteredCustomersByLocId.concat(filteredCustomers)
        customerSearchBar?.current?.onApplyClick(result, searchText)
    }
}

export const addLogInRNS = (svgId, time, status) => {
    const timeString = time.toISOString()
    return new Promise((resolve, reject) => {
        const logObj = {
            Level__c: 'RNS Timer History',
            Class__c: svgId,
            Message__c: `{Time:${timeString},Action:${status}}`
        }
        restDataCommonCall('sobjects/SDF_LGR_Log__c', 'POST', logObj)
            .then((res) => {
                resolve(res[0]?.data[0]?.Id)
            })
            .catch((e) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'RNS.addLogInRNS',
                    `Failed to log record in RNS Time History ${getStringValue(e)}`
                )
                reject(e)
            })
    })
}
const ReviewNewSchedule = ({ props, navigation }: ReviewNewScheduleProps) => {
    const isFocused = useIsFocused()
    const [activeTab, setActiveTab] = useState(1)
    const [employeeList, setEmployeeList] = useState([])
    const [customerList, setCustomerList] = useState([])
    const [meetingData, setMeetingData] = useState({
        meetingCount: 0,
        meetingTotalTime: 0,
        meetingCost: 0
    })
    const eFlatListRef = useRef<FlatList>()
    const cFlatListRef = useRef<FlatList>()
    const manager = useSelector(managerReducer)
    const [modalVisible, setModalVisible] = useState(false)
    const [loading, setIsLoading] = useState(false)
    const eeSearchBar: any = useRef()
    const customerSearchBar: any = useRef()
    const visitListId = manager.visitListId
    const reassignResultModal = useRef(null)
    const [dropDownModalVisible, setDropDownModalVisible] = useState(false)

    const dispatch = useDispatch()
    const { dropDownRef } = useDropDown()
    const setIsCanceling = compose(dispatch, managerAction.setIsCanceling)
    const setIsCompleted = compose(dispatch, managerAction.setIsCompleted)
    const setIsCanceled = compose(dispatch, managerAction.setIsCanceled)
    const getEmployeeListForReassign = compose(dispatch, managerAction.getEmployeeListForReassign)
    const getRNSEmployeeList = compose(dispatch, managerAction.getRNSEmployeeList)
    const getRNSCustomerList = compose(dispatch, managerAction.getRNSCustomerList)
    const getLineCodeMap = compose(dispatch, managerAction.getLineCodeMap)

    const [unassignCustomerList, setUnassignCustomerList] = useState([])
    const [unassignVisitList, setUnassignVisitList] = useState([])
    const [isErrorShow, setIsErrorShow] = useState(false)
    const [errorMsgType, setErrorMsgType] = useState(DataCheckMsgIndex.COMMON_MSG)
    const [isDynamicFrequencyOn, setIsDynamicFrequencyOn] = useState(false)
    const [appStateVal, setAppStateVal] = useState('')
    const downSwipeCollapsibleRef: any = useRef()
    const [isListExpended, setIsListExpended] = useState(false)
    const [lastOffset, setLastOffset] = useState(0)
    const topSwipeCollapsibleRef: any = useRef()

    const { toExpend, toInitialPosition } = handleSwipeCollapsibleRef(
        topSwipeCollapsibleRef,
        downSwipeCollapsibleRef,
        navigation
    )

    const handleAppStateChange = (nextAppState) => {
        setAppStateVal(nextAppState)
    }

    useEffect(() => {
        if (appStateVal === 'inactive') {
            AsyncStorage.setItem('leaveFromRNS', visitListId)
            addLogInRNS(visitListId, new Date(), RNSAppStatus.APP_INACTIVE)
        }
        if (appStateVal === 'active') {
            AsyncStorage.getItem('leaveFromRNS', (error, vLId) => {
                if (!error && vLId) {
                    AsyncStorage.removeItem('leaveFromRNS')
                }
            })
            addLogInRNS(visitListId, new Date(), RNSAppStatus.APP_ACTIVE)
        }
    }, [appStateVal])

    useEffect(() => {
        CommonParam.inRNSScreen = true
        CommonParam.svgId = visitListId
        addLogInRNS(visitListId, new Date(), RNSAppStatus.ENTER_PAGE)
        AppState.addEventListener('change', handleAppStateChange)
        return () => {
            AppState.removeEventListener('change', handleAppStateChange)
        }
    }, [])

    const filterCustomer = (searchText: any, newList = store.getState().manager.RNSCustomerList) => {
        searchText = replaceSpace(searchText).toUpperCase()
        filterCustomerTemp({ searchText, customerSearchBar, newList })
    }

    const filterEmployee = (searchText: any, newList = store.getState().manager.RNSEmployeeList) => {
        searchText = searchText.toUpperCase()
        filterEmployeeTemp({ searchText, eeSearchBar, newList })
    }

    const getMeetingData = async () => {
        try {
            const { headData } = await getRNSMeetings(manager.scheduleDate)
            setMeetingData(headData)
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'RNS.getMeetingData', getStringValue(error))
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_REVIEW_NEW_SCHEDULE_FAILED_TO_QUERY,
                error
            )
        }
    }
    const getEmployeeData = async () => {
        await getMeetingData()
        await getRNSEmployeeList({
            visitListId,
            dropDownRef,
            scheduleDate: manager.scheduleDate
        })
        eeSearchBar?.current?.onApplyClick(store.getState().manager.RNSEmployeeList)
    }

    const getEmployeeAssignList = async () => {
        await getEmployeeListForReassign({
            visitListId,
            userLocationId: CommonParam.userLocationId,
            dropDownRef
        })
    }

    const getCustomerData = async () => {
        await getRNSCustomerList({
            visitListId,
            dropDownRef
        })
        customerSearchBar?.current?.onApplyClick(store.getState().manager.RNSCustomerList)
    }

    const refreshUtil = async () => {
        try {
            setIsLoading(true)
            await syncDownDataByTableNames()
            await getEmployeeData()
            await getCustomerData()
            await getEmployeeAssignList()
        } catch (error) {
            setIsLoading(false)
            dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_REFRESH_MANAGER_FAILED + error)
            storeClassLog(Log.MOBILE_ERROR, 'RNS.refreshUtil', getStringValue(error))
        }
    }

    const onEmployeeCardClick = async (item) => {
        setIsLoading(true)
        const modified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            setIsLoading(false)
            return
        }
        await syncDownDataByTableNames()
        await getEmployeeData()
        await getEmployeeAssignList()
        setIsLoading(false)
        const temp = store.getState().manager.RNSEmployeeList.find((val) => val.id === item.id)
        if (!_.isEmpty(temp)) {
            navigation?.navigate(NavigationRoute.SELECT_SCHEDULE, {
                isESchedule: true,
                userData: temp
            })
        }
    }

    const onCustomerCardClick = async (item) => {
        setIsLoading(true)
        const modified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            setIsLoading(false)
            return
        }
        await syncDownDataByTableNames()
        await getCustomerData()
        setIsLoading(false)
        const temp = store.getState().manager.RNSCustomerList.find((val) => val.id === item.id)
        navigation?.navigate(NavigationRoute.SELECT_SCHEDULE, {
            isESchedule: false,
            customerData: temp
        })
    }

    const renderEItem = ({ item, index }) =>
        item.unassignedRoute ? (
            <UnassignedRouteCell
                item={item}
                manager={manager}
                needArrowIcon
                onCellPress={() => {
                    onEmployeeCardClick(item)
                }}
            />
        ) : (
            <EmployeeCell
                item={item}
                index={index}
                isReview
                navigation={navigation}
                onCellPress={() => {
                    onEmployeeCardClick(item)
                }}
                setIsLoading={setIsLoading}
            />
        )
    const renderCItem = ({ item, index }) => (
        <CustomerCell
            item={item}
            index={index}
            isReview
            onCellPress={() => {
                onCustomerCardClick(item)
            }}
            hasAvatar
        />
    )

    const onTabChange = async () => {
        await refreshUtil()
        await handleUnassignData(
            store.getState().manager.RNSCustomerList,
            setUnassignCustomerList,
            setUnassignVisitList
        )
        setIsLoading(false)
    }

    useEffect(() => {
        isFocused && onTabChange()
        navigation.setOptions({ tabBarVisible: true })
    }, [props, isFocused])

    useEffect(() => {
        getLineCodeMap()
        setIsDynamicFrequencyOn(getDynamicFrequencyFlag())
    }, [])

    const onCancelClick = async () => {
        setIsLoading(true)
        const modified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            setIsLoading(false)
            return
        }
        setIsLoading(false)
        const body = { scheduleVisitListId: visitListId }
        Alert.alert(t.labels.PBNA_MOBILE_RNS_IN_PROGRESS, t.labels.PBNA_MOBILE_RNS_SAVE_A_DRAFT, [
            {
                text: t.labels.PBNA_MOBILE_DELETE,
                onPress: async () => {
                    setIsLoading(true)
                    const ifAbortExecution = await abortExecutionAndAlertWhenCanceling(
                        visitListId,
                        setIsLoading,
                        dropDownRef
                    )
                    if (ifAbortExecution) {
                        return
                    }
                    await addLogInRNS(visitListId, new Date(), RNSAppStatus.BACK_TO_MYDAY)
                    CommonParam.inRNSScreen = false
                    setIsCanceling(true)
                    const isModified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
                    if (isModified) {
                        setIsLoading(false)
                        setIsCompleted(false)
                        return
                    }
                    setIsCompleted(false)
                    if (!visitListId) {
                        navigation.goBack()
                        return
                    }
                    cancelSchedule(body)
                        .then(async () => {
                            await removeDataOnCancelClick(visitListId, dropDownRef)
                            setIsLoading(false)
                            setIsCanceled(true)
                            navigation.setOptions({ tabBarVisible: true })
                            navigation.goBack()
                        })
                        .catch((err) => {
                            navigation.goBack()
                            setIsCompleted(false)
                            setIsLoading(false)
                            if (err?.error?.data === SCHEDULE_VISIT_GROUP_IS_BEING_USED) {
                                dropDownRef?.current?.alertWithType(
                                    DropDownType.INFO,
                                    t.labels.PBNA_MOBILE_SCHEDULE_IS_CANCELING,
                                    t.labels.PBNA_MOBILE_SCHEDULE_IS_HANDLING_BY_OTHERS
                                )
                            } else {
                                dropDownRef.current.alertWithType(
                                    DropDownType.ERROR,
                                    t.labels.PBNA_MOBILE_REVIEW_NEW_SCHEDULE_FAILED_TO_CANCEL,
                                    err
                                )
                            }
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'MM-RNS-onCancelClick',
                                `Failed to cancel schedule: ${getStringValue(err)}`
                            )
                        })
                }
            },
            {
                text: t.labels.PBNA_MOBILE_SAVE_DRAFT,
                onPress: async () => {
                    try {
                        const isModified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
                        if (isModified) {
                            return
                        }
                        setIsLoading(true)
                        await syncDownDataByTableNames()
                        await addLogInRNS(visitListId, new Date(), RNSAppStatus.BACK_TO_MYDAY)
                        CommonParam.inRNSScreen = false
                        navigation.goBack()
                        setIsLoading(false)
                    } catch (error) {
                        setIsLoading(false)
                    }
                }
            }
        ])
    }

    const resetSearchBar = () => {
        if (activeTab === DEFAULT_ACTIVE_TAB) {
            eeSearchBar?.current?.onResetClick()
        } else {
            customerSearchBar?.current?.onResetClick()
        }
    }

    const recalculateSchedule = async () => {
        setIsLoading(true)
        resetSearchBar()
        const modified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            setIsLoading(false)
            return
        }
        await recalculateOrPublishSchedule(
            true,
            setIsLoading,
            visitListId,
            dropDownRef,
            navigation,
            setModalVisible,
            true
        )
    }

    const toViewVisits = () => {
        resetSearchBar()
        navigation?.navigate(NavigationRoute.UNASSIGN_VISIT, { originData: unassignCustomerList })
    }

    const onAddClick = async (index) => {
        setDropDownModalVisible(!dropDownModalVisible)
        resetSearchBar()
        const modified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            return
        }
        if (index === 0) {
            setIsLoading(true)
            await syncDownDataByTableNames()
            navigation?.navigate(NavigationRoute.ADD_A_VISIT, {
                isESchedule: false
            })
            setIsLoading(false)
        } else if (index === 1) {
            navigateToAddMeeting({
                routerParams: {
                    isReadOnly: false,
                    isRNSMeeting: true,
                    dateOptions: manager.scheduleDate,
                    isFromRNSView: true
                },
                setIsLoading,
                navigation,
                dropDownRef
            })
        }
    }

    const goBackAndRefresh = async () => {
        await goBackAndRefreshInRNS(NavigationPopNum.POP_ONE, errorMsgType, setIsLoading, navigation, true)
        await getEmployeeData()
        await getCustomerData()
        await getEmployeeAssignList()
    }

    const navigateToMeeting = async () => {
        const modified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            return
        }
        setIsLoading(true)
        await syncDownDataByTableNames()
        setIsLoading(false)
        navigation?.navigate(NavigationRoute.REVIEW_NEW_MEETING)
    }

    const onEmployeeTabClick = async () => {
        setIsLoading(true)
        const modified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            setIsLoading(false)
            return
        }
        customerSearchBar?.current?.onResetClick()
        eFlatListRef?.current?.scrollToOffset({ offset: 0, animated: true })
        setActiveTab(DEFAULT_ACTIVE_TAB)
        await syncDownDataByTableNames()
        await getEmployeeData()
        await getEmployeeAssignList()
        setIsLoading(false)
    }

    const onCustomerTabClick = async () => {
        setIsLoading(true)
        const modified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            setIsLoading(false)
            return
        }
        eeSearchBar?.current?.onResetClick()
        setActiveTab(CUSTOMER_TAB)
        await syncDownDataByTableNames()
        await getCustomerData()
        setIsLoading(false)
    }

    const gotoOptimizedScreen = (nav) => {
        nav.navigate('OptimizedVisitScreen', {
            navigation: nav
        })
    }

    const renderMeetingHeader = () => {
        return (
            <View>
                {meetingData?.meetingCount > 0 && (
                    <MeetingHeader data={meetingData} showMeeting hasCost onPress={navigateToMeeting} />
                )}
            </View>
        )
    }

    return (
        <View style={styles.reviewContainer}>
            <View style={styles.content}>
                <View style={commonStyle.paddingHorizontal_22}>
                    <NavigationBar
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
                </View>
                <View style={styles.pageHeader}>
                    <CText style={styles.titleText}>{t.labels.PBNA_MOBILE_REVIEW_NEW_SCHEDULE}</CText>
                    <CText style={styles.dateText}>{formatScheduleDate(manager.scheduleDate)}</CText>
                </View>
                {renderUnassignVisitBar(unassignVisitList, toViewVisits, styles)}
                {isDynamicFrequencyOn && (
                    <SwipeCollapsible
                        cRef={downSwipeCollapsibleRef}
                        height={calSCHeights(
                            unassignVisitList,
                            !isListExpended,
                            HEIGHT_TO_SCROLL,
                            HIDE_CARD_HEIGHT_RNS,
                            SHOW_CARD_HEIGHT_RNS
                        )}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                gotoOptimizedScreen(navigation)
                            }}
                        >
                            {!isListExpended && <OptimizedVisitsCard visitListId={visitListId} />}
                        </TouchableOpacity>
                    </SwipeCollapsible>
                )}
                <View style={styles.tabRow}>
                    <TouchableOpacity
                        style={styles.tabWidth}
                        onPress={() => {
                            onEmployeeTabClick()
                        }}
                    >
                        <View style={[styles.tabView, activeTab !== DEFAULT_ACTIVE_TAB ? styles.bgWhite : null]}>
                            <CText
                                style={[
                                    styles.tabText,
                                    activeTab === DEFAULT_ACTIVE_TAB ? styles.whiteColor : styles.blueColor
                                ]}
                            >
                                {t.labels.PBNA_MOBILE_EMPLOYEES.toLocaleUpperCase()}
                            </CText>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.tabWidth}
                        onPress={() => {
                            onCustomerTabClick()
                        }}
                    >
                        <View style={[styles.tabView, activeTab === DEFAULT_ACTIVE_TAB ? styles.bgWhite : null]}>
                            <CText
                                style={[
                                    styles.tabText,
                                    activeTab !== DEFAULT_ACTIVE_TAB ? styles.whiteColor : styles.blueColor
                                ]}
                            >
                                {t.labels.PBNA_MOBILE_CUSTOMERS}
                            </CText>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.metrics}>
                {activeTab === DEFAULT_ACTIVE_TAB ? (
                    <SearchBarFilter
                        cRef={eeSearchBar}
                        setListData={setEmployeeList}
                        originData={JSON.parse(JSON.stringify(store.getState().manager.RNSEmployeeList))}
                        originListData={JSON.parse(JSON.stringify(store.getState().manager.RNSEmployeeList))}
                        isEmployee
                        isReview
                        placeholder={t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES}
                        searchTextChange={filterEmployee}
                        isRNS={CommonParam.inRNSScreen}
                        onFocus={() => {
                            setIsListExpended(true)
                        }}
                    />
                ) : (
                    <SearchBarFilter
                        cRef={customerSearchBar}
                        setListData={setCustomerList}
                        originData={JSON.parse(JSON.stringify(store.getState().manager.RNSCustomerList))}
                        originListData={JSON.parse(JSON.stringify(store.getState().manager.RNSCustomerList))}
                        isEmployee={false}
                        isCustomer
                        isReview
                        placeholder={t.labels.PBNA_MOBILE_SEARCH_BY_C_R_R}
                        searchTextChange={filterCustomer}
                        onFocus={() => {
                            setIsListExpended(true)
                        }}
                    />
                )}
            </View>
            <View style={styles.dataListContainer}>
                {activeTab === DEFAULT_ACTIVE_TAB ? (
                    <SwipeToDo
                        cRef={eFlatListRef}
                        listData={employeeList}
                        renderItem={renderEItem}
                        keyExtractor={(item) => item.id}
                        renderListHeader={renderMeetingHeader}
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
                    />
                ) : (
                    <SwipeToDo
                        cRef={cFlatListRef}
                        listData={customerList}
                        allData={customerList}
                        renderItem={renderCItem}
                        keyExtractor={(item) => item.id}
                        setListData={setCustomerList}
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
                    />
                )}
            </View>
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    onPress={() => {
                        onCancelClick()
                    }}
                    style={styles.btnCancel}
                >
                    <CText style={styles.textCancel}>{t.labels.PBNA_MOBILE_EXIT_SCHEDULE}</CText>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        recalculateSchedule()
                    }}
                    style={styles.btnAccept}
                >
                    <CText style={styles.textAccept}>{t.labels.PBNA_MOBILE_SCHEDULE_SUMMARY}</CText>
                </TouchableOpacity>
            </View>
            <ReassignResultModal
                cRef={reassignResultModal}
                navigation={navigation}
                isPublishedSuccessfully
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
            />
            <Loading isLoading={loading} />
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

export default ReviewNewSchedule

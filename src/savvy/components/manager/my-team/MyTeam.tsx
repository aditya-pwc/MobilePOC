import React, { useEffect, useRef, useState } from 'react'
import { View, TouchableOpacity, Image, FlatList, NativeAppEventEmitter, DeviceEventEmitter } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { CommonParam } from '../../../../common/CommonParam'
import { SoupService } from '../../../service/SoupService'
import CText from '../../../../common/components/CText'
import SearchBarFilter from '../common/SearchBarFilter'
import {
    formatUTCToLocalTime,
    onRemoveBtnClick,
    closeOtherRows,
    closeAllOpenRow,
    getFTPT,
    getCustomerData,
    syncDownDataByTableNames,
    getWorkingStatusConfig
} from '../../../utils/MerchManagerUtils'
import { getWorkingStatus } from '../../../utils/MerchManagerComputeUtils'
import { TabIndex } from '../../../redux/types/H01_Manager/data-tabIndex'
import { UserType } from '../../../redux/types/H01_Manager/data-userType'
import { compose } from '@reduxjs/toolkit'
import managerAction from '../../../redux/action/H01_Manager/managerAction'
import ScheduleQuery from '../../../queries/ScheduleQuery'
import { formatString } from '../../../utils/CommonUtils'
import MyTeamStyle from '../../../styles/manager/MyTeamStyle'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import UserAvatar from '../../common/UserAvatar'
import SwipeableRow from '../../common/SwipeableRow'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { useNetInfo } from '@react-native-community/netinfo'
import ReassignResultModal from '../common/ReassignResultModal'
import Loading from '../../../../common/components/Loading'
import { CommonLabel } from '../../../enums/CommonLabel'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import _ from 'lodash'
import MessageBar from '../common/MessageBar'
import RedExclamation from '../../../../../assets/image/red-exclamation.svg'
import {
    checkNoWorkingDay,
    checkVisitsTabAllError,
    getWorkingStatusObj,
    renderUnassignRouteCard,
    sortArrByParamsDESC
} from '../helper/MerchManagerHelper'
import ErrorMsgModal from '../common/ErrorMsgModal'
import { dataCheckWithAction } from '../service/DataCheckService'
import {
    BooleanStr,
    DataCheckMsgIndex,
    DropDownType,
    EventEmitterType,
    LineCodeGroupType,
    NavigationRoute
} from '../../../enums/Manager'
import { Persona } from '../../../../common/enums/Persona'
import { t } from '../../../../common/i18n/t'
import store from '../../../redux/store/Store'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { MerchManagerScreenMapping } from '../../../config/ScreenMapping'
import RefreshControlM from '../common/RefreshControlM'
import { getMyTeamUnassignedServiceDetail, renderDropdownBtnList } from '../helper/ServiceDetailHelper'
import SVGPhoneMsgView from '../common/SVGPhoneMsgView'
import BlueClear from '../../../../../assets/image/ios-close-circle-outline-blue.svg'
import SelectTeamFilter from './SelectTeamFilter'
import { handleDirectEmployee } from '../helper/AsDirectEmployeeHelper'
import { NotificationType } from '../../../../common/enums/NotificationType'

const iconAdd = ImageSrc.ADD_BLUE_CIRCLE
interface MyTeamProps {
    route: any
    navigation: any
}

const styles = MyTeamStyle
const SIZE_26 = 26
const managerReducer = (state) => state.manager
const enableDirectFunction = (activeTab) => {
    return (
        CommonParam.PERSONA__c === Persona.MERCH_MANAGER &&
        (activeTab === TabIndex.TabIndex_Merch || activeTab === TabIndex.TabIndex_Others)
    )
}
export const composeMyTeamData = async (result, setHasUnassignedRoute = null) => {
    const items = {}
    let index = -1
    const tempSalesRoute = {}
    const tempNRID = {}
    result.forEach(async (user: any) => {
        if (!items[user.UserId]) {
            index++
        }
        if (user.LOCL_RTE_ID__c) {
            tempSalesRoute[user.UserId] = user.LOCL_RTE_ID__c
        }
        if (user.GTMU_RTE_ID__c) {
            tempNRID[user.UserId] = user.GTMU_RTE_ID__c
        }
        items[user.UserId] = {
            index,
            id: user.UserId,
            name: user.Username,
            firstName: user.FirstName,
            lastName: user.LastName,
            title: user.Title,
            phone: user.MobilePhone,
            gpid: user.GPID,
            location: user.LocationName,
            ftFlag: user.FT_EMPLYE_FLG_VAL && user.FT_EMPLYE_FLG_VAL.toLocaleLowerCase(),
            startTime: user.Start_Time__c,
            startLocation: user.StartLocation,
            salesFunction: user.Sales_Function__c,
            photoUrl: user.SmallPhotoUrl,
            userStatsId: user.UserStatsId,
            workingStatus: getWorkingStatus(user),
            noWorkingDay: checkNoWorkingDay(user),
            deletableDirectly: _.isEmpty(user.SDID),
            salesRoute: tempSalesRoute[user.UserId] || '-',
            nrid: tempNRID[user.UserId] || '-',
            terminateUser: !_.isEmpty(user.WRKFRC_EMPLYMT_TRMNTN_DT__c),
            lineCode: user.LC_ID__c,
            managerDirects: user.Manager_Directs__c || '',
            isMyDirect: user.Manager_Directs__c?.includes(CommonParam.userId),
            isNightShift: user.Is_Night_Shift__c === BooleanStr.STR_TRUE
        }
    })
    const unassignedRouteUsers = await getMyTeamUnassignedServiceDetail()
    if (!_.isEmpty(unassignedRouteUsers)) {
        setHasUnassignedRoute && setHasUnassignedRoute(true)
        unassignedRouteUsers.forEach((user) => {
            items[user.Id] = {
                id: user.Id,
                name: user.Name,
                firstName: user.FirstName,
                lastName: user.LastName,
                gpid: user.GPID__c,
                totalVisit: user.TotalVisit,
                unassignedRoute: true,
                workingStatus: getWorkingStatusConfig()
            }
        })
    }
    return items
}

export const filterEmployeeData = (params) => {
    const {
        users,
        dropDownRef,
        setAllUserData,
        setCountErrorUsers,
        resolve,
        employeeTitle,
        setIsLoading,
        reject,
        merchLCodes,
        salesLCodes
    } = params
    let count = 0
    let countErrorUsers = 0
    const merchUsers = []
    const salesUsers = []
    const otherUsers = []
    try {
        users.forEach(async (item: any) => {
            if (merchLCodes.includes(item.lineCode) || item.unassignedRoute) {
                merchUsers.push(item)
            } else if (salesLCodes.includes(item.lineCode)) {
                salesUsers.push(item)
            } else {
                otherUsers.push(item)
            }
            const customerData: any = await getCustomerData({ userData: item, dropDownRef, customerDetail: false })
            item.serviceDetails = customerData.visits
            if (
                item.noWorkingDay ||
                item.terminateUser ||
                _.isEmpty(item.startTime) ||
                checkVisitsTabAllError(getWorkingStatusObj(item.workingStatus), customerData.visits)
            ) {
                countErrorUsers++
            }
            if (checkVisitsTabAllError(getWorkingStatusObj(item.workingStatus), customerData.visits)) {
                item.SDHasError = true
            }
            count++
            if (count === users.length) {
                const userObj = {}
                userObj[UserType.UserType_Merch] = merchUsers
                userObj[UserType.UserType_Sales] = salesUsers
                userObj[UserType.UserType_Others] = otherUsers
                if (setAllUserData) {
                    setAllUserData(userObj)
                }
                if (setCountErrorUsers) {
                    setCountErrorUsers(countErrorUsers)
                    DeviceEventEmitter.emit(NotificationType.UPDATE_MY_TEAM_BADGE, countErrorUsers)
                }
                resolve(userObj[employeeTitle])
            }
        })
    } catch (error) {
        setIsLoading(false)
        reject([])
    }
}

const getEmployeeData = async (params) => {
    const {
        employeeTitle,
        setCountErrorUsers,
        setIsLoading,
        dropDownRef,
        setAllUserData,
        showLoading = true,
        lineCodeMap,
        setHasUnassignedRoute
    } = params
    if (showLoading) {
        setIsLoading(true)
    }
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'User',
            {},
            ScheduleQuery.retrieveMyTeamList.f,
            formatString(ScheduleQuery.retrieveMyTeamList.q + ScheduleQuery.retrieveMyTeamList.c, [
                CommonParam.userLocationId
            ]) + ScheduleQuery.retrieveMyTeamList.orderBy
        )
            .then(async (result: any) => {
                const items = await composeMyTeamData(result, setHasUnassignedRoute)
                const users = Object.values(items)
                if (!_.isEmpty(users)) {
                    filterEmployeeData({
                        users,
                        dropDownRef,
                        setAllUserData,
                        setCountErrorUsers,
                        resolve,
                        employeeTitle,
                        setIsLoading,
                        reject,
                        merchLCodes: lineCodeMap.get(LineCodeGroupType.MyTeamGroup)[UserType.UserType_Merch] || [],
                        salesLCodes: lineCodeMap.get(LineCodeGroupType.MyTeamGroup)[UserType.UserType_Sales] || []
                    })
                } else {
                    resolve([])
                    setCountErrorUsers(0)
                    DeviceEventEmitter.emit(NotificationType.UPDATE_MY_TEAM_BADGE, 0)
                }
            })
            .catch(() => {
                setIsLoading(false)
                reject([])
            })
    })
}
export const filterEmployee = (params) => {
    let { searchText, users, searchBarFilter, setSearchText } = params
    const newList = users
    searchText = searchText.toUpperCase()
    if (!searchText) {
        searchBarFilter?.current?.onApplyClick(newList, searchText)
    } else {
        const filteredEmployees = []
        newList.forEach((employee) => {
            const fullName = (employee.firstName + ' ' + employee.lastName)?.toUpperCase()
            const gpId = employee.gpid?.toUpperCase()
            if (fullName?.indexOf(searchText) >= 0 || gpId?.indexOf(searchText) >= 0) {
                filteredEmployees.push(employee)
            }
        })
        searchBarFilter?.current?.onApplyClick(filteredEmployees, searchText)
    }
    setSearchText(searchText)
}
const getUserLineCodes = async (params) => {
    const {
        userType,
        searchText,
        searchBarFilter,
        setSearchText,
        setEmployeeOriginList,
        setCountErrorUsers,
        setIsLoading,
        dropDownRef,
        setAllUserData,
        showLoading = true,
        getLineCodeMap,
        setHasUnassignedRoute
    } = params
    await getLineCodeMap()
    return new Promise((resolve, reject) => {
        getEmployeeData({
            employeeTitle: userType,
            setCountErrorUsers,
            setIsLoading,
            dropDownRef,
            setAllUserData,
            showLoading,
            lineCodeMap: store.getState().manager.lineCodeMap,
            setHasUnassignedRoute
        })
            .then((users: Array<any>) => {
                filterEmployee({ searchText, users, searchBarFilter, setSearchText })
                setEmployeeOriginList(users)
                if (showLoading) {
                    setIsLoading(false)
                }
                resolve(users)
            })
            .catch((err) => {
                setIsLoading(false)
                reject(err)
            })
    })
}
const changeTab = async (params) => {
    const {
        tabIndex,
        userType,
        searchBarFilter,
        setUserType,
        updateMyTeamData,
        setActiveTab,
        swipeableRows,
        setSearchText,
        setEmployeeOriginList,
        setIsLoading,
        dropDownRef,
        setCountErrorUsers,
        setAllUserData,
        getLineCodeMap,
        setHasUnassignedRoute
    } = params
    setSearchText('')
    searchBarFilter?.current?.onResetClick()
    if (TabIndex.TabIndex_Merch === tabIndex) {
        setUserType(UserType.UserType_Merch)
    }
    if (TabIndex.TabIndex_Sales === tabIndex) {
        setUserType(UserType.UserType_Sales)
    }
    if (TabIndex.TabIndex_Others === tabIndex) {
        setUserType(UserType.UserType_Others)
    }
    try {
        setIsLoading(true)
        await syncDownDataByTableNames(MerchManagerScreenMapping.MyTeam)
        await getUserLineCodes({
            dropDownRef,
            userType,
            searchText: '',
            searchBarFilter,
            setSearchText,
            setEmployeeOriginList,
            setCountErrorUsers,
            setIsLoading,
            setAllUserData,
            showLoading: false,
            getLineCodeMap,
            setHasUnassignedRoute
        })
        setIsLoading(false)
    } catch (error) {
        setIsLoading(false)
        dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_REFRESH_MANAGER_FAILED + error)
    }
    updateMyTeamData({ myTeamIndex: tabIndex, myTeamType: userType, myTeamSearchText: '' })
    setActiveTab(tabIndex)
    closeAllOpenRow(swipeableRows)
}

const renderItemClick = async (params) => {
    const {
        item,
        activeTab,
        setSwipeableRows,
        swipeableRows,
        navigation,
        updateMyTeamData,
        setIsLoading,
        dropDownRef,
        userType,
        searchText,
        searchBarFilter,
        setSearchText,
        setEmployeeOriginList,
        setCountErrorUsers,
        setAllUserData,
        setIsErrorShow,
        getLineCodeMap,
        setHasUnassignedRoute
    } = params
    let newDataList: any = []
    try {
        setIsLoading(true)
        const dataCheck = await dataCheckWithAction(
            'User_Stats__c',
            `WHERE User__c='${item?.id}' AND RecordType.DeveloperName = 'Stats'`,
            '',
            false
        )
        if (!dataCheck && !item?.unassignedRoute) {
            closeAllOpenRow(swipeableRows)
            setIsLoading(false)
            setIsErrorShow(true)
            return
        }
        await syncDownDataByTableNames(MerchManagerScreenMapping.MyTeam)
        newDataList = await getUserLineCodes({
            dropDownRef,
            userType,
            searchText,
            searchBarFilter,
            setSearchText,
            setEmployeeOriginList,
            setCountErrorUsers,
            setIsLoading,
            setAllUserData,
            showLoading: false,
            getLineCodeMap,
            setHasUnassignedRoute
        })
        // activeTab
        let userTypeTemp: string
        if (activeTab === TabIndex.TabIndex_Merch) {
            userTypeTemp = UserType.UserType_Merch
        } else if (activeTab === TabIndex.TabIndex_Sales) {
            userTypeTemp = UserType.UserType_Sales
        } else {
            userTypeTemp = UserType.UserType_Others
        }
        setSwipeableRows(swipeableRows)
        updateMyTeamData({ myTeamIndex: activeTab, myTeamType: userTypeTemp, myTeamSearchText: '' })
        const newItem = newDataList?.find((employee) => employee.id === item.id)
        if (!newItem) {
            setIsLoading(false)
            return
        }
        navigation.navigate(NavigationRoute.EMPLOYEE_DETAIL, { userData: newItem, userType: userTypeTemp })
        setIsLoading(false)
    } catch (error) {
        setIsLoading(false)
        dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_REFRESH_MANAGER_FAILED + error)
    }
}
export const renderPhoneView = (item) => {
    const phone = item.phone
    return (
        <View>
            <SVGPhoneMsgView phone={phone} noteStyle={styles.rowWithCenter} phoneStyle={[styles.rowWithCenter]} />
        </View>
    )
}
const renderItemBottomView = (activeTab, item) => {
    if (activeTab === TabIndex.TabIndex_Sales) {
        return (
            <View style={styles.itemBottomContainer}>
                <CText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                        styles.fontColor_black,
                        styles.fontSize_12,
                        styles.fontWeight_400,
                        commonStyle.routeTextWidth
                    ]}
                >
                    {t.labels.PBNA_MOBILE_SALES_ROUTE}
                    <CText style={[styles.fontWeight_700]}> {item.salesRoute}</CText>
                </CText>
                <CText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                        styles.fontColor_black,
                        styles.fontSize_12,
                        styles.fontWeight_400,
                        commonStyle.routeTextWidth,
                        commonStyle.textAlignRight
                    ]}
                >
                    {t.labels.PBNA_MOBILE_NRID}
                    <CText style={[styles.fontWeight_700]}> {item.nrid}</CText>
                </CText>
            </View>
        )
    }
    return null
}

export const renderWorkStatus = (item: any) => {
    return (
        <View style={[styles.rowCenter, styles.marginTop_6]}>
            <CText style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]}>
                {formatUTCToLocalTime(item.item.startTime)}
            </CText>
            {item.item.startTime && <View style={styles.itemLine} />}
            {item.item.workingStatus.map((wStatus) => {
                return (
                    <CText
                        key={wStatus.name}
                        style={
                            wStatus.attend
                                ? [
                                      styles.fontSize_12,
                                      styles.fontWeight_700,
                                      styles.fontColor_black,
                                      styles.marginRight_8
                                  ]
                                : [
                                      styles.fontSize_12,
                                      styles.fontWeight_700,
                                      styles.fontColor_lightGary,
                                      styles.marginRight_8
                                  ]
                        }
                    >
                        {wStatus.label}
                    </CText>
                )
            })}
        </View>
    )
}

export const renderItemContent = (item) => {
    return (
        <View style={[styles.itemContentContainer]}>
            <CText style={[styles.fontColor_black, styles.fontWeight_700, styles.fontSize_16]} numberOfLines={1}>
                {item.item.name}
            </CText>
            <View style={[styles.rowCenter, styles.marginTop_6, styles.marginRight_20]}>
                <CText style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]}>
                    {getFTPT(item)}
                </CText>
                <CText style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]} numberOfLines={1}>
                    {item.item.title}
                </CText>
            </View>
            {renderWorkStatus(item)}
        </View>
    )
}
const renderTemp = (params) => {
    const {
        item,
        swipeableRows,
        onRemoveEmployeeClick,
        onRemoveDirectClick,
        onAddDirectClick,
        activeTab,
        setSwipeableRows,
        navigation,
        updateMyTeamData,
        setIsLoading,
        dropDownRef,
        userType,
        searchText,
        searchBarFilter,
        setSearchText,
        setEmployeeOriginList,
        setCountErrorUsers,
        setAllUserData,
        setIsErrorShow,
        getLineCodeMap,
        lineCodeMap,
        setHasUnassignedRoute
    } = params
    const swipeButtonProps = [
        {
            label: t.labels.PBNA_MOBILE_REMOVE,
            color: baseStyle.color.red,
            onBtnClick: onRemoveEmployeeClick,
            width: 90
        }
    ]
    const managerDirectOptions = {
        remove: {
            label: t.labels.PBNA_MOBILE_REMOVE_FROM_MY_DIRECT.toLocaleUpperCase(),
            color: baseStyle.color.loadingGreen,
            onBtnClick: onRemoveDirectClick,
            width: 90
        },
        add: {
            label: t.labels.PBNA_MOBILE_MARK_AS_MY_DIRECT.toLocaleUpperCase(),
            color: baseStyle.color.loadingGreen,
            onBtnClick: onAddDirectClick,
            width: 90
        }
    }
    if (enableDirectFunction(activeTab)) {
        if (item?.item?.managerDirects?.includes(CommonParam.userId)) {
            swipeButtonProps.unshift(managerDirectOptions.remove)
        } else {
            swipeButtonProps.unshift(managerDirectOptions.add)
        }
    }

    const onRenderItemClick = () => {
        renderItemClick({
            item: item.item,
            activeTab,
            setSwipeableRows,
            swipeableRows,
            navigation,
            updateMyTeamData,
            setIsLoading,
            dropDownRef,
            userType,
            searchText,
            searchBarFilter,
            setSearchText,
            setEmployeeOriginList,
            setCountErrorUsers,
            setAllUserData,
            setIsErrorShow,
            getLineCodeMap,
            lineCodeMap,
            setHasUnassignedRoute
        })
    }

    return (
        <View style={styles.teamItem}>
            {item?.item?.unassignedRoute && (
                <TouchableOpacity
                    onPress={() => {
                        onRenderItemClick()
                    }}
                >
                    {renderUnassignRouteCard(item.item)}
                </TouchableOpacity>
            )}
            {!item?.item?.unassignedRoute && (
                <SwipeableRow
                    uniqKey={item?.item?.id}
                    swipeableRows={swipeableRows}
                    closeOtherRows={closeOtherRows}
                    params={item.item}
                    swipeButtonConfig={swipeButtonProps}
                    showBorderRadius
                    textAlignCenter
                >
                    <TouchableOpacity
                        onPress={() => {
                            onRenderItemClick()
                        }}
                    >
                        <View style={styles.teamItem_without_border}>
                            <View style={styles.userAvatar}>
                                <UserAvatar
                                    userStatsId={item.item.userStatsId}
                                    firstName={item.item.firstName}
                                    lastName={item.item.lastName}
                                    avatarStyle={styles.imgUserImage}
                                    userNameText={{ fontSize: 24 }}
                                    needBorder={item.item.isMyDirect}
                                />
                                {(item.item.noWorkingDay ||
                                    item.item.terminateUser ||
                                    _.isEmpty(item.item.startTime) ||
                                    item.item.SDHasError) && (
                                    <RedExclamation
                                        style={styles.userRedExclamation}
                                        width={SIZE_26}
                                        height={SIZE_26}
                                    />
                                )}
                            </View>
                            {renderItemContent(item)}
                            {renderPhoneView(item.item)}
                        </View>
                        {renderItemBottomView(activeTab, item.item)}
                    </TouchableOpacity>
                </SwipeableRow>
            )}
        </View>
    )
}

const sortExclamationList = (employeeList) => {
    const hasErrorEmployees = []
    const noErrorEmployees = []
    let unassignedRouteEmployees = []
    employeeList.forEach((employee) => {
        if (employee.noWorkingDay || employee.terminateUser || _.isEmpty(employee.startTime) || employee.SDHasError) {
            if (employee.unassignedRoute) {
                unassignedRouteEmployees.push(employee)
            } else {
                hasErrorEmployees.push(employee)
            }
        } else {
            noErrorEmployees.push(employee)
        }
    })
    unassignedRouteEmployees = sortArrByParamsDESC(unassignedRouteEmployees, 'totalVisit')
    return unassignedRouteEmployees.concat([...hasErrorEmployees, ...noErrorEmployees])
}

const MyTeam = ({ navigation }: MyTeamProps) => {
    const manager = useSelector(managerReducer)
    const myTeamData = manager.myTeamData
    const searchBarFilter: any = useRef()
    const selectTeamFilterRef: any = useRef()
    const [employeeOriginList, setEmployeeOriginList] = useState([])
    const [employeeList, setEmployeeList] = useState([])
    const [activeTab, setActiveTab] = useState(1)
    const [searchText, setSearchText] = useState('')
    const [userType, setUserType] = useState(myTeamData?.myTeamType ? myTeamData.myTeamType : 'Account Merchandiser')
    const dispatch = useDispatch()
    const updateMyTeamData = compose(dispatch, managerAction.setMyTeamData)
    const getLineCodeMap = compose(dispatch, managerAction.getLineCodeMap)
    const { dropDownRef } = useDropDown()
    const netInfo = useNetInfo()
    const [resultModalVisible, setResultModalVisible] = useState(false)
    const [RemoveMyDirectResultModalVisible, setRemoveMyDirectResultModalVisible] = useState(false)
    const [AddMyDirectResultModalVisible, setAddMyDirectResultModalVisible] = useState(false)
    const [userName, setUserName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isErrorShow, setIsErrorShow] = useState(false)
    const [swipeableRows, setSwipeableRows] = useState({})
    const setActionSearchText = compose(dispatch, managerAction.setSearchText)
    const [countErrorUsers, setCountErrorUsers] = useState(0)
    const [hasUnassignedRoute, setHasUnassignedRoute] = useState(false)
    const [isPullDownSync, setIsPullDownSync] = useState(false)
    const [, setAllUserData] = useState({
        [UserType.UserType_Merch]: [],
        [UserType.UserType_Sales]: [],
        [UserType.UserType_Others]: []
    })
    const [dropDownModalVisible, setDropDownModalVisible] = useState(false)
    const [searchBarFilteredEmployeeList, setSearchBarFilteredEmployeeList] = useState([])
    const refreshAndGetData = async () => {
        await syncDownDataByTableNames(MerchManagerScreenMapping.MyTeam)
        await getUserLineCodes({
            dropDownRef,
            userType,
            searchText,
            searchBarFilter,
            setSearchText,
            setEmployeeOriginList,
            setCountErrorUsers,
            setIsLoading,
            setAllUserData,
            showLoading: false,
            getLineCodeMap,
            setHasUnassignedRoute
        })
    }

    useEffect(() => {
        getUserLineCodes({
            dropDownRef,
            userType,
            searchText,
            searchBarFilter,
            setSearchText,
            setEmployeeOriginList,
            setCountErrorUsers,
            setIsLoading,
            setAllUserData,
            getLineCodeMap,
            setHasUnassignedRoute
        })
    }, [])

    useEffect(() => {
        const myTeamDataListener = NativeAppEventEmitter.addListener(EventEmitterType.REFRESH_MY_TEAM, async () => {
            setIsLoading(true)
            closeAllOpenRow(swipeableRows)
            await syncDownDataByTableNames(MerchManagerScreenMapping.MyTeam)
            await getUserLineCodes({
                dropDownRef,
                userType: store?.getState()?.manager?.myTeamData?.myTeamType || userType,
                searchText,
                searchBarFilter,
                setSearchText,
                setEmployeeOriginList,
                setCountErrorUsers,
                setIsLoading,
                setAllUserData,
                getLineCodeMap,
                setHasUnassignedRoute
            })
        })
        return () => {
            myTeamDataListener && myTeamDataListener.remove()
        }
    }, [])

    const searchBarFilterReset = () => {
        setSearchText('')
        updateMyTeamData({ myTeamIndex: activeTab, myTeamType: userType, myTeamSearchText: '' })
    }

    const goToVisitTab = async (params) => {
        setIsLoading(true)
        const dataCheck = await dataCheckWithAction(
            'User_Stats__c',
            `WHERE User__c='${params?.id}' AND RecordType.DeveloperName = 'Stats'`,
            '',
            false
        )
        if (!dataCheck) {
            closeAllOpenRow(swipeableRows)
            setIsLoading(false)
            setIsErrorShow(true)
            return
        }
        await syncDownDataByTableNames(MerchManagerScreenMapping.MyTeam)
        setIsLoading(false)
        navigation.navigate(NavigationRoute.EMPLOYEE_DETAIL, { userData: params, userType, activeTab: 1 })
    }
    const refreshDataAfterSwipeOption = (setResultVisible) => {
        getEmployeeData({
            employeeTitle: userType,
            setCountErrorUsers,
            setIsLoading,
            dropDownRef,
            setAllUserData,
            lineCodeMap: store.getState().manager.lineCodeMap,
            setHasUnassignedRoute
        })
            .then((users: Array<any>) => {
                setIsLoading(false)
                filterEmployee({ searchText, users, searchBarFilter, setSearchText })
                setEmployeeOriginList(users)
                selectTeamFilterRef?.current?.refreshSelectTeamFilter()
                setResultVisible(true)
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    const onRemoveEmployeeClick = async (params) => {
        setIsLoading(true)
        const dataCheck = await dataCheckWithAction(
            'User_Stats__c',
            `WHERE User__c='${params?.id}' AND RecordType.DeveloperName = 'Stats'`,
            '',
            false
        )
        if (!dataCheck) {
            closeAllOpenRow(swipeableRows)
            setIsLoading(false)
            setIsErrorShow(true)
            return
        }
        setIsLoading(false)
        onRemoveBtnClick(params, netInfo, dropDownRef, setUserName, goToVisitTab, setIsLoading, swipeableRows)
            .then(() => {
                refreshDataAfterSwipeOption(setResultModalVisible)
            })
            .catch((err) => {
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    CommonLabel.MY_TEAM + t.labels.PBNA_MOBILE_MY_TEAM_REMOVE_EMPLOYEE,
                    err
                )
            })
    }

    const onRemoveDirectClick = async (params) => {
        setIsLoading(true)
        closeAllOpenRow(swipeableRows)
        if (params.name) {
            setUserName(params.name)
        }
        handleDirectEmployee(params, employeeList, setEmployeeList, setIsLoading, true)
            .then(() => {
                refreshDataAfterSwipeOption(setRemoveMyDirectResultModalVisible)
            })
            .catch((err) => {
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    CommonLabel.MY_TEAM + t.labels.PBNA_MOBILE_MY_TEAM_REMOVE_EMPLOYEE,
                    err
                )
            })
    }

    const onAddDirectClick = async (params) => {
        setIsLoading(true)
        closeAllOpenRow(swipeableRows)
        if (params.name) {
            setUserName(params.name)
        }
        handleDirectEmployee(params, employeeList, setEmployeeList, setIsLoading)
            .then(() => {
                refreshDataAfterSwipeOption(setAddMyDirectResultModalVisible)
            })
            .catch((err) => {
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    CommonLabel.MY_TEAM + t.labels.PBNA_MOBILE_MY_TEAM_REMOVE_EMPLOYEE,
                    err
                )
            })
    }

    const refreshData = () => {
        setTimeout(async () => {
            setIsLoading(true)
            try {
                await syncDownDataByTableNames(MerchManagerScreenMapping.MyTeam)
                await getUserLineCodes({
                    dropDownRef,
                    userType: myTeamData?.myTeamType,
                    searchText,
                    searchBarFilter,
                    setSearchText,
                    setEmployeeOriginList,
                    setCountErrorUsers,
                    setIsLoading,
                    setAllUserData,
                    getLineCodeMap,
                    setHasUnassignedRoute
                })
            } catch (error) {
                setIsLoading(false)
            }
        }, 400)
    }

    const renderItem = (item) => {
        return renderTemp({
            item,
            swipeableRows,
            onRemoveEmployeeClick,
            activeTab,
            setSwipeableRows,
            navigation,
            updateMyTeamData,
            setIsLoading,
            dropDownRef,
            userType,
            searchText,
            searchBarFilter,
            setSearchText,
            setEmployeeOriginList,
            setCountErrorUsers,
            setAllUserData,
            setIsErrorShow,
            getLineCodeMap,
            lineCodeMap: store.getState().manager.lineCodeMap,
            setHasUnassignedRoute,
            onRemoveDirectClick,
            onAddDirectClick
        })
    }

    const onAddBtnClick = async (index) => {
        setActionSearchText('')
        setDropDownModalVisible(!dropDownModalVisible)
        setIsLoading(true)
        if (index === 0) {
            await syncDownDataByTableNames(MerchManagerScreenMapping.MyTeam)
            setIsLoading(false)
            navigation.navigate(NavigationRoute.ADD_EMPLOYEE)
        } else {
            await syncDownDataByTableNames(MerchManagerScreenMapping.ServiceDetailRelated)
            setIsLoading(false)
            navigation.navigate(NavigationRoute.ADD_RECURRING_VISIT, {
                data: [],
                customerData: null,
                mapInfo: null,
                selectDayKey: null,
                isFromEmployee: true,
                userData: null
            })
        }
    }

    // TBD
    if (CommonParam.PERSONA__c === Persona.DELIVERY_SUPERVISOR) {
        return (
            <View style={styles.container}>
                <View style={styles.mainContainer}>
                    <View style={styles.headerContainer}>
                        <CText style={styles.navigationHeaderTitle}>{t.labels.PBNA_MOBILE_MY_TEAM}</CText>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.mainContainer}>
                <View style={styles.headerContainer}>
                    <CText style={styles.navigationHeaderTitle}>{t.labels.PBNA_MOBILE_MY_TEAM}</CText>
                    <TouchableOpacity
                        hitSlop={styles.hitSlop}
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
                    {renderDropdownBtnList(dropDownModalVisible, onAddBtnClick, setDropDownModalVisible)}
                </View>
                {countErrorUsers > 0 && (
                    <View style={styles.errorMessage}>
                        <MessageBar
                            message={
                                <CText>
                                    <CText style={styles.fontWeight_700}>{countErrorUsers}</CText>
                                    {hasUnassignedRoute
                                        ? ` ${t.labels.PBNA_MOBILE_EMPLOYEE_ERROR_MESSAGE_WITH_ROUTE}`
                                        : ` ${t.labels.PBNA_MOBILE_EMPLOYEE_ERROR_MESSAGE}`}
                                </CText>
                            }
                        />
                    </View>
                )}
                <View style={[styles.topTabsContainer, countErrorUsers > 0 && styles.marginTop_0]}>
                    <TouchableOpacity
                        onPress={() =>
                            changeTab({
                                tabIndex: 1,
                                userType: UserType.UserType_Merch,
                                searchBarFilter,
                                setUserType,
                                updateMyTeamData,
                                setActiveTab,
                                swipeableRows,
                                setSearchText,
                                setEmployeeOriginList,
                                setIsLoading,
                                dropDownRef,
                                setCountErrorUsers,
                                setAllUserData,
                                getLineCodeMap,
                                setHasUnassignedRoute
                            })
                        }
                        style={
                            activeTab === TabIndex.TabIndex_Merch
                                ? styles.topTabsItemActiveContainer
                                : styles.topTabsItemNormalContainer
                        }
                    >
                        <CText
                            style={
                                activeTab === TabIndex.TabIndex_Merch
                                    ? styles.topTabsItemActiveText
                                    : styles.topTabsItemNormalText
                            }
                        >
                            {t.labels.PBNA_MOBILE_MERCH}
                        </CText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            changeTab({
                                tabIndex: 2,
                                userType: UserType.UserType_Sales,
                                searchBarFilter,
                                setUserType,
                                updateMyTeamData,
                                setActiveTab,
                                swipeableRows,
                                setSearchText,
                                setEmployeeOriginList,
                                setIsLoading,
                                dropDownRef,
                                setCountErrorUsers,
                                setAllUserData,
                                getLineCodeMap,
                                setHasUnassignedRoute
                            })
                        }
                        style={
                            activeTab === TabIndex.TabIndex_Sales
                                ? styles.topTabsItemActiveContainer
                                : styles.topTabsItemNormalContainer
                        }
                    >
                        <CText
                            style={
                                activeTab === TabIndex.TabIndex_Sales
                                    ? styles.topTabsItemActiveText
                                    : styles.topTabsItemNormalText
                            }
                        >
                            {t.labels.PBNA_MOBILE_SALES}
                        </CText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            changeTab({
                                tabIndex: 3,
                                userType: UserType.UserType_Others,
                                searchBarFilter,
                                setUserType,
                                updateMyTeamData,
                                setActiveTab,
                                swipeableRows,
                                setSearchText,
                                setEmployeeOriginList,
                                setIsLoading,
                                dropDownRef,
                                setCountErrorUsers,
                                setAllUserData,
                                getLineCodeMap,
                                setHasUnassignedRoute
                            })
                        }
                        style={
                            activeTab === TabIndex.TabIndex_Others
                                ? styles.topTabsItemActiveContainer
                                : styles.topTabsItemNormalContainer
                        }
                    >
                        <CText
                            style={
                                activeTab === TabIndex.TabIndex_Others
                                    ? styles.topTabsItemActiveText
                                    : styles.topTabsItemNormalText
                            }
                        >
                            {t.labels.PBNA_MOBILE_OTHERS}
                        </CText>
                    </TouchableOpacity>
                </View>
                <View style={styles.metrics}>
                    <SearchBarFilter
                        cRef={searchBarFilter}
                        setListData={setEmployeeList}
                        setSearchBarFilteredEmployeeList={setSearchBarFilteredEmployeeList}
                        originData={employeeOriginList}
                        originListData={employeeList}
                        reset={searchBarFilterReset}
                        onFilterClick={() => closeAllOpenRow(swipeableRows)}
                        isEmployee
                        isMyTeam
                        needMyDirectOnly
                        placeholder={t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES}
                        searchTextChange={(text) => {
                            closeAllOpenRow(swipeableRows)
                            updateMyTeamData({ myTeamIndex: activeTab, myTeamType: userType, myTeamSearchText: text })
                            filterEmployee({
                                searchText: text,
                                users: employeeOriginList,
                                searchBarFilter,
                                setSearchText
                            })
                        }}
                        onFocus={() => closeAllOpenRow(swipeableRows)}
                    />
                </View>
                {enableDirectFunction(activeTab) && (
                    <SelectTeamFilter
                        cRef={selectTeamFilterRef}
                        data={employeeList}
                        setData={setEmployeeList}
                        originalData={searchBarFilteredEmployeeList}
                        persona={Persona.MERCH_MANAGER}
                    />
                )}
            </View>
            <FlatList
                data={sortExclamationList(employeeList)}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.paddingBottom_15}
                refreshControl={
                    <RefreshControlM
                        loading={isPullDownSync}
                        refreshAction={async () => {
                            setIsPullDownSync(true)
                            await refreshAndGetData()
                            setIsPullDownSync(false)
                        }}
                    />
                }
            />
            <ReassignResultModal
                navigation={navigation}
                isRemovedFromMyTeam
                userName={userName}
                modalVisible={resultModalVisible}
                setModalVisible={setResultModalVisible}
            />
            <ReassignResultModal
                navigation={navigation}
                isRemovedFromMyDirect
                userName={userName}
                modalVisible={RemoveMyDirectResultModalVisible}
                setModalVisible={setRemoveMyDirectResultModalVisible}
            />
            <ReassignResultModal
                navigation={navigation}
                isAddToMyDirect
                userName={userName}
                modalVisible={AddMyDirectResultModalVisible}
                setModalVisible={setAddMyDirectResultModalVisible}
            />
            <ErrorMsgModal
                index={DataCheckMsgIndex.COMMON_MSG}
                visible={isErrorShow}
                setModalVisible={setIsErrorShow}
                handleClick={refreshData}
            />

            <Loading isLoading={isLoading} />
        </View>
    )
}

export default MyTeam

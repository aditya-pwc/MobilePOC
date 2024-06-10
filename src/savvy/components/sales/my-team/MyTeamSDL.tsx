import React, { useEffect, useRef, useState } from 'react'
import { View, FlatList } from 'react-native'
import { UserType } from '../../../redux/types/H01_Manager/data-userType'
import MyTeamStyle from '../../../styles/manager/MyTeamStyle'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import MyTeamItemCard from './MyTeamItemCard'
import MyTeamTabs from './MyTeamTabs'
import {
    filterEmployeeBySearchText,
    filterWithSelectedSubType,
    filterWithSelectedSubTypeAndSearchText,
    getPopUpData,
    getUserData,
    syncVisitsAndCustomersTabLatestData
} from '../../../helper/manager/MyTeamSDLHelper'
import CText from '../../../../common/components/CText'
import SubTypeModal from '../../manager/common/SubTypeModal'
import _ from 'lodash'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DropDownType, NavigationRoute } from '../../../enums/Manager'
import { t } from '../../../../common/i18n/t'
import { TabIndex } from '../../../redux/types/H01_Manager/data-tabIndex'
import { CommonParam } from '../../../../common/CommonParam'
import { Persona } from '../../../../common/enums/Persona'
import { Log } from '../../../../common/enums/Log'
import { useIsFocused } from '@react-navigation/core'
import Loading from '../../../../common/components/Loading'
import SwipeableRow from '../../common/SwipeableRow'
import { UnassignedRouteCell } from '../../manager/common/EmployeeCell'
import { closeAllOpenRow, closeOtherRows, syncDownDataByTableNames } from '../../../utils/MerchManagerUtils'
import SelectTeamFilter from '../../manager/my-team/SelectTeamFilter'
import { handleDirectEmployee } from '../../manager/helper/AsDirectEmployeeHelper'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { CommonLabel } from '../../../enums/CommonLabel'
import ReassignResultModal from '../../manager/common/ReassignResultModal'
import { ScreenMapping } from '../../../config/ScreenMapping'
import RefreshControlM from '../../manager/common/RefreshControlM'
import SearchBarWithFilter from '../my-customer/SearchBarWithFilter'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'

// Future: May need to fix useEffect,renderTemp,keyExtractor for dynamic data update

const SDLMyTeamData = 'SDLMyTeamData'
interface MyTeamProps {
    route: any
    navigation: any
}
type TabArrType = {
    tabIndex: number // Defined in data-tabindex
    userType: string
    label: string
    showFilterBtn?: boolean
}[]
type TabArrGroupType = {
    [Persona.SALES_DISTRICT_LEADER]: TabArrType
    [Persona.DELIVERY_SUPERVISOR]: TabArrType
    [Persona.UNIT_GENERAL_MANAGER]: TabArrType
}

const styles = MyTeamStyle

const renderMyTeamHeader = () => {
    return (
        <View style={styles.headerContainer}>
            <CText style={styles.navigationHeaderTitle}>{t.labels.PBNA_MOBILE_MY_TEAM}</CText>
        </View>
    )
}

const tabArrGroupGen = (): TabArrGroupType => {
    return {
        [Persona.DELIVERY_SUPERVISOR]: [
            {
                tabIndex: TabIndex.TabIndex_Delivery,
                userType: UserType.UserType_Delivery,
                label: t.labels.PBNA_MOBILE_DELIVERY,
                showFilterBtn: false
            },
            {
                tabIndex: TabIndex.TabIndex_Miscellaneous,
                userType: UserType.UserType_Others,
                label: t.labels.PBNA_MOBILE_OTHERS
            }
        ],
        [Persona.SALES_DISTRICT_LEADER]: [
            {
                tabIndex: TabIndex.TabIndex_Sales,
                userType: UserType.UserType_Sales,
                label: t.labels.PBNA_MOBILE_SALES,
                showFilterBtn: true
            },
            {
                tabIndex: TabIndex.TabIndex_Merch,
                userType: UserType.UserType_Merch,
                label: t.labels.PBNA_MOBILE_MERCH
            },
            {
                tabIndex: TabIndex.TabIndex_Others,
                userType: UserType.UserType_Others,
                label: t.labels.PBNA_MOBILE_OTHERS
            }
        ],
        [Persona.UNIT_GENERAL_MANAGER]: [
            {
                tabIndex: TabIndex.TabIndex_Sales,
                userType: UserType.UserType_Sales,
                label: t.labels.PBNA_MOBILE_SALES
            },
            {
                tabIndex: TabIndex.TabIndex_Delivery,
                userType: UserType.UserType_Delivery,
                label: t.labels.PBNA_MOBILE_DELIVERY
            },
            {
                tabIndex: TabIndex.TabIndex_Merch,
                userType: UserType.UserType_Merch,
                label: t.labels.PBNA_MOBILE_MERCH
            },
            {
                tabIndex: TabIndex.TabIndex_Others,
                userType: UserType.UserType_Others,
                label: t.labels.PBNA_MOBILE_OTHERS
            }
        ]
    }
}

const MyTeamSDL = ({ navigation }: MyTeamProps) => {
    const selectTeamFilterRef: any = useRef()

    const tabArr = tabArrGroupGen()[CommonParam.PERSONA__c]
    const [employeeOriginList, setEmployeeOriginList] = useState([])
    const [employeeList, setEmployeeList] = useState([])
    const [activeTab, setActiveTab] = useState(tabArr[0].tabIndex)
    const [searchText, setSearchText] = useState('')
    const [userType, setUserType] = useState(tabArr[0].userType)
    const { dropDownRef } = useDropDown()
    const [subTypeArray, setSubTypeArray] = useState([])
    const [selectedSubType, setSelectedSubType] = useState([])
    const [typeModalVisible, setTypeModalVisible] = useState(false)
    const [userListGroupByTab, setUserListGroupByTab] = useState({
        [UserType.UserType_Merch]: [],
        [UserType.UserType_Sales]: [],
        [UserType.UserType_Others]: []
    })
    const isFocused = useIsFocused()
    const [isInitLoaded, setIsInitLoaded] = useState(false)
    const isFilterBtnShown = Boolean(tabArr.find((item) => item.tabIndex === activeTab && item.showFilterBtn))
    const [isLoading, setIsLoading] = useState(false)
    const [swipeableRows, setSwipeableRows] = useState({})
    const [userName, setUserName] = useState('')
    const [RemoveMyDirectResultModalVisible, setRemoveMyDirectResultModalVisible] = useState(false)
    const [AddMyDirectResultModalVisible, setAddMyDirectResultModalVisible] = useState(false)
    const enableDirectFunction = () => {
        return CommonParam.PERSONA__c === Persona.DELIVERY_SUPERVISOR && activeTab === TabIndex.TabIndex_Delivery
    }
    const [isPullDownSync, setIsPullDownSync] = useState(false)

    const refreshData = async (setResultModalVisible?, hideGlobalLoading?) => {
        try {
            if (!isInitLoaded) {
                !hideGlobalLoading && setIsLoading(true)
                setIsInitLoaded(true)
            }
            await syncDownDataByTableNames(ScreenMapping.SDLMyTeam)
            await syncVisitsAndCustomersTabLatestData(userType)
            return new Promise((resolve, reject) => {
                getUserData({
                    dropDownRef,
                    userType,
                    setEmployeeOriginList,
                    setUserListGroupByTab,
                    setSubTypeArray,
                    setSelectedSubType
                })
                    .then(async (users: Array<any>) => {
                        setEmployeeList(
                            filterEmployeeBySearchText({
                                searchText,
                                users: employeeOriginList,
                                employeeOriginList: users
                            })
                        )
                        setEmployeeOriginList(users)
                        if (isFilterBtnShown) {
                            const pacResultArr: any[] = await getPopUpData(users)
                            setSelectedSubType(pacResultArr)
                            setSubTypeArray(pacResultArr)
                            const filterUsers = filterWithSelectedSubTypeAndSearchText(pacResultArr, searchText)
                            setEmployeeList(filterUsers)
                            setEmployeeOriginList(filterUsers)
                        }
                        !hideGlobalLoading && setIsLoading(false)
                        setResultModalVisible && setResultModalVisible(true)
                        resolve(true)
                    })
                    .catch((error) => {
                        !hideGlobalLoading && setIsLoading(false)
                        dropDownRef.current.alertWithType(
                            DropDownType.ERROR,
                            t.labels.PBNA_MOBILE_QUERY_MY_TEAM_FAILED + error
                        )
                        storeClassLog(Log.MOBILE_ERROR, 'MyTeamSDL.refreshData.getUserData', getStringValue(error))
                        reject()
                    })
            })
        } catch (e) {
            !hideGlobalLoading && setIsLoading(false)
            storeClassLog(Log.MOBILE_ERROR, 'MyTeamSDL.refreshData', getStringValue(e))
        }
    }

    useEffect(() => {
        if (isFocused) {
            refreshData()
        }
    }, [isFocused])

    const onRemoveDirectClick = async (params) => {
        setIsLoading(true)
        closeAllOpenRow(swipeableRows)
        if (params.name) {
            setUserName(params.name)
        }
        handleDirectEmployee(params, employeeList, setEmployeeList, setIsLoading, true)
            .then(async () => {
                await refreshData(setRemoveMyDirectResultModalVisible)
                selectTeamFilterRef?.current?.refreshSelectTeamFilter()
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
            .then(async () => {
                await refreshData(setAddMyDirectResultModalVisible)
                selectTeamFilterRef?.current?.refreshSelectTeamFilter()
            })
            .catch((err) => {
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    CommonLabel.MY_TEAM + t.labels.PBNA_MOBILE_MY_TEAM_REMOVE_EMPLOYEE,
                    err
                )
            })
    }

    const syncLatestDataAndNavigate = async (item) => {
        try {
            setIsLoading(true)
            await syncDownDataByTableNames(ScreenMapping.SDLMyTeam)
            await syncVisitsAndCustomersTabLatestData(userType)
            const newUserData: any = await getUserData({
                dropDownRef,
                userType,
                setEmployeeOriginList,
                setUserListGroupByTab,
                setSubTypeArray,
                setSelectedSubType
            })
            const newItem = newUserData.find((user) => user.id === item?.item?.id)
            setIsLoading(false)
            setTimeout(() => {
                navigation.navigate(NavigationRoute.EMPLOYEE_PROFILE_OVERVIEW, {
                    userData: newItem || item.item,
                    userType
                })
            })
        } catch (e) {
            setIsLoading(false)
            storeClassLog(Log.MOBILE_ERROR, 'MyTeamSDL.syncLatestDataAndNavigate', getStringValue(e))
        }
    }

    const renderTemp = React.useCallback(
        (item) => {
            if (item?.item?.unassignedRoute) {
                return (
                    <View style={[styles.teamItem]}>
                        <UnassignedRouteCell
                            item={item?.item}
                            isUGMPersona
                            onCellPress={async () => {
                                syncLatestDataAndNavigate(item)
                            }}
                        />
                    </View>
                )
            }
            if (enableDirectFunction()) {
                let swipeButtonProps
                if (item?.item?.managerDirects?.includes(CommonParam.userId)) {
                    swipeButtonProps = [
                        {
                            label: t.labels.PBNA_MOBILE_REMOVE_FROM_MY_DIRECT.toLocaleUpperCase(),
                            color: baseStyle.color.loadingGreen,
                            onBtnClick: onRemoveDirectClick,
                            width: 90
                        }
                    ]
                } else {
                    swipeButtonProps = [
                        {
                            label: t.labels.PBNA_MOBILE_MARK_AS_MY_DIRECT.toLocaleUpperCase(),
                            color: baseStyle.color.loadingGreen,
                            onBtnClick: onAddDirectClick,
                            width: 90
                        }
                    ]
                }
                return (
                    <View style={[styles.teamItem]}>
                        <SwipeableRow
                            uniqKey={item?.item?.id}
                            swipeableRows={swipeableRows}
                            closeOtherRows={closeOtherRows}
                            params={item.item}
                            swipeButtonConfig={swipeButtonProps}
                            showBorderRadius
                            textAlignCenter
                        >
                            <MyTeamItemCard
                                item={item}
                                activeTab={activeTab}
                                itemClick={async () => {
                                    closeAllOpenRow(swipeableRows)
                                    setSwipeableRows({ ...swipeableRows })
                                    syncLatestDataAndNavigate(item)
                                }}
                                noMargin
                            />
                        </SwipeableRow>
                    </View>
                )
            }
            return (
                <MyTeamItemCard
                    item={item}
                    activeTab={activeTab}
                    itemClick={async () => {
                        syncLatestDataAndNavigate(item)
                    }}
                />
            )
        },
        [activeTab]
    )
    const keyExtractor = React.useCallback((item) => item.id, [activeTab])

    const changeTab = (tabItem) => {
        const { tabIndex, userTypeTemp } = tabItem
        setUserType(userTypeTemp)
        setActiveTab(tabIndex)
        setSearchText('')
        const employeeListInit = tabItem.showFilterBtn // solve stale closure problem
            ? filterWithSelectedSubType(JSON.parse(JSON.stringify(subTypeArray)))
            : userListGroupByTab[userTypeTemp]
        setEmployeeList(employeeListInit)
        setEmployeeOriginList(employeeListInit)
    }

    const onClickFilterBtn = () => {
        setTypeModalVisible(!typeModalVisible)
    }

    const checkClick = (index) => {
        subTypeArray[index].select = !subTypeArray[index].select
        setSubTypeArray(_.cloneDeep([...subTypeArray]))
    }

    const onCancelSubType = () => {
        setTypeModalVisible(false)
        setSubTypeArray(JSON.parse(JSON.stringify(selectedSubType)))
    }

    const storeSubTypeDataToLocal = () => {
        const selectSubType = []
        subTypeArray.forEach((element) => {
            if (element.select) {
                selectSubType.push(element)
            }
        })
        AsyncStorage.setItem(SDLMyTeamData, JSON.stringify(selectSubType))
    }

    const updateVisitSubType = () => {
        setTypeModalVisible(false)
        const changeSubType = JSON.parse(JSON.stringify(subTypeArray))
        setSelectedSubType(changeSubType)
        const result = filterWithSelectedSubTypeAndSearchText(changeSubType, searchText)
        setEmployeeList(result)
        storeSubTypeDataToLocal()
    }

    return (
        <View style={styles.container}>
            <View style={styles.mainContainer}>
                {renderMyTeamHeader()}
                <MyTeamTabs activeTab={activeTab} tabArr={tabArr} changeTab={changeTab} />
                <View style={styles.metrics}>
                    <SearchBarWithFilter
                        hideFilterBtn={!isFilterBtnShown}
                        placeholder={t.labels.PBNA_MOBILE_SEARCH_EMPLOYEE}
                        onChangeSearchBarText={(text) => {
                            setSearchText(text)
                            if (isFilterBtnShown) {
                                setEmployeeList(filterWithSelectedSubTypeAndSearchText(subTypeArray, text))
                            } else {
                                setEmployeeList(
                                    filterEmployeeBySearchText({
                                        searchText: text,
                                        users: employeeOriginList,
                                        employeeOriginList
                                    })
                                )
                            }
                        }}
                        onClickFilter={onClickFilterBtn}
                    />
                    <SubTypeModal
                        customTitle={t.labels.PBNA_MOBILE_SELECT_TERRITORY}
                        customSubTitle={t.labels.PBNA_MOBILE_SELECT_SUBTITLE}
                        subTypeArray={subTypeArray}
                        doneTitle={t.labels.PBNA_MOBILE_DONE}
                        typeModalVisible={typeModalVisible}
                        setTypeModalVisible={setTypeModalVisible}
                        onCheckClick={(index) => {
                            checkClick(index)
                        }}
                        onCancelSubType={() => {
                            onCancelSubType()
                        }}
                        updateVisitSubType={() => {
                            updateVisitSubType()
                        }}
                    />
                </View>
                {enableDirectFunction() && (
                    <SelectTeamFilter
                        cRef={selectTeamFilterRef}
                        data={employeeList}
                        setData={setEmployeeList}
                        originalData={employeeOriginList}
                        persona={Persona.DELIVERY_SUPERVISOR}
                        filterEmployeeBySearchText={filterEmployeeBySearchText}
                        searchText={searchText}
                    />
                )}
            </View>
            <FlatList
                data={employeeList}
                renderItem={renderTemp}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.paddingBottom_15}
                refreshControl={
                    <RefreshControlM
                        loading={isPullDownSync}
                        refreshAction={async () => {
                            setIsPullDownSync(true)
                            await refreshData(null, true)
                            setIsPullDownSync(false)
                        }}
                    />
                }
            />
            <Loading isLoading={isLoading} />
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
        </View>
    )
}

export default MyTeamSDL

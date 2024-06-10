/*
 * @Description:
 * @Author: Aimee Zhang
 * @Date: 2021-11-23 19:11:10
 * @LastEditTime: 2024-01-11 16:05:23
 * @LastEditors: Mary Qian
 */
import moment from 'moment'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View, StyleSheet, FlatList } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import MonthWeekFilter from '../../common/MonthWeekFilter'
import { DelEmployeeItem, SDLHeader } from '../../del-sup/deliveries/DelComponents'
import SelectTab from '../../common/SelectTab'
import SearchBarFilter from '../../manager/common/SearchBarFilter'
import RefreshControlM from '../../manager/common/RefreshControlM'
import { useSelector } from 'react-redux'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { Log } from '../../../../common/enums/Log'
import { DropDownType } from '../../../enums/Manager'
import { t } from '../../../../common/i18n/t'
import DelScheduleVisitCard from '../../del-sup/deliveries/DelScheduleCard'
import { filterWithSelectedSubType, getSDLMyDayEmployeeList, getSDLMyDayVisitList, queryTerritory } from './MydayHelper'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NewScheduleListStyle from '../../../styles/manager/NewScheduleListStyle'
import Draggable from 'react-native-draggable'
import {
    floatIconSize,
    floatPosition,
    ICON_LIST,
    ICON_MAP,
    screenHight,
    screenWidth
} from '../../../helper/manager/NewScheduleListHelper'
import ManagerMap from './ManagerMap'
import { SwipeToDo } from '../../common/SwipeToDo'
import FavoriteBar from '../../manager/common/FavoriteBar'
import {
    renderRemoveFavoriteHiddenItem,
    handleFavoriteEmployee,
    renderFavoriteHiddenItem,
    setFavoriteBarOpenStatus,
    getFavoriteBarOpenStatus
} from '../../manager/helper/FavoriteEmployeeHelper'
import SwipeCollapsible from '../../common/SwipeCollapsible'
import { getData } from '../../../utils/sync/ManagerSyncUtils'
import SubTypeModal from '../../manager/common/SubTypeModal'
import { getGeoTimeConfig } from '../../manager/schedule/GeofenceBarHelper'
import { addGeoFenceFlag } from '../../del-sup/deliveries/Deliveries'
import {
    handleScroll,
    handleSwipeCollapsibleRef,
    MyDayStatusOrder,
    renderStatusBarItem,
    sortListByStatusArr,
    updateLocalStatusSortArr
} from '../../../helper/manager/AllManagerMyDayHelper'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { DragSortableView } from 'react-native-drag-sort'
import _ from 'lodash'
import { isPersonaSDL, isPersonaUGM } from '../../../../common/enums/Persona'
import { sortArrByParamsASC } from '../../manager/helper/MerchManagerHelper'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const newScheduleListStyle = NewScheduleListStyle

const ACTIVE_TAB = 0

// 2207352-Hide filter buttons in My Day tab. Because this function is not completed yet.
const NOT_SHOW_FILTER_BTN = true

const styles = StyleSheet.create({
    ...newScheduleListStyle,
    con: { flex: 1, backgroundColor: '#fff' },
    flat: {
        paddingTop: 10,
        backgroundColor: '#fff'
    },
    metrics: {
        marginTop: 10,
        marginHorizontal: baseStyle.padding.pd_22,
        marginBottom: 20
    },
    selectTap: { marginTop: -22 }
})

const managerReducer = (state) => state.manager

interface SDLMyDayInterface {
    navigation?: any
    route?: any
    cRef?: any
}

let clickToCellDetail = false
const SDLMyDay = (props: SDLMyDayInterface) => {
    const { navigation, cRef } = props
    const manager = useSelector(managerReducer)
    const isFocused = useIsFocused()
    const { dropDownRef } = useDropDown()
    const eeSearchBar: any = useRef()
    const customerSearchBar: any = useRef()
    const topSwipeCollapsibleRef: any = useRef()
    const downSwipeCollapsibleRef: any = useRef()
    const scrollViewRef = useRef<FlatList>()
    const [activeTab, setActiveTab] = useState(ACTIVE_TAB)
    const [eeList, setEeList] = useState([])
    const [cList, setCList] = useState([])
    const [daySchInfo, setDaySchInfo] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [showSearchBar, setShowSearchBar] = useState(false)
    const [typeModalVisible, setTypeModalVisible] = useState(false)
    const [subTypeArray, setSubTypeArray] = useState([])
    const [filteredEmployeeList, setFilteredEmployeeList] = useState([])
    const [filteredVisitList, setFilteredVisitList] = useState([])
    const [selectRouteNum, setSelectRouteNum] = useState(0)
    const [weekArr, setWeekArr] = useState(null)
    const [selectedSubType, setSelectedSubType] = useState([])
    const [showFavorites, setShowFavorites] = useState(false)
    const [isPullDownSyncing, setIsPullDownSyncing] = useState(false)
    const [favoriteEE, setFavoriteEE] = useState(0)
    const selectTabData = [
        {
            name: t.labels.PBNA_MOBILE_EMPLOYEES.toLocaleUpperCase()
        },
        {
            name: t.labels.PBNA_MOBILE_CUSTOMERS
        }
    ]

    const employeeList = useRef([])
    const customerList = useRef([])

    const [isListView, setListView] = useState(true)
    const [isListExpended, setIsListExpended] = useState(false)
    const [lastOffset, setLastOffset] = useState(0)

    const { toExpend, toInitialPosition } = handleSwipeCollapsibleRef(
        topSwipeCollapsibleRef,
        downSwipeCollapsibleRef,
        navigation,
        cRef
    )
    const [topStatusArr, setTopStatusArr] = useState([])

    useEffect(() => {
        if (isListExpended && (isLoading || !isListView)) {
            if (clickToCellDetail) {
                clickToCellDetail = false
            } else {
                scrollViewRef?.current?.scrollToOffset({ offset: 0, animated: true })
                toInitialPosition()
                setIsListExpended(false)
            }
        }
    }, [isListView, isLoading])

    const getSDLMyDayEEList = async (territory?) => {
        try {
            const { list, scheduleInfo } = await getSDLMyDayEmployeeList(manager.selectedDate || moment(), territory)
            employeeList.current = list
            const result = filterWithSelectedSubType(territory || subTypeArray, list, [])
            setShowSearchBar(result.employeeList.length > 0 || result.visitList.length > 0)
            const sortedEmployeeList = sortArrByParamsASC(result.employeeList, 'lastName')
            setFilteredEmployeeList(sortedEmployeeList)
            setDaySchInfo(scheduleInfo)
            setEeList(sortedEmployeeList)
            eeSearchBar?.current?.onApplyClick(sortedEmployeeList)
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'getSDLMyDayEEList', ErrorUtils.error2String(error))
            dropDownRef?.current?.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_MYDAY_QUERY_CUSTOMER_LIST,
                ErrorUtils.error2String(error)
            )
        }
    }

    const getSDLMyDayCustomerList = async (territory?) => {
        const date = manager.selectedDate || moment()
        try {
            const { list, scheduleInfo, geoFenceData } = await getSDLMyDayVisitList(date, territory)
            const geoTimeConfig = await getGeoTimeConfig()
            addGeoFenceFlag(list, geoFenceData, geoTimeConfig)
            customerList.current = list
            const result = filterWithSelectedSubType(territory || subTypeArray, [], list)
            setShowSearchBar(result.employeeList.length > 0 || result.visitList.length > 0)
            setSelectRouteNum(result.selectedNum)
            setFilteredVisitList(result.visitList)
            setCList(result.visitList)
            customerSearchBar?.current?.onApplyClick(result.visitList)
            setDaySchInfo(scheduleInfo)
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'getSDLMyDayCustomerList', ErrorUtils.error2String(error))
            dropDownRef?.current?.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_MYDAY_QUERY_EMPLOYEE_LIST,
                ErrorUtils.error2String(error)
            )
        }
    }

    const resetSearchBar = () => {
        if (activeTab === ACTIVE_TAB) {
            eeSearchBar?.current?.onResetClick()
        } else {
            customerSearchBar?.current?.onResetClick()
        }
    }

    const onTabChanged = (index: number) => {
        setActiveTab(index)
        resetSearchBar()
    }

    const getVisitData = async (territory) => {
        if (activeTab === ACTIVE_TAB) {
            await getSDLMyDayEEList(territory)
        } else {
            await getSDLMyDayCustomerList(territory)
        }
    }

    const reFetchVisitData = async (needIsLoading?) => {
        needIsLoading && setIsLoading(true)
        employeeList.current = []
        customerList.current = []
        const selectedTerritory = await AsyncStorage.getItem('SDLMyDayTerritoryList')
        const territory = await queryTerritory()
        if (selectedTerritory) {
            territory.forEach((element) => {
                element.select = JSON.parse(selectedTerritory).findIndex((item) => element.name === item.name) >= 0
            })
        }

        await getVisitData(territory)

        getData(manager.selectedDate)
            .then(() => {
                needIsLoading && setIsLoading(false)
                setSubTypeArray(territory)
                setSelectedSubType(JSON.parse(JSON.stringify(territory)))
                setSelectRouteNum(territory.filter((item) => item.select).length)
                getVisitData(territory)
            })
            .catch((error) => {
                storeClassLog(Log.MOBILE_ERROR, 'reFetchVisitData', ErrorUtils.error2String(error))
                needIsLoading && setIsLoading(false)
            })
    }

    useEffect(() => {
        isFocused && reFetchVisitData(true)
    }, [isFocused, manager.selectedDate, activeTab])

    useEffect(() => {
        getFavoriteBarOpenStatus(setShowFavorites)
        AsyncStorage.getItem(MyDayStatusOrder.SALES).then((sortStatus: any) => {
            if (!_.isEmpty(sortStatus)) {
                setTopStatusArr(JSON.parse(sortStatus))
            }
        })
    }, [])

    const onCancelSubType = () => {
        setTypeModalVisible(!typeModalVisible)
        setSubTypeArray([...selectedSubType])
    }

    const checkClick = (index) => {
        subTypeArray[index].select = !subTypeArray[index].select
        setSubTypeArray([...subTypeArray])
    }

    const storeSubTypeDataToLocal = async () => {
        const selectSubType = []
        subTypeArray.forEach((element) => {
            if (element.select) {
                selectSubType.push(element)
            }
        })
        await AsyncStorage.setItem('SDLMyDayTerritoryList', JSON.stringify(selectSubType))
    }

    const updateVisitSubType = async () => {
        setTypeModalVisible(false)
        const changeSubType = JSON.parse(JSON.stringify(subTypeArray))
        const result = filterWithSelectedSubType(changeSubType, employeeList.current, customerList.current)
        if (activeTab === ACTIVE_TAB) {
            await getSDLMyDayEEList(changeSubType)
        } else {
            await getSDLMyDayCustomerList(changeSubType)
        }
        setSelectRouteNum(result.selectedNum)
        setSelectedSubType(changeSubType)
        await storeSubTypeDataToLocal()
    }

    const renderSearchBarFilter = () => {
        if (!showSearchBar) {
            return <View />
        }
        return (
            <View style={styles.metrics}>
                {activeTab === ACTIVE_TAB ? (
                    <SearchBarFilter
                        cRef={eeSearchBar}
                        isEmployee
                        isSDL
                        placeholder={t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES}
                        setListData={setEeList}
                        originListData={filteredEmployeeList}
                        originData={filteredEmployeeList}
                        needFavoriteOnly
                    />
                ) : (
                    <SearchBarFilter
                        cRef={customerSearchBar}
                        isEmployee={false}
                        isCustomer
                        isReview
                        placeholder={t.labels.PBNA_MOBILE_SEARCH_CUSTOMERS}
                        setListData={setCList}
                        originListData={filteredVisitList}
                        originData={filteredVisitList}
                        notShowFilterBtn={NOT_SHOW_FILTER_BTN}
                    />
                )}
            </View>
        )
    }

    const onEECardClick = (item) => {
        clickToCellDetail = true
        navigation?.navigate('SDLEmployeeSchedule', {
            navigation: navigation,
            employeeData: item,
            tmpWeekArr: weekArr
        })
    }

    const onCustomerCardClick = (item) => {
        clickToCellDetail = true
        navigation?.navigate('SDLVisitDetails', {
            navigation,
            item
        })
    }

    const renderStatusBar = (item: any) => {
        const { completeCount, inProgressCount, noStartCount }: any = daySchInfo
        const topMetrics = { yet2Start: noStartCount, inProgress: inProgressCount, completed: completeCount }
        return renderStatusBarItem(item, topMetrics)
    }

    const sortECListByStatusArr = () => {
        return sortListByStatusArr(activeTab, ACTIVE_TAB, eeList, cList, topStatusArr, filteredEmployeeList)
    }

    const { favoriteEmployees, wholeArr } = sortECListByStatusArr()

    const changeLocalSortArr = (item: any) => {
        updateLocalStatusSortArr(item, setTopStatusArr, MyDayStatusOrder.SALES)
    }

    useEffect(() => {
        const favoriteCountForSales = () => {
            const uniqEmployee = {}
            let count = 0
            favoriteEmployees.forEach((employee) => {
                if (!uniqEmployee[employee.id]) {
                    count++
                    uniqEmployee[employee.id] = employee.id
                }
            })
            return count
        }
        setFavoriteEE(favoriteCountForSales())
    }, [favoriteEmployees])

    const renderEeItem = ({ item, index }) => {
        const isLastItem = index === favoriteEmployees?.length - 1
        if (activeTab === ACTIVE_TAB) {
            return (
                <DelEmployeeItem
                    isLastItem={isLastItem}
                    key={item.Id}
                    item={item}
                    onItemPress={() => {
                        onEECardClick(item)
                    }}
                    type
                />
            )
        }
        return (
            <DelScheduleVisitCard
                myDay
                key={item.Id}
                item={item}
                onItemPress={() => {
                    onCustomerCardClick(item)
                }}
            />
        )
    }
    const renderListRefresh = () => {
        return (
            <RefreshControlM
                loading={isPullDownSyncing}
                refreshAction={async () => {
                    setIsPullDownSyncing(true)
                    await reFetchVisitData()
                    setIsPullDownSyncing(false)
                }}
            />
        )
    }

    const renderFavoriteEmployees = useMemo(() => {
        return (
            <View>
                {activeTab === ACTIVE_TAB && (
                    <FavoriteBar
                        count={favoriteEE}
                        isOpen={showFavorites}
                        onClick={() => setFavoriteBarOpenStatus(setShowFavorites, showFavorites)}
                    />
                )}
                {showFavorites && (
                    <SwipeToDo
                        cRef={scrollViewRef}
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
                        isUndo
                        allData={eeList}
                        listData={favoriteEmployees}
                        setListData={setEeList}
                        renderItem={renderEeItem}
                        renderHiddenItem={renderRemoveFavoriteHiddenItem}
                        swipeCallback={handleFavoriteEmployee}
                        setIsLoading={setIsLoading}
                        style={NewScheduleListStyle.favoriteItem}
                        keyExtractor={(item) => item.id + item.RouteSalesGeoId}
                    />
                )}
            </View>
        )
    }, [favoriteEmployees, showFavorites])

    const renderList = () => {
        const list = wholeArr
        if (activeTab === ACTIVE_TAB) {
            return (
                <SwipeToDo
                    cRef={scrollViewRef}
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
                    allData={eeList}
                    listData={list}
                    setListData={setEeList}
                    renderItem={renderEeItem}
                    renderHiddenItem={renderFavoriteHiddenItem}
                    swipeCallback={handleFavoriteEmployee}
                    setIsLoading={setIsLoading}
                    refreshControl={renderListRefresh()}
                    renderListHeader={renderFavoriteEmployees}
                    keyExtractor={(item) => item.id + item.RouteSalesGeoId}
                />
            )
        }
        return (
            <FlatList
                style={styles.flat}
                data={list}
                extraData={list}
                renderItem={renderEeItem}
                keyExtractor={(item) => item.Id}
                refreshControl={renderListRefresh()}
            />
        )
    }

    const renderTopStatusCard = () => {
        const isBeforeToday =
            moment(manager.selectedDate || moment()).format(TIME_FORMAT.Y_MM_DD) <= moment().format(TIME_FORMAT.Y_MM_DD)
        const showStatusCard = isBeforeToday && (activeTab === ACTIVE_TAB ? eeList?.length > 0 : cList?.length > 0)
        return (
            showStatusCard && (
                <View style={styles.statusCard}>
                    <DragSortableView
                        parentWidth={428}
                        dataSource={topStatusArr}
                        keyExtractor={(item) => item.status}
                        renderItem={renderStatusBar}
                        childrenHeight={40}
                        childrenWidth={120}
                        onDataChange={changeLocalSortArr}
                        onDragEnd={sortECListByStatusArr}
                        marginChildrenRight={12}
                    />
                </View>
            )
        )
    }

    const renderListView = () => {
        return (
            <>
                <SelectTab
                    style={styles.selectTap}
                    listData={selectTabData}
                    changeTab={onTabChanged}
                    activeTab={activeTab}
                />
                <SwipeCollapsible
                    cRef={downSwipeCollapsibleRef}
                    height={(isPersonaSDL() || isPersonaUGM()) && !_.isEmpty(eeList) ? 90 : 10}
                >
                    {!isListExpended && (isPersonaSDL() || isPersonaUGM()) && renderTopStatusCard()}
                </SwipeCollapsible>
                {renderSearchBarFilter()}
                {renderList()}
            </>
        )
    }

    const renderMapView = () => {
        return (
            <ManagerMap
                isLandscape={false}
                employeeList={eeList}
                selectedDay={manager.selectedDate}
                navigation={navigation}
            />
        )
    }

    return (
        <>
            <SwipeCollapsible cRef={topSwipeCollapsibleRef} height={-80} topToBottom>
                <SDLHeader
                    setTypeModalVisible={setTypeModalVisible}
                    typeModalVisible={typeModalVisible}
                    selectRouteNum={selectRouteNum}
                    titleName={t.labels.PBNA_MOBILE_MY_DAY}
                />
            </SwipeCollapsible>
            <MonthWeekFilter isShowWeek onSetWeekArr={setWeekArr} onSelectDay={resetSearchBar} isLoading={isLoading} />
            {isListView ? renderListView() : renderMapView()}
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
            <Draggable
                x={screenWidth * floatPosition}
                y={screenHight * floatPosition}
                minX={0}
                minY={90}
                maxX={screenWidth}
                maxY={screenHight - 80}
                renderSize={floatIconSize}
                isCircle
                imageSource={isListView ? ICON_MAP : ICON_LIST}
                onShortPressRelease={() => {
                    setListView(!isListView)
                }}
            />
        </>
    )
}

export default SDLMyDay

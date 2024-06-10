/*
 * @Description:
 * @Author: Fangfang Ji
 * @Date: 2021-11-23 20:53:03
 * @LastEditTime: 2023-07-05 11:38:10
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 */

import moment from 'moment'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View, StyleSheet, FlatList, Image } from 'react-native'
import Draggable from 'react-native-draggable'
import { useSelector } from 'react-redux'
import { useIsFocused } from '@react-navigation/native'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { Log } from '../../../../common/enums/Log'
import { DropDownType } from '../../../enums/Manager'
import { isPersonaManager } from '../../../../common/enums/Persona'
import {
    floatIconSize,
    floatPosition,
    ICON_LIST,
    ICON_MAP,
    screenHight,
    screenWidth
} from '../../../helper/manager/NewScheduleListHelper'
import { t } from '../../../../common/i18n/t'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import MonthWeekFilter from '../../common/MonthWeekFilter'
import SelectTab from '../../common/SelectTab'
import SearchBarFilter from '../../manager/common/SearchBarFilter'
import ManagerMap from '../../sales/my-day/ManagerMap'
import RefreshControlM from '../../manager/common/RefreshControlM'
import { DelEmployeeItem, DelHeader, ScheduleSumInfoHeader } from './DelComponents'
import {
    getDeliveriesEmployeeList,
    getDeliveriesVisitList,
    getDeliveriesOrderList,
    getActiveTabName,
    MyDayDeliveryTabs,
    getOrderDispatchActionArr
} from './DeliveriesHelper'
import DelScheduleVisitCard from './DelScheduleCard'
import DelOrderItem from './DelOrderItem'
import CText from '../../../../common/components/CText'
import CCheckBox from '../../../../common/components/CCheckBox'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import _ from 'lodash'
import OrderMap from './OrderMap'
import { getData } from '../../../utils/sync/ManagerSyncUtils'
import store from '../../../redux/store/Store'
import FavoriteBar from '../../manager/common/FavoriteBar'
import {
    getFavoriteBarOpenStatus,
    handleFavoriteEmployee,
    renderFavoriteHiddenItem,
    renderRemoveFavoriteHiddenItem,
    setFavoriteBarOpenStatus
} from '../../manager/helper/FavoriteEmployeeHelper'
import { SwipeToDo } from '../../common/SwipeToDo'
import NewScheduleListStyle from '../../../styles/manager/NewScheduleListStyle'
import SwipeCollapsible from '../../common/SwipeCollapsible'
import { getGeoTimeConfig } from '../../manager/schedule/GeofenceBarHelper'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { handleScroll, handleSwipeCollapsibleRef } from '../../../helper/manager/AllManagerMyDayHelper'
import { refreshManager } from '../../../utils/MerchManagerUtils'
import { getBreadcrumbInfo } from './DelEmployeeSchedule'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'

const VanIcon = require('../../../../../assets/image/NoEmployees.png')
let employeeList = []
let customerList = []
let originOrderList = []
const ACTIVE_TAB = 0
let actionArr = []
let curAction = ''
let tooltipH = 0
let selectTabData = []
let dispatchParams = {}

// 2207352-Hide filter buttons in My Day tab. Because this function is not completed yet.
const styles = StyleSheet.create({
    flat: { paddingTop: 10, backgroundColor: '#fff' },
    metrics: {
        marginTop: 28,
        marginHorizontal: baseStyle.padding.pd_22,
        marginBottom: 22
    },
    selectTap: { marginTop: -22 },
    checkBoxItem: {
        backgroundColor: '#FFF',
        borderWidth: 0,
        padding: 0,
        marginRight: -10
    },
    orderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 22,
        justifyContent: 'space-between'
    },
    checkBoxCon: { flexDirection: 'row', alignItems: 'center' },
    actionText: { fontSize: 14, fontFamily: 'Gotham', maxWidth: screenWidth - 150 },
    selectAll: { fontSize: 12, fontWeight: '800', fontFamily: 'Gotham' },
    vanIcon: { width: 200, height: 200, marginHorizontal: 50 },
    noEmployeesText: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginTop: -40 },
    noEmployeesScheduledText: { fontSize: 14, fontWeight: '100', textAlign: 'center', marginTop: 10 }

    // dispatchIcon: { width: 315, height: 200, marginTop: 40 }
})
const managerReducer = (state) => state.manager
interface DeliveriesInterface {
    navigation?: any
    route?: any
    cRef?: any
}

export const addGeoFenceFlag = (visitArr, geoFenceData, geoTimeConfig) => {
    visitArr?.forEach((visit) => {
        getBreadcrumbInfo(geoFenceData, geoTimeConfig, visit)
    })
}

let clickToCellDetail = false
const Deliveries = (props: DeliveriesInterface) => {
    const { navigation, cRef } = props
    const isFocused = useIsFocused()
    const manager = useSelector(managerReducer)
    const { dropDownRef } = useDropDown()
    const eeSearchBar: any = useRef()
    const customerSearchBar: any = useRef()
    const orderSearchBar: any = useRef()
    const scrollViewRef = useRef<FlatList>()
    const topSwipeCollapsibleRef: any = useRef()
    const downSwipeCollapsibleRef: any = useRef()
    const [activeTab, setActiveTab] = useState(ACTIVE_TAB)
    const [eeList, setEeList] = useState([])
    const [cList, setCList] = useState([])
    const [orderList, setOrderList] = useState([])
    const [orderListMap, setOrderListMap] = useState([])
    const [daySchInfo, setDaySchInfo] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [weekArr, setWeekArr] = useState(null)
    const [isListView, setListView] = useState(true)
    const [isEdit, setIsEdit] = useState(false)
    const [selectOrderMap, setSelectOrderMap] = useState({})
    const [allSelect, setAllSelect] = useState(false)
    const [isPullDownSyncing, setIsPullDownSyncing] = useState(false)

    const [showFavorites, setShowFavorites] = useState(false)
    const [isListExpended, setIsListExpended] = useState(false)
    const [lastOffset, setLastOffset] = useState(0)

    const { toExpend, toInitialPosition } = handleSwipeCollapsibleRef(
        topSwipeCollapsibleRef,
        downSwipeCollapsibleRef,
        navigation,
        cRef
    )

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

    const getEEList = async () => {
        const date1 = manager.selectedDate || moment()
        try {
            const { list, scheduleInfo } = await getDeliveriesEmployeeList(date1)
            employeeList = list
            setDaySchInfo(scheduleInfo)
            setEeList(list)
            eeSearchBar?.current?.onApplyClick(list)
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'getEEList', getStringValue(error))
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_DELIVERIES_QUERY_EMPLOYEE_LIST,
                error
            )
        }
    }
    const getCustomerList = async () => {
        const date = manager.selectedDate || moment()
        try {
            const { list, scheduleInfo, geoFenceData } = await getDeliveriesVisitList(date)
            const geoTimeConfig = await getGeoTimeConfig()
            addGeoFenceFlag(list, geoFenceData, geoTimeConfig)
            customerList = list
            setCList(list)
            setDaySchInfo(scheduleInfo)
            customerSearchBar?.current?.onApplyClick(list)
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'getCustomerList', getStringValue(error))
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_DELIVERIES_QUERY_CUSTOMER_LIST,
                error
            )
        }
    }
    const getOrderList = async (isRefresh?) => {
        try {
            const date = manager.selectedDate || moment()
            const { list, scheduleInfo } = await getDeliveriesOrderList(date)
            originOrderList = list
            setOrderListMap(list)
            setDaySchInfo(scheduleInfo)
            setOrderList(list)
            if (isRefresh) {
                orderSearchBar?.current?.onResetClick()
            } else {
                orderSearchBar?.current?.onApplyClick(list)
            }
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'getOrderList', getStringValue(error))
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_DELIVERIES_QUERY_ORDER_LIST,
                error
            )
        }
    }
    const resetSearchBar = () => {
        if (activeTab === ACTIVE_TAB) {
            eeSearchBar?.current?.onResetClick()
        } else if (activeTab === 1) {
            customerSearchBar?.current?.onResetClick()
        } else {
            orderSearchBar?.current?.onResetClick()
        }
    }
    const onTabChanged = (index: number) => {
        if (isEdit) {
            return
        }
        setActiveTab(index)
        resetSearchBar()
    }
    const getVisitData = async (isRefresh?) => {
        // setIsLoading(true)
        const activeTabName = getActiveTabName(activeTab)
        switch (activeTabName) {
            case MyDayDeliveryTabs.employee:
                await getEEList()
                break
            case MyDayDeliveryTabs.deliveries:
                await getCustomerList()
                break
            case MyDayDeliveryTabs.order:
                await getOrderList(isRefresh)
                break
            default:
                await getEEList()
        }
        // setIsLoading(false)
    }
    const refetchVisitData = async (isRefresh?, needIsLoading?) => {
        needIsLoading && setIsLoading(true)

        try {
            employeeList = []
            customerList = []
            originOrderList = []
            await getVisitData(isRefresh)
            getData(store.getState().manager.selectedDate)
                .then(() => {
                    needIsLoading && setIsLoading(false)
                    getVisitData(isRefresh)
                })
                .catch((error) => {
                    storeClassLog(Log.MOBILE_ERROR, 'refetchVisitData', getStringValue(error))
                    needIsLoading && setIsLoading(false)
                })
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'refetchVisitData', getStringValue(error))
            needIsLoading && setIsLoading(false)
        }
    }

    const orderCheckBoxClick = (item) => {
        if (selectOrderMap[item.Id]) {
            delete selectOrderMap[item.Id]
        } else {
            selectOrderMap[item.Id] = item
        }
        setSelectOrderMap({ ...selectOrderMap })
        setAllSelect(_.size(selectOrderMap) === orderList.length)
        const tempOrderList = _.cloneDeep(orderList)
        setOrderList([...tempOrderList])
    }
    const cancelAction = () => {
        setSelectOrderMap({})
        setAllSelect(false)
        setIsEdit(false)
        dispatchParams = {}
    }
    const navigateToDispatchAction = () => {
        navigation.navigate('DispatchAction', {
            selectOrderMap: selectOrderMap,
            date: manager.selectedDate || moment(),
            action: curAction,
            dispatchParams: dispatchParams,
            cancel: cancelAction,
            refresh: (selectOrderMap, params: any) => {
                dispatchParams = params
                curAction = params?.currentAction.toUpperCase()
                setSelectOrderMap(selectOrderMap)
                setOrderList([...orderList])
            }
        })
    }
    const allOrderSelect = () => {
        const tempOrderList = _.cloneDeep(orderList)
        tempOrderList.forEach((item) => {
            if (allSelect) {
                delete selectOrderMap[item.Id]
            } else {
                selectOrderMap[item.Id] = item
            }
        })
        setSelectOrderMap({ ...selectOrderMap })
        setAllSelect((v) => !v)
        setOrderList([...tempOrderList])
    }
    useEffect(() => {
        selectTabData = [
            {
                name: t.labels.PBNA_MOBILE_EMPLOYEES.toLocaleUpperCase()
            },
            {
                name: t.labels.PBNA_MOBILE_DELIVERIES.toLocaleUpperCase()
            },
            {
                name: t.labels.PBNA_MOBILE_METRICS_ORDERS.toLocaleUpperCase()
            }
        ]
        if (isEdit) {
            return
        }
        isFocused && refetchVisitData(false, true)
        const { actions, tooltipHeight } = getOrderDispatchActionArr(manager.selectedDate || moment(), true)
        actionArr = actions
        tooltipH = tooltipHeight
        dispatchParams = {}
    }, [isFocused, manager.selectedDate, activeTab])

    useEffect(() => {
        getFavoriteBarOpenStatus(setShowFavorites)
    }, [])

    const renderSearchBarFilter = () => {
        const activeTabName = getActiveTabName(activeTab)
        switch (activeTabName) {
            case MyDayDeliveryTabs.employee:
                return (
                    <View style={styles.metrics}>
                        <SearchBarFilter
                            cRef={eeSearchBar}
                            isEmployee
                            isDelivery
                            placeholder={t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES}
                            setListData={setEeList}
                            originListData={employeeList}
                            originData={employeeList}
                            needFavoriteOnly
                            needMyDirectOnly
                        />
                    </View>
                )
            case MyDayDeliveryTabs.deliveries:
                return (
                    <View style={styles.metrics}>
                        <SearchBarFilter
                            cRef={customerSearchBar}
                            isEmployee={false}
                            isCustomer
                            isReview
                            placeholder={t.labels.PBNA_MOBILE_SEARCH_CUSTOMERS}
                            setListData={setCList}
                            originListData={customerList}
                            originData={customerList}
                            notShowFilterBtn={isPersonaManager()}
                        />
                    </View>
                )
            case MyDayDeliveryTabs.order:
                return (
                    <View style={styles.metrics}>
                        <SearchBarFilter
                            isOrder
                            cRef={orderSearchBar}
                            isEmployee={false}
                            isCustomer={false}
                            isReview
                            placeholder={t.labels.PBNA_MOBILE_SEARCH_ORDERS}
                            originListData={originOrderList}
                            originData={originOrderList}
                            reset={getOrderList}
                            setListData={setOrderList}
                            setDaySchInfo={setDaySchInfo}
                        />
                    </View>
                )
            default:
                return <></>
        }
    }

    const filterFavoriteEmployees = () => {
        const activeTabName = getActiveTabName(activeTab)
        const favoriteEmployees = []
        const notFavoritedEmployees = []
        if (activeTabName === MyDayDeliveryTabs.employee) {
            eeList.forEach((employee) => {
                if (employee.isFavorited) {
                    favoriteEmployees.push(employee)
                } else {
                    notFavoritedEmployees.push(employee)
                }
            })
        }
        eeList.forEach((employee) => {
            employeeList.forEach((originEE) => {
                if (originEE.id === employee.id) {
                    originEE.isFavorited = employee.isFavorited
                }
            })
        })
        return { favoriteEmployees, notFavoritedEmployees }
    }
    const { favoriteEmployees, notFavoritedEmployees } = filterFavoriteEmployees()

    const renderEeItem = ({ item, index }) => {
        const activeTabName = getActiveTabName(activeTab)
        const isLastItem = index === favoriteEmployees?.length - 1
        switch (activeTabName) {
            case MyDayDeliveryTabs.employee:
                return (
                    <DelEmployeeItem
                        isLastItem={isLastItem}
                        key={item.Id}
                        item={item}
                        onItemPress={() => {
                            clickToCellDetail = true
                            navigation?.navigate('DelEmployeeSchedule', {
                                navigation: navigation,
                                employeeData: item,
                                tmpWeekArr: weekArr
                            })
                        }}
                    />
                )
            case MyDayDeliveryTabs.deliveries:
                return (
                    <DelScheduleVisitCard
                        key={item.Id}
                        item={item}
                        onItemPress={() => {
                            clickToCellDetail = true
                            navigation?.navigate('DeliveryVisitDetail', {
                                navigation,
                                item
                            })
                        }}
                    />
                )
            case MyDayDeliveryTabs.order:
                return (
                    <DelOrderItem // Reused in OrderMap notified Matthew Huang Team 3 if changed
                        key={item.Id}
                        item={item}
                        isEdit={isEdit}
                        select={selectOrderMap[item.Id]}
                        actionArr={actionArr}
                        tooltipHeight={tooltipH}
                        onItemPress={() => {}}
                        onOperationBtnPress={() => {}}
                        handleCheckBoxClick={() => orderCheckBoxClick(item)}
                        navigation={navigation}
                        actionClick={(action) => {
                            setIsEdit(true)
                            curAction = action
                            selectOrderMap[item.Id] = item
                            setSelectOrderMap({ ...selectOrderMap })
                            setAllSelect(_.size(selectOrderMap) === orderList.length)
                            const tempOrderList = _.cloneDeep(orderList)
                            setOrderList([...tempOrderList])
                        }}
                    />
                )
            default:
        }
    }

    const renderFavoriteEmployees = useMemo(() => {
        return (
            <View>
                {getActiveTabName(activeTab) === MyDayDeliveryTabs.employee && (
                    <FavoriteBar
                        count={favoriteEmployees?.length}
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
                        keyExtractor={(item) => item.id + item.LoadNum}
                        listData={favoriteEmployees}
                        setListData={setEeList}
                        renderItem={renderEeItem}
                        renderHiddenItem={renderRemoveFavoriteHiddenItem}
                        swipeCallback={handleFavoriteEmployee}
                        setIsLoading={setIsLoading}
                        style={NewScheduleListStyle.favoriteItem}
                    />
                )}
            </View>
        )
    }, [favoriteEmployees, showFavorites])

    const renderDayScheduleInfo = () => {
        const isForOrder = getActiveTabName(activeTab) === MyDayDeliveryTabs.order
        return (
            <SwipeCollapsible cRef={downSwipeCollapsibleRef} height={65}>
                <ScheduleSumInfoHeader data={daySchInfo} isForOrder={isForOrder} activeTab={activeTab} />
            </SwipeCollapsible>
        )
    }
    const renderListRefresh = () => {
        return (
            <RefreshControlM
                loading={isPullDownSyncing}
                refreshAction={async () => {
                    setIsPullDownSyncing(true)
                    await refreshManager()
                    await refetchVisitData(true)
                    setIsPullDownSyncing(false)
                }}
            />
        )
    }

    const renderEmptyList = () => {
        return (
            <View style={[commonStyle.alignCenter, commonStyle.flex_1]}>
                <View>
                    <Image source={VanIcon} style={styles.vanIcon} resizeMode="contain" />
                    <CText style={styles.noEmployeesText}>{t.labels.PBNA_NO_EMPLOYEES}</CText>
                    <CText style={styles.noEmployeesScheduledText}>{t.labels.PBNA_NO_EMPLOYEES_ARE_SCHEDULED}</CText>
                    <CText style={styles.noEmployeesScheduledText}>{t.labels.PBNA_FOR_THIS_DAY}</CText>
                </View>
            </View>
        )
    }

    const renderList = () => {
        const activeTabName = getActiveTabName(activeTab)
        let list = null
        switch (activeTabName) {
            case MyDayDeliveryTabs.employee:
                list = notFavoritedEmployees
                break
            case MyDayDeliveryTabs.deliveries:
                list = cList
                break
            case MyDayDeliveryTabs.order:
                list = orderList
                break
            default:
                list = eeList
        }
        if (activeTabName === MyDayDeliveryTabs.employee) {
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
                    keyExtractor={(item) => item.id + item.LoadNum}
                    listData={list}
                    setListData={setEeList}
                    renderItem={renderEeItem}
                    renderHiddenItem={renderFavoriteHiddenItem}
                    swipeCallback={handleFavoriteEmployee}
                    setIsLoading={setIsLoading}
                    refreshControl={renderListRefresh()}
                    renderListHeader={renderFavoriteEmployees}
                    ListEmptyComponent={!isLoading && eeList?.length === 0 && renderEmptyList()}
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
    const renderRescheduleHeader = () => {
        const { actions } = getOrderDispatchActionArr(manager.selectedDate || moment())
        const currentAction = actions.filter((item) => item.toUpperCase() === curAction)[0]
        return (
            <View style={styles.orderHeader}>
                <CText numberOfLines={1} style={styles.actionText}>
                    {_.size(selectOrderMap)} {t.labels.PBNA_MOBILE_ORDERS} {t.labels.PBNA_MOBILE_TO.toLocaleLowerCase()}{' '}
                    {currentAction}
                </CText>
                <View style={styles.checkBoxCon}>
                    <CText style={styles.selectAll}>{t.labels.PBNA_MOBILE_SELECT_ALL.toUpperCase()}</CText>
                    <CCheckBox onPress={allOrderSelect} checked={allSelect} containerStyle={styles.checkBoxItem} />
                </View>
            </View>
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
                {renderDayScheduleInfo()}
                {renderSearchBarFilter()}
                {isEdit && getActiveTabName(activeTab) === MyDayDeliveryTabs.order && renderRescheduleHeader()}
                {renderList()}
            </>
        )
    }

    const renderMapView = (eeList) => {
        const isOrderTab = activeTab === 2
        return (
            <>
                {isOrderTab ? (
                    <OrderMap
                        orderList={orderListMap}
                        navigation={navigation}
                        isLandscape={false}
                        RenderItem={renderEeItem}
                    />
                ) : (
                    <ManagerMap
                        isLandscape={false}
                        employeeList={eeList}
                        selectedDay={manager.selectedDate}
                        navigation={navigation}
                    />
                )}
            </>
        )
    }
    return (
        <>
            <SwipeCollapsible cRef={topSwipeCollapsibleRef} height={-80} topToBottom>
                <DelHeader navigation={navigation} />
            </SwipeCollapsible>
            <MonthWeekFilter
                isShowWeek
                disable={isEdit}
                onSetWeekArr={setWeekArr}
                onSelectDay={resetSearchBar}
                isLoading={isLoading}
            />
            {isListView ? renderListView() : renderMapView(eeList)}
            {isEdit && (
                <FormBottomButton
                    disableSave={_.size(selectOrderMap) === 0}
                    leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL}
                    rightButtonLabel={`${t.labels.PBNA_MOBILE_SELECT.toUpperCase()} ${_.size(
                        selectOrderMap
                    )} ${t.labels.PBNA_MOBILE_ORDERS.toUpperCase()}`}
                    onPressCancel={cancelAction}
                    onPressSave={navigateToDispatchAction}
                />
            )}
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
                    // Refresh on switch to Order Map View
                    getActiveTabName(activeTab) === MyDayDeliveryTabs.order && refetchVisitData(false, true)
                }}
            />
        </>
    )
}

export default Deliveries

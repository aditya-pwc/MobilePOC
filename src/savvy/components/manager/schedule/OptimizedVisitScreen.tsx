/**
 * @description Optimized visits - add/remove visits
 * @author Jianmin Shen
 * @email jianmin.s.shen@pwc.com
 * @date 2022-09-14
 */

import React, { useRef, useEffect, useState } from 'react'
import { View, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import CText from '../../../../common/components/CText'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import NavigationBar from '../../common/NavigationBar'
import { t } from '../../../../common/i18n/t'
import { useDispatch, useSelector } from 'react-redux'
import { SelectCustomerCell } from '../common/CustomerCell'
import { syncUpObjUpdateFromMem } from '../../../api/SyncUtils'
import _ from 'lodash'
import { SoupService } from '../../../service/SoupService'
import ScheduleQuery from '../../../queries/ScheduleQuery'
import { formatString } from '../../../utils/CommonUtils'
import { Log } from '../../../../common/enums/Log'
import SwipeableRow from '../../common/SwipeableRow'
import {
    getWeekLabel,
    computeShipAddress,
    computeVisitObj,
    getTotalMinus,
    getTotalHours
} from '../../../utils/MerchManagerComputeUtils'
import Loading from '../../../../common/components/Loading'
import {
    getTimeFromMins,
    closeOtherRows,
    closeAllOpenRow,
    reSequenceByVisitListId,
    calculateDistanceAndTravelTime,
    getRandomBetweenTwoNum
} from '../../../utils/MerchManagerUtils'
import MonthWeek from '../../common/MonthWeek'
import ReassignModal from '../common/ReassignModal'
import { DataCheckMsgIndex } from '../../../enums/Manager'
import { formatWithTimeZone } from '../../../utils/TimeZoneUtils'
import moment from 'moment'
import ReassignResultModal from '../common/ReassignResultModal'
import { VisitOperationType, VisitStatus } from '../../../enums/Visit'
import { updateVisitListToUnscheduled } from '../helper/MerchManagerHelper'
import ErrorMsgModal from '../common/ErrorMsgModal'
import { CommonParam } from '../../../../common/CommonParam'
import { decryptWithString } from '../../../utils/Aes'
import { compose } from '@reduxjs/toolkit'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import managerAction from '../../../redux/action/H01_Manager/managerAction'
import { getAveragePayRate, getAmount, sumVisitMetric } from '../helper/OptimizedVisitHelper'
import { CommonLabel } from '../../../enums/CommonLabel'
import { queryAndSyncDailyForAdd, queryAndSyncWeeklyForAdd } from '../service/AddAVisitService'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'

interface OptimizedVisitProps {
    route
    navigation
}

const managerReducer = (state) => state.manager

const IMG_MODAL_CLEAR = ImageSrc.IMG_MODAL_CLEAR
const IMG_MODAL_DELETE = ImageSrc.IMG_MODAL_DELETE
const IMG_MODAL_REASSIGN = ImageSrc.IMG_MODAL_REASSIGN

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    header: {
        ...commonStyle.alignCenter,
        // position: 'relative',
        paddingTop: 70
    },
    backButton: {
        right: 0,
        bottom: 10
    },
    imgBack: {
        width: 12,
        height: 20
    },
    titleText: {
        fontSize: baseStyle.fontSize.fs_24,
        marginBottom: 40,
        fontWeight: baseStyle.fontWeight.fw_800
    },
    removeText: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_500
    },
    hvcStyle: {
        ...commonStyle.flexRowSpaceBet,
        marginTop: 25
    },
    hourStyle: {
        fontSize: baseStyle.fontSize.fs_14,
        color: '#565656'
    },
    hourContentStyle: {
        marginTop: 10,
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: '500'
    },
    rightAction: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        backgroundColor: 'transparent',
        paddingTop: 5,
        textAlign: 'center'
    },
    editStyle: {
        height: 50,
        marginTop: 20,
        justifyContent: 'flex-end',
        ...commonStyle.flexRowAlignCenter
    },
    editText: {
        marginLeft: 20,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.tabBlue
    },
    editSelectAllContainer: {
        marginVertical: 0,
        marginLeft: 'auto',
        marginRight: 0,
        backgroundColor: baseStyle.color.white
    },
    editSelectAllText: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    selectedBox: {
        height: 120,
        marginTop: 25,
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
        ...commonStyle.flexRowSpaceCenter
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
    inactiveBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#D3D3D3'
    },
    flexRowCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    marginTop40: {
        marginTop: 40
    }
})

let selDay = ''
let weekArr = []
let averageHourPayRateInCurrentLoation = null

const OptimizedVisitScreen: React.FC<OptimizedVisitProps> = ({ navigation }) => {
    // const [activeTab, setActiveTab] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const manager = useSelector(managerReducer)
    const visitListId = manager.visitListId
    const [customerList, setCustomerList] = useState([])
    const cFlatListRef = useRef<FlatList>()
    const refMonthWeek: any = useRef()
    const [swipeableRows] = useState({})
    const [weekDays, setWeekDays] = useState({})
    const [activeDayTotalVisits, setActiveDayTotalVisits] = useState(0)
    const [activeDayTotalDuration, setActiveDayTotalDuration] = useState(0)
    const [activeDayTotalCost, setActiveDayTotalCost] = useState(0)
    const [totalList, setTotalList] = useState([])

    const reassignModal: any = useRef()
    const reassignResultModal = useRef(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [selectData, setSelectData] = useState([])
    const [selectedTime, setSelectedTime] = useState('')
    // const [isAllChecked, setIsAllChecked] = useState(false)
    const [totalAssign, setTotalAssign] = useState('1')
    const [modalVisible, setModalVisible] = useState(false)
    const [isErrorShow, setIsErrorShow] = useState(false)
    const [errorMsgType, setErrorMsgType] = useState(DataCheckMsgIndex.COMMON_MSG)
    const { dropDownRef } = useDropDown()
    const dispatch = useDispatch()
    const getEmployeeListForReassign = compose(dispatch, managerAction.getEmployeeListForReassign)

    const calculateHVC = async (visitListArr) => {
        if (_.isNull(averageHourPayRateInCurrentLoation)) {
            averageHourPayRateInCurrentLoation = await getAveragePayRate()
        }

        visitListArr.forEach((visitItem) => {
            // visits added and removed by DF duration all calculated in backend now
            visitItem.visitDuration = visitItem.Planned_Duration_Minutes__c

            if (visitItem.payRateHourly) {
                visitItem.payRateHourlyNumber = _.toNumber(decryptWithString(visitItem.payRateHourly))
            } else {
                visitItem.payRateHourlyNumber = averageHourPayRateInCurrentLoation
            }

            visitItem.forecastCost = Math.round((visitItem.visitDuration / 60) * visitItem.payRateHourlyNumber)

            const shippingAddress = JSON.parse(visitItem.ShippingAddress)
            if (shippingAddress) {
                shippingAddress.street = shippingAddress?.street?.replace(/[\r\n]/g, ' ')
            }
            visitItem.address = shippingAddress?.street || ''
            visitItem.cityStateZip = computeShipAddress(shippingAddress)
        })
    }

    const resetState = () => {
        const updateCustomerList = customerList.map((item) => {
            item.select = false
            return item
        })
        setSelectData([])
        setSelectedTime('')
        setCustomerList(updateCustomerList)
        // setIsAllChecked(false)
    }

    const getVisitList = async () => {
        setIsLoading(true)
        setIsEditMode(false)
        resetState()
        let selIndex = 0
        if (selDay) {
            selIndex = weekArr.findIndex((week) => week === selDay)
        }
        // const res = await syncDownObj('Visit', `SELECT Id, VisitorId, Status__c, Dynamic_Frequency_Add__c, Dynamic_Frequency_Remove__c FROM Visit WHERE Schedule_Visit_Group__c = '${visitListId}'`,false)
        SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            ScheduleQuery.retrieveRNSOptimizedCustomerData.f,
            formatString(ScheduleQuery.retrieveRNSOptimizedCustomerData.q, [visitListId])
        ).then(async (res) => {
            // add back in future
            // const plannedVisitList = res.filter((visitItem) => {
            //     return visitItem.Status__c === 'Planned' && visitItem.Dynamic_Frequency_Add__c === '1'
            // })
            const removedVisitList = res.filter((visitItem) => {
                return visitItem.Status__c === 'Removed' && visitItem.Dynamic_Frequency_Remove__c === '1'
            })
            // add `select` flag for checkbox
            // const addSelectFlagVL = plannedVisitList.map(vi => {
            //     vi.select = false
            //     return vi
            // })
            const visits = [...removedVisitList] // all visits
            const visitListArr = removedVisitList // active tab visits
            try {
                await calculateHVC(visitListArr)
            } catch (error) {
                storeClassLog(Log.MOBILE_ERROR, 'OptimizedVisitScreen.getVisitList', getStringValue(error))
            }
            setTotalList(visits) // for date picker totally grayed
            const tlGroupByDate = _.groupBy(visits, 'Planned_Date__c')
            const customerListGroupByDate = _.groupBy(visitListArr, 'Planned_Date__c')
            // weekArr e.g. ['THU', 'FRI', 'SAT']
            const allWeeks = getWeekLabel() // i18n
            const temp = []
            for (let idx = 0; idx < allWeeks.length; idx++) {
                const week = allWeeks[idx]
                const dateKey = Object.keys(tlGroupByDate)
                if (dateKey.find((date) => idx + '' === formatWithTimeZone(moment(date), 'd', true))) {
                    temp.push(week)
                }
            }
            weekArr = temp
            // handle selDay, e.g. 'FRI'
            selDay = weekArr[selIndex] || weekArr[0]
            // handle weekDays for MonthWeek Comp, e.g. { THU: false, ... }
            const weekDays = {}
            weekArr.forEach((weekStr) => {
                weekDays[weekStr] = false
            })
            setWeekDays(weekDays)
            // set MonthWeek Comp selected index
            refMonthWeek.current?.setSelectIndex(weekDays, selDay)
            // generate current active date list
            const activeDate = Object.keys(customerListGroupByDate).find((date) => {
                const idx = parseInt(formatWithTimeZone(moment(date), 'd', true))
                return allWeeks[idx] === selDay
            })
            setCustomerList(customerListGroupByDate[activeDate] || [])
            setActiveDayTotalVisits(customerListGroupByDate[activeDate]?.length || 0)
            const { duration, cost } = sumVisitMetric(customerListGroupByDate[activeDate])
            setActiveDayTotalDuration(duration)
            setActiveDayTotalCost(cost)
            setIsLoading(false)
        })
    }

    const checkIsEmptyList = () => {
        return _.isEmpty(totalList)
    }

    const getMyTeamEmployeesForReassign = () => {
        getEmployeeListForReassign({
            visitListId,
            userLocationId: CommonParam.userLocationId,
            dropDownRef,
            // according to AC, only get my team user
            isOnlyMyTeamEmployees: true
        })
    }

    const getOrCreateVisitListId = async (params) => {
        const { employeeId, plannedDate, userName } = params
        const startDate = moment(plannedDate).clone().day(CommonLabel.NUMBER_ZERO).format(TIME_FORMAT.Y_MM_DD)
        const endDate = moment(plannedDate).clone().day(CommonLabel.NUMBER_SIX).format(TIME_FORMAT.Y_MM_DD)
        const scheduleAdHoc = false
        const durationTime = CommonLabel.NUMBER_ZERO
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

            await SoupService.upsertDataIntoSoup('Visit_List__c', queryDaily)
            return queryDaily[0].Id
        } catch (err) {
            setIsLoading(false)
            storeClassLog(Log.MOBILE_ERROR, 'OptimizedVisitScreen.getOrCreateVisitListId', getStringValue(err))
        }
    }

    const changeVisitStatus = async (visitId, dvlId, status, employeeId, plannedDate, userName) => {
        setIsLoading(true)
        // if a 'REMOVED' visit was generated by DF and has no Visit_List__c
        // when add it back, get it's vl id
        let vlId = null
        try {
            if (status === VisitStatus.PLANNED && employeeId) {
                vlId = await getOrCreateVisitListId({
                    employeeId,
                    plannedDate,
                    userName
                })
            }
            await syncUpObjUpdateFromMem('Visit', [
                {
                    Id: visitId,
                    Status__c: status,
                    Visit_List__c: vlId,
                    Route_Group__c: null
                }
            ])
            // re calculate KPI (only dvlId is not null)
            const tmpVlId = vlId || dvlId
            if (tmpVlId) {
                await reSequenceByVisitListId(tmpVlId)
                await calculateDistanceAndTravelTime(tmpVlId)
                await updateVisitListToUnscheduled(tmpVlId, false)
            }
            await getVisitList()
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            storeClassLog(Log.MOBILE_ERROR, 'OptimizedVisitScreen.ChangeStatus', getStringValue(error))
        }
    }

    // will add back in future
    const onChangeDate = (date) => {
        selDay = date.weekLabel
        getVisitList()
    }

    const getSelectDataTotalTime = (list) => {
        let tmpDuration = 0
        for (const element of list) {
            tmpDuration += parseFloat(element.visitDuration)
        }
        return getTimeFromMins(tmpDuration)
    }

    // add function maybe add back in future
    // const handleEdit = () => {
    //     if (activeTab === 0) {
    //         const updateIsEditClicked = !isEditMode
    //         if (!updateIsEditClicked) {
    //             resetState()
    //         }
    //         setIsEditMode(updateIsEditClicked)
    //     }
    // }

    const cusItemClick = (key) => {
        const updateCustomerList = customerList.map((item) => {
            if (item.Id === key) {
                item.select = !item.select
            }
            return item
        })
        const updateSelectData = updateCustomerList.filter((cl) => cl.select)
        // will add back in future
        // if (updateSelectData.length === customerList.length) {
        //     setIsAllChecked(true)
        // } else {
        //     setIsAllChecked(false)
        // }
        setSelectedTime(getSelectDataTotalTime(updateSelectData))
        setSelectData(updateSelectData)
        setCustomerList(updateCustomerList)
    }

    // will add back in future
    // const selectAll = () => {
    //     const updateIsAllChecked = !isAllChecked
    //     let updateCustomerList
    //     if (updateIsAllChecked) {
    //         updateCustomerList = customerList.map(item => {
    //             if (!item.select) {
    //                 item.select = true
    //             }
    //             return item
    //         })
    //         setSelectData(updateCustomerList)
    //         setSelectedTime(getSelectDataTotalTime(updateCustomerList))
    //     } else {
    //         updateCustomerList = customerList.map(item => {
    //             item.select = false
    //             return item
    //         })
    //         setSelectData([])
    //     }
    //     setIsAllChecked(updateIsAllChecked)
    //     setCustomerList(updateCustomerList)
    // }

    const onReassignClick = () => {
        const computedData = selectData.map((visit) => {
            // gen data for <ReassignModal>
            const tmpTotalMinus = getTotalMinus(visit?.Planned_Duration_Minutes__c, visit?.Planned_Travel_Time__c)
            const tmpTotalHours = getTotalHours(visit?.Planned_Duration_Minutes__c, visit?.Planned_Travel_Time__c)
            const visitObj = computeVisitObj(visit, tmpTotalMinus, tmpTotalHours)
            return visitObj
        })
        const selectVisitsForReassign = {
            visits: { [selDay]: computedData }
        }
        reassignModal.current?.openModal(selectVisitsForReassign, { canshow: false })
    }

    const showReassignResult = async (event: any) => {
        setTotalAssign(String(event.count))
        getMyTeamEmployeesForReassign()
        await getVisitList()
        setModalVisible(true)
        setIsLoading(false)
    }

    useEffect(() => {
        selDay = ''
    }, [])

    useEffect(() => {
        getMyTeamEmployeesForReassign()
        getVisitList()
    }, [])

    const onOptimizedVisitClick = async (visitItem) => {
        try {
            closeAllOpenRow(swipeableRows)
            await changeVisitStatus(
                visitItem.Id,
                visitItem.DVisitListId,
                VisitStatus.PLANNED,
                visitItem.VisitorId,
                visitItem.Planned_Date__c,
                visitItem.Username
            )
            // need `ProcessDoneModal` comp here ?
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'OptimizedVisitScreen.renderRightActions', getStringValue(error))
        }
    }

    const optimizedSwipeButtonProps = [
        {
            label: `${t.labels.PBNA_MOBILE_ADD} ${t.labels.PBNA_MOBILE_BACK.toUpperCase()}`,
            color: '#2DD36F',
            onBtnClick: onOptimizedVisitClick,
            width: 100
        }
    ]

    const renderCItem = ({ item, index }) => (
        <SwipeableRow
            uniqKey={item?.Id}
            swipeableRows={swipeableRows}
            closeOtherRows={closeOtherRows}
            params={item}
            swipeButtonConfig={optimizedSwipeButtonProps}
            showBorderRadius={false}
            textAlignCenter
        >
            <SelectCustomerCell
                item={item}
                index={index}
                itemKey={item?.Id}
                // onCellPress={() => {
                //     goToVisitDetails(navigation, item)
                // }}
                hasAvatar
                fromOptimized
                isEditMode={isEditMode}
                onCheckBoxClick={cusItemClick}
            />
        </SwipeableRow>
    )

    return (
        <View style={styles.safeArea}>
            <View style={commonStyle.paddingHorizontal_22}>
                <View style={styles.header}>
                    <NavigationBar
                        title={t.labels.PBNA_MOBILE_REVIEW_NEW_SCHEDULE.toUpperCase()}
                        left={
                            <TouchableOpacity
                                style={styles.backButton}
                                hitSlop={commonStyle.hitSlop}
                                onPress={() => {
                                    navigation.goBack()
                                }}
                                activeOpacity={1}
                            >
                                <Image source={ImageSrc.IMG_BACK} style={styles.imgBack} />
                            </TouchableOpacity>
                        }
                    />
                </View>
                <View style={commonStyle.alignCenter}>
                    <CText style={styles.titleText}>{t.labels.PBNA_MOBILE_OPTIMIZED_VISITS}</CText>
                </View>
                <MonthWeek
                    cRef={refMonthWeek}
                    weekDays={weekDays}
                    onclick={onChangeDate}
                    isEmptyFromRNS={checkIsEmptyList()}
                />
                <View style={commonStyle.marginTop_20}>
                    {/* <SelectTab
                        style={commonStyle.marginHorizontal_0}
                        listData={[
                            { name: `${t.labels.PBNA_MOBILE_VISITS.toUpperCase()} ${t.labels.PBNA_MOBILE_ADDED}` },
                            { name: `${t.labels.PBNA_MOBILE_VISITS.toUpperCase()} ${t.labels.PBNA_MOBILE_REMOVED}` }
                        ]}
                        changeTab={(v) => {
                            setActiveTab(v)
                        }}
                        activeTab={activeTab}
                        fromOptimized
                    /> */}
                    <View style={commonStyle.alignCenter}>
                        <CText style={styles.removeText}>
                            {t.labels.PBNA_MOBILE_VISITS} {_.capitalize(t.labels.PBNA_MOBILE_REMOVED)}
                        </CText>
                    </View>
                    {
                        // just copy from <SelectSchedule />
                        selectData.length > 0 && (
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
                                    <View style={styles.flexRowCenter}>
                                        <Image source={IMG_MODAL_DELETE} style={styles.inactiveBtnIcon} />
                                        <CText style={styles.inactiveBtnText}>
                                            {t.labels.PBNA_MOBILE_DELETE.toUpperCase()}
                                        </CText>
                                    </View>
                                    <View style={styles.flexRowCenter}>
                                        <Image source={IMG_MODAL_CLEAR} style={styles.inactiveBtnIcon} />
                                        <CText style={styles.inactiveBtnText}>{t.labels.PBNA_MOBILE_UNASSIGN}</CText>
                                    </View>
                                    <TouchableOpacity style={styles.flexRowCenter} onPress={onReassignClick}>
                                        <Image source={IMG_MODAL_REASSIGN} style={styles.btnIcon} />
                                        <CText style={styles.btnText}>
                                            {t.labels.PBNA_MOBILE_REASSIGN.toUpperCase()}
                                        </CText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    }
                    <View style={styles.hvcStyle}>
                        <View>
                            <CText style={styles.hourStyle}>{t.labels.PBNA_MOBILE_HOURS}</CText>
                            <CText style={styles.hourContentStyle}>
                                {activeDayTotalDuration} {t.labels.PBNA_MOBILE_HRS}
                            </CText>
                        </View>
                        <View>
                            <CText style={styles.hourStyle}>{t.labels.PBNA_MOBILE_VISITS}</CText>
                            <CText style={[styles.hourContentStyle, { textAlign: 'center' }]}>
                                {activeDayTotalVisits}
                            </CText>
                        </View>
                        <View>
                            <CText style={styles.hourStyle}>{_.capitalize(t.labels.PBNA_MOBILE_COST)}</CText>
                            <CText style={styles.hourContentStyle}>
                                {t.labels.PBNA_MOBILE_ORDER_D}
                                {getAmount(activeDayTotalCost)}
                            </CText>
                        </View>
                    </View>
                    {/* <View style={styles.editStyle}>
                        { isEditMode &&
                            <CCheckBox
                                title={
                                    <CText style={styles.editSelectAllText}>
                                        {t.labels.PBNA_MOBILE_SELECT_ALL}
                                    </CText>
                                }
                                containerStyle={styles.editSelectAllContainer}
                                checked={isAllChecked}
                                onPress={() => selectAll()}
                            />
                        }
                        {activeTab === 0 &&
                        <CText
                            style={styles.editText}
                            onPress={handleEdit}
                        >
                            {isEditMode ? t.labels.PBNA_MOBILE_DONE : t.labels.PBNA_MOBILE_EDIT}
                        </CText>
                        }
                    </View> */}
                </View>
            </View>
            <View style={[commonStyle.flex_1, styles.marginTop40]}>
                <FlatList
                    ref={cFlatListRef}
                    data={customerList}
                    extraData={customerList}
                    renderItem={renderCItem}
                    keyExtractor={(item) => item.Id}
                    contentContainerStyle={commonStyle.paddingBottom_22}
                />
            </View>
            <Loading isLoading={isLoading} />

            <ReassignModal
                cRef={reassignModal}
                navigation={navigation}
                isEmployee
                userData={{}}
                data={manager.employeeListForReassign}
                selectDataLength={selectData.length}
                selectedTime={selectedTime}
                // selectedCase={selectedCase}
                reassignCallBack={(count) => showReassignResult(count)}
                setIsLoading={setIsLoading}
                setErrorMsgType={setErrorMsgType}
                setIsErrorShow={setIsErrorShow}
                visitListId={visitListId}
                isOptimized
                selectDayInOptimized={selDay}
            />
            <ReassignResultModal
                cRef={reassignResultModal}
                navigation={navigation}
                reassignType={VisitOperationType.REASSIGN}
                totalAssign={totalAssign}
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
            />
            <ErrorMsgModal
                index={errorMsgType}
                visible={isErrorShow}
                setModalVisible={setIsErrorShow}
                handleClick={getVisitList}
            />
        </View>
    )
}

export default OptimizedVisitScreen

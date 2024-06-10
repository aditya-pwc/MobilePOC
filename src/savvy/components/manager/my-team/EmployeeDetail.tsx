/**
 * @description Employee detail component.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-04-28
 */

import React, { useEffect, useRef, useState } from 'react'
import {
    View,
    Image,
    TouchableOpacity,
    ImageBackground,
    NativeAppEventEmitter,
    Alert,
    ScrollView,
    Dimensions
} from 'react-native'
import CText from '../../../../common/components/CText'
import { SoupService } from '../../../service/SoupService'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import {
    formatPhoneNumber,
    onRemoveBtnClick,
    DEFAULT_DELAY_TIME,
    ReassignModalType,
    deleteSelectToSoup,
    refreshCTRData,
    refreshView,
    handleOriginData,
    getCustomerData,
    getUserData,
    getFTPT,
    updateTakeOrderFlag,
    getRecordTypeIdByDeveloperName,
    syncDownDataByTableNames
} from '../../../utils/MerchManagerUtils'
import { getWeekLabel } from '../../../utils/MerchManagerComputeUtils'
import { filterExistFields, getObjByName } from '../../../utils/SyncUtils'
import { syncUpObjCreateFromMem, syncUpObjUpdate, syncUpObjUpdateFromMem } from '../../../api/SyncUtils'
import { useSelector } from 'react-redux'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import EmployeeDetailStyle from '../../../styles/manager/EmployeeDetailStyle'
import Loading from '../../../../common/components/Loading'
import UserAvatar from '../../common/UserAvatar'
import { useNetInfo } from '@react-native-community/netinfo'
import ReassignResultModal from '../common/ReassignResultModal'
import { checkVisitsTabAllError, getWorkingStatusObj, handleWeekKeySelect } from '../helper/MerchManagerHelper'
import { UserType } from '../../../redux/types/H01_Manager/data-userType'
import MonthWeek, { MonthWeekType } from '../../common/MonthWeek'
import SelectScheduleStyle from '../../../styles/manager/SelectScheduleStyle'
import _, { isObject } from 'lodash'
import ReassignModal from '../common/ReassignModal'
import CCheckBox from '../../../../common/components/CCheckBox'
import SortableList from 'react-native-sortable-list'
import EmptyVisit from '../../../../../assets/image/empty_visit.svg'
import RedExclamation from '../../../../../assets/image/red-exclamation.svg'
import { database } from '../../../common/SmartSql'
import { EmployeeDetailCustomerCell } from '../common/CustomerCell'
import RowMsgPhoneView from '../common/RowMsgPhoneView'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import MessageBar from '../common/MessageBar'
import UploadAvatar from '../../common/UploadAvatar'
import ErrorMsgModal from '../common/ErrorMsgModal'
import { checkDataForCTRAndSD, checkDataForReassignSD, dataCheckWithAction } from '../service/DataCheckService'
import { BooleanStr, DataCheckMsgIndex, DropDownType, EventEmitterType, NavigationRoute } from '../../../enums/Manager'
import { VisitType, VisitOperationType } from '../../../enums/Visit'
import { t } from '../../../../common/i18n/t'
import { setLoggedInUserTimezone } from '../../../utils/TimeZoneUtils'
import {
    composeServiceDetailQuery,
    handleDeleteSelectData,
    isAllWeekSelectSD,
    renderDropdownBtnList,
    unassignSDData
} from '../helper/ServiceDetailHelper'
import { MerchManagerScreenMapping } from '../../../config/ScreenMapping'
import MyTeamStyle from '../../../styles/manager/MyTeamStyle'
import BlueClear from '../../../../../assets/image/ios-close-circle-outline-blue.svg'
import CSwitch from '../../../../common/components/c-switch/CSwitch'
import { getStringValue } from '../../../utils/LandingUtils'
import { Log } from '../../../../common/enums/Log'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import LocationDefault from './LocationDefault'
import RegularWorkingDays from './RegularWorkingDays'

const styles = EmployeeDetailStyle
const selectStyles = SelectScheduleStyle
const IMG_BACK = ImageSrc.IMG_BACK
const GREEN_BG = ImageSrc.GREEN_BG
const RED_BG = ImageSrc.RED_BG
const PINK_BG = ImageSrc.PINK_BG
const IMG_ADDRESS = ImageSrc.IMG_ADDRESS
const IMG_GREEN_CHECK = ImageSrc.ICON_CHECKMARK_CIRCLE
const IMG_MODAL_CLEAR = ImageSrc.IMG_MODAL_CLEAR
const IMG_MODAL_DELETE = ImageSrc.IMG_MODAL_DELETE
const IMG_MODAL_REASSIGN = ImageSrc.IMG_MODAL_REASSIGN
const iconAdd = ImageSrc.ADD_BLUE_CIRCLE
const OPACITY = 1
const CURRENT_OPACITY = 0.2

const screenWidth = Dimensions.get('window').width
const screenWidthStyle = { width: screenWidth }
const SIZE_12 = 12
const SIZE_20 = 20
const MAX_VISIT_A_DAY = 10
interface EmployeeDetailProps {
    navigation?: any
    route?: any
}

const managerReducer = (state) => state.manager

const getBgImage = (userType) => {
    if (userType === UserType.UserType_Merch) {
        return GREEN_BG
    } else if (userType === UserType.UserType_Sales) {
        return RED_BG
    }
    return PINK_BG
}
const handleDeleteSelectWeekDay = (params) => {
    const { data, setSelectData, setWeekDays, setSortList, selectDayKey } = params
    if (_.isEmpty(data)) {
        return
    }
    const tempWeekDays = {}
    for (const weekKey in data) {
        if (Object.keys(data[weekKey]).length > 0) {
            tempWeekDays[weekKey] = false
        }
    }
    setSelectData([])
    setWeekDays(tempWeekDays)
    setSortList(data[selectDayKey])
}
const sortListView = (params) => {
    const { sortList, selectDayKey, sortListRef, sortItemClick, renderRow } = params
    let view = (
        <View style={styles.emptyView}>
            <View style={styles.emptyCard}>
                <EmptyVisit style={styles.emptyVisit} />
                <CText style={styles.noVisitsText}>{t.labels.PBNA_MOBILE_NO_VISITS_BEEN_SCHEDULED}</CText>
            </View>
        </View>
    )
    if (!_.isEmpty(sortList)) {
        view = (
            <SortableList
                key={selectDayKey}
                style={[selectStyles.sortList, selectStyles.sortListContainer]}
                ref={sortListRef}
                data={sortList}
                decelerationRate={null}
                sortingEnabled={false}
                onPressRow={sortItemClick}
                renderRow={renderRow}
                showsVerticalScrollIndicator={false}
                order={Object.keys(sortList).sort((a, b) => {
                    return parseInt(a) - parseInt(b)
                })}
            />
        )
    }
    return view
}
const getVisitType = (sortList) => {
    if (isObject(sortList)) {
        if (Object.keys(sortList).length <= 1) {
            return t.labels.PBNA_MOBILE_VISIT
        }
        return t.labels.PBNA_MOBILE_VISITS
    }
    return t.labels.PBNA_MOBILE_VISIT
}
const checkVisitsTabError = (originalWorkingOrder, allSDData, selectDayKey) => {
    if (!_.isEmpty(allSDData[selectDayKey])) {
        return Object.keys(allSDData[selectDayKey]).length > MAX_VISIT_A_DAY || !originalWorkingOrder[selectDayKey]
    }
    return false
}
// sort days to 'Sun', 'Mon', ..., 'Sat'
const sortDays = (days, weekLabel) => {
    return days.sort((a, b) => weekLabel.indexOf(_.upperCase(a)) > weekLabel.indexOf(_.upperCase(b)))
}
const getVisitsTabErrorMsg = (originalWorkingOrder, allSDData, weekLabel) => {
    const errorMsgs = []
    const moreThanTenVisitsWorkingDay = []
    const noWorkingDay = []
    Object.keys(allSDData).forEach((dayKey) => {
        if (!_.isEmpty(allSDData[dayKey]) && Object.keys(allSDData[dayKey]).length > MAX_VISIT_A_DAY) {
            moreThanTenVisitsWorkingDay.push(_.capitalize(dayKey))
        }
        if (!_.isEmpty(allSDData[dayKey]) && !originalWorkingOrder[dayKey]) {
            noWorkingDay.push(_.capitalize(dayKey))
        }
    })
    // if more than ten visits
    if (!_.isEmpty(moreThanTenVisitsWorkingDay)) {
        errorMsgs.push({
            id: t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_MORE_THAN_TEN_VISITS,
            jsx: (
                <CText>
                    <CText style={styles.saveText}>{sortDays(moreThanTenVisitsWorkingDay, weekLabel).join(', ')}</CText>
                    <CText>{t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_MORE_THAN_TEN_VISITS}</CText>
                </CText>
            )
        })
    }
    // if no working day, more than one visit
    if (!_.isEmpty(noWorkingDay)) {
        errorMsgs.push({
            id: t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_VISITS_ON_NON_WORKING_DAY,
            jsx: (
                <CText>
                    <CText style={styles.saveText}>{sortDays(noWorkingDay, weekLabel).join(', ')}</CText>
                    <CText>{t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_VISITS_ON_NON_WORKING_DAY}</CText>
                </CText>
            )
        })
    }
    return errorMsgs
}
const visitView = (params) => {
    const {
        isEdit,
        sortList,
        selectData,
        onUnassignClick,
        deleteDataAlert,
        onReassignClick,
        refMonthWeek,
        weekDays,
        weekDayClick,
        selectAllDay,
        isAllDaySelect,
        selectAllWeekDay,
        isAllWeekSelect,
        editMethod,
        selectDayKey,
        sortListRef,
        sortItemClick,
        renderRow,
        originalWorkingOrder,
        data,
        unassignedRoute,
        weekLabel,
        getVisitsTabErrorMsgCB
    } = params
    let isEditTemp = isEdit
    isEditTemp = !((isObject(sortList) && Object.keys(sortList).length <= 0) || !isObject(sortList))
    return (
        <ScrollView style={[screenWidthStyle, styles.marginBottom_20]}>
            {checkVisitsTabAllError(originalWorkingOrder, data) && (
                <View style={styles.content}>
                    {!unassignedRoute &&
                        getVisitsTabErrorMsgCB(originalWorkingOrder, data, weekLabel).map((errorMsg) => {
                            const { id, jsx } = errorMsg
                            return <MessageBar key={id} message={jsx} />
                        })}
                </View>
            )}
            {selectData.length > 0 && (
                <View style={[selectStyles.selectedBox, commonStyle.marginTop_20, { marginHorizontal: 20 }]}>
                    <View style={selectStyles.boxTitle}>
                        <CText style={selectStyles.selectedVisit}>
                            {selectData.length}
                            {` ${t.labels.PBNA_MOBILE_RECURRING_VISIT_SELECTED}`}
                        </CText>
                    </View>
                    <View style={selectStyles.btnGroup}>
                        <TouchableOpacity
                            style={selectStyles.flexRowCenter}
                            activeOpacity={unassignedRoute ? 1 : CURRENT_OPACITY}
                            onPress={() => !unassignedRoute && onUnassignClick()}
                        >
                            <Image
                                source={IMG_MODAL_CLEAR}
                                style={unassignedRoute ? selectStyles.inactiveBtnIcon : selectStyles.btnIcon}
                            />
                            <CText style={unassignedRoute ? selectStyles.inactiveBtnText : selectStyles.btnText}>
                                {t.labels.PBNA_MOBILE_UNASSIGN}
                            </CText>
                        </TouchableOpacity>
                        <TouchableOpacity style={selectStyles.flexRowCenter} onPress={() => deleteDataAlert()}>
                            <Image source={IMG_MODAL_DELETE} style={selectStyles.btnIcon} />
                            <CText style={selectStyles.btnText}>{t.labels.PBNA_MOBILE_DELETE.toUpperCase()}</CText>
                        </TouchableOpacity>
                        <TouchableOpacity style={selectStyles.flexRowCenter} onPress={onReassignClick}>
                            <Image source={IMG_MODAL_REASSIGN} style={selectStyles.btnIcon} />
                            <CText style={selectStyles.btnText}>{t.labels.PBNA_MOBILE_REASSIGN.toUpperCase()}</CText>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            <View
                style={[
                    (selectData.length > 0 || !checkVisitsTabAllError(originalWorkingOrder, data)) &&
                        selectStyles.weekContainer,
                    { marginHorizontal: 20 }
                ]}
            >
                <MonthWeek
                    cRef={refMonthWeek}
                    weekDays={weekDays}
                    onclick={weekDayClick}
                    type={MonthWeekType.MonthWeekType_WithoutDay}
                />
            </View>
            <View style={[selectStyles.checkBoxContainer, { marginHorizontal: 20 }]}>
                <CText style={[selectStyles.checkBoxTitle, styles.lineHeight_25]}>
                    {!_.isEmpty(sortList) ? Object.keys(sortList).length : 0} {getVisitType(sortList) + ' '}
                    {!unassignedRoute && checkVisitsTabError(originalWorkingOrder, data, selectDayKey) && (
                        <RedExclamation width={SIZE_20} height={SIZE_20} />
                    )}
                </CText>
                <View style={styles.flexRowAlignCenter}>
                    {isEditTemp && isEdit && (
                        <View style={[selectStyles.checkBoxItemContainer]}>
                            <CCheckBox
                                onPress={() => selectAllDay()}
                                title={
                                    <CText style={selectStyles.checkBoxItemText}>
                                        {t.labels.PBNA_MOBILE_FULL_DAY.toLocaleUpperCase()}
                                    </CText>
                                }
                                checked={isAllDaySelect()}
                                containerStyle={selectStyles.checkBoxItem}
                            />
                            <CCheckBox
                                onPress={() => selectAllWeekDay()}
                                title={
                                    <CText style={selectStyles.checkBoxItemText}>
                                        {t.labels.PBNA_MOBILE_FULL_WEEK.toLocaleUpperCase()}
                                    </CText>
                                }
                                checked={isAllWeekSelect()}
                                containerStyle={selectStyles.checkBoxItem}
                            />
                        </View>
                    )}
                    <TouchableOpacity
                        onPress={() => {
                            isEditTemp && editMethod()
                        }}
                        style={[{ marginLeft: 20 }]}
                        hitSlop={commonStyle.smallHitSlop}
                    >
                        <CText style={[isEditTemp ? selectStyles.editActiveTitle : selectStyles.editDisableTitle]}>
                            {isEditTemp && isEdit ? t.labels.PBNA_MOBILE_DONE : t.labels.PBNA_MOBILE_EDIT}
                        </CText>
                    </TouchableOpacity>
                </View>
            </View>
            {sortListView({ sortList, selectDayKey, sortListRef, sortItemClick, renderRow })}
        </ScrollView>
    )
}
const getMarginStyle = (params) => {
    if (_.isEmpty(params)) {
        return styles.marginBottom_20
    }
}
const getOverviewTabErrorMsg = (userData) => {
    const errorMsgs = []
    if (userData.noWorkingDay) {
        errorMsgs.push(t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_NO_WORKING_DAY)
    }
    if (userData.terminateUser) {
        errorMsgs.push(t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_TERMINATED_USER)
    }
    if (_.isEmpty(userData.startTime)) {
        errorMsgs.push(t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_NO_STARTING_TIME)
    }
    return errorMsgs
}

const renderOverView = (params) => {
    const {
        isSales,
        userData,
        onRemoveEmployeeClick,
        getOverviewTabErrorMsgCB,
        isNightShift,
        toggleSwitch,
        originalWorkingOrder,
        setOriginalWorkingOrder,
        setIsErrorShow
    } = params

    return (
        <ScrollView style={[styles.content, screenWidthStyle]}>
            {getOverviewTabErrorMsgCB(userData).map((errorMsg) => {
                return (
                    <TouchableOpacity
                        key={userData?.id}
                        activeOpacity={
                            errorMsg === t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_TERMINATED_USER && userData.terminateUser
                                ? CURRENT_OPACITY
                                : OPACITY
                        }
                        onPress={() => {
                            errorMsg === t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_TERMINATED_USER &&
                                userData.terminateUser &&
                                onRemoveEmployeeClick()
                        }}
                    >
                        <MessageBar message={errorMsg} />
                    </TouchableOpacity>
                )
            })}
            <CText style={styles.contentTitle}>{t.labels.PBNA_MOBILE_EMPLOYEE_DETAILS}</CText>
            <View style={[styles.flexRow, styles.flexSelectRow, getMarginStyle(isSales)]}>
                <View style={styles.flexDirectionRow}>
                    <CText style={styles.fieldLabel}>{t.labels.PBNA_MOBILE_WORK_PHONE}</CText>
                </View>
                <View style={styles.flexRowAlignCenter}>
                    {userData.phone ? (
                        <CText style={styles.fieldText}>{formatPhoneNumber(userData.phone)}</CText>
                    ) : (
                        <CText style={styles.fieldText}>-</CText>
                    )}
                    {userData.phone && <Image source={IMG_GREEN_CHECK} style={styles.imgCheck} />}
                </View>
            </View>
            <CSwitch
                label={t.labels.PBNA_MOBILE_OVERNIGHT_EMPLOYEE}
                labelStyle={styles.selectLabel}
                showBottomLine
                checked={isNightShift}
                toggleSwitch={() => toggleSwitch()}
            />
            {isSales && (
                <View style={[styles.flexRow, isSales && styles.marginBottom_20, commonStyle.marginRight_22]}>
                    <View style={styles.routeView}>
                        <CText style={styles.fieldLabel}>{t.labels.PBNA_MOBILE_SALES_ROUTE}</CText>
                        <CText numberOfLines={1} ellipsizeMode="tail" style={[styles.fieldText, styles.marginTop_4]}>
                            {userData.salesRoute}
                        </CText>
                    </View>
                    <View style={styles.routeView}>
                        <CText style={styles.fieldLabel}>{t.labels.PBNA_MOBILE_NRID}</CText>
                        <CText numberOfLines={1} ellipsizeMode="tail" style={[styles.fieldText, styles.marginTop_4]}>
                            {userData.nrid}
                        </CText>
                    </View>
                </View>
            )}

            <View>
                <LocationDefault userData={userData} setIsErrorShow={setIsErrorShow} isSales={false} />
                <RegularWorkingDays
                    userData={userData}
                    setIsErrorShow={setIsErrorShow}
                    originalWorkingOrder={originalWorkingOrder}
                    setOriginalWorkingOrder={setOriginalWorkingOrder}
                />
            </View>

            <TouchableOpacity onPress={() => onRemoveEmployeeClick()} style={styles.deleteBtn}>
                <CText style={styles.deleteBtnText}>{t.labels.PBNA_MOBILE_REMOVE_EMPLOYEE}</CText>
            </TouchableOpacity>
        </ScrollView>
    )
}
const getSelectDayCount = (params) => {
    const { data, setIsEdit, setSelectData, setSelectedUserKey } = params
    let hasData = false
    const tempSelectData = []
    const tempSelectUserMap = {}
    for (const weekKey in data) {
        const tempSortList = data[weekKey]
        for (const key in tempSortList) {
            if (!tempSortList[key].isDelete && !tempSortList[key].isReassign) {
                hasData = true
            }
            if (tempSortList[key].select) {
                tempSelectData.push(tempSortList[key])
                tempSelectUserMap[tempSortList[key].ownerId] = true
            }
        }
    }
    if (!hasData) {
        setIsEdit(false)
    }
    setSelectData(tempSelectData)
    setSelectedUserKey(Object.keys(tempSelectUserMap))
}
const deleteDataTemp = (params) => {
    const {
        setUploadLoading,
        selectData,
        setDeleteSelectData,
        deleteSelectData,
        data,
        setData,
        setSelectData,
        setWeekDays,
        setSortList,
        selectDayKey,
        setTotalDelete,
        setDeleteModalVisible,
        setIsEdit,
        setSelectedUserKey,
        sortListRef,
        dropDownRef,
        setReassignUserData,
        userData,
        refMonthWeek,
        setSelectDayKey,
        lineCodeMap
    } = params
    setUploadLoading(true)
    handleDeleteSelectData(selectData, setDeleteSelectData, deleteSelectData)
    const newData = handleOriginData({ data, customerDetail: false })
    setData(newData)
    handleDeleteSelectWeekDay({ data: newData, setSelectData, setWeekDays, setSortList, selectDayKey })
    deleteSelectToSoup({
        callback: async (count) => {
            await syncDownDataByTableNames(MerchManagerScreenMapping.ServiceDetailRelated)
            if (count) {
                setUploadLoading(false)
                setTotalDelete(count)
                setDeleteModalVisible(true)
                setDeleteSelectData({})
                getSelectDayCount({ data, setIsEdit, setSelectData, setSelectedUserKey })
                const temp = {}
                Object.keys(newData).forEach((item) => {
                    temp[item] = false
                })
                setWeekDays(temp)
                setSortList(newData[selectDayKey])
                sortListRef?.current?._scrollView?.scrollTo({ x: 0, y: 0, animated: true })
            }
            if (userData.unassignedRoute) {
                userData.totalVisit = userData.totalVisit - count
            }
        },
        dropDownRef,
        deleteSelectData,
        data,
        setReassignUserData,
        userData,
        selectDayKey,
        setData,
        setWeekDays,
        refMonthWeek,
        setSelectDayKey,
        setSortList,
        lineCodeMap
    })
}
const isAllDaySelectTemp = (params) => {
    const { data, selectDayKey } = params
    if (_.isEmpty(data)) {
        return
    }
    if (data[selectDayKey]) {
        if (Object.keys(data[selectDayKey]).length === 0) {
            return false
        }
        for (const key in data[selectDayKey]) {
            if (!data[selectDayKey][key].select) {
                return false
            }
        }
        return true
    }
    return false
}
const selectAllDayTemp = (params) => {
    const {
        sortList,
        isAllDaySelect,
        weekDays,
        selectDayKey,
        setWeekDays,
        setSortList,
        data,
        setIsEdit,
        setSelectData,
        setSelectedUserKey
    } = params
    const obj = {}
    if (Object.keys(sortList).length === 0) {
        return
    }
    if (isAllDaySelect()) {
        for (const key in sortList) {
            obj[key] = sortList[key]
            obj[key].select = false
        }
        weekDays[selectDayKey] = false
        setWeekDays(weekDays)
        setSortList(obj)
    } else {
        for (const key in sortList) {
            obj[key] = sortList[key]
            obj[key].select = true
        }
        weekDays[selectDayKey] = true
        setWeekDays(weekDays)
        setSortList(obj)
    }
    getSelectDayCount({ data, setIsEdit, setSelectData, setSelectedUserKey })
}

const selectAllWeekDayTemp = (params) => {
    const {
        data,
        selectAll,
        weekDays,
        setWeekDays,
        setSortList,
        selectDayKey,
        setIsEdit,
        setSelectData,
        setSelectedUserKey,
        isAllWeekSelect
    } = params
    if (_.isEmpty(data)) {
        return
    }
    if (selectAll) {
        handleWeekKeySelect({ data, weekDays, setWeekDays, setSortList, selectDayKey, select: false })
        getSelectDayCount({ data, setIsEdit, setSelectData, setSelectedUserKey })
        return
    }
    if (isAllWeekSelect()) {
        handleWeekKeySelect({ data, weekDays, setWeekDays, setSortList, selectDayKey, select: false })
    } else {
        handleWeekKeySelect({ data, weekDays, setWeekDays, setSortList, selectDayKey, select: true })
    }
    getSelectDayCount({ data, setIsEdit, setSelectData, setSelectedUserKey })
}
const isDaySelect = (sortList) => {
    for (const key in sortList) {
        if (sortList[key].select) {
            return true
        }
    }
    return false
}
const editMethodTemp = (params) => {
    const { data, isEdit, selectAllWeekDay, setIsEdit } = params
    let hasData = false
    for (const weekKey in data) {
        const sortList = data[weekKey]
        for (const key in sortList) {
            if (Object.keys(sortList[key]).length > 0) {
                hasData = true
            }
        }
    }
    if (hasData) {
        if (isEdit) {
            selectAllWeekDay(true)
        }
        setIsEdit(!isEdit)
    } else {
        setIsEdit(false)
    }
}
const getReassignData = (params) => {
    const { res, selectUser } = params
    let whereClauseString = ''
    const newVisitArray = []
    const weekDayStringArr = []
    const accountIds = []
    res.forEach((newVisit, index) => {
        const customerRouteId = selectUser.customerIdMap[newVisit['Customer_to_Route__r.Customer__c']]
        if (customerRouteId) {
            newVisit.Customer_to_Route__c = customerRouteId
            newVisit.OwnerId = selectUser.id
            newVisit.Unassigned__c = false
            newVisit.Route_Group__c = null
            weekDayStringArr.push(newVisit.Day_of_the_Week__c)
            accountIds.push(newVisit['Customer_to_Route__r.Customer__c'])
            if (index === 0) {
                whereClauseString += " WHERE {Service_Detail__c:Id} = '" + newVisit.Id + "'"
            } else {
                whereClauseString += " OR {Service_Detail__c:Id} = '" + newVisit.Id + "'"
            }
            newVisitArray.push(newVisit)
        }
    })
    return { whereClauseStringTemp: whereClauseString, newVisitArrayTemp: newVisitArray, weekDayStringArr, accountIds }
}
const reassignData = async (params) => {
    const {
        selectUser,
        selectData,
        userData,
        refreshCustomerData,
        dropDownRef,
        setReassignUserData,
        selectDayKey,
        setData,
        setWeekDays,
        refMonthWeek,
        setSelectDayKey,
        setSortList,
        showReassignResult,
        setUploadLoading,
        lineCodeMap
    } = params
    const visitIdArray = []
    let CTRRecordTypeId = ''
    const customerToRouteMap = {}
    let whereClauseString = ''
    let newVisitArray = []
    for (const visit of selectData) {
        CTRRecordTypeId = visit.CTRRecordTypeId
        visitIdArray.push(visit.id)
        customerToRouteMap[visit.customer_to_route__c] = [
            visit.customer_to_route_soupEntryId,
            visit.customer_to_route_Id
        ]
    }
    const fields = {
        IsRemoved__c: BooleanStr.STR_FALSE,
        OwnerId: userData.id,
        'Customer_to_Route__r.Merch_Flag__c': BooleanStr.STR_TRUE,
        'Customer_to_Route__r.RecordTypeId': CTRRecordTypeId,
        Id: JSON.stringify({ value: visitIdArray })
    }
    if (userData.unassignedRoute) {
        delete fields.OwnerId
    }
    const whereClauseArr = composeServiceDetailQuery(fields)
    database()
        .use('Service_Detail__c')
        .select()
        .where(whereClauseArr)
        .getData()
        .then((res: any) => {
            if (res?.length > 0) {
                const { whereClauseStringTemp, newVisitArrayTemp, weekDayStringArr, accountIds } = getReassignData({
                    res,
                    selectUser
                })
                whereClauseString = whereClauseStringTemp
                newVisitArray = newVisitArrayTemp
                SoupService.upsertDataIntoSoup('Service_Detail__c', newVisitArray, true, false)
                    .then(() => {
                        syncUpObjUpdate(
                            'Service_Detail__c',
                            getObjByName('Service_Detail__c').syncUpCreateFields,
                            getObjByName('Service_Detail__c').syncUpCreateQuery + whereClauseString
                        )
                            .then(async () => {
                                const updatedResult = []
                                for (const weekDayString of weekDayStringArr) {
                                    const updatedVal = await updateTakeOrderFlag({
                                        weekDayString,
                                        CTRRecordTypeId,
                                        accountId: accountIds[weekDayStringArr.indexOf(weekDayString)],
                                        dropDownRef,
                                        orderDays: null,
                                        lineCodeMap
                                    })
                                    updatedResult.push(updatedVal)
                                    if (updatedResult.length === weekDayStringArr.length) {
                                        await syncDownDataByTableNames(MerchManagerScreenMapping.ServiceDetailRelated)
                                        await refreshCustomerData()
                                        await refreshCTRData({
                                            customerToRouteMap,
                                            dropDownRef,
                                            setReassignUserData,
                                            userData,
                                            selectDayKey,
                                            setData,
                                            setWeekDays,
                                            refMonthWeek,
                                            setSelectDayKey,
                                            setSortList,
                                            customerDetail: false
                                        })
                                        const newUsers = await getUserData(dropDownRef)
                                        const timeoutId = setTimeout(() => {
                                            clearTimeout(timeoutId)
                                            showReassignResult({ count: newVisitArray.length })
                                            if (userData.unassignedRoute) {
                                                userData.totalVisit = userData.totalVisit - newVisitArray.length
                                            }
                                            setUploadLoading(false)
                                            setReassignUserData(newUsers)
                                        }, DEFAULT_DELAY_TIME)
                                    }
                                }
                            })
                            .catch((err) => {
                                setUploadLoading(false)
                                dropDownRef.current.alertWithType(
                                    DropDownType.ERROR,
                                    t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_SYNC_REASSIGN,
                                    err
                                )
                            })
                    })
                    .catch((err) => {
                        setUploadLoading(false)
                        dropDownRef.current.alertWithType(
                            DropDownType.ERROR,
                            t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_INSERT_LOCAL_REASSIGN,
                            err
                        )
                    })
            }
        })
        .catch((err) => {
            setUploadLoading(false)
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_REASSIGN_DATA_TO_SOUP,
                err
            )
        })
}

const getTabs = (userData) => {
    let tabs = [
        { name: t.labels.PBNA_MOBILE_OVERVIEW.toUpperCase() },
        { name: t.labels.PBNA_MOBILE_VISITS.toUpperCase() }
    ]
    if (userData.unassignedRoute) {
        tabs = [{ name: t.labels.PBNA_MOBILE_VISITS.toUpperCase() }]
    }
    return tabs
}

const EmployeeDetail = (props: EmployeeDetailProps) => {
    const { navigation, route } = props
    const manager = useSelector(managerReducer)
    const weekLabel = getWeekLabel()
    const { userData, userType, activeTab } = route.params
    const isSales = userType === UserType.UserType_Sales
    const [componentArr, setComponentsArr] = useState([])
    const tempWorkingOrder = getWorkingStatusObj(userData.workingStatus)
    const [originalWorkingOrder, setOriginalWorkingOrder] = useState(tempWorkingOrder)
    const { dropDownRef } = useDropDown()
    const [uploadLoading, setUploadLoading] = useState(false)
    const [isErrorShow, setIsErrorShow] = useState(false)
    const netInfo = useNetInfo()
    const [resultModalVisible, setResultModalVisible] = useState(false)
    const [allSDData, setAllSDData] = useState({})
    const [reassignUserData, setReassignUserData] = useState([])
    const [sortList, setSortList] = useState({})
    const [selectData, setSelectData] = useState([])
    const [selectedUserKey, setSelectedUserKey] = useState([])
    const [weekDays, setWeekDays] = useState({})
    const [selectDayKey, setSelectDayKey] = useState(null)
    const [isEdit, setIsEdit] = useState(false)
    const [isActive, setActiveTab] = useState(activeTab || 0)
    const [deleteSelectData, setDeleteSelectData] = useState({})
    const [totalUnassign, setTotalUnassign] = useState('1')
    const [totalDelete, setTotalDelete] = useState('1')
    const [totalAssign, setTotalAssign] = useState('1')
    const [unassignModalVisible, setUnassignModalVisible] = useState(false)
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [reassignModalVisible, setReassignModalVisible] = useState(false)
    const [updateSDModalVisible, setUpdateSDModalVisible] = useState(false)
    const sortListRef = useRef<SortableList<any>>()
    const scrollViewRef: any = useRef()
    const reassignModal: any = useRef()
    const unassignResultModal = useRef(null)
    const deleteResultModal = useRef(null)
    const reassignResultModal = useRef(null)
    const refMonthWeek: any = useRef()
    const lineCodeMap = manager.lineCodeMap
    const unassignedRoute = userData.unassignedRoute
    const [addSDModalVisible, setAddSDModalVisible] = useState(false)
    const [dropDownModalVisible, setDropDownModalVisible] = useState(false)
    const [isNightShift, setIsNightShift] = useState(userData.isNightShift)

    const scrollViewOffsetPage = (index) => {
        scrollViewRef.current.scrollTo({ y: 0, x: screenWidth * index })
        setActiveTab(index)
    }
    useEffect(() => {
        setUploadLoading(false)
        setLoggedInUserTimezone()
        setComponentsArr(getTabs(userData))
        if (activeTab === 1) {
            const timeoutId = setTimeout(() => {
                clearTimeout(timeoutId)
                scrollViewOffsetPage(activeTab)
            })
        }
        return () => {
            setLoggedInUserTimezone()
        }
    }, [])

    useEffect(() => {
        getCustomerData({ userData, dropDownRef, customerDetail: false, unassignedRoute: unassignedRoute }).then(
            (store) => {
                refreshView({
                    selectDayKey,
                    setData: setAllSDData,
                    setWeekDays,
                    refMonthWeek,
                    setSelectDayKey,
                    setSortList,
                    store
                })
                getUserData(dropDownRef).then((users: Array<any>) => {
                    setReassignUserData(users)
                })
            }
        )
    }, [])

    const goToVisitTab = () => {
        setActiveTab(1)
        scrollViewRef.current.scrollTo({ y: 0, x: screenWidth })
    }

    useEffect(() => {
        const refresh = NativeAppEventEmitter.addListener(EventEmitterType.REFRESH_EMPLOYEE_SD, (event) => {
            getCustomerData({ userData, dropDownRef, customerDetail: false, unassignedRoute: unassignedRoute }).then(
                (store) =>
                    refreshView({
                        selectDayKey,
                        setData: setAllSDData,
                        setWeekDays,
                        refMonthWeek,
                        setSelectDayKey,
                        setSortList,
                        store,
                        select: event?.selectDayKey
                    })
            )
            if (event?.onlyRefreshSD) {
                return
            }
            if (event?.count) {
                setTotalAssign(event?.count)
                setAddSDModalVisible(true)
                goToVisitTab()
            } else {
                setUpdateSDModalVisible(true)
            }
        })
        return () => {
            refresh && refresh.remove()
        }
    }, [])

    const deleteData = async () => {
        setUploadLoading(true)
        const dataCheck = await checkDataForCTRAndSD(selectData)
        if (!dataCheck) {
            setUploadLoading(false)
            setIsErrorShow(true)
            return
        }
        deleteDataTemp({
            setUploadLoading,
            selectData,
            setDeleteSelectData,
            deleteSelectData,
            data: allSDData,
            setData: setAllSDData,
            setSelectData,
            setWeekDays,
            setSortList,
            selectDayKey,
            setTotalDelete,
            setDeleteModalVisible,
            setIsEdit,
            setSelectedUserKey,
            sortListRef,
            dropDownRef,
            setReassignUserData,
            userData,
            refMonthWeek,
            setSelectDayKey,
            lineCodeMap
        })
    }
    const goBack = () => {
        navigation.goBack()
    }

    const onRemoveEmployeeClick = async () => {
        setUploadLoading(true)
        const dataCheck = await dataCheckWithAction(
            'User_Stats__c',
            `WHERE User__c='${userData?.id}' AND RecordType.DeveloperName = 'Stats'`,
            '',
            false
        )
        if (!dataCheck) {
            setUploadLoading(false)
            setIsErrorShow(true)
            return
        }
        setUploadLoading(false)
        userData.deletableDirectly = _.isEmpty(sortList)
        onRemoveBtnClick(userData, netInfo, dropDownRef, null, goToVisitTab, setUploadLoading, null)
            .then(() => {
                setResultModalVisible(true)
                const timeoutId = setTimeout(() => {
                    clearTimeout(timeoutId)
                    navigation.goBack()
                }, DEFAULT_DELAY_TIME)
            })
            .catch((err) => {
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_REMOVE_EMPLOYEE,
                    err
                )
            })
    }

    useEffect(() => {
        // when swipe back to previous page
        navigation.addListener(EventEmitterType.BEFORE_REMOVE, () => {
            NativeAppEventEmitter.emit(EventEmitterType.REFRESH_MY_TEAM)
        })
        return () => {
            navigation.removeListener(EventEmitterType.BEFORE_REMOVE)
        }
    }, [])

    const refreshCustomerData = async () => {
        const newData = handleOriginData({ data: allSDData, customerDetail: false })
        setAllSDData(newData)
        const temp = {}
        Object.keys(newData).forEach((item) => {
            temp[item] = false
        })
        setWeekDays(temp)
        getSelectDayCount({ data: allSDData, setIsEdit, setSelectData, setSelectedUserKey })
        setSortList(newData[selectDayKey])
    }

    const deleteDataAlert = () => {
        Alert.alert(t.labels.PBNA_MOBILE_DELETE_RECURRING_VISITS, t.labels.PBNA_MOBILE_DELETE_RECURRING_VISITS_MSG, [
            { text: t.labels.PBNA_MOBILE_NO },
            {
                text: t.labels.PBNA_MOBILE_YES_DELETE,
                onPress: deleteData
            }
        ])
    }
    const isAllDaySelect = () => {
        return isAllDaySelectTemp({ data: allSDData, selectDayKey })
    }

    const onUnassignClick = () => {
        const isFullWeekSelect = isAllDaySelect()
        setTotalUnassign(selectData.length.toString())
        unassignSDData({
            selectData,
            setSelectData,
            setIsErrorShow,
            setUploadLoading
        }).then(async (res) => {
            if (res) {
                await syncDownDataByTableNames(MerchManagerScreenMapping.ServiceDetailRelated)
                getCustomerData({
                    userData,
                    dropDownRef,
                    customerDetail: false,
                    unassignedRoute: unassignedRoute
                }).then((store) => {
                    if (isFullWeekSelect) {
                        setAllSDData({})
                        setWeekDays({})
                        setSortList({})
                    }
                    refreshView({
                        selectDayKey,
                        setData: setAllSDData,
                        setWeekDays,
                        refMonthWeek,
                        setSelectDayKey,
                        setSortList,
                        store
                    })
                })
                setUnassignModalVisible(true)
            }
        })
    }

    const onReassignClick = () => {
        reassignModal.current?.openModal({})
    }

    const changeDay = (value) => {
        if (value === selectDayKey) {
            return
        }
        setSelectDayKey(value)
        setSortList(allSDData[value] || {})
        sortListRef?.current?._scrollView?.scrollTo({ x: 0, y: 0, animated: true })
    }

    const weekDayClick = (value) => {
        changeDay(value.weekLabel)
    }

    const selectAllDay = () => {
        selectAllDayTemp({
            sortList,
            isAllDaySelect,
            weekDays,
            selectDayKey,
            setWeekDays,
            setSortList,
            data: allSDData,
            setIsEdit,
            setSelectData,
            setSelectedUserKey
        })
    }

    const isAllWeekSelect = () => {
        return isAllWeekSelectSD(allSDData)
    }

    const selectAllWeekDay = (selectAll: boolean = false) => {
        selectAllWeekDayTemp({
            data: allSDData,
            selectAll,
            weekDays,
            setWeekDays,
            setSortList,
            selectDayKey,
            setIsEdit,
            setSelectData,
            setSelectedUserKey,
            isAllWeekSelect
        })
    }

    const sortItemClick = (key) => {
        sortList[key].select = !sortList[key].select
        const tempWeekDays = { ...weekDays }
        // sortItemClickTemp({ sortList, tempWeekDays, selectDayKey })
        tempWeekDays[selectDayKey] = isDaySelect(sortList)
        getSelectDayCount({ data: allSDData, setIsEdit, setSelectData, setSelectedUserKey })
        setWeekDays(tempWeekDays)
        setSortList({ ...sortList })
    }

    const editMethod = () => {
        editMethodTemp({ data: allSDData, isEdit, selectAllWeekDay, setIsEdit })
    }

    const goToDetails = (item) => {
        if (unassignedRoute) {
            item.unassignedRoute = unassignedRoute
            item.totalVisit = userData.totalVisit
            item.name = userData.name
        }
        navigation.navigate(NavigationRoute.RECURRING_VISIT_DETAIL, { detailData: item, allWeekData: allSDData })
    }

    const renderRow = ({ data, index, key }: { data: any; index: any; key: any }) => {
        return (
            <EmployeeDetailCustomerCell
                isEdit={isEdit}
                onCellPress={goToDetails}
                onCheckBoxPress={sortItemClick}
                item={data}
                index={index}
                itemKey={key}
            />
        )
    }

    const createCTRData = (user, accountId) => {
        return new Promise((resolve, reject) => {
            const ctrObj = {
                OwnerId: user.id,
                Route__c: user.routeId,
                Merch_Flag__c: true,
                Customer__c: accountId,
                ACTV_FLG__c: true,
                RecordTypeId: user.CTRRecordTypeId,
                IsRemoved__c: false
            }
            syncUpObjCreateFromMem('Customer_to_Route__c', [ctrObj])
                .then((res) => {
                    const temp = { id: accountId, value: res[0]?.data[0]?.Id }
                    user.customerIdMap[accountId] = res[0]?.data[0]?.Id
                    resolve(temp)
                })
                .catch((error) => {
                    dropDownRef.current.alertWithType(
                        DropDownType.ERROR,
                        t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_CREATE_CTR_DATA,
                        error
                    )
                    reject(error)
                })
        })
    }

    const showReassignResult = async (event: any) => {
        setTotalAssign(String(event.count))
        setSelectData([])
        setReassignModalVisible(true)
        sortListRef?.current?._scrollView?.scrollTo({ x: 0, y: 0, animated: true })
    }

    const reAssignItemClick = async (user) => {
        reassignModal.current?.closeModal()
        setUploadLoading(true)
        const CTRRecordTypeId = await getRecordTypeIdByDeveloperName('CTR', 'Customer_to_Route__c')
        const dataCheck = await checkDataForReassignSD(user, selectData, CTRRecordTypeId)
        if (!dataCheck) {
            setUploadLoading(false)
            setIsErrorShow(true)
            return
        }
        const dataCheckUS = await dataCheckWithAction(
            'User_Stats__c',
            `WHERE User__c='${user.id}' AND RecordType.DeveloperName = 'Stats'`,
            '',
            false
        )
        if (!dataCheckUS) {
            setUploadLoading(false)
            setIsErrorShow(true)
            return
        }
        const createCTRArray = []
        for (const tmpData of selectData) {
            tmpData.isReassign = true
            tmpData.select = false
            if (!Object.keys(user.customerIdMap).includes(tmpData.accountId)) {
                createCTRArray.push(createCTRData(user, tmpData.accountId))
            }
        }
        if (createCTRArray.length > 0) {
            Promise.all(createCTRArray).then(async () => {
                await reassignData({
                    selectUser: user,
                    selectData,
                    userData,
                    refreshCustomerData,
                    dropDownRef,
                    setReassignUserData,
                    selectDayKey,
                    setData: setAllSDData,
                    setWeekDays,
                    refMonthWeek,
                    setSelectDayKey,
                    setSortList,
                    showReassignResult,
                    setUploadLoading,
                    lineCodeMap
                })
            })
        } else {
            reassignData({
                selectUser: user,
                selectData,
                userData,
                refreshCustomerData,
                dropDownRef,
                setReassignUserData,
                selectDayKey,
                setData: setAllSDData,
                setWeekDays,
                refMonthWeek,
                setSelectDayKey,
                setSortList,
                showReassignResult,
                setUploadLoading,
                lineCodeMap
            })
        }
    }

    const onAddBtnClick = async (index) => {
        setDropDownModalVisible(!dropDownModalVisible)
        setUploadLoading(true)
        if (index === 0) {
            await syncDownDataByTableNames(MerchManagerScreenMapping.MyTeam)
            setUploadLoading(false)
            navigation.navigate(NavigationRoute.ADD_EMPLOYEE)
        } else {
            await syncDownDataByTableNames(MerchManagerScreenMapping.ServiceDetailRelated)
            setUploadLoading(false)
            navigation.navigate(NavigationRoute.ADD_RECURRING_VISIT, {
                data: allSDData,
                customerData: null,
                mapInfo: null,
                selectDayKey,
                isFromEmployee: true,
                userData
            })
        }
    }

    const addNightShift = async () => {
        try {
            const userIfo = await SoupService.retrieveDataFromSoup(
                'User_Stats__c',
                {},
                getObjByName('User_Stats__c').syncUpCreateFields,
                getObjByName('User_Stats__c').syncUpCreateQuery + ` WHERE {User_Stats__c:User__c} = '${userData.id}'`
            )
            userIfo[0].Is_Night_Shift__c = !isNightShift
            await syncUpObjUpdateFromMem(
                'User_Stats__c',
                filterExistFields('User_Stats__c', [...userIfo], getObjByName('User_Stats__c').syncUpCreateFields)
            )
        } catch (e) {
            setIsNightShift(!isNightShift)
            storeClassLog(
                Log.MOBILE_ERROR,
                'addNightShift-EmployeeDetail',
                `Update user stats night shift failed: ${getStringValue(e)}`
            )
        }
    }

    const toggleSwitch = () => {
        Alert.alert(
            '',
            !isNightShift ? t.labels.PBNA_MOBILE_ADD_NIGHT_SHIFT : t.labels.PBNA_MOBILE_REMOVE_NIGHT_SHIFT,
            [
                {
                    text: t.labels.PBNA_MOBILE_OK,
                    onPress: () => {
                        addNightShift()
                    }
                }
            ]
        )
        setIsNightShift(!isNightShift)
    }

    return (
        <View style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.btnBack, styles.width_36]}
                    hitSlop={commonStyle.hitSlop}
                    onPress={() => {
                        goBack()
                    }}
                >
                    <Image source={IMG_BACK} style={styles.imgBack} />
                </TouchableOpacity>
                <View>
                    <CText style={styles.title}>
                        {unassignedRoute
                            ? _.upperCase(t.labels.PBNA_MOBILE_UNASSIGNED + ' ' + t.labels.PBNA_MOBILE_ROUTE)
                            : t.labels.PBNA_MOBILE_EMPLOYEE_PROFILE}
                    </CText>
                </View>
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
                        <Image style={MyTeamStyle.imgAdd} source={iconAdd} />
                    )}
                </TouchableOpacity>
                {renderDropdownBtnList(dropDownModalVisible, onAddBtnClick, setDropDownModalVisible)}
            </View>
            <View style={styles.imgBkgroundView}>
                <ImageBackground source={getBgImage(userType)} style={styles.imgBkground}>
                    {unassignedRoute ? (
                        <View style={[styles.portraitView, { marginTop: -80 }]}>
                            <Image
                                style={[styles.imgPortrait, { borderRadius: 14 }]}
                                source={ImageSrc.IMG_UNASSIGNED}
                            />
                        </View>
                    ) : (
                        <View style={styles.portraitView}>
                            <UserAvatar
                                userStatsId={userData.userStatsId}
                                firstName={userData.firstName}
                                lastName={userData.lastName}
                                avatarStyle={styles.imgPortrait}
                                userNameText={{ fontSize: 34 }}
                            />
                            {UploadAvatar({
                                setUploadLoading: null,
                                dropDownRef,
                                usId: userData.userStatsId,
                                userData: userData
                            })}
                        </View>
                    )}
                    <CText numberOfLines={1} ellipsizeMode="tail" style={styles.userName}>
                        {unassignedRoute
                            ? _.capitalize(t.labels.PBNA_MOBILE_UNASSIGNED) + ' ' + t.labels.PBNA_MOBILE_ROUTE
                            : userData.name}
                    </CText>
                    <View style={styles.roleView}>
                        <CText style={styles.roleText}>{getFTPT({ item: userData })}</CText>
                        <CText numberOfLines={1} ellipsizeMode="tail" style={styles.roleText}>
                            {userData.title}
                        </CText>
                        {unassignedRoute && (
                            <CText numberOfLines={1} ellipsizeMode="tail" style={styles.roleText}>
                                {userData.name}
                            </CText>
                        )}
                        {unassignedRoute && <CText style={styles.roleText}> | </CText>}
                        {userData.title && <CText style={styles.roleText}> | </CText>}
                        <CText numberOfLines={1} ellipsizeMode="tail" style={styles.roleText}>
                            {t.labels.PBNA_MOBILE_GPID} {userData.gpid}
                        </CText>
                    </View>
                    {!unassignedRoute && (
                        <View style={styles.locationView}>
                            <View style={styles.location}>
                                <Image source={IMG_ADDRESS} style={styles.imgAddress} />
                                <CText numberOfLines={1} ellipsizeMode="tail" style={styles.roleText}>
                                    {userData.location}
                                </CText>
                            </View>
                            {RowMsgPhoneView(userData.phone, true)}
                        </View>
                    )}
                </ImageBackground>
            </View>
            <View style={styles.tabView}>
                <ScrollView horizontal bounces={false}>
                    {componentArr.map((value: any, index) => {
                        return (
                            <TouchableOpacity key={value?.name} onPress={() => scrollViewOffsetPage(index)}>
                                <View style={[styles.flexDirectionRow, commonStyle.marginRight_22]}>
                                    <View style={[styles.tabButton, isActive === index && styles.isActive]}>
                                        <CText style={[styles.tabTitle, isActive === index && styles.isActive]}>
                                            {value.name}
                                        </CText>
                                    </View>
                                    {!unassignedRoute &&
                                        (((userData.noWorkingDay ||
                                            userData.terminateUser ||
                                            _.isEmpty(userData.startTime)) &&
                                            value.name === componentArr[0].name) ||
                                            (checkVisitsTabAllError(originalWorkingOrder, allSDData) &&
                                                value.name === componentArr[1].name)) && (
                                            <View style={[styles.tabButton, commonStyle.marginLeft_5]}>
                                                <RedExclamation width={SIZE_12} height={SIZE_12} />
                                            </View>
                                        )}
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>
            <ScrollView
                style={screenWidthStyle}
                horizontal
                pagingEnabled
                scrollEnabled={!isEdit}
                showsHorizontalScrollIndicator={false}
                ref={scrollViewRef}
                onScrollEndDrag={(e: any) => {
                    const offset = e.nativeEvent.targetContentOffset
                    const isScreenWidthTimes = offset.x % screenWidth === 0
                    const activeIndex = Math.ceil(offset.x / screenWidth) + (isScreenWidthTimes ? 0 : 1)
                    setActiveTab(activeIndex)
                }}
            >
                {[
                    !unassignedRoute &&
                        renderOverView({
                            isSales,
                            userData,
                            onRemoveEmployeeClick,
                            getOverviewTabErrorMsgCB: getOverviewTabErrorMsg,
                            isNightShift,
                            toggleSwitch,
                            originalWorkingOrder,
                            setOriginalWorkingOrder,
                            setIsErrorShow
                        }),
                    visitView({
                        isEdit,
                        sortList,
                        selectData,
                        onUnassignClick,
                        deleteDataAlert,
                        onReassignClick,
                        refMonthWeek,
                        weekDays,
                        weekDayClick,
                        selectAllDay,
                        isAllDaySelect,
                        selectAllWeekDay,
                        isAllWeekSelect,
                        editMethod,
                        selectDayKey,
                        sortListRef,
                        sortItemClick,
                        renderRow,
                        originalWorkingOrder,
                        data: allSDData,
                        unassignedRoute,
                        weekLabel,
                        getVisitsTabErrorMsgCB: getVisitsTabErrorMsg
                    })
                ]}
            </ScrollView>

            <ReassignResultModal
                navigation={navigation}
                isRemovedFromMyTeam
                userName={userData?.name}
                modalVisible={resultModalVisible}
                setModalVisible={setResultModalVisible}
            />
            <ReassignModal
                cRef={reassignModal}
                navigation={navigation}
                userData={selectedUserKey.length > 1 ? { id: null } : { id: selectedUserKey[0] }}
                type={ReassignModalType.ReassignModalType_EmployeeDetail}
                isEmployee
                data={reassignUserData}
                selectDataLength={selectData.length}
                selectedTime={''}
                selectedCase={0}
                itemClick={reAssignItemClick}
                reassignCallBack={(count) => showReassignResult(count)}
            />
            <ReassignResultModal
                cRef={unassignResultModal}
                navigation={navigation}
                reassignType={VisitOperationType.UNASSIGN}
                visitType={VisitType.RECURRING}
                totalAssign={totalUnassign}
                modalVisible={unassignModalVisible}
                setModalVisible={setUnassignModalVisible}
                isNeedThreeHundredSize
            />
            <ReassignResultModal
                cRef={deleteResultModal}
                navigation={navigation}
                reassignType={VisitOperationType.DELETE}
                visitType={VisitType.RECURRING}
                totalAssign={totalDelete}
                modalVisible={deleteModalVisible}
                setModalVisible={setDeleteModalVisible}
                isNeedThreeHundredSize
            />
            <ReassignResultModal
                cRef={reassignResultModal}
                navigation={navigation}
                reassignType={VisitOperationType.REASSIGN}
                visitType={VisitType.RECURRING}
                totalAssign={totalAssign}
                modalVisible={reassignModalVisible}
                setModalVisible={setReassignModalVisible}
                isNeedThreeHundredSize
            />
            <ReassignResultModal
                navigation={navigation}
                isUpdatedServiceDetail
                modalVisible={updateSDModalVisible}
                setModalVisible={setUpdateSDModalVisible}
            />
            <ErrorMsgModal
                index={DataCheckMsgIndex.COMMON_MSG}
                visible={isErrorShow}
                setModalVisible={setIsErrorShow}
                handleClick={goBack}
            />
            <ReassignResultModal
                navigation={navigation}
                isServiceDetail
                totalAssign={totalAssign}
                modalVisible={addSDModalVisible}
                setModalVisible={setAddSDModalVisible}
            />
            <Loading isLoading={uploadLoading} />
        </View>
    )
}

export default EmployeeDetail

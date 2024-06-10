import React, { useEffect, useRef, useState } from 'react'
import {
    ImageBackground,
    View,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
    NativeAppEventEmitter,
    Animated
} from 'react-native'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import LocationService from '../../../service/LocationService'
import CustomerDetailStyle from '../../../styles/manager/CustomerDetailStyle'
import SelectScheduleStyle from '../../../styles/manager/SelectScheduleStyle'
import {
    onRemoveCustomerBtnClick,
    ReassignModalType,
    refreshCTRData,
    refreshView,
    handleOriginData,
    getCustomerData,
    getUserData,
    deleteSelectCustomerToSoup,
    updateTakeOrderFlag,
    DEFAULT_DELAY_TIME,
    getRecordTypeIdByDeveloperName,
    syncDownDataByTableNames
} from '../../../utils/MerchManagerUtils'
import BackButton from '../../common/BackButton'
import CText from '../../../../common/components/CText'
import MonthWeek, { MonthWeekType } from '../../common/MonthWeek'
import SortableList from 'react-native-sortable-list'
import { ServiceDetailEmployeeCell } from '../common/EmployeeCell'
import { database } from '../../../common/SmartSql'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import CCheckBox from '../../../../common/components/CCheckBox'
import { SoupService } from '../../../service/SoupService'
import { rebuildObjectDepth } from '../../../utils/SoupUtils'
import ReassignResultModal from '../common/ReassignResultModal'
import ReassignModal from '../common/ReassignModal'
import EmptyVisit from '../../../../../assets/image/empty_visit.svg'
import Loading from '../../../../common/components/Loading'
import { filterExistFields, getObjByName } from '../../../utils/SyncUtils'
import { syncUpObjCreateFromMem, syncUpObjUpdate, syncUpObjUpdateFromMem } from '../../../api/SyncUtils'

import _, { isObject } from 'lodash'
import { renderPhoneButton } from '../../../helper/manager/CustomerTileHelper'
import InStoreMap from '../../merchandiser/InStoreMap'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { handleWeekKeySelect, renderUserItem } from '../helper/MerchManagerHelper'
import MessageBar from '../common/MessageBar'
import RedExclamation from '../../../../../assets/image/red-exclamation.svg'
import { checkDataForCTRAndSD, checkDataForReassignSD, dataCheckWithAction } from '../service/DataCheckService'
import ErrorMsgModal from '../common/ErrorMsgModal'
import { BooleanStr, DataCheckMsgIndex, DropDownType, EventEmitterType, NavigationRoute } from '../../../enums/Manager'
import { useDispatch, useSelector } from 'react-redux'
import { VisitOperationType, VisitType } from '../../../enums/Visit'
import { t } from '../../../../common/i18n/t'
import SalesSnapshot from './SalesSnapshot/SalesSnapshot'
import { Log } from '../../../../common/enums/Log'
import {
    composeServiceDetailQuery,
    handleDeleteSelectData,
    isAllWeekSelectSD,
    unassignSDData
} from '../helper/ServiceDetailHelper'
import { MerchManagerScreenMapping } from '../../../config/ScreenMapping'
import CustomerProfileTab from '../../common/CustomerProfileTab'
import CustomerActivityTab from '../../rep/customer/activity-tab/CustomerActivityTab'
import {
    useCustomerActivity,
    useCustomerDetail,
    useInternalContacts,
    useInitCustomerDetail,
    retrieveInternalContact,
    useLocationLevelGoCart,
    useInitStoreProductData
} from '../../../hooks/CustomerHooks'
import { useEquipmentAssets, useService } from '../../../hooks/EquipmentHooks'
import EquipmentTab from '../../rep/customer/EquipmentTab'
import CustomerContactTab from '../../rep/customer/CustomerContactTab'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import LeadFloatButton from '../../rep/lead/common/LeadFloatButton'
import LogCallForm from '../../rep/lead/LogCallForm'
import { useDetailScreenHeaderTabAnimation } from '../../../hooks/AnimationHooks'
import ContactForm from '../../rep/lead/ContactForm'
import CustomerEquipmentReqButton from '../../rep/customer/CustomerEquipmentReqButton'
import { isPersonaMerchManager } from '../../../../common/enums/Persona'
import CustomerMyStoreTab from '../../rep/customer/CustomerMyStoreTab'
import { getStringValue } from '../../../utils/LandingUtils'
import { useCustomerDistributionPoints, usePriceGroupWithRequest } from '../../../hooks/CustomerProfileHooks'
import EmployeeDetailStyle from '../../../styles/manager/EmployeeDetailStyle'
import POSView from '../../rep/customer/pos-tab/POSView'
import { useCustomerInvoiceHeader } from '../../../hooks/CustomerInvoiceHooks'
import CustomerContractTab from '../../rep/customer/CustomerContractTab'
import { AssetAttributeService } from '../../../service/AssetAttributeService'
import { FullScreenModalRef } from '../../rep/lead/common/FullScreenModal'
import { usePOSListHooks } from '../../../hooks/POSHooks'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { renderStoreIcon } from '../../rep/customer/CustomerListTile'
import { checkAndRefreshEquipmentSharePoint } from '../../../service/EquipmentSharePointService'
import { useSalesSnapshotData } from '../../../hooks/SalesSnapshotHooks'
import { getPepsiCoPeriodCalendar } from '../../merchandiser/MyPerformance'
import { setPepsicoCalendar } from '../../../redux/action/ContractAction'
import { useGetRetailStore } from '../../../hooks/MerchandiserHooks'
import PushOrderBar from '../../../../orderade/component/visits/PushOrderBar'
import { IntervalTime } from '../../../enums/Contract'
import { ActiveTabName } from '../../../pages/rep/customer/CustomerDetailScreen'
import SelectGeoFenceTypeModal, {
    GEO_FENCE_TYPE
} from '../../rep/customer/profile-tab/EditGeoFence/SelectGeoFenceTypeModal'
import { DefaultGeoFence, GeoFenceProps } from '../../rep/customer/profile-tab/EditGeoFence/GeoFenceModal'
import SuccessView, { SuccessViewRef } from '../../common/SuccessView'
import { GeoFenceUpdateSuccessEvent } from '../../rep/customer/profile-tab/EditGeoFence/EditGeoFenceHelper'

const kScreenHeight = Dimensions.get('window').height
const selectViewHeight = 143
const cellHeight = 80

const styles = CustomerDetailStyle
const selectStyles = SelectScheduleStyle
const screenWidth = Dimensions.get('window').width
const screenWidthStyle = { width: screenWidth }
const IMG_MODAL_CLEAR = ImageSrc.IMG_MODAL_CLEAR
const IMG_MODAL_DELETE = ImageSrc.IMG_MODAL_DELETE
const IMG_MODAL_REASSIGN = ImageSrc.IMG_MODAL_REASSIGN
const managerReducer = (state) => state.manager

let componentArr = []
interface CustomerDetailProps {
    props: any
    route: any
    navigation: any
}

const createCTRData = (params) => {
    const { user, customerData, dropDownRef } = params
    return new Promise((resolve, reject) => {
        const ctrObj = {
            OwnerId: user.id,
            Route__c: user.routeId,
            Merch_Flag__c: true,
            Customer__c: customerData.accountId,
            ACTV_FLG__c: true,
            RecordTypeId: user.CTRRecordTypeId,
            IsRemoved__c: false
        }
        syncUpObjCreateFromMem('Customer_to_Route__c', [ctrObj])
            .then((res) => {
                resolve(res[0]?.data[0]?.Id)
            })
            .catch((error) => {
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_CUSTOMER_DETAIL_CREATE_CTR_DATA,
                    error
                )
                reject(error)
            })
    })
}

const computeSelectData = (data) => {
    let hasData = false
    const tempSelectData = []
    const tempSelectUserMap = {}
    for (const weekKey in data) {
        const tempSortList = data[weekKey]
        for (const key in tempSortList) {
            if (!tempSortList[key].isDelete) {
                hasData = true
            }
            if (tempSortList[key].select) {
                tempSelectData.push(tempSortList[key])
                tempSelectUserMap[tempSortList[key].ownerId] = true
            }
        }
    }
    return { hasData, tempSelectData, tempSelectUserMap }
}

const hasUnassignedError = (visits: any) => {
    let hasUnassigned: boolean = false
    for (const key in visits) {
        if (Array.isArray(visits[key])) {
            hasUnassigned = visits[key].some((visit) => visit.isUnassigned)
        } else {
            for (const i in visits[key]) {
                visits[key][i].isUnassigned && (hasUnassigned = true)
            }
        }
    }
    return hasUnassigned
}

const watchHasUnassignedVisits = (props: { visits: Object; setHasUnassignedVisits: (arg: boolean) => any }) => {
    const { visits, setHasUnassignedVisits } = props
    const hasUnassigned = hasUnassignedError(visits)
    setHasUnassignedVisits(hasUnassigned)
}

const getSelectDayCount = (parmas) => {
    const { data, setIsEdit, setSelectData, setSelectedUserKey } = parmas
    const { hasData, tempSelectData, tempSelectUserMap } = computeSelectData(data)
    if (!hasData) {
        setIsEdit(false)
    }
    setSelectData(tempSelectData)
    setSelectedUserKey(Object.keys(tempSelectUserMap))
}

const refreshCustomerData = async (params) => {
    const {
        data,
        newVisitMap,
        selectedReassignUser,
        setData,
        setWeekDays,
        setIsEdit,
        setSelectData,
        setSelectedUserKey,
        setSortList,
        selectDayKey
    } = params
    const newData = handleOriginData({ data, customerDetail: true, newVisitMap, selectedReassignUser })
    setData(newData)
    const temp = {}
    Object.keys(newData).forEach((item) => {
        temp[item] = false
    })
    setWeekDays(temp)
    getSelectDayCount({ data, setIsEdit, setSelectData, setSelectedUserKey })
    setSortList(data[selectDayKey])
}

const reassignData = async (params) => {
    const {
        selectData,
        customerData,
        customerRouteId,
        userId,
        dropDownRef,
        refMonthWeek,
        setSelectDayKey,
        setUserData,
        showReassignResult,
        setIsLoading,
        data,
        selectedReassignUser,
        setData,
        setWeekDays,
        setIsEdit,
        setSelectData,
        setSelectedUserKey,
        setSortList,
        selectDayKey,
        lineCodeMap
    } = params
    const newVisitArray = []
    const newVisitMap = {}
    let whereClauseString = ''
    const visitIdArray = []
    let CTRRecordTypeId = ''
    const customerToRouteMap = {}
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
        'Customer_to_Route__r.Customer__c': customerData.accountId,
        'Customer_to_Route__r.Merch_Flag__c': BooleanStr.STR_TRUE,
        'Customer_to_Route__r.RecordTypeId': CTRRecordTypeId,
        Id: JSON.stringify({ value: visitIdArray })
    }
    const whereClauseArr = composeServiceDetailQuery(fields)
    database()
        .use('Service_Detail__c')
        .select()
        .where(whereClauseArr)
        .getData()
        .then((res: any) => {
            const weekDayStringArr = []
            if (res?.length > 0) {
                res.forEach((newVisit, index) => {
                    weekDayStringArr.push(newVisit.Day_of_the_Week__c)
                    newVisit.Customer_to_Route__c = customerRouteId
                    newVisit.OwnerId = userId
                    newVisit.Unassigned__c = BooleanStr.STR_FALSE
                    newVisit.Route_Group__c = null
                    if (index === 0) {
                        whereClauseString += " WHERE {Service_Detail__c:Id} = '" + newVisit.Id + "'"
                    } else {
                        whereClauseString += " OR {Service_Detail__c:Id} = '" + newVisit.Id + "'"
                    }
                    newVisitArray.push(newVisit)
                    newVisitMap[newVisit.Id] = newVisit
                })
            }
            if (newVisitArray.length > 0) {
                const newVisitArrayWithDepth = newVisitArray.map((v) => rebuildObjectDepth(v))
                SoupService.upsertDataIntoSoup('Service_Detail__c', newVisitArrayWithDepth, true, false)
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
                                        accountId: customerData.accountId,
                                        dropDownRef,
                                        orderDays: null,
                                        lineCodeMap
                                    })
                                    updatedResult.push(updatedVal)
                                    if (updatedResult.length === weekDayStringArr.length) {
                                        await syncDownDataByTableNames(MerchManagerScreenMapping.ServiceDetailRelated)
                                        await refreshCustomerData({
                                            data,
                                            newVisitMap,
                                            selectedReassignUser,
                                            setData,
                                            setWeekDays,
                                            setIsEdit,
                                            setSelectData,
                                            setSelectedUserKey,
                                            setSortList,
                                            selectDayKey
                                        })
                                        await refreshCTRData({
                                            customerToRouteMap,
                                            dropDownRef,
                                            selectDayKey,
                                            setData,
                                            setWeekDays,
                                            refMonthWeek,
                                            setSelectDayKey,
                                            setSortList,
                                            customerDetail: true,
                                            setUserData,
                                            customerData
                                        })
                                        const newUsers = await getUserData(dropDownRef)
                                        const timeoutId = setTimeout(() => {
                                            clearTimeout(timeoutId)
                                            setUserData(newUsers)
                                            showReassignResult({ count: newVisitArray.length })
                                            setIsLoading(false)
                                        }, DEFAULT_DELAY_TIME)
                                    }
                                }
                            })
                            .catch((err) => {
                                setIsLoading(false)
                                dropDownRef.current.alertWithType(
                                    DropDownType.ERROR,
                                    t.labels.PBNA_MOBILE_CUSTOMER_DETAIL_SYNC_REASSIGN,
                                    err
                                )
                            })
                    })
                    .catch((err) => {
                        setIsLoading(false)
                        dropDownRef.current.alertWithType(
                            DropDownType.ERROR,
                            t.labels.PBNA_MOBILE_CUSTOMER_DETAIL_INSERT_REASSIGN,
                            err
                        )
                    })
            }
        })
        .catch((err) => {
            setIsLoading(false)
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_CUSTOMER_DETAIL_REASSIGN_DATA_TO_SOUP,
                err
            )
        })
}

const scrollView = (parmas) => {
    const { selectData, sortListRef, selectedItemKey } = parmas
    if (selectData.length === 1) {
        const layout = sortListRef?.current?._rows[selectedItemKey]?._layout
        if (!layout) {
            return
        }
        const offsetY = sortListRef?.current?._contentOffset?.y
        const viewHeightY = 390
        const viewHeight = layout.y - offsetY
        const selectY = viewHeightY + viewHeight
        if (selectY + cellHeight + selectViewHeight > kScreenHeight) {
            sortListRef?.current?._scrollView?.scrollTo({
                x: 0,
                y: offsetY + selectViewHeight + cellHeight,
                animated: true
            })
        }
    }
}

const updateServiceDetail = async (params) => {
    const {
        updatedVisits,
        whereClauseString,
        callback,
        dropDownRef,
        weekDayString,
        CTRRecordTypeId,
        customerData,
        lineCodeMap
    } = params
    if (updatedVisits.length > 0) {
        SoupService.upsertDataIntoSoup('Service_Detail__c', updatedVisits, true, false).then(() => {
            syncUpObjUpdate(
                'Service_Detail__c',
                getObjByName('Service_Detail__c').syncUpCreateFields,
                getObjByName('Service_Detail__c').syncUpCreateQuery + whereClauseString
            )
                .then(async () => {
                    await updateTakeOrderFlag({
                        weekDayString,
                        CTRRecordTypeId,
                        accountId: customerData.accountId,
                        dropDownRef,
                        orderDays: null,
                        lineCodeMap
                    })
                    callback && callback()
                })
                .catch((err) => {
                    dropDownRef.current.alertWithType(
                        DropDownType.ERROR,
                        t.labels.PBNA_MOBILE_CUSTOMER_DETAIL_SYNC_SERVICE,
                        err
                    )
                })
        })
    } else {
        callback && callback()
    }
}

const updateSequenceToSoup = (parmas) => {
    const { callback, data, selectDayKey, dropDownRef, customerData, lineCodeMap } = parmas
    const updatedVisits = []
    const allSequence = {}
    const whereClauseArr = []
    let whereClauseString = ''
    for (let index = 0; index < Object.keys(data[selectDayKey]).length; index++) {
        const key = Object.keys(data[selectDayKey])[index]
        const id = data[selectDayKey][key].id
        const clauseForSmartSql = {
            leftTable: 'Service_Detail__c',
            leftField: 'Id',
            rightField: `'${id}'`,
            operator: '=',
            type: index === 0 ? null : 'OR'
        }
        whereClauseArr.push(clauseForSmartSql)
        allSequence[id] = data[selectDayKey][Object.keys(data[selectDayKey])[index]].pullNum
    }
    database()
        .use('Service_Detail__c')
        .select()
        .where(whereClauseArr)
        .getData()
        .then(async (res: any) => {
            if (res?.length > 0) {
                res.forEach((visit, index) => {
                    visit.Pull_Number__c = allSequence[visit.Id]
                    visit = rebuildObjectDepth(visit)
                    updatedVisits.push(visit)
                    if (index === 0) {
                        whereClauseString += " WHERE {Service_Detail__c:Id} = '" + visit.Id + "'"
                    } else {
                        whereClauseString += "OR {Service_Detail__c:Id} = '" + visit.Id + "'"
                    }
                })
                await updateServiceDetail({
                    updatedVisits,
                    whereClauseString,
                    callback,
                    dropDownRef,
                    weekDayString: res[0]?.Day_of_the_Week__c,
                    CTRRecordTypeId: res[0]['Customer_to_Route__r.RecordTypeId'] || '',
                    customerData,
                    lineCodeMap
                })
            }
        })
        .catch((err) => {
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_CUSTOMER_DETAIL_UPDATE_SEQUENCE_TO_SOUP,
                err
            )
        })
}

const updateSequenceWithParams = async (parmas) => {
    const {
        order,
        sortList,
        setSortList,
        data,
        selectDayKey,
        dropDownRef,
        setData,
        customerData,
        lineCodeMap,
        setIsLoading
    } = parmas
    const reSequenceSortList = {}
    for (let index = 0; index < order.length; index++) {
        const v = index + 1
        sortList[order[index]].pullNum = v
        reSequenceSortList[v] = sortList[order[index]]
    }
    data[selectDayKey] = reSequenceSortList
    updateSequenceToSoup({
        callback: async () => {
            setTimeout(() => {
                getCustomerData({ dropDownRef, customerDetail: true, customerData })
                    .then((store) => {
                        const tmpData = handleOriginData({ data: store.visits, customerDetail: true })
                        const tempSelectData = tmpData[selectDayKey]
                        for (let index = 0; index < order.length; index++) {
                            const v = index + 1
                            tempSelectData[v].select = sortList[order[index]].select
                        }
                        setData(tmpData)
                        setSortList(tmpData[selectDayKey] || {})

                        const timeoutId = setTimeout(() => {
                            syncDownDataByTableNames(MerchManagerScreenMapping.ServiceDetailRelated)
                            setIsLoading(false)
                            clearTimeout(timeoutId)
                        }, DEFAULT_DELAY_TIME)
                    })
                    .catch((error) => {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'CustomerDetail.updateSequenceWithParams',
                            getStringValue(error)
                        )
                        setIsLoading(false)
                    })
            }, DEFAULT_DELAY_TIME)
        },
        data,
        selectDayKey,
        dropDownRef,
        customerData,
        lineCodeMap
    })
}

const handleDeleteSelectWeekDay = (params) => {
    const { newData, setSelectData, setWeekDays, setSortList, selectDayKey } = params
    const tempWeekDays = {}
    for (const weekKey in newData) {
        if (Object.keys(newData[weekKey]).length > 0) {
            tempWeekDays[weekKey] = false
        }
    }
    setSelectData([])
    setWeekDays(tempWeekDays)
    setSortList(newData[selectDayKey])
}

const deleteData = (params) => {
    const {
        data,
        selectData,
        setDeleteSelectData,
        deleteSelectData,
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
        userData,
        refMonthWeek,
        setSelectDayKey,
        customerData,
        setUserData,
        setIsLoading,
        lineCodeMap
    } = params
    setIsLoading(true)
    handleDeleteSelectData(selectData, setDeleteSelectData, deleteSelectData)
    const newData = handleOriginData({ data, customerDetail: true })
    setData(newData)
    handleDeleteSelectWeekDay({ newData, setSelectData, setWeekDays, setSortList, selectDayKey })
    deleteSelectCustomerToSoup({
        callback: async (count) => {
            await syncDownDataByTableNames(MerchManagerScreenMapping.ServiceDetailRelated)
            if (count) {
                setIsLoading(false)
                setTotalDelete(count)
                setDeleteModalVisible(true)
                setDeleteSelectData({})
                setData(data)
                getSelectDayCount({ data, setIsEdit, setSelectData, setSelectedUserKey })
                sortListRef?.current?._scrollView?.scrollTo({ x: 0, y: 0, animated: true })
            }
        },
        dropDownRef,
        deleteSelectData,
        data,
        userData,
        selectDayKey,
        setData,
        setWeekDays,
        refMonthWeek,
        setSelectDayKey,
        setSortList,
        customerData,
        setUserData,
        lineCodeMap
    })
}

const onReassignClick = (reassignModal) => {
    reassignModal.current?.openModal({})
}

const changeDay = (params) => {
    const { value, setSelectDayKey, setSortList, data, sortListRef } = params
    setSelectDayKey(value)
    setSortList(data[value] || {})
    sortListRef?.current?._scrollView?.scrollTo({ x: 0, y: 0, animated: true })
}

const renderPhoneView = (parmas) => {
    const { customerData, mapInfo } = parmas
    return (
        <View>
            {renderPhoneButton(customerData.phone)}
            <TouchableOpacity
                onPress={() => {
                    const originLocation = { latitude: mapInfo.region?.latitude, longitude: mapInfo.region?.longitude }
                    const targetLocation = { latitude: customerData.latitude, longitude: customerData.longitude }
                    if (!targetLocation.latitude || !targetLocation.longitude) {
                        Alert.alert(t.labels.PBNA_MOBILE_CUSTOMER_DETAIL_NO_GEOLOCATION)
                    } else {
                        LocationService.gotoLocation(originLocation, targetLocation)
                    }
                }}
            >
                <Image style={[styles.imgLocation, commonStyle.marginTop_20]} source={ImageSrc.ICON_LOCATION} />
            </TouchableOpacity>
        </View>
    )
}

const isAllDaySelect = (params) => {
    const { data, selectDayKey } = params
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

const selectAllDay = (params) => {
    const {
        sortList,
        data,
        selectDayKey,
        weekDays,
        setWeekDays,
        setSortList,
        setIsEdit,
        setSelectData,
        setSelectedUserKey
    } = params
    const obj = {}
    if (_.isEmpty(sortList)) {
        return
    }
    if (isAllDaySelect({ data, selectDayKey })) {
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

const handleSelectAll = (params) => {
    const { data, weekDays, setWeekDays, setSortList, selectDayKey, setIsEdit, setSelectData, setSelectedUserKey } =
        params
    for (const weekKey in data) {
        if (Object.keys(data[weekKey]).length === 0) {
            continue
        }
        for (const key in data[weekKey]) {
            data[weekKey][key].select = false
        }
        weekDays[weekKey] = false
    }
    setWeekDays(weekDays)
    setSortList(data[selectDayKey] || {})
    getSelectDayCount({ data, setIsEdit, setSelectData, setSelectedUserKey })
}

const selectAllWeekDay = (params) => {
    const {
        data,
        selectAll,
        weekDays,
        setWeekDays,
        setSortList,
        selectDayKey,
        setIsEdit,
        setSelectData,
        setSelectedUserKey
    } = params
    if (_.isEmpty(data)) {
        return
    }
    if (selectAll) {
        handleSelectAll({
            data,
            weekDays,
            setWeekDays,
            setSortList,
            selectDayKey,
            setIsEdit,
            setSelectData,
            setSelectedUserKey
        })
        return
    }
    if (isAllWeekSelectSD(data)) {
        handleWeekKeySelect({ data, weekDays, setWeekDays, setSortList, selectDayKey, select: false })
    } else {
        handleWeekKeySelect({ data, weekDays, setWeekDays, setSortList, selectDayKey, select: true })
    }
    getSelectDayCount({ data, setIsEdit, setSelectData, setSelectedUserKey })
}

const editMethod = (parmas) => {
    const {
        data,
        isEdit,
        weekDays,
        setWeekDays,
        setSortList,
        selectDayKey,
        setIsEdit,
        setSelectData,
        setSelectedUserKey
    } = parmas
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
            selectAllWeekDay({
                data,
                selectAll: true,
                weekDays,
                setWeekDays,
                setSortList,
                selectDayKey,
                setIsEdit,
                setSelectData,
                setSelectedUserKey
            })
        }
        setIsEdit(!isEdit)
    } else {
        setIsEdit(false)
    }
}

const isDaySelect = (sortList) => {
    for (const key in sortList) {
        if (sortList[key].select) {
            return true
        }
    }
    return false
}

const sortItemClickWithParams = (params) => {
    const {
        setSelectedItemKey,
        key,
        sortList,
        weekDays,
        selectDayKey,
        data,
        setIsEdit,
        setSelectData,
        setSelectedUserKey,
        setWeekDays,
        setSortList
    } = params
    setSelectedItemKey(key)
    sortList[key].select = !sortList[key].select
    const tempWeekDays = { ...weekDays }
    tempWeekDays[selectDayKey] = isDaySelect(sortList)
    getSelectDayCount({ data, setIsEdit, setSelectData, setSelectedUserKey })
    setWeekDays(tempWeekDays)
    setSortList({ ...sortList })
}

const sortListView = (params) => {
    const { sortList, sortListRef, isEdit, updateSequence, sortItemClick, renderRow } = params
    let view = (
        <View style={EmployeeDetailStyle.emptyView}>
            <View style={EmployeeDetailStyle.emptyCard}>
                <EmptyVisit style={EmployeeDetailStyle.emptyVisit} />
                <CText style={EmployeeDetailStyle.noVisitsText}>{t.labels.PBNA_MOBILE_NO_VISITS_BEEN_SCHEDULED}</CText>
            </View>
        </View>
    )
    if (!_.isEmpty(sortList)) {
        view = (
            <SortableList
                key={`id-${sortList?.id}`}
                style={[selectStyles.sortList, selectStyles.sortListContainer, styles.marginTop_15]}
                ref={sortListRef}
                data={sortList}
                decelerationRate={null}
                sortingEnabled={isEdit}
                onReleaseRow={updateSequence}
                onPressRow={sortItemClick}
                renderRow={renderRow}
                showsVerticalScrollIndicator={false}
            />
        )
    }
    return view
}

const getVisitsLabel = (sortList) => {
    const temp =
        isObject(sortList) && Object.keys(sortList).length === 1
            ? t.labels.PBNA_MOBILE_VISIT
            : t.labels.PBNA_MOBILE_VISITS
    return isObject(sortList) ? temp : t.labels.PBNA_MOBILE_VISITS
}

const visitView = (params) => {
    const {
        isEdit,
        isUnassignedSelected,
        sortList,
        selectData,
        deleteDataAlert,
        reassignModal,
        refMonthWeek,
        weekDays,
        weekDayClick,
        data,
        selectDayKey,
        setWeekDays,
        onUnassignClick,
        setSortList,
        setIsEdit,
        setSelectData,
        setSelectedUserKey,
        sortListRef,
        updateSequence,
        sortItemClick,
        renderRow,
        custNoVisits,
        hasUnassignedVisits
    } = params
    let isEditTemp = isEdit
    isEditTemp = !((isObject(sortList) && Object.keys(sortList).length <= 0) || !isObject(sortList))
    hasUnassignedVisits &&
        (componentArr.find((item) => item.name === t.labels.PBNA_MOBILE_VISITS.toUpperCase()).isError = true)
    return (
        <View style={screenWidthStyle}>
            {custNoVisits && (
                <MessageBar message={t.labels.PBNA_MOBILE_NoRecurVisitErr} containerStyle={styles.errBar} />
            )}
            {hasUnassignedVisits && (
                <MessageBar
                    message={t.labels.PBNA_MOBILE_NO_RECURRING_VISITS}
                    imageUrl={ImageSrc.ICON_UNASSIGNED_BANNER}
                    containerStyle={styles.errBar}
                />
            )}
            {selectData.length > 0 && (
                <View style={[selectStyles.selectedBox, commonStyle.marginTop_20, styles.marginHorizontal_20]}>
                    <View style={selectStyles.boxTitle}>
                        <CText style={selectStyles.selectedVisit}>
                            {selectData.length}
                            {` ${t.labels.PBNA_MOBILE_RECURRING_VISIT_SELECTED}`}
                        </CText>
                    </View>
                    <View style={selectStyles.btnGroup}>
                        <TouchableOpacity
                            style={selectStyles.flexRowCenter}
                            onPress={() => {
                                !isUnassignedSelected && onUnassignClick && onUnassignClick()
                            }}
                        >
                            <Image
                                source={IMG_MODAL_CLEAR}
                                style={isUnassignedSelected ? selectStyles.inactiveBtnIcon : selectStyles.btnIcon}
                            />
                            <CText style={isUnassignedSelected ? selectStyles.inactiveBtnText : selectStyles.btnText}>
                                {t.labels.PBNA_MOBILE_UNASSIGN}
                            </CText>
                        </TouchableOpacity>
                        <TouchableOpacity style={selectStyles.flexRowCenter} onPress={() => deleteDataAlert()}>
                            <Image source={IMG_MODAL_DELETE} style={selectStyles.btnIcon} />
                            <CText style={selectStyles.btnText}>{t.labels.PBNA_MOBILE_DELETE.toUpperCase()}</CText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={selectStyles.flexRowCenter}
                            onPress={() => onReassignClick(reassignModal)}
                        >
                            <Image source={IMG_MODAL_REASSIGN} style={selectStyles.btnIcon} />
                            <CText style={selectStyles.btnText}>{t.labels.PBNA_MOBILE_REASSIGN.toUpperCase()}</CText>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            <View style={[selectStyles.weekContainer, styles.marginHorizontal_20]}>
                <MonthWeek
                    cRef={refMonthWeek}
                    weekDays={weekDays}
                    onclick={weekDayClick}
                    type={MonthWeekType.MonthWeekType_WithoutDay}
                />
            </View>
            <View style={[selectStyles.checkBoxContainer, styles.marginHorizontal_20, styles.checkBoxContainerHeight]}>
                <CText style={[selectStyles.checkBoxTitle, styles.visitsCountHeight]}>
                    {!_.isEmpty(sortList) ? Object.keys(sortList).length : 0} {getVisitsLabel(sortList)}
                </CText>
                <View style={[styles.rowCenter, styles.checkBoxRowStyle]}>
                    {isEditTemp && isEdit && (
                        <View style={[selectStyles.checkBoxItemContainer]}>
                            <CCheckBox
                                onPress={() =>
                                    selectAllDay({
                                        sortList,
                                        data,
                                        selectDayKey,
                                        weekDays,
                                        setWeekDays,
                                        setSortList,
                                        setIsEdit,
                                        setSelectData,
                                        setSelectedUserKey
                                    })
                                }
                                title={
                                    <CText style={selectStyles.checkBoxItemText}>
                                        {t.labels.PBNA_MOBILE_FULL_DAY.toLocaleUpperCase()}
                                    </CText>
                                }
                                checked={isAllDaySelect({ data, selectDayKey })}
                                containerStyle={selectStyles.checkBoxItem}
                            />
                            <CCheckBox
                                onPress={() =>
                                    selectAllWeekDay({
                                        data,
                                        selectAll: false,
                                        weekDays,
                                        setWeekDays,
                                        setSortList,
                                        selectDayKey,
                                        setIsEdit,
                                        setSelectData,
                                        setSelectedUserKey
                                    })
                                }
                                title={
                                    <CText style={selectStyles.checkBoxItemText}>
                                        {t.labels.PBNA_MOBILE_FULL_WEEK.toLocaleUpperCase()}
                                    </CText>
                                }
                                checked={isAllWeekSelectSD(data)}
                                containerStyle={selectStyles.checkBoxItem}
                            />
                        </View>
                    )}
                    <TouchableOpacity
                        hitSlop={commonStyle.smallHitSlop}
                        onPress={() => {
                            isEditTemp &&
                                editMethod({
                                    data,
                                    isEdit,
                                    weekDays,
                                    setWeekDays,
                                    setSortList,
                                    selectDayKey,
                                    setIsEdit,
                                    setSelectData,
                                    setSelectedUserKey
                                })
                        }}
                        style={[styles.marginLeft_20]}
                    >
                        <CText
                            style={[
                                isEditTemp ? selectStyles.editActiveTitle : selectStyles.editDisableTitle,
                                styles.lineHeight_35
                            ]}
                        >
                            {isEditTemp && isEdit ? t.labels.PBNA_MOBILE_DONE : t.labels.PBNA_MOBILE_EDIT}
                        </CText>
                    </TouchableOpacity>
                </View>
            </View>
            {sortListView({ sortList, sortListRef, isEdit, updateSequence, sortItemClick, renderRow })}
        </View>
    )
}

const getCountCallback = (params) => {
    const { event, setTotalAssign, setAddModalVisible, setUpdateSDModalVisible } = params
    if (event.count) {
        setTotalAssign(String(event.count))
        setAddModalVisible(true)
    } else {
        setUpdateSDModalVisible(true)
    }
}
const isCustomerInActive = (customerData: any) => {
    return customerData && customerData.merchandisingBase && !customerData.isActive
}
const isNoRDInactive = (customerData: any) => {
    return customerData && customerData.merchandisingBase && !customerData.activeDP
}

export const wStatusView = (wStatus, index, fontSizeStyle = styles.fontSize_16) => {
    return (
        <CText
            key={index}
            style={
                wStatus.attend
                    ? [fontSizeStyle, styles.fontWeight_700, styles.fontColor_black, styles.marginRight_8]
                    : [fontSizeStyle, styles.fontWeight_700, styles.fontColor_lightGary, styles.marginRight_8]
            }
        >
            {wStatus.label}
        </CText>
    )
}
const noRecurringVisitsError = (data: any) => {
    const tempData = Object.values(data)
    let visitCount = 0
    tempData.forEach((item: any) => {
        visitCount += Object.values(item).length
    })
    return !visitCount
}
const configureTabComponentsArr = (customerData, data, isFirstTimeEntered, customerDetail) => {
    const componentTabs = componentArr
    const isInActive = isCustomerInActive(customerData)
    const isNoRD = isNoRDInactive(customerData)
    const noReCurVisits = noRecurringVisitsError(data)
    const hasUnassigned = hasUnassignedError(data)
    componentTabs[0].isError = isInActive || isNoRD
    componentTabs[1].isError = (noReCurVisits && !isFirstTimeEntered) || hasUnassigned

    const findComponentArrIndex = (tabName: any, tabs: any) => {
        return tabs?.findIndex((tab: any) => tabName === tab.name)
    }

    if (customerDetail && customerDetail['Account.BUSN_SGMNTTN_LVL_3_CDV__c'] === '003') {
        componentTabs.splice(findComponentArrIndex(t.labels.PBNA_MOBILE_PROFILE.toUpperCase(), componentTabs) + 1, 0, {
            name: t.labels.PBNA_MOBILE_POS.toUpperCase(),
            isError: false
        })
    }
    return { isInActive, isNoRD, noReCurVisits, componentTabs }
}
const CustomerDetail = ({ route, navigation }: CustomerDetailProps) => {
    componentArr = [
        { name: t.labels.PBNA_MOBILE_OVERVIEW.toUpperCase(), isError: false },
        { name: t.labels.PBNA_MOBILE_VISITS.toUpperCase(), isError: false },
        { name: t.labels.PBNA_MOBILE_MY_STORE.toUpperCase(), isError: false },
        { name: t.labels.PBNA_MOBILE_EQUIPMENT.toUpperCase(), isError: false },
        { name: t.labels.PBNA_MOBILE_PROFILE.toUpperCase(), isError: false },
        { name: t.labels.PBNA_MOBILE_ACTIVITIES.toUpperCase(), isError: false },
        { name: t.labels.PBNA_MOBILE_SALES_SNAPSHOT.toUpperCase(), isError: false },
        { name: t.labels.PBNA_MOBILE_CONTACTS.toUpperCase(), isError: false }
    ]
    const manager = useSelector(managerReducer)
    const { customerData, mapInfo, actTab } = route.params
    const [isActive, setActiveTab] = useState(0)
    const [storeTabVisible, setStoreTabVisible] = useState(false)
    const [data, setData] = useState({})
    const [userData, setUserData] = useState([])
    const [selectData, setSelectData] = useState([])
    const [deleteSelectData, setDeleteSelectData] = useState({})
    const [weekDays, setWeekDays] = useState({})
    const [selectDayKey, setSelectDayKey] = useState(null)
    const [sortList, setSortList] = useState({})
    const [isEdit, setIsEdit] = useState(false)
    const [totalDelete, setTotalDelete] = useState('1')
    const [totalUnassign, setTotalUnassign] = useState('1')
    const [totalAssign, setTotalAssign] = useState('1')
    const [modalVisible, setModalVisible] = useState(false)
    const [addModalVisible, setAddModalVisible] = useState(false)
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [unassignModalVisible, setUnassignModalVisible] = useState(false)
    const [selectedItemKey, setSelectedItemKey] = useState(-1)
    const [selectedUserKey, setSelectedUserKey] = useState([])
    const [tabComponentArr, setTabComponentArr] = useState(componentArr)
    const [custInActive, setCustInActive] = useState(false)
    const [custNoRD, setCustNoRD] = useState(false)
    const [custNoVisits, setCustNoVisits] = useState(false)
    let selectedReassignUser = {}
    const scrollViewRef: any = useRef()
    const scrollTabRef: any = useRef()
    const refMonthWeek: any = useRef()
    const sortListRef = useRef<SortableList<any>>()
    const reassignModal: any = useRef()
    const deleteResultModal = useRef(null)
    const unassignResultModal = useRef(null)
    const reassignResultModal = useRef(null)
    const addResultModal = useRef(null)
    const logCallFormRef = useRef(null)
    const contactCreationFormRef = useRef(null)
    const geoFenceSuccessRef = useRef<SuccessViewRef>(null)
    const scrollYAnimatedValue = useRef(new Animated.Value(0)).current
    const requestPosModalRef = useRef<FullScreenModalRef>(null)
    const { headerLeftChevronColor } = useDetailScreenHeaderTabAnimation(scrollYAnimatedValue)
    const { dropDownRef } = useDropDown()
    const [resultModalVisible, setResultModalVisible] = useState(false)
    const [updateSDModalVisible, setUpdateSDModalVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [periodCalendar, setPeriodCalendar] = useState([])
    const [offlineLoading, setOfflineLoading] = useState<boolean>(false)

    const [isErrorShow, setIsErrorShow] = useState(false)
    const lineCodeMap = manager.lineCodeMap
    const [goCartChecked, onGoCartChecked] = useState(false)
    const [isUnassignedSelected, setIsUnassignedSelected] = useState(false)
    const [hasUnassignedVisits, setHasUnassignedVisits] = useState(false)
    const [refreshFlag, setRefreshFlag] = useState(0)
    const dispatch = useDispatch()
    const [, setShowInitLoadingIndicator] = useState(false)
    const { retailStoreDetail } = useGetRetailStore(customerData.accountId, refreshFlag)
    const customerDetail: any = useCustomerDetail(
        { AccountId: customerData.accountId },
        refreshFlag,
        dispatch,
        retailStoreDetail
    )
    const distributionPointList = useCustomerDistributionPoints(customerDetail?.AccountId, refreshFlag)
    useInitCustomerDetail(
        customerDetail?.AccountId,
        customerDetail?.Id,
        setRefreshFlag,
        setShowInitLoadingIndicator,
        dispatch
    )
    useInitStoreProductData(customerDetail?.Id, setRefreshFlag)
    const [assetSearchValue, setAssetSearchValue] = useState('')
    const { equipmentList, isEquipmentListLoading } = useEquipmentAssets(
        isLoading,
        customerDetail?.AccountId,
        refreshFlag,
        assetSearchValue
    )
    const requestList = useService(customerDetail?.AccountId, isLoading, refreshFlag, 'RetailStore')
    const posList = usePOSListHooks(customerDetail, refreshFlag)
    const { deliveryList, preSellDetailList, merDetailList, historyTaskList, openTaskList } = useCustomerActivity(
        customerDetail,
        isLoading,
        refreshFlag
    )
    const invoiceHeader = useCustomerInvoiceHeader(customerDetail['Account.CUST_ID__c'])
    const customerContactTabRef = useRef(null)
    const customerProfileTabRef = useRef(null)
    const equipmentTabRef = useRef(null)
    const userList = useInternalContacts(customerDetail?.AccountId, isLoading, refreshFlag)
    const [customerProfileTabEditCount, setCustomerProfileTabEditCount] = useState({ editCount: 0, disableSave: false })
    const [selectEquipmentCount, setSelectEquipmentCount] = useState(0)
    const [activeServiceTypes, setActiveServiceTypes] = useState([
        {
            serviceType: 'Move',
            serviceIndex: 0,
            serviceActive: false
        },
        {
            serviceType: 'Pickup',
            serviceIndex: 1,
            serviceActive: false
        },
        {
            serviceType: 'Repair',
            serviceIndex: 2,
            serviceActive: false
        },
        {
            serviceType: 'Exchange',
            serviceIndex: 3,
            serviceActive: false
        }
    ])
    const [isFirstTimeEntered, setIsFirstTimeEntered] = useState(true)
    const locationGoCart = useLocationLevelGoCart()
    const [isSyncingAssetAttr, setIsSyncingAssetAttr] = useState(false)
    const priceGroup = usePriceGroupWithRequest(customerDetail)
    const contractRef = useRef(null)
    const selectGeoFenceTypeModal = useRef(null)
    const [geoFenceData, setGeoFenceData] = useState<GeoFenceProps>(DefaultGeoFence)
    const [showContractUploadBar, setShowContractUploadBar] = useState(false)

    const showReassignResult = async (event: any) => {
        setTotalAssign(String(event.count))
        setSelectData([])
        setModalVisible(true)
        sortListRef?.current?._scrollView?.scrollTo({ x: 0, y: 0, animated: true })
    }

    const businessSegMap = (businessSeg: 'Large Format' | 'Small Format' | 'FoodService') => {
        const businessSegObj = {
            'Large Format': t.labels.PBNA_MOBILE_LARGE_FORMAT,
            'Small Format': t.labels.PBNA_MOBILE_SMALL_FORMAT,
            FoodService: t.labels.PBNA_MOBILE_FOOD_SERVICE
        }
        return businessSeg ? businessSegObj[businessSeg] : ''
    }

    Object.assign(customerData, { Id: customerData.id, AcccountId: customerData.accountId })
    const { breakdownData, productMixData, lineChartData, toplineMetricsData, pdpData } = useSalesSnapshotData(
        customerDetail,
        periodCalendar,
        'YTD'
    )

    const reassignItemClick = async (user) => {
        try {
            selectedReassignUser = user
            reassignModal.current?.closeModal()
            setIsLoading(true)
            const CTRRecordTypeId = await getRecordTypeIdByDeveloperName('CTR', 'Customer_to_Route__c')
            const dataCheck = await checkDataForReassignSD(user, selectData, CTRRecordTypeId)
            if (!dataCheck) {
                setIsLoading(false)
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
                setIsLoading(false)
                setIsErrorShow(true)
                return
            }
            if (_.isEmpty(user.customerIdMap[customerData.accountId])) {
                createCTRData({ user, customerData, dropDownRef }).then(async (customerRouteId) => {
                    const userId = user.id
                    await reassignData({
                        selectData,
                        customerData,
                        customerRouteId,
                        userId,
                        dropDownRef,
                        refMonthWeek,
                        setSelectDayKey,
                        setUserData,
                        showReassignResult,
                        setIsLoading,
                        data,
                        selectedReassignUser,
                        setData,
                        setWeekDays,
                        setIsEdit,
                        setSelectData,
                        setSelectedUserKey,
                        setSortList,
                        selectDayKey,
                        lineCodeMap
                    })
                })
            } else {
                const customerRouteId = user.customerIdMap[customerData.accountId]
                const userId = user.id
                await reassignData({
                    selectData,
                    customerData,
                    customerRouteId,
                    userId,
                    dropDownRef,
                    refMonthWeek,
                    setSelectDayKey,
                    setUserData,
                    showReassignResult,
                    setIsLoading,
                    data,
                    selectedReassignUser,
                    setData,
                    setWeekDays,
                    setIsEdit,
                    setSelectData,
                    setSelectedUserKey,
                    setSortList,
                    selectDayKey,
                    lineCodeMap
                })
            }
        } catch (error) {
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_CUSTOMER_DETAIL_CREATE_CTR_DATA,
                error
            )
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getPepsiCoPeriodCalendar().then((result: any[]) => {
            setPeriodCalendar(result)
            dispatch(setPepsicoCalendar(result))
        })
    }, [])

    useEffect(() => {
        scrollView({ selectData, sortListRef, selectedItemKey })
        if (!_.isEmpty(selectData) && Array.isArray(selectData)) {
            let isAllUnassign = true
            selectData.forEach((item) => {
                if (item.isUnassigned === false) {
                    isAllUnassign = false
                }
            })
            setIsUnassignedSelected(isAllUnassign)
        }
    }, [selectData])

    useEffect(() => {
        const { isInActive, isNoRD, noReCurVisits, componentTabs } = configureTabComponentsArr(
            customerData,
            data,
            isFirstTimeEntered,
            customerDetail
        )
        const findComponentArrIndex = componentTabs.findIndex(
            (tab: any) => t.labels.PBNA_MOBILE_EQUIPMENT.toUpperCase() === tab.name
        )

        if (findComponentArrIndex !== -1) {
            componentTabs.splice(findComponentArrIndex + 1, 0, {
                name: t.labels.PBNA_MOBILE_CONTRACT_AUDIT.toUpperCase(),
                isError: false
            })
        }
        setTabComponentArr(componentTabs)
        setCustInActive(isInActive)
        setCustNoRD(isNoRD)
        setCustNoVisits(noReCurVisits)
        watchHasUnassignedVisits({ visits: data, setHasUnassignedVisits })
    }, [data, customerDetail, weekDays])
    useEffect(() => {
        setIsLoading(true)
        retrieveInternalContact(customerData?.accountId)
        getCustomerData({ dropDownRef, customerDetail: true, customerData }).then((store: any) => {
            const { visits } = store
            setIsFirstTimeEntered(false)
            watchHasUnassignedVisits({ visits, setHasUnassignedVisits })
            refreshView({
                selectDayKey,
                setData,
                setWeekDays,
                refMonthWeek,
                setSelectDayKey,
                setSortList,
                store,
                customerDetail: true
            })
            getUserData(dropDownRef).then((users: Array<any>) => {
                setUserData(users)
            })
            setIsLoading(false)
        })
        // when swipe back to previous page
        navigation.addListener(EventEmitterType.BEFORE_REMOVE, () => {
            NativeAppEventEmitter.emit(EventEmitterType.REFRESH_MY_CUSTOMERS)
        })
        return () => {
            navigation.removeListener(EventEmitterType.BEFORE_REMOVE)
        }
    }, [modalVisible, deleteModalVisible === true])

    const dataCheckAndDelete = async () => {
        setIsLoading(true)
        const dataCheck = await checkDataForCTRAndSD(selectData)
        if (!dataCheck) {
            setIsLoading(false)
            setIsErrorShow(true)
            return
        }
        deleteData({
            data,
            selectData,
            setDeleteSelectData,
            deleteSelectData,
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
            userData,
            refMonthWeek,
            setSelectDayKey,
            customerData,
            setUserData,
            setIsLoading,
            lineCodeMap
        })
    }

    useEffect(() => {
        AssetAttributeService.syncLatestAssetAttributeWithLoading(setIsSyncingAssetAttr)
        const refresh = NativeAppEventEmitter.addListener(EventEmitterType.REFRESH_CUSTOMER_SD, async (event) => {
            getCountCallback({ event, setTotalAssign, setAddModalVisible, setUpdateSDModalVisible })
            await syncDownDataByTableNames(MerchManagerScreenMapping.ServiceDetailRelated)
            const store = await getCustomerData({ dropDownRef, customerDetail: true, customerData })
            refreshView({
                selectDayKey,
                setData,
                setWeekDays,
                refMonthWeek,
                setSelectDayKey,
                setSortList,
                store,
                select: event.selectDayKey,
                customerDetail: true
            })
            setIsLoading(false)
        })

        const geoFenceNotificationEmitter = NativeAppEventEmitter.addListener(GeoFenceUpdateSuccessEvent, () => {
            geoFenceSuccessRef.current?.openModal()
        })
        return () => {
            refresh && refresh.remove()
            geoFenceNotificationEmitter && geoFenceNotificationEmitter.remove()
        }
    }, [])

    const updateSequence = async (key, order) => {
        setIsLoading(true)
        const dataCheck = await checkDataForCTRAndSD(Object.values(data[selectDayKey]))
        if (!dataCheck) {
            setIsLoading(false)
            setIsErrorShow(true)
            return
        }
        await updateSequenceWithParams({
            order,
            sortList,
            setSortList,
            data,
            selectDayKey,
            dropDownRef,
            setData,
            setWeekDays,
            refMonthWeek,
            setSelectDayKey,
            customerData,
            lineCodeMap,
            setIsLoading
        })
    }

    const deleteDataAlert = () => {
        Alert.alert(t.labels.PBNA_MOBILE_DELETE_RECURRING_VISITS, t.labels.PBNA_MOBILE_DELETE_RECURRING_VISITS_MSG, [
            { text: t.labels.PBNA_MOBILE_NO },
            {
                text: t.labels.PBNA_MOBILE_YES_DELETE,
                onPress: () => dataCheckAndDelete()
            }
        ])
    }

    const weekDayClick = (val) => {
        const value = val.weekLabel
        changeDay({ value, setSelectDayKey, setSortList, data, sortListRef })
    }

    const goToDetails = (item) => {
        navigation.navigate(NavigationRoute.RECURRING_VISIT_DETAIL, {
            detailData: item,
            allWeekData: data,
            updatePullNumFromCustomerView: true,
            customerData,
            isFromCustomer: true
        })
    }

    const renderRow = ({ data, index }: { data: any; index: any; key: any }) => {
        return (
            <ServiceDetailEmployeeCell onCellPress={goToDetails} isEdit={isEdit} disabled item={data} index={index} />
        )
    }

    const scrollViewOffsetPage = (index) => {
        scrollViewRef.current.scrollTo({ y: 0, x: screenWidth * index })
        setActiveTab(index)
        if (index === 2) {
            setStoreTabVisible(true)
        }
    }

    const profileIndex = 5
    useEffect(() => {
        if (actTab && actTab === ActiveTabName.PROFILE && retailStoreDetail?.Id) {
            scrollViewOffsetPage(profileIndex)
            scrollTabRef.current.scrollTo({ y: 0, x: screenWidth })
        }
    }, [retailStoreDetail?.Id])

    const calculateServiceRequestFormButtonLabel = () => {
        const activeServiceTypeObj = activeServiceTypes.find((serviceType) => serviceType.serviceActive)
        if (activeServiceTypeObj) {
            if (activeServiceTypeObj.serviceType === 'Repair') {
                return t.labels.PBNA_MOBILE_CONFIRM_ONE_ASSET.toUpperCase()
            }
            return `${
                t.labels.PBNA_MOBILE_CONFIRM
            } ${selectEquipmentCount} ${t.labels.PBNA_MOBILE_ASSET_S.toUpperCase()}`
        }
        return ''
    }

    const onRemoveEmployeeClick = async () => {
        setIsLoading(true)
        const rsCheck = await dataCheckWithAction('RetailStore', `WHERE Id='${customerData?.id}'`, '', false)
        const accountCheck = await dataCheckWithAction('Account', `WHERE Id='${customerData?.accountId}'`, '', false)
        if (!rsCheck || !accountCheck) {
            setIsLoading(false)
            setIsErrorShow(true)
            return
        }
        setIsLoading(false)
        onRemoveCustomerBtnClick({
            updateVal: BooleanStr.STR_FALSE,
            selectedCustomer: customerData,
            setIsLoading,
            setResultModalVisible,
            navigation,
            dropDownRef
        })
    }

    const bindingAccountGoCart = async () => {
        const accountIfo = await SoupService.retrieveDataFromSoup(
            'Account',
            {},
            getObjByName('Account').syncUpCreateFields,
            getObjByName('Account').syncUpCreateQuery + ` WHERE {Account:Id} = '${customerData.accountId}'`
        )
        onGoCartChecked(accountIfo[0]?.Go_Kart_Flag__c === BooleanStr.STR_TRUE)
    }
    const onGoCartClick = async () => {
        try {
            setIsLoading(true)
            onGoCartChecked(!goCartChecked)
            const accountIfo = await SoupService.retrieveDataFromSoup(
                'Account',
                {},
                getObjByName('Account').syncUpCreateFields,
                getObjByName('Account').syncUpCreateQuery + ` WHERE {Account:Id} = '${customerData.accountId}'`
            )
            accountIfo[0].Go_Kart_Flag__c = !goCartChecked
            customerDetail['Account.Go_Kart_Flag__c'] = goCartChecked ? BooleanStr.STR_FALSE : BooleanStr.STR_TRUE
            await syncUpObjUpdateFromMem(
                'Account',
                filterExistFields('Account', [...accountIfo], getObjByName('Account').syncUpCreateFields)
            )
            setIsLoading(false)
        } catch (e) {
            setIsLoading(false)
            onGoCartChecked(!goCartChecked)
            storeClassLog(Log.MOBILE_ERROR, 'CustomerDetail.onGoCartClick', getStringValue(e))
        }
    }

    const throttledOnClickPushContract = _.throttle(
        async () => {
            if (offlineLoading) {
                return
            }
            setOfflineLoading(true)
            await contractRef?.current?.onClickPushContract()
        },
        IntervalTime.ONE_THOUSAND,
        { leading: true, trailing: false }
    )

    const onEditGeoFence = (data: GeoFenceProps) => {
        setGeoFenceData(data)
        selectGeoFenceTypeModal?.current?.openModal()
    }

    const onSelectGeoFenceType = (type: GEO_FENCE_TYPE) => {
        navigation.navigate('EditGeoFence', {
            navigation,
            type,
            geoFenceData,
            accountId: retailStoreDetail.AccountId || retailStoreDetail['Account.Id']
        })
    }

    useEffect(() => {
        bindingAccountGoCart()
    }, [])

    const containerStyle = { width: screenWidth, height: Dimensions.get('window').height - 278 }
    const overView = (custInActive, custNoRD) => {
        return (
            <ScrollView style={containerStyle}>
                <View style={styles.errContainer}>
                    {custInActive && (
                        <MessageBar message={t.labels.PBNA_MOBILE_InActiveErr} containerStyle={styles.errBar} />
                    )}
                    {custNoRD && (
                        <MessageBar
                            message={t.labels.PBNA_MOBILE_NoRDErr}
                            containerStyle={[styles.errBar, styles.secErrBarSpace]}
                        />
                    )}
                </View>
                <View key={`View-${customerData.id}`} style={styles.daysViewContainer}>
                    <View key={`${customerData.cof}-${customerData.busnLvl3}`} style={styles.daysViewRowContainer}>
                        <View key={`COF-${customerData.cof}`} style={styles.daysViewRowItemView}>
                            <CText style={styles.daysViewRowItemTitle}>{t.labels.PBNA_MOBILE_CUSTOMER_NUMBER}</CText>
                            <CText style={styles.daysViewRowItemValue} numberOfLines={2}>
                                {customerData.cof}
                            </CText>
                        </View>
                        <View key={`BSL-${customerData.busnLvl3}`} style={styles.daysViewRowItemView}>
                            <CText style={styles.daysViewRowItemTitle}>{t.labels.PBNA_MOBILE_BUSINESS_SEGMENT}</CText>
                            <CText style={styles.daysViewRowItemValue} numberOfLines={2}>
                                {businessSegMap(customerData.busnLvl3 || '')}
                            </CText>
                        </View>
                    </View>
                    <View key={`OD-${customerData.id}`} style={[styles.daysViewRowContainer, styles.paddingTop_15]}>
                        <View style={styles.daysViewRowItemView}>
                            <CText style={styles.daysViewRowItemTitle}>{t.labels.PBNA_MOBILE_ORDER_DAYS}</CText>
                            <View style={styles.daysViewRowItemDayItemView}>
                                {customerData.orderDays.map((wStatus, index) => {
                                    return wStatusView(wStatus, index)
                                })}
                            </View>
                        </View>
                        <View style={styles.daysViewRowItemView}>
                            <CText style={styles.daysViewRowItemTitle}>{t.labels.PBNA_MOBILE_DELIVERY_DAYS}</CText>
                            <View style={styles.daysViewRowItemDayItemView}>
                                {customerData.deliveryDays.map((wStatus, index) => {
                                    return wStatusView(wStatus, index)
                                })}
                            </View>
                        </View>
                    </View>
                </View>
                {locationGoCart && (
                    <View style={styles.goCartView}>
                        <CCheckBox
                            disabled={!isPersonaMerchManager()}
                            readonly={!isPersonaMerchManager()}
                            hitSlop={commonStyle.hitSlop}
                            checked={goCartChecked}
                            onPress={() => onGoCartClick()}
                            title={<CText style={commonStyle.marginLeft_5}>{t.labels.PBNA_MOBILE_GOKART}</CText>}
                            containerStyle={styles.goCartContainer}
                        />
                    </View>
                )}
                <View
                    key={`Detail-${customerData.id}`}
                    style={[commonStyle.marginTop_20, commonStyle.marginHorizontal_20]}
                >
                    {renderUserItem(customerData)}
                </View>
                <View key={`ISM-${customerData.id}`} style={styles.mapImage}>
                    <InStoreMap visit={{ storeId: customerData.id, name: customerData.retailStoreName }} isOnline />
                </View>

                <TouchableOpacity
                    key={`Delete-${customerData.id}`}
                    onPress={() => onRemoveEmployeeClick()}
                    style={styles.deleteBtn}
                >
                    <CText style={styles.deleteBtnText}>{t.labels.PBNA_MOBILE_REMOVE_CUSTOMER}</CText>
                </TouchableOpacity>
            </ScrollView>
        )
    }

    const profileTab = (navigation) => {
        return (
            <ScrollView style={containerStyle}>
                <CustomerProfileTab
                    navigation={navigation}
                    retailStore={customerDetail}
                    distributionPointList={distributionPointList}
                    setCustomerProfileTabEditCount={setCustomerProfileTabEditCount}
                    cRef={customerProfileTabRef}
                    setRefreshFlag={setRefreshFlag}
                    readonly={false}
                    refreshFlag={refreshFlag}
                    priceGroup={priceGroup}
                    onEditGeoFence={onEditGeoFence}
                />
                <View style={styles.gap} />
            </ScrollView>
        )
    }
    const handleContactIngestFinished = () => {
        customerContactTabRef?.current?.addCount()
    }

    const activityTab = (navigation) => {
        return (
            <ScrollView style={screenWidthStyle}>
                <CustomerActivityTab
                    deliveryDetailList={deliveryList}
                    preSellDetailList={preSellDetailList}
                    merDetailList={merDetailList}
                    historyTaskList={historyTaskList}
                    navigation={navigation}
                    dropDownRef={dropDownRef}
                    openTaskList={openTaskList}
                    taskId={route?.params?.taskId}
                    showDetail={route?.params?.showDetail}
                    setRefreshFlag={setRefreshFlag}
                    retailStore={customerDetail}
                    onAddContact={handleContactIngestFinished}
                    invoiceHeader={invoiceHeader}
                />
            </ScrollView>
        )
    }
    const contractTab = () => {
        return (
            <View>
                <ScrollView style={[screenWidthStyle, styles.contractTabBackgroundColor]}>
                    {
                        <CustomerContractTab
                            refreshFlag={refreshFlag}
                            offlineLoading={offlineLoading}
                            setOfflineLoading={setOfflineLoading}
                            setRefreshFlag={setRefreshFlag}
                            cRef={contractRef}
                            retailStore={customerDetail}
                            editable
                            setShowContractUploadBar={setShowContractUploadBar}
                        />
                    }
                </ScrollView>
                {showContractUploadBar && (
                    <View style={styles.pushOrderBarBox}>
                        <PushOrderBar
                            icon={ImageSrc.ICON_PUSH_ORDER}
                            text={
                                `${customerDetail['Account.CUST_UNIQ_ID_VAL__c'] || ''} ` +
                                t.labels.PBNA_MOBILE_CONTRACT_NOT_SUBMITTED
                            }
                            buttonText={t.labels.PBNA_MOBILE_PUSH_ORDER_BUTTON.toLocaleUpperCase()}
                            onPress={throttledOnClickPushContract}
                            disabled={offlineLoading}
                        />
                    </View>
                )}
            </View>
        )
    }

    const equipment = () => {
        return (
            <ScrollView style={containerStyle}>
                {isActive === 3 && (
                    <EquipmentTab
                        retailStore={customerDetail}
                        accountId={customerDetail?.AccountId}
                        equipmentList={equipmentList}
                        navigation={navigation}
                        isLoading={isLoading}
                        requestList={requestList}
                        onSave={() => {
                            setRefreshFlag((v) => v + 1)
                        }}
                        cRef={equipmentTabRef}
                        selectEquipmentCount={selectEquipmentCount}
                        setSelectEquipmentCount={setSelectEquipmentCount}
                        activeServiceTypes={activeServiceTypes}
                        setActiveServiceTypes={setActiveServiceTypes}
                        readonly={false}
                        assetSearchValue={assetSearchValue}
                        setAssetSearchValue={setAssetSearchValue}
                        isEquipmentListLoading={isEquipmentListLoading}
                    />
                )}
            </ScrollView>
        )
    }

    const renderPosView = () => {
        if (!customerDetail || customerDetail['Account.BUSN_SGMNTTN_LVL_3_CDV__c'] !== '003') {
            return null
        }
        return (
            <View style={styles.grayBg}>
                <ScrollView>
                    <POSView
                        ref={requestPosModalRef}
                        customer={customerDetail}
                        posList={posList}
                        setRefreshListFlag={setRefreshFlag}
                    />
                </ScrollView>
                <View style={styles.posBtn}>
                    <CustomerEquipmentReqButton
                        label={t.labels.PBNA_MOBILE_REQUEST_NEW_POS.toUpperCase()}
                        disable={_.some(posList, { tagTitle: 'Delivery Pending' })}
                        handlePress={() => {
                            requestPosModalRef.current?.openModal()
                        }}
                    />
                </View>
            </View>
        )
    }

    const contacts = () => {
        return (
            <ScrollView style={containerStyle}>
                <CustomerContactTab
                    retailStore={customerDetail}
                    cRef={customerContactTabRef}
                    userList={userList}
                    onIngest={() => {}}
                />
            </ScrollView>
        )
    }

    const sortItemClick = (key) => {
        sortItemClickWithParams({
            setSelectedItemKey,
            key,
            sortList,
            weekDays,
            selectDayKey,
            data,
            setIsEdit,
            setSelectData,
            setSelectedUserKey,
            setWeekDays,
            setSortList
        })
    }

    const onBackPress = () => {
        navigation.goBack()
    }

    const onAddBtnClick = async () => {
        setIsLoading(true)
        await syncDownDataByTableNames(MerchManagerScreenMapping.ServiceDetailRelated)
        setIsLoading(false)
        navigation.navigate(NavigationRoute.ADD_RECURRING_VISIT, {
            data,
            customerData,
            mapInfo,
            selectDayKey
        })
    }

    const calculateUnassignedVisit = (selectedData) => {
        let cnt = 0
        if (!_.isEmpty(selectedData) && Array.isArray(selectedData)) {
            selectedData.forEach((item) => {
                if (item.isUnassigned === false) {
                    cnt++
                }
            })
        }
        setTotalUnassign(cnt.toString())
    }

    const onUnassignClick = async () => {
        calculateUnassignedVisit(selectData)
        const result = await unassignSDData({
            selectData,
            setSelectData,
            setIsErrorShow,
            setUploadLoading: setIsLoading
        })
        if (!result) {
            return
        }
        setUnassignModalVisible(true)
        setHasUnassignedVisits(true)
        const tempWeekDays = {}
        for (const weekKey in data) {
            if (Object.keys(data[weekKey]).length > 0) {
                tempWeekDays[weekKey] = false
            }
        }
        setWeekDays(tempWeekDays)
    }

    const handlePressAddContact = () => {
        contactCreationFormRef?.current?.open()
    }

    useEffect(() => {
        ;(async () => await checkAndRefreshEquipmentSharePoint())()
    }, [])

    const renderMyStoreTab = () => {
        return (
            <CustomerMyStoreTab
                isOTSCustomer={retailStoreDetail?.['Account.IsOTSCustomer__c']}
                storeTabVisible={storeTabVisible}
                retailStoreId={customerData?.id}
                accountId={customerData?.accountId}
                retailStoreName={customerData?.retailStoreName}
                customerUniqueVal={customerData?.customId}
                isOnline
                storePropertyId={retailStoreDetail?.MapstedPropertyId__c}
            />
        )
    }

    const screenHeight = { height: kScreenHeight / 18 }
    return (
        <View style={[styles.container]}>
            {isActive === 3 && (
                <View style={[styles.topRightButton, screenHeight]}>
                    <CustomerEquipmentReqButton
                        label={t.labels.PBNA_MOBILE_REQUEST_NEW_INSTALL.toUpperCase()}
                        disable={isSyncingAssetAttr}
                        handlePress={() => {
                            equipmentTabRef?.current?.openInstallRequestModal()
                        }}
                    />
                    {selectEquipmentCount > 0 && (
                        <FormBottomButton
                            onPressCancel={() => {
                                const tempActiveServiceTypes = _.cloneDeep(activeServiceTypes)
                                tempActiveServiceTypes.forEach((serviceType) => {
                                    serviceType.serviceActive = false
                                })
                                setActiveServiceTypes(tempActiveServiceTypes)
                            }}
                            onPressSave={() => {
                                equipmentTabRef?.current?.openServiceRequestModal()
                            }}
                            leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}
                            rightButtonLabel={calculateServiceRequestFormButtonLabel()}
                        />
                    )}
                </View>
            )}
            <View style={styles.dropDownStyle}>
                <LeadFloatButton
                    headerCircleColor={headerLeftChevronColor}
                    onPressContact={() => {
                        handlePressAddContact()
                    }}
                    onPressCall={() => {
                        logCallFormRef?.current?.open()
                    }}
                    onAddVisits={() => {
                        onAddBtnClick()
                    }}
                    l={customerDetail}
                />
                <LogCallForm
                    cRef={logCallFormRef}
                    onAddContact={handleContactIngestFinished}
                    onSave={() => {
                        setRefreshFlag((v) => v + 1)
                    }}
                    type={'RetailStore'}
                    customer={customerDetail}
                    isEdit={false}
                    editCall={''}
                />
                <View>
                    <ContactForm
                        cRef={contactCreationFormRef}
                        accountId={customerDetail.AccountId}
                        onIngestFinished={handleContactIngestFinished}
                        contactType={'RetailStore'}
                    />
                </View>
            </View>
            <ImageBackground source={ImageSrc.IMG_BACKGROUND} resizeMode="cover" style={styles.imageBg}>
                <View style={styles.imageBgView}>
                    <BackButton
                        navigation={navigation}
                        extraStyle={styles.tintColorWhite}
                        onBackPress={() => onBackPress()}
                    />
                    <CText style={styles.pageTitle}>{t.labels.PBNA_MOBILE_CUSTOMER_PROFILE}</CText>
                    <View style={styles.width_40} />
                </View>
            </ImageBackground>
            <View style={styles.headerViewContainer}>
                <View style={styles.headerView}>
                    <View>{renderStoreIcon(customerData, true, false, styles.imgUserImage)}</View>
                    <View style={[styles.itemContentContainer]}>
                        <CText
                            style={[styles.fontColor_black, styles.fontWeight_900, styles.fontSize_18]}
                            numberOfLines={2}
                        >
                            {customerData.name}
                        </CText>
                        <View style={[styles.rowCenter, styles.marginTop_6]}>
                            <CText
                                style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]}
                                numberOfLines={1}
                            >
                                {customerData.address}
                            </CText>
                        </View>
                        <View style={[styles.rowCenter, styles.marginTop_6]}>
                            <CText
                                style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]}
                                numberOfLines={1}
                            >
                                {customerData.cityStateZip}
                            </CText>
                        </View>
                    </View>
                    {renderPhoneView({ customerData, mapInfo })}
                </View>
                <View style={styles.headerTab}>
                    <ScrollView horizontal bounces={false} ref={scrollTabRef}>
                        {tabComponentArr.map((value, index) => {
                            return (
                                <TouchableOpacity
                                    key={value.name}
                                    onPress={() => scrollViewOffsetPage(index)}
                                    style={[
                                        styles.tabButton,
                                        isActive === index && styles.isActive,
                                        value.isError && styles.marginRight_32
                                    ]}
                                >
                                    <CText style={[styles.tabTitle, isActive === index && styles.isActive]}>
                                        {value.name}
                                    </CText>
                                    {value.isError && <RedExclamation width={12} height={12} style={styles.errTip} />}
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
                </View>
            </View>
            <ScrollView
                style={screenWidthStyle}
                horizontal
                pagingEnabled
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                ref={scrollViewRef}
            >
                {[
                    overView(custInActive, custNoRD),
                    visitView({
                        isEdit,
                        isUnassignedSelected,
                        onUnassignClick,
                        sortList,
                        selectData,
                        deleteDataAlert,
                        reassignModal,
                        refMonthWeek,
                        weekDays,
                        weekDayClick,
                        data,
                        selectDayKey,
                        setWeekDays,
                        setSortList,
                        setIsEdit,
                        setSelectData,
                        setSelectedUserKey,
                        sortListRef,
                        updateSequence,
                        sortItemClick,
                        renderRow,
                        custNoVisits,
                        hasUnassignedVisits
                    }),
                    renderMyStoreTab(),
                    equipment(),
                    contractTab(),
                    profileTab(navigation),
                    renderPosView(),
                    activityTab(navigation),
                    SalesSnapshot({
                        packageDownData: breakdownData,
                        lineData: lineChartData,
                        productMixData: productMixData,
                        toplineMetricsData: toplineMetricsData,
                        periodCalendar: periodCalendar,
                        retailStore: customerDetail,
                        pdpData: pdpData
                    }),
                    contacts()
                ]}
            </ScrollView>
            {customerProfileTabEditCount.editCount > 0 && (
                <View style={screenWidthStyle}>
                    <FormBottomButton
                        rightButtonLabel={t.labels.PBNA_MOBILE_SAVE.toUpperCase()}
                        onPressSave={() => {
                            customerProfileTabRef.current?.saveData()
                        }}
                        onPressCancel={() => {
                            customerProfileTabRef.current?.cancel()
                        }}
                        disableSave={customerProfileTabEditCount.disableSave}
                    />
                </View>
            )}

            <ReassignModal
                cRef={reassignModal}
                navigation={navigation}
                userData={selectedUserKey.length > 1 ? { id: null } : { id: selectedUserKey[0] }}
                type={ReassignModalType.ReassignModalType_CustomerDetail}
                isEmployee
                data={userData}
                selectDataLength={selectData.length}
                selectedTime={''}
                selectedCase={0}
                itemClick={reassignItemClick}
                reassignCallBack={(count) => showReassignResult(count)}
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
                cRef={reassignResultModal}
                navigation={navigation}
                reassignType={VisitOperationType.REASSIGN}
                visitType={VisitType.RECURRING}
                totalAssign={totalAssign}
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                isNeedThreeHundredSize
            />
            <ReassignResultModal
                cRef={addResultModal}
                navigation={navigation}
                isServiceDetail
                totalAssign={totalAssign}
                modalVisible={addModalVisible}
                setModalVisible={setAddModalVisible}
            />
            <ReassignResultModal
                navigation={navigation}
                isRemovedFromMyCustomer
                userName={customerData?.name}
                modalVisible={resultModalVisible}
                setModalVisible={setResultModalVisible}
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
                handleClick={onBackPress}
            />
            <SuccessView
                ref={geoFenceSuccessRef}
                title={`${t.labels.PBNA_MOBILE_SUCCESS}\n${t.labels.PBNA_MOBILE_EDIT_GEO_FENCE_SUCCESS}`}
                modalViewStyle={styles.geoFenceSuccessView}
                afterTimeClose={2000}
            />
            <SelectGeoFenceTypeModal cRef={selectGeoFenceTypeModal} onConfirm={onSelectGeoFenceType} />
            <Loading isLoading={isLoading} />
        </View>
    )
}

export default CustomerDetail

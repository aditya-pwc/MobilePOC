/**
 * @description Reuseable code snippets.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-06-15
 */

import React from 'react'
import { Image, Linking, NativeAppEventEmitter, StyleSheet, TouchableOpacity, View } from 'react-native'
import CSwitch from '../../../../common/components/c-switch/CSwitch'
import CText from '../../../../common/components/CText'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import employeeItemStyle from '../../../styles/manager/EmployeeItemStyle'
import {
    convertLocalTimeToUTCTime,
    DEFAULT_DELAY_TIME,
    formatUTCToLocalTime,
    getFTPT,
    handleDayStatus,
    replaceSpace,
    getRecordTypeIdByDeveloperName,
    syncDownDataByTableNames,
    queryScheduleVisit,
    transferMilesIntoKilometerForCanada
} from '../../../utils/MerchManagerUtils'
import {
    computeShipAddress,
    getTotalHours,
    getTotalMinus,
    getWeekLabel,
    getWorkingStatus
} from '../../../utils/MerchManagerComputeUtils'
import { SoupService } from '../../../service/SoupService'
import ScheduleQuery from '../../../queries/ScheduleQuery'
import { getObjByName, restDataCommonCall, syncUpObjUpdate, syncUpObjUpdateFromMem } from '../../../api/SyncUtils'
import _ from 'lodash'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { CommonParam } from '../../../../common/CommonParam'
import { formatString } from '../../../utils/CommonUtils'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { CommonLabel } from '../../../enums/CommonLabel'
import UserAvatar from '../../common/UserAvatar'
import CustomerDetailStyle from '../../../styles/manager/CustomerDetailStyle'
import { Log } from '../../../../common/enums/Log'
import DropDownModal from '../common/DropDownModal'
import {
    BooleanStr,
    DataCheckMsgIndex,
    DropDownType,
    EventEmitterType,
    LineCodeGroupType,
    NavigationPopNum,
    NavigationRoute,
    WeekDayIndex
} from '../../../enums/Manager'
import { UserType } from '../../../redux/types/H01_Manager/data-userType'
import { publishSchedule, recalculateMeeting, recalculateSchedule } from '../../../api/ApexApis'
import { t } from '../../../../common/i18n/t'
import moment from 'moment'
import { VisitStatus } from '../../../enums/Visit'
import { VisitListStatus } from '../../../enums/VisitList'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { getStringValue } from '../../../utils/LandingUtils'
import { filterExistFields } from '../../../utils/SyncUtils'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../../../common/enums/MomentStartOf'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const reuseableStyles = StyleSheet.create({
    textWeek: {
        marginLeft: 2,
        paddingLeft: 3,
        paddingRight: 3,
        fontWeight: baseStyle.fontWeight.fw_bold
    },
    textWeekBorder: {
        borderWidth: 1,
        borderColor: baseStyle.color.red
    },
    textWeekend: {
        color: baseStyle.color.borderGray
    },
    textWeekActive: {
        fontWeight: baseStyle.fontWeight.fw_bold,
        color: baseStyle.color.red
    },
    userImgPhoneAndMsg: {
        width: 18,
        height: 18
    },
    itemBottomContainer: {
        height: 40,
        backgroundColor: '#F2F4F7',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'stretch',
        paddingHorizontal: 20,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6
    },
    userRouteLabel: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black
    },
    fontWeight_700: {
        fontWeight: '700'
    },
    dropdownText: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    dropdownPlusText: {
        fontSize: baseStyle.fontSize.fs_16
    }
})

const customerStyles = CustomerDetailStyle

export const drawHeaderTriangle = (defaultActive, activeStep, drawStyles) => {
    return (
        <View>
            {activeStep === defaultActive && (
                <View>
                    <View style={drawStyles.topTriangle} />
                    <View style={[drawStyles.topTriangle, drawStyles.bottomLeftTriangle]} />
                </View>
            )}
            {activeStep !== defaultActive && (
                <View>
                    <View style={[drawStyles.topTriangle, drawStyles.topRightTriangle]} />
                    <View style={[drawStyles.topTriangle, drawStyles.bottomRightTriangle]} />
                </View>
            )}
        </View>
    )
}

export const renderWorkingDaySwitchLists = (
    dateNames,
    workDayStyles,
    workingOrder,
    setActiveAddBtn,
    setWorkingOrder,
    onWorkingOrderChange
) => {
    return dateNames.map((date, index) => {
        return (
            <View key={date.key + date.label} style={workDayStyles.modalSelectRow}>
                <CSwitch
                    label={date.label}
                    checked={Object.values(workingOrder)[index] as boolean}
                    showBottomLine
                    toggleSwitch={() => {
                        onWorkingOrderChange({ index, workingOrder, setActiveAddBtn, setWorkingOrder })
                    }}
                />
            </View>
        )
    })
}

export const updateWorkingDayStatus = (updateObj, workingOrder) => {
    updateObj.Sunday__c = workingOrder.SUN
    updateObj.Monday__c = workingOrder.MON
    updateObj.Tuesday__c = workingOrder.TUE
    updateObj.Wednesday__c = workingOrder.WED
    updateObj.Thursday__c = workingOrder.THU
    updateObj.Friday__c = workingOrder.FRI
    updateObj.Saturday__c = workingOrder.SAT
    return updateObj
}

export const getHourAndMin = (mins) => {
    const tmpMins = Math.round(mins)
    const hour = (tmpMins / CommonLabel.SIXTY_MINUTE) | 0
    const min = tmpMins % CommonLabel.SIXTY_MINUTE | 0
    return { hour, min }
}

export const renderUnassignCard = () => {
    return (
        <View style={[employeeItemStyle.container, employeeItemStyle.height110]}>
            <View style={employeeItemStyle.marginRight15}>
                <Image style={[employeeItemStyle.imgAvatar]} source={ImageSrc.IMG_UNASSIGNED} />
            </View>
            <View style={employeeItemStyle.content}>
                <View style={employeeItemStyle.middle}>
                    <View style={employeeItemStyle.topRow}>
                        <View style={employeeItemStyle.leftCol}>
                            <CText numberOfLines={1} ellipsizeMode="tail" style={employeeItemStyle.userName}>
                                {t.labels.PBNA_MOBILE_UNASSIGNED}
                            </CText>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

export const renderUnassignRouteCard = (item, visitLabel?, isFromCustomer?, needShadow?) => {
    return (
        <View
            style={[
                employeeItemStyle.unassignedRouteContainer,
                needShadow && employeeItemStyle.container,
                needShadow && { width: 'auto' }
            ]}
        >
            <View style={employeeItemStyle.marginRight15}>
                <Image style={[employeeItemStyle.imgAvatar]} source={ImageSrc.IMG_UNASSIGNED} />
            </View>
            <View style={employeeItemStyle.content}>
                <View style={employeeItemStyle.middle}>
                    <View style={employeeItemStyle.topRow}>
                        <View style={employeeItemStyle.leftCol}>
                            <CText numberOfLines={1} ellipsizeMode="tail" style={employeeItemStyle.userName}>
                                {_.capitalize(t.labels.PBNA_MOBILE_UNASSIGNED) +
                                    ' ' +
                                    (visitLabel ? t.labels.PBNA_MOBILE_VISIT : t.labels.PBNA_MOBILE_ROUTE)}
                            </CText>
                            <CText
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={[customerStyles.marginTop_6, employeeItemStyle.totalVisits]}
                            >
                                {isFromCustomer ? item.routeGroupName : item.name}
                            </CText>
                            <View style={[customerStyles.marginTop_6, commonStyle.flexRowAlignCenter]}>
                                {item.totalMinutes >= 0 && (
                                    <CText style={employeeItemStyle.totalVisits}>
                                        {getHourAndMin(item.totalMinutes).hour}
                                        {` ${t.labels.PBNA_MOBILE_HRS} `}
                                        {getHourAndMin(item.totalMinutes).min}
                                        {` ${t.labels.PBNA_MOBILE_MINS}`}
                                    </CText>
                                )}
                                {item.totalMinutes >= 0 && (
                                    <CText style={[employeeItemStyle.totalVisits, employeeItemStyle.line]}> | </CText>
                                )}
                                <CText numberOfLines={1} ellipsizeMode="tail" style={employeeItemStyle.totalVisits}>
                                    {item?.totalVisit + ' ' + t.labels.PBNA_MOBILE_VISITS}
                                </CText>
                                {item.totalMiles >= 0 && (
                                    <CText style={[employeeItemStyle.totalVisits, employeeItemStyle.line]}> | </CText>
                                )}
                                {item.totalMiles >= 0 &&
                                    (item?.manager?.isInCanada ? (
                                        <CText style={employeeItemStyle.totalVisits}>
                                            {transferMilesIntoKilometerForCanada(item.totalMiles)}
                                            {` ${t.labels.PBNA_MOBILE_KM}`}
                                        </CText>
                                    ) : (
                                        <CText style={employeeItemStyle.totalVisits}>
                                            {item.totalMiles}
                                            {` ${t.labels.PBNA_MOBILE_MI}`}
                                        </CText>
                                    ))}
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

const syncDownCallback = (params) => {
    const { needNavigation, isRecalculate, setIsLoading, navigation, setModalVisible } = params
    if (needNavigation) {
        if (isRecalculate) {
            Instrumentation.stopTimer('Merch Manager recalculate schedule')
            const timeId = setTimeout(() => {
                setIsLoading && setIsLoading(false)
                clearTimeout(timeId)
                navigation?.navigate(NavigationRoute.SCHEDULE_SUMMARY)
            })
        } else {
            setIsLoading && setIsLoading(false)
            setModalVisible && setModalVisible(true)
            Instrumentation.stopTimer('Merch Manager publish schedule')
            const timeId = setTimeout(() => {
                clearTimeout(timeId)
                navigation?.pop(NavigationPopNum.POP_TWO)
                navigation?.setOptions({ tabBarVisible: true })
            }, DEFAULT_DELAY_TIME)
        }
    } else {
        const timeId = setTimeout(() => {
            setIsLoading && setIsLoading(false)
            clearTimeout(timeId)
        })
    }
}

const pollingVisitList = async (params) => {
    const {
        visitListId,
        setIsLoading,
        isRecalculate,
        needNavigation,
        navigation,
        setModalVisible,
        dropDownRef,
        poolingByCCField,
        isPublished
    } = params
    return new Promise((resolve, reject) => {
        const intervalId = setInterval(() => {
            restDataCommonCall(
                `query/?q=SELECT Status__c, Calculation_Complete__c, Manager_Ad_Hoc__c FROM Visit_List__c WHERE Id='${visitListId}'`,
                'GET'
            )
                .then(async (result) => {
                    const records = result?.data?.records
                    const isCancelOrFailed = records[0]?.Status__c === 'Cancelled' || records[0]?.Status__c === 'Failed'
                    const isIncludeAdHocVisitCancel =
                        !isPublished && records[0]?.Manager_Ad_Hoc__c === true && records[0]?.Status__c === 'Accepted'
                    const checkIsCancel = isCancelOrFailed || isIncludeAdHocVisitCancel
                    if (
                        (poolingByCCField && records[0]?.Calculation_Complete__c) ||
                        (!poolingByCCField &&
                            (records[0]?.Status__c === (isRecalculate ? 'Completed' : 'Accepted') || checkIsCancel))
                    ) {
                        clearInterval(intervalId)
                        await syncDownDataByTableNames()

                        const checkCancel = checkIsCancel ? false : isRecalculate
                        const checkIfNeedNavigation = checkIsCancel ? true : needNavigation
                        const checkIfNeedModal = checkIsCancel ? null : setModalVisible
                        syncDownCallback({
                            needNavigation: checkIfNeedNavigation,
                            isRecalculate: checkCancel,
                            setIsLoading,
                            navigation,
                            setModalVisible: checkIfNeedModal
                        })
                        resolve(!checkIsCancel)
                    }
                })
                .catch((err) => {
                    setIsLoading && setIsLoading(false)
                    clearInterval(intervalId)
                    dropDownRef.current.alertWithType(
                        DropDownType.ERROR,
                        t.labels.PBNA_MOBILE_SCHEDULE_FAILED_TO_POOLING,
                        err
                    )
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'MM-pollingVisitList',
                        `Failed polling VisitList: ${getStringValue(err)}`
                    )
                    return reject(err)
                })
        }, 500)
    })
}

export const recalculateOrPublishSchedule = async (
    isRecalculate,
    setIsLoading,
    visitListId,
    dropDownRef,
    navigation,
    setModalVisible,
    needNavigation
) => {
    setIsLoading && setIsLoading(true)
    const body = { scheduleVisitListId: visitListId }
    try {
        if (isRecalculate) {
            Instrumentation.startTimer('Merch Manager recalculate schedule')
            await recalculateSchedule(body).catch((err) => {
                setIsLoading && setIsLoading(false)
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_SCHEDULE_FAILED_TO_PUBLISH,
                    err
                )
            })
            const isCancel = await pollingVisitList({
                visitListId,
                setIsLoading,
                isRecalculate,
                needNavigation,
                navigation,
                setModalVisible,
                dropDownRef
            })
            return Promise.resolve(isCancel)
        }
        Instrumentation.startTimer('Merch Manager publish schedule')
        const scheduledVisits = await SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            getObjByName('Visit').syncUpCreateFields,
            getObjByName('Visit').syncUpCreateQuery + ` WHERE {Visit:Schedule_Visit_Group__c} = '${visitListId}'`
        )
        if (!_.isEmpty(scheduledVisits)) {
            await syncUpObjUpdate(
                'Visit',
                getObjByName('Visit').syncUpCreateFields,
                getObjByName('Visit').syncUpCreateQuery + ` WHERE {Visit:Schedule_Visit_Group__c} = '${visitListId}'`
            )
        }
        publishSchedule(body)
            .then(() => {
                pollingVisitList({
                    visitListId,
                    setIsLoading,
                    isRecalculate,
                    needNavigation,
                    navigation,
                    setModalVisible,
                    dropDownRef
                })
            })
            .catch((err) => {
                setIsLoading && setIsLoading(false)
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_SCHEDULE_FAILED_TO_PUBLISH,
                    err
                )
            })
    } catch (err) {
        if (err.status !== 'E4') {
            setIsLoading && setIsLoading(false)
            dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_SCHEDULE_FAILED_TO_SYNC_UP, err)
        }
        storeClassLog(
            Log.MOBILE_ERROR,
            'MM-recalculateOrPublishSchedule',
            `Failed to recalculate/publish schedule: ${getStringValue(err)}`
        )
    }
}

export const recalculateKPIBySVGAccepted = async (params) => {
    const {
        visitListId,
        setIsLoading,
        isRecalculate,
        needNavigation,
        navigation,
        setModalVisible,
        dropDownRef,
        isPublished
    } = params
    if (_.isEmpty(visitListId)) {
        return
    }
    const body = { scheduleVisitListId: visitListId }
    try {
        await recalculateMeeting(body)
        await pollingVisitList({
            visitListId,
            setIsLoading,
            isRecalculate,
            needNavigation,
            navigation,
            setModalVisible,
            dropDownRef,
            poolingByCCField: true,
            isPublished
        })
    } catch (err) {
        setIsLoading && setIsLoading(false)
        dropDownRef.current.alertWithType(
            DropDownType.ERROR,
            t.labels.PBNA_MOBILE_MEETING_FAILED_TO_RECALCULATE_KPI,
            err
        )
        storeClassLog(
            Log.MOBILE_ERROR,
            'MM-recalculateKPIBySVGAccepted',
            `Failed to recalculate schedule: ${getStringValue(err)}`
        )
    }
}

export const handleUnassignData = async (summaryCustomerList, setUnassignCustomerList, setUnassignVisits) => {
    const unassignStoreList = []
    const unassignVisit = []
    summaryCustomerList.forEach((store: any) => {
        const tempVisitObj = {}
        let hasUnassign = false
        for (const key in store.visits) {
            const dayList = []
            const dayListTemp = []
            let dayHasUnassign = false
            store.visits[key].forEach((visit: any) => {
                if (visit?.routeGroup || moment(visit?.date).isBefore(moment(), MOMENT_STARTOF.DAY)) {
                    return
                }
                if (!visit.visitor) {
                    visit.canSelect = true
                    hasUnassign = true
                    dayHasUnassign = true
                    unassignVisit.push(visit)
                    dayList.push(visit)
                } else {
                    dayListTemp.push(visit)
                }
            })
            if (dayHasUnassign) {
                tempVisitObj[key] = [...dayList, ...dayListTemp]
            }
        }
        if (hasUnassign) {
            store.visits = tempVisitObj
            unassignStoreList.push(store)
        }
    })
    setUnassignCustomerList(unassignStoreList)
    setUnassignVisits(unassignVisit)
}

const DEFAULT_ACTIVE_STEP = 1

export const isFirstStep = (activeStep) => {
    return activeStep === DEFAULT_ACTIVE_STEP
}

export const isSecondStep = (activeStep) => {
    return activeStep !== DEFAULT_ACTIVE_STEP
}

export const renderWorkingDayStatus = (item) => {
    return (
        item?.workingStatus &&
        item?.workingStatus.map((wStatus, index) => {
            const indexKey = index.toString()
            return (
                <CText
                    key={indexKey}
                    style={[
                        reuseableStyles.textWeek,
                        item.overwork[wStatus.name]?.owStatus === 'over' && reuseableStyles.textWeekActive,
                        item.overwork[wStatus.name]?.owStatus === 'no_visit' &&
                            wStatus.attend &&
                            reuseableStyles.textWeekBorder,
                        item.overwork[wStatus.name]?.owStatus === 'no_visit' &&
                            !wStatus.attend &&
                            reuseableStyles.textWeekend
                    ]}
                >
                    {wStatus.label}
                </CText>
            )
        })
    )
}

const TRUE_VALUE = BooleanStr.STR_TRUE

const getETRUserData = (store, dropDownRef?) => {
    try {
        let salesReqInfo = {
            Id: '',
            Name: '',
            FirstName: '',
            LastName: '',
            Title: '',
            MobilePhone: '',
            FT_EMPLYE_FLG_VAL__c: ''
        }
        if (!_.isEmpty(store['Account.Sales_Rep_Info__c'])) {
            salesReqInfo = JSON.parse(store['Account.Sales_Rep_Info__c'])
        }
        return {
            userId: salesReqInfo.Id,
            userName: salesReqInfo.Name,
            title: salesReqInfo.Title,
            firstName: salesReqInfo.FirstName,
            lastName: salesReqInfo.LastName,
            userPhone: salesReqInfo.MobilePhone,
            ftFlag: salesReqInfo.FT_EMPLYE_FLG_VAL__c && salesReqInfo.FT_EMPLYE_FLG_VAL__c.toLocaleLowerCase(),
            userStatsId: store['US.Id'],
            startTime: store['US.Start_Time__c'],
            workingStatus: getWorkingStatus(store, 'US'),
            salesRoute: store['RSG.LOCL_RTE_ID__c'],
            nrid: store['RSG.GTMU_RTE_ID__c'],
            userMerchandisingBase: store['US.Merchandising_Base__c'] === TRUE_VALUE
        }
    } catch (err) {
        dropDownRef?.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_ASSEMBLE_CUSTOMER_SALES, err)
    }
}

const errorCheck = (store) => {
    const merchandisingBase = store['Account.Merchandising_Base__c'] === TRUE_VALUE
    const isActive = parseInt(store['Account.IS_ACTIVE__c'] || 0) === 0 && merchandisingBase
    const activeDP = parseInt(store['Account.Active_Dist_Points__c'] || 0) === 0 && merchandisingBase
    const recVisitCount = store.recVisitCount === 0
    return isActive || activeDP || recVisitCount
}
export const assembleCustomerData = (res, dropDownRef?) => {
    const items = {}
    res.forEach((store: any) => {
        const shippingAddress = JSON.parse(store['Account.ShippingAddress'])
        const storeLocation = JSON.parse(store.Store_Location__c)
        if (shippingAddress) {
            shippingAddress.street = shippingAddress?.street?.replace(/[\r\n]/g, ' ')
        }
        const tempUserData = getETRUserData(store, dropDownRef)
        items[store.Id] = {
            id: store.Id,
            name: store['Account.Name'],
            accountId: store.AccountId,
            address: shippingAddress?.street ? shippingAddress?.street : '',
            cityStateZip: `${shippingAddress?.city ? shippingAddress?.city + ', ' : ''}${
                shippingAddress?.state ? shippingAddress?.state : ''
            }${shippingAddress?.postalCode ? ' ' + shippingAddress?.postalCode : ''} `,
            cof: store['Account.CUST_ID__c'],
            customNumber: store['Account.RTLR_STOR_NUM__c'],
            customId: store['Account.CUST_UNIQ_ID_VAL__c'],
            phone: store['Account.Phone'],
            busnLvl3: store['Account.BUSN_SGMNTTN_LVL_3_NM__c'],
            merchandisingBase: store['Account.Merchandising_Base__c'] === TRUE_VALUE,
            location: storeLocation,
            latitude: storeLocation ? storeLocation.latitude : store.Latitude,
            longitude: storeLocation ? storeLocation.longitude : store.Longitude,
            orderDays: handleDayStatus(store['Account.Merchandising_Order_Days__c']),
            deliveryDays: handleDayStatus(store['Account.Merchandising_Delivery_Days__c']),
            retailStoreName: store.Name,
            isActive: parseInt(store['Account.IS_ACTIVE__c'] || 0) === 1,
            activeDP: parseInt(store['Account.Active_Dist_Points__c'] || 0),
            recVisitCount: store.recVisitCount,
            unassignedVisitCount: store.unassignedVisitCount,
            isError: errorCheck(store),
            indicator2P: store['Account.Indicator_2P__c'] === TRUE_VALUE,
            locationProductId: store.LOC_PROD_ID__c,
            'Account.CDA_Medal__c': store['Account.CDA_Medal__c'],
            'Account.IsOTSCustomer__c': store['Account.IsOTSCustomer__c'],
            ...tempUserData
        }
    })
    return items
}

const queryCustomerWithETR = async (isFromMyCustomer, whereClause, dropDownRef?, isFromRep = false) => {
    const CTRRecordTypeId = await getRecordTypeIdByDeveloperName('CTR', 'Customer_to_Route__c')
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'RetailStore',
            {},
            ScheduleQuery.getMyCustomerQuery.f,
            formatString(ScheduleQuery.getMyCustomerQuery.q, [
                isFromMyCustomer
                    ? `, (SELECT COUNT({Service_Detail__c:Id}) FROM {Service_Detail__c}
                    WHERE {RetailStore:AccountId} = {Service_Detail__c:Customer_to_Route__r.Customer__c}
                    AND {Service_Detail__c:Customer_to_Route__r.RecordTypeId} = '${CTRRecordTypeId}'
                    AND {Service_Detail__c:Customer_to_Route__r.Merch_Flag__c} IS TRUE
                    AND {Service_Detail__c:IsRemoved__c} IS FALSE) AS recVisitCount 
                    , (SELECT COUNT({Service_Detail__c:Customer_to_Route__r.Customer__c}) FROM {Service_Detail__c}
                    WHERE {Service_Detail__c:IsRemoved__c} IS FALSE 
                    AND {Service_Detail__c:Customer_to_Route__r.Merch_Flag__c} IS TRUE
                    AND {Service_Detail__c:Unassigned__c} IS TRUE
                    AND {Service_Detail__c:Customer_to_Route__r.RecordTypeId} = '${CTRRecordTypeId}'
                    AND {Service_Detail__c:Customer_to_Route__r.Customer__c} = {RetailStore:AccountId}) AS unassignedVisitCount
                    `
                    : ''
            ]) +
                (isFromRep ? '' : `WHERE {RetailStore:LOC_PROD_ID__c} = '${CommonParam.userLocationId}' `) +
                whereClause +
                ' ORDER BY {RetailStore:Account.Name}'
        )
            .then((result: any[]) => {
                resolve(result)
            })
            .catch((err) => {
                dropDownRef?.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_FAILED_TO_GET_CUSTOMER_DATA,
                    err
                )
                reject(err)
            })
    })
}

export const getAllCustomerData = async (isFromMyCustomer, dropDownRef?) => {
    return new Promise((resolve, reject) => {
        let whereClause: string
        if (isFromMyCustomer) {
            whereClause = ' AND {RetailStore:Account.Merchandising_Base__c} IS TRUE'
        } else {
            whereClause = ' AND {RetailStore:Account.Merchandising_Base_Minimum_Requirement__c} IS TRUE'
        }
        queryCustomerWithETR(isFromMyCustomer, whereClause, dropDownRef)
            .then(async (res: any) => {
                const items = assembleCustomerData(res, dropDownRef)
                const stores = Object.values(items)
                resolve(stores)
            })
            .catch((err) => {
                dropDownRef?.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_FAILED_TO_GET_CUSTOMER_DATA,
                    err
                )
                reject(err)
            })
    })
}

export const getCustomerETRData = async (customerId, dropDownRef, isFromRep = false) => {
    return new Promise((resolve, reject) => {
        const whereClause = ` ${isFromRep ? 'WHERE' : 'AND'} {RetailStore:Id} = '${customerId}'`
        queryCustomerWithETR(false, whereClause, dropDownRef, isFromRep)
            .then((res: any) => {
                const items = assembleCustomerData(res, dropDownRef)
                resolve(items)
            })
            .catch((err) => {
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_FAILED_TO_GET_CUSTOMER_DATA,
                    err
                )
                reject(err)
            })
    })
}

export const handleWeekKeySelect = (params) => {
    const { data, weekDays, setWeekDays, setSortList, selectDayKey, select } = params
    for (const weekKey in data) {
        if (Object.keys(data[weekKey]).length === 0) {
            continue
        }
        for (const key in data[weekKey]) {
            data[weekKey][key].select = select
        }
        weekDays[weekKey] = select
    }
    setWeekDays(weekDays)
    setSortList(data[selectDayKey] || {})
}

const renderUserPhoneView = (item) => {
    return (
        <View>
            <TouchableOpacity onPress={() => item.userPhone && Linking.openURL(`tel:${item.userPhone}`)}>
                <Image style={[reuseableStyles.userImgPhoneAndMsg]} source={ImageSrc.ICON_CALL} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => item.userPhone && Linking.openURL(`sms:${item.userPhone}`)}>
                <Image
                    style={[reuseableStyles.userImgPhoneAndMsg, commonStyle.marginTop_20]}
                    source={ImageSrc.IMG_MSG}
                />
            </TouchableOpacity>
        </View>
    )
}

const renderItemBottomView = (item) => {
    return (
        <View style={reuseableStyles.itemBottomContainer}>
            <CText
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[reuseableStyles.userRouteLabel, commonStyle.routeTextWidth]}
            >
                {t.labels.PBNA_MOBILE_SALES_ROUTE}
                <CText style={[reuseableStyles.fontWeight_700]}> {item.salesRoute || '-'}</CText>
            </CText>
            <CText
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[reuseableStyles.userRouteLabel, commonStyle.textAlignRight, commonStyle.routeTextWidth]}
            >
                {t.labels.PBNA_MOBILE_NRID}
                <CText style={[reuseableStyles.fontWeight_700]}> {item.nrid || '-'} </CText>
            </CText>
        </View>
    )
}

export const renderUserItem = (item, userItemStyles = customerStyles) => {
    const renderWStautsText = (wStatus, index) => {
        return (
            <CText
                key={index}
                style={
                    wStatus.attend
                        ? [
                              userItemStyles.fontSize_12,
                              userItemStyles.fontWeight_700,
                              userItemStyles.fontColor_black,
                              userItemStyles.marginRight_8
                          ]
                        : [
                              userItemStyles.fontSize_12,
                              userItemStyles.fontWeight_700,
                              userItemStyles.fontColor_lightGary,
                              userItemStyles.marginRight_8
                          ]
                }
            >
                {wStatus.label}
            </CText>
        )
    }
    if (!_.isEmpty(item.userName) || !_.isEmpty(item.salesRoute) || !_.isEmpty(item.nrid)) {
        return (
            <TouchableOpacity activeOpacity={1} style={userItemStyles.teamItem}>
                <View style={userItemStyles.teamItem_without_border}>
                    <UserAvatar
                        userStatsId={item.userStatsId}
                        firstName={item.firstName}
                        lastName={item.lastName}
                        avatarStyle={userItemStyles.imgUserImage}
                        userNameText={{ fontSize: 24 }}
                    />
                    <View style={[userItemStyles.itemContentContainer]}>
                        <CText
                            style={[
                                userItemStyles.fontColor_black,
                                userItemStyles.fontWeight_700,
                                userItemStyles.fontSize_16
                            ]}
                            numberOfLines={1}
                        >
                            {item.userName}
                        </CText>
                        <View
                            style={[
                                userItemStyles.rowCenter,
                                userItemStyles.marginTop_6,
                                userItemStyles.marginRight_20
                            ]}
                        >
                            <CText
                                style={[
                                    userItemStyles.fontColor_gary,
                                    userItemStyles.fontWeight_400,
                                    userItemStyles.fontSize_12
                                ]}
                            >
                                {getFTPT({ item: item })}
                            </CText>
                            <CText
                                style={[
                                    userItemStyles.fontColor_gary,
                                    userItemStyles.fontWeight_400,
                                    userItemStyles.fontSize_12
                                ]}
                                numberOfLines={1}
                            >
                                {item.title}
                            </CText>
                        </View>
                        {!_.isEmpty(item.userStatsId) && item?.userMerchandisingBase && (
                            <View style={[userItemStyles.rowCenter, userItemStyles.marginTop_6]}>
                                <CText
                                    style={[
                                        userItemStyles.fontColor_gary,
                                        userItemStyles.fontWeight_400,
                                        userItemStyles.fontSize_12
                                    ]}
                                >
                                    {formatUTCToLocalTime(item.startTime)}
                                </CText>
                                {item.startTime && <View style={userItemStyles.itemLine} />}
                                {item.workingStatus &&
                                    item.workingStatus.map((wStatus, index) => {
                                        return renderWStautsText(wStatus, index)
                                    })}
                            </View>
                        )}
                    </View>
                    {renderUserPhoneView(item)}
                </View>
                {renderItemBottomView(item)}
            </TouchableOpacity>
        )
    }
}

export const getWorkingStatusObj = (workingStatus) => {
    const tempWorkingOrder = {
        SUN: false,
        MON: false,
        TUE: false,
        WED: false,
        THU: false,
        FRI: false,
        SAT: false
    }
    workingStatus?.forEach((status) => {
        tempWorkingOrder[status.name] = status.attend
    })
    return tempWorkingOrder
}

const MAX_VISIT_A_DAY = 10
export const checkVisitsTabAllError = (originalWorkingOrder, allSDData) => {
    let hasError = false
    Object.keys(allSDData).forEach((dayKey) => {
        if (!_.isEmpty(allSDData[dayKey])) {
            hasError =
                Object.keys(allSDData[dayKey]).length > MAX_VISIT_A_DAY || !originalWorkingOrder[dayKey] || hasError
        }
    })
    return hasError
}

export const checkNoWorkingDay = (userStats) => {
    const falseVal = '0'
    return (
        userStats.Sunday__c === falseVal &&
        userStats.Monday__c === falseVal &&
        userStats.Tuesday__c === falseVal &&
        userStats.Wednesday__c === falseVal &&
        userStats.Thursday__c === falseVal &&
        userStats.Friday__c === falseVal &&
        userStats.Saturday__c === falseVal
    )
}

export const computeMyTeamData = async (result) => {
    const items = {}
    let index = -1
    const tempSalesRoute = {}
    const tempNRID = {}
    for (const user of result) {
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
            index: index,
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
            userStatsId: user.UserStatsId,
            workingStatus: getWorkingStatus(user),
            noWorkingDay: checkNoWorkingDay(user),
            deletableDirectly: !user.OwnerId,
            salesRoute: tempSalesRoute[user.UserId] || '-',
            nrid: tempNRID[user.UserId] || '-',
            terminateUser: !_.isEmpty(user.WRKFRC_EMPLYMT_TRMNTN_DT__c),
            lineCode: user.LC_ID__c,
            isSelected: false
        }
    }
    return items
}

/**
 * return id clause by id array, such as 'id1','id2'
 * @param idArr
 */
export const getIdClause = (idArr: Array<string>) => {
    let idClause = ''
    idArr.forEach((id, index) => {
        idClause += `'${id}'` + (index !== idArr.length - 1 ? ',' : '')
    })
    return idClause
}

const updateVisitListPlanedMeetingTime = async (visitListIds, eventDuration, dropDownRef) => {
    SoupService.retrieveDataFromSoup(
        'Visit_List__c',
        {},
        getObjByName('Visit_List__c').syncUpCreateFields,
        getObjByName('Visit_List__c').syncUpCreateQuery +
            `
            WHERE {Visit_List__c:Id} IN (${getIdClause(visitListIds)})
        `
    )
        .then(async (res: Array<any>) => {
            if (!_.isEmpty(res)) {
                res.forEach((visitList) => {
                    visitList.Planned_Meeting_Time__c = visitList.Planned_Meeting_Time__c - Number(eventDuration)
                })
                await syncUpObjUpdateFromMem(
                    'Visit_List__c',
                    filterExistFields('Visit_List__c', res, ['Id', 'Planned_Meeting_Time__c'])
                )
            }
        })
        .catch((err) => {
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_DELETE_MEETING_UPDATE_DVL_TIME,
                err
            )
        })
}

const updateVisitListPlanedMeetingTimeAfterDelete = async (eventIds, dropDownRef) => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'Event',
            {},
            ['Id', 'Planned_Duration__c', 'Visit_List__c', 'Parent_Event__c'],
            `
                SELECT {Event:Id}, {Event:Planned_Duration__c}, {Event:Visit_List__c}, {Event:Parent_Event__c}
                FROM {Event}
                WHERE {Event:Id} IN (${getIdClause(eventIds)})
            `
        )
            .then(async (res: Array<any>) => {
                let eventDuration = 0
                const dailyVisitListIds = []
                res.forEach((event) => {
                    if (!_.isEmpty(event.Parent_Event__c)) {
                        dailyVisitListIds.push(event.Visit_List__c)
                    } else {
                        eventDuration = event.Planned_Duration__c
                    }
                })
                await updateVisitListPlanedMeetingTime(dailyVisitListIds, eventDuration, dropDownRef)
                resolve(dailyVisitListIds)
            })
            .catch((err) => {
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_DELETE_MEETING_FAILED_TO_QUERY_EVENT,
                    err
                )
                reject(err)
            })
    })
}

export const queryVisitByStartDateAndEndDate = async (
    userId: string,
    startDate: string,
    endDate: string,
    isFromPublished: boolean
) => {
    const visitStatusClause = isFromPublished ? '' : `AND {Visit:Status__c} = '${VisitStatus.PLANNED}'`
    return SoupService.retrieveDataFromSoup(
        'Visit',
        {},
        ['Id', 'Sales_Visit__c'],
        `SELECT {Visit:Id}, {Visit:Sales_Visit__c} FROM {Visit} WHERE 
        {Visit:Status__c} != '${VisitStatus.REMOVED}' 
        AND {Visit:VisitorId} = '${userId}' 
        AND date({Visit:Planned_Date__c}, '${CommonParam.userTimeZoneOffset}') >= date("${startDate}", 'start of day') 
        AND date({Visit:Planned_Date__c}, '${CommonParam.userTimeZoneOffset}') < date("${endDate}", 'start of day', '+1 day') 
        ${visitStatusClause}`
    )
}

export const queryAWholeWeekVisitAndEvent = async (userId: string, currentDate: any, isFromPublished: boolean) => {
    try {
        if (!moment(currentDate).isValid()) {
            return false
        }
        const weekStart = moment(currentDate).day(WeekDayIndex.SUNDAY_NUM).format(TIME_FORMAT.Y_MM_DD)
        const weekEnd = moment(currentDate).day(WeekDayIndex.SATURDAY_NUM).format(TIME_FORMAT.Y_MM_DD)
        const visits = await queryVisitByStartDateAndEndDate(userId, weekStart, weekEnd, isFromPublished)
        const meetings = await SoupService.retrieveDataFromSoup(
            'Event',
            {},
            ['Id'],
            `SELECT {Event:Id} FROM {Event} WHERE {Event:OwnerId} = '${userId}' 
            AND {Event:Manager_Scheduled__c} IS TRUE
            AND {Event:IsRemoved__c} IS FALSE
            AND date(REPLACE({Event:StartDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') >= date("${weekStart}", 'start of day') 
            AND date(REPLACE({Event:EndDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') < date("${weekEnd}", 'start of day', '+1 day')`
        )
        return !_.isEmpty(visits) || !_.isEmpty(meetings)
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, 'queryAWholeWeekVisitAndEvent', getStringValue(e))
        return false
    }
}

export const updateVisitListToUnscheduled = async (dvlId: string, isFromPublished: boolean) => {
    try {
        const dailyVisitList = await SoupService.retrieveDataFromSoup(
            'Visit_List__c',
            {},
            getObjByName('Visit_List__c').syncUpCreateFields,
            getObjByName('Visit_List__c').syncUpCreateQuery +
                `
            WHERE {Visit_List__c:Id} = '${dvlId}'
            `
        )
        if (_.isEmpty(dailyVisitList)) {
            return false
        }
        const hasVisitOrMeeting = await queryAWholeWeekVisitAndEvent(
            dailyVisitList[0]?.OwnerId,
            dailyVisitList[0]?.Visit_Date__c,
            isFromPublished
        )
        const weeklyVisitList = await SoupService.retrieveDataFromSoup(
            'Visit_List__c',
            {},
            getObjByName('Visit_List__c').syncUpCreateFields,
            getObjByName('Visit_List__c').syncUpCreateQuery +
                `
            WHERE {Visit_List__c:Id} = '${dailyVisitList[0]?.Visit_List_Group__c}'
            AND {Visit_List__c:IsRemoved__c} IS FALSE
            `
        )
        const allDailyVisitList = await SoupService.retrieveDataFromSoup(
            'Visit_List__c',
            {},
            getObjByName('Visit_List__c').syncUpCreateFields,
            getObjByName('Visit_List__c').syncUpCreateQuery +
                `
            WHERE {Visit_List__c:Visit_List_Group__c} = '${dailyVisitList[0]?.Visit_List_Group__c}'
            AND {Visit_List__c:IsRemoved__c} IS FALSE
            `
        )
        const userWorkingDays = await SoupService.retrieveDataFromSoup(
            'User_Stats__c',
            {},
            getObjByName('User_Stats__c').syncUpCreateFields,
            getObjByName('User_Stats__c').syncUpCreateQuery +
                `
            WHERE {User_Stats__c:User__c} = '${weeklyVisitList[0]?.OwnerId}'
            `
        )
        if (_.isEmpty(userWorkingDays) || _.isEmpty(weeklyVisitList)) {
            return false
        }
        const workingDayObj = {
            SUN: userWorkingDays[0].Sunday__c === BooleanStr.STR_TRUE,
            MON: userWorkingDays[0].Monday__c === BooleanStr.STR_TRUE,
            TUE: userWorkingDays[0].Tuesday__c === BooleanStr.STR_TRUE,
            WED: userWorkingDays[0].Wednesday__c === BooleanStr.STR_TRUE,
            THU: userWorkingDays[0].Thursday__c === BooleanStr.STR_TRUE,
            FRI: userWorkingDays[0].Friday__c === BooleanStr.STR_TRUE,
            SAT: userWorkingDays[0].Saturday__c === BooleanStr.STR_TRUE
        }
        const allDVLIds = allDailyVisitList.map((dvl) => dvl.Id)
        let allDVLAndWVL = []
        // no visits and meetings full week
        if (!hasVisitOrMeeting) {
            if (
                weeklyVisitList[0].Unscheduled__c === BooleanStr.STR_TRUE &&
                dailyVisitList[0].Unscheduled__c === BooleanStr.STR_TRUE
            ) {
                return true
            }
            const wvlUnscheduled = Object.values(workingDayObj).includes(true)
            weeklyVisitList[0].Unscheduled_Cost_Inclusion__c = wvlUnscheduled
            weeklyVisitList[0].Unscheduled__c = wvlUnscheduled
            allDailyVisitList.forEach((vl) => {
                vl.Unscheduled__c = workingDayObj[moment(vl.Visit_Date__c).format(TIME_FORMAT.DDD).toUpperCase()]
            })
            allDVLAndWVL = [...weeklyVisitList, ...allDailyVisitList]
        } else {
            // no visits and meetings single day
            const visits = await SoupService.retrieveDataFromSoup('Visit', {}, [], null, [
                `WHERE {Visit:Visit_List__c} IN (${getIdClause(allDVLIds)})`
            ])
            const events = await SoupService.retrieveDataFromSoup('Event', {}, [], null, [
                `WHERE {Event:Visit_List__c} IN (${getIdClause(allDVLIds)}) AND {Event:IsRemoved__c} IS FALSE`
            ])
            const visitDates = _.uniq(
                visits.map((v) => {
                    return v.Planned_Date__c
                })
            )
            const eventDates = _.uniq(
                events.map((e) => {
                    return moment(e.StartDateTime).format(TIME_FORMAT.Y_MM_DD)
                })
            )
            const visitListDates = allDailyVisitList.map((vl) => {
                return vl.Visit_Date__c
            })
            const daysOfNoVisit = _.difference(visitListDates, visitDates)
            const daysOfNoMeeting = _.difference(visitListDates, eventDates)
            const needUpdateVisitListDates = _.intersectionWith(daysOfNoVisit, daysOfNoMeeting, _.isEqual)
            allDailyVisitList.forEach((vl) => {
                vl.Unscheduled__c =
                    workingDayObj[moment(vl.Visit_Date__c).format(TIME_FORMAT.DDD).toUpperCase()] &&
                    needUpdateVisitListDates.includes(moment(vl.Visit_Date__c).format(TIME_FORMAT.Y_MM_DD))
            })
            weeklyVisitList[0].Unscheduled_Cost_Inclusion__c = false
            weeklyVisitList[0].Unscheduled__c = false
            allDVLAndWVL = [...weeklyVisitList, ...allDailyVisitList]
        }
        await syncUpObjUpdateFromMem(
            'Visit_List__c',
            filterExistFields('Visit_List__c', allDVLAndWVL, ['Id', 'Unscheduled__c', 'Unscheduled_Cost_Inclusion__c'])
        )
        return true
    } catch (e) {
        await storeClassLog(
            Log.MOBILE_ERROR,
            'updateVisitListToUnscheduled',
            `failed to update visitList to unscheduled: ${getStringValue(e)}`
        )
        return false
    }
}

export const handleDeleteMeeting = async (params) => {
    const {
        setIsLoading,
        EventIds,
        setMeetingDeletedModalVisible,
        navigation,
        dropDownRef,
        scheduleVisitListId,
        isFromPublished,
        isFromRNM
    } = params
    setIsLoading && setIsLoading(true)
    const dailyVisitListIds: any = await updateVisitListPlanedMeetingTimeAfterDelete(EventIds, dropDownRef)
    try {
        const eventIdSq = getIdClause(EventIds)
        const allEvent = await SoupService.retrieveDataFromSoup(
            'Event',
            {},
            getObjByName('Event').syncUpCreateFields,
            getObjByName('Event').syncUpCreateQuery +
                `
                WHERE {Event:Id} IN (${eventIdSq})
                `
        )
        allEvent.forEach((item: any) => {
            item.IsRemoved__c = TRUE_VALUE
        })
        await SoupService.upsertDataIntoSoup('Event', allEvent)
        await syncUpObjUpdate(
            'Event',
            getObjByName('Event').syncUpCreateFields,
            getObjByName('Event').syncUpCreateQuery +
                `
            WHERE {Event:Id} IN (${eventIdSq})
            `
        )
        for (const dvlId of dailyVisitListIds) {
            await updateVisitListToUnscheduled(dvlId, isFromPublished)
        }
        await recalculateKPIBySVGAccepted({
            visitListId: scheduleVisitListId,
            setIsLoading,
            isRecalculate: false,
            needNavigation: false,
            navigation,
            setModalVisible: null,
            dropDownRef,
            isPublished: isFromPublished
        })
        const timeoutId = setTimeout(() => {
            !isFromPublished && setIsLoading && setIsLoading(false)
            setMeetingDeletedModalVisible && setMeetingDeletedModalVisible(true)
            isFromPublished && NativeAppEventEmitter.emit(EventEmitterType.REFRESH_NSL)
            isFromRNM && NativeAppEventEmitter.emit(EventEmitterType.REFRESH_RNM, { isDelete: true })
            navigation?.goBack()
            clearTimeout(timeoutId)
        }, DEFAULT_DELAY_TIME)
    } catch (error) {
        setIsLoading && setIsLoading(false)
        dropDownRef.current.alertWithType(
            DropDownType.ERROR,
            t.labels.PBNA_MOBILE_DELETE_REMOTE_MEETING,
            JSON.stringify(error)
        )
    }
}

export const removeAlert = (params) => {
    const { Alert, onHandleDeleteMeeting } = params
    Alert.alert(t.labels.PBNA_MOBILE_DELETE_MEETING_ALERT, t.labels.PBNA_MOBILE_DELETE_MEETING_ALERT_MSG, [
        {
            text: 'No'
        },
        {
            text: 'Yes',
            onPress: () => {
                onHandleDeleteMeeting()
            }
        }
    ])
}

export const syncRemoteUserStatsWithoutInsertLocalSoup = async (userId) => {
    return new Promise((resolve, reject) => {
        const query =
            'SELECT Id, Start_Time__c, Sunday__c, Monday__c, Tuesday__c, Wednesday__c, ' +
            'Thursday__c, Friday__c, Saturday__c, User__c, OwnerId, Starting_Location__c, Sales_Function__c, ' +
            'Merchandising_Base__c FROM User_Stats__c' +
            ` WHERE User__c = '${userId}'`
        const path = `query/?q=${query}`
        restDataCommonCall(path, 'GET')
            .then(async (res) => {
                try {
                    const records = res?.data?.records
                    const userStats = {
                        userStatsId: '',
                        startTime: '',
                        workingStatus: []
                    }
                    if (!_.isEmpty(records)) {
                        userStats.userStatsId = records[0].Id
                        userStats.startTime = records[0].Start_Time__c
                        userStats.workingStatus = getWorkingStatus(records[0])
                    }
                    resolve(userStats)
                } catch (err) {
                    const rejection = {
                        status: 'E2',
                        error: err,
                        method: 'syncRemoteUserStats',
                        objectName: 'User_Stats__c'
                    }
                    await storeClassLog(
                        Log.MOBILE_ERROR,
                        'syncRemoteUserStatsWithoutInsertLocalSoup.restDataCommonCall',
                        getStringValue(rejection)
                    )
                    reject(rejection)
                }
            })
            .catch(async (err) => {
                const rejection = {
                    status: 'E2',
                    error: err,
                    method: 'syncRemoteUserStats',
                    objectName: 'User_Stats__c'
                }
                await storeClassLog(
                    Log.MOBILE_ERROR,
                    'syncRemoteUserStatsWithoutInsertLocalSoup',
                    getStringValue(rejection)
                )
                reject(rejection)
            })
    })
}

export const getStartTimeStr = (time) => {
    if (!_.isEmpty(time)) {
        return convertLocalTimeToUTCTime(time)
    }
    return null
}

export const renderAddMeetingDropdownItem = (params) => {
    const { dropDownModalVisible, setDropDownModalVisible, onAddClick, fromSchedule } = params

    const dropDownModalList = [
        `${t.labels.PBNA_MOBILE_ADD_NEW_VISIT_WITH_BRACKET}`,
        `${t.labels.PBNA_MOBILE_ADD_MEETING}`
    ]
    return (
        <DropDownModal
            visible={dropDownModalVisible}
            list={dropDownModalList}
            handleClick={(index) => {
                onAddClick(index)
            }}
            fromSchedule={fromSchedule}
            setDropDownVisible={setDropDownModalVisible}
        />
    )
}

export const renderExportDropdownItem = (params) => {
    const { exportModalVisible, setExportModalVisible, onMoreButtonClick, fromSchedule } = params

    const itemList = [`${t.labels.PBNA_MOBILE_EXPORT_SCHEDULE.toLocaleUpperCase()}`]
    return (
        <DropDownModal
            visible={exportModalVisible}
            list={itemList}
            handleClick={() => {
                onMoreButtonClick()
            }}
            needTriangle
            fromSchedule={fromSchedule}
            setDropDownVisible={setExportModalVisible}
        />
    )
}

export const navigateToAddMeeting = async (params) => {
    const { routerParams, setIsLoading, navigation, dropDownRef } = params
    try {
        setIsLoading(true)
        await syncDownDataByTableNames()
        setIsLoading(false)
    } catch (error) {
        setIsLoading(false)
        dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_REFRESH_MANAGER_FAILED + error)
    }
    navigation?.navigate(NavigationRoute.ADD_A_MEETING, routerParams)
}

export const getLocationData = (recordTypeId) => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'Route_Sales_Geo__c',
            {},
            ScheduleQuery.retrieveDefaultLocationInfo.f,
            ScheduleQuery.retrieveDefaultLocationInfo.q +
                ` WHERE {Route_Sales_Geo__c:SLS_UNIT_ID__c} = '${CommonParam.userLocationId}' 
            AND {Route_Sales_Geo__c:RecordTypeId} = '${recordTypeId}'
            ORDER BY {Route_Sales_Geo__c:LastModifiedDate}`
        )
            .then((result: any) => {
                resolve(result)
            })
            .catch(() => {
                reject([])
            })
    })
}

export const goBackAndRefreshInRNS = async (
    popNum: number,
    errorMsgType: number,
    setIsLoading: Function,
    navigation: any,
    noNeedNav?
) => {
    if (errorMsgType === DataCheckMsgIndex.COMMON_MSG) {
        setIsLoading(true)
        await syncDownDataByTableNames()
        setIsLoading(false)
        !noNeedNav && navigation.pop()
    } else if (
        errorMsgType === DataCheckMsgIndex.SVG_PUBLISHED_MSG ||
        errorMsgType === DataCheckMsgIndex.SVG_CANCELLED_MSG
    ) {
        setIsLoading(true)
        await syncDownDataByTableNames()
        setIsLoading(false)
        navigation.pop(popNum)
    }
}

export const getGroupLineCode = async () => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'Line_Code_Grouping_Definition__mdt',
            {},
            ScheduleQuery.getLineCodeQuery.f,
            ScheduleQuery.getLineCodeQuery.q
        )
            .then((res) => {
                const lineCodeMap = new Map()
                const myTeamMerchLCodes = []
                const myTeamSalesLCodes = []
                const landingPageMerchLCodes = []
                const landingPageSalesLCodes = []
                res.forEach((item) => {
                    const myTeamGrouping = item.teamGroup
                    const landingPageGroup = item.landingGrouping
                    const code = item.lineCode
                    if (!_.isEmpty(code)) {
                        if (myTeamGrouping === UserType.UserType_Merch) {
                            myTeamMerchLCodes.push(code)
                        } else if (myTeamGrouping === UserType.UserType_Sales) {
                            myTeamSalesLCodes.push(code)
                        }
                        if (landingPageGroup === UserType.UserType_Merch) {
                            landingPageMerchLCodes.push(code)
                        } else if (landingPageGroup === UserType.UserType_Sales) {
                            landingPageSalesLCodes.push(code)
                        }
                    }
                })
                const myTeamLCodes = {}
                myTeamLCodes[UserType.UserType_Merch] = myTeamMerchLCodes
                myTeamLCodes[UserType.UserType_Sales] = myTeamSalesLCodes
                const landingPageLCodes = {}
                landingPageLCodes[UserType.UserType_Merch] = landingPageMerchLCodes
                landingPageLCodes[UserType.UserType_Sales] = landingPageSalesLCodes
                lineCodeMap.set(LineCodeGroupType.MyTeamGroup, myTeamLCodes)
                lineCodeMap.set(LineCodeGroupType.LandingPageGroup, landingPageLCodes)
                resolve(lineCodeMap)
            })
            .catch((e) => {
                reject(e)
            })
    })
}

export const roundHours = (minutes: number) => {
    if (minutes > CommonLabel.NUMBER_ZERO && minutes < CommonLabel.THIRTY_MINUTE) {
        return CommonLabel.NUMBER_ZERO
    } else if (minutes >= CommonLabel.THIRTY_MINUTE) {
        // only get integer part from minutes
        const hour = Math.trunc(minutes / CommonLabel.SIXTY_MINUTE)
        const min = minutes % CommonLabel.SIXTY_MINUTE
        if (min >= CommonLabel.THIRTY_MINUTE) {
            return hour + 1
        }
        return hour
    }
    return CommonLabel.NUMBER_ZERO
}

export const orderCustomerListByLocId = (oriCustomerList, searchText) => {
    const matchCustomerList = []
    const leftCustomerList = []

    oriCustomerList.forEach((customer) => {
        const salesRoute = replaceSpace(customer.salesRoute)?.toUpperCase()
        if (salesRoute === searchText) {
            matchCustomerList.push(customer)
        } else {
            leftCustomerList.push(customer)
        }
    })
    return matchCustomerList.concat(leftCustomerList)
}

export const isNullSpace = (str) => {
    if (_.isEmpty(str)) {
        return ''
    }
    return str.trim()
}

export const getSQLFormatScheduleDateArr = (scheduleDate, needFullStartEnd?) => {
    if (_.isEmpty(scheduleDate)) {
        return []
    }
    const dateArr = scheduleDate
    let startDate
    if (moment(dateArr[0]).format(TIME_FORMAT.Y_MM_DD) !== dateArr[0]) {
        startDate = moment(dateArr[0] + CommonLabel.END_OF_DAY_TIME)
    } else {
        startDate = moment(dateArr[0])
    }
    let start = moment(dateArr[0]).isBefore(moment(), MOMENT_STARTOF.DAY)
        ? moment().format(TIME_FORMAT.Y_MM_DD)
        : moment(startDate).format(TIME_FORMAT.Y_MM_DD)
    // for current week, need to pass full start and end date to query unscheduled EE, not today
    if (needFullStartEnd) {
        start = moment(startDate).format(TIME_FORMAT.Y_MM_DD)
    }
    const end = moment(startDate).endOf(MOMENT_STARTOF.WEEK).format(TIME_FORMAT.Y_MM_DD)
    return [start, end]
}

export const updateUnscheduledVisitListByDVLId = async (dvlId: string) => {
    try {
        const unscheduledDailyVisitList = await SoupService.retrieveDataFromSoup(
            'Visit_List__c',
            {},
            getObjByName('Visit_List__c').syncUpCreateFields,
            getObjByName('Visit_List__c').syncUpCreateQuery +
                `
            WHERE {Visit_List__c:Id} = '${dvlId}'
            `
        )
        const needUpdateDVL = unscheduledDailyVisitList[0].Unscheduled__c === BooleanStr.STR_TRUE
        const unscheduledWeeklyVisitList = await SoupService.retrieveDataFromSoup(
            'Visit_List__c',
            {},
            getObjByName('Visit_List__c').syncUpCreateFields,
            getObjByName('Visit_List__c').syncUpCreateQuery +
                `
            WHERE {Visit_List__c:Id} = '${unscheduledDailyVisitList[0]?.Visit_List_Group__c}'
            `
        )
        const needUpdateWVL = unscheduledWeeklyVisitList[0]?.Unscheduled__c === BooleanStr.STR_TRUE
        if (needUpdateDVL) {
            unscheduledDailyVisitList[0].Unscheduled__c = false
            unscheduledDailyVisitList[0].Unassigned_Employee_Cost__c = 0
            unscheduledDailyVisitList[0].Unassigned_Employee_Time__c = 0
            unscheduledDailyVisitList[0].Count_of_Unassigned_Employees__c = 0
            await syncUpObjUpdateFromMem(
                'Visit_List__c',
                filterExistFields('Visit_List__c', unscheduledDailyVisitList, [
                    'Id',
                    'Unscheduled__c',
                    'Unassigned_Employee_Cost__c',
                    'Unassigned_Employee_Time__c',
                    'Count_of_Unassigned_Employees__c'
                ])
            )
        }
        if (needUpdateWVL) {
            unscheduledWeeklyVisitList[0].Unscheduled__c = false
            unscheduledWeeklyVisitList[0].Unscheduled_Cost_Inclusion__c = false
            unscheduledWeeklyVisitList[0].Unassigned_Employee_Cost__c = 0
            unscheduledWeeklyVisitList[0].Unassigned_Employee_Time__c = 0
            unscheduledWeeklyVisitList[0].Count_of_Unassigned_Employees__c = 0
            await syncUpObjUpdateFromMem(
                'Visit_List__c',
                filterExistFields('Visit_List__c', unscheduledWeeklyVisitList, [
                    'Id',
                    'Unscheduled__c',
                    'Unassigned_Employee_Cost__c',
                    'Unassigned_Employee_Time__c',
                    'Count_of_Unassigned_Employees__c'
                ])
            )
        }
        return Promise.resolve(true)
    } catch (e) {
        await storeClassLog(Log.MOBILE_ERROR, updateUnscheduledVisitListByDVLId.name, getStringValue(e))
        return Promise.resolve(false)
    }
}

export const getUnassignedEEInfo = async (scheduleVisitListId, setUnassignedEEInfo, activeTab) => {
    const query = `SELECT Count_of_Unassigned_Employees__c, Unassigned_Employee_Time__c, Unassigned_Employee_Cost__c, 
    MerchRelief_Count_of_UnassignedEmployees__c, Merch_Relief_Unassigned_Employee_Time__c, 
    Merch_Relief_Unassigned_Employee_Cost__c, Sales_Count_of_Unassigned_Employees__c,
    Sales_Unassigned_Employee_Time__c, Sales_Unassigned_Employee_Cost__c 
    FROM Visit_List__c WHERE Id = '${scheduleVisitListId}' `
    const path = `query/?q=${query}`

    restDataCommonCall(path, 'GET')
        .then((res) => {
            const records = res?.data?.records
            if (!_.isEmpty(records[0])) {
                const visitList = records[0]
                const allEEMetrics = {
                    totalNumber: visitList?.Count_of_Unassigned_Employees__c,
                    totalTime: visitList?.Unassigned_Employee_Time__c,
                    totalCost: visitList?.Unassigned_Employee_Cost__c
                }
                const merchEEMetrics = {
                    totalNumber: visitList?.MerchRelief_Count_of_UnassignedEmployees__c,
                    totalTime: visitList?.Merch_Relief_Unassigned_Employee_Time__c,
                    totalCost: visitList?.Merch_Relief_Unassigned_Employee_Cost__c
                }
                const salesEEMetrics = {
                    totalNumber: visitList?.Sales_Count_of_Unassigned_Employees__c,
                    totalTime: visitList?.Sales_Unassigned_Employee_Time__c,
                    totalCost: visitList?.Sales_Unassigned_Employee_Cost__c
                }
                if (activeTab === 0) {
                    setUnassignedEEInfo(merchEEMetrics)
                } else if (activeTab === 1) {
                    setUnassignedEEInfo(salesEEMetrics)
                } else {
                    setUnassignedEEInfo(allEEMetrics)
                }
            }
        })
        .catch((err) => {
            storeClassLog(Log.MOBILE_ERROR, 'UnassignedEmployee.getUnassignedEEInfo', getStringValue(err))
        })
}

export const handleIgnoreEEClick = async (params) => {
    const {
        item,
        setIsLoading,
        scheduleVisitListId,
        dropDownRef,
        navigation,
        getUnassignedEEList,
        setUnassignedEEInfo,
        activeTab
    } = params
    try {
        const visitListId = item.wvlId
        const weeklyVisitList = await SoupService.retrieveDataFromSoup(
            'Visit_List__c',
            {},
            getObjByName('Visit_List__c').syncUpCreateFields,
            getObjByName('Visit_List__c').syncUpCreateQuery + ` WHERE {Visit_List__c:Id} = '${visitListId}'`
        )

        weeklyVisitList.forEach((element: any) => {
            element.Unscheduled_Cost_Inclusion__c = !item.isCostInclude
        })
        await syncUpObjUpdateFromMem(
            'Visit_List__c',
            filterExistFields('Visit_List__c', weeklyVisitList, ['Id', 'Unscheduled_Cost_Inclusion__c'])
        )
        await recalculateOrPublishSchedule(
            true,
            setIsLoading,
            scheduleVisitListId,
            dropDownRef,
            navigation,
            null,
            false
        )
        await getUnassignedEEList()
        await getUnassignedEEInfo(scheduleVisitListId, setUnassignedEEInfo, activeTab)
    } catch (err) {
        setIsLoading(false)
        storeClassLog(Log.MOBILE_ERROR, 'UnassignedEmployee.handleIgnoreEEClick', getStringValue(err))
    }
}

export const updateSalesBucketWhenReassigning = async (
    oldUserId: string,
    newUserId: string,
    visitIds: Array<string>,
    DVLIds: Array<string>,
    visitDates: Array<string>,
    lineCodeMap: any,
    isFromPublished: boolean
) => {
    try {
        const userInfo = await SoupService.retrieveDataFromSoup(
            'User',
            {},
            ['Id', 'LC_ID__c'],
            `SELECT {User:Id}, {User:LC_ID__c} FROM {User} WHERE {User:Id} IN (${getIdClause([oldUserId, newUserId])})`
        )
        const newUserInfo = userInfo.filter((info) => info.Id === newUserId)
        const userLineCodes = lineCodeMap.get(LineCodeGroupType.LandingPageGroup)
        const salesLineCodes = userLineCodes[UserType.UserType_Sales]
        const weekStart = moment(visitDates[0]).day(WeekDayIndex.SUNDAY_NUM).format(TIME_FORMAT.Y_MM_DD)
        const weekEnd = moment(visitDates[0]).day(WeekDayIndex.SATURDAY_NUM).format(TIME_FORMAT.Y_MM_DD)
        const merchOrOthersVisits = await queryVisitByStartDateAndEndDate(
            newUserId,
            weekStart,
            weekEnd,
            isFromPublished
        )
        const oldVisits = await SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            ['Id', 'Sales_Visit__c'],
            `SELECT {Visit:Id}, {Visit:Sales_Visit__c} FROM {Visit} WHERE {Visit:Id} IN (${getIdClause(visitIds)})`
        )
        const hasOldSalesVisit = oldVisits.some((visit) => visit.Sales_Visit__c === BooleanStr.STR_TRUE)
        // sales or merch or others has a full day visits and Sale_Visit__c = true, return true
        if (!_.isEmpty(merchOrOthersVisits)) {
            // if new owner has sales visits
            const hasSalesVisit = merchOrOthersVisits.find((visit) => visit.Sales_Visit__c === BooleanStr.STR_TRUE)
            if (hasSalesVisit) {
                return Promise.resolve(true)
            }
            return Promise.resolve(false)
        }
        const salesVisits = await queryVisitByStartDateAndEndDate(oldUserId, weekStart, weekEnd, isFromPublished)
        // full week
        if (salesVisits.length === visitIds.length) {
            return Promise.resolve(hasOldSalesVisit)
        }
        // exist a full day visits
        const dateVisitIdMap = new Map()
        const allVisitsQueriedByDVL = await SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            ['Id', 'Planned_Date__c'],
            `SELECT {Visit:Id}, {Visit:Planned_Date__c} FROM {Visit} WHERE {Visit:Visit_List__c} IN (${getIdClause(
                DVLIds
            )})`
        )
        for (const item of allVisitsQueriedByDVL) {
            if (!dateVisitIdMap.has(item.Planned_Date__c)) {
                dateVisitIdMap.set(item.Planned_Date__c, [item.Id])
            } else {
                dateVisitIdMap.set(item.Planned_Date__c, [item.Id, ...dateVisitIdMap.get(item.Planned_Date__c)])
            }
        }
        for (const date of visitDates) {
            const hasNoFullDayVisit = dateVisitIdMap?.get(date)?.some((id) => !visitIds.includes(id))
            if (!hasNoFullDayVisit) {
                // full day to sales or merch and others have Sale_Visit__c = true visits
                return Promise.resolve(salesLineCodes.includes(newUserInfo[0].LC_ID__c) || hasOldSalesVisit)
            }
        }
        // merch and others to sales, update Sales_Visit__c = true
        if (salesLineCodes.includes(newUserInfo[0].LC_ID__c)) {
            return Promise.resolve(true)
        }
        return Promise.resolve(false)
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, 'updateSalesBucketWhenReassigning', ErrorUtils.error2String(e))
        return Promise.resolve(false)
    }
}

export const compositeMyDayVisitListStatus = (item, tempMetrics, inProgress?, yet2Start?) => {
    if (_.isEmpty(item?.visits)) {
        if (!_.isEmpty(yet2Start)) {
            item.status = yet2Start
        }
        return
    }
    const allStatus = item?.VisitListData?.map((visit) => {
        return visit.status
    })
    if (!_.isEmpty(allStatus)) {
        if (allStatus.indexOf(VisitListStatus.IN_PROGRESS) >= 0) {
            if (!_.isEmpty(inProgress)) {
                item.status = inProgress
            }
            tempMetrics.inProgress++
        } else if (
            allStatus.every((val) => {
                return val === VisitListStatus.COMPLETED
            })
        ) {
            item.status = VisitStatus.COMPLETED.toLowerCase()
            tempMetrics.completed++
        } else {
            if (!_.isEmpty(yet2Start)) {
                item.status = yet2Start
            }
            tempMetrics.yet2Start++
        }
    }
}

export const getLocationList = () => {
    return [
        { text: t.labels.PBNA_MOBILE_PLANT, value: 'Plant' },
        { text: t.labels.PBNA_MOBILE_FIRST_STOP, value: '1st Stop' },
        { text: t.labels.PBNA_MOBILE_HOME, value: 'Home' }
    ]
}

export const getCurrentSvgId = async (date, setIsLoading) => {
    const scheduleRecordTypeId = await getRecordTypeIdByDeveloperName('Schedule_Visit_Group', 'Visit_List__c')
    const startDate = moment(date).day(WeekDayIndex.SUNDAY_NUM).format(TIME_FORMAT.Y_MM_DD)
    const endDate = moment(date).day(WeekDayIndex.SATURDAY_NUM).format(TIME_FORMAT.Y_MM_DD)
    const svgList: any = await queryScheduleVisit(
        CommonParam.userId,
        startDate,
        endDate,
        scheduleRecordTypeId,
        setIsLoading
    )
    for (const svg of svgList) {
        if (svg?.Status__c === VisitListStatus.ACCEPTED) {
            return svg.Id
        }
    }
    return null
}

export const getUnassignedVisits = async (params) => {
    const { date, setIsLoading, setUnassignVisits, setUnassignCustomerList } = params
    try {
        const weekLabel = getWeekLabel()
        const items = {}
        const hasUnassignVisitMap = {}
        const svgId = await getCurrentSvgId(date, setIsLoading)

        if (!svgId) {
            setUnassignCustomerList([])
            setUnassignVisits([])
            return
        }

        const result = await SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            ScheduleQuery.getPublishUnassignedVisits.f,
            formatString(ScheduleQuery.getPublishUnassignedVisits.q, [svgId])
        )

        result.forEach((visit) => {
            if (visit?.Route_Group__c) {
                return
            }
            const weekName = weekLabel[moment(visit.Planned_Date__c).weekday()]
            const tmpTotalMinus = getTotalMinus(visit.Planned_Duration_Minutes__c, visit.Planned_Travel_Time__c)
            const tmpTotalHours = getTotalHours(visit.Planned_Duration_Minutes__c, visit.Planned_Travel_Time__c)
            if (!visit?.VisitorId) {
                hasUnassignVisitMap[visit.StoreId] = true
            }
            const shippingAddress = JSON.parse(visit.ShippingAddress)
            if (shippingAddress) {
                shippingAddress.street = shippingAddress?.street?.replace(/[\r\n]/g, ' ')
            }
            const visitObj = {
                id: visit.Id,
                date: visit.Planned_Date__c,
                visitor: visit.VisitorId,
                status: visit.Status__c,
                subtype: visit.Visit_Subtype__c,
                takeOrder: visit.Take_Order_Flag__c,
                sequence: parseInt(visit.Sequence__c),
                pullNum: parseInt(visit.Pull_Number__c) || 0,
                managerAdHoc: visit.Manager_Ad_Hoc__c === BooleanStr.STR_TRUE,
                totalDuration: Number(visit?.Planned_Duration_Minutes__c) || 0,
                totalMinus: tmpTotalMinus,
                totalHours: tmpTotalHours,
                totalCases: Number(visit?.Scheduled_Case_Quantity__c) || 0,
                totalMiles: Number(visit?.Planned_Mileage__c) || 0,
                name: visit.AccountName,
                address: shippingAddress?.street || '',
                cityStateZip: computeShipAddress(shippingAddress),
                phone: visit.AccountPhone,
                latitude: JSON.parse(visit?.Store_Location__c)?.latitude,
                longitude: JSON.parse(visit?.Store_Location__c)?.longitude,
                storeLocation: visit?.Store_Location__c,
                user: {
                    id: visit.UserId,
                    name: visit.Username,
                    userStatsId: visit.UserStatsId,
                    firstName: visit.FirstName,
                    lastName: visit.LastName
                }
            }
            if (!items[visit.StoreId]) {
                // user does not exist
                items[visit.StoreId] = {
                    id: visit.StoreId,
                    totalVisit: 1,
                    case_volume: 1,
                    visitor: visit.UserId,
                    busnLvl3: visit.busnLvl3,
                    name: visit.AccountName,
                    address: shippingAddress?.street || '',
                    cityStateZip: computeShipAddress(shippingAddress),
                    cof: visit.COF,
                    storeNumber: visit.StoreNumber,
                    phone: visit.AccountPhone,
                    latitude: visit.Latitude,
                    longitude: visit.Longitude,
                    repName: _.isEmpty(visit.Sales_Rep_Info) ? null : JSON.parse(visit.Sales_Rep_Info).Name,
                    salesRoute: visit.LOCL_RTE_ID__c,
                    nrid: visit.GTMU_RTE_ID__c,
                    visits: {
                        [weekName]: [visitObj]
                    }
                }
            } else {
                // user exist
                items[visit.StoreId].totalVisit++
                items[visit.StoreId].case_volume++
                // Push Visit to the List
                if (items[visit.StoreId].visits[weekName]) {
                    items[visit.StoreId].visits[weekName].push(visitObj)
                } else {
                    items[visit.StoreId].visits[weekName] = [visitObj]
                }
            }
        })
        Object.keys(hasUnassignVisitMap).forEach((storeId) => {
            items[storeId].hasUnassignVisit = true
        })
        await handleUnassignData(Object.values(items), setUnassignCustomerList, setUnassignVisits)
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'getUnassignedVisits', getStringValue(error))
    }
}

export const getReassignEmployeeList = async (
    startDate,
    endDate,
    setIsLoading,
    getEmployeeListForReassign,
    dropDownRef,
    setSVGId?
) => {
    try {
        const scheduleRecordTypeId = await getRecordTypeIdByDeveloperName('Schedule_Visit_Group', 'Visit_List__c')
        const svgList = await queryScheduleVisit(
            CommonParam.userId,
            startDate,
            endDate,
            scheduleRecordTypeId,
            setIsLoading
        )
        const visitListId = svgList[0]?.Id
        if (visitListId) {
            setSVGId && setSVGId(visitListId)
            getEmployeeListForReassign({
                visitListId,
                userLocationId: CommonParam.userLocationId,
                dropDownRef
            })
        }
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'getReassignEmployeeList', getStringValue(error))
    }
}

export const renderUnassignVisitBar = (currentUnassignVisits, toViewVisits, styles) => {
    if (_.isEmpty(currentUnassignVisits)) {
        return null
    }
    let totalDuration = 0
    currentUnassignVisits.forEach((visit) => {
        totalDuration += visit.totalDuration
    })

    const { hour, min } = getHourAndMin(totalDuration)
    return (
        <TouchableOpacity onPress={toViewVisits} style={[styles.tabRow, styles.unassignTabRow, { borderRadius: 10 }]}>
            <Image style={styles.unassignTabUnassignImage} source={ImageSrc.IMG_UNASSIGN_TRANSPARENT} />
            <CText style={styles.unassignTabText}>
                <CText style={styles.fontSize_700}>{currentUnassignVisits.length}</CText>
                {` ${t.labels.PBNA_MOBILE_UNASSIGNED_VISIT_S} `}
                <CText style={styles.fontSize_700}>{hour}</CText>
                {` ${t.labels.PBNA_MOBILE_HR} `}
                <CText style={styles.fontSize_700}>{min}</CText>
                {` ${t.labels.PBNA_MOBILE_MIN} `}
            </CText>
            <Image style={styles.unassignTabNextImage} source={ImageSrc.IMG_CHEVRON} />
        </TouchableOpacity>
    )
}

export const sortByParamsASC = (param1, param2) => {
    if (param1 > param2) {
        return 1
    }
    if (param1 < param2) {
        return -1
    }
    return 0
}

export const sortByParamsDESC = (param1, param2) => {
    if (param1 < param2) {
        return 1
    }
    if (param1 > param2) {
        return -1
    }
    return 0
}

export const sortArrByParamsASC = (arr, param) => {
    return arr.sort((a, b) => {
        return sortByParamsASC(a[param], b[param])
    })
}

export const sortArrByParamsDESC = (arr, param) => {
    return arr.sort((a, b) => {
        return sortByParamsDESC(a[param], b[param])
    })
}

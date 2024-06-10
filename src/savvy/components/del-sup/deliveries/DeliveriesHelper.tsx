import _ from 'lodash'
import moment from 'moment'
import { restApexCommonCall, syncDownObj } from '../../../api/SyncUtils'
import { CommonParam } from '../../../../common/CommonParam'
import { Log } from '../../../../common/enums/Log'
import { BooleanStr } from '../../../enums/Manager'
import { COLOR_TYPE } from '../../../enums/MerchandiserEnums'
import { RecordTypeEnum, VisitListRecordTypeEnum } from '../../../enums/RecordType'
import { VisitStatus } from '../../../enums/Visit'
import { t } from '../../../../common/i18n/t'
import { SoupService } from '../../../service/SoupService'
import { getRecordTypeIdByDeveloperName } from '../../../utils/CommonUtils'
import { DelSupEmployeeList, DelSupVisitList, DelSupOrderList } from './DeliveriesQuery'
import { getTimeString } from '../../../../common/utils/DateUtils'
import {
    getGeoFenceDataInDeliver,
    orderOffScheduleSumQuery,
    orderSumQuery,
    shipmentSumQuery,
    visitRelatedShipmentSumQuery
} from './DelEmployeeScheduleHelper'
import { VisitListStatus } from '../../../enums/VisitList'
import { getIdClause, sortArrByParamsASC } from '../../manager/helper/MerchManagerHelper'
import { getDeliveryMethodByCode } from '../../../model/Order'
import {
    composeVisitRacetrackData,
    configureTotalVisit,
    sortByDateFieldAscNullAsLast
} from '../../sales/my-day/MydayHelper'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'
import { exeAsyncFunc } from '../../../../common/utils/CommonUtils'

export const getUserHoursAndStatus = async (params, visitArr?, fromSales?) => {
    const { lstUserId, strDate, strPersona, lstVisitId } = params
    let sData = { unassign: [] }
    if (fromSales) {
        visitArr?.forEach((visit) => {
            if (visit.VisitorId) {
                if (!sData[`${visit.VisitorId}-${visit.RouteSalesGeoId}`]) {
                    sData[`${visit.VisitorId}-${visit.RouteSalesGeoId}`] = [visit]
                } else {
                    sData[`${visit.VisitorId}-${visit.RouteSalesGeoId}`].push(visit)
                }
            } else {
                if (!sData.unassign) {
                    sData.unassign = [visit]
                } else {
                    sData.unassign.push(visit)
                }
            }
        })
    }
    try {
        let res
        if (!fromSales) {
            res = await restApexCommonCall('getEmployeeListSchedule', 'POST', {
                lstUserId,
                strDate,
                strPersona
            })
            sData = JSON.parse(res.data) || {}
            const vRes = await restApexCommonCall('getEmployeeUnassignListSchedule', 'POST', {
                lstVisitId,
                strDate,
                strPersona
            })
            const uassignData = JSON.parse(vRes.data)
            if (!_.isEmpty(uassignData)) {
                sData.unassign = uassignData.unassign
            }
        }
        return sData
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'getUserHoursAndStatus', getStringValue(error))
        return {}
    }
}

export enum MyDayDeliveryTabs {
    'employee' = 'employee',
    'deliveries' = 'deliveries',
    'order' = 'order'
}
const configureInitLoadNumVL = (user) => {
    return {
        Id: user.Id,
        id: user.Id,
        unassign: user.unassign,
        name: user.Name,
        storeName: user.StoreName,
        AccountPhone: user.AccountPhone,
        firstName: user.FirstName,
        lastName: user.LastName,
        VisitListId: user.Visit_List__c,
        gpid: user.GPID__c,
        buid: user.BU_ID__c,
        persona: user.PERSONA__c,
        visits: [user],
        all: 1,
        amas: [],
        finished: user.Status__c === VisitStatus.COMPLETE ? 1 : 0,
        inProgress: user.Status__c === VisitStatus.IN_PROGRESS ? 1 : 0,
        status: '',
        phone: user.MobilePhone,
        totalDuration: parseInt(user.Planned_Duration_Minutes__c),
        address: `${user.Street || ''}`,
        storeLocation: user.Store_Location__c,
        cityStateZip: `${user.City || ''}, ${user.State || ''}, ${user.PostalCode || ''} `,
        userStatsId: user.UserStatsId,
        LocalRoute: user.LocalRoute,
        NationalId: user.NationalId,
        LoadNum: user.LoadNum || '-',
        stores: [user.storeId],
        finishCs: user.actCs || 0,
        allCs: user.schCs || 0,
        shipmentNum: user.shipmentNum || 0,
        manifestHours: user.manifestHours || 0,
        isFavorited: user.Schedule_Favorited__c?.includes(CommonParam.userId),
        isMyDirect: user.Manager_Directs__c?.includes(CommonParam.userId)
    }
}

const configureDriverByLoadNum = (groupObj, item) => {
    if (_.isNumber(item.manifestHours)) {
        const userVisitList = _.isArray(groupObj.visits) ? groupObj.visits.map((visit) => visit.Visit_List__c) : []
        const isManifestHoursNotIncluded = userVisitList.indexOf(item.Visit_List__c) === -1
        if (isManifestHoursNotIncluded) {
            groupObj.manifestHours += item.manifestHours
        }
    }
    const vStatus = item.Status__c
    groupObj.visits.push(item)
    groupObj.totalDuration += parseInt(item.Planned_Duration_Minutes__c)
    groupObj.all++
    groupObj.LocalRoute = groupObj.LocalRoute || item.LocalRoute
    groupObj.NationalId = groupObj.NationalId || item.NationalId

    if (vStatus === VisitStatus.COMPLETE) {
        groupObj.finished++
    } else if (vStatus === VisitStatus.IN_PROGRESS) {
        groupObj.inProgress++
    }
    if (!groupObj.stores.includes(item.storeId)) {
        groupObj.allCs += item.schCs || 0
        groupObj.finishCs += item.actCs || 0
        groupObj.stores.push(item.storeId)
    }
}

const roundFloat = (num) => {
    let result = 0
    if (_.isNumber(_.toNumber(num))) {
        result = _.round(_.toNumber(num))
    }
    return result
}

const configureDayVisitListInfo = (groupObj) => {
    let completeCount = 0
    let inProgressCount = 0
    let noStartCount = 0

    const groupArr = Object.values(groupObj)

    groupArr.forEach((group: any) => {
        group.LocalRoute = group.LocalRoute || '-'
        group.NationalId = group.NationalId || '-'
        group.finishCs = roundFloat(group.finishCs)
        group.allCs = roundFloat(group.allCs)
        group.totalHrs = getTimeString(group.manifestHours)

        const statusGroup = group.visits?.map((i) => i.Visit_List_Status) || []
        if (statusGroup.every((status) => status === VisitListStatus.COMPLETED) || group.all === group.finished) {
            group.status = 'completed'
            completeCount++
        } else if (
            statusGroup.some((status) => status === VisitListStatus.IN_PROGRESS) ||
            group.finished > 0 ||
            group.inProgress > 0
        ) {
            group.status = 'inProgress'
            inProgressCount++
        } else {
            group.status = 'yet2Start'
            noStartCount++
        }
    })
    return { completeCount, inProgressCount, noStartCount }
}
const deliveryVLCondition = (dateStr) => {
    return `
    AND (
        {Visit_List__c:Visit_Date__c} = date('${dateStr}') 
    )
    `
}
const getDeliveryQuery = (dateStr, dvlRecordTypeId, vRecordTypeId, userLocationId) => {
    return `SELECT
    {User:Id},
    {User:Name},
    {User:FirstName},
    {User:LastName},
    {User:Phone},
    {User:GM_LOC_ID__c},
    {User:GPID__c},
    {User:BU_ID__c},
    {User:PERSONA__c},
    {User:Title},
    {User:MobilePhone},
    {User:FT_EMPLYE_FLG_VAL__c},
    {User_Stats__c:Id},
    {User_Stats__c:Schedule_Favorited__c},
    {User_Stats__c:Manager_Directs__c},
    {Visit_List__c:Start_Date_Time__c},
    {Visit_List__c:End_Date_Time__c},
    {Visit_List__c:OwnerId},
    {Visit_List__c:Status__c},
    {Visit_List__c:Visit_Date__c},
    {Visit_List__c:Id},
    {Visit_List__c:IsRemoved__c},
    {Visit_List__c:Load_Number__c},
    {Visit_List__c:Manifest_End_Time__c},
    {Visit_List__c:Manifest_Start_Time__c},
    {Visit:Planned_Date__c},
    {Visit:Id},
    {Visit:Check_In_Location_Flag__c},
    {Visit:Check_Out_Location_Flag__c},
    {Visit:RecordType.Name},
    {Visit:Visit_List__c},
    {Visit:VisitorId},
    {Visit:PlannedVisitStartTime},
    {Visit:ActualVisitEndTime},
    {Visit:ActualVisitStartTime},
    {Visit:Status__c},
    {Visit:Sequence__c},
    {Visit:Planned_Duration_Minutes__c},
    {Visit:Visit_Subtype__c},
    {Visit:Take_Order_Flag__c},
    {Visit:Pull_Number__c},
    {Visit:InstructionDescription},
    (${orderSumQuery('Total_Ordered_IntCount__c')}) schCs,
    (${shipmentSumQuery('Total_Delivered__c')}) actCs,
    (${visitRelatedShipmentSumQuery()}) shipmentNum,
    {RetailStore:Id},
    {RetailStore:Street},
    {RetailStore:City},
    {RetailStore:State},
    {RetailStore:Country},
    {RetailStore:PostalCode},
    {RetailStore:Latitude},
    {RetailStore:Longitude},
    {RetailStore:Store_Location__c},
    {RetailStore:Name},
    {Account:Phone},
    {Route_Sales_Geo__c:LOCL_RTE_ID__c},
    {Route_Sales_Geo__c:GTMU_RTE_ID__c}
    FROM {Visit} 
    JOIN {Visit_List__c} ON 
       {Visit_List__c:Id} = {Visit:Visit_List__c} 
       ${deliveryVLCondition(dateStr)}
       AND {Visit_List__c:IsRemoved__c} IS FALSE
       AND {Visit_List__c:RecordTypeId} = '${dvlRecordTypeId}'
       LEFT JOIN {User} ON {Visit:VisitorId} = {User:Id}
       LEFT JOIN {User_Stats__c} ON {User_Stats__c:User__c} = {User:Id}
       LEFT JOIN {RetailStore} ON {RetailStore:Id} = {Visit:PlaceId}
       LEFT JOIN {Account} ON {Account:Id} = {RetailStore:AccountId}
       LEFT JOIN {Route_Sales_Geo__c} ON {Route_Sales_Geo__c:Id} = {Visit:RTE_ID__c}
       WHERE 
       {Visit:Status__c} != '${VisitStatus.CANCELLED}'
       AND {Visit:Status__c} != '${VisitStatus.PLANNED}' 
       AND {Visit:Status__c} != '${VisitStatus.REMOVED}'
       AND {Visit:Status__c} != 'Failed'
       AND {Visit:RecordTypeId} = '${vRecordTypeId}'
       AND {RetailStore:LOC_PROD_ID__c} = '${userLocationId}'
       AND (({User:Id} IS NULL AND {Visit:VisitorId} IS NULL) OR ({User:Id} IS NOT NULL AND {Visit:VisitorId} IS NOT NULL))
       ORDER BY {User:LastName} NULLS LAST
       `
}
const getDeliveryRSQuery = (dateStr, dvlRecordTypeId, vRecordTypeId, userLocationId) => {
    return `
    SELECT
        {Visit:Id} AS Id,
        {Visit_List__c:Start_Time__c} AS StartTime,
        {Visit_List__c:Visit_Date__c} AS VisitDate,
        {Visit_List__c:Total_Planned_Time__c} AS TotalPlannedTime,
        {Visit_List__c:Planned_Mileage__c} AS PlannedMileage,
        {Visit_List__c:End_Time__c} AS EndTime,
        {Visit:ActualVisitStartTime} AS ActualStartTime,
        {Visit:ActualVisitEndTime} AS ActualEndTime,
        {Visit:Actual_Duration_Minutes__c} AS Actual_Duration_Minutes__c,
        {Visit:Check_Out_Location_Flag__c},
        {RetailStore:Id} AS StoreId,
        {RetailStore:AccountId} AS AccountId,
        {RetailStore:Account.Name} AS Name,
        {Visit:ActualVisitEndTime} IS NULL AS Finished,
        {Visit:Sequence__c} AS Sequence,
        {Visit:Status__c} AS Status,
        {RetailStore:Latitude} AS Latitude,
        {RetailStore:Longitude} AS Longitude,
        {RetailStore:Store_Location__c} AS StoreLocation,
        {RetailStore:Account.Phone} AS AccountPhone,
        (${orderOffScheduleSumQuery()}) sumOffSchedule,
        (${orderSumQuery('Total_Ordered_IntCount__c')}) schCs,
        (${shipmentSumQuery('Total_Delivered__c')}) actCs,
        (${orderSumQuery('Pallet_Total_IntCount__c')}) schPlt,
        (${orderSumQuery('Pallet_Total_IntCount__c', true)}) delPlt,
        {Visit:Ad_Hoc__c} AS AdHoc,
        {Visit:Manager_Ad_Hoc__c},
        {Visit:Planned_Duration_Minutes__c},
        {Visit:Planned_Travel_Time__c},
        {Visit:Planned_Mileage__c},
        {Visit:InstructionDescription},
        'Visit' AS SubType,
        {Visit:OwnerId} AS OwnerId,
        {Visit:PlannedVisitStartTime} AS PlannedStartTime,
        {Visit:PlannedVisitEndTime} AS PlannedEndTime,
        {Visit:Check_In_Location_Flag__c} AS InLocation,
        {Visit:Pull_Number__c} AS pullNumber,
        {Visit:Take_Order_Flag__c},
        {Visit:Visit_Subtype__c},
        {Visit:Planned_Date__c},
        {RetailStore:Account.ShippingAddress},
        {RetailStore:Account.CUST_ID__c},
        {RetailStore:Account.BUSN_SGMNTTN_LVL_3_NM__c},
        {RetailStore:Account.RTLR_STOR_NUM__c},
        {User:Id},
        {User:Name},
        {User:FirstName},
        {User:LastName},
        {User_Stats__c:Id}
        FROM {Visit}
        JOIN {Visit_List__c} ON
            {Visit_List__c:Id} = {Visit:Visit_List__c} 
            ${deliveryVLCondition(dateStr)}
            AND {Visit_List__c:RecordTypeId} = '${dvlRecordTypeId}'
            AND {Visit_List__c:IsRemoved__c} IS FALSE
        LEFT JOIN {RetailStore} ON {Visit:PlaceId} = {RetailStore:Id}
        LEFT JOIN {User} ON {Visit:VisitorId} = {User:Id}
        LEFT JOIN {User_Stats__c} ON {User_Stats__c:User__c} = {User:Id}
        WHERE {Visit:Status__c} != '${VisitStatus.CANCELLED}'
        AND {Visit:Status__c} != '${VisitStatus.PLANNED}' 
        AND {Visit:Status__c} != '${VisitStatus.REMOVED}'
        AND {Visit:Status__c} != 'Failed'
        AND {Visit:RecordTypeId} = '${vRecordTypeId}'
        AND {RetailStore:LOC_PROD_ID__c} = '${userLocationId}'
        AND (({User:Id} IS NULL AND {Visit:VisitorId} IS NULL) OR ({User:Id} IS NOT NULL AND {Visit:VisitorId} IS NOT NULL))
        ORDER BY Name, pullNumber NULLS LAST
    `
}

const getDeliveryOrderQuery = (locationId) => {
    return `
    SELECT
        {Order:Ordr_Id__c} AS OrderNumber,
        {Order:Dlvry_Rqstd_Dtm__c} AS OrderDlvryRqstdDtm,
        {Order:Id} AS Id,
        {Order:Visit__c} AS Visit,
        {Order:Off_Schedule__c} AS OffSchedule,
        {Order:Total_Ordered_IntCount__c} AS TotalOrdered,
        {Order:RTE_ID__c} AS RteId,
        {Order:RTE_ID__r.LOCL_RTE_ID__c} AS RSG_LOCL_RTE_ID__c,
        {Order:Delivery_Method_Code__c} AS DeliveryMethodCode,
        {RetailStore:Name} AS RetailStoreName,
        {RetailStore:Street} AS RetailStoreStreet,
        {RetailStore:City} AS RetailStoreCity,
        {RetailStore:State} AS RetailStoreState,
        {RetailStore:Country} AS RetailStoreCountry,
        {RetailStore:PostalCode} AS RetailStorePostalCode,
        {RetailStore:Latitude} AS Latitude,
        {RetailStore:Longitude} AS Longitude,
        {RetailStore:Store_Location__c} AS storeLocation,
        {Account:Name} AS AccountName,
        {Account:CUST_UNIQ_ID_VAL__c} AS COF,
        {Account:Id}
        FROM {Order}
        JOIN {RetailStore} ON {Order:RetailStore__c} = {RetailStore:Id}
        JOIN {Account} ON {Order:AccountId} = {Account:Id}
        LEFT JOIN {Shipment} ON {Shipment:Order_Id__c} = {Order:Ordr_Id__c}
        WHERE 
        {Account:LOC_PROD_ID__c} = '${locationId}'
        AND
        {Shipment:Order_Id__c} IS NULL
    `
}
export const UNASSIGN_ID = 'Unassign'
const LOAD_NUM_STR = 'LoadNum'
export const getDeliveriesEmployeeList = async (date) => {
    const dateStr = date.format(TIME_FORMAT.Y_MM_DD)
    const dvlRecordTypeId = await getRecordTypeIdByDeveloperName(
        VisitListRecordTypeEnum.DeliveryDailyVisitList,
        'Visit_List__c'
    )
    const vRecordTypeId = await getRecordTypeIdByDeveloperName(RecordTypeEnum.DELIVERY, 'Visit')

    const visits = await SoupService.retrieveDataFromSoup(
        'Visit',
        {},
        DelSupEmployeeList.f,
        getDeliveryQuery(dateStr, dvlRecordTypeId, vRecordTypeId, CommonParam.userLocationId)
    )
    const visitObj = {}
    visits.forEach((item) => {
        if (!visitObj[item.VisitId]) {
            visitObj[item.VisitId] = item
        } else {
            if (!visitObj[item.VisitId].LocalRoute && item.LocalRoute) {
                visitObj[item.VisitId].LocalRoute = item.LocalRoute
                visitObj[item.VisitId].NationalId = item.NationalId
            }
        }
    })
    const groupByLoadNumPerDriver = {}
    const userIdArr = []
    Object.values(visitObj).forEach((item: any) => {
        if (!item.VisitId) {
            return
        }
        if (!item.Id) {
            item.Id = UNASSIGN_ID + item.LoadNum
            item.Name = _.capitalize(t.labels.PBNA_MOBILE_UNASSIGNED)
            item.unassign = true
        }
        item.manifestHours = 0
        if (item.Manifest_End_Time__c && item.Manifest_Start_Time__c) {
            const momentEnd = moment(item.Manifest_End_Time__c)
            const momentStart = moment(item.Manifest_Start_Time__c)
            item.manifestHours = momentEnd.diff(momentStart)
        }
        const driverIdWithLoadNum = item.Id + '-' + item.LoadNum
        if (!groupByLoadNumPerDriver[driverIdWithLoadNum]) {
            groupByLoadNumPerDriver[driverIdWithLoadNum] = configureInitLoadNumVL(item)
            !item.unassign && configureTotalVisit(groupByLoadNumPerDriver[driverIdWithLoadNum], item)
            !item.unassign && userIdArr.push(item.Id)
        } else {
            !item.unassign && configureTotalVisit(groupByLoadNumPerDriver[driverIdWithLoadNum], item)
            configureDriverByLoadNum(groupByLoadNumPerDriver[driverIdWithLoadNum], item)
        }
    })
    composeVisitRacetrackData(groupByLoadNumPerDriver, null, true)
    const tempInfo = configureDayVisitListInfo(groupByLoadNumPerDriver)
    const list = Object.values(groupByLoadNumPerDriver)
    const unassignedVisits = list.filter((item: any) => item?.Id?.includes(UNASSIGN_ID))
    const normalVisits = list.filter((item: any) => !item?.Id?.includes(UNASSIGN_ID))
    const sortedUnassignedVisits = sortArrByParamsASC(unassignedVisits, LOAD_NUM_STR)
    return { list: [...sortedUnassignedVisits, ...normalVisits], scheduleInfo: tempInfo }
}

export const getRaceTrackColorForDelivery = (visitArr: any[]) => {
    visitArr.forEach((visit) => {
        visit.finalStatus = visit.statusTag
        if (visit.statusTag === VisitStatus.COMPLETE && visit.shipmentNum) {
            visit.color = COLOR_TYPE.GREEN
        } else if (visit.statusTag === VisitStatus.COMPLETE) {
            visit.color = COLOR_TYPE.RED
        } else {
            visit.color = COLOR_TYPE.GRAY
        }
    })
    return visitArr.sort((a, b) => {
        return sortByDateFieldAscNullAsLast(a, b, 'ActualVisitStartTime')
    })
}

const getDispatchActions = async (orderIds) => {
    try {
        const res = await syncDownObj(
            'Dispatch_Action__c',
            `SELECT Id, Additional_Comments__c, Dispatch_Action__c,
    Dock_End_Time__c, Dock_Start_Time__c,
    New_Delivery_Date__c, Order__c, Pallet_Type__c FROM Dispatch_Action__c
    WHERE Order__c IN (${getIdClause(orderIds)})`,
            false
        )
        return res?.data || []
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'getDispatchActions', getStringValue(error))
        return []
    }
}
export const getOrderItems = async (orderIds: Array<any>) => {
    try {
        if (_.isEmpty(orderIds)) {
            return []
        }
        const res = await syncDownObj(
            'OrderItem',
            `
        SELECT 
            Quantity, OrderId, Product2.PROD_MIX_CDE__c FROM OrderItem 
        WHERE 
            OrderId IN (${getIdClause(orderIds)})
        AND
            OrderItem.Item_Type__c = 'Order Item'
        AND OrderItem.Is_Modified__c = false
        `,
            false
        )
        return res?.data || []
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'getOrderItems', getStringValue(error))
        return []
    }
}
export const getOrderCount = (order) => {
    const orderItems = order.orderItems

    let fountainCount = 0
    let bcCount = 0
    let otherCount = 0

    orderItems?.forEach((orderItem) => {
        const mixCode = orderItem?.Product2?.PROD_MIX_CDE__c || ''
        if (['001', '002'].includes(mixCode)) {
            fountainCount += orderItem.Quantity || 0
        }
        if (['003', '005'].includes(mixCode)) {
            bcCount += orderItem.Quantity || 0
        }
        if (['006', '007', '008', '009'].includes(mixCode) || (!_.isEmpty(orderItem?.Product2) && mixCode === '')) {
            otherCount += orderItem.Quantity || 0
        }
    })

    return { fountainCount, bcCount, otherCount }
}
const getDeliveryMethod = async (RteCofArr) => {
    try {
        if (!RteCofArr || RteCofArr.length === 0) {
            return []
        }
        const tempRteCofArr = _.unionWith(RteCofArr, (a: any, b: any) => a.COF === b.COF && a.RteId === b.RteId)
        const sliceArr = _.chunk(tempRteCofArr, 50)
        let resArr = []
        for (const RteCotSectionArr of sliceArr) {
            let whereSql = 'where'
            RteCotSectionArr.forEach((item: any, index) => {
                whereSql += `${index === 0 ? '' : 'or'} (CUST_ID__c = '${item.COF}' and Route__c = '${item.RteId}')`
            })
            const res = await syncDownObj(
                'Customer_To_Route__c',
                `
            select
            CUST_ID__c,
            Route__c,
            DLVRY_MTHD_NM__c,
            Route__r.LOCL_RTE_ID__c 
            from Customer_To_Route__c 
            ${whereSql}
            `,
                false
            )

            const tempCtrArr = res?.data || []
            resArr = resArr.concat(tempCtrArr)
        }
        return resArr
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'getDeliveryMethod', getStringValue(error))
        return []
    }
}

export const getOrderTopMetrics = (orderList) => {
    if (!orderList) {
        return {}
    }

    const ordersWithVisit = orderList.filter((order) => !_.isEmpty(order.Visit))
    const stopsCount = _.uniqBy(ordersWithVisit, 'Visit').length

    let caseCount = 0
    orderList.forEach((item) => {
        const volume = item.volume
        if (_.isNumber(volume)) {
            caseCount += volume
        }
    })
    const offScheduleCount = orderList.filter((item) => item.OffSchedule === '1').length
    return {
        stopsCount,
        caseCount: Math.round(caseCount),
        offScheduleCount
    }
}

export const getDeliveriesOrderList = async (date) => {
    let list
    const orders = await SoupService.retrieveDataFromSoup(
        'Order',
        {},
        DelSupOrderList.f,
        getDeliveryOrderQuery(CommonParam.userLocationId)
    )
    list = orders.filter((order) => moment(order.OrderDlvryRqstdDtm).isSame(date, 'day'))
    const orderIds = list.map((item) => item.Id)
    // Set Order DispatchActions.
    let actions = [] as any
    const sliceArr = _.chunk(orderIds, 100)
    for (const tempArr of sliceArr) {
        const tempActions = await getDispatchActions(tempArr)
        actions = actions.concat(tempActions)
    }
    const actionObj = {} as any
    actions.forEach((item: any) => {
        if (!actionObj[item.Order__c]) {
            actionObj[item.Order__c] = [item]
        } else {
            actionObj[item.Order__c].push(item)
        }
    })
    // Set order items.
    const orderItems = await getOrderItems(orderIds)
    const orderItemObj = {} as any
    orderItems.forEach((orderItem) => {
        if (orderItemObj[orderItem.OrderId]) {
            orderItemObj[orderItem.OrderId].push(orderItem)
        } else {
            orderItemObj[orderItem.OrderId] = [orderItem]
        }
    })
    // Set delivery method.
    const RteCofArr = list
        .filter((item) => item.RteId && item.COF)
        .map((item) => {
            return {
                RteId: item.RteId,
                COF: item.COF
            }
        })
    const deliveryMethods = await getDeliveryMethod(RteCofArr)
    const deliveryInfoObj = {}
    deliveryMethods.forEach((deliveryInfo) => {
        const tempItem = {
            DLVRY_MTHD_NM__c: deliveryInfo.DLVRY_MTHD_NM__c,
            ...deliveryInfo.Route__r
        }
        if (!deliveryInfoObj[deliveryInfo.Route__c]) {
            deliveryInfoObj[deliveryInfo.Route__c] = [tempItem]
        } else {
            deliveryInfoObj[deliveryInfo.Route__c].push(tempItem)
        }
    })

    list = list.map((tempItem) => {
        tempItem.DispatchActions = actionObj[tempItem.Id] || []
        tempItem.orderItems = orderItemObj[tempItem.Id]
        const { fountainCount, bcCount, otherCount } = getOrderCount(tempItem)
        tempItem.fountainCount = fountainCount
        tempItem.bcCount = bcCount
        tempItem.otherCount = otherCount
        tempItem.volume = _.isNumber(_.toNumber(tempItem.TotalOrdered)) ? _.toNumber(tempItem.TotalOrdered) : 0
        tempItem.deliveryMethod = getDeliveryMethodByCode(tempItem.DeliveryMethodCode)
        const tempDeliveryArr = deliveryInfoObj[tempItem.RteId]
            ? _.unionBy(deliveryInfoObj[tempItem.RteId], 'DLVRY_MTHD_NM__c')
            : []
        tempItem.localRteId = tempDeliveryArr[0] ? tempDeliveryArr[0]?.LOCL_RTE_ID__c : ''
        return tempItem
    })

    // sort order by volume
    if (list.length > 1) {
        list.sort((a, b) => {
            const aVolume = a.volume || 0
            const bVolume = b.volume || 0
            return aVolume - bVolume
        })
    }
    const scheduleInfo = getOrderTopMetrics(list)
    return { list, scheduleInfo }
}

export const getDeliveriesVisitList = async (date) => {
    const dateStr = date.format(TIME_FORMAT.Y_MM_DD)
    const dvlRecordTypeId = await getRecordTypeIdByDeveloperName(
        VisitListRecordTypeEnum.DeliveryDailyVisitList,
        'Visit_List__c'
    )
    const vRecordTypeId = await getRecordTypeIdByDeveloperName(RecordTypeEnum.DELIVERY, 'Visit')
    const visits = await SoupService.retrieveDataFromSoup(
        'Visit',
        {},
        DelSupVisitList.f,
        getDeliveryRSQuery(dateStr, dvlRecordTypeId, vRecordTypeId, CommonParam.userLocationId)
    )
    let geoFenceData = []
    if (visits.length > 0) {
        await exeAsyncFunc(async () => {
            geoFenceData = await getGeoFenceDataInDeliver(visits, dateStr)
        })
    }
    const tempVisitList = []
    let deliveryCount = 0
    _.unionBy(visits, 'Id').forEach((item) => {
        if (!item.UserId) {
            item.unassign = true
        }
        if (item.status !== VisitStatus.COMPLETE && item.status !== VisitStatus.IN_PROGRESS) {
            deliveryCount++
        }
        const address = JSON.parse(item.ShippingAddress)
        item.id = item.Id
        item.cityStateZip = `${address.city ? address.city + ', ' : ''}${address.state ? address.state : ''}${
            address.postalCode ? ' ' + address.postalCode : ''
        } `
        item.address = address.street || ''
        item.inLocation = item.InLocation === BooleanStr.STR_TRUE
        tempVisitList.push(item)
    })
    const caseCount = tempVisitList.reduce((p, n) => p + n?.schCs || 0, 0)
    const offScheduleCount = tempVisitList.reduce((p, n) => p + n?.sumOffSchedule || 0, 0)
    const tempInfo = { deliveryCount, caseCount, offScheduleCount }
    return { list: tempVisitList, scheduleInfo: tempInfo, geoFenceData }
}

export function getActiveTabName(activeTabIndex: number): MyDayDeliveryTabs {
    const selectTabData = [
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
    const name = selectTabData[activeTabIndex].name.toLocaleLowerCase()
    switch (name) {
        case t.labels.PBNA_MOBILE_EMPLOYEES.toLocaleLowerCase():
            return MyDayDeliveryTabs.employee
        case t.labels.PBNA_MOBILE_DELIVERIES.toLocaleLowerCase():
            return MyDayDeliveryTabs.deliveries
        case t.labels.PBNA_MOBILE_METRICS_ORDERS.toLocaleLowerCase():
            return MyDayDeliveryTabs.order
        default:
            return MyDayDeliveryTabs.employee
    }
}

export const getOrderDispatchActionArr = (date, isUppercase?) => {
    const deleteAct = t.labels.PBNA_MOBILE_DELETE
    const rescheduleAct = t.labels.PBNA_MOBILE_RESCHEDULE
    const geoPalletOverride = t.labels.PBNA_MOBILE_GEO_PALLET_OVERRIDE
    const orderSpecificTime = t.labels.PBNA_MOBILE_ORDER_SPECIFIC_TIME_WINDOW
    const currentDate = moment()
    const reqTime = moment(date)
    let nDeleteAct = deleteAct
    let nRescheduleAct = rescheduleAct
    let nGeoPalletOverride = geoPalletOverride
    let nOrderSpecificTime = orderSpecificTime
    if (isUppercase) {
        nDeleteAct = deleteAct.toUpperCase()
        nRescheduleAct = rescheduleAct.toUpperCase()
        nGeoPalletOverride = geoPalletOverride.toUpperCase()
        nOrderSpecificTime = orderSpecificTime.toUpperCase()
    }
    let actionArr = []
    let tooltipHeight = 60
    if (reqTime.isBefore(currentDate)) {
        actionArr = [nRescheduleAct, nDeleteAct]
        tooltipHeight = 100
    } else if (reqTime.isAfter(currentDate)) {
        actionArr = [nRescheduleAct, nGeoPalletOverride, nOrderSpecificTime]
        tooltipHeight = 160
    } else if (reqTime.isSame(currentDate)) {
        actionArr = [nRescheduleAct]
    }
    return { actions: actionArr, tooltipHeight: tooltipHeight }
}

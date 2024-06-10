import {
    getVisitList,
    getRetailStoreByIdList,
    getShipment,
    getUserInfo,
    syncDownShipment,
    syncDownUserRoute,
    syncDownVisitList,
    getOrderListByVisit,
    syncDownOrderByVisit,
    getOrderListByRetailStoreList,
    syncDownOrderByRetailStoreId
} from '../domain/my-day/RouteInfoData'
import { getIndicatorType, getNumberString, INDICATOR_TYPE } from '../../savvy/components/merchandiser/DeliveryLogo'
import { OrderItemType, ShipmentStatus } from '../../savvy/enums/Visit'
import { CommonParam } from '../../common/CommonParam'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import AccountDM from '../domain/account/AccountDM'
import VisitDM from '../domain/visit/VisitDM'
import OrderDM from '../domain/order/OrderDM'
import UserDM from '../domain/user/UserDM'
import _ from 'lodash'
import { VisitType } from '../component/visits/RouteInfoModal'

export const geUserCardData = async (userId: string, visitType: VisitType) => {
    const res = await getUserInfo(userId)
    return {
        title: visitType === 'Delivery' ? res[0].Title : res[0].PERSONA__c,
        phone: res[0].MobilePhone,
        ftFlag: res[0].FT_EMPLYE_FLG_VAL__c,
        startTime: res[0].Start_Time__c,
        PersonaDesc: res[0].PERSONA__c,
        firstName: res[0].FirstName,
        lastName: res[0].LastName,
        LOCL_RTE_ID__c: res[0]?.LOCL_RTE_ID__c,
        GTMU_RTE_ID__c: res[0]?.GTMU_RTE_ID__c,
        ...res[0]
    }
}

export const getOrderAndShipmentData = async (visits: any[], date: string, visitType: VisitType) => {
    let shipmentItems = []
    let orderList = []
    switch (visitType) {
        case 'Delivery':
            orderList = await getOrderListByRetailStoreList(
                visits.map((visit) => visit.Retail_Store__c),
                date
            )
            shipmentItems = await getShipment(orderList.map((order) => order.OrderId))
            break
        case 'Sales':
            orderList = await getOrderListByVisit(visits.map((visit) => visit.Id))
            break
        case 'Merchandising':
        default:
    }
    return { shipmentItems, orderList }
}
export const filterOrderAndShipmentData = (
    visit: object,
    orderList: any[],
    shipmentItems: any[],
    visitType: VisitType
) => {
    let shipmentList = []
    let order = []
    switch (visitType) {
        case 'Delivery':
            order = orderList.filter((order) => order.RetailStore__c === visit.Retail_Store__c)
            shipmentList = shipmentItems.filter((ship) => {
                return order.findIndex((ord) => ord.OrderId === ship.OrderId) !== -1
            })
            break
        case 'Sales':
            order = orderList.filter((order) => order.Visit__c === visit.Id)
            break
        case 'Merchandising':
        default:
    }
    return { shipmentList, order }
}

export const getRouteListData = async (userId: string, date: string, visitType: VisitType) => {
    const visits = await getVisitList(userId, date, visitType)
    const storeRes = await getRetailStoreByIdList(visits.map((item) => item.Retail_Store__c))
    const { shipmentItems, orderList } = await getOrderAndShipmentData(visits, date, visitType)
    return visits.map((item) => {
        const store = storeRes.find((store) => store.Id === item.Retail_Store__c)
        const { order, shipmentList } = filterOrderAndShipmentData(item, orderList, shipmentItems, visitType)
        const orderItems = shipmentList.filter((r) => r.Item_Type__c === OrderItemType.ORDER_ITEM)
        const palletItems = shipmentList
            .filter((r) => r.Item_Type__c === OrderItemType.PALLET_ITEM)
            .filter((p) => p.Pallet_Number__c)
        orderItems.forEach((item) => {
            item.Certified_Quantity__c =
                palletItems
                    .filter((pal) => pal.Order_Item__c === item.Id)
                    .reduce((a, b) => {
                        return a + Number(b.Certified_Quantity__c) || 0
                    }, 0) || 0
        })
        const issue =
            shipmentList.findIndex((shipmentItem) => {
                return (
                    getIndicatorType({
                        status: ShipmentStatus.CLOSED,
                        ordered: getNumberString(shipmentItem.Ordered_Quantity__c),
                        certified: getNumberString(shipmentItem.Certified_Quantity__c),
                        delivered: getNumberString(shipmentItem.Delivered_Quantity__c)
                    }) === INDICATOR_TYPE.RED
                )
            }) !== -1
        return {
            Visit: item,
            RetailStore: store,
            Order: {
                exist: order.length > 0,
                plt: order.reduce((acc, cur) => acc + Number(cur.Pallet_Total_IntCount__c), 0),
                cs: order.reduce((acc, cur) => acc + Number(cur.Total_Ordered_IntCount__c), 0)
            },
            Issue: issue
        }
    })
}

export const syncDownRouteInfo = async (userId: string, selectedDate: string, visitType: VisitType) => {
    const visitList = (await syncDownVisitList(userId, selectedDate))?.flat(Infinity)
    if (visitType === 'Delivery') {
        await syncDownShipment(visitList.map((visit) => visit.Id))
        await syncDownOrderByRetailStoreId(
            visitList.map((visit) => visit.Retail_Store__c),
            selectedDate
        )
    } else if (visitType === 'Sales') {
        await syncDownOrderByVisit(visitList.map((visit) => visit.Id))
    }
    await syncDownUserRoute(userId)
}

class RouteInfoService {
    static async syncMyDayRoutInfoData() {
        if (!_.isEmpty(CommonParam.userRouteId)) {
            const storeData = await AccountDM.getRetailStoreByRoute()
            try {
                const visitsDataArr = await VisitDM.getVisitDataByRoute(storeData)
                let visitsData: any[] = []
                visitsDataArr?.forEach((arrItem) => {
                    visitsData = visitsData.concat(arrItem)
                })
                const tasksRouteInfo = []
                if (_.size(visitsData) > 0) {
                    tasksRouteInfo.push(OrderDM.synDownOrderBySales(visitsData))
                    const visitorDupArrByUser = visitsData
                        .filter((empItem) => !_.isEmpty(empItem.User__c))
                        .map((visitItem) => visitItem.User__c)
                    const visitorArrByUser = _.uniq(visitorDupArrByUser)
                    if (_.size(visitorArrByUser) > 0) {
                        tasksRouteInfo.push(UserDM.synDownUser(visitorArrByUser))
                        tasksRouteInfo.push(UserDM.synDownUserStats(visitorArrByUser))
                    }
                    await Promise.all(tasksRouteInfo)
                }
            } catch (error) {
                storeClassLog(Log.MOBILE_ERROR, 'syncMyDayRoutInfoData', error)
            }
        }
    }
}
export default RouteInfoService

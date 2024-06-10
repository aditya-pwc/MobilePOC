import AsyncStorage from '@react-native-async-storage/async-storage'
import OrderDM from '../domain/order/OrderDM'
import VisitData from '../domain/visit/VisitData'
import OrderData from '../domain/order/OrderData'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import NetInfo from '@react-native-community/netinfo'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import CartDM from '../domain/order/CartDM'
import { CartItem } from '../interface/CartItem'
import { CartDetail } from '../interface/CartDetail'
import { PushCartToSFParams } from '../interface/CartInterfaces'
import AccountService from './AccountService'
import StoreProductDM from '../domain/store-product/StoreProductDM'
import { getIdClause } from '../../common/utils/CommonUtils'
import { CommonParam } from '../../common/CommonParam'
import {
    OrderLineActivityCde,
    OrderLineActivityCdv,
    PricePriority,
    ReturnConditionLabels,
    ReturnConditionStatusCodeMap
} from '../enum/Common'
import moment from 'moment'
import { MyDayVisitModel } from '../interface/MyDayVisit'
import { ReturnCartItem } from '../interface/ReturnProduct'
import { todayDateWithTimeZone } from '../../common/utils/TimeZoneUtils'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import {
    OrderATCTypeEnum,
    OrderComSourceEnum,
    OrderProductGroupCodeEnum,
    OrderSalesMethodDescriptionEnum,
    OrderStateCodeEnum
} from '../enum/OrderEnums'
import { ComposeOrder, ComposeOrderItem, Order } from '../interface/Order'
import _ from 'lodash'
import VisitDM from '../domain/visit/VisitDM'
import UserDM from '../domain/user/UserDM'
import { VisitList } from '../interface/VisitListModel'
import React from 'react'
import ProductService from './ProductService'
import SyncUpService from './SyncUpService'
import PriceService from './PriceService'
import { round2Digit } from '../utils/OchUtils'

const cartDM = new CartDM()
const storeProductDM = new StoreProductDM()
const orderDM = new OrderDM()
class OrderService {
    static readonly retrieveOrderData = OrderDM.retrieveOrderData
    static readonly retrieveOrderItemsForPackages = OrderDM.retrieveOrderItemsForPackages
    static readonly getOrderForOCHByUser = OrderDM.getOrderForOCHByUser
    static readonly getOrderItemByOrderForOCHRequest = OrderDM.getOrderItemByOrderForOCHRequest
    static readonly getOrderBySoupEntryId = OrderDM.getOrderBySoupEntryId
    static readonly syncOchLogs = OrderDM.syncOchLogs

    public static async syncUpStoreProducts(JSONFile: object, orderId: string) {
        await OrderDM.createSyncUpLocalJSONFile(JSONFile, orderId)
    }

    public static async getExistedProductInCurrentVisitCart(store?: any) {
        if (!store) {
            return null
        }
        const res = await OrderDM.getCartItemInRelatedStore(store)
        return res
    }

    static async deltaSyncDownOrderAndOrderItems(lastSyncTime: string, visitIds: string[]) {
        await OrderDM.syncDownOrderByVisitIds(visitIds, lastSyncTime)
        const orderIdList = await OrderData.getAllOrderIdsAndCreatedByIds()
        if (orderIdList.length) {
            const orderIds = orderIdList.filter((o) => !_.isEmpty(o?.Id)).map((o) => o?.Id)
            const userGPIds = _.uniq(orderIdList.filter((o) => o.Created_By_GPID__c).map((o) => o.Created_By_GPID__c))
            await Promise.all([
                OrderDM.syncDownOrderItemsByOrderId(orderIds, lastSyncTime),
                UserDM.syncDownOrderRelatedData(userGPIds)
            ])
        }
    }

    public static async calculateOrderCasesForOrders(
        orders: Array<Order>,
        setOrderCount: React.Dispatch<
            React.SetStateAction<{
                plannedCases: number
                orderCases: number
                returns: number
            }>
        >
    ) {
        await OrderDM.calculateOrderCasesForOrders(orders, setOrderCount)
    }

    public static async setOrderUserData(createdByGPId: string, setUserData: React.Dispatch<any>) {
        return await OrderDM.setOrderUserData(createdByGPId, setUserData)
    }

    /**
     * Delta sync down order and replace fake orders with real orders from integration
     * Since we do not sync up order, this task has no risk of pending sync up orders been overwritten
     * For today's order only
     * @static
     * @return {*}
     * @memberof OrderService
     */
    static async deltaSyncAndReplaceOrder() {
        const netInfo = await NetInfo.fetch()
        if (!netInfo.isInternetReachable) {
            return
        }
        const newLastSyncTimeStr = new Date().toISOString()
        const configLastSyncTime = await AsyncStorage.getItem('configLastSyncTime')
        const orderDeltaLastSyncTimeOrderade = await AsyncStorage.getItem('orderDeltaLastSyncTimeOrderade')
        const lastSyncTime = orderDeltaLastSyncTimeOrderade ?? (configLastSyncTime as string)
        const allVisitsToday = await VisitData.getAllSalesVisitsToday()
        const visitIds = allVisitsToday.map((el) => el.Id)
        try {
            await this.deltaSyncDownOrderAndOrderItems(lastSyncTime, visitIds)
            await OrderData.removeLocalDupOrder()
            await AsyncStorage.setItem('orderDeltaLastSyncTimeOrderade', newLastSyncTimeStr)
            return true
        } catch (err) {
            storeClassLog(Log.MOBILE_ERROR, 'onSyncButtonClicked', ErrorUtils.error2String(err))
        }
    }

    public static async clearCart(orderCartIdentifier: string, isReturnOnly?: boolean) {
        return await cartDM.clearCart(orderCartIdentifier, isReturnOnly)
    }

    public static async saveCart(cartItems: CartItem[]) {
        await cartDM.saveCart(cartItems)
    }

    public static async saveProductsToCart(
        storeId: string,
        finalProdLst: Array<CartItem>,
        orderCartIdentifier: string
    ) {
        await cartDM.saveProductsToCart(storeId, finalProdLst, orderCartIdentifier)
    }

    public static async clearCartDetail(storeId: string) {
        await cartDM.clearCartDetail(storeId)
    }

    public static async saveCartDetail(storeId: string, cartDetail: CartDetail, orderCartIdentifier: string) {
        await cartDM.saveCartDetail(storeId, cartDetail, orderCartIdentifier)
    }

    private static async assembleWholeSalePriceForProducts(products: ReturnCartItem[], CustUniqId: string) {
        try {
            const prodCopy = _.cloneDeep(products)
            const uniqIds = prodCopy.map((prod) => {
                return { 'Product.Material_Unique_ID__c': prod['Product2.Material_Unique_ID__c'] }
            })
            if (!_.isEmpty(uniqIds)) {
                const priceTable = await PriceService.getPricePriorityMap()
                const wholesalePriority = priceTable.get(PricePriority.WHOLESALE_PRICE)
                const priceGroups = await PriceService.getPriceGroupForAllProduct(
                    uniqIds as any,
                    CustUniqId,
                    false,
                    wholesalePriority ? +wholesalePriority : null
                )
                prodCopy.forEach((prod) => {
                    if (priceGroups[`${prod['Product2.Material_Unique_ID__c']}`]) {
                        prod.WholeSalePrice = priceGroups[`${prod['Product2.Material_Unique_ID__c']}`][0].Price
                    } else {
                        prod.WholeSalePrice = '0'
                    }
                })
                return prodCopy
            }
            return []
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: assembleWholeSalePriceForProducts',
                `assembleWholeSalePriceForProducts failed: ${ErrorUtils.error2String(e)}`
            )
            return []
        }
    }

    /* eslint-disable camelcase */
    public static async pushCartToSF(params: PushCartToSFParams) {
        const { visit, cartData: productsToPush, notes, PONumber, now, cartDetail, isReturnOnly, notesTime } = params
        const orderCartIdentifier = visit.OrderCartIdentifier || visit.VisitLegacyId
        try {
            const reginCode = await AccountService.getRouteBuId()
            let productsSorted = OrderService.getProductSorted(productsToPush, orderCartIdentifier)
            productsSorted = await this.assembleWholeSalePriceForProducts(productsSorted, visit.CustUniqId)
            const edvData = await OrderService.getEDVData(visit, productsToPush)
            const Order_Unique_Id__c = visit.CustUniqId + '_' + CommonParam.GPID__c + '_' + now
            const orderItems = OrderService.ReduceOrderItem(
                productsSorted,
                edvData,
                orderCartIdentifier,
                now,
                visit,
                Order_Unique_Id__c
            )
            // combine Material_UOM_Code_Value__c value
            const product2Ids = _.uniq(orderItems.map((orderItem) => orderItem.Product2Id))
            const products = await ProductService.getProductRelatedDataThroughIds(product2Ids)
            orderItems.forEach((orderItem) => {
                const product = products.find((item) => item.Id === orderItem.Product2Id)
                orderItem.Material_UOM_Code_Value__c = product?.Material_UOM_Code_Value__c
            })
            const isReturnOrder = productsSorted.some((p) => p.OrderCartIdentifier !== orderCartIdentifier)
            const orderType = isReturnOrder ? 'Return' : 'Order'
            const currentTime = moment().format(TIME_FORMAT.HHMMSS)
            const deliveryDate = `${moment(cartDetail?.DeliveryDate).format(TIME_FORMAT.Y_MM_DD)} ${currentTime}`
            const order = OrderService.ComposeOrder({
                visit,
                Order_Unique_Id__c,
                PONumber,
                deliveryDate,
                now,
                notes,
                orderType,
                reginCode,
                notesTime
            })
            const orderToSave = OrderDM.mappingOrderStagingAndOrder(order[0], null, true)
            const orderItemsToSave = orderItems.map((orderLineStaging) => {
                return OrderDM.mapOrderLineStagingAndOrderItem(orderLineStaging, null, true)
            })
            await this.upsertOrder([orderToSave])
            await this.upsertOrderItem(orderItemsToSave)
            const orderRes = await this.upsertOrderStaging(order)
            orderItems.forEach((oi: any) => {
                oi.oRefId = orderRes[0]._soupEntryId
            })
            await this.upsertOrderLineItemStaging(orderItems)
            await OrderService.clearCart(orderCartIdentifier, isReturnOnly)
            !isReturnOnly && (await this.clearCartDetail(visit.PlaceId as string))
            await SyncUpService.syncUpLocalData()
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: Submit Order',
                `Create order failed: ${ErrorUtils.error2String(e)}`
            )
        }
    }

    public static async getStoreProduct(condition: string[]) {
        return await storeProductDM.getStoreProduct(condition)
    }

    public static async upsertOrder(orderList: any[]) {
        return await orderDM.upsertOrder(orderList)
    }

    public static async upsertOrderItem(orderItemList: any[]) {
        return await orderDM.upsertOrderItem(orderItemList)
    }

    public static async upsertOrderStaging(orderStagingList: any[]) {
        return await orderDM.upsertOrderStaging(orderStagingList)
    }

    public static async upsertOrderLineItemStaging(orderLineItemStaging: any[]) {
        return await orderDM.upsertOrderLineItemStaging(orderLineItemStaging)
    }

    private static async getEDVData(visit: MyDayVisitModel, productsToPush: ReturnCartItem[]) {
        const condition = [
            `WHERE {StoreProduct:AccountId} = '${visit.AccountId}' AND {StoreProduct:ProductId} IN (${getIdClause(
                productsToPush.map((p) => p.Product2Id)
            )})`
        ]
        const sps = await OrderService.getStoreProduct(condition)
        const edvData = sps.map((sp: any) => {
            return {
                edvPrice: sp.EDV_Price__c as string,
                edvQuantity: sp.EDV_Qty__c as string,
                productId: sp.ProductId as string
            }
        })
        return edvData
    }

    private static getProductSorted(productsToPush: ReturnCartItem[], orderCartIdentifier: string) {
        return [
            ...productsToPush
                .filter((el) => el.OrderCartIdentifier === orderCartIdentifier && _.toNumber(el.Quantity) > 0)
                .sort((a, b) => {
                    return parseInt(b.Quantity || '0') - parseInt(a.Quantity || '0')
                }),
            ...productsToPush.filter((el) => el.OrderCartIdentifier !== orderCartIdentifier)
        ]
    }

    private static ReduceOrderItem(
        productsSorted: ReturnCartItem[],
        edvData: { edvPrice: string; edvQuantity: string; productId: string }[],
        orderCartIdentifier: string,
        now: number,
        visit: MyDayVisitModel,
        Order_Unique_Id__c: string
    ) {
        return productsSorted.reduce((prev: any[], item) => {
            const edvQtyPrice = edvData.find((edv) => edv.productId === item.Product2Id)
            const everyDayValue =
                edvQtyPrice && edvQtyPrice.edvQuantity ? `${edvQtyPrice.edvQuantity}/$${edvQtyPrice.edvPrice}` : ''
            if (item.OrderCartIdentifier === orderCartIdentifier) {
                OrderService.ComposeOrderItem1(item, prev, now, everyDayValue, visit, Order_Unique_Id__c)
            } else {
                let Sequence__c = prev.length
                const returnConditions = [
                    ReturnConditionLabels.SALEABLE,
                    ReturnConditionLabels.BREAKAGE,
                    ReturnConditionLabels.OUTOFDATE
                ]
                const caseConvFactor = parseInt(`${item['Product2.Config_Qty__c'] || 1}`) || 1
                returnConditions.forEach((label) => {
                    const cases = parseInt(item[(label + 'Cases') as keyof ReturnCartItem] as string) || 0
                    const units = parseInt(item[(label + 'Units') as keyof ReturnCartItem] as string) || 0
                    if (cases > 0 || units > 0) {
                        Sequence__c = OrderService.ComposeOrderItem2({
                            cases,
                            units,
                            caseConvFactor,
                            label,
                            item,
                            Sequence__c,
                            now,
                            everyDayValue,
                            visit,
                            Order_Unique_Id__c,
                            prev
                        })
                    }
                })
            }
            return prev
        }, [])
    }

    private static ComposeOrder(props: ComposeOrder) {
        const { visit, Order_Unique_Id__c, PONumber, deliveryDate, now, notes, orderType, reginCode, notesTime } = props

        return [
            {
                Customer_Id__c: visit.CustUniqId,
                Order_Unique_Id__c,
                Cust_Po_Id__c: PONumber.slice(0, 100),
                Dlvry_Rqstd_Dtm__c: moment(deliveryDate).utc().format(),
                Transaction_Time__c: moment(now).utc().format(),
                Sls_Mthd_Descr__c: OrderSalesMethodDescriptionEnum.Method003,
                vRefId: visit._soupEntryId,
                Visit_Id__c: visit.Id,
                Order_Notes__c: notes,
                Route_Id__c: visit.GTMUId,
                Route_SF_Id: visit.RteId,
                Type__c: orderType,
                Owner_Name__c: CommonParam.userName,
                Order_Stat_Code__c: OrderStateCodeEnum.OPN,
                Created_By_GPID__c: CommonParam.GPID__c,
                Modified_By_GPID__c: CommonParam.GPID__c,
                Transaction_Modified__c: false,
                Delivery_Method_Code__c: visit.DeliveryMethodCode,
                Ord_Dwnld_Flg__c: false,
                Ident_Item_Id__c: '0',
                Product_Group_Code__c: OrderProductGroupCodeEnum.Code001,
                Lock_Dte_Tme__c: moment(now).utc().format(),
                Source_Sys_Id__c: '1112',
                Region_Code__c: reginCode,
                Order_Com_Seq__c: '1',
                Order_Com_Time__c: notesTime ? moment(notesTime).utc().format() : null,
                Order_Com_Code__c: OrderProductGroupCodeEnum.Code001,
                Order_Com_Source__c: OrderComSourceEnum.HHC,
                Order_Reconciled__c: false,
                Send_Outbound__c: false,
                LOC_ID__c: CommonParam.userLocationId,
                EffectiveDate: todayDateWithTimeZone(true),
                AccountId: visit.AccountId,
                Order_ATC_Type__c: OrderATCTypeEnum.Normal
            }
        ]
    }

    private static ComposeOrderItem2(props: ComposeOrderItem) {
        const { cases, units, caseConvFactor, label, item, now, everyDayValue, visit, Order_Unique_Id__c, prev } = props
        let { Sequence__c } = props
        const Ordr_Ln_Rqstd_Qty__c = cases + Math.round((units * 100) / caseConvFactor) / 100
        const Inven_Cnd_Status_Code__c = ReturnConditionStatusCodeMap[label]
        const Ordr_Ln_Unit_Prc_Amt__c = round2Digit(parseFloat(item.UnitPrice || '0'))
        const returnLine = {
            Product2Id: item.Product2Id,
            ProductName: item['Product2.Name'],
            ProductSub_Brand__c: item['Product2.Sub_Brand__c'],
            ProductPackage_Type_Name__c: item['Product2.Package_Type_Name__c'],
            ProductCode: item['Product2.ProductCode'],
            ProductConfig_Qty__c: parseInt(`${item['Product2.Config_Qty__c'] || 1}`) || 1,
            Product_Id__c: item['Product2.Material_Unique_ID__c'],
            Material_UOM_Code_Value__c: item['Product2.Material_UOM_Code_Value__c'],
            Sequence__c: ++Sequence__c,
            Ordr_Ln_Actvy_Cdv__c: OrderLineActivityCdv.PBNA,
            Ordr_Ln_Rqstd_Qty__c,
            Ord_Lne_Actvy_Cde__c: OrderLineActivityCde.RETURN,
            Inven_Cnd_Status_Code__c,
            Order_Line_Type_Code__c: 'PRD',
            Transaction_Time__c: moment(now).utc().format(),
            Deal_Id__c: item.Deal_Id__c,
            Order_Line_Discount_Amt__c: Ordr_Ln_Unit_Prc_Amt__c, // bug 12471862
            Every_Day_Value__c: everyDayValue,
            Customer_Id__c: visit.CustUniqId,
            Order_Unique_Id__c,
            UnitPrice: item.UnitPrice,
            Product_Config_Qty__c: caseConvFactor,
            Whole_Cases_Quantity__c: cases,
            Remainder_Unit_Quantity__c: units,
            Ordr_Ln_Net_Amt__c: item.WholeSalePrice
        }
        prev.push(returnLine)
        return Sequence__c
    }

    private static ComposeOrderItem1(
        item: ReturnCartItem,
        prev: any[],
        now: number,
        everyDayValue: string,
        visit: MyDayVisitModel,
        Order_Unique_Id__c: string
    ) {
        const Ordr_Ln_Rqstd_Qty__c = parseInt(item.Quantity || '0')
        const Ordr_Ln_Unit_Prc_Amt__c = round2Digit(parseFloat(item.UnitPrice || '0'))
        const Sequence__c = prev.length + 1
        const orderLine = {
            Product2Id: item.Product2Id,
            ProductName: item['Product2.Name'],
            ProductSub_Brand__c: item['Product2.Sub_Brand__c'],
            ProductPackage_Type_Name__c: item['Product2.Package_Type_Name__c'],
            ProductCode: item['Product2.ProductCode'],
            ProductConfig_Qty__c: parseInt(`${item['Product2.Config_Qty__c'] || 1}`) || 1,
            Product_Id__c: item['Product2.Material_Unique_ID__c'],
            Material_UOM_Code_Value__c: item['Product2.Material_UOM_Code_Value__c'],
            Sequence__c,
            Ordr_Ln_Actvy_Cdv__c: OrderLineActivityCdv.PBNA,
            Ordr_Ln_Rqstd_Qty__c,
            Ord_Lne_Actvy_Cde__c: OrderLineActivityCde.DELIVERY,
            Order_Line_Type_Code__c: 'PRD',
            Transaction_Time__c: moment(now).utc().format(),
            Deal_Id__c: item.Deal_Id__c,
            Order_Line_Discount_Amt__c: Ordr_Ln_Unit_Prc_Amt__c, // bug 12471862
            Every_Day_Value__c: everyDayValue,
            Customer_Id__c: visit.CustUniqId,
            Order_Unique_Id__c,
            Inven_Cnd_Status_Code__c: '001',
            UnitPrice: item.UnitPrice,
            Ordr_Ln_Net_Amt__c: item.WholeSalePrice
        }
        prev.push(orderLine)
    }

    private static encodeDateTimeBase62WithRandom(input: string) {
        let index = 2
        let encoded = ''
        while (index + 1 < input.length) {
            encoded += this.numberToBase62(parseInt(input.slice(index, index + 2)))
            index += 2
        }
        const random = Math.floor(Math.random() * Math.pow(62, 3))
        encoded += this.numberToBase62(random).padStart(3, '0')
        return encoded
    }

    private static numberToBase62(input: number) {
        // eslint-disable-next-line no-secrets/no-secrets
        const base62Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
        let result = ''

        if (input === 0) {
            return '0'
        }

        while (input > 0) {
            const remainder = input % 62
            result = base62Chars.charAt(remainder) + result
            input = Math.floor(input / 62)
        }

        return result
    }

    static async getTodayLocalOrdersStatus() {
        return await OrderDM.getTodayLocalOrdersStatus()
    }

    static async getAllOrderData(uvls: VisitList[], isFullData: boolean) {
        // 1. Since local query doesn't support days limitation
        // we are selecting all the data
        // Might be problematic if there're more data than we need
        // 2. Since PBNA and BCD have different pulling logic
        // We have the if elses below to handle them
        let visitListIds: Array<string>
        const userVLIds = uvls.map((el) => el.Id)
        if (!isFullData) {
            const routeVisitListIds = await VisitDM.getRVLIdsCurRoute()
            visitListIds = [...routeVisitListIds, ...userVLIds]
        } else {
            visitListIds = userVLIds
        }
        if (!_.isEmpty(visitListIds)) {
            const visitIds = await VisitDM.getAllVisitIdsByVLIds(visitListIds)
            await OrderDM.syncDownOrderByVisitIds(visitIds)
        }
        // 1.order can be created on un-started visit from another route, this order is not associated to user vl
        // however it's still included in the push order status bar as count, need to pull it down
        // 2.also for past orders created by user, which are not associated with visit (on cur rvl and uvl), we still need to retry on failed ones
        // 3.in the past tab, if we have unstarted visit with orders that we created, we should display this visit
        await OrderDM.syncDownOrdersCreatedByCurUser()
        // not need to pull order item related to local created order
        const orderIdList = await OrderDM.getAllOrderIdsAndCreatedByIds()
        if (orderIdList.length) {
            const orderIds = orderIdList.filter((o) => !_.isEmpty(o?.Id)).map((o) => o?.Id)
            const userGPIds = _.uniq(orderIdList.filter((o) => o.Created_By_GPID__c).map((o) => o.Created_By_GPID__c))
            await Promise.all([
                OrderDM.syncDownOrderItemsByOrderId(orderIds),
                UserDM.syncDownOrderRelatedData(userGPIds)
            ])
        }
    }

    static deltaSyncDownPastOrders = OrderDM.deltaSyncDownPastOrders
    public static async syncUpOrderLocalData(resultsFromOch: any) {
        await OrderDM.syncUpOrderLocalData(resultsFromOch)
    }

    static deleteOrderKeepLocal = OrderDM.deleteOrderKeepLocal
    static deleteOrderItemKeepLocal = OrderDM.deleteOrderItemKeepLocal

    public static async getAllVisitRelatedOrderData(visitId: string | any, soupEntryId: string) {
        return await OrderDM.getAllVisitRelatedOrderData(visitId, soupEntryId)
    }
}

export default OrderService

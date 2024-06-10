import OrderData, { OrderUserInfo } from './OrderData'
import { MyDayVisitModel } from '../../interface/MyDayVisit'
import { CartItem } from '../../interface/CartItem'
import { CommonParam } from '../../../common/CommonParam'
import OrderSync from './OrderSync'
import VisitData from '../visit/VisitData'
import React from 'react'
import { Order } from '../../interface/Order'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import _ from 'lodash'
import { ReturnCartItem } from '../../interface/ReturnProduct'
import CommonData from '../common/CommonData'

const orderData = new OrderData()
class OrderDM {
    static deleteOrderKeepLocal = OrderData.deleteOrderKeepLocal
    static deleteOrderItemKeepLocal = OrderData.deleteOrderItemKeepLocal
    static getAllOrderIdsAndCreatedByIds = OrderData.getAllOrderIdsAndCreatedByIds
    static readonly retrieveOrderData = OrderData.retrieveOrderData
    static readonly retrieveOrderItemsForPackages = OrderData.retrieveOrderItemsForPackages
    static readonly compositeOrderGraphCall = OrderSync.compositeOrderGraphCall
    static readonly getOrderForOCHByUser = OrderData.getOrderForOCHByUser
    static readonly getOrderItemByOrderForOCHRequest = OrderData.getOrderItemByOrderForOCHRequest
    static readonly getOrderBySoupEntryId = OrderData.getOrderBySoupEntryId
    static readonly syncOchLogs = OrderSync.syncOchLogs

    public static createSyncUpLocalJSONFile(JSONFile: object, orderId: string) {
        return OrderSync.createSyncUpLocalJSONFile(JSONFile, orderId)
    }

    public static switchOCHMetaDataToggles() {
        return OrderData.switchOCHMetaDataToggles()
    }

    public static async getDefaultDeliveryDateForVisit(store: MyDayVisitModel, isReturnOnly?: boolean) {
        if (store.AdHoc) {
            return []
        }
        // return only always user first delivery date
        let indexStr
        if (isReturnOnly) {
            indexStr = ''
            // normal orders delivery date goes with order count
        } else {
            const countRes = await OrderData.getNormalOrderCountForVisit(store.Id)
            const orderCount = countRes[0].count
            indexStr = orderCount ? orderCount + 1 : ''
        }
        return [
            store[`VDelDate${indexStr}` as keyof MyDayVisitModel],
            store[`VNDelDate${indexStr}` as keyof MyDayVisitModel]
        ]
    }

    static getProductQty(cartData: Partial<ReturnCartItem>[]) {
        let qty = 0
        cartData?.forEach((item) => {
            if (item.Quantity) {
                qty = qty + parseInt(item.Quantity)
            }
        })
        return qty
    }

    public static async getCartItemInRelatedStore(store?: any) {
        const res = await OrderData.getCartItemInRelatedStore(store.storeId)
        if (res) {
            const cartItem: Partial<CartItem>[] = res.map((item) => {
                return {
                    Product2Id: '',
                    Quantity: item.Quantity.toString() || '',
                    RetailStoreId: item.RetailStoreId.toString() || ''
                }
            })
            const qty = OrderDM.getProductQty(cartItem)
            if (qty > 0) {
                return store
            }
        }
        return null
    }

    public static async setOrderUserData(createdByGPId: string, setUserData: React.Dispatch<any>) {
        let orderUserData: OrderUserInfo = []
        orderUserData = await OrderData.getOrderUserInfo(createdByGPId)
        if (!_.isEmpty(orderUserData)) {
            setUserData(orderUserData[0])
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
        const toDoObj = {
            plannedCases: 0,
            orderCases: 0,
            returns: 0
        }
        try {
            const orderItems = await OrderData.getOrderItemsRelatedToOrders(orders)
            if (!_.isEmpty(orderItems)) {
                orderItems && orderItems.map((v: any) => (toDoObj.orderCases += parseInt(v.Quantity)))
            }
            setOrderCount(toDoObj)
        } catch (e) {
            setOrderCount(toDoObj)
            storeClassLog(
                Log.MOBILE_ERROR,
                'calculateOrderCasesForOrders',
                `Get OrderItem data failed: ${ErrorUtils.error2String(e)}`
            )
        }
    }

    /**
     * conversion of Order Staging and Order
     * @param orderStaging order staging object
     * @param orderItem order object
     * @param isFromOrderStagingToOrder conversion relationship
     */
    public static mappingOrderStagingAndOrder(orderStaging: any, orderItem: any, isFromOrderStagingToOrder: boolean) {
        let result
        if (isFromOrderStagingToOrder) {
            result = {
                Visit__c: orderStaging.Visit_Id__c,
                Customer_Id__c: orderStaging.Customer_Id__c,
                Cust_Po_Id__c: orderStaging.Cust_Po_Id__c,
                Dlvry_Rqstd_Dtm__c: orderStaging.Dlvry_Rqstd_Dtm__c,
                Transaction_Time__c: orderStaging.Transaction_Time__c,
                Sls_Mthd_Descr__c: 'Pre-Sell',
                Ordr_Tot_Tax_Amt__c: orderStaging.Ordr_Tot_Tax_Amt__c,
                Order_Notes__c: orderStaging.Order_Notes__c,
                RTE_ID__c: orderStaging.Route_SF_Id,
                RTE_ID__r: {
                    GTMU_RTE_ID__c: orderStaging.Route_Id__c
                },
                Type: orderStaging.Type__c, // psr modal doesn't exist now
                Order_Unique_Id__c: orderStaging.Order_Unique_Id__c,
                Id: orderStaging.Order_Unique_Id__c,
                Owner_Name__c: orderStaging.Owner_Name__c, // local
                Status: orderStaging.Order_Stat_Code__c,
                Created_By_GPID__c: orderStaging.Created_By_GPID__c, // local
                Modified_By_GPID__c: orderStaging.Modified_By_GPID__c, // local
                Transaction_Modified__c: orderStaging.Transaction_Modified__c, // local
                Delivery_Method_Code__c: orderStaging.Delivery_Method_Code__c,
                // Delete_flag__c: orderStaging.Delete_Flag__c,
                Ord_Dwnld_Flg__c: orderStaging.Ord_Dwnld_Flg__c, // local not need in sf order
                Ident_Item_Id__c: orderStaging.Ident_Item_Id__c, // local didn't exist in FMD
                Product_Group_Code__c: orderStaging.Product_Group_Code__c, // local not need in sf order
                Lock_Dte_Tme__c: orderStaging.Lock_Dte_Tme__c, // local not need in sf order
                Source_Sys_Id__c: orderStaging.Source_Sys_Id__c, // local not need in sf order
                Region_Id__c: orderStaging.Region_Code__c,
                Order_Com_Seq__c: orderStaging.Order_Com_Seq__c, // local didn't exist in FMD
                Order_Com_Time__c: orderStaging.Order_Com_Time__c, // local didn't exist in FMD
                Order_Com_Code__c: orderStaging.Order_Com_Code__c, // local didn't exist in FMD
                Order_Com_Source__c: orderStaging.Order_Com_Source__c, // local didn't exist in FMD
                Send_Outbound__c: orderStaging.Send_Outbound__c, // local didn't exist in FMD
                OCH_Response_Code__c: orderStaging.OCH_Response_Code__c, // local didn't exist in FMD
                Order_Reconciled__c: orderStaging.Order_Reconciled__c, // local didn't exist in FMD
                vRefId: orderStaging.vRefId,
                OwnerId: CommonParam.userId,
                LOC_ID__c: orderStaging.LOC_ID__c,
                EffectiveDate: orderStaging.EffectiveDate,
                AccountId: orderStaging.AccountId,
                Order_ATC_Type__c: orderStaging.Order_ATC_Type__c
            }
        } else {
            result = {
                Visit_Id__c: orderItem.Visit__c,
                Customer_Id__c: orderItem.Customer_Id__c,
                Cust_Po_Id__c: orderItem.Cust_Po_Id__c,
                Dlvry_Rqstd_Dtm__c: orderItem.Dlvry_Rqstd_Dtm__c,
                Transaction_Time__c: orderItem.Transaction_Time__c,
                Sls_Mthd_Descr__c: '003',
                Ordr_Tot_Tax_Amt__c: orderItem.Ordr_Tot_Tax_Amt__c,
                Order_Notes__c: orderItem.Order_Notes__c,
                Route_Id__c: orderItem['RTE_ID__r.GTMU_RTE_ID__c'],
                Type__c: orderItem.Type, // psr modal doesn't exist now
                Order_Unique_Id__c: orderItem.Order_Unique_Id__c,
                Owner_Name__c: orderItem.Owner_Name__c, // local
                Order_Stat_Code__c: orderItem.Status,
                Created_By_GPID__c: orderItem.Created_By_GPID__c, // local
                Modified_By_GPID__c: orderItem.Modified_By_GPID__c, // local
                Transaction_Modified__c: orderItem.Transaction_Modified__c, // local
                Delivery_Method_Code__c: orderItem.Delivery_Method_Code__c,
                // Delete_Flag__c: orderItem.Delete_flag__c,
                Ord_Dwnld_Flg__c: orderItem.Ord_Dwnld_Flg__c, // local
                Ident_Item_Id__c: orderItem.Ident_Item_Id__c, // local
                Product_Group_Code__c: orderItem.Product_Group_Code__c, // local
                Lock_Dte_Tme__c: orderItem.Lock_Dte_Tme__c, // local
                Source_Sys_Id__c: orderItem.Source_Sys_Id__c, // local
                Region_Code__c: orderItem.Region_Id__c,
                Order_Com_Seq__c: orderItem.Order_Com_Seq__c, // local
                Order_Com_Time__c: orderItem.Order_Com_Time__c, // local
                Order_Com_Code__c: orderItem.Order_Com_Code__c, // local
                Order_Com_Source__c: orderItem.Order_Com_Source__c, // local
                Send_Outbound__c: orderItem.Send_Outbound__c, // local
                OCH_Response_Code__c: orderItem.OCH_Response_Code__c, // local
                Order_Reconciled__c: orderItem.Order_Reconciled__c, // local
                vRefId: orderItem.vRefId,
                LOC_ID__c: orderItem.LOC_ID__c,
                EffectiveDate: orderItem.EffectiveDate,
                AccountId: orderItem.AccountId,
                Order_ATC_Type__c: orderItem.Order_ATC_Type__c
            }
        }
        return result
    }

    public static mapOrderLineStagingAndOrderItem(
        orderLineStaging: any,
        orderItem: any,
        isFromOrderLineStagingToOrderItem: boolean
    ) {
        let result
        if (isFromOrderLineStagingToOrderItem) {
            result = {
                Product2Id: orderLineStaging.Product2Id,
                Product2: {
                    Material_Unique_ID__c: orderLineStaging.Product_Id__c,
                    Name: orderLineStaging.ProductName,
                    Sub_Brand__c: orderLineStaging.ProductSub_Brand__c,
                    Package_Type_Name__c: orderLineStaging.ProductPackage_Type_Name__c,
                    ProductCode: orderLineStaging.ProductCode,
                    Config_Qty__c: parseInt(`${orderLineStaging.ProductConfig_Qty__c || 1}`) || 1
                },
                Sequence__c: orderLineStaging.Sequence__c,
                Ordr_Ln_Actvy_Cdv__c: orderLineStaging.Ordr_Ln_Actvy_Cdv__c,
                Ordr_Ln_Rqstd_Qty__c: orderLineStaging.Ordr_Ln_Rqstd_Qty__c,
                Ordr_Ln_Net_Amt__c: orderLineStaging.Ordr_Ln_Net_Amt__c,
                Inven_Cnd_Status_Code__c: orderLineStaging.Inven_Cnd_Status_Code__c,
                Mtrl_Rtrn_Rsn_Cdv__c: orderLineStaging.Inven_Cnd_Status_Code__c, // prod is using Mtrl_Rtrn_Rsn_Cdv__c
                ord_lne_actvy_cde__c: orderLineStaging.Ord_Lne_Actvy_Cde__c, // exist on sf order item, but not in FMD
                Ord_Lne_Typ_Desc__c: orderLineStaging.Order_Line_Type_Code__c,
                Transaction_Time__c: orderLineStaging.Transaction_Time__c,
                Deal_Id__c: orderLineStaging.Deal_Id__c, // local not need in sf order item
                // change mapping fields in story 12151960
                Ordr_Ln_Unit_Prc_Amt__c: orderLineStaging.Order_Line_Discount_Amt__c,
                // Charge_Nontaxable_Amount__c: orderLineStaging.Charge_Nontaxable_Amount__c,
                // Charge_Taxable_Amount__c: orderLineStaging.Charge_Taxable_Amount__c,
                // Delete_Flag__c: orderLineStaging.Delete_Flag__c,
                // Override_Reason_code__c: orderLineStaging.Override_Reason_code__c, // local not need in sf order item
                // Sell_Init_Id__c: orderLineStaging.Sell_Init_Id__c, // local  not need in sf order item
                // Sell_Init_Qty__c: orderLineStaging.Sell_Init_Qty__c, // local not need in sf order item
                Every_Day_Value__c: orderLineStaging.Every_Day_Value__c, // local not need in sf order item
                // On_Hand_Qty__c: orderLineStaging.On_Hand_Qty__c, // local not need in sf order item
                // Override_Code__c: orderLineStaging.Override_Code__c, // local not need in sf order item
                OrderId: orderLineStaging.Order_Unique_Id__c, //  match OrderId in order item, it's sf id
                // Order_Ln_Dep_Amount__c: orderLineStaging.Order_Ln_Dep_Amount__c
                Customer_Id__c: orderLineStaging.Customer_Id__c, // ?
                Quantity: orderLineStaging.Ordr_Ln_Rqstd_Qty__c,
                UnitPrice: orderLineStaging.UnitPrice
            }
        } else {
            result = {
                Product_Id__c: orderItem['Product2.Material_Unique_ID__c'],
                Sequence__c: orderItem.Sequence__c,
                Ordr_Ln_Actvy_Cdv__c: orderItem.Ordr_Ln_Actvy_Cdv__c,
                Ordr_Ln_Rqstd_Qty__c: orderItem.Ordr_Ln_Rqstd_Qty__c,
                Ordr_Ln_Net_Amt__c: orderItem.Ordr_Ln_Net_Amt__c,
                Inven_Cnd_Status_Code__c: orderItem.Inven_Cnd_Status_Code__c,
                Ord_Lne_Actvy_Cde__c: orderItem.ord_lne_actvy_cde__c,
                Order_Line_Type_Code__c: orderItem.Ord_Lne_Typ_Desc__c,
                Transaction_Time__c: orderItem.Transaction_Time__c,
                Deal_Id__c: orderItem.Deal_Id__c, // local
                Order_Line_Discount_Amt__c: orderItem.Ordr_Ln_Unit_Prc_Amt__c,
                // Charge_Nontaxable_Amount__c: orderItem.Charge_Nontaxable_Amount__c,
                // Charge_Taxable_Amount__c: orderItem.Charge_Taxable_Amount__c,
                // Delete_Flag__c: orderItem.Delete_Flag__c,
                // Override_Reason_code__c: orderItem.Override_Reason_code__c, // local
                // Sell_Init_Id__c: orderItem.Sell_Init_Id__c, // local
                // Sell_Init_Qty__c: orderItem.Sell_Init_Qty__c, // local
                Every_Day_Value__c: orderItem.Every_Day_Value__c, // local
                // On_Hand_Qty__c: orderItem.On_Hand_Qty__c, // local
                // Override_Code__c: orderItem.Override_Code__c, // local
                Order_Unique_Id__c: orderItem.OrderId, // local
                // Order_Ln_Dep_Amount__c: orderItem.Order_Ln_Dep_Amount__c
                Customer_Id__c: orderItem.Customer_Id__c,
                UnitPrice: orderItem.UnitPrice
            }
        }
        return result
    }

    public async upsertOrder(orderList: any[]) {
        return await orderData.upsertOrder(orderList)
    }

    public async upsertOrderItem(orderItemList: any[]) {
        return await orderData.upsertOrderItem(orderItemList)
    }

    public async upsertOrderStaging(orderStagingList: any[]) {
        return await orderData.upsertOrderStaging(orderStagingList)
    }

    public async upsertOrderLineItemStaging(orderLineItemStaging: any[]) {
        return await orderData.upsertOrderLineItemStaging(orderLineItemStaging)
    }

    static async getTodayLocalOrdersStatus() {
        const orders = await OrderData.getLocalOrdersStatus()
        return {
            total: orders.length,
            completed: orders.filter((el) => el.Id).length
        }
    }

    public static async syncUpOrderLocalData(resultsFromOch: any) {
        // push orders start
        const ordersToPush = await OrderData.getOrdersToPush()
        let ordersToPost: Array<any> = []
        if (ordersToPush.length) {
            // fill back visit__c after visit synced up
            const vRefIdsToPull = ordersToPush
                .filter((one) => !one.Visit_Id__c)
                .map((one) => one.vRefId) as Array<string>
            if (vRefIdsToPull.length) {
                const refVisits = await VisitData.getOrderRelatedVisitBySoupEntryId(vRefIdsToPull)
                ordersToPush.forEach((o) => {
                    if (!o.Visit_Id__c) {
                        o.Visit_Id__c = refVisits.find((one) => one._soupEntryId === o.vRefId)?.Id || ''
                    }
                })
            }
            ordersToPush.forEach((o) => {
                delete o.vRefId
            })
            ordersToPost = ordersToPush.filter((o) => !o.Id)
            await OrderSync.syncUpOrderLocalData(ordersToPush)
        }
        // push order items start
        const orderItemsToPush = await OrderData.getOrderItemsToPush()
        if (orderItemsToPush.length) {
            // Since the maximum nodes per graph call is 500
            // And we have about 10 order item per order
            // 30 order max each day
            // To make sure the users won't cause any error, we set it to 20
            await this.compositeOrderGraphCall({
                parentObjName: 'Ord_Staging__c',
                parentObjs: ordersToPost,
                method: 'POST',
                childObjName: 'OrdLineItem_Staging__c',
                childObjs: orderItemsToPush,
                isParentChildBind: true,
                refField: 'oRefId',
                resultsFromOch: resultsFromOch
            })
        }
    }

    public static async getAllVisitRelatedOrderData(
        visitId: string | any,
        soupEntryId: string
    ): Promise<Array<Partial<Order>>> {
        let allOrderData: Partial<Order>[] = []
        const pushedOrder = await OrderData.getAllVisitRelatedOrderData(visitId, soupEntryId)
        // order table has dup between fake orders and real orders
        allOrderData = _.uniqBy(pushedOrder, 'Order_Unique_Id__c')
        return allOrderData
    }

    public static async synDownOrderBySales(visitsData: any[]) {
        const orderSyncFields = CommonData.getAllFieldsByObjName('Order', 'Remote')
        return OrderSync.synDownOrderBySales(_.uniq(visitsData.map((visitItem) => visitItem.Id)), orderSyncFields)
    }

    public static async syncDownOrderItemsByOrderId(orderIds: string[], lastModifiedDate?: string) {
        const orderItemSyncFields = CommonData.getAllFieldsByObjName('OrderItem', 'Remote')
        return await OrderSync.syncDownOrderItemsByOrderId(orderIds, orderItemSyncFields, lastModifiedDate)
    }

    public static async syncDownOrderByVisitIds(visitIds: string[], lastModifiedDate?: string) {
        const orderSyncFields = CommonData.getAllFieldsByObjName('Order', 'Remote')
        return await OrderSync.syncDownOrderByVisitIds(visitIds, orderSyncFields, lastModifiedDate)
    }

    public static async syncDownOrdersCreatedByCurUser() {
        const orderSyncFields = CommonData.getAllFieldsByObjName('Order', 'Remote')
        return await OrderSync.syncDownOrdersCreatedByCurUser(orderSyncFields)
    }

    static async deltaSyncDownPastOrders(lastModifiedDate: string) {
        const orderSyncFields = CommonData.getAllFieldsByObjName('Order', 'Remote')
        await OrderSync.deltaSyncDownPastOrders(lastModifiedDate, orderSyncFields)
    }
}

export default OrderDM

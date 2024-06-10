/*
 * @Author: Tom tong.jiang@pwc.com
 * @Date: 2024-01-22 16:39:24
 * @LastEditors: Tom tong.jiang@pwc.com
 * @LastEditTime: 2024-03-29 15:31:24
 */
import { CommonParam } from '../../../common/CommonParam'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import _ from 'lodash'
import BaseInstance from '../../../common/BaseInstance'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { OCHSettingMetaDataTypes } from '../../enum/Common'
import { Order } from '../../interface/Order'
import { getIdClause } from '../../../common/utils/CommonUtils'
import { SoupNames } from '../../enum/SoupNames'
import { OrderItem } from '../../interface/OrderItem'
import { EmployeeToRoute } from '../../interface/ETRModel'
import { UserStats } from '../../interface/User_Stats__c'
import { User } from '../../interface/UserModel'
import { ProductSKUType } from '../../hooks/OrderHooks'
import React from 'react'
import { SFRecord } from 'common-mobile-lib/@common-mobile-lib/sf-soup-engine/src/SfSoupInterface'
import { StoreProduct } from '../../interface/StoreProduct'

export type OrderUserInfo = (Array<User> & Array<EmployeeToRoute> & Array<UserStats>) | []

class OrderData {
    static async fetchOrderMetrics(isPast: boolean, inputDate: string) {
        try {
            const orderInfo = await BaseInstance.sfSoupEngine.retrieve(
                'Order',
                ['Count'],
                `
                SELECT
                    SUM({OrderItem:Quantity}),
                    {Order:Id}
                FROM {Order}
                LEFT JOIN {OrderItem}
                    ON {OrderItem:OrderId} = {Order:Id}
                    OR {OrderItem:oRefId} = {Order:_soupEntryId}
                WHERE
                    {Order:Created_By_GPID__c} = '${CommonParam.GPID__c}'
                    AND {Order:LOC_ID__c} = '${CommonParam.userLocationId}'
                    AND {Order:EffectiveDate} = '${inputDate}'
                GROUP BY {Order:Created_By_GPID__c}
                `,
                [],
                {},
                false,
                false
            )
            const otherPsrOrderQtyRes = await BaseInstance.sfSoupEngine.retrieve(
                'Order',
                ['Count'],
                `
                SELECT
                    SUM({OrderItem:Quantity})
                FROM {Order}
                LEFT JOIN {OrderItem}
                    ON {OrderItem:OrderId} = {Order:Id}
                    OR {OrderItem:oRefId} = {Order:_soupEntryId}
                WHERE
                    {Order:Created_By_GPID__c} != '${CommonParam.GPID__c}'
                    AND {Order:LOC_ID__c} = '${CommonParam.userLocationId}'
                    AND {Order:EffectiveDate} = '${inputDate}'
                    And {Order:RTE_ID__r.GTMU_RTE_ID__c} = '${CommonParam.userRouteGTMUId}'
                GROUP BY {Order:Created_By_GPID__c}
                `,
                [],
                {},
                false,
                false
            )
            const orderQty = orderInfo[0]?.Count ? Number(orderInfo[0]?.Count) : 0
            let currentRouteOtherPsrOrderQty = 0
            otherPsrOrderQtyRes.forEach((v: any) => {
                currentRouteOtherPsrOrderQty += Number(v.Count)
            })
            return isPast ? orderQty : orderQty + currentRouteOtherPsrOrderQty
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: fetchOrderMetrics',
                `Failed to fetch data from Order&OrderItems, error: ${ErrorUtils.error2String(err)}`
            )
        }
    }

    public static async getOrderBySoupEntryId(ordersToUpdateSentToOchFlag: Array<Order>) {
        try {
            const res = await BaseInstance.sfSoupEngine.retrieve(
                'Ord_Staging__c',
                [],
                undefined,
                [
                    `WHERE {Ord_Staging__c:_soupEntryId} IN (${getIdClause(
                        ordersToUpdateSentToOchFlag.map((o) => o._soupEntryId)
                    )})`
                ],
                {},
                true,
                true
            )
            return res
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'Orderade: getOrderBySoupEntryId', ErrorUtils.error2String(e))
            return []
        }
    }

    public static async getOrderItemByOrderForOCHRequest(matchField: string, matchIds: Array<string>) {
        try {
            const res = await BaseInstance.sfSoupEngine.retrieve(
                'OrdLineItem_Staging__c',
                [
                    'Id',
                    'Inven_Cnd_Status_Code__c',
                    'oRefId',
                    'Sequence__c',
                    'Ordr_Ln_Actvy_Cdv__c',
                    'Ordr_Ln_Rqstd_Qty__c',
                    'Order_Line_Type_Code__c',
                    'Deal_Id__c',
                    'Product_Id__c',
                    'Ordr_Ln_Net_Amt__c',
                    'Order_Line_Discount_Amt__c',
                    'Order_Unique_Id__c',
                    'Ord_Lne_Actvy_Cde__c',
                    'Product_Config_Qty__c',
                    'Material_UOM_Code_Value__c',
                    'Whole_Cases_Quantity__c',
                    'Remainder_Unit_Quantity__c'
                ],
                ` 
                    SELECT 
                        {OrdLineItem_Staging__c:Id},
                        {OrdLineItem_Staging__c:Inven_Cnd_Status_Code__c},
                        {OrdLineItem_Staging__c:oRefId},
                        {OrdLineItem_Staging__c:Sequence__c}, 
                        {OrdLineItem_Staging__c:Ordr_Ln_Actvy_Cdv__c}, 
                        {OrdLineItem_Staging__c:Ordr_Ln_Rqstd_Qty__c}, 
                        {OrdLineItem_Staging__c:Order_Line_Type_Code__c}, 
                        {OrdLineItem_Staging__c:Deal_Id__c}, 
                        {OrdLineItem_Staging__c:Product_Id__c}, 
                        {OrdLineItem_Staging__c:Ordr_Ln_Net_Amt__c}, 
                        {OrdLineItem_Staging__c:Order_Line_Discount_Amt__c}, 
                        {OrdLineItem_Staging__c:Order_Unique_Id__c}, 
                        {OrdLineItem_Staging__c:Ord_Lne_Actvy_Cde__c},
                        {OrdLineItem_Staging__c:Product_Config_Qty__c},
                        {OrdLineItem_Staging__c:Material_UOM_Code_Value__c},
                        {OrdLineItem_Staging__c:Whole_Cases_Quantity__c},
                        {OrdLineItem_Staging__c:Remainder_Unit_Quantity__c}
                    FROM
                        {OrdLineItem_Staging__c}
                    WHERE {OrdLineItem_Staging__c:${matchField}} IN (${getIdClause(matchIds)})
                `,
                [],
                {},
                true,
                true
            )
            return res
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'Orderade: getOrderItemByOrderForOCHRequest', ErrorUtils.error2String(e))
            return []
        }
    }

    public static async getOrderForOCHByUser(userGPId: string): Promise<SFRecord[]> {
        try {
            const res = await BaseInstance.sfSoupEngine.retrieve(
                'Ord_Staging__c',
                [
                    'Id',
                    'Order_Com_Time__c',
                    'Order_Unique_Id__c',
                    'Route_Id__c',
                    'Source_Sys_Id__c',
                    'Dlvry_Rqstd_Dtm__c',
                    'Ordr_Tot_Tax_Amt__c',
                    'SoupEntryId',
                    'Order_Notes__c',
                    'Cust_Po_Id__c',
                    'Transaction_Time__c',
                    'VIS_GTMU_RTE_ID__c',
                    'CTR_DELY_MTHD_CDE__c',
                    'VIS_Name',
                    'VisitId',
                    'RTE_Region_Code__c',
                    'ACCOUNT_CUST_UNIQ_ID_VAL__c'
                ],
                `
            SELECT 
                {Ord_Staging__c:Id},
                {Ord_Staging__c:Order_Com_Time__c},
                {Ord_Staging__c:Order_Unique_Id__c},
                {Ord_Staging__c:Route_Id__c},
                {Ord_Staging__c:Source_Sys_Id__c},
                {Ord_Staging__c:Dlvry_Rqstd_Dtm__c},
                {Ord_Staging__c:Ordr_Tot_Tax_Amt__c},
                {Ord_Staging__c:_soupEntryId},
                {Ord_Staging__c:Order_Notes__c},
                {Ord_Staging__c:Cust_Po_Id__c},
                {Ord_Staging__c:Transaction_Time__c},
                {Visit:RTE_ID__r.GTMU_RTE_ID__c},
                {Visit:Customer_to_Route__r.DELY_MTHD_CDE__c},
                {Visit:Name},
                {Visit:Id},
                {Customer_to_Route__c:Route__r.Region_Code__c},
                {RetailStore:Account.CUST_UNIQ_ID_VAL__c}
            FROM {Ord_Staging__c} 
            LEFT JOIN {Visit} ON {Visit:Id} = {Ord_Staging__c:Visit_Id__c}
            LEFT JOIN {RetailStore} ON {RetailStore:Id} = {Visit:PlaceId}
            LEFT JOIN {Customer_to_Route__c} ON {Visit:Customer_to_Route__c} = {Customer_to_Route__c:Id}
                WHERE {Ord_Staging__c:Id} IS NULL
                AND {Ord_Staging__c:Created_By_GPID__c} = '${userGPId}' 
            `,
                [],
                {},
                true,
                true
            )
            return res
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getOrderForOCHByUser',
                `Failed to fetch data from Order&OrderItems, error: ${ErrorUtils.error2String(e)}`
            )
            return []
        }
    }

    private static async getUpdatedLocalData(objName: string, localObjs: Array<any>, dependField: string) {
        let outputArray: Array<any> = []
        const objsSyncFields = BaseInstance.sfSoupEngine.getSoupFieldList(objName, 'Remote')
        const objsUniqIds = localObjs.map((localObj) => localObj[`${dependField}`])
        const SFRecords = await BaseInstance.sfSyncEngine.syncDown({
            name: objName,
            whereClause: `${dependField} IN (${getIdClause(objsUniqIds)})`,
            updateLocalSoup: false,
            fields: objsSyncFields,
            allOrNone: true
        })
        if (!_.isEmpty(SFRecords)) {
            const removeArr: Array<any> = []
            localObjs.forEach((localObj) => {
                const SFRecord = SFRecords.find((SFObj) => localObj[`${dependField}`] === SFObj[`${dependField}`])
                if (!_.isEmpty(SFRecord)) {
                    removeArr.push(localObj._soupEntryId)
                }
            })
            outputArray = SFRecords
            if (!_.isEmpty(removeArr)) {
                await BaseInstance.sfSoupEngine.removeRecords(objName, removeArr)
            }
        }
        return outputArray
    }

    public static async removeDupFromLocal(
        parentObjs: Array<any>,
        parentObjName: string,
        childObjs?: Array<any>,
        childObjName?: string
    ) {
        try {
            const req = []
            const parentUpdatedArray = await this.getUpdatedLocalData(parentObjName, parentObjs, 'Order_Unique_Id__c')
            !_.isEmpty(parentUpdatedArray) &&
                req.push(
                    BaseInstance.sfSoupEngine.upsertWithExternalId(`${parentObjName}`, parentUpdatedArray, true, true)
                )
            if (!_.isEmpty(childObjs)) {
                const childUpdatedArray = await this.getUpdatedLocalData(
                    `${childObjName}`,
                    childObjs as Array<any>,
                    'Order_Unique_Id__c'
                )
                !_.isEmpty(childUpdatedArray) &&
                    req.push(
                        BaseInstance.sfSoupEngine.upsertWithExternalId(`${childObjName}`, childUpdatedArray, true, true)
                    )
            }
            return Promise.all(req)
        } catch (e) {
            await storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: Composite Graph Call',
                `removeDupFromLocal: ${ErrorUtils.error2String(e)}`
            )
        }
    }

    static async retrieveOrderItemsForPackages(
        packageNames: Array<any>,
        order: SFRecord
    ): Promise<Array<StoreProduct>> {
        try {
            const res = await BaseInstance.sfSoupEngine.retrieve(
                'OrderItem',
                [
                    'Id',
                    'unitPrice',
                    'quantity',
                    'Product.Name',
                    'Product.Sub_Brand__c',
                    'Product.Package_Type_Name__c',
                    'Product.ProductCode',
                    'Product.Material_Unique_ID__c',
                    'ord_lne_actvy_cde__c',
                    'Mtrl_Rtrn_Rsn_Cdv__c',
                    'Config_Qty__c',
                    'Product2Id'
                ],
                `
            SELECT
                {OrderItem:Id},
                {OrderItem:UnitPrice},
                {OrderItem:Quantity},
                {OrderItem:Product2.Name},
                {OrderItem:Product2.Sub_Brand__c},
                {OrderItem:Product2.Package_Type_Name__c},
                {OrderItem:Product2.ProductCode},
                {OrderItem:Product2.Material_Unique_ID__c},
                {OrderItem:ord_lne_actvy_cde__c},
                {OrderItem:Mtrl_Rtrn_Rsn_Cdv__c},
                {Product2:Config_Qty__c},
                {OrderItem:Product2Id}
            FROM
                {OrderItem}
            LEFT JOIN {Product2}
                ON {Product2:Id} = {OrderItem:Product2Id}
            WHERE
                {OrderItem:Product2.Package_Type_Name__c} IN (${getIdClause(
                    packageNames.map((el) => el.Package_Type_Name__c)
                )})
                AND ({OrderItem:OrderId} = '${order.Id}' OR {OrderItem:oRefId} = '${order._soupEntryId}')
            `,
                [],
                {},
                false,
                false
            )
            return res as unknown as StoreProduct[]
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'Orderade: retrieveOrderItemsForPackage', ErrorUtils.error2String(e))
            return []
        }
    }

    static retrieveOrderData(
        fields: Array<string>,
        query: string,
        soupName: string,
        transformRecords: (packageNames: Array<any>) => Promise<ProductSKUType[]>,
        setRecords: React.Dispatch<React.SetStateAction<any[]>>
    ) {
        BaseInstance.sfSoupEngine
            .retrieve(soupName, fields, `${query}`)
            .then((packageData) => {
                transformRecords(packageData)
                    .then((orderData) => {
                        setRecords(orderData)
                    })
                    .catch((e) => {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'Orderade: useOrderData',
                            `Failed to retrieve order data for ${soupName}, error: ${ErrorUtils.error2String(
                                e
                            )}, query: ${query}`
                        )
                    })
            })
            .catch((e) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'Orderade: useOrderData',
                    `Failed to retrieve order data for ${soupName}, error: ${ErrorUtils.error2String(
                        e
                    )}, query: ${query}`
                )
            })
    }

    static async getCartItemInRelatedStore(storeId: string) {
        try {
            return await BaseInstance.sfSoupEngine
                .dynamicRetrieve('CartItem')
                .select()
                .where([
                    {
                        leftField: 'RetailStoreId',
                        operator: '=',
                        rightField: `'${storeId}'`
                    }
                ])
                .getData(false)
        } catch (err) {
            storeClassLog(Log.MOBILE_ERROR, 'Orderade: getCartItemInRelatedStore', ErrorUtils.error2String(err))
        }
    }

    static getValidData(inputNum: number, defaultValue: number): number {
        if (inputNum > 0) {
            return inputNum
        } else if (inputNum <= 0 || isNaN(inputNum) || _.isEmpty(inputNum)) {
            return defaultValue
        }
        return defaultValue
    }

    static async switchOCHMetaDataToggles() {
        const meta = (await BaseInstance.sfSoupEngine.retrieve(
            'Application_Configuration__mdt',
            [],
            undefined,
            []
        )) as unknown as Array<any>
        if (!_.isEmpty(meta)) {
            CommonParam.OCHRetryInterVal = this.getValidData(
                Number(meta.find((e) => e.MasterLabel === OCHSettingMetaDataTypes.AUTO_SYNC_UP_INTERVAL)?.Value__c),
                3
            )
            CommonParam.OCHConnectTimeOut = this.getValidData(
                Number(meta.find((e) => e.MasterLabel === OCHSettingMetaDataTypes.ORDER_TIME_OUT)?.Value__c),
                8000
            )
            CommonParam.OCHretryTimes = this.getValidData(
                Number(meta.find((e) => e.MasterLabel === OCHSettingMetaDataTypes.ORDER_RETRY_COUNT)?.Value__c),
                3
            )
            CommonParam.OCHRetryTiming = this.getValidData(
                Number(meta.find((e) => e.MasterLabel === OCHSettingMetaDataTypes.ORDER_RETRY_TIMING)?.Value__c),
                2
            )
        }
    }

    static getNormalOrderCountForVisit = (visitId: string): Promise<{ count: number }[]> => {
        return BaseInstance.sfSoupEngine.retrieve(
            'Order',
            ['count'],
            `
            SELECT COUNT(DISTINCT {Order:_soupEntryId}) 
            FROM {Order}
            LEFT JOIN {OrderItem} 
            ON ({OrderItem:OrderId} = {Order:Id} OR
                {OrderItem:oRefId} = {Order:_soupEntryId})
            LEFT JOIN {Visit}
            ON {Visit:Id} = {Order:Visit__c}
            WHERE {Order:Visit__c} = '${visitId}'
            AND {OrderItem:ord_lne_actvy_cde__c} = 'DEL'
        `
        ) as unknown as Promise<{ count: number }[]>
    }

    /**
     * Delete local fake order and order staging when integration wrote back corresponding orders
     *
     * @static
     * @memberof OrderDM
     */
    static async removeLocalDupOrder() {
        // real order has SF id, local fake order has Order_Unique_Id__c populated on this field
        const orderRemoveCandidates = (await BaseInstance.sfSoupEngine.retrieve('Order', [], '', [
            `
            WHERE {Order:Id} = {Order:Order_Unique_Id__c}
        `
        ])) as unknown as Order[]
        if (!orderRemoveCandidates.length) {
            return
        }

        const realOrders = (await BaseInstance.sfSoupEngine.retrieve('Order', [], '', [
            `WHERE {Order:Id} != {Order:Order_Unique_Id__c}
            AND {Order:Order_Unique_Id__c} IN (${getIdClause(
                orderRemoveCandidates.map((el) => el.Order_Unique_Id__c)
            )})`
        ])) as unknown as Order[]
        const realOrderMap = realOrders.reduce((a: { [key: string]: boolean }, b: Order) => {
            a[b.Order_Unique_Id__c] = true
            return a
        }, {})
        const finalOrdersToRemove = orderRemoveCandidates.filter((el) => {
            return realOrderMap[el.Id]
        })

        if (!finalOrdersToRemove.length) {
            return
        }
        const orderUniqIds = finalOrdersToRemove.map((el) => el.Order_Unique_Id__c)
        const [finalOrderItemsToRemove, orderStagingsToRemove, orderItemStagingsToRemove] = await Promise.all([
            BaseInstance.sfSoupEngine.retrieve('OrderItem', [], '', [
                `WHERE {OrderItem:OrderId} IN (${getIdClause(finalOrdersToRemove.map((el) => el.Id))})`
            ]),
            BaseInstance.sfSoupEngine.retrieve('Ord_Staging__c', [], '', [
                `WHERE {Ord_Staging__c:Order_Unique_Id__c} IN (${getIdClause(orderUniqIds)})`
            ]),
            BaseInstance.sfSoupEngine.retrieve('OrdLineItem_Staging__c', [], '', [
                `WHERE {OrdLineItem_Staging__c:Order_Unique_Id__c} IN (${getIdClause(orderUniqIds)})`
            ])
        ])
        await Promise.all([
            BaseInstance.sfSoupEngine.removeRecords(
                'Order',
                finalOrdersToRemove.map((el) => el._soupEntryId)
            ),
            BaseInstance.sfSoupEngine.removeRecords(
                'OrderItem',
                finalOrderItemsToRemove.map((el) => el._soupEntryId)
            ),
            BaseInstance.sfSoupEngine.removeRecords(
                'Ord_Staging__c',
                orderStagingsToRemove.map((el) => el._soupEntryId)
            ),
            BaseInstance.sfSoupEngine.removeRecords(
                'OrdLineItem_Staging__c',
                orderItemStagingsToRemove.map((el) => el._soupEntryId)
            )
        ])
    }

    static async getOrderUserInfo(createdByGPId: string) {
        let OrderUserInfo: OrderUserInfo = []
        try {
            OrderUserInfo = (await BaseInstance.sfSoupEngine
                .dynamicRetrieve('User')
                .select(['FirstName', 'LastName', 'FT_EMPLYE_FLG_VAL__c', 'MobilePhone', 'Title', 'Id'])
                .join({
                    table: 'Employee_To_Route__c',
                    options: {
                        mainField: 'User__c',
                        targetField: 'Id',
                        targetTable: 'User',
                        fieldList: ['Route__r.GTMU_RTE_ID__c', 'Route__r.LOCL_RTE_ID__c', 'Id']
                    },
                    type: 'LEFT',
                    alias: 'ETR'
                })
                .join({
                    table: 'User_Stats__c',
                    options: {
                        mainField: 'User__c',
                        targetField: 'Id',
                        targetTable: 'User',
                        fieldList: ['Id']
                    },
                    type: 'LEFT',
                    alias: 'US'
                })
                .where([
                    {
                        leftTable: 'User',
                        leftField: 'GPID__c',
                        operator: '=',
                        rightField: `'${createdByGPId}'`
                    }
                ])
                .orderBy([{ table: 'Employee_To_Route__c', field: 'RLTNSHP_STRT_DT__c', type: 'DESC' }])
                .getData()) as unknown as OrderUserInfo
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'getOrderUserInfo', ErrorUtils.error2String(e))
            return OrderUserInfo
        }
        return OrderUserInfo
    }

    static async getOrderItemsRelatedToOrders(orders: Array<Order>) {
        let outputOrderItems: Partial<Array<OrderItem>> = []
        try {
            if (!_.isEmpty(orders)) {
                outputOrderItems = (await BaseInstance.sfSoupEngine.retrieve(
                    'OrderItem',
                    [],
                    '',
                    [
                        `WHERE ({OrderItem:OrderId} IN (${getIdClause(
                            orders.map((v) => v.Id)
                        )}) OR {OrderItem:oRefId} IN (${getIdClause(orders.map((v) => v._soupEntryId))}))`
                    ],
                    {},
                    false,
                    false
                )) as unknown as Partial<Array<OrderItem>>
            }
            return outputOrderItems
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'getOrderItemsRelatedToOrders',
                `Get OrderItem data failed: ${ErrorUtils.error2String(e)}`
            )
            return outputOrderItems
        }
    }

    static async getOrdersToPush() {
        return BaseInstance.sfSoupEngine.retrieve(
            'Ord_Staging__c',
            [
                'Id',
                'Customer_Id__c',
                'Cust_Po_Id__c',
                'Dlvry_Rqstd_Dtm__c',
                'Transaction_Time__c',
                'Sls_Mthd_Descr__c',
                'vRefId',
                'Visit_Id__c',
                'Order_Notes__c',
                'Route_Id__c',
                'Order_Unique_Id__c',
                'Type__c',
                'Owner_Name__c',
                'Order_Stat_Code__c',
                'Created_By_GPID__c',
                'Modified_By_GPID__c',
                'Transaction_Modified__c',
                'Delivery_Method_Code__c',
                'Ord_Dwnld_Flg__c',
                'Ident_Item_Id__c',
                'Product_Group_Code__c',
                'Lock_Dte_Tme__c',
                'Source_Sys_Id__c',
                'Region_Code__c',
                'Order_Com_Seq__c',
                'Order_Com_Time__c',
                'Order_Com_Code__c',
                'Order_Com_Source__c',
                'Send_Outbound__c',
                'OCH_Response_Code__c',
                'Order_Reconciled__c'
            ],
            undefined,
            ["WHERE {Ord_Staging__c:Id} IS NULL OR {Ord_Staging__c:__locally_updated__}='1'"]
        )
    }

    static async getOrderItemsToPush() {
        const orderItemFields = [
            'Sequence__c',
            'Ordr_Ln_Actvy_Cdv__c',
            'Ordr_Ln_Rqstd_Qty__c',
            'Product_Id__c',
            'oRefId',
            'Order_Line_Type_Code__c',
            'Transaction_Time__c',
            'Deal_Id__c',
            'Order_Line_Discount_Amt__c',
            'Every_Day_Value__c',
            'Order_Unique_Id__c',
            'Customer_Id__c',
            'Ord_Lne_Actvy_Cde__c',
            'Inven_Cnd_Status_Code__c',
            'Material_UOM_Code_Value__c',
            'Whole_Cases_Quantity__c',
            'Remainder_Unit_Quantity__c',
            'Ordr_Ln_Net_Amt__c'
        ]
        const orderItemsToPush = await BaseInstance.sfSoupEngine.retrieve(
            'OrdLineItem_Staging__c',
            orderItemFields,
            undefined,
            ['WHERE {OrdLineItem_Staging__c:Id} IS NULL']
        )
        orderItemsToPush.forEach((orderItem) => {
            orderItem.Sequence__c = parseInt(orderItem.Sequence__c as string)
        })
        return orderItemsToPush
    }

    public async upsertOrder(orderList: any[]) {
        return await BaseInstance.sfSoupEngine.upsert(SoupNames.Order, orderList)
    }

    public async upsertOrderItem(orderItemList: any[]) {
        return await BaseInstance.sfSoupEngine.upsert(SoupNames.OrderItem, orderItemList)
    }

    public async upsertOrderStaging(orderStagingList: any[]) {
        return await BaseInstance.sfSoupEngine.upsert(SoupNames.OrdStaging, orderStagingList)
    }

    public async upsertOrderLineItemStaging(orderLineItemStaging: any[]) {
        return await BaseInstance.sfSoupEngine.upsert(SoupNames.OrdLineItemStaging, orderLineItemStaging)
    }

    static async getLocalOrdersStatus() {
        const orders = (await BaseInstance.sfSoupEngine.retrieve(
            'Ord_Staging__c',
            ['Id'],
            undefined,
            [],
            {},
            true,
            true
        )) as unknown as Array<Order>
        return orders
    }

    static async deleteOrderKeepLocal() {
        const ordersToRemove = await BaseInstance.sfSoupEngine.retrieve('Order', ['Id'], '', [
            `WHERE {Order:Id} != {Order:Order_Unique_Id__c}`
        ])
        await BaseInstance.sfSoupEngine.removeRecords(
            'Order',
            ordersToRemove.map((el) => el._soupEntryId)
        )
    }

    static async deleteOrderItemKeepLocal() {
        const orderItemsToRemove = await BaseInstance.sfSoupEngine.retrieve('OrderItem', ['Id'], '', [
            `WHERE {OrderItem:Id} IS NOT NULL`
        ])
        return BaseInstance.sfSoupEngine.removeRecords(
            'OrderItem',
            orderItemsToRemove.map((el) => el._soupEntryId)
        )
    }

    static async getAllOrderIdsAndCreatedByIds() {
        return BaseInstance.sfSoupEngine
            .dynamicRetrieve('Order')
            .select(['Id', 'Created_By_GPID__c'])
            .where([
                {
                    leftTable: 'Order',
                    leftField: 'Id',
                    operator: '!=',
                    rightTable: 'Order',
                    rightField: 'Order_Unique_Id__c'
                }
            ])
            .getData(false) as unknown as Promise<Order[]>
    }

    public static async getAllVisitRelatedOrderData(visitId: string | any, soupEntryId: string) {
        const conditionalQuery = visitId
            ? `({Order:Visit__c} = '${visitId}' OR {Order:vRefId} = '${soupEntryId}')`
            : `{Order:vRefId} = '${soupEntryId}'`
        try {
            return (await BaseInstance.sfSoupEngine.retrieve(
                'Order',
                [
                    'Id',
                    'Dlvry_Rqstd_Dtm__c',
                    'Cust_Po_Id__c',
                    'Account.Is_Customer_PO_Number_Required__c',
                    'EffectiveDate',
                    'Order_Notes__c',
                    'OrderNumber',
                    'Created_By_GPID__c',
                    'Transaction_Time__c',
                    'OrderItemId',
                    'ord_lne_actvy_cde__c',
                    'visitId',
                    'Order_Unique_Id__c'
                ],
                `
                    SELECT
                        {Order:Id},
                        {Order:Dlvry_Rqstd_Dtm__c},
                        {Order:Cust_Po_Id__c},
                        {Order:Account.Is_Customer_PO_Number_Required__c},
                        {Order:EffectiveDate},
                        {Order:Order_Notes__c},
                        {Order:OrderNumber},
                        {Order:Created_By_GPID__c},
                        {Order:Transaction_Time__c},
                        {OrderItem:Id},
                        {OrderItem:ord_lne_actvy_cde__c},
                        {Visit:Id},
                        {Order:Order_Unique_Id__c}
                    FROM {Order}
                    LEFT JOIN {OrderItem} ON (({Order:Id} IS NOT NULL AND {OrderItem:OrderId} = {Order:Id}) OR ({Order:_soupEntryId} IS NOT NULL AND {OrderItem:oRefId} = {Order:_soupEntryId}))
                    AND {OrderItem:ord_lne_actvy_cde__c} = 'DEL'
                    LEFT JOIN {Visit} ON {Visit:Id} = {Order:Visit__c}
                    WHERE ${conditionalQuery}
                    GROUP BY {Order:_soupEntryId}
                    ORDER BY {Order:Transaction_Time__c}
                `,
                [],
                {},
                false,
                false
            )) as unknown as Partial<Order>[]
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'getAllVisitRelatedOrderData',
                `Get visit related order data failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }
}

export default OrderData

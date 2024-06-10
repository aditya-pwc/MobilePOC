import React from 'react'
import 'moment-timezone'
import { visitStyle } from './VisitStyle'
import CHECKMARK from '../../../../assets/image/icon-checkmark.svg'
import ERROR_DELIVERY from '../../../../assets/image/icon-error-delivery.svg'
import { OrderItemType } from '../../enums/Visit'
import { syncDownObj } from '../../api/SyncUtils'
import { SoupService } from '../../service/SoupService'
import { CommonParam } from '../../../common/CommonParam'
import { Persona } from '../../../common/enums/Persona'
import { View } from 'react-native'

interface DeliveryLogoProps {
    accordionType?
    status
    ordered
    certified
    delivered
}

export enum ACCORDION_TYPE {
    PACKAGE = 'PACKAGE',
    PALLET = 'PALLET',
    EXCEPTION = 'EXCEPTION',
    VISIT = 'VISIT ACTIVITY',
    DELIVERY_INFO = 'DELIVERY INFO',
    ORDER_INFO = 'ORDER INFO'
}

export enum INDICATOR_TYPE {
    RED = 'red',
    GREEN = 'green',
    EMPTY = 'empty'
}

export const getIndicatorType = (props: DeliveryLogoProps) => {
    const { accordionType, status, ordered, certified, delivered } = props
    if (accordionType === ACCORDION_TYPE.PALLET) {
        if (ordered > certified) {
            return INDICATOR_TYPE.RED
        }
    } else {
        if (status === 'Closed') {
            if (delivered < certified || delivered < ordered || certified < ordered) {
                return INDICATOR_TYPE.RED
            } else if (delivered >= certified && certified >= ordered) {
                return INDICATOR_TYPE.GREEN
            }
        } else if (status === 'Open') {
            if (certified < ordered) {
                return INDICATOR_TYPE.RED
            }
        }
    }
    return INDICATOR_TYPE.EMPTY
}

export const getNumberString = (dataNum) => {
    return Math.round(dataNum) || 0
}

export interface OrderPalletItemsProps {
    orderItems: any[]
    palletItems: any[]
}

export const getShipmentOnline = (orderIds) => {
    const orderItemQuery = `
        SELECT
        Id,
        Item_Type__c,
        Order_Item__c,
        Order.Ordr_Id__c,
        Quantity,
        Certified_Quantity__c,
        Pallet_Number__c,
        Order.Total_Certified_IntCount__c,
        Order.Total_Ordered_IntCount__c,
        Product2Id,
        Product2.Package_Type_Name__c,
        Product2.Sub_Brand__c,
        Is_Modified__c
        FROM OrderItem
        WHERE OrderItem.Order.Ordr_Id__c != null
        AND OrderItem.Order.Ordr_Id__c IN ('${orderIds.join("' , '")}')
        AND OrderItem.Order.Order_ATC_Type__c = 'Normal'
        AND ord_lne_actvy_cde__c != 'RET'
        AND Is_Modified__c = false
        ORDER BY Pallet_Number__c, Product2.Package_Type_Name__c, Product2.Sub_Brand__c
    `
    const shipmentItemQuery = `
        SELECT Id, ShipmentId, Delivered_Quantity__c, Product2Id
        FROM ShipmentItem WHERE ShipmentItem.Shipment.Order_Id__c != null
        AND ShipmentItem.Shipment.Order_Id__c IN ('${orderIds.join("' , '")}') AND Activity_Code__c = 'DEL'
    `
    return new Promise((resolve, reject) => {
        Promise.all([
            syncDownObj('OrderItem', orderItemQuery, false),
            syncDownObj('ShipmentItem', shipmentItemQuery, false)
        ])
            .then((res) => {
                const orderItem = res[0]?.data || []
                const shipmentItem = res[1]?.data || []
                orderItem.forEach((item) => {
                    const sItem = shipmentItem.find((s) => s.Product2Id === item.Product2Id) || null
                    item.ShipmentItemId = sItem?.Id
                    item.Delivered_Quantity__c = sItem?.Delivered_Quantity__c
                    item.Package_Type_Name__c = item?.Product2?.Package_Type_Name__c || ''
                    item.Name = item?.Product2?.Sub_Brand__c || ''
                    item.Ordered_Quantity__c = item.Quantity
                })
                resolve(orderItem)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const getShipmentOffline = (orderIds) => {
    return SoupService.retrieveDataFromSoup(
        'Order',
        {},
        [
            'Id',
            'Item_Type__c',
            'Order_Item__c',
            'OrderId',
            'Total_Certified_IntCount__c',
            'ShipmentId',
            'Total_Ordered_IntCount__c',
            'Ordered_Quantity__c',
            'Certified_Quantity__c',
            'Delivered_Quantity__c',
            'Pallet_Number__c',
            'Package_Type_Name__c',
            'Name'
        ],
        `SELECT
                {OrderItem:Id},
                {OrderItem:Item_Type__c},
                {OrderItem:Order_Item__c},
                {OrderItem:Order.Ordr_Id__c},
                {OrderItem:Order.Total_Certified_IntCount__c},
                {ShipmentItem:ShipmentId},
                {OrderItem:Order.Total_Ordered_IntCount__c},
                {OrderItem:Quantity},
                {OrderItem:Certified_Quantity__c},
                {ShipmentItem:Delivered_Quantity__c},
                {OrderItem:Pallet_Number__c},
                {OrderItem:Product2.Package_Type_Name__c},
                {OrderItem:Product2.Sub_Brand__c}
                FROM {OrderItem}
                LEFT JOIN {ShipmentItem} ON {ShipmentItem:Product2Id} = {OrderItem:Product2Id}
                AND {ShipmentItem:Shipment.Order_Id__c} = {OrderItem:Order.Ordr_Id__c}
                WHERE {OrderItem:Order.Ordr_Id__c} IN ('${orderIds.join("' , '")}')
                AND {OrderItem:Is_Modified__c} = false
                GROUP BY {OrderItem:Id}
                ORDER BY ABS({OrderItem:Pallet_Number__c}), {OrderItem:Product2.Package_Type_Name__c}, {OrderItem:Product2.Name}
        `
    )
}

export const getShipmentAndOrderItemFromLocalData = (currentShipment): Promise<OrderPalletItemsProps> => {
    return new Promise((resolve, reject) => {
        const method = CommonParam.PERSONA__c === Persona.MERCHANDISER ? getShipmentOffline : getShipmentOnline
        method([currentShipment.OrderId])
            .then((orderItem: any) => {
                const orderItems = orderItem.filter((r) => r.Item_Type__c === OrderItemType.ORDER_ITEM)
                const palletItems = orderItem
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
                resolve({
                    orderItems,
                    palletItems
                })
            })
            .catch(() => {
                reject('')
            })
    })
}

export const getDeliveryCardIndicator = (currentShipment, dataArr) => {
    let hasRedIndicator = false
    let greenCount = 0
    dataArr.forEach((element) => {
        const type = getIndicatorType({
            status: currentShipment.Status,
            ordered: getNumberString(element.Ordered_Quantity__c),
            certified: getNumberString(element.Certified_Quantity__c),
            delivered: getNumberString(element.Delivered_Quantity__c)
        })
        if (type === INDICATOR_TYPE.RED) {
            hasRedIndicator = true
        }
        if (type === INDICATOR_TYPE.GREEN) {
            greenCount = greenCount + 1
        }
    })
    if (hasRedIndicator) {
        return INDICATOR_TYPE.RED
    } else if (!hasRedIndicator && greenCount === dataArr.count) {
        return INDICATOR_TYPE.GREEN
    }
    return INDICATOR_TYPE.EMPTY
}

const DeliveryLogo = (prop) => {
    const { type } = prop
    if (type === INDICATOR_TYPE.RED) {
        return <ERROR_DELIVERY style={visitStyle.redIndicator} />
    } else if (type === INDICATOR_TYPE.GREEN) {
        return <CHECKMARK style={visitStyle.redIndicator} />
    }
    return <View style={visitStyle.redIndicator} />
}

export default DeliveryLogo

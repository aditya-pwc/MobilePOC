/*
 * @Description: DeliveryVisitDetailHelper
 * @Author: Yi Li
 * @Date: 2022-01-05 02:03:38
 * @LastEditTime: 2023-09-28 15:22:51
 * @LastEditors: Mary Qian
 */

import _ from 'lodash'
import moment from 'moment'
import { CommonParam } from '../../../../common/CommonParam'
import { Persona } from '../../../../common/enums/Persona'
import { OrderItemType, ShipmentStatus } from '../../../enums/Visit'
import DeliveryVisitDetailQueries from '../../../queries/DeliveryVisitDetailQueries'
import { SoupService } from '../../../service/SoupService'
import { formatString } from '../../../utils/CommonUtils'
import { getLocalQueryByDate } from '../../../utils/TimeZoneUtils'
import { getUniquePackageData, groupWithPallet } from '../../merchandiser/DeliveryInformation'
import { getIndicatorType, getNumberString, getShipmentOnline, INDICATOR_TYPE } from '../../merchandiser/DeliveryLogo'
import { MOMENT_UNIT } from '../../../../common/enums/MomentUnit'

export const getShipment = (storeId, today, tomorrow) => {
    return SoupService.retrieveDataFromSoup(
        'Order',
        {},
        ['orderId'],
        ` SELECT
        ORD.{Order:Ordr_Id__c}
        FROM {Order} ORD
        LEFT JOIN {Shipment} SHP ON SHP.{Shipment:Order_Id__c} = ORD.{Order:Ordr_Id__c}
        WHERE ORD.{Order:RetailStore__c} = '${storeId}' 
        AND ((datetime(REPLACE({Order:Dlvry_Rqstd_Dtm__c}, '+0000', '')) >= '${today}'
        AND datetime(REPLACE({Order:Dlvry_Rqstd_Dtm__c}, '+0000', '')) < '${tomorrow}')
        OR (datetime(REPLACE({Shipment:ActualDeliveryDate}, '+0000', '')) >= '${today}'
        AND datetime(REPLACE({Shipment:ActualDeliveryDate}, '+0000', '')) < '${tomorrow}'))
        `
    )
}
const getShipmentFromRemote = (storeId, today, tomorrow) => {
    return new Promise((resolve, reject) => {
        getShipment(storeId, today, tomorrow)
            .then((res) => {
                const orderIds = res.map((r) => r.orderId)
                resolve(getShipmentOnline(orderIds))
            })
            .catch((err) => {
                reject(err)
            })
    })
}

const getShipmentFromLocal = (storeId, today, tomorrow) => {
    return SoupService.retrieveDataFromSoup(
        'Order',
        {},
        [
            'Id',
            'Item_Type__c',
            'OrderId',
            'Total_Certified_IntCount__c',
            'Total_Ordered_IntCount__c',
            'ShipmentId',
            'ShipmentItemId',
            'Status',
            'Ordered_Quantity__c',
            'Certified_Quantity__c',
            'Delivered_Quantity__c',
            'Pallet_Number__c',
            'Package_Type_Name__c',
            'Name',
            'Order_Item__c'
        ],
        `SELECT
            {OrderItem:Id},
            {OrderItem:Item_Type__c},
            {OrderItem:OrderId},
            {OrderItem:Order.Total_Certified_IntCount__c},
            {OrderItem:Order.Total_Ordered_IntCount__c},
            {ShipmentItem:ShipmentId},
            {ShipmentItem:Id},
            '${ShipmentStatus.CLOSED}',
            {OrderItem:Quantity},
            {OrderItem:Certified_Quantity__c},
            {ShipmentItem:Delivered_Quantity__c},
            {OrderItem:Pallet_Number__c},
            {OrderItem:Product2.Package_Type_Name__c},
            {OrderItem:Product2.Sub_brand__c},
            {OrderItem:Order_Item__c}
            FROM {OrderItem} 
            LEFT JOIN {ShipmentItem} ON {ShipmentItem:Product2Id} = {OrderItem:Product2Id} 
            AND {ShipmentItem:Shipment.Order_Id__c} = {OrderItem:Order.Ordr_Id__c}
            WHERE {OrderItem:Order.Ordr_Id__c} in (
                SELECT {Order:Ordr_Id__c} FROM {Order} WHERE {Order:RetailStore__c} = '${storeId}'
                AND datetime(REPLACE({Order:Dlvry_Rqstd_Dtm__c}, '+0000', '')) >= '${today}'
                AND datetime(REPLACE({Order:Dlvry_Rqstd_Dtm__c}, '+0000', '')) < '${tomorrow}'
                UNION 
                SELECT {Shipment:Order_Id__c} FROM {Shipment} WHERE {Shipment:Retail_Store__c} = '${storeId}'
                AND datetime(REPLACE({Shipment:ActualDeliveryDate}, '+0000', '')) >= '${today}'
                AND datetime(REPLACE({Shipment:ActualDeliveryDate}, '+0000', '')) < '${tomorrow}'
            )
            AND {OrderItem:Is_Modified__c} = false
            ORDER BY {OrderItem:Pallet_Number__c}, {OrderItem:Product2.Package_Type_Name__c}, {OrderItem:Product2.Sub_Brand__c}
        `
    )
}

const getShipmentDataFromSoup = (visitInfoData) => {
    const visitDate = visitInfoData.Planned_Date__c
    const { today, tomorrow } = getLocalQueryByDate(visitDate)
    return new Promise<any>((resolve, reject) => {
        const method = CommonParam.PERSONA__c === Persona.MERCHANDISER ? getShipmentFromLocal : getShipmentFromRemote
        method(visitInfoData.storeId, today, tomorrow)
            .then((result: any) => {
                const finalResult = result.filter((r) => r.Item_Type__c === OrderItemType.ORDER_ITEM)
                const palletItems = result
                    .filter((r) => r.Item_Type__c === OrderItemType.PALLET_ITEM)
                    .filter((p) => p.Pallet_Number__c)
                finalResult.forEach((item) => {
                    item.Status = ShipmentStatus.CLOSED
                    item.Certified_Quantity__c =
                        palletItems
                            .filter((pal) => pal.Order_Item__c === item.Id)
                            .reduce((a, b) => {
                                return a + Number(b.Certified_Quantity__c) || 0
                            }, 0) || 0
                })
                const finalPalletData = groupWithPallet(palletItems)
                const finalPacData = getUniquePackageData(finalResult)
                const issueData = finalResult.filter((item) => {
                    return (
                        getIndicatorType({
                            status: item.Status,
                            ordered: getNumberString(item.Ordered_Quantity__c),
                            certified: getNumberString(item.Certified_Quantity__c),
                            delivered: getNumberString(item.Delivered_Quantity__c)
                        }) === INDICATOR_TYPE.RED
                    )
                })
                const excData = getUniquePackageData(issueData)

                resolve({
                    palletData: finalPalletData,
                    packageData: finalPacData,
                    exceptionData: [excData]
                })
            })
            .catch((err) => {
                reject(err)
            })
    })
}
export const getDeliveryVisitDetailData = (currentVisit) => {
    return new Promise<any>((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            DeliveryVisitDetailQueries.getDeliveryVisitDetailData.f,
            formatString(DeliveryVisitDetailQueries.getDeliveryVisitDetailData.q, [currentVisit.Id])
        )
            .then((dataArr) => {
                if (dataArr.length === 0) {
                    return
                }
                const currentVisitInfo = {
                    ...dataArr[0],
                    address: `${dataArr[0].Street || ''}`,
                    cityStateZip: `${dataArr[0].City || ''}, ${dataArr[0].State || ''}, ${
                        dataArr[0].PostalCode || ''
                    } `,
                    Planned_Duration: moment(dataArr[0].PlannedVisitEndTime).diff(
                        moment(dataArr[0].PlannedVisitStartTime),
                        MOMENT_UNIT.MINUTES
                    ),
                    storeLocation: dataArr[0].Store_Location__c
                }

                getShipmentDataFromSoup(currentVisitInfo).then((shipmentData) => {
                    resolve({
                        ...shipmentData,
                        currentVisitInfo: currentVisitInfo
                    })
                })
            })
            .catch((err) => {
                reject(err)
            })
    })
}

const getOrderByVisitId = (visitId, storeId, plannedDate) => {
    return new Promise<any>((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'Order',
            {},
            DeliveryVisitDetailQueries.getOrder.f,
            formatString(DeliveryVisitDetailQueries.getOrder.q, [storeId, CommonParam.userTimeZoneOffset, plannedDate])
        )
            .then((orderData) => {
                SoupService.retrieveDataFromSoup(
                    'Shipment',
                    {},
                    DeliveryVisitDetailQueries.getShipment.f,
                    formatString(DeliveryVisitDetailQueries.getShipment.q, [visitId])
                ).then((shipmentData) => {
                    resolve({
                        orderData,
                        shipmentData
                    })
                })
            })
            .catch((err) => reject(err))
    })
}

export const getDeliveryVisitDetail = (visitId, storeId, plannedDate) => {
    return new Promise<any>((resolve, reject) => {
        getOrderByVisitId(visitId, storeId, plannedDate)
            .then((data) => {
                const orders = data.orderData || []
                const shipments = data.shipmentData || []
                const TotalShipmentReturnsCs = shipments.reduce(
                    (p, n) => p + parseFloat(n.Total_Shipment_Return_Cs__c || 0),
                    0
                )
                const TotalShipmentReturnsUn = shipments.reduce(
                    (p, n) => p + parseFloat(n.Total_Shipment_Return_Un__c || 0),
                    0
                )
                const TotalOrderReturnCs = orders.reduce(
                    (p, n) => p + parseFloat(n.Total_Return_Cs_IntCount__c || 0),
                    0
                )
                const TotalOrderReturnUn = orders.reduce(
                    (p, n) => p + parseFloat(n.Total_Return_Un_IntCount__c || 0),
                    0
                )
                const orderTotal = {
                    PalletCount: orders.reduce((p, n) => p + parseFloat(n.Pallet_Total_IntCount__c || 0), 0),
                    TotalOrdered: orders.reduce((p, n) => p + parseFloat(n.Total_Ordered_IntCount__c || 0), 0),
                    TotalReturnsCs: TotalShipmentReturnsCs || TotalOrderReturnCs || 0,
                    TotalReturnsUn: TotalShipmentReturnsUn || TotalOrderReturnUn || 0
                }
                const shipmentTotal = {
                    isShipmentEmpty: !shipments[0]?.Id, // Check is shipments empty
                    PalletCount: _.uniqBy(shipments, 'OrderId').reduce(
                        (p, n: any) => p + parseFloat(n.Pallet_Total_IntCount__c || 0),
                        0
                    ),
                    TotalDelivered: shipments.reduce((a, b) => a + parseFloat(b.Total_Delivered__c || 0), 0)
                }
                resolve({ orderTotal, shipmentTotal })
            })
            .catch((err) => reject(err))
    })
}

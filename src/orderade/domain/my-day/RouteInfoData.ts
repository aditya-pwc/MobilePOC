import BaseInstance from '../../../common/BaseInstance'
import { getRecordTypeIdByDeveloperName } from '../../../savvy/utils/CommonUtils'
import { VisitStatus } from '../../enum/VisitType'
import { batchSynDown } from '../../utils/CommonUtil'
import { OrderATCType } from '../../../savvy/enums/ATCRecordTypes'
import dayjs from 'dayjs'
import { SoupService } from '../../../savvy/service/SoupService'
import { VisitType } from '../../component/visits/RouteInfoModal'
import { CommonParam } from '../../../common/CommonParam'

export const getUserInfo = async (userId: string) => {
    const fieldList = BaseInstance.sfSoupEngine.getSoupFieldList('User', 'Remote')
    const statsId = await getRecordTypeIdByDeveloperName('Stats', 'User_Stats__c')
    return await BaseInstance.sfSoupEngine.retrieve(
        'User',
        fieldList.concat(['userStatsId', 'LOCL_RTE_ID__c', 'GTMU_RTE_ID__c']),
        `SELECT ${fieldList
            .map((field) => {
                return `{User:${field}}`
            })
            .join(
                ','
            )},{User_Stats__c:Id},{Employee_To_Route__c:Route__r.LOCL_RTE_ID__c},{Employee_To_Route__c:Route__r.GTMU_RTE_ID__c} 
            FROM {User} 
            LEFT JOIN {User_Stats__c} 
                ON ({User_Stats__c:User__c} = {User:Id} AND {User_Stats__c:RecordTypeId} = '${statsId}') 
            LEFT JOIN {Employee_To_Route__c} 
                ON ({Employee_To_Route__c:User__c} = {User:Id} AND {Employee_To_Route__c:Active_Flag__c} IS TRUE)
            WHERE {User:Id} = '${userId}'`
    )
}

export const syncDownUserRoute = async (userId: string) => {
    const fieldList = BaseInstance.sfSoupEngine.getSoupFieldList('Employee_To_Route__c', 'Remote')
    return await BaseInstance.sfSyncEngine.syncDown({
        name: 'Employee_To_Route__c',
        whereClause: `User__r.Id = '${userId}'`,
        updateLocalSoup: true,
        allOrNone: true,
        fields: fieldList
    })
}

export const getVisitList = async (userId: string, date: string, visitType: VisitType) => {
    const fieldList = [
        'Id',
        'VisitorId',
        'Status__c',
        'Retail_Store__c',
        'Planned_Date__c',
        'PlannedVisitStartTime',
        'ActualVisitStartTime',
        'ActualVisitEndTime',
        'Actual_Duration_Minutes__c',
        'Visit_Subtype__c',
        'Pull_Number__c',
        'Delivery_Date__c',
        'Delivery_Date2__c',
        'Delivery_Date3__c'
    ]
    const DeliveryRecordTypeId = await getRecordTypeIdByDeveloperName(visitType, 'Visit')
    return await BaseInstance.sfSoupEngine.retrieve('Visit', fieldList, '', [
        `WHERE {Visit:User__c} = '${userId}'`,
        ` AND ((date(REPLACE({Visit:ActualVisitStartTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') >= date("${date}", 'start of day') AND 
        date(REPLACE({Visit:ActualVisitStartTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') < date("${date}", 'start of day', '+1 day')) OR 
        ({Visit:Planned_Date__c} = '${date}' AND 
        ({Visit:ActualVisitEndTime} IS NULL OR 
            (date(REPLACE({Visit:ActualVisitEndTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') >= date("${date}", 'start of day') AND 
        date(REPLACE({Visit:ActualVisitEndTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') < date("${date}", 'start of day', '+1 day')))
            ))`,
        ` AND {Visit:RecordTypeId} = '${DeliveryRecordTypeId}'`,
        dayjs().isBefore(date, 'day')
            ? ` AND {Visit:Status__c} = '${VisitStatus.PUBLISHED}'`
            : ` AND {Visit:Status__c} IN ('${VisitStatus.PUBLISHED}','${VisitStatus.IN_PROGRESS}','${VisitStatus.COMPLETE}')`,
        ' ORDER BY {Visit:Status__c} ASC, {Visit:ActualVisitStartTime} ASC, {Visit:PlannedVisitStartTime} ASC'
    ])
}

export const getRetailStoreByIdList = async (storeIdList: string[]) => {
    return await BaseInstance.sfSoupEngine.retrieve('RetailStore', [], '', [
        `WHERE {RetailStore:Id} IN ('${storeIdList.join("','")}')`
    ])
}

export const getShipment = (orderIdList: any[]) => {
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
            'Name',
            'Visit__c'
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
                {OrderItem:Product2.Sub_Brand__c},
                {ShipmentItem:Shipment.Visit__c}
                FROM {OrderItem}
                LEFT JOIN {ShipmentItem} ON {ShipmentItem:Product2Id} = {OrderItem:Product2Id}
                AND {ShipmentItem:Shipment.Order_Id__c} = {OrderItem:Order.Ordr_Id__c}
                WHERE {OrderItem:Order.Ordr_Id__c} IN ('${orderIdList.join("' , '")}')
                AND {OrderItem:Is_Modified__c} = false
                GROUP BY {OrderItem:Id}
                ORDER BY ABS({OrderItem:Pallet_Number__c}), {OrderItem:Product2.Package_Type_Name__c}, {OrderItem:Product2.Name}
        `
    )
}

export const getOrderListByRetailStoreList = async (customerList: string[], date: string) => {
    return await BaseInstance.sfSoupEngine.retrieve(
        'Order',
        [
            'Id',
            'OrderId',
            'Dlvry_Rqstd_Dtm__c',
            'Pallet_Total_IntCount__c',
            'Total_Ordered_IntCount__c',
            'RetailStore__c',
            'Visit__c',
            'ShipmentId',
            'OwnerId',
            'Pallet_Count__c',
            'ActualDeliveryDate',
            'ExpectedDeliveryDate',
            'CreatedDate',
            'TotalItemsQuantity',
            'ShipToName',
            'Description',
            'Employee_Id__c',
            'Total_Certified__c',
            'Total_Delivered__c',
            'Total_Ordered__c',
            'Status',
            'ShipmentVisit'
        ],
        ` SELECT
            ORD.{Order:Id},
            ORD.{Order:Ordr_Id__c},
            ORD.{Order:Dlvry_Rqstd_Dtm__c},
            ORD.{Order:Pallet_Total_IntCount__c},
            ORD.{Order:Total_Ordered_IntCount__c},
            ORD.{Order:RetailStore__c},
            ORD.{Order:Visit__c},
            SHP.{Shipment:Id},
            SHP.{Shipment:OwnerId},
            SHP.{Shipment:Pallet_Count__c},
            SHP.{Shipment:ActualDeliveryDate},
            SHP.{Shipment:ExpectedDeliveryDate},
            SHP.{Shipment:CreatedDate},
            SHP.{Shipment:TotalItemsQuantity},
            SHP.{Shipment:ShipToName},
            SHP.{Shipment:Description},
            SHP.{Shipment:Employee_Id__c},
            SHP.{Shipment:Total_Certified__c},
            SHP.{Shipment:Total_Delivered__c},
            SHP.{Shipment:Total_Ordered__c},
            SHP.{Shipment:Status},
            SHP.{Shipment:Visit__c} 
            FROM {Order} ORD 
            LEFT JOIN {Shipment} SHP ON SHP.{Shipment:Order_Id__c} = ORD.{Order:Ordr_Id__c}
            WHERE ORD.{Order:RetailStore__c} IN ('${customerList.join("','")}')
            AND {Order:Order_ATC_Type__c} = '${OrderATCType.NORMAL}'
            AND (
                date(REPLACE(ORD.{Order:Dlvry_Rqstd_Dtm__c}, '+0000', ''), '${
                    CommonParam.userTimeZoneOffset
                }') >= date("${date}", 'start of day') 
                AND
                date(REPLACE(ORD.{Order:Dlvry_Rqstd_Dtm__c}, '+0000', ''), '${
                    CommonParam.userTimeZoneOffset
                }') < date("${date}", 'start of day', '+1 day')
            )
            `
    )
}

export const getOrderListByVisit = async (visitList: string[]) => {
    return await BaseInstance.sfSoupEngine.retrieve(
        'Order',
        [
            'Id',
            'OrderId',
            'Dlvry_Rqstd_Dtm__c',
            'Pallet_Total_IntCount__c',
            'Total_Ordered_IntCount__c',
            'RetailStore__c',
            'Visit__c',
            'ShipmentId',
            'OwnerId',
            'Pallet_Count__c',
            'ActualDeliveryDate',
            'ExpectedDeliveryDate',
            'CreatedDate',
            'TotalItemsQuantity',
            'ShipToName',
            'Description',
            'Employee_Id__c',
            'Total_Certified__c',
            'Total_Delivered__c',
            'Total_Ordered__c',
            'Status'
        ],
        ` SELECT
            ORD.{Order:Id},
            ORD.{Order:Ordr_Id__c},
            ORD.{Order:Dlvry_Rqstd_Dtm__c},
            ORD.{Order:Pallet_Total_IntCount__c},
            ORD.{Order:Total_Ordered_IntCount__c},
            ORD.{Order:RetailStore__c},
            ORD.{Order:Visit__c},
            SHP.{Shipment:Id},
            SHP.{Shipment:OwnerId},
            SHP.{Shipment:Pallet_Count__c},
            SHP.{Shipment:ActualDeliveryDate},
            SHP.{Shipment:ExpectedDeliveryDate},
            SHP.{Shipment:CreatedDate},
            SHP.{Shipment:TotalItemsQuantity},
            SHP.{Shipment:ShipToName},
            SHP.{Shipment:Description},
            SHP.{Shipment:Employee_Id__c},
            SHP.{Shipment:Total_Certified__c},
            SHP.{Shipment:Total_Delivered__c},
            SHP.{Shipment:Total_Ordered__c},
            SHP.{Shipment:Status}
            FROM {Order} ORD 
            LEFT JOIN {Shipment} SHP ON SHP.{Shipment:Order_Id__c} = ORD.{Order:Ordr_Id__c}
            WHERE ORD.{Order:Visit__c} IN ('${visitList.join("','")}')  
            AND {Order:Order_ATC_Type__c} = '${OrderATCType.NORMAL}'
            `
    )
}

export const syncDownVisitList = async (userId: string, date: string) => {
    const visitSyncFields = BaseInstance.sfSoupEngine.getSoupFieldList('Visit', 'Remote')
    return await batchSynDown([userId], {
        name: 'Visit',
        whereClause: `((ActualVisitStartTime>= ${dayjs(date)
            .startOf('day')
            .utc()
            .format('YYYY-MM-DDTHH:mm:ss')}Z AND ActualVisitStartTime <= ${dayjs(date)
            .endOf('day')
            .utc()
            .format(
                'YYYY-MM-DDTHH:mm:ss'
            )}Z) OR (Planned_Date__c = ${date} AND (ActualVisitEndTime = null OR (ActualVisitEndTime>= ${dayjs(date)
            .startOf('day')
            .utc()
            .format('YYYY-MM-DDTHH:mm:ss')}Z AND ActualVisitEndTime <= ${dayjs(date)
            .endOf('day')
            .utc()
            .format('YYYY-MM-DDTHH:mm:ss')}Z)))) AND User__c = '${userId}'`,
        updateLocalSoup: true,
        fields: visitSyncFields,
        allOrNone: true
    })
}

export const syncDownShipment = async (visitIds: string[]) => {
    const shipmentList = await BaseInstance.sfSyncEngine.syncDown({
        name: 'Shipment',
        whereClause: `Visit__c IN ('${visitIds.join("' , '")}') AND Order_Id__c != null`,
        updateLocalSoup: true,
        allOrNone: true,
        fields: BaseInstance.sfSoupEngine.getSoupFieldList('Shipment', 'Remote')
    })
    await BaseInstance.sfSyncEngine.syncDown({
        name: 'ShipmentItem',
        whereClause: `ShipmentId IN (SELECT Id FROM Shipment WHERE Order_Id__c != null AND Visit__c IN ('${visitIds.join(
            "' , '"
        )}')) AND Activity_Code__c = 'DEL'`,
        updateLocalSoup: true,
        allOrNone: true,
        fields: BaseInstance.sfSoupEngine.getSoupFieldList('ShipmentItem', 'Remote')
    })
    return shipmentList
}

const syncDownOrder = async (orderList: string[]) => {
    await BaseInstance.sfSyncEngine.syncDown({
        name: 'OrderItem',
        idClause: {
            idList: orderList.map((res) => res.Id),
            filterField: 'OrderId'
        },
        whereClause: '',
        updateLocalSoup: true,
        allOrNone: true,
        fields: BaseInstance.sfSoupEngine.getSoupFieldList('OrderItem', 'Remote')
    })
}

export const syncDownOrderByRetailStoreId = async (storeIdList: string[], date: string) => {
    const orderList = await BaseInstance.sfSyncEngine.syncDown({
        name: 'Order',
        whereClause: `RetailStore__c IN ('${storeIdList.join("','")}') AND Dlvry_Rqstd_Dtm__c >= ${dayjs(date)
            .startOf('day')
            .utc()
            .format('YYYY-MM-DDTHH:mm:ss')}Z AND Dlvry_Rqstd_Dtm__c <= ${dayjs(date)
            .endOf('day')
            .utc()
            .format('YYYY-MM-DDTHH:mm:ss')}Z`,
        updateLocalSoup: true,
        allOrNone: true,
        fields: BaseInstance.sfSoupEngine.getSoupFieldList('Order', 'Remote')
    })
    await syncDownOrder(orderList)
}
export const syncDownOrderByVisit = async (visitIdList: string[]) => {
    const orderList = await BaseInstance.sfSyncEngine.syncDown({
        name: 'Order',
        whereClause: `Visit__c IN ('${visitIdList.join("','")}')`,
        updateLocalSoup: true,
        allOrNone: true,
        fields: BaseInstance.sfSoupEngine.getSoupFieldList('Order', 'Remote')
    })
    await syncDownOrder(orderList)
}

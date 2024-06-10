/*
 * @Description: DeliveryVisitDetailQueries
 * @Author: Yi Li
 * @Date: 2021-12-21 20:38:57
 * @LastEditTime: 2023-09-25 11:10:14
 * @LastEditors: Mary Qian
 */

import { CommonParam } from '../../common/CommonParam'

export const DeliveryVisitDetailQueries = {
    getOrder: {
        f: [
            'Id',
            'Pallet_Total_IntCount__c',
            'Total_Ordered_IntCount__c',
            'Dlvry_Rqstd_Dtm__c',
            'Total_Return_Cs_IntCount__c',
            'Total_Return_Un_IntCount__c'
        ],
        q: `
            SELECT
                {Order:Ordr_Id__c},
                {Order:Pallet_Total_IntCount__c},
                {Order:Total_Ordered_IntCount__c},
                {Order:Dlvry_Rqstd_Dtm__c},
                {Order:Total_Return_Cs_IntCount__c},
                {Order:Total_Return_Un_IntCount__c}
            FROM {Order}
            WHERE {Order:RetailStore__c} = '%s'
            AND date(REPLACE({Order:Dlvry_Rqstd_Dtm__c}, '+0000', ''), '%s') = '%s'
        `
    },
    getShipment: {
        f: [
            'OrderId',
            'Pallet_Total_IntCount__c',
            'Id',
            'Total_Delivered__c',
            'Total_Shipment_Return_Cs__c',
            'Total_Shipment_Return_Un__c'
        ],
        q: `
            SELECT
                {Order:Ordr_Id__c},
                {Order:Pallet_Total_IntCount__c},
                {Shipment:Id},
                {Shipment:Total_Delivered__c},
                {Shipment:Total_Shipment_Return_Cs__c},
                {Shipment:Total_Shipment_Return_Un__c}
            FROM {Shipment}
            LEFT JOIN {Order} ON {Order:Ordr_Id__c} = {Shipment:Order_Id__c}
            WHERE {Shipment:Visit__c} = '%s'
            AND {Shipment:Id} IS NOT NULL
        `
    },
    getDeliveryVisitShipmentItem: {
        f: [
            'Status',
            'Id',
            'Certified_Quantity__c',
            'Delivered_Quantity__c',
            'Ordered_Quantity__c',
            'Pallet_Number__c',
            'Product2Id',
            'Quantity',
            'ShipmentId',
            'Package_Type_Name__c',
            'Name'
        ],
        q: `
            SELECT 
            {Shipment:Status},
            {ShipmentItem:Id},
            {ShipmentItem:Certified_Quantity__c},
            {ShipmentItem:Delivered_Quantity__c},
            {ShipmentItem:Ordered_Quantity__c},
            {ShipmentItem:Pallet_Number__c},
            {ShipmentItem:Product2Id},
            {ShipmentItem:Quantity},
            {ShipmentItem:ShipmentId},
            {ShipmentItem:Package_Type__c},
            {ShipmentItem:Product_Name__c}
            FROM {Shipment}
            LEFT JOIN {ShipmentItem} ON {ShipmentItem:ShipmentId} = {Shipment:Id}
            %s
            AND (date(REPLACE({Shipment:ExpectedDeliveryDate}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') = '%s'
            OR
            date(REPLACE({Shipment:ActualDeliveryDate}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') = '%s')
            ORDER BY ABS({ShipmentItem:Pallet_Number__c}), {ShipmentItem:Package_Type__c}, {ShipmentItem:Product_Name__c}
        `
    },
    getDeliveryVisitShipment: {
        f: ['Id', 'Pallet_Count__c', 'Total_Ordered__c', 'Total_Delivered__c'],
        q: `
            SELECT 
            {Shipment:Id},
            {Shipment:Pallet_Count__c},
            {Shipment:Total_Ordered__c},
            {Shipment:Total_Delivered__c}
            FROM {Shipment}
            %s
            AND (date(REPLACE({Shipment:ExpectedDeliveryDate}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') = '%s'
            OR
            date(REPLACE({Shipment:ActualDeliveryDate}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') = '%s')
        `
    },
    getDeliveryUser: {
        f: [
            'Id',
            'Name',
            'FirstName',
            'LastName',
            'Phone',
            'GM_LOC_ID__c',
            'GPID__c',
            'BU_ID__c',
            'PERSONA__c',
            'Title',
            'MobilePhone',
            'FT_EMPLYE_FLG_VAL__c',
            'EMPLYMT_TYP_NM__c',
            'UserStatsId',
            'LocalRoute',
            'NationalId'
        ],
        q: `
            SELECT
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
            {User:EMPLYMT_TYP_NM__c},
            {User_Stats__c:Id},
            {Route_Sales_Geo__c:LOCL_RTE_ID__c},
            {Route_Sales_Geo__c:GTMU_RTE_ID__c}
            FROM {User}
            LEFT JOIN {User_Stats__c} ON {User_Stats__c:User__c} = {User:Id}
            LEFT JOIN {Employee_To_Route__c} ON {User:Id} = {Employee_To_Route__c:User__c}
            LEFT JOIN {Route_Sales_Geo__c} ON {Employee_To_Route__c:Route__c} = {Route_Sales_Geo__c:Id}
            WHERE {User:Id}='%s'
        `
    },
    getDeliveryRetailStore: {
        f: [
            'Id',
            'Street',
            'City',
            'State',
            'Country',
            'PostalCode',
            'Latitude',
            'Longitude',
            'Store_Location__c',
            'Name',
            'AccountId',
            'AccountPhone',
            'ShippingAddress'
        ],
        q: `SELECT
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
            {Account:Id},
            {Account:Phone},
            {Account:ShippingAddress}
            FROM {RetailStore}
            LEFT JOIN {Account} ON {Account:Id} = {RetailStore:AccountId}
            WHERE {RetailStore:AccountId} = '%s'
        `
    },
    getDeliveryVisitDetailData: {
        f: [
            'Id',
            'Planned_Date__c',
            'ActualVisitStartTime',
            'ActualVisitEndTime',
            'status',
            'OwnerId',
            'Planned_Duration_Minutes__c',
            'PlannedVisitStartTime',
            'PlannedVisitEndTime',
            'UserId',
            'Name',
            'FirstName',
            'LastName',
            'Phone',
            'GM_LOC_ID__c',
            'GPID__c',
            'BU_ID__c',
            'PERSONA__c',
            'Title',
            'MobilePhone',
            'FT_EMPLYE_FLG_VAL__c',
            'EMPLYMT_TYP_NM__c',
            'UserStatsId',
            'LocalRoute',
            'NationalId',
            'storeId',
            'name',
            'AccountPhone',
            'accountId',
            'Street',
            'City',
            'State',
            'Country',
            'PostalCode',
            'Longitude',
            'Latitude',
            'Store_Location__c'
        ],
        q: `
        SELECT
        {Visit:Id},
        {Visit:Planned_Date__c},
        {Visit:ActualVisitStartTime},
        {Visit:ActualVisitEndTime},
        {Visit:Status__c},
        {Visit:OwnerId},
        {Visit:Planned_Duration_Minutes__c},
        {Visit:PlannedVisitStartTime},
        {Visit:PlannedVisitEndTime},
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
        {User:EMPLYMT_TYP_NM__c},
        {User_Stats__c:Id},
        {Route_Sales_Geo__c:LOCL_RTE_ID__c},
        {Route_Sales_Geo__c:GTMU_RTE_ID__c},
        {RetailStore:Id},
        {RetailStore:Name},
        {RetailStore:Account.Phone},
        {RetailStore:AccountId},
        {RetailStore:Street},
        {RetailStore:City},
        {RetailStore:State},
        {RetailStore:Country},
        {RetailStore:PostalCode},
        {RetailStore:Longitude},
        {RetailStore:Latitude},
        {RetailStore:Store_Location__c}
        FROM {Visit}
        LEFT JOIN {User} ON {User:Id}={Visit:VisitorId}
        LEFT JOIN {User_Stats__c} ON {User_Stats__c:User__c} = {User:Id}
        LEFT JOIN {Employee_To_Route__c} ON {User:Id} = {Employee_To_Route__c:User__c}
        LEFT JOIN {Route_Sales_Geo__c} ON {Employee_To_Route__c:Route__c} = {Route_Sales_Geo__c:Id}
        LEFT JOIN {RetailStore} ON {RetailStore:Id}={Visit:PlaceId}
        WHERE {Visit:Id} = '%s'
    `
    }
}
export default DeliveryVisitDetailQueries

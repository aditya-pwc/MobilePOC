/*
 * @Author: Tom tong.jiang@pwc.com
 * @Date: 2023-05-30 18:17:25
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @LastEditTime: 2024-01-22 11:28:18
 * @Description: Data Model that reflects local SF Data Structure
 */
// eslint disable reason: Keep object variable naming consistent with Salesforce.
/* eslint-disable camelcase */

export interface RetailStoreModal {
    Id: string
    Name: string
    AccountId: string
    Street: string
    State: string
    Country: string
    PostalCode: string
    City: string
    LOC_PROD_ID__c: string
    LocationId: string
    Latitude: string
    Longitude: string
    CountryCode: string
    StateCode: string
    Customer_Longitude__c: string
    Customer_Latitude__c: string
    Geofence__c: string
}

export interface Store {
    storeId: string
    storeName: string
}

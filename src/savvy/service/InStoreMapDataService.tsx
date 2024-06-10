/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-08-26 04:44:30
 * @LastEditTime: 2022-12-12 17:56:13
 * @LastEditors: Mary Qian
 */

import _ from 'lodash'
import { fetchObjInTime } from '../api/SyncUtils'
import { CommonParam } from '../../common/CommonParam'
import { todayDateWithTimeZone } from '../utils/TimeZoneUtils'
import { SoupService } from './SoupService'
import { exeAsyncFunc } from '../../common/utils/CommonUtils'

const filterProductsByQuantity = (products: any) => {
    return products.filter((i) => typeof i.Display_Quantity__c !== 'object' && Number(i.Display_Quantity__c) > 0)
}

const getStoreProductByInStoreLocationIdOffline = async (inStoreLocationId: string) => {
    const storeProduct = 'StoreProduct'
    return SoupService.retrieveDataFromSoup(storeProduct, {}, [], null, [
        ` WHERE {StoreProduct:InStoreLocationId}="${inStoreLocationId}"`
    ])
}
const getStoreProductByInStoreLocationIdOnline = async (inStoreLocationId: string) => {
    if (!inStoreLocationId || inStoreLocationId.length === 0) {
        return []
    }
    const q = `SELECT Id, InStoreLocationId, ProductId, Sub_Brand__c, Packaging__c, Display_Quantity__c
        FROM StoreProduct
        WHERE InStoreLocationId = '${inStoreLocationId}'`
    return fetchObjInTime('StoreProduct', q)
}
const getStoreProductByInStoreLocationId = async (inStoreLocationId: string, isOnline: boolean) => {
    let products = []

    await exeAsyncFunc(async () => {
        if (isOnline) {
            products = await getStoreProductByInStoreLocationIdOnline(inStoreLocationId)
        } else {
            products = await getStoreProductByInStoreLocationIdOffline(inStoreLocationId)
        }
    }, 'getStoreProductByInStoreLocationId')

    return products
}

const getPromotionProductsByPromotionIdArrayOffline = async (promotionIdArray: string[]) => {
    const promotionIdList = promotionIdArray.map((item) => `'${item}'`).join(',')
    const promotionProduct = 'PromotionProduct'

    let promotionProductsRes = []
    await exeAsyncFunc(async () => {
        promotionProductsRes = await SoupService.retrieveDataFromSoup(promotionProduct, {}, [], null, [
            `WHERE {PromotionProduct:PromotionId} IN (${promotionIdList})`
        ])
    }, 'getPromotionProductsByPromotionIdArrayOffline')

    return promotionProductsRes
}

const getPromotionProductsByPromotionIdArrayOnline = async (promotionIdArray: string[]) => {
    if (!promotionIdArray || promotionIdArray.length === 0) {
        return []
    }

    const promotionIdList = promotionIdArray.map((item) => `'${item}'`).join(',')

    const q = `SELECT Id, PromotionId, ProductId, Package_Name__c, Package_Type_Name__c, Sub_Brand__c, Display_Quantity__c,
    Display_Start_Date__c, Display_End_Date__c, Retail_Price__c, Retail_Quantity__c
    FROM PromotionProduct WHERE PromotionId IN (${promotionIdList})`
    return fetchObjInTime('PromotionProduct', q)
}

const getPromotionProductsByPromotionIdArray = async (promotionIdArray: string[], isOnline: boolean) => {
    let products = []

    await exeAsyncFunc(async () => {
        if (isOnline) {
            products = await getPromotionProductsByPromotionIdArrayOnline(promotionIdArray)
        } else {
            products = await getPromotionProductsByPromotionIdArrayOffline(promotionIdArray)
        }
    }, 'getPromotionProductsByPromotionIdArray')

    return products
}

const getValidInStoreLocationByStoreIdOffline = (storeId: string) => {
    const validQuery = ` AND {InStoreLocation:Start_Date__c} <= date('now', '${CommonParam.userTimeZoneOffset}', 'start of day')
        AND ({InStoreLocation:End_Date__c} >= date('now', '${CommonParam.userTimeZoneOffset}', 'start of day')
        OR {InStoreLocation:End_Date__c} IS NULL)
        AND {InStoreLocation:Delete_Flag__c} = false`
    const inStoreLocation = 'InStoreLocation'
    return SoupService.retrieveDataFromSoup(inStoreLocation, {}, [], null, [
        ` WHERE {InStoreLocation:RetailStoreId}="${storeId}"${validQuery}`
    ])
}
const getValidInStoreLocationByStoreIdOnline = (storeId: string) => {
    const q = `SELECT Id, RetailStoreId, X_Coordinate__c, Y_Coordinate__c, Z_Coordinate__c,
    Start_Date__c, End_Date__c, Display_Name__c, Promotion_Id__c, Department_Code__c, Display_Icon_Code__c
    FROM InStoreLocation
    WHERE RetailStoreId = '${storeId}'
    AND Start_Date__c <= TODAY AND (End_Date__c >= TODAY OR End_Date__c = NULL)
    AND Delete_Flag__c = false`
    return fetchObjInTime('InStoreLocation', q)
}
const getValidInStoreLocationByStoreId = (storeId: string, isOnline: boolean) => {
    if (isOnline) {
        return getValidInStoreLocationByStoreIdOnline(storeId)
    }
    return getValidInStoreLocationByStoreIdOffline(storeId)
}

const getPromotionArrayByCustomerIdOffline = (customerId: string) => {
    const today = todayDateWithTimeZone(true)
    return SoupService.retrieveDataFromSoup('Promotion', {}, [], null, [
        ` WHERE {Promotion:Cust_ID__c} = '${customerId}'
        AND {Promotion:StartDate} <= '${today}'
        AND ({Promotion:EndDate} >= '${today}' OR {Promotion:EndDate} IS NULL)
        AND {Promotion:Active_Status__c} = true
        AND {Promotion:Id} NOT IN (
            SELECT {InStoreLocation:Promotion_Id__c} FROM {InStoreLocation} 
            WHERE {InStoreLocation:RetailStore.AccountId} = '${customerId}' 
            AND {InStoreLocation:Promotion_Id__c} IS NOT NULL
            )
        `
    ])
}
const getPromotionArrayByCustomerIdOnline = (customerId: string) => {
    const today = todayDateWithTimeZone(true)
    const q = `SELECT Id, EndDate, StartDate, Cust_ID__c, Name, First_Delivery_Date__c
    FROM Promotion
    WHERE Cust_ID__c = '${customerId}'
    AND StartDate <= ${today} AND (EndDate >= ${today} OR EndDate = null)
    AND Active_Status__c = true
    AND Id NOT IN (SELECT Promotion_Id__c FROM InStoreLocation WHERE RetailStore.AccountId = '${customerId}')`

    return fetchObjInTime('Promotion', q)
}

const getNonDisplayPromotionsByCustomerId = (customerId: string, isOnline: boolean) => {
    if (!customerId || _.isEmpty(customerId)) {
        return []
    }

    if (isOnline) {
        return getPromotionArrayByCustomerIdOnline(customerId)
    }
    return getPromotionArrayByCustomerIdOffline(customerId)
}

const getValidInStoreLocationByInStoreLocationIdOffline = (inStoreLocationId: string) => {
    const validQuery = ` AND {InStoreLocation:Start_Date__c} <= date('now', '${CommonParam.userTimeZoneOffset}', 'start of day')
        AND ({InStoreLocation:End_Date__c} >= date('now', '${CommonParam.userTimeZoneOffset}', 'start of day')
        OR {InStoreLocation:End_Date__c} IS NULL)
        AND {InStoreLocation:Delete_Flag__c} = false`
    const inStoreLocation = 'InStoreLocation'
    return SoupService.retrieveDataFromSoup(inStoreLocation, {}, [], null, [
        ` WHERE {InStoreLocation:Id}="${inStoreLocationId}"${validQuery}`
    ])
}
const getValidInStoreLocationByInStoreLocationIdOnline = (inStoreLocationId: string) => {
    const q = `SELECT Id, RetailStoreId, X_Coordinate__c, Y_Coordinate__c, Z_Coordinate__c,
    Start_Date__c, End_Date__c, Display_Name__c, Promotion_Id__c, Department_Code__c, Display_Icon_Code__c
    FROM InStoreLocation
    WHERE Id = '${inStoreLocationId}'
    AND Start_Date__c <= TODAY AND (End_Date__c >= TODAY OR End_Date__c = NULL)
    AND Delete_Flag__c = false`
    return fetchObjInTime('InStoreLocation', q)
}
const getValidInStoreLocationByInStoreLocationId = (inStoreLocationId: string, isOnline: boolean) => {
    if (isOnline) {
        return getValidInStoreLocationByInStoreLocationIdOnline(inStoreLocationId)
    }
    return getValidInStoreLocationByInStoreLocationIdOffline(inStoreLocationId)
}

export const InStoreMapDataService = {
    filterProductsByQuantity,
    getStoreProductByInStoreLocationId,
    getPromotionProductsByPromotionIdArray,
    getNonDisplayPromotionsByCustomerId,
    getValidInStoreLocationByStoreId,
    getValidInStoreLocationByInStoreLocationId
}

export default InStoreMapDataService

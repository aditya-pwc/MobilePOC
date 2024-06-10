/**
 * @description Utils for Innovation Product.
 * @author Qiulin Deng
 * @date 2021-10-10
 */
import {
    buildSyncDownObjPromise,
    getRemainedRecords,
    restDataCommonCall,
    syncDownObj,
    syncDownObjByIds,
    syncUpObjUpdateFromMem
} from '../api/SyncUtils'
import { Log } from '../../common/enums/Log'
import { SoupService } from '../service/SoupService'
import moment from 'moment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import _ from 'lodash'
import { filterExistFields, getAllFieldsByObjName, getObjByName } from './SyncUtils'
import { formatString, getRecordTypeId, getRecordTypeIdByDeveloperName } from './CommonUtils'
import { promiseQueue } from '../api/InitSyncUtils'
import { CommonParam } from '../../common/CommonParam'
import { isPersonaKAM, isPersonaPSR, isPersonaUGMOrSDL, Persona } from '../../common/enums/Persona'
import InnovationProductQueries, { InnovaProdFilterQueries } from '../queries/InnovationProductQueries'
import { CommonApi } from '../../common/api/CommonApi'
import axios from 'axios'
import {
    getMetricsInnovProdQuery,
    getMetricsStoreProductItem,
    getRetailStoreQuery,
    getRouteFromEtrForPSR
} from '../helper/rep/InnovationProductHelper'
import { retrieveRetailStoresAndRelatedKeyAccounts } from './CustomerSyncUtils'
import { CommonSyncRes } from '../../common/interface/SyncInterface'
import { getIdClause } from '../components/manager/helper/MerchManagerHelper'
import FastImage from 'react-native-fast-image'
import { rebuildObjectDepth } from './SoupUtils'
import * as RNLocalize from 'react-native-localize'
import { getLastTwoWksDate } from '../hooks/InnovationMetricsHooks'
import { DeviceEventEmitter, NativeModules } from 'react-native'
import { DeviceEvent } from '../enums/DeviceEvent'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { transferDateTimeInQuery } from './TimeZoneUtils'
import { getStringValue } from './LandingUtils'
import { getPriorityDocuments } from '../hooks/InnovationProductHooks'
import { DocumentDirectoryPath, downloadFile, exists, unlink } from 'react-native-fs'
import { addSuccessDownloadFilesAction, deleteExecutedFilesAction } from '../redux/action/SalesDocumentsActionType'
import { Dispatch } from '@reduxjs/toolkit'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { storeClassLog } from '../../common/utils/LogUtils'
import React, { SetStateAction } from 'react'
import { Locale } from '../enums/i18n'
import { batchSynDown } from '../../orderade/utils/CommonUtil'
import BaseInstance from '../../common/BaseInstance'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import OrderService from '../../orderade/service/OrderService'
import { Constants } from '../../common/Constants'
import { FeatureToggle } from '../../common/enums/FeatureToggleName'
import { syncFeatureToggle } from './FeatureToggleUtils'

const numberOfDaysAhead = 14
const weekOfDay = moment()
    .tz(CommonParam.userTimeZone || RNLocalize.getTimeZone())
    .format('E')
let retryCount = 0

const getLastSunday = () => {
    return moment().subtract(weekOfDay, 'days').format('YYYY-MM-DD HH:mm:ss')
}

export const getSalesRouteInfo = () => {
    return new Promise((resolve, reject) => {
        getRouteFromEtrForPSR().then((routeId) => {
            SoupService.retrieveDataFromSoup('Route_Sales_Geo__c', {}, ['Id', 'Dist_Target_for_Customer__c'], null, [
                formatString(
                    `WHERE {Route_Sales_Geo__c:Id} IN ('${routeId}}') ` + 'ORDER BY {Route_Sales_Geo__c:Id} LIMIT 1',
                    [CommonParam.userId]
                )
            ])
                .then((res) => {
                    if (res.length > 0) {
                        resolve({ routeId: res[0].Id, DistTgtP: res[0].Dist_Target_for_Customer__c })
                    } else {
                        resolve({ routeId: '', DistTgtP: '' })
                    }
                })
                .catch(async (err) => {
                    const rejection = {
                        status: 'E2',
                        error: err,
                        method: 'getSalesRouteInfo',
                        objectName: 'Route_Sales_Geo__c'
                    }
                    await storeClassLog(Log.MOBILE_ERROR, 'InnovationProductUtils.getSalesRouteInfo', rejection)
                    reject(rejection)
                })
        })
    })
}

export const getDAMAccessToken = async () => {
    return new Promise((resolve, reject) => {
        const bodyPayload =
            'client_id=' +
            CommonParam.innovation.PBNA_INNOVATION_CLIENT_ID +
            '&client_secret=' +
            CommonParam.innovation.PBNA_INNOVATION_CLIENT_SECRET +
            '&grant_type=' +
            'client_credentials'
        axios
            .post(CommonApi.PBNA_MOBILE_URL_IP_DAM_ACCESS_TOKEN, bodyPayload, {
                headers: {
                    'Content-Type': Constants.CONTENT_TYPE
                }
            })
            .then((res) => {
                const response = res.data
                const tokenType = response.token_type.charAt(0).toUpperCase() + response.token_type.slice(1)
                const accessToken = tokenType + ' ' + response.access_token
                AsyncStorage.setItem('DAMAccessToken', JSON.stringify(accessToken))
                resolve({
                    status: 'E0',
                    method: 'getDAMAccessToken'
                })
            })
            .catch((err) => {
                storeClassLog(
                    Log.MOBILE_INFO,
                    'InnovationProductUtils.getDAMAccessToken',
                    `fetch DAMAccessToken failed: ${getStringValue(err)}`
                )
                reject({
                    status: 'E2',
                    error: err,
                    method: 'getDAMAccessToken'
                })
            })
    })
}

export const syncProductImage = async (GTINsLst: any, isPK: boolean) => {
    return new Promise((resolve: (value: any) => void, reject) => {
        const GTINsLstStr = '[' + GTINsLst.map((GTINs) => `"${GTINs}"`).join(',') + ']'
        const path = isPK
            ? `&property_GTIN=${GTINsLstStr}&property_Image_Nature=A`
            : `&property_GTIN=${GTINsLstStr}&property_Angle_Identifier=N`
        AsyncStorage.getItem('DAMAccessToken', (err, accessToken) => {
            if (!err && accessToken) {
                axios
                    .get(
                        CommonApi.PBNA_MOBILE_URL_IP_DAM_ASSET_DETAILS +
                            '' +
                            CommonApi.PBNA_MOBILE_URL_IP_DAM_ASSET_P1 +
                            CommonApi.PBNA_MOBILE_URL_IP_DAM_ASSET_P2 +
                            path,
                        {
                            headers: {
                                Authorization: JSON.parse(accessToken),
                                'Content-Type': 'application/json'
                            }
                        }
                    )
                    .then((res) => {
                        return res.data
                    })
                    .then((imageInfoLst) => {
                        const GTINSMap = new Map()
                        GTINsLst.forEach((GTINItem) => {
                            let pickImageUrl = null
                            let angleIdentifier = ''
                            let imageNature = ''
                            imageInfoLst.forEach((imageItem) => {
                                if (imageItem.property_GTIN[0] === GTINItem) {
                                    if (isPK) {
                                        if (pickImageUrl && angleIdentifier === '') {
                                            pickImageUrl = imageItem.thumbnails.thul
                                            angleIdentifier = imageItem.property_Angle_Identifier[0]
                                        } else {
                                            if (
                                                imageItem.property_Angle_Identifier[0] === 'L' ||
                                                (imageItem.property_Angle_Identifier[0] === 'R' &&
                                                    angleIdentifier !== 'L') ||
                                                (imageItem.property_Angle_Identifier[0] === 'C' &&
                                                    angleIdentifier !== 'R' &&
                                                    angleIdentifier !== 'L') ||
                                                (imageItem.property_Angle_Identifier[0] === 'N' &&
                                                    angleIdentifier !== 'R' &&
                                                    angleIdentifier !== 'L' &&
                                                    angleIdentifier !== 'C')
                                            ) {
                                                pickImageUrl = imageItem.thumbnails.thul
                                                angleIdentifier = imageItem.property_Angle_Identifier[0]
                                            }
                                        }
                                    } else {
                                        if (pickImageUrl && imageNature === '') {
                                            pickImageUrl = imageItem.thumbnails.thul
                                            imageNature = imageItem.property_Image_Nature[0]
                                        } else {
                                            if (
                                                imageItem.property_Image_Nature[0] === 'C' ||
                                                (imageItem.property_Image_Nature[0] === 'A' && imageNature !== 'C')
                                            ) {
                                                pickImageUrl = imageItem.thumbnails.thul
                                                imageNature = imageItem.property_Image_Nature[0]
                                            }
                                        }
                                    }
                                }
                            })
                            GTINSMap.set(GTINItem, pickImageUrl)
                        })
                        resolve(GTINSMap)
                    })
            } else {
                reject({ status: 'E3', method: 'syncBarCodeImage', error: err })
            }
        })
    })
}

const syncBarCodeImage = async (GTINsLst: any) => {
    return new Promise((resolve: (value: any) => void, reject) => {
        const GTINsLstStr = '[' + GTINsLst.map((GTINs) => `"${GTINs}"`).join(',') + ']'
        const path = `&property_GTIN=${GTINsLstStr}`
        AsyncStorage.getItem('DAMAccessToken', (err, accessToken) => {
            if (!err && accessToken) {
                axios
                    .get(
                        CommonApi.PBNA_MOBILE_URL_IP_DAM_ASSET_DETAILS +
                            '' +
                            CommonApi.PBNA_MOBILE_URL_IP_DAM_ASSET_P2_1 +
                            CommonApi.PBNA_MOBILE_URL_IP_DAM_ASSET_P2_2 +
                            path,
                        {
                            headers: {
                                Authorization: JSON.parse(accessToken),
                                'Content-Type': 'application/json'
                            }
                        }
                    )
                    .then((res) => {
                        const imageInfoLst = res.data
                        const GTINsBarCodeMap = {}
                        const preloadImg = []
                        GTINsLst.forEach((GTINsItem) => {
                            let pickImageUrl = null
                            imageInfoLst.forEach((imageItem) => {
                                if (imageItem.property_GTIN[0] === GTINsItem) {
                                    pickImageUrl = imageItem?.thumbnails?.thul
                                    if (pickImageUrl) {
                                        preloadImg.push({
                                            uri: imageItem?.thumbnails?.thul,
                                            headers: {
                                                Authorization: JSON.parse(accessToken),
                                                accept: 'image/png'
                                            }
                                        })
                                    }
                                }
                            })
                            GTINsBarCodeMap[GTINsItem] = pickImageUrl
                        })
                        FastImage.preload(preloadImg)
                        resolve(GTINsBarCodeMap)
                    })
                    .catch((error) => {
                        if (isPersonaUGMOrSDL() && retryCount < 1) {
                            retryCount += 1
                            getDAMAccessToken()
                                .then(() => {
                                    syncBarCodeImage(GTINsLst)
                                })
                                .catch((e) => {
                                    reject({ status: 'E3', method: 'syncBarCodeImage', error: e })
                                })
                        } else {
                            reject({ status: 'E3', method: 'syncBarCodeImage', error: error })
                        }
                    })
            } else {
                reject({ status: 'E3', method: 'syncBarCodeImage', error: err })
            }
        })
    })
}

export const syncInnovationProductData = async (rsId: string) => {
    const innovRecordTypeId = await getRecordTypeId('Innovation Product', 'StoreProduct')
    return new Promise((resolve: (value: any) => void) => {
        const toDay = moment().add(numberOfDaysAhead, 'days').format(TIME_FORMAT.Y_MM_DD)
        restDataCommonCall(
            'query/?q=SELECT Id,RetailStoreId,Auth_Date__c,Combined_Auth_Flag__c,Product.Formatted_Package__c,Product.Material_Unique_ID__c,' +
                'Product.Brand_Name__c,Product.Sub_Brand__c,Product.StockKeepingUnit,' +
                'Product.IsActive,Product.Formatted_Flavor__c,Product.LTO__c,Mandated_Sell__c,Product_Availability__c,ProductId,Product.Flavor_Name__c,' +
                'Product.National_Launch_Date__c,Status__c,' +
                'Product.Formatted_Brand__c,Product.Formatted_Sub_Brand_Name__c,' +
                'Product.Brand_Code__c,Product.Sub_Brand_Code__c, Product.Package_Type_Name__c,' +
                `Product.GTIN__c, No_12_LCW_Void__c, No_11_WTD_Void__c, YTD_Volume__c FROM StoreProduct WHERE RetailStoreId IN (${rsId})` +
                ' AND Delete_Flag__c = false' +
                ' AND Product_Availability__c = true' +
                ` AND Product.National_Launch_Date__c <= ${toDay}` +
                ` AND RecordTypeId='${innovRecordTypeId}' AND Product.Innov_Flag__c = true` +
                ' AND Combined_Auth_Flag__c=true AND Product.IsActive = true',
            'GET'
        ).then(async (res) => {
            const spData = res.data.records
            const GITNsLst = []
            const GITNsPkLst = []
            const spLst = []
            const pkSPLst = []
            if (spData) {
                spData.forEach((spItem: any) => {
                    if (spItem.Product.Formatted_Package__c) {
                        if (spItem.Product.Formatted_Package__c.toLowerCase().indexOf('pk') !== -1) {
                            pkSPLst.push(spItem)
                            if (!GITNsPkLst.includes(spItem.Product.GTIN__c)) {
                                GITNsPkLst.push(spItem.Product.GTIN__c)
                            }
                        } else {
                            if (!GITNsLst.includes(spItem.Product.GTIN__c)) {
                                GITNsLst.push(spItem.Product.GTIN__c)
                            }
                            spLst.push(spItem)
                        }
                    } else {
                        spLst.push(spItem)
                        if (!GITNsLst.includes(spItem.Product.GTIN__c)) {
                            GITNsLst.push(spItem.Product.GTIN__c)
                        }
                    }
                })
            }
            const resObj = {
                GITNsLst: GITNsLst,
                GITNsPkLst: GITNsPkLst,
                spLst: spLst,
                pkSPLst: pkSPLst
            }
            resolve(resObj)
        })
    })
}

const syncOrderItem = (rsId: string) => {
    return new Promise((resolve) => {
        SoupService.retrieveDataFromSoup('OrderItem', {}, [], null, [
            `WHERE {OrderItem:Order.RetailStore__c} IN (${rsId})`
        ]).then((orderItem) => {
            if (orderItem.length) {
                SoupService.removeRecordFromSoup(
                    'OrderItem',
                    orderItem.filter((v) => v.Id).map((v) => v._soupEntryId)
                )
            }
            const requests = []
            if (!_.isEmpty(rsId)) {
                const lastSunday = moment().subtract(weekOfDay, 'days').format('YYYY-MM-DD HH:mm:ss')
                const last2WksDate = moment(lastSunday).add(-7, 'days').format(TIME_FORMAT.Y_MM_DD)
                requests.push(
                    buildSyncDownObjPromise(
                        'OrderItem',
                        `SELECT ${getAllFieldsByObjName('OrderItem').join()} ` +
                            `FROM OrderItem WHERE OrderId IN (SELECT Id FROM Order WHERE RetailStore__c IN (${rsId}) ` +
                            `AND EffectiveDate >= ${last2WksDate} AND Order_ATC_Type__c = 'Normal') AND Product2.Innov_Flag__c = true`
                    )
                )
                promiseQueue(requests).then(() => {
                    resolve({ status: 'E0' })
                })
            }
        })
    })
}

export const retrieveDataOnline = (objName: string, q: string) => {
    return new Promise<CommonSyncRes>((resolve, reject) => {
        const path = `query/?q=${q}`
        restDataCommonCall(path, 'GET')
            .then(async (res) => {
                const records = res.data.records
                let remainedRecords = []
                try {
                    if (!res.data.done) {
                        const totalSize = res.data.totalSize
                        const nextRecordsUrl = res.data.nextRecordsUrl
                        // so the Id can be got by slice the 27-45.
                        const queryId = nextRecordsUrl.slice(27, 45)
                        const limit = nextRecordsUrl.split('-')[1]
                        remainedRecords = await getRemainedRecords(objName, totalSize, queryId, limit, false)
                    }
                    resolve({
                        status: 'E0',
                        method: 'retrieveDataOnline',
                        objectName: objName,
                        data: [...records, ...remainedRecords]
                    })
                } catch (e) {
                    await storeClassLog(Log.MOBILE_ERROR, 'retrieveDataOnline', e)
                    reject(e)
                }
            })
            .catch(async (err) => {
                await storeClassLog(Log.MOBILE_ERROR, 'InnovationProductUtils.retrieveDataOnline', err)
                reject(err)
            })
    })
}

const deliveredStatusUpdate = async (spAll: any) => {
    const updateLst = []
    spAll = spAll.data ? spAll.data : spAll
    spAll.forEach((item) => {
        if ((item.Status__c === 'Snoozed' || item.Status__c === 'No Sale') && item.No_11_WTD_Void__c) {
            updateLst.push(item['Product.ProductCode'] ? item['Product.ProductCode'] : item.Product.ProductCode)
        }
    })
    if (updateLst.length > 0) {
        const updateSP = []
        for (const sp of spAll) {
            if (
                updateLst.indexOf(sp['Product.ProductCode'] ? sp['Product.ProductCode'] : sp.Product.ProductCode) >= 0
            ) {
                const updateItem = _.cloneDeep(sp)
                updateItem.Status__c = 'Action'
                updateItem.Date_Of_No_Sale__c = null
                updateItem.Date_Of_Wake__c = null
                updateSP.push(updateItem)
            }
        }
        const storeProductSyncUpFields = ['Id', 'Status__c', 'Date_Of_No_Sale__c', 'Date_Of_Wake__c']
        try {
            await syncUpObjUpdateFromMem(
                'StoreProduct',
                filterExistFields('StoreProduct', updateSP, storeProductSyncUpFields),
                false
            )
        } catch (e) {
            await storeClassLog(Log.MOBILE_INFO, 'InnovationProductUtils.updateStoreProdToSF', e)
        }
    }
}

const upcGrouping = (prev: any, next: any, sp: any) => {
    next.Combined_Auth_Flag__c = sp.Combined_Auth_Flag__c || prev.Combined_Auth_Flag__c
    next.Mandated_Sell__c = sp.Mandated_Sell__c || prev.Mandated_Sell__c
    next.No_11_WTD_Void__c = sp.No_11_WTD_Void__c || prev.No_11_WTD_Void__c
    next.No_12_LCW_Void__c = sp.No_12_LCW_Void__c || prev.No_12_LCW_Void__c
    next.Product.LTO__c = sp.Product.LTO__c || prev.Product.LTO__c
    next.Product_Availability__c = sp.Product_Availability__c || prev.Product_Availability__c
    next.YTD_Volume__c = sp.YTD_Volume__c + prev.YTD_Volume__c
    next.YTD_LCD_Vol__c = sp.YTD_LCD_Vol__c + prev.YTD_LCD_Vol__c
    next.YTD_Net_Revenue__c = sp.YTD_Net_Revenue__c + prev.YTD_Net_Revenue__c
    next.Vol_11_WTD__c =
        sp.Vol_11_WTD__c === null && prev.Vol_11_WTD__c === null ? null : sp.Vol_11_WTD__c + prev.Vol_11_WTD__c
    next.IP_Score__c = next.IP_Score__c < sp.IP_Score__c ? sp.IP_Score__c : next.IP_Score__c
    if ((next.Status__c === 'Snoozed' || next.Status__c === 'No Sale') && next.No_11_WTD_Void__c) {
        next.Status__c = 'Action'
        next.Date_Of_No_Sale__c = null
        next.Date_Of_Wake__c = null
    }
    return next
}

export const getProductGTINs = (spData: any, fromLocal: boolean = true) => {
    const GTINs = []
    const pkGTINs = []
    if (!_.isEmpty(spData)) {
        spData.forEach((spItem: any) => {
            const formattedPackage = fromLocal
                ? spItem['Product.Formatted_Package__c']
                : spItem.Product.Formatted_Package__c
            const GtinC = fromLocal ? spItem['Product.GTIN__c'] : spItem.Product.GTIN__c
            if (formattedPackage) {
                if (formattedPackage.toLowerCase().indexOf('pk') !== -1) {
                    if (!pkGTINs.includes(GtinC) && GtinC) {
                        pkGTINs.push(GtinC)
                    }
                } else {
                    if (!GTINs.includes(GtinC) && GtinC) {
                        GTINs.push(GtinC)
                    }
                }
            } else {
                if (!GTINs.includes(GtinC) && GtinC) {
                    GTINs.push(GtinC)
                }
            }
        })
    }
    return { GTINs, pkGTINs }
}

export const getGTINsMap = async (GTINs, pkGTINs) => {
    const pkMap = await syncProductImage(pkGTINs, true)
    const notPkMap = await syncProductImage(GTINs, false)
    const GTINsMap = {}
    GTINs.forEach((v) => {
        GTINsMap[v] = notPkMap.get(v)
    })
    pkGTINs.forEach((v) => {
        GTINsMap[v] = pkMap.get(v)
    })

    return GTINsMap
}

const getGTINsBarCodeMap = async (GTINs, pkGTINs) => {
    const allGTINs = GTINs.concat(pkGTINs)
    return syncBarCodeImage(allGTINs)
}

const getGTINsWithStoreProduct = async (storeProductData) => {
    try {
        const barCodeData = await AsyncStorage.getItem('GTIN_BARCODE_MAP')
        const imgData = await AsyncStorage.getItem('GTIN_IMG_MAP')
        const barCodeRefresh = { ...JSON.parse(barCodeData) }
        const imgRefresh = { ...JSON.parse(imgData) }
        const { GTINs, pkGTINs } = getProductGTINs(storeProductData, false)
        const GTINsBarCodeMap = await getGTINsBarCodeMap(GTINs, pkGTINs)
        const GTINsMap = await getGTINsMap(GTINs, pkGTINs)
        _.forEach(GTINsBarCodeMap, (v, k) => {
            barCodeRefresh[k] = v
        })
        _.forEach(GTINsMap, (v, k) => {
            imgRefresh[k] = v
        })
        await AsyncStorage.setItem('GTIN_BARCODE_MAP', JSON.stringify(barCodeRefresh))
        await AsyncStorage.setItem('GTIN_IMG_MAP', JSON.stringify(imgRefresh))
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'RepOrKam-getGTINsWithStoreProduct',
            'Get GINs With Store Product: ' + getStringValue(error)
        )
    }
}

const deleteInvalidProductData = async (inRetailStoreProduct: any, onLineData: any) => {
    const invalidProduct = []
    inRetailStoreProduct.forEach((localItem) => {
        const deletedItems = onLineData.filter((onlineItem) => onlineItem.Id === localItem.Id)
        if (deletedItems.length === 0) {
            invalidProduct.push(localItem)
        }
    })
    await SoupService.removeRecordFromSoup(
        'StoreProduct',
        invalidProduct.map((v) => v._soupEntryId)
    )
}

const dealWithMetricsProduct = async () => {
    if (isPersonaPSR()) {
        const retailStoreData = await SoupService.retrieveDataFromSoup('RetailStore', {}, ['Id'], null, [
            getRetailStoreQuery()
        ])
        if (!_.isEmpty(retailStoreData)) {
            const storeProductData = await SoupService.retrieveDataFromSoup('StoreProduct', {}, [], null, [
                'WHERE {StoreProduct:RetailStoreId} IN ' +
                    `(SELECT {RetailStore:Id} FROM {RetailStore} ${getRetailStoreQuery()})`
            ])
            const orderItemData = await SoupService.retrieveDataFromSoup('OrderItem', {}, [], null, [
                `WHERE {OrderItem:Order.RetailStore__c} IN 
             (SELECT {RetailStore:Id} FROM {RetailStore} ${getRetailStoreQuery()})
             AND {OrderItem:Order.EffectiveDate} >= ${getLastTwoWksDate()}
             AND {OrderItem:Product2.Innov_Flag__c} = true`
            ])

            const metricsData = await getMetricsStoreProductItem(
                {
                    spLst: storeProductData,
                    orderItemLst: orderItemData
                },
                getLastSunday(),
                retailStoreData.length,
                false
            )
            await Promise.all([SoupService.clearSoup('MetricsProduct')])
            await SoupService.upsertDataIntoSoup('MetricsProduct', metricsData)
        }
        DeviceEventEmitter.emit(DeviceEvent.CAROUSEL_REFRESH)
    }
}
export const refreshInnovationProduct = async (retailStoreId: string) => {
    try {
        const toDay = moment().add(numberOfDaysAhead, 'days').format(TIME_FORMAT.Y_MM_DD)
        const innovationRecordTypeId = await getRecordTypeIdByDeveloperName('Innovation_RecordType', 'StoreProduct')
        const inRetailStoreProduct = await SoupService.retrieveDataFromSoup(
            'StoreProduct',
            {},
            ['Id', '_soupEntryId'],
            null,
            [`WHERE {StoreProduct:RetailStoreId}='${retailStoreId}'`]
        )
        const spAll = await retrieveDataOnline(
            'StoreProduct',
            formatString(
                `SELECT ${getAllFieldsByObjName('StoreProduct').join()} FROM StoreProduct` +
                    ` WHERE RetailStoreId='${retailStoreId}'` +
                    ' AND Delete_Flag__c = false' +
                    ` AND Product.National_Launch_Date__c <= ${toDay}` +
                    " AND RecordTypeId='%s' AND Product.Innov_Flag__c = true" +
                    ' AND Product.IsActive = true' +
                    ' AND Product_Availability__c = true' +
                    ' AND Product.ProductCode != null' +
                    ' ORDER BY Product.ProductCode, Product.Material_Unique_ID__c',
                [innovationRecordTypeId]
            )
        )
        await deliveredStatusUpdate(spAll)
        const spUPC = {}
        let lastUPC
        spAll.data.forEach((sp, idx, array) => {
            const upcCode = sp.Product.ProductCode
            if (_.isEmpty(spUPC[upcCode])) {
                if ((sp.Status__c === 'Snoozed' || sp.Status__c === 'No Sale') && sp.No_11_WTD_Void__c) {
                    sp.Status__c = 'Action'
                }
                spUPC[upcCode] = sp
                if (!_.isEmpty(lastUPC)) {
                    if (lastUPC !== upcCode && !spUPC[lastUPC].Combined_Auth_Flag__c) {
                        delete spUPC[lastUPC]
                    }
                }
                lastUPC = upcCode
                if (idx === array.length - 1 && !sp.Combined_Auth_Flag__c) {
                    delete spUPC[upcCode]
                }
            } else {
                const prev = spUPC[upcCode]
                const next = _.cloneDeep(prev)
                spUPC[upcCode] = upcGrouping(prev, next, sp)
                lastUPC = upcCode
                if (idx === array.length - 1 && !spUPC[upcCode].Combined_Auth_Flag__c) {
                    delete spUPC[upcCode]
                }
            }
        })
        deleteInvalidProductData(inRetailStoreProduct, Object.values(spUPC))
        await SoupService.upsertDataIntoSoupWithExternalId('StoreProduct', Object.values(spUPC), false, true)
        await syncOrderItem(`'${retailStoreId}'`)
        if (isPersonaUGMOrSDL() || isPersonaKAM()) {
            retryCount = 0
            getGTINsWithStoreProduct(Object.values(spUPC))
            return
        }
        dealWithMetricsProduct()
    } catch (err) {
        storeClassLog(Log.MOBILE_ERROR, 'refreshInnovationProduct', err)
    }
}

export const getMetricsInnovationProductData = async (rsIds: any, filterQuery?: any) => {
    return new Promise((resolve, reject) => {
        if (rsIds) {
            let spQuery = `WHERE {StoreProduct:RetailStoreId} IN (${rsIds})`
            if (filterQuery) {
                spQuery = spQuery + ' AND ' + filterQuery
            }
            SoupService.retrieveDataFromSoup('StoreProduct', {}, [], null, [spQuery])
                .then((spLst) => {
                    SoupService.retrieveDataFromSoup('OrderItem', {}, [], null, [
                        `WHERE {OrderItem:Order.RetailStore__c} IN (${rsIds})
                        AND {OrderItem:Order.EffectiveDate} >= ${getLastTwoWksDate()}
                        AND {OrderItem:Product2.Innov_Flag__c} = true`
                    ])
                        .then((orderItemLst) => {
                            resolve({
                                spLst: spLst,
                                orderItemLst: orderItemLst
                            })
                        })
                        .catch(async (err) => {
                            const rejection = {
                                status: 'E2',
                                error: err,
                                method: 'getMetricsInnovationProductData',
                                objectName: 'OrderItem'
                            }
                            await storeClassLog(
                                Log.MOBILE_ERROR,
                                'InnovationProductUtils.getMetricsInnovationProductData',
                                rejection
                            )
                            reject(rejection)
                        })
                })
                .catch(async (err) => {
                    const rejection = {
                        status: 'E2',
                        error: err,
                        method: 'getMetricsInnovationProductData',
                        objectName: 'StoreProduct'
                    }
                    await storeClassLog(
                        Log.MOBILE_ERROR,
                        'InnovationProductUtils.getMetricsInnovationProductData',
                        rejection
                    )
                    reject(rejection)
                })
        } else {
            resolve({
                spLst: [],
                orderItemLst: []
            })
        }
    })
}

const retrieveCarouselCardData = (retailStoreId: any, isArchive?: boolean, searchValue?: string) => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'StoreProduct',
            {},
            InnovationProductQueries.getCarouselCardQuery.f,
            InnovationProductQueries.getCarouselCardQuery.q1 +
                `{StoreProduct:RetailStoreId}="${retailStoreId}"` +
                (searchValue
                    ? ` AND (COALESCE({StoreProduct:Product.Formatted_Sub_Brand_Name__c}, {StoreProduct:Product.Sub_Brand__c}) LIKE '%${searchValue}%' ` +
                      `OR COALESCE({StoreProduct:Product.Formatted_Brand__c}, {StoreProduct:Product.Brand_Name__c}) LIKE '%${searchValue}%')`
                    : '') +
                (isArchive
                    ? InnovationProductQueries.getCarouselCardQuery.q3
                    : InnovationProductQueries.getCarouselCardQuery.q2)
        )
            .then((res: any) => {
                resolve(res)
            })
            .catch(async (err) => {
                const rejection = {
                    status: 'E2',
                    error: err,
                    method: 'retrieveCarouselCardData',
                    objectName: 'StoreProduct'
                }
                await storeClassLog(Log.MOBILE_ERROR, 'InnovationProductUtils.retrieveCarouselCardData', rejection)
                reject(rejection)
            })
    })
}

const getRetrieveCarouselCardData = (
    retailStoreId: any,
    innovRetryCount: number,
    isArchive?: boolean,
    searchValue?: string,
    resolve?: any,
    reject?: any
) => {
    retrieveCarouselCardData(retailStoreId, isArchive, searchValue)
        .then((res) => {
            if (res) {
                SoupService.retrieveDataFromSoup('StoreProduct', {}, [], null, [
                    `WHERE {StoreProduct:RetailStoreId}="${retailStoreId}"` +
                        InnovationProductQueries.getCarouselSKUItemSortQuery.q
                ])
                    .then((spRes) => {
                        resolve({
                            carouselDataLst: res,
                            storeProductLst: spRes
                        })
                    })
                    .catch(async (err) => {
                        await storeClassLog(Log.MOBILE_ERROR, 'retrieveStoreProduct', ErrorUtils.error2String(err))
                        reject(err)
                    })
            } else {
                if (innovRetryCount < 1) {
                    getRetrieveCarouselCardData(
                        retailStoreId,
                        innovRetryCount + 1,
                        isArchive,
                        searchValue,
                        resolve,
                        reject
                    )
                }
            }
        })
        .catch(async (err) => {
            const rejection = {
                status: 'E2',
                error: err,
                method: 'getInnovationCarouselDetailData',
                objectName: 'StoreProduct'
            }
            await storeClassLog(Log.MOBILE_ERROR, 'getRetrieveCarouselCardData', ErrorUtils.error2String(rejection))
            reject(rejection)
        })
}
export const getInnovationCarouselDetailData = (retailStoreId: any, isArchive?: boolean, searchValue?: string) => {
    const innovRetryCount = 0
    return new Promise((resolve, reject) => {
        getRetrieveCarouselCardData(retailStoreId, innovRetryCount, isArchive, searchValue, resolve, reject)
    })
}

export const updateMetricsProductInLocalStorage = (metricsData: any, wiredCount: any) => {
    return new Promise((resolve, reject) => {
        const lastSunday = moment().subtract(weekOfDay, 'days').format('YYYY-MM-DD HH:mm:ss')
        SoupService.retrieveDataFromSoup('MetricsProduct', {}, [], null)
            .then((deleteData: any) => {
                if (deleteData.length > 0) {
                    SoupService.removeRecordFromSoup(
                        'MetricsProduct',
                        deleteData.map((v) => v._soupEntryId)
                    )
                }
                getMetricsStoreProductItem(metricsData, lastSunday, wiredCount).then((metricsDataRes: any) => {
                    SoupService.upsertDataIntoSoupWithExternalId('MetricsProduct', metricsDataRes).then((res) => {
                        resolve({ status: 'E0', res: res })
                    })
                })
            })
            .catch(async (err) => {
                const rejection = {
                    status: 'E2',
                    error: err,
                    method: 'updateMetricsProductInLocalStorage',
                    objectName: 'MetricsProduct'
                }
                await storeClassLog(
                    Log.MOBILE_ERROR,
                    'InnovationProductUtils.updateMetricsProductInLocalStorage',
                    rejection
                )
                reject(rejection)
            })
    })
}

export const getLocalStoreInnovationProductData = (searchText: any, sortSelected: any) => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup('MetricsProduct', {}, [], null, [
            getMetricsInnovProdQuery(searchText, sortSelected)
        ])
            .then((result) => {
                resolve(result)
            })
            .catch(async (err) => {
                const rejection = {
                    status: 'E2',
                    error: err,
                    method: 'getLocalStoreInnovationProductData',
                    objectName: 'MetricsProduct'
                }
                await storeClassLog(
                    Log.MOBILE_ERROR,
                    'InnovationProductUtils.getLocalStoreInnovationProductData',
                    rejection
                )
                reject(rejection)
            })
    })
}

export const retrieveMetricsObj = async (objName: string, query: string) => {
    const localData = await SoupService.retrieveDataFromSoup(objName, {}, [], null)
    await SoupService.removeRecordFromSoup(
        objName,
        localData.map((v) => v._soupEntryId)
    )
    syncDownObj(objName, query).catch(async (err) => {
        await SoupService.removeDataFromSoup(objName)
        await SoupService.upsertDataIntoSoupWithExternalId(objName, localData)
        const rejection = {
            status: 'E2',
            error: err,
            method: 'updateRouteSalesGeo',
            objectName: objName
        }
        await storeClassLog(Log.MOBILE_ERROR, 'InnovationProductUtils.updateRouteSalesGeo', rejection)
    })
}

export const metricsAuthMap = async (wiredCount) => {
    const lastSunday = moment().subtract(weekOfDay, 'days').format('YYYY-MM-DD HH:mm:ss')
    const retailStore = await SoupService.retrieveDataFromSoup('RetailStore', {}, ['Id'], null, [getRetailStoreQuery()])
    const rsIds = retailStore.map((v) => `'${v.Id}'`).join(',')
    const data = await getMetricsInnovationProductData(rsIds)
    const allMetricsData = await getMetricsStoreProductItem(data, lastSunday, wiredCount)
    const authLst = []
    allMetricsData.forEach((v) => {
        authLst.push({ Id: v.Id, auth: v.authCount === wiredCount })
    })
    return authLst
}

const delay = new Promise((resolve) => {
    const delayTime = 2000
    setTimeout(() => {
        resolve({ status: 'E0' })
    }, delayTime)
})

const syncStoreProduct = async (rsIdGroup, toDay, innovationRecordTypeId) => {
    let spAll = []
    for (const rsIds of rsIdGroup) {
        const storeProductData = await retrieveDataOnline(
            'StoreProduct',
            formatString(
                `SELECT ${getAllFieldsByObjName('StoreProduct').join()} FROM StoreProduct` +
                    ` WHERE RetailStoreId IN (${rsIds.join(',')})` +
                    ' AND Delete_Flag__c = false' +
                    ` AND Product.National_Launch_Date__c <= ${toDay}` +
                    " AND RecordTypeId='%s' AND Product.Innov_Flag__c = true" +
                    ' AND Product.IsActive = true' +
                    ' AND Product_Availability__c = true' +
                    ' AND Product.ProductCode != null' +
                    ' ORDER BY RetailStoreId, Product.ProductCode, Product.Material_Unique_ID__c',
                [innovationRecordTypeId]
            )
        )
        spAll = spAll.concat(storeProductData.data)
    }
    await deliveredStatusUpdate(spAll)
    return spAll
}

export const switchATCEntrance = async () => {
    await syncFeatureToggle()
    CommonParam.isATC = CommonParam.FeatureToggle[FeatureToggle.ADD_TO_CART]
}

const syncDownOrderItem = async (inRouteRetailStoreIds, last2WksDate, chunkSize = 300) => {
    const promiseArr = []
    const sliceRsIds = _.chunk(inRouteRetailStoreIds, chunkSize)
    for (const rsIds of sliceRsIds) {
        const promise = new Promise((resolve, reject) => {
            syncDownObj(
                'OrderItem',
                `SELECT ${getAllFieldsByObjName('OrderItem').join()} ` +
                    'FROM OrderItem WHERE OrderId IN' +
                    `(SELECT Id FROM Order WHERE RetailStore__c IN (${rsIds
                        .map((v: any) => v)
                        .join(',')}) AND EffectiveDate >= ${last2WksDate} AND Order_ATC_Type__c = 'Normal')` +
                    'AND Product2.Innov_Flag__c = true'
            )
                .then((res) => {
                    resolve(res.data)
                })
                .catch((err) => reject(err))
        })
        promiseArr.push(promise)
    }
    return new Promise((resolve, reject) => {
        Promise.all(promiseArr)
            .then((res) => {
                resolve(res)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const getLastRouteViewedInfo = async () => {
    const resData = {
        Last_Route_Viewed__c: '',
        LOC_ID__c: ''
    }
    return new Promise<CommonSyncRes | any>((resolve, reject) => {
        return syncDownObj(
            'User__c',
            `SELECT Last_Route_Viewed__c FROM User
            WHERE 
                Id = '${CommonParam.userId}'
            `,
            false
        )
            .then((res) => {
                const RSGId = _.isEmpty(res.data[0].Last_Route_Viewed__c) ? '' : res.data[0].Last_Route_Viewed__c
                if (!_.isEmpty(RSGId)) {
                    const today = moment().format(TIME_FORMAT.Y_MM_DD)
                    syncDownObj(
                        'Route_Sales_Geo__c',
                        `SELECT 
                            LOC_ID__c 
                        FROM 
                            Route_Sales_Geo__c 
                        WHERE
                            GTMU_RTE_ID__c = '${RSGId}'
                            AND HRCHY_LVL__c = 'Route'
                            AND (RTE_END_DT__c = null OR RTE_END_DT__c >= ${today})
                            AND RTE_STRT_DT__c <= ${today}
                            AND RTE_TYP_GRP_CDV__c in ('001', '002', '003', '004')
                        `,
                        false
                    )
                        .then((res) => {
                            if (res.status === 'E0' && Array.isArray(res.data) && !_.isEmpty(res.data)) {
                                resData.Last_Route_Viewed__c = RSGId
                                resData.LOC_ID__c = res.data[0].LOC_ID__c
                            }
                            resolve(resData)
                        })
                        .catch((err) => {
                            reject(err)
                        })
                } else {
                    resolve(resData)
                }
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const getMyDayVisitForPSR = async () => {
    let retailStoreIds = []
    const myDayVisit = await SoupService.retrieveDataFromSoup('Visit', {}, ['Id', 'PlaceId', 'Visit_List__c'], null, [])
    try {
        if (!_.isEmpty(myDayVisit)) {
            const uniqStoreIds = _.uniq(myDayVisit.map((visit) => visit.PlaceId))
            const vlIds = _.uniq(myDayVisit.map((visit) => visit.Visit_List__c).filter((vl) => vl))
            await syncDownObjByIds('Visit_List__c', getAllFieldsByObjName('Visit_List__c'), vlIds)
            const RetailStoreSyncFields = BaseInstance.sfSoupEngine.getSoupFieldList('RetailStore', 'Remote')
            const rsData = await batchSynDown(uniqStoreIds, {
                name: 'RetailStore',
                whereClause: 'Id IN {BatchIds} AND Account.IS_ACTIVE__c=true',
                updateLocalSoup: true,
                batchLimit: 100,
                fields: RetailStoreSyncFields,
                allOrNone: true
            })
            let storeArr: any[] = []
            rsData?.forEach((account) => {
                storeArr = storeArr.concat(account)
            })
            retailStoreIds = storeArr.map((v) => `'${v.Id}'`)
        }
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'getMyDayVisitForPSR', error)
    }
    return retailStoreIds
}

//  Pawn 2022/08/23 remove Sales_Route__c and query retail store by ATM
export const getRetailStoreData = async () => {
    if (CommonParam.PERSONA__c === Persona.SALES_DISTRICT_LEADER) {
        const retailStoreData = await SoupService.retrieveDataFromSoup(
            'RetailStore',
            {},
            ['Id', 'Account.Sales_Route__c'],
            null,
            []
        )
        const inRouteRetailStoreIds = retailStoreData.map((v: any) => v.Id)
        const storeIds = retailStoreData.map((v) => `'${v.Id}'`)
        return { inRouteRetailStoreIds, storeIds }
    }
    const etrForPSR = await syncDownObj(
        'Employee_To_Route__c',
        formatString(
            `SELECT ${getAllFieldsByObjName(
                'Employee_To_Route__c'
            ).join()} FROM Employee_To_Route__c WHERE User__c='%s' AND Active_Flag__c = true`,
            [CommonParam.userId]
        )
    )
    etrForPSR.data[0] && (await AsyncStorage.setItem('etrForPSR', JSON.stringify(etrForPSR.data[0])))
    let ctrData, routeData
    if (isPersonaPSR()) {
        ctrData = await syncDownObj(
            'Customer_to_Route__c',
            formatString(
                `SELECT ${getAllFieldsByObjName(
                    'Customer_to_Route__c'
                ).join()} FROM Customer_to_Route__c WHERE Route__c ='%s' AND ACTV_FLG__c = true AND Merch_Flag__c = false AND RecordType.Name = 'CTR'`,
                [CommonParam.userRouteId]
            )
        )
    } else {
        routeData = await SoupService.retrieveDataFromSoup('Route_Sales_Geo__c', {}, [], null, [
            formatString(
                `WHERE {Route_Sales_Geo__c:Id} IN ('${etrForPSR.data[0].Route__c}') ` +
                    'ORDER BY {Route_Sales_Geo__c:Id} LIMIT 1',
                [CommonParam.userId]
            )
        ])
    }
    let inRouteRetailStoreIds = []
    let retailStoreIds = []
    if ((ctrData.status === 'E0' && !_.isEmpty(ctrData.data)) || !_.isEmpty(routeData)) {
        const salesVisitStoreId = await syncDownObj(
            'RetailStore',
            `SELECT ${getAllFieldsByObjName('RetailStore').join()} FROM RetailStore WHERE AccountId IN (${getIdClause(
                ctrData?.data.map((v: any) => v.Customer__c)
            )}) AND Account.IS_ACTIVE__c=true`
        )
        inRouteRetailStoreIds = salesVisitStoreId.data.map((v: any) => v.Id)
    }
    if (isPersonaPSR()) {
        retailStoreIds = await getMyDayVisitForPSR()
    } else if (!isPersonaPSR()) {
        const { data } = await syncDownObj(
            'RetailStore',
            formatString(
                `SELECT ${getAllFieldsByObjName(
                    'RetailStore'
                ).join()} FROM RetailStore WHERE AccountId IN (SELECT AccountId FROM AccountTeamMember WHERE UserId='%s') AND Account.IS_ACTIVE__c=true`,
                [CommonParam.userId]
            )
        )
        retailStoreIds = data.map((v) => `'${v.Id}'`)
    }
    retailStoreIds = Array.from(new Set(retailStoreIds.concat(inRouteRetailStoreIds.map((v) => "'" + v + "'"))))
    return { inRouteRetailStoreIds, retailStoreIds }
}

async function fixExistingPreset() {
    const fixed = await AsyncStorage.getItem('existingPresetFixed')
    if (fixed) {
        return
    }
    const data = await SoupService.retrieveDataFromSoup('Preset', {}, [], null, [
        formatString("WHERE {Preset:UserId}='%s' ORDER BY {Preset:Name}", [CommonParam.userId])
    ])
    const upserts = data
        .filter((data) => !data.GTMUId)
        .map((el) => {
            return {
                ...el,
                GTMUId: CommonParam.userRouteGTMUId
            }
        })
    await SoupService.upsertDataIntoSoup('Preset', upserts)
    await AsyncStorage.setItem('existingPresetFixed', '1')
}

const dealWithSpRsUPCData = (spAll: any) => {
    const spRsUPC = {}
    let lastRS, lastUPC
    spAll.forEach((sp, idx, array) => {
        const upcCode = sp.Product.ProductCode
        const rsId = sp.RetailStoreId
        if (_.isEmpty(spRsUPC[rsId])) {
            spRsUPC[rsId] = {}
            if ((sp.Status__c === 'Snoozed' || sp.Status__c === 'No Sale') && sp.No_11_WTD_Void__c) {
                sp.Status__c = 'Action'
            }
            spRsUPC[rsId][upcCode] = sp
            if (!_.isEmpty(lastRS) && !_.isEmpty(lastUPC)) {
                if (!spRsUPC[lastRS][lastUPC].Combined_Auth_Flag__c) {
                    delete spRsUPC[lastRS][lastUPC]
                }
            }
            lastRS = rsId
            lastUPC = upcCode
            if (idx === array.length - 1 && !spRsUPC[rsId][upcCode].Combined_Auth_Flag__c) {
                delete spRsUPC[rsId][upcCode]
            }
        } else if (_.isEmpty(spRsUPC[rsId][upcCode])) {
            spRsUPC[rsId][upcCode] = sp
            if (!spRsUPC[rsId][lastUPC].Combined_Auth_Flag__c) {
                delete spRsUPC[rsId][lastUPC]
            }
            lastRS = rsId
            lastUPC = upcCode
            if (idx === array.length - 1 && !spRsUPC[rsId][upcCode].Combined_Auth_Flag__c) {
                delete spRsUPC[rsId][upcCode]
            }
        } else {
            const prev = spRsUPC[rsId][upcCode]
            const next = _.cloneDeep(prev)
            spRsUPC[rsId][upcCode] = upcGrouping(prev, next, sp)
            lastRS = rsId
            lastUPC = upcCode
            if (idx === array.length - 1 && !spRsUPC[rsId][upcCode].Combined_Auth_Flag__c) {
                delete spRsUPC[rsId][upcCode]
            }
        }
    })
    const spUPC = []
    Object.values(spRsUPC).forEach((rs) => {
        Object.values(rs).forEach((upc) => {
            spUPC.push(upc)
        })
    })
    return spUPC
}
export const initSyncInnovationProductData = async () => {
    try {
        if (CommonParam.PERSONA__c === Persona.SALES_DISTRICT_LEADER) {
            await Promise.all([SoupService.clearSoup('StoreProduct')])
        } else {
            await Promise.all([
                SoupService.clearSoup('MetricsProduct'),
                OrderService.deleteOrderItemKeepLocal(),
                SoupService.clearSoup('StoreProduct')
            ])
        }
        const { inRouteRetailStoreIds, retailStoreIds } = await getRetailStoreData()
        if (!_.isEmpty(retailStoreIds)) {
            const toDay = moment().add(numberOfDaysAhead, 'days').format(TIME_FORMAT.Y_MM_DD)
            const innovationRecordTypeId = await getRecordTypeId('Innovation Product', 'StoreProduct')
            const rsIdGroup = _.chunk(retailStoreIds, 500)
            Instrumentation.startTimer('PSR Initial Sync - SF objects StoreProduct')
            const spAll = await syncStoreProduct(rsIdGroup, toDay, innovationRecordTypeId)
            Instrumentation.stopTimer('PSR Initial Sync - SF objects StoreProduct')
            const spUPC = dealWithSpRsUPCData(spAll)
            await SoupService.upsertDataIntoSoupWithExternalId('StoreProduct', spUPC, false, true)
            const weekOfday = moment().tz(CommonParam.userTimeZone).format('E')
            const lastSunday = moment().subtract(weekOfday, 'days').format('YYYY-MM-DD HH:mm:ss')
            const last2WksDate = moment(lastSunday).add(-7, 'days').format(TIME_FORMAT.Y_MM_DD)
            await syncDownOrderItem(retailStoreIds, last2WksDate)
            await delay
            const storeProductData = await SoupService.retrieveDataFromSoup('StoreProduct', {}, [], null, [
                `WHERE {StoreProduct:RetailStoreId} IN (${getIdClause(inRouteRetailStoreIds)})`
            ])
            if (!_.isEmpty(storeProductData)) {
                const { GTINs, pkGTINs } = getProductGTINs(storeProductData)
                Instrumentation.startTimer('PSR Initial Sync - Barcode URL')
                const GTINsBarCodeMap = await getGTINsBarCodeMap(GTINs, pkGTINs)
                Instrumentation.stopTimer('PSR Initial Sync - Barcode URL')
                if (CommonParam.PERSONA__c === Persona.PSR) {
                    const inRouteStoreProducts = storeProductData.filter((v) =>
                        inRouteRetailStoreIds.includes(v.RetailStoreId)
                    )
                    if (!_.isEmpty(inRouteStoreProducts)) {
                        const orderItemData = await SoupService.retrieveDataFromSoup('OrderItem', {}, [], null)
                        const metricsData = await getMetricsStoreProductItem(
                            {
                                spLst: inRouteStoreProducts,
                                orderItemLst: orderItemData
                            },
                            getLastSunday(),
                            inRouteRetailStoreIds.length,
                            false
                        )
                        await Promise.all([SoupService.clearSoup('MetricsProduct')])
                        await SoupService.upsertDataIntoSoup('MetricsProduct', metricsData)
                    }
                }
                Instrumentation.startTimer('PSR Initial Sync - Product Image URL')
                const GTINsMap = await getGTINsMap(GTINs, pkGTINs)
                Instrumentation.stopTimer('PSR Initial Sync - Product Image URL')
                await AsyncStorage.setItem('GTIN_BARCODE_MAP', JSON.stringify(GTINsBarCodeMap))
                await AsyncStorage.setItem('GTIN_IMG_MAP', JSON.stringify(GTINsMap))
            }
        }
        if (CommonParam.PERSONA__c === Persona.PSR) {
            fixExistingPreset()
        }
    } catch (err) {
        await storeClassLog(Log.MOBILE_ERROR, 'initSyncInnovationProductData', err)
    }
}

const syncDownChunkIds = (soupName, retailStoreIds: any[], queryString: any, retrieveOnline = true) => {
    const sliceArray = _.chunk(retailStoreIds, 100)
    const promiseArr = []
    sliceArray.forEach((item) => {
        const query = formatString(queryString, [`(${item.join(',')})`])
        const promise = new Promise((resolve, reject) => {
            if (retrieveOnline) {
                retrieveDataOnline(soupName, query)
                    .then((res) => {
                        resolve(res.data)
                    })
                    .catch((err) => reject(err))
            } else {
                syncDownObj(soupName, query)
                    .then((res) => {
                        resolve(res.data)
                    })
                    .catch((err) => reject(err))
            }
        })
        promiseArr.push(promise)
    })

    return new Promise((resolve, reject) => {
        Promise.all(promiseArr)
            .then((res) => {
                const resArr = _.flatten(res)
                resolve(resArr)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const refreshMetricsInnovationProduct = async () => {
    try {
        const toDay = moment().add(numberOfDaysAhead, 'days').format(TIME_FORMAT.Y_MM_DD)
        await Promise.all([
            SoupService.clearSoup('Route_Sales_Geo__c'),
            SoupService.clearSoup('Account'),
            SoupService.clearSoup('RetailStore'),
            OrderService.deleteOrderItemKeepLocal(),
            SoupService.clearSoup('MetricsProduct'),
            SoupService.clearSoup('StoreProduct'),
            SoupService.clearSoup('Employee_To_Route__c')
        ])
        const routeData = await syncDownObj(
            'Route_Sales_Geo__c',
            formatString(getObjByName('Route_Sales_Geo__c').initQuery, [CommonParam.userId, CommonParam.userRouteId])
        )
        await syncDownObj(
            'Account',
            formatString(getObjByName('Account').initQuery, [CommonParam.userId, CommonParam.userRouteId])
        )
        await retrieveRetailStoresAndRelatedKeyAccounts()
        if (!_.isEmpty(routeData?.data)) {
            const weekOfday = moment().tz(CommonParam.userTimeZone).format('E')
            const lastSunday = moment().subtract(weekOfday, 'days').format('YYYY-MM-DD HH:mm:ss')
            const last2WksDate = moment(lastSunday).add(-7, 'days').format(TIME_FORMAT.Y_MM_DD)
            const retailStoreData = await SoupService.retrieveDataFromSoup('RetailStore', {}, ['Id'], null, [
                getRetailStoreQuery()
            ])
            if (!_.isEmpty(retailStoreData)) {
                const innovationRecordTypeId = await getRecordTypeId('Innovation Product', 'StoreProduct')
                const idArr = []
                retailStoreData.forEach((storeItem) => {
                    idArr.push(`'${storeItem.Id}'`)
                })
                const queryString =
                    `SELECT ${getAllFieldsByObjName('StoreProduct').join()} FROM StoreProduct` +
                    ' WHERE RetailStoreId IN %s' +
                    ' AND Delete_Flag__c = false' +
                    ` AND Product.National_Launch_Date__c <= ${toDay}` +
                    ` AND RecordTypeId='${innovationRecordTypeId}' AND Product.Innov_Flag__c = true` +
                    ' AND Product.IsActive = true' +
                    ' AND Product_Availability__c = true' +
                    ' AND Product.ProductCode != null' +
                    ' ORDER BY RetailStoreId, Product.ProductCode, Product.Material_Unique_ID__c'
                const spAll = await syncDownChunkIds('StoreProduct', idArr, queryString)
                await deliveredStatusUpdate(spAll)
                const spUPC = dealWithSpRsUPCData(spAll)
                await SoupService.upsertDataIntoSoupWithExternalId('StoreProduct', spUPC, false, true)
                const orderItemData = await syncDownChunkIds(
                    'OrderItem',
                    idArr,
                    `SELECT ${getAllFieldsByObjName('OrderItem').join()} ` +
                        `FROM OrderItem 
                 WHERE OrderId IN 
                 (SELECT Id FROM Order 
                 WHERE RetailStore__c IN %s 
                 AND EffectiveDate >= ${last2WksDate} AND Order_ATC_Type__c = 'Normal')
                 AND Product2.Innov_Flag__c = true`,
                    false
                )
                await delay
                const metricsData = await getMetricsStoreProductItem(
                    {
                        spLst: spUPC,
                        orderItemLst: orderItemData
                    },
                    getLastSunday(),
                    retailStoreData.length,
                    true
                )
                await SoupService.upsertDataIntoSoup('MetricsProduct', metricsData)
            }
        }
    } catch (err) {
        await storeClassLog(Log.MOBILE_ERROR, 'refreshMetricsInnovationProduct', ErrorUtils.error2String(err))
    }
}

export const checkPresetCustomerStatus = async (presetObj: any) => {
    const presetFilterObj = JSON.parse(presetObj.FilterJSON)
    const busnSegmentLvlMap = {
        0: 'Large Format',
        1: 'Small Format',
        2: 'FoodService'
    }
    const presetCustomerIds = presetFilterObj.selectedCustomersValue.map((v: { Id: any }) => `'${v.Id}'`)
    const presetKACustomerIds = presetFilterObj.selectedKAsValue.map((v: { Id: any }) => `'${v.Id}'`)
    const customerLst = await SoupService.retrieveDataFromSoup('Account', {}, [], null, [
        `WHERE {Account:Id} IN (${presetCustomerIds.join(',')})`
    ])
    const kaLst = await SoupService.retrieveDataFromSoup('Account', {}, [], null, [
        `WHERE {Account:Id} IN (${presetKACustomerIds})`
    ])
    const newPreset = _.cloneDeep(presetObj)
    presetFilterObj.selectedCustomersValue = customerLst
    const { filterQuery } = InnovaProdFilterQueries(presetFilterObj.filterSelected)
    let customerQuery = ''
    if (customerLst.length > 0) {
        customerQuery =
            '({StoreProduct:RetailStoreId} IN ' +
            '(SELECT {RetailStore:Id} FROM {RetailStore}' +
            ` WHERE {RetailStore:AccountId} IN (${customerLst.map((v) => "'" + v.Id + "'").join(',')})))`
    }
    const selectedBusnSegment = presetFilterObj.selectedBusnSegment
    if (selectedBusnSegment.length > 0) {
        customerQuery += customerQuery !== '' ? ' AND ' : ''
        customerQuery +=
            '({StoreProduct:RetailStoreId} IN ' +
            '(SELECT {RetailStore:Id} FROM {RetailStore} ' +
            `WHERE ${selectedBusnSegment
                .map((v) => `{RetailStore:Account.BUSN_SGMNTTN_LVL_3_NM__c}='${busnSegmentLvlMap[v]}'`)
                .join(' OR ')}))`
    }
    const query = [filterQuery, customerQuery ? `(${customerQuery})` : customerQuery]
        .filter((v) => v !== '')
        .join(' AND ')
    presetFilterObj.selectedKAsValue = kaLst
    presetFilterObj.filterQuery = query
    newPreset.FilterJSON = JSON.stringify(presetFilterObj)
    await SoupService.upsertDataIntoSoup('Preset', [newPreset])
    return newPreset
}

export const updateStoreProdToSF = async (status: string, fieldValue: string, item: any) => {
    global.$globalModal.openModal()
    const innovationRecordTypeId = await getRecordTypeId('Innovation Product', 'StoreProduct')
    const storeProductData = await retrieveDataOnline(
        'StoreProduct',
        formatString(
            'SELECT Id,Status__c,Date_Of_No_Sale__c,Date_Of_Wake__c FROM StoreProduct' +
                ` WHERE RetailStoreId IN ('${item.RetailStoreId}')` +
                ' AND Delete_Flag__c = false' +
                ` AND Product.National_Launch_Date__c <= ${moment()
                    .add(numberOfDaysAhead, 'days')
                    .format(TIME_FORMAT.Y_MM_DD)}` +
                " AND RecordTypeId='%s' AND Product.Innov_Flag__c = true" +
                ' AND Product.IsActive = true' +
                ' AND Product.ProductCode != null' +
                ` AND Product.ProductCode = '${item['Product.ProductCode']}'` +
                ' ORDER BY RetailStoreId, Product.ProductCode, Product.Material_Unique_ID__c',
            [innovationRecordTypeId]
        )
    )
    const updateLst = []
    storeProductData.data.forEach((v: any) => {
        const updateObj = {
            Id: v.Id,
            Status__c: status,
            Date_Of_No_Sale__c: null,
            Date_Of_Wake__c: null
        }
        if (status === 'No Sale') {
            updateObj.Date_Of_No_Sale__c = fieldValue
        } else if (status === 'Snoozed') {
            updateObj.Date_Of_Wake__c = fieldValue
        }
        updateLst.push(updateObj)
    })
    let localUpdateObj = _.cloneDeep(item)
    localUpdateObj.Status__c = status
    localUpdateObj.Date_Of_Wake__c = null
    localUpdateObj.Date_Of_No_Sale__c = null
    if (status === 'No Sale') {
        localUpdateObj.Date_Of_No_Sale__c = fieldValue
    } else if (status === 'Snoozed') {
        localUpdateObj.Date_Of_Wake__c = fieldValue
    }
    const storeProductSyncUpFields = ['Id', 'Status__c', 'Date_Of_No_Sale__c', 'Date_Of_Wake__c']
    try {
        localUpdateObj = rebuildObjectDepth(localUpdateObj)
        await SoupService.upsertDataIntoSoupWithExternalId('StoreProduct', [localUpdateObj])
        await syncUpObjUpdateFromMem(
            'StoreProduct',
            filterExistFields('StoreProduct', updateLst, storeProductSyncUpFields),
            false
        )
        global.$globalModal.closeModal()
    } catch (e) {
        await storeClassLog(Log.MOBILE_ERROR, 'updateStoreProdToSF', e)
        global.$globalModal.closeModal()
    }
}

const getTargetFilter = (chunkArr: any[], maxLength: number, index) => {
    try {
        if (index < maxLength && chunkArr[index]) {
            return chunkArr[index]
        }
        return []
    } catch (error) {
        return []
    }
}

// compute file obj, such as add prefix and suffix, add file type
const computeFileItem = async (url: string) => {
    const urlPrefix = `${CommonApi.PBNA_MOBILE_SHAREPOINT_DOCUMENT_API}${CommonApi.PBNA_MOBILE_SALES_DOCUMENTS_DIRECTORY}`
    const urlSuffix = ':/content'
    return {
        fullURL: `${urlPrefix}${url}${urlSuffix}`,
        fileType: url.split('.').pop(),
        url
    }
}

export const downloadSalesDocumentsFile = async (fileURL: string, token: string) => {
    const { fullURL, url } = await computeFileItem(fileURL)
    return new Promise<string | undefined>((resolve, reject) => {
        const UtilsManager = NativeModules.UtilsManager
        UtilsManager.getDocumentDirectory(async (_error: any, events: any) => {
            if (events) {
                const path = `${DocumentDirectoryPath}/${url}`
                const DownloadFileOptions = {
                    fromUrl: encodeURI(fullURL),
                    toFile: path,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
                const result = downloadFile(DownloadFileOptions)
                result.promise
                    .then((res) => {
                        if (res?.statusCode === 200 && res?.bytesWritten !== 0) {
                            resolve(url)
                        } else {
                            resolve(undefined)
                        }
                    })
                    .catch((error) => {
                        reject(error)
                    })
            } else {
                reject('Directory not exist')
            }
        })
    })
}

export const refreshSalesDocumentsDateFlag = async () => {
    await AsyncStorage.removeItem('salesDocumentsNeedClearCache')
    const lastDate = await AsyncStorage.getItem('salesDocumentsDateFlag')
    const newDate = moment().format(TIME_FORMAT.Y_MM_DD)

    if (!moment(newDate).isSame(lastDate)) {
        await AsyncStorage.setItem('salesDocumentsDateFlag', newDate)
        const NEED_CLEAR_CACHE_FLAG = '1'
        await AsyncStorage.setItem('salesDocumentsNeedClearCache', NEED_CLEAR_CACHE_FLAG)
    }
}

export const clearTotalSalesDocuments = async () => {
    try {
        const UtilsManager = NativeModules.UtilsManager
        UtilsManager.getDocumentDirectory(async (_error: any, events: any) => {
            if (events) {
                const diskUrls: any[] = JSON.parse(
                    ((await AsyncStorage.getItem('syncSalesDocumentsFileUrls')) as any) || JSON.stringify([])
                )
                for (const url of diskUrls) {
                    try {
                        const path = `${DocumentDirectoryPath}/${url}`
                        if (await exists(path)) {
                            await unlink(path)
                        }
                    } catch (error) {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'clearTotalSalesDocuments',
                            'Clear Total Sales Documents In Disk:' + getStringValue(error)
                        )
                    }
                }
                // Clear Local DataBase
                await AsyncStorage.multiRemove([
                    'syncSalesDocumentsFileUrls',
                    'fileUrlsFromExeFramework',
                    'fileURLWithId'
                ])
            }
        })
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'clearTotalSalesDocuments',
            'Clear Total Sales Documents In Disk:' + getStringValue(error)
        )
    }
}

const clearUnnecessarySalesDocuments = async (urls: string[], dispatch?: Dispatch<any>) => {
    const UtilsManager = NativeModules.UtilsManager
    UtilsManager.getDocumentDirectory(async (_error: any, events: any) => {
        if (events) {
            for (const url of urls) {
                try {
                    const path = `${DocumentDirectoryPath}/${url}`
                    if (await exists(path)) {
                        await unlink(path)
                    }
                    dispatch && dispatch(deleteExecutedFilesAction(url))
                } catch (error) {
                    storeClassLog(
                        Log.MOBILE_INFO,
                        'RepOrKam-ClearSalesDocuments',
                        'Clear Device Sales Documents:' + getStringValue(error)
                    )
                }
            }
            const existFileUrls: any[] = JSON.parse(
                ((await AsyncStorage.getItem('syncSalesDocumentsFileUrls')) as any) || JSON.stringify([])
            )

            const fileUrlsFromExeFramework: any[] = JSON.parse(
                ((await AsyncStorage.getItem('fileUrlsFromExeFramework')) as any) || JSON.stringify([])
            )

            const newExistFileUrlsAfterClear: string[] = existFileUrls.filter(
                (existUrl: string) => !urls.includes(existUrl)
            )
            const newFileUrlsFromExeFramework: string[] = fileUrlsFromExeFramework.filter(
                (url: string) => !urls.includes(url)
            )

            // refresh stored urls
            await AsyncStorage.setItem('syncSalesDocumentsFileUrls', JSON.stringify(newExistFileUrlsAfterClear))

            // refresh Exe Framework urls
            await AsyncStorage.setItem('fileUrlsFromExeFramework', JSON.stringify(newFileUrlsFromExeFramework))
        }
    })
}

export const clearFilesWhenPriorityExecuted = async (executedId: string, dispatch: Dispatch<any>) => {
    const fileUrlsWithId: any[] = JSON.parse(((await AsyncStorage.getItem('fileURLWithId')) as any) || '[]')
    const filterDataWithPriorityId = fileUrlsWithId.filter((obj: any) => obj.priorityId === executedId)
    if (Object.keys(_.countBy(filterDataWithPriorityId, 'storeId')).length <= 1) {
        const fileURLsNeedToClear = filterDataWithPriorityId.map((item) => item.fileURL)
        await clearUnnecessarySalesDocuments(fileURLsNeedToClear, dispatch)
    }
}

/**
 * Download files from SharePoint in background
 * 1. store url list in [Disk] for avoiding redownload files when kill app and reopen, using `AsyncStorage`
 *   1.1. will clear `AsyncStorage` item when user click `Sync` in Copilot page
 * 2. also store url list in [Memory] for using already downloaded files in priority detail page, using Redux
 */
export const syncDownSalesDocumentsBack = async (
    dispatch: Dispatch<any>,
    token: string,
    clearCacheInDetail?: boolean
) => {
    try {
        const needClearCache = clearCacheInDetail || (await AsyncStorage.getItem('salesDocumentsNeedClearCache'))

        // check last sync succeed file name, such as ['lf0y2fok70o1f.pdf', ...]
        const existFileUrls: any[] = JSON.parse(
            ((await AsyncStorage.getItem('syncSalesDocumentsFileUrls')) as any) || JSON.stringify([])
        )

        const fileUrlsFromExeFramework: any[] = JSON.parse(
            ((await AsyncStorage.getItem('fileUrlsFromExeFramework')) as any) || JSON.stringify([])
        )

        const fileUrlsToSync = _.differenceWith(fileUrlsFromExeFramework, existFileUrls, _.isEqual)
        const fileUrlsToClear = _.differenceWith(existFileUrls, fileUrlsFromExeFramework, _.isEqual)
        if (fileUrlsToClear.length && needClearCache) {
            // do clear operation
            await clearUnnecessarySalesDocuments(fileUrlsToClear)
        }
        const syncFilePromises: any[] = []
        const imagesToPreload: any[] = []
        fileUrlsToSync.forEach((url: string) => {
            syncFilePromises.push(downloadSalesDocumentsFile(url, token))
            const fileType = url.split('.').pop()
            if (fileType?.toLowerCase() !== 'pdf') {
                imagesToPreload.push({
                    uri: url,
                    headers: { Authorization: `Bearer ${token}` }
                })
            }
        })
        FastImage.preload(imagesToPreload)
        const syncResults = []
        for (const promise of syncFilePromises) {
            try {
                const result = await promise
                // storage success download files url to redux
                if (result) {
                    syncResults.push(result)
                    dispatch && dispatch(addSuccessDownloadFilesAction(result))
                }
            } catch (err) {
                storeClassLog(Log.MOBILE_INFO, 'syncDownSalesDocumentsBack', err)
            }
        }
        // update store synced file url
        existFileUrls.push(...syncResults)
        await AsyncStorage.setItem('syncSalesDocumentsFileUrls', JSON.stringify(_.uniq(existFileUrls)))
    } catch (err) {
        storeClassLog(Log.MOBILE_ERROR, 'syncDownSalesDocumentsBack', err)
    }
}

const syncDownPriorityWithChunkIds = (baseQuery: string, ids: string[]) => {
    if (ids.length > 0) {
        const fullQuery = encodeURIComponent(baseQuery + `Id IN (${getIdClause(ids)})`)
        return syncDownObj('Executional_Framework__c', fullQuery)
    }
}

type PriorityData = {
    storeId: string
    priorityId: string
}

type FileURLWithId = PriorityData & {
    fileURL: string
}

const handlePriorityDocuments = async (exeIds: any[], priorityData: PriorityData[], currentStoreId?: string) => {
    try {
        const fileURLWithIdInDisk: any[] = JSON.parse(
            ((await AsyncStorage.getItem('fileURLWithId')) as any) || JSON.stringify([])
        )

        if (!exeIds.length) {
            const needToDeleteStoreIds = priorityData.map((data) => data.storeId)
            const newFileURLWithId = fileURLWithIdInDisk.filter((item: FileURLWithId) => {
                return !needToDeleteStoreIds.includes(item.storeId)
            })

            await AsyncStorage.setItem('fileURLWithId', JSON.stringify(newFileURLWithId))
        } else {
            let documentsList: string[] = []
            documentsList = await getPriorityDocuments(exeIds)
            if (documentsList.length) {
                // build data for execute
                const computedLatestData: FileURLWithId[] = documentsList
                    .map((docItem: any) => {
                        if (docItem.ExternalDocumentInfo1) {
                            const dataItem = priorityData.find((data) => data.priorityId === docItem.Priority__c)
                            if (dataItem) {
                                return {
                                    fileURL: docItem.ExternalDocumentInfo1,
                                    priorityId: docItem.Priority__c,
                                    storeId: `${currentStoreId || dataItem.storeId}`
                                }
                            }
                        }
                        return ''
                    })
                    .filter(Boolean) as FileURLWithId[]

                const mergeData = _.uniqWith(fileURLWithIdInDisk.concat(...computedLatestData), _.isEqual)

                const priorityIds = _.uniq(computedLatestData.map((cItem) => cItem.priorityId))
                const storeIds = _.uniq(computedLatestData.map((cItem) => cItem.storeId))

                const newFileURLWithId = mergeData.filter((item: any) => {
                    return !storeIds.includes(item.storeId) || priorityIds.includes(item.priorityId)
                })

                await AsyncStorage.setItem('fileURLWithId', JSON.stringify(newFileURLWithId))

                const fileURLs = _.uniq(newFileURLWithId.map((item: any) => item.fileURL))
                // storage file urls for sync file to local
                await AsyncStorage.setItem('fileUrlsFromExeFramework', JSON.stringify(fileURLs))
            }
        }
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'RepOrKam-handlePriorityDocuments',
            'Handle Priority Documents:' + getStringValue(error)
        )
    }
}

export const syncDownPriorityWithIds = async (priorityData: PriorityData[], currentStoreId?: string) => {
    const ids = priorityData.map((pItem) => pItem.priorityId)
    const chunkSize = 50
    const requestArr = []
    const syncPriorityQuery =
        'SELECT Id, Business_Segment_1__c, Business_Segment_2__c, Business_Segment_3__c, Business_Segment_4__c, ' +
        'Card_LineThreeTitle__c, Card_Subtitle__c, Card_Title__c, End_Date__c, Start_Date__c, Year__c, OwnerId, Perfect_Store_Tag__c, Priority_Number__c, ' +
        'Priority_Type_Other__c, Third_Party_Created__c, ' +
        'Parent__c, Custom_Unique_ID__c, KA__c, Name, ' +
        'Parent__r.KA__c, Parent__r.Business_Segment_1__c, Parent__r.Business_Segment_2__c, Parent__r.Business_Segment_3__c, Parent__r.Business_Segment_4__c, ' +
        'Priority_Type_Formula__c, Priority_Status__c, ' +
        'LastModifiedBy.Name, ModifiedBy__c, LastModifiedDate, ProductAttribute__c ' +
        'FROM Executional_Framework__c ' +
        `WHERE RecordType.Name = 'KAM Priority' AND Priority_Status__c = 'Publish' AND End_Date__c >= LAST_N_DAYS:0:DATE AND Start_Date__c <= NEXT_N_DAYS:14:DATE AND `

    const transferredQuery = transferDateTimeInQuery(syncPriorityQuery)
    const maxLength = Math.ceil(ids.length / chunkSize)
    for (let i = 0; i < maxLength; i++) {
        const chunkIds = getTargetFilter(_.chunk(ids, chunkSize), maxLength, i)
        requestArr.push(syncDownPriorityWithChunkIds(transferredQuery, chunkIds))
    }
    const syncedExeFrameworkData = await Promise.all(requestArr)
    const exeFrameworkIds: string[] = syncedExeFrameworkData
        .map((item) => {
            return item?.data.map((dataItem: any) => dataItem.Id)
        })
        .flat()
        .filter(Boolean)

    const newPriorityData = priorityData.filter((data) => exeFrameworkIds.includes(data.priorityId))
    await handlePriorityDocuments(exeFrameworkIds, newPriorityData, currentStoreId)
}

// Sync Executional_Framework__c data from new object StorePriority__c
export const getPriorityIdsFromStorePriority = async (retailStoreId?: string) => {
    try {
        !retailStoreId && (await SoupService.clearSoup('Executional_Framework__c'))
        let retailStoreIds: string[] = []
        if (retailStoreId) {
            retailStoreIds = [retailStoreId]
        } else {
            const { inRouteRetailStoreIds } = await getRetailStoreData()
            retailStoreIds = inRouteRetailStoreIds
        }
        if (retailStoreIds.length) {
            const getPriorityIdsQuery = `SELECT ${getAllFieldsByObjName(
                'StorePriority__c'
            ).join()} FROM StorePriority__c WHERE RetailStoreId__c IN (${getIdClause(retailStoreIds)})`
            const priorityIdRes = await syncDownObj('StorePriority__c', getPriorityIdsQuery)
            const priorityData: any = priorityIdRes?.data
                .map((records: any) => {
                    if (records?.PriorityId__c) {
                        return {
                            storeId: records.RetailStoreId__c,
                            priorityId: records.PriorityId__c
                        }
                    }
                    return ''
                })
                .filter(Boolean)

            priorityData.length && (await syncDownPriorityWithIds(priorityData, retailStoreId))
        }
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'RepOrKam-getPriorityIdsFromStorePriority',
            'Get Priority Ids From Store Priority:' + getStringValue(error)
        )
    }
}

export const getStorePriorityById = async (id: string) => {
    const [record] = await SoupService.retrieveDataFromSoup('StorePriority__c', {}, [], null, [
        `WHERE {StorePriority__c:Id} = '${id}'`
    ])
    return record
}

export const getStorePriorityFromExeId = async (id: string, storeId: string) => {
    const [record] = await SoupService.retrieveDataFromSoup('StorePriority__c', {}, [], null, [
        `WHERE {StorePriority__c:PriorityId__c} = '${id}' AND {StorePriority__c:RetailStoreId__c} = '${storeId}'`
    ])
    return record
}

export const getStorePriorityIdFromExeId = async (id: string, storeId: string) => {
    const storePriorityData = await SoupService.retrieveDataFromSoup('StorePriority__c', {}, ['Id'], null, [
        `WHERE {StorePriority__c:PriorityId__c} = '${id}' AND {StorePriority__c:RetailStoreId__c} = '${storeId}'`
    ])
    return storePriorityData[0]?.Id
}

// Execute Executional_Framework__c, need update StorePriority__c object
export const handleExecutePriority = async (
    exeItemId: string,
    storeId: string,
    setRefreshFlag?: React.Dispatch<SetStateAction<number>>
) => {
    try {
        const storePriority = await getStorePriorityFromExeId(exeItemId, storeId)
        if (storePriority?.Id) {
            const tempPriorityObj: any = {
                Id: storePriority.Id,
                is_executed__c: true,
                executed_by__c: CommonParam.userId,
                ExecuteTime__c: new Date().toISOString()
            }
            const syncUpUpdateFields = ['Id', 'is_executed__c', 'executed_by__c', 'ExecuteTime__c']
            // --BEGIN-- Story 11470318: IF user executes AFTER no sale THEN Remove Date_NoSale__c AND Change Status__c = 'Action'
            if (storePriority.Status__c === 'No Sale') {
                tempPriorityObj.Status__c = 'Action'
                tempPriorityObj.Date_NoSale__c = null
                syncUpUpdateFields.push('Status__c')
                syncUpUpdateFields.push('Date_NoSale__c')
            }
            // ---END--- Story 11470318: IF user executes AFTER no sale THEN Remove Date_NoSale__c AND Change Status__c = 'Action'
            await syncUpObjUpdateFromMem(
                'StorePriority__c',
                filterExistFields('StorePriority__c', [tempPriorityObj], syncUpUpdateFields)
            )
            // refresh flag to refresh data
            setRefreshFlag && setRefreshFlag((prevFlag: number) => prevFlag + 1)
        }
    } catch (err) {
        storeClassLog(Log.MOBILE_ERROR, 'handleExecutePriority', `Execute Priority Failed: ${getStringValue(err)}`)
    }
}

export async function loadRoutesForSwitch(extra: string) {
    let etrs = []
    const today = moment().format(TIME_FORMAT.Y_MM_DD)
    const res = await syncDownObj(
        'Route_Sales_Geo__c',
        `SELECT
        Id, 
        GTMU_RTE_ID__c,
        LOCL_RTE_ID__c,
        LOC_ID__c
    FROM 
        Route_Sales_Geo__c
    WHERE 
        HRCHY_LVL__c = 'Route'
        AND (RTE_END_DT__c = null OR RTE_END_DT__c >= ${today})
        AND RTE_STRT_DT__c <= ${today}
        AND RTE_TYP_GRP_CDV__c in ('001', '002', '003', '004') ${extra} `,
        false
    )
    const routes = res?.data || []
    if (routes.length) {
        const etrRes = await syncDownObj(
            'Employee_To_Route__c',
            `Select
            User__r.Name,
            User__r.GPID__c,
            Route__r.Id
        FROM 
            Employee_To_Route__c
        WHERE 
            Active_Flag__c = true
            AND User__r.IsActive = true
            AND Route__r.Id IN (${getIdClause(routes.map((el) => el.Id))})`,
            false
        )
        etrs = etrRes?.data || []
    }

    return routes.map((el) => {
        const match = etrs.find((one) => one.Route__r.Id === el.Id)
        if (match) {
            return {
                ...el,
                ...match
            }
        }
        return el
    })
}

export async function setDefaultRouteStorage(gtmuId) {
    let route
    await AsyncStorage.removeItem('psrUserRoute')
    if (gtmuId) {
        const routes = await loadRoutesForSwitch(`AND GTMU_RTE_ID__c = '${gtmuId}' `)
        routes[0] && (route = routes[0])
    }
    route &&
        AsyncStorage.setItem(
            'psrUserRoute',
            JSON.stringify({
                ...route,
                displayName: `${route.GTMU_RTE_ID__c || ''} - ${route?.User__r?.Name || ''}`
            })
        )
    return {
        userRouteId: route?.Id || ''
    }
}

const getTranslatedTypeName = (typeName: string) => {
    const translatedTypeMap: Record<string, string> = {
        'Authorization Letter': `Lettre d'Autorisation`,
        'Look of Success': `Exécution Réussie`,
        'Sell Sheet': `Feuille de Vente`
    }
    return CommonParam.locale === Locale.fr ? translatedTypeMap[typeName] : typeName
}

export const translateSalesDocTypeName = (docItem: any) => {
    const numRegex = /\d+$/
    const match = docItem.salesDocType.match(numRegex)

    const numSuffix = match ? ` ${match[0]}` : ''
    const translatedSalesDocType =
        docItem.salesDocType === 'Other'
            ? docItem.salesDocTypeOther
            : `${getTranslatedTypeName(docItem.salesDocType.replace(numRegex, '').trim())}${numSuffix}`

    return translatedSalesDocType
}

export const isCelsiusPriority = (item: any) => {
    return item && item.Third_Party_Created__c === '1' && item.Priority_Type_Other__c === 'Celsius Sold'
}

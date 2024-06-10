/**
 * @description Innovation Metrics hooks.
 * @author Qiulin Deng
 * @email qiulin.deng@pwc.com
 * @date 2022-05-03
 */
import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonParam } from '../../common/CommonParam'
import { SoupService } from '../service/SoupService'
import { Log } from '../../common/enums/Log'
import moment from 'moment'
import * as RNLocalize from 'react-native-localize'
import _ from 'lodash'
import { Instrumentation } from '@appdynamics/react-native-agent'
import {
    checkStoreProductIsOrderToday,
    getCTRBaseQuery,
    getRetailStoreQuery
} from '../helper/rep/InnovationProductHelper'
import { isPersonaUGMOrSDL } from '../../common/enums/Persona'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

export const getLastTwoWksDate = () => {
    const weekOfDay = moment()
        .tz(CommonParam.userTimeZone || RNLocalize.getTimeZone())
        .format('E')
    const lastSunday = moment().subtract(weekOfDay, 'days').format('YYYY-MM-DD HH:mm:ss')
    return moment(lastSunday).add(-7, 'days').format(TIME_FORMAT.Y_MM_DD)
}
export const useGetMetricsData = (
    filterQuery: string,
    searchText: any,
    sort: any,
    isLoading: any,
    isShowDetail?: any
) => {
    const [storeProducts, setStoreProducts] = useState([])
    const [orderItems, setOrderItems] = useState([])
    const [rsOrderDays, setRsOrderDay] = useState({})

    useEffect(() => {
        if ((filterQuery !== '' || searchText !== '' || sort !== '') && !isPersonaUGMOrSDL()) {
            let searchQuery = ''
            const searchValue = searchText
                .replaceAll("'", '%')
                .replaceAll('`', '%')
                .replaceAll('‘', '%')
                .replaceAll('’', '%')
            searchQuery =
                `AND (COALESCE({StoreProduct:Product.Formatted_Sub_Brand_Name__c}, {StoreProduct:Product.Sub_Brand__c}) LIKE '%${searchValue}%' ` +
                `OR COALESCE({StoreProduct:Product.Formatted_Flavor__c}, {StoreProduct:Product.Flavor_Name__c}) LIKE '%${searchValue}%' ` +
                `OR COALESCE({StoreProduct:Product.Formatted_Package__c}, {StoreProduct:Product.Package_Type_Name__c}) LIKE '%${searchValue}%') `
            const toDayWeek =
                Number(
                    moment()
                        .tz(CommonParam.userTimeZone || RNLocalize.getTimeZone())
                        .format('E')
                ) - 1
            const week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            SoupService.retrieveDataFromSoup('StoreProduct', {}, [], null, [
                'WHERE {StoreProduct:Product.ProductCode} IS NOT NULL ' +
                    `AND {StoreProduct:RetailStoreId} IN (SELECT {RetailStore:Id} FROM {RetailStore} WHERE {RetailStore:AccountId} IN ${getCTRBaseQuery()})` +
                    searchQuery +
                    (filterQuery ? 'AND ' + filterQuery : '') +
                    'ORDER BY {StoreProduct:RetailStoreId},{StoreProduct:Product.ProductCode},{StoreProduct:Product.Material_Unique_ID__c}'
            ])
                .then(async (storeProduct) => {
                    setStoreProducts(storeProduct)
                    const productCodes = storeProduct.map((v) => `'${v['Product.ProductCode']}'`).join(',')
                    SoupService.retrieveDataFromSoup('OrderItem', {}, [], null, [
                        `WHERE {OrderItem:Product2.ProductCode} IN (${productCodes})
                       AND {OrderItem:Order.RetailStore__c} IN 
                        (SELECT {RetailStore:Id} FROM {RetailStore} WHERE {RetailStore:AccountId} IN ${getCTRBaseQuery()})
                        AND {OrderItem:Order.EffectiveDate} >= ${getLastTwoWksDate()}
                        AND {OrderItem:Product2.Innov_Flag__c} = true
                        `
                    ])
                        .then((orderItem) => {
                            setOrderItems(orderItem)
                        })
                        .catch((err) => {
                            setOrderItems([])
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'useGetMetricsData',
                                'Get orderItem list in metrics screen: ' + ErrorUtils.error2String(err)
                            )
                        })
                    SoupService.retrieveDataFromSoup(
                        'RetailStore',
                        {},
                        ['Id', 'Account.Merchandising_Order_Days__c'],
                        null,
                        [getRetailStoreQuery()]
                    )
                        .then((retailStores) => {
                            const rsOrderDay = {}
                            retailStores.forEach((rs) => {
                                if (rs['Account.Merchandising_Order_Days__c']) {
                                    rsOrderDay[rs.Id] =
                                        rs['Account.Merchandising_Order_Days__c']
                                            .split(';')
                                            .indexOf(week[toDayWeek]) !== -1
                                }
                            })
                            setRsOrderDay(rsOrderDay)
                        })
                        .catch((err) => {
                            setOrderItems([])
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'useGetMetricsData',
                                'Get rsOrderDay map in metrics screen: ' + ErrorUtils.error2String(err)
                            )
                        })
                })
                .catch((err) => {
                    setStoreProducts([])
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'useGetMetricsData',
                        'Get innovation storeProduct list in metrics screen: ' + ErrorUtils.error2String(err)
                    )
                })
        }
    }, [filterQuery, searchText, sort, isLoading, isShowDetail])

    return { storeProducts, orderItems, rsOrderDays }
}

const checkStoreProductIsOrdered = (orderItems: any, last2WksDate: any, spItem: any) => {
    let isOrdered = false
    orderItems.forEach((item) => {
        if (
            item['Product2.ProductCode'] === spItem['Product.ProductCode'] &&
            item['Order.RetailStore__c'] === spItem.RetailStoreId
        ) {
            if (
                moment(item['Order.EffectiveDate']).isSameOrAfter(last2WksDate, 'days') &&
                moment(item['Order.EffectiveDate']).isSameOrBefore(moment(), 'days')
            ) {
                isOrdered = true
            }
        }
    })
    return isOrdered
}

const setMetricsSKUItem = (sku: any, spItem: any, rsOrderDays: any, last2WksDate: any, orderItems: any) => {
    sku[spItem['Product.ProductCode']].volSum += spItem.YTD_LCD_Vol__c ? parseInt(spItem.YTD_LCD_Vol__c) : 0
    sku[spItem['Product.ProductCode']].revSum += spItem.YTD_Net_Revenue__c ? parseFloat(spItem.YTD_Net_Revenue__c) : 0
    sku[spItem['Product.ProductCode']].total += 1
    if (spItem.Combined_Auth_Flag__c === '1') {
        sku[spItem['Product.ProductCode']].authCount += 1
        sku[spItem['Product.ProductCode']].volIds += spItem.RetailStoreId + ';'
    }
    if (spItem.No_12_LCW_Void__c === '1') {
        sku[spItem['Product.ProductCode']].LCWCount += 1
        sku[spItem['Product.ProductCode']].lcdIds += spItem.RetailStoreId + ';'
    }
    sku[spItem['Product.ProductCode']].WTDCount += Number(spItem.No_11_WTD_Void__c)
    if (spItem.No_12_LCW_Void__c === '0') {
        if (!_.isEmpty(rsOrderDays)) {
            if (rsOrderDays[spItem.RetailStoreId] && spItem.No_11_WTD_Void__c === '0') {
                sku[spItem['Product.ProductCode']].orderDayCount += 1
                sku[spItem['Product.ProductCode']].orderDayIds += spItem.RetailStoreId + ';'
            }
        }
        sku[spItem['Product.ProductCode']].voidGapCount += 1
        sku[spItem['Product.ProductCode']].voidIds += spItem.RetailStoreId + ';'
    }
    if (spItem.No_12_LCW_Void__c === '1' && spItem.No_11_WTD_Void__c === '0') {
        sku[spItem['Product.ProductCode']].wkcCsCount += 1
        sku[spItem['Product.ProductCode']].wksIds += spItem.RetailStoreId + ';'
    }
    if (spItem.No_12_LCW_Void__c === '0' && spItem.No_11_WTD_Void__c === '1') {
        sku[spItem['Product.ProductCode']].cWTDCount += 1
        sku[spItem['Product.ProductCode']].cWtdIds += spItem.RetailStoreId + ';'
    }
    if (spItem.No_12_LCW_Void__c === '0' && spItem.No_11_WTD_Void__c === '0') {
        sku[spItem['Product.ProductCode']].voidWTDIds += spItem.RetailStoreId + ';'
        if (checkStoreProductIsOrderToday(orderItems, last2WksDate, spItem)) {
            sku[spItem['Product.ProductCode']].orderTodayCount += 1
            sku[spItem['Product.ProductCode']].orderTodayIds += spItem.RetailStoreId + ';'
        }
        if (checkStoreProductIsOrdered(orderItems, last2WksDate, spItem)) {
            sku[spItem['Product.ProductCode']].orderOpenCount += 1
            sku[spItem['Product.ProductCode']].openOrderIds += spItem.RetailStoreId + ';'
        }
    }
}

const skuItemsSortRules = (previousItem: any, nextItem: any) => {
    if (
        (previousItem.Formatted_Sub_Brand_Name__c || previousItem.Sub_Brand__c) ===
        (nextItem.Formatted_Sub_Brand_Name__c || nextItem.Sub_Brand__c)
    ) {
        if (
            (previousItem.Formatted_Flavor__c || previousItem.Flavor_Name__c) ===
            (nextItem.Formatted_Flavor__c || nextItem.Flavor_Name__c)
        ) {
            return (previousItem.Formatted_Package__c || previousItem.Package_Type_Name__c).localeCompare(
                nextItem.Formatted_Package__c || nextItem.Package_Type_Name__c
            )
        }
        return (previousItem.Formatted_Flavor__c || previousItem.Flavor_Name__c).localeCompare(
            nextItem.Formatted_Flavor__c || nextItem.Flavor_Name__c
        )
    }
    return (previousItem.Formatted_Sub_Brand_Name__c || previousItem.Sub_Brand__c).localeCompare(
        nextItem.Formatted_Sub_Brand_Name__c || nextItem.Sub_Brand__c
    )
}

const sortSKU = (sort: any, skuItems: any, wiredCount: any, isAuthEnabled: boolean) => {
    if (sort === 'Name ASC') {
        skuItems.sort((a, b) => {
            return skuItemsSortRules(a, b)
        })
    } else if (sort === 'Name DESC') {
        skuItems.sort((a, b) => {
            if (
                (a.Formatted_Sub_Brand_Name__c || a.Sub_Brand__c) === (b.Formatted_Sub_Brand_Name__c || b.Sub_Brand__c)
            ) {
                if ((a.Formatted_Flavor__c || a.Flavor_Name__c) === (b.Formatted_Flavor__c || b.Flavor_Name__c)) {
                    return (b.Formatted_Package__c || b.Package_Type_Name__c).localeCompare(
                        a.Formatted_Package__c || a.Package_Type_Name__c
                    )
                }
                return (b.Formatted_Flavor__c || b.Flavor_Name__c).localeCompare(
                    a.Formatted_Flavor__c || a.Flavor_Name__c
                )
            }
            return (b.Formatted_Sub_Brand_Name__c || b.Sub_Brand__c).localeCompare(
                a.Formatted_Sub_Brand_Name__c || a.Sub_Brand__c
            )
        })
    } else if (sort === 'National Launch Date DESC') {
        skuItems.sort((a, b) => {
            if (moment(a.National_Launch_Date).isSame(b.National_Launch_Date)) {
                return skuItemsSortRules(a, b)
            }
            return moment(a.National_Launch_Date).isBefore(b.National_Launch_Date) ? 1 : -1
        })
    } else if (sort === '' || sort === 'National Launch Date ASC') {
        skuItems.sort((a, b) => {
            if (moment(a.National_Launch_Date).isSame(b.National_Launch_Date)) {
                return skuItemsSortRules(a, b)
            }
            return moment(b.National_Launch_Date).isBefore(a.National_Launch_Date) ? 1 : -1
        })
    } else if (sort === 'Distribution ASC') {
        skuItems.sort((a, b) => {
            if (
                Math.ceil((Number(a.WTDCount) / Number(isAuthEnabled ? a.authCount : wiredCount)) * 100) ===
                Math.ceil((Number(b.WTDCount) / Number(isAuthEnabled ? b.authCount : wiredCount)) * 100)
            ) {
                return skuItemsSortRules(a, b)
            }
            return (
                Math.ceil((Number(a.WTDCount) / Number(isAuthEnabled ? a.authCount : wiredCount)) * 100) -
                Math.ceil((Number(b.WTDCount) / Number(isAuthEnabled ? b.authCount : wiredCount)) * 100)
            )
        })
    } else if (sort === 'Distribution DESC') {
        skuItems.sort((a, b) => {
            if (
                Math.ceil((Number(b.WTDCount) / Number(isAuthEnabled ? b.authCount : wiredCount)) * 100) ===
                Math.ceil((Number(a.WTDCount) / Number(isAuthEnabled ? a.authCount : wiredCount)) * 100)
            ) {
                return skuItemsSortRules(a, b)
            }
            return (
                Math.ceil((Number(b.WTDCount) / Number(isAuthEnabled ? b.authCount : wiredCount)) * 100) -
                Math.ceil((Number(a.WTDCount) / Number(isAuthEnabled ? a.authCount : wiredCount)) * 100)
            )
        })
    }
}

export const useGetMetricsSKUItem = (
    storeProducts: any[],
    orderItems: any[],
    rsOrderDays: any,
    sort: string,
    wiredCount: any,
    quickFilter: any,
    routeColorType: any,
    innovDisItem: any,
    filterQuery: string,
    isAuthEnabled: boolean
) => {
    const weekOfDay = moment()
        .tz(CommonParam.userTimeZone || RNLocalize.getTimeZone())
        .format('E')
    const lastSunday = moment().subtract(weekOfDay, 'days').format('YYYY-MM-DD HH:mm:ss')
    const last2WksDate = moment(lastSunday).add(-7, 'days')
    const sku = {}
    const [quickFilterLst, setQuickFilterLst] = useState([])
    const productCodeLst = []
    const skuItems = []
    storeProducts.forEach((spItem: any) => {
        if (sku[spItem['Product.ProductCode']]) {
            setMetricsSKUItem(sku, spItem, rsOrderDays, last2WksDate, orderItems)
        } else {
            productCodeLst.push(spItem['Product.ProductCode'])
            sku[spItem['Product.ProductCode']] = {
                Id: spItem['Product.ProductCode'],
                GTIN: spItem['Product.GTIN__c'],
                Product_Availability__c: spItem.Product_Availability__c,
                Formatted_Sub_Brand_Name__c: spItem['Product.Formatted_Sub_Brand_Name__c'],
                Formatted_Flavor__c: spItem['Product.Formatted_Flavor__c'],
                Formatted_Package__c: spItem['Product.Formatted_Package__c'],
                Package_Type_Name__c: spItem['Product.Package_Type_Name__c'],
                Sub_Brand__c: spItem['Product.Sub_Brand__c'],
                Brand_Code__c: spItem['Product.Brand_Code__c'],
                Sub_Brand_Code__c: spItem['Product.Sub_Brand_Code__c'],
                National_Launch_Date: spItem['Product.National_Launch_Date__c'],
                National_Launch_Date__c: moment(spItem['Product.National_Launch_Date__c']).format('MMM DD, YYYY'),
                Flavor_Name__c: spItem['Product.Flavor_Name__c'],
                volSum: 0,
                revSum: 0,
                total: 0,
                authCount: 0,
                LCWCount: 0,
                WTDCount: 0,
                voidGapCount: 0,
                cWTDCount: 0,
                wkcCsCount: 0,
                orderDayCount: 0,
                orderOpenCount: 0,
                orderTodayCount: 0,
                lcdIds: '',
                volIds: '',
                voidIds: '',
                voidWTDIds: '',
                lcwIds: '',
                wksIds: '',
                orderDayIds: '',
                openOrderIds: '',
                orderTodayIds: '',
                cWtdIds: ''
            }
            setMetricsSKUItem(sku, spItem, rsOrderDays, last2WksDate, orderItems)
        }
    })
    productCodeLst.forEach((item) => {
        skuItems.push(sku[item])
    })
    sortSKU(sort, skuItems, wiredCount, isAuthEnabled)

    useEffect(() => {
        const skuSource = _.cloneDeep(filterQuery === '' && sort === '' ? innovDisItem : skuItems)
        let quickFilterValueLst = []
        if (isPersonaUGMOrSDL()) {
            return
        }
        if (quickFilter.check1 || quickFilter.check2 || quickFilter.check3 || quickFilter.check4) {
            if (quickFilter.check1) {
                quickFilterValueLst = quickFilterValueLst.concat(
                    skuSource.filter(
                        (v) =>
                            Math.ceil((Number(v.WTDCount) / (isAuthEnabled ? Number(v.authCount) : wiredCount)) * 100) >
                            routeColorType[1]
                    )
                )
            }
            if (quickFilter.check2) {
                quickFilterValueLst = quickFilterValueLst.concat(
                    skuSource.filter(
                        (v) =>
                            Math.ceil(
                                (Number(v.WTDCount) / (isAuthEnabled ? Number(v.authCount) : wiredCount)) * 100
                            ) <= routeColorType[1] &&
                            Math.ceil(
                                (Number(v.WTDCount) / (isAuthEnabled ? Number(v.authCount) : wiredCount)) * 100
                            ) >= routeColorType[0]
                    )
                )
            }
            if (quickFilter.check3) {
                quickFilterValueLst = quickFilterValueLst.concat(
                    skuSource.filter(
                        (v) =>
                            Math.ceil((Number(v.WTDCount) / (isAuthEnabled ? Number(v.authCount) : wiredCount)) * 100) <
                            routeColorType[0]
                    )
                )
            }
            if (quickFilter.check4 && (quickFilter.check1 || quickFilter.check2 || quickFilter.check3)) {
                quickFilterValueLst = quickFilterValueLst.filter((v) => Number(v.wkcCsCount) > 0)
            } else if (quickFilter.check4) {
                quickFilterValueLst = skuSource.filter((v) => Number(v.wkcCsCount) > 0)
            }
            setQuickFilterLst(quickFilterValueLst)
            Instrumentation.stopTimer('PSR Rerender My Metrics After Filter Changes')
        }
    }, [quickFilter, isAuthEnabled, storeProducts, innovDisItem])
    return { skuItems, quickFilterLst }
}

export const useSuccessModalText = (props: any, isFocused: boolean, setSuccessModalText: any) => {
    useEffect(() => {
        if (isFocused) {
            AsyncStorage.getItem('isFromATCView').then((res) => {
                if (!_.isEmpty(res)) {
                    setSuccessModalText(res)
                    setTimeout(() => {
                        setSuccessModalText('')
                        AsyncStorage.removeItem('isFromATCView')
                    }, 2000)
                }
            })
        }
    }, [props, isFocused])
}

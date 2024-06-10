import moment from 'moment'
import InnovationProductQueries, { InnovProdSearchQueries } from '../../queries/InnovationProductQueries'
import { getMetricsInnovationProductData } from '../../utils/InnovationProductUtils'
import { SoupService } from '../../service/SoupService'
import _ from 'lodash'
import { CommonParam } from '../../../common/CommonParam'
import * as RNLocalize from 'react-native-localize'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { isPersonaPSR } from '../../../common/enums/Persona'
import { handleDayStatus } from '../../utils/MerchManagerUtils'
import { ATCStatus, OrderATCType, OrderStatus, PushType } from '../../enums/ATCRecordTypes'
import { compositeCommonCall, syncDownObj } from '../../api/SyncUtils'
import { CommonSyncRes } from '../../../common/interface/SyncInterface'
import { diffDaysFromToday } from '../../utils/TimeZoneUtils'

const defaultScore = -10000
const getOrdersIn2Wks = (item: any, last2WksDate: any) => {
    return !(
        moment(item['Order.EffectiveDate']).isSameOrAfter(last2WksDate, 'days') &&
        moment(item['Order.EffectiveDate']).isBefore(moment(), 'days')
    )
}
const getHasOrderToday = (item: any) => {
    return moment(item['Order.EffectiveDate']).isSame(moment(), 'days')
}
export const checkStoreProductIsOrderToday = (orderItemLst: any, last2WksDate: any, spItem?: any) => {
    let noOrdersIn2Wks = true
    let hasOrderToday = false
    orderItemLst.forEach((item) => {
        if (spItem) {
            if (
                item['Product2.ProductCode'] === spItem['Product.ProductCode'] &&
                item['Order.RetailStore__c'] === spItem.RetailStoreId
            ) {
                noOrdersIn2Wks = getOrdersIn2Wks(item, last2WksDate)
                hasOrderToday = getHasOrderToday(item)
            }
        } else {
            noOrdersIn2Wks = getOrdersIn2Wks(item, last2WksDate)
            hasOrderToday = getHasOrderToday(item)
        }
    })
    return noOrdersIn2Wks && hasOrderToday
}

export const getRouteFromEtrForPSR = () => {
    return new Promise((resolve) => {
        AsyncStorage.getItem('etrForPSR', (err, data) => {
            if (!err && data) {
                const etrForPSR = JSON.parse(data)
                if (isPersonaPSR()) {
                    resolve(CommonParam.userRouteId)
                }
                resolve(etrForPSR.Route__c)
            } else {
                resolve('')
            }
        })
    })
}

export const checkStoreProductIsOrdered = (checkOrderItemLst: any, last2WksDate: any) => {
    let isOrdered = false
    checkOrderItemLst.forEach((item) => {
        if (
            moment(item['Order.EffectiveDate']).isSameOrAfter(last2WksDate, 'days') &&
            moment(item['Order.EffectiveDate']).isSameOrBefore(moment(), 'days')
        ) {
            isOrdered = true
        }
    })
    return isOrdered
}

export const checkStoreProductOrder = async (retailStoreId: any) => {
    const weekOfDay = moment()
        .tz(CommonParam.userTimeZone || RNLocalize.getTimeZone())
        .format('E')
    const lastSunday = moment().subtract(weekOfDay, 'days').format('YYYY-MM-DD HH:mm:ss')
    const last2WksDate = moment(lastSunday).add(-7, 'days')
    const storeProductStatus = {}
    let metricsData = await getMetricsInnovationProductData(retailStoreId)
    if (!metricsData.spLst.length && !metricsData.orderItemLst.length) {
        for (let i = 0; i < 5; i++) {
            metricsData = await getMetricsInnovationProductData(retailStoreId)
            if (metricsData.spLst.length || metricsData.orderItemLst.length) {
                break
            }
        }
    }
    metricsData.spLst.forEach((spItem) => {
        const checkOrderItemLst = []
        if (metricsData.orderItemLst) {
            metricsData.orderItemLst.forEach((orderItem) => {
                if (
                    orderItem['Product2.ProductCode'] === spItem['Product.ProductCode'] &&
                    orderItem['Order.RetailStore__c'] === spItem.RetailStoreId
                ) {
                    checkOrderItemLst.push(orderItem)
                }
            })
        }
        let isOrdered = checkStoreProductIsOrdered(checkOrderItemLst, last2WksDate)
        const isDelivered = spItem.No_11_WTD_Void__c === '1' || spItem.No_12_LCW_Void__c === '1'
        const wksCS = spItem.No_12_LCW_Void__c === '1' && spItem.No_11_WTD_Void__c === '0'
        if (isDelivered) {
            isOrdered = false
        }
        const ytdVolume = spItem.YTD_Volume__c > 0
        storeProductStatus[spItem['Product.ProductCode']] = {
            wksCS: wksCS,
            isDelivered: isDelivered,
            isOrdered: isOrdered,
            ytdVolume: ytdVolume,
            status: spItem.Status__c
        }
    })
    return storeProductStatus
}

export const checkProductIsNew = (launchDate: any) => {
    if (!_.isEmpty(launchDate)) {
        const weekAfterLaunchDate = moment(launchDate).add(8, 'days').format('YYYY-MM-DD')
        if (moment().isAfter(launchDate) && moment().isBefore(weekAfterLaunchDate)) {
            return true
        }
    }
    return false
}

const getMetricsSKUItem = (prodCodeLst: any, sProdLst: any, wiredCount: any) => {
    const prodItemLst = []
    if (!_.isEmpty(prodCodeLst)) {
        prodCodeLst.forEach((prodCode) => {
            const prodObj = {
                Id: '',
                GTIN: '',
                total: 0,
                authCount: 0,
                LCWCount: 0,
                WTDCount: 0,
                cWTDCount: 0,
                volSum: 0,
                revSum: 0,
                voidGapCount: 0,
                wkcCsCount: 0,
                orderDayCount: 0,
                orderOpenCount: 0,
                orderTodayCount: 0,
                Product_Availability__c: 0,
                Formatted_Sub_Brand_Name__c: '',
                Formatted_Flavor__c: '',
                Formatted_Package__c: '',
                Package_Type_Name__c: '',
                Sub_Brand__c: '',
                Sub_Brand_Code__c: '',
                Brand_Code__c: '',
                National_Launch_Date: '',
                National_Launch_Date__c: '',
                Flavor_Name__c: '',
                volIds: '',
                voidIds: '',
                voidWTDIds: '',
                lcdIds: '',
                wksIds: '',
                orderDayIds: '',
                openOrderIds: '',
                orderTodayIds: '',
                // cLcdIds: '',
                cWtdIds: '',
                DistLCW: 0
            }
            const volLst = []
            const voidLst = []
            const voidWTDLst = []
            const wksLst = []
            const openOrderLst = []
            const orderDayLst = []
            const cWtdLst = []
            const lcdLst = []
            const orderTodayLst = []
            sProdLst.forEach((spItem) => {
                if (spItem.ProductCode === prodCode) {
                    prodObj.Id = prodCode
                    prodObj.GTIN = spItem.GTIN__c
                    prodObj.total++
                    prodObj.Formatted_Sub_Brand_Name__c = !prodObj.Formatted_Sub_Brand_Name__c
                        ? spItem.Formatted_Sub_Brand_Name__c
                        : prodObj.Formatted_Sub_Brand_Name__c
                    prodObj.Formatted_Flavor__c = !prodObj.Formatted_Flavor__c
                        ? spItem.Formatted_Flavor__c
                        : prodObj.Formatted_Flavor__c
                    prodObj.Formatted_Package__c = !prodObj.Formatted_Package__c
                        ? spItem.Formatted_Package__c
                        : prodObj.Formatted_Package__c
                    prodObj.Package_Type_Name__c = !prodObj.Package_Type_Name__c
                        ? spItem.Package_Type_Name__c
                        : prodObj.Package_Type_Name__c
                    prodObj.Sub_Brand__c = !prodObj.Sub_Brand__c ? spItem.Sub_Brand__c : prodObj.Sub_Brand__c
                    prodObj.Sub_Brand_Code__c = !prodObj.Sub_Brand_Code__c
                        ? spItem.Sub_Brand_Code__c
                        : prodObj.Sub_Brand_Code__c
                    prodObj.Brand_Code__c = !prodObj.Brand_Code__c ? spItem.Brand_Code__c : prodObj.Brand_Code__c
                    prodObj.National_Launch_Date = !prodObj.National_Launch_Date
                        ? spItem.National_Launch_Date__c
                        : prodObj.National_Launch_Date
                    prodObj.National_Launch_Date__c = moment(spItem.National_Launch_Date__c).format('MMM DD, YYYY')
                    prodObj.Flavor_Name__c = !prodObj.Flavor_Name__c ? spItem.Flavor_Name__c : prodObj.Flavor_Name__c
                    if (spItem.isAuth) {
                        prodObj.authCount++
                        if (!volLst.includes(spItem.RetailStoreId)) {
                            volLst.push(spItem.RetailStoreId)
                        }
                    }
                    if (spItem.orderDay) {
                        prodObj.orderDayCount++
                        if (!orderDayLst.includes(spItem.RetailStoreId)) {
                            orderDayLst.push(spItem.RetailStoreId)
                        }
                    }
                    if (spItem.LCW) {
                        prodObj.LCWCount++
                        if (!lcdLst.includes(spItem.RetailStoreId)) {
                            lcdLst.push(spItem.RetailStoreId)
                        }
                    }
                    if (spItem.WTD) {
                        prodObj.WTDCount++
                    }
                    if (spItem.volYTD) {
                        prodObj.volSum += spItem.volYTD
                    }
                    if (spItem.netRev) {
                        prodObj.revSum += spItem.netRev
                    }
                    if (spItem.voidGap) {
                        prodObj.voidGapCount++
                        if (!voidLst.includes(spItem.RetailStoreId)) {
                            voidLst.push(spItem.RetailStoreId)
                        }
                    }
                    if (spItem.voidWTD) {
                        if (!voidWTDLst.includes(spItem.RetailStoreId)) {
                            voidWTDLst.push(spItem.RetailStoreId)
                        }
                    }
                    if (spItem.wkcCs) {
                        prodObj.wkcCsCount++
                        if (!wksLst.includes(spItem.RetailStoreId)) {
                            wksLst.push(spItem.RetailStoreId)
                        }
                    }
                    if (spItem.cWTD) {
                        prodObj.cWTDCount++
                        if (!cWtdLst.includes(spItem.RetailStoreId)) {
                            cWtdLst.push(spItem.RetailStoreId)
                        }
                    }
                    if (spItem.orderOpen) {
                        prodObj.orderOpenCount++
                        if (!openOrderLst.includes(spItem.RetailStoreId)) {
                            openOrderLst.push(spItem.RetailStoreId)
                        }
                    }
                    if (spItem.orderToday) {
                        prodObj.orderTodayCount++
                        if (!orderTodayLst.includes(spItem.RetailStoreId)) {
                            orderTodayLst.push(spItem.RetailStoreId)
                        }
                    }
                    if (spItem.Product_Availability__c === '1') {
                        prodObj.Product_Availability__c++
                    }
                }
            })
            prodObj.volIds = volLst.join(';')
            prodObj.voidIds = voidLst.join(';')
            prodObj.voidWTDIds = voidWTDLst.join(';')
            prodObj.wksIds = wksLst.join(';')
            prodObj.openOrderIds = openOrderLst.join(';')
            prodObj.orderDayIds = orderDayLst.join(';')
            prodObj.cWtdIds = cWtdLst.join(';')
            prodObj.lcdIds = lcdLst.join(';')
            prodObj.orderTodayIds = orderTodayLst.join(';')
            prodObj.DistLCW = (prodObj.LCWCount / wiredCount) * 100
            prodItemLst.push(prodObj)
        })
    }

    return prodItemLst
}

const setStoreProductObj = (item: any) => {
    return {
        isAuth: false,
        ProductId: item.ProductId,
        RetailStoreId: item.RetailStoreId,
        GTIN__c: item['Product.GTIN__c'],
        Formatted_Sub_Brand_Name__c: item['Product.Formatted_Sub_Brand_Name__c'],
        Flavor_Name__c: item['Product.Flavor_Name__c'],
        Formatted_Flavor__c: item['Product.Formatted_Flavor__c'],
        Formatted_Package__c: item['Product.Formatted_Package__c'],
        Package_Type_Name__c: item['Product.Package_Type_Name__c'],
        Sub_Brand__c: item['Product.Sub_Brand__c'],
        Sub_Brand_Code__c: item['Product.Sub_Brand_Code__c'],
        Brand_Code__c: item['Product.Brand_Code__c'],
        ProductCode: item['Product.ProductCode'],
        National_Launch_Date__c: item['Product.National_Launch_Date__c'],
        Product_Availability__c: item.Product_Availability__c,
        LCW: false,
        WTD: false,
        volYTD: 0,
        netRev: 0,
        voidGap: true,
        cWTD: false,
        wkcCs: true,
        orderOpen: false,
        orderToday: false,
        orderDay: false,
        voidWTD: false
    }
}
const setRefreshStoreProductObj = (item: any) => {
    return {
        isAuth: false,
        ProductId: item.ProductId,
        RetailStoreId: item.RetailStoreId,
        GTIN__c: item.Product.GTIN__c,
        Formatted_Sub_Brand_Name__c: item.Product.Formatted_Sub_Brand_Name__c,
        Flavor_Name__c: item.Product.Flavor_Name__c,
        Formatted_Flavor__c: item.Product.Formatted_Flavor__c,
        Formatted_Package__c: item.Product.Formatted_Package__c,
        Package_Type_Name__c: item.Product.Package_Type_Name__c,
        Sub_Brand__c: item.Product.Sub_Brand__c,
        Sub_Brand_Code__c: item.Product.Sub_Brand_Code__c,
        Brand_Code__c: item.Product.Brand_Code__c,
        National_Launch_Date__c: item.Product.National_Launch_Date__c,
        Product_Availability__c: item.Product_Availability__c ? '1' : '0',
        ProductCode: item.Product.ProductCode,
        LCW: false,
        WTD: false,
        volYTD: 0,
        netRev: 0,
        voidGap: true,
        cWTD: false,
        wkcCs: true,
        orderOpen: false,
        orderToday: false,
        orderDay: false,
        voidWTD: false
    }
}

const getOrderItemLst = (orderItemLst) => {
    const lst = []
    const shipLst = _.cloneDeep(orderItemLst)
    shipLst.forEach((v) => {
        v['Order.RetailStore__c'] = v.Order.RetailStore__c
        v['Order.EffectiveDate'] = v.Order.EffectiveDate
        v['Product2.ProductCode'] = v.Product2.ProductCode
        lst.push(v)
    })
    return _.cloneDeep(lst)
}

export const getCTRBaseQuery = () => {
    return `(SELECT {Customer_to_Route__c:Customer__c} 
    FROM {Customer_to_Route__c} WHERE 
    {Customer_to_Route__c:Route__c} = '${CommonParam.userRouteId}'  
    AND {Customer_to_Route__c:ACTV_FLG__c} = true 
    AND {Customer_to_Route__c:Merch_Flag__c} = false 
    AND {Customer_to_Route__c:RecordType.Name} = 'CTR') `
}

export const getRetailStoreQuery = () => {
    return isPersonaPSR()
        ? `WHERE {RetailStore:AccountId} IN ${getCTRBaseQuery()} `
        : 'WHERE {RetailStore:AccountId} IN (SELECT {Account:Id} FROM {Account}) '
}

export const getAccountQueryWithRouteFilter = () => {
    return ` AND {Account:Id} IN ${getCTRBaseQuery()} `
}

const checkRetailStoreOrderDay = () => {
    return new Promise((resolve, reject) => {
        const toDayWeek =
            Number(
                moment()
                    .tz(CommonParam.userTimeZone || RNLocalize.getTimeZone())
                    .format('E')
            ) - 1
        const week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        SoupService.retrieveDataFromSoup('RetailStore', {}, [], null, [getRetailStoreQuery()])
            .then((retailStores) => {
                const rsOrderDay = {}
                retailStores.forEach((rs) => {
                    if (rs['Account.Merchandising_Order_Days__c']) {
                        rsOrderDay[rs.Id] =
                            rs['Account.Merchandising_Order_Days__c'].split(';').indexOf(week[toDayWeek]) !== -1
                    }
                })
                resolve(rsOrderDay)
            })
            .catch((err) => {
                const rejection = {
                    status: 'E2',
                    error: err,
                    method: 'checkRetailStoreOrderDay'
                }
                reject(rejection)
            })
    })
}

export const getMetricsStoreProductItem = async (
    metricsData: any,
    lastSunday: any,
    wiredCount: any,
    isRefresh?: boolean
) => {
    const last2WksDate = moment(lastSunday).add(-7, 'days')
    const rsOrderDay = await checkRetailStoreOrderDay()
    const sProdLst = []
    const prodCodeLst = metricsData.spLst
        .map((item) => (isRefresh ? item.Product.ProductCode : item['Product.ProductCode']))
        .filter((item: any, index: number, arr: any) => arr.indexOf(item) === index)
    const orderItemLst = isRefresh ? getOrderItemLst(metricsData.orderItemLst) : _.cloneDeep(metricsData.orderItemLst)
    metricsData.spLst.forEach((spItem) => {
        const checkOrderItemLst = []
        const spObj = isRefresh ? setRefreshStoreProductObj(spItem) : setStoreProductObj(spItem)
        if (spItem.Combined_Auth_Flag__c === '1' || spItem.Combined_Auth_Flag__c === true) {
            spObj.isAuth = true
        }
        if (orderItemLst) {
            orderItemLst.forEach((orderItem) => {
                const upc = isRefresh ? spItem.Product.ProductCode : spItem['Product.ProductCode']
                if (
                    orderItem['Product2.ProductCode'] === upc &&
                    orderItem['Order.RetailStore__c'] === spItem.RetailStoreId
                ) {
                    checkOrderItemLst.push(orderItem)
                }
            })
        }
        const LCW12 =
            typeof spItem.No_12_LCW_Void__c === 'boolean' ? spItem.No_12_LCW_Void__c : spItem.No_12_LCW_Void__c === '1'
        const WTD11 =
            typeof spItem.No_11_WTD_Void__c === 'boolean' ? spItem.No_11_WTD_Void__c : spItem.No_11_WTD_Void__c === '1'
        if (!spObj.LCW) {
            spObj.LCW = LCW12
        }
        if (!spObj.WTD) {
            spObj.WTD = WTD11
        }
        spObj.volYTD = spItem.YTD_LCD_Vol__c ? parseInt(spItem.YTD_LCD_Vol__c) : 0
        spObj.netRev = spItem.YTD_Net_Revenue__c ? parseFloat(spItem.YTD_Net_Revenue__c) : 0
        if (spObj.voidGap) {
            spObj.voidGap = !LCW12
        }
        spObj.wkcCs = LCW12 && !WTD11
        spObj.cWTD = !LCW12 && WTD11
        if (!_.isEmpty(rsOrderDay)) {
            spObj.orderDay = !LCW12 && !WTD11 && rsOrderDay[spItem.RetailStoreId]
        }
        spObj.voidWTD = !LCW12 && !WTD11
        spObj.orderToday = !LCW12 && !WTD11 && checkStoreProductIsOrderToday(checkOrderItemLst, last2WksDate)
        spObj.orderOpen = checkStoreProductIsOrdered(checkOrderItemLst, last2WksDate) && !LCW12 && !WTD11
        sProdLst.push(spObj)
    })
    return getMetricsSKUItem(prodCodeLst, sProdLst, wiredCount)
}

export const getCarouselSKUItem = (carouselData: any, GTINsMap: any) => {
    const carouseSKULst = []
    carouselData.carouselDataLst.forEach((carouseItem) => {
        const skuLst = []
        let packageSize = ''
        let carouseUrl = ''
        let minSKUNum = ''
        const skuIdMap = new Map()
        carouselData.storeProductLst.forEach((spItem) => {
            const size = spItem['Product.Formatted_Package__c']
            const skuNum = spItem['Product.Material_Unique_ID__c']
            if (
                spItem['Product.Sub_Brand_Code__c'] === carouseItem['Product.Sub_Brand_Code__c'] &&
                spItem['Product.National_Launch_Date__c'] === carouseItem['Product.National_Launch_Date__c'] &&
                spItem['Product.Brand_Code__c'] === carouseItem['Product.Brand_Code__c']
            ) {
                if (!skuLst.includes(spItem)) {
                    skuLst.push(spItem)
                    if (size) {
                        if (
                            size.toLowerCase().indexOf('20oz') !== -1 &&
                            GTINsMap &&
                            GTINsMap[spItem['Product.GTIN__c']]
                        ) {
                            if (packageSize === '20oz') {
                                if (Number(skuNum) < Number(minSKUNum)) {
                                    carouseUrl = GTINsMap[spItem['Product.GTIN__c']]
                                    minSKUNum = skuNum
                                }
                            } else {
                                packageSize = '20oz'
                                carouseUrl = GTINsMap[spItem['Product.GTIN__c']]
                                minSKUNum = skuNum
                            }
                        } else if (
                            size.toLowerCase().indexOf('12pk') !== -1 &&
                            packageSize !== '20oz' &&
                            GTINsMap &&
                            GTINsMap[spItem['Product.GTIN__c']]
                        ) {
                            if (packageSize === '12pk') {
                                if (Number(skuNum) < Number(minSKUNum)) {
                                    carouseUrl = GTINsMap[spItem['Product.GTIN__c']]
                                    minSKUNum = skuNum
                                }
                            } else {
                                packageSize = '12pk'
                                carouseUrl = GTINsMap[spItem['Product.GTIN__c']]
                                minSKUNum = skuNum
                            }
                        } else if (
                            size.toLowerCase().indexOf('2liter') !== -1 &&
                            packageSize !== '20oz' &&
                            packageSize !== '12pk' &&
                            GTINsMap &&
                            GTINsMap[spItem['Product.GTIN__c']]
                        ) {
                            if (packageSize === '2liter') {
                                if (Number(skuNum) < Number(minSKUNum)) {
                                    carouseUrl = GTINsMap[spItem['Product.GTIN__c']]
                                    minSKUNum = skuNum
                                }
                            } else {
                                packageSize = '2liter'
                                carouseUrl = GTINsMap[spItem['Product.GTIN__c']]
                                minSKUNum = skuNum
                            }
                        }
                    }
                }
                skuIdMap.set(
                    spItem['Product.Material_Unique_ID__c'],
                    GTINsMap ? GTINsMap[spItem['Product.GTIN__c']] : ''
                )
            }
        })
        carouseItem.skuItems = skuLst
        if (packageSize !== '') {
            carouseItem.carouseUrl = carouseUrl
        } else {
            let minSKUId = ''
            skuLst.forEach((spItem) => {
                if (GTINsMap && GTINsMap[spItem['Product.GTIN__c']]) {
                    if (minSKUId) {
                        if (Number(spItem['Product.Material_Unique_ID__c']) < Number(minSKUId)) {
                            minSKUId = spItem['Product.Material_Unique_ID__c']
                        }
                    } else {
                        minSKUId = spItem['Product.Material_Unique_ID__c']
                    }
                }
            })
            if (minSKUId) {
                carouseItem.carouseUrl = skuIdMap.get(minSKUId)
            } else {
                carouseItem.carouseUrl = ''
            }
        }
        carouseSKULst.push(carouseItem)
    })
    return carouseSKULst
}

const getInnovProdSKUSortQuery = (sortSelected: string) => {
    switch (sortSelected) {
        case 'National Launch Date ASC':
            return (
                InnovationProductQueries.MetricsItemSortQuery.queryByNationalASC +
                InnovationProductQueries.MetricsItemSortQuery.queryByNationalDefault
            )
        case 'National Launch Date DESC':
            return (
                InnovationProductQueries.MetricsItemSortQuery.queryByNationalDESC +
                InnovationProductQueries.MetricsItemSortQuery.queryByNationalDefault
            )
        case 'Name ASC':
            return InnovationProductQueries.MetricsItemSortQuery.queryByNameASC
        case 'Name DESC':
            return InnovationProductQueries.MetricsItemSortQuery.queryByNameDESC
        case 'Distribution DESC':
            return (
                InnovationProductQueries.MetricsItemSortQuery.queryByDistDESC +
                InnovationProductQueries.MetricsItemSortQuery.queryByDistDefault
            )
        case 'Distribution ASC':
            return (
                InnovationProductQueries.MetricsItemSortQuery.queryByDistASC +
                InnovationProductQueries.MetricsItemSortQuery.queryByDistDefault
            )
        default:
            return ' ORDER BY ' + InnovationProductQueries.MetricsItemSortQuery.sortDefaultValue
    }
}

export const getMetricsInnovProdQuery = (searchText: any, sortSelected: string) => {
    let query = ''
    let searchQuery = ''
    if (searchText.length >= 3) {
        const searchValue = searchText
            .replaceAll("'", '%')
            .replaceAll('`', '%')
            .replaceAll('‘', '%')
            .replaceAll('’', '%')
        searchQuery = InnovProdSearchQueries(searchValue)
    }
    const filterQuery = [searchQuery].filter((item) => item !== '' && item).join(' AND ')
    if (filterQuery) {
        query = query + 'WHERE ' + filterQuery
    }
    query = query + getInnovProdSKUSortQuery(sortSelected)
    return query
}

export const getSkuInfo = (carouselData: any) => {
    const carouseSKULst = []
    carouselData.carouselDataLst.forEach((carouseItem) => {
        const skuLst = []
        carouselData.storeProductLst.forEach((spItem) => {
            if (
                spItem['Product.National_Launch_Date__c'] === carouseItem['Product.National_Launch_Date__c'] &&
                spItem['Product.Sub_Brand_Code__c'] === carouseItem['Product.Sub_Brand_Code__c'] &&
                spItem['Product.Brand_Code__c'] === carouseItem['Product.Brand_Code__c']
            ) {
                if (!skuLst.includes(spItem)) {
                    skuLst.push(spItem)
                }
            }
        })
        carouseItem.skuItems = skuLst
        carouseSKULst.push(carouseItem)
    })
    return carouseSKULst
}

export const carouselDisplayedFilter = (carousels: any, spStatus?: any, storeProductStatus?: any) => {
    const cardCarouselOrigin = []
    const cardArchive = []
    carousels.forEach((carousel, index, arr) => {
        let deliveredCount = 0
        let orderedCount = 0
        let snoozedCount = 0
        let noSaleCount = 0
        let needReorder = false
        let noFlag = false
        let ipScore = defaultScore
        if (!carousel.skuItems) {
            return null
        }
        carousel.skuItems.forEach((skuItem) => {
            if (!_.isEmpty(spStatus[skuItem['Product.ProductCode']]) || !_.isEmpty(storeProductStatus)) {
                let itemStatus
                if (_.isEmpty(storeProductStatus)) {
                    itemStatus = spStatus[skuItem['Product.ProductCode']]
                } else {
                    itemStatus = storeProductStatus[skuItem['Product.ProductCode']]
                }
                if (itemStatus.isDelivered) {
                    deliveredCount++
                    if (itemStatus.ytdVolume) {
                        noFlag = true
                    }
                } else if (!itemStatus.isDelivered && itemStatus.ytdVolume) {
                    noFlag = true
                }
                if (itemStatus.isOrdered) {
                    orderedCount++
                }
                if (itemStatus.wksCS) {
                    needReorder = true
                }
                if (itemStatus.status === 'Snoozed') {
                    snoozedCount++
                } else if (itemStatus.status === 'No Sale') {
                    noSaleCount++
                }
                if (
                    (itemStatus.status === 'Action' && itemStatus.isOrdered) ||
                    (itemStatus.status === 'Action' && !itemStatus.isOrdered && !itemStatus.isDelivered) ||
                    (itemStatus.status === 'Action' &&
                        !itemStatus.isOrdered &&
                        itemStatus.isDelivered &&
                        itemStatus.wksCS)
                ) {
                    if (ipScore < skuItem.IP_Score__c) {
                        ipScore = skuItem.IP_Score__c
                    }
                }
            }
        })
        arr[index].hasReorder = needReorder
        arr[index].noFlag = noFlag
        arr[index].deliveredCount = deliveredCount
        arr[index].orderedCount = orderedCount
        arr[index].snoozedCount = snoozedCount
        arr[index].noSaleCount = noSaleCount
        arr[index].IP_Score__c = ipScore
        if (carousel.skuItems.length === deliveredCount + snoozedCount + noSaleCount && !needReorder) {
            cardArchive.push(_.cloneDeep(arr[index]))
        } else if (carousel.skuItems.length > deliveredCount + snoozedCount + noSaleCount || needReorder) {
            cardCarouselOrigin.push(_.cloneDeep(arr[index]))
        }
    })
    const cardCarousel = _.orderBy(
        cardCarouselOrigin,
        [
            (v) => {
                return v.IP_Score__c == null ? defaultScore : v.IP_Score__c
            }
        ],
        ['desc']
    )
    return { cardCarousel, cardArchive }
}

const timeoutRequestKeys = {}
export const timeoutWrap = async (promise, timeout = 5000, onFailCallback?) => {
    const requestKey = new Date().valueOf()
    const res = await Promise.race([
        promise(timeoutRequestKeys, requestKey).catch(() => {
            return 'timeout'
        }),
        new Promise((resolve) => {
            setTimeout(() => {
                timeoutRequestKeys[requestKey] = true
                resolve('timeout')
            }, timeout)
        })
    ])
    if (res === 'timeout') {
        onFailCallback && onFailCallback()
        throw new Error('timeout')
    }
    return res
}
const getNextOrderDay = (nextOrderDayIndex: number, isEndDate: boolean) => {
    if (nextOrderDayIndex) {
        return isEndDate
            ? moment().day(nextOrderDayIndex).add(1, 'day').toDate()
            : moment().day(nextOrderDayIndex).toDate()
    }
    return isEndDate ? moment().add(2, 'day').toDate() : moment().add(1, 'day').toDate()
}
// get next orderDay as Date object.
export const getNextOrderDayDate = (retailStore: { 'Account.Merchandising_Order_Days__c': string }) => {
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const startDayTexts = retailStore['Account.Merchandising_Order_Days__c']?.split(';')
    const today = moment().startOf('day')
    let orderDay = today.clone().add(1, 'day')

    if (startDayTexts) {
        for (let i = 0; i < 7; i++) {
            const thatDayText = weekDays[(today.day() + 1 + i) % 7]
            if (startDayTexts.includes(thatDayText)) {
                orderDay = today.clone().add(1 + i, 'day')
                break
            }
        }
    }

    return orderDay.toDate()
}
export const calculateNextOrderDay = (availableDays: string, isEndDate: boolean) => {
    let dayStatus = handleDayStatus(availableDays)
    dayStatus = dayStatus.concat(dayStatus)
    const dayOfWeek = moment().day()
    let nextOrderDayIndex
    for (let i = dayOfWeek + 1; i < dayStatus.length; i++) {
        if (dayStatus[i].attend) {
            nextOrderDayIndex = i
            break
        }
    }
    const nextOrderDay = getNextOrderDay(nextOrderDayIndex, isEndDate)
    return nextOrderDay
}

export const calculateEDT = (startDate: any) => {
    const daybefore = moment(startDate).subtract(1, 'd')
    const tenPMEST = daybefore
        .parseZone()
        .tz('America/New_York', true)
        .set({ hour: 22, minute: 0, second: 0, millisecond: 0 })
    const outputUTCTime = tenPMEST.clone().utc().toISOString()
    return outputUTCTime
}

export const assembleATCReq = (productItem, retailStore) => {
    const rootQuery = `/services/data/${CommonParam.apiVersion}/`
    const orderPostURL = 'sobjects/Order'
    const orderItemPostURL = 'sobjects/OrderItem'
    const priceBookQuery =
        'query/?q=SELECT Id, Product2Id, Pricebook2Id FROM ' +
        ` PricebookEntry where product2id = '${productItem.ProductId}' and ` +
        " Pricebook2.Name = 'Standard Price Book'"
    const { userName, userInfo = { LastName: '' } } = CommonParam
    const reqBody: any = {
        getPriceBookEntryReq: {
            method: 'GET',
            url: `${rootQuery}${priceBookQuery}`,
            referenceId: `pricebookRef${productItem.ProductId}`
        },
        insertOrderReq: {
            method: 'POST',
            url: `${rootQuery}${orderPostURL}`,
            referenceId: `newOrderRef${productItem.ProductId}`,
            body: {
                LOC_ID__c: CommonParam.userLocationId,
                RTE_ID__c: CommonParam.userRouteId,
                EffectiveDate: moment(productItem.startDate).format('YYYY-MM-DD'),
                EndDate: moment(productItem.endDate).format('YYYY-MM-DD'),
                AccountId: retailStore.AccountId,
                RetailStore__c: retailStore.Id,
                ATC_Status__c: ATCStatus.PUSH_ACTIVE,
                Push_to_Smartr_Date__c: calculateEDT(productItem.startDate),
                Status: OrderStatus.DRAFT,
                Order_ATC_Type__c: OrderATCType.PRODUCT_PUSH,
                Push_Type__c: PushType.INNOVATION,
                Name: `Savvy-${PushType.INNOVATION}-${userInfo.LastName || userName}`,
                Pricebook2Id: `@{pricebookRef${productItem.ProductId}.records[0].Pricebook2Id}`
            }
        },
        insertOrderItemReq: {
            method: 'POST',
            url: `${rootQuery}${orderItemPostURL}`,
            referenceId: `newOrderItemRef${productItem.ProductId}`,
            body: {
                OrderId: `@{newOrderRef${productItem.ProductId}.id}`,
                Product2Id: productItem.ProductId,
                Quantity: productItem.itemQuantity,
                UnitPrice: 0,
                PriceBookEntryId: `@{pricebookRef${productItem.ProductId}.records[0].Id}`
            }
        }
    }
    return reqBody
}

export const assembleCacheForLaterReq = (
    originPage: 'innovation' | 'customer',
    productData:
        | {
              startDate?: ''
              endDate?: ''
          }
        | { itemQuantity: number | '' }[],
    retailStoreData:
        | {}
        | {
              startDate?: ''
              endDate?: ''
          }[]
) => {
    const req = []
    if (originPage === 'innovation' && Array.isArray(retailStoreData) && !Array.isArray(productData)) {
        retailStoreData.forEach((retailStore) => {
            productData.startDate = retailStore.startDate
            productData.endDate = retailStore.endDate
            const reqBody = assembleATCReq(productData, retailStore)
            req.push([reqBody.getPriceBookEntryReq, reqBody.insertOrderReq, reqBody.insertOrderItemReq])
        })
    } else if (originPage === 'customer' && !Array.isArray(retailStoreData) && Array.isArray(productData)) {
        productData.forEach((boxItem) => {
            if (+boxItem.itemQuantity !== 0) {
                const reqBody = assembleATCReq(boxItem, retailStoreData)
                req.push([reqBody.getPriceBookEntryReq, reqBody.insertOrderReq, reqBody.insertOrderItemReq])
            }
        })
    }
    return req
}

export const removeDup = (historyData, curData, isOnline) => {
    const newArray = []
    if (Array.isArray(historyData) && Array.isArray(curData)) {
        curData.forEach((curEl) => {
            const curKey = curEl[1].body.EffectiveDate + curEl[1].body.RetailStore__c + curEl[2].body.Product2Id
            const copy = historyData.filter((historyEl) => {
                const historyKey = isOnline
                    ? historyEl.Order.EffectiveDate + historyEl.Order.RetailStore__c + historyEl.Product2.Id
                    : historyEl[1].body.EffectiveDate + historyEl[1].body.RetailStore__c + historyEl[2].body.Product2Id
                return curKey === historyKey
            })
            if (_.isEmpty(copy)) {
                newArray.push(curEl)
            }
        })
    }
    return newArray
}

export const cacheForLaterATCDataHandler = async (req: any[], callBack: () => void) => {
    const historicData = JSON.parse(await AsyncStorage.getItem('ATCCacheForLater'))
    const processedReq = _.cloneDeep(
        req.filter((reqItem) => {
            return (
                diffDaysFromToday(reqItem[1].body.EffectiveDate) > 0 &&
                moment().utc().isBefore(reqItem[1].body.Push_to_Smartr_Date__c)
            )
        })
    )
    if (_.isEmpty(historicData)) {
        await AsyncStorage.setItem('ATCCacheForLater', JSON.stringify(processedReq), async () => {
            callBack()
        })
    } else if (Array.isArray(historicData)) {
        const copy = _.cloneDeep(historicData)
        const newReq = removeDup(copy, processedReq, false)
        await AsyncStorage.removeItem('ATCCacheForLater', () => {
            AsyncStorage.setItem('ATCCacheForLater', JSON.stringify(copy.concat(newReq))).then(() => {
                callBack()
            })
        })
    }
}

export const getCacheForLaterATCData = async () => {
    const rawData = await AsyncStorage.getItem('ATCCacheForLater')
    const cacheForLaterData = rawData ? JSON.parse(rawData) : []
    const processedReq = _.isEmpty(cacheForLaterData)
        ? []
        : _.cloneDeep(
              cacheForLaterData.filter((reqItem) => {
                  return (
                      diffDaysFromToday(reqItem[1].body.EffectiveDate) > 0 &&
                      moment().utc().isBefore(reqItem[1].body.Push_to_Smartr_Date__c)
                  )
              })
          )
    if (processedReq.length !== cacheForLaterData.length) {
        await AsyncStorage.setItem('ATCCacheForLater', processedReq)
    }
    return processedReq
}

export const getATCCacheDupOnline = async (inputData) => {
    const productIdArr = _.uniq(inputData.map((el) => `'${el[2].body.Product2Id}'`)).join(',')
    const retailStoreIdArr = _.uniq(inputData.map((el) => `'${el[1].body.RetailStore__c}'`)).join(',')
    const effectiveDates = _.uniq(inputData.map((el) => moment(el[1].body.EffectiveDate).format('YYYY-MM-DD'))).join(
        ','
    )
    const productCodeRes = await SoupService.retrieveDataFromSoup(
        'StoreProduct',
        {},
        ['ProductCode'],
        'SELECT {StoreProduct:Product.ProductCode} FROM {StoreProduct} ' +
            ` WHERE {StoreProduct:ProductId} IN (${productIdArr})` +
            ` AND {StoreProduct:RetailStoreId} IN (${retailStoreIdArr})`
    )
    const productCodeArr = _.uniq(productCodeRes.map((el) => `'${el.ProductCode}'`)).join(',')
    const query =
        'SELECT Product2.Id, OrderItem.Id, Order.EffectiveDate, Order.RetailStore__c' +
        ' FROM OrderItem' +
        ` WHERE Order.RetailStore__c IN (${retailStoreIdArr})` +
        ` AND Order.Order_ATC_Type__c = '${OrderATCType.PRODUCT_PUSH}'` +
        ` AND Product2.ProductCode IN (${productCodeArr})` +
        ` AND Order.EffectiveDate IN (${effectiveDates})`
    const { data } = await syncDownObj('OrderItem', query, false)
    return data
}

export const sendCacheForLaterATCReq = async (inputData) => {
    const reqs = []
    return new Promise<CommonSyncRes | any>((resolve, reject) => {
        if (Array.isArray(inputData)) {
            inputData.forEach((el) => {
                reqs.push(compositeCommonCall(el))
            })
            return Promise.all(reqs)
                .then((res) => {
                    resolve(res)
                })
                .catch((err) => {
                    reject(err)
                })
        }
    })
}

/**
 * @description Innovation Product hooks.
 * @author Qiulin Deng
 * @email qiulin.deng@pwc.com
 * @date 2021-10-10
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import _ from 'lodash'
import moment from 'moment'
import dayjs from 'dayjs'

import { CommonParam } from '../../common/CommonParam'
import { isPersonaPSR, isPersonaUGMOrSDL, Persona, isPersonaKAM } from '../../common/enums/Persona'
import { SoupService } from '../service/SoupService'
import { Log } from '../../common/enums/Log'
import { formatString } from '../utils/CommonUtils'
import InnovationProductQueries from '../queries/InnovationProductQueries'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

import {
    clearFilesWhenPriorityExecuted,
    getInnovationCarouselDetailData,
    getStorePriorityById,
    loadRoutesForSwitch
} from '../utils/InnovationProductUtils'
import {
    getCarouselSKUItem,
    checkProductIsNew,
    getSkuInfo,
    carouselDisplayedFilter,
    getAccountQueryWithRouteFilter,
    getCTRBaseQuery
} from '../helper/rep/InnovationProductHelper'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { t } from '../../common/i18n/t'
import { getIdClause } from '../components/manager/helper/MerchManagerHelper'
import { fetchObjInTime, syncDownObj } from '../api/SyncUtils'
import { storeClassLog } from '../../common/utils/LogUtils'
import { getStringValue } from '../utils/LandingUtils'
import { useAppDispatch } from '../redux/ReduxHooks'
import BaseInstance from '../../common/BaseInstance'
import { useSharePointToken } from '../helper/rep/SharePointTokenHelper'
import { CommonApi } from '../../common/api/CommonApi'
import {
    syncCelsiusPriorityProducts,
    syncProductAttributeDetails,
    intelGetMonthName
} from '../helper/rep/PriorityProductHelper'
// This function is ues to get Innovation Product Carousel data
export const useInnovationCarouselDetail = (
    retailStoreId: string,
    isLoading: boolean,
    psrFlag: number,
    searchText?: any,
    updateCarousel?: number,
    isArchive?: boolean
) => {
    const [carouselInfo, setCarouselInfo] = useState<any[]>([-1])
    const [accessToken, setAccessToken] = useState('')
    const personaAccess =
        CommonParam.PERSONA__c === Persona.PSR ||
        CommonParam.PERSONA__c === Persona.KEY_ACCOUNT_MANAGER ||
        isPersonaUGMOrSDL()
    const getInnovationCarouselDetail = () => {
        AsyncStorage.getItem('DAMAccessToken')
            .then((param) => {
                setAccessToken(JSON.parse(param))
                const searchValue = searchText
                    .replaceAll("'", '%')
                    .replaceAll('`', '%')
                    .replaceAll('‘', '%')
                    .replaceAll('’', '%')
                getInnovationCarouselDetailData(retailStoreId, isArchive, searchValue)
                    .then((carouselData: any) => {
                        AsyncStorage.getItem('GTIN_IMG_MAP').then((GTINsMapParam: any) => {
                            setCarouselInfo(getCarouselSKUItem(carouselData, JSON.parse(GTINsMapParam)))
                        })
                        Instrumentation.stopTimer('PSR Enters Customer Detail Page Loading')
                    })
                    .catch((err) => {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'useInnovationCarouselDetail.getInnovationCarouselDetailData',
                            ErrorUtils.error2String(err)
                        )
                    })
            })
            .catch(async (err) => {
                const rejection = {
                    status: 'E2',
                    error: err,
                    method: 'AsyncStorage'
                }
                await storeClassLog(
                    Log.MOBILE_ERROR,
                    'useInnovationCarouselDetail.AsyncStorage',
                    ErrorUtils.error2String(rejection)
                )
            })
    }

    useEffect(() => {
        if (retailStoreId && personaAccess && !isLoading) {
            getInnovationCarouselDetail()
        }
    }, [retailStoreId, isLoading, psrFlag, updateCarousel, searchText])
    return { carouselInfo, accessToken }
}

const metricsPageRouteData = async () => {
    const routeObj = {
        wiredCount: 0,
        DistTgtP: 0,
        LFValue: 90,
        SFValue: 75
    }
    const tokenParam = await AsyncStorage.getItem('DAMAccessToken')
    const GTINParam = await AsyncStorage.getItem('GTIN_IMG_MAP')
    const appConRes = await SoupService.retrieveDataFromSoup('Application_Configuration__mdt', {}, [], null, [
        'WHERE ({Application_Configuration__mdt:Value__c}="Number_of_SF_Customers__c" OR {Application_Configuration__mdt:Value__c}="Number_of_LF_Customers__c")'
    ])
    appConRes.forEach((appItem) => {
        if (appItem.Value__c === 'Number_of_SF_Customers__c') {
            routeObj.SFValue = Number(appItem.DistTarget__c)
        }
        if (appItem.Value__c === 'Number_of_LF_Customers__c') {
            routeObj.LFValue = Number(appItem.DistTarget__c)
        }
    })
    const routeData = await SoupService.retrieveDataFromSoup(
        'Route_Sales_Geo__c',
        {},
        ['Id', 'Dist_Target_for_Customer__c'],
        null,
        [formatString("WHERE {Route_Sales_Geo__c:Id} = '%s' ", [CommonParam.userRouteId])]
    )
    const retailStoreData = await SoupService.retrieveDataFromSoup('RetailStore', {}, ['Id'], null, [
        `WHERE {RetailStore:AccountId} IN ${getCTRBaseQuery()}`
    ])
    if (!_.isEmpty(routeData)) {
        routeObj.DistTgtP = routeData[0].Dist_Target_for_Customer__c
    }
    if (!_.isEmpty(retailStoreData)) {
        routeObj.wiredCount = retailStoreData.length
    }

    return {
        wiredDistTgt: routeObj,
        assessToken: JSON.parse(tokenParam),
        GTINsMap: JSON.parse(GTINParam)
    }
}

export const useInnovationDistributionItem = (
    searchText: any,
    sortSelected: string,
    isLoading: boolean,
    filterQuery: any,
    setIsRecalculate: any
) => {
    const [innovDisItem, setInnovDisItem] = useState([])
    const [GTINsMap, setGTINsMap] = useState({})
    const [assessToken, setAccessToken] = useState('')
    const [wiredDistTgt, setWiredDistTgt] = useState({
        wiredCount: 0,
        DistTgtP: 0,
        LFValue: 90,
        SFValue: 75
    })

    useEffect(() => {
        if (!isLoading && !isPersonaUGMOrSDL()) {
            const searchValue = searchText
                .replaceAll("'", '%')
                .replaceAll('`', '%')
                .replaceAll('‘', '%')
                .replaceAll('’', '%')
            metricsPageRouteData().then((routeInfoData) => {
                setAccessToken(routeInfoData.assessToken)
                setWiredDistTgt(routeInfoData.wiredDistTgt)
                setGTINsMap(routeInfoData.GTINsMap)
                SoupService.retrieveDataFromSoup('MetricsProduct', {}, [], null, [
                    `WHERE (COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c}, {MetricsProduct:Sub_Brand__c}) LIKE '%${searchValue}%' ` +
                        `OR COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) LIKE '%${searchValue}%' ` +
                        `OR COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) LIKE '%${searchValue}%') ` +
                        'ORDER BY ' +
                        InnovationProductQueries.MetricsItemSortQuery.sortDefaultValue
                ])
                    .then((result) => {
                        setInnovDisItem(result)
                        setIsRecalculate(false)
                    })
                    .catch(async (err) => {
                        storeClassLog(Log.MOBILE_ERROR, 'useInnovationDistributionItem', ErrorUtils.error2String(err))
                    })
            })
        }
    }, [searchText, sortSelected, isLoading, filterQuery])
    return { innovDisItem, assessToken, wiredDistTgt, GTINsMap }
}
const getKeyAccountQuery = async (page: string) => {
    switch (page) {
        case 'Metrics':
            return (
                'WHERE {Account:Id} IN ' +
                '(SELECT {Account:ParentId} FROM {Account} WHERE {Account:Id} IN ' +
                '(SELECT {Account:ParentId} FROM {Account} WHERE {Account:Id} IN ' +
                `${getCTRBaseQuery()}` +
                ')) ' +
                'ORDER BY {Account:Name} COLLATE NOCASE ASC NULLS LAST'
            )
        case 'CustomerList':
            return (
                'WHERE {Account:Id} IN ' +
                '(SELECT {Account:ParentId} FROM {Account} WHERE {Account:Id} IN ' +
                '(SELECT {Account:ParentId} FROM {Account} WHERE {Account:Id} IN ' +
                '(SELECT {RetailStore:AccountId} FROM {RetailStore} ))) ' +
                'ORDER BY {Account:Name} COLLATE NOCASE ASC NULLS LAST'
            )
        default:
            return ''
    }
}

const computeKaData = (data: any[]) => {
    const list = data.filter((obj) => obj.Parent)
    const temp: object[] = []
    list.forEach((account) => {
        if (account.Parent?.Parent) {
            temp.push({
                Name: account.Parent.Parent.Name,
                Id: account.Parent.Parent.Id
            })
        }
    })
    return _.uniqBy(temp, 'Id')
}

export const useGetFilterKeyAccount = (isShowSelector: boolean, page: string) => {
    const [keyAccount, setKeyAccount] = useState<any>([])
    useEffect(() => {
        if (isShowSelector) {
            if (page === 'KamCustomerList') {
                const query = `SELECT Id, Name, ParentId, Parent.Id, Parent.Name, Parent.ParentId, Parent.Parent.Id, Parent.Parent.Name FROM Account WHERE Id IN (SELECT AccountId FROM AccountTeamMember WHERE UserId = '${CommonParam.userId}' AND kam_active_flag__c = true AND If_Populated_By_KAM__c = true AND Account.IS_ACTIVE__c = true) ORDER BY Parent.Parent.Name ASC NULLS LAST`
                syncDownObj('Account', query, false)
                    .then((data) => {
                        const ka: any[] = computeKaData(data?.data)
                        setKeyAccount(ka)
                    })
                    .catch(async (err) => {
                        await storeClassLog(Log.MOBILE_ERROR, 'useGetFilterKeyAccount', ErrorUtils.error2String(err))
                        setKeyAccount([])
                    })
            } else {
                getKeyAccountQuery(page).then((query) => {
                    SoupService.retrieveDataFromSoup('Account', {}, ['Id', 'Name'], null, [query]).then((res) => {
                        setKeyAccount(res)
                    })
                })
            }
        }
    }, [isShowSelector])
    return keyAccount
}

export const useMetricsCustomer = (searchText: any, isAccountShowSelector: boolean) => {
    const [account, setAccount] = useState([])
    useEffect(() => {
        const searchValue = searchText
            .replaceAll("'", '%')
            .replaceAll('`', '%')
            .replaceAll('‘', '%')
            .replaceAll('’', '%')
        if (isAccountShowSelector) {
            SoupService.retrieveDataFromSoup('Account', {}, [], null, [
                "WHERE  {Account:CUST_LVL__c} = 'Customer Outlet' AND " +
                    `{Account:Name} LIKE '%${searchValue}%'` +
                    getAccountQueryWithRouteFilter() +
                    ' ORDER BY {Account:Name} COLLATE NOCASE ASC NULLS LAST'
            ]).then((res) => {
                setAccount(res)
            })
        }
    }, [searchText, isAccountShowSelector])
    return account
}

const determineIfThereAsAValue = (item: any, curTabName?: any) => {
    if (!curTabName) {
        return false
    }
    const ids = (item && item[curTabName]) || ''
    return ids.length > 0
}

export const initTabs = (item, tabName) => {
    return [
        {
            name: 'WTD ' + t.labels.PBNA_MOBILE_METRICS_STATUS.toUpperCase(),
            dot: false,
            haveData:
                determineIfThereAsAValue(item, tabName[0]) ||
                determineIfThereAsAValue(item, 'wksIds') ||
                determineIfThereAsAValue(item, 'voidWTDIds')
        },
        {
            name: t.labels.PBNA_MOBILE_ORDER_DAY_VOIDS.toUpperCase(),
            dot: false,
            haveData: determineIfThereAsAValue(item, tabName[1])
        },
        {
            name: t.labels.PBNA_MOBILE_METRICS_ORDERS.toUpperCase(),
            dot: false,
            haveData: determineIfThereAsAValue(item, tabName[2]) || determineIfThereAsAValue(item, 'orderTodayIds')
        },
        {
            name: 'Vol YTD - LCD'.toUpperCase(),
            dot: false,
            haveData: determineIfThereAsAValue(item, tabName[3])
        },
        {
            name: t.labels.PBNA_MOBILE_METRICS_VOID_GAP.toUpperCase(),
            dot: false,
            haveData: determineIfThereAsAValue(item, tabName[4]) || determineIfThereAsAValue(item, 'lcdIds')
        }
    ]
}

export const useMetricsItemDetailTabs = (item?: any, tabName?: any) => {
    const [tabs, setTabs] = useState(initTabs(item, tabName))
    return { tabs: tabs, setTabs: setTabs }
}

export const getWTDDetailsToggles = (item?: any, tabName?: any) => {
    let defaultIndex = -1
    const tabs = tabName.map((itemTab, index) => {
        const colorString = determineIfThereAsAValue(item, itemTab.name) ? null : '#D3D3D3'
        if (!colorString && defaultIndex === -1) {
            defaultIndex = index
        }
        return {
            name: itemTab.title || '',
            titleColor: colorString
        }
    })
    return {
        tabs,
        defaultIndex: defaultIndex === -1 ? 0 : defaultIndex
    }
}

const getMetricsDetailStoreProducts = async (item: any, customerLst: any) => {
    const idArr = []
    customerLst.forEach((element) => {
        idArr.push(element.Id)
    })
    const productList = await SoupService.retrieveDataFromSoup(
        'StoreProduct',
        {},
        ['Id', 'RetailStoreId', 'volYTD', 'netRev'],
        `
        SELECT 
        {StoreProduct:Id},
        {StoreProduct:RetailStoreId},
        {StoreProduct:YTD_LCD_Vol__c},
        {StoreProduct:YTD_Net_Revenue__c}
        FROM {StoreProduct}
        WHERE {StoreProduct:RetailStoreId} IN (${getIdClause(idArr)})
        AND {StoreProduct:Product.ProductCode} = '${item.Id}'
        `
    )
    const innovCustomerLst = customerLst.map((storeItem) => {
        const productItems = productList.filter((ele) => ele.RetailStoreId === storeItem.Id)
        const storeProduct = productItems[0] || {}
        storeItem.volYTD = storeProduct.volYTD
        storeItem.netRev = storeProduct.netRev
        return storeItem
    })
    return innovCustomerLst
}

const getSearchVale = (searchValue) => {
    if (!searchValue) {
        return ''
    }
    return (
        `({RetailStore:Name} LIKE '%${searchValue}%'` +
        ` OR {RetailStore:Street} LIKE '%${searchValue}%'` +
        ` OR {RetailStore:State} LIKE '%${searchValue}%'` +
        ` OR {RetailStore:Country} LIKE '%${searchValue}%'` +
        ` OR {RetailStore:PostalCode} LIKE '%${searchValue}%'` +
        ` OR {RetailStore:City} LIKE '%${searchValue}%'` +
        ` OR {RetailStore:Account.RTLR_STOR_NUM__c} LIKE '%${searchValue}%'` +
        ` OR {RetailStore:Account.CUST_UNIQ_ID_VAL__c} LIKE '%${searchValue}%') AND `
    )
}
export const useMetricsDetailCustomer = (type: any, item: any, searchText: any, isShow?: any) => {
    const [customerLst, setCustomerLst] = useState([])
    useEffect(() => {
        if (_.isEmpty(item)) {
            setCustomerLst([])
            return
        }
        let rsIds
        let noOrderDayQuery = ''
        if (type === 'noOrderDays') {
            rsIds = item.volIds
                .split(';')
                .filter((v) => v !== '')
                .map((v) => `'${v}'`)
                .join(',')
            noOrderDayQuery = '{RetailStore:Account.Merchandising_Order_Days__c} IS NULL AND '
        } else {
            rsIds = item[type]
                .split(';')
                .filter((v) => v !== '')
                .map((v) => `'${v}'`)
                .join(',')
        }
        if (!rsIds.length) {
            setCustomerLst([])
            return
        }
        const searchValue = searchText
            .replaceAll("'", '%')
            .replaceAll('`', '%')
            .replaceAll('‘', '%')
            .replaceAll('’', '%')
        const filterValue = getSearchVale(searchValue)
        SoupService.retrieveDataFromSoup('RetailStore', {}, [], null, [
            'WHERE ' +
                filterValue +
                noOrderDayQuery +
                '{RetailStore:AccountId} IN (' +
                'SELECT {Account:Id} FROM {Account} WHERE {Account:Id} IN (' +
                'SELECT {RetailStore:AccountId} FROM {RetailStore} WHERE ' +
                `{RetailStore:Id} IN (${rsIds}))) ` +
                'ORDER BY {RetailStore:Name} COLLATE NOCASE ASC NULLS LAST'
        ]).then(async (res) => {
            const listData = await getMetricsDetailStoreProducts(item, res)
            setCustomerLst(listData)
        })
    }, [type, searchText, isShow])
    return customerLst
}

export const useMetricsDetailUnAuthCustomer = (item: any, searchText: any) => {
    const [unAuthCustomerLst, setUnAuthCustomerLst] = useState([])
    const [allUnAuthList, setAllUnAuthList] = useState([])
    useEffect(() => {
        const searchValue = searchText
            .replaceAll("'", '%')
            .replaceAll('`', '%')
            .replaceAll('‘', '%')
            .replaceAll('’', '%')
        const filterValue = getSearchVale(searchValue)
        SoupService.retrieveDataFromSoup('RetailStore', {}, [], null, [
            'WHERE ' +
                filterValue +
                '{RetailStore:Id} NOT IN ' +
                '(SELECT {StoreProduct:RetailStoreId} FROM {StoreProduct} WHERE ' +
                `{StoreProduct:Product.ProductCode} ='${!_.isEmpty(item?.Id) ? item.Id : ''}') AND ` +
                `({RetailStore:AccountId} IN ${getCTRBaseQuery()})` +
                ' ORDER BY {RetailStore:Name} COLLATE NOCASE ASC NULLS LAST'
        ]).then((res) => {
            if (!_.isEmpty(res)) {
                setUnAuthCustomerLst(res)
            } else {
                setUnAuthCustomerLst([])
            }
        })
        SoupService.retrieveDataFromSoup('RetailStore', {}, [], null, [
            'WHERE ' +
                '{RetailStore:Id} NOT IN ' +
                '(SELECT {StoreProduct:RetailStoreId} FROM {StoreProduct} WHERE ' +
                `{StoreProduct:Product.ProductCode} ='${!_.isEmpty(item?.Id) ? item.Id : ''}') AND ` +
                `({RetailStore:AccountId} IN ${getCTRBaseQuery()})` +
                'ORDER BY {RetailStore:Name} COLLATE NOCASE ASC NULLS LAST'
        ]).then((res) => {
            if (!_.isEmpty(res)) {
                setAllUnAuthList(res)
            } else {
                setAllUnAuthList([])
            }
        })
    }, [item, searchText])
    return { unAuthCustomerLst, allUnAuthList }
}

export const useAuthMap = () => {
    const [authLst, setAuthLst] = useState([])
    useEffect(() => {
        if (isPersonaUGMOrSDL()) {
            return
        }
        SoupService.retrieveDataFromSoup('MetricsProduct', {}, [], null).then((res) => {
            setAuthLst(res)
        })
    }, [])
    return authLst
}

const retrievePSRInnovationPanelData = async () => {
    let wksCount = 0
    let voidsCount = 0
    let ordersCount = 0
    let newCount = 0
    const metricsData = await SoupService.retrieveDataFromSoup('MetricsProduct', {}, [], null)
    metricsData.forEach((item) => {
        if (item.orderDayCount > 0 && moment(item.National_Launch_Date).isBefore(moment())) {
            ordersCount += Number(item.orderDayCount)
        }
        if (item.wkcCsCount > 0) {
            wksCount += Number(item.wkcCsCount)
        }
        if (item.voidGapCount > 0 && moment(item.National_Launch_Date).isBefore(moment())) {
            voidsCount += Number(item.voidGapCount) - Number(item.cWTDCount)
        }
        if (checkProductIsNew(item.National_Launch_Date)) {
            newCount++
        }
    })

    return {
        voids: voidsCount,
        orders: ordersCount,
        wks: wksCount,
        newCount: newCount
    }
}

export const useInnovationPanelData = (isFocused: any, setCheckDataFlag: any) => {
    const [panelObj, setPanelObj] = useState({
        voids: 0,
        orders: 0,
        wks: 0,
        newCount: 0
    })
    useEffect(() => {
        if (CommonParam.PERSONA__c === 'PSR' && isFocused) {
            setCheckDataFlag(true)
            retrievePSRInnovationPanelData()
                .then((panelData: any) => {
                    setPanelObj(panelData)
                    setCheckDataFlag(false)
                })
                .catch((err) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'useInnovationPanelData.retrievePSRInnovationPanelData',
                        ErrorUtils.error2String(err)
                    )
                })
        }
    }, [isFocused])
    return panelObj
}

export const useGTINsMap = () => {
    const [GTINsMap, setGTINsMap] = useState({})

    useEffect(() => {
        AsyncStorage.getItem('GTIN_IMG_MAP').then((params) => {
            setGTINsMap(JSON.parse(params))
        })
    }, [])

    return GTINsMap
}

export const useBarCodeMap = () => {
    const [BarCodeMap, setBarCodeMap] = useState({})
    useEffect(() => {
        AsyncStorage.getItem('GTIN_BARCODE_MAP').then((params) => {
            setBarCodeMap(JSON.parse(params))
        })
    }, [])
    return BarCodeMap
}

export const usePreset = (savePresetCount: any, setPresets: any) => {
    const [presetNameLst, setPresetNameLst] = useState([])
    const [presetMap, setPresetMap] = useState({})

    useEffect(() => {
        if (isPersonaUGMOrSDL()) {
            return
        }
        SoupService.retrieveDataFromSoup('Preset', {}, [], null, [
            formatString("WHERE {Preset:UserId}='%s' AND {Preset:GTMUId} = '%s' ORDER BY {Preset:Name}", [
                CommonParam.userId,
                CommonParam.userRouteGTMUId
            ])
        ]).then((res) => {
            const preset = {}
            setPresetNameLst(['--' + t.labels.PBNA_MOBILE_METRICS_SELECT_PRESET + '--'].concat(res.map((v) => v.Name)))
            res.forEach((v) => {
                preset[v.Name] = v
            })
            setPresets(preset)
            setPresetMap(preset)
        })
    }, [savePresetCount])
    return { presetNameLst, presetMap, setPresetMap }
}
export const useQuickPreset = (
    sortSelected: any,
    filterQuery: any,
    isLoading: any,
    isFocused: any,
    pickCount: number
) => {
    const [presetNameLst, setPresetNameLst] = useState([])
    const [presetMap, setPresetMap] = useState({})

    useEffect(() => {
        if (isPersonaUGMOrSDL()) {
            return
        }
        SoupService.retrieveDataFromSoup('Preset', {}, [], null, [
            formatString("WHERE {Preset:UserId}='%s' AND {Preset:GTMUId} = '%s' ORDER BY {Preset:Name}", [
                CommonParam.userId,
                CommonParam.userRouteGTMUId
            ])
        ]).then((res) => {
            const preset = {}
            setPresetNameLst([t.labels.PBNA_MOBILE_NONE].concat(res.map((v) => v.Name)))
            res.forEach((v) => {
                preset[v.Name] = v
            })
            setPresetMap(preset)
        })
    }, [sortSelected, filterQuery, isLoading, isFocused, pickCount])
    return { presetNameLst, presetMap }
}

export const useSKUsLocal = (
    carousel: any,
    count: any,
    pickValue: number,
    spStatus: any,
    index?: any,
    isArchive?: boolean,
    refreshCarousel?: boolean
) => {
    const [skuData, setSkuData] = useState([])
    const [skuLength, setSkuLength] = useState(0)
    const [allSkus, setAllSkus] = useState([])
    const filterMap = {
        0: 'SKUs to Action',
        1: 'Snoozed',
        2: 'No Sale',
        3: 'Delivered',
        4: 'All'
    }
    useEffect(() => {
        if (carousel?.RetailStoreId) {
            getInnovationCarouselDetailData(carousel.RetailStoreId).then((carouselData: any) => {
                const allCarousel = getSkuInfo(carouselData)
                let filteredCarousel
                if (isArchive) {
                    filteredCarousel = carouselDisplayedFilter(allCarousel, spStatus, null).cardArchive
                } else {
                    filteredCarousel = carouselDisplayedFilter(allCarousel, spStatus, null).cardCarousel
                }
                let skuInfo = []
                for (const item of filteredCarousel) {
                    if (
                        item['Product.National_Launch_Date__c'] === carousel['Product.National_Launch_Date__c'] &&
                        !_.isEmpty(item['Product.Sub_Brand_Code__c']) &&
                        item['Product.Sub_Brand_Code__c'] === carousel['Product.Sub_Brand_Code__c'] &&
                        !_.isEmpty(item['Product.Brand_Code__c']) &&
                        item['Product.Brand_Code__c'] === carousel['Product.Brand_Code__c']
                    ) {
                        skuInfo = item.skuItems
                    }
                }
                let filterSKUs
                setAllSkus(skuInfo)
                if (pickValue) {
                    if (pickValue === 0 || pickValue === -1) {
                        filterSKUs = skuInfo.filter((v) => {
                            const isDelivered = v.No_11_WTD_Void__c === '1'
                            return (v.Status__c === 'Action' || !v.Status__c) && !isDelivered
                        })
                    } else if (pickValue === 3) {
                        filterSKUs = skuInfo.filter((v) => v.No_11_WTD_Void__c === '1')
                    } else if (pickValue === 4) {
                        filterSKUs = skuInfo
                    } else {
                        filterSKUs = skuInfo.filter((v) => v.Status__c === filterMap[pickValue])
                    }
                } else {
                    filterSKUs = skuInfo.filter((v) => {
                        const isDelivered = v.No_11_WTD_Void__c === '1'
                        return (v.Status__c === 'Action' || !v.Status__c) && !isDelivered
                    })
                }
                setSkuData(filterSKUs)
                setSkuLength(filterSKUs.length)
            })
        }
    }, [count, pickValue, index, refreshCarousel])

    return { skuData, skuLength, allSkus }
}

const priorityTypeTranslated = (item: any) => {
    const priorityList: Record<string, string> = {
        'Conquer Cold': t.labels.PBNA_MOBILE_CONQUER_COLD,
        'Curb to Cold Vault': t.labels.PBNA_MOBILE_CURB_TO_COLD_VAULT,
        'Expand the Endcaps': t.labels.PBNA_MOBILE_EXPAND_THE_ENDCAPS,
        'Fight with Food': t.labels.PBNA_MOBILE_FIGHT_WITH_FOOD,
        'Grow the Gondola': t.labels.PBNA_MOBILE_GROW_THE_GONDOLA,
        'Land the Lobby': t.labels.PBNA_MOBILE_LAND_THE_LOBBY,
        'Penetrate the Perimeter': t.labels.PBNA_MOBILE_PENETRATE_THE_PERIMETER,
        'Rule the Register': t.labels.PBNA_MOBILE_RULE_THE_REGISTER,
        Other: t.labels.PBNA_MOBILE_OTHER
    }
    const translatedItem = _.cloneDeep(item)
    const priorityType = priorityList[item.Priority_Type_Formula__c] || item.Priority_Type_Formula__c
    translatedItem.priorityType = priorityType
    return translatedItem
}
export const getPriorityDocuments = async (idArr: Array<string>) => {
    // can't directly get Priority__c from ContentVersion for now, this SOQL backup
    // const getDocQuery = `SELECT Id, Title, ExternalDocumentInfo1, SalesContentTypePicklist__c, SalesContentTypeOther__c, Priority__c, Expiration_Date__c FROM ContentVersion WHERE Priority__c IN (${getIdClause(idArr)})`
    const getLinkedEntityQuery = `SELECT Id, LinkedEntityId, ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId IN (${getIdClause(
        idArr
    )})`
    const linkedEntityRes = await fetchObjInTime('ContentDocumentLink', getLinkedEntityQuery)
    const linkedEntityIds: string[] = []
    linkedEntityRes?.length &&
        linkedEntityRes.forEach((le: any) => {
            linkedEntityIds.push(le.ContentDocumentId)
        })
    if (linkedEntityIds.length) {
        const getDocQuery = `SELECT Id, Title, ExternalDocumentInfo1, SalesContentTypePicklist__c, SalesContentTypeOther__c, Priority__c, Expiration_Date__c, CreatedDate FROM ContentVersion WHERE ContentDocumentId IN (${getIdClause(
            linkedEntityIds
        )}) ORDER BY CreatedDate ASC`
        const res: any = await fetchObjInTime('ContentVersion', getDocQuery)
        if (res.length) {
            await AsyncStorage.setItem('salesDocumentsList', JSON.stringify(res))
        }
        return res
    }
    return []
}

const computeSellingData = async (sellingData: Array<object>) => {
    // get documentsList from storage
    const documentsList = JSON.parse(((await AsyncStorage.getItem('salesDocumentsList')) as any) || JSON.stringify([]))
    return sellingData.map((item: any) => {
        const docItems = _.filter(documentsList, (li) => li.Priority__c === item.Id)
        const salesDocuments: any[] = []
        docItems.length &&
            docItems.forEach((doc) => {
                salesDocuments.push({
                    salesDocId: doc?.Id,
                    salesDocTitle: doc?.Title,
                    salesDocUrl: doc?.ExternalDocumentInfo1,
                    salesDocType: doc?.SalesContentTypePicklist__c,
                    salesDocTypeOther: doc?.SalesContentTypeOther__c,
                    salesDocCreatedDate: doc?.CreatedDate
                })
            })
        // sort file by SalesContentTypePicklist__c
        salesDocuments.sort((a, b) => {
            const orderMap: any = {
                'Authorization Letter': 1,
                'Look of Success': 2,
                'Sell Sheet': 3
            }
            const key = 'salesDocType'
            if (orderMap[a[key]] && orderMap[b[key]]) {
                return orderMap[a[key]] - orderMap[b[key]]
            }
            if (orderMap[a[key]] && !orderMap[b[key]]) {
                return -1
            }
            if (!orderMap[a[key]] && orderMap[b[key]]) {
                return 1
            }
            if (!orderMap[a[key]] && !orderMap[b[key]]) {
                return a.salesDocTypeOther.localeCompare(b.salesDocTypeOther, { numeric: true })
            }
            return 0
        })

        // if multi files have same doc type, add `1,2,3...` in the end
        const counts: any = {}
        const totalCounts: any = {}
        const OTHER_TYPE_KEY = 'Other'
        salesDocuments.forEach(({ salesDocType, salesDocTypeOther }) => {
            const key = salesDocType !== OTHER_TYPE_KEY ? salesDocType : salesDocTypeOther
            if (!(key in totalCounts)) {
                totalCounts[key] = 1
            } else {
                totalCounts[key]++
            }
        })
        item.salesDocuments = salesDocuments.map((doc: any) => {
            const key = doc.salesDocType !== OTHER_TYPE_KEY ? doc.salesDocType : doc.salesDocTypeOther
            if (!(key in counts)) {
                counts[key] = 1
                if (totalCounts[key] > 1) {
                    if (doc.salesDocType !== OTHER_TYPE_KEY) {
                        return { ...doc, salesDocType: `${key} ${counts[key]}` }
                    }
                    return { ...doc, salesDocTypeOther: `${key} ${counts[key]}` }
                }
                return doc
            }
            counts[key]++
            if (doc.salesDocType !== OTHER_TYPE_KEY) {
                return { ...doc, salesDocType: `${key} ${counts[key]}` }
            }
            return { ...doc, salesDocTypeOther: `${key} ${counts[key]}` }
        })

        return item
    })
}

/* eslint-disable camelcase */
export enum StorePriorityStatusC {
    action = 'Action',
    snoozed = 'Snoozed',
    noSale = 'No Sale'
}

type StorePriority = {
    Id: string
    PriorityId__c: string
    RetailStoreId__c: string
    is_executed__c: string
    AddedToCart__c: string
    StartDate__c: string
    Status__c: StorePriorityStatusC
    Date_NoSale__c: string
}
/* eslint-enable camelcase */

export enum PriorityQuickFilterName {
    snoozed = 'snoozed',
    noSale = 'noSale',
    pushedToSMARTr = 'pushedToSMARTr',
    executed = 'executed'
}

export interface PriorityQuickFilterItem {
    label: string
    name: PriorityQuickFilterName
}

const getQuickFilterOptions = () => [
    {
        name: PriorityQuickFilterName.snoozed,
        label: t.labels.PBNA_MOBILE_IP_SNOOZED
    },
    {
        name: PriorityQuickFilterName.noSale,
        label: t.labels.PBNA_MOBILE_NO_SALE
    },
    {
        name: PriorityQuickFilterName.pushedToSMARTr,
        label: t.labels.PBNA_MOBILE_PUSHED_TO_SMARTR
    },
    {
        name: PriorityQuickFilterName.executed,
        label: t.labels.PBNA_MOBILE_EXECUTED
    }
]

type UsePrioritiesDataFunction = () => {
    prioritiesDisplay: any[]
    filters: PriorityQuickFilterItem[]
    selectedFilters: PriorityQuickFilterName[]
    searchKey: string
    setSearchKey: (value: string) => void
    setPriorities: (value: any[]) => void
    setStorePriorities: (value: any[]) => void
    setSelectedFilters: (value: PriorityQuickFilterName[]) => void
    setExecutedPriorityIds: (value: string[]) => void
}

export const useStorePriority = (storePriorityId: string) => {
    const storePriority = useRef<any>()

    useEffect(() => {
        const initStorePriority = async () => {
            const record = await getStorePriorityById(storePriorityId)
            if (record) {
                storePriority.current = record
            }
        }

        if (storePriorityId) {
            initStorePriority()
        }
    }, [storePriorityId])

    return { storePriority }
}

// Hook usePrioritiesData
export const useFilteredPrioritiesData: UsePrioritiesDataFunction = () => {
    const [priorities, setPriorities] = useState<any[]>([])
    const [storePriorities, setStorePriorities] = useState<any[]>([])
    const [searchKey, setSearchKey] = useState('')

    const filters: PriorityQuickFilterItem[] = getQuickFilterOptions()
    const [selectedFilters, setSelectedFilters] = useState<PriorityQuickFilterName[]>([])
    const [executedPriorityIds, setExecutedPriorityIds] = useState<string[]>([])

    // spByID means map Store Priority by storePriorities[i].Id
    // spByPID means map Store Priority by storePriorities[i].PriorityId__c
    const [, spByPID] = useMemo(
        () =>
            storePriorities.reduce(
                (ret, item) => {
                    const [byID, byPID] = ret
                    byID.set(item.Id, item)
                    byPID.set(item.PriorityId__c, item)
                    return ret
                },
                [new Map<string, StorePriority>(), new Map<string, StorePriority>()]
            ),
        [storePriorities]
    )

    const prioritiesDisplay = useMemo(() => {
        let dataRes = priorities

        const filterValues = new Set<PriorityQuickFilterName>(selectedFilters)

        dataRes = dataRes.filter((record) => {
            // no filter then all records
            if (filterValues.size === 0) {
                return true
            }

            const sp = spByPID.get(record.Id)

            // Story 10623288: snoozed with no implementation
            // if (filterValues.has(PriorityQuickFilterName.snoozed)) {
            //     return ?
            // }

            if (filterValues.has(PriorityQuickFilterName.noSale)) {
                if (sp.Status__c === 'No Sale') {
                    return true
                }
            }

            if (filterValues.has(PriorityQuickFilterName.pushedToSMARTr)) {
                if (sp.is_executed__c !== '1' && sp.AddedToCart__c === '1') {
                    return true
                }
            }

            if (filterValues.has(PriorityQuickFilterName.executed)) {
                if (sp.is_executed__c === '1') {
                    return true
                }
            }

            return false
        })

        return dataRes
    }, [priorities, spByPID, searchKey, selectedFilters, executedPriorityIds])

    return {
        prioritiesDisplay,
        searchKey,
        filters,
        selectedFilters,
        setSearchKey,
        setPriorities,
        setStorePriorities,
        setSelectedFilters,
        setExecutedPriorityIds
    }
}
export const usePriorityProductAttribute = (
    storePriorityId: string,
    productPriority: any,
    isFocused: boolean,
    retailStore: any
) => {
    const [paItems, setPaItems] = useState<any[]>([])
    const [celsiusPriority, setCelsiusPriority] = useState<boolean>(false)
    const [isFetchingAuthProducts, setIsFetchingAuthProducts] = useState<boolean>(false)
    const [needAuthProducts, setNeedAuthProducts] = useState<string[]>([])
    const [isFetchingProducts, setIsFetchingProducts] = useState<boolean>(false)

    const locProdId = retailStore?.LOC_PROD_ID__c

    const fetchAndStorageNeedAuthProducts = async (uniqId: string) => {
        try {
            setIsFetchingAuthProducts(true)
            const authProductsQuery = `SELECT Id, Inven_Id__c, Target_Value__c, Target_Level__c FROM Product_Exclusion__c WHERE Is_Active__c = TRUE AND Target_Value__c = '${uniqId}'`
            const authProductsResult = await syncDownObj(
                'Product_Exclusion__c',
                encodeURIComponent(authProductsQuery),
                false
            )
            const authProductsMaterialIds = authProductsResult?.data.map((item) => item.Inven_Id__c) || []
            setNeedAuthProducts(authProductsMaterialIds)
            await AsyncStorage.setItem('NeedAuthProducts', JSON.stringify(authProductsMaterialIds))
            setIsFetchingAuthProducts(false)
        } catch (error) {
            setIsFetchingAuthProducts(false)
            storeClassLog(
                Log.MOBILE_ERROR,
                'fetchAndStorageNeedAuthProducts',
                'Get Customer Needs Auth Products:' + getStringValue(error)
            )
        }
    }

    useEffect(() => {
        const customerUniqId = retailStore['Account.CUST_UNIQ_ID_VAL__c']
        customerUniqId && fetchAndStorageNeedAuthProducts(customerUniqId)
    }, [retailStore['Account.CUST_UNIQ_ID_VAL__c']])

    useEffect(() => {
        if (isFocused && storePriorityId && productPriority?.ProductAttribute__c) {
            const isCelsius =
                productPriority?.Priority_Type_Other__c === 'Celsius Sold' &&
                productPriority.Third_Party_Created__c === '1'
            setCelsiusPriority(isCelsius)
            let productAttribute
            try {
                productAttribute = JSON.parse(productPriority?.ProductAttribute__c)
            } catch (error) {
                setPaItems([])
            }
            if (!productAttribute) {
                return
            }
            if (isCelsius) {
                syncCelsiusPriorityProducts(productAttribute, locProdId, setIsFetchingProducts).then((paItems) => {
                    setPaItems(paItems || [])
                })
            } else {
                syncProductAttributeDetails(storePriorityId, productAttribute).then((paItems) => {
                    setPaItems(paItems || [])
                })
            }
        }
    }, [storePriorityId, productPriority?.ProductAttribute__c, isFocused, locProdId])

    return {
        paItems,
        celsiusPriority,
        needAuthProducts,
        isLoadingProducts: isFetchingAuthProducts || isFetchingProducts
    }
}

export const useSellingDataFromLocalHook = ({
    isLoading,
    retailStore,
    shouldLandOnTab,
    exeItemId,
    refreshFlag,
    isFocused,
    showInitLoadingIndicator,
    searchText
}: {
    isLoading: boolean
    retailStore?: any
    shouldLandOnTab?: string
    exeItemId?: string
    refreshFlag?: number
    isFocused?: boolean
    showInitLoadingIndicator?: boolean
    searchText?: string
}) => {
    const PRIORITIES = t.labels.PBNA_MOBILE_PRIORITIES.toLocaleUpperCase()
    const INNOVATION = t.labels.PBNA_MOBILE_IP_INNOVATION.toLocaleUpperCase()
    const defaultActiveTab = shouldLandOnTab || PRIORITIES

    const [isLoadingPriorities, setIsLoadingPriorities] = useState<boolean>(false)
    const [carouselSelling, setCarouselSelling] = useState([])
    const [archivedPriorities, setArchivedPriorities] = useState<any[]>([])
    const [executedPriorityIds, setExecutedPriorityIds] = useState<any[]>([])
    const [prioritiesTabReady, setPrioritiesTabReady] = useState<boolean>(false)
    const [activeCarouselTab, setActiveCarouselTab] = useState(defaultActiveTab)
    const [storePriorities, setStorePriorities] = useState<StorePriority[]>([])

    const dispatch = useAppDispatch()

    const EXECUTIONALFRAMEWORK = 'Executional_Framework__c'

    const getPrioritiesFromLocal = async (showIds: string[], archivedIds: string[]) => {
        let searchCondition = ''

        if (searchText) {
            searchText = searchText.replace(/[{}]/g, '').replace(/[.*+?^$()|[\]\\]/g, '\\$&')
            const searchConditions = []
            searchConditions.push(`{Executional_Framework__c:Card_Title__c} LIKE '%${searchText}%'`)
            searchConditions.push(`{Executional_Framework__c:Priority_Type_Formula__c} LIKE '%${searchText}%'`)

            const monthStr = intelGetMonthName(searchText)
            if (monthStr) {
                const thisYear = new Date().getFullYear()
                searchConditions.push(
                    `strftime('%Y%m', {Executional_Framework__c:Start_Date__c}) = '${thisYear}${monthStr}'`
                )
            }

            searchCondition = ` AND ( ${searchConditions.join(' OR ')} )`
        }

        const localPriorityCondition =
            ` WHERE DATE({Executional_Framework__c:Start_Date__c}) <= date('now', '${CommonParam.userTimeZoneOffset}', 'start of day', '+14 day')` +
            ` AND {Executional_Framework__c:End_Date__c} >= DATE('now') AND {Executional_Framework__c:Priority_Status__c} = 'Publish'` +
            ` AND {Executional_Framework__c:Id} IN (${getIdClause([...showIds, ...archivedIds])})` +
            searchCondition +
            ' ORDER BY {Executional_Framework__c:Start_Date__c} DESC,' +
            ' {Executional_Framework__c:Card_Title__c} ASC,' +
            ' {Executional_Framework__c:Card_Subtitle__c} ASC'
        const priorities: any[] = await SoupService.retrieveDataFromSoup('Executional_Framework__c', {}, [], null, [
            localPriorityCondition
        ])
        const [showLocalPriorities, archivedLocalPriorities] = _.partition(priorities, (item) =>
            showIds.includes(item.Id)
        )
        showLocalPriorities.sort((a, b) => {
            return a.Priority_Type_Formula__c.localeCompare(b.Priority_Type_Formula__c, { numeric: true })
        })
        return {
            showLocalPriorities,
            archivedLocalPriorities
        }
    }

    const getPriorityOfCurrentStore = () => {
        setIsLoadingPriorities(true)
        SoupService.retrieveDataFromSoup(
            'StorePriority__c',
            {},
            [
                'Id',
                'PriorityId__c',
                'RetailStoreId__c',
                'is_executed__c',
                'AddedToCart__c',
                'StartDate__c',
                'Status__c',
                'Date_NoSale__c'
            ],
            `
                SELECT
                {StorePriority__c:Id},
                {StorePriority__c:PriorityId__c},
                {StorePriority__c:RetailStoreId__c},
                {StorePriority__c:is_executed__c},
                {StorePriority__c:AddedToCart__c},
                {StorePriority__c:StartDate__c},
                {StorePriority__c:Status__c},
                {StorePriority__c:Date_NoSale__c}
                FROM {StorePriority__c}
                WHERE {StorePriority__c:RetailStoreId__c} = '${retailStore.Id}'
                    AND {StorePriority__c:Is_Unpublished__c} != 1
                    AND {StorePriority__c:Status__c} IN ('${StorePriorityStatusC.action}', '${StorePriorityStatusC.noSale}', '${StorePriorityStatusC.snoozed}')
            `
        )
            .then(async (storePriorityRecords: unknown[]) => {
                const storePriorityData = storePriorityRecords as StorePriority[]

                setStorePriorities(storePriorityData)

                const addToCartPriorityIds: string[] = storePriorityData
                    .filter((item: StorePriority) => {
                        return item.AddedToCart__c === '1' && dayjs(item.StartDate__c).isAfter(new Date())
                    })
                    .map((filterItem) => filterItem.PriorityId__c)

                const exePriorityIds: string[] = storePriorityData
                    .filter((item: any) => item.is_executed__c === '1')
                    .map((filterItem) => filterItem.PriorityId__c)

                const noneActiveIds: string[] = storePriorityData
                    .filter((item: StorePriority) =>
                        [StorePriorityStatusC.snoozed, StorePriorityStatusC.noSale].includes(item.Status__c)
                    )
                    .map((filterItem) => filterItem.PriorityId__c)

                setExecutedPriorityIds(exePriorityIds)

                const showPriorityIds: any[] = storePriorityData
                    .filter((item: any) => {
                        return (
                            item.is_executed__c !== '1' &&
                            (item.AddedToCart__c !== '1' ||
                                (item.AddedToCart__c === '1' && !dayjs(item.StartDate__c).isAfter(new Date()))) &&
                            item.Status__c === StorePriorityStatusC.action
                        )
                    })
                    .map((filterItem) => filterItem.PriorityId__c)

                try {
                    // Avoid Error Log
                    const soupExecutionalFramework = BaseInstance.sfSoupEngine.localSoup.find(
                        (soup) => soup.soupName === EXECUTIONALFRAMEWORK
                    )
                    if (!_.isEmpty(soupExecutionalFramework)) {
                        const { showLocalPriorities, archivedLocalPriorities } = await getPrioritiesFromLocal(
                            showPriorityIds,
                            [...addToCartPriorityIds, ...exePriorityIds, ...noneActiveIds]
                        )
                        // To support empty state, we do not check length of data list
                        if (Array.isArray(archivedLocalPriorities)) {
                            const translatedTypeArchivedData = archivedLocalPriorities.map((element) => {
                                return priorityTypeTranslated(element)
                            })

                            // get priority file url from `ContentVersion`
                            const computedArchivedData: any = await computeSellingData(translatedTypeArchivedData)
                            setArchivedPriorities(computedArchivedData)
                        } else {
                            setArchivedPriorities([])
                        }

                        if (showLocalPriorities.length > 0) {
                            const translatedTypeShowData = showLocalPriorities.map((element) => {
                                return priorityTypeTranslated(element)
                            })

                            // get priority file url from `ContentVersion`
                            const computedShowData: any = await computeSellingData(translatedTypeShowData)

                            setCarouselSelling(computedShowData)
                            !shouldLandOnTab &&
                                !showInitLoadingIndicator &&
                                refreshFlag &&
                                setActiveCarouselTab(PRIORITIES)
                        } else {
                            setCarouselSelling([])
                            !exeItemId && !showInitLoadingIndicator && refreshFlag && setActiveCarouselTab(INNOVATION)
                        }
                        setPrioritiesTabReady(true)
                    }
                } catch (error) {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'OnlinePersona-getPriorityOfCurrentStore',
                        `Get Priority Of Store Id(${retailStore?.Id}):` + getStringValue(error)
                    )
                }
            })
            .catch((err) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'OnlinePersona-getPriority',
                    'Get Priority From Local DataBase:' + getStringValue(err)
                )
            })
            .finally(() => {
                setIsLoadingPriorities(false)
            })
    }

    useEffect(() => {
        if (retailStore?.Id && !isLoading && (isPersonaUGMOrSDL() || isPersonaPSR() || isPersonaKAM())) {
            getPriorityOfCurrentStore()
        }
    }, [retailStore?.Id, shouldLandOnTab, isLoading, refreshFlag, isFocused, exeItemId, searchText])

    useEffect(() => {
        const clearPriorityFiles = async () => {
            exeItemId && (await clearFilesWhenPriorityExecuted(exeItemId, dispatch))
        }
        clearPriorityFiles()
    }, [exeItemId])

    return {
        isLoadingPriorities,
        carouselSelling,
        activeCarouselTab,
        archivedPriorities,
        executedPriorityIds,
        prioritiesTabReady,
        storePriorities
    }
}

export const useInnovationSnapShotHook = (retailStoreId: string, searchText?: string, retailStore: any) => {
    const [innovaArr, setInnovaArr] = useState([])
    const [skuArr, setSkuArr] = useState([])
    const [isShow, setIsShow] = useState(false)
    useEffect(() => {
        SoupService.retrieveDataFromSoup(
            'StoreProduct',
            {},
            ['sumVolume', 'sumNetRevenue'],
            `SELECT 
                  COALESCE(SUM({StoreProduct:YTD_LCD_Vol__c}), 0),
                  COALESCE(SUM({StoreProduct:YTD_Net_Revenue__c}), 0)
                  FROM {StoreProduct} 
                  WHERE {StoreProduct:RetailStoreId}='${retailStoreId}'`
        ).then((res) => {
            setInnovaArr(res || [])
        })
    }, [retailStoreId, retailStore])

    useEffect(() => {
        const searchQuery =
            ` AND (COALESCE({StoreProduct:Product.Formatted_Sub_Brand_Name__c}, {StoreProduct:Product.Sub_Brand__c}) LIKE '%${searchText}%' ` +
            `OR COALESCE({StoreProduct:Product.Formatted_Flavor__c}, {StoreProduct:Product.Flavor_Name__c}) LIKE '%${searchText}%' ` +
            `OR COALESCE({StoreProduct:Product.Formatted_Package__c}, {StoreProduct:Product.Package_Type_Name__c}) LIKE '%${searchText}%') `
        SoupService.retrieveDataFromSoup(
            'StoreProduct',
            {},
            [
                'YTD_LCD_Vol__c',
                'YTD_Net_Revenue__c',
                'Formatted_Sub_Brand_Name__c',
                'Sub_Brand__c',
                'Formatted_Flavor__c',
                'Flavor_Name__c',
                'Formatted_Package__c',
                'Package_Type_Name__c'
            ],
            `SELECT 
                {StoreProduct:YTD_LCD_Vol__c},
                {StoreProduct:YTD_Net_Revenue__c},
                {StoreProduct:Product.Formatted_Sub_Brand_Name__c},
                {StoreProduct:Product.Sub_Brand__c},
                {StoreProduct:Product.Formatted_Flavor__c},
                {StoreProduct:Product.Flavor_Name__c},
                {StoreProduct:Product.Formatted_Package__c},
                {StoreProduct:Product.Package_Type_Name__c}
                FROM {StoreProduct} 
                WHERE {StoreProduct:RetailStoreId}='${retailStoreId}' 
                ${searchQuery}
                AND {StoreProduct:YTD_LCD_Vol__c} IS NOT NULL
                AND {StoreProduct:YTD_LCD_Vol__c} != '0' 
                ORDER BY {StoreProduct:YTD_LCD_Vol__c} DESC`
        ).then((res) => {
            if (_.size(res) === 0 && searchText.length === 0) {
                setIsShow(false)
            } else {
                setSkuArr(res || [])
                setIsShow(true)
            }
        })
    }, [searchText, retailStore])
    return { innovaArr, skuArr, isShow }
}

export const getRouteData = async (selectRoutes?: any[], searchText?: string) => {
    const searchString = searchText.length > 0 ? `AND GTMU_RTE_ID__c LIKE '%${searchText}%' ` : ''
    const routeData = await loadRoutesForSwitch(
        ` ${searchString} AND GTMU_RTE_ID__c!=NULL ORDER BY GTMU_RTE_ID__c ASC LIMIT 100 `
    )
    return routeData.map((item) => {
        const selectedItems =
            _.size(selectRoutes) > 0 ? selectRoutes.filter((selectItem) => selectItem.Id === item.Id) : []
        return {
            ...item,
            name: `${item.GTMU_RTE_ID__c || ''}`,
            select: _.size(selectedItems) > 0,
            Name: `${item.GTMU_RTE_ID__c || ''}`
        }
    })
}

export type ExecutionPicture = {
    imageUri: string
    sharepointUrl: string
    createdDate: string
    userId: string
    userName: string
}

type UseExecutionPicturesFunction = (storePriorityId: string) => {
    isLoading: boolean
    executionPictures?: ExecutionPicture[]
    load: ReturnType<typeof useCallback>
}

type FetchSharepointUrisFunction = (sharepointToken: string, filenames: string[]) => Promise<any>

const fetchSharepointUris: FetchSharepointUrisFunction = (sharepointToken, filenames) => {
    const reqList = []
    for (const filename of filenames) {
        const sharepointUrl = `${
            CommonApi.PBNA_MOBILE_SHAREPOINT_DOCUMENT_API
        }${'root:/Execution Photos/'}${filename}:/content`

        const req = fetch(sharepointUrl, {
            method: 'GET',
            headers: {
                'Content-Type': `application/octet-stream`,
                Authorization: `Bearer ${sharepointToken}`
            }
        })

        reqList.push(req)
    }
    return Promise.all(reqList)
        .then((resList) => {
            return Promise.all(resList.map((res) => res.blob()))
        })
        .then((blobList) => {
            return blobList.map((blob) => URL.createObjectURL(blob))
        })
}

async function fetchSharepointUrls(storePriorityId: string) {
    const query = `
                SELECT
                    Id,
                    ContentDocument.LatestPublishedVersionId,
                    ContentDocument.LatestPublishedVersion.StorePriority__c,
                    ContentDocument.LatestPublishedVersion.PathOnClient,
                    ContentDocument.LatestPublishedVersion.SharePoint_Url__c,
                    ContentDocument.LatestPublishedVersion.CreatedDate,
                    ContentDocument.LatestPublishedVersion.CreatedById,
                    ContentDocument.LatestPublishedVersion.CreatedBy.Id,
                    ContentDocument.LatestPublishedVersion.CreatedBy.Name
                FROM ContentDocumentLink
                WHERE LinkedEntityId = '${storePriorityId}'
                    And ContentDocument.LatestPublishedVersion.ContentGroup__c = 'Execution Photo'
                ORDER BY ContentDocument.LatestPublishedVersion.CreatedDate ASC
                `
    const res = await fetchObjInTime('ContentDocumentLink', query)

    return res
}

type GetExecutionPicturesFunction = (sharepointToken: string, storePriorityId: string) => Promise<ExecutionPicture[]>

const getExecutionPictures: GetExecutionPicturesFunction = async (sharepointToken: string, storePriorityId: string) => {
    const documentLinkReps = await fetchSharepointUrls(storePriorityId)

    if (!documentLinkReps) {
        return []
    }

    const imageUris = await fetchSharepointUris(
        sharepointToken,
        documentLinkReps.map((item) => item.ContentDocument.LatestPublishedVersion.PathOnClient)
    )

    return documentLinkReps?.map((item, idx) => {
        return {
            sharepointUrl: item.ContentDocument.LatestPublishedVersion.SharePoint_Url__c,
            imageUri: imageUris[idx] || null,
            createdDate: item.ContentDocument.LatestPublishedVersion.CreatedDate,
            userId: item.ContentDocument.LatestPublishedVersion.CreatedBy.Id,
            userName: item.ContentDocument.LatestPublishedVersion.CreatedBy.Name
        }
    })
}

// execution pictures cache in memory as development toolkit
const useCache = false
const epCache = new Map<string, ExecutionPicture[]>()

export const useExecutionPictures: UseExecutionPicturesFunction = (storePriorityId) => {
    const sharepointToken = useSharePointToken(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [executionPictures, setExecutionPictures] = useState<ExecutionPicture[]>()

    const load = useCallback(() => {
        if (sharepointToken && storePriorityId) {
            // As a possible optimization solution: loading from Cache
            // for now, useCache is Closed
            if (useCache) {
                const res = epCache.get(storePriorityId)
                if (res) {
                    setExecutionPictures(res)
                    return
                }
            }

            // loading from API
            setIsLoading(true)

            return getExecutionPictures(sharepointToken, storePriorityId)
                .then((items) => {
                    setExecutionPictures(items)
                    if (useCache) {
                        epCache.set(storePriorityId, items)
                    }
                })
                .catch(() => {
                    setExecutionPictures([])
                })
                .finally(() => {
                    setIsLoading(false)
                })
        }
    }, [sharepointToken, storePriorityId])

    return { isLoading, executionPictures, load }
}

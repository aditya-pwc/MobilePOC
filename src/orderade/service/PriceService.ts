/* eslint-disable camelcase */
/*
 * @Author: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Date: 2024-01-23 16:34:31
 * @LastEditors: Tom tong.jiang@pwc.com
 * @LastEditTime: 2024-03-29 12:08:24
 */
import _ from 'lodash'
import { addDaysToToday, todayDateWithTimeZone } from '../../common/utils/TimeZoneUtils'
import ProductData from '../domain/product/ProductData'
import PriceDM from '../domain/price/PriceDM'
import AccountData from '../domain/account/AccountData'
import PriceData from '../domain/price/PriceData'
import VisitDM from '../domain/visit/VisitDM'
import AccountDM from '../domain/account/AccountDM'
import ProductDM from '../domain/product/ProductDM'
import { CommonParam } from '../../common/CommonParam'
import RouteDM from '../domain/route/RouteDM'
import moment from 'moment'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getValidFieldData } from '../utils/CommonUtil'
import ProductService from './ProductService'
import { TmpFdPrc } from '../interface/TmpFdPrc'
import { ProductSKUType } from '../hooks/ProductSellingHooks'
import { StoreProduct } from '../interface/StoreProduct'
import { PriceIndexType, PricePriority } from '../enum/Common'
import { CartItem } from '../interface/CartItem'
import CartDM from '../domain/order/CartDM'
import OrderService from './OrderService'
import { round2Digit } from '../utils/OchUtils'

const productDM = new ProductDM()

class PriceService {
    static getPricePriorityMap = PriceDM.getPricePriorityMap

    static async priceCalculateProcess(store: any, activeProdIds: Array<string>, isInitSync?: boolean) {
        const today = todayDateWithTimeZone(true)
        const existPriceDataForStore = await PriceData.getExistPriceDataForStore(store)
        if (!_.isEmpty(existPriceDataForStore) && _.isEmpty(activeProdIds)) {
            return
        }
        const greaterThan6weeks: Array<any> = await PriceData.getGreaterThan6Weeks()
        const greaterThan6weeksValue = greaterThan6weeks[0].Value__c
        const todayGreaterThan6Week = addDaysToToday(Number(greaterThan6weeks[0].Value__c), true)
        const pricePriorityMap = await PriceData.getPricePriorityMap()
        let activeProdArr: Array<string>
        if (_.isEmpty(activeProdIds)) {
            activeProdArr = await ProductData.getAuthProductForCustomer(store)
        } else {
            activeProdArr = activeProdIds
        }
        const buId = await AccountDM.getRouteBuId()
        await PriceDM.getTypesOfPriceForStore({
            isInitSync,
            store,
            today,
            todayGreaterThan6Week,
            activeProdArr,
            buId,
            pricePriorityMap,
            greaterThan6weeksValue
        })
    }

    static async syncDownPricingDataForAdHocVisits(accountIds: Array<string>, isInitial = false) {
        let _accountIds = accountIds
        if (_.isEmpty(_accountIds)) {
            _accountIds = await VisitDM.getCustUniqIdsFromVisitOnOtherRoutes(true)
        }
        let accounts
        if (!_.isEmpty(_accountIds)) {
            accounts = await AccountDM.syncDownAccountAndCTR(_accountIds, isInitial)
        }
        if (accounts) {
            accounts = accounts.flat()
            const prodIds = await productDM.getAllProductMaterialIds()
            // Since we will sync down deal prod list data for deal
            // during initial sync for the current route,
            // we won't calculate this data again.
            // If there is not ctr for an route, the route will be a invalid route.
            await this.deltaSyncDownPricingData(null, prodIds, [], accounts)
            if (!isInitial) {
                await ProductService.syncDownStoreProduct(_accountIds, prodIds)
            }
        }
    }

    static async syncDownDealProductListData(productIds: string[]) {
        const userLocation = CommonParam.locationArr.find(
            (one) => one.SLS_UNIT_ID__c === CommonParam.userLocationId
        ) as any
        if (!userLocation) {
            return
        }
        const locations = await RouteDM.checkIfValidLocation()
        if (locations && locations.length === 0) {
            return
        }
        const currentRoute = locations[0]
        // batch fail, then pull data through api approach
        const today = moment().format(TIME_FORMAT.Y_MM_DD)
        const failDate = currentRoute?.DealProdList_Batch_Fail_Date__c
        if (failDate && moment(failDate).isSameOrBefore(today)) {
            const buId = await AccountData.getRouteBuId()
            return PriceDM.syncDownDealProductListByAPI(productIds, buId)
        }
        return PriceDM.syncDownDealProductListByCSV(userLocation.Id)
    }

    static async syncDownCustomerDealData() {
        if (!CommonParam.userRouteId) {
            return
        }
        const routes = await RouteDM.checkIfValidRoute()
        if (routes && routes.length === 0) {
            return
        }
        const currentRoute = routes[0]
        // batch fail, then pull data through api approach
        const today = moment().format(TIME_FORMAT.Y_MM_DD)
        const failDate = currentRoute?.CustDeal_Batch_Fail_Date__c
        if (failDate && moment(failDate).isSameOrBefore(today)) {
            const buId = await AccountDM.getRouteBuId()
            const routeAccounts = await AccountDM.getAccountsForPullingRelatedDataWhenCSVBatchFail()
            const routeAccountIds = _.uniq(_.map(routeAccounts, 'Id'))
            const routeAccountCustIds = _.uniq(_.map(routeAccounts, 'CUST_UNIQ_ID_VAL__c'))
            // We will not only pull data which cust_id__c is not null but also null from Customer_Deal__c(story 10693507)
            const bsPzIds = await AccountDM.getAccountBsAndPz(routeAccountIds)
            const bsIds = _.uniq(
                bsPzIds
                    ?.filter((item) => item.bsId)
                    .map((item) => parseInt(item.bsId as string).toString())
                    .filter((bsId) => !_.isEmpty(bsId) && !isNaN(Number(bsId)))
            )
            const pzIds = _.uniq(bsPzIds?.filter((item) => item.pzId).map((item) => item.pzId as string))
            return PriceDM.syncDownCustomerDealByAPI(buId, routeAccountCustIds, bsIds, pzIds)
        }
        return PriceDM.syncDownCustomerDealByCSV()
    }

    static async syncDownCustomerDealOtherRouteData() {
        if (!CommonParam.userRouteId) {
            return
        }
        try {
            const otherRetailStoreIds = await VisitDM.getCustUniqIdsFromVisitOnOtherRoutes()
            // We will not only pull data which cust_id__c is not null but also null from Customer_Deal__c(story 10693507)
            const accountIds = await VisitDM.getCustUniqIdsFromVisitOnOtherRoutes(true)
            const buId = await AccountData.getRouteBuId()
            const bsPzIds = await AccountData.getAccountBsAndPz(accountIds)
            const bsIds = _.uniq(
                bsPzIds
                    ?.filter((item) => item.bsId)
                    .map((item) => parseInt(item.bsId as string).toString())
                    .filter((bsId) => !_.isEmpty(bsId) && !isNaN(Number(bsId)))
            )
            const pzIds = _.uniq(bsPzIds?.filter((item) => item.pzId).map((item) => item.pzId as string))
            await PriceDM.syncDownCustomerDealByAPI(buId, otherRetailStoreIds, bsIds, pzIds)
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: sync down customer deal',
                `Sync down failed for other routes: ${CommonParam.userRouteId} ${ErrorUtils.error2String(e)}`
            )
        }
    }

    static async incrementalSyncPricingData(prodIds: Array<any>, dealProdListData: Array<any>) {
        try {
            const dateString = await AsyncStorage.getItem('configLastSyncTime')
            await this.deltaSyncDownPricingData(dateString, prodIds, dealProdListData)
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'incrementalSyncPricingData',
                'incrementalSyncPricingData failed' + ErrorUtils.error2String(e)
            )
        }
    }

    static async deltaSyncDownPricingData(
        dateString: string | null,
        prodIds: Array<any>,
        dealProdListData: Array<any> = [],
        AccountsOverride?: Array<any>
    ) {
        let Accounts = AccountsOverride
        if (!Accounts) {
            Accounts = await AccountDM.getCurRouteAccountData()
        }
        let regionCode
        if (!_.isEmpty(CommonParam.userRouteId)) {
            const routeData = await RouteDM.syncDownCurRoute()
            regionCode = routeData[0]?.Region_Code__c
        }
        if (!_.isEmpty(Accounts)) {
            const PZIds = getValidFieldData(Accounts, 'Pz_Id__c')
            const BsIds = getValidFieldData(Accounts, 'BUSN_SGMNTTN_LVL_1_CDV__c')
            let deltaExtraQuery = ''

            // if sync other route pricing data
            // we don't need is_active as filter, because we need full sync to nullify records as expected, so datastring is passed as ' '
            // also we don't need deltaExtraQuery, because it's a full sync, so we set it to empty string
            if (!AccountsOverride && dateString) {
                deltaExtraQuery = `AND LastModifiedDate >= ${dateString}`
            }

            if (AccountsOverride) {
                deltaExtraQuery = ''
            }
            await PriceDM.syncPricingData({
                PZIds,
                BsIds,
                regionCode,
                dateString,
                deltaExtraQuery,
                dealProdListData,
                prodIds
            })
        }
    }

    static syncDownPriceBookEntryData = PriceDM.syncDownPriceBookEntryData
    static syncDownCustomerDealForAdHocs = PriceDM.syncDownCustomerDealForAdHocs

    static async getTodayPlannedVisitPrice() {
        try {
            const allVisitsForToday = await VisitDM.getAllStoresForPriceCalculation()
            const needPreparePriceStore = allVisitsForToday?.map((visit) => {
                return {
                    CustUniqId: visit.CustUniqId,
                    AccountId: visit.AccountId
                }
            })
            const results = await Promise.allSettled(
                needPreparePriceStore?.map((storeInfo) => {
                    return PriceService.priceCalculateProcess(storeInfo, [], true)
                })
            )
            if (!_.isEmpty(results)) {
                results?.forEach((result) => {
                    if (result.status === 'rejected') {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'Orderade: getPriceInInitSyncForOneStore',
                            `getPriceInInitSyncForOneStore failed` + ErrorUtils.error2String(result.reason)
                        )
                    }
                })
            }
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getPriceInInitSync',
                `getPriceInInitSync failed` + ErrorUtils.error2String(err)
            )
        }
    }

    public static async getPriceGroupForAllProduct(
        allProducts: { 'Product.Material_Unique_ID__c': string }[],
        custUniqId: string,
        isReturn?: boolean,
        wholeSalePriority?: number | null
    ) {
        return await PriceDM.getPriceGroupForAllProduct(allProducts, custUniqId, isReturn, wholeSalePriority)
    }

    public static async initialize() {
        return await PriceDM.initialize()
    }

    public static getDefaultPricing(priceArr: TmpFdPrc[], quantity: string, relativeDelDate: number) {
        return PriceDM.getDefaultPricing(priceArr, quantity, relativeDelDate)
    }

    public static tryApplyVolumeHurdleToAll(curPackage: ProductSKUType, product: StoreProduct, index: number) {
        return PriceDM.tryApplyVolumeHurdleToAll(curPackage, product, index)
    }

    public static tryUpgradeVolumeHurdleIfForceDeal(
        product: StoreProduct,
        oldPriceIndex: number,
        quantity: string,
        relativeDelDate: number
    ) {
        return PriceDM.tryUpgradeVolumeHurdleIfForceDeal(product, oldPriceIndex, quantity, relativeDelDate)
    }

    public static async getMaximumWholeSalePriceForProduct(
        packageName: string,
        custUniqId: string,
        relativeDelDate: number
    ) {
        const priorityMap = await PriceDM.getPricePriorityMap()
        const wholeSalePriority = priorityMap.get(PricePriority.WHOLESALE_PRICE)
        if (wholeSalePriority) {
            const products = (await ProductDM.getProductByPackageName(packageName)) as unknown as {
                Material_Unique_ID__c: string
            }[]
            // get whole sale prices from same package cur store
            let records = await PriceDM.getWholeSalePriceRules(
                products.map((el) => el.Material_Unique_ID__c),
                [custUniqId],
                wholeSalePriority,
                relativeDelDate
            )
            if (!records.length) {
                // get prices from all packages cur store
                records = await PriceDM.getWholeSalePriceRules([], [custUniqId], wholeSalePriority, relativeDelDate)
            }
            if (!records.length) {
                // get price from all store under cur route
                const custUniqIdsCurRoute = (await AccountDM.getCustUniqIdsOnCurRoute()) as unknown as {
                    'Account.CUST_UNIQ_ID_VAL__c': string
                }[]
                records = await PriceDM.getWholeSalePriceRules(
                    [],
                    custUniqIdsCurRoute.map((el) => el['Account.CUST_UNIQ_ID_VAL__c']),
                    wholeSalePriority,
                    relativeDelDate
                )
            }
            const finalMax = Math.max(...records.map((el) => Number(el.Price)), 0)
            if (finalMax > 0) {
                return round2Digit(finalMax)
            }
        }
        const maxFromMeta = await PriceDM.getWholeSaleMaxPriceFromMeta()
        return round2Digit(Number(maxFromMeta))
    }

    public static checkProductPriceMissing(product: StoreProduct, isReturn?: boolean) {
        return PriceDM.checkProductPriceMissing(product, isReturn)
    }

    public static async checkVolumeHurdleNotMetPackages(cartData: CartItem[], orderCartIdentifier: string) {
        return await PriceDM.checkVolumeHurdleNotMetPackages(cartData, orderCartIdentifier)
    }

    static async recalculatePriceForProducts(
        cartItems: CartItem[],
        priceGroup: _.Dictionary<TmpFdPrc[]>,
        custUniqId: string,
        relativeDelDate: number
    ) {
        const returnPatches: {
            cartItem: CartItem
            priceRule: TmpFdPrc | null
        }[] = []
        for (const curCartItem of cartItems) {
            const priceArr = priceGroup[curCartItem.Product2.Material_Unique_ID__c] || []
            const { PriceIndex: oldPriceIndex, Quantity, UnitPrice: oldUnitPrice } = curCartItem
            const { index, priceDisplayRange } = PriceDM.getDefaultPricing(priceArr, Quantity, relativeDelDate)
            const oldPriceRule = priceArr[_.toNumber(oldPriceIndex)]
            let needReDefault = false
            let needReCheckManualInput = false
            // has selected price rule previously
            if (oldPriceRule) {
                // if previous rule is force, we can reDefault
                const oldIsForce = !PriceDM.allUnforcedDealsPriorities.includes(oldPriceRule.Priority)
                // if previous rule is unforced
                // we need to check for time valid and compatible with the new default priority to keep the previous one
                // if not we reDefault
                const oldRuleStillValid =
                    Number(oldPriceRule.Relative_Start_Value) <= relativeDelDate &&
                    Number(oldPriceRule.Relative_End_Value) >= relativeDelDate
                const oldRulePriorityStillMatch = priceDisplayRange.includes(oldPriceRule?.Priority)
                if (oldIsForce || !(oldRuleStillValid && oldRulePriorityStillMatch)) {
                    needReDefault = true
                }
                // has manual input price previously
                // reDefault when new available rules comes in
                // else need to reCheck cur input price max rule
            } else if (_.toNumber(oldPriceIndex) === PriceIndexType.MANUAL_INPUT) {
                // has default selected rule, or has options to pick from
                if (index >= 0 || priceDisplayRange.length) {
                    needReDefault = true
                } else {
                    needReCheckManualInput = true
                }
                // no price rule or manual input price previously so reDefault!!
            } else {
                needReDefault = true
            }
            needReDefault &&
                returnPatches.push({
                    cartItem: PriceDM.overwriteCartItemWithPriceRule(curCartItem, index, priceArr),
                    priceRule: priceArr[index]
                })
            if (needReCheckManualInput) {
                const newWholeSaleMax = await PriceService.getMaximumWholeSalePriceForProduct(
                    curCartItem.Product2.Package_Type_Name__c,
                    custUniqId,
                    relativeDelDate
                )
                if (_.toNumber(oldUnitPrice) > _.toNumber(newWholeSaleMax)) {
                    returnPatches.push({
                        cartItem: {
                            ...curCartItem,
                            UnitPrice: null,
                            PriceIndex: PriceIndexType.UNSELECTED.toString()
                        },
                        priceRule: null
                    })
                }
            }
        }
        return returnPatches
    }

    // on delivery date change, we need to check price rules are still valid
    // if not reset and let user fix the pricing
    static async recalculatePriceOnDeliveryDateChange(
        custUniqId: string,
        orderCartIdentifier: string,
        relativeDelDate: number,
        returnOrderSuffix?: string
    ) {
        await this.initialize()
        let saleableProds: CartItem[] = []
        let returnProds: CartItem[] = []
        if (returnOrderSuffix) {
            returnProds = await CartDM.getRawCartItems(orderCartIdentifier + returnOrderSuffix)
        } else {
            saleableProds = await CartDM.getRawCartItems(orderCartIdentifier)
        }
        let patches: {
            cartItem: CartItem
            priceRule: TmpFdPrc | null
        }[] = []
        let edvPendingUpdatePriceRules: TmpFdPrc[] = []
        // sellable prods have volume hurdle
        // return prods do not have
        // so have to getPriceGroupForAllProduct separately to handle
        if (saleableProds.length) {
            const priceGroup = await PriceDM.getPriceGroupForAllProduct(
                saleableProds.map((el) => {
                    return {
                        'Product.Material_Unique_ID__c': el.Product2.Material_Unique_ID__c
                    }
                }),
                custUniqId
            )
            patches = await this.recalculatePriceForProducts(saleableProds, priceGroup, custUniqId, relativeDelDate)
            edvPendingUpdatePriceRules = patches.map((el) => el.priceRule).filter((el) => !!el) as unknown as TmpFdPrc[]
        }
        if (returnProds.length) {
            const priceGroup = await PriceDM.getPriceGroupForAllProduct(
                returnProds.map((el) => {
                    return {
                        'Product.Material_Unique_ID__c': el.Product2.Material_Unique_ID__c
                    }
                }),
                custUniqId,
                true
            )
            patches = await this.recalculatePriceForProducts(returnProds, priceGroup, custUniqId, relativeDelDate)
        }
        if (patches.length) {
            await OrderService.saveCart(patches.map((el) => el.cartItem))
        }
        if (edvPendingUpdatePriceRules.length) {
            await ProductService.updateStoreProductEDV(edvPendingUpdatePriceRules)
        }
    }
}

export default PriceService

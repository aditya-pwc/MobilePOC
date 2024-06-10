/* eslint-disable camelcase */
import { Log } from '../../../common/enums/Log'
import { storeClassLog } from '../../../common/utils/LogUtils'
import AllForcedDealPrice from './pricingEngine/AllForcedDealPrice'
import BUPrice from './pricingEngine/BUPrice'
import CSGridDealPrice from './pricingEngine/CSGirdDealPrice'
import FlexFundPrice from './pricingEngine/NationalAccountPrice'
import OtherNonForcedPrice from './pricingEngine/OtherNonForcedPrice'
import PZBSGirdDealPrice from './pricingEngine/PZBSGirdDealPrice'
import SDCPrice from './pricingEngine/SDCPrice'
import VolumeHurdlePrice from './pricingEngine/VolumeHurdlePrice'
import WholeSalePrice from './pricingEngine/WholeSalePrice'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import _ from 'lodash'
import { getIdClause, isTrueInDB } from '../../../common/utils/CommonUtils'
import { PricePriority, PriceCustomerDealConstant, PriceIndexType } from '../../enum/Common'
import { ProductPatch, ProductSKUType } from '../../hooks/ProductSellingHooks'
import { CartItem } from '../../interface/CartItem'
import { StoreProduct } from '../../interface/StoreProduct'
import { TmpFdPrc } from '../../interface/TmpFdPrc'
import PriceData from './PriceData'
import ProductService from '../../service/ProductService'
import PriceSync from './PriceSync'
import CommonData from '../common/CommonData'
import AccountData from '../account/AccountData'
import ProductData from '../product/ProductData'

export interface VolumeHurdleLineType {
    Deal_Id__c: string
    Price: string
    Minimum_Quantity: string
    quantity: number
    searchMatch: string[]
    met: boolean
}

interface PricingDependentFields {
    PZIds?: string[]
    PriceZoneIds?: string[]
    BsIds?: string[]
    BSDDealIds?: string[]
    regionCode?: string
    prodIds?: Array<any>
}

interface SyncPricingDataParams {
    PZIds: string[]
    BsIds: string[]
    regionCode: string
    dateString: string | null
    deltaExtraQuery: string
    dealProdListData: any[]
    prodIds: string[]
}

export default class PriceDM {
    static pricePriorityMap: Map<string, string>

    // unforced deal priorities
    // all unforced = sdc + other unforced
    static allUnforcedDealsPriorities: string[]
    static sdcPriority: string
    static otherUnforcedDealsPriorities: string[]

    static async initialize() {
        if (this.pricePriorityMap) {
            return
        }
        return PriceData.getPricePriorityMap().then((pricePriorityMap) => {
            this.pricePriorityMap = pricePriorityMap
            this.sdcPriority = pricePriorityMap.get(PricePriority.SDC)
            this.otherUnforcedDealsPriorities = [
                pricePriorityMap.get(PricePriority.CS_GRID),
                pricePriorityMap.get(PricePriority.BU_QUERY_TARGET),
                pricePriorityMap.get(PricePriority.BUSINESS_SEGMENT_DEAL),
                pricePriorityMap.get(PricePriority.OTHER_DEALS),
                pricePriorityMap.get(PricePriority.WHOLESALE_PRICE)
            ]
            this.allUnforcedDealsPriorities = [this.sdcPriority, ...this.otherUnforcedDealsPriorities]
        })
    }

    static async getTypesOfPriceForStore(props: any) {
        const {
            isInitSync,
            store,
            today,
            todayGreaterThan6Week,
            activeProdArr,
            buId,
            pricePriorityMap,
            greaterThan6weeksValue
        } = props
        try {
            !isInitSync && global.$globalModal.openModal()
            await WholeSalePrice.getProdWholeSalePrice(
                store,
                today,
                todayGreaterThan6Week,
                activeProdArr,
                buId,
                pricePriorityMap,
                greaterThan6weeksValue
            )
            await VolumeHurdlePrice.getVolumeHurdlePrice(
                store,
                today,
                todayGreaterThan6Week,
                activeProdArr,
                buId,
                pricePriorityMap,
                greaterThan6weeksValue
            )
            await CSGridDealPrice.getCSGirdDeals(
                activeProdArr,
                store,
                today,
                greaterThan6weeksValue,
                buId,
                pricePriorityMap.get(PricePriority.CS_GRID)
            )
            await FlexFundPrice.getProdFlexFundPrice(
                store,
                today,
                todayGreaterThan6Week,
                activeProdArr,
                buId,
                pricePriorityMap,
                greaterThan6weeksValue
            )
            await PZBSGirdDealPrice.getPriceZoneBusinessSegmentGirdDeals(
                activeProdArr,
                store,
                today,
                greaterThan6weeksValue,
                buId,
                pricePriorityMap.get(PricePriority.BUSINESS_SEGMENT_DEAL)
            )
            await SDCPrice.getSDCPrice(
                store,
                today,
                todayGreaterThan6Week,
                activeProdArr,
                buId,
                pricePriorityMap,
                greaterThan6weeksValue
            )
            await AllForcedDealPrice.getAllForcedDealPrice(
                store,
                today,
                todayGreaterThan6Week,
                activeProdArr,
                buId,
                pricePriorityMap,
                greaterThan6weeksValue
            )
            await BUPrice.getBuPrice(
                store,
                today,
                todayGreaterThan6Week,
                activeProdArr,
                buId,
                pricePriorityMap,
                greaterThan6weeksValue
            )
            await OtherNonForcedPrice.getOtherNonForcedPrice(
                store,
                today,
                todayGreaterThan6Week,
                activeProdArr,
                buId,
                pricePriorityMap,
                greaterThan6weeksValue
            )
        } catch (e) {
            await PriceData.deleteDataFromTempTable(store)
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: priceCalculateProcess',
                `priceCalculateProcess failed` + ErrorUtils.error2String(e)
            )
        } finally {
            !isInitSync &&
                setTimeout(() => {
                    global.$globalModal.closeModal()
                }, 1000)
        }
    }

    // set default pricing rule for single product
    static getDefaultPricing(
        priceArr: TmpFdPrc[],
        quantity: string,
        relativeDelDate: number
    ): { index: number; priceDisplayRange: string[] } {
        priceArr.forEach((priceItem, index) => {
            priceItem.index = index
        })
        let index = priceArr?.findIndex(
            (priceItem) =>
                Number(priceItem.Relative_Start_Value) <= relativeDelDate &&
                Number(priceItem.Relative_End_Value) >= relativeDelDate
        )
        let curDefault = priceArr[index]

        // if curDefault is a forced deal
        // we need to downgrade to find the one with minimum quantity matching current quantity
        if (curDefault && curDefault.Priority === this.pricePriorityMap.get(PricePriority.BASE_NATIONAL_PRICE)) {
            const volumeHurdleMetPrices = priceArr.filter((priceItem) => {
                return (
                    Number(priceItem.Relative_Start_Value) <= relativeDelDate &&
                    Number(priceItem.Relative_End_Value) >= relativeDelDate &&
                    priceItem.Priority === curDefault.Priority &&
                    Number(priceItem.Minimum_Quantity) <= Number(quantity)
                )
            })
            volumeHurdleMetPrices.sort((a, b) => {
                return Number(b.Minimum_Quantity) - Number(a.Minimum_Quantity)
            })
            if (volumeHurdleMetPrices?.[0]) {
                curDefault = volumeHurdleMetPrices[0]
                index = volumeHurdleMetPrices[0].index as number
            }
        }

        // priorities array tells which price rules to be displayed to user
        let priceDisplayRange: string[] = []

        // if sdc has multiple rules, all user to select, but first put price as empty
        const sdcPriority = this.sdcPriority
        const otherUnforcedDealsPriorities = this.otherUnforcedDealsPriorities
        if (curDefault?.Priority === sdcPriority) {
            const allSDCs = priceArr.filter(
                (priceItem) =>
                    priceItem.Priority === sdcPriority &&
                    Number(priceItem.Relative_Start_Value) <= relativeDelDate &&
                    Number(priceItem.Relative_End_Value) >= relativeDelDate
            )
            if (allSDCs.length > 1) {
                index = -1
                priceDisplayRange = [sdcPriority]
            }
        } else if (otherUnforcedDealsPriorities.includes(curDefault?.Priority)) {
            const allOtherPriorities = priceArr.filter(
                (priceItem) =>
                    otherUnforcedDealsPriorities.includes(priceItem.Priority) &&
                    Number(priceItem.Relative_Start_Value) <= relativeDelDate &&
                    Number(priceItem.Relative_End_Value) >= relativeDelDate
            )
            if (allOtherPriorities.length > 1) {
                index = -1
                priceDisplayRange = otherUnforcedDealsPriorities
            }
        }
        return {
            index,
            priceDisplayRange
        }
    }

    // get volume hurlde banner info for each package
    static getVolumeHurldeInfo = (products: StoreProduct[]) => {
        const volumeHurdleLineMap = products.reduce((a: any, b) => {
            const curPriceRule = b.priceArr[b.priceIndex]
            const curQuantity = parseInt(b.quantity || '0')
            if (curPriceRule) {
                const { Minimum_Quantity, Deal_Id__c, Price, Force_Deal_Flag__c } = curPriceRule
                if (!isTrueInDB(Force_Deal_Flag__c) && parseInt(Minimum_Quantity) > 0 && Deal_Id__c) {
                    a[Deal_Id__c] = a[Deal_Id__c] || {
                        Deal_Id__c,
                        Price,
                        Minimum_Quantity,
                        quantity: 0,
                        searchMatch: []
                    }
                    a[Deal_Id__c].quantity += curQuantity
                    a[Deal_Id__c].searchMatch.push(b.searchMatch)
                } else if (isTrueInDB(Force_Deal_Flag__c) && parseInt(Minimum_Quantity) > 0) {
                    // for forced deal volume hurdle, there is no deal id, we use inven id as key
                    a[b['Product.Material_Unique_ID__c']] = {
                        Deal_Id__c: b['Product.Material_Unique_ID__c'],
                        Price,
                        Minimum_Quantity,
                        quantity: curQuantity,
                        searchMatch: [b.searchMatch]
                    }
                }
            }
            return a
        }, {})
        const volumeHurdleLines = _.values(volumeHurdleLineMap) as VolumeHurdleLineType[]

        return volumeHurdleLines
            .filter((el) => {
                // when search, only show volume hurdle banner should be shown only when
                // at least one product is visible in search
                return el.searchMatch.some((el) => isTrueInDB(el))
            })
            .map((el) => {
                return {
                    ...el,
                    met: el.quantity === 0 || el.quantity >= parseInt(el.Minimum_Quantity)
                }
            })
    }

    // try upgrade volume hurdle rules automatically for force deals
    static tryUpgradeVolumeHurdleIfForceDeal(
        product: StoreProduct,
        oldPriceIndex: number,
        quantity: string,
        relativeDelDate: number
    ) {
        const { priceArr } = product
        const { Force_Deal_Flag__c } = priceArr[oldPriceIndex] || {}
        // only upgrade for forced deal volume hurdle
        // only upgrade to deal with same priority but higher minimum_quantity
        if (isTrueInDB(Force_Deal_Flag__c)) {
            const { index } = this.getDefaultPricing(priceArr, quantity, relativeDelDate)
            return index
        }
        return oldPriceIndex
    }

    // try apply unforced volume hurdle to all products
    static tryApplyVolumeHurdleToAll(curPackage: ProductSKUType, product: StoreProduct, index: number): ProductPatch[] {
        const curRule = product.priceArr[index]
        const curDealId = curRule?.Deal_Id__c
        const curMinimumQuantity = _.toNumber(curRule?.Minimum_Quantity)
        const curUnitPrice = curRule?.Price || '0'
        const curPriority = curRule?.Priority
        const edvPatch = ProductService.getStoreProductEDV(curRule) ?? {}

        // try apply to all only if it's volume hurdle with minimum quantity > 0 and unforced deal
        if (curMinimumQuantity > 0 && this.allUnforcedDealsPriorities.includes(curPriority)) {
            const productPatches = curPackage.products
                .filter((one) => {
                    const { priceDisplayRange } = this.getDefaultPricing(
                        one.priceArr,
                        one.quantity,
                        one.relativeDelDate
                    )
                    const isSelf = one.ProductId === product.ProductId
                    const targetPriceRuleValid = one.priceArr.some((price) => {
                        return (
                            price.Deal_Id__c === curDealId &&
                            Number(price.Relative_Start_Value) <= one.relativeDelDate &&
                            Number(price.Relative_End_Value) >= one.relativeDelDate
                        )
                    })
                    const targetPriceRulePriorityMatch = priceDisplayRange.includes(curPriority)
                    const priceNotSelected = _.toNumber(one.priceIndex <= -1)
                    // apply to products which do not have price and SELF
                    if (isSelf || (targetPriceRuleValid && targetPriceRulePriorityMatch && priceNotSelected)) {
                        return true
                    }
                    return false
                })
                .map((one) => {
                    const index = one.priceArr.findIndex((price) => {
                        return (
                            price.Deal_Id__c === curDealId &&
                            Number(price.Relative_Start_Value) <= one.relativeDelDate &&
                            Number(price.Relative_End_Value) >= one.relativeDelDate
                        )
                    })
                    return {
                        ProductId: one.ProductId,
                        priceIndex: index,
                        quantity: one.quantity,
                        unitPrice: curUnitPrice,
                        product: one,
                        curPriceRule: one.priceArr[index],
                        ...edvPatch
                    }
                })
            ProductService.updateStoreProductEDV(productPatches.map((el) => el.curPriceRule))
            return productPatches
        }
        // if not volume hurlde only update the current product
        ProductService.updateStoreProductEDV([curRule])
        return [
            {
                ProductId: product.ProductId,
                priceIndex: index,
                quantity: product.quantity,
                unitPrice: curUnitPrice,
                product,
                ...edvPatch
            }
        ]
    }

    static async checkVolumeHurdleNotMetPackages(cartData: CartItem[], orderCartIdentifier: string): Promise<string[]> {
        await this.initialize()
        cartData.forEach((el) => {
            el['Product2.Package_Type_Name__c'] =
                el['Product2.Package_Type_Name__c'] || el.Product2.Package_Type_Name__c
        })
        const packageGrouped = _.groupBy(
            cartData.filter((one) => one.OrderCartIdentifier === orderCartIdentifier),
            'Product2.Package_Type_Name__c'
        )
        return _.values(packageGrouped)
            .map((cartItems) => {
                const forcedVolumeHurdleOk = cartItems.every((el) => {
                    const minQuantity = _.toNumber(el.Minimum_Quantity)
                    const curQuantity = _.toNumber(el.Quantity)
                    if (minQuantity > 0 && curQuantity > 0 && !this.allUnforcedDealsPriorities.includes(el.Priority)) {
                        return curQuantity >= minQuantity
                    }
                    return true
                })
                const unforcedVolumeHurdleMap = cartItems.reduce((a: any, el) => {
                    const minQuantity = _.toNumber(el.Minimum_Quantity)
                    if (minQuantity > 0 && this.allUnforcedDealsPriorities.includes(el.Priority)) {
                        a[el.Deal_Id__c] = a[el.Deal_Id__c] || {
                            minQuantity,
                            quantity: 0
                        }
                        a[el.Deal_Id__c].quantity += _.toNumber(el.Quantity)
                    }
                    return a
                }, {})
                const unforcedVolumeHurldeOK = _.values(unforcedVolumeHurdleMap).every((el) => {
                    return el.quantity === 0 || el.quantity >= el.minQuantity
                })
                return (
                    forcedVolumeHurdleOk && unforcedVolumeHurldeOK ? '' : cartItems[0]['Product2.Package_Type_Name__c']
                ) as string
            })
            .filter((el) => !!el)
            .sort()
    }

    static overwriteCartItemWithPriceRule(cartItem: CartItem, priceIndex: number, priceArr: TmpFdPrc[]): CartItem {
        const curPriceRule = priceArr[priceIndex]
        return {
            ...cartItem,
            PriceIndex: priceIndex.toString(),
            UnitPrice: curPriceRule?.Price || '0',
            Deal_Id__c: curPriceRule?.Deal_Id__c || '',
            Minimum_Quantity: curPriceRule?.Minimum_Quantity || '0',
            Priority: curPriceRule?.Priority || ''
        }
    }

    static checkProductPriceMissing(product: StoreProduct, isReturn?: boolean) {
        if (!isReturn) {
            return _.toNumber(product.priceIndex) < 0 && _.toNumber(product.quantity)
        }
        const hasCases =
            _.toNumber(product.breakageCases ?? '0') +
                _.toNumber(product.breakageUnits ?? '0') +
                _.toNumber(product.saleableCases ?? '0') +
                _.toNumber(product.saleableUnits ?? '0') +
                _.toNumber(product.outOfDateCases ?? '0') +
                _.toNumber(product.outOfDateUnits ?? '0') >
            0
        return hasCases && _.toNumber(product.priceIndex) === PriceIndexType.UNSELECTED
    }

    static syncDownDealProductListByCSV = PriceSync.syncDownDealProductListByCSV
    static syncDownCustomerDealByCSV = PriceSync.syncDownCustomerDealByCSV
    static retrieveLocalPZData = PriceData.retrieveLocalPZData

    public static async getPriceGroupForAllProduct(
        allProducts: { 'Product.Material_Unique_ID__c': string }[],
        custUniqId: string,
        isReturn?: boolean,
        wholeSalePriority?: number | null
    ) {
        return await PriceData.getPriceGroupForAllProduct(allProducts, custUniqId, isReturn, wholeSalePriority)
    }

    static getWholeSalePriceRules = PriceData.getWholeSalePriceRules
    static getPricePriorityMap = PriceData.getPricePriorityMap
    static getWholeSaleMaxPriceFromMeta = PriceData.getWholeSaleMaxPriceFromMeta

    public static async syncPricingData(params: SyncPricingDataParams) {
        const { PZIds, BsIds, regionCode, dateString, deltaExtraQuery, dealProdListData, prodIds } = params
        const shouldPullPricingData = (PricingDependentFields: PricingDependentFields, objName: string) => {
            const { PZIds, BsIds, regionCode, BSDDealIds, prodIds, PriceZoneIds } = PricingDependentFields
            switch (objName) {
                case 'Price_Zone__c':
                    return !_.isEmpty(PZIds)
                case 'Business_Segment_Deal__c':
                    return !_.isEmpty(PriceZoneIds) && !_.isEmpty(BsIds)
                case 'Deal__c':
                    return !_.isEmpty(regionCode) && !_.isEmpty(BSDDealIds)
                case 'Natl_Account_Pricing__c':
                    return !_.isEmpty(prodIds) && !_.isEmpty(regionCode)
                case 'Wholesale_Price__c':
                    return !_.isEmpty(prodIds) && !_.isEmpty(regionCode) && !_.isEmpty(PriceZoneIds)
                default:
                    return false
            }
        }
        const priceZoneSyncFields = CommonData.getAllFieldsByObjName('Price_Zone__c', 'Remote')
        const dealSyncFields = CommonData.getAllFieldsByObjName('Deal__c', 'Remote')
        const BSDSyncFields = CommonData.getAllFieldsByObjName('Business_Segment_Deal__c', 'Remote')
        const NAPSyncFields = CommonData.getAllFieldsByObjName('Natl_Account_Pricing__c', 'Remote')
        const WSPSyncFields = CommonData.getAllFieldsByObjName('Wholesale_Price__c', 'Remote')
        try {
            let BSDDealIds: Array<any>
            let BSDData = []
            let PriceZoneIds: Array<string> = []
            if (shouldPullPricingData({ PZIds }, 'Price_Zone__c')) {
                const priceZoneData = await PriceSync.syncDownPriceZone(
                    dateString,
                    PZIds,
                    deltaExtraQuery,
                    priceZoneSyncFields
                )
                if (dateString) {
                    PriceZoneIds = await PriceData.retrieveLocalPZData(PZIds)
                } else if (!_.isEmpty(priceZoneData)) {
                    PriceZoneIds = priceZoneData.map((priceZoneRecord) => `${priceZoneRecord?.Pz_Id__c}`)
                }
            }
            if (shouldPullPricingData({ PriceZoneIds, BsIds }, 'Business_Segment_Deal__c')) {
                BSDData = await PriceSync.syncDownBusinessSegmentDeal(
                    dateString,
                    PriceZoneIds,
                    BsIds,
                    deltaExtraQuery,
                    BSDSyncFields
                )
            }
            if (!_.isEmpty(BSDData)) {
                BSDDealIds = _.uniq(
                    BSDData.map((BSD) => BSD?.Deal_Id__c)
                        .filter((Id) => Id !== null && Id !== 'null')
                        .concat(_.isEmpty(dealProdListData) ? [] : dealProdListData)
                )
            } else {
                BSDDealIds = _.isEmpty(dealProdListData) ? [] : dealProdListData
            }
            if (shouldPullPricingData({ BSDDealIds, regionCode }, 'Deal__c')) {
                await PriceSync.syncDownDeal(BSDDealIds, dateString, regionCode, deltaExtraQuery, dealSyncFields)
            }
            if (shouldPullPricingData({ prodIds, regionCode }, 'Natl_Account_Pricing__c')) {
                await PriceSync.syncDownNatlAccountPricing(
                    prodIds,
                    dateString,
                    regionCode,
                    deltaExtraQuery,
                    NAPSyncFields
                )
            }
            if (shouldPullPricingData({ prodIds, regionCode, PriceZoneIds }, 'Wholesale_Price__c')) {
                await PriceSync.syncDownWholesalePrice(
                    prodIds,
                    dateString,
                    PriceZoneIds,
                    regionCode,
                    deltaExtraQuery,
                    WSPSyncFields
                )
            }
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: fetchPricingData',
                `fetchPricingData failed: ` + ErrorUtils.error2String(e)
            )
        }
    }

    private static async syncDownCustomerDealOfCSGridByAPI(
        routeAccountCustIds: string[],
        customerDealFields: string[]
    ) {
        try {
            // step 1
            const condition1 = `IsActive__c = TRUE AND Type__c = '${PriceCustomerDealConstant.CD_TYPE_CGC}' 
                AND Cust_Id__c IN {BatchIds}`
            const customerGroupIds = _.flatten(
                await PriceSync.syncDownCustomerDealByAPI(routeAccountCustIds, condition1, customerDealFields, true)
            )
                .filter((item) => item.Customer_Group_ID__c)
                .map((item) => parseInt(item.Customer_Group_ID__c + ''))
            // step 2
            if (customerGroupIds.length === 0) {
                return
            }
            const condition2 = `IsActive__c = TRUE AND Type__c = '${PriceCustomerDealConstant.CD_TYPE_CGM}' 
                AND Customer_Group_Member_ID__c IN {BatchIds}`
            const getIdClauseOverride = function (arrays: number[]) {
                return arrays.join(',')
            }
            const customerGroupIds2 = _.flatten(
                await PriceSync.syncDownCustomerDealByAPI(
                    customerGroupIds,
                    condition2,
                    customerDealFields,
                    true,
                    getIdClauseOverride
                )
            )
                .filter((item) => item.Customer_Group_ID__c)
                .map((item) => parseInt(item.Customer_Group_ID__c + ''))
            // step 3
            if (customerGroupIds2.length === 0) {
                return
            }
            const condition3 = `Delete_Flag__c = FALSE AND Type__c = '${PriceCustomerDealConstant.CD_TYPE_QTV}' 
                AND Target_Name__c = '${PriceCustomerDealConstant.CD_TARGET_NAME_CG}' 
                AND Target_Value_Number__c IN {BatchIds}`
            const queryTargetIds = _.flatten(
                await PriceSync.syncDownCustomerDealByAPI(customerGroupIds2, condition3, customerDealFields, true)
            )
                .filter((item) => item.Query_Target_Id__c)
                .map((item) => item.Query_Target_Id__c)
            // step 4
            if (queryTargetIds.length === 0) {
                return
            }
            const condition4 = `IsActive__c = TRUE AND Type__c = '${PriceCustomerDealConstant.CD_TYPE_TL}' 
                AND Target_Field__c = '${PriceCustomerDealConstant.CD_TARGET_NAME_CQT}' 
                AND Target_Table_Id__c IN {BatchIds}`
            await PriceSync.syncDownCustomerDealByAPI(
                queryTargetIds,
                condition4,
                customerDealFields,
                true,
                getIdClauseOverride
            )
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: syncDownCustomerDealOfCSGridByAPI',
                `syncDownCustomerDealOfCSGridByAPI failed: ${ErrorUtils.error2String(err)}`
            )
        }
    }

    public static async syncDownCustomerDealByAPI(
        buId: string,
        routeAccountCustIds: string[],
        bsIds?: string[],
        pzIds?: string[]
    ) {
        const customerDealFields = CommonData.getAllFieldsByObjName('Customer_Deal__c', 'Remote')
        let customerDealCon = `(
            Type__c = '${PriceCustomerDealConstant.CD_TYPE_TL}' 
            AND Target_Field__c = '${PriceCustomerDealConstant.CD_TARGET_FIELD_QT}'
            AND IsActive__c = TRUE
            AND Bu_Id__c = '${buId}'
        )`
        if (buId) {
            customerDealCon = `${customerDealCon} OR 
            (Cust_Id__c IN {BatchIds} AND IsActive__c = TRUE AND Bu_Id__c = '${buId}')
            OR (
                Target_Value_Number__c = '${buId.replaceAll('_RE', '')}'
                AND Delete_Flag__c = FALSE
                AND Type__c = '${PriceCustomerDealConstant.CD_TYPE_QTV}'
                AND Target_Name__c = '${PriceCustomerDealConstant.CD_TARGET_NAME_BU}' 
            )`
        }
        if (bsIds && bsIds.length > 0) {
            customerDealCon = `${customerDealCon} OR (
                Target_Value_Number__c IN (${getIdClause(bsIds)}) 
                AND Delete_Flag__c = FALSE 
                AND Type__c = '${PriceCustomerDealConstant.CD_TYPE_QTV}' 
                AND Target_Name__c = '${PriceCustomerDealConstant.CD_TARGET_NAME_BS}'
            )`
        }
        if (pzIds && pzIds.length > 0) {
            customerDealCon = `${customerDealCon} OR (
                Target_Value_Number__c IN (${getIdClause(pzIds)}) 
                AND Delete_Flag__c = FALSE
                AND Type__c = '${PriceCustomerDealConstant.CD_TYPE_QTV}'
                AND Target_Name__c = '${PriceCustomerDealConstant.CD_TARGET_NAME_PZ}'
            )`
        }
        await PriceSync.syncDownCustomerDealByAPI(routeAccountCustIds, customerDealCon, customerDealFields)

        // CS Grid API
        await this.syncDownCustomerDealOfCSGridByAPI(routeAccountCustIds, customerDealFields)
    }

    public static async syncDownCustomerDealForAdHocs(accountIds: Array<string>, custUniqIds: Array<any>) {
        const buId = await AccountData.getRouteBuId()
        const bsPzIds = await AccountData.getAccountBsAndPz(accountIds)
        const bsIds = _.uniq(
            bsPzIds
                ?.filter((item) => item.bsId)
                .map((item) => parseInt(item.bsId as string).toString())
                .filter((bsId) => !_.isEmpty(bsId) && !isNaN(Number(bsId)))
        )
        const pzIds = _.uniq(bsPzIds?.filter((item) => item.pzId).map((item) => item.pzId as string))
        await PriceDM.syncDownCustomerDealByAPI(buId, custUniqIds, bsIds, pzIds)
    }

    public static async syncDownDealProductListByAPI(inventoryIds: string[], buId: string) {
        const dealProductListFields = CommonData.getAllFieldsByObjName('Deal_Product_List__c', 'Remote')
        return await PriceSync.syncDownDealProductListByAPI(inventoryIds, buId, dealProductListFields)
    }

    static async syncDownPriceBookEntryData() {
        const pricebookEntrySyncFields = CommonData.getAllFieldsByObjName('PricebookEntry', 'Remote')
        const productData = await ProductData.retrieveProductIdsFromSoup()
        await PriceSync.syncDownPriceBookEntryData(pricebookEntrySyncFields, productData)
    }
}

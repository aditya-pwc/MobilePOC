/* eslint-disable camelcase */
import { formatPrice } from '../utils/PriceUtils'
import { TmpFdPrc } from '../interface/TmpFdPrc'
import ProductDM from '../domain/product/ProductDM'
import { EDVDealCategoryCodes } from '../enum/Common'
import Regex from '../constants/Regex'
import PriceDM from '../domain/price/PriceDM'
import { ReturnCartItem, ReturnProduct } from '../interface/ReturnProduct'
import { MyDayVisitModel } from '../interface/MyDayVisit'
import { RouteFrequencyMapping } from '../constants/RouteFrequencyMapping'
import { CommonParam } from '../../common/CommonParam'
import RouteDM from '../domain/route/RouteDM'
import moment from 'moment'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import _ from 'lodash'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import AccountDM from '../domain/account/AccountDM'
import VisitDM from '../domain/visit/VisitDM'
import { batchSynDown } from '../utils/CommonUtil'
import React from 'react'
import { t } from '../../common/i18n/t'
import CommonService from './CommonService'
import SyncUpService from './SyncUpService'

const productDM = new ProductDM()
export interface EdvPatch {
    EDV_Qty__c: string
    EDV_Price__c: string
    AP_Unique_ID__c: string
}
class ProductService {
    static readonly deactivateStoreProduct = ProductDM.deactivateStoreProduct

    public static async syncUpStoreProducts() {
        const fieldList = [
            'Id',
            'ProductId',
            'StartDate',
            'RecordTypeId',
            'Is_Visible_Product__c',
            'AccountId',
            'AP_Unique_ID__c',
            'EDV_Price__c',
            'EDV_Qty__c'
        ]
        await productDM.syncUpStoreProductsByFieldList(fieldList)
    }

    public static async updateStoreProductQTYAndPrice(storeProductUniqIds: string[], qty: any, price: any) {
        await productDM.updateStoreProductQTYAndPrice(storeProductUniqIds, qty, price)
    }

    public static getProductForReturnScreen(props: any) {
        const { searchText, custUniqId, orderCartIdentifier, pageName, relativeDelDate, curListActive, storeId } = props
        const packageNameQuery = productDM.getPackageNameQuery(searchText, custUniqId, orderCartIdentifier, pageName)

        const transformRecords = async (packageNames: Array<any>) => {
            await PriceDM.initialize()
            if (packageNames.length) {
                const allProducts = await productDM.getProductByPackageName(
                    searchText,
                    custUniqId,
                    packageNames,
                    orderCartIdentifier,
                    pageName
                )
                const priceGroup = await PriceDM.getPriceGroupForAllProduct(allProducts, custUniqId, true)
                return packageNames.map((packageName) => {
                    const packageNameString = packageName.Package_Type_Name__c
                    const products = allProducts
                        .filter((prod) => prod['Product.Package_Type_Name__c'] === packageNameString)
                        .map((prod) => {
                            let index: number = -1
                            const priceArr = (priceGroup[prod['Product.Material_Unique_ID__c']] ||
                                []) as unknown as TmpFdPrc[]
                            priceArr.forEach((el, index) => {
                                el.label = `$${formatPrice(el.Price)} | ${el.Deal_Name__c || ''}`
                                el.index = index
                            })
                            // last selected pricing rule
                            let priceDisplayRange: string[] = []
                            if (relativeDelDate >= 0) {
                                ;({ index, priceDisplayRange } = PriceDM.getDefaultPricing(
                                    priceArr,
                                    '0',
                                    relativeDelDate
                                ))
                            }
                            if (parseFloat(prod.unitPrice) === 0 && parseInt(prod.priceIndex.toString()) === -1) {
                                prod.priceIndex = index
                                prod.unitPrice = priceArr[index]?.Price || '0'
                            }
                            return {
                                ...prod,
                                Is_Visible_Product__c: false,
                                priceArr,
                                priceDisplayRange,
                                relativeDelDate,
                                visitId: storeId,
                                custUniqId
                            }
                        })
                    const isActive = curListActive
                    return {
                        label: packageNameString,
                        isActive,
                        products
                    }
                })
            }
            return []
        }
        return { packageNameQuery, transformRecords }
    }

    public static async createNewCursorForProductList(
        soupName: string,
        query: string,
        fields: string[],
        PAGE_SIZE?: number
    ) {
        return await productDM.createNewCursorForProductList(soupName, query, fields, PAGE_SIZE)
    }

    static getStoreProductEDV(priceRule: TmpFdPrc) {
        if (!priceRule) {
            return
        }
        const { Deal_Name__c, Deal_Category_Code__c, Cust_Id__c, Inven_Id__c } = priceRule
        if (Deal_Name__c && Deal_Category_Code__c === EDVDealCategoryCodes.EDV) {
            const temp = Regex.EDVPriceRegex.exec(Deal_Name__c)
            if (temp && temp.length > 0) {
                const edvValue = temp[0].trim().split('/$')
                const uniqId = Cust_Id__c + '_' + Inven_Id__c
                return {
                    EDV_Qty__c: edvValue[0],
                    EDV_Price__c: edvValue[1],
                    AP_Unique_ID__c: uniqId
                }
            }
        }
    }

    // when change delivery date, new price rules will be set
    // need to batch update edv on store product
    static async updateStoreProductEDV(priceRules: TmpFdPrc[]) {
        const storeProductPatches = priceRules.reduce((a: EdvPatch[], curPriceRule: TmpFdPrc) => {
            const patch = this.getStoreProductEDV(curPriceRule)
            patch && (a = [...a, patch])
            return a
        }, [])
        if (storeProductPatches.length) {
            const localRecords = await ProductDM.getStoreProductsByUniqueIds(storeProductPatches)
            const patchedRecords = localRecords.map((el) => {
                const patch = storeProductPatches.find((one) => one.AP_Unique_ID__c === el.AP_Unique_ID__c) ?? {}
                return {
                    ...el,
                    ...patch
                }
            })
            await ProductDM.upsertStoreProductIntoSoup(patchedRecords)
            SyncUpService.syncUpLocalData()
        }
    }

    public static async getCardItemBySoupEntryId(cartItemSoupEntryId?: string) {
        return cartItemSoupEntryId ? await productDM.getCardItemBySoupEntryId(cartItemSoupEntryId) : []
    }

    public static async getCartItemRecord(
        cartPatch: object,
        store: MyDayVisitModel,
        id: string,
        product: ReturnProduct,
        orderCartIdentifier: string,
        cartItemSoupEntryId?: string
    ) {
        if (cartItemSoupEntryId) {
            const cartItemRecord = (await productDM.getCardItemBySoupEntryId(
                cartItemSoupEntryId
            )) as unknown as ReturnCartItem[]
            return {
                ...cartItemRecord,
                ...cartPatch
            }
        }
        return {
            RetailStoreId: store.PlaceId,
            Product2Id: id,
            Item_Type__c: 'Order Item',
            Pricebook2Id: product.pbId,
            OrderCartIdentifier: orderCartIdentifier,
            Product2: {
                Material_Unique_ID__c: product['Product.Material_Unique_ID__c'],
                Name: product['Product.Name'],
                Sub_Brand__c: product['Product.Sub_Brand__c'],
                ProductCode: product['Product.ProductCode'],
                Package_Type_Name__c: product['Product.Package_Type_Name__c'],
                Config_Qty__c: product['Product.Config_Qty__c'] || 1
            },
            ...cartPatch
        }
    }

    public static getAppliedListQuery(searchStr: string, custUniqId: string, orderCartIdentifier: string) {
        return productDM.getAppliedListQuery(searchStr, custUniqId, orderCartIdentifier)
    }

    public static async getAppliedList(smartSQL: string) {
        return await productDM.getAppliedList(smartSQL)
    }

    public static async getRouteFrequencyForVisit(accountId: string) {
        const routeCondition = [` WHERE {Customer_to_Route__c:Customer__c}='${accountId}'`]
        const route = await productDM.getCustomerToRoute(routeCondition)
        if (route && route.length > 0 && route[0].CUST_RTE_FREQ_CDE__c) {
            return RouteFrequencyMapping.find((a) => a.key === route[0].CUST_RTE_FREQ_CDE__c)?.value
        }
        return null
    }

    static async syncDownProductListData() {
        const userLocation = CommonParam.locationArr.find(
            (one) => one.SLS_UNIT_ID__c === CommonParam.userLocationId
        ) as any
        if (!userLocation) {
            return
        }
        const locations = await RouteDM.checkIfValidLocation()
        if (!locations?.length) {
            return
        }
        const currentRoute = locations[0]
        // batch fail, then pull data through api approach
        const today = moment().format(TIME_FORMAT.Y_MM_DD)
        const failDate = currentRoute?.ProdList_Batch_Fail_Date__c
        if (failDate && moment(failDate).isSameOrBefore(today)) {
            const productsListingFields = CommonService.getAllFieldsByObjName('Product_Listing__c', 'Remote')
            return productDM.syncDownProductListDataByAPI(productsListingFields)
        }
        return productDM.syncDownProductListDataByCSV(userLocation.Id)
    }

    static async syncDownProductListingAndProductData() {
        try {
            const pplData = (await this.syncDownProductListData()) || []
            await productDM.syncDownProductAndMarkAvailFlag(pplData)
            return pplData
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'fetchProductListingData',
                'fetchProductListingData failed' + ErrorUtils.error2String(e)
            )
            return []
        }
    }

    static async syncDownProductExclusionData() {
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
        const failDate = currentRoute?.ProdExcl_Batch_Fail_Date__c
        if (failDate && moment(failDate).isSameOrBefore(today)) {
            const routeAccounts = await AccountDM.getAccountsForPullingRelatedDataWhenCSVBatchFail()
            const routeAccountCustIds = _.uniq(_.map(routeAccounts, 'CUST_UNIQ_ID_VAL__c'))
            return productDM.syncDownProductExclusionByAPI(routeAccountCustIds)
        }
        return productDM.syncDownProductExclusionByCSV()
    }

    static async syncDownProductExclusionOtherRouteData() {
        if (!CommonParam.userRouteId) {
            return
        }
        try {
            const otherRetailStoreIds = await VisitDM.getCustUniqIdsFromVisitOnOtherRoutes()
            if (otherRetailStoreIds.length) {
                await productDM.syncDownProductExclusionByAPI(otherRetailStoreIds)
            }
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: sync down product exclusion',
                `Sync down failed for other routes: ${CommonParam.userRouteId} ${ErrorUtils.error2String(e)}`
            )
        }
    }

    static async syncDownStoreProduct(allAccountIds?: any, productListingIds?: any) {
        try {
            const storeProductSyncFields = CommonService.getAllFieldsByObjName('StoreProduct', 'Remote')
            const availableProductIds = productListingIds.filter((a) => a) as Array<string>
            const routeAccountIds = await AccountDM.getUniqIdsFromRoutes()
            const otherAccountIds = await VisitDM.getCustUniqIdsFromVisitOnOtherRoutes(true)
            const accountIds =
                allAccountIds.filter((a: any) => a).length > 0
                    ? `('${allAccountIds.filter((a: any) => a).join("','")}')`
                    : `('${_.concat(routeAccountIds, otherAccountIds)
                          .filter((a) => a)
                          .join("','")}')`
            if (availableProductIds.length > 0 && accountIds.length > 0) {
                await batchSynDown(availableProductIds, {
                    name: 'StoreProduct',
                    whereClause: `RecordType.Name = 'Active Product' 
                        AND AccountId IN ${accountIds} 
                        AND Product.Material_Unique_ID__c IN {BatchIds}`,
                    updateLocalSoup: true,
                    fields: storeProductSyncFields,
                    allOrNone: true
                })
            }
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'fetchStoreProduct',
                'fetchStoreProduct failed' + ErrorUtils.error2String(e)
            )
        }
    }

    static async deltaSyncDownStoreProduct(lastModifiedDate: string) {
        const routeAccountIds = await AccountDM.getUniqIdsFromRoutes()
        const otherAccountIds = await VisitDM.getCustUniqIdsFromVisitOnOtherRoutes(true)
        const storeProductSyncFields = CommonService.getAllFieldsByObjName('StoreProduct', 'Remote')

        const accountIds = [...routeAccountIds, ...otherAccountIds]
        if (accountIds.length > 0) {
            const batchRes = await batchSynDown(_.uniq(accountIds.filter((el) => el)), {
                name: 'StoreProduct',
                whereClause: `RecordType.Name = 'Active Product' 
                        AND AccountId IN {BatchIds} 
                        AND LastModifiedDate > ${lastModifiedDate}`,
                updateLocalSoup: true,
                fields: storeProductSyncFields,
                allOrNone: true
            })
            const newStoreProductApUniqIds = batchRes.flat().map((el) => el.AP_Unique_ID__c)
            await ProductDM.removeDupStoreProduct(newStoreProductApUniqIds)
        }
    }

    private static getSucMsg(prodLength: number) {
        const midMsg =
            prodLength < 2
                ? `${t.labels.PBNA_MOBILE_PRODUCT} ${t.labels.PBNA_MOBILE_HAS}`
                : `${t.labels.PBNA_MOBILE_PRODUCTS} ${t.labels.PBNA_MOBILE_HAVE}`
        return `${prodLength} ${midMsg} ${t.labels.PBNA_MOBILE_ACTIVATE_SUCCESS_MSG}`
    }

    public static async activateProduct(
        products: any,
        store: any,
        setSucMessage: React.Dispatch<React.SetStateAction<string>>
    ) {
        try {
            const prodsToActivate = await ProductDM.getProdInfo(products, store)
            if (!_.isEmpty(prodsToActivate)) {
                const storeProductUniqueIds = prodsToActivate.map((sp: any) => sp.AP_Unique_ID__c)
                // we update soup by deleting old ones once for all, and insert new ones
                // but need to write sf id to new ones first
                const localStoreProducts = await ProductDM.getActiveStoreProductsByUniqueIds(storeProductUniqueIds)
                const uniqueIdToSFIdMap = localStoreProducts.reduce((a, b) => {
                    a[b.AP_Unique_ID__c] = b.Id
                    return a
                }, {} as { [key: string]: string | undefined })
                prodsToActivate.forEach((sp) => {
                    sp.Id = uniqueIdToSFIdMap[sp.AP_Unique_ID__c]
                })
                await ProductDM.removeStoreProductBySoupEntryId(localStoreProducts)
                await ProductDM.upsertStoreProductIntoSoup(prodsToActivate)
                setSucMessage(this.getSucMsg(prodsToActivate?.length || 0))
                SyncUpService.syncUpLocalData()
            }
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'Orderade: createSP', ErrorUtils.error2String(e))
        }
    }

    public static async getAllProductCount(store: MyDayVisitModel, pbnaExtraWhere: string, searchStr: string) {
        return await ProductDM.getAllProductCount(store, pbnaExtraWhere, searchStr)
    }

    public static async getAllProductsData(
        store: MyDayVisitModel,
        orderCartIdentifier: string,
        packageNames: any[],
        searchStr: string,
        pageName: string
    ) {
        return await ProductDM.getAllProductsData(store, orderCartIdentifier, packageNames, searchStr, pageName)
    }

    public static async getProductRelatedDataThroughIds(productIds: string[] = []) {
        return await ProductDM.getProductRelatedDataThroughIds(productIds)
    }
}

export default ProductService

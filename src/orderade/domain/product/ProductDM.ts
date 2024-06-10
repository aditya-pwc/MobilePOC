/* eslint-disable camelcase */
import ProductData from './ProductData'
import ProductSync from './ProductSync'
import _ from 'lodash'
import moment from 'moment'
import { RecordTypeEnum } from '../../../savvy/enums/RecordType'
import { MyDayVisitModel } from '../../interface/MyDayVisit'
import CommonData from '../common/CommonData'

const productSync = new ProductSync()
const productData = new ProductData()
class ProductDM {
    static readonly deactivateStoreProduct = ProductData.deactivateStoreProduct

    public async syncUpStoreProductsByFieldList(fieldList: string[]) {
        const storeProductsToSync = await ProductData.retrieveActiveStoreProductsFromSoup(fieldList)
        const dupApUniqIds = await productSync.syncUpStoreProductsByFieldList(storeProductsToSync)
        await ProductData.removeDupStoreProduct(dupApUniqIds || [])
    }

    public getPackageNameQuery(searchStr: string, CustUniqId: string, orderCartIdentifier: string, pageName: string) {
        return productData.getPackageNameQuery(searchStr, CustUniqId, orderCartIdentifier, pageName)
    }

    public async getProductByPackageName(
        searchStr: string,
        custUniqId: any,
        packageNames: Array<any>,
        orderCartIdentifier: string,
        pageName: string
    ) {
        return await productData.getProductByPackageName(
            searchStr,
            custUniqId,
            packageNames,
            orderCartIdentifier,
            pageName
        )
    }

    public async updateStoreProductQTYAndPrice(storeProductUniqIds: string[], qty: any, price: any) {
        return await productData.updateStoreProductQTYAndPrice(storeProductUniqIds, qty, price)
    }

    public async createNewCursorForProductList(soupName: string, query: string, fields: string[], PAGE_SIZE?: number) {
        return await productData.createNewCursorForProductList(soupName, query, fields, PAGE_SIZE)
    }

    public async getCardItemBySoupEntryId(cartItemSoupEntryId: string) {
        return await productData.getCardItemBySoupEntryId(cartItemSoupEntryId)
    }

    public getAppliedListQuery(searchStr: string, custUniqId: string, orderCartIdentifier: string) {
        return productData.getAppliedListQuery(searchStr, custUniqId, orderCartIdentifier)
    }

    public async getAppliedList(smartSQL: string) {
        const fieldList = [
            'ProductId',
            'Product.Name',
            'Product.Sub_Brand__c',
            'Product.Flavor_Name__c',
            'Product.LTO__c',
            'Product.National_Launch_Date__c',
            'Product.Material_Unique_ID__c',
            'Product.Material_ID__c',
            'Product.Package_Type_Name__c',
            'Product.ProductCode',
            'Config_Qty__c',
            'pbeId',
            'unitPrice',
            'priceIndex',
            'breakageCases',
            'breakageUnits',
            'breakageTotal',
            'outOfDateCases',
            'outOfDateUnits',
            'outOfDateTotal',
            'saleableCases',
            'saleableUnits',
            'saleableTotal',
            'cartItemSoupEntryId'
        ]
        return await productData.getProduct(fieldList, smartSQL)
    }

    public async getCustomerToRoute(condition: string[]) {
        return await productData.getCustomerToRoute(condition)
    }

    public syncDownProductListDataByAPI(fields: string[], extraCondition = '', updateLocalSoup = true) {
        return productSync.syncDownProductListDataByAPI(fields, extraCondition, updateLocalSoup)
    }

    public syncDownProductListDataByCSV(locationId: string) {
        return productSync.syncDownProductListDataByCSV(locationId)
    }

    public getAllProductMaterialIds() {
        return productData.getAllProductMaterialIds()
    }

    public async syncDownProductAndMarkAvailFlag(productListing: any[]) {
        const materialUniqIds = _.uniq(productListing.map((el) => el.Inven_Id__c))
        if (materialUniqIds?.length) {
            const productSyncFields = CommonData.getAllFieldsByObjName('Product2', 'Remote')
            await ProductSync.syncDownProductAndMarkAvailFlag(materialUniqIds, productSyncFields)
            // have to retrieve once more because the above records are frozen do not allow edit
            let allProducts = await ProductData.retrieveProductDataFromSoup()
            allProducts = allProducts.map((pro) => {
                const temp = productListing?.find((a) => a.Inven_Id__c === pro.Material_Unique_ID__c)
                pro.Inven_Avail_Flag_Local = temp.Inven_Avail_Flag__c
                    ? _.lowerCase(temp.Inven_Avail_Flag__c) === 'true'
                    : temp.Inven_Avail_Flag__c
                return pro
            })
            await ProductData.upsertProductDataIntoSoup(allProducts)
        }
    }

    public syncDownProductExclusionByAPI(routeAccountCustIds: string[]) {
        return productSync.syncDownProductExclusionByAPI(routeAccountCustIds)
    }

    public syncDownProductExclusionByCSV() {
        return productSync.syncDownProductExclusionByCSV()
    }

    public static async getProdInfo(products: any, store: any) {
        const outputProds: Array<any> = []
        const recordTypeName = await ProductData.retrieveStoreProductRecordTypeId()
        if (!_.isEmpty(products)) {
            products.forEach((prod: any) => {
                if (prod?.is_Visible_Product__c) {
                    outputProds.push({
                        ProductId: prod?.Product2Id,
                        StartDate: moment().format('YYYY-MM-DD'),
                        RecordTypeId: `${recordTypeName}`,
                        RecordType: {
                            DeveloperName: RecordTypeEnum.ACTIVE_PRODUCT
                        },
                        Is_Visible_Product__c: true,
                        AccountId: store?.AccountId,
                        AP_Unique_ID__c:
                            store?.CustUniqId +
                            '_' +
                            (prod['Product2.Material_Unique_ID__c'] || prod?.Product2?.Material_Unique_ID__c),
                        EDV_Qty__c: prod.EDV_Qty__c,
                        EDV_Price__c: prod.EDV_Price__c
                    })
                }
            })
        }
        return outputProds
    }

    public static async getStoreProductsByUniqueIds(storeProducts: any[]) {
        return await ProductData.getStoreProductsByUniqueIds(storeProducts)
    }

    public static async getActiveStoreProductsByUniqueIds(storeProductUniqueIds: any[]) {
        return await ProductData.getActiveStoreProductsByUniqueIds(storeProductUniqueIds)
    }

    public static async removeStoreProductBySoupEntryId(storeProducts: any[]) {
        const soupEntryIds = storeProducts.map((v) => v._soupEntryId)
        await ProductData.removeStoreProductBySoupEntryId(soupEntryIds)
    }

    public static async upsertStoreProductIntoSoup(storeProducts: any[]) {
        await ProductData.upsertStoreProductIntoSoup(storeProducts)
    }

    public static async getAllProductCount(store: MyDayVisitModel, pbnaExtraWhere: string, searchStr: string) {
        return await ProductData.getAllProductCount(store, pbnaExtraWhere, searchStr)
    }

    public static async getAllProductsData(
        store: MyDayVisitModel,
        orderCartIdentifier: string,
        packageNames: any[],
        searchStr: string,
        pageName: string
    ) {
        return await ProductData.getAllProductsData(store, orderCartIdentifier, packageNames, searchStr, pageName)
    }

    public static async getProductRelatedDataThroughIds(productIds: string[] = []) {
        return await ProductData.getProductRelatedDataThroughIds(productIds)
    }

    static removeDupStoreProduct = ProductData.removeDupStoreProduct
    static getProductByPackageName = ProductData.getProductByPackageName
}

export default ProductDM

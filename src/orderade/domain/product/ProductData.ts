import _ from 'lodash'
import BaseInstance from '../../../common/BaseInstance'
import { getIdClause } from '../../../common/utils/CommonUtils'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { RecordTypeEnum } from '../../../savvy/enums/RecordType'
import { Log } from '../../../common/enums/Log'
import { PageNames } from '../../enum/Common'
import { SoupNames } from '../../enum/SoupNames'
import { MyDayVisitModel } from '../../interface/MyDayVisit'
import { StoreProduct } from '../../interface/StoreProduct'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { t } from '../../../common/i18n/t'
import SyncUpService from '../../service/SyncUpService'
import React from 'react'

class ProductData {
    public getPackageNameQuery(searchStr: string, CustUniqId: string, orderCartIdentifier: string, pageName: string) {
        const extraJoin =
            searchStr && CustUniqId
                ? ''
                : `LEFT JOIN {Product_Exclusion__c} ON
            {Product_Exclusion__c:Inven_Id__c} = {Product2:Material_Unique_ID__c}
            AND {Product_Exclusion__c:Target_Value__c} = '${CustUniqId}'`
        const returnAppliedCondition =
            pageName === PageNames.ORDER_SUMMARY
                ? `AND {CartItem:ReturnApplied} IS TRUE`
                : `AND {CartItem:ReturnApplied} IS NOT TRUE`
        const extraWhere =
            searchStr || pageName === PageNames.ORDER_SUMMARY
                ? ''
                : `AND {Product_Exclusion__c:_soupEntryId} IS NULL AND {Product2:Inven_Avail_Flag_Local} IS TRUE`
        return `SELECT
                {Product2:Package_Type_Name__c}
            FROM {Product2}
            LEFT JOIN {PricebookEntry}
                ON {PricebookEntry:Product2.Material_Unique_ID__c} = {Product2:Material_Unique_ID__c}
            LEFT JOIN {CartItem}
                ON {CartItem:Product2Id} = {Product2:Id}
                AND {CartItem:OrderCartIdentifier} = '${orderCartIdentifier}'
            ${extraJoin}
            WHERE
                {PricebookEntry:Id} IS NOT NULL
                AND {Product2:Package_Type_Name__c} IS NOT NULL
                AND ({Product2:Name} LIKE '%${searchStr}%'
                OR {Product2:Sub_Brand__c} LIKE '%${searchStr}%'
                OR {Product2:Package_Type_Name__c} LIKE '%${searchStr}%'
                OR {Product2:Material_Unique_ID__c} LIKE '%${searchStr}%')
                ${returnAppliedCondition}
                ${extraWhere}
            GROUP BY {Product2:Package_Type_Name__c} 
            ORDER BY {Product2:Package_Type_Name__c} ASC`
    }

    public async getProductByPackageName(
        searchStr: string,
        custUniqId: any,
        packageNames: Array<any>,
        orderCartIdentifier: string,
        pageName: string
    ) {
        const extraWhere =
            searchStr || pageName === PageNames.ORDER_SUMMARY
                ? ''
                : `AND {Product_Exclusion__c:_soupEntryId} IS NULL AND {Product2:Inven_Avail_Flag_Local} IS TRUE`
        const returnAppliedCondition =
            pageName === PageNames.ORDER_SUMMARY
                ? `AND {CartItem:ReturnApplied} IS TRUE`
                : `AND {CartItem:ReturnApplied} IS NOT TRUE`
        const extraJoinSQL = searchStr
            ? ''
            : `LEFT JOIN {Product_Exclusion__c} ON
                    {Product_Exclusion__c:Inven_Id__c} = {Product2:Material_Unique_ID__c}
                    AND {Product_Exclusion__c:Target_Value__c} = '${custUniqId}'`
        const allProduct = await BaseInstance.sfSoupEngine.retrieve(
            'Product2',
            [
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
                'pbeId',
                'pbId',
                'Inven_Avail_Flag_Local',
                'Config_Qty__c',
                'unitPrice',
                'priceIndex',
                'breakageCases',
                'breakageUnits',
                'breakageUTotal',
                'outOfDateCases',
                'outOfDateUnits',
                'outOfDateTotal',
                'saleableCases',
                'saleableUnits',
                'saleableTotal',
                'cartItemSoupEntryId'
            ],
            `
                SELECT
                    {Product2:Id},
                    {Product2:Name},
                    {Product2:Sub_Brand__c},
                    {Product2:Flavor_Name__c},
                    {Product2:LTO__c},
                    {Product2:National_Launch_Date__c},
                    {Product2:Material_Unique_ID__c},
                    {Product2:Material_ID__c},
                    {Product2:Package_Type_Name__c},
                    {Product2:ProductCode},
                    {PricebookEntry:Id},
                    {PricebookEntry:Pricebook2Id},
                    {Product2:Inven_Avail_Flag_Local},
                    {Product2:Config_Qty__c},
                    COALESCE({CartItem:UnitPrice}, '0'),
                    COALESCE({CartItem:PriceIndex}, '-1'),
                    COALESCE({CartItem:BreakageCases}, '0'),
                    COALESCE({CartItem:BreakageUnits}, '0'),
                    COALESCE({CartItem:BreakageTotal}, '0'),
                    COALESCE({CartItem:OutOfDateCases}, '0'),
                    COALESCE({CartItem:OutOfDateUnits}, '0'),
                    COALESCE({CartItem:OutOfDateTotal}, '0'),
                    COALESCE({CartItem:SaleableCases}, '0'),
                    COALESCE({CartItem:SaleableUnits}, '0'),
                    COALESCE({CartItem:SaleableTotal}, '0'),
                    {CartItem:_soupEntryId}
                FROM {Product2} 
                LEFT JOIN {PricebookEntry}
                    ON {PricebookEntry:Product2.Material_Unique_ID__c} = {Product2:Material_Unique_ID__c}
                LEFT JOIN {CartItem}
                    ON {Product2:Id} = {CartItem:Product2Id} 
                    AND {CartItem:OrderCartIdentifier} = '${orderCartIdentifier}'
                ${extraJoinSQL}
                WHERE
                    {Product2:Package_Type_Name__c} IN (${getIdClause(
                        packageNames.map((el) => el.Package_Type_Name__c)
                    )})
                    AND {PricebookEntry:Id} IS NOT NULL
                    AND ({Product2:Name} LIKE '%${searchStr}%'
                    OR {Product2:Sub_Brand__c} LIKE '%${searchStr}%'
                    OR {Product2:Package_Type_Name__c} LIKE '%${searchStr}%'
                    OR {Product2:Material_Unique_ID__c} LIKE '%${searchStr}%')
                    ${returnAppliedCondition}
                    ${extraWhere} 
                ORDER BY
                    {Product2:Sub_Brand__c} ASC
                `,
            [],
            {},
            false,
            false
        )
        return allProduct as unknown as StoreProduct[]
    }

    private prepareUpdateList(storeProduct: any, qty: any, price: any) {
        return storeProduct.map((item: any) => {
            return {
                AccountId: item.AccountId,
                Auth_Date__c: item.Auth_Date__c,
                Combined_Auth_Flag__c: item.Combined_Auth_Flag__c,
                Date_Of_No_Sale__c: item.Date_Of_No_Sale__c,
                Date_Of_Wake__c: item.Date_Of_Wake__c,
                EDV_Price__c: Number(price),
                EDV_Qty__c: Number(qty),
                IP_Score__c: item.IP_Score__c,
                Id: item.Id,
                Is_Visible_Product__c: item.Is_Visible_Product__c,
                Mandated_Sell__c: item.Mandated_Sell__c,
                No_11_WTD_Void__c: item.No_11_WTD_Void__c,
                No_12_LCW_Void__c: item.No_12_LCW_Void__c,
                Product: {
                    Brand_Code__c: item['Product.Brand_Code__c'],
                    Brand_Name__c: item['Product.Brand_Name__c'],
                    Flavor_Name__c: item['Product.Flavor_Name__c'],
                    Formatted_Brand__c: item['Product.Formatted_Brand__c'],
                    Formatted_Flavor__c: item['Product.Formatted_Flavor__c'],
                    Formatted_Package__c: item['Product.Formatted_Package__c'],
                    Formatted_Sub_Brand_Name__c: item['Product.Formatted_Sub_Brand_Name__c'],
                    GTIN__c: item['Product.GTIN__c'],
                    IsActive: item['Product.IsActive'],
                    LTO__c: item['Product.LTO__c'],
                    Material_Unique_ID__c: item['Product.Material_Unique_ID__c'],
                    Name: item['Product.Name'],
                    National_Launch_Date__c: item['Product.National_Launch_Date__c'],
                    Package_Type_Name__c: item['Product.Package_Type_Name__c'],
                    ProductCode: item['Product.ProductCode'],
                    StockKeepingUnit: item['Product.StockKeepingUnit'],
                    Sub_Brand_Code__c: item['Product.Sub_Brand_Code__c'],
                    Sub_Brand__c: item['Product.Sub_Brand__c']
                },
                ProductId: item.ProductId,
                Product_Availability__c: item.Product_Availability__c,
                RecordType: { DeveloperName: item['RecordType.DeveloperName'] },
                RecordTypeId: item.RecordTypeId,
                RetailStoreId: item.RetailStoreId,
                AP_Unique_ID__c: item.AP_Unique_ID__c,
                StartDate: item.StartDate,
                Status__c: item.Status__c,
                Vol_11_WTD__c: item.Vol_11_WTD__c,
                YTD_LCD_Vol__c: item.YTD_LCD_Vol__c,
                YTD_Net_Revenue__c: item.YTD_Net_Revenue__c,
                YTD_Volume__c: item.YTD_Volume__c,
                attributes: item.attributes,
                __local__: item.__local__,
                __locally_created__: item.__locally_created__,
                __locally_deleted__: item.__locally_deleted__,
                __locally_updated__: item.__locally_updated__,
                // eslint-disable-next-line no-proto
                __proto__: item.__proto__,
                _soupEntryId: item._soupEntryId
            }
        })
    }

    public async updateStoreProductQTYAndPrice(storeProductUniqIds: string[], qty: any, price: any) {
        const fieldList = BaseInstance.sfSoupEngine.getSoupFieldList(SoupNames.StoreProduct, 'Remote')
        const storeProduct = await BaseInstance.sfSoupEngine.retrieve(SoupNames.StoreProduct, fieldList, '', [
            `WHERE {StoreProduct:AP_Unique_ID__c} IN (${getIdClause(storeProductUniqIds)})`
        ])
        const updateList = this.prepareUpdateList(storeProduct, qty, price)
        await BaseInstance.sfSoupEngine.upsert(SoupNames.StoreProduct, updateList)
    }

    public async createNewCursorForProductList(soupName: string, query: string, fields: string[], PAGE_SIZE?: number) {
        return await BaseInstance.sfSoupEngine.createNewCursor(soupName, query, fields, PAGE_SIZE)
    }

    static async getAuthProductForCustomer(store: Partial<MyDayVisitModel>) {
        const activeProdList = await BaseInstance.sfSoupEngine.retrieve(
            'Product2',
            [
                'ProductId',
                'Product.Name',
                'Product.Sub_Brand__c',
                'Product.Flavor_Name__c',
                'Product.LTO__c',
                'Product.National_Launch_Date__c',
                'Product.Material_Unique_ID__c',
                'Product.Material_ID__c',
                'Product.Package_Type_Name__c',
                'Product.ProductCode'
            ],
            `
            SELECT
                {Product2:Id},
                {Product2:Name},
                {Product2:Sub_Brand__c},
                {Product2:Flavor_Name__c},
                {Product2:LTO__c},
                {Product2:National_Launch_Date__c},
                {Product2:Material_Unique_ID__c},
                {Product2:Material_ID__c},
                {Product2:Package_Type_Name__c},
                {Product2:ProductCode}
            FROM {Product2} 
            LEFT JOIN {Product_Exclusion__c} ON
                {Product_Exclusion__c:Inven_Id__c} = {Product2:Material_Unique_ID__c}
                AND {Product_Exclusion__c:Target_Value__c} = '${store.CustUniqId}'
            WHERE
                {Product2:Package_Type_Name__c} IS NOT NULL
                AND {Product_Exclusion__c:_soupEntryId} IS NULL
                AND {Product2:Inven_Avail_Flag_Local} IS TRUE
            `,
            [],
            {},
            false,
            false
        )
        return (activeProdList?.map((prod) => prod['Product.Material_Unique_ID__c']) as Array<string>) || []
    }

    public async getCardItemBySoupEntryId(cartItemSoupEntryId: string) {
        return await BaseInstance.sfSoupEngine.retrieve(
            SoupNames.CartItem,
            [],
            '',
            [`WHERE {CartItem:_soupEntryId} = '${cartItemSoupEntryId}'`],
            {},
            true,
            true
        )
    }

    public getAppliedListQuery(searchStr: string, CustUniqId: string, orderCartIdentifier: string) {
        const extraJoin =
            searchStr && CustUniqId
                ? ''
                : `LEFT JOIN {Product_Exclusion__c} ON
        {Product_Exclusion__c:Inven_Id__c} = {Product2:Material_Unique_ID__c}
        AND {Product_Exclusion__c:Target_Value__c} = '${CustUniqId}'`
        const extraWhere = searchStr
            ? ''
            : `AND {Product_Exclusion__c:_soupEntryId} IS NULL AND {Product2:Inven_Avail_Flag_Local} IS TRUE`
        return `
        SELECT
            {Product2:Id},
            {Product2:Name},
            {Product2:Sub_Brand__c},
            {Product2:Flavor_Name__c},
            {Product2:LTO__c},
            {Product2:National_Launch_Date__c},
            {Product2:Material_Unique_ID__c},
            {Product2:Material_ID__c},
            {Product2:Package_Type_Name__c},
            {Product2:ProductCode},
            {Product2:Config_Qty__c},
            {CartItem:PricebookEntryId},
            {CartItem:UnitPrice},
            {CartItem:PriceIndex},
            {CartItem:BreakageCases},
            {CartItem:BreakageUnits},
            {CartItem:BreakageTotal},
            {CartItem:OutOfDateCases},
            {CartItem:OutOfDateUnits},
            {CartItem:OutOfDateTotal},
            {CartItem:SaleableCases},
            {CartItem:SaleableUnits},
            {CartItem:SaleableTotal},
            {CartItem:_soupEntryId}
        FROM {Product2}
        LEFT JOIN {CartItem}
            ON {Product2:Id} = {CartItem:Product2Id} 
            AND {CartItem:OrderCartIdentifier} = '${orderCartIdentifier}' 
        ${extraJoin}
        WHERE
            {Product2:Package_Type_Name__c} IS NOT NULL
            AND ({Product2:Name} LIKE '%${searchStr}%'
            OR {Product2:Sub_Brand__c} LIKE '%${searchStr}%'
            OR {Product2:Package_Type_Name__c} LIKE '%${searchStr}%'
            OR {Product2:Material_Unique_ID__c} LIKE '%${searchStr}%') 
            AND {CartItem:ReturnApplied} IS TRUE
            ${extraWhere}
        ORDER BY 
            {Product2:Package_Type_Name__c} ASC,
            {Product2:Sub_Brand__c} ASC
        `
    }

    public async getProduct(fieldList?: string[], smartSQL?: string) {
        return await BaseInstance.sfSoupEngine.retrieve(SoupNames.Product2, fieldList || [], smartSQL || '')
    }

    public async getCustomerToRoute(condition: string[]) {
        return await BaseInstance.sfSoupEngine.retrieve(SoupNames.CustomerToRoute, [], '', condition)
    }

    public static async deactivateStoreProduct(
        product: any,
        store: any,
        setSucMessage: React.Dispatch<React.SetStateAction<string>>
    ) {
        try {
            const localStoreProducts = await BaseInstance.sfSoupEngine.retrieve(
                'StoreProduct',
                [],
                '',
                [
                    `WHERE {StoreProduct:ProductId}='${product.ProductId}' 
                        AND {StoreProduct:Is_Visible_Product__c} IS true 
                        AND {StoreProduct:AccountId} = '${store.AccountId}'
                        AND {StoreProduct:RecordType.DeveloperName} = '${RecordTypeEnum.ACTIVE_PRODUCT}'`
                ],
                undefined,
                true,
                true
            )
            const updateStoreProduct = localStoreProducts[0]
            updateStoreProduct.Is_Visible_Product__c = false
            await BaseInstance.sfSoupEngine.upsert('StoreProduct', [updateStoreProduct])
            const successMsg = `${product['Product.Name']} ${t.labels.PBNA_MOBILE_DEACTIVATE_SUCCESS}`
            setSucMessage(successMsg)
            SyncUpService.syncUpLocalData()
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'Orderade: deactivateProduct', ErrorUtils.error2String(e))
        }
    }

    public async getAllProductMaterialIds() {
        const productData = await BaseInstance.sfSoupEngine.retrieve(
            SoupNames.Product2,
            ['Id', 'Material_Unique_ID__c'],
            '',
            []
        )
        return _.uniq(productData.map((el) => el.Material_Unique_ID__c))
    }

    public static async retrieveStoreProductRecordTypeId() {
        try {
            const result = await BaseInstance.sfSoupEngine.retrieve(
                'RecordType',
                ['Id'],
                undefined,
                [
                    `WHERE {RecordType:SobjectType} = 'StoreProduct' AND {RecordType:DeveloperName} = '${RecordTypeEnum.ACTIVE_PRODUCT}'`
                ],
                {},
                true,
                true
            )
            return result[0]?.Id || ''
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: retrieveStoreProductRecordTypeId',
                `retrieveStoreProductRecordTypeId failed: ${ErrorUtils.error2String(err)}`
            )
            return ''
        }
    }

    public static async getStoreProductsByUniqueIds(storeProducts: any[]) {
        try {
            return (await BaseInstance.sfSoupEngine.retrieve(
                'StoreProduct',
                [],
                '',
                [
                    `WHERE {StoreProduct:AP_Unique_ID__c} IN (${getIdClause(
                        storeProducts.map((el) => el.AP_Unique_ID__c)
                    )})`
                ],
                {},
                true,
                true
            )) as unknown as StoreProduct[]
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getStoreProductsByUniqueIds',
                `getStoreProductsByUniqueIds failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async getActiveStoreProductsByUniqueIds(storeProductUniqueIds: any[]) {
        try {
            return (await BaseInstance.sfSoupEngine.retrieve(
                'StoreProduct',
                ['Id', 'AP_Unique_ID__c'],
                '',
                [
                    `WHERE {StoreProduct:AP_Unique_ID__c} IN (${getIdClause(
                        storeProductUniqueIds
                    )}) AND {StoreProduct:RecordType.DeveloperName} = '${RecordTypeEnum.ACTIVE_PRODUCT}'`
                ]
                // eslint-disable-next-line camelcase
            )) as unknown as Array<{ Id?: string; AP_Unique_ID__c: string; _soupEntryId: string }>
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getActiveStoreProductsByUniqueIds',
                `getActiveStoreProductsByUniqueIds failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async removeStoreProductBySoupEntryId(soupEntryIds: any[]) {
        try {
            await BaseInstance.sfSoupEngine.removeRecords('StoreProduct', soupEntryIds)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: removeStoreProductBySoupEntryId',
                `removeStoreProductBySoupEntryId failed: ${ErrorUtils.error2String(err)}`
            )
        }
    }

    public static async upsertStoreProductIntoSoup(storeProducts: any[]) {
        try {
            await BaseInstance.sfSoupEngine.upsert('StoreProduct', storeProducts)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: upsertStoreProductIntoSoup',
                `upsertStoreProductIntoSoup failed: ${ErrorUtils.error2String(err)}`
            )
        }
    }

    public static async getAllProductCount(store: MyDayVisitModel, pbnaExtraWhere: string, searchStr: string) {
        try {
            const pbnaExtraJoin = `LEFT JOIN {Product_Exclusion__c} ON
                {Product_Exclusion__c:Inven_Id__c} = {Product2:Material_Unique_ID__c}
                AND {Product_Exclusion__c:Target_Value__c} = '${store.CustUniqId}'`
            const allProducts: Array<any> = await BaseInstance.sfSoupEngine.retrieve(
                'Product2',
                ['count'],
                `
                SELECT
                COUNT(*)
                FROM {Product2} 
                LEFT JOIN {PricebookEntry}
                    ON {PricebookEntry:Product2.Material_Unique_ID__c} = {Product2:Material_Unique_ID__c}
                LEFT JOIN {StoreProduct}
                    ON {StoreProduct:ProductId} = {Product2:Id}
                    AND {StoreProduct:AccountId} = '${store.AccountId}'
                    AND {StoreProduct:RecordType.DeveloperName} = '${RecordTypeEnum.ACTIVE_PRODUCT}'
                ${pbnaExtraJoin}
                WHERE
                    {Product2:Package_Type_Name__c} IS NOT NULL
                    AND {PricebookEntry:Id} IS NOT NULL
                    AND {Product_Exclusion__c:_soupEntryId} IS NULL
                    AND ({Product2:Name} LIKE '%${searchStr}%'
                        OR {Product2:Sub_Brand__c} LIKE '%${searchStr}%'
                        OR {Product2:Package_Type_Name__c} LIKE '%${searchStr}%'
                        OR {Product2:Material_Unique_ID__c} LIKE '%${searchStr}%')
                    ${pbnaExtraWhere}
                `,
                [],
                {},
                false,
                false
            )
            return allProducts[0]?.count || 0
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getAllProductCount',
                `getAllProductCount failed: ${ErrorUtils.error2String(err)}`
            )
            return 0
        }
    }

    public static async getAllProductsData(
        store: MyDayVisitModel,
        orderCartIdentifier: string,
        packageNames: any[],
        searchStr: string,
        pageName: string
    ) {
        try {
            let extraWhere
            const searchWhere = `
                ({Product2:Name} LIKE '%${searchStr}%'
                OR {Product2:Sub_Brand__c} LIKE '%${searchStr}%'
                OR {Product2:Package_Type_Name__c} LIKE '%${searchStr}%'
                OR {Product2:Material_Unique_ID__c} LIKE '%${searchStr}%')`
            switch (pageName) {
                case PageNames.ORDER_SUMMARY:
                    extraWhere =
                        `AND {CartItem:Quantity} != '0' AND {StoreProduct:Is_Visible_Product__c} IS TRUE 
                    AND` + searchWhere
                    break
                case PageNames.INACTIVE_PROD:
                    extraWhere =
                        `AND {StoreProduct:Is_Visible_Product__c} IS NOT TRUE AND {Product2:Inven_Avail_Flag_Local} IS TRUE
                    AND` + searchWhere
                    break
                case PageNames.PROD_SELLING:
                    extraWhere = `AND {StoreProduct:Is_Visible_Product__c} IS TRUE AND {Product2:Inven_Avail_Flag_Local} IS TRUE`
                    break
                default:
                    extraWhere = ''
            }
            const pbnaExtraJoin = `LEFT JOIN {Product_Exclusion__c} ON
                {Product_Exclusion__c:Inven_Id__c} = {Product2:Material_Unique_ID__c}
                AND {Product_Exclusion__c:Target_Value__c} = '${store.CustUniqId}'`
            const pbnaExtraWhere = `AND {Product_Exclusion__c:_soupEntryId} IS NULL`
            return (await BaseInstance.sfSoupEngine.retrieve(
                'Product2',
                [
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
                    'pbeId',
                    'pbId',
                    'unitPrice',
                    'quantity',
                    'priceIndex',
                    'Is_Visible_Product__c',
                    'EDV_Qty__c',
                    'EDV_Price__c',
                    'AP_Unique_ID__c',
                    'Inven_Avail_Flag_Local',
                    'searchMatch'
                ],
                `
                SELECT
                    {Product2:Id},
                    {Product2:Name},
                    {Product2:Sub_Brand__c},
                    {Product2:Flavor_Name__c},
                    {Product2:LTO__c},
                    {Product2:National_Launch_Date__c},
                    {Product2:Material_Unique_ID__c},
                    {Product2:Material_ID__c},
                    {Product2:Package_Type_Name__c},
                    {Product2:ProductCode},
                    {PricebookEntry:Id},
                    {PricebookEntry:Pricebook2Id},
                    {PricebookEntry:UnitPrice},
                    {CartItem:Quantity},
                    {CartItem:PriceIndex},
                    {StoreProduct:Is_Visible_Product__c},
                    {StoreProduct:EDV_Qty__c},
                    {StoreProduct:EDV_Price__c},
                    {StoreProduct:AP_Unique_ID__c},
                    {Product2:Inven_Avail_Flag_Local},
                    CASE
                        WHEN ${searchWhere} THEN '1'
                        ELSE '0'
                    END
                FROM {Product2} 
                LEFT JOIN {PricebookEntry}
                    ON {PricebookEntry:Product2.Material_Unique_ID__c} = {Product2:Material_Unique_ID__c}
                LEFT JOIN {StoreProduct}
                    ON {StoreProduct:ProductId} = {Product2:Id}
                    AND {StoreProduct:AccountId} = '${store.AccountId}'
                    AND {StoreProduct:RecordType.DeveloperName} = '${RecordTypeEnum.ACTIVE_PRODUCT}'
                LEFT JOIN {CartItem}
                    ON {Product2:Id} = {CartItem:Product2Id} 
                    AND {CartItem:OrderCartIdentifier} = '${orderCartIdentifier}'
                ${pbnaExtraJoin}
                WHERE
                    {Product2:Package_Type_Name__c} IN (${getIdClause(
                        packageNames.map((el: any) => el.Package_Type_Name__c)
                    )})
                    AND {PricebookEntry:Id} IS NOT NULL
                    ${extraWhere}
                    ${pbnaExtraWhere}
                `,
                [],
                {},
                false,
                false
            )) as unknown as Array<StoreProduct>
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getAllProductsData',
                `getAllProductsData failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async getProductRelatedDataThroughIds(productIds: string[] = []) {
        if (productIds.length === 0) {
            return []
        }
        try {
            return await BaseInstance.sfSoupEngine.retrieve(
                'Product2',
                ['Id', 'Material_UOM_Code_Value__c'],
                undefined,
                [`WHERE {Product2:Id} IN (${getIdClause(productIds)})`],
                {},
                false,
                false
            )
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getProductRelatedDataThroughIds',
                `getProductRelatedDataThroughIds failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async removeDupStoreProduct(apUniqIds: string[]) {
        if (!apUniqIds.length) {
            return
        }
        const storeProductToRemove = await BaseInstance.sfSoupEngine.retrieve('StoreProduct', [], '', [
            `
            WHERE {StoreProduct:RecordType.DeveloperName} = '${RecordTypeEnum.ACTIVE_PRODUCT}'
            AND {StoreProduct:AP_Unique_ID__c} IN (${getIdClause(apUniqIds)})
            AND {StoreProduct:Id} IS NULL
        `
        ])
        await BaseInstance.sfSoupEngine.removeRecords(
            'StoreProduct',
            storeProductToRemove.map((el) => el._soupEntryId)
        )
    }

    public static async getProductByPackageName(packageName: string) {
        return BaseInstance.sfSoupEngine.retrieve('Product2', [], '', [
            `WHERE {Product2:Package_Type_Name__c} = '${packageName}'`
        ])
    }

    public static async retrieveProductIdsFromSoup() {
        try {
            return await BaseInstance.sfSoupEngine.retrieveIds('Product2')
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: retrieveProductIdsFromSoup',
                `retrieveProductIdsFromSoup failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async retrieveActiveStoreProductsFromSoup(fieldList: string[]) {
        try {
            return (await BaseInstance.sfSoupEngine.retrieve('StoreProduct', fieldList, undefined, [
                `WHERE 
                 ({StoreProduct:Id} IS NULL OR {StoreProduct:__locally_updated__}='1') 
                 AND {StoreProduct:RecordType.DeveloperName} = '${RecordTypeEnum.ACTIVE_PRODUCT}'`
            ])) as unknown as Array<StoreProduct>
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: retrieveActiveStoreProductsFromSoup',
                `retrieveActiveStoreProductsFromSoup failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async retrieveProductDataFromSoup() {
        try {
            return await BaseInstance.sfSoupEngine.retrieve('Product2', [], '', [])
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: retrieveProductDataFromSoup',
                `retrieveProductDataFromSoup failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async upsertProductDataIntoSoup(allProducts: any[]) {
        try {
            await BaseInstance.sfSoupEngine.upsert('Product2', allProducts)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: upsertProductDataIntoSoup',
                `upsertProductDataIntoSoup failed: ${ErrorUtils.error2String(err)}`
            )
        }
    }
}

export default ProductData

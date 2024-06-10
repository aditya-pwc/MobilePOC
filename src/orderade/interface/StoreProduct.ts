import { TmpFdPrc } from './TmpFdPrc'

export interface StoreProduct {
    // eslint disable reason: Keep object variable naming consistent with Salesforce.
    // eslint-disable-next-line camelcase
    Auth_Date__c: string
    // eslint disable reason: Keep object variable naming consistent with Salesforce.
    // eslint-disable-next-line camelcase
    Combined_Auth_Flag__c: string
    Id: string
    'Product.Flavor_Name__c'?: string
    'Product.IsActive': boolean
    'Product.LTO__c': boolean
    'Product.Material_Unique_ID__c': string
    'Product.Name': string
    'Product.National_Launch_Date__c': string
    'Product.Package_Type_Name__c': string
    'Product.ProductCode': string
    'Product.Sub_Brand__c': string
    ProductId: string
    RetailStoreId: string
    // eslint disable reason: Keep object variable naming consistent with Salesforce.
    // eslint-disable-next-line camelcase
    Status__c: string
    pbeId: string
    pbId: string
    unitPrice: string
    quantity: string
    // eslint-disable-next-line camelcase
    Is_Visible_Product__c?: boolean
    // eslint-disable-next-line camelcase
    AP_Unique_ID__c: string
    priceArr: Array<TmpFdPrc>
    priceIndex: number
    priceDisplayRange: string[]
    visitId?: string
    // eslint-disable-next-line camelcase
    Inven_Avail_Flag_Local?: string
    // eslint-disable-next-line camelcase
    'Product.Config_Qty__c'?: number
    // eslint-disable-next-line camelcase
    Inven_Cnd_Status_Code__c?: string
    // eslint-disable-next-line camelcase
    ord_lne_actvy_cde__c?: string
    // eslint-disable-next-line camelcase
    EDV_Qty__c?: string
    // eslint-disable-next-line camelcase
    EDV_Price__c?: string
    relativeDelDate: number
    searchMatch?: string
    breakageCases?: string
    breakageUnits?: string
    outOfDateCases?: string
    outOfDateUnits?: string
    saleableCases?: string
    saleableUnits?: string
    custUniqId: string
}

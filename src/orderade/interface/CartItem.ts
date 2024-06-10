/* eslint-disable camelcase */
import { ReturnKPI } from './ReturnProduct'

export interface CartItem {
    Id?: string
    Product2Id: string
    Quantity: string
    Item_Type__c?: string
    RetailStoreId: string
    UnitPrice: string | null
    Pricebook2Id?: string
    PricebookEntryId?: string
    CreatedDate?: string
    OrderCartIdentifier?: string
    Product2: {
        Material_Unique_ID__c: string
        Name: string
        Sub_Brand__c: string
        Package_Type_Name__c: string
        ProductCode: string
        Config_Qty__c: number
    }
    // legacy retrieve is still using false as rebuilt depth
    // so still need this on interface
    'Product2.Material_Unique_ID__c'?: string
    'Product2.Name'?: string
    'Product2.Sub_Brand__c'?: string
    'Product2.Package_Type_Name__c'?: string
    'Product2.ProductCode'?: string
    'Product2.Config_Qty__c'?: string
    isActiveReturn?: boolean
    returnData?: ReturnKPI[]
    is_Visible_Product__c: boolean
    VisitId?: string
    PriceIndex: string
    BreakageCases?: string
    BreakageUnits?: string
    OutOfDateCases?: string
    OutOfDateUnits?: string
    SaleableCases?: string
    SaleableUnits?: string
    ReturnApplied?: boolean
    Config_Qty__c?: string
    AddToCart?: boolean
    Deal_Id__c: string
    Minimum_Quantity: string
    Priority: string
    WholeSalePrice?: string
}

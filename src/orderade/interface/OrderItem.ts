/* eslint-disable camelcase */
export interface OrderItem {
    oRefId: string
    Id: string
    Product2Id: string
    OrderId: string
    Quantity: string
    UnitPrice: string
    Product2: {
        Material_Unique_ID__c: string
        ProductCode: string
        Name: string
    }
    Sequence__c: string
    Ordr_Ln_Actvy_Cdv__c: string
    Ordr_Ln_Rqstd_Qty__c: string
    Ord_Lne_Typ_Desc__c: string
    Ordr_Ln_Unit_Prc_Amt__c: string
    Ordr_Ln_Gross_Amt__c: string
    Ordr_Ln_Net_Amt__c: string
    Ordr_Ln_Rqstd_Qty_Uom_Cdv__c: string
    ord_lne_actvy_cde__c?: string
    Order_Line_Discount_Amt__c: string
    Charge_Taxable_Amount__c: string
    Order_Ln_Dep_Amount__c: string
    Override_Reason_code__c: string
}

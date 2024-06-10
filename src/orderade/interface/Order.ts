import { ReturnConditionLabels } from '../enum/Common'
import { MyDayVisitModel } from './MyDayVisit'
import { ReturnCartItem } from './ReturnProduct'

/* eslint-disable camelcase */
export interface Order {
    Id: string
    _soupEntryId: string
    Sld_Cstmr__r: {
        CUST_UNIQ_ID_VAL__c: string
    }
    Cust_Po_Id__c: string
    Dlvry_Rqstd_Dtm__c: string
    Ordr_Rcvd__c: string
    LOC_ID__c: string
    Name: string
    Transaction_Time__c: string
    Sls_Mthd_Descr__c: string
    Ordr_Tot_Tax_Amt__c: string
    TotalAmount: number
    Ordr_Tot_Grss_Amt__c: string
    oRefId: number
    EffectiveDate: string
    RTE_ID__r: {
        GTMU_RTE_ID__c: string
    }
    Ordr_Cntry_Int_Stndrds_Org_Cdv__c: string
    Ordr_Rqstd_Qty__c: string
    Ordr_Crncy_Cdv__c: string
    Ordr_Id__c: string
    Type: string
    ord_lne_actvy_cde__c: string
    Order_Notes__c: string
    Order_Unique_Id__c: string
    CreatedById: string
    Order_Com_Time__c: string
}

export interface ComposeOrder {
    visit: MyDayVisitModel
    Order_Unique_Id__c: string
    Cust_Po_Id__c: string
    PONumber: string
    deliveryDate: string
    now: number
    notes: string
    orderType: string
    reginCode: string
    notesTime: number | undefined
}
export interface ComposeOrderItem {
    cases: number
    units: number
    caseConvFactor: number
    label: ReturnConditionLabels
    item: ReturnCartItem
    Sequence__c: number
    now: number
    everyDayValue: string
    visit: MyDayVisitModel
    Order_Unique_Id__c: string
    prev: any[]
}

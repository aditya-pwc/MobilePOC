/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-06-08 23:02:31
 * @LastEditTime: 2024-02-01 11:21:46
 * @LastEditors: Tom tong.jiang@pwc.com
 */
export default {
    name: 'Order',
    soupName: 'Order',
    fieldList: [
        {
            name: 'Id',
            type: 'string'
        },
        {
            name: 'Status',
            type: 'string'
        },
        {
            name: 'RetailStore__c',
            type: 'string'
        },
        {
            name: 'EffectiveDate',
            type: 'string'
        },
        {
            name: 'Dlvry_Rqstd_Dtm__c',
            type: 'string'
        },
        {
            name: 'Ordr_Rcvd__c',
            type: 'string'
        },
        {
            name: 'Pallet_Count__c',
            type: 'string'
        },
        {
            name: 'Pallet_Total_IntCount__c',
            type: 'string'
        },
        {
            name: 'Visit__c',
            type: 'string'
        },
        {
            name: 'Visit__r.User__c',
            type: 'string'
        },
        {
            name: 'Total_Ordered__c',
            type: 'string'
        },
        {
            name: 'Total_Ordered_IntCount__c',
            type: 'string'
        },
        {
            name: 'Total_Certified__c',
            type: 'string'
        },
        {
            name: 'Total_Certified_IntCount__c',
            type: 'string'
        },
        {
            name: 'Ordr_Id__c',
            type: 'string'
        },
        {
            name: 'AccountId',
            type: 'string'
        },
        {
            name: 'Total_Return_Cs__c',
            type: 'string'
        },
        {
            name: 'Total_Return_Cs_IntCount__c',
            type: 'string'
        },
        {
            name: 'Total_Return_Un__c',
            type: 'string'
        },
        {
            name: 'Sld_Cstmr__c',
            type: 'string'
        },
        {
            name: 'Sld_Cstmr__r.CUST_UNIQ_ID_VAL__c',
            type: 'string'
        },
        {
            name: 'Cust_Po_Id__c',
            type: 'string'
        },
        {
            name: 'LOC_ID__c',
            type: 'string'
        },
        {
            name: 'Pricebook2Id',
            type: 'string'
        },
        {
            name: 'Transaction_Time__c',
            type: 'string'
        },
        {
            name: 'Sls_Mthd_Descr__c',
            type: 'string'
        },
        {
            name: 'Ordr_Tot_Tax_Amt__c',
            type: 'number'
        },
        {
            name: 'Ordr_Tot_Grss_Amt__c',
            type: 'number'
        },
        {
            name: 'CreatedById',
            type: 'string'
        },
        {
            name: 'Order_Notes__c',
            type: 'string'
        },
        {
            name: 'OrderNumber',
            type: 'string'
        },
        {
            name: 'Owner.FirstName',
            type: 'string'
        },
        {
            name: 'Owner.LastName',
            type: 'string'
        },
        {
            name: 'Owner.Title',
            type: 'string'
        },
        {
            name: 'Owner.Phone',
            type: 'string'
        },
        {
            name: 'OwnerId',
            type: 'string'
        },
        {
            name: 'Order_ATC_Type__c',
            type: 'string'
        },
        {
            name: 'RTE_ID__c',
            type: 'string'
        },
        {
            name: 'RTE_ID__r.GTMU_RTE_ID__c',
            type: 'string'
        },
        {
            name: 'Ordr_Cntry_Int_Stndrds_Org_Cdv__c',
            type: 'string'
        },
        {
            name: 'Ordr_Rqstd_Qty__c',
            type: 'string'
        },
        {
            name: 'Ordr_Crncy_Cdv__c',
            type: 'string'
        },
        {
            name: 'vRefId',
            type: 'integer',
            isLocal: true,
            fieldMode: 'Local'
        },
        {
            name: 'Total_Return_Un_IntCount__c',
            type: 'string'
        },
        {
            name: 'Account.Is_Customer_PO_Number_Required__c',
            type: 'boolean'
        },
        {
            name: 'Account.CUST_ID__c',
            type: 'string'
        },
        {
            name: 'CreatedDate',
            type: 'string'
        },
        {
            name: 'Off_Schedule__c',
            type: 'boolean'
        },
        {
            name: 'Type',
            type: 'string'
        },
        {
            name: 'Order_Unique_Id__c',
            type: 'string'
        },
        {
            name: 'Customer_Id__c',
            type: 'string',
            isLocal: true,
            fieldMode: 'Local'
        },
        {
            name: 'Ordr_Tot_Tax_Amt__c',
            type: 'string',
            isLocal: true,
            fieldMode: 'Local'
        },
        {
            name: 'Owner_Name__c',
            type: 'string',
            isLocal: true,
            fieldMode: 'Local'
        },
        {
            name: 'Created_By_GPID__c', // add this filed in story 12151960
            type: 'string'
        },
        {
            name: 'Modified_By_GPID__c',
            type: 'string',
            isLocal: true,
            fieldMode: 'Local'
        },
        {
            name: 'Transaction_Modified__c',
            type: 'string'
        },
        {
            name: 'Delivery_Method_Code__c',
            type: 'string'
        },
        {
            name: 'Region_Id__c',
            type: 'string'
        },
        {
            name: 'Ord_Dwnld_Flg__c',
            type: 'string',
            isLocal: true,
            fieldMode: 'Local'
        },
        {
            name: 'Ident_Item_Id__c',
            type: 'string',
            isLocal: true,
            fieldMode: 'Local'
        },
        {
            name: 'Product_Group_Code__c',
            type: 'string',
            isLocal: true,
            fieldMode: 'Local'
        },
        {
            name: 'Lock_Dte_Tme__c',
            type: 'string',
            isLocal: true,
            fieldMode: 'Local'
        },
        {
            name: 'Source_Sys_Id__c',
            type: 'string',
            isLocal: true,
            fieldMode: 'Local'
        },
        {
            name: 'Order_Com_Seq__c',
            type: 'string',
            isLocal: true,
            fieldMode: 'Local'
        },
        {
            name: 'Order_Com_Time__c',
            type: 'string',
            isLocal: true,
            fieldMode: 'Local'
        },
        {
            name: 'Order_Com_Source__c',
            type: 'string',
            isLocal: true,
            fieldMode: 'Local'
        },
        {
            name: 'Send_Outbound__c',
            type: 'string',
            isLocal: true,
            fieldMode: 'Local'
        },
        {
            name: 'OCH_Response_Code__c',
            type: 'string',
            isLocal: true,
            fieldMode: 'Local'
        },
        {
            name: 'Order_Reconciled__c',
            type: 'string',
            isLocal: true,
            fieldMode: 'Local'
        }
    ]
}

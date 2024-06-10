export default {
    name: 'Account',
    soupName: 'Account',
    initQuery:
        'SELECT Id, Name, ShippingStreet,ShippingState,ShippingCountry,' +
        'ShippingPostalCode, ShippingCity, ShippingLongitude, ShippingLatitude, Phone, CUST_LVL__c, ParentId, ' +
        'Merchandising_Order_Days__c, ShippingAddress, Merchandising_Base_Minimum_Requirement__c, BUSN_SGMNTTN_LVL_3_NM__c, ' +
        'CUST_ID__c, Merchandising_Delivery_Days__c, Sales_Route__c, Sales_Rep__c, IS_ACTIVE__c, Active_Dist_Points__c, Sales_Rep_Info__c, ' +
        'Indicator_2P__c, IsOTSCustomer__c, Pz_Id__c, CUST_UNIQ_ID_VAL__c,' +
        'Send_New_DP__c, BUSN_SGMNTTN_LVL_1_NM__c, BUSN_SGMNTTN_LVL_2_NM__c, Is_Natl_Acct__c, ' +
        'BUSN_SGMNTTN_LVL_4_NM__c, Parent.ParentId, BUSN_SGMNTTN_LVL_1_CDV__c, BUSN_SGMNTTN_LVL_2_CDV__c, BUSN_SGMNTTN_LVL_3_CDV__c, BUSN_SGMNTTN_LVL_4_CDV__c ' +
        'FROM Account WHERE Id IN' +
        " (SELECT Customer__c FROM Customer_to_Route__c WHERE Route__c='%2$s' AND ACTV_FLG__c=true AND Merch_Flag__c=false AND RecordType.Name = 'CTR') AND IS_ACTIVE__c=true",
    fieldList: [
        {
            name: 'Id',
            type: 'string'
        },
        {
            name: 'Name',
            type: 'string'
        },
        {
            name: 'ShippingStreet',
            type: 'string'
        },
        {
            name: 'ShippingState',
            type: 'string'
        },
        {
            name: 'ShippingCountry',
            type: 'string'
        },
        {
            name: 'ShippingPostalCode',
            type: 'string'
        },
        {
            name: 'ShippingCity',
            type: 'string'
        },
        {
            name: 'ShippingLongitude',
            type: 'floating'
        },
        {
            name: 'ShippingLatitude',
            type: 'floating'
        },
        {
            name: 'Phone',
            type: 'string'
        },
        {
            name: 'CUST_LVL__c',
            type: 'string'
        },
        {
            name: 'ParentId',
            type: 'string'
        },
        {
            name: 'Merchandising_Order_Days__c',
            type: 'string'
        },
        {
            name: 'ShippingAddress',
            type: 'string'
        },
        {
            name: 'Merchandising_Base_Minimum_Requirement__c',
            type: 'string'
        },
        {
            name: 'BUSN_SGMNTTN_LVL_3_NM__c',
            type: 'string'
        },
        {
            name: 'CUST_ID__c',
            type: 'string'
        },
        {
            name: 'Merchandising_Delivery_Days__c',
            type: 'string'
        },
        {
            name: 'Sales_Route__c',
            type: 'string'
        },
        {
            name: 'Sales_Rep__c',
            type: 'string'
        },
        {
            name: 'IS_ACTIVE__c',
            type: 'boolean'
        },
        {
            name: 'Active_Dist_Points__c',
            type: 'string'
        },
        {
            name: 'Sales_Rep_Info__c',
            type: 'string'
        },
        {
            name: 'Indicator_2P__c',
            type: 'string'
        },
        {
            name: 'IsOTSCustomer__c',
            type: 'string'
        },
        {
            name: 'Pz_Id__c',
            type: 'string'
        },
        {
            name: 'CUST_UNIQ_ID_VAL__c',
            type: 'string'
        },
        {
            name: 'Send_New_DP__c',
            type: 'boolean'
        },
        {
            name: 'BUSN_SGMNTTN_LVL_1_NM__c',
            type: 'string'
        },
        {
            name: 'BUSN_SGMNTTN_LVL_2_NM__c',
            type: 'string'
        },
        {
            name: 'BUSN_SGMNTTN_LVL_4_NM__c',
            type: 'string'
        },
        {
            name: 'Parent.ParentId',
            type: 'string'
        },
        {
            name: 'BUSN_SGMNTTN_LVL_1_CDV__c',
            type: 'string'
        },
        {
            name: 'BUSN_SGMNTTN_LVL_2_CDV__c',
            type: 'string'
        },
        {
            name: 'BUSN_SGMNTTN_LVL_3_CDV__c',
            type: 'string'
        },
        {
            name: 'BUSN_SGMNTTN_LVL_4_CDV__c',
            type: 'string'
        },
        {
            name: 'Is_Natl_Acct__c',
            type: 'boolean'
        }
    ]
}

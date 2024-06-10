export default {
    name: 'Account',
    soupName: 'Account',
    initQuery:
        'SELECT Id, Name, ShippingStreet,ShippingState,ShippingCountry,' +
        'ShippingPostalCode,Phone,ShippingCity,ShippingLongitude,ShippingLatitude,CUST_LVL__c,ParentId  ' +
        'FROM Account WHERE Id IN' +
        " (SELECT AccountId FROM AccountTeamMember WHERE UserId='%s') AND IS_ACTIVE__c=true",
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
            name: 'Merchandising_Order_Days__c',
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
            type: 'string'
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
            name: 'Send_New_DP__c',
            type: 'boolean'
        }
    ]
}

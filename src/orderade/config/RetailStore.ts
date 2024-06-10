export default {
    soupName: 'RetailStore',
    name: 'RetailStore',
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
            name: 'AccountId',
            type: 'string'
        },
        {
            name: 'Street',
            type: 'string'
        },
        {
            name: 'State',
            type: 'string'
        },
        {
            name: 'Country',
            type: 'string'
        },
        {
            name: 'PostalCode',
            type: 'string'
        },
        {
            name: 'City',
            type: 'string'
        },
        {
            name: 'Account.Phone',
            type: 'string'
        },
        {
            name: 'LOC_PROD_ID__c',
            type: 'string'
        },
        {
            name: 'LocationId',
            type: 'string'
        },
        {
            name: 'Account.LOC_PROD_ID__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Latitude',
            type: 'string'
        },
        {
            name: 'Longitude',
            type: 'string'
        },
        {
            name: 'Account.CUST_UNIQ_ID_VAL__c',
            type: 'string'
        },
        {
            name: 'Account.Sales_Route__c',
            type: 'string'
        },
        {
            name: 'Account.Merchandising_Base__c',
            type: 'boolean',
            skipSyncUp: true
        },
        {
            name: 'Account.ShippingAddress',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.IS_ACTIVE__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.IsOTSCustomer__c',
            type: 'string'
        },
        {
            name: 'Account.CDA_Medal__c',
            type: 'string'
        },
        {
            name: 'Account.Website',
            type: 'string'
        },
        {
            name: 'CountryCode',
            type: 'string'
        },
        {
            name: 'StateCode',
            type: 'string'
        },
        {
            name: 'Customer_Longitude__c',
            type: 'floating'
        },
        {
            name: 'Customer_Latitude__c',
            type: 'floating'
        },
        {
            name: 'Geofence__c',
            type: 'string'
        },
        {
            name: 'Account.BCD_Tax_Rate__c',
            type: 'string'
        },
        {
            name: 'Account.tax_exempt_flg__c',
            type: 'string'
        }
    ]
}

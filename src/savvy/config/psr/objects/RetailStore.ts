export default {
    name: 'RetailStore',
    soupName: 'RetailStore',
    initQuery: `SELECT Id,Account.Merchandising_Base_Minimum_Requirement__c,Name, Street, City, State, StateCode, Country, PostalCode, Latitude, Longitude,
    RetailLocationGroupId,Account.Phone, Account.Name, Owner.Name, OwnerId, LocationId, Account.BUSN_SGMNTTN_LVL_1_CDV__c, Store_Location__c, MapstedPropertyId__c,
    Geofence__c, LastModifiedDate, Account.CUST_UNIQ_ID_VAL__c, Account.LOC_PROD_ID__c,Account.IsCDACustomer__c,
    Account.IsOTSCustomer__c, Account.CDA_Status__c,Account.CDA_Medal__c, Account.CDA_NY_Status__c, Account.IsOTSFoodService__c, RTLR_STOR_NUM__c, AccountId, CreatedDate,Account.GSC_ID__c,
    Account.BCD_Tax_Rate__c, Account.tax_exempt_flg__c, Account.Sales_Route__c, Account.Pz_Id__c, Account.Is_Natl_Acct__c
    FROM RetailStore
    WHERE AccountId IN (SELECT Customer__c FROM Customer_to_Route__c WHERE Route__r.LOC_Id__c=APPLY_USER_LOCATION AND ACTV_FLG__c=true AND Merch_Flag__c=false AND RecordType.Name = 'CTR') AND Account.IS_ACTIVE__c=true`,
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
            name: 'Customer_Longitude__c',
            type: 'floating'
        },
        {
            name: 'Customer_Latitude__c',
            type: 'floating'
        },
        {
            name: 'LOC_PROD_ID__c',
            type: 'string'
        },
        {
            name: 'MapstedPropertyId__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'LocationId',
            type: 'string'
        },
        {
            name: 'Account.PEPSI_COLA_NATNL_ACCT__c',
            type: 'boolean'
        },
        {
            name: 'Account.CUST_LVL__c',
            type: 'string'
        },
        {
            name: 'Account.CUST_STRT_DT__c',
            type: 'string'
        },
        {
            name: 'Account.ParentId',
            type: 'string'
        },
        {
            name: 'Account.LOC_PROD_ID__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.BUSN_SGMNTTN_LVL_1_CDV__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.BUSN_SGMNTTN_LVL_2_CDV__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.BUSN_SGMNTTN_LVL_3_CDV__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.BUSN_SGMNTTN_LVL_2_NM__c',
            type: 'string'
        },
        {
            name: 'Store_Location__c',
            type: 'string'
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
            name: 'Account.Name',
            type: 'string'
        },
        {
            name: 'Account.CUST_UNIQ_ID_VAL__c',
            type: 'string'
        },
        {
            name: 'Account.RTLR_STOR_NUM__c',
            type: 'string'
        },
        {
            name: 'Account.IsOTSCustomer__c',
            type: 'string'
        },
        {
            name: 'Account.Merchandising_Base_Minimum_Requirement__c',
            type: 'boolean',
            skipSyncUp: true
        },
        {
            name: 'Account.BUSN_SGMNTTN_LVL_3_NM__c',
            type: 'string',
            skipSyncUp: true
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
            name: 'Account.CUST_ID__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.Merchandising_Order_Days__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.Merchandising_Delivery_Days__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.Sales_Route__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.Sales_Rep__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.IS_ACTIVE__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.Active_Dist_Points__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.Sales_Rep_Info__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.Indicator_2P__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.SSONL_CLSD_STRT_DT__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.SSONL_CLSD_END_DT__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.CUST_BUSN_LANG_ISO_NM__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.Business_Type__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.Secondary_Cuisine__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.VENUES_ON_SITE__c',
            type: 'integer',
            skipSyncUp: true
        },
        {
            name: 'Account.Star_Level__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.Number_of_Rooms__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.Years_In_Business__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.K_12_Enrollment__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.Active_Base_Population__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.Annual_Sales__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.LGL_RGSTRTN_NUM_VAL__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.BUSN_SGMNTTN_LVL_1_NM__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.PAYMT_MTHD_NM__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Account.Send_Outbound__c',
            type: 'boolean',
            skipSyncUp: true
        },
        {
            name: 'Geofence__c',
            type: 'string'
        },
        {
            name: 'Account.Website',
            type: 'string'
        },
        {
            name: 'Account.ff_FACEBOOK__c',
            type: 'string'
        },
        {
            name: 'Account.ff_FOURSQUARE__c',
            type: 'string'
        },
        {
            name: 'Account.ff_YELP__c',
            type: 'string'
        },
        {
            name: 'Account.FF_LINK__c',
            type: 'string'
        },
        {
            name: 'Account.Rating__c',
            type: 'floating'
        },
        {
            name: 'Account.ff_UBEREATS__c',
            type: 'string'
        },
        {
            name: 'Account.ff_POSTMATES__c',
            type: 'string'
        },
        {
            name: 'Account.ff_GRUBHUB__c',
            type: 'string'
        },
        {
            name: 'Account.ff_DOORDASH__c',
            type: 'string'
        },
        {
            name: 'Account.User_Link_Label_1__c',
            type: 'string'
        },
        {
            name: 'Account.User_Link_1__c',
            type: 'string'
        },
        {
            name: 'Account.User_Link_Label_2__c',
            type: 'string'
        },
        {
            name: 'Account.User_Link_2__c',
            type: 'string'
        },
        {
            name: 'Account.User_Link_Label_3__c',
            type: 'string'
        },
        {
            name: 'Account.User_Link_3__c',
            type: 'string'
        },
        {
            name: 'Account.Parent.Name',
            type: 'string'
        },
        {
            name: 'Account.Parent.Parent.Name',
            type: 'string'
        },
        {
            name: 'Account.Parent.Parent.Parent.Name',
            type: 'string'
        },
        {
            name: 'Account.Catering__c',
            type: 'boolean'
        },
        {
            name: 'Account.Takeout__c',
            type: 'boolean'
        },
        {
            name: 'Account.Serves_Alcohol__c',
            type: 'boolean'
        },
        {
            name: 'Account.Gas_Station__c',
            type: 'boolean'
        },
        {
            name: 'Account.Serves_Breakfast__c',
            type: 'boolean'
        },
        {
            name: 'Account.Serves_Lunch__c',
            type: 'boolean'
        },
        {
            name: 'Account.Serves_Dinner__c',
            type: 'boolean'
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
            name: 'Account.change_initiated__c',
            type: 'string'
        },
        {
            name: 'Account.CUST_SRVC_FLG__c',
            type: 'boolean'
        },
        {
            name: 'Account.CUST_PROD_FLG__c',
            type: 'boolean'
        },
        {
            name: 'Account.CUST_BLG_FLG__c',
            type: 'boolean'
        },
        {
            name: 'Account.resale_cert__c',
            type: 'string'
        },
        {
            name: 'Account.credit_status__c',
            type: 'string'
        },
        {
            name: 'Account.IsCDACustomer__c',
            type: 'boolean'
        },
        {
            name: 'Account.CDA_Status__c',
            type: 'string'
        },
        {
            name: 'Account.CDA_Medal__c',
            type: 'string'
        },
        {
            name: 'Account.CDA_NY_Status__c',
            type: 'string'
        },
        {
            name: 'Account.IsOTSFoodService__c',
            type: 'boolean'
        },
        {
            name: 'Account.Delta_Revenue_Percentage__c',
            type: 'number'
        },
        {
            name: 'CreatedDate',
            type: 'string'
        },
        {
            name: 'Account.BCD_Tax_Rate__c',
            type: 'string'
        },
        {
            name: 'Account.tax_exempt_flg__c',
            type: 'string'
        },
        {
            name: 'Account.GSC_ID__c',
            type: 'number'
        },
        {
            name: 'Account.Pz_Id__c',
            type: 'string'
        },
        {
            name: 'Account.Is_Natl_Acct__c',
            type: 'boolean'
        },
        {
            name: 'Account.Is_Customer_PO_Number_Required__c',
            type: 'boolean'
        },
        {
            name: 'Account.Single_Unit_Return__c',
            type: 'string'
        }
    ]
}

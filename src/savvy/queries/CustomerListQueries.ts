const CustomerListQueries = {
    getCustomerList: {
        fields: [
            'Id',
            'Account.change_initiated__c',
            'Name',
            'Street',
            'State',
            'StateCode',
            'AccountId',
            'Country',
            'PostalCode',
            'City',
            'CreatedDate',
            'Account.Phone',
            'Account.Merchandising_Delivery_Days__c',
            'Account.Merchandising_Order_Days__c',
            'Customer_Longitude__c',
            'Customer_Latitude__c',
            'Account.IsOTSCustomer__c',
            'Account.IsCDACustomer__c',
            'Account.CDA_Medal__c',
            'LOC_PROD_ID__c',
            'LocationId',
            'Account.BUSN_SGMNTTN_LVL_3_NM__c',
            'Account.CUST_UNIQ_ID_VAL__c',
            'Account.Delta_Revenue_Percentage__c',
            'Account.CUST_STRT_DT__c',
            'Account.PEPSI_COLA_NATNL_ACCT__c'
        ],
        query:
            'SELECT {RetailStore:Id},' +
            '{RetailStore:Account.change_initiated__c}, ' +
            '{RetailStore:Name},' +
            '{RetailStore:Street},' +
            '{RetailStore:State},' +
            '{RetailStore:StateCode},' +
            '{RetailStore:AccountId},' +
            '{RetailStore:Country},' +
            '{RetailStore:PostalCode},' +
            '{RetailStore:City},' +
            '{RetailStore:CreatedDate},' +
            '{RetailStore:Account.Phone},' +
            '{RetailStore:Account.Merchandising_Delivery_Days__c},' +
            '{RetailStore:Account.Merchandising_Order_Days__c},' +
            '{RetailStore:Customer_Longitude__c},' +
            '{RetailStore:Customer_Latitude__c}, ' +
            '{RetailStore:Account.IsOTSCustomer__c}, ' +
            '{RetailStore:Account.IsCDACustomer__c}, ' +
            '{RetailStore:Account.CDA_Medal__c}, ' +
            '{RetailStore:LOC_PROD_ID__c}, ' +
            '{RetailStore:LocationId}, ' +
            '{RetailStore:Account.BUSN_SGMNTTN_LVL_3_NM__c}, ' +
            '{RetailStore:Account.CUST_UNIQ_ID_VAL__c}, ' +
            '{RetailStore:Account.Delta_Revenue_Percentage__c} ' +
            'FROM {RetailStore} ' +
            'WHERE {RetailStore:Account.IS_ACTIVE__c} IS TRUE ',
        fsrSort:
            'ORDER BY CAST({RetailStore:Account.Delta_Revenue_Percentage__c} AS DOUBLE) DESC NULLS LAST,{RetailStore:Name} COLLATE NOCASE ASC NULLS LAST'
    }
}

export default CustomerListQueries

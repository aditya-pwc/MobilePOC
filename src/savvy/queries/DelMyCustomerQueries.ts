/*
 * @Description: query for my customer
 * @Author: Yi Li
 * @Date: 2021-11-25 02:45:38
 * @LastEditTime: 2022-01-12 20:23:55
 * @LastEditors: Yi Li
 */

const DelMyCustomerQueries = {
    getMyCustomers: {
        f: [
            'AccountId',
            'AccountName',
            'AccountPhone',
            'Account_Sales_Route__c',
            'Account_ShippingAddress',
            'Account_CUST_ID__c',
            'Account_RTLR_STOR_NUM__c',
            'CUST_UNIQ_ID_VAL__c'
        ],
        q: `
        SELECT
        {Account:Id},
        {Account:Name},
        {Account:Phone},
        {Account:Sales_Route__c},
        {Account:ShippingAddress},
        {Account:CUST_ID__c},
        {Account:RTLR_STOR_NUM__c},
        {Account:CUST_UNIQ_ID_VAL__c}
        FROM {Account} 
        WHERE {Account:LOC_PROD_ID__c}='%s'
        `
    }
}
export default DelMyCustomerQueries

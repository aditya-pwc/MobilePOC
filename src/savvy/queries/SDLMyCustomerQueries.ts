/*
 * @Description: query for my customer
 * @Author: Yi Li
 * @Date: 2021-11-25 02:45:38
 * @LastEditTime: 2023-10-16 10:59:27
 * @LastEditors: Mary Qian
 */

const MyCustomersQueryPrefix = `SELECT
    {Customer_to_Route__c:Route__r.Id},
    {Customer_to_Route__c:Route__r.RTE_TERR_NM__c},
    {Customer_to_Route__c:Route__r.LOCL_RTE_ID__c},
    {Customer_to_Route__c:Id},
    {Customer_to_Route__c:Customer__c},
    {Customer_to_Route__c:Route__c},
    {Customer_to_Route__c:Customer__r.Id},
    {Customer_to_Route__c:Customer__r.Name},
    {Customer_to_Route__c:Customer__r.Phone},
    {Customer_to_Route__c:Customer__r.Sales_Route__c},
    {Customer_to_Route__c:Customer__r.ShippingAddress},
    {Customer_to_Route__c:Customer__r.CUST_ID__c},
    {Customer_to_Route__c:Customer__r.RTLR_STOR_NUM__c},
    {Customer_to_Route__c:Customer__r.CUST_UNIQ_ID_VAL__c},
    {Customer_to_Route__c:Customer__r.CUST_GEOFNC__c},
    {Customer_to_Route__c:Customer__r.Delta_Revenue_Percentage__c},
    {Employee_To_Route__c:Id},
    {Employee_To_Route__c:Route__c},
    {Employee_To_Route__c:User__c},
    {User:Id},
    {User:FirstName},
    {User:LastName},
    {User:Name},
    {User_Stats__c:Id}`

const MyCustomersFieldBase = [
    'TRouteSalesId',
    'TRouteSales_RTE_TERR_NM__c',
    'TRouteSales_LOCL_RTE_ID__c',
    'RouteCustomerId',
    'RouteCustomer_Customer__c',
    'RouteCustomer_Route__c',
    'AccountId',
    'AccountName',
    'AccountPhone',
    'Account_Sales_Route__c',
    'Account_ShippingAddress',
    'Account_CUST_ID__c',
    'Account_RTLR_STOR_NUM__c',
    'CUST_UNIQ_ID_VAL__c',
    'CUST_GEOFNC__c',
    'Delta_Revenue_Percentage__c',
    'EmployeeId',
    'Employee_Route__c',
    'Employee_User__c',
    'UserId',
    'UserFirstName',
    'UserLastName',
    'UserName',
    'UserStatsId'
]

const SDLMyCustomerQueries = {
    getMyCustomers: {
        f: MyCustomersFieldBase,
        q: `${MyCustomersQueryPrefix}
            FROM {Customer_to_Route__c}
            LEFT JOIN {Employee_To_Route__c} ON {Employee_To_Route__c:Route__c}={Customer_to_Route__c:Route__c}
            LEFT JOIN {User} ON {User:Id}={Employee_To_Route__c:User__c}
            LEFT JOIN {User_Stats__c} ON {User_Stats__c:User__c} = {User:Id}
            WHERE {Customer_to_Route__c:Route__r.Parent_Node__r.Parent_Node__r.SLS_UNIT_ID__c}='%s' AND {Customer_to_Route__c:Customer__r.IS_ACTIVE__c}='1'`,
        sdlF: [...MyCustomersFieldBase, 'Account.IsCDACustomer__c', 'Account.IsOTSCustomer__c', 'Account.CDA_Medal__c'],
        sdlQuery: `${MyCustomersQueryPrefix},
        {Customer_to_Route__c:Customer__r.IsCDACustomer__c},
        {Customer_to_Route__c:Customer__r.IsOTSCustomer__c},
        {Customer_to_Route__c:Customer__r.CDA_Medal__c}
        FROM {Customer_to_Route__c}
        LEFT JOIN {Employee_To_Route__c} ON {Employee_To_Route__c:Route__c}={Customer_to_Route__c:Route__c}
        LEFT JOIN {User} ON {User:Id}={Employee_To_Route__c:User__c}
        LEFT JOIN {User_Stats__c} ON {User_Stats__c:User__c} = {User:Id}
        WHERE {Customer_to_Route__c:Route__r.Parent_Node__r.Parent_Node__r.SLS_UNIT_ID__c}='%s' AND {Customer_to_Route__c:Customer__r.IS_ACTIVE__c}='1'`,
        ugmF: [
            ...MyCustomersFieldBase,
            'LOCL_RTE_ID__c',
            'GTMU_RTE_ID__c',
            'Sales_Rep_Info__c',
            'change_initiated__c',
            'BUSN_SGMNTTN_LVL_3_NM__c',
            'RetailStoreId',
            'Customer_Latitude__c',
            'Customer_Longitude__c'
        ],
        ugmQuery: `
            SELECT
            {Customer_to_Route__c:Route__r.Id},
            {Customer_to_Route__c:Route__r.RTE_TERR_NM__c},
            {Customer_to_Route__c:Route__r.LOCL_RTE_ID__c},
            {Customer_to_Route__c:Id},
            {Account:Id},
            {Customer_to_Route__c:Route__c},
            {Account:Id},
            {Account:Name},
            {Account:Phone},
            {Account:Sales_Route__c},
            {Account:ShippingAddress},
            {Account:CUST_ID__c},
            {Account:RTLR_STOR_NUM__c},
            {Account:CUST_UNIQ_ID_VAL__c},
            {Account:CUST_GEOFNC__c},
            {Account:Delta_Revenue_Percentage__c},
            {Employee_To_Route__c:Id},
            {Employee_To_Route__c:Route__c},
            {Employee_To_Route__c:User__c},
            {User:Id},
            {User:FirstName},
            {User:LastName},
            {User:Name},
            {User_Stats__c:Id},
            {Route_Sales_Geo__c:LOCL_RTE_ID__c},
            {Route_Sales_Geo__c:GTMU_RTE_ID__c},
            {Account:Sales_Rep_Info__c},
            {Account:change_initiated__c},
            {Account:BUSN_SGMNTTN_LVL_3_NM__c},
            {RetailStore:Id},
            {RetailStore:Customer_Latitude__c},
            {RetailStore:Customer_Longitude__c}
            FROM {Account} 
            JOIN {RetailStore} ON {RetailStore:AccountId} = {Account:Id}
            LEFT JOIN {Customer_to_Route__c} ON {Customer_to_Route__c:Customer__c} = {Account:Id}
            LEFT JOIN {Employee_To_Route__c} ON {Employee_To_Route__c:Route__c}={Customer_to_Route__c:Route__c}
            LEFT JOIN {Route_Sales_Geo__c} RSG ON {Account:Sales_Route__c} = {Route_Sales_Geo__c:Id}
            LEFT JOIN {User} ON {User:Id}={Employee_To_Route__c:User__c}
            LEFT JOIN {User_Stats__c} ON {User_Stats__c:User__c} = {User:Id}`
    },
    getUserWithEmployee: {
        f: [
            'EmployeeId',
            'Employee_Route__c',
            'Employee_User__c',
            'UserId',
            'UserFirstName',
            'UserLastName',
            'UserName'
        ],
        q: `
        SELECT 
        {Employee_To_Route__c:Id},
        {Employee_To_Route__c:Route__c},
        {Employee_To_Route__c:User__c},
        {User:Id},
        {User:FirstName},
        {User:LastName},
        {User:Name}
        FROM {Employee_To_Route__c} 
        LEFT JOIN {User} ON
        {User:Id}={Employee_To_Route__c:User__c}
        WHERE {Employee_To_Route__c:Route__c} IN (%s)
        `
    },
    getEmployeeProfileQuery: {
        f: [
            'UserId',
            'UserName',
            'EmployeeId',
            'Employee_Route__c',
            'Id',
            'OwnerId',
            'Route__c',
            'Merch_Flag__c',
            'Customer__c',
            'ACTV_FLG__c',
            'RecordTypeId',
            'SLS_MTHD_CDE__c',
            'IsRemoved__c',
            'LastModifiedDate',
            'CUST_RTE_FREQ_CDE__c',
            'ORD_DAYS__c'
        ],
        q: `
        SELECT 
        {User:Id},
        {User:Name},
        {Employee_To_Route__c:Id},
        {Employee_To_Route__c:Route__c},
        {Customer_to_Route__c:Id},
        {Customer_to_Route__c:OwnerId},
        {Customer_to_Route__c:Route__c},
        {Customer_to_Route__c:Merch_Flag__c},
        {Customer_to_Route__c:Customer__c},
        {Customer_to_Route__c:ACTV_FLG__c},
        {Customer_to_Route__c:RecordTypeId},
        {Customer_to_Route__c:SLS_MTHD_CDE__c},
        {Customer_to_Route__c:IsRemoved__c},
        {Customer_to_Route__c:LastModifiedDate},
        {Customer_to_Route__c:CUST_RTE_FREQ_CDE__c},
        {Customer_to_Route__c:ORD_DAYS__c}
        FROM {User} 
        LEFT JOIN {Employee_To_Route__c} ON {Employee_To_Route__c:User__c}={User:Id}
        LEFT JOIN {Customer_to_Route__c} ON {Customer_to_Route__c:Route__c}={Employee_To_Route__c:Route__c}
        WHERE {User:Id}='%s'
        `,
        ugmQuery: `
        SELECT 
        {User:Id},
        {User:Name},
        {Employee_To_Route__c:Id},
        {Employee_To_Route__c:Route__c},
        {Customer_to_Route__c:Id},
        {Customer_to_Route__c:OwnerId},
        {Customer_to_Route__c:Route__c},
        {Customer_to_Route__c:Merch_Flag__c},
        {Customer_to_Route__c:Customer__c},
        {Customer_to_Route__c:ACTV_FLG__c},
        {Customer_to_Route__c:RecordTypeId},
        {Customer_to_Route__c:SLS_MTHD_CDE__c},
        {Customer_to_Route__c:IsRemoved__c},
        {Customer_to_Route__c:LastModifiedDate},
        {Customer_to_Route__c:CUST_RTE_FREQ_CDE__c},
        {Customer_to_Route__c:ORD_DAYS__c}
        FROM {User} 
        LEFT JOIN {Employee_To_Route__c} ON {Employee_To_Route__c:User__c}={User:Id}
        LEFT JOIN {Customer_to_Route__c} ON {Customer_to_Route__c:Route__c}={Employee_To_Route__c:Route__c}
        `
    }
}
export default SDLMyCustomerQueries

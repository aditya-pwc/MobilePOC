/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-06-08 23:02:31
 * @LastEditTime: 2023-01-11 10:13:22
 * @LastEditors: Yi Li
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
        }
    ]
}

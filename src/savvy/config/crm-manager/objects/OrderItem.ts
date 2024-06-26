/*
 * @Description: Do not edit
 * @Author: Do not edit
 * @Date: 2022-03-24 01:58:08
 * @LastEditTime: 2022-04-20 00:57:18
 * @LastEditors: Yi Li
 */
export default {
    name: 'OrderItem',
    soupName: 'OrderItem',
    fieldList: [
        {
            name: 'Id',
            type: 'string'
        },
        {
            name: 'OrderId',
            type: 'string'
        },
        {
            name: 'Quantity',
            type: 'string'
        },
        {
            name: 'Certified_Quantity__c',
            type: 'string'
        },
        {
            name: 'Order.RetailStore__c',
            type: 'string'
        },
        {
            name: 'Product2Id',
            type: 'string'
        },
        {
            name: 'Pallet_Number__c',
            type: 'string'
        },
        {
            name: 'Product2.Package_Type_Name__c',
            type: 'string'
        },
        {
            name: 'Product2.Name',
            type: 'string'
        },
        {
            name: 'LastModifiedDate',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Item_Type__c',
            type: 'string'
        },
        {
            name: 'Order.Ordr_Id__c',
            type: 'string'
        },
        {
            name: 'Order_Item__c',
            type: 'string'
        },
        {
            name: 'Product2.Sub_Brand__c',
            type: 'string'
        }
    ]
}

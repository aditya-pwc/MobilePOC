export default {
    name: 'Product_Exclusion__c',
    soupName: 'Product_Exclusion__c',
    fieldList: [
        // Id not provided in csv file
        // so only part of records has Id
        {
            name: 'Id',
            type: 'string'
        },
        {
            name: 'Target_Value__c',
            type: 'string'
        },
        {
            name: 'Inven_Id__c',
            type: 'string'
        },
        {
            name: 'Target_Level__c',
            type: 'string'
        }
    ]
}

export default {
    name: 'Customer_to_Route__c',
    soupName: 'Customer_to_Route__c',
    fieldList: [
        {
            name: 'Id',
            type: 'string'
        },
        {
            name: 'Route__c',
            type: 'string'
        },
        {
            name: 'ACTV_FLG__c',
            type: 'boolean'
        },
        {
            name: 'LastModifiedDate',
            type: 'string'
        },
        {
            name: 'Customer__c',
            type: 'string'
        },
        {
            name: 'Route__r.RTE_ID__c',
            type: 'string'
        },
        {
            name: 'Route__r.GTMU_RTE_ID__c',
            type: 'string'
        }
    ]
}

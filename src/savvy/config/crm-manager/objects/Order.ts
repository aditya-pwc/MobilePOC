export default {
    name: 'Order',
    soupName: 'Order',
    fieldList: [
        {
            name: 'Id',
            type: 'string'
        },
        {
            name: 'Dlvry_Rqstd_Dtm__c',
            type: 'string',
            syncUpCreate: true
        },
        {
            name: 'RetailStore__c',
            type: 'string',
            syncUpCreate: true
        },
        {
            name: 'Pallet_Count__c',
            type: 'string',
            syncUpCreate: true
        },
        {
            name: 'Pallet_Total_IntCount__c',
            type: 'string',
            syncUpCreate: true
        },
        {
            name: 'Visit__c',
            type: 'string',
            syncUpCreate: true
        },
        {
            name: 'Total_Ordered__c',
            type: 'string',
            syncUpCreate: true
        },
        {
            name: 'Total_Ordered_IntCount__c',
            type: 'string',
            syncUpCreate: true
        },
        {
            name: 'Ordr_Id__c',
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
            name: 'Total_Return_Cs__c',
            type: 'string'
        },
        {
            name: 'Total_Return_Cs_IntCount__c',
            type: 'string'
        },
        {
            name: 'Total_Return_Un__c',
            type: 'string'
        },
        {
            name: 'Total_Return_Un_IntCount__c',
            type: 'string'
        }
    ]
}

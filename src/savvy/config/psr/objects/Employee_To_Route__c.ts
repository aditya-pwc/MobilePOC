export default {
    name: 'Employee_To_Route__c',
    soupName: 'Employee_To_Route__c',
    initQuery:
        "SELECT Id,Route__c,User__c,Active_Flag__c,Status__c FROM Employee_To_Route__c WHERE User__c ='%s' " +
        "AND Active_Flag__c = true AND Status__c = 'Processed'",
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
            name: 'User__c',
            type: 'string'
        },
        {
            name: 'Active_Flag__c',
            type: 'boolean'
        },
        {
            name: 'Status__c',
            type: 'string'
        },
        {
            name: 'User__r.Name',
            type: 'string'
        },
        {
            name: 'User__r.GPID__c',
            type: 'string'
        },
        {
            name: 'GTMU_ID__c',
            type: 'Integer'
        },
        {
            name: 'RLTNSHP_STRT_DT__c',
            type: 'string'
        },
        {
            name: 'Route__r.LOCL_RTE_ID__c',
            type: 'string'
        },
        {
            name: 'Route__r.GTMU_RTE_ID__c',
            type: 'string'
        }
    ]
}

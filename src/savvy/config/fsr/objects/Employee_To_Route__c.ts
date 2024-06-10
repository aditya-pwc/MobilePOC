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
        }
    ]
}

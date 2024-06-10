export default {
    name: 'Time_Interval_Configuration__mdt',
    soupName: 'Time_Interval_Configuration__mdt',
    noLastModifiedField: true,
    initQuery:
        'SELECT Id, AfterEndTime__c, BeforeStartTime__c, Persona__c, Status__c FROM Time_Interval_Configuration__mdt',
    fieldList: [
        {
            name: 'Id',
            type: 'string'
        },
        {
            name: 'AfterEndTime__c',
            type: 'string'
        },
        {
            name: 'BeforeStartTime__c',
            type: 'string'
        },
        {
            name: 'Persona__c',
            type: 'string'
        },
        {
            name: 'Status__c',
            type: 'string'
        }
    ]
}

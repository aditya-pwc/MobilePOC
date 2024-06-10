export default {
    name: 'PepsiCo_Period_Calendar__mdt',
    soupName: 'PepsiCo_Period_Calendar__mdt',
    initQuery: 'SELECT Id, End_Date__c, Sequence__c, Start_Date__c, Year__c FROM PepsiCo_Period_Calendar__mdt',
    fieldList: [
        {
            name: 'Id',
            type: 'string'
        },
        {
            name: 'End_Date__c',
            type: 'string'
        },
        {
            name: 'Sequence__c',
            type: 'string'
        },
        {
            name: 'Start_Date__c',
            type: 'string'
        },
        {
            name: 'Year__c',
            type: 'string'
        }
    ]
}

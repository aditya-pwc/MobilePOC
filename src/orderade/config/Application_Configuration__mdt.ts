export default {
    name: 'Application_Configuration__mdt',
    soupName: 'Application_Configuration__mdt',
    initQuery:
        'SELECT Id, MasterLabel, DistTarget__c, Is_Compared__c, Type__c, Value__c ' +
        'FROM Application_Configuration__mdt',
    fieldList: [
        {
            name: 'Id',
            type: 'string'
        },
        {
            name: 'MasterLabel',
            type: 'string'
        },
        {
            name: 'DistTarget__c',
            type: 'string'
        },
        {
            name: 'Is_Compared__c',
            type: 'string'
        },
        {
            name: 'Type__c',
            type: 'string'
        },
        {
            name: 'Value__c',
            type: 'string'
        }
    ]
}

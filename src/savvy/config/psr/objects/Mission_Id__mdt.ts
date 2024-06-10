export default {
    name: 'Mission_Id__mdt',
    soupName: 'Mission_Id__mdt',
    initQuery:
        'SELECT  Id, Mission_Name__c, Mission_Type__c, Country__c,Mission_Id_Value__c, Mission_Division__c ' +
        'FROM Mission_Id__mdt',
    fieldList: [
        {
            name: 'Id',
            type: 'string'
        },
        {
            name: 'Mission_Id_Value__c',
            type: 'string'
        },
        {
            name: 'Mission_Name__c',
            type: 'string'
        },
        {
            name: 'Mission_Type__c',
            type: 'string'
        },
        {
            name: 'Country__c',
            type: 'string'
        },
        {
            name: 'Mission_Division__c',
            type: 'string'
        }
    ]
}

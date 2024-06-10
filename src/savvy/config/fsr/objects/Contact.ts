export default {
    name: 'Contact',
    soupName: 'Contact',
    fieldList: [
        {
            name: 'Id',
            type: 'string'
        },
        {
            name: 'Email',
            type: 'string'
        },
        {
            name: 'FirstName',
            type: 'string'
        },
        {
            name: 'LastName',
            type: 'string'
        },
        {
            name: 'MobilePhone',
            type: 'string'
        },
        {
            name: 'Name',
            type: 'string'
        },
        {
            name: 'OwnerId',
            type: 'string'
        },
        {
            name: 'Phone',
            type: 'string'
        },
        {
            name: 'Primary_Phone_Extension__c',
            type: 'string'
        },
        {
            name: 'Primary_Phone_Type__c',
            type: 'string'
        },
        {
            name: 'Second_Phone_Extension__c',
            type: 'string'
        },
        {
            name: 'Second_Phone_Type__c',
            type: 'string'
        },
        {
            name: 'Primary_Contact__c',
            type: 'boolean'
        },
        {
            name: 'Preferred_Contact_Method__c',
            type: 'string'
        },
        {
            name: 'Notes__c',
            type: 'string'
        },
        {
            name: 'Secondary_Contact__c',
            type: 'boolean'
        },
        {
            name: 'AccountId',
            type: 'string'
        },
        {
            name: 'Lead__c',
            type: 'string'
        },
        {
            name: 'Title',
            type: 'string'
        },
        {
            name: 'CreatedDate',
            type: 'string'
        }
    ],
    syncUpCreateFields: [
        'Title',
        'Email',
        'FirstName',
        'LastName',
        'MobilePhone',
        'Phone',
        'Primary_Phone_Extension__c',
        'Primary_Phone_Type__c',
        'Second_Phone_Extension__c',
        'Second_Phone_Type__c',
        'Primary_Contact__c',
        'Preferred_Contact_Method__c',
        'Notes__c',
        'Secondary_Contact__c',
        'AccountId',
        'Lead__c'
    ],
    syncUpCreateQuery:
        'SELECT {Contact:Title},{Contact:Email},{Contact:FirstName},{Contact:LastName},' +
        '{Contact:MobilePhone},{Contact:Phone},{Contact:Primary_Phone_Extension__c},' +
        '{Contact:Primary_Phone_Type__c},{Contact:Second_Phone_Extension__c},{Contact:Second_Phone_Type__c},' +
        '{Contact:Primary_Contact__c},{Contact:Preferred_Contact_Method__c},{Contact:Notes__c},' +
        '{Contact:Secondary_Contact__c},{Contact:AccountId}, {Contact:_soupEntryId},{Contact:__local__},' +
        '{Contact:__locally_created__},{Contact:__locally_updated__}, {Contact:__locally_deleted__} ' +
        "FROM {Contact} WHERE {Contact:__locally_created__}='1'",
    syncUpUpdateFields: [
        'Id',
        'Title',
        'Email',
        'FirstName',
        'LastName',
        'MobilePhone',
        'Phone',
        'Primary_Phone_Extension__c',
        'Primary_Phone_Type__c',
        'Second_Phone_Extension__c',
        'Second_Phone_Type__c',
        'Primary_Contact__c',
        'Preferred_Contact_Method__c',
        'Notes__c',
        'Secondary_Contact__c',
        'AccountId',
        'Lead__c'
    ],
    syncUpUpdateQuery:
        'SELECT {Contact:Id},{Contact:Title},{Contact:Email},{Contact:FirstName},' +
        '{Contact:LastName},{Contact:MobilePhone},{Contact:Phone},{Contact:Primary_Phone_Extension__c},' +
        '{Contact:Primary_Phone_Type__c},{Contact:Second_Phone_Extension__c},{Contact:Second_Phone_Type__c},' +
        '{Contact:Primary_Contact__c},{Contact:Preferred_Contact_Method__c},{Contact:Notes__c},' +
        '{Contact:Secondary_Contact__c},{Contact:AccountId},{Contact:_soupEntryId},' +
        '{Contact:__local__},{Contact:__locally_created__},{Contact:__locally_updated__},' +
        " {Contact:__locally_deleted__} FROM {Contact} WHERE {Contact:__locally_updated__}='1'"
}

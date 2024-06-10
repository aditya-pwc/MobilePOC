export default {
    name: 'User',
    soupName: 'User',
    initQuery:
        'SELECT Id, Name, Phone, Profile.Name, GM_LOC_ID__c, FirstName, LastName,' +
        ' GPID__c, PERSONA__c, MobilePhone, IsActive, Title, FT_EMPLYE_FLG_VAL__c, Email FROM User' +
        " WHERE Id = '%s'",
    fieldList: [
        {
            name: 'Id',
            type: 'string'
        },
        {
            name: 'Name',
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
            name: 'Profile.Name',
            type: 'string'
        },
        {
            name: 'Phone',
            type: 'string'
        },
        {
            name: 'GM_LOC_ID__c',
            type: 'string'
        },
        {
            name: 'GM_LOC_NM__c',
            type: 'string'
        },
        {
            name: 'GPID__c',
            type: 'string'
        },
        {
            name: 'PERSONA__c',
            type: 'string'
        },
        {
            name: 'MobilePhone',
            type: 'string'
        },
        {
            name: 'Title',
            type: 'string'
        },
        {
            name: 'FT_EMPLYE_FLG_VAL__c',
            type: 'string'
        },
        {
            name: 'USER_ACTIVE__c',
            type: 'string'
        },
        {
            name: 'BU_ID__c',
            type: 'string'
        },
        {
            name: 'EMPLYMT_TYP_NM__c',
            type: 'string'
        },
        {
            name: 'IsActive',
            type: 'boolean'
        },
        {
            name: 'Email',
            type: 'string'
        }
    ]
}

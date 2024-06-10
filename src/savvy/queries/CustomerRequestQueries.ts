const contactAllFields =
    'SELECT {Contact:Id},{Contact:Email},{Contact:FirstName},' +
    '{Contact:LastName},{Contact:MobilePhone},' +
    '{Contact:Name},{Contact:OwnerId},{Contact:Phone},{Contact:Primary_Phone_Extension__c},' +
    '{Contact:Primary_Phone_Type__c},{Contact:Second_Phone_Extension__c},{Contact:Second_Phone_Type__c},' +
    '{Contact:Primary_Contact__c},{Contact:Preferred_Contact_Method__c},{Contact:Notes__c},' +
    '{Contact:Secondary_Contact__c},{Contact:Lead__c},{Contact:AccountId},{Contact:Title},{Contact:_soupEntryId},' +
    '{Contact:__local__},{Contact:__locally_created__},' +
    '{Contact:__locally_updated__},{Contact:__locally_deleted__}'
const CustomerRequestQueries = {
    getRequestContactByCustomerId: {
        f: [
            'Id',
            'Email',
            'FirstName',
            'LastName',
            'MobilePhone',
            'Name',
            'OwnerId',
            'Phone',
            'Primary_Phone_Extension__c',
            'Primary_Phone_Type__c',
            'Second_Phone_Extension__c',
            'Second_Phone_Type__c',
            'Primary_Contact__c',
            'Preferred_Contact_Method__c',
            'Notes__c',
            'Secondary_Contact__c',
            'Lead__c',
            'AccountId',
            'Title'
        ],
        q:
            contactAllFields +
            " FROM {Contact} WHERE {Contact:AccountId} = '%s' AND {Contact:Name} = '%s' ORDER BY {Contact:Primary_Contact__c} DESC NULLS LAST," +
            ' {Contact:Secondary_Contact__c} DESC NULLS LAST, {Contact:CreatedDate} DESC',
        qLead:
            contactAllFields +
            " FROM {Contact} WHERE {Contact:Lead__c} = '%s' AND {Contact:Name} = '%s' ORDER BY {Contact:Primary_Contact__c} DESC NULLS LAST," +
            ' {Contact:Secondary_Contact__c} DESC NULLS LAST, {Contact:CreatedDate} DESC'
    }
}
export default CustomerRequestQueries
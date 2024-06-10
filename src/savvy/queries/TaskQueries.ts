const TaskQueries = {
    getHistoryTaskByLeadExternalIdQuery: {
        f: [
            'Id',
            'Description',
            'COF_Requested_Date__c',
            'Subject',
            'Type',
            'Owner.Name',
            'Lead__c',
            'RecordTypeId',
            'Call_Date__c',
            'Call_Details__c',
            'Call_Details2__c',
            'Call_Details3__c',
            'Call_Subject__c',
            'Contact_Made__c',
            'Name_of_Contact__c',
            'Onsite__c',
            'Status',
            'CreatedDate',
            'ActivityDate',
            'OwnerId',
            'CreatedBy.Name',
            'LastModifiedDate'
        ],
        q:
            'SELECT {Task:Id},{Task:Description},{Task:COF_Requested_Date__c},{Task:Subject},{Task:Type},' +
            '{Task:Owner.Name},{Task:Lead__c},{Task:RecordTypeId},{Task:Call_Date__c},{Task:Call_Details__c},' +
            '{Task:Call_Details2__c},{Task:Call_Details3__c},' +
            '{Task:Call_Subject__c},{Task:Contact_Made__c},{Task:Name_of_Contact__c},{Task:Onsite__c},' +
            '{Task:Status},{Task:CreatedDate},{Task:ActivityDate},{Task:OwnerId},{Task:CreatedBy.Name},{Task:LastModifiedDate},' +
            '{Task:_soupEntryId},{Task:__local__},{Task:__locally_created__},' +
            '{Task:__locally_updated__},{Task:__locally_deleted__} FROM {Task}' +
            " WHERE {Task:Lead__c}='%s' AND {Task:Status}='Complete' ORDER BY {Task:LastModifiedDate} DESC "
    },
    getOpenTaskByLeadExternalIdQuery: {
        f: [
            'Id',
            'Description',
            'COF_Requested_Date__c',
            'Subject',
            'Type',
            'Owner.Name',
            'Lead__c',
            'RecordTypeId',
            'Call_Date__c',
            'Call_Details__c',
            'Call_Details2__c',
            'Call_Details3__c',
            'Call_Subject__c',
            'Contact_Made__c',
            'Name_of_Contact__c',
            'Onsite__c',
            'Status',
            'CreatedDate',
            'ActivityDate',
            'OwnerId',
            'CreatedBy.Name',
            'LastModifiedDate'
        ],
        q:
            'SELECT {Task:Id},{Task:Description},{Task:COF_Requested_Date__c},{Task:Subject},{Task:Type},' +
            '{Task:Owner.Name},{Task:Lead__c},{Task:RecordTypeId},{Task:Call_Date__c},{Task:Call_Details__c},' +
            '{Task:Call_Details2__c},{Task:Call_Details3__c},' +
            '{Task:Call_Subject__c},{Task:Contact_Made__c},{Task:Name_of_Contact__c},{Task:Onsite__c},' +
            '{Task:Status},{Task:CreatedDate},{Task:ActivityDate},{Task:OwnerId},{Task:CreatedBy.Name},' +
            '{Task:LastModifiedDate},{Task:_soupEntryId},{Task:__local__},{Task:__locally_created__},' +
            '{Task:__locally_updated__},{Task:__locally_deleted__} FROM {Task}' +
            " WHERE {Task:Lead__c}='%s' AND {Task:Status}='Open' ORDER BY {Task:ActivityDate} DESC "
    },
    getOpenTaskByOwnerIdQuery: {
        f: [
            'Id',
            'Description',
            'COF_Requested_Date__c',
            'Subject',
            'Type',
            'Owner.Name',
            'Lead__c',
            'RecordTypeId',
            'Call_Date__c',
            'Call_Details__c',
            'Call_Details2__c',
            'Call_Details3__c',
            'Call_Subject__c',
            'Contact_Made__c',
            'Name_of_Contact__c',
            'Onsite__c',
            'Status',
            'CreatedDate',
            'ActivityDate',
            'OwnerId',
            'CreatedBy.Name',
            'LastModifiedDate',
            'Status__c',
            'Owner_GPID_c__c',
            'ExternalId',
            'Company__c'
        ],
        q:
            'SELECT {Task:Id},{Task:Description},{Task:COF_Requested_Date__c},{Task:Subject},{Task:Type},' +
            '{Task:Owner.Name},{Task:Lead__c},{Task:RecordTypeId},{Task:Call_Date__c},{Task:Call_Details__c},' +
            '{Task:Call_Details2__c},{Task:Call_Details3__c},' +
            '{Task:Call_Subject__c},{Task:Contact_Made__c},{Task:Name_of_Contact__c},{Task:Onsite__c},' +
            '{Task:Status},{Task:CreatedDate},{Task:ActivityDate},{Task:OwnerId},' +
            '{Task:CreatedBy.Name},{Task:LastModifiedDate},{Lead__x:Status__c},' +
            '{Lead__x:Owner_GPID_c__c},{Lead__x:ExternalId},{Lead__x:Company__c},' +
            '{Task:_soupEntryId},{Task:__local__},{Task:__locally_created__},' +
            '{Task:__locally_updated__},{Task:__locally_deleted__} FROM {Task}' +
            ' JOIN {Lead__x} ON {Task:Lead__c} = {Lead__x:ExternalId}' +
            " WHERE {Task:OwnerId}='%s' AND {Task:Status}='Open' AND {Lead__x:Status__c}='Negotiate'"
    },
    getTaskByOwnerIdQuery: {
        f: [
            'Id',
            'Description',
            'COF_Requested_Date__c',
            'Subject',
            'Type',
            'Owner.Name',
            'Lead__c',
            'RecordTypeId',
            'Call_Date__c',
            'Call_Details__c',
            'Call_Details2__c',
            'Call_Details3__c',
            'Call_Subject__c',
            'Contact_Made__c',
            'Name_of_Contact__c',
            'Onsite__c',
            'Status',
            'CreatedDate',
            'ActivityDate',
            'OwnerId',
            'CreatedBy.Name',
            'LastModifiedDate'
        ],
        q:
            'SELECT {Task:Id},{Task:Description},{Task:COF_Requested_Date__c},{Task:Subject},{Task:Type},' +
            '{Task:Owner.Name},{Task:Lead__c},{Task:RecordTypeId},{Task:Call_Date__c},{Task:Call_Details__c},' +
            '{Task:Call_Details2__c},{Task:Call_Details3__c},' +
            '{Task:Call_Subject__c},{Task:Contact_Made__c},{Task:Name_of_Contact__c},{Task:Onsite__c},' +
            '{Task:Status},{Task:CreatedDate},{Task:ActivityDate},{Task:OwnerId},{Task:CreatedBy.Name},{Task:LastModifiedDate},' +
            '{Task:_soupEntryId},{Task:__local__},{Task:__locally_created__},' +
            '{Task:__locally_updated__},{Task:__locally_deleted__} FROM {Task}' +
            " WHERE {Task:OwnerId}='%s'"
    },
    getCofRejectedTaskByLeadExternalIdQuery: {
        f: [
            'Id',
            'Description',
            'COF_Requested_Date__c',
            'Subject',
            'Type',
            'Owner.Name',
            'Lead__c',
            'RecordTypeId',
            'Call_Date__c',
            'Call_Details__c',
            'Call_Details2__c',
            'Call_Details3__c',
            'Call_Subject__c',
            'Contact_Made__c',
            'Name_of_Contact__c',
            'Onsite__c',
            'Status',
            'CreatedDate'
        ],
        q:
            'SELECT {Task:Id},{Task:Description},{Task:COF_Requested_Date__c},{Task:Subject},{Task:Type},' +
            '{Task:Owner.Name},{Task:Lead__c},{Task:RecordTypeId},{Task:Call_Date__c},{Task:Call_Details__c},' +
            '{Task:Call_Details2__c},{Task:Call_Details3__c},' +
            '{Task:Call_Subject__c},{Task:Contact_Made__c},{Task:Name_of_Contact__c},{Task:Onsite__c},{Task:Status},' +
            '{Task:CreatedDate},{Task:_soupEntryId},{Task:__local__},{Task:__locally_created__},' +
            '{Task:__locally_updated__},{Task:__locally_deleted__} FROM {Task} ' +
            "WHERE {Task:Lead__c}='%s' AND {Task:Subject}='Customer Rejected' ORDER BY {Task:CreatedDate} DESC"
    },
    getOpenTaskToUpdateByLeadExternalIdQuery: {
        f: [
            'Id',
            'Description',
            'COF_Requested_Date__c',
            'Subject',
            'Type',
            'Owner.Name',
            'Lead__c',
            'RecordTypeId',
            'Call_Date__c',
            'Call_Details__c',
            'Call_Details2__c',
            'Call_Details3__c',
            'Call_Subject__c',
            'Contact_Made__c',
            'Name_of_Contact__c',
            'Onsite__c',
            'Status',
            'CreatedDate',
            'ActivityDate',
            'OwnerId',
            'CreatedBy.Name',
            'LastModifiedDate'
        ],
        q:
            'SELECT {Task:Id},{Task:Description},{Task:COF_Requested_Date__c},{Task:Subject},{Task:Type},' +
            '{Task:Owner.Name},{Task:Lead__c},{Task:RecordTypeId},{Task:Call_Date__c},{Task:Call_Details__c},' +
            '{Task:Call_Details2__c},{Task:Call_Details3__c},' +
            '{Task:Call_Subject__c},{Task:Contact_Made__c},{Task:Name_of_Contact__c},{Task:Onsite__c},' +
            '{Task:Status},{Task:CreatedDate},{Task:ActivityDate},{Task:OwnerId},{Task:CreatedBy.Name},{Task:LastModifiedDate},' +
            '{Task:_soupEntryId},{Task:__local__},{Task:__locally_created__},' +
            '{Task:__locally_updated__},{Task:__locally_deleted__} FROM {Task}' +
            " WHERE {Task:Lead__c}='%s' AND {Task:Status}='Open'"
    },
    getUnreadTasks: {
        f: [
            'Id',
            'Description',
            'COF_Requested_Date__c',
            'Subject',
            'Type',
            'Owner.Name',
            'Lead__c',
            'RecordTypeId',
            'Call_Date__c',
            'Call_Details__c',
            'Call_Details2__c',
            'Call_Details3__c',
            'Call_Subject__c',
            'Contact_Made__c',
            'Name_of_Contact__c',
            'Onsite__c',
            'Status',
            'CreatedDate'
        ],
        q:
            'SELECT {Task:Id},{Task:Description},{Task:COF_Requested_Date__c},{Task:Subject},{Task:Type},' +
            '{Task:Owner.Name},{Task:Lead__c},{Task:RecordTypeId},{Task:Call_Date__c},{Task:Call_Details__c},' +
            '{Task:Call_Details2__c},{Task:Call_Details3__c},' +
            '{Task:Call_Subject__c},{Task:Contact_Made__c},{Task:Name_of_Contact__c},{Task:Onsite__c},{Task:Status},' +
            '{Task:CreatedDate},{Task:_soupEntryId},{Task:__local__},{Task:__locally_created__},' +
            "{Task:__locally_updated__},{Task:__locally_deleted__} FROM {Task} WHERE {Task:Lead__c}='%s' " +
            "AND {Task:__local__} IS NOT TRUE AND ({Task:Subject}='Customer Requested' " +
            "OR {Task:Subject}='Customer Rejected') ORDER BY {Task:CreatedDate} DESC"
    },
    getHistoryTaskByWhatIdQuery: {
        f: [
            'Id',
            'Description',
            'COF_Requested_Date__c',
            'Subject',
            'Type',
            'Owner.Name',
            'Lead__c',
            'RecordTypeId',
            'Call_Date__c',
            'Call_Details__c',
            'Call_Details2__c',
            'Call_Details3__c',
            'Call_Subject__c',
            'Contact_Made__c',
            'Name_of_Contact__c',
            'Onsite__c',
            'Status',
            'CreatedDate',
            'ActivityDate',
            'OwnerId',
            'CreatedBy.Name',
            'LastModifiedDate',
            'CompletedDateTime',
            'CreatedBy.GPID__c',
            'Hotshot__c'
        ],
        q:
            'SELECT {Task:Id},{Task:Description},{Task:COF_Requested_Date__c},{Task:Subject},{Task:Type},' +
            '{Task:Owner.Name},{Task:Lead__c},{Task:RecordTypeId},{Task:Call_Date__c},{Task:Call_Details__c},' +
            '{Task:Call_Details2__c},{Task:Call_Details3__c},' +
            '{Task:Call_Subject__c},{Task:Contact_Made__c},{Task:Name_of_Contact__c},{Task:Onsite__c},' +
            '{Task:Status},{Task:CreatedDate},{Task:ActivityDate},{Task:OwnerId},{Task:CreatedBy.Name},{Task:LastModifiedDate},' +
            '{Task:CompletedDateTime}, {Task:CreatedBy.GPID__c}, {Task:Hotshot__c}, {Task:_soupEntryId},{Task:__local__},{Task:__locally_created__},' +
            '{Task:__locally_updated__},{Task:__locally_deleted__} FROM {Task}' +
            " WHERE {Task:WhatId}='%s' AND {Task:RecordTypeId}='%s' AND {Task:Status}='Complete' " +
            'ORDER BY {Task:CompletedDateTime} DESC,{Task:LastModifiedDate} DESC '
    },
    getOpenTaskByWhatIdQuery: {
        f: [
            'Id',
            'Description',
            'COF_Requested_Date__c',
            'Subject',
            'Type',
            'Owner.Name',
            'Lead__c',
            'RecordTypeId',
            'Call_Date__c',
            'Call_Details__c',
            'Call_Details2__c',
            'Call_Details3__c',
            'Call_Subject__c',
            'Contact_Made__c',
            'Name_of_Contact__c',
            'Onsite__c',
            'Status',
            'CreatedDate',
            'ActivityDate',
            'OwnerId',
            'CreatedBy.Name',
            'LastModifiedDate',
            'CreatedBy.GPID__c',
            'Hotshot__c'
        ],
        q:
            'SELECT {Task:Id},{Task:Description},{Task:COF_Requested_Date__c},{Task:Subject},{Task:Type},' +
            '{Task:Owner.Name},{Task:Lead__c},{Task:RecordTypeId},{Task:Call_Date__c},{Task:Call_Details__c},' +
            '{Task:Call_Details2__c},{Task:Call_Details3__c},' +
            '{Task:Call_Subject__c},{Task:Contact_Made__c},{Task:Name_of_Contact__c},{Task:Onsite__c},' +
            '{Task:Status},{Task:CreatedDate},{Task:ActivityDate},{Task:OwnerId},{Task:CreatedBy.Name},' +
            '{Task:LastModifiedDate},{Task:CreatedBy.GPID__c}, {Task:Hotshot__c},{Task:_soupEntryId},{Task:__local__},{Task:__locally_created__},' +
            '{Task:__locally_updated__},{Task:__locally_deleted__} FROM {Task}' +
            " WHERE {Task:WhatId}='%s' AND {Task:Status}='Open' ORDER BY {Task:ActivityDate} DESC "
    },
    getOpenTaskByAccountIdQuery: {
        f: [
            'Id',
            'Description',
            'COF_Requested_Date__c',
            'Subject',
            'Type',
            'Owner.Name',
            'Lead__c',
            'RecordTypeId',
            'Call_Date__c',
            'Call_Details__c',
            'Call_Details2__c',
            'Call_Details3__c',
            'Call_Subject__c',
            'Contact_Made__c',
            'Name_of_Contact__c',
            'Onsite__c',
            'Status',
            'CreatedDate',
            'ActivityDate',
            'OwnerId',
            'CreatedBy.Name',
            'LastModifiedDate',
            'WhatId',
            'Name'
        ],
        q:
            'SELECT {Task:Id},{Task:Description},{Task:COF_Requested_Date__c},{Task:Subject},{Task:Type},' +
            '{Task:Owner.Name},{Task:Lead__c},{Task:RecordTypeId},{Task:Call_Date__c},{Task:Call_Details__c},' +
            '{Task:Call_Details2__c},{Task:Call_Details3__c},' +
            '{Task:Call_Subject__c},{Task:Contact_Made__c},{Task:Name_of_Contact__c},{Task:Onsite__c},' +
            '{Task:Status},{Task:CreatedDate},{Task:ActivityDate},{Task:OwnerId},' +
            '{Task:CreatedBy.Name},{Task:LastModifiedDate},{Task:WhatId},{RetailStore:Name},' +
            '{Task:_soupEntryId},{Task:__local__},{Task:__locally_created__},' +
            '{Task:__locally_updated__},{Task:__locally_deleted__} FROM {Task} ' +
            ' JOIN {RetailStore} ON {Task:WhatId} = {RetailStore:AccountId}' +
            " WHERE {Task:OwnerId}='%s' AND {Task:Status}='Open'"
    }
}
export default TaskQueries

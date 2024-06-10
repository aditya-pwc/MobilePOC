/*
 * @Author: your name
 * @Date: 2021-10-25 21:04:02
 * @LastEditTime: 2022-06-06 00:43:37
 * @LastEditors: Mary Qian
 * @Description: In User Settings Edit
 * @FilePath: /Halo_Mobile/src/queries/MyVisitQueries.ts
 */
const basicQuery =
    'SELECT {Event:Id}, {Event:StartDateTime}, {Event:EndDateTime},{Event:Actual_Start_Time__c}, ' +
    '{Event:Actual_End_Time__c}, {Event:Type}, {Event:SubType__c}, {Event:Attendees_Count__c}, {Event:IsActive}, {Event:Subject},{Event:OwnerId}' +
    ', {Event:Start_Location__latitude__s}, {Event:Start_Location__longitude__s}, {Event:End_Location__latitude__s}, ' +
    '{Event:End_Location__longitude__s}, {Event:Visit_List__c}, {Event:Manager_Scheduled__c}, {Event:Location}, ' +
    '{Event:Description}, {Event:MeetingName__c}, {Event:VirtualLocation__c}, {Event:ActivityDate}, {Event:Parent_Event__c}, ' +
    '{Event:Planned_Duration__c}, {Event:Planned_Duration__c}, {Event:Location__c}, {Event:Aggregate_Duration__c}, {Event:Planned_Cost__c}, {Event:WhatId} ' +
    ',{Event:_soupEntryId},{Event:__local__},{Event:__locally_created__},{Event:__locally_updated__},{Event:__locally_deleted__}' +
    ' FROM {Event} '
const targetKeys = [
    'Id',
    'StartDateTime',
    'EndDateTime',
    'Actual_Start_Time__c',
    'Actual_End_Time__c',
    'Type',
    'SubType__c',
    'Attendees_Count__c',
    'IsActive',
    'Subject',
    'OwnerId',
    'Start_Location__latitude__s',
    'Start_Location__longitude__s',
    'End_Location__latitude__s',
    'End_Location__longitude__s',
    'Visit_List__c',
    'Manager_Scheduled__c',
    'Location',
    'Description',
    'MeetingName',
    'VirtualLocation__c',
    'ActivityDate',
    'Parent_Event__c',
    'PlannedDuration',
    'Planned_Duration__c',
    'Location__c',
    'Aggregate_Duration__c',
    'Planned_Cost__c',
    'WhatId'
]
const scheduleMeetingQuery = "WHERE {Event:Manager_Scheduled__c}='1'" + " AND {Event:OwnerId}='%s'"
const MyVisitQueries = {
    getEventQuery: {
        q:
            basicQuery +
            "WHERE ({Event:Type}='Lunch' OR {Event:Type}='Break' OR {Event:Type}='Meeting' OR " +
            " {Event:SubType__c} IS NOT NULL OR {Event:Type}='Personal Time') AND {Event:OwnerId}='%s' " +
            'AND {Event:Actual_End_Time__c} IS NULL AND {Event:Actual_Start_Time__c} IS NOT NULL ' +
            'ORDER BY {Event:StartDateTime} DESC',
        f: targetKeys
    },
    getMeetingDataQuery: {
        startMeeting:
            basicQuery +
            scheduleMeetingQuery +
            ' AND ({Event:Actual_End_Time__c} IS NULL) AND {Event:IsRemoved__c} IS NOT TRUE ORDER BY {Event:StartDateTime} DESC',
        endMeeting:
            basicQuery +
            scheduleMeetingQuery +
            ' AND {Event:Actual_End_Time__c} IS NOT NULL AND {Event:IsRemoved__c} IS NOT TRUE ORDER BY {Event:Actual_End_Time__c} ASC',
        targetValues: targetKeys
    },
    getAllEventsQuery: {
        initQuery:
            'SELECT Id, OwnerId, StartDateTime, EndDateTime, Type, ' +
            'SubType__c, Subject, Start_Location__latitude__s, Start_Location__longitude__s, ' +
            'End_Location__latitude__s, End_Location__longitude__s, Visit_List__c, LastModifiedDate FROM Event' +
            " WHERE OwnerId = '%s'"
    },
    gofenceQuery: {
        q: `SELECT
        {Breadcrumb_Timestamps__c:Id},
        {Breadcrumb_Timestamps__c:Customer__c},
        {Breadcrumb_Timestamps__c:Geofence_Direction__c},
        {Breadcrumb_Timestamps__c:Time__c},
        {Breadcrumb_Timestamps__c:User__c},
        {Breadcrumb_Timestamps__c:Visit__c},
        {Breadcrumb_Timestamps__c:Visit_List__c},
        {Breadcrumb_Timestamps__c:_soupEntryId},
        {Breadcrumb_Timestamps__c:__local__},
        {Breadcrumb_Timestamps__c:__locally_created__},
        {Breadcrumb_Timestamps__c:__locally_updated__},
        {Breadcrumb_Timestamps__c:__locally_deleted__}
        FROM {Breadcrumb_Timestamps__c}
        WHERE {Breadcrumb_Timestamps__c:User__c}='%s'
        %s
        ORDER BY {Breadcrumb_Timestamps__c:Time__c} ASC
        `,
        f: ['Id', 'Customer__c', 'Geofence_Direction__c', 'Time__c', 'User__c', 'Visit__c', 'Visit_List__c']
    },
    addVisitQuery: {
        q: "SELECT {RetailStore:Name}, {RetailStore:Street}, {RetailStore:City}, {RetailStore:State}, {RetailStore:PostalCode}, {RetailStore:Id}, {RetailStore:Account.CUST_UNIQ_ID_VAL__c}, {RetailStore:AccountId} FROM {RetailStore} WHERE {RetailStore:Account.Merchandising_Base_Minimum_Requirement__c} = '1'",
        f: ['Name', 'Street', 'City', 'State', 'PostalCode', 'Id', 'Account.CUST_UNIQ_ID_VAL__c', 'AccountId']
    },
    breadcrumbQuery: {
        q:
            'SELECT {Breadcrumb_Timestamps__c:Customer__c},{Breadcrumb_Timestamps__c:Geofence_Direction__c}, ' +
            '{Breadcrumb_Timestamps__c:Time__c}, {Breadcrumb_Timestamps__c:User__c}, ' +
            '{Breadcrumb_Timestamps__c:Visit__c}, {Breadcrumb_Timestamps__c:Visit_List__c}, {Breadcrumb_Timestamps__c:_soupEntryId} ' +
            'FROM {Breadcrumb_Timestamps__c} WHERE {Breadcrumb_Timestamps__c:Id} IS NULL',
        f: ['Customer__c', 'Geofence_Direction__c', 'Time__c', 'User__c', 'Visit__c', 'Visit_List__c']
    }
}

export default MyVisitQueries

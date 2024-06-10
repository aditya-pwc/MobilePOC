export default {
    name: 'Event',
    soupName: 'Event',
    optimization: true,
    optimizationQuery: ' AND IsRemoved__c = false',
    fieldList: [
        {
            name: 'Id',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'OwnerId',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'LastModifiedDate',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'StartDateTime',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'EndDateTime',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Type',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Subject',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Visit_List__c',
            type: 'string'
        },
        {
            name: 'SubType__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Actual_Start_Time__c',
            type: 'string'
        },
        {
            name: 'Actual_End_Time__c',
            type: 'string'
        },
        {
            name: 'Location',
            type: 'string'
        },
        {
            name: 'Description',
            type: 'string'
        },
        {
            name: 'MeetingName__c',
            type: 'string'
        },
        {
            name: 'VirtualLocation__c',
            type: 'string'
        },
        {
            name: 'Manager_Scheduled__c',
            type: 'boolean'
        },
        {
            name: 'ActivityDate',
            type: 'string'
        },
        {
            name: 'Parent_Event__c',
            type: 'string'
        },
        {
            name: 'Attendees_Count__c',
            type: 'number'
        },
        {
            name: 'Planned_Duration__c',
            type: 'string'
        },
        {
            name: 'Location__c',
            type: 'string'
        },
        {
            name: 'Aggregate_Duration__c',
            type: 'String'
        },
        {
            name: 'Planned_Cost__c',
            type: 'string'
        },
        {
            name: 'WhatId',
            type: 'string'
        },
        {
            name: 'IsRemoved__c',
            type: 'boolean'
        }
    ]
}

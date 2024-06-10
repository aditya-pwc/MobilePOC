export default {
    name: 'Visit_List__c',
    soupName: 'Visit_List__c',
    optimization: true,
    optimizationQuery: ' AND IsRemoved__c = false',
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
            name: 'Start_Date__c',
            type: 'string'
        },
        {
            name: 'End_Date__c',
            type: 'string'
        },
        {
            name: 'Start_Time__c',
            type: 'string'
        },
        {
            name: 'Start_Date_Time__c',
            type: 'string'
        },
        {
            name: 'End_Time__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'End_Date_Time__c',
            type: 'string'
        },
        {
            name: 'Visit_Date__c',
            type: 'string'
        },
        {
            name: 'RecordTypeId',
            type: 'string'
        },
        {
            name: 'Status__c',
            type: 'string'
        },
        {
            name: 'Visit_List_Group__c',
            type: 'string'
        },
        {
            name: 'Location_Id__c',
            type: 'string'
        },
        {
            name: 'Updated__c',
            type: 'boolean'
        },
        {
            name: 'Total_Planned_Time__c',
            type: 'integer'
        },
        {
            name: 'Planned_Mileage__c',
            type: 'string'
        },
        {
            name: 'Planned_Travel_Time__c',
            type: 'string'
        },
        {
            name: 'Number_of_Planned_Visits__c',
            type: 'string'
        },
        {
            name: 'Manager_Ad_Hoc__c',
            type: 'boolean'
        },
        {
            name: 'Merch_Relief_Planned_Cost__c',
            type: 'floating'
        },
        {
            name: 'Merch_Relief_Target_Cost__c',
            type: 'floating'
        },
        {
            name: 'Merch_Relief_Total_Planned_Time__c',
            type: 'integer'
        },
        {
            name: 'Merch_Relief_Target_Time__c',
            type: 'integer'
        },
        {
            name: 'Sales_Planned_Cost__c',
            type: 'floating'
        },
        {
            name: 'Sales_Target_Cost__c',
            type: 'floating'
        },
        {
            name: 'Sales_Total_Planned_Time__c',
            type: 'integer'
        },
        {
            name: 'Sales_Target_Time__c',
            type: 'integer'
        },
        {
            name: 'Planned_Cost__c',
            type: 'floating'
        },
        {
            name: 'Target_Cost__c',
            type: 'floating'
        },
        {
            name: 'Target_Time__c',
            type: 'integer'
        },
        {
            name: 'Planned_Service_Time__c',
            type: 'integer'
        },
        {
            name: 'Total_Planned_Cases__c',
            type: 'integer'
        },
        {
            name: 'Planned_Meeting_Time__c',
            type: 'integer'
        },
        {
            name: 'IsRemoved__c',
            type: 'boolean'
        }
    ]
}

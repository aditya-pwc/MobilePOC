export default {
    name: 'Visit',
    soupName: 'Visit',
    initQuery:
        'SELECT Id, Sales_Visit__c, Name, OwnerId, PlaceId, VisitorId, Visitor.Name, Status__c, ' +
        'ActualVisitEndTime, ActualVisitStartTime, LastModifiedDate, PlannedVisitEndTime, ' +
        'PlannedVisitStartTime, Ad_Hoc__c, RecordTypeId, RecordType.Id, RecordType.Name, RecordType.DeveloperName, Planned_Date__c, Sequence__c, Visit_List__c, ' +
        'Planned_Duration_Minutes__c, Actual_Duration_Minutes__c, Planned_Travel_Time__c, Planned_Mileage__c, ' +
        'Scheduled_Case_Quantity__c, Cases_Goal_Quantity__c, Schedule_Visit_Group__c,Visit_Subtype__c, Take_Order_Flag__c, AMAS_Compliant__c,' +
        'InstructionDescription, Check_In_Location_Flag__c, Pull_Number__c, Manager_Ad_Hoc__c, Check_Out_Location_Flag__c, ' +
        'Customer_ID__c, RTE_ID__c, Route_Group__c, Reassigned_Flag__c FROM Visit ' +
        'WHERE Planned_Date__c>=LAST_N_DAYS:14 AND Planned_Date__c <= NEXT_N_DAYS:7 ' +
        "AND Status__c != 'Pre-Processed' " +
        "AND ((RecordType.DeveloperName = 'Merchandising' AND VisitorId = APPLY_CURRENT_USER_ID) OR (RTE_ID__c = APPLY_USER_ROUTE_ID AND RecordType.DeveloperName = 'Sales'))",
    optimization: true,
    optimizationQuery: " AND Status__c != 'Removed'",
    fieldList: [
        {
            name: 'Id',
            type: 'string'
        },
        {
            name: 'Sales_Visit__c',
            type: 'string'
        },
        {
            name: 'Name',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'OwnerId',
            type: 'string'
        },
        {
            name: 'PlaceId',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'VisitorId',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Visitor.Name',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Status__c',
            type: 'string'
        },
        {
            name: 'ActualVisitEndTime',
            type: 'string'
        },
        {
            name: 'ActualVisitStartTime',
            type: 'string'
        },
        {
            name: 'LastModifiedDate',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'PlannedVisitEndTime',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'PlannedVisitStartTime',
            type: 'string'
        },
        {
            name: 'Ad_Hoc__c',
            type: 'boolean',
            skipSyncUp: true
        },
        {
            name: 'RecordTypeId',
            type: 'string'
        },

        {
            name: 'RecordType.Id',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'RecordType.Name',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'RecordType.DeveloperName',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Planned_Date__c',
            type: 'string'
        },
        {
            name: 'Sequence__c',
            type: 'integer'
        },
        {
            name: 'Visit_List__c',
            type: 'string'
        },
        {
            name: 'Planned_Duration_Minutes__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Actual_Duration_Minutes__c',
            type: 'string'
        },
        {
            name: 'Planned_Travel_Time__c',
            type: 'floating'
        },
        {
            name: 'Planned_Mileage__c',
            type: 'floating'
        },
        {
            name: 'Scheduled_Case_Quantity__c',
            type: 'string'
        },
        {
            name: 'Schedule_Visit_Group__c',
            type: 'string'
        },
        {
            name: 'Visit_Subtype__c',
            type: 'string'
        },
        {
            name: 'Take_Order_Flag__c',
            type: 'boolean'
        },
        {
            name: 'AMAS_Compliant__c',
            type: 'boolean'
        },
        {
            name: 'InstructionDescription',
            type: 'string'
        },
        {
            name: 'Check_In_Location_Flag__c',
            type: 'boolean'
        },
        {
            name: 'Pull_Number__c',
            type: 'integer'
        },
        {
            name: 'Manager_Ad_Hoc__c',
            type: 'boolean'
        },
        {
            name: 'Check_Out_Location_Flag__c',
            type: 'boolean'
        },
        {
            name: 'Customer_ID__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Cases_Goal_Quantity__c',
            type: 'floating'
        },
        {
            name: 'RTE_ID__c',
            type: 'string'
        },
        {
            name: 'Route_Group__c',
            type: 'string'
        },
        {
            name: 'Reassigned_Flag__c',
            type: 'boolean'
        },
        {
            name: 'Dynamic_Frequency_Add__c',
            type: 'boolean'
        },
        {
            name: 'Dynamic_Frequency_Remove__c',
            type: 'boolean'
        },
        {
            name: 'Reassigned__c',
            type: 'boolean'
        }
    ],
    sysFields: ['LastModifiedDate', 'Name', 'Actual_Duration_Minutes__c']
}

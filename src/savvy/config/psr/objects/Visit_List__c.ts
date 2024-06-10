import { syncDownObj } from '../../../api/SyncUtils'
import { buildSingleSyncDownQuery } from '../../../service/SyncService'
import { VisitList } from '../../QueryConfig'

export default {
    name: 'Visit_List__c',
    soupName: 'Visit_List__c',
    optimization: true,
    optimizationQuery: ' AND IsRemoved__c = false',
    initQuery:
        'SELECT Id, Name, OwnerId, User__c, LastModifiedDate, Start_Date__c, End_Date__c, Start_Time__c, ' +
        'Start_Date_Time__c, End_Time__c, End_Date_Time__c, Visit_Date__c, RecordTypeId, Status__c, Visit_List_Group__c, ' +
        'Location_Id__c, Route_Sales_Geo__c, Updated__c, Total_Planned_Time__c, Planned_Mileage__c, ' +
        'Planned_Travel_Time__c, Number_of_Planned_Visits__c, Manager_Ad_Hoc__c, Merch_Relief_Planned_Cost__c, ' +
        'Merch_Relief_Target_Cost__c, Merch_Relief_Total_Planned_Time__c, Merch_Relief_Target_Time__c, ' +
        'Sales_Planned_Cost__c, Sales_Target_Cost__c, Sales_Total_Planned_Time__c, Sales_Target_Time__c, ' +
        'Planned_Cost__c, Target_Cost__c, Target_Time__c, Planned_Service_Time__c, Total_Planned_Cases__c, ' +
        'Planned_Meeting_Time__c, IsRemoved__c, Resequenced__c, Unscheduled__c, Unassigned_Employee_Cost__c, ' +
        'Unassigned_Employee_Time__c, Count_of_Unassigned_Employees__c, Unscheduled_Cost_Inclusion__c, ' +
        'Sales_Unassigned_Employee_Time__c, Merch_Relief_Unassigned_Employee_Time__c, ' +
        'Sales_Count_of_Unassigned_Employees__c, MerchRelief_Count_of_UnassignedEmployees__c, ' +
        'Sales_Unassigned_Employee_Cost__c, Merch_Relief_Unassigned_Employee_Cost__c, Load_Number__c, ' +
        'Manifest_End_Time__c, Manifest_Start_Time__c, RecordType.DeveloperName, Visit_List_Subtype__c, Visit_List_Legacy_ID__c, ' +
        'Start_Location__Latitude__s, Start_Location__Longitude__s, End_Location__Latitude__s, End_Location__Longitude__s ' +
        'FROM Visit_List__c ' +
        "WHERE Status__c != 'Pre-Processed' " +
        "AND RecordType.DeveloperName = 'Sales_Daily_Visit_List'" +
        'AND IsRemoved__c = false ' +
        "AND (Visit_List_Subtype__c = 'Route Visit List' AND Route_Sales_Geo__c = APPLY_USER_ROUTE_ID) " +
        'AND ( Visit_Date__c >= LAST_N_DAYS:14 OR Visit_Date__c <= NEXT_N_DAYS:7 ) ',
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
            name: 'User__c',
            type: 'string'
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
            name: 'Route_Sales_Geo__c',
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
        },
        {
            name: 'Resequenced__c',
            type: 'boolean'
        },
        {
            name: 'Unscheduled__c',
            type: 'boolean'
        },
        {
            name: 'Unassigned_Employee_Cost__c',
            type: 'floating'
        },
        {
            name: 'Unassigned_Employee_Time__c',
            type: 'integer'
        },
        {
            name: 'Count_of_Unassigned_Employees__c',
            type: 'integer'
        },
        {
            name: 'Unscheduled_Cost_Inclusion__c',
            type: 'boolean'
        },
        {
            name: 'Sales_Unassigned_Employee_Time__c',
            type: 'integer'
        },
        {
            name: 'Merch_Relief_Unassigned_Employee_Time__c',
            type: 'integer'
        },
        {
            name: 'Sales_Count_of_Unassigned_Employees__c',
            type: 'integer'
        },
        {
            name: 'MerchRelief_Count_of_UnassignedEmployees__c',
            type: 'integer'
        },
        {
            name: 'Sales_Unassigned_Employee_Cost__c',
            type: 'floating'
        },
        {
            name: 'Merch_Relief_Unassigned_Employee_Cost__c',
            type: 'floating'
        },
        {
            name: 'Load_Number__c',
            type: 'string'
        },
        {
            name: 'Manifest_End_Time__c',
            type: 'string'
        },
        {
            name: 'Manifest_Start_Time__c',
            type: 'string'
        },
        {
            name: 'RecordType.DeveloperName',
            type: 'string'
        },
        {
            name: 'Visit_List_Subtype__c',
            type: 'string'
        },
        {
            name: 'Visit_List_Legacy_ID__c',
            type: 'string'
        },
        {
            name: 'Start_Location__Latitude__s',
            type: 'string'
        },
        {
            name: 'Start_Location__Longitude__s',
            type: 'string'
        },
        {
            name: 'End_Location__Latitude__s',
            type: 'string'
        },
        {
            name: 'End_Location__Longitude__s',
            type: 'string'
        },
        {
            name: 'Kronos_Punch_Out__c',
            type: 'string'
        },
        {
            name: 'Kronos_Punch_In__c',
            type: 'string'
        }
    ],
    sysFields: ['LastModifiedDate'],
    syncDownCB: async () => {
        const query = buildSingleSyncDownQuery(VisitList.baseQuery + VisitList.cbCondition)
        await Promise.all(
            query.map((q) => {
                return syncDownObj('Visit_List__c', q)
            })
        )
    }
}

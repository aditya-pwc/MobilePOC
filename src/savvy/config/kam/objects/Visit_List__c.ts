import { syncDownObj } from '../../../api/SyncUtils'
import { buildSingleSyncDownQuery } from '../../../service/SyncService'
import { VisitList } from '../../QueryConfig'

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

/*
 * @Description:
 * @Author: Chris
 * @Date: 2022-03-16 11:44:10
 * @LastEditTime: 2023-07-14 15:09:52
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 */

// psrCondition:merch visit may not have user__c so use both ownerId and user__c
export const VisitList = {
    baseQuery: `
        SELECT Id, Name, OwnerId, LastModifiedDate, Start_Date__c, End_Date__c, 
        Start_Time__c,Start_Date_Time__c, End_Time__c, End_Date_Time__c, Visit_Date__c, RecordTypeId, 
        Status__c, Visit_List_Group__c, Location_Id__c, Updated__c, Total_Planned_Time__c, 
        Planned_Mileage__c, Planned_Travel_Time__c, Number_of_Planned_Visits__c, Manager_Ad_Hoc__c, 
        Merch_Relief_Planned_Cost__c, Merch_Relief_Target_Cost__c, Merch_Relief_Total_Planned_Time__c, 
        Merch_Relief_Target_Time__c, Sales_Planned_Cost__c, Sales_Target_Cost__c, Sales_Total_Planned_Time__c, 
        Sales_Target_Time__c, Planned_Cost__c, Target_Cost__c, Target_Time__c, Planned_Service_Time__c, 
        Total_Planned_Cases__c, Planned_Meeting_Time__c, IsRemoved__c, Resequenced__c, Unscheduled__c, 
        Unassigned_Employee_Cost__c, Unassigned_Employee_Time__c, Count_of_Unassigned_Employees__c, 
        Unscheduled_Cost_Inclusion__c, Sales_Unassigned_Employee_Time__c, Merch_Relief_Unassigned_Employee_Time__c,
        Sales_Count_of_Unassigned_Employees__c, MerchRelief_Count_of_UnassignedEmployees__c, 
        Sales_Unassigned_Employee_Cost__c, Merch_Relief_Unassigned_Employee_Cost__c, Load_Number__c,  Manifest_End_Time__c, 
        Manifest_Start_Time__c, RecordType.DeveloperName, Start_Gap__c, End_Gap__c, Gate_Check_Out__c, Gate_Check_In__c,
        Manifest_Fence_Check_In__c, Manifest_Fence_Check_Out__c, Cost_Of_Unassigned_Visits__c, Kronos_Punch_Out__c, Kronos_Punch_In__c, Unassigned_Time__c                                                                                                                                                                          
        FROM Visit_List__c
    `,
    baseCondition: `
        WHERE 
            Status__c != 'Pre-Processed' 
            AND (Location_Id__c = APPLY_USER_LOCATION OR USER__r.GM_LOC_ID__c = APPLY_USER_LOCATION)
            AND ((Visit_Date__c >= LAST_N_DAYS:14:DATE AND (
                RecordType.DeveloperName = 'Daily_Visit_List'
                OR RecordType.DeveloperName = 'Delivery_Daily_Visit_List'
                OR RecordType.DeveloperName = 'Sales_Daily_Visit_List'
            ))
            OR (Start_Date__c >= LAST_N_DAYS:14:DATE AND RecordType.DeveloperName = 'Visit_List_Group')
            OR (Start_Date__c >= LAST_N_DAYS:14:DATE AND RecordType.DeveloperName = 'Schedule_Visit_Group'))
    `,
    cbCondition: `
        WHERE 
            Status__c != 'Pre-Processed' 
            AND Id IN (SELECT Visit_List__c FROM Visit WHERE Retail_Store__r.LOC_PROD_ID__c = APPLY_USER_LOCATION AND Planned_Date__c >= LAST_N_DAYS:14:DATE AND Status__c NOT IN ('Pre-Processed', 'Removed', 'Failed') AND Visit_List__r.Location_Id__c = null)
            AND Visit_Date__c >= LAST_N_DAYS:14:DATE 
            AND (
                RecordType.DeveloperName = 'Delivery_Daily_Visit_List'
                OR RecordType.DeveloperName = 'Sales_Daily_Visit_List'
            )
    `
}

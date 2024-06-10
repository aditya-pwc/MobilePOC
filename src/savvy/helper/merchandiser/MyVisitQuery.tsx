import { CommonParam } from '../../../common/CommonParam'
import WorkOrderService from '../../module/work-order/WorkOrderService'
import { todayDateWithTimeZone } from '../../utils/TimeZoneUtils'
import { addDaysToToday } from '../../../common/utils/YMDUtils'
import { isCurrentVlPastAndShiftUser } from './MyVisitDataHelper'

export const myVisitBaseFields = [
    'visitList',
    'VLSoupId',
    'VisitDate',
    'StartTime',
    'EndTime',
    'VlStatus', // PAST
    'Total_Planned_Time__c', // TODAY - Total Route Time
    'Planned_Service_Time__c', // TODAY - Service Time
    'Planned_Travel_Time__c', // TODAY Drive Time
    'isMerchVisitList', // PAST

    'name',
    'AccountPhone',
    'accountId', // TODAY
    'address',
    'cityStateZip',
    'latitude',
    'longitude',
    'storeLocation',
    'Geofence', // TODAY

    'Id',
    'id', // TODAY
    'Visit_Subtype__c', // TODAY
    'InstructionDescription', // TODAY
    'Take_Order_Flag__c',
    'Pull_Number__c',
    'adHoc',
    'Manager_Ad_Hoc__c', // TODAY
    'AdHoc',
    'ManagerAdHoc', // PAST
    'PlanStartTime',
    'PlanEndTime', // PAST
    'PlannedVisitEndTime',
    'PlannedVisitStartTime', // TODAY
    'PlannedDurationMinutes', // PAST
    'plannedDuration', // PAST TODAY

    'status',
    'storeId', // PAST, TODAY
    'PlaceId', // PAST
    'VisitorId',
    'AMAS_Compliant__c',
    'sequence',
    'ActualVisitStartTime',
    'ActualVisitEndTime',
    'Planned_Date__c',
    'Actual_Duration_Minutes__c',
    'CreatedDate', // TODAY
    'customerId', // TODAY
    'scheduledCase', // TODAY
    'RecordTypeId', // TODAY
    'RecordType_DeveloperName', // TODAY
    'Check_Out_Location_Flag__c', // PAST
    'Finished', // PAST
    'OwnerId', // PAST
    'InLocation', // PAST
    'inLocation', // PAST
    'Reassigned_Flag__c', // PAST TODAY

    'workOrders',
    '_soupEntryId',
    ''
]

const myVisitBaseQuery = (merchVisitListRecordTypeId) => `
SELECT
    {Visit_List__c:Id} AS visitList,
    {Visit_List__c:_soupEntryId},
    {Visit_List__c:Visit_Date__c} AS VisitDate,
    {Visit_List__c:Start_Date_Time__c},
    {Visit_List__c:End_Date_Time__c},
    {Visit_List__c:Status__c} AS VlStatus,
    {Visit_List__c:Total_Planned_Time__c},
    {Visit_List__c:Planned_Service_Time__c},
    {Visit_List__c:Planned_Travel_Time__c},
    {Visit_List__c:RecordTypeId} = '${merchVisitListRecordTypeId}',

    {RetailStore:Name},
    {RetailStore:Account.Phone},
    {RetailStore:AccountId},
    {RetailStore:Street}, 
    ({RetailStore:City} || ', ' || {RetailStore:State} || ' ' || {RetailStore:PostalCode}), 
    {RetailStore:Latitude},
    {RetailStore:Longitude},
    {RetailStore:Store_Location__c}, 
    {RetailStore:Geofence__c},

    {Visit:Id},
    {Visit:Id}, 
    {Visit:Visit_Subtype__c}, 
    {Visit:InstructionDescription}, 
    {Visit:Take_Order_Flag__c},
    {Visit:Pull_Number__c},

    {Visit:Ad_Hoc__c}, 
    {Visit:Manager_Ad_Hoc__c}, 
    {Visit:Ad_Hoc__c} AS AdHoc, 
    {Visit:Manager_Ad_Hoc__c}, 

    {Visit:PlannedVisitStartTime}, 
    {Visit:PlannedVisitEndTime}, 
    {Visit:PlannedVisitEndTime},
    {Visit:PlannedVisitStartTime},
    {Visit:Planned_Duration_Minutes__c},
    {Visit:Planned_Duration_Minutes__c},

    {Visit:Status__c} AS status,
    {Visit:PlaceId} AS storeId, 
    {Visit:PlaceId} AS PlaceId, 
    {Visit:VisitorId},
    {Visit:AMAS_Compliant__c},
    {Visit:Sequence__c},
    {Visit:ActualVisitStartTime},
    {Visit:ActualVisitEndTime},
    {Visit:Planned_Date__c},
    {Visit:Actual_Duration_Minutes__c},
    {Visit:CreatedDate},
    {Visit:Customer_ID__c},
    {Visit:Scheduled_Case_Quantity__c},
    {Visit:RecordTypeId},
    {Visit:RecordType.DeveloperName},
    {Visit:Check_Out_Location_Flag__c}, 
    {Visit:ActualVisitEndTime} IS NULL AS Finished, 
    {Visit:OwnerId} AS OwnerId, 
    {Visit:Check_In_Location_Flag__c} AS InLocation, 
    ({Visit:Check_In_Location_Flag__c} = '1') AS inLocation,
    {Visit:Reassigned_Flag__c},

    (${WorkOrderService.workOrderQuery()}) workOrders,
    {Visit:_soupEntryId}

    FROM {Visit_List__c}
    LEFT JOIN {Visit} ON {Visit:Visit_List__c} = {Visit_List__c:Id} AND {Visit:Status__c} != 'Planned' AND {Visit:Status__c} != 'Removed' AND {Visit:Status__c} != 'Failed'
    LEFT JOIN {RetailStore} ON {Visit:PlaceId} = {RetailStore:Id} AND {RetailStore:Account.Merchandising_Base_Minimum_Requirement__c} = '1'
`

export const todayQuery = (merchVisitListRecordTypeId) => `
    ${myVisitBaseQuery(merchVisitListRecordTypeId)}
    WHERE VisitDate = '${todayDateWithTimeZone(true)}'
    ORDER BY {Visit_List__c:Start_Date_Time__c} NULLS LAST, 
        {Visit:Manager_Ad_Hoc__c} ASC, 
        {Visit:Ad_Hoc__c}, 
        {Visit:Sequence__c}
    `

export const pastFutureQuery = (merchVisitListRecordTypeId, start, end) => {
    const vlDate = CommonParam.visitList?.Visit_Date__c
    let query = ''
    if (vlDate === addDaysToToday(-1, true)) {
        if (isCurrentVlPastAndShiftUser()) {
            query = `And {Visit_List__c:Id} != '${CommonParam.visitList.Id}'`
        }
    }
    return `${myVisitBaseQuery(merchVisitListRecordTypeId)}
    WHERE 
        {Visit_List__c:OwnerId} = '${CommonParam.userId}'
        AND {Visit_List__c:Visit_Date__c} >= date("${start}")
        AND {Visit_List__c:Visit_Date__c} <= date("${end}") ${query}

    ORDER BY {Visit_List__c:Id}, 
        {Visit_List__c:Start_Date_Time__c} NULLS LAST, 
        Finished NULLS LAST, 
        {Visit:ActualVisitStartTime} NULLS LAST, 
        {Visit:Manager_Ad_Hoc__c} ASC, 
        {Visit:Sequence__c} NULLS LAST, 
        {Visit:PlannedVisitStartTime} DESC`
}

export const visitListByDateQuery = (merchVisitListRecordTypeId, visitDate) => {
    return `
    ${myVisitBaseQuery(merchVisitListRecordTypeId)}
    WHERE {Visit_List__c:Visit_Date__c} = date("${visitDate}")
    AND {Visit_List__c:Status__c} = 'In Progress'
    ORDER BY {Visit_List__c:Start_Date_Time__c} NULLS LAST, 
        {Visit:Manager_Ad_Hoc__c} ASC, 
        {Visit:Ad_Hoc__c}, 
        {Visit:Sequence__c}
    `
}

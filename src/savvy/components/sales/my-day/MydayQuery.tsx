import { VisitStatus } from '../../../enums/Visit'
export const SDLMydayEmployeeList = {
    q: `
    SELECT
    {User:Id},
    {User:Name},
    {User:FirstName},
    {User:LastName},
    {User:Phone},
    {User:GM_LOC_ID__c},
    {User:GPID__c},
    {User:BU_ID__c},
    {User:PERSONA__c},
    {User:Title},
    {User:MobilePhone},
    {User:FT_EMPLYE_FLG_VAL__c},
    {User_Stats__c:Id},
    {User_Stats__c:Schedule_Favorited__c},
    {Visit_List__c:Start_Date_Time__c},
    {Visit_List__c:End_Date_Time__c},
    {Visit_List__c:OwnerId},
    {Visit_List__c:Status__c},
    {Visit_List__c:Visit_Date__c},
    {Visit_List__c:Id},
    {Visit_List__c:IsRemoved__c},
    {Visit_List__c:Load_Number__c},
    {Visit:AMAS_Compliant__c},
    {Visit:Check_In_Location_Flag__c},
    {Visit:Check_Out_Location_Flag__c},
    {Visit:Planned_Date__c},
    {Visit:Id},
    {Visit:Visit_List__c},
    {Visit:VisitorId},
    {Visit:PlannedVisitStartTime},
    {Visit:ActualVisitEndTime},
    {Visit:ActualVisitStartTime},
    {Visit:Status__c},
    {Visit:Sequence__c},
    {Visit:Planned_Duration_Minutes__c},
    {Visit:Visit_Subtype__c},
    {Visit:Take_Order_Flag__c},
    {Visit:Pull_Number__c},
    {Visit:InstructionDescription},
    {Visit:RecordType.DeveloperName},
    {RetailStore:Id},
    {RetailStore:Street},
    {RetailStore:City},
    {RetailStore:State},
    {RetailStore:Country},
    {RetailStore:PostalCode},
    {RetailStore:Latitude},
    {RetailStore:Longitude},
    {RetailStore:Store_Location__c},
    {RetailStore:Name},
    {Account:Phone},
    {Route_Sales_Geo__c:Id},
    {Route_Sales_Geo__c:LOCL_RTE_ID__c},
    {Route_Sales_Geo__c:GTMU_RTE_ID__c}
    FROM {Visit} 
    JOIN {Visit_List__c} ON 
       {Visit_List__c:Id} = {Visit:Visit_List__c} 
       AND {Visit_List__c:Visit_Date__c} = date('%s')
       AND {Visit_List__c:IsRemoved__c} IS FALSE
       AND ({Visit_List__c:RecordTypeId} = '%s' OR {Visit_List__c:RecordTypeId} = '%s')
       LEFT JOIN {User} ON {Visit:VisitorId} = {User:Id}
       LEFT JOIN {User_Stats__c} ON {User_Stats__c:User__c} = {User:Id}
       LEFT JOIN {RetailStore} ON {RetailStore:Id} = {Visit:PlaceId}
       LEFT JOIN {Account} ON {Account:Id} = {RetailStore:AccountId}
       LEFT JOIN {Route_Sales_Geo__c} ON {Visit:RTE_ID__c} = {Route_Sales_Geo__c:Id}
       WHERE 
       {Visit:Status__c} != '${VisitStatus.CANCELLED}'
       AND {Visit:Status__c} != '${VisitStatus.PLANNED}' 
       AND {Visit:Status__c} != '${VisitStatus.REMOVED}'
       AND {Visit:Status__c} != 'Failed'
       AND {RetailStore:LOC_PROD_ID__c} = '%s'
       AND (({User:Id} IS NULL AND {Visit:VisitorId} IS NULL) OR ({User:Id} IS NOT NULL AND {Visit:VisitorId} IS NOT NULL))
       ORDER BY {User:LastName} NULLS LAST, {Visit:ActualVisitEndTime} NULLS LAST
   `,
    f: [
        'UserId',
        'Name',
        'FirstName',
        'LastName',
        'Phone',
        'GM_LOC_ID__c',
        'GPID__c',
        'BU_ID__c',
        'PERSONA__c',
        'Title',
        'MobilePhone',
        'FT_EMPLYE_FLG_VAL__c',
        'UserStatsId',
        'Schedule_Favorited__c',
        'Start_Date_Time__c',
        'End_Date_Time__c',
        'OwnerId',
        'Visit_List_Status',
        'Visit_Date__c',
        'Visits_Id',
        'IsRemoved__c',
        'LoadNum',
        'AMAS_Compliant__c',
        'Check_In_Location_Flag__c',
        'Check_Out_Location_Flag__c',
        'Planned_Date__c',
        'VisitId',
        'Visit_List__c',
        'VisitorId',
        'PlannedVisitStartTime',
        'ActualVisitEndTime',
        'ActualVisitStartTime',
        'Status__c',
        'Sequence__c',
        'Planned_Duration_Minutes__c',
        'Visit_Subtype__c',
        'Take_Order_Flag__c',
        'Pull_Number__c',
        'InstructionDescription',
        'DeveloperName',
        'storeId',
        'Street',
        'City',
        'State',
        'Country',
        'PostalCode',
        'Latitude',
        'Longitude',
        'Store_Location__c',
        'StoreName',
        'AccountPhone',
        'RouteSalesGeoId',
        'LocalRoute',
        'NationalId'
    ]
}
export const SDLMydayVisitList = {
    f: [
        'Id',
        'VisitorId',
        'StartTime',
        'VisitDate',
        'TotalPlannedTime',
        'PlannedMileage',
        'EndTime',
        'ActualVisitStartTime',
        'ActualVisitEndTime',
        'Actual_Duration_Minutes__c',
        'Check_Out_Location_Flag__c',
        'storeId',
        'AccountId',
        'name',
        'Finished',
        'sequence',
        'status',
        'latitude',
        'longitude',
        'storeLocation',
        'AccountPhone',
        'AdHoc',
        'Manager_Ad_Hoc__c',
        'PlannedDurationMinutes',
        'PlannedTravelTime',
        'Planned_Mileage__c',
        'InstructionDescription',
        'SubType',
        'OwnerId',
        'PlanStartTime',
        'PlanEndTime',
        'InLocation',
        'Pull_Number__c',
        'Take_Order_Flag__c',
        'Visit_Subtype__c',
        'Planned_Date__c',
        'Cases_Goal_Quantity__c',
        'ShippingAddress',
        'cof',
        'busnLvl3',
        'customNumber',
        'UserId',
        'MobilePhone',
        'UserName',
        'FirstName',
        'LastName',
        'Title',
        'FT_EMPLYE_FLG_VAL__c',
        'UserStatsId',
        'RouteSalesGeoId',
        'LocalRoute',
        'NationalId'
    ],
    q: `
    SELECT
        {Visit:Id} AS Id,
        {Visit:VisitorId},
        {Visit_List__c:Start_Time__c} AS StartTime,
        {Visit_List__c:Visit_Date__c} AS VisitDate,
        {Visit_List__c:Total_Planned_Time__c} AS TotalPlannedTime,
        {Visit_List__c:Planned_Mileage__c} AS PlannedMileage,
        {Visit_List__c:End_Time__c} AS EndTime,
        {Visit:ActualVisitStartTime} AS ActualStartTime,
        {Visit:ActualVisitEndTime} AS ActualEndTime,
        {Visit:Actual_Duration_Minutes__c} AS Actual_Duration_Minutes__c,
        {Visit:Check_Out_Location_Flag__c},
        {RetailStore:Id} AS StoreId,
        {RetailStore:AccountId} AS AccountId,
        {RetailStore:Account.Name} AS Name,
        {Visit:ActualVisitEndTime} IS NULL AS Finished,
        {Visit:Sequence__c} AS Sequence,
        {Visit:Status__c} AS Status,
        {RetailStore:Latitude} AS Latitude,
        {RetailStore:Longitude} AS Longitude,
        {RetailStore:Store_Location__c} AS StoreLocation,
        {RetailStore:Account.Phone} AS AccountPhone,
        {Visit:Ad_Hoc__c} AS AdHoc,
        {Visit:Manager_Ad_Hoc__c},
        {Visit:Planned_Duration_Minutes__c},
        {Visit:Planned_Travel_Time__c},
        {Visit:Planned_Mileage__c},
        {Visit:InstructionDescription},
        'Visit' AS SubType,
        {Visit:OwnerId} AS OwnerId,
        {Visit:PlannedVisitStartTime} AS PlannedStartTime,
        {Visit:PlannedVisitEndTime} AS PlannedEndTime,
        {Visit:Check_In_Location_Flag__c} AS InLocation,
        {Visit:Pull_Number__c} AS pullNumber,
        {Visit:Take_Order_Flag__c},
        {Visit:Visit_Subtype__c},
        {Visit:Planned_Date__c},
        {Visit:Cases_Goal_Quantity__c},
        {RetailStore:Account.ShippingAddress},
        {RetailStore:Account.CUST_ID__c},
        {RetailStore:Account.BUSN_SGMNTTN_LVL_3_NM__c},
        {RetailStore:Account.RTLR_STOR_NUM__c},
        {User:Id},
        {User:MobilePhone},
        {User:Name},
        {User:FirstName},
        {User:LastName},
        {User:Title},
        {User:FT_EMPLYE_FLG_VAL__c},
        {User_Stats__c:Id},
        {Route_Sales_Geo__c:Id},
        {Route_Sales_Geo__c:LOCL_RTE_ID__c},
        {Route_Sales_Geo__c:GTMU_RTE_ID__c}
        FROM {Visit}
        JOIN {Visit_List__c} ON
            {Visit_List__c:Visit_Date__c} = date('%s')
            AND {Visit_List__c:RecordTypeId} = '%s'
            AND {Visit_List__c:Id} = {Visit:Visit_List__c}
            AND {Visit_List__c:IsRemoved__c} IS FALSE
        LEFT JOIN {RetailStore} ON {Visit:PlaceId} = {RetailStore:Id}
        LEFT JOIN {User} ON {Visit:VisitorId} = {User:Id}
        LEFT JOIN {User_Stats__c} ON {User_Stats__c:User__c} = {User:Id}
        LEFT JOIN {Route_Sales_Geo__c} ON {Visit:RTE_ID__c} = {Route_Sales_Geo__c:Id}
        WHERE {Visit:Status__c} != '${VisitStatus.CANCELLED}'
        AND {Visit:Status__c} != '${VisitStatus.PLANNED}' 
        AND {Visit:Status__c} != '${VisitStatus.REMOVED}'
        AND {Visit:Status__c} != 'Failed'
        AND {RetailStore:LOC_PROD_ID__c} = '%s'
        AND (({User:Id} IS NULL AND {Visit:VisitorId} IS NULL) OR ({User:Id} IS NOT NULL AND {Visit:VisitorId} IS NOT NULL))
        ORDER BY Name, pullNumber NULLS LAST
    `
}

export const SDLMyDayQueries = {
    getRoutes: {
        f: [
            'FRouteSalesId',
            'FRouteSales_Parent_Node__c',
            'FRouteSales_RTE_TERR_NM__c',
            'SRouteSalesId',
            'SRouteSales_Parent_Node__c',
            'SRouteSales_RTE_TERR_NM__c',
            'SRouteSales_SLS_UNIT_NM__c',
            'TRouteSalesId',
            'TRouteSales_Parent_Node__c',
            'TRouteSales_RTE_TERR_NM__c'
        ],
        q: `
        SELECT
        FRSG.{Route_Sales_Geo__c:Id},
        FRSG.{Route_Sales_Geo__c:Parent_Node__c},
        FRSG.{Route_Sales_Geo__c:RTE_TERR_NM__c},
        SRSG.{Route_Sales_Geo__c:Id},
        SRSG.{Route_Sales_Geo__c:Parent_Node__c},
        SRSG.{Route_Sales_Geo__c:RTE_TERR_NM__c},
        SRSG.{Route_Sales_Geo__c:SLS_UNIT_NM__c},
        TRSG.{Route_Sales_Geo__c:Id},
        TRSG.{Route_Sales_Geo__c:Parent_Node__c},
        TRSG.{Route_Sales_Geo__c:RTE_TERR_NM__c}
        FROM {Route_Sales_Geo__c} FRSG
        JOIN {Route_Sales_Geo__c} SRSG ON SRSG.{Route_Sales_Geo__c:Parent_Node__c}=FRSG.{Route_Sales_Geo__c:Id}
        JOIN {Route_Sales_Geo__c} TRSG ON TRSG.{Route_Sales_Geo__c:Parent_Node__c}=SRSG.{Route_Sales_Geo__c:Id}
        WHERE FRSG.{Route_Sales_Geo__c:SLS_UNIT_ID__c}='%s'
        `
    }
}

export const SDLMyDayEmployeeOrderCount = {
    q: `
    SELECT
    {Visit_List__c:Visit_Date__c},
    {Visit_List__c:IsRemoved__c},
    {Visit:Planned_Date__c},
    {Visit:Id},
    {Visit:Visit_List__c},
    {Visit:VisitorId},
    {Visit:Status__c},
    {Visit:RecordType.DeveloperName},
    {Visit:RTE_ID__c},
    {Route_Sales_Geo__c:Id},
    {Route_Sales_Geo__c:LOCL_RTE_ID__c},
    {Route_Sales_Geo__c:GTMU_RTE_ID__c}
    FROM {Visit} 
    LEFT JOIN {Visit_List__c} ON 
       {Visit_List__c:Id} = {Visit:Visit_List__c} 
    LEFT JOIN {Route_Sales_Geo__c} ON 
       {Visit:RTE_ID__c} = {Route_Sales_Geo__c:Id}
    WHERE
    {Visit_List__c:Visit_Date__c} = date('%s')
    AND {Visit_List__c:IsRemoved__c} IS FALSE
    AND {Visit:Status__c} != '${VisitStatus.PLANNED}' 
    AND {Visit:Status__c} != '${VisitStatus.REMOVED}'
    AND {Visit:Status__c} != 'Failed'
    AND {Visit:VisitorId} IN (%s)
    AND {Visit:RTE_ID__c} != ''
`,
    f: [
        'Visit_Date__c',
        'IsRemoved__c',
        'Planned_Date__c',
        'VisitId',
        'Visit_List__c',
        'VisitorId',
        'Status__c',
        'RecordTypeDeveloperName',
        'RouteId',
        'RouteSalesGeoId',
        'LOCL_RTE_ID__c',
        'GTMU_RTE_ID__c'
    ]
}

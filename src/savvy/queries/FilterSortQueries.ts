const FilterSortQueries = {
    filterAllLeadsQuery: {
        q:
            'SELECT {Lead__x:Id},{Lead__x:ExternalId},{Lead__x:PD_Contact_Made_Counter_c__c},{Lead__x:PD_Call_Counter_c__c},' +
            '{Lead__x:COF_Rejected_c__c},{Lead__x:Contact_Made_Counter_c__c},{Lead__x:Deferred_Resume_Date_c__c} ' +
            'IS NOT NULL AND (date("now","-30 days")<date({Lead__x:Deferred_Resume_Date_c__c}) ' +
            'and date({Lead__x:Deferred_Resume_Date_c__c})<=date("now")) as Active,{Lead__x:Deferred_Resume_Date_c__c},' +
            '{Lead__x:Status__c},{Lead__x:Phone__c}, {Lead__x:Company__c}, {Lead__x:Tier_c__c}, ' +
            '{Lead__x:Call_Counter_c__c}, {Lead__x:Owner_GPID_c__c}, {Lead__x:City__c}, {Lead__x:Country__c}, ' +
            '{Lead__x:Street__c}, {Lead__x:State__c},' +
            '{Lead__x:Last_Task_Modified_Date_c__c}, {Lead__x:PostalCode__c}, {Lead__x:Pre_qualified_c__c}, ' +
            '((%s - {Lead__x:Lead_Longitude_c__c}) * (%s - {Lead__x:Lead_Longitude_c__c}) + ' +
            '(%s - {Lead__x:Lead_Latitude_c__c}) * (%s - {Lead__x:Lead_Latitude_c__c})) AS Distance, ' +
            '{Lead__x:_soupEntryId},{Lead__x:__local__},{Lead__x:__locally_created__},{Lead__x:__locally_updated__},' +
            '{Lead__x:__locally_deleted__} ' +
            'FROM {Lead__x} WHERE {Lead__x:Status__c} = "Open" ' +
            'AND ({Lead__x:Is_Removed_c__c} IS NOT TRUE OR {Lead__x:Pre_qualified_c__c} IS TRUE) ',
        s:
            'ORDER BY Active DESC NULLS LAST,' +
            '{Lead__x:Pre_qualified_c__c} DESC NULLS LAST, {Lead__x:Tier_c__c} ASC NULLS LAST,' +
            '{Lead__x:Company__c} COLLATE NOCASE',
        f: [
            'Id',
            'ExternalId',
            'PD_Contact_Made_Counter_c__c',
            'PD_Call_Counter_c__c',
            'COF_Rejected_c__c',
            'Contact_Made_Counter_c__c',
            'Active',
            'Deferred_Resume_Date_c__c',
            'Status__c',
            'Phone__c',
            'Company__c',
            'Tier_c__c',
            'Call_Counter_c__c',
            'Owner_GPID_c__c',
            'City__c',
            'Country__c',
            'Street__c',
            'State__c',
            'Last_Task_Modified_Date_c__c',
            'PostalCode__c',
            'Pre_qualified_c__c',
            'Distance',
            '_soupEntryId',
            '__local__',
            '__locally_created__',
            '__locally_updated__',
            '__locally_deleted__'
        ]
    },
    filterMyLeadsQuery: {
        q:
            'SELECT {Lead__x:Id},{Lead__x:PD_Call_Counter_c__c}, {Lead__x:PD_Contact_Made_Counter_c__c},' +
            '{Lead__x:COF_Rejected_c__c},{Lead__x:Contact_Made_Counter_c__c},' +
            '({Lead__x:Deferred_Resume_Date_c__c} IS NOT NULL ' +
            'AND (date("now","-30 days")<date({Lead__x:Deferred_Resume_Date_c__c}) ' +
            'AND date({Lead__x:Deferred_Resume_Date_c__c})<=date("now"))) ' +
            "OR ({Lead__x:COF_Rejected_c__c} IS NOT NULL AND {Lead__x:COF_Rejected_c__c}='1') as Active, " +
            '{Lead__x:Status__c},{Lead__x:COF_Triggered_c__c},{Lead__x:Deferred_Resume_Date_c__c},{Lead__x:Phone__c}, ' +
            '{Lead__x:Company__c}, {Lead__x:Tier_c__c}, ' +
            '{Lead__x:Call_Counter_c__c}, {Lead__x:Owner_GPID_c__c}, {Lead__x:City__c}, {Lead__x:Country__c}, ' +
            '{Lead__x:Street__c}, {Lead__x:State__c},' +
            '{Lead__x:Last_Task_Modified_Date_c__c}, {Lead__x:PostalCode__c}, {Lead__x:Pre_qualified_c__c}, ' +
            '{Lead__x:Lead_Longitude_c__c}, {Lead__x:Lead_Latitude_c__c}, ' +
            '((%s - {Lead__x:Lead_Longitude_c__c}) * (%s - {Lead__x:Lead_Longitude_c__c}) + ' +
            '(%s - {Lead__x:Lead_Latitude_c__c}) * (%s - {Lead__x:Lead_Latitude_c__c})) AS Distance, ' +
            '{Lead__x:_soupEntryId},{Lead__x:__local__},{Lead__x:__locally_created__},{Lead__x:__locally_updated__},' +
            '{Lead__x:__locally_deleted__} ' +
            'FROM {Lead__x} ',
        s:
            'ORDER BY Active DESC NULLS LAST,' +
            '{Lead__x:Pre_qualified_c__c} DESC NULLS LAST, {Lead__x:Tier_c__c} ASC NULLS LAST,' +
            '{Lead__x:Company__c} COLLATE NOCASE',
        f: [
            'Id',
            'PD_Call_Counter_c__c',
            'PD_Contact_Made_Counter_c__c',
            'COF_Rejected_c__c',
            'Contact_Made_Counter_c__c',
            'Active',
            'Status__c',
            'COF_Triggered_c__c',
            'Deferred_Resume_Date_c__c',
            'Phone__c',
            'Company__c',
            'Tier_c__c',
            'Call_Counter_c__c',
            'Owner_GPID_c__c',
            'City__c',
            'Country__c',
            'Street__c',
            'State__c',
            'Last_Task_Modified_Date_c__c',
            'PostalCode__c',
            'Pre_qualified_c__c',
            'Lead_Longitude_c__c',
            'Lead_Latitude_c__c',
            'Distance'
        ]
    },
    filterMapLeadsQuery: {
        q:
            'SELECT {Lead__x:Id},{Lead__x:Lead_Latitude_c__c},{Lead__x:Lead_Longitude_c__c},{Lead__x:ExternalId},{Lead__x:PD_Contact_Made_Counter_c__c},{Lead__x:PD_Call_Counter_c__c},' +
            '{Lead__x:COF_Rejected_c__c},{Lead__x:Contact_Made_Counter_c__c},{Lead__x:Deferred_Resume_Date_c__c},' +
            '{Lead__x:Status__c},{Lead__x:Phone__c}, {Lead__x:Company__c}, {Lead__x:Tier_c__c}, ' +
            '{Lead__x:Call_Counter_c__c}, {Lead__x:Owner_GPID_c__c}, {Lead__x:City__c}, {Lead__x:Country__c}, ' +
            '{Lead__x:Street__c}, {Lead__x:State__c},{Lead__x:COF_Triggered_c__c}, ' +
            '{Lead__x:Last_Task_Modified_Date_c__c}, {Lead__x:PostalCode__c}, {Lead__x:Pre_qualified_c__c}, ' +
            '((%s - {Lead__x:Lead_Longitude_c__c}) * (%s - {Lead__x:Lead_Longitude_c__c}) + ' +
            '(%s - {Lead__x:Lead_Latitude_c__c}) * (%s - {Lead__x:Lead_Latitude_c__c})) AS Distance, ' +
            '{Lead__x:_soupEntryId},{Lead__x:__local__},{Lead__x:__locally_created__},{Lead__x:__locally_updated__},' +
            '{Lead__x:__locally_deleted__} ' +
            "FROM {Lead__x} WHERE {Lead__x:Lead_Latitude_c__c} IS NOT NULL AND {Lead__x:Lead_Longitude_c__c} IS NOT NULL AND {Lead__x:Status__c} != 'Business Won' " +
            "AND ({Lead__x:Is_Removed_c__c} IS NOT TRUE OR {Lead__x:Pre_qualified_c__c} IS TRUE) AND {Lead__x:Lead_Type_c__c}!='Change of Ownership' ",
        s: 'ORDER BY {Lead__x:Pre_qualified_c__c} DESC NULLS LAST, {Lead__x:Tier_c__c} ASC NULLS LAST, {Lead__x:Company__c} COLLATE NOCASE',
        f: [
            'Id',
            'Lead_Latitude_c__c',
            'Lead_Longitude_c__c',
            'ExternalId',
            'PD_Contact_Made_Counter_c__c',
            'PD_Call_Counter_c__c',
            'COF_Rejected_c__c',
            'Contact_Made_Counter_c__c',
            'Deferred_Resume_Date_c__c',
            'Status__c',
            'Phone__c',
            'Company__c',
            'Tier_c__c',
            'Call_Counter_c__c',
            'Owner_GPID_c__c',
            'City__c',
            'Country__c',
            'Street__c',
            'State__c',
            'COF_Triggered_c__c',
            'Last_Task_Modified_Date_c__c',
            'PostalCode__c',
            'Pre_qualified_c__c',
            'Distance',
            '_soupEntryId',
            '__local__',
            '__locally_created__',
            '__locally_updated__',
            '__locally_deleted__'
        ]
    },
    filterMapCustomersQuery: {
        q: `SELECT DISTINCT {RetailStore:Id},
            {RetailStore:Account.IsOTSCustomer__c},
            {RetailStore:Account.IsCDACustomer__c},
            {RetailStore:Account.change_initiated__c},
            {RetailStore:Name},
            {RetailStore:Street},
            {RetailStore:State},
            {RetailStore:StateCode},
            {RetailStore:AccountId},
            {RetailStore:Country},
            {RetailStore:PostalCode},
            {RetailStore:City},
            {RetailStore:CreatedDate},
            {RetailStore:Account.Phone},
            {RetailStore:Customer_Longitude__c},
            {RetailStore:Customer_Latitude__c}, 
            {RetailStore:Account.PEPSI_COLA_NATNL_ACCT__c}, 
            {RetailStore:Account.CUST_LVL__c}, 
            {RetailStore:Account.CUST_STRT_DT__c}, 
            {RetailStore:Account.CUST_UNIQ_ID_VAL__c}, 
            {RetailStore:Account.Delta_Revenue_Percentage__c}, 
            (SELECT {Shipment:ActualDeliveryDate} 
            FROM {Shipment} 
            WHERE {Shipment:Retail_Store__c}={RetailStore:Id} 
            ORDER BY {Shipment:ActualDeliveryDate} DESC NULLS LAST LIMIT 1) 
            AS ActualDeliveryDate, 
            ((%s - {RetailStore:Customer_Longitude__c}) * (%s - {RetailStore:Customer_Longitude__c}) + 
            (%s - {RetailStore:Customer_Latitude__c}) * (%s - {RetailStore:Customer_Latitude__c})) AS Distance, 
            (SELECT {Task:Call_Date__c} FROM {Task} WHERE {Task:WhatId}={RetailStore:AccountId} 
            ORDER BY {Task:Call_Date__c} DESC NULLS LAST LIMIT 1) 
            AS CallDate, 
            (SELECT {Visit:PlannedVisitStartTime} FROM {Visit} WHERE {Visit:PlaceId}={RetailStore:Id} 
            AND {Visit:RecordType.Name} = 'Sales' 
            ORDER BY {Visit:PlannedVisitStartTime} DESC NULLS LAST LIMIT 1) 
            AS SalesVisitDate 
            FROM {RetailStore} 
            LEFT JOIN {Visit} ON 
            {Visit:PlaceId} = {RetailStore:Id} AND {Visit:RecordType.DeveloperName} = 'Delivery' 
            WHERE {RetailStore:Customer_Longitude__c} IS NOT NULL AND {RetailStore:Customer_Latitude__c} IS NOT NULL 
            AND {RetailStore:Account.IS_ACTIVE__c} IS TRUE `,
        s: 'ORDER BY {RetailStore:Name} COLLATE NOCASE ASC NULLS LAST'
    },
    filterCustomerListQuery: {
        q: `SELECT DISTINCT {RetailStore:Id},
            {RetailStore:Account.change_initiated__c},
            {RetailStore:Name},
            {RetailStore:Street},
            {RetailStore:State},
            {RetailStore:StateCode},
            {RetailStore:AccountId},
            {RetailStore:Country},
            {RetailStore:PostalCode},
            {RetailStore:City},
            {RetailStore:CreatedDate},
            {RetailStore:Account.Phone},
            {RetailStore:Account.Merchandising_Delivery_Days__c},
            {RetailStore:Account.Merchandising_Order_Days__c},
            {RetailStore:Customer_Longitude__c},
            {RetailStore:Customer_Latitude__c}, 
            {RetailStore:Account.IsOTSCustomer__c}, 
            {RetailStore:Account.IsCDACustomer__c}, 
            {RetailStore:Account.CDA_Medal__c}, 
            {RetailStore:LOC_PROD_ID__c}, 
            {RetailStore:LocationId}, 
            {RetailStore:Account.BUSN_SGMNTTN_LVL_3_NM__c}, 
            {RetailStore:Account.CUST_UNIQ_ID_VAL__c}, 
            {RetailStore:Account.Delta_Revenue_Percentage__c}, 
            {RetailStore:Account.CUST_STRT_DT__c}, 
            {RetailStore:Account.PEPSI_COLA_NATNL_ACCT__c}, 
            (SELECT {Shipment:ActualDeliveryDate} 
            FROM {Shipment} 
            WHERE {Shipment:Retail_Store__c}={RetailStore:Id} 
            ORDER BY {Shipment:ActualDeliveryDate} DESC NULLS LAST LIMIT 1) 
            AS ActualDeliveryDate, 
            ((%s - {RetailStore:Customer_Longitude__c}) * (%s - {RetailStore:Customer_Longitude__c}) + 
            (%s - {RetailStore:Customer_Latitude__c}) * (%s - {RetailStore:Customer_Latitude__c})) AS Distance, 
            (SELECT {Task:Call_Date__c} FROM {Task} WHERE {Task:WhatId}={RetailStore:AccountId} 
            ORDER BY {Task:Call_Date__c} DESC NULLS LAST LIMIT 1) 
            AS CallDate, 
            (SELECT {Visit:PlannedVisitStartTime} FROM {Visit} WHERE {Visit:PlaceId}={RetailStore:Id} 
            AND {Visit:RecordType.Name} = 'Sales' 
            ORDER BY {Visit:PlannedVisitStartTime} DESC NULLS LAST LIMIT 1) 
            AS SalesVisitDate 
            FROM {RetailStore} 
            LEFT JOIN {Visit} ON 
            {Visit:PlaceId} = {RetailStore:Id} AND {Visit:RecordType.DeveloperName} = 'Delivery' 
            WHERE {RetailStore:Id} IS NOT NULL `,
        fsrCondition:
            'AND {RetailStore:AccountId} IN ' +
            '(SELECT {AccountTeamMember:AccountId} ' +
            'FROM {AccountTeamMember} ' +
            "WHERE {AccountTeamMember:UserId}='%s') ",
        fsmCondition:
            'AND {RetailStore:AccountId} IN ' +
            '(SELECT {AccountTeamMember:AccountId} ' +
            'FROM {AccountTeamMember} ' +
            'WHERE {AccountTeamMember:UserId} IN (SELECT {User_Stats__c:User__c} FROM {User_Stats__c} WHERE ' +
            "{User_Stats__c:manager__c} = '%s' AND {User_Stats__c:relationship_active__c} IS TRUE " +
            'AND {User_Stats__c:RecordTypeId} IN (SELECT {RecordType:Id} FROM {RecordType} ' +
            `WHERE {RecordType:DeveloperName} = 'Manager_Relationship' AND {RecordType:SobjectType} = 'User_Stats__c'))) `,
        s:
            'ORDER BY CAST({RetailStore:Account.Delta_Revenue_Percentage__c} AS DOUBLE) DESC NULLS LAST,' +
            '{RetailStore:Name} COLLATE NOCASE ASC NULLS LAST'
    }
}

export default FilterSortQueries

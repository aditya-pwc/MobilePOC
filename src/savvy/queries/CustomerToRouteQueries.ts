const CustomerToRouteQueries = {
    getDistributionPointsByLeadExternalId: {
        f: [
            'Id',
            'SLS_MTHD_NM__c',
            'PROD_GRP_NM__c',
            'DLVRY_MTHD_NM__c',
            'DELY_DAYS__c',
            'Route_Text__c',
            'Route__c',
            'Lead_DP_Route_Disp_NM__c',
            'Lead__c',
            'RecordTypeId',
            'CUST_RTE_FREQ_CDE__c',
            'SLS_MTHD_CDE__c',
            'DELY_MTHD_CDE__c',
            'PROD_GRP_CDE__c',
            'LastModifiedDate',
            'Request__r.status__c',
            'CTRSoupEntryId'
        ],
        q:
            'SELECT {Customer_to_Route__c:Id},{Customer_to_Route__c:SLS_MTHD_NM__c}, ' +
            '{Customer_to_Route__c:PROD_GRP_NM__c}, {Customer_to_Route__c:DLVRY_MTHD_NM__c}, ' +
            '{Customer_to_Route__c:DELY_DAYS__c}, {Customer_to_Route__c:Route_Text__c},{Customer_to_Route__c:Route__c},' +
            '{Customer_to_Route__c:Lead_DP_Route_Disp_NM__c},{Customer_to_Route__c:Lead__c},' +
            '{Customer_to_Route__c:RecordTypeId},{Customer_to_Route__c:CUST_RTE_FREQ_CDE__c},' +
            '{Customer_to_Route__c:SLS_MTHD_CDE__c},{Customer_to_Route__c:DELY_MTHD_CDE__c},' +
            '{Customer_to_Route__c:PROD_GRP_CDE__c},{Customer_to_Route__c:LastModifiedDate},' +
            '{Customer_to_Route__c:Request__r.status__c},{Customer_to_Route__c:_soupEntryId},' +
            '{Customer_to_Route__c:__local__},{Customer_to_Route__c:__locally_created__},' +
            '{Customer_to_Route__c:__locally_updated__}, {Customer_to_Route__c:__locally_deleted__} ' +
            "FROM {Customer_to_Route__c} WHERE {Customer_to_Route__c:Lead__c} = '%s'"
    },
    getFoodServiceDistributionPointsByLeadExternalId: {
        f: [
            'Id',
            'SLS_MTHD_NM__c',
            'PROD_GRP_NM__c',
            'DLVRY_MTHD_NM__c',
            'DELY_DAYS__c',
            'Route_Text__c',
            'Lead__c',
            'RecordTypeId',
            'CUST_RTE_FREQ_CDE__c',
            'SLS_MTHD_CDE__c',
            'DELY_MTHD_CDE__c',
            'PROD_GRP_CDE__c'
        ],
        qCustomer:
            'SELECT {Customer_to_Route__c:Id},{Customer_to_Route__c:SLS_MTHD_NM__c}, ' +
            '{Customer_to_Route__c:PROD_GRP_NM__c}, {Customer_to_Route__c:DLVRY_MTHD_NM__c}, ' +
            '{Customer_to_Route__c:DELY_DAYS__c}, {Customer_to_Route__c:Route_Text__c},{Customer_to_Route__c:Customer__c},' +
            '{Customer_to_Route__c:RecordTypeId},{Customer_to_Route__c:CUST_RTE_FREQ_CDE__c},' +
            '{Customer_to_Route__c:SLS_MTHD_CDE__c},{Customer_to_Route__c:DELY_MTHD_CDE__c},' +
            '{Customer_to_Route__c:PROD_GRP_CDE__c},{Customer_to_Route__c:_soupEntryId},' +
            '{Customer_to_Route__c:__local__},{Customer_to_Route__c:__locally_created__},' +
            '{Customer_to_Route__c:__locally_updated__}, {Customer_to_Route__c:__locally_deleted__} ' +
            "FROM {Customer_to_Route__c} WHERE {Customer_to_Route__c:Customer__c} = '%s'" +
            " AND ({Customer_to_Route__c:SLS_MTHD_NM__c}='Food Service Calls' OR {Customer_to_Route__c:SLS_MTHD_NM__c}='FSV')",
        qWithFSV:
            'SELECT {Customer_to_Route__c:Id},{Customer_to_Route__c:SLS_MTHD_NM__c}, ' +
            '{Customer_to_Route__c:PROD_GRP_NM__c}, {Customer_to_Route__c:DLVRY_MTHD_NM__c}, ' +
            '{Customer_to_Route__c:DELY_DAYS__c}, {Customer_to_Route__c:Route_Text__c},{Customer_to_Route__c:Lead__c},' +
            '{Customer_to_Route__c:RecordTypeId},{Customer_to_Route__c:CUST_RTE_FREQ_CDE__c},' +
            '{Customer_to_Route__c:SLS_MTHD_CDE__c},{Customer_to_Route__c:DELY_MTHD_CDE__c},' +
            '{Customer_to_Route__c:PROD_GRP_CDE__c},{Customer_to_Route__c:_soupEntryId},' +
            '{Customer_to_Route__c:__local__},{Customer_to_Route__c:__locally_created__},' +
            '{Customer_to_Route__c:__locally_updated__}, {Customer_to_Route__c:__locally_deleted__} ' +
            "FROM {Customer_to_Route__c} WHERE {Customer_to_Route__c:Lead__c} = '%s'" +
            " AND ({Customer_to_Route__c:SLS_MTHD_NM__c}='Food Service Calls' OR {Customer_to_Route__c:SLS_MTHD_NM__c}='FSV')"
    }
}

export default CustomerToRouteQueries

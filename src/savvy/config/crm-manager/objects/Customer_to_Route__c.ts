export default {
    name: 'Customer_to_Route__c',
    soupName: 'Customer_to_Route__c',
    fieldList: [
        {
            name: 'Id',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'SLS_MTHD_NM__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'PROD_GRP_NM__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'DLVRY_MTHD_NM__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'DELY_DAYS__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Route_Text__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Lead__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'RecordTypeId',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'CUST_RTE_FREQ_CDE__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'SLS_MTHD_CDE__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'DELY_MTHD_CDE__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'PROD_GRP_CDE__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Route__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'ACTV_FLG__c',
            type: 'boolean',
            skipSyncUp: true
        },
        {
            name: 'Customer__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Route__r.GTMU_RTE_ID__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Route__r.RTE_TYP_GRP_NM__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'ORD_DAYS__c',
            type: 'string',
            skipSyncUp: true
        },
        {
            name: 'Merch_Flag__c',
            type: 'boolean'
        },
        {
            name: 'Lead_DP_Route_Disp_NM__c',
            type: 'string'
        }
    ],
    syncUpCreateQuery:
        'SELECT {Customer_to_Route__c:Id},{Customer_to_Route__c:SLS_MTHD_NM__c}, ' +
        '{Customer_to_Route__c:PROD_GRP_NM__c}, {Customer_to_Route__c:DLVRY_MTHD_NM__c}, ' +
        '{Customer_to_Route__c:DELY_DAYS__c}, {Customer_to_Route__c:Route_Text__c},' +
        '{Customer_to_Route__c:Lead__c},{Customer_to_Route__c:RecordTypeId},' +
        '{Customer_to_Route__c:CUST_RTE_FREQ_CDE__c},{Customer_to_Route__c:SLS_MTHD_CDE__c},' +
        '{Customer_to_Route__c:DELY_MTHD_CDE__c},{Customer_to_Route__c:PROD_GRP_CDE__c}, ' +
        '{Customer_to_Route__c:_soupEntryId},{Customer_to_Route__c:__local__},' +
        '{Customer_to_Route__c:__locally_created__},' +
        '{Customer_to_Route__c:__locally_updated__}, {Customer_to_Route__c:__locally_deleted__} ' +
        "FROM {Customer_to_Route__c} WHERE {Customer_to_Route__c:__locally_created__}='1'",
    syncUpUpdateFields: [
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
    syncUpCreateFields: [
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
    syncUpUpdateQuery:
        'SELECT {Customer_to_Route__c:Id},{Customer_to_Route__c:SLS_MTHD_NM__c}, ' +
        '{Customer_to_Route__c:PROD_GRP_NM__c}, {Customer_to_Route__c:DLVRY_MTHD_NM__c}, ' +
        '{Customer_to_Route__c:DELY_DAYS__c}, {Customer_to_Route__c:Route_Text__c},' +
        '{Customer_to_Route__c:Lead__c},{Customer_to_Route__c:RecordTypeId},' +
        '{Customer_to_Route__c:CUST_RTE_FREQ_CDE__c},{Customer_to_Route__c:SLS_MTHD_CDE__c},' +
        '{Customer_to_Route__c:DELY_MTHD_CDE__c},{Customer_to_Route__c:PROD_GRP_CDE__c}, ' +
        '{Customer_to_Route__c:_soupEntryId},{Customer_to_Route__c:__local__},' +
        '{Customer_to_Route__c:__locally_created__},{Customer_to_Route__c:__locally_updated__}, ' +
        '{Customer_to_Route__c:__locally_deleted__} ' +
        "FROM {Customer_to_Route__c} WHERE {Customer_to_Route__c:__locally_updated__}='1'"
}

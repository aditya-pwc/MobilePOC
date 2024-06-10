export default {
    name: 'Route_Sales_Geo__c',
    soupName: 'Route_Sales_Geo__c',
    initQuery:
        'SELECT Id, RTE_ID__c, LOC_ID__c, GTMU_RTE_ID__c, RTE_TYP_GRP_NM__c, LOCL_RTE_ID__c, Region_Code__c,' +
        ' RTE_TYP_CDV__c, HRCHY_LVL__c, Location__c,Dist_Target_for_Customer__c' +
        " FROM Route_Sales_Geo__c WHERE Id = '%2$s'",
    fieldList: [
        {
            name: 'Id',
            type: 'string'
        },
        {
            name: 'RTE_ID__c',
            type: 'string'
        },
        {
            name: 'LOC_ID__c',
            type: 'string'
        },
        {
            name: 'GTMU_RTE_ID__c',
            type: 'string'
        },
        {
            name: 'RTE_TYP_GRP_NM__c',
            type: 'string'
        },
        {
            name: 'LOCL_RTE_ID__c',
            type: 'string'
        },
        {
            name: 'Region_Code__c',
            type: 'string'
        },
        {
            name: 'RTE_TYP_CDV__c',
            type: 'string'
        },
        {
            name: 'HRCHY_LVL__c',
            type: 'string'
        },
        {
            name: 'Location__c',
            type: 'string'
        },
        {
            name: 'Dist_Target_for_Customer__c',
            type: 'string'
        }
    ]
}

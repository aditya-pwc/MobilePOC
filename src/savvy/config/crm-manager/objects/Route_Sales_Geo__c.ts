export default {
    name: 'Route_Sales_Geo__c',
    soupName: 'Route_Sales_Geo__c',
    initQuery:
        'SELECT Id, GTMU_RTE_ID__c, RTE_TYP_GRP_NM__c, LOCL_RTE_ID__c,' +
        ' RTE_TYP_CDV__c, HRCHY_LVL__c, Location__c' +
        ' FROM Route_Sales_Geo__c WHERE Id IN' +
        " (SELECT Route__c FROM Employee_To_Route__c WHERE User__c ='%s' AND Active_Flag__c = true) " +
        'ORDER BY Id',
    fieldList: [
        {
            name: 'Id',
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
        }
    ]
}

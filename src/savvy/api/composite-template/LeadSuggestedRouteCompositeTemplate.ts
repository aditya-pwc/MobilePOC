import { getAllFieldsByObjName } from '../../utils/SyncUtils'

export const genLeadSuggestedRouteCompositeGroup = (nationalRoute: string) => {
    return [
        {
            method: 'GET',
            q: `SELECT ${getAllFieldsByObjName(
                'Route_Sales_Geo__c'
            ).join()} FROM Route_Sales_Geo__c WHERE GTMU_RTE_ID__c='${nationalRoute}'`,
            referenceId: 'refRoute',
            name: 'Route_Sales_Geo__c'
        },
        {
            method: 'GET',
            q:
                `SELECT ${getAllFieldsByObjName('Employee_To_Route__c').join()} FROM Employee_To_Route__c WHERE ` +
                "Route__c='@{refRoute.records[0].Id}' AND User__r.Name != null AND Active_Flag__c = true AND Status__c = 'Processed' LIMIT 1",
            referenceId: 'refETR',
            name: 'Employee_To_Route__c'
        }
    ]
}

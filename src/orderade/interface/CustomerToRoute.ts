/* eslint-disable camelcase */
export interface CustomerToRouteType {
    Id: string
    Route__c: string
    ACTV_FLG__c: string
    Customer__c: string
    Route__r?: {
        GTMU_RTE_ID__c?: string
    }
}

// eslint disable reason: Keep object variable naming consistent with Salesforce.
/* eslint-disable camelcase */
import { User } from './UserModel'
export interface RouteSalesGeo {
    User__r: Partial<User>
    Id: string
    RTE_ID__c: string
    LOC_ID__c: string
    GTMU_RTE_ID__c: string
    RTE_TYP_GRP_NM__c: string
    LOCL_RTE_ID__c: string
    RTE_TYP_CDV__c: string
    HRCHY_LVL__c: string
    Region_Code__c: string
    Location__c: string
    Dist_Target_for_Customer__c: string
    UNIQ_ID_VAL__c: string
    SLS_UNIT_ID__c: string
    SLS_UNIT_NM__c: string
    Tme_Zone_Cde__c: string
}

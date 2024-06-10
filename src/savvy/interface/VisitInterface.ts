/* eslint-disable camelcase */
import { BaseSoupInterface } from './SoupModel'

export interface Visit extends BaseSoupInterface {
    Actual_Duration_Minutes__c: number
    Ad_Hoc__c: boolean
    AMAS_Compliant__c: boolean
    Batch_Job_Id__c: string
    Calculated_Duration__c: number
    Cases_Goal_Quantity__c: number
    Cases_Goal_Revenue__c: number
    Check_In_Location_Flag__c: boolean
    Check_Out_Location_Flag__c: boolean
    Number_of_Delivery_Issues__c: number
    Planned_Duration_Minutes__c: number
    Planned_Mileage__c: number
    Planned_Travel_Time__c: number
    Pull_Number__c: number
    Sales_Visit__c: boolean
    Scheduled_Case_Quantity__c: number
    Sequence__c: number
    Take_Order_Flag__c: boolean
}

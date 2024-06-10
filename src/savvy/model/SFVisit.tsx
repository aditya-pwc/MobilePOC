/* eslint-disable camelcase */
/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-01-12 19:20:39
 * @LastEditTime: 2022-01-17 21:45:18
 * @LastEditors: Mary Qian
 */

import { SFBase } from './SFBase'

export class SFVisit extends SFBase {
    VisitorId: string = ''
    PlaceId: string = ''
    Pull_Number__c: string = ''
    Take_Order_Flag__c: string = ''
    Visit_Subtype__c: string = ''
    Planned_Date__c: string = ''
    InstructionDescription: string = ''
    Visit_List__c: string = ''
    ActualVisitStartTime: string = ''
    ActualVisitEndTime: string = ''
    Actual_Duration_Minutes__c: string = ''
    Check_In_Location_Flag__c: string = ''
    Check_Out_Location_Flag__c: string = ''
    OwnerId: string = ''
    PlannedVisitStartTime: string = ''
    PlannedVisitEndTime: string = ''
    Sequence__c: string = ''
    Status__c: string = ''
    Ad_Hoc__c: string = ''
    Manager_Ad_Hoc__c: string = ''
    Planned_Duration_Minutes__c: string = ''
    Planned_Travel_Time__c: string = ''
    Planned_Mileage__c: string = ''
    RecordTypeId: string = ''
}

export const sfVisitSelect = () => {
    const visit = new SFVisit()
    return Object.keys(visit).join(', ')
}

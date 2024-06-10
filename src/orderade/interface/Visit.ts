/*
 * @Author: Tom tong.jiang@pwc.com
 * @Date: 2023-05-30 18:25:35
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @LastEditTime: 2024-01-21 22:32:43
 * @Description: Data Model that reflects local SF Data Structure
 */
// eslint disable reason: Keep object variable naming consistent with Salesforce.
/* eslint-disable camelcase */

import { RecordType } from './RecordTypeModel'
import { User } from './UserModel'
import { MyDayVisitModel } from './MyDayVisit'
import { VisitList } from './VisitListModel'

export interface VisitModel {
    Id: string
    Sales_Visit__c: string
    Name: string
    OwnerId: string
    PlaceId: string
    VisitorId: string
    'Visitor.Name': string
    Status__c: string
    ActualVisitEndTime: string
    ActualVisitStartTime: string
    LastModifiedDate: string
    Ad_Hoc__c: boolean
    RecordTypeId: string
    RecordType: RecordType
    Planned_Date__c: string
    Sequence__c: number
    Visit_List__c: string
    Scheduled_Case_Quantity__c: string
    Cases_Goal_Quantity__c: string
    RTE_ID__c: string
    vlRefId: number
    userVlRefId: number
    Check_In_Location__Latitude__s: string
    Check_In_Location__Longitude__s: string
    Check_In_Location_Flag__c: boolean
    User_Visit_List__c: string
    Check_Out_Location__Latitude__s: string
    Check_Out_Location__Longitude__s: string
    Check_Out_Location_Flag__c: boolean
    User__c: string
    User__r: User
    Order_Cart_Identifier__c?: string
    Visit_Legacy_ID__c: string
    ASAS_Compliant__c: boolean
}

export interface MapType {
    [id: string]: any
}

export type MyDaySectionListData = {
    data: MyDayVisitModel[]
    StartDateTime: VisitList['StartDateTime']
    EndDateTime: VisitList['EndDateTime']
    VisitDate: VisitList['VisitDate']
    Status: VisitList['Status']
    Id: VisitList['Id']
    _soupEntryId: VisitList['_soupEntryId']
    Name: VisitList['Name']
}

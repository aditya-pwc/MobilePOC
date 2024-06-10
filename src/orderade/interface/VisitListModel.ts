import { TodayMetricProps } from '../component/visits/VisitMetric'
import { VisitListStatus } from '../enum/VisitListStatus'
import { MyDayVisitModel } from './MyDayVisit'
export interface VisitList {
    Id: string
    _soupEntryId: string
    Name: string
    OwnerId: string
    LastModifiedDate: string
    StartDate: string
    EndDate: string
    StartDateTime: string
    EndDateTime: string
    VisitDate: string
    RecordTypeId: string
    Status?: VisitListStatus
    LocationId: string
    RecordTypeDeveloperName: string
    VisitListSubtype: string
    VisitListLegacyId: string
}

export interface VisitListDataModel {
    myVisitsSectionList: Array<MyDayVisitListModel>
    metric: TodayMetricProps | null
    userVisitLists: Array<VisitList>
}

export interface MyDayVisitListModel extends Partial<VisitList> {
    data?: Array<MyDayVisitModel>
    route: string
    userName?: string
    index?: number
    meta?: string
}

export const mapVisitListToInteface = (input: any): Array<VisitList> => {
    if (!input || !input.length) {
        return []
    }
    return input.map((el: any) => {
        return {
            Id: el.Id,
            _soupEntryId: el._soupEntryId,
            Name: el.Name,
            OwnerId: el.OwnerId,
            LastModifiedDate: el.LastModifiedDate,
            StartDate: el.Start_Date__c,
            EndDate: el.End_Date__c,
            StartDateTime: el.Start_Date_Time__c,
            EndDateTime: el.End_Date_Time__c,
            VisitDate: el.Visit_Date__c,
            RecordTypeId: el.RecordTypeId,
            Status: el.Status__c,
            LocationId: el.Location_Id__c,
            RecordTypeDeveloperName: el['RecordType.DeveloperName'],
            VisitListSubtype: el.Visit_List_Subtype__c,
            VisitListLegacyId: el.Visit_List_Legacy_ID__c
        }
    })
}

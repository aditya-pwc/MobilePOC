import { SoupService } from '../service/SoupService'
import { restApexCommonCall, restDataCommonCall, syncDownObj } from '../api/SyncUtils'
import { baseObjects } from '../../common/config/BaseObjects'
import { CommonParam } from '../../common/CommonParam'
import moment from 'moment'
import { CommonLabel } from '../enums/CommonLabel'
import { getIdClause } from '../components/manager/helper/MerchManagerHelper'
import StatusCode from '../enums/StatusCode'
import _ from 'lodash'
import { transferDateTimeInQuery } from '../utils/TimeZoneUtils'
import { setupLocationByCoordinates } from '../utils/locationUtils'
import NonDisplayPromotionService from '../service/NonDisplayPromotionService'
import { existParamsEmpty } from '../api/ApiUtil'
import Contract from './psr/objects/Contract'
import RetailVisitKpi from './psr/objects/RetailVisitKpi'
// eslint-disable-next-line camelcase
import Mission_Id__mdt from './psr/objects/Mission_Id__mdt'

const InStoreLocationCondition = ` WHERE RetailStoreId IN APPLY_VISIT_STORE 
    AND Start_Date__c <= NEXT_N_DAYS:0:DATE 
    AND (End_Date__c >= NEXT_N_DAYS:0:DATE OR End_Date__c = NULL) 
    AND Delete_Flag__c = false`

const PromotionQuerySuffix = (idName: string) => {
    return ` SELECT ${idName} FROM InStoreLocation ${InStoreLocationCondition}`
}

const MerchandiserConfig = {
    name: 'Merchandiser',
    tab: [CommonLabel.COPILOT, CommonLabel.MY_VISIT],
    objs: [
        ...baseObjects,
        Contract,
        RetailVisitKpi,
        // eslint-disable-next-line camelcase
        Mission_Id__mdt,
        {
            name: 'User',
            soupName: 'User',
            initQuery: `SELECT Id, Name, Phone,MobilePhone, Profile.Name, GM_LOC_ID__c, FirstName, LastName,
            PERSONA__c, GPID__c, BU_ID__c FROM User WHERE GM_LOC_ID__c = APPLY_USER_LOCATION`,
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Name',
                    type: 'string'
                },
                {
                    name: 'FirstName',
                    type: 'string'
                },
                {
                    name: 'LastName',
                    type: 'string'
                },
                {
                    name: 'Profile.Name',
                    type: 'string'
                },
                {
                    name: 'Phone',
                    type: 'string'
                },
                {
                    name: 'MobilePhone',
                    type: 'string'
                },
                {
                    name: 'GM_LOC_ID__c',
                    type: 'string'
                },
                {
                    name: 'PERSONA__c',
                    type: 'string'
                },
                {
                    name: 'GPID__c',
                    type: 'string'
                },
                {
                    name: 'BU_ID__c',
                    type: 'string'
                }
            ]
        },
        {
            name: 'Event',
            soupName: 'Event',
            initQuery: `SELECT Id, OwnerId, StartDateTime, EndDateTime, Type, SubType__c, Subject, Attendees_Count__c,
            Start_Location__latitude__s, Start_Location__longitude__s, End_Location__latitude__s,
            Start_Location__c,End_Location__c, End_Location__longitude__s,Actual_Start_Time__c,
            Actual_End_Time__c, Visit_List__c, LastModifiedDate, Manager_Scheduled__c, Location,
            Description, MeetingName__c, VirtualLocation__c, ActivityDate, Parent_Event__c, Planned_Duration__c,
            Location__c, Aggregate_Duration__c, Planned_Cost__c, WhatId, IsRemoved__c FROM Event WHERE isChild = false
            AND StartDateTime >= LAST_N_DAYS:14:TIME AND StartDateTime <= NEXT_N_DAYS:8:TIME AND OwnerId = APPLY_CURRENT_USER_ID
            AND IsRemoved__c = false`,
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Start_Location__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'End_Location__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'OwnerId',
                    type: 'string'
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'StartDateTime',
                    type: 'string'
                },
                {
                    name: 'EndDateTime',
                    type: 'string'
                },
                {
                    name: 'Type',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'SubType__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Attendees_Count__c',
                    type: 'number',
                    skipSyncUp: true
                },
                {
                    name: 'Actual_Start_Time__c',
                    type: 'string'
                },
                {
                    name: 'Actual_End_Time__c',
                    type: 'string'
                },
                {
                    name: 'Subject',
                    type: 'string'
                },
                {
                    name: 'End_Location__latitude__s',
                    type: 'string'
                },
                {
                    name: 'End_Location__longitude__s',
                    type: 'string'
                },
                {
                    name: 'Start_Location__latitude__s',
                    type: 'string'
                },
                {
                    name: 'Start_Location__longitude__s',
                    type: 'string'
                },
                {
                    name: 'Visit_List__c',
                    type: 'string'
                },
                {
                    name: 'Manager_Scheduled__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'Location',
                    type: 'string'
                },
                {
                    name: 'Description',
                    type: 'string'
                },
                {
                    name: 'MeetingName__c',
                    type: 'string'
                },
                {
                    name: 'VirtualLocation__c',
                    type: 'string'
                },
                {
                    name: 'ActivityDate',
                    type: 'string'
                },
                {
                    name: 'Parent_Event__c',
                    type: 'string'
                },
                {
                    name: 'Planned_Duration__c',
                    type: 'string'
                },
                {
                    name: 'Location__c',
                    type: 'string'
                },
                {
                    name: 'Aggregate_Duration__c',
                    type: 'string'
                },
                {
                    name: 'Planned_Cost__c',
                    type: 'string'
                },
                {
                    name: 'WhatId',
                    type: 'string'
                },
                {
                    name: 'IsRemoved__c',
                    type: 'boolean',
                    skipSyncUp: true
                }
            ],
            syncDownCB: () => {
                return new Promise((resolve, reject) => {
                    SoupService.retrieveDataFromSoup('Event', {}, [])
                        .then((res: any) => {
                            if (!res.length) {
                                resolve(Promise.resolve())
                            }
                            res.forEach((event) => {
                                setupLocationByCoordinates(event, true, true)
                            })
                            resolve(SoupService.upsertDataIntoSoup('Event', res, true, true))
                        })
                        .catch((err) => {
                            reject(err)
                        })
                })
            }
        },
        {
            name: 'PictureData',
            soupName: 'PictureData',
            fieldList: [
                {
                    name: 'Name',
                    type: 'string'
                },
                {
                    name: 'Type',
                    type: 'string'
                },
                {
                    name: 'TargetId',
                    type: 'string'
                },
                {
                    name: 'ManagerName',
                    type: 'string'
                },
                {
                    name: 'SkipReason',
                    type: 'string'
                },
                {
                    name: 'Data',
                    type: 'string'
                },
                {
                    name: 'IsUploaded',
                    type: 'string'
                },
                {
                    name: 'ContentDocumentId',
                    type: 'string'
                }
            ]
        },
        {
            name: 'AssessmentTask',
            soupName: 'AssessmentTask',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Name',
                    type: 'string'
                },
                {
                    name: 'TaskType',
                    type: 'string'
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string'
                },
                {
                    name: 'ParentId',
                    type: 'string'
                }
            ]
        },
        {
            name: 'RetailStore',
            soupName: 'RetailStore',
            initQuery: `SELECT Id,Account.Merchandising_Base_Minimum_Requirement__c,Name, Street, City, State, Country, PostalCode, Latitude, Longitude,
            RetailLocationGroupId,Account.Phone, Account.Name, Owner.Name, OwnerId, LocationId, Store_Location__c, MapstedPropertyId__c,
            Geofence__c, LastModifiedDate, Account.CUST_UNIQ_ID_VAL__c, RTLR_STOR_NUM__c, AccountId ,Account.IsCDACustomer__c,Account.LOC_PROD_ID__c  FROM RetailStore
            WHERE Account.LOC_PROD_ID__c = APPLY_USER_LOCATION`,
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Account.Merchandising_Base_Minimum_Requirement__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Name',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Street',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'City',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'State',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Country',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'PostalCode',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Latitude',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Longitude',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RetailLocationGroupId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Phone',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Name',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Owner.Name',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'OwnerId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LocationId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Store_Location__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.CUST_UNIQ_ID_VAL__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RTLR_STOR_NUM__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'MapstedPropertyId__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'AccountId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Geofence__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.CUST_SRVC_FLG__c',
                    type: 'boolean'
                },
                {
                    name: 'Account.CUST_PROD_FLG__c',
                    type: 'boolean'
                },
                {
                    name: 'Account.CUST_BLG_FLG__c',
                    type: 'boolean'
                },
                {
                    name: 'Account.IsCDACustomer__c',
                    type: 'boolean'
                },
                {
                    name: 'Account.LOC_PROD_ID__c',
                    type: 'boolean'
                }
            ]
        },
        {
            name: 'Visit',
            soupName: 'Visit',
            initQuery:
                'SELECT Id, Name, OwnerId, PlaceId, VisitorId, Visitor.Name, Status__c, ActualVisitEndTime,' +
                ' ActualVisitStartTime,Check_In_Location_Flag__c, Check_Out_Location_Flag__c, LastModifiedDate, PlannedVisitEndTime, PlannedVisitStartTime,Check_Out_Location__c,' +
                ' Visit_Subtype__c, Take_Order_Flag__c, InstructionDescription, Pull_Number__c,Check_In_Location__c,' +
                ' Ad_Hoc__c, Manager_Ad_Hoc__c, Customer_ID__c, RecordTypeId, RecordType.Id, RecordType.Name, RecordType.DeveloperName,Planned_Date__c, Sequence__c, Visit_List__c,' +
                ' Planned_Duration_Minutes__c, Actual_Duration_Minutes__c, AMAS_Compliant__c, Reassigned_Flag__c FROM Visit ' +
                " WHERE VisitorId = APPLY_CURRENT_USER_ID AND Planned_Date__c>=LAST_N_DAYS:14:DATE AND Planned_Date__c <= NEXT_N_DAYS:7:DATE AND Status__c != 'Pre-Processed' AND Status__c != 'Removed' AND Status__c != 'Failed'",
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Name',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'PlaceId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'VisitorId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Visitor.Name',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Status__c',
                    type: 'string'
                },
                {
                    name: 'ActualVisitEndTime',
                    type: 'string'
                },
                {
                    name: 'ActualVisitStartTime',
                    type: 'string'
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'PlannedVisitEndTime',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'PlannedVisitStartTime',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Check_In_Location__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Check_Out_Location__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Visit_Subtype__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Take_Order_Flag__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'InstructionDescription',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Pull_Number__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'CreatedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Planned_Duration_Minutes__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Scheduled_Case_Quantity__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RecordTypeId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RecordType.Id',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RecordType.Name',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RecordType.DeveloperName',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Visit_List__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Planned_Date__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Customer_ID__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Sequence__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'OwnerId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Ad_Hoc__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'Manager_Ad_Hoc__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'Check_In_Location_Flag__c',
                    type: 'boolean'
                },
                {
                    name: 'Check_In_Location__latitude__s',
                    type: 'string'
                },
                {
                    name: 'Check_In_Location__longitude__s',
                    type: 'string'
                },
                {
                    name: 'Check_Out_Location_Flag__c',
                    type: 'boolean'
                },
                {
                    name: 'Check_Out_Location__latitude__s',
                    type: 'string'
                },
                {
                    name: 'Check_Out_Location__longitude__s',
                    type: 'string'
                },
                {
                    name: 'Actual_Duration_Minutes__c',
                    type: 'string'
                },
                {
                    name: 'AMAS_Compliant__c',
                    type: 'boolean'
                },
                {
                    name: 'Reassigned_Flag__c',
                    type: 'boolean'
                }
            ],
            syncDownCB: () => {
                return new Promise((resolve, reject) => {
                    SoupService.retrieveDataFromSoup('Visit', {}, ['PlaceId', 'Visit_List__c', 'Customer_ID__c'])
                        .then(async (res: any) => {
                            if (res.length) {
                                const uniqueStoreIds: Array<string> = Array.from(new Set(res.map((v) => v.PlaceId)))
                                const uniqueCustomerIds = Array.from(new Set(res.map((v) => v.Customer_ID__c)))
                                const uniqueVLIds = Array.from(new Set(res.map((v) => v.Visit_List__c)))
                                CommonParam.uniqueStoreIds = _.cloneDeep(uniqueStoreIds)
                                CommonParam.uniqueCustomerIds = uniqueCustomerIds
                                CommonParam.uniqueVLIds = uniqueVLIds
                                let allEmployeesVisitArr = []

                                let query =
                                    'SELECT Id, Name, OwnerId, PlaceId, VisitorId, Visitor.Name, Status__c, ActualVisitEndTime,' +
                                    ' ActualVisitStartTime, Check_In_Location_Flag__c, Check_Out_Location_Flag__c, LastModifiedDate, PlannedVisitEndTime, PlannedVisitStartTime,Check_Out_Location__c,' +
                                    ' Visit_Subtype__c, Take_Order_Flag__c, InstructionDescription, Pull_Number__c,Check_In_Location__c,' +
                                    ' Ad_Hoc__c, Manager_Ad_Hoc__c, Customer_ID__c, RecordTypeId,RecordType.Id, RecordType.DeveloperName,Planned_Date__c, Sequence__c, Visit_List__c,' +
                                    ' Planned_Duration_Minutes__c, Actual_Duration_Minutes__c, AMAS_Compliant__c, Reassigned_Flag__c '

                                if (uniqueStoreIds.length > 10) {
                                    while (uniqueStoreIds.length > 0) {
                                        const tempStoreIds = uniqueStoreIds.splice(0, 10)
                                        const newQuery =
                                            query +
                                            ` FROM Visit WHERE PlaceId IN (${getIdClause(tempStoreIds)}) 
                                    AND Planned_Date__c>=${transferDateTimeInQuery('LAST_N_DAYS:14:DATE')} 
                                    AND Planned_Date__c <= ${transferDateTimeInQuery('NEXT_N_DAYS:7:DATE')} 
                                    AND (RecordType.DeveloperName = 'Delivery' OR RecordType.DeveloperName = 'Sales')`
                                        const queryAllEmployeesVisitResult = await restDataCommonCall(
                                            `query/?q=${newQuery}`,
                                            'GET'
                                        )

                                        if (
                                            queryAllEmployeesVisitResult.status === StatusCode.SuccessOK &&
                                            queryAllEmployeesVisitResult?.data?.records?.length > 0
                                        ) {
                                            allEmployeesVisitArr = allEmployeesVisitArr.concat(
                                                queryAllEmployeesVisitResult.data.records
                                            )
                                        }
                                    }
                                } else {
                                    query += ` FROM Visit WHERE PlaceId IN (${getIdClause(uniqueStoreIds)}) 
                                AND Planned_Date__c>=${transferDateTimeInQuery('LAST_N_DAYS:14:DATE')} 
                                AND Planned_Date__c <= ${transferDateTimeInQuery('NEXT_N_DAYS:7:DATE')}  
                                AND (RecordType.DeveloperName = 'Delivery' OR RecordType.DeveloperName = 'Sales')`
                                    const queryAllEmployeesVisitResult = await restDataCommonCall(
                                        `query/?q=${query}`,
                                        'GET'
                                    )

                                    if (
                                        queryAllEmployeesVisitResult.status === StatusCode.SuccessOK &&
                                        queryAllEmployeesVisitResult?.data?.records?.length > 0
                                    ) {
                                        allEmployeesVisitArr = allEmployeesVisitArr.concat(
                                            queryAllEmployeesVisitResult.data.records
                                        )
                                    }
                                }
                                await SoupService.upsertDataIntoSoupWithExternalId(
                                    'Visit',
                                    allEmployeesVisitArr,
                                    true,
                                    true
                                )
                                resolve(Promise.resolve())
                            } else {
                                resolve(Promise.resolve())
                            }
                        })
                        .catch((err) => {
                            reject(err)
                        })
                })
            },
            syncUpUpdateFields: [
                'Id',
                'Status__c',
                'Check_In_Location_Flag__c',
                'Check_Out_Location_Flag__c',
                'Check_In_Location__latitude__s',
                'Check_In_Location__longitude__s',
                'Check_Out_Location__latitude__s',
                'Check_Out_Location__longitude__s',
                'ActualVisitEndTime',
                'ActualVisitStartTime',
                'Actual_Duration_Minutes__c',
                '__locally_updated__'
            ],
            syncUpUpdateQuery:
                'SELECT {Visit:Id},{Visit:Status__c},{Visit:Check_In_Location_Flag__c},{Visit:Check_Out_Location_Flag__c},' +
                '{Visit:Check_In_Location__latitude__s},{Visit:Check_In_Location__longitude__s},{Visit:Check_Out_Location__latitude__s},' +
                '{Visit:Check_Out_Location__longitude__s},' +
                '{Visit:ActualVisitEndTime},{Visit:ActualVisitStartTime},' +
                '{Visit:Actual_Duration_Minutes__c}, {Visit:__locally_updated__}' +
                "FROM {Visit} WHERE {Visit:__locally_updated__}='1'",
            syncUpCreateFields: [
                'Id',
                'OwnerId',
                'PlaceId',
                'VisitorId',
                'Status__c',
                'ActualVisitEndTime',
                'ActualVisitStartTime',
                'PlannedVisitEndTime',
                'PlannedVisitStartTime',
                'Ad_Hoc__c',
                'Manager_Ad_Hoc__c',
                'RecordTypeId',
                'Planned_Date__c',
                'Sequence__c',
                'Actual_Duration_Minutes__c'
            ],
            syncUpCreateQuery:
                'SELECT {Visit:Id},{Visit:OwnerId},{Visit:PlaceId},{Visit:VisitorId},' +
                '{Visit:Status__c},{Visit:ActualVisitEndTime},{Visit:ActualVisitStartTime},{Visit:PlannedVisitEndTime},' +
                '{Visit:PlannedVisitStartTime},{Visit:Ad_Hoc__c},{Visit:Manager_Ad_Hoc__c},{Visit:RecordTypeId},' +
                '{Visit:Planned_Date__c},{Visit:Sequence__c},{Visit:Actual_Duration_Minutes__c} ' +
                'FROM {Visit} WHERE {Visit:Id} IS NULL'
        },
        {
            name: 'Visit_List__c',
            soupName: 'Visit_List__c',
            initQuery: `SELECT Id, Status__c, Name, Push_Flag__c, Start_Gap_Notification__c, Location_Id__c, OwnerId, 
                Visit_List_Group__c, RecordType.Name, RecordType.DeveloperName, LastModifiedDate, Start_Location__latitude__s, 
                Start_Location__longitude__s,Start_Location__c,End_Location__c,End_Location__latitude__s, 
                End_Location__longitude__s, Start_Date__c, End_Date__c, Start_Date_Time__c, End_Date_Time__c, 
                Visit_Date__c, RecordTypeId, Planned_Service_Time__c, Planned_Travel_Time__c, Total_Planned_Time__c, 
                IsRemoved__c FROM Visit_List__c
                WHERE IsRemoved__c = false AND Status__c != 'Pre-Processed' AND OwnerId = APPLY_CURRENT_USER_ID AND (((Visit_Date__c >= LAST_N_DAYS:14:DATE AND Visit_Date__c <= NEXT_N_DAYS:7:DATE) AND RecordType.DeveloperName = 'Daily_Visit_List')
                OR (Start_Date__c >= LAST_N_DAYS:14:DATE AND Start_Date__c <= NEXT_N_DAYS:14:DATE AND RecordType.DeveloperName = 'Visit_List_Group')
                    OR (Status__c='In Progress')
                )`,
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Status__c',
                    type: 'string'
                },
                {
                    name: 'Name',
                    type: 'string'
                },
                {
                    name: 'Location_Id__c',
                    type: 'string'
                },
                {
                    name: 'Push_Flag__c',
                    type: 'boolean'
                },
                {
                    name: 'Start_Gap_Notification__c',
                    type: 'number'
                },
                {
                    name: 'OwnerId',
                    type: 'string'
                },
                {
                    name: 'Visit_List_Group__c',
                    type: 'string'
                },
                {
                    name: 'RecordType.Name',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RecordType.DeveloperName',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Start_Location__latitude__s',
                    type: 'string'
                },
                {
                    name: 'Start_Location__longitude__s',
                    type: 'string'
                },
                {
                    name: 'Start_Location__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'End_Location__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'End_Location__latitude__s',
                    type: 'string'
                },
                {
                    name: 'End_Location__longitude__s',
                    type: 'string'
                },
                // {
                //     name: 'Start_Location__c',
                //     type: 'string',
                //     skipSyncUp: true
                // },
                // {
                //     name: 'End_Location__c',
                //     type: 'string',
                //     skipSyncUp: true
                // },
                {
                    name: 'Start_Date__c',
                    type: 'string'
                },
                {
                    name: 'End_Date__c',
                    type: 'string'
                },
                {
                    name: 'Start_Date_Time__c',
                    type: 'string'
                },
                {
                    name: 'End_Date_Time__c',
                    type: 'string'
                },
                {
                    name: 'Visit_Date__c',
                    type: 'string'
                },
                {
                    name: 'RecordTypeId',
                    type: 'string'
                },
                {
                    name: 'Batch_Id__c',
                    type: 'string'
                },
                {
                    name: 'Planned_Service_Time__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Planned_Travel_Time__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Total_Planned_Time__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'externalId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'IsRemoved__c',
                    type: 'boolean',
                    skipSyncUp: true
                }
            ],
            syncDownCB: () => {
                const tz = CommonParam.userTimeZone
                const time = moment(new Date()).tz(tz).unix() * 1000
                const userLocationId = CommonParam.userLocationId
                if (!existParamsEmpty([time.toString(), userLocationId])) {
                    restApexCommonCall('/updatelastsynctime/Visit_List__c&' + time + '&' + userLocationId, 'GET')
                }
                return new Promise((resolve, reject) => {
                    SoupService.retrieveDataFromSoup('Visit_List__c', {}, ['Visit_List_Group__c'], null, [
                        " WHERE {Visit_List__c:Status__c}='In Progress' AND {Visit_List__c:Id} IS NOT NULL"
                    ])
                        .then((res: any) => {
                            if (res.length) {
                                const wvlIds = res
                                    .filter((l) => l.Visit_List_Group__c)
                                    .map((t) => {
                                        return "'" + t.Visit_List_Group__c + "'"
                                    })
                                if (wvlIds.length > 0) {
                                    const cbPromiseArr = []
                                    const soupName = 'Visit_List__c'
                                    let query = `SELECT Id, Status__c, Name, Push_Flag__c, Start_Gap_Notification__c, Location_Id__c, OwnerId, 
                                Visit_List_Group__c, RecordType.Name, RecordType.DeveloperName, LastModifiedDate, Start_Location__latitude__s, 
                                Start_Location__longitude__s,Start_Location__c,End_Location__c,End_Location__latitude__s, 
                                End_Location__longitude__s, Start_Date__c, End_Date__c, Start_Date_Time__c, End_Date_Time__c, 
                                Visit_Date__c, RecordTypeId, Planned_Service_Time__c, Planned_Travel_Time__c, Total_Planned_Time__c, 
                                IsRemoved__c FROM Visit_List__c`
                                    if (wvlIds.length > 20) {
                                        while (wvlIds.length > 0) {
                                            const tmpvlids = wvlIds.splice(0, 10)
                                            const newQuery = query + ' WHERE Id IN (' + tmpvlids.join(',') + ')'
                                            cbPromiseArr.push(syncDownObj(soupName, newQuery))
                                        }
                                    } else {
                                        query += ' WHERE Id IN (' + wvlIds.join(',') + ')'
                                        cbPromiseArr.push(syncDownObj(soupName, query))
                                    }
                                    resolve(Promise.all(cbPromiseArr))
                                }
                                resolve(Promise.resolve())
                            } else {
                                resolve(Promise.resolve())
                            }
                        })
                        .catch((err) => {
                            reject(err)
                        })
                })
            },
            syncUpUpdateFields: [
                'Id',
                'Name',
                'Push_Flag__c',
                'Start_Gap_Notification__c',
                'OwnerId',
                'Start_Location__latitude__s',
                'Start_Location__longitude__s',
                'End_Location__latitude__s',
                'End_Location__longitude__s',
                'Start_Location__c',
                'End_Location__c',
                'Start_Date__c',
                'End_Date__c',
                'Start_Date_Time__c',
                'End_Date_Time__c',
                'Visit_Date__c',
                'RecordTypeId',
                'Status__c'
            ],
            syncUpUpdateQuery:
                'SELECT ' +
                '{Visit_List__c:Id}, ' +
                '{Visit_List__c:Name},' +
                '{Visit_List__c:Push_Flag__c},' +
                '{Visit_List__c:Start_Gap_Notification__c},' +
                '{Visit_List__c:OwnerId},' +
                '{Visit_List__c:Start_Location__latitude__s},' +
                '{Visit_List__c:Start_Location__longitude__s},' +
                '{Visit_List__c:End_Location__latitude__s},' +
                '{Visit_List__c:End_Location__longitude__s},' +
                '{Visit_List__c:Start_Date__c},' +
                '{Visit_List__c:End_Date__c},' +
                '{Visit_List__c:Start_Date_Time__c},' +
                '{Visit_List__c:End_Date_Time__c},' +
                '{Visit_List__c:Visit_Date__c},' +
                '{Visit_List__c:RecordTypeId},' +
                '{Visit_List__c:Status__c},' +
                '{Visit_List__c:Visit_List_Group__c},' +
                '{Visit_List__c:Location_Id__c} ' +
                "FROM {Visit_List__c} WHERE {Visit_List__c:__locally_updated__}='1'",
            syncUpCreateFields: [
                'Id',
                'Name',
                'Push_Flag__c',
                'Start_Gap_Notification__c',
                'OwnerId',
                'Start_Location__latitude__s',
                'Start_Location__longitude__s',
                'End_Location__latitude__s',
                'End_Location__longitude__s',
                'Start_Date__c',
                'End_Date__c',
                'Start_Date_Time__c',
                'End_Date_Time__c',
                'Visit_Date__c',
                'RecordTypeId',
                'Status__c',
                'Visit_List_Group__c',
                'Location_Id__c',
                'Updated__c'
            ],
            syncUpCreateQuery:
                'SELECT ' +
                '{Visit_List__c:Id}, ' +
                '{Visit_List__c:Name},' +
                '{Visit_List__c:Push_Flag__c},' +
                '{Visit_List__c:Start_Gap_Notification__c},' +
                '{Visit_List__c:OwnerId},' +
                '{Visit_List__c:Start_Location__latitude__s},' +
                '{Visit_List__c:Start_Location__longitude__s},' +
                '{Visit_List__c:End_Location__latitude__s}, ' +
                '{Visit_List__c:End_Location__longitude__s}, ' +
                '{Visit_List__c:Start_Date__c},' +
                '{Visit_List__c:End_Date__c},' +
                '{Visit_List__c:Start_Date_Time__c},' +
                '{Visit_List__c:End_Date_Time__c},' +
                '{Visit_List__c:Visit_Date__c},' +
                '{Visit_List__c:RecordTypeId},' +
                '{Visit_List__c:Status__c},' +
                '{Visit_List__c:Visit_List_Group__c},' +
                '{Visit_List__c:Location_Id__c},' +
                '{Visit_List__c:Updated__c} ' +
                "FROM {Visit_List__c} WHERE {Visit_List__c:__locally_updated__}='1'"
        },
        {
            name: 'Task',
            soupName: 'Task',
            initQuery:
                'SELECT Id, OwnerId, Display_Id_Instore__c, Display_Id_Instore__r.End_Date__c, Location_Formula__c, LastModifiedDate, ActivityDate, ' +
                ' WhatId, Wo_Ordered_By_ID__c, Wo_Ordered_By_Name__c, Wo_Approver_Id__c, Wo_Approver_Name__c,  Wo_Subject__c, ' +
                'Wo_Comments__c, Description, Merch_Comments__c, Subject, Status, Type, Wo_Location__c, RecordTypeId, ' +
                'RecordType.Id, RecordType.Name, RecordType.DeveloperName, Wo_Cmplt_Dte__c, Completed_By_User__c, Record_Updated__c FROM Task ' +
                "WHERE What.type = 'RetailStore' and (Display_Id_Instore__r.End_Date__c = null or Display_Id_Instore__r.End_Date__c >= NEXT_N_DAYS:0:DATE) and WhatId IN APPLY_VISIT_STORE AND RecordType.DeveloperName = 'Work_Order'",
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'OwnerId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Display_Id_Instore__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Display_Id_Instore__r.End_Date__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Location_Formula__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'ActivityDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'WhatId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Wo_Ordered_By_ID__c',
                    type: 'string'
                },
                {
                    name: 'Wo_Ordered_By_Name__c',
                    type: 'sting'
                },
                {
                    name: 'Wo_Approver_Id__c',
                    type: 'string'
                },
                {
                    name: 'Wo_Approver_Name__c',
                    type: 'string'
                },
                {
                    name: 'Wo_Subject__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Wo_Comments__c',
                    type: 'string'
                },
                {
                    name: 'Description',
                    type: 'string'
                },

                {
                    name: 'Merch_Comments__c',
                    type: 'string'
                },
                {
                    name: 'Subject',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Status',
                    type: 'string'
                },
                {
                    name: 'Type',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Wo_Location__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RecordTypeId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RecordType.Id',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RecordType.Name',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RecordType.DeveloperName',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Wo_Cmplt_Dte__c',
                    type: 'string'
                },
                {
                    name: 'Completed_By_User__c',
                    type: 'string'
                },
                {
                    name: 'Record_Updated__c',
                    type: 'boolean'
                }
            ],
            syncDownCB: () => {
                return new Promise((resolve, reject) => {
                    SoupService.retrieveDataFromSoup('Task', {}, ['Id'])
                        .then((res: any) => {
                            if (res.length) {
                                const taskIds = res.map((t) => {
                                    return "'" + t.Id + "'"
                                })
                                // CommonParam.taskIds = taskIds
                                const cbPromiseArr = []
                                const soupName = 'ContentDocumentLink'
                                let query =
                                    'SELECT Id, ContentDocumentId, LinkedEntityId, ShareType FROM ContentDocumentLink'
                                if (taskIds.length > 20) {
                                    while (taskIds.length > 0) {
                                        const tmpTids = taskIds.splice(0, 10)
                                        const newQuery = query + ' WHERE LinkedEntityId IN (' + tmpTids.join(',') + ')'
                                        cbPromiseArr.push(syncDownObj(soupName, newQuery))
                                    }
                                } else {
                                    query += ' WHERE LinkedEntityId IN (' + taskIds.join(',') + ')'
                                    cbPromiseArr.push(syncDownObj(soupName, query))
                                }
                                resolve(Promise.all(cbPromiseArr))
                            } else {
                                resolve(Promise.resolve())
                            }
                        })
                        .catch((err) => {
                            reject(err)
                        })
                })
            },
            syncUpUpdateFields: [
                'Id',
                'Wo_Comments__c',
                'Description',
                'Merch_Comments__c',
                'Status',
                'Wo_Cmplt_Dte__c',
                'Completed_By_User__c'
            ],
            syncUpUpdateQuery:
                'SELECT ' +
                '{Task:Id}, ' +
                '{Task:Wo_Comments__c}, ' +
                '{Task:Description}, ' +
                '{Task:Merch_Comments__c},' +
                '{Task:Status},' +
                '{Task:Wo_Cmplt_Dte__c} ' +
                '{Task:Completed_By_User__c} ' +
                "FROM {Task} WHERE {Task:__locally_updated__}='1'",
            syncUpCreateFields: [
                'Id',
                'OwnerId',
                'WhatId',
                'Merch_Comments__c',
                'Status',
                'Wo_Cmplt_Dte__c',
                'Completed_By_User__c'
            ],
            syncUpCreateQuery:
                'SELECT ' +
                '{Task:Id}, ' +
                '{Task:OwnerId},' +
                '{Task:WhatId}' +
                '{Task:Merch_Comments__c},' +
                '{Task:Status},' +
                '{Task:Wo_Cmplt_Dte__c} ' +
                '{Task:Completed_By_User__c} ' +
                "FROM {Task} WHERE {Task:__locally_updated__}='1'"
        },
        {
            name: 'ContentDocumentLink',
            soupName: 'ContentDocumentLink',
            // initQuery: 'SELECT Id, ContentDocumentId, LinkedEntityId, ShareType FROM ContentDocumentLink',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'ContentDocumentId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LinkedEntityId',
                    type: 'string',
                    skipSyncUp: true
                }
            ]
        },
        {
            name: 'ContentDistribution',
            soupName: 'ContentDistribution',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'OwnerId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'ContentDocumentId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'DistributionPublicUrl',
                    type: 'string',
                    skipSyncUp: true
                }
            ]
        },
        {
            name: 'Image',
            soupName: 'Image',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Attachment_Type__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'ContentDocumentId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                }
            ]
        },
        {
            name: 'BreadcrumbsList',
            soupName: 'BreadcrumbsList',
            initQuery: '',
            fieldList: [
                {
                    name: 'lat_num',
                    type: 'string'
                },
                {
                    name: 'long_num',
                    type: 'string'
                },
                {
                    name: 'geo_dt',
                    type: 'string'
                },
                {
                    name: 'isoString',
                    type: 'string'
                }
            ]
        },
        {
            name: 'InStoreLocation',
            soupName: 'InStoreLocation',
            initQuery: `SELECT Id, RetailStoreId, RetailStore.AccountId, 
            X_Coordinate__c, Y_Coordinate__c, Z_Coordinate__c, 
            Start_Date__c, End_Date__c, Display_Name__c, Promotion_Id__c, 
            Department_Code__c, Display_Icon_Code__c, Delete_Flag__c 
            FROM InStoreLocation ${InStoreLocationCondition}`,
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'RetailStoreId',
                    type: 'string'
                },
                {
                    name: 'RetailStore.AccountId',
                    type: 'string'
                },
                {
                    name: 'X_Coordinate__c',
                    type: 'string'
                },
                {
                    name: 'Y_Coordinate__c',
                    type: 'string'
                },
                {
                    name: 'Z_Coordinate__c',
                    type: 'string'
                },
                {
                    name: 'Start_Date__c',
                    type: 'string'
                },
                {
                    name: 'End_Date__c',
                    type: 'string'
                },
                {
                    name: 'Display_Name__c',
                    type: 'string'
                },
                {
                    name: 'Promotion_Id__c',
                    type: 'string'
                },
                {
                    name: 'Department_Code__c',
                    type: 'string'
                },
                {
                    name: 'Display_Icon_Code__c',
                    type: 'string'
                },
                {
                    name: 'Delete_Flag__c',
                    type: 'boolean'
                }
            ]
        },
        {
            name: 'Promotion',
            soupName: 'Promotion',
            initQuery: `SELECT Id, EndDate, StartDate, Cust_ID__c, Name,
            Active_Status__c, First_Delivery_Date__c 
            FROM Promotion 
            WHERE Active_Status__c = true 
            AND Cust_ID__c IN APPLY_CUSTOMER_ID`,
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'EndDate',
                    type: 'string'
                },
                {
                    name: 'StartDate',
                    type: 'string'
                },
                {
                    name: 'Cust_ID__c',
                    type: 'string'
                },
                {
                    name: 'Name',
                    type: 'string'
                },
                {
                    name: 'Active_Status__c',
                    type: 'boolean'
                },
                {
                    name: 'First_Delivery_Date__c',
                    type: 'string'
                }
            ]
        },
        {
            name: 'PromotionProduct',
            soupName: 'PromotionProduct',
            initQuery: `SELECT Id, PromotionId, ProductId, Package_Name__c, Package_Type_Name__c, 
                Sub_Brand__c, Display_Quantity__c, Active_Status__c,
                Display_Start_Date__c, Display_End_Date__c, Retail_Price__c, Retail_Quantity__c FROM PromotionProduct 
                WHERE Active_Status__c = true 
                AND (
                    PromotionId IN (
                        SELECT Id FROM PROMOTION 
                        WHERE Active_Status__c = true 
                        AND Cust_ID__c IN APPLY_CUSTOMER_ID
                    )
                )`,
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'PromotionId',
                    type: 'string'
                },
                {
                    name: 'ProductId',
                    type: 'string'
                },
                {
                    name: 'Package_Name__c',
                    type: 'string'
                },
                {
                    name: 'Package_Type_Name__c',
                    type: 'string'
                },
                {
                    name: 'Sub_Brand__c',
                    type: 'string'
                },
                {
                    name: 'Display_Quantity__c',
                    type: 'string'
                },
                {
                    name: 'Active_Status__c',
                    type: 'boolean'
                },
                {
                    name: 'Display_Start_Date__c',
                    type: 'string'
                },
                {
                    name: 'Display_End_Date__c',
                    type: 'string'
                },
                {
                    name: 'Retail_Price__c',
                    type: 'string'
                },
                {
                    name: 'Retail_Quantity__c',
                    type: 'string'
                }
            ]
        },
        {
            name: 'Account',
            soupName: 'Account', // OperatingHoursId,Sales_Route__c
            lastmodifiedlField: '',
            initQuery:
                'SELECT Id, CUST_ID__c, Phone, BUSN_SGMNTTN_LVL_1_NM__c, BUSN_SGMNTTN_LVL_2_NM__c, BUSN_SGMNTTN_LVL_3_NM__c, ' +
                ' Catering__c, Serves_Breakfast__c, Takeout__c, Serves_Lunch__c, Serves_Alcohol__c, Serves_Dinner__c, Gas_Station__c,' +
                ' Sales_Rep__c, Sales_Rep__r.Name, Sales_Rep__r.MobilePhone, Sales_Rep__r.FirstName, Sales_Rep__r.LastName, ' +
                ' Merchandising_Order_Days__c, Merchandising_Delivery_Days__c, SSONL_CLSD_STRT_DT__c, SSONL_CLSD_END_DT__c, PAYMT_MTHD_NM__c, ' +
                ' Sales_Route__r.GTMU_RTE_ID__c, Sales_Route__r.LOCL_RTE_ID__c, Sales_Rep__r.Title ' +
                ' FROM Account WHERE LOC_PROD_ID__c = APPLY_USER_LOCATION AND Id IN (SELECT AccountId FROM RetailStore WHERE Id IN APPLY_VISIT_STORE)',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Phone',
                    type: 'string'
                },
                {
                    name: 'Sales_Route__r.GTMU_RTE_ID__c',
                    type: 'string'
                },
                {
                    name: 'Sales_Route__r.LOCL_RTE_ID__c',
                    type: 'string'
                },
                {
                    name: 'Merchandising_Order_Days__c',
                    type: 'string'
                },
                {
                    name: 'Merchandising_Delivery_Days__c',
                    type: 'string'
                },
                {
                    name: 'SSONL_CLSD_STRT_DT__c',
                    type: 'string'
                },
                {
                    name: 'SSONL_CLSD_END_DT__c',
                    type: 'string'
                },
                {
                    name: 'PAYMT_MTHD_NM__c',
                    type: 'string'
                },
                {
                    name: 'Catering__c',
                    type: 'boolean'
                },
                {
                    name: 'Serves_Breakfast__c',
                    type: 'boolean'
                },
                {
                    name: 'Takeout__c',
                    type: 'boolean'
                },
                {
                    name: 'Serves_Lunch__c',
                    type: 'boolean'
                },
                {
                    name: 'Serves_Alcohol__c',
                    type: 'boolean'
                },
                {
                    name: 'Serves_Dinner__c',
                    type: 'boolean'
                },
                {
                    name: 'Gas_Station__c',
                    type: 'boolean'
                },
                {
                    name: 'Sales_Rep__c',
                    type: 'string'
                },
                {
                    name: 'Sales_Rep__r.FirstName',
                    type: 'string'
                },
                {
                    name: 'Sales_Rep__r.LastName',
                    type: 'string'
                },
                {
                    name: 'Sales_Rep__r.Name',
                    type: 'string'
                },
                {
                    name: 'Sales_Rep__r.Title',
                    type: 'string'
                },
                {
                    name: 'Sales_Rep__r.MobilePhone',
                    type: 'string'
                },
                // Operating Hours section
                // {
                //     name: 'OperatingHoursId',
                //     type: 'string'
                // },
                // Delivey & Execution section
                // {
                //     name: 'SSONL_CLSD_STRT_DT__c',
                //     type: 'string'
                // },
                // {
                //     name: 'SSONL_CLSD_END_DT__c',
                //     type: 'string'
                // },
                // {
                //     name: 'PAYMT_MTHD_NM__c',
                //     type: 'string'
                // },
                {
                    name: 'CUST_ID__c',
                    type: 'string'
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_1_NM__c',
                    type: 'string'
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_2_NM__c',
                    type: 'string'
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_3_NM__c',
                    type: 'string'
                }
            ],
            syncDownCB: () => {
                return new Promise((resolve, reject) => {
                    SoupService.retrieveDataFromSoup('Account', {}, ['Id'])
                        .then((res: any) => {
                            if (res.length) {
                                const uniqueAccountIds = Array.from(new Set(res.map((v) => v.Id)))
                                CommonParam.uniqueAccountIds = uniqueAccountIds
                                NonDisplayPromotionService.syncDownNonDisplayPromotionData()
                                resolve(Promise.resolve())
                            } else {
                                resolve(Promise.resolve())
                            }
                        })
                        .catch((err) => {
                            reject(err)
                        })
                })
            }
        },
        {
            name: 'Segment_Hierarchy_Image_Mapping__mdt',
            soupName: 'Segment_Hierarchy_Image_Mapping__mdt',
            lastmodifiedlField: '',
            initQuery:
                'SELECT Id, Channel__c, Segment__c, Sub_Segment__c, Template__c FROM Segment_Hierarchy_Image_Mapping__mdt',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Channel__c',
                    type: 'string'
                },
                {
                    name: 'Segment__c',
                    type: 'string'
                },
                {
                    name: 'Sub_Segment__c',
                    type: 'string'
                },
                {
                    name: 'Template__c',
                    type: 'string'
                }
            ]
        },
        {
            name: 'BreadcrumbsMessage',
            soupName: 'BreadcrumbsMessage',
            initQuery: '',
            fieldList: [
                {
                    name: 'messageTime',
                    type: 'string'
                },
                {
                    name: 'message',
                    type: 'string'
                }
            ]
        },
        {
            name: 'Shipment',
            soupName: 'Shipment',
            initQuery:
                'SELECT Id, CreatedById, Retail_Store__c, Customer_Id__c, Visit__c,' +
                'DeliveredToId, Delivery_Id__c, Employee_Id__c, Order_Id__c, OwnerId, ' +
                'Pallet_Count__c, ExpectedDeliveryDate, ActualDeliveryDate, CreatedDate, TotalItemsQuantity, ' +
                'ShipToName, Description, Status, Total_Certified__c, Total_Delivered__c, Total_Ordered__c, Total_Shipment_Return_Cs__c, Total_Shipment_Return_Un__c FROM Shipment' +
                ' WHERE Retail_Store__c IN APPLY_VISIT_STORE AND ' +
                '((ExpectedDeliveryDate >= LAST_N_DAYS:1:TIME AND ExpectedDeliveryDate <= NEXT_N_DAYS:8:TIME) OR ' +
                '(ActualDeliveryDate >= LAST_N_DAYS:1:TIME AND ActualDeliveryDate <= NEXT_N_DAYS:8:TIME))',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'CreatedById',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Retail_Store__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Customer_Id__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Visit__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'DeliveredToId',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Delivery_Id__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Employee_Id__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Order_Id__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'OwnerId',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Pallet_Count__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'ExpectedDeliveryDate',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'ActualDeliveryDate',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'CreatedDate',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'TotalItemsQuantity',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'ShipToName',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Description',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Status',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Total_Certified__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Total_Delivered__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Total_Ordered__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Total_Shipment_Return_Cs__c',
                    type: 'floating',
                    syncUpCreate: true
                },
                {
                    name: 'Total_Shipment_Return_Un__c',
                    type: 'floating',
                    syncUpCreate: true
                }
            ]
        },
        {
            name: 'ShipmentItem',
            soupName: 'ShipmentItem',
            initQuery:
                'SELECT Id, Shipment.Order_Id__c, Shipment.Status, Description, Certified_Quantity__c, CreatedById, Delivered_Quantity__c, ' +
                'Delivery_Id__c, Ordered_Quantity__c, Pallet_Number__c, Product2Id, Quantity, ShipmentId, Package_Type__c,' +
                ' Product_Name__c FROM ShipmentItem' +
                ' WHERE Shipment.Retail_Store__c IN APPLY_VISIT_STORE AND' +
                '((Shipment.ExpectedDeliveryDate >= LAST_N_DAYS:0:TIME AND Shipment.ExpectedDeliveryDate <= NEXT_N_DAYS:8:TIME) ' +
                'OR (Shipment.ActualDeliveryDate >= LAST_N_DAYS:1:TIME AND Shipment.ActualDeliveryDate <= NEXT_N_DAYS:8:TIME))' +
                "AND Activity_Code__c = 'DEL'",
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Shipment.Order_Id__c',
                    type: 'string'
                },
                {
                    name: 'Shipment.Status',
                    type: 'string'
                },
                {
                    name: 'Description',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Certified_Quantity__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'CreatedById',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Delivered_Quantity__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Delivery_Id__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Ordered_Quantity__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Pallet_Number__c',
                    type: 'number',
                    syncUpCreate: true
                },
                {
                    name: 'Product2Id',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Quantity',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'ShipmentId',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Package_Type__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Product_Name__c',
                    type: 'string',
                    syncUpCreate: true
                }
            ]
        },
        {
            name: 'StoreProduct',
            soupName: 'StoreProduct',
            initQuery:
                'SELECT Id, InStoreLocationId, ProductId, Sub_Brand__c, Packaging__c, Display_Quantity__c FROM StoreProduct' +
                ` WHERE InStoreLocationId IN (${PromotionQuerySuffix('Id')})`,
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'InStoreLocationId',
                    type: 'string'
                },
                {
                    name: 'ProductId',
                    type: 'string'
                },
                {
                    name: 'Sub_Brand__c',
                    type: 'string'
                },
                {
                    name: 'Packaging__c',
                    type: 'string'
                },
                {
                    name: 'Display_Quantity__c',
                    type: 'string'
                }
            ],
            syncUpCreateFields: [
                'Id',
                'InStoreLocationId',
                'ProductId',
                'Sub_Brand__c',
                'Packaging__c',
                'Display_Quantity__c'
            ],
            syncUpCreateQuery: `
                SELECT
                {StoreProduct:Id},
                {StoreProduct:InStoreLocationId},
                {StoreProduct:ProductId},
                {StoreProduct:Sub_Brand__c},
                {StoreProduct:Packaging__c},
                {StoreProduct:Display_Quantity__c}
                FROM {StoreProduct}
            `
        },
        {
            name: 'Breadcrumb_Timestamps__c',
            soupName: 'Breadcrumb_Timestamps__c',
            initQuery:
                'SELECT Id, Customer__c, Geofence_Direction__c, Time__c, User__c, Visit__c, Visit_List__c ' +
                'FROM Breadcrumb_Timestamps__c WHERE User__c = APPLY_CURRENT_USER_ID AND Time__c >= LAST_N_DAYS:1:TIME',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Customer__c',
                    type: 'string'
                },
                {
                    name: 'Geofence_Direction__c',
                    type: 'string'
                },
                {
                    name: 'Time__c',
                    type: 'string'
                },
                {
                    name: 'User__c',
                    type: 'string'
                },
                {
                    name: 'Visit__c',
                    type: 'string'
                },
                {
                    name: 'Visit_List__c',
                    type: 'string'
                }
            ],
            syncUpUpdateFields: [
                'Customer__c',
                'Geofence_Direction__c',
                'Time__c',
                'User__c',
                'Visit__c',
                'Visit_List__c'
            ],
            syncUpUpdateQuery:
                'SELECT {Breadcrumb_Timestamps__c:Customer__c},{Breadcrumb_Timestamps__c:Geofence_Direction__c}, ' +
                '{Breadcrumb_Timestamps__c:Time__c}, {Breadcrumb_Timestamps__c:User__c}, ' +
                '{Breadcrumb_Timestamps__c:Visit__c}, {Breadcrumb_Timestamps__c:Visit_List__c} ' +
                "FROM {Breadcrumb_Timestamps__c} WHERE {Breadcrumb_Timestamps__c:__locally_created__}='1'",
            syncUpCreateFields: [
                'Customer__c',
                'Geofence_Direction__c',
                'Time__c',
                'User__c',
                'Visit__c',
                'Visit_List__c'
            ],
            syncUpCreateQuery:
                'SELECT {Breadcrumb_Timestamps__c:Customer__c},{Breadcrumb_Timestamps__c:Geofence_Direction__c}, ' +
                '{Breadcrumb_Timestamps__c:Time__c}, {Breadcrumb_Timestamps__c:User__c}, ' +
                '{Breadcrumb_Timestamps__c:Visit__c}, {Breadcrumb_Timestamps__c:Visit_List__c} ' +
                "FROM {Breadcrumb_Timestamps__c} WHERE {Breadcrumb_Timestamps__c:__locally_created__}='1'"
        },
        {
            name: 'User_Stats__c',
            soupName: 'User_Stats__c',
            initQuery:
                'SELECT Id, Start_Time__c, Sunday__c, Monday__c, Tuesday__c, Wednesday__c, ' +
                'Thursday__c, Friday__c, Saturday__c, User__c, OwnerId ' +
                " FROM User_Stats__c WHERE USER__c = APPLY_CURRENT_USER_ID AND RecordType.DeveloperName = 'Stats'",
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Start_Time__c',
                    type: 'string'
                },
                {
                    name: 'Sunday__c',
                    type: 'boolean'
                },
                {
                    name: 'Monday__c',
                    type: 'boolean'
                },
                {
                    name: 'Tuesday__c',
                    type: 'boolean'
                },
                {
                    name: 'Wednesday__c',
                    type: 'boolean'
                },
                {
                    name: 'Thursday__c',
                    type: 'boolean'
                },
                {
                    name: 'Friday__c',
                    type: 'boolean'
                },
                {
                    name: 'Saturday__c',
                    type: 'boolean'
                },
                {
                    name: 'User__c',
                    type: 'string'
                }
            ],
            syncUpCreateFields: [
                'Id',
                'Start_Time__c',
                'Sunday__c',
                'Monday__c',
                'Tuesday__c',
                'Wednesday__c',
                'Thursday__c',
                'Friday__c',
                'Saturday__c',
                'User__c'
            ],
            syncUpCreateQuery: `
                SELECT
                {User_Stats__c:Id},
                {User_Stats__c:Start_Time__c},
                {User_Stats__c:Sunday__c},
                {User_Stats__c:Monday__c},
                {User_Stats__c:Tuesday__c},
                {User_Stats__c:Wednesday__c},
                {User_Stats__c:Thursday__c},
                {User_Stats__c:Friday__c},
                {User_Stats__c:Saturday__c},
                {User_Stats__c:User__c},
                {User_Stats__c:_soupEntryId},
                {User_Stats__c:__local__},
                {User_Stats__c:__locally_created__},
                {User_Stats__c:__locally_updated__},
                {User_Stats__c:__locally_deleted__}
                FROM {User_Stats__c}
            `
        },
        {
            name: 'Customer_to_Route__c',
            soupName: 'Customer_to_Route__c',
            initQuery:
                'SELECT Id, Customer__c, CUST_RTE_FREQ_CDE__c, PROD_GRP_NM__c, SLS_MTHD_NM__c, DLVRY_MTHD_NM__c FROM Customer_to_Route__c WHERE Customer__c IN APPLY_CUSTOMER_ID',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Customer__c',
                    type: 'string'
                },
                {
                    name: 'CUST_RTE_FREQ_CDE__c',
                    type: 'string'
                },
                {
                    name: 'PROD_GRP_NM__c',
                    type: 'string'
                },
                {
                    name: 'SLS_MTHD_NM__c',
                    type: 'string'
                },
                {
                    name: 'DLVRY_MTHD_NM__c',
                    type: 'string'
                }
            ]
        },
        {
            name: 'Route_Frequency_Mapping__mdt',
            soupName: 'Route_Frequency_Mapping__mdt',
            lastmodifiedlField: '',
            initQuery: 'SELECT Id, Code__c, Label FROM Route_Frequency_Mapping__mdt',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Code__c',
                    type: 'string'
                },
                {
                    name: 'Label',
                    type: 'string'
                }
            ]
        },
        {
            name: 'PepsiCo_Period_Calendar__mdt',
            soupName: 'PepsiCo_Period_Calendar__mdt',
            lastmodifiedlField: '',
            initQuery: 'SELECT Id, End_Date__c, Sequence__c, Start_Date__c, Year__c FROM PepsiCo_Period_Calendar__mdt',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'End_Date__c',
                    type: 'string'
                },
                {
                    name: 'Sequence__c',
                    type: 'string'
                },
                {
                    name: 'Start_Date__c',
                    type: 'string'
                },
                {
                    name: 'Year__c',
                    type: 'string'
                }
            ]
        },
        {
            name: 'Order',
            soupName: 'Order',
            initQuery:
                'SELECT Id, Total_Ordered_IntCount__c, Total_Certified_IntCount__c, Ordr_Id__c, Dlvry_Rqstd_Dtm__c, RetailStore__c, Pallet_Total_IntCount__c, Total_Return_Cs_IntCount__c, Total_Return_Un_IntCount__c FROM Order ' +
                "WHERE RetailStore__c IN APPLY_VISIT_STORE AND Dlvry_Rqstd_Dtm__c >= LAST_N_DAYS:1:TIME AND Dlvry_Rqstd_Dtm__c <= NEXT_N_DAYS:8:TIME AND Order_ATC_Type__c = 'Normal'",

            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Total_Ordered_IntCount__c',
                    type: 'number'
                },
                {
                    name: 'Total_Certified_IntCount__c',
                    type: 'number'
                },
                {
                    name: 'Ordr_Id__c',
                    type: 'string'
                },
                {
                    name: 'Dlvry_Rqstd_Dtm__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'RetailStore__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Pallet_Total_IntCount__c',
                    type: 'number',
                    syncUpCreate: true
                },
                {
                    name: 'Total_Return_Cs_IntCount__c',
                    type: 'number',
                    skipSyncUp: true
                },
                {
                    name: 'Total_Return_Un_IntCount__c',
                    type: 'number',
                    skipSyncUp: true
                }
            ]
        },
        {
            name: 'OrderItem',
            soupName: 'OrderItem',
            initQuery:
                'SELECT Id, OrderId, Order_Item__c, Order.Ordr_Id__c, Quantity, Certified_Quantity__c, Product2Id, Order.RetailStore__c, Pallet_Number__c, Product2.Package_Type_Name__c, Product2.Name, LastModifiedDate, Item_Type__c, Product2.Sub_Brand__c, Is_Modified__c, Order.Total_Ordered_IntCount__c, Order.Total_Certified_IntCount__c FROM OrderItem ' +
                "WHERE Order.RetailStore__c IN APPLY_VISIT_STORE AND Order.Dlvry_Rqstd_Dtm__c >= LAST_N_DAYS:1:TIME AND Order.Dlvry_Rqstd_Dtm__c <= NEXT_N_DAYS:8:TIME AND ord_lne_actvy_cde__c != 'RET'",
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'OrderId',
                    type: 'string'
                },
                {
                    name: 'Order_Item__c',
                    type: 'string'
                },
                {
                    name: 'Order.Ordr_Id__c',
                    type: 'string'
                },
                {
                    name: 'Quantity',
                    type: 'string'
                },
                {
                    name: 'Certified_Quantity__c',
                    type: 'string'
                },
                {
                    name: 'Order.RetailStore__c',
                    type: 'string'
                },
                {
                    name: 'Product2Id',
                    type: 'string'
                },
                {
                    name: 'Pallet_Number__c',
                    type: 'string'
                },
                {
                    name: 'Product2.Package_Type_Name__c',
                    type: 'string'
                },
                {
                    name: 'Product2.Name',
                    type: 'string'
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Item_Type__c',
                    type: 'string'
                },
                {
                    name: 'Product2.Sub_Brand__c',
                    type: 'string'
                },
                {
                    name: 'Order.Total_Ordered_IntCount__c',
                    type: 'number'
                },
                {
                    name: 'Order.Total_Certified_IntCount__c',
                    type: 'number'
                },
                {
                    name: 'Is_Modified__c',
                    type: 'boolean'
                }
            ]
        }
    ]
}

export default MerchandiserConfig

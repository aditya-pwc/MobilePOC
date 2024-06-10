import moment from 'moment'
import BaseInstance from '../../../common/BaseInstance'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { CommonParam } from '../../../common/CommonParam'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { VisitList } from '../../interface/VisitListModel'
import { getIdClause } from '../../../common/utils/CommonUtils'
import VisitListQueries from '../../queries/VisitListQueries'
import { todayDateWithTimeZone } from '../../../common/utils/TimeZoneUtils'
import { VisitListStatus } from '../../enum/VisitListStatus'
import { DropDownType, OrderLineActivityCde, VisitRecordTypes } from '../../enum/Common'
import { t } from '../../../common/i18n/t'
import { VisitModel } from '../../interface/Visit'
import { VisitStatus } from '../../enum/VisitType'
import { LocalVisitListModal } from '../../interface/Visit_List__c'
import _ from 'lodash'

class VisitData {
    static async getUserVLData(inputDate: string) {
        try {
            const fields = BaseInstance.sfSoupEngine.getSoupFieldList('Visit_List__c')
            fields.push('_soupEntryId')
            const userVLs: Array<Partial<VisitList>> = await BaseInstance.sfSoupEngine
                .dynamicRetrieve('Visit_List__c')
                .select(fields)
                .where([
                    {
                        leftTable: 'Visit_List__c',
                        leftField: 'User__c',
                        operator: '=',
                        rightField: `'${CommonParam.userId}'`
                    },
                    {
                        leftTable: 'Visit_List__c',
                        leftField: 'Visit_Date__c',
                        operator: '=',
                        rightField: `'${inputDate}'`
                    },
                    {
                        leftTable: 'Visit_List__c',
                        leftField: 'Visit_List_Subtype__c',
                        operator: '=',
                        rightField: "'User Visit List'"
                    }
                ])
                .getData(false)
            return userVLs
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getUserVlData',
                `Fetch visits list failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    private static workOrderQuery(): string {
        const date = moment().format(TIME_FORMAT.Y_MM_DD)
        return `
        SELECT COUNT({Task:Id}) FROM {Task}
            WHERE {Visit:PlaceId} = {Task:WhatId}
            AND (
                (date({Visit:Planned_Date__c}) <= date('${date}') AND date({Task:ActivityDate}) <= date({Visit:Planned_Date__c}))
                OR 
                (date({Visit:Planned_Date__c}) > date('${date}') AND date({Task:ActivityDate}) = date({Visit:Planned_Date__c}))
            )
            AND (
                {Task:Display_Id_Instore__r.End_Date__c} IS NULL
                OR {Task:Display_Id_Instore__r.End_Date__c} >= date('now', '${CommonParam.userTimeZoneOffset}', 'start of day')
            )
            AND {Task:Status} = 'Open'
            AND {Task:RecordType.Name} = 'Work Order'
            GROUP BY {Task:WhatId}
        `
    }

    private static completeWorkOrderInOneDayQuery(): string {
        return `
        SELECT COUNT({Task:Id}) FROM {Task}
            WHERE {Visit:PlaceId} = {Task:WhatId}
            AND {Task:Status} = 'Complete'
            AND {Visit:Planned_Date__c} = date(replace({Task:Wo_Cmplt_Dte__c}, '+0000',''), '${CommonParam.userTimeZoneOffset}')
            AND {Task:RecordType.Name} = 'Work Order'
            GROUP BY {Task:WhatId}
        `
    }

    private static orderSumQuery(property: string, hasFilter?: boolean) {
        const shipmentTableQ = hasFilter
            ? ' LEFT JOIN {Shipment} ON {Shipment:Order_Id__c} = {Order:Order_Unique_Id__c}'
            : ''
        const shipmentFiled = hasFilter ? ' AND {Shipment:Id} IS NOT NULL' : ''
        return `
        SELECT COALESCE(SUM({Order:${property}}), 0) 
        FROM {Order}
        ${shipmentTableQ}
        WHERE {RetailStore:Id} = {Order:RetailStore__c}
        AND date(REPLACE({Order:Dlvry_Rqstd_Dtm__c}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') = {Visit:Planned_Date__c}
        ${shipmentFiled} 
        `
    }

    private static getSoldQty() {
        return `
            SELECT COALESCE(SUM({OrderItem:Quantity}), 0) 
            FROM {OrderItem}
            LEFT JOIN {Order}
            ON {Order:Id} = {OrderItem:OrderId}
            WHERE (Vis.{Visit:Id} = {Order:Visit__c} OR Vis.{Visit:_soupEntryId} = {Order:vRefId})
            AND ({OrderItem:ord_lne_actvy_cde__c} IS NULL OR {OrderItem:ord_lne_actvy_cde__c} != '${OrderLineActivityCde.RETURN}')`
    }

    private static getReturnQty(field: string) {
        return `
            SELECT COALESCE(SUM({OrderItem:${field}}), 0) 
            FROM {OrderItem}
            LEFT JOIN {Order}
            ON {Order:Id} = {OrderItem:OrderId}
            WHERE {Visit:Id} = {Order:Visit__c}
            AND {OrderItem:ord_lne_actvy_cde__c} = '${OrderLineActivityCde.RETURN}'`
    }

    private static offlineOrderForEachVisitQuery() {
        return `
            SELECT COUNT ({CartItem:OrderCartIdentifier}) FROM {CartItem}
                WHERE {CartItem:Quantity} != '0'
                AND ({CartItem:OrderCartIdentifier} = Vis.{Visit:Visit_Legacy_ID__c}
                OR {CartItem:OrderCartIdentifier} = Vis.{Visit:Order_Cart_Identifier__c})
                GROUP BY {CartItem:OrderCartIdentifier}
            `
    }

    private static onlineOrderForEachVisitQuery() {
        // Reminder: May need to change after dynamic retrieve is fixed
        return `
            SELECT COUNT ({Order:_soupEntryId}) FROM {Order}
                WHERE {Order:Visit__c} = Vis.{Visit:Id}
                OR {Order:vRefId} = Vis.{Visit:_soupEntryId}
            `
    }

    private static onGoingOrderNumForVisitQuery() {
        return `
        SELECT COUNT(DISTINCT {Order:_soupEntryId}) FROM {Order}
            LEFT JOIN {OrderItem} 
            ON ({OrderItem:OrderId} = {Order:Id} OR
            {OrderItem:oRefId} = {Order:_soupEntryId})
            LEFT JOIN {Visit} ON {Visit:Id} = {Order:Visit__c}
            WHERE {Order:Visit__c} = Vis.{Visit:Id}
            AND {OrderItem:ord_lne_actvy_cde__c} = 'DEL'
        `
    }

    private static myOrderForEachVisitQuery() {
        return `
            SELECT COUNT ({Order:_soupEntryId}) FROM {Order}
                WHERE ({Order:Visit__c} = Vis.{Visit:Id}
                OR {Order:vRefId} = Vis.{Visit:_soupEntryId}) 
                AND {Order:Created_By_GPID__c} = '${CommonParam.GPID__c}'
        `
    }

    static async fetchVisitRelatedDataByDate(inputDate: string) {
        try {
            const visits: Partial<VisitList>[] = await BaseInstance.sfSoupEngine
                .dynamicRetrieve('Visit_List__c')
                .select([
                    'Id',
                    'Name',
                    'Start_Date_Time__c',
                    'End_Date_Time__c',
                    'Visit_Date__c',
                    'Status__c',
                    'Visit_List_Subtype__c',
                    '_soupEntryId'
                ])
                .subQuery([
                    {
                        query: this.workOrderQuery(),
                        name: 'workOrders'
                    },
                    {
                        query: this.orderSumQuery('Pallet_Count__c'),
                        name: 'schPlt'
                    },
                    {
                        query: this.getSoldQty(),
                        name: 'soldQty'
                    },
                    {
                        query: this.getReturnQty('Whole_Cases_Quantity__c'),
                        name: 'returnCs'
                    },
                    {
                        query: this.getReturnQty('Remainder_Unit_Quantity__c'),
                        name: 'returnUn'
                    },
                    {
                        query: this.completeWorkOrderInOneDayQuery(),
                        name: 'completedWorkOrders'
                    },
                    {
                        query: this.onlineOrderForEachVisitQuery(),
                        name: 'onlineOrders'
                    },
                    {
                        query: this.offlineOrderForEachVisitQuery(),
                        name: 'offlineOrders'
                    },
                    {
                        query: this.myOrderForEachVisitQuery(),
                        name: 'myOrders'
                    },
                    {
                        query: this.onGoingOrderNumForVisitQuery(),
                        name: 'onGoingOrderNum'
                    }
                ])
                .join({
                    table: 'Visit',
                    options: {
                        mainField: 'Visit_List__c',
                        targetField: 'Id',
                        targetTable: 'Visit_List__c',
                        fieldList: [
                            'Id',
                            'Cases_Goal_Quantity__c',
                            'ActualVisitStartTime',
                            'ActualVisitEndTime',
                            'Scheduled_Case_Quantity__c',
                            'PlaceId',
                            'Status__c',
                            'Visit_List__c',
                            'Ad_Hoc__c',
                            'vlRefId',
                            'userVlRefId',
                            '_soupEntryId',
                            'RecordType.DeveloperName',
                            'User__c',
                            'User__r.Name',
                            'User_Visit_List__c',
                            'RTE_ID__c',
                            'RTE_ID__r.GTMU_RTE_ID__c',
                            'Order_Cart_Identifier__c',
                            'Visit_Legacy_ID__c',
                            'Delivery_Date__c',
                            'Delivery_Date2__c',
                            'Delivery_Date3__c',
                            'Next_Delivery_Date__c',
                            'Next_Delivery_Date2__c',
                            'Next_Delivery_Date3__c',
                            'Customer_to_Route__r.DELY_MTHD_CDE__c',
                            'ASAS_Compliant__c'
                        ]
                    },
                    additionalConds: [
                        {
                            operator: '=',
                            type: 'OR',
                            mainField: 'vlRefId',
                            targetField: '_soupEntryId'
                        },
                        {
                            operator: '=',
                            type: 'OR',
                            mainField: 'userVlRefId',
                            targetField: '_soupEntryId'
                        },
                        {
                            operator: '=',
                            type: 'OR',
                            mainField: 'User_Visit_List__c',
                            targetField: 'Id'
                        }
                    ],
                    type: 'LEFT',
                    alias: 'Vis'
                })
                .join({
                    table: 'RetailStore',
                    options: {
                        mainField: 'Id',
                        targetField: 'PlaceId',
                        targetTable: 'Visit',
                        fieldList: [
                            'City',
                            'Name',
                            'State',
                            'StateCode',
                            'PostalCode',
                            'Id',
                            'Street',
                            'Account.CUST_UNIQ_ID_VAL__c',
                            'AccountId',
                            'Account.Phone',
                            'Latitude',
                            'Longitude',
                            'Customer_Longitude__c',
                            'Customer_Latitude__c',
                            'Geofence__c',
                            'Account.IsOTSCustomer__c',
                            'Account.CDA_Medal__c',
                            'Account.Is_Customer_PO_Number_Required__c',
                            'Account.Single_Unit_Return__c'
                        ]
                    },
                    type: 'LEFT',
                    alias: 'RS'
                })
                .join({
                    table: 'RecordType',
                    options: {
                        mainField: 'Id',
                        targetField: 'RecordTypeId',
                        targetTable: 'Visit',
                        fieldList: ['Id', 'DeveloperName']
                    },
                    type: 'LEFT',
                    alias: 'RT'
                })
                .where([
                    {
                        leftTable: 'RecordType',
                        leftField: 'DeveloperName',
                        operator: '=',
                        rightField: "'Sales'"
                    },
                    {
                        leftTable: 'Visit_List__c',
                        leftField: 'Visit_Date__c',
                        operator: '=',
                        rightField: `'${inputDate}'`
                    },
                    {
                        leftTable: 'Visit_List__c',
                        leftField: 'Visit_List_Subtype__c',
                        operator: 'IS NOT NULL',
                        rightField: ''
                    },
                    {
                        leftTable: 'Visit',
                        leftField: 'PlaceId',
                        operator: 'IS NOT NULL',
                        rightField: ''
                    },
                    {
                        leftTable: 'Visit',
                        leftField: 'Status__c',
                        operator: '!=',
                        rightField: "'Pre-Processed'"
                    },
                    {
                        leftTable: 'Visit',
                        leftField: 'Status__c',
                        operator: '!=',
                        rightField: "'Failed'"
                    },
                    {
                        leftTable: 'Visit',
                        leftField: 'Status__c',
                        operator: '!=',
                        rightField: "'Removed'"
                    },
                    {
                        leftTable: 'RetailStore',
                        leftField: 'Id',
                        operator: 'IS NOT NULL',
                        rightField: ''
                    }
                ])
                .getData(false)
            return visits
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: fetchVisitRelatedDataByDate',
                `Fetch visits failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    static async getOneDayOrderItemData(visitIds: string[]) {
        try {
            const pushedOrder: any = await BaseInstance.sfSoupEngine.retrieve(
                'Order',
                [
                    'Id',
                    'Dlvry_Rqstd_Dtm__c',
                    'Cust_Po_Id__c',
                    'Account.Is_Customer_PO_Number_Required__c',
                    'EffectiveDate',
                    'Order_Notes__c',
                    'OrderNumber',
                    'Created_By_GPID__c',
                    'Transaction_Time__c',
                    'OrderItemId',
                    'ord_lne_actvy_cde__c',
                    'visitId'
                ],
                `
            SELECT
                DISTINCT {Order:Id},
                {Order:Dlvry_Rqstd_Dtm__c},
                {Order:Cust_Po_Id__c},
                {Order:Account.Is_Customer_PO_Number_Required__c},
                {Order:EffectiveDate},
                {Order:Order_Notes__c},
                {Order:OrderNumber},
                {Order:Created_By_GPID__c},
                {Order:Transaction_Time__c},
                {OrderItem:Id},
                {OrderItem:ord_lne_actvy_cde__c},
                {Visit:Id}
            FROM {Order}
            LEFT JOIN {OrderItem} ON {OrderItem:OrderId} = {Order:Id} 
            AND {OrderItem:ord_lne_actvy_cde__c} = 'DEL'
            LEFT JOIN {Visit} ON {Visit:Id} = {Order:Visit__c}
            WHERE {Order:Visit__c} IN (${getIdClause(visitIds)})
            GROUP BY {Order:Id}
        `,
                [],
                {},
                false,
                false
            )
            return pushedOrder
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getOneDayOrderItemData',
                `Fetch visits order and orderItem failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    static async fetchEventDataByDay(start: string, end: string, isPast = false) {
        const employeeQuery = [
            'Id',
            'VLSoupId',
            'VisitList',
            'VlStatus',
            'StartTime',
            'EndTime',
            'VisitDate',
            'ActivityDate',
            'Parent_Event__c',
            'Location',
            'MeetingName',
            'Planned_Duration__c',
            'VirtualLocation__c',
            'ActualStartTime',
            'ActualEndTime',
            'Attendees_Count__c',
            'Subject',
            'Finished',
            'SubType',
            'OwnerId',
            'StartDateTime',
            'EndDateTime',
            'Manager_Scheduled__c',
            'Description',
            '_soupEntryId',
            ''
        ]

        const timeQuery = isPast ? '' : 'AND {Event:Actual_End_Time__c} IS NOT NULL'

        const query = ` SELECT
                {Event:Id} AS Id,
                {Visit_List__c:_soupEntryId},
                {Event:Visit_List__c} AS VisitList,
                {Visit_List__c:Status__c} AS VlStatus,
                {Visit_List__c:Start_Date_Time__c},
                {Visit_List__c:End_Date_Time__c},
                date(REPLACE({Event:StartDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') AS VisitDate,
                {Event:ActivityDate},
                {Event:Parent_Event__c},
                {Event:Location},
                {Event:MeetingName__c},
                {Event:Planned_Duration__c},
                {Event:VirtualLocation__c},
                {Event:Actual_Start_Time__c},
                {Event:Actual_End_Time__c},
                {Event:Attendees_Count__c},
                {Event:Subject},
                {Event:Actual_End_Time__c} IS NULL AS Finished,
                {Event:SubType__c} AS SubType,
                {Event:OwnerId},
                {Event:StartDateTime},
                {Event:EndDateTime},
                {Event:Manager_Scheduled__c},
                {Event:Description},
                {Event:_soupEntryId}
                FROM {Visit_List__c}
                LEFT JOIN {Event} ON {Visit_List__c:Id} = {Event:Visit_List__c}
                WHERE {Event:OwnerId}="${CommonParam.userId}"  
                AND date(REPLACE({Event:StartDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') >= date("${start}", 'start of day') 
                AND date(REPLACE({Event:EndDateTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') < date("${end}", 'start of day', '+1 day')
                ${timeQuery}
                ORDER BY VisitList, Finished NULLS LAST, {Event:Actual_Start_Time__c} NULLS LAST, {Event:StartDateTime} DESC
            `
        const events = await BaseInstance.sfSoupEngine.retrieve('Event', employeeQuery, query, [], {}, false, false)
        return events
    }

    static async getCurrentVisitRelatedVisitList(visitListId?: string, vlRefId?: string) {
        let query = ''
        if (visitListId) {
            query = `WHERE {Visit_List__c:Id}='${visitListId}'`
        } else {
            query = `WHERE {Visit_List__c:_soupEntryId}='${vlRefId}'`
        }
        const vls = await BaseInstance.sfSoupEngine.retrieve(
            'Visit_List__c',
            ['Visit_Date__c'],
            undefined,
            [query],
            {},
            false,
            false
        )
        return vls
    }

    static async upsertUserVisitListData(vlRecordTypeId: string, userVlsCount: number, todayDate: any) {
        try {
            const safeFirstName = `${CommonParam.userInfo.FirstName}`.substring(0, 27)
            const safeLastName = `${CommonParam.userInfo.LastName}`.substring(0, 27)
            const safeGPID = `${CommonParam.GPID__c}`.substring(0, 80)
            const visitListSequence = userVlsCount + 1
            const newVL = {
                Name: `${todayDate} - ${safeFirstName} ${safeLastName} - ${visitListSequence}`,
                Visit_List_Legacy_ID__c: `${safeGPID}_${todayDate}_${visitListSequence}`,
                Status__c: VisitListQueries.CreateVisitListQuery.CREATE_VISIT_LIST_STATUS,
                User__c: BaseInstance.userAccount.userId,
                Visit_Date__c: todayDate,
                RecordTypeId: vlRecordTypeId,
                Visit_List_Subtype__c: 'User Visit List'
            }
            return await BaseInstance.sfSoupEngine.upsert('Visit_List__c', [newVL], true, false)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: upsertVisitListData',
                `UpsertVisitListData failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    static async getCurRouteData(retailStoreFromRoutes: string) {
        try {
            const curRoute: any = await BaseInstance.sfSoupEngine.retrieve('Customer_to_Route__c', [], undefined, [
                `WHERE {Customer_to_Route__c:Customer__c} IN (${retailStoreFromRoutes}) AND {Customer_to_Route__c:Route__c} = '${CommonParam.userRouteId}'`
            ])
            return curRoute
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getCurRouteData',
                `GetCurRouteData failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    static async getVisitListIdData(todayDate: string) {
        try {
            const visitListId: any = await BaseInstance.sfSoupEngine.retrieve(
                'Visit_List__c',
                ['Id', 'Visit_Date__c', 'Status__c'],
                '',
                [
                    `WHERE {Visit_List__c:Visit_Date__c} = '${todayDate}'` +
                        " AND {Visit_List__c:Visit_List_Subtype__c} = 'User Visit List'" +
                        ' ORDER BY {Visit_List__c:Status__c}'
                ],
                {},
                false,
                false
            )
            return visitListId
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getVisitListIdData',
                `GetCurRouteData failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async getVisitListBySoupEntryId(vlSoupEntryId: string) {
        try {
            const vls = await BaseInstance.sfSoupEngine.retrieve('Visit_List__c', [], '', [
                `WHERE {Visit_List__c:_soupEntryId} = ${vlSoupEntryId}`
            ])
            return vls
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getVisitListBySoupEntryId',
                `Fetch visits list failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async getAllVisitList(vlSoupQuery: string) {
        try {
            const vls = await BaseInstance.sfSoupEngine.retrieve('Visit_List__c', ['Id'], '', [vlSoupQuery], {})
            return vls
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getAllVisitList',
                `Fetch get all visits list failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async getVisitsWithOrderInProgressList(time: string) {
        const visits = await BaseInstance.sfSoupEngine
            .dynamicRetrieve('Visit_List__c')
            .select(['Id', 'Visit_Date__c', 'Visit_List_Subtype__c'])
            .join({
                table: 'Visit',
                options: {
                    mainField: 'Visit_List__c',
                    targetField: 'Id',
                    targetTable: 'Visit_List__c',
                    fieldList: [
                        '_soupEntryId',
                        'PlaceId',
                        'Status__c',
                        'Id',
                        'Order_Cart_Identifier__c',
                        'Visit_Legacy_ID__c'
                    ]
                },
                additionalConds: [
                    {
                        operator: '=',
                        type: 'OR',
                        mainField: 'vlRefId',
                        targetField: '_soupEntryId'
                    },
                    {
                        operator: '=',
                        type: 'OR',
                        mainField: 'userVlRefId',
                        targetField: '_soupEntryId'
                    },
                    {
                        operator: '=',
                        type: 'OR',
                        mainField: 'User_Visit_List__c',
                        targetField: 'Id'
                    }
                ],
                type: 'LEFT',
                alias: 'Vis'
            })
            .join({
                table: 'RetailStore',
                options: {
                    mainField: 'Id',
                    targetField: 'PlaceId',
                    targetTable: 'Visit',
                    fieldList: ['Name', 'Id']
                },
                type: 'LEFT',
                alias: 'RS'
            })
            .join({
                table: 'CartItem',
                options: {
                    mainField: 'OrderCartIdentifier',
                    targetField: 'Order_Cart_Identifier__c',
                    targetTable: 'Visit',
                    fieldList: ['_soupEntryId', 'Quantity']
                },
                additionalConds: [
                    {
                        operator: '=',
                        type: 'OR',
                        mainField: 'OrderCartIdentifier',
                        targetField: 'Visit_Legacy_ID__c',
                        targetTable: 'Visit'
                    }
                ],
                type: 'LEFT',
                alias: 'CI'
            })
            .where([
                {
                    leftTable: 'Visit_List__c',
                    leftField: 'Visit_Date__c',
                    operator: '=',
                    rightField: `'${time}'`
                },
                {
                    leftTable: 'Visit',
                    leftField: 'PlaceId',
                    operator: 'IS NOT NULL',
                    rightField: ''
                },
                {
                    leftTable: 'Visit',
                    leftField: 'Status__c',
                    operator: '!=',
                    rightField: "'Removed'"
                },
                {
                    leftTable: 'RetailStore',
                    leftField: 'Id',
                    operator: 'IS NOT NULL',
                    rightField: ''
                }
            ])
            .getData(false)
        return visits
    }

    public static async getVLDataWithIdIsNull() {
        try {
            const vls = await BaseInstance.sfSoupEngine.retrieve(
                'Visit_List__c',
                [
                    'Id',
                    'Name',
                    'Status__c',
                    'User__c',
                    'Visit_Date__c',
                    'Route_Sales_Geo__c',
                    'RecordTypeId',
                    'Start_Date_Time__c',
                    'Location_Id__c',
                    'Start_Date__c',
                    'End_Date__c',
                    'End_Date_Time__c',
                    'Start_Location__Latitude__s',
                    'Start_Location__Longitude__s',
                    'End_Location__Latitude__s',
                    'End_Location__Longitude__s',
                    'Visit_List_Subtype__c',
                    'Visit_List_Legacy_ID__c'
                ],
                '',
                ["WHERE {Visit_List__c:Id} IS NULL OR {Visit_List__c:__locally_updated__}='1'"],
                {},
                false,
                false
            )
            return vls
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getVLDataWithIdIsNull',
                `Fetch visit list data failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async getVisitDataWithIdIsNull() {
        try {
            const visitData = await BaseInstance.sfSoupEngine.retrieve(
                'Visit',
                [
                    'Id',
                    'RecordTypeId',
                    'PlaceId',
                    'Planned_Date__c',
                    'Status__c',
                    'Ad_Hoc__c',
                    'User__c',
                    'VisitorId',
                    'RTE_ID__c',
                    'Visit_List__c',
                    'vlRefId',
                    'userVlRefId',
                    'ActualVisitStartTime',
                    'Check_In_Location__Latitude__s',
                    'Check_In_Location__Longitude__s',
                    'Check_In_Location_Flag__c',
                    'User_Visit_List__c',
                    'ActualVisitEndTime',
                    'Check_Out_Location__Latitude__s',
                    'Check_Out_Location__Longitude__s',
                    'Check_Out_Location_Flag__c',
                    'Order_Cart_Identifier__c',
                    'PlannedVisitStartTime',
                    'Retail_Store__c',
                    'Customer_to_Route__c',
                    'ASAS_Compliant__c'
                ],
                '',
                ["WHERE {Visit:Id} IS NULL OR {Visit:__locally_updated__}='1'"],
                {},
                false,
                false
            )
            return visitData
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getVisitDataWithIdIsNull',
                `Fetch visit data failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async getVLIdsWithVIdOrUVLIdIsNull() {
        try {
            const noIdVisRefVLs = await BaseInstance.sfSoupEngine.retrieve(
                'Visit_List__c',
                ['Id'],
                '',
                [
                    'WHERE {Visit_List__c:_soupEntryId} IN ' +
                        '(SELECT {Visit:vlRefId} FROM {Visit} WHERE {Visit:Id} IS NULL)' +
                        'OR  {Visit_List__c:_soupEntryId} IN ' +
                        '(SELECT {Visit:userVlRefId} FROM {Visit} WHERE {Visit:Id} IS NULL OR {Visit:User_Visit_List__c} IS NULL)'
                ],
                {},
                false,
                false
            )
            return noIdVisRefVLs
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getVLIdsWithVIdOrUVLIdIsNull',
                `Fetch visit list ids failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async retrieveVisitBySoupEntryId(soupEntryId: string) {
        try {
            const query = `WHERE {Visit:_soupEntryId}=${soupEntryId}`
            const visits = await BaseInstance.sfSoupEngine.retrieve(
                'Visit',
                ['Status__c', 'ActualVisitStartTime', 'ActualVisitEndTime', 'User__c', 'Id', '_soupEntryId'],
                '',
                [query],
                {},
                false,
                false
            )
            return visits
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: retrieveVisitBySoupEntryId',
                `Fetch visits failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async getInProgressVisitList() {
        try {
            const query = `WHERE {Visit_List__c:User__c}='${CommonParam.userId}'
                AND {Visit_List__c:Visit_Date__c}='${todayDateWithTimeZone(true)}'
                AND {Visit_List__c:Status__c} IN ('${VisitListStatus.IN_PROGRESS}','${VisitListStatus.NOT_STARTED}')
                AND {Visit_List__c:Visit_List_Subtype__c}='User Visit List'`
            const vls = await BaseInstance.sfSoupEngine.retrieve(
                'Visit_List__c',
                ['Id', '_soupEntryId'],
                undefined,
                [query],
                {},
                false,
                false
            )
            return vls
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getInProgressVisitList',
                `Fetch in progress visit list failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async retrieveOriginalVisit(soupEntryId: string) {
        try {
            const visits = await BaseInstance.sfSoupEngine.retrieve(
                'Visit',
                [],
                undefined,
                [`WHERE {Visit:_soupEntryId}='${soupEntryId}'`],
                {},
                false,
                false
            )
            return visits
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: retrieveOriginalVisit',
                `Fetch visits failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async updateVisitIntoSoup(visit: any) {
        try {
            await BaseInstance.sfSoupEngine.upsert('Visit', [visit], true, false)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: updateVisitIntoSoup',
                `upsert visit into soup failed: ${ErrorUtils.error2String(err)}`
            )
        }
    }

    public static async fetchRetailStoreData(storeId: string, dropDownRef: any) {
        if (!storeId) {
            return []
        }
        try {
            const res = await BaseInstance.sfSoupEngine
                .dynamicRetrieve('RetailStore')
                .select([
                    'City',
                    'Name',
                    'State',
                    'PostalCode',
                    'Id',
                    'Street',
                    'Account.CUST_UNIQ_ID_VAL__c',
                    'AccountId',
                    'Account.Phone',
                    'Account.CUST_GEOFNC__c',
                    'StateCode',
                    'Customer_Longitude__c',
                    'Customer_Latitude__c',
                    'Account.IsOTSCustomer__c',
                    'Account.CDA_Medal__c',
                    'Account.Pz_Id__c',
                    'Account.BUSN_SGMNTTN_LVL_1_CDV__c'
                ])
                .where([
                    {
                        leftTable: 'RetailStore',
                        leftField: 'Id',
                        operator: '=',
                        rightField: `'${storeId}'`
                    }
                ])
                .getData(false)
            if (res && res.length > 0) {
                return res
            }
            return []
        } catch (err) {
            dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_VISIT_DETAIL_ERROR, err)
        }
    }

    static getAllSalesVisitsToday() {
        return BaseInstance.sfSoupEngine.retrieve('Visit', [], '', [
            `
            WHERE  {Visit:Status__c} NOT IN ('Pre-Processed', 'Removed', 'Failed')
            AND {Visit:RecordType.DeveloperName} = '${VisitRecordTypes.SALES}'
            AND {Visit:Planned_Date__c} = '${todayDateWithTimeZone(true)}'
        `
        ]) as unknown as Promise<VisitModel[]>
    }

    public static async updateRemovedVisitIntoSoup(soupEntryId: string) {
        try {
            return await BaseInstance.sfSoupEngine.upsert(
                'Visit',
                [{ _soupEntryId: soupEntryId, Status__c: VisitStatus.REMOVED }],
                true,
                false,
                true
            )
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: updateRemovedVisitIntoSoup',
                `upsert removed visit into soup failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async updateVisitListIntoSoup(record: any) {
        try {
            return await BaseInstance.sfSoupEngine.upsert('Visit_List__c', [record], true, false, true)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: updateVisitListIntoSoup',
                `upsert visit list failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    static async getCurrentUserVisits(inputDate: string) {
        try {
            return BaseInstance.sfSoupEngine
                .dynamicRetrieve('Visit_List__c')
                .select(['Visit_List_Subtype__c'])
                .join({
                    table: 'Visit',
                    options: {
                        mainField: 'Visit_List__c',
                        targetField: 'Id',
                        targetTable: 'Visit_List__c',
                        fieldList: ['Id', 'Status__c']
                    },
                    additionalConds: [
                        {
                            operator: '=',
                            type: 'OR',
                            mainField: 'vlRefId',
                            targetField: '_soupEntryId'
                        },
                        {
                            operator: '=',
                            type: 'OR',
                            mainField: 'userVlRefId',
                            targetField: '_soupEntryId'
                        },
                        {
                            operator: '=',
                            type: 'OR',
                            mainField: 'User_Visit_List__c',
                            targetField: 'Id'
                        }
                    ],
                    type: 'LEFT'
                })
                .where([
                    {
                        leftTable: 'Visit_List__c',
                        leftField: 'Visit_Date__c',
                        operator: '=',
                        rightField: `'${inputDate}'`
                    },
                    {
                        leftTable: 'Visit',
                        leftField: 'PlaceId',
                        operator: 'IS NOT NULL',
                        rightField: ''
                    },
                    {
                        leftTable: 'Visit',
                        leftField: 'Status__c',
                        operator: '!=',
                        rightField: "'Removed'"
                    },
                    {
                        leftTable: 'Visit_List__c',
                        leftField: 'Visit_List_Subtype__c',
                        operator: '=',
                        rightField: "'User Visit List'"
                    },
                    {
                        leftTable: 'Visit_List__c',
                        leftField: 'User__c',
                        operator: '=',
                        rightField: `'${CommonParam.userId}'`
                    }
                ])
                .getData(false)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getCurrentUserVisits',
                `get current user visits failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    static async getRouteInfoVisitData(selectedDate: string, statsId: string) {
        try {
            return await BaseInstance.sfSoupEngine.retrieve(
                'Visit',
                [
                    'Id',
                    'Status__c',
                    'ActualVisitEndTime',
                    'Planned_Date__c',
                    'AdHoc',
                    'RecordType.Name',
                    'OrderCount',
                    'City',
                    'StoreName',
                    'State',
                    'StateCode',
                    'PostalCode',
                    'RetailStoreId',
                    'Street',
                    'Account.CUST_UNIQ_ID_VAL__c',
                    'AccountId',
                    'Account.Phone',
                    'Latitude',
                    'Longitude',
                    'Customer_Longitude__c',
                    'Customer_Latitude__c',
                    'Geofence__c',
                    'Account.IsOTSCustomer__c',
                    'Account.CDA_Medal__c',
                    'Account.Is_Customer_PO_Number_Required__c',
                    'UserId',
                    'UserName',
                    'LastName',
                    'FirstName',
                    'UserStatsId'
                ],
                `
        SELECT
     {Visit:Id},
     {Visit:Status__c},
     {Visit:ActualVisitEndTime},
     {Visit:Planned_Date__c},
     {Visit:Ad_Hoc__c},
     {Visit:RecordType.Name},
     (SELECT COUNT(*) FROM {Order} WHERE {Visit:Id} = {Order:Visit__c} AND {Order:Off_Schedule__c} = true) AS OrderCount ,
     {RetailStore:City},
     {RetailStore:Name},
     {RetailStore:State},
     {RetailStore:StateCode},
     {RetailStore:PostalCode},
     {RetailStore:Id},
     {RetailStore:Street},
     {RetailStore:Account.CUST_UNIQ_ID_VAL__c},
     {RetailStore:AccountId},
     {RetailStore:Account.Phone},
     {RetailStore:Latitude},
     {RetailStore:Longitude},
     {RetailStore:Customer_Longitude__c},
     {RetailStore:Customer_Latitude__c},
     {RetailStore:Geofence__c},
     {RetailStore:Account.IsOTSCustomer__c},
     {RetailStore:Account.CDA_Medal__c},
     {RetailStore:Account.Is_Customer_PO_Number_Required__c},
     {User:Id},
     {User:Name},
     {User:FirstName},
     {User:LastName},
     {User_Stats__c:Id}
     FROM {Visit}
     LEFT JOIN {RetailStore} ON  {Visit:PlaceId} = {RetailStore:Id}
     LEFT JOIN {User} ON {User:Id} = {Visit:User__c}
     LEFT JOIN {User_Stats__c} ON ({User_Stats__c:User__c} = {User:Id} AND {User_Stats__c:RecordTypeId} = '${statsId}') 
     WHERE 
     {Visit:RecordType.Name} IN ('Delivery', 'Merchandising',  'Sales') AND
        ((date(REPLACE({Visit:ActualVisitStartTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') >= date("${selectedDate}", 'start of day') AND 
        date(REPLACE({Visit:ActualVisitStartTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') < date("${selectedDate}", 'start of day', '+1 day')) OR 
        (date({Visit:Planned_Date__c}) = date('${selectedDate}') AND 
        ({Visit:ActualVisitEndTime} IS NULL OR 
            (date(REPLACE({Visit:ActualVisitEndTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') >= date("${selectedDate}", 'start of day') AND 
        date(REPLACE({Visit:ActualVisitEndTime}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') < date("${selectedDate}", 'start of day', '+1 day'))
        ))) AND 
        ({Visit:Status__c}='${VisitStatus.PUBLISHED}' OR {Visit:Status__c}='${VisitStatus.IN_PROGRESS}' OR {Visit:Status__c}='${VisitStatus.COMPLETE}')AND 
        {RetailStore:AccountId} IN 
        (SELECT {Customer_to_Route__c:Customer__c} 
           FROM {Customer_to_Route__c} 
           WHERE 
           {Customer_to_Route__c:Route__c}='${CommonParam.userRouteId}' AND 
           {Customer_to_Route__c:ACTV_FLG__c} IS TRUE AND 
           {Customer_to_Route__c:RecordType.Name} = 'CTR' AND
           {Customer_to_Route__c:Customer__c} IS NOT NULL
           ) AND 
           {RetailStore:Account.IS_ACTIVE__c} IS TRUE
       `
            )
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getRouteInfoVisitData',
                `get route info visit data failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async getCurrentVisitByVisitId(visitId: string) {
        try {
            return await BaseInstance.sfSoupEngine
                .dynamicRetrieve('Visit')
                .select()
                .where([
                    {
                        leftTable: 'Visit',
                        leftField: 'Id',
                        operator: '=',
                        rightField: `'${visitId}'`
                    }
                ])
                .getData(false)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getCurrentVisitByVisitId',
                `fetch visit failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    static async getCustUniqIdsFromVisitOnOtherRoutes(returnAccountId?: boolean): Promise<Array<string>> {
        const otherRetailStores = await BaseInstance.sfSoupEngine.retrieve(
            'RetailStore',
            ['Id', 'AccountId'],
            `Select 
                {RetailStore:Account.CUST_UNIQ_ID_VAL__c},
                {RetailStore:AccountId}
            FROM {Visit}
            LEFT JOIN {RetailStore} ON
                {Visit:PlaceId} = {RetailStore:Id}
            LEFT JOIN {Visit_List__c} ON 
                {Visit_List__c:Id} = {Visit:Visit_List__c} OR {Visit_List__c:Id} = {Visit:User_Visit_List__c}
            WHERE
                {Visit:RTE_ID__c} != '${CommonParam.userRouteId}'
                AND {Visit:Planned_Date__c} = '${todayDateWithTimeZone(true)}'
                AND (
                    ({Visit_List__c:Visit_List_Subtype__c} = 'Route Visit List' AND {Visit_List__c:Route_Sales_Geo__c} = '${
                        CommonParam.userRouteId
                    }')
                    OR ({Visit_List__c:Visit_List_Subtype__c} = 'User Visit List' AND {Visit_List__c:User__c} = '${
                        CommonParam.userId
                    }')
                )
            `,
            undefined,
            {}
        )
        if (returnAccountId) {
            return otherRetailStores.length > 0 ? (_.uniq(_.map(otherRetailStores, 'AccountId')) as Array<string>) : []
        }
        return _.uniq(otherRetailStores.map((r) => r.Id))
    }

    static async getRVLIdsCurRoute() {
        const routeVisitList: Array<Partial<LocalVisitListModal>> = await BaseInstance.sfSoupEngine.retrieve(
            'Visit_List__c',
            ['Id'],
            '',
            [
                `WHERE {Visit_List__c:Visit_List_Subtype__c} = 'Route Visit List' 
                AND {Visit_List__c:Route_Sales_Geo__c} = '${CommonParam.userRouteId}'
                AND {Visit_List__c:IsRemoved__c} = false
                AND {Visit_List__c:RecordType.DeveloperName} = 'Sales_Daily_Visit_List'`
            ],
            {}
        )
        return _.uniq(routeVisitList.filter((vl) => vl.Id).map((vl) => vl.Id || ''))
    }

    static async getUVLIdsCurUser() {
        const userVisitLists: Array<Partial<LocalVisitListModal>> = await BaseInstance.sfSoupEngine.retrieve(
            'Visit_List__c',
            ['Id'],
            '',
            [
                `WHERE {Visit_List__c:Visit_List_Subtype__c} = 'User Visit List' 
                AND {Visit_List__c:User__c} = '${CommonParam.userId}'
                AND {Visit_List__c:IsRemoved__c} = false
                AND {Visit_List__c:RecordType.DeveloperName} = 'Sales_Daily_Visit_List'`
            ],
            {}
        )
        return _.uniq(userVisitLists.filter((vl) => vl.Id).map((vl) => vl.Id || ''))
    }

    static async getAllVisitIdsByVLIds(visitListIds: string[]) {
        const visitListIdsStr = getIdClause(visitListIds)
        const visits: Array<Partial<VisitModel>> = await BaseInstance.sfSoupEngine.retrieve(
            'Visit',
            ['Id'],
            '',
            [
                `WHERE ({Visit:Visit_List__c} IN (${visitListIdsStr}) OR {Visit:User_Visit_List__c} IN (${visitListIdsStr}))
                    AND {Visit:Status__c} NOT IN ('Pre-Processed', 'Removed', 'Failed')
                    AND {Visit:RecordType.DeveloperName} = 'Sales'`
            ],
            {}
        )
        return _.uniq(visits.filter((visit) => visit.Id).map((visit) => visit.Id || ''))
    }

    static async getAllStoresForPriceCalculation() {
        const today = todayDateWithTimeZone(true)
        const todayPlannedVisit = await BaseInstance.sfSoupEngine.retrieve(
            'Visit',
            ['AccountId', 'CustUniqId'],
            `
        SELECT
            {Account:Id},
            {Account:CUST_UNIQ_ID_VAL__c}
        FROM {Visit}
        LEFT JOIN {RetailStore} ON {RetailStore:Id} = {Visit:PlaceId}
        LEFT JOIN {Account} ON {Account:Id} = {RetailStore:AccountId}
        LEFT JOIN {Visit_List__c} ON {Visit_List__c:Id} = {Visit:Visit_List__c}
        WHERE {Visit:Planned_Date__c} = '${today}'
        AND {Visit:Status__c} != 'Planned' AND {Visit:Status__c} != 'Removed' AND {Visit:Status__c} != 'Failed'
        AND {Visit_List__c:Visit_List_Subtype__c} = 'Route Visit List'
        `,
            [],
            {},
            false,
            false
        )
        const todayAdHocVisit = await BaseInstance.sfSoupEngine.retrieve(
            'Visit',
            ['AccountId', 'CustUniqId'],
            `
        SELECT
            {RetailStore:AccountId},
            {RetailStore:Account.CUST_UNIQ_ID_VAL__c}
        FROM {Visit}
        LEFT JOIN {RetailStore} ON {RetailStore:Id} = {Visit:PlaceId}
        LEFT JOIN {Account} ON {Account:Id} = {RetailStore:AccountId}
        WHERE {Visit:User_Visit_List__c} IS NOT NULL
        AND {Visit:Planned_Date__c} = '${today}'
        AND {Visit:Status__c} != 'Planned' AND {Visit:Status__c} != 'Removed' AND {Visit:Status__c} != 'Failed'
        `,
            [],
            {},
            false,
            false
        )
        return _.uniqBy([...todayPlannedVisit, ...todayAdHocVisit], 'CustUniqId')
    }

    public static async getOrderRelatedVisitBySoupEntryId(vRefIdsToPull: any[]) {
        try {
            return await BaseInstance.sfSoupEngine.retrieve('Visit', ['Id', '_soupEntryId'], '', [
                `WHERE {Visit:_soupEntryId} IN (${getIdClause(_.uniq(vRefIdsToPull))})`
            ])
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getOrderRelatedVisitBySoupEntryId',
                `fetch visit failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async upsertVisitData(visit: Array<any>) {
        try {
            await BaseInstance.sfSoupEngine.upsert('Visit', visit, true, false)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: upsertVisitData',
                `upsert visit failed: ${ErrorUtils.error2String(err)}`
            )
        }
    }

    public static async retrieveCurrentLocallyUpdatedVisitById(visitId: string) {
        try {
            return await BaseInstance.sfSoupEngine
                .dynamicRetrieve('Visit')
                .select([
                    'Id',
                    'RecordTypeId',
                    'PlaceId',
                    'Planned_Date__c',
                    'Status__c',
                    'Ad_Hoc__c',
                    'User__c',
                    'VisitorId',
                    'RTE_ID__c',
                    'Visit_List__c',
                    'ActualVisitStartTime',
                    'Check_In_Location__Latitude__s',
                    'Check_In_Location__Longitude__s',
                    'Check_In_Location_Flag__c',
                    'User_Visit_List__c',
                    'ActualVisitEndTime',
                    'Check_Out_Location__Latitude__s',
                    'Check_Out_Location__Longitude__s',
                    'Check_Out_Location_Flag__c',
                    'Order_Cart_Identifier__c'
                ])
                .where([
                    {
                        leftTable: 'Visit',
                        leftField: 'Id',
                        operator: '=',
                        rightField: `'${visitId}'`
                    },
                    {
                        type: 'AND',
                        leftTable: 'Visit',
                        leftField: '__locally_updated__',
                        operator: '=',
                        rightField: '1'
                    }
                ])
                .getData()
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: retrieveCurrentLocallyUpdatedVisitById',
                `fetch visit failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }
}

export default VisitData

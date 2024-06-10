import BaseInstance from '../../../common/BaseInstance'
import { CommonParam } from '../../../common/CommonParam'
import dayjs from 'dayjs'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { VisitStatus } from '../../enum/VisitType'
import { RecordTypeEnum } from '../../../savvy/enums/RecordType'

export const getPlannedOrderCount = async (
    salesRecordTypeId: string,
    ctrRecordTypeId: string,
    selectedDate: string
) => {
    const res = await BaseInstance.sfSoupEngine.retrieve(
        'Visit',
        ['count'],
        `SELECT 
                    COALESCE(SUM(CASE 
                            WHEN {Visit:Delivery_Date__c} IS NOT NULL AND {Visit:Delivery_Date2__c} IS NULL AND {Visit:Delivery_Date3__c} IS NULL THEN 1
                            WHEN {Visit:Delivery_Date__c} IS NOT NULL AND {Visit:Delivery_Date2__c} IS NOT NULL AND {Visit:Delivery_Date3__c} IS NULL THEN 2
                            WHEN {Visit:Delivery_Date__c} IS NOT NULL AND {Visit:Delivery_Date2__c} IS NOT NULL AND {Visit:Delivery_Date3__c} IS NOT NULL THEN 3
                            ELSE 0
                        END), 0) AS order_count 
                  FROM {Visit} WHERE {Visit:RecordTypeId} = '${salesRecordTypeId}' AND 
                  {Visit:Retail_Store__r.AccountId} IN (SELECT {Customer_to_Route__c:Customer__c} FROM {Customer_to_Route__c} WHERE {Customer_to_Route__c:Route__c} = '${
                      CommonParam.userRouteId
                  }' AND {Customer_to_Route__c:RecordTypeId}='${ctrRecordTypeId}' AND {Customer_to_Route__c:ACTV_FLG__c} IS TRUE) AND 
                    ({Visit:Planned_Date__c} = '${dayjs(selectedDate).format(TIME_FORMAT.Y_MM_DD)}' AND 
                    ({Visit:ActualVisitEndTime} IS NULL OR 
                    ({Visit:ActualVisitEndTime} BETWEEN '${dayjs(selectedDate)
                        .startOf('day')
                        .utc()
                        .format(TIME_FORMAT.YMDTHMS + '+0000')}' AND '${dayjs(selectedDate)
            .endOf('day')
            .utc()
            .format(TIME_FORMAT.YMDTHMS + '+0000')}'))) AND   
        {Visit:Status__c} IN ('${VisitStatus.PUBLISH}','${VisitStatus.IN_PROGRESS}', '${VisitStatus.COMPLETE}')`
    )
    return res[0]?.count
}
export const getCompletedOrderCount = async (ctrRecordTypeId: string, selectedDate: string) => {
    const res = await BaseInstance.sfSoupEngine.retrieve(
        'Order',
        ['count'],
        `SELECT count(*) FROM {Order} WHERE {Order:Order_ATC_Type__c}='Normal' AND date({Order:EffectiveDate}) = date('${selectedDate}') AND 
            {Order:Sls_Mthd_Descr__c}  = '${RecordTypeEnum.PRESELL}' AND 
            {Order:RetailStore__c} IN (SELECT {RetailStore:Id} FROM {RetailStore} WHERE {RetailStore:AccountId} IN 
                (SELECT {Customer_to_Route__c:Customer__c} FROM {Customer_to_Route__c} 
                    WHERE {Customer_to_Route__c:Route__c} = '${CommonParam.userRouteId}' AND 
                    {Customer_to_Route__c:RecordTypeId}='${ctrRecordTypeId}' AND 
                    {Customer_to_Route__c:ACTV_FLG__c} IS TRUE)
                )`
    )
    return res[0]?.count
}
export const getPlannedDeliveryCount = async (
    deliveryRecordTypeId: string,
    ctrRecordTypeId: string,
    selectedDate: string
) => {
    const res = await BaseInstance.sfSoupEngine.retrieve(
        'Visit',
        ['count'],
        `SELECT count(*) FROM {Visit} WHERE {Visit:RecordTypeId}='${deliveryRecordTypeId}' AND 
        {Visit:Retail_Store__r.AccountId} IN (SELECT {Customer_to_Route__c:Customer__c} FROM {Customer_to_Route__c} WHERE {Customer_to_Route__c:Route__c} = '${
            CommonParam.userRouteId
        }' AND {Customer_to_Route__c:RecordTypeId}='${ctrRecordTypeId}' AND {Customer_to_Route__c:ACTV_FLG__c} IS TRUE) AND 
        ({Visit:Planned_Date__c} = '${dayjs(selectedDate).format(TIME_FORMAT.Y_MM_DD)}' AND 
        ({Visit:ActualVisitEndTime} IS NULL OR 
        ({Visit:ActualVisitEndTime} BETWEEN '${dayjs(selectedDate)
            .startOf('day')
            .utc()
            .format(TIME_FORMAT.YMDTHMS + '+0000')}' AND '${dayjs(selectedDate)
            .endOf('day')
            .utc()
            .format(TIME_FORMAT.YMDTHMS + '+0000')}'))) AND 
        {Visit:Status__c} IN ('${VisitStatus.PUBLISH}','${VisitStatus.IN_PROGRESS}', '${VisitStatus.COMPLETE}')`
    )
    return res[0]?.count
}
export const getCompletedDeliveryCount = async (
    deliveryRecordTypeId: string,
    ctrRecordTypeId: string,
    selectedDate: string
) => {
    const res = await BaseInstance.sfSoupEngine.retrieve(
        'Visit',
        ['count'],
        `SELECT count(*) FROM {Visit} WHERE {Visit:RecordTypeId}='${deliveryRecordTypeId}' AND 
        {Visit:Retail_Store__r.AccountId} IN (SELECT {Customer_to_Route__c:Customer__c} FROM {Customer_to_Route__c} WHERE {Customer_to_Route__c:Route__c} = '${
            CommonParam.userRouteId
        }' AND {Customer_to_Route__c:RecordTypeId}='${ctrRecordTypeId}' AND {Customer_to_Route__c:ACTV_FLG__c} IS TRUE) AND 
        (
            ({Visit:ActualVisitStartTime} BETWEEN '${dayjs(selectedDate)
                .startOf('day')
                .utc()
                .format(TIME_FORMAT.YMDTHMS + '+0000')}' AND '${dayjs(selectedDate)
            .endOf('day')
            .utc()
            .format(TIME_FORMAT.YMDTHMS + '+0000')}') OR 
            ({Visit:Planned_Date__c} = '${dayjs(selectedDate).format(TIME_FORMAT.Y_MM_DD)}' AND 
            ({Visit:ActualVisitEndTime} IS NULL OR 
            ({Visit:ActualVisitEndTime} BETWEEN '${dayjs(selectedDate)
                .startOf('day')
                .utc()
                .format(TIME_FORMAT.YMDTHMS + '+0000')}' AND '${dayjs(selectedDate)
            .endOf('day')
            .utc()
            .format(TIME_FORMAT.YMDTHMS + '+0000')}')))
            ) 
         AND {Visit:Status__c} IN ('${VisitStatus.COMPLETE}')`
    )
    return res[0]?.count
}
export const getPlannedMerchandisingCount = async (
    merchandisingRecordTypeId: string,
    ctrRecordTypeId: string,
    selectedDate: string
) => {
    const res = await BaseInstance.sfSoupEngine.retrieve(
        'Visit',
        ['count'],
        `SELECT count(*) FROM {Visit} WHERE {Visit:RecordTypeId}='${merchandisingRecordTypeId}' AND {Visit:Retail_Store__r.AccountId} IN (SELECT {Customer_to_Route__c:Customer__c} FROM {Customer_to_Route__c} WHERE {Customer_to_Route__c:Route__c} = '${
            CommonParam.userRouteId
        }' AND {Customer_to_Route__c:RecordTypeId}='${ctrRecordTypeId}' AND {Customer_to_Route__c:ACTV_FLG__c} IS TRUE) AND 
        ({Visit:Planned_Date__c} = '${dayjs(selectedDate).format(TIME_FORMAT.Y_MM_DD)}' AND 
        ({Visit:ActualVisitEndTime} IS NULL OR 
        ({Visit:ActualVisitEndTime} BETWEEN '${dayjs(selectedDate)
            .startOf('day')
            .utc()
            .format(TIME_FORMAT.YMDTHMS + '+0000')}' AND '${dayjs(selectedDate)
            .endOf('day')
            .utc()
            .format(TIME_FORMAT.YMDTHMS + '+0000')}'))) AND 

        {Visit:Status__c} IN ('${VisitStatus.PUBLISH}','${VisitStatus.IN_PROGRESS}', '${VisitStatus.COMPLETE}')`
    )
    return res[0]?.count
}
export const getCompletedMerchandisingCount = async (
    merchandisingRecordTypeId: string,
    ctrRecordTypeId: string,
    selectedDate: string
) => {
    const res = await BaseInstance.sfSoupEngine.retrieve(
        'Visit',
        ['count'],
        `SELECT count(*) FROM {Visit} WHERE {Visit:RecordTypeId}='${merchandisingRecordTypeId}' AND {Visit:Retail_Store__r.AccountId} IN (SELECT {Customer_to_Route__c:Customer__c} FROM {Customer_to_Route__c} WHERE {Customer_to_Route__c:Route__c} = '${
            CommonParam.userRouteId
        }' AND {Customer_to_Route__c:RecordTypeId}='${ctrRecordTypeId}' AND {Customer_to_Route__c:ACTV_FLG__c} IS TRUE) AND 
        (
            ({Visit:ActualVisitStartTime} BETWEEN '${dayjs(selectedDate)
                .startOf('day')
                .utc()
                .format(TIME_FORMAT.YMDTHMS + '+0000')}' AND '${dayjs(selectedDate)
            .endOf('day')
            .utc()
            .format(TIME_FORMAT.YMDTHMS + '+0000')}') OR 
                ({Visit:Planned_Date__c} = '${dayjs(selectedDate).format(TIME_FORMAT.Y_MM_DD)}' AND 
        ({Visit:ActualVisitEndTime} IS NULL OR 
        ({Visit:ActualVisitEndTime} BETWEEN '${dayjs(selectedDate)
            .startOf('day')
            .utc()
            .format(TIME_FORMAT.YMDTHMS + '+0000')}' AND '${dayjs(selectedDate)
            .endOf('day')
            .utc()
            .format(TIME_FORMAT.YMDTHMS + '+0000')}')))
        )
         AND  {Visit:Status__c} IN ('${VisitStatus.COMPLETE}')`
    )
    return res[0]?.count
}

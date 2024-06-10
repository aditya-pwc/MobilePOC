/* eslint-disable camelcase */

/*
 * @Description: VisitTimelineService
 * @Author: Mary Qian
 * @Date: 2021-08-11 02:20:26
 * @LastEditTime: 2022-12-12 10:00:17
 * @LastEditors: Mary Qian
 */

import _ from 'lodash'
import { fetchObjInTime } from '../api/SyncUtils'
import { TimelineDataProps } from '../components/manager/schedule/VisitTimelineItem'
import { AssessmentReason } from '../enums/AssessmentData'
import { VisitStatus } from '../enums/Visit'
import { t } from '../../common/i18n/t'
import WorkOrderService from '../module/work-order/WorkOrderService'
import { SoupService } from './SoupService'
import { exeAsyncFunc } from '../../common/utils/CommonUtils'

interface VisitDetailRelatedForTimelineProps {
    name: string
}

export interface VisitForTimelineProps {
    Id: string
    status: string
    OwnerId: string
    startTime: string
    date: string
    inLocation: boolean
    UserName: string
    Check_Out_Location_Flag__c: boolean | string
    ActualVisitStartTime: string
    ActualVisitEndTime: string
    visitDetailRelated: VisitDetailRelatedForTimelineProps
}

const getVisitObjById = async (visitId: string) => {
    const condition = [`WHERE {Visit:Id} = '${visitId}'`]
    let visitObj = null

    await exeAsyncFunc(async () => {
        const result = await SoupService.retrieveDataFromSoup('Visit', {}, [], null, condition)

        if (result.length > 0) {
            const visit = result[0]
            const {
                ActualVisitStartTime,
                ActualVisitEndTime,
                Id,
                OwnerId,
                PlaceId,
                Check_In_Location_Flag__c,
                Check_Out_Location_Flag__c,
                Planned_Date__c,
                VisitorId
            } = visit

            const userCondition = [`WHERE {User:Id} = '${VisitorId}'`]
            const userResult = await SoupService.retrieveDataFromSoup('User', {}, [], null, userCondition)
            const userName = userResult[0]?.Name || ''

            visitObj = {
                Id,
                status: visit.Status__c,
                OwnerId,
                startTime: Planned_Date__c,
                date: Planned_Date__c,
                Planned_Date__c,
                inLocation: Check_In_Location_Flag__c === true || Check_In_Location_Flag__c === '1',
                UserName: userName,
                Check_Out_Location_Flag__c,
                ActualVisitStartTime,
                ActualVisitEndTime,
                storeId: PlaceId,
                visitDetailRelated: { name: userName }
            }
        }
    }, 'getVisitObjById')

    return visitObj
}

const getAssessmentInfo = async (id: string) => {
    let taskId = ''
    let reason = ''
    let managerName = ''
    let signatureData = ''

    let obj = { reason, managerName, signatureData, taskId }

    await exeAsyncFunc(async () => {
        const atQuery = `SELECT Id, ParentId, Reason__c, Store_Manager_Name__c FROM AssessmentTask
                WHERE ParentId = '${id}'`
        const tasks = await fetchObjInTime('AssessmentTask', atQuery)

        if (tasks?.length > 0) {
            taskId = tasks[0].Id
            reason = tasks[0].Reason__c
            managerName = tasks[0].Store_Manager_Name__c

            let documentLink = []
            if (taskId?.length > 0) {
                const cdlQuery = `SELECT Id, ContentDocumentId, LinkedEntityId FROM ContentDocumentLink
                WHERE LinkedEntityId = '${taskId}'`
                documentLink = await fetchObjInTime('ContentDocumentLink', cdlQuery)
            }

            if (documentLink?.length > 0) {
                const documentId = documentLink[0].ContentDocumentId
                const cvQuery = `SELECT Id, VersionData FROM ContentVersion WHERE ContentDocumentId = '${documentId}'`
                const res = await fetchObjInTime('ContentVersion', cvQuery)

                if (res?.length > 0) {
                    signatureData = res[0].VersionData
                }
            }
        }
        obj = { taskId, reason, signatureData, managerName }
    }, 'getAssessmentInfo')

    return obj
}

const getMerchName = (visit: VisitForTimelineProps) => {
    return visit.UserName || visit.visitDetailRelated?.name || ''
}

const handleAssessmentData = async (visit: VisitForTimelineProps): Promise<TimelineDataProps> => {
    const { ActualVisitEndTime, Id } = visit
    const checkOutFlag = visit.Check_Out_Location_Flag__c
    const isCheckOutInLocation = checkOutFlag === true || checkOutFlag === '1'
    const checkoutStr = isCheckOutInLocation ? t.labels.PBNA_MOBILE_WITHIN : t.labels.PBNA_MOBILE_OUTSIDE

    const assessmentInfo = await getAssessmentInfo(Id)
    const { reason, managerName, signatureData, taskId } = assessmentInfo
    let assessmentData
    const endVisitMsg = ` ${t.labels.PBNA_MOBILE_COMPLETED_THEIR_VISIT} ${checkoutStr} ${t.labels.PBNA_MOBILE_GEOFENCE}`
    if (reason?.length > 0) {
        let messageInfo = `${t.labels.PBNA_MOBILE_SKIPPED_SIGNATURE}`
        if (reason === AssessmentReason.SMARTR_EXECUTION) {
            messageInfo = `${t.labels.PBNA_MOBILE_COMPLETED_IN_SMARTR}`
        }
        assessmentData = {
            id: taskId,
            time: ActualVisitEndTime,
            isRed: !isCheckOutInLocation,
            merchName: getMerchName(visit),
            message: ` ${endVisitMsg}. ${messageInfo}`,
            hideBottomLine: true,
            detailInfo: {
                completeVisit: true,
                skipped: true,
                reason
            },
            hasExpand: true
        }
    } else {
        assessmentData = {
            id: taskId,
            time: ActualVisitEndTime,
            isRed: !isCheckOutInLocation,
            merchName: getMerchName(visit),
            message: ` ${endVisitMsg}. ${t.labels.PBNA_MOBILE_CAPTURED_SIGNATURE}`,
            hideBottomLine: true,
            detailInfo: {
                completeVisit: true,
                skipped: false,
                managerName,
                signatureData
            },
            hasExpand: true
        }
    }
    return assessmentData
}

const formatWorkOrderData = (visit: VisitForTimelineProps, wo, time, isCompleted): TimelineDataProps => {
    const msg = isCompleted ? ` ${t.labels.PBNA_MOBILE_COMPLETED_WO}` : ` ${t.labels.PBNA_MOBILE_NOT_COMPLETE_WO}`
    return {
        id: wo.Id,
        time,
        isRed: !isCompleted,
        merchName: getMerchName(visit),
        message: msg,
        detailInfo: {
            workOrder: wo
        },
        hasExpand: true
    }
}

const handleWorkOrderData = async (visit: VisitForTimelineProps): Promise<TimelineDataProps[]> => {
    const wos = await WorkOrderService.getWorkOrdersForTimeline(visit)
    const data = []
    wos.forEach((wo) => {
        if (WorkOrderService.isCompletedWorkOrder(wo)) {
            const assessmentData = formatWorkOrderData(visit, wo, wo.Wo_Cmplt_Dte__c, true)
            data.push(assessmentData)
        }
    })

    if (visit.status === VisitStatus.COMPLETE) {
        wos.forEach((wo) => {
            if (!WorkOrderService.isCompletedWorkOrder(wo)) {
                const assessmentData = formatWorkOrderData(visit, wo, visit.ActualVisitEndTime, false)
                data.push(assessmentData)
            }
        })
    }

    return data
}

const prepareEventData = async (visit: VisitForTimelineProps): Promise<TimelineDataProps[]> => {
    let soql =
        'SELECT {Event:Id}, {Event:Actual_Start_Time__c}, {Event:Actual_End_Time__c}, {Event:Subject}, {Event:OwnerId} FROM {Event}'
    if (visit.status !== VisitStatus.IN_PROGRESS && visit.status !== VisitStatus.COMPLETE) {
        soql += ` WHERE {Event:Actual_End_Time__c} IS NULL AND {Event:Actual_Start_Time__c} IS NOT NULL AND {Event:OwnerId} = '${visit.OwnerId}'`
    } else {
        soql +=
            ` WHERE
        {Event:OwnerId} = '${visit.OwnerId}'
        AND
        (({Event:Actual_Start_Time__c} > '` +
            visit.ActualVisitStartTime +
            `'
            AND {Event:Actual_Start_Time__c} < '` +
            visit.ActualVisitEndTime +
            `')
        OR ({Event:Actual_Start_Time__c} > '` +
            visit.ActualVisitStartTime +
            `'
            AND '` +
            visit.ActualVisitEndTime +
            "' IS NULL)) "
    }
    soql += ' ORDER BY {Event:Actual_Start_Time__c}'

    const dataList = []

    await exeAsyncFunc(async () => {
        const res = await SoupService.retrieveDataFromSoup(
            'Event',
            {},
            ['Id', 'Actual_Start_Time__c', 'Actual_End_Time__c', 'Subject', 'OwnerId'],
            soql
        )
        res.forEach((item) => {
            const data = {
                id: item.Id,
                time: item.Actual_Start_Time__c,
                merchName: getMerchName(visit),
                message: ` ${t.labels.PBNA_MOBILE_HAS_STARTED_A} ${item.Subject}`
            }
            dataList.push(data)
        })
    }, 'prepareEventData')

    return dataList
}

const prepareStartVisitData = (visit: VisitForTimelineProps): TimelineDataProps => {
    const { ActualVisitStartTime, inLocation } = visit

    const geoLocationStr = inLocation ? t.labels.PBNA_MOBILE_WITHIN : t.labels.PBNA_MOBILE_OUTSIDE
    return {
        id: ActualVisitStartTime,
        time: ActualVisitStartTime,
        isRed: !inLocation,
        merchName: getMerchName(visit),
        message: ` ${t.labels.PBNA_MOBILE_STARTED_THEIR_VISIT} ${geoLocationStr} ${t.labels.PBNA_MOBILE_GEOFENCE}`,
        hideTopLine: true
    }
}

export const getEmptyTimelineData = (vis: VisitForTimelineProps, isStart: boolean): TimelineDataProps => {
    return {
        id: vis.Id + (isStart ? 'start' : 'end'),
        hideTopLine: isStart,
        hideBottomLine: !isStart,
        isEmpty: true
    }
}

const prepareVisit = async (vis: VisitForTimelineProps): Promise<TimelineDataProps[]> => {
    const visit = await getVisitObjById(vis.Id)
    if (!visit) {
        return []
    }

    const status = visit.status

    let list = []

    await exeAsyncFunc(async () => {
        if (status === VisitStatus.PUBLISH) {
            list.push(getEmptyTimelineData(vis, true))
            list.push(getEmptyTimelineData(vis, false))
            return
        }

        list.push(prepareStartVisitData(visit))

        const woData = await handleWorkOrderData(visit)
        const eventData = await prepareEventData(visit)

        let tempData = eventData.concat(woData)
        tempData = _.sortBy(tempData, ['time'])
        list = list.concat(tempData)

        if (visit.ActualVisitEndTime) {
            const assessmentData = await handleAssessmentData(visit)
            list.push(assessmentData)
        } else {
            list.push(getEmptyTimelineData(vis, false))
        }
    }, 'prepareVisit')

    return list
}

export const VisitTimelineService = {
    getVisitObjById,
    getEmptyTimelineData,
    prepareVisit
}

export default VisitTimelineService

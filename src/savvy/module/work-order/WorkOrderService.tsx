/*
 * @Description:WorkOrderService
 * @Author: Mary Qian
 * @Date: 2021-08-19 03:27:22
 * @LastEditTime: 2023-10-23 17:41:11
 * @LastEditors: Mary Qian
 */
import 'moment-timezone'
import moment from 'moment'
import { WorkOrderStatus } from '../../enums/Visit'
import { fetchObjInTime } from '../../api/SyncUtils'
import { SoupService } from '../../service/SoupService'
import InStoreMapService from '../../service/InStoreMapService'
import DocumentService from '../../service/DocumentService'
import MomentService from '../../service/MomentService'
import { todayDateWithTimeZone } from '../../utils/TimeZoneUtils'
import _ from 'lodash'
import { CommonParam } from '../../../common/CommonParam'
import { Persona } from '../../../common/enums/Persona'
import { exeAsyncFuncTemp } from '../../utils/CommonUtils'
import { Log } from '../../../common/enums/Log'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { MOMENT_UNIT } from '../../../common/enums/MomentUnit'
import { MOMENT_STARTOF } from '../../../common/enums/MomentStartOf'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { exeAsyncFunc } from '../../../common/utils/CommonUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

enum PHOTO_TYPE {
    REFERENCE = 'Reference Photo',
    EXECUTION = 'Execution Photo'
}

const isCompletedWorkOrder = (wo: any) => {
    return wo.Wo_Cmplt_Dte__c && wo.Status === WorkOrderStatus.COMPLETE
}

const isOpenWorkOrder = (wo: any) => {
    return wo.Status === WorkOrderStatus.OPEN
}

const addPhotosForWorkOrder = async (workOrders: any) => {
    const workOrderIds = workOrders.map((workOrder) => {
        return "'" + workOrder.Id + "'"
    })

    await exeAsyncFuncTemp(async () => {
        const photos = await DocumentService.fetchWorkOrderPhotos(workOrderIds)

        workOrders.forEach((wo) => {
            const referencePhotos =
                photos.filter((item) => item.TargetId === wo.Id && item.ImageType === PHOTO_TYPE.REFERENCE) || []
            const executionPhotos =
                photos.filter((item) => item.TargetId === wo.Id && item.ImageType === PHOTO_TYPE.EXECUTION) || []
            wo.reference_photo = referencePhotos
            wo.execution_photo = executionPhotos
        })
    }, 'addPhotosForWorkOrder')
}

const addProductsForWorkOrder = async (workOrders: any) => {
    for (const w of workOrders) {
        w.promotion_product = []
        if (w.Display_Id_Instore__c) {
            const inStoreLocationId = w.Display_Id_Instore__c
            w.promotion_product = await InStoreMapService.getInStoreLocationProductsById(inStoreLocationId, true)
        }
    }
}

const isValidWorkOrderForTimeline = (workOrder: any, visit: any) => {
    const { OwnerId, ActualVisitStartTime, ActualVisitEndTime } = visit

    if (isCompletedWorkOrder(workOrder)) {
        const isSameUser = workOrder.Completed_By_User__c === OwnerId
        let isValidTime = moment(workOrder.Wo_Cmplt_Dte__c).isSameOrAfter(ActualVisitStartTime)
        if (ActualVisitEndTime) {
            isValidTime = isValidTime && moment(workOrder.Wo_Cmplt_Dte__c).isSameOrBefore(ActualVisitEndTime)
        }
        if (isSameUser && isValidTime) {
            return true
        }
    } else {
        if (ActualVisitEndTime) {
            return true
        }
    }

    return false
}

const workOrderQuery = () => {
    // work order sql
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

const completeWorkOrderInOneDayQuery = () => {
    return `
        SELECT COUNT({Task:Id}) FROM {Task}
            WHERE {Visit:PlaceId} = {Task:WhatId}
            AND {Task:Status} = '${WorkOrderStatus.COMPLETE}'
            AND {Visit:Planned_Date__c} = date(replace({Task:Wo_Cmplt_Dte__c}, '+0000',''), '${CommonParam.userTimeZoneOffset}')
            AND {Task:RecordType.Name} = 'Work Order'
            GROUP BY {Task:WhatId}
        `
}

const getWorkOrdersOffline = async (storeId: string, startTime: string) => {
    const today = moment().startOf(MOMENT_STARTOF.DAY)
    const isTodayVisit = moment(startTime).isSameOrBefore(today)

    // old logic by work order list
    // const isTodayVisit = visit.visitList === CommonParam.visitList.Id

    // work order sql
    const condition = ["WHERE {Task:WhatId} = '" + storeId + "' AND {Task:RecordType.Name} = 'Work Order'"]
    if (isTodayVisit) {
        condition.push(" AND date({Task:ActivityDate}) <= date('" + startTime + "')")
    } else {
        condition.push(" AND date({Task:ActivityDate}) = date('" + startTime + "')")
    }

    condition.push(` AND (
        {Task:Display_Id_Instore__r.End_Date__c} IS NULL
        OR {Task:Display_Id_Instore__r.End_Date__c} >= date('now', '${CommonParam.userTimeZoneOffset}', 'start of day')
    )`)

    let res = []
    await exeAsyncFunc(async () => {
        res = await SoupService.retrieveDataFromSoup('Task', {}, [], null, condition)
    }, 'getWorkOrdersOffline')

    const startTimeToCompare = moment(startTime).startOf(MOMENT_UNIT.DAYS)
    const endTimeToCompare = moment(startTime).endOf(MOMENT_UNIT.DAYS)
    return res.filter((wo) => {
        const completeTime = moment(wo.Wo_Cmplt_Dte__c)
        if (wo.Status === WorkOrderStatus.OPEN) {
            return true
        }
        if (wo.Status === WorkOrderStatus.COMPLETE) {
            return startTimeToCompare.isSameOrBefore(completeTime) && endTimeToCompare.isSameOrAfter(completeTime)
        }

        return false
    })
}

const getWorkOrdersOnline = async (storeId: string, startTime: string, query: string) => {
    const today = moment().startOf(MOMENT_STARTOF.DAY)
    const isTodayVisit = moment(startTime).isSameOrBefore(today)

    // work order sql
    let q = `SELECT Id, OwnerId, Display_Id_Instore__c, Display_Id_Instore__r.End_Date__c, Location_Formula__c, LastModifiedDate, ActivityDate, 
    WhatId, Wo_Ordered_By_ID__c, Wo_Ordered_By_Name__c, Wo_Approver_Id__c, Wo_Approver_Name__c,  Wo_Subject__c,
    Wo_Comments__c, Description, Merch_Comments__c, Subject, Status, Type, Wo_Location__c, RecordTypeId, 
    RecordType.Id, RecordType.Name, Wo_Cmplt_Dte__c, Completed_By_User__c, Record_Updated__c  
        FROM Task
        WHERE What.type = 'RetailStore' and WhatId = '${storeId}' AND RecordType.Name = 'Work Order'
        ${query}`

    if (isTodayVisit) {
        q = q + ` AND ActivityDate <= ${startTime}`
    } else {
        q = q + ` AND ActivityDate = ${startTime}`
    }

    try {
        const records = await fetchObjInTime('Task', q)
        // update Task soup since Display_Id_Instore__r.End_Date__c are not updated by sync down
        await SoupService.upsertDataIntoSoupWithExternalId('Task', records, false, true)

        const validRes = []
        const deepRes = _.cloneDeep(records)
        deepRes.forEach((item) => {
            if (!item.Display_Id_Instore__r) {
                validRes.push(item)
            } else {
                const endDate = item.Display_Id_Instore__r.End_Date__c
                const todayDate = todayDateWithTimeZone(true)
                if (!endDate || moment(endDate).isSameOrAfter(moment(todayDate))) {
                    validRes.push(item)
                }
            }
        })

        return validRes
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'getWorkOrdersOnline', ErrorUtils.error2String(error))
    }

    return []
}

const getOpenOrValidCompleteWorkOrders = async (visit: any, isOnline = false) => {
    if (!visit.storeId) {
        return []
    }
    let res = []

    const visitDate = visit.plannedDate || visit.VisitDate || visit.Planned_Date__c

    await exeAsyncFuncTemp(async () => {
        if (isOnline) {
            res = await getWorkOrdersOnline(visit.storeId, visitDate, '')
        } else {
            res = await getWorkOrdersOffline(visit.storeId, visitDate)
        }
    }, 'getOpenOrValidCompleteWorkOrders')

    if (_.isEmpty(res)) {
        return []
    }

    return res.filter((wo) => {
        if (isOpenWorkOrder(wo)) {
            return true
        }
        if (isCompletedWorkOrder(wo)) {
            if (CommonParam.PERSONA__c === Persona.MERCHANDISER) {
                return MomentService.isTodayTime(wo.Wo_Cmplt_Dte__c)
            }
            return isValidWorkOrderForTimeline(wo, visit)
        }

        return false
    })
}

const getWorkOrdersForManagerVD = async (visit: any) => {
    if (!visit.storeId) {
        return []
    }

    let workOrders = []
    await exeAsyncFuncTemp(async () => {
        workOrders = await getWorkOrdersOnline(visit.storeId, visit.VisitDate, " AND Status = 'Open'")
        if (!workOrders) {
            return []
        }

        await addPhotosForWorkOrder(workOrders)
        await addProductsForWorkOrder(workOrders)
    }, 'getWorkOrdersForManagerVD')

    return workOrders
}

const getWorkOrdersForTimeline = async (visit: any) => {
    let workOrders = []

    await exeAsyncFuncTemp(async () => {
        workOrders = await getOpenOrValidCompleteWorkOrders(visit, true)
        await addPhotosForWorkOrder(workOrders)
        await addProductsForWorkOrder(workOrders)
    }, 'getWorkOrdersForTimeline')

    return workOrders
}

const saveWorkOrder = (workOrder: any) => {
    const wo = JSON.parse(JSON.stringify(workOrder))
    wo.RecordType = {
        Id: workOrder['RecordType.Id'],
        Name: workOrder['RecordType.Name']
    }
    delete wo.reference_photo
    delete wo.execution_photo
    delete wo.promotion_product
    return SoupService.upsertDataIntoSoup('Task', [wo])
}

export const WorkOrderService = {
    PHOTO_TYPE,
    isCompletedWorkOrder,
    isOpenWorkOrder,
    workOrderQuery,
    completeWorkOrderInOneDayQuery,
    getOpenOrValidCompleteWorkOrders,
    getWorkOrdersForTimeline,
    getWorkOrdersForManagerVD,
    saveWorkOrder
}

export default WorkOrderService

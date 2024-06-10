import _ from 'lodash'
import BaseInstance from '../../../common/BaseInstance'
import { batchSynDown } from '../../utils/CommonUtil'
import { appendLog, storeClassLog } from '../../../common/utils/LogUtils'
import { formatWithTimeZone, todayDateWithTimeZone } from '../../../common/utils/TimeZoneUtils'
import { compositeCommonCall } from '../../../savvy/api/SyncUtils'
import { CommonParam } from '../../../common/CommonParam'
import moment from 'moment'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { Log } from '../../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import {
    chunkGraphs,
    hasDuplicateError,
    judgeCompositeGraphSuccess,
    processSyncUpBody
} from '../../utils/CompositeGraphCallUtils'
import dayjs from 'dayjs'
import OrderData from './OrderData'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getIdClause } from '../../../common/utils/CommonUtils'

const Buffer = require('buffer').Buffer

type RequestMethod = 'POST' | 'GET' | 'PATCH'

interface CompositeRequest {
    method: RequestMethod
    url: string
    referenceId: string
    body: any
}

interface CompositeGraph {
    graphId: string
    compositeRequest: Array<CompositeRequest>
}

interface CompositeGraphCall {
    graphs: Array<CompositeGraph>
}

interface GraphCallInterface {
    parentObjName: string
    parentObjs: Array<any>
    method: RequestMethod
    childObjName?: string
    childObjs?: Array<any>
    isParentChildBind?: boolean
    refField?: string
    resultsFromOch?: any
}

interface OrderLogData {
    // eslint disable reason: Keep object variable naming consistent with Salesforce.
    // eslint-disable-next-line camelcase
    Cust_Po_Id__c: string
    statusCode: number
    body: Object | null
    stage: string
}

export default class OrderSync {
    static async syncDownOrderItemsByOrderId(
        orderIds: string[],
        orderItemSyncFields: string[],
        lastModifiedDate?: string
    ) {
        return batchSynDown(orderIds, {
            name: 'OrderItem',
            whereClause:
                `OrderId IN {BatchIds}` + (lastModifiedDate ? ` AND LastModifiedDate > ${lastModifiedDate}` : ''),
            updateLocalSoup: true,
            fields: orderItemSyncFields,
            allOrNone: true
        })
    }

    static async createSyncUpLocalJSONFile(JSONFile: object, orderId: string) {
        try {
            if (_.isEmpty(JSONFile)) {
                return
            }
            const fileTimeStamp = formatWithTimeZone(moment(), TIME_FORMAT.YYMMDDTHHMMSS, true, false)
            const base64String = Buffer.from(JSON.stringify([JSONFile])).toString('base64')
            const title = `${CommonParam.GPID__c}-${fileTimeStamp}`
            const contentVersionBody = {
                method: 'POST',
                url: `/services/data/${CommonParam.apiVersion}/sobjects/ContentVersion`,
                referenceId: 'refContentVersion',
                body: {
                    Title: title,
                    PathOnClient: `${title}.json`,
                    VersionData: base64String,
                    FirstPublishLocationId: orderId
                }
            }
            const res = await compositeCommonCall([contentVersionBody])
            return res
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'Orderade', 'createSyncUpLocalJSONFile:' + `${JSON.stringify(JSONFile)}`)
        }
    }

    static async syncDownOrderByVisitIds(visitIds: string[], orderSyncFields: string[], lastModifiedDate?: string) {
        return batchSynDown(visitIds, {
            name: 'Order',
            whereClause:
                `Visit__c IN {BatchIds}` + (lastModifiedDate ? ` AND LastModifiedDate > ${lastModifiedDate}` : ''),
            updateLocalSoup: true,
            fields: orderSyncFields,
            allOrNone: true
        })
    }

    static async syncDownOrdersCreatedByCurUser(orderSyncFields: string[]) {
        return BaseInstance.sfSyncEngine.syncDown({
            name: 'Order',
            whereClause: `
                Created_By_GPID__c = '${CommonParam.GPID__c}' 
                AND LOC_ID__c = '${CommonParam.userLocationId}'
                AND EffectiveDate <= ${todayDateWithTimeZone(true)}
                AND EffectiveDate >= LAST_N_DAYS:14
            `,
            updateLocalSoup: true,
            fields: orderSyncFields,
            allOrNone: true
        })
    }

    static async deltaSyncDownPastOrders(lastModifiedDate: string, orderSyncFields: string[]) {
        await BaseInstance.sfSyncEngine.syncDown({
            name: 'Order',
            whereClause: `
                Created_By_GPID__c = '${CommonParam.GPID__c}' 
                AND LOC_ID__c = '${CommonParam.userLocationId}'
                AND EffectiveDate < ${todayDateWithTimeZone(true)}
                AND EffectiveDate >= LAST_N_DAYS:14
                AND LastModifiedDate > ${lastModifiedDate}
            `,
            updateLocalSoup: true,
            fields: orderSyncFields,
            allOrNone: true
        })
    }

    public static async syncUpOrderLocalData(ordersToPush: any[]) {
        const ordersToUpdate = ordersToPush.filter((o) => o.Id)
        try {
            if (ordersToUpdate) {
                await BaseInstance.sfSyncEngine.syncUp({
                    name: 'Ord_Staging__c',
                    records: ordersToUpdate,
                    type: 'PATCH',
                    queryLatestData: true
                })
            }
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: syncUpOrderLocalData',
                `orderade sync up order failed: ${JSON.stringify(err)}`
            )
        }
    }

    private static async fetchOnlineDataWithSoupEntryId(objName: string, objs: Array<any>) {
        try {
            const syncFields = BaseInstance.sfSoupEngine.getSoupFieldList(objName, 'Remote')
            const Ids = objs.map((obj) => obj.Id)
            const returnValue: Array<any> = []
            const resData = await BaseInstance.sfSyncEngine.syncDown({
                name: objName,
                whereClause: `Id IN (${getIdClause(Ids)})`,
                updateLocalSoup: false,
                fields: syncFields,
                allOrNone: true
            })
            objs.forEach((obj) => {
                const matchRes = _.cloneDeep(resData.find((one) => one.Id === obj.Id))
                matchRes._soupEntryId = obj._soupEntryId
                returnValue.push(matchRes)
            })
            return returnValue
        } catch (e) {
            await storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: Composite Graph Call',
                `fetchOnlineDataWithSoupEntryId: ${ErrorUtils.error2String(e)}`
            )
        }
    }

    static async upsertIdToLocal(
        returnedData: any,
        parentObjs: Array<any>,
        parentObjName: string,
        childObjs?: Array<any>,
        childObjName?: string
    ) {
        try {
            const outputParentObjs: Array<any> = []
            const outputChildObjs: Array<any> = []
            const req = []
            returnedData?.data?.graphs?.forEach((graph: any) => {
                if (
                    Array.isArray(graph?.graphResponse?.compositeResponse) &&
                    !_.isEmpty(graph?.graphResponse?.compositeResponse)
                ) {
                    graph.graphResponse.compositeResponse.forEach((singleRes: any) => {
                        const parentObjCopy = _.cloneDeep(
                            parentObjs.find((parentObj) => parentObj.referenceId === singleRes.referenceId)
                        )
                        if (parentObjCopy) {
                            if (singleRes?.body?.success) {
                                parentObjCopy.body.Id = singleRes?.body?.id
                                outputParentObjs.push(parentObjCopy.body)
                            }
                        } else {
                            const childObjCopy = _.cloneDeep(
                                childObjs?.find((childObj: any) => childObj.referenceId === singleRes.referenceId)
                            )
                            if (childObjCopy && singleRes?.body?.success) {
                                childObjCopy.body.Id = singleRes?.body?.id
                                outputChildObjs.push(childObjCopy.body)
                            }
                        }
                    })
                }
            })
            if (!_.isEmpty(outputParentObjs)) {
                const parentData = await this.fetchOnlineDataWithSoupEntryId(parentObjName, outputParentObjs)
                req.push(BaseInstance.sfSoupEngine.upsert(parentObjName, parentData, false, true))
            }
            if (!_.isEmpty(childObjName) && !_.isEmpty(outputChildObjs)) {
                const childData = await this.fetchOnlineDataWithSoupEntryId(childObjName || '', outputChildObjs)
                req.push(BaseInstance.sfSoupEngine.upsert(childObjName, childData, false, true))
            }
            if (!_.isEmpty(req)) {
                return Promise.all(req)
            }
            return []
        } catch (e) {
            await storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: Composite Graph Call',
                `upsertIdToLocal: ${ErrorUtils.error2String(e)}`
            )
            return []
        }
    }

    // we sync up och logs to sf using Reference_Id as external id
    // means if an order failed, it will only have one log which is the latest attempt
    // the storeClassLog does not support upsert using externalId Reference__c
    // so we build one using composite call
    public static async syncOchLogs(logs: Array<OrderLogData>) {
        let previousLogs: any
        try {
            const previousLogsStorage = await AsyncStorage.getItem('Och_Logs')
            previousLogs = JSON.parse(previousLogsStorage || '{}')
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'Orderade: och push log', `Failed to parse och log storage`)
        }
        logs.forEach((log) => {
            previousLogs[log.Cust_Po_Id__c] = log
        })
        const logsToSend = _.values(logs)
        logsToSend.forEach((el) => {
            const logMsg = `${el.Cust_Po_Id__c} has failed to send at ${formatWithTimeZone(
                moment(),
                TIME_FORMAT.YMDTHMS,
                true,
                true
            )}`
            appendLog(Log.MOBILE_ERROR, 'orderade:failed to send order', logMsg)
        })
        if (logsToSend.length) {
            const sfHttpClient = BaseInstance.sfHttpClient
            const compositeBody = logsToSend.map((el) => {
                const statusCodeStr = `(${el.stage} statusCode: ${el.statusCode})`
                return {
                    method: 'PATCH',
                    url: `/services/data/${sfHttpClient.apiVersion}/sobjects/SDF_LGR_Log__c/Reference__c/${el.Cust_Po_Id__c}`,
                    body: {
                        Level__c: Log.MOBILE_ERROR,
                        Message__c: `Failed to create och order ${statusCodeStr}: response: ${JSON.stringify(
                            el.body || {}
                        )}`,
                        Class__c: 'Sales: Send Order to OCH'
                    },
                    referenceId: el.Cust_Po_Id__c.replace(/-/g, '')
                }
            })
            try {
                await sfHttpClient.callComposite(compositeBody, { allOrNone: true })
                AsyncStorage.setItem('Och_Logs', JSON.stringify({}))
            } catch (e) {
                // if sync up log fail, save it and wait for next time
                AsyncStorage.setItem('Och_Logs', JSON.stringify(logs))
            }
        }
    }

    public static async compositeOrderGraphCall(props: GraphCallInterface) {
        try {
            const {
                parentObjName,
                parentObjs,
                method,
                childObjName,
                childObjs,
                isParentChildBind,
                refField,
                resultsFromOch
            } = props
            if (
                (!isParentChildBind && _.isEmpty(parentObjs)) ||
                (isParentChildBind && (_.isEmpty(parentObjs) || _.isEmpty(childObjName)))
            ) {
                await storeClassLog(
                    Log.MOBILE_ERROR,
                    'Orderade: Composite Graph Call',
                    `Composite Graph Call Failed: Empty Data`
                )
            }
            const graphsToSend: CompositeGraphCall = {
                graphs: []
            }
            const soups = BaseInstance.sfSoupEngine.localSoup
            const allParentRequests: Array<any> = []
            const allChildRequests: Array<any> = []
            parentObjs.forEach((parentObj, index) => {
                // Make a copy since we will change the input
                const parentCopy = _.cloneDeep(parentObj)
                delete parentCopy._soupEntryId
                const processedParentCopy = processSyncUpBody(parentObjName, [parentCopy], true, soups)
                graphsToSend.graphs.push({
                    graphId: `${parentObj._soupEntryId}`,
                    compositeRequest: [
                        {
                            method: parentObj?.localMethod || 'POST',
                            referenceId: `${parentObjName}Ref${parentObj._soupEntryId}`,
                            url: `/services/data/${CommonParam.apiVersion}/sobjects/${parentObjName}/`,
                            body: processedParentCopy[0]
                        }
                    ]
                })
                // save a copy to compare the ref with that in res later
                allParentRequests.push({
                    method: parentObj?.localMethod || 'POST',
                    referenceId: `${parentObjName}Ref${parentObj._soupEntryId}`,
                    url: `/services/data/${CommonParam.apiVersion}/sobjects/${parentObjName}/`,
                    body: parentObj
                })
                const relatedChildObjs = childObjs?.filter(
                    (childObj) => childObj[`${refField}`] === parentObj._soupEntryId
                )
                if (!_.isEmpty(relatedChildObjs)) {
                    relatedChildObjs?.forEach((relatedChildObj) => {
                        // Make a copy since we will change the input
                        const childCopy = _.cloneDeep(relatedChildObj)
                        delete childCopy._soupEntryId
                        refField && delete childCopy[`${refField}`]
                        const processedChildCopy = processSyncUpBody(childObjName || '', [childCopy], true, soups)
                        graphsToSend.graphs[index].compositeRequest.push({
                            method: relatedChildObj?.localMethod || 'POST',
                            referenceId: `${childObjName}Ref${relatedChildObj._soupEntryId}`,
                            url: `/services/data/${CommonParam.apiVersion}/sobjects/${childObjName}/`,
                            body: processedChildCopy[0]
                        })
                        // save a copy to compare the ref with that in res later
                        allChildRequests.push({
                            method: relatedChildObj?.localMethod || 'POST',
                            referenceId: `${childObjName}Ref${relatedChildObj._soupEntryId}`,
                            url: `/services/data/${CommonParam.apiVersion}/sobjects/${childObjName}/`,
                            body: relatedChildObj
                        })
                    })
                }
            })
            graphsToSend.graphs.sort((a, b) => {
                if (
                    dayjs(a?.compositeRequest[0]?.body?.Transaction_Time__c).isAfter(
                        b?.compositeRequest[0]?.body?.Transaction_Time__c
                    )
                ) {
                    return 1
                } else if (
                    dayjs(a?.compositeRequest[0]?.body?.Transaction_Time__c).isBefore(
                        b?.compositeRequest[0]?.body?.Transaction_Time__c
                    )
                ) {
                    return -1
                }
                return 0
            })
            const groupedGraphs = chunkGraphs(graphsToSend.graphs)
            if (!_.isEmpty(groupedGraphs)) {
                for (const graph of groupedGraphs) {
                    graphsToSend.graphs = graph
                    const res = await BaseInstance.sfHttpClient.callData('composite/graph', `${method}`, graphsToSend)
                    if (hasDuplicateError(res)) {
                        await OrderData.removeDupFromLocal(parentObjs, parentObjName, childObjs, childObjName)
                    } else if (judgeCompositeGraphSuccess(res)) {
                        const localUpdateResults = await OrderSync.upsertIdToLocal(
                            res,
                            allParentRequests,
                            parentObjName,
                            allChildRequests,
                            childObjName
                        )
                        if (localUpdateResults[0] && localUpdateResults[0].length > 0) {
                            const localOrderUpdateResults = localUpdateResults[0]
                            if (!_.isEmpty(resultsFromOch)) {
                                resultsFromOch.forEach((ochRes: any) => {
                                    const orderId = localOrderUpdateResults.find(
                                        (local: any) => local.Order_Unique_Id__c === ochRes.Order_Unique_Id__c
                                    )?.Id
                                    if (orderId) {
                                        this.createSyncUpLocalJSONFile(ochRes.RequestFile, orderId)
                                    }
                                })
                            }
                        }
                    } else {
                        await storeClassLog(
                            Log.MOBILE_ERROR,
                            'Orderade: Composite Graph Call',
                            `Composite Graph Call Failed: ${ErrorUtils.error2String(res)}`
                        )
                    }
                }
            }
        } catch (e) {
            await storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: Composite Graph Call',
                `compositeGraphCall: ${ErrorUtils.error2String(e)}`
            )
        }
    }

    static synDownOrderBySales(visits: any[], orderSyncFields: string[]) {
        return batchSynDown(visits, {
            name: 'Order',
            whereClause: `Visit__c IN {BatchIds} AND Visit__r.RecordType.DeveloperName = 'Sales'`,
            updateLocalSoup: true,
            fields: orderSyncFields,
            allOrNone: true
        })
    }
}

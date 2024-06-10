/*
 * @Author: Tom tong.jiang@pwc.com
 * @Date: 2023-08-14 15:56:55
 * @LastEditors: Tom tong.jiang@pwc.com
 * @LastEditTime: 2024-03-11 09:55:56
 */

import _ from 'lodash'
import BaseInstance from '../../common/BaseInstance'
import { getIdClause } from '../../common/utils/CommonUtils'

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

const getObjByName = (objName: string, soups: Array<any>) => {
    return soups.find((obj) => {
        return obj.name === objName
    })
}

export const processSyncUpBody = (soupName: string, sourceObjs: Array<any>, isCreate: boolean, soups: any) => {
    const objsToDo = []
    const needToBoolean = getObjByName(soupName, soups).fieldList.map((field: any) => {
        if (field.type === 'boolean') {
            return field.name
        }
        return ''
    })
    for (const sourceObj of sourceObjs) {
        const objToDo: any = {}
        Object.keys(sourceObj).forEach((key) => {
            if (key === 'Id' && !isCreate) {
                objToDo[key] = sourceObj[key]
            }
            if (
                key !== 'Id' &&
                key !== '__local__' &&
                key !== '__locally_created__' &&
                key !== '__locally_updated__' &&
                key !== '__locally_deleted__'
            ) {
                objToDo[key] = sourceObj[key]
            }
            if (needToBoolean.indexOf(key) !== -1) {
                objToDo[key] = sourceObj[key] === '1' || sourceObj[key] === true
            }
        })
        objsToDo.push(objToDo)
    }
    return objsToDo
}

export const hasDuplicateError = (res: any) => {
    let result = false
    const DUPLICATE_VALUE = 'DUPLICATE_VALUE'
    if (Array.isArray(res?.data?.graphs) && !_.isEmpty(res?.data?.graphs)) {
        res?.data?.graphs?.forEach((graph: any) => {
            if (
                Array.isArray(graph?.graphResponse?.compositeResponse) &&
                !_.isEmpty(graph?.graphResponse?.compositeResponse)
            ) {
                graph?.graphResponse?.compositeResponse?.forEach((singleRes: any) => {
                    if (Array.isArray(singleRes?.body) && !_.isEmpty(singleRes?.body)) {
                        singleRes?.body.forEach((error: any) => {
                            result = error.errorCode === DUPLICATE_VALUE || result
                        })
                    }
                })
            }
        })
    }
    return result
}

export const judgeCompositeGraphSuccess = (res: any) => {
    let result = false
    if (Array.isArray(res?.data?.graphs) && !_.isEmpty(res?.data?.graphs)) {
        res?.data?.graphs?.forEach((graph: any) => {
            result = graph?.isSuccessful || result
            if (Array.isArray(graph?.graphResponse) && !_.isEmpty(graph?.graphResponse)) {
                graph?.graphResponse?.compositeResponse?.forEach((singleRes: any) => {
                    result = singleRes?.body?.success || result
                })
            }
        })
    }
    return result
}

export const getUpdatedLocalData = async (objName: string, localObjs: Array<any>, dependField: string) => {
    let outputArray: Array<any> = []
    const objsSyncFields = BaseInstance.sfSoupEngine.getSoupFieldList(objName, 'Remote')
    const objsUniqIds = localObjs.map((localObj) => localObj[`${dependField}`])
    const SFRecords = await BaseInstance.sfSyncEngine.syncDown({
        name: objName,
        whereClause: `${dependField} IN (${getIdClause(objsUniqIds)})`,
        updateLocalSoup: false,
        fields: objsSyncFields,
        allOrNone: true
    })
    if (!_.isEmpty(SFRecords)) {
        const removeArr: Array<any> = []
        localObjs.forEach((localObj) => {
            const SFRecord = SFRecords.find((SFObj) => localObj[`${dependField}`] === SFObj[`${dependField}`])
            if (!_.isEmpty(SFRecord)) {
                removeArr.push(localObj._soupEntryId)
            }
        })
        outputArray = SFRecords
        if (!_.isEmpty(removeArr)) {
            await BaseInstance.sfSoupEngine.removeRecords(objName, removeArr)
        }
    }
    return outputArray
}

export const chunkGraphs = (graphs: Array<CompositeGraph>) => {
    const outputGraphGroups: Array<Array<CompositeGraph>> = []
    let totalNodes = 0
    if (!_.isEmpty(graphs)) {
        graphs.forEach((graph) => {
            totalNodes += graph.compositeRequest.length
            if (totalNodes >= 500 && graph.compositeRequest.length < 500) {
                outputGraphGroups.push([graph])
                totalNodes = graph.compositeRequest.length
            } else if (totalNodes < 500 && graph.compositeRequest.length < 500) {
                if (outputGraphGroups.length === 0) {
                    outputGraphGroups.push([graph])
                } else {
                    outputGraphGroups[outputGraphGroups.length - 1].push(graph)
                }
            } else {
                // if the sub request of a graph is more than 500
                // we skip it and do nothing to prevent it from blocking the req array
                totalNodes -= graph.compositeRequest.length
            }
        })
        return outputGraphGroups
    }
    return []
}

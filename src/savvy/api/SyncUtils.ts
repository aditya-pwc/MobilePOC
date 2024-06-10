/**
 * @description The utils for syncing data.
 * @author Shangmin Dou
 */
import { CommonParam } from '../../common/CommonParam'
import StatusCode from '../enums/StatusCode'
import { SoupService } from '../service/SoupService'
import { genGetAllFieldsQueryByObjName, getObjectStringToBoolean } from '../utils/SyncUtils'
import _ from 'lodash'
import { binarySearchWithoutRecursion } from '../utils/CommonUtils'
import {
    CommonSyncRes,
    CompositeRequestBody,
    CompositeSyncDownBody,
    RestMethod
} from '../../common/interface/SyncInterface'
import { Log } from '../../common/enums/Log'
import SyncService from '../service/SyncService'
import MerchandiserConfig from '../config/MerchandiserConfig'
import CapturePictureQueries from '../queries/CapturePictureQueries'
import { getRecordTypeIdByDeveloperName } from '../utils/MerchManagerUtils'
import { recordSyncingLogs } from '../helper/merchandiser/MyVisitHelper'
import { updateAssessmentTask, uploadWorkOrderImg } from '../service/AssessmentTaskService'
import { setupLocationByCoordinates } from '../utils/locationUtils'
import moment from 'moment/moment'
import { AxiosRequestConfig } from 'axios'
import { getStringValue } from '../utils/LandingUtils'
import BaseInstance from '../../common/BaseInstance'
import { SyncUpConfig } from 'common-mobile-lib/@common-mobile-lib/sf-sync-engine/src/Interface'
import { storeClassLog } from '../../common/utils/LogUtils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getIdClause } from '../../common/utils/CommonUtils'

/**
 * @description For calling SF Rest data API
 * @param path
 * @param method
 * @param body
 * @param config
 */
export const restDataCommonCall = (path: string, method: RestMethod, body?: object, config?: AxiosRequestConfig) => {
    return BaseInstance.sfHttpClient.callData(path, method, body, config)
}

/**
 * @description For calling custom Apex API
 * @param path
 * @param method
 * @param body
 * @param config
 */
export const restApexCommonCall = (path: string, method: RestMethod, body?: object, config?: AxiosRequestConfig) => {
    return BaseInstance.sfHttpClient.callApex(path, method, body, config)
}

/**
 * @description For calling SF Rest Composite API
 * @param body
 * @param params
 */
export const compositeCommonCall = (
    body: CompositeRequestBody[],
    params?: {
        query?: string
        method?: RestMethod
        allOrNone?: boolean
    }
) => {
    let allOrNone = true
    if (params?.allOrNone !== null && params?.allOrNone === false) {
        allOrNone = false
    }
    return restDataCommonCall(params?.query || 'composite', params?.method || 'POST', {
        allOrNone,
        compositeRequest: body
    })
}

export const callCompositeAPI = (requestArr: CompositeRequestBody[]) => {
    const method = 'callCompositeAPI'
    return new Promise<CommonSyncRes>((resolve, reject) => {
        compositeCommonCall(requestArr)
            .then((res) => {
                const compositeRes = res.data.compositeResponse
                const errorLogs = []

                for (const comRes of compositeRes) {
                    if (Math.floor(comRes.httpStatusCode / 100) !== 2) {
                        errorLogs.push(JSON.stringify(comRes))
                    }
                }

                if (errorLogs.length > 0) {
                    const rejection = {
                        status: 'E2',
                        method,
                        error: errorLogs
                    }
                    storeClassLog(Log.MOBILE_ERROR, 'callCompositeAPI', rejection)
                    reject(rejection)
                } else {
                    resolve({
                        status: 'E0',
                        method,
                        data: res
                    })
                }
            })
            .catch((error) => {
                const rejection = {
                    status: 'E2',
                    method,
                    error: JSON.stringify(error)
                }
                storeClassLog(Log.MOBILE_ERROR, 'callCompositeAPI', rejection)
                reject(rejection)
            })
    })
}

const addBackSoupEntryId = (queryResRecords, objs, objsLength) => {
    for (let i = 0; i < objsLength; i++) {
        if (objs[i]._soupEntryId) {
            queryResRecords[i]._soupEntryId = objs[i]._soupEntryId
        }
    }
}

/**
 * @description composite sync function encapsulation, the max records length is 200
 * @param objName
 * @param objs
 * @param method
 * @param needQueryLatestData
 */
export const ingestObjsFromLocal200 = (objName: string, objs: any[], method: string, needQueryLatestData) => {
    const allOrNone = objName !== 'Lead__x'
    const objsToDo = _.cloneDeep(objs)
    const idList = []
    const length = objsToDo.length
    for (let i = 0; i < length; i++) {
        idList.push(`id = '@{ref${objName}s[${i}].id}'`)
        objsToDo[i].attributes = { type: objName }
        delete objsToDo[i]._soupEntryId
    }
    const objsToInsert = {
        allOrNone: true,
        records: objsToDo
    }
    const idListString = idList.join(' or ')
    return new Promise<CommonSyncRes>((resolve, reject) => {
        const createBody = {
            method,
            url: `/services/data/${CommonParam.apiVersion}/composite/sobjects`,
            referenceId: `ref${objName}s`,
            body: objsToInsert
        }
        let compositeBody = [createBody]
        if (needQueryLatestData) {
            const q = genGetAllFieldsQueryByObjName(objName)
            const queryBody = {
                method: 'GET',
                url: `/services/data/${CommonParam.apiVersion}/query/?q=${q} WHERE ${idListString}`,
                referenceId: `get${objName}`
            }
            // @ts-ignore
            // the create body and query body type is different
            compositeBody = [createBody, queryBody]
        }
        compositeCommonCall(compositeBody, { allOrNone })
            .then(async (res) => {
                const compositeRes = res.data.compositeResponse
                if (compositeRes[0].httpStatusCode === StatusCode.SuccessOK) {
                    if (needQueryLatestData) {
                        const queryResRecords = compositeRes[1].body.records
                        try {
                            let data
                            if (method === 'POST') {
                                addBackSoupEntryId(queryResRecords, objs, length)
                                data = await SoupService.upsertDataIntoSoup(objName, queryResRecords, false, true)
                            }
                            if (method === 'PATCH') {
                                data = await SoupService.upsertDataIntoSoupWithExternalId(
                                    objName,
                                    queryResRecords,
                                    false,
                                    true
                                )
                            }
                            resolve({
                                status: 'E0',
                                method: 'ingestObjsFromLocal200',
                                objectName: objName,
                                data
                            })
                        } catch (e) {
                            const rejection = {
                                status: 'E1',
                                method: 'ingestObjsFromLocal200',
                                error: e,
                                objectName: objName,
                                res: JSON.stringify(res?.data?.compositeResponse)
                            }
                            await storeClassLog(Log.MOBILE_ERROR, 'ingestObjsFromLocal200_E1', rejection)
                            reject(rejection)
                        }
                    } else {
                        resolve({
                            status: 'E0',
                            method: 'ingestObjsFromLocal200',
                            objectName: objName
                        })
                    }
                } else {
                    const rejection = {
                        status: 'E2',
                        method: 'ingestObjsFromLocal200',
                        error: compositeRes[0].body[0].errors,
                        objectName: objName
                    }
                    await storeClassLog(Log.MOBILE_ERROR, 'ingestObjsFromLocal200_E2', rejection)
                    reject(rejection)
                }
            })
            .catch(async (err) => {
                const rejection = {
                    status: 'E3',
                    method: 'ingestObjsFromLocal200',
                    error: err,
                    objectName: objName
                }
                await storeClassLog(Log.MOBILE_ERROR, 'ingestObjsFromLocal200_E3', rejection)
                reject(rejection)
            })
    })
}

const judgeResSuccess = (compositeRes, needQueryLatestData) => {
    if (needQueryLatestData) {
        return (
            compositeRes[0].httpStatusCode === StatusCode.SuccessOK &&
            compositeRes[2].httpStatusCode === StatusCode.SuccessOK &&
            compositeRes[1].httpStatusCode === StatusCode.SuccessOK &&
            compositeRes[3].httpStatusCode === StatusCode.SuccessOK
        )
    }
    return (
        compositeRes[0].httpStatusCode === StatusCode.SuccessOK &&
        compositeRes[1].httpStatusCode === StatusCode.SuccessOK
    )
}

const buildCompositeBody200 = (objName, objs) => {
    const objsToDo = _.cloneDeep(objs)
    const idList = []
    const length = objsToDo.length
    const q = genGetAllFieldsQueryByObjName(objName)
    for (let i = 0; i < length; i++) {
        idList.push(`id = '${objsToDo[i].Id}'`)
        objsToDo[i].attributes = { type: objName }
        delete objsToDo[i]._soupEntryId
    }
    const idListString = idList.join(' or ')
    const objsToInsert = {
        allOrNone: false,
        records: objsToDo
    }
    const queryBody = {
        method: 'GET',
        url: `/services/data/${CommonParam.apiVersion}/query/?q=${q} WHERE ${idListString}`,
        referenceId: `get${objName}`
    }
    const updateBody = {
        method: 'PATCH',
        url: `/services/data/${CommonParam.apiVersion}/composite/sobjects`,
        referenceId: `ref${objName}s`,
        body: objsToInsert
    }
    return {
        queryBody,
        updateBody
    }
}

const buildCompositeBody400 = (objName, objs, method, SINGLE_INGEST_MAX_RECORDS, needQueryLatestData) => {
    let objsToDo = JSON.parse(JSON.stringify(objs))
    objsToDo = _.chunk(objsToDo, SINGLE_INGEST_MAX_RECORDS)
    const createBody = []
    const queryBody = []
    const q = genGetAllFieldsQueryByObjName(objName)
    for (let j = 0; j < 2; j++) {
        const length = objsToDo[j].length
        const idList = []
        for (let i = 0; i < length; i++) {
            idList.push(`id = '@{ref${objName}${j}s[${i}].id}'`)
            objsToDo[j][i].attributes = { type: objName }
            delete objsToDo[j][i]._soupEntryId
        }
        createBody.push({
            method,
            url: `/services/data/${CommonParam.apiVersion}/composite/sobjects`,
            referenceId: `ref${objName}${j}s`,
            body: {
                allOrNone: true,
                records: objsToDo[j]
            }
        })
        if (needQueryLatestData) {
            queryBody.push({
                method: 'GET',
                url: `/services/data/${CommonParam.apiVersion}/query/?q=${q} WHERE ${idList.join(' or ')}`,
                referenceId: `get${objName}${j}`
            })
        }
    }
    return {
        createBody,
        queryBody
    }
}

/**
 * @description composite sync function encapsulation, the max records length is 400
 * @param objName
 * @param objs
 * @param method
 * @param needQueryLatestData
 */
export const ingestObjsFromLocal400 = (objName: string, objs: any[], method: string, needQueryLatestData) => {
    const allOrNone = objName !== 'Lead__x'
    const SINGLE_INGEST_MAX_RECORDS = 200
    const objsLength = objs.length
    if (objsLength > SINGLE_INGEST_MAX_RECORDS) {
        const { createBody, queryBody } = buildCompositeBody400(
            objName,
            objs,
            method,
            SINGLE_INGEST_MAX_RECORDS,
            needQueryLatestData
        )
        return new Promise<CommonSyncRes>((resolve, reject) => {
            compositeCommonCall([...createBody, ...queryBody], { allOrNone })
                .then(async (res) => {
                    const compositeRes = res.data.compositeResponse
                    if (judgeResSuccess(compositeRes, needQueryLatestData)) {
                        if (needQueryLatestData) {
                            const queryResRecords = [...compositeRes[2].body.records, ...compositeRes[3].body.records]
                            try {
                                let data
                                if (method === 'POST') {
                                    addBackSoupEntryId(queryResRecords, objs, objsLength)
                                    data = await SoupService.upsertDataIntoSoup(objName, queryResRecords, false, true)
                                }
                                if (method === 'PATCH') {
                                    data = await SoupService.upsertDataIntoSoupWithExternalId(
                                        objName,
                                        queryResRecords,
                                        false,
                                        true
                                    )
                                }
                                resolve({
                                    status: 'E0',
                                    method: 'ingestObjsFromLocal400',
                                    objectName: objName,
                                    data
                                })
                            } catch (e) {
                                const rejection = {
                                    status: 'E1',
                                    method: 'ingestObjsFromLocal400',
                                    error: e,
                                    objectName: objName
                                }
                                await storeClassLog(Log.MOBILE_ERROR, 'ingestObjsFromLocal400_E1', rejection)
                                reject(rejection)
                            }
                        } else {
                            resolve({
                                status: 'E0',
                                method: 'ingestObjsFromLocal400',
                                objectName: objName
                            })
                        }
                    } else {
                        const rejection = {
                            status: 'E2',
                            method: 'ingestObjsFromLocal400',
                            error: [
                                compositeRes[0].body,
                                compositeRes[1].body,
                                compositeRes[2].body,
                                compositeRes[3].body
                            ],
                            objectName: objName
                        }
                        await storeClassLog(Log.MOBILE_ERROR, 'ingestObjsFromLocal400_E2', rejection)
                        reject(rejection)
                    }
                })
                .catch(async (err) => {
                    const rejection = {
                        status: 'E0',
                        method: 'ingestObjsFromLocal400',
                        error: err
                    }
                    await storeClassLog(Log.MOBILE_ERROR, 'ingestObjsFromLocal400_E0', rejection)
                    reject(rejection)
                })
        })
    }
    return ingestObjsFromLocal200(objName, objs, method, needQueryLatestData)
}
export const createObjsFromLocal400 = (objName: string, objs: object[], needQueryLatestData) => {
    return ingestObjsFromLocal400(objName, objs, 'POST', needQueryLatestData)
}
export const updateObjsFromLocal400 = (objName: string, objs: object[], needQueryLatestData) => {
    return ingestObjsFromLocal400(objName, objs, 'PATCH', needQueryLatestData)
}

/**
 * @description Sync up records from local database
 * @param objName
 * @param fields
 * @param q
 * @param syncFunction
 * @param isCreated
 * @param needQueryLatestData
 */
export const syncUpObjIngest = (
    objName: string,
    fields: string[],
    q: string,
    syncFunction,
    isCreated,
    needQueryLatestData
) => {
    return new Promise<CommonSyncRes | any>((resolve, reject) => {
        SoupService.retrieveDataFromSoup(objName, {}, fields, q)
            .then(async (res) => {
                if (res.length > 0) {
                    const objsToDo = getObjectStringToBoolean(objName, res, isCreated)
                    const groupedObjsTodo = _.chunk(objsToDo, 400)
                    const reqs = []
                    for (const group of groupedObjsTodo) {
                        reqs.push(syncFunction(objName, group, needQueryLatestData))
                    }
                    return Promise.all(reqs)
                }
                const rejection = {
                    status: 'E4',
                    method: 'syncUpObjIngest'
                }
                reject(rejection)
            })
            .then((res) => {
                resolve(res)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

/**
 * @description Create records from local database
 * @param objName
 * @param fields
 * @param q
 * @param needQueryLatestData
 */
export const syncUpObjCreate = async (objName: string, fields: string[], q: string, needQueryLatestData = true) => {
    const config: SyncUpConfig = {
        name: objName,
        type: 'POST',
        queryLatestData: needQueryLatestData,
        localQuery: q,
        localFields: fields
    }
    const data = await BaseInstance.sfSyncEngine.syncUp(config)
    return data.map((v) => {
        return { data: v }
    })
}

/**
 * @description Update records from local database
 * @param objName
 * @param fields
 * @param q
 * @param needQueryLatestData
 */
export const syncUpObjUpdate = async (objName: string, fields: string[], q: string, needQueryLatestData = true) => {
    const config: SyncUpConfig = {
        name: objName,
        type: 'PATCH',
        queryLatestData: needQueryLatestData,
        localQuery: q,
        localFields: fields
    }
    const data = await BaseInstance.sfSyncEngine.syncUp(config)
    return data.map((v) => {
        return { data: v }
    })
}

/**
 * @description Batch delete records by max 200 ids every call.
 * @param ids
 */
export const syncUpObjDelete = (ids: string[]) => {
    const MAX_ARRAY_SIZE = 200
    return new Promise<CommonSyncRes>((resolve, reject) => {
        const idsArr = _.chunk(ids, MAX_ARRAY_SIZE)
        const reqs = []
        // idsArr.forEach(ids => {
        for (const ids of idsArr) {
            reqs.push(
                compositeCommonCall([], {
                    method: 'DELETE',
                    query: 'composite/sobjects?ids=' + ids.join(',')
                })
            )
        }
        // })
        Promise.all(reqs)
            .then(() => {
                resolve({
                    status: 'E0',
                    method: 'syncUpObjDelete'
                })
            })
            .catch((e) => {
                reject({
                    status: 'E1',
                    method: 'syncUpObjDelete',
                    error: e
                })
            })
    })
}

/**
 * @description For calling the SF to move the cursor to get the next batch of data.
 * @param objName
 * @param totalSize
 * @param queryId
 * @param limit
 * @param updateLocaldata
 * @param allOrNone
 */
export const getRemainedRecords = async (
    objName: string,
    totalSize: number,
    queryId: number,
    limit: number,
    updateLocaldata = true,
    allOrNone = true
) => {
    const REST_ONE_TIME_QUERY_LIMIT = limit
    const count = Math.floor(totalSize / REST_ONE_TIME_QUERY_LIMIT)
    const paths = []
    const sfHttpClient = BaseInstance.sfHttpClient
    for (let i = 1; i <= count; i++) {
        paths.push(`/services/data/${sfHttpClient.apiVersion}/query/${queryId}-${i * REST_ONE_TIME_QUERY_LIMIT}`)
    }
    let compositeLimit: number
    if (REST_ONE_TIME_QUERY_LIMIT <= 2000 && REST_ONE_TIME_QUERY_LIMIT >= 1500) {
        compositeLimit = 1
    } else if (REST_ONE_TIME_QUERY_LIMIT < 1500 && REST_ONE_TIME_QUERY_LIMIT >= 1000) {
        compositeLimit = 2
    } else if (REST_ONE_TIME_QUERY_LIMIT < 1000 && REST_ONE_TIME_QUERY_LIMIT >= 500) {
        compositeLimit = 4
    } else if (REST_ONE_TIME_QUERY_LIMIT < 500) {
        compositeLimit = 5
    } else {
        compositeLimit = 5
    }
    const groupedPaths = _.chunk(paths, compositeLimit)
    const remainedRecords = []
    const reqs = groupedPaths.map((path) => {
        const length = path.length
        const reqBody = []
        for (let i = 0; i < length; i++) {
            reqBody.push({
                method: 'GET',
                url: path[i],
                referenceId: `get${objName}${i}`
            })
        }
        return async () => {
            const res = await sfHttpClient.callComposite(reqBody, { allOrNone: allOrNone })
            const compositeRes = res.data.compositeResponse
            const groupedRecords = []
            for (const singleRes of compositeRes) {
                groupedRecords.push(...singleRes.body.records)
            }
            if (updateLocaldata) {
                await SoupService.upsertDataIntoSoupWithExternalId(objName, groupedRecords, false, true)
            }
            remainedRecords.push(...groupedRecords)
        }
    })
    await reqs.reduce((pro, next) => pro.then(next), Promise.resolve())
    return remainedRecords
}

/**
 * @description For syncing down the records based on the query of an obj.
 * @param objName
 * @param q
 * @param updateLocaldata
 * @param allOrNone
 */
export const syncDownObj = async (objName: string, q: string, updateLocaldata = true, allOrNone = true) => {
    const config = {
        name: objName,
        query: q,
        updateLocalSoup: updateLocaldata,
        allOrNone
    }
    const data = await BaseInstance.sfSyncEngine.syncDown(config)
    if (objName === 'RecordType') {
        await AsyncStorage.setItem('Retrieved_RecordType_Count', data?.length?.toString())
    } else if (objName === 'Asset_Attribute__c') {
        await AsyncStorage.setItem('Retrieved_Asset_Attribute_Count', data?.length?.toString())
    }
    return {
        status: 'E0',
        data
    }
}

export const buildSyncDownObjPromise = (objName: string, q: string) => {
    return async () => {
        await syncDownObj(objName, q)
    }
}

export const syncDownObjByIds = async (
    objName: string,
    fields: Array<string>,
    ids: Array<string>,
    allOrNone = false,
    updateLocaldata = true,
    otherClause = ''
) => {
    const groupedIds = _.chunk(_.chunk(ids, 200), 5)
    const q = `SELECT ${fields.join(',')} FROM ${objName} WHERE Id IN `
    const reqs = []
    const records = []
    groupedIds.forEach((group) => {
        const length = group.length
        const reqBody = []
        for (let i = 0; i < length; i++) {
            reqBody.push({
                method: 'GET',
                url:
                    `/services/data/${CommonParam.apiVersion}/query/?q=` +
                    q +
                    `(${getIdClause(group[i])}) ` +
                    (otherClause ? 'AND ' + otherClause : otherClause),
                referenceId: `get${objName}${i}`
            })
        }
        reqs.push(async () => {
            const res = await compositeCommonCall(reqBody, { allOrNone: allOrNone })
            const data = res.data.compositeResponse
            data.forEach((v) => {
                if (v.httpStatusCode > StatusCode.RedirectMultipleChoices) {
                    throw new Error(JSON.stringify(data))
                }
            })
            const singleReqRecords = []
            for (const singleRes of data) {
                singleReqRecords.push(...singleRes.body.records)
            }
            if (updateLocaldata) {
                await SoupService.upsertDataIntoSoupWithExternalId(objName, singleReqRecords, false, true)
            }
            records.push(...singleReqRecords)
        })
    })
    await reqs.reduce((pro, next) => pro.then(next), Promise.resolve())
    return records
}

export const syncDownObjByIdsAndClause = async (
    objName: string,
    fields: Array<string>,
    ids: Array<string>,
    allOrNone = false,
    updateLocaldata = true,
    otherClause = '',
    filterField = 'Id'
) => {
    const groupedIds = _.chunk(_.chunk(ids, 200), 5)

    const q = `SELECT ${fields.join(',')} FROM ${objName} WHERE ${filterField} IN `
    const reqs = []
    const records = []
    groupedIds.forEach((group) => {
        const length = group.length
        const reqBody = []
        for (let i = 0; i < length; i++) {
            reqBody.push({
                method: 'GET',
                url:
                    `/services/data/${CommonParam.apiVersion}/query/?q=` +
                    q +
                    `(${getIdClause(group[i])}) ` +
                    (otherClause ? 'AND ' + otherClause : otherClause),
                referenceId: `get${objName}${i}`
            })
        }
        reqs.push(async () => {
            const res = await compositeCommonCall(reqBody, { allOrNone: allOrNone })
            const data = res.data.compositeResponse
            data.forEach((v) => {
                if (v.httpStatusCode > StatusCode.RedirectMultipleChoices) {
                    throw new Error(JSON.stringify(data))
                }
            })
            const singleReqRecords = []
            for (const singleRes of data) {
                singleReqRecords.push(...singleRes.body.records)
            }
            if (updateLocaldata) {
                await SoupService.upsertDataIntoSoupWithExternalId(objName, singleReqRecords, false, true)
            }
            records.push(...singleReqRecords)
        })
    })
    await reqs.reduce((pro, next) => pro.then(next), Promise.resolve())
    return records
}

export const syncDownObjWithIds = async (
    objName: string,
    fields: Array<string>,
    ids: Array<string>,
    allOrNone = true,
    updateLocalData = true,
    otherClause = '',
    filterField = 'Id'
) => {
    const q = `SELECT ${fields.join(',')} FROM ${objName} WHERE ${filterField} IN  `
    // 16384 - 105 - q.length - otherClause.length - 10 =  21n
    // 16384, max url legnth
    // 105, base url length,
    // 21, length of '<Salesforce Id>'
    const chunkSize = (16384 - 105 - q.length - otherClause.length - 10) / 40
    // 5, max composite DML call
    const groupedIds = _.chunk(_.chunk(ids, chunkSize), 5)
    const reqs = []
    const records = []

    const remainedReqs = []
    const remainedRecords = []

    groupedIds.forEach((group) => {
        const length = group.length
        const reqBody = []
        for (let i = 0; i < length; i++) {
            const finalQuery = q + `(${getIdClause(group[i])}) ` + (otherClause ? 'AND ' + otherClause : otherClause)
            reqBody.push({
                method: 'GET',
                url: `/services/data/${CommonParam.apiVersion}/query/?q=` + encodeURIComponent(finalQuery),
                referenceId: `get${objName}${i}`
            })
        }
        reqs.push(async () => {
            const res = await compositeCommonCall(reqBody, { allOrNone: allOrNone })
            const data = res.data.compositeResponse
            data.forEach((v) => {
                if (v.httpStatusCode > StatusCode.RedirectMultipleChoices) {
                    throw new Error(JSON.stringify(data))
                }
            })
            const singleReqRecords = []
            for (const singleRes of data) {
                singleReqRecords.push(...singleRes.body.records)
                if (!singleRes.body.done) {
                    remainedReqs.push(async () => {
                        const totalSize = singleRes.body.totalSize
                        const nextRecordsUrl = singleRes.body.nextRecordsUrl
                        // The value of nextRecordsUrl is always like
                        // '/services/data/v51.0/query/01g4S0000096yDeQAI-2000',
                        // so the Id can be got by slice the 27-45.
                        const queryId = nextRecordsUrl.slice(27, 45)
                        const limit = parseInt(nextRecordsUrl.split('-')[1])
                        const subRemainedRecords = await getRemainedRecords(
                            objName,
                            totalSize,
                            queryId,
                            limit,
                            updateLocalData,
                            allOrNone
                        )
                        remainedRecords.push(...subRemainedRecords)
                    })
                }
            }
            if (updateLocalData) {
                await SoupService.upsertDataIntoSoupWithExternalId(objName, singleReqRecords, false, true)
            }
            records.push(...singleReqRecords)
        })
    })

    await reqs.reduce((pro, next) => pro.then(next), Promise.resolve())
    await remainedReqs.reduce((pro, next) => pro.then(next), Promise.resolve())
    if (objName === 'RetailStore') {
        await AsyncStorage.setItem(
            'Retrieved_RetailStore_Count',
            (records?.length + remainedRecords?.length).toString()
        )
    }
    return [...records, ...remainedRecords]
}

// fetch SF data without saving data into local database
export const fetchObjInTime = async (objName: string, query: string) => {
    const result = await syncDownObj(objName, query, false)
    if (result?.status === 'E0') {
        return result?.data || []
    }
}

export const syncDownChunkObj = (
    objName: string,
    queryPrefix: string,
    ids: string[],
    chunkSize = 300,
    updateLocaldata: boolean = false
) => {
    const sliceArray = _.chunk(ids, chunkSize)
    const promiseArr = []

    sliceArray.forEach((item) => {
        const query = `${queryPrefix} IN (${item.join(',')})`

        const promise = new Promise((resolve, reject) => {
            syncDownObj(objName, query, updateLocaldata)
                .then((res) => {
                    resolve(res.data)
                })
                .catch((err) => reject(err))
        })
        promiseArr.push(promise)
    })

    return new Promise((resolve, reject) => {
        Promise.all(promiseArr)
            .then((res) => {
                const resArr = _.flatten(res)
                resolve(resArr)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const matchLocalRecordForNotification = async (newRecords: any[]) => {
    const localRecords = await SoupService.retrieveDataFromSoup(
        'Notification',
        {},
        ['Id', 'read', 'seen'],
        `SELECT {Notification:Id},{Notification:read},{Notification:seen},{Notification:_soupEntryId}
            FROM {Notification} WHERE {Notification:Id} IS NOT NULL ORDER BY {Notification:Id}`
    )
    const localRecordsLength = localRecords.length
    for (const newRecord of newRecords) {
        newRecord.Id = newRecord.id
        if (localRecordsLength > 0) {
            const index = binarySearchWithoutRecursion(localRecords, 0, localRecordsLength - 1, newRecord.Id)
            if (index > -1) {
                newRecord._soupEntryId = localRecords[index]._soupEntryId
            }
        }
    }
}

/**
 * @description Single batch for syncing down the notification recursively.
 * @param beforeDatetime
 * @param targetDatetime
 */
export const syncDownNotificationBatch = async (beforeDatetime, targetDatetime) => {
    // the max length of single batch is 50
    const MAX_LENGTH = 50
    const res = await restDataCommonCall(
        `connect/notifications?size=50&trimMessages=false&before=${beforeDatetime}`,
        'GET'
    )
    const notifications = res.data.notifications
    await matchLocalRecordForNotification(notifications)
    await SoupService.upsertDataIntoSoup('Notification', notifications, false, true)
    if (notifications.length === MAX_LENGTH && notifications[MAX_LENGTH - 1].lastModified > targetDatetime) {
        await syncDownNotificationBatch(notifications[MAX_LENGTH - 1].lastModified, targetDatetime)
    }
}

/**
 * @description For syncing down the notification recursively.
 * @param beforeDatetime
 * @param targetDatetime
 */
export const syncDownNotification = (beforeDatetime, targetDatetime) => {
    return new Promise<CommonSyncRes>((resolve, reject) => {
        syncDownNotificationBatch(beforeDatetime, targetDatetime)
            .then(() => {
                resolve({
                    status: 'E0',
                    method: 'syncDownNotification'
                })
            })
            .catch((e) => {
                reject({
                    status: 'E2',
                    error: e,
                    method: 'syncDownNotification'
                })
            })
    })
}

export const syncDownNotificationDuringInitSync = () =>
    syncDownNotification(new Date().toISOString(), moment().subtract(90, 'day').toISOString())

export const syncPictures = () => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup('PictureData', {}, [], null, [
            "WHERE {PictureData:IsUploaded} IN ('0', false, 'false') AND {PictureData:Type}='Signature' "
        ]).then((pictures: any) => {
            const picPromiseArr = pictures.map((pic) => {
                return new Promise((resolve, reject) => {
                    updateAssessmentTask(pic.TargetId, pic.SkipReason, pic.ManagerName, pic.Data)
                        .then((res) => {
                            resolve(res)
                        })
                        .catch((err) => {
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'updateAssessmentTask',
                                `upload picture failed: ${JSON.stringify(err)}`
                            )
                            reject(err)
                        })
                })
            })
            Promise.all(picPromiseArr)
                .then(() => {
                    pictures.forEach((pic: any) => {
                        pic.IsUploaded = 'true'
                    })
                    resolve(SoupService.upsertDataIntoSoup('PictureData', pictures))
                })
                .catch((err) => {
                    reject(err)
                })
        })
    })
}

export const syncPicturesData = (idArray: string[]) => {
    const maxDataLength = 3
    const selectdataLength = -3
    const sortClass = (imgData: []) => {
        const groupBy = (array: [], f: Function) => {
            const groups: {
                [key: string]: []
            } = {}
            array.forEach((item) => {
                const group = JSON.stringify(f(item))
                groups[group] = groups[group] || []
                groups[group].push(item)
            })
            return Object.keys(groups).map((group) => {
                return groups[group]
            })
        }
        return groupBy(imgData, (item: any) => {
            return item.TargetId
        })
    }
    return new Promise((resolve, reject) => {
        const queryArr = idArray.map((currentId) => {
            return `{PictureData:TargetId} = '${currentId}'`
        })
        let queryStr = CapturePictureQueries.getCapturePictureQuery.queryTargetPicture
        if (queryArr.length > 0) {
            queryStr += ' AND '
            queryStr += queryArr.join(' OR ')
        }
        let rawData: any[] = []
        const hasntTargetIdQueryStr = CapturePictureQueries.getCapturePictureQuery.queryAllPicture
        SoupService.retrieveDataFromSoup(
            'PictureData',
            {},
            CapturePictureQueries.getCapturePictureQuery.targetValues,
            idArray.length > 0 ? queryStr : hasntTargetIdQueryStr
        ).then((res: []) => {
            rawData = JSON.parse(JSON.stringify(res))
            const newArr = sortClass(res)
            if (newArr.length === 0) {
                resolve([])
                return
            }
            const resultArr = newArr.map((sameIdArr: any) => {
                const photoTypeArr = sameIdArr.map((imgItem: { Type: any; Data: any }) => {
                    return {
                        photoType: imgItem.Type,
                        photoString: imgItem.Data
                    }
                })
                const raresultArr =
                    photoTypeArr.length > maxDataLength ? photoTypeArr.slice(selectdataLength) : photoTypeArr
                return {
                    photoList: raresultArr,
                    Id: sameIdArr[0].TargetId
                }
            })
            const picPromiseArr = resultArr.map((item: any) => {
                return new Promise((resolve, reject) => {
                    uploadWorkOrderImg(item.photoList, item.Id)
                        .then((res) => {
                            resolve(res)
                        })
                        .catch((err) => {
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'syncPicturesData',
                                `upload assessment failed: ${getStringValue(err)}`
                            )
                            reject({
                                status: 'E2',
                                error: err,
                                method: 'syncPicturesData'
                            })
                        })
                })
            })

            Promise.all(picPromiseArr)
                .then((res) => {
                    const uploadArr: any[] = []
                    rawData.forEach((result: any) => {
                        result.IsUploaded = 'true'
                        uploadArr.push(result)
                    })
                    SoupService.upsertDataIntoSoup('PictureData', uploadArr).then(() => {
                        resolve(res)
                    })
                })
                .catch((err) => {
                    reject(err)
                })
        })
    })
}

export const getObjByName = (objName: string) => {
    return CommonParam.objs.find((obj) => {
        return obj.name === objName
    })
}

const prepareRequestBody = (record) => {
    const requestBody = {}
    const soupName = record.attributes.type
    const soup = getObjByName(soupName)
    let uri = '/services/data/v51.0/sobjects/' + soupName
    soup.fieldList.forEach((field) => {
        if (!field.skipSyncUp && field.name !== 'Id') {
            requestBody[field.name] = record[field.name] || null

            if (typeof record[field.name] === 'boolean') {
                requestBody[field.name] = record[field.name]
            }
        }
    })
    if (record.Id) {
        uri += '/' + record.Id
    }
    if (record.relatedField && record.refId && !record.Id && !requestBody[record.relatedField]) {
        requestBody[record.relatedField] = '@{' + record.refId + '.id}'
    }
    return {
        requestBody,
        uri
    }
}

export const handleRelationshipUpsert = (records) => {
    const requestArr = []
    let relatedArr = records
    while (relatedArr.length > 0) {
        const record = relatedArr.shift()
        const body = prepareRequestBody(record)
        requestArr.push({
            method: record.Id ? 'PATCH' : 'POST',
            url: body.uri,
            referenceId: record.attributes.type + record._soupEntryId,
            body: body.requestBody
        })
        if (record.relatedList) {
            relatedArr = relatedArr.concat(
                record.relatedList.map((rRecord) => {
                    rRecord.refId = record.attributes.type + record._soupEntryId
                    return rRecord
                })
            )
        }
    }

    return callCompositeAPI(requestArr)
}

export const getRecordTypeIdIfNull = async () => {
    if (!CommonParam.weeklyRcdId || !CommonParam.dailyRcdId) {
        const weeklyRecordTypeId = await getRecordTypeIdByDeveloperName('Visit_List_Group', 'Visit_List__c')
        const dailyRecordTypeId = await getRecordTypeIdByDeveloperName('Daily_Visit_List', 'Visit_List__c')
        CommonParam.weeklyRcdId = weeklyRecordTypeId || null
        CommonParam.dailyRcdId = dailyRecordTypeId || null
    }

    return Promise.resolve(null)
}

export const syncVisitListData = () => {
    const vlList = MerchandiserConfig.objs.find((soup) => soup.name === 'Visit_List__c')

    return getRecordTypeIdIfNull()
        .then(() => {
            return SoupService.retrieveDataFromSoup('Visit_List__c', {}, [], null, [
                ` WHERE {Visit_List__c:__locally_updated__} IN ("1", "true", true, 1)
             OR {Visit_List__c:__locally_created__} IN ("1", "true", true, 1)
             OR {Visit_List__c:RecordType.DeveloperName} = "Visit_List_Group"`
            ])
        })
        .then((vList) => {
            let weeklyList = vList.filter((list) => list.RecordTypeId === CommonParam.weeklyRcdId)
            weeklyList.forEach((wl) => {
                wl.relatedList = []
                wl.Push_Flag__c = wl.Push_Flag__c === '1'
            })
            const dailyList = vList.filter((l) => l.RecordTypeId === CommonParam.dailyRcdId)
            dailyList.forEach((dl) => {
                dl.relatedField = 'Visit_List_Group__c'
                dl.Push_Flag__c = dl.Push_Flag__c === '1'
                setupLocationByCoordinates(dl, true, true)

                const find = weeklyList.find(
                    (wl) =>
                        dl.Visit_List_Group__c === wl.Id ||
                        dl.Visit_List_Group__c === wl.externalId ||
                        !dl.Visit_List_Group__c
                )
                if (find) {
                    dl.Visit_List_Group__c = find.Id || null
                    find.relatedList.push(dl)
                }
                storeClassLog(Log.MOBILE_INFO, 'UpdateVisitList - Daily', `updateVLVisits: ${JSON.stringify(dl)}`)
            })
            weeklyList = weeklyList.filter((wl) => wl.relatedList.length > 0)
            let vlLogs = 'empty'
            if (weeklyList.length > 0) {
                vlLogs = weeklyList[0].relatedList.map((vl) => vl.Id).join(',')
            }
            recordSyncingLogs(
                `update visit list:  ${vlLogs} ${weeklyList.map((vl) => vl.Id).join(',')} ${JSON.stringify(weeklyList)}`
            )
            return handleRelationshipUpsert(weeklyList)
        })
        .then(() => {
            return SoupService.retrieveDataFromSoup('Visit_List__c', {}, ['_soupEntryId'], null, [
                ' WHERE {Visit_List__c:Id} IS NULL'
            ])
        })
        .then((res) => {
            return SoupService.removeRecordFromSoup(
                'Visit_List__c',
                res.map((r) => r._soupEntryId)
            )
        })
        .then(() => {
            return SyncService.syncDownObjWithCond(vlList)
        })
        .catch((err) => {
            storeClassLog(Log.MOBILE_ERROR, 'MD-StartMyDay', `Sync vl failed: ${getStringValue(err)}`)
        })
}

/**
 * @description Query objects by soql. Use it when the number of objects you want to query is less than 5 and the number of records of each object is less than 2000.
 * @param objs
 */
export const compositeQueryObjsBySoql = (objs: CompositeSyncDownBody[]) => {
    return new Promise<CommonSyncRes>((resolve, reject) => {
        compositeCommonCall(
            objs.map((obj) => {
                return {
                    method: 'GET',
                    url: `/services/data/${CommonParam.apiVersion}/query/?q=${obj.q}`,
                    referenceId: obj.referenceId
                }
            }),
            { allOrNone: false }
        )
            .then((res) => {
                const data = res.data.compositeResponse
                data.forEach((v) => {
                    if (v.httpStatusCode > StatusCode.RedirectMultipleChoices) {
                        reject({
                            status: 'E2',
                            method: 'compositeQueryObjsBySoql',
                            data: v
                        })
                    }
                })
                const ops = []
                _.forEach(data, (v, k) => {
                    if (v.body.totalSize > 0) {
                        const records = v.body.records
                        const objName = objs[k].name
                        ops.push(SoupService.upsertDataIntoSoupWithExternalId(objName, records, false, true))
                    }
                })
                Promise.all(ops)
                    .then(() => {
                        resolve({
                            status: 'E0',
                            method: 'compositeQueryObjsBySoql',
                            data
                        })
                    })
                    .catch(async (e) => {
                        const rejection = {
                            status: 'E2',
                            method: 'compositeQueryObjsBySoql',
                            error: e
                        }
                        await storeClassLog(Log.MOBILE_ERROR, 'compositeQueryObjsBySoql_E2', rejection)
                        reject(rejection)
                    })
            })
            .catch(async (err) => {
                const rejection = {
                    status: 'E1',
                    method: 'compositeQueryObjsBySoql',
                    error: err
                }
                await storeClassLog(Log.MOBILE_ERROR, 'compositeQueryObjsBySoql_E1', rejection)
                reject(rejection)
            })
    })
}
/**
 * @description Sync up data directly from the memory.
 * @param objName
 * @param objs
 * @param syncFunction
 * @param isCreated
 * @param needQueryLatestData
 */
export const syncUpObjIngestFromMem = (objName: string, objs, syncFunction, isCreated, needQueryLatestData) => {
    return new Promise<CommonSyncRes | any>((resolve, reject) => {
        const objsToDo = getObjectStringToBoolean(objName, objs, isCreated)
        const groupedObjsTodo = _.chunk(objsToDo, 400)
        const reqs = []
        for (const group of groupedObjsTodo) {
            reqs.push(syncFunction(objName, group, needQueryLatestData))
        }
        return Promise.all(reqs)
            .then((res) => {
                resolve(res)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

/**
 * @description Create records from memory
 * @param objName
 * @param objs
 * @param needQueryLatestData
 */
export const syncUpObjCreateFromMem = async (objName: string, objs: any[], needQueryLatestData = true) => {
    // return syncUpObjIngestFromMem(objName, objs, createObjsFromLocal400, true, needQueryLatestData)
    const config: SyncUpConfig = {
        name: objName,
        type: 'POST',
        records: objs,
        queryLatestData: needQueryLatestData
    }
    const data = await BaseInstance.sfSyncEngine.syncUp(config)
    return data.map((v) => {
        return { data: v }
    })
}

/**
 * @description Update records from memory
 * @param objName
 * @param objs
 * @param needQueryLatestData
 */
export const syncUpObjUpdateFromMem = async (objName: string, objs: any[], needQueryLatestData = true) => {
    // return syncUpObjIngestFromMem(objName, objs, updateObjsFromLocal400, false, needQueryLatestData)
    const config: SyncUpConfig = {
        name: objName,
        type: 'PATCH',
        records: objs,
        queryLatestData: needQueryLatestData
    }
    const data = await BaseInstance.sfSyncEngine.syncUp(config)
    return data.map((v) => {
        return { data: v }
    })
}

export const syncOfflineUpdateRecords = (objName, updateReq) => {
    const { updateBody, queryBody } = buildCompositeBody200(objName, updateReq)
    return new Promise<CommonSyncRes>((resolve, reject) => {
        compositeCommonCall([updateBody, queryBody], { allOrNone: false })
            .then(async (res) => {
                const compositeRes = res.data.compositeResponse
                const errorRecords = []
                if (
                    compositeRes[0].httpStatusCode === StatusCode.SuccessOK &&
                    compositeRes[1].httpStatusCode === StatusCode.SuccessOK
                ) {
                    const queryResRecords = compositeRes[1].body.records
                    compositeRes[0].body.forEach((record) => {
                        if (!record.success) {
                            errorRecords.push(record)
                        }
                    })
                    try {
                        const data = await SoupService.upsertDataIntoSoupWithExternalId(
                            objName,
                            queryResRecords,
                            false,
                            true
                        )
                        if (errorRecords.length > 0) {
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'MD-Common-Composite',
                                `error info: ${getStringValue(errorRecords)}`
                            )
                        }
                        resolve({
                            status: 'E0',
                            method: 'ingestObjsFromLocal200',
                            objectName: objName,
                            data
                        })
                    } catch (e) {
                        const rejection = {
                            status: 'E1',
                            method: 'ingestObjsFromLocal200',
                            error: e,
                            objectName: objName
                        }
                        storeClassLog(Log.MOBILE_ERROR, 'ingestObjsFromLocal200_E1', rejection)
                        reject(rejection)
                    }
                } else {
                    const rejection = {
                        status: 'E2',
                        method: 'ingestObjsFromLocal200',
                        error: [
                            compositeRes[0].body[0].errors,
                            compositeRes[1].body,
                            compositeRes[0].body[0].errors,
                            compositeRes[1].body[0].errors
                        ],
                        objectName: objName
                    }
                    storeClassLog(Log.MOBILE_ERROR, 'ingestObjsFromLocal200_E2', rejection)
                    reject(rejection)
                }
            })
            .catch(async (err) => {
                const rejection = {
                    status: 'E0',
                    method: 'ingestObjsFromLocal400',
                    error: err
                }
                storeClassLog(Log.MOBILE_ERROR, 'ingestObjsFromLocal200_E0', rejection)
                reject(rejection)
            })
    })
}

export const syncUpObjOffline = (objName: string, objs: any[]) => {
    const objsToDo = getObjectStringToBoolean(objName, objs, false)
    objsToDo.forEach((r) => {
        ;['__local__', '__locally_created__', '__locally_updated__', '__locally_deleted__'].forEach(
            (field) => delete r[field]
        )
    })
    const updatedRecords = _.chunk(
        objsToDo.filter((r) => r.Id),
        200
    )
    const insertRecords = _.chunk(
        objsToDo.filter((r) => !r.Id),
        400
    )
    const insertReqs = insertRecords.map((insertReq) => async () => await syncUpObjCreateFromMem(objName, insertReq))
    const updateReqs = updatedRecords.map((updateReq) => async () => await syncOfflineUpdateRecords(objName, updateReq))
    return updateReqs.concat(insertReqs).reduce((pro, next) => pro.then(next), Promise.resolve())
}

export const executePromiseQueueWithReturn = async (promiseQueue: Array<() => Promise<any>>) => {
    const result = []
    for (const promise of promiseQueue) {
        result.push(await promise())
    }
    return result
}

export const compareIdsWithLocal = async (objName: string, ids: string[]) => {
    const localIds = await BaseInstance.sfSoupEngine.retrieveIds(objName)
    const idList = ids.map((value) => {
        return { Id: value }
    })
    return _.differenceBy(localIds, idList, 'Id')
}

export const removeLocalOutOfDateRecords = async (objName: string, newRecords: { Id: string }[]) => {
    const newRecordsIdList = newRecords.map((v) => v.Id)
    const recordsToRemove = (await compareIdsWithLocal(objName, newRecordsIdList)).map((v) => v._soupEntryId)
    await BaseInstance.sfSoupEngine.removeRecords(objName, recordsToRemove)
}

export const buildSyncDownPromise = (objName: string, q: string) => {
    return async () => {
        return await BaseInstance.sfSyncEngine.syncDown({
            name: objName,
            query: q,
            allOrNone: true,
            updateLocalSoup: true
        })
    }
}

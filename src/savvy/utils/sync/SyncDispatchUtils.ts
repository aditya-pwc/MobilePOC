import { syncDownNotificationDuringInitSync, syncDownObj, syncDownObjWithIds } from '../../api/SyncUtils'
import { Log } from '../../../common/enums/Log'
import { SyncCustomFuncObj, SyncDownBody } from '../../../common/interface/SyncInterface'
import { checkLeadWiringAndStore, getSyncDownLeads } from '../LeadUtils'
import { promiseQueue } from '../../api/InitSyncUtils'
import { getUserStats } from '../UserUtils'
import { CommonParam } from '../../../common/CommonParam'
import moment from 'moment/moment'
import _ from 'lodash'
import { syncDownBusinessSegmentPicklistItem } from '../../api/ApexApis'
import { generateSurveyData } from '../SurveyUtils'
import InStoreMapService from '../../service/InStoreMapService'
import BreadcrumbsService from '../../service/BreadcrumbsService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { exeAsyncFunc } from '../../../common/utils/CommonUtils'

const getCustomFunc: () => SyncCustomFuncObj = () => {
    return {
        getSyncDownLeads,
        getUserStats,
        syncDownBusinessSegmentPicklistItem,
        syncDownNotificationDuringInitSync,
        generateSurveyData,
        checkLeadWiringAndStore,
        downloadImages: InStoreMapService.downloadImages,
        getBreadcrumbsToken: BreadcrumbsService.getBreadcrumbsToken
    }
}

const getUserId = () => {
    return CommonParam.userId
}

const getUserRoute = () => {
    return CommonParam.userRouteId
}

const customInfoMap = () => {
    return {
        APPLY_CURRENT_USER_ID: getUserId(),
        APPLY_CURRENT_USER_ROUTE: getUserRoute(),
        APPLY_ONE_WEEK_AGO: moment().add(-8, 'days').toISOString()
    }
}

const replaceQuery = (o) => {
    const initClauseReplacement = o.initClauseReplacement
    const incrClauseReplacement = o.incrClauseReplacement
    let processedInitClause = o.initClause || ''
    let processedIncrClause = o.incrClause || ''
    if (initClauseReplacement?.length > 0) {
        for (const r of initClauseReplacement) {
            processedInitClause = processedInitClause.replace(r, customInfoMap()[r])
        }
    }
    if (incrClauseReplacement?.length > 0) {
        for (const r of incrClauseReplacement) {
            processedIncrClause = processedIncrClause.replace(r, customInfoMap()[r])
        }
    }
    return {
        processedInitClause,
        processedIncrClause
    }
}

const genLastModifiedDateClause = (o, lastSyncTime) => {
    const lastModifiedDateFieldName = o.externalObject ? 'LastModifiedDate__c' : 'LastModifiedDate'
    let q = `(${lastModifiedDateFieldName}>${lastSyncTime}`
    if (o.parentObjects?.length > 0) {
        o.parentObjects.forEach((parentObject) => {
            q += ` OR ${parentObject}.LastModifiedDate>${lastSyncTime}`
        })
    }
    q += ')'
    return q
}

const genQuery = (o, incremental, lastSyncTime) => {
    const { processedInitClause, processedIncrClause } = replaceQuery(o)
    let q = `SELECT ${o.fields.join(',')} FROM ${o.objName} `
    if (incremental) {
        if (processedIncrClause) {
            q += ' WHERE ' + processedIncrClause
        }
    } else {
        if (processedInitClause) {
            q += ' WHERE ' + processedInitClause
        }
    }
    if (incremental && lastSyncTime) {
        q += (q.indexOf('WHERE') > -1 ? ' AND ' : ' WHERE ') + genLastModifiedDateClause(o, lastSyncTime)
    }
    return q
}

const genClause = (o, incremental, lastSyncTime) => {
    const { processedInitClause, processedIncrClause } = replaceQuery(o)
    let clause = (incremental ? processedIncrClause : processedInitClause) || ''
    if (incremental && lastSyncTime) {
        clause += (clause === '' ? ' ' : ' AND ') + genLastModifiedDateClause(o, lastSyncTime)
    }
    return clause
}

const convertErrorToString = (e) => {
    if (typeof e === 'string') {
        return e
    }
    if (e instanceof Error) {
        return e.toString()
    }
    return JSON.stringify(e)
}

const handleError = (e, o, incremental) => {
    const eObj = {
        e: convertErrorToString(e),
        o,
        incremental
    }
    if (o.failedPass) {
        storeClassLog(Log.MOBILE_ERROR, JSON.stringify(eObj), e)
    } else {
        throw new Error(JSON.stringify(eObj))
    }
}

const getNestedValue = function (model, path, def?) {
    path = path || ''
    model = model || {}
    def = typeof def === 'undefined' ? '' : def
    const parts = path.split('.')
    if (parts.length > 1 && typeof model[parts[0]] === 'object') {
        return getNestedValue(model[parts[0]], parts.splice(1).join('.'), def)
    }
    return model[parts[0]] || def
}

const storeTempIds = (refId, usedIdFields, data, dependentIds) => {
    let dId = {}
    if (!_.isEmpty(dependentIds) && !_.isEmpty(dependentIds[refId])) {
        dId = _.cloneDeep(dependentIds[refId])
    }
    const tempDId = {}
    usedIdFields.forEach((item) => {
        if (typeof dId[item] !== 'object') {
            dId[item] = [[], []]
        }
        tempDId[item] = []
    })

    data.forEach((d) => {
        usedIdFields.forEach((item) => {
            const v = getNestedValue(d, item)
            v && tempDId[item].push(v)
        })
    })

    _.forEach(tempDId, (value, key) => {
        const oldList = [...dId[key][0], ...dId[key][1]]
        const newList = _.difference(_.uniq(_.compact(tempDId[key])), oldList)
        dId[key] = [oldList, newList]
    })
    dependentIds[refId] = dId
}

const genCustomFunc = (o: SyncDownBody, incremental, dependentIds) => async () => {
    try {
        if (o.usedIdFields?.length > 0) {
            const data = await getCustomFunc()[o.func].apply(null, o.funcParas)
            storeTempIds(o.refId, o.usedIdFields, data, dependentIds)
        } else {
            await getCustomFunc()[o.func].apply(null, o.funcParas)
        }
    } catch (e) {
        handleError(e, o, incremental)
    }
}

const genCommonSyncDownPromise = (o, incremental, dependentIds, lastSyncTime) => async () => {
    try {
        if (o.usedIdFields?.length > 0) {
            const { data } = await syncDownObj(o.objName, genQuery(o, incremental, lastSyncTime), true, o.allOrNone)
            storeTempIds(o.refId, o.usedIdFields, data, dependentIds)
        } else {
            await syncDownObj(o.objName, genQuery(o, incremental, lastSyncTime), true, o.allOrNone)
        }
    } catch (e) {
        handleError(e, o, incremental)
    }
}

const genIdInSyncDownPromise = (o, incremental, dependentIds, lastSyncTime) => async () => {
    try {
        const oldIdList = dependentIds[o.idInClause.dependId][o.idInClause.dependField][0]
        const newIdList = dependentIds[o.idInClause.dependId][o.idInClause.dependField][1]

        if (o.usedIdFields?.length > 0) {
            let oldData = []
            let newData = []
            if (oldIdList.length > 0) {
                oldData = await syncDownObjWithIds(
                    o.objName,
                    o.fields,
                    oldIdList,
                    o.allOrNone,
                    true,
                    genClause(o, incremental, lastSyncTime),
                    o.idInClause.field
                )
            }
            if (newIdList.length > 0) {
                newData = await syncDownObjWithIds(
                    o.objName,
                    o.fields,
                    newIdList,
                    o.allOrNone,
                    true,
                    genClause(o, incremental, ''),
                    o.idInClause.field
                )
            }
            storeTempIds(o.refId, o.usedIdFields, [...oldData, ...newData], dependentIds)
        } else {
            if (oldIdList.length > 0) {
                await syncDownObjWithIds(
                    o.objName,
                    o.fields,
                    oldIdList,
                    o.allOrNone,
                    true,
                    genClause(o, incremental, lastSyncTime),
                    o.idInClause.field
                )
            }
            if (newIdList.length > 0) {
                await syncDownObjWithIds(
                    o.objName,
                    o.fields,
                    newIdList,
                    o.allOrNone,
                    true,
                    genClause(o, incremental, ''),
                    o.idInClause.field
                )
            }
        }
    } catch (e) {
        handleError(e, o, incremental)
    }
}

export const shouldSkip = (incremental, o) => {
    return (incremental && !o.incrActive) || (!incremental && !o.initActive)
}

export const dispatchSyncDown = async (
    syncDownList: Array<SyncDownBody>,
    incremental: boolean,
    lastSyncTime: string
) => {
    const reqs = []
    let dependentIds = {}
    if (incremental) {
        const lastDependentIdsString = await AsyncStorage.getItem('lastSyncDependentIds')
        dependentIds = JSON.parse(lastDependentIdsString) || {}
    }
    for (const o of syncDownList) {
        if (shouldSkip(incremental, o)) {
            continue
        }
        switch (o.type) {
            case 'func':
                reqs.push(genCustomFunc(o, incremental, dependentIds))
                break
            case 'idIn':
                reqs.push(genIdInSyncDownPromise(o, incremental, dependentIds, lastSyncTime))
                break
            case 'common':
                reqs.push(genCommonSyncDownPromise(o, incremental, dependentIds, lastSyncTime))
                break
            default:
                break
        }
    }
    return {
        reqs,
        dependentIds
    }
}

export const exeSyncDown = async (
    syncDownList: Array<SyncDownBody>,
    incremental: boolean,
    lastSyncTime?: string,
    setProgress?
) => {
    const { reqs, dependentIds } = await dispatchSyncDown(syncDownList, incremental, lastSyncTime)
    await promiseQueue(reqs, setProgress)
    await exeAsyncFunc(async () => {
        await AsyncStorage.setItem('lastSyncDependentIds', JSON.stringify(dependentIds))
    })
}

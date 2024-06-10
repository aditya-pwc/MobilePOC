import AsyncStorage from '@react-native-async-storage/async-storage'
import { SyncHelper } from '../infrastructure/SmartSyncHelper'
import { FileHelper } from '../infrastructure/FileHelper'
import { CommonParam } from '../../common/CommonParam'
import { syncDownObj } from '../api/SyncUtils'
import _ from 'lodash'
import { Log } from '../../common/enums/Log'
import { transferDateTimeInQuery } from '../utils/TimeZoneUtils'
import { getStringValue } from '../utils/LandingUtils'
import { isPersonaPSR } from '../../common/enums/Persona'
import { getMyDayVisitForPSR } from '../utils/InnovationProductUtils'
import { storeClassLog } from '../../common/utils/LogUtils'

const syncHelper = SyncHelper()
const fileHelper = FileHelper()
export const condRegExMap = () => {
    return {
        APPLY_CURRENT_USER_ID: ["'" + CommonParam.userId + "'"],
        APPLY_USER_LOCATION: ["'" + CommonParam.userLocationId + "'"],
        APPLY_USER_ROUTE_ID: ["'" + CommonParam.userRouteId + "'"],
        APPLY_VISIT_STORE: _.chunk(CommonParam.uniqueStoreIds, 100).map((arr) => {
            return "('" + arr.join("','") + "')"
        }),
        APPLY_CUSTOMER_ID: _.chunk(CommonParam.uniqueAccountIds, 100).map((arr) => {
            return "('" + arr.join("','") + "')"
        })
    }
}

const condRegExMapForNew = (newStoreIds: string[], newAccountIds: string[]) => {
    return {
        APPLY_CURRENT_USER_ID: ["'" + CommonParam.userId + "'"],
        APPLY_USER_LOCATION: ["'" + CommonParam.userLocationId + "'"],
        APPLY_USER_ROUTE_ID: ["'" + CommonParam.userRouteId + "'"],
        APPLY_VISIT_STORE: _.chunk(newStoreIds, 10).map((arr) => {
            return "('" + arr.join("','") + "')"
        }),
        APPLY_CUSTOMER_ID: _.chunk(newAccountIds, 10).map((arr) => {
            return "('" + arr.join("','") + "')"
        })
    }
}

export const condRegExMapMM = () => {
    return {
        APPLY_CURRENT_USER_ID: "'" + CommonParam.userId + "'",
        APPLY_USER_LOCATION: "'" + CommonParam.userLocationId + "'",
        APPLY_USER_ROUTE_ID: "'" + CommonParam.userRouteId + "'",
        APPLY_VISIT_STORE: "('" + CommonParam.uniqueStoreIds.join("','") + "')",
        APPLY_CUSTOMER_ID: "('" + CommonParam.uniqueAccountIds.join("','") + "')"
    }
}

export const processRegExpMap = (finalQueries, regExpMap) => {
    Object.keys(regExpMap).forEach((regEx) => {
        finalQueries.forEach((q) => {
            if (q.indexOf(regEx) > -1) {
                finalQueries.pop()
                const arr = regExpMap[regEx]
                arr.forEach((element) => {
                    const newQuery = q.replaceAll(regEx, element)
                    finalQueries.push(newQuery)
                })
            }
        })
    })
    return finalQueries
}

export const addLastModifiedDate = (incrementalQuery, lastModifiedDate) => {
    if (incrementalQuery.indexOf('WHERE') > -1) {
        incrementalQuery += ' AND LastModifiedDate >= ' + lastModifiedDate
    } else {
        incrementalQuery += ' WHERE LastModifiedDate >= ' + lastModifiedDate
    }
    return incrementalQuery
}

export const buildSyncDownQuery = (query, regExpMap, withLastModified = false) => {
    let incrementalQuery = transferDateTimeInQuery(query)
    if (withLastModified) {
        incrementalQuery = addLastModifiedDate(incrementalQuery, CommonParam.lastModifiedDate)
    }
    return processRegExpMap([incrementalQuery], regExpMap)
}

export const buildSingleSyncDownQuery = (query, withLastModified = false) => {
    const regExpMap = condRegExMap()
    return buildSyncDownQuery(query, regExpMap, withLastModified)
}

export const buildManagerSyncDownQuery = (query, regExpMap) => {
    let increQuery = transferDateTimeInQuery(query)
    Object.keys(regExpMap).forEach((regEx) => {
        while (increQuery.includes(regEx)) {
            increQuery = _.replace(increQuery, regEx, function (match) {
                return regExpMap[match]
            })
        }
    })
    return increQuery
}

const syncDownObjWithCond = async (model, regExpMap, withLastModified = false, isInitSync = true) => {
    const syncDownQuerys = buildSyncDownQuery(model.initQuery, regExpMap, withLastModified)
    const promiseArr = []
    syncDownQuerys.forEach((syncDownQuery) => {
        if (model.lastmodifiedlField === '') {
            promiseArr.push(syncDownObj(model.name, syncDownQuery))
            return
        }
        promiseArr.push(syncDownObj(model.name, syncDownQuery))
    })
    await Promise.all(promiseArr)
    if (model.syncDownCB && isInitSync) {
        await model.syncDownCB()
    }
}

const syncDownByPersona = async (allModel, withLastModified = false, isInitSync = true) => {
    const regExpMap = condRegExMap()
    if (allModel.length > 0) {
        const model = allModel.splice(0, 1)[0]
        await syncDownObjWithCond(model, regExpMap, withLastModified && !model.noLastModifiedField, isInitSync)
        return syncDownByPersona(allModel, withLastModified, isInitSync)
    }
    return Promise.resolve()
}

export const getLatestData = () => {
    const newSyncList = ['Visit', 'Visit_List__c', 'Shipment', 'Order', 'Breadcrumb_Timestamps__c']

    // noNeedList: [ 'User', 'Route_Sales_Geo__c', 'Employee_To_Route__c', 'Customer_to_Route__c', 'Line_Code_Grouping_Definition__mdt', 'Route_Frequency_Mapping__mdt']

    const syncModels = CommonParam.objs
        .filter((model) => model.initQuery && newSyncList.indexOf(model.name) !== -1)
        .slice(0)

    return new Promise((resolve, reject) => {
        const currentDate = CommonParam.lastModifiedDate
        const now = new Date()
        syncDownByPersona(syncModels, true, false)
            .then((res) => {
                CommonParam.lastModifiedDate = now.toISOString()
                AsyncStorage.setItem('lastModifiedDate', now.toISOString())
                if (isPersonaPSR()) {
                    getMyDayVisitForPSR().then(() => {
                        resolve(res)
                    })
                } else {
                    resolve(res)
                }
            })
            .catch((err) => {
                CommonParam.lastModifiedDate = new Date(currentDate).toISOString()
                AsyncStorage.setItem('lastModifiedDate', new Date(currentDate).toISOString())
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'SyncService.getLatestData',
                    `Refresh ${CommonParam.PERSONA__c} error: ${getStringValue(err)}`
                )
                reject(err)
            })
    })
}

export const SyncService = {
    syncUp: syncHelper.syncUp,
    syncDown: syncHelper.syncDown,
    uploadFile: fileHelper.uploadFile,
    getContentDocumentId: fileHelper.getContentDocumentId,
    linkContentToEntity: fileHelper.linkContentToEntity,
    downloadFile: fileHelper.downloadFile,
    syncDownByPersona: (models, withLastModified = false, isInitSync = true) => {
        return syncDownByPersona(models, withLastModified, isInitSync)
    },
    syncDownObjWithCond: async (obj, withLastModified = false) => {
        const regExpMap = condRegExMap()
        await syncDownObjWithCond(obj, regExpMap, withLastModified)
        return Promise.resolve()
    },
    syncDownObjWithCondForNew: async (obj, newStoreIds, newAccounts) => {
        const regExpMap = condRegExMapForNew(newStoreIds, newAccounts)
        await syncDownObjWithCond(obj, regExpMap)
        return Promise.resolve()
    }
}

export default SyncService

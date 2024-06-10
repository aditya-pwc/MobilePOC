/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-11-20 13:07:18
 * @LastEditTime: 2024-01-17 15:56:12
 * @LastEditors: Mary Qian
 */

import _ from 'lodash'
import { restDataCommonCall } from '../api/SyncUtils'
import { CommonParam } from '../../common/CommonParam'
import { CustomError } from '../enums/CustomError'
import { Log } from '../../common/enums/Log'
import { syncVisitBeforeVL } from '../helper/merchandiser/MyVisitHelper'
import { filterExistFields } from '../utils/SyncUtils'
import { SoupService } from './SoupService'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const recordUpdateVisitListLogs = (functionName: string, message: string, isError = false) => {
    const level = isError ? Log.MOBILE_ERROR : Log.MOBILE_INFO
    storeClassLog(level, `MD-UpdateVisitList-${functionName}`, message)
}

const syncVisitListLocalData = (visitList: any, params: any, localUpdated: boolean) => {
    params._soupEntryId = visitList?._soupEntryId
    return SoupService.updateDataWithPartialParamsIntoSoupWithQuery(
        'Visit_List__c',
        ` WHERE {Visit_List__c:Id} = '${visitList.Id}' OR {Visit_List__c:_soupEntryId} = '${visitList._soupEntryId}'`,
        params,
        localUpdated,
        false
    )
}

const updateVL = (visitList: any, fields: string[], functionName: string, shouldUploadVisitFirst = false) => {
    return new Promise<any>((resolve, reject) => {
        const filterRes = filterExistFields('Visit_List__c', [visitList], fields)
        let syncObj: any = null
        if (filterRes?.length > 0) {
            syncObj = filterRes[0]
        } else {
            recordUpdateVisitListLogs(functionName, `filterRes failed: ${JSON.stringify(visitList)}`)
            resolve({})
            return
        }

        if (_.isEmpty(syncObj.Id)) {
            recordUpdateVisitListLogs(functionName, `no syncObj Id: ${JSON.stringify(visitList)}`)
            resolve({})
            return
        }

        const syncObjBody = _.cloneDeep(syncObj)
        delete syncObjBody.Id

        syncVisitBeforeVL(shouldUploadVisitFirst)
            .then(() => {
                return restDataCommonCall(`sobjects/Visit_List__c/${syncObj.Id}`, 'PATCH', syncObjBody)
            })
            .then(async (res) => {
                recordUpdateVisitListLogs(functionName, `${JSON.stringify(syncObj)} - ${JSON.stringify(visitList)}`)
                await syncVisitListLocalData(visitList, syncObj, false)
                resolve(res)
            })
            .catch(async (error) => {
                CommonParam.pendingSync.visitList = true
                recordUpdateVisitListLogs(
                    functionName,
                    `${JSON.stringify(syncObj)} - ${ErrorUtils.error2String(error)}`,
                    true
                )
                await syncVisitListLocalData(visitList, syncObj, true)
                if (error && error.error && error.error === CustomError.NETWORK_ERROR) {
                    resolve({})
                } else {
                    reject(error)
                }
            })
    })
}

export const updateVLPushFlag = (visitList: any) => {
    return updateVL(visitList, ['Id', 'Push_Flag__c'], 'updateVLPushFlag')
}

export const updateVLStartGap = (visitList: any) => {
    return updateVL(visitList, ['Id', 'Start_Gap_Notification__c'], 'updateVLStartGap')
}

export const updateVLWhenEndDay = (visitList: any) => {
    const endDayParams = [
        'Id',
        'End_Date__c',
        'End_Location__latitude__s',
        'End_Location__longitude__s',
        'Status__c',
        'End_Date_Time__c'
    ]
    return updateVL(visitList, endDayParams, 'updateVLWhenEndDay', true)
}

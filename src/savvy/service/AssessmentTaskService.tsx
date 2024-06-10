/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-03-28 05:47:17
 * @LastEditTime: 2023-10-23 17:03:12
 * @LastEditors: Mary Qian
 */

import { CommonApi } from '../../common/api/CommonApi'
import {
    compositeCommonCall,
    fetchObjInTime,
    restApexCommonCall,
    restDataCommonCall,
    syncDownObj
} from '../api/SyncUtils'
import { CommonParam } from '../../common/CommonParam'
import { Log } from '../../common/enums/Log'
import { AssessmentTask } from '../enums/MerchandiserEnums'
import { isHttpStatusCodeSuccess } from '../utils/SyncUtils'
import { SoupService } from './SoupService'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import BaseInstance from '../../common/BaseInstance'

const SPLICE_COUNT = 20
const WORK_ORDER_TITLE = 'WorkOrder'
const WORK_ORDER_FILE_NAME = 'WorkOrder.png'
const CONTENT_VERSION_ORIGIN_CONTENT = 'C'
const CONTENT_DOCUMENT_LINK_VISIBILITY_ALL_USER = 'AllUsers'
const CONTENT_DOCUMENT_LINK_SHARE_TYPE_VIEWER_PERMISSION = 'V'
const IMAGE_TYPE_EXECUTION_PHOTO = 'Execution Photo'

const fetchAssessmentTaskByVisits = () => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup('Visit', {}, ['Id']).then((res: any) => {
            if (res.length) {
                const visitIds = res.map((t) => `'${t.Id}'`)

                const cbPromiseArr = []
                const soupName = 'AssessmentTask'
                let query = 'SELECT Id, ParentId, Reason__c, Store_Manager_Name__c FROM AssessmentTask'

                if (visitIds.length > SPLICE_COUNT) {
                    while (visitIds.length > 0) {
                        const tmpVisitIds = visitIds.splice(0, SPLICE_COUNT)
                        const newQuery = query + ' WHERE ParentId IN (' + tmpVisitIds.join(',') + ')'
                        cbPromiseArr.push(syncDownObj(soupName, newQuery))
                    }
                } else {
                    query += ' WHERE ParentId IN (' + visitIds.join(',') + ')'
                    cbPromiseArr.push(syncDownObj(soupName, query))
                }

                Promise.all(cbPromiseArr)
                    .then((response) => {
                        resolve(response)
                    })
                    .catch((err) => {
                        reject(err)
                    })
            }
        })
    })
}

const updateAssessmentTaskExceptSign = async (visitId: string, reason: string, managerName: string) => {
    let assessmentTaskId = ''
    try {
        const q = `SELECT Id, ParentId, Reason__c, Store_Manager_Name__c FROM AssessmentTask
    WHERE ParentId = '${visitId}'`
        const res = await fetchObjInTime('AssessmentTask', q)

        // if assessmentTask is exist
        if (res?.length > 0) {
            assessmentTaskId = res[0].Id
        } else {
            // if assessmentTask is not exist, create it
            const body = {
                Name: AssessmentTask.NAME,
                TaskType: AssessmentTask.TYPE,
                ParentId: visitId,
                Reason__c: reason,
                Store_Manager_Name__c: managerName
            }
            const updateRes = await restDataCommonCall('sobjects/AssessmentTask', 'POST', body)
            assessmentTaskId = updateRes.data.id
        }

        const params = {
            assessmentTaskObj: JSON.stringify({
                visitId,
                reason,
                managerName
            })
        }

        await restApexCommonCall(`${CommonApi.PBNA_MOBILE_API_ASSESSMENT_TASK}/`, 'PUT', params)
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'AssessmentTaskService.updateAssessmentTaskExceptSign',
            `error ${ErrorUtils.error2String(error)}`
        )
    }

    return assessmentTaskId
}

const createContentDistribution = async (contentVersionId: string) => {
    return new Promise<string>((resolve, reject) => {
        const createBody = {
            method: 'POST',
            url: `/services/data/${CommonParam.apiVersion}/sobjects/ContentDistribution`,
            referenceId: 'refContentDistribution',
            body: {
                Name: 'MySignature',
                ContentVersionId: contentVersionId,
                PreferencesAllowViewInBrowser: true,
                PreferencesLinkLatestVersion: true,
                PreferencesNotifyOnVisit: false,
                PreferencesPasswordRequired: false,
                PreferencesAllowOriginalDownload: true
            }
        }

        compositeCommonCall([createBody]).then((res) => {
            const response = res.data.compositeResponse
            const code = response[0].httpStatusCode

            if (isHttpStatusCodeSuccess(code)) {
                resolve('success')
            } else {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'AssessmentTaskService.createContentDistribution',
                    `createContentDistribution failed: ${code} ${JSON.stringify(response)}`
                )
                reject(`err: ${JSON.stringify(response)}`)
            }
        })
    })
}

export const updateAssessmentTask = (visitId: string, reason: string, managerName: string, signatureData: string) => {
    return new Promise<string>((resolve, reject) => {
        if (reason?.length > 0) {
            updateAssessmentTaskExceptSign(visitId, reason, managerName)
                .then(() => {
                    resolve(reason)
                })
                .catch((err) => {
                    reject(err)
                })
        } else {
            updateAssessmentTaskExceptSign(visitId, reason, managerName)
                .then((assessmentTaskId) => {
                    const nowTime = new Date().toISOString()
                    const createBody = {
                        method: 'POST',
                        url: `/services/data/${CommonParam.apiVersion}/sobjects/ContentVersion`,
                        referenceId: 'refContentVersion',
                        body: {
                            Title: nowTime + '_Sign_Title',
                            PathOnClient: nowTime + '_Sign_PathOnClient.jpeg',
                            VersionData: signatureData,
                            FirstPublishLocationId: assessmentTaskId
                        }
                    }

                    return compositeCommonCall([createBody])
                })
                .then((res) => {
                    const response = res.data.compositeResponse
                    const code = response[0].httpStatusCode
                    const contentVersionId = response[0].body.id || ''
                    if (isHttpStatusCodeSuccess(code)) {
                        return createContentDistribution(contentVersionId)
                    }
                    reject(`err: ${JSON.stringify(response)}`)
                })
                .then(() => {
                    resolve('success')
                })
                .catch((err) => {
                    reject(err)
                })
        }
    })
}

export const uploadWorkOrderImg = (photoList: [], workOrderId: string) => {
    return new Promise<string>((resolve, reject) => {
        const subRequestArr: any = []
        photoList.forEach((pic: any, index) => {
            subRequestArr.push(
                {
                    method: 'POST',
                    url: `/services/data/${CommonParam.apiVersion}/sobjects/ContentVersion`,
                    referenceId: `refContentVersion_${index}`,
                    body: {
                        Title: WORK_ORDER_TITLE,
                        PathOnClient: WORK_ORDER_FILE_NAME,
                        VersionData: pic.photoString,
                        Origin: CONTENT_VERSION_ORIGIN_CONTENT
                    }
                },
                {
                    method: 'GET',
                    url: `/services/data/${CommonParam.apiVersion}/query/?q=SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id='@{refContentVersion_${index}.id}'`,
                    referenceId: `getContentVersion_${index}`
                },
                {
                    method: 'PATCH',
                    url: `/services/data/${CommonParam.apiVersion}/sobjects/ContentVersion/@{refContentVersion_${index}.id}`,
                    referenceId: `refUpdateContentVersion_${index}`,
                    body: {
                        Media_Id__c: `@{refContentVersion_${index}.id}`
                    }
                },
                {
                    method: 'POST',
                    url: `/services/data/${CommonParam.apiVersion}/sobjects/ContentDocumentLink`,
                    referenceId: `refContentDocumentLink_${index}`,
                    body: {
                        LinkedEntityId: workOrderId,
                        ContentDocumentId: `@{getContentVersion_${index}.records[0].ContentDocumentId}`,
                        ShareType: CONTENT_DOCUMENT_LINK_SHARE_TYPE_VIEWER_PERMISSION,
                        Visibility: CONTENT_DOCUMENT_LINK_VISIBILITY_ALL_USER
                    }
                },
                {
                    method: 'POST',
                    url: `/services/data/${CommonParam.apiVersion}/sobjects/ContentDistribution`,
                    referenceId: `refContentDistribution_${index}`,
                    body: {
                        Name: WORK_ORDER_TITLE,
                        ContentVersionId: `@{refContentVersion_${index}.id}`,
                        PreferencesAllowViewInBrowser: true,
                        PreferencesLinkLatestVersion: true,
                        PreferencesNotifyOnVisit: false,
                        PreferencesPasswordRequired: false,
                        PreferencesAllowOriginalDownload: true
                    }
                },
                {
                    method: 'POST',
                    url: `/services/data/${CommonParam.apiVersion}/sobjects/Image`,
                    referenceId: `refImage_${index}`,
                    body: {
                        Attachment_Type__c: IMAGE_TYPE_EXECUTION_PHOTO,
                        IsActive: true,
                        ContentDocumentId: `@{getContentVersion_${index}.records[0].ContentDocumentId}`,
                        Name: WORK_ORDER_TITLE
                    }
                }
            )
        })
        BaseInstance.sfHttpClient
            .callComposite(subRequestArr)
            .then((res) => {
                const response = res.data.compositeResponse
                const failedResponseArr = response.filter((res: any) => !isHttpStatusCodeSuccess(res.httpStatusCode))
                const isSuccess = failedResponseArr.length === 0
                if (isSuccess) {
                    resolve('success')
                } else {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'AssessmentTaskService.uploadWorkOrderImg',
                        `uploadWorkOrderImg failed: ${failedResponseArr[0].httpStatusCode} ${JSON.stringify(
                            failedResponseArr
                        )}`
                    )
                    reject(`err: ${JSON.stringify(response)}`)
                }
            })
            .catch((err) => {
                reject(err)
            })
    })
}

const fetchContentDocumentLinkByAssessmentTasks = () => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup('AssessmentTask', {}, ['Id'])
            .then((res: any) => {
                if (res.length) {
                    const taskIds = res.map((t) => {
                        return "'" + t.Id + "'"
                    })
                    const cbPromiseArr = []
                    const soupName = 'ContentDocumentLink'
                    let query = 'SELECT Id, ContentDocumentId, LinkedEntityId FROM ContentDocumentLink'

                    if (taskIds.length > SPLICE_COUNT) {
                        while (taskIds.length > 0) {
                            const tmpTaskIds = taskIds.splice(0, SPLICE_COUNT)
                            const newQuery = query + ' WHERE LinkedEntityId IN (' + tmpTaskIds.join(',') + ')'
                            cbPromiseArr.push(syncDownObj(soupName, newQuery))
                        }
                    } else {
                        query += ' WHERE LinkedEntityId IN (' + taskIds.join(',') + ')'
                        cbPromiseArr.push(syncDownObj(soupName, query))
                    }
                    resolve(Promise.all(cbPromiseArr))
                } else {
                    resolve(Promise.resolve())
                }
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const fetchAssessmentTaskAndContentDocument = () => {
    return new Promise((resolve, reject) => {
        fetchAssessmentTaskByVisits()
            .then(() => {
                fetchContentDocumentLinkByAssessmentTasks()
                    .then(() => {
                        resolve(Promise.resolve())
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
            .catch((err) => {
                reject(err)
            })
    })
}

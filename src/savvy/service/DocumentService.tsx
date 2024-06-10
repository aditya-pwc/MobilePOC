/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-08-24 06:20:43
 * @LastEditTime: 2023-10-23 18:03:40
 * @LastEditors: Mary Qian
 */

import { fetchAssessmentTask } from '../api/ApexApis'
import { syncDownChunkObj } from '../api/SyncUtils'
import { Log } from '../../common/enums/Log'
import { SoupService } from './SoupService'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const getContentDocOffline = (entityIds: any) => {
    return SoupService.retrieveDataFromSoup(
        'ContentDocumentLink',
        {},
        ['Id', 'ContentDocumentId', 'LinkedEntityId'],
        ` SELECT
      {ContentDocumentLink:Id},
      {ContentDocumentLink:ContentDocumentId},
      {ContentDocumentLink:LinkedEntityId}
      FROM {ContentDocumentLink}
      WHERE {ContentDocumentLink:LinkedEntityId} IN (${entityIds})`
    ).catch((err) => {
        storeClassLog(
            Log.MOBILE_ERROR,
            'DocumentService.getContentDocOffline',
            `getContentDocOffline failed: ${ErrorUtils.error2String(err)}`
        )
    })
}

const getContentDocOnline = (entityIds: any) => {
    const query = 'SELECT Id, ContentDocumentId, LinkedEntityId FROM ContentDocumentLink WHERE LinkedEntityId'
    return syncDownChunkObj('ContentDocumentLink', query, entityIds)
}

const getImageOnline = (docIds: any) => {
    const query = 'SELECT Attachment_Type__c, ContentDocumentId FROM Image WHERE ContentDocumentId'
    return syncDownChunkObj('Image', query, docIds)
}

const fetchWorkOrderPhotos = async (workOrderIds) => {
    if (!workOrderIds || workOrderIds.length === 0) {
        return []
    }

    const documentLink = await getContentDocOnline(workOrderIds)

    const docIds = documentLink.map((item) => `'${item.ContentDocumentId}'`)
    if (!docIds || docIds.length === 0) {
        return []
    }
    const images = await getImageOnline(docIds)

    documentLink.forEach((item) => {
        const image = images.filter((img) => img.ContentDocumentId === item.ContentDocumentId)
        if (image?.length > 0) {
            item.imageType = image[0].Attachment_Type__c
        }
    })

    const promiseArr = documentLink.map((item) => {
        return new Promise((resolve, reject) => {
            fetchAssessmentTask(item.ContentDocumentId)
                .then((data) => {
                    const imageData = JSON.parse(data.data).info

                    const pictureData = {
                        Data: imageData,
                        TargetId: item.LinkedEntityId,
                        ImageType: item.imageType,
                        ContentDocumentId: item.ContentDocumentId
                    }
                    resolve(pictureData)
                })
                .catch((err) => {
                    reject(err)
                })
        })
    })

    return Promise.all(promiseArr)
}

const getContentDocIds = (docMap, docs) => {
    return docs.map((doc) => {
        if (docMap.has(doc.LinkedEntityId)) {
            const idArr = docMap.get(doc.LinkedEntityId)
            idArr.push(doc.ContentDocumentId)
            docMap.set(doc.LinkedEntityId, idArr)
        } else {
            docMap.set(doc.LinkedEntityId, [doc.ContentDocumentId])
        }

        return doc.ContentDocumentId
    })
}

const getPictureData = (targetIds) => {
    const condition = ['WHERE {PictureData:TargetId} IN (' + targetIds + ')']
    return SoupService.retrieveDataFromSoup('PictureData', {}, [], null, condition)
}

const getPhotosByWorkOrderIdOffline = async (workOrderId) => {
    const selectDataLength = -3
    const maxDataLength = 3
    const res = await SoupService.retrieveDataFromSoup(
        'PictureData',
        {},
        ['Type', 'TargetId', 'Data'],
        `SELECT {PictureData:Type},{PictureData:TargetId},{PictureData:Data}
        FROM {PictureData} WHERE {PictureData:Type} = 'Execution Photo'
        AND {PictureData:TargetId} = '${workOrderId}'`
    )

    return res.length > maxDataLength ? res.slice(selectDataLength) : res
}

export const DocumentService = {
    getContentDocOffline,
    getPictureData,
    getContentDocIds,
    getPhotosByWorkOrderIdOffline,
    fetchWorkOrderPhotos
}

export default DocumentService

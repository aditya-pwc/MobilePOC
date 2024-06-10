import { CommonParam } from '../../../common/CommonParam'
import { compositeCommonCall } from '../../api/SyncUtils'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import { getStringValue } from '../../utils/LandingUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { HttpStatusCode } from 'axios'
import { CommonApi } from '../../../common/api/CommonApi'
import dayjs from 'dayjs'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'

export const createPhotoExecutionContentVersion = async (
    storePriorityId: string,
    contentGroupKey: string,
    fileName: string,
    externalDataSourceId: string,
    uploadToSPResultId: string,
    site: string,
    path: string
) => {
    const EXTERNAL = 'E'
    const CHATTER = 'H'

    const spUrlPrefix = `${CommonApi.PBNA_SHARE_POINT_PEPSICO_URL}${site}${CommonApi.PBNA_SALES_DOC_PATH_P1}${site}${path}`
    const spUrlSuffix = `${CommonApi.PBNA_SALES_DOC_PATH_P2}${site}${path}`
    const createVersionBody = {
        method: 'POST',
        url: `/services/data/${CommonParam.apiVersion}/sobjects/ContentVersion`,
        referenceId: `refContentVersionPhotoExecution`,
        body: {
            ContentLocation: EXTERNAL,
            Origin: CHATTER,
            StorePriority__c: storePriorityId,
            Title: `${CommonParam.userId}_${storePriorityId}_Execution_Photo`,
            ContentGroup__c: contentGroupKey,
            PathOnClient: fileName,
            FirstPublishLocationId: storePriorityId,
            ExternalDataSourceId: externalDataSourceId,
            ExternalDocumentInfo1: fileName,
            ExternalDocumentInfo2: uploadToSPResultId,
            SharePoint_Url__c: `${spUrlPrefix}%2F${fileName}${spUrlSuffix}`
        }
    }

    const queryVersionBody = {
        method: 'GET',
        url: `/services/data/${CommonParam.apiVersion}/query/?q=SELECT ContentDocumentId FROM ContentVersion WHERE Id='@{refContentVersionPhotoExecution.id}'`,
        referenceId: 'refGetContentVersionPhotoExecution'
    }

    const contentVersionRes = await compositeCommonCall([createVersionBody, queryVersionBody])
    if (
        ![HttpStatusCode.Ok, HttpStatusCode.Created].includes(
            contentVersionRes.data.compositeResponse[1].httpStatusCode
        )
    ) {
        throw new Error(ErrorUtils.error2String(contentVersionRes))
    }
}

export const uploadExecutionPhotoToSharePoint = async (
    sharepointToken: string,
    base64String: string,
    sharepointUrl: string
) => {
    try {
        const blobRes = await fetch('data:application/octet-stream;base64,' + base64String)

        const blob = await blobRes?.blob()

        const spUrl = encodeURI(sharepointUrl)
        const res = await fetch(spUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': `application/octet-stream`,
                Authorization: `Bearer ${sharepointToken}`
            },
            body: blob
        })
        const resBody = await res.json()
        const uploadResultId = resBody.id
        const isUploadSuccess = res.status === HttpStatusCode.Ok || res.status === HttpStatusCode.Created

        let isSuccess

        if (isUploadSuccess) {
            const patchFieldUrl = `${CommonApi.PBNA_MOBILE_SHAREPOINT_DOCUMENT_API}/items/${uploadResultId}/listitem/fields`
            const updateExpirationDateRes = await fetch(patchFieldUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': `application/json`,
                    Authorization: `Bearer ${sharepointToken}`
                },
                body: JSON.stringify({
                    ExpirationDate: dayjs().add(12, 'month').format(TIME_FORMAT.Y_MM_DD)
                })
            })

            isSuccess =
                updateExpirationDateRes.status === HttpStatusCode.Ok ||
                updateExpirationDateRes.status === HttpStatusCode.Created
        }

        return {
            isSuccess,
            uploadResultId
        }
    } catch (e) {
        storeClassLog(
            Log.MOBILE_ERROR,
            `KAM-uploadExecutionPhotoToSharePoint`,
            `Upload To SharePoint Failure ${getStringValue(e)}`
        )
        return {
            isSuccess: false,
            uploadResultId: ''
        }
    }
}

/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2024-02-07 17:33:04
 * @LastEditTime: 2024-02-07 17:40:36
 * @LastEditors: Mary Qian
 */

import axios from 'axios'
import _ from 'lodash'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { CommonApi } from '../../../../../../common/api/CommonApi'
import { Log } from '../../../../../../common/enums/Log'
import { storeClassLog } from '../../../../../../common/utils/LogUtils'
import { restApexCommonCall } from '../../../../../api/SyncUtils'

export const getToken = async () => {
    try {
        const res = await restApexCommonCall(CommonApi.PBNA_MOBILE_FS_SHAREPOINT_TOKEN_URL, 'GET')
        const token = res.data?.token
        return token
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'get FS SP Token', ErrorUtils.error2String(error))
        throw new Error('Fetch SharePoint Token Failed\n' + ErrorUtils.error2String(error))
    }
}

export const uploadDataToSharePoint = async (data: any[]) => {
    try {
        const sharepointToken = await getToken()

        if (_.isEmpty(sharepointToken)) {
            return { error: 'Get Token Failed' }
        }

        const BATCH_URL = CommonApi.PBNA_MOBILE_SHAREPOINT_BATCH_BASE_URL
        const REQUEST_URL = CommonApi.PBNA_MOBILE_SHAREPOINT_REQUEST_URL

        if (_.isEmpty(BATCH_URL) || _.isEmpty(REQUEST_URL)) {
            return { error: 'Fetch SharePoint URL failed' }
        }

        const requestsBody = data.map((item, index) => {
            return {
                id: (index + 1).toString(),
                method: 'POST',
                url: REQUEST_URL,
                body: { fields: item },
                headers: { 'Content-Type': 'application/json' }
            }
        })

        const body = {
            requests: requestsBody
        }

        const updateRes = await axios.post(BATCH_URL, body, {
            headers: {
                Authorization: `Bearer ${sharepointToken}`,
                'Content-Type': 'application/json'
            }
        })

        const errorMessageArray: string[] = []
        for (const item of updateRes.data.responses) {
            if (Math.floor(item.status / 100) !== 2) {
                const errorMessage = item.body?.error?.message || 'Error'
                errorMessageArray.push(errorMessage)
            }
        }

        if (errorMessageArray.length > 0) {
            storeClassLog(Log.MOBILE_ERROR, 'SP - Upload Data', errorMessageArray.join(', '))
            return { error: errorMessageArray.join(', ') }
        }
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'SP - uploadToSharePoint', ErrorUtils.error2String(error))
        return { error: ErrorUtils.error2String(error) }
    }

    return { error: null }
}

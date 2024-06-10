/**
 * @description Network request configuration for POG
 * @author Dashun Fu
 * @date 2023/07/12
 */

import axios, { AxiosResponse } from 'axios'
import _ from 'lodash'
import { CommonApi } from '../../common/api/CommonApi'
import { CommonParam } from '../../common/CommonParam'
import StatusCode from '../enums/StatusCode'
import { fetchBreadcrumbsToken } from '../service/BreadcrumbsService'

const _retryDelay: number = 500
const _retryTimes: number = 3

export const POGServiceConnection = axios.create({
    timeout: 80000
})

const _delay = async () => {
    await new Promise((resolve) => setTimeout(resolve, _retryDelay))
}

let curTokenRefreshPromise: any = null
function refreshToken() {
    if (!curTokenRefreshPromise) {
        curTokenRefreshPromise = fetchBreadcrumbsToken().finally(() => {
            curTokenRefreshPromise = null
        })
    }
    return curTokenRefreshPromise
}

/**
 * http request interceptors
 */
POGServiceConnection.interceptors.request.use(
    async (config: any) => {
        config.headers['Content-Type'] = 'application/json'
        config.headers.Authorization = `Bearer ${CommonParam.breadcrumbsAccessToken}`
        if (config.retryCount > 0) {
            await _delay()
        }
        return config
    },
    (error) => {
        return Promise.reject({ status: 'E98', error })
    }
)

/**
 * http response interceptors
 */
POGServiceConnection.interceptors.response.use(
    (response) => response,
    async function (error) {
        // this block handles error between savvy and POG API, could be connection error and 401
        const code = error?.response?.status
        if (code === StatusCode.ClientErrorUnauthorized) {
            if ((error.config.retryCount || 0) <= _retryTimes) {
                await refreshToken()
                return POGServiceConnection({
                    ..._.cloneDeep(error.config),
                    retryCount: (error.config.retryCount || 0) + 1
                })
            }
        }
        const finalError = error?.response || error
        return Promise.reject({ status: 'E98', error: finalError })
    }
)

export const fetchPOG = (data: any) => {
    return POGServiceConnection.post<Promise<AxiosResponse<Blob>>>(CommonApi.PBNA_POG_ENDPOINT, data, {
        responseType: 'blob'
    })
}

export const fetPOGCsv = (data: any) => POGServiceConnection.post(CommonApi.PBNA_POG_CSV_ENDPOINT, data)

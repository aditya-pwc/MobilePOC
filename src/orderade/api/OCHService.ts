/**
 * @description Handle OCH connection and network request
 * @author Christopher ZANG
 * @date 2023/06/12
 */
import axios from 'axios'
import StatusCode from 'common-mobile-lib/@common-mobile-lib/sf-http-client/src/StatusCode'
import _ from 'lodash'
import { CommonParam } from '../../common/CommonParam'
import { CommonApi } from '../../common/api/CommonApi'
import { fetchBreadcrumbsToken } from '../../savvy/service/BreadcrumbsService'

const serviceOCHConnection = axios.create({
    timeout: CommonParam.OCHConnectTimeOut
})

let curTokenRefreshPromise: any = null
function refreshToken() {
    if (!curTokenRefreshPromise) {
        curTokenRefreshPromise = fetchBreadcrumbsToken().finally(() => {
            curTokenRefreshPromise = null
        })
    }
    return curTokenRefreshPromise
}

const _delay = async () => {
    await new Promise((resolve) => setTimeout(resolve, CommonParam.OCHRetryTiming * 1000))
}
/**
 * http request interceptors
 */
serviceOCHConnection.interceptors.request.use(
    async (config: any) => {
        config.headers['Content-Type'] = 'application/json'
        config.headers.Authorization = `Bearer ${CommonParam.breadcrumbsAccessToken || ''}`
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
serviceOCHConnection.interceptors.response.use(
    (response) => response,
    async function (error) {
        // this block handles error between savvy and och, could be connection error and 401
        const code = error?.response?.status
        if (code === StatusCode.ClientErrorUnauthorized) {
            if ((error.config.retryCount || 0) <= CommonParam.OCHretryTimes) {
                await refreshToken()
                return serviceOCHConnection({
                    ..._.cloneDeep(error.config),
                    retryCount: (error.config.retryCount || 0) + 1
                })
            }
        }
        if (code === StatusCode.ServerErrorInternal) {
            if ((error.config.retryCount || 0) <= CommonParam.OCHretryTimes) {
                return serviceOCHConnection({
                    ..._.cloneDeep(error.config),
                    retryCount: (error.config.retryCount || 0) + 1
                })
            }
        }
        const finalError = error?.response || error
        return Promise.reject({ status: 'E98', error: finalError })
    }
)

export const pushOrderToOCH = (data: any) => {
    return serviceOCHConnection.post<Response>(CommonApi.PBNA_OCH_ENDPOINT, data, {
        headers: {
            Authorization: `Bearer ${CommonParam.breadcrumbsAccessToken}`
        }
    })
}

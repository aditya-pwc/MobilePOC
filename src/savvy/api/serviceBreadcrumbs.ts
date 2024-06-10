/**
 * @description Network request configuration
 * @author YUAN YUE
 * @date 2021/11/15
 */
import axios from 'axios'
import _ from 'lodash'
import StatusCode from '../enums/StatusCode'
import { fetchBreadcrumbsToken } from '../service/BreadcrumbsService'

let isRefreshing = false

export const serviceBreadcrumbs = axios.create({
    timeout: 80000
})
/**
 * http request interceptors
 */
serviceBreadcrumbs.interceptors.request.use(
    (config) => {
        config.headers = {
            'Content-Type': 'application/json',
            ...config.headers
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
serviceBreadcrumbs.interceptors.response.use(
    (response) => {
        if (response?.status === StatusCode.SuccessOK || response?.status === StatusCode.SuccessMultiStatus) {
            return response.data
        }

        return Promise.reject(response)
    },
    function (error) {
        const code = error?.response?.status
        // if the session is expired, try to refresh the token.
        if (error.response) {
            if (code === StatusCode.ClientErrorUnauthorized) {
                if (!isRefreshing) {
                    isRefreshing = true
                    return fetchBreadcrumbsToken()
                        .then((res) => {
                            const config = _.cloneDeep(error.config)
                            config.headers = {
                                ...config.headers,
                                Authorization: `Bearer ${res}`
                            }
                            return serviceBreadcrumbs(config)
                        })
                        .finally(() => {
                            isRefreshing = false
                        })
                }
            }
            return Promise.reject({ status: 'E98', error: error.response })
        }

        return Promise.reject({ status: 'E98', error })
    }
)

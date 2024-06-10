import axios from 'axios'
import { CommonParam } from '../../common/CommonParam'
import StatusCode from '../enums/StatusCode'
import _ from 'lodash'
import { getTokenForEquipmentImage } from '../service/EquipmentSharePointService'

let isRefreshing = false

export const serviceEquipmentSharePoint = axios.create({
    timeout: 80000
})

serviceEquipmentSharePoint.interceptors.request.use(
    (config) => {
        config.headers = {
            Authorization: `${CommonParam.equipmentSharePointToken}`,
            ...config.headers
        }
        // config.baseURL = ''
        return config
    },
    (error) => {
        return Promise.reject({ status: 'E98', error })
    }
)

serviceEquipmentSharePoint.interceptors.response.use(
    (response) => {
        if (response.status === StatusCode.SuccessOK) {
            return response
        }
        return Promise.reject(response)
    },
    async function (error) {
        // if the session is expired, try to refresh the token.
        if (error.response) {
            const code = error.response?.status
            if (code === StatusCode.ClientErrorUnauthorized) {
                if (!isRefreshing) {
                    isRefreshing = true
                    try {
                        const res = await getTokenForEquipmentImage()
                        const config = _.cloneDeep(error.config)
                        config.headers = {
                            ...config.headers,
                            Authorization: `Bearer ${res}`
                        }
                        return await serviceEquipmentSharePoint(config)
                    } finally {
                        isRefreshing = false
                    }
                }
            }
            return Promise.reject({ status: 'E98', error: error })
        }
        return Promise.reject({ status: 'E98', error })
    }
)

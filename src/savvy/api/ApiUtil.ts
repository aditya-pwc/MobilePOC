/*
 * @Description:
 * @Author: Yi Li
 * @Date: 2021-11-17 01:33:29
 * @LastEditTime: 2023-12-05 11:56:31
 * @LastEditors: Mary Qian
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { restDataCommonCall } from './SyncUtils'
import { CommonSyncRes } from '../../common/interface/SyncInterface'
import { CommonApi } from '../../common/api/CommonApi'
import _ from 'lodash'
import { getStringValue } from '../utils/LandingUtils'
import { Log } from '../../common/enums/Log'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const checkCustomAPI = () => {
    const customAPIList: string[] = []
    Object.keys(CommonApi).forEach((key) => {
        if (_.isEmpty(CommonApi[key])) {
            customAPIList.push(key)
        }
    })

    if (customAPIList.length > 0) {
        storeClassLog(Log.MOBILE_WARN, 'checkCustomAPI', `fetch local failed: ${getStringValue(customAPIList)}`)
    }
}

export const getCustomApi = (callBackend: boolean) => {
    const url = 'query/?q=SELECT Name,Value__c FROM Remote_Service_Endpoint_URL__c'
    return new Promise<CommonSyncRes>((resolve, reject) => {
        AsyncStorage.getItem('custom_api', (err, data) => {
            if (!err && data) {
                const apiData = JSON.parse(data)
                _.forEach(apiData, (value, key) => {
                    CommonApi[key] = value
                })
            } else if (err) {
                storeClassLog(Log.MOBILE_ERROR, 'getCustomApi', `fetch local failed: ${getStringValue(err)}`)
            }
            if (callBackend) {
                restDataCommonCall(url, 'GET')
                    .then((res) => {
                        const records = res?.data?.records || []
                        records.forEach((item) => {
                            CommonApi[item.Name] = item.Value__c
                        })
                        AsyncStorage.setItem('custom_api', JSON.stringify(CommonApi))
                        resolve({ status: 'E0', message: 'Load remote custom labels' })
                    })
                    .catch((error) => {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'getCustomApi',
                            'retrieve custom api failed:' + ErrorUtils.error2String(error)
                        )
                        reject({ status: 'E1', error })
                    })
                    .finally(() => {
                        checkCustomAPI()
                    })
            } else {
                checkCustomAPI()
                resolve({ status: 'E0', message: 'Load remote custom labels' })
            }
        })
    })
}

export const existParamsEmpty = (params: any[]) => {
    if (_.isEmpty(params)) {
        return false
    }
    return params.some((param) => {
        return _.isEmpty(param)
    })
}

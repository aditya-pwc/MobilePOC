/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2023-10-27 21:01:57
 * @LastEditTime: 2023-12-05 11:53:36
 * @LastEditors: Mary Qian
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import _ from 'lodash'
import moment from 'moment'
import { getApplicationName } from 'react-native-device-info'
import { CommonApi } from '../api/CommonApi'
import BaseInstance from '../BaseInstance'
import { CommonParam } from '../CommonParam'
import { TIME_FORMAT } from '../enums/TimeFormat'
import { storeClassLog } from './LogUtils'
import { Log } from '../enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

enum BC_LOG_TYPE {
    CONFIG = 'GET CONFIG',
    TOKEN = 'GET TOKEN',
    UPLOAD = 'UPLOAD BREADCRUMBS DATA',
    SYNC = 'SYNC BREADCRUMBS DATA',
    DATA = 'BREADCRUMBS DATA',
    INTERVAL = 'BREADCRUMBS TIME INTERVAL',
    WATCHER = 'BREADCRUMBS WATCHER',
    VISIT = 'BREADCRUMBS VISIT',
    REFRESH = 'BREADCRUMBS REFRESH TOKEN'
}

const recordLogs = (type: string, message: string, upload = true) => {
    if (upload) {
        storeClassLog(Log.MOBILE_INFO, 'BRD - ' + type, message)
    }
}

export const fetchCredentialBreadcrumbs = () => {
    return BaseInstance.sfHttpClient.callApex(`${CommonApi.PBNA_MOBILE_API_SSO_LOGIN_CREDENTIAL}/`, 'GET')
}

export const fetchBreadcrumbsToken = () => {
    const appName = getApplicationName()
    const isProductionOrPreProd = appName === 'SAVVY' || appName === 'SAVVY PreProd'
    return new Promise((resolve, reject) => {
        fetchCredentialBreadcrumbs()
            .then((res) => {
                const result = JSON.parse(res?.data)
                if (_.isEmpty(result.token) && isProductionOrPreProd) {
                    recordLogs(BC_LOG_TYPE.TOKEN, `get token null, user: ${CommonParam.userId}`)
                    BaseInstance.sfOauthEngine.logout()
                    return resolve(result.token)
                }
                CommonParam.breadcrumbsAccessToken = result.token || ''
                CommonParam.breadcrumbsRefreshHours = result.hours || ''
                CommonParam.breadcrumbsLastSyncTime = moment().format(TIME_FORMAT.YMDHMS)
                AsyncStorage.setItem('breadcrumbs_token', CommonParam.breadcrumbsAccessToken)
                AsyncStorage.setItem('breadcrumbs_refresh_hours', CommonParam.breadcrumbsRefreshHours)
                AsyncStorage.setItem('breadcrumbs_last_sync_time', CommonParam.breadcrumbsLastSyncTime)
                resolve(CommonParam.breadcrumbsAccessToken)
            })
            .catch((error) => {
                recordLogs(
                    BC_LOG_TYPE.TOKEN,
                    `get token failed: ${CommonParam.userId}, ${ErrorUtils.error2String(error)}`
                )
                reject(error)
            })
    })
}

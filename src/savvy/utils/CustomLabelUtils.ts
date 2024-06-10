/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-11-19 05:03:08
 * @LastEditTime: 2023-11-20 14:17:29
 * @LastEditors: Mary Qian
 */
import { Log } from '../../common/enums/Log'
import { fetchObjInTime, restDataCommonCall } from '../api/SyncUtils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonParam } from '../../common/CommonParam'
import { getStringValue } from './LandingUtils'
import { storeClassLog } from '../../common/utils/LogUtils'

const camelCase = (label: string) => {
    if (label.length <= 1) {
        return label.toUpperCase()
    }

    const firstChar = label[0].toUpperCase
    const other = label.substring(1)
    return firstChar + other
}

const getPlanogramLabel = (callBackend) => {
    const url = "tooling/query/?q=Select+id,Name,Value+from+ExternalString+WHERE+Name+LIKE+'PBNA_PLANOGRAM%'"
    const KEY_USERNAME = 'PBNA_PLANOGRAM_USERNAME'
    const KEY_PASSWORD = 'PBNA_PLANOGRAM_PASSWORD'
    const q = "SELECT Name, Value__c FROM Integration_Setting__c WHERE Category__c ='Planogram'"
    return new Promise((resolve) => {
        AsyncStorage.getItem('planogram', (err, data) => {
            if (!err && data && !callBackend) {
                const labels = JSON.parse(data)
                Object.keys(labels).forEach((key) => {
                    CommonParam.planogram[key] = labels[key]
                })
                resolve(null)
            } else {
                restDataCommonCall(url, 'GET')
                    .then((res) => {
                        const data = res.data || {}
                        const records = data.records || []
                        records.forEach((item) => {
                            CommonParam.planogram[item.Name] = item.Value
                        })
                        return fetchObjInTime('ExternalString', q)
                    })
                    .then((res) => {
                        res.forEach((record) => {
                            if (record.Name === KEY_USERNAME) {
                                CommonParam.planogram.PBNA_PLANOGRAM_USERNAME = record.Value__c
                            }
                            if (record.Name === KEY_PASSWORD) {
                                CommonParam.planogram.PBNA_PLANOGRAM_PASSWORD = record.Value__c
                            }
                        })
                        resolve(AsyncStorage.setItem('planogram', JSON.stringify(CommonParam.planogram)))
                    })
                    .catch((error) => {
                        storeClassLog(
                            Log.MOBILE_INFO,
                            'getPlanogramLabel',
                            `fetch customLabel failed: ${getStringValue(error)}`
                        )
                        resolve(null)
                    })
            }
        })
    })
}

const getMapstedTweaksLabel = (callBackend) => {
    const KEY_USERNAME = 'PBNA_MAPSTEDTWEAKS_USERNAME'
    const KEY_PASSWORD = 'PBNA_MAPSTEDTWEAKS_PASSWORD'
    const q = "SELECT Name, Value__c FROM Integration_Setting__c WHERE Category__c ='Mapsted'"
    return new Promise((resolve) => {
        AsyncStorage.getItem('mapsted', (err, data) => {
            if (!err && data && !callBackend) {
                const labels = JSON.parse(data)
                Object.keys(labels).forEach((key) => {
                    CommonParam.mapsted[key] = labels[key]
                })
                resolve(null)
            } else {
                fetchObjInTime('Integration_Setting__c', q)
                    .then((res) => {
                        res.forEach((record) => {
                            if (record.Name === KEY_USERNAME) {
                                CommonParam.mapsted.PBNA_MAPSTEDTWEAKS_USERNAME = record.Value__c
                            }
                            if (record.Name === KEY_PASSWORD) {
                                CommonParam.mapsted.PBNA_MAPSTEDTWEAKS_PASSWORD = record.Value__c
                            }
                        })
                        resolve(AsyncStorage.setItem('mapsted', JSON.stringify(CommonParam.mapsted)))
                    })
                    .catch((error) => {
                        storeClassLog(
                            Log.MOBILE_INFO,
                            'getMapstedTweaksLabel',
                            `fetch Mapsted Tweaks label failed: ${getStringValue(error)}`
                        )
                        resolve(null)
                    })
            }
        })
    })
}

const getInnovationProductLabel = () => {
    const url = "tooling/query/?q=Select+id,Name,Value+from+ExternalString+WHERE+Name+LIKE+'PBNA_INNOVATION%'"
    const KEY_ID = 'PBNA_INNOVATION_CLIENT_ID'
    const KEY_SECRET = 'PBNA_INNOVATION_CLIENT_SECRET'
    const q = "SELECT Name, Value__c FROM Integration_Setting__c WHERE Category__c ='Innovation Product'"
    return new Promise((resolve) => {
        AsyncStorage.getItem('InnovationProductClient', (err, data) => {
            if (!err && data) {
                const labels = JSON.parse(data)
                Object.keys(labels).forEach((key) => {
                    CommonParam.innovation[key] = labels[key]
                })
                resolve(null)
            }
            restDataCommonCall(url, 'GET')
                .then((res) => {
                    const externalString = res.data || {}
                    const records = externalString.records || []
                    records.forEach((item) => {
                        CommonParam.innovation[item.Name] = item.Value
                    })
                    return fetchObjInTime('ExternalString', q)
                })
                .then((res) => {
                    res.forEach((record) => {
                        if (record.Name === KEY_ID) {
                            CommonParam.innovation.PBNA_INNOVATION_CLIENT_ID = record.Value__c
                        }
                        if (record.Name === KEY_SECRET) {
                            CommonParam.innovation.PBNA_INNOVATION_CLIENT_SECRET = record.Value__c
                        }
                    })
                    resolve(AsyncStorage.setItem('InnovationProductClient', JSON.stringify(CommonParam.innovation)))
                })
                .catch((error) => {
                    storeClassLog(
                        Log.MOBILE_INFO,
                        'getInnovationProductLabel',
                        `fetch customLabel failed: ${getStringValue(error)}`
                    )
                    resolve(null)
                })
        })
    })
}

export const CustomLabelUtils = {
    camelCase,
    getPlanogramLabel,
    getMapstedTweaksLabel,
    getInnovationProductLabel
}

export default CustomLabelUtils

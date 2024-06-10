/*
 * @Description:
 * @Author: Yi Li
 * @Date: 2021-11-19 02:22:07
 * @LastEditTime: 2021-11-19 02:27:48
 * @LastEditors: Yi Li
 */
import { PERMISSIONS, checkMultiple } from 'react-native-permissions'
import AsyncStorage from '@react-native-async-storage/async-storage'

const checkPermission = (permissionStr) => {
    return permissionStr === 'granted' || permissionStr === 'limited'
}

export const refreshLocationPermission = () => {
    return new Promise((resolve) => {
        checkMultiple([PERMISSIONS.IOS.LOCATION_ALWAYS, PERMISSIONS.IOS.LOCATION_WHEN_IN_USE])
            .then(async (status) => {
                const alwaysPer = checkPermission(status['ios.permission.LOCATION_ALWAYS'])
                const inusePer = checkPermission(status['ios.permission.LOCATION_WHEN_IN_USE'])
                resolve(alwaysPer || inusePer)
            })
            .catch(() => {
                resolve(false)
            })
    })
}

export const openLocationConsent = async () => {
    const hasConser = await AsyncStorage.getItem('locationConsent')
    refreshLocationPermission().then((result) => {
        AsyncStorage.setItem('locationConsent', String(result))
        if (hasConser !== 'true' || !result) {
            global.$locationModal.openModal(result)
        }
    })
}

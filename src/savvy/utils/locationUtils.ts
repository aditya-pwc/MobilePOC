/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-07-28 12:16:48
 * @LastEditTime: 2022-07-28 14:17:11
 * @LastEditors: Mary Qian
 */

import { Log } from '../../common/enums/Log'
import { storeClassLog } from '../../common/utils/LogUtils'

export const redefinePositionCoords = (latitude, longitude) => {
    latitude = latitude === 0 ? '0' : latitude
    longitude = longitude === 0 ? '0' : longitude
    if ((latitude && !longitude) || (!latitude && longitude)) {
        latitude = latitude || '0'
        longitude = longitude || '0'
        storeClassLog(
            Log.MOBILE_INFO,
            'redefinePositionCoords',
            'Change latitude or longitude to 0 because one of it is null'
        )
    } else if (!latitude && !longitude) {
        longitude = null
        latitude = null
    }
    return {
        longitude,
        latitude
    }
}

export const setupLocationByCoordinates = (item: any, isStart: boolean, isEnd: boolean) => {
    if (isStart && item?.Start_Location__c) {
        try {
            const coords = JSON.parse(item.Start_Location__c)
            if (coords) {
                const formatCoords = redefinePositionCoords(coords.latitude, coords.longitude)
                item.Start_Location__latitude__s = formatCoords.latitude
                item.Start_Location__longitude__s = formatCoords.longitude
            }
        } catch (err) {
            storeClassLog(Log.MOBILE_ERROR, 'setupLocationByCoordinates', `ParseLocationErr: ${JSON.stringify(err)}`)
        }
    }

    if (isEnd && item.End_Location__c) {
        try {
            const coords = JSON.parse(item.End_Location__c)
            if (coords) {
                const formatCoords = redefinePositionCoords(coords.latitude, coords.longitude)
                item.End_Location__latitude__s = formatCoords.latitude
                item.End_Location__longitude__s = formatCoords.longitude
            }
        } catch (err) {
            storeClassLog(Log.MOBILE_ERROR, 'setupLocationByCoordinates', `ParseLocationErr: ${JSON.stringify(err)}`)
        }
    }
}

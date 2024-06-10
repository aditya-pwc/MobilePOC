/*
 * @Author: Aimee Zhang
 * @Date: 2021-10-14 11:12:54
 * @LastEditTime: 2021-11-26 15:27:33
 * @LastEditors: Aimee Zhang
 * @Description: In User Settings Edit
 * @FilePath: /Halo_Mobile/src/components/common/UnitUtils.tsx
 */

import { CommonParam } from '../../../common/CommonParam'
import { CommonApi } from '../../../common/api/CommonApi'

export const MileageObj = {
    get MILE_TO_KM_RATE() {
        return parseFloat(CommonApi.PBNA_MOBILE_CONFIG_MILE_TO_KM)
    },
    get CANADA() {
        return CommonApi.PBNA_MOBILE_COUNTRY_CANADA
    }
}

export const convertMileData = (mile?: number, fromUnit = '', toUnit = '') => {
    const isCanada = CommonParam.CountryCode === MileageObj.CANADA
    const mileNum = Math.floor(mile || 0)
    const mileNumToKm = Math.floor((mile || 0) * MileageObj.MILE_TO_KM_RATE)
    return isCanada ? `${mileNumToKm} ${toUnit}` : `${mileNum} ${fromUnit}`
}

export const convertMileUnit = (fromUnit = '', toUnit = '') => {
    const isCanada = CommonParam.CountryCode === MileageObj.CANADA
    return isCanada ? `${toUnit}` : `${fromUnit}`
}

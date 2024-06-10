/*
 * @Description:
 * @Author: Yi Li
 * @Date: 2021-10-19 02:58:20
 * @LastEditTime: 2022-04-21 13:05:32
 * @LastEditors: Matthew Huang
 */
import DeviceInfo from 'react-native-device-info'
import { Dimensions } from 'react-native'
import moment from 'moment'
import { t } from '../../common/i18n/t'
import { MOMENT_STARTOF } from '../../common/enums/MomentStartOf'

const isTablet = DeviceInfo.isTablet()

const dim = Dimensions.get('screen')
const isPortrait = dim.height >= dim.width

const Utils = {
    isTablet,
    isPortrait
}

export const getTimeFromMins = (mins) => {
    const hour = (mins / 60) | 0
    const min = mins % 60 | 0
    return hour + ' ' + t.labels.PBNA_MOBILE_HR + ' ' + min + ' ' + t.labels.PBNA_MOBILE_MIN
}

export const getTimeFromMinsInitialCap = (mins) => {
    const hrWithInitialCap = t.labels.PBNA_MOBILE_HR.charAt(0).toLocaleUpperCase() + t.labels.PBNA_MOBILE_HR.slice(1)
    const minWithInitialCap = t.labels.PBNA_MOBILE_MIN.charAt(0).toLocaleUpperCase() + t.labels.PBNA_MOBILE_MIN.slice(1)
    const hour = (mins / 60) | 0
    const min = mins % 60 | 0
    return hour + ' ' + hrWithInitialCap + ' ' + min + ' ' + minWithInitialCap
}

export const getTimeFromMinsWithHrs = (mins) => {
    const hour = (mins / 60) | 0
    const min = mins % 60 | 0
    return hour + ' ' + t.labels.PBNA_MOBILE_HRS + ' ' + min + ' ' + t.labels.PBNA_MOBILE_MIN
}

export const formatClock = (time) => {
    let returnStr = ''
    if (time.hour !== 0) {
        returnStr += time.hour + ' ' + t.labels.PBNA_MOBILE_HR + ' '
    }
    if (time.min !== 0) {
        returnStr += time.min + ' ' + t.labels.PBNA_MOBILE_MIN
    }
    if (time.hour === 0 && time.min === 0) {
        returnStr += '0 ' + t.labels.PBNA_MOBILE_MIN
    }
    return returnStr
}

export const getTimeWithFormat = (time, formatStr) => {
    if (time < 0) {
        return time
    }
    const hourStr = time > 60 ? time / 60 : 0
    const minStr = time > 0 ? time % 60 : 0
    return moment.utc().hours(hourStr).minutes(minStr).format(formatStr)
}

export const sameDay = (targetTime, baseTime?: string) => {
    const todayDate = moment(baseTime || new Date())
    const targetDate = moment(targetTime)
    return todayDate.isSame(targetDate, MOMENT_STARTOF.DAY)
}

export const diffDay = (targetTime, baseTime?: string) => {
    const todayDate = moment(baseTime || new Date())
    const targetDate = moment(targetTime)
    return todayDate.diff(targetDate, MOMENT_STARTOF.DAY)
}
export default Utils

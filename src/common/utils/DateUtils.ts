/*
 * @Description: Utils for date operation
 * @Author: Shangmin Dou
 * @Date: 2021-03-11 05:01:23
 * @LastEditTime: 2022-04-17 22:56:24
 * @LastEditors: Mary Qian
 */

import moment from 'moment'
import _ from 'lodash'
import { t } from '../i18n/t'

export const getISO8601StringWithoutTimezone = (momentData?: moment.Moment) => {
    return momentData
        ? momentData.format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z'
        : moment().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z'
}

export const addZeroClock = (date: string) => {
    return date + 'T00:00:00.000Z'
}

export const getTimeString = (timeStr: string, unitNum = 60000) => {
    const timeNum = Number(timeStr || 0)
    const durationStr = _.ceil(timeNum / unitNum)
    const hourStr = _.floor(durationStr / 60)
    const minStr = _.floor(durationStr % 60)
    return (
        hourStr + ` ${t.labels.PBNA_MOBILE_HR.toLowerCase()} ` + minStr + ` ${t.labels.PBNA_MOBILE_MIN.toLowerCase()}`
    )
}

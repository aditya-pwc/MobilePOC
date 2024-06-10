/*
 * @Description:TimeZoneUtils
 * @Author: Mary Qian
 * @Date: 2021-09-18 01:48:15
 * @LastEditTime: 2022-11-27 12:12:53
 * @LastEditors: Mary Qian
 */

import axios from 'axios'
import _ from 'lodash'
import moment, { Moment } from 'moment'
import * as RNLocalize from 'react-native-localize'
import { CommonParam } from '../../common/CommonParam'
import { addDaysToToday } from '../../common/utils/YMDUtils'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'

type Time = string | Date | Moment

export const timeFix = axios.create({
    timeout: 1000
})

export const setDefaultTimezone = () => {
    const timezone = RNLocalize.getTimeZone()
    moment.tz.setDefault(timezone)

    // uncomment code when timezone change to user's timezone
    // moment.tz.setDefault(CommonParam.userTimeZone)
}

export const setLoggedInUserTimezone = () => {
    moment.tz.setDefault(CommonParam.userTimeZone || RNLocalize.getTimeZone())
}

// should not export this method
const isOnlyDateString = (time: Time) => {
    return typeof time === 'string' && time?.length === 10 && time[4] === '-' && time[7] === '-'
}

export const formatByGMT = (time: Time, format: string) => {
    return time ? moment(time).tz('GMT').format(format) : ''
}

// should not export this method
const formatOnlyDate = (date: string, format: string) => {
    const date1 = moment(date + '+00:00', 'YYYY-MM-DDZ').toDate()
    return formatByGMT(date1, format)
}

// if you want format in standard timezone, use formatByGMT instead
export const formatWithTimeZone = (time: Time, format: string, inUserTimezone = false, showTimezone = false) => {
    if (isOnlyDateString(time)) {
        return formatOnlyDate(time as string, format)
    }
    const fmt = showTimezone ? `${format} z` : format
    const tz = CommonParam.userTimeZone
    if (inUserTimezone && !_.isEmpty(tz)) {
        return time ? moment(time).tz(tz).format(fmt) : ''
    }
    return time ? moment(time).format(fmt) : ''
}

export const getLastSundayDate = () => {
    const tz = CommonParam.userTimeZone
    const date = moment().tz(tz).startOf('week').subtract('week', 1).format(TIME_FORMAT.Y_MM_DD)
    return date
}

export const isSameDayWithTimeZone = (time1: string | Date, time2: string | Date, inUserTimezone = false) => {
    const format = TIME_FORMAT.YMMDD
    const day1 = formatWithTimeZone(time1, format, inUserTimezone)
    const day2 = formatWithTimeZone(time2, format, inUserTimezone)

    return day1 === day2
}

export const isTodayDayWithTimeZone = (time: string, inUserTimezone = false) => {
    return isSameDayWithTimeZone(new Date(), time, inUserTimezone)
}

export const todayDateWithTimeZone = (inUserTimezone = false) => {
    return formatWithTimeZone(new Date(), TIME_FORMAT.Y_MM_DD, inUserTimezone, false)
}

export const tomorrowDateWithTimeZone = (inUserTimezone = false) => {
    return formatWithTimeZone(new Date(+new Date() + 24 * 60 * 60 * 1000), TIME_FORMAT.Y_MM_DD, inUserTimezone, false)
}

// this comparison is based on localTime
export const diffDaysFromToday = (date: string) => {
    if (date.length <= 0) {
        return 0
    }

    const compareDate = moment(date)
    const now = moment().startOf('day')
    const days = compareDate.diff(now, 'days')
    return days || 0
}

export const getTimezoneOffset = () =>
    CommonParam.userTimeZone ? moment().tz(CommonParam.userTimeZone).format('Z').toString() : 'localtime'

// input: '2022-02-14'
// output: today: '2022-03-14T04:00:00.000 ', tomorrow: '2022-03-15T04:00:00.000' (04:00:00 is dynamic, depending on userTimeZone)
export const getLocalQueryByDate = (visitDate: string) => {
    const format = TIME_FORMAT.YMDHMS
    const z = moment().tz(CommonParam.userTimeZone).format('Z')
    const dateStr = visitDate + ' 00:00:00' + z
    const today = moment(dateStr).tz('GMT').format(format)
    const tomorrow = moment(dateStr).add(1, 'days').tz('GMT').format(format)

    return { today, tomorrow }
}

const transferQueryDateTime = (query) => {
    const array = query.split(':')
    const lastOrNext = array[0]
    let days = array[1]

    if (lastOrNext.toUpperCase() === 'LAST_N_DAYS') {
        days = -days
    }

    const realDate = addDaysToToday(days, true)

    if (array[2].toLowerCase() === 'date') {
        return realDate
    }

    const originTime = `${realDate}T00:00:00${CommonParam.userTimeZoneZ}`
    return moment(originTime).tz('GMT').format(TIME_FORMAT.YMDTHMS) + 'Z'
}

export const transferDateTimeInQuery = (query) => {
    let q = query
    const timeRegex = /(NEXT_N_DAYS|LAST_N_DAYS):\d+:(date|time)/i

    while (q.search(timeRegex) > -1) {
        const dateTimeQuery = q.match(timeRegex)[0]
        const newDateTime = transferQueryDateTime(dateTimeQuery)
        q = q.replace(timeRegex, newDateTime)
    }

    return q
}

export const fixTimeWithServer = async () => {
    try {
        // Disable for static url
        // eslint-disable-next-line no-restricted-syntax
        await timeFix.get('https://www.google.com').then((res) => {
            const serverTime = new Date(res.headers.date).getTime()
            const localTime = +new Date()
            const diff = serverTime - localTime
            moment.now = function () {
                return Date.now ? Date.now() + diff : +new Date() + diff
            }
        })
    } catch (err) {}
}

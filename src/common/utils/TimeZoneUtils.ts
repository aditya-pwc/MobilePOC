import moment, { Moment } from 'moment'
import * as RNLocalize from 'react-native-localize'
import 'moment-timezone'
import { CommonParam } from '../CommonParam'
import _ from 'lodash'
import { TIME_FORMAT } from '../enums/TimeFormat'
import { t } from '../i18n/t'

type timeFormat = string | Date | Moment

const FMT = TIME_FORMAT.Y_MM_DD

export const setDefaultTimezone = () => {
    const timezone = RNLocalize.getTimeZone()
    moment.tz.setDefault(timezone)

    // uncomment code when timezone change to user's timezone
    // moment.tz.setDefault(CommonParam.userTimeZone)
}

// input should be 'YYYY-MM-DD' format and output is 'YYYY-MM-DD' too
export const addDayToDate = (dateStr: string, days: number) => {
    const newDate = moment(dateStr).add(days, 'd')
    return newDate.format(FMT)
}

// should not export this method
const isOnlyDateString = (time: timeFormat) => {
    return typeof time === 'string' && time?.length === 10 && time[4] === '-' && time[7] === '-'
}

export const formatByGMT = (time: timeFormat, format: string) => {
    return time ? moment(time).tz('GMT').format(format) : ''
}

// should not export this method
const formatOnlyDate = (date: string, format: string) => {
    const date1 = moment(date + '+00:00', 'YYYY-MM-DDZ').toDate()
    return formatByGMT(date1, format)
}

// if you want format in standard timezone, use formatByGMT instead
export const formatWithTimeZone = (
    time: timeFormat,
    format: string,
    inUserTimezone = false,
    showTimezone = false
): string => {
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

export const todayDateWithTimeZone = (inUserTimezone = false): string => {
    return formatWithTimeZone(new Date(), TIME_FORMAT.Y_MM_DD, inUserTimezone, false)
}

export const addDaysToToday = (days: number, inUserTimezone = false) => {
    return addDayToDate(todayDateWithTimeZone(inUserTimezone), days)
}

export const setLoggedInUserTimezone = () => {
    moment.tz.setDefault(CommonParam.userTimeZone || RNLocalize.getTimeZone())
}

export const getTimeFromMins = (mins) => {
    const tmpMins = Math.round(mins)
    const hour = (tmpMins / 60) | 0
    const min = tmpMins % 60 | 0
    if (hour < 1) {
        return min + ' ' + t.labels.PBNA_MOBILE_MIN
    }
    if (hour >= 1 && hour < 2) {
        if (min === 0) {
            return hour + ' ' + t.labels.PBNA_MOBILE_HR
        }
        if (min === 0) {
            return hour + ' ' + t.labels.PBNA_MOBILE_HR
        }
        return hour + ` ${t.labels.PBNA_MOBILE_HR} ` + min + ' ' + t.labels.PBNA_MOBILE_MIN
    }
    if (min === 0) {
        return hour + ' ' + t.labels.PBNA_MOBILE_HRS
    }
    return hour + ` ${t.labels.PBNA_MOBILE_HRS} ` + min + ' ' + t.labels.PBNA_MOBILE_MIN
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

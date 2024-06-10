/*
 * @Description: all the string format should be YYYY-MM-DD
 * @Author: Mary Qian
 * @Date: 2022-07-20 11:55:12
 * @LastEditTime: 2022-07-28 11:18:30
 * @LastEditors: Mary Qian
 */

import moment from 'moment'
import { todayDateWithTimeZone } from '../../savvy/utils/TimeZoneUtils'
import { TIME_FORMAT } from '../enums/TimeFormat'

const FMT = TIME_FORMAT.Y_MM_DD

/*
 * diffDays('2022-05-22', '2022-05-23') // -1
 * diffDays('2022-05-22', '2022-05-22') // 0
 * diffDays('2022-05-22', '2022-05-21') // 1
 */
export const diffDays = (dateStr1: string, dateStr2: string) => {
    return moment(dateStr1).diff(moment(dateStr2), 'days')
}

// input should be 'YYYY-MM-DD' format and output is 'YYYY-MM-DD' too
export const addDayToDate = (dateStr: string, days: number) => {
    const newDate = moment(dateStr).add(days, 'd')
    return newDate.format(FMT)
}

export const addDaysToToday = (days: number, inUserTimezone = false) => {
    return addDayToDate(todayDateWithTimeZone(inUserTimezone), days)
}

/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-08-10 02:52:06
 * @LastEditTime: 2021-12-03 04:32:11
 * @LastEditors: Mary Qian
 */
import moment from 'moment'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../common/enums/MomentStartOf'

const convertUTCToLocalTime = (timeString) => {
    const localTime = moment(timeString)
    const date = localTime.format(TIME_FORMAT.Y_MM_DD)
    const time = localTime.format(TIME_FORMAT.HHMMSS)
    const string = `${date}T${time}.000Z`
    return moment(string)
}

const isTodayTime = (time: any) => {
    const todayStart = moment().startOf(MOMENT_STARTOF.DAY)
    const todayEnd = moment().endOf(MOMENT_STARTOF.DAY)

    const completeDate = moment(time)
    return completeDate >= todayStart && completeDate <= todayEnd
}

export const MomentService = {
    isTodayTime,
    convertUTCToLocalTime
}

export default MomentService

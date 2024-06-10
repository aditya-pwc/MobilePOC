/*
 * @Description:
 * @Author: Aimee Zhang
 * @Date: 2022-01-21 00:31:36
 * @LastEditTime: 2023-11-01 14:15:13
 * @LastEditors: Mary Qian
 */

import { Log } from '../../common/enums/Log'
import { storeClassLog } from '../../common/utils/LogUtils'

export const recordAMASLogs = (type: string, message: string) => {
    storeClassLog(Log.MOBILE_INFO, 'AMAS - ' + type, message)
}

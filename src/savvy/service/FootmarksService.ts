import { NativeModules } from 'react-native'
import { CommonParam } from '../../common/CommonParam'
import { Log } from '../../common/enums/Log'
import { getStringValue } from '../utils/LandingUtils'
import { storeClassLog } from '../../common/utils/LogUtils'

const { FootmarksManager } = NativeModules

const register = (gpid) => {
    FootmarksManager.registerFootmarks(gpid)
        .then(() => {
            storeClassLog(Log.MOBILE_INFO, 'Footmarks register', 'Footmarks register success')
            CommonParam.footmarkRegistered = true
        })
        .catch((err) => {
            storeClassLog(Log.MOBILE_INFO, 'Footmarks register', `Footmarks register failed ${getStringValue(err)}`)
            CommonParam.footmarkRegistered = false
        })
}
export const FootmarksService = {
    register
}

export default FootmarksService

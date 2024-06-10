import { SyncDownConfig } from 'common-mobile-lib/@common-mobile-lib/sf-sync-engine/src/Interface'
import BaseInstance from '../../../common/BaseInstance'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import MobileError from 'common-mobile-lib/@common-mobile-lib/base-utils/src/MobileError'
import { RestMethod } from 'common-mobile-lib/@common-mobile-lib/sf-http-client/src/Interface'
import { AxiosRequestConfig } from 'axios'

class CommonSync {
    public static async syncDown(config: SyncDownConfig) {
        try {
            return await BaseInstance.sfSyncEngine.syncDown(config)
        } catch (err: any) {
            storeClassLog(Log.MOBILE_ERROR, 'Orderade: syncDown', `syncDown failed: ${ErrorUtils.error2String(err)}`)
            throw new MobileError(ErrorUtils.error2String(err), 'syncDown', err, config)
        }
    }

    public static restDataCommonCall(path: string, method: RestMethod, body?: object, config?: AxiosRequestConfig) {
        return BaseInstance.sfHttpClient.callData(path, method, body, config)
    }
}

export default CommonSync

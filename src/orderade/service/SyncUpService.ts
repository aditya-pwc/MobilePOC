import NetInfo from '@react-native-community/netinfo'
import { CommonParam } from '../../common/CommonParam'
import { Log } from '../../common/enums/Log'
import { storeClassLog } from '../../common/utils/LogUtils'
import ProductService from '../service/ProductService'
import VisitService from '../service/VisitService'
import { syncUpOrdersToOch } from '../utils/OchUtils'
import OrderService from './OrderService'

export default class SyncUpService {
    static curSyncUpLocalDataPromise: Promise<void> | null = null

    public static async _syncUpLocalData(isPast?: boolean) {
        const state = await NetInfo.fetch()
        if (state?.isInternetReachable) {
            if (CommonParam.isSyncing) {
                return
            }
            CommonParam.isSyncing = true
            try {
                await storeClassLog(Log.MOBILE_INFO, 'Orderade: syncUpLocalData', `sync up started`)
                const resultsFromOch = await syncUpOrdersToOch(isPast)
                await VisitService.syncUpVLLocalData()
                await VisitService.syncUpVisitLocalData()
                await OrderService.syncUpOrderLocalData(resultsFromOch)
                await ProductService.syncUpStoreProducts()
            } catch (e) {
                await storeClassLog(
                    Log.MOBILE_ERROR,
                    'Orderade: syncUpLocalData',
                    `syncUpLocalData failed: ${JSON.stringify(e)}`
                )
            } finally {
                CommonParam.isSyncing = false
            }
        }
    }

    public static syncUpLocalData() {
        if (!this.curSyncUpLocalDataPromise) {
            this.curSyncUpLocalDataPromise = this._syncUpLocalData().then(() => {
                this.curSyncUpLocalDataPromise = null
            })
        }
        return this.curSyncUpLocalDataPromise
    }
}

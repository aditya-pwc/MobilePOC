/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-11-16 04:48:33
 * @LastEditTime: 2023-10-23 17:00:06
 * @LastEditors: Mary Qian
 */

import _ from 'lodash'
import { DeviceEventEmitter } from 'react-native'
import { CommonParam } from '../../../common/CommonParam'
import MerchandiserConfig from '../../config/MerchandiserConfig'
import { EVENT_EMITTER } from '../../enums/MerchandiserEnums'
import { addADLog, recordSyncingLogs } from '../../helper/merchandiser/MyVisitHelper'
import { SoupService } from '../../service/SoupService'
import SyncService from '../../service/SyncService'
import { syncDataForNewStore } from '../../utils/MerchandiserUtils'
import NetInfo from '@react-native-community/netinfo'
import { Log } from '../../../common/enums/Log'
import { storeClassLog } from '../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const orderSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'Order')
const orderItemSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'OrderItem')
const shipmentSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'Shipment')
const shipmentItemSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'ShipmentItem')

const getNewStoreIds = async () => {
    const visitSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'Visit')
    await SyncService.syncDownObjWithCond(visitSoup, true)
    const latestVisitArray = await SoupService.retrieveDataFromSoup('Visit', {}, [])
    return _.uniq(latestVisitArray.map((i) => i.PlaceId))
}

const getNewAccountIds = async (newStoreIds: string[]) => {
    const accountSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'Account')
    await SyncService.syncDownObjWithCondForNew(accountSoup, newStoreIds, [])
    const latestAccountArray = await SoupService.retrieveDataFromSoup('Account', {}, [])
    return _.uniq(latestAccountArray.map((i) => i.Id))
}

const autoRefresh = async () => {
    if (CommonParam.isSyncing) {
        return
    }
    NetInfo.fetch().then(async (state) => {
        if (state.isInternetReachable) {
            try {
                addADLog('autoRefresh start')
                recordSyncingLogs('AutoRefresh: CommonParam.isSyncing setting true')
                CommonParam.isSyncing = true
                const newStoreIds = await getNewStoreIds()
                const newAccountIds = await getNewAccountIds(newStoreIds)
                await syncDataForNewStore(newStoreIds, newAccountIds)
                CommonParam.isSyncing = false
                await SyncService.syncDownObjWithCond(orderItemSoup, true)
                await SyncService.syncDownObjWithCond(shipmentSoup, true)
                await SyncService.syncDownObjWithCond(orderSoup, true)
                await SyncService.syncDownObjWithCond(shipmentItemSoup, true)
                recordSyncingLogs('AutoRefresh: CommonParam.isSyncing setting false')
                addADLog('autoRefresh end')
            } catch (err) {
                recordSyncingLogs(`AutoRefresh: CommonParam.isSyncing err: ${ErrorUtils.error2String(err)}`)
                storeClassLog(Log.MOBILE_ERROR, 'AutoREfreshOfSchedule.autoRefresh', ErrorUtils.error2String(err))
                CommonParam.isSyncing = false
            }
        }
    })
    DeviceEventEmitter.emit(EVENT_EMITTER.REFRESH_MY_VISITS)
}

export const AutoRefreshOfSchedule = {
    autoRefresh
}

export default AutoRefreshOfSchedule

import AsyncStorage from '@react-native-async-storage/async-storage'
import _ from 'lodash'
import { CommonParam } from '../../common/CommonParam'
import { Log } from '../../common/enums/Log'
import { retrieveAssetAttribute } from '../hooks/EquipmentHooks'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const ASSET_ATTRIBUTE_LAST_SYNC_TIME = 'assetAttributeLastSyncTime'

const getAssetAttributeLastSyncTime = async () => {
    return await AsyncStorage.getItem(ASSET_ATTRIBUTE_LAST_SYNC_TIME)
}

const setAssetAttributeLastSyncTime = async () => {
    await AsyncStorage.setItem(ASSET_ATTRIBUTE_LAST_SYNC_TIME, new Date().toISOString())
}

const removeAssetAttributeLastSyncTime = async () => {
    await AsyncStorage.removeItem(ASSET_ATTRIBUTE_LAST_SYNC_TIME)
}

// delta sync asset attribute after first time full sync
const syncAssetAttribute = async () => {
    try {
        const assetAttributeLastSyncTime = (await getAssetAttributeLastSyncTime()) || ''
        if (!_.isEmpty(assetAttributeLastSyncTime)) {
            await retrieveAssetAttribute(assetAttributeLastSyncTime)
        } else {
            await retrieveAssetAttribute()
        }
        setAssetAttributeLastSyncTime()
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, 'Sync asset attribute', CommonParam.userId + ErrorUtils.error2String(e))
    }
}

const syncLatestAssetAttributeWithLoading = async (setIsSyncingAssetAttr: Function) => {
    setIsSyncingAssetAttr(true)
    await syncAssetAttribute()
    setIsSyncingAssetAttr(false)
}

export const AssetAttributeService = {
    getAssetAttributeLastSyncTime: getAssetAttributeLastSyncTime,
    setAssetAttributeLastSyncTime: setAssetAttributeLastSyncTime,
    removeAssetAttributeLastSyncTime: removeAssetAttributeLastSyncTime,
    syncAssetAttribute: syncAssetAttribute,
    syncLatestAssetAttributeWithLoading: syncLatestAssetAttributeWithLoading
}

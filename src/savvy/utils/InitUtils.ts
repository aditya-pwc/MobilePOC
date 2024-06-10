/*
 * @Description:
 * @Author: Shangmin Dou
 * @Date: 2021-09-15 20:13:57
 * @LastEditTime: 2024-02-23 14:19:23
 * @LastEditors: Tom tong.jiang@pwc.com
 */
import { CommonParam } from '../../common/CommonParam'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SoupService } from '../service/SoupService'
import _ from 'lodash'
import { Log } from '../../common/enums/Log'
import { Persona } from '../../common/enums/Persona'
import { getBuildNumber } from 'react-native-device-info'
import { checkAppVersion, getMobileSyncConfig } from '../api/ApexApis'
import { cleanAllSoups } from './SoupUtils'
import moment from 'moment'
import MerchandiserConfig from '../config/MerchandiserConfig'
import SyncService from '../service/SyncService'
import { setDefaultTimezone, setLoggedInUserTimezone } from './TimeZoneUtils'
import AppInitUtils from './AppInitUtils'
import FSRConfig from '../config/FSRConfig'
import PSRConfig from '../config/PSRConfig'
import FSManagerConfig from '../config/FSManagerConfig'
import MerchManagerConfig from '../config/MerchManagerConfig'
import UGMConfig from '../config/UGMConfig'
import DelSupConfig from '../config/DelSupConfig'
import SDLConfig from '../config/SDLConfig'
import SystemAdministratorConfig from '../config/SystemAdministratorConfig'
import CRMBusinessAdminConfig from '../config/CRMBusinessAdminConfig'
import KAMConfig from '../config/KAMConfig'
import { getStringValue } from './LandingUtils'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { storeClassLog } from '../../common/utils/LogUtils'
import { checkDBStructure, exeAsyncFunc } from '../../common/utils/CommonUtils'
import { SyncConfig } from '../config/SyncConfig'
import store from '../redux/store/Store'
import { resetEquipmentSharePointState } from '../redux/Slice/EquipmentSharePointSlice'
import { AssetAttributeService } from '../service/AssetAttributeService'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { checkNetworkConnection } from './NetworkUtils'
import { resetMyDayState } from '../../orderade/redux/slice/MyDaySlice'
import OrderService from '../../orderade/service/OrderService'

interface AppConfig {
    tab: string[]
    objs: any
}

const noon = 12

export const genConfigArray = () => {
    return [
        FSRConfig,
        PSRConfig,
        FSManagerConfig,
        MerchManagerConfig,
        UGMConfig,
        DelSupConfig,
        SDLConfig,
        SystemAdministratorConfig,
        CRMBusinessAdminConfig,
        MerchandiserConfig,
        KAMConfig
    ]
}

/**
 * @description Get user configuration
 */
export const getUserConfiguration = (persona: string) => {
    return new Promise<AppConfig>((resolve, reject) => {
        const configArray = genConfigArray()
        const config = configArray.find((item) => {
            return item.name === persona
        })
        if (config) {
            resolve(config)
        } else {
            reject('No Configuration')
        }
    })
}

export const getOnlineSyncConfig = async () => {
    const { data } = await getMobileSyncConfig()
    if (data.length > 0) {
        const syncConfig = JSON.parse(data)
        CommonParam.syncConfig = syncConfig
        await AsyncStorage.setItem('mobile_sync_config', data)
        return syncConfig
    }
    await Promise.reject('Could not get the sync config')
}

export const getLocalSyncConfig = async () => {
    const data = await AsyncStorage.getItem('mobile_sync_config')
    if (data) {
        const syncConfig = JSON.parse(data)
        CommonParam.syncConfig = syncConfig
        return syncConfig
    }
    await Promise.reject('Could not get the sync config locally')
}
export const deleteEquipmentImageData = async () => {
    await AsyncStorage.removeItem('equipmentSharePointToken')
    await AsyncStorage.removeItem('equipmentSharePointImageMap')
    await AsyncStorage.removeItem('equipmentSharePointTokenExpireTime')
    await store.dispatch(resetEquipmentSharePointState())
}

export const resetReduxState = async () => {
    await store.dispatch(resetMyDayState())
}

export const clearDatabase = async (cleanAssetAttr?: boolean, clearCartData?: boolean, skipIncrementObj?: boolean) => {
    const objs = CommonParam.objs
    let PSRIncrementSkipArr
    if (CommonParam.PERSONA__c === Persona.PSR) {
        PSRIncrementSkipArr = [
            'Price_Zone__c',
            'Deal__c',
            'Business_Segment_Deal__c',
            'Natl_Account_Pricing__c',
            'Wholesale_Price__c'
        ]
    }
    for (const obj of objs) {
        if (CommonParam.PERSONA__c === Persona.PSR) {
            if (obj.name === 'Preset') {
                continue
            }
            if (PSRIncrementSkipArr.includes(obj.name) && skipIncrementObj) {
                continue
            }
            if (!clearCartData) {
                if (
                    ['CartDetail', 'CartItem', 'Ord_Staging__c', 'OrdLineItem_Staging__c', 'LogItem'].includes(obj.name)
                ) {
                    continue
                    // for PSR, we need to keep order staging fake orders for display
                    // fake orders have Ids, but Id equal to Ordr_Id__c
                    // fake orderItems does not have Ids
                } else if (obj.name === 'Order') {
                    OrderService.deleteOrderKeepLocal()
                    continue
                } else if (obj.name === 'OrderItem') {
                    OrderService.deleteOrderItemKeepLocal()
                    continue
                }
            }
        }
        if (obj.name === 'Asset_Attribute__c' && !cleanAssetAttr) {
            continue
        }
        await SoupService.clearSoup(obj.name)
    }
    await deleteEquipmentImageData()
    await resetReduxState()
}

/**
 * @description init the app configuration
 */
export const initAppConfig = async () => {
    try {
        CommonParam.syncConfig = SyncConfig
        const mobileSyncConfig = await AsyncStorage.getItem('mobile_sync_config')
        if (mobileSyncConfig) {
            CommonParam.syncConfig = JSON.parse(mobileSyncConfig)
        }

        const config = await getUserConfiguration(CommonParam.PERSONA__c)
        const { tab, objs } = config
        CommonParam.tab = tab
        CommonParam.objs = objs

        await checkDBStructure(AppInitUtils.initSoupAndSync, objs, () => {
            CommonParam.isFirstTimeUser = true
        })
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'InitUtils.initAppConfig',
            'InitUtils.initAppConfig' + ErrorUtils.error2String(error)
        )
    }
}

export const recordSyncFlag = async () => {
    try {
        const isSyncSuccessfully = ['isSyncSuccessfully', 'true']
        setDefaultTimezone()
        const lastSyncDate = ['lastSyncDate', moment().format(TIME_FORMAT.Y_MM_DD)]
        await AsyncStorage.multiSet([isSyncSuccessfully, lastSyncDate])
        setLoggedInUserTimezone()
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, 'recordSyncFlag', e)
    }
}

export const forceInitSyncDaily = async (navigation?) => {
    if (CommonParam.PERSONA__c === Persona.KEY_ACCOUNT_MANAGER) {
        return
    }
    try {
        const connectionState = await checkNetworkConnection()
        if (connectionState.isInternetReachable) {
            const lastSyncDate = await AsyncStorage.getItem('lastSyncDate')
            setDefaultTimezone()
            const today = moment().format(TIME_FORMAT.Y_MM_DD)
            setLoggedInUserTimezone()
            if (lastSyncDate !== today) {
                if (CommonParam.PERSONA__c === Persona.PSR) {
                    CommonParam.isPSRForceDailySync = true
                }
                await AsyncStorage.removeItem('isSyncSuccessfully')
                if (
                    CommonParam.PERSONA__c &&
                    CommonParam.PERSONA__c !== '' &&
                    CommonParam.PERSONA__c !== Persona.MERCHANDISER &&
                    CommonParam.PERSONA__c !== Persona.FSR &&
                    CommonParam.PERSONA__c !== Persona.FS_MANAGER
                ) {
                    await clearDatabase(false, false, true)
                } else {
                    if (CommonParam.Is_Night_Shift__c) {
                        const currentTime = new Date()
                        const noonTime = new Date()
                        noonTime.setHours(noon)
                        noonTime.setMinutes(0)
                        noonTime.setSeconds(0)
                        noonTime.setMilliseconds(0)
                        if (currentTime.getTime() < noonTime.getTime()) {
                            return
                        }
                    }
                }
                await exeAsyncFunc(async () => {
                    const { data } = await getMobileSyncConfig()
                    if (data.length > 0) {
                        const newSyncConfig = JSON.parse(data)
                        await AsyncStorage.setItem('mobile_sync_config', data)
                        const oldSyncConfig = _.cloneDeep(CommonParam.syncConfig)
                        CommonParam.syncConfig = newSyncConfig
                        const mobileSyncConfig = await AsyncStorage.getItem('mobile_sync_config')
                        if (mobileSyncConfig) {
                            CommonParam.syncConfig = JSON.parse(mobileSyncConfig)
                        }
                        if (mobileSyncConfig) {
                            if (!_.isEqual(oldSyncConfig, newSyncConfig)) {
                                await clearDatabase()
                                CommonParam.isFirstTimeUser = true
                                await AsyncStorage.multiRemove([
                                    'configLastSyncTime',
                                    'lastSyncDependentIds',
                                    'isSyncSuccessfully'
                                ])
                            }
                        }
                    }
                })
                CommonParam.isFirstTimeUser = true
                if (navigation) {
                    navigation.navigate('LandingSavvy')
                }
            }
        } else {
            storeClassLog(
                Log.MOBILE_ERROR,
                'forceInitSyncDaily',
                'forceInitSyncDaily no internet:' + getStringValue(connectionState)
            )
        }
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, 'forceInitSyncDaily', getStringValue(e))
    }
}

export const forceSyncDeliveries = async () => {
    try {
        const orderSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'Order')
        const orderItemSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'OrderItem')
        const shipmentSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'Shipment')
        const shipmentItemSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'ShipmentItem')
        await SyncService.syncDownObjWithCond(orderItemSoup, true)
        await SyncService.syncDownObjWithCond(shipmentSoup, true)
        await SyncService.syncDownObjWithCond(orderSoup, true)
        await SyncService.syncDownObjWithCond(shipmentItemSoup, true)
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, 'forceInitSyncDaily', e)
    }
}

/**
 * @description Check the app version
 */
export const checkDbAndAppVersion = async (navigation, inInitSync?: boolean) => {
    let allowAccess = true
    const localAppVersion = getBuildNumber()
    const localDbVersion = await AsyncStorage.getItem('local_db_version')
    const { data } = await checkAppVersion(localAppVersion, localDbVersion || '')
    if (data.needUpdateApp && !__DEV__) {
        navigation.navigate('UpdateNoticeScreen', { displayMessageFromBackend: data.displayMessage })
        allowAccess = false
    } else if (!_.isEmpty(localDbVersion) && data.needInitSync) {
        await cleanAllSoups()
        CommonParam.isFirstTimeUser = true
        await AsyncStorage.removeItem('isSyncSuccessfully')
        await AsyncStorage.removeItem('configLastSyncTime')
        await AsyncStorage.removeItem('lastSyncDependentIds')
        await AsyncStorage.removeItem('PlanogramLocal')
        await AssetAttributeService.removeAssetAttributeLastSyncTime()
        if (!inInitSync) {
            navigation.navigate('LandingSavvy')
        }
    }
    await AsyncStorage.setItem('local_db_version', data.backendDatabaseVersion)
    return allowAccess
}

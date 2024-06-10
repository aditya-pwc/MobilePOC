import _ from 'lodash'
import { CommonParam } from '../../common/CommonParam'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SoupService } from '../service/SoupService'
import { Persona, isPersonaPSR } from '../../common/enums/Persona'
import { initSyncForCRM, initSyncForFsrAndFsm, initSyncForKAM, initSyncForRep } from '../api/InitSyncUtils'
import { syncDownObj } from '../api/SyncUtils'
import {
    getDAMAccessToken,
    switchATCEntrance,
    refreshSalesDocumentsDateFlag,
    clearTotalSalesDocuments
} from './InnovationProductUtils'
import { forceInitSyncDaily, initAppConfig, recordSyncFlag } from './InitUtils'
import { Log } from '../../common/enums/Log'
import SyncService from '../service/SyncService'
import MerchandiserConfig from '../config/MerchandiserConfig'
import CustomLabelUtils from './CustomLabelUtils'
import { Instrumentation } from '@appdynamics/react-native-agent'
import {
    getRecordTypeMapping,
    initConfigByPersona,
    retrievePhotos,
    syncDownDeliveryMap,
    syncVLData,
    syncWorkOrders
} from './MerchandiserUtils'
import InStoreMapService from '../service/InStoreMapService'
import { t } from '../../common/i18n/t'
import { exeAsyncFunc } from '../../common/utils/CommonUtils'
import { syncDownBusinessSegmentPicklistItem } from '../api/ApexApis'
import { generateSurveyData } from './SurveyUtils'
import { AssetAttributeService } from '../service/AssetAttributeService'
import { initManager, syncDownInitialAndDeltaQuery } from './MerchManagerUtils'
import { initSDL } from './sdlUtils'
import { initDelSup } from './DelSupUtils'
import {
    appendLog,
    deleteLocalLogsExceed48Hours,
    fetchLogInfo,
    syncUpLogs,
    storeClassLog
} from '../../common/utils/LogUtils'
import { getCustomLabel, getUserLanguage } from '../i18n/Utils'
import { addADLog } from '../helper/merchandiser/MyVisitHelper'
import { getI18nLandingTips, LandingTips } from '../../common/enums/Tips'
import BaseInstance from '../../common/BaseInstance'
import SfSoupEngine from 'common-mobile-lib/@common-mobile-lib/sf-soup-engine/src/SfSoupEngine'
import { smartstore } from 'react-native-force'
import { baseObjects } from '../../common/config/BaseObjects'
import { SoupModel } from 'common-mobile-lib/@common-mobile-lib/sf-soup-engine/src/SfSoupInterface'
import moment from 'moment/moment'
import BreadcrumbsService from '../service/BreadcrumbsService'
import FootmarksService from '../service/FootmarksService'
import { getCustomApi } from '../api/ApiUtil'
import { customDelay } from './CommonUtils'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { logout } from './SessionUtils'
import { getUserInfo } from '../../common/pages/LoginScreen/UserUtils'
import { CommonActions } from '@react-navigation/native'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { formatWithTimeZone } from './TimeZoneUtils'
import { checkLocalDataCount, retrieveAssetAttribute } from '../hooks/EquipmentHooks'
import dayjs from 'dayjs'
import Utc from 'dayjs/plugin/utc'
import { COMPLETED, IN_PROGRESS, MyDayStatusOrder, YET_2_START } from '../helper/manager/AllManagerMyDayHelper'
import { syncFeatureToggle } from './FeatureToggleUtils'
import OrderDM from '../../orderade/domain/order/OrderDM'
import { preloadImgs } from '../helper/rep/RealogramViewHelper'
import CommonService from '../../orderade/service/CommonService'

export const getStringValue = (value) => {
    try {
        if (typeof value !== 'string') {
            if (Array.isArray(value)) {
                return JSON.stringify(value)
            }
            if (_.isError(value)) {
                const obj = {
                    ErrorName: value.name,
                    ErrorMessage: value.message,
                    Stack: value.stack
                }
                return `${JSON.stringify(Object.entries(obj))}`
            }
            if (typeof value === 'object') {
                return `${JSON.stringify(Object.entries(value))}`
            }
            return `${value}`
        }
        return value
    } catch (error) {
        return error.toString()
    }
}

export const navigateToHome = (navigation, tab?) => {
    navigation.dispatch(
        CommonActions.reset({
            index: 1,
            routes: [
                {
                    name: tab || 'Tab'
                }
            ]
        })
    )
}

const LANDING_ERROR_DELAY_TIME = 5000
const FORCE_SYNC_RECORD_TYPE_SQL = 'SELECT Id,SobjectType,Name,DeveloperName FROM RecordType'

export const initApp = async (setProgress, setSyncText, dropDownRef, navigation) => {
    const storeDate = async () => {
        const lastModifiedDate = new Date().toISOString()
        const lastMyLeadsRefreshDate = new Date().toISOString()
        CommonParam.lastModifiedDate = lastModifiedDate
        CommonParam.lastMyLeadsRefreshDate = lastMyLeadsRefreshDate
        await AsyncStorage.setItem('lastModifiedDate', lastModifiedDate)
        await AsyncStorage.setItem('lastMyLeadsRefreshDate ', lastMyLeadsRefreshDate)
        await AsyncStorage.setItem('configLastSyncTime', lastModifiedDate)
    }

    const setInitialVisitStatus = async () => {
        const myDaySortStatus = [{ status: YET_2_START }, { status: IN_PROGRESS }, { status: COMPLETED }]
        await AsyncStorage.setItem(MyDayStatusOrder.MERCH, JSON.stringify(myDaySortStatus))
        await AsyncStorage.setItem(MyDayStatusOrder.SALES, JSON.stringify(myDaySortStatus))
    }

    const initAppForSr = async () => {
        const recordType = await SoupService.retrieveDataFromSoup('RecordType', {}, [])
        if (
            CommonParam.PERSONA__c === Persona.PSR &&
            (CommonParam.isFirstTimeUser ||
                CommonParam.isSwitchLocation ||
                CommonParam.isSwitchRoute ||
                CommonParam.isPSRForceDailySync)
        ) {
            // Should be placed before * await initSyncForRep(setProgress) *
            // Since the logic in function rely on this toggle
            await CommonService.getOrderingFeatureToggle()
        }
        if (
            CommonParam.isFirstTimeUser ||
            CommonParam.isSwitchRoute ||
            (!CommonParam.isSwitchLocation && (!recordType || recordType.length === 0))
        ) {
            if (CommonParam.PERSONA__c === Persona.FSR || CommonParam.PERSONA__c === Persona.FS_MANAGER) {
                await initSyncForFsrAndFsm(setProgress)
                const syncRetailStoreCount = await AsyncStorage.getItem('Retrieved_RetailStore_Count')
                const syncAssetAttributeCount = await AsyncStorage.getItem('Retrieved_Asset_Attribute_Count')
                const syncRecordTypeCount = await AsyncStorage.getItem('Retrieved_RecordType_Count')
                const { assetAttributeCount, recordTypeCount, retailStoreCount } = await checkLocalDataCount()
                // force sync RecordType even AsyncStorage.getItem('configLastSyncTime') exist
                if (!recordType || recordType.length === 0 || _.toNumber(syncRecordTypeCount) > recordTypeCount) {
                    await syncDownObj('RecordType', FORCE_SYNC_RECORD_TYPE_SQL, true, true)
                    if (_.toNumber(syncRecordTypeCount) > recordTypeCount) {
                        await storeClassLog(
                            Log.MOBILE_WARN,
                            'Rep-localRecordTypeCount',
                            'sync: ' + syncRecordTypeCount + ' ,local: ' + recordTypeCount
                        )
                    }
                }
                if (_.toNumber(syncAssetAttributeCount) > assetAttributeCount) {
                    await retrieveAssetAttribute()
                    await storeClassLog(
                        Log.MOBILE_WARN,
                        'Rep-localAssetAttributeCount',
                        'sync: ' + syncAssetAttributeCount + ' ,local: ' + assetAttributeCount
                    )
                }
                if (_.toNumber(syncRetailStoreCount) > retailStoreCount) {
                    await storeClassLog(
                        Log.MOBILE_WARN,
                        'Rep-localRetailStoreCount',
                        'sync: ' + syncRetailStoreCount + ' ,local: ' + retailStoreCount
                    )
                }
            } else {
                await initSyncForRep(setProgress)
            }
            await storeDate()
        }
        if (CommonParam.PERSONA__c === Persona.PSR) {
            if (!CommonParam.isFirstTimeUser) {
                const routeStr = await AsyncStorage.getItem('psrUserRoute')
                let route
                if (routeStr) {
                    route = JSON.parse(routeStr)
                }
                CommonParam.userRouteId = route?.Id || ''
                CommonParam.userRouteGTMUId = route?.GTMU_RTE_ID__c || ''
                preloadImgs()
            } else {
                await preloadImgs()
            }
            await refreshSalesDocumentsDateFlag()
            await switchATCEntrance()
            await OrderDM.switchOCHMetaDataToggles()
        }
        setProgress(1)
        if (CommonParam.isFirstTimeUser) {
            const logMsg = `${CommonParam.GPID__c} logged into Savvy at ${formatWithTimeZone(
                moment(),
                TIME_FORMAT.YMDTHMS,
                true,
                true
            )}`
            appendLog(Log.MOBILE_INFO, 'orderade:logged into app', logMsg)
        }
        CommonParam.isFirstTimeUser = false
        await recordSyncFlag()
    }

    const initAppForKAM = async () => {
        if (CommonParam.isFirstTimeUser) {
            await initSyncForKAM(setProgress)
            await storeDate()
            await preloadImgs()
        } else {
            preloadImgs()
        }
        setProgress(1)
        CommonParam.isFirstTimeUser = false
        await recordSyncFlag()
    }

    const initAppForCRM = async () => {
        const recordType = await SoupService.retrieveDataFromSoup('RecordType', {}, [])
        if (CommonParam.isFirstTimeUser || !recordType || recordType.length === 0) {
            await initSyncForCRM(setProgress)
            await storeDate()
        }
        setProgress(1)
        CommonParam.isFirstTimeUser = false
        await recordSyncFlag()
    }

    const initAppForMerch = async () => {
        let recordType = null
        try {
            recordType = await SoupService.retrieveDataFromSoup('RecordType', {}, [])
        } catch (error) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'LandingScreen.initAppForMerch.getRecordType',
                'fetchLocalRecordTypeFailed: ' + ErrorUtils.error2String(error)
            )
        }

        try {
            if (!recordType || recordType.length === 0) {
                await SyncService.syncDownObjWithCond(
                    MerchandiserConfig.objs.find((soup) => soup.name === 'RecordType')
                )
            }
        } catch (error) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'LandingScreen.initAppForMerch.fetchSFRecordTypeFailed',
                'fetchSFRecordTypeFailed: ' + ErrorUtils.error2String(error)
            )
        }

        await CustomLabelUtils.getPlanogramLabel(CommonParam.isFirstTimeUser)
        const lastModifiedDate = new Date().toISOString()
        const allModel = CommonParam.objs.filter((model) => model.initQuery).slice(0)
        try {
            Instrumentation.startTimer('Sync up local data')
            await syncVLData()
            await syncWorkOrders()

            const objs = CommonParam.objs
            for (const obj of objs) {
                await SoupService.clearSoup(obj.name)
            }
            Instrumentation.stopTimer('Sync up local data')
        } catch (err) {
            Instrumentation.stopTimer('Sync up local data')
            storeClassLog(Log.MOBILE_ERROR, 'LandingScreen.initAppForMerch', 'Init sync up failed.')
        }

        Instrumentation.startTimer('Sync down sf data')
        await Promise.all([
            InStoreMapService.downloadImages(),
            InStoreMapService.downloadPdf(),
            SyncService.syncDownByPersona(allModel)
        ]).then(async () => {
            CommonParam.lastModifiedDate = lastModifiedDate
            AsyncStorage.setItem('lastModifiedDate', lastModifiedDate)
        })
        Instrumentation.stopTimer('Sync down sf data')
        setProgress(0.7)

        setSyncText(t.labels.PBNA_MOBILE_RETRIEVING_DELIVERY_MANIFEST)
        Instrumentation.startTimer('Sync down delivery manifest')
        await exeAsyncFunc(syncDownDeliveryMap)
        Instrumentation.stopTimer('Sync down delivery manifest')
        setProgress(0.8)

        setSyncText(t.labels.PBNA_MOBILE_RETRIEVING_PICTURES)
        Instrumentation.startTimer('Sync down wo pictures')
        await retrievePhotos()
        Instrumentation.stopTimer('Sync down wo pictures')
        setProgress(0.9)
        await storeClassLog(Log.MOBILE_INFO, 'LandingScreen.initAppForMerch', 'Data synced successfully.')
    }

    const initAppForManager = async () => {
        const recordType = await SoupService.retrieveDataFromSoup('RecordType', {}, [])
        if (CommonParam.isFirstTimeUser || !recordType || recordType.length === 0) {
            Instrumentation.startTimer('Merch manager sync')
            Instrumentation.startTimer('Merch manager sync InStoreMap images')
            await InStoreMapService.downloadImages()
            await syncDownBusinessSegmentPicklistItem()
            await generateSurveyData()
            await AssetAttributeService.syncAssetAttribute()
            Instrumentation.stopTimer('Merch manager sync InStoreMap images')
            Instrumentation.startTimer('Merch manager sync query metadata table')
            await syncDownInitialAndDeltaQuery()
            Instrumentation.stopTimer('Merch manager sync query metadata table')
            Instrumentation.startTimer('Merch manager init sync')
            await initManager(setProgress)
            Instrumentation.stopTimer('Merch manager init sync')
            CommonParam.isFirstTimeUser = false
            CommonParam.lastModifiedDate = new Date().toISOString()
            await AsyncStorage.setItem('lastModifiedDate', new Date().toISOString())
            await recordSyncFlag()
            await setInitialVisitStatus()
            await storeClassLog(Log.MOBILE_INFO, 'LandingScreen.initAppForManager', 'Data synced successfully.')
            Instrumentation.stopTimer('Merch manager sync')
        } else {
            setProgress(1)
            CommonParam.isFirstTimeUser = false
        }
    }

    const initAppForSDL = async () => {
        const recordType = await SoupService.retrieveDataFromSoup('RecordType', {}, [])
        if (CommonParam.isFirstTimeUser || !recordType || recordType.length === 0) {
            Instrumentation.startTimer('SDL Sync')
            await InStoreMapService.downloadImages()
            await syncDownBusinessSegmentPicklistItem()
            await initSDL(setProgress)
            CommonParam.isFirstTimeUser = false
            CommonParam.lastModifiedDate = new Date().toISOString()
            await AsyncStorage.setItem('lastModifiedDate', new Date().toISOString())
            await recordSyncFlag()
            await setInitialVisitStatus()
            await preloadImgs()
            await storeClassLog(Log.MOBILE_INFO, 'LandingScreen.initAppForSDL', 'Data synced successfully.')
            Instrumentation.stopTimer('SDL Sync')
        } else {
            preloadImgs()
            setProgress(1)
            CommonParam.isFirstTimeUser = false
        }
        await switchATCEntrance()
    }

    const initAppForDelSup = async () => {
        const recordType = await SoupService.retrieveDataFromSoup('RecordType', {}, [])
        if (CommonParam.isFirstTimeUser || !recordType || recordType.length === 0) {
            Instrumentation.startTimer('DelSup sync')
            await InStoreMapService.downloadImages()
            await syncDownBusinessSegmentPicklistItem()
            await initDelSup(setProgress)
            CommonParam.isFirstTimeUser = false
            CommonParam.lastModifiedDate = new Date().toISOString()
            await AsyncStorage.setItem('lastModifiedDate', new Date().toISOString())
            await recordSyncFlag()
            await setInitialVisitStatus()
            await storeClassLog(Log.MOBILE_INFO, 'LandingScreen.initAppForDelSup', 'Data synced successfully.')
            Instrumentation.stopTimer('DelSup sync')
        } else {
            setProgress(1)
            CommonParam.isFirstTimeUser = false
        }
    }

    const initAppForUGM = async () => {
        const recordType = await SoupService.retrieveDataFromSoup('RecordType', {}, [])
        if (CommonParam.isFirstTimeUser || !recordType || recordType.length === 0) {
            Instrumentation.startTimer('UGM sync')
            Instrumentation.startTimer('UGM sync InStoreMap images')
            await InStoreMapService.downloadImages()
            await syncDownBusinessSegmentPicklistItem()
            await generateSurveyData()
            await AssetAttributeService.syncAssetAttribute()
            Instrumentation.stopTimer('UGM sync InStoreMap images')
            Instrumentation.startTimer('Merch manager sync query metadata table')
            await syncDownInitialAndDeltaQuery()
            Instrumentation.stopTimer('UGM sync query metadata table')
            Instrumentation.startTimer('UGM init sync')
            await initManager(setProgress)
            Instrumentation.stopTimer('UGM init sync')
            CommonParam.isFirstTimeUser = false
            CommonParam.lastModifiedDate = new Date().toISOString()
            await AsyncStorage.setItem('lastModifiedDate', new Date().toISOString())
            await recordSyncFlag()
            await setInitialVisitStatus()
            await storeClassLog(Log.MOBILE_INFO, 'LandingScreen.initAppForUGM', 'Data synced successfully.')
            await CustomLabelUtils.getInnovationProductLabel()
            await getDAMAccessToken()
            await clearTotalSalesDocuments()
            await switchATCEntrance()
            Instrumentation.stopTimer('UGM sync')
        } else {
            setProgress(1)
            CommonParam.isFirstTimeUser = false
        }
    }

    const recordLogWhenLogin = async () => {
        const info = await fetchLogInfo()
        // Use sql like this to query login logs
        // SELECT Id, Level__c, Message__c, Class__c, CreatedDate FROM SDF_LGR_Log__c  WHERE Class__c like 'LOGIN%' order by CreatedDate desc
        storeClassLog(Log.MOBILE_INFO, 'LOGIN - ' + CommonParam.userId, JSON.stringify(info))
    }

    try {
        const language = await getUserLanguage()
        addADLog('Start Init App')
        setSyncText(getI18nLandingTips(LandingTips.INITIALIZING_SOUP, language))
        const storeConfig = {
            storeName: 'LocalStore',
            isGlobalStore: true
        }
        BaseInstance.sfSoupEngine = new SfSoupEngine(storeConfig, smartstore, baseObjects as SoupModel[])
        await BaseInstance.sfSoupEngine.initialize(true)

        // Binding Global Variable To Boost Development
        if (process.env.NODE_ENV === 'development') {
            global.$SoupService = SoupService
            global.$CommonParam = CommonParam
            global.$moment = moment
        }
        addADLog('Init Soup done')
        await storeClassLog(Log.MOBILE_INFO, 'LandingScreen.initApp', 'Start initializing the app')
        dayjs.extend(Utc)
        setSyncText(getI18nLandingTips(LandingTips.GETTING_USER_INFO, language))
        if (
            CommonParam.isSwitchLocation ||
            CommonParam.isSwitchRoute ||
            CommonParam.isSwitchPersona ||
            CommonParam.isPSRForceDailySync
        ) {
            await getUserInfo(CommonParam.userId)
        }
        await BreadcrumbsService.getBreadcrumbConfig()
        FootmarksService.register(CommonParam.GPID__c)
        setSyncText(getI18nLandingTips(LandingTips.INITIALIZING_APP_CONFIG, language))

        await initAppConfig()
        await forceInitSyncDaily()
        await recordLogWhenLogin()
        await Promise.all([getCustomLabel(CommonParam.isFirstTimeUser), getCustomApi(CommonParam.isFirstTimeUser)])
        await CustomLabelUtils.getPlanogramLabel(CommonParam.isFirstTimeUser)
        await CustomLabelUtils.getMapstedTweaksLabel(CommonParam.isFirstTimeUser)
        await syncFeatureToggle()
        Instrumentation.setUserData('CRMGPID', CommonParam.GPID__c)
        Instrumentation.setUserData('Location Id', CommonParam.userLocationId)
        Instrumentation.setUserData('Location Name', CommonParam.userLocationName)
        switch (CommonParam.PERSONA__c) {
            case Persona.FSR:
            case Persona.PSR:
            case Persona.FS_MANAGER:
                Instrumentation.startTimer(`${CommonParam.PERSONA__c} Init Sync`)
                await CustomLabelUtils.getInnovationProductLabel()
                setSyncText(getI18nLandingTips(LandingTips.SYNCING_BASE_DATA))
                await storeClassLog(Log.MOBILE_INFO, 'Start-initializing-for-the-sales-rep', '')
                await initAppForSr()
                Instrumentation.stopTimer(`${CommonParam.PERSONA__c} Init Sync`)
                navigateToHome(navigation, 'SalesRepTab')
                break
            case Persona.KEY_ACCOUNT_MANAGER:
                Instrumentation.startTimer(`${CommonParam.PERSONA__c} Init Sync`)
                await CustomLabelUtils.getInnovationProductLabel()
                setSyncText(getI18nLandingTips(LandingTips.SYNCING_BASE_DATA))
                await storeClassLog(Log.MOBILE_INFO, 'Start-initializing-for-the-sales-rep', '')
                await initAppForKAM()
                Instrumentation.stopTimer(`${CommonParam.PERSONA__c} Init Sync`)
                navigateToHome(navigation, 'KamTab')
                break
            case Persona.CRM_BUSINESS_ADMIN:
                await CustomLabelUtils.getInnovationProductLabel()
                setSyncText(LandingTips.SYNCING_BASE_DATA)
                await storeClassLog(Log.MOBILE_INFO, 'Start-initializing-for-the-sales-CRM', '')
                await customDelay(1000)
                await initAppForCRM()
                navigateToHome(navigation, 'SalesRepTab')
                break
            case Persona.MERCHANDISER:
                setProgress(0.3)
                PushNotificationIOS.setApplicationIconBadgeNumber(0)
                Instrumentation.startTimer('Merchandiser Sync')
                if (CommonParam.isFirstTimeUser) {
                    setSyncText(getI18nLandingTips(LandingTips.SYNCING_BASE_DATA))
                    await initAppForMerch()
                }
                preloadImgs()
                Instrumentation.startTimer('MD get planogram labels')
                await CustomLabelUtils.getPlanogramLabel(CommonParam.isFirstTimeUser)
                Instrumentation.stopTimer('MD get planogram labels')
                setSyncText(getI18nLandingTips(LandingTips.GETTING_USER_INFO))
                Instrumentation.startTimer('Init user config')
                await initConfigByPersona()
                Instrumentation.stopTimer('Init user config')
                Instrumentation.stopTimer('Merchandiser Sync')
                setProgress(1)
                navigateToHome(navigation)
                break
            case Persona.MERCH_MANAGER:
                await initAppForManager()
                setProgress(1)
                await storeClassLog(Log.MOBILE_INFO, 'Manager-Landing-successfully.', '')
                navigateToHome(navigation)
                break
            case Persona.SALES_DISTRICT_LEADER:
                await initAppForSDL()
                setProgress(1)
                await storeClassLog(Log.MOBILE_INFO, `${CommonParam.PERSONA__c}-Landing-successfully.`, '')
                await getRecordTypeMapping()
                navigateToHome(navigation)
                break
            case Persona.DELIVERY_SUPERVISOR:
                await initAppForDelSup()
                setProgress(1)
                await storeClassLog(Log.MOBILE_INFO, `${CommonParam.PERSONA__c}-Landing-successfully.`, '')
                await getRecordTypeMapping()
                navigateToHome(navigation)
                break
            case Persona.UNIT_GENERAL_MANAGER:
                await initAppForUGM()
                setProgress(1)
                await storeClassLog(Log.MOBILE_INFO, `${CommonParam.PERSONA__c}-Landing-successfully.`, '')
                await getRecordTypeMapping()
                navigateToHome(navigation)
                break
            default:
                break
        }
        if (isPersonaPSR()) {
            deleteLocalLogsExceed48Hours()
        }
        addADLog('Finish Init App')
    } catch (e) {
        dropDownRef.current.alertWithType('error', 'Landing Error', ErrorUtils.error2String(e))
        storeClassLog(Log.MOBILE_ERROR, 'LandingScreen.initApp', ErrorUtils.error2String(e)).then(async () => {
            await syncUpLogs()
            const timeoutId = setTimeout(() => {
                clearTimeout(timeoutId)
                logout(CommonParam.PERSONA__c !== Persona.MERCHANDISER)
            }, LANDING_ERROR_DELAY_TIME)
        })
    }
}

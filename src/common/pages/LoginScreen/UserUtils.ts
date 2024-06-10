import _ from 'lodash'
import { Constants } from '../../Constants'
import { restApexCommonCall, restDataCommonCall, syncDownObj } from '../../../savvy/api/SyncUtils'
import { getIdClause } from '../../../savvy/components/manager/helper/MerchManagerHelper'
import { storeClassLog } from '../../utils/LogUtils'
import { Log } from '../../enums/Log'
import { CommonParam } from '../../CommonParam'
import moment from 'moment/moment'
import { Persona } from '../../enums/Persona'
import * as RNLocalize from 'react-native-localize'
import AppInitUtils from '../../../savvy/utils/AppInitUtils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonLabel } from '../../../savvy/enums/CommonLabel'
import InStoreMapService from '../../../savvy/service/InStoreMapService'
import {
    getLastRouteViewedInfo,
    loadRoutesForSwitch,
    setDefaultRouteStorage
} from '../../../savvy/utils/InnovationProductUtils'
import StatusCode from '../../../savvy/enums/StatusCode'
import { AccessLevelType } from '../../../savvy/enums/Manager'
import { exeAsyncFunc, isTrueInDB } from '../../utils/CommonUtils'
import BaseInstance from '../../BaseInstance'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const setUserInfo = (persona: any) => {
    CommonParam.userLocationId = persona.userLocationId
    CommonParam.profileName = persona.Profile.Name || null
    CommonParam.GPID__c = persona.GPID__c || null
    CommonParam.BU_ID__c = persona.BU_ID__c || null
    CommonParam.userName = persona.Name || null
    CommonParam.PERSONA__c = persona.PERSONA__c || null
    CommonParam.Is_Night_Shift__c = persona.Is_Night_Shift__c
    CommonParam.userTimeZone = persona.TimeZoneSidKey || moment.tz.guess(true)
    CommonParam.currentLocationTimeZone = persona.TimeZoneSidKey || ''
    if (
        [
            Persona.FSR,
            Persona.FS_MANAGER,
            Persona.PSR,
            Persona.KEY_ACCOUNT_MANAGER,
            Persona.CRM_BUSINESS_ADMIN
        ].includes(persona.PERSONA__c)
    ) {
        CommonParam.userTimeZone = RNLocalize.getTimeZone() || moment.tz.guess(true)
    }
    CommonParam.userTimeZoneOffset = CommonParam.userTimeZone
        ? moment().tz(CommonParam.userTimeZone).format('Z').toString()
        : 'localtime'
    CommonParam.userTimeZoneZ = CommonParam.userTimeZone
        ? moment().tz(CommonParam.userTimeZone).format('Z').toString()
        : 'Z'
    CommonParam.CountryCode = persona.CountryCode || null
    CommonParam.multiLocation = persona.multiLocation
    CommonParam.locationArr = persona.locationArr || []
    CommonParam.userLocationName = persona.userLocationName || null
    CommonParam.canSwitchPersona = persona.canSwitchPersona
    CommonParam.MobilePhone = persona.MobilePhone
    CommonParam.Email = persona.Email
    if (!persona.userInfo) {
        persona.userInfo = {
            Name: '',
            FirstName: '',
            LastName: '',
            userStatsId: ''
        }
    }
    CommonParam.userInfo = persona.userInfo
    CommonParam.userRouteId = _.isEmpty(persona?.userRouteId) ? '' : persona.userRouteId
    CommonParam.userRouteGTMUId = persona.userRouteGTMUId
    CommonParam.UserEmail = persona.Email
}
const getLocationArr = async (locationStr: string, delLocId: string) => {
    try {
        let locationIdArr = locationStr ? locationStr.split(',') : []
        if (delLocId) {
            locationIdArr.push(delLocId)
        }
        locationIdArr = _.unionWith(locationIdArr, (a: string, b: string) => a === b)
        locationIdArr = locationIdArr.filter((item) => !_.isEmpty(item))
        locationIdArr = locationIdArr.map((item) => {
            return item.replace(/(^\s*)|(\s*$)/g, '')
        })
        const sliceArr = _.chunk(locationIdArr, Constants.ONCE_DATA_COUNT)
        let locationArr: any[] = []
        for (const sectionLocation of sliceArr) {
            const locationsRes = await restDataCommonCall(
                `query/?q=SELECT
                    Id, SLS_UNIT_ID__c, SLS_UNIT_NM__c, LOC_ID__c, Tme_Zone_Cde__c
                FROM Route_Sales_Geo__c
                WHERE
                    Operational_Location__c = TRUE
                    AND HRCHY_LVL__c = 'Location'
                    AND SLS_UNIT_ID__c  IN (${getIdClause(sectionLocation)})
                ORDER BY SLS_UNIT_NM__c`,
                'GET'
            )
            const locArr = locationsRes?.data?.records || []
            locationArr = locationArr.concat(locArr)
        }
        const locationWithLOC = locationArr.filter((i) => i.LOC_ID__c)
        const locationWithoutLOC = locationArr.filter((i) => !i.LOC_ID__c)
        return _.uniqBy(locationWithLOC, 'LOC_ID__c').concat(locationWithoutLOC)
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'InitUtils.getLocationArr', ErrorUtils.error2String(error))
        return []
    }
}
const getPersonaList = async (userId: string) => {
    try {
        const res = await restApexCommonCall(`getUserFuncBundle/${userId}`, 'GET')
        const data = JSON.parse(res.data)
        return data || {}
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'InitUtils.getPersonaList', ErrorUtils.error2String(error))
        return {}
    }
}
/**
 * @description Get user Configuration
 * @param userId
 */
export const getCurrUserStatesId = async (userId: string) => {
    try {
        const userStatesResult = await restDataCommonCall(
            `query/?q=SELECT Id FROM User_Stats__c WHERE User__c='${userId}' AND RecordType.DeveloperName = 'Stats' LIMIT 1`,
            'GET'
        )
        return userStatesResult?.data?.records[0]?.Id || ''
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'InitUtils.getCurrUserStatesId', ErrorUtils.error2String(error))
        return ''
    }
}

const getLeadFuncBundle = async (userId: string) => {
    const localFlag = await AsyncStorage.getItem('enable_lead_function')
    CommonParam.leadFuncBundle = localFlag === 'true'
    await exeAsyncFunc(async () => {
        const getLeadFuncBundleQuery = `SELECT Additional_Functionality_Bundles__c FROM User WHERE Id='${userId}'`
        await syncDownObj('User', getLeadFuncBundleQuery, false).then(async (res) => {
            CommonParam.leadFuncBundle = _.includes(
                res?.data[0]?.Additional_Functionality_Bundles__c,
                CommonLabel.LEADS
            )
            await AsyncStorage.setItem('enable_lead_function', CommonParam.leadFuncBundle ? 'true' : 'false')
        })
    })
}

// Salesforce API name
// eslint-disable-next-line camelcase
const setRouteForPsr = async (persona: { PERSONA__c: Persona; userLocationId: any }) => {
    if (persona.PERSONA__c === Persona.PSR) {
        const routes = await loadRoutesForSwitch(
            `AND LOC_ID__c = '${persona.userLocationId}' ORDER BY GTMU_RTE_ID__c ASC `
        )
        await AsyncStorage.setItem('psrRouteArr', JSON.stringify(routes))
    } else {
        await AsyncStorage.setItem('psrRouteArr', '')
    }
}

export const getUserInfo = async (userId: string) => {
    AppInitUtils.initSoupAndSync()
    const isSyncSuccessfully = await AsyncStorage.getItem('isSyncSuccessfully')
    if (isSyncSuccessfully === 'true' || CommonParam.isSwitchLocation) {
        const param = await AsyncStorage.getItem('Persona')
        // will not be null when isSyncSuccessfully === 'true'
        const persona = JSON.parse(param as string)
        const curLoc = persona?.locationArr?.filter(
            // Salesforce field API name
            // eslint-disable-next-line camelcase
            (item: { SLS_UNIT_ID__c: any }) => item.SLS_UNIT_ID__c === persona.userLocationId
        )
        persona.TimeZoneSidKey = curLoc[0] && curLoc[0]?.Tme_Zone_Cde__c
        getLeadFuncBundle(userId)
        setUserInfo(persona)
        if (!CommonParam.ImageFilesPath) {
            InStoreMapService.syncImageFilePath()
        }
        CommonParam.OrderingFeatureToggle = isTrueInDB(await AsyncStorage.getItem('Ordering_Feature_Toggle'))
        await setRouteForPsr(persona)
    } else {
        const res = await restDataCommonCall(
            `query/?q=SELECT Id, Name, FirstName, LastName, PERSONA__c, GM_LOC_ID__c,GM_LOC_NM__c, Profile.Name, 
           GPID__c, BU_ID__c, TimeZoneSidKey, CountryCode, MobilePhone, Access_Level__c, Authorized_Locations__c, 
           Last_Location_Viewed__c,Additional_Functionality_Bundles__c, CompanyName, Email FROM User WHERE Id='${userId}'`,
            'GET'
        )
        if (res.status === StatusCode.SuccessOK && res.data && res.data.records.length > 0) {
            const user = res.data.records[0]
            user.multiLocation =
                user.Access_Level__c &&
                (user.Access_Level__c === AccessLevelType.MultiLocation ||
                    user.Access_Level__c === AccessLevelType.Region ||
                    user.Access_Level__c === AccessLevelType.Market ||
                    user.Access_Level__c === AccessLevelType.NBU)
            const userStatsId = await getCurrUserStatesId(userId)
            let locArr
            // for psr, if GM_LOC_ID__c is not in Authorized_Locations__c, psr can not switch to this location
            if (
                user.PERSONA__c === Persona.PSR &&
                !user?.Authorized_Locations__c?.split(',')?.includes(user.GM_LOC_ID__c)
            ) {
                locArr = await getLocationArr(user.Authorized_Locations__c, '')
            } else {
                locArr = await getLocationArr(user.Authorized_Locations__c, user.GM_LOC_ID__c)
            }
            CommonParam.leadFuncBundle = _.includes(user.Additional_Functionality_Bundles__c, CommonLabel.LEADS)
            await AsyncStorage.setItem('enable_lead_function', CommonParam.leadFuncBundle ? 'true' : 'false')
            if (user.PERSONA__c === Persona.MERCHANDISER) {
                const nightShiftUser = await restDataCommonCall(
                    `query/?q=SELECT Id, Is_Night_Shift__c From User_Stats__c WHERE User__c='${userId}'`,
                    'GET'
                )
                if (
                    nightShiftUser.status === StatusCode.SuccessOK &&
                    nightShiftUser.data &&
                    nightShiftUser.data.records.length > 0
                ) {
                    user.Is_Night_Shift__c = nightShiftUser.data.records[0].Is_Night_Shift__c || false
                }
            }
            if (user.PERSONA__c === Persona.PSR) {
                if (_.isEmpty(user.Authorized_Locations__c)) {
                    BaseInstance.sfOauthEngine.logout()
                    return
                }
                user.locationArr = locArr
                const PSRRouteData = await getLastRouteViewedInfo()
                let gtmuIdForRouteDisplay = ''
                // Override userLocation and userRoute is lastRouteViewed is valid
                const lastRouteViewedLocation = user.locationArr.find(
                    // Salesforce API name
                    // eslint-disable-next-line camelcase
                    (one: { SLS_UNIT_ID__c: any }) => one?.SLS_UNIT_ID__c === PSRRouteData?.LOC_ID__c
                )
                if (PSRRouteData?.Last_Route_Viewed__c && lastRouteViewedLocation) {
                    gtmuIdForRouteDisplay = PSRRouteData?.Last_Route_Viewed__c
                    user.userLocationId = lastRouteViewedLocation?.SLS_UNIT_ID__c
                    user.userLocationName = lastRouteViewedLocation?.SLS_UNIT_NM__c
                    user.TimeZoneSidKey = lastRouteViewedLocation?.Tme_Zone_Cde__c
                }
                const { userRouteId } = await setDefaultRouteStorage(gtmuIdForRouteDisplay)
                user.userRouteId = userRouteId
                user.userRouteGTMUId = gtmuIdForRouteDisplay

                const routes = await loadRoutesForSwitch(
                    `AND LOC_ID__c = '${user.userLocationId}' ORDER BY GTMU_RTE_ID__c ASC `
                )
                await AsyncStorage.setItem('psrRouteArr', JSON.stringify(routes))
            } else {
                user.locationArr = locArr
                const curLoc = locArr.find(
                    (item) => item.SLS_UNIT_ID__c === (user.Last_Location_Viewed__c || user.GM_LOC_ID__c)
                )
                user.userLocationId = curLoc?.SLS_UNIT_ID__c
                user.userLocationName = curLoc?.SLS_UNIT_NM__c
                user.TimeZoneSidKey = curLoc?.Tme_Zone_Cde__c
            }
            const personaRes = await getPersonaList(userId)
            user.canSwitchPersona = personaRes?.isSwitch
            user.setPerson = personaRes?.setPerson || []
            user.userInfo = {
                Name: user.Name,
                FirstName: user.FirstName,
                LastName: user.LastName,
                userStatsId: userStatsId,
                MobilePhone: user.MobilePhone
            }
            setUserInfo(user)
            await AsyncStorage.setItem('Persona', JSON.stringify(user))
        }
    }
}

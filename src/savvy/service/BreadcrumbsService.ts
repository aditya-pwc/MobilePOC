/*
 * @Description:BreadcrumbsService
 * @Author: Mary Qian
 * @Date: 2021-08-11 06:36:04
 * @LastEditTime: 2023-12-05 11:57:24
 * @LastEditors: Mary Qian
 */
import Geolocation from 'react-native-geolocation-service'
import moment from 'moment'
import _ from 'lodash'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { SoupService } from './SoupService'
import { CommonParam } from '../../common/CommonParam'
import LocationService from './LocationService'
import { fetchCredentialBreadcrumbs } from '../api/ApexApis'
import { setLoggedInUserTimezone } from '../utils/TimeZoneUtils'
import { CommonApi } from '../../common/api/CommonApi'
import { addADLog } from '../helper/merchandiser/MyVisitHelper'
import { getApplicationName } from 'react-native-device-info'
import BaseInstance from '../../common/BaseInstance'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { MOMENT_UNIT } from '../../common/enums/MomentUnit'
import { storeClassLog } from '../../common/utils/LogUtils'
import { exeAsyncFunc } from '../../common/utils/CommonUtils'
import { Log } from '../../common/enums/Log'

let OUT_STORE_DISTANCE = Number(CommonApi.PBNA_MOBILE_CONFIG_BC_OUT_METERS) || 305
let IN_STORE_DISTANCE = Number(CommonApi.PBNA_MOBILE_CONFIG_BC_IN_METERS) || 12
let EXPIRE_HOURS = Number(CommonApi.PBNA_MOBILE_CONFIG_BC_EXPIRE_DATE) || 72
let MAX_NUMBER = Number(CommonApi.PBNA_MOBILE_CONFIG_BC_MAX_NUM) || 100
let UPLOAD_TIME = Number(CommonApi.PBNA_MOBILE_CONFIG_BC_UPLOAD_TIME) || 10
let STILL_TIME = Number(CommonApi.PBNA_MOBILE_CONFIG_BC_STILL_TIME) || 30

let breadcrumbsWatchId = null
let breadcrumbs30Interval = null
let breadcrumbsTimeout = null

let isInStore = false
let locationCount = 0
let lastCLocation = null

const BREADCRUMBS_LIST = 'BreadcrumbsList'
enum BC_LOG_TYPE {
    CONFIG = 'GET CONFIG',
    TOKEN = 'GET TOKEN',
    UPLOAD = 'UPLOAD BREADCRUMBS DATA',
    SYNC = 'SYNC BREADCRUMBS DATA',
    DATA = 'BREADCRUMBS DATA',
    INTERVAL = 'BREADCRUMBS TIME INTERVAL',
    WATCHER = 'BREADCRUMBS WATCHER',
    VISIT = 'BREADCRUMBS VISIT',
    REFRESH = 'BREADCRUMBS REFRESH TOKEN'
}

const recordLogs = (type: string, message: string, upload = true) => {
    if (upload) {
        storeClassLog(Log.MOBILE_INFO, 'BRD - ' + type, message)
    }
}

export const fetchBreadcrumbsToken = () => {
    const appName = getApplicationName()
    const isProductionOrPreProd = appName === 'SAVVY' || appName === 'SAVVY PreProd'
    return new Promise((resolve, reject) => {
        fetchCredentialBreadcrumbs()
            .then((res) => {
                const result = JSON.parse(res?.data)
                if (_.isEmpty(result.token) && isProductionOrPreProd) {
                    recordLogs(BC_LOG_TYPE.TOKEN, `get token null, user: ${CommonParam.userId}`)
                    BaseInstance.sfOauthEngine.logout()
                    return resolve(result.token)
                }
                CommonParam.breadcrumbsAccessToken = result.token || ''
                CommonParam.breadcrumbsRefreshHours = result.hours || ''
                CommonParam.breadcrumbsLastSyncTime = moment().format(TIME_FORMAT.YMDHMS)
                AsyncStorage.setItem('breadcrumbs_token', CommonParam.breadcrumbsAccessToken)
                AsyncStorage.setItem('breadcrumbs_refresh_hours', CommonParam.breadcrumbsRefreshHours)
                AsyncStorage.setItem('breadcrumbs_last_sync_time', CommonParam.breadcrumbsLastSyncTime)
                resolve(CommonParam.breadcrumbsAccessToken)
            })
            .catch((error) => {
                recordLogs(
                    BC_LOG_TYPE.TOKEN,
                    `get token failed: ${CommonParam.userId}, ${ErrorUtils.error2String(error)}`
                )
                reject(error)
            })
    })
}

export const checkAndRefreshBreadcrumbsToken = async () => {
    const refreshHours = CommonParam.breadcrumbsRefreshHours
    const lastSyncTime = CommonParam.breadcrumbsLastSyncTime
    if (!lastSyncTime || !refreshHours || moment().isAfter(moment(lastSyncTime).add(refreshHours, 'hours'))) {
        return new Promise((resolve, reject) => {
            fetchBreadcrumbsToken()
                .then((res) => {
                    resolve(res)
                })
                .catch((error) => {
                    recordLogs(BC_LOG_TYPE.REFRESH, `refresh token error: ${ErrorUtils.error2String(error)}`)
                    reject(error)
                })
        })
    }
}

const getBreadcrumbsToken = () => {
    return new Promise((resolve, reject) => {
        AsyncStorage.getItem('breadcrumbs_token', (err, data) => {
            if (!err && data) {
                CommonParam.breadcrumbsAccessToken = data
            }

            fetchBreadcrumbsToken()
                .then((res) => {
                    resolve(res)
                })
                .catch((error) => {
                    reject(error)
                })
        }).catch(() => {
            fetchBreadcrumbsToken()
                .then((res) => {
                    resolve(res)
                })
                .catch((error) => {
                    reject(error)
                })
        })
    })
}

const getBreadcrumbConfig = async () => {
    await getBreadcrumbsToken()
}

const fetchLocalBreadcrumbs = async () => {
    let result = []

    await exeAsyncFunc(async () => {
        const soupBreadcrumbsList = BaseInstance.sfSoupEngine.localSoup.find(
            (soup) => soup.soupName === BREADCRUMBS_LIST
        )
        if (!_.isEmpty(soupBreadcrumbsList)) {
            result = await SoupService.retrieveDataFromSoup(BREADCRUMBS_LIST, {}, [])
        }
    }, 'fetchLocalBreadcrumbs')

    return result
}

const removeDuplicateBreadcrumbs = (breadcrumbs: any[]) => {
    return _.uniqBy(breadcrumbs, 'geo_dt')
}

const removeExpiredBreadcrumbs = (breadcrumbs: any[]) => {
    const expiredDateTime = moment().tz('GMT').subtract(EXPIRE_HOURS, MOMENT_UNIT.HOURS)

    return _.filter(breadcrumbs, (breadcrumb) => {
        // IGNORE TIMEZONE: USE ISO_STRING TO COMPARE
        const isoString = breadcrumb.isoString
        if (isoString?.length > 0) {
            return isoString > expiredDateTime.toISOString()
        }

        const time = breadcrumb.geo_dt
        // geo_dt is GMT time, below code take geo_dt as GMT time, then compare
        return moment(`${time} +00:00`, `${TIME_FORMAT.DMMMYYYYHHMMSS} Z`).isAfter(expiredDateTime)
    })
}

const removeBreadcrumbsByIds = async (deleteIds: string[]) => {
    await SoupService.removeRecordFromSoup(BREADCRUMBS_LIST, deleteIds)
}

const removeDuplicateOrExpiredBreadcrumbs = async () => {
    let result = []
    await exeAsyncFunc(async () => {
        const localBreadcrumbs = await fetchLocalBreadcrumbs()

        const data = removeDuplicateBreadcrumbs(localBreadcrumbs)
        const res = removeExpiredBreadcrumbs(data)

        const deleteIds = []
        for (const bc of localBreadcrumbs) {
            if (res.findIndex((i) => i._soupEntryId === bc._soupEntryId) === -1) {
                deleteIds.push(bc._soupEntryId)
            }
        }

        await removeBreadcrumbsByIds(deleteIds)
        result = res
    }, 'removeDuplicateOrExpiredBreadcrumbs')

    return result
}

const syncBreadcrumbs = async () => {
    if (_.isEmpty(CommonApi.PBNA_MOBILE_API_BREADCRUMBS_URL)) {
        recordLogs(BC_LOG_TYPE.SYNC, 'CommonApi.PBNA_MOBILE_API_BREADCRUMBS_URL is empty')
        return
    }

    try {
        await checkAndRefreshBreadcrumbsToken()
        const res = await removeDuplicateOrExpiredBreadcrumbs()
        if (res.length === 0) {
            const uploadTime = moment().format(TIME_FORMAT.DMMMYYYYHHMMSS)
            recordLogs(BC_LOG_TYPE.UPLOAD, `local breadcrumbs data is empty: ${uploadTime}`)
            return
        }
        const hasMoreData = res.length > MAX_NUMBER
        const result = res.slice(-MAX_NUMBER)
        const uploadIds = result.map((i) => i._soupEntryId)

        const geodata = result.map((item) => {
            return {
                long_num: item.long_num,
                lat_num: item.lat_num,
                geo_dt: item.geo_dt
            }
        })
        const params = {
            gpid: CommonParam.GPID__c,
            locid: CommonParam.userLocationId,
            buid: CommonParam.BU_ID__c,
            // Fix French Locale
            request_dt: moment().locale('en').tz('GMT').format(TIME_FORMAT.DMMMYYYYHHMMSS),
            geodata
        }

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        uploadBreadcrumbsToServer(params, uploadIds, hasMoreData)
    } catch (error) {
        recordLogs(BC_LOG_TYPE.SYNC, `prepare '${BREADCRUMBS_LIST}' data failed: ${ErrorUtils.error2String(error)}`)
    }
}

const uploadBreadcrumbsToServer = (params, uploadIds: string[], hasMoreData: boolean) => {
    const paramsInArray = [params]
    const body = paramsInArray ? JSON.stringify(paramsInArray) : null

    const uploadTime = moment().format(TIME_FORMAT.DMMMYYYYHHMMSS)
    if (__DEV__) {
        recordLogs(
            BC_LOG_TYPE.UPLOAD,
            `start upload data at time: ${uploadTime}, body: ${body}, ${params.geodata.length}`
        )
    }
    fetch(CommonApi.PBNA_MOBILE_API_BREADCRUMBS_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${CommonParam.breadcrumbsAccessToken}`,
            'Content-Type': 'application/json'
        },
        body: paramsInArray ? JSON.stringify(paramsInArray) : null
    })
        .then((response) => {
            if (response.ok) {
                response
                    .json()
                    .then(async (resBody: any) => {
                        let message = `upload data response at: ${uploadTime}, response: ${JSON.stringify(resBody)}`

                        const rows = parseInt(resBody.rows)
                        const succeedCount = parseInt(resBody.message.replace(/[a-z]|[A-Z]|\.|:| /g, ''))

                        if (succeedCount === rows) {
                            await exeAsyncFunc(async () => {
                                await removeBreadcrumbsByIds(uploadIds)
                            }, 'removeBreadcrumbsByIds')

                            message = message + `delete breadcrumbs data after upload succeeded at: ${uploadTime}`
                            if (hasMoreData) {
                                syncBreadcrumbs()
                            }
                        } else {
                            message =
                                message +
                                `upload data failed at: ${uploadTime}, succeeded: ${succeedCount}, total: ${rows}`
                        }

                        if (__DEV__) {
                            recordLogs(BC_LOG_TYPE.UPLOAD, message)
                        }
                    })
                    .catch((err: any) => {
                        recordLogs(
                            BC_LOG_TYPE.UPLOAD,
                            `parse data by json error at: ${uploadTime}, error: ${ErrorUtils.error2String(err)}`
                        )
                    })
            } else {
                if (response.status === 401 || response.status === 403 || response.status === 500) {
                    getBreadcrumbsToken()
                }
                recordLogs(
                    BC_LOG_TYPE.UPLOAD,
                    `upload data response error at: ${uploadTime}, response: ${JSON.stringify(response)}`
                )
            }
        })
        .catch((err) => {
            recordLogs(
                BC_LOG_TYPE.UPLOAD,
                `upload data error at: ${uploadTime}, error: ${ErrorUtils.error2String(err)}`
            )
        })
}

const syncLocationData = () => {
    NetInfo.fetch().then((state) => {
        const isSwitchOn = CommonApi.PBNA_MOBILE_BREADCRUMB_SWITCH
        const isOnline = state.isInternetReachable
        const now = moment().format(TIME_FORMAT.DMMMYYYYHHMMSS)
        if (__DEV__) {
            recordLogs(BC_LOG_TYPE.SYNC, `start sync data at: ${now}, switch: ${isSwitchOn}, isOnline: ${isOnline}`)
        }
        if (state.isInternetReachable && isSwitchOn === 'on') {
            syncBreadcrumbs()
        }
    })
}

const getDistanceWithFormat = (oldLocation, newLocation) => {
    const lat1 = oldLocation.coords.latitude
    const lng1 = oldLocation.coords.longitude
    const lat2 = newLocation.coords.latitude
    const lng2 = newLocation.coords.longitude
    return LocationService.getDistance(lat1, lng1, lat2, lng2)
}

const formatGeoData = (date, longitude, latitude) => {
    const position = LocationService.wgs84togcj02(longitude, latitude)
    return {
        lat_num: position[1],
        long_num: position[0],
        isoString: moment().toISOString(),
        geo_dt: moment().locale('en').tz('GMT').format(TIME_FORMAT.DMMMYYYYHHMMSS)
    }
}

const formatGeoDataByCLocation = (cLocation) => {
    const { coords, timestamp } = cLocation
    const { latitude, longitude } = coords
    return formatGeoData(moment(timestamp), longitude, latitude)
}

const formatGeoDataByPosition = (position) => {
    const { latitude, longitude } = position.coords
    return formatGeoData(moment(), longitude, latitude)
}

const addDistance = (oldLocation, newLocation) => {
    if (oldLocation == null) {
        return
    }

    const distance = getDistanceWithFormat(oldLocation, newLocation)
    locationCount += distance
    recordLogs(BC_LOG_TYPE.DATA, `last distance is ${distance} meter, totalDistance is ${locationCount} meter`, false)
}

const insertNewBreadcrumbs = (geoData) => {
    recordLogs(BC_LOG_TYPE.DATA, `insert new breadcrumbs: ${JSON.stringify(geoData)}`, false)
    SoupService.upsertDataIntoSoup(BREADCRUMBS_LIST, [geoData])
}

const stop30Timer = () => {
    clearInterval(breadcrumbs30Interval)
    breadcrumbs30Interval = null
}

const restart30Interval = () => {
    stop30Timer()
    breadcrumbs30Interval = setInterval(() => {
        recordLogs(BC_LOG_TYPE.DATA, 'record one breadcrumb after no latest location for 30 minutes')
        LocationService.getCurrentPosition().then((position) => {
            if (position && position.coords && position.coords.latitude && position.coords.longitude) {
                const geoData = formatGeoDataByPosition(position)
                insertNewBreadcrumbs(geoData)
            }
        })
    }, 1000 * 60 * STILL_TIME)
}

const stopWatching = () => {
    Geolocation.clearWatch(breadcrumbsWatchId)
    stop30Timer()
}

const startWatchingByFeet = (feet: number) => {
    Geolocation.requestAuthorization('whenInUse').then(() => {
        breadcrumbsWatchId = Geolocation.watchPosition(
            (cLocation) => {
                addDistance(lastCLocation, cLocation)
                if (locationCount >= (isInStore ? IN_STORE_DISTANCE : OUT_STORE_DISTANCE)) {
                    const geoData = formatGeoDataByCLocation(cLocation)
                    insertNewBreadcrumbs(geoData)
                    restart30Interval()
                    locationCount = 0
                }

                lastCLocation = cLocation
            },
            (error) => {
                recordLogs(BC_LOG_TYPE.WATCHER, `watch position failed: ${ErrorUtils.error2String(error)}`)
            },
            {
                showsBackgroundLocationIndicator: true,
                distanceFilter: feet,
                accuracy: {
                    ios: 'bestForNavigation'
                },
                enableHighAccuracy: true
            }
        )
    })
}

const stopSyncTimer = () => {
    if (breadcrumbsTimeout) {
        clearTimeout(breadcrumbsTimeout)
    }
}

const startSyncTimer = () => {
    setLoggedInUserTimezone()
    clearTimeout(breadcrumbsTimeout)
    breadcrumbsTimeout = setTimeout(() => {
        syncLocationData()
        startSyncTimer()
    }, 1000 * 60 * UPLOAD_TIME)
}

const initConfigSettings = () => {
    OUT_STORE_DISTANCE = Number(CommonApi.PBNA_MOBILE_CONFIG_BC_OUT_METERS) || 305
    IN_STORE_DISTANCE = Number(CommonApi.PBNA_MOBILE_CONFIG_BC_IN_METERS) || 12
    EXPIRE_HOURS = Number(CommonApi.PBNA_MOBILE_CONFIG_BC_EXPIRE_DATE) || 72
    MAX_NUMBER = Number(CommonApi.PBNA_MOBILE_CONFIG_BC_MAX_NUM) || 100
    UPLOAD_TIME = Number(CommonApi.PBNA_MOBILE_CONFIG_BC_UPLOAD_TIME) || 10
    STILL_TIME = Number(CommonApi.PBNA_MOBILE_CONFIG_BC_STILL_TIME) || 30
}

const startWatching = (inStore: boolean) => {
    stopWatching()
    initConfigSettings()
    startWatchingByFeet(inStore ? IN_STORE_DISTANCE : OUT_STORE_DISTANCE)
    isInStore = inStore
    startSyncTimer()
}

const stopBreadcrumbsService = () => {
    stopSyncTimer()
    stopWatching()
}

const updateInStoreStatus = (inStore: boolean) => {
    isInStore = inStore
}

const startMyDay = () => {
    recordLogs(BC_LOG_TYPE.VISIT, `start my day: ${new Date()}`)
    addADLog('Start My Day')
    startWatching(false)
}

const endMyDay = () => {
    recordLogs(BC_LOG_TYPE.VISIT, `end my day: ${new Date()}`)
    addADLog('End My Day')
    stopBreadcrumbsService()
    syncLocationData()
}

const logout = () => {
    recordLogs(BC_LOG_TYPE.VISIT, `logout: ${new Date()}`)
    addADLog('Logout')
    stopBreadcrumbsService()
}

const startVisit = () => {
    recordLogs(BC_LOG_TYPE.VISIT, `start visit: ${new Date()}`)
    addADLog('Start Visit')
    startWatching(true)
}

const endVisit = () => {
    recordLogs(BC_LOG_TYPE.VISIT, `complete visit: ${new Date()}`)
    addADLog('Complete Visit')
    isInStore = false
}

const startBreak = (type: string) => {
    recordLogs(BC_LOG_TYPE.VISIT, `start event: ${type}`)
    stopBreadcrumbsService()
}

const endBreak = () => {
    recordLogs(BC_LOG_TYPE.VISIT, 'end event')
    startWatching(isInStore)
}

const startBreadcrumbsService = (dayEnd: boolean, clockStart: boolean) => {
    if (isInStore) {
        startWatching(true)
    } else if (CommonParam.shiftStatus === 'started' && !dayEnd && !isInStore && !clockStart) {
        startWatching(false)
    }
}

export const BreadcrumbsService = {
    getBreadcrumbConfig,
    updateInStoreStatus,
    startBreadcrumbsService,
    startMyDay,
    endMyDay,
    logout,
    startVisit,
    endVisit,
    startBreak,
    endBreak,
    getBreadcrumbsToken
}

export default BreadcrumbsService

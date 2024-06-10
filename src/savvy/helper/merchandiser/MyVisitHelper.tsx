/* eslint-disable camelcase */
import AsyncStorage from '@react-native-async-storage/async-storage'
import _ from 'lodash'
import moment from 'moment'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { CommonParam } from '../../../common/CommonParam'
import { Log } from '../../../common/enums/Log'
import BreadcrumbsService from '../../service/BreadcrumbsService'
import LocationService from '../../service/LocationService'
import { SoupService } from '../../service/SoupService'
import { isSameArray } from '../../utils/CommonUtils'
import NetInfo from '@react-native-community/netinfo'
import { checkInRange, restoreMerchandiserGeofence } from '../../utils/MerchandiserUtils'
import { VisitStatus } from '../../enums/Visit'
import {
    formatWithTimeZone,
    getLastSundayDate,
    isTodayDayWithTimeZone,
    setLoggedInUserTimezone,
    todayDateWithTimeZone
} from '../../utils/TimeZoneUtils'
import { getRecordTypeIdIfNull, restDataCommonCall } from '../../api/SyncUtils'
import { recordAMASLogs } from '../../service/AMASService'
import { BooleanStr } from '../../enums/Manager'
import { BreadcrumbVisibility, Instrumentation } from '@appdynamics/react-native-agent'
import { getVisitAndEventDataForTodayTab, handleDataInOneDay } from './MyVisitDataHelper'
import { getMetricDataForToday, TodayMetricProps } from '../../components/MyVisit/VisitMetric'
import { getScheduleMeetingData, MeetingProps } from './MyVisitEventHelper'
import { setupLocationByCoordinates } from '../../utils/locationUtils'
import { redefinePositionCoords } from '../../components/merchandiser/VisitDetail'
import { updateVLWhenEndDay } from '../../service/UpdateVisitListService'
import SyncService from '../../service/SyncService'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../../common/enums/MomentStartOf'
import { storeClassLog } from '../../../common/utils/LogUtils'

export interface VisitModal {
    todayData: any
    todayList: Array<any>
    inprogress: boolean
    allCompleted: boolean
    metricData: TodayMetricProps
}

export const setupBreadcrumbsAfterEndMyDay = () => {
    BreadcrumbsService.endMyDay()
}

export const recordSyncingLogs = (message: string) => {
    storeClassLog(Log.MOBILE_INFO, 'isSyncing', message)
}

export const addADLog = (message: string) => {
    try {
        const time = moment().format('YYYY-MM-DDTHH:mm:ss.SSSS Z')
        Instrumentation.leaveBreadcrumb(message + time, BreadcrumbVisibility.CRASHES_AND_SESSIONS)
    } catch (err) {}
}

const setupVisitListParamsAfterStartMyDay = (visitList) => {
    const date = new Date()
    const time = formatWithTimeZone(moment(), TIME_FORMAT.HHMMSS, true)
    const dateTime = date.toISOString()

    visitList.OwnerId = CommonParam.userId
    visitList.Start_Date_Time__c = dateTime
    visitList.Status__c = VisitStatus.IN_PROGRESS
    visitList.Location_Id__c = CommonParam.userLocationId
    visitList.Visit_Date__c = todayDateWithTimeZone(true)
    visitList.Start_Date__c = todayDateWithTimeZone(true)
    visitList.RecordTypeId = CommonParam.dailyRcdId || null
    if (!visitList.Name) {
        visitList.Name =
            visitList.Visit_Date__c + ' - ' + CommonParam.userName.slice(0, 20) + ' ' + time + ' (unplanned)'
    }

    return visitList
}

const generateWeeklyVisitList = () => {
    setLoggedInUserTimezone()
    const firstDay = moment(moment().startOf(MOMENT_STARTOF.WEEK)).format(TIME_FORMAT.Y_MM_DD)
    const lastDay = moment(moment().endOf(MOMENT_STARTOF.WEEK)).format(TIME_FORMAT.Y_MM_DD)

    return {
        Start_Date__c: firstDay,
        End_Date__c: lastDay,
        OwnerId: CommonParam.userId,
        Name: firstDay + ' - ' + lastDay + ' ' + CommonParam.userName.slice(0, 20),
        RecordTypeId: CommonParam.weeklyRcdId,
        Location_Id__c: CommonParam.userLocationId,
        Start_Location__latitude__s: '',
        Start_Location__longitude__s: '',
        externalId: new Date().getTime() + 'weeklyList'
    }
}

export const startDayHelper = () => {
    return new Promise((resolve, reject) => {
        if (CommonParam.isSyncing) {
            recordSyncingLogs('startDayHelper: CommonParam.isSyncing is false, so return')
            reject('sync')
        } else {
            recordSyncingLogs('startDayHelper: CommonParam.isSyncing setting true')
            CommonParam.isSyncing = true

            const vList = JSON.parse(JSON.stringify(CommonParam.visitList))
            LocationService.getCurrentPosition()
                .then((position: any) => {
                    setupVisitListParamsAfterStartMyDay(vList)
                    if (position && position.coords) {
                        const coords = redefinePositionCoords(position.coords.latitude, position.coords.longitude)
                        vList.Start_Location__latitude__s = coords.latitude
                        vList.Start_Location__longitude__s = coords.longitude
                    } else {
                        storeClassLog(
                            Log.MOBILE_WARN,
                            'MD-startDayHelper',
                            `Get position failed for start day: ${JSON.stringify(position)}`
                        )
                    }
                    let weeklyList = null
                    if (CommonParam.weeklyList) {
                        weeklyList = JSON.parse(JSON.stringify(CommonParam.weeklyList))
                    }
                    if (!weeklyList) {
                        weeklyList = generateWeeklyVisitList()
                        vList.Visit_List_Group__c = weeklyList.externalId
                    } else {
                        vList.Visit_List_Group__c = weeklyList.Id
                    }
                    addADLog(`startDayHelper ${vList.Id} ${weeklyList.Id}`)
                    return SoupService.upsertDataIntoSoup('Visit_List__c', [vList, weeklyList])
                })
                .then((res) => {
                    CommonParam.shiftStatus = 'started'
                    CommonParam.visitList = vList
                    recordSyncingLogs('startDayHelper: CommonParam.isSyncing setting false')
                    CommonParam.isSyncing = false
                    resolve(res)
                })
                .catch((err) => {
                    CommonParam.pendingSync.visitList = false
                    recordSyncingLogs(
                        `startDayHelper: CommonParam.isSyncing setting false with err ${ErrorUtils.error2String(err)}`
                    )
                    CommonParam.isSyncing = false
                    reject(err)
                })
        }
    })
}

export const updateParamsWhenEndMyDay = (visitList: any) => {
    return new Promise((resolve, reject) => {
        LocationService.getCurrentPosition()
            .then((position: any) => {
                visitList.End_Date__c = todayDateWithTimeZone(true)
                if (position && position.coords) {
                    const coords = redefinePositionCoords(position.coords.latitude, position.coords.longitude)
                    visitList.End_Location__latitude__s = coords.latitude
                    visitList.End_Location__longitude__s = coords.longitude
                } else {
                    storeClassLog(
                        Log.MOBILE_WARN,
                        'MD-updateParamsWhenEndMyDay',
                        `Get position failed for end day: ${JSON.stringify(position)}`
                    )
                }
                visitList.Status__c = 'Completed'
                visitList.End_Date_Time__c = new Date().toISOString()
                resolve(visitList)
            })
            .catch((err) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'MD-updateParamsWhenEndMyDay',
                    `updateParamsWhenEndMyDay failed: ${ErrorUtils.error2String(err)}`
                )
                reject(err)
            })
    })
}

export const syncVisitBeforeVL = async (shouldUploadVisitFirst: boolean) => {
    try {
        if (
            CommonParam.pendingSync &&
            (CommonParam.pendingSync.visit || CommonParam.pendingSync.scheduledMeeting) &&
            shouldUploadVisitFirst
        ) {
            await SyncService.syncUp({
                soupName: 'Visit'
            })
            await SyncService.syncUp({
                soupName: 'Event'
            })
        }
    } catch (err) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'syncVisitBeforeVL',
            `Failed to sync vl before visit: ${ErrorUtils.error2String(err)}`
        )
    }
}

export const endDayHelper = () => {
    return new Promise((resolve, reject) => {
        if (CommonParam.isSyncing) {
            recordSyncingLogs('endDayHelper: CommonParam.isSyncing is false, so return')
            reject('sync')
        } else {
            recordSyncingLogs('endDayHelper: CommonParam.isSyncing setting true')
            CommonParam.isSyncing = true
            setupBreadcrumbsAfterEndMyDay()
            let visitList: any = []
            try {
                visitList = JSON.parse(JSON.stringify(CommonParam.visitList))
            } catch (error) {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'MD-EndMyDay',
                    `JSON parse failed: ${ErrorUtils.error2String(error)} + ${CommonParam.visitList}`
                )
                reject(error)
            }
            updateParamsWhenEndMyDay(visitList)
                .then((completedVisitList) => {
                    return updateVLWhenEndDay(completedVisitList)
                })
                .then((res) => {
                    AsyncStorage.setItem('pendingSyncItems', JSON.stringify(CommonParam.pendingSync))
                    CommonParam.shiftStatus = 'ended'
                    recordSyncingLogs('endDayHelper: CommonParam.isSyncing setting false')
                    CommonParam.isSyncing = false
                    resolve(res)
                })
                .catch((err) => {
                    recordSyncingLogs(
                        `endDayHelper: CommonParam.isSyncing setting false with err ${ErrorUtils.error2String(err)}`
                    )
                    CommonParam.isSyncing = false
                    AsyncStorage.setItem('pendingSyncItems', JSON.stringify(CommonParam.pendingSync))
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'MD-EndMyDay',
                        `endDayHelper failed: ${ErrorUtils.error2String(err)}`
                    )
                    reject(err)
                })
        }
    })
}

const getLocationList = (stores) => {
    const locationList = []
    stores.forEach((store) => {
        if (store.Geofence) {
            try {
                const geofence = JSON.parse(store.Geofence)
                geofence.CustomId = store.accountId
                geofence.Id = store.storeId
                locationList.push(geofence)
            } catch (err) {
                storeClassLog(
                    Log.MOBILE_WARN,
                    'MD-getLocationList',
                    `Failed to get geofence: ${ErrorUtils.error2String(err)}`
                )
            }
        }
    })
    return locationList
}

const insertMeetingToCurrentVisitList = (meetingArray: MeetingProps, currentVisitArray: any[]) => {
    setLoggedInUserTimezone()
    const { schMeetings, endMeetings } = meetingArray
    schMeetings.forEach((sm) => {
        if (isTodayDayWithTimeZone(sm.StartDateTime, true)) {
            currentVisitArray.unshift(sm)
        }
    })
    endMeetings.forEach((sm) => {
        if (isTodayDayWithTimeZone(sm.StartDateTime, true)) {
            currentVisitArray.push(sm)
        }
    })
}

const resetCommonParamVisitIfToday = () => {
    if (CommonParam.visitStatus) {
        const today = todayDateWithTimeZone(true)
        if (CommonParam.visitStatus?.Planned_Date__c === today && CommonParam.visitList?.Visit_Date__c === today) {
            CommonParam.visitStatus = {}
        }
    } else {
        CommonParam.visitStatus = {}
    }
}

const getVisitsFromCurrentVisitList = (visitArray) => {
    if (!visitArray || visitArray.length === 0) {
        resetCommonParamVisitIfToday()
        return {
            todayData: [],
            currentVisitArray: [],
            completedCount: 0,
            notCompletedCount: 0,
            hasInProgressVisit: false
        }
    }

    const currentVisitArray = []
    let completedCount = 0
    let notCompletedCount = 0
    let hasInProgressVisit = false

    visitArray.forEach((visit) => {
        if (visit.visitList && CommonParam.visitList.Id === visit.visitList) {
            currentVisitArray.push(visit)

            if (visit.status === VisitStatus.COMPLETE) {
                completedCount++
            } else {
                notCompletedCount++
                if (visit.status === VisitStatus.IN_PROGRESS) {
                    hasInProgressVisit = true
                    BreadcrumbsService.updateInStoreStatus(true)
                    CommonParam.visitStatus = visit
                }
            }
        }
    })

    if (!hasInProgressVisit) {
        BreadcrumbsService.updateInStoreStatus(false)
        resetCommonParamVisitIfToday()
    }

    const todayData = handleDataInOneDay(visitArray)

    return { todayData, currentVisitArray, completedCount, notCompletedCount, hasInProgressVisit }
}

export const getVisitsByVL = async (): Promise<VisitModal> => {
    try {
        const visitAndEventData: any = await getVisitAndEventDataForTodayTab()
        const allRecordTypeResult = visitAndEventData.visitData || []
        const todayData = visitAndEventData.fullData || {}

        const result = allRecordTypeResult.filter((item) => item.VisitorId === CommonParam.userId)
        setLoggedInUserTimezone()
        const { currentVisitArray, notCompletedCount, hasInProgressVisit } = getVisitsFromCurrentVisitList(result)

        const uniqueStores = _.uniqBy(currentVisitArray, 'storeId')
        CommonParam.geoLocationList = getLocationList(uniqueStores)

        const metricData = getMetricDataForToday(todayData.visitAndEventArray || [])

        const res = await getScheduleMeetingData()
        insertMeetingToCurrentVisitList(res, currentVisitArray)

        return {
            todayData,
            todayList: currentVisitArray,
            inprogress: hasInProgressVisit,
            allCompleted: notCompletedCount === 0,
            metricData
        }
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'MD-getVisitsByVL', `Get visit failed: ${ErrorUtils.error2String(error)}`)
        throw error
    }
}

const getCurrentVisitList = (vList) => {
    setLoggedInUserTimezone()
    let list = vList.find((l) => l.Status__c === VisitStatus.IN_PROGRESS && l.RecordTypeId === CommonParam.dailyRcdId)
    if (!list) {
        list =
            vList.find((vlTmp) => {
                return isTodayDayWithTimeZone(vlTmp.Visit_Date__c, true) && vlTmp.Status__c === VisitStatus.NOT_STARTED
            }) || {}
    }
    setupLocationByCoordinates(list, true, false)
    return list
}

const setupCurrentWeeklyVisitList = (visitListArray: any[]) => {
    setLoggedInUserTimezone()
    const now = moment()
    const weeklyVL =
        visitListArray.find((vlTmp) => {
            if (vlTmp.RecordTypeId !== CommonParam.weeklyRcdId) {
                return false
            }
            const start = moment(vlTmp.Start_Date__c)
            const end = moment(vlTmp.End_Date__c)
            return now.clone().startOf(MOMENT_STARTOF.DAY) >= start && now.clone().endOf(MOMENT_STARTOF.DAY) <= end
        }) || null

    CommonParam.weeklyList = weeklyVL
    return weeklyVL
}

export const getCurrentVLFromLocal = () => {
    return new Promise((resolve) => {
        getRecordTypeIdIfNull()
            .then(() => {
                const start = getLastSundayDate()
                SoupService.retrieveDataFromSoup('Visit_List__c', {}, [], null, [
                    ` WHERE {Visit_List__c:IsRemoved__c} = '${BooleanStr.STR_FALSE}' 
                    AND ({Visit_List__c:RecordTypeId} = '${CommonParam.weeklyRcdId}') 
                    OR ({Visit_List__c:OwnerId} = '${CommonParam.userId}'
                        AND {Visit_List__c:Visit_Date__c} >= date("${start}")
                        AND {Visit_List__c:RecordTypeId} = '${CommonParam.dailyRcdId}'
                        AND ({Visit_List__c:Status__c} = 'Not Started' OR {Visit_List__c:Status__c} = 'In Progress')) 
                    ORDER BY {Visit_List__c:Name}`
                ])
                    .then((vList: any) => {
                        const list = getCurrentVisitList(vList)
                        CommonParam.visitList = list
                        setupCurrentWeeklyVisitList(vList)
                        resolve({ visitList: list })
                    })
                    .catch((err) => {
                        resolve(null)
                        addADLog('getCurrentVLFromLocal - retrieve err')
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'MD-getRecordTypeIdIfNull',
                            `Get visitList failed: ${ErrorUtils.error2String(err)}`
                        )
                    })
            })
            .catch((err) => {
                addADLog('getCurrentVLFromLocal - getRecordTypeIdIfNull err')
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'MD-getCurrentVLFromLocal',
                    `RecordType not available: ${ErrorUtils.error2String(err)}`
                )
            })
    })
}

export const getVisitListFromLocalById = (visitListId: string) => {
    return new Promise((resolve) => {
        getRecordTypeIdIfNull()
            .then(() => {
                return SoupService.retrieveDataFromSoup('Visit_List__c', {}, [], null, [
                    ` WHERE {Visit_List__c:Id} = '${visitListId}' LIMIT 1`
                ])
            })
            .then((vList: any) => {
                const list = vList[0]
                setupLocationByCoordinates(list, true, false)
                CommonParam.visitList = list
                resolve(list)
            })
            .catch((err) => {
                resolve(null)
                addADLog('getVisitListFromLocalById - retrieve err')
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'MD-getVisitListFromLocalById',
                    `getVisitListFromLocalById failed: ${ErrorUtils.error2String(err)}`
                )
            })
    })
}

export const resetVariables = () => {
    CommonParam.inMeeting = false
}

const prepareToRecordGeofence = (locations, cLocation, watchingEvent, watchingClick) => {
    try {
        const type = watchingEvent || ''
        if (!watchingClick || type === 'Scheduled Meeting') {
            restoreMerchandiserGeofence(locations, cLocation)
        }
    } catch (error) {}
}

const getVisitEntryId = async (visitId: string) => {
    const res = await SoupService.retrieveDataFromSoup('Visit', {}, ['Id', '__soupEntryId'], null, [
        `WHERE {Visit:Id} = '${visitId}'`
    ])
    return res[0]?._soupEntryId || null
}

const updateVisitCompliant = async (originalVisit) => {
    const visit = _.cloneDeep(originalVisit)
    if (visit.status === VisitStatus.IN_PROGRESS && (visit.AMAS_Compliant__c === '0' || !visit.AMAS_Compliant__c)) {
        if (__DEV__) {
            recordAMASLogs('updateVisitCompliant 682', 'updateVisitCompliant')
        }
        originalVisit.AMAS_Compliant__c = true
        const entryId = await getVisitEntryId(visit.id)
        const param = { AMAS_Compliant__c: true, _soupEntryId: entryId }

        SoupService.updateDataWithPartialParamsIntoSoupWithQuery('Visit', ` WHERE {Visit:Id} = '${visit.id}'`, param)
            .then(() => {
                NetInfo.fetch().then((state) => {
                    if (state.isInternetReachable) {
                        restDataCommonCall(`sobjects/Visit/${visit.Id}`, 'PATCH', { AMAS_Compliant__c: true })
                            .then(() => {})
                            .catch((updateErr) => {
                                CommonParam.pendingSync.visit = true
                                recordAMASLogs(
                                    'updateVisitCompliant 695',
                                    `update AMAS failed: ${ErrorUtils.error2String(updateErr)}`
                                )
                            })
                    }
                })
            })
            .catch((updateError) => {
                recordAMASLogs('updateVisitCompliant 700', `failed: ${ErrorUtils.error2String(updateError)}`)
            })
    }
}

export const refreshGeoFence = (cLocation, data, watchingEvent, watchingClick) => {
    const visitList = CommonParam.visitList || {}
    const oldInLocationStore = []
    data.forEach((store) => {
        if (store.inLocation) {
            oldInLocationStore.push(store.storeId)
        }
        store.inLocation = false
    })
    const locations = checkInRange(cLocation)
    if (visitList.Start_Date_Time__c && !visitList.End_Date_Time__c) {
        prepareToRecordGeofence(locations, cLocation, watchingEvent, watchingClick)
    }

    const newInLocationStore = []
    locations.forEach((location) => {
        const stores = data.filter((visit) => visit.storeId === location.Id)
        stores.forEach((store) => {
            updateVisitCompliant(store)
            store.inLocation = true
            newInLocationStore.push(location.Id)
        })
    })

    const noNeedRefresh = isSameArray(oldInLocationStore, newInLocationStore)
    return { newData: data, noNeedRefresh }
}

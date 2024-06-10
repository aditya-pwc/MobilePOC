/**
 * @description Utils for Merch Manager.
 * @author Xupeng Bao
 * @date 2021-05-11
 */
import _, { isObject } from 'lodash'
import moment from 'moment'
import 'moment-timezone'
import { database } from '../common/SmartSql'
import { SoupService } from '../service/SoupService'
import ScheduleQuery from '../queries/ScheduleQuery'
import { filterExistFields, getObjByName } from './SyncUtils'
import {
    syncUpObjCreate,
    syncUpObjUpdate,
    restDataCommonCall,
    buildSyncDownObjPromise,
    syncDownObj,
    syncUpObjUpdateFromMem,
    syncUpObjCreateFromMem
} from '../api/SyncUtils'
import { CommonParam } from '../../common/CommonParam'
import {
    CalculateResultInterface,
    DeleteCTRInterface,
    DeleteSelectToSoupProps,
    GetDataForReassignInterface,
    GetDataInterface,
    PointInterface,
    QueryAndSyncScheduleInterface,
    QueryDailyForReassignInterface,
    QueryWeeklyForReassignInterface,
    RefreshCTRInterface
} from '../interface/MerchManagerInterface'
import { formatString, isTrueInDB } from './CommonUtils'
import { Alert, NativeModules } from 'react-native'
import { rebuildObjectDepth } from './SoupUtils'
import { diffDay } from '../common/DateTimeUtils'
import { decode } from 'html-entities'
import SyncService, { buildManagerSyncDownQuery, condRegExMapMM } from '../service/SyncService'
import { Log } from '../../common/enums/Log'
import {
    computeSmartClause,
    computeShipAddress,
    computeVisitAddress,
    computeEmployeeList,
    getOverworkStatus,
    getWorkingStatus,
    getTotalMinus,
    getTotalHours,
    getWeekLabel,
    computeStoreAddress
} from './MerchManagerComputeUtils'
import { promiseQueue } from '../api/InitSyncUtils'
import { formatWithTimeZone, setLoggedInUserTimezone } from './TimeZoneUtils'
import { getIdClause, getLocationData } from '../components/manager/helper/MerchManagerHelper'
import { UserType } from '../redux/types/H01_Manager/data-userType'
import { BooleanStr, DropDownType, InitialOrDeltaQuery, InitialOrDeltaType, LineCodeGroupType } from '../enums/Manager'
import { VisitListStatus } from '../enums/VisitList'
import { t } from '../../common/i18n/t'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { decryptWithString } from './Aes'
import { VisitStatus } from '../enums/Visit'
import { handleRouteSalesGeo } from '../components/manager/helper/ServiceDetailHelper'
import { MerchManagerScreenMapping } from '../config/ScreenMapping'
import { fetchUserInfo } from '../components/manager/helper/VisitHelper'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { DayNameToFrench, Locale } from '../enums/i18n'
import { getStringValue } from './LandingUtils'
import MerchManagerConfig from '../config/MerchManagerConfig'
import { isPersonaUGM, isPersonaMerchManager } from '../../common/enums/Persona'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../common/enums/MomentStartOf'
import { storeClassLog } from '../../common/utils/LogUtils'
import { getAuditVisitTypeLabel } from '../helper/rep/NotificationHelper'
import { FormNotificationType, RealogramNotificationType } from '../enums/Contract'

setLoggedInUserTimezone()
const { MapManager } = NativeModules
let modifyTime = new Date().toISOString()
let usedNotifications = []

export const DEFAULT_DELAY_TIME = 2000
export const DEFAULT_DELAY_TIME_TEN = 15000
export const E_CARD_HEIGHT = 110
export const ReassignModalType = {
    ReassignModalType_CustomerDetail: 'CustomerDetail',
    ReassignModalType_EmployeeDetail: 'EmployeeDetail',
    ReassignModalType_UnassignVisit: 'UnassignVisit',
    ReassignModalType_Published: 'published',
    ReassignModalType_UnassignVisit_From_MyDay: 'UnassignVisitFromMyDay'
}

export const initOverTime = () => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'Overtime_Rule__mdt',
            {},
            ['Id', 'DeveloperName', 'LocationID__c', 'Location_or_Global__c', 'Rule__c', 'Value__c'],
            `SELECT {Overtime_Rule__mdt:Id}, {Overtime_Rule__mdt:DeveloperName}, {Overtime_Rule__mdt:LocationID__c}, {Overtime_Rule__mdt:Location_or_Global__c},
        {Overtime_Rule__mdt:Rule__c}, {Overtime_Rule__mdt:Value__c} FROM {Overtime_Rule__mdt}`
        )
            .then((res: any) => {
                let glWeeklyVal = 0
                let glDailyVal = 0
                let lcWeeklyVal = 0
                let lcDailyVal = 0
                res.forEach((rec: any) => {
                    if (rec.Rule__c === 'Weekly hour threshold') {
                        if (rec.Location_or_Global__c === 'Global') {
                            glWeeklyVal = rec.Value__c || 0
                        }
                        if (rec.LocationID__c === CommonParam.userLocationId) {
                            lcWeeklyVal = rec.Value__c || 0
                        }
                    } else if (rec.Rule__c === 'Daily hour threshold') {
                        if (rec.Location_or_Global__c === 'Global') {
                            glDailyVal = rec.Value__c || 0
                        }
                        if (rec.LocationID__c === CommonParam.userLocationId) {
                            lcDailyVal = rec.Value__c || 0
                        }
                    }
                })
                CommonParam.dailyHourThreshold = lcDailyVal || glDailyVal
                CommonParam.weeklyHourThreshold = lcWeeklyVal || glWeeklyVal
                resolve('Success')
            })
            .catch((e) => {
                reject(e)
            })
    })
}

export const getAfterInitQuery = () => {
    const objs = _.cloneDeep(CommonParam.objs.filter((model) => model.afterInitQuery))
    const newQuery = objs.map((obj) => {
        if (obj.afterInitQuery) {
            const regExpMap = condRegExMapMM()
            obj.afterInitQuery = buildManagerSyncDownQuery(obj.afterInitQuery, regExpMap)
        }
        return { name: obj.name, q: obj.afterInitQuery }
    })
    return newQuery.filter((r) => r.q)
}
/**
 * sync down initial and delta query from sf
 */
export const syncDownInitialAndDeltaQuery = async () => {
    const query = 'SELECT Id, Object__c, Query__c, InitialOrDelta__c from Mobile_App_Sync_Query__mdt'
    const path = `query/?q=${query}`
    try {
        const result = await restDataCommonCall(path, 'GET')
        const records = result?.data?.records
        const initialQueries = []
        const deltaQueries = []
        for (const record of records) {
            if (record.InitialOrDelta__c === InitialOrDeltaType.INITIAL) {
                initialQueries.push(record)
            } else {
                deltaQueries.push(record)
            }
        }
        await AsyncStorage.setItem(InitialOrDeltaQuery.INITIAL_QUERIES, JSON.stringify(initialQueries))
        await AsyncStorage.setItem(InitialOrDeltaQuery.DELTA_QUERIES, JSON.stringify(deltaQueries))
    } catch (err) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'MerchManagerUtils.syncDownInitialAndDeltaQuery',
            `Sync Down Initial And Delta Query error: ${getStringValue(err)}`
        )
    }
}

export const getInitQuery = () => {
    const objs = _.cloneDeep(CommonParam.objs.filter((model) => model.initQuery))
    const newQuery = objs.map((obj) => {
        if (obj.initQuery) {
            const regExpMap = condRegExMapMM()
            if (obj.optimization) {
                obj.initQuery = buildManagerSyncDownQuery(obj.initQuery + obj.optimizationQuery, regExpMap)
            } else {
                obj.initQuery = buildManagerSyncDownQuery(obj.initQuery, regExpMap)
            }
        }
        return { name: obj.name, q: obj.initQuery }
    })
    return newQuery.filter((r) => r.q)
}

export const promisesOneByOne = (reqs, setProgress?) => {
    if (reqs.length === 0) {
        return null
    }
    const block = 1 / reqs.length
    return new Promise((resolve, reject) => {
        const results: unknown = []
        let promiseCount = 0
        const promisesLength = reqs.length
        for (let i = 0; i < promisesLength; i++) {
            Promise.resolve(reqs[i])
                .then((res) => {
                    promiseCount++
                    if (setProgress) {
                        setProgress((progress) => progress + block)
                    }
                    results[i] = res
                    if (promiseCount === promisesLength) {
                        resolve(results)
                    }
                })
                .catch((err) => {
                    reject(err)
                })
        }
    })
}

export const syncDownInStoreMap = async (Id) => {
    CommonParam.uniqueStoreIds = [Id]
    const afterInitQuery = getAfterInitQuery()

    const reqs = afterInitQuery.map((m) => {
        return buildSyncDownObjPromise(m.name, m.q)
    })
    await promiseQueue(reqs)
}

export const getInitQueryWithObjName = (objName: string) => {
    const objConfig = _.cloneDeep(CommonParam.objs.filter((model) => model.name === objName))
    if (objConfig[0]?.initQuery) {
        const regExpMap = condRegExMapMM()
        return buildManagerSyncDownQuery(objConfig[0].initQuery, regExpMap)
    }
    return ''
}

export const syncRelatedDataAfterInitSync = async () => {
    const res = await SoupService.retrieveDataFromSoup(
        'Visit',
        {},
        ['PlaceId'],
        `SELECT {Visit:PlaceId} FROM {Visit} 
        WHERE {Visit:Planned_Date__c} >= date('now','${CommonParam.userTimeZoneOffset}' , 'start of day', '-14 day') AND {Visit:Planned_Date__c} <= date('now', '${CommonParam.userTimeZoneOffset}', 'start of day', '+1 day')
        `
    )
    const uniqueStoreIds = Array.from(new Set(res.map((v) => v.PlaceId)))
    if (uniqueStoreIds.length > 0) {
        const reqs = []
        const storeQuery = await getInitQueryWithObjName('RetailStore')
        const originQuery = storeQuery.split('AND')[0]
        const storeIdGroup = _.chunk(uniqueStoreIds, 300)
        storeIdGroup.forEach((storeIdSuffix) => {
            reqs.push(
                buildSyncDownObjPromise('RetailStore', originQuery + ` AND Id IN (${getIdClause(storeIdSuffix)})`)
            )
        })
        await promiseQueue(reqs)
    }
}

export const initManager = async (setProgress?) => {
    const newQuery = getInitQuery()
    const reqs = newQuery.map((m) => {
        return buildSyncDownObjPromise(m.name, m.q)
    })
    Instrumentation.startTimer('Merch manager sync base objs')
    await promiseQueue(reqs, setProgress)
    Instrumentation.stopTimer('Merch manager sync base objs')
    await initOverTime()
    Instrumentation.startTimer('Merch manager sync related objs')
    await syncRelatedDataAfterInitSync()
    Instrumentation.stopTimer('Merch manager sync related objs')
    await SyncService.syncDownObjWithCond(MerchManagerConfig.objs.find((soup) => soup.name === 'Visit_List__c'))
}

export const getObjWithNavigation = () => {
    return []
}

export const getQuerySeq = (navigation?) => {
    let objs = _.cloneDeep(CommonParam.objs.filter((model) => model.initQuery))
    if (navigation) {
        objs = getObjWithNavigation()
    }
    let newInitQuery = ''
    const newQuery = objs.map((obj) => {
        if (obj.initQuery) {
            const regExpMap = condRegExMapMM()
            newInitQuery = buildManagerSyncDownQuery(obj.initQuery, regExpMap)
            if (
                !obj.noLastModifiedField &&
                !obj?.name?.endsWith('__mdt') &&
                !newInitQuery.includes('LastModifiedDate >=')
            ) {
                if (newInitQuery.includes('WHERE')) {
                    newInitQuery += ' AND LastModifiedDate >= %s '
                } else {
                    newInitQuery += ' WHERE LastModifiedDate >= %s '
                }
                newInitQuery = formatString(newInitQuery, [CommonParam.lastModifiedDate])
            }
        }
        return { name: obj.name, q: newInitQuery }
    })
    return newQuery.filter((query) => {
        return query.q
    })
}

const tempBuildSyncDownObjPromise = (objName: string, q: string) => {
    return async () => {
        if (objName === 'Account') {
            const retailStoreConfig = await getInitQueryWithObjName('RetailStore')
            const accountRecords = await syncDownObj(objName, q)
            if (!_.isEmpty(accountRecords?.data)) {
                const accountIds = []
                accountRecords.data.forEach((account) => {
                    accountIds.push(account.Id)
                })
                const reqs = []
                const accountGroup = _.chunk(accountIds, 300)
                accountGroup.forEach((accountSuffix) => {
                    reqs.push(
                        buildSyncDownObjPromise(
                            'RetailStore',
                            retailStoreConfig + ` AND AccountId IN (${getIdClause(accountSuffix)})`
                        )
                    )
                })
                await promiseQueue(reqs)
            }
        } else {
            await syncDownObj(objName, q)
        }
    }
}

export const refreshManager = async (navigation?) => {
    if (!__DEV__) {
        Instrumentation.startTimer('Merch Manager refresh all data')
        const currentDate = CommonParam.lastModifiedDate
        try {
            const now = new Date()
            const newQuery = getQuerySeq(navigation)
            const reqs = newQuery.map((m) => {
                return tempBuildSyncDownObjPromise(m.name, m.q)
            })
            await promiseQueue(reqs)
            if (isPersonaUGM() || isPersonaMerchManager()) {
                await initOverTime()
            }
            CommonParam.lastModifiedDate = now.toISOString()
            await AsyncStorage.setItem('lastModifiedDate', now.toISOString())
            Instrumentation.stopTimer('Merch Manager refresh all data')
        } catch (error) {
            CommonParam.lastModifiedDate = new Date(currentDate).toISOString()
            await AsyncStorage.setItem('lastModifiedDate', new Date(currentDate).toISOString())
            storeClassLog(Log.MOBILE_ERROR, refreshManager.name, `Refresh manager error: ${getStringValue(error)}`)
        }
    }
}

export const getSyncActionSeq = (tableNames?: Array<string>) => {
    let objs = []
    if (!_.isEmpty(tableNames)) {
        objs = _.cloneDeep(
            CommonParam.objs.filter((model) => tableNames.includes(model.name)).filter((m) => m.initQuery)
        )
    } else {
        objs = _.cloneDeep(
            CommonParam.objs
                .filter(
                    (model) =>
                        model.name === 'Visit' ||
                        model.name === 'Visit_List__c' ||
                        model.name === 'User' ||
                        model.name === 'Event'
                )
                .filter((m) => m.initQuery)
        )
    }
    let newInitQuery = ''
    const newQuery = objs.map((obj) => {
        if (obj.initQuery) {
            const regExpMap = condRegExMapMM()
            newInitQuery = buildManagerSyncDownQuery(obj.initQuery, regExpMap)
            if (!obj.noLastModifiedField && !obj?.name?.endsWith('__mdt')) {
                if (newInitQuery.includes('WHERE')) {
                    newInitQuery += ' AND LastModifiedDate >= %s '
                } else {
                    newInitQuery += ' WHERE LastModifiedDate >= %s '
                }
            }
            newInitQuery = formatString(newInitQuery, [CommonParam.lastModifiedDate])
        }
        return { name: obj.name, q: newInitQuery }
    })
    return newQuery.filter((query) => {
        return query.q
    })
}

export const syncDownDataByTableNames = async (tableNames?: Array<string>) => {
    Instrumentation.startTimer('Merch Manager sync down data by table name')
    const newQuery = getSyncActionSeq(tableNames)
    const reqs = newQuery.map((m) => {
        return tempBuildSyncDownObjPromise(m.name, m.q)
    })
    await promiseQueue(reqs)
    Instrumentation.stopTimer('Merch Manager sync down data by table name')
}

const ONE_PLUS_PHONE_NUM_LENGTH = 11
const WANTED_PHONE_NUM_LENGTH = 10
const MAX_PHONE_NUM_LENGTH = 30
// expected phone number format (123) 456 7899
// filter + - ( ) 1 at the beginning
export const formatPhoneNumber = (phone: string) => {
    if (phone) {
        if (phone.length >= MAX_PHONE_NUM_LENGTH) {
            return phone.substring(0, MAX_PHONE_NUM_LENGTH) + '...'
        }
        let phoneNum = phone
            .replace(/\+/g, '')
            .replace(/-/g, '')
            .replace(/\(/g, '')
            .replace(/\)/g, '')
            .replace(/\s/g, '')
        if (phoneNum.length === ONE_PLUS_PHONE_NUM_LENGTH) {
            phoneNum = phoneNum.substring(1, phoneNum.length)
        }
        if (phoneNum.length === WANTED_PHONE_NUM_LENGTH) {
            return (
                '(' +
                phoneNum.substring(0, 3) +
                ') ' +
                phoneNum.substring(3, 6) +
                ' ' +
                phoneNum.substring(6, phoneNum.length)
            )
        }
        return phone
    }
    return ''
}

export const getTimeFromMins = (mins) => {
    const tmpMins = Math.round(mins)
    const hour = (tmpMins / 60) | 0
    const min = tmpMins % 60 | 0
    if (hour < 1) {
        return min + ' ' + t.labels.PBNA_MOBILE_MIN
    }
    if (hour >= 1 && hour < 2) {
        if (min === 0) {
            return hour + ' ' + t.labels.PBNA_MOBILE_HR
        }
        if (min === 0) {
            return hour + ' ' + t.labels.PBNA_MOBILE_HR
        }
        return hour + ` ${t.labels.PBNA_MOBILE_HR} ` + min + ' ' + t.labels.PBNA_MOBILE_MIN
    }
    if (min === 0) {
        return hour + ' ' + t.labels.PBNA_MOBILE_HRS
    }
    return hour + ` ${t.labels.PBNA_MOBILE_HRS} ` + min + ' ' + t.labels.PBNA_MOBILE_MIN
}

export const getTimeFormatFromMins = (mins) => {
    const hour = (mins / 60) | 0
    const min = mins % 60 | 0
    if (hour < 1) {
        if (min < 10) {
            return '00:0' + min + ' ' + t.labels.PBNA_MOBILE_MINS
        }
        return '00:' + min + ' ' + t.labels.PBNA_MOBILE_MINS
    } else if (hour >= 1 && hour < 10) {
        if (min < 10) {
            return BooleanStr.STR_FALSE + hour + ':0' + min + ' ' + t.labels.PBNA_MOBILE_MINS
        }
        return BooleanStr.STR_FALSE + hour + ':' + min + ' ' + t.labels.PBNA_MOBILE_MINS
    }
    if (min < 10) {
        return hour + ':0' + min + ' ' + t.labels.PBNA_MOBILE_MINS
    }
    return hour + ':' + min + ' ' + t.labels.PBNA_MOBILE_MINS
}
const DVL_SOUP_ID = 'DVL._soupEntryId'
const WVL_SOUP_ID = 'WVL._soupEntryId'
/**
 * @description Review new schedule view click cancel button will remove local data.
 * @param visitListId Schedule visit group
 * @param dropDownRef handle error
 */
export const removeDataOnCancelClick = async (visitListId, dropDownRef) => {
    try {
        const res = await database('Visit')
            .use('Visit')
            .select(['_soupEntryId'])
            .join({
                table: 'Visit_List__c',
                alias: 'DVL',
                options: {
                    mainField: 'Id',
                    targetField: 'Visit_List__c',
                    targetTable: 'Visit',
                    fieldList: ['Id', '_soupEntryId', 'Visit_Date__c']
                },
                type: 'LEFT'
            })
            .join({
                table: 'Visit_List__c',
                alias: 'WVL',
                options: {
                    mainField: 'Id',
                    targetField: 'Visit_List_Group__c',
                    targetTable: 'DVL',
                    fieldList: ['_soupEntryId', 'Start_Date__c', 'End_Date__c']
                },
                type: 'LEFT'
            })
            .where([
                {
                    leftTable: 'Visit',
                    leftField: 'Schedule_Visit_Group__c',
                    rightField: `'${visitListId}'`,
                    operator: '='
                }
            ])
            .getData()
        const removeVisitIds = []
        const removeVisitListIds = []
        if (res.length > 0) {
            res.forEach((item) => {
                removeVisitIds.push(item._soupEntryId)
                if (!removeVisitListIds.includes(item[DVL_SOUP_ID]) && item[DVL_SOUP_ID]) {
                    removeVisitListIds.push(item[DVL_SOUP_ID])
                }
                if (!removeVisitListIds.includes(item[WVL_SOUP_ID]) && item[WVL_SOUP_ID]) {
                    removeVisitListIds.push(item[WVL_SOUP_ID])
                }
            })
        }
        if (removeVisitIds.length > 0) {
            await SoupService.removeRecordFromSoup('Visit', removeVisitIds).catch((err) => {
                dropDownRef.current.alertWithType('Utils', 'Failed to remove Visit', JSON.stringify(err))
            })
        }
        if (removeVisitListIds.length > 0) {
            await SoupService.removeRecordFromSoup('Visit_List__c', removeVisitListIds).catch((err) => {
                dropDownRef.current.alertWithType('Utils', 'Failed to remove Visit List', JSON.stringify(err))
            })
        }
    } catch (error) {
        dropDownRef.current.alertWithType('Utils', 'Database error', error)
    }
}

export const formatUTCToLocalTime = (dateStr: string) => {
    const tz = CommonParam.userTimeZone
    if (dateStr) {
        return moment.tz(moment.utc(dateStr.split('.')[0], TIME_FORMAT.HH_MM_SS), tz).format(TIME_FORMAT.HMMA)
    }
    return ''
}

export const formatUTCToLocalMilitaryTime = (dateStr: string) => {
    const tz = CommonParam.userTimeZone
    if (dateStr) {
        return moment.tz(moment.utc(dateStr.split('.')[0], TIME_FORMAT.HH_MM_SS), tz).format(TIME_FORMAT.HH_MM)
    }
    return ''
}

export const formatLocalMilitaryTimeToUTCTime = (time: string) => {
    if (!_.isEmpty(time)) {
        return moment(time, TIME_FORMAT.HH_MM).utc().toISOString().split('T')[1]
    }
    return time
}

export const convertLocalTimeToUTCTime = (time) => {
    if (!_.isEmpty(time)) {
        return moment(time, TIME_FORMAT.HMMA).utc().toISOString().split('T')[1]
    }
    return time
}

export const getDefaultStartTime = () => {
    setLoggedInUserTimezone()
    const timeStr: any = moment().format('HH:mm').toString()
    const timeArr: any = timeStr.split(':')
    let tempHour = timeArr[0]
    let tempMin = timeArr[1]
    if (tempHour === '23' && tempMin >= 45) {
        tempHour = '00'
        tempMin = '00'
    } else {
        if (tempMin / 15 < 1) {
            tempMin = 15
        } else if (tempMin / 15 >= 1 && tempMin / 15 < 2) {
            tempMin = 15 * 2
        } else if (tempMin / 15 >= 2 && tempMin / 15 < 3) {
            tempMin = 15 * 3
        } else {
            tempMin = '00'
            tempHour = Number(timeArr[0]) + 1
        }
    }
    return moment({
        hour: tempHour,
        minutes: tempMin
    })
}

const FORTY_EIGHT = 48
const NINETY_SIX = 96
const HALF_AN_HOUR = 30
const QUARTER_HOUR = 15
export const getTimeList = (val?: any, startTime?: boolean) => {
    if (!val) {
        return Array.from(
            {
                length: FORTY_EIGHT
            },
            (_index, hour) =>
                moment({
                    hour: Math.floor(hour / 2),
                    minutes: hour % 2 === 0 ? 0 : HALF_AN_HOUR
                }).format(TIME_FORMAT.HMMA)
        )
    }
    const timeList = Array.from(
        {
            length: NINETY_SIX
        },
        (_index, hour) =>
            moment({
                hour: Math.floor(hour / val),
                minutes: (hour % val) * QUARTER_HOUR
            }).format(TIME_FORMAT.HMMA)
    )
    return startTime ? timeList.splice(0, 95) : timeList
}
export const getLocationTimeList = () => {
    const tempList = []
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute++) {
            tempList.push(
                moment({
                    hour: hour,
                    minutes: minute
                }).format(TIME_FORMAT.HMMA)
            )
        }
    }
    return tempList
}
export const replaceSpace = (str: string) => {
    if (!str) {
        return ''
    }
    return str.replace(/\s+/g, '')
}

/**
 * @description get random number between min and max number
 * @param n min number
 * @param m max number
 * @returns random number
 */
export const getRandomBetweenTwoNum = (n: number, m: number) => {
    return Math.floor(Math.random() * (m - n + 1) + n)
}

/**
 * @description query weekly visit list
 * @param id visit list owner id
 * @param startDate visit list start date
 * @param endDate visit list end date
 * @param RecordTypeId weekly visit list record type id
 * @param setIsLoading loading
 * @returns weekly visit list
 */
export const queryVisitList = async (
    id: string,
    startDate: string,
    endDate: string,
    RecordTypeId: string,
    setIsLoading?: any
) => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'Visit_List__c',
            {},
            getObjByName('Visit_List__c').syncUpCreateFields,
            getObjByName('Visit_List__c').syncUpCreateQuery +
                `
             WHERE {Visit_List__c:OwnerId} = '${id}'
             AND {Visit_List__c:Start_Date__c} = '${startDate}'
             AND {Visit_List__c:End_Date__c} = '${endDate}'
             AND {Visit_List__c:Location_Id__c} = '${CommonParam.userLocationId}'
             AND {Visit_List__c:RecordTypeId} = '${RecordTypeId}'
             AND {Visit_List__c:Id} != 'NeedCreate'
             AND {Visit_List__c:IsRemoved__c} IS FALSE
            `
        )
            .then((weekVisitListResult) => {
                resolve(weekVisitListResult)
            })
            .catch((err) => {
                setIsLoading && setIsLoading(false)
                reject(err)
            })
    })
}

export const queryScheduleVisit = async (
    id: string,
    startDate: string,
    endDate: string,
    RecordTypeId: string,
    setIsLoading: any
) => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'Visit_List__c',
            {},
            ScheduleQuery.retrieveVisitListData.f,
            ScheduleQuery.retrieveVisitListData.q +
                `
             WHERE {Visit_List__c:Start_Date__c} = '${startDate}'
             AND {Visit_List__c:End_Date__c} = '${endDate}'
             AND {Visit_List__c:RecordTypeId} = '${RecordTypeId}'
             AND {Visit_List__c:Location_Id__c} = '${CommonParam.userLocationId}'
             AND ({Visit_List__c:Status__c} = '${VisitListStatus.ACCEPTED}'
             OR  {Visit_List__c:Status__c} = '${VisitListStatus.COMPLETED}'
             OR  {Visit_List__c:Status__c} = '${VisitListStatus.CANCELING}')
             AND {Visit_List__c:IsRemoved__c} IS FALSE
            `
        )
            .then((scheduleResult) => {
                resolve(scheduleResult)
            })
            .catch((err) => {
                setIsLoading(false)
                reject(err)
            })
    })
}

/**
 * @description Get full week name like ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
 * @returns full week name array
 */
export const DAY_OF_WEEKS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const DAY_OF_WEEK_ABBR = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
export const getFullWeekName = () => {
    setLoggedInUserTimezone()
    const today = moment()
    const thisSunday = today.clone().day(0)
    const dateNames = []
    DAY_OF_WEEKS.forEach((day, i) => {
        const dateName = thisSunday.clone().add(i, MOMENT_STARTOF.DAY).format('dddd')
        dateNames.push({ key: day, label: _.capitalize(dateName) })
    })
    return dateNames
}

export const getFullWeekNameFromString = (weekName) => {
    if (weekName) {
        if (CommonParam.locale === Locale.fr) {
            return DayNameToFrench[weekName.toLocaleUpperCase().slice(0, 3)]
        }
        return weekName.toLocaleUpperCase().slice(0, 3)
    }
    return ''
}

/**
 * @description Get RecordTypeId by Name, SobjectType
 * @returns RecordTypeId
 */
export const getRecordTypeId = async (name, sobjectType, dropDownRef?) => {
    try {
        const recordTypeId = await SoupService.retrieveDataFromSoup(
            'RecordType',
            {},
            ['Id', 'Name', 'SobjectType'],
            'SELECT {RecordType:Id}, {RecordType:Name}, {RecordType:SobjectType} FROM {RecordType} ' +
                `WHERE {RecordType:Name} = '${name}' AND {RecordType:SobjectType} = '${sobjectType}'`
        )
        return recordTypeId[0].Id
    } catch (error) {
        dropDownRef.current.alertWithType('Utils', 'Failed to query RecordType', error)
    }
}

/**
 * @description Get RecordTypeId by DeveloperName, SobjectType
 * @returns RecordTypeId
 */
export const getRecordTypeIdByDeveloperName = async (developerName, sobjectType) => {
    try {
        const recordTypeId = await SoupService.retrieveDataFromSoup(
            'RecordType',
            {},
            ['Id', 'Name', 'SobjectType'],
            'SELECT {RecordType:Id}, {RecordType:Name}, {RecordType:SobjectType} FROM {RecordType} ' +
                `WHERE {RecordType:DeveloperName} = '${developerName}' AND {RecordType:SobjectType} = '${sobjectType}'`
        )
        if (!recordTypeId[0]) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'MerchManagerUtils.getRecordTypeIdByDeveloperName',
                `MMUtils - No RecordType available`
            )
        }
        return recordTypeId[0]?.Id || null
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'MerchManagerUtils.getRecordTypeIdByDeveloperName',
            `MMUtils - Failed to query RecordType: ${getStringValue(error)}`
        )
    }
}

/**
 * @description Query employee list for RNS
 * @param getEmployeeData Type of getDataInterface
 * @returns employeeList
 */
export const queryEmployeeList = async (getEmployeeData: GetDataInterface) => {
    const { visitListId, dropDownRef, lineCodesQuery } = getEmployeeData
    try {
        const weekLabel = getWeekLabel()
        const lcQuery = lineCodesQuery || ''
        const result = await SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            ScheduleQuery.retrieveRNSEmployeeData.f,
            formatString(ScheduleQuery.retrieveRNSEmployeeData.q, [visitListId, lcQuery])
        )
        const items = computeEmployeeList(result)

        const users = Object.values(items)
        users.forEach((user: any) => {
            weekLabel.forEach((label: any) => {
                if (!user.overwork[label]) {
                    user.overwork[label] = { owStatus: 'no_visit' }
                }
                return user.overwork[label]
            })
        })
        return users || null
    } catch (err) {
        dropDownRef.current.alertWithType('ManagerUtils', 'queryEmployeeList - Failed to query', err)
    }
}

export const queryCustomerList = async (getCustomerProps: GetDataInterface) => {
    const { visitListId, dropDownRef } = getCustomerProps
    try {
        const weekLabel = getWeekLabel()
        const result = await SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            ScheduleQuery.retrieveRNSCustomerData.f,
            formatString(ScheduleQuery.retrieveRNSCustomerData.q, [visitListId])
        )
        const items = {}
        const hasUnassignVisitMap = {}
        const unassignedRouteUsers = []
        result.forEach((visit) => {
            if (!_.isEmpty(visit.Route_Group__c) && !unassignedRouteUsers.includes(visit.Route_Group__c)) {
                unassignedRouteUsers.push(visit.Route_Group__c)
            }
        })
        const unassignedRouteUserInfo = await fetchUserInfo(unassignedRouteUsers)
        const unassignedRouteUserIdMap = new Map()
        unassignedRouteUserInfo.forEach((unassignedRouteUser) => {
            unassignedRouteUserIdMap.set(unassignedRouteUser.Id, unassignedRouteUser.Name)
        })
        result.forEach((visit) => {
            const weekName = weekLabel[moment(visit.Planned_Date__c).weekday()]
            // hide ad hoc visits that <= today
            if (
                (moment(visit?.Planned_Date__c).isSameOrBefore(moment(), MOMENT_STARTOF.DAY) &&
                    visit?.Manager_Ad_Hoc__c === BooleanStr.STR_TRUE) ||
                moment(visit?.Planned_Date__c).isBefore(moment(), MOMENT_STARTOF.DAY)
            ) {
                return
            }
            const tmpTotalMinus = getTotalMinus(visit.Planned_Duration_Minutes__c, visit.Planned_Travel_Time__c)
            const tmpTotalHours = getTotalHours(visit.Planned_Duration_Minutes__c, visit.Planned_Travel_Time__c)
            if (!visit?.VisitorId) {
                hasUnassignVisitMap[visit.StoreId] = true
            }
            const shippingAddress = JSON.parse(visit.ShippingAddress)
            if (shippingAddress) {
                shippingAddress.street = shippingAddress?.street?.replace(/[\r\n]/g, ' ')
            }
            const visitObj = {
                id: visit.Id,
                date: visit.Planned_Date__c,
                visitor: visit.VisitorId,
                status: visit.Status__c,
                dVisitListId: visit?.DVisitListId,
                wVisitListId: visit?.WVisitListId,
                subtype: visit.Visit_Subtype__c,
                takeOrder: visit.Take_Order_Flag__c,
                sequence: parseInt(visit.Sequence__c),
                pullNum: parseInt(visit.Pull_Number__c) || 0,
                managerAdHoc: visit.Manager_Ad_Hoc__c === BooleanStr.STR_TRUE,
                totalDuration: Number(visit?.Planned_Duration_Minutes__c) || 0,
                totalMinus: tmpTotalMinus,
                totalHours: tmpTotalHours,
                totalCases: Number(visit?.Scheduled_Case_Quantity__c) || 0,
                totalMiles: Number(visit?.Planned_Mileage__c) || 0,
                name: visit.AccountName,
                address: shippingAddress?.street || '',
                cityStateZip: computeShipAddress(shippingAddress),
                phone: visit.AccountPhone,
                latitude: JSON.parse(visit?.Store_Location__c)?.latitude,
                longitude: JSON.parse(visit?.Store_Location__c)?.longitude,
                storeLocation: visit?.Store_Location__c,
                user: {
                    id: visit.UserId,
                    name: visit.Username,
                    userStatsId: visit.UserStatsId,
                    firstName: visit.FirstName,
                    lastName: visit.LastName,
                    duration: Number(visit?.Planned_Duration_Minutes__c) || 0
                },
                routeGroup: visit.Route_Group__c,
                routeGroupName: unassignedRouteUserIdMap.get(visit.Route_Group__c) || '',
                dfFlag: visit?.Dynamic_Frequency_Add__c
            }
            if (!items[visit.StoreId]) {
                // user does not exist
                items[visit.StoreId] = {
                    id: visit.StoreId,
                    totalVisit: 1,
                    case_volume: 1,
                    visitor: visit.UserId,
                    busnLvl3: visit.busnLvl3,
                    name: visit.AccountName,
                    address: shippingAddress?.street || '',
                    cityStateZip: computeShipAddress(shippingAddress),
                    cof: visit.COF,
                    storeNumber: visit.StoreNumber,
                    phone: visit.AccountPhone,
                    latitude: visit.Latitude,
                    longitude: visit.Longitude,
                    repName: _.isEmpty(visit.Sales_Rep_Info) ? null : JSON.parse(visit.Sales_Rep_Info).Name,
                    repUserStatsID: visit.SalesRepUserStatsID,
                    repFirstName: _.isEmpty(visit.Sales_Rep_Info) ? null : JSON.parse(visit.Sales_Rep_Info).FirstName,
                    repLastName: _.isEmpty(visit.Sales_Rep_Info) ? null : JSON.parse(visit.Sales_Rep_Info).LastName,
                    salesRoute: visit.LOCL_RTE_ID__c,
                    nrid: visit.GTMU_RTE_ID__c,
                    weeklyVisitList: {
                        id: visit.WVisitListId,
                        startDate: visit.WStart_Date__c,
                        endDate: visit.WEnd_Date__c
                    },
                    dailyVisitList: {
                        [visit.DVisitListId]: {
                            id: visit.DVisitListId,
                            date: visit.DVisit_Date__c,
                            updated: false,
                            weeklyVisitId: visit.DVisit_List_Group__c
                        }
                    },
                    visits: {
                        [weekName]: [visitObj]
                    },
                    totalPlanedVisitDuration: visitObj.totalDuration,
                    visitors: [visitObj.user],
                    longestDurationVisitor: visitObj.user,
                    dfVisitNum: isTrueInDB(visit?.Dynamic_Frequency_Add__c) ? 1 : 0
                }
            } else {
                // user exist
                items[visit.StoreId].totalVisit++
                items[visit.StoreId].case_volume++
                items[visit.StoreId].totalPlanedVisitDuration += visitObj.totalDuration
                items[visit.StoreId].dfVisitNum = isTrueInDB(visit?.Dynamic_Frequency_Add__c)
                    ? ++items[visit.StoreId].dfVisitNum
                    : items[visit.StoreId].dfVisitNum
                // Add Daily List
                // if (!items[visit.StoreId].dailyVisitList[visit.DVisitListId]) {
                //     items[visit.StoreId].dailyVisitList[visit.DVisitListId] = {
                //         "id": visit.DVisitListId,
                //         "date": visit.DVisit_Date__c,
                //         "updated": false,
                //         "weeklyVisitId": visit.DVisit_List_Group__c
                //     }
                // }
                // Push Visit to the List
                if (items[visit.StoreId].visits[weekName]) {
                    items[visit.StoreId].visits[weekName].push(visitObj)
                } else {
                    items[visit.StoreId].visits[weekName] = [visitObj]
                }

                const theSameVisitor = items[visit.StoreId]?.visitors.find(
                    (visitor) => visitor.id === visitObj?.user?.id
                )
                if (theSameVisitor) {
                    theSameVisitor.duration += visitObj?.user?.duration
                } else {
                    items[visit.StoreId].visitors.push(visitObj.user)
                }
            }
        })
        Object.keys(hasUnassignVisitMap).forEach((storeId) => {
            items[storeId].hasUnassignVisit = true
        })
        const resultItems = Object.values(items) || null
        resultItems.forEach((item: any) => {
            if (item.visitors.length > 1) {
                const assignedVisitors = item.visitors.filter((visitor) => visitor.id)
                const unassignedVisitors = item.visitors.filter((visitor) => !visitor.id)
                assignedVisitors.sort((a, b) => b.duration - a.duration)
                item.longestDurationVisitor = JSON.parse(JSON.stringify(assignedVisitors[0]))
                const lastAssignedVisitor = assignedVisitors.slice(1, assignedVisitors.length)
                lastAssignedVisitor.sort((a, b) => {
                    const aChart = a?.firstName || ''
                    const bChart = b?.firstName || ''
                    if (bChart.charAt(0).toUpperCase() < aChart.charAt(0).toUpperCase()) {
                        return 1
                    }
                    return -1
                })
                item.moreVisitors = lastAssignedVisitor.concat(unassignedVisitors)
            }
        })
        return resultItems
    } catch (err) {
        dropDownRef.current.alertWithType('ManagerUtils', 'queryCustomerList - Failed to query', err)
    }
}

/**
 * @description Query unassigned employee list for RNS
 * @returns Unassigned employee list
 */

export const queryUnassignedEEList = async (dateArr, setIsLoading?, lineCodesQuery?) => {
    try {
        setIsLoading && setIsLoading(true)
        const DAILY_OVER_WORK_LIMIT_MINUTE = CommonParam.dailyHourThreshold * 60
        const NO_VISIT_TIME = 0
        const unassignedEEList = []
        const userData = await SoupService.retrieveDataFromSoup(
            'User',
            {},
            ScheduleQuery.retrieveUnassignedEE.f,
            formatString(ScheduleQuery.retrieveUnassignedEE.q, [dateArr[0], dateArr[1]]) +
                (lineCodesQuery || '') +
                ' ORDER BY {User:LastName}'
        )

        userData?.forEach((user) => {
            const userObj = {
                id: user.Id,
                name: user.Name,
                firstName: user.FirstName,
                lastName: user.LastName,
                title: user.Title,
                ftFlag: user.FT_EMPLYE_FLG_VAL && user.FT_EMPLYE_FLG_VAL.toLocaleLowerCase(),
                userStatsId: user.UserStatsId,
                workingStatus: getWorkingStatus(user),
                overwork: {},
                totalHours: user?.Unassigned_Employee_Time__c,
                totalCost: user?.Unassigned_Employee_Cost__c,
                isCostInclude: user?.Unscheduled_Cost_Inclusion__c === '1',
                wvlId: user.WVLId
            }
            userObj.workingStatus.forEach((element) => {
                const weekName = element.name
                userObj.overwork[weekName] = {
                    owStatus: getOverworkStatus(NO_VISIT_TIME, DAILY_OVER_WORK_LIMIT_MINUTE)
                }
            })
            unassignedEEList.push(userObj)
        })
        setIsLoading && setIsLoading(false)
        return unassignedEEList
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'MerchManagerUtils.queryUnassignedEEList',
            `unassignedEmployee queryUnassignedEEList: ${getStringValue(error)}`
        )
        setIsLoading && setIsLoading(false)
    }
}

export const queryEmployeeForReassign = async (getEmployeeForReassign: GetDataForReassignInterface) => {
    const { visitListId, userLocationId, dropDownRef, isOnlyMyTeamEmployees } = getEmployeeForReassign
    try {
        const weekLabel = getWeekLabel()
        const result = await SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            ScheduleQuery.retrieveRNSAssignList.f,
            formatString(ScheduleQuery.retrieveRNSAssignList.q, [
                visitListId,
                userLocationId,
                isOnlyMyTeamEmployees
                    ? 'AND {User_Stats__c:Merchandising_Base__c} IS TRUE'
                    : 'AND {User:Merchandising_Base_Minimum_Requirement__c} IS TRUE'
            ])
        )
        const items = {}
        result.forEach((visit: any) => {
            const weekName =
                weekLabel[Math.abs(moment(visit.WStart_Date__c).diff(moment(visit.DVisit_Date__c), MOMENT_STARTOF.DAY))]
            const tmpTotalMinus = getTotalMinus(visit.Planned_Duration_Minutes__c, visit.Planned_Travel_Time__c)
            const visitObj = {
                id: visit.Id,
                date: visit.Planned_Date__c,
                ownerId: visit.OwnerId,
                visitor: visit.VisitorId,
                status: visit.Status__c,
                // sequence: visit.Pull_Number__c,
                sequence: visit.Sequence__c,
                store: {
                    id: visit.StoreId,
                    name: visit.StoreName,
                    address: `${visit?.Street || ''}`,
                    cityStateZip: computeVisitAddress(visit),
                    phone: visit.AccountPhone,
                    latitude: visit.Latitude,
                    longitude: visit.Longitude
                },
                totalDuration: tmpTotalMinus
            }

            if (!items[visit.UserId]) {
                // user does not exist
                items[visit.UserId] = {
                    id: visit.UserId,
                    name: visit.Username,
                    userStatsId: visit.UserStatsId,
                    totalVisit: 1,
                    visitor: visit.UserId,
                    firstName: visit.FirstName,
                    lastName: visit.LastName,
                    gpid: visit.GPID,
                    totalDuration: Number(visit?.Planned_Duration_Minutes__c) || 0,
                    totalHours: tmpTotalMinus,
                    weeklyVisitList: {
                        id: visit.WVisitListId || '',
                        startDate: visit.WStart_Date__c || '',
                        endDate: visit.WEnd_Date__c || ''
                    },
                    dailyVisitList: {
                        [visit.DVisitListId]: {
                            id: visit.DVisitListId,
                            date: visit.DVisit_Date__c,
                            updated: false,
                            weeklyVisitId: visit.DVisit_List_Group__c,
                            totalDuration: tmpTotalMinus
                        }
                    },
                    visits: {
                        [weekName]: [visitObj]
                    },
                    workingStatus: getWorkingStatus(visit),
                    title: visit?.Title,
                    ftFlag: visit?.FT_EMPLYE_FLG_VAL__c?.toLocaleLowerCase()
                }
            } else {
                // user exist
                items[visit.UserId].totalVisit++
                items[visit.UserId].totalDuration += tmpTotalMinus
                items[visit.UserId].totalHours += tmpTotalMinus
                // Add Daily List
                if (!items[visit.UserId].dailyVisitList[visit.DVisitListId]) {
                    items[visit.UserId].dailyVisitList[visit.DVisitListId] = {
                        id: visit.DVisitListId,
                        date: visit.DVisit_Date__c,
                        updated: false,
                        weeklyVisitId: visit.DVisit_List_Group__c,
                        totalDuration: items[visit.UserId].totalDuration
                    }
                }
                // Push Visit to the List
                if (items[visit.UserId].visits[weekName]) {
                    items[visit.UserId].visits[weekName].push(visitObj)
                } else {
                    items[visit.UserId].visits[weekName] = [visitObj]
                }
            }
        })
        return Object.values(items) || null
    } catch (err) {
        dropDownRef.current.alertWithType('ManagerAction', 'getEmployeeListForReassign - Failed to query', err)
    }
}

export const getWorkingStatusConfig = () => {
    return [
        { attend: false, label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_SUNDAY, name: 'SUNDAY' },
        { attend: false, label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_MONDAY, name: 'MONDAY' },
        { attend: false, label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_TUESDAY, name: 'TUESDAY' },
        { attend: false, label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_WEDNESDAY, name: 'WEDNESDAY' },
        { attend: false, label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_THURSDAY, name: 'THURSDAY' },
        { attend: false, label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_FRIDAY, name: 'FRIDAY' },
        { attend: false, label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_SATURDAY, name: 'SATURDAY' }
    ]
}

/**
 * @description Handle order and delivery day status
 * @returns array workingStatus
 */
export const handleDayStatus = (dayString: string = '') => {
    const originData = JSON.parse(JSON.stringify(getWorkingStatusConfig()))
    if (dayString) {
        dayString = dayString.toLocaleUpperCase()
        const dayArray = dayString.split(';')
        originData.forEach((item) => {
            if (dayArray.includes(item.name)) {
                item.attend = true
            }
        })
    }
    return originData
}

export const compressBase64Image = (data, maxLength) => {
    return new Promise((resolve) => {
        const CompressImageManager = NativeModules.CompressImageManager
        CompressImageManager.compressImageWithData(data, maxLength, (res: any) => {
            resolve(res)
        })
    })
}

/**
 * @description Close all other open swipeable rows
 * @returns
 */
let prevOpenedRow
export const closeOtherRows = (index, swipeableRows) => {
    if (prevOpenedRow && prevOpenedRow !== swipeableRows[index]) {
        prevOpenedRow.close && prevOpenedRow.close()
    }
    prevOpenedRow = swipeableRows[index]
}

/**
 * @description Close all open swipeable row
 * @returns
 */
export const closeAllOpenRow = (swipeableRows) => {
    Object.values(swipeableRows).forEach((row: any) => {
        if (row) {
            row.close && row.close()
        }
    })
}

/**
 * @description remove EE from my team
 * @returns resolve success
 */
const removeEmployee = async (userId, netInfo, dropDownRef, setIsLoading) => {
    setIsLoading(true)
    await syncDownDataByTableNames(MerchManagerScreenMapping.MyTeam)
    return new Promise((resolve, reject) => {
        const updatedUserStats = []
        SoupService.retrieveDataFromSoup(
            'User_Stats__c',
            {},
            getObjByName('User_Stats__c').syncUpCreateFields,
            getObjByName('User_Stats__c').syncUpCreateQuery + ` WHERE {User_Stats__c:User__c} = '${userId}'`
        )
            .then(async (res: any) => {
                if (res?.length > 0) {
                    res[0].Merchandising_Base__c = false
                    updatedUserStats.push(res[0])
                }
                if (updatedUserStats.length > 0) {
                    await SoupService.upsertDataIntoSoup('User_Stats__c', updatedUserStats, true, false)
                        .then(async () => {
                            if (netInfo.isInternetReachable) {
                                await syncUpObjUpdate(
                                    'User_Stats__c',
                                    getObjByName('User_Stats__c').syncUpCreateFields,
                                    getObjByName('User_Stats__c').syncUpCreateQuery +
                                        " WHERE {User_Stats__c:__locally_updated__} = '1'"
                                )
                                    .then(async () => {
                                        setIsLoading(false)
                                        resolve('success')
                                    })
                                    .catch((err) => {
                                        setIsLoading(false)
                                        dropDownRef.current.alertWithType(
                                            DropDownType.ERROR,
                                            'Remove Employee - Sync Up User Stats',
                                            err
                                        )
                                    })
                            } else {
                                setIsLoading(false)
                                dropDownRef.current.alertWithType(
                                    DropDownType.ERROR,
                                    'Remove Employee - Sync Up',
                                    'Internet not reachable'
                                )
                            }
                        })
                        .catch((err) => {
                            setIsLoading(false)
                            dropDownRef.current.alertWithType(
                                DropDownType.ERROR,
                                'Remove Employee - Insert User Stats',
                                err
                            )
                        })
                }
            })
            .catch((err) => {
                setIsLoading(false)
                dropDownRef.current.alertWithType(DropDownType.ERROR, 'Remove Employee - Query User Stats', err)
                reject(err)
            })
    })
}

/**
 * @description Handle remove EE button click
 * @returns resolve success
 */
export const onRemoveBtnClick = async (
    params,
    netInfo,
    dropDownRef,
    setUserName,
    goToVisitTab,
    setIsLoading,
    swipeableRows
) => {
    return new Promise((resolve) => {
        if (setUserName) {
            setUserName(params.name)
        }
        if (params.deletableDirectly) {
            Alert.alert(
                t.labels.PBNA_MOBILE_REMOVE_TEAM_MEMBER + '?',
                t.labels.PBNA_MOBILE_REMOVE_EMPLOYEE_TIP.replace(/\\/g, ''),
                [
                    { text: t.labels.PBNA_MOBILE_CANCEL, onPress: () => setUserName && closeAllOpenRow(swipeableRows) },
                    {
                        text: _.capitalize(t.labels.PBNA_MOBILE_REMOVE),
                        onPress: () =>
                            removeEmployee(params?.id, netInfo, dropDownRef, setIsLoading).then(() => {
                                resolve('success')
                            })
                    }
                ]
            )
        } else {
            Alert.alert(
                t.labels.PBNA_MOBILE_REASSIGN_VISITS.split(' ')
                    .map((w) => _.capitalize(w))
                    .join(' '),
                t.labels.PBNA_MOBILE_EMPLOYEE_HAS_RECURRING_VISIT_TIP,
                [
                    { text: t.labels.PBNA_MOBILE_CANCEL, onPress: () => setUserName && closeAllOpenRow(swipeableRows) },
                    {
                        text: t.labels.PBNA_MOBILE_ACTION_VISITS,
                        onPress: () => {
                            setUserName && closeAllOpenRow(swipeableRows)
                            goToVisitTab(params)
                        }
                    }
                ]
            )
        }
    })
}

const SOFT_DELETE_SD_MESSAGE = [
    'Soft Delete Service Detail - Delete Local Service Detail',
    'Soft Delete Service Detail - Delete Remote Service Detail'
]
const SOFT_DELETE_CTR_MESSAGE = [
    'Soft Delete Customer To Route - Delete local CTR',
    'Soft Delete Customer To Route - Delete remote CTR'
]
const softDeleteRecord = async (
    recordIds: Array<string>,
    tableName: string,
    dropDownRef: any,
    errorMsg: Array<string>
) => {
    const records = await SoupService.retrieveDataFromSoup(
        tableName,
        {},
        getObjByName(tableName).syncUpCreateFields,
        getObjByName(tableName).syncUpCreateQuery + ` WHERE {${tableName}:Id} IN (${getIdClause(recordIds)})`
    )
    records?.forEach((record) => {
        record.IsRemoved__c = true
        if (tableName === 'Service_Detail__c') {
            record.Route_Group__c = null
        }
    })
    await SoupService.upsertDataIntoSoup(tableName, records).catch((err) => {
        dropDownRef.current.alertWithType(DropDownType.ERROR, errorMsg[0], err)
    })
    await syncUpObjUpdate(
        tableName,
        getObjByName(tableName).syncUpCreateFields,
        getObjByName(tableName).syncUpCreateQuery + ` WHERE {${tableName}:Id} IN (${getIdClause(recordIds)})`
    ).catch((err) => {
        dropDownRef.current.alertWithType(DropDownType.ERROR, errorMsg[1], err)
    })
}

/**
 * @description remove CTR
 * @returns resolve success
 */
const removeCTR = (customerToRouteMap: any, dropDownRef) => {
    return new Promise((resolve, reject) => {
        const customerToRoute = Object.keys(customerToRouteMap)
        customerToRoute.forEach((customerToRouteId) => {
            const fields = { Customer_to_Route__c: customerToRouteId, IsRemoved__c: BooleanStr.STR_FALSE }
            const whereClauseArr = computeSmartClause('Service_Detail__c', fields)
            database()
                .use('Service_Detail__c')
                .select()
                .where(whereClauseArr)
                .getData()
                .then(async (res: Array<any>) => {
                    if (res.length === 0) {
                        await softDeleteRecord(
                            [customerToRouteMap[customerToRouteId][1]],
                            'Customer_to_Route__c',
                            dropDownRef,
                            SOFT_DELETE_CTR_MESSAGE
                        )
                        resolve('success')
                    }
                })
                .catch((err) => {
                    dropDownRef.current.alertWithType(
                        DropDownType.ERROR,
                        'Remove Customer To Route - Query local CTR',
                        err
                    )
                    reject(err)
                })
        })
    })
}

const CTR_SOUP_ID = 'Customer_to_Route._soupEntryId'
const CTR_ID = 'Customer_to_Route.Id'
/**
 * @description remove customer associated service details
 * @returns resolve success
 */
const removeCustomerAssociatedServiceDetail = async (customerData, setIsLoading, dropDownRef) => {
    const CTRRecordTypeId = await getRecordTypeIdByDeveloperName('CTR', 'Customer_to_Route__c')
    return new Promise((resolve, reject) => {
        const fields = {
            IsRemoved__c: BooleanStr.STR_FALSE,
            'Customer_to_Route__r.Customer__c': customerData.accountId,
            'Customer_to_Route__r.Merch_Flag__c': BooleanStr.STR_TRUE,
            'Customer_to_Route__r.RecordTypeId': CTRRecordTypeId
        }
        const whereClauseArr = computeSmartClause('Service_Detail__c', fields)
        database()
            .use('Service_Detail__c')
            .select()
            .join({
                table: 'Customer_to_Route__c',
                alias: 'Customer_to_Route',
                type: 'LEFT',
                options: {
                    targetTable: 'Service_Detail__c',
                    targetField: 'Customer_to_Route__c',
                    mainField: 'Id'
                }
            })
            .select(['_soupEntryId', 'Id'])
            .where(whereClauseArr)
            .getData()
            .then(async (res: any) => {
                const ids = []
                const customerToRouteMap = {}
                if (res.length > 0) {
                    res.forEach((item: any) => {
                        ids.push(item.Id)
                        customerToRouteMap[item.Customer_to_Route__c] = [item[CTR_SOUP_ID], item[CTR_ID]]
                    })
                    await softDeleteRecord(ids, 'Service_Detail__c', dropDownRef, SOFT_DELETE_SD_MESSAGE)
                    removeCTR(customerToRouteMap, dropDownRef)
                        .then(() => {
                            resolve('success')
                        })
                        .catch((err) => {
                            dropDownRef.current.alertWithType(DropDownType.ERROR, 'Remove CTR - Remove CTR', err)
                            setIsLoading(false)
                            reject(err)
                        })
                } else {
                    setIsLoading(false)
                    resolve('success')
                }
            })
            .catch((err) => {
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    'Remove Service Detail - Query Service Detail',
                    err
                )
                setIsLoading(false)
                reject(err)
            })
    })
}

export const updateCustomerSyncAndGoBack = async (updatedAccount, params) => {
    try {
        await SoupService.upsertDataIntoSoup('Account', updatedAccount, true, false)
            .then(async () => {
                await syncUpObjUpdate(
                    'Account',
                    getObjByName('Account').syncUpCreateFields,
                    getObjByName('Account').syncUpCreateQuery +
                        ` WHERE {Account:Id} = '${params.selectedCustomer.accountId}'`
                )
                    .then(async () => {
                        if (params.updateVal === BooleanStr.STR_FALSE) {
                            await removeCustomerAssociatedServiceDetail(
                                params.selectedCustomer,
                                params.setIsLoading,
                                params.dropDownRef
                            )
                        }
                        params.setIsLoading(false)
                        params.setResultModalVisible(true)
                        if (!params?.setCustomerName) {
                            const timeoutId = setTimeout(() => {
                                clearTimeout(timeoutId)
                                params.navigation.goBack()
                            }, DEFAULT_DELAY_TIME)
                        }
                    })
                    .catch((err) => {
                        params.dropDownRef.current.alertWithType(
                            DropDownType.ERROR,
                            'Update remote account',
                            JSON.stringify(err)
                        )
                    })
            })
            .catch((err) => {
                params.dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    'Update local account',
                    JSON.stringify(err)
                )
            })
    } catch (error) {
        params.setIsLoading(false)
        storeClassLog(
            Log.MOBILE_ERROR,
            'MerchManagerUtils.updateCustomerSyncAndGoBack',
            `updateCustomerSyncAndGoBack: ${getStringValue(error)}`
        )
    }
}

/**
 * @description Handle add Customer or remove customer from my customers
 * @params updateVal = '1' add Customer, updateVal = '0' remove customer
 * @returns resolve success
 */
export const updateCustomer = async (params) => {
    if (_.isEmpty(params.selectedCustomer)) {
        return
    }
    params.setIsLoading(true)
    try {
        await syncDownDataByTableNames(MerchManagerScreenMapping.MyCustomer)
        if (params.selectedCustomer.id) {
            const updatedRetailStore = []
            const updatedAccount = []
            const res = await SoupService.retrieveDataFromSoup(
                'RetailStore',
                {},
                getObjByName('RetailStore').syncUpCreateFields,
                getObjByName('RetailStore').syncUpCreateQuery +
                    ` WHERE {RetailStore:Id} = '${params.selectedCustomer.id}'`
            )
            if (res?.length > 0) {
                res[0]['Account.Merchandising_Base__c'] = params.updateVal
                updatedRetailStore.push(rebuildObjectDepth(res[0]))
            }
            if (updatedRetailStore.length > 0) {
                await SoupService.upsertDataIntoSoup('RetailStore', updatedRetailStore, true, false).then(async () => {
                    await SoupService.retrieveDataFromSoup(
                        'RetailStore',
                        {},
                        getObjByName('RetailStore').syncUpCreateFields,
                        getObjByName('RetailStore').syncUpCreateQuery +
                            ` WHERE {RetailStore:Id} = '${params.selectedCustomer.id}'`
                    ).then(async () => {
                        const aRes = await SoupService.retrieveDataFromSoup(
                            'Account',
                            {},
                            getObjByName('Account').syncUpCreateFields,
                            getObjByName('Account').syncUpCreateQuery +
                                ` WHERE {Account:Id} = '${params.selectedCustomer.accountId}'`
                        )
                        if (aRes?.length > 0) {
                            aRes[0].Merchandising_Base__c = params.updateVal
                            aRes[0].Go_Kart_Flag__c = false
                            updatedAccount.push(aRes[0])
                        }
                        if (updatedAccount.length > 0) {
                            await updateCustomerSyncAndGoBack(updatedAccount, params)
                        }
                    })
                })
            }
            params.setIsLoading(false)
        }
    } catch (error) {
        params.setIsLoading(false)
        storeClassLog(Log.MOBILE_ERROR, 'MerchManagerUtils.updateCustomer', `updateCustomer: ${getStringValue(error)}`)
    }
}

/**
 * @description Handle remove customer button click
 * @returns resolve success
 */
export const onRemoveCustomerBtnClick = (params) => {
    return new Promise((resolve) => {
        if (params?.setCustomerName) {
            params.setCustomerName(params?.selectedCustomer?.name)
        }
        Alert.alert(
            t.labels.PBNA_MOBILE_REMOVE_CUSTOMER.split(' ')
                .map((w) => _.capitalize(w))
                .join(' ') + '?',
            t.labels.PBNA_MOBILE_REMOVE_CUSTOMER_TIP,
            [
                {
                    text: t.labels.PBNA_MOBILE_CANCEL,
                    onPress: () => params.swipeableRows && closeAllOpenRow(params.swipeableRows)
                },
                {
                    text: _.capitalize(t.labels.PBNA_MOBILE_REMOVE),
                    onPress: () =>
                        updateCustomer(params).then(() => {
                            resolve('success')
                        })
                }
            ]
        )
    })
}

export const getUpdateObj = async (params: any) => {
    const { initSD, ctr, weekDayNum, accountId, orderDays } = params
    const data = {}
    try {
        const weekLabels = weekDayNum
            .filter((item) => item.numOfVisit !== 0)
            .map((day) => {
                return day.dayOfWeek
            })
        const sds = await SoupService.retrieveDataFromSoup('Service_Detail__c', {}, [], null, [
            ` WHERE {Service_Detail__c:Customer_to_Route__r.Customer__c}='${accountId}'
              AND {Service_Detail__c:Day_of_the_Week__c} IN (${getIdClause(weekLabels)})
              AND {Service_Detail__c:IsRemoved__c} IS FALSE
              AND {Service_Detail__c:Customer_to_Route__r.Merch_Flag__c} IS TRUE
            `
        ])
        sds.forEach((dd) => {
            if (!data[dd.Day_of_the_Week__c]) {
                data[dd.Day_of_the_Week__c] = [dd]
            } else {
                data[dd.Day_of_the_Week__c].push(dd)
            }
        })
    } catch (error) {
        return Promise.reject(error)
    }
    return new Promise((resolve, reject) => {
        const updateObj = []
        weekDayNum
            .filter((item) => item.numOfVisit !== 0)
            .forEach((weekDay) => {
                let pullNum = 1
                const dayKey = weekDay.dayKey
                if (!_.isEmpty(data[weekDay.dayOfWeek])) {
                    const allPullNum = Object.values(data[weekDay.dayOfWeek])
                        .filter((item: any) => !isNaN(item.Pull_Number__c))
                        .map((item: any) => {
                            return item.Pull_Number__c
                        })
                    const maxPullNum = Math.max(...allPullNum) || 0
                    pullNum = maxPullNum + 1
                }
                for (let i = 0; i < weekDay.numOfVisit; i++) {
                    const SDObj = {
                        ...initSD,
                        Customer_to_Route__c: ctr[0]?.Id,
                        Day_of_the_Week__c: weekDay.dayOfWeek,
                        Pull_Number__c: pullNum,
                        Take_Order_Flag__c: pullNum === 1 && _.isEmpty(data[weekDay.dayOfWeek]) && orderDays[dayKey]
                    }
                    updateObj.push(SDObj)
                    pullNum++
                }
            })
        syncUpObjCreateFromMem('Service_Detail__c', updateObj)
            .then(() => {
                resolve('success')
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const addServiceDetail = async (params: any) => {
    const { subType, employeeId, weekDayNum, accountId, dropDownRef, setIsLoading, orderDays, isUnassign } = params
    const CTRRecordTypeId = await getRecordTypeIdByDeveloperName('CTR', 'Customer_to_Route__c')
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'Route_Sales_Geo__c',
            {},
            ['Id'],
            `
            SELECT
            {Route_Sales_Geo__c:Id},
            {Route_Sales_Geo__c:_soupEntryId},
            {Route_Sales_Geo__c:__local__},
            {Route_Sales_Geo__c:__locally_created__},
            {Route_Sales_Geo__c:__locally_updated__},
            {Route_Sales_Geo__c:__locally_deleted__}
            FROM {Route_Sales_Geo__c}
            WHERE {Route_Sales_Geo__c:OwnerId}='${employeeId}'
            AND {Route_Sales_Geo__c:Merch_Flag__c} IS TRUE
            `
        )
            .then(async (routeRes) => {
                if (_.isEmpty(routeRes)) {
                    if (isUnassign) {
                        const res = await handleRouteSalesGeo({
                            dropDownRef,
                            selectedUser: { id: employeeId },
                            setIsLoading
                        })
                        if (Array.isArray(res) && !_.isEmpty(res)) {
                            routeRes = res[0]?.data
                        }
                    } else {
                        reject('Route Id is null')
                    }
                }
                const initCTR = {
                    OwnerId: employeeId,
                    Route__c: routeRes[0].Id,
                    Merch_Flag__c: true,
                    Customer__c: accountId,
                    ACTV_FLG__c: true,
                    RecordTypeId: CTRRecordTypeId,
                    IsRemoved__c: false
                }
                const initSD = {
                    Day_of_the_Week__c: null,
                    Pull_Number__c: null,
                    Take_Order_Flag__c: false,
                    Visit_Subtype__c: subType,
                    OwnerId: employeeId,
                    Customer_to_Route__c: null,
                    Unassigned__c: isUnassign
                }
                SoupService.retrieveDataFromSoup(
                    'Customer_to_Route__c',
                    {},
                    ['Id'],
                    `SELECT
                {Customer_to_Route__c:Id},
                {Customer_to_Route__c:_soupEntryId},
                {Customer_to_Route__c:__local__},
                {Customer_to_Route__c:__locally_created__},
                {Customer_to_Route__c:__locally_updated__},
                {Customer_to_Route__c:__locally_deleted__}
                FROM {Customer_to_Route__c}
                WHERE {Customer_to_Route__c:Customer__c}='${accountId}'
                AND {Customer_to_Route__c:OwnerId}='${employeeId}'
                AND {Customer_to_Route__c:RecordTypeId}='${CTRRecordTypeId}'
                AND {Customer_to_Route__c:Merch_Flag__c} IS TRUE
                AND {Customer_to_Route__c:IsRemoved__c} IS FALSE
                `
                ).then((res) => {
                    let ctrObj = null
                    if (_.isEmpty(res)) {
                        ctrObj = {
                            ...initCTR
                        }
                        syncUpObjCreateFromMem('Customer_to_Route__c', [ctrObj])
                            .then((re) => {
                                return getUpdateObj({
                                    initSD,
                                    ctr: re[0]?.data,
                                    weekDayNum,
                                    accountId,
                                    orderDays
                                })
                            })
                            .then((success) => {
                                resolve(success)
                            })
                            .catch((err) => {
                                reject(err)
                            })
                    } else {
                        return getUpdateObj({
                            initSD,
                            ctr: res,
                            weekDayNum,
                            accountId,
                            orderDays
                        }).then((success) => {
                            resolve(success)
                        })
                    }
                })
            })
            .catch((err) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'MerchManagerUtils.addServiceDetail',
                    `MMUtils - addServiceDetail: ${getStringValue(err)}`
                )
                reject(err)
            })
    })
}

const getUsersFromLocal = (notifications) => {
    return new Promise<any>((resolve, reject) => {
        let ids = ''
        notifications.forEach((element, index) => {
            const messageBody = decode(element.messageBody)
            let jsonBody
            try {
                jsonBody = JSON.parse(messageBody)
            } catch {
                jsonBody = {}
            }
            const userId = jsonBody.UserId || null
            ids += `'${userId}'` + (index !== notifications.length - 1 ? ',' : '')
        })
        SoupService.retrieveDataFromSoup(
            'User',
            {},
            ['UserId', 'Name', 'FirstName', 'LastName', 'UserStatsId'],
            ` SELECT {User:Id},
        {User:Name},
        {User:FirstName},
        {User:LastName},
        {User_Stats__c:Id}
        FROM {User} 
        LEFT JOIN {User_Stats__c} ON {User_Stats__c:User__c} = {User:Id}
        WHERE {User:Id} IN (${ids})
        `
        )
            .then((totalData: any[]) => {
                resolve(totalData)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

const getAssembleData = async (notifications) => {
    const userArr = await getUsersFromLocal(notifications)
    return notifications
        .map((item) => {
            let userId = null
            let jsonBody = null
            let lastTime = null
            let messageTitle = item.messageTitle || ''
            try {
                const messageBody = decode(item.messageBody)
                jsonBody = JSON.parse(messageBody.indexOf('{') > -1 ? messageBody : '{' + messageBody + '}')
                userId = jsonBody?.UserId || null
                const gmtTime = jsonBody?.LastTime || null
                lastTime = gmtTime.replace(' ', 'T') + '.000Z'
                messageTitle = decode(item.messageTitle)
            } catch (error) {}
            const targetUserArr = userArr.filter((userItem) => userItem.UserId === userId)
            const targetUser = targetUserArr.length > 0 ? targetUserArr[0] : {}
            item.userStatsId = targetUser.UserStatsId
            item.FirstName = targetUser.FirstName
            item.LastName = targetUser.LastName
            item.LastTime = lastTime
            item.UserId = userId
            item.mmId = CommonParam.userId
            item.messageTitle = messageTitle
            return item
        })
        .filter(
            (item) => item.FirstName || item.LastName || item.UserStatsId || item.messageBody.indexOf('REJECTEDPG') > -1
        )
}

const getTranslatedInfo = (item) => {
    const messageBody = decode(item.messageBody)

    let jsonBody
    try {
        jsonBody = JSON.parse(messageBody.indexOf('{') > -1 ? messageBody : '{' + messageBody + '}')
    } catch {
        jsonBody = {}
    }
    item.jsonBody = jsonBody

    const cType = jsonBody.CType
    switch (cType) {
        case 'SUPDATE':
            item.translatedTitle = t.labels.PBNA_MOBILE_SCHEDULING_UPDATES_T
            item.translatedBody = `${jsonBody.UserName} ${t.labels.PBNA_MOBILE_SCHEDULING_UPDATES_M_1} ${jsonBody.RetailStoreName} ${t.labels.PBNA_MOBILE_SCHEDULING_UPDATES_M_2}`
            break
        case 'CHECKIN':
            item.translatedTitle = t.labels.PBNA_MOBILE_CHECK_IN_UPDATES_T
            item.translatedBody = `${jsonBody.UserName} ${t.labels.PBNA_MOBILE_CHECK_IN_UPDATES_M}`
            break
        case 'CHECKOUT':
            item.translatedTitle = t.labels.PBNA_MOBILE_CHECK_OUT_UPDATES_T
            item.translatedBody = `${jsonBody.UserName} ${t.labels.PBNA_MOBILE_CHECK_OUT_UPDATES_M_1} ${jsonBody.TimeNum} ${t.labels.PBNA_MOBILE_CHECK_OUT_UPDATES_M_2}`
            break
        case 'INCOM':
            item.translatedTitle = t.labels.PBNA_MOBILE_VISIT_INCOMPLETE_T
            item.translatedBody = `${jsonBody.UserName} ${t.labels.PBNA_MOBILE_VISIT_INCOMPLETE_M_1} ${jsonBody.TimeNum} ${t.labels.PBNA_MOBILE_VISIT_INCOMPLETE_M_2}`
            break
        case 'NOSTART':
            item.translatedTitle = t.labels.PBNA_MOBILE_NO_START_DAY_T
            item.translatedBody = `${jsonBody.UserName} ${t.labels.PBNA_MOBILE_NO_START_DAY_M}`
            break
        case 'OFFO':
            item.translatedTitle = t.labels.PBNA_MOBILE_OFF_SCHEDULE_T
            item.translatedBody = `${jsonBody.UserName} ${t.labels.PBNA_MOBILE_OFF_SCHEDULE_M}`
            break
        case 'LATESTART':
            item.translatedTitle = t.labels.PBNA_MOBILE_LATE_START_T
            item.translatedBody = `${jsonBody.UserName} ${t.labels.PBNA_MOBILE_LATE_START_M}`
            break
        case 'GDELAY':
            item.translatedTitle = t.labels.PBNA_MOBILE_GATE_DELAY_T
            item.translatedBody = `${jsonBody.UserName} ${t.labels.PBNA_MOBILE_GATE_DELAY_M}`
            break
        case 'TDELAY':
            item.translatedTitle = t.labels.PBNA_MOBILE_STEM_TIME_DELAY_T
            item.translatedBody = `${jsonBody.UserName} ${t.labels.PBNA_MOBILE_STEM_TIME_DELAY_M}`
            break
        case 'OVERH':
            item.translatedTitle = t.labels.PBNA_MOBILE_OVER_HOURS_T
            item.translatedBody = `${jsonBody.UserName} ${t.labels.PBNA_MOBILE_OVER_HOURS_M}`
            break
        case 'RESETS':
            item.translatedTitle = t.labels.PBNA_MOBILE_RESETS_VISIT
            item.translatedBody = `${t.labels.PBNA_MOBILE_RESET_MESSAGE} ${jsonBody.RetailStoreName}`
            break
        case FormNotificationType.FORM_KPI:
            item.translatedTitle = t.labels.PBNA_MOBILE_FORM_KPI
            item.translatedBody = `${t.labels.PBNA_MOBILE_FORM_KPI_MESSAGE_PREFIX} ${
                jsonBody.RetailStoreName
            } ${getAuditVisitTypeLabel(jsonBody.VisitSubType)} ${t.labels.PBNA_MOBILE_FORM_KPI_MESSAGE_SUFFIX}`
            break
        case FormNotificationType.NOT_LOAD:
            item.translatedTitle = t.labels.PBNA_MOBILE_FORM_KPI
            item.translatedBody = `${t.labels.PBNA_MOBILE_FORM_KPI_MESSAGE_PREFIX} ${
                jsonBody.RetailStoreName
            } ${getAuditVisitTypeLabel(jsonBody.VisitSubType)} ${t.labels.PBNA_MOBILE_FORM_NOT_LOAD}`
            break
        case RealogramNotificationType.REALOGRAM:
            item.translatedTitle = t.labels.PBNA_MOBILE_REALOGRAM
            item.translatedBody = `${t.labels.PBNA_MOBILE_REALOGRAM_MESSAGE_PREFIX} ${jsonBody.RetailStoreName} ${t.labels.PBNA_MOBILE_FORM_KPI_MESSAGE_SUFFIX}`
            break
        case RealogramNotificationType.IRNotLoad:
            item.translatedTitle = t.labels.PBNA_MOBILE_REALOGRAM
            item.translatedBody = `${t.labels.PBNA_MOBILE_REALOGRAM_MESSAGE_PREFIX} ${jsonBody.RetailStoreName} ${t.labels.PBNA_MOBILE_REALOGRAM_RESULTS_FAILED_SUFFIX}`
            break
        case 'REJECTEDPG':
            {
                const errMsg = jsonBody.ErrMsg !== 'null' ? `${jsonBody.ErrMsg}. ` : ''
                item.translatedTitle = t.labels.PBNA_REJECTED_PRICE_GROUP_TITLE
                item.translatedBody = `${jsonBody.TarName} ${t.labels.PBNA_LEAD_REJECTEDPG_DETAIL1} ${jsonBody.CustNum} ${t.labels.PBNA_LEAD_REJECTEDPG_DETAIL2}. ${errMsg}${t.labels.PBNA_LEAD_REJECTEDPG_DETAIL3}`
            }
            break
        default:
            item.translatedTitle = jsonBody.Content
            item.translatedBody = item.messageTitle
            break
    }

    return item
}

const getNotificationDataWithPromise = (resolve, reject) => {
    const urlStr = 'connect/notifications?size=50&before=' + modifyTime
    let unreadCount = 0
    restDataCommonCall(urlStr, 'GET')
        .then(async (res) => {
            const resBody = res.data || {}
            const notifications = resBody.notifications || []
            let couldCircle = notifications.length === 50
            if (notifications.length === 50) {
                const lastNotification = notifications[notifications.length - 1]
                const lastModefyDate = lastNotification.lastModified
                couldCircle = !moment(modifyTime).isSame(moment(lastModefyDate))
                modifyTime = lastModefyDate
            }
            const notificationResult = await getAssembleData(notifications)
            usedNotifications = [...usedNotifications, ...notificationResult]
            if (diffDay(modifyTime) < 8 && couldCircle) {
                getNotificationDataWithPromise(resolve, reject)
            } else {
                const uniqueData = _.uniqBy(usedNotifications, 'id')
                const finalData = uniqueData.filter((ele: any) => diffDay(ele.LastTime) < 7 && !ele.read)
                const redefineData = finalData.map((item: any) => {
                    if (item.seen === BooleanStr.STR_FALSE || item.seen === false) {
                        unreadCount = unreadCount + 1
                    }
                    item.key = item.id
                    item = getTranslatedInfo(item)

                    return item
                })
                resolve({
                    count: unreadCount,
                    dataSource: redefineData
                })
            }
        })
        .catch((err) => {
            reject(err)
        })
}

export const getNotificationsWithNet = () => {
    modifyTime = new Date().toISOString()
    usedNotifications = []
    return new Promise((resolve, reject) => {
        getNotificationDataWithPromise(resolve, reject)
    })
}

export const deleteVisitList = async (ids: Array<string>, dropDownRef) => {
    try {
        if (_.isEmpty(ids)) {
            return
        }
        const visits = await SoupService.retrieveDataFromSoup('Visit', {}, [], null, [
            `WHERE {Visit:Visit_List__c} IN (${getIdClause(ids)})`
        ])
        const events = await SoupService.retrieveDataFromSoup('Event', {}, [], null, [
            `WHERE {Event:Visit_List__c} IN (${getIdClause(ids)}) AND {Event:IsRemoved__c} IS FALSE`
        ])
        const daily = await SoupService.retrieveDataFromSoup('Visit_List__c', {}, [], null, [
            `WHERE {Visit_List__c:Id} IN (${getIdClause(ids)}) AND {Visit_List__c:IsRemoved__c} IS FALSE`
        ])
        const weekly = await SoupService.retrieveDataFromSoup('Visit_List__c', {}, [], null, [
            `WHERE {Visit_List__c:Id}='${daily[0].Visit_List_Group__c}' AND {Visit_List__c:IsRemoved__c} IS FALSE`
        ])
        const visitListSyncFiled = getObjByName('Visit_List__c').syncUpCreateFields
        const dailyMap = {}
        daily.forEach((day) => {
            dailyMap[day.Visit_Date__c] = day
        })

        const visitDates = _.uniq(
            visits.map((v) => {
                return v.Planned_Date__c
            })
        )
        const eventDates = _.uniq(
            events.map((e) => {
                return moment(e.StartDateTime).format(TIME_FORMAT.Y_MM_DD)
            })
        )
        const visitListDates = daily.map((vl) => {
            return vl.Visit_Date__c
        })

        const daysOfNoVisit = _.difference(visitListDates, visitDates)
        const daysOfNoMeeting = _.difference(visitListDates, eventDates)

        const needDeleteVisitListDates = _.intersectionWith(daysOfNoVisit, daysOfNoMeeting, _.isEqual)
        const needDeleteVisitLists = []
        needDeleteVisitListDates.forEach((date) => {
            dailyMap[date].IsRemoved__c = BooleanStr.STR_TRUE
            needDeleteVisitLists.push(dailyMap[date])
        })
        if (needDeleteVisitLists.length > 0) {
            await syncUpObjUpdateFromMem(
                'Visit_List__c',
                filterExistFields('Visit_List__c', [...needDeleteVisitLists], visitListSyncFiled)
            )
            const daysOfWeek = await SoupService.retrieveDataFromSoup('Visit_List__c', {}, [], null, [
                `WHERE {Visit_List__c:Visit_List_Group__c}='${daily[0].Visit_List_Group__c}' AND {Visit_List__c:IsRemoved__c} IS FALSE`
            ])
            if (daysOfWeek.length === 0) {
                weekly[0].IsRemoved__c = BooleanStr.STR_TRUE
                await syncUpObjUpdateFromMem(
                    'Visit_List__c',
                    filterExistFields('Visit_List__c', [...weekly], visitListSyncFiled)
                )
            }
        }
    } catch (error) {
        dropDownRef.current.alertWithType(DropDownType.ERROR, 'delete visit list: ', error)
    }
}

export const syncUpVisitListById = (Id: string) => {
    return new Promise((resolve, reject) => {
        syncUpObjUpdate(
            'Visit_List__c',
            getObjByName('Visit_List__c').syncUpCreateFields,
            getObjByName('Visit_List__c').syncUpCreateQuery +
                ` WHERE {Visit_List__c:Id} = '${Id}'
            `
        )
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
    })
}

export const allVisitOfWeek = (whereClause: string) => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup('Visit', {}, ['Ids'], 'SELECT COUNT({Visit:Id}) FROM {Visit}' + whereClause)
            .then((res) => {
                resolve(res[0].Ids)
            })
            .catch((e) => {
                reject(e)
            })
    })
}

export const reCalculateWeekly = (visitListGroup: string) => {
    return new Promise((resolve, reject) => {
        try {
            SoupService.retrieveDataFromSoup(
                'Visit_List__c',
                {},
                getObjByName('Visit_List__c').syncUpCreateFields,
                getObjByName('Visit_List__c').syncUpCreateQuery +
                    ` WHERE {Visit_List__c:Visit_List_Group__c} = '${visitListGroup}'
                `
            ).then(async (week) => {
                if (week.length === 0) {
                    resolve('No Visit List')
                }
                let whereClause = ''
                let visitCase = 0
                let durationTime = 0
                let meetingTime = 0
                week.forEach((vl, index) => {
                    visitCase += Number(vl.Total_Planned_Cases__c)
                    durationTime += Number(vl.Planned_Service_Time__c)
                    meetingTime += Number(vl.Planned_Meeting_Time__c)
                    whereClause +=
                        index === 0
                            ? ` WHERE {Visit:Visit_List__c} = '${vl.Id}'`
                            : ` OR {Visit:Visit_List__c} = '${vl.Id}'`
                })
                const num = await allVisitOfWeek(whereClause)
                SoupService.retrieveDataFromSoup(
                    'Visit_List__c',
                    {},
                    getObjByName('Visit_List__c').syncUpCreateFields,
                    getObjByName('Visit_List__c').syncUpCreateQuery +
                        ` WHERE {Visit_List__c:Id} = '${visitListGroup}'
                    `
                ).then(async (weeklyVL) => {
                    weeklyVL[0].Total_Planned_Cases__c = visitCase || 0
                    weeklyVL[0].Number_of_Planned_Visits__c = num || 0
                    weeklyVL[0].Planned_Service_Time__c = durationTime || 0
                    weeklyVL[0].Planned_Meeting_Time__c = meetingTime || 0
                    await syncUpObjUpdateFromMem(
                        'Visit_List__c',
                        filterExistFields('Visit_List__c', weeklyVL, [
                            'Id',
                            'Total_Planned_Cases__c',
                            'Number_of_Planned_Visits__c',
                            'Planned_Service_Time__c',
                            'Planned_Meeting_Time__c'
                        ])
                    )
                })
                resolve('Success')
            })
        } catch (e) {
            reject(e)
        }
    })
}

export const reSequenceDaily = (VisitListId: string, num: number, visitCase: number, durationTime: number) => {
    return new Promise((resolve, reject) => {
        try {
            SoupService.retrieveDataFromSoup(
                'Visit_List__c',
                {},
                getObjByName('Visit_List__c').syncUpCreateFields,
                getObjByName('Visit_List__c').syncUpCreateQuery +
                    ` WHERE {Visit_List__c:Id} = '${VisitListId}'
                `
            )
                .then(async (vl) => {
                    if (vl.length === 0) {
                        resolve('No Visit List')
                    }
                    vl[0].Total_Planned_Cases__c = Number(visitCase) || 0
                    vl[0].Number_of_Planned_Visits__c = num || 0
                    vl[0].Planned_Service_Time__c = Number(durationTime) || 0
                    const visitListGroup = vl[0].Visit_List_Group__c
                    await syncUpObjUpdateFromMem(
                        'Visit_List__c',
                        filterExistFields('Visit_List__c', vl, [
                            'Id',
                            'Total_Planned_Cases__c',
                            'Number_of_Planned_Visits__c',
                            'Planned_Service_Time__c'
                        ])
                    )
                    await reCalculateWeekly(visitListGroup)
                    resolve('Success')
                })
                .catch((e) => {
                    reject(e)
                })
        } catch (e) {
            reject(e)
        }
    })
}

const ADD_NUMBER_ONE = 1
export const reSequenceByVisitListId = async (VisitListId: string) => {
    try {
        if (_.isEmpty(VisitListId)) {
            return
        }
        const visits = await SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            getObjByName('Visit').syncUpCreateFields,
            getObjByName('Visit').syncUpCreateQuery +
                `
            WHERE {Visit:Visit_List__c} = '${VisitListId}'
            ORDER BY {Visit:Sequence__c} NULLS LAST
            `
        )
        if (visits.length === 0) {
            await reSequenceDaily(VisitListId, 0, 0, 0)
            return Promise.resolve('Not need re-sequence.')
        }
        let visitCase = 0
        let durationTime = 0
        visits.forEach((visit, index) => {
            visit.Sequence__c = index + ADD_NUMBER_ONE
            visitCase += Number(visit.Scheduled_Case_Quantity__c)
            durationTime += Number(visit.Planned_Duration_Minutes__c)
        })
        await syncUpObjUpdateFromMem('Visit', filterExistFields('Visit', visits, ['Id', 'Sequence__c']))
        await reSequenceDaily(VisitListId, visits.length, visitCase, durationTime)
        return Promise.resolve('Success')
    } catch (e) {
        return Promise.reject(e)
    }
}

export const calculateWithPoints = (points: PointInterface[]) => {
    return new Promise((resolve, reject) => {
        if (points.length < 2) {
            resolve({
                totalDistance: 0,
                totalTravelTime: 0,
                detailList: [
                    {
                        distance: BooleanStr.STR_FALSE,
                        travelTime: BooleanStr.STR_FALSE
                    }
                ]
            })
        } else {
            MapManager.calculateWithPoints(points)
                .then((result) => {
                    if (_.isEmpty(result)) {
                        // reject('Calculate Nothing.')
                        resolve([])
                    } else {
                        resolve(result)
                    }
                })
                .catch((e) => {
                    reject(e)
                })
        }
    })
}

export const getLocationWithAddress = async (address) => {
    return new Promise((resolve, reject) => {
        MapManager.getLocationWithAddress(address)
            .then((res) => {
                resolve(res)
            })
            .catch((err) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'MerchManagerUtils.getLocationWithAddress',
                    `MM Utils - getLocationWithAddress: ${getStringValue(err)}`
                )
                reject({
                    latitude: null,
                    longitude: null
                })
            })
    })
}

export const computeHomeAddress = (address, user) => {
    const city = decryptWithString(user[0]?.CITY_NM__c) || user[0]?.CITY_NM__c
    const areaCode = decryptWithString(user[0]?.PSTL_AREA_VAL__c) || user[0]?.PSTL_AREA_VAL__c
    if (!_.isEmpty(city) && !_.isEmpty(areaCode)) {
        return `${address}, ${city} ${areaCode}`
    }
    return address
}

export const getUserAndFirstVisitLocation = async (OwnerId: string, points: PointInterface[]) => {
    try {
        const userStats = await SoupService.retrieveDataFromSoup(
            'User_Stats__c',
            {},
            ['Id', 'Start_Time__c', 'User__c', 'Starting_Location__c'],
            `SELECT {User_Stats__c:Id}, {User_Stats__c:Start_Time__c}, {User_Stats__c:User__c},
            {User_Stats__c:Starting_Location__c}
            FROM {User_Stats__c}
            WHERE {User_Stats__c:User__c}='${OwnerId}'
            `
        )
        const user = await SoupService.retrieveDataFromSoup(
            'User',
            {},
            ['Id', 'ADDR_LN_1_TXT__c', 'ADDR_LN_2_TXT__c', 'CITY_NM__c', 'PSTL_AREA_VAL__c'],
            `SELECT {User:Id}, {User:ADDR_LN_1_TXT__c}, {User:ADDR_LN_2_TXT__c}, {User:CITY_NM__c}, {User:PSTL_AREA_VAL__c}
            FROM {User}
            WHERE {User:Id}='${OwnerId}'
            `
        )
        const route = await SoupService.retrieveDataFromSoup(
            'Route_Sales_Geo__c',
            {},
            ['Id', 'ADDR_LN_1_TXT__c', 'CITY_NM__c', 'SLS_UNIT_NM__c', 'PSTL_AREA_VAL__c'],
            `SELECT {Route_Sales_Geo__c:Id}, {Route_Sales_Geo__c:ADDR_LN_1_TXT__c}, {Route_Sales_Geo__c:CITY_NM__c},
            {Route_Sales_Geo__c:SLS_UNIT_NM__c}, {Route_Sales_Geo__c:PSTL_AREA_VAL__c}
            FROM {Route_Sales_Geo__c}
            WHERE {Route_Sales_Geo__c:SLS_UNIT_ID__c}='${CommonParam.userLocationId}'
            AND {Route_Sales_Geo__c:SLS_UNIT_ACTV_FLG_VAL__c}='ACTIVE'
            `
        )
        if (_.isEmpty(userStats) || _.isEmpty(user) || _.isEmpty(route)) {
            return []
        }
        if (userStats[0]?.Starting_Location__c === '1st Stop') {
            const startPoint = points[0]
            points.unshift(startPoint)
        } else if (userStats[0]?.Starting_Location__c === 'Home') {
            if (user[0]?.ADDR_LN_1_TXT__c) {
                const address = decryptWithString(user[0]?.ADDR_LN_1_TXT__c) || user[0]?.ADDR_LN_1_TXT__c
                const fullAddress = computeHomeAddress(address, user)
                const point: PointInterface = await getLocationWithAddress(fullAddress)
                points.unshift(point)
            } else if (user[0]?.ADDR_LN_2_TXT__c) {
                const address = decryptWithString(user[0]?.ADDR_LN_2_TXT__c) || user[0]?.ADDR_LN_2_TXT__c
                const fullAddress = computeHomeAddress(address, user)
                const point: PointInterface = await getLocationWithAddress(fullAddress)
                points.unshift(point)
            } else {
                const startPoint = points[0]
                points.unshift(startPoint)
            }
        } else if (userStats[0]?.Starting_Location__c === 'Plant') {
            if (route[0]?.ADDR_LN_1_TXT__c) {
                const address = `${route[0]?.ADDR_LN_1_TXT__c}, ${route[0]?.SLS_UNIT_NM__c} ${route[0]?.PSTL_AREA_VAL__c}`
                const point: PointInterface = await getLocationWithAddress(address)
                points.unshift(point)
            } else {
                const startPoint = points[0]
                points.unshift(startPoint)
            }
        }
        return points
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'MerchManagerUtils.getUserAndFirstVisitLocation',
            `MM Utils - getUserAndFirstVisitLocation: ${getStringValue(error)}`
        )
        const startPoint = points[0]
        points.unshift(startPoint)
        return points
    }
}

export const getStoreLocation = async (VisitListId: string) => {
    try {
        const store = await SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            ['Id', 'OwnerId', 'Manager_Ad_Hoc__c', 'Store_Location__c', 'ShippingAddress'],
            `SELECT {Visit:Id}, {Visit:OwnerId}, {Visit:Manager_Ad_Hoc__c}, {RetailStore:Store_Location__c},{RetailStore:Account.ShippingAddress}
            FROM {Visit} JOIN {RetailStore} ON {Visit:PlaceId}={RetailStore:Id}
            WHERE {Visit:Visit_List__c}='${VisitListId}' AND {Visit:Status__c} != 'Removed' AND {Visit:Status__c} != 'Failed'
            AND {Visit:Sequence__c} NOT NULL
            ORDER BY {Visit:Sequence__c}
            `
        )
        if (store?.length === 0) {
            return []
        }
        const points: PointInterface[] = []
        for (const item of store) {
            const location = JSON.parse(item?.Store_Location__c)
            const shippingAddress = JSON.parse(item?.ShippingAddress)
            if (location && location.latitude && location.longitude) {
                const point = {
                    latitude: location.latitude,
                    longitude: location.longitude
                }
                points.push(point)
            } else if (shippingAddress && shippingAddress.latitude && shippingAddress.longitude) {
                const point = {
                    latitude: shippingAddress.latitude,
                    longitude: shippingAddress.longitude
                }
                points.push(point)
            } else {
                try {
                    const address = `${shippingAddress?.street}, ${shippingAddress?.state}, ${shippingAddress?.stateCode}`
                    const point: PointInterface = await getLocationWithAddress(address)
                    if (point.latitude && point.longitude) {
                        points.push(point)
                    }
                } catch (error) {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'MerchManagerUtils.getStoreLocation1',
                        `${t.labels.PBNA_MOBILE_GEOCODER_ERROR_FROM_OC}: ${getStringValue(error)}`
                    )
                }
            }
        }
        const userPoint = await getUserAndFirstVisitLocation(store[0]?.OwnerId, points)
        return userPoint
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'MerchManagerUtils.getStoreLocation2',
            `MM Utils - getStoreLocation: ${getStringValue(error)}`
        )
    }
}

export const getUserStartTime = async (id: string) => {
    try {
        const user = await SoupService.retrieveDataFromSoup(
            'User_Stats__c',
            {},
            ['Id', 'Start_Time__c'],
            `SELECT {User_Stats__c:Id}, {User_Stats__c:Start_Time__c}
            FROM {User_Stats__c}
            WHERE {User_Stats__c:User__c}='${id}'
            `
        )
        return user[0]?.Start_Time__c
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'MerchManagerUtils.getUserStartTime',
            `MM Utils - getUserStartTime: ${getStringValue(error)}`
        )
    }
}

export const getBufferTime = async () => {
    return SoupService.retrieveDataFromSoup(
        'Travel_Time_Buffer__mdt',
        {},
        ['Id', 'Time_In_Minutes__c'],
        'SELECT {Travel_Time_Buffer__mdt:Id}, {Travel_Time_Buffer__mdt:Time_In_Minutes__c} FROM {Travel_Time_Buffer__mdt}'
    )
}

export const calculateEndTime = (startTime: string, duration: string) => {
    const tempMin = Math.floor(parseFloat(duration))
    const tempSec = Math.floor((parseFloat(duration) % 1) * 100)
    const dateTime = moment(startTime).add(tempMin, 'minutes').add(tempSec, 'seconds')
    return moment(dateTime).tz(CommonParam.userTimeZone).toISOString()
}

export const calculateStartTime = (startTime: string, duration: string, travelTime: string) => {
    const tempDuration = Math.floor(parseFloat(duration))
    const tempTravel = Math.floor(parseFloat(travelTime))
    const totalTime = tempDuration + tempTravel
    const dateTime = moment(startTime).add(totalTime, 'minutes')
    return moment(dateTime).tz(CommonParam.userTimeZone).toISOString()
}

export const getFirstPublishedVisitIndex = (visitList) => {
    return visitList.findIndex((e) => e.Status__c !== VisitStatus.IN_PROGRESS && e.Status__c !== VisitStatus.COMPLETE)
}

export const syncUpCalculateVisit = async (VisitListId: string, calculateResult: CalculateResultInterface) => {
    const visit = await SoupService.retrieveDataFromSoup(
        'Visit',
        {},
        ScheduleQuery.updateVisitForDelete.f,
        ScheduleQuery.updateVisitForDelete.q +
            ` JOIN {RetailStore} ON
        {Visit:PlaceId}={RetailStore:Id}
        WHERE {Visit:Visit_List__c} = '${VisitListId}'
        AND {Visit:Sequence__c} NOT NULL
        ORDER BY {Visit:Sequence__c}
        `
    )
    if (visit.length === 0) {
        return
    }
    const startTime = await getUserStartTime(visit[0]?.VisitorId || visit[0]?.Route_Group__c)
    const plannedDate = visit[0]?.Planned_Date__c
    const buffer = await getBufferTime()
    const bufferTime = buffer[0]?.Time_In_Minutes__c
    const userStartTime = moment(`${plannedDate} ${startTime}`).tz(CommonParam.userTimeZone).toISOString()
    const firstPublishedVisitIndex = getFirstPublishedVisitIndex(visit)
    if (startTime) {
        for (let i = 0; i < visit.length; i++) {
            if (i === firstPublishedVisitIndex) {
                const ActualTravelTime = parseInt(calculateResult?.detailList[i]?.travelTime) + bufferTime
                if (firstPublishedVisitIndex === 0) {
                    visit[i].PlannedVisitStartTime = calculateEndTime(userStartTime, ActualTravelTime.toString())
                } else {
                    visit[i].PlannedVisitStartTime = calculateStartTime(
                        visit[i - 1].PlannedVisitStartTime,
                        visit[i - 1].Planned_Duration_Minutes__c,
                        ActualTravelTime.toString()
                    )
                }
                visit[i].PlannedVisitEndTime = null
            }
            visit[i].Planned_Travel_Time__c = calculateResult?.detailList[i]?.travelTime || 0
            visit[i].Planned_Mileage__c = calculateResult?.detailList[i]?.distance || 0
        }
    }
    const updateFields = [
        'Id',
        'PlannedVisitStartTime',
        'Planned_Duration_Minutes__c',
        'PlannedVisitEndTime',
        'Planned_Travel_Time__c',
        'Planned_Mileage__c'
    ]
    await syncUpObjUpdateFromMem('Visit', filterExistFields('Visit', visit, updateFields))
}

export const syncUpCalculateVisitList = async (VisitListId: string, calculateResult: CalculateResultInterface) => {
    const vl = await SoupService.retrieveDataFromSoup(
        'Visit_List__c',
        {},
        getObjByName('Visit_List__c').syncUpCreateFields,
        getObjByName('Visit_List__c').syncUpCreateQuery +
            ` WHERE {Visit_List__c:Id} = '${VisitListId}'
        `
    )
    if (vl.length === 0) {
        return null
    }
    vl[0].Planned_Travel_Time__c = calculateResult.totalTravelTime
    vl[0].Planned_Mileage__c = calculateResult.totalDistance
    await syncUpObjUpdateFromMem(
        'Visit_List__c',
        filterExistFields('Visit_List__c', vl, ['Id', 'Planned_Travel_Time__c', 'Planned_Mileage__c'])
    )
    return vl
}

export const syncUpCalculateWeeklyAndGetWeekTotalMileage = async (vl) => {
    const dailyRecordTypeId = await getRecordTypeIdByDeveloperName('Daily_Visit_List', 'Visit_List__c')
    const weeklyRecordTypeId = await getRecordTypeIdByDeveloperName('Visit_List_Group', 'Visit_List__c')
    const days = await SoupService.retrieveDataFromSoup(
        'Visit_List__c',
        {},
        getObjByName('Visit_List__c').syncUpCreateFields,
        getObjByName('Visit_List__c').syncUpCreateQuery +
            ` WHERE {Visit_List__c:Visit_List_Group__c} = '${vl[0]?.Visit_List_Group__c}'
          AND {Visit_List__c:RecordTypeId} = '${dailyRecordTypeId}'
        `
    )
    if (days?.length === 0) {
        return null
    }
    let weekTotalTime = 0
    let weekTotalMileage = 0
    days?.forEach((day) => {
        weekTotalTime += parseFloat(day.Planned_Travel_Time__c) || 0
        weekTotalMileage += parseFloat(day.Planned_Mileage__c) || 0
    })
    const week = await SoupService.retrieveDataFromSoup(
        'Visit_List__c',
        {},
        getObjByName('Visit_List__c').syncUpCreateFields,
        getObjByName('Visit_List__c').syncUpCreateQuery +
            ` WHERE {Visit_List__c:Id} = '${vl[0].Visit_List_Group__c}'
          AND {Visit_List__c:RecordTypeId} = '${weeklyRecordTypeId}'
        `
    )
    if (week.length === 0) {
        return
    }
    week[0].Planned_Travel_Time__c = weekTotalTime
    week[0].Planned_Mileage__c = weekTotalMileage
    await syncUpObjUpdateFromMem(
        'Visit_List__c',
        filterExistFields('Visit_List__c', week, ['Id', 'Planned_Travel_Time__c', 'Planned_Mileage__c'])
    )
    return weekTotalMileage
}

export const updateVisitTime = async (VisitListId: string) => {
    const visits = await SoupService.retrieveDataFromSoup(
        'Visit',
        {},
        ScheduleQuery.updateVisitForDelete.f,
        ScheduleQuery.updateVisitForDelete.q +
            ` WHERE {Visit:Visit_List__c} = '${VisitListId}'
            AND {Visit:Status__c} != 'Removed'
            AND {Visit:Status__c} != 'Failed'
            ORDER BY {Visit:Sequence__c}
            `
    )
    const buffer = await getBufferTime()
    if (_.isEmpty(visits || buffer)) {
        return
    }
    const firstPublishedVisitIndex = getFirstPublishedVisitIndex(visits)
    for (const index in visits) {
        if (parseInt(index) > firstPublishedVisitIndex) {
            const bufferTime = buffer[0]?.Time_In_Minutes__c
            const travelTime = visits[`${parseInt(index)}`].Planned_Travel_Time__c
            const ActualTravelTime = travelTime == null ? bufferTime : parseInt(travelTime) + bufferTime
            if (parseInt(index) > 0) {
                visits[index].PlannedVisitStartTime = calculateStartTime(
                    visits[`${parseInt(index) - 1}`].PlannedVisitStartTime,
                    visits[`${parseInt(index) - 1}`].Planned_Duration_Minutes__c,
                    ActualTravelTime.toString()
                )
            }
            visits[index].PlannedVisitEndTime = null
            if (parseInt(index) === visits.length - 1) {
                await syncUpObjUpdateFromMem(
                    'Visit',
                    filterExistFields('Visit', visits, ['Id', 'PlannedVisitStartTime', 'PlannedVisitEndTime'])
                )
            }
        }
    }
}

export const calculateDistanceAndTravelTime = async (VisitListId: string) => {
    try {
        if (_.isEmpty(VisitListId)) {
            return
        }
        const initRes = {
            totalTravelTime: 0,
            totalDistance: 0,
            weekTotalDistance: 0
        }
        const points: PointInterface[] = await getStoreLocation(VisitListId)
        if (_.isEmpty(points)) {
            const emptyVl = await syncUpCalculateVisitList(VisitListId, {
                totalDistance: 0,
                totalTravelTime: 0,
                detailList: [
                    {
                        distance: BooleanStr.STR_FALSE,
                        travelTime: BooleanStr.STR_FALSE
                    }
                ]
            })
            initRes.weekTotalDistance = await syncUpCalculateWeeklyAndGetWeekTotalMileage(emptyVl)
            return Promise.resolve(initRes)
        }
        const calculateResult: CalculateResultInterface = await calculateWithPoints(points)
        if (_.isEmpty(calculateResult)) {
            return Promise.resolve(initRes)
        }
        await syncUpCalculateVisit(VisitListId, calculateResult)
        const vl = await syncUpCalculateVisitList(VisitListId, calculateResult)
        const weekTotalMileage = await syncUpCalculateWeeklyAndGetWeekTotalMileage(vl)
        await updateVisitTime(VisitListId)
        return Promise.resolve({
            totalTravelTime: calculateResult?.totalTravelTime,
            totalDistance: calculateResult?.totalDistance,
            weekTotalDistance: weekTotalMileage
        })
    } catch (e) {
        storeClassLog(
            Log.MOBILE_ERROR,
            `MerchManagerUtils.calculateDistanceAndTravelTime-${VisitListId}`,
            `MM Utils - calculateDistanceAndTravelTime: ${getStringValue(e)}`
        )
        return Promise.reject(e)
    }
}

const PASS_TWO_WEEK_DAY = -14
const NEXT_FOUR_WEEK_DAY = 28
const SUNDAY_NUM = 0
const A_WEEK_COUNT = 7
const SIX_WEEK_LENGTH = 6
const A_WEEK_DAY_LENGTH = 6

/*
 * @description get all six sundays of the schedule
 * @returns arr ['7/4', '7/11',...]
 */
export const getScheduleTotalSundays = () => {
    setLoggedInUserTimezone()
    const start = moment().add(PASS_TWO_WEEK_DAY, 'd')
    const end = moment().add(NEXT_FOUR_WEEK_DAY, 'd')
    const sundays = []
    const sunday = start.clone().day(SUNDAY_NUM)
    if (sunday.isAfter(start, 'd')) {
        sundays.push(sunday.format('M/D'))
    }
    while (sunday.isBefore(end)) {
        sunday.add(A_WEEK_COUNT, 'days')
        sundays.push(sunday.format('M/D'))
        if (sundays.length === SIX_WEEK_LENGTH) {
            break
        }
    }
    return sundays
}

export interface CalendarWeekObj {
    weekLabel: string
    dateLabel: string
    fullYearDate: string
}
// get date for 1 week
export const getWeekLabelArrObj = (dayStr?: string) => {
    setLoggedInUserTimezone()
    const tempWeekArr = []
    const today = dayStr ? moment(dayStr) : moment()
    const thisSunday = today.clone().day(SUNDAY_NUM)
    let todayIndex = 0
    for (let index = 0; index <= A_WEEK_DAY_LENGTH; index++) {
        const wl = thisSunday.clone().add(index, MOMENT_STARTOF.DAY).format(TIME_FORMAT.DDD).toUpperCase()
        const dl = thisSunday.clone().add(index, MOMENT_STARTOF.DAY).format('M/DD')
        const fullYearDate = thisSunday.clone().add(index, MOMENT_STARTOF.DAY).format(TIME_FORMAT.Y_MM_DD)
        if (
            today
                .startOf(MOMENT_STARTOF.DAY)
                .isSame(thisSunday.clone().add(index, MOMENT_STARTOF.DAY).startOf(MOMENT_STARTOF.DAY)) &&
            _.isEmpty(dayStr)
        ) {
            tempWeekArr.push({ weekLabel: t.labels.PBNA_MOBILE_TODAY.toUpperCase(), dateLabel: dl, fullYearDate })
            todayIndex = index
        } else {
            tempWeekArr.push({ weekLabel: wl, dateLabel: dl, fullYearDate })
        }
    }
    return { tempWeekArr, todayIndex }
}

/*
 * @description a week arr by date
 * @returns arr [{weekLabel: 'TODAY', dateLabel: '7/16'}]
 */
export const getWeekArrByDate = (plannedDate) => {
    setLoggedInUserTimezone()
    const tempWeekArr = []
    const thisSunday = plannedDate.clone().day(0)
    for (let index = 0; index <= 6; index++) {
        const wl = thisSunday.clone().add(index, MOMENT_STARTOF.DAY).format(TIME_FORMAT.DDD).toUpperCase()
        const dl = thisSunday.clone().add(index, MOMENT_STARTOF.DAY).format('M/D')
        const il = thisSunday.clone().add(index, MOMENT_STARTOF.DAY).format('d')
        const fullYearDate = thisSunday.clone().add(index, MOMENT_STARTOF.DAY).format(TIME_FORMAT.Y_MM_DD)

        if (dl === formatWithTimeZone(moment(), 'M/D', true)) {
            tempWeekArr.push({
                weekLabel: t.labels.PBNA_MOBILE_TODAY.toUpperCase(),
                dateLabel: dl,
                dayIndex: il,
                fullYearDate
            })
        } else {
            tempWeekArr.push({ weekLabel: wl, dateLabel: dl, dayIndex: il, fullYearDate })
        }
    }
    return tempWeekArr
}

export const getOrderDayObj = (customerData) => {
    const orderDays = {}
    customerData?.orderDays.forEach((orderDay) => {
        if (CommonParam.locale === Locale.fr) {
            orderDays[DayNameToFrench[orderDay.name.toUpperCase().slice(0, 3)]] = orderDay.attend
        } else {
            orderDays[orderDay.name.slice(0, 3).toUpperCase()] = orderDay.attend
        }
    })
    return orderDays
}

export const handleTakeOrderSalesData = (res, lineCodeMap) => {
    const employeeLCs = res.map((visit) => visit['User.LC_ID__c'])
    const salesLineCode = lineCodeMap.get(LineCodeGroupType.MyTeamGroup)[UserType.UserType_Sales]
    const hasSalesLC = employeeLCs.some((lc) => salesLineCode.includes(lc))
    const firstSalesVisit = res.find((item) => salesLineCode.includes(item['User.LC_ID__c']))
    return { hasSalesLC, firstSalesVisit }
}

const getResetCustomerVisit = (params) => {
    const { res, orderDays, visitIdArray, dayKeyTemp, currentVisitMap, lineCodeMap } = params
    let tempOrderDays = orderDays
    const newSortList = {}
    const newVisitArray = []
    let whereClauseString = ''
    const { hasSalesLC, firstSalesVisit } = handleTakeOrderSalesData(res, lineCodeMap)
    res.forEach((visit, index) => {
        // ee detail view, query order day for every single SD
        if (_.isEmpty(tempOrderDays)) {
            tempOrderDays = getOrderDayObj({
                orderDays: handleDayStatus(visit['RetailStore.Account.Merchandising_Order_Days__c'])
            })
        }
        const indicator2P = visit['RetailStore.Account.Indicator_2P__c'] === BooleanStr.STR_TRUE
        if (!visitIdArray.includes(visit.Id)) {
            visit.Pull_Number__c = index + ADD_NUMBER_ONE
            newVisitArray.push(visit)
            if (currentVisitMap[visit.Id]) {
                currentVisitMap[visit.Id].pullNum = index + ADD_NUMBER_ONE
                // if no sales, set pull num one take order = true
                if (!hasSalesLC) {
                    const takeOrder = visit.Pull_Number__c === 1 && tempOrderDays[dayKeyTemp] && indicator2P
                    visit.Take_Order_Flag__c = takeOrder
                    currentVisitMap[visit.Id].takeOrder = takeOrder ? BooleanStr.STR_TRUE : BooleanStr.STR_FALSE
                } else {
                    // if exist sales, set the first sales's sd take order = true
                    const takeOrder = tempOrderDays[dayKeyTemp] && visit.Id === firstSalesVisit.Id && indicator2P
                    visit.Take_Order_Flag__c = takeOrder
                    currentVisitMap[visit.Id].takeOrder = takeOrder ? BooleanStr.STR_TRUE : BooleanStr.STR_FALSE
                }
                newSortList[index + 1] = currentVisitMap[visit.Id]
            }
            if (index === 0) {
                whereClauseString += " WHERE {Service_Detail__c:Id} = '" + visit.Id + "'"
            } else {
                whereClauseString += "OR {Service_Detail__c:Id} = '" + visit.Id + "'"
            }
        }
    })
    return { newVisitArray, newSortList, whereClauseString }
}

export const updateTakeOrderFlag = async (params) => {
    const { weekDayString, CTRRecordTypeId, accountId, dropDownRef, orderDays, lineCodeMap } = params
    return new Promise((resolve, reject) => {
        const fields = {
            IsRemoved__c: BooleanStr.STR_FALSE,
            'Customer_to_Route__r.Merch_Flag__c': BooleanStr.STR_TRUE,
            'Customer_to_Route__r.RecordTypeId': CTRRecordTypeId,
            Day_of_the_Week__c: weekDayString,
            'Customer_to_Route__r.Customer__c': accountId
        }
        const whereClauseArr = computeSmartClause('Service_Detail__c', fields)
        database()
            .use('Service_Detail__c')
            .select()
            .join({
                table: 'Customer_to_Route__c',
                alias: 'Customer_to_Route',
                type: 'LEFT',
                options: {
                    targetTable: 'Service_Detail__c',
                    targetField: 'Customer_to_Route__c',
                    mainField: 'Id'
                }
            })
            .select(['_soupEntryId', 'Id'])
            .join({
                table: 'RetailStore',
                alias: 'RetailStore',
                options: {
                    targetTable: 'Customer_to_Route__c',
                    targetField: 'Customer__c',
                    mainField: 'AccountId'
                }
            })
            .select(['Account.Merchandising_Order_Days__c', 'Account.Indicator_2P__c'])
            .join({
                table: 'User',
                alias: 'User',
                options: {
                    targetTable: 'Service_Detail__c',
                    targetField: 'OwnerId',
                    mainField: 'Id'
                }
            })
            .select(['Id', 'LC_ID__c'])
            .where(whereClauseArr)
            .orderBy([{ table: 'Service_Detail__c', field: 'Pull_Number__c' }])
            .getData()
            .then(async (res: any) => {
                try {
                    if (!_.isEmpty(res)) {
                        const dayKeyTemp = weekDayString.substr(0, 3).toUpperCase()
                        let tempOrderDays = orderDays
                        if (_.isEmpty(tempOrderDays)) {
                            tempOrderDays = getOrderDayObj({
                                orderDays: handleDayStatus(res[0]['RetailStore.Account.Merchandising_Order_Days__c'])
                            })
                        }
                        const { hasSalesLC, firstSalesVisit } = handleTakeOrderSalesData(res, lineCodeMap)
                        const SDIDs = []
                        res.forEach((visit) => {
                            const indicator2P = visit['RetailStore.Account.Indicator_2P__c'] === BooleanStr.STR_TRUE
                            // if no sales, set pull num one take order = true
                            if (!hasSalesLC) {
                                const takeOrder = visit.Pull_Number__c === 1 && tempOrderDays[dayKeyTemp] && indicator2P
                                visit.Take_Order_Flag__c = takeOrder
                            } else {
                                // if exist sales, set the first sales's sd take order = true
                                const takeOrder =
                                    tempOrderDays[dayKeyTemp] && visit.Id === firstSalesVisit.Id && indicator2P
                                visit.Take_Order_Flag__c = takeOrder
                            }
                            SDIDs.push(visit.Id)
                        })
                        const whereClauseString = `WHERE {Service_Detail__c:Id} IN (${getIdClause(SDIDs)})`
                        await SoupService.upsertDataIntoSoup('Service_Detail__c', res, true, false)
                        syncUpObjUpdate(
                            'Service_Detail__c',
                            getObjByName('Service_Detail__c').syncUpCreateFields,
                            getObjByName('Service_Detail__c').syncUpCreateQuery + whereClauseString
                        ).then(() => {
                            resolve(1)
                        })
                    }
                    resolve(1)
                } catch (err) {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'MerchManagerUtils.updateTakeOrderFlag',
                        `updateTakeOrderFlag - ${getStringValue(err)}`
                    )
                    dropDownRef.current.alertWithType(DropDownType.ERROR, 'ServiceDetail - updateTakeOrderFlag', err)
                    reject(err)
                }
            })
    })
}

export const resetCustomerWeekDayPullNum = async (params) => {
    const { visitIdArray, weekDayString, CTRRecordTypeId, accountId, data, dropDownRef, orderDays, lineCodeMap } =
        params
    return new Promise((resolve, reject) => {
        const fields = {
            IsRemoved__c: BooleanStr.STR_FALSE,
            'Customer_to_Route__r.Merch_Flag__c': BooleanStr.STR_TRUE,
            'Customer_to_Route__r.RecordTypeId': CTRRecordTypeId,
            Day_of_the_Week__c: weekDayString,
            'Customer_to_Route__r.Customer__c': accountId
        }
        const whereClauseArr = computeSmartClause('Service_Detail__c', fields)
        database()
            .use('Service_Detail__c')
            .select()
            .join({
                table: 'Customer_to_Route__c',
                alias: 'Customer_to_Route',
                type: 'LEFT',
                options: {
                    targetTable: 'Service_Detail__c',
                    targetField: 'Customer_to_Route__c',
                    mainField: 'Id'
                }
            })
            .select(['_soupEntryId', 'Id'])
            .join({
                table: 'RetailStore',
                alias: 'RetailStore',
                options: {
                    targetTable: 'Customer_to_Route__c',
                    targetField: 'Customer__c',
                    mainField: 'AccountId'
                }
            })
            .select(['Account.Merchandising_Order_Days__c', 'Account.Indicator_2P__c'])
            .join({
                table: 'User',
                alias: 'User',
                options: {
                    targetTable: 'Service_Detail__c',
                    targetField: 'OwnerId',
                    mainField: 'Id'
                }
            })
            .select(['Id', 'LC_ID__c'])
            .where(whereClauseArr)
            .orderBy([{ table: 'Service_Detail__c', field: 'Pull_Number__c' }])
            .getData()
            .then((res: any) => {
                const dayKeyTemp = weekDayString.substr(0, 3).toUpperCase()
                const currentVisitMap = {}
                if (res?.length > 0) {
                    // if from ee view, get current all left sds of the account
                    if (_.isEmpty(orderDays)) {
                        res.forEach((visit: any) => {
                            currentVisitMap[visit.Id] = visit
                        })
                    }
                    if (isObject(data[dayKeyTemp])) {
                        Object.values(data[dayKeyTemp]).forEach((visit: any) => {
                            currentVisitMap[visit.id] = visit
                        })
                    }
                    const newResetData = getResetCustomerVisit({
                        res,
                        orderDays,
                        visitIdArray,
                        dayKeyTemp,
                        currentVisitMap,
                        lineCodeMap
                    })
                    const newVisitArray = newResetData?.newVisitArray
                    const whereClauseString = newResetData?.whereClauseString
                    const newSortList = newResetData?.newSortList
                    if (newVisitArray.length > 0) {
                        data[dayKeyTemp] = newSortList
                        SoupService.upsertDataIntoSoup('Service_Detail__c', newVisitArray, true, false)
                        syncUpObjUpdate(
                            'Service_Detail__c',
                            getObjByName('Service_Detail__c').syncUpCreateFields,
                            getObjByName('Service_Detail__c').syncUpCreateQuery + whereClauseString
                        ).then(() => {
                            resolve(1)
                        })
                    }
                } else {
                    data[dayKeyTemp] = {}
                    resolve(1)
                }
            })
            .catch((err) => {
                dropDownRef.current.alertWithType(DropDownType.ERROR, 'ServiceDetail - getCustomerDetail', err)
                reject(0)
            })
    })
}

export const getUserData = async (dropDownRef) => {
    const CTRRecordTypeId = await getRecordTypeIdByDeveloperName('CTR', 'Customer_to_Route__c')
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'User',
            {},
            ScheduleQuery.retrieveEmployeeDetailReassignUserList.f,
            formatString(ScheduleQuery.retrieveEmployeeDetailReassignUserList.q, [
                CTRRecordTypeId,
                CommonParam.userLocationId
            ])
        )
            .then((result: any) => {
                const items = {}
                result.forEach((user: any) => {
                    if (!items[user.UserId]) {
                        items[user.UserId] = {
                            CTRRecordTypeId,
                            CTRId: user.CTRId,
                            userStatsId: user.UserStatsId,
                            customerId: user.CTRId,
                            customerIdMap: {},
                            firstName: user.FirstName,
                            ftFlag: user.FT_EMPLYE_FLG_VAL && user.FT_EMPLYE_FLG_VAL.toLocaleLowerCase(),
                            gpid: user.GPID,
                            id: user.UserId,
                            lastName: user.LastName,
                            location: user.LocationName,
                            name: user.Username,
                            noWorkingDay: user?.Sunday__c === null,
                            ownerId: user.CTROwnerId,
                            phone: user.MobilePhone,
                            photoUrl: user.SmallPhotoUrl,
                            routeId: user.RouteId,
                            startTime: user.Start_Time__c,
                            title: user.Title,
                            workingStatus: getWorkingStatus(user)
                        }
                        items[user.UserId].customerIdMap[user.CTRCustomerId] = user.CTRId
                    } else {
                        items[user.UserId].customerIdMap[user.CTRCustomerId] = user.CTRId
                    }
                })
                const users = Object.values(items)
                resolve(users)
            })
            .catch((err) => {
                dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_GET_REASSIGN_USER, err)
                reject([])
            })
    })
}

const computeCustomerList = (customer, accountId, weekName, visitObj) => {
    if (!customer[accountId]) {
        customer[accountId] = {
            accountId,
            visits: {
                [weekName]: [visitObj]
            }
        }
    } else {
        if (customer[accountId].visits[weekName]) {
            const existed = customer[accountId].visits[weekName].find((item) => item.id === visitObj.id)
            if (!existed) {
                customer[accountId].visits[weekName].push(visitObj)
            }
        } else {
            customer[accountId].visits[weekName] = [visitObj]
        }
    }
}

const getServiceDetailRouteGroup = async (ids) => {
    try {
        const res = await syncDownObj(
            'Service_Detail__c',
            `
        SELECT 
            Id, Route_Group__c, Route_Group__r.Name FROM Service_Detail__c 
        WHERE 
            Id IN (${getIdClause(ids)})
        `,
            false
        )
        const routeGroupMap = {}
        if (res.data) {
            res.data.forEach((item) => {
                routeGroupMap[item.Id] = {
                    routeGroupName: item?.Route_Group__r?.Name,
                    routeGroupId: item.Route_Group__c || ''
                }
            })
        }
        return routeGroupMap
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'MerchManagerUtils.getServiceDetailRouteGroup', error)
        return {}
    }
}
const USER_EE_FT_FLAG = 'User.FT_EMPLYE_FLG_VAL__c'
const getDataInCustomerDetail = (customerData, CTRRecordTypeId, dropDownRef?) => {
    return new Promise((resolve, reject) => {
        const fields = {
            IsRemoved__c: BooleanStr.STR_FALSE,
            'Customer_to_Route__r.Customer__c': customerData.accountId,
            'Customer_to_Route__r.Merch_Flag__c': BooleanStr.STR_TRUE,
            'Customer_to_Route__r.RecordTypeId': CTRRecordTypeId
        }
        const whereClauseArr = computeSmartClause('Service_Detail__c', fields)
        database()
            .use('Service_Detail__c')
            .select()
            .join({
                table: 'Customer_to_Route__c',
                alias: 'Customer_to_Route',
                type: 'LEFT',
                options: {
                    targetTable: 'Service_Detail__c',
                    targetField: 'Customer_to_Route__c',
                    mainField: 'Id'
                }
            })
            .select(['_soupEntryId', 'Id'])
            .join({
                table: 'User',
                alias: 'User',
                type: 'LEFT',
                options: {
                    targetTable: 'Service_Detail__c',
                    targetField: 'OwnerId',
                    mainField: 'Id'
                }
            })
            .select(['Name', 'FirstName', 'LastName', 'Title', 'FT_EMPLYE_FLG_VAL__c', 'MobilePhone'])
            .join({
                table: 'User_Stats__c',
                alias: 'US',
                type: 'LEFT',
                options: {
                    targetTable: 'User',
                    targetField: 'Id',
                    mainField: 'User__c'
                }
            })
            .select([
                'Id',
                'Start_Time__c',
                'Sunday__c',
                'Monday__c',
                'Tuesday__c',
                'Wednesday__c',
                'Thursday__c',
                'Friday__c',
                'Saturday__c'
            ])
            .where(whereClauseArr)
            .orderBy([{ table: 'Service_Detail__c', field: 'Pull_Number__c' }])
            .getData()
            .then(async (res: any) => {
                const customer = {}
                const serviceDetailIds = res.map((v) => v.Id)
                let routeGroupMap = {}
                try {
                    if (!_.isEmpty(serviceDetailIds)) {
                        routeGroupMap = await getServiceDetailRouteGroup(serviceDetailIds)
                    }
                } catch (error) {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'MerchManagerUtils.getDataInCustomerDetail.getServiceDetailRouteGroup',
                        JSON.stringify(error)
                    )
                }
                const routeGroupSDMap = {}
                res.forEach((store: any) => {
                    const weekName = getFullWeekNameFromString(store.Day_of_the_Week__c)
                    const accountId = store['Customer_to_Route__r.Customer__c']
                    const visitObj = {
                        id: store.Id,
                        userStatsId: store['US.Id'],
                        name: store['User.Name'],
                        firstName: store['User.FirstName'],
                        lastName: store['User.LastName'],
                        title: store['User.Title'],
                        phone: store['User.MobilePhone'],
                        ftFlag: store[USER_EE_FT_FLAG] && store[USER_EE_FT_FLAG].toLocaleLowerCase(),
                        ownerId: store.OwnerId,
                        isUnassigned: store.Unassigned__c === BooleanStr.STR_TRUE,
                        customer_to_route__c: store.Customer_to_Route__c,
                        pullNum: parseInt(store.Pull_Number__c) || 0,
                        takeOrder: store.Take_Order_Flag__c,
                        subtype: store.Visit_Subtype__c,
                        _soupEntryId: store._soupEntryId,
                        customer_to_route_soupEntryId: store[CTR_SOUP_ID],
                        customer_to_route_Id: store[CTR_ID],
                        weekName: store.Day_of_the_Week__c,
                        CTRRecordTypeId,
                        startTime: store['US.Start_Time__c'],
                        workingStatus: getWorkingStatus(store, 'US'),
                        customerData,
                        selectDayKey: weekName,
                        routeGroupName: routeGroupMap[store.Id]?.routeGroupName,
                        routeGroupId: routeGroupMap[store.Id]?.routeGroupId,
                        unassignedRoute: false,
                        totalVisit: 0
                    }
                    if (visitObj.isUnassigned && visitObj.routeGroupId) {
                        visitObj.unassignedRoute = true
                    }
                    if (visitObj.routeGroupId) {
                        if (routeGroupSDMap[visitObj.routeGroupId]) {
                            routeGroupSDMap[visitObj.routeGroupId].push(visitObj.id)
                        } else {
                            routeGroupSDMap[visitObj.routeGroupId] = [visitObj.id]
                        }
                    }
                    computeCustomerList(customer, accountId, weekName, visitObj)
                })
                const stores = Object.values(customer)
                let storeItem: any
                if (stores.length === 0) {
                    storeItem = {
                        accountId: customerData.accountId,
                        visits: {}
                    }
                } else {
                    storeItem = stores[0]
                    if (storeItem.visits) {
                        Object.keys(storeItem.visits).forEach((weekDay) => {
                            if (_.isArray(storeItem.visits[weekDay])) {
                                storeItem.visits[weekDay].forEach((serviceDetail) => {
                                    serviceDetail.totalVisit = routeGroupSDMap[serviceDetail.routeGroupId]?.length
                                })
                            }
                        })
                    }
                }
                resolve(storeItem)
            })
            .catch((err) => {
                dropDownRef?.current.alertWithType(DropDownType.ERROR, 'CustomerDetail - getCustomerDetail', err)
                reject([])
            })
    })
}

const computeDataInEmployeeDetail = (customer, userData, weekName, visitObj) => {
    if (!customer[userData.id]) {
        customer[userData.id] = {
            userId: userData.id,
            visits: {
                [weekName]: [visitObj]
            }
        }
    } else {
        if (customer[userData.id].visits[weekName]) {
            // if not found the same sd in array, then push it
            if (!customer[userData.id].visits[weekName].find((item) => item.id === visitObj.id)) {
                customer[userData.id].visits[weekName].push(visitObj)
            }
        } else {
            customer[userData.id].visits[weekName] = [visitObj]
        }
    }
}

export const getDataInEmployeeDetail = (userData, CTRRecordTypeId, dropDownRef?, unassignedRoute) => {
    return new Promise((resolve, reject) => {
        let tmpFields
        let fields = {
            IsRemoved__c: BooleanStr.STR_FALSE,
            Unassigned__c: BooleanStr.STR_FALSE,
            OwnerId: userData.id,
            'Customer_to_Route__r.Merch_Flag__c': BooleanStr.STR_TRUE,
            'Customer_to_Route__r.RecordTypeId': CTRRecordTypeId
        }
        if (unassignedRoute) {
            tmpFields = {
                IsRemoved__c: BooleanStr.STR_FALSE,
                Unassigned__c: BooleanStr.STR_TRUE,
                Route_Group__c: userData.id,
                'Customer_to_Route__r.Merch_Flag__c': BooleanStr.STR_TRUE,
                'Customer_to_Route__r.RecordTypeId': CTRRecordTypeId
            }
            fields = tmpFields
        }
        const whereClauseArr = computeSmartClause('Service_Detail__c', fields)
        database()
            .use('Service_Detail__c')
            .select()
            .join({
                table: 'Customer_to_Route__c',
                alias: 'Customer_to_Route',
                type: 'LEFT',
                options: {
                    targetTable: 'Service_Detail__c',
                    targetField: 'Customer_to_Route__c',
                    mainField: 'Id'
                }
            })
            .select(['_soupEntryId', 'Id'])
            .join({
                table: 'RetailStore',
                alias: 'RetailStore',
                options: {
                    targetTable: 'Customer_to_Route__c',
                    targetField: 'Customer__c',
                    mainField: 'AccountId'
                }
            })
            .select()
            .join({
                table: 'User',
                alias: 'User',
                type: 'LEFT',
                options: {
                    targetTable: 'Service_Detail__c',
                    targetField: unassignedRoute ? 'Route_Group__c' : 'OwnerId',
                    mainField: 'Id'
                }
            })
            .select(['Name', 'FirstName', 'LastName', 'Title', 'FT_EMPLYE_FLG_VAL__c', 'MobilePhone'])
            .join({
                table: 'User_Stats__c',
                alias: 'US',
                type: 'LEFT',
                options: {
                    targetTable: 'User',
                    targetField: 'Id',
                    mainField: 'User__c'
                }
            })
            .select([
                'Id',
                'Start_Time__c',
                'Sunday__c',
                'Monday__c',
                'Tuesday__c',
                'Wednesday__c',
                'Thursday__c',
                'Friday__c',
                'Saturday__c'
            ])
            .where(whereClauseArr)
            .orderBy([
                { table: 'Service_Detail__c', field: 'Pull_Number__c' },
                { table: 'RetailStore', field: 'Account.Name' }
            ])
            .getData()
            .then((res: any) => {
                const customer = {}
                res.forEach((visit: any) => {
                    const weekName = getFullWeekNameFromString(visit.Day_of_the_Week__c)
                    const shippingAddress = JSON.parse(visit['RetailStore.Account.ShippingAddress'])
                    if (shippingAddress) {
                        shippingAddress.street = shippingAddress?.street?.replace(/[\r\n]/g, ' ')
                    }
                    const visitObj = {
                        id: visit.Id,
                        userStatsId: visit['US.Id'],
                        name: visit['User.Name'],
                        firstName: visit['User.FirstName'],
                        lastName: visit['User.LastName'],
                        title: visit['User.Title'],
                        phone: visit['User.MobilePhone'],
                        ftFlag: visit[USER_EE_FT_FLAG] && visit[USER_EE_FT_FLAG].toLocaleLowerCase(),
                        ownerId: visit.OwnerId,
                        isUnassigned: visit.Unassigned__c === BooleanStr.STR_TRUE,
                        customer_to_route__c: visit.Customer_to_Route__c,
                        pullNum: parseInt(visit.Pull_Number__c) || 0,
                        takeOrder: visit.Take_Order_Flag__c,
                        subtype: visit.Visit_Subtype__c,
                        _soupEntryId: visit._soupEntryId,
                        customer_to_route_soupEntryId: visit[CTR_SOUP_ID],
                        customer_to_route_Id: visit[CTR_ID],
                        accountId: visit['RetailStore.AccountId'],
                        weekName: visit.Day_of_the_Week__c,
                        CTRRecordTypeId,
                        startTime: visit['US.Start_Time__c'],
                        store: {
                            accountId: visit['RetailStore.AccountId'],
                            name: visit['RetailStore.Account.Name'],
                            address: shippingAddress?.street || '',
                            cityStateZip: computeShipAddress(shippingAddress),
                            orderDays: handleDayStatus(visit['RetailStore.Account.Merchandising_Order_Days__c'])
                        },
                        workingStatus: getWorkingStatus(visit, 'US'),
                        selectDayKey: weekName,
                        indicator2P: visit['RetailStore.Account.Indicator_2P__c'] === BooleanStr.STR_TRUE
                    }
                    computeDataInEmployeeDetail(customer, userData, weekName, visitObj)
                })
                const stores = Object.values(customer)
                let storeItem: {}
                if (stores.length === 0) {
                    storeItem = {
                        userId: userData.id,
                        visits: {}
                    }
                } else {
                    storeItem = stores[0]
                }
                resolve(storeItem)
            })
            .catch((err) => {
                dropDownRef?.current.alertWithType(DropDownType.ERROR, 'EmployeeDetail - getCustomerDetail', err)
                reject([])
            })
    })
}

export const getCustomerData = async (props: {
    userData?
    dropDownRef?
    customerDetail?: boolean
    customerData?
    unassignedRoute?
}) => {
    const { userData, dropDownRef, customerDetail, customerData, unassignedRoute } = props
    const CTRRecordTypeId = await getRecordTypeIdByDeveloperName('CTR', 'Customer_to_Route__c')
    if (customerDetail) {
        return await getDataInCustomerDetail(customerData, CTRRecordTypeId, dropDownRef)
    }
    return getDataInEmployeeDetail(userData, CTRRecordTypeId, dropDownRef, unassignedRoute)
}

export const getCustomerDataSDL = async (props: { userData? }) => {
    const { userData } = props
    const result = {
        userId: userData.id,
        visits: {}
    }
    let visitCond = `WHERE {Visit:VisitorId} = '${userData.id}'`
    if (userData?.unassignedRoute) {
        visitCond = `WHERE {Visit:Route_Group__c} = '${userData.id}'`
    }
    const allVisits = await SoupService.retrieveDataFromSoup(
        'Visit',
        {},
        ScheduleQuery.retrieveVisitAndStoreData.f,
        ScheduleQuery.retrieveVisitAndStoreData.q +
            ` 
            ${visitCond}
            AND {Visit:Status__c} != 'Planned' AND {Visit:Status__c} != 'Removed' AND {Visit:Status__c} != 'Failed'
            AND DATE({Visit:Planned_Date__c}) >= DATE('now', 'weekday 0', '-7 days')
        `
    )
    const visits = _.groupBy(allVisits, (visit) => {
        switch (moment(visit.Planned_Date__c).weekday()) {
            case 0:
                return moment().day(0).format(TIME_FORMAT.DDD).toUpperCase()
            case 1:
                return moment().day(1).format(TIME_FORMAT.DDD).toUpperCase()
            case 2:
                return moment().day(2).format(TIME_FORMAT.DDD).toUpperCase()
            case 3:
                return moment().day(3).format(TIME_FORMAT.DDD).toUpperCase()
            case 4:
                return moment().day(4).format(TIME_FORMAT.DDD).toUpperCase()
            case 5:
                return moment().day(5).format(TIME_FORMAT.DDD).toUpperCase()
            case 6:
                return moment().day(6).format(TIME_FORMAT.DDD).toUpperCase()
            default:
                return ''
        }
    })
    const finalVisits = {}
    Object.keys(visits).forEach((day) => {
        const vis = visits[day]
        let stores = _.groupBy(vis, (v) => v.PlaceId)
        if (userData?.unassignedRoute) {
            stores = _.groupBy(vis, (v) => v.Id)
        }
        const finalStores = []
        Object.values(stores).forEach((st: any) => {
            let store = {
                Id: null,
                type: []
            }
            st.forEach((s) => {
                const orderDays = s.OrderDays?.split(';')
                const finalDays = []
                orderDays &&
                    orderDays.forEach((d) => {
                        finalDays.push(d.slice(0, 3).toUpperCase())
                    })
                if (store.Id) {
                    if (store.type.indexOf(t.labels.PBNA_MOBILE_ORDER) === -1 && finalDays.indexOf(day) !== -1) {
                        store.type.push(t.labels.PBNA_MOBILE_ORDER)
                    }
                    if (
                        store.type.indexOf(t.labels.PBNA_MOBILE_MERCH) === -1 &&
                        CommonParam.merchVisitRTId === s.RecordTypeId
                    ) {
                        store.type.push(t.labels.PBNA_MOBILE_MERCH)
                    }
                } else {
                    s.storeId = s.StoreId
                    s.UserId = userData.id
                    s.address = s.Street
                    s.storeName = s.StoreName
                    s.name = s.StoreName
                    s.status = s.Status__c
                    s.cityStateZip = computeStoreAddress(s)
                    s.UserName = userData.name
                    s.FirstName = userData.firstName
                    s.LastName = userData.lastName
                    s.UserStatsId = userData.userStatsId
                    s.FT_EMPLYE_FLG_VAL__c = userData.ftFlag
                    s.Title = userData.title
                    s.LocalRoute = userData.salesRoute
                    s.NationalId = userData.nationalId
                    s.MobilePhone = userData.phone
                    s.type = []
                    if (s.type.indexOf(t.labels.PBNA_MOBILE_ORDER) === -1 && finalDays.indexOf(day) !== -1) {
                        s.type.push(t.labels.PBNA_MOBILE_ORDER)
                    }
                    if (
                        s.type.indexOf(t.labels.PBNA_MOBILE_MERCH) === -1 &&
                        CommonParam.merchVisitRTId === s.RecordTypeId
                    ) {
                        s.type.push(t.labels.PBNA_MOBILE_MERCH)
                    }
                    store = s
                }
            })
            finalStores.push(store)
        })
        finalVisits[day] = finalStores
    })
    result.visits = finalVisits
    return result
}

const computeListData = (newVisitMap, item, obj, index, selectedReassignUser) => {
    if (Object.keys(newVisitMap).includes(item.id)) {
        const newVisit = newVisitMap[item.id]
        item.customer_to_route__c = newVisit.Customer_to_Route__c
        item.ownerId = newVisit.OwnerId
        item.name = selectedReassignUser.name
        item.firstName = selectedReassignUser.firstName
        item.lastName = selectedReassignUser.lastName
        item.userStatsId = selectedReassignUser.userStatsId
        item.select = false
    }
    if (!item.isDelete) {
        obj[index] = item
    }
}

const handleListData = (props: { data; customerDetail?; newVisitMap?; selectedReassignUser? }) => {
    const { customerDetail, newVisitMap, selectedReassignUser } = props
    let { data } = props
    if (!Array.isArray(data)) {
        if (_.isEmpty(data)) {
            return null
        }
        const keys = Object.keys(data).sort((a, b) => {
            return parseInt(a) - parseInt(b)
        })
        const tempData = []
        keys.forEach((item) => {
            tempData.push(data[item])
        })
        data = tempData
    }
    const obj = {}
    let index = 1
    if (customerDetail) {
        data.forEach((item, i) => {
            const num = i + ADD_NUMBER_ONE
            computeListData(newVisitMap, item, obj, num, selectedReassignUser)
        })
    } else {
        data.forEach((item) => {
            if (!item.isDelete && !item.isReassign) {
                obj[index] = item
                index++
            }
        })
    }
    return obj
}

export const handleOriginData = (props: { data; customerDetail?: boolean; newVisitMap?; selectedReassignUser? }) => {
    const { data, customerDetail, newVisitMap = {}, selectedReassignUser } = props
    const obj = {}
    if (_.isEmpty(data)) {
        return null
    }
    Object.keys(data).forEach((dayKey) => {
        const newDayData = customerDetail
            ? handleListData({ data: data[dayKey], customerDetail, newVisitMap, selectedReassignUser })
            : handleListData({ data: data[dayKey], customerDetail })
        if (!_.isEmpty(newDayData)) {
            obj[dayKey] = newDayData
        }
    })
    return obj
}

const handleDaySelect = (data) => {
    const obj = {}
    if (_.isEmpty(data)) {
        return null
    }
    Object.keys(data).forEach((dayKey) => {
        obj[dayKey] = false
    })
    return obj
}

const getSelectDay = (weeks) => {
    const allWeeks = getWeekLabel()
    for (const weekDay of allWeeks) {
        if (weeks.includes(weekDay)) {
            return weekDay
        }
    }
    return allWeeks[0]
}

export const refreshView = (props: {
    selectDayKey
    setData
    setWeekDays
    refMonthWeek
    setSelectDayKey
    setSortList
    store: any
    select?: any
    customerDetail?: boolean
}) => {
    const {
        selectDayKey,
        setData,
        setWeekDays,
        refMonthWeek,
        setSelectDayKey,
        setSortList,
        store,
        select,
        customerDetail
    } = props
    const data = handleOriginData({ data: store.visits, customerDetail })
    const weeks = handleDaySelect(store.visits) || {}
    const dayKey = select || selectDayKey || getSelectDay(Object.keys(weeks))
    if (_.isEmpty(data)) {
        return
    }
    setData(data)
    setWeekDays(weeks)
    refMonthWeek.current?.setSelectIndex(weeks, dayKey)
    setSelectDayKey(dayKey)
    setSortList(data[dayKey] || {})
}

const deleteCTRData = async (props: DeleteCTRInterface) => {
    const {
        CTRIDs,
        dropDownRef,
        userData,
        selectDayKey,
        setData,
        setWeekDays,
        refMonthWeek,
        setSelectDayKey,
        setSortList,
        customerDetail,
        setUserData,
        setReassignUserData,
        customerData
    } = props
    await softDeleteRecord(CTRIDs, 'Customer_to_Route__c', dropDownRef, SOFT_DELETE_CTR_MESSAGE)
    getUserData(dropDownRef).then((users: Array<any>) => {
        if (customerDetail) {
            setUserData(users)
            setTimeout(() => {
                getCustomerData({ customerDetail, dropDownRef, customerData }).then((store) =>
                    refreshView({
                        selectDayKey,
                        setData,
                        setWeekDays,
                        refMonthWeek,
                        setSelectDayKey,
                        setSortList,
                        store,
                        customerDetail
                    })
                )
            }, 5000)
        } else {
            setReassignUserData(users)
            setTimeout(() => {
                getCustomerData({ customerDetail, userData, dropDownRef }).then((store) =>
                    refreshView({
                        selectDayKey,
                        setData,
                        setWeekDays,
                        refMonthWeek,
                        setSelectDayKey,
                        setSortList,
                        store,
                        customerDetail
                    })
                )
            }, 5000)
        }
    })
}

export const refreshCTRData = async (props: RefreshCTRInterface) => {
    const {
        customerToRouteMap,
        dropDownRef,
        userData,
        selectDayKey,
        setData,
        setWeekDays,
        refMonthWeek,
        setSelectDayKey,
        setSortList,
        customerDetail,
        setReassignUserData,
        setUserData,
        customerData
    } = props
    const customerToRoute = Object.keys(customerToRouteMap)
    const CTRIDs = []
    let count = 0
    customerToRoute.forEach((customerToRouteId) => {
        const fields = { Customer_to_Route__c: customerToRouteId, IsRemoved__c: BooleanStr.STR_FALSE }
        const whereClauseArr = computeSmartClause('Service_Detail__c', fields)
        database()
            .use('Service_Detail__c')
            .select()
            .where(whereClauseArr)
            .getData()
            .then((res: Array<any>) => {
                count++
                if (res.length === 0) {
                    CTRIDs.push(customerToRouteMap[customerToRouteId][1])
                }
                if (count === customerToRoute.length && CTRIDs.length > 0) {
                    if (customerDetail) {
                        deleteCTRData({
                            CTRIDs,
                            dropDownRef,
                            setUserData,
                            selectDayKey,
                            setData,
                            setWeekDays,
                            refMonthWeek,
                            setSelectDayKey,
                            setSortList,
                            customerData,
                            customerDetail
                        })
                    } else {
                        deleteCTRData({
                            CTRIDs,
                            dropDownRef,
                            setReassignUserData,
                            userData,
                            selectDayKey,
                            setData,
                            setWeekDays,
                            refMonthWeek,
                            setSelectDayKey,
                            setSortList,
                            customerDetail
                        })
                    }
                }
            })
            .catch((err) => {
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    customerDetail ? 'CustomerDetail - SearchCTRData' : 'EmployeeDetail - refreshCTRData',
                    err
                )
            })
    })
}

const resetPullNumAfterDelete = (params) => {
    const { deleteLength, deleteVisitIdMap, weekNameArray, recordTypeId, callback, data, dropDownRef, lineCodeMap } =
        params
    const allArray = []
    Object.keys(deleteVisitIdMap).forEach((accountId) => {
        const visitIdArray = deleteVisitIdMap[accountId]
        weekNameArray.forEach((weekDayString) => {
            allArray.push(
                resetCustomerWeekDayPullNum({
                    visitIdArray,
                    weekDayString,
                    CTRRecordTypeId: recordTypeId,
                    accountId,
                    data,
                    dropDownRef,
                    orderDays: null,
                    lineCodeMap
                })
            )
        })
    })
    Promise.all(allArray).then(() => {
        callback && callback(deleteLength.toString())
    })
}

const resetPullNumAfterDeleteCustom = (params) => {
    const { visitIdArray, weekNameArray, recordTypeId, callback, data, dropDownRef, customerData, lineCodeMap } = params
    const allArray = []
    const orderDays = getOrderDayObj(customerData)
    weekNameArray.forEach((weekDayString) => {
        allArray.push(
            resetCustomerWeekDayPullNum({
                visitIdArray,
                weekDayString,
                CTRRecordTypeId: recordTypeId,
                accountId: customerData.accountId,
                data,
                dropDownRef,
                orderDays,
                lineCodeMap
            })
        )
    })
    Promise.all(allArray).then(() => {
        callback && callback(visitIdArray.length.toString())
    })
}

export const deleteSelectCustomerToSoup = async (props: DeleteSelectToSoupProps) => {
    const {
        callback,
        dropDownRef,
        deleteSelectData,
        data,
        setReassignUserData,
        userData,
        selectDayKey,
        setData,
        setWeekDays,
        refMonthWeek,
        setSelectDayKey,
        setSortList,
        customerData,
        setUserData,
        lineCodeMap
    } = props
    const deleteItemArr = Object.values(deleteSelectData)
    const deleteArr = []
    const deleteWeekNameMap = {}
    const deleteVisitIdArr = []
    const customerToRouteMap = {}
    let recordTypeId = ''
    const serviceDetailIds = []
    deleteItemArr.forEach((item: any) => {
        serviceDetailIds.push(item.id)
        customerToRouteMap[item.customer_to_route__c] = [item.customer_to_route_soupEntryId, item.customer_to_route_Id]
        deleteArr.push(item._soupEntryId)
        deleteVisitIdArr.push(item.id)
        deleteWeekNameMap[item.weekName] = true
        recordTypeId = item.CTRRecordTypeId
    })
    if (deleteArr.length > 0) {
        await softDeleteRecord(serviceDetailIds, 'Service_Detail__c', dropDownRef, SOFT_DELETE_SD_MESSAGE)
        refreshCTRData({
            customerToRouteMap,
            dropDownRef,
            setReassignUserData,
            userData,
            selectDayKey,
            setData,
            setWeekDays,
            refMonthWeek,
            setSelectDayKey,
            setSortList,
            setUserData,
            customerData,
            customerDetail: true
        })
        resetPullNumAfterDeleteCustom({
            visitIdArray: deleteVisitIdArr,
            weekNameArray: Object.keys(deleteWeekNameMap),
            recordTypeId,
            callback,
            data,
            dropDownRef,
            customerData,
            lineCodeMap
        })
    } else {
        callback && callback()
    }
}

export const deleteSelectToSoup = async (props: DeleteSelectToSoupProps) => {
    const {
        callback,
        dropDownRef,
        deleteSelectData,
        data,
        setReassignUserData,
        userData,
        selectDayKey,
        setData,
        setWeekDays,
        refMonthWeek,
        setSelectDayKey,
        setSortList,
        customerData,
        setUserData,
        lineCodeMap
    } = props
    const deleteItemArr = Object.values(deleteSelectData)
    const deleteArr = []
    const deleteWeekNameMap = {}
    const deleteVisitIdMap = {}
    const customerToRouteMap = {}
    let recordTypeId = ''
    const serviceDetailIds = []
    deleteItemArr.forEach((item: any) => {
        serviceDetailIds.push(item.id)
        customerToRouteMap[item.customer_to_route__c] = [item.customer_to_route_soupEntryId, item.customer_to_route_Id]
        deleteArr.push(item._soupEntryId)
        if (!deleteVisitIdMap[item.accountId]) {
            deleteVisitIdMap[item.accountId] = [item.id]
        } else {
            deleteVisitIdMap[item.accountId].push(item.id)
        }
        deleteWeekNameMap[item.weekName] = true
        recordTypeId = item.CTRRecordTypeId
    })
    if (deleteArr.length > 0) {
        await softDeleteRecord(serviceDetailIds, 'Service_Detail__c', dropDownRef, SOFT_DELETE_SD_MESSAGE)
        refreshCTRData({
            customerToRouteMap,
            dropDownRef,
            setReassignUserData,
            userData,
            selectDayKey,
            setData,
            setWeekDays,
            refMonthWeek,
            setSelectDayKey,
            setSortList,
            setUserData,
            customerData
        })
        resetPullNumAfterDelete({
            deleteLength: deleteArr.length,
            deleteVisitIdMap,
            weekNameArray: Object.keys(deleteWeekNameMap),
            recordTypeId,
            callback,
            data,
            dropDownRef,
            lineCodeMap
        })
    } else {
        callback && callback()
    }
}

/**
 * @description format string by comma, such as "100,000,000,000"
 * @params string/number
 * @returns string
 */
export const formatStringByComma = (str: any) => {
    if (str) {
        return str.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
    return str
}

export const initVisitList = {
    Id: 'NeedCreate',
    Name: null,
    OwnerId: null,
    Start_Date__c: null,
    End_Date__c: null,
    Start_Time__c: null,
    End_Time__c: null,
    Visit_Date__c: null,
    RecordTypeId: null,
    Status__c: null,
    Visit_List_Group__c: null,
    Location_Id__c: null,
    Updated__c: false,
    Manager_Ad_Hoc__c: false,
    Planned_Travel_Time__c: 0,
    Planned_Mileage__c: 0,
    Number_of_Planned_Visits__c: 0,
    Planned_Service_Time__c: 0,
    Total_Planned_Cases__c: 0,
    IsRemoved__c: false
}

export const syncUpVisitListUpdateFields = [
    'Id',
    'Name',
    'OwnerId',
    'Start_Date__c',
    'End_Date__c',
    'Visit_Date__c',
    'RecordTypeId',
    'Visit_List_Group__c',
    'Location_Id__c',
    'Updated__c',
    'Manager_Ad_Hoc__c',
    'Planned_Travel_Time__c',
    'Planned_Mileage__c',
    'Number_of_Planned_Visits__c',
    'Planned_Service_Time__c',
    'Total_Planned_Cases__c',
    'IsRemoved__c'
]

export const SLICE_START = 0
export const TEXT_LENGTH_MAX = 80

export const queryAndSyncScheduleVisitList = async (props: QueryAndSyncScheduleInterface) => {
    const { startDate, endDate, setIsLoading } = props
    try {
        const scheduleRecordTypeId = await getRecordTypeIdByDeveloperName('Schedule_Visit_Group', 'Visit_List__c')
        const originScheduleVisit: any = await queryScheduleVisit(
            CommonParam.userId,
            startDate,
            endDate,
            scheduleRecordTypeId,
            setIsLoading
        )
        if (originScheduleVisit.length === 0) {
            const newScheduleVisit = {
                ...initVisitList,
                Name: `${startDate} - ${CommonParam.userLocationId}`.slice(SLICE_START, TEXT_LENGTH_MAX),
                OwnerId: CommonParam.userId,
                Start_Date__c: startDate,
                End_Date__c: endDate,
                RecordTypeId: scheduleRecordTypeId,
                Location_Id__c: CommonParam.userLocationId,
                Status__c: `${VisitListStatus.ACCEPTED}`,
                Updated__c: true,
                Manager_Ad_Hoc__c: true
            }
            await SoupService.upsertDataIntoSoup('Visit_List__c', [newScheduleVisit])
            await syncUpObjCreate(
                'Visit_List__c',
                getObjByName('Visit_List__c').syncUpCreateFields,
                getObjByName('Visit_List__c').syncUpCreateQuery +
                    ` WHERE {Visit_List__c:Start_Date__c} = '${startDate}'
                   AND {Visit_List__c:End_Date__c} = '${endDate}'
                   AND {Visit_List__c:Location_Id__c} = '${CommonParam.userLocationId}'
                   AND {Visit_List__c:RecordTypeId} = '${scheduleRecordTypeId}'
                   AND {Visit_List__c:Status__c} = '${VisitListStatus.ACCEPTED}'
                   AND {Visit_List__c:IsRemoved__c} IS FALSE
                `
            )
        }
        return queryScheduleVisit(CommonParam.userId, startDate, endDate, scheduleRecordTypeId, setIsLoading)
    } catch (error) {
        setIsLoading(false)
    }
}

export const queryAndSyncWeekly = async (props: QueryWeeklyForReassignInterface) => {
    const { item, startDate, endDate, isPublished, setIsLoading } = props
    try {
        const weeklyRecordTypeId = await getRecordTypeIdByDeveloperName('Visit_List_Group', 'Visit_List__c')
        const originWeekVisitList: any = await queryVisitList(
            item.visitor,
            startDate,
            endDate,
            weeklyRecordTypeId,
            setIsLoading
        )
        if (originWeekVisitList.length === 0) {
            const newWeeklyVisitList = {
                ...initVisitList,
                Name: `${startDate} - ${endDate} - ${item.name}`.slice(SLICE_START, TEXT_LENGTH_MAX),
                OwnerId: item.visitor,
                Start_Date__c: startDate,
                End_Date__c: endDate,
                RecordTypeId: weeklyRecordTypeId,
                Location_Id__c: CommonParam.userLocationId,
                Status__c: 'Not Started',
                Updated__c: true,
                Manager_Ad_Hoc__c: isPublished
            }
            await SoupService.upsertDataIntoSoup('Visit_List__c', [newWeeklyVisitList])
            await syncUpObjCreate(
                'Visit_List__c',
                getObjByName('Visit_List__c').syncUpCreateFields,
                getObjByName('Visit_List__c').syncUpCreateQuery +
                    ` WHERE {Visit_List__c:OwnerId} = '${item.visitor}'
                    AND {Visit_List__c:Start_Date__c} = '${startDate}'
                    AND {Visit_List__c:End_Date__c} = '${endDate}'
                    AND {Visit_List__c:RecordTypeId} = '${weeklyRecordTypeId}'
                    AND {Visit_List__c:IsRemoved__c} IS FALSE
                `
            )
        } else {
            originWeekVisitList[0].Updated__c = true
            originWeekVisitList[0].OwnerId = item.visitor
            originWeekVisitList[0].Manager_Ad_Hoc__c = isPublished
            await syncUpObjUpdateFromMem(
                'Visit_List__c',
                filterExistFields('Visit_List__c', originWeekVisitList, syncUpVisitListUpdateFields)
            )
        }
        return queryVisitList(item.visitor, startDate, endDate, weeklyRecordTypeId, setIsLoading)
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'MerchManagerUtils.queryAndSyncWeekly',
            `queryAndSyncWeekly - ${getStringValue(error)}`
        )
        setIsLoading(false)
    }
}

export const computeOriginDaily = async (props: QueryDailyForReassignInterface) => {
    const { item, clause, visitDates, weekVisitList, isPublished, setIsLoading, dailyRecordTypeId } = props
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'Visit_List__c',
            {},
            getObjByName('Visit_List__c').syncUpCreateFields,
            getObjByName('Visit_List__c').syncUpCreateQuery + ` ${clause} `
        )
            .then((res: any) => {
                if (res.length === 0) {
                    res = visitDates.map((dateItem) => {
                        return {
                            ...initVisitList,
                            Name: `${dateItem} - ${item.name}`.slice(SLICE_START, TEXT_LENGTH_MAX),
                            OwnerId: item.visitor,
                            Visit_Date__c: dateItem,
                            Visit_List_Group__c: weekVisitList[0].Id,
                            RecordTypeId: dailyRecordTypeId,
                            Location_Id__c: CommonParam.userLocationId,
                            Status__c: VisitListStatus.NOT_STARTED,
                            Updated__c: true,
                            Manager_Ad_Hoc__c: isPublished
                        }
                    })
                    resolve(res)
                }
                const daysOfWeek = []
                res.forEach((visitListItem) => daysOfWeek.push(visitListItem.Visit_Date__c))
                const addResArr = []
                visitDates.forEach((visitDatesItem) => {
                    const index = daysOfWeek.indexOf(visitDatesItem)
                    if (index === -1) {
                        const newDailyVisitList = {
                            ...initVisitList,
                            Name: `${visitDatesItem} - ${item.name}`.slice(SLICE_START, TEXT_LENGTH_MAX),
                            OwnerId: item.visitor,
                            Visit_Date__c: visitDatesItem,
                            Visit_List_Group__c: weekVisitList[0].Id,
                            RecordTypeId: dailyRecordTypeId,
                            Location_Id__c: CommonParam.userLocationId,
                            Updated__c: true,
                            Manager_Ad_Hoc__c: isPublished,
                            Status__c: VisitListStatus.NOT_STARTED
                        }
                        addResArr.push(newDailyVisitList)
                    }
                })
                res = res.map((visitListItem) => {
                    visitListItem.Visit_List_Group__c = weekVisitList[0].Id
                    visitListItem.Manager_Ad_Hoc__c = isPublished
                    return visitListItem
                })
                const result = res.concat(addResArr)
                resolve(result)
            })
            .catch((err) => {
                setIsLoading(false)
                reject(err)
            })
    })
}

export const queryAndSyncDaily = async (props: QueryDailyForReassignInterface) => {
    const { item, visitDates, weekVisitList, isPublished, setIsLoading } = props
    const dailyRecordTypeId = await getRecordTypeIdByDeveloperName('Daily_Visit_List', 'Visit_List__c')
    const clause = `WHERE {Visit_List__c:OwnerId} = '${item.visitor}'
        AND {Visit_List__c:Visit_Date__c} IN (${getIdClause(visitDates)})
        AND {Visit_List__c:IsRemoved__c} IS FALSE
        AND {Visit_List__c:RecordTypeId} = '${dailyRecordTypeId}'
        AND ({Visit_List__c:Status__c} != '${VisitListStatus.COMPLETED}' OR {Visit_List__c:Status__c} IS NULL)`
    const originDailyVisitList: any = await computeOriginDaily({
        item,
        clause,
        visitDates,
        weekVisitList,
        isPublished,
        setIsLoading,
        dailyRecordTypeId
    })
    const needToCreateVisitList = originDailyVisitList.filter((dvl) => dvl.Id === 'NeedCreate')
    const needToUpdateVisitList = originDailyVisitList.filter((dvl) => dvl.Id !== 'NeedCreate')

    await SoupService.upsertDataIntoSoup('Visit_List__c', originDailyVisitList)

    if (needToCreateVisitList.length > 0) {
        await syncUpObjCreate(
            'Visit_List__c',
            getObjByName('Visit_List__c').syncUpCreateFields,
            getObjByName('Visit_List__c').syncUpCreateQuery + " WHERE {Visit_List__c:Id}='NeedCreate'"
        )
    }

    if (needToUpdateVisitList.length > 0) {
        await syncUpObjUpdateFromMem(
            'Visit_List__c',
            filterExistFields('Visit_List__c', needToUpdateVisitList, syncUpVisitListUpdateFields)
        )
    }

    return SoupService.retrieveDataFromSoup(
        'Visit_List__c',
        {},
        getObjByName('Visit_List__c').syncUpCreateFields,
        getObjByName('Visit_List__c').syncUpCreateQuery + ` ${clause}`
    )
}

export const getFTPT = (item) => {
    const ft = item.item.title ? 'FT | ' : 'FT'
    const temp = item.item.title ? 'PT | ' : 'PT'
    const pt = item.item.ftFlag === 'false' ? temp : ''
    return item.item.ftFlag === 'true' ? ft : pt
}

export const getVisitSubTypeStr = (subtype) => {
    let subtypeString = ''
    let subtypeNumString = ''
    if (subtype) {
        const subTypeArray = subtype.split(';')
        let subtypeStr = subTypeArray[0]
        if (subTypeArray.includes('PREMIER')) {
            subtypeStr = 'PREMIER'
        }
        subtypeString = t.labels['PBNA_MOBILE_' + subtypeStr.toUpperCase().replace(/((\s[^A-Za-z]\s)|\s)/g, '_')]
        if (subTypeArray.length - 1 > 0) {
            subtypeNumString = ', +' + (subTypeArray.length - 1)
        }
    }
    return { subtypeString, subtypeNumString }
}

export const updateOldVisitList = async (oldVisitListIds) => {
    try {
        let oldVisitListClause = ''
        oldVisitListIds.forEach((id, index) => {
            oldVisitListClause += index === 0 ? ` {Visit_List__c:Id} = '${id}'` : ` OR {Visit_List__c:Id} = '${id}'`
        })
        const res = await SoupService.retrieveDataFromSoup(
            'Visit_List__c',
            {},
            getObjByName('Visit_List__c').syncUpCreateFields,
            getObjByName('Visit_List__c').syncUpCreateQuery + ` WHERE ${oldVisitListClause}`
        )
        if (res.length > 0) {
            res?.forEach((oldVisitList) => {
                oldVisitList.Updated__c = true
            })
            await SoupService.upsertDataIntoSoup('Visit_List__c', res)
        }
        Promise.resolve()
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'MerchManagerUtils.updateOldVisitList',
            `Update old visit list failed: ${getStringValue(error)}`
        )
    }
}

export const calculateVisitAndVisitList = async (oldVisitListIds, allUpdate, action) => {
    try {
        if (action === 'Delete') {
            await syncUpObjUpdateFromMem(
                'Visit',
                filterExistFields('Visit', allUpdate, ['Id', 'Status__c', 'Route_Group__c', 'Visit_List__c'])
            )
        }
        if (action === 'Unassign') {
            await syncUpObjUpdateFromMem(
                'Visit',
                filterExistFields('Visit', allUpdate, ['Id', 'VisitorId', 'OwnerId', 'Visit_List__c'])
            )
        }
        if (oldVisitListIds.length !== 0) {
            await updateOldVisitList(oldVisitListIds)
            const visitListIds = oldVisitListIds.filter((oId) => Boolean(oId))
            for (const id of visitListIds) {
                await reSequenceByVisitListId(id)
                await calculateDistanceAndTravelTime(id)
            }
        }
    } catch (error) {
        await storeClassLog(
            Log.MOBILE_ERROR,
            'MerchManagerUtils.calculateVisitAndVisitList',
            `calculateVisitAndVisitList: ${getStringValue(error)}`
        )
    }
}

// hasNoLocation: return boolean to show the userLocationModal or not
export const updateLocationInfoInCopilot = async (updateLocationInfo) => {
    const recordTypeId = await getRecordTypeIdByDeveloperName('Sales_Unit', 'Route_Sales_Geo__c')
    const res = await getLocationData(recordTypeId)
    let hasNoLocation = false
    if (_.isEmpty(res)) {
        updateLocationInfo({ hasNoUnitName: true })
    } else {
        const Id = res[0].Id
        const startTime = res[0].Default_Start_Time__c
        const userLocation = res[0].Default_Starting_Location__c
        hasNoLocation = _.isEmpty(userLocation) || _.isEmpty(startTime)
        const unitName = res[0].SLS_UNIT_NM__c
        const gocart = res[0].Go_Kart_Flag__c !== '0'
        updateLocationInfo({ Id, startTime, userLocation, hasNoLocation, unitName, gocart })
    }
    return hasNoLocation
}

export const transferMilesIntoKilometerForCanada = (currentMiles) => {
    const factor = 1.60934
    const res = Number(currentMiles) * factor
    return res === 0 ? 0 : res.toFixed(1)
}

export const getUserCityName = (updateIsInCanada) => {
    SoupService.retrieveDataFromSoup(
        'Route_Sales_Geo__c',
        {},
        ['CTRY_NM__c'],
        `SELECT {Route_Sales_Geo__c:CTRY_NM__c}
        FROM {Route_Sales_Geo__c}
        WHERE {Route_Sales_Geo__c:SLS_UNIT_ID__c}='${CommonParam.userLocationId}' AND {Route_Sales_Geo__c:HRCHY_LVL__c}='Location'
        `
    )
        .then((res) => {
            if (!_.isEmpty(res)) {
                updateIsInCanada(res[0]?.CTRY_NM__c === 'Canada')
            } else {
                updateIsInCanada(false)
            }
            return null
        })
        .catch((err) => {
            storeClassLog(Log.MOBILE_ERROR, getUserCityName.name, `Get User Location Failed: ${getStringValue(err)}`)
        })
}

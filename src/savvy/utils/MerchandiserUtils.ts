/**
 * @description Utils for Merch Manager.
 * @author Chris ZANG
 * @date 2021-05-24
 */
import { NativeAppEventEmitter, NativeModules } from 'react-native'
import Geolocation from 'react-native-geolocation-service'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { net } from 'react-native-force'
import { CommonParam } from '../../common/CommonParam'
import MerchandiserConfig from '../config/MerchandiserConfig'
import { Persona } from '../../common/enums/Persona'
import { SoupService } from '../service/SoupService'
import SyncService from '../service/SyncService'
import { getRecordTypeIdByDeveloperName } from './MerchManagerUtils'
import NotificationService from '../service/NotificationService'
import { Log } from '../../common/enums/Log'
import LocationService from '../service/LocationService'
import {
    restApexCommonCall,
    syncDownObj,
    syncDownObjByIdsAndClause,
    syncPictures,
    syncPicturesData,
    syncUpObjCreate,
    syncVisitListData
} from '../api/SyncUtils'
import DocumentService from '../service/DocumentService'
import _ from 'lodash'
import { VisitStatus } from '../enums/Visit'
import MyVisitQueries from '../queries/MyVisitQueries'
import { formatString } from './CommonUtils'
import { formatClock } from '../common/DateTimeUtils'
import MomentService from '../service/MomentService'
import { formatWithTimeZone, isSameDayWithTimeZone, isTodayDayWithTimeZone } from './TimeZoneUtils'
import { RANGE_TYPE } from '../enums/MerchandiserEnums'
import { RecordTypeEnum } from '../enums/RecordType'
import { recordSyncingLogs } from '../helper/merchandiser/MyVisitHelper'
import { forceSyncDeliveries, recordSyncFlag } from './InitUtils'
import moment from 'moment'
import NonDisplayPromotionService from '../service/NonDisplayPromotionService'
import { getPastDays } from '../../common/components/WeekBar'
import { updateVLStartGap } from '../service/UpdateVisitListService'
import { getIdClause } from '../components/manager/helper/MerchManagerHelper'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { MOMENT_UNIT } from '../../common/enums/MomentUnit'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const { MapManager } = NativeModules
const eventSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'Event')
const vlListSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'Visit_List__c')
const inStoreLocationSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'InStoreLocation')
const taskSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'Task')
const visitSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'Visit')
const shipmentSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'Shipment')
const shipmentItemSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'ShipmentItem')
const storeSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'RetailStore')
const breadcrumb = MerchandiserConfig.objs.find((soup) => soup.name === 'Breadcrumb_Timestamps__c')
const promotionSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'Promotion')
const promotionProductSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'PromotionProduct')
const accountSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'Account')
const storeProductSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'StoreProduct')
const ctrSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'Customer_to_Route__c')
const userStatSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'User_Stats__c')
const orderSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'Order')
const orderItemSoup = MerchandiserConfig.objs.find((soup) => soup.name === 'OrderItem')

export const syncWorkOrders = async (skipIsSyncCheck = false) => {
    recordSyncingLogs('syncWorkOrders: CommonParam.isSyncing setting true')
    if (!skipIsSyncCheck) {
        CommonParam.isSyncing = true
    }
    try {
        await SyncService.syncUp({
            soupName: 'Task'
        })
        await syncPicturesData([])
        CommonParam.pendingSync.workOrder = false
        if (!skipIsSyncCheck) {
            recordSyncingLogs('syncWorkOrders: CommonParam.isSyncing setting false')
            CommonParam.isSyncing = false
        }
        AsyncStorage.setItem('pendingSyncItems', JSON.stringify(CommonParam.pendingSync))
    } catch (err) {
        if (!skipIsSyncCheck) {
            recordSyncingLogs('syncWorkOrders: CommonParam.isSyncing setting false')
            CommonParam.isSyncing = false
            storeClassLog(
                Log.MOBILE_INFO,
                'MerchandiserUtils.syncWorkOrders',
                `Sync work order failed: ${ErrorUtils.error2String(err)}`
            )
        }
    }
}

export const initConfigByPersona = async () => {
    if (CommonParam.PERSONA__c === Persona.MERCHANDISER) {
        await new Promise<void>((resolve) => {
            AsyncStorage.getItem('LocationArea').then((area) => {
                if (area) {
                    CommonParam.LocationArea = area
                    resolve()
                } else {
                    net.sendRequest(
                        '',
                        "/services/data/v51.0/tooling/query/?q=Select+id,Name,Value+from+ExternalString+WHERE+Name='PBNA_Merchandiser_Area'",
                        (success: any) => {
                            CommonParam.LocationArea = success.records[0].Value
                            AsyncStorage.setItem('LocationArea', success.records[0].Value)
                            resolve()
                        },
                        () => {
                            resolve()
                        }
                    )
                }
            })
        })
        const visit = await SoupService.retrieveDataFromSoup('Visit', {}, [
            'PlaceId',
            'Visit_List__c',
            'Customer_ID__c'
        ])
        const account = await SoupService.retrieveDataFromSoup('Account', {}, ['Id'])
        const uniqueStoreIds = Array.from(new Set(visit.map((v) => v.PlaceId)))
        const uniqueCustomerIds = Array.from(new Set(visit.map((v) => v.Customer_ID__c)))
        const uniqueVLIds = Array.from(new Set(visit.map((v) => v.Visit_List__c)))
        const uniqueAccountIds = Array.from(new Set(account.map((v) => v.Id)))
        CommonParam.uniqueStoreIds = uniqueStoreIds
        CommonParam.uniqueVLIds = uniqueVLIds
        CommonParam.uniqueAccountIds = uniqueAccountIds
        CommonParam.uniqueCustomerIds = uniqueCustomerIds
        NotificationService.clearNotifications()
        const weeklyRecordTypeId = await getRecordTypeIdByDeveloperName('Visit_List_Group', 'Visit_List__c')
        const dailyRecordTypeId = await getRecordTypeIdByDeveloperName('Daily_Visit_List', 'Visit_List__c')
        if (!CommonParam.isFirstTimeUser) {
            forceSyncDeliveries()
        }
        CommonParam.isFirstTimeUser = false
        await recordSyncFlag()
        CommonParam.weeklyRcdId = weeklyRecordTypeId || null
        CommonParam.dailyRcdId = dailyRecordTypeId || null
    }
}

export const getRecordTypeMapping = async () => {
    const salesVisitRTId = await getRecordTypeIdByDeveloperName(RecordTypeEnum.SALES, 'Visit')
    const merchVisitRTId = await getRecordTypeIdByDeveloperName(RecordTypeEnum.MERCHANDISING, 'Visit')
    CommonParam.salesVisitRTId = salesVisitRTId || null
    CommonParam.merchVisitRTId = merchVisitRTId || null
}

const removeUploadedExecutionData = async () => {
    const pics = await SoupService.retrieveDataFromSoup(
        'PictureData',
        {},
        ['ContentDocumentId', 'IsUploaded', 'Type', '_soupEntryId'],
        null,
        []
    )
    const uploadedArr = pics.filter((p) => p.IsUploaded === 'true').map((p) => p._soupEntryId)
    await SoupService.removeRecordFromSoup('PictureData', uploadedArr)
}

export const retrievePhotos = () => {
    return new Promise((resolve) => {
        removeUploadedExecutionData()
            .then(() => {
                return SoupService.retrieveDataFromSoup('Task', {}, [], null)
            })
            .then((tasks) => {
                const workOrderIds = tasks.map((t) => `'${t.Id}'`)
                return DocumentService.fetchWorkOrderPhotos(workOrderIds)
            })
            .then((res) => {
                const newArr = res.map((pic) => {
                    return {
                        ...pic,
                        Type: pic.ImageType,
                        IsUploaded: 'true'
                    }
                })

                return SoupService.upsertDataIntoSoup('PictureData', newArr)
            })
            .then(() => {
                resolve(Promise.resolve())
            })
            .catch((err) => {
                storeClassLog(Log.MOBILE_ERROR, 'MerchandiserUtils.retrievePhotos', ErrorUtils.error2String(err))
                resolve([])
            })
    })
}

const syncDownDeliveryManifest = async (lstVisitIds, isToday) => {
    const userInfoBody = {
        lstVisitId: lstVisitIds,
        strLocationId: CommonParam.userLocationId
    }
    const { data } = await restApexCommonCall('getUserInformation', 'POST', userInfoBody)
    isToday && (await AsyncStorage.setItem('delivery_manifest', data))
    return data
}

const syncDownDeliveryRoute = async (lstUserIds, date) => {
    const deliveryRouteBody = {
        lstUserId: lstUserIds,
        strDate: date,
        strLocationId: CommonParam.userLocationId,
        idMerch: CommonParam.userId
    }
    const { data } = await restApexCommonCall('getDeliveryRoute', 'POST', deliveryRouteBody)
    await AsyncStorage.setItem('delivery_route', data)
}

// If not sync for today, then only cache Delivery Manifest
export const syncDownDeliveryMap = async (plannedDate?) => {
    const isToday = !plannedDate || isTodayDayWithTimeZone(plannedDate, true)
    const date = plannedDate || moment().format(TIME_FORMAT.Y_MM_DD)
    const merchVisit = await SoupService.retrieveDataFromSoup(
        'Visit',
        {},
        ['PlaceId'],
        `SELECT {Visit:PlaceId}
             FROM {Visit}
             WHERE {Visit:RecordType.DeveloperName} = 'Merchandising'
             AND {Visit:Planned_Date__c} = '${date}'
             AND {Visit:VisitorId} = '${CommonParam.userId}'`
    )
    const merchVisitStore = _.uniq(merchVisit.map((visit) => visit.PlaceId))
    const res = await SoupService.retrieveDataFromSoup(
        'Visit',
        {},
        ['VisitorId'],
        `SELECT {Visit:VisitorId}
                 FROM {Visit}
                 WHERE {Visit:RecordType.DeveloperName} = 'Delivery'
                 AND {Visit:Planned_Date__c} = '${date}'
                 AND {Visit:VisitorId} IS NOT NULL
                 AND {Visit:PlaceId} IN (${getIdClause(merchVisitStore)})`
    )
    const uniqVisitorId = _.uniq(res.map((item) => item.VisitorId))
    if (uniqVisitorId.length === 0) {
        return []
    }
    const records = await syncDownObjByIdsAndClause(
        'Visit',
        ['Id'],
        uniqVisitorId,
        true,
        false,
        `Planned_Date__c = ${date}`,
        'VisitorId'
    )
    isToday && (await syncDownDeliveryRoute(uniqVisitorId, date))
    return syncDownDeliveryManifest(
        records.map((item) => item.Id),
        isToday
    )
}

export const syncDataForNewStore = async (storeIds: string[], accountIds: string[]) => {
    await SyncService.syncDownObjWithCondForNew(taskSoup, storeIds, accountIds)
    await SyncService.syncDownObjWithCondForNew(eventSoup, storeIds, accountIds)
    await SyncService.syncDownObjWithCondForNew(storeSoup, storeIds, accountIds)
    await SyncService.syncDownObjWithCondForNew(shipmentSoup, storeIds, accountIds)
    await SyncService.syncDownObjWithCondForNew(shipmentItemSoup, storeIds, accountIds)
    await SyncService.syncDownObjWithCondForNew(vlListSoup, storeIds, accountIds)
    await SyncService.syncDownObjWithCondForNew(inStoreLocationSoup, storeIds, accountIds)
    await SyncService.syncDownObjWithCondForNew(promotionSoup, storeIds, accountIds)
    await SyncService.syncDownObjWithCondForNew(promotionProductSoup, storeIds, accountIds)
    await SyncService.syncDownObjWithCondForNew(storeProductSoup, storeIds, accountIds)
    await SyncService.syncDownObjWithCondForNew(ctrSoup, storeIds, accountIds)
    await SyncService.syncDownObjWithCondForNew(userStatSoup, storeIds, accountIds)
}

export const syncData = (individual?) => {
    return SyncService.syncDownObjWithCond(taskSoup)
        .then(() => {
            return SyncService.syncDownObjWithCond(eventSoup)
        })
        .then(() => {
            if (individual) {
                return Promise.resolve()
            }
            return SyncService.syncDownObjWithCond(storeSoup)
        })
        .then(() => {
            return SyncService.syncDownObjWithCond(shipmentSoup)
        })
        .then(() => {
            return SyncService.syncDownObjWithCond(shipmentItemSoup)
        })
        .then(() => {
            return SyncService.syncDownObjWithCond(vlListSoup)
        })
        .then(() => {
            return SyncService.syncDownObjWithCond(inStoreLocationSoup)
        })
        .then(() => {
            return SyncService.syncDownObjWithCond(promotionSoup)
        })
        .then(() => {
            if (individual) {
                return Promise.resolve()
            }
            return SyncService.syncDownObjWithCond(accountSoup)
        })
        .then(() => {
            return SyncService.syncDownObjWithCond(promotionProductSoup)
        })
        .then(() => {
            return SyncService.syncDownObjWithCond(storeProductSoup)
        })
        .then(() => {
            return NonDisplayPromotionService.syncDownNonDisplayPromotionData()
        })
        .then(() => {
            return SyncService.syncDownObjWithCond(orderSoup)
        })
        .then(() => {
            return SyncService.syncDownObjWithCond(orderItemSoup)
        })
        .then(() => {
            return SyncService.syncDownObjWithCond(ctrSoup)
        })
        .then(() => {
            return SyncService.syncDownObjWithCond(userStatSoup)
        })
        .then(() => {
            return retrievePhotos()
        })
        .then(() => {
            //     return PlanogramService.downloadAllPdf()
            // }).then((filePath) => {
            // AsyncStorage.setItem('planogramPath', filePath.join(','))
            if (individual) {
                return Promise.resolve()
            }
            return SyncService.syncDownObjWithCond(breadcrumb)
        })
}

export const syncWithVId = (vids) => {
    return syncData(false).then(() => {
        return syncDownObj(
            'Visit',
            'SELECT Id, Name, OwnerId, PlaceId, VisitorId, Visitor.Name, ' +
                'Status__c, ActualVisitEndTime, ActualVisitStartTime, LastModifiedDate, PlannedVisitEndTime, PlannedVisitStartTime,' +
                ' Ad_Hoc__c, Manager_Ad_Hoc__c, RecordTypeId, Planned_Date__c, Sequence__c, Visit_List__c, Planned_Duration_Minutes__c, ' +
                'Actual_Duration_Minutes__c, Customer_ID__c, Visit_Subtype__c, Take_Order_Flag__c, InstructionDescription, ' +
                "Pull_Number__c, RecordType.DeveloperName FROM Visit WHERE Id IN ( '" +
                vids.join("','") +
                "')" +
                ` OR (RecordType.DeveloperName='Delivery' 
                    AND Planned_Date__c=${moment().format(TIME_FORMAT.Y_MM_DD)} 
                    AND Retail_Store__r.LOC_PROD_ID__c='${CommonParam.userLocationId}') `
        )
    })
}

export const reLoadData = () => {
    return SoupService.retrieveDataFromSoup('Visit', {}, ['_soupEntryId'])
        .then((res) => {
            return SoupService.removeRecordFromSoup(
                'Visit',
                res.map((r) => r._soupEntryId)
            )
        })
        .then(() => {
            return SoupService.retrieveDataFromSoup('Event', {}, ['_soupEntryId'], null, [
                " WHERE {Event:Manager_Scheduled__c}='1'"
            ])
        })
        .then((res) => {
            return SoupService.removeRecordFromSoup(
                'Event',
                res.map((r) => r._soupEntryId)
            )
        })
        .then(() => {
            return SoupService.retrieveDataFromSoup('Visit_List__c', {}, ['_soupEntryId'])
        })
        .then((res) => {
            return SoupService.removeRecordFromSoup(
                'Visit_List__c',
                res.map((r) => r._soupEntryId)
            )
        })
        .then(() => {
            return SoupService.retrieveDataFromSoup('Task', {}, ['_soupEntryId'])
        })
        .then((res) => {
            return SoupService.removeRecordFromSoup(
                'Task',
                res.map((r) => r._soupEntryId)
            )
        })
        .then(() => {
            return SoupService.retrieveDataFromSoup('Shipment', {}, ['_soupEntryId'])
        })
        .then((res) => {
            return SoupService.removeRecordFromSoup(
                'Shipment',
                res.map((r) => r._soupEntryId)
            )
        })
        .then(() => {
            return SyncService.syncDownObjWithCond(visitSoup)
        })
        .then(() => {
            return syncData(true)
        })
}

export const syncVLData = async () => {
    try {
        recordSyncingLogs('syncVLData!')
        await SyncService.syncUp({
            soupName: 'Visit'
        })
        await syncVisitListData()
        await SyncService.syncUp({
            soupName: 'Task'
        })
        await syncPictures()
        await SyncService.syncUp({
            soupName: 'Event'
        })
        await SyncService.syncDownObjWithCond(taskSoup)
    } catch (err) {
        CommonParam.pendingSync.visit = true
        storeClassLog(Log.MOBILE_ERROR, 'MerchandiserUtils.syncVLData', ErrorUtils.error2String(err))
    }
}

let watchId = null
export const stopWatching = () => {
    if (watchId) {
        Geolocation.clearWatch(watchId)
    }
}

export const startWatchingUtil = () => {
    stopWatching()
    watchId = Geolocation.watchPosition(
        (cLocation) => {
            NativeAppEventEmitter.emit('WatchPosition', cLocation)
        },
        (error) => {
            storeClassLog(
                Log.MOBILE_INFO,
                'MerchandiserUtils.startWatchingUtil',
                `Watch position failed: ${ErrorUtils.error2String(error)}`
            )
        },
        {
            showsBackgroundLocationIndicator: true,
            distanceFilter: 5,
            accuracy: {
                ios: 'bestForNavigation'
            },
            enableHighAccuracy: true
        }
    )
}

export const calculateServiceTime = (visit, events, endTime?, number?, noFloor?) => {
    const SIXTY = 60
    const THOUSAND = 1000
    endTime = endTime ? endTime.getTime() : new Date().getTime()
    const startTime = new Date(visit.ActualVisitStartTime).getTime()
    let time = endTime - startTime

    // Calculate real duration, solving overlap events issues
    let lastEventEndTime = startTime
    const formatEvents: any[] = events.map((event) => {
        return {
            Actual_Start_Time__c: new Date(event.Actual_Start_Time__c).getTime(),
            Actual_End_Time__c: event.Actual_End_Time__c
                ? new Date(event.Actual_End_Time__c).getTime()
                : new Date().getTime()
        }
    })
    formatEvents.sort((a, b) => {
        return a.Actual_Start_Time__c - b.Actual_Start_Time__c
    })
    formatEvents.forEach((event) => {
        const calculatedStartTime =
            event.Actual_Start_Time__c < lastEventEndTime ? lastEventEndTime : event.Actual_Start_Time__c
        if (event.Actual_End_Time__c < lastEventEndTime) {
            return
        }
        const duration = event.Actual_End_Time__c - calculatedStartTime
        time = time - duration
        lastEventEndTime = event.Actual_End_Time__c
    })
    // End of Calculation

    const mins = (Math.floor(time / (SIXTY * THOUSAND)) % SIXTY) + ''
    const hours = Math.floor(time / (SIXTY * SIXTY * THOUSAND)) + ''
    if (number) {
        return Math.floor(time / (SIXTY * THOUSAND)) + ''
    }
    if (noFloor) {
        return time / (SIXTY * THOUSAND) + ''
    }
    return formatClock({
        hour: hours,
        min: mins
    })
}

export const getEvents = (visit) => {
    const pastDays = getPastDays()
    let pastFirstDay = null
    if (pastDays?.length > 0) {
        pastFirstDay = pastDays[0].date
    }

    return new Promise<Array<any>>((resolve) => {
        let soql = 'SELECT {Event:Actual_Start_Time__c}, {Event:Actual_End_Time__c} FROM {Event}'
        if (visit.status !== VisitStatus.IN_PROGRESS && visit.status !== VisitStatus.COMPLETE) {
            soql += ` LEFT JOIN {Visit_List__c} ON {Event:Visit_List__c} = {Visit_List__c:Id}
            WHERE {Event:Actual_End_Time__c} IS NULL AND {Event:Actual_Start_Time__c} IS NOT NULL`
            if (pastFirstDay) {
                soql += ` AND {Visit_List__c:Visit_Date__c} >= '${pastFirstDay}'`
            }
        } else {
            soql +=
                ` WHERE
         ({Event:Actual_Start_Time__c} > '` +
                visit.ActualVisitStartTime +
                `'
             AND {Event:Actual_Start_Time__c} < '` +
                visit.ActualVisitEndTime +
                `')
         OR ({Event:Actual_Start_Time__c} > '` +
                visit.ActualVisitStartTime +
                `'
             AND '` +
                visit.ActualVisitEndTime +
                "' IS NULL) "
        }
        soql += ' ORDER BY {Event:Actual_Start_Time__c}'

        SoupService.retrieveDataFromSoup('Event', {}, ['Actual_Start_Time__c', 'Actual_End_Time__c'], soql)
            .then((res: any) => {
                resolve(res)
            })
            .catch(() => {
                resolve([])
            })
    })
}

export const checkInRange = (cLocation) => {
    const resultLocations = []
    CommonParam.geoLocationList.forEach((userLocation) => {
        const position2 = LocationService.wgs84togcj02(cLocation.coords.longitude, cLocation.coords.latitude)
        cLocation.coords.latitude = position2[1]
        cLocation.coords.longitude = position2[0]
        if (LocationService.isInRange(cLocation, JSON.parse(JSON.stringify(userLocation)))) {
            resultLocations.push(userLocation)
        }
    })
    return resultLocations
}

const recordGeofenceWithData = (items) => {
    SoupService.upsertDataIntoSoup('Breadcrumb_Timestamps__c', items).then((res) => {
        syncUpObjCreate(
            'Breadcrumb_Timestamps__c',
            MyVisitQueries.breadcrumbQuery.f,
            MyVisitQueries.breadcrumbQuery.q
        ).catch((err) => {
            storeClassLog(Log.MOBILE_ERROR, 'BREADCRUMB TIMESTAMP', `${res.length} -- ${ErrorUtils.error2String(err)}`)
        })
    })
}

const getNearestStore = (cLocation) => {
    return new Promise((resolve, reject) => {
        try {
            let nearestLoc = {}
            const positionArr = []
            const originPosition = {
                latitude: cLocation.coords.latitude,
                longitude: cLocation.coords.longitude
            }
            CommonParam.geoLocationList.forEach((storeLocation) => {
                const geofences = storeLocation.Geofences[0] || []
                const geolocation = geofences.Geolocations[0]
                const targrtLocation = {
                    latitude: geolocation.Latitude,
                    longitude: geolocation.Longitude
                }
                positionArr.push(MapManager.calculateWithPoints([originPosition, targrtLocation]))
            })
            Promise.all(positionArr)
                .then((distances) => {
                    if (distances.length > 0) {
                        let distance = distances[0]?.totalDistance || 0
                        let minIndex = 0
                        distances.forEach((item, index) => {
                            if (item.totalDistance < distance) {
                                distance = item.totalDistance
                                minIndex = index
                            }
                        })
                        nearestLoc = CommonParam.geoLocationList[minIndex]
                    }
                    resolve(nearestLoc)
                })
                .catch(async (err) => {
                    reject(err)
                    await storeClassLog(
                        Log.MOBILE_ERROR,
                        'MerchandiserUtils.getNearestStore.getNearestStore',
                        ErrorUtils.error2String(err)
                    )
                })
        } catch (error) {
            reject(error)
            storeClassLog(Log.MOBILE_ERROR, 'MerchandiserUtils.getNearestStore', ErrorUtils.error2String(error))
        }
    })
}
const getBreadcrumbTimestampsFromLocal = (queryString) => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'Breadcrumb_Timestamps__c',
            {},
            MyVisitQueries.gofenceQuery.f,
            formatString(MyVisitQueries.gofenceQuery.q, [CommonParam.userId, queryString])
        )
            .then((totalData: any[]) => {
                resolve(totalData)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

const prepareInGeofenceData = (queryBase, locations, eTime) => {
    const inLocationArr = []
    let idS = ''
    locations.forEach((location, index) => {
        idS += `'${location.Id}'` + (index !== locations.length - 1 ? ',' : '')
        inLocationArr.push({
            Customer__c: location.Id,
            Geofence_Direction__c: RANGE_TYPE.IN,
            Time__c: eTime,
            User__c: CommonParam.userId,
            Visit__c: CommonParam.visitStatus.id,
            Visit_List__c: CommonParam.visitList.Id
        })
    })
    const queryString = queryBase + ` AND {Breadcrumb_Timestamps__c:Customer__c} IN (${idS})`
    getBreadcrumbTimestampsFromLocal(queryString).then((totalData: any[]) => {
        const resultStoreArr = []
        inLocationArr.forEach((itemStore) => {
            const matchStore = totalData.filter(
                (item) =>
                    item.Customer__c === itemStore.Customer__c &&
                    (item.Visit__c === itemStore.Visit__c || (!item.Visit__c && !itemStore.Visit__c))
            )
            const lastBread = matchStore.length > 0 ? matchStore[matchStore.length - 1] : {}
            if (matchStore.length === 0 || lastBread?.Geofence_Direction__c === RANGE_TYPE.OUT) {
                resultStoreArr.push(itemStore)
            }
        })
        if (resultStoreArr.length > 0) {
            recordGeofenceWithData(resultStoreArr)
        }
    })
}

export const restoreMerchandiserGeofence = (locations, cLocation) => {
    if (!CommonParam.visitList.Id) {
        return
    }
    const type = locations.length > 0 ? RANGE_TYPE.IN : RANGE_TYPE.OUT
    const eTime = new Date().toISOString()
    let queryString = ` AND {Breadcrumb_Timestamps__c:Visit_List__c}='${CommonParam.visitList.Id}'`
    if (CommonParam.visitStatus.id) {
        queryString = queryString + ` AND {Breadcrumb_Timestamps__c:Visit__c}='${CommonParam.visitStatus.id}'`
    }
    if (type === RANGE_TYPE.IN) {
        prepareInGeofenceData(queryString, locations, eTime)
    } else {
        getNearestStore(cLocation).then((storeItem: any) => {
            if (storeItem?.Id) {
                queryString = queryString + `AND {Breadcrumb_Timestamps__c:Customer__c}='${storeItem.Id}'`
                getBreadcrumbTimestampsFromLocal(queryString).then((totalData: any[]) => {
                    const lastRecord = totalData.length > 0 ? totalData[totalData.length - 1] : {}
                    if (lastRecord.Geofence_Direction__c === RANGE_TYPE.IN) {
                        recordGeofenceWithData([
                            {
                                Customer__c: storeItem.Id,
                                Geofence_Direction__c: type,
                                Time__c: eTime,
                                User__c: CommonParam.userId,
                                Visit__c: CommonParam.visitStatus.id || '',
                                Visit_List__c: CommonParam.visitList.Id
                            }
                        ])
                    }
                })
            }
        })
    }
}

export const updateStartGap = () => {
    const vl = _.cloneDeep(CommonParam.visitList)
    if (vl.Start_Gap_Notification__c && vl.Start_Gap_Notification__c > 0) {
        return
    }

    SoupService.retrieveDataFromSoup(
        'Visit',
        {},
        ['id', 'name', 'ActualVisitStartTime'],
        `SELECT
            {Visit:Id},
            {Visit:Name},
            {Visit:ActualVisitStartTime} as startTime,
            {Visit:_soupEntryId}
            FROM {Visit}
            WHERE {Visit:VisitorId} = "${CommonParam.userId}"
            AND {Visit:Visit_List__c} = "${CommonParam.visitList.Id}"
            AND {Visit:Status__c} != 'Planned' AND {Visit:Status__c} != 'Removed' AND {Visit:Status__c} != 'Failed'
            AND {Visit:ActualVisitStartTime} IS NOT NULL
        UNION 
        SELECT {Event:Id},
            {Event:Type},
            {Event:Actual_Start_Time__c} as startTime,
            {Event:_soupEntryId}
            FROM {Event}
            WHERE {Event:Visit_List__c} = "${CommonParam.visitList.Id}"
            AND {Event:Actual_Start_Time__c} IS NOT NULL
        ORDER BY startTime
            `
    ).then((result) => {
        if (result.length > 0) {
            const firstVisit = result[0]

            const vlStartTimeString = vl.Start_Date_Time__c
            const vlStartTime = MomentService.convertUTCToLocalTime(vlStartTimeString)
            const visitStartTime = MomentService.convertUTCToLocalTime(firstVisit.ActualVisitStartTime)

            vl.Start_Gap_Notification__c = Math.round(visitStartTime.diff(vlStartTime, MOMENT_UNIT.MINUTES, true))
            CommonParam.visitList = vl

            updateVLStartGap(vl)
        }
    })
}

export const getShipmentFromSoup = (items, date) => {
    return new Promise((resolve, reject) => {
        let query = `SELECT
       {Shipment:Id},
       {Shipment:Total_Delivered__c},
       {Shipment:ActualDeliveryDate},
       {Order:Dlvry_Rqstd_Dtm__c},
       {Order:RetailStore__c},
       {Order:Id}, 
       {Order:Total_Ordered_IntCount__c},
       {Order:Total_Certified_IntCount__c}
       FROM {Order}
       LEFT JOIN {Shipment} ON {Shipment:Order_Id__c} = {Order:Ordr_Id__c}
       WHERE {Order:RetailStore__c} IN ('${items.map((x) => x.storeId).join("','")}')
       `
        if (date) {
            let newDate = date
            if (typeof date === 'object') {
                newDate = formatWithTimeZone(date, TIME_FORMAT.Y_MM_DD, false, false)
            }
            query += ` AND
       (date(REPLACE({Order:Dlvry_Rqstd_Dtm__c}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') = '${newDate}'
       OR
       date(REPLACE({Shipment:ActualDeliveryDate}, '+0000', ''), '${CommonParam.userTimeZoneOffset}') = '${newDate}'
       )`
        }
        SoupService.retrieveDataFromSoup(
            'Shipment',
            {},
            [
                'ShipmentId',
                'Total_Delivered__c',
                'ActualDeliveryDate',
                'ExpectedDeliveryDate',
                'Retail_Store__c',
                'OrderId',
                'Total_Ordered_IntCount__c',
                'Total_Certified_IntCount__c'
            ],
            query
        )
            .then((result: any[]) => {
                resolve(result)
            })
            .catch((err) => {
                reject(err)
            })
    })
}
export const calculateOrderDetails = (element, resultArr) => {
    const returnObj = {
        visitId: null,
        haveOpenStatus: false,
        haveDelivery: false,
        totalCertified: 0,
        totalDelivered: 0,
        totalOrdered: 0
    }
    const todayShipment = []
    resultArr.forEach((shipmentItem) => {
        const isToday =
            isSameDayWithTimeZone(shipmentItem.ExpectedDeliveryDate, element.Planned_Date__c) ||
            isSameDayWithTimeZone(shipmentItem.ActualDeliveryDate, element.Planned_Date__c)
        if (isToday && element.storeId === shipmentItem.Retail_Store__c) {
            returnObj.totalDelivered = returnObj.totalDelivered + Number(shipmentItem.Total_Delivered__c)
            returnObj.haveDelivery = true
            returnObj.visitId = shipmentItem.Retail_Store__c
            todayShipment.push(shipmentItem)
        }
    })
    returnObj.haveOpenStatus = todayShipment.findIndex((shipment) => shipment.ShipmentId === null) > -1
    _.uniqBy(todayShipment, 'OrderId').forEach((orderItem) => {
        returnObj.totalCertified = returnObj.totalCertified + Number(orderItem.Total_Certified_IntCount__c)
        returnObj.totalOrdered = returnObj.totalOrdered + Number(orderItem.Total_Ordered_IntCount__c)
    })
    return returnObj
}

export const getDeliveryFooter = (items, date?) => {
    return new Promise((resolve, reject) => {
        const returnObjs = []

        getShipmentFromSoup(items, date)
            .then((resultArr: any[]) => {
                items.forEach((element) => {
                    const OrderDetails = calculateOrderDetails(element, resultArr)
                    returnObjs.push(OrderDetails)
                })

                resolve(returnObjs)
            })
            .catch((err) => {
                // dropDownRef.current.alertWithType('error', 'Something Wrong', JSON.stringify(err))
                reject(err)
            })
    })
}

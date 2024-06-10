import Geolocation from 'react-native-geolocation-service'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import dayjs from 'dayjs'
import BaseInstance from '../../common/BaseInstance'
import LocationService from './LocationService'
import { syncDownObj } from '../api/SyncUtils'
import { getAllFieldsByObjName } from '../utils/SyncUtils'
import _ from 'lodash'
import { autoLogCall } from '../utils/TaskUtils'

const COORDINATE_OFFSET = 0.02
const TRACK_START_TIME = 8
const TRACK_END_TIME = 19
const MIN_TRACKER_DISTANCE = 10 // meter
const TRACKER_INTERVAL = 60000 // ms

let trackerId = null
let inFenceList = []
let lock = false

const isInTime = (hour: number) => {
    return hour >= TRACK_START_TIME && hour <= TRACK_END_TIME
}

const calculateInFence = async (currentLocation: { longitude: number; latitude: number }) => {
    const [longitude, latitude] = LocationService.wgs84togcj02(currentLocation.longitude, currentLocation.latitude)
    const retailStoreList = await BaseInstance.sfSoupEngine.retrieve('RetailStore', [], '', [
        `Where {RetailStore:Customer_Longitude__c}>${
            longitude - COORDINATE_OFFSET
        } and {RetailStore:Customer_Longitude__c}<${
            longitude + COORDINATE_OFFSET
        } and {RetailStore:Customer_Latitude__c}>${
            latitude - COORDINATE_OFFSET
        } and {RetailStore:Customer_Latitude__c}<${latitude + COORDINATE_OFFSET}`
    ])
    return retailStoreList.filter((retailStore) => {
        const geoFence = JSON.parse(retailStore.Geofence__c)
        if (geoFence) {
            return LocationService.isInRange(
                {
                    coords: {
                        latitude,
                        longitude
                    }
                },
                geoFence
            )
        }
        return false
    })
}

const fetchCallFromCustomer = async (customer) => {
    return await syncDownObj(
        'Task',
        `SELECT ${getAllFieldsByObjName('Task').join()} ` +
            `FROM Task WHERE WhatId = '${customer.AccountId}' AND RecordType.Name='Customer Activity' ` +
            `AND Subject='Customer Logging Calls' AND Status='Complete' AND CreatedDate=Today`
    )
}

const trackerLocation = () => {
    Geolocation.requestAuthorization('always').then(() => {
        trackerId = Geolocation.watchPosition(
            async (cLocation) => {
                const { coords, timestamp } = cLocation
                if (isInTime(dayjs(timestamp).hour())) {
                    const newInFenceList = await calculateInFence(coords)
                    const leftFenceList = _.differenceBy(inFenceList, newInFenceList, 'Id')
                    for (const customer of leftFenceList) {
                        if (!lock) {
                            lock = true
                            const { data } = await fetchCallFromCustomer(customer)
                            if (_.isEmpty(data)) {
                                await autoLogCall(customer.AccountId, '', true)
                            }
                            lock = false
                        }
                    }
                    inFenceList = newInFenceList
                }
            },
            (error) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'FSR-TrackLocation',
                    `Track location failed: ${ErrorUtils.error2String(error)}`
                )
                lock = false
            },
            {
                showsBackgroundLocationIndicator: true,
                distanceFilter: MIN_TRACKER_DISTANCE,
                accuracy: {
                    ios: 'bestForNavigation'
                },
                enableHighAccuracy: true
            }
        )
    })
}

const trackerStarter = () => {
    const currentTime = dayjs().hour()
    if (trackerId === null && isInTime(currentTime)) {
        trackerLocation()
    } else if (trackerId !== null && !isInTime(currentTime)) {
        Geolocation.clearWatch(trackerId)
    }
}

const startTracker = async () => {
    trackerStarter()
    setInterval(() => {
        trackerStarter()
    }, TRACKER_INTERVAL)
}

export const RepLocationTrackerService = {
    startTracker
}

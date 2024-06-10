import Geolocation from 'react-native-geolocation-service'
import { CommonParam } from '../../common/CommonParam'
import { checkInRange } from '../utils/MerchandiserUtils'
import { Linking } from 'react-native'
import { Log } from '../../common/enums/Log'
import { storeClassLog } from '../../common/utils/LogUtils'
import _ from 'lodash'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

interface MarkerObject {
    takeOrderFlag: string
    name: string
    ActualVisitStartTime: string
    ActualVisitEndTime: string
    VisitorId: string
    latlng: {
        latitude: number
        longitude: number
    }
    VisitId: string
    title: string
    AccountPhone: string
    description: string
    status: string
    sequence: any
    startTime: string
    address: string
    cityStateZip: string
    adHoc: string
    plannedDuration: any
    storeLocation: {
        latitude: number
        longitude: number
    }
    storeId: string
    PlannedVisitStartTime: string
    visitDetailRelated: Object
    VisitDate: string
    RecordTypeDeveloperName: string
}

const PI = Math.PI
const a = 6378245.0
const ee = 0.006693421622965943
const offsetDis = 50

const transformlat = (lng, lat) => {
    let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng))
    ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0
    ret += ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) / 3.0
    ret += ((160.0 * Math.sin((lat / 12.0) * PI) + 320 * Math.sin((lat * PI) / 30.0)) * 2.0) / 3.0
    return ret
}

const transformlng = (lng, lat) => {
    let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
    ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0
    ret += ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) / 3.0
    ret += ((150.0 * Math.sin((lng / 12.0) * PI) + 300.0 * Math.sin((lng / 30.0) * PI)) * 2.0) / 3.0
    return ret
}

const outOfChina = (lng, lat) => {
    // include shenyang. (lng < 102 || lng > 128) || (lat < 23 || lat > 44)
    return lng < 102 || lng > 122 || lat < 23 || lat > 38
}

export const getDistance = (lat1, lng1, lat2, lng2) => {
    const radLat1 = (lat1 * PI) / 180.0
    const radLat2 = (lat2 * PI) / 180.0
    const a1 = radLat1 - radLat2
    const b = (lng1 * PI) / 180.0 - (lng2 * PI) / 180.0
    let s =
        2 *
        Math.asin(
            Math.sqrt(
                Math.pow(Math.sin(a1 / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
            )
        )
    s = s * 6378.137
    s = (Math.round(s * 10000) / 10000) * 1000
    return s
}

export const wgs84togcj02 = (lng, lat) => {
    if (outOfChina(lng, lat)) {
        return [lng, lat]
    }
    let dlat = transformlat(lng - 105.0, lat - 35.0)
    let dlng = transformlng(lng - 105.0, lat - 35.0)
    const radlat = (lat / 180.0) * PI
    let magic = Math.sin(radlat)
    magic = 1 - ee * magic * magic
    const sqrtmagic = Math.sqrt(magic)
    dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI)
    dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI)
    const mglat = lat + dlat
    const mglng = lng + dlng
    return [mglng, mglat]
}

const getCurrentPosition = (timeout?) => {
    return new Promise<any>((resolve) => {
        Geolocation.requestAuthorization('whenInUse').then(() => {
            Geolocation.getCurrentPosition(
                (position) => {
                    const position2 = wgs84togcj02(position.coords.longitude, position.coords.latitude)
                    position.coords.latitude = position2[1]
                    position.coords.longitude = position2[0]
                    resolve(position)
                },
                (error) => {
                    storeClassLog(
                        Log.MOBILE_WARN,
                        'GetPositionFailed',
                        `requestAuthorization: ${ErrorUtils.error2String(error)}`
                    )
                    resolve(error)
                },
                {
                    enableHighAccuracy: true,
                    timeout: timeout || 15000,
                    maximumAge: 3000,
                    accuracy: { ios: 'best' }
                }
            )
        })
    })
}

const gotoLocation = (origin, dest) => {
    const destLoc = `daddr=${dest.latitude},${dest.longitude}`
    const path = [destLoc, 'q=Location', 'dirflg=d'].join('&')
    const url = `maps://?${path}`
    Linking.openURL(url)
}

const getOffestPositions = (positions) => {
    // Performance: 10k data will take 10 second or more
    const newArr = []
    for (let i = positions.length - 1; i >= 0; i--) {
        const offestla = (offsetDis + i * 5) / a
        const targetNode = positions[i]
        for (let j = 0; j < i; j++) {
            const targetLocation = JSON.parse(targetNode.storeLocation)
            const compareLocation = JSON.parse(positions[j].storeLocation)
            if (
                compareLocation &&
                targetLocation &&
                compareLocation.latitude === targetLocation.latitude &&
                compareLocation.longitude === targetLocation.longitude
            ) {
                const offestLocation = {
                    latitude: parseFloat(targetLocation.latitude) + offestla,
                    longitude: parseFloat(targetLocation.longitude)
                }
                targetNode.storeLocation = JSON.stringify(offestLocation)
            }
        }
        newArr.push(targetNode)
    }
    return newArr
}

export const getInLocation = (cLocation, vis) => {
    let inLocation = false
    const locations = checkInRange(cLocation)
    locations.forEach((location) => {
        if (vis.storeId === location.Id) {
            inLocation = true
        }
    })
    return inLocation
}

export function preventMarkersFromOverlap<LoName extends string, LaName extends string>(
    markers: { [key in LoName | LaName]: number }[],
    longitudeApiName: LoName,
    latitudeApiName: LaName
) {
    const cacheMarkers = new Map<string, boolean>()
    const offsetLatitude = (offsetDis * 2) / a

    markers.forEach((targetNode) => {
        while (cacheMarkers.has(targetNode[longitudeApiName] + ' ' + targetNode[latitudeApiName])) {
            targetNode[longitudeApiName] = targetNode[longitudeApiName] + offsetLatitude
        }
        cacheMarkers.set(targetNode[longitudeApiName] + ' ' + targetNode[latitudeApiName], true)
    })
    return markers
}

export const handleRandomOffset = (markers: any[], longitudeApiName: string, latitudeApiName: string): any[] => {
    return markers.map((marker: any) => {
        const newMarker = _.cloneDeep(marker)
        // Math.random() generates random numbers in the range [0, 1).
        // Therefore, `(Math.random() - 0.5) / 5000` generates random numbers in the range [-0.0001, 0.0001).
        // That is, we control the offset of longitude and latitude to within about ±0.0001 degrees.
        // On the Earth's surface, this corresponds to a range of about ±11 meters.
        newMarker[longitudeApiName] = marker[longitudeApiName] + (Math.random() - 0.5) / 5000
        newMarker[latitudeApiName] = marker[latitudeApiName] + (Math.random() - 0.5) / 5000
        return newMarker
    })
}

const getBoundingBox = (center, positions) => {
    const lat = center.latitude
    const long = center.longitude
    const offestArr = getOffestPositions(positions)
    const tmpMarkers: Array<MarkerObject> = []
    const tmpDirections = []
    const origin = {
        latitude: lat,
        longitude: long
    }
    offestArr.forEach((position) => {
        const storeLocation = JSON.parse(position.storeLocation)
        const markerLocation = {
            latitude: parseFloat(position.storeLocation ? storeLocation.latitude : position.latitude),
            longitude: parseFloat(position.storeLocation ? storeLocation.longitude : position.longitude)
        }
        if (markerLocation.latitude && markerLocation.longitude) {
            tmpMarkers.push({
                latlng: {
                    latitude: markerLocation.latitude,
                    longitude: markerLocation.longitude
                },
                VisitId: position.id,
                VisitorId: position.VisitorId,
                ActualVisitStartTime: position.ActualVisitStartTime,
                ActualVisitEndTime: position.ActualVisitEndTime,
                takeOrderFlag: position.Take_Order_Flag__c,
                name: position.name,
                title: position.name,
                AccountPhone: position.AccountPhone,
                description: position.description,
                status: position.status,
                sequence: position.sequence,
                startTime: position.startTime,
                address: position.address,
                cityStateZip: position.cityStateZip,
                adHoc: position.adHoc,
                plannedDuration: position.plannedDuration || position.PlannedDurationMinutes,
                storeLocation: markerLocation,
                storeId: position.storeId,
                PlannedVisitStartTime: position.PlannedVisitStartTime,
                VisitDate: position.Planned_Date__c,
                visitDetailRelated: position.visitDetailRelated,
                RecordTypeDeveloperName: position.RecordType_DeveloperName
            })
            tmpDirections.push({
                origin,
                destination: markerLocation
            })
        }
    })

    const northeastLat = Math.max(...tmpMarkers.map((m) => m.storeLocation.latitude))
    const southwestLat = Math.min(...tmpMarkers.map((m) => m.storeLocation.latitude))
    const northeastLon = Math.max(...tmpMarkers.map((m) => m.storeLocation.longitude))
    const southwestLon = Math.min(...tmpMarkers.map((m) => m.storeLocation.longitude))

    let latDelta = 2.5 * (northeastLat - southwestLat)
    let lngDelta = 2.5 * (northeastLon - southwestLon)
    latDelta = latDelta > 0.0422 ? latDelta : 0.0422
    lngDelta = lngDelta > 0.0221 ? lngDelta : 0.0221
    if (latDelta + lat > 90) {
        latDelta = 90 - lat
    }
    if (lngDelta + long > 180) {
        lngDelta = 180 - long
    }

    const initialRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta
    }
    return {
        initialRegion,
        tmpMarkers,
        tmpDirections
    }
}
const inside = (point, vs) => {
    const x = point[0]
    const y = point[1]
    let isInside = false
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0]
        const yi = vs[i][1]
        const xj = vs[j][0]
        const yj = vs[j][1]
        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
        if (intersect) {
            isInside = !isInside
        }
    }

    return isInside
}
const isInRange = (cLocation, location) => {
    const checkPoint = [cLocation.coords.latitude, cLocation.coords.longitude]
    let result = false
    const locations = location.Geofences.filter((loc) => loc.Area === CommonParam.LocationArea)
    locations.map((loc) => {
        const polygonPoints = loc.Geolocations.splice(1).map((l) => {
            return [parseFloat(l.Latitude), parseFloat(l.Longitude)]
        })
        result = result || inside(checkPoint, polygonPoints)
        return result
    })
    return result
}

export const LocationService = {
    getCurrentPosition,
    gotoLocation,
    getBoundingBox,
    getDistance,
    wgs84togcj02,
    getOffestPositions,
    isInRange
}

export default LocationService

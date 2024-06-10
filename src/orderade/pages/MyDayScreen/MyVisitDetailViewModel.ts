import { NativeAppEventEmitter } from 'react-native'
import Geolocation from 'react-native-geolocation-service'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import { ReturnCartItem } from '../../interface/ReturnProduct'

export interface RetailStoreModel {
    City: string
    StoreName: string
    State: string
    PostalCode: string
    RetailStoreId: string
    Street: string
    CustUniqId: string
    AccountId: string
    PhoneNum: string
    StateCode?: string
    Geofence: string
    CustomerLongitude: string
    CustomerLatitude: string
    visitId?: string
}

let watchId: number = 0
export const stopWatching = () => {
    Geolocation.clearWatch(watchId)
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
                'Orderade: startWatchingUtil',
                `Watch position failed: ${JSON.stringify(error)}`
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

export const getProductQty = (cartData: Partial<ReturnCartItem>[]) => {
    let qty = 0
    cartData?.forEach((item) => {
        if (item.Quantity) {
            qty = qty + parseInt(item.Quantity)
        }
    })
    return qty
}

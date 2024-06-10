/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2024-02-05 14:00:51
 * @LastEditTime: 2024-02-21 13:18:22
 * @LastEditors: Mary Qian
 */

import _ from 'lodash'
import { LatLng } from 'react-native-maps'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { SoupService } from '../../../../../service/SoupService'
import { CommonParam } from '../../../../../../common/CommonParam'
import { storeClassLog } from '../../../../../../common/utils/LogUtils'
import { Log } from '../../../../../../common/enums/Log'
import { GeoFenceProps } from './GeoFenceModal'
import { getLocationNameArrByLocId } from '../EditDeliveryTimeWindowHelper'

export const GeoFenceUpdateSuccessEvent = 'GeoFenceUpdateSuccess'
export const GeoFenceChangeType = 'GeoFence Change'

enum GEO_REQ_TYPE {
    NEW_FENCE = 'New Fence',
    CHANGE_FENCE = 'Change Existing Fence'
}

enum GEO_FENCE_TYPE {
    SALES = 'Sales',
    DELIVERY = 'Delivery'
}

export interface UploadGeoFenceParamsProps {
    Location?: string
    Location0?: string
    COF?: string
    ChangeType?: string
    CustomerAddress?: string
    CustomerCity?: string
    CustomerName?: string
    CustomerState?: string
    RequestedBy?: string
    GeofenceRequestType?: string
    GeofenceRequestFenceType?: string
    Latitude?: number
    Longitude?: number
    GeofenceDesiredResults?: string
}

const getGeoFenceRequestType = (geoFenceData: GeoFenceProps, isSales: boolean) => {
    const oldPin = isSales ? geoFenceData.salesPin : geoFenceData.deliveryPin
    const oldGeoFence = isSales ? geoFenceData.salesGeoFence : geoFenceData.deliveryGeoFence

    if (_.isEmpty(oldPin.longitude) || _.isEmpty(oldPin.latitude) || _.isEmpty(oldGeoFence)) {
        return GEO_REQ_TYPE.NEW_FENCE
    }

    return GEO_REQ_TYPE.CHANGE_FENCE
}

export const getGeoFenceBody = async (
    accountId: string,
    newPin: LatLng,
    comments: string,
    geoFenceData: any,
    isSales: boolean
): Promise<UploadGeoFenceParamsProps> => {
    try {
        const retailStore = await SoupService.retrieveDataFromSoup('RetailStore', {}, [], null, [
            ` WHERE {RetailStore:AccountId}='${accountId}'`
        ])

        if (_.isEmpty(retailStore)) {
            return {}
        }

        const { City, State, Street, Name } = retailStore[0]

        const requestType = getGeoFenceRequestType(geoFenceData, isSales)
        const locationNameArr = await getLocationNameArrByLocId(retailStore[0]['Account.LOC_PROD_ID__c'] as string)

        const fields: UploadGeoFenceParamsProps = {
            Location0: locationNameArr?.data?.records[0]?.SLS_UNIT_NM__c || CommonParam.userLocationName,
            COF: retailStore[0]['Account.CUST_UNIQ_ID_VAL__c'] as string,
            CustomerName: Name as string,
            CustomerAddress: Street as string,
            CustomerState: State as string,
            ChangeType: GeoFenceChangeType,
            CustomerCity: City as string,
            RequestedBy: CommonParam.userName,
            Latitude: newPin.latitude,
            Longitude: newPin.longitude,
            GeofenceDesiredResults: comments,
            GeofenceRequestType: requestType,
            GeofenceRequestFenceType: isSales ? GEO_FENCE_TYPE.SALES : GEO_FENCE_TYPE.DELIVERY
        }

        return fields
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'Geofence-getBody', ErrorUtils.error2String(error))
        return {}
    }
}

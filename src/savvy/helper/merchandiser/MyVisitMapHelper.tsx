/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-07-28 14:58:44
 * @LastEditTime: 2023-10-23 17:37:07
 * @LastEditors: Mary Qian
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import _ from 'lodash'
import { restApexCommonCall } from '../../api/SyncUtils'
import { CommonParam } from '../../../common/CommonParam'
import { Log } from '../../../common/enums/Log'
import LocationService from '../../service/LocationService'
import { SoupService } from '../../service/SoupService'
import NetInfo from '@react-native-community/netinfo'
import { syncDownDeliveryMap } from '../../utils/MerchandiserUtils'
import { todayDateWithTimeZone } from '../../utils/TimeZoneUtils'
import { storeClassLog } from '../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

export const getMerchDeliveryMarker = async (date) => {
    const handleDeliveryData = (data) => {
        const { lstDeliveryUserInformation } = JSON.parse(data)
        lstDeliveryUserInformation.forEach((item) => {
            item.Planned_Date__c = date
            item.AccountPhone = item.accountPhone
            item.VisitorId = item.visitorId
            item.attributes = { type: 'Visit' }
        })
        return lstDeliveryUserInformation
    }
    return new Promise((resolve, reject) => {
        NetInfo.fetch().then(async (state) => {
            if (state.isInternetReachable) {
                syncDownDeliveryMap(date)
                    .then((data: string) => {
                        resolve(handleDeliveryData(data))
                    })
                    .catch((err) => reject(err))
            } else if (date === todayDateWithTimeZone(true)) {
                // if today and no connection use cache
                AsyncStorage.getItem('delivery_manifest')
                    .then((data) => {
                        resolve(handleDeliveryData(data))
                    })
                    .catch((err) => reject(err))
            } else {
                reject(state)
            }
        })
    })
}

export const getMapModalInfo = (markIdList) => {
    return new Promise((resolve) => {
        const visitListArr: string[] = markIdList.map(
            (marker) => marker.id || marker.VisitId || marker.Id || marker.visitId
        )
        const postBody = {
            lstVisitId: _.uniq(visitListArr),
            strLocationId: CommonParam.userLocationId
        }
        Promise.all([
            restApexCommonCall('getUserInformation', 'POST', postBody),
            SoupService.retrieveDataFromSoup(
                'Visit',
                {},
                [
                    'VisitId',
                    'Phone',
                    'MobilePhone',
                    'GPID__c',
                    'BU_ID__c',
                    'FirstName',
                    'LastName',
                    'Uid',
                    'UserStatsId'
                ],
                `
                SELECT {Visit:Id},
                {User:Phone},
                {User:MobilePhone},
                {User:GPID__c},
                {User:BU_ID__c},
                {User:FirstName},
                {User:LastName},
                {User:Id},
                {User_Stats__c:Id}
                FROM {Visit}
                JOIN {User} ON {Visit:VisitorId} = {User:Id}
                LEFT JOIN {User_Stats__c} ON {User_Stats__c:User__c} = {User:Id}
                WHERE {Visit:Id} IN ('${postBody.lstVisitId.join("', '")}')
            `
            )
        ])
            .then((res) => {
                const response = res[0]
                const users = res[1] || []
                const responseData = JSON.parse(response?.data)
                const visitData = [
                    ...(responseData?.lstMerchUserInformation || []),
                    ...(responseData?.lstDeliveryUserInformation || []),
                    ...(responseData?.lstSalesUserInformation || [])
                ]
                visitData.forEach((visit) => {
                    const user = users.find((u) => u.VisitId === visit.visitId)
                    visit.phoneNumber = user?.MobilePhone || null
                    visit.gpId = user?.GPID__c || null
                    visit.buId = user?.BU_ID__c || null
                    visit.firstName = user?.FirstName || null
                    visit.lastName = user?.LastName || null
                    visit.userStatsId = user?.UserStatsId || null
                })
                resolve(visitData)
            })
            .catch((err) => {
                resolve([])
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'MD-getMapModalInfo',
                    `Get getMapModalInfo failed: ${ErrorUtils.error2String(err)}`
                )
            })
    })
}

interface MarkerModal {
    totalMarkers: any
    region: any
}

export const getMapMarkers = (visits) => {
    return new Promise<MarkerModal>((resolve, reject) => {
        const storeVisits = visits.filter((vis) => vis.storeLocation)
        LocationService.getCurrentPosition()
            .then((position: any) => {
                let pos = {
                    latitude: 40.7121001,
                    longitude: -74.0125118
                }
                if (position && position.coords && position.coords.latitude && position.coords.longitude) {
                    pos = position.coords
                }
                const bounding = LocationService.getBoundingBox(pos, storeVisits)
                resolve({
                    totalMarkers: bounding.tmpMarkers,
                    region: bounding.initialRegion
                })
            })
            .catch((err) => {
                reject(err)
                storeClassLog(
                    Log.MOBILE_INFO,
                    'MD-getMapMarkers',
                    `Get merchandiser map markers failed: ${ErrorUtils.error2String(err)}`
                )
            })
    })
}

import { useEffect, useState } from 'react'
import { SoupService } from '../service/SoupService'
import { restApexCommonCall, restDataCommonCall } from '../api/SyncUtils'
import _ from 'lodash'
import { Log } from '../../common/enums/Log'
import { storeClassLog } from '../../common/utils/LogUtils'
import { CommonParam } from '../../common/CommonParam'
import { CommonApi } from '../../common/api/CommonApi'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { syncDownObj } from '../../common/utils/CommonUtils'

const LATITUDE_DELTA = 0.000922 * 1.5
const LONGITUDE_DELTA = 0.000421 * 1.5
const SALES_AREA = '001'
const DELIVERY_AREA = '002'

export const useGeofenceData = (geofenceDataString: string, retailStore: any) => {
    let latitude = retailStore['Account.ShippingLatitude']
    let longitude = retailStore['Account.ShippingLongitude']

    if (!_.isEmpty(retailStore['Account.ShippingAddress'])) {
        try {
            const shippingAddress = JSON.parse(retailStore['Account.ShippingAddress'])
            if (shippingAddress.latitude && shippingAddress.longitude) {
                latitude = shippingAddress.latitude
                longitude = shippingAddress.longitude
            }
        } catch (error) {
            storeClassLog(Log.MOBILE_WARN, 'useGeofenceData - get location', ErrorUtils.error2String(error))
        }
    }
    const [initialRegion, setInitialRegion] = useState({
        latitude: null,
        longitude: null,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
    })
    const [polygonData, setPolygonData] = useState([])
    const [initialDeliveryRegion, setInitialDeliveryRegion] = useState({
        latitude: null,
        longitude: null,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
    })
    const [deliveryGeoFence, setDeliveryGeoFence] = useState([])
    useEffect(() => {
        try {
            if (geofenceDataString) {
                const { Geofences } = JSON.parse(geofenceDataString)

                const salesData = Geofences.filter((geofence: any) => geofence.Area === SALES_AREA) || []
                const deliveryData = Geofences.filter((geofence: any) => geofence.Area === DELIVERY_AREA) || []

                const processedData =
                    salesData[0]?.Geolocations?.map((item) => {
                        return {
                            latitude: item.Latitude,
                            longitude: item.Longitude
                        }
                    }) || []

                const deliveryPoints =
                    deliveryData[0]?.Geolocations?.map((item) => {
                        return {
                            latitude: item.Latitude,
                            longitude: item.Longitude
                        }
                    }) || []
                const tempInitialRegion = {
                    ...processedData.shift(),
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA
                }
                const deliveryRegion = {
                    ...deliveryPoints.shift(),
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA
                }
                setInitialRegion(tempInitialRegion)
                setPolygonData(processedData)
                setInitialDeliveryRegion(deliveryRegion)
                setDeliveryGeoFence(deliveryPoints)
            } else if (latitude && longitude) {
                const tempInitialRegion = {
                    latitude,
                    longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA
                }
                const deliveryRegion = {
                    latitude,
                    longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA
                }
                setInitialRegion(tempInitialRegion)
                setInitialDeliveryRegion(deliveryRegion)
            }
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'useGeofenceData', `useGeofenceData: ` + ErrorUtils.error2String(e))
        }
    }, [geofenceDataString, latitude, longitude])
    return {
        initialRegion,
        polygonData,
        initialDeliveryRegion,
        deliveryGeoFence
    }
}

export const useCustomerDistributionPoints = (accountId: string, refreshTimes: number) => {
    const [distributionPoints, setDistributionPoints] = useState([])
    useEffect(() => {
        if (accountId) {
            SoupService.retrieveDataFromSoup(
                'Customer_to_Route__c',
                {},
                [
                    'Id',
                    'SLS_MTHD_NM__c',
                    'PROD_GRP_NM__c',
                    'DLVRY_MTHD_NM__c',
                    'DELY_DAYS__c',
                    'Route_Text__c',
                    'Route__c',
                    'Lead__c',
                    'RecordTypeId',
                    'CUST_RTE_FREQ_CDE__c',
                    'SLS_MTHD_CDE__c',
                    'DELY_MTHD_CDE__c',
                    'PROD_GRP_CDE__c',
                    'Route__r.GTMU_RTE_ID__c',
                    'Route__r.RTE_TYP_GRP_NM__c',
                    'ORD_DAYS__c',
                    'Lead_DP_Route_Disp_NM__c',
                    'Pending__c',
                    'RecordType.Name',
                    'updated_dp__c',
                    'Request__r.status__c',
                    'User__r.Name',
                    'Route__r.RTE_TYP_NM__c'
                ],
                'SELECT {Customer_to_Route__c:Id},{Customer_to_Route__c:SLS_MTHD_NM__c}, ' +
                    '{Customer_to_Route__c:PROD_GRP_NM__c}, {Customer_to_Route__c:DLVRY_MTHD_NM__c}, ' +
                    '{Customer_to_Route__c:DELY_DAYS__c}, {Customer_to_Route__c:Route_Text__c},{Customer_to_Route__c:Route__c},' +
                    '{Customer_to_Route__c:Lead__c},{Customer_to_Route__c:RecordTypeId},{Customer_to_Route__c:CUST_RTE_FREQ_CDE__c},' +
                    '{Customer_to_Route__c:SLS_MTHD_CDE__c},{Customer_to_Route__c:DELY_MTHD_CDE__c},' +
                    '{Customer_to_Route__c:PROD_GRP_CDE__c},{Customer_to_Route__c:Route__r.GTMU_RTE_ID__c},' +
                    '{Customer_to_Route__c:Route__r.RTE_TYP_GRP_NM__c},' +
                    '{Customer_to_Route__c:ORD_DAYS__c},{Customer_to_Route__c:Lead_DP_Route_Disp_NM__c},' +
                    '{Customer_to_Route__c:Pending__c},{Customer_to_Route__c:RecordType.Name},{Customer_to_Route__c:updated_dp__c},' +
                    '{Customer_to_Route__c:Request__r.status__c},{Employee_To_Route__c:User__r.Name},' +
                    '{Customer_to_Route__c:Route__r.RTE_TYP_NM__c}, {Customer_to_Route__c:_soupEntryId},' +
                    '{Customer_to_Route__c:__local__},{Customer_to_Route__c:__locally_created__},' +
                    '{Customer_to_Route__c:__locally_updated__}, {Customer_to_Route__c:__locally_deleted__} ' +
                    'FROM {Customer_to_Route__c} ' +
                    'LEFT JOIN (SELECT * FROM {Employee_To_Route__c} WHERE ' +
                    '{Employee_To_Route__c:User__r.Name} IS NOT NULL AND {Employee_To_Route__c:Active_Flag__c} IS TRUE AND ' +
                    "{Employee_To_Route__c:Status__c} = 'Processed' GROUP BY {Employee_To_Route__c:Route__c}) " +
                    'ON {Employee_To_Route__c:Route__c} = {Customer_to_Route__c:Route__c} ' +
                    `WHERE {Customer_to_Route__c:Customer__c} = '${accountId}' ` +
                    'AND {Customer_to_Route__c:ACTV_FLG__c} IS TRUE AND {Customer_to_Route__c:Merch_Flag__c} IS FALSE ' +
                    "AND ({Customer_to_Route__c:RecordType.Name} !=  'Requested Customer DP' OR " +
                    "({Customer_to_Route__c:RecordType.Name} =  'Requested Customer DP' OR ({Customer_to_Route__c:Request__r.status__c} IS NOT NULL " +
                    "AND {Customer_to_Route__c:SLS_MTHD_NM__c} = 'FSV')))" +
                    'ORDER BY {Customer_to_Route__c:Pending__c} DESC'
            ).then((res) => {
                const sortedRes = _.sortBy(res, (item) => {
                    return item['RecordType.Name'] !== 'Requested Customer DP'
                })
                sortedRes.forEach((v) => {
                    v.Pending__c = v.Pending__c === '1'
                })
                const filteredRes = sortedRes.filter((item) => {
                    return _.isEmpty(item.updated_dp__c)
                })
                setDistributionPoints(filteredRes)
            })
        }
    }, [accountId, refreshTimes])
    return distributionPoints
}

export const useLeadTileForCustomerProfile = (accountId: string) => {
    const [lead, setLead] = useState({ Id: null, Lead_Type_c__c: null, original_customer_c__c: null })
    useEffect(() => {
        if (accountId) {
            restDataCommonCall(
                'query/?q=SELECT Id, Pre_qualified_c__c, Company__c, Street__c,City__c, PostalCode__c,' +
                    ' State__c, Last_Task_Modified_Date_c__c, Tier_c__c, Call_Counter_c__c, Phone__c, Contact_Made_Counter_c__c, Lead_Type_c__c, original_customer_c__c, Status__c ' +
                    `FROM Lead__x WHERE Customer_Spoke_c__c='${accountId}' `,
                'GET'
            ).then((res) => {
                setLead(res?.data?.records[0])
            })
        }
    }, [accountId])
    return lead
}

export const useCustomerProfileRouteSalesGeo = (locProdId: string) => {
    const [data, setData] = useState({
        region: null,
        market: null,
        location: null
    })
    useEffect(() => {
        if (locProdId) {
            restDataCommonCall(
                'query/?q=SELECT Id, Parent_Node__r.Parent_Node__r.SLS_UNIT_NM__c,' +
                    ' Parent_Node__r.SLS_UNIT_NM__c, SLS_UNIT_NM__c FROM Route_Sales_Geo__c ' +
                    `WHERE SLS_UNIT_ID__c = '${locProdId}'`,
                'GET'
            ).then((res) => {
                const routeSalesData = res?.data?.records[0]
                setData({
                    region: routeSalesData?.Parent_Node__r?.Parent_Node__r?.SLS_UNIT_NM__c,
                    market: routeSalesData?.Parent_Node__r?.SLS_UNIT_NM__c,
                    location: routeSalesData?.SLS_UNIT_NM__c
                })
            })
        }
    }, [locProdId])

    return data
}

export const useCustomerTileForCustomerProfile = (originalCustomerId: string) => {
    const [customer, setCustomer] = useState(null)
    useEffect(() => {
        if (originalCustomerId) {
            restDataCommonCall(
                'query/?q=SELECT Id,Account.change_initiated__c,Name,Account.Phone,' +
                    'Account.Merchandising_Delivery_Days__c,Account.Merchandising_Order_Days__c,Account.IsOTSCustomer__c,' +
                    'City,AccountId,Country,Latitude,Longitude,PostalCode,State,Street,Customer_Latitude__c,' +
                    'Customer_Longitude__c,LOC_PROD_ID__c,Account.CUST_UNIQ_ID_VAL__c,' +
                    'Account.Go_Kart_Flag__c,Account.Delta_Revenue_Percentage__c ' +
                    `FROM RetailStore Where Account.Id='${originalCustomerId}'`,
                'GET'
            ).then((res) => {
                setCustomer(res?.data?.records[0])
            })
        }
    }, [originalCustomerId])
    return customer
}

export const usePriceGroupWithRequest = (retailStore: any) => {
    const [priceGroup, setPriceGroup] = useState([])
    const getPriceGroupWithRequest = () => {
        restApexCommonCall(
            `${CommonApi.PBNA_MOBILE_API_CUSTOMER_PRICE_GROUP}${retailStore['Account.CUST_UNIQ_ID_VAL__c']}`,
            'GET'
        )
            .then((res) => {
                if (!_.isEmpty(res?.data)) {
                    setPriceGroup(JSON.parse(res?.data))
                }
            })
            .catch((err) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'usePriceGroupWithRequest',
                    `${CommonParam.userId} failed:${ErrorUtils.error2String(err)}`
                )
            })
    }
    useEffect(() => {
        if (retailStore['Account.CUST_UNIQ_ID_VAL__c']) {
            getPriceGroupWithRequest()
        }
    }, [retailStore['Account.CUST_UNIQ_ID_VAL__c']])
    return priceGroup
}

export const useAddedPriceGroup = (retailStoreId: string, refreshFlag: number) => {
    const [priceGroupList, setPriceGroupList] = useState([])
    useEffect(() => {
        if (retailStoreId) {
            syncDownObj(
                'Customer_Deal__c',
                `SELECT Id,Target_Id__c,Target_Name__c,Status__c,Type__c,Effective_date__c,End_date__c ` +
                    `FROM Customer_Deal__c WHERE Type__c = 'prc_grp_request' ` +
                    `AND Cust_Id__c ='${retailStoreId}' AND Is_removed__c = false ` +
                    `AND (Status__c = 'Submitted' OR Status__c = 'PRE') ORDER BY CreatedDate`,
                false
            )
                .then((res: any) => {
                    setPriceGroupList(res?.data || [])
                })
                .catch((err) => {
                    storeClassLog(Log.MOBILE_ERROR, 'useAddedPriceGroup', ErrorUtils.error2String(err))
                })
        }
    }, [retailStoreId, refreshFlag])
    return priceGroupList
}

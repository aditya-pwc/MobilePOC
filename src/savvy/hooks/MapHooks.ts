/* eslint-disable no-secrets/no-secrets */
/**
 * @description Hooks for the explore screen.
 * @author Shangmin Dou
 */
import { useEffect, useState } from 'react'
import LeadQueries from '../queries/LeadQueries'
import { SoupService } from '../service/SoupService'
import LocationService, { handleRandomOffset, wgs84togcj02 } from '../service/LocationService'
import CompassHeading from 'react-native-compass-heading'
import Geolocation from 'react-native-geolocation-service'
import { syncDownObj } from '../api/SyncUtils'
import _ from 'lodash'
import { Dimensions } from 'react-native'
import { customDelay } from '../utils/CommonUtils'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { isPersonaCRMBusinessAdmin, isPersonaKAM } from '../../common/enums/Persona'
import {
    getFilteredSortedCustomerFromBackend,
    getFilteredSortedLeadFromBackend,
    retrieveCRMFilteredSortedLead,
    sortCRMMapLead
} from '../utils/LeadCustomerFilterUtils'
import { getIdClause } from '../components/manager/helper/MerchManagerHelper'
import { Log } from '../../common/enums/Log'
import { CommonParam } from '../../common/CommonParam'
import { getStringValue } from '../utils/LandingUtils'
import { replaceQuotesToWildcard } from '../utils/RepUtils'
import { storeClassLog } from '../../common/utils/LogUtils'
import FilterSortQueries from '../queries/FilterSortQueries'
import { FeatureToggle } from '../../common/enums/FeatureToggleName'

export const searchLeadsFromBackend = async (
    searchV: string,
    region: { top: number; right: number; bottom: number; left: number }
) => {
    const searchValue = replaceQuotesToWildcard(searchV)
    const searchQuery =
        'SELECT Id,Action_Required_c__c,My_Lead_Action_Required_c__c,Deferred_Resume_Date_c__c,ExternalId,' +
        'Pre_qualified_c__c,PD_Contact_Made_Counter_c__c,PD_Call_Counter_c__c,Contact_Made_Counter_c__c,' +
        'Last_Task_Modified_Date_c__c,Tier_c__c,Call_Counter_c__c,Company__c,City__c,Name__c,Phone__c,' +
        'Street__c,State__c,PostalCode__c,BUSN_SGMNTTN_LVL_2_NM_c__c,COF_Rejected_c__c,COF_Triggered_c__c,' +
        'Status__c,Lead_Sub_Status_c__c,Lead_Longitude_c__c,Lead_Latitude_c__c ' +
        'FROM Lead__x WHERE Lead_Longitude_c__c!=null AND Lead_Latitude_c__c!=null AND ' +
        `Lead_Latitude_c__c<${region.top} AND Lead_Latitude_c__c>${region.bottom} AND ` +
        `Lead_Longitude_c__c>${region.left} AND Lead_Longitude_c__c<${region.right} AND ` +
        "(Status__c='Open' OR (Status__c='Negotiate' AND Lead_Type_c__c!='Change of Ownership' ) OR Status__c='No Sale' ) AND " +
        '(Is_Removed_c__c=false OR Pre_qualified_c__c=true) AND ' +
        `(Company__c LIKE '%${searchValue}%' OR City__c LIKE '%${searchValue}%' OR Phone__c LIKE '%${searchValue}%' ` +
        `OR Street__c LIKE '%${searchValue}%' OR State__c LIKE '%${searchValue}%' OR PostalCode__c LIKE '%${searchValue}%')` +
        ' ORDER BY Pre_qualified_c__c DESC NULLS LAST,Tier_c__c ASC NULLS LAST'
    const res = await syncDownObj('Lead__x', encodeURIComponent(searchQuery), false, false)
    return res?.data || []
}
export const isMarkerInViewBox = (lat, long, viewRegion) => {
    if (viewRegion.left > viewRegion.right) {
        // If the view box crosses the 180 degree longitude
        return (
            ((viewRegion.left < long && long < 180) || (long > -180 && long < viewRegion.right)) &&
            lat <= viewRegion.top &&
            lat >= viewRegion.bottom
        )
    }
    return long <= viewRegion.right && long >= viewRegion.left && lat <= viewRegion.top && lat >= viewRegion.bottom
}

export const updateCustomerDataFields = (data: any) => {
    data.forEach((v: any) => {
        v['Account.change_initiated__c'] = v.Account.change_initiated__c
        v['Account.Phone'] = v.Account.Phone
        v['Account.CUST_UNIQ_ID_VAL__c'] = v.Account.CUST_UNIQ_ID_VAL__c
        v.IsCDACustomer__c = v.Account.IsCDACustomer__c
        v['Account.CDA_Status__c'] = v.Account.CDA_Status__c
        v['Account.CDA_Medal__c'] = v.Account.CDA_Medal__c
        v['Account.CDA_NY_Status__c'] = v.Account.CDA_NY_Status__c
        v['Account.IsCDACustomer__c'] = v.Account.IsCDACustomer__c
        v['Account.IsOTSCustomer__c'] = v.Account.IsOTSCustomer__c
        v['Account.Delta_Revenue_Percentage__c'] = v.Account.Delta_Revenue_Percentage__c
    })
    return data
}

export const searchCustomersFromBackend = async (
    searchV: string,
    region: { top: number; right: number; bottom: number; left: number }
) => {
    const searchValue = replaceQuotesToWildcard(searchV)
    const searchQuery =
        'SELECT Id,Name,Street,State,StateCode,CreatedDate,Account.IsOTSCustomer__c,' +
        'Account.IsCDACustomer__c,Account.CDA_Status__c,Account.CDA_Medal__c,' +
        'Country,PostalCode,City,Account.Phone,Customer_Longitude__c,Customer_Latitude__c,Account.change_initiated__c,' +
        'Account.CUST_UNIQ_ID_VAL__c,Account.Delta_Revenue_Percentage__c,AccountId ' +
        'FROM RetailStore WHERE Account.IS_ACTIVE__c = TRUE AND Customer_Longitude__c!=null AND Customer_Latitude__c!=null AND ' +
        `Customer_Latitude__c<${region.top} AND Customer_Latitude__c>${region.bottom} AND ` +
        `Customer_Longitude__c>${region.left} AND Customer_Longitude__c<${region.right} AND ` +
        `(Name LIKE '%${searchValue}%' OR City LIKE '%${searchValue}%' OR Account.Phone LIKE '%${searchValue}%' ` +
        `OR Account.CUST_UNIQ_ID_VAL__c LIKE '%${searchValue}%' OR Account.RTLR_STOR_NUM__c LIKE '%${searchValue}%' OR Country LIKE '%${searchValue}%' ` +
        `OR Street LIKE '%${searchValue}%' OR State LIKE '%${searchValue}%' OR PostalCode LIKE '%${searchValue}%') ORDER BY Name`
    const res = await syncDownObj('RetailStore', encodeURIComponent(searchQuery), false)
    return updateCustomerDataFields(res?.data) || []
}

export const useLeadMarkers = (
    isFocused: boolean,
    searchValue: string,
    filterQuery: string,
    setShowLoading: any,
    showLeads: boolean,
    searchRegion: any
) => {
    const [leadMarkers, setLeadMarkers] = useState([])
    const [leadMarkersShownOnMap, setLeadMarkersShownOnMap] = useState<any[]>([])
    const [leadRefreshTimes, setLeadRefreshTimes] = useState(0)
    useEffect(() => {
        if (isFocused && !isPersonaKAM()) {
            if (searchValue.length >= 3) {
                setShowLoading(true)
                Instrumentation.startTimer('Search Leads in Map')
                searchLeadsFromBackend(searchValue, searchRegion)
                    .then((data) => {
                        setLeadMarkers(data)
                        setLeadMarkersShownOnMap(handleRandomOffset(data, 'Lead_Longitude_c__c', 'Lead_Latitude_c__c'))
                        setShowLoading(false)
                        Instrumentation.stopTimer('Search Leads in Map')
                    })
                    .catch((e) => {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'Rep-SearchLeadsInExplore',
                            'Search Leads In Explore Error:' + getStringValue(e)
                        )
                        setLeadMarkers([])
                        setLeadMarkersShownOnMap([])
                        setShowLoading(false)
                        Instrumentation.stopTimer('Search Leads in Map')
                    })
            } else {
                if (showLeads) {
                    setShowLoading(true)
                    customDelay(0).then(() => {
                        if (filterQuery) {
                            Instrumentation.startTimer('Filter Leads in Map')
                            if (isPersonaCRMBusinessAdmin()) {
                                getFilteredSortedLeadFromBackend(filterQuery)
                                    .then((v) => {
                                        const idList = JSON.parse(v.data)
                                        retrieveCRMFilteredSortedLead(idList).then((res) => {
                                            const temp = sortCRMMapLead(idList, res)
                                            setLeadMarkers(temp)
                                            setLeadMarkersShownOnMap(
                                                handleRandomOffset(temp, 'Lead_Longitude_c__c', 'Lead_Latitude_c__c')
                                            )
                                            setShowLoading(false)
                                            Instrumentation.stopTimer('Filter Leads in Map')
                                        })
                                    })
                                    .catch((e) => {
                                        storeClassLog(
                                            Log.MOBILE_ERROR,
                                            'Rep-FilterLeadsInExploreFromBackend',
                                            'Filter Leads In Explore From Backend Error:' + getStringValue(e)
                                        )
                                        setLeadMarkers([])
                                        setLeadMarkersShownOnMap([])
                                        setShowLoading(false)
                                        Instrumentation.stopTimer('Filter Leads in Map')
                                    })
                            } else {
                                SoupService.retrieveDataFromSoup(
                                    'Lead__x',
                                    {},
                                    FilterSortQueries.filterMapLeadsQuery.f,
                                    filterQuery
                                )
                                    .then((res) => {
                                        setLeadMarkers(res)
                                        setLeadMarkersShownOnMap(
                                            handleRandomOffset(res, 'Lead_Longitude_c__c', 'Lead_Latitude_c__c')
                                        )
                                        setShowLoading(false)
                                        Instrumentation.stopTimer('Filter Leads in Map')
                                    })
                                    .catch((e) => {
                                        storeClassLog(
                                            Log.MOBILE_ERROR,
                                            'Rep-FilterLeadsInExplore',
                                            'Filter Leads In Explore Error:' + getStringValue(e)
                                        )
                                        setLeadMarkers([])
                                        setShowLoading(false)
                                    })
                            }
                        } else {
                            SoupService.retrieveDataFromSoup(
                                'Lead__x',
                                {},
                                LeadQueries.getLeadsForMapQuery.f,
                                LeadQueries.getLeadsForMapQuery.q + LeadQueries.getLeadsForMapQuery.s
                            )
                                .then((res) => {
                                    setLeadMarkers(res)
                                    setLeadMarkersShownOnMap(
                                        handleRandomOffset(res, 'Lead_Longitude_c__c', 'Lead_Latitude_c__c')
                                    )
                                    setShowLoading(false)
                                })
                                .catch((e) => {
                                    storeClassLog(
                                        Log.MOBILE_ERROR,
                                        'Rep-RetrieveLeadsInExplore',
                                        'Retrieve Leads In Explore Error:' + getStringValue(e)
                                    )
                                    setLeadMarkers([])
                                    setShowLoading(false)
                                })
                        }
                    })
                } else if (!showLeads) {
                    setLeadMarkers([])
                    setLeadMarkersShownOnMap([])
                }
            }
        }
    }, [isFocused, leadRefreshTimes, searchValue, filterQuery, showLeads, searchRegion])
    return { leadMarkers, leadMarkersShownOnMap, setLeadRefreshTimes }
}

interface Region {
    latitude: number
    longitude: number
    latitudeDelta: number
    longitudeDelta: number
}

interface RegionParams {
    top: number
    bottom: number
    left: number
    right: number
}

export const useCustomerMarkers = (
    isFocused: boolean,
    searchValue: string,
    filterQuery: string,
    setShowLoading: any,
    showCustomers: boolean,
    searchRegion: RegionParams,
    initRegion: Region,
    isFirstTime: boolean
) => {
    const [customerMarkers, setCustomerMarkers] = useState([])
    const [customerMarkersShownOnMap, setCustomerMarkersShownOnMap] = useState<any[]>([])
    const [customerRefreshTimes, setCustomerRefreshTimes] = useState(0)

    /**
     * get all customers with latitude and longitude for Map View
     * @returns Array
     */
    const getAllCustomers = (region?: RegionParams, filterQuery?: string) => {
        return new Promise((resolve, reject) => {
            if (isPersonaKAM() && customerRefreshTimes === 0) {
                const splicedFilterQuery = filterQuery ? `${filterQuery} ` : ''
                const splicedRegionQuery = region
                    ? `AND Customer_Latitude__c<${region.top} AND Customer_Latitude__c>${region.bottom} AND Customer_Longitude__c>${region.left} AND Customer_Longitude__c<${region.right} `
                    : ''

                // if no Search or Filter, get all Customers
                // else: get KAM user wired customers
                const wiredGroupQuery = !filterQuery
                    ? `AND AccountId IN (SELECT AccountId FROM AccountTeamMember WHERE UserId = '${CommonParam.userId}' AND kam_active_flag__c = true AND If_Populated_By_KAM__c = true) `
                    : ''
                const query =
                    'SELECT Id, Name, Street, State, StateCode, Country, PostalCode, City, CreatedDate,' +
                    'Account.Phone, Account.IsOTSCustomer__c, Account.IsCDACustomer__c, ' +
                    'Account.CUST_UNIQ_ID_VAL__c, Account.Delta_Revenue_Percentage__c, Account.change_initiated__c, Account.BUSN_SGMNTTN_LVL_3_NM__c, ' +
                    'Customer_Longitude__c, Customer_Latitude__c, AccountId ' +
                    'FROM RetailStore ' +
                    'WHERE Account.IS_ACTIVE__c = true ' +
                    'AND Customer_Longitude__c != NULL AND Customer_Latitude__c != NULL ' +
                    `${wiredGroupQuery}` +
                    `${splicedFilterQuery}` +
                    `${splicedRegionQuery}` +
                    'ORDER BY Name ASC NULLS LAST'

                syncDownObj('RetailStore', encodeURIComponent(query), false)
                    .then((res) => {
                        resolve(updateCustomerDataFields(res?.data) || [])
                    })
                    .catch(async (e) => {
                        reject(e)
                        await storeClassLog(
                            Log.MOBILE_ERROR,
                            'KAM-MAP-Customer-Online',
                            `Get customer online failed: ${getStringValue(e)}`
                        )
                    })
            } else {
                SoupService.retrieveDataFromSoup(
                    'RetailStore',
                    {},
                    [
                        'Id',
                        'Account.IsOTSCustomer__c',
                        'Account.IsCDACustomer__c',
                        'Name',
                        'Street',
                        'State',
                        'StateCode',
                        'Country',
                        'PostalCode',
                        'City',
                        'CreatedDate',
                        'Account.Phone',
                        'Customer_Longitude__c',
                        'Customer_Latitude__c',
                        'Account.CUST_UNIQ_ID_VAL__c',
                        'Account.Delta_Revenue_Percentage__c',
                        'Account.change_initiated__c',
                        'AccountId'
                    ],
                    'SELECT {RetailStore:Id},' +
                        '{RetailStore:Account.IsOTSCustomer__c},' +
                        '{RetailStore:Account.IsCDACustomer__c},' +
                        '{RetailStore:Name},' +
                        '{RetailStore:Street},' +
                        '{RetailStore:State},' +
                        '{RetailStore:StateCode},' +
                        '{RetailStore:Country},' +
                        '{RetailStore:PostalCode},' +
                        '{RetailStore:City},' +
                        '{RetailStore:CreatedDate},' +
                        '{RetailStore:Account.Phone},' +
                        '{RetailStore:Customer_Longitude__c},' +
                        '{RetailStore:Customer_Latitude__c},' +
                        '{RetailStore:Account.CUST_UNIQ_ID_VAL__c},' +
                        '{RetailStore:Account.Delta_Revenue_Percentage__c},' +
                        '{RetailStore:Account.change_initiated__c},' +
                        '{RetailStore:AccountId} ' +
                        'FROM {RetailStore} ' +
                        'WHERE {RetailStore:Customer_Longitude__c} IS NOT NULL AND {RetailStore:Customer_Latitude__c} IS NOT NULL ' +
                        'ORDER BY {RetailStore:Name} COLLATE NOCASE ASC NULLS LAST'
                )
                    .then((res) => {
                        resolve(res)
                    })
                    .catch(async (e) => {
                        await storeClassLog(
                            Log.MOBILE_ERROR,
                            'Rep-RetrieveCustomerInExplore',
                            'Retrieve Customer In Explore Error:' + getStringValue(e)
                        )
                    })
            }
        })
    }

    /**
     * Extract common data and error handler
     */

    const handleData = (data: any, stopTimerString: string) => {
        setCustomerMarkers(data)
        setCustomerMarkersShownOnMap(handleRandomOffset(data, 'Customer_Longitude__c', 'Customer_Latitude__c'))
        setShowLoading(false)
        Instrumentation.stopTimer(stopTimerString)
    }

    const handleError = async (stopTimerString: string, e?: any, specificErrorPlace?: string) => {
        setCustomerMarkers([])
        setCustomerMarkersShownOnMap([])
        setShowLoading(false)
        Instrumentation.stopTimer(stopTimerString)
        e &&
            (await storeClassLog(
                Log.MOBILE_ERROR,
                `${CommonParam.PERSONA__c}-GetCustomersInExplore-${specificErrorPlace}`,
                'Get Customers In Explore Error:' + getStringValue(e)
            ))
    }

    useEffect(() => {
        if (isFocused) {
            let regionParams: RegionParams
            if (isFirstTime && initRegion) {
                const right = initRegion?.longitude + initRegion?.longitudeDelta / 2
                const left = initRegion?.longitude - initRegion?.longitudeDelta / 2
                const top = initRegion?.latitude + initRegion?.latitudeDelta / 2
                const bottom = initRegion?.latitude - initRegion?.latitudeDelta / 2
                regionParams = {
                    right: right,
                    left: left,
                    top: top,
                    bottom: bottom
                }
            } else {
                regionParams = searchRegion
            }
            if (searchValue.length >= 3) {
                setShowLoading(true)
                const INSTRUMENTATION_TIMER_STRING_SEARCH = 'Search Customers in Map'
                Instrumentation.startTimer(INSTRUMENTATION_TIMER_STRING_SEARCH)

                searchCustomersFromBackend(searchValue, regionParams)
                    .then((data) => {
                        handleData(data, INSTRUMENTATION_TIMER_STRING_SEARCH)
                    })
                    .catch(async (e) => {
                        await handleError(INSTRUMENTATION_TIMER_STRING_SEARCH, e, 'searchCustomersFromBackend')
                    })
            } else {
                if (showCustomers) {
                    setShowLoading(true)
                    customDelay(0).then(() => {
                        if (filterQuery) {
                            const INSTRUMENTATION_TIMER_STRING_FILTER = 'Filter Customers in Map'
                            Instrumentation.startTimer(INSTRUMENTATION_TIMER_STRING_FILTER)
                            if (isPersonaCRMBusinessAdmin()) {
                                getFilteredSortedCustomerFromBackend(filterQuery)
                                    .then((v) => {
                                        const data = JSON.parse(v.data)
                                        handleData(data, INSTRUMENTATION_TIMER_STRING_FILTER)
                                    })
                                    .catch(async (e) => {
                                        await handleError(
                                            INSTRUMENTATION_TIMER_STRING_FILTER,
                                            e,
                                            'getFilteredSortedCustomerFromBackend'
                                        )
                                    })
                            } else if (isPersonaKAM()) {
                                getAllCustomers(regionParams, filterQuery)
                                    .then((res: any) => {
                                        handleData(res, INSTRUMENTATION_TIMER_STRING_FILTER)
                                    })
                                    .catch(async () => {
                                        await handleError(INSTRUMENTATION_TIMER_STRING_FILTER)
                                    })
                            } else {
                                SoupService.retrieveDataFromSoup(
                                    'RetailStore',
                                    {},
                                    [
                                        'Id',
                                        'Account.IsOTSCustomer__c',
                                        'Account.IsCDACustomer__c',
                                        'Account.change_initiated__c',
                                        'Name',
                                        'Street',
                                        'State',
                                        'StateCode',
                                        'AccountId',
                                        'Country',
                                        'PostalCode',
                                        'City',
                                        'CreatedDate',
                                        'Account.Phone',
                                        'Customer_Longitude__c',
                                        'Customer_Latitude__c',
                                        'Account.PEPSI_COLA_NATNL_ACCT__c',
                                        'Account.CUST_LVL__c',
                                        'Account.CUST_STRT_DT__c',
                                        'Account.CUST_UNIQ_ID_VAL__c',
                                        'Account.Delta_Revenue_Percentage__c',
                                        'ActualDeliveryDate',
                                        'Distance',
                                        'CallDate',
                                        'SalesVisitDate'
                                    ],
                                    filterQuery
                                )
                                    .then((res) => {
                                        handleData(res, INSTRUMENTATION_TIMER_STRING_FILTER)
                                    })
                                    .catch(async (e) => {
                                        await handleError(
                                            INSTRUMENTATION_TIMER_STRING_FILTER,
                                            e,
                                            'retrieveDataFromSoupWithFilter'
                                        )
                                    })
                            }
                        } else {
                            const INSTRUMENTATION_TIMER_STRING = 'Get Customers Online in Map'
                            Instrumentation.startTimer(INSTRUMENTATION_TIMER_STRING)

                            getAllCustomers(regionParams)
                                .then((res: any) => {
                                    handleData(res, INSTRUMENTATION_TIMER_STRING)
                                })
                                .catch(async () => {
                                    await handleError(INSTRUMENTATION_TIMER_STRING)
                                })
                        }
                    })
                } else if (!showCustomers) {
                    setCustomerMarkers([])
                    setCustomerMarkersShownOnMap([])
                }
            }
        }
    }, [isFocused, customerRefreshTimes, searchValue, filterQuery, showCustomers, searchRegion, initRegion])
    return { customerMarkers, customerMarkersShownOnMap, setCustomerRefreshTimes }
}

interface CurrentPosition {
    latitude: number
    longitude: number
}

export const useInitLocation = (isFocused: boolean) => {
    const [position, setPosition] = useState<CurrentPosition>()
    useEffect(() => {
        if (isFocused) {
            LocationService.getCurrentPosition().then((res) => {
                setPosition({
                    latitude: res.coords.latitude,
                    longitude: res.coords.longitude
                })
            })
        }
    }, [isFocused])
    return position
}

export const useInitRegion = (isFocused: boolean) => {
    const [initRegion, setInitRegion] = useState(null)
    useEffect(() => {
        if (isFocused) {
            LocationService.getCurrentPosition().then((res) => {
                setInitRegion({
                    latitude: res.coords.latitude,
                    longitude: res.coords.longitude,
                    latitudeDelta: 0.0722,
                    longitudeDelta: 0.0722 * (Dimensions.get('window').width / Dimensions.get('window').height)
                })
            })
        }
    }, [isFocused])
    return initRegion
}

export const useUserCompassDirection = (map) => {
    const [rotation, setRotation] = useState(0)
    const [mode, setMode] = useState(false)
    const [regionChanged, setRegionChanged] = useState(false)
    const setPivot = async ({ heading }) => {
        const info = await map.getCamera()
        if (mode) {
            setRotation(0)
            map.setCamera({ ...info, heading })
        } else {
            setRotation(heading - info.heading)
        }
    }
    useEffect(() => {
        if (map) {
            CompassHeading.start(1, _.debounce(setPivot, 0))
            return () => {
                CompassHeading.stop()
            }
        }
    }, [map, mode])
    return { rotation, mode, setMode, regionChanged, setRegionChanged }
}

export const useUserCurrentPosition = () => {
    const [geolocation, setGeolocation] = useState({
        latitude: 0,
        longitude: 0,
        altitude: 0,
        heading: 0,
        speed: 0
    })
    useEffect(() => {
        const watchId = Geolocation.watchPosition(
            (position) => {
                const positionProcessed = wgs84togcj02(position.coords.longitude, position.coords.latitude)
                const positionToSet = {
                    ...position.coords,
                    latitude: positionProcessed[1],
                    longitude: positionProcessed[0]
                }
                setGeolocation(positionToSet)
            },
            () => {},
            {
                enableHighAccuracy: true,
                distanceFilter: 0.1,
                interval: 10,
                fastestInterval: 10
            }
        )

        return () => {
            Geolocation.clearWatch(watchId)
        }
    }, [])
    return geolocation
}

export const useUserPositionDotData = (map) => {
    return {
        rotation: useUserCompassDirection(map),
        geolocation: useUserCurrentPosition()
    }
}

// CDA Map Hooks

const searchCDACustomersFromBackend = async (searchV, region) => {
    const searchValue = encodeURIComponent(replaceQuotesToWildcard(searchV))
    const searchQuery =
        'SELECT+Id,Name,Street,State,StateCode,' +
        'Account.IsCDACustomer__c,Account.IsOTSCustomer__c,Account.CDA_Status__c,Account.CDA_Medal__c,Account.CDA_NY_Status__c,' +
        'Country,PostalCode,City,Account.Phone,Customer_Longitude__c,Customer_Latitude__c,Account.change_initiated__c,Account.CUST_UNIQ_ID_VAL__c+' +
        'FROM+RetailStore+WHERE+Customer_Longitude__c!=null+AND+Customer_Latitude__c!=null+AND+' +
        'Account.IS_ACTIVE__c=TRUE+AND+' +
        'Account.IsCDACustomer__c=TRUE+AND+' +
        `Customer_Longitude__c%3E${region.left}+AND+Customer_Longitude__c%3C${region.right}+AND+` +
        `Customer_Latitude__c%3C${region.top}+AND+Customer_Latitude__c%3E${region.bottom}+AND+` +
        `%28Name+LIKE+%27%25${searchValue}%25%27+OR+City+LIKE+%27%25${searchValue}%25%27+OR+Account.Phone+LIKE+%27%25${searchValue}%25%27+` +
        `OR+Account.CUST_UNIQ_ID_VAL__c+LIKE+%27%25${searchValue}%25%27+OR+Account.RTLR_STOR_NUM__c+LIKE+%27%25${searchValue}%25%27+OR+Country+LIKE+%27%25${searchValue}%25%27+` +
        `OR+Street+LIKE+%27%25${searchValue}%25%27+OR+State+LIKE+%27%25${searchValue}%25%27+OR+PostalCode+LIKE+%27%25${searchValue}%25%27%29+ORDER+BY+Name`

    try {
        const res = await syncDownObj('RetailStore', searchQuery, false)
        return updateCustomerDataFields(res.data)
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'Search-CDAMap-Online', `Get customer online failed: ${getStringValue(error)}`)
        return []
    }
}

const getKAMCdaQuery = (filterSubQuery: string, orderBy: string, region: string) => {
    const query =
        'SELECT Id, Name, Street, State, StateCode, ' +
        'Account.IsCDACustomer__c, Account.IsOTSCustomer__c, Account.CDA_Status__c, Account.CDA_Medal__c, Account.CDA_NY_Status__c,' +
        'Country, PostalCode,City, Account.Phone, Customer_Longitude__c, Customer_Latitude__c, Account.change_initiated__c, Account.CUST_UNIQ_ID_VAL__c ' +
        'FROM RetailStore ' +
        'WHERE Customer_Longitude__c!=null AND Customer_Latitude__c!=null AND ' +
        'Account.IsCDACustomer__c = true AND ' +
        `Customer_Longitude__c > ${region.left} AND Customer_Longitude__c < ${region.right} AND ` +
        `Customer_Latitude__c < ${region.top} AND Customer_Latitude__c > ${region.bottom} AND ` +
        `AccountId IN (SELECT AccountId FROM AccountTeamMember WHERE UserId = '${CommonParam.userId}' AND kam_active_flag__c = true AND If_Populated_By_KAM__c = true) ` +
        `${filterSubQuery} ` +
        'AND Account.IS_ACTIVE__c = true ' +
        `ORDER BY Name ${orderBy} NULLS LAST `
    return encodeURIComponent(query)
}

const getCdaQuery = (longitude: string, latitude: string, filterSubQuery: string, orderBy: string) => `
    SELECT
        {RetailStore:Id},
        {RetailStore:Account.IsCDACustomer__c},
        {RetailStore:Account.change_initiated__c},
        {RetailStore:Name},
        {RetailStore:Street},
        {RetailStore:State},
        {RetailStore:StateCode},
        {RetailStore:AccountId},
        {RetailStore:Country},
        {RetailStore:PostalCode},
        {RetailStore:City},
        {RetailStore:Account.Phone},
        {RetailStore:Customer_Longitude__c},
        {RetailStore:Customer_Latitude__c},
        {RetailStore:Account.PEPSI_COLA_NATNL_ACCT__c},
        {RetailStore:Account.CUST_LVL__c},
        {RetailStore:Account.CUST_STRT_DT__c},
        {RetailStore:Account.CUST_UNIQ_ID_VAL__c},
        {RetailStore:Account.IsOTSCustomer__c},
        {RetailStore:Account.CDA_Status__c},
        {RetailStore:Account.CDA_Medal__c},
        {RetailStore:Account.CDA_NY_Status__c},
        (
            (${longitude} - {RetailStore:Customer_Longitude__c}) * (${longitude} - {RetailStore:Customer_Longitude__c}) +
                (${latitude} - {RetailStore:Customer_Latitude__c}) * (${latitude} - {RetailStore:Customer_Latitude__c})
        ) AS Distance
    FROM {RetailStore}
    WHERE {RetailStore:Customer_Longitude__c} IS NOT NULL
        AND {RetailStore:Account.IS_ACTIVE__c} IS TRUE
        AND {RetailStore:Customer_Latitude__c} IS NOT NULL
        AND {RetailStore:Account.IsCDACustomer__c} IS TRUE
        ${filterSubQuery}
    ORDER BY {RetailStore:Name} COLLATE NOCASE ${orderBy} NULLS LAST`

export const useCDACustomerMarkers = (
    isFocused: boolean,
    searchValue: string,
    region: any,
    setShowLoading: any,
    geolocation: any,
    sortFilter: any,
    isCurrentCdaYear: boolean
) => {
    const [CDACustomerMarkers, setCDACustomerMarkers] = useState([])
    const [customerMarkersShownOnMap, setCustomerMarkersShownOnMap] = useState([])
    const [customerRefreshTimes, setCustomerRefreshTimes] = useState(0)

    useEffect(() => {
        if (isFocused && !sortFilter.uninitialized) {
            if (searchValue.length >= 3) {
                setShowLoading(true)
                searchCDACustomersFromBackend(searchValue, region)
                    .then((CDACustomers) => {
                        setCDACustomerMarkers(CDACustomers)
                        setCustomerMarkersShownOnMap(CDACustomers)
                        setShowLoading(false)
                    })
                    .catch(() => {
                        setCDACustomerMarkers([])
                        setCustomerMarkersShownOnMap([])
                        setShowLoading(false)
                    })
            } else {
                if (isPersonaKAM()) {
                    setShowLoading(true)
                    let filterQuery = ''
                    if (!(sortFilter.customerType.Retail && sortFilter.customerType.FoodService)) {
                        if (sortFilter.customerType.Retail) {
                            // Retail Filter Logic
                            filterQuery += 'AND Account.IsOTSFoodService__c = false '
                        } else if (sortFilter.customerType.FoodService) {
                            // Food Service Filter Logic
                            filterQuery += 'AND Account.IsOTSFoodService__c = true '
                        } else {
                            // Show no marker if Retail and FoodService both unchecked
                            setShowLoading(false)
                            setCDACustomerMarkers([])
                            setCustomerMarkersShownOnMap([])
                            return
                        }
                    }
                    if (sortFilter?.enableCdaStatus) {
                        const selectedCdaStatus: string[] = []
                        _.entries(sortFilter.cdaStatus).forEach(([k, boolV]) => {
                            boolV && selectedCdaStatus.push(k)
                        })
                        filterQuery += `AND ${
                            isCurrentCdaYear ? 'Account.CDA_Status__c' : 'Account.CDA_NY_Status__c'
                        } IN (${getIdClause(selectedCdaStatus)}) `
                    }

                    const finalKAMCustomer = getKAMCdaQuery(filterQuery, sortFilter.sortValue, region)
                    syncDownObj('RetailStore', finalKAMCustomer, false)
                        .then((res) => {
                            setShowLoading(false)
                            const temptCustomer = updateCustomerDataFields(res.data)
                            setCDACustomerMarkers(temptCustomer)
                            setShowLoading(false)
                            setCustomerMarkersShownOnMap(temptCustomer)
                        })
                        .catch((e) => {
                            setShowLoading(false)
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'KAM-CDA-MAP-Filter-Online',
                                `Get customer failed: ${getStringValue(e)}`
                            )
                            setCDACustomerMarkers([])
                            setCustomerMarkersShownOnMap([])
                        })
                } else {
                    setShowLoading(true)
                    let filterQuery = ''
                    if (!(sortFilter.customerType.Retail && sortFilter.customerType.FoodService)) {
                        if (sortFilter.customerType.Retail) {
                            // Retail Filter Logic
                            filterQuery += 'AND {RetailStore:Account.IsOTSFoodService__c} IS FALSE\n'
                        } else if (sortFilter.customerType.FoodService) {
                            // Food Service Filter Logic
                            filterQuery += 'AND {RetailStore:Account.IsOTSFoodService__c} IS TRUE\n'
                        } else {
                            // Show no marker if Retail and FoodService both unchecked
                            setShowLoading(false)
                            setCDACustomerMarkers([])
                            setCustomerMarkersShownOnMap([])
                            return
                        }
                    }
                    if (sortFilter?.enableCdaStatus) {
                        const selectedCdaStatus: string[] = []
                        _.entries(sortFilter.cdaStatus).forEach(([k, boolV]) => {
                            boolV && selectedCdaStatus.push(k)
                        })
                        filterQuery += `AND ${
                            isCurrentCdaYear
                                ? '{RetailStore:Account.CDA_Status__c}'
                                : '{RetailStore:Account.CDA_NY_Status__c}'
                        } IN (${getIdClause(selectedCdaStatus)})\n`
                    }
                    const query = getCdaQuery(
                        geolocation.longitude,
                        geolocation.latitude,
                        filterQuery,
                        sortFilter.sortValue
                    )
                    SoupService.retrieveDataFromSoup(
                        'RetailStore',
                        {},
                        [
                            'Id',
                            'Account.IsCDACustomer__c',
                            'Account.change_initiated__c',
                            'Name',
                            'Street',
                            'State',
                            'StateCode',
                            'AccountId',
                            'Country',
                            'PostalCode',
                            'City',
                            'Account.Phone',
                            'Customer_Longitude__c',
                            'Customer_Latitude__c',
                            'Account.PEPSI_COLA_NATNL_ACCT__c',
                            'Account.CUST_LVL__c',
                            'Account.CUST_STRT_DT__c',
                            'Account.CUST_UNIQ_ID_VAL__c',
                            'Account.IsOTSCustomer__c',
                            'Account.CDA_Status__c',
                            'Account.CDA_Medal__c',
                            'Account.CDA_NY_Status__c',
                            'Distance'
                        ],
                        query
                    )
                        .then((res) => {
                            setCDACustomerMarkers(res)
                            setShowLoading(false)
                            setCustomerMarkersShownOnMap(res)
                        })
                        .catch((e) => {
                            setShowLoading(false)
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'KAM-CDA-MAP-Filter-Offline',
                                `Get customer failed: ${getStringValue(e)}`
                            )
                            setCDACustomerMarkers([])
                            setCustomerMarkersShownOnMap([])
                        })
                }
            }
        }
    }, [isFocused, searchValue, region, customerRefreshTimes, sortFilter, isCurrentCdaYear])

    return {
        customerMarkers: CDACustomerMarkers,
        customerMarkersShownOnMap: customerMarkersShownOnMap,
        setCustomerRefreshTimes
    }
}

export const useShowCDAMap = () => {
    const [isShowCDAMap, setIsShowCDAMap] = useState<boolean>(false)

    useEffect(() => {
        setIsShowCDAMap(CommonParam.FeatureToggle[FeatureToggle.CDA_MAP_VIEW])
    }, [])
    return { isShowCDAMap }
}

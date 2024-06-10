import { syncDownObj } from '../../api/SyncUtils'
import { getIdClause } from '../../components/manager/helper/MerchManagerHelper'
import LocationService from '../../service/LocationService'
import { TabID } from '../../redux/types/H01_Manager/data-tabIndex'
import PinDeliveryInProgress from '../../../../assets/image/pin-delivery-in-progress.svg'
import PinDeliveryCompleted from '../../../../assets/image/pin-delivery-completed.svg'
import PinDeliveryYetToStart from '../../../../assets/image/pin-delivery-pending.svg'
import PinDeliveryGray from '../../../../assets/image/pin-delivery-gray.svg'
import PinOrderCompleted from '../../../../assets/image/pin-order-completed.svg'
import PinOrderYetToStart from '../../../../assets/image/pin-order-yet-to-start.svg'
import PinOrderInProgress from '../../../../assets/image/pin-order-in-progress.svg'
import PinOrderGray from '../../../../assets/image/pin-order-gray.svg'
import _ from 'lodash'
import { VisitStatus } from '../../enums/Visit'
import { CommonParam } from '../../../common/CommonParam'
import moment from 'moment'
import { SoupService } from '../../service/SoupService'
import { RecordTypeEnum } from '../../enums/RecordType'
import { t } from '../../../common/i18n/t'
import { isSameDayWithTimeZone, isTodayDayWithTimeZone } from '../../utils/TimeZoneUtils'
import { VisitListStatus } from '../../enums/VisitList'
import { showMerch } from '../../pages/MapScreen'
import { formatString } from '../../utils/CommonUtils'
import { serviceBreadcrumbs } from '../../api/serviceBreadcrumbs'
import { Log } from '../../../common/enums/Log'
import { CommonApi } from '../../../common/api/CommonApi'
import { checkAndRefreshBreadcrumbsToken } from '../../service/BreadcrumbsService'
import { getMapModalInfo } from '../merchandiser/MyVisitMapHelper'
import NetInfo from '@react-native-community/netinfo'
import { isPersonaMD } from '../../../common/enums/Persona'
import CMarkWithSeq from '../../components/common/CMarkWithSeq'
import { getOrderData } from '../../components/del-sup/deliveries/DelEmployeeScheduleHelper'
import { getOrderLabel } from '../../components/MyDay/SalesMyDayHelper'
import { SEARCH_REGION_MAGNIFICATION } from '../rep/ExploreHelper'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const React = require('react')

interface EmployeeProps {
    userStatsId: string
    visitId: string
    gpId: string
    buId: string
    userItem: string
    persona: string
    lastName: string
    firstName: string
}

interface RegionProps {
    left: number
    right: number
    top: number
    bottom: number
}

interface MapViewRegionChangeLogicProps {
    mapRegion: {
        latitude: number
        longitude: number
        latitudeDelta: number
        longitudeDelta: number
    }
    mapRef: any
    zoomLevel: number
    searchRegion: RegionProps
    setViewRegion: (region: RegionProps) => void
    isInSearchRegion: (region: RegionProps, searchRegion: RegionProps) => boolean
    setZoomLevel: (zoomLevel: number) => void
    calculateSearchRegion: (
        region: RegionProps,
        magnification: number,
        setSearchRegion: (searchRegion: RegionProps) => void,
        zoomLevel: number
    ) => void
    setSearchRegion: (region: RegionProps) => void
}

interface MapBoundaries {
    southWest: {
        latitude: number
        longitude: number
    }
    northEast: {
        latitude: number
        longitude: number
    }
}

export const getIncomingVisits = (canSequence, employeeListData) => {
    // there is two  type List . The data structure of each list is different .If can not  Sequence there is sectionArr
    if (canSequence) {
        return employeeListData
    }

    let incomingVisit = []
    employeeListData.forEach((res) => {
        incomingVisit = incomingVisit.concat(res.data)
    })

    return incomingVisit
}

export const parasVisits = (employeeLists) => {
    return employeeLists.reduce((a, b) => {
        !_.isEmpty(b?.visits) &&
            b?.visits?.forEach((item) => {
                item.id = b.id
                item.name = item.StoreName
                item.visitDetailRelated = b.visitDetailRelated
                item.userName = b.name
                item.firstName = b.firstName
                item.lastName = b.lastName
                item.gpid = b.gpid
                item.all = b.all
                item.finished = b.finished
                item.status = b.status
                item.phone = b.phone
                item.totalDuration = b.totalDuration
                item.address = item.Street
                item.avatar = b.avatar
                item.cityStateZip = `${item.City || ''}, ${item.State || ''}, ${item.PostalCode || ''} `
                item.storeLocation = item.Store_Location__c
                    ? item.Store_Location__c
                    : JSON.stringify({
                          latitude: item.Latitude || 0,
                          longitude: item.Longitude || 0
                      })
            })

        return a.concat(b?.visits)
    }, [])
}

const query =
    'SELECT Id,Pull_Number__c,Name,Retail_Store__r.Street,Retail_Store__r.City,Retail_Store__r.State,Retail_Store__r.PostalCode,Retail_Store__r.Account.Phone,Retail_Store__r.Account.Merchandising_Order_Days__c,Retail_Store__r.Name, OwnerId, PlaceId, VisitorId  , Visitor.Name, Status__c, ActualVisitEndTime,' +
    ' ActualVisitStartTime, PlannedVisitEndTime, PlannedVisitStartTime, Sequence__c,' +
    ' Visit_Subtype__c, Take_Order_Flag__c,retail_store__r.store_location__c,retail_store__r.Latitude,retail_store__r.Longitude,' +
    ' RecordTypeId, RecordType.DeveloperName ,Planned_Date__c, Visit_List__c, Visit_List__r.Status__c, ' +
    ' Planned_Duration_Minutes__c, Actual_Duration_Minutes__c ,User__r.GM_LOC_ID__c,User__r.MobilePhone,User__r.Id,User__r.BU_ID__c,User__r.PERSONA__c,User__r.GPID__c,User__r.FirstName,User__r.LastName,RTE_ID__c'

export const getAllVisitByRecordType = async (selectDay, recordType = [], allMerchVisits = [], isSales?) => {
    if (isPersonaMD()) {
        const networkState = await NetInfo.fetch()
        if (!networkState.isInternetReachable) {
            return []
        }
    }

    let queryAllEmployeesVisitResult: any = {}
    try {
        if (!allMerchVisits) {
            allMerchVisits = []
        }
        const date = selectDay || new Date().toISOString()
        const end = moment(date).format(TIME_FORMAT.Y_MM_DD)
        let finalQuery = `${query} FROM Visit 
        WHERE Status__c!='Removed' AND Status__c!='Planned' AND RecordType.DeveloperName 
        IN (${getIdClause(recordType)}) 
        AND VisitorId <> null 
        AND VisitorId IN (SELECT Id FROM User Where GM_LOC_ID__c = '${CommonParam.userLocationId}') 
        AND Retail_Store__r.Account.LOC_PROD_ID__c='${CommonParam.userLocationId}' 
        AND Planned_Date__c>=${end} AND Planned_Date__c <= ${end} 
        AND Status__c NOT IN ('Pre-Processed', 'Removed', 'Failed') `

        if (isSales) {
            finalQuery += "AND RTE_ID__c != ''"
        }
        let data = []
        if (allMerchVisits.length > 10) {
            while (allMerchVisits.length > 0) {
                const tempAllMerchVisits = allMerchVisits.splice(0, 10)
                const uniqueStoreIds: Array<string> = Array.from(
                    new Set(tempAllMerchVisits.map((v) => v.storeId || v.PlaceId))
                )
                const newQuery = finalQuery + `AND PlaceId IN (${getIdClause(uniqueStoreIds)})`
                const visitObj = await syncDownObj('Visit', newQuery, false)
                data = data.concat(visitObj.data)
            }
        } else {
            if (allMerchVisits.length > 0) {
                const uniqueStoreIds: Array<string> = Array.from(
                    new Set(allMerchVisits.map((v) => v.storeId || v.PlaceId))
                )
                finalQuery += `AND PlaceId IN (${getIdClause(uniqueStoreIds)})`
            }
            const visitObj = await syncDownObj('Visit', finalQuery, false)
            data = data.concat(visitObj.data)
        }

        queryAllEmployeesVisitResult = { data }
    } catch (e) {
        queryAllEmployeesVisitResult = {
            data: []
        }
    }
    let allVisits = []
    allVisits = _.unionBy(queryAllEmployeesVisitResult.data, 'Id')
    const orderData = await getOrderData(allVisits)
    const finalResult = []
    allVisits.forEach((element) => {
        const tmpVisit = _.cloneDeep(element)
        tmpVisit.DeveloperName = element.RecordType.DeveloperName
        tmpVisit.AccountPhone = element.Retail_Store__r?.Account?.Phone
        tmpVisit.userId = element.User__r?.Id
        tmpVisit.buId = element.User__r?.BU_ID__c
        tmpVisit.gpId = element.User__r?.GPID__c
        tmpVisit.persona = element.User__r?.PERSONA__c
        tmpVisit.firstName = element.User__r?.FirstName
        tmpVisit.lastName = element.User__r?.LastName
        tmpVisit.storeLocation = element.Retail_Store__r.Store_Location__c
            ? JSON.stringify(element.Retail_Store__r.Store_Location__c)
            : JSON.stringify({
                  latitude: element.Retail_Store__r.Latitude || 0,
                  longitude: element.Retail_Store__r.Longitude || 0
              })
        tmpVisit.latitude = JSON.parse(tmpVisit.storeLocation).latitude
        tmpVisit.longitude = JSON.parse(tmpVisit.storeLocation).longitude
        tmpVisit.isUnassigned = !element.VisitorId
        tmpVisit.MobilePhone = element.User__r?.MobilePhone || element.MobilePhone
        tmpVisit.isUnassigned = !element.VisitorId
        tmpVisit.VisitId = element.Id
        tmpVisit.name = element.Retail_Store__r.Name
        tmpVisit.status = element.Status__c
        tmpVisit.OrderDays = element.Retail_Store__r?.Account?.Merchandising_Order_Days__c
        tmpVisit.RouteId = element.RTE_ID__c
        finalResult.push(tmpVisit)
    })
    finalResult.forEach((visit) => {
        if (!visit.type) {
            visit.type = []
        }
        if (visit.RecordType.DeveloperName === RecordTypeEnum.SALES) {
            const orderLabel = getOrderLabel(
                visit,
                orderData.filter((order) => order.Visit__c === visit.Id)
            )
            if (visit.type.indexOf(orderLabel) === -1) {
                visit.type.push(orderLabel)
            }
            const merchVisit = finalResult.find(
                (v) =>
                    v.RecordType.DeveloperName === RecordTypeEnum.MERCHANDISING &&
                    v.Planned_Date__c === visit.Planned_Date__c &&
                    v.PlaceId === visit.PlaceId
            )
            if (visit.type.indexOf(t.labels.PBNA_MOBILE_MERCH) === -1 && merchVisit) {
                visit.type.push(t.labels.PBNA_MOBILE_MERCH)
            }
        }
    })
    return finalResult
}

export const showDelivery = (marker, fromMyDay, highlightDriver?) => {
    let childrenSvg = <PinDeliveryYetToStart />
    const showSequence = !fromMyDay && marker.Sequence__c !== null && marker.Sequence__c !== undefined
    if (marker.inActive || (highlightDriver && marker.VisitorId !== highlightDriver)) {
        childrenSvg = <PinDeliveryGray />
    } else if (marker.status === VisitStatus.COMPLETE) {
        childrenSvg = <PinDeliveryCompleted />
    } else if (marker.status === VisitStatus.IN_PROGRESS) {
        childrenSvg = <PinDeliveryInProgress />
    }
    return <CMarkWithSeq isSVG sequence={marker.Sequence__c} showSequence={showSequence} ChildrenSVG={childrenSvg} />
}

const showSales = (marker, fromMyDay) => {
    let childrenSvg = <PinOrderGray />
    const showSequence =
        !fromMyDay &&
        marker.Sequence__c !== null &&
        marker.Sequence__c !== undefined &&
        marker.Sequence__c !== 0 &&
        !isPersonaMD()
    if (!marker.inActive) {
        if (marker.status === VisitStatus.COMPLETE) {
            childrenSvg = <PinOrderCompleted />
        } else if (marker.status === VisitStatus.IN_PROGRESS) {
            childrenSvg = <PinOrderInProgress />
        } else {
            childrenSvg = <PinOrderYetToStart />
        }
    }
    return <CMarkWithSeq isSVG sequence={marker.Sequence__c} showSequence={showSequence} ChildrenSVG={childrenSvg} />
}

export const showPinByType = (marker, type, fromMyDay) => {
    if (type === TabID.TabID_Merch) {
        return showMerch(marker)
    }
    // Note Different Logic for Merch Map View
    if (type === TabID.TabID_Delivery) {
        return showDelivery(marker, fromMyDay)
    }
    if (type === TabID.TabID_Sales) {
        return showSales(marker, fromMyDay)
    }
}

export const parseMarkers = (allVisits) => {
    allVisits.forEach((res) => {
        if (res.storeLocation) {
            try {
                const storeLocation = JSON.parse(res.storeLocation)
                res.Latitude = storeLocation.latitude
                res.Longitude = storeLocation.longitude
                res.latitude = storeLocation.latitude
                res.longitude = storeLocation.longitude
            } catch (e) {}
        }
    })
    return allVisits
}

export const getMapMarkers = (visits, setRegion, setActiveUser, setMarkers, mapRef = null, inputTab?, currentTab?) => {
    LocationService.getCurrentPosition().then((position: any) => {
        let allVisits = _.cloneDeep(visits)
        let pos = {
            latitude: 40.7121001,
            longitude: -74.0125118
        }
        if (position && position?.coords && position.coords?.latitude && position.coords?.longitude) {
            pos = position.coords
        }
        const bounding = LocationService.getBoundingBox(
            pos,
            allVisits.filter((vis) => {
                return !vis.inActive
            })
        )
        if (inputTab === currentTab?.current) {
            setRegion(bounding.initialRegion)
            allVisits = parseMarkers(allVisits)
            setActiveUser(null)
            setMarkers(allVisits)
            mapRef?.current?.fitToElements({ animated: true })
        }
    })
}

export const getVisitRoute = (selectedDay) => {
    return SoupService.retrieveDataFromSoup(
        'Visit',
        {},
        ['visitId', 'salesRouteId'],
        formatString(
            `
        SELECT
        {Visit:Id},
        {Route_Sales_Geo__c:Id}
    FROM {Visit} 
        LEFT JOIN {User} ON {Visit:VisitorId} = {User:Id}
        JOIN {Employee_To_Route__c} ON {User:Id} = {Employee_To_Route__c:User__c}
        JOIN {Route_Sales_Geo__c} ON {Employee_To_Route__c:Route__c} = {Route_Sales_Geo__c:Id}
    WHERE 
       {Visit:Status__c} != '${VisitStatus.CANCELLED}' 
       AND {Visit:Planned_Date__c} = '${selectedDay}' 
       AND {Visit:Status__c} != '${VisitStatus.PLANNED}' 
       AND {Visit:Status__c} != '${VisitStatus.REMOVED}'
       AND {Visit:Status__c} != 'Failed'
        `,
            [CommonParam.userLocationId]
        )
    )
}

export const filterHaveRouteVisits = async (selectedDay, salesVisits) => {
    const date = moment(selectedDay).format(TIME_FORMAT.Y_MM_DD)
    const haveRouteSales = await getVisitRoute(date)
    return [...salesVisits].filter((sales) =>
        [...haveRouteSales].some((routeSales) => {
            return sales.VisitId === routeSales.visitId
        })
    )
}

export const getSalesOverlapVisits = (incomingVisit, salesList) => {
    return [...salesList].filter((delivery) =>
        [...incomingVisit].some((visit) => {
            return visit.VisitId === delivery.VisitId
        })
    )
}

export const getAllVisits = (selectedDate, originVisits, recordType?, withoutDateFilter = false) => {
    if (!selectedDate || selectedDate === '') {
        selectedDate = moment()
    }
    return [...originVisits].filter((v) => {
        let returnValue = true
        if (v.RecordType?.DeveloperName !== recordType) {
            returnValue = false
        }
        if (!withoutDateFilter && !isSameDayWithTimeZone(selectedDate, v.Planned_Date__c, true)) {
            returnValue = false
        }
        if (
            withoutDateFilter &&
            isTodayDayWithTimeZone(selectedDate, true) &&
            !isSameDayWithTimeZone(selectedDate, v.Planned_Date__c, true) &&
            v.Visit_List__r?.Status__c !== VisitListStatus.IN_PROGRESS &&
            v.Visit_List__r?.Status__c !== VisitListStatus.NOT_STARTED
        ) {
            returnValue = false
        }
        return returnValue
    })
}

const fetchLiveLocations = (personaName, buId, gpIds) => {
    // '1001000','10000000' gpid  params format like this
    const requests = _.chunk(gpIds, 6).map((gpidArr) => {
        return new Promise(function (resolve) {
            const t2 = `${
                CommonApi.PBNA_MOBILE_API_LIVE_TRACKING
            }?function=${personaName}&bu_id=${buId}&gpids=${gpidArr.join(',')}`
            serviceBreadcrumbs
                .get(t2, {
                    baseURL: CommonApi.PBNA_MOBILE_API_BREADCRUMBS_BASEURL,
                    headers: {
                        Authorization: `Bearer ${CommonParam.breadcrumbsAccessToken}`
                    }
                })
                .then((res: any) => {
                    storeClassLog(Log.MOBILE_INFO, 'live-tracking data succeeded', 'retrieve live-tracking succeeded.')
                    resolve(res.locations)
                })
                .catch((err) => {
                    resolve([])
                    storeClassLog(
                        Log.MOBILE_WARN,
                        'live-tracking data failed',
                        `live-tracking data failed:${ErrorUtils.error2String(err)}`
                    )
                })
        })
    })
    return Promise.all(requests)
}

export const requestEmployeeList = (currentVisits, activeTab) => {
    return new Promise((resolve) => {
        const newCurrentVisitsList = [...currentVisits]
        const uniqEmployeeVisits = _.uniqBy(newCurrentVisitsList, 'VisitorId')
        const newUserInfo = []
        const TabIDMap = {
            1: 'merch',
            2: 'sales',
            4: 'delivery'
        }

        getMapModalInfo(uniqEmployeeVisits)
            .then((employeeList: EmployeeProps[]) => {
                uniqEmployeeVisits.forEach((visit) => {
                    visit.Id = visit.Id ? visit.Id : visit.visitId
                    const employee: EmployeeProps = employeeList.find(
                        (employeeItem) => employeeItem.visitId === visit.Id
                    )
                    const userItem: any = {}
                    visit.gpId = employee.gpId
                    visit.buId = employee.buId
                    visit.lastName = employee.lastName
                    visit.firstName = employee.firstName
                    visit.userStatsId = employee.userStatsId
                    userItem.userStatsId = employee ? employee.userStatsId : ''
                    userItem.gpId = visit.gpId || employee.gpId
                    userItem.visitorId = visit.VisitorId
                    userItem.buId = visit.buId || employee.buId
                    userItem.isActiveUser = true
                    userItem.persona = visit.persona
                    userItem.firstName = visit.firstName
                    userItem.lastName = visit.lastName
                    newUserInfo.push(userItem)
                })
                const gpIds = uniqEmployeeVisits.map((item: { gpId: string }) => item.gpId).filter((i) => i)
                return fetchLiveLocations(TabIDMap[activeTab], uniqEmployeeVisits[0].buId, gpIds)
            })
            .then((locationArr: any[]) => {
                const newUserWithLocation = []
                const locations = locationArr.flat(1)
                locations?.length > 0 &&
                    locations.forEach((location) => {
                        const user = newUserInfo.find((userItem) => location.gpid.replace(/\s+/g, '') === userItem.gpId)
                        const newUserWithLocationItem: any = { ...user, ...location }
                        newUserWithLocation.push(newUserWithLocationItem)
                    })

                resolve({
                    newUserWithLocation,
                    activeTab
                })
            })
            .catch(() => {
                resolve({
                    newUserWithLocation: [],
                    activeTab
                })
            })
    })
}

export const isToday = (date) => {
    return moment().isSame(moment(date), 'day')
}

export const getEmployees = async (currentVisits, activeTab) => {
    if (_.isEmpty(currentVisits)) {
        return []
    }
    await checkAndRefreshBreadcrumbsToken()
    const userList: any = await requestEmployeeList(currentVisits, activeTab)
    return userList
}

export const handleMapViewRegionChangeLogic = ({
    mapRegion,
    mapRef,
    zoomLevel,
    searchRegion,
    setViewRegion,
    isInSearchRegion,
    setZoomLevel,
    calculateSearchRegion,
    setSearchRegion
}: MapViewRegionChangeLogicProps) => {
    // calculate zoom level
    const tempZoomLevel = Math.round(Math.log(360 / mapRegion.longitudeDelta) / Math.LN2)
    mapRef?.current?.getMapBoundaries().then((v: MapBoundaries) => {
        const region = {
            left: v.southWest.longitude,
            right: v.northEast.longitude,
            top: v.northEast.latitude,
            bottom: v.southWest.latitude
        }
        setViewRegion(region)
        if (!isInSearchRegion(region, searchRegion) || tempZoomLevel !== zoomLevel) {
            if (tempZoomLevel !== zoomLevel) {
                setZoomLevel(tempZoomLevel)
            }
            // if the view region is out of the search region, then update the search region
            calculateSearchRegion(region, SEARCH_REGION_MAGNIFICATION, setSearchRegion, tempZoomLevel)
        }
    })
}

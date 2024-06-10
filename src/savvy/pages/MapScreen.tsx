import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import MapView, { Marker, Polyline } from 'react-native-maps'
import _ from 'lodash'
import moment from 'moment'
import { ImageSrc } from '../../common/enums/ImageSrc'
import { serviceBreadcrumbs } from '../api/serviceBreadcrumbs'
import { useDropDown } from '../../common/contexts/DropdownContext'
import { CommonApi } from '../../common/api/CommonApi'
import { Log } from '../../common/enums/Log'
import StatusCode from '../enums/StatusCode'
import { TabID } from '../redux/types/H01_Manager/data-tabIndex'

import { getEmployees, isToday, showDelivery, showPinByType } from '../helper/manager/mapHelper'
import { VisitStatus } from '../enums/Visit'
import { getMapMarkers, getMapModalInfo, getMerchDeliveryMarker } from '../helper/merchandiser/MyVisitMapHelper'
import MapTab from '../components/sales/my-day/MapTab'
import SwitchableMapModal from '../components/common/SwitchableMapModal'
import { isPersonaManager, isPersonaMD, Persona } from '../../common/enums/Persona'
import { CommonParam } from '../../common/CommonParam'
import { showUsersPhoto } from '../components/sales/my-day/SwitchableMap'
import LocationService from '../service/LocationService'
import { checkAndRefreshBreadcrumbsToken } from '../service/BreadcrumbsService'
import Loading from '../../common/components/Loading'
import { formatWithTimeZone, setLoggedInUserTimezone } from '../utils/TimeZoneUtils'
import CMarkWithSeq from '../components/common/CMarkWithSeq'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const styles = StyleSheet.create({
    map: {
        flex: 1
    }
})

interface MapProps {
    isMM: boolean
    mapScreenStyle?: object
    employeeListData?: any[]
    employItem?: any
    incomingVisits?: any[]
    selectedDay: string
    navigation: any
}

export enum PersonaMap {
    Merchandising = 'merch',
    PSR = 'sales',
    Delivery = 'delivery'
}

const showPolyline = (locations) => {
    return <Polyline coordinates={locations} strokeColor="#000" strokeColors={['#000']} strokeWidth={2} />
}

export const showMerch = (marker) => {
    let sourceStr
    const showSequence = marker.Sequence__c !== null && marker.Sequence__c !== undefined

    if (marker.status === VisitStatus.COMPLETE) {
        sourceStr = ImageSrc.PIN_COMPLETE
    } else if (marker.status === VisitStatus.IN_PROGRESS) {
        sourceStr = ImageSrc.PIN_IN_PROGRESS
    } else {
        sourceStr = ImageSrc.PIN_YET_TO_START
    }

    return (
        <CMarkWithSeq isSVG={false} sequence={marker.Sequence__c} sourceStr={sourceStr} showSequence={showSequence} />
    )
}

const MapScreen = (props: MapProps) => {
    const { isMM, incomingVisits, navigation, selectedDay, employItem, employeeListData, mapScreenStyle = {} } = props
    const mapRef = useRef<MapView>(null)
    const merchMapModal: any = useRef()
    const deliveryMapModal: any = useRef()
    const salesMapModal: any = useRef()
    const { dropDownRef } = useDropDown()
    const [locations, setLocations] = useState([])
    const [currentVisits, setCurrentVisits] = useState([])
    const [markers, setMarkers] = useState([])
    const [mapModalVisible, setMapModalVisible] = useState(false)
    const [currentTab, setCurrentTab] = useState(null)
    const [highlightDriver, setHighlightDriver] = useState('')
    const activeTab = useRef()
    const [region, setRegion] = useState(null)
    const [employeeList, setEmployeeList] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [deliveryRouteVisible, setDeliveryRouteVisible] = useState(false)

    // every 5 min get user photo
    const serviceInterval = useRef(null)

    const onPressMark = (marker) => {
        if (currentTab === TabID.TabID_Merch) {
            merchMapModal.current.openModal(marker)
        }
        if (currentTab === TabID.TabID_Sales) {
            salesMapModal.current.openModal(marker)
        }
        if (currentTab === TabID.TabID_Delivery) {
            deliveryMapModal.current.openModal(marker)
        }
        setMapModalVisible(true)
        navigation.setOptions({ tabBarVisible: false })
    }

    const intervalFn = () => {
        // can not set loading because  serviceInterval
        getEmployees(currentVisits, currentTab)
            .then((userList) => {
                if (activeTab.current === userList.activeTab) {
                    setEmployeeList(userList.newUserWithLocation)
                }
            })
            .catch(() => {
                setEmployeeList([])
            })
    }

    const showLiveLocationConditions = () => {
        const showDeliveryLiveLocation =
            CommonParam.selectedTab === Persona.DELIVERY_SUPERVISOR && currentTab === TabID.TabID_Delivery
        const showMDDeliveryLiveLocation = isPersonaMD() && currentTab === TabID.TabID_Delivery
        const showMMMerchLiveLocation =
            CommonParam.selectedTab === Persona.MERCH_MANAGER && currentTab === TabID.TabID_Merch
        const showSalesLiveLocation =
            CommonParam.selectedTab === Persona.SALES_DISTRICT_LEADER && currentTab === TabID.TabID_Sales
        return (
            showDeliveryLiveLocation || showMDDeliveryLiveLocation || showMMMerchLiveLocation || showSalesLiveLocation
        )
    }

    const hasLocation = (visit) => {
        const { storeLocation } = visit
        if (!storeLocation) {
            return false
        }
        const location = JSON.parse(storeLocation)
        return !(!location.latitude || !location.longitude)
    }

    const updateMerchDeliveryMap = (mapFitToElements) => {
        // Root Of Merchandiser Delivery Update Logic
        if (currentTab === TabID.TabID_Delivery && isPersonaMD() && !mapModalVisible) {
            setIsLoading(true)
            getMerchDeliveryMarker(selectedDay)
                .then((data: any) => {
                    setCurrentVisits(data)
                    setIsLoading(false)
                    if (mapFitToElements) {
                        mapRef.current?.fitToElements()
                    }
                })
                .catch(() => {
                    setIsLoading(false)
                    setCurrentVisits([])
                })
        }
    }

    const handleSelectedTab = (tab) => {
        setEmployeeList([])
        setMarkers([])
        setCurrentTab(tab)
        if (isPersonaMD() && tab === TabID.TabID_Delivery) {
            updateMerchDeliveryMap(true)
        }
    }

    useEffect(() => {
        updateMerchDeliveryMap(true)
    }, [selectedDay, currentTab])
    useEffect(() => {
        if (mapModalVisible === false || deliveryRouteVisible === false) {
            updateMerchDeliveryMap(false)
            setHighlightDriver('')
        }
    }, [mapModalVisible, deliveryRouteVisible])

    useEffect(() => {
        let isUnmounted = false
        if (isUnmounted) {
            return
        }
        activeTab.current = currentTab
        if (currentVisits.length > 0) {
            getMapMarkers(currentVisits).then((mapInfoTmp) => {
                setRegion(mapInfoTmp.region)
            })
            setMarkers(
                currentVisits.filter(
                    (visitMarker) =>
                        ['Visit', 'Visit_List__c'].includes(visitMarker.attributes.type) && hasLocation(visitMarker)
                )
            )
            mapRef.current?.fitToElements()
        } else {
            setMarkers([])
        }

        clearInterval(serviceInterval.current)
        setEmployeeList([])

        if (showLiveLocationConditions() && isToday(selectedDay || moment())) {
            intervalFn()
            serviceInterval.current = setInterval(intervalFn, 5 * 60 * 1000)
        }

        return () => {
            isUnmounted = true
            clearInterval(serviceInterval.current)
        }
    }, [currentVisits, currentTab])

    useEffect(() => {
        if (currentTab !== TabID.TabID_Delivery) {
            mapRef.current?.fitToElements()
        }
    }, [markers])

    const fetchHistoryLocations = async (personaName, buId, gpId, startDayTime, endDayTime) => {
        await checkAndRefreshBreadcrumbsToken()
        // const t = `${CommonApi.PBNA_MOBILE_API_HISTORICAL_ROUTE}?function=${personaName}&bu_id=13&gpid=03106765&startdatetime=${startDayTime}&enddatetime=${endDayTime}`
        const t2 = `${CommonApi.PBNA_MOBILE_API_HISTORICAL_ROUTE}?function=${personaName}&bu_id=${buId}&gpid=${gpId}&startdatetime=${startDayTime}&enddatetime=${endDayTime}`
        serviceBreadcrumbs
            .get(t2, {
                baseURL: CommonApi.PBNA_MOBILE_API_BREADCRUMBS_BASEURL,
                headers: {
                    Authorization: `Bearer ${CommonParam.breadcrumbsAccessToken}`
                }
            })
            .then((res: any) => {
                storeClassLog(Log.MOBILE_INFO, 'fetchHistoryLocations', 'retrieve historical data succeeded.')
                setLocations(res.locations)
            })
            .catch((err) => {
                setLocations([])
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'fetchHistoryLocations',
                    `retrieve historical data failed: ${ErrorUtils.error2String(err)}`
                )
                const errStatus = err.error.response.status
                if (errStatus === StatusCode.ClientErrorNotFound) {
                    dropDownRef.current.alertWithType('info', 'No Historical Data ', `${ErrorUtils.error2String(err)}`)
                    return
                }
                dropDownRef.current.alertWithType('error', `Historical Route Err ${ErrorUtils.error2String(err)}`)
            })
    }

    useEffect(() => {
        if (isMM && employeeListData?.length > 0 && !_.isEmpty(employItem)) {
            let startVl = employeeListData?.filter((el) => !_.isEmpty(el.title))
            let endVl: any[] | undefined = []
            let tempEndTime = null
            if (!startVl || startVl.length === 0) {
                startVl = employeeListData?.filter((el) => !_.isEmpty(el.startTime))
                if (startVl && startVl.length > 0) {
                    endVl = employeeListData?.filter((el) => !_.isEmpty(el.endTime))
                    if (endVl?.length === startVl?.length) {
                        endVl?.reverse()
                        tempEndTime = endVl[0]?.footTitle || endVl[0]?.endTime
                    }
                }
            } else {
                endVl = _.cloneDeep(startVl)?.reverse()
                tempEndTime = endVl[0]?.footTitle || endVl[0]?.endTime
            }
            const visits = employItem?.visits ? employItem.visits[0] : employItem
            const persona = (visits?.persona ? PersonaMap[visits.persona] : PersonaMap[visits['RecordType.Name']]) || ''
            const buId = employItem?.buid
            const gpId = employItem?.gpid
            const tempStartTime = startVl[0]?.title || startVl[0]?.startTime
            let startDayTime = ''
            let endDayTime = ''
            if (employItem?.visits) {
                setLoggedInUserTimezone()
                startDayTime = tempStartTime && moment(tempStartTime).format(TIME_FORMAT.YMDHMS)
                endDayTime = tempEndTime
                    ? moment(tempEndTime).format(TIME_FORMAT.YMDHMS)
                    : moment().format(TIME_FORMAT.YMDHMS)
            } else {
                startDayTime = tempStartTime && moment.utc(tempStartTime).format(TIME_FORMAT.YMDHMS)
                endDayTime = tempEndTime
                    ? moment.utc(tempEndTime).format(TIME_FORMAT.YMDHMS)
                    : moment.utc().format(TIME_FORMAT.YMDHMS)
            }
            if (persona && gpId && startDayTime) {
                fetchHistoryLocations(persona, buId, gpId, startDayTime, endDayTime)
            } else {
                storeClassLog(
                    Log.MOBILE_INFO,
                    'No retrieve historical request was initiated',
                    `At least one of the following three is null persona:${persona} gpId:${gpId} startDayTime:${startDayTime} `
                )
                setLocations([])
            }
        } else {
            setLocations([])
        }
    }, [employeeListData])

    const getMapViewStyle = () => {
        let finalStyle = { marginTop: -23 }
        if (
            isPersonaManager() &&
            (CommonParam.selectedTab === Persona.DELIVERY_SUPERVISOR ||
                CommonParam.selectedTab === Persona.SALES_DISTRICT_LEADER)
        ) {
            finalStyle = { marginTop: 0 }
        }
        return finalStyle
    }

    const heightLightEmployee = (visitorId) => {
        const tempEmployeeList = _.cloneDeep(employeeList)
        tempEmployeeList.forEach((user: any) => {
            user.isActiveUser = visitorId === user.visitorId
        })
        setEmployeeList(tempEmployeeList)
    }

    const heightLightVisitPin = (visitorId, latitude, longitude) => {
        const allMarks = _.cloneDeep(markers)
        allMarks.forEach((marker) => {
            marker.inActive = marker.VisitorId !== visitorId
        })
        const activityPins = allMarks.filter((vis) => {
            return !vis.inActive
        })

        // getBoundingBox need  lowercase   latitude and longitude
        const bounding = LocationService.getBoundingBox({ latitude, longitude }, activityPins)
        setRegion(bounding.initialRegion)
        setMarkers(allMarks)
    }

    const handlePressUserPin = (item) => {
        if (
            currentTab === TabID.TabID_Delivery && // For Highlight Driver Pin
            highlightDriver !== item.visitorId
        ) {
            heightLightEmployee(item.visitorId)
            // Note that the latitude and longitude here is lowercase
            heightLightVisitPin(item.visitorId, item.latitude, item.longitude)
            setHighlightDriver(item.visitorId)
            return
        }
        const mdVisit = currentVisits?.filter((visit) => visit.visitorId === item.visitorId)
        if (!_.isEmpty(mdVisit)) {
            mdVisit[0].Planned_Date__c = formatWithTimeZone(
                mdVisit[0]?.expectedDeliverDate,
                TIME_FORMAT.Y_MM_DD,
                true,
                false
            )
            mdVisit[0].VisitorId = mdVisit[0]?.visitorId
            setDeliveryRouteVisible(true)
            navigation.navigate('DeliveryRoute', { deliveryInfo: mdVisit[0], setDeliveryRouteVisible })
            setHighlightDriver('')
        }
    }

    useEffect(() => {
        heightLightEmployee(highlightDriver)
    }, [highlightDriver])

    const clearHightLight = (event) => {
        if (event.nativeEvent.action !== 'marker-press' && currentTab === TabID.TabID_Delivery && highlightDriver) {
            setHighlightDriver('')
        }
    }

    const handleMarker = async (marker) => {
        if (
            currentTab === TabID.TabID_Delivery && // For Highlight Driver Pin
            highlightDriver !== marker.VisitorId
        ) {
            setHighlightDriver(marker.VisitorId)
            return
        }
        heightLightEmployee(marker.userId)
        const mapInfo: any = await getMapModalInfo([marker])
        const mapItem = mapInfo.find((info) => info.visitId === marker.Id)
        onPressMark({ ...marker, ...mapItem, name: marker.name })
    }

    return (
        <>
            <View style={mapScreenStyle}>
                <MapTab
                    isOverAllMap={false}
                    employeeList={incomingVisits}
                    selectedDay={selectedDay}
                    handleSelectedTab={handleSelectedTab}
                    isLandscape={false}
                    employeeId={employItem?.gpid}
                    employeeOwnerId={employItem?.id}
                    employItem={employItem}
                    setCurrentVisits={setCurrentVisits}
                />
                <MapView
                    ref={mapRef}
                    style={[styles.map, getMapViewStyle()]}
                    showsUserLocation
                    initialRegion={region}
                    onPress={clearHightLight}
                >
                    {locations && showPolyline(locations)}
                    {markers &&
                        markers.map((marker: any) => {
                            const coordinate = JSON.parse(marker.storeLocation)
                            if (!coordinate || !coordinate.latitude || !coordinate.longitude) {
                                return null
                            }

                            return (
                                <Marker
                                    key={marker.Id}
                                    coordinate={JSON.parse(marker.storeLocation)}
                                    onPress={() => {
                                        handleMarker(marker)
                                    }}
                                >
                                    {currentTab === TabID.TabID_Delivery
                                        ? showDelivery(marker, false, highlightDriver)
                                        : showPinByType(marker, currentTab, false)}
                                </Marker>
                            )
                        })}

                    {employeeList.map((item: any) => showUsersPhoto(item, handlePressUserPin))}
                </MapView>
            </View>
            <SwitchableMapModal
                currentTab={currentTab}
                navigation={navigation}
                isIndividual
                region={region}
                setMapModalVisible={setMapModalVisible}
                merchMapModal={merchMapModal}
                mapModalVisible={mapModalVisible}
                deliveryMapModal={deliveryMapModal}
                salesMapModal={salesMapModal}
            />
            <Loading isLoading={isLoading} />
        </>
    )
}

export default MapScreen

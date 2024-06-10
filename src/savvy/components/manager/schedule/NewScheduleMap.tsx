/**
 * @description Employee list component
 * @author Kevin Gu
 * @email kevin.l.gu@pwc.com
 * @date 2021-05-13
 */

import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Image, Dimensions } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { VisitStatus } from '../../../enums/Visit'
import LocationService from '../../../service/LocationService'
import CText from '../../../../common/components/CText'
import { getMapMarkers, parasVisits, parseMarkers } from '../../../helper/manager/mapHelper'
import { callByPhone, smsByPhone } from '../../../../common/utils/LinkUtils'
import { NavigationRoute } from '../../../enums/Manager'
import _ from 'lodash'
import ManagerMapModal from '../../merchandiser/ManagerMapModal'

const styles = StyleSheet.create({
    container: {
        height: '100%'
    },
    map: {
        width: Dimensions.get('window').width,
        height: 600,
        marginTop: -20
    },
    modalStyle: {
        marginHorizontal: 35,
        marginTop: 56
    },
    landscapeWidth: {
        flex: 1
    },
    circle: {
        width: 10,
        height: 10,
        borderRadius: 15,
        backgroundColor: '#FFF',
        position: 'absolute',
        left: 13,
        top: 11
    },
    sequence: {
        width: 20,
        height: 20,
        borderRadius: 15,
        position: 'absolute',
        left: 8,
        top: 8,
        color: '#FFF',
        textAlign: 'center',
        fontSize: 12
    },
    iconSize: {
        height: 36,
        width: 36
    },
    iconPosition: {
        position: 'relative'
    }
})

interface NewScheduleMapProps {
    employeeList
    navigation
    isLandscape
    params
    currentCardId?: any
    handleSelectedEmployee?: any
    formateCurrentDate: string
}

const NewScheduleMap = (props: NewScheduleMapProps) => {
    const mapModal: any = useRef()
    const { employeeList, isLandscape, currentCardId = null, navigation, handleSelectedEmployee, params } = props
    const [markers, setMarkers] = useState([])
    const [activeUser, setActiveUser] = useState(null)
    const [region, setRegion] = useState(null)
    const [mapModalVisible, setMapModalVisible] = useState(false)
    const mapRef = useRef<MapView>(null)

    const [allMerchVisit, setAllMerchVisit] = useState([])

    const onPressMark = (item) => {
        mapModal.current.openModal(item)
        navigation.setOptions({ tabBarVisible: false })
        setMapModalVisible(true)
    }

    useEffect(() => {
        const allMerchVisits = parasVisits(employeeList)
        setAllMerchVisit(allMerchVisits)
        getMapMarkers(allMerchVisits, setRegion, setActiveUser, setMarkers, mapRef)
    }, [employeeList])

    const handlePressPin = (item) => {
        let allvisits = []
        if (isLandscape) {
            allvisits = _.cloneDeep(allMerchVisit)
        }
        const visitor = item.VisitorId || 'unassigned'
        if (activeUser !== item.VisitorId) {
            allvisits.forEach((marker: any) => {
                if (!marker.VisitorId) {
                    marker.VisitorId = 'unassigned'
                }
                marker.inActive = marker.VisitorId !== visitor
            })
            const bounding = LocationService.getBoundingBox(
                {
                    latitude: item.Latitude,
                    longitude: item.Longitude
                },
                allvisits.filter((vis) => {
                    return !vis.inActive
                })
            )
            setRegion(bounding.initialRegion)
            setActiveUser(visitor)
            setMarkers(parseMarkers(allvisits))
        } else {
            onPressMark(item)
        }
    }

    const handlePressMap = () => {
        const allVisits = _.cloneDeep(markers)
        allVisits.forEach((marker: any) => {
            marker.inActive = false
        })
        setActiveUser(null)
        setMarkers(allVisits)
        handleSelectedEmployee && handleSelectedEmployee('')
    }

    useEffect(() => {
        if (currentCardId) {
            const employeeFilter = employeeList.filter((employee) => {
                return employee.id === currentCardId
            })
            const item = employeeFilter[0]
            const allVisits = employeeList.reduce((a, b) => {
                return a.concat(b.visits)
            }, [])

            allVisits.forEach((marker: any) => {
                marker.inActive = marker.id !== currentCardId
            })

            const bounding = LocationService.getBoundingBox(
                {
                    latitude: item.Latitude,
                    longitude: item.Longitude
                },
                allVisits.filter((vis) => {
                    return !vis.inActive
                })
            )
            setRegion(bounding.initialRegion)
            setActiveUser(currentCardId)
            setMarkers(allVisits)
        } else {
            handlePressMap()
        }
    }, [currentCardId])

    useEffect(() => {
        if (isLandscape) {
            const allMerchVisits = parasVisits(employeeList)
            setAllMerchVisit(allMerchVisits)
            getMapMarkers(allMerchVisits, setRegion, setActiveUser, setMarkers, mapRef)
        }
    }, [isLandscape])

    const showPinMerch = (item) => {
        return (
            <>
                {item.inActive && item.Status__c === VisitStatus.COMPLETE && (
                    <Image style={styles.iconSize} source={ImageSrc.PIN_COMPLETE_GREY} />
                )}
                {item.inActive && item.Status__c !== VisitStatus.COMPLETE && (
                    <Image style={styles.iconSize} source={ImageSrc.PIN_IN_PROGRESS_GREY} />
                )}
                {!item.inActive && item.Status__c === VisitStatus.IN_PROGRESS && (
                    <Image style={styles.iconSize} source={ImageSrc.PIN_IN_PROGRESS} />
                )}
                {!item.inActive && item.Status__c === VisitStatus.COMPLETE && (
                    <Image style={styles.iconSize} source={ImageSrc.PIN_COMPLETE} />
                )}
                {!item.inActive &&
                    (item.Status__c === VisitStatus.PUBLISHED || item.Status__c === VisitStatus.PLANNED) && (
                        <View style={styles.iconPosition}>
                            <Image style={styles.iconSize} source={ImageSrc.PIN_NOT_START} />
                            {activeUser && activeUser === item.Id && item.Sequence__c ? (
                                <CText style={styles.sequence}>{item.Sequence__c}</CText>
                            ) : (
                                <View style={styles.circle} />
                            )}
                        </View>
                    )}
            </>
        )
    }

    const showMarkers = (item) => {
        return (
            <Marker
                coordinate={{ latitude: item.Latitude || 0, longitude: item.Longitude || 0 }}
                key={item.VisitId}
                onPress={(event) => {
                    event.stopPropagation()
                    handlePressPin(item)
                    handleSelectedEmployee && handleSelectedEmployee(item.id)
                }}
            >
                {showPinMerch(item)}
            </Marker>
        )
    }

    return (
        <>
            {region && (
                <MapView
                    ref={mapRef}
                    onPress={handlePressMap}
                    loadingEnabled
                    style={[isLandscape ? styles.landscapeWidth : styles.map]}
                    showsUserLocation
                    initialRegion={region}
                >
                    {markers.map((item: any) => showMarkers(item))}
                </MapView>
            )}
            <ManagerMapModal
                cRef={mapModal}
                modalStyle={styles.modalStyle}
                navigation={navigation}
                isShowRouteTab
                visible={mapModalVisible}
                onHideMapModal={() => {
                    navigation.setOptions({ tabBarVisible: false })
                    setMapModalVisible(false)
                }}
                onPressTabIcons={(modalData, index) => {
                    if (index === 0) {
                        smsByPhone(modalData.phoneNumber)
                    }
                    if (index === 1) {
                        callByPhone(modalData.phoneNumber)
                    }
                    if (index === 2) {
                        const pushData = modalData
                        pushData.name = pushData.userName
                        navigation?.navigate(NavigationRoute.EMPLOYEE_SCHEDULE_LIST, {
                            navigation: navigation,
                            employeeData: pushData,
                            selectedWeek: params?.activeWeek,
                            selectedDay: params?.activeDay,
                            tmpWeekArr: params?.weekArr
                        })
                    }
                }}
            />
        </>
    )
}

export default NewScheduleMap

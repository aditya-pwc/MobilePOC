/**
 * @description Employee list component
 * @author Kevin Gu
 * @email kevin.l.gu@pwc.com
 * @date 2021-05-13
 */

import React, { useEffect, useRef, useState, useImperativeHandle } from 'react'
import { StyleSheet, Dimensions, Image, View } from 'react-native'
import { Marker } from 'react-native-maps'
import { TabID } from '../../../redux/types/H01_Manager/data-tabIndex'
import { getMapMarkers, showPinByType, isToday, getEmployees } from '../../../helper/manager/mapHelper'
import { VisitStatus } from '../../../enums/Visit'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import CText from '../../../../common/components/CText'
import _ from 'lodash'
import { Persona } from '../../../../common/enums/Persona'
import { CommonParam } from '../../../../common/CommonParam'
import UserAvatar from '../../common/UserAvatar'
import moment from 'moment'
import ClusteredMapView from '../../rep/lead/clustered-map/ClusteredMapView'
import { commonStyle } from '../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    container: {
        height: '100%'
    },
    map: {
        width: Dimensions.get('window').width,
        height: 500,
        marginTop: -20,
        flex: 1
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
    flipPhone: {
        position: 'absolute',
        width: 50,
        height: 50,
        zIndex: 100,
        top: 22,
        right: 10
    },
    activityImgUserImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#00A2D9'
    },

    imgUserImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFF'
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
    pinImageStyle: {
        width: 36,
        height: 36
    }
})
interface SwitchableMapProps {
    activeTab
    currentVisits
    onPressMark
    isLandscape
    currentCardId?: any
    selectedDay: any
    cRef?: any
}

export const showUsersPhoto = (item, handlePressUserPin) => {
    // Note that the latitude and longitude here is lowercase

    return (
        <Marker
            coordinate={{ latitude: item.latitude ?? 0, longitude: item.longitude ?? 0 }}
            key={item.visitorId || item.VisitorId}
            onPress={(event) => {
                event.stopPropagation()
                handlePressUserPin(item)
            }}
        >
            <View>
                <UserAvatar
                    userStatsId={item.userStatsId}
                    firstName={item.firstName}
                    lastName={item.lastName}
                    avatarStyle={item.isActiveUser ? styles.activityImgUserImage : styles.imgUserImage}
                    userNameText={{ fontSize: 16 }}
                />
            </View>
        </Marker>
    )
}

const SwitchableMap = (props: SwitchableMapProps) => {
    const { activeTab, currentVisits, onPressMark, isLandscape, selectedDay, cRef } = props
    const [markers, setMarkers] = useState([])
    const [activeUser, setActiveUser] = useState(null)
    const [region, setRegion] = useState({
        latitude: '',
        longitude: '',
        latitudeDelta: '',
        longitudeDelta: ''
    })
    const [employeeList, setEmployeeList] = useState([])
    const [activeRoute, setActiveRoute] = useState(null)
    const currentTab = useRef()
    const mapRef = useRef(null)
    const serviceInterval = useRef(null)

    const intervalFn = () => {
        // can not set loading because  serviceInterval
        getEmployees(currentVisits, activeTab)
            .then((userList) => {
                if (currentTab.current === userList.activeTab) {
                    setEmployeeList(userList.newUserWithLocation)
                }
            })
            .catch(() => {
                setEmployeeList([])
            })
    }

    useEffect(() => {
        let isUnmounted = false
        if (isUnmounted) {
            return
        }
        currentTab.current = activeTab
        // get pin
        if (currentVisits.length > 0) {
            getMapMarkers(currentVisits, setRegion, setActiveUser, setMarkers, null, activeTab, currentTab)
        } else {
            setMarkers([])
        }

        const currentDate = selectedDay || moment()

        clearInterval(serviceInterval.current)
        setEmployeeList([])

        // every 5 min get user photo
        if (isToday(currentDate)) {
            intervalFn()
            serviceInterval.current = setInterval(intervalFn, 5 * 60 * 1000)
        }
        return () => {
            isUnmounted = true
            clearInterval(serviceInterval.current)
        }
    }, [currentVisits, activeTab])

    useImperativeHandle(cRef, () => ({
        setMarker: () => {
            setMarkers([])
        }
    }))

    const heightLightEmployee = (visitorId) => {
        const tempEmployeeList = _.cloneDeep(employeeList)
        tempEmployeeList.forEach((user: any) => {
            user.isActiveUser = visitorId === user.visitorId
        })
        setEmployeeList(tempEmployeeList)
    }

    const heightLightVisitPin = (visitorId, visitInfo?) => {
        const allMarks = _.cloneDeep(markers)
        allMarks.forEach((marker) => {
            if (activeTab === TabID.TabID_Sales) {
                marker.inActive = marker.VisitorId !== visitorId || marker.RouteId !== visitInfo?.RTE_ID__c
            } else {
                marker.inActive = marker.VisitorId !== visitorId
            }
        })
        setMarkers(allMarks)
    }

    const handlePressUserPin = (item) => {
        heightLightEmployee(item.visitorId)
        // Note that the latitude and longitude here is lowercase
        heightLightVisitPin(item.visitorId)
        setActiveUser(item.visitorId)
    }

    const handlePressPin = (item, setActiveUserTemp) => {
        if (activeTab === TabID.TabID_Sales && (activeRoute !== item.RouteId || activeUser !== item.VisitorId)) {
            setActiveRoute(item.RouteId)
            heightLightVisitPin(item.VisitorId, item)
            setActiveUserTemp(item.VisitorId)
        } else if (activeUser !== item.VisitorId && activeTab !== TabID.TabID_Sales) {
            const currentVisitorId = item.VisitorId
            heightLightEmployee(currentVisitorId)
            heightLightVisitPin(currentVisitorId)
            setActiveUserTemp(currentVisitorId)
            setActiveRoute(null)
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

        heightLightEmployee('allUserNotHeightLight')
    }

    const showPinMerch = (item) => {
        return (
            <>
                {item.inActive && item.Status__c === VisitStatus.COMPLETE && (
                    <Image style={styles.pinImageStyle} source={ImageSrc.PIN_COMPLETE_GREY} />
                )}
                {item.inActive && item.Status__c !== VisitStatus.COMPLETE && (
                    <Image style={styles.pinImageStyle} source={ImageSrc.PIN_IN_PROGRESS_GREY} />
                )}
                {!item.inActive && item.Status__c === VisitStatus.IN_PROGRESS && (
                    <Image style={styles.pinImageStyle} source={ImageSrc.PIN_IN_PROGRESS} />
                )}
                {!item.inActive && item.Status__c === VisitStatus.COMPLETE && (
                    <Image style={styles.pinImageStyle} source={ImageSrc.PIN_COMPLETE} />
                )}
                {!item.inActive &&
                    (item.Status__c === VisitStatus.PUBLISHED || item.Status__c === VisitStatus.PLANNED) && (
                        <View style={commonStyle.relativePosition}>
                            <Image style={styles.pinImageStyle} source={ImageSrc.PIN_NOT_START} />
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
        const identifier = [VisitStatus.COMPLETE, VisitStatus.IN_PROGRESS].includes(item.status)
            ? item.status
            : 'Others'
        return (
            <Marker
                coordinate={{ latitude: item.latitude ?? 0, longitude: item.longitude ?? 0 }}
                key={item.VisitId}
                onPress={(event) => {
                    event.stopPropagation()
                    handlePressPin(item, setActiveUser)
                }}
                identifier={identifier}
            >
                {activeTab === TabID.TabID_Delivery && showPinByType(item, TabID.TabID_Delivery, true)}
                {activeTab === TabID.TabID_Merch && showPinMerch(item)}
                {activeTab === TabID.TabID_Sales && showPinByType(item, TabID.TabID_Sales, true)}
            </Marker>
        )
    }

    useEffect(() => {
        if (markers.length > 0 && region?.latitude && region?.longitude) {
            const coordinates = []
            markers.forEach((item: any) => {
                if (item.latitude || item.longitude) {
                    coordinates.push({ latitude: item.latitude, longitude: item.longitude })
                }
            })
            coordinates.push({ latitude: region.latitude, longitude: region.longitude })
            mapRef.current?.fitToCoordinates(coordinates, {
                edgePadding: { top: 20, right: 5, bottom: 20, left: 5 }
            })
        }
    }, [markers])

    return (
        <>
            {!isLandscape && (
                <ClusteredMapView
                    ref={mapRef}
                    onPress={handlePressMap}
                    loadingEnabled
                    style={[isLandscape ? styles.landscapeWidth : styles.map]}
                    initialRegion={region}
                    needUpdateRegion
                    edgePadding={{ top: 0, left: 0, right: 0, bottom: 0 }}
                    animationEnabled={false}
                    showsUserLocation
                    clusterGroupColor={{ Complete: '#2CD36F', 'In Progress': '#6C0CC3', Others: '#00A2D9' }}
                >
                    {CommonParam.PERSONA__c === Persona.MERCH_MANAGER && !isLandscape && (
                        <Image
                            style={styles.flipPhone}
                            source={require('../../../../../assets/image/Flip-Phone.gif')}
                        />
                    )}
                    {markers.map((item: any) => showMarkers(item))}
                    {employeeList.map((item: any) => showUsersPhoto(item, handlePressUserPin))}
                </ClusteredMapView>
            )}
        </>
    )
}

export default SwitchableMap

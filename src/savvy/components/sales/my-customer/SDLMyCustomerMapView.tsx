/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2023-10-30 17:59:31
 * @LastEditTime: 2023-11-16 17:11:28
 * @LastEditors: Mary Qian
 */

import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, ImageBackground } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import _ from 'lodash'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import CustomerMapModal from '../../merchandiser/CustomerMapModal'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import LocationService from '../../../service/LocationService'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { Log } from '../../../../common/enums/Log'

const styles = StyleSheet.create({
    mapPin: {
        width: 40,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    }
})

const DEFAULT_LOC = {
    latitude: 40.7121001,
    longitude: -74.0125118
}

const SDLMyCustomerMapView = (props: any) => {
    const { customerList, navigation } = props
    const merchMapModalRef: any = useRef()
    const mapRef = useRef<MapView>(null)
    const [region, setRegion] = useState(null)
    const [showMapModal, setShowMapModal] = useState(false)

    interface MarkerModal {
        totalMarkers: any
        region: any
    }

    const getMapMarkers = (customerList: any) => {
        return new Promise<MarkerModal>((resolve, reject) => {
            const storeVisits = customerList.map((customer: any) => {
                const newObj = _.cloneDeep(customer)
                newObj.storeLocation = JSON.stringify({
                    longitude: customer.Customer_Longitude__c,
                    latitude: customer.Customer_Latitude__c
                })
                return newObj
            })

            LocationService.getCurrentPosition()
                .then((position: any) => {
                    let pos = DEFAULT_LOC
                    if (position?.coords?.latitude && position?.coords?.longitude) {
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
                    storeClassLog(Log.MOBILE_WARN, 'getMapMarkers', `failed: ${ErrorUtils.error2String(err)}`)
                })
        })
    }

    useEffect(() => {
        if (customerList && customerList.length > 0) {
            getMapMarkers(customerList).then((mapInfoTmp) => {
                setRegion(mapInfoTmp.region)
            })
        }

        mapRef.current?.fitToElements()
    }, [customerList])

    const renderMapView = () => {
        return (
            <View style={{ flex: 1 }}>
                <MapView ref={mapRef} style={{ flex: 1 }} showsUserLocation initialRegion={region}>
                    {customerList?.map((marker: any) => {
                        if (!marker.Customer_Longitude__c || !marker.Customer_Latitude__c) {
                            return null
                        }

                        return (
                            <Marker
                                key={marker.AccountId}
                                coordinate={{
                                    longitude: marker.Customer_Longitude__c,
                                    latitude: marker.Customer_Latitude__c
                                }}
                                onPress={() => {
                                    merchMapModalRef?.current?.openModal({ item: marker })
                                    setShowMapModal(true)
                                }}
                            >
                                {
                                    <ImageBackground
                                        style={styles.mapPin}
                                        resizeMode={'contain'}
                                        source={ImageSrc.PIN_YET_TO_START}
                                    />
                                }
                            </Marker>
                        )
                    })}
                </MapView>

                <CustomerMapModal
                    cRef={merchMapModalRef}
                    navigation={navigation}
                    showMapModal={showMapModal}
                    setShowMapModal={setShowMapModal}
                />
            </View>
        )
    }

    return renderMapView()
}

export default SDLMyCustomerMapView

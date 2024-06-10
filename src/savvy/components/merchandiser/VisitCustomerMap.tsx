/*
 * @Description: A expandable card shows work order of the retail store
 * @Author: Christopher ZANG
 * @Date: 2021-08-23 21:42:36
 * @LastEditTime: 2022-02-16 04:10:39
 * @LastEditors: Mary Qian
 */
/* eslint-disable camelcase */

import React, { useRef } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import 'moment-timezone'
import { visitStyle } from './VisitStyle'
import MapView, { Marker } from 'react-native-maps'
import { ImageSrc } from '../../../common/enums/ImageSrc'

const styles = StyleSheet.create({
    positionRelative: {
        position: 'relative'
    },
    pinNotStartSize: {
        height: 36,
        width: 36
    }
})
const VisitCustomerMap = (parentProps) => {
    const { customerData } = parentProps
    const mapRef = useRef<MapView>(null)

    let location = customerData.storeLocation
    if (typeof location === 'string') {
        location = JSON.parse(location)
    }

    const initialRegion = {
        latitude: parseFloat(location.latitude) || 0,
        longitude: parseFloat(location.longitude) || 0,
        latitudeDelta: 0.1422,
        longitudeDelta: 0.1221
    }
    return (
        <MapView
            ref={mapRef}
            loadingEnabled
            zoomEnabled={false}
            scrollEnabled={false}
            style={[visitStyle.map]}
            initialRegion={initialRegion}
        >
            <Marker
                coordinate={{ latitude: initialRegion.latitude, longitude: initialRegion.longitude }}
                key={customerData.id}
            >
                <View style={styles.positionRelative}>
                    <Image style={styles.pinNotStartSize} source={ImageSrc.PIN_NOT_START} />
                    <View style={visitStyle.circle} />
                </View>
            </Marker>
        </MapView>
    )
}

export default VisitCustomerMap

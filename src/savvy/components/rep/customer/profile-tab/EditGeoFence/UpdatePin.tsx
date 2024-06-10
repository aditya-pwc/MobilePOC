/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2024-01-29 15:37:41
 * @LastEditTime: 2024-02-19 17:36:36
 * @LastEditors: Mary Qian
 */

import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { NavigationProp, RouteProp } from '@react-navigation/native'
import MapView, { LatLng, MAP_TYPES, MapPressEvent, MapType, Marker, Polygon } from 'react-native-maps'
import { Button } from 'react-native-elements'
import CText from '../../../../../../common/components/CText'
import { baseStyle } from '../../../../../../common/styles/BaseStyle'
import { ImageSrc } from '../../../../../../common/enums/ImageSrc'
import { commonStyle } from '../../../../../../common/styles/CommonStyle'
import SelectTab from '../../../../common/SelectTab'
import { t } from '../../../../../../common/i18n/t'
import Pin from '../../../../../../../assets/image/icon-color-location.svg'
import { GeoFenceProps } from './GeoFenceModal'
import { GEO_FENCE_TYPE } from './SelectGeoFenceTypeModal'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF'
    },
    header: {
        ...commonStyle.alignCenter,
        position: 'relative',
        marginTop: 64,
        marginBottom: 24
    },
    title: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    btnBack: {
        position: 'absolute',
        left: 22
    },
    imgBack: {
        width: 12,
        height: 20
    },
    middleLine: {
        backgroundColor: '#D3D3D3',
        height: 1,
        marginHorizontal: 22
    },
    infoText: {
        marginTop: 22,
        marginHorizontal: 22,
        fontSize: 14,
        fontWeight: '400',
        color: '#565656'
    },
    selectTap: {
        marginTop: 20,
        zIndex: 999
    },
    mapView: {
        flex: 1,
        marginTop: -20,
        marginBottom: 0
    },
    saveView: {
        height: 64,
        width: '100%',
        borderColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.14,
        shadowRadius: 4
    },
    saveText: {
        width: '100%',
        fontWeight: '700',
        color: '#FFF',
        textAlign: 'center',
        fontSize: 12
    },
    saveTextEnable: {
        color: '#FFF'
    },
    saveTextDisable: {
        color: '#D3D3D3'
    },
    saveBtn: {
        height: 64,
        width: '100%',
        paddingBottom: 20,
        backgroundColor: '#6217B9'
    },
    saveBtnDisable: {
        fontWeight: 700,
        color: '#rgb(211, 211, 211)',
        fontSize: 12,
        width: '100%',
        backgroundColor: '#FFF'
    }
})

interface UpdatePinProps {
    navigation: NavigationProp<any>
    route: RouteProp<any>
}

const UpdatePin = (props: UpdatePinProps) => {
    const { route, navigation } = props
    const type: GEO_FENCE_TYPE = route?.params?.type || {}
    const geoFenceData: GeoFenceProps = route?.params?.geoFenceData || {}
    const isSales = type === GEO_FENCE_TYPE.Sales
    const geoFence = isSales ? geoFenceData.salesGeoFence : geoFenceData.deliveryGeoFence
    const oldPin = isSales ? geoFenceData.salesPin : geoFenceData.deliveryPin

    const mapRef = useRef<MapView>(null)

    const [activeTab, setActiveTab] = useState(0)
    const [isSaveEnabled, setIsSaveEnabled] = useState(false)
    const [newPin, setNewPin] = useState<LatLng | null>(null)
    const [mapType, setMapType] = useState<MapType>(MAP_TYPES.STANDARD)

    const selectTabData = [
        {
            name: t.labels.PBNA_MOBILE_DEFAULT
        },
        {
            name: t.labels.PBNA_MOBILE_SATELLITE
        }
    ]

    const onTabChanged = (index: number) => {
        setActiveTab(index)
        if (index === 0) {
            setMapType(MAP_TYPES.STANDARD)
        }

        if (index === 1) {
            setMapType(MAP_TYPES.SATELLITE)
        }
    }

    const onPressBack = () => {
        navigation.navigate('EditGeoFence', {
            navigation,
            ...route.params,
            newPin: null
        })
    }

    const onDropPin = (e: MapPressEvent) => {
        setNewPin(e.nativeEvent.coordinate)
        setIsSaveEnabled(true)
    }

    const onPressSave = () => {
        navigation.navigate('EditGeoFence', {
            navigation,
            ...route.params,
            newPin
        })
    }

    useEffect(() => {
        if (geoFence.length > 0) {
            mapRef?.current?.fitToCoordinates(geoFence)
        }
    }, [])

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <CText style={styles.title}>{t.labels.PBNA_MOBILE_UPDATE_PIN}</CText>
                <TouchableOpacity style={styles.btnBack} hitSlop={commonStyle.hitSlop} onPress={onPressBack}>
                    <Image source={ImageSrc.IMG_BACK} style={styles.imgBack} />
                </TouchableOpacity>
            </View>

            <View style={styles.middleLine} />
            <CText style={styles.infoText}>{t.labels.PBNA_MOBILE_UPDATE_PIN_MSG}</CText>

            <SelectTab
                style={styles.selectTap}
                listData={selectTabData}
                changeTab={onTabChanged}
                activeTab={activeTab}
            />

            <MapView ref={mapRef} style={styles.mapView} mapType={mapType} initialRegion={oldPin} onPress={onDropPin}>
                <Polygon
                    coordinates={geoFence}
                    strokeColor={isSales ? '#6A1ABE' : '#0095BE'}
                    fillColor={isSales ? 'rgba(106,26,190,0.1)' : 'rgba(0,149,190,0.38)'}
                />

                <Marker coordinate={oldPin}>
                    <Pin width={24} height={30} color={'#D3D3D3'} />
                </Marker>

                {newPin && (
                    <Marker coordinate={newPin}>
                        <Pin width={24} height={30} color={'#00A2D9'} />
                    </Marker>
                )}
            </MapView>

            <View style={[styles.saveView]}>
                <Button
                    onPress={onPressSave}
                    title={
                        <CText
                            style={[styles.saveText, isSaveEnabled ? styles.saveTextEnable : styles.saveTextDisable]}
                        >
                            {t.labels.PBNA_MOBILE_SAVE.toLocaleUpperCase()}
                        </CText>
                    }
                    disabled={!isSaveEnabled}
                    disabledStyle={styles.saveBtnDisable}
                    buttonStyle={styles.saveBtn}
                />
            </View>
        </View>
    )
}

export default UpdatePin

/*
 * @Date: 2022-03-30 14:04:54
 * @LastEditors: Matthew Huang
 * @LastEditTime: 2022-04-06 11:45:16
 */
import React, { useEffect, useRef, useState } from 'react'
import { Dimensions, StyleSheet, TouchableOpacity, Image, View } from 'react-native'
import { t } from '../../../../common/i18n/t'
import CText from '../../../../common/components/CText'
import MapView, { Marker } from 'react-native-maps'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import TitleModal from '../../../../common/components/TitleModal'
import _ from 'lodash'
import { getMapMarkers } from '../../../helper/manager/mapHelper'

interface OrdersMapProps {
    orderList
    navigation
    isLandscape
    RenderItem
}

const styles = StyleSheet.create({
    topTabsContainer: {
        marginTop: -23,
        zIndex: 100,
        height: 44,
        marginHorizontal: 22,
        padding: 6,
        borderWidth: 1,
        borderRadius: 4,
        shadowOpacity: 0.4,
        backgroundColor: 'white',
        borderColor: '#D3D3D3',
        shadowColor: '#004C97',
        shadowOffset: { width: 0, height: 2 },
        flexDirection: 'row'
    },
    topTabsItemNormalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    topTabsItemActiveContainer: {
        backgroundColor: '#00A2D9'
    },
    topTabsItemNormalText: {
        color: '#00A2D9',
        fontSize: 12,
        fontWeight: '700'
    },
    topTabsItemActiveText: {
        color: '#FFFFFF'
    },
    map: {
        width: Dimensions.get('window').width,
        height: 500,
        marginTop: -20
    },
    landscapeWidth: {
        flex: 1
    },
    markerImageStyle: {
        height: 36,
        width: 36
    },
    orderInfoContainer: {
        width: '100%',
        marginBottom: 34
    }
})

const getTabArr = () => {
    return [
        {
            tabIndex: 0,
            label: t.labels.PBNA_MOBILE_ALL_ORDERS.toUpperCase()
        },
        {
            tabIndex: 1,
            label: t.labels.PBNA_MOBILE_OFF_SCHEDULE.toUpperCase()
        }
    ]
}

const OrderMap = ({ orderList, isLandscape, navigation, RenderItem }: OrdersMapProps) => {
    const [activeTab, setActiveTab] = useState(0)
    const [activeModal, setActiveModal] = useState()
    const [markers, setMarkers] = useState([])
    const [region, setRegion] = useState(null)

    const mapRef = useRef<MapView>()

    useEffect(() => {
        getMapMarkers(orderList, setRegion, () => null, setMarkers, mapRef)
    }, [orderList])

    const onTabPress = (tabIndex) => setActiveTab(tabIndex)

    useEffect(() => {
        mapRef?.current?.fitToElements({ animated: true })
    }, [activeTab])

    const onMarkPress = (orderInfo) => {
        setActiveModal(orderInfo)
        navigation.setOptions({ tabBarVisible: false })
    }

    const onHideMapModal = () => {
        setActiveModal(undefined)
        navigation.setOptions({ tabBarVisible: true })
    }

    return (
        <>
            <View style={styles.topTabsContainer}>
                {getTabArr().map((tab) => {
                    // Render Tab Bar
                    return (
                        <TouchableOpacity
                            key={tab.tabIndex}
                            onPress={() => onTabPress(tab.tabIndex)}
                            style={[
                                styles.topTabsItemNormalContainer,
                                activeTab === tab.tabIndex && styles.topTabsItemActiveContainer
                            ]}
                        >
                            <CText
                                style={[
                                    styles.topTabsItemNormalText,
                                    activeTab === tab.tabIndex && styles.topTabsItemActiveText
                                ]}
                            >
                                {tab.label}
                            </CText>
                        </TouchableOpacity>
                    )
                })}
            </View>

            <MapView // Render Map
                ref={mapRef}
                initialRegion={region}
                loadingEnabled
                style={isLandscape ? styles.landscapeWidth : styles.map}
            >
                {markers.map((order) => {
                    if (activeTab === 1 && order.OffSchedule === '0') {
                        // Filter On Schedule in Off schedule Tab
                        return undefined
                    }
                    return (
                        <Marker
                            coordinate={{
                                latitude: order.Latitude || 1,
                                longitude: order.Longitude || 1
                            }}
                            key={order.Id}
                            onPress={(event) => {
                                event.stopPropagation()
                                onMarkPress(order)
                            }}
                        >
                            <Image
                                style={styles.markerImageStyle}
                                source={
                                    order.OffSchedule === '0'
                                        ? ImageSrc.PIN_ON_SCHEDULE_ORDERS
                                        : ImageSrc.PIN_OFF_SCHEDULE_ORDERS
                                }
                            />
                        </Marker>
                    )
                })}
            </MapView>

            <TitleModal
                title={t.labels.PBNA_MOBILE_ORDER_INFO.toUpperCase()}
                visible={!!activeModal}
                onClose={onHideMapModal}
            >
                {!_.isEmpty(activeModal) && (
                    <View style={styles.orderInfoContainer}>
                        <RenderItem item={activeModal} />
                    </View>
                )}
            </TitleModal>
        </>
    )
}

export default OrderMap

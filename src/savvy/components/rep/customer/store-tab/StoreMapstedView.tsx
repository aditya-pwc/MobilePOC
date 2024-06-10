import React, { FC, useEffect, useState } from 'react'
import { StyleSheet, View, TouchableOpacity, NativeAppEventEmitter } from 'react-native'
import MapstedView from '../../../mapsted/MapstedView'
import Expand from '../../../../../../assets/image/ExpandMapIcon@3x.svg'
import { EventEmitterType } from '../../../../enums/Manager'

interface StoreMapstedProps {
    storeId?: string
    propertyId?: number
    unloadMap?: boolean
    onMapLoadCallback?: Function
    onMapSelectLocation?: Function
    onMapUnloadCallback?: Function
    onMapInitialCallback?: Function
    navigation?: any
    setShowMap: Function
}

const styles = StyleSheet.create({
    mapstedContainer: {
        width: '100%',
        height: '100%'
    },
    mapsted: {
        width: '100%',
        height: '100%'
    },
    mapstedButton: {
        width: 40,
        height: 40,
        top: 20,
        right: 20,
        position: 'absolute'
    }
})

const StoreMapstedView: FC<StoreMapstedProps> = (props: StoreMapstedProps) => {
    const {
        storeId,
        navigation,
        propertyId,
        setShowMap,
        onMapLoadCallback,
        onMapUnloadCallback,
        onMapSelectLocation,
        onMapInitialCallback
    } = props
    const [unloadMap, setUnloadMap] = useState(false)
    const [isMapsteadLoaded, setIsMapsteadLoaded] = useState(false)
    const [buildingIds, setBuildingIds] = useState(() => new Set())

    useEffect(() => {
        const mapstedListener = NativeAppEventEmitter.addListener(EventEmitterType.REFRESH_MAPSTED, async () => {
            setUnloadMap(false)
            setShowMap(true)
        })
        return () => {
            mapstedListener && mapstedListener.remove()
        }
    }, [])

    const onLoadCallback = (event) => {
        // Do stuff with event.region.latitude, etc.
        setIsMapsteadLoaded(true)
        if (event.buildingId) {
            setBuildingIds((prev) => new Set(prev).add(event.buildingId))
        }
        if (onMapLoadCallback) {
            onMapLoadCallback(event)
        }
    }

    const onInitialCallback = (event) => {
        // Do stuff with event.region.latitude, etc.
        if (onMapInitialCallback) {
            onMapInitialCallback(event)
        }
    }

    const onUnloadCallback = (event) => {
        // Do stuff with event.region.latitude, etc.
        if (unloadMap) {
            setShowMap(false)
            global.$globalModal.closeModal()
            navigation.navigate('CustomerMyStoreMapScreen', {
                storePropertyId: propertyId,
                storeId: storeId,
                buildingIds: buildingIds
            })
        }
        if (onMapUnloadCallback) {
            onMapUnloadCallback(event)
        }
    }

    const onSelectLocation = (event) => {
        // Do stuff with event.region.latitude, etc.
        if (onMapSelectLocation) {
            onMapSelectLocation(event)
        }
    }

    const renderMapsted = () => {
        return (
            <View style={styles.mapstedContainer}>
                <MapstedView
                    style={styles.mapsted}
                    propertyId={propertyId}
                    unloadMap={unloadMap}
                    onLoadCallback={onLoadCallback}
                    onUnloadCallback={onUnloadCallback}
                    onSelectLocation={onSelectLocation}
                    onInitialCallback={onInitialCallback}
                />
                {isMapsteadLoaded && (
                    <View style={styles.mapstedButton}>
                        <TouchableOpacity
                            onPress={() => {
                                global.$globalModal.openModal()
                                setUnloadMap(true)
                            }}
                        >
                            <Expand height={40} width={40} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        )
    }

    return propertyId !== 0 && renderMapsted()
}

export default StoreMapstedView

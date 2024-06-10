import React, { useEffect, useState } from 'react'
import { Dimensions, NativeAppEventEmitter, StyleSheet, View } from 'react-native'
import MyStoreNavHeader from './MyStoreNavHeader'
import { EventEmitterType } from '../../../../enums/Manager'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { WebView } from 'react-native-webview'
import { CommonApi } from '../../../../../common/api/CommonApi'
import StoreMapstedDataService from './StoreMapstedDataService'
import Loading from '../../../../../common/components/Loading'
import MapstedUIView from '../../../mapsted/MapstedUIView'

const styles = StyleSheet.create({
    mapstedContainer: {
        width: '100%',
        height: Dimensions.get('window').height - 150
    },
    mapsted: {
        width: '100%',
        height: '100%'
    },
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    buttonStyle: {
        position: 'absolute',
        backgroundColor: 'red',
        width: 100,
        height: 50,
        left: 100,
        top: 100
    },
    image: {
        width: '100%',
        height: '100%'
    },
    draggable: {
        width: '100%',
        height: '100%'
    }
})

interface CustomerMyStoreMapScreenProps {
    props: any
    route: any
    navigation: any
}
const CustomerMyStoreMapScreen = ({ route, navigation }: CustomerMyStoreMapScreenProps) => {
    const { storePropertyId, storeId, buildingIds } = route.params
    const [unloadMap, setUnloadMap] = useState(false)
    const [showTweaks, setshowTweaks] = useState(false)
    const [tweaksToken, setTweaksToken] = useState('')
    const [tweaksUrl, setTweaksUrl] = useState('')

    const rightButtonClick = () => {
        setshowTweaks(!showTweaks)
        const buildingId = Array.from(buildingIds)[0]
        if (Array.from(buildingIds).length > 1) {
            setTweaksUrl(
                `${CommonApi.PBNA_MOBILE_MAPSTED_TWEAKS_DOMAIN}/propertySelector/?t=${tweaksToken}&property=${storePropertyId}`
            )
        } else {
            setTweaksUrl(
                `${CommonApi.PBNA_MOBILE_MAPSTED_TWEAKS_DOMAIN}/?t=${tweaksToken}&property=${storePropertyId}&building=${buildingId}`
            )
        }
    }

    const leftButtonClick = () => {
        setUnloadMap(true)
    }

    const onUnloadCallback = () => {
        // Do stuff with event.region.latitude, etc.
        if (unloadMap) {
            navigation.goBack()
        }
    }

    useEffect(() => {
        StoreMapstedDataService.getTweaksToken().then((token) => {
            setTweaksToken(token)
        })
        // when swipe back to previous page
        navigation.addListener(EventEmitterType.BEFORE_REMOVE, () => {
            NativeAppEventEmitter.emit(EventEmitterType.REFRESH_MAPSTED)
        })
        return () => {
            navigation.removeListener(EventEmitterType.BEFORE_REMOVE)
        }
    }, [])

    return (
        <View style={styles.container}>
            <MyStoreNavHeader
                storeId={storeId}
                onLeftButtonClick={leftButtonClick}
                showRightButton
                rightButtonImgSrc={showTweaks ? ImageSrc.ICON_TICK : ImageSrc.IOS_ADD_CIRCLE_OUTLINE_BLUE}
                onRightButtonClick={rightButtonClick}
            />
            <View style={styles.mapstedContainer}>
                <MapstedUIView
                    style={[styles.mapsted, { display: showTweaks ? 'none' : 'flex' }]}
                    propertyId={storePropertyId}
                    unloadMap={unloadMap}
                    onUnloadCallback={onUnloadCallback}
                />
                {tweaksUrl !== '' && (
                    <View style={[styles.mapsted, { display: showTweaks ? 'flex' : 'none' }]}>
                        <WebView
                            source={{ uri: tweaksUrl }}
                            startInLoadingState
                            renderLoading={() => {
                                return <Loading isLoading />
                            }}
                        />
                    </View>
                )}
            </View>
        </View>
    )
}
export default CustomerMyStoreMapScreen

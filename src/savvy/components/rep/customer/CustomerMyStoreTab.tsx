/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-08-17 16:15:30
 * @LastEditTime: 2022-08-29 11:56:58
 * @LastEditors: Mary Qian
 */
import React, { FC, useEffect, useState } from 'react'
import { ActivityIndicator, NativeAppEventEmitter, Dimensions, ScrollView, StyleSheet, View } from 'react-native'
import { t } from '../../../../common/i18n/t'
import SelectTab from '../../common/SelectTab'
import PlanogramScreen from '../../../pages/PlanogramScreen'
import InStoreMap from '../../merchandiser/InStoreMap'
import NonDisplayPromotion from '../../common/NonDisplayPromotion'
import Loading from '../../../../common/components/Loading'
import { isPersonaKAM, isPersonaMD, isPersonaPSR, isPersonaSDL } from '../../../../common/enums/Persona'
import { TouchableOpacity } from 'react-native-gesture-handler'
import CText from '../../../../common/components/CText'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { EventEmitterType } from '../../../enums/Manager'
import StoreMapstedView from './store-tab/StoreMapstedView'
import { CommonParam } from '../../../../common/CommonParam'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import NetInfo from '@react-native-community/netinfo'
import { IntervalTime } from '../../../enums/Contract'
import { useSelector } from 'react-redux'
import { FeatureToggle } from '../../../../common/enums/FeatureToggleName'
interface CustomerMyStoreTabProps {
    retailStoreId: string
    customerUniqueVal: string
    accountId: string
    isOnline: boolean
    retailStoreName: string
    isOTSCustomer: any
    storePropertyId: string
    storeTabVisible: boolean
}
const styles = StyleSheet.create({
    paddingTop_15: {
        paddingTop: 15
    },
    container: {
        width: '100%',
        paddingTop: 22
    },
    nonDisplayPromotionContainer: {
        width: '100%',
        paddingBottom: 40
    },
    displayButton: {
        width: '100%',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 22,
        paddingLeft: 20,
        paddingRight: 20
    },
    title: {
        fontWeight: baseStyle.fontWeight.fw_bold
    },
    viewRealogramTitle: {
        color: '#00A2D9'
    },
    mapstedContainer: {
        width: Dimensions.get('window').width - 40,
        height: Dimensions.get('window').width - 40,
        marginBottom: 20
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
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})

const CustomerMyStoreTab: FC<CustomerMyStoreTabProps> = (props: CustomerMyStoreTabProps) => {
    const {
        retailStoreId,
        customerUniqueVal,
        retailStoreName,
        accountId,
        isOnline,
        isOTSCustomer,
        storePropertyId,
        storeTabVisible
    } = props
    const [activeTab, setActiveTab] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isMapLoaded, setIsMapLoaded] = useState(false)
    const [isMapstedInitialized, setIsMapstedInitialized] = useState(false)
    const [isPromotionLoaded, setIsPromotionLoaded] = useState(false)
    const showButton = isPersonaKAM() || isPersonaPSR() || isPersonaSDL() || isPersonaMD()
    const navigation: NavigationProp<any> = useNavigation()
    const isMapstedToggleOn = !!CommonParam.FeatureToggle[FeatureToggle.MAPSTED_PILOT]
    const propertyId = Number(storePropertyId) || 0
    const [unloadMap, setUnloadMap] = useState(false)
    const [showMap, setShowMap] = useState(true)
    const [viewLoading, setIsViewLoading] = useState(false)
    const customerDetail = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)

    const isShowButton = () => {
        return isOTSCustomer === '1' || isOTSCustomer === true
    }
    const onInStoreMapDataLoaded = () => {
        setIsMapLoaded(true)
    }

    const onNonDisplayPromotionDataLoaded = () => {
        setIsPromotionLoaded(true)
    }

    useEffect(() => {
        if (isMapLoaded && isPromotionLoaded) {
            setIsLoading(false)
        }
    }, [isMapLoaded, isPromotionLoaded])

    useEffect(() => {
        const mapstedListener = NativeAppEventEmitter.addListener(EventEmitterType.REFRESH_MAPSTED, async () => {
            setUnloadMap(false)
            setShowMap(true)
        })
        return () => {
            mapstedListener && mapstedListener.remove()
        }
    }, [])

    const onInitialCallback = () => {
        // Do stuff with event.region.latitude, etc.
        if (!isMapstedInitialized) {
            setIsMapstedInitialized(true)
        }
    }

    return (
        <View style={styles.paddingTop_15}>
            <SelectTab
                listData={[
                    { name: t.labels.PBNA_MOBILE_STORE_MAP.toUpperCase() },
                    { name: t.labels.PBNA_MOBILE_PLANOGRAMS.toUpperCase() }
                ]}
                changeTab={(v) => {
                    setActiveTab(v)
                }}
                activeTab={activeTab}
            />
            {showButton && activeTab === 0 && (
                <View style={styles.displayButton}>
                    {activeTab === 0 && (
                        <CText style={styles.title}>{t.labels.PBNA_MOBILE_STORE_MAP.toUpperCase()}</CText>
                    )}
                    {isShowButton() && (
                        <TouchableOpacity
                            onPress={() => {
                                setIsViewLoading(true)
                                NetInfo.fetch().then((state) => {
                                    if (state.isConnected) {
                                        navigation.navigate('RealogramScreen', { customerDetail })
                                    }
                                })
                                setTimeout(() => {
                                    setIsViewLoading(false)
                                }, IntervalTime.TWO_THOUSAND)
                            }}
                            style={styles.button}
                        >
                            <CText style={[styles.title, styles.viewRealogramTitle]}>
                                {t.labels.PBNA_MOBILE_VIEW_REALOGRAM.toUpperCase()}
                            </CText>
                            {viewLoading && <ActivityIndicator animating={viewLoading} style={{ marginLeft: 10 }} />}
                        </TouchableOpacity>
                    )}
                </View>
            )}
            <ScrollView disableScrollViewPanResponder style={styles.container} showsVerticalScrollIndicator={false}>
                <View
                    style={{
                        width: Dimensions.get('window').width,
                        alignItems: 'center',
                        display: activeTab === 0 ? 'flex' : 'none'
                    }}
                >
                    {isMapLoaded &&
                        isPromotionLoaded &&
                        propertyId !== 0 &&
                        showMap &&
                        isMapstedToggleOn &&
                        storeTabVisible && (
                            <View style={styles.mapstedContainer}>
                                <StoreMapstedView
                                    style={styles.mapsted}
                                    storeId={retailStoreId}
                                    propertyId={propertyId}
                                    unloadMap={unloadMap}
                                    navigation={navigation}
                                    onMapInitialCallback={onInitialCallback}
                                    setShowMap={setShowMap}
                                />
                            </View>
                        )}
                    <InStoreMap
                        visit={{ storeId: retailStoreId, name: retailStoreName }}
                        isOnline={isOnline}
                        onDataLoaded={onInStoreMapDataLoaded}
                    />
                    <View style={styles.nonDisplayPromotionContainer}>
                        <NonDisplayPromotion
                            accountId={accountId}
                            isOnline={isOnline}
                            onDataLoaded={onNonDisplayPromotionDataLoaded}
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={{ display: activeTab === 1 ? 'flex' : 'none' }}>
                <PlanogramScreen customId={customerUniqueVal} />
            </View>

            <Loading
                isLoading={isLoading || (!isMapstedInitialized && showMap && isMapstedToggleOn && propertyId !== 0)}
            />
        </View>
    )
}

export default CustomerMyStoreTab

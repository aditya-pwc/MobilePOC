/**
 * @description The screen that let the user explore the CDA customers
 * @date 2023-1-15
 * @author Shangmin Dou
 */

import { Instrumentation } from '@appdynamics/react-native-agent'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'

import { View, StyleSheet, TouchableOpacity, Image, FlatList, RefreshControl } from 'react-native'
import LottieView from 'lottie-react-native'
import { SearchBar } from 'react-native-elements'
import { CommonParam } from '../../../common/CommonParam'
import EmptyListPlaceholder from '../../components/common/EmptyListPlaceholder'
import {
    styles as overviewMapStyle,
    calculateSearchRegion,
    isInSearchRegion,
    renderCustomerItem,
    renderListTip,
    renderRotationBtn,
    renderStatusList,
    renderCDACustomerPin
} from '../../helper/rep/ExploreHelper'
import { t } from '../../../common/i18n/t'
import CdaViewFilter, { getDefaultSortFilter } from './CdaViewFilter'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { isMarkerInViewBox, useCDACustomerMarkers, useInitRegion, useUserPositionDotData } from '../../hooks/MapHooks'
import { useIsFocused } from '@react-navigation/native'
import _ from 'lodash'
import ClusteredMapView from '../../components/rep/lead/clustered-map/ClusteredMapView'
import { Marker } from 'react-native-maps'
import Locator from '../../../../assets/image/icon_locator.svg'
import { SoupService } from '../../service/SoupService'
import {
    retrieveRetailStoreRelatedObjs,
    retrieveRetailStoresAndRelatedKeyAccounts
} from '../../utils/CustomerSyncUtils'
import { Log } from '../../../common/enums/Log'
import CText from '../../../common/components/CText'
import { handleMapViewRegionChangeLogic } from '../../helper/manager/mapHelper'
import { storeClassLog } from '../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

interface CDAMapScreenProps {
    navigation: any
    isCDAListView: boolean
    isCDAViewTab: boolean
    setPinItem: Function
    modalizeRef: any
    isCurrentCdaYear: boolean
}

const styles = StyleSheet.create({
    ...overviewMapStyle,
    pageContainer: { flex: 1, width: '100%', height: '100%' },
    filterIcon: { borderRadius: 5, backgroundColor: '#2A82E4', marginLeft: 5 },
    marginLeft_5: { marginLeft: 5 }
})

const CDAMapScreen: FC<CDAMapScreenProps> = (props: CDAMapScreenProps) => {
    const { navigation, isCDAListView, isCDAViewTab, setPinItem, isCurrentCdaYear, modalizeRef } = props
    const isFocused = useIsFocused()
    const mapRef = useRef(null)
    const [searchTempValue, setSearchTempValue] = useState('')
    const [searchValue, setSearchValue] = useState('')
    const [pinIndex, setPinIndex] = useState({ type: null, index: null })
    const [showSortFilter, setShowSortFilter] = useState(false)
    const [sortFilter, setSortFilter] = useState(getDefaultSortFilter)
    const [isCustomerLoading, setIsCustomerLoading] = useState(false)
    const [showCustomerLoading, setShowCustomerLoading] = useState(false)
    const { geolocation, rotation } = useUserPositionDotData(mapRef.current)
    const initRegion = useInitRegion(isFocused)
    const [zoomLevel, setZoomLevel] = useState(0)
    const [viewRegion, setViewRegion] = useState({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    })
    const [searchRegion, setSearchRegion] = useState({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    })

    const { customerMarkers, customerMarkersShownOnMap, setCustomerRefreshTimes } = useCDACustomerMarkers(
        isFocused,
        searchValue,
        searchRegion,
        setShowCustomerLoading,
        geolocation,
        sortFilter,
        isCurrentCdaYear
    )

    const customerMarkersShownOnList = useMemo(
        () =>
            _.filter(customerMarkers, (v: any) => {
                return isMarkerInViewBox(v.Customer_Latitude__c, v.Customer_Longitude__c, viewRegion)
            }),
        [customerMarkers, viewRegion]
    )

    useEffect(() => {
        if (pinIndex.type === 'Customer') {
            setPinItem(customerMarkersShownOnMap[pinIndex.index])
        }
    }, [customerMarkers, pinIndex])

    const renderSearchBar = () => {
        return (
            <SearchBar
                platform={'ios'}
                placeholder={t.labels.PBNA_MOBILE_SEARCH}
                allowFontScaling={false}
                clearIcon={null}
                showCancel
                cancelButtonTitle={t.labels.PBNA_MOBILE_CLEAR}
                containerStyle={styles.searchBarInnerContainer}
                inputContainerStyle={styles.searchBarInputContainer}
                inputStyle={styles.searchInputContainer}
                value={searchTempValue}
                // @ts-ignore
                onChangeText={(v) => {
                    setSearchTempValue(v)
                }}
                onBlur={() => {
                    setSearchValue(searchTempValue)
                    Instrumentation.reportMetric(`${CommonParam.PERSONA__c} searches CDA explore`, 1)
                }}
                onCancel={() => {
                    setSearchTempValue('')
                    setSearchValue(searchTempValue)
                }}
            />
        )
    }

    const renderFilterButton = () => {
        return (
            searchTempValue === '' && (
                <TouchableOpacity
                    testID="Search Bar Filter"
                    disabled={searchTempValue !== ''}
                    style={sortFilter.enable ? styles.filterIcon : styles.marginLeft_5}
                    onPress={() => setShowSortFilter(true)}
                >
                    <Image
                        source={
                            sortFilter.enable
                                ? require('../../../../assets/image/icon-sort-white.png')
                                : require('../../../../assets/image/icon-sort.png')
                        }
                        style={[styles.filterImage]}
                    />
                </TouchableOpacity>
            )
        )
    }

    const handleCustomerRefresh = async () => {
        if (searchValue.length < 3) {
            setIsCustomerLoading(true)
            try {
                await SoupService.clearSoup('RetailStore')
                const data = await retrieveRetailStoresAndRelatedKeyAccounts()
                await retrieveRetailStoreRelatedObjs(data)

                setIsCustomerLoading(false)
                setCustomerRefreshTimes((v) => v + 1)
            } catch (e) {
                setIsCustomerLoading(false)
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'handleCustomerRefresh',
                    'refresh customer list: ' + ErrorUtils.error2String(e)
                )
            }
        }
    }

    const renderCustomerList = () => {
        return (
            <View style={[styles.listBase, { marginTop: 0, display: !isCDAListView ? 'none' : 'flex' }]}>
                {renderListTip(customerMarkersShownOnList, { marginTop: 20 })}
                <FlatList
                    contentContainerStyle={commonStyle.flexGrow_1}
                    data={customerMarkersShownOnList}
                    renderItem={(customer) =>
                        renderCustomerItem(customer, navigation, true, isCurrentCdaYear, isCustomerLoading)
                    }
                    keyExtractor={(item) => item.Id}
                    onEndReachedThreshold={0.9}
                    initialNumToRender={4}
                    ListEmptyComponent={<EmptyListPlaceholder />}
                    refreshControl={
                        <RefreshControl
                            title={t.labels.PBNA_MOBILE_LOADING}
                            tintColor={'#00A2D9'}
                            titleColor={'#00A2D9'}
                            refreshing={isCustomerLoading}
                            onRefresh={handleCustomerRefresh}
                        />
                    }
                />
            </View>
        )
    }

    const handleMapViewRegionChange = _.debounce((mapRegion) => {
        handleMapViewRegionChangeLogic({
            mapRegion,
            mapRef,
            zoomLevel,
            searchRegion,
            setViewRegion,
            isInSearchRegion,
            setZoomLevel,
            calculateSearchRegion,
            setSearchRegion
        })
    }, 500)

    const renderCDAMapView = () => {
        return (
            <View style={{ flex: 1, display: isCDAListView ? 'none' : 'flex' }}>
                {!_.isEmpty(initRegion) && (
                    <ClusteredMapView
                        ref={mapRef}
                        loadingEnabled
                        style={[commonStyle.flex_1]}
                        showsCompass
                        showsScale
                        showsMyLocationButton
                        initialRegion={initRegion}
                        onPanDrag={() => {
                            rotation.setRegionChanged(true)
                            rotation.setMode(false)
                        }}
                        onRegionChangeComplete={(mapRegion) => {
                            handleMapViewRegionChange(mapRegion)
                        }}
                        animationEnabled={false}
                        clusterGroupColor={{
                            'In Progress': '#FFC409',
                            Signed: '#2DD36F',
                            'Not Started': '#0067A0',
                            Declined: '#EB445A'
                        }}
                    >
                        {customerMarkersShownOnMap.map((item: any, index) => (
                            <Marker
                                title={t.labels.PBNA_MOBILE_CUSTOMER}
                                identifier={
                                    item[isCurrentCdaYear ? 'Account.CDA_Status__c' : 'Account.CDA_NY_Status__c']
                                }
                                coordinate={{
                                    latitude: _.toNumber(item.Customer_Latitude__c) || 0,
                                    longitude: _.toNumber(item.Customer_Longitude__c) || 0
                                }}
                                key={item.Id}
                                onPress={(event) => {
                                    event.stopPropagation()
                                    setPinIndex({ type: 'Customer', index: index })
                                    modalizeRef.current?.open()
                                }}
                            >
                                {renderCDACustomerPin(item, isCurrentCdaYear)}
                            </Marker>
                        ))}
                        <Marker coordinate={geolocation} flat anchor={{ x: 0.5, y: 0.5 }}>
                            <View
                                style={{
                                    transform: [{ rotate: `${rotation.rotation}deg` }]
                                }}
                            >
                                <Locator style={styles.locator} />
                            </View>
                        </Marker>
                    </ClusteredMapView>
                )}

                {renderStatusList()}

                {renderRotationBtn(rotation, mapRef)}

                <View style={styles.lottieCont}>
                    {showCustomerLoading && (
                        <LottieView
                            source={require('../../../../assets/animation/loading.json')}
                            testID="MapLoading"
                            autoPlay
                            loop
                            style={styles.size40}
                        />
                    )}
                </View>
            </View>
        )
    }
    const calculateDisplayStyle = () => {
        const isDisplay =
            searchValue === '' || (customerMarkers.length > 0 && searchValue.length >= 3) || showCustomerLoading
        return isDisplay ? 'flex' : 'none'
    }

    return (
        <View style={[styles.pageContainer, { display: isCDAViewTab ? 'flex' : 'none' }]}>
            <View style={[styles.searchBarContainer, { marginBottom: 20 }]}>
                {renderSearchBar()}
                {renderFilterButton()}
            </View>
            <View style={{ flex: 1, display: calculateDisplayStyle() }}>
                {renderCustomerList()}
                {renderCDAMapView()}
            </View>

            {searchValue.length < 3 && searchValue !== '' && (
                <EmptyListPlaceholder
                    title={
                        <View style={commonStyle.alignItemsCenter}>
                            <CText style={styles.noResultTitle}>{t.labels.PBNA_MOBILE_NO_RESULTS}</CText>
                            <CText style={styles.noResultContent}>{t.labels.PBNA_MOBILE_METRICS_AT_LEAST_3CHAR}</CText>
                        </View>
                    }
                />
            )}
            {searchValue.length >= 3 && customerMarkers.length === 0 && !showCustomerLoading && (
                <EmptyListPlaceholder />
            )}

            <CdaViewFilter
                visible={showSortFilter}
                onBack={() => setShowSortFilter(false)}
                setSortFilter={setSortFilter}
            />
        </View>
    )
}

export default CDAMapScreen

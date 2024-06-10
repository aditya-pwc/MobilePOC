/**
 * @description The screen that let the user explore the leads and customers
 * @date 2021-09-16
 * @author Shangmin Dou
 */
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, Image, RefreshControl, SafeAreaView, TouchableOpacity, View } from 'react-native'
import CText from '../../../common/components/CText'
import ClusteredMapView from '../../components/rep/lead/clustered-map/ClusteredMapView'
import CopilotPattern from '../../../../assets/image/copilot_pattern_for_explore.svg'
import { Marker } from 'react-native-maps'
import {
    isMarkerInViewBox,
    useCustomerMarkers,
    useInitRegion,
    useLeadMarkers,
    useShowCDAMap,
    useUserPositionDotData
} from '../../hooks/MapHooks'

import { useIsFocused } from '@react-navigation/native'
import _ from 'lodash'
import MyLeadSvg from '../../../../assets/image/icon-my-lead.svg'
import OpenLeadSvg from '../../../../assets/image/icon-open-lead.svg'
import CustomerSvg from '../../../../assets/image/icon-blue-location.svg'
import Locator from '../../../../assets/image/icon_locator.svg'
import SelectTab from '../../components/common/SelectTab'
import { SearchBar } from 'react-native-elements'
import EmptyListPlaceholder from '../../components/common/EmptyListPlaceholder'
import CustomerListTile from '../../components/rep/customer/CustomerListTile'
import AllLeadsListTile from '../../components/rep/lead/tile/AllLeadsListTile'
import MyLeadsListTile from '../../components/rep/lead/tile/MyLeadsListTile'
import { Modalize } from 'react-native-modalize'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { SoupService } from '../../service/SoupService'
import { CommonParam } from '../../../common/CommonParam'
import { Log } from '../../../common/enums/Log'
import { refreshAllLeads } from '../../utils/LeadUtils'
import { LeadStatus } from '../../enums/Lead'
import { goToCustomerDetail } from '../../utils/CustomerUtils'
import MapFilterSortForm from '../../components/rep/MapFilterSortForm'
import LottieView from 'lottie-react-native'
import {
    retrieveRetailStoreRelatedObjs,
    retrieveRetailStoresAndRelatedKeyAccounts
} from '../../utils/CustomerSyncUtils'
import {
    isPersonaCRMBusinessAdmin,
    isPersonaFSManager,
    isPersonaKAM,
    isPersonaPSR,
    isPersonaSDL
} from '../../../common/enums/Persona'
import { retrieveTeamMemberCustomers } from '../../utils/FSManagerSyncUtils'
import { t } from '../../../common/i18n/t'
import { commonStyle } from '../../../common/styles/CommonStyle'
import {
    CDAYearFilterBtn,
    calculateSearchRegion,
    isInSearchRegion,
    renderCustomerItem,
    renderDraggable,
    renderLeadItem,
    renderListTip,
    renderMapViewTab,
    renderModalHeader,
    renderPageTitle,
    renderRotationBtn,
    styles
} from '../../helper/rep/ExploreHelper'
import { handleMapViewRegionChangeLogic } from '../../helper/manager/mapHelper'
import { storeClassLog } from '../../../common/utils/LogUtils'
import CDAMapScreen from './CDAMapScreen'
import KamMapOverviewFilterSort, {
    getDefaultKamOverviewSortFilter
} from '../../components/kam/KamMapOverviewFilterSort'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

interface ExploreScreenProps {
    navigation: any
}

const ExploreScreen: FC<ExploreScreenProps> = (props) => {
    const { navigation } = props
    const mapRef = useRef(null)
    const modalizeRef = useRef<Modalize>(null)
    const filterRef = useRef(null)
    const isFocused = useIsFocused()
    const [searchTempValue, setSearchTempValue] = useState('')
    const [searchValue, setSearchValue] = useState('')
    const [leadFilterQuery, setLeadFilterQuery] = useState('')
    const [customerFilterQuery, setCustomerFilterQuery] = useState('')
    const [showLeads, setShowLeads] = useState(true)
    const [showCustomers, setShowCustomers] = useState(true)
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
    const [zoomLevel, setZoomLevel] = useState(0)
    const [showLoading, setShowLoading] = useState(false)
    const [showLeadLoading, setShowLeadLoading] = useState(false)
    const [showCustomerLoading, setShowCustomerLoading] = useState(false)
    const { leadMarkers, leadMarkersShownOnMap, setLeadRefreshTimes } = useLeadMarkers(
        isFocused,
        searchValue,
        leadFilterQuery,
        setShowLeadLoading,
        showLeads,
        searchRegion
    )
    const initRegion: any = useInitRegion(isFocused)
    const [isFirstTime, setIsFirstTime] = useState(true)
    const { customerMarkers, customerMarkersShownOnMap, setCustomerRefreshTimes } = useCustomerMarkers(
        isFocused,
        searchValue,
        customerFilterQuery,
        setShowCustomerLoading,
        showCustomers,
        searchRegion,
        initRegion,
        isFirstTime
    )
    const [isCustomerLoading, setIsCustomerLoading] = useState(false)
    const [isLeadLoading, setIsLeadLoading] = useState(false)
    const { geolocation, rotation } = useUserPositionDotData(mapRef.current)
    const [isListView, setIsListView] = useState(false)
    const [isCDAListView, setIsCDAListView] = useState(false)
    const [activeTab, setActiveTab] = useState(0)
    const [activeViewTab, setActiveViewTab] = useState(0)
    const [pinItem, setPinItem] = useState(null)
    const [CDApinItem, setCDAPinItem] = useState(null)
    const [pinIndex, setPinIndex] = useState({ type: null, index: null })
    const [isCurrentCdaYear, setIsCurrentCdaYear] = useState(false)
    const [isCDAViewTab, setIsCDAViewTab] = useState(isPersonaSDL())
    const [showKamOverviewSortFilter, setShowKamOverviewSortFilter] = useState<boolean>(false)
    const [kamOverviewSortFilterObject, setKamOverviewSortFilterObject] = useState(getDefaultKamOverviewSortFilter)

    const { isShowCDAMap } = useShowCDAMap()

    const leadMarkersShownOnList = useMemo(
        () =>
            _.filter(leadMarkers, (v) => {
                return isMarkerInViewBox(v.Lead_Latitude_c__c, v.Lead_Longitude_c__c, viewRegion)
            }),
        [leadMarkers, viewRegion]
    )

    const customerMarkersShownOnList = useMemo(
        () =>
            _.filter(customerMarkers, (v) => {
                return isMarkerInViewBox(v.Customer_Latitude__c, v.Customer_Longitude__c, viewRegion)
            }),
        [customerMarkers, viewRegion]
    )

    useEffect(() => {
        if (pinIndex.type === 'Lead') {
            setPinItem(leadMarkersShownOnMap[pinIndex.index])
        } else if (pinIndex.type === 'Customer') {
            setPinItem(customerMarkersShownOnMap[pinIndex.index])
        }
    }, [leadMarkers, pinIndex, customerMarkers])

    useEffect(() => {
        // close the loading indicator once the leads and the customers are both loaded
        setShowLoading(showLeadLoading || showCustomerLoading)
    }, [showLeadLoading, showCustomerLoading])
    const renderModalChildren = () => {
        switch (pinItem?.Status__c) {
            case 'Open':
                return (
                    <AllLeadsListTile
                        l={pinItem}
                        navigation={navigation}
                        isGoBack
                        needCheckData={
                            ((customerMarkers.length > 0 || leadMarkers.length > 0) && searchValue.length >= 3) ||
                            isPersonaCRMBusinessAdmin()
                        }
                        refreshList={() => {
                            setLeadRefreshTimes((v) => v + 1)
                        }}
                    />
                )
            case 'No Sale':
            case 'Negotiate':
                return (
                    <MyLeadsListTile
                        l={pinItem}
                        navigation={navigation}
                        isGoBack
                        needCheckData={
                            ((customerMarkers.length > 0 || leadMarkers.length > 0) && searchValue.length >= 3) ||
                            isPersonaCRMBusinessAdmin()
                        }
                    />
                )
            default:
                if (pinItem) {
                    return (
                        <TouchableOpacity
                            onPress={async () => {
                                await goToCustomerDetail(pinItem, navigation, false, false, true)
                            }}
                        >
                            <CustomerListTile
                                customer={pinItem}
                                isCurrentCdaYear={isCurrentCdaYear}
                                showShadow
                                isOverViewMap
                            />
                        </TouchableOpacity>
                    )
                }
        }
    }
    const handleCustomerRefresh = async () => {
        if (searchValue.length < 3) {
            setIsCustomerLoading(true)
            try {
                await SoupService.clearSoup('RetailStore')
                const data = await retrieveRetailStoresAndRelatedKeyAccounts()
                await retrieveRetailStoreRelatedObjs(data)
                if (isPersonaFSManager() || isPersonaCRMBusinessAdmin()) {
                    await retrieveTeamMemberCustomers()
                }
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
    const handleLeadRefresh = async () => {
        if (searchValue.length < 3) {
            setIsLeadLoading(true)
            try {
                await refreshAllLeads()
                setIsLeadLoading(false)
                setLeadRefreshTimes((v) => v + 1)
            } catch (e) {
                setIsLeadLoading(false)
                storeClassLog(Log.MOBILE_ERROR, 'handleLeadRefresh', 'refresh lead list: ' + ErrorUtils.error2String(e))
            }
        }
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

    const LeadMarker = useMemo(
        () =>
            leadMarkersShownOnMap.map((item: any, index) => {
                let title = ''
                if (item.Status__c === LeadStatus.NEGOTIATE) {
                    title = t.labels.PBNA_MOBILE_MY_LEAD
                } else if (item.Status__c === LeadStatus.NO_SALE) {
                    title = t.labels.PBNA_MOBILE_NO_SALE
                } else {
                    title = t.labels.PBNA_MOBILE_OPEN_LEAD
                }
                return (
                    <Marker
                        tracksViewChanges={false}
                        title={title}
                        identifier={item.Status__c === LeadStatus.NEGOTIATE ? 'My Lead' : 'Open Lead'}
                        coordinate={{
                            latitude: _.toNumber(item.Lead_Latitude_c__c) || 0,
                            longitude: _.toNumber(item.Lead_Longitude_c__c) || 0
                        }}
                        key={item.Id}
                        onPress={(event) => {
                            event.stopPropagation()
                            setPinIndex({ type: 'Lead', index: index })
                            modalizeRef.current?.open()
                        }}
                    >
                        {(item.Status__c === LeadStatus.OPEN || item.Status__c === LeadStatus.NO_SALE) && (
                            <OpenLeadSvg />
                        )}
                        {item.Status__c === LeadStatus.NEGOTIATE && <MyLeadSvg />}
                    </Marker>
                )
            }),
        [leadMarkersShownOnMap]
    )

    const CustomerMarker = useMemo(
        () =>
            customerMarkersShownOnMap.map((item: any, index) => (
                <Marker
                    tracksViewChanges={false}
                    title={t.labels.PBNA_MOBILE_CUSTOMER}
                    identifier={'Customer'}
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
                    <CustomerSvg />
                </Marker>
            )),
        [customerMarkersShownOnMap]
    )

    const renderOverViewScreen = () => {
        const customersTab = { name: t.labels.PBNA_MOBILE_CUSTOMERS.toUpperCase() }
        const leadsTab = { name: t.labels.PBNA_MOBILE_LEADS.toUpperCase() }
        const tabList = isPersonaKAM() ? [customersTab, leadsTab] : [leadsTab, customersTab]

        return (
            <>
                {!isCDAViewTab && (
                    <View style={styles.searchBarContainer}>
                        <SearchBar
                            platform={'ios'}
                            placeholder={t.labels.PBNA_MOBILE_SEARCH}
                            allowFontScaling={false}
                            // @ts-ignore
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
                                setSearchValue(searchTempValue.trim())
                                Instrumentation.reportMetric(`${CommonParam.PERSONA__c} searches explore`, 1)
                            }}
                            onCancel={() => {
                                setSearchTempValue('')
                                setSearchValue(searchTempValue)
                            }}
                        />
                        {searchTempValue === '' && (
                            <TouchableOpacity
                                disabled={searchTempValue !== ''}
                                testID="Search Bar Filter"
                                style={
                                    leadFilterQuery || customerFilterQuery
                                        ? { borderRadius: 5, backgroundColor: '#00A2D9', marginLeft: 20 }
                                        : { marginLeft: 20 }
                                }
                                onPress={() => {
                                    if (isPersonaKAM()) {
                                        setShowKamOverviewSortFilter(true)
                                    } else {
                                        filterRef.current?.open()
                                    }
                                }}
                            >
                                <Image
                                    source={
                                        leadFilterQuery || customerFilterQuery
                                            ? require('../../../../assets/image/icon-sort-white.png')
                                            : require('../../../../assets/image/icon-sort.png')
                                    }
                                    style={[styles.filterImage]}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                {/* overview map section and overview map filter form and click pin modalize */}
                <View style={{ flex: 1, display: isCDAViewTab ? 'none' : 'flex' }}>
                    <View style={styles.flex1}>
                        <View
                            style={{
                                flex: 1,
                                display:
                                    searchValue === '' ||
                                    ((customerMarkers.length > 0 || leadMarkers.length > 0) &&
                                        searchValue.length >= 3) ||
                                    showLoading
                                        ? 'flex'
                                        : 'none'
                            }}
                        >
                            <View
                                style={[
                                    { flex: isListView ? 0 : 1 },
                                    (isPersonaPSR() || isPersonaKAM()) && { marginTop: -5 }
                                ]}
                            >
                                {!_.isEmpty(initRegion) && (
                                    <View
                                        style={[
                                            commonStyle.flex_1,
                                            (isPersonaPSR() || isPersonaKAM()) && !isListView && { marginTop: -12 }
                                        ]}
                                    >
                                        {/** add this -12 margin top value to fix map view style */}
                                        <ClusteredMapView
                                            ref={mapRef}
                                            loadingEnabled
                                            style={commonStyle.flex_1}
                                            showsCompass
                                            showsScale
                                            showsMyLocationButton
                                            initialRegion={initRegion}
                                            onPanDrag={() => {
                                                rotation.setRegionChanged(true)
                                                rotation.setMode(false)
                                            }}
                                            onRegionChangeComplete={(mapRegion) => {
                                                setIsFirstTime(false)
                                                handleMapViewRegionChange(mapRegion)
                                            }}
                                            animationEnabled={false}
                                            clusterGroupColor={{
                                                Customer: '#00A1D9',
                                                'My Lead': '#6C0CC3',
                                                'Open Lead': '#6C0CC3'
                                            }}
                                        >
                                            {LeadMarker}
                                            {CustomerMarker}
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
                                        {!isListView && (
                                            <View style={styles.listViewBg}>
                                                <View style={commonStyle.flexRowAlignCenter}>
                                                    <OpenLeadSvg width={22} height={22} />
                                                    <CText style={styles.leadText} numberOfLines={1}>
                                                        {t.labels.PBNA_MOBILE_OPEN_LEAD}
                                                    </CText>
                                                </View>
                                                <View style={commonStyle.flexRowAlignCenter}>
                                                    <MyLeadSvg width={22} height={22} />
                                                    <CText style={styles.leadText} numberOfLines={1}>
                                                        {t.labels.PBNA_MOBILE_MY_LEAD}
                                                    </CText>
                                                </View>
                                                <View style={commonStyle.flexRowAlignCenter}>
                                                    <CustomerSvg width={22} height={22} />
                                                    <CText style={styles.customerText} numberOfLines={1}>
                                                        {t.labels.PBNA_MOBILE_CUSTOMER}
                                                    </CText>
                                                </View>
                                            </View>
                                        )}

                                        {renderRotationBtn(rotation, mapRef)}
                                    </View>
                                )}

                                <View style={styles.lottieCont}>
                                    {showLoading && (
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
                            <View style={{ flex: isListView ? 1 : 0 }}>
                                {isListView && (
                                    <View style={styles.listView}>
                                        <SelectTab
                                            listData={tabList}
                                            changeTab={(v: number) => setActiveTab(v)}
                                            activeTab={activeTab}
                                        />
                                    </View>
                                )}

                                <View
                                    style={[
                                        styles.listBase,
                                        {
                                            display: isListView && tabList[activeTab] === customersTab ? 'flex' : 'none'
                                        }
                                    ]}
                                >
                                    {renderListTip(customerMarkersShownOnList)}
                                    <FlatList
                                        contentContainerStyle={commonStyle.flexGrow_1}
                                        data={customerMarkersShownOnList}
                                        renderItem={(customer) =>
                                            renderCustomerItem(
                                                customer,
                                                navigation,
                                                false,
                                                false,
                                                true,
                                                isCustomerLoading
                                            )
                                        }
                                        keyExtractor={(item) => item.Id}
                                        onEndReachedThreshold={0.9}
                                        initialNumToRender={4}
                                        ListEmptyComponent={
                                            <EmptyListPlaceholder imageContainer={styles.emptyPlaceholderStyle} />
                                        }
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
                                <View
                                    style={[
                                        styles.listBase,
                                        {
                                            display: isListView && tabList[activeTab] === leadsTab ? 'flex' : 'none'
                                        }
                                    ]}
                                >
                                    {renderListTip(leadMarkersShownOnList)}
                                    <FlatList
                                        contentContainerStyle={commonStyle.flexGrow_1}
                                        data={leadMarkersShownOnList}
                                        renderItem={(lead) => renderLeadItem(lead, setLeadRefreshTimes, navigation)}
                                        keyExtractor={(item) => item.Id}
                                        onEndReachedThreshold={0.9}
                                        initialNumToRender={4}
                                        ListEmptyComponent={
                                            <EmptyListPlaceholder imageContainer={styles.emptyPlaceholderStyle} />
                                        }
                                        refreshControl={
                                            <RefreshControl
                                                title={t.labels.PBNA_MOBILE_LOADING}
                                                tintColor={'#00A2D9'}
                                                titleColor={'#00A2D9'}
                                                refreshing={isLeadLoading}
                                                onRefresh={handleLeadRefresh}
                                            />
                                        }
                                    />
                                </View>
                            </View>
                        </View>
                        {searchValue.length < 3 && searchValue !== '' && (
                            <EmptyListPlaceholder
                                title={
                                    <View style={commonStyle.alignItemsCenter}>
                                        <CText style={styles.noResultTitle}>{t.labels.PBNA_MOBILE_NO_RESULTS}</CText>

                                        <CText style={styles.noResultContent}>
                                            {t.labels.PBNA_MOBILE_METRICS_AT_LEAST_3CHAR}
                                        </CText>
                                    </View>
                                }
                                fixMarginTop
                            />
                        )}
                        {searchValue.length >= 3 &&
                            customerMarkers.length === 0 &&
                            leadMarkers.length === 0 &&
                            !showLoading && <EmptyListPlaceholder fixMarginTop />}
                    </View>
                </View>
            </>
        )
    }
    const renderCDAViewScreen = () => {
        return (
            <CDAMapScreen
                navigation={navigation}
                isCDAListView={isCDAListView}
                isCDAViewTab={isCDAViewTab}
                setPinItem={setCDAPinItem}
                modalizeRef={modalizeRef}
                isCurrentCdaYear={isCurrentCdaYear}
            />
        )
    }

    const renderCDAModalChildren = (pinItem: any) => {
        if (pinItem) {
            return (
                <TouchableOpacity
                    onPress={async () => {
                        await goToCustomerDetail(pinItem, navigation, false, true, true)
                    }}
                >
                    <CustomerListTile
                        customer={pinItem}
                        showShadow
                        isCDAMapView
                        showCDAStatus
                        isCurrentCdaYear={isCurrentCdaYear}
                    />
                </TouchableOpacity>
            )
        }
    }

    const mapViewTabDataList = []
    if (isPersonaPSR() || isPersonaKAM()) {
        mapViewTabDataList.push({ name: t.labels.PBNA_MOBILE_OVERVIEW.toLocaleUpperCase() })
        mapViewTabDataList.push({ name: t.labels.PBNA_MOBILE_CDA_VIEW.toLocaleUpperCase() })
    }
    return (
        <View style={styles.containBg}>
            {/* Top background svg */}
            <CopilotPattern style={styles.backgroundImageSVG} />

            <SafeAreaView style={styles.safeAreaContainer}>
                {/* Explore Screen Title  */}

                <View style={styles.headerTextContainer}>
                    {renderPageTitle(isPersonaSDL() ? t.labels.PBNA_MOBILE_CDA_VIEW : t.labels.PBNA_MOBILE_EXPLORE)}
                    {isCDAViewTab && (
                        <CDAYearFilterBtn
                            isCurrentCdaYear={isCurrentCdaYear}
                            setIsCurrentCdaYear={setIsCurrentCdaYear}
                        />
                    )}
                </View>
                {/* Screen select Tab , overview Tab and CDA View Tab,   */}

                {!_.isEmpty(mapViewTabDataList) &&
                    renderMapViewTab(mapViewTabDataList, setActiveViewTab, activeViewTab, setIsCDAViewTab)}
                {/* overview Screen , search and filter and result page ,    */}
                {/* In order to maintain the state, the condition of judging the display is written in the function, through the style to control display and hiding */}

                {!isPersonaSDL() && renderOverViewScreen()}

                {/* CDA Screen , search and filter and result page ,   */}

                {isShowCDAMap && renderCDAViewScreen()}
            </SafeAreaView>

            {/* overview Screen Draggable Icon  */}
            {!isCDAViewTab && renderDraggable(isListView, setIsListView)}

            {/* CDA Screen Draggable Icon  */}
            {isCDAViewTab && renderDraggable(isCDAListView, setIsCDAListView)}

            {/* overview modal */}

            <Modalize
                ref={modalizeRef}
                adjustToContentHeight
                HeaderComponent={renderModalHeader(!isCDAViewTab ? pinItem : CDApinItem)}
                withHandle={false}
            >
                <View style={styles.modalChild}>
                    {!isCDAViewTab && renderModalChildren()}
                    {isCDAViewTab && renderCDAModalChildren(CDApinItem)}
                </View>
            </Modalize>

            <MapFilterSortForm
                cRef={filterRef}
                leadQuery={setLeadFilterQuery}
                customerQuery={setCustomerFilterQuery}
                setShowLeads={setShowLeads}
                setShowCustomers={setShowCustomers}
                geolocation={geolocation}
            />

            <KamMapOverviewFilterSort
                visible={showKamOverviewSortFilter}
                onBack={() => setShowKamOverviewSortFilter(false)}
                userLocation={{ latitude: initRegion?.latitude, longitude: initRegion?.longitude }}
                kamOverviewSortFilterObject={kamOverviewSortFilterObject}
                setKamOverviewSortFilterObject={setKamOverviewSortFilterObject}
                setKamOverviewSortFilterQuery={setCustomerFilterQuery}
            />
        </View>
    )
}

export default ExploreScreen

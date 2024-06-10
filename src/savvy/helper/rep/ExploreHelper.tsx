import { Instrumentation } from '@appdynamics/react-native-agent'
import React from 'react'
import { TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native'
import Draggable from 'react-native-draggable'
import CText from '../../../common/components/CText'
import SelectTab from '../../components/common/SelectTab'
import CustomerListTile from '../../components/rep/customer/CustomerListTile'
import AllLeadsListTile from '../../components/rep/lead/tile/AllLeadsListTile'
import MyLeadsListTile from '../../components/rep/lead/tile/MyLeadsListTile'
import { t } from '../../../common/i18n/t'
import { goToCustomerDetail } from '../../utils/CustomerUtils'
import LocationService from '../../service/LocationService'

import Direction1Svg from '../../../../assets/image/icon_direction_1.svg'
import Direction2Svg from '../../../../assets/image/icon_direction_2.svg'
import Direction3Svg from '../../../../assets/image/icon_direction_3.svg'

import CustomerSignedSvg from '../../../../assets/image/pin-cda-signed.svg'
import CustomerInProgressSvg from '../../../../assets/image/pin-cda-in-progress.svg'
import CustomerNotStartedSvg from '../../../../assets/image/pin-cda-not-started.svg'
import CustomerDeclinedSvg from '../../../../assets/image/pin-cda-declined.svg'
import { currentYear, nextYear } from '../../hooks/CustomerContractTabHooks'
import { commonStyle } from '../../../common/styles/CommonStyle'

const ICON_LIST = require('../../../../assets/image/icon-list.png')
const ICON_MAP = require('../../../../assets/image/icon-map.png')

export const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%'
    },
    statusItem: { flexDirection: 'row', alignItems: 'center' },

    safeAreaContainer: { display: 'flex', flex: 1 },
    // width of the svg file is 428, set scaleX to fill the screen(430)
    backgroundImageSVG: { top: 0, position: 'absolute', transform: [{ scaleX: 1.1 }] },
    headerContainer: {
        width: '100%',
        flex: 1,

        justifyContent: 'space-between'
    },
    headerTextContainer: {
        height: 32,
        flexDirection: 'row',
        paddingHorizontal: 22,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerTextInnerContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    searchBarContainer: {
        marginTop: 30,
        flexDirection: 'row',
        paddingHorizontal: 22,
        marginBottom: 35,
        width: '100%',
        justifyContent: 'space-between'
    },
    searchBarInnerContainer: {
        width: '85%',
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F0F3F6'
    },
    searchBarInputContainer: {
        backgroundColor: '#F0F3F6'
    },
    searchInputContainer: {
        fontSize: 14,
        color: '#565656'
    },
    filterImage: {
        width: 32,
        height: 19,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 8
    },
    bgWhiteColor: {
        backgroundColor: '#FFFFFF'
    },
    headerRadius: {
        borderRadius: 10
    },
    defPaddingHorizontal: {
        paddingHorizontal: '5%'
    },
    nonLabelInput: {
        height: 75
    },
    pickerBorder: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 0.9
    },
    flexAlign: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    smallFontSize: {
        fontSize: 12
    },
    noResultTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 10
    },
    noResultContent: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center'
    },
    paddingH5: {
        paddingHorizontal: '5%'
    },
    modalHead: {
        height: 4,
        width: 50,
        backgroundColor: '#d4d4d4',
        borderRadius: 5,
        marginBottom: 20
    },
    tipsCont: {
        paddingLeft: '5%',
        marginTop: 50,
        marginBottom: 5
    },
    tipsText: {
        color: '#565656'
    },
    containBg: {
        flex: 1,
        backgroundColor: '#EFF3F6'
    },

    flex2: {
        flex: 2
    },
    exploreText: {
        fontWeight: '900',
        fontSize: 24,
        color: 'white'
    },
    flex1: {
        flex: 1
    },
    locator: {
        height: 30,
        width: 30,
        shadowColor: '#DCE5EE',
        shadowOffset: {
            width: 3,
            height: 3
        },
        shadowOpacity: 1,
        shadowRadius: 3
    },
    listViewBg: {
        position: 'absolute',
        width: '100%',
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    statusBox: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center'
    },
    CDAListViewBg: {
        paddingHorizontal: 20,
        height: 40
    },
    leadText: {
        marginLeft: 5,
        fontSize: 12
    },
    statusText: {
        marginLeft: 5,
        fontSize: 12
    },
    customerText: {
        marginLeft: 5,
        fontSize: 12
    },
    rotationBtn: {
        position: 'absolute',
        top: 55,
        right: 5,
        width: 42.5,
        height: 50,
        padding: 12.5,
        backgroundColor: 'white',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    lottieCont: {
        position: 'absolute',
        top: 110,
        right: 6,
        width: 40,
        height: 40
    },
    size40: {
        width: 40,
        height: 40
    },
    listView: {
        zIndex: 100,
        marginTop: -22
    },
    modalChild: {
        paddingHorizontal: '5%',
        paddingBottom: 20
    },
    listBase: {
        marginTop: -35,
        flex: 1,
        backgroundColor: '#EFF3F6'
    },
    yearFilterBtn: {
        marginLeft: 15,
        width: 60,
        height: 32,
        borderRadius: 16,
        borderColor: 'white'
    },
    yearFilterText: {
        color: 'white',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 'auto',
        marginBottom: 'auto'
    },
    emptyPlaceholderStyle: {
        width: 180,
        height: 135,
        marginBottom: 40
    }
})

export const SEARCH_REGION_MAGNIFICATION = 1

export const renderPageTitle = (title: string) => {
    return (
        <View style={styles.headerTextInnerContainer}>
            <TouchableOpacity onPress={() => {}}>
                <CText style={styles.exploreText}>{title}</CText>
            </TouchableOpacity>
        </View>
    )
}

export const renderMapViewTab = (listData, setTab, Tab, setIsCDAViewTab) => {
    return (
        <View style={[{ height: 44, marginTop: 30, paddingHorizontal: 22 }]}>
            <SelectTab
                style={{ marginHorizontal: 0 }}
                listData={listData}
                changeTab={(v) => {
                    setTab(v)
                    setIsCDAViewTab(v === 1)
                }}
                activeTab={Tab}
            />
        </View>
    )
}

export const renderDraggable = (val, setVal) => {
    return (
        <Draggable
            touchableOpacityProps={{ testId: 'MapDraggable' }}
            x={Dimensions.get('window').width * 0.82}
            y={Dimensions.get('window').height * 0.82}
            minX={10}
            minY={200}
            maxX={Dimensions.get('window').width * 0.95}
            maxY={Dimensions.get('window').height * 0.9}
            renderSize={56}
            isCircle
            imageSource={val ? ICON_MAP : ICON_LIST}
            onShortPressRelease={() => {
                Instrumentation.reportMetric('FSR/PSR clicks the hover icon in the explore screen', 1)
                setVal((v) => !v)
            }}
        />
    )
}

export const calculateSearchRegion = (region, magnification: number, setSearchRegion, zoomLevel) => {
    // If the zoom of the map is too large, the view may span the 180 degree longitude,
    // so when the zoom level is less than 3, search the whole map
    if (zoomLevel <= 3) {
        setSearchRegion({
            left: -180,
            right: 180,
            top: 90,
            bottom: -90
        })
    } else {
        const viewRegionWidth =
            Math.abs(region.left - region.right) > 180
                ? 180 - Math.abs(region.left) + (180 - Math.abs(region.right)) // if the region is across the 180 degree longitude line
                : Math.abs(region.left - region.right)
        // Special treatment for exceeding 90 degree longitude
        const searchRegionTop =
            region.top + viewRegionWidth * magnification > 90 ? 90 : region.top + viewRegionWidth * magnification
        const searchRegionBottom =
            region.bottom - viewRegionWidth * magnification < -90
                ? -90
                : region.bottom - viewRegionWidth * magnification
        // Special treatment for across the 180 degree longitude line
        const searchRegionLeft =
            region.left - viewRegionWidth * magnification <= -180 ? -180 : region.left - viewRegionWidth * magnification
        const searchRegionRight =
            region.right + viewRegionWidth * magnification > 180 ? 180 : region.right + viewRegionWidth * magnification
        setSearchRegion({
            left: searchRegionLeft,
            right: searchRegionRight,
            top: searchRegionTop,
            bottom: searchRegionBottom
        })
    }
}

export const isInSearchRegion = (region, searchRegion) => {
    return (
        searchRegion.left <= region.left &&
        searchRegion.right >= region.right &&
        searchRegion.left <= region.right &&
        searchRegion.right >= region.left &&
        searchRegion.top >= region.top &&
        searchRegion.bottom <= region.bottom
    )
}

export const renderLeadItem = (lead, setLeadRefreshTimes, navigation) => {
    return (
        <View style={styles.paddingH5}>
            {lead.item.Status__c === 'Open' && (
                <AllLeadsListTile
                    l={lead.item}
                    navigation={navigation}
                    isGoBack
                    needCheckData
                    refreshList={() => {
                        setLeadRefreshTimes((v) => v + 1)
                    }}
                />
            )}
            {(lead.item.Status__c === 'Negotiate' || lead.item.Status__c === 'No Sale') && (
                <MyLeadsListTile l={lead.item} navigation={navigation} isGoBack needCheckData />
            )}
        </View>
    )
}

export const renderCustomerItem = (
    customer: any,
    navigation: any,
    isCDAMapView: boolean,
    isCurrentCdaYear = false,
    isOverViewMap = false,
    isCustomerLoading = false
) => {
    return (
        <View style={styles.paddingH5}>
            <TouchableOpacity
                onPress={async () => {
                    await goToCustomerDetail(customer.item, navigation, false, isCDAMapView, true)
                }}
            >
                <CustomerListTile
                    customer={customer.item}
                    showShadow
                    isCDAMapView={isCDAMapView}
                    showCDAStatus
                    isOverViewMap={isOverViewMap}
                    isCurrentCdaYear={isCurrentCdaYear}
                    isLoading={isCustomerLoading}
                />
            </TouchableOpacity>
        </View>
    )
}

export const renderListTip = (markers, styleProps?) => {
    if (markers.length > 0) {
        return (
            <View style={[styles.tipsCont, styleProps]}>
                <CText style={styles.tipsText}>{t.labels.PBNA_MOBILE_LIST_IS_RESTRICTED_BY_MAP_VIEW}</CText>
            </View>
        )
    }
}

export const renderModalHeader = (pinItem) => {
    return (
        <View style={[styles.bgWhiteColor, styles.headerRadius]}>
            <View style={styles.defPaddingHorizontal}>
                <View style={[styles.nonLabelInput, styles.pickerBorder, styles.flexAlign]}>
                    <View style={styles.modalHead} />
                    <CText style={[styles.smallFontSize, { fontWeight: '700' }]}>
                        {pinItem?.Status__c
                            ? t.labels.PBNA_MOBILE_LEAD_INFO.toUpperCase()
                            : t.labels.PBNA_MOBILE_CUSTOMER_INFO.toUpperCase()}
                    </CText>
                </View>
            </View>
        </View>
    )
}

export const renderRotationBtn = (rotation, mapRef) => {
    return (
        <TouchableOpacity
            style={styles.rotationBtn}
            onPress={() => {
                if (rotation.regionChanged && !rotation.mode) {
                    LocationService.getCurrentPosition().then((res) => {
                        mapRef.current?.animateToRegion({
                            latitude: res.coords.latitude,
                            longitude: res.coords.longitude,
                            latitudeDelta: 0.0722,
                            longitudeDelta: 0.0722 * (Dimensions.get('window').width / Dimensions.get('window').height)
                        })
                        rotation.setRegionChanged(false)
                    })
                } else if (!rotation.regionChanged && !rotation.mode) {
                    rotation.setMode(true)
                } else if (rotation.mode) {
                    rotation.setMode(false)
                }
            }}
        >
            {!rotation.mode && !rotation.regionChanged && <Direction2Svg />}
            {!rotation.mode && rotation.regionChanged && <Direction3Svg />}
            {rotation.mode && !rotation.regionChanged && <Direction1Svg />}
        </TouchableOpacity>
    )
}

export const renderStatusList = () => {
    // do not need multiple  language
    return (
        <View style={[styles.listViewBg, styles.CDAListViewBg]}>
            <View style={styles.statusBox}>
                <View style={styles.statusItem}>
                    <CustomerSignedSvg width={22} height={22} />
                    <CText style={[styles.statusText]} numberOfLines={1}>
                        {t.labels.PBNA_MOBILE_SIGNED}
                    </CText>
                </View>

                <View style={styles.statusItem}>
                    <CustomerInProgressSvg width={22} height={22} />
                    <CText style={[styles.statusText]} numberOfLines={1}>
                        {t.labels.PBNA_MOBILE_CDA_IN_PROGRESS}
                    </CText>
                </View>
                <View style={styles.statusItem}>
                    <CustomerNotStartedSvg width={22} height={22} />
                    <CText style={[styles.statusText]} numberOfLines={1}>
                        {t.labels.PBNA_MOBILE_NOT_STARTED}
                    </CText>
                </View>
                <View style={styles.statusItem}>
                    <CustomerDeclinedSvg width={22} height={22} />
                    <CText style={[styles.statusText]} numberOfLines={1}>
                        {t.labels.PBNA_MOBILE_DECLINED}
                    </CText>
                </View>
            </View>
        </View>
    )
}

export const CDAYearFilterBtn = ({
    isCurrentCdaYear,
    setIsCurrentCdaYear
}: {
    isCurrentCdaYear: boolean
    setIsCurrentCdaYear: React.Dispatch<React.SetStateAction<boolean>>
}) => (
    <View style={commonStyle.flexRowCenter}>
        <TouchableOpacity
            onPress={() => setIsCurrentCdaYear(true)}
            style={[
                styles.yearFilterBtn,
                {
                    backgroundColor: isCurrentCdaYear ? '#00A2D9' : undefined,
                    borderWidth: isCurrentCdaYear ? undefined : 1
                }
            ]}
        >
            <CText
                style={[
                    {
                        color: 'white',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        marginTop: 'auto',
                        marginBottom: 'auto'
                    },
                    { fontWeight: isCurrentCdaYear ? '700' : undefined }
                ]}
            >
                {currentYear}
            </CText>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => setIsCurrentCdaYear(false)}
            style={[
                styles.yearFilterBtn,
                {
                    backgroundColor: isCurrentCdaYear ? undefined : '#00A2D9',
                    borderWidth: isCurrentCdaYear ? 1 : undefined
                }
            ]}
        >
            <CText style={[styles.yearFilterText, { fontWeight: isCurrentCdaYear ? undefined : '700' }]}>
                {nextYear}
            </CText>
        </TouchableOpacity>
    </View>
)

export const renderCDACustomerPin = (cust, isCurrentCdaYear: boolean) => {
    switch (cust[isCurrentCdaYear ? 'Account.CDA_Status__c' : 'Account.CDA_NY_Status__c']) {
        case 'Signed':
            return <CustomerSignedSvg />
        case 'In Progress':
            return <CustomerInProgressSvg />
        case 'Declined':
            return <CustomerDeclinedSvg />
        default:
            return <CustomerNotStartedSvg />
    }
}

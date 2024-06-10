import React, { useState, useEffect, useRef } from 'react'
import { Modal, SafeAreaView, StyleSheet, View, FlatList, Image, TouchableOpacity, Alert } from 'react-native'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import CText from '../../../../../common/components/CText'
import _, { upperCase } from 'lodash'
import FastImage from 'react-native-fast-image'
import MetricsSKUTab from './MetricsSKUTab'
import CustomerListTile from '../CustomerListTile'
import { SearchBar } from 'react-native-elements'
import BackButton from '../../../common/BackButton'
import moment from 'moment'
import {
    useMetricsItemDetailTabs,
    useMetricsDetailCustomer,
    useMetricsDetailUnAuthCustomer,
    getWTDDetailsToggles
} from '../../../../hooks/InnovationProductHooks'
import EmptyListPlaceholder from '../../../common/EmptyListPlaceholder'
import { t } from '../../../../../common/i18n/t'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import SelectTab from '../../../common/SelectTab'
import { useDebounce } from '../../../../hooks/CommonHooks'
import { ATCButton } from '../innovation-tab/InnovationProductDetail'
import { CommonParam } from '../../../../../common/CommonParam'
import { Persona } from '../../../../../common/enums/Persona'
import { SuccessModal } from '../../../../pages/rep/atc/CustomerCarouselDetailScreen'
import { useIsFocused } from '@react-navigation/native'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { useSuccessModalText } from '../../../../hooks/InnovationMetricsHooks'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white,
        marginBottom: '-8%'
    },
    filterImage: {
        width: 32,
        height: 19,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 8
    },
    eHeader: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    searchInputContainer: {
        fontSize: 14,
        color: '#565656'
    },
    searchBarInnerContainer: {
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F0F3F6'
    },
    navTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    searchBarInputContainer: {
        backgroundColor: '#F0F3F6'
    },
    fontFamily: {
        fontFamily: 'Gotham-Bold',
        textTransform: 'uppercase'
    },
    tintColor: {
        tintColor: '#0098D4'
    },
    containerStyle: {
        borderWidth: 0,
        marginLeft: 0,
        paddingLeft: 0,
        backgroundColor: 'transparent'
    },
    accountContainer: {
        backgroundColor: '#FFFFFF',
        marginTop: 10,
        marginBottom: 12,
        borderRadius: 5,
        shadowColor: '#DCE5EE',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 1,
        shadowRadius: 4,
        flexDirection: 'column'
    },
    whiteBoxContainer: {
        height: 120,
        flexDirection: 'row'
    },
    iconInfoContainer: {
        width: '25%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    accountIconContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    whiteBoxInfoContainer: {
        width: '58%',
        flexDirection: 'column'
    },
    addressInnerContainer: {
        width: '75%',
        paddingLeft: '1%',
        paddingTop: 22
    },
    companyText: {
        fontSize: 18,
        fontWeight: '700',
        overflow: 'hidden'
    },
    streetText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656',
        marginTop: 8,
        marginBottom: 3
    },
    cityText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656'
    },
    buttonGroupContainer: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        marginHorizontal: 6
    },
    NoResultTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 10
    },
    NoResultContent: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center'
    },
    prodStatusTitle: {
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900,
        color: baseStyle.color.black
    },
    unAuthTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    prodStatusContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 22,
        marginBottom: 20
    },
    unAuthView: {
        marginTop: 20,
        marginBottom: 24
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 6
    },
    subName: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    flavorName: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    packageLabel: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: '#565656'
    },
    nat: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black
    },
    shadowButton: {
        shadowColor: '##004C97',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0.2,
        shadowRadius: 5
    },
    textContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3
    },
    prodInfoContainer: {
        flexDirection: 'row',
        paddingHorizontal: '5%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    volTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.gray,
        lineHeight: 16
    },
    volContent: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    volRedColor: {
        marginTop: 4,
        color: '#EB445A'
    },
    noCustomerTextStyle: {
        marginHorizontal: 1,
        color: '#565656',
        fontWeight: baseStyle.fontWeight.fw_400
    },
    unAuthEmptyCon: {
        alignItems: 'center',
        width: '120%'
    },
    unAuthListCon: {
        flex: 1,
        paddingHorizontal: '5%',
        backgroundColor: '#F2F4F7',
        justifyContent: 'center'
    },
    authListCon: {
        backgroundColor: '#F2F4F7',
        height: '100%',
        width: '100%',
        paddingBottom: '10%'
    },
    paddingH1: {
        paddingHorizontal: 1
    },
    authEmptyImg: {
        width: 180,
        height: 135
    },
    alignCenter: {
        alignItems: 'center'
    },
    authList: {
        flex: 1,
        paddingHorizontal: '5%',
        backgroundColor: '#F2F4F7',
        justifyContent: 'center'
    },
    modalBg: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: '5%',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    backBtn: {
        tintColor: '#0098D4'
    },
    backText: {
        flex: 1,
        alignItems: 'center',
        marginRight: '8%'
    },
    prodImageCon: {
        height: '100%',
        paddingTop: 10
    },
    prodInfoCon: {
        marginLeft: 15,
        width: '75%',
        minHeight: 70,
        marginTop: 10
    },
    titleCon: {
        justifyContent: 'center'
    },
    clickableV: {
        marginTop: 20
    },
    searchBarCon: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: '5%'
    },
    skuTabCon: {
        width: '100%',
        paddingHorizontal: '5%'
    },
    volIdCon: {
        height: 90,
        flexDirection: 'row',
        paddingTop: 30
    },
    width55: {
        width: '55%'
    },
    width45: {
        width: '45%'
    },
    unAuthHead: {
        marginTop: 22,
        marginBottom: 12,
        paddingHorizontal: '5%'
    },
    selectTabCon: {
        marginHorizontal: 0,
        backgroundColor: '#FFF',
        marginTop: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#D3D3D3'
    },
    listCon: {
        backgroundColor: '#F2F4F7',
        flex: 1
    },
    tab: {
        marginHorizontal: 0,
        backgroundColor: '#FFF',
        marginTop: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#D3D3D3'
    },
    atcBtn: {
        marginTop: 5,
        marginBottom: 25
    },
    shoppingCar: {
        color: '#00A2D9',
        marginTop: 5,
        marginRight: 5
    },
    shoppingCon: {},
    shoppingNumCon: {
        backgroundColor: '#EB445A',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        marginLeft: 11
    },
    shoppingNum: {
        color: '#FFFFFF',
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    }
})

interface MetricsSKUDetailProps {
    onBack: Function
    item: any
    isShow: boolean
    showAuth: boolean
    accessToken: any
    wiredCount: any
    filter: any
    isUnavailable: any
    navigation: any
    authStateMap: any
    GTINsMap: any
    onShowDetailScreen?: Function
    defaultTabData?: any
}

interface InputName {
    title: string
    name: string
}

type activeTabType = 0 | 1 | 2 | 3 | 4 | 5
const tabName = ['cWtdIds', 'orderDayIds', 'openOrderIds', 'volIds', 'voidIds']
const MetricsSKUDetail = (props: MetricsSKUDetailProps) => {
    const {
        onBack,
        item,
        accessToken,
        showAuth,
        wiredCount,
        authStateMap,
        isUnavailable,
        navigation,
        GTINsMap,
        onShowDetailScreen,
        defaultTabData,
        isShow
    } = props
    const wtdName = [
        { title: t.labels.PBNA_MOBILE_VOIDS_WTD.toUpperCase(), name: 'voidWTDIds' },
        { title: `${t.labels.PBNA_MOBILE_CLOSED.toUpperCase()} ${t.labels.PBNA_MOBILE_WTD}`, name: 'cWtdIds' },
        { title: t.labels.PBNA_MOBILE_METRICS_11WKS_0CS.toUpperCase(), name: 'wksIds' }
    ]
    const voidName = [
        { title: t.labels.PBNA_MOBILE_METRICS_DETAIL_VOID_GAP, name: 'voidIds' },
        { title: t.labels.PBNA_MOBILE_METRICS_DETAIL_VOID_CLOSED, name: 'lcdIds' }
    ]
    const orderName = [
        { title: upperCase(t.labels.PBNA_MOBILE_IP_ORDERED), name: 'openOrderIds' },
        { title: upperCase(t.labels.PBNA_MOBILE_METRICS_ORDERED_TODAY), name: 'orderTodayIds' }
    ]
    const [searchChange, setSearchChange] = useState('')
    const [searchText, setSearchText] = useState('')
    const [activeTab, setActiveTab] = useState<activeTabType | number>(defaultTabData?.activeTab || 0)
    const [showUnAuth, setShowUnAuth] = useState(showAuth)
    const [selectedWTDIndex, setSelectedWTDIndex] = useState(
        defaultTabData?.selectedWTDIndex || getWTDDetailsToggles(item, wtdName).defaultIndex
    )
    const [selectedVoidIndex, setSelectedVoidIndex] = useState(
        defaultTabData?.selectedVoidIndex || getWTDDetailsToggles(item, voidName).defaultIndex
    )
    const [selectedOrderIndex, setSelectedOrderIndex] = useState(
        defaultTabData?.selectedOrderIndex || getWTDDetailsToggles(item, orderName).defaultIndex
    )
    const [selectedTab, setSelectedTab] = useState(defaultTabData?.selectedTab || 'cWtdIds')
    const customerLst = useMetricsDetailCustomer(selectedTab, item, searchText, isShow)
    const { unAuthCustomerLst, allUnAuthList } = useMetricsDetailUnAuthCustomer(item, searchText)
    const { tabs, setTabs } = useMetricsItemDetailTabs(item, tabName)
    const wtdTabs = getWTDDetailsToggles(item, wtdName).tabs
    const orderTabs = getWTDDetailsToggles(item, orderName).tabs
    const voidTabs = getWTDDetailsToggles(item, voidName).tabs
    const [successModalText, setSuccessModalText] = useState('')
    const isFocused = useIsFocused()
    const authSKUTabRef = useRef(null)
    useSuccessModalText(props, isFocused, setSuccessModalText)

    useEffect(() => {
        if (activeTab === 0) {
            if (selectedWTDIndex === 0) {
                setSelectedTab('voidWTDIds')
            } else if (selectedWTDIndex === 1) {
                setSelectedTab('cWtdIds')
            } else {
                setSelectedTab('wksIds')
            }
        } else if (activeTab === 4) {
            // voidIds
            if (selectedVoidIndex === 1) {
                setSelectedTab('lcdIds')
            } else {
                setSelectedTab('voidIds')
            }
        } else if (activeTab === 2) {
            // openOrderIds
            if (selectedOrderIndex === 1) {
                setSelectedTab('orderTodayIds')
            } else {
                setSelectedTab('openOrderIds')
            }
        } else {
            setSelectedTab(tabName[activeTab])
        }
    }, [selectedVoidIndex, activeTab, showUnAuth, selectedOrderIndex, selectedWTDIndex])

    useEffect(() => {
        if (_.size(tabs) > 0) {
            const originTab = tabs.findIndex((tabItem) => tabItem.haveData)
            authSKUTabRef?.current?.setActiveTab(originTab)
            if (originTab > 2) {
                authSKUTabRef?.current?.scrollToEnd()
            }
        }
    }, [tabs])

    const getToggles = (
        inputWTDName: Array<InputName>,
        inputVoidName: Array<InputName>,
        inputOrderName: Array<InputName>,
        item: any
    ) => {
        const WTDIndex = getWTDDetailsToggles(item, inputWTDName).defaultIndex
        const voidIndex = getWTDDetailsToggles(item, inputVoidName).defaultIndex
        const WTDDetailsIndex = getWTDDetailsToggles(item, inputOrderName).defaultIndex
        return {
            WTDIndex,
            voidIndex,
            WTDDetailsIndex
        }
    }

    useEffect(() => {
        if (isShow) {
            const { WTDIndex, voidIndex, WTDDetailsIndex } = getToggles(wtdName, voidName, orderName, item)
            setSelectedWTDIndex(WTDIndex)
            setSelectedVoidIndex(voidIndex)
            setSelectedOrderIndex(WTDDetailsIndex)
            setActiveTab(0)
            setShowUnAuth(showAuth)
        }
    }, [isShow])

    useEffect(() => {
        if (isUnavailable) {
            Alert.alert(
                t.labels.PBNA_MOBILE_IP_PRODUCT_UNAVAILABLE_TITLE,
                '\n' + t.labels.PBNA_MOBILE_IP_PRODUCT_UNAVAILABLE_MSG,
                [{ text: 'OK' }]
            )
        }
    }, [isUnavailable])

    useDebounce(() => setSearchText(searchChange), 300, [searchChange])

    const onShowDetailScreenFunction = () => {
        onShowDetailScreen &&
            onShowDetailScreen({
                activeTab,
                selectedWTDIndex,
                selectedVoidIndex,
                selectedOrderIndex,
                showUnAuth,
                selectedTab
            })
    }

    const renderCustomerItem = (v) => {
        return (
            <TouchableOpacity
                onPress={async () => {
                    onBack()
                    navigation.navigate('CustomerDetailScreen', {
                        customer: v.item,
                        isGoBackToCustomer: {
                            productInfo: item
                        },
                        shouldLandOnTab: t.labels.PBNA_MOBILE_IP_INNOVATION.toLocaleUpperCase(),
                        onShowDetailScreen: onShowDetailScreenFunction
                    })
                    Instrumentation.reportMetric('PSR Goes To Carousel From My Metrics', 1)
                    Instrumentation.startTimer('PSR Enters Customer Detail Page Loading')
                    Instrumentation.startTimer('PSR Time Spent On Customer Detail Page')
                    Instrumentation.stopTimer('PSR Time Spent On My Metrics Page')
                }}
            >
                <CustomerListTile
                    customer={v.item}
                    showShadow
                    customerListAppendage
                    smallGap
                    hasInnov={activeTab === 3}
                />
            </TouchableOpacity>
        )
    }
    const checkClickable = () => {
        if (showUnAuth) {
            return true
        }
        return !authStateMap.get(item?.Id)
    }
    const renderUnAuthList = () => {
        if (unAuthCustomerLst.length === 0) {
            return (
                <EmptyListPlaceholder
                    title={
                        <View style={styles.unAuthEmptyCon}>
                            <CText style={styles.NoResultTitle}>{t.labels.PBNA_MOBILE_METRICS_NO_RESULTS}</CText>
                            <CText style={styles.NoResultContent}>{t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_1}</CText>
                            <CText style={styles.NoResultContent}>{t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_2}</CText>
                            <CText style={styles.NoResultContent}>{t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_3}</CText>
                        </View>
                    }
                    transparentBackground
                />
            )
        }
        return (
            <View style={styles.unAuthListCon}>
                <FlatList
                    data={unAuthCustomerLst}
                    extraData={unAuthCustomerLst}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderCustomerItem}
                    keyExtractor={(v) => v.Id}
                />
            </View>
        )
    }
    const renderList = () => {
        if (customerLst.length === 0 && searchText !== '') {
            return (
                <View style={styles.authListCon}>
                    <EmptyListPlaceholder
                        title={
                            <View style={styles.unAuthEmptyCon}>
                                <CText style={styles.NoResultTitle}>{t.labels.PBNA_MOBILE_METRICS_NO_RESULTS}</CText>
                                <CText style={styles.NoResultContent}>
                                    {t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_1}
                                </CText>
                                <CText style={styles.NoResultContent}>
                                    {t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_2 +
                                        ' ' +
                                        t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_3}
                                </CText>
                            </View>
                        }
                        transparentBackground
                    />
                </View>
            )
        } else if (customerLst.length === 0 && searchText === '') {
            const noCustomerText =
                `${t.labels.PBNA_MOBILE_METRICS_NO_CUSTOMER_1} ` +
                `${t.labels.PBNA_MOBILE_METRICS_NO_CUSTOMER_2} ` +
                `${t.labels.PBNA_MOBILE_METRICS_NO_CUSTOMER_3}` +
                '\n'
            return (
                <EmptyListPlaceholder
                    image={
                        <Image source={ImageSrc.IMG_NO_CUSTOMER} style={styles.authEmptyImg} resizeMode={'contain'} />
                    }
                    title={
                        <View style={styles.alignCenter}>
                            <CText style={styles.NoResultTitle}>{t.labels.PBNA_MOBILE_METRICS_NO_CUSTOMER}</CText>
                            <CText style={[styles.NoResultContent, styles.noCustomerTextStyle]}>{noCustomerText}</CText>
                        </View>
                    }
                    transparentBackground
                />
            )
        }
        return (
            <View style={styles.authList}>
                <FlatList
                    data={customerLst}
                    extraData={customerLst}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderCustomerItem}
                    keyExtractor={(v) => v.Id}
                />
            </View>
        )
    }

    const renderImage = () => {
        if (GTINsMap && item?.GTIN && GTINsMap[item?.GTIN]) {
            return (
                <FastImage
                    source={{
                        uri: GTINsMap[item.GTIN],
                        headers: {
                            Authorization: accessToken,
                            accept: 'image/png'
                        },
                        cache: FastImage.cacheControl.web
                    }}
                    style={styles.image}
                    resizeMode={'contain'}
                />
            )
        }
        return (
            <Image style={styles.image} source={require('../../../../../../assets/image/No_Innovation_Product.png')} />
        )
    }

    const caseColor = (storeProduct) => {
        if (storeProduct?.volSum < 0) {
            return { color: '#EB445A' }
        }
    }

    return (
        <Modal visible={isShow} animationType="fade" transparent>
            <SafeAreaView style={styles.container}>
                <View style={styles.eHeader}>
                    <View style={styles.modalBg}>
                        <BackButton
                            extraStyle={styles.backBtn}
                            onBackPress={() => {
                                onBack()
                            }}
                        />
                        <View style={styles.backText}>
                            <CText style={[styles.navTitle]}>
                                {t.labels.PBNA_MOBILE_METRICS_MY_METRICS.toUpperCase()}
                            </CText>
                        </View>
                    </View>
                    <View style={styles.prodStatusContainer}>
                        <CText style={styles.prodStatusTitle}>
                            {showUnAuth
                                ? t.labels.PBNA_MOBILE_METRICS_UNAUTH_CUST
                                : t.labels.PBNA_MOBILE_METRICS_INNOV_PERFORMANCE}
                        </CText>
                    </View>
                    <View style={styles.prodInfoContainer}>
                        <View style={styles.prodImageCon}>{renderImage()}</View>
                        <View style={styles.prodInfoCon}>
                            <View style={styles.titleCon}>
                                <CText style={styles.subName}>
                                    {item?.Formatted_Sub_Brand_Name__c || item?.Sub_Brand__c}
                                </CText>
                            </View>
                            <View style={styles.textContainer}>
                                <CText style={styles.flavorName}>
                                    {item?.Formatted_Flavor__c || item?.Flavor_Name__c}
                                </CText>
                            </View>
                            <View style={styles.textContainer}>
                                <CText style={styles.packageLabel}>
                                    {item?.Formatted_Package__c || item?.Package_Type_Name__c}
                                </CText>
                            </View>
                            <View style={styles.textContainer}>
                                <CText style={styles.nat}>
                                    {t.labels.PBNA_MOBILE_METRICS_NAT_LAUNCH +
                                        ' ' +
                                        moment(item?.National_Launch_Date).format('MMM DD, YYYY')}
                                </CText>
                            </View>
                            {checkClickable() && (
                                <View style={styles.unAuthView}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowUnAuth(!showUnAuth)
                                            if (showUnAuth) {
                                                setSelectedTab(tabName[activeTab])
                                            }
                                        }}
                                    >
                                        <CText style={[styles.unAuthTitle, { color: baseStyle.color.LightBlue }]}>
                                            {upperCase(
                                                !showUnAuth
                                                    ? t.labels.PBNA_MOBILE_METRICS_VIEW_UNAUTH_CUST
                                                    : t.labels.PBNA_MOBILE_METRICS_VIEW_DETAILS
                                            )}
                                        </CText>
                                    </TouchableOpacity>
                                </View>
                            )}
                            {!checkClickable() && <View style={styles.clickableV} />}
                        </View>
                    </View>
                    {CommonParam.PERSONA__c === Persona.PSR && CommonParam.isATC && !showUnAuth && (
                        <ATCButton
                            btnStyle={styles.atcBtn}
                            onPressBtn={() => {
                                onBack()
                                Instrumentation.stopTimer('PSR Time Spent On My Metrics Page')
                                navigation.navigate('AddToCartView', {
                                    skuItem: item,
                                    qtyImageCode: GTINsMap[item.GTIN],
                                    onShowDetailScreen: onShowDetailScreenFunction
                                })
                            }}
                        />
                    )}
                    <View style={styles.searchBarCon}>
                        <SearchBar
                            platform={'ios'}
                            placeholder={t.labels.PBNA_MOBILE_METRICS_SEARCH_CUSTOMERS}
                            allowFontScaling={false}
                            cancelButtonTitle={''}
                            containerStyle={[styles.searchBarInnerContainer, { width: '100%' }]}
                            inputContainerStyle={styles.searchBarInputContainer}
                            value={searchChange}
                            inputStyle={styles.searchInputContainer}
                            onChangeText={(v) => {
                                setSearchChange(v)
                            }}
                        />
                    </View>
                    {!showUnAuth && (
                        <View style={styles.skuTabCon}>
                            <MetricsSKUTab
                                cRef={authSKUTabRef}
                                tabs={tabs}
                                activeIndex={activeTab}
                                isScrollEnd={defaultTabData?.activeTab > 2}
                                setActiveSection={(v: number) => {
                                    setActiveTab(v)
                                }}
                                isShow={isShow}
                                setTabs={setTabs}
                                item={item}
                                tabName={tabName}
                            />
                            {activeTab === 0 && (
                                <SelectTab
                                    style={[styles.tab, styles.shadowButton]}
                                    listData={wtdTabs}
                                    changeTab={(value) => {
                                        setSelectedWTDIndex(value)
                                    }}
                                    activeTab={selectedWTDIndex}
                                />
                            )}
                            {activeTab === 3 && ( // volIds
                                <View style={styles.volIdCon}>
                                    <View style={styles.width55}>
                                        <CText style={styles.volTitle}>{t.labels.PBNA_MOBILE_METRICS_VOLUME}</CText>
                                        <CText style={[styles.volContent, { marginTop: 4 }, caseColor(item)]}>
                                            {parseInt(item.volSum).toLocaleString('en-US') + ' cs'}
                                        </CText>
                                    </View>
                                    <View style={styles.width45}>
                                        <CText style={styles.volTitle}>{t.labels.PBNA_MOBILE_METRICS_NET_REV}</CText>
                                        {parseFloat(item.revSum) > 0 && (
                                            <CText style={[styles.volContent, { marginTop: 4 }]}>
                                                {parseFloat(item.revSum).toLocaleString('en-US', {
                                                    style: 'currency',
                                                    currency: 'USD',
                                                    maximumFractionDigits: 2
                                                })}
                                            </CText>
                                        )}
                                        {parseFloat(item.revSum) === 0 && (
                                            <CText style={[styles.volContent, { marginTop: 4 }]}>
                                                {t.labels.PBNA_MOBILE_ORDER_D + '0.00'}
                                            </CText>
                                        )}
                                        {parseFloat(item.revSum) < 0 && (
                                            <CText style={[styles.volContent, styles.volRedColor]}>
                                                {parseFloat(item.revSum).toLocaleString('en-US', {
                                                    style: 'currency',
                                                    currency: 'USD',
                                                    maximumFractionDigits: 2
                                                })}
                                            </CText>
                                        )}
                                    </View>
                                </View>
                            )}
                            {activeTab === 4 && ( // voidIds
                                <SelectTab
                                    style={[styles.selectTabCon, styles.shadowButton]}
                                    listData={voidTabs}
                                    changeTab={(value) => {
                                        setSelectedVoidIndex(value)
                                    }}
                                    activeTab={selectedVoidIndex}
                                />
                            )}
                            {activeTab === 2 && ( // orderOpenIds
                                <SelectTab
                                    style={[styles.selectTabCon, styles.shadowButton]}
                                    listData={orderTabs}
                                    changeTab={(value) => {
                                        setSelectedOrderIndex(value)
                                    }}
                                    activeTab={selectedOrderIndex}
                                />
                            )}
                        </View>
                    )}
                    <View style={styles.unAuthHead}>
                        {showUnAuth && (
                            <View style={commonStyle.flexDirectionRow}>
                                <CText>{allUnAuthList.length + ' ' + t.labels.PBNA_MOBILE_METRICS_CUSTOMERS}</CText>
                                <CText> : {Math.ceil((allUnAuthList.length / wiredCount) * 100)}%</CText>
                            </View>
                        )}
                        {!showUnAuth && (
                            <CText>
                                {customerLst.length}
                                {' ' + t.labels.PBNA_MOBILE_METRICS_CUSTOMERS}
                            </CText>
                        )}
                    </View>
                    <View style={styles.listCon}>
                        {showUnAuth && renderUnAuthList()}
                        {!showUnAuth && renderList()}
                    </View>
                </View>
            </SafeAreaView>
            <SuccessModal successModalText={successModalText} />
        </Modal>
    )
}
export default MetricsSKUDetail

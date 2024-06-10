/**
 * @description Screen to show KAM Customer List Screen.
 * @author Dashun Fu
 * @date 2023-04-03
 */
import React, { FC, useState, useEffect, useRef } from 'react'
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native'
import CText from '../../../common/components/CText'
import EmptyListPlaceholder from '../../components/common/EmptyListPlaceholder'
import CustomerListTile from '../../components/rep/customer/CustomerListTile'
import { SearchBar } from 'react-native-elements'
import { CommonParam } from '../../../common/CommonParam'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { t } from '../../../common/i18n/t'
import { useDebounce } from '../../hooks/CommonHooks'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { baseStyle } from '../../../common/styles/BaseStyle'
import Loading from '../../../common/components/Loading'
import CustomerListSelector from '../../components/rep/customer/CustomerListSelector'
import { useBusinessSegmentPicklist } from '../../hooks/LeadHooks'
import { useKamCustomersOnline } from '../../hooks/KamCustomerHooks'
import { isPersonaKAM } from '../../../common/enums/Persona'
import _ from 'lodash'

const styles = StyleSheet.create({
    headerContainer: {
        width: '100%',
        paddingHorizontal: 22,
        height: '100%',
        justifyContent: 'space-between'
    },
    headerTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerTextInnerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    searchBarContainer: {
        flexDirection: 'row',
        marginBottom: 20,
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
    listCon: {
        flex: 6,
        backgroundColor: '#EFF3F6'
    },
    itemCon: {
        paddingHorizontal: '5%'
    },
    flexGrow: {
        flexGrow: 1
    },
    listEmpCon: {
        alignItems: 'center',
        width: '120%'
    },
    flex1_5: {
        flex: 1.5
    },
    whiteBg: {
        backgroundColor: 'white'
    },
    navTitle: {
        fontWeight: '900',
        fontSize: 24,
        color: 'black'
    },
    selectBtn: {
        marginLeft: 5,
        borderRadius: 5
    },
    noCustomerImg: {
        width: 180,
        height: 135
    },
    alignCenter: {
        alignItems: 'center'
    },
    noCustomerTextStyle: {
        marginHorizontal: 1,
        color: '#565656',
        fontWeight: baseStyle.fontWeight.fw_400
    }
})

interface KamCustomerListScreenProps {
    navigation: any
}

const PAGE_SIZE: number = 20

const KamCustomerListScreen: FC<KamCustomerListScreenProps> = (props: KamCustomerListScreenProps) => {
    const { navigation } = props
    const [searchTempValue, setSearchTempValue] = useState<string>('')
    const [searchValue, setSearchValue] = useState<string>('')
    const [isCustomerDetailGoBack, setIsCustomerDetailGoBack] = useState<boolean>(false)

    // debounce search
    useDebounce(() => setSearchValue(searchTempValue), 500, [searchTempValue])

    const cFlatListRef = useRef<FlatList>(null)

    const { channelList } = useBusinessSegmentPicklist()
    const [isShowKamCustomerSelector, setIsShowKamCustomerSelector] = useState<boolean>(false)
    const [selectorObj, setSelectorObj] = useState({
        selectedKAs: [],
        selectedOrderDays: [],
        selectedBusnSegment: [],
        selectedSort: '',
        selectedOTS: false,
        selectedVoids: false,
        selectedWksCs: false,
        selectedGEOs: [],
        wiredGroupNames: []
    })

    const [kamCustomerFilterObject, setKamCustomerFilterObject] = useState<any>({})

    const showSelector = (flag: boolean) => {
        setIsShowKamCustomerSelector(flag)
    }
    const kamCustomerSelectorRef = useRef(null)
    const { kamCustomers, setCurrentPage, isRefreshing, setIsRefreshing, hasMoreData, isLoading, isRightLoading } =
        useKamCustomersOnline(PAGE_SIZE, searchValue, selectorObj.selectedSort, cFlatListRef, kamCustomerFilterObject)

    const refreshCustomerList = async () => {
        setIsRefreshing(true)
    }

    const onCustomerDetailGoBack = () => {
        setIsCustomerDetailGoBack(true)
    }

    const showFilterHighlightColor =
        Object.values(kamCustomerFilterObject).findIndex((value) => !_.isEmpty(value)) > -1 ||
        selectorObj.selectedSort ||
        kamCustomerFilterObject.isOTSCustomer

    const renderItem = (customer: any) => {
        return (
            <View style={styles.itemCon}>
                <TouchableOpacity
                    onPress={() => {
                        if (isLoading) {
                            return
                        }
                        if (isPersonaKAM()) {
                            Instrumentation.startTimer('KAM Enters Customer Detail Page Loading')
                        }
                        navigation.navigate('CustomerDetailScreen', {
                            customer: customer.item,
                            isOnline: true,
                            onGoBackToKamCustomerList: onCustomerDetailGoBack
                        })
                    }}
                >
                    <CustomerListTile customer={customer.item} showShadow customerListAppendage smallGap />
                </TouchableOpacity>
            </View>
        )
    }

    useEffect(() => {
        const unsubscribeFocus = navigation.addListener('focus', () => {
            !isCustomerDetailGoBack && cFlatListRef?.current?.scrollToOffset({ offset: 0, animated: true })
        })
        const unsubscribeBlur = navigation.addListener('blur', () => {
            setIsCustomerDetailGoBack(false)
        })
        return () => {
            unsubscribeBlur()
            unsubscribeFocus()
        }
    }, [navigation, isCustomerDetailGoBack])

    const renderListEmptyComponent = () => {
        if (kamCustomers.length === 0 && (searchValue !== '' || showFilterHighlightColor)) {
            return (
                <EmptyListPlaceholder
                    title={
                        <View style={styles.listEmpCon}>
                            <CText style={styles.NoResultTitle}>{t.labels.PBNA_MOBILE_METRICS_NO_RESULTS}</CText>
                            <CText style={styles.NoResultContent}>{t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_1}</CText>
                            <CText style={styles.NoResultContent}>
                                {t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_2 +
                                    ' ' +
                                    t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_3}
                            </CText>
                        </View>
                    }
                    transparentBackground
                />
            )
        } else if (kamCustomers.length === 0 && searchValue === '') {
            const noCustomerText =
                `${t.labels.PBNA_MOBILE_NO_WIRED_CUSTOMERS}\n` +
                `${t.labels.PBNA_MOBILE_NO_WIRED_CUSTOMERS_CHECK_WIRING_TOOL}\n` +
                `${t.labels.PBNA_MOBILE_NO_WIRED_CUSTOMERS_MAKE_CUSTOMER_WIRING_SELECTION} ` +
                `${t.labels.PBNA_MOBILE_NO_WIRED_CUSTOMERS_GO_TO_SAVVY_CENTER}\n` +
                '\n' +
                `${t.labels.PBNA_MOBILE_NO_WIRED_CUSTOMERS_WIRING_REMINDER}`
            return (
                <EmptyListPlaceholder
                    image={
                        <Image source={ImageSrc.IMG_NO_CUSTOMER} style={styles.noCustomerImg} resizeMode={'contain'} />
                    }
                    title={
                        <View style={styles.alignCenter}>
                            <CText style={styles.NoResultTitle}>
                                {`${t.labels.PBNA_MOBILE_NO} ${t.labels.PBNA_MOBILE_ORDERING_MY_CUSTOMERS}`}
                            </CText>
                            <CText style={[styles.NoResultContent, styles.noCustomerTextStyle]}>{noCustomerText}</CText>
                        </View>
                    }
                    transparentBackground
                />
            )
        }
        return <View />
    }

    const renderList = () => {
        const INITIAL_RENDER_NUM = 5
        const THRESHOLD = 0.3
        const CAN_SET_CURRENT_PAGE = !isLoading && hasMoreData
        return (
            <FlatList
                ref={cFlatListRef}
                contentContainerStyle={styles.flexGrow}
                data={kamCustomers}
                renderItem={renderItem}
                keyExtractor={(item: any) => item.Id}
                onEndReachedThreshold={THRESHOLD}
                initialNumToRender={INITIAL_RENDER_NUM}
                ListEmptyComponent={renderListEmptyComponent}
                onEndReached={() => CAN_SET_CURRENT_PAGE && setCurrentPage((prevPage) => prevPage + 1)}
                refreshControl={
                    <RefreshControl
                        title={t.labels.PBNA_MOBILE_LOADING}
                        tintColor={'#00A2D9'}
                        titleColor={'#00A2D9'}
                        refreshing={isRefreshing}
                        onRefresh={refreshCustomerList}
                    />
                }
            />
        )
    }

    return (
        <View style={commonStyle.flex_1}>
            <View style={styles.flex1_5}>
                <SafeAreaView style={styles.whiteBg}>
                    <View style={styles.headerContainer}>
                        <View style={styles.headerTextContainer}>
                            <View style={styles.headerTextInnerContainer}>
                                <TouchableOpacity onPress={() => {}}>
                                    <CText style={styles.navTitle}>{t.labels.PBNA_MOBILE_MY_CUSTOMERS}</CText>
                                </TouchableOpacity>
                            </View>
                            {isRightLoading && <ActivityIndicator />}
                        </View>
                        <View style={styles.searchBarContainer}>
                            <SearchBar
                                platform={'ios'}
                                placeholder={t.labels.PBNA_MOBILE_SEARCH_CUSTOMERS}
                                allowFontScaling={false}
                                showCancel
                                cancelButtonTitle={''}
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
                                    Instrumentation.reportMetric(`${CommonParam.PERSONA__c} searches customers`, 1)
                                }}
                                onCancel={() => {
                                    setSearchTempValue('')
                                    setSearchValue(searchTempValue)
                                }}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.selectBtn,
                                    {
                                        backgroundColor: showFilterHighlightColor ? '#2A82E4' : '#FFFFFF'
                                    }
                                ]}
                                onPress={() => {
                                    showSelector(true)
                                }}
                            >
                                <Image
                                    source={
                                        showFilterHighlightColor
                                            ? require('../../../../assets/image/icon-sort-white.png')
                                            : require('../../../../assets/image/icon-sort.png')
                                    }
                                    style={[styles.filterImage]}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
            <View style={styles.listCon}>{renderList()}</View>
            <View>
                {isShowKamCustomerSelector && (
                    <CustomerListSelector
                        cRef={kamCustomerSelectorRef}
                        channelList={channelList}
                        onBack={() => {
                            showSelector(false)
                        }}
                        selectorObj={selectorObj}
                        setSelectorObj={setSelectorObj}
                        isOnline
                        setFilterParamsObject={(item: object) => {
                            setKamCustomerFilterObject(item)
                        }}
                    />
                )}
            </View>
            <Loading isLoading={isLoading} />
        </View>
    )
}

export default KamCustomerListScreen

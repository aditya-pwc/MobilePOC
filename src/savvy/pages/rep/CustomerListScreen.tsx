/**
 * @description Screen to show Customer List Screen.
 * @author Shangmin Dou
 * @date 2021-09-27
 */
import React, { FC, useState, useRef } from 'react'
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
import { useIsFocused } from '@react-navigation/native'
import { useBusinessSegmentPicklist } from '../../hooks/LeadHooks'
import { useCustomers } from '../../hooks/CustomerHooks'
import { SearchBar } from 'react-native-elements'
import { useRepPullDownRefresh } from '../../hooks/RefreshHooks'
import { useDispatch } from 'react-redux'
import CustomerListSelector from '../../components/rep/customer/CustomerListSelector'
import { CommonParam } from '../../../common/CommonParam'
import { isPersonaFSManager, Persona } from '../../../common/enums/Persona'
import CustomerFilterSortForm from '../../components/rep/customer/CustomerFilterSortForm'
import { useUserCurrentPosition } from '../../hooks/MapHooks'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { t } from '../../../common/i18n/t'
import { useDebounce } from '../../hooks/CommonHooks'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { useAppSelector } from '../../redux/ReduxHooks'

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%'
    },
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
    shoeSelectBtn: {
        marginLeft: 5,
        borderRadius: 5
    }
})

interface CustomerListScreenProps {
    navigation: any
}

const CustomerListScreen: FC<CustomerListScreenProps> = (props: CustomerListScreenProps) => {
    const { navigation } = props
    const isFocused = useIsFocused()
    const dispatch = useDispatch()
    const [isShowSelector, setIsShowSelector] = useState(false)
    const [myCustomerQuery, setMyCustomerQuery] = useState('')
    const { channelList } = useBusinessSegmentPicklist()
    const [searchValue, setSearchValue] = useState('')
    const [searchText, setSearchText] = useState('')
    const [selectorObj, setSelectorObj] = useState({
        selectedKAs: [],
        selectedOrderDays: [],
        selectedBusnSegment: [],
        selectedSort: '',
        selectedOTS: false,
        selectedVoids: false,
        selectedWksCs: false
    })
    const geolocation = useUserCurrentPosition()
    const [query, setQuery] = useState('')
    const { isLoading, setIsLoading, setIsPullDownAction } = useRepPullDownRefresh('CustomersList', dispatch, isFocused)
    const isRefreshLoading = useAppSelector((state) => state.customerReducer.customerListStateReducer.isLoaded)
    const refreshTimes = useAppSelector((state) => state.customerReducer.customerListStateReducer.refreshTimes)
    const { customers, setOffset, isBackendSearchLoading } = useCustomers(
        isFocused,
        isLoading,
        query,
        selectorObj.selectedSort,
        searchValue,
        myCustomerQuery,
        refreshTimes
    )
    const filterRef = useRef(null)
    const selectorRef = useRef()
    const showSelector = (flag: boolean) => {
        setIsShowSelector(flag)
    }
    useDebounce(() => setSearchValue(searchText), 300, [searchText])

    const renderItem = (customer: any) => {
        return (
            <View style={styles.itemCon}>
                <TouchableOpacity
                    onPress={() => {
                        if (isLoading) {
                            return
                        }
                        if (CommonParam.PERSONA__c === Persona.PSR) {
                            Instrumentation.startTimer('PSR Enters Customer Detail Page Loading')
                        }
                        navigation.navigate('CustomerDetailScreen', {
                            customer: customer.item
                        })
                    }}
                >
                    <CustomerListTile
                        customer={customer.item}
                        showShadow
                        customerListAppendage
                        smallGap={CommonParam.PERSONA__c === Persona.PSR}
                        isLoading={isLoading}
                        refreshFlag={refreshTimes}
                    />
                </TouchableOpacity>
            </View>
        )
    }
    const renderList = () => {
        return (
            <FlatList
                contentContainerStyle={styles.flexGrow}
                data={customers}
                renderItem={renderItem}
                keyExtractor={(item) => item.Id}
                onEndReachedThreshold={0.3}
                initialNumToRender={5}
                ListEmptyComponent={
                    <EmptyListPlaceholder
                        title={
                            <View style={styles.listEmpCon}>
                                <CText style={styles.NoResultTitle}>{t.labels.PBNA_MOBILE_NO_RESULTS}</CText>
                                <CText style={styles.NoResultContent}>
                                    {t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_1}
                                </CText>
                                <CText style={styles.NoResultContent}>
                                    {t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_2}
                                </CText>
                                <CText style={styles.NoResultContent}>
                                    {t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_3}
                                </CText>
                            </View>
                        }
                        transparentBackground
                    />
                }
                onEndReached={() => {
                    setOffset((v) => v + 1)
                }}
                refreshControl={
                    <RefreshControl
                        title={t.labels.PBNA_MOBILE_LOADING}
                        tintColor={'#00A2D9'}
                        titleColor={'#00A2D9'}
                        refreshing={isLoading}
                        onRefresh={() => {
                            setIsLoading(true)
                            setIsPullDownAction(true)
                        }}
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
                                    <CText style={styles.navTitle}>
                                        {isPersonaFSManager()
                                            ? t.labels.PBNA_MOBILE_TEAM_CUSTOMERS
                                            : t.labels.PBNA_MOBILE_MY_CUSTOMERS}
                                    </CText>
                                </TouchableOpacity>
                            </View>
                            {(isBackendSearchLoading || isRefreshLoading) && <ActivityIndicator />}
                        </View>
                        <View style={styles.searchBarContainer}>
                            {/* @ts-ignore */}
                            <SearchBar
                                platform={'ios'}
                                placeholder={t.labels.PBNA_MOBILE_SEARCH_CUSTOMERS}
                                allowFontScaling={false}
                                showCancel
                                cancelButtonProps={{ style: { width: 0 } }}
                                cancelButtonTitle={''}
                                value={searchText}
                                containerStyle={styles.searchBarInnerContainer}
                                inputContainerStyle={styles.searchBarInputContainer}
                                inputStyle={styles.searchInputContainer}
                                // @ts-ignore
                                onChangeText={(v) => {
                                    setSearchText(v)
                                }}
                                onBlur={() => {
                                    Instrumentation.reportMetric(`${CommonParam.PERSONA__c} searches customer`, 1)
                                }}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.shoeSelectBtn,
                                    {
                                        backgroundColor:
                                            query || selectorObj.selectedSort || myCustomerQuery ? '#00A2D9' : '#FFFFFF'
                                    }
                                ]}
                                onPress={() => {
                                    if (CommonParam.PERSONA__c === Persona.PSR) {
                                        showSelector(true)
                                    } else {
                                        filterRef.current?.open()
                                    }
                                }}
                            >
                                <Image
                                    source={
                                        query || selectorObj.selectedSort || myCustomerQuery
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
                {isShowSelector && (
                    <CustomerListSelector
                        cRef={selectorRef}
                        channelList={channelList}
                        onBack={() => {
                            showSelector(false)
                        }}
                        selectorObj={selectorObj}
                        setSelectorObj={setSelectorObj}
                        setQuery={(item: string) => {
                            setQuery(item)
                        }}
                    />
                )}
            </View>
            <CustomerFilterSortForm cRef={filterRef} customerQuery={setMyCustomerQuery} geolocation={geolocation} />
        </View>
    )
}

export default CustomerListScreen

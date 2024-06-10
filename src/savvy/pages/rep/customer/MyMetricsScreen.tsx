/**
 * @description Screen to show All Innovation Product.
 * @author Qiulin Deng
 * @date 2021-11-27
 */
import React, { useState, useEffect, useRef } from 'react'
import {
    Image,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    View,
    SafeAreaView,
    ActivityIndicator,
    Switch
} from 'react-native'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import CCheckBox from '../../../../common/components/CCheckBox'
import CollapseContainer from '../../../components/common/CollapseContainer'
import CText from '../../../../common/components/CText'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { SearchBar } from 'react-native-elements'
import _, { upperCase } from 'lodash'
import { useIsFocused } from '@react-navigation/native'
import { checkPresetCustomerStatus } from '../../../utils/InnovationProductUtils'
import EmptyListPlaceholder from '../../../components/common/EmptyListPlaceholder'
import { useInnovationDistributionItem, useAuthMap, useQuickPreset } from '../../../hooks/InnovationProductHooks'
import { useRepPullDownRefresh } from '../../../hooks/RefreshHooks'
import { useDispatch } from 'react-redux'
import { t } from '../../../../common/i18n/t'
import MetricsSKUDetail from '../../../components/rep/customer/metrics/MetricsSKUDetail'
import moment from 'moment'
import PickerTile from '../../../components/rep/lead/common/PickerTile'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { useSuccessModalText, useGetMetricsData, useGetMetricsSKUItem } from '../../../hooks/InnovationMetricsHooks'
import { useDebounce } from '../../../hooks/CommonHooks'
import { CommonParam } from '../../../../common/CommonParam'
import { SuccessModal } from '../atc/CustomerCarouselDetailScreen'
import { isPersonaUGMOrSDL } from '../../../../common/enums/Persona'

interface MyMetricsScreenProps {
    navigation: any
    route: any
}
interface TileBottomButtonsProps {
    item: any
    authStateMap: any
    onPressAuth: Function
    onPressUnAuth: Function
    onPressATC: Function
}

const styles = StyleSheet.create({
    header: {
        position: 'relative',
        ...commonStyle.alignCenter,
        marginBottom: 22
    },
    sectionLabel: {
        fontSize: baseStyle.fontSize.fs_12,
        color: '#565656'
    },
    title: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    tgtTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400
    },
    tgtValue: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    btnBack: {
        position: 'absolute',
        left: 22
    },
    imgBack: {
        width: 12,
        height: 20
    },
    line: {
        height: 1,
        backgroundColor: '#D3D3D3',
        marginHorizontal: '5%'
    },
    innovationTitle: {
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900,
        color: baseStyle.color.black
    },
    alignContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    innovationTitleContainer: {
        marginTop: 22,
        marginBottom: 30,
        height: 29
    },
    tgtContainer: {
        height: 40,
        justifyContent: 'space-between'
    },
    flexRow: {
        flexDirection: 'row'
    },
    tgtTitleMargin: {
        marginBottom: 4
    },
    flexColumn: {
        flexDirection: 'column'
    },
    searchBarContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        marginTop: 30,
        width: '100%',
        justifyContent: 'space-between',
        paddingHorizontal: '5%'
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
    sectionContainer: {
        // minHight: 100,
        justifyContent: 'space-between',
        alignContent: 'center'
    },
    chevronStyle: {
        width: 18,
        height: 13,
        marginRight: 5
    },
    NoResultTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 40,
        marginBottom: 10
    },
    NoResultContent: {
        fontSize: 14,
        color: '#565656',
        lineHeight: 20,
        textAlign: 'center'
    },
    viewLabel: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.LightBlue,
        textAlign: 'center'
    },
    devider: {
        height: 15,
        width: 1,
        backgroundColor: '#D3D3D3'
    },
    newFlag: {
        borderBottomEndRadius: 21,
        borderColor: '#2DD36F',
        borderWidth: 2,
        minWidth: 45,
        height: 22,
        position: 'absolute',
        top: -1,
        paddingHorizontal: 5
    },
    checkBoxContainer: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    placeholderColor: {
        color: '#565656'
    },
    quickFilterContainer: {
        paddingHorizontal: '5%',
        alignItems: 'center',
        borderBottomColor: '#F2F4F7',
        borderBottomWidth: 2,
        flexDirection: 'row',
        marginTop: 10
    },
    switchSize: {
        transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]
    },
    newFlagText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2DD36F',
        textTransform: 'uppercase'
    },
    fullWidth: {
        width: '100%',
        marginTop: 20
    },
    width60: {
        width: '60%'
    },
    skuEmptyCon: {
        backgroundColor: '#F2F4F7',
        height: '100%',
        width: '100%',
        paddingBottom: '10%'
    },
    emptyImg: {
        width: 180,
        height: 120
    },
    emptyImg200: {
        width: 200,
        height: 200
    },
    emptyTextCon: {
        alignItems: 'center'
    },
    listCon: {
        flexGrow: 1
    },
    baCon: {
        flex: 1,
        backgroundColor: '#FFF'
    },
    showOnlyText: {
        fontSize: 12,
        fontWeight: '400',
        marginBottom: 10,
        paddingLeft: '5%'
    },
    checkBoxBase: {
        width: 48,
        height: 10,
        borderRadius: 5
    },
    boxTitleDD: {
        backgroundColor: '#2DD36F'
    },
    checkBoxCon: {
        backgroundColor: 'transparent',
        marginLeft: 0
    },
    boxTitleFF: {
        backgroundColor: '#FFC409'
    },
    boxTitleEB: {
        backgroundColor: '#EB445A'
    },
    lastBoxTitle: {
        fontSize: 12,
        fontWeight: '400',
        color: 'black'
    },
    width23: {
        width: '23%'
    },
    baseFlexStyle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    width39: {
        maxWidth: '70%'
    },
    pickCon: {
        flex: 1,
        alignItems: 'flex-end',
        marginBottom: -5,
        paddingTop: 5
    },
    width90: {
        width: '90%'
    },
    skuHeight: {
        height: '60%'
    },
    bottomBtnCon: {
        marginBottom: 20,
        height: 34,
        justifyContent: 'space-between',
        width: '100%'
    },
    unAuthCon: {
        width: '60%',
        alignItems: 'flex-start'
    },
    authStateCont: {
        flex: 1,
        marginBottom: 30,
        flexDirection: 'row'
    },
    flexStart: {
        alignItems: 'flex-start'
    },
    flex1_5: {
        flex: 1.5,
        paddingHorizontal: 5
    },
    pickerContainer: {
        paddingTop: 0,
        alignItems: 'center'
    }
})
const initShowItemLst = (itemLst) => {
    const showItemLst = []
    itemLst.forEach(() => {
        showItemLst.push(false)
    })
    return showItemLst
}

const initAuthMap = (itemLst, wiredCount) => {
    const authMap = new Map()
    itemLst.forEach((v) => {
        authMap.set(v.Id, Number(v.authCount) === Number(wiredCount))
    })
    return authMap
}

const checkRouteType = (routeInfo: any) => {
    if (Number(routeInfo.DistTgtP) === routeInfo.LFValue) {
        return [75, 89]
    }
    return [65, 74]
}

const TileBottomButtons = (props: TileBottomButtonsProps) => {
    const { item, onPressAuth, onPressUnAuth, authStateMap, onPressATC } = props
    const renderUnAuth = (item: any) => {
        if (!authStateMap.get(item.Id)) {
            return (
                <TouchableOpacity
                    style={styles.flex1_5}
                    onPress={() => {
                        onPressUnAuth && onPressUnAuth(item)
                    }}
                >
                    <CText style={styles.viewLabel} numberOfLines={2} ellipsizeMode={'tail'}>
                        {upperCase(t.labels.PBNA_MOBILE_METRICS_VIEW_UNAUTH)}
                    </CText>
                </TouchableOpacity>
            )
        }
        return <View />
    }
    if (!CommonParam.isATC) {
        return (
            <View style={[styles.flexRow, styles.bottomBtnCon]}>
                <View style={styles.unAuthCon}>{renderUnAuth(item.item)}</View>
                <TouchableOpacity
                    style={commonStyle.alignItemsEnd}
                    onPress={() => {
                        onPressAuth && onPressAuth(item)
                    }}
                >
                    <CText style={styles.viewLabel} numberOfLines={2} ellipsizeMode={'tail'}>
                        {upperCase(t.labels.PBNA_MOBILE_METRICS_VIEW_DETAILS)}
                    </CText>
                </TouchableOpacity>
            </View>
        )
    } else if (!authStateMap.get(item.item.Id)) {
        return (
            <View style={styles.authStateCont}>
                <TouchableOpacity
                    style={[commonStyle.flex_1, styles.flexStart]}
                    onPress={() => {
                        onPressAuth && onPressAuth(item)
                    }}
                >
                    <CText style={styles.viewLabel} numberOfLines={2} ellipsizeMode={'tail'}>
                        {upperCase(t.labels.PBNA_MOBILE_METRICS_VIEW_DETAILS)}
                    </CText>
                </TouchableOpacity>
                <View style={styles.devider} />
                {renderUnAuth(item.item)}
                <View style={styles.devider} />
                <TouchableOpacity
                    style={[commonStyle.flex_1, commonStyle.alignItemsEnd]}
                    onPress={() => {
                        onPressATC && onPressATC(item)
                    }}
                >
                    <CText style={styles.viewLabel} numberOfLines={2} ellipsizeMode={'tail'}>
                        {upperCase(t.labels.PBNA_MOBILE_ATC_ADD_TO_CART)}
                    </CText>
                </TouchableOpacity>
            </View>
        )
    }
    return (
        <View style={[styles.flexRow, styles.bottomBtnCon]}>
            <TouchableOpacity
                onPress={() => {
                    onPressAuth && onPressAuth(item)
                }}
            >
                <CText style={styles.viewLabel} numberOfLines={2} ellipsizeMode={'tail'}>
                    {upperCase(t.labels.PBNA_MOBILE_METRICS_VIEW_DETAILS)}
                </CText>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => {
                    onPressATC && onPressATC(item)
                }}
            >
                <CText style={styles.viewLabel} numberOfLines={2} ellipsizeMode={'tail'}>
                    {upperCase(t.labels.PBNA_MOBILE_ATC_ADD_TO_CART)}
                </CText>
            </TouchableOpacity>
        </View>
    )
}
const MyMetricsScreen = (props: MyMetricsScreenProps) => {
    const { navigation, route } = props
    const mPresetRef = useRef(null)
    const dispatch = useDispatch()
    const isFocused = useIsFocused()
    const pickPreset = route?.params ? route.params.selectedPreset : ''
    const filterSelected = route?.params ? route.params.filterSelected : [0, 0, false]
    const selectedKAsValue = route?.params ? route.params.selectedKAsValue : []
    const [selectedKAsEmit, setSelectedKAsEmit] = useState(route?.params ? route.params.selectedKAsValue : [])
    const [selectedCustomersValue, setSelectedCustomersValue] = useState([])
    const [selectedOTS, setSelectedOTS] = useState(false)
    const selectedBusnSegment = route?.params ? route.params.selectedBusnSegment : []
    const [isRecalculate, setIsRecalculate] = useState(false)
    const [searchChange, setSearchChange] = useState('')
    const [searchText, setSearchText] = useState('')
    const [quickFilter, setQuickFilter] = useState({
        check1: false,
        check2: false,
        check3: false,
        check4: false
    })
    const [sort, setSort] = useState('')
    const [filterQuery, setFilterQuery] = useState('')
    const [mSelectedPreset, setMSelectedPreset] = useState('')
    const [showAuth, setIsShowAuth] = useState(false)
    const [isShowDetail, setIsShowDetail] = useState(false)
    const [checkQuickFilter, setCheckQuickFilter] = useState(false)
    const [pickCount, setPickCount] = useState(0)
    const [isUnavailable, setIsUnavailable] = useState(0)
    const { isLoading, setIsLoading } = useRepPullDownRefresh('MetricsInnovationProduct', dispatch, false)
    const { innovDisItem, assessToken, wiredDistTgt, GTINsMap } = useInnovationDistributionItem(
        searchText,
        sort,
        isLoading,
        filterQuery,
        setIsRecalculate
    )
    const routeColorType = checkRouteType(wiredDistTgt)
    const { presetNameLst, presetMap } = useQuickPreset(sort, filterQuery, isLoading, isFocused, pickCount)
    const authStateMap = initAuthMap(useAuthMap(), wiredDistTgt.wiredCount)
    const { storeProducts, orderItems, rsOrderDays } = useGetMetricsData(
        filterQuery,
        searchText,
        sort,
        isLoading,
        isShowDetail
    )
    const [successModalText, setSuccessModalText] = useState('')
    useSuccessModalText(props, isFocused, setSuccessModalText)

    useEffect(() => {
        if (route?.params) {
            setSelectedCustomersValue(route.params.selectedCustomersValue)
            setSelectedOTS(route.params.selectedOTS)
        }
    }, [route.params])
    const getWiredCount = () => {
        if (selectedCustomersValue.length > 0) {
            return Number(selectedCustomersValue.length)
        }
        return wiredDistTgt.wiredCount
    }
    const [isAuthEnabled, setIsAuthEnabled] = useState(false)
    const toggleSwitch = () => {
        setIsAuthEnabled((previousState) => !previousState)
    }
    const { skuItems, quickFilterLst } = useGetMetricsSKUItem(
        storeProducts,
        orderItems,
        rsOrderDays,
        sort,
        getWiredCount(),
        quickFilter,
        routeColorType,
        innovDisItem,
        filterQuery,
        isAuthEnabled
    )
    const [detailItem, setDetailItem] = useState(skuItems[0])
    const [showItem, setShowItem] = useState(initShowItemLst(skuItems))
    const [defaultTabData, setDefaultTabData] = useState({})

    const getNumberWithFixed = (firstP: any, secondP: any) => {
        const numRes = (Number(firstP) / Number(secondP)) * 100
        return Math.ceil(Number(numRes.toFixed(4)))
    }

    useEffect(() => {
        if (quickFilter.check1 || quickFilter.check2 || quickFilter.check3 || quickFilter.check4) {
            setDetailItem(quickFilterLst[0])
            setShowItem(initShowItemLst(quickFilterLst))
            setCheckQuickFilter(true)
        } else {
            setCheckQuickFilter(false)
        }
    }, [quickFilter])

    useEffect(() => {
        setQuickFilter({
            check1: false,
            check2: false,
            check3: false,
            check4: false
        })
        setIsAuthEnabled(false)
    }, [sort, filterQuery, isLoading, selectedKAsEmit])

    const checkSortOrFilter = () => {
        return filterQuery || sort || selectedOTS
    }

    const isAvailable = (item: any) => {
        if (item.item.Product_Availability__c > 0) {
            return '#FFFFFF'
        }
        return '#F2F4F7'
    }

    useEffect(() => {
        return () => {
            Instrumentation.stopTimer('PSR Time Spent On My Metrics Page')
        }
    }, [])

    useEffect(() => {
        mPresetRef.current.reset()
    }, [isFocused])

    const caseColor = (item: any) => {
        if (item.item.volSum < 0) {
            return { color: 'red' }
        }
    }

    const renderNewFlag = (item: any) => {
        if (!_.isEmpty(item.item.National_Launch_Date)) {
            const launchDate = item.item.National_Launch_Date
            const weekAfterLaunchDate = moment(launchDate).add(8, 'days').format('YYYY-MM-DD')
            if (moment().isAfter(launchDate) && moment().isBefore(weekAfterLaunchDate)) {
                return (
                    <View style={styles.newFlag}>
                        <CText style={styles.newFlagText}>{t.labels.PBNA_MOBILE_IP_NEW}</CText>
                    </View>
                )
            }
        }
    }

    const renderDistLCW = (item) => {
        let result
        if (mSelectedPreset && filterQuery) {
            if (
                presetMap[mSelectedPreset] &&
                JSON.parse(presetMap[mSelectedPreset].FilterJSON).selectedCustomersValue.length > 0
            ) {
                result = Math.ceil(
                    (Number(item.item.LCWCount) /
                        Number(JSON.parse(presetMap[mSelectedPreset].FilterJSON).selectedCustomersValue.length)) *
                        100
                )
            } else {
                result = Math.ceil((Number(item.item.LCWCount) / Number(wiredDistTgt.wiredCount)) * 100)
            }
        } else if (selectedCustomersValue.length > 0) {
            result = Math.ceil((Number(item.item.LCWCount) / Number(selectedCustomersValue.length)) * 100)
        } else {
            result = Math.ceil((Number(item.item.LCWCount) / Number(wiredDistTgt.wiredCount)) * 100)
        }
        if (isAuthEnabled) {
            result = Math.ceil((Number(item.item.LCWCount) / Number(item.item.authCount)) * 100)
        }
        if (result > 100) {
            return <ActivityIndicator />
        }
        return <CText style={[styles.title]}>{`${result}%`}</CText>
    }
    const renderAuthPresent = (item) => {
        let result
        if (mSelectedPreset && filterQuery) {
            if (
                presetMap[mSelectedPreset] &&
                JSON.parse(presetMap[mSelectedPreset].FilterJSON).selectedCustomersValue.length > 0
            ) {
                result = Math.ceil(
                    (Number(item.item.authCount) /
                        Number(JSON.parse(presetMap[mSelectedPreset].FilterJSON).selectedCustomersValue.length)) *
                        100
                )
            } else {
                result = Math.ceil((Number(item.item.authCount) / Number(wiredDistTgt.wiredCount)) * 100)
            }
        } else if (selectedCustomersValue.length > 0) {
            result = Math.ceil((Number(item.item.authCount) / Number(selectedCustomersValue.length)) * 100)
        } else {
            result = getNumberWithFixed(item.item.authCount, wiredDistTgt.wiredCount)
        }
        if (isAuthEnabled) {
            result = 100
        }
        if (result > 100) {
            return <ActivityIndicator />
        }
        return <CText style={[styles.title]}>{`${result}%`}</CText>
    }

    const getCustomerLst = () => {
        if (filterQuery) {
            if (mSelectedPreset && presetMap[mSelectedPreset]) {
                return JSON.parse(presetMap[mSelectedPreset].FilterJSON).selectedCustomersValue
            }
            return selectedCustomersValue
        }
        return []
    }

    const renderItem = (item: any) => {
        // disable reason: Keep object variable naming considering with too many fields.
        // eslint-disable-next-line react/prop-types
        item.accessToken = assessToken
        // disable reason: Keep object variable naming considering with too many fields.
        // eslint-disable-next-line react/prop-types
        item.distTgt = Math.ceil(wiredDistTgt.DistTgtP)
        // disable reason: Keep object variable naming considering with too many fields.
        // eslint-disable-next-line react/prop-types
        item.distData = wiredDistTgt
        // disable reason: Keep object variable naming considering with too many fields.
        // @ts-ignore
        // eslint-disable-next-line react/prop-types
        item.ImageUrl = GTINsMap ? GTINsMap[item.item.GTIN] : ''
        // disable reason: Keep object variable naming considering with too many fields.
        // eslint-disable-next-line react/prop-types
        item.selectedCustomersValue = getCustomerLst()
        return (
            <View
                style={{
                    backgroundColor: isAvailable(item),
                    paddingHorizontal: '5%',
                    borderBottomWidth: 2,
                    borderColor: '#F2F4F7'
                }}
            >
                <CollapseContainer
                    // disable reason: Keep object variable naming considering with too many fields.
                    // eslint-disable-next-line react/prop-types
                    showContent={showItem[item.index]}
                    setShowContent={setShowItem}
                    // disable reason: Keep object variable naming considering with too many fields.
                    // eslint-disable-next-line react/prop-types
                    title={item.item.ProductCode || item.item.Id}
                    containerStyle={[styles.sectionContainer, styles.flexRow]}
                    noTopLine
                    noBottomLine
                    isMetrics
                    metricsData={item}
                    isAuthEnabled={isAuthEnabled}
                    metricsSet={showItem}
                >
                    <View style={styles.fullWidth}>
                        <View
                            style={[styles.flexRow, { marginBottom: 30, height: 34, justifyContent: 'space-between' }]}
                        >
                            <View style={[styles.flexColumn, { width: '30%' }]}>
                                <CText style={[styles.tgtTitle, { color: '#565656' }, styles.tgtTitleMargin]}>
                                    Dist % - LCW
                                </CText>
                                {renderDistLCW(item)}
                            </View>
                            <View style={[styles.flexColumn, { width: '30%' }]}>
                                <CText style={[styles.tgtTitle, { color: '#565656' }, styles.tgtTitleMargin]}>
                                    {t.labels.PBNA_MOBILE_METRICS_VOID_GAP}
                                </CText>
                                {/* disable reason: Keep object variable naming considering with too many fields.  */}
                                {/* eslint-disable-next-line react/prop-types */}
                                <CText style={[styles.title]}>{Number(item.item.voidGapCount)}</CText>
                            </View>
                            <View style={[styles.flexColumn, { width: '30%' }]}>
                                <CText style={[styles.tgtTitle, { color: '#565656' }, styles.tgtTitleMargin]}>
                                    {t.labels.PBNA_MOBILE_METRICS_11WKS_0CS}
                                </CText>
                                {/* disable reason: Keep object variable naming considering with too many fields.  */}
                                {/* eslint-disable-next-line react/prop-types */}
                                <CText style={[styles.title]}>{Number(item.item.wkcCsCount)}</CText>
                            </View>
                        </View>
                        <View
                            style={[styles.flexRow, { marginBottom: 30, height: 34, justifyContent: 'space-between' }]}
                        >
                            <View style={[styles.flexColumn, { width: '30%' }]}>
                                <CText style={[styles.tgtTitle, { color: '#565656' }, styles.tgtTitleMargin]}>
                                    {t.labels.PBNA_MOBILE_METRICS_VOL}
                                </CText>
                                <CText style={[styles.title, caseColor(item)]}>
                                    {/* disable reason: Keep object variable naming considering with too many fields.  */}
                                    {/* eslint-disable-next-line react/prop-types */}
                                    {parseInt(item.item.volSum).toLocaleString('en-US') + ' cs'}
                                </CText>
                            </View>
                            <View style={[styles.flexColumn, { width: '30%' }]}>
                                <CText style={[styles.tgtTitle, { color: '#565656' }, styles.tgtTitleMargin]}>
                                    {t.labels.PBNA_MOBILE_METRICS_CLOSED_WTD}
                                </CText>
                                {/* disable reason: Keep object variable naming considering with too many fields.  */}
                                {/* eslint-disable-next-line react/prop-types */}
                                <CText style={[styles.title]}>{Number(item.item.cWTDCount)}</CText>
                            </View>
                            <View style={[styles.flexColumn, { width: '30%' }]}>
                                <CText style={[styles.tgtTitle, { color: '#565656' }, styles.tgtTitleMargin]}>
                                    {t.labels.PBNA_MOBILE_ORDER_DAY_VOIDS}
                                </CText>
                                {/* disable reason: Keep object variable naming considering with too many fields.  */}
                                {/* eslint-disable-next-line react/prop-types */}
                                <CText style={[styles.title]}>{Number(item.item.orderDayCount)}</CText>
                            </View>
                        </View>
                        <View
                            style={[styles.flexRow, { marginBottom: 30, height: 34, justifyContent: 'space-between' }]}
                        >
                            <View style={[styles.flexColumn, { width: '30%' }]}>
                                <CText style={[styles.tgtTitle, { color: '#565656' }, styles.tgtTitleMargin]}>
                                    {t.labels.PBNA_MOBILE_METRICS_PERCENT_AUTH}
                                </CText>
                                {renderAuthPresent(item)}
                            </View>
                            <View style={[styles.flexColumn, { width: '30%' }]}>
                                <CText style={[styles.tgtTitle, { color: '#565656' }, styles.tgtTitleMargin]}>
                                    {t.labels.PBNA_MOBILE_IP_ORDERED}
                                </CText>
                                {/* disable reason: Keep object variable naming considering with too many fields.  */}
                                {/* eslint-disable-next-line react/prop-types */}
                                <CText style={[styles.title]}>{Number(item.item.orderOpenCount)}</CText>
                            </View>
                            <View style={[styles.flexColumn, { width: '30%' }]}>
                                <CText style={[styles.tgtTitle, { color: '#565656' }, styles.tgtTitleMargin]}>
                                    {t.labels.PBNA_MOBILE_METRICS_ORDERED_TODAY}
                                </CText>
                                {/* disable reason: Keep object variable naming considering with too many fields.  */}
                                {/* eslint-disable-next-line react/prop-types */}
                                <CText style={[styles.title]}>{Number(item.item.orderTodayCount)}</CText>
                            </View>
                        </View>
                        <TileBottomButtons
                            item={item}
                            authStateMap={authStateMap}
                            onPressAuth={(currentI: any) => {
                                setIsShowAuth(false)
                                setIsShowDetail(true)
                                Instrumentation.reportMetric('PSR Clicks View Detail In My Metrics IP List', 1)
                                setDetailItem(currentI.item)
                                setIsUnavailable(currentI.item.Product_Availability__c > 0 ? 0 : 1)
                            }}
                            onPressUnAuth={(currentI: any) => {
                                setIsShowAuth(true)
                                setIsShowDetail(true)
                                setDetailItem(currentI)
                                setIsUnavailable(currentI.Product_Availability__c > 0 ? 0 : 1)
                            }}
                            onPressATC={(currentI: any) => {
                                navigation.navigate('AddToCartView', {
                                    qtyImageCode: GTINsMap ? GTINsMap[currentI.item.GTIN] : '',
                                    skuItem: currentI.item
                                })
                            }}
                        />
                    </View>
                </CollapseContainer>
                {renderNewFlag(item)}
            </View>
        )
    }

    const getDisplayData = () => {
        if (selectedOTS && filterQuery === '') {
            return []
        } else if (!checkQuickFilter && filterQuery === '' && sort === '') {
            return innovDisItem
        } else if ((filterQuery !== '' || sort !== '') && !checkQuickFilter) {
            return skuItems
        }
        return quickFilterLst
    }

    const checkData = () => {
        const displayData = getDisplayData()
        if (displayData) {
            if (displayData.length === 0) {
                return true
            }
        }
        return false
    }

    const renderSKUItem = () => {
        if (
            !isLoading &&
            !isRecalculate &&
            checkData() &&
            (searchText !== '' || checkSortOrFilter() || checkQuickFilter)
        ) {
            return (
                <View style={styles.skuEmptyCon}>
                    <EmptyListPlaceholder
                        image={
                            <Image
                                source={ImageSrc.IMG_NOFILTER_PRODUCT}
                                style={styles.emptyImg}
                                resizeMode={'contain'}
                            />
                        }
                        title={
                            <View style={[styles.width90, commonStyle.alignItemsCenter]}>
                                <CText style={styles.NoResultTitle}>{t.labels.PBNA_MOBILE_METRICS_NO_RESULTS}</CText>
                                <CText style={styles.NoResultContent}>
                                    {`${t.labels.PBNA_MOBILE_METRICS_NO_Products_1} ` +
                                        `${t.labels.PBNA_MOBILE_METRICS_NO_CUSTOMER_2} ` +
                                        `${t.labels.PBNA_MOBILE_METRICS_NO_CUSTOMER_3}`}
                                </CText>
                            </View>
                        }
                        transparentBackground
                    />
                </View>
            )
        } else if (checkData() && searchText === '' && !checkSortOrFilter() && !checkQuickFilter) {
            const noItemText = `${t.labels.PBNA_MOBILE_METRICS_NO_INNOVATION_1} 
                        `
            return (
                <View style={styles.skuEmptyCon}>
                    <EmptyListPlaceholder
                        image={
                            <Image
                                source={ImageSrc.IMG_NO_ITEM_RESULT}
                                style={styles.emptyImg200}
                                resizeMode={'contain'}
                            />
                        }
                        title={
                            <View style={styles.emptyTextCon}>
                                <CText style={styles.NoResultTitle}>{t.labels.PBNA_MOBILE_METRICS_NO_ITEM}</CText>
                                <CText style={[styles.NoResultContent]}>{noItemText}</CText>
                            </View>
                        }
                        transparentBackground
                    />
                </View>
            )
        }
        return (
            <FlatList
                contentContainerStyle={styles.listCon}
                data={getDisplayData()}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                initialNumToRender={7}
                // disable reason: Keep object variable naming considering with too many fields.
                // eslint-disable-next-line react/prop-types
                keyExtractor={(item) => item.ProductCode || item.Id}
                onEndReachedThreshold={0.9}
                refreshControl={
                    <RefreshControl
                        title={t.labels.PBNA_MOBILE_LOADING}
                        tintColor={'#00A2D9'}
                        titleColor={'#00A2D9'}
                        refreshing={isRecalculate}
                        onRefresh={() => {
                            setIsLoading(true)
                            setIsRecalculate(true)
                        }}
                        progressViewOffset={6}
                    />
                }
            />
        )
    }

    useDebounce(() => setSearchText(searchChange), 300, [searchChange])
    const showDetailScreen = (tabData: any) => {
        setIsShowDetail(true)
        setDefaultTabData(tabData)
        setIsShowAuth(tabData?.showUnAuth)
    }

    return (
        <View style={styles.baCon}>
            <SafeAreaView>
                <View style={styles.header}>
                    <CText style={styles.title}>{upperCase(t.labels.PBNA_MOBILE_METRICS_MY_METRICS)}</CText>
                    <TouchableOpacity
                        style={styles.btnBack}
                        hitSlop={commonStyle.hitSlop}
                        onPress={async () => {
                            navigation.goBack()
                        }}
                    >
                        <Image source={ImageSrc.IMG_BACK} style={styles.imgBack} />
                    </TouchableOpacity>
                </View>
                <View style={styles.line} />
                <View>
                    <View style={[styles.alignContainer, styles.innovationTitleContainer]}>
                        <CText style={styles.innovationTitle}>{t.labels.PBNA_MOBILE_METRICS_INNOV_PRODUCTS}</CText>
                    </View>
                    <View style={[styles.tgtContainer, styles.flexRow, { paddingHorizontal: '5%' }]}>
                        <View style={[styles.flexColumn]}>
                            <CText style={[styles.tgtTitleMargin, styles.tgtTitle]}>
                                {isPersonaUGMOrSDL()
                                    ? t.labels.PBNA_MOBILE_VOIDS
                                    : t.labels.PBNA_MOBILE_METRICS_MY_CUST}
                            </CText>
                            <CText style={styles.tgtValue}>{wiredDistTgt.wiredCount}</CText>
                        </View>
                        <View style={[styles.flexColumn]}>
                            <CText style={[styles.tgtTitleMargin, styles.tgtTitle]}>
                                {isPersonaUGMOrSDL()
                                    ? t.labels.PBNA_MOBILE_ORDER_DAY_VOIDS
                                    : t.labels.PBNA_MOBILE_METRICS_TGT_CUST}
                            </CText>
                            <CText style={[styles.tgtValue, { textAlign: 'center' }]}>
                                {Math.ceil((wiredDistTgt.wiredCount * wiredDistTgt.DistTgtP) / 100)}
                            </CText>
                        </View>
                        <View style={[styles.flexColumn]}>
                            <CText style={[styles.tgtTitleMargin, styles.tgtTitle]}>
                                {isPersonaUGMOrSDL()
                                    ? t.labels.PBNA_MOBILE_METRICS_CLOSED_WTD
                                    : t.labels.PBNA_MOBILE_METRICS_DIST_TGT}
                            </CText>
                            <CText
                                style={[
                                    styles.tgtValue,
                                    isPersonaUGMOrSDL() ? commonStyle.textAlignCenter : commonStyle.textAlignRight
                                ]}
                            >
                                {isPersonaUGMOrSDL() ? '0' : `${Math.ceil(wiredDistTgt.DistTgtP)}%`}
                            </CText>
                        </View>
                        {isPersonaUGMOrSDL() && (
                            <View style={[styles.flexColumn]}>
                                <CText style={[styles.tgtTitleMargin, styles.tgtTitle]}>
                                    {t.labels.PBNA_MOBILE_METRICS_DIST_PERCENT}
                                </CText>
                                <CText style={[styles.tgtValue, { textAlign: 'right' }]}>
                                    {`${Math.ceil(wiredDistTgt.DistTgtP)}%`}
                                </CText>
                            </View>
                        )}
                    </View>
                    <View style={styles.searchBarContainer}>
                        {/* @ts-ignore */}
                        <SearchBar
                            platform={'ios'}
                            placeholder={t.labels.PBNA_MOBILE_METRICS_SEARCH_PRODUCTS}
                            allowFontScaling={false}
                            clearIcon={null}
                            cancelButtonTitle={t.labels.PBNA_MOBILE_CLEAR}
                            containerStyle={styles.searchBarInnerContainer}
                            inputContainerStyle={styles.searchBarInputContainer}
                            value={searchChange}
                            inputStyle={styles.searchInputContainer}
                            onChangeText={(v) => setSearchChange(v)}
                            returnKeyType={'search'}
                        />
                        <TouchableOpacity
                            style={{
                                marginLeft: 5,
                                backgroundColor: checkSortOrFilter() ? '#00A2D9' : '#FFFFFF',
                                borderRadius: 5
                            }}
                            onPress={() => {
                                if (mSelectedPreset) {
                                    const presetObj = JSON.parse(presetMap[mSelectedPreset].FilterJSON)
                                    navigation.navigate('InnovaProdFilterSortForm', {
                                        selectedSortValue: presetObj.sortSelected,
                                        filterValue: presetObj.filterSelected,
                                        selectedKAsValue: presetObj.selectedKAsValue,
                                        selectedCustomersValue: presetObj.selectedCustomersValue,
                                        selectedOTS: presetObj.selectedOTS,
                                        selectedBusnSegment: presetObj.selectedBusnSegment,
                                        mPickPreset: mSelectedPreset,
                                        mPickSoupEntryId: presetMap[mSelectedPreset]._soupEntryId,
                                        setSort: setSort,
                                        setFilterQuery: setFilterQuery,
                                        setMSelectedPreset: setMSelectedPreset,
                                        mPresetRef: mPresetRef,
                                        setSelectedKAsEmit: setSelectedKAsEmit
                                    })
                                } else if (!mSelectedPreset && !filterQuery && !sort) {
                                    navigation.navigate('InnovaProdFilterSortForm', {
                                        selectedSortValue: '',
                                        filterValue: [0, 0, false],
                                        selectedKAsValue: [],
                                        selectedCustomersValue: [],
                                        selectedOTS: selectedOTS,
                                        selectedBusnSegment: [],
                                        mPickPreset: '',
                                        mPickSoupEntryId: '',
                                        setSort: setSort,
                                        setFilterQuery: setFilterQuery,
                                        setMSelectedPreset: setMSelectedPreset,
                                        mPresetRef: mPresetRef,
                                        setSelectedKAsEmit: setSelectedKAsEmit
                                    })
                                } else {
                                    navigation.navigate('InnovaProdFilterSortForm', {
                                        selectedSortValue: sort,
                                        filterValue: filterSelected,
                                        selectedKAsValue: selectedKAsValue,
                                        selectedCustomersValue: selectedCustomersValue,
                                        selectedOTS: selectedOTS,
                                        selectedBusnSegment: selectedBusnSegment,
                                        mPickPreset: pickPreset,
                                        mPickSoupEntryId: '',
                                        setSort: setSort,
                                        setFilterQuery: setFilterQuery,
                                        setMSelectedPreset: setMSelectedPreset,
                                        mPresetRef: mPresetRef,
                                        setSelectedKAsEmit: setSelectedKAsEmit
                                    })
                                }
                            }}
                        >
                            <Image
                                source={
                                    checkSortOrFilter()
                                        ? require('../../../../../assets/image/icon-sort-white.png')
                                        : require('../../../../../assets/image/icon-sort.png')
                                }
                                style={[styles.filterImage]}
                            />
                        </TouchableOpacity>
                    </View>
                    <CText style={styles.showOnlyText}>{t.labels.PBNA_MOBILE_METRICS_SHOW_ONLY}</CText>
                    <View
                        style={{
                            paddingHorizontal: '5%'
                        }}
                    >
                        <View style={styles.checkBoxContainer}>
                            <CCheckBox
                                onPress={() =>
                                    setQuickFilter({
                                        ...quickFilter,
                                        check1: !quickFilter.check1
                                    })
                                }
                                title={<View style={[styles.checkBoxBase, styles.boxTitleDD]} />}
                                checked={quickFilter.check1}
                                containerStyle={styles.checkBoxCon}
                            />
                            <CCheckBox
                                onPress={() =>
                                    setQuickFilter({
                                        ...quickFilter,
                                        check2: !quickFilter.check2
                                    })
                                }
                                title={<View style={[styles.checkBoxBase, styles.boxTitleFF]} />}
                                checked={quickFilter.check2}
                                containerStyle={styles.checkBoxCon}
                            />
                            <CCheckBox
                                onPress={() =>
                                    setQuickFilter({
                                        ...quickFilter,
                                        check3: !quickFilter.check3
                                    })
                                }
                                title={<View style={[styles.checkBoxBase, styles.boxTitleEB]} />}
                                checked={quickFilter.check3}
                                containerStyle={styles.checkBoxCon}
                            />
                            <CCheckBox
                                onPress={() =>
                                    setQuickFilter({
                                        ...quickFilter,
                                        check4: !quickFilter.check4
                                    })
                                }
                                title={
                                    <CText style={styles.lastBoxTitle}>{t.labels.PBNA_MOBILE_METRICS_11WKS_0CS}</CText>
                                }
                                checked={quickFilter.check4}
                                containerStyle={[styles.checkBoxCon, styles.width23]}
                            />
                        </View>
                    </View>
                    <View style={styles.quickFilterContainer}>
                        <View style={styles.baseFlexStyle}>
                            <View style={styles.width39}>
                                <CText style={styles.placeholderColor}>{t.labels.PBNA_MOBILE_METRICS_AUTH_ONLY}</CText>
                            </View>
                            <Switch
                                trackColor={{ true: '#2DD36F' }}
                                ios_backgroundColor={'#565656'}
                                onValueChange={toggleSwitch}
                                value={isAuthEnabled}
                                style={styles.switchSize}
                            />
                        </View>
                        <View style={styles.pickCon}>
                            <PickerTile
                                cRef={mPresetRef}
                                data={presetNameLst}
                                label={''}
                                disabled={false}
                                defValue={mSelectedPreset}
                                placeholder={t.labels.PBNA_MOBILE_METRICS_SELECT_MY_FILTER}
                                placeholderStyle={styles.placeholderColor}
                                noPaddingHorizontal
                                pickViewStyle={styles.pickerContainer}
                                onDone={async (v: any) => {
                                    setMSelectedPreset(v)
                                    setPickCount((prevPickCount) => prevPickCount + 1)
                                    if (v) {
                                        const upsertPresetCustomer = await checkPresetCustomerStatus(presetMap[v])
                                        const filterObj = JSON.parse(upsertPresetCustomer.FilterJSON)
                                        setFilterQuery(filterObj.filterQuery)
                                        setSelectedOTS(filterObj.selectedOTS)
                                        setSelectedCustomersValue(filterObj.selectedCustomersValue)
                                        setSort(filterObj.sortSelected)
                                    } else {
                                        setFilterQuery('')
                                        setSelectedCustomersValue([])
                                        setSort('')
                                        setMSelectedPreset('')
                                        setSelectedOTS(false)
                                    }
                                }}
                                required={false}
                                modalStyle={styles.width90}
                                borderStyle={{}}
                                title={t.labels.PBNA_MOBILE_METRICS_CUSTOM_FILTER}
                            />
                        </View>
                    </View>
                    <View style={styles.skuHeight}>{renderSKUItem()}</View>
                </View>
            </SafeAreaView>
            <SuccessModal successModalText={successModalText} />
            <MetricsSKUDetail
                showAuth={showAuth}
                filter={filterQuery}
                navigation={navigation}
                onBack={() => {
                    setDefaultTabData(null)
                    setIsShowDetail(false)
                    setIsShowAuth(false)
                }}
                accessToken={assessToken}
                authStateMap={authStateMap}
                item={detailItem}
                GTINsMap={GTINsMap}
                wiredCount={wiredDistTgt.wiredCount}
                isShow={isShowDetail}
                isUnavailable={isUnavailable}
                defaultTabData={defaultTabData}
                onShowDetailScreen={(tabData) => {
                    showDetailScreen(tabData)
                }}
            />
        </View>
    )
}

export default MyMetricsScreen

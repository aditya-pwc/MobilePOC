/**
 * @description Component to show Innovation Product Archive Detail Page.
 * @author Pawn
 * @date 2022-04-13
 * @Lase
 */

import React, { useState, useEffect, useRef, ReactElement, ReactNode } from 'react'
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    FlatList,
    SafeAreaView,
    ImageSourcePropType,
    ViewStyle
} from 'react-native'
import CText from '../../../../../common/components/CText'
import FastImage from 'react-native-fast-image'
import EmptyListPlaceholder from '../../../common/EmptyListPlaceholder'
import StorePlaceholderSvg from '../../../../../../assets/image/Icon-store-placeholder-small.svg'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { Dialog, SearchBar } from 'react-native-elements'
import { t } from '../../../../../common/i18n/t'
import moment from 'moment'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import CCheckBox from '../../../../../common/components/CCheckBox'
import {
    PriorityQuickFilterName,
    useFilteredPrioritiesData,
    useInnovationCarouselDetail,
    useSellingDataFromLocalHook
} from '../../../../hooks/InnovationProductHooks'
import { carouselDisplayedFilter, checkStoreProductOrder } from '../../../../helper/rep/InnovationProductHelper'
import AlertView, { AlertModalRef } from '../../../common/AlertView'
import AsyncStorage from '@react-native-async-storage/async-storage'
import SelectTab from '../../../common/SelectTab'
import { renderPerfectFlag, renderStartAndEndDate } from './InnovationProductTile'
import { CommonParam } from '../../../../../common/CommonParam'
import { CommonApi } from '../../../../../common/api/CommonApi'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { updateStorePriorityStatus } from '../../../../helper/rep/PriorityArchiveHelper'
import SuccessView, { SuccessViewRef } from '../../../common/SuccessView'
import { IntervalTime } from '../../../../enums/Contract'
import dayjs from 'dayjs'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { CommonActions, useIsFocused } from '@react-navigation/native'
import CommonTooltip from '../../../common/CommonTooltip'
import Loading from '../../../../../common/components/Loading'
import { isCelsiusPriority } from '../../../../utils/InnovationProductUtils'
import { useDispatch, useSelector } from 'react-redux'
import { selectRedirectAction, setRedirectAction } from '../../../../redux/Slice/CustomerDetailSlice'
import { ActiveTabName } from '../../../../pages/rep/customer/CustomerDetailScreen'
import { customDelay } from '../../../../utils/CommonUtils'
import CommonOnlineImage from './CommonOnlineImage'

interface InnovationProductArchiveDetailProps {
    navigation: any
    route: any
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    bgtContainer: {
        width: '100%',
        paddingHorizontal: '5%',
        marginTop: 25
    },
    imgBack: {
        width: 12,
        height: 20,
        marginTop: 10
    },
    iconStore: {
        height: 36,
        width: 36,
        marginRight: 20
    },
    line: {
        marginTop: 14,
        height: 1,
        backgroundColor: '#D3D3D3',
        marginHorizontal: '5%'
    },
    searchContainer: {
        marginTop: '5%',
        width: '100%',
        paddingHorizontal: '5%'
    },
    searchBarContainer: {
        flexDirection: 'row',
        marginBottom: 30,
        marginTop: 20,
        width: '100%',
        justifyContent: 'space-between',
        paddingHorizontal: '5%'
    },
    searchBarInnerContainer: {
        width: '100%',
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
    checkboxArea: {
        width: '100%',
        paddingHorizontal: '5%',
        flexDirection: 'row'
    },
    checkboxLayout: {
        width: '47%',
        flexDirection: 'column',
        marginTop: 15,
        marginRight: 10
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
        color: baseStyle.color.titleGray,
        textAlign: 'center'
    },
    snoozedContainer: {
        flexDirection: 'row'
    },
    noSaleContainer: {
        flexDirection: 'row'
    },
    deliveredContainer: {
        flexDirection: 'row'
    },
    ResultIcon: {
        width: 150,
        height: 193
    },
    checkboxLabel: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        textTransform: 'capitalize',
        fontFamily: 'Gotham'
    },
    countLabel: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400
    },
    countStyle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    checkboxAreaTitle: {
        paddingHorizontal: '5%',
        marginTop: '5%',
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.titleGray,
        fontWeight: baseStyle.fontWeight.fw_400,
        textTransform: 'capitalize'
    },
    delimiterStyle: {
        marginVertical: 1,
        borderLeftWidth: 1,
        borderColor: '#D3D3D3'
    },
    itemContainBtn: {
        marginTop: '4%',
        marginBottom: '1%',
        borderRadius: 6,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        shadowColor: '#004C97',
        shadowOffset: {
            width: 1,
            height: 1
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        flexDirection: 'row'
    },
    proImgView: {
        width: '30%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    brandCon: {
        width: '70%',
        justifyContent: 'center'
    },
    brandText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        textTransform: 'uppercase'
    },
    subBrandText: {
        fontSize: baseStyle.fontSize.fs_18,
        fontWeight: baseStyle.fontWeight.fw_900,
        marginTop: 8,
        marginBottom: 5,
        paddingRight: 10
    },
    lunchDate: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray,
        marginBottom: 5
    },
    snoozedCon: {
        flexDirection: 'row',
        height: 15
    },
    epmView: {
        flex: 1,
        paddingBottom: '10%'
    },
    empTextView: {
        alignItems: 'center',
        width: '120%'
    },
    listCon: {
        flexGrow: 1,
        paddingHorizontal: '5%',
        marginTop: 5,
        paddingBottom: 20
    },
    resultEmpView: {
        alignItems: 'center',
        width: 400
    },
    backView: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%'
    },
    backBtn: {
        height: '100%'
    },
    hitSlop: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    },
    marginLeft5: {
        marginLeft: '5%'
    },
    width75: {
        width: '75%'
    },
    storeName: {
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'capitalize'
    },
    achieveText: {
        fontSize: 24,
        fontWeight: '900',
        textTransform: 'capitalize',
        marginTop: '4%',
        paddingHorizontal: '5%'
    },
    checkBoxCon: {
        backgroundColor: 'transparent',
        marginLeft: 0
    },
    sumTitleView: {
        paddingHorizontal: '5%',
        marginTop: '5%'
    },
    image: {
        height: 60,
        width: 60
    },
    checkBoxContainer: {
        backgroundColor: 'transparent',
        marginLeft: 0,
        width: '100%'
    },
    tabBarContainer: {
        marginTop: '5%'
    },
    priorityItemContainer: {
        paddingVertical: 16
    },
    paddingTop_24: {
        paddingTop: 24
    },
    priorityImgView: {
        paddingHorizontal: 10,
        height: 60,
        alignSelf: 'center'
    },
    executedFlagContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: 22,
        width: 92,
        backgroundColor: '#2DD36F',
        borderTopLeftRadius: 5,
        alignItems: 'center',
        borderBottomRightRadius: 20,
        justifyContent: 'center',
        paddingLeft: 11,
        paddingRight: 13
    },
    executedFlagText: {
        color: baseStyle.color.white,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_12
    },
    archivedPrioritiesFilter: {
        alignItems: 'center',
        flexWrap: 'wrap',
        flexDirection: 'row',
        marginTop: 15,
        paddingHorizontal: '5%'
    },
    priorityCheckBoxContainer: {
        width: '47%',
        marginLeft: 0,
        borderWidth: 0,
        padding: 0,
        backgroundColor: 'transparent'
    },
    checkBoxText: {
        fontWeight: baseStyle.fontWeight.fw_400,
        fontSize: baseStyle.fontSize.fs_14,
        marginLeft: 0,
        marginRight: 0,
        fontFamily: 'Gotham',
        color: baseStyle.color.black
    },
    toolTipPosition: {
        position: 'absolute',
        right: 8,
        top: 10
    },
    tooltipContainer: {
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowOpacity: 1,
        shadowRadius: 10,
        borderRadius: 8,
        padding: 16
    },
    optionsDotIcon: {
        height: 33,
        width: 30
    },
    paddingVertical_16: {
        paddingVertical: 16
    },
    optionsText: {
        fontSize: 12,
        fontWeight: '700'
    },
    lineStyle: {
        height: 1,
        backgroundColor: '#D3D3D3'
    },
    color_grey: {
        color: 'gray'
    },
    noSaleText: {
        color: baseStyle.color.titleGray,
        fontSize: baseStyle.fontSize.fs_12
    },
    noSaleIcon: {
        height: 14,
        width: 14,
        marginLeft: 4
    },
    titleMargin: {
        marginTop: 20
    },
    successViewBoldText: {
        color: baseStyle.color.black,
        fontSize: 16,
        lineHeight: 24,
        fontWeight: baseStyle.fontWeight.fw_700,
        textAlign: 'center'
    },
    successViewMessageText: {
        color: baseStyle.color.black,
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 24,
        textAlign: 'center'
    },
    font_700: {
        fontWeight: baseStyle.fontWeight.fw_700
    },
    alertViewImg: {
        marginTop: 50,
        width: 60,
        height: 54
    }
})
// Story 10623288: snoozed with no implementation
const story10623288IgnoreFilters = [PriorityQuickFilterName.snoozed]

export const renderEmptyListPlaceholder = () => {
    return (
        <EmptyListPlaceholder
            image={<Image source={ImageSrc.IMG_NO_ITEM_RESULT} style={styles.ResultIcon} />}
            title={
                <View style={styles.resultEmpView}>
                    <CText style={styles.NoResultTitle}>{t.labels.PBNA_MOBILE_NO_RESULTS}</CText>
                    <CText style={styles.NoResultContent}>{t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_1}</CText>
                    <CText style={styles.NoResultContent}>{t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_2}</CText>
                    <CText style={styles.NoResultContent}>{t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_3}</CText>
                </View>
            }
        />
    )
}

export const renderSuccessViewJSX = (title: string, date?: string) => {
    return (
        <>
            <CText style={[styles.successViewBoldText, styles.titleMargin]}>{title}</CText>
            {date && (
                <CText style={styles.successViewMessageText}>
                    {t.labels.PBNA_MOBILE_PUSH_TO_SMART_R_MSG}
                    <CText style={styles.successViewBoldText}>
                        {` ${t.labels.PBNA_MOBILE_PRIORITY_START_DAY}, \n${date}`}
                    </CText>
                </CText>
            )}
        </>
    )
}

interface PriorityStatus {
    priorityId: string
    storePriorityAddedToCart: boolean
    priorityNotStart: boolean
}

const InnovationProductArchiveDetail = (props: InnovationProductArchiveDetailProps) => {
    const { navigation, route } = props
    const { isFromPushToSMARTr } = route.params
    const [searchChange, setSearchChange] = useState('')
    const [searchText, setSearchText] = useState('')
    // Search Text for Priorities
    const [spStatus, setSpStatus] = useState({})
    const [updateCarousel, setUpdateCarousel] = useState(0)
    const [navToDetail, setNavToDetail] = useState(true)
    const alertModal = useRef<AlertModalRef>(null)
    const [carouselParam, setCarouselPageParam] = useState({})
    const [quickFilter, setQuickFilter] = useState({
        snoozedCheck: '',
        noSaleCheck: '',
        deliveredCheck: '',
        completedCheck: ''
    })
    const dispatch = useDispatch()

    const priorityIdForNav = useRef<PriorityStatus>()
    const [successViewTitle, setSuccessViewTitle] = useState<string>('')
    const [successViewConStyle, setSuccessViewConStyle] = useState<ViewStyle>({} as ViewStyle)
    const [afterTimeClose, setAfterTimeClose] = useState<number>(0)
    const [refreshFlag, setRefreshFlag] = useState<number>(0)

    const toolTipRefs = useRef<any>([])
    const retailStoreId = route.params.retailStore.Id
    const successRef = useRef<SuccessViewRef>(null)
    const isFocused = useIsFocused()

    const [successViewJSX, setSuccessViewJSX] = useState<React.ReactNode>('')
    const [alertViewJSX, setAlertViewJSX] = useState<React.ReactNode>('')

    const [showArchivedIcon, setShowArchivedIcon] = useState<boolean>(true)

    const {
        prioritiesDisplay,
        searchKey: prioritySearchKey,
        filters: archivedPrioritiesFilterMap,
        selectedFilters: selectedPriorityFilter,
        setPriorities,
        setStorePriorities,
        setSearchKey: setPrioritySearchKey,
        setSelectedFilters: setSelectedPriorityFilter,
        setExecutedPriorityIds
    } = useFilteredPrioritiesData()

    const SEARCH_KEY_MIN_LEN = 3
    const [prioritySearchText, setPrioritySearchText] = useState<string>('')

    const { carouselInfo, accessToken } = useInnovationCarouselDetail(
        route.params.retailStore.Id,
        false,
        0,
        searchText,
        updateCarousel,
        true
    )

    // data source of Carousel Archive
    const useSellingDataFromLocalHookProps = {
        isLoading: false,
        retailStore: route.params.retailStore,
        isFocused,
        refreshFlag,
        searchText: prioritySearchKey
    }
    const { isLoadingPriorities, carouselSelling, archivedPriorities, storePriorities, executedPriorityIds } =
        useSellingDataFromLocalHook(useSellingDataFromLocalHookProps)

    // provide data for useFilteredPrioritiesData filtering and pagination
    useEffect(() => {
        setPriorities(archivedPriorities)
        setStorePriorities(storePriorities)
        setExecutedPriorityIds(executedPriorityIds)
    }, [archivedPriorities])

    const PRIORITIES_TAB_INDEX = 0
    const TAB_LIST = [
        { name: t.labels.PBNA_MOBILE_PRIORITIES.toUpperCase() },
        { name: t.labels.PBNA_MOBILE_IP_INNOVATION.toUpperCase() }
    ]
    const DEFAULT_TAB_INDEX = TAB_LIST.findIndex((tab) => tab.name === route.params.tab)
    const [activeTab, setActiveTab] = useState<number>(DEFAULT_TAB_INDEX)
    const handleUpdateCarousel = () => {
        setUpdateCarousel((prevUpdateCarousel) => prevUpdateCarousel + 1)
    }
    const handleRetrieveCarousel = (sp: any) => {
        setCarouselPageParam({
            National_Launch_Date: sp['Product.National_Launch_Date__c'] || '',
            Sub_Brand_Code__c: sp['Product.Sub_Brand_Code__c'] || '',
            Brand_Code__c: sp['Product.Brand_Code__c'] || ''
        })
        const brandName = (sp['Product.Formatted_Brand__c'] || sp['Product.Brand_Name__c'])
            .split(' ')
            .map((x: string) => x.charAt(0).toUpperCase() + x.slice(1))
            .join(' ')
        const subBrandName = (sp['Product.Formatted_Sub_Brand_Name__c'] || sp['Product.Sub_Brand__c'])
            .split(' ')
            .map((x: string) => x.charAt(0).toUpperCase() + x.slice(1))
            .join(' ')
        alertModal.current?.openModal(
            `${t.labels.PBNA_MOBILE_IP_RESTORE_TO_CUSTOMER} ${t.labels.PBNA_MOBILE_CAROUSEL}`,
            t.labels.PBNA_MOBILE_IP_ARCHIVE_POP_MSG_1 +
                ` ${brandName}, ${subBrandName} ` +
                t.labels.PBNA_MOBILE_IP_ARCHIVE_POP_MSG_2
        )
    }

    const showPushToSMARTrMessage = async () => {
        const ICON_SUCCESS = ImageSrc.ICON_SUCCESS
        const { pushToSMARTrMessageTitle, pushToSMARTrMessageType, storePriorityStartDate } = route.params
        if (pushToSMARTrMessageType === 'NOT_START' || pushToSMARTrMessageType === 'ADDED_TO_CART') {
            const successViewJSX = renderSuccessViewJSX(pushToSMARTrMessageTitle, storePriorityStartDate)
            setSuccessViewJSX(successViewJSX)
            setSuccessViewConStyle({
                width: '75%',
                height: 'auto',
                paddingHorizontal: 20,
                paddingBottom: 30
            })
            setAfterTimeClose(IntervalTime.FIVE_THOUSAND)
            await customDelay(500)
            successRef.current?.openModal()
        } else {
            const alertViewJSX = (
                <View
                    style={[
                        commonStyle.flexDirectionColumn,
                        commonStyle.alignItemsCenter,
                        commonStyle.marginHorizontal_20,
                        commonStyle.fullWidth
                    ]}
                >
                    <Image style={styles.alertViewImg} source={ICON_SUCCESS} />
                    <CText style={[styles.successViewBoldText, styles.titleMargin]}>{pushToSMARTrMessageTitle}</CText>
                    <CText style={styles.successViewMessageText}>{t.labels.PBNA_MOBILE_PRIORITY_MOVED_BACK_MSG}</CText>
                </View>
            )

            setAlertViewJSX(alertViewJSX)
            alertModal.current?.openModal()
        }
    }

    const resetPushToSMARTrMessage = () => {
        navigation.dispatch({
            ...CommonActions.setParams({
                ...route.params,
                isFromPushToSMARTr: false,
                pushToSMARTrMessageTitle: '',
                pushToSMARTrMessageType: null,
                storePriorityStartDate: ''
            }),
            source: route.key
        })
    }

    useEffect(() => {
        if (isFromPushToSMARTr && isFocused) {
            setShowArchivedIcon(false)
            showPushToSMARTrMessage()
        }
    }, [isFromPushToSMARTr, isFocused])

    useEffect(() => {
        if (carouselInfo.length && carouselInfo[0] !== -1) {
            const retailStoreId = carouselInfo[0].RetailStoreId
            checkStoreProductOrder(JSON.stringify(retailStoreId)).then((storeProductStatus) => {
                setSpStatus(storeProductStatus)
                if (route.params.navFlag && navToDetail) {
                    resetPushToSMARTrMessage()
                    navigation.navigate('InnovationProductDetail', {
                        retailStore: route.params.retailStore,
                        accessToken: accessToken,
                        prodLaunchTwoWks: route.params.cardInfo,
                        orderedCount: route.params.cardInfo.orderedCount,
                        deliveredCount: route.params.cardInfo.deliveredCount,
                        spStatus: storeProductStatus,
                        isArchive: true,
                        onClickExecute: route.params.onClickExecute,
                        updateCarousel: handleUpdateCarousel,
                        retrieveCarousel: handleRetrieveCarousel,
                        navFlag: route.params.navFlag,
                        handleNavToDetail: () => {
                            setNavToDetail(false)
                        }
                    })
                    setNavToDetail(false)
                }
            })
        }
    }, [carouselInfo])
    const carouselDisplayed = carouselDisplayedFilter(carouselInfo, spStatus, null).cardArchive
    const [quickFilterDisPlayed, setQuickFilterDisPlayed] = useState<any[]>([])

    useEffect(() => {
        if (
            quickFilter.snoozedCheck ||
            quickFilter.noSaleCheck ||
            quickFilter.deliveredCheck ||
            quickFilter.completedCheck
        ) {
            const data = searchText
                ? carouselDisplayedFilter(carouselInfo, spStatus, null).cardArchive
                : carouselDisplayed
            setQuickFilterDisPlayed(
                data.filter(
                    (v) =>
                        (quickFilter.noSaleCheck && v.noSaleCount) ||
                        (quickFilter.snoozedCheck && v.snoozedCount) ||
                        (quickFilter.deliveredCheck && v.deliveredCount) ||
                        (quickFilter.completedCheck && v.deliveredCount === v.skuItems.length)
                )
            )
        } else {
            setQuickFilterDisPlayed(carouselDisplayed)
        }
    }, [quickFilter, searchText, carouselInfo, spStatus])

    useEffect(() => {
        navigation.addListener('beforeRemove', () => {
            route.params.updateCarousel && route.params.updateCarousel()
            if (route.params.handleMsgDisplay) {
                route.params.handleMsgDisplay()
            }
        })
        return () => {
            navigation.removeListener('beforeRemove')
        }
    }, [])

    const renderProductOrPriorityImg = (item: any, isPriority?: boolean) => {
        const imgUrl = isPriority
            ? `${CommonParam.endpoint}/${CommonApi.PBNA_MOBILE_API_APEX_REST}/${CommonApi.PBNA_MOBILE_GET_PRODUCT_PHOTO}/${item.Id}`
            : item.carouseUrl
        const tokenStr = isPriority ? `Bearer ${CommonParam.accessToken}` : accessToken

        if (isCelsiusPriority(item)) {
            return <Image style={styles.image} resizeMode="center" source={ImageSrc.CELSIUS_LOGO} />
        }

        if (isPriority) {
            return (
                <CommonOnlineImage
                    dataItemId={item.Id}
                    apexAPI={CommonApi.PBNA_MOBILE_GET_PRODUCT_PHOTO}
                    imageStyle={styles.image}
                />
            )
        }

        if (imgUrl && !isPriority) {
            return (
                <FastImage
                    source={{
                        uri: imgUrl,
                        headers: {
                            Authorization: tokenStr,
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

    const innovationTabGoToCarouse = async () => {
        await AsyncStorage.setItem('carousel_page', JSON.stringify(carouselParam))
        route.params.setReturnFromDetail(true)
        navigation.goBack()
    }

    const priorityTabGoToCarousel = async () => {
        const correctIndex = carouselSelling.findIndex((carousel: any) => carousel.Id === priorityIdForNav.current)
        if (isFromPushToSMARTr) {
            const priorityId = await AsyncStorage.getItem('pushToSmartR.priorityId')
            await AsyncStorage.removeItem('pushToSmartR.priorityId')

            dispatch(setRedirectAction({ type: 'showPriorityInCarousel', data: priorityId }))

            const navigateArgs = [
                'CustomerDetailScreen',
                {
                    customer: route.params.retailStore,
                    readonly: true,
                    tab: ActiveTabName.SALES_ACTIONS
                }
            ]
            navigation.navigate(...navigateArgs)
        } else {
            const priorityId = priorityIdForNav.current

            dispatch(setRedirectAction({ type: 'showPriorityInCarousel', data: priorityId }))

            route.params.setRetrievedDataIndex && route.params.setRetrievedDataIndex(correctIndex)
            navigation.goBack()
        }
    }

    const handleNoSalePriority = async (priority: any, index?: number) => {
        const STATUS = 'No Sale'
        if (typeof index === 'number') {
            toolTipRefs?.current[index].toggleTooltip()
        }
        const { isSuccess } = await updateStorePriorityStatus(retailStoreId, STATUS, priority.Id)
        if (isSuccess) {
            setRefreshFlag((v: number) => v + 1)
            dispatch(setRedirectAction({ type: 'archivedPriorityNoSaleShowMessage', data: { priority } }))
        }
    }

    const handleRetrievePriority = async (priority: any, storePriority: any, index?: number) => {
        const STATUS = 'Action'
        if (typeof index === 'number') {
            toolTipRefs?.current[index].toggleTooltip()
        }
        const TODAY = dayjs(new Date()).format(TIME_FORMAT.Y_MM_DD)
        const storePriorityAddedToCart = storePriority.AddedToCart__c === '1'
        const priorityNotStart = dayjs(priority.Start_Date__c).isAfter(TODAY)
        setShowArchivedIcon(true)

        if (storePriorityAddedToCart && priorityNotStart) {
            const startDateStr = moment(priority.Start_Date__c).format(TIME_FORMAT.MMM_D_YYYY)
            const successViewJSX = (
                <>
                    <CText style={[styles.successViewBoldText, styles.titleMargin]}>
                        {`${t.labels.PBNA_MOBILE_PRIORITY_RETRIEVED}`}
                    </CText>
                    <CText style={styles.successViewMessageText}>
                        <CText style={{ fontSize: 14, fontWeight: '700' }}>{`${priority.Card_Title__c} `}</CText>
                        {t.labels.PBNA_MOBILE_PRIORITY_RETRIEVED_MSG}
                        <CText style={styles.successViewBoldText}>
                            {` ${t.labels.PBNA_MOBILE_PRIORITY_START_DAY}, \n${startDateStr}.`}
                        </CText>
                    </CText>
                </>
            )
            setSuccessViewTitle('')
            setSuccessViewJSX(successViewJSX)
            setSuccessViewConStyle({
                width: '75%',
                height: 'auto',
                paddingHorizontal: 20,
                paddingBottom: 30
            })
            setAfterTimeClose(IntervalTime.FIVE_THOUSAND)
        }

        priorityIdForNav.current = priority.Id

        const { isSuccess } = await updateStorePriorityStatus(retailStoreId, STATUS, priority.Id)
        if (isSuccess) {
            setRefreshFlag((v: number) => v + 1)
            if (storePriorityAddedToCart && priorityNotStart && !isLoadingPriorities) {
                successRef.current?.openModal()
            } else {
                alertModal.current?.openModal(
                    `${t.labels.PBNA_MOBILE_IP_RESTORE_TO_CUSTOMER} ${t.labels.PBNA_MOBILE_CAROUSEL}`,
                    `${priority.Card_Title__c} ` + t.labels.PBNA_MOBILE_PRIORITY_MOVED_BACK_MSG
                )
            }
        }
    }

    // redirect action --BEGIN--
    const redirectAction = useSelector(selectRedirectAction)
    const [messageModal, setMessageModal] = useState<ReactNode>(null)

    useEffect(() => {
        if (isFocused && redirectAction.archivedPriorityNoSaleShowMessage && successRef.current) {
            dispatch(setRedirectAction({ type: 'archivedPriorityNoSaleShowMessage', data: null }))

            const { priority } = redirectAction.archivedPriorityNoSaleShowMessage

            setMessageModal(
                <Dialog isVisible style={{ zIndex: 9999 }}>
                    <View style={{ alignItems: 'center' }}>
                        <Image
                            source={ImageSrc.IMG_ITEMS_ARCHIVED}
                            style={{ width: 53, height: 48, marginVertical: 22 }}
                        />
                        <CText style={{ fontWeight: '700', fontSize: 16, textAlign: 'center' }}>
                            {t.labels.PBNA_MOBILE_PRIORITY_NO_SALED}
                        </CText>
                        <CText style={{ fontWeight: '400', fontSize: 14, textAlign: 'center' }}>
                            {t.labels.PBNA_MOBILE_PRIORITY_REMAIN_IN_ARCHIVE.replaceAll(
                                '{title}',
                                priority.Card_Title__c
                            ).replaceAll('{endDate}', priority.End_Date__c)}
                        </CText>
                    </View>
                </Dialog>
            )
            setTimeout(() => setMessageModal(null), 3000)
        }
    }, [isFocused, redirectAction.archivedPriorityNoSaleShowMessage, successRef.current])

    useEffect(() => {
        if (
            isFocused &&
            redirectAction.archivedPriorityRetrieveShowDialog &&
            successRef.current &&
            alertModal.current
        ) {
            dispatch(setRedirectAction({ type: 'archivedPriorityRetrieveShowDialog', data: null }))

            const { priority, storePriority } = redirectAction.archivedPriorityRetrieveShowDialog

            handleRetrievePriority(priority, storePriority)
        }
    }, [isFocused, redirectAction.archivedPriorityRetrieveShowDialog, successRef.current, alertModal.current])
    // redirect action --END--

    const renderItem = (item: any) => {
        return (
            <TouchableOpacity
                style={styles.itemContainBtn}
                onPress={() => {
                    resetPushToSMARTrMessage()
                    navigation.navigate('InnovationProductDetail', {
                        retailStore: route.params.retailStore,
                        accessToken: accessToken,
                        prodLaunchTwoWks: item.item,
                        orderedCount: item.item.orderedCount,
                        deliveredCount: item.item.deliveredCount,
                        spStatus: spStatus,
                        isArchive: true,
                        onClickExecute: route.params.onClickExecute,
                        updateCarousel: handleUpdateCarousel,
                        retrieveCarousel: handleRetrieveCarousel
                    })
                }}
            >
                <View style={styles.proImgView}>{renderProductOrPriorityImg(item.item)}</View>
                <View style={styles.brandCon}>
                    <CText style={styles.brandText} numberOfLines={1}>
                        {item.item['Product.Formatted_Brand__c'] || item.item['Product.Brand_Name__c']}
                    </CText>
                    <CText style={styles.subBrandText}>
                        {item.item['Product.Formatted_Sub_Brand_Name__c'] || item.item['Product.Sub_Brand__c']}
                    </CText>
                    <CText style={styles.lunchDate} numberOfLines={1}>
                        {t.labels.PBNA_MOBILE_METRICS_NAT_LAUNCH +
                            ' ' +
                            moment(item.item['Product.National_Launch_Date__c']).format('MMM DD, YYYY')}
                    </CText>
                    <View style={styles.snoozedCon}>
                        <View style={styles.snoozedContainer}>
                            <CText style={styles.countLabel}>{t.labels.PBNA_MOBILE_IP_SNOOZED}</CText>
                            <CText style={styles.countStyle}> {item.item.snoozedCount} </CText>
                        </View>
                        <View style={styles.delimiterStyle} />
                        <View style={styles.noSaleContainer}>
                            <CText style={styles.countLabel}> {t.labels.PBNA_MOBILE_NO_SALE}</CText>
                            <CText style={styles.countStyle}> {item.item.noSaleCount} </CText>
                        </View>
                        <View style={styles.delimiterStyle} />
                        <View style={styles.deliveredContainer}>
                            <CText style={styles.countLabel}> {t.labels.PBNA_MOBILE_IP_DELIVERED}</CText>
                            <CText style={styles.countStyle}> {item.item.deliveredCount} </CText>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    const renderDataSource = () => {
        if (
            quickFilter.snoozedCheck ||
            quickFilter.noSaleCheck ||
            quickFilter.deliveredCheck ||
            quickFilter.completedCheck
        ) {
            return quickFilterDisPlayed
        }
        return carouselDisplayed
    }

    const renderEmptyPriorityListPlaceholder = () => {
        return (
            <EmptyListPlaceholder
                image={<Image source={ImageSrc.IMG_NO_ITEM_RESULT} style={styles.ResultIcon} />}
                title={
                    <View style={styles.resultEmpView}>
                        <CText style={styles.NoResultTitle}>{t.labels.PBNA_MOBILE_NO_ARCHIVED_PRIORITIES}</CText>
                        <CText style={styles.NoResultContent}>{t.labels.PBNA_MOBILE_NO_ARCHIVED_PRIORITIES_MSG}</CText>
                    </View>
                }
            />
        )
    }

    const renderExecutedFlag = () => {
        return (
            <View style={styles.executedFlagContainer}>
                <CText style={styles.executedFlagText}>{t.labels.PBNA_MOBILE_EXECUTED.toLocaleUpperCase()}</CText>
            </View>
        )
    }

    const renderMoreOptions = (priority: any, index: number): ReactElement<any> => {
        const storePriority = storePriorities.find((sp) => sp.PriorityId__c === priority.Id)

        const actionList: any[] = [
            {
                text: t.labels.PBNA_MOBILE_IP_SNOOZE.toLocaleUpperCase(),
                actionClick: () => {},
                disabled: true
            }
        ]
        if (storePriority?.Status__c === 'Action') {
            actionList.push({
                text: t.labels.PBNA_MOBILE_NO_SALE.toLocaleUpperCase(),
                actionClick: handleNoSalePriority
            })
        } else if (storePriority?.Status__c === 'No Sale') {
            actionList.push({
                text: t.labels.PBNA_MOBILE_IP_RETRIEVE.toLocaleUpperCase(),
                actionClick: (priority: any, index: number) => handleRetrievePriority(priority, storePriority, index)
            })
        }

        return (
            <View style={commonStyle.fullWidth}>
                {actionList.map((item: any, actionIndex: number) => {
                    return (
                        <TouchableOpacity
                            onPress={() => {
                                item.actionClick && item.actionClick(priority, index)
                            }}
                            key={item.text}
                            disabled={item.disabled}
                        >
                            <View style={styles.paddingVertical_16}>
                                <CText style={[styles.optionsText, item.disabled && styles.color_grey]}>
                                    {item.text}
                                </CText>
                            </View>
                            {actionIndex !== actionList.length - 1 && (
                                <View style={commonStyle.fullWidth}>
                                    <View style={[styles.lineStyle, commonStyle.fullWidth]} />
                                </View>
                            )}
                        </TouchableOpacity>
                    )
                })}
            </View>
        )
    }

    const renderPopTip = (priority: any, index: number) => {
        return (
            <View style={styles.toolTipPosition}>
                <CommonTooltip
                    cRef={(el: any) => (toolTipRefs.current[index] = el)}
                    tooltip={renderMoreOptions(priority, index)}
                    width={166}
                    height={135}
                >
                    <Image source={ImageSrc.ICON_KEBAB_MENU} style={styles.optionsDotIcon} />
                </CommonTooltip>
            </View>
        )
    }

    const renderNoSaleDate = (priority: any) => {
        const sp = storePriorities.find((sp) => sp.PriorityId__c === priority.Id)
        if (sp?.Status__c === 'No Sale') {
            return (
                <View style={[commonStyle.flex_1, commonStyle.flexRowAlignCenter, commonStyle.marginTop_5]}>
                    <CText style={styles.noSaleText}>
                        {dayjs(sp.Date_NoSale__c).format(TIME_FORMAT.SCHEDULE_DATE_FORMAT)}{' '}
                    </CText>
                    <Image source={ImageSrc.ICON_NO_SALE} style={styles.noSaleIcon} />
                </View>
            )
        }
        return null
    }

    const renderPrioritiesCard = (priority: any, index: number) => {
        const IS_EXECUTED = executedPriorityIds.includes(priority.Id)

        const correctCardIndex = archivedPriorities.findIndex((listItem) => listItem.Id === priority.Id)

        return (
            <TouchableOpacity
                style={[styles.itemContainBtn, styles.priorityItemContainer, IS_EXECUTED && styles.paddingTop_24]}
                onPress={() => {
                    resetPushToSMARTrMessage()
                    navigation.navigate('InnovationProductDetail', {
                        retailStore: route.params.retailStore,
                        accessToken: accessToken,
                        correctPage: correctCardIndex + 1,
                        isSelling: true,
                        sellingData: archivedPriorities,
                        onClickExecute: route.params.onClickExecute,
                        isFromPriorityArchive: true
                    })
                }}
            >
                {IS_EXECUTED && renderExecutedFlag()}
                {!IS_EXECUTED && renderPopTip(priority, index)}
                <View style={styles.priorityImgView}>{renderProductOrPriorityImg(priority, true)}</View>
                <View style={styles.brandCon}>
                    <CText style={styles.brandText} numberOfLines={1}>
                        {priority.priorityType}
                    </CText>
                    <CText style={styles.subBrandText}>{priority.Card_Title__c}</CText>
                    {renderStartAndEndDate(priority, true, false, true)}
                    {renderPerfectFlag(priority, true)}
                    {!IS_EXECUTED && renderNoSaleDate(priority)}
                </View>
            </TouchableOpacity>
        )
    }

    const renderPrioritiesList = () => {
        return (
            <FlatList
                contentContainerStyle={styles.listCon}
                data={prioritiesDisplay}
                renderItem={({ item, index }) => renderPrioritiesCard(item, index)}
                keyExtractor={(item: any) => item.Id}
                onEndReachedThreshold={0.3}
                ListEmptyComponent={
                    !prioritySearchKey && !selectedPriorityFilter.length
                        ? renderEmptyPriorityListPlaceholder()
                        : renderEmptyListPlaceholder()
                }
            />
        )
    }

    const renderArchiveSKU = () => {
        return (
            <FlatList
                contentContainerStyle={styles.listCon}
                data={renderDataSource()}
                renderItem={renderItem}
                keyExtractor={(item: any) => item.Id}
                onEndReachedThreshold={0.3}
                initialNumToRender={5}
                ListEmptyComponent={renderEmptyListPlaceholder()}
            />
        )
    }
    const renderListLength = () => {
        if (activeTab === PRIORITIES_TAB_INDEX) {
            return prioritiesDisplay.length
        }
        if (
            quickFilter.snoozedCheck ||
            quickFilter.noSaleCheck ||
            quickFilter.deliveredCheck ||
            quickFilter.completedCheck
        ) {
            return quickFilterDisPlayed.length
        }
        return carouselDisplayed.length
    }

    const SEARCH_PLACEHOLDER =
        activeTab === PRIORITIES_TAB_INDEX
            ? t.labels.PBNA_MOBILE_METRICS_SEARCH_PRIORITIES
            : t.labels.PBNA_MOBILE_METRICS_SEARCH_PRODUCTS
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.bgtContainer}>
                <View style={styles.backView}>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.goBack()
                        }}
                        style={styles.backBtn}
                        hitSlop={styles.hitSlop}
                    >
                        <Image source={ImageSrc.IMG_BACK} style={styles.imgBack} />
                    </TouchableOpacity>
                    <View style={styles.marginLeft5}>
                        {route.params.retailStore['Account.IsOTSCustomer__c'] === '0' && (
                            <StorePlaceholderSvg style={styles.iconStore} />
                        )}
                        {route.params.retailStore['Account.IsOTSCustomer__c'] === '1' && (
                            <Image
                                style={styles.iconStore}
                                source={require('../../../../../../assets/image/OTS-Logo-Not-Signed.png')}
                            />
                        )}
                    </View>
                    <View style={styles.width75}>
                        <CText style={styles.storeName} numberOfLines={1}>
                            {route.params.retailStore.Name}
                        </CText>
                    </View>
                </View>
            </View>
            <View style={styles.line} />
            <View>
                <CText style={styles.achieveText} numberOfLines={1}>
                    {t.labels.PBNA_MOBILE_IP_CAROUSEL_ARCHIVE}
                </CText>
            </View>
            {/** Tab Bar */}
            <View style={styles.tabBarContainer}>
                <SelectTab listData={TAB_LIST} changeTab={(v: number) => setActiveTab(v)} activeTab={activeTab} />
            </View>
            <View style={styles.searchContainer}>
                {activeTab === PRIORITIES_TAB_INDEX ? (
                    <SearchBar
                        platform={'ios'}
                        placeholder={SEARCH_PLACEHOLDER}
                        allowFontScaling={false}
                        // @ts-ignore
                        clearIcon={null}
                        cancelButtonTitle={t.labels.PBNA_MOBILE_CLEAR}
                        containerStyle={styles.searchBarInnerContainer}
                        inputContainerStyle={styles.searchBarInputContainer}
                        value={prioritySearchText}
                        inputStyle={styles.searchInputContainer}
                        // @ts-ignore
                        onChangeText={(v) => setPrioritySearchText(v)}
                        onBlur={() => {
                            const kw = prioritySearchText.trim()
                            if (kw.length === 0 || kw.length >= SEARCH_KEY_MIN_LEN) {
                                setPrioritySearchKey(kw)
                            }
                        }}
                        onCancel={() => setPrioritySearchText('')}
                        onClear={() => setPrioritySearchKey('')}
                    />
                ) : (
                    <SearchBar
                        platform={'ios'}
                        placeholder={SEARCH_PLACEHOLDER}
                        allowFontScaling={false}
                        // @ts-ignore
                        clearIcon={null}
                        cancelButtonTitle={t.labels.PBNA_MOBILE_CLEAR}
                        containerStyle={styles.searchBarInnerContainer}
                        inputContainerStyle={styles.searchBarInputContainer}
                        value={searchChange}
                        inputStyle={styles.searchInputContainer}
                        // @ts-ignore
                        onChangeText={(v) => setSearchChange(v)}
                        onBlur={() => {
                            const kw = searchChange.trim()
                            if (kw.length === 0 || kw.length >= SEARCH_KEY_MIN_LEN) {
                                setSearchText(kw)
                            }
                        }}
                        onCancel={() => setSearchChange('')}
                        onClear={() => setSearchText('')}
                    />
                )}
            </View>
            <CText style={styles.checkboxAreaTitle} numberOfLines={1}>
                {t.labels.PBNA_MOBILE_METRICS_SHOW_ONLY}
            </CText>
            {/* quick filters */}
            {activeTab === PRIORITIES_TAB_INDEX ? (
                <View style={styles.archivedPrioritiesFilter}>
                    {archivedPrioritiesFilterMap.map((item) => {
                        return (
                            <CCheckBox
                                key={item.name}
                                title={item.label}
                                onPress={() => {
                                    if (selectedPriorityFilter.includes(item.name)) {
                                        setSelectedPriorityFilter(selectedPriorityFilter.filter((v) => v !== item.name))
                                    } else {
                                        setSelectedPriorityFilter(selectedPriorityFilter.concat(item.name))
                                    }
                                }}
                                textStyle={styles.checkBoxText}
                                checked={selectedPriorityFilter.includes(item.name)}
                                containerStyle={styles.priorityCheckBoxContainer}
                                disabled={story10623288IgnoreFilters.includes(item.name)}
                                readonly={story10623288IgnoreFilters.includes(item.name)}
                            />
                        )
                    })}
                </View>
            ) : (
                <View style={styles.checkboxArea}>
                    <View style={[styles.checkboxLayout]}>
                        <CCheckBox
                            onPress={() => {
                                setQuickFilter({
                                    ...quickFilter,
                                    snoozedCheck: quickFilter.snoozedCheck === '' ? 'True' : ''
                                })
                            }}
                            title={
                                <CText style={styles.checkboxLabel} numberOfLines={1}>
                                    {t.labels.PBNA_MOBILE_IP_SNOOZED}
                                </CText>
                            }
                            checked={quickFilter.snoozedCheck !== ''}
                            containerStyle={styles.checkBoxContainer}
                        />
                        <View>
                            <CCheckBox
                                onPress={() => {
                                    setQuickFilter({
                                        ...quickFilter,
                                        deliveredCheck: quickFilter.deliveredCheck === '' ? 'True' : ''
                                    })
                                }}
                                title={
                                    <CText style={styles.checkboxLabel} numberOfLines={1}>
                                        {t.labels.PBNA_MOBILE_IP_DELIVERED}
                                    </CText>
                                }
                                checked={quickFilter.deliveredCheck !== ''}
                                containerStyle={styles.checkBoxContainer}
                            />
                        </View>
                    </View>
                    <View style={styles.checkboxLayout}>
                        <CCheckBox
                            onPress={() => {
                                setQuickFilter({
                                    ...quickFilter,
                                    noSaleCheck: quickFilter.noSaleCheck === '' ? 'True' : ''
                                })
                            }}
                            title={
                                <CText style={styles.checkboxLabel} numberOfLines={1}>
                                    {t.labels.PBNA_MOBILE_NO_SALE}
                                </CText>
                            }
                            checked={quickFilter.noSaleCheck !== ''}
                            containerStyle={styles.checkBoxCon}
                        />
                        <View>
                            <CCheckBox
                                onPress={() => {
                                    setQuickFilter({
                                        ...quickFilter,
                                        completedCheck: quickFilter.completedCheck === '' ? 'True' : ''
                                    })
                                }}
                                title={
                                    <CText style={styles.checkboxLabel} numberOfLines={1}>
                                        {t.labels.PBNA_MOBILE_COMPLETED}
                                    </CText>
                                }
                                checked={quickFilter.completedCheck !== ''}
                                containerStyle={styles.checkBoxCon}
                            />
                        </View>
                    </View>
                </View>
            )}
            <View style={styles.sumTitleView}>
                <CText>{`${renderListLength()} ` + t.labels.PBNA_MOBILE_IP_CAROUSEL_CARDS}</CText>
            </View>
            {activeTab === PRIORITIES_TAB_INDEX ? renderPrioritiesList() : renderArchiveSKU()}
            <AlertView
                ref={alertModal}
                alertViewJSX={alertViewJSX}
                leftButtonLabel={t.labels.PBNA_MOBILE_OK}
                rightButtonLabel={`${t.labels.PBNA_MOBILE_GO_TO} \n ${t.labels.PBNA_MOBILE_CAROUSEL}`}
                onRightButtonPress={
                    activeTab === PRIORITIES_TAB_INDEX ? priorityTabGoToCarousel : innovationTabGoToCarouse
                }
                noClickable
            />
            <SuccessView
                ref={successRef}
                title={successViewTitle}
                successViewJSX={successViewJSX}
                modalViewStyle={successViewConStyle}
                afterTimeClose={afterTimeClose}
                noClickable
                iconSrc={showArchivedIcon ? (ImageSrc.IMG_ITEMS_ARCHIVED as ImageSourcePropType) : undefined}
            />
            {messageModal}
            <Loading isLoading={isLoadingPriorities && isFocused} />
        </SafeAreaView>
    )
}

export default InnovationProductArchiveDetail

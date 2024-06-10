import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { SafeAreaView, View, TouchableOpacity, TextInput, Image, Alert, FlatList } from 'react-native'
import { NavigationProp, RouteProp, useIsFocused } from '@react-navigation/native'
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'
import moment from 'moment'
import _ from 'lodash'
import { useAppliedList, useCardDetailEffect, useReturnProduct } from './ReturnProductHook'
import { ReturnProductScreenStyle } from './ReturnProductScreenStyle'
import { useDebounce, useFreshRef } from '../../../../hooks/CommonHooks'
import { CommonParam } from '../../../../../common/CommonParam'
import CText from '../../../../../common/components/CText'
import DatePickView from '../../../../../common/components/DatePickView'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { Log } from '../../../../../common/enums/Log'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { t } from '../../../../../common/i18n/t'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { appendLog, storeClassLog } from '../../../../../common/utils/LogUtils'
import { isTodayDayWithTimeZone, formatWithTimeZone } from '../../../../../common/utils/TimeZoneUtils'
import CollapseContainer from '../../../../component/common/CollapseContainer'
import { DatePickerCalendar } from '../../../../component/common/DatePickerCalendar'
import SearchBarWithScan from '../../../../component/common/SearchBarWithScan'
import CustomerCard from '../../../../component/visits/CustomerCard'
import { VisitStatus } from '../../../../enum/VisitType'
import { ReturnProductList } from '../ReturnProductList/ReturnProductList'
import BlueClear from '../../../../../../assets/image/ios-close-circle-outline-blue.svg'
import { useDropDown } from '../../../../../common/contexts/DropdownContext'
import CModal from '../../../../../common/components/CModal'
import { calculateReturnTotal, formatPriceWithComma, submitReturnOnlyOrder } from './ReturnProductUtils'
import { DefaultNumber, ReturnOrderSuffix } from '../../../../enum/Common'
import { useCartDetail } from '../../../../hooks/CartHooks'
import PONumberInput from '../../../../component/common/PONumberInput'
import { isTrueInDB } from '../../../../../savvy/utils/CommonUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { CartDetail } from '../../../../interface/CartDetail'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ReturnCartItem, ReturnProduct, ReturnProductListModel } from '../../../../interface/ReturnProduct'
import { compareDateToToday, ellipsisWithMaxSize, formatPrice000 } from '../../../../utils/CommonUtil'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useCalculateTotal } from '../../../../utils/ProductUtils'
import OrderService from '../../../../service/OrderService'
import CartService from '../../../../service/CartService'
import PriceService from '../../../../service/PriceService'

const styles = ReturnProductScreenStyle
const RETURN_SCREEN = 'return page'

interface RequestReturnScreenParams {
    navigation: NavigationProp<any>
    route: RouteProp<any>
}
const RequestReturnScreen: FC<RequestReturnScreenParams> = (props) => {
    const { route, navigation } = props
    const { visit, selected } = route.params || {}
    const visitStatus = visit?.Status
    const datePickerRef = useRef(null)
    const [startDate, setStartDate] = useState<any>(null)
    const [endDate, setEndDate] = useState<any>(null)
    const [isStartDate, setIsStartDate] = useState(true)
    const [search, setSearch] = useState('')
    const [returnShow, setReturnShow] = useState(false)
    const [searchStr, setSearchStr] = useState('')
    const isFocused = useIsFocused()
    const [notes, setNotes] = useState<string>('')
    const [notesRecordTime, setNotesRecordTime] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const { dropDownRef } = useDropDown()
    const [isShowSuccessModal, setIsShowSuccessModal] = useState(false)
    const [calculateResult, setCalculateResult] = useState({ totalTotal: 0, totalCases: 0, totalUnits: 0 })
    const [finalReturnList, setFinalReturnList] = useState<ReturnProductListModel[]>([])
    const [enableResetScrollToCoords, setEnableResetScrollToCoords] = useState<boolean>(true)
    const setEnableResetScrollToCoordsRef = useFreshRef(setEnableResetScrollToCoords)
    const isReturnOnly = selected === t.labels.PBNA_MOBILE_RETURN_ONLY_ORDER
    const { appliedList, setAppliedList, setAppliedListIsActive, setAppliedListActiveReturn, refreshAppliedList } =
        useAppliedList(visit, searchStr, isReturnOnly, startDate)
    const {
        prodLst,
        setIsActive,
        setAllIsActive,
        setOffset,
        setNeedRefreshCursor: refreshProductList,
        setCasePriceOrActiveReturn,
        setApplyReturn
    } = useReturnProduct({
        searchStr,
        store: visit,
        appliedList,
        setAppliedList,
        pageName: RETURN_SCREEN,
        isReturnOnly,
        setIsLoading,
        refreshAppliedList,
        deliveryDate: startDate
    })
    const isPONumRequired = isTrueInDB(visit?.Is_Customer_PO_Number_Required__c)
    const enableSingleUnitReturn = isTrueInDB(visit?.Single_Unit_Return__c)
    const [PONumber, setPoNumber] = useState<string>('')
    useEffect(() => {
        calculateReturnTotal(appliedList, setCalculateResult, setFinalReturnList)
    }, [appliedList])
    const setAppliedListIsActiveRef = useFreshRef(setAppliedListIsActive)
    const setAppliedListActiveReturnRef = useFreshRef(setAppliedListActiveReturn)
    const setIsActiveRef = useFreshRef(setIsActive)
    const setCasePriceOrActiveReturnRef = useFreshRef(setCasePriceOrActiveReturn)
    const setApplyReturnRef = useFreshRef(setApplyReturn)
    const finalProdLst = useCalculateTotal(prodLst)
    useDebounce(() => setSearchStr(search), 300, [search])

    const [casesAndUnitsMaxSize, totalMaxSize] = [5, 10]
    const PONumberInputRef = useRef<any>(null)
    const isModified = useRef<boolean>(false)
    const orderCartIdentifier = visit.OrderCartIdentifier || visit.VisitLegacyId
    const { cartDetail, refreshCartDetail } = useCartDetail(visit, orderCartIdentifier)
    const [needRefreshCartAndRender, setNeedRefreshCartAndRender] = useState<boolean>(false)
    const [priceMissing, setPriceMissing] = useState<boolean>(false)
    const [cartCount, setCartCount] = useState<number>(0)
    const setIsModified = (input: boolean) => {
        isModified.current = input
    }
    const originalCartDetailRef = useRef<CartDetail>(null)
    const originalCartItemsRef = useRef<ReturnCartItem[]>([])
    const identifier = `${orderCartIdentifier}${
        isReturnOnly ? ReturnOrderSuffix.RETURN_ONLY_BACKUP : ReturnOrderSuffix.ONGOING_ORDER_BACKUP
    }`

    const refreshCartAndBackupPrevious = async () => {
        const cartDetail = await refreshCartDetail()
        originalCartDetailRef.current = cartDetail
        CartService.getCartItemsWithReturnType(isReturnOnly, orderCartIdentifier).then((results: any) => {
            AsyncStorage.setItem(identifier, JSON.stringify(results))
            originalCartItemsRef.current = results
        })
    }

    const setStartDateAndRerender = async (deliveryDate: string) => {
        setStartDate(deliveryDate)
        const relativeDelDate = deliveryDate ? compareDateToToday(deliveryDate) : -1
        await PriceService.recalculatePriceOnDeliveryDateChange(
            visit.CustUniqId,
            orderCartIdentifier,
            relativeDelDate,
            isReturnOnly ? ReturnOrderSuffix.RETURN_ONLY : ReturnOrderSuffix.ONGOING_ORDER
        )
        setNeedRefreshCartAndRender(true)
    }

    useEffect(() => {
        if (needRefreshCartAndRender) {
            refreshAppliedList()
            refreshProductList()
            setNeedRefreshCartAndRender(false)
        }
    }, [needRefreshCartAndRender])

    useEffect(() => {
        if (isFocused) {
            // only backup the most initial version when mounted
            if (!originalCartDetailRef?.current) {
                refreshCartAndBackupPrevious()
            } else {
                refreshCartDetail()
            }
        }
    }, [isFocused])

    useCardDetailEffect({
        isReturnOnly,
        cartDetail,
        visit,
        setNotes,
        setStartDate: setStartDateAndRerender,
        setPoNumber,
        setEndDate,
        setNotesRecordTime
    })

    const renderReturnTotal =
        calculateResult.totalCases || calculateResult.totalUnits ? (
            <>
                <CText style={styles.returnsViewTitleSubTextValue}>
                    {`-${ellipsisWithMaxSize(calculateResult.totalCases.toString(), casesAndUnitsMaxSize)}`}
                </CText>
                <CText style={[styles.returnsViewTitleSubTextValue, styles.font_12_400, styles.marginLeft5]}>
                    {t.labels.PBNA_MOBILE_QUANTITY_CS}
                </CText>
                <CText style={[styles.marginLeft5, styles.returnsViewTitleSubTextValue]}>
                    {ellipsisWithMaxSize(calculateResult.totalUnits.toString(), casesAndUnitsMaxSize)}
                </CText>
                <CText style={[styles.returnsViewTitleSubTextValue, styles.font_12_400, styles.marginLeft5]}>
                    {t.labels.PBNA_MOBILE_QUANTITY_UN}
                </CText>
            </>
        ) : (
            <>
                <CText>{ellipsisWithMaxSize(calculateResult.totalCases.toString(), casesAndUnitsMaxSize)}</CText>
                <CText style={[styles.font_12_400, styles.marginLeft5]}>{t.labels.PBNA_MOBILE_QUANTITY_CS}</CText>
                <CText style={[styles.marginLeft5]}>
                    {ellipsisWithMaxSize(calculateResult.totalUnits.toString(), casesAndUnitsMaxSize)}
                </CText>
                <CText style={[styles.font_12_400, styles.marginLeft5]}>{t.labels.PBNA_MOBILE_QUANTITY_UN}</CText>
            </>
        )

    const titleComponents = (
        <View style={styles.returnsViewTitle}>
            <View style={styles.flexRowAlignCenter}>
                <CText style={styles.returnsViewTitlePri}>{t.labels.PBNA_MOBILE_RETURNS}</CText>
            </View>

            <View style={styles.returnsViewTitleSub}>
                <CText style={styles.returnsViewTitleSubText}>{t.labels.PBNA_MOBILE_TOTAL}</CText>
                {calculateResult.totalTotal ? (
                    <CText style={styles.returnsViewTitleSubTextValue}>
                        {`$-${formatPriceWithComma(
                            ellipsisWithMaxSize(formatPrice000(calculateResult.totalTotal), totalMaxSize)
                        )}`}
                    </CText>
                ) : (
                    <CText>{`$${DefaultNumber.stringZero000}`}</CText>
                )}
                <CText style={styles.returnsViewTitleSubText}>{` | ${t.labels.PBNA_MOBILE_QTY}`}</CText>
                {renderReturnTotal}
            </View>
        </View>
    )

    const renderExpand = () => {
        const allOpened = !_.isEmpty(finalProdLst) && !finalProdLst.find((one) => !one.isActive)
        return (
            <View
                style={[
                    styles.expandContainer,
                    {
                        borderBottomWidth: _.isEmpty(finalProdLst) ? 0 : 1
                    }
                ]}
            >
                <CText style={styles.expandContainerTitle}>
                    {`${t.labels.PBNA_MOBILE_ALL} ${t.labels.PBNA_MOBILE_PRODUCTS}`}
                </CText>
                <TouchableOpacity
                    disabled={_.isEmpty(finalProdLst)}
                    onPress={() => {
                        !_.isEmpty(finalProdLst) && setAllIsActive(!allOpened)
                    }}
                >
                    <View style={[styles.flexDirectionRow, styles.alignCenter]}>
                        <CText style={_.isEmpty(finalProdLst) ? styles.collapseAllGray : styles.collapseAll}>
                            {allOpened ? t.labels.PBNA_MOBILE_COLLAPSE_ALL : t.labels.PBNA_MOBILE_EXPAND_ALL}
                        </CText>
                        <View
                            style={[
                                allOpened ? styles.chevron_up : styles.chevron_down,
                                _.isEmpty(finalProdLst) && styles.chevronDownGray
                            ]}
                        />
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    const renderEmptyListComponent = (isLoading: boolean, list: any[], isReturnList = false) => {
        if (isLoading || isReturnList) {
            return <View />
        }
        if (list && list.length > 0) {
            return <View style={styles.emptyListStyle} />
        }
        const title = searchStr ? t.labels.PBNA_MOBILE_NO_RESULTS : t.labels.PBNA_MOBILE_YOUR_LIST_IS_EMPTY
        const subTitle = searchStr ? t.labels.PBNA_MOBILE_SEARCH_NO_RESULT : t.labels.PBNA_MOBILE_LIST_EMPTY_MSG

        return (
            <View style={[styles.alignCenter]}>
                <Image source={ImageSrc.IMG_NOFILTER_PRODUCT} style={styles.emptyImageSize} />
                <View>
                    <CText style={styles.emptyCartTitle}>{title}</CText>
                    <CText style={styles.emptyCartMessage}>{subTitle}</CText>
                </View>
            </View>
        )
    }

    const isCartDetailChanged = useMemo(() => {
        const hasValue = !!(startDate || PONumber || notes)
        const originalCartDetail = originalCartDetailRef.current
        if (isReturnOnly || !originalCartDetail) {
            return hasValue
        }
        return (
            originalCartDetail?.DeliveryDate !== startDate ||
            originalCartDetail?.Cust_Po_Id__c_Local !== PONumber ||
            originalCartDetail?.OrderNotes !== notes
        )
    }, [originalCartDetailRef?.current, startDate, PONumber, notes])

    const [isMadeChange, setIsMadeChange] = useState<boolean>(false)
    useEffect(() => {
        const refreshIsMadeChange = async () => {
            let newIsMadeChange = false
            if (isCartDetailChanged || isModified.current) {
                newIsMadeChange = true
            } else {
                newIsMadeChange = await CartService.checkIsCartDataModified(
                    orderCartIdentifier,
                    originalCartItemsRef.current,
                    isReturnOnly
                )
            }
            setIsMadeChange(newIsMadeChange)
        }
        refreshIsMadeChange()
    }, [isCartDetailChanged, finalReturnList])

    // check for price missing in cartItem, which is already applied returns
    useEffect(() => {
        CartService.checkAllReturnCartItem(orderCartIdentifier, isReturnOnly).then((res) => {
            setPriceMissing(res.priceMissing)
            setCartCount(res.cartCount)
        })
    }, [finalReturnList])

    // check for price missing in js scope, because of price missing potentially could be not applied yet
    const notAppliedPriceMissing = useMemo(() => {
        return finalReturnList.some((pack) => {
            return pack.products.some((product) => PriceService.checkProductPriceMissing(product, true))
        })
    }, [finalReturnList])

    const finalPriceMissing = priceMissing || notAppliedPriceMissing

    const revertAndNavigateBack = async () => {
        if (isReturnOnly) {
            const orderCartIdentifier = visit.OrderCartIdentifier || visit.VisitLegacyId
            await OrderService.clearCart(orderCartIdentifier, true)
        } else {
            await CartService.clearNotApplyReturnCart(visit, originalCartItemsRef)
            // if we don't apply the changes, we need to revert the changes in local cart item
            // need to confirm if the cart items were deleted from the local data
            await CartService.revertLocalCartData(visit, originalCartItemsRef)
        }
        AsyncStorage.removeItem(identifier)
        navigation.goBack()
    }

    const onPressCancel = async () => {
        if (isModified?.current) {
            Alert.alert(t.labels.PBNA_MOBILE_ALL_CHANGES_WILL_BE_LOST_DO_YOU_WISH_TO_CONTINUE, '', [
                {
                    text: `${t.labels.PBNA_MOBILE_CANCEL}`
                },
                {
                    text: `${t.labels.PBNA_MOBILE_YES}`,
                    onPress: revertAndNavigateBack
                }
            ])
        } else {
            revertAndNavigateBack()
        }
    }

    const hasReturnCartItems = !!appliedList.length

    const collapseProps = {
        title: t.labels.PBNA_MOBILE_RETURNS,
        showContent: returnShow,
        setShowContent: setReturnShow,
        titleComponents: titleComponents,
        noTopLine: true,
        noBottomLine: true,
        chevronStyle: styles.chevronStyle,
        containerStyle: returnShow ? styles.collapseContainerActive : styles.collapseContainer,
        titleStyle: styles.greyBG,
        disable: !hasReturnCartItems
    }

    const searchBarWithScanProps = {
        search,
        setSearch,
        placeholder: `${t.labels.PBNA_MOBILE_SEARCH} ${t.labels.PBNA_MOBILE_PRODUCTS}`
    }

    const isMeetCondition = useMemo(() => {
        const originalCartItems = originalCartItemsRef.current
        if (isReturnOnly) {
            return !!startDate && cartCount > 0
        }
        return !!startDate && ((originalCartItems.length === 0 && cartCount > 0) || originalCartItems.length > 0)
    }, [startDate, cartCount])

    let submitButtonState: any
    if (isReturnOnly) {
        submitButtonState = {
            successMessage: t.labels.PBNA_MOBILE_RETURN_PLACED_SUCCESS,
            submitMethod: async () => {
                if (finalPriceMissing) {
                    Alert.alert(
                        t.labels.PBNA_MOBILE_PRICE_INPUT_MISSING_POPUP,
                        t.labels
                            .PBNA_MOBILE_YOU_HAVE_ADDED_PRODUCTS_WITHOUT_A_PRICE_PLEASE_CHOOSE_A_PRICE_BEFORE_PROCEEDING
                    )
                    return
                }
                if (isPONumRequired && !PONumber) {
                    PONumberInputRef?.current?.promptPOInput()
                    return
                }
                const success = await submitReturnOnlyOrder(
                    visit,
                    { notes, DeliveryDate: startDate, PONumber, notesRecordTime },
                    dropDownRef,
                    navigation,
                    setIsShowSuccessModal
                )
                if (success) {
                    AsyncStorage.removeItem(identifier)
                }
            },
            disabled: !(isMadeChange && isMeetCondition)
        }
    } else {
        submitButtonState = {
            successMessage: t.labels.PBNA_MOBILE_RETURN_APPLY_SUCCESS,
            submitMethod: async () => {
                if (finalPriceMissing) {
                    Alert.alert(
                        t.labels.PBNA_MOBILE_PRICE_INPUT_MISSING_POPUP,
                        t.labels
                            .PBNA_MOBILE_YOU_HAVE_ADDED_PRODUCTS_WITHOUT_A_PRICE_PLEASE_CHOOSE_A_PRICE_BEFORE_PROCEEDING
                    )
                    return
                }
                await OrderService.saveCartDetail(
                    visit.PlaceId,
                    {
                        ...(cartDetail as CartDetail),
                        OrderNotes: notes,
                        DeliveryDate: startDate,
                        Cust_Po_Id__c_Local: PONumber,
                        OrderNotesTime: notesRecordTime
                    },
                    visit.OrderCartIdentifier || visit.VisitLegacyId
                )
                await CartService.handleReturnItems(visit, setIsShowSuccessModal, navigation, selected)
                AsyncStorage.removeItem(identifier)
            },
            disabled: !(isMadeChange && isMeetCondition)
        }
    }

    const updateDeliveryDate = (date: any) => {
        if (isTodayDayWithTimeZone(date, true)) {
            if (!startDate) {
                return
            }
            Alert.alert('', t.labels.PBNA_MOBILE_SELECT_DELIVERY_DATE, [
                {
                    text: t.labels.PBNA_MOBILE_OK,
                    onPress: () => {}
                }
            ])
            return
        }
        if (isStartDate) {
            Alert.alert(t.labels.PBNA_MOBILE_DELIVERY_DATE_CHANGE, t.labels.PBNA_MOBILE_DELIVERY_DATE_CHANGE_MSG, [
                {
                    text: t.labels.PBNA_MOBILE_CANCEL
                },
                {
                    text: t.labels.PBNA_MOBILE_YES_PROCEED,
                    onPress: () => {
                        setStartDateAndRerender(moment(date).format())
                        const logMsg = `${
                            CommonParam.GPID__c
                        } has selected Dlvry_Rqstd_Dtm__c = ${date} at ${formatWithTimeZone(
                            moment(),
                            TIME_FORMAT.YMDTHMS,
                            true,
                            true
                        )}`
                        appendLog(Log.MOBILE_INFO, 'orderade:choose delivery date', logMsg)
                    }
                }
            ])
            if (moment(startDate).format(TIME_FORMAT.Y_MM_DD) !== moment(date).format(TIME_FORMAT.Y_MM_DD)) {
                setIsModified(true)
            }
        }
    }

    const onRemoveReturnCartItem = async (prod: ReturnProduct) => {
        try {
            const { cartItemSoupEntryId } = prod
            cartItemSoupEntryId && (await CartService.removeCartItemFromSoupBySingleSoupEntryId(cartItemSoupEntryId))
            refreshAppliedList()
            refreshProductList()
            setIsModified(true)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: onRemoveReturnCartItem',
                `onRemoveReturnCartItem failed` + ErrorUtils.error2String(err)
            )
        }
    }

    const [screenScrollEnabled, setScreenScrollEnabled] = useState(true)
    const onRemoveCartItemRef = useFreshRef(onRemoveReturnCartItem)
    const currentOpenRowRef = useRef(null)

    return (
        <View style={styles.flex_1}>
            <SafeAreaView style={styles.container}>
                <View style={styles.topBgContainer} />
                <View style={styles.deHeader}>
                    <CText style={styles.deTitle}>{t.labels.PBNA_MOBILE_RETURNS}</CText>
                    <View style={styles.flexDirectionRow}>
                        <TouchableOpacity onPress={onPressCancel}>
                            <BlueClear height={36} width={36} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.cardHeader]}>
                    <CustomerCard
                        storeId={visit.PlaceId}
                        isInProgressVisit={visitStatus === VisitStatus.IN_PROGRESS}
                        isCompletedVisit={visitStatus === VisitStatus.COMPLETE}
                    />
                </View>
                <KeyboardAwareFlatList
                    style={[styles.flex_1, styles.scrollContent]}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={screenScrollEnabled}
                    ListHeaderComponent={
                        <>
                            <View style={styles.deliveryStyle}>
                                <DatePickView
                                    title={t.labels.PBNA_MOBILE_DELIVERY_DATE}
                                    dateString={startDate}
                                    clickable
                                    onChoseDate={() => {
                                        setIsStartDate(true)
                                        datePickerRef?.current?.show()
                                    }}
                                />
                                <DatePickerCalendar
                                    cRef={datePickerRef}
                                    onPickDate={(date: string) => {
                                        updateDeliveryDate(date)
                                    }}
                                    currValue={startDate}
                                    minDate={moment(new Date()).tz(CommonParam.userTimeZone).format()}
                                    maxDate={
                                        isReturnOnly
                                            ? ''
                                            : (endDate && moment(endDate).add(-1, 'day').format(TIME_FORMAT.Y_MM_DD)) ||
                                              ''
                                    }
                                />
                                {isPONumRequired && (
                                    <PONumberInput
                                        cRef={PONumberInputRef}
                                        PONumber={PONumber}
                                        setPoNumber={setPoNumber}
                                        setIsModified={setIsModified}
                                    />
                                )}
                            </View>
                            <View style={styles.notesView}>
                                <View style={styles.notesContainer}>
                                    <CText style={styles.notesTitle}>{t.labels.PBNA_MOBILE_ORDER_NOTES}</CText>
                                    <TextInput
                                        scrollEnabled
                                        placeholder={t.labels.PBNA_MOBILE_ORDER_NOTES_COMMENTS}
                                        placeholderTextColor={baseStyle.color.borderGray}
                                        editable
                                        multiline
                                        value={notes}
                                        onChangeText={(text: string) => {
                                            setNotes(text)
                                            setNotesRecordTime(Date.now())
                                            setIsModified(true)
                                        }}
                                    />
                                </View>
                            </View>
                            <View style={styles.searchBarWithScan}>
                                <SearchBarWithScan {...searchBarWithScanProps} />
                            </View>
                            {finalPriceMissing && (
                                <View
                                    style={[
                                        styles.paddingHorizontal_22,
                                        styles.paddingBottom_15,
                                        styles.flexDirectionRow
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name="alert-circle"
                                        size={baseStyle.fontSize.fs_16}
                                        color={baseStyle.color.red}
                                    />
                                    <CText
                                        style={{
                                            fontSize: baseStyle.fontSize.fs_14,
                                            color: baseStyle.color.red,
                                            fontWeight: baseStyle.fontWeight.fw_400,
                                            marginRight: 5,
                                            marginLeft: 7
                                        }}
                                    >
                                        {t.labels.PBNA_MOBILE_PRICE_INPUT_MISSING}
                                    </CText>
                                </View>
                            )}
                            <CollapseContainer {...collapseProps}>
                                <FlatList
                                    style={[styles.flexGrow_1, styles.bgWhite, styles.collapseFlatList]}
                                    showsVerticalScrollIndicator={false}
                                    data={finalReturnList}
                                    keyExtractor={(item) => item.label}
                                    renderItem={({ item }) => {
                                        const props = {
                                            item,
                                            setIsActiveRef: setAppliedListIsActiveRef,
                                            setCasePriceOrActiveReturnRef: setAppliedListActiveReturnRef,
                                            isReturnList: true,
                                            swipeAble: true,
                                            onRemoveCartItemRef,
                                            setScreenScrollEnabled,
                                            currentOpenRowRef,
                                            setApplyReturnRef,
                                            setIsModified,
                                            enableSingleUnitReturn
                                        }
                                        return <ReturnProductList {...props} />
                                    }}
                                    initialNumToRender={5}
                                    maxToRenderPerBatch={10}
                                    updateCellsBatchingPeriod={300}
                                    windowSize={5}
                                />
                            </CollapseContainer>
                            {renderExpand()}
                        </>
                    }
                    ListFooterComponent={renderEmptyListComponent(isLoading, finalProdLst)}
                    data={finalProdLst}
                    keyExtractor={(item) => item.label}
                    renderItem={({ item }) => {
                        const props = {
                            item,
                            setIsActiveRef,
                            setCasePriceOrActiveReturnRef,
                            setApplyReturnRef,
                            setEnableResetScrollToCoordsRef,
                            setIsModified,
                            enableSingleUnitReturn
                        }
                        return (
                            item.products.filter((a) => a.isReturnProduct !== true).length > 0 && (
                                <ReturnProductList {...props} />
                            )
                        )
                    }}
                    initialNumToRender={5}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={300}
                    windowSize={5}
                    onEndReachedThreshold={0.3}
                    onEndReached={() => {
                        setOffset()
                    }}
                    enableResetScrollToCoords={enableResetScrollToCoords}
                />
                <View style={[styles.bottomContainer, styles.marginBottom_30]}>
                    <TouchableOpacity
                        style={[
                            styles.submitBtn,
                            {
                                backgroundColor: submitButtonState.disabled
                                    ? baseStyle.color.white
                                    : baseStyle.color.purple
                            }
                        ]}
                        disabled={submitButtonState.disabled}
                        onPress={submitButtonState.submitMethod}
                    >
                        <CText
                            style={[
                                styles.font_12_700,
                                {
                                    color: submitButtonState.disabled ? baseStyle.color.liteGrey : baseStyle.color.white
                                }
                            ]}
                        >
                            {isReturnOnly
                                ? t.labels.PBNA_MOBILE_RETURN_PRODUCTS.toLocaleUpperCase()
                                : t.labels.PBNA_MOBILE_SAVE_PROCEED}
                        </CText>
                    </TouchableOpacity>
                </View>
                <CModal
                    imgSrc={ImageSrc.IMG_SUCCESS_ICON}
                    showModal={isShowSuccessModal}
                    content={submitButtonState.successMessage}
                    disabled
                />
            </SafeAreaView>
        </View>
    )
}

export default RequestReturnScreen

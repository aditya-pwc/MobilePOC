import { NavigationProp, useIsFocused } from '@react-navigation/native'
import React, { FC, useState, useEffect, useRef, useMemo } from 'react'
import { SafeAreaView, TouchableOpacity, View, StyleSheet, Alert, FlatList } from 'react-native'
import CText from '../../../common/components/CText'
import CustomerCard from '../../component/visits/CustomerCard'
import { baseStyle } from '../../../common/styles/BaseStyle'
import BlueClear from '../../../../assets/image/ios-close-circle-outline-blue.svg'
import { useProduct } from '../../hooks/ProductSellingHooks'
import { useCart, useCartDetail } from '../../hooks/CartHooks'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import CModal from '../../../common/components/CModal'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { DropDownType, PageNames, ReturnOrderSuffix, ScreenName } from '../../enum/Common'
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'
import { TextInput } from 'react-native-gesture-handler'
import { useFreshRef } from '../../hooks/CommonHooks'
import _ from 'lodash'
import { ProductSection, ItemActionType } from '../../component/visits/ProductSection'
import moment from 'moment'
import IMG_EMPTY_CART from '../../../../assets/image/empty_List.svg'
import { checkPlaceOrderIsAvailable, onConfirm, onClearCart } from './OrderSummaryScreenViewModel'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'
import { BreadcrumbVisibility, Instrumentation } from '@appdynamics/react-native-agent'
import RevampTooltip from '../../component/visits/RevampTooltip'
import { VisitStatus } from '../../enum/VisitType'
import { CommonParam } from '../../../common/CommonParam'
import { appendLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import { formatWithTimeZone } from '../../../common/utils/TimeZoneUtils'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { BottomSelectModalHeaderStyles } from '../../component/common/BottomSelectModalHeader'
import BottomSelectModal, { returnModalProps } from '../../component/common/BottomSelectModal'
import OrderSummaryComponent from '../../component/order/OrderSummaryComponent'
import { useAppliedList, useReturnProduct } from '../MyDayScreen/ReturnProduct/ReturnProductScreen/ReturnProductHook'
import { ReturnProductList } from '../MyDayScreen/ReturnProduct/ReturnProductList/ReturnProductList'
import PONumberInput from '../../component/common/PONumberInput'
import { isTrueInDB } from '../../../common/utils/CommonUtils'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import GlobalModal from '../../component/common/GlobalModal'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ReturnProduct } from '../../interface/ReturnProduct'
import { PriceMissingCheckEffect } from '../MyDayScreen/MyDayHooks'
import { compareDateToToday } from '../../utils/CommonUtil'
import { useCalculateTotal } from '../../utils/ProductUtils'
import { CartDetail } from '../../interface/CartDetail'
import { StoreProduct } from '../../interface/StoreProduct'
import OrderService from '../../service/OrderService'
import VisitService from '../../service/VisitService'
import CartService from '../../service/CartService'
import PriceService from '../../service/PriceService'

interface OrderSummaryScreenProps {
    navigation: NavigationProp<any>
    route?: any
}
const styles = StyleSheet.create({
    ...commonStyle,
    ...BottomSelectModalHeaderStyles,
    marginBottom_30: {
        marginBottom: 30
    },
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    bottomContainer: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        flexDirection: 'row',
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10,
        zIndex: 9
    },
    reBtnCancel: {
        flexGrow: 1,
        width: '50%',
        backgroundColor: baseStyle.color.white,
        height: 60,
        borderRightWidth: 1,
        borderRightColor: baseStyle.color.modalBlack,
        ...commonStyle.alignCenter
    },
    textCancel: {
        color: baseStyle.color.purple,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_12
    },
    reBtnSave: {
        flexGrow: 1,
        width: '50%',
        backgroundColor: baseStyle.color.purple,
        height: 60,
        ...commonStyle.alignCenter
    },
    textSave: {
        color: baseStyle.color.white,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_12
    },
    deHeader: {
        flexDirection: 'row',
        paddingHorizontal: 22,
        justifyContent: 'space-between'
    },
    deTitle: {
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900,
        color: baseStyle.color.black
    },
    cardHeader: {
        paddingHorizontal: 22,
        marginVertical: 22,
        zIndex: 999
    },
    content: {
        backgroundColor: baseStyle.color.white,
        zIndex: 0,
        top: -60
    },
    textDeliveryDate: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        fontFamily: 'Gotham',
        color: baseStyle.color.titleGray,
        marginBottom: 10
    },
    deliveryContainer: {
        width: '55%',
        height: 50
    },
    chartTitleContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    expandContainer: {
        flex: 1,
        borderTopWidth: 1,
        borderTopColor: baseStyle.color.borderGray
    },
    expandTitle: {
        fontSize: baseStyle.fontSize.fs_18,
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_900,
        fontFamily: 'Gotham'
    },
    chevron_up: {
        ...commonStyle.chevron,
        borderColor: baseStyle.color.black,
        marginTop: 10,
        borderBottomWidth: 2,
        borderRightWidth: 2
    },
    chevron_down: {
        ...commonStyle.chevron,
        borderColor: baseStyle.color.black,
        borderTopWidth: 2,
        borderLeftWidth: 2
    },
    chevronUpBlue: {
        marginBottom: 5,
        width: 11,
        height: 11,
        borderColor: baseStyle.color.LightBlue,
        transform: [{ rotate: '-135deg' }],
        marginTop: 10,
        borderBottomWidth: 2,
        borderRightWidth: 2
    },
    chevronDownBlue: {
        marginBottom: 5,
        width: 11,
        height: 11,
        borderColor: baseStyle.color.LightBlue,
        transform: [{ rotate: '-135deg' }],
        borderTopWidth: 2,
        borderLeftWidth: 2
    },
    notesContainer: {
        flex: 1,
        borderBottomColor: baseStyle.color.borderGray,
        borderBottomWidth: 1,
        paddingBottom: 9
    },
    notesTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.titleGray,
        fontFamily: 'Gotham',
        fontWeight: baseStyle.fontWeight.fw_400,
        marginBottom: 11
    },
    headerMarginTop: {
        marginTop: 5
    },
    emptyCartTitle: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontFamily: 'Gotham',
        color: baseStyle.color.black,
        textAlign: 'center',
        marginBottom: 10
    },
    emptyCartMessage: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        fontFamily: 'Gotham',
        color: baseStyle.color.titleGray,
        textAlign: 'center',
        marginBottom: 20
    },
    emptyImageSize: {
        height: 205,
        width: 157,
        marginBottom: 38
    },
    greyBG: {
        height: 150,
        width: '100%',
        backgroundColor: baseStyle.color.bgGray,
        top: 0,
        right: 0,
        position: 'absolute'
    },
    topBgContainer: {
        height: 150,
        width: '100%',
        backgroundColor: baseStyle.color.bgGray,
        top: 0,
        right: 0,
        position: 'absolute',
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray
    },

    priceMissingErrorText: {
        fontSize: baseStyle.fontSize.fs_14,
        color: baseStyle.color.red,
        fontWeight: baseStyle.fontWeight.fw_400,
        marginLeft: 7
    }
})
const OrderSummaryScreen: FC<OrderSummaryScreenProps> = (props) => {
    const EDVRef = useRef(null)
    const openEDVPopup = (content?: any) => {
        EDVRef?.current?.openModalWithHideBackground(content)
    }
    const closeEDVPopup = () => {
        EDVRef?.current?.closeModal()
    }
    const { navigation, route } = props
    const store = route?.params?.store
    const storeId = store?.PlaceId
    const visitId = store?.Id
    const isFromCompletedVisit = route?.params?.isFromCompletedVisit
    const orderCartIdentifier = store.OrderCartIdentifier || store.VisitLegacyId
    const { cartData, setCartData, refresh, refreshOnGoingCartData, cartRef } = useCart(orderCartIdentifier)
    const { cartDetail, setCartDetail, refreshCartDetail } = useCartDetail(store, orderCartIdentifier)
    const isFocused = useIsFocused()
    const {
        prodLst: summaryProdLst,
        loading,
        setQuantity,
        setIsActive,
        setAllIsActive,
        setOffset,
        setNeedRefreshCursor,
        setEDV
    } = useProduct({
        searchStr: '',
        store,
        cartData,
        setCartData,
        pageName: PageNames.ORDER_SUMMARY,
        orderCartIdentifier,
        deliveryDate: cartDetail?.DeliveryDate
    })
    const {
        prodLst: returnProdLst,
        setCasePriceOrActiveReturn,
        setIsActive: setIsReturnActive,
        setApplyReturn,
        setAllIsActive: setIsReturnAllIsActive,
        setNeedRefreshCursor: refreshProductList
    } = useReturnProduct({
        searchStr: '',
        store,
        appliedList: [],
        setAppliedList: () => {},
        pageName: PageNames.ORDER_SUMMARY,
        isReturnOnly: false,
        deliveryDate: cartDetail?.DeliveryDate
    })
    const finalReturnProdLst = useCalculateTotal(returnProdLst, true)
    const { setAppliedListActiveReturn } = useAppliedList(store, '', false, cartDetail?.DeliveryDate)
    const [showModal, setShowModal] = useState(false)
    const [showRemoveModal, setShowRemoveModal] = useState(false)
    const [screenScrollEnabled, setScreenScrollEnabled] = useState(true)
    const [removeMsg, setRemoveMsg] = useState<string>('')
    const [notes, setNotes] = useState<string>('')
    const [notesRecordTime, setNotesRecordTime] = useState<number | null>(null)
    const { dropDownRef } = useDropDown()
    const setQuantityRef = useFreshRef(setQuantity)
    const setIsActiveRef = useFreshRef(setIsActive)
    const setIsReturnActiveRef = useFreshRef(setIsReturnActive)
    const setEDVRef = useFreshRef(setEDV)
    const returnRef = useRef(null)
    const currentOpenRowRef = useRef(null)
    const [enableResetScrollToCoords, setEnableResetScrollToCoords] = useState<boolean>(true)
    const setEnableResetScrollToCoordsRef = useFreshRef(setEnableResetScrollToCoords)
    const setAppliedListActiveReturnRef = useFreshRef(setAppliedListActiveReturn)
    const setCasePriceOrActiveReturnRef = useFreshRef(setCasePriceOrActiveReturn)
    const setApplyReturnRef = useFreshRef(setApplyReturn)
    const isPONumRequired = isTrueInDB(store?.Is_Customer_PO_Number_Required__c)
    const enableSingleUnitReturn = isTrueInDB(store?.Single_Unit_Return__c)
    const [PONumber, setPoNumber] = useState<string>('')
    const PONumberInputRef = useRef<any>(null)
    const [priceMissingCheck, setPriceMissingCheck] = useState(false)

    const [isModified, setIsModified] = useState(false)
    const [returnPriceMissingCheck, setReturnPriceMissingCheck] = useState(false)
    const [needRefreshCartAndRender, setNeedRefreshCartAndRender] = useState<boolean>(false)

    const onRemoveCartItem = async (id: string, prodName: string) => {
        try {
            global.$globalModal.openModal()
            const toDoLst = _.cloneDeep(cartData)
            const finalLst = toDoLst.filter((v) => v.Product2Id !== id || v.OrderCartIdentifier !== orderCartIdentifier)
            const toDelete = toDoLst.find((one) => one.Product2Id === id)
            setRemoveMsg(prodName + t.labels.PBNA_MOBILE_REMOVE_CART_ITEM_SUCCESS)
            toDelete &&
                (await CartService.removeSingleCartItem(
                    toDelete['Product2.Material_Unique_ID__c'] as string,
                    orderCartIdentifier
                ))
            setCartData(finalLst)
            setNeedRefreshCursor()
            setTimeout(() => {
                global.$globalModal.closeModal()
                setShowRemoveModal(true)
            }, 1000)
            setTimeout(() => {
                setShowRemoveModal(false)
            }, 3000)
        } catch (err) {
            global.$globalModal.closeModal()
            dropDownRef.current.alertWithType(DropDownType.ERROR, 'Remove Cart Item Fail', err)
        }
    }

    const onRemoveReturnCartItem = async (prod: ReturnProduct) => {
        try {
            global.$globalModal.openModal()
            const { cartItemSoupEntryId } = prod
            await CartService.retrieveCartItemBySoupEntryId(cartItemSoupEntryId)
            cartItemSoupEntryId && (await CartService.removeCartItemFromSoupBySingleSoupEntryId(cartItemSoupEntryId))
            refreshOnGoingCartData()
            refreshProductList()
            setIsModified(false)
        } catch (err) {
            global.$globalModal.closeModal()
        }
    }

    const onRemoveCartItemRef = useFreshRef(onRemoveCartItem)
    const onRemoveReturnItemRef = useFreshRef(onRemoveReturnCartItem)

    const onRefreshCartDataRef = useFreshRef(async () => {
        refreshOnGoingCartData()
    })
    const skuRefs = useRef([])

    useEffect(() => {
        CartService.getCartItemsWithReturnType(false, store.OrderCartIdentifier || store.VisitLegacyId).then(
            (results) => {
                if (results) {
                    const identifier =
                        (store.OrderCartIdentifier || store.VisitLegacyId) +
                        ReturnOrderSuffix.ONGOING_ORDER_MY_CART_BACKUP
                    AsyncStorage.setItem(identifier, JSON.stringify(results))
                }
            }
        )
    }, [cartRef.current])

    const ALL_PRODUCTS_INDEX = -1

    const initPage = async () => {
        const cartDetail = await refreshCartDetail()
        setNotes(cartDetail?.OrderNotes || '')
        setPoNumber(cartDetail?.Cust_Po_Id__c_Local || '')
        setNotesRecordTime(cartDetail?.OrderNotesTime || null)
        const relativeDelDate = cartDetail?.DeliveryDate ? compareDateToToday(cartDetail?.DeliveryDate) : -1
        // recalculate pricing for cur delivery date
        // two calls for normal products and add to ongoing returns
        await PriceService.recalculatePriceOnDeliveryDateChange(
            store.CustUniqId,
            orderCartIdentifier,
            relativeDelDate,
            ''
        )
        await PriceService.recalculatePriceOnDeliveryDateChange(
            store.CustUniqId,
            orderCartIdentifier,
            relativeDelDate,
            ReturnOrderSuffix.ONGOING_ORDER
        )
        setNeedRefreshCartAndRender(true)
    }

    useEffect(() => {
        if (needRefreshCartAndRender) {
            refresh()
            setNeedRefreshCursor()
            refreshProductList()
            setNeedRefreshCartAndRender(false)
        }
    }, [needRefreshCartAndRender])

    const saveCart = async () => {
        await OrderService.saveProductsToCart(store.PlaceId, cartRef.current, orderCartIdentifier)
        await OrderService.saveCartDetail(
            store.PlaceId,
            {
                ...(cartDetail as CartDetail),
                OrderNotes: notes,
                Cust_Po_Id__c_Local: PONumber,
                OrderNotesTime: notesRecordTime
            },
            orderCartIdentifier
        )
    }

    useEffect(() => {
        if (isFocused) {
            initPage()
        } else {
            setCartData([])
            setCartDetail(null)
        }
    }, [isFocused])

    useEffect(() => {
        const logMsg = `${CommonParam.GPID__c} has navigated to Order Summary at ${formatWithTimeZone(
            moment(),
            TIME_FORMAT.YMDTHMS,
            true,
            true
        )}`
        appendLog(Log.MOBILE_INFO, 'orderade:navigate to order summary page', logMsg)
    }, [])

    const resetPage = () => {
        refresh()
        setNotes('')
        setNotesRecordTime(null)
        setCartData([])
        setNeedRefreshCursor()
        refreshProductList()
    }

    const finalProdLst = !loading ? summaryProdLst : []

    const closeSectionOpenRow = (sectionIndex: number) => {
        finalProdLst.forEach((v, index) => {
            if (index !== sectionIndex) {
                skuRefs?.current?.[index]?.closeAllRow()
            }
        })
    }
    const showCollapseAll = finalProdLst.length > 0

    PriceMissingCheckEffect(cartData, orderCartIdentifier, setPriceMissingCheck, setReturnPriceMissingCheck)

    // check for price missing for return in js scope, because of price missing potentially could be not applied yet
    const notAppliedPriceMissing = useMemo(() => {
        return returnProdLst.some((pack) => {
            return pack.products.some((product: StoreProduct) => PriceService.checkProductPriceMissing(product, true))
        })
    }, [returnProdLst])

    const allOpened = !finalProdLst.find((one) => !one.isActive)

    const renderExpand = () => {
        if (_.isEmpty(summaryProdLst)) {
            return null
        }
        if (!_.isEmpty(finalProdLst)) {
            return (
                <View style={[styles.expandContainer]}>
                    <TouchableOpacity
                        onPress={() => {
                            setAllIsActive(!allOpened)
                            closeSectionOpenRow(ALL_PRODUCTS_INDEX)
                        }}
                    >
                        <View style={[styles.flexRowSpaceCenter, styles.paddingHorizontal_22, { paddingVertical: 25 }]}>
                            <CText style={styles.expandTitle}>{t.labels.PBNA_MOBILE_PRODUCT_SUMMARY}</CText>
                            <View style={[allOpened ? styles.chevron_up : styles.chevron_down]} />
                        </View>
                    </TouchableOpacity>
                </View>
            )
        }
    }

    const priceMissingJSX = (
        <View style={[commonStyle.flexDirectionRow]}>
            <MaterialCommunityIcons name="alert-circle" size={baseStyle.fontSize.fs_16} color={baseStyle.color.red} />
            <CText style={styles.priceMissingErrorText}>{t.labels.PBNA_MOBILE_PRICE_INPUT_MISSING}</CText>
        </View>
    )

    const renderReturnExpand = () => {
        if (_.isEmpty(returnProdLst)) {
            return null
        }
        if (!_.isEmpty(returnProdLst)) {
            const allOpened = !returnProdLst.find((one) => !one.isActive)
            return (
                <View style={[styles.expandContainer]}>
                    <TouchableOpacity
                        onPress={() => {
                            setIsReturnAllIsActive(!allOpened)
                            closeSectionOpenRow(ALL_PRODUCTS_INDEX)
                        }}
                    >
                        <View style={[styles.flexRowSpaceCenter, styles.paddingHorizontal_22, { paddingVertical: 25 }]}>
                            <View>
                                <CText style={styles.expandTitle}>{t.labels.PBNA_MOBILE_RETURNS}</CText>
                                {(returnPriceMissingCheck || notAppliedPriceMissing) && (
                                    <View style={styles.paddingTop_22}>{priceMissingJSX}</View>
                                )}
                            </View>
                            <View style={[allOpened ? styles.chevron_up : styles.chevron_down]} />
                        </View>
                    </TouchableOpacity>
                </View>
            )
        }
    }

    const emptyComponent = () => {
        if (_.isEmpty(returnProdLst) && _.isEmpty(finalProdLst)) {
            return (
                <View style={[styles.flex_1, styles.alignCenter]}>
                    <IMG_EMPTY_CART style={styles.emptyImageSize} />
                    <CText style={styles.emptyCartTitle}>{t.labels.PBNA_MOBILE_YOUR_CART_IS_EMPTY}</CText>
                    <CText style={styles.emptyCartMessage}>{t.labels.PBNA_MOBILE_EMPTY_CART_MESSAGE}</CText>
                </View>
            )
        }
    }
    const [selected, setSelected] = useState('')
    const submitDisabled = checkPlaceOrderIsAvailable(cartData)

    const closePage = async () => {
        const logMsg = `User clicked X from My Cart at ${formatWithTimeZone(moment(), TIME_FORMAT.YMDTHMS, true, true)}`
        Instrumentation.leaveBreadcrumb(logMsg, BreadcrumbVisibility.CRASHES_AND_SESSIONS)
        appendLog(Log.MOBILE_INFO, 'orderade: clicked X on my cart page', logMsg)
        await saveCart()
        const currentVisits = await VisitService.getCurrentVisitByVisitId(visitId)
        const currentVisit = currentVisits.length ? currentVisits[0] : null
        // remove backup cart data
        const returnMyCartOngoingIdentifier =
            (store.OrderCartIdentifier || store.VisitLegacyId) + ReturnOrderSuffix.ONGOING_ORDER_MY_CART_BACKUP
        await AsyncStorage.removeItem(returnMyCartOngoingIdentifier)
        if (
            currentVisit &&
            currentVisit.Status__c === VisitStatus.COMPLETE &&
            currentVisit.User__c !== CommonParam.userId
        ) {
            navigation.navigate('CompletedVisitScreen', {
                isGoBackToMyDay: true,
                storeId: store.PlaceId,
                visit: {
                    ...store,
                    Status: currentVisit.Status__c,
                    ActualStartTime: currentVisit.ActualVisitStartTime,
                    ActualEndTime: currentVisit.ActualVisitEndTime
                },
                isToday: isFromCompletedVisit
            })
        } else if (
            currentVisit &&
            currentVisit.Status__c === VisitStatus.IN_PROGRESS &&
            currentVisit.User__c !== CommonParam.userId
        ) {
            navigation.navigate('BCDMyVisitDetail', {
                visitId: store.Id,
                storeId: store.PlaceId,
                visit: {
                    ...store,
                    Status: currentVisit.Status__c,
                    ActualStartTime: currentVisit.ActualVisitStartTime,
                    ActualEndTime: currentVisit.ActualVisitEndTime
                }
            })
        } else {
            navigation.goBack()
        }
    }

    return (
        <View style={styles.flex_1}>
            <SafeAreaView style={styles.container}>
                <View style={styles.topBgContainer} />
                <View style={styles.deHeader}>
                    <CText style={styles.deTitle}>{t.labels.PBNA_MOBILE_ORDER_SUMMARY}</CText>
                    <View style={styles.flexDirectionRow}>
                        <RevampTooltip
                            navigation={navigation}
                            beforeNavigate={saveCart}
                            store={store}
                            returnRef={returnRef}
                            pageName={ScreenName.OrderSummaryScreen}
                        />
                        <TouchableOpacity
                            onPress={async () => {
                                if (isModified) {
                                    Alert.alert(
                                        t.labels.PBNA_MOBILE_ALL_CHANGES_WILL_BE_LOST_DO_YOU_WISH_TO_CONTINUE,
                                        '',
                                        [
                                            {
                                                text: `${t.labels.PBNA_MOBILE_CANCEL}`,
                                                onPress: () => {}
                                            },
                                            {
                                                text: `${t.labels.PBNA_MOBILE_YES}`,
                                                onPress: async () => {
                                                    closePage()
                                                }
                                            }
                                        ]
                                    )
                                } else {
                                    closePage()
                                }
                            }}
                        >
                            <BlueClear height={36} width={36} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.cardHeader]}>
                    <CustomerCard storeId={storeId} />
                </View>
                <KeyboardAwareFlatList
                    style={[styles.flex_1, styles.content]}
                    data={null}
                    renderItem={null}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={screenScrollEnabled}
                    ListHeaderComponent={
                        <View>
                            <View style={{ marginTop: 70 }}>
                                <View style={{ paddingHorizontal: 22 }}>
                                    <View style={styles.chartTitleContainer}>
                                        <View style={styles.deliveryContainer}>
                                            <CText style={styles.textDeliveryDate}>
                                                {t.labels.PBNA_MOBILE_DELIVERY_DATE}
                                            </CText>
                                            <CText style={[styles.font_16_700]}>
                                                {moment(cartDetail?.DeliveryDate).format('MMMM DD, YYYY')}
                                            </CText>
                                        </View>
                                        {isPONumRequired && (
                                            <PONumberInput
                                                cRef={PONumberInputRef}
                                                PONumber={PONumber}
                                                setPoNumber={setPoNumber}
                                                setIsModified={setIsModified}
                                            />
                                        )}
                                    </View>
                                    <View style={[styles.marginTop_20, styles.marginBottom_20]}>
                                        <OrderSummaryComponent cartData={cartData} AccountId={store?.AccountId} />
                                    </View>
                                    <View style={styles.marginBottom_30}>
                                        <View style={styles.notesContainer}>
                                            <CText style={styles.notesTitle}>{t.labels.PBNA_MOBILE_ORDER_NOTES}</CText>
                                            <TextInput
                                                scrollEnabled={false}
                                                placeholder={t.labels.PBNA_MOBILE_ORDER_NOTES_COMMENTS}
                                                placeholderTextColor={baseStyle.color.borderGray}
                                                value={notes}
                                                onChangeText={(text: string) => {
                                                    setNotes(text)
                                                    setNotesRecordTime(Date.now())
                                                }}
                                                editable
                                                multiline
                                            />
                                        </View>
                                    </View>
                                </View>
                                {renderExpand()}
                                <View
                                    style={[
                                        styles.flexRowSpaceBet,
                                        styles.alignItemsCenter,
                                        commonStyle.paddingHorizontal_22
                                    ]}
                                >
                                    {priceMissingCheck ? priceMissingJSX : <View />}
                                    {showCollapseAll && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                !_.isEmpty(finalProdLst) && setAllIsActive(!allOpened)
                                            }}
                                        >
                                            <View style={[styles.flexDirectionRow, styles.alignCenter]}>
                                                <CText
                                                    style={{
                                                        fontSize: baseStyle.fontSize.fs_12,
                                                        color: baseStyle.color.LightBlue,
                                                        fontWeight: baseStyle.fontWeight.fw_700,
                                                        marginRight: 5
                                                    }}
                                                >
                                                    {allOpened
                                                        ? t.labels.PBNA_MOBILE_COLLAPSE_ALL
                                                        : t.labels.PBNA_MOBILE_EXPAND_ALL}
                                                </CText>
                                                <View
                                                    style={[allOpened ? styles.chevronUpBlue : styles.chevronDownBlue]}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                            <FlatList
                                style={[styles.flexGrow_1, styles.bgWhite, styles.headerMarginTop]}
                                showsVerticalScrollIndicator={false}
                                data={finalProdLst}
                                keyExtractor={(item) => item.label}
                                renderItem={({ item, index }) => {
                                    const props = {
                                        item,
                                        setIsActiveRef,
                                        setQuantityRef,
                                        onRemoveCartItemRef,
                                        cartData,
                                        setScreenScrollEnabled,
                                        closeSectionOpenRow,
                                        currentOpenRowRef,
                                        openEDVPopup,
                                        closeEDVPopup,
                                        setEDVRef
                                    }
                                    return (
                                        <ProductSection
                                            cRef={(el) => (skuRefs.current[index] = el)}
                                            {...props}
                                            swipeAble
                                            sectionIndex={index}
                                            actionType={ItemActionType.ACTION_ORDER_SUMMARY}
                                        />
                                    )
                                }}
                                ListEmptyComponent={emptyComponent()}
                                removeClippedSubviews
                                initialNumToRender={8}
                                maxToRenderPerBatch={8}
                                updateCellsBatchingPeriod={100}
                                windowSize={15}
                                onEndReachedThreshold={0.3}
                                onEndReached={() => {
                                    setOffset()
                                }}
                            />
                            {renderReturnExpand()}
                            <FlatList
                                style={[styles.flexGrow_1, styles.bgWhite, styles.headerMarginTop]}
                                showsVerticalScrollIndicator={false}
                                data={finalReturnProdLst}
                                keyExtractor={(item) => item.label}
                                renderItem={({ item }) => {
                                    const props = {
                                        item,
                                        setIsActiveRef: setIsReturnActiveRef,
                                        setCasePriceOrActiveReturnRef,
                                        setAppliedListActiveReturnRef,
                                        setEnableResetScrollToCoordsRef,
                                        setApplyReturnRef,
                                        isReturnList: true,
                                        isMyCartPage: true,
                                        swipeAble: true,
                                        onRemoveCartItemRef: onRemoveReturnItemRef,
                                        setScreenScrollEnabled,
                                        currentOpenRowRef,
                                        onRefreshCartDataRef,
                                        setIsModified,
                                        enableSingleUnitReturn
                                    }
                                    return <ReturnProductList {...props} />
                                }}
                                removeClippedSubviews
                                initialNumToRender={8}
                                maxToRenderPerBatch={8}
                                updateCellsBatchingPeriod={100}
                                windowSize={15}
                                onEndReachedThreshold={0.3}
                                onEndReached={() => {
                                    setOffset()
                                }}
                            />
                        </View>
                    }
                    enableResetScrollToCoords={enableResetScrollToCoords}
                />
                <View style={[styles.bottomContainer, styles.marginBottom_30]}>
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(t.labels.PBNA_MOBILE_CLEAR_CART, t.labels.PBNA_MOBILE_CLEAR_CART_MESSAGE, [
                                {
                                    text: t.labels.PBNA_MOBILE_CANCEL
                                },
                                {
                                    text: t.labels.PBNA_MOBILE_CLEAN,
                                    onPress: async () => {
                                        setRemoveMsg(t.labels.PBNA_MOBILE_CLEAR_CART_SUCCESS)
                                        const logMsg = `User clicked "Clear Cart" at ${formatWithTimeZone(
                                            moment(),
                                            TIME_FORMAT.YMDTHMS,
                                            true,
                                            true
                                        )}`
                                        Instrumentation.leaveBreadcrumb(
                                            logMsg,
                                            BreadcrumbVisibility.CRASHES_AND_SESSIONS
                                        )
                                        appendLog(Log.MOBILE_INFO, 'orderade: clear cart', logMsg)
                                        // remove backup cart data
                                        const returnMyCartOngoingIdentifier =
                                            (store.OrderCartIdentifier || store.VisitLegacyId) +
                                            ReturnOrderSuffix.ONGOING_ORDER_MY_CART_BACKUP
                                        await AsyncStorage.removeItem(returnMyCartOngoingIdentifier)
                                        setIsModified(false)
                                        await onClearCart(
                                            storeId,
                                            dropDownRef,
                                            cartDetail,
                                            setShowRemoveModal,
                                            store.OrderCartIdentifier || store.VisitLegacyId,
                                            store
                                        )
                                        resetPage()
                                    }
                                }
                            ])
                        }}
                        style={styles.reBtnCancel}
                        disabled={submitDisabled}
                    >
                        <CText
                            style={[
                                styles.textCancel,
                                {
                                    color: submitDisabled ? baseStyle.color.borderGray : baseStyle.color.purple
                                }
                            ]}
                        >
                            {t.labels.PBNA_MOBILE_CLEAR_CART.toUpperCase()}
                        </CText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={async () => {
                            if (priceMissingCheck || returnPriceMissingCheck || notAppliedPriceMissing) {
                                Alert.alert(
                                    t.labels.PBNA_MOBILE_PRICE_INPUT_MISSING_POPUP,
                                    t.labels
                                        .PBNA_MOBILE_YOU_HAVE_ADDED_PRODUCTS_WITHOUT_A_PRICE_PLEASE_CHOOSE_A_PRICE_BEFORE_PROCEEDING
                                )
                                return
                            }
                            const volumeHurdleNotMetPackages = await PriceService.checkVolumeHurdleNotMetPackages(
                                cartData,
                                orderCartIdentifier
                            )
                            if (volumeHurdleNotMetPackages?.length) {
                                Alert.alert(
                                    t.labels.PBNA_MOBILE_VOLUME_HURDLE_NOT_MET,
                                    t.labels.PBNA_MOBILE_VOLUME_HURDLE_NOT_MET_MESSAGE +
                                        '\n\n' +
                                        volumeHurdleNotMetPackages.join('\n')
                                )
                                return
                            }
                            if (isPONumRequired && !PONumber) {
                                PONumberInputRef?.current?.promptPOInput()
                                return
                            }
                            Alert.alert(
                                t.labels.PBNA_MOBILE_ORDER_CONFIRMATION,
                                t.labels.PBNA_MOBILE_PLACE_ORDER_ALERT,
                                [
                                    { text: t.labels.PBNA_MOBILE_CANCEL },
                                    {
                                        text: t.labels.PBNA_MOBILE_PLACE,
                                        onPress: async () => {
                                            // we use cartData for final order submit
                                            // because the prodlst has pagination, only includes products from first 20 packages
                                            // remove backup cart data
                                            const returnMyCartOngoingIdentifier =
                                                (store.OrderCartIdentifier || store.VisitLegacyId) +
                                                ReturnOrderSuffix.ONGOING_ORDER_MY_CART_BACKUP
                                            await AsyncStorage.removeItem(returnMyCartOngoingIdentifier)
                                            await onConfirm({
                                                Store: store,
                                                CartData: cartData,
                                                Navigation: navigation,
                                                SetShowModal: setShowModal,
                                                DropDownRef: dropDownRef,
                                                Notes: notes,
                                                PONumber,
                                                CartDetail: cartDetail,
                                                IsFromCompletedVisit: isFromCompletedVisit,
                                                NotesRecordTime: notesRecordTime
                                            })
                                        }
                                    }
                                ]
                            )
                        }}
                        style={[
                            styles.reBtnSave,
                            {
                                backgroundColor: submitDisabled ? baseStyle.color.white : baseStyle.color.purple
                            }
                        ]}
                        disabled={submitDisabled}
                    >
                        <CText
                            style={[
                                styles.textSave,
                                {
                                    color: submitDisabled ? baseStyle.color.borderGray : baseStyle.color.white
                                }
                            ]}
                        >
                            {t.labels.PBNA_MOBILE_PLACE_ORDER}
                        </CText>
                    </TouchableOpacity>
                </View>
                <CModal
                    imgSrc={ImageSrc.IMG_SUCCESS_ICON}
                    showModal={showModal}
                    content={t.labels.PBNA_MOBILE_ORDERADE_PLACE_ORDER_SUCCESS}
                    disabled
                />
                <CModal imgSrc={ImageSrc.IMG_SUCCESS_ICON} showModal={showRemoveModal} content={removeMsg} disabled />
            </SafeAreaView>
            <BottomSelectModal {...returnModalProps(selected, setSelected, navigation, store, returnRef)} />
            <GlobalModal ref={EDVRef} />
        </View>
    )
}

export default OrderSummaryScreen

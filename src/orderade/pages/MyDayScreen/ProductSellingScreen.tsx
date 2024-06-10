import React, { FC, useState, useRef, useEffect, useMemo } from 'react'
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    GestureResponderEvent,
    Animated,
    ViewStyle,
    Alert
} from 'react-native'
import { NavigationProp, useIsFocused } from '@react-navigation/native'
import CText from '../../../common/components/CText'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { useProduct } from '../../hooks/ProductSellingHooks'
import _ from 'lodash'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ProductSection, ItemActionType } from '../../component/visits/ProductSection'
import { useDebounce, useFreshRef } from '../../hooks/CommonHooks'
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view/index'
import { useCart, useCartDetail } from '../../hooks/CartHooks'
import OrderCartComponent from '../../component/order/OrderCartComponent'
import DraggableHamburger, { HAMBURGER_ICON_SIZE, PositionType } from '../../component/visits/DraggableHamburger'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'
import CustomerCardCollapsed, { COLLAPESED_HEIGHT } from '../../component/order/CustomerCardCollpased'
import RevampTooltip from '../../component/visits/RevampTooltip'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import BottomSelectModal, { returnModalProps } from '../../component/common/BottomSelectModal'
import { BottomSelectModalHeaderStyles } from '../../component/common/BottomSelectModalHeader'
import EmptyListPlaceholder from '../../../common/components/EmptyListPlaceholder'
import CModal from '../../../common/components/CModal'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { PriceMissingCheckEffect } from './MyDayHooks'
import GlobalModal from '../../component/common/GlobalModal'
import ProductSellingHeader from './ProductSelling/ProductSellingHeader'
import { PageNames, ReturnOrderSuffix } from '../../enum/Common'
import DateDotCalendar from '../../component/common/DateDotCalendar'
import { compareDateToToday } from '../../utils/CommonUtil'
import { MyDayVisitModel } from '../../interface/MyDayVisit'
import { useFrequencyEffect } from './ProductSelling/ProductSellingHooks'
import OrderService from '../../service/OrderService'
import PriceService from '../../service/PriceService'
import ProductService from '../../service/ProductService'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
const AnimatedKeyboardAwareFlatList = Animated.createAnimatedComponent(KeyboardAwareFlatList)

const styles = StyleSheet.create({
    ...commonStyle,
    ...BottomSelectModalHeaderStyles,
    searchContainer: {
        flexDirection: 'column',
        marginTop: 20,
        marginBottom: 58
    },
    micIconContainer: {
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: baseStyle.color.LightBlue
    },
    searchBarContainer: {
        height: 36
    },
    searchInputContainer: {
        height: 36,
        marginTop: 0,
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
        padding: 0,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        flexShrink: 1
    },
    barCodeContainer: {
        height: 36,
        width: 36,
        borderRadius: 4,
        backgroundColor: baseStyle.color.LightBlue
    },
    chevron_up: {
        ...commonStyle.chevron,
        marginTop: 10,
        borderBottomWidth: 2,
        borderRightWidth: 2
    },
    chevron_down: {
        ...commonStyle.chevron,
        borderTopWidth: 2,
        borderLeftWidth: 2
    },
    chevron_up_black: {
        ...commonStyle.chevron,
        borderColor: baseStyle.color.black,
        borderBottomWidth: 2,
        borderRightWidth: 2
    },
    chevron_down_black: {
        ...commonStyle.chevron,
        borderColor: baseStyle.color.black,
        borderTopWidth: 2,
        borderLeftWidth: 2
    },
    accordionContain: {
        width: '100%',
        borderBottomWidth: 1,
        backgroundColor: '#FFF',
        borderBottomColor: '#D3D3D3',
        marginBottom: 100
    },
    accordionSize: {
        paddingVertical: 20,
        height: '40%',
        backgroundColor: '#FFF'
    },
    expandContainer: {
        height: 60,
        paddingHorizontal: 22,
        borderBottomColor: baseStyle.color.borderGray
    },
    width_p90: {
        width: '90%'
    },
    shoppingCartContainer: {
        height: 44,
        width: screenWidth * 0.47,
        paddingVertical: 12,
        backgroundColor: baseStyle.color.LightBlue,
        borderRadius: 6,
        borderColor: baseStyle.color.white,
        borderWidth: 1
    },
    midTitleContainer: {
        backgroundColor: baseStyle.color.black,
        height: 107,
        paddingVertical: 20
    },
    midButtonFloat: {
        alignSelf: 'flex-end',
        bottom: 35
    },
    packageVer: {
        marginVertical: 10
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
        height: 121,
        width: 161,
        marginBottom: 38
    },
    absoluteBase: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
    }
})

interface ProductSellingScreenProps {
    navigation: NavigationProp<any>
    route: any
}

export const renderExpand = (finalProdLst: any, setAllIsActive: Function, totalNum?: any, priceMissingCheck?: any) => {
    const allOpened = !finalProdLst.find((one) => !one.isActive) && !_.isEmpty(finalProdLst)

    if (finalProdLst.length) {
        return (
            <View
                style={[
                    styles.expandContainer,
                    styles.alignItemsEnd,
                    styles.justifyContentCenter,
                    (priceMissingCheck || totalNum) && styles.flexRowSpaceBet,
                    (priceMissingCheck || totalNum) && styles.alignItemsCenter,
                    {
                        borderBottomWidth: _.isEmpty(finalProdLst) ? 0 : 1,
                        backgroundColor: baseStyle.color.white
                    }
                ]}
            >
                {totalNum && <CText>{`${totalNum} ${t.labels.PBNA_MOBILE_PRODUCT_BRACES}`}</CText>}

                {priceMissingCheck && (
                    <View style={[styles.flexRowCenter]}>
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
                            {allOpened ? t.labels.PBNA_MOBILE_COLLAPSE_ALL : t.labels.PBNA_MOBILE_EXPAND_ALL}
                        </CText>
                        <View style={[allOpened ? styles.chevron_up : styles.chevron_down]} />
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
}

const ProductSellingScreen: FC<ProductSellingScreenProps> = (props: ProductSellingScreenProps) => {
    const { navigation, route } = props
    const store = route?.params?.store as MyDayVisitModel
    const isFromCompletedVisit = route?.params?.isFromCompletedVisit
    const [searchValue, setSearchValue] = useState('')
    const [searchStr, setSearchStr] = useState('')
    const [startDate, _setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isStartDate, setIsStartDate] = useState(true)
    const [headerFullHeight, setHeaderFullHeight] = useState<number>(0)
    const [searchbarHeight, setSearchBarHeight] = useState<number>(0)
    const [subHeaderHeight, setSubHeaderHeight] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(false)
    const [showDeactivateSuccessModal, setShowDeactivateSuccessModal] = useState(false)
    const [sucMessage, setSucMessage] = useState<string>('')
    const currentOpenRowRef = useRef(null)
    const [screenScrollEnabled, setScreenScrollEnabled] = useState(true)
    const orderCartIdentifier = store.OrderCartIdentifier || store.VisitLegacyId
    const { cartData, setCartData, refresh, cartRef } = useCart(orderCartIdentifier)
    const { cartDetail, setCartDetail, refreshCartDetail } = useCartDetail(store, orderCartIdentifier)
    const isFocused = useIsFocused()
    const { prodLst, setQuantity, setIsActive, setAllIsActive, setOffset, setNeedRefreshCursor, setEDV } = useProduct({
        searchStr,
        store,
        cartData,
        setCartData,
        pageName: PageNames.PROD_SELLING,
        orderCartIdentifier,
        setIsLoading,
        deliveryDate: startDate
    })
    const setQuantityRef = useFreshRef(setQuantity)
    const setIsActiveRef = useFreshRef(setIsActive)
    const setEDVRef = useFreshRef(setEDV)

    const insets = useSafeAreaInsets()
    const [scrollTop, setScrollTop] = useState<number>(0)
    const [hamburgerPosition, setHamburgerPosition] = useState<PositionType | null>(null)
    const animatedTranslateY = useRef(new Animated.Value(0)).current
    const [paddingBottom, setPaddingBottom] = useState<number>(0)
    const flatListRef = useRef<any>(null)
    const [priceMissingCheck, setPriceMissingCheck] = useState(false)
    const [needRefreshCartAndRender, setNeedRefreshCartAndRender] = useState<boolean>(false)

    useDebounce(() => setSearchStr(searchValue), 300, [searchValue])

    const hamburgerInitialPosition = { x: 22, y: -HAMBURGER_ICON_SIZE / 2 }
    const onDragRelease = (e: GestureResponderEvent) => {
        const { pageX, pageY, locationX, locationY } = e.nativeEvent
        setHamburgerPosition({
            x: pageX - locationX,
            y: pageY - locationY
        })
    }

    const EDVRef = useRef(null)
    const openEDVPopup = (content?) => {
        EDVRef?.current?.openModalWithHideBackground(content)
    }
    const closeEDVPopup = () => {
        EDVRef?.current?.closeModal()
    }
    const [calendarVisible, setCalendarVisible] = useState(false)
    const draggableHamburgerProps = {
        position: hamburgerPosition || hamburgerInitialPosition,
        navigation,
        store,
        disabledOption: 'HAMBURGER_SKU',
        cartData: cartData,
        cartDetailData: {
            ...cartDetail,
            DeliveryDate: startDate,
            NextDeliveryDate: endDate
        },
        initialOffsetTop: headerFullHeight - scrollTop,
        onDragRelease: !hamburgerPosition ? onDragRelease : undefined,
        setHamburgerPosition,
        isFromCompletedVisit
    }
    const saveCart = async (deliveryDate?: string, nextDeliveryDate?: string) => {
        await OrderService.saveProductsToCart(store.PlaceId as string, cartRef.current, orderCartIdentifier)
        await OrderService.saveCartDetail(
            store.PlaceId as string,
            {
                ...cartDetail,
                DeliveryDate: deliveryDate ?? startDate,
                NextDeliveryDate: nextDeliveryDate ?? endDate
            },
            orderCartIdentifier
        )
    }

    const setDeliveryDateAndRerender = async (deliveryDate: string, nextDeliveryDate: string, isInit?: boolean) => {
        _setStartDate(deliveryDate)
        setEndDate(nextDeliveryDate)
        if (!isInit) {
            await saveCart(deliveryDate, nextDeliveryDate)
        }
        const relativeDelDate = deliveryDate ? compareDateToToday(deliveryDate) : -1
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
        if (!isInit) {
            setCartData([])
        }

        setNeedRefreshCartAndRender(true)
    }

    const initPage = async () => {
        const cartDetail = await refreshCartDetail()
        const { DeliveryDate, NextDeliveryDate } = cartDetail
        setDeliveryDateAndRerender(DeliveryDate, NextDeliveryDate, true)
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
        // page must be refreshed when cart is cleared otherwise need cartItem won't reflect
        if (needRefreshCartAndRender && !cartData.length) {
            refresh()
            setNeedRefreshCursor()
            setNeedRefreshCartAndRender(false)
        }
    }, [needRefreshCartAndRender, cartData])

    PriceMissingCheckEffect(cartData, orderCartIdentifier, setPriceMissingCheck)

    const handleScrollEnd = (event: any) => {
        const curScrollTop = event.nativeEvent.contentOffset.y
        const newScrollTop = Math.min(curScrollTop, headerFullHeight - COLLAPESED_HEIGHT - insets.top)
        if (Math.abs(newScrollTop - scrollTop) > 1) {
            setScrollTop(newScrollTop)
        }
    }

    const onDeactivateClick = async (product: any) => {
        await ProductService.deactivateStoreProduct(product, store, setSucMessage)
        const toDoLst = _.cloneDeep(cartData)
        const finalLst = toDoLst.filter((v) => v.Product2Id !== product.ProductId)
        await OrderService.saveProductsToCart(store.PlaceId, finalLst, orderCartIdentifier)
        refresh()
        setNeedRefreshCursor()
        setShowDeactivateSuccessModal(true)
        setTimeout(() => {
            setShowDeactivateSuccessModal(false)
        }, 2000)
    }

    const onDeactivateClickRef = useFreshRef(onDeactivateClick)

    const finalProdLst = prodLst || []

    const animateMax = headerFullHeight - COLLAPESED_HEIGHT - insets.top - searchbarHeight

    const setExtraPadding = (height: number) => {
        let paddingBottomNeeded
        if (!finalProdLst.length) {
            paddingBottomNeeded = 0
        } else {
            paddingBottomNeeded = Math.max(screenHeight + animateMax - (height - paddingBottom), 0)
        }

        if (Math.abs(paddingBottom - paddingBottomNeeded) > 1) {
            setPaddingBottom(paddingBottomNeeded)
        }
    }

    const renderTitleContainer = useMemo(() => {
        return (
            <>
                <View style={{ position: 'relative', zIndex: 1 }}>
                    {!hamburgerPosition && <DraggableHamburger {...draggableHamburgerProps} />}
                </View>
                <View style={[styles.paddingHorizontal_22, styles.midTitleContainer, styles.justifyContentEnd]}>
                    <View style={[styles.flexRowSpaceCenter, styles.midButtonFloat]}>
                        <OrderCartComponent
                            cartData={cartData}
                            navigation={navigation}
                            store={store}
                            checkDeliveryDate={
                                (startDate && endDate) || (cartDetail?.DeliveryDate && cartDetail?.NextDeliveryDate)
                            }
                            cartDetail={{
                                ...cartDetail,
                                DeliveryDate: startDate,
                                NextDeliveryDate: endDate
                            }}
                            setHamburgerPosition={setHamburgerPosition}
                            isFromCompletedVisit={isFromCompletedVisit}
                            from={isFromCompletedVisit ? 'Completed Visit' : 'Product List'}
                        />
                    </View>
                    <View>
                        <CText style={[styles.font_24_900, styles.colorWhite]}>{t.labels.PBNA_MOBILE_PRODUCTS}</CText>
                    </View>
                </View>
            </>
        )
    }, [
        hamburgerInitialPosition,
        hamburgerPosition,
        navigation,
        store,
        cartData,
        cartDetail,
        startDate,
        endDate,
        headerFullHeight,
        scrollTop,
        onDragRelease,
        setHamburgerPosition,
        isFromCompletedVisit
    ])

    const renderEmptyListComponent = (isLoading: boolean) => {
        if (isLoading) {
            return <View />
        }
        if (finalProdLst.length) {
            return <View style={{ height: paddingBottom }} />
        }

        const title = searchStr ? t.labels.PBNA_MOBILE_NO_RESULTS : t.labels.PBNA_MOBILE_YOUR_LIST_IS_EMPTY
        const subTitle = searchStr ? t.labels.PBNA_MOBILE_SEARCH_NO_RESULT : t.labels.PBNA_MOBILE_LIST_EMPTY_MSG

        return (
            <EmptyListPlaceholder
                sourceImageUrl={ImageSrc.IMG_NOFILTER_PRODUCT}
                title={title}
                subTitle={subTitle}
                imageStyle={styles.emptyImageSize}
                containerExtraStyle={[
                    styles.alignCenter,
                    {
                        height: screenHeight - headerFullHeight - subHeaderHeight - insets.top
                    }
                ]}
            />
        )
    }
    const [selected, setSelected] = useState('')
    const returnRef = useRef(null)
    const productSellingHeaderProps = {
        isStartDate,
        startDate,
        endDate,
        setIsStartDate,
        setStartDate: setDeliveryDateAndRerender,
        setEndDate,
        navigation,
        saveCart,
        insetTop: insets.top,
        store,
        setSearchStr,
        searchValue,
        setSearchValue,
        setHeaderFullHeight,
        setSearchBarHeight,
        returnRef,
        calendarVisible,
        setCalendarVisible
    }

    const customerCardCollapsedProps = {
        storeId: store.PlaceId,
        store,
        parentInitialOffsetTop: headerFullHeight - searchbarHeight,
        paddingTop: insets.top + 5,
        actions: (
            <RevampTooltip
                navigation={navigation}
                beforeNavigate={saveCart}
                containerStyle={{ marginRight: 0 } as ViewStyle}
                store={store}
                returnRef={returnRef}
            />
        ),
        onGoBack: async () => {
            await saveCart()
            navigation.goBack()
        },
        animatedTranslateY
    }

    const onCalendarDone = (deliveryDate: string, nextDeliveryDate: string) => {
        Alert.alert(t.labels.PBNA_MOBILE_DELIVERY_DATE_CHANGE, t.labels.PBNA_MOBILE_DELIVERY_DATE_CHANGE_MSG, [
            {
                text: t.labels.PBNA_MOBILE_CANCEL
            },
            {
                text: t.labels.PBNA_MOBILE_YES_PROCEED,
                onPress: () => {
                    setDeliveryDateAndRerender(deliveryDate || '', nextDeliveryDate || '')
                }
            }
        ])
    }
    const [frequency, setFrequency] = useState(0)
    useFrequencyEffect(store.AccountId, setFrequency)

    const dateDotCalendarProps = {
        visible: calendarVisible,
        setVisible: setCalendarVisible,
        frequency,
        startDate,
        endDate,
        onCalendarDone
    }
    return (
        <View style={[styles.bgWhite, styles.flexGrow_1, { position: 'relative' }]}>
            <CustomerCardCollapsed {...customerCardCollapsedProps} />
            <Animated.View
                style={[
                    styles.absoluteBase,
                    {
                        zIndex: 1,
                        transform: headerFullHeight
                            ? [
                                  {
                                      translateY: animatedTranslateY.interpolate({
                                          inputRange: [0, animateMax],
                                          outputRange: [0, -animateMax],
                                          extrapolate: 'clamp'
                                      })
                                  }
                              ]
                            : []
                    }
                ]}
            >
                <ProductSellingHeader {...productSellingHeaderProps} />
            </Animated.View>
            <Animated.View
                style={
                    headerFullHeight
                        ? {
                              ...styles.absoluteBase,
                              top: headerFullHeight,
                              zIndex: 3,
                              transform: headerFullHeight
                                  ? [
                                        {
                                            translateY: animatedTranslateY.interpolate({
                                                inputRange: [0, animateMax],
                                                outputRange: [0, -animateMax],
                                                extrapolate: 'clamp'
                                            })
                                        }
                                    ]
                                  : []
                          }
                        : {}
                }
                onLayout={(event) => {
                    const { height } = event?.nativeEvent?.layout
                    setSubHeaderHeight(height)
                }}
            >
                {renderTitleContainer}
                {useMemo(
                    () => renderExpand(finalProdLst, setAllIsActive, null, priceMissingCheck),
                    [finalProdLst, setAllIsActive, priceMissingCheck]
                )}
            </Animated.View>
            <AnimatedKeyboardAwareFlatList
                ref={flatListRef}
                style={[styles.flexGrow_1, styles.bgWhite]}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={renderEmptyListComponent(isLoading)}
                onContentSizeChange={_.debounce(
                    (width, height) => {
                        // ensure the page can be scrolled up even with one product
                        setExtraPadding(height)
                    },
                    300,
                    { trailing: true }
                )}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: animatedTranslateY } } }], {
                    useNativeDriver: true
                })}
                ListHeaderComponent={<View style={{ height: headerFullHeight + subHeaderHeight }} />}
                data={finalProdLst}
                keyExtractor={(item) => item.label}
                scrollEnabled={screenScrollEnabled}
                renderItem={({ item, index }) => {
                    const props = {
                        item,
                        setIsActiveRef,
                        setQuantityRef,
                        onDeactivateClickRef,
                        sectionIndex: index,
                        currentOpenRowRef,
                        setScreenScrollEnabled,
                        openEDVPopup,
                        closeEDVPopup,
                        setEDVRef
                    }
                    return <ProductSection {...props} swipeAble actionType={ItemActionType.ACTION_PRODUCT_SKU_LIST} />
                }}
                removeClippedSubviews
                initialNumToRender={2}
                maxToRenderPerBatch={2}
                updateCellsBatchingPeriod={1000}
                onEndReachedThreshold={0.01}
                onEndReached={() => {
                    setOffset()
                }}
                onMomentumScrollEnd={handleScrollEnd}
                onScrollEndDrag={handleScrollEnd}
                scrollEventThrottle={0.01}
            />
            <View
                style={[
                    styles.absoluteBase,
                    {
                        zIndex: 5,
                        height: screenHeight
                    }
                ]}
                pointerEvents="box-none"
            >
                {hamburgerPosition && <DraggableHamburger {...draggableHamburgerProps} />}
            </View>
            <BottomSelectModal {...returnModalProps(selected, setSelected, navigation, store, returnRef)} />
            <CModal
                imgSrc={ImageSrc.IMG_SUCCESS_ICON}
                showModal={showDeactivateSuccessModal}
                content={sucMessage}
                disabled
            />
            <GlobalModal ref={EDVRef} />
            <DateDotCalendar {...dateDotCalendarProps} />
        </View>
    )
}

export default ProductSellingScreen

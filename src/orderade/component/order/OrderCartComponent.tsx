import React, { FC, useState, useRef } from 'react'
import { TouchableOpacity, StyleSheet, Dimensions, Alert, View } from 'react-native'
import CText from '../../../common/components/CText'
import IMG_CART from '../../../../assets/image/icon-cart-selling-page.svg'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { NavigationProp, useIsFocused } from '@react-navigation/native'
import { useCartPrice } from '../../hooks/CartHooks'
import { CartDetail } from '../../interface/CartDetail'
import { commonStyle } from '../../../common/styles/CommonStyle'
import _ from 'lodash'
import { t } from '../../../common/i18n/t'
import { MyDayVisitModel } from '../../interface/MyDayVisit'
import { BreadcrumbVisibility, Instrumentation } from '@appdynamics/react-native-agent'
import { appendLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import { formatWithTimeZone } from '../../../common/utils/TimeZoneUtils'
import moment from 'moment'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import CartService from '../../service/CartService'
import PriceService from '../../service/PriceService'
import OrderService from '../../service/OrderService'
import { ReturnCartItem } from '../../interface/ReturnProduct'

const screenWidth = Dimensions.get('window').width

interface OrderCartComponentProps {
    cartData: ReturnCartItem[]
    store: MyDayVisitModel
    navigation: NavigationProp<any>
    checkDeliveryDate?: boolean
    cartDetail?: CartDetail
    setHamburgerPosition: Function
    isFromCompletedVisit?: boolean
    from: string
}

const styles = StyleSheet.create({
    ...commonStyle,
    shoppingCartContainer: {
        height: 44,
        width: screenWidth * 0.53,
        maxWidth: screenWidth * 0.53,
        paddingVertical: 12,
        backgroundColor: baseStyle.color.LightBlue,
        borderRadius: 6,
        borderColor: baseStyle.color.white,
        borderWidth: 1
    },
    textAlignRight: {
        textAlign: 'right'
    },
    lineStyle: {
        width: 2,
        height: 22,
        backgroundColor: baseStyle.color.white,
        marginHorizontal: 8
    }
})

const OrderCartComponent: FC<OrderCartComponentProps> = (props) => {
    const {
        cartData,
        navigation,
        store,
        checkDeliveryDate,
        cartDetail,
        setHamburgerPosition,
        isFromCompletedVisit,
        from
    } = props
    const [clickCheck, setClickCheck] = useState(false)
    const { getGrandTotal, saleTotalQty, returnTotalCs, returnTotalUn } = useCartPrice(cartData, store?.AccountId)
    const isFocused = useIsFocused()
    const isTotalNegative = parseFloat(getGrandTotal()) < 0

    const handleCartPress = async (
        checkDeliveryDate: boolean,
        Id: string,
        cartData: ReturnCartItem[],
        cartDetail: CartDetail
    ) => {
        setClickCheck(true)
        const orderCartIdentifier = store.OrderCartIdentifier || store.VisitLegacyId
        if (!isFocused) {
            return
        }
        // no delivery day pop
        if (!checkDeliveryDate) {
            Alert.alert(t.labels.PBNA_MOBILE_ORDER_SUMMARY_NO_DELIVERY_DATE)
            setClickCheck(false)
            return
        }
        const checkUnitPriceEmpty = cartData
            .filter((item) => item.OrderCartIdentifier === orderCartIdentifier)
            .some((item) => {
                return CartService.checkCartItemPriceMissing(item, false)
            })
        // missing price pop
        if (checkUnitPriceEmpty) {
            Alert.alert(
                t.labels.PBNA_MOBILE_PRICE_INPUT_MISSING_POPUP,
                t.labels.PBNA_MOBILE_YOU_HAVE_ADDED_PRODUCTS_WITHOUT_A_PRICE_PLEASE_CHOOSE_A_PRICE_BEFORE_PROCEEDING
            )
            setClickCheck(false)
            return
        }

        const volumeHurdleNotMetPackages = await PriceService.checkVolumeHurdleNotMetPackages(
            cartData,
            orderCartIdentifier
        )
        // volume hurdle not met pop
        if (volumeHurdleNotMetPackages?.length) {
            Alert.alert(
                t.labels.PBNA_MOBILE_VOLUME_HURDLE_NOT_MET,
                t.labels.PBNA_MOBILE_VOLUME_HURDLE_NOT_MET_MESSAGE + '\n\n' + volumeHurdleNotMetPackages.join('\n')
            )
            setClickCheck(false)
            return
        }

        const logMsg = `User clicked on cart in visit: ${
            store.VisitLegacyId || store.OrderCartIdentifier
        } from ${from} at ${formatWithTimeZone(moment(), TIME_FORMAT.YMDTHMS, true, true)}`
        Instrumentation.leaveBreadcrumb(logMsg, BreadcrumbVisibility.CRASHES_AND_SESSIONS)
        appendLog(Log.MOBILE_INFO, 'orderade: clicked on cart', logMsg)
        await OrderService.saveProductsToCart(Id, cartData, orderCartIdentifier)
        if (cartDetail) {
            await OrderService.saveCartDetail(Id, cartDetail, orderCartIdentifier)
        }
        // reset hamburger position before leaving the page
        // but not letting the user to see the flicker
        setTimeout(() => {
            setHamburgerPosition(null)
        }, 300)
        navigation.navigate('OrderSummaryScreen', {
            store,
            isFromCompletedVisit
        })
        setClickCheck(false)
    }

    const cartPressRef = useRef(
        _.debounce(
            (checkDeliveryDate, Id, cartData, cartDetail) =>
                handleCartPress(checkDeliveryDate, Id, cartData, cartDetail),
            400,
            { leading: true, trailing: false }
        )
    )

    return (
        <TouchableOpacity
            disabled={clickCheck}
            onPress={async () => {
                cartPressRef.current(checkDeliveryDate, store.PlaceId, cartData, cartDetail)
            }}
            style={[styles.flexRowSpaceCenter, styles.paddingHorizontal_20, styles.shoppingCartContainer]}
        >
            <IMG_CART style={styles.size_20} />
            <View style={[styles.flexRowSpaceCenter]}>
                <View style={{ maxWidth: 80 }}>
                    <CText style={[styles.colorWhite, styles.font_12_700, styles.textAlignRight]}>
                        {`${saleTotalQty} ${t.labels.PBNA_MOBILE_QUANTITY_CS}`}
                    </CText>
                    <CText style={[styles.colorWhite, styles.font_12_700, styles.textAlignRight]} numberOfLines={1}>
                        {`${returnTotalCs} ${t.labels.PBNA_MOBILE_QUANTITY_CS} ${returnTotalUn} ${t.labels.PBNA_MOBILE_QUANTITY_UN}`}
                    </CText>
                </View>
                <View style={styles.lineStyle} />
                <View style={{ maxWidth: 80 }}>
                    <CText style={[styles.colorWhite, styles.font_12_700]} numberOfLines={1}>
                        {`${isTotalNegative ? '-' : ''}${t.labels.PBNA_MOBILE_ORDER_D}${
                            isTotalNegative ? getGrandTotal().replace(/^-/g, '') : getGrandTotal()
                        }`}
                    </CText>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default OrderCartComponent

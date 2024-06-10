import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { baseStyle } from '../../../common/styles/BaseStyle'
import CText from '../../../common/components/CText'
import { useCartPrice } from '../../hooks/CartHooks'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'

const styles = StyleSheet.create({
    ...commonStyle,
    container: {
        backgroundColor: baseStyle.color.bgGray,
        flex: 1,
        padding: 20,
        borderRadius: 6
    },
    title: {
        fontSize: baseStyle.fontSize.fs_12,
        fontFamily: 'Gotham',
        fontWeight: baseStyle.fontWeight.fw_400
    },
    summaryValue: {
        fontSize: baseStyle.fontSize.fs_14,
        fontFamily: 'Gotham',
        fontWeight: baseStyle.fontWeight.fw_700
    },
    textWarps: {
        maxWidth: '50%'
    },
    totalValue: {
        fontSize: baseStyle.fontSize.fs_18,
        fontFamily: 'Gotham',
        fontWeight: baseStyle.fontWeight.fw_900
    },
    textRed: {
        color: baseStyle.color.red
    }
})
interface OrderSummaryComponentProps {
    cartData: any[]
    AccountId: string
}

const OrderSummaryComponent: FC<OrderSummaryComponentProps> = (props) => {
    const { cartData, AccountId } = props
    const { totalQty, totalPrice, tax, getGrandTotal, saleTotalQty, returnTotalCs, returnTotalUn, returnTotalPrice } =
        useCartPrice(cartData, AccountId)

    const DESPOSITS = 0
    const CHARGES = 0
    const isTotalNegative = parseFloat(getGrandTotal()) < 0
    const returnTotalStyle = Number(returnTotalCs) < 0 || Number(returnTotalUn) > 0 ? styles.textRed : null
    const totalQtyStyle = totalQty >= 0 ? null : styles.textRed
    const totalPriceStyle = totalPrice >= 0 ? null : styles.textRed
    const totalValueStyle = isTotalNegative ? styles.textRed : null
    const returnTotalPriceStyle = returnTotalPrice > 0 ? styles.textRed : null

    return (
        <View style={styles.container}>
            <View style={[styles.flexRowSpaceCenter]}>
                <CText style={styles.title}>{t.labels.PBNA_MOBILE_ORDERED_DETAILS}</CText>
                <CText style={[styles.summaryValue, styles.textWarps]}>
                    {`${saleTotalQty} ${t.labels.PBNA_MOBILE_QUANTITY_CS}`}
                </CText>
            </View>
            <View style={[styles.flexRowSpaceCenter, { marginTop: 15 }]}>
                <CText style={styles.title}>{t.labels.PBNA_MOBILE_RETURNED_CASES}</CText>
                <CText style={[styles.summaryValue, styles.textWarps, returnTotalStyle]}>
                    {`${returnTotalCs} ${t.labels.PBNA_MOBILE_QUANTITY_CS} ${returnTotalUn} ${t.labels.PBNA_MOBILE_QUANTITY_UN}`}
                </CText>
            </View>
            <View style={[styles.flexRowSpaceCenter, { marginTop: 15 }]}>
                <CText style={styles.title}>{t.labels.PBNA_MOBILE_TOTAL_CASES}</CText>
                <CText style={[styles.summaryValue, styles.textWarps, totalQtyStyle]}>
                    {`${totalQty} ${t.labels.PBNA_MOBILE_QUANTITY_CS}`}
                </CText>
            </View>
            <View style={[styles.line, { marginVertical: 15 }]} />
            <View style={[styles.flexRowSpaceCenter, styles.marginBottom_15]}>
                <CText style={styles.title}>{t.labels.PBNA_MOBILE_TOTAL_NET}</CText>
                <CText style={[styles.summaryValue, styles.textWarps, totalPriceStyle]}>
                    {`${totalPrice < 0 ? '-' : ''}${t.labels.PBNA_MOBILE_ORDER_D}${
                        totalPrice < 0 ? totalPrice.toFixed(2).replace(/^-/g, '') : totalPrice.toFixed(2)
                    }`}
                </CText>
            </View>
            <View style={[styles.flexRowSpaceCenter, styles.marginBottom_15]}>
                <CText style={styles.title}>{t.labels.PBNA_MOBILE_TAXES}</CText>
                <CText style={[styles.summaryValue, styles.textWarps]}>
                    {`${t.labels.PBNA_MOBILE_ORDER_D + tax.toFixed(2)}`}
                </CText>
            </View>
            <View>
                <View style={[styles.flexRowSpaceCenter, styles.marginBottom_15]}>
                    <CText style={styles.title}>{t.labels.PBNA_MOBILE_DESPOSITS}</CText>
                    <CText style={[styles.summaryValue, styles.textWarps]}>
                        {`${t.labels.PBNA_MOBILE_ORDER_D + DESPOSITS.toFixed(2)}`}
                    </CText>
                </View>
                <View style={[styles.flexRowSpaceCenter, styles.marginBottom_15]}>
                    <CText style={styles.title}>{t.labels.PBNA_MOBILE_CHARGES}</CText>
                    <CText style={[styles.summaryValue, styles.textWarps]}>
                        {`${t.labels.PBNA_MOBILE_ORDER_D + CHARGES.toFixed(2)}`}
                    </CText>
                </View>
                <View style={[styles.flexRowSpaceCenter, styles.marginBottom_15]}>
                    <CText style={styles.title}>{t.labels.PBNA_MOBILE_RETURN_TOTAL}</CText>
                    <CText style={[styles.summaryValue, styles.textWarps, returnTotalPriceStyle]}>
                        {`${returnTotalPrice > 0 ? '-' : ''}$${returnTotalPrice.toFixed(2)}`}
                    </CText>
                </View>
            </View>
            <View style={[styles.flexRowSpaceCenter]}>
                <CText style={styles.totalValue}>{t.labels.PBNA_MOBILE_GRAND_TOTAL}</CText>
                <CText style={[styles.totalValue, styles.textWarps, totalValueStyle]}>
                    {`${isTotalNegative ? '-' : ''}${t.labels.PBNA_MOBILE_ORDER_D}${
                        isTotalNegative ? getGrandTotal().replace(/^-/g, '') : getGrandTotal()
                    }`}
                </CText>
            </View>
        </View>
    )
}

export default OrderSummaryComponent

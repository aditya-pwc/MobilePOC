/**
 * @description This component displays basic information for the following Order: OrderNumber\Order Date\Delivery Date\Planed Cases\Order Cases
 * @email qiulin.deng@pwc.com
 * @date 2023-06-27
 */

import React, { FC } from 'react'
import { View, StyleSheet } from 'react-native'
import CText from '../../../common/components/CText'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'
import moment from 'moment'
import { baseStyle } from '../../../common/styles/BaseStyle'
import OrderSummaryComponent from './OrderSummaryComponent'
import { isTrueInDB } from '../../../savvy/utils/CommonUtils'
import { ellipsisWithMaxSize } from '../../utils/CommonUtil'

const styles = StyleSheet.create({
    ...commonStyle,
    marginBottom_30: {
        marginBottom: 30
    },
    textDeliveryDate: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        fontFamily: 'Gotham',
        color: baseStyle.color.titleGray
    },
    notesContainer: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3',
        opacity: 0.6,
        paddingBottom: 15
    },
    notesTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.titleGray,
        fontFamily: 'Gotham',
        fontWeight: baseStyle.fontWeight.fw_400,
        marginBottom: 11
    },
    notesText: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black
    },
    textRed: {
        color: baseStyle.color.red
    }
})

interface OrderDetailPanelProps {
    order: any
    store: any
    totalOrderCases: string | number
    accountId: string
    summaryData: any[]
    returnData: { totalCases: number; totalUnits: number }
}

export const OrderDetailPanel: FC<OrderDetailPanelProps> = (props: OrderDetailPanelProps) => {
    const casesAndUnitsMaxSize = 5
    const { order, totalOrderCases, store, accountId, summaryData, returnData } = props
    const returnStyle =
        Number(returnData?.totalCases || 0) >= 0 && Number(returnData?.totalUnits || 0) <= 0 ? null : styles.textRed
    return (
        <View style={{ paddingHorizontal: 22 }}>
            <View style={styles.flexRowAlignCenter}>
                <View style={styles.halfWidth}>
                    <View style={styles.marginBottom_30}>
                        <CText style={styles.textDeliveryDate} numberOfLines={1}>
                            {t.labels.PBNA_MOBILE_ORDER_NUMBER || t.labels.PBNA_MOBILE_DASH}
                        </CText>
                        <CText style={styles.font_16_700}>{order?.OrderNumber || t.labels.PBNA_MOBILE_DASH}</CText>
                    </View>
                </View>
                <View style={styles.halfWidth}>
                    {isTrueInDB(store.Is_Customer_PO_Number_Required__c || 0) && (
                        <View style={styles.marginBottom_30}>
                            <CText style={styles.textDeliveryDate} numberOfLines={1}>
                                {t.labels.PBNA_MOBILE_PO_NUMBER || t.labels.PBNA_MOBILE_DASH}
                            </CText>
                            <CText style={styles.font_16_700} numberOfLines={1} ellipsizeMode="tail">
                                {order?.Cust_Po_Id__c}
                            </CText>
                        </View>
                    )}
                </View>
            </View>
            <View style={styles.flexRowAlignCenter}>
                <View style={styles.halfWidth}>
                    <View style={styles.marginBottom_30}>
                        <CText style={styles.textDeliveryDate}>{t.labels.PBNA_MOBILE_ORDER_DATE}</CText>
                        <CText style={styles.font_16_700}>
                            {moment(order?.EffectiveDate).format('MMMM DD, YYYY') || t.labels.PBNA_MOBILE_DASH}
                        </CText>
                    </View>
                </View>
                <View style={styles.halfWidth}>
                    <View style={styles.marginBottom_30}>
                        <CText style={styles.textDeliveryDate}>{t.labels.PBNA_MOBILE_DELIVERY_DATE}</CText>
                        <CText style={styles.font_16_700}>
                            {moment(order?.Dlvry_Rqstd_Dtm__c).format('MMMM DD, YYYY') || t.labels.PBNA_MOBILE_DASH}
                        </CText>
                    </View>
                </View>
            </View>
            <View style={styles.flexRowAlignCenter}>
                <View style={styles.flex_1}>
                    <View>
                        <CText style={styles.textDeliveryDate}>{t.labels.PBNA_MOBILE_PLANNED_CASES}</CText>
                        <CText style={styles.font_16_700}>{t.labels.PBNA_MOBILE_DASH}</CText>
                    </View>
                </View>
                <View style={styles.flex_1}>
                    <View>
                        <CText style={styles.textDeliveryDate}>{t.labels.PBNA_MOBILE_ORDERED_CASES}</CText>
                        <CText style={styles.font_16_700}>
                            {Number(totalOrderCases || 0) === 0
                                ? `${t.labels.PBNA_MOBILE_DASH}`
                                : `${Number(totalOrderCases || 0)} ${t.labels.PBNA_MOBILE_QUANTITY_CS}`}
                        </CText>
                    </View>
                </View>
                <View style={styles.flex_1}>
                    <View>
                        <CText style={styles.textDeliveryDate}>{t.labels.PBNA_MOBILE_RETURNS}</CText>
                        <CText style={[styles.font_16_700, returnStyle]}>
                            {Number(returnData?.totalCases || 0) === 0 && Number(returnData?.totalUnits || 0) === 0
                                ? `${t.labels.PBNA_MOBILE_DASH}`
                                : `${t.labels.PBNA_MOBILE_DASH}${ellipsisWithMaxSize(
                                      Math.abs(Number(returnData?.totalCases || 0)).toString(),
                                      casesAndUnitsMaxSize
                                  )} ${t.labels.PBNA_MOBILE_QUANTITY_CS} ${ellipsisWithMaxSize(
                                      Number(returnData?.totalUnits || 0).toString(),
                                      casesAndUnitsMaxSize
                                  )} ${t.labels.PBNA_MOBILE_QUANTITY_UN}`}
                        </CText>
                    </View>
                </View>
            </View>
            <View style={[styles.marginTop_30, styles.marginBottom_20]}>
                <OrderSummaryComponent cartData={summaryData} AccountId={accountId} />
            </View>
            <View>
                <View style={styles.notesContainer}>
                    <CText style={styles.notesTitle}>{t.labels.PBNA_MOBILE_ORDER_NOTES}</CText>
                    <CText style={styles.notesText}>{order?.Order_Notes__c || ''}</CText>
                </View>
            </View>
        </View>
    )
}

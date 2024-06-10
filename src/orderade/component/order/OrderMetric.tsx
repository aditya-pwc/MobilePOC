/**
 * @description Order Metric In My Day Screen Route Info tab
 * @author Sheng Huang
 * @date 2024-01-18
 */

import React, { FC } from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../common/components/CText'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { t } from '../../../common/i18n/t'
import ChevronSvg from '../../../../assets/image/ios-chevron-blue.svg'
import ChevronDisabledSvg from '../../../../assets/image/ios-chevron-disable.svg'
import { commonStyle } from '../../../common/styles/CommonStyle'
import WeekBar from '../../../common/components/WeekBar'
import { useAppDispatch, useAppSelector } from '../../../savvy/redux/ReduxHooks'
import {
    myDayRouteInfoLoadingSelector,
    myDayRouteInfoSelector,
    myDaySelectedDateSelector,
    MyDayTimeRangeEnum,
    myDayTimeRangeSelector,
    selectDate
} from '../../redux/slice/MyDaySlice'

const styles = StyleSheet.create({
    orderText: {
        fontWeight: baseStyle.fontWeight.fw_400,
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.borderGray
    },
    orderCount: {
        fontWeight: baseStyle.fontWeight.fw_900,
        fontSize: baseStyle.fontSize.fs_18,
        color: baseStyle.color.white,
        marginTop: 4
    },
    cardContainer: {
        marginTop: 22,
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    card: {
        height: 60,
        backgroundColor: baseStyle.color.white,
        borderRadius: 6,
        width: '31%',
        padding: 10
    },
    cardText: {
        fontWeight: baseStyle.fontWeight.fw_400,
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.black
    },
    cardCount: {
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_16,
        color: baseStyle.color.black,
        marginTop: 4
    },
    chevronStyle: {
        transform: [{ rotate: '90deg' }],
        left: 5
    },
    marginTop_4: {
        marginTop: 4
    }
})

interface OrderMetricProps {
    isTodaySelected: boolean
    selectedDate: string
}

const cardData = [
    {
        key: 'WorkOrders',
        title: t.labels.PBNA_MOBILE_WORK_ORDERS,
        count: '1/2'
    },
    {
        key: 'Equipment',
        title: t.labels.PBNA_MOBILE_EQUIPMENT,
        count: '3'
    },
    {
        key: 'TempMerch',
        title: t.labels.PBNA_MOBILE_TEMP_MERCH,
        count: '1'
    }
]

const cardDataDisabled = {
    [MyDayTimeRangeEnum.Past]: { WorkOrders: false, Equipment: true, TempMerch: true },
    [MyDayTimeRangeEnum.Today]: { WorkOrders: false, Equipment: false, TempMerch: false },
    [MyDayTimeRangeEnum.Future]: { WorkOrders: false, Equipment: false, TempMerch: true }
}

const OrderMetric: FC<OrderMetricProps> = (props: OrderMetricProps) => {
    const { isTodaySelected } = props
    const metricData = useAppSelector(myDayRouteInfoSelector)
    const timeRangeIndex = useAppSelector(myDayTimeRangeSelector)
    const selectedDate = useAppSelector(myDaySelectedDateSelector)
    const isLoading = useAppSelector(myDayRouteInfoLoadingSelector)
    const dispatch = useAppDispatch()

    const judgeDisabled = (key: string) => {
        return cardDataDisabled[timeRangeIndex][key]
    }
    const renderCard = (data) => {
        const disabled = judgeDisabled(data.key)
        return (
            <TouchableOpacity style={styles.card} onPress={data.onPress} disabled={disabled}>
                <View style={commonStyle.flexRowSpaceCenter}>
                    <View>
                        <CText style={[styles.cardText, disabled && { color: baseStyle.color.borderGray }]}>
                            {data.title}
                        </CText>
                        <CText style={[styles.cardCount, disabled && { color: baseStyle.color.borderGray }]}>
                            {disabled ? '-' : data.count}
                        </CText>
                    </View>
                    {disabled ? (
                        <ChevronDisabledSvg width={15} height={20} style={styles.chevronStyle} />
                    ) : (
                        <ChevronSvg width={15} height={20} style={styles.chevronStyle} />
                    )}
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View>
            {!isTodaySelected && (
                <View style={{ marginTop: -6 }}>
                    <WeekBar
                        timeRangeIndex={timeRangeIndex}
                        selectedDate={selectedDate}
                        onPressDay={(item: any) => {
                            dispatch(selectDate(item.date))
                        }}
                    />
                </View>
            )}
            <View style={{ flexDirection: 'row', marginTop: 22 }}>
                <View style={{ alignItems: 'flex-start', flex: 1 }}>
                    <CText style={styles.orderText}>{t.labels.PBNA_MOBILE_METRICS_ORDERS}</CText>
                    {isLoading ? (
                        <ActivityIndicator style={styles.marginTop_4} />
                    ) : (
                        <CText style={styles.orderCount}>
                            {metricData.orders.completed}/{metricData.orders.planned}
                        </CText>
                    )}
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                    <CText style={styles.orderText}>{t.labels.PBNA_MOBILE_ORDER_DELIVERY}</CText>
                    {isLoading ? (
                        <ActivityIndicator style={styles.marginTop_4} />
                    ) : (
                        <CText style={styles.orderCount}>
                            {metricData.delivery.completed}/{metricData.delivery.planned}
                        </CText>
                    )}
                </View>
                <View style={{ alignItems: 'flex-end', flex: 1 }}>
                    <CText style={styles.orderText}>{t.labels.PBNA_MOBILE_MERCHANDISING}</CText>
                    {isLoading ? (
                        <ActivityIndicator style={styles.marginTop_4} />
                    ) : (
                        <CText style={styles.orderCount}>
                            {metricData.merchandising.completed}/{metricData.merchandising.planned}
                        </CText>
                    )}
                </View>
            </View>
            <View style={styles.cardContainer}>
                {cardData.map((value) => {
                    return renderCard(value)
                })}
            </View>
        </View>
    )
}

export default OrderMetric

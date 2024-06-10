import { View, StyleSheet } from 'react-native'
import CText from '../../../common/components/CText'
import React from 'react'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'

const styles = StyleSheet.create({
    viewMetricView: {
        zIndex: 100
    },
    address: {
        flexDirection: 'row',
        marginTop: 27,
        justifyContent: commonStyle.justifyContentSB.justifyContent
    },
    addressLabel: {
        color: '#D3D3D3',
        fontSize: 12
    },
    timeRowText: {
        marginTop: 4,
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12
    },
    addressCount: {
        flexDirection: 'row',
        justifyContent: commonStyle.justifyContentSB.justifyContent,
        marginTop: 4
    },
    addressCountText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 18
    },
    timeRow: {
        marginTop: 25,
        flexDirection: 'row',
        justifyContent: commonStyle.justifyContentSB.justifyContent
    },
    timeRowColFirst: {
        flex: 0.33
    },
    timeRowColSecond: {
        flex: 0.33,
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftColor: '#D3D3D3',
        borderLeftWidth: 1,
        borderRightColor: '#D3D3D3',
        borderRightWidth: 1
    },
    timeRowColThird: {
        flex: 0.33,
        justifyContent: 'center',
        alignItems: 'center'
    },
    alignLeft: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingLeft: 20
    }
})

export interface VisitStatusTotal {
    total: number
    completed: number
    remaining: number
}

interface TimeInfoProps {
    routeTime: number
    serviceTime: number
    driveTime: number
    routeTimeString?: string
    serviceTimeString?: string
    driveTimeString?: string
}

export interface TodayMetricFrontProps {
    totalNum: number
    completeNum: number
    remainNum: number
    orderTotalNum: number
    orderCompleteNum: number
}

export interface SalesRepTopLineMetricsProp {
    plannedCases: null | number
    casesSold: null | number | undefined
    returnsCS: null | number
    returnsUN: null | number
    visitNum?: null | string
    visitDenominator?: null | string
    orderNum?: null | string
    orderDenominator?: null | string
    salesRoute?: null | string
    nationalRoute?: null | string
}

export interface TodayMetricProps {
    statusTotal: VisitStatusTotal
    timeInfo?: TimeInfoProps
    caseInfo?: SalesRepTopLineMetricsProp
}

interface VisitMetricProps {
    metricData: TodayMetricProps
    showMetric?: boolean
}

export const renderMyVisitMetricCase = (data: any, showMetric = true) => {
    if (!data || !showMetric) {
        return null
    }

    const casesSold = data.casesSold ? parseFloat(data.casesSold) : 0

    return (
        <View style={styles.timeRow}>
            <View style={styles.timeRowColFirst}>
                <CText style={styles.addressLabel}>{t.labels.PBNA_MOBILE_PLANNED_CASES}</CText>
                <CText style={styles.timeRowText}>{t.labels.PBNA_MOBILE_DASH}</CText>
            </View>
            <View style={[styles.timeRowColSecond, styles.alignLeft]}>
                <CText style={styles.addressLabel}>{t.labels.PBNA_MOBILE_CASES_SOLD}</CText>
                <CText style={styles.timeRowText}>
                    {casesSold + ` ${t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}`}
                </CText>
            </View>
            <View style={[styles.timeRowColThird, styles.alignLeft]}>
                <CText style={[styles.addressLabel, { marginRight: 5 }]}>{t.labels.PBNA_MOBILE_RETURNS}</CText>
                <CText style={styles.timeRowText}>{t.labels.PBNA_MOBILE_DASH}</CText>
            </View>
        </View>
    )
}

const VisitMetric = (props: VisitMetricProps) => {
    if (!props || !props.metricData) {
        return null
    }

    const { showMetric } = props
    const { caseInfo } = props?.metricData
    const totalNum = props?.metricData?.statusTotal?.total || 0
    const completeNum = props?.metricData?.statusTotal?.completed || 0
    const remainNum = props?.metricData?.statusTotal?.remaining || 0

    return (
        <View style={styles.viewMetricView}>
            <View style={styles.address}>
                <CText style={styles.addressLabel}>{t.labels.PBNA_MOBILE_TOTAL_VISIT}</CText>
                <CText style={styles.addressLabel}>{t.labels.PBNA_MOBILE_COMPLETED}</CText>
                <CText style={styles.addressLabel}>{t.labels.PBNA_MOBILE_REMAINING}</CText>
            </View>
            <View style={styles.addressCount}>
                <CText style={styles.addressCountText}>{totalNum}</CText>
                <CText style={styles.addressCountText}>{completeNum}</CText>
                <CText style={styles.addressCountText}>{remainNum}</CText>
            </View>
            {renderMyVisitMetricCase(caseInfo, showMetric)}
        </View>
    )
}

export default VisitMetric

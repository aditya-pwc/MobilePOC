/*
 * @Date: 2022-01-24 21:21:23
 * @LastEditors: Yi Li
 * @LastEditTime: 2022-05-17 03:03:13
 */
import React, { memo } from 'react'
import { View, StyleSheet } from 'react-native'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import SkeletonPlaceholder from '../../../common/SkeletonPlaceholder'
import CText from '../../../../../common/components/CText'
import { t } from '../../../../../common/i18n/t'
import { useMetricsData } from './MetricsHelper'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

export interface SalesRepTopLineMetricsProp {
    plannedCases: null | string
    casesSold: null | string
    returnsCS: null | string
    returnsUN: null | string
    visitNum: null | string
    visitDenominator: null | string
    orderNum: null | string
    orderDenominator: null | string
    salesRoute: null | string
    nationalRoute: null | string
}

const styles = StyleSheet.create({
    topContainer: {
        height: 90,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 22,
        paddingVertical: 24
    },
    bottomContainer: {
        height: 60,
        flexDirection: 'row',
        paddingHorizontal: 22,
        paddingTop: 23,
        paddingBottom: 22
    },
    infoText: {
        fontSize: 12,
        color: baseStyle.color.black,
        paddingBottom: 6,
        lineHeight: 16
    },
    detailText: {
        fontSize: 12,
        lineHeight: 14
    },
    boldText: {
        fontSize: 16,
        fontWeight: baseStyle.fontWeight.fw_700,
        lineHeight: 20
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30
    },
    loadingItem: {
        width: 95,
        height: 32,
        borderRadius: 4
    },
    loadingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    paddingHorizontal_22: {
        paddingHorizontal: 22
    },
    dividerStyle: {
        height: 1,
        width: 'auto',
        backgroundColor: baseStyle.color.liteGrey
    },
    verticalDividerStyle: {
        width: 1,
        height: '100%',
        marginHorizontal: 4,
        backgroundColor: baseStyle.color.liteGrey
    },
    whiteBg: {
        backgroundColor: baseStyle.color.white
    },
    bottomTextStyle: {
        fontSize: 12,
        flex: 1
    },
    marginLeftAuto: {
        marginLeft: 'auto'
    },
    flexDirRowFlex1: {
        ...commonStyle.flex_1,
        ...commonStyle.flexDirectionRow
    },
    routeText: {
        flex: 1,
        fontSize: 12,
        color: baseStyle.color.titleGray
    },
    nationalText: {
        fontSize: 12,
        marginRight: 5
    },
    salesText: {
        fontSize: 12
    },
    loadingInnerContainer: {
        marginHorizontal: 22,
        flex: 1
    },
    emptyItemHeight_1: {
        height: 1,
        marginTop: 25,
        width: '100%',
        borderRadius: 4
    },
    emptyItemHeight_12: {
        height: 12,
        marginTop: 30,
        width: '100%',
        borderRadius: 4
    }
})

const Divider = () => (
    <View style={styles.paddingHorizontal_22}>
        <View style={styles.dividerStyle} />
    </View>
)
const VerticalDivider = () => <View style={styles.verticalDividerStyle} />

function SalesScheduleTopLineMetrics(data: SalesRepTopLineMetricsProp) {
    /*
     * Pure Component without side effect, DataSource: { withMetricsData } from './metricProvider'
     * Sales rep schedule execution - top line metrics
     */

    return (
        <View style={styles.whiteBg}>
            <View style={styles.topContainer}>
                <View style={commonStyle.flex_1}>
                    <CText style={[styles.infoText, commonStyle.textAlignLeft]}>
                        {t.labels.PBNA_MOBILE_PLANNED_CASES}
                    </CText>
                    <CText style={[styles.boldText, commonStyle.textAlignLeft]}>
                        {data.plannedCases
                            ? parseFloat(data.plannedCases) + ` ${t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}`
                            : '-'}
                    </CText>
                </View>

                <View style={commonStyle.flex_1}>
                    <CText style={[styles.infoText, commonStyle.textAlignCenter]}>
                        {t.labels.PBNA_MOBILE_CASES_SOLD}
                    </CText>
                    <CText style={[styles.boldText, commonStyle.textAlignCenter]}>
                        {data.casesSold
                            ? parseFloat(data.casesSold) + ` ${t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}`
                            : '-'}
                    </CText>
                </View>

                <View style={commonStyle.flex_1}>
                    <CText style={[styles.infoText, commonStyle.textAlignRight]}>{t.labels.PBNA_MOBILE_RETURNS}</CText>
                    <CText style={[styles.boldText, commonStyle.textAlignRight]}>
                        {(data.returnsCS &&
                            parseFloat(data.returnsCS) +
                                ` ${t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}` +
                                ' ') +
                            (data.returnsUN &&
                                parseFloat(data.returnsUN) + ` ${t.labels.PBNA_MOBILE_ORDER_UN.toLocaleLowerCase()}`) ||
                            '-'}
                    </CText>
                </View>
            </View>

            <Divider />

            <View style={styles.bottomContainer}>
                <View style={styles.flexDirRowFlex1}>
                    <CText style={styles.bottomTextStyle}>
                        {(data.visitNum || 0) + '/' + (data.visitDenominator || 0)}
                        {' ' + t.labels.PBNA_MOBILE_VISITS}
                    </CText>

                    <VerticalDivider />

                    <CText style={styles.bottomTextStyle} numberOfLines={1} ellipsizeMode={'tail'}>
                        {(data.orderNum || 0) + '/' + (data.orderDenominator || 0) + ' '}
                        {' ' + t.labels.PBNA_MOBILE_DELIVERY_ORDERS}
                    </CText>
                </View>
                <View style={[styles.marginLeftAuto, styles.flexDirRowFlex1]}>
                    <CText style={styles.routeText} numberOfLines={1} ellipsizeMode={'tail'}>
                        {t.labels.PBNA_MOBILE_LOC_ROUTE + ' '}
                    </CText>
                    <CText style={styles.salesText}>{data.salesRoute || '-'}</CText>

                    <VerticalDivider />

                    <CText style={styles.routeText} numberOfLines={1} ellipsizeMode={'tail'}>
                        {t.labels.PBNA_MOBILE_NATIONAL_ID + ' '}
                    </CText>
                    <CText style={styles.nationalText}>{data.nationalRoute || '-'}</CText>
                </View>
            </View>
        </View>
    )
}

export function LoadingView() {
    return (
        <View style={styles.whiteBg}>
            <SkeletonPlaceholder>
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingInnerContainer}>
                        <View style={styles.loadingBox}>
                            <View style={styles.loadingItem} />
                            <View style={styles.loadingItem} />
                            <View style={styles.loadingItem} />
                        </View>
                        <View style={styles.emptyItemHeight_1} />
                        <View style={styles.emptyItemHeight_12} />
                    </View>
                </View>
            </SkeletonPlaceholder>
        </View>
    )
}
const memoComponent = memo(SalesScheduleTopLineMetrics)
const RenderMetrics = ({ userId, date, routeId }) => useMetricsData(memoComponent, userId, date, routeId)
export default RenderMetrics

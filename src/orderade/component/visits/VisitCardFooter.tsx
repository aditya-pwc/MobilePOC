/**
 * @description Visit or store list component.
 * @author Christopher
 * @email jiahua.zang@pwc.com
 * @date 2021-08-06
 */

import React from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import CText from '../../../common/components/CText'
import IndicatorIcon from './IndicatorIcon'
import { t } from '../../../common/i18n/t'

const styles = StyleSheet.create({
    boxFooter: {
        flexDirection: 'row',
        backgroundColor: '#F2F4F7',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    borderBottom: {
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6
    },
    footer: {
        width: '100%',
        height: 40,
        paddingLeft: 14,
        paddingRight: 14
    },
    boxFooterView: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    imageVan: {
        width: 24,
        height: 16
    },
    upcomingText: {
        color: '#565656',
        marginLeft: 7,
        marginRight: 7
    },
    workOrderLabel: {
        color: '#000000',
        marginRight: 7
    },
    workOrderCount: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: '#D3D3D3',
        backgroundColor: '#FFF'
    },
    workOrderCountText: {
        lineHeight: 20,
        textAlign: 'center',
        color: '#000000',
        fontSize: 12
    },
    boldText: {
        fontWeight: 'bold'
    }
})
interface VisitCardFooterInterface {
    item: any
    haveDelivery: boolean
    haveOpenStatus: boolean
    showCompletedWO?: boolean
    deliveryInfo?: {
        totalCertified: any
        totalDelivered: any
        totalOrdered: any
    }
}

const VisitCardFooter = (props: VisitCardFooterInterface) => {
    const { item, haveDelivery, haveOpenStatus, deliveryInfo, showCompletedWO } = props

    const showWorkOrders = item.WorkOrders > 0 || item.CompletedWorkOrders > 0

    return (
        <View style={[styles.boxFooter]}>
            {(haveDelivery || showWorkOrders) && (
                <View
                    style={[
                        styles.boxFooter,
                        styles.footer,
                        !item.ActualStartTime && !item.ActualEndTime && styles.borderBottom
                    ]}
                >
                    {haveDelivery && (
                        <View style={styles.boxFooterView}>
                            <Image style={styles.imageVan} source={ImageSrc.IMG_DELIVERY_VAN_ICON} />
                            <CText style={styles.upcomingText}>
                                {haveOpenStatus
                                    ? t.labels.PBNA_MOBILE_CD_UPCOMING_DELIVERY
                                    : t.labels.PBNA_MOBILE_CD_DELIVERY_COMPLETE}
                            </CText>
                            <IndicatorIcon
                                haveOpenStatus={haveOpenStatus}
                                totalCertified={deliveryInfo?.totalCertified || 0}
                                totalDelivered={deliveryInfo?.totalDelivered || 0}
                                totalOrdered={deliveryInfo?.totalOrdered || 0}
                            />
                        </View>
                    )}

                    {showWorkOrders && (
                        <View style={[styles.boxFooterView]}>
                            <CText style={styles.workOrderLabel}>{t.labels.PBNA_MOBILE_WORK_ORDERS}</CText>

                            {!showCompletedWO && (
                                <View style={styles.workOrderCount}>
                                    <CText style={[styles.workOrderCountText, styles.boldText]}>
                                        {item.workOrders}
                                    </CText>
                                </View>
                            )}

                            {showCompletedWO && (
                                <CText style={[styles.workOrderCountText]}>
                                    {item.CompletedWorkOrders}/{item.CompletedWorkOrders + item.workOrders}
                                </CText>
                            )}
                        </View>
                    )}
                </View>
            )}
        </View>
    )
}

export default VisitCardFooter

/**
 * @description Visit or store list component.
 * @author Christopher
 * @email jiahua.zang@pwc.com
 * @date 2021-08-06
 */

import React from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { t } from '../../../common/i18n/t'
import CText from '../../../common/components/CText'
import IndicatorIcon from './IndicatorIcon'
const styles = StyleSheet.create({
    contentText: {
        flexShrink: 1,
        flexDirection: 'column'
    },
    imgNew: {
        width: 45,
        height: 22,
        position: 'absolute',
        top: 0,
        left: 0
    },
    itemTile: {
        fontWeight: '900',
        fontSize: 18,
        color: '#000',
        alignSelf: 'flex-start'
    },
    imageCall: {
        marginLeft: 10
    },
    itemSubTile: {
        fontSize: 12,
        color: '#565656',
        flexWrap: 'wrap',
        marginTop: 5,
        alignSelf: 'flex-start'
    },
    imageLocation: {
        width: 18,
        height: 21,
        alignSelf: 'flex-end',
        marginLeft: 10
    },

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
    borderMMModalBottom: {
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
    imgCircle: {
        width: 20,
        height: 20
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
    fromMMModal: boolean
    isVisitList: boolean
    haveDelivery: boolean
    haveOpenStatus: boolean
    fromEmployeeSchedule: boolean
    showCompletedWO?: boolean
    deliveryInfo: {
        totalCertified: any
        totalDelivered: any
        totalOrdered: any
    }
}

const VisitCardFooter = (props: VisitCardFooterInterface) => {
    const {
        item,
        isVisitList,
        fromMMModal,
        haveDelivery,
        haveOpenStatus,
        fromEmployeeSchedule,
        deliveryInfo,
        showCompletedWO
    } = props

    const showWorkOrders = item.workOrders > 0 || item.CompletedWorkOrders > 0

    return (
        <View style={[styles.boxFooter]}>
            {isVisitList && (haveDelivery || showWorkOrders) && (
                <View
                    style={[
                        styles.boxFooter,
                        fromMMModal && styles.borderMMModalBottom,
                        styles.footer,
                        (!fromEmployeeSchedule || (!item.ActualVisitStartTime && !item.ActualVisitEndTime)) &&
                            styles.borderBottom
                    ]}
                >
                    <View>
                        {haveDelivery && (
                            <View style={styles.boxFooterView}>
                                <Image
                                    style={styles.imageVan}
                                    source={require('../../../../assets/image/icon_delivery_van.png')}
                                />
                                <CText style={styles.upcomingText}>
                                    {haveOpenStatus
                                        ? t.labels.PBNA_MOBILE_CD_UPCOMING_DELIVERY
                                        : t.labels.PBNA_MOBILE_CD_DELIVERY_COMPLETE}
                                </CText>
                                <IndicatorIcon
                                    haveOpenStatus={haveOpenStatus}
                                    totalCertified={deliveryInfo.totalCertified || 0}
                                    totalDelivered={deliveryInfo.totalDelivered || 0}
                                    totalOrdered={deliveryInfo.totalOrdered || 0}
                                />
                            </View>
                        )}
                    </View>

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

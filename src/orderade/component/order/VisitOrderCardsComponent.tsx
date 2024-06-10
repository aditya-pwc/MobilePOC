/*
 * @Author: Tom tong.jiang@pwc.com
 * @Date: 2023-06-22 00:14:39
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @LastEditTime: 2024-01-18 17:35:11
 */

import React, { FC } from 'react'
import { FlatList, Image, StyleSheet, View } from 'react-native'
import CText from '../../../common/components/CText'
import { t } from '../../../common/i18n/t'
import { MyDayVisitModel } from '../../interface/MyDayVisit'
import { useOrderData, OrderWithReturnOnly } from '../../hooks/VisitOrderHooks'
import { TouchableOpacity } from 'react-native-gesture-handler'
import _ from 'lodash'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import dayjs from 'dayjs'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { BreadcrumbVisibility, Instrumentation } from '@appdynamics/react-native-agent'
import { appendLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import moment from 'moment'
import { formatWithTimeZone } from '../../../common/utils/TimeZoneUtils'

const styles = StyleSheet.create({
    orderComponentContainer: {
        width: '100%',
        marginTop: 30,
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    mb_30: {
        marginBottom: 30
    },
    orderComponentTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginLeft: 22
    },
    orderComponentTitleBase: {
        fontSize: 12,
        color: '#000000'
    },
    orderComponentTitle: {
        fontWeight: 'bold'
    },
    orderComponentNumber: {
        fontWeight: '700'
    },
    orderComponentNumberOutline: {
        width: 22,
        height: 22,
        borderRadius: 22,
        borderColor: '#D3D3D3',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 7
    },
    flatListContainer: {
        marginTop: 14,
        width: '100%'
    },
    flatListCardContainer: {
        flexDirection: 'row',
        width: 186,
        height: 70,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#D3D3D3',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginLeft: 20
    },
    cartTitle: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    cardText: {
        fontWeight: '400',
        color: '#D3D3D3',
        fontSize: 12
    },
    arrow: {
        width: 10,
        height: 20
    },
    status: {
        width: 20,
        height: 20
    },
    statusContainer: {
        width: 20,
        height: 20,
        borderRadius: 20,
        backgroundColor: 'white',
        marginLeft: 7
    },
    centeredRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }
})

interface VisitOrderCardsComponentProps {
    totalOrderNum: number
    visitData: MyDayVisitModel
    navigation: any
    isAdhoc: boolean
    isFocused: boolean
    isFromCompletedPage?: boolean
}

const VisitOrderCard = (props: {
    index: number
    item: Partial<OrderWithReturnOnly>
    navigation: any
    visitData: MyDayVisitModel
    isAdhoc: boolean
}) => {
    const { index, item, isAdhoc, navigation } = props

    const getText = () => {
        const orderIndex = item.index !== undefined ? item.index + 1 : 0
        if (item.returnOnly) {
            return `${_.startCase(t.labels.PBNA_MOBILE_RETURNS)} ${orderIndex}`
        } else if (isAdhoc) {
            return `${_.startCase(t.labels.PBNA_MOBILE_ADDTL_ORDER)} ${orderIndex}`
        } else if (index < props?.visitData?.VDelGroup.length) {
            return `${_.capitalize(t.labels.PBNA_MOBILE_ORDER)} ${orderIndex}`
        }
        return `${_.startCase(t.labels.PBNA_MOBILE_ADDTL_ORDER)} ${orderIndex}`
    }
    return (
        <TouchableOpacity
            activeOpacity={item?.Dlvry_Rqstd_Dtm__c ? 0.2 : 1}
            onPress={() => {
                if (item?.Dlvry_Rqstd_Dtm__c) {
                    const logMsg = `User viewed order detail for order: ${item.Cust_Po_Id__c} at ${formatWithTimeZone(
                        moment(),
                        TIME_FORMAT.YMDTHMS,
                        true,
                        true
                    )}`
                    Instrumentation.leaveBreadcrumb(logMsg, BreadcrumbVisibility.CRASHES_AND_SESSIONS)
                    appendLog(Log.MOBILE_INFO, 'orderade: view order detail', logMsg)
                    navigation.navigate('OrderInformationScreen', {
                        order: item,
                        visit: props.visitData
                    })
                }
            }}
        >
            <View
                style={[
                    styles.flatListCardContainer,
                    { backgroundColor: item?.Dlvry_Rqstd_Dtm__c ? '#F2F4F7' : '#FFFFFF' }
                ]}
            >
                <View>
                    <View style={[styles.centeredRow, { justifyContent: 'flex-start' }]}>
                        <CText style={[styles.cartTitle, { color: item?.Dlvry_Rqstd_Dtm__c ? '#000000' : '#D3D3D3' }]}>
                            {getText()}
                        </CText>
                        {item?.Dlvry_Rqstd_Dtm__c && (
                            <View style={styles.statusContainer}>
                                <Image style={styles.status} source={ImageSrc.ICON_CHECKMARK_CIRCLE} />
                            </View>
                        )}
                    </View>
                    {item?.Dlvry_Rqstd_Dtm__c && (
                        <View style={[styles.centeredRow, { marginTop: 4 }]}>
                            <CText style={[styles.cardText, { color: '#565656' }]}>
                                {`${_.capitalize(t.labels.PBNA_MOBILE_DELIVERY)} `}
                            </CText>
                            <CText style={[styles.cardText, { color: '#000000' }]}>
                                {`${dayjs(item?.Dlvry_Rqstd_Dtm__c).format(TIME_FORMAT.MMM_DD_YYYY)}`}
                            </CText>
                        </View>
                    )}
                    {item?.vDelDate && (
                        <View style={[styles.centeredRow, { marginTop: 4 }]}>
                            <CText style={[styles.cardText, { color: '#D3D3D3' }]}>
                                {`${_.capitalize(t.labels.PBNA_MOBILE_DELIVERY)} `}
                            </CText>
                            <CText style={[styles.cardText, { color: '#D3D3D3' }]}>
                                {`${dayjs(item?.vDelDate).format(TIME_FORMAT.MMM_DD_YYYY)}`}
                            </CText>
                        </View>
                    )}
                </View>
                {item?.Dlvry_Rqstd_Dtm__c ? (
                    <Image source={require('../../../../assets/image/ArrowLightBlue.png')} style={styles.arrow} />
                ) : (
                    <Image source={require('../../../../assets/image/ArrowGrey.png')} style={styles.arrow} />
                )}
            </View>
        </TouchableOpacity>
    )
}

const VisitOrderCardsComponent: FC<VisitOrderCardsComponentProps> = (props) => {
    const { totalOrderNum, visitData, navigation, isAdhoc, isFocused, isFromCompletedPage } = props
    const { orderData } = useOrderData(visitData, isAdhoc, isFocused)
    const getMyOrders = () => {
        if (totalOrderNum === 0 && !isAdhoc) {
            return visitData.VDelGroup.length
        }
        return totalOrderNum
    }

    return (
        <View style={[styles.orderComponentContainer, isFromCompletedPage && styles.mb_30]}>
            <View style={styles.orderComponentTitleContainer}>
                <CText style={[styles.orderComponentTitle, styles.orderComponentTitleBase]}>
                    {_.upperCase(`${t.labels.PBNA_MOBILE_MY} ${t.labels.PBNA_MOBILE_DELIVERY_ORDERS}`)}
                </CText>
                <View style={styles.orderComponentNumberOutline}>
                    <CText style={[styles.orderComponentNumber, styles.orderComponentTitleBase]}>{getMyOrders()}</CText>
                </View>
            </View>
            {(!isAdhoc || orderData.length !== 0) && (
                <View style={styles.flatListContainer}>
                    <FlatList
                        renderItem={(item) => {
                            return (
                                <VisitOrderCard
                                    index={item.index}
                                    item={item.item}
                                    navigation={navigation}
                                    visitData={visitData}
                                    isAdhoc={isAdhoc}
                                />
                            )
                        }}
                        data={orderData}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 20 }}
                    />
                </View>
            )}
        </View>
    )
}

export default VisitOrderCardsComponent

/**
 * @description Order information page.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2022-11-28
 */

import _ from 'lodash'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { View, StyleSheet, SafeAreaView } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { restDataCommonCall } from '../../../api/SyncUtils'
import { Log } from '../../../../common/enums/Log'
import { OrderDetailType } from '../../../enums/Manager'
import { formatReturnsData, getApeOrderSummary } from '../../../helper/manager/OrderHelper'
import { t } from '../../../../common/i18n/t'
import { getDeliveryMethodByCode, TWO_DASH_PLACEHOLDER } from '../../../model/Order'
import DeliveryVisitDetailQueries from '../../../queries/DeliveryVisitDetailQueries'
import { SoupService } from '../../../service/SoupService'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { formatString } from '../../../utils/CommonUtils'
import CText from '../../../../common/components/CText'
import TitleWithCloseBtn from '../../common/TitleWithCloseBtn'
import VisitCard from '../../merchandiser/VisitCard'
import SDLOrderInfo from '../../sales/sdl-visit-details/SDLOrderInfo'
import DriverCard from '../delivery-visit-detail/DriverCard'
import { getOrderItems, getOrderCount } from './DeliveriesHelper'
import { renderOrderData } from './DelOrderItem'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../common/utils/LogUtils'

interface OrderInformationProps {
    orderId: string
    navigation?: any
    route?: any
}

interface OrderDetail {
    orderNumber: string
    customerNumber: string
    deliveryDate: string
    salesMethod: string
    deliveryMethod: string
    returns: string
    delLocalRoute: string
    delNationalId: string
    salesLocalRoute: string
    salesNationalId: string
    volume: number
    fountainCount: number
    bcCount: number
    otherCount: number
    visitId: string
    orderDate: string
    accountId: string
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.bgGray
    },
    orderInfo: {
        backgroundColor: baseStyle.color.white,
        marginTop: 76
    },
    customerCardView: {
        marginHorizontal: 0,
        marginTop: -55,
        marginBottom: -10
    },
    infoRow: {
        ...commonStyle.flexRowSpaceCenter,
        marginHorizontal: 22,
        marginTop: 30
    },
    infoCell: {
        width: '50%',
        marginRight: 40,
        paddingRight: 30
    },
    infoLabel: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.titleGray,
        marginBottom: 4
    },
    infoField: {
        fontSize: baseStyle.fontSize.fs_16,
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    volumeBar: {
        marginTop: 15,
        minHeight: 63
    },
    userCard: {
        marginBottom: -55,
        marginTop: 45
    },
    orderAndReturns: {
        marginTop: 87
    }
})

export const renderInfoRow = (label, value) => {
    return (
        <View key={label} style={styles.infoCell}>
            <CText style={styles.infoLabel}>{label}</CText>
            <CText style={styles.infoField} numberOfLines={2} ellipsizeMode="tail">
                {value || TWO_DASH_PLACEHOLDER}
            </CText>
        </View>
    )
}

const getOrderInfoField = () => [
    [
        { key: 'orderNumber', label: t.labels.PBNA_MOBILE_ORDER_NUMBER },
        { key: 'customerNumber', label: t.labels.PBNA_MOBILE_CUSTOMER_NUMBER }
    ],
    [
        { key: 'deliveryDate', label: t.labels.PBNA_MOBILE_DELIVERY_DATE },
        { key: 'salesMethod', label: t.labels.PBNA_MOBILE_SALES_METHOD }
    ],
    [
        { key: 'deliveryMethod', label: t.labels.PBNA_MOBILE_CD_DELIVERY_METHOD },
        { key: 'returns', label: t.labels.PBNA_MOBILE_RETURNS }
    ],
    [
        { key: 'delLocalRoute', label: t.labels.PBNA_MOBILE_DEL_LOCAL_ROUTE },
        { key: 'delNationalId', label: t.labels.PBNA_MOBILE_DEL_NATIONAL_ID }
    ],
    [
        { key: 'salesLocalRoute', label: t.labels.PBNA_MOBILE_SALES_LOCAL_ROUTE },
        { key: 'salesNationalId', label: t.labels.PBNA_MOBILE_SALES_NATIONAL_ID }
    ]
]

const OrderInformation = (props: OrderInformationProps) => {
    const { navigation, route } = props
    const orderId = route.params.orderId
    const [orderDetail, setOrderDetail] = useState<OrderDetail>({
        orderNumber: '',
        customerNumber: '',
        deliveryDate: '',
        salesMethod: '',
        deliveryMethod: '',
        returns: '',
        delLocalRoute: '',
        delNationalId: '',
        salesLocalRoute: '',
        salesNationalId: '',
        volume: 0,
        fountainCount: 0,
        bcCount: 0,
        otherCount: 0,
        visitId: '',
        orderDate: '',
        accountId: ''
    })
    const [storeInfo, setStoreInfo] = useState({})
    const [userInfo, setUserInfo] = useState({
        Id: '',
        FirstName: '',
        LastName: '',
        UserStatsId: '',
        FT_EMPLYE_FLG_VAL__c: '',
        Title: '',
        LocalRoute: '',
        NationalId: '',
        MobilePhone: ''
    })

    const queryOrderCustomerCard = async (accountId) => {
        try {
            if (_.isEmpty(accountId)) {
                return []
            }
            const storeData = await SoupService.retrieveDataFromSoup(
                'RetailStore',
                {},
                DeliveryVisitDetailQueries.getDeliveryRetailStore.f,
                formatString(DeliveryVisitDetailQueries.getDeliveryRetailStore.q, [accountId])
            )
            const tempStoreInfo = storeData[0]
            const shippingAddress = JSON.parse(tempStoreInfo.ShippingAddress)
            const storeLocation = JSON.parse(tempStoreInfo.Store_Location__c)
            return {
                id: tempStoreInfo.Id,
                name: tempStoreInfo.Name,
                address: shippingAddress?.street ? shippingAddress?.street : '',
                cityStateZip: `${shippingAddress?.city ? shippingAddress?.city + ', ' : ''}${
                    shippingAddress?.state ? shippingAddress?.state : ''
                }${shippingAddress?.postalCode ? ' ' + shippingAddress?.postalCode : ''} `,
                latitude: storeLocation ? storeLocation.latitude : tempStoreInfo.Latitude,
                longitude: storeLocation ? storeLocation.longitude : tempStoreInfo.Longitude,
                AccountId: tempStoreInfo.AccountId,
                AccountPhone: tempStoreInfo.AccountPhone,
                storeLocation: tempStoreInfo?.Store_Location__c
            }
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, OrderInformation.name + '-' + queryOrderCustomerCard.name, e)
        }
    }

    const queryOrderUserCard = async (userId) => {
        try {
            if (_.isEmpty(userId)) {
                return []
            }
            const userData = await SoupService.retrieveDataFromSoup(
                'User',
                {},
                DeliveryVisitDetailQueries.getDeliveryUser.f,
                formatString(DeliveryVisitDetailQueries.getDeliveryUser.q, [userId])
            )
            return userData[0]
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, OrderInformation.name + '-' + queryOrderUserCard.name, e)
        }
    }

    const fetchDeliveryRoute = async (retailStoreId, deliveryDate) => {
        const emptyDeliveryRouteInfo = { delLocalRoute: '', delNationalId: '' }
        try {
            if (_.isEmpty(retailStoreId) || _.isEmpty(deliveryDate)) {
                return emptyDeliveryRouteInfo
            }
            const visitQuery = `SELECT Id, VisitorId, RTE_ID__r.LOCL_RTE_ID__c, RTE_ID__r.GTMU_RTE_ID__c FROM Visit WHERE Retail_Store__c = '${retailStoreId}' 
                AND RecordType.DeveloperName = 'Delivery' AND Planned_Date__c = ${deliveryDate?.split('T')[0]}`
            const path = `query/?q=${visitQuery}`
            const res = await restDataCommonCall(path, 'GET')
            const deliveryVisitInfo = res?.data?.records?.[0]
            if (_.isEmpty(deliveryVisitInfo) || _.isEmpty(deliveryVisitInfo?.VisitorId)) {
                return emptyDeliveryRouteInfo
            }
            return {
                delLocalRoute: deliveryVisitInfo?.RTE_ID__r?.LOCL_RTE_ID__c,
                delNationalId: deliveryVisitInfo?.RTE_ID__r?.GTMU_RTE_ID__c
            }
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, OrderInformation.name + '-' + fetchDeliveryRoute.name, e)
            return emptyDeliveryRouteInfo
        }
    }

    const fetchOrderDataFromSF = async () => {
        try {
            if (_.isEmpty(orderId)) {
                return
            }
            const query = `SELECT Id, Ordr_Id__c, Account.CUST_UNIQ_ID_VAL__c, Dlvry_Rqstd_Dtm__c, 
            Sls_Mthd_Descr__c, Delivery_Method_Code__c, Visit__r.Id, Visit__r.Visitor.Id, 
            RTE_ID__r.LOCL_RTE_ID__c, RTE_ID__r.GTMU_RTE_ID__c, Total_Ordered_IntCount__c, TotalAmount, AccountId, RetailStore__c
            FROM Order WHERE Id = '${orderId}'`
            const path = `query/?q=${query}`
            const res = await restDataCommonCall(path, 'GET')
            const orderInfo = res?.data?.records?.[0]
            const orderItems = await getOrderItems([orderId])
            // for customer card
            const tempStoreInfo = await queryOrderCustomerCard(orderInfo?.AccountId)
            setStoreInfo(tempStoreInfo)
            // for user card
            const tempUserInfo = await queryOrderUserCard(orderInfo?.Visit__r?.Visitor?.Id)
            setUserInfo(tempUserInfo)
            const { fountainCount, bcCount, otherCount } = getOrderCount({ orderItems })
            const orderSummary = await getApeOrderSummary(orderId, OrderDetailType.ORDER)
            const tempReturns = JSON.parse(orderSummary.data)?.returns
            // fetch delivery route info from SF
            const deliveryRouteInfo = await fetchDeliveryRoute(orderInfo?.RetailStore__c, orderInfo?.Dlvry_Rqstd_Dtm__c)
            // basic information
            const tempOrderDetail = {
                orderNumber: orderInfo.Ordr_Id__c,
                customerNumber: orderInfo.Account.CUST_UNIQ_ID_VAL__c,
                deliveryDate: orderInfo.Dlvry_Rqstd_Dtm__c
                    ? moment(orderInfo.Dlvry_Rqstd_Dtm__c).format(TIME_FORMAT.SCHEDULE_DATE_FORMAT)
                    : '',
                salesMethod: orderInfo.Sls_Mthd_Descr__c,
                deliveryMethod: getDeliveryMethodByCode(orderInfo.Delivery_Method_Code__c),
                returns: formatReturnsData(tempReturns),
                delLocalRoute: deliveryRouteInfo?.delLocalRoute,
                delNationalId: deliveryRouteInfo?.delNationalId,
                salesLocalRoute: orderInfo?.RTE_ID__r?.LOCL_RTE_ID__c,
                salesNationalId: orderInfo?.RTE_ID__r?.GTMU_RTE_ID__c,
                volume: _.isNumber(_.toNumber(orderInfo.Total_Ordered_IntCount__c))
                    ? _.toNumber(orderInfo.Total_Ordered_IntCount__c)
                    : 0,
                fountainCount: fountainCount,
                bcCount: bcCount,
                otherCount: otherCount,
                visitId: orderInfo?.Visit__r?.Id,
                orderDate: orderInfo.Dlvry_Rqstd_Dtm__c
                    ? moment(orderInfo.Dlvry_Rqstd_Dtm__c).format(TIME_FORMAT.Y_MM_DD)
                    : '',
                accountId: orderInfo?.AccountId
            }
            setOrderDetail(tempOrderDetail)
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, OrderInformation.name + '-' + fetchOrderDataFromSF.name, e)
        }
    }

    useEffect(() => {
        fetchOrderDataFromSF()
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <TitleWithCloseBtn title={t.labels.PBNA_MOBILE_ORDER_INFORMATION} navigation={navigation} />
                <View style={styles.orderInfo}>
                    <View style={styles.customerCardView}>
                        <VisitCard
                            navigation={navigation}
                            item={{ ...storeInfo }}
                            isVisitList={false}
                            addVisits={false}
                            enableGotoCustomerDetail
                        />
                    </View>
                    {getOrderInfoField().map((fieldArr) => {
                        return (
                            <View style={styles.infoRow} key={fieldArr[0].key}>
                                {fieldArr.map((fieldObj) => {
                                    return renderInfoRow(fieldObj.label, orderDetail?.[fieldObj.key])
                                })}
                            </View>
                        )
                    })}
                    <View style={styles.volumeBar}>{renderOrderData(orderDetail)}</View>
                    {!_.isEmpty(userInfo?.Id) && (
                        <View style={styles.userCard}>
                            <DriverCard
                                navigation
                                firstName={userInfo.FirstName}
                                lastName={userInfo.LastName}
                                userStatsId={userInfo.UserStatsId}
                                roleFlag={userInfo?.FT_EMPLYE_FLG_VAL__c}
                                roleTitle={userInfo.Title}
                                localRout={userInfo.LocalRoute}
                                nationalId={userInfo.NationalId}
                                phoneString={userInfo.MobilePhone}
                            />
                        </View>
                    )}
                </View>
                {!_.isEmpty(orderDetail?.accountId) && (
                    <View style={!_.isEmpty(userInfo?.Id) && styles.orderAndReturns}>
                        <SDLOrderInfo
                            visitInfo={{
                                accountId: orderDetail?.accountId,
                                currentDate: orderDetail?.orderDate,
                                type: OrderDetailType.ORDER
                            }}
                        />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

export default OrderInformation

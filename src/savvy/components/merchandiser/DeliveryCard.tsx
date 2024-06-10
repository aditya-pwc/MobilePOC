/*
 * @Description: A expandable card shows work order of the retail store
 * @Author: Kevin Gu
 * @Date: 2021-04-08 09:40:19
 * @LastEditTime: 2022-07-19 12:45:38
 * @LastEditors: Mary Qian
 */

import React, { useEffect, useState } from 'react'
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native'
import 'moment-timezone'
import CText from '../../../common/components/CText'
import { visitStyle } from './VisitStyle'
import DeliveryLogo, {
    getNumberString,
    getDeliveryCardIndicator,
    getShipmentAndOrderItemFromLocalData
} from './DeliveryLogo'
import { formatWithTimeZone, isTodayDayWithTimeZone, todayDateWithTimeZone } from '../../utils/TimeZoneUtils'
import { t } from '../../../common/i18n/t'
import UserAvatar from '../common/UserAvatar'
import PhoneIcon from '../common/PhoneIcon'
import ChatIcon from '../common/ChatIcon'
import { callByPhone, smsByPhone } from '../../../common/utils/LinkUtils'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'

interface DeliveryCardProps {
    visit
    navigation
    couldPush?
    shipment
    showHalfDeliveryCard?
    showDeliveryRoute?
    noNeedPullData?
    indicator?
}

const styles = StyleSheet.create({
    marginRight20: {
        marginRight: 20
    },
    deliveryActiveImg: {
        width: 28,
        height: 20
    },
    deliveryActiveColor: {
        tintColor: '#D3D3D3'
    },
    marginRight35: {
        marginRight: 35
    }
})

const DeliveryCard = (props: DeliveryCardProps) => {
    const { visit, navigation, couldPush, shipment, indicator, showHalfDeliveryCard, showDeliveryRoute } = props
    const [indicatorType, setIndicatorType] = useState(indicator)

    const getShipmentItem = () => {
        getShipmentAndOrderItemFromLocalData(shipment).then((result) => {
            const type = getDeliveryCardIndicator(shipment, result.orderItems)
            setIndicatorType(type)
        })
    }

    const quantityView = () => {
        return (
            <View style={visitStyle.quantityView}>
                <CText style={[visitStyle.palletLabel, visitStyle.palletStyle]}>
                    {getNumberString(shipment.Order_Pallet_Count__c)} {t.labels.PBNA_MOBILE_PLT.toLowerCase()}
                </CText>
                <View style={visitStyle.gapLine} />
                <CText style={[visitStyle.palletLabel, visitStyle.palletStyle]}>
                    {getNumberString(shipment.orderQuantity)} {t.labels.PBNA_MOBILE_ORDER_CS.toLowerCase()}
                </CText>
                <DeliveryLogo type={indicatorType} />
            </View>
        )
    }

    const getTimeDate = () => {
        if (!shipment) {
            return ''
        }
        const deliveryDate =
            shipment.ActualDeliveryDate ||
            shipment.DeliveryVisitDate ||
            shipment.DeliveryPlannedDate ||
            shipment.Dlvry_Rqstd_Dtm__c
        const isToday = isTodayDayWithTimeZone(deliveryDate, true)
        const dayStr = formatWithTimeZone(deliveryDate, `${TIME_FORMAT.MMDD} `, true)
        const isSameDay = todayDateWithTimeZone(false) === todayDateWithTimeZone(true)
        const timeStr = formatWithTimeZone(deliveryDate, TIME_FORMAT.HHMMA, true, true)
        return isToday && isSameDay ? 'Today, ' + timeStr : dayStr + timeStr
    }

    useEffect(() => {
        if (!indicator) {
            getShipmentItem()
        } else {
            setIndicatorType(indicator)
        }
    }, [indicator])

    const gotoDeliveryRoute = () =>
        navigation.navigate('DeliveryRoute', {
            deliveryInfo: {
                VisitorId: shipment.UserId,
                Planned_Date__c: visit.Planned_Date__c,
                firstName: shipment.FirstName,
                lastName: shipment.LastName,
                userName: shipment.UserName,
                userStatsId: shipment.userStatsId,
                phoneNumber: shipment.MobilePhone
            }
        })

    return (
        <View style={visitStyle.boxWithShadow}>
            <View style={!showHalfDeliveryCard ? visitStyle.boxContent : visitStyle.boxContentOnlyText}>
                <TouchableOpacity
                    style={visitStyle.boxContentTextArea}
                    onPress={() =>
                        !couldPush &&
                        navigation?.navigate('DeliveryInformation', { item: visit, shipment, showDeliveryRoute })
                    }
                >
                    <View style={visitStyle.deliveryCardTopBox}>
                        <View style={[visitStyle.contentText, visitStyle.leftMargin]}>
                            <CText numberOfLines={1} ellipsizeMode="tail" style={visitStyle.title}>
                                {t.labels.PBNA_MOBILE_CUSTOMERS_DELIVERY}
                            </CText>
                            <View style={visitStyle.rowWithCenter}>
                                <CText style={[visitStyle.duration]}>{getTimeDate()}</CText>
                            </View>
                        </View>
                        <View
                            style={[
                                visitStyle.contentText,
                                visitStyle.justifyContentEnd,
                                visitStyle.right,
                                visitStyle.leftMargin
                            ]}
                        >
                            <CText
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={[visitStyle.title, shipment && styles.marginRight35]}
                            >
                                {t.labels.PBNA_MOBILE_SCHE_QTY}
                            </CText>
                            {shipment && quantityView()}
                        </View>
                    </View>
                    <View style={visitStyle.longLine} />
                    <View style={visitStyle.deliveryCardBottomBox}>
                        <UserAvatar
                            userStatsId={shipment?.userStatsId}
                            firstName={shipment?.FirstName}
                            lastName={shipment?.LastName}
                            avatarStyle={visitStyle.avatar}
                            userNameText={{ fontSize: 16 }}
                        />
                        <View style={[visitStyle.boxContentTextArea, visitStyle.leftMargin]}>
                            <View style={visitStyle.rowWithCenter}>
                                <View style={visitStyle.contentText}>
                                    <CText numberOfLines={2} ellipsizeMode="tail" style={visitStyle.title}>
                                        {t.labels.PBNA_MOBILE_DRIVER}
                                    </CText>
                                </View>
                            </View>
                            <View style={visitStyle.rowWithCenter}>
                                <View style={visitStyle.contentText}>
                                    <CText numberOfLines={1} ellipsizeMode="tail" style={visitStyle.duration}>
                                        {shipment && shipment.UserName}
                                    </CText>
                                </View>
                            </View>
                        </View>
                        <View style={visitStyle.iconGroup}>
                            {showDeliveryRoute && (
                                <TouchableOpacity
                                    style={styles.marginRight20}
                                    disabled={!shipment?.UserId}
                                    onPress={gotoDeliveryRoute}
                                >
                                    <Image
                                        style={[
                                            styles.deliveryActiveImg,
                                            !shipment?.UserId && styles.deliveryActiveColor
                                        ]}
                                        source={ImageSrc.TAB_DELIVERY_ACTIVE}
                                    />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[visitStyle.icon, visitStyle.chat]}
                                onPress={() => {
                                    if (shipment.MobilePhone) {
                                        smsByPhone(shipment.MobilePhone)
                                    }
                                }}
                            >
                                <ChatIcon imageStyle={commonStyle.flex_1} isDisabled={!shipment.MobilePhone} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[visitStyle.icon, visitStyle.phoneMarginLeft]}
                                onPress={() => {
                                    if (shipment.MobilePhone) {
                                        callByPhone(shipment.MobilePhone)
                                    }
                                }}
                            >
                                <PhoneIcon isDisabled={!shipment.MobilePhone} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default DeliveryCard

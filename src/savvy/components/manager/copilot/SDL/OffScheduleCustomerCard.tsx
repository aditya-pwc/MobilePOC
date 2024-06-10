/*
 * @Author: Howard Xiao
 * @Date: 2023-07-24
 * @Description: SDL Off Schedule customer card
 */

import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import CText from '../../../../../common/components/CText'
import IMG_STORE_PLACEHOLDER from '../../../../../../assets/image/Icon-store-placeholder.svg'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { t } from '../../../../../common/i18n/t'
import { OffScheduleCustomerItem } from './SDLOffSchedulePage'
import { DAY_OF_WEEKS } from '../../../../utils/MerchManagerUtils'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        height: 92,
        flexDirection: 'row',
        paddingHorizontal: 22,
        paddingTop: 15,
        alignItems: 'center'
    },
    imgStore: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 7
    },
    textContainer: {
        flex: 1,
        height: '100%',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: baseStyle.color.gray,
        paddingLeft: 10
    },
    customerName: {
        fontSize: 16,
        fontWeight: '700',
        color: baseStyle.color.black
    },
    daysContainer: {
        flexDirection: 'row',
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    daysLabel: {
        fontSize: 12,
        fontWeight: '400',
        color: baseStyle.color.titleGray,
        marginBottom: 6
    },
    daysView: {
        flexDirection: 'row'
    },
    daysAbbr: {
        fontSize: 12,
        fontWeight: '700',
        marginRight: 8
    },
    blackDate: {
        color: baseStyle.color.black
    },
    redDate: {
        color: baseStyle.color.red
    },
    greyDate: {
        color: baseStyle.color.liteGrey
    }
})
interface OffScheduleCustomerCardProps {
    item: OffScheduleCustomerItem
    onPressFunc: Function
    isLastItem?: boolean
}

const renderOrderAndDeliveryDays = (normalDays: string, offScheduleDays: string) => {
    return DAY_OF_WEEKS.map((item) => {
        return (
            <CText
                key={item}
                style={[
                    styles.daysAbbr,
                    styles.greyDate,
                    normalDays?.includes(item) && styles.blackDate,
                    offScheduleDays?.includes(item) && styles.redDate
                ]}
            >
                {item.substring(0, 1)}
            </CText>
        )
    })
}

const OffScheduleCustomerCard = (props: OffScheduleCustomerCardProps) => {
    const { item, isLastItem, onPressFunc } = props
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => {
                onPressFunc && onPressFunc()
            }}
        >
            <IMG_STORE_PLACEHOLDER style={styles.imgStore} />
            <View style={[styles.textContainer, isLastItem && { borderBottomWidth: 0 }]}>
                <CText numberOfLines={1} style={styles.customerName}>
                    {item.strName}
                </CText>
                <View style={styles.daysContainer}>
                    <View>
                        <CText style={styles.daysLabel}>{t.labels.PBNA_MOBILE_ORDER_DAYS}</CText>
                        <View style={styles.daysView}>
                            {renderOrderAndDeliveryDays(item.strOrderDay, item.strOrderOffSchedule)}
                        </View>
                    </View>
                    <View>
                        <CText style={styles.daysLabel}>{t.labels.PBNA_MOBILE_DELIVERY_DAYS}</CText>
                        <View style={styles.daysView}>
                            {renderOrderAndDeliveryDays(item.strDeliveryDay, item.strDeliveryOffSchedule)}
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default OffScheduleCustomerCard

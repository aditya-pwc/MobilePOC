/**
 * @description Visit or store list component.
 * @author Christopher ZANG
 * @email jiahua.zang@pwc.com
 * @date 2021-05-26
 */

import React from 'react'
import { ScrollView, StyleSheet, View, TouchableWithoutFeedback } from 'react-native'
import { t } from '../../../common/i18n/t'
import { Promotion } from '../../model/InStoreMapInterface'
import WorkOrderProduct from '../../module/work-order/WorkOrderProduct'
import { commonStyle } from '../../../common/styles/CommonStyle'
import CText from '../../../common/components/CText'

const styles = StyleSheet.create({
    ...commonStyle,
    tooltipContent: {
        backgroundColor: 'white',
        height: '100%',
        width: '100%'
    },
    promotionName: {
        width: '90%',
        alignItems: 'center',
        fontWeight: '900',
        color: '#000',
        fontSize: 18,
        paddingRight: 15
    },
    timeWrapper: {
        alignItems: 'flex-start',
        paddingTop: 17,
        paddingBottom: 4,
        width: '42%'
    },
    title: {
        marginBottom: 6,
        color: '#565656',
        fontSize: 12
    },
    date: {
        color: '#000000',
        fontSize: 14
    },
    packageWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingBottom: 19
    },
    packageNameWrapper: {
        flex: 1,
        marginRight: 6
    },
    quantityWrapper: {
        width: '32%'
    },
    priceWrapper: {
        width: '22%'
    },
    detail: {
        fontWeight: '700',
        fontSize: 16
    },
    bottomline: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    packageContainer: {
        flex: 1,
        overflow: 'hidden'
    },
    padding10: {
        padding: 10
    }
})

interface PromotionProps {
    promotion: Promotion
}

const renderStorePackage = (promotion: Promotion) => {
    const workOrder = { promotion_product: promotion.package }
    return <WorkOrderProduct workOrder={workOrder} />
}

const PromotionToolTip = (props: PromotionProps) => {
    const { promotion } = props

    return (
        <TouchableWithoutFeedback onPress={() => {}}>
            <ScrollView style={styles.tooltipContent} showsVerticalScrollIndicator>
                <View style={styles.padding10} onStartShouldSetResponder={() => true}>
                    <View style={styles.flexRowAlignCenter}>
                        <CText style={styles.promotionName} numberOfLines={1} ellipsizeMode="tail">
                            {promotion.name}
                        </CText>
                    </View>
                    <View style={styles.flexRowSpaceBet}>
                        <View style={styles.timeWrapper}>
                            <CText style={styles.title}>{t.labels.PBNA_MOBILE_START_DATE}</CText>
                            <CText style={styles.date}>{promotion.startDate}</CText>
                        </View>
                        <View style={styles.timeWrapper}>
                            <CText style={styles.title}>{t.labels.PBNA_MOBILE_END_DATE}</CText>
                            <CText style={styles.date}>{promotion.endDate}</CText>
                        </View>
                    </View>
                    {renderStorePackage(promotion)}
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
    )
}

export default PromotionToolTip

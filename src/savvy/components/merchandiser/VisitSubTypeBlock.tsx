/**
 * @description Visit or store list component.
 * @author Christopher
 * @email jiahua.zang@pwc.com
 * @date 2021-08-06
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { t } from '../../../common/i18n/t'
import CText from '../../../common/components/CText'
const styles = StyleSheet.create({
    bottomOfAddress: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingLeft: 93,
        paddingBottom: 15,
        marginTop: -16
    },
    subTypeText: {
        lineHeight: 12,
        fontSize: 12,
        color: '#000'
    },
    verticalDividingLine: {
        marginHorizontal: 4,
        borderLeftColor: '#D3D3D3',
        borderLeftWidth: 1,
        width: 1,
        height: 14
    },
    pullNumberView: {
        flexDirection: 'row',
        marginRight: 10
    },
    orderView: {
        paddingHorizontal: 5,
        borderColor: '#565656',
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        borderWidth: 1
    },
    complete: {
        backgroundColor: 'rgb(242, 244, 247)'
    },
    orderText: {
        fontWeight: '700',
        fontSize: 12,
        color: '#565656'
    }
})
interface VisitCardFooterInterface {
    onlyShowOrder?: boolean
    item: any
    showSubTypeBlock: boolean
    isVisitList: boolean
    visitSubtypes: Array<any>
    plusNum: any
}
const renderSubTypeText = (visitSubtypes, plusNum) => {
    if (visitSubtypes.length > 0) {
        return (
            <CText style={styles.subTypeText}>
                {visitSubtypes[0]}
                <CText>{plusNum > 0 && `, +${plusNum}`}</CText>
            </CText>
        )
    }
    return (
        <CText style={styles.subTypeText}>
            PREMIER
            <CText />
        </CText>
    )
}
const VisitSubTypeBlock = (props: VisitCardFooterInterface) => {
    const { item, isVisitList, showSubTypeBlock, visitSubtypes, plusNum, onlyShowOrder } = props
    item.Take_Order_Flag__c = item.Take_Order_Flag__c || item.takeOrderFlag
    if (showSubTypeBlock) {
        return (
            <View style={[styles.bottomOfAddress, isVisitList && item.status === 'Complete' && styles.complete]}>
                {!onlyShowOrder && <View>{renderSubTypeText(visitSubtypes, plusNum)}</View>}

                {(!!item.Pull_Number__c || item.Take_Order_Flag__c === '1') && (
                    <View style={styles.verticalDividingLine} />
                )}

                {!!item.Pull_Number__c && (
                    <View style={styles.pullNumberView}>
                        <CText style={styles.subTypeText}>P{item.Pull_Number__c}</CText>
                    </View>
                )}

                {item.Take_Order_Flag__c === '1' && (
                    <View style={styles.orderView}>
                        <CText style={styles.orderText}>{t.labels.PBNA_MOBILE_ORDER}</CText>
                    </View>
                )}
            </View>
        )
    }
    return null
}

export default VisitSubTypeBlock

/*
 * @Description:
 * @LastEditors: Yi Li
 */

import React from 'react'
import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native'
import CText from '../../../../../common/components/CText'
import { t } from '../../../../../common/i18n/t'

interface PriceGroupCellProps {
    item: any
    containerStyle?: StyleProp<ViewStyle>
    hasBottomLine?: boolean
    hasTopLine?: boolean
    submitPillStyle?: StyleProp<ViewStyle>
    submitPillTitle?: string
    onRemove?: Function
    index?: number
    showSubmitBtn?: boolean
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff'
    },
    priceName: {
        marginTop: 19,
        fontWeight: '400',
        fontSize: 12,
        color: '#000000'
    },
    pillCont: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 17
    },
    removeBtn: {
        height: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    removeTitle: {
        fontWeight: '700',
        fontSize: 12,
        color: '#EB445A',
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    submitPill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFC409'
    },
    submitPillT: {
        fontWeight: '700',
        fontSize: 12,
        color: '#000000'
    },
    cellTopLine: {
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1
    },
    cellBottomLine: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    }
})
const PriceGroupCell = (props: PriceGroupCellProps) => {
    const {
        containerStyle,
        hasBottomLine,
        hasTopLine,
        item,
        submitPillStyle,
        submitPillTitle,
        onRemove,
        index,
        showSubmitBtn
    } = props

    return (
        <View
            style={[
                styles.container,
                hasTopLine && styles.cellTopLine,
                hasBottomLine && styles.cellBottomLine,
                containerStyle
            ]}
        >
            <CText style={styles.priceName} numberOfLines={0}>
                {item?.Target_Name__c}
            </CText>
            <View style={styles.pillCont}>
                <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => {
                        onRemove && onRemove(item, index)
                    }}
                >
                    <CText style={styles.removeTitle}>{t.labels.PBNA_MOBILE_REMOVE.toUpperCase()}</CText>
                </TouchableOpacity>
                {showSubmitBtn && (
                    <View style={[styles.submitPill, submitPillStyle]}>
                        <CText style={styles.submitPillT}>
                            {submitPillTitle || t.labels.PBNA_MOBILE_SUBMITTED.toUpperCase()}
                        </CText>
                    </View>
                )}
            </View>
        </View>
    )
}
export default PriceGroupCell

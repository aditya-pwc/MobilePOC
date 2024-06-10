/*
 * @Description: Visit or store list component.
 * @Author: Christopher ZANG
 * @Date: 2021-08-12 21:39:19
 * @LastEditTime: 2022-02-16 04:46:41
 * @LastEditors: Mary Qian
 */

import React from 'react'
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { t } from '../../../common/i18n/t'
import CText from '../../../common/components/CText'
const styles = StyleSheet.create({
    addedStyle: {
        width: 30,
        marginLeft: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    addedText: {
        fontWeight: '700',
        color: '#000000',
        fontSize: 12
    },
    addVisitText: {
        fontWeight: '700',
        color: '#00A2D9',
        fontSize: 12
    },
    iconMedium: {
        width: 24,
        height: 24
    }
})
interface VisitAddedButtonInterface {
    item: any
    isVisitList: boolean
    addVisits: any
}

const VisitAddedButton = (props: VisitAddedButtonInterface) => {
    const { item, addVisits, isVisitList } = props
    if (!(!isVisitList && addVisits)) {
        return null
    }

    if (item.isAdded) {
        return (
            <TouchableOpacity
                hitSlop={{ left: 30, right: 30, top: 30, bottom: 30 }}
                onPress={() => {
                    addVisits(item, 'reduce')
                }}
            >
                <View style={styles.addedStyle}>
                    <Image
                        style={[styles.iconMedium]}
                        source={require('../../../../assets/image/icon-checkmark-circle-fill.png')}
                    />
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <TouchableOpacity
            hitSlop={{ left: 30, right: 30, top: 30, bottom: 30 }}
            onPress={() => {
                addVisits(item, 'add')
            }}
        >
            <View style={styles.addedStyle}>
                <CText style={styles.addVisitText}>{t.labels.PBNA_MOBILE_ADD}</CText>
            </View>
        </TouchableOpacity>
    )
}

export default VisitAddedButton

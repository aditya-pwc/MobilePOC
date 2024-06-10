import React from 'react'
import { View, StyleSheet } from 'react-native'
import { t } from '../../../common/i18n/t'
import CText from '../../../common/components/CText'

const styles = StyleSheet.create({
    pillView: {
        justifyContent: 'center',
        paddingHorizontal: 8,
        marginRight: 8,
        height: 20,
        borderColor: '#565656',
        borderWidth: 1,
        borderRadius: 10
    },
    pillText: {
        color: '#565656',
        fontSize: 12,
        fontWeight: '700',
        fontFamily: 'Gotham'
    },
    pillViewTaken: {
        borderColor: '#2dd36f',
        backgroundColor: '#2dd36f'
    },
    pillViewMiss: {
        borderColor: '#cdcdcd',
        backgroundColor: '#cdcdcd'
    },
    pillViewOffSchedule: {
        borderColor: '#eb445a',
        backgroundColor: '#eb445a'
    },
    pillTextWhite: {
        color: '#fff'
    }
})

const renderPill = (text: string) => {
    if (text === t.labels.PBNA_MOBILE_ORDER_TAKEN) {
        return (
            <View style={[styles.pillView, styles.pillViewTaken]} key={text}>
                <CText style={[styles.pillText, styles.pillTextWhite]}>{text.toLocaleUpperCase()}</CText>
            </View>
        )
    }
    if (text === t.labels.PBNA_MOBILE_ORDER_MISSED) {
        return (
            <View style={[styles.pillView, styles.pillViewMiss]} key={text}>
                <CText style={styles.pillText}>{text.toLocaleUpperCase()}</CText>
            </View>
        )
    }
    if (text === t.labels.PBNA_MOBILE_ORDER_OFF_SCHEDULE) {
        return (
            <View style={[styles.pillView, styles.pillViewOffSchedule]} key={text}>
                <CText style={[styles.pillText, styles.pillTextWhite]}>{text.toLocaleUpperCase()}</CText>
            </View>
        )
    }
    return (
        <View style={styles.pillView} key={text}>
            <CText style={styles.pillText}>{text.toLocaleUpperCase()}</CText>
        </View>
    )
}

export default renderPill

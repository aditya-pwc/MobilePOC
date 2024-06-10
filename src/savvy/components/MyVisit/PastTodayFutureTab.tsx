/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-05-30 03:50:57
 * @LastEditTime: 2022-08-04 04:43:41
 * @LastEditors: Mary Qian
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { t } from '../../../common/i18n/t'
import CText from '../../../common/components/CText'

const styles = StyleSheet.create({
    myVisitHeaderTitle: {
        fontWeight: '900',
        fontSize: 24,
        marginRight: 20
    },
    header: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 56,
        zIndex: 9999
    }
})

interface PastTodayFutureTabProps {
    tabIndex: number
    onClick: Function
}

const PastTodayFutureTab = (props: PastTodayFutureTabProps) => {
    const { tabIndex, onClick } = props

    const renderTabText = (title: string, index: number) => {
        return (
            <CText
                style={[styles.myVisitHeaderTitle, { color: tabIndex === index ? '#FFFFFF' : '#00A2D9' }]}
                onPress={() => {
                    onClick(index)
                }}
            >
                {title}
            </CText>
        )
    }

    return (
        <View style={styles.header}>
            {renderTabText(t.labels.PBNA_MOBILE_PAST, -1)}
            {renderTabText(t.labels.PBNA_MOBILE_TODAY, 0)}
            {renderTabText(t.labels.PBNA_MOBILE_FUTURE, 1)}
        </View>
    )
}

export default PastTodayFutureTab

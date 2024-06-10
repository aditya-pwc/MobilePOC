/*
 * @Description: A expandable card shows work order of the retail store
 * @Author: Christopher ZANG
 * @Date: 2021-08-23 09:16:48
 * @LastEditTime: 2022-02-16 04:08:53
 * @LastEditors: Mary Qian
 */
/* eslint-disable camelcase */

import React, { useState } from 'react'
import { TouchableOpacity, Image, View, StyleSheet } from 'react-native'
import Collapsible from 'react-native-collapsible'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { t } from '../../../common/i18n/t'
import { commonStyle } from '../../../common/styles/CommonStyle'
import CText from '../../../common/components/CText'
import VisitCustomerOHourTile from './VisitCustomerOHourTile'

const styles = StyleSheet.create({
    visitHour: {
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1,
        marginTop: 20
    },
    HoursOfOperationText: {
        fontWeight: '700',
        fontSize: 18
    },
    marginBottom20: {
        marginBottom: 20
    },
    container: {
        width: '100%',
        height: 70,
        padding: 22
    }
})

const VisitCustomerOHours = () => {
    const [isExpanded, setIsExpanded] = useState(true)
    const [operatingHours] = useState([
        { name: 'Sunday', open: true, from: '8:00 AM', to: '10:30 PM' },
        { name: 'Monday', open: true, from: '8:00 AM', to: '10:30 PM' },
        { name: 'Tuesday', open: true, from: '8:00 AM', to: '10:30 PM' },
        { name: 'Wednesday', open: true, from: '8:00 AM', to: '10:30 PM' },
        { name: 'Thursday', open: false, from: '', to: '' },
        { name: 'Friday', open: false, from: '', to: '' },
        { name: 'Saturday', open: true, from: '8:00 AM', to: '10:30 PM' }
    ])
    const handleCollapse = () => {
        setIsExpanded(!isExpanded)
    }
    return (
        <View style={styles.visitHour}>
            <TouchableOpacity
                onPress={() => {
                    handleCollapse()
                }}
                activeOpacity={1}
                style={[styles.container, commonStyle.flexRowSpaceBet]}
            >
                <View style={commonStyle.flexRowAlignCenter}>
                    <CText style={styles.HoursOfOperationText}>{t.labels.PBNA_MOBILE_HOURS_OF_OPERATION}</CText>
                </View>
                <View style={commonStyle.flexRowCenter}>
                    <Image source={isExpanded ? ImageSrc.IOS_CHEVRON_UP : ImageSrc.IOS_CHEVRON_DOWN} />
                </View>
            </TouchableOpacity>
            <Collapsible collapsed={!isExpanded}>
                <View style={styles.marginBottom20}>
                    {operatingHours.map((hours) => {
                        return <VisitCustomerOHourTile key={hours.name} operatingHours={hours} />
                    })}
                </View>
            </Collapsible>
        </View>
    )
}

export default VisitCustomerOHours

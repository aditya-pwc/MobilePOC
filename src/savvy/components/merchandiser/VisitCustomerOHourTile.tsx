/* eslint-disable camelcase */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { commonStyle } from '../../../common/styles/CommonStyle'
import CText from '../../../common/components/CText'

/**
 * @description A expandalbe card shows work order of the retail store
 * @author Christopher ZANG
 * @email jiahua.zang@pwc.com
 * @date 2021-08-23
 * @LastModifiedDate 2021-08-23
 */

const styles = StyleSheet.create({
    hourTile: {
        paddingBottom: 14,
        paddingHorizontal: 22
    }
})
const VisitCustomerOHourTile = (parentProps) => {
    const { operatingHours } = parentProps
    return (
        <View style={[styles.hourTile, commonStyle.flexRowSpaceBet]}>
            <CText>{operatingHours.name}</CText>
            <CText>
                {!operatingHours.open && 'Closed'}
                {operatingHours.open && operatingHours.from + ' - ' + operatingHours.to}
            </CText>
        </View>
    )
}

export default VisitCustomerOHourTile

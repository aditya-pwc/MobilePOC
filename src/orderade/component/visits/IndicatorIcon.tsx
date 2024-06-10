import React from 'react'
import { View, StyleSheet } from 'react-native'
import 'moment-timezone'

import CHECKMARK from '../../../../assets/image/icon-checkmark-circle-fill.svg'
import ERROR_DELIVERY from '../../../../assets/image/icon-error-visit-list.svg'

const styles = StyleSheet.create({
    completeIcon: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    greenIndicator: {
        marginRight: 5
    }
})

interface IndicatorIconProps {
    totalCertified
    totalDelivered
    totalOrdered
    haveOpenStatus
}
const IndicatorIcon = (props: IndicatorIconProps) => {
    const { totalCertified, totalDelivered, totalOrdered, haveOpenStatus } = props

    if (haveOpenStatus) {
        const isErrorTemp = totalOrdered > totalCertified
        return <>{isErrorTemp && <ERROR_DELIVERY />}</>
    }
    const isError = totalCertified < totalOrdered || totalDelivered < totalCertified || totalDelivered < totalOrdered

    return (
        <View style={styles.completeIcon}>
            <CHECKMARK style={styles.greenIndicator} />
            {isError && <ERROR_DELIVERY />}
        </View>
    )
}

export default IndicatorIcon

/**
 * @description Component to show lead boolean detail field.
 * @author Shangmin Dou
 * @date 2021-05-010
 */
import React from 'react'
import { View, StyleSheet } from 'react-native'
import CText from '../../../../../common/components/CText'
import TickGraySvg from '../../../../../../assets/image/icon-tick-gray.svg'
import TickBlueSvg from '../../../../../../assets/image/icon-tick-blue.svg'

interface LeadBooleanFieldProps {
    fieldName: string
    fieldValue: string | number
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15
    },
    iconContainer: {
        height: 20,
        width: 20,
        marginRight: 10
    },
    fieldNameStyle: {
        fontSize: 14,
        color: 'black',
        fontWeight: '400'
    }
})

const LeadBooleanFieldTile = (props: LeadBooleanFieldProps) => {
    const { fieldName, fieldValue } = props
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>{fieldValue === 'Yes' ? <TickBlueSvg /> : <TickGraySvg />}</View>

            <CText style={styles.fieldNameStyle}>{fieldName}</CText>
        </View>
    )
}

export default LeadBooleanFieldTile

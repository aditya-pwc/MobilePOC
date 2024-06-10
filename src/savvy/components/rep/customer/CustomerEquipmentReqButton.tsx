/**
 * @description The button for equipment
 * @author  Zoey Shi
 * @date 2021-11-05
 */
import React, { FC } from 'react'
import CText from '../../../../common/components/CText'
import { StyleSheet, TouchableOpacity } from 'react-native'

interface RequestButtonProps {
    label: string
    handlePress: () => void
    disable?: boolean
}
const styles = StyleSheet.create({
    btnStyle: {
        borderWidth: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        width: '100%'
    },
    disableColor: {
        borderColor: '#D3D3D3',
        shadowColor: '#87939E',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0.1,
        shadowRadius: 3
    },
    enableColor: {
        borderColor: '#00A2D9'
    },
    textStyle: {
        fontWeight: '700',
        fontSize: 12
    },
    enableText: {
        color: '#00A2D9'
    },
    disableText: {
        color: '#D3D3D3'
    }
})

export const CustomerEquipmentReqButton: FC<RequestButtonProps> = (props: RequestButtonProps) => {
    const { label, handlePress, disable = false } = props
    return (
        <TouchableOpacity
            style={[styles.btnStyle, disable ? styles.disableColor : styles.enableColor]}
            onPress={handlePress}
            disabled={disable}
        >
            <CText style={[styles.textStyle, disable ? styles.disableText : styles.enableText]}>{label}</CText>
        </TouchableOpacity>
    )
}

export default CustomerEquipmentReqButton

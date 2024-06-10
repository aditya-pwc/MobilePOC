/**
 * @description The wrapper for Confirm button in the form.
 * @author Shangmin Dou
 * @date 2021-05-10
 */
import React, { FC } from 'react'
import CText from '../../../common/components/CText'
import { TouchableOpacity, StyleSheet } from 'react-native'

interface ConfirmButtonProps {
    label: string
    handlePress: () => void
    disabled: boolean
}

const styles = StyleSheet.create({
    containerBasic: {
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        borderRadius: 6,
        width: '100%',
        marginTop: 20
    },
    fontWeight500: { fontWeight: '500' }
})

export const ConfirmButton: FC<ConfirmButtonProps> = (props: ConfirmButtonProps) => {
    const { label, handlePress, disabled } = props
    return (
        <TouchableOpacity
            style={{
                ...styles.containerBasic,
                borderColor: disabled ? '#F3F6F9' : '#00A2D9',
                backgroundColor: disabled ? '#F3F6F9' : '#00A2D9'
            }}
            onPress={() => {
                handlePress && handlePress()
            }}
            disabled={disabled}
        >
            <CText
                style={{
                    ...styles.fontWeight500,
                    color: disabled ? '#D3D3D3' : 'white'
                }}
            >
                {label}
            </CText>
        </TouchableOpacity>
    )
}

export default ConfirmButton

import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import CText from '../../../../../../common/components/CText'
import { baseStyle } from '../../../../../../common/styles/BaseStyle'

type ButtonType = 'confirm' | 'cancel'

const styles = StyleSheet.create({
    button: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0,
        textAlign: 'center',
        lineHeight: 60,
        textTransform: 'uppercase',
        fontFamily: 'Gotham-Bold'
    },
    buttonShadow: {
        shadowColor: '#0000001A',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.9,
        shadowRadius: 6
    },
    confirmButton: {
        backgroundColor: baseStyle.color.purple,
        color: '#FFFFFF'
    },
    confirmButtonDisabled: {
        backgroundColor: baseStyle.color.purple + '99'
    },
    cancelButton: {
        backgroundColor: '#FFFFFF',
        color: '#6C0CC3'
    }
})

interface ATCButtonProps extends React.PropsWithChildren {
    type?: ButtonType
    buttonStyle?: any
    disabled?: boolean
    onPress?: () => void
}

export const ATCButton: React.FC<ATCButtonProps> = ({
    type = 'confirm',
    buttonStyle,
    disabled = false,
    onPress = () => {},
    children
}) => {
    const getStyleByType = (type: ButtonType) => {
        const res = []
        if (type === 'confirm') {
            res.push(styles.confirmButton)
            if (disabled) {
                res.push(styles.confirmButtonDisabled)
            }
        } else {
            res.push(styles.cancelButton)
        }
        return res
    }

    return (
        <TouchableOpacity
            onPress={() => {
                if (!disabled) {
                    onPress()
                }
            }}
            style={{ flex: 1 }}
        >
            <CText style={[styles.button, ...getStyleByType(type), styles.buttonShadow, buttonStyle]}>{children}</CText>
        </TouchableOpacity>
    )
}

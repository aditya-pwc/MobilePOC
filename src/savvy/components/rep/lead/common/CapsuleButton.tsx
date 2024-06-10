/**
 * @description Component of a capsule button
 * @author Sheng Huang
 * @date 2021/10/22
 */
import { StyleSheet, TouchableOpacity } from 'react-native'
import CText from '../../../../../common/components/CText'
import React, { FC } from 'react'

interface CapsuleButtonProps {
    label: any
    checked?: boolean
    onChange?: any
}

const styles = StyleSheet.create({
    checkItem: {
        width: '48%',
        borderRadius: 20,
        borderColor: '#FFFFFF',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00A2D9',
        height: 30,
        marginBottom: 15
    },
    statusItem: {
        width: '48%',
        borderRadius: 20,
        borderColor: '#00A2D9',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 30,
        marginBottom: 15
    },
    unCheckLabel: {
        fontSize: 14,
        fontFamily: 'Gotham',
        color: '#00A2D9'
    },
    checkLabel: {
        fontSize: 14,
        fontFamily: 'Gotham',
        color: '#FFFFFF',
        fontWeight: '700'
    }
})

const CapsuleButton: FC<CapsuleButtonProps> = (props: CapsuleButtonProps) => {
    const { label, checked, onChange } = props
    return (
        <TouchableOpacity
            onPress={() => {
                onChange(!checked)
            }}
            style={checked ? styles.checkItem : styles.statusItem}
        >
            <CText
                style={[
                    checked ? styles.checkLabel : styles.unCheckLabel,
                    label.length > 30 ? { fontSize: 10 } : { fontSize: 12 }
                ]}
            >
                {label}
            </CText>
        </TouchableOpacity>
    )
}

export default CapsuleButton

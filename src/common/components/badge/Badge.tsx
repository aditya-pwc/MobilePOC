import React, { FC, ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import CText from '../CText'

type BadgeType = 'green' | 'yellow' | 'red' | 'grey' | 'green_outline' | 'grey_outline'

interface BadgeProps {
    type: BadgeType
    label: string
    leadingIcon?: ReactNode
}

const DEFAULT_CONFIG = {
    green: {
        containerStyle: { backgroundColor: '#2DD36F' },
        fontStyle: { color: '#FFFFFF' }
    },
    yellow: {
        containerStyle: { backgroundColor: '#FFC409' },
        fontStyle: { color: '#000000' }
    },
    red: {
        containerStyle: { backgroundColor: '#EB445A' },
        fontStyle: { color: '#FFFFFF' }
    },
    grey: {
        containerStyle: { backgroundColor: '#D3D3D3' },
        fontStyle: { color: '#565656' }
    },
    green_outline: {
        containerStyle: {
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#565656'
        },
        fontStyle: { color: '#565656' }
    },
    grey_outline: {
        containerStyle: {
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#2DD36F'
        },
        fontStyle: { color: '#2DD36F' }
    }
}

const styles = StyleSheet.create({
    containerStyle: {
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 10,
        paddingHorizontal: 7
    },
    labelStyle: {
        fontWeight: 'bold',
        fontSize: 12,
        textTransform: 'uppercase'
    }
})

export const Badge: FC<BadgeProps> = (props) => {
    const { type, label, leadingIcon } = props
    return (
        <View style={[styles.containerStyle, DEFAULT_CONFIG[type].containerStyle]}>
            {leadingIcon}
            <CText style={[styles.labelStyle, DEFAULT_CONFIG[type].fontStyle]}>{label}</CText>
        </View>
    )
}

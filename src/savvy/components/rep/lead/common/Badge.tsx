import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import CText from '../../../../../common/components/CText'

interface BadgeProps {
    label: string
}

const styles = StyleSheet.create({
    container: {
        marginRight: 10,
        backgroundColor: '#2DD36F',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textStyles: {
        color: 'white',
        fontWeight: '700'
    }
})

const Badge: FC<BadgeProps> = (props: BadgeProps) => {
    const { label } = props
    return (
        <View style={[styles.container, { width: label.length * 14 }]}>
            <CText style={styles.textStyles}>{label}</CText>
        </View>
    )
}

export default Badge

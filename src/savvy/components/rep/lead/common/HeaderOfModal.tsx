import React from 'react'
import { StyleSheet, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import HeaderCircle from '../HeaderCircle'

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: '5%',
        marginTop: 15,
        justifyContent: 'space-between',
        width: '100%'
    },
    title: {
        fontSize: 24,
        fontWeight: '900'
    }
})

interface HeaderOfModalProps {
    handleOnPress: any
    title: string
}

const HeaderOfModal = (props: HeaderOfModalProps) => {
    const { handleOnPress, title } = props

    return (
        <View style={styles.container}>
            <CText style={styles.title}>{title}</CText>
            <HeaderCircle
                onPress={() => {
                    handleOnPress && handleOnPress()
                }}
                transform={[{ scale: 0.85 }, { rotate: '45deg' }]}
                color={'#0098D4'}
            />
        </View>
    )
}

export default HeaderOfModal

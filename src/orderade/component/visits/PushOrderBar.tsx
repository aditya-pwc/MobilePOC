import React from 'react'
import { View, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native'
import CText from '../../../common/components/CText'

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 10,
        left: 20,
        right: 20,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#6C0CC3'
    },
    content: {
        height: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 20
    },
    icon: {
        width: 26,
        height: 22,
        marginRight: 10
    },
    leftContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    contentText: {
        fontSize: 14,
        color: 'white'
    },
    rightContent: {
        flex: 0,
        height: 50,
        justifyContent: 'center'
    },
    actionText: {
        fontSize: 12,
        color: 'white',
        fontWeight: '700',
        fontFamily: 'Gotham-Bold'
    }
})

interface PushOrderBarProps {
    icon: ImageSourcePropType
    text: string
    buttonText: string
    disabled: boolean
    onPress?: Function
}

const PushOrderBar: React.FC<PushOrderBarProps> = (props) => {
    const { icon, text, buttonText, disabled, onPress } = props

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.leftContent}>
                    <Image source={icon} style={styles.icon} />
                    <CText style={styles.contentText}>{text}</CText>
                </View>
                <TouchableOpacity
                    style={styles.rightContent}
                    onPress={() => {
                        onPress && onPress()
                    }}
                    disabled={disabled}
                >
                    <CText style={[styles.actionText, disabled ? { color: '#AAAFB4' } : {}]}>{buttonText}</CText>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default PushOrderBar

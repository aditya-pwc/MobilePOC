import React, { FC } from 'react'
import { StyleSheet } from 'react-native'
import IconChat from '../../../../assets/image/icon-chat-svg.svg'

const styles = StyleSheet.create({
    phone: {
        width: 18,
        height: 18,
        resizeMode: 'stretch'
    }
})

interface ChatIconProps {
    isDisabled: boolean
    imageStyle?: any
}

const ChatIcon: FC<ChatIconProps> = (props: ChatIconProps) => {
    const { isDisabled, imageStyle } = props

    const phoneColor = isDisabled ? '#D3D3D3' : '#00A2D9'
    return <IconChat style={[styles.phone, imageStyle, { color: phoneColor }]} />
}

export default ChatIcon

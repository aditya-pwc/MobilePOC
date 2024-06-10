import React, { FC } from 'react'
import { StyleSheet } from 'react-native'
import ICON_MSG_GRAY from '../../assets/image/icon-msg-svg.svg'

const styles = StyleSheet.create({
    message: {
        width: 18,
        height: 18,
        resizeMode: 'stretch'
    }
})

interface MessageIconProps {
    isDisabled: boolean
    imageStyle?: any
}

const MessageIcon: FC<MessageIconProps> = (props: MessageIconProps) => {
    const { isDisabled, imageStyle } = props

    const messageColor = isDisabled ? '#D3D3D3' : '#00A2D9'
    return <ICON_MSG_GRAY style={[styles.message, imageStyle, { color: messageColor }]} />
}

export default MessageIcon

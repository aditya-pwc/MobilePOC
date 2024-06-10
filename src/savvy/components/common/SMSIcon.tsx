import React, { FC } from 'react'
import { StyleSheet } from 'react-native'

import IconMessage from '../../../../assets/image/icon_message.svg'

const styles = StyleSheet.create({
    phone: {
        width: 18,
        height: 18,
        resizeMode: 'stretch'
    }
})

interface SMSIconProps {
    isDisabled: boolean
    imageStyle?: any
}

const SMSIcon: FC<SMSIconProps> = (props: SMSIconProps) => {
    const { isDisabled, imageStyle } = props

    const phoneColor = isDisabled ? '#D3D3D3' : '#00A2D9'
    return <IconMessage style={[styles.phone, imageStyle, { color: phoneColor }]} />
}

export default SMSIcon

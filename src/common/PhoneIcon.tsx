import React, { FC } from 'react'
import { StyleSheet } from 'react-native'

import IconPhone from '../../assets/image/icon-phone-svg.svg'

const styles = StyleSheet.create({
    phone: {
        width: 18,
        height: 18,
        resizeMode: 'stretch'
    }
})

interface PhoneIconProps {
    isDisabled: boolean
    imageStyle?: any
}

const PhoneIcon: FC<PhoneIconProps> = (props: PhoneIconProps) => {
    const { isDisabled, imageStyle } = props

    const phoneColor = isDisabled ? '#D3D3D3' : '#00A2D9'
    return <IconPhone style={[styles.phone, imageStyle, { color: phoneColor }]} />
}

export default PhoneIcon

import { Image, Linking, TouchableOpacity } from 'react-native'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import React from 'react'
import CustomerDetailStyle from '../../styles/manager/CustomerDetailStyle'

const styles = CustomerDetailStyle

export const renderPhoneButton = (phone) => {
    if (phone) {
        return (
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${phone}`)}>
                <Image style={styles.imgPhoneAndMsg} source={ImageSrc.ICON_CALL} />
            </TouchableOpacity>
        )
    }
    return (
        <TouchableOpacity onPress={() => null}>
            <Image style={styles.imgPhoneAndMsg} source={ImageSrc.ICON_CALL} />
        </TouchableOpacity>
    )
}

import React from 'react'
import { StyleSheet, TouchableOpacity, Image } from 'react-native'
import { ImageSrc } from '../../../../../../common/enums/ImageSrc'

interface CardGroupImageProps extends React.PropsWithChildren {
    open?: boolean
    hide?: boolean
    onPress?: () => void
}

const styles = StyleSheet.create({
    flexCenter: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    hide: {
        display: 'none'
    },
    image: {
        width: 22,
        height: 23
    }
})

export const CardGroupImage: React.FC<CardGroupImageProps> = ({ hide = false, open = false, onPress = () => {} }) => {
    // source={ImageSrc.IOS_CHEVRON_UP} is for iOS fixed line close icon
    return (
        <TouchableOpacity style={[styles.flexCenter, hide ? styles.hide : null]} onPress={onPress}>
            <Image
                style={[styles.image, open ? { transform: [{ rotate: '180deg' }] } : null]}
                resizeMode={'contain'}
                source={ImageSrc.ICON_GROUP_CLOSED_GREY}
            />
        </TouchableOpacity>
    )
}

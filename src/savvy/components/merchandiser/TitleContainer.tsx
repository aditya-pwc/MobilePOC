/**
 * @description MyWeek Component
 * @author Yi Li
 * @email yi.b.li@pwc.com
 * @date 2021-08-23
 */

import React, { FC } from 'react'
import { View, TouchableOpacity, Image } from 'react-native'
import CText from '../../../common/components/CText'
import { ImageSrc } from '../../../common/enums/ImageSrc'

interface TitleContainerProps {
    titleContain?
    titleStyle?
    filtContainer?
    filtTitleStyle?
    filtImgStyle?
    title?
    subtitle?
    onPress?
}

const TitleContainer: FC<TitleContainerProps> = (props: TitleContainerProps) => {
    const { titleContain, titleStyle, filtContainer, filtTitleStyle, filtImgStyle, title, subtitle, onPress } = props

    return (
        <View style={titleContain}>
            <CText style={titleStyle}>{title}</CText>
            <TouchableOpacity style={filtContainer} onPress={onPress}>
                <CText style={filtTitleStyle}>{subtitle}</CText>
                <Image style={filtImgStyle} source={ImageSrc.IMG_TRIANGLE} />
            </TouchableOpacity>
        </View>
    )
}

export default TitleContainer

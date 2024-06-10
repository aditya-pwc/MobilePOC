/**
 * @description Select schedule component.
 * @author Xupeng Bao
 * @email xupeng.bao@pwc.com
 * @date 2021-05-17
 */

import React, { FC } from 'react'
import { Image, TouchableOpacity, StyleSheet } from 'react-native'
import { BackButtonProps } from '../../interface/BaseInterface'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { commonStyle } from '../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    backButton: {
        width: 30,
        height: 30,
        left: 0,
        top: 0,
        justifyContent: 'center'
    },
    backButtonIcon: {
        width: 12,
        height: 21
    }
})

const BackButton: FC<BackButtonProps> = (props: BackButtonProps) => {
    const { navigation, onBackPress, extraStyle } = props
    return (
        <TouchableOpacity
            hitSlop={commonStyle.hitSlop}
            onPress={() => {
                onBackPress ? onBackPress() : navigation.goBack && navigation.goBack()
            }}
            style={styles.backButton}
        >
            <Image source={ImageSrc.IMG_BACK} style={[styles.backButtonIcon, extraStyle]} />
        </TouchableOpacity>
    )
}

export default BackButton

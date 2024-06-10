/**
 * @description Favorite bar.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2022-08-03
 */

import React, { FC } from 'react'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import CText from '../../../../common/components/CText'
import FavoriteIcon from '../../../../../assets/image/favorite.svg'
import { t } from '../../../../common/i18n/t'

interface FavoriteBarProps {
    count?: number
    isOpen?: boolean
    onClick?: Function
}

const ARROW_DOWN = ImageSrc.ARROW_DOWN
const ARROW_UP = ImageSrc.ARROW_UP

const styles = StyleSheet.create({
    containerStyle: {
        backgroundColor: baseStyle.color.bgGray,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 22,
        height: 50
    },
    textStyle: {
        flex: 1,
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        marginLeft: 10
    },
    arrowIcon: {
        width: 23,
        height: 26
    }
})

const getArrowImage = (isOpen) => {
    return !isOpen ? ARROW_DOWN : ARROW_UP
}

const FavoriteBar: FC<FavoriteBarProps> = (props: FavoriteBarProps) => {
    return (
        <TouchableOpacity activeOpacity={1} onPress={() => props.onClick && props.onClick()}>
            <View style={styles.containerStyle}>
                <FavoriteIcon width={19} height={24} />
                <CText style={styles.textStyle}>
                    {props.count > 0 ? props.count : ''}{' '}
                    {props.count === 1 ? t.labels.PBNA_MOBILE_FAVORITE : t.labels.PBNA_MOBILE_FAVORITES}
                </CText>
                <Image source={getArrowImage(props.isOpen)} style={styles.arrowIcon} />
            </View>
        </TouchableOpacity>
    )
}

export default FavoriteBar

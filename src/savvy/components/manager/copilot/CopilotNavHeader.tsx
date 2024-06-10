/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-10-27 04:07:04
 * @LastEditTime: 2021-10-27 04:10:14
 * @LastEditors: Mary Qian
 */

import React from 'react'
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native'
import CText from '../../../../common/components/CText'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { ImageSrc } from '../../../../common/enums/ImageSrc'

const ARROW_HEIGHT = 22
const PADDING_TOP = 60
const PADDING_LEFT = 22
const styles = StyleSheet.create({
    header: {
        height: 115,
        backgroundColor: baseStyle.color.LightBlue
    },
    title: {
        width: '100%',
        height: ARROW_HEIGHT,
        marginTop: PADDING_TOP,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        lineHeight: ARROW_HEIGHT,
        textAlign: 'center',
        color: baseStyle.color.white
    },
    hitSlop: {
        top: 30,
        bottom: 30,
        left: 50,
        right: 50
    },
    backBtnContainer: {
        position: 'absolute',
        left: PADDING_LEFT,
        top: PADDING_TOP
    },
    backButton: {
        width: 12,
        height: ARROW_HEIGHT,
        tintColor: 'white'
    }
})

const CopilotNavHeader = (props: any) => {
    const { navigation, title } = props

    return (
        <View style={styles.header}>
            <CText style={styles.title}>{title}</CText>
            <TouchableOpacity
                hitSlop={styles.hitSlop}
                style={styles.backBtnContainer}
                onPress={() => navigation.goBack()}
            >
                <Image source={ImageSrc.IMG_BACK} style={styles.backButton} />
            </TouchableOpacity>
        </View>
    )
}

export default CopilotNavHeader

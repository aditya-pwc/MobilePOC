/*
 * @Date: 2022-03-29 15:35:33
 * @LastEditors: Matthew Huang
 * @LastEditTime: 2022-06-17 12:57:57
 */
/**
 * @description row msg and phone view
 * @author Xupeng Bao
 * @email xupeng.bao@pwc.com
 * @date 2021-08-12
 */

import _ from 'lodash'
import React from 'react'
import { View, Image, Linking, StyleSheet, TouchableOpacity } from 'react-native'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { commonStyle } from '../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    flexDirectionRow: {
        flexDirection: 'row',
        marginLeft: 5
    },
    imgMsg: {
        width: 26,
        height: 24,
        marginRight: 20
    },
    imgCall: {
        ...commonStyle.size_24
    },
    toGrayscale: {
        tintColor: 'gray'
    }
})

const RowMsgPhoneView = (phone: string, detail?: boolean, imgMsgSize?: object, imgCallSize?: object) => {
    return (
        <View style={styles.flexDirectionRow}>
            <TouchableOpacity onPress={() => !_.isEmpty(phone) && Linking.openURL(`sms://${phone}`)}>
                <Image
                    style={[styles.imgMsg, imgMsgSize]}
                    source={detail ? ImageSrc.WHITE_IMG_MSG : ImageSrc.IMG_MSG}
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => !_.isEmpty(phone) && Linking.openURL(`tel://${phone}`)}>
                <Image
                    style={[styles.imgCall, imgCallSize]}
                    source={detail ? ImageSrc.WHITE_IMG_PHONE : ImageSrc.ICON_CALL}
                />
            </TouchableOpacity>
        </View>
    )
}

export const BetterRowMsgPhoneView = (phone: string, detail?: boolean, imgMsgSize?: object, imgCallSize?: object) => {
    return (
        <View style={styles.flexDirectionRow}>
            <TouchableOpacity
                activeOpacity={phone ? 0.2 : 1}
                onPress={() => !_.isEmpty(phone) && Linking.openURL(`sms:${phone}`)}
            >
                <Image
                    style={[styles.imgMsg, imgMsgSize, !phone && styles.toGrayscale]}
                    source={detail ? ImageSrc.WHITE_IMG_MSG : ImageSrc.IMG_MSG}
                />
            </TouchableOpacity>
            <TouchableOpacity
                activeOpacity={phone ? 0.2 : 1}
                onPress={() => !_.isEmpty(phone) && Linking.openURL(`tel:${phone}`)}
            >
                <Image
                    style={[styles.imgCall, imgCallSize, !phone && styles.toGrayscale]}
                    source={detail ? ImageSrc.WHITE_IMG_PHONE : ImageSrc.ICON_CALL}
                />
            </TouchableOpacity>
        </View>
    )
}

export default RowMsgPhoneView

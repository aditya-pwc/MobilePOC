/*
 * @Description:
 * @Author: fangfang ji
 * @Date: 2021-09-07 21:42:35
 * @LastEditTime: 2021-12-09 07:15:46
 * @LastEditors: Mary Qian
 */
/**
 * @description UserAvatar.
 * @author fangfang ji
 * @email fangfang.ji@pwc.com
 * @date 2021-06-07
 */

import React, { useState } from 'react'
import { Image, StyleSheet, TextStyle, View } from 'react-native'
import { baseStyle } from '../styles/BaseStyle'
import CText from './CText'
import { CommonParam } from '../CommonParam'
import FastImage, { ImageStyle } from 'react-native-fast-image'
import { ImageSrc } from '../enums/ImageSrc'

const styles = StyleSheet.create({
    imgPortrait: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    userName: {
        color: baseStyle.color.white,
        fontSize: 14,
        position: 'absolute'
    },
    noDisplay: {
        width: 0,
        height: 0
    },
    defaultStyle: {
        position: 'absolute',
        width: '100%',
        height: '100%'
    },
    avatarBorder: {
        borderWidth: 2,
        borderColor: baseStyle.color.loadingGreen
    }
})

interface AvatarProps {
    firstName?: string
    lastName?: string
    userNameText?: TextStyle
    avatarStyle: ImageStyle
    isUnassigned?: boolean
    needBorder?: boolean
    url: string
}

const UserAvatar = (props: AvatarProps) => {
    const fistNameLe = props.firstName ? props.firstName.substring(0, 1) : ''
    const lastNameLe = props.lastName ? props.lastName.substring(0, 1) : ''
    const url = props.url
    const [isDefault, setIsDefault] = useState(true)
    const defaultBg = require('../../../assets/image/user-default-avatar-bg.png')
    return (
        <View style={[props.avatarStyle, styles.imgPortrait]}>
            <FastImage
                source={{
                    // uri: `${CommonParam.endpoint}/${CommonApi.PBNA_MOBILE_API_APEX_REST}/${CommonApi.PBNA_MOBILE_API_USER_PHOTO}/${userStatsId}?${refreshFlag}`,
                    uri: url,
                    headers: {
                        Authorization: `Bearer ${CommonParam.accessToken}`,
                        accept: 'image/png'
                    },
                    cache: FastImage.cacheControl.web
                }}
                style={[isDefault ? styles.noDisplay : props.avatarStyle, props.needBorder && styles.avatarBorder]}
                onError={() => {
                    setIsDefault(true)
                }}
                onLoad={() => {
                    setIsDefault(false)
                }}
            />
            {isDefault && (
                <View style={[styles.imgPortrait, styles.defaultStyle]}>
                    <Image
                        source={props.isUnassigned ? ImageSrc.IMG_UNASSIGNED : defaultBg}
                        style={[
                            styles.defaultStyle,
                            { borderRadius: props.avatarStyle.borderRadius },
                            props.needBorder && styles.avatarBorder
                        ]}
                    />
                    <CText style={[styles.userName, props.userNameText]}>
                        {fistNameLe}
                        {lastNameLe}
                    </CText>
                </View>
            )}
        </View>
    )
}

export default UserAvatar

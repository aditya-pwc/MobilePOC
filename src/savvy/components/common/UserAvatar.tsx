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
import { Image, StyleSheet, View } from 'react-native'
import { baseStyle } from '../../../common/styles/BaseStyle'
import CText from '../../../common/components/CText'
import { CommonParam } from '../../../common/CommonParam'
import FastImage from 'react-native-fast-image'
import { useSelector } from 'react-redux'
import { CommonApi } from '../../../common/api/CommonApi'
import { ImageSrc } from '../../../common/enums/ImageSrc'

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
    userStatsId: any
    firstName?: any
    lastName?: any
    userNameText?: any
    avatarStyle: any
    isUnassigned?: boolean
    needBorder?: boolean
}

const managerReducer = (state) => state.manager

const UserAvatar = (props: AvatarProps) => {
    const manager = useSelector(managerReducer)
    const refreshFlag = manager.avatarRefreshFlag
    const userStatsId = props.userStatsId
    const fistNameLe = props.firstName ? props.firstName.slice(0, 1) : ''
    const lastNameLe = props.lastName ? props.lastName.slice(0, 1) : ''
    const [isDefault, setIsDefault] = useState(true)
    const defaultBg = require('../../../../assets/image/user-default-avatar-bg.png')
    return (
        <View style={[props.avatarStyle, styles.imgPortrait]}>
            <FastImage
                source={{
                    uri: `${CommonParam.endpoint}/${CommonApi.PBNA_MOBILE_API_APEX_REST}/${CommonApi.PBNA_MOBILE_API_USER_PHOTO}/${userStatsId}?${refreshFlag}`,
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

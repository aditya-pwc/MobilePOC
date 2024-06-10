/*
 * @Description: Do not edit
 * @Author: Do not edit
 * @Date: 2021-12-14 01:01:23
 * @LastEditTime: 2022-05-17 03:07:50
 * @LastEditors: Yi Li
 */
/**
 * @description employeeitem message phone view
 * @author Fangfang Ji
 * @email Fangfang.ji@pwc.com
 * @date 2021-07-28
 */
import React from 'react'
import { View, TouchableOpacity, Linking, Image } from 'react-native'
import styles from '../../../styles/manager/EmployeeItemStyle'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { commonStyle } from '../../../../common/styles/CommonStyle'

interface PhoneMsgViewProps {
    phone?: string
    phoneStyle?: any
    noteStyle?: any
    style?: any
}

const PhoneMsgView = (props: PhoneMsgViewProps) => {
    const { phone, phoneStyle, noteStyle } = props
    return (
        <View style={[props.style]}>
            <TouchableOpacity onPress={() => phone && Linking.openURL(`tel:${phone}`)}>
                <Image style={[styles.imgPhoneAndMsg, phoneStyle]} source={ImageSrc.ICON_CALL} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => phone && Linking.openURL(`sms:${phone}`)}>
                <Image style={[styles.imgPhoneAndMsg, commonStyle.marginTop_20, noteStyle]} source={ImageSrc.IMG_MSG} />
            </TouchableOpacity>
        </View>
    )
}

export default PhoneMsgView

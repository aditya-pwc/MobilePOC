/*
 * @Description: common svg Phon and msg Icon
 * @Author: Yuan Yue
 * @Date: 2022-6-17 10:02:23
 * @LastEditTime:  2022-6-17 10:02:23
 * @LastEditors: Yuan Yue
 */

import _ from 'lodash'
import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import IconChat from '../../../../../assets/image/icon-chat-svg.svg'
import IconPhone from '../../../../../assets/image/icon-phone-svg.svg'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { callPhone, smsPhone } from '../../../../common/helpers/IconHelper'

interface PhoneMsgViewProps {
    phone?: string
    phoneStyle?: any
    noteStyle?: any
    style?: any
    phoneWidth?: number
    phoneHeight?: number
    chatWidth?: number
    chatHeight?: number
}

const SVGPhoneMsgView = (props: PhoneMsgViewProps) => {
    const { phone, phoneStyle, noteStyle, phoneWidth, phoneHeight, chatWidth, chatHeight } = props

    const phoneColor = _.isEmpty(phone) ? '#D3D3D3' : '#00A2D9'

    return (
        <View style={[props.style]}>
            <TouchableOpacity onPress={async () => await callPhone(phone)}>
                <IconPhone
                    width={phoneWidth || 18}
                    height={phoneHeight || 18}
                    style={[phoneStyle, { color: phoneColor }]}
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={async () => await smsPhone(phone)}>
                <IconChat
                    width={chatWidth || 20}
                    height={chatHeight || 20}
                    style={[commonStyle.marginTop_20, noteStyle, { color: phoneColor }]}
                />
            </TouchableOpacity>
        </View>
    )
}

export default SVGPhoneMsgView

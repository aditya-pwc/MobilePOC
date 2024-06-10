/**
 * @description A message bar.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-08-19
 */

import React, { FC } from 'react'
import { View, StyleSheet, Image } from 'react-native'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import CText from '../../../../common/components/CText'
import WhiteExclamation from '../../../../../assets/image/white-exclamation.svg'

interface MessageBarProps {
    containerStyle?: any
    textStyle?: any
    message?: any
    imageUrl?: any
    noImage?: boolean
}

const DEFAULT_ICON_SIZE = 26

const styles = StyleSheet.create({
    containerStyle: {
        backgroundColor: baseStyle.color.red,
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    iconStyle: {
        marginRight: 10
    },
    textStyle: {
        flex: 1,
        color: baseStyle.color.white,
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400
    },
    iconSize: {
        width: DEFAULT_ICON_SIZE,
        height: DEFAULT_ICON_SIZE
    }
})

const MessageBar: FC<MessageBarProps> = (props: MessageBarProps) => {
    return (
        <View style={[styles.containerStyle, props.containerStyle]}>
            {!props.noImage &&
                (props.imageUrl ? (
                    <Image source={props.imageUrl} style={[styles.iconStyle, styles.iconSize]} />
                ) : (
                    <WhiteExclamation style={styles.iconStyle} width={DEFAULT_ICON_SIZE} height={DEFAULT_ICON_SIZE} />
                ))}
            <CText style={props.textStyle || styles.textStyle}>{props.message}</CText>
        </View>
    )
}

export default MessageBar

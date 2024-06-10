/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-08-23 11:10:45
 * @LastEditTime: 2022-11-21 22:09:47
 * @LastEditors: Mary Qian
 */
import React, { FC } from 'react'
import { StyleSheet, TextStyle } from 'react-native'
import CText from '../../../common/components/CText'

interface SuccessMessageProps {
    children: any
    textStyle?: TextStyle
}

const styles = StyleSheet.create({
    popContainer: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    }
})

const PopMessage: FC<SuccessMessageProps> = (props: SuccessMessageProps) => {
    const { children } = props
    return (
        <CText numberOfLines={3} style={[styles.popContainer, props.textStyle]}>
            {children}
        </CText>
    )
}

export default PopMessage

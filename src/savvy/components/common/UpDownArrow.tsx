/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-08-11 02:20:25
 * @LastEditTime: 2021-08-23 03:22:58
 * @LastEditors: Mary Qian
 */
import React from 'react'
import { StyleSheet } from 'react-native'
import ArrowLeft from '../../../../assets/image/ios-chevron-left-svg.svg'

const styles = StyleSheet.create({
    arrow: {
        width: 25,
        height: 26
    },
    iconUp: {
        transform: [{ rotate: '90deg' }]
    },
    iconDown: {
        transform: [{ rotate: '270deg' }]
    }
})

interface ArrowProps {
    isExpand: boolean
    style?: any
}

const UpDownArrow = (props: ArrowProps) => {
    const { isExpand, style } = props

    if (isExpand) {
        return <ArrowLeft style={[styles.arrow, styles.iconUp, style]} />
    }
    return <ArrowLeft style={[styles.arrow, styles.iconDown, style]} />
}

export default UpDownArrow

/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2023-12-11 18:51:36
 * @LastEditTime: 2024-01-29 14:47:00
 * @LastEditors: Mary Qian
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'

const DEFAULT_COLOR = '#00A2D9'

const styles = StyleSheet.create({
    commonView: {
        position: 'absolute',
        backgroundColor: '#00A2D9'
    }
})

interface AddButtonProps {
    color?: string
}

const AddButton = (props: AddButtonProps) => {
    const { color } = props
    const outWidth = 30
    const outHeight = 26
    const inWidth = 20
    const inHeight = 18
    const lineWidth = 3

    return (
        <View style={{ width: outWidth, height: outHeight }}>
            <View
                style={[
                    styles.commonView,
                    { backgroundColor: color || DEFAULT_COLOR },
                    {
                        width: inWidth,
                        height: lineWidth,
                        top: (outHeight - lineWidth) / 2,
                        left: (outWidth - inWidth) / 2
                    }
                ]}
            />
            <View
                style={[
                    styles.commonView,
                    { backgroundColor: color || DEFAULT_COLOR },
                    {
                        width: lineWidth,
                        height: inHeight,
                        top: (outHeight - inHeight) / 2,
                        left: (outWidth - lineWidth) / 2
                    }
                ]}
            />
        </View>
    )
}

export default AddButton

/*
 * @Description: DelTopLineCell
 * @Author: Aimee Zhang
 * @Date: 2022-01-18 14:29:48
 * @LastEditTime: 2022-05-17 00:34:38
 * @LastEditors: Yi Li
 */
import React from 'react'
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import CText from '../../../../common/components/CText'

interface DelTopLineCellPros {
    cellStyle?: StyleProp<ViewStyle>
    title: string
    subTitle: string
    unit?: string
    subString?: string
    unitTwo?: string
}
const styles = StyleSheet.create({
    cellTitleDefault: {
        fontSize: baseStyle.fontSize.fs_12
    },
    cellSubTitleDefault: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        paddingTop: 6
    }
})

const DelTopLineCell = (props: DelTopLineCellPros) => {
    const { cellStyle, title, subTitle, unit, subString, unitTwo } = props

    return (
        <View style={cellStyle}>
            <CText style={styles.cellTitleDefault} numberOfLines={1}>
                {title}
            </CText>
            <CText style={styles.cellSubTitleDefault} numberOfLines={1}>
                {subTitle}
                {unit}
                {subString}
                {unitTwo}
            </CText>
        </View>
    )
}
export default DelTopLineCell

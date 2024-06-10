/*
 * @Description: Do not edit
 * @Author: Yi Li
 * @Date: 2021-12-10 04:29:48
 * @LastEditTime: 2021-12-13 01:13:59
 * @LastEditors: Yi Li
 */
import React from 'react'
import { View, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import CText from '../../../../common/components/CText'

interface OverviewSegmentCellPros {
    cellCustomerStyle?: StyleProp<ViewStyle>
    hasBottomBorder?: boolean
    title?: string | any
    subTitle?: string
    rightIcon?: React.ReactChild | React.ReactChildren | React.ReactElement<any>[]
    onPressCell?: Function
    cellTitleStyle?: StyleProp<TextStyle>
    cellSubTitleStyle?: StyleProp<TextStyle>
}
const styles = StyleSheet.create({
    cellContainer: {
        marginHorizontal: 22,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cellContainerLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    cellTitleDefault: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    cellRightView: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    cellSubTitleDefault: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    }
})

const OverviewSegmentCell = (props: OverviewSegmentCellPros) => {
    const {
        cellCustomerStyle,
        hasBottomBorder,
        title,
        subTitle,
        rightIcon,
        onPressCell,
        cellTitleStyle,
        cellSubTitleStyle
    } = props

    return (
        <View style={[styles.cellContainer, cellCustomerStyle, hasBottomBorder && styles.cellContainerLine]}>
            <CText style={[styles.cellTitleDefault, cellTitleStyle]}>{title}</CText>
            {(subTitle || rightIcon) && (
                <TouchableOpacity
                    style={styles.cellRightView}
                    onPress={() => {
                        onPressCell && onPressCell()
                    }}
                >
                    <CText style={[styles.cellSubTitleDefault, cellSubTitleStyle]}>{subTitle}</CText>
                    {rightIcon}
                </TouchableOpacity>
            )}
        </View>
    )
}
export default OverviewSegmentCell

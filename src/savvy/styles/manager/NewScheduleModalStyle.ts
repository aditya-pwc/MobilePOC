/**
 * @description New Schedule Modal style.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-05-24
 */

import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { StyleSheet } from 'react-native'

const NewScheduleModalStyle = StyleSheet.create({
    modalStyle: {
        marginBottom: 0
    },
    handleStyle: {
        height: 4,
        width: 41,
        backgroundColor: baseStyle.color.borderGray,
        marginTop: 25
    },
    contentStyle: {
        height: 516,
        flexDirection: 'column'
    },
    titleView: {
        marginTop: 40,
        marginBottom: 15
    },
    titleText: {
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_12
    },
    dividerView: {
        ...commonStyle.fullWidth,
        paddingHorizontal: baseStyle.padding.pd_22
    },
    divider: {
        backgroundColor: baseStyle.color.borderGray,
        ...commonStyle.fullWidth,
        height: 1
    },
    imgGS: {
        marginTop: 70,
        marginBottom: 48,
        width: 184,
        height: 156
    },
    gText: {
        fontSize: baseStyle.fontSize.fs_18,
        fontWeight: baseStyle.fontWeight.fw_900,
        color: baseStyle.color.black
    },
    gBtn: {
        height: 60,
        backgroundColor: baseStyle.color.purple,
        position: 'absolute',
        bottom: 0,
        right: 0,
        ...commonStyle.fullWidth,
        ...commonStyle.alignCenter
    },
    gBtnText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.white
    },
    alignCenter: commonStyle.alignCenter
})

export default NewScheduleModalStyle

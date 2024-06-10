/**
 * @description Month week style.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-05-25
 */

import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { StyleSheet } from 'react-native'

const MonthWeekStyle = StyleSheet.create({
    container: {
        ...commonStyle.flexRowSpaceBet
    },
    dayList: {
        marginTop: 28
    },
    weekLabel: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.titleGray,
        marginLeft: 25,
        marginRight: 25
    },
    imgTriangle: {
        width: 30,
        height: 16,
        marginTop: 10
    },
    dateContainerView: {
        flex: 1,
        ...commonStyle.flexRowSpaceBet,
        paddingLeft: 10,
        paddingRight: 10,
        marginTop: 25
    },
    dateBgStyle: {
        borderRadius: 4,
        paddingLeft: 10,
        paddingRight: 10,
        height: 52,
        ...commonStyle.alignCenter
    },
    dateBgStyle2: {
        borderRadius: 20,
        height: 32,
        width: 45,
        ...commonStyle.alignCenter
    },
    dateView: {
        ...commonStyle.alignCenter
    },
    dateWeekText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.white
    },
    dateText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_500,
        marginTop: 9,
        color: baseStyle.color.borderGray
    },
    dateSingleWeekText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.tabBlue
    },
    dateSingleText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_500,
        marginTop: 9,
        color: baseStyle.color.borderGray
    },
    disabledDate: {
        color: baseStyle.color.borderGray
    },
    checkedDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: baseStyle.color.purple,
        position: 'absolute',
        top: -2,
        right: -2
    },
    checkedDot2: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: baseStyle.color.purple,
        borderWidth: 1,
        borderColor: 'white',
        position: 'absolute',
        top: 0,
        right: 0
    }
})

export default MonthWeekStyle

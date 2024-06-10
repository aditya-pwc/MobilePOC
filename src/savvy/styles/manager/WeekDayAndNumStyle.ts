/**
 * @description Employee cell style.
 * @author Xupeng Bao
 * @email xupeng.bao@pwc.com
 * @date 2021-06-10
 */

import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { StyleSheet } from 'react-native'

const WeekDayAndNumStyle = StyleSheet.create({
    weekView: {
        ...commonStyle.flexRowSpaceCenter,
        marginHorizontal: baseStyle.margin.mg_22,
        paddingVertical: 12.5,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray
    },
    weekLabel: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black
    },
    tipLabel: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.red
    },
    numView: {
        ...commonStyle.flexRowSpaceCenter,
        width: 100,
        height: 40
    },
    symbolText: {
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_500,
        color: baseStyle.color.tabBlue
    },
    disableSymbolText: {
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_500,
        color: baseStyle.color.borderGray
    },
    hitSlopStyle: {
        left: 10,
        right: 10
    },
    numMidView: {
        width: 50,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: baseStyle.color.borderGray,
        borderRadius: 6
    },
    numText: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    subNumText: {
        fontSize: baseStyle.fontSize.fs_8,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    dayContainer: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    numContainer: {
        width: 100
    },
    avatarContainer: {
        marginLeft: 9,
        flexDirection: 'row'
    }
})

export default WeekDayAndNumStyle

/**
 * @description Month week filter style.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-05-25
 */

import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { StyleSheet } from 'react-native'

const MonthWeekFilterStyle = StyleSheet.create({
    flexDirectionRow: {
        flexDirection: 'row'
    },
    dayList: {
        marginTop: 28
    },
    ADASList: {
        marginTop: 0,
        backgroundColor: baseStyle.color.white
    },
    dayListEmployee: {
        marginTop: 15
    },
    weekLabel: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.titleGray,
        marginLeft: 25
    },
    checkImg: {
        width: 14,
        height: 14,
        marginLeft: 5
    },
    waringPos: {
        position: 'relative',
        top: -1
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
    dateADASContainerView: {
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: baseStyle.color.white,
        paddingTop: 25
    },
    dateBgStyle: {
        borderRadius: 4,
        paddingLeft: 10,
        paddingRight: 10,
        height: 52,
        ...commonStyle.alignCenter
    },
    dateView: {
        ...commonStyle.alignCenter
    },
    ADASView: {
        ...commonStyle.alignCenter,
        paddingHorizontal: 5
    },
    dateWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 25
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
    ADASDate: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        marginTop: 9,
        color: baseStyle.color.black
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
    imgBground: {
        ...commonStyle.fullWidth,
        height: 120
    },
    imgBgroundNoSeg: {
        ...commonStyle.fullWidth,
        height: 100
    },
    weekStyle: {
        ...commonStyle.flexRowSpaceBet
    },
    blackColor: {
        color: baseStyle.color.black
    },
    greyColor: {
        color: baseStyle.color.titleGray
    },
    bgBlue: {
        backgroundColor: baseStyle.color.tabBlue
    },
    bgTrans: {
        backgroundColor: baseStyle.color.transparent
    },
    whiteColor: {
        color: baseStyle.color.white
    },
    d3Color: {
        color: baseStyle.color.borderGray
    },
    blueColor: {
        color: baseStyle.color.tabBlue
    },
    activePot: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        right: -2,
        top: -2,
        backgroundColor: '#6C0CC3'
    },
    loadingView: {
        flex: 1,
        position: 'absolute'
    },
    adasDateView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15
    },
    dateASASContainerView: {
        paddingHorizontal: 22,
        backgroundColor: baseStyle.color.white,
        paddingTop: 30
    },
    bgDeepBlue: {
        backgroundColor: baseStyle.color.tabShadowBlue
    },
    marginTop_10: {
        marginTop: 10
    },
    paddingHorizontal_5: {
        paddingLeft: 5,
        paddingRight: 5
    }
})

export default MonthWeekFilterStyle

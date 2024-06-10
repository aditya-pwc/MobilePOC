/**
 * @description EmployeeItem style.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-05-25
 */

import { StyleSheet } from 'react-native'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
const SpaceBetween = 'space-between'
const Row = 'row'
const Center = 'center'
const EmployeeItemStyle = StyleSheet.create({
    container: {
        paddingHorizontal: baseStyle.padding.pd_22,
        justifyContent: SpaceBetween,
        flexDirection: Row,
        alignItems: Center,
        marginBottom: 16,
        marginHorizontal: baseStyle.margin.mg_22,
        borderRadius: 6,
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        backgroundColor: baseStyle.color.white
    },
    imgAvatar: {
        width: 58,
        height: 58,
        borderRadius: 8
    },
    content: {
        flex: 1,
        flexGrow: 1,
        flexDirection: Row,
        justifyContent: SpaceBetween,
        alignItems: Center,
        // height: 100,
        paddingRight: baseStyle.padding.pd_22,
        paddingTop: baseStyle.padding.pd_20,
        paddingBottom: baseStyle.padding.pd_20
    },
    userName: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    status: {
        flexDirection: Row,
        alignItems: Center,
        marginTop: 7
    },
    totalVisits: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    middle: {
        flex: 1,
        flexGrow: 1
    },
    rightBtn: {
        flexDirection: Row,
        marginLeft: baseStyle.margin.mg_20
    },
    topRow: {
        justifyContent: SpaceBetween,
        flexDirection: Row,
        marginBottom: 5
    },
    leftCol: {
        flexShrink: 1
    },
    flexDirectionRow: {
        flexDirection: Row,
        alignItems: Center
    },
    textWorking: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        marginRight: 8
    },
    textOffDay: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        marginRight: 8,
        color: baseStyle.color.borderGray
    },
    line: {
        color: baseStyle.color.borderGray
    },
    totalHours: {
        color: baseStyle.color.titleGray,
        fontSize: baseStyle.fontSize.fs_12
    },
    totalHoursActive: {
        fontWeight: baseStyle.fontWeight.fw_bold,
        color: baseStyle.color.red
    },
    totalCases: {
        color: baseStyle.color.titleGray,
        fontSize: baseStyle.fontSize.fs_12
    },
    borderBottomWidth0: {
        borderBottomWidth: 0
    },
    borderBottomWidth1: {
        borderBottomWidth: 1
    },
    borderBottomColorWhite: {
        borderBottomColor: baseStyle.color.white
    },
    backgroundColorGrey: {
        backgroundColor: baseStyle.color.bgGray
    },
    backgroundColorWhite: {
        backgroundColor: baseStyle.color.white
    },
    marginRight15: {
        marginRight: 15
    },
    textTime: {
        color: baseStyle.color.titleGray,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400
    },
    textRole: {
        color: baseStyle.color.titleGray,
        fontSize: baseStyle.fontSize.fs_12
    },
    height110: {
        height: 110
    },
    grayBg: {
        backgroundColor: baseStyle.color.bgGray
    },
    imgPhoneAndMsg: {
        ...commonStyle.size_24
    },
    userNameText: {
        fontSize: baseStyle.fontSize.fs_24
    },
    unassignedRouteContainer: {
        flex: 1,
        width: '100%',
        height: 110,
        backgroundColor: 'white',
        flexDirection: 'row',
        paddingHorizontal: 20,
        borderRadius: 6,
        alignItems: 'center'
    }
})
export default EmployeeItemStyle

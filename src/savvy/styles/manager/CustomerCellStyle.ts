/**
 * @description Customer cell style.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-05-25
 */

import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { StyleSheet } from 'react-native'

const CustomerCellStyle = StyleSheet.create({
    container: {
        minHeight: 110,
        paddingLeft: 22,
        ...commonStyle.flexRowSpaceCenter
    },
    imgStore: {
        width: 50,
        height: 50,
        borderRadius: 25
    },
    rightInfo: {
        flexShrink: 1,
        ...commonStyle.flexRowSpaceCenter,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray,
        paddingRight: 22,
        paddingTop: 26,
        paddingBottom: 26
    },
    flexShrinkCol: {
        flexShrink: 1,
        flexDirection: 'column'
    },
    storeName: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    itemSubTile: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.titleGray,
        flexWrap: 'wrap',
        marginTop: 5,
        alignSelf: 'flex-start'
    },
    avatar: {
        width: 26,
        height: 26,
        borderRadius: 4,
        alignSelf: 'flex-end'
    },
    userName: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.titleGray,
        flexWrap: 'wrap',
        marginTop: 9,
        alignSelf: 'flex-end',
        width: 120
    },
    tooltipContainer: {
        minWidth: 240,
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 10,
        backgroundColor: baseStyle.color.white,
        borderRadius: 4,
        padding: 0,
        alignSelf: 'flex-end'
    },
    moreText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.titleGray,
        marginTop: 4,
        alignSelf: 'flex-end'
    },
    moreVisitors: {
        height: 50,
        flex: 1,
        paddingLeft: 15,
        ...commonStyle.fullWidth,
        ...commonStyle.flexRowAlignCenter
    },
    marginRight15: {
        marginRight: 15
    },
    flexDirectionCol: {
        flexDirection: 'column'
    },
    flexGrow1: {
        // flexGrow: 1,
        flexDirection: 'column'
    },
    whiteColor: {
        color: baseStyle.color.white
    },
    assignStyle: {
        flexGrow: 1,
        flexDirection: 'column',
        alignItems: 'flex-end'
    },
    fontSize12: {
        fontSize: baseStyle.fontSize.fs_12
    },
    uncheckStyle: {
        ...commonStyle.size_24,
        marginRight: 5
    },
    checkBoxContainerStyle: {
        borderWidth: 0,
        padding: 0
    },
    selectContainer: {
        backgroundColor: baseStyle.color.bgGray,
        borderBottomColor: baseStyle.color.white,
        borderBottomWidth: 1
    },
    flexContainer: {
        flexGrow: 1,
        ...commonStyle.flexRowSpaceBet
    },
    tooltipAvatar: {
        alignSelf: 'center'
        // marginRight: 10
    },
    tooltipView: {
        borderBottomColor: baseStyle.color.borderGray,
        width: 160,
        paddingBottom: 15,
        paddingTop: 15,
        marginLeft: 15,
        marginRight: 22
    },
    tooltipUserName: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    borderBottomWidth1: {
        borderBottomWidth: 1
    },
    borderBottomWidth0: {
        borderBottomWidth: 0
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
    moreUsers: {
        height: 50,
        ...commonStyle.alignCenter
    },
    cellContent: {
        flex: 1,
        ...commonStyle.flexRowCenter
    },
    cellInfo: {
        flex: 1,
        marginRight: 40
    },
    subtype: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black
    },
    subtypeLine: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black,
        marginHorizontal: 3
    },
    textMaxWidth_180: {
        maxWidth: 180
    },
    textMaxWidth_30: {
        maxWidth: 30
    },
    subtypeContainer: {
        ...commonStyle.flexRowAlignCenter,
        marginTop: 6
    },
    checkBoxTouchArea: {
        height: '100%',
        ...commonStyle.alignCenter
    },
    uncheckContainer: {
        borderWidth: 0,
        padding: 0
    },
    unassignContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: -8,
        right: -8,
        backgroundColor: '#EB445A'
    },
    unassignImage: {
        width: 18,
        height: 18,
        resizeMode: 'contain'
    },
    touchableArea: {
        flex: 1,
        marginLeft: -22,
        paddingLeft: 22,
        paddingVertical: 24,
        ...commonStyle.flexRowAlignCenter,
        alignItems: 'flex-start'
    },
    orderContainer: {
        paddingHorizontal: 5,
        height: 20,
        borderWidth: 1,
        borderColor: baseStyle.color.titleGray,
        borderRadius: 10,
        marginLeft: 10,
        ...commonStyle.alignCenter
    },
    merchContainerW: {
        width: 60
    },
    merchContainer: {
        height: 20,
        borderWidth: 1,
        borderColor: baseStyle.color.titleGray,
        borderRadius: 10,
        marginRight: 10,
        ...commonStyle.alignCenter
    },
    orderText: {
        color: baseStyle.color.titleGray,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_12
    },
    imgNew: {
        width: 45,
        height: 22,
        position: 'absolute',
        top: 0,
        left: 0
    },
    orderTextPadding: {
        flex: 1,
        paddingHorizontal: 5
    },
    textAlignRight: {
        textAlign: 'right'
    },
    textColorBlack: {
        color: baseStyle.color.black
    },
    workingStatus: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.titleGray,
        marginRight: 5
    },
    activeWorkingStatus: {
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    greyColor: {
        color: baseStyle.color.cGray
    },
    radiusMask: {
        borderRadius: 4,
        overflow: 'hidden'
    },
    visitInfoContainer: {
        marginTop: 9,
        ...commonStyle.flexRowAlignCenter,
        color: baseStyle.color.black
    },
    splitLine: {
        color: baseStyle.color.liteGrey,
        fontSize: baseStyle.fontSize.fs_12,
        marginHorizontal: 4
    },
    optimizedCheckBox: {
        marginRight: -6,
        marginTop: 12
    },
    workingDayView: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: 5,
        marginLeft: 5
    },
    marginTop_2: {
        marginTop: 2
    },
    paddingRight_22: {
        paddingRight: 22
    },
    spiltLineNoSpace: {
        color: baseStyle.color.liteGrey,
        fontSize: baseStyle.fontSize.fs_12
    },
    sortableCard: {
        paddingVertical: 0,
        marginVertical: 24
    }
})

export default CustomerCellStyle

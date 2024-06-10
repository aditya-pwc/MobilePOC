/**
 * @description Schedule Summary Style.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-08-30
 */

import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { StyleSheet } from 'react-native'

const ScheduleSummaryStyle = StyleSheet.create({
    bgWrap: {
        position: 'relative'
    },
    flex_1: {
        flex: 1
    },
    topBox: {
        backgroundColor: baseStyle.color.white,
        height: 438,
        paddingTop: 43
    },
    titleWrap: {
        ...commonStyle.flexRowCenter,
        height: 29,
        lineHeight: 29
    },
    title: {
        fontSize: baseStyle.fontSize.fs_24,
        color: 'black',
        fontWeight: baseStyle.fontWeight.fw_900
    },
    subTitleWrap: {
        ...commonStyle.flexRowCenter,
        height: 15,
        lineHeight: 15,
        marginTop: 10
    },
    subTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400
    },
    topTabsContainer: {
        marginTop: 30,
        marginBottom: 28
    },
    timeTabContainer: {
        backgroundColor: baseStyle.color.bgGray
    },
    topTabsItemActiveContainer: {
        flex: 1,
        backgroundColor: baseStyle.color.tabBlue,
        borderRadius: 4,
        ...commonStyle.alignCenter
    },
    infoCardWrap: {
        height: 189,
        flexDirection: 'row',
        paddingHorizontal: 16,
        justifyContent: 'space-around',
        flexWrap: 'nowrap'
    },
    infoCard: {
        width: 0,
        flexGrow: 1,
        marginHorizontal: 6,
        borderWidth: 1,
        borderColor: baseStyle.color.borderGray,
        borderRadius: 8,
        overflow: 'hidden'
    },
    pd_horizontal10: {
        paddingHorizontal: 10
    },
    pd_horizontal7: {
        paddingHorizontal: 7
    },
    infoTitle: {
        ...commonStyle.flexRowCenter,
        height: 16,
        lineHeight: 16,
        marginVertical: 15
    },
    infoIconMargin: {
        marginRight: 6
    },
    clockIcon: {
        transform: [{ rotateY: '180deg' }]
    },
    infoTitleTxt: {
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_12
    },
    infoSubTitle: {
        marginBottom: 6,
        height: 16,
        lineHeight: 16
    },
    infoSubTitleTxt: {
        color: baseStyle.color.titleGray,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400
    },
    infoSubText: {
        marginBottom: 10,
        height: 20,
        lineHeight: 20
    },
    infoSubTextTxt: {
        fontSize: baseStyle.fontSize.fs_14,
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_400
    },
    infoTxtRed: {
        color: baseStyle.color.red
    },
    bottomBox: {
        ...commonStyle.alignCenter,
        flexDirection: 'row',
        height: 19,
        marginTop: 5
    },
    bottomText: {
        color: baseStyle.color.loadingGreen,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_16,
        marginRight: 6
    },
    negativeRed: {
        color: baseStyle.color.red
    },
    arrowIcon: {
        transform: [{ rotateX: '180deg' }]
    },
    btnNavWrap: {
        height: 40,
        backgroundColor: baseStyle.color.tabBlue,
        ...commonStyle.alignCenter,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8
    },
    btnNavText: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.white,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    bottomContainer: {
        flexDirection: 'row',
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10,
        position: 'absolute',
        bottom: 30
    },
    btnCancel: {
        width: '50%',
        backgroundColor: baseStyle.color.white,
        height: 60,
        ...commonStyle.alignCenter
    },
    btnAccept: {
        flexGrow: 1,
        width: '50%',
        backgroundColor: baseStyle.color.purple,
        height: 60,
        ...commonStyle.alignCenter
    },
    textCancel: {
        color: baseStyle.color.purple,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    textAccept: {
        color: baseStyle.color.white,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    disabledBtnBg: {
        backgroundColor: baseStyle.color.borderGray
    },
    disabledBtnText: {
        color: baseStyle.color.white
    },
    infoTitleUnassign: {
        ...commonStyle.flexRowCenter,
        height: 16,
        lineHeight: 16,
        marginTop: 15,
        marginBottom: 6
    },
    unassignedBox: {
        backgroundColor: baseStyle.color.bgGray,
        borderRadius: 8,
        height: 70,
        marginBottom: 5
    },
    unassignedItem: {
        marginBottom: 6,
        paddingHorizontal: 6,
        ...commonStyle.flexRowSpaceCenter
    },
    costContainer: {
        width: 70
    },
    marginLeft5: {
        marginLeft: 5
    },
    itemBox: {
        marginTop: 6
    },
    itemText: {
        height: 16,
        lineHeight: 20,
        paddingHorizontal: 3
    },
    lineText: {
        color: baseStyle.color.borderGray,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_500
    },
    btnView: {
        height: 19,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        ...commonStyle.alignCenter
    },
    btnViewText: {
        color: baseStyle.color.tabBlue,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_12
    },
    selectTap: {
        marginTop: -22
    }
})

export default ScheduleSummaryStyle

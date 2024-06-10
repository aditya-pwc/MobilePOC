/**
 * @description Recurring visit detail style.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-06-23
 */

import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { StyleSheet } from 'react-native'

const RecurringVisitDetailStyle = StyleSheet.create({
    flex_1: {
        flex: 1
    },
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.bgGray
    },
    reHeader: {
        flexDirection: 'row',
        paddingHorizontal: 22,
        justifyContent: 'space-between'
    },
    reTitle: {
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900,
        color: baseStyle.color.black
    },
    infoContent: {
        marginTop: 63,
        backgroundColor: baseStyle.color.white,
        paddingHorizontal: 22,
        borderTopWidth: 1,
        borderTopColor: baseStyle.color.borderGray,
        paddingBottom: 65
    },
    selectedContainer: {
        // flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
    },
    subTypeCell: {
        flexDirection: 'row',
        backgroundColor: baseStyle.color.bgGray,
        marginBottom: 10,
        marginRight: 10,
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderRadius: 15
    },
    clearSubTypeContainer: {
        marginLeft: 10
    },
    imgClear: {
        width: 18,
        height: 19
    },
    bottomLine: {
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray
    },
    noBottomLine: {
        borderBottomColor: baseStyle.color.white
    },
    selectValue: {
        color: baseStyle.color.black
    },
    bottomContainer: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        flexDirection: 'row',
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10,
        zIndex: 9
    },
    reBtnCancel: {
        flexGrow: 1,
        width: '50%',
        backgroundColor: baseStyle.color.white,
        height: 60,
        borderRightWidth: 1,
        borderRightColor: baseStyle.color.modalBlack,
        ...commonStyle.alignCenter
    },
    reBtnSave: {
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
    textSave: {
        color: baseStyle.color.white,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    disabledReBtnSave: {
        backgroundColor: baseStyle.color.white
    },
    disabledTextSave: {
        color: baseStyle.color.borderGray
    },
    customerCard: {
        marginTop: -36
    },
    customerCardView: {
        height: 110,
        marginHorizontal: 0,
        backgroundColor: baseStyle.color.white
    },
    userInfoCard: {
        marginTop: -55,
        zIndex: 1,
        marginBottom: 20
    },
    marginBottom_30: {
        marginBottom: 30
    },
    unassignedRouteContainer: {
        ...commonStyle.flexRowSpaceCenter,
        marginBottom: 16,
        marginHorizontal: baseStyle.margin.mg_22,
        borderRadius: 6,
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        backgroundColor: baseStyle.color.white
    }
})

export default RecurringVisitDetailStyle

import { StyleSheet } from 'react-native'
import { normalize } from 'react-native-elements'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

export const ReturnProductCardStyle = StyleSheet.create({
    ...commonStyle,
    lineHeight_20: {
        lineHeight: 20
    },
    upcText: {
        fontSize: normalize(11.6),
        fontWeight: baseStyle.fontWeight.fw_700
    },
    InvenIdText: {
        fontSize: normalize(11.6),
        fontWeight: baseStyle.fontWeight.fw_400
    },
    height_p75: {
        height: '75%'
    },
    chevron_up_black: {
        ...commonStyle.chevron,
        borderColor: baseStyle.color.black,
        borderBottomWidth: 2,
        borderRightWidth: 2
    },
    chevron_down_black: {
        ...commonStyle.chevron,
        borderColor: baseStyle.color.black,
        borderTopWidth: 2,
        borderLeftWidth: 2
    },
    KpiRowView: {
        display: 'flex',
        flexDirection: 'column'
    },
    KpiRowCustomColumn: {
        paddingHorizontal: 22,
        flexDirection: 'row',
        display: 'flex',
        paddingBottom: 17
    },
    KpiRowCustomColumnRevert: {
        display: 'flex',
        flexDirection: 'row',
        marginRight: 34,
        width: 100
    },
    KpiRowCustomColumnTitle: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 'auto',
        flex: 1
    },
    KpiRowCustomColumnTitleText: {
        fontSize: 12,
        width: 60,
        textAlign: 'center'
    },
    KpiRowCustomColumnTitleTextTotal: {
        fontSize: 12,
        width: 70,
        textAlign: 'center'
    },
    revertIcon: {
        width: 14,
        height: 14,
        marginRight: 7
    },
    revertIconText: {
        fontSize: 12,
        fontWeight: '700',
        color: baseStyle.color.liteGrey
    },
    revertIconTextActive: {
        fontSize: 12,
        fontWeight: '700',
        color: baseStyle.color.LightBlue
    },
    KpiDataRowCustomColumn: {
        paddingHorizontal: 22,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        backgroundColor: baseStyle.color.bgGray,
        borderTopWidth: 1,
        borderTopColor: baseStyle.color.white
    },
    KpiDataRowCustomColumnName: {
        marginRight: 34,
        width: 100
    },
    KpiDataRowCustomColumnInputs: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1
    },
    KpiDataRowCustomColumnTotal: {
        width: 70,
        height: 40,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: baseStyle.color.borderGray,
        backgroundColor: baseStyle.color.white
    },
    KpiDataRowCustomColumnTotalText: {
        color: baseStyle.color.black,
        fontWeight: '700'
    },
    tableRowInputTotal: {
        paddingRight: 0,
        width: 83,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        fontWeight: '700',
        backgroundColor: baseStyle.color.white,
        borderColor: baseStyle.color.borderGray,
        borderRadius: 6,
        borderWidth: 1
    },
    tableRowInput: {
        paddingRight: 0,
        width: 60,
        height: 40,
        borderColor: baseStyle.color.tabBlue,
        borderWidth: 1,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: baseStyle.color.white
    },
    borderBottomColor0: {
        borderBottomColor: 'rgba(0,0,0,0)'
    },
    borderBottomColor: {
        borderColor: baseStyle.color.borderGray
    },
    tableRowInputStyle: {
        fontSize: 12,
        margin: 'auto',
        height: 40,
        fontWeight: '700'
    },
    applyButton: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        height: 44,
        borderRadius: 6
    },
    applyButtonActive: { backgroundColor: baseStyle.color.LightBlue },
    applyButtonInActive: {
        backgroundColor: baseStyle.color.white,
        color: baseStyle.color.gray,
        borderWidth: 1,
        borderColor: baseStyle.color.borderGray
    },
    applyButtonText: { fontSize: 12, fontWeight: '700' },
    applyButtonTextActive: { color: baseStyle.color.white },
    applyButtonTextInActive: { color: baseStyle.color.liteGrey },
    applyTouchableOpacity: {
        paddingHorizontal: 22,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        backgroundColor: baseStyle.color.bgGray
    },
    cardStyle: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    applyButtonView: {
        paddingHorizontal: 22,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        backgroundColor: baseStyle.color.bgGray
    },
    isActiveReturnIcon: {
        width: 60
    },
    pickViewStyle: {
        alignItems: 'center',
        paddingTop: 0,
        height: 'auto'
    },
    customIconWrapStyle: {
        paddingTop: 3
    },
    paddingLeft_22: {
        paddingLeft: 22
    },
    swipeRowWrap: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15
    },
    swipeRowBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 98,
        right: 22,
        backgroundColor: baseStyle.color.red
    }
})

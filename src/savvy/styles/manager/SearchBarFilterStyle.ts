/**
 * @description Search bar filter style.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-05-25
 */

import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { StyleSheet } from 'react-native'

const SearchBarFilterStyle = StyleSheet.create({
    searchContainer: {
        ...commonStyle.flexRowSpaceCenter
    },
    searchBarContainer: {
        height: 36,
        marginTop: 0,
        backgroundColor: baseStyle.color.bgGray,
        borderRadius: 10,
        padding: 0,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        flexShrink: 1,
        flex: 1
    },
    inputContainerStyle: {
        height: 36,
        backgroundColor: baseStyle.color.bgGray,
        padding: 0,
        borderRadius: 10
    },
    inputStyle: {
        marginLeft: 0,
        marginRight: 0,
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400
    },
    leftIconContainerStyle: {
        marginLeft: 5
    },
    imgSearch: {
        width: 24,
        height: 22
    },
    imgSearchIcon: {
        width: 16,
        height: 16,
        marginVertical: 0
    },
    imgClear: {
        width: 18,
        height: 19
    },
    imgSortActiveContainer: {
        backgroundColor: baseStyle.color.tabBlue,
        marginLeft: 22,
        paddingHorizontal: 4,
        paddingVertical: 7,
        borderRadius: 8
    },
    imgSortNormalContainer: {
        marginLeft: 22,
        paddingHorizontal: 4,
        paddingVertical: 7,
        borderRadius: 8
    },
    imgSortNormal: {
        width: 32,
        height: 19
    },
    imgSortActive: {
        width: 32,
        height: 19,
        tintColor: baseStyle.color.white
    },
    centeredView: {
        flex: 1,
        ...commonStyle.alignCenter,
        backgroundColor: 'rgba(87, 87, 87, 0.2)'
    },
    modalView: {
        backgroundColor: baseStyle.color.white,
        borderRadius: 8,
        shadowColor: baseStyle.color.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '96%'
    },
    modalContainer: {
        padding: 20,
        flexDirection: 'column'
    },
    modalTitle: {
        ...commonStyle.fullWidth,
        borderBottomColor: baseStyle.color.cGray,
        borderBottomWidth: 1,
        ...commonStyle.alignCenter
    },
    modalContent: {
        paddingTop: 20,
        ...commonStyle.fullWidth
    },
    filterCheckboxContainer: {
        display: 'flex',
        flexDirection: 'row',
        transform: [{ translateX: -10 }],
        justifyContent: 'space-between'
    },
    sortTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        paddingBottom: 20
    },
    fontSize_12: {
        fontSize: baseStyle.fontSize.fs_12
    },
    fontSize_11: {
        fontSize: baseStyle.fontSize.fs_11
    },
    fontWeight_400: {
        fontWeight: baseStyle.fontWeight.fw_400
    },
    fontWeight_700: {
        fontWeight: baseStyle.fontWeight.fw_700
    },
    color_white: {
        color: baseStyle.color.white
    },
    exclamationPoint: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: baseStyle.color.red,
        ...commonStyle.alignCenter,
        marginRight: 6
    },
    redExclamationIcon: {
        marginRight: 6
    },
    GeofenceIssueCheckBoxContainer: {
        marginLeft: 0,
        marginTop: 20
    },
    sortLabel: {
        color: baseStyle.color.titleGray,
        fontSize: baseStyle.fontSize.fs_12,
        width: 90
    },
    filterSubtitleStyle: {
        width: '100%',
        color: baseStyle.color.titleGray,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        paddingBottom: 20
    },
    sortOption: {
        ...commonStyle.fullWidth,
        ...commonStyle.flexRowSpaceCenter,
        paddingTop: 10,
        paddingBottom: 10,
        borderBottomColor: baseStyle.color.cGray,
        borderBottomWidth: 1
    },
    checkBoxStyle: {
        backgroundColor: baseStyle.color.white,
        borderWidth: 0,
        padding: 0,
        width: 120,
        flexGrow: 1
    },
    modalBtn: {
        height: 60,
        borderTopColor: baseStyle.color.cGray,
        borderTopWidth: 1,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        ...commonStyle.flexRowCenter,
        textAlign: 'center'
    },
    buttonReset: {
        flexGrow: 1,
        height: 60,
        ...commonStyle.alignCenter,
        borderRightColor: baseStyle.color.cGray,
        borderRightWidth: 1,
        borderBottomLeftRadius: 8,
        width: '50%'
    },
    resetText: {
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.purple
    },
    buttonApply: {
        flexGrow: 1,
        height: 60,
        ...commonStyle.alignCenter,
        backgroundColor: baseStyle.color.purple,
        borderBottomRightRadius: 8,
        width: '50%'
    },
    applyText: {
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.white
    },
    filterContainer: {
        marginTop: 30
    },
    filterWeekContainer: {
        ...commonStyle.flexRowSpaceBet,
        backgroundColor: baseStyle.color.bgGray,
        borderRadius: 8,
        paddingLeft: 13,
        paddingRight: 13,
        paddingTop: 7,
        paddingBottom: 7,
        marginBottom: 10
    },
    filterTimeContainer: {
        paddingLeft: 6,
        paddingRight: 6,
        paddingTop: 6,
        paddingBottom: 6
    },
    filterWeek: {
        paddingLeft: 7,
        paddingRight: 7,
        paddingTop: 5,
        paddingBottom: 5,
        minWidth: 28,
        alignItems: 'center'
    },
    filterWeekActive: {
        backgroundColor: baseStyle.color.tabBlue,
        borderRadius: 8
    },
    filterTime: {
        flex: 1,
        paddingHorizontal: 7,
        paddingVertical: 5,
        minWidth: 28,
        alignItems: 'center'
    },
    filterTimeActive: {
        flex: 1,
        backgroundColor: baseStyle.color.tabBlue,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textWeek: {
        fontWeight: baseStyle.fontWeight.fw_bold
    },
    textWeekActive: {
        color: baseStyle.color.white
    },
    textTimeNormal: {
        color: baseStyle.color.tabBlue,
        fontWeight: baseStyle.fontWeight.fw_bold
    },
    workType: {
        ...commonStyle.flexRowSpaceBet,
        marginTop: 10
    },
    checkBoxMulti: {
        backgroundColor: baseStyle.color.white,
        borderWidth: 0,
        padding: 0
    },
    checkBoxMultiForOrder: {
        backgroundColor: baseStyle.color.white,
        borderWidth: 0,
        padding: 0,
        marginBottom: 15
    },
    unassignedCheckBoxContainer: {
        marginLeft: 0,
        marginTop: 20
    },
    unassignedCheckBoxAvator: {
        width: 17,
        height: 15,
        resizeMode: 'contain',
        marginRight: 6
    },
    paddingLeft8: {
        paddingLeft: 8
    },
    paddingBottom20: {
        paddingBottom: 20
    },
    borderBottomWidth0: {
        borderBottomWidth: 0
    },
    borderBottomWidth1: {
        borderBottomWidth: 1
    },
    checkCircle: {
        width: 20,
        height: 20,
        marginRight: 10
    },
    addStyle: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.tabBlue,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    orderSort: {},
    orderSortLabel: {
        width: 60,
        color: baseStyle.color.gray,
        fontSize: 12
    },
    orderSortOption: {
        borderBottomWidth: 0
    },
    orderDeliveryType: {
        fontSize: 12,
        color: baseStyle.color.gray
    },
    orderFilterInputContainer: {
        borderBottomColor: '#D3D3D3'
    },
    orderFilterInput: {
        fontSize: baseStyle.fontSize.fs_14
    },
    noPaddingHorizontal: {
        paddingHorizontal: 0
    },
    noMarginVertical: {
        marginVertical: 0
    },
    marginHorizontal_10: {
        marginHorizontal: -10
    }
})

export default SearchBarFilterStyle

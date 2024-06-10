/**
 * @description Employee cell style.
 * @author Xupeng Bao
 * @email xupeng.bao@pwc.com
 * @date 2021-06-10
 */

import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { StyleSheet } from 'react-native'

const AddRecurringVisitStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    content: {
        flex: 1
    },
    scrollView: {
        flex: 1,
        marginBottom: 64
    },
    title: {
        marginLeft: baseStyle.margin.mg_22,
        marginTop: baseStyle.margin.mg_54,
        textAlign: 'left',
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900
    },
    headerView: {
        marginHorizontal: baseStyle.margin.mg_22,
        marginVertical: 30,
        borderRadius: 6,
        backgroundColor: 'white',
        height: 110,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: baseStyle.padding.pd_20,
        shadowColor: baseStyle.color.tabShadowBlue,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.17,
        textShadowRadius: 6
    },
    imgUserImage: {
        width: 60,
        height: 60,
        borderRadius: 8
    },
    itemContentContainer: {
        flex: 1,
        marginLeft: 15,
        marginRight: 20
    },
    customerNameText: {
        fontSize: baseStyle.fontSize.fs_18,
        fontWeight: baseStyle.fontWeight.fw_900,
        color: baseStyle.color.black
    },
    addressView: {
        ...commonStyle.flexRowAlignCenter,
        marginTop: 6
    },
    addressText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    imgPhoneAndMsg: {
        width: 18,
        height: 18
    },
    imgLocation: {
        width: 18,
        height: 21,
        marginTop: baseStyle.margin.mg_20
    },
    formItem: {
        marginHorizontal: baseStyle.margin.mg_22,
        marginBottom: 30,
        paddingTop: 15,
        borderBottomColor: baseStyle.color.borderGray,
        borderBottomWidth: 1
    },
    formSubItem: {
        ...commonStyle.flexRowSpaceCenter
    },
    label: {
        paddingTop: 15,
        paddingBottom: 17,
        color: baseStyle.color.black
    },
    rightCol: {
        ...commonStyle.flexRowJustifyEnd,
        paddingVertical: 15,
        width: '50%'
    },
    imgTriangle: {
        width: 10,
        height: 5,
        marginTop: 8,
        marginLeft: 10,
        marginRight: 16
    },
    selectedContainer: {
        flex: 1,
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
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        shadowColor: baseStyle.color.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalViewSubType: {
        borderRadius: 8,
        width: '96%',
        marginBottom: 0
    },
    modalText: {
        marginTop: 25,
        marginBottom: 15,
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_18,
        fontWeight: baseStyle.fontWeight.fw_900,
        textAlign: 'center'
    },
    centeredView: {
        ...commonStyle.flexCenter,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalHeader: {
        ...commonStyle.flexRowSpaceCenter,
        marginHorizontal: 20,
        paddingVertical: 20,
        borderBottomColor: baseStyle.color.borderGray,
        borderBottomWidth: 1
    },
    modalHeaderSubType: {
        justifyContent: 'center',
        marginBottom: 20
    },
    modalButton: {
        color: baseStyle.color.tabBlue,
        fontWeight: baseStyle.fontWeight.fw_bold,
        fontSize: baseStyle.fontSize.fs_12
    },
    textBold: {
        fontWeight: baseStyle.fontWeight.fw_700
    },
    subTypeItem: {
        ...commonStyle.flexRowAlignCenter,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 10,
        paddingBottom: 10
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
        backgroundColor: baseStyle.color.white
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
        borderBottomRightRadius: 8
    },
    applyText: {
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.white
    },
    searchItem: {
        marginBottom: 40
    },
    searchContainer: {
        ...commonStyle.flexRowAlignCenter,
        marginBottom: 5
    },
    imgSearch: {
        width: 24,
        height: 22
    },
    label2: {
        fontSize: baseStyle.fontSize.fs_12,
        marginBottom: 8,
        color: baseStyle.color.titleGray
    },
    searchText: {
        flex: 1,
        fontSize: baseStyle.fontSize.fs_14,
        color: baseStyle.color.borderGray,
        fontWeight: baseStyle.fontWeight.fw_400,
        marginLeft: 10
    },
    searchTextActive: {
        color: baseStyle.color.black
    },
    workDayView: {
        ...commonStyle.flexRowSpaceCenter,
        marginHorizontal: baseStyle.margin.mg_22,
        marginBottom: 20
    },
    workDayTitle: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    workStatusView: {
        ...commonStyle.flexRowCenter
    },
    textWorking: {
        fontSize: 12,
        fontWeight: '700',
        marginRight: 8
    },
    textOffDay: {
        fontSize: 12,
        fontWeight: '700',
        marginRight: 8,
        color: '#D3D3D3'
    },
    selectTitle: {
        marginHorizontal: baseStyle.margin.mg_22,
        marginBottom: 8,
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black,
        marginTop: 20
    },
    margin_Hor: {
        marginHorizontal: baseStyle.margin.mg_22,
        marginBottom: 20
    },
    bottomContainer: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        flexDirection: 'row',
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10
    },
    btnCancel: {
        flexGrow: 1,
        width: '50%',
        backgroundColor: baseStyle.color.white,
        height: 60,
        borderRightWidth: 1,
        borderRightColor: baseStyle.color.modalBlack,
        ...commonStyle.alignCenter
    },
    btnAccept: {
        flexGrow: 1,
        width: '50%',
        backgroundColor: baseStyle.color.white,
        height: 60,
        ...commonStyle.alignCenter
    },
    btnAcceptActive: {
        backgroundColor: baseStyle.color.purple
    },
    textCancel: {
        color: baseStyle.color.purple,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    textAccept: {
        color: baseStyle.color.borderGray,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    textAcceptActive: {
        color: baseStyle.color.white
    },
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
    customSubTitle: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    customSubTitleBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 22,
        paddingTop: 10,
        paddingBottom: 30
    },
    territoryModal: {
        maxHeight: 450,
        margin: 'auto'
    },
    InfoSvgStyle: {
        width: 18,
        height: 18
    },
    subtypeDesc: {
        marginLeft: 59,
        marginTop: -10,
        marginRight: 20
    },
    descText: {
        color: baseStyle.color.titleGray,
        fontSize: 12
    },
    nameText: {
        fontSize: 14
    }
})

export default AddRecurringVisitStyle

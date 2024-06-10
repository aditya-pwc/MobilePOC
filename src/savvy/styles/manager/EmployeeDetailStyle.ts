/**
 * @description Employee detail style.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-05-24
 */

import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { StyleSheet } from 'react-native'

const EmployeeDetailStyle = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    header: {
        marginTop: 60,
        ...commonStyle.flexRowSpaceCenter,
        marginBottom: 48
    },
    title: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    btnBack: {
        marginLeft: 22
    },
    imgBack: {
        width: 12,
        height: 20
    },
    imgBkgroundView: {
        ...commonStyle.flexRowJustifyCenter
    },
    imgBkground: {
        height: 180,
        ...commonStyle.alignCenter,
        ...commonStyle.fullWidth
    },
    portraitView: {
        position: 'relative',
        marginTop: -40
    },
    imgPortrait: {
        width: 80,
        height: 80,
        alignSelf: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: baseStyle.color.white
    },
    imgCamera: {
        width: 22,
        height: 22,
        position: 'absolute',
        alignSelf: 'center',
        bottom: -10,
        right: -10
    },
    userName: {
        fontSize: baseStyle.fontSize.fs_18,
        fontWeight: baseStyle.fontWeight.fw_900,
        color: baseStyle.color.white,
        marginTop: 14,
        maxWidth: 360
    },
    roleView: {
        flexShrink: 1,
        ...commonStyle.flexRowJustifyCenter,
        marginTop: 4,
        paddingHorizontal: baseStyle.padding.pd_22,
        maxWidth: 220
    },
    roleText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.white,
        maxWidth: 260
    },
    locationView: {
        marginTop: 20,
        ...commonStyle.flexRowSpaceBet,
        paddingHorizontal: baseStyle.padding.pd_22,
        ...commonStyle.fullWidth
    },
    location: {
        ...commonStyle.flexRowAlignEnd
    },
    imgAddress: {
        width: 26,
        height: 21,
        marginRight: 8
    },
    tabView: {
        height: 56,
        backgroundColor: baseStyle.color.black,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        flexDirection: 'row',
        paddingTop: 20,
        paddingHorizontal: baseStyle.padding.pd_22,
        ...commonStyle.fullWidth
    },
    tabBorder: {
        borderBottomWidth: 2,
        borderBottomColor: baseStyle.color.black,
        height: 24,
        marginRight: 32
    },
    tabBorderActive: {
        borderBottomColor: baseStyle.color.tabBlue
    },
    tabText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.tabBlue
    },
    tabTextActive: {
        color: baseStyle.color.white
    },
    tabButton: {
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 6,
        borderBottomColor: '#000',
        borderBottomWidth: 2
    },
    tabTitle: {
        fontWeight: '600',
        color: '#00A2D9'
    },
    isActive: {
        color: '#FFF',
        borderBottomColor: '#00A2D9'
    },
    content: {
        flex: 1,
        paddingHorizontal: baseStyle.padding.pd_22,
        paddingTop: 20,
        backgroundColor: baseStyle.color.white
    },
    contentTitle: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    subTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    modalSubTitle: {
        textAlign: 'center',
        marginBottom: 15
    },
    flexRow: {
        height: 16,
        marginBottom: 30,
        marginTop: 10,
        ...commonStyle.flexRowSpaceBet
    },
    fieldLabel: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    fieldText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black,
        lineHeight: 15,
        height: 14
    },
    imgCheck: {
        width: 14,
        height: 14,
        marginLeft: 8
    },
    imgTriangle: {
        width: 10,
        height: 5,
        marginHorizontal: 10
    },
    imgClock: {
        width: 18,
        height: 18,
        marginHorizontal: 10
    },
    transTriangle: {
        tintColor: baseStyle.color.white
    },
    flexSelectRow: {
        height: 50,
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray,
        alignItems: 'center',
        marginBottom: 10
    },
    flexRowAlignCenter: {
        ...commonStyle.flexRowAlignCenter
    },
    selectLabel: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray,
        height: 50,
        lineHeight: 50
    },
    placeholder: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: '#D3D3D3'
    },
    changedView: {
        backgroundColor: baseStyle.color.yellow,
        width: 80,
        height: 20,
        borderRadius: 10,
        marginLeft: 10,
        marginVertical: 15,
        ...commonStyle.alignCenter
    },
    changedText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    selectText: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black
    },
    maxSelectTextWidth: {
        maxWidth: 140
    },
    workingDayRow: {
        marginTop: 30,
        ...commonStyle.flexRowSpaceCenter,
        marginBottom: 10
    },
    editBtn: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.tabBlue,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    disabledBtn: {
        color: baseStyle.color.borderGray
    },
    disabledSaveBtn: {
        backgroundColor: baseStyle.color.borderGray
    },
    weekNum: {
        marginTop: 20,
        ...commonStyle.flexRowSpaceBet
    },
    roundLabel: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: baseStyle.color.tabShadowBlue,
        ...commonStyle.alignCenter
    },
    roundText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.white
    },
    greyRound: {
        backgroundColor: baseStyle.color.borderGray
    },
    centeredView: {
        flex: 1,
        ...commonStyle.alignCenter,
        backgroundColor: baseStyle.color.modalBlack
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
        width: '92%',
        alignItems: 'center'
    },
    modalPadding: {
        paddingHorizontal: baseStyle.padding.pd_22,
        ...commonStyle.fullWidth
    },
    modalTitle: {
        height: 55,
        borderBottomColor: baseStyle.color.borderGray,
        borderBottomWidth: 1,
        ...commonStyle.alignCenter
    },
    modalTitleText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    modalContent: {
        marginTop: 30,
        ...commonStyle.fullWidth,
        paddingBottom: 40,
        position: 'relative'
    },
    modalSelectRow: {
        height: 41,
        ...commonStyle.flexRowSpaceCenter
    },
    modalBtn: {
        height: 60,
        borderTopColor: baseStyle.color.cGray,
        borderTopWidth: 1,
        flexDirection: 'row',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        ...commonStyle.alignCenter,
        textAlign: 'center'
    },
    btnCancel: {
        flexGrow: 1,
        height: 60,
        ...commonStyle.alignCenter,
        borderRightColor: baseStyle.color.cGray,
        borderRightWidth: 1,
        borderBottomLeftRadius: 8
    },
    cancelText: {
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.purple
    },
    btnSave: {
        flexGrow: 1,
        height: 60,
        ...commonStyle.alignCenter,
        backgroundColor: baseStyle.color.purple,
        borderBottomRightRadius: 8
    },
    saveText: {
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.white
    },
    checkBoxText: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black,
        padding: 0,
        marginRight: 0,
        marginLeft: 10
    },
    checkCircle: {
        width: 20,
        height: 20
    },
    tModalView: {
        height: 284
    },
    tModalTitle: {
        ...commonStyle.flexRowSpaceBet
    },
    tModalTitleText: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black
    },
    tDoneBtn: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.tabBlue
    },
    flexDirectionRow: {
        ...commonStyle.flexRowSpaceBet
    },
    marginTop_0: {
        marginTop: 0
    },
    marginTop_4: {
        marginTop: 4
    },
    routeView: {
        width: '50%',
        textAlign: 'left',
        marginRight: 30
    },
    marginTop_15: {
        marginTop: 15
    },
    marginBottom_20: {
        marginBottom: 20
    },
    pickerItem: {
        height: 170
    },
    deleteBtn: {
        ...commonStyle.fullWidth,
        height: 44,
        borderWidth: 1,
        borderColor: baseStyle.color.red,
        borderRadius: 6,
        marginTop: 50,
        marginBottom: 60,
        ...commonStyle.alignCenter
    },
    deleteBtnText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.red
    },
    paddingBottom_10: {
        paddingBottom: 10
    },
    lineHeight_25: {
        lineHeight: 25
    },
    startingTimeErrorIcon: {
        alignSelf: 'center',
        marginLeft: 6
    },
    borderBottomWihte: {
        borderBottomColor: baseStyle.color.white,
        marginTop: 0,
        marginBottom: 0
    },
    width_36: {
        width: 36
    },
    imgAddButton: {
        right: 20
    },
    emptyView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyCard: {
        width: 184,
        alignItems: 'center'
    },
    emptyVisit: {
        width: 184,
        height: 246
    },
    noVisitsText: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 40
    }
})

export default EmployeeDetailStyle

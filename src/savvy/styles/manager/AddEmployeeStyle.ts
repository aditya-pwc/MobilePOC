/**
 * @description Add Employee style.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-05-26
 */

import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { StyleSheet } from 'react-native'

const AddEmployeeStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.bgGray
    },
    whiteContainer: {
        backgroundColor: baseStyle.color.white
    },
    eHeader: {
        paddingTop: 56,
        height: 272,
        backgroundColor: baseStyle.color.white
    },
    heightAuto: {
        height: 'auto'
    },
    eTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900,
        marginLeft: 22
    },
    stepView: {
        marginTop: 45,
        height: 60,
        backgroundColor: baseStyle.color.bgGray,
        flexDirection: 'row'
    },
    activeStep: {
        backgroundColor: baseStyle.color.loadingGreen
    },
    firstStep: {
        width: 190,
        paddingLeft: 22,
        justifyContent: 'center',
        ...commonStyle.fullHeight
    },
    firstStepTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.titleGray
    },
    firstStepText: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    activeStepColor: {
        color: baseStyle.color.white
    },
    topTriangle: {
        width: 0,
        height: 0,
        backgroundColor: baseStyle.color.transparent,
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 30,
        borderBottomWidth: 30,
        borderLeftWidth: 0,
        borderTopColor: baseStyle.color.transparent,
        borderRightColor: baseStyle.color.transparent,
        borderBottomColor: baseStyle.color.loadingGreen,
        borderLeftColor: baseStyle.color.transparent
    },
    bottomLeftTriangle: {
        transform: [{ rotateX: '180deg' }]
    },
    topRightTriangle: {
        transform: [{ rotateX: '180deg' }, { rotateY: '180deg' }]
    },
    bottomRightTriangle: {
        transform: [{ rotateY: '180deg' }]
    },
    secondStep: {
        justifyContent: 'center',
        paddingLeft: 25,
        ...commonStyle.fullWidth
    },
    secondStepTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.titleGray
    },
    secondStepText: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    searchBarView: {
        marginTop: 30,
        paddingHorizontal: baseStyle.padding.pd_22
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
    eBtnCancel: {
        flexGrow: 1,
        width: '50%',
        backgroundColor: baseStyle.color.white,
        height: 60,
        borderRightWidth: 1,
        borderRightColor: baseStyle.color.modalBlack,
        ...commonStyle.alignCenter
    },
    btnAdd: {
        flexGrow: 1,
        width: '50%',
        backgroundColor: baseStyle.color.white,
        height: 60,
        ...commonStyle.alignCenter
    },
    btnAddActiveColor: {
        backgroundColor: baseStyle.color.purple
    },
    textCancel: {
        color: baseStyle.color.purple,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    textAdd: {
        color: baseStyle.color.borderGray,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    textAddActive: {
        color: baseStyle.color.white
    },
    eImgCheck: {
        width: 15,
        height: 15,
        marginLeft: 8
    },
    flexRowEnd: {
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    editContainer: {
        flex: 1,
        paddingHorizontal: baseStyle.padding.pd_22,
        paddingBottom: 40
    },
    ePortraitView: {
        flexDirection: 'row',
        marginVertical: 40,
        paddingRight: 22
    },
    eImgPortrait: {
        width: 60,
        height: 60,
        alignSelf: 'center',
        borderRadius: 8
    },
    userInfo: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingRight: 22,
        flex: 1,
        marginLeft: 15
    },
    eUserName: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black,
        marginBottom: 6
    },
    userTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray,
        maxWidth: 300
    },
    contentTitle: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black,
        marginBottom: 10
    },
    eFlexSelectRow: {
        height: 50,
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray,
        marginBottom: 10,
        ...commonStyle.flexRowSpaceCenter
    },
    whiteImgBg: {
        tintColor: baseStyle.color.transparent
    },
    selectLabel: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    selectText: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black
    },
    flexDirectionRow: {
        ...commonStyle.flexRowSpaceBet
    },
    flexRowAlignCenter: {
        ...commonStyle.flexRowAlignCenter
    },
    marginTop30: {
        marginTop: 30
    },
    subTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    listView: {
        flex: 1
    },
    paddingTop_22: {
        paddingTop: 22
    },
    paddingBottom_40: {
        paddingBottom: 40
    },
    marginBottom_20: {
        marginBottom: 20
    },
    exclamation_style: {
        alignSelf: 'center',
        marginLeft: 5
    }
})

export default AddEmployeeStyle

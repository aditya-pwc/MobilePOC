/**
 * @description Survey Questions Style.
 * @author Sylvia Yuan
 * @email yue.yuan@pwc.com
 * @date 2023-04-19
 */

import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { StyleSheet } from 'react-native'

const SurveyQuestionsStyle = StyleSheet.create({
    selectTriangle: {
        width: 0,
        height: 0,
        backgroundColor: baseStyle.color.transparent,
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 20,
        borderBottomWidth: 30,
        borderLeftWidth: 0,
        borderTopColor: baseStyle.color.transparent,
        borderRightColor: baseStyle.color.transparent,
        borderBottomColor: baseStyle.color.loadingGreen,
        borderLeftColor: baseStyle.color.transparent
    },
    unselectTriangle: {
        width: 0,
        height: 0,
        backgroundColor: baseStyle.color.transparent,
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 20,
        borderBottomWidth: 30,
        borderLeftWidth: 0,
        borderTopColor: baseStyle.color.transparent,
        borderRightColor: baseStyle.color.transparent,
        borderBottomColor: baseStyle.color.bgGray,
        borderLeftColor: baseStyle.color.transparent
    },
    bottomTriangle: {
        width: 0,
        height: 0,
        backgroundColor: baseStyle.color.transparent,
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 20,
        borderBottomWidth: 30,
        borderLeftWidth: 0,
        borderTopColor: baseStyle.color.transparent,
        borderRightColor: baseStyle.color.transparent,
        borderBottomColor: baseStyle.color.white,
        borderLeftColor: baseStyle.color.transparent
    },
    bottomLeftTriangle: {
        transform: [{ rotateX: '180deg' }]
    },
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    modalTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 15,
        paddingHorizontal: 22,
        marginBottom: 43
    },
    stepView: {
        alignItems: 'center',
        flexDirection: 'row',
        height: 60,
        marginTop: 43
    },
    gothamFontFamily: {
        fontFamily: 'Gotham'
    },
    firstStep: {
        width: 150,
        paddingLeft: 22,
        justifyContent: 'center',
        height: 60,
        backgroundColor: '#F2F4F7'
    },
    secondStep: {
        width: 160,
        marginLeft: -20,
        justifyContent: 'center',
        paddingLeft: 27,
        height: 60,
        backgroundColor: '#F2F4F7',
        zIndex: -2
    },
    thirdStepCDA: {
        width: 110,
        marginLeft: -20,
        justifyContent: 'center',
        paddingLeft: 26,
        height: 60,
        backgroundColor: '#F2F4F7',
        zIndex: -4
    },
    fourthStepCDA: {
        width: 180,
        marginLeft: -20,
        justifyContent: 'center',
        paddingLeft: 26,
        paddingRight: 22,
        height: 60,
        backgroundColor: '#F2F4F7',
        zIndex: -5
    },
    eImgCheck: {
        width: 15,
        height: 15,
        marginLeft: 6
    },
    generalText: {
        marginTop: 52,
        fontSize: 18,
        fontWeight: '900',
        paddingHorizontal: 22,
        marginBottom: 30
    },
    storeVolumeText: {
        fontSize: 16,
        fontWeight: '700',
        paddingLeft: 22,
        paddingRight: 10
    },
    pullVolumeText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#565656'
    },
    subTitle: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656',
        marginBottom: 14
    },
    checkedIcon: {
        width: 22,
        height: 22
    },
    uncheckCircleView: {
        backgroundColor: '#FFF',
        borderColor: '#D3D3D3',
        borderRadius: 11,
        borderWidth: 1,
        width: 22,
        height: 22
    },
    radioContainer: {
        height: 50,
        justifyContent: 'center',
        borderWidth: 0,
        backgroundColor: '#FFFFFF'
    },
    radioLabelText: {
        fontFamily: 'Gotham',
        fontWeight: '400',
        fontSize: 14,
        color: 'black'
    },
    storeVolumeContainer: {
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        marginHorizontal: 22,
        justifyContent: 'space-between',
        borderWidth: 0,
        backgroundColor: '#FFFFFF',
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    datePicker: {
        width: '100%',
        height: '100%'
    },
    storeVolumeTips: {
        width: 18,
        height: 18,
        zIndex: 10
    },
    storeVolumeTipsContainer: {
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 1,
        shadowRadius: 10
    },
    accountPaidSectionContainer: {
        marginBottom: 30
    },
    timeContainer: {
        marginBottom: 30,
        paddingHorizontal: 22,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    startTime: { width: 176, flexDirection: 'row' },
    agreementTypeContainer: { marginBottom: 40 },
    storeVolumeView: { flexDirection: 'row', alignItems: 'center' },
    tableRowHeaderView: { width: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },

    tableRowHeaderText: { fontSize: 12, fontWeight: '400' },

    tableRowView: {
        paddingHorizontal: 22,
        flexDirection: 'row',
        backgroundColor: '#F2F4F7',
        height: 60,
        alignItems: 'center',
        borderBottomWidth: 1
    },
    tableRowTitleView: { width: 100, flexDirection: 'row', marginRight: 44 },
    tableRowTitleViewSingle: { width: 250, flexDirection: 'row', marginRight: 44 },
    tableRowTitleViewTotal: {
        height: 60,
        alignItems: 'center',
        backgroundColor: '#F2F4F7',
        borderBottomColor: 'white',
        flexDirection: 'row',
        paddingHorizontal: 22
    },
    tableRowTitleText: { fontSize: 12 },
    tableRowInputContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
    tableRowInput: {
        paddingRight: 0,
        width: 60,
        height: 40,
        borderColor: '#00A2D9',
        borderWidth: 1,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    tableRowDisabledInput: {
        borderColor: '#dddddd',
        paddingRight: 0,
        width: 60,
        height: 40,
        borderWidth: 1,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    tableRowYellowInput: {
        borderColor: '#FFC409',
        paddingRight: 0,
        width: 60,
        height: 40,
        borderWidth: 1,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    tableRowInputTotal: {
        paddingRight: 0,
        width: 60,
        height: 40,
        borderColor: '#00A2D9',
        borderWidth: 1,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginLeft: 18
    },
    tableRowInputStyle: {
        fontSize: 12,
        margin: 'auto'
    },
    tableContainer: { marginTop: 40 },
    revertContainer: {
        marginHorizontal: 22,
        flexDirection: 'row',
        alignItems: 'center'
    },
    tableHeaderContainer: {
        width: 100,
        flexDirection: 'row',
        marginRight: 44
    },
    tableHeaderImage: {
        width: 14,
        height: 14
    },
    tableRowHeaderContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    revertText: {
        color: '#00A2D9',
        fontSize: 12,
        fontWeight: baseStyle.fontWeight.fw_700,
        marginLeft: 7
    },
    tableView: {
        backgroundColor: '#F2F4F7',
        marginTop: 9
    },
    checkBoxContainer: {
        flexDirection: 'row'
    },
    errorStyle: {
        color: 'red',
        fontSize: 12,
        fontWeight: '400'
    },
    errorView: {
        position: 'absolute',
        bottom: -20,
        left: 22,
        fontSize: 14,
        fontWeight: '700'
    },
    subContainer: {
        marginLeft: 22,
        height: 60,
        justifyContent: 'center'
    },
    borderBottomColor0: {
        borderBottomColor: 'rgba(0,0,0,0)'
    },

    inputContainerStyle: {
        borderBottomColor: 'rgba(0,0,0,0)',
        paddingLeft: 13
    },
    formStartContainer: {
        marginHorizontal: 22,
        marginBottom: 20,
        marginTop: 30,
        backgroundColor: '#F2F4F7',
        borderRadius: 6,
        height: 170
    },
    formPendingContainer: {
        marginHorizontal: 22,
        marginBottom: 20,
        marginTop: 30,
        backgroundColor: '#FFC409',
        borderRadius: 6,
        height: 170
    },
    formCompleteContainer: {
        marginHorizontal: 22,
        marginBottom: 20,
        marginTop: 30,
        backgroundColor: '#F2F4F7',
        borderRadius: 6,
        height: 170
    },
    formTitle: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center'
    },
    formText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '700'
    },
    formStepContainer: {
        height: 44,
        backgroundColor: '#6C0CC3',
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6
    },
    formMainText: {
        fontSize: 12,
        color: 'white',
        fontWeight: '700'
    },
    font12: {
        fontSize: 12
    },
    width72: {
        width: 72
    },
    totalQuestionText: {
        fontSize: 12,
        width: 58,
        textAlign: 'center',
        marginLeft: 13
    },
    totalSubQuestion: {
        width: '70%',
        justifyContent: 'flex-end',
        flexDirection: 'row'
    },
    redStartBox: { flexDirection: 'row', paddingLeft: 22 },
    redStar: {
        fontSize: 12,
        color: '#EB445A',
        fontWeight: '500'
    },
    pepsiShelvesTop: {
        width: 58,
        marginRight: 18
    },
    pepsiShelvesBottom: { fontSize: 12, textAlign: 'center' },
    cokeShelves: { fontSize: 12, width: 58, textAlign: 'center', marginRight: 18 },
    otherShelves: { fontSize: 12, width: 58, textAlign: 'center' },
    totalContainer: { borderColor: '#D3D3D3', marginRight: 6 },
    nullContainer: { borderColor: '#D3D3D3' },
    width83: {
        width: 83
    },
    subContainerTitle: {
        fontWeight: '700'
    },
    irSyncImage: { width: 14, height: 14, tintColor: '#D3D3D3' },
    irSyncText: {
        color: '#D3D3D3',
        fontSize: 12,
        fontWeight: baseStyle.fontWeight.fw_700,
        marginLeft: 7
    },
    formPendingC: {
        height: 44,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6
    },
    formPendingText: {
        fontSize: 12,
        fontWeight: '700'
    },
    formCompleteTitle: {
        fontSize: 16,
        fontWeight: '700'
    },
    formCompleteC: {
        backgroundColor: '#00A2D9',
        height: 44,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6
    },
    formCompleteText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700'
    },
    singleQuestionC: {
        borderBottomColor: '#ffffff',
        justifyContent: 'space-between'
    },
    marginLeft8: {
        marginLeft: 8
    },
    thirdStep: {
        width: '33%',
        left: -27,
        justifyContent: 'center',
        paddingLeft: 30,
        ...commonStyle.fullHeight,
        backgroundColor: baseStyle.color.bgGray,
        zIndex: -4
    },
    forthStep: {
        width: '43%',
        left: -47,
        justifyContent: 'center',
        paddingLeft: 30,
        ...commonStyle.fullHeight,
        backgroundColor: baseStyle.color.bgGray,
        zIndex: -4
    },
    headerContainer2: {
        zIndex: -2,
        width: 2,
        height: '100%',
        backgroundColor: 'white'
    },
    headerContainer4: {
        zIndex: -4,
        width: 2,
        height: '100%',
        backgroundColor: 'white'
    },
    sectionTitle: {
        color: '#000',
        fontSize: 18,
        fontWeight: baseStyle.fontWeight.fw_900,
        fontFamily: 'Gotham'
    },
    downArrow: {
        marginLeft: 10,
        width: 12,
        height: 7
    },
    medalsTextStyle: {
        color: '#565656',
        fontSize: 14,
        fontWeight: baseStyle.fontWeight.fw_400,
        fontFamily: 'Gotham'
    },
    fourteenBlackBold: {
        color: '#000',
        fontSize: 14,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontFamily: 'Gotham'
    },
    planographyView: {
        width: 84,
        height: 44,
        justifyContent: 'center'
    },
    fourteenBlackRegular: {
        color: '#000',
        fontSize: 14,
        fontWeight: baseStyle.fontWeight.fw_400,
        fontFamily: 'Gotham'
    },
    sixteenBlackBold: {
        color: '#000',
        fontSize: 16,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontFamily: 'Gotham'
    },
    twelveBlackRegular: {
        color: '#000',
        fontSize: 12,
        fontWeight: baseStyle.fontWeight.fw_400,
        fontFamily: 'Gotham'
    },
    pdfShadow: {
        shadowColor: '#004C97',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.12,
        shadowRadius: 10
    },
    tierSectionView: {
        marginTop: 40
    },
    tierTitleView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 22,
        marginBottom: 30
    },
    medalSelectionBtn: {
        flexDirection: 'row',
        width: 91,
        alignItems: 'center'
    },
    circleStyle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center'
    },
    medalSelectionBody: {
        flexDirection: 'row',
        marginLeft: 22
    },
    phonogramBox: {
        flexDirection: 'row',
        height: 204,
        width: 148,
        marginRight: 14,
        paddingBottom: 20,
        alignItems: 'flex-end'
    },
    proposedBox: {
        width: 58,
        height: 85,
        marginLeft: 6,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    medalScrollView: {
        height: 204,
        width: 250,
        flexDirection: 'row',
        marginRight: 10
    },
    shelvesBox: {
        borderRadius: 10,
        marginTop: 16,
        height: 60,
        marginHorizontal: 22,
        backgroundColor: '#F2F4F7',
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    shelvesValueBox: {
        width: 60,
        height: 40,
        backgroundColor: '#fff',
        borderColor: '#D3D3D3',
        borderWidth: 1,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center'
    },
    medalCardView: {
        width: 66,
        height: 184,
        marginRight: 10
    },
    medalCardSquareView: {
        width: 66,
        height: 165,
        borderWidth: 1,
        alignItems: 'center'
    },
    CDAStoreIconSize: {
        height: 30,
        width: 30
    },
    circleView: {
        width: 66,
        height: 44,
        alignItems: 'center',
        marginTop: -26
    },
    KpiRowView: {
        flexDirection: 'row',
        marginBottom: 1
    },
    KpiColumnView: {
        flexDirection: 'column',
        marginBottom: 1
    },
    KpiRowCustomColumn: {
        marginLeft: 22,
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: 152,
        marginRight: 10
    },
    kpiNameView: {
        width: 152,
        height: 60,
        marginRight: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    kpiNameLabel: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: 86,
        height: 60,
        marginRight: 6
    },

    kpiReferenceView: {
        height: 60,
        marginBottom: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    kpiReferenceValueView: {
        width: 66,
        height: 60,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomLine: {
        marginHorizontal: 22,
        marginTop: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    left28: {
        left: -28
    },
    formBodyText: {
        lineHeight: 16,
        color: '#000',
        fontSize: 12,
        fontWeight: '400'
    },
    formCardTitle: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 10
    },
    customSubTitleStyle: {
        fontWeight: '400',
        marginRight: 22
    },
    blueBoldText12: {
        fontSize: 12,
        fontWeight: '700',
        color: '#00A2D9'
    },
    addRewardHitSlop: {
        top: -10,
        bottom: -10
    },
    addRewardC: {
        marginLeft: 22,
        flexDirection: 'row',
        alignItems: 'center',
        height: 60
    },
    sellSheetContainer: {
        backgroundColor: '#F2F4F7',
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1
    },
    sellSheetHeaderText: {
        marginLeft: 22,
        marginTop: 24,
        fontSize: 12,
        fontWeight: '700'
    },
    sellSheetScrollContainer: {
        marginTop: 20,
        marginBottom: 33,
        paddingLeft: 22
    },
    shellSheetTile: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 180,
        backgroundColor: 'white',
        borderRadius: 5.5,
        height: 60,
        marginRight: 12
    },
    sellSheetDocIcon: {
        marginLeft: 17,
        marginRight: 12,
        width: 20,
        height: 25,
        tintColor: '#00A2D9'
    },
    sellSheetText: {
        fontSize: 12,
        paddingRight: 10
    },
    contentFieldTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.titleGray
    },
    contentFieldValue: {
        fontSize: baseStyle.fontSize.fs_16
    },
    presentCheckBox: {
        flexDirection: 'row',
        height: 62,
        width: '100%',
        paddingLeft: 10,
        paddingRight: 20,
        backgroundColor: '#F2F4F7',
        alignItems: 'center',
        marginBottom: 16
    },
    removeButton: {
        fontSize: 12,
        fontWeight: '700',
        color: '#EB445A'
    },
    rewardCardValue14: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 'auto'
    },
    rewardModalContainer: {
        backgroundColor: 'white',
        width: '90%',
        minHeight: 500,
        maxHeight: '70%',
        borderRadius: 8,
        overflow: 'hidden',
        paddingBottom: 60
    },
    modalNameText: {
        marginTop: 'auto',
        marginBottom: 'auto',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '700',
        paddingHorizontal: 30
    },
    modalImgContainer: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        marginHorizontal: 20
    },
    modalImg: {
        width: 232,
        height: 239,
        marginTop: 20,
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    modalRequirementRow: {
        flexDirection: 'row',
        marginHorizontal: 22
    },
    modalRequirementText: {
        fontSize: 14,
        marginTop: 35,
        fontWeight: '700'
    },
    modalValue: {
        fontSize: 14,
        marginTop: 35,
        fontWeight: '700',
        position: 'absolute',
        right: 0
    },
    modalDescription: {
        marginTop: 10.5,
        marginBottom: 20,
        fontSize: 12,
        marginHorizontal: 22
    },
    modalCloseBtn: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 60,
        backgroundColor: '#6C0CC3'
    },
    modalCloseBtnText: {
        marginTop: 'auto',
        marginBottom: 'auto',
        fontSize: 12,
        fontWeight: '700',
        color: 'white',
        textAlign: 'center'
    },
    height55: { height: 55 },
    listContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 110,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    listImg: {
        width: 70,
        height: 80,
        marginRight: 15
    },
    listNameValueC: {
        height: 80,
        justifyContent: 'space-evenly',
        flexShrink: 1
    },
    listNameText: {
        fontSize: 14,
        fontWeight: '700'
    },
    listValueText: {
        fontSize: 12,
        fontWeight: '700'
    },
    listCheckBox: {
        marginLeft: 'auto',
        marginRight: -5
    },
    listReward: {
        backgroundColor: '#D3D3D3',
        marginTop: 5,
        borderRadius: 20
    },
    gridContainer: {
        paddingBottom: 30,
        borderBottomColor: '#F2F4F7',
        borderBottomWidth: 2,
        paddingHorizontal: 22
    },
    gridImg: {
        marginTop: 30,
        minHeight: 150,
        minWidth: 120
    },
    gridNameText: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 21
    },
    gridValueText: {
        textAlign: 'center',
        marginTop: 6,
        fontSize: 14,
        fontWeight: '700'
    },
    gridMiddleContainer: {
        marginTop: 30,
        marginBottom: 5,
        flexDirection: 'row',
        alignItems: 'center'
    },
    gridRequirementText: {
        fontSize: 12,
        color: '#565656'
    },
    gridCheckBox: {
        position: 'absolute',
        marginRight: -5,
        right: 0
    },
    gridDescriptionText: {
        fontSize: 12,
        marginBottom: 6
    },
    gridReward: {
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: '#D3D3D3',
        marginTop: 10,
        borderRadius: 20
    },
    gridRewardText: {
        textAlign: 'center',
        paddingHorizontal: 16
    },
    rewardCardContainer: {
        paddingHorizontal: 22,
        flexDirection: 'row',
        alignItems: 'center',
        height: 110,
        backgroundColor: '#F2F4F7'
    },
    rewardCardMiddleContainer: {
        justifyContent: 'center',
        flexShrink: 1
    },
    rewardCardImg: {
        width: 60,
        height: 80,
        marginRight: 10
    },
    rewardCardNameText: {
        fontSize: 14,
        fontWeight: '700',
        paddingBottom: 5.35
    },
    rewardCardSeparator: {
        marginHorizontal: 10,
        height: 12,
        width: 1,
        backgroundColor: '#D3D3D3'
    },
    addRewardHeaderC: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 22,
        marginBottom: 12
    },
    addRewardHeader: {
        fontSize: 24,
        fontWeight: '900'
    },
    marginLeftAuto: { marginLeft: 'auto' },
    gridIcon: {
        width: 33,
        height: 29,
        tintColor: '#00A2D9'
    },
    listIcon: {
        width: 35,
        height: 31
    },
    listViewContainer: {
        paddingTop: 37,
        marginHorizontal: 22
    },
    agreementCheckBox: {
        marginVertical: 20,
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
        alignItems: 'center'
    },
    agreementChecked: {
        borderColor: baseStyle.color.black
    },
    agreementCheckBoxActive: {
        borderColor: baseStyle.color.LightBlue
    },
    agreementCheckBoxChecked: {
        backgroundColor: baseStyle.color.LightBlue
    },
    agreementCheckBoxIconView: {
        width: 18,
        height: 18,
        borderWidth: 1.5,
        borderColor: baseStyle.color.borderGray,
        marginRight: 13,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    agreementCheckBoxIcon: {
        width: 13,
        height: 13
    },
    formView: {
        marginHorizontal: 22,
        marginBottom: 20,
        marginTop: 30,
        backgroundColor: '#FFC409',
        borderRadius: 6,
        paddingVertical: 16,
        paddingHorizontal: 20,
        justifyContent: 'center'
    },
    completeFormCard: {
        marginHorizontal: 22,
        marginBottom: 20,
        marginTop: 30,
        backgroundColor: '#F2F4F7',
        borderRadius: 6,
        paddingVertical: 21
    }
})

export default SurveyQuestionsStyle

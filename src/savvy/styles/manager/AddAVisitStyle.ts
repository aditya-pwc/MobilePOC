/**
 * @description Add a visit style.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-05-31
 */

import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { StyleSheet } from 'react-native'

const AddAVisitStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    scrollView: {
        flex: 1,
        marginBottom: 64
    },
    content: {
        flex: 1,
        marginTop: 60,
        paddingHorizontal: 22
    },
    navStyle: {
        marginBottom: 0
    },
    topTitle: {
        paddingBottom: 24,
        ...commonStyle.alignCenter,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray
    },
    topTitleText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_bold,
        marginTop: 3
    },
    backButton: {
        width: 30,
        height: 30,
        position: 'absolute',
        left: 0,
        top: 0
    },
    backButtonImage: {
        width: 12,
        height: 21
    },
    pageHeader: {
        marginVertical: 22,
        ...commonStyle.alignCenter
    },
    titleText: {
        fontSize: baseStyle.fontSize.fs_24,
        marginBottom: 10,
        fontWeight: baseStyle.fontWeight.fw_900
    },
    formItem: {
        ...commonStyle.flexRowSpaceBet,
        paddingRight: 10,
        marginBottom: 30,
        borderBottomColor: baseStyle.color.borderGray,
        borderBottomWidth: 1
    },
    rightCol: {
        ...commonStyle.flexRowJustifyEnd,
        paddingVertical: 15,
        width: '50%'
    },
    label: {
        paddingTop: 15,
        paddingBottom: 17,
        color: baseStyle.color.black
    },
    textValue: {
        color: baseStyle.color.black,
        textAlign: 'right'
    },
    formItem2: {
        marginBottom: 40,
        paddingTop: 15,
        borderBottomColor: baseStyle.color.borderGray,
        borderBottomWidth: 1
    },
    label2: {
        fontSize: baseStyle.fontSize.fs_12,
        marginBottom: 8,
        color: baseStyle.color.titleGray
    },
    text2: {
        flexWrap: 'wrap',
        maxHeight: 60,
        fontFamily: 'Gotham-Book'
    },
    marginTop_10: {
        marginTop: 10
    },
    marginBottom_10: {
        marginBottom: 10
    },
    black_color: {
        color: baseStyle.color.black
    },
    formItem3: {
        ...commonStyle.flexRowJustifyEnd
    },
    formItemInstruction: {
        paddingBottom: 10
    },
    formSubItem: {
        ...commonStyle.flexRowSpaceBet
    },
    dateContainer: {
        ...commonStyle.flexRowJustifyEnd
    },
    datePicker: {
        margin: 20
    },
    imgCalendar: {
        marginTop: 13,
        marginLeft: 10,
        width: 20,
        height: 20,
        resizeMode: 'stretch'
    },
    imgTriangle: {
        width: 10,
        height: 5,
        marginTop: 8,
        marginLeft: 10,
        marginRight: 16
    },
    imgClockBlue: {
        width: 18,
        height: 18,
        marginLeft: 10
    },
    selectedSubTypeView: {
        overflow: 'visible',
        width: '100%'
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
    selectedContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
    },
    clearSubTypeContainer: {
        marginLeft: 10
    },
    imgClear: {
        width: 18,
        height: 19
    },
    searchItem: {
        paddingBottom: 0
    },
    searchContainer: {
        ...commonStyle.flexRowAlignCenter,
        marginBottom: 5
    },
    imgSearch: {
        width: 24,
        height: 22
    },
    bottomContainer: {
        position: 'absolute',
        left: 0,
        bottom: 30,
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
        elevation: 5,
        height: 300,
        width: '90%'
    },
    calendarModalView: {
        borderRadius: 8,
        margin: 20,
        backgroundColor: 'white',
        shadowColor: baseStyle.color.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 350,
        width: '90%'
    },
    modalViewSubType: {
        borderRadius: 8,
        height: 463,
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
    textColor_dark: {
        color: baseStyle.color.borderGray
    },
    subTypeItem: {
        ...commonStyle.flexRowAlignCenter,
        paddingLeft: 10,
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
    HeadText: {
        fontSize: baseStyle.fontSize.fs_16,
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_600,
        marginBottom: 20
    },
    RadioLine: {
        paddingTop: 10,
        display: 'flex',
        flexDirection: 'row',
        paddingBottom: 15
    },
    marginTop10: {
        marginTop: 10
    },
    colorGray: {
        color: baseStyle.color.gray
    },
    containerStyle: {
        marginTop: -15
    },
    labelStyle: {
        color: '#565656',
        fontWeight: '400',
        fontSize: 12
    }
})

export default AddAVisitStyle

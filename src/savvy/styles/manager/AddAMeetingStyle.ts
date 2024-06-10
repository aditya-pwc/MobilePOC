/**
 * @description add meeting styles
 * @author Beichen Li
 * @email beichen.a.li@pwc.com
 * @date 2021-09-01
 */

import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { StyleSheet } from 'react-native'

const AddAMeetingStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    content: {
        flex: 1
    },
    mainContainer: {
        backgroundColor: '#FFF',
        paddingLeft: 22,
        paddingRight: 22
    },
    headerContainer: {
        flex: 1,
        height: 36,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 67
    },
    navigationHeaderTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#000000'
    },
    imgAdd: {
        width: 36,
        height: 36
    },
    imgCalendar: {
        width: 20,
        height: 20,
        resizeMode: 'stretch'
    },
    imgClock: {
        width: 18,
        height: 18
    },
    imgSearch: {
        width: 24,
        height: 22
    },
    hitSlop: {
        top: 40,
        bottom: 40,
        left: 40,
        right: 40
    },
    imgClear: {
        width: 18,
        height: 19
    },
    contentContainer: {
        borderBottomColor: baseStyle.color.borderGray,
        borderBottomWidth: 1,
        marginBottom: 30,
        flex: 1
    },
    titleLabel: {
        fontSize: baseStyle.fontSize.fs_12,
        height: 14,
        marginBottom: 11,
        color: baseStyle.color.titleGray
    },
    contentLabel: {
        marginBottom: 8,
        fontSize: baseStyle.fontSize.fs_14,
        color: baseStyle.color.black
    },
    locationTextStyle: {
        fontSize: baseStyle.fontSize.fs_14,
        color: baseStyle.color.black,
        flex: 1
    },
    oneLineLabel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    centeredView: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
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
    datePicker: {
        margin: 20
    },
    durationStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    MB_200: {
        marginBottom: 200
    },
    BorderBottom_none: {
        borderBottomWidth: 0
    },
    selectText: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black
    },
    MR_10: {
        marginRight: 10
    },
    ML_10: {
        marginLeft: 10
    },
    MH_10: {
        marginHorizontal: 10
    },
    MT_3: {
        marginTop: 3
    },
    imgTriangle: {
        width: 10,
        height: 5,
        marginHorizontal: 10
    },
    locationLabelStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 8,
        paddingRight: 0,
        overflow: 'hidden'
    },
    PB_4: {
        paddingBottom: 4
    },
    placeHolderStyle: {
        flex: 1,
        fontSize: baseStyle.fontSize.fs_14,
        color: baseStyle.color.borderGray,
        fontWeight: baseStyle.fontWeight.fw_400
    },
    selectedContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        paddingBottom: 8
    },
    subTypeCell: {
        flexDirection: 'row',
        backgroundColor: baseStyle.color.bgGray,
        marginRight: 10,
        paddingVertical: 7,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 15,
        marginVertical: 4,
        alignItems: 'center'
    },
    readonlyShowMoreCell: {
        backgroundColor: baseStyle.color.white,
        borderColor: baseStyle.color.tabBlue,
        borderWidth: 1,
        paddingVertical: 6,
        paddingHorizontal: 9
    },
    showMoreText: {
        fontWeight: '700',
        color: baseStyle.color.tabBlue
    },
    clearSubTypeContainer: {
        marginLeft: 10
    },
    inputStyle: {
        flexWrap: 'wrap',
        maxHeight: 60,
        marginBottom: 8,
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Gotham-Book'
    },
    onlyReadInput: {
        fontSize: 14,
        color: '#000000',
        flexWrap: 'wrap'
    },
    attendeesText: {
        flexShrink: 1
    },
    AL_CENTER: {
        alignItems: 'center'
    },
    editBtn: {
        fontSize: 12,
        color: baseStyle.color.tabBlue,
        fontWeight: '700'
    },
    editBtnDisabled: {
        color: baseStyle.color.titleGray
    },
    onlyReadTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    deleteBtn: {
        height: 44,
        borderWidth: 1,
        borderColor: baseStyle.color.red,
        borderRadius: 6,
        ...commonStyle.alignCenter
    },
    disabledDeleteBtn: {
        borderColor: baseStyle.color.titleGray
    },
    disabledDeleteBtnText: {
        color: baseStyle.color.titleGray
    },
    deleteBtnText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.red
    },
    onlyReadContentContainer: {
        flex: 1,
        marginBottom: 30
    },
    durationLabel: {
        // flex: 1,
        // width: '100%'
    },
    duplicateBtn: {
        borderRadius: 0,
        height: 60,
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#fff',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#87939E',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 1,
        shadowRadius: 10
    },
    duplicateText: {
        color: '#6C0CC3',
        fontWeight: '700',
        fontSize: 12
    },
    clockContainer: {
        width: 160,
        height: 50,
        borderWidth: 1,
        borderRadius: 6,
        borderColor: '#DBDBDB',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    clockImg: {
        width: 22,
        height: 22
    },
    clockContent: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 20
    },
    clockTime: {
        color: '#000000',
        fontWeight: '700',
        fontSize: 12
    },
    clockStatus: {
        fontWeight: '400'
    },
    clockOutView: {
        flexDirection: 'row'
    },
    emptyBlock: {
        height: 60
    }
})

export default AddAMeetingStyle

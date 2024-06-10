/**
 * @description  visit card detail style.
 * @author Yuan Yue
 * @email yue.yuan@pwc.com
 * @date 2021-06-23
 */

import { StyleSheet } from 'react-native'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'

export const VisitDetailsStyle = StyleSheet.create({
    ...commonStyle,
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.bgGray
    },
    deHeader: {
        flexDirection: 'row',
        paddingHorizontal: 22,
        justifyContent: 'space-between'
    },

    deTitle: {
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900,
        color: baseStyle.color.black
    },
    planContent: {
        paddingTop: 104,
        backgroundColor: baseStyle.color.white,
        paddingHorizontal: 22,
        paddingBottom: 87,
        borderTopColor: baseStyle.color.borderGray,
        borderTopWidth: 1
    },

    ScrollViewBoder: {
        paddingBottom: 40
    },

    visitCard: {
        marginTop: 31,
        zIndex: 999,
        marginBottom: -88,
        paddingHorizontal: 22
    },

    flexSelectRow: {
        height: 50,
        marginTop: 10,
        borderBottomColor: baseStyle.color.borderGray,
        alignItems: 'center'
    },
    SubtypeRow: {
        marginTop: 25,
        ...commonStyle.flexRowSpaceBet,
        marginBottom: 15
    },
    noBottomLine: {
        borderBottomColor: baseStyle.color.white
    },
    bottomLine: {
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray
    },
    flexRow: {
        height: 16,
        marginBottom: 30,
        marginTop: 10,
        ...commonStyle.flexRowSpaceBet
    },

    selectLabel: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    smallSelectLabel: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },

    selectValue: {
        color: baseStyle.color.black
    },

    marginTop_30: {
        marginTop: 30
    },

    imgTriangle: {
        width: 10,
        height: 5,
        marginHorizontal: 10
    },

    flexRowAlignCenter: {
        ...commonStyle.flexRowAlignCenter
    },

    flexDirectionRow: {
        ...commonStyle.flexRowSpaceBet
    },

    planBox: {
        width: 170
    },
    cellImgIcon: {
        marginRight: 10,

        width: 20,
        height: 18,
        resizeMode: 'stretch'
    },
    planValueRow: {
        ...commonStyle.flexRowSpaceBet
    },

    planLabelRow: {
        marginBottom: 10,
        ...commonStyle.flexRowSpaceBet
    },
    planValueBox: {
        ...commonStyle.flexRowSpaceBet,
        width: 170,
        paddingBottom: 10
    },

    selectedContainer: {
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

    imgClear: {
        width: 18,
        height: 19
    },

    instructionsText: {
        fontWeight: baseStyle.fontWeight.fw_400,
        fontSize: baseStyle.fontSize.fs_14
    },
    instructionsRow: {
        marginTop: 10,
        paddingBottom: 10
    },

    clearSubTypeContainer: {
        marginLeft: 10
    },

    userInfoCard: {
        marginTop: -75,
        marginBottom: 40
    },

    swipDeliveryCardStyle: {
        marginTop: -20,
        alignItems: 'center'
    },
    topCustomerCardView: {
        minHeight: 150,
        marginHorizontal: 0,
        backgroundColor: baseStyle.color.white
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
    durationModalView: {
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
    marginBottom_30: {
        marginBottom: 30
    },
    marginBottom_20: {
        marginBottom: 20
    },
    marginBottom_120: {
        marginBottom: 120
    },
    inputStyle: {
        flexWrap: 'wrap',
        maxHeight: 60,
        marginVertical: 10,
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Gotham-Book'
    },
    marginTop_60: {
        marginTop: -60
    }
})

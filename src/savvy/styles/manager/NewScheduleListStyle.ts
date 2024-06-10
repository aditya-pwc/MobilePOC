/**
 * @description New Schedule List style.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-05-24
 */

import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { StyleSheet } from 'react-native'

const NewScheduleListStyle = StyleSheet.create({
    flipPhone: {
        position: 'absolute',
        width: 50,
        height: 50,
        zIndex: 100,
        top: 22,
        right: 10
    },
    landScapeView: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: baseStyle.color.white
    },
    landScapeLeftView: {
        width: 428,
        height: 428
    },
    landscapeTitleText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#000'
    },
    modalStyle: {
        marginHorizontal: 35,
        marginTop: 56
    },
    topContent: {
        // backgroundColor: 'red',
        paddingTop: 44,
        paddingHorizontal: 22,
        width: 428,
        height: 152
    },
    titleContent: {
        marginBottom: 23
    },

    listView: {
        width: 428,
        height: 276,
        backgroundColor: baseStyle.color.white
    },
    landScapeRightView: {
        flex: 1,
        marginTop: -44
    },
    LandScapeModalView: {
        marginHorizontal: 35,
        marginTop: 56
    },
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    customerCon: {
        paddingTop: 5
    },
    titleRow: {
        paddingHorizontal: baseStyle.padding.pd_22,
        marginTop: 30,
        ...commonStyle.flexRowSpaceBet
    },
    rightBtn: {
        ...commonStyle.flexRowJustifyEnd,
        alignItems: 'center'
    },
    titleText: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900
    },
    newBtn: {
        ...commonStyle.flexRowAlignCenter,
        marginRight: 15
    },
    imgCal: {
        width: 26,
        height: 22,
        marginRight: 6
    },
    newText: {
        color: baseStyle.color.purple,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    tabRow: {
        shadowColor: baseStyle.color.tabShadowBlue,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        marginHorizontal: baseStyle.margin.mg_22,
        height: 44,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: baseStyle.color.borderGray,
        ...commonStyle.flexRowSpaceEvenlyCenter,
        backgroundColor: baseStyle.color.white,
        marginTop: -22
    },
    tabWidth: {
        flexGrow: 1
    },
    tabText: {
        color: baseStyle.color.tabBlue,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_12,
        lineHeight: 32,
        textAlign: 'center',
        ...commonStyle.fullHeight
    },
    metrics: {
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: 'white',
        paddingHorizontal: baseStyle.padding.pd_22
    },
    countTitle: {
        ...commonStyle.flexRowSpaceBet
    },
    countTitleWrap: {
        flexDirection: 'row',
        borderRadius: 10,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowColor: '#004C97',
        padding: 12,
        width: 120,
        backgroundColor: '#fff',
        alignItems: 'center'
    },
    countTitleInner: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    dotStyle: {
        marginLeft: 5,
        marginTop: 4,
        marginRight: 10
    },
    yet2startStatus: {
        backgroundColor: '#EB445A'
    },
    inProgressStatus: {
        backgroundColor: '#FFC409'
    },
    completedStatus: {
        backgroundColor: '#2DD36F'
    },
    textAlignRight: {
        textAlign: 'right'
    },
    countTitleText: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400
    },
    countNumText: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    marginTop4: {
        marginTop: 4
    },
    flexPadding: {
        flex: 1
    },
    tintColorGray: {
        tintColor: baseStyle.color.gray
    },
    colorGray: {
        color: baseStyle.color.gray
    },
    blueColor: {
        color: baseStyle.color.tabBlue
    },
    whiteColor: {
        color: baseStyle.color.white
    },
    floatIcon: {
        position: 'absolute',
        right: 25,
        bottom: 40
    },
    floatIconContainer: {
        width: 50,
        height: 50
    },
    iconStyle: {
        ...commonStyle.fullWidth,
        ...commonStyle.fullHeight
    },
    tabView: {
        backgroundColor: baseStyle.color.tabBlue,
        borderRadius: 4,
        margin: 6
    },
    bgWhite: {
        backgroundColor: baseStyle.color.white
    },
    alignCenter: {
        ...commonStyle.alignCenter
    },
    emptyImg: {
        width: 184,
        height: 246,
        marginBottom: 42,
        marginTop: 100
    },
    emptyText: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black,
        marginBottom: 5
    },
    emptySubText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    inProgressImg: {
        width: 200,
        height: 200,
        marginBottom: 50,
        marginTop: 60
    },
    imgAddButton: {
        left: 0
    },
    imgAdd: {
        height: 36,
        width: 36
    },
    MB_20: {
        marginBottom: 20
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: 'white'
    },
    unassignTabRow: {
        height: 45,
        backgroundColor: '#EB445A',
        paddingHorizontal: 14,
        justifyContent: 'space-between',
        marginTop: 20,
        borderRadius: 10
    },
    unassignTabText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: 'normal',
        color: '#FFFFFF',
        marginHorizontal: 8,
        flex: 1
    },
    unassignTabUnassignImage: {
        width: 30,
        height: 30,
        resizeMode: 'contain'
    },
    unassignTabNextImage: {
        width: 16,
        height: 26,
        tintColor: 'white'
    },
    fontSize_700: {
        fontWeight: baseStyle.fontWeight.fw_700
    },
    favoriteItem: {
        backgroundColor: baseStyle.color.bgGray,
        paddingHorizontal: 10,
        flex: 1,
        paddingBottom: 10
    },
    moreOptionButton: {
        marginLeft: 20
    },
    statusCard: {
        padding: 20,
        paddingBottom: 32
    }
})

export default NewScheduleListStyle

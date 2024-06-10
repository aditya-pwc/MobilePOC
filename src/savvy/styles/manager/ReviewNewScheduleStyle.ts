/**
 * @description Review new schedule style.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-05-28
 */
import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { StyleSheet } from 'react-native'

const ReviewNewScheduleStyle = StyleSheet.create({
    reviewContainer: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    content: {
        marginTop: 60
    },
    topTitle: {
        marginHorizontal: 22,
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
    imgAddButton: {
        right: 0,
        bottom: 10
    },
    imgAdd: {
        width: 36,
        height: 36
    },
    pageHeader: {
        minHeight: 104,
        ...commonStyle.alignCenter
    },
    titleText: {
        fontSize: baseStyle.fontSize.fs_24,
        marginBottom: 10,
        fontWeight: baseStyle.fontWeight.fw_bold
    },
    dateText: {
        fontSize: baseStyle.fontSize.fs_12
    },
    tabRow: {
        shadowColor: baseStyle.color.tabShadowBlue,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        marginRight: 22,
        marginLeft: 22,
        height: 44,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: baseStyle.color.borderGray,
        ...commonStyle.flexRowSpaceEvenlyCenter,
        backgroundColor: baseStyle.color.white
    },
    tabWidth: {
        flexGrow: 1
    },
    tabText: {
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_12,
        ...commonStyle.fullHeight,
        lineHeight: 32,
        textAlign: 'center'
    },
    blueColor: {
        color: baseStyle.color.tabBlue
    },
    whiteColor: {
        color: baseStyle.color.white
    },
    metrics: {
        marginTop: 28,
        paddingLeft: 22,
        paddingRight: 22
    },
    container: {
        minHeight: 110,
        paddingLeft: 22,
        ...commonStyle.flexRowSpaceCenter
    },
    imgStore: {
        width: 50,
        height: 50,
        borderRadius: 25
    },
    rightInfo: {
        flexShrink: 1,
        ...commonStyle.flexRowSpaceCenter,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray,
        paddingRight: 22,
        paddingTop: 26,
        paddingBottom: 26
    },
    flexShrinkCol: {
        flexShrink: 1,
        flexDirection: 'column'
    },
    storeName: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    itemSubTile: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.titleGray,
        flexWrap: 'wrap',
        marginTop: 5,
        alignSelf: 'flex-start'
    },
    avatar: {
        width: 26,
        height: 26,
        borderRadius: 4,
        alignSelf: 'flex-end'
    },
    userName: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.titleGray,
        flexWrap: 'wrap',
        marginTop: 9,
        alignSelf: 'flex-end'
    },
    tooltipContainer: {
        minWidth: 240,
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 10,
        backgroundColor: baseStyle.color.white,
        borderRadius: 4,
        padding: 0,
        alignSelf: 'flex-end'
    },
    moreText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.titleGray,
        marginTop: 4,
        alignSelf: 'flex-end'
    },
    bottomContainer: {
        flexDirection: 'row',
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10,
        marginBottom: 30
    },
    btnCancel: {
        flexGrow: 1,
        width: '50%',
        backgroundColor: baseStyle.color.white,
        height: 60,
        ...commonStyle.alignCenter
    },
    btnAccept: {
        flexGrow: 1,
        width: '50%',
        backgroundColor: baseStyle.color.purple,
        height: 60,
        ...commonStyle.alignCenter
    },
    textCancel: {
        color: baseStyle.color.purple,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    textAccept: {
        color: baseStyle.color.white,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    dataListContainer: {
        flex: 1,
        paddingTop: 20
    },
    paddingBottom_52: {
        paddingBottom: 52
    },
    tabView: {
        backgroundColor: baseStyle.color.tabBlue,
        borderRadius: 4,
        margin: 6
    },
    bgWhite: {
        backgroundColor: baseStyle.color.white
    },
    unassignTabRow: {
        height: 45,
        backgroundColor: '#EB445A',
        paddingHorizontal: 14,
        justifyContent: 'space-between',
        marginBottom: 27
    },
    unassignTabText: {
        fontSize: 12,
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
        fontWeight: '700'
    },
    optimizedVisitsCardWrap: {
        marginHorizontal: 25,
        marginVertical: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 4,
        shadowColor: 'rgba(0,0,0,.2)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 4,
        shadowRadius: 4,
        backgroundColor: '#fff',
        position: 'relative'
    },
    flexRow: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: 5
    },
    marginTop10: {
        marginTop: 10
    },
    colorGray: {
        color: baseStyle.color.titleGray
    },
    colorLiteGrey: {
        color: baseStyle.color.cGray
    },
    fontSize18: {
        fontSize: 18
    },
    marginTop3: {
        marginTop: 4
    },
    spaceBetween: {
        justifyContent: 'space-between'
    },
    colorRed: {
        color: baseStyle.color.red
    },
    ovTipWrap: {
        position: 'absolute',
        width: 300,
        height: 71,
        padding: 15,
        paddingVertical: 12,
        backgroundColor: baseStyle.color.white,
        borderRadius: 4,
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 4,
        top: -90,
        right: 0
    },
    tipText: {
        textAlign: 'center',
        lineHeight: 21,
        fontSize: 16
    },
    trangleDown: {
        width: 20,
        height: 20,
        transform: [{ rotate: '45deg' }],
        backgroundColor: baseStyle.color.white,
        position: 'absolute',
        bottom: -10,
        right: 18,
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowRadius: 4,
        shadowOpacity: 4
    },
    mask: {
        position: 'absolute',
        width: 40,
        height: 20,
        right: 9,
        bottom: 0,
        backgroundColor: baseStyle.color.white,
        zIndex: 10
    },
    dropdownBackground: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99
    }
})

export default ReviewNewScheduleStyle

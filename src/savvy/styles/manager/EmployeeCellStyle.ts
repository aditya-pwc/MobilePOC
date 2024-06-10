/**
 * @description Employee cell style.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-05-25
 */

import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { StyleSheet } from 'react-native'
import { COLOR_TYPE } from '../../enums/MerchandiserEnums'

const EmployeeCellStyle = StyleSheet.create({
    container: {
        height: 80,
        paddingLeft: 22,
        ...commonStyle.flexRowSpaceCenter,
        position: 'relative'
    },
    myDayEmployeeCellContainer: {
        height: 110,
        paddingLeft: 22,
        ...commonStyle.flexRowSpaceCenter
    },
    touchableArea: {
        flex: 1,
        marginLeft: -22,
        paddingLeft: 22,
        ...commonStyle.flexRowAlignCenter
    },
    imgAvatar: {
        width: 40,
        height: 40,
        borderRadius: 8
    },
    imgAvatarEmployee: {
        width: 50,
        height: 50,
        borderRadius: 8
    },
    optimizedEmployeeAvatar: {
        width: 60,
        height: 60,
        borderRadius: 8
    },
    optimizedCard: {
        ...commonStyle.flexRowSpaceCenter,
        position: 'relative',
        paddingLeft: 20,
        paddingVertical: 25,
        marginBottom: 16,
        borderRadius: 6,
        shadowColor: '#004C97',
        shadowOpacity: 0.17,
        shadowOffset: { width: 0, height: 2 }
    },
    optimizedContent: {
        // overrite below `content` style for optimized reassign employee cell
        paddingTop: 0,
        paddingBottom: 0,
        height: '100%'
    },
    content: {
        flex: 1,
        flexGrow: 1,
        ...commonStyle.flexRowSpaceCenter,
        height: 79,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray,
        paddingRight: 22,
        paddingTop: 20,
        paddingBottom: 20
    },
    myDayContent: {
        flex: 1,
        flexGrow: 1,
        ...commonStyle.flexRowSpaceCenter,
        height: 109,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray,
        paddingRight: 22,
        paddingTop: 20,
        paddingBottom: 20
    },
    contentWithoutBorder: {
        borderBottomColor: baseStyle.color.white
    },
    userName: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    subtypeContainer: {
        ...commonStyle.flexRowAlignCenter,
        marginTop: 6
    },
    subtype: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    textMaxWidth_140: {
        maxWidth: 140
    },
    textMaxWidth_180: {
        maxWidth: 180
    },
    textMaxWidth_30: {
        maxWidth: 30
    },
    textMaxWidth_50: {
        maxWidth: 50
    },
    textMinWidth_20: {
        minWidth: 20
    },
    textMaxWidth_260: {
        maxWidth: 260
    },
    indicator: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EB445A',
        position: 'absolute',
        right: -10,
        bottom: -5
    },
    indicatorNumber: {
        alignSelf: 'center',
        fontWeight: '700',
        fontSize: 12,
        fontFamily: 'Gotham',
        color: '#FFFFFF'
    },
    subtypeLine: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.borderGray,
        marginHorizontal: 3
    },
    orderContainer: {
        paddingHorizontal: 5,
        height: 20,
        borderWidth: 1,
        borderColor: baseStyle.color.titleGray,
        borderRadius: 10,
        marginLeft: 10,
        ...commonStyle.alignCenter
    },
    orderText: {
        color: baseStyle.color.titleGray,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_12
    },
    status: {
        ...commonStyle.flexRowAlignCenter,
        marginTop: 7
    },
    totalVisits: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    statusIcon: {
        marginRight: 8,
        width: 8,
        height: 8,
        backgroundColor: baseStyle.color.white,
        borderRadius: 4,
        marginTop: 4
    },
    statusText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    imgChevron: {
        width: 16,
        height: 26
    },
    middle: {
        flex: 1,
        flexGrow: 1
    },
    rightBtn: {
        flexDirection: 'row',
        marginLeft: 20
    },
    topRow: {
        ...commonStyle.flexRowSpaceBet
    },
    leftCol: {
        flexShrink: 1
    },
    rightCol: {
        ...commonStyle.flexRowCenter
    },
    line: {
        color: baseStyle.color.cGray
    },
    totalHours: {
        color: baseStyle.color.titleGray,
        fontSize: baseStyle.fontSize.fs_12
    },
    employee: {
        color: '#EB445A',
        fontWeight: '700',
        fontFamily: 'Gotham'
    },
    totalHoursActive: {
        fontWeight: baseStyle.fontWeight.fw_bold,
        color: baseStyle.color.red
    },
    totalCases: {
        color: baseStyle.color.titleGray,
        fontSize: baseStyle.fontSize.fs_12
    },
    borderBottomWidth0: {
        borderBottomWidth: 0
    },
    borderBottomWidth1: {
        borderBottomWidth: 1
    },
    borderBottomColorWhite: {
        borderBottomColor: baseStyle.color.white
    },
    backgroundColorGrey: {
        backgroundColor: baseStyle.color.bgGray
    },

    backgroundColorWhite: {
        backgroundColor: baseStyle.color.white
    },
    marginRight15: {
        marginRight: 15
    },
    avatarContainerStyle: {
        alignSelf: 'flex-start',
        marginTop: 20,
        marginBottom: 'auto',
        justifyContent: 'flex-start',
        flexDirection: 'row'
    },
    marginTop5: {
        marginTop: 5
    },
    assignStyle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.tabBlue
    },
    uncheckStyle: {
        ...commonStyle.size_24,
        marginRight: 5
    },
    uncheckContainer: {
        borderWidth: 0,
        padding: 0
    },
    flexGrowEnd: {
        flexGrow: 1,
        flexDirection: 'column',
        alignItems: 'flex-end'
    },
    flexShrinkCol: {
        flexShrink: 1,
        flexDirection: 'column'
    },
    imgNew: {
        width: 45,
        height: 22,
        position: 'absolute',
        top: 0,
        left: 0
    },
    textRole: {
        color: '#565656',
        fontSize: 12
    },
    imgUserImage: {
        width: 60,
        height: 60,
        borderRadius: 8
    },
    sunburstContainer: {
        height: 100,
        borderRadius: 8
    },
    UnassignedContainer: {
        height: 100,
        alignItems: 'flex-start',
        paddingTop: 21
    },
    unassignedStatus: {
        marginBottom: 20
    },
    statusMainContainer: {
        marginTop: 6,
        ...commonStyle.flexRowAlignCenter
    },
    flexStyle: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    alignStyle: {
        alignItems: 'center'
    },
    titleWrapStyle: {
        marginTop: 6
    },
    titleTextStyle: {
        fontSize: 12,
        color: baseStyle.color.titleGray
    },
    imagesContainer: {
        margin: 'auto'
    },
    paddingLeft_0: {
        paddingLeft: 0
    },
    paddingLeft_20: {
        paddingLeft: 20
    },
    height_100: {
        height: 100
    },
    maxWidth_320: {
        maxWidth: 320
    },
    paddingHorizontal_12: {
        paddingRight: 12,
        paddingLeft: 12
    },
    paddingLeft_12: {
        paddingLeft: 12
    },
    paddingRight_12: {
        paddingRight: 12
    },
    favoriteIcon: {
        position: 'absolute',
        top: 0,
        right: 12
    },
    alignStartStyle: {
        alignItems: 'flex-start'
    },
    flexGrow_1: {
        ...commonStyle.flexGrow_1
    },
    favoriteCell: {
        flex: 1,
        flexDirection: 'column'
    },
    unfinishedView: {
        flexDirection: 'row',
        height: 5,
        backgroundColor: COLOR_TYPE.GRAY
    },
    height_5: {
        height: 5
    },
    width_3: {
        width: 3
    },
    marginTop_3: {
        marginTop: -3
    },
    future10: {
        paddingTop: 12
    },
    isFavoriteIcon: {
        paddingLeft: 20,
        marginRight: -9
    }
})

export default EmployeeCellStyle

import { Dimensions, StyleSheet } from 'react-native'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { baseStyle } from '../../../common/styles/BaseStyle'

const CustomerDetailStyle = StyleSheet.create({
    pushOrderBarBox: {
        position: 'relative',
        bottom: 10
    },
    imgAdd: {
        width: 36,
        height: 36,
        tintColor: 'white'
    },
    imgUserImage: {
        width: 60,
        height: 60,
        borderRadius: 8
    },
    imgCameraImage: {
        width: 22,
        height: 22,
        position: 'absolute',
        bottom: -2,
        right: -2
    },
    itemContentContainer: {
        flex: 1,
        marginLeft: 15,
        marginRight: 20
    },
    fontWeight_900: {
        fontWeight: '900'
    },
    fontWeight_700: {
        fontWeight: '700'
    },
    fontWeight_400: {
        fontWeight: '400'
    },
    fontSize_12: {
        fontSize: 12
    },
    fontSize_16: {
        fontSize: 16
    },
    fontSize_18: {
        fontSize: 18
    },
    fontColor_black: {
        color: '#000000'
    },
    fontColor_gary: {
        color: '#565656'
    },
    fontColor_lightGary: {
        color: '#D3D3D3'
    },
    marginTop_6: {
        marginTop: 6
    },
    marginTop_16: {
        marginTop: 16
    },
    marginRight_8: {
        marginRight: 8
    },
    marginRight_20: {
        marginRight: 20
    },
    marginRight_30: {
        marginRight: 30
    },
    marginRight_32: {
        marginRight: 32
    },
    marginLeft_5: {
        marginLeft: 5
    },
    marginLeft_10: {
        marginLeft: 10
    },
    marginLeft_20: {
        marginLeft: 20
    },
    marginBottom_20: {
        marginBottom: 20
    },
    marginHorizontal_20: {
        marginHorizontal: 20
    },
    paddingBottom_30: {
        paddingBottom: 30
    },
    paddingTop_15: {
        paddingTop: 15
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    imgPhoneAndMsg: {
        width: 18,
        height: 18
    },
    imgLocation: {
        width: 18,
        height: 21
    },
    tabButton: {
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 22,
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
    teamItem: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 6,
        alignItems: 'center',
        shadowOpacity: 0.4,
        shadowColor: '#004C97',
        shadowOffset: { width: 0, height: 2 }
    },
    teamItem_without_border: {
        flex: 1,
        height: 110,
        backgroundColor: 'white',
        flexDirection: 'row',
        paddingHorizontal: 20,
        borderRadius: 6,
        alignItems: 'center'
    },
    itemLine: {
        width: 1,
        height: 14,
        backgroundColor: '#D3D3D3',
        marginLeft: 7,
        marginRight: 5
    },
    itemBottomContainer: {
        height: 40,
        backgroundColor: '#F2F4F7',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'stretch',
        paddingHorizontal: 20,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6
    },
    container: { flex: 1, backgroundColor: 'white' },
    imageBg: { width: '100%', height: 150 },
    imageBgView: {
        marginTop: 51,
        // alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: 22
    },
    dropDownStyle: {
        position: 'relative',
        top: -10,
        zIndex: 999
    },
    pageTitle: { fontSize: 12, fontWeight: '700', color: 'white', marginTop: 5 },
    headerViewContainer: {
        width: '100%',
        height: 130,
        backgroundColor: '#000000',
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6
    },
    headerView: {
        marginHorizontal: 22,
        marginTop: -36,
        borderRadius: 6,
        backgroundColor: 'white',
        height: 110,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20
    },
    headerTab: {
        marginTop: 20,
        height: 25,
        marginHorizontal: 22
    },
    daysViewContainer: {
        height: 170,
        backgroundColor: '#F2F4F7'
    },
    daysViewRowContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: 30
    },
    daysViewRowItemView: {
        flex: 1,
        paddingLeft: 22
    },
    daysViewRowItemTitle: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656'
    },
    daysViewRowItemValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
        marginTop: 4,
        marginRight: 25
    },
    daysViewRowItemDayItemView: {
        flexDirection: 'row',
        marginTop: 4
    },
    mapImage: { width: 384, height: 286, marginHorizontal: 22, marginTop: 20 },
    deleteBtn: {
        height: 44,
        borderWidth: 1,
        borderColor: baseStyle.color.red,
        borderRadius: 6,
        marginTop: 50,
        marginBottom: 40,
        marginHorizontal: 22,
        ...commonStyle.alignCenter
    },
    deleteBtnText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.red
    },
    errContainer: {
        backgroundColor: baseStyle.color.bgGray
    },
    errBar: {
        marginHorizontal: 22,
        marginTop: 24,
        marginBottom: 0
    },
    secErrBarSpace: {
        marginTop: 10
    },
    errTip: {
        position: 'absolute',
        right: -15,
        bottom: 9
    },
    goCartView: {
        marginTop: 20,
        marginHorizontal: 10,
        flexDirection: 'row-reverse'
    },
    goCartContainer: {
        backgroundColor: baseStyle.color.white
    },
    readonlyContainer: {
        backgroundColor: '#F2F4F7',
        marginBottom: 10
    },
    // below styles for enhance French UI #7051692
    marginTop_15: {
        marginTop: 15
    },
    checkBoxContainerHeight: {
        height: 'auto',
        minHeight: 35
    },
    visitsCountHeight: {
        height: '100%',
        lineHeight: 35
    },
    checkBoxRowStyle: {
        flex: 1,
        flexWrap: 'wrap-reverse',
        alignSelf: 'flex-start',
        justifyContent: 'flex-end'
    },
    lineHeight_35: {
        lineHeight: 35
    },
    width_40: {
        width: 40
    },
    topRightButton: {
        position: 'absolute',
        top: 840,
        width: '100%',
        justifyContent: 'center',
        zIndex: 2
    },
    tintColorWhite: {
        tintColor: 'white'
    },
    contractTabBackgroundColor: { backgroundColor: '#F2F4F7' },
    grayBg: {
        backgroundColor: '#F2F4F7'
    },
    posBtn: {
        height: Dimensions.get('window').height / 18,
        position: 'absolute',
        bottom: 44,
        width: '100%',
        justifyContent: 'center',
        zIndex: 2
    },
    gap: {
        width: '100%',
        height: 200,
        backgroundColor: '#FFFFFF'
    },
    geoFenceSuccessView: {
        paddingHorizontal: 22,
        width: 384,
        height: 254
    }
})

export default CustomerDetailStyle

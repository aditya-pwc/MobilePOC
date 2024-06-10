/**
 * @description Common style.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-05-24
 */
import { Dimensions, StyleSheet } from 'react-native'
import { baseStyle } from './BaseStyle'
import DeviceInfo from 'react-native-device-info'

const { width } = Dimensions.get('window')

export const commonStyle = StyleSheet.create({
    alignCenter: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    fullWidth: {
        width: '100%'
    },
    halfWidth: {
        width: '50%'
    },
    oneThird: {
        width: '33.33%'
    },
    fullHeight: {
        height: '100%'
    },
    flexRowSpaceBet: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    pickTileBorderStyle: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        paddingRight: 13
    },
    borderBottomGrayColor: {
        borderBottomColor: '#D3D3D3'
    },
    errorBorderBottomGrayColor: {
        borderBottomColor: '#EB445A'
    },
    flexRowJustifyCenter: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    flexRowAlignCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    flexRowCenter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    flexRowSpaceCenter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    flexRowSpaceEvenlyCenter: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    flexRowAlignEnd: {
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    alignItemsEnd: {
        alignItems: 'flex-end'
    },
    flexRowJustifyEnd: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    flexCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    transparentModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    routeTextWidth: {
        width: '45%'
    },
    textAlignRight: {
        textAlign: 'right'
    },
    textAlignCenter: {
        textAlign: 'center'
    },
    centerWrapStyle: {
        marginLeft: 15
    },
    hitSlop: {
        top: 30,
        bottom: 30,
        left: 50,
        right: 50
    },
    hitSlop30: {
        left: 30,
        top: 30,
        right: 30,
        bottom: 30
    },
    hitSlop15: {
        left: 30,
        top: 30,
        right: 30,
        bottom: 30
    },
    smallHitSlop: {
        top: 20,
        bottom: 20,
        left: 10,
        right: 10
    },
    flexGrow_0: {
        flexGrow: 0
    },
    flexGrow_1: {
        flexGrow: 1
    },
    statusIcon: {
        width: 8,
        height: 8,
        backgroundColor: baseStyle.color.white,
        borderRadius: 4
    },
    flex_1: {
        flex: 1
    },
    flexShrink_1: {
        flexShrink: 1
    },
    flexDirectionRow: {
        flexDirection: 'row'
    },
    flexDirectionColumn: {
        flexDirection: 'column'
    },
    transparentBG: {
        backgroundColor: 'transparent'
    },
    alignItemsCenter: {
        alignItems: 'center'
    },
    windowWidth: {
        width
    },
    marginHorizontalWidth: {
        width: width - 44
    },
    relativePosition: {
        position: 'relative'
    },
    textAlignLeft: {
        textAlign: 'left'
    },
    marginTop_5: {
        marginTop: 5
    },
    marginTop_15: {
        marginTop: 15
    },
    marginTop_20: {
        marginTop: 20
    },
    marginLeft_5: {
        marginLeft: 5
    },
    marginRight_5: {
        marginRight: 5
    },
    marginRight_10: {
        marginRight: 10
    },
    marginRight_15: {
        marginRight: 15
    },
    marginRight_22: {
        marginRight: 22
    },
    marginTop_50: {
        marginTop: 50
    },
    marginHorizontal_0: {
        marginHorizontal: 0
    },
    marginHorizontal_3: {
        marginHorizontal: 3
    },
    marginHorizontal_20: {
        marginHorizontal: 20
    },
    paddingBottom_22: {
        paddingBottom: 22
    },
    paddingHorizontal_22: {
        paddingHorizontal: 22
    },
    size_20: {
        width: 20,
        height: 20
    },
    size_24: {
        width: 24,
        height: 24
    },
    size_60: {
        width: 60,
        height: 60
    },
    colorWhite: {
        color: baseStyle.color.white
    },
    bgWhite: {
        backgroundColor: baseStyle.color.white
    },
    bgGray: {
        backgroundColor: baseStyle.color.bgGray
    },
    marginBottom_15: {
        marginBottom: 15
    },
    marginBottom_22: {
        marginBottom: 22
    },
    marginBottom_10: {
        marginBottom: 10
    },
    marginBottom_20: {
        marginBottom: 20
    },
    marginBottom_30: {
        marginBottom: 30
    },
    colorBlack: {
        color: 'black'
    },
    marginTop_30: {
        marginTop: 30
    },
    paddingBottom_15: {
        paddingBottom: 15
    },

    greyBox: {
        flex: 1,
        backgroundColor: '#f3f4f7'
    },
    iconXXL: {
        width: 58,
        height: 58
    },
    iconLarge: {
        width: 36,
        height: 36
    },
    iconMedium: {
        width: 24,
        height: 24
    },
    iconSmall: {
        width: 18,
        height: 18
    },
    fontBolder: {
        fontWeight: '900',
        fontSize: 24
    },
    marginX0: {
        marginLeft: 0,
        marginRight: 0
    },
    marginLeft5: {
        marginLeft: 5
    },
    marginTop37: {
        marginTop: 37
    },
    marginTop51: {
        marginTop: 51
    },
    rowWithCenter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    leftMargin: {
        marginLeft: 15
    },
    paddingX: {
        paddingLeft: DeviceInfo.isTablet() ? 80 : 22,
        paddingRight: DeviceInfo.isTablet() ? 80 : 22
    },
    deliveryContain: {
        alignItems: 'center',
        width: width - 44,
        shadowOffset: {
            width: 1,
            height: 1
        },
        shadowColor: '#004C97',
        shadowOpacity: 0.1
    },
    palletStyle: {
        fontWeight: '700',
        color: '#000000'
    },
    gapLine: {
        width: 1,
        height: 13,
        marginLeft: 5,
        marginRight: 5,
        backgroundColor: '#D3D3D3'
    },
    justifyContentStart: {
        justifyContent: 'flex-start'
    },
    justifyContentEnd: {
        justifyContent: 'flex-end'
    },
    justifyContentSB: { justifyContent: 'space-between' },

    paddingTop_10: {
        paddingTop: 10
    },
    marginTop_8: {
        marginTop: 8
    },
    marginTop_6: {
        marginTop: 6
    },
    marginLeft20: {
        marginLeft: 20
    },
    hitSlop12: {
        top: 12,
        bottom: 12,
        left: 12,
        right: 12
    },
    marginLeft10: {
        marginLeft: 10
    },
    height_40: {
        height: 40
    },
    marginBottom_5: {
        marginBottom: 5
    },
    line: {
        height: 1,
        backgroundColor: baseStyle.color.borderGray
    },
    lineBlack: {
        height: 0.3,
        backgroundColor: baseStyle.color.black
    },
    vLine: {
        height: 10,
        width: 1,
        backgroundColor: baseStyle.color.borderGray,
        marginHorizontal: 5
    },
    absolutePosition: {
        position: 'absolute'
    },
    paddingHorizontal_20: {
        paddingHorizontal: 20
    },
    justifyContentCenter: {
        justifyContent: 'center'
    },
    colorLightBlue: {
        color: baseStyle.color.LightBlue
    },
    colorTitleGray: {
        color: baseStyle.color.titleGray
    },
    paddingTop_22: {
        paddingTop: 22
    },
    modalBg: {
        width: '100%',
        height: '100%',
        backgroundColor: baseStyle.color.modalBlack
    },
    font_12_700: {
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_12
    },
    font_24_900: {
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900
    },
    font_12_400: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400
    },
    font_14_700: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    marginVertical_20: {
        marginVertical: 20
    },
    marginVertical_10: {
        marginVertical: 10
    },
    marginVertical_8: {
        marginVertical: 8
    },
    lineBold: {
        height: 1,
        backgroundColor: baseStyle.color.black
    },
    font_16_700: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    chevron: {
        marginBottom: 5,
        width: 11,
        height: 11,
        borderColor: baseStyle.color.LightBlue,
        transform: [{ rotate: '-135deg' }]
    },
    chevronIcon: {
        marginBottom: 5,
        width: 11,
        height: 11,
        borderColor: baseStyle.color.LightBlue,
        transform: [{ rotate: '-135deg' }],
        borderTopWidth: 2,
        borderLeftWidth: 2
    },
    chevronGray: {
        marginBottom: 5,
        width: 11,
        height: 11,
        borderColor: baseStyle.color.borderGray,
        transform: [{ rotate: '-135deg' }]
    },
    marginBottom_40: {
        marginBottom: 40
    }
})

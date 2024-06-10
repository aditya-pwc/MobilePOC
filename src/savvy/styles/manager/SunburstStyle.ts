/**
 * @description Sunburst component style.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-07-21
 */

import { StyleSheet } from 'react-native'
import { baseStyle } from '../../../common/styles/BaseStyle'

export const SunburstStyle = StyleSheet.create({
    textBlack: {
        color: baseStyle.color.black
    },
    textFontWeight_900: {
        fontWeight: baseStyle.fontWeight.fw_900
    },
    textFontWeight_700: {
        fontWeight: baseStyle.fontWeight.fw_700
    },
    textFontSize_14: {
        fontSize: baseStyle.fontSize.fs_14
    },
    textFontSize_24: {
        fontSize: baseStyle.fontSize.fs_24
    },
    employeeCard: {
        borderRadius: 15,
        height: 90,
        alignItems: 'stretch',
        justifyContent: 'center',
        shadowOffset: {
            width: 1,
            height: 1
        },
        shadowColor: '#004C97',
        shadowOpacity: 0.3
    },
    employeeCardContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 110
    },
    employeeItemContainer: {
        flex: 1,
        position: 'absolute',
        left: 15,
        zIndex: 99,
        top: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scrollView: {
        height: 110
    },
    // picInnerView: {
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     borderRadius: INNER_RADIUS,
    //     width: INNER_RADIUS * 2,
    //     height: INNER_RADIUS * 2,
    //     position: 'absolute',
    //     top: SCREEN_WIDTH / 2 - INNER_RADIUS,
    //     left: SCREEN_WIDTH / 2 - INNER_RADIUS,
    //     shadowOffset: {
    //         width: 1,
    //         height: 1
    //     },
    //     shadowColor: '#004C97',
    //     shadowOpacity: 0.3,
    //     backgroundColor: 'white'
    // },
    arrow: {
        marginLeft: 0,
        marginTop: 0,
        // width: 0,
        // height: 0,
        borderStyle: 'solid',
        borderTopWidth: 16,
        borderBottomWidth: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopColor: 'white',
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: 'transparent',
        position: 'absolute',
        bottom: -20,
        width: 10,
        height: 10
    }
})

export default SunburstStyle

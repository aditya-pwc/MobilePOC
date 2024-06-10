/**
 * @description Add Customer style.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-05-27
 */

import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { StyleSheet } from 'react-native'

const AddCustomerStyle = StyleSheet.create({
    cImgPortrait: {
        width: 58,
        height: 58
    },
    cName: {
        fontSize: baseStyle.fontSize.fs_18,
        fontWeight: baseStyle.fontWeight.fw_900,
        color: baseStyle.color.black,
        marginBottom: 6,
        marginRight: 22
    },
    cTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    cAddress: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray,
        marginRight: 22
    },
    storeInfo: {
        ...commonStyle.flexRowSpaceBet
    },
    storeInfoBlock: {
        width: 164,
        marginBottom: 30
    },
    storeLabel: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    storeText: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black,
        maxWidth: 164,
        marginTop: 4,
        marginRight: 10
    },
    userInfoBox: {
        marginTop: 10,
        ...commonStyle.fullWidth,
        height: 150,
        flexDirection: 'row'
    },
    cPortraitView: {
        flexDirection: 'row',
        marginVertical: 25,
        marginLeft: 22
    },
    userRoute: {
        backgroundColor: baseStyle.color.bgGray,
        ...commonStyle.flexRowSpaceCenter,
        height: 40,
        paddingHorizontal: 14
    },
    userRouteLabel: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black
    },
    userRouteText: {
        fontWeight: baseStyle.fontWeight.fw_700
    },
    grayDay: {
        color: baseStyle.color.borderGray
    },
    flexRowAlignCenter: {
        ...commonStyle.flexRowAlignCenter
    }
})

export default AddCustomerStyle

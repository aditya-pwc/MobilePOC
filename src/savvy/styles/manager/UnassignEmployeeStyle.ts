/**
 * @description ErrorMsgModal component.
 * @author Hao Chen
 * @email hao.c.chen@pwc.com
 * @date 2022-1-5
 */

import { StyleSheet } from 'react-native'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'

const UnassignEmployeeStyle = StyleSheet.create({
    container: {
        backgroundColor: baseStyle.color.white,
        flex: 1
    },
    mainContainer: {
        flex: 1
    },
    headerContainer: {
        paddingHorizontal: 22
    },
    nvgHeaderTitleContainer: {
        marginBottom: 22,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray,
        ...commonStyle.flexRowCenter
    },
    nvgHeaderTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black,
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
    headerTitleContainer: {
        marginBottom: 15,
        ...commonStyle.alignCenter
    },
    headerTitle: {
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900,
        color: baseStyle.color.black
    },
    headerInfoContainer: {
        paddingHorizontal: 10,
        ...commonStyle.flexRowCenter
    },
    headerInfoItem: {
        flex: 1,
        marginTop: 30,
        marginBottom: 30,
        alignContent: 'center'
    },
    headerInfoItemTitle: {
        fontSize: 12,
        color: baseStyle.color.titleGray
    },
    headerInfoItemNum: {
        marginTop: 4,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_16
    },
    textCenter: {
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    textEnd: {
        textAlign: 'right',
        textAlignVertical: 'center'
    },
    paddingBottom_52: {
        paddingBottom: 52
    },
    emptyListContainer: {
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
    }
})

export default UnassignEmployeeStyle

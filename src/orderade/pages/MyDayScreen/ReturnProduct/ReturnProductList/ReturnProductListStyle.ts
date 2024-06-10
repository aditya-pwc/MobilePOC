import { StyleSheet } from 'react-native'

import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

export const ReturnProductListStyle = StyleSheet.create({
    ...commonStyle,
    headerCustomerContainer: {
        flexDirection: 'column',
        flex: 1
    },
    headerCustomerName: {
        fontSize: baseStyle.fontSize.fs_18,
        fontWeight: baseStyle.fontWeight.fw_900,
        marginBottom: 6
    },
    headerCustomerNumber: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        marginBottom: 6
    },
    headerCustomerAddress: {
        color: baseStyle.color.titleGray,
        maxWidth: 200
    },
    searchContainer: {
        flexDirection: 'column',
        marginTop: 20,
        marginBottom: 58
    },
    searchIconSize: {
        height: 22,
        width: 24
    },
    micIconContainer: {
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: baseStyle.color.LightBlue
    },
    searchIconContainer: {
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        backgroundColor: '#f0f3f6'
    },
    searchBarContainer: {
        height: 36
    },
    searchInputContainer: {
        height: 36,
        marginTop: 0,
        borderRadius: 10,
        padding: 0,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        flexShrink: 1
    },
    barCodeContainer: {
        height: 36,
        width: 36,
        borderRadius: 4,
        backgroundColor: baseStyle.color.LightBlue
    },
    chevron_up: {
        ...commonStyle.chevron,
        marginTop: 10,
        borderBottomWidth: 2,
        borderRightWidth: 2
    },
    chevron_left: {
        ...commonStyle.chevron,
        marginTop: 15,
        width: 15,
        height: 15,
        borderTopWidth: 3,
        borderRightWidth: 3
    },
    chevron_down: {
        ...commonStyle.chevron,
        borderTopWidth: 2,
        borderLeftWidth: 2
    },
    chevron_up_black: {
        ...commonStyle.chevron,
        borderColor: baseStyle.color.black,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        transform: [{ translateY: 4 }, { rotate: '-135deg' }]
    },
    chevron_down_black: {
        ...commonStyle.chevron,
        borderColor: baseStyle.color.black,
        borderTopWidth: 2,
        borderLeftWidth: 2
    },
    accordionContain: {
        width: '100%',
        borderBottomWidth: 1,
        backgroundColor: '#FFF',
        borderBottomColor: '#D3D3D3',
        marginBottom: 100
    },
    accordionSize: {
        paddingVertical: 20,
        height: '40%',
        backgroundColor: '#FFF'
    },
    expandContainer: {
        height: 60,
        paddingHorizontal: 22,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray
    },
    width_p90: {
        width: '90%'
    },
    swipeRowWrap: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15
    },
    swipeRowBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 98,
        right: 22,
        backgroundColor: baseStyle.color.red
    },
    greyBG: {
        backgroundColor: baseStyle.color.bgGray,
        borderBottomColor: baseStyle.color.borderGray,
        borderBottomWidth: 1
    },
    packageName: {
        maxWidth: 230
    },
    packageNameLabel: {
        marginBottom: 6
    },
    marginBottom_6: {
        marginBottom: 6
    },
    packageRowStyle: {
        height: 70,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray
    },
    packageRowStyleOpen: {
        height: 70
    },
    colorRed: {
        color: baseStyle.color.red
    }
})

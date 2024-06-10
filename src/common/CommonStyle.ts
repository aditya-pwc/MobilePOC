import { StyleSheet, Dimensions } from 'react-native'
import Utils from '../savvy/common/DateTimeUtils'

const { width } = Dimensions.get('window')

export const commonStyle = StyleSheet.create({
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
    colorBlack: {
        color: '#000'
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
        paddingLeft: Utils.isTablet ? 80 : 22,
        paddingRight: Utils.isTablet ? 80 : 22
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
    justifyContentSB: { justifyContent: 'space-between' }
})

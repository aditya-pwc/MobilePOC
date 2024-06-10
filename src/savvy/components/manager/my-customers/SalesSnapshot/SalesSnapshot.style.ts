import { StyleSheet, Dimensions } from 'react-native'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const screenWidth = Dimensions.get('window').width
const pd22 = 22
const pd30 = 30

const SalesSnapshotStyle = StyleSheet.create({
    lightFont12: {
        fontSize: baseStyle.fontSize.fs_12,
        color: '#565656'
    },
    boldFont12: {
        fontSize: baseStyle.fontSize.fs_12,
        color: '#000000',
        fontWeight: 'bold'
    },
    boldFont16: {
        fontSize: baseStyle.fontSize.fs_16,
        color: '#000000',
        fontWeight: baseStyle.fontWeight.fw_700
    },
    boldFont18: {
        fontSize: baseStyle.fontSize.fs_18,
        color: '#000000',
        fontWeight: baseStyle.fontWeight.fw_900
    },
    container: {
        width: screenWidth,
        backgroundColor: '#F2F4F7',
        flex: 1
    },
    toplineBlock: {
        paddingHorizontal: pd22,
        paddingVertical: pd30
    },
    flexSpaceBet: {
        display: 'flex',
        ...commonStyle.flexRowSpaceBet
    },
    toplineTitle: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_800
    },
    toplineContent: {
        backgroundColor: '#ffffff',
        borderRadius: 6,
        paddingVertical: 20,
        width: '100%',
        display: 'flex',
        marginTop: 30,
        ...commonStyle.flexRowSpaceBet
    },
    toplineSection: {
        width: '50%',
        paddingLeft: 20
    },
    toplineRightSection: {
        paddingLeft: 20
    },
    borderLeft: {
        borderLeftColor: '#D3D3D3',
        borderLeftWidth: 1
    },
    borderBottom: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    selectText: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black
    },
    imgTriangle: {
        width: 10,
        height: 5,
        marginLeft: 10
    },
    imgFolder: {
        width: 22,
        height: 22
    },
    flexRowAlignCenter: {
        ...commonStyle.flexRowAlignCenter
    },
    block: {
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderColor: '#D3D3D3',
        paddingTop: 40,
        backgroundColor: '#ffffff'
    },
    blockHead: {
        ...commonStyle.flexRowSpaceBet,
        paddingBottom: 30,
        paddingHorizontal: 22
    },
    paddingHorizontal22: {
        paddingHorizontal: 22
    },
    paddingVertical20: {
        paddingVertical: 20
    },
    headerTab: {
        marginTop: 10,
        height: 25,
        marginHorizontal: 22
    },
    tabButton: {
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 22,
        paddingBottom: 6,
        borderBottomColor: '#fff',
        borderBottomWidth: 2
    },
    tabTitle: {
        fontWeight: '700',
        color: '#00A2D9',
        fontSize: 12
    },
    isActive: {
        color: '#000',
        borderBottomColor: '#00A2D9'
    },
    flexRow: {
        display: 'flex',
        flexDirection: 'row'
    },
    col: {
        flexGrow: 0,
        flexShrink: 0,
        marginRight: 6
    },

    col1: {
        width: '26%'
    },
    col2: {
        width: '34%'
    },
    col3: {
        width: '30%'
    },
    col10: {
        width: '10%'
    },
    colBorderLeft: {
        borderLeftWidth: 1,
        borderLeftColor: '#d3d3d3'
    },
    colPaddingLeft: {
        paddingLeft: 19
    },
    childPaddingVertical: {
        paddingTop: 20,
        paddingBottom: 9
    },
    marginBottom: {
        marginBottom: 4
    },
    paddingBottom_40: {
        paddingBottom: 40
    },
    topVerticalLine: {
        height: 40,
        width: 1,
        backgroundColor: '#D3D3D3'
    },
    mixFilter: {
        ...commonStyle.flexRowJustifyEnd,
        paddingBottom: 10,
        marginRight: 23
    },
    mixHeader: {
        paddingTop: 40,
        backgroundColor: '#ffffff'
    },
    mixPDP: {
        backgroundColor: '#ffffff',
        paddingTop: 20,
        paddingBottom: 15,
        paddingHorizontal: 10
    },
    pdpItem: {
        paddingHorizontal: 25,
        marginRight: 15
    }
})

export default SalesSnapshotStyle

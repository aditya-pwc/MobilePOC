import { StyleSheet } from 'react-native'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

export const ReturnProductScreenStyle = StyleSheet.create({
    ...commonStyle,
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    deHeader: {
        flexDirection: 'row',
        paddingHorizontal: 22,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    topBgContainer: {
        height: 150,
        width: '100%',
        backgroundColor: baseStyle.color.bgGray,
        top: 0,
        right: 0,
        position: 'absolute',
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray
    },
    deTitle: {
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900,
        color: baseStyle.color.black
    },
    cardHeader: {
        paddingHorizontal: 22,
        marginVertical: 22,
        zIndex: 999
    },
    submitBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        height: 60
    },
    deliveryStyle: {
        marginTop: 50,
        paddingHorizontal: 22,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    notesView: {
        minHeight: 60,
        marginHorizontal: 22,
        marginVertical: 20
    },
    notesContainer: {
        flex: 1,
        borderBottomColor: baseStyle.color.borderGray,
        borderBottomWidth: 1,
        paddingBottom: 9
    },
    notesTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.titleGray,
        fontFamily: 'Gotham',
        fontWeight: baseStyle.fontWeight.fw_400,
        marginBottom: 11
    },
    poNumberTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.titleGray,
        fontFamily: 'Gotham',
        fontWeight: baseStyle.fontWeight.fw_400
    },
    poNumberInput: {
        fontSize: 14,
        flex: 1
    },
    poNumberInputLabel: {
        fontSize: 12,
        fontWeight: '400',
        color: baseStyle.color.titleGray
    },
    poNumberInputContainerStyle: { borderBottomWidth: 1, borderBottomColor: baseStyle.color.borderGray, height: 35 },
    poNumberInputContainer: { marginLeft: 44, flex: 1 },
    teststyle: { padding: 0, margin: 0 },
    chevronStyle: {
        width: 15.6,
        height: 15.6
    },
    collapseContainer: {
        width: '100%',
        height: 86,
        flexDirection: 'row',
        backgroundColor: baseStyle.color.bgGray,
        borderBottomColor: baseStyle.color.borderGray,
        borderTopColor: baseStyle.color.borderGray,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        paddingLeft: 22,
        paddingRight: 20
    },
    collapseContainerActive: {
        width: '100%',
        height: 86,
        flexDirection: 'row',
        backgroundColor: baseStyle.color.bgGray,
        borderTopColor: baseStyle.color.borderGray,
        borderTopWidth: 1,
        paddingLeft: 22,
        paddingRight: 20
    },
    returnsViewTitlePri: {
        fontWeight: '900',
        fontSize: 18,
        color: '#000000'
    },
    returnsViewTitleSub: {
        fontWeight: '400',
        fontSize: 12,
        marginTop: 6,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    returnsViewTitleSubText: {
        color: baseStyle.color.titleGray,
        marginRight: 4
    },
    returnsViewTitleSubTextValue: {
        color: baseStyle.color.red,
        fontWeight: baseStyle.fontWeight.fw_700
    },

    overviewSubtitleStyle: {
        fontWeight: '400',
        fontSize: 12,
        color: '#565656'
    },
    returnsViewTitle: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: baseStyle.color.bgGray
    },
    greyBG: {
        backgroundColor: baseStyle.color.bgGray
    },
    expandContainer: {
        height: 60,
        paddingHorizontal: 22,
        borderBottomColor: baseStyle.color.borderGray,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: baseStyle.color.white
    },
    expandContainerTitle: {
        fontSize: 18,
        fontWeight: '900'
    },
    chevron_up: {
        ...commonStyle.chevron,
        marginTop: 10,
        borderBottomWidth: 2,
        borderRightWidth: 2
    },
    chevronUpGray: {
        ...commonStyle.chevronGray,
        marginTop: 10,
        borderBottomWidth: 2,
        borderRightWidth: 2
    },

    chevron_down: {
        ...commonStyle.chevron,
        borderTopWidth: 2,
        borderLeftWidth: 2
    },
    chevronDownGray: {
        ...commonStyle.chevronGray,
        borderTopWidth: 2,
        borderLeftWidth: 2
    },
    emptyImageSize: {
        height: 121,
        width: 161,
        marginBottom: 38
    },
    emptyCartTitle: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontFamily: 'Gotham',
        color: baseStyle.color.black,
        textAlign: 'center',
        marginBottom: 10
    },
    emptyCartMessage: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        fontFamily: 'Gotham',
        color: baseStyle.color.titleGray,
        textAlign: 'center',
        marginBottom: 20
    },
    emptyListStyle: {},
    collapseAll: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.LightBlue,
        fontWeight: baseStyle.fontWeight.fw_700,
        marginRight: 5
    },
    collapseAllGray: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.borderGray,
        fontWeight: baseStyle.fontWeight.fw_700,
        marginRight: 5
    },
    collapseFlatList: {},
    scrollContent: {
        backgroundColor: baseStyle.color.white,
        zIndex: 0,
        top: -60
    },
    bottomContainer: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        flexDirection: 'row',
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10,
        zIndex: 9
    },
    searchBarWithScan: {
        ...commonStyle.paddingX,
        ...commonStyle.marginBottom_20
    }
})

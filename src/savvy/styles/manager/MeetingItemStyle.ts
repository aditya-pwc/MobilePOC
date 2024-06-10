import { StyleSheet, Dimensions } from 'react-native'
import { baseStyle } from '../../../common/styles/BaseStyle'
const { width } = Dimensions.get('window')
const MeetingItemStyle = StyleSheet.create({
    con: {
        flexDirection: 'row',
        height: 44,
        alignItems: 'center',
        paddingHorizontal: 22,
        backgroundColor: '#fff',
        shadowOpacity: 0.2,
        shadowColor: '#004C97',
        shadowOffset: { width: 0, height: 1 }
    },
    icon: {
        width: 30,
        height: 30,
        marginRight: 15
    },
    meetingCountCon: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    meetingCountTxt: {
        fontWeight: 'bold',
        color: baseStyle.color.black,
        marginRight: 5,
        fontSize: 12
    },
    meetingText: { fontSize: 12, color: baseStyle.color.titleGray },
    line: {
        backgroundColor: baseStyle.color.borderGray,
        width: 1,
        height: 10,
        marginHorizontal: 10
    },
    meetingItemCon: {
        paddingVertical: 15,
        paddingHorizontal: baseStyle.margin.mg_22,
        backgroundColor: baseStyle.color.white
    },
    meetingItemMerchandiser: {
        marginBottom: 20
    },
    meetingIcon: {
        width: 40,
        height: 40
    },
    videoIcon: {
        width: 18,
        height: 12,
        marginBottom: 15
    },
    rowCon: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    messageIconView: {
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    meetingMsgCon: {
        marginLeft: 15,
        width: width - 150
    },
    flexcon: { flex: 1 },
    bottomSpace: { marginTop: 17 },
    addressIcon: {
        width: 10,
        height: 12,
        marginRight: 6
    },
    addressWidth: {
        width: width - 210
    },
    attendes: {
        width: 18,
        height: 12,
        marginLeft: 10
    },
    name: {
        marginTop: 3,
        fontSize: 14
    },
    horizontalLine: {
        backgroundColor: baseStyle.color.borderGray,
        height: 1
    },
    headerLine: {
        marginHorizontal: baseStyle.margin.mg_22,
        backgroundColor: baseStyle.color.bgGray
    },
    itemLine: { backgroundColor: baseStyle.color.borderGray },
    folderIcon: { height: 23, width: 16 },
    sumTextBold: {
        fontSize: 18,
        fontWeight: '900',
        marginTop: 4
    },
    sumCon: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 36
    },
    meetingCompleteTimeBar: {
        paddingLeft: 20,
        paddingTop: 20,
        paddingBottom: 20
    },
    checkmark: {
        width: 20,
        height: 20,
        marginTop: -12,
        marginLeft: 28
    }
})
export default MeetingItemStyle

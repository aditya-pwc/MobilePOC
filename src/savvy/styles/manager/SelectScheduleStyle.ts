import { Dimensions, StyleSheet } from 'react-native'
import { commonStyle } from '../../../common/styles/CommonStyle'

const screenWidth = Dimensions.get('window').width
const mainViewMarginTop = 60

const SelectScheduleStyle = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        flex: 1
    },
    mainContainer: {
        marginTop: mainViewMarginTop,
        flex: 1
    },
    headerContainer: {
        paddingLeft: 22,
        paddingRight: 22
    },
    imgAddButton: {
        right: 0,
        bottom: 10
    },
    imgAdd: {
        width: 36,
        height: 36
    },
    headerTitleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#000'
    },
    headerTitleDate: {
        fontSize: 12,
        fontWeight: '400',
        color: '#000',
        marginTop: 10
    },
    mainContentContainer: {
        paddingTop: 15,
        paddingBottom: 15,
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerUserContainer: {
        alignItems: 'center',
        flexDirection: 'row'
    },
    headerUserImage: {
        width: 50,
        height: 50,
        borderRadius: 8
    },
    headerUserInfoContainer: {
        marginLeft: 15,
        flex: 1,
        flexGrow: 1
    },
    headerUserInfoTopContainer: {
        ...commonStyle.flexRowSpaceCenter
    },
    headerUserInfoTopNameContainer: {
        flexShrink: 1
    },
    headerUserInfoTopName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000'
    },
    headerUserWeekInfoContainer: {
        flexDirection: 'row'
    },
    headerStoreImage: {
        width: 55,
        height: 55,
        marginRight: 15
    },
    weekContainer: {
        marginTop: 10
    },
    checkBoxContainer: {
        marginTop: 28,
        ...commonStyle.flexRowSpaceCenter,
        height: 30
    },
    checkBoxTitle: {
        fontSize: 12,
        fontWeight: '400',
        color: '#000'
    },
    editActiveTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#00A2D9'
    },
    editDisableTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#D3D3D3'
    },
    checkBoxItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginRight: -10
    },
    checkBoxItemText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000'
    },
    checkBoxItem: {
        backgroundColor: '#FFF',
        borderWidth: 0,
        padding: 0
    },
    sortListContainer: {
        marginTop: 22,
        flex: 1
    },
    selectedBox: {
        height: 120,
        marginTop: 15,
        marginBottom: 8,
        borderRadius: 8,
        shadowColor: '#004C97',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D3D3D3'
    },
    boxTitle: {
        height: 75,
        backgroundColor: '#6C0CC3',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
    },
    selectedVisit: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF'
    },
    selectedInfo: {
        fontSize: 12,
        fontWeight: '400',
        color: '#FFF',
        marginTop: 6
    },
    btnGroup: {
        height: 45,
        paddingLeft: 20,
        paddingRight: 20,
        ...commonStyle.flexRowSpaceCenter
    },
    btnIcon: {
        width: 17,
        height: 17,
        marginRight: 8
    },
    inactiveBtnIcon: {
        width: 17,
        height: 17,
        marginRight: 8,
        tintColor: '#D3D3D3'
    },
    btnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000'
    },
    inactiveBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#D3D3D3'
    },
    flexRowCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    flexShrinkCol: {
        flexShrink: 1,
        flexDirection: 'column'
    },
    storeName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000'
    },
    itemSubTile: {
        fontSize: 12,
        color: '#565656',
        flexWrap: 'wrap',
        marginTop: 5,
        alignSelf: 'flex-start'
    },
    totalVisit: {
        fontSize: 12,
        fontWeight: '400',
        color: '#000'
    },
    status: { flexDirection: 'row', alignItems: 'center', marginTop: 7 },
    totalVisits: { fontSize: 12, fontWeight: '400', color: '#565656' },
    statusIcon: { marginRight: 8, marginLeft: 15, width: 8, height: 8, backgroundColor: '#FFF', borderRadius: 4 },
    statusText: { fontSize: 12, fontWeight: '400', color: '#565656' },
    totalHours: {
        color: '#565656',
        fontSize: 12
    },
    totalHoursActive: {
        fontWeight: 'bold',
        color: '#EB445A'
    },
    totalCases: {
        color: '#565656',
        fontSize: 12
    },
    line: {
        color: '#ccc'
    },
    sortList: {
        flex: 1,
        width: screenWidth,
        marginBottom: 30
    },
    hitSlop: {
        top: 30,
        bottom: 30,
        left: 50,
        right: 50
    },
    marginTop_6: {
        marginTop: 6
    },
    marginLeft_10: {
        marginLeft: 10
    },
    regularText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '400'
    },
    fontWeight_700: {
        fontWeight: '700'
    },
    // customer wrapper with border
    headerUserWrapper: {
        width: '100%',
        paddingTop: 25,
        borderWidth: 1,
        borderColor: '#D3D3D3',
        borderRadius: 5
    },
    emHeaderUserContainer: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        paddingHorizontal: 20
    },
    // sales rep box
    salesRepContainer: {
        width: '100%',
        height: 40,
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 5,
        backgroundColor: '#F2F4F7',
        marginTop: 20,
        paddingVertical: 7,
        paddingHorizontal: 14
    },
    salesRepImage: {
        width: 26,
        height: 26,
        borderRadius: 4
    },
    salesRepInfo: {
        flex: 1,
        ...commonStyle.flexRowSpaceCenter
    }
})

export default SelectScheduleStyle

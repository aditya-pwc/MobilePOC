import { StyleSheet } from 'react-native'

const MyCustomersStyle = StyleSheet.create({
    container: {
        backgroundColor: '#F2F4F7',
        flex: 1
    },
    container_SDL: {
        backgroundColor: '#FFF',
        flex: 1
    },
    mainContainer: {
        paddingTop: 60,
        backgroundColor: '#FFF'
    },
    sdlContainer: {
        paddingTop: 0,
        paddingBottom: 10,
        backgroundColor: '#FFF'
    },
    mapViewTopPlaceholder: { height: 40, backgroundColor: '#fff', width: 100 },
    salesMethodView: { marginTop: -22, zIndex: 999 },
    headerContainer: {
        paddingLeft: 22,
        paddingRight: 22,
        height: 36,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    navigationHeaderTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#000000'
    },
    imgAdd: {
        width: 36,
        height: 36
    },
    imgPhoneAndMsg: {
        width: 18,
        height: 18
    },
    imgLocation: {
        width: 18,
        height: 21
    },
    imgUserImage: {
        width: 60,
        height: 60,
        borderRadius: 30
    },
    topTabsContainer: {
        height: 44,
        marginTop: 30,
        marginHorizontal: 22,
        padding: 6,
        borderWidth: 1,
        borderRadius: 4,
        shadowOpacity: 0.4,
        backgroundColor: 'white',
        borderColor: '#D3D3D3',
        shadowColor: '#004C97',
        shadowOffset: { width: 0, height: 2 },
        flexDirection: 'row'
    },
    topTabsItemActiveContainer: {
        flex: 1,
        backgroundColor: '#00A2D9',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    topTabsItemNormalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    topTabsItemActiveText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '700'
    },
    topTabsItemNormalText: {
        color: '#00A2D9',
        fontSize: 12,
        fontWeight: '700'
    },
    metrics: {
        marginTop: 30,
        marginBottom: 40,
        paddingLeft: 22,
        paddingRight: 22
    },
    metrics_employee: {
        marginTop: 22,
        paddingLeft: 22,
        paddingRight: 22
    },
    fontWeight_700: {
        fontWeight: '700'
    },
    fontWeight_400: {
        fontWeight: '400'
    },
    fontSize_12: {
        fontSize: 12
    },
    fontSize_16: {
        fontSize: 16
    },
    fontColor_black: {
        color: '#000000'
    },
    fontColor_gary: {
        color: '#565656'
    },
    fontColor_lightGary: {
        color: '#D3D3D3'
    },
    marginTop_6: {
        marginTop: 6
    },
    marginTop_16: {
        marginTop: 16
    },
    marginRight_8: {
        marginRight: 8
    },
    marginRight_20: {
        marginRight: 20
    },
    customerList: {
        flex: 1,
        marginTop: 16
    },
    teamItem: {
        backgroundColor: 'white',
        marginTop: 12,
        marginBottom: 10,
        marginHorizontal: 22,
        borderRadius: 6,
        alignItems: 'center',
        shadowOpacity: 0.4,
        shadowColor: '#004C97',
        shadowOffset: { width: 0, height: 2 }
    },
    teamItem_without_border: {
        flex: 1,
        height: 110,
        backgroundColor: 'white',
        flexDirection: 'row',
        paddingHorizontal: 20,
        borderRadius: 6,
        alignItems: 'center'
    },
    itemBottomContainer: {
        height: 40,
        backgroundColor: '#F2F4F7',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'stretch',
        paddingHorizontal: 20,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6
    },
    itemContentContainer: {
        flex: 1,
        marginLeft: 15,
        marginRight: 20
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    itemLine: {
        width: 1,
        height: 14,
        backgroundColor: '#D3D3D3',
        marginLeft: 7,
        marginRight: 5
    },
    hitSlop: {
        top: 40,
        bottom: 40,
        left: 40,
        right: 40
    },
    errBar: {
        marginHorizontal: 22,
        marginTop: 24,
        marginBottom: 0
    },
    errCountText: {
        fontWeight: 'bold'
    },
    customerNum: {
        marginTop: 30
    },
    emptyView: {
        backgroundColor: '#fff',
        height: 800,
        alignItems: 'center'
    },
    emptyImage: {
        marginTop: 180
    },
    emptyTitle: {
        marginTop: 40,
        marginBottom: 20,
        fontSize: 16,
        color: '#000',
        fontWeight: '700'
    },
    emptyDescription: {
        textAlign: 'center',
        width: 256,
        fontSize: 14,
        lineHeight: 20,
        color: '#565656',
        fontWeight: '400'
    }
})

export default MyCustomersStyle

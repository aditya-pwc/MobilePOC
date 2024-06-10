import { StyleSheet } from 'react-native'

const MyTeamStyle = StyleSheet.create({
    container: {
        backgroundColor: '#F2F4F7',
        flex: 1
    },
    mainContainer: {
        paddingTop: 60,
        backgroundColor: '#FFF'
    },
    containerStyle: {
        flex: 1,
        width: '100%'
    },
    headerContainer: {
        paddingLeft: 22,
        paddingRight: 22,
        height: 36,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30
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
        width: 23,
        height: 25
    },
    imgUserImage: {
        width: 60,
        height: 60,
        borderRadius: 8
    },
    topTabsContainer: {
        zIndex: 100,
        height: 44,
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
        marginTop: 22,
        marginBottom: 20,
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
    marginTop_10: {
        marginTop: 10
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
    teamItem: {
        flex: 1,
        backgroundColor: 'white',
        marginTop: 20,
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
    imageCall: {
        marginLeft: 10
    },
    rowWithCenter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    paddingBottom_15: {
        paddingBottom: 15
    },
    userAvatar: {
        position: 'relative'
    },
    userRedExclamation: {
        position: 'absolute',
        right: -10,
        bottom: -5
    },
    errorMessage: {
        marginTop: 20,
        paddingHorizontal: 22
    },
    marginTop_0: {
        marginTop: 0
    },
    noMargin: {
        marginTop: 0,
        marginHorizontal: 0
    }
})

export default MyTeamStyle

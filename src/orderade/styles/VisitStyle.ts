import { Dimensions, StyleSheet } from 'react-native'
import { commonStyle } from '../../common/styles/CommonStyle'

export const visitStyle = StyleSheet.create({
    ...commonStyle,
    container: {
        paddingRight: 22,
        paddingLeft: 22,
        height: 178
    },
    subTypeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        paddingTop: 10,
        paddingBottom: 10
    },
    circle: {
        width: 10,
        height: 10,
        borderRadius: 15,
        backgroundColor: '#FFF',
        position: 'absolute',
        left: 13,
        top: 11
    },
    workOrderContainer: {
        padding: 22,
        borderWidth: 1,
        borderColor: '#D3D3D3',
        backgroundColor: '#FFF'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 56
    },
    headerCard: {
        marginTop: -60
    },
    tab: {
        paddingBottom: 10,
        backgroundColor: '#000',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5
    },
    tabContent: {
        top: 50
    },
    tabButton: {
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 22,
        marginRight: 5,
        borderBottomColor: '#000',
        borderBottomWidth: 3
    },
    tabTitle: {
        fontWeight: '600',
        color: '#00A2D9'
    },
    isActive: {
        color: '#FFF',
        borderBottomColor: '#00A2D9'
    },
    containerStyle: {
        height: 59,
        width: '100%',
        borderColor: '#FFF'
    },
    insideLocation: {
        backgroundColor: '#6217B9'
    },
    shadow: {
        backgroundColor: '#FFF',
        color: '#6217B9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.4,
        elevation: 4
    },
    outOfLocation: {
        backgroundColor: '#FFF',
        color: '#6217B9'
    },
    buttonStyle: {
        height: 59,
        width: '100%',
        paddingBottom: 25,
        fontSize: 12
    },
    disabled: {
        fontWeight: '700',
        color: '#rgb(211, 211, 211)',
        textTransform: 'uppercase',
        fontSize: 12,
        width: '100%',
        backgroundColor: '#FFF'
    },
    titleStyle: {
        fontWeight: '700',
        color: '#FFF',
        textTransform: 'uppercase',
        textAlign: 'center',
        fontSize: 12,
        width: '100%'
    },
    content: {
        marginRight: 22,
        marginLeft: 22
    },
    fullWidth: {
        marginRight: -22,
        marginLeft: -22
    },
    marginTop: {
        marginTop: 25
    },
    column: {
        flex: 1
    },
    title: {
        color: '#565656',
        fontSize: 13,
        marginBottom: 5
    },
    duration: {
        fontWeight: '700',
        fontSize: 16
    },
    clock: {
        flex: 0.8,
        padding: 10,
        paddingTop: 5,
        paddingBottom: 5,
        backgroundColor: '#FFF',
        borderRadius: 10,
        flexDirection: 'row'
    },
    lightGrey: {
        color: '#D3D3D3',
        fontWeight: '500'
    },
    clockContent: {
        marginLeft: 10
    },
    clockImg: {
        height: 22,
        width: 22,
        margin: 10
    },
    boxWithShadow: {
        marginTop: 30,
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        marginBottom: 40
    },
    cardBox: {
        marginRight: 22,
        marginLeft: 22,
        shadowColor: '#004C97',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.1,
        elevation: 5,
        shadowRadius: 10,
        borderRadius: 6,
        marginBottom: 17
    },
    boxContent: {
        flex: 1,
        flexDirection: 'row',
        minHeight: 140,
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        borderColor: '#F2F4F7',
        alignItems: 'center',
        shadowColor: '#004C97',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5
    },
    boxContentOnlyText: {
        flex: 1,
        flexDirection: 'row',
        minHeight: 140,
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        borderColor: '#F2F4F7',
        alignItems: 'center',
        shadowColor: '#004C97',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 6
    },
    shelf: {
        width: 50,
        height: 60,
        marginRight: 15,
        borderRadius: 10
    },
    shelfTitle: {
        fontSize: 19
    },
    boxContentTextArea: {
        flex: 1,
        flexDirection: 'column'
    },
    contentText: {
        flexShrink: 1,
        flexDirection: 'column'
    },
    right: {
        alignContent: 'flex-end',
        textAlign: 'right',
        alignItems: 'flex-end'
    },
    badge: {
        backgroundColor: '#2DD36F',
        height: 8,
        width: 8,
        borderRadius: 5,
        marginLeft: 5
    },
    divider: {
        paddingBottom: 10,
        borderColor: '#D3D3D3'
    },
    icon: {
        width: 18,
        height: 18
    },
    phoneMarginLeft: {
        marginHorizontal: 20
    },
    chat: {
        height: 18,
        width: 20
    },
    iconGroup: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'flex-end'
    },
    pdf: {
        height: 80,
        paddingBottom: 30,
        paddingTop: 30,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    pdfTitle: {
        color: '#00A2D9',
        marginLeft: 15,
        fontWeight: '700'
    },
    inprogress: {
        borderColor: 'rgb(45, 211, 111)',
        borderWidth: 3
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        width: '100%',
        position: 'relative'
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 220,
        width: 200
    },
    modalText: {
        marginTop: 15,
        marginBottom: 15,
        color: '#000',
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '900',
        textAlign: 'center'
    },
    statusBarStyle: {
        width: Dimensions.get('window').width,
        height: 44,
        top: 0,
        backgroundColor: '#FFF',
        position: 'absolute'
    },
    actionButtonIcon: {
        fontSize: 20,
        height: 22,
        color: 'white'
    },
    absoluteFill: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    quantityView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 35
    },
    palletLabel: {
        fontSize: 16
    },
    longLine: {
        marginLeft: 15,
        marginRight: 15,
        height: 1,
        backgroundColor: '#D3D3D3'
    },
    map: {
        width: Dimensions.get('window').width,
        height: 150
    },
    redIndicator: {
        width: 12,
        height: 12,
        marginLeft: 5
    },
    deliveryCardTopBox: {
        ...commonStyle.rowWithCenter,
        flex: 1,
        paddingVertical: 10,
        borderColor: '#D3D3D3'
    },
    deliveryCardBottomBox: {
        ...commonStyle.rowWithCenter,
        marginLeft: 15,
        paddingVertical: 10,
        flex: 1
    }
})

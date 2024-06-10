/**
 * @description CoPilot component styles.
 * @author Dashun Fu
 * @email drake.fu@pwc.com
 * @date 2023-05-16
 */

import { StyleSheet } from 'react-native'

const CoPilotStyle = StyleSheet.create({
    userInfoView: {
        paddingHorizontal: '5%',
        marginTop: 58,
        marginBottom: 37,
        position: 'relative',
        zIndex: 5
    },
    psrUserInfoView: {
        marginBottom: 57
    },
    locationText: {
        color: '#fff',
        fontFamily: 'Gotham',
        fontSize: 14
    },
    nameView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    userName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF'
    },
    userType: {
        marginTop: 4,
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF'
    },
    imgAvatar: {
        width: 50,
        height: 50,
        borderRadius: 5
    },
    userNameText: {
        fontSize: 18
    },
    switchLocAndRoute: {
        display: 'flex',
        flexDirection: 'row',
        position: 'relative'
    },
    switchLocAndRouteBtn: {
        display: 'flex',
        flexDirection: 'row',
        position: 'absolute',
        top: -15,
        paddingVertical: 25
    },
    switchLocAndRouteBtnRight: {
        justifyContent: 'flex-end',
        position: 'absolute',
        right: 0,
        top: -8,
        paddingTop: 18,
        paddingBottom: 25
    },
    starIconStyle: {
        color: 'white',
        marginLeft: 5,
        transform: [{ translateY: 1 }]
    },
    taskTitleHeight: {
        height: 100
    },
    noTaskView: {
        justifyContent: 'center',
        paddingHorizontal: '5.5%',
        height: 100
    },
    noTaskGray: {
        color: 'gray'
    },
    lineGarden: {
        width: '100%',
        overflow: 'hidden'
    },
    padding5: {
        paddingHorizontal: '5%'
    },
    container: {
        backgroundColor: '#F0F2F6',
        width: '100%'
    },
    pickViewCont: {
        flexDirection: 'row',
        paddingHorizontal: '5%',
        justifyContent: 'space-between'
    },
    openTaskText: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 20
    },
    listSizeText: {
        fontSize: 16,
        marginTop: 20,
        marginLeft: 5
    },
    pickView: {
        marginTop: 10,
        alignItems: 'flex-end',
        width: 126
    },
    viewAllCont: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
    viewAllText: {
        color: '#2A82E4',
        fontSize: 13,
        fontWeight: '700'
    },
    circleCont: {
        borderWidth: 18,
        borderColor: 'rgba(0,0,0,0.1)',
        position: 'absolute'
    }
})

export default CoPilotStyle

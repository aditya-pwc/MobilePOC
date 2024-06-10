/**
 * @description Tab component styles.
 * @author Dashun Fu
 * @email drake.fu@pwc.com
 * @date 2023-05-16
 */

import { StyleSheet } from 'react-native'

const TabStyle = StyleSheet.create({
    iconStyle: {
        width: 30,
        height: 30
    },
    labelStyle: {
        height: 60,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -10,
        marginBottom: -50,
        fontSize: 10,
        fontWeight: '500',
        fontFamily: 'Gotham-Book'
    },
    iconRedStyle: {
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9,
        backgroundColor: '#EB445A',
        marginTop: -5,
        marginLeft: 16
    },
    textBadge: {
        fontSize: 10,
        fontWeight: '500',
        color: '#FFFFFF'
    },
    lottieView: {
        width: 100,
        height: 100
    },
    imgAchieve: {
        width: 40,
        height: 40
    },
    customerImg: {
        width: 35,
        height: 35
    }
})

export default TabStyle

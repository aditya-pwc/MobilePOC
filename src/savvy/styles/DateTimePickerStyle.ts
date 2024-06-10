/*
 * @Description:
 * @LastEditors: Yi Li
 */
import { StyleSheet } from 'react-native'

export const dateTimePickerStyle = StyleSheet.create({
    formItem: {
        paddingRight: 0,
        marginBottom: 22,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    title: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    inputStyle: {
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Gotham-Book'
    },
    placeHolderStyle: {
        fontSize: 14,
        color: '#D3D3D3',
        fontFamily: 'Gotham-Book'
    },
    lookUpStyle: {
        height: 40,
        lineHeight: 40
    },
    imgCalendar: {
        marginTop: 12,
        width: 20,
        height: 20,
        resizeMode: 'stretch'
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.001)'
    },
    modalView: {
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderRadius: 20
    },
    datePicker: {
        width: '100%',
        height: '100%'
    },
    absoluteRight: {
        position: 'absolute',
        right: 0
    },
    touchableStyle: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,.5)'
    },
    pickerContainer: {
        width: 350,
        height: 350
    },
    doneView: {
        marginBottom: 10
    },
    doneText: {
        fontSize: 16,
        fontWeight: '500'
    }
})

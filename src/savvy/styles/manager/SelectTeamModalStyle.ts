import { StyleSheet } from 'react-native'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'

const MyTeamStyle = StyleSheet.create({
    modalView: {
        backgroundColor: baseStyle.color.white,
        borderRadius: 8,
        shadowColor: baseStyle.color.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '96%'
    },
    modalContainer: {
        padding: 20,
        flexDirection: 'column'
    },
    modalTitle: {
        ...commonStyle.fullWidth,
        borderBottomColor: baseStyle.color.cGray,
        borderBottomWidth: 1,
        ...commonStyle.alignCenter
    },
    modalContent: {
        paddingTop: 20,
        ...commonStyle.fullWidth
    },
    filterCheckboxContainer: {
        display: 'flex',
        flexDirection: 'row',
        transform: [{ translateX: -10 }],
        justifyContent: 'space-between'
    },
    sortTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        paddingBottom: 20
    },
    fontSize_12: {
        fontSize: baseStyle.fontSize.fs_12
    },
    fontSize_11: {
        fontSize: baseStyle.fontSize.fs_11
    },
    fontWeight_400: {
        fontWeight: baseStyle.fontWeight.fw_400
    },
    fontWeight_700: {
        fontWeight: baseStyle.fontWeight.fw_700
    },
    modalBtn: {
        height: 60,
        borderTopColor: baseStyle.color.cGray,
        borderTopWidth: 1,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        ...commonStyle.flexRowCenter,
        textAlign: 'center'
    },
    buttonReset: {
        flexGrow: 1,
        height: 60,
        ...commonStyle.alignCenter,
        borderRightColor: baseStyle.color.cGray,
        borderRightWidth: 1,
        borderBottomLeftRadius: 8,
        width: '50%'
    },
    resetText: {
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.purple
    },
    buttonApply: {
        flexGrow: 1,
        height: 60,
        ...commonStyle.alignCenter,
        backgroundColor: baseStyle.color.purple,
        borderBottomRightRadius: 8,
        width: '50%'
    },
    applyText: {
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.white
    },
    centeredView: {
        flex: 1,
        ...commonStyle.alignCenter,
        backgroundColor: 'rgba(87, 87, 87, 0.2)'
    },
    checkBoxMulti: {
        backgroundColor: baseStyle.color.white,
        borderWidth: 0,
        padding: 0
    },
    checkBoxMultiForOrder: {
        backgroundColor: baseStyle.color.white,
        borderWidth: 0,
        padding: 0,
        marginBottom: 15
    },
    fontSize_14: {
        fontSize: 14
    },
    employeeFilterLine: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20
    },
    employeeFilterButtonWrap: {
        flexDirection: 'row',
        paddingTop: 5,
        paddingBottom: 15
    },
    employeeFilterButton: {
        color: '#666'
    },
    triangleDown: {
        width: 12,
        height: 6,
        marginLeft: 5,
        marginTop: 7
    },
    bolder: {
        fontWeight: baseStyle.fontWeight.fw_700
    }
})

export default MyTeamStyle

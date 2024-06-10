import React from 'react'
import { StyleSheet, View } from 'react-native'
import CText from '../../../common/components/CText'
import { baseStyle } from '../../../common/styles/BaseStyle'
export const BottomSelectModalHeaderStyles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%'
    },
    statusItem: { flexDirection: 'row', alignItems: 'center' },
    flexAlign: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalHead: {
        height: 4,
        width: 50,
        backgroundColor: '#d4d4d4',
        borderRadius: 5,
        marginBottom: 20
    },
    defPaddingHorizontal: {
        marginHorizontal: 22
    },
    flex1: {
        flex: 1
    },
    modalTitle: {
        fontFamily: 'Gotham',
        fontSize: 12,
        color: '#000000',
        fontWeight: '700'
    },
    headerRadius: {
        borderRadius: 10
    },
    bgWhiteColor: {
        backgroundColor: '#FFFFFF'
    },
    pickerBorder: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 0.9
    },
    nonLabelInput: {
        height: 75
    },
    childrenTitle: {
        fontSize: 18,
        color: '#000000',
        fontWeight: '900',
        fontFamily: 'Gotham'
    },
    childrenTitleView: {
        marginVertical: 30,
        alignItems: 'center'
    },
    childrenBodyView: {
        marginHorizontal: 22,
        marginBottom: 33
    },
    checkedIcon: {
        width: 22,
        height: 22
    },
    radioContainer: {
        paddingVertical: 19,
        backgroundColor: '#FFFFFF',
        borderWidth: 0,
        padding: 0,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    radioLabel: {
        fontFamily: 'Gotham',
        fontWeight: '400',
        fontSize: 14,
        color: 'black'
    },
    modalChildrenView: {
        display: 'flex',
        flex: 1
    },
    uncheckCircleView: {
        width: 22,
        height: 22,
        backgroundColor: '#FFF',
        borderColor: '#D3D3D3',
        borderRadius: 11,
        borderWidth: 1
    },
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'baseline',
        zIndex: 1,
        backgroundColor: baseStyle.color.modalBlack90
    },
    safeAreaView: {
        width: '100%',
        overflow: 'hidden',
        zIndex: 2,
        backgroundColor: '#FFFFFF'
    },
    returnModal: {
        backgroundColor: 'rgba(87, 87, 100, 0.8)'
    }
})
interface BottomSelectModalHeaderParams {
    title?: string
}
const BottomSelectModalHeader = (params: BottomSelectModalHeaderParams) => {
    const { title } = params
    return (
        <View style={[BottomSelectModalHeaderStyles.bgWhiteColor, BottomSelectModalHeaderStyles.headerRadius]}>
            <View style={BottomSelectModalHeaderStyles.defPaddingHorizontal}>
                <View
                    style={[
                        BottomSelectModalHeaderStyles.nonLabelInput,
                        BottomSelectModalHeaderStyles.pickerBorder,
                        BottomSelectModalHeaderStyles.flexAlign
                    ]}
                >
                    <View style={BottomSelectModalHeaderStyles.modalHead} />
                    <CText style={[BottomSelectModalHeaderStyles.modalTitle]}>{title}</CText>
                </View>
            </View>
        </View>
    )
}
export default BottomSelectModalHeader

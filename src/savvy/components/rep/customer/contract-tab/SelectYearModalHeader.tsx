import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import { ContractBtnType } from '../../../../enums/Contract'
import { t } from '../../../../../common/i18n/t'
import CText from '../../../../../common/components/CText'

export const styles = StyleSheet.create({
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
        height: 310
    },
    uncheckCircleView: {
        width: 22,
        height: 22,
        backgroundColor: '#FFF',
        borderColor: '#D3D3D3',
        borderRadius: 11,
        borderWidth: 1
    }
})
interface SelectYearModalHeaderParams {
    title?: string
}
const SelectYearModalHeader = (params: SelectYearModalHeaderParams) => {
    const { title } = params
    const buttonClicked = useSelector((state: any) => state.contractReducer.buttonClicked)

    const getTitle = () => {
        if (buttonClicked === ContractBtnType.CUSTOMER_DECLINED) {
            return t.labels.PBNA_MOBILE_CDA_DECLINE.toLocaleUpperCase()
        }
        if (buttonClicked === ContractBtnType.START_NEW_CDA) {
            return t.labels.PBNA_MOBILE_START_NEW_CONTRACT.toLocaleUpperCase()
        }
    }
    return (
        <View style={[styles.bgWhiteColor, styles.headerRadius]}>
            <View style={styles.defPaddingHorizontal}>
                <View style={[styles.nonLabelInput, styles.pickerBorder, styles.flexAlign]}>
                    <View style={styles.modalHead} />
                    <CText style={[styles.modalTitle]}>{!title ? getTitle() : title}</CText>
                </View>
            </View>
        </View>
    )
}

export default SelectYearModalHeader

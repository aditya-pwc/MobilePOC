import React, { useState } from 'react'
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import CText from '../../../../../common/components/CText'
import { t } from '../../../../../common/i18n/t'
import AddRecurringVisitStyle from '../../../../styles/manager/AddRecurringVisitStyle'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import QuantityInputBox from '../../lead/common/QuantityInputBox'
import _ from 'lodash'

const styles = AddRecurringVisitStyle
const modalStyles = StyleSheet.create({
    disabledApplyText: {
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.borderGray
    },
    disabledApplyButton: {
        flexGrow: 1,
        height: 60,
        ...commonStyle.alignCenter,
        backgroundColor: baseStyle.color.white,
        borderBottomRightRadius: 8
    },
    modalContainer: {
        margin: 20,
        backgroundColor: 'white',
        shadowColor: baseStyle.color.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderRadius: 8,
        width: '70%'
    },
    modalView: {
        ...commonStyle.alignCenter,
        marginHorizontal: 20,
        paddingVertical: 20,
        borderBottomColor: baseStyle.color.borderGray,
        justifyContent: 'center',
        marginBottom: 20
    },
    titleStyle: {
        fontWeight: baseStyle.fontWeight.fw_900,
        fontSize: 18,
        justifyContent: 'center',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 20
    }
})

interface CopyProductsModalProps {
    copyProductsModalVisible: any
    setCopyProductsModalVisible: any
    productsList: any
    setProductsList: any
    maxSelectProductNumObj: any
    copyProductIndex: number
}

const CopyProductsModal = (props: CopyProductsModalProps) => {
    const {
        copyProductsModalVisible,
        setCopyProductsModalVisible,
        productsList,
        setProductsList,
        maxSelectProductNumObj,
        copyProductIndex
    } = props
    const [totalNumber, setTotalNumber] = useState(1)
    const handleCopyProducts = () => {
        const totalNumberToInsert = totalNumber
        const indexToInsert = copyProductIndex
        const tempList = _.cloneDeep(productsList)
        const tempSelectNumList = tempList.map((item: any) => parseInt(item.slct_num__c))
        const maxSelectNum = Math.max(...tempSelectNumList) + 1

        _.times(totalNumberToInsert, (i) => {
            tempSelectNumList.push(maxSelectNum + i)
            tempList.splice(indexToInsert + i + 1, 0, { ...tempList[indexToInsert] })
        })

        tempList.forEach((item: any, key: number) => {
            item.slct_num__c = tempSelectNumList[key].toString()
        })
        setProductsList(tempList)
    }

    return (
        <Modal
            animationType="fade"
            transparent
            visible={copyProductsModalVisible}
            onRequestClose={() => {
                setTotalNumber(1)
                setCopyProductsModalVisible(false)
            }}
        >
            <View style={styles.centeredView}>
                <View style={modalStyles.modalContainer}>
                    <View style={modalStyles.modalView}>
                        <CText style={modalStyles.titleStyle}>
                            {`${t.labels.PBNA_MOBILE_COPY_PRODUCTS_MSG}${
                                maxSelectProductNumObj.showMaximum
                                    ? ` ${maxSelectProductNumObj?.maxNum} ${t.labels.PBNA_MOBILE_PRODUCTS_AT_MOST}`
                                    : ''
                            }`}
                        </CText>
                        <QuantityInputBox
                            value={totalNumber + ''}
                            noTitle
                            onChangeText={(text) => {
                                const newText = text === '0' ? 1 : parseInt(text || '1')
                                setTotalNumber(newText)
                            }}
                            onPressMinus={() => {
                                if (Number(totalNumber) > 1) {
                                    const newNumber = totalNumber - 1
                                    setTotalNumber(newNumber)
                                }
                            }}
                            disableMinus={totalNumber <= 1}
                            onPressPlus={() => {
                                if (Number(totalNumber) < 999) {
                                    const newNumber = totalNumber + 1
                                    setTotalNumber(newNumber)
                                }
                            }}
                            disablePlus={
                                totalNumber >= maxSelectProductNumObj?.maxNum && maxSelectProductNumObj?.showMaximum
                            }
                        />
                    </View>
                    <View style={styles.modalBtn}>
                        <TouchableOpacity
                            style={styles.buttonReset}
                            onPress={() => {
                                setTotalNumber(1)
                                setCopyProductsModalVisible(false)
                            }}
                        >
                            <View>
                                <CText style={styles.resetText}>{t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}</CText>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={
                                totalNumber > maxSelectProductNumObj?.maxNum && maxSelectProductNumObj.showMaximum
                                    ? modalStyles.disabledApplyButton
                                    : styles.buttonApply
                            }
                            onPress={() => {
                                handleCopyProducts()
                                setTotalNumber(1)
                                setCopyProductsModalVisible(false)
                            }}
                            disabled={
                                totalNumber > maxSelectProductNumObj?.maxNum && maxSelectProductNumObj.showMaximum
                            }
                        >
                            <View>
                                <CText
                                    style={
                                        totalNumber > maxSelectProductNumObj?.maxNum &&
                                        maxSelectProductNumObj.showMaximum
                                            ? modalStyles.disabledApplyText
                                            : styles.applyText
                                    }
                                >
                                    {t.labels.PBNA_MOBILE_CONFIRM.toUpperCase()}
                                </CText>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default CopyProductsModal

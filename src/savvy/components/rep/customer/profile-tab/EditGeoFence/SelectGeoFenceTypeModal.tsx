/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2023-12-08 15:36:07
 * @LastEditTime: 2024-03-01 12:07:22
 * @LastEditors: Mary Qian
 */

import React, { Ref, useImperativeHandle, useState } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { CheckBox } from 'react-native-elements'
import TitleModal from '../../../../../../common/components/TitleModal'
import CText from '../../../../../../common/components/CText'
import { t } from '../../../../../../common/i18n/t'
import { ImageSrc } from '../../../../../../common/enums/ImageSrc'
import FormBottomButton from '../../../../../../common/components/FormBottomButton'

const styles = StyleSheet.create({
    modalView: {
        width: '100%',
        alignItems: 'center'
    },
    selectTextWrapper: {
        marginTop: 30,
        marginBottom: 30
    },
    selectText: {
        fontSize: 18,
        lineHeight: 24,
        fontWeight: 'bold',
        color: '#000'
    },
    checkBoxView: {
        flex: 1,
        width: '100%',
        alignItems: 'flex-start',
        paddingLeft: 22,
        paddingRight: 27,
        marginBottom: 33
    },
    checkBoxContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        height: 60,
        backgroundColor: '#fff',
        borderWidth: 0
    },
    checkCircle: {
        width: 22,
        height: 22,
        marginRight: 10
    },
    checkBoxTextStyle: {
        marginLeft: 0,
        fontFamily: 'Gotham',
        fontSize: 14,
        fontWeight: '400'
    },
    underline: {
        backgroundColor: '#d3d3d3',
        width: '100%',
        height: 1,
        marginTop: 0,
        marginBottom: 0
    },
    buttonText: {
        fontFamily: 'Gotham',
        fontSize: 12,
        fontWeight: 'bold'
    },
    cancelText: {
        color: '#6C0CC3'
    }
})

interface SelectGeoFenceTypeModalProps {
    onConfirm: Function
    cRef: Ref<any>
    modalStyle?: any
}

export enum GEO_FENCE_TYPE {
    Sales = 'Sales',
    Delivery = 'Delivery'
}

const SelectGeoFenceTypeModal = (props: SelectGeoFenceTypeModalProps) => {
    const { cRef, onConfirm, modalStyle } = props
    const [modalVisible, setModalVisible] = useState(false)
    const [isSalesSelected, setIsSalesSelected] = useState(false)
    const [isDeliverySelected, setIsDeliverySelected] = useState(false)
    const [isProceedEnabled, setIsProceedEnabled] = useState(false)

    const onOpenModal = () => {
        if (!modalVisible) {
            setModalVisible(true)
            setIsSalesSelected(false)
            setIsDeliverySelected(false)
            setIsProceedEnabled(false)
        }
    }

    const closeModal = () => {
        setTimeout(() => {
            setModalVisible(false)
        })
    }

    const onProceed = () => {
        onConfirm(isSalesSelected ? GEO_FENCE_TYPE.Sales : GEO_FENCE_TYPE.Delivery)
        setModalVisible(false)
    }

    useImperativeHandle(cRef, () => ({
        openModal: () => {
            onOpenModal()
        }
    }))

    const CHECK_CIRCLE = <Image style={styles.checkCircle} source={ImageSrc.IMG_CHECK_CIRCLE} />
    const UNCHECK_CIRCLE = <Image style={styles.checkCircle} source={ImageSrc.IMG_UNCHECK_CIRCLE} />

    return (
        <TitleModal
            title={t.labels.PBNA_MOBILE_EDIT_GEO_FENCE}
            visible={modalVisible}
            onClose={closeModal}
            modalStyle={modalStyle}
        >
            <View style={styles.modalView}>
                <View style={styles.selectTextWrapper}>
                    <CText style={styles.selectText}>{t.labels.PBNA_MOBILE_SELECT_GEO_FENCE_TYPE}</CText>
                </View>

                <View style={styles.checkBoxView}>
                    <CheckBox
                        title={t.labels.PBNA_MOBILE_SALES_GEO_FENCE}
                        textStyle={styles.checkBoxTextStyle}
                        checkedIcon={CHECK_CIRCLE}
                        uncheckedIcon={UNCHECK_CIRCLE}
                        containerStyle={styles.checkBoxContainer}
                        checked={isSalesSelected}
                        onPress={() => {
                            setIsSalesSelected(true)
                            setIsDeliverySelected(false)
                            setIsProceedEnabled(true)
                        }}
                    />
                    <View style={[styles.underline, { marginBottom: 10 }]} />
                    <CheckBox
                        center
                        title={t.labels.PBNA_MOBILE_DEL_GEO_FENCE}
                        textStyle={styles.checkBoxTextStyle}
                        checkedIcon={CHECK_CIRCLE}
                        uncheckedIcon={UNCHECK_CIRCLE}
                        containerStyle={styles.checkBoxContainer}
                        checked={isDeliverySelected}
                        onPress={() => {
                            setIsSalesSelected(false)
                            setIsDeliverySelected(true)
                            setIsProceedEnabled(true)
                        }}
                    />
                    <View style={styles.underline} />
                </View>

                <FormBottomButton
                    onPressCancel={closeModal}
                    onPressSave={onProceed}
                    disableSave={!isProceedEnabled}
                    leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}
                    rightButtonLabel={t.labels.PBNA_MOBILE_PROCEED.toUpperCase()}
                    leftTitleStyle={[styles.buttonText, styles.cancelText]}
                    rightTitleStyle={styles.buttonText}
                    relative
                />
            </View>
        </TitleModal>
    )
}

export default SelectGeoFenceTypeModal

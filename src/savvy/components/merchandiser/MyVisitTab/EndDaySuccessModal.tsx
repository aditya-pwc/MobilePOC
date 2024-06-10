/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-05-29 22:00:57
 * @LastEditTime: 2023-07-31 15:30:25
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 */
import React from 'react'
import { Modal, TouchableOpacity, View, Image, Alert, StyleSheet } from 'react-native'
import { t } from '../../../../common/i18n/t'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import CText from '../../../../common/components/CText'
import { visitStyle } from '../VisitStyle'

const styles = StyleSheet.create({
    imgSize: {
        width: 56,
        height: 53
    }
})

const EndDaySuccessModal = (props: any) => {
    const { modalVisible, setModalVisible } = props

    return (
        <Modal
            animationType="fade"
            transparent
            visible={modalVisible}
            onRequestClose={() => {
                Alert.alert('Modal has been closed.')
                setModalVisible(!modalVisible)
            }}
        >
            <TouchableOpacity
                style={[commonStyle.fullWidth, commonStyle.fullHeight]}
                onPress={() => {
                    setModalVisible(!modalVisible)
                }}
            >
                <View style={visitStyle.centeredView}>
                    <View style={visitStyle.modalView}>
                        <Image
                            style={styles.imgSize}
                            source={require('../../../../../assets/image/icon-success.png')}
                        />
                        <CText style={visitStyle.modalText}>{t.labels.PBNA_MOBILE_END_DAY_MESSAGE}</CText>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

export default EndDaySuccessModal

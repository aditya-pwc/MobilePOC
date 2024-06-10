/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-05-29 22:00:57
 * @LastEditTime: 2022-05-29 22:15:04
 * @LastEditors: Mary Qian
 */
import React from 'react'
import { Modal, TouchableOpacity, View, Image, Alert, StyleSheet } from 'react-native'
import CText from '../../../common/components/CText'
import { visitStyle } from '../../styles/VisitStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'

const styles = StyleSheet.create({
    imgSize: {
        width: 56,
        height: 53
    }
})

const EndDaySuccessModal = (props: any) => {
    const { isShowEndedModal, setIsShowEndedModal } = props

    return (
        <Modal
            animationType="fade"
            transparent
            visible={isShowEndedModal}
            onRequestClose={() => {
                Alert.alert('Modal has been closed.')
                setIsShowEndedModal(!isShowEndedModal)
            }}
        >
            <TouchableOpacity
                style={[commonStyle.fullWidth, commonStyle.fullHeight]}
                onPress={() => {
                    setIsShowEndedModal(!isShowEndedModal)
                }}
            >
                <View style={visitStyle.centeredView}>
                    <View style={visitStyle.modalView}>
                        <Image style={styles.imgSize} source={require('../../../../assets/image/icon-success.png')} />
                        <CText style={visitStyle.modalText}>{t.labels.PBNA_MOBILE_END_DAY_MESSAGE}</CText>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

export default EndDaySuccessModal

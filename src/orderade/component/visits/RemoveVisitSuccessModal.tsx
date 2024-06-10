/*
 * @Author: Tom tong.jiang@pwc.com
 * @Date: 2023-06-09 16:48:13
 * @LastEditors: Tom tong.jiang@pwc.com
 * @LastEditTime: 2023-06-13 17:20:15
 */
import React, { useEffect } from 'react'
import { Modal, TouchableOpacity, View, Image, Alert, StyleSheet } from 'react-native'
import CText from '../../../common/components/CText'
import { visitStyle } from '../../styles/VisitStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'

const styles = StyleSheet.create({
    imgSize: {
        width: 56,
        height: 53
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 244,
        width: 300
    }
})

interface RemoveVisitSuccessModalProps {
    isShowRemoveVisitModal: boolean
    setIsShowRemoveVisitModal: Function
    storeName: React.RefObject<string>
}

const RemoveVisitSuccessModal = (props: RemoveVisitSuccessModalProps) => {
    const { isShowRemoveVisitModal, setIsShowRemoveVisitModal, storeName } = props
    useEffect(() => {
        if (isShowRemoveVisitModal) {
            setTimeout(() => {
                setIsShowRemoveVisitModal(false)
            }, 3000)
        }
    }, [isShowRemoveVisitModal])

    return (
        <Modal
            animationType="fade"
            transparent
            visible={isShowRemoveVisitModal}
            onRequestClose={() => {
                Alert.alert('Modal has been closed.')
                setIsShowRemoveVisitModal(!isShowRemoveVisitModal)
            }}
        >
            <TouchableOpacity
                style={[commonStyle.fullWidth, commonStyle.fullHeight]}
                onPress={() => {
                    setIsShowRemoveVisitModal(!isShowRemoveVisitModal)
                }}
            >
                <View style={visitStyle.centeredView}>
                    <View style={styles.modalView}>
                        <Image style={styles.imgSize} source={require('../../../../assets/image/icon-success.png')} />
                        <CText style={visitStyle.modalText}>
                            {storeName.current + ' ' + t.labels.PBNA_MOBILE_REMOVE_VISIT_MESSAGE}
                        </CText>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

export default RemoveVisitSuccessModal

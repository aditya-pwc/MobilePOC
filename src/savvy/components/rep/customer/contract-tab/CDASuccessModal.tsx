import React, { useEffect, useState } from 'react'
import { Modal, View, Image, StyleSheet, TouchableOpacity } from 'react-native'
import CText from '../../../../../common/components/CText'
import { visitStyle } from '../../../merchandiser/VisitStyle'

interface SuccessModalProps {
    modalVisible: boolean
    onPressModal?: () => void
    message: string
    wide?: boolean
}

interface SuccessModalWithTimerProps extends SuccessModalProps {
    refreshFlag: number
    timeout: number
    onTimeout: () => void
}

const styles = StyleSheet.create({
    ...visitStyle,
    modalGreyBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    modalText: {
        width: '100%',
        marginTop: 'auto',
        marginBottom: 'auto',
        color: '#000',
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '900',
        textAlign: 'center'
    },
    imgSize: {
        width: 56,
        height: 53
    }
})

export const CDASuccessModal: React.FC<SuccessModalProps> = ({ modalVisible, onPressModal, message, wide }) => {
    return (
        <Modal animationType="fade" visible={modalVisible} transparent>
            <TouchableOpacity disabled={!onPressModal} style={styles.modalGreyBackground} onPress={onPressModal}>
                <View style={styles.centeredView}>
                    <View style={[styles.modalView, wide && { width: 300 }]}>
                        <Image
                            style={styles.imgSize}
                            source={require('../../../../../../assets/image/icon-success.png')}
                        />
                        <CText style={styles.modalText}>{message}</CText>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

let timerId: any
export const CDASuccessModalWithTimer: React.FC<SuccessModalWithTimerProps> = ({
    refreshFlag,
    timeout,
    onTimeout,
    ...props
}) => {
    const [modalVisible, setModalVisible] = useState(false)

    const timeoutCB = () => {
        timerId && clearTimeout(timerId)
        setModalVisible(false)
        onTimeout()
    }

    useEffect(() => {
        if (refreshFlag) {
            timerId && clearTimeout(timerId)
            setModalVisible(true)
            timerId = setTimeout(timeoutCB, timeout)
        }
    }, [refreshFlag])
    return <CDASuccessModal {...props} modalVisible={modalVisible} onPressModal={timeoutCB} />
}

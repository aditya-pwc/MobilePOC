import React from 'react'
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native'
import Modal from 'react-native-modal'
import CText from '../../../../../../common/components/CText'

interface ATCModalProps extends React.PropsWithChildren {
    visible?: boolean
    messageText?: string
    showClose?: boolean
    onRequestClose?: () => void
}

const styles = StyleSheet.create({
    modalContent: {
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8
    },
    modalMessage: {
        marginVertical: 39,
        marginHorizontal: 39
    },
    modalMessageText: {
        fontSize: 18,
        fontWeight: '900',
        textAlign: 'center'
    },
    closeImageContainer: {
        position: 'absolute',
        alignSelf: 'flex-end',
        top: -46
    },
    closeImage: {
        width: 36,
        height: 36
    }
})

export const ATCModal: React.FC<ATCModalProps> = ({
    visible = false,
    messageText,
    showClose = false,
    onRequestClose = () => {},
    children
}) => {
    return (
        <Modal
            isVisible={visible}
            onBackdropPress={() => onRequestClose()}
            coverScreen
            backdropOpacity={0.2}
            animationIn="fadeIn"
            animationOut="fadeOut"
            animationOutTiming={50}
        >
            <View style={styles.modalContent}>
                {/* Message */}
                {messageText && (
                    <View style={styles.modalMessage}>
                        <CText style={styles.modalMessageText}>{messageText}</CText>
                    </View>
                )}
                {children}
                {showClose && (
                    <View style={styles.closeImageContainer}>
                        <TouchableOpacity onPress={onRequestClose}>
                            <Image
                                source={require('../../../../../../../assets/image/ios-close-circle-outline.png')}
                                style={styles.closeImage}
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Modal>
    )
}

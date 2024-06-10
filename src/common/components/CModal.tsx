import React, { FC } from 'react'
import { Modal, Image, StyleSheet, View, TouchableOpacity } from 'react-native'
import CText from './CText'
import { commonStyle } from '../styles/CommonStyle'

interface CModalProps {
    showModal: boolean
    content: string
    imgSrc: any
    disabled?: boolean
}

const styles = StyleSheet.create({
    ...commonStyle,
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        width: '100%',
        position: 'relative'
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
        width: 280,
        marginBottom: 20
    },
    modalText: {
        marginTop: 30,
        marginBottom: 15,
        color: '#000',
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '900',
        textAlign: 'center'
    },
    successImgSize: {
        width: 60,
        height: 56
    }
})
const CModal: FC<CModalProps> = (props) => {
    const { showModal, content, imgSrc, disabled } = props
    return (
        <Modal animationType="fade" transparent visible={showModal}>
            <TouchableOpacity style={styles.modalBg} onPress={() => {}} disabled={disabled}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Image style={styles.successImgSize} source={imgSrc} />
                        {<CText style={styles.modalText}>{content}</CText>}
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

export default CModal

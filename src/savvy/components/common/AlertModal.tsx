/**
 * @description A common modal that shows two buttons.
 * @author Shangmin Dou
 * @date 2021-05-31
 */
import React, { FC, useImperativeHandle, useState } from 'react'
import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../common/components/CText'

interface AlertModalProps {
    icon: any
    message: any
    onLeftButtonPress?: any
    onRightButtonPress?: any
    leftButtonLabel: string
    rightButtonLabel: string
    cRef: any
}

const styles = StyleSheet.create({
    modalContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalSubContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        borderRadius: 10
    },
    modalContentContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: 'white',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    msgText: {
        fontSize: 18,
        fontWeight: '900',
        marginTop: 30,
        paddingLeft: 50,
        paddingRight: 50,
        textAlign: 'center'
    },
    alertImage: {
        height: 50,
        width: 50
    },
    btnContainer: {
        flexDirection: 'row'
    },
    leftBtnBasic: {
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        height: 60,
        borderBottomLeftRadius: 8,
        elevation: 1,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2
    },
    rightBtnOverride: {
        backgroundColor: '#6105BD',
        borderBottomRightRadius: 8,
        shadowOffset: { width: -1, height: -1 }
    },
    leftBtnText: {
        color: '#6105BD',
        fontWeight: '700'
    },
    rightBtnText: {
        color: 'white',
        fontWeight: '700'
    }
})

const AlertModal: FC<AlertModalProps> = (props: AlertModalProps) => {
    const { icon, message, onLeftButtonPress, onRightButtonPress, leftButtonLabel, rightButtonLabel, cRef } = props
    const [showModal, setShowModal] = useState(false)
    useImperativeHandle(cRef, () => ({
        openModal: () => {
            setShowModal(true)
        },
        closeModal: () => {
            setShowModal(false)
        }
    }))
    return (
        <Modal animationType="fade" transparent visible={showModal}>
            <View style={styles.modalContainer}>
                <View style={styles.modalSubContainer}>
                    <View style={styles.modalContentContainer}>
                        <Image source={icon} style={styles.alertImage} />
                        <CText style={styles.msgText}>{message}</CText>
                    </View>
                    <View style={styles.btnContainer}>
                        <TouchableOpacity
                            style={styles.leftBtnBasic}
                            onPress={() => {
                                setShowModal(false)
                                if (onLeftButtonPress) {
                                    onLeftButtonPress()
                                }
                            }}
                        >
                            <CText style={styles.leftBtnText}>{leftButtonLabel}</CText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ ...styles.leftBtnBasic, ...styles.rightBtnOverride }}
                            onPress={() => {
                                setShowModal(false)
                                if (onRightButtonPress) {
                                    onRightButtonPress()
                                }
                            }}
                        >
                            <CText style={styles.rightBtnText}>{rightButtonLabel}</CText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default AlertModal

import React, { FC, useImperativeHandle, useState } from 'react'
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../common/components/CText'

interface AlertModalProps {
    title?: string
    message?: string
    noClickable?: boolean
    onLeftButtonPress?: any
    onRightButtonPress?: any
    leftButtonLabel: string
    rightButtonLabel: string
    titleStyle?: any
    messageStyle?: any
    leftButtonStyle?: any
    rightButtonStyle?: any
    alertViewJSX?: React.ReactNode
}

export type AlertModalRef = {
    openModal: (title?: string, msg?: string) => void
    closeModal: () => void
}

const styles = StyleSheet.create({
    modalContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    alertBorder: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 79,
        borderRadius: 10
    },
    alertView: {
        justifyContent: 'center',
        paddingHorizontal: 15
    },
    defaultTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginTop: 24,
        marginBottom: 5,
        textAlign: 'center'
    },
    defaultMag: {
        fontSize: 13,
        fontWeight: '400',
        textAlign: 'center'
    },
    btnCon: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(77, 77, 77, 0.1)',
        marginTop: 15
    },
    btnStyles: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        height: 66
    },
    leftRadius: {
        borderBottomLeftRadius: 8
    },
    rightRadius: {
        borderBottomRightRadius: 8
    },
    rightBorder: {
        borderRightWidth: 1,
        borderRightColor: 'rgba(77, 77, 77, 0.1)'
    },
    leftBtnTitle: {
        fontSize: 17,
        fontWeight: '400',
        color: '#007AFF',
        textAlign: 'center'
    },
    rightTitleFont: {
        fontWeight: '400'
    }
})

const AlertView: FC<AlertModalProps & { ref: React.Ref<AlertModalRef> }> = React.forwardRef<
    AlertModalRef,
    AlertModalProps
>((props, ref) => {
    const {
        title,
        message,
        noClickable,
        onLeftButtonPress,
        onRightButtonPress,
        leftButtonLabel,
        rightButtonLabel,
        titleStyle,
        messageStyle,
        leftButtonStyle,
        rightButtonStyle,
        alertViewJSX
    } = props
    const [showModal, setShowModal] = useState(false)
    const [showTitle, setShowTitle] = useState(title)
    const [showMsg, setShowMsg] = useState(message)

    useImperativeHandle(ref, () => ({
        openModal: (titleString?: string, msgString?: string) => {
            if (titleString) {
                setShowTitle(titleString)
            }
            if (msgString) {
                setShowMsg(msgString)
            }
            setShowModal(true)
        },
        closeModal: () => {
            setShowModal(false)
        }
    }))

    return (
        <Modal animationType="fade" transparent visible={showModal}>
            <TouchableOpacity
                style={styles.modalContainer}
                disabled={noClickable}
                onPress={() => {
                    setShowModal(false)
                }}
            >
                <View style={styles.alertBorder}>
                    {alertViewJSX || (
                        <View style={styles.alertView}>
                            <CText style={[styles.defaultTitle, titleStyle]}>{showTitle}</CText>
                            <CText style={[styles.defaultMag, messageStyle]}>{showMsg}</CText>
                        </View>
                    )}
                    <View style={styles.btnCon}>
                        <TouchableOpacity
                            style={[styles.btnStyles, styles.leftRadius, styles.rightBorder]}
                            onPress={() => {
                                setShowModal(false)
                                if (onLeftButtonPress) {
                                    onLeftButtonPress()
                                }
                            }}
                        >
                            <CText style={[styles.leftBtnTitle, leftButtonStyle]}>{leftButtonLabel}</CText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnStyles, styles.rightRadius]}
                            onPress={() => {
                                setShowModal(false)
                                if (onRightButtonPress) {
                                    onRightButtonPress()
                                }
                            }}
                        >
                            <CText style={[styles.leftBtnTitle, styles.rightTitleFont, rightButtonStyle]}>
                                {rightButtonLabel}
                            </CText>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    )
})

AlertView.displayName = 'AlertView'

export default AlertView

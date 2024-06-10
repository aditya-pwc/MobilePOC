/**
 * @description Global Modal to show loading or info.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 * @date 2021-05-07
 */

import React, { FC, useImperativeHandle, useState } from 'react'
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import LottieView from 'lottie-react-native'
import CText from '../../../common/components/CText'

interface GlobalModalProps {
    ref: any
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    innerContainer: {
        backgroundColor: 'white',
        height: 252,
        width: 300,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    infoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        padding: 10
    },
    syncIcon: {
        width: 100,
        height: 100
    },
    lottieView: {
        width: 150,
        height: 150
    },
    customButtonView: {
        backgroundColor: '#6125BB',
        width: '100%',
        height: 52,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    customButtonText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 18
    }
})

const LoadingComponent = () => {
    return (
        <LottieView
            source={require('../../../../assets/animation/loading.json')}
            autoPlay
            loop
            style={styles.lottieView}
        />
    )
}

const GlobalModal: FC<GlobalModalProps> = React.forwardRef((props: GlobalModalProps, ref) => {
    const [showModal, setShowModal] = useState(false)
    const [customInfo, setCustomInfo] = useState(null)
    const [customButtonLabel, setCustomButtonLabel] = useState(null)
    const [disableTapClose, setDisableTapClose] = useState(true)
    const [hideBackground, setHideBackground] = useState(false)
    const openModal = (customInfo, showConfirmButton?) => {
        if (customInfo) {
            setCustomInfo(customInfo)
            setDisableTapClose(false)
            setHideBackground(false)
        } else {
            setCustomInfo(LoadingComponent)
            setDisableTapClose(true)
            setHideBackground(true)
        }
        if (showConfirmButton !== null && showConfirmButton !== undefined) {
            setCustomButtonLabel(showConfirmButton)
        } else {
            setCustomButtonLabel(null)
        }
        setShowModal(true)
    }
    const openModalWithDisableTap = (customInfo) => {
        if (customInfo) {
            setCustomInfo(customInfo)
            setDisableTapClose(true)
            setHideBackground(false)
            setShowModal(true)
        }
    }
    const openModalWithHideBackground = (customInfo) => {
        if (customInfo) {
            setCustomInfo(customInfo)
            setHideBackground(true)
            setShowModal(true)
        }
    }
    const closeModal = () => {
        setShowModal(false)
    }

    useImperativeHandle(ref, () => ({
        openModal: (customInfo?, showConfirmButton?) => {
            openModal(customInfo, showConfirmButton)
        },
        openModalWithDisableTap: (customInfo) => {
            openModalWithDisableTap(customInfo)
        },
        openModalWithHideBackground: (customInfo) => {
            openModalWithHideBackground(customInfo)
        },
        closeModal: () => {
            // setTimeout(() => {
            closeModal()
            // }, 0)
        },
        closeModalWithTimeout: () => {
            setTimeout(() => {
                closeModal()
            }, 0)
        }
    }))
    return (
        <Modal
            animationType="fade"
            transparent
            visible={showModal}
            onRequestClose={() => {
                setShowModal(!showModal)
            }}
        >
            <TouchableOpacity
                style={styles.container}
                onPress={() => {
                    setShowModal(!showModal)
                }}
                disabled={disableTapClose}
            >
                <View style={[styles.innerContainer, { backgroundColor: hideBackground ? 'transparent' : 'white' }]}>
                    <View style={styles.infoContainer}>{customInfo}</View>
                    {customButtonLabel !== null && (
                        <TouchableOpacity
                            style={styles.customButtonView}
                            onPress={() => {
                                setShowModal(false)
                            }}
                        >
                            <CText style={styles.customButtonText}>{customButtonLabel}</CText>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
    )
})

GlobalModal.displayName = 'GlobalModal'

export default GlobalModal

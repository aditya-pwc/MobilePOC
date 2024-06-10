/**
 * @description Full Screen Modal Template
 * @author Sheng Huang
 * @date 2023-03-17
 */

import React, { Component, FC, Ref, useImperativeHandle, useState } from 'react'
import {
    ActivityIndicator,
    ColorValue,
    Image,
    Modal,
    ModalProps,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native'
import CText from '../../../../../common/components/CText'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

export interface FullScreenModalRef {
    openModal: () => void
    closeModal: () => void
}
interface FullScreenModalProps {
    title: string
    cRef: Ref<FullScreenModalRef>
    onClose?: () => void
    closeButton?: boolean
    scrollView?: boolean
    footerComponent?: Component
    backgroundColor: ColorValue
    isLoading: boolean
}

const styles = StyleSheet.create({
    ...commonStyle,
    distributionPointModal: {
        width: '100%',
        height: '100%'
    },
    titleContainer: {
        paddingHorizontal: 22,
        paddingVertical: 22
    },
    titleWidth90: { width: '90%' },
    titleWidth100: { width: '100%' }
})

const FullScreenModal: FC<FullScreenModalProps & ModalProps> = (props: FullScreenModalProps & ModalProps) => {
    const { title, cRef, children, onClose, closeButton, scrollView, backgroundColor, isLoading, ...restProps } = props
    const [showModal, setShowModal] = useState(false)
    const openModal = () => {
        setShowModal(true)
    }
    const closeModal = () => {
        setShowModal(false)
    }
    useImperativeHandle(cRef, () => ({
        openModal: () => openModal(),
        closeModal: () => closeModal()
    }))
    return (
        <Modal {...restProps} visible={showModal}>
            <SafeAreaView style={[styles.distributionPointModal, { backgroundColor: backgroundColor }]}>
                {!scrollView && (
                    <>
                        <View style={[styles.titleContainer, styles.rowWithCenter]}>
                            <View
                                style={[
                                    closeButton ? styles.titleWidth90 : styles.titleWidth100,
                                    { flexDirection: 'row' }
                                ]}
                            >
                                <CText style={styles.fontBolder}>{title}</CText>
                                {isLoading && <ActivityIndicator style={{ marginLeft: 10 }} />}
                            </View>
                            {closeButton && (
                                <TouchableOpacity
                                    onPress={() => {
                                        if (onClose) {
                                            onClose()
                                        } else {
                                            closeModal()
                                        }
                                    }}
                                >
                                    <Image
                                        style={styles.iconLarge}
                                        source={require('../../../../../../assets/image/ios-close-circle-outline.png')}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                        {children}
                    </>
                )}
                {scrollView && (
                    <>
                        <ScrollView>
                            <View style={[styles.titleContainer, styles.rowWithCenter]}>
                                <View
                                    style={[
                                        closeButton ? styles.titleWidth90 : styles.titleWidth100,
                                        { flexDirection: 'row' }
                                    ]}
                                >
                                    <CText style={styles.fontBolder}>{title}</CText>
                                    {isLoading && <ActivityIndicator style={{ marginLeft: 10 }} />}
                                </View>

                                {closeButton && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (onClose) {
                                                onClose()
                                            } else {
                                                closeModal()
                                            }
                                        }}
                                    >
                                        <Image
                                            style={styles.iconLarge}
                                            source={require('../../../../../../assets/image/ios-close-circle-outline.png')}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                            {children}
                        </ScrollView>
                        {props.footerComponent}
                    </>
                )}
            </SafeAreaView>
        </Modal>
    )
}

FullScreenModal.defaultProps = {
    closeButton: true,
    scrollView: false,
    backgroundColor: 'white',
    isLoading: false
}

export default FullScreenModal

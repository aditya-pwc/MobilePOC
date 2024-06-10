/*
 * @Description:
 * @LastEditors: Dashun Fu
 */
import React, { useState, useImperativeHandle } from 'react'
import { View, Modal, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native'
import { t } from '../../../common/i18n/t'
import CText from '../../../common/components/CText'
import { ImageSrc } from '../../../common/enums/ImageSrc'

interface SuccessViewProps {
    title?: string
    onClick?: Function
    cRef?: any
    modalViewStyle?: any
    useHide?: boolean
    afterTimeClose?: number
    noClickable?: boolean
    iconSrc?: ImageSourcePropType
    successViewJSX?: React.ReactNode
}

const styles = StyleSheet.create({
    modalContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalV: {
        height: 220,
        width: 200,
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8
    },
    modalText: {
        marginTop: 20,
        marginBottom: 15,
        color: '#000',
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '900',
        textAlign: 'center'
    },
    modalImg: {
        marginTop: 50,
        width: 60,
        height: 54
    }
})

export type SuccessViewRef = {
    openModal: () => void
    closeModal: () => void
}

const SuccessView: React.FC<SuccessViewProps & { ref: React.Ref<SuccessViewRef> }> = React.forwardRef<
    SuccessViewRef,
    SuccessViewProps
>((props, ref) => {
    const { onClick, title, modalViewStyle, useHide, afterTimeClose, noClickable, iconSrc, successViewJSX } = props
    const [showSuccess, setShowSuccess] = useState(false)
    const ICON_SUCCESS = ImageSrc.ICON_SUCCESS
    useImperativeHandle(ref, () => ({
        openModal: () => {
            setShowSuccess(true)
            if (!useHide) {
                setTimeout(() => {
                    setShowSuccess(false)
                }, afterTimeClose || 1000)
            }
        },
        closeModal: () => {
            setShowSuccess(false)
        }
    }))

    return (
        <Modal transparent animationType="fade" visible={showSuccess}>
            <TouchableOpacity
                style={styles.modalContainer}
                disabled={noClickable}
                onPress={() => {
                    setShowSuccess(false)
                    onClick && onClick()
                }}
            >
                <View style={[styles.modalV, modalViewStyle]}>
                    <Image style={styles.modalImg} source={iconSrc || ICON_SUCCESS} />
                    {successViewJSX || (
                        <CText style={styles.modalText}>
                            {title || `${t.labels.PBNA_MOBILE_SUCCESSFULLY}\n${t.labels.PBNA_MOBILE_EXECUTE_LOWER}!`}
                        </CText>
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
    )
})

SuccessView.displayName = 'SuccessView'

export default SuccessView

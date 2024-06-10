import React, { FC, useEffect, useImperativeHandle, useRef } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Modalize } from 'react-native-modalize'
import { Divider } from 'react-native-elements'
import CText from './CText'
import { commonStyle } from '../styles/CommonStyle'

interface ITitleModalProps {
    children: React.ReactNode
    title?: React.ReactNode
    visible?: boolean
    onClose?: () => void
    cRef?: React.Ref<any>
    showBackButton?: boolean
    modalStyle?: Object
}

const styles = StyleSheet.create({
    modalWrapper: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        shadowOffset: {
            width: 0,
            height: -5
        },
        shadowColor: '#004C97',
        shadowOpacity: 0.1
    },
    titleText: {
        marginTop: 36,
        fontSize: 12,
        fontWeight: '700',
        color: 'black',
        fontFamily: 'Gotham-Bold'
    },
    dividerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 19,
        width: '100%'
    },
    dividerStyle: {
        backgroundColor: '#D3D3D3',
        width: '90%'
    },
    backButton: {
        position: 'absolute',
        left: 20,
        top: 35
    },
    backButtonContent: {
        marginLeft: 4,
        marginTop: 2,
        width: 16,
        height: 16,
        borderTopWidth: 2,
        borderRightWidth: 2,
        transform: [{ rotate: '-135deg' }],
        borderTopColor: '#00A2D9',
        borderRightColor: '#00A2D9'
    }
})

const TitleModal: FC<ITitleModalProps> = (props: ITitleModalProps) => {
    const { title, children, visible, onClose, cRef, showBackButton, modalStyle = {} } = props
    const modalizeRef = useRef<Modalize>(null)

    useEffect(() => {
        if (visible) {
            modalizeRef.current.open()
        } else {
            modalizeRef.current.close()
        }
    }, [visible])

    useImperativeHandle(cRef, () => ({
        closeModal: () => {
            modalizeRef.current?.close()
        },
        openModal: () => {
            modalizeRef.current?.open()
        }
    }))

    return (
        <Modalize
            ref={modalizeRef}
            adjustToContentHeight
            modalStyle={modalStyle}
            handlePosition="inside"
            onClose={onClose}
        >
            <View style={styles.modalWrapper}>
                {showBackButton && (
                    <TouchableOpacity
                        onPress={() => {
                            modalizeRef.current?.close()
                        }}
                        hitSlop={commonStyle.hitSlop30}
                        style={styles.backButton}
                    >
                        <View style={styles.backButtonContent} />
                    </TouchableOpacity>
                )}
                <CText style={styles.titleText}>{title}</CText>
                <View style={styles.dividerContainer}>
                    <Divider style={styles.dividerStyle} />
                </View>
                {children}
            </View>
        </Modalize>
    )
}

export default TitleModal

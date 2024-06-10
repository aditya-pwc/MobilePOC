/*
 * @Description:
 * @Author: Bao Xupeng
 * @Date: 2021-04-14
 * @LastEditTime: 2023-05-23 15:55:26
 * @LastEditors: Tom tong.jiang@pwc.com
 */

import React, { useEffect } from 'react'
import { View, Image, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Modal } from 'react-native'
import CText from '../../../common/components/CText'
import { ImageSrc } from '../../../common/enums/ImageSrc'

const DEFAULT_DELAY_TIME = 2000

const OPACITY = 1

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: 200,
        minHeight: 220,
        alignItems: 'center'
    },
    imgSuccess: {
        width: 60,
        height: 60,
        marginTop: 50,
        marginBottom: 23
    },
    reassignMsg: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000',
        textAlign: 'center',
        maxWidth: 250,
        marginBottom: 20
    },
    width_300: {
        width: 300
    },
    flexRow: {
        flexDirection: 'row'
    },
    alignCenter: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    height_300: {
        width: 300,
        height: 260
    }
})

interface PropsType {
    navigation?: any
    modalVisible?: boolean
    setModalVisible?: any
    switchSucMsg?: string
    isLocationSwitchSuc?: boolean
}

const ReassignResultModal = (props: PropsType) => {
    const { modalVisible, setModalVisible, isLocationSwitchSuc, switchSucMsg } = props
    const ICON_SUCCESS = ImageSrc.IMG_SUCCESS_ICON

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setModalVisible(false)
        }, DEFAULT_DELAY_TIME)
        return () => {
            clearTimeout(timeoutId)
        }
    })

    return (
        <Modal animationType="fade" transparent visible={modalVisible}>
            <TouchableOpacity activeOpacity={OPACITY} style={styles.centeredView}>
                <TouchableWithoutFeedback>
                    <View style={[styles.modalView, styles.width_300]}>
                        <Image style={styles.imgSuccess} source={ICON_SUCCESS} />
                        {isLocationSwitchSuc && (
                            <View style={styles.alignCenter}>
                                <CText style={styles.reassignMsg}>{switchSucMsg}</CText>
                            </View>
                        )}
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    )
}

export default ReassignResultModal

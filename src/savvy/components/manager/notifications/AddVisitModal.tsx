/**
 * @description A modal to show add a visit result.
 * @author Jack Niu
 * @email chuang.niu@pwc.com
 * @date 2021-05-06
 */

import React, { useEffect } from 'react'
import { View, Image, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Modal } from 'react-native'
import { t } from '../../../../common/i18n/t'
import { DEFAULT_DELAY_TIME } from '../../../utils/MerchManagerUtils'
import CText from '../../../../common/components/CText'

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
        height: 220,
        alignItems: 'center'
    },
    imgSuccess: {
        width: 60,
        height: 60,
        marginTop: 50,
        marginBottom: 23
    },
    textMsg: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000',
        textAlign: 'center'
    }
})

interface PropsType {
    modalVisible: boolean
    setModalVisible: any
    visitNum?: number
}

const AddVisitModal = (props: PropsType) => {
    const { modalVisible, setModalVisible, visitNum } = props
    const successIcon = require('../../../../../assets/image/icon-success.png')

    useEffect(() => {
        setTimeout(() => {
            setModalVisible(false)
        }, DEFAULT_DELAY_TIME)
    }, [])

    return (
        <Modal animationType="fade" transparent visible={modalVisible}>
            <TouchableOpacity
                activeOpacity={OPACITY}
                style={styles.centeredView}
                onPressOut={() => {
                    setModalVisible(!modalVisible)
                }}
            >
                <TouchableWithoutFeedback>
                    <View style={styles.modalView}>
                        <Image style={styles.imgSuccess} source={successIcon} />
                        {
                            <View>
                                <CText style={styles.textMsg}>{`${visitNum} ${t.labels.PBNA_MOBILE_NEW_VISITS}`}</CText>
                                <CText style={styles.textMsg}>
                                    {`${t.labels.PBNA_MOBILE_ADDED.toLocaleLowerCase()}`}
                                </CText>
                                <CText style={styles.textMsg}>
                                    {`${t.labels.PBNA_MOBILE_SUCCESSFULLY.toLocaleLowerCase()}`}
                                </CText>
                            </View>
                        }
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    )
}

export default AddVisitModal

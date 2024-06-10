/*
 * @Description:
 * @LastEditors: Yi Li
 */
import _ from 'lodash'
import React, { useImperativeHandle, useState } from 'react'
import { Modal, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native'
import Pdf from 'react-native-pdf'

interface EquipmentPdfModalProps {
    cRef: any
}
const styles = StyleSheet.create({
    backBtn: {
        marginTop: 44,
        height: 66,
        justifyContent: 'center'
    },
    backButtonImage: {
        marginLeft: 22,
        width: 12,
        height: 21
    },
    screenContainer: {
        height: Dimensions.get('window').height - 110
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        backgroundColor: 'white',
        height: Dimensions.get('window').height - 110
    }
})
const fitPolicyWidth = 0

const minPdfScale = 0.5
const EquipmentPdfModal = (props: EquipmentPdfModalProps) => {
    const { cRef } = props
    const [pdfSource, setPdfSource] = useState('')

    useImperativeHandle(cRef, () => ({
        open: (pdfSourceString: string) => {
            setPdfSource(`file:///${pdfSourceString || ''}`)
        }
    }))

    return (
        <Modal visible={!_.isEmpty(pdfSource)}>
            <TouchableOpacity
                style={styles.backBtn}
                onPress={() => {
                    setPdfSource('')
                }}
            >
                <Image
                    source={require('../../../../../../assets/image/icon-back.png')}
                    style={styles.backButtonImage}
                />
            </TouchableOpacity>

            <ScrollView style={styles.screenContainer}>
                <Pdf source={{ uri: pdfSource }} fitPolicy={fitPolicyWidth} minScale={minPdfScale} style={styles.pdf} />
            </ScrollView>
        </Modal>
    )
}

export default EquipmentPdfModal

/**
 * @description BrandingLoading Component
 * @author Yi Li
 * @email yi.b.li@pwc.com
 * @date 2021-08-08
 *             <BrandingLoading
 cRef={brandingLoading}
 navigation={navigation}
 />
 brandingLoading.current.hide()
 brandingLoading.current.show()
 */
import React, { FC, useImperativeHandle, useState } from 'react'
import { Modal, StyleSheet, View } from 'react-native'
import LottieView from 'lottie-react-native'
import { LottieSrc } from '../enums/LottieSrc'

const styles = StyleSheet.create({
    modalStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    tinyLogo: {
        width: 60,
        height: 60
    },
    lottie: {
        width: 150,
        height: 150
    }
})

interface BrandingLoadingProps {
    cRef
    navigation?
    imageStyle?
}

const BrandingLoading: FC<BrandingLoadingProps> = (props: BrandingLoadingProps) => {
    const { cRef } = props
    const [visible, setVisible] = useState(false)
    useImperativeHandle(cRef, () => ({
        show: () => {
            setVisible(true)
        },
        hide: () => {
            setVisible(false)
        }
    }))

    return (
        <Modal visible={visible} transparent>
            <View style={styles.modalStyle}>
                <LottieView source={LottieSrc.LOADING as unknown as string} autoPlay loop style={styles.lottie} />
            </View>
        </Modal>
    )
}

export default BrandingLoading

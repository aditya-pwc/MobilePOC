/*
 * @Description:
 * @Author: Bao Xupeng
 * @Date: 2021-04-14
 * @LastEditTime: 2023-05-23 15:57:09
 * @LastEditors: Tom tong.jiang@pwc.com
 */
import React, { FC } from 'react'
import { View, StyleSheet, Modal } from 'react-native'
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

interface LoadingProps {
    isLoading?: boolean
}

const Loading: FC<LoadingProps> = ({ isLoading = false }: LoadingProps) => {
    return (
        <Modal visible={isLoading} transparent>
            <View style={styles.modalStyle}>
                <LottieView source={LottieSrc.LOADING as unknown as string} autoPlay loop style={styles.lottie} />
            </View>
        </Modal>
    )
}

export default Loading

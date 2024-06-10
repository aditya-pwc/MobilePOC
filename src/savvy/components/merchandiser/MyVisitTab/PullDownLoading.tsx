/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-05-29 21:32:19
 * @LastEditTime: 2022-05-29 21:40:05
 * @LastEditors: Mary Qian
 */

import React from 'react'
import { RefreshControl, StyleSheet, Image } from 'react-native'

const styles = StyleSheet.create({
    loadingContain: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    tinyLogo: {
        position: 'absolute',
        top: 5,
        bottom: 30,
        width: 30,
        height: 30,
        marginTop: 20
    }
})

export interface PullDownLoadingProps {
    isLoading: boolean
    onPullDownRefresh: () => void
}

const PullDownLoading = (props: PullDownLoadingProps) => {
    const { isLoading, onPullDownRefresh } = props
    return (
        <RefreshControl
            style={styles.loadingContain}
            tintColor={'transparent'}
            titleColor={'transparent'}
            refreshing={isLoading}
            onRefresh={onPullDownRefresh}
            size={30}
        >
            {isLoading && (
                <Image style={styles.tinyLogo} source={require('../../../../../assets/image/Loading-common.gif')} />
            )}
        </RefreshControl>
    )
}

export default PullDownLoading

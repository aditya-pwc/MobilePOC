/*
 * @Description:
 * @Author: Shangmin Dou
 * @Date: 2021-04-02
 * @LastEditTime: 2022-11-21 14:42:29
 * @LastEditors: Mary Qian
 */
import React, { FC } from 'react'
import { View, StyleSheet } from 'react-native'
import CText from '../../common/components/CText'

interface UpdateNoticeScreenProps {
    displayMessage: string
    route
}

const styles = StyleSheet.create({
    updateNoticeContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        paddingHorizontal: '5%'
    },
    updateNoticeText: {
        fontSize: 32
    }
})

const UpdateNoticeScreen: FC<UpdateNoticeScreenProps> = (props) => {
    const { displayMessage, route } = props
    const displayMessageFromBackend = route?.params?.displayMessageFromBackend
    return (
        <View style={styles.updateNoticeContainer}>
            <View>
                <CText style={styles.updateNoticeText}>{displayMessageFromBackend || displayMessage}</CText>
            </View>
        </View>
    )
}

UpdateNoticeScreen.defaultProps = {
    displayMessage: 'Please update the app to the latest version!'
}

export default UpdateNoticeScreen

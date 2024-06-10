/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-08-23 11:10:45
 * @LastEditTime: 2022-11-21 14:32:49
 * @LastEditors: Mary Qian
 */
/**
 * @description A screen to show that the user has no access to use the app.
 * @date 2021-04-02
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 */
import React from 'react'
import { StyleSheet, View } from 'react-native'
import CText from '../../common/components/CText'
import { Button } from 'react-native-elements'
import { CommonParam } from '../../common/CommonParam'
import AsyncStorage from '@react-native-async-storage/async-storage'
import BaseInstance from '../../common/BaseInstance'

const styles = StyleSheet.create({
    noAccessContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
    },
    noAccessText: {
        fontSize: 32
    },
    logoutButton: {
        marginTop: 20
    }
})
const NoAccessScreen = () => {
    const logout = async () => {
        CommonParam.isFirstTimeUser = true
        CommonParam.userId = null
        CommonParam.user = null
        const itemsToRemove = ['clientInfo', 'user', 'pendingSyncItems', 'user_account']
        await AsyncStorage.multiRemove(itemsToRemove)
        BaseInstance.sfOauthEngine.logout()
    }

    return (
        <View style={styles.noAccessContainer}>
            <View>
                <CText style={styles.noAccessText}>NO ACCESS</CText>
            </View>
            <Button
                style={styles.logoutButton}
                title={'Logout'}
                onPress={() => {
                    logout()
                }}
            />
        </View>
    )
}

export default NoAccessScreen

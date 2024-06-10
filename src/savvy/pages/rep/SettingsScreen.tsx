/*
 * @Description:
 * @LastEditors: Yi Li
 */
/**
 * @description SettingsScreen Page
 * @author Sheng Huang
 * @date 2021/9/29
 */
import React from 'react'
import { SafeAreaView, StyleSheet, View } from 'react-native'
import CText from '../../../common/components/CText'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { t } from '../../../common/i18n/t'
import NavigationBar from '../../components/common/NavigationBar'
import BackButton from '../../components/common/BackButton'

interface SettingsScreenProps {
    navigation: any
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    settingText: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonMargin: {
        marginBottom: 15
    }
})

const SettingsScreen = (props: SettingsScreenProps) => {
    const { navigation } = props
    return (
        <SafeAreaView style={styles.safeArea}>
            <NavigationBar
                left={<BackButton navigation={navigation} />}
                leftStyle={styles.buttonMargin}
                title={t.labels.PBNA_MOBILE_SETTINGS.toUpperCase()}
                style={{ marginHorizontal: 22 }}
            />
            <View style={styles.settingText}>
                <CText> {t.labels.PBNA_MOBILE_NO_VISIBLE_SETTINGS}</CText>
            </View>
        </SafeAreaView>
    )
}

export default SettingsScreen

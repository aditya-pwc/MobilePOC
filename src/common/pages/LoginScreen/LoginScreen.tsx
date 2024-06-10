import React, { useEffect, useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { ActivityIndicator, Animated, ImageBackground, NativeModules, StyleSheet, View } from 'react-native'
import { ImageSrc } from '../../enums/ImageSrc'
import { Button } from 'react-native-elements'
import Geolocation from 'react-native-geolocation-service'
import { commonStyle } from '../../styles/CommonStyle'
import { useInitApp, useUser } from './UserHooks'

const { PushNotification } = NativeModules

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'contain'
    },
    buttonStyle: {
        height: 35,
        width: '100%',
        fontSize: 13,
        backgroundColor: '#FFF'
    },
    titleStyle: {
        fontWeight: '700',
        color: '#000',
        textTransform: 'uppercase',
        textAlign: 'center',
        fontSize: 13,
        width: '100%'
    },
    containerStyle: {
        backgroundColor: '#FFF',
        color: '#000',
        position: 'absolute',
        bottom: 60,
        width: '100%'
    },
    container: {
        backgroundColor: '#FFF',
        color: '#000',
        position: 'absolute',
        bottom: 30,
        width: '80%'
    },
    loadingContainer: { position: 'absolute', bottom: 80 }
})

const LoginScreen = () => {
    const navigation = useNavigation()
    const [splash, setSplash] = useState(ImageSrc.PAGE_SPLASH)
    const [isLoading, setIsLoading] = useState(false)
    const opacity = useRef(new Animated.Value(0)).current
    useInitApp(navigation, setIsLoading)
    const { auth } = useUser(navigation, setIsLoading)

    const displayLoginButton = () => {
        Animated.timing(opacity, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false
        }).start()
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSplash(ImageSrc.PAGE_SPLASH2)
            displayLoginButton()
            PushNotification.requestPermission()
            Geolocation.requestAuthorization('whenInUse')
        }, 4000)
        return () => {
            clearTimeout(timeout)
        }
    }, [])

    return (
        <ImageBackground source={splash} style={commonStyle.flexCenter}>
            {!isLoading && (
                <Animated.View
                    style={[
                        {
                            opacity
                        },
                        styles.container
                    ]}
                >
                    <Button
                        onPress={auth}
                        title="LOGIN"
                        buttonStyle={[styles.buttonStyle]}
                        containerStyle={[styles.containerStyle]}
                        titleStyle={[styles.titleStyle]}
                    />
                </Animated.View>
            )}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                </View>
            )}
        </ImageBackground>
    )
}

export default LoginScreen

import DeviceInfo from 'react-native-device-info'
import { useEffect, MutableRefObject } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import LottieView from 'lottie-react-native'

const HEADER_MIN_HEIGHT = 100
const HEADER_MAX_HEIGHT = 170
export const useDetailScreenHeaderTabAnimation = (scrollYAnimatedValue) => {
    const headerBackgroundColor = scrollYAnimatedValue.interpolate({
        inputRange: [HEADER_MIN_HEIGHT, HEADER_MAX_HEIGHT],
        outputRange: ['transparent', 'white'],
        extrapolate: 'clamp'
    })

    const headerTitleColor = scrollYAnimatedValue.interpolate({
        inputRange: [HEADER_MIN_HEIGHT, HEADER_MAX_HEIGHT],
        outputRange: ['transparent', 'black'],
        extrapolate: 'clamp'
    })

    const headerLeftChevronColor = scrollYAnimatedValue.interpolate({
        inputRange: [20, 70],
        outputRange: ['white', '#00A2D9'],
        extrapolate: 'clamp'
    })
    const equipmentLeftChevronColor = scrollYAnimatedValue.interpolate({
        inputRange: [20, 70],
        outputRange: ['#00A2D9', 'white'],
        extrapolate: 'clamp'
    })

    const tabBarTop = scrollYAnimatedValue.interpolate({
        inputRange: [170, 267],
        outputRange: [0, DeviceInfo.hasNotch() ? 110 : 60],
        extrapolate: 'clamp'
    })

    return {
        headerBackgroundColor,
        headerTitleColor,
        headerLeftChevronColor,
        equipmentLeftChevronColor,
        tabBarTop
    }
}

export const usePlayLottieAnimation = (animationRef: MutableRefObject<LottieView | null>) => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
            animationRef?.current?.play()
        }
    }
    useEffect(() => {
        const appStateListener = AppState.addEventListener('change', handleAppStateChange)
        return () => {
            appStateListener.remove()
        }
    }, [])
}

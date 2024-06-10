import { Dimensions, Platform, PixelRatio } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// based on iphone 14 pro max's scale

const scale = SCREEN_WIDTH / 430

export const normalize = (size: number) => {
    const newSize = size * scale

    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize))
    }

    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
}

import React from 'react'
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native'

const styles = StyleSheet.create({
    overlayStyle: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        backgroundColor: 'transparent'
    },
    btnStyle: {
        justifyContent: 'flex-end',
        flexDirection: 'column',
        position: 'absolute',
        right: 22,
        bottom: 100
    },
    floatImg: {
        width: 56,
        height: 60,
        borderRadius: 28,
        resizeMode: 'stretch'
    }
})

interface MapFloatButtonProps {
    isMap
    onPressClock
}
const MapFloatButton = (props: MapFloatButtonProps) => {
    const { isMap, onPressClock } = props
    return (
        <View style={styles.overlayStyle} pointerEvents="box-none">
            <TouchableOpacity
                style={styles.btnStyle}
                onPress={() => {
                    onPressClock()
                }}
            >
                <Image
                    style={styles.floatImg}
                    source={
                        isMap
                            ? require('../../../../assets/image/icon-list.png')
                            : require('../../../../assets/image/icon-map.png')
                    }
                />
            </TouchableOpacity>
        </View>
    )
}

export default MapFloatButton

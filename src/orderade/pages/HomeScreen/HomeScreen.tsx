import React from 'react'
import { View, StyleSheet } from 'react-native'

const style = StyleSheet.create({
    centeredWholePage: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    }
})

const HomeScreen = () => {
    return <View style={style.centeredWholePage} />
}

export default HomeScreen

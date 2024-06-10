import { View, StyleSheet } from 'react-native'
import React from 'react'

const styles = StyleSheet.create({
    circleCont: {
        borderWidth: 18,
        borderColor: 'rgba(0,0,0,0.1)',
        position: 'absolute'
    }
})

export const BackgroundCircle = () => {
    const generateCircles = () => {
        const tempCircle = []
        for (let i = 1; i < 8; i++) {
            tempCircle.push({
                width: 110 * i,
                height: 80 * i,
                left: -50 * i * 1.25,
                bottom: -50 * i,
                borderRadius: (100 * i) / 2,
                key: i
            })
        }
        return tempCircle.map((c) => (
            <View
                style={[
                    styles.circleCont,
                    {
                        width: c.width,
                        height: c.height,
                        left: c.left,
                        bottom: c.bottom,
                        borderRadius: c.borderRadius
                    }
                ]}
                key={c.key}
            />
        ))
    }
    return <>{generateCircles()}</>
}

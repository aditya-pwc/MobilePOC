/**
 * @description The header button.
 * @author Shangmin Dou
 * @date 2021-04-21
 */
import React, { FC } from 'react'
import { Animated, TouchableOpacity, StyleSheet } from 'react-native'

interface HeaderCircleProps {
    transform: any
    color: any
    onPress: any
}

const styles = StyleSheet.create({
    circle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center'
    },
    lineHorizontal: {
        width: 20,
        height: 3,
        left: 5,
        top: 13.5,
        position: 'absolute'
    },
    lineVertical: {
        width: 3,
        height: 20,
        left: 13.5,
        top: 5,
        position: 'absolute'
    }
})

const HeaderCircle: FC<HeaderCircleProps> = (props: HeaderCircleProps) => {
    const { color, transform, onPress } = props
    return (
        <TouchableOpacity onPress={onPress}>
            <Animated.View
                style={[
                    styles.circle,
                    {
                        borderColor: color,
                        transform
                    }
                ]}
            >
                <Animated.View style={[styles.lineHorizontal, { backgroundColor: color }]} />
                <Animated.View style={[styles.lineVertical, { backgroundColor: color }]} />
            </Animated.View>
        </TouchableOpacity>
    )
}

export default HeaderCircle

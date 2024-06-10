/**
 * @description
 * @author Matthew Huang
 * @date 2022-Aug-17
 */
import React, { useEffect, useImperativeHandle, useRef } from 'react'
import { Animated } from 'react-native'

interface SwipeCollapsibleProps {
    cRef: any
    children: React.ReactNode
    height?: number
    topToBottom?: boolean
}

const SwipeCollapsible: React.FC<SwipeCollapsibleProps> = ({ cRef, children, height, topToBottom }) => {
    const animatedHeight: any = useRef(new Animated.Value(topToBottom ? 0 : height)).current

    const toInitialPosition = () => {
        Animated.timing(animatedHeight, {
            toValue: topToBottom ? 0 : height,
            duration: 300,
            useNativeDriver: false
        }).start()
    }

    const toExpend = () => {
        Animated.timing(animatedHeight, {
            toValue: topToBottom ? height : 0,
            duration: 300,
            useNativeDriver: false
        }).start()
    }

    const transitionAnimated = (y) => {
        Animated.timing(animatedHeight, {
            toValue: topToBottom ? Math.max(-y, height) : Math.max(height - y, 0),
            duration: 200,
            useNativeDriver: false
        }).start()
    }

    useEffect(() => {
        toInitialPosition()
    }, [height])

    useImperativeHandle(cRef, () => ({
        handleScroll: transitionAnimated,
        toInitialPosition,
        toExpend
    }))

    return (
        <Animated.View style={topToBottom ? { marginTop: animatedHeight } : { height: animatedHeight }}>
            {children}
        </Animated.View>
    )
}

export default SwipeCollapsible

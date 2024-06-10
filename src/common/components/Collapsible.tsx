/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-08-23 11:11:01
 * @LastEditTime: 2022-11-21 21:54:47
 * @LastEditors: Mary Qian
 */
import React, { FC, useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

interface CollapsibleProps {
    children: React.ReactNode
    collapsed: boolean
    preload?: boolean
    height?: number
}

const Collapsible: FC<CollapsibleProps> = (props: CollapsibleProps) => {
    const { children, collapsed, preload, height = 1000 } = props
    const animationHeight = useRef(new Animated.Value(0)).current
    const collapseView = () => {
        Animated.timing(animationHeight, {
            duration: 500,
            toValue: 0,
            useNativeDriver: false
        }).start()
    }

    const expandView = () => {
        Animated.timing(animationHeight, {
            duration: 500,
            toValue: height,
            useNativeDriver: false
        }).start()
    }

    useEffect(() => {
        if (collapsed) {
            collapseView()
        } else {
            expandView()
        }
    }, [collapsed])

    return (
        <View style={{ overflow: 'hidden' }}>
            <View
                style={[
                    !preload && { display: collapsed ? 'none' : 'flex' },
                    preload && {
                        transform: collapsed ? [{ scale: 0 }] : [{ scale: 1 }],
                        height: collapsed ? 0 : undefined
                    }
                ]}
            >
                {children}
            </View>
        </View>
    )
}

export default Collapsible

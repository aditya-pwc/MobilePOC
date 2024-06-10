/**
 * @description A FlatList and Animated Component
 * @author Xupeng Bao
 * @email xupeng.bao@pwc.com
 * @date 2021-08-19
 */

import React, { FC, useState, useEffect, useRef } from 'react'
import { View, FlatList, StyleSheet, Animated, Easing, FlatListProps } from 'react-native'
import LottieView from 'lottie-react-native'

const loadingAnimation = require('../../../../assets/animation/loading.json')
const NUMBER_ZERO = 0
const NUMBER_FIVE = 5

const styles = StyleSheet.create({
    lottieView: {
        position: 'absolute',
        top: 5,
        left: 0,
        right: 0
    },
    listStyle: {
        paddingTop: 10
    }
})

interface RefreshFlatListProps extends FlatListProps<any> {
    /**
     * Animated height style.
     * if pull down more than refreshing height,
     * start refresh function and Animated.
     */
    refreshingHeight?: number

    /**
     * return a Promise to refresh data and stop refresh Animated.
     */
    refreshData?: () => Promise<any>
}

const RefreshFlatList: FC<RefreshFlatListProps> = (props: RefreshFlatListProps) => {
    const { refreshingHeight } = props
    const [offsetY, setOffsetY] = useState(0)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const extraPaddingTop = useRef(new Animated.Value(0)).current

    const lottieViewRef = useRef(null)

    useEffect(() => {
        if (isRefreshing) {
            Animated.timing(extraPaddingTop, {
                toValue: refreshingHeight,
                duration: 400,
                useNativeDriver: false
            }).start(() => {
                lottieViewRef?.current?.play()
            })
        } else {
            Animated.timing(extraPaddingTop, {
                toValue: NUMBER_ZERO,
                duration: 1000,
                easing: Easing.elastic(1.3),
                useNativeDriver: false
            }).start(() => {
                lottieViewRef?.current?.resume()
            })
        }
    }, [isRefreshing])

    const onScroll = (event) => {
        const { nativeEvent } = event
        const { contentOffset } = nativeEvent
        const { y } = contentOffset
        setOffsetY(y)
    }

    const onRelease = () => {
        if (offsetY <= -refreshingHeight && !isRefreshing) {
            setIsRefreshing(true)
            if (props.refreshData) {
                props
                    .refreshData()
                    .then(() => {
                        setIsRefreshing(false)
                    })
                    .catch(() => {
                        setIsRefreshing(false)
                    })
            } else {
                setTimeout(() => {
                    setIsRefreshing(false)
                }, 3000)
            }
        }
    }

    let progress = NUMBER_ZERO
    if (offsetY < NUMBER_ZERO && !isRefreshing) {
        progress = offsetY / -refreshingHeight / NUMBER_FIVE
    }

    return (
        <View>
            <LottieView
                ref={lottieViewRef}
                style={[
                    styles.lottieView,
                    {
                        height: refreshingHeight
                    }
                ]}
                source={loadingAnimation}
                progress={progress}
            />
            <FlatList
                keyExtractor={(item, index) => item + index}
                style={[props.style, styles.listStyle]}
                onScroll={onScroll}
                onResponderRelease={onRelease}
                {...props}
                ListHeaderComponent={
                    <Animated.View
                        style={{
                            paddingTop: extraPaddingTop
                        }}
                    />
                }
            />
        </View>
    )
}

export default RefreshFlatList

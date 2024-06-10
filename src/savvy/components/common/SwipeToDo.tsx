/**
 * @description A complicated swipeable component.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2022-08-05
 */

import React, { useState } from 'react'
import { Animated, Dimensions, StyleSheet, View } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'
import { baseStyle } from '../../../common/styles/BaseStyle'

interface SwipeToDoProps {
    cRef?: any
    buttonWidth?: number
    backgroundColor?: string
    buttonLabel?: string
    swipeIcon?: string
    allData?: any
    keyExtractor?: (item) => string
    listData?: any
    setListData?: any
    renderItem?: any
    renderHiddenItem?: any
    disableLeftSwipe?: boolean
    isUndo?: boolean
    swipeCallback?: Function
    setIsLoading?: any
    refreshControl?: any
    style?: any
    onScroll?: (e: any) => void
    renderListHeader?: any
    ListEmptyComponent?: any
}
const rowTranslateAnimatedValues = {}
const RIGHT_ACTION_VALUE = -500
const ScrollThrottle = 200
const styles = StyleSheet.create({
    container: {
        backgroundColor: baseStyle.color.white,
        flex: 1
    }
})

export const SwipeToDo = (props: SwipeToDoProps) => {
    const {
        cRef,
        allData,
        keyExtractor = (item) => item.id,
        listData,
        setListData,
        renderItem,
        renderHiddenItem,
        isUndo,
        swipeCallback,
        setIsLoading,
        refreshControl,
        style,
        onScroll,
        renderListHeader,
        ListEmptyComponent
    } = props
    listData.forEach((item) => {
        rowTranslateAnimatedValues[`${keyExtractor(item)}`] = new Animated.Value(1)
    })
    let animationIsRunning = false
    const [swipeDistance, setSwipeDistance] = useState(0)
    const onSwipeValueChange = (swipeData) => {
        const { key, value } = swipeData
        setSwipeDistance(value)
        if (value < -Dimensions.get('window').width && !animationIsRunning) {
            animationIsRunning = true
            let currentItem = null
            allData.forEach((item) => {
                if (keyExtractor(item) === key) {
                    currentItem = item
                }
            })
            if (currentItem) {
                swipeCallback(currentItem, allData, setListData, setIsLoading, isUndo)
            }
            Animated.timing(rowTranslateAnimatedValues[key], {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            }).start(() => {
                animationIsRunning = false
            })
        }
    }

    return (
        <View style={styles.container}>
            <SwipeListView
                listViewRef={cRef}
                style={style}
                keyExtractor={keyExtractor}
                closeOnRowPress
                closeOnRowBeginSwipe
                closeOnScroll={false}
                disableRightSwipe
                data={listData}
                renderItem={renderItem}
                renderHiddenItem={(item) =>
                    renderHiddenItem && renderHiddenItem(item, swipeDistance, allData, setListData, setIsLoading)
                }
                rightOpenValue={-90}
                rightActivationValue={-120}
                rightActionValue={RIGHT_ACTION_VALUE}
                previewRowKey={'0'}
                previewOpenValue={-10}
                previewOpenDelay={2000}
                onSwipeValueChange={onSwipeValueChange}
                directionalDistanceChangeThreshold={10}
                useNativeDriver={false}
                refreshControl={refreshControl}
                ListHeaderComponent={renderListHeader}
                scrollEventThrottle={ScrollThrottle}
                onMomentumScrollBegin={onScroll}
                onScrollBeginDrag={onScroll}
                alwaysBounceVertical
                ListEmptyComponent={ListEmptyComponent}
            />
        </View>
    )
}

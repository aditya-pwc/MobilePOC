/**
 * @description A swipeable component.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-06-08
 */

import React from 'react'
import { Animated, StyleSheet, View, I18nManager, Keyboard } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import CText from '../../../common/components/CText'
import _ from 'lodash'
import { baseStyle } from '../../../common/styles/BaseStyle'

const styles = StyleSheet.create({
    containerStyle: {
        flex: 1,
        width: '100%'
    },
    leftAction: {
        flex: 1,
        backgroundColor: '#497AFC',
        justifyContent: 'center'
    },
    actionText: {
        color: baseStyle.color.white,
        fontSize: 12,
        fontWeight: '700',
        backgroundColor: 'transparent',
        padding: 10
    },
    rightAction: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    radioCorner: {
        borderTopRightRadius: 6,
        borderBottomRightRadius: 6
    },
    noRadioCorner: {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0
    },
    textAlignCenter: {
        textAlign: 'center'
    }
})

const WIDTH_90 = 90
const FRICTION = 1
const RIGHT_THRESHOLD = 10
const OVER_SHOOT_FRICTION = 8

interface SwipeButtonProps {
    label: string | any
    color: string
    width?: number | any
    onBtnClick?: Function
    disabled?: boolean
}
interface SwipeRowProps {
    uniqKey: string
    children: any
    params: Object
    swipeableRows: Object
    closeOtherRows: Function
    swipeButtonConfig?: Array<SwipeButtonProps>
    showBorderRadius?: boolean
    textAlignCenter?: boolean
}

const SwipeableRow = (props: SwipeRowProps) => {
    const {
        uniqKey,
        children,
        params,
        swipeableRows,
        closeOtherRows,
        showBorderRadius = true,
        swipeButtonConfig,
        textAlignCenter
    } = props

    const renderRightAction = (
        text: string,
        color: string,
        x: number,
        progress: Animated.AnimatedInterpolation,
        btnClickFun?: Function,
        isLastBtn?: boolean
    ) => {
        const trans = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [x, 0]
        })
        const pressHandler = () => {
            btnClickFun && btnClickFun(params)
        }

        return (
            <Animated.View key={text} style={{ flex: 1, transform: [{ translateX: trans }] }}>
                <View
                    style={[
                        styles.rightAction,
                        styles.radioCorner,
                        (!showBorderRadius || !isLastBtn) && styles.noRadioCorner,
                        { backgroundColor: color }
                    ]}
                >
                    <RectButton activeOpacity={0} style={styles.rightAction} onPress={pressHandler}>
                        <CText style={[styles.actionText, textAlignCenter && styles.textAlignCenter]}>{text}</CText>
                    </RectButton>
                </View>
            </Animated.View>
        )
    }
    let buttonWidth = 0
    swipeButtonConfig.forEach((button) => {
        buttonWidth += button.width
    })

    const renderRightActions = (progress: Animated.AnimatedInterpolation) => (
        <View
            style={{
                width: buttonWidth || WIDTH_90,
                flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row'
            }}
        >
            {swipeButtonConfig.map((button, index) => {
                return renderRightAction(
                    button.label,
                    button.color,
                    buttonWidth || WIDTH_90,
                    progress,
                    button.disabled ? null : button.onBtnClick,
                    index === swipeButtonConfig.length - 1
                )
            })}
        </View>
    )

    return (
        <Swipeable
            key={uniqKey}
            ref={(ref) => {
                if (!_.isEmpty(ref)) {
                    swipeableRows[uniqKey] = ref
                }
            }}
            friction={FRICTION}
            containerStyle={styles.containerStyle}
            enableTrackpadTwoFingerGesture
            rightThreshold={RIGHT_THRESHOLD}
            renderRightActions={renderRightActions}
            overshootRight={false}
            overshootFriction={OVER_SHOOT_FRICTION}
            onSwipeableWillOpen={() => {
                closeOtherRows(uniqKey, swipeableRows)
                Keyboard.dismiss()
            }}
        >
            {children}
        </Swipeable>
    )
}

export default SwipeableRow

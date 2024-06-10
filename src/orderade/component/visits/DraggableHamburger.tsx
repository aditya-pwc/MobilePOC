import React, { FC, useState, useRef, useEffect } from 'react'
import Draggable from 'react-native-draggable'
import IMG_HAMBURGER from '../../../../assets/image/fab_hamburger.svg'
import IMG_CLOSE from '../../../../assets/image/fab_close.svg'
import IMG_STORE from '../../../../assets/image/fab_store_map.svg'
import IMG_PLANO from '../../../../assets/image/fab_planogram.svg'
import IMG_SELLING from '../../../../assets/image/fab_selling_execution.svg'
import IMG_SKU from '../../../../assets/image/fab_sku_list.svg'
import { NavigationProp } from '@react-navigation/native'
import { MyDayVisitModel } from '../../interface/MyDayVisit'
import { baseStyle } from '../../../common/styles/BaseStyle'
import {
    View,
    StyleSheet,
    GestureResponderEvent,
    Animated,
    ViewStyle,
    TouchableOpacity,
    Dimensions
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { Constants } from '../../../common/Constants'
import { getPortraitModeScreenWidthAndHeight } from '../../../common/utils/CommonUtils'
import { CommonParam } from '../../../common/CommonParam'
import OrderService from '../../service/OrderService'
interface DraggableHamburgerProps {
    navigation: NavigationProp<any>
    store: MyDayVisitModel
    position: PositionType
    onDragRelease?: Function
    disabledOption?: string
    initialOffsetTop?: number
    cartData?: any
    cartDetailData?: any
    setHamburgerPosition: Function
    isFromCompletedVisit?: boolean
    initialOffsetBottom?: number
}
export interface PositionType {
    x: number
    y: number
}
export const HAMBURGER_ICON_SIZE = 56
const { width, height } = getPortraitModeScreenWidthAndHeight()
const hamburgerChildrenSize = 52
const hamburgerChildrenInnerSize = 44
const awayFromRoot = 20
const floatIconSize = 64
const radiusDiff = (floatIconSize - hamburgerChildrenSize) / 2
const totalTransformDistance = (HAMBURGER_ICON_SIZE + hamburgerChildrenInnerSize) / 2 + awayFromRoot

const styles = StyleSheet.create({
    dialWrap: {
        position: 'relative'
    },
    dialRoot: {
        position: 'absolute',
        zIndex: 2
    },
    dialChildren: {
        position: 'absolute',
        zIndex: 1,
        overflow: 'visible',
        left: radiusDiff,
        top: radiusDiff
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        height: Dimensions.get('window').height * 2,
        backgroundColor: baseStyle.color.modalBlack
    }
})

const DraggableHamburger: FC<DraggableHamburgerProps> = (props) => {
    const {
        navigation,
        store,
        position,
        onDragRelease,
        disabledOption,
        cartData,
        cartDetailData,
        initialOffsetTop = Constants.DEFAULT_OFFSET_TOP,
        setHamburgerPosition,
        isFromCompletedVisit
    } = props
    const { x, y } = position
    const [isOpened, setIsOpened] = useState<boolean>(false)
    const curPosition = useRef<PositionType>(position)
    const animationProgress = useRef<any>(new Animated.Value(0)).current
    const insets = useSafeAreaInsets()

    const canPlaceOrder =
        store?.Status === 'Published' || store?.User === CommonParam.userId || (cartData && cartData.length > 0)
    const DraggableHamburgerOptions = [
        {
            key: 'HAMBURGER_SELLING',
            Icon: IMG_SELLING,
            enabled: !isFromCompletedVisit,
            onPress: async () => {
                setIsOpened(false)
                Instrumentation.reportMetric('Orderade hamburger option clicked: HAMBURGER_SELLING', 1)
                cartData &&
                    store.PlaceId &&
                    (await OrderService.saveProductsToCart(
                        store.PlaceId,
                        cartData,
                        store.OrderCartIdentifier || store.VisitLegacyId
                    ))
                cartDetailData &&
                    store.PlaceId &&
                    (await OrderService.saveCartDetail(
                        store.PlaceId,
                        cartDetailData,
                        store.OrderCartIdentifier || store.VisitLegacyId
                    ))
                // reset hamburger position before leaving the page
                // but not letting the user to see the flicker
                setTimeout(() => {
                    setHamburgerPosition(null)
                }, 300)
                navigation.navigate('BCDMyVisitDetail', {
                    visitId: store.Id,
                    storeId: store.RetailStoreId,
                    visit: store
                })
            },
            transformLeftSide: {
                x: 0,
                y: -totalTransformDistance
            },
            transformRightSide: {
                x: 0,
                y: -totalTransformDistance
            }
        },
        {
            key: 'HAMBURGER_STORE',
            Icon: IMG_STORE,
            onPress: () => {},
            disabled: true,
            enabled: false,
            transformLeftSide: {
                x: totalTransformDistance * 0.8660254037844386,
                y: -totalTransformDistance / 2
            },
            transformRightSide: {
                x: -totalTransformDistance * 0.8660254037844386,
                y: -totalTransformDistance / 2
            }
        },
        {
            key: 'HAMBURGER_PLANO',
            Icon: IMG_PLANO,
            onPress: () => {},
            disabled: true,
            enabled: false,
            transformLeftSide: {
                x: totalTransformDistance * 0.8660254037844386,
                y: totalTransformDistance / 2
            },
            transformRightSide: {
                x: -totalTransformDistance * 0.8660254037844386,
                y: totalTransformDistance / 2
            }
        },
        {
            key: 'HAMBURGER_SKU',
            Icon: IMG_SKU,
            enabled: canPlaceOrder,
            onPress: () => {
                setIsOpened(false)
                Instrumentation.reportMetric('Orderade hamburger option clicked: HAMBURGER_SKU', 1)
                // reset hamburger position before leaving the page
                // but not letting the user to see the flicker
                setTimeout(() => {
                    setHamburgerPosition(null)
                }, 300)
                navigation.navigate('ProductSellingScreen', {
                    store,
                    isFromCompletedVisit
                })
            },
            transformLeftSide: {
                x: 0,
                y: totalTransformDistance
            },
            transformRightSide: {
                x: 0,
                y: totalTransformDistance
            }
        }
    ]
    useEffect(() => {
        Animated.timing(animationProgress, {
            toValue: isOpened ? 1 : 0,
            duration: 200,
            useNativeDriver: false
        }).start()
    }, [isOpened])

    let minHeight = insets.top + awayFromRoot + hamburgerChildrenInnerSize
    let maxHeight = height - insets.bottom - awayFromRoot - hamburgerChildrenInnerSize - HAMBURGER_ICON_SIZE
    // if we have onDragRelease, then the hamburger is attached on sales action panel
    // we need to adjust y range because of offset top
    if (onDragRelease) {
        minHeight = minHeight - initialOffsetTop
        maxHeight = maxHeight - initialOffsetTop
    }

    const _onDragRelease = (e: GestureResponderEvent) => {
        const { pageX, pageY, locationX, locationY } = e.nativeEvent
        curPosition.current = {
            x: pageX - locationX,
            y: pageY - locationY
        }
    }
    const getIconStyle = (enabled: boolean, disabled: boolean) => {
        if (!enabled) {
            return baseStyle.color.liteGrey
        }
        if (disabled) {
            return baseStyle.color.black
        }
        return baseStyle.color.purple
    }
    const Root = isOpened ? IMG_CLOSE : IMG_HAMBURGER
    return (
        <>
            {isOpened && (
                <TouchableOpacity
                    style={[styles.overlay, { top: onDragRelease ? -initialOffsetTop * 2 : 0 }]}
                    onPressIn={() => {
                        setIsOpened(false)
                    }}
                />
            )}
            <Draggable
                x={x}
                y={y}
                z={5}
                minX={0}
                minY={minHeight}
                maxX={width - floatIconSize}
                maxY={maxHeight}
                renderSize={floatIconSize}
                isCircle
                disabled={isOpened}
                onDragRelease={(e) => {
                    _onDragRelease(e)
                    onDragRelease && onDragRelease(e)
                }}
                onPressOut={() => {
                    setIsOpened(false)
                }}
            >
                <View style={[styles.dialWrap]}>
                    <Root
                        height={floatIconSize}
                        width={floatIconSize}
                        onPress={() => {
                            setIsOpened(!isOpened)
                        }}
                        style={[styles.dialRoot]}
                    />

                    {DraggableHamburgerOptions.map((El) => {
                        const transformUsing =
                            curPosition.current.x + 120 > width ? 'transformRightSide' : 'transformLeftSide'
                        const myStyle = {
                            ...styles.dialChildren,
                            transform: [
                                {
                                    translateX: animationProgress.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1, El[transformUsing].x]
                                    })
                                },
                                {
                                    translateY: animationProgress.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, El[transformUsing].y]
                                    })
                                }
                            ]
                        }
                        const disabled = El.disabled || disabledOption === El.key
                        const enabled = El.enabled
                        const iconStyle = {
                            color: getIconStyle(enabled, disabled),
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 1,
                            shadowRadius: 4,
                            shadowColor: baseStyle.color.modalBlack
                        } as ViewStyle
                        const _onPress = () => {
                            !disabled && enabled && isOpened && El.onPress()
                        }
                        return (
                            <TouchableOpacity key={El.key} onPress={_onPress}>
                                <Animated.View style={myStyle}>
                                    <El.Icon style={iconStyle} />
                                </Animated.View>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </Draggable>
        </>
    )
}

export default DraggableHamburger

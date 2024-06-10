/**
 * @description PickerModal component.
 * @author Beichen Li
 * @email beichen.a.li@pwc.com
 * @date 2021-08-24
 */

import React, { FC, useRef, useEffect } from 'react'
import {
    TouchableOpacity,
    TouchableWithoutFeedback,
    StyleSheet,
    Modal,
    Animated,
    Easing,
    Image,
    View
} from 'react-native'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import CText from '../../../../common/components/CText'

interface DropDownModalProps {
    list?: any
    visible?: boolean
    handleClick?: any
    setDropDownVisible?: any
    fromSchedule?: boolean
    needTriangle?: boolean
}

const styles = StyleSheet.create({
    dropdownBackground: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99
    },
    dropWrap: {
        position: 'absolute',
        zIndex: 99,
        top: 110,
        right: 20,
        height: 0
    },
    wrap: {
        paddingLeft: 15,
        paddingRight: 10,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        backgroundColor: '#fff',
        marginBottom: 10,
        paddingVertical: 12,
        borderRadius: 20,
        justifyContent: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10,
        alignSelf: 'flex-end',
        flexDirection: 'row'
    },
    fzStyle: {
        fontWeight: '700',
        fontSize: 12,
        textAlign: 'right',
        lineHeight: 18
    },
    plusView: {
        marginLeft: 10
    },
    plusImg: {
        width: 18,
        height: 18
    },
    triangle: {
        position: 'absolute',
        top: 104,
        right: 25,
        width: 20,
        height: 20,
        backgroundColor: 'white',
        transform: [
            {
                rotate: '45deg'
            }
        ],
        zIndex: 10
    },
    triangleShadow: {
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4
    },
    triangleZIndex: {
        zIndex: 200
    },
    dropWrapTri: {
        position: 'absolute',
        zIndex: 99,
        top: 110,
        right: 10,
        height: 0,
        width: 200,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        borderRadius: 4
    },
    wrapTri: {
        paddingVertical: 18
    },
    fzStyleTri: {
        fontWeight: '700',
        fontSize: 12,
        textAlign: 'left',
        lineHeight: 18
    }
})

const ANIMATION_DURATION = 300
const ZERO = 0
const DropDownModal: FC<DropDownModalProps> = (props: DropDownModalProps) => {
    const { list, visible, handleClick, setDropDownVisible, fromSchedule, needTriangle } = props
    const animatedController = useRef(new Animated.Value(0)).current
    const containerHeight = animatedController.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 100]
    })
    const imgHeight = animatedController.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 18]
    })
    const containerWithTriangleHeight = animatedController.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 75]
    })
    const containerOpacity = animatedController.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
    })
    const slideOut = () => {
        Animated.timing(animatedController, {
            toValue: 0,
            useNativeDriver: false,
            duration: ANIMATION_DURATION,
            easing: Easing.inOut(Easing.linear)
        }).start()
    }
    useEffect(() => {
        if (visible) {
            Animated.timing(animatedController, {
                toValue: 1,
                useNativeDriver: false,
                duration: ANIMATION_DURATION,
                easing: Easing.inOut(Easing.linear)
            }).start()
        } else {
            slideOut()
        }
    }, [visible])
    const hideDropDown = () => {
        slideOut()
        const timeoutId = setTimeout(() => {
            setDropDownVisible(false)
            clearTimeout(timeoutId)
        }, ZERO)
    }
    return (
        <Modal visible={visible} transparent>
            <TouchableOpacity
                onPress={() => {
                    hideDropDown()
                }}
                style={[styles.dropdownBackground, fromSchedule && { top: 60 }]}
                activeOpacity={1}
            >
                {needTriangle && (
                    <>
                        <Animated.View style={[{ opacity: containerOpacity }]}>
                            <View style={[styles.triangle, styles.triangleShadow]} />
                        </Animated.View>
                        <View style={[styles.triangle, styles.triangleZIndex]} />
                    </>
                )}
                <TouchableWithoutFeedback>
                    <Animated.View
                        style={[
                            needTriangle ? styles.dropWrapTri : styles.dropWrap,
                            needTriangle
                                ? { height: containerWithTriangleHeight, opacity: containerOpacity }
                                : { height: containerHeight }
                        ]}
                    >
                        {list.map((val, index) => {
                            return (
                                <TouchableOpacity
                                    key={val + needTriangle}
                                    style={[needTriangle ? styles.wrapTri : styles.wrap]}
                                    onPress={() => {
                                        slideOut()
                                        handleClick(index)
                                    }}
                                >
                                    {needTriangle ? (
                                        <CText numberOfLines={1} adjustsFontSizeToFit style={styles.fzStyleTri}>
                                            {val}
                                        </CText>
                                    ) : (
                                        <>
                                            <CText style={styles.fzStyle}>{val}</CText>
                                            <Animated.View style={[styles.plusView, { height: imgHeight }]}>
                                                <Image style={styles.plusImg} source={ImageSrc.ICON_ADD} />
                                            </Animated.View>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )
                        })}
                    </Animated.View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    )
}

export default DropDownModal

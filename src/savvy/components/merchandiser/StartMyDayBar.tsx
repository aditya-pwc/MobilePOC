/**
 * @description A bar to let the user click to start the day
 * @author Christopher Zang, Shangmin Dou
 * @email jiahua.zang@pwc.com shangmin.dou@pwc.com
 * @date 2021-03-22
 * @LastModifiedDate 2021-03-22 First Commit
 */
import React, { useRef } from 'react'
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native'
import Utils from '../../common/DateTimeUtils'
import CText from '../../../common/components/CText'
import { CommonParam } from '../../../common/CommonParam'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import { t } from '../../../common/i18n/t'

const OPACITY_BACKGROUND = 'rgba(255, 255, 255, 0.3)'
const styles = StyleSheet.create({
    containerStyle: {
        backgroundColor: '#6217B9',
        height: 44,
        width: 'auto',
        borderColor: '#FFF',
        borderWidth: 1,
        justifyContent: 'flex-start',
        borderRadius: 5,
        marginRight: Utils.isTablet ? 80 : 22,
        marginLeft: Utils.isTablet ? 80 : 22
    },
    titleStyle: {
        fontFamily: 'Gotham-Bold',
        color: '#FFF',
        // color: "#00A2D9",
        textTransform: 'uppercase',
        fontSize: 12,
        width: 100
    },
    absoluteFill: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    disable: {
        backgroundColor: 'rgb(211, 211, 211)'
    },
    buttonBaseStyle: {
        position: 'absolute',
        backgroundColor: '#6217B9',
        width: 0,
        height: 0,
        borderWidth: 20,
        borderLeftWidth: 20
    },
    buttonBackground: {
        borderColor: OPACITY_BACKGROUND,
        borderLeftColor: '#6217B9'
    },
    opacityBackground: {
        borderColor: '#6217B9',
        borderLeftColor: OPACITY_BACKGROUND
    },
    actionText: {
        alignSelf: 'center',
        position: 'absolute',
        top: '30%',
        width: 150
    }
})
interface StartMyDayBarProps {
    onStart
    disabled?
}

const StartMyDayBar = (props: StartMyDayBarProps) => {
    let isStarted = false
    const { dropDownRef } = useDropDown()
    const animation = useRef(new Animated.Value(0)).current
    const width = animation.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp'
    })

    const { onStart, disabled } = props

    const handlePress = () => {
        if (disabled) {
            return
        }
        if (CommonParam.isSyncing) {
            dropDownRef.current.alertWithType('info', 'Sync up in progress, please try later')
        } else {
            if (isStarted) {
                return
            }
            isStarted = true
            Animated.timing(animation, {
                toValue: 100,
                useNativeDriver: false,
                duration: 2000
            }).start()
            onStart()
            setTimeout(() => {
                isStarted = false
            }, 2000)
        }
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={[styles.containerStyle, disabled && styles.disable]}>
                <Animated.View
                    style={[
                        styles.absoluteFill,
                        {
                            position: 'relative',
                            height: 44,
                            opacity: 0.3,
                            overflow: 'hidden',
                            backgroundColor: '#FFF',
                            width
                        }
                    ]}
                >
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBackground,
                            styles.buttonBaseStyle,
                            {
                                left: 0
                            }
                        ]}
                    />
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBaseStyle,
                            styles.opacityBackground,
                            {
                                left: 20
                            }
                        ]}
                    />
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBackground,
                            styles.buttonBaseStyle,
                            {
                                left: 40
                            }
                        ]}
                    />
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBaseStyle,
                            styles.opacityBackground,
                            {
                                left: 60
                            }
                        ]}
                    />
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBackground,
                            styles.buttonBaseStyle,
                            {
                                left: 80
                            }
                        ]}
                    />
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBaseStyle,
                            styles.opacityBackground,
                            {
                                left: 100
                            }
                        ]}
                    />
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBackground,
                            styles.buttonBaseStyle,
                            {
                                left: 120
                            }
                        ]}
                    />
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBaseStyle,
                            styles.opacityBackground,
                            {
                                left: 140
                            }
                        ]}
                    />
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBackground,
                            styles.buttonBaseStyle,
                            {
                                left: 160
                            }
                        ]}
                    />
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBaseStyle,
                            styles.opacityBackground,
                            {
                                left: 180
                            }
                        ]}
                    />
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBackground,
                            styles.buttonBaseStyle,
                            {
                                left: 200
                            }
                        ]}
                    />
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBaseStyle,
                            styles.opacityBackground,
                            {
                                left: 220
                            }
                        ]}
                    />
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBackground,
                            styles.buttonBaseStyle,
                            {
                                left: 240
                            }
                        ]}
                    />
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBaseStyle,
                            styles.opacityBackground,
                            {
                                left: 260
                            }
                        ]}
                    />
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBackground,
                            styles.buttonBaseStyle,
                            {
                                left: 280
                            }
                        ]}
                    />
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBaseStyle,
                            styles.opacityBackground,
                            {
                                left: 300
                            }
                        ]}
                    />
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBackground,
                            styles.buttonBaseStyle,
                            {
                                left: 320
                            }
                        ]}
                    />
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBaseStyle,
                            styles.opacityBackground,
                            {
                                left: 340
                            }
                        ]}
                    />
                    <View
                        style={[
                            styles.absoluteFill,
                            styles.buttonBackground,
                            styles.buttonBaseStyle,
                            {
                                left: 360
                            }
                        ]}
                    />
                </Animated.View>
                <CText style={[styles.actionText, styles.titleStyle]}>{t.labels.PBNA_MOBILE_START_DAY}</CText>
            </View>
        </TouchableOpacity>
    )
}

export default StartMyDayBar

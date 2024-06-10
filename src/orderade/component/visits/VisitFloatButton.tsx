/**
 * @description Float Button to Show more actions.
 * @date 2021-03-22
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 */
import React, { useState } from 'react'
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import CText from '../../../common/components/CText'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { NavigationProp } from '@react-navigation/native'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'

const styles = StyleSheet.create({
    overlayStyle: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        backgroundColor: 'transparent'
    },
    addVisitContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#F2F4F7',
        borderRadius: 19.5,
        shadowColor: '#004C97',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1
    },
    logTimeContainer: {},
    addVisitText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000'
    },
    complete: {
        backgroundColor: 'rgb(242, 244, 247)'
    },
    plusText: {
        marginLeft: 10,
        fontSize: 18,
        fontWeight: '700'
    },
    flexEnd: {
        alignItems: 'flex-end'
    },
    circleOutline: {
        width: 36,
        height: 36
    },
    plusIcon: {
        marginLeft: 10,
        width: 16,
        height: 16
    },
    marginTop7: {
        marginTop: 7
    },
    container: {
        justifyContent: 'flex-end',
        flexDirection: 'column',
        position: 'absolute',
        right: 22,
        top: 53
    },
    marginTop10: {
        marginTop: 10
    }
})

interface VisitFloatButtonProps {
    navigation: NavigationProp<any>
    dayStart: boolean
    onPressClock: Function
    inClockStart: boolean
    timeRangeIndex: number
    showButton: boolean
    onPlusButtonPress: Function
}
const VisitFloatButton = (props: VisitFloatButtonProps) => {
    const { dayStart, onPressClock, inClockStart, timeRangeIndex, showButton, navigation, onPlusButtonPress } = props

    const [showMoreButtons, setShowMoreButtons] = useState(false)

    const handlePressClock = () => {
        setShowMoreButtons(false)
        onPressClock()
    }

    const handleShowMoreButtons = () => {
        onPlusButtonPress()
        setShowMoreButtons(true)
    }

    const handlePressAddVisit = () => {
        navigation.navigate('AddNewVisitScreen')
        setShowMoreButtons(false)
    }

    const reset = () => {
        setShowMoreButtons(false)
    }

    return (
        <View
            style={[
                styles.overlayStyle,
                {
                    display: showButton ? 'flex' : 'none'
                }
            ]}
            pointerEvents="box-none"
        >
            {showMoreButtons && <TouchableOpacity activeOpacity={1} style={styles.overlayStyle} onPress={reset} />}

            <View style={styles.container}>
                <View style={styles.flexEnd}>
                    {showMoreButtons && (
                        <TouchableOpacity onPress={() => setShowMoreButtons(false)}>
                            <Image
                                style={styles.circleOutline}
                                source={require('../../../../assets/image/ios-close-circle-outline-white.png')}
                            />
                        </TouchableOpacity>
                    )}
                    {!showMoreButtons && timeRangeIndex === 0 && (
                        <TouchableOpacity
                            onPress={() => {
                                handleShowMoreButtons()
                            }}
                        >
                            <Image style={styles.circleOutline} source={ImageSrc.IMG_ICON_ADD} />
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.flexEnd}>
                    {showMoreButtons && dayStart && !inClockStart && (
                        <TouchableOpacity
                            style={[styles.marginTop10, commonStyle.flexDirectionRow]}
                            onPress={() => {
                                handlePressClock()
                            }}
                        >
                            <View style={styles.addVisitContainer}>
                                <CText style={styles.addVisitText}>{t.labels.PBNA_MOBILE_LOG_TIME}</CText>
                                <Image style={styles.plusIcon} source={ImageSrc.IMG_ICON_PLUS} />
                            </View>
                        </TouchableOpacity>
                    )}
                    {showMoreButtons && (
                        <TouchableOpacity
                            style={styles.marginTop7}
                            onPress={() => {
                                handlePressAddVisit()
                            }}
                        >
                            <View style={styles.addVisitContainer}>
                                <CText style={styles.addVisitText}>
                                    {t.labels.PBNA_MOBILE_ORDER_VISIT.toUpperCase()}
                                </CText>
                                <Image style={styles.plusIcon} source={ImageSrc.IMG_ICON_PLUS} />
                            </View>
                        </TouchableOpacity>
                    )}
                    {showMoreButtons && (
                        <TouchableOpacity
                            style={styles.marginTop7}
                            onPress={() => {
                                // handlePressClock()
                            }}
                        >
                            <View style={styles.addVisitContainer}>
                                <CText style={styles.addVisitText}>
                                    {t.labels.PBNA_MOBILE_MERCH_VISIT.toUpperCase()}
                                </CText>
                                <Image style={styles.plusIcon} source={ImageSrc.IMG_ICON_PLUS} />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    )
}

export default VisitFloatButton

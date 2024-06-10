/*
 * @Author:  yuan yue
 * @Date: 2021-09-06 17:52:48
 * @LastEditTime: 2023-05-29 13:49:27
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Description: ProgressBar
 * @FilePath: /Halo_Mobile/src/components/manager/Copilot/ProgressBar.tsx
 */

import React, { FC, useRef, useState } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { renderProgressBarPopover } from '../ProgressBar'
import CText from '../../../../../common/components/CText'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { t } from '../../../../../common/i18n/t'
import { defineProgressBarForm } from '../../../../helper/manager/AllManagerMyDayHelper'
import { getPortraitModeScreenWidthAndHeight } from '../../../../../common/utils/CommonUtils'

const ARROW = require('../../../../../../assets/image/chevron-right.png')
const screenWidth = getPortraitModeScreenWidthAndHeight().width
const WLR = screenWidth / 428
const ProgressBarWidth = 384 * WLR

interface SDLProgressBarProps {
    popoverUnit?: string
    remain: number
    showRightView?: boolean
    showRedBar?: boolean
    showBlueBar?: boolean
    barTitle: string
    plannedValue: string
    progress: number
    showArrow?: boolean
    navigation?: any
    isDollar?: boolean
}

const styles = StyleSheet.create({
    container: {
        width: screenWidth,
        marginTop: 30
    },

    titleContainer: {
        width: screenWidth - 44,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        height: 36,
        justifyContent: 'space-between'
    },
    rightView: {
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderColor: baseStyle.color.LightBlue
    },
    rightViewWrap: {
        position: 'absolute',
        top: 0,
        height: 11
    },
    flex_1: {
        flex: 1
    },
    textWeight_700: {
        fontWeight: baseStyle.fontWeight.fw_700
    },
    textWhiteColor: {
        color: baseStyle.color.white
    },
    textGreyColor: {
        color: baseStyle.color.borderGray
    },
    textSize_14: {
        fontSize: 14
    },
    textSize_12: {
        fontSize: 12
    },
    barContainer: {
        backgroundColor: baseStyle.color.white,
        width: ProgressBarWidth,
        borderRadius: 5.5,
        overflow: 'hidden',
        height: 11,
        position: 'relative'
    },
    greenBar: {
        height: 11,
        backgroundColor: baseStyle.color.loadingGreen,
        borderWidth: 1,
        borderColor: baseStyle.color.white,
        maxWidth: ProgressBarWidth
    },
    overflowBar: {
        height: 11,
        borderTopRightRadius: 5.5,
        borderBottomRightRadius: 5.5,
        borderWidth: 1,
        borderLeftWidth: 0,
        borderColor: baseStyle.color.white
    },
    redColor: {
        backgroundColor: baseStyle.color.red
    },
    blueColor: {
        backgroundColor: baseStyle.color.tabBlue
    },
    PopoverPositionView: {
        width: 1,
        height: 10,
        top: 3,
        backgroundColor: 'transparent',
        position: 'absolute',
        zIndex: 2000000
    },
    barArrowStyle: {
        width: 18,
        height: 19,
        marginLeft: 24.5
    },
    progressBox: { flexDirection: 'row', alignSelf: 'flex-end', justifyContent: 'flex-end', alignItems: 'center' },
    planBox: { alignSelf: 'flex-end', justifyContent: 'space-between', alignItems: 'flex-end' },
    barView: { height: 11, position: 'relative' }
})

// UI PASS RATIO
const blackLineScaleVal = 0.8854

const SDLProgressBar: FC<SDLProgressBarProps> = (props: SDLProgressBarProps) => {
    const ProgressBarRef = useRef(null)
    const RightProgressBarRef = useRef(null)
    const [isVisible, setIsVisible] = useState(false)
    const [isRightVisible, setIsRightVisible] = useState(false)
    const {
        barTitle,
        plannedValue,
        progress,
        showRightView,
        showBlueBar,
        showRedBar,
        remain,
        popoverUnit = '',
        showArrow,
        navigation,
        isDollar
    } = props

    const { greenBarWidth, greenBarBorderRadius, overflowBarWidth } = defineProgressBarForm(
        showRightView,
        ProgressBarWidth,
        blackLineScaleVal,
        progress
    )

    const showPopover = () => {
        setIsVisible(true)
    }

    const showRightPopover = () => {
        setIsRightVisible(true)
    }

    const closePopover = () => {
        setIsVisible(false)
    }

    const closeRightPopover = () => {
        setIsRightVisible(false)
    }

    const goToBreakdown = () => {
        if (barTitle === t.labels.PBNA_MOBILE_WORK_ORDERS) {
            navigation.navigate('CopilotWorkOrder')
            return
        }
        if (barTitle !== t.labels.PBNA_MOBILE_COPILOT_MILEAGE.toLocaleUpperCase()) {
            return false
        }

        navigation.navigate('MileageBreakdown')
    }

    const renderPopover = () => {
        if (isDollar) {
            return (
                <>
                    {renderProgressBarPopover(
                        ProgressBarRef,
                        t.labels.PBNA_MOBILE_COPILOT_ACTUAL,
                        '$1400',
                        t.labels.PBNA_MOBILE_COPILOT_PLANNED,
                        '$1000',
                        closePopover,
                        isVisible
                    )}
                    {renderProgressBarPopover(
                        RightProgressBarRef,
                        t.labels.PBNA_MOBILE_COPILOT_ACTUAL,
                        '$1400',
                        t.labels.PBNA_MOBILE_COPILOT_PLANNED,
                        '$1000',
                        closeRightPopover,
                        isRightVisible
                    )}
                </>
            )
        }
        return (
            <>
                {renderProgressBarPopover(
                    ProgressBarRef,
                    t.labels.PBNA_MOBILE_COPILOT_INDEX,
                    Math.floor(progress * 100) + '',
                    t.labels.PBNA_MOBILE_COPILOT_REMAINING,
                    `${remain} ${popoverUnit}`,
                    closePopover,
                    isVisible
                )}
                {renderProgressBarPopover(
                    RightProgressBarRef,
                    t.labels.PBNA_MOBILE_COPILOT_INDEX,
                    Math.floor(progress * 100) + '',
                    t.labels.PBNA_MOBILE_COPILOT_REMAINING,
                    `${remain} ${popoverUnit}`,
                    closeRightPopover,
                    isRightVisible
                )}
            </>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <View style={styles.flex_1}>
                    <CText style={[styles.textSize_12, styles.textWhiteColor, styles.textWeight_700]}>{barTitle}</CText>
                </View>

                <View style={[styles.flex_1, styles.progressBox]}>
                    <View style={styles.planBox}>
                        <CText style={[styles.textSize_12, styles.textGreyColor]}>
                            vs {t.labels.PBNA_MOBILE_COPILOT_PLANNED}
                        </CText>
                        <CText style={[styles.textSize_14, styles.textGreyColor, styles.textWeight_700]}>
                            {plannedValue}
                        </CText>
                    </View>
                    <TouchableOpacity />
                    {showArrow && (
                        <TouchableOpacity onPress={goToBreakdown} hitSlop={commonStyle.hitSlop}>
                            <Image source={ARROW} style={[styles.barArrowStyle]} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.barContainer}>
                <TouchableOpacity onPress={showPopover} style={[styles.barView, { width: greenBarWidth }]}>
                    <View style={[styles.greenBar, { width: greenBarWidth, borderRadius: greenBarBorderRadius }]} />
                </TouchableOpacity>
                <View ref={ProgressBarRef} style={[styles.PopoverPositionView, { left: greenBarWidth - 1 }]} />

                {showRightView && progress > 1 && (
                    <>
                        <TouchableOpacity
                            onPress={showRightPopover}
                            style={[
                                styles.rightViewWrap,
                                {
                                    width: overflowBarWidth,
                                    left: greenBarWidth
                                }
                            ]}
                        >
                            <View style={styles.rightView}>
                                {showRedBar && progress > 1 && (
                                    <View style={[styles.overflowBar, styles.redColor, { width: overflowBarWidth }]} />
                                )}
                                {showBlueBar && progress > 1 && (
                                    <View style={[styles.overflowBar, styles.blueColor, { width: overflowBarWidth }]} />
                                )}
                            </View>
                        </TouchableOpacity>
                        <View
                            ref={RightProgressBarRef}
                            style={[styles.PopoverPositionView, { left: overflowBarWidth + greenBarWidth }]}
                        />
                    </>
                )}
            </View>

            {renderPopover()}
        </View>
    )
}

export default SDLProgressBar

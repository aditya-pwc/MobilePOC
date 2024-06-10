/*
 * @Author:  yuan yue
 * @Date: 2021-09-06 17:52:48
 * @LastEditTime: 2023-05-29 13:49:06
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Description: ProgressBar
 * @FilePath: /Halo_Mobile/src/components/manager/Copilot/ProgressBar.tsx
 */

import React, { FC, useState, useRef } from 'react'
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native'
import Popover, { PopoverPlacement } from 'react-native-popover-view'
import CText from '../../../../common/components/CText'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { t } from '../../../../common/i18n/t'
import { defineProgressBarForm } from '../../../helper/manager/AllManagerMyDayHelper'
import { getPortraitModeScreenWidthAndHeight } from '../../../../common/utils/CommonUtils'

const ARROW = require('../../../../../assets/image/chevron-right.png')
const screenWidth = getPortraitModeScreenWidthAndHeight().width
const WLR = screenWidth / 428
const ProgressBarWidth = 384 * WLR
interface ProgressBarProps {
    popoverUnit?: string
    remain: number
    showRightView: boolean
    showRedBar?: boolean
    showBlueBar?: boolean
    barTitle: string
    actualValue: string
    plannedValue: string
    progress: number
    showArrow: boolean
    navigation?: any
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
        position: 'absolute',
        right: 0,
        height: 11,
        width: 44,
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderColor: baseStyle.color.white
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
    popoverTitleColor: {
        color: baseStyle.color.titleGray
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
        height: 11
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
    popover: {
        flexDirection: 'row',
        maxWidth: screenWidth,
        height: 60,
        borderRadius: 6,
        borderColor: baseStyle.color.white,
        paddingHorizontal: 15,
        paddingVertical: 12,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowColor: baseStyle.color.tabShadowBlue,
        shadowOpacity: 0.3
    },
    PopoverPositionView: {
        width: 3,
        height: 5,
        top: 3,
        backgroundColor: 'transparent',
        position: 'absolute'
    },
    arrowStyle: {
        width: 15,
        height: 13
    },
    indexStyle: {
        width: 78,
        height: 36,
        borderRightWidth: StyleSheet.hairlineWidth,
        borderColor: baseStyle.color.white
    },
    RemainingStyle: {
        height: 36,
        marginLeft: 19
    },
    lineHeight_18: {
        lineHeight: 18
    },
    barArrowStyle: {
        width: 18,
        height: 19,
        marginLeft: 24.5
    },
    progressBox: { flexDirection: 'row', alignSelf: 'flex-end', justifyContent: 'flex-end', alignItems: 'center' },
    planBox: { alignSelf: 'flex-end', justifyContent: 'space-between', alignItems: 'flex-end' }
})

// UI PASS RATIO
const blackLineScaleVal = 0.8854

export const renderProgressBarPopover = (
    from: any,
    progressTitle: string,
    progress: string,
    remainTitle: string,
    remain: string,
    onRequestClose: Function,
    isVisible = false
) => {
    return (
        <Popover
            isVisible={isVisible}
            placement={PopoverPlacement.TOP}
            arrowStyle={styles.arrowStyle}
            from={from}
            backgroundStyle={commonStyle.transparentBG}
            onRequestClose={() => {
                onRequestClose()
            }}
        >
            <View style={styles.popover}>
                <View style={styles.indexStyle}>
                    <CText style={[styles.textSize_12, styles.popoverTitleColor, styles.lineHeight_18]}>
                        {progressTitle}
                    </CText>
                    <CText style={[styles.textSize_14, styles.textWeight_700, styles.lineHeight_18]}>{progress}</CText>
                </View>
                <View style={styles.RemainingStyle}>
                    <CText style={[styles.textSize_12, styles.popoverTitleColor, styles.lineHeight_18]}>
                        {remainTitle}
                    </CText>
                    <CText style={[styles.textSize_14, styles.textWeight_700, styles.lineHeight_18]}>{remain}</CText>
                </View>
            </View>
        </Popover>
    )
}

const ProgressBar: FC<ProgressBarProps> = (props: ProgressBarProps) => {
    const ProgressBarRef = useRef(null)
    const [isVisible, setIsVisible] = useState(false)
    const {
        barTitle,
        actualValue,
        plannedValue,
        progress,
        showRightView,
        showBlueBar,
        showRedBar,
        remain,
        popoverUnit = '',
        showArrow,
        navigation
    } = props

    const { greenBarWidth, leftPosition, greenBarBorderRadius, overflowBarWidth } = defineProgressBarForm(
        showRightView,
        ProgressBarWidth,
        blackLineScaleVal,
        progress
    )

    const showPopover = () => {
        setIsVisible(true)
    }

    const closePopover = () => {
        setIsVisible(false)
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

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <View style={styles.flex_1}>
                    <CText style={[styles.textSize_12, styles.textWhiteColor, styles.textWeight_700]}>{barTitle}</CText>
                </View>

                <View style={[styles.flex_1, { alignItems: 'center' }]}>
                    <View>
                        <CText style={[styles.textSize_12, styles.textGreyColor]}>
                            {t.labels.PBNA_MOBILE_COPILOT_ACTUAL}
                        </CText>
                        <CText style={[styles.textSize_14, styles.textWhiteColor, styles.textWeight_700]}>
                            {actualValue}
                        </CText>
                    </View>
                </View>

                <View style={[styles.flex_1, styles.progressBox]}>
                    <View style={styles.planBox}>
                        <CText style={[styles.textSize_12, styles.textGreyColor]}>
                            {t.labels.PBNA_MOBILE_COPILOT_PLANNED}
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
                <TouchableOpacity onPress={showPopover}>
                    <>
                        <View style={[styles.greenBar, { width: greenBarWidth, borderRadius: greenBarBorderRadius }]} />
                        {showRightView && (
                            <View style={styles.rightView}>
                                {showRedBar && progress > 1 && (
                                    <View style={[styles.overflowBar, styles.redColor, { width: overflowBarWidth }]} />
                                )}
                                {showBlueBar && progress > 1 && (
                                    <View style={[styles.overflowBar, styles.blueColor, { width: overflowBarWidth }]} />
                                )}
                            </View>
                        )}
                        <View ref={ProgressBarRef} style={[styles.PopoverPositionView, { left: leftPosition }]} />
                    </>
                </TouchableOpacity>
            </View>
            {renderProgressBarPopover(
                ProgressBarRef,
                t.labels.PBNA_MOBILE_COPILOT_INDEX,
                Math.floor(progress * 100) + '',
                t.labels.PBNA_MOBILE_COPILOT_REMAINING,
                `${remain} ${popoverUnit}`,
                closePopover,
                isVisible
            )}
        </View>
    )
}

export default ProgressBar

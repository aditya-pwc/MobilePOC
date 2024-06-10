/*
 * @Author: Yuan Yue
 * @Date: 2021-09-06 17:52:48
 * @LastEditTime: 2023-08-21 16:58:10
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Description: SDLCopilotPerformance in Copilot page
 * @FilePath: /Halo_Mobile/src/components/manager/Copilot/SDLCopilotPerformance.tsx
 */

import React, { FC, useEffect, useImperativeHandle, useState } from 'react'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import CText from '../../../../../common/components/CText'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import {
    getParamsDay,
    getPepsiCoPeriodCalendar,
    getCurrentPeriod,
    PerformanceIcon
} from '../../../merchandiser/MyPerformance'
import { t } from '../../../../../common/i18n/t'
import { existParamsEmpty } from '../../../../api/ApiUtil'
import { getSDLCopilotASASMetrics } from '../../../../helper/manager/AllManagerMyDayHelper'
import { getPortraitModeScreenWidthAndHeight } from '../../../../../common/utils/CommonUtils'

const screenWidth = getPortraitModeScreenWidthAndHeight().width
const WLR = screenWidth / 428
interface TeamPerformanceProps {
    cRef: any
    title: string
    navigation: any
    onPress: () => void
    weekTitle: string
    selectedTerritoryId: any
}

const styles = StyleSheet.create({
    container: {
        width: screenWidth - 44 * WLR,
        marginHorizontal: 22,
        paddingTop: 30
    },
    performanceHeaderView: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    performanceHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 16
    },
    performanceHeaderLeft: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '700'
    },
    triangleDown: {
        marginTop: 5,
        marginLeft: 10,
        width: 10,
        height: 5
    },
    triangleText: {
        fontSize: 14,
        color: '#fff'
    },
    performanceProgressView: {
        marginBottom: 40
    },
    cardContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 30
    },
    cardView: {
        width: (screenWidth - 52) / 2,
        height: 100,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 6
    },
    textWeight_700: {
        fontWeight: '700'
    },
    textWhiteColor: {
        color: '#fff'
    },

    textGreyColor: {
        color: '#565656'
    },
    textSize_16: {
        fontSize: 16
    },
    textSize_12: {
        fontSize: 12
    },
    cardBottomView: {
        flexDirection: 'row',
        marginTop: 16
    },
    flex_1: {
        flex: 1
    },
    flex_direction_row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    ArrowPFImg: {
        marginLeft: 5
    }
})

export const DEFAULT_TARGET = 99

export interface ASASMetrics {
    decActualValue: number
    decTargetValueOfASAS: number
    intOrderDay: number
    intDeliveryDay: number
}

export const initResData: ASASMetrics = {
    decActualValue: 0,
    decTargetValueOfASAS: DEFAULT_TARGET,
    intOrderDay: 0,
    intDeliveryDay: 0
}

const SDLCopilotPerformance: FC<TeamPerformanceProps> = (props: TeamPerformanceProps) => {
    const { title, onPress, weekTitle, cRef, navigation, selectedTerritoryId } = props
    const [periodCalendar, setPeriodCalendar] = useState([])
    const [resData, setResData] = useState(initResData)
    const [performanceTitle, setPerformanceTitle] = useState(t.labels.PBNA_MOBILE_WEEK_TO_DATE)

    const getPerformanceWithNet = (selectPerformance, periodData) => {
        const startDay = getParamsDay(selectPerformance, periodData, getCurrentPeriod).firstDay
        const endDay = getParamsDay(selectPerformance, periodData, getCurrentPeriod).secondDay
        if (existParamsEmpty([startDay, endDay, selectedTerritoryId])) {
            setResData(initResData)
            return
        }
        getSDLCopilotASASMetrics(startDay, endDay, setResData, selectedTerritoryId)
    }

    useImperativeHandle(cRef, () => ({
        onChangeSelectPerformance: (type) => {
            setPerformanceTitle(type)
            getPerformanceWithNet(type, periodCalendar)
        },

        pullToRefreshData: () => {
            getPerformanceWithNet(performanceTitle, periodCalendar)
        }
    }))

    useEffect(() => {
        getPepsiCoPeriodCalendar().then((result: any[]) => {
            setPeriodCalendar(result)
            getPerformanceWithNet(performanceTitle, result)
        })
    }, [])

    useEffect(() => {
        getPerformanceWithNet(performanceTitle, periodCalendar)
    }, [selectedTerritoryId])

    return (
        <View style={styles.container}>
            <View style={styles.performanceHeaderView}>
                <CText style={styles.performanceHeaderLeft}>{title}</CText>
                <TouchableOpacity style={styles.performanceHeaderRight} onPress={onPress}>
                    <CText style={styles.triangleText}> {weekTitle}</CText>
                    <Image style={styles.triangleDown} source={ImageSrc.IMG_TRIANGLE} />
                </TouchableOpacity>
            </View>

            <View style={styles.cardContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('SDLASASPage', { selectedTerritoryId })}>
                    <PerformanceIcon
                        fromMM
                        sectionTitle={t.labels.PBNA_MOBILE_COPILOT_ASAS}
                        leftTitle={t.labels.PBNA_MOBILE_TARGET}
                        rightTitle={t.labels.PBNA_MOBILE_COPILOT_ACTUAL}
                        leftValue={Math.round(resData?.decTargetValueOfASAS || DEFAULT_TARGET)}
                        rightValue={Math.round(resData?.decActualValue || 0)}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('SDLOffSchedulePage', { selectedTerritoryId })}>
                    <PerformanceIcon
                        fromMM
                        sectionTitle={t.labels.PBNA_MOBILE_OFF_SCHEDULE_WTD}
                        leftTitle={t.labels.PBNA_MOBILE_DELIVERY_DAY}
                        rightTitle={t.labels.PBNA_MOBILE_ORDER_DAY}
                        leftValue={Math.round(resData?.intDeliveryDay || 0)}
                        rightValue={Math.round(resData?.intOrderDay || 0)}
                    />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default SDLCopilotPerformance

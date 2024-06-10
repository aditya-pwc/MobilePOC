/*
 * @Author: Yuan Yue
 * @Date: 2021-09-06 17:52:48
 * @LastEditTime: 2023-05-29 13:49:39
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Description: MMCopilotPerformance in Copilot page
 * @FilePath: /Halo_Mobile/src/components/manager/Copilot/MMCopilotPerformance.tsx
 */

import React, { FC, useEffect, useImperativeHandle, useState } from 'react'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import CText from '../../../../common/components/CText'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import {
    getParamsDay,
    getPepsiCoPeriodCalendar,
    PerformanceIcon,
    getCurrentPeriod
} from '../../merchandiser/MyPerformance'
import { CommonParam } from '../../../../common/CommonParam'
import { convertMileData, convertMileUnit } from '../../common/UnitUtils'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import ProgressBar from './ProgressBar'
import { t } from '../../../../common/i18n/t'
import { existParamsEmpty } from '../../../api/ApiUtil'
import { Constants } from '../../../../common/Constants'
import { getMangerCopilotPerformance } from '../../../helper/manager/AllManagerMyDayHelper'
import { getPortraitModeScreenWidthAndHeight } from '../../../../common/utils/CommonUtils'

const screenWidth = getPortraitModeScreenWidthAndHeight().width
const WLR = screenWidth / 428
interface TeamPerformanceProps {
    cRef: any
    title: string
    navigation: any
    onPress: () => void
    weekTitle: string
}

const styles = StyleSheet.create({
    container: {
        width: screenWidth - 44 * WLR,
        marginHorizontal: 22,
        paddingTop: 30,
        marginBottom: 40
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
        marginTop: -10
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

const initResData = {
    amasActual: 0,
    amasTarget: 99,
    gapActual: 0,
    gapTarget: 0,
    hoursActual: 0,
    hoursPlanned: 0,
    taskActual: 0,
    taskPlanned: 0,
    visitsActual: 0,
    visitsPlanned: 0,
    drivenPlanned: 0,
    drivenActual: 0
}

const MMCopilotPerformance: FC<TeamPerformanceProps> = (props: TeamPerformanceProps) => {
    const { title, onPress, weekTitle, cRef, navigation } = props
    const [periodCalendar, setPeriodCalendar] = useState([])
    const [resData, setResData] = useState(initResData)
    const { dropDownRef } = useDropDown()
    const [performanceTitle, setPerformanceTitle] = useState(t.labels.PBNA_MOBILE_WEEK_TO_DATE)

    const getPerformanceWithNet = (selectPerformance, periodData) => {
        const firstDay = getParamsDay(selectPerformance, periodData, getCurrentPeriod).firstDay
        const secondDay = getParamsDay(selectPerformance, periodData, getCurrentPeriod).secondDay
        if (existParamsEmpty([firstDay, secondDay, CommonParam.userLocationId])) {
            return
        }
        getMangerCopilotPerformance(firstDay, secondDay, setResData, dropDownRef)
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

    const getProgress = (actual, planned) => {
        actual = actual == null ? 0 : actual
        planned = planned == null ? 0 : planned
        if (planned === 0) {
            return { index: 0, remain: 0 }
        }
        const remain = planned - actual < 0 ? 0 : planned - actual
        return { index: Math.floor((actual / planned) * 100) / 100, remain: remain }
    }

    return (
        <View style={styles.container}>
            <View style={styles.performanceHeaderView}>
                <CText style={styles.performanceHeaderLeft}>{title}</CText>
                <TouchableOpacity style={styles.performanceHeaderRight} onPress={onPress}>
                    <CText style={styles.triangleText}> {weekTitle}</CText>
                    <Image style={styles.triangleDown} source={ImageSrc.IMG_TRIANGLE} />
                </TouchableOpacity>
            </View>

            <View style={styles.performanceProgressView}>
                {/* <ProgressBar showRightView showRedBar
                    progress={getProgress(resData.hoursActual, resData.hoursPlanned).index}
                    remain={getProgress(resData.hoursActual, resData.hoursPlanned).remain}
                    barTitle={t.labels.PBNA_MOBILE_HOURS.toLocaleUpperCase()}
                    showArrow
                    navigation={navigation}
                    actualValue={`${resData.hoursActual}${t.labels.PBNA_MOBILE_HRS}`}
                    popoverUnit={t.labels.PBNA_MOBILE_HR}
                    plannedValue={`${resData.hoursPlanned}${t.labels.PBNA_MOBILE_HRS}`}
                /> */}
                <ProgressBar
                    showRightView
                    showBlueBar
                    progress={getProgress(resData.visitsActual, resData.visitsPlanned).index}
                    remain={getProgress(resData.visitsActual, resData.visitsPlanned).remain}
                    popoverUnit={t.labels.PBNA_MOBILE_VISITS.toLocaleLowerCase()}
                    showArrow={false}
                    navigation={navigation}
                    barTitle={t.labels.PBNA_MOBILE_VISITS}
                    actualValue={`${resData.visitsActual}`}
                    plannedValue={`${resData.visitsPlanned}`}
                />
                <ProgressBar
                    showRightView={false}
                    progress={getProgress(resData.taskActual, resData.taskPlanned).index}
                    remain={getProgress(resData.taskActual, resData.taskPlanned).remain}
                    showArrow
                    navigation={navigation}
                    barTitle={t.labels.PBNA_MOBILE_WORK_ORDERS}
                    actualValue={`${resData.taskActual}`}
                    plannedValue={`${resData.taskPlanned}`}
                />
                <ProgressBar
                    showRightView
                    showRedBar
                    progress={getProgress(resData.drivenActual, resData.drivenPlanned).index}
                    popoverUnit={convertMileUnit(t.labels.PBNA_MOBILE_MI_UNIT, t.labels.PBNA_MOBILE_KM_UNIT)}
                    showArrow
                    navigation={navigation}
                    remain={
                        getProgress(convertMileData(resData.drivenActual), convertMileData(resData.drivenPlanned))
                            .remain
                    }
                    barTitle={t.labels.PBNA_MOBILE_COPILOT_MILEAGE.toLocaleUpperCase()}
                    actualValue={`${convertMileData(resData.drivenActual)}`}
                    plannedValue={`${convertMileData(resData.drivenPlanned)}`}
                />
            </View>

            <View style={styles.cardContainer}>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('AMASPage')
                    }}
                >
                    <PerformanceIcon
                        fromMM
                        sectionTitle={t.labels.PBNA_MOBILE_COPILOT_AMAS}
                        leftTitle={t.labels.PBNA_MOBILE_TARGET}
                        rightTitle={t.labels.PBNA_MOBILE_COPILOT_ACTUAL}
                        index={0}
                        leftValue={resData.amasTarget || 99}
                        rightValue={resData.amasActual || 0}
                        defaultTarget={'0'}
                    />
                </TouchableOpacity>
                <PerformanceIcon
                    fromMM
                    sectionTitle={t.labels.PBNA_MOBILE_COPILOT_GAP_TIME_TITLE}
                    leftTitle={t.labels.PBNA_MOBILE_TARGET}
                    rightTitle={t.labels.PBNA_MOBILE_COPILOT_ACTUAL}
                    index={1}
                    leftValue={resData.gapTarget || Constants.LESS_10}
                    rightValue={resData.gapActual || 0}
                />
            </View>
        </View>
    )
}

export default MMCopilotPerformance

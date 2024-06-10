/*
 * @Author: Yuan Yue
 * @Date: 2021-10-14 15:56:21
 * @LastEditTime: 2022-11-16 15:25:37
 * @LastEditors: Mary Qian
 * @Description: In User Settings Edit
 * @FilePath: /Halo_Mobile/src/components/manager/Copilot/mileage-breakdown/PerformanceCard.tsx
 */

import React, { FC, useEffect, useImperativeHandle, useState } from 'react'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import CText from '../../../../../common/components/CText'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { getParamsDay, getPepsiCoPeriodCalendar, getCurrentPeriod } from '../../../merchandiser/MyPerformance'
import { CommonParam } from '../../../../../common/CommonParam'
import { restApexCommonCall } from '../../../../api/SyncUtils'
import moment from 'moment'
import { convertMileData, convertMileUnit } from '../../../common/UnitUtils'
import { useDropDown } from '../../../../../common/contexts/DropdownContext'
import { CommonApi } from '../../../../../common/api/CommonApi'
import { t } from '../../../../../common/i18n/t'
import ProgressBar from '../ProgressBar'
import { Log } from '../../../../../common/enums/Log'
import { ARROW_TYPE } from '../../../../enums/MerchandiserEnums'
import ICON_ARROW_GREEN from '../../../../../../assets/image/arrow_green.svg'
import { getStringValue } from '../../../../utils/LandingUtils'
import { existParamsEmpty } from '../../../../api/ApiUtil'
import _ from 'lodash'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { getPortraitModeScreenWidthAndHeight } from '../../../../../common/utils/CommonUtils'

const screenWidth = getPortraitModeScreenWidthAndHeight().width
// 428 is UI design width
const WLR = screenWidth / 428
interface PerformanceCardProps {
    cRef: any
    navigation: any
    onPress: () => void
    weekTitle: string
    from?: string
}

const styles = StyleSheet.create({
    containerBox: {
        width: '100%',
        height: 166,
        backgroundColor: '#004C97'
    },
    container: {
        width: screenWidth - 44 * WLR,
        marginHorizontal: 22,
        paddingTop: 25
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
    },
    bottomLine: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    BottomLeftTitle: {
        fontSize: 20,
        color: '#fff',
        fontWeight: '700'
    },
    arrowImg: {
        width: 10,
        height: 10,
        marginLeft: 5,
        color: '#2DD36F'
    },
    arrowRed: {
        width: 10,
        height: 10,
        marginLeft: 5,
        color: '#EB445A'
    },
    arrowRot180: {
        transform: [{ rotateX: '180deg' }]
    },
    lastContain: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5
    },
    BottomRightTop: {
        marginTop: 5
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
    drivenActual: 0,
    actualADAS: 0,
    targetADAS: 98,
    actualManifest: 0,
    targetManifest: 90,
    actualHours: 0,
    targetHours: 0
}
const fromRemain = true

const PerformanceCard: FC<PerformanceCardProps> = (props: PerformanceCardProps) => {
    const { onPress, weekTitle, cRef, navigation, from } = props
    const [periodCalendar, setPeriodCalendar] = useState([])
    const [resData, setResData] = useState(initResData)
    const [performanceTitle, setPerformanceTitle] = useState(weekTitle)
    const [cardTitle, setCardTitle] = useState('')
    const { dropDownRef } = useDropDown()
    const [arrowType, setArrowType] = useState(ARROW_TYPE.HIDDEN)
    const [actualData, setActualData] = useState(null)
    const [targetData, setTargetDate] = useState(null)

    const getPerformanceWithNet = (selectPerformance, periodData) => {
        const firstDay = getParamsDay(selectPerformance, periodData, getCurrentPeriod).firstDay
        const secondDay = getParamsDay(selectPerformance, periodData, getCurrentPeriod).secondDay
        setCardTitle(
            `${moment(_.isEmpty(firstDay) ? moment() : firstDay).format('MMM Do')} - ${moment(
                _.isEmpty(secondDay) ? moment() : secondDay
            ).format('MMM Do')}`
        )
        const interfaceName = from
            ? CommonApi.PBNA_MOBILE_API_GET_DEL_SUP_BOX_INFO
            : CommonApi.PBNA_MOBILE_API_PERFORMANCE
        if (existParamsEmpty([CommonParam.userLocationId, firstDay, secondDay])) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'getPerformanceWithNet',
                `${interfaceName} error: params are empty, stop calling the api.`
            )
            return
        }
        restApexCommonCall(`${interfaceName}/${CommonParam.userLocationId}&${firstDay}&${secondDay}`, 'GET')
            .then((res) => {
                const resultData = JSON.parse(res.data.replace(/null/g, 0) || {})
                setResData(resultData)
            })
            .catch((err) => {
                dropDownRef.current.alertWithType('error', t.labels.PBNA_MOBILE_GET_TEAM_PERFORMANCE, err)
                storeClassLog(Log.MOBILE_ERROR, 'getPerformanceWithNet.restApexCommonCall', getStringValue(err))
            })
    }

    useImperativeHandle(cRef, () => ({
        onChangeSelectPerformance: (type) => {
            setPerformanceTitle(type)
            getPerformanceWithNet(type, periodCalendar)
        }
    }))

    useEffect(() => {
        getPepsiCoPeriodCalendar().then((result: any[]) => {
            setPeriodCalendar(result)
            getPerformanceWithNet(performanceTitle, result)
        })
    }, [])
    useEffect(() => {
        if (from === 'adas') {
            setActualData(resData.actualADAS)
            setTargetDate(resData.targetADAS)
        } else if (from === 'manifest') {
            setActualData(resData.actualManifest)
            setTargetDate(resData.targetManifest)
        }
    }, [resData])

    useEffect(() => {
        if (from) {
            let type = ARROW_TYPE.HIDDEN // Default
            switch (from) {
                case 'adas': {
                    // ADAS
                    if (targetData <= actualData) {
                        type = ARROW_TYPE.GREEN_UP
                    } else {
                        type = ARROW_TYPE.RED_DOWN
                    }
                    break
                }
                case 'manifest': {
                    // MC
                    if (targetData > actualData) {
                        type = ARROW_TYPE.RED_DOWN
                    } else if (targetData <= actualData) {
                        type = ARROW_TYPE.GREEN_UP
                    }
                    break
                }
                case 'hours': {
                    // HOURS
                    if (targetData < actualData) {
                        type = ARROW_TYPE.RED_UP
                    } else if (targetData >= actualData) {
                        type = ARROW_TYPE.GREEN_DOWN
                    }
                    break
                }
                default:
                    break
            }
            setArrowType(type)
        }
    }, [weekTitle, actualData, targetData])

    const getProgress = (responseData, fromRemainFlag?) => {
        let actual, planned
        if (from === 'hours') {
            actual = responseData.actualHours
            planned = responseData.targetHours
        } else if (fromRemainFlag && !from) {
            actual = convertMileData(responseData.drivenActual)
            planned = convertMileData(responseData.drivenPlanned)
        } else {
            actual = responseData.drivenActual
            planned = responseData.drivenPlanned
        }
        actual = actual == null ? 0 : actual
        planned = planned == null ? 0 : planned
        if (planned === 0) {
            return { index: 0, remain: 0 }
        }
        const remain = planned - actual < 0 ? 0 : planned - actual
        return { index: Math.floor((actual / planned) * 100) / 100, remain: remain }
    }

    return (
        <View style={styles.containerBox}>
            <View style={styles.container}>
                <View style={styles.performanceHeaderView}>
                    <CText style={styles.performanceHeaderLeft}>{cardTitle}</CText>
                    <TouchableOpacity style={styles.performanceHeaderRight} onPress={onPress}>
                        <CText style={styles.triangleText}> {weekTitle}</CText>
                        <Image style={styles.triangleDown} source={ImageSrc.IMG_TRIANGLE} />
                    </TouchableOpacity>
                </View>
                {(!from || from === 'hours') && (
                    <View>
                        <ProgressBar
                            showRightView
                            showRedBar
                            progress={getProgress(resData).index}
                            popoverUnit={
                                from === 'hours'
                                    ? t.labels.PBNA_MOBILE_HRS
                                    : convertMileUnit(t.labels.PBNA_MOBILE_MI_UNIT, t.labels.PBNA_MOBILE_KM_UNIT)
                            }
                            showArrow={false}
                            navigation={navigation}
                            remain={getProgress(resData, fromRemain).remain}
                            barTitle={
                                from === 'hours'
                                    ? t.labels.PBNA_MOBILE_HOURS.toLocaleUpperCase()
                                    : t.labels.PBNA_MOBILE_COPILOT_MILEAGE.toLocaleUpperCase()
                            }
                            actualValue={
                                from === 'hours'
                                    ? `${resData.actualHours} ${t.labels.PBNA_MOBILE_HRS}`
                                    : `${convertMileData(resData.drivenActual)}`
                            }
                            plannedValue={
                                from === 'hours'
                                    ? `${resData.targetHours} ${t.labels.PBNA_MOBILE_HRS}`
                                    : `${convertMileData(resData.drivenPlanned)}`
                            }
                        />
                    </View>
                )}
                {(from === 'adas' || from === 'manifest') && (
                    <View style={styles.bottomLine}>
                        <View>
                            <CText style={styles.triangleText}>{t.labels.PBNA_MOBILE_COPILOT_ACTUAL}</CText>
                            <View style={styles.lastContain}>
                                <CText style={styles.BottomLeftTitle}>{`${actualData}%`}</CText>
                                {arrowType === ARROW_TYPE.GREEN_UP && <ICON_ARROW_GREEN style={styles.arrowImg} />}
                                {arrowType === ARROW_TYPE.GREEN_DOWN && (
                                    <ICON_ARROW_GREEN style={[styles.arrowImg, styles.arrowRot180]} />
                                )}
                                {arrowType === ARROW_TYPE.RED_UP && <ICON_ARROW_GREEN style={styles.arrowRed} />}
                                {arrowType === ARROW_TYPE.RED_DOWN && (
                                    <ICON_ARROW_GREEN style={[styles.arrowRed, styles.arrowRot180]} />
                                )}
                            </View>
                        </View>
                        <View>
                            <CText style={styles.triangleText}>{t.labels.PBNA_MOBILE_TARGET}</CText>
                            <CText style={[styles.BottomLeftTitle, styles.BottomRightTop]}>{`${targetData}%`}</CText>
                        </View>
                    </View>
                )}
            </View>
        </View>
    )
}

export default PerformanceCard

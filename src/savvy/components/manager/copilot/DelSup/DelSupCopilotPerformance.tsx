/*
 * @Author: Yuan Yue
 * @Date: 2021-09-06 17:52:48
 * @LastEditTime: 2022-07-06 10:33:18
 * @LastEditors: Matthew Huang
 * @Description: DelSupCopilotPerformance in Copilot page
 */

import React, { FC, useEffect, useImperativeHandle, useState } from 'react'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import CText from '../../../../../common/components/CText'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import {
    getParamsDay,
    getPepsiCoPeriodCalendar,
    getCurrentPeriod,
    styles as performanceStyles
} from '../../../merchandiser/MyPerformance'
import { CommonParam } from '../../../../../common/CommonParam'
import { restApexCommonCall } from '../../../../api/SyncUtils'
import { useDropDown } from '../../../../../common/contexts/DropdownContext'
import { CommonApi } from '../../../../../common/api/CommonApi'
import { t } from '../../../../../common/i18n/t'
import { ARROW_TYPE } from '../../../../enums/MerchandiserEnums'
import ICON_ARROW_GREEN from '../../../../../../assets/image/arrow_green.svg'
import { useIsFocused } from '@react-navigation/native'
import { existParamsEmpty } from '../../../../api/ApiUtil'
import { getPortraitModeScreenWidthAndHeight } from '../../../../../common/utils/CommonUtils'

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
    ...performanceStyles,
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
    performanceContain: {
        width: screenWidth - 44,
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginTop: 13,
        marginBottom: 40
    },
    latestContain: {
        flexDirection: 'row',
        marginTop: 'auto',
        paddingBottom: 10
    },
    performanceTitle: {
        fontSize: 12,
        alignSelf: 'flex-start',
        fontWeight: '700',
        color: '#000000',
        marginLeft: 15,
        marginRight: 5,
        marginTop: 15
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
    rotate180: {
        transform: [{ rotateX: '180deg' }]
    }
})

const PerformanceIcon = ({ sectionTitle, leftTitle, rightTitle, index, leftValue, rightValue }: any) => {
    let type = ARROW_TYPE.HIDDEN // Default
    switch (index) {
        case 0: {
            // ADAS
            if (leftValue <= rightValue) {
                type = ARROW_TYPE.GREEN_UP
            } else {
                type = ARROW_TYPE.RED_DOWN
            }
            break
        }
        case 1: {
            // MC
            if (leftValue > rightValue) {
                type = ARROW_TYPE.RED_DOWN
            } else if (leftValue <= rightValue) {
                type = ARROW_TYPE.GREEN_UP
            }
            break
        }
        case 2: {
            // HOURS
            if (leftValue < rightValue) {
                type = ARROW_TYPE.RED_UP
            } else if (leftValue >= rightValue) {
                type = ARROW_TYPE.GREEN_DOWN
            }
            break
        }
        default:
            break
    }

    const latestContain = (title, subtitle, arrowType) => {
        return (
            <View style={styles.latestView}>
                <CText style={styles.leftTitle}>{title}</CText>
                <View style={styles.lastContain}>
                    <CText style={styles.latestStr}>{subtitle}</CText>
                    {arrowType === ARROW_TYPE.GREEN_UP && <ICON_ARROW_GREEN style={styles.arrowImg} />}
                    {arrowType === ARROW_TYPE.GREEN_DOWN && (
                        <ICON_ARROW_GREEN style={[styles.arrowImg, styles.rotate180]} />
                    )}
                    {arrowType === ARROW_TYPE.RED_UP && <ICON_ARROW_GREEN style={styles.arrowRed} />}
                    {arrowType === ARROW_TYPE.RED_DOWN && (
                        <ICON_ARROW_GREEN style={[styles.arrowRed, styles.rotate180]} />
                    )}
                </View>
            </View>
        )
    }

    const renderContain = () => (
        <>
            {latestContain(leftTitle, leftValue, ARROW_TYPE.HIDDEN)}
            {latestContain(rightTitle, rightValue, type)}
        </>
    )

    return (
        <View style={styles.iconContain} key={index}>
            <CText style={styles.performanceTitle}>{sectionTitle}</CText>
            <View style={styles.latestContain}>{renderContain()}</View>
        </View>
    )
}

const initResData = {
    targetADAS: 0,
    actualADAS: 0,
    targetManifest: 0,
    actualManifest: 0,
    targetHours: 0,
    actualHours: 0
}

const DelSupCopilotPerformance: FC<TeamPerformanceProps> = (props: TeamPerformanceProps) => {
    const { title, onPress, weekTitle, cRef, navigation } = props
    const [periodCalendar, setPeriodCalendar] = useState([])
    const [resData, setResData] = useState(initResData)
    const { dropDownRef } = useDropDown()
    const [performanceTitle, setPerformanceTitle] = useState(t.labels.PBNA_MOBILE_WEEK_TO_DATE)
    const isFocused = useIsFocused()

    const getPerformanceWithNet = (selectPerformance, periodData) => {
        const firstDay = getParamsDay(selectPerformance, periodData, getCurrentPeriod).firstDay
        const secondDay = getParamsDay(selectPerformance, periodData, getCurrentPeriod).secondDay
        if (existParamsEmpty([CommonParam.userLocationId, firstDay, secondDay])) {
            return
        }
        restApexCommonCall(
            `${CommonApi.PBNA_MOBILE_API_GET_DEL_SUP_BOX_INFO}/${CommonParam.userLocationId}&${firstDay}&${secondDay}`,
            'GET'
        )
            .then((res) => {
                const resultData = JSON.parse(res.data.replace(/null/g, 0) || {})
                setResData(resultData)
            })
            .catch((err) => {
                dropDownRef.current.alertWithType('error', t.labels.PBNA_MOBILE_GET_TEAM_PERFORMANCE_DETAILS, err)
            })
    }
    const gotoPerformanceDetail = (flag) => {
        navigation.navigate('MileageBreakdown', {
            from: flag,
            weekTitle: flag === 'hours' ? '' : weekTitle
        })
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
    }, [isFocused])

    return (
        <View style={styles.container}>
            <View style={styles.performanceHeaderView}>
                <CText style={styles.performanceHeaderLeft}>{title}</CText>
                <TouchableOpacity style={styles.performanceHeaderRight} onPress={onPress}>
                    <CText style={styles.triangleText}> {weekTitle}</CText>
                    <Image style={styles.triangleDown} source={ImageSrc.IMG_TRIANGLE} />
                </TouchableOpacity>
            </View>
            <View style={styles.performanceContain}>
                <TouchableOpacity
                    onPress={() => {
                        gotoPerformanceDetail('adas')
                    }}
                >
                    <PerformanceIcon
                        sectionTitle={t.labels.PBNA_MOBILE_COPILOT_ADAS}
                        leftTitle={t.labels.PBNA_MOBILE_TARGET}
                        rightTitle={t.labels.PBNA_MOBILE_COPILOT_ACTUAL}
                        index={0}
                        leftValue={resData.targetADAS || 99}
                        rightValue={resData.actualADAS || 0}
                        defaultTarget={'0'}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        gotoPerformanceDetail('manifest')
                    }}
                >
                    <PerformanceIcon
                        sectionTitle={t.labels.PBNA_MOBILE_COPILOT_MANIFEST_COMPLIANCE}
                        leftTitle={t.labels.PBNA_MOBILE_TARGET}
                        rightTitle={t.labels.PBNA_MOBILE_COPILOT_ACTUAL}
                        index={1}
                        leftValue={resData.targetManifest || 0}
                        rightValue={resData.actualManifest || 0}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        gotoPerformanceDetail('hours')
                    }}
                >
                    <PerformanceIcon
                        sectionTitle={t.labels.PBNA_MOBILE_COPILOT_HOURS}
                        leftTitle={t.labels.PBNA_MOBILE_TARGET}
                        rightTitle={t.labels.PBNA_MOBILE_COPILOT_ACTUAL}
                        index={2}
                        leftValue={resData.targetHours || 0}
                        rightValue={resData.actualHours || 0}
                    />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default DelSupCopilotPerformance

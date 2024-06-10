/*
 * @Author: Ma Jiajun
 * @Date: 2022-09-16
 * @Description: Optimized Visit Metrics card
 * @FilePath: /Halo_Mobile/src/components/manager/schedule/OptimizedVisitsCard.tsx
 */

import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { t } from '../../../../common/i18n/t'
import CText from '../../../../common/components/CText'
import { OptimizedVisitMetricQuery } from '../../../queries/ScheduleQuery'
import _ from 'lodash'
import { SoupService } from '../../../service/SoupService'
import ArrowUp from '../../../../../assets/image/arrow_green.svg'
import { useIsFocused } from '@react-navigation/native'
import { decryptWithString } from '../../../utils/Aes'
import { Log } from '../../../../common/enums/Log'
import { getAveragePayRate, getAmount, groupAndSumVisitMetric } from '../helper/OptimizedVisitHelper'
import ImageClock from '../../../../../assets/image/icon_clock.svg'
import ImageDollar from '../../../../../assets/image/icon_dollar.svg'
import ImageCalender from '../../../../../assets/image/icon-opt-calender.svg'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'
import { getPortraitModeScreenWidthAndHeight } from '../../../../common/utils/CommonUtils'

const screenWidth = getPortraitModeScreenWidthAndHeight().width
const styles = StyleSheet.create({
    fontSize_700: {
        fontWeight: '700'
    },
    optimizedVisitsCardWrap: {
        marginHorizontal: 25,
        marginBottom: 20,
        paddingVertical: 15,
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: '#fff',
        borderColor: '#D3D3D3',
        position: 'relative'
    },
    flexRow: {
        flexDirection: 'row'
    },
    marginTop10: {
        marginTop: 10
    },
    colorGray: {
        color: baseStyle.color.titleGray
    },
    colorLiteGrey: {
        color: baseStyle.color.cGray
    },
    fontSize16: {
        fontSize: 16
    },
    marginTop3: {
        marginTop: 4
    },
    spaceCenter: {
        justifyContent: 'center'
    },
    colorRed: {
        color: baseStyle.color.red
    },
    colorGreen: {
        color: baseStyle.color.loadingGreen
    },
    size12: {
        fontSize: 12,
        marginTop: 5
    },
    arrow: {
        marginLeft: 4,
        marginTop: 7
    },
    arrowUp: {
        marginLeft: 6,
        marginTop: 5,
        color: baseStyle.color.red
    },
    arrowDown: {
        marginLeft: 6,
        marginTop: 5,
        color: baseStyle.color.loadingGreen,
        transform: [{ rotate: '180deg' }]
    },
    marginTop15: {
        marginTop: 15
    },
    wrapText: {
        maxWidth: 100,
        textAlign: 'center'
    },
    infoSvg: { width: 18, height: 18, marginTop: -5 },
    lineView: {
        height: 110,
        borderWidth: 0.5,
        borderColor: baseStyle.color.cGray
    },
    size10: {
        fontSize: 10,
        marginTop: 10
    },
    flexStart: {
        justifyContent: 'flex-start'
    },
    flexRowNoMargin: {
        display: 'flex',
        flexDirection: 'row',
        fontSize: 12,
        alignItems: 'flex-end'
    },
    clockIcon: {
        transform: [{ rotateY: '180deg' }]
    },
    marRight5: {
        marginRight: 5
    },
    marHor15: {
        marginLeft: 10
    },
    paddingLeft15: {
        paddingLeft: 15
    },
    allowFlexWrap: {
        flexShrink: 1
    },
    marginTop16: {
        marginTop: 16
    },
    marginTop12: {
        marginTop: 12
    },
    cardColumnWidth: {
        width: (screenWidth - 52) / 3
    },
    fontSize12: {
        fontSize: 12,
        marginBottom: 15
    },
    heightForOPTVisit: {
        height: 30
    },
    heightForTitle: {
        height: 15
    }
})

interface IProps {
    visitListId: string
}

const OptimizedVisitsCard = (props: IProps) => {
    const { visitListId } = props
    // add function maybe add back in future
    // const [addedMetric, setAddedMetric] = useState({ count: 0, duration: 0, cost: 0 })
    const [removedMetric, setRemovedMetric] = useState({ count: 0, duration: 0, cost: 0 })
    const [deltaMetric, setDeltaMetric] = useState({ count: 0, duration: 0, cost: 0 })
    const isFocused = useIsFocused()

    const componentVisit = async (addedVisits, removedVisits) => {
        try {
            const visits = addedVisits.concat(removedVisits)
            const averageHourPayRate = await getAveragePayRate()
            visits.forEach((visit) => {
                // visits added and removed by DF duration all calculated in backend now
                visit.visitDuration = visit.Planned_Duration_Minutes__c

                if (visit.payRateHourly) {
                    visit.payRateHourlyNumber = _.toNumber(decryptWithString(visit.payRateHourly))
                } else {
                    visit.payRateHourlyNumber = averageHourPayRate
                }

                visit.forecastCost = Math.round((visit.visitDuration / 60) * visit.payRateHourlyNumber)
            })
        } catch (error) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'OptimizedVisitsCard.OptimizedVisitsCard',
                'OptimizedVisitsCard Error: ' + getStringValue(error)
            )
        }
    }

    const getVisitList = async () => {
        const [addSql, f] = OptimizedVisitMetricQuery('add', visitListId)
        const [removeSql] = OptimizedVisitMetricQuery('remove', visitListId)
        const addedVisitListPromise = SoupService.retrieveDataFromSoup('Visit', {}, f, addSql)
        const removedVisitListPromise = SoupService.retrieveDataFromSoup('Visit', {}, f, removeSql)
        Promise.all([addedVisitListPromise, removedVisitListPromise])
            .then(async (values) => {
                const addedVisits = values[0]
                const removedVisits = values[1]
                await componentVisit(addedVisits, removedVisits)
                // const addedVisitMetric = groupAndSumVisitMetric(addedVisits)
                const removedVisitMetric = groupAndSumVisitMetric(removedVisits)
                // setAddedMetric(addedVisitMetric)
                setRemovedMetric(removedVisitMetric)
                setDeltaMetric({
                    count: 0 - removedVisitMetric.count,
                    duration: (0 - removedVisitMetric.duration * 10) / 10,
                    cost: 0 - removedVisitMetric.cost
                })
            })
            .catch((error) => {
                storeClassLog(Log.MOBILE_ERROR, 'OptimizedVisitsCard.getVisitList', getStringValue(error))
            })
    }

    useEffect(() => {
        getVisitList()
        getAveragePayRate()
    }, [isFocused])
    return (
        <View style={styles.optimizedVisitsCardWrap}>
            <View style={[styles.flexRow, styles.spaceCenter, styles.heightForOPTVisit]}>
                <CText style={[styles.fontSize_700, styles.fontSize12]}>
                    {t.labels.PBNA_MOBILE_OPTIMIZED_VISITS.toLocaleUpperCase()}
                </CText>
            </View>
            <View style={[styles.flexRow]}>
                <View style={[styles.marginTop10, styles.flexRow, styles.cardColumnWidth, styles.paddingLeft15]}>
                    <View>
                        <View style={[styles.flexRowNoMargin]}>
                            <ImageCalender style={[styles.clockIcon, styles.marRight5]} />
                            <CText style={[styles.fontSize_700, styles.size12, styles.heightForTitle]}>
                                {t.labels.PBNA_MOBILE_VISITS.toLocaleUpperCase()}
                            </CText>
                        </View>
                        {/* <CText style={[styles.colorGray, styles.size12, styles.marginTop16]}>{_.capitalize(t.labels.PBNA_MOBILE_ADDED)}</CText>
                        <CText style={[styles.fontSize_700, styles.size12]}>{addedMetric.count} {t.labels.PBNA_MOBILE_VISITS.toLocaleLowerCase()}</CText> */}
                        <CText style={[styles.colorGray, styles.size12, styles.marginTop12]}>
                            {_.capitalize(t.labels.PBNA_MOBILE_REMOVED)}
                        </CText>
                        <CText style={[styles.fontSize_700, styles.size12, styles.colorRed]}>
                            {removedMetric.count} {t.labels.PBNA_MOBILE_VISITS.toLocaleLowerCase()}
                        </CText>
                        <View style={[styles.flexRow, styles.marginTop15, styles.allowFlexWrap]}>
                            <CText
                                style={[
                                    styles.fontSize16,
                                    styles.fontSize_700,
                                    deltaMetric.count >= 0 ? styles.colorRed : styles.colorGreen
                                ]}
                                numberOfLines={2}
                            >
                                {Math.abs(deltaMetric.count)} {t.labels.PBNA_MOBILE_VISITS.toLocaleLowerCase()}
                            </CText>
                            {deltaMetric.count >= 0 && <ArrowUp style={styles.arrowUp} />}
                            {deltaMetric.count < 0 && <ArrowUp style={styles.arrowDown} />}
                        </View>
                    </View>
                </View>
                <View style={[styles.marginTop10, styles.flexRow, styles.cardColumnWidth]}>
                    <View style={[styles.lineView]} />
                    <View style={styles.paddingLeft15}>
                        <View style={[styles.flexRowNoMargin]}>
                            <ImageClock style={[styles.clockIcon, styles.marRight5]} />
                            <CText style={[styles.fontSize_700, styles.size12, styles.heightForTitle]}>
                                {t.labels.PBNA_MOBILE_HOURS.toLocaleUpperCase()}
                            </CText>
                        </View>
                        {/* <CText style={[styles.colorGray, styles.size12, styles.marginTop16]}>{_.capitalize(t.labels.PBNA_MOBILE_ADDED)}</CText>
                        <CText style={[styles.fontSize_700, styles.size12]}>{addedMetric.duration} {t.labels.PBNA_MOBILE_HRS}</CText> */}
                        <CText style={[styles.colorGray, styles.size12, styles.marginTop12]}>
                            {_.capitalize(t.labels.PBNA_MOBILE_REMOVED)}
                        </CText>
                        <CText style={[styles.fontSize_700, styles.size12, styles.colorRed]}>
                            {removedMetric.duration} {t.labels.PBNA_MOBILE_HRS}
                        </CText>
                        <View style={[styles.flexRow, styles.marginTop15, styles.allowFlexWrap]}>
                            <CText
                                style={[
                                    styles.fontSize16,
                                    styles.fontSize_700,
                                    deltaMetric.duration >= 0 ? styles.colorRed : styles.colorGreen
                                ]}
                                numberOfLines={2}
                            >
                                {Math.abs(deltaMetric.duration)} {t.labels.PBNA_MOBILE_HRS}
                            </CText>
                            {deltaMetric.duration >= 0 && <ArrowUp style={styles.arrowUp} />}
                            {deltaMetric.duration < 0 && <ArrowUp style={styles.arrowDown} />}
                        </View>
                    </View>
                </View>
                <View style={[styles.marginTop10, styles.flexRow, styles.cardColumnWidth]}>
                    <View style={[styles.lineView]} />
                    <View style={styles.paddingLeft15}>
                        <View style={styles.flexRowNoMargin}>
                            <ImageDollar style={styles.marRight5} />
                            <CText style={[styles.fontSize_700, styles.size12, styles.heightForTitle]}>
                                {t.labels.PBNA_MOBILE_COST.toLocaleUpperCase()}
                            </CText>
                        </View>
                        {/* <CText style={[styles.colorGray, styles.size12, styles.marginTop16]}>{_.capitalize(t.labels.PBNA_MOBILE_ADDED)}</CText>
                        <CText style={[styles.fontSize_700, styles.size12]}>{t.labels.PBNA_MOBILE_ORDER_D}{getAmount(addedMetric.cost)}</CText> */}
                        <CText style={[styles.colorGray, styles.size12, styles.marginTop12]}>
                            {_.capitalize(t.labels.PBNA_MOBILE_REMOVED)}
                        </CText>
                        <CText style={[styles.fontSize_700, styles.size12, styles.colorRed]}>
                            {t.labels.PBNA_MOBILE_ORDER_D}
                            {getAmount(removedMetric.cost)}
                        </CText>
                        <View style={[styles.flexRow, styles.marginTop15, styles.allowFlexWrap]}>
                            <CText
                                style={[
                                    styles.fontSize16,
                                    styles.fontSize_700,
                                    deltaMetric.cost >= 0 ? styles.colorRed : styles.colorGreen
                                ]}
                            >
                                {t.labels.PBNA_MOBILE_ORDER_D}
                                {getAmount(deltaMetric.cost)}
                            </CText>
                            {deltaMetric.cost >= 0 && <ArrowUp style={styles.arrowUp} />}
                            {deltaMetric.cost < 0 && <ArrowUp style={styles.arrowDown} />}
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default OptimizedVisitsCard

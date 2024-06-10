/*
 * @Description:
 * @Author: Kevin Gu
 * @Date: 2021-08-18 04:22:42
 * @LastEditTime: 2022-11-21 14:51:58
 * @LastEditors: Mary Qian
 */
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { getTimeFromMins } from '../../common/DateTimeUtils'
import { isPersonaMD, isPersonaPSR } from '../../../common/enums/Persona'
import { VisitStatus } from '../../enums/Visit'
import { t } from '../../../common/i18n/t'
import CText from '../../../common/components/CText'
import { SalesRepTopLineMetricsProp } from '../sales/my-day/SDLEmployeeSchedule/SalesScheduleTopLineMetrics'
import { isEventItem } from '../../helper/merchandiser/MyVisitDataHelper'
import { commonStyle } from '../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    viewMetricView: {
        zIndex: 100
    },
    address: {
        flexDirection: 'row',
        marginTop: 27,
        justifyContent: commonStyle.justifyContentSB.justifyContent
    },
    addressLabel: {
        color: '#D3D3D3',
        fontSize: 12
    },
    timeRowText: {
        marginTop: 4,
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12
    },
    addressCount: {
        flexDirection: 'row',
        justifyContent: commonStyle.justifyContentSB.justifyContent,
        marginTop: 4
    },
    addressCountText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 18
    },
    timeRow: {
        marginTop: 25,
        flexDirection: 'row',
        justifyContent: commonStyle.justifyContentSB.justifyContent
    },
    timeRowColFirst: {
        flex: 0.33
    },
    timeRowColSecond: {
        flex: 0.33,
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftColor: '#D3D3D3',
        borderLeftWidth: 1,
        borderRightColor: '#D3D3D3',
        borderRightWidth: 1
    },
    timeRowColThird: {
        flex: 0.33,
        justifyContent: 'center',
        alignItems: 'center'
    },
    alignLeft: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingLeft: 20
    }
})

interface TimeInfoProps {
    routeTime: number
    serviceTime: number
    driveTime: number
    routeTimeString?: string
    serviceTimeString?: string
    driveTimeString?: string
}

interface VisitStatusTotal {
    total: number
    completed: number
    remaining: number
}

export interface TodayMetricProps {
    statusTotal: VisitStatusTotal
    timeInfo?: TimeInfoProps
    caseInfo?: SalesRepTopLineMetricsProp
}

export interface TodayMetricFrontProps {
    totalNum: number
    completeNum: number
    remainNum: number
    orderTotalNum: number
    orderCompleteNum: number
}

export const getMetricDataByVisitsInOneVL = (visitInOneVL): TodayMetricProps => {
    const firstVisitInVL = visitInOneVL.find((visit) => !isEventItem(visit)) || {}

    const timeInfo = {
        routeTime: parseInt(firstVisitInVL.Total_Planned_Time__c) || 0,
        serviceTime: parseInt(firstVisitInVL.Planned_Service_Time__c) || 0,
        driveTime: parseInt(firstVisitInVL.Planned_Travel_Time__c) || 0
    }

    let completedVisitCount = 0
    let unCompletedVisitCount = 0
    visitInOneVL.forEach((item) => {
        if (item.Id && !isEventItem(item)) {
            if (item.status === VisitStatus.COMPLETE) {
                completedVisitCount++
            } else {
                unCompletedVisitCount++
            }
        }
    })

    return {
        statusTotal: {
            completed: completedVisitCount,
            total: completedVisitCount + unCompletedVisitCount,
            remaining: unCompletedVisitCount
        },
        timeInfo
    }
}

export const getMetricDataForToday = (dataArray): TodayMetricProps => {
    let completed = 0
    let remaining = 0
    let total = 0
    let routeTime = 0
    let serviceTime = 0
    let driveTime = 0

    dataArray.forEach((vl) => {
        const info: TodayMetricProps = vl.visitListInfo.metricData || {}
        completed += info.statusTotal.completed || 0
        remaining += info.statusTotal.remaining || 0
        total += info.statusTotal.total || 0
        routeTime += info.timeInfo.routeTime
        serviceTime += info.timeInfo.serviceTime
        driveTime += info.timeInfo.driveTime
    })

    return {
        statusTotal: { completed, remaining, total },
        timeInfo: {
            routeTime,
            serviceTime,
            driveTime,
            routeTimeString: getTimeFromMins(routeTime),
            serviceTimeString: getTimeFromMins(serviceTime),
            driveTimeString: getTimeFromMins(driveTime)
        }
    }
}

interface VisitMetricProps {
    metricData: TodayMetricProps
    visitNum: TodayMetricFrontProps
}

const renderMyVisitMetricTime = (timeInfo: TimeInfoProps) => {
    return (
        <View style={styles.timeRow}>
            <View style={styles.timeRowColFirst}>
                <CText style={styles.addressLabel}>{t.labels.PBNA_MOBILE_TOTAL_ROUTE_TIME}</CText>
                <CText style={styles.timeRowText}>{timeInfo.routeTimeString}</CText>
            </View>
            <View style={styles.timeRowColSecond}>
                <CText style={styles.addressLabel}>{t.labels.PBNA_MOBILE_SERVICE_TIME}</CText>
                <CText style={styles.timeRowText}>{timeInfo.serviceTimeString}</CText>
            </View>
            <View style={styles.timeRowColThird}>
                <CText style={[styles.addressLabel, { marginRight: 5 }]}>{t.labels.PBNA_MOBILE_DRIVE_TIME}</CText>
                <CText style={styles.timeRowText}>{timeInfo.driveTimeString}</CText>
            </View>
        </View>
    )
}

export const renderMyVisitMetricCase = (data) => {
    if (!data) {
        return null
    }

    const plannedCases = data.plannedCases ? parseFloat(data.plannedCases) : 0
    const casesSold = data.casesSold ? parseFloat(data.casesSold) : 0

    return (
        <View style={styles.timeRow}>
            <View style={styles.timeRowColFirst}>
                <CText style={styles.addressLabel}>{t.labels.PBNA_MOBILE_PLANNED_CASES}</CText>
                <CText style={styles.timeRowText}>
                    {plannedCases + ` ${t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}`}
                </CText>
            </View>
            <View style={[styles.timeRowColSecond, styles.alignLeft]}>
                <CText style={styles.addressLabel}>{t.labels.PBNA_MOBILE_CASES_SOLD}</CText>
                <CText style={styles.timeRowText}>
                    {casesSold + ` ${t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}`}
                </CText>
            </View>
            <View style={[styles.timeRowColThird, styles.alignLeft]}>
                <CText style={[styles.addressLabel, { marginRight: 5 }]}>{t.labels.PBNA_MOBILE_RETURNS}</CText>
                <CText style={styles.timeRowText}>
                    {(data.returnsCS &&
                        parseFloat(data.returnsCS) + ` ${t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}` + ' ') +
                        (data.returnsUN &&
                            parseFloat(data.returnsUN) + ` ${t.labels.PBNA_MOBILE_ORDER_UN.toLocaleLowerCase()}`) ||
                        '0'}
                </CText>
            </View>
        </View>
    )
}

const VisitMetric = (props: VisitMetricProps) => {
    if (!props || !props.metricData) {
        return null
    }

    const { statusTotal, timeInfo, caseInfo } = props.metricData
    const totalNum = isPersonaPSR() ? props?.visitNum?.totalNum : statusTotal.total
    const completeNum = isPersonaPSR() ? props?.visitNum?.completeNum : statusTotal.completed
    const remainNum = isPersonaPSR() ? props?.visitNum?.remainNum : statusTotal.remaining

    return (
        <View style={styles.viewMetricView}>
            <View style={styles.address}>
                <CText style={styles.addressLabel}>{t.labels.PBNA_MOBILE_TOTAL_VISIT}</CText>
                <CText style={styles.addressLabel}>{t.labels.PBNA_MOBILE_COMPLETED}</CText>
                <CText style={styles.addressLabel}>{t.labels.PBNA_MOBILE_REMAINING}</CText>
            </View>
            <View style={styles.addressCount}>
                <CText style={styles.addressCountText}>{totalNum}</CText>
                <CText style={styles.addressCountText}>{completeNum}</CText>
                <CText style={styles.addressCountText}>{remainNum}</CText>
            </View>
            {isPersonaMD() && renderMyVisitMetricTime(timeInfo)}
            {isPersonaPSR() && renderMyVisitMetricCase(caseInfo)}
        </View>
    )
}

export default VisitMetric

/**
 * @description Visit time and sequence component.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2022-12-22
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { formatClock } from '../../common/DateTimeUtils'
import CText from '../../../common/components/CText'
import { formatWithTimeZone } from '../../utils/TimeZoneUtils'
import { VisitStatus } from '../../enums/Visit'
import { t } from '../../../common/i18n/t'
import _ from 'lodash'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'

const styles = StyleSheet.create({
    timeGapView: {
        height: 40,
        backgroundColor: '#F2F4F7'
    },
    lineView: {
        height: 1,
        marginLeft: 15,
        marginRight: 15,
        backgroundColor: '#FFF'
    },
    timeView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 39,
        alignItems: 'center'
    },
    timeLeftView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    timeLabelMargin: {
        marginLeft: 15
    },
    timeLabel: {
        fontWeight: '400',
        color: '#565656',
        fontSize: 12
    },
    timeLine: {
        width: 1,
        height: 10,
        marginLeft: 5,
        marginRight: 5,
        backgroundColor: '#D3D3D3'
    },
    sequenceView: {
        flexDirection: 'row',
        marginRight: 14,
        alignItems: 'center'
    },
    greenCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 7,
        borderWidth: 1,
        borderColor: '#2DD36F'
    },
    redCircle: {
        borderColor: '#EB445A'
    },
    sequenceText: {
        fontWeight: '700',
        color: '#000',
        fontSize: 12
    }
})
interface VisitTimeAndSequenceInterface {
    item: any
    notShowTimeCard: boolean
    fromEmployeeSchedule: boolean
    isVisitList: boolean
    hideSequence?: boolean
}

const VisitTimeAndSequence = (props: VisitTimeAndSequenceInterface) => {
    const { item, fromEmployeeSchedule, notShowTimeCard, isVisitList, hideSequence } = props
    const startTime = formatWithTimeZone(item.PlannedVisitStartTime, TIME_FORMAT.HHMMA, true, true)
    const plannedDurationMinutes = item.Planned_Duration_Minutes__c || item.PlannedDurationMinutes || 0
    const durationGap = formatClock({
        hour: Math.floor(plannedDurationMinutes >= 60 ? plannedDurationMinutes / 60 : 0),
        min: Math.floor(plannedDurationMinutes % 60)
    })
    if (!notShowTimeCard && fromEmployeeSchedule && (item.ActualVisitStartTime || item.ActualVisitEndTime)) {
        return (
            <View style={styles.timeGapView}>
                {isVisitList && (item.status === VisitStatus.COMPLETE || item.workOrders > 0) && (
                    <View style={styles.lineView} />
                )}
                <View style={styles.timeView}>
                    <View style={styles.timeLeftView}>
                        <CText style={[styles.timeLabel, styles.timeLabelMargin]}>{startTime}</CText>
                        <View style={styles.timeLine} />
                        <CText style={styles.timeLabel}>{durationGap}</CText>
                    </View>
                    {!hideSequence && (
                        <View style={styles.sequenceView}>
                            <CText style={styles.timeLabel}>{t.labels.PBNA_MOBILE_SEQUENCE}</CText>
                            <View
                                style={[styles.greenCircle, item.actualSequence !== item.sequence && styles.redCircle]}
                            >
                                <CText style={styles.sequenceText}>
                                    {!_.isEmpty(item.actualSequence) && item.actualSequence === item.sequence
                                        ? item.actualSequence
                                        : item.sequence}
                                </CText>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        )
    }
    return null
}

export default VisitTimeAndSequence

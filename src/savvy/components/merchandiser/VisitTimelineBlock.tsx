/**
 * @description Visit or store list component.
 * @author Christopher
 * @email jiahua.zang@pwc.com
 * @date 2021-08-06
 */

import React from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { formatClock } from '../../common/DateTimeUtils'
import CText from '../../../common/components/CText'
import ERROR_DELIVERY from '../../../../assets/image/icon-error-visit-list.svg'
import { formatWithTimeZone } from '../../utils/TimeZoneUtils'
import { VisitStatus } from '../../enums/Visit'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'

const styles = StyleSheet.create({
    overLocation: {
        marginRight: 15
    },
    timeGapView: {
        height: 40,
        backgroundColor: '#F2F4F7'
    },
    timeGapViewBorder: {
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6
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
    clockView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    clockImg: {
        width: 16,
        height: 16,
        resizeMode: 'stretch',
        marginHorizontal: 5
    },
    clockLabel: {
        fontWeight: '400',
        color: '#000000',
        fontSize: 12
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
    redLabel: {
        fontWeight: '400',
        color: '#EB445A',
        fontSize: 12
    }
})
interface VisitTimelineBlockInterface {
    item: any
    notShowTimeCard: boolean
    fromEmployeeSchedule: boolean
    isVisitList: boolean
    fromMerch?: boolean
}

const getDeliveryIcon = (item) => {
    if (
        ((item.Check_Out_Location_Flag__c === '0' || item.Check_Out_Location_Flag__c === false) &&
            item.ActualVisitEndTime) ||
        ((item.InLocation === '0' || item.InLocation === false) && item.ActualVisitStartTime)
    ) {
        return <ERROR_DELIVERY width={20} height={20} style={styles.overLocation} />
    }
    return null
}

const VisitTimelineBlock = (props: VisitTimelineBlockInterface) => {
    const { item, fromEmployeeSchedule, notShowTimeCard, isVisitList, fromMerch } = props
    const startTime = formatWithTimeZone(item.ActualVisitStartTime, TIME_FORMAT.HHMMA, true, true)
    const endTime = item.ActualVisitEndTime
        ? ' - ' + formatWithTimeZone(item.ActualVisitEndTime, TIME_FORMAT.HHMMA, true, true)
        : ''
    const durationTime = startTime + endTime
    const durationGap = formatClock({
        hour: Math.floor(item.Actual_Duration_Minutes__c >= 60 ? item.Actual_Duration_Minutes__c / 60 : 0),
        min: item.Actual_Duration_Minutes__c % 60
    })
    const PlannedDurationMinutes = item.Planned_Duration_Minutes__c || item.PlannedDurationMinutes
    const durationValue = PlannedDurationMinutes - item.Actual_Duration_Minutes__c || 0
    const durationABSValue = Math.abs(PlannedDurationMinutes - item.Actual_Duration_Minutes__c) || 0
    const durationGapBetween = formatClock({
        hour: Math.floor(durationABSValue >= 60 ? durationABSValue / 60 : 0),
        min: Math.floor(durationABSValue % 60)
    })
    if (!notShowTimeCard && fromEmployeeSchedule && (item.ActualVisitStartTime || item.ActualVisitEndTime)) {
        return (
            <View style={[styles.timeGapView, fromMerch && styles.timeGapViewBorder]}>
                {isVisitList &&
                    (item.status === VisitStatus.COMPLETE ||
                        item.status === VisitStatus.IN_PROGRESS ||
                        item.workOrders > 0) && <View style={styles.lineView} />}
                <View style={styles.timeView}>
                    <View style={styles.timeLeftView}>
                        <CText style={[styles.timeLabel, styles.timeLabelMargin]}>{durationTime}</CText>
                        <View style={styles.timeLine} />
                        {item.ActualVisitEndTime && <CText style={styles.timeLabel}>{durationGap}</CText>}
                        <View style={styles.timeLine} />
                        {!fromMerch && item.ActualVisitEndTime && (
                            <CText style={[durationValue >= 0 ? styles.clockLabel : styles.redLabel]}>
                                {(durationValue <= 0 ? '+' : '-') + durationGapBetween}
                            </CText>
                        )}
                        {item.ActualVisitStartTime && !item.ActualVisitEndTime && (
                            <View style={styles.clockView}>
                                <Image
                                    style={styles.clockImg}
                                    source={require('../../../../assets/image/ios-clock.png')}
                                />
                                <CText style={styles.clockLabel}>{item.clockTime ? item.clockTime : ''}</CText>
                            </View>
                        )}
                    </View>
                    {getDeliveryIcon(item)}
                </View>
            </View>
        )
    }
    return null
}

export default VisitTimelineBlock

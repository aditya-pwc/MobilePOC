/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-06-01 02:49:51
 * @LastEditTime: 2022-12-28 09:24:15
 * @LastEditors: Mary Qian
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { isEventItem, VisitInfoProps } from '../../../helper/merchandiser/MyVisitDataHelper'
import { t } from '../../../../common/i18n/t'
import { formatWithTimeZone } from '../../../utils/TimeZoneUtils'
import CText from '../../../../common/components/CText'
import MeetingList from '../MeetingList'
import ScheduleVisitCard from '../ScheduleVisitCard'
import { ManagerMeetingItem } from './ManagerMeetingItem'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'

const timeStyles = StyleSheet.create({
    vlHeader: {
        alignItems: 'center',
        height: 56
    },
    vlHeaderText: {
        fontSize: 12,
        marginTop: 20,
        fontWeight: '400',
        color: '#565656'
    },
    vlHeaderTimeText: {
        color: '#000'
    },
    separateLine: {
        width: '80%',
        height: 1,
        backgroundColor: '#D3D3D3'
    },
    timeHeight: {
        height: 20
    },
    marginBottom0: {
        marginBottom: 0
    }
})

export const renderTime = (visitListInfo: VisitInfoProps, isStart: boolean) => {
    const time = isStart ? visitListInfo.StartTime : visitListInfo.EndTime
    if (!time) {
        return <View style={timeStyles.timeHeight} />
    }

    const desc = (isStart ? t.labels.PBNA_MOBILE_DAY_STARTED_AT : t.labels.PBNA_MOBILE_DAY_ENDED_AT) + ' '
    const startTime = formatWithTimeZone(time, TIME_FORMAT.HMMA, true, true)
    const startDate = formatWithTimeZone(time, TIME_FORMAT.DDD_MMM_DD_YYYY, true, false)

    return (
        <View style={timeStyles.vlHeader}>
            {visitListInfo.index > 0 && isStart && <View style={timeStyles.separateLine} />}
            <CText style={timeStyles.vlHeaderText}>
                {desc}
                <CText style={timeStyles.vlHeaderTimeText}>{startTime}</CText>
                {` | ${startDate}`}
            </CText>
        </View>
    )
}

interface ManagerMeetingProps {
    navigation: any
    meetingList: any[]
    clockStart?: boolean
    dayStart?: boolean
    onStartMeeting?: () => void
    onEndMeeting?: () => void
}

export const ManagerMeetings = (props: ManagerMeetingProps) => {
    const { navigation, meetingList, clockStart, dayStart, onStartMeeting, onEndMeeting } = props

    if (!meetingList || !meetingList.length) {
        return null
    }

    return (
        <View>
            {meetingList.map((item) => {
                return (
                    <View key={item.Id} style={timeStyles.marginBottom0}>
                        <ManagerMeetingItem
                            item={item}
                            navigation={navigation}
                            clockStart={clockStart}
                            dayStart={dayStart}
                            onStartMeeting={onStartMeeting}
                            onEndMeeting={onEndMeeting}
                        />
                    </View>
                )
            })}
        </View>
    )
}

interface VisitOrEventProps {
    navigation: any
    item: any
}

export const VisitOrEventCell = (props: VisitOrEventProps) => {
    const { item, navigation } = props
    console.log('inside VisitOeventCell')
    const cellItem = item || {}

    if (isEventItem(cellItem)) {
        return <MeetingList item={cellItem} fromEmployeeSchedule />
    }

    // const deliveryInfo = cellItem.deliveryInfo || { haveDelivery: false }
    return (
        <ScheduleVisitCard
            // deliveryInfo={deliveryInfo}
            navigation={navigation}
            showSubTypeBlock
            item={cellItem}
            isVisitList
            fromEmployeeSchedule
            fromMerch
            addVisits={false}
        />
    )
}

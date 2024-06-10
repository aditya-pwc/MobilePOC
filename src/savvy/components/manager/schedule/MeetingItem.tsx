/**
 * @description MeetingHeader Component.
 * @author fangfang ji
 * @email fangfang.ji@pwc.com
 * @date 2021-09-02
 */

import React from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import CText from '../../../../common/components/CText'
import MeetingAddress from '../../../../../assets/image/MeetingAddress.svg'
import MeetingAttendes from '../../../../../assets/image/MeetingAttendes.svg'
import MeetingVideo from '../../../../../assets/image/MeetingVideo.svg'
import MeetingIcon from '../../../../../assets/image/MeetingIcon.svg'
import moment from 'moment'
import MeetingItemStyle from '../../../styles/manager/MeetingItemStyle'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { formatWithTimeZone } from '../../../utils/TimeZoneUtils'
import { t } from '../../../../common/i18n/t'
import { formatClock } from '../../../common/DateTimeUtils'
import _ from 'lodash'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { MOMENT_UNIT } from '../../../../common/enums/MomentUnit'

const styles = MeetingItemStyle
const Hr = 'Hr'
const Min = 'Min'
const FolderImage = ImageSrc.ARROW_DOWN
const UnfolderImage = ImageSrc.ARROW_UP
const dollar = '$'
const VertalLine = () => {
    return <View style={styles.line} />
}
const HorizontalLine = (props: any) => {
    return <View style={[styles.horizontalLine, props.style]} />
}
const HorizFlex = () => {
    return <View style={styles.flexcon} />
}
const TextRow = (props?: any) => {
    const { count, msg, style } = props
    return (
        <View style={[styles.meetingCountCon, style]}>
            <CText style={styles.meetingCountTxt}>{count}</CText>
            <CText style={styles.meetingText}>{msg}</CText>
        </View>
    )
}
interface MeetingHeaderProps {
    data?: any
    onPress?: Function
    showMeeting?: boolean
    isPub?: boolean
    hasCost?: boolean
}
const getFolderImage = (showMeeting) => {
    return showMeeting ? FolderImage : UnfolderImage
}
const renderMeetingMinTime = (meetingTotalTime) => {
    const hrs = Math.floor(meetingTotalTime / 60)
    const min = meetingTotalTime % 60
    return (
        <View style={styles.meetingCountCon}>
            {hrs > 0 && <TextRow count={hrs} msg={Hr} />}
            {min > 0 && <TextRow style={commonStyle.marginLeft_5} count={min} msg={Min} />}
        </View>
    )
}
export const MeetingHeader = (props: MeetingHeaderProps) => {
    const { onPress, showMeeting, isPub, hasCost } = props
    const { meetingCount, meetingTotalTime, meetingCost } = props.data
    return (
        <TouchableOpacity activeOpacity={1.0} onPress={() => onPress && onPress()}>
            <View style={styles.con}>
                <MeetingIcon width={30} height={30} style={styles.icon} />
                <TextRow count={meetingCount} msg={t.labels.PBNA_MOBILE_MEETINGS} />
                <VertalLine />
                {isPub ? (
                    renderMeetingMinTime(meetingTotalTime)
                ) : (
                    <TextRow count={meetingTotalTime} msg={t.labels.PBNA_MOBILE_HOURS} />
                )}
                {hasCost && (
                    <View style={styles.meetingCountCon}>
                        <VertalLine />
                        <TextRow count={dollar + meetingCost} msg={_.capitalize(t.labels.PBNA_MOBILE_COST)} />
                    </View>
                )}
                <HorizFlex />
                {isPub ? (
                    <Image source={getFolderImage(showMeeting)} style={styles.folderIcon} />
                ) : (
                    <Image source={ImageSrc.IMG_CHEVRON} style={styles.folderIcon} />
                )}
            </View>
        </TouchableOpacity>
    )
}
interface MeetingItemProps {
    item?: any
    isMerchandiser?: boolean
    onPress?: Function
    employeeId?: string
    fromNewSchedule?: boolean
}

export const MeetingItem = (props: MeetingItemProps) => {
    const { item, isMerchandiser, onPress, employeeId, fromNewSchedule } = props
    let actualChildStartTime, actualChildEndTime
    if (item.ChildActualStartTimeObj && employeeId) {
        actualChildStartTime = item.ChildActualStartTimeObj[employeeId]
    }
    if (item.ChildActualEndTimeObj && employeeId) {
        actualChildEndTime = item.ChildActualEndTimeObj[employeeId]
    }
    if (fromNewSchedule) {
        for (const startTimeId in item.ChildActualStartTimeObj) {
            if (item.ChildActualStartTimeObj[startTimeId]) {
                for (const endTimeId in item.ChildActualEndTimeObj) {
                    if (startTimeId === endTimeId && item.ChildActualEndTimeObj[endTimeId]) {
                        actualChildStartTime = item.ChildActualStartTimeObj[startTimeId]
                        actualChildEndTime = item.ChildActualEndTimeObj[endTimeId]
                    }
                }
            }
        }
    }
    const startTime = formatWithTimeZone(item.StartDateTime, `${TIME_FORMAT.HHMMA}`, true, false)
    const endTime = formatWithTimeZone(item.EndDateTime, `${TIME_FORMAT.HHMMA}`, true, false)
    const startMeetingTime = formatWithTimeZone(
        item.Actual_Start_Time__c || actualChildStartTime,
        `${TIME_FORMAT.HHMMA}`,
        true,
        true
    )
    const endMeetingTime = formatWithTimeZone(
        item.Actual_End_Time__c || actualChildEndTime,
        `${TIME_FORMAT.HHMMA}`,
        true,
        true
    )

    const meetingDuration = moment(item.Actual_End_Time__c || actualChildEndTime).diff(
        moment(item.Actual_Start_Time__c || actualChildStartTime),
        MOMENT_UNIT.MINUTES
    )
    const date = moment(item.StartDateTime).format(TIME_FORMAT.DDD_MMM_D_YYYY)
    const virtualLocation = item.VirtualLocation || item.VirtualLocation__c
    const meetingFinish = !!(
        (item.Actual_Start_Time__c || actualChildStartTime) &&
        (item.Actual_End_Time__c || actualChildEndTime)
    )
    return (
        <TouchableOpacity activeOpacity={1} onPress={() => onPress(item)}>
            {(isMerchandiser || meetingFinish) && <HorizontalLine style={styles.itemLine} />}
            <View style={[styles.meetingItemCon, meetingFinish && { backgroundColor: '#F2F4F7' }]}>
                <View style={styles.rowCon}>
                    <View style={styles.messageIconView}>
                        <MeetingIcon width={40} height={40} />
                        {meetingFinish && <Image source={ImageSrc.ICON_CHECKMARK_CIRCLE} style={styles.checkmark} />}
                    </View>
                    <View style={styles.meetingMsgCon}>
                        <View style={styles.rowCon}>
                            <CText numberOfLines={1} style={styles.meetingText}>
                                {startTime} - {endTime}
                            </CText>
                            <VertalLine />
                            <CText style={styles.meetingText}>{date}</CText>
                        </View>
                        <CText numberOfLines={1} style={[styles.meetingCountTxt, styles.name]}>
                            {item.MeetingName}
                        </CText>
                    </View>
                    <View style={styles.flexcon} />
                    {virtualLocation && <MeetingVideo width={18} height={12} style={styles.videoIcon} />}
                </View>
                <View style={[styles.rowCon, styles.bottomSpace]}>
                    <MeetingAddress width={10} height={12} style={styles.addressIcon} />
                    <CText numberOfLines={1} style={[styles.meetingText, styles.addressWidth]}>
                        {item.Location}
                    </CText>
                    <HorizFlex />
                    <View style={styles.rowCon}>
                        <CText style={styles.meetingText}>{item.meetingDuration}</CText>
                        <VertalLine />
                        <CText style={styles.meetingText}>{item.ChildMeetingCount}</CText>
                        <MeetingAttendes width={18} height={12} style={styles.attendes} />
                    </View>
                </View>
            </View>
            <HorizontalLine
                style={[styles.itemLine, isMerchandiser && !meetingFinish && styles.meetingItemMerchandiser]}
            />
            {(actualChildEndTime || item.Actual_End_Time__c) && (
                <View
                    style={[
                        meetingFinish && { backgroundColor: '#F2F4F7' },
                        !fromNewSchedule && styles.meetingItemMerchandiser
                    ]}
                >
                    <View style={styles.meetingCompleteTimeBar}>
                        <CText style={styles.meetingText}>
                            {startMeetingTime} - {endMeetingTime} |{' '}
                            {formatClock({
                                hour: Math.floor(meetingDuration >= 60 ? meetingDuration / 60 : 0),
                                min: meetingDuration % 60
                            })}
                        </CText>
                    </View>
                    <HorizontalLine style={[styles.itemLine, isMerchandiser && styles.meetingItemMerchandiser]} />
                </View>
            )}
        </TouchableOpacity>
    )
}
const MSDItemType = {
    LEFT: 'flex-start',
    CENTER: 'center',
    RIGHT: 'flex-end'
}
export const MeetingSumDataItem = (props: any) => {
    const { des, val, type } = props
    const alignStyle = { alignItems: type }
    return (
        <View style={alignStyle}>
            <CText style={styles.meetingText}>{des}</CText>
            <CText style={styles.sumTextBold}>{val}</CText>
        </View>
    )
}
export const MeetingSumDataView = (props: any) => {
    const { meetingCount, meetingTotalTime, meetingCost } = props.data
    return (
        <View style={styles.sumCon}>
            <MeetingSumDataItem type={MSDItemType.LEFT} des={t.labels.PBNA_MOBILE_MEETINGS} val={meetingCount} />
            <MeetingSumDataItem type={MSDItemType.CENTER} des={t.labels.PBNA_MOBILE_HOURS} val={meetingTotalTime} />
            <MeetingSumDataItem
                type={MSDItemType.RIGHT}
                des={_.capitalize(t.labels.PBNA_MOBILE_COST)}
                val={dollar + meetingCost}
            />
        </View>
    )
}

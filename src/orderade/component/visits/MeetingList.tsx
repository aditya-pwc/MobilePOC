import React from 'react'
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native'
import CText from '../../../common/components/CText'
import { CommonParam } from '../../../common/CommonParam'
import moment from 'moment'
import BreakSvg from '../../../../assets/image/icon-break SVG.svg'
import MeetingSvg from '../../../../assets/image/icon-meeting SVG.svg'
import PersonalTime from '../../../../assets/image/icon-personal-time SVG.svg'
import LunchSvg from '../../../../assets/image/icon-lunch SVG.svg'
import { formatWithTimeZone } from '../../../common/utils/TimeZoneUtils'
import { baseStyle } from '../../../common/styles/BaseStyle'
import DeviceInfo from 'react-native-device-info'
import { formatClock, subjectMap } from '../../utils/VisitUtils'
import { MOMENT_STARTOF } from '../../../common/enums/MomentStartOf'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { t } from '../../../common/i18n/t'
interface MeetingCellProps {
    item
    breakDuration?: number
    onStartMeeting?: Function
    onEndMeeting?: Function
    inMeeting?: boolean
    fromEmployeeSchedule?: boolean
}

const styles = StyleSheet.create({
    containerView: {
        backgroundColor: '#FFFFFF',
        marginRight: DeviceInfo.isTablet() ? 80 : 22,
        marginLeft: DeviceInfo.isTablet() ? 80 : 22,
        borderRadius: 6,
        shadowColor: '#004C97',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10
    },
    cellContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    cellImgIcon: {
        marginTop: 23,
        marginBottom: 23,
        marginLeft: 15,
        marginRight: 15,
        width: 26,
        height: 25,
        resizeMode: 'stretch'
    },
    titleView: {
        flex: 1,
        height: 60,
        flexDirection: 'column',
        justifyContent: 'center'
    },
    titleStyle: {
        color: '#000000',
        fontSize: 18,
        textAlign: 'left',
        fontWeight: '900'
    },
    timeView: {
        flexDirection: 'row',
        marginTop: 5,
        alignItems: 'center'
    },
    subtitleStyle: {
        color: '#565656',
        fontSize: 12,
        textAlign: 'left',
        flexWrap: 'wrap'
    },
    startLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#00A2D9',
        marginRight: 15,
        marginLeft: 15
    },
    finishLogo: {
        width: 24,
        height: 24,
        resizeMode: 'stretch',
        marginRight: 15,
        marginLeft: 15
    },
    timeLabel: {
        fontFamily: 'Gotham',
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
    complete: {
        backgroundColor: 'rgb(242, 244, 247)'
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
    goldBorder: {
        borderWidth: 2,
        borderColor: baseStyle.color.yellow,
        borderRadius: 6
    }
})
const getIsToday = (item) => {
    let isToday = false
    const target = moment(item.StartDateTime)
    const now = moment()
    if (target >= now.clone().startOf(MOMENT_STARTOF.DAY) && target < now.clone().endOf(MOMENT_STARTOF.DAY)) {
        isToday = true
    }
    return isToday
}

const getTimeStr = (startDateTime, endDateTime) => {
    let timeStr = formatWithTimeZone(startDateTime, TIME_FORMAT.HHMMA, true, true)
    if (endDateTime) {
        timeStr = timeStr + ' - ' + formatWithTimeZone(endDateTime, TIME_FORMAT.HHMMA, true, true)
    }
    return timeStr
}

const getDurationTime = (startDateTime, endDateTime) => {
    const timeGap = moment.duration(moment(endDateTime) - moment(startDateTime))
    // for overnight scenario, we need to consider the days
    const dayCovertToHours = timeGap.days() > 0 ? timeGap.days() * 24 : 0
    const hours = dayCovertToHours + timeGap.hours()
    let gapHour = ''
    if (timeGap.hours() > 0) {
        const flag = hours > 1 ? t.labels.PBNA_MOBILE_HRS : t.labels.PBNA_MOBILE_HR
        gapHour = `${hours} ${flag} `
    }
    if (timeGap.hours() === 0 && dayCovertToHours > 0) {
        const hourFlag = dayCovertToHours > 1 ? t.labels.PBNA_MOBILE_HRS : t.labels.PBNA_MOBILE_HR
        gapHour = `${dayCovertToHours} ${hourFlag} `
    }
    const gapMin = `${timeGap.minutes()} ${
        timeGap.minutes() > 1 ? t.labels.PBNA_MOBILE_MINS : t.labels.PBNA_MOBILE_MIN
    }`
    return gapHour + gapMin
}

const getInprogressGapTime = (fromEmployeeSchedule, item, startDateTime, endDateTime) => {
    if (fromEmployeeSchedule && item.Manager_Scheduled__c === '1' && startDateTime && !endDateTime) {
        const momGap = moment(new Date()).diff(moment(startDateTime), 'minute')
        const durantionStr = formatClock({
            hour: Math.floor(momGap >= 60 ? momGap / 60 : 0),
            min: momGap % 60
        })
        return (
            <View style={styles.clockView}>
                <Image style={styles.clockImg} source={require('../../../../assets/image/ios-clock.png')} />
                <CText style={styles.clockLabel}>{durantionStr}</CText>
            </View>
        )
    }
    return null
}

const getStyleBg = (fromEmployeeSchedule, item) => {
    let styleBg = styles.cellContainer
    if (fromEmployeeSchedule && item.ActualStartTime && item.ActualEndTime) {
        styleBg = Object.assign({}, styles.cellContainer, styles.complete)
    }
    return styleBg
}
const getComponentWithSubject = (item) => {
    if (item.Subject === 'Lunch') {
        return <LunchSvg style={styles.cellImgIcon} />
    } else if (item.Subject === 'Break') {
        return <BreakSvg style={styles.cellImgIcon} />
    } else if (item.Subject === 'Personal Time') {
        return <PersonalTime style={styles.cellImgIcon} />
    } else if (item.Subject === 'Meeting' && item.Manager_Scheduled__c !== '1') {
        return <MeetingSvg style={styles.cellImgIcon} />
    }
    return null
}

const onPressStart = (forbidTouch, item, onStartMeeting) => {
    if (!forbidTouch && !item.ActualStartTime) {
        onStartMeeting && onStartMeeting(item)
    }
}

const MeetingList = (props: MeetingCellProps) => {
    const vl = CommonParam.visitList || {}
    const { item, onStartMeeting, inMeeting, fromEmployeeSchedule } = props
    const isToday = getIsToday(item)
    const titleStr = subjectMap(item.Type || item.Subject)
    const forbidTouch = !isToday || inMeeting || !vl.Start_Date_Time__c || vl.End_Date_Time__c
    const startDateTime = item.Manager_Scheduled__c === '1' ? item.StartDateTime : item.ActualStartTime
    const endDateTime = item.Manager_Scheduled__c === '1' ? item.EndDateTime : item.ActualEndTime
    const isGoldBorderShown = false
    return (
        <View style={[styles.containerView]}>
            <View style={[getStyleBg(fromEmployeeSchedule, item), isGoldBorderShown && styles.goldBorder]}>
                {item.Manager_Scheduled__c === '1' && (
                    <Image style={styles.cellImgIcon} source={require('../../../../assets/image/icon-calendar.png')} />
                )}
                {getComponentWithSubject(item)}
                <View style={styles.titleView}>
                    <CText style={styles.titleStyle} numberOfLines={1}>
                        {titleStr}
                    </CText>
                    <View style={styles.timeView}>
                        <CText style={styles.subtitleStyle} numberOfLines={1}>
                            {getTimeStr(startDateTime, endDateTime)}
                        </CText>
                        {fromEmployeeSchedule && <View style={styles.timeLine} />}
                        {fromEmployeeSchedule && endDateTime && (
                            <CText style={styles.timeLabel}>{getDurationTime(startDateTime, endDateTime)}</CText>
                        )}
                        {getInprogressGapTime(fromEmployeeSchedule, item, startDateTime, endDateTime)}
                    </View>
                </View>
                <TouchableOpacity
                    hitSlop={{ left: 15, right: 15, top: 15, bottom: 15 }}
                    onPress={() => {
                        // addLog(item)
                        onPressStart(forbidTouch, item, onStartMeeting)
                    }}
                >
                    {item.ActualStartTime && item.ActualEndTime && (
                        <Image
                            style={styles.finishLogo}
                            source={require('../../../../assets/image/icon_checkmark_circle.png')}
                        />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default MeetingList

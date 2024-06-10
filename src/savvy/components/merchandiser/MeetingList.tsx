/**
 * @description Meeting list component.
 * @author Yi Li
 * @email yi.b.li@pwc.com
 * @date 2021-04-26
 */
import React from 'react'
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native'
import CText from '../../../common/components/CText'
import Utils, { formatClock } from '../../common/DateTimeUtils'
import MeetingBar from './MeetingBar'
import { CommonParam } from '../../../common/CommonParam'
import moment from 'moment'
import BreakSvg from '../../../../assets/image/icon-break SVG.svg'
import MeetingSvg from '../../../../assets/image/icon-meeting SVG.svg'
import PersonalTime from '../../../../assets/image/icon-personal-time SVG.svg'
import LunchSvg from '../../../../assets/image/icon-lunch SVG.svg'
import { formatWithTimeZone } from '../../utils/TimeZoneUtils'
import { t } from '../../../common/i18n/t'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { Persona } from '../../../common/enums/Persona'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../../common/enums/MomentStartOf'
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
        marginRight: Utils.isTablet ? 80 : 22,
        marginLeft: Utils.isTablet ? 80 : 22,
        borderRadius: 6,
        marginBottom: 17,
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
    const gapHour = timeGap.hours() > 0 ? `${timeGap.hours()} ${t.labels.PBNA_MOBILE_HR} ` : ''
    const gapMin = `${timeGap.minutes()} ${t.labels.PBNA_MOBILE_MIN}`
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
    if (fromEmployeeSchedule && item.Actual_Start_Time__c && item.Actual_End_Time__c) {
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
    if (!forbidTouch && !item.Actual_Start_Time__c) {
        onStartMeeting && onStartMeeting(item)
    }
}

const subjectMap = (subject) => {
    const subjectMapObj = {
        Lunch: t.labels.PBNA_MOBILE_LUNCH,
        Break: t.labels.PBNA_MOBILE_BREAK,
        Meeting: t.labels.PBNA_MOBILE_MEETING,
        'Personal Time': t.labels.PBNA_MOBILE_PERSONAL_TIME
    }
    return subjectMapObj[subject]
}

const MeetingList = (props: MeetingCellProps) => {
    const vl = CommonParam.visitList || {}
    const { item, onStartMeeting, onEndMeeting, breakDuration, inMeeting, fromEmployeeSchedule } = props
    const showStartBtn = !item.Actual_Start_Time__c
    const isToday = getIsToday(item)
    const titleStr = subjectMap(item.Type || item.Subject)
    const forbidTouch = !isToday || inMeeting || !vl.Start_Date_Time__c || vl.End_Date_Time__c
    const startDateTime = item.Manager_Scheduled__c === '1' ? item.StartDateTime : item.Actual_Start_Time__c
    const endDateTime = item.Manager_Scheduled__c === '1' ? item.EndDateTime : item.Actual_End_Time__c
    const isGoldBorderShown = fromEmployeeSchedule && CommonParam.PERSONA__c !== Persona.MERCHANDISER

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
                    {!fromEmployeeSchedule && showStartBtn && isToday ? (
                        <CText style={styles.startLabel}>{t.labels.PBNA_MOBILE_START.toUpperCase()}</CText>
                    ) : null}
                    {item.Actual_Start_Time__c && item.Actual_End_Time__c && (
                        <Image
                            style={styles.finishLogo}
                            source={require('../../../../assets/image/icon_checkmark_circle.png')}
                        />
                    )}
                </TouchableOpacity>
            </View>

            {!fromEmployeeSchedule &&
                item.Actual_Start_Time__c &&
                !item.Actual_End_Time__c &&
                breakDuration !== null && (
                    <MeetingBar
                        endMeeting={() => {
                            // addLog(item)
                            onEndMeeting(item)
                        }}
                        d={breakDuration}
                    />
                )}
        </View>
    )
}

export default MeetingList

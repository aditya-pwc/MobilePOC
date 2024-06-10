/*
 * @Description:VisitDuration
 * @Author: Mary Qian
 * @Date: 2021-08-11 02:20:25
 * @LastEditTime: 2023-06-30 19:14:18
 * @LastEditors: Tom tong.jiang@pwc.com
 */
import React, { useState, useEffect, useRef, FC } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import 'moment-timezone'
import moment from 'moment'
import CText from '../../../common/components/CText'
// import { SoupService } from '../../service/SoupService'
import { VisitStatus } from '../../enum/VisitType'
import { MyDayVisitModel } from '../../interface/MyDayVisit'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'
const styles = StyleSheet.create({
    ...commonStyle,
    clock: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 164,
        height: 50,
        boxSizing: 'border-box',
        backgroundColor: '#FFF',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: baseStyle.color.liteGrey2
    },
    lightGrey: {
        color: baseStyle.color.liteGrey,
        fontSize: 12,
        fontWeight: '700'
    },
    statusText: {
        marginTop: 4,
        fontSize: 12,
        fontWeight: '400'
    },
    clockContent: {
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    clockImg: {
        marginLeft: 20,
        marginRight: 20,
        height: 22,
        width: 22
    },
    inprogress: {
        borderColor: baseStyle.color.green,
        borderWidth: 2
    },
    isCompleted: {
        backgroundColor: baseStyle.color.bgGray
    }
})

interface VisitDurationProps {
    visit: MyDayVisitModel
    isCompleted?: boolean
}

const REFRESH_DURATION_INTERVAL = 10000

const VisitDuration: FC<VisitDurationProps> = (props) => {
    const visit = props.visit
    const isCompleted = props.isCompleted
    const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const [, setTicker] = useState<number>(0)

    useEffect(() => {
        tickerRef.current = setInterval(() => {
            setTicker((prev) => prev + 1)
        }, REFRESH_DURATION_INTERVAL)
        return () => {
            tickerRef?.current && clearInterval(tickerRef.current)
        }
    }, [])

    const getvisitStatus = () => {
        let status = t.labels.PBNA_MOBILE_NOT_STARTED
        switch (visit.Status) {
            case VisitStatus.IN_PROGRESS:
                status = t.labels.PBNA_MOBILE_IN_PROGRESS
                break
            case VisitStatus.COMPLETE:
                status = t.labels.PBNA_MOBILE_COMPLETED
                break
            case VisitStatus.PUBLISH:
                status = t.labels.PBNA_MOBILE_NOT_STARTED
                break
            default:
                break
        }
        return status
    }

    const getTimeText = () => {
        const { ActualStartTime, ActualEndTime } = visit
        if (!ActualStartTime) {
            const time = `00:00 ${t.labels.PBNA_MOBILE_MIN} `
            return time
        }
        const diff = moment.duration(
            (visit.Status === VisitStatus.COMPLETE && ActualEndTime ? moment(ActualEndTime) : moment())
                .startOf('minute')
                .diff(moment(ActualStartTime).startOf('minute'))
        )
        // Time limit is 99h59min
        const timeLimit = (99 * 60 * 60 + 59 * 60) * 1000
        const outputHours = Math.floor(diff.asHours()) > 99 ? 99 : Math.floor(diff.asHours())
        const outputMins = diff.asMilliseconds() > timeLimit ? '59+' : moment.utc(diff.asMilliseconds()).format('mm')
        const outputTimeText = `${outputHours}:${outputMins}`
        // the label string has 'h' and 'm' inside which corrupts the format, so we format with standard and replace string
        return outputTimeText + ' ' + (diff.asMinutes() >= 2 ? t.labels.PBNA_MOBILE_MINS : t.labels.PBNA_MOBILE_MIN)
    }

    const visitStatus = getvisitStatus()
    const timeText = getTimeText()

    // in progress loadingGreen
    return (
        <View
            style={[
                styles.clock,
                visitStatus === VisitStatus.IN_PROGRESS && styles.inprogress,
                isCompleted && styles.isCompleted
            ]}
        >
            <Image style={styles.clockImg} source={require('../../../../assets/image/ios-clock.png')} />
            <View style={[styles.clockContent]}>
                <CText style={[styles.lightGrey, visitStatus !== VisitStatus.NOT_STARTED && styles.colorBlack]}>
                    {timeText}
                </CText>
                <CText style={styles.statusText}>{visitStatus}</CText>
            </View>
        </View>
    )
}

export default VisitDuration

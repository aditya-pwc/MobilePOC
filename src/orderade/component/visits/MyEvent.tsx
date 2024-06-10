import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import ClockBar from './ClockBar'
import { MOMENT_UNIT } from '../../../common/enums/MomentUnit'

const DURATION_TIME_INTERVAL = 60 * 1000

const MyEvent = (props: any) => {
    const [breakDuration, setBreakDuration] = useState(0)

    let intervalId = null

    const { onEndEvent, breakEvent } = props

    const refreshBreakDuration = () => {
        const duration = moment().diff(moment(breakEvent.Actual_Start_Time__c), MOMENT_UNIT.MINUTES)
        setBreakDuration(duration)
    }

    const endTimer = () => {
        clearInterval(intervalId)
        intervalId = null
    }

    const startTimer = () => {
        endTimer()
        refreshBreakDuration()
        intervalId = setInterval(() => {
            refreshBreakDuration()
        }, DURATION_TIME_INTERVAL)
    }

    useEffect(() => {
        if (breakEvent) {
            startTimer()
        } else {
            endTimer()
        }

        return () => {
            endTimer()
        }
    }, [breakEvent])

    if (!breakEvent) {
        return null
    }

    return (
        <View>
            <ClockBar
                d={breakDuration}
                type={breakEvent.Type}
                endEvent={() => {
                    onEndEvent(breakEvent)
                }}
                isShowStartMyDay={props.isShowStartMyDay}
            />
        </View>
    )
}

export default MyEvent

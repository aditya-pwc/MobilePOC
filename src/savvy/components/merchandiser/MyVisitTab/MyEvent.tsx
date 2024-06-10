/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-06-03 01:02:42
 * @LastEditTime: 2022-06-05 01:30:09
 * @LastEditors: Mary Qian
 */

import moment from 'moment'
import React, { useEffect, useState } from 'react'
import ClockBar from '../ClockBar'
import { MOMENT_UNIT } from '../../../../common/enums/MomentUnit'

const DURATION_TIME_INTERVAL = 60 * 1000

const MyEvent = (props: any) => {
    const [breakDuration, setBreakDuration] = useState(0)

    let intervalId = null

    const { onEndEvent, breakEvent } = props

    const refreshBreakDuration = () => {
        setBreakDuration(moment().diff(moment(breakEvent.Actual_Start_Time__c), MOMENT_UNIT.MINUTES))
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
        <ClockBar
            d={breakDuration}
            type={breakEvent.Type}
            endEvent={() => {
                onEndEvent(breakEvent)
            }}
            eventId={breakEvent?.Id}
        />
    )
}

export default MyEvent

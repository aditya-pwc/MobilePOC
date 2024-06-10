/*
 * @Description: DeliveryTimeLine
 * @Author: Aimee Zhang
 * @Date: 2022-01-05 17:52:17
 * @LastEditTime: 2022-01-11 15:00:59
 * @LastEditors: Aimee Zhang
 */

import React, { useEffect, useState } from 'react'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { DeliveryForTimelineProps } from '../../../service/DeliveryTimelineService'
import DeliveryTimeline from './DeliveryTimeLine'

const styles = StyleSheet.create({
    activityIndicatorMargin: {
        marginTop: 50
    },
    transparent: {
        opacity: 0
    },
    opaque: {
        opacity: 1
    }
})

interface DeliveryTimeLineProps {
    visit: DeliveryForTimelineProps
    isFromSDLVisitDetail?: boolean
}

const DeliveryVisitActivity = (props: DeliveryTimeLineProps) => {
    const { visit, isFromSDLVisitDetail = false } = props

    const [isTimelineLoaded, setIsTimelineLoaded] = useState(false)
    const [isAllLoaded, setAllLoaded] = useState(false)

    const onTimelineLoaded = () => {
        setIsTimelineLoaded(true)
    }

    useEffect(() => {
        setAllLoaded(isTimelineLoaded)
    }, [isTimelineLoaded])

    return (
        <View>
            {!isAllLoaded && <ActivityIndicator style={styles.activityIndicatorMargin} />}
            {
                <View style={isAllLoaded ? styles.opaque : styles.transparent}>
                    <DeliveryTimeline
                        isFromSDLVisitDetail={isFromSDLVisitDetail}
                        key={visit.Id}
                        visit={visit}
                        onDataLoaded={() => {
                            onTimelineLoaded()
                        }}
                    />
                </View>
            }
        </View>
    )
}

export default DeliveryVisitActivity

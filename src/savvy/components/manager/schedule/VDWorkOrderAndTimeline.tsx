/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-08-26 06:36:36
 * @LastEditTime: 2021-08-26 06:57:58
 * @LastEditors: Mary Qian
 */

import React, { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import OpenWorkOrder from '../../../module/work-order/OpenWorkOrder'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import VisitTimeline from './VisitTimeline'

interface OpenWorkOrdersProps {
    visit: any
}

const VDWorkOrderAndTimeline = (props: OpenWorkOrdersProps) => {
    const { visit } = props

    const [isWorkOrderLoaded, setIsWorkOrderLoaded] = useState(false)
    const [isTimelineLoaded, setIsTimelineLoaded] = useState(false)
    const [isAllLoaded, setAllLoaded] = useState(false)

    const onOpenWorkOrderLoaded = () => {
        setIsWorkOrderLoaded(true)
    }
    const onTimelineLoaded = () => {
        setIsTimelineLoaded(true)
    }

    useEffect(() => {
        setAllLoaded(isWorkOrderLoaded && isTimelineLoaded)
    }, [isWorkOrderLoaded, isTimelineLoaded])

    const opacity = { opacity: isAllLoaded ? 1 : 0 }

    return (
        <View>
            {!isAllLoaded && <ActivityIndicator style={commonStyle.marginTop_50} />}
            {
                <View style={opacity}>
                    <OpenWorkOrder
                        visit={visit}
                        onDataLoaded={() => {
                            onOpenWorkOrderLoaded()
                        }}
                    />
                    <VisitTimeline
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

export default VDWorkOrderAndTimeline

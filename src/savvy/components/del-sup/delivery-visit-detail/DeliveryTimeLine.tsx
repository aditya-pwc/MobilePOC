/*
 * @Description:VisitTimelineTemp
 * @Author: Aimee Zhang
 * @Date: 2022-01-06 17:01:52
 * @LastEditTime: 2022-01-11 13:27:19
 * @LastEditors: Aimee Zhang
 */

import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { DropDownType } from '../../../enums/Manager'
import { DeliveryForTimelineProps, DeliveryTimelineService } from '../../../service/DeliveryTimelineService'
import GeofenceBar from '../../manager/schedule/GeofenceBar'
import VisitTimelineItem from '../../manager/schedule/VisitTimelineItem'

const styles = StyleSheet.create({
    containerView: {
        padding: 22,
        marginTop: 8
    }
})

interface DeliveryTimelineProps {
    visit: DeliveryForTimelineProps
    onDataLoaded?: Function
    isFromSDLVisitDetail: boolean
}

const DeliveryTimeline = (props: DeliveryTimelineProps) => {
    const { visit, onDataLoaded, isFromSDLVisitDetail } = props
    const [timeLineList, setTimeLineList] = useState([])
    const { dropDownRef } = useDropDown()

    const prepareVisit = async () => {
        try {
            const list = await DeliveryTimelineService.prepareVisit(visit, isFromSDLVisitDetail)
            setTimeLineList(list)
        } catch (err) {
            dropDownRef.current.alertWithType(DropDownType.ERROR, err)
        }

        onDataLoaded()
    }

    useEffect(() => {
        if (!visit.Id) {
            return
        }
        visit.startTime = visit.date
        prepareVisit()
    }, [visit])

    const renderTimeline = () => {
        return (
            <View>
                {timeLineList.map((element) => {
                    return <VisitTimelineItem key={element.id} data={element} />
                })}
            </View>
        )
    }

    return (
        <View style={styles.containerView}>
            {isFromSDLVisitDetail && <GeofenceBar visit={visit} />}
            {renderTimeline()}
        </View>
    )
}

export default DeliveryTimeline

/*
 * @Description:VisitTimeline
 * @Author: Mary Qian
 * @Date: 2021-08-11 20:47:48
 * @LastEditTime: 2022-11-27 12:10:11
 * @LastEditors: Mary Qian
 */

import React, { useEffect, useState, useRef, useMemo } from 'react'
import { StyleSheet, View, ActivityIndicator } from 'react-native'

import CText from '../../../../common/components/CText'
import VisitDuration from '../../common/VisitDuration'
import { VisitForTimelineProps, VisitTimelineService } from '../../../service/VisitTimelineService'
import { TimelineWorkOrder } from '../../../module/work-order/WorkOrderUI'
import GeofenceBar from './GeofenceBar'
import { t } from '../../../../common/i18n/t'
import VisitTimelineItem from './VisitTimelineItem'
import FastImage from 'react-native-fast-image'
import { CommonParam } from '../../../../common/CommonParam'
import { commonStyle } from '../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    ...commonStyle,
    containerView: {
        padding: 22,
        marginBottom: 0
    },
    headerView: {
        marginBottom: 20
    },
    boldText: {
        fontSize: 12,
        fontWeight: '700'
    },
    normalText: {
        fontSize: 12,
        fontWeight: '400'
    },
    listView: {},
    listContainer: {
        flexDirection: 'row'
    },
    signatureView: {
        marginTop: 18,
        marginBottom: 27
    },
    reason: {
        color: '#565656'
    },
    reasonInfo: {
        marginTop: 6,
        fontSize: 14,
        color: '#000000'
    },
    signatureImage: {
        marginBottom: 30,
        width: '100%',
        height: 242,
        borderColor: '#D3D3D3',
        borderWidth: 1
    }
})

const renderSignatureView = (detailInfo: any) => {
    const { reason, managerName, signatureData } = detailInfo
    if (reason?.length > 0) {
        return (
            <View style={styles.signatureView}>
                <CText style={[styles.normalText, styles.reason]}>{t.labels.PBNA_MOBILE_REASON}</CText>
                <CText style={[styles.normalText, styles.reasonInfo]}>{reason}</CText>
            </View>
        )
    }
    return (
        <View style={styles.signatureView}>
            <FastImage
                source={{
                    uri: `${CommonParam.endpoint}${signatureData}`,
                    headers: {
                        Authorization: `Bearer ${CommonParam.accessToken}`,
                        accept: 'image/png'
                    },
                    cache: FastImage.cacheControl.web
                }}
                style={styles.signatureImage}
            />

            <CText style={[styles.normalText, styles.reason]}>{t.labels.PBNA_MOBILE_STORE_MANAGER_NAME}</CText>
            <CText style={[styles.normalText, styles.reasonInfo]}>{managerName}</CText>
        </View>
    )
}

interface VisitTimeLineProps {
    visit: VisitForTimelineProps
    onDataLoaded?: Function
}

const VisitTimeline = (props: VisitTimeLineProps) => {
    const { visit, onDataLoaded } = props

    const [timeLineList, setTimeLineList] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const geofenceBarRef: any = useRef()

    const prepareVisit = async () => {
        setIsLoading(true)
        try {
            const list = await VisitTimelineService.prepareVisit(visit)
            setTimeLineList(list)
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
        }

        onDataLoaded()
    }

    useEffect(() => {
        visit.startTime = visit.date
        prepareVisit()
    }, [])

    const renderExpandInfo = (element) => {
        if (!element.detailInfo) {
            return null
        }
        const { workOrder, completeVisit } = element.detailInfo
        if (workOrder) {
            return <TimelineWorkOrder workOrder={workOrder} />
        }
        if (completeVisit) {
            return renderSignatureView(element.detailInfo)
        }
    }

    const renderTimeline = () => {
        if (isLoading) {
            return <ActivityIndicator />
        }

        return (
            <View style={styles.listView}>
                {timeLineList.map((element) => {
                    return (
                        <VisitTimelineItem key={element.id} data={element}>
                            {renderExpandInfo(element)}
                        </VisitTimelineItem>
                    )
                })}
            </View>
        )
    }

    return (
        <View style={styles.containerView}>
            <View style={[styles.rowWithCenter, styles.headerView]}>
                <CText style={styles.boldText}>{t.labels.PBNA_MOBILE_VISIT_ACTIVITY}</CText>
                {useMemo(() => {
                    return <VisitDuration visit={visit} />
                }, [visit])}
            </View>
            <GeofenceBar cRef={geofenceBarRef} visit={visit} />
            {renderTimeline()}
        </View>
    )
}

export default VisitTimeline

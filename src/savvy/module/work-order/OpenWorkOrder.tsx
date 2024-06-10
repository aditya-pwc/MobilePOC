/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-08-24 01:53:03
 * @LastEditTime: 2022-12-12 09:59:41
 * @LastEditors: Mary Qian
 */
import React, { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { VisitStatus } from '../../enums/Visit'
import { WorkOrderHeader } from './WorkOrderUI'
import WorkOrderCard from './WorkOrderCard'
import WorkOrderService from './WorkOrderService'
import { t } from '../../../common/i18n/t'
import { commonStyle } from '../../../common/styles/CommonStyle'

export const styles = StyleSheet.create({
    ...commonStyle,
    workOrderContent: {
        width: '100%',
        marginTop: 20
    },
    headerContainer: {
        marginLeft: 23,
        marginTop: 35
    }
})

interface OpenWorkOrderVisitProps {
    status: string
    storeId: string
    VisitDate: string
}

interface OpenWorkOrdersProps {
    visit: OpenWorkOrderVisitProps
    onDataLoaded?: Function
}

const OpenWorkOrder = (props: OpenWorkOrdersProps) => {
    const { visit, onDataLoaded } = props

    const [workOrderList, setWorkOrderList] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const getData = async () => {
        setIsLoading(true)
        const wos = await WorkOrderService.getWorkOrdersForManagerVD(visit)
        setWorkOrderList(wos)
        setIsLoading(false)
        onDataLoaded()
    }

    useEffect(() => {
        getData()
    }, [])

    return (
        <View>
            {!isLoading && (
                <View>
                    <WorkOrderHeader
                        title={t.labels.PBNA_MOBILE_OPEN_WORK_ORDERS}
                        count={workOrderList?.length}
                        headerStyle={styles.headerContainer}
                    />
                    <View style={styles.workOrderContent}>
                        {workOrderList?.map((workOrder, idx) => {
                            const workOrderStyle = { zIndex: 100 - idx }
                            return (
                                <View key={workOrder.Id} style={workOrderStyle}>
                                    <WorkOrderCard
                                        workOrder={workOrder}
                                        visitInProgress={visit.status === VisitStatus.IN_PROGRESS}
                                        isManagerWorkOrder
                                    />
                                </View>
                            )
                        })}
                    </View>
                </View>
            )}
        </View>
    )
}

export default OpenWorkOrder

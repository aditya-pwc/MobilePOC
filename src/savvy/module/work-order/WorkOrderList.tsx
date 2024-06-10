/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-08-24 01:26:52
 * @LastEditTime: 2023-10-23 17:39:27
 * @LastEditors: Mary Qian
 */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import 'moment-timezone'
import { CommonParam } from '../../../common/CommonParam'
import { syncWorkOrders } from '../../utils/MerchandiserUtils'
import { Log } from '../../../common/enums/Log'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import WorkOrderCard from './WorkOrderCard'
import { WorkOrderHeader } from './WorkOrderUI'
import { workOrderStyles } from './WorkOrderStyle'
import { WorkOrderService } from './WorkOrderService'
import InStoreMapService from '../../service/InStoreMapService'
import DocumentService from '../../service/DocumentService'
import { t } from '../../../common/i18n/t'
import { storeClassLog } from '../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

export const styles = StyleSheet.create({
    ...workOrderStyles,
    workOrder: {
        marginTop: 40
    },
    workOrderContent: {
        marginTop: 20
    }
})

const WorkOrderList = (props: any) => {
    const { visitStatus, workOrderUpdate, navigation, route } = props
    const [workOrderList, setWorkOrderList] = useState([])
    const [workOrderNum, setWorkOrderNum] = useState(0)
    const { dropDownRef } = useDropDown()
    const visit = route.params.item

    const prepareWorkOrderData = (workOrders, docMap, pictureData) => {
        workOrders.forEach(async (w) => {
            w.reference_photo =
                pictureData.filter((pic) => {
                    return pic.Type === WorkOrderService.PHOTO_TYPE.REFERENCE && pic.TargetId === w.Id
                }) || []
            w.execution_photo =
                pictureData.filter((pic) => {
                    return pic.Type === WorkOrderService.PHOTO_TYPE.EXECUTION && pic.TargetId === w.Id
                }) || []
            if (w.Display_Id_Instore__c) {
                const inStoreLocationId = w.Display_Id_Instore__c
                w.promotion_product = await InStoreMapService.getInStoreLocationProductsById(inStoreLocationId, false)
            } else {
                w.promotion_product = []
            }
        })
        setWorkOrderList(workOrders)
        setWorkOrderNum(workOrders.length)
    }

    /**
     * get image data if the local picture data is less than content document size
     */
    const getImageData = (taskIds, docIds, workOrders, docMap) => {
        const taskIdQuery = taskIds.map((id) => "'" + id + "'")
        DocumentService.getPictureData(taskIdQuery)
            .then((res) => {
                prepareWorkOrderData(workOrders, docMap, res)
            })
            .catch((err) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'WorkOrderList.getImageData',
                    `getImageData failed: ${ErrorUtils.error2String(err)}`
                )
            })
    }

    const updateOpenWorkOrders = (workOrders: any) => {
        const openWorkOrders = workOrders.filter((wo) => WorkOrderService.isOpenWorkOrder(wo))
        workOrderUpdate(openWorkOrders.length)
    }

    const getWorkOrders = async () => {
        const workOrders = await WorkOrderService.getOpenOrValidCompleteWorkOrders(visit)
        updateOpenWorkOrders(workOrders)
        if (!workOrders || workOrders.length === 0) {
            setWorkOrderList([])
            return
        }
        const taskIds = workOrders.map((workOrder) => workOrder.Id)
        const workOrderIds = workOrders.map((workOrder) => {
            return "'" + workOrder.Id + "'"
        })
        DocumentService.getContentDocOffline(workOrderIds).then((docs: any) => {
            const docMap = new Map()
            if (docs.length) {
                const contentDocIds = DocumentService.getContentDocIds(docMap, docs)
                getImageData(taskIds, contentDocIds, workOrders, docMap)
            } else {
                prepareWorkOrderData(workOrders, docMap, [])
            }
        })
    }

    /** handle complete work order */
    const completeWorkOrder = (workOrder) => {
        if (CommonParam.isSyncing) {
            dropDownRef.current.alertWithType('info', t.labels.PBNA_MOBILE_COPILOT_SYNC_IN_PROGRESS)
        } else {
            WorkOrderService.saveWorkOrder(workOrder)
                .then(() => {
                    updateOpenWorkOrders(workOrderList)
                    NetInfo.fetch().then((state) => {
                        if (state.isInternetReachable) {
                            syncWorkOrders()
                        } else {
                            CommonParam.pendingSync.workOrder = true
                            AsyncStorage.setItem('pendingSyncItems', JSON.stringify(CommonParam.pendingSync))
                        }
                    })
                })
                .catch((err) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'WorkOrderList.completeWorkOrder',
                        `completeWorkOrder failed: ${ErrorUtils.error2String(err)}`
                    )
                })
        }
    }

    useEffect(() => {
        if (!workOrderList || !workOrderList.length) {
            getWorkOrders()
        }
    }, [])

    return (
        <View style={[{ flex: 1 }, styles.content]}>
            <WorkOrderHeader
                title={t.labels.PBNA_MOBILE_WORK_ORDERS}
                count={workOrderNum}
                headerStyle={styles.workOrder}
            />

            <View style={[styles.fullWidth, styles.workOrderContent]}>
                {workOrderList.map((workOrder, idx) => {
                    const workOrderStyle = { zIndex: 100 - idx }
                    return (
                        <View key={workOrder.Id} style={workOrderStyle}>
                            <WorkOrderCard
                                workOrder={workOrder}
                                visitInProgress={visitStatus === t.labels.PBNA_MOBILE_IN_PROGRESS}
                                completeWorkOrder={completeWorkOrder}
                                saveWorkOrder={WorkOrderService.saveWorkOrder}
                                navigation={navigation}
                            />
                        </View>
                    )
                })}
            </View>
        </View>
    )
}

export default WorkOrderList

/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-08-24 01:26:36
 * @LastEditTime: 2023-05-19 16:31:39
 * @LastEditors: Mary Qian
 */
import React, { useState, useEffect } from 'react'
import {
    StyleSheet,
    View,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
    KeyboardAvoidingView,
    Dimensions
} from 'react-native'
import 'moment-timezone'
import { CommonParam } from '../../../common/CommonParam'
import { Instrumentation } from '@appdynamics/react-native-agent'
import ImagePicker from 'react-native-image-crop-picker'
import { workOrderStyles } from './WorkOrderStyle'
import { WorkOrderStatus } from '../../enums/Visit'
import Collapsible from 'react-native-collapsible'
import WorkOrderDetailInfo from './WorkOrderDetailInfo'
import WorkOrderProduct from './WorkOrderProduct'
import { WorkOrderBriefCard, WorkOrderComments, WorkOrderMarkComplete, WorkOrderTakePicture } from './WorkOrderUI'
import Utils from '../../common/DateTimeUtils'
import DocumentService from '../../service/DocumentService'
import WorkOrderService from './WorkOrderService'
import { SoupService } from '../../service/SoupService'
import { exeAsyncFunc } from '../../../common/utils/CommonUtils'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
}

const styles = StyleSheet.create({
    ...workOrderStyles,
    fullWidth: {
        marginRight: Utils.isTablet ? -80 : -22,
        marginLeft: Utils.isTablet ? -80 : -22
    }
})

interface WorkOrderCardProps {
    workOrder: any
    visitInProgress: boolean
    completeWorkOrder?: Function
    saveWorkOrder?: Function
    navigation?: any
    isManagerWorkOrder?: boolean
}

const COMPRESS_MAX_SIZE = 1080
const COMPRESS_QUALITY = 0.6

const WorkOrderCard = (props: WorkOrderCardProps) => {
    const { workOrder, visitInProgress, completeWorkOrder, saveWorkOrder } = props
    const isManagerWorkOrder = props.isManagerWorkOrder

    const [isExpand, setExpand] = useState(false)
    const [comment, setComment] = useState(workOrder.Merch_Comments__c)
    const [localImages, setLocalImages] = useState([])

    const handleCollapse = () => {
        if (!isExpand) {
            Instrumentation.reportMetric('Merchandiser WorkOrder detail screen', 1)
        }
        setExpand(!isExpand)
        LayoutAnimation.configureNext(LayoutAnimation.Presets.linear)
    }
    const handleTextInput = (text) => {
        setComment(text)
        workOrder.Merch_Comments__c = text
    }
    const handleBlur = () => {
        saveWorkOrder(workOrder)
    }
    const getLocalPhotoWithWorkOrder = async () => {
        if (isManagerWorkOrder) {
            return
        }
        await exeAsyncFunc(async () => {
            const imageArr = await DocumentService.getPhotosByWorkOrderIdOffline(workOrder.Id)
            setLocalImages(imageArr)
        }, 'getLocalPhotoWithWorkOrder')
    }
    const handleCompleteWorkOrder = () => {
        workOrder.Record_Updated__c = true
        workOrder.Status = WorkOrderStatus.COMPLETE
        workOrder.Merch_Comments__c = comment
        workOrder.Completed_By_User__c = CommonParam.userId
        workOrder.Wo_Cmplt_Dte__c = new Date().toISOString()

        completeWorkOrder(workOrder)
        handleCollapse()
    }

    const handleTakePhoto = async () => {
        if (!visitInProgress || WorkOrderService.isCompletedWorkOrder(workOrder)) {
            return
        }
        const pickerData = await ImagePicker.openCamera({
            mediaType: 'photo',
            compressImageQuality: COMPRESS_QUALITY,
            compressImageMaxHeight: COMPRESS_MAX_SIZE,
            compressImageMaxWidth: COMPRESS_MAX_SIZE,
            cropping: false,
            includeBase64: true,
            width: Dimensions.get('window').width
        })
        await SoupService.upsertDataIntoSoup('PictureData', [
            {
                TargetId: workOrder?.Id,
                Data: pickerData?.data,
                Type: 'Execution Photo',
                IsUploaded: 'false'
            }
        ])
        getLocalPhotoWithWorkOrder()
    }
    useEffect(() => {
        getLocalPhotoWithWorkOrder()
    }, [])
    return (
        <View>
            <KeyboardAvoidingView>
                <View style={styles.workOrderContainer}>
                    <TouchableOpacity style={styles.rowWithCenter} onPress={handleCollapse} activeOpacity={1}>
                        <WorkOrderBriefCard workOrder={workOrder} isExpand={isExpand} />
                    </TouchableOpacity>
                    <Collapsible collapsed={!isExpand} duration={300} renderChildrenCollapsed>
                        <WorkOrderDetailInfo workOrder={workOrder} />
                        <WorkOrderProduct workOrder={workOrder} />
                        {!isManagerWorkOrder && (
                            <View>
                                <WorkOrderComments
                                    workOrder={workOrder}
                                    isInProgress={visitInProgress}
                                    onTextChange={handleTextInput}
                                    onTextBlur={handleBlur}
                                />
                                <WorkOrderTakePicture localImages={localImages} clickTakePhoto={handleTakePhoto} />
                                <WorkOrderMarkComplete
                                    workOrder={workOrder}
                                    clickComplete={handleCompleteWorkOrder}
                                    isInProgress={visitInProgress}
                                />
                            </View>
                        )}
                    </Collapsible>
                </View>
            </KeyboardAvoidingView>
        </View>
    )
}

export default WorkOrderCard

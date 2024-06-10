/*
 * @Description:WorkOrderUI
 * @Author: Mary Qian
 * @Date: 2021-08-19 03:29:15
 * @LastEditTime: 2022-11-21 14:25:08
 * @LastEditors: Mary Qian
 */
import React from 'react'
import { View, StyleSheet, Image, TextInput, TouchableOpacity, Animated } from 'react-native'
import CText from '../../../common/components/CText'
import UpDownArrow from '../../components/common/UpDownArrow'
import { workOrderStyles } from './WorkOrderStyle'
import CameraBlack from '../../../../assets/image/icon-camera-black.svg'
import WorkOrderDetailInfo from './WorkOrderDetailInfo'
import WorkOrderProduct from './WorkOrderProduct'
import WorkOrderService from './WorkOrderService'
import PreviewImages from '../../components/common/PreviewImage'
import { t } from '../../../common/i18n/t'
import { commonStyle } from '../../../common/styles/CommonStyle'

export const styles = StyleSheet.create({
    ...workOrderStyles
})

interface WOHeaderProps {
    title: string
    count: number
    headerStyle: any
}
export const WorkOrderHeader = (props: WOHeaderProps) => {
    return (
        <View style={[styles.rowWithCenter, styles.justifyContentStart, props.headerStyle]}>
            <CText style={styles.workOrderTitle}>{props.title}</CText>
            <View style={styles.workOrderBadge}>
                <CText style={styles.workOrderNum}>{props.count}</CText>
            </View>
        </View>
    )
}

interface WOBriefCardProps {
    workOrder: any
    isExpand: boolean
}
export const WorkOrderBriefCard = (props: WOBriefCardProps) => {
    const { workOrder, isExpand } = props
    return (
        <View style={styles.rowWithCenter}>
            <View>
                {WorkOrderService.isCompletedWorkOrder(workOrder) ? (
                    <Image
                        style={[styles.iconLocation, styles.icon]}
                        source={require('../../../../assets/image/icon_checkmark_circle.png')}
                    />
                ) : null}
            </View>
            <View style={styles.boxContentTextArea}>
                <CText numberOfLines={2} ellipsizeMode="tail" style={[styles.shelfTitle]}>
                    {workOrder.Wo_Subject__c}
                </CText>
            </View>
            <UpDownArrow style={styles.upDownArrow} isExpand={isExpand} />
        </View>
    )
}

interface WOCommentsProps {
    workOrder: any
    isInProgress: boolean
    onTextChange?: any
    onTextBlur?: any
}
export const WorkOrderComments = (props: WOCommentsProps) => {
    const { workOrder, isInProgress, onTextChange, onTextBlur } = props
    return (
        <View style={styles.rowWithCenter}>
            <View style={[styles.propertyStyle, styles.underLine, { width: '100%', marginTop: 15 }]}>
                <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_COMMENTS}</CText>
                {WorkOrderService.isCompletedWorkOrder(workOrder) ? (
                    <CText style={[styles.commentStyle]}>{workOrder.Merch_Comments__c}</CText>
                ) : (
                    <TextInput
                        editable={isInProgress}
                        style={styles.commentStyle}
                        allowFontScaling={false}
                        keyboardAppearance={'light'}
                        returnKeyType={'done'}
                        placeholder="Type here to make comments:"
                        onChangeText={(text) => onTextChange(text)}
                        defaultValue={workOrder.Merch_Comments__c}
                        onBlur={onTextBlur}
                    />
                )}
            </View>
        </View>
    )
}

interface WOTakePictureProps {
    localImages: Array<any>
    clickTakePhoto: Function
}
export const WorkOrderTakePicture = (props: WOTakePictureProps) => {
    const { localImages, clickTakePhoto } = props

    return (
        <View style={styles.rowWithCenter}>
            <View style={[styles.propertyStyle, styles.rowWithCenter, styles.takePhotoContainer]}>
                <TouchableOpacity
                    onPress={() => {
                        clickTakePhoto()
                    }}
                    activeOpacity={1}
                    style={commonStyle.flexDirectionRow}
                >
                    <Image source={require('../../../../assets/image/icon-camera.png')} style={styles.takePhotoIcon} />
                    <CText style={styles.takePhotoTitle}>{t.labels.PBNA_MOBILE_TAKE_PICTURE}&nbsp;</CText>
                    <CText style={[styles.labelStyle]}>{t.labels.PBNA_MOBILE_OPTIONAL}</CText>
                </TouchableOpacity>

                <PreviewImages
                    containerStyle={styles.executionPhotoContainer}
                    imageStyle={styles.photoImg}
                    localImages={localImages}
                />
            </View>
        </View>
    )
}

interface WOMarkCompleteProps {
    workOrder: any
    isInProgress: boolean
    clickComplete: Function
}
export const WorkOrderMarkComplete = (props: WOMarkCompleteProps) => {
    const { workOrder, isInProgress, clickComplete } = props

    return (
        <View>
            <View>
                {WorkOrderService.isCompletedWorkOrder(workOrder) && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.buttonStyle, styles.completedStyle, { alignContent: 'center' }]}
                    >
                        <View style={styles.buttonContainer}>
                            <Image
                                style={[styles.icon, styles.chat]}
                                source={require('../../../../assets/image/icon-checkmark-circle.png')}
                            />
                            <CText style={styles.buttonText}>&nbsp;{t.labels.PBNA_MOBILE_COMPLETED}</CText>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
            <View>
                {isInProgress && !WorkOrderService.isCompletedWorkOrder(workOrder) && (
                    <TouchableOpacity
                        activeOpacity={1}
                        style={[styles.buttonStyle, styles.uncompletedStyle]}
                        onPress={() => {
                            clickComplete(workOrder)
                        }}
                    >
                        <CText style={styles.titleStyle}>{t.labels.PBNA_MOBILE_MARK_COMPLETE}</CText>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

interface WOEPhotoInTimelineProps {
    workOrder: any
}
export const WorkOrderExecutionPhotoInTimeline = (props: WOEPhotoInTimelineProps) => {
    const { workOrder } = props

    return (
        <View style={styles.rowWithCenter}>
            <View style={[styles.propertyStyle, styles.rowWithCenter, styles.exePhotoForTimelineWrapper]}>
                <TouchableOpacity activeOpacity={1} style={commonStyle.flexDirectionRow}>
                    <CameraBlack style={styles.takePhotoIcon} />
                    <CText style={[styles.takePhotoTitle, styles.exePhotoTitle]}>
                        {t.labels.PBNA_MOBILE_PICTURE_PROVIDED}
                    </CText>
                </TouchableOpacity>

                <PreviewImages
                    containerStyle={styles.executionPhotoContainer}
                    imageStyle={[styles.photoImg, styles.exePhoto]}
                    localImages={workOrder.execution_photo}
                />
            </View>
        </View>
    )
}

interface TimelineWorkOrderProps {
    workOrder: any
}
export const TimelineWorkOrder = (props: TimelineWorkOrderProps) => {
    const workOrder = props.workOrder

    return (
        <View>
            <Animated.View style={styles.timelineWrapper}>
                <WorkOrderDetailInfo workOrder={workOrder} />
                <WorkOrderProduct workOrder={workOrder} isForTimeline />
                {WorkOrderService.isCompletedWorkOrder(workOrder) && (
                    <View>
                        <WorkOrderComments workOrder={workOrder} isInProgress={false} />
                        <WorkOrderExecutionPhotoInTimeline workOrder={workOrder} />
                    </View>
                )}
            </Animated.View>
        </View>
    )
}

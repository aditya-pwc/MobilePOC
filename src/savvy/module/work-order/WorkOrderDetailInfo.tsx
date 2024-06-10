/*
 * @Description:WorkOrderDetailInfo
 * @Author: Mary Qian
 * @Date: 2021-08-19 04:02:16
 * @LastEditTime: 2022-11-27 12:17:39
 * @LastEditors: Mary Qian
 */

import React from 'react'
import { StyleSheet, View } from 'react-native'
import { workOrderStyles } from './WorkOrderStyle'
import CText from '../../../common/components/CText'
import PreviewImages from '../../components/common/PreviewImage'
import { formatWithTimeZone } from '../../utils/TimeZoneUtils'
import { t } from '../../../common/i18n/t'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'

const styles = StyleSheet.create({
    ...workOrderStyles
})

interface WODetailInfoProps {
    workOrder: any
}

const WorkOrderDetailInfo = (props: WODetailInfoProps) => {
    const workOrder = props.workOrder

    const renderReferencePhotos = () => {
        return (
            <View>
                <View style={styles.rowWithCenter}>
                    <View style={[styles.propertyStyle, { width: '100%' }]}>
                        <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_REF_PHOTO}</CText>
                    </View>
                </View>

                <PreviewImages
                    containerStyle={styles.referencePhotoContainer}
                    imageStyle={styles.referenceImg}
                    localImages={workOrder.reference_photo}
                />
            </View>
        )
    }

    const renderKeyValue = (key: string, value: string, isBold: boolean) => {
        return (
            <View style={styles.propertyStyle}>
                <CText style={styles.labelStyle}>{key}</CText>
                <CText style={isBold ? styles.boldValueStyle : styles.valueStyle}>{value}</CText>
            </View>
        )
    }

    return (
        <View>
            {workOrder?.Description?.length > 0 && (
                <View style={styles.rowWithCenter}>
                    <CText style={styles.description}>{workOrder.Description}</CText>
                </View>
            )}
            {renderReferencePhotos()}
            <View style={[styles.rowWithCenter, styles.baseLine]}>
                {renderKeyValue(t.labels.PBNA_MOBILE_ORDERED_BY, workOrder.Wo_Ordered_By_Name__c, false)}
                {renderKeyValue(t.labels.PBNA_MOBILE_APPROVED_BY, workOrder.Wo_Approver_Name__c, false)}
            </View>
            <View style={[styles.rowWithCenter, styles.baseLine]}>
                {renderKeyValue(
                    t.labels.PBNA_MOBILE_EXECUTION_DATE,
                    formatWithTimeZone(workOrder.ActivityDate, TIME_FORMAT.DDMMMY, true),
                    true
                )}
                {renderKeyValue(t.labels.PBNA_MOBILE_LOCATION, workOrder.Wo_Location__c, true)}
            </View>
        </View>
    )
}

export default WorkOrderDetailInfo

/**
 * @description The tile to show activity.
 * @author Shangmin Dou
 * @date 2021-06-25
 */
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import moment from 'moment'
import CallWhiteSvg from '../../../../../../assets/image/icon-call-white.svg'
import CallTelWhiteSvg from '../../../../../../assets/image/icon-call-tel-white.svg'
import CustomerSvg from '../../../../../../assets/image/icon-customer.svg'
import TaskSvg from '../../../../../../assets/image/task.svg'
import { getTaskLabel } from '../../../../helper/rep/TaskHelper'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'

interface ActivityTileProps {
    onClick: any
    activity: any
}

const styles = StyleSheet.create({
    tileStyle: {
        alignItems: 'center',
        backgroundColor: '#FFC409',
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        width: 50
    },
    callStyle: {
        backgroundColor: '#FFC409',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: 50,
        borderRadius: 10
    },
    grayTop_3: {
        color: 'gray',
        marginTop: 3
    },
    grayTop_5: {
        marginTop: 5,
        color: 'grey'
    },
    grayBottom_3: {
        color: 'gray',
        marginBottom: 3
    },
    fontStyleTop_5: {
        fontWeight: '500',
        marginTop: 5,
        fontSize: 14
    },
    fontStyleLeftTop: {
        marginTop: 5,
        marginLeft: 10,
        color: 'black'
    }
})

const ActivityTile = (props: ActivityTileProps) => {
    const { onClick, activity } = props
    const formatTime = (date) => {
        return moment(date).format('MMM D, YYYY  hh:mm A')
    }

    return (
        <TouchableOpacity
            style={commonStyle.flexDirectionRow}
            onPress={() => {
                if (onClick) {
                    onClick(activity)
                }
            }}
        >
            {activity.Subject === 'Customer Requested' && (
                <View style={commonStyle.flexRowCenter}>
                    <View style={styles.tileStyle}>
                        <CustomerSvg />
                    </View>
                    <View
                        style={{
                            marginLeft: 20
                        }}
                    >
                        <CText style={styles.grayTop_3}>{formatTime(activity.COF_Requested_Date__c)}</CText>
                        <CText
                            style={{
                                marginTop: 5
                            }}
                        >
                            {t.labels.PBNA_MOBILE_SUBMITTED_CUSTOMER_NUMBER}
                        </CText>
                    </View>
                </View>
            )}
            {activity.Subject === 'Customer Rejected' && (
                <View style={commonStyle.flexRowCenter}>
                    <View style={styles.tileStyle}>
                        <CustomerSvg />
                    </View>
                    <View
                        style={{
                            marginLeft: 20
                        }}
                    >
                        <CText style={styles.grayTop_3}>{formatTime(activity.CreatedDate)}</CText>
                        <CText
                            style={{
                                marginTop: 5
                            }}
                        >
                            {t.labels.PBNA_MOBILE_REJECTED_CUSTOMER_NUMBER}
                        </CText>
                    </View>
                </View>
            )}
            {(activity.Subject === 'Lead Logging Calls' || activity.Subject === 'PD Call') && (
                <View style={commonStyle.flexRowAlignCenter}>
                    <View style={styles.callStyle}>
                        {activity.Contact_Made__c === '1' ? <CallTelWhiteSvg /> : <CallWhiteSvg />}
                    </View>
                    <View
                        style={{
                            marginLeft: 20
                        }}
                    >
                        <CText
                            style={{
                                color: 'gray'
                            }}
                        >
                            {formatTime(activity.LastModifiedDate)}
                        </CText>
                        <CText style={styles.fontStyleTop_5}>
                            {activity.Call_Subject__c || t.labels.PBNA_MOBILE_SCHEDULED_CALL}
                        </CText>
                        {activity.Contact_Made__c === '1' && (
                            <View style={commonStyle.flexDirectionRow}>
                                <CText style={styles.grayTop_5}>{t.labels.PBNA_MOBILE_CONTACT}</CText>
                                <View
                                    style={{
                                        width: '70%'
                                    }}
                                >
                                    <CText style={styles.fontStyleLeftTop} numberOfLines={1}>
                                        {activity.Name_of_Contact__c}
                                    </CText>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            )}
            {activity.Subject === 'Lead Task' &&
                (activity.Type === 'Complete RFP' ||
                    activity.Type === 'Complete BAM' ||
                    activity.Type === 'Gather Tax Documents' ||
                    activity.Type === 'Resubmit Equipment Site Details') && (
                    <View style={commonStyle.flexRowCenter}>
                        <View style={styles.tileStyle}>
                            <TaskSvg />
                        </View>
                        <View
                            style={{
                                marginLeft: 20
                            }}
                        >
                            {activity.Status === 'Complete' && (
                                <CText style={styles.grayBottom_3}>{formatTime(activity.LastModifiedDate)}</CText>
                            )}
                            <CText
                                style={{
                                    fontWeight: '500'
                                }}
                            >
                                {getTaskLabel(activity.Type)}
                            </CText>
                            <View style={commonStyle.flexDirectionRow}>
                                <CText
                                    style={{
                                        color: 'gray'
                                    }}
                                >
                                    {t.labels.PBNA_MOBILE_DUE_DATE}&nbsp;
                                </CText>
                                <CText
                                    style={{
                                        color:
                                            activity.ActivityDate < moment().format(TIME_FORMAT.Y_MM_DD) &&
                                            activity.Status === 'Open'
                                                ? '#EB445A'
                                                : 'black'
                                    }}
                                >
                                    {moment(activity.ActivityDate).format('MMM D, YYYY')}
                                </CText>
                            </View>
                        </View>
                    </View>
                )}
        </TouchableOpacity>
    )
}

export default ActivityTile

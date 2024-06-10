/**
 * @description The component to show common task tile.
 * @author Shangmin Dou
 * @date 2021-08-25
 */
import React, { FC, useEffect, useState } from 'react'
import { Alert, Animated, I18nManager, StyleSheet, TouchableOpacity, View } from 'react-native'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import { RectButton } from 'react-native-gesture-handler'
import CText from '../../../../../common/components/CText'
import TaskSvg from '../../../../../../assets/image/task.svg'
import moment from 'moment'
import ProcessDoneModal from '../../../common/ProcessDoneModal'
import LeadSvg from '../../../../../../assets/image/taskLead.svg'
import { Log } from '../../../../../common/enums/Log'
import { getTaskLabel } from '../../../../helper/rep/TaskHelper'
import PopMessage from '../../../common/PopMessage'
import { deleteTask, markTaskAsComplete } from '../../../../utils/TaskUtils'
import { t } from '../../../../../common/i18n/t'
import CallTelWhiteSvg from '../../../../../../assets/image/icon-call-tel-white.svg'
import CallWhiteSvg from '../../../../../../assets/image/icon-call-white.svg'
import { CommonParam } from '../../../../../common/CommonParam'
import { syncDownObj } from '../../../../api/SyncUtils'
import { getAllFieldsByObjName } from '../../../../utils/SyncUtils'
import { LeadStatus } from '../../../../enums/Lead'
import { useLeadDetailFromCopilot } from '../../../../hooks/LeadHooks'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: 'white',
        borderBottomWidth: 0.9,
        borderBottomColor: '#e7e7e7',
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: '5%'
    },
    containerStyle: {
        flex: 1,
        width: '100%'
    },
    leftAction: {
        flex: 1,
        backgroundColor: '#497AFC',
        justifyContent: 'center'
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        backgroundColor: 'transparent',
        padding: 2.5
    },
    rightAction: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    taskSVGStyle: {
        alignItems: 'center',
        backgroundColor: '#FFC409',
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        width: 50
    },
    grayBottom_3: {
        color: 'gray',
        marginBottom: 3
    },
    flexRowWidth40: {
        flexDirection: 'row',
        width: '40%'
    },
    leadSVGStyle: {
        width: 5,
        height: 5,
        marginLeft: 10
    },
    svgStyleWithBackground: {
        backgroundColor: '#FFC409',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: 50,
        borderRadius: 10
    },
    callSubjectText: {
        fontWeight: '500',
        marginTop: 5,
        fontSize: 14
    }
})

interface OpenTaskTileProps {
    activity: any
    onMarkAsComplete: any
    enable: boolean
    onClick: any
    showLead?: boolean
    setEditCall?: any
    logCallFormRef?: any
    isCopilot?: boolean
}

const OpenTaskTile: FC<OpenTaskTileProps> = (props: OpenTaskTileProps) => {
    const {
        activity,
        onMarkAsComplete,
        enable,
        onClick,
        showLead,
        setEditCall,
        logCallFormRef,
        isCopilot = false
    } = props
    let swipeableRow: Swipeable
    const close = () => {
        swipeableRow?.close()
    }
    const [enableSwipe, setEnableSwipe] = useState(false)
    const leadDetail = useLeadDetailFromCopilot(activity?.Lead__c)
    useEffect(() => {
        if (activity.Subject === 'Lead Task' || activity.Subject === 'Customer Task') {
            if (activity.Subject === 'Lead Task') {
                setEnableSwipe(
                    leadDetail?.Owner_GPID_c__c === CommonParam.GPID__c &&
                        leadDetail?.Status__c === LeadStatus.NEGOTIATE &&
                        leadDetail?.COF_Triggered_c__c === '0'
                )
            } else {
                setEnableSwipe(activity.OwnerId === CommonParam.userId)
            }
        } else if (
            activity.Subject === 'Lead Logging Calls' ||
            activity.Subject === 'PD Call' ||
            activity.Subject === 'Customer Logging Calls'
        ) {
            if (activity.Subject === 'Lead Logging Calls') {
                setEnableSwipe(
                    leadDetail?.Owner_GPID_c__c === CommonParam.GPID__c &&
                        (leadDetail?.Status__c === LeadStatus.NEGOTIATE ||
                            leadDetail?.Status__c === LeadStatus.NO_SALE) &&
                        leadDetail?.COF_Triggered_c__c === '0'
                )
            } else if (activity.Subject === 'Customer Logging Calls') {
                setEnableSwipe(activity.OwnerId === CommonParam.userId)
            } else {
                setEnableSwipe(false)
            }
        } else {
            setEnableSwipe(false)
        }
    }, [activity, leadDetail])
    const handleDeleteTask = () => {
        const isTask = activity.Subject === 'Lead Task' || activity.Subject === 'Customer Task'
        Alert.alert(
            isTask ? t.labels.PBNA_MOBILE_DELETE_TASK : t.labels.PBNA_MOBILE_DELETE_CALL,
            isTask ? t.labels.PBNA_MOBILE_DELETE_TASK_MESSAGE : t.labels.PBNA_MOBILE_DELETE_CALL_MESSAGE,
            [
                {
                    text: t.labels.PBNA_MOBILE_CANCEL,
                    style: 'default'
                },
                {
                    text: t.labels.PBNA_MOBILE_DELETE,
                    style: 'default',
                    onPress: async () => {
                        try {
                            global.$globalModal.openModal()
                            await deleteTask(activity.Id, activity._soupEntryId)
                            onMarkAsComplete && onMarkAsComplete()
                            global.$globalModal.closeModal()
                            global.$globalModal.openModal(
                                <ProcessDoneModal type="success">
                                    <PopMessage>
                                        {isTask
                                            ? t.labels.PBNA_MOBILE_TASK_DELETE_SUCCESS_MSG
                                            : t.labels.PBNA_MOBILE_CALL_DELETE_SUCCESS_MSG}
                                    </PopMessage>
                                </ProcessDoneModal>
                            )
                            setTimeout(() => {
                                global.$globalModal.closeModal()
                            }, 3000)
                        } catch (e) {
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'handleDeleteTask',
                                'delete task: ' + ErrorUtils.error2String(e)
                            )
                            global.$globalModal.closeModal()
                            global.$globalModal.openModal(
                                <ProcessDoneModal type="failed">
                                    <PopMessage>
                                        {isTask
                                            ? t.labels.PBNA_MOBILE_DELETE_TASK_FAILED
                                            : t.labels.PBNA_MOBILE_DELETE_CALL_FAILED}
                                    </PopMessage>
                                </ProcessDoneModal>,
                                t.labels.PBNA_MOBILE_OK
                            )
                        }
                    }
                }
            ]
        )
    }
    const handleMarkAsComplete = () => {
        Alert.alert(t.labels.PBNA_MOBILE_MARK_COMPLETE, t.labels.PBNA_MOBILE_ALERT_MESSAGE_MARK_COMPLETE, [
            {
                text: t.labels.PBNA_MOBILE_GO_BACK
            },
            {
                text: t.labels.PBNA_MOBILE_YES_PROCEED,
                onPress: async () => {
                    try {
                        global.$globalModal.openModal()
                        await markTaskAsComplete(activity)
                        onMarkAsComplete && onMarkAsComplete()
                        global.$globalModal.closeModal()
                        global.$globalModal.openModal(
                            <ProcessDoneModal type="success">
                                <PopMessage>{t.labels.PBNA_MOBILE_TASK_MARKED_SUCCESS_MSG}</PopMessage>
                            </ProcessDoneModal>
                        )
                        setTimeout(() => {
                            global.$globalModal.closeModal()
                        }, 3000)
                    } catch (e) {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'pressHandler',
                            'update task (mark as complete): ' + ErrorUtils.error2String(e)
                        )
                        global.$globalModal.closeModal()
                        global.$globalModal.openModal(
                            <ProcessDoneModal type="failed">
                                <PopMessage>{t.labels.PBNA_MOBILE_TASK_MARK_FAILED_MESSAGE}</PopMessage>
                            </ProcessDoneModal>,
                            t.labels.PBNA_MOBILE_OK
                        )
                    }
                }
            }
        ])
    }
    const handleSyncContact = async (id) => {
        await syncDownObj(
            'Contact',
            `SELECT ${getAllFieldsByObjName('Contact').join()} ` +
                `FROM Contact WHERE AccountId = '${id}' OR Lead__c= '${id}'`
        )
    }

    const renderRightAction = (
        text: string,
        color: string,
        x: number,
        progress: Animated.AnimatedInterpolation,
        type: string
    ) => {
        const trans = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [x, 0]
        })
        const pressHandler = async () => {
            close()
            if (type === 'markAsComplete') {
                handleMarkAsComplete()
            } else if (type === 'delete') {
                handleDeleteTask()
            }
        }

        const pressCallHandler = async () => {
            close()
            if (type === 'markAsComplete') {
                isCopilot && (await handleSyncContact(activity.Lead__c || activity.WhatId))
                setEditCall(activity)
                logCallFormRef?.current?.open()
            } else if (type === 'delete') {
                handleDeleteTask()
            }
        }

        return (
            <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
                <View style={[styles.rightAction, { backgroundColor: color }]}>
                    <RectButton
                        activeOpacity={0}
                        style={[styles.rightAction]}
                        onPress={
                            activity.Subject === 'Lead Logging Calls' || activity.Subject === 'Customer Logging Calls'
                                ? pressCallHandler
                                : pressHandler
                        }
                    >
                        {type === 'markAsComplete' ? (
                            <View style={styles.rightAction}>
                                <CText style={styles.actionText}>{t.labels.PBNA_MOBILE_MARK_AS}</CText>
                                <CText style={styles.actionText}>{t.labels.PBNA_MOBILE_COMPLETE.toUpperCase()}</CText>
                            </View>
                        ) : (
                            <CText style={styles.actionText}>{text}</CText>
                        )}
                    </RectButton>
                </View>
            </Animated.View>
        )
    }

    const renderRightActions = (progress: Animated.AnimatedInterpolation) => (
        <View
            style={{
                width: 180,
                flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row'
            }}
        >
            {renderRightAction(
                t.labels.PBNA_MOBILE_MARK_COMPLETE.toUpperCase(),
                '#2DD36F',
                90,
                progress,
                'markAsComplete'
            )}
            {renderRightAction(t.labels.PBNA_MOBILE_DELETE.toUpperCase(), '#EB445A', 90, progress, 'delete')}
        </View>
    )
    const renderDueDateLine = () => {
        return (
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
                            activity.ActivityDate < moment().format(TIME_FORMAT.Y_MM_DD) && activity.Status === 'Open'
                                ? '#EB445A'
                                : 'black'
                    }}
                >
                    {moment(activity.ActivityDate).format('MMM D, YYYY')}&nbsp;
                </CText>
                {showLead && (
                    <View style={styles.flexRowWidth40}>
                        <LeadSvg style={styles.leadSVGStyle} />
                        <CText style={{ marginLeft: 10 }} numberOfLines={1}>
                            {activity.Company__c || activity.Name}
                        </CText>
                    </View>
                )}
            </View>
        )
    }
    return (
        <Swipeable
            ref={(ref) => {
                if (ref !== undefined) {
                    swipeableRow = ref
                }
            }}
            friction={1}
            containerStyle={styles.containerStyle}
            enableTrackpadTwoFingerGesture
            rightThreshold={10}
            renderRightActions={renderRightActions}
            enabled={enable && enableSwipe}
        >
            <TouchableOpacity
                style={styles.container}
                onPress={() => {
                    onClick(activity)
                }}
            >
                {(activity.Subject === 'Lead Task' || activity.Subject === 'Customer Task') &&
                    (activity.Type === 'Complete RFP' ||
                        activity.Type === 'Complete BAM' ||
                        activity.Type === 'Gather Tax Documents' ||
                        activity.Type === 'Contract/CDA Renewal' ||
                        activity.Type === 'Business Review' ||
                        activity.Type === 'Resubmit Equipment Site Details' ||
                        activity.Type === 'Follow-up/Customer Issue') && (
                        <View style={commonStyle.flexRowAlignCenter}>
                            <View style={styles.taskSVGStyle}>
                                <TaskSvg />
                            </View>
                            <View
                                style={{
                                    marginLeft: 20
                                }}
                            >
                                {activity.Status === 'Complete' && (
                                    <CText style={styles.grayBottom_3}>
                                        {moment(activity.ActivityDate).format('MMM D, YYYY  hh:mm A')}
                                    </CText>
                                )}
                                <CText
                                    style={{
                                        fontWeight: '500'
                                    }}
                                >
                                    {getTaskLabel(activity.Type)}
                                </CText>
                                {renderDueDateLine()}
                            </View>
                        </View>
                    )}
                {(activity.Subject === 'Lead Logging Calls' ||
                    activity.Subject === 'PD Call' ||
                    activity.Subject === 'Customer Logging Calls') && (
                    <View style={commonStyle.flexRowAlignCenter}>
                        <View style={styles.svgStyleWithBackground}>
                            {activity.Contact_Made__c === '1' ? <CallTelWhiteSvg /> : <CallWhiteSvg />}
                        </View>
                        <View
                            style={{
                                marginLeft: 20
                            }}
                        >
                            {activity.Status === 'Complete' && (
                                <CText style={styles.grayBottom_3}>
                                    {moment(activity.ActivityDate).format('MMM D, YYYY  hh:mm A')}
                                </CText>
                            )}
                            <CText
                                style={{
                                    fontWeight: '500'
                                }}
                            >
                                <CText style={styles.callSubjectText}>
                                    {activity.Call_Subject__c || t.labels.PBNA_MOBILE_SCHEDULED_CALL}
                                </CText>
                            </CText>
                            {renderDueDateLine()}
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        </Swipeable>
    )
}

export default OpenTaskTile

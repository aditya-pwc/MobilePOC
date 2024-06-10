/**
 * @description The component to show common task detail.
 * @author Shangmin Dou
 * @date 2021-08-25
 */
import React, { FC, useEffect, useRef, useState } from 'react'
import CText from '../../../../../common/components/CText'
import { Alert, StyleSheet, View } from 'react-native'
import { ActivityDetailProps } from '../../../../interface/LeadInterface'
import LeadFieldTile from '../common/LeadFieldTile'
import moment from 'moment'
import { Button } from 'react-native-elements'
import EditButton from '../../../common/EditButton'
import PickerTile from '../common/PickerTile'
import LeadDateTimePicker from '../common/LeadDateTimePicker'
import LeadInput from '../common/LeadInput'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import _ from 'lodash'
import { SoupService } from '../../../../service/SoupService'
import { syncUpObjUpdate } from '../../../../api/SyncUtils'
import { genSyncUpQueryByFields } from '../../../../utils/SyncUtils'
import ProcessDoneModal from '../../../common/ProcessDoneModal'
import { Log } from '../../../../../common/enums/Log'
import { CommonParam } from '../../../../../common/CommonParam'
import { LeadStatus } from '../../../../enums/Lead'
import PopMessage from '../../../common/PopMessage'
import {
    markTaskAsComplete,
    deleteTask,
    LeadTaskSubjects,
    CustomerTaskSubjects,
    renderTaskStatus
} from '../../../../utils/TaskUtils'
import { t } from '../../../../../common/i18n/t'
import DeleteButton from '../../../common/DeleteButton'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const styles = StyleSheet.create({
    centerContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center'
    },
    fullWidthCenterWithPadding: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: '5.5%'
    },
    taskDetailFont: {
        marginTop: 24,
        fontSize: 12,
        fontWeight: '700',
        color: 'black',
        fontFamily: 'Gotham-Bold'
    },
    separatorLine: {
        height: 1,
        width: '100%',
        backgroundColor: '#D3D3D3',
        marginVertical: 20
    },
    halfWidthFlexEnd: {
        width: '50%',
        alignItems: 'flex-end'
    },
    labelStyle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    fullWidthColumn: {
        flexDirection: 'column',
        width: '100%'
    },
    whiteFont_500: {
        fontWeight: '500',
        color: 'white'
    },
    buttonContainer: {
        width: '100%',
        padding: 0,
        marginTop: 30,
        borderRadius: 5
    },
    buttonStyle: {
        backgroundColor: '#00A2D9',
        height: 40
    }
})

const CommonTaskDetail: FC<ActivityDetailProps> = (props: ActivityDetailProps) => {
    const { activity, onSave, onEdit, l, setShowActivityDetail } = props
    const [editMode, setEditMode] = useState(false)
    const [activityToUpdate, setActivityToUpdate] = useState(activity)
    const activityTypeRef = useRef(null)
    const taskTypeList = l.attributes.type === 'Lead__x' ? LeadTaskSubjects : CustomerTaskSubjects
    const handlePressSave = async () => {
        try {
            global.$globalModal.openModal()
            const activityToOperate = _.cloneDeep(activityToUpdate)
            await SoupService.upsertDataIntoSoup('Task', [activityToOperate])
            const fieldsToSyncUp = ['Id', 'Type', 'ActivityDate', 'Description']
            await syncUpObjUpdate('Task', fieldsToSyncUp, genSyncUpQueryByFields('Task', fieldsToSyncUp, 'update'))
            setEditMode(false)
            onEdit && onEdit(false)
            onSave && onSave()
            global.$globalModal.closeModal()
            global.$globalModal.openModal(
                <ProcessDoneModal type="success">
                    <PopMessage>{t.labels.PBNA_MOBILE_TASK_SAVED_SUCCESS_MESSAGE}</PopMessage>
                </ProcessDoneModal>
            )
            setTimeout(() => {
                global.$globalModal.closeModal()
            }, 3000)
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'handlePressSave', 'update task: ' + ErrorUtils.error2String(e))
            global.$globalModal.closeModal()
            global.$globalModal.openModal(
                <ProcessDoneModal type="failed">
                    <PopMessage>{t.labels.PBNA_MOBILE_TASK_SAVED_FAILED_MESSAGE}</PopMessage>
                </ProcessDoneModal>,
                t.labels.PBNA_MOBILE_OK
            )
        }
    }
    const handlePressCancel = () => {
        Alert.alert(t.labels.PBNA_MOBILE_ALERT, t.labels.PBNA_MOBILE_ALERT_MESSAGE_NOT_SAVED, [
            {
                text: _.capitalize(t.labels.PBNA_MOBILE_GO_BACK)
            },
            {
                text: t.labels.PBNA_MOBILE_YES_PROCEED,
                onPress: async () => {
                    setActivityToUpdate(activity)
                    setEditMode(false)
                }
            }
        ])
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
                        await markTaskAsComplete(activityToUpdate)
                        setActivityToUpdate({ ...activityToUpdate, Status: 'Complete' })
                        onSave && onSave()
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
                            'handleMarkAsComplete',
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
    const handleDeleteTask = () => {
        Alert.alert(t.labels.PBNA_MOBILE_DELETE_TASK, t.labels.PBNA_MOBILE_DELETE_TASK_MESSAGE, [
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
                        onSave && onSave()
                        global.$globalModal.closeModal()
                        global.$globalModal.openModal(
                            <ProcessDoneModal type="success">
                                <PopMessage>{t.labels.PBNA_MOBILE_TASK_DELETE_SUCCESS_MSG}</PopMessage>
                            </ProcessDoneModal>
                        )
                        setEditMode(false)
                        setShowActivityDetail(false)
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
                                <PopMessage>{t.labels.PBNA_MOBILE_DELETE_TASK_FAILED}</PopMessage>
                            </ProcessDoneModal>,
                            t.labels.PBNA_MOBILE_OK
                        )
                    }
                }
            }
        ])
    }

    useEffect(() => {
        setActivityToUpdate(activity)
    }, [activity])
    return (
        <View style={styles.centerContainer}>
            <View style={styles.fullWidthCenterWithPadding}>
                <CText style={styles.taskDetailFont}>{t.labels.PBNA_MOBILE_TASK_DETAIL.toUpperCase()}</CText>
                <View style={styles.separatorLine} />
                <View style={commonStyle.fullWidth}>
                    {!editMode && (
                        <View style={[commonStyle.flexRowAlignCenter, commonStyle.fullWidth]}>
                            <View style={commonStyle.halfWidth}>
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_TASK_TYPE}
                                    fieldValue={activityToUpdate.Type}
                                    fieldValueStyle={{ fontWeight: '500' }}
                                />
                            </View>
                            {activityToUpdate.Status !== 'Complete' &&
                                (l.attributes.type === 'Lead__x'
                                    ? l.Owner_GPID_c__c === CommonParam.GPID__c &&
                                      l.Status__c === LeadStatus.NEGOTIATE &&
                                      l.COF_Triggered_c__c === '0'
                                    : activity.OwnerId === CommonParam.userId) && (
                                    <View style={styles.halfWidthFlexEnd}>
                                        <EditButton
                                            onClick={() => {
                                                setEditMode(true)
                                                onEdit && onEdit(true)
                                            }}
                                        />
                                    </View>
                                )}
                        </View>
                    )}
                    {editMode && (
                        <View style={{ marginTop: 15 }}>
                            <PickerTile
                                data={[
                                    `-- ${t.labels.PBNA_MOBILE_SELECT_TASK_TYPE.toUpperCase()} --`,
                                    ...taskTypeList.map((v) => {
                                        return v.k
                                    })
                                ]}
                                label={t.labels.PBNA_MOBILE_TASK_TYPE}
                                labelStyle={styles.labelStyle}
                                title={t.labels.PBNA_MOBILE_TASK_TYPE}
                                disabled={false}
                                defValue={activityToUpdate.Type}
                                placeholder={t.labels.PBNA_MOBILE_SELECT}
                                required
                                noPaddingHorizontal
                                onChange={(v) => {
                                    setActivityToUpdate({
                                        ...activityToUpdate,
                                        Type: _.find(taskTypeList, (value) => value.k === v).v
                                    })
                                }}
                                cRef={activityTypeRef}
                            />
                        </View>
                    )}
                    <View style={[commonStyle.fullWidth, commonStyle.flexDirectionRow]}>
                        <View style={commonStyle.halfWidth}>
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_CREATED_DATE}
                                fieldValue={moment(activityToUpdate.CreatedDate).format('MMM D, YYYY')}
                                fieldValueStyle={{ fontWeight: '500' }}
                            />
                        </View>
                        <View style={commonStyle.halfWidth}>
                            {editMode && (
                                <View style={{ marginTop: 15 }}>
                                    <LeadDateTimePicker
                                        fieldLabel={t.labels.PBNA_MOBILE_TASK_DUE_DATE}
                                        deferred
                                        onChange={(v) => {
                                            setActivityToUpdate({
                                                ...activityToUpdate,
                                                ActivityDate: moment(v).format(TIME_FORMAT.Y_MM_DD)
                                            })
                                        }}
                                        value={moment(activityToUpdate.ActivityDate).utc().toISOString()}
                                    />
                                </View>
                            )}
                            {!editMode && (
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_DUE_DATE}
                                    redValue={
                                        activityToUpdate.ActivityDate < moment().format(TIME_FORMAT.Y_MM_DD) &&
                                        activityToUpdate.Status === 'Open'
                                    }
                                    fieldValue={moment(activityToUpdate.ActivityDate).format('MMM D, YYYY')}
                                    fieldValueStyle={{ fontWeight: '500' }}
                                />
                            )}
                        </View>
                    </View>
                    <View style={commonStyle.fullWidth}>
                        {!editMode && (
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_TASK_DETAILS}
                                fieldValue={activityToUpdate.Description}
                            />
                        )}
                        {editMode && (
                            <LeadInput
                                fieldName={t.labels.PBNA_MOBILE_TASK_DETAILS}
                                initValue={activityToUpdate.Description}
                                onChangeText={(v) => {
                                    setActivityToUpdate({ ...activityToUpdate, Description: v })
                                }}
                                multiline
                                maxLength={255}
                            />
                        )}
                    </View>
                    <View style={[commonStyle.flexRowAlignCenter, commonStyle.fullWidth]}>
                        <View style={commonStyle.halfWidth}>
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_CREATED_BY}
                                fieldValue={activity['CreatedBy.Name']}
                                fieldValueStyle={{ fontWeight: '500' }}
                            />
                        </View>
                        <View style={commonStyle.halfWidth}>
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_TASK_STATUS}
                                fieldValue={renderTaskStatus(activityToUpdate.Status, activityToUpdate.ActivityDate)}
                                fieldValueStyle={{ fontWeight: '500' }}
                            />
                        </View>
                    </View>
                </View>
                {!editMode &&
                    (l.attributes.type === 'Lead__x'
                        ? l.Owner_GPID_c__c === CommonParam.GPID__c &&
                          l.Status__c === LeadStatus.NEGOTIATE &&
                          l.COF_Triggered_c__c === '0'
                        : activity.OwnerId === CommonParam.userId) &&
                    activityToUpdate.Status !== 'Complete' && (
                        <View style={styles.fullWidthColumn}>
                            <Button
                                title={
                                    <CText style={styles.whiteFont_500}>
                                        {t.labels.PBNA_MOBILE_MARK_COMPLETE.toUpperCase()}
                                    </CText>
                                }
                                containerStyle={styles.buttonContainer}
                                buttonStyle={styles.buttonStyle}
                                onPress={handleMarkAsComplete}
                            />
                            <DeleteButton
                                label={t.labels.PBNA_MOBILE_DELETE_THE_TASK.toUpperCase()}
                                handlePress={handleDeleteTask}
                            />
                        </View>
                    )}
            </View>
            {editMode && (
                <View style={{ marginTop: 110 }}>
                    <FormBottomButton
                        onPressCancel={handlePressCancel}
                        onPressSave={handlePressSave}
                        rightButtonLabel={t.labels.PBNA_MOBILE_SAVE}
                        relative
                    />
                </View>
            )}
        </View>
    )
}

export default CommonTaskDetail

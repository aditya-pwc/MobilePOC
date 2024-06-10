/**
 * @description Component for the user to create a task.
 * @author Shangmin Dou
 * @date 2021-04-21
 */
import React, { FC, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Modal, SafeAreaView, StyleSheet, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import HeaderCircle from '../HeaderCircle'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import LeadInput from '../common/LeadInput'
import PickerTile from '../common/PickerTile'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import LeadDateTimePicker from '../common/LeadDateTimePicker'
import _ from 'lodash'
import { syncUpObjCreate } from '../../../../api/SyncUtils'
import { genSyncUpQueryByFields } from '../../../../utils/SyncUtils'
import { SoupService } from '../../../../service/SoupService'
import { Log } from '../../../../../common/enums/Log'
import { getRecordTypeId } from '../../../../utils/CommonUtils'
import ProcessDoneModal from '../../../common/ProcessDoneModal'
import moment from 'moment'
import PopMessage from '../../../common/PopMessage'
import { t } from '../../../../../common/i18n/t'
import { CustomerTaskSubjects, LeadTaskSubjects } from '../../../../utils/TaskUtils'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { storeClassLog } from '../../../../../common/utils/LogUtils'

interface NewTaskCreationProps {
    l: any
    cRef: any
    onSave: any
    type: 'Lead' | 'RetailStore'
    isSurvey?: boolean
    openPopup?: any
    closePopup?: any
}

const styles = StyleSheet.create({
    safeAreaContainer: {
        width: '100%',
        height: '100%'
    },
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        marginTop: 15,
        paddingHorizontal: '5%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
    },
    title: {
        fontSize: 24,
        fontWeight: '900'
    },
    keyboardAwareScrollView: {
        marginTop: 70,
        height: '100%',
        width: '100%'
    },
    labelStyle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    marginTop_20: { marginTop: 20 }
})

const NewTaskCreation: FC<NewTaskCreationProps> = (props: NewTaskCreationProps) => {
    const { l, cRef, onSave, type, isSurvey, openPopup, closePopup } = props
    const [showNewTaskCreation, setShowNewTaskCreation] = useState(false)
    const [disableSave, setDisableSave] = useState(true)
    const taskTypeRef = useRef(null)
    const initTask = () => {
        return {
            Type: isSurvey ? 'Resubmit Equipment Site Details' : '',
            Description: '',
            ActivityDate: '',
            Status: 'Open',
            Subject: type === 'Lead' ? 'Lead Task' : 'Customer Task',
            RecordTypeId: null,
            Lead__c: type === 'Lead' ? l.ExternalId : '',
            WhatId: type === 'Lead' ? '' : l.AccountId
        }
    }
    const [task, setTask] = useState(initTask())
    const taskTypeList = type === 'Lead' ? LeadTaskSubjects : CustomerTaskSubjects
    const handlePressSave = async () => {
        setShowNewTaskCreation(false)
        openPopup && openPopup()
        global.$globalModal.openModal()
        try {
            const taskToCreate = _.cloneDeep(task)
            taskToCreate.RecordTypeId = await getRecordTypeId(
                type === 'Lead' ? 'Lead Activity' : 'Customer Activity',
                'Task'
            )
            if (isSurvey) {
                taskToCreate.Type = 'Resubmit Equipment Site Details'
            }
            if (type === 'Lead') {
                taskToCreate.Lead__c = l.ExternalId
            } else {
                taskToCreate.WhatId = l.AccountId
            }
            const taskSyncUpFields =
                type === 'Lead'
                    ? ['Type', 'Description', 'ActivityDate', 'Status', 'Subject', 'RecordTypeId', 'Lead__c']
                    : ['Type', 'Description', 'ActivityDate', 'Status', 'Subject', 'RecordTypeId', 'WhatId']
            await SoupService.upsertDataIntoSoup('Task', [taskToCreate])
            await syncUpObjCreate('Task', taskSyncUpFields, genSyncUpQueryByFields('Task', taskSyncUpFields, 'insert'))
            onSave && onSave()
            closePopup && closePopup()
            global.$globalModal.closeModal()
            global.$globalModal.openModal(
                <ProcessDoneModal type="success">
                    <PopMessage>
                        {type === 'Lead'
                            ? t.labels.PBNA_MOBILE_YOU_HAVE_SUCCESSFULLY_CREATED_A_TASK
                            : t.labels.PBNA_MOBILE_YOU_HAVE_SUCCESSFULLY_SCHEDULED_A_TASK}
                    </PopMessage>
                </ProcessDoneModal>
            )
            openPopup &&
                openPopup(
                    <ProcessDoneModal type="success">
                        <PopMessage>
                            {type === 'Lead'
                                ? t.labels.PBNA_MOBILE_YOU_HAVE_SUCCESSFULLY_CREATED_A_TASK
                                : t.labels.PBNA_MOBILE_YOU_HAVE_SUCCESSFULLY_SCHEDULED_A_TASK}
                        </PopMessage>
                    </ProcessDoneModal>
                )
            setTimeout(() => {
                global.$globalModal.closeModal()
                closePopup && closePopup()
            }, 3000)
        } catch (e) {
            closePopup && closePopup()
            global.$globalModal.closeModal()
            storeClassLog(Log.MOBILE_ERROR, 'handlePressSave', 'create new task: ' + ErrorUtils.error2String(e))
            global.$globalModal.openModal(
                <ProcessDoneModal type={'failed'}>
                    <PopMessage>{t.labels.PBNA_MOBILE_CREATE_TASK_FAILED}</PopMessage>
                </ProcessDoneModal>,
                t.labels.PBNA_MOBILE_OK
            )
            openPopup &&
                openPopup(
                    <ProcessDoneModal type={'failed'}>
                        <PopMessage>{t.labels.PBNA_MOBILE_CREATE_TASK_FAILED}</PopMessage>
                    </ProcessDoneModal>,
                    t.labels.PBNA_MOBILE_OK
                )
        }
    }
    useImperativeHandle(cRef, () => ({
        open: () => {
            setShowNewTaskCreation(true)
        }
    }))
    useEffect(() => {
        setDisableSave(
            !(
                !_.isEmpty(task.Type) &&
                (type === 'Lead' ? !_.isEmpty(task.Description) : true) &&
                !_.isEmpty(task.ActivityDate)
            )
        )
    }, [task, type])
    useEffect(() => {
        if (!showNewTaskCreation) {
            setTask(initTask())
            taskTypeRef.current?.reset()
        }
    }, [showNewTaskCreation])
    return (
        <Modal visible={showNewTaskCreation}>
            <SafeAreaView style={styles.safeAreaContainer}>
                <View style={styles.container}>
                    <View style={styles.titleContainer}>
                        <CText style={styles.title}>{t.labels.PBNA_MOBILE_NEW_TASK}</CText>
                        <HeaderCircle
                            onPress={() => {
                                setShowNewTaskCreation(false)
                            }}
                            transform={[{ scale: 0.85 }, { rotate: '45deg' }]}
                            color={'#0098D4'}
                        />
                    </View>
                    <KeyboardAwareScrollView
                        style={styles.keyboardAwareScrollView}
                        showsVerticalScrollIndicator={false}
                    >
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
                            disabled={isSurvey}
                            defValue={task.Type}
                            placeholder={t.labels.PBNA_MOBILE_SELECT}
                            required
                            noPaddingHorizontal
                            onChange={(v) => {
                                setTask({ ...task, Type: _.find(taskTypeList, (value) => value.k === v)?.v })
                            }}
                            cRef={taskTypeRef}
                        />
                        <View style={styles.marginTop_20}>
                            <LeadInput
                                fieldName={t.labels.PBNA_MOBILE_TASK_DETAILS}
                                onChangeText={(v) => {
                                    setTask({ ...task, Description: v })
                                }}
                                multiline
                                maxLength={255}
                            />
                        </View>
                        <LeadDateTimePicker
                            fieldLabel={t.labels.PBNA_MOBILE_TASK_DUE_DATE}
                            deferred
                            onChange={(v) => {
                                setTask({ ...task, ActivityDate: moment(v).format(TIME_FORMAT.Y_MM_DD) })
                            }}
                        />
                    </KeyboardAwareScrollView>
                </View>
            </SafeAreaView>
            <FormBottomButton
                onPressCancel={() => {
                    setShowNewTaskCreation(false)
                }}
                rightButtonLabel={t.labels.PBNA_MOBILE_ADD.toUpperCase()}
                onPressSave={handlePressSave}
                disableSave={disableSave}
            />
        </Modal>
    )
}

export default NewTaskCreation

/**
 * @description The component to show call detail.
 * @author Shangmin Dou
 * @date 2021-06-25
 */
import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import CText from '../../../../../common/components/CText'
import LeadFieldTile from '../common/LeadFieldTile'
import moment from 'moment'
import LeadBooleanFieldTile from '../common/LeadBooleanFieldTile'
import { Task } from '../../../../interface/LeadModel'
import { t } from '../../../../../common/i18n/t'
import _ from 'lodash'
import { deleteTask, renderTaskStatus } from '../../../../utils/TaskUtils'
import ProcessDoneModal from '../../../common/ProcessDoneModal'
import PopMessage from '../../../common/PopMessage'
import { Log } from '../../../../../common/enums/Log'
import { CommonParam } from '../../../../../common/CommonParam'
import { LeadStatus } from '../../../../enums/Lead'
import EditButton from '../../../common/EditButton'
import PickerTile from '../common/PickerTile'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import LeadDateTimePicker from '../common/LeadDateTimePicker'
import LeadInput from '../common/LeadInput'
import { picklistBottom } from '../../customer/equipment-tab/InstallOverviewForm'
import CreatablePickList from '../../customer/equipment-tab/CreatablePickList'
import { useContacts } from '../../../../hooks/LeadHooks'
import { SoupService } from '../../../../service/SoupService'
import { syncUpObjUpdate } from '../../../../api/SyncUtils'
import { genSyncUpQueryByFields } from '../../../../utils/SyncUtils'
import ContactForm from '../ContactForm'
import { Button } from 'react-native-elements'
import DeleteButton from '../../../common/DeleteButton'
import LogCallForm from '../LogCallForm'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { spiltStringByLength } from '../../../../utils/RepUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import LeadCheckBox from '../common/LeadCheckBox'
import { Persona, judgePersona } from '../../../../../common/enums/Persona'

interface ActivityDetailProps {
    activity: Task
    type: 'Lead' | 'RetailStore'
    onSave?: any
    onEdit?: any
    l?: any
    setShowActivityDetail?: any
    onAddContact?: any
}

const styles = StyleSheet.create({
    container: {
        width: '100%'
    },
    titleContainer: {
        width: '100%',
        alignItems: 'center'
    },
    title: {
        marginTop: 24,
        fontSize: 12,
        fontWeight: '700',
        color: 'black',
        fontFamily: 'Gotham-Bold'
    },
    splitter: {
        height: 1,
        width: '100%',
        backgroundColor: '#D3D3D3',
        marginTop: 20
    },
    subjectContainer: {
        width: '100%',
        marginTop: 20
    },
    subject: {
        fontSize: 18,
        fontWeight: '700'
    },
    logged: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400',
        marginTop: 15
    },
    ownerName: {
        fontSize: 14,
        color: 'black',
        fontWeight: '400',
        marginTop: 5
    },
    time: {
        fontSize: 14,
        color: 'rgb(99,99,99)',
        fontWeight: '400',
        marginTop: 5,
        marginLeft: 5
    },
    pickerTileLabel: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    pickerTileBorder: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        paddingRight: 12
    },
    buttonContainer: {
        width: '100%',
        padding: 0,
        marginTop: 20,
        borderRadius: 5
    },
    fullWidthPaddingHorizontal: {
        width: '100%',
        paddingHorizontal: '5.5%'
    },
    halfWidthFlexEnd: {
        alignItems: 'flex-end'
    },
    fullWidthColumn: {
        flexDirection: 'column',
        width: '100%',
        marginTop: 10
    },
    whiteFont_500: {
        fontWeight: '500',
        color: 'white'
    },
    bottomStyle: {
        backgroundColor: '#00A2D9',
        height: 40
    },
    extraHeight: {
        height: 50
    },
    fontSize15: {
        fontSize: 15
    },
    bottom22: {
        marginBottom: 22
    },
    marginLeft20: {
        marginLeft: 20
    }
})

const renderContactMadeUI = (title: string, value: string) => {
    return (
        <View style={styles.marginLeft20}>
            <LeadBooleanFieldTile fieldName={title} fieldValue={value} />
        </View>
    )
}

const renderCompleteAndDeleteButton = (
    isUncompleted: boolean,
    uncompletedCon: boolean,
    completedCon: boolean,
    onPressComp: Function,
    onPressDelete: Function
) => {
    if (isUncompleted) {
        return (
            <>
                {uncompletedCon && (
                    <View style={styles.fullWidthColumn}>
                        <Button
                            title={
                                <CText style={styles.whiteFont_500}>
                                    {t.labels.PBNA_MOBILE_MARK_COMPLETE.toUpperCase()}
                                </CText>
                            }
                            containerStyle={styles.buttonContainer}
                            buttonStyle={styles.bottomStyle}
                            onPress={() => {
                                onPressComp && onPressComp()
                            }}
                        />

                        <DeleteButton
                            label={t.labels.PBNA_MOBILE_DELETE_THE_CALL.toUpperCase()}
                            handlePress={() => {
                                onPressDelete && onPressDelete()
                            }}
                        />
                    </View>
                )}
            </>
        )
    }
    return (
        <>
            {completedCon && (
                <View style={styles.fullWidthColumn}>
                    <DeleteButton
                        label={t.labels.PBNA_MOBILE_DELETE_THE_CALL.toUpperCase()}
                        handlePress={() => {
                            onPressDelete && onPressDelete()
                        }}
                    />
                </View>
            )}
        </>
    )
}
const CallDetail = (props: ActivityDetailProps) => {
    const { activity, type, onAddContact, onSave, onEdit, l, setShowActivityDetail } = props
    const [editMode, setEditMode] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [activityToUpdate, setActivityToUpdate] = useState(activity)
    const leadCallSubjects = [
        { label: t.labels.PBNA_MOBILE_SELECT_CALL_SUBJECT, value: '-- SELECT CALL SUBJECT --' },
        { label: t.labels.PBNA_MOBILE_DISCOVERY, value: 'Discovery' },
        { label: t.labels.PBNA_MOBILE_OFFER_NEGOTIATE, value: 'Offer/Negotiate' },
        { label: t.labels.PBNA_MOBILE_PRESENT, value: 'Present' },
        { label: t.labels.PBNA_MOBILE_SIGN, value: 'Sign' },
        { label: t.labels.PBNA_MOBILE_CONVERT, value: 'Convert' },
        { label: t.labels.PBNA_MOBILE_NO_PROGRESS, value: 'No Progress' }
    ]
    const customerCallSubjects = [
        { label: t.labels.PBNA_MOBILE_SELECT_CALL_SUBJECT, value: '-- SELECT CALL SUBJECT --' },
        { label: t.labels.PBNA_MOBILE_CUSTOMER_ISSUE_FOLLOW_UP, value: 'Customer Issue / Follow-Up' },
        { label: t.labels.PBNA_MOBILE_BUSINESS_REVIEW_CONTRACT, value: 'Business Review / Contract' },
        { label: t.labels.PBNA_MOBILE_SELLING_OPPORTUNITY, value: 'Selling Opportunity' }
    ]
    const callSubjectPickList = type === 'Lead' ? leadCallSubjects : customerCallSubjects
    const paramsId = type === 'Lead' ? l.ExternalId : l?.AccountId
    const [saveTimes, setSaveTimes] = useState(0)
    const [editTask, setEditTask] = useState(false)
    const [editContact, setEditContact] = useState(false)
    const contactList = useContacts(type, paramsId, saveTimes, false)
    const callSubjectRef = useRef(null)
    const contactRef = useRef(null)
    const contactCreationFormLeadRef = useRef(null)
    const contactCreationFormStoreRef = useRef(null)
    const logCallFormRef = useRef(null)

    const handlePressAddContact = () => {
        type === 'RetailStore' && contactCreationFormStoreRef.current.open()
        type === 'Lead' && contactCreationFormLeadRef.current.open()
    }
    const setCallData = (value) => {
        const temp = _.cloneDeep(activityToUpdate)
        temp.Name_of_Contact__c = `${value.FirstName} ${value.LastName}`
        contactRef.current?.setValue(temp.Name_of_Contact__c)
        setSaveTimes(saveTimes + 1)
        onAddContact()
        setActivityToUpdate(temp)
    }

    const completeEdit = () => {
        return (
            judgePersona([Persona.FSR]) &&
            activityToUpdate.Status === 'Complete' &&
            activityToUpdate['CreatedBy.GPID__c'] === CommonParam.GPID__c
        )
    }
    const showEditBtn = () => {
        return (
            (activityToUpdate.Status !== 'Complete' &&
                (l.attributes.type === 'Lead__x'
                    ? l.Owner_GPID_c__c === CommonParam.GPID__c &&
                      (l.Status__c === LeadStatus.NEGOTIATE || l.Status__c === LeadStatus.NO_SALE) &&
                      l.COF_Triggered_c__c === '0'
                    : activityToUpdate.OwnerId === CommonParam.userId)) ||
            completeEdit()
        )
    }
    const geofenceVisitShowDelete = () => {
        return !editMode && completeEdit() && activityToUpdate.Type === 'Geofence visit'
    }
    const showCompleteAndDeleteBtn = () => {
        return (
            !editMode &&
            (type === 'Lead'
                ? l.Owner_GPID_c__c === CommonParam.GPID__c &&
                  l.Status__c === LeadStatus.NEGOTIATE &&
                  l.COF_Triggered_c__c === '0'
                : activity.OwnerId === CommonParam.userId)
        )
    }

    const renderForm = () => {
        return (
            <View>
                {type !== 'Lead' ? (
                    <ContactForm
                        cRef={contactCreationFormStoreRef}
                        fromLogCall
                        accountId={l?.AccountId}
                        onIngestFinished={setCallData}
                        contactType={type}
                    />
                ) : (
                    <ContactForm
                        fromLogCall
                        cRef={contactCreationFormLeadRef}
                        leadExternalId={l?.ExternalId}
                        onIngestFinished={setCallData}
                        l={l}
                        contactType={type}
                    />
                )}
            </View>
        )
    }

    const onEditContent = (changedTask: Task) => {
        const difSubject = activity?.Call_Subject__c !== changedTask?.Call_Subject__c
        const difMade = activity?.Contact_Made__c !== changedTask?.Contact_Made__c
        const difHotshot = activity?.Hotshot__c !== changedTask?.Hotshot__c
        const difOnsite = activity?.Onsite__c !== changedTask?.Onsite__c
        const difActivityDate = activity?.ActivityDate !== changedTask?.ActivityDate
        const difDetails = activity?.Call_Details__c !== changedTask?.Call_Details__c
        if (difSubject || difMade || difHotshot || difOnsite || difActivityDate || difDetails) {
            setEditTask(true)
        } else {
            setEditTask(false)
        }
    }
    const handlePressSave = async () => {
        try {
            global.$globalModal.openModal()
            const activityToOperate = _.cloneDeep(activityToUpdate)
            const spiltCallDetail = spiltStringByLength(activityToOperate.Call_Details__c, 255)
            activityToOperate.Call_Details__c = spiltCallDetail?.[0] || ''
            activityToOperate.Call_Details2__c = spiltCallDetail?.[1] || ''
            activityToOperate.Call_Details3__c = spiltCallDetail?.[2] || ''
            await SoupService.upsertDataIntoSoup('Task', [activityToOperate])
            const fieldsToSyncUp = [
                'Id',
                'Call_Subject__c',
                'Call_Date__c',
                'ActivityDate',
                'Call_Details__c',
                'Call_Details2__c',
                'Call_Details3__c',
                'Name_of_Contact__c',
                'Contact_Made__c',
                'Onsite__c'
            ]
            if (judgePersona([Persona.FSR])) {
                fieldsToSyncUp.push('Hotshot__c')
            }
            await syncUpObjUpdate('Task', fieldsToSyncUp, genSyncUpQueryByFields('Task', fieldsToSyncUp, 'update'))
            setEditMode(false)
            setEditTask(false)
            setEditContact(false)
            onEdit && onEdit(false)
            onSave && onSave()
            global.$globalModal.closeModal()
            global.$globalModal.openModal(
                <ProcessDoneModal type="success">
                    <PopMessage>{t.labels.PBNA_MOBILE_CALL_SAVED_SUCCESS_MESSAGE}</PopMessage>
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
                    <PopMessage>{t.labels.PBNA_MOBILE_CALL_SAVED_FAILED_MESSAGE}</PopMessage>
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
                    setEditTask(false)
                    setEditContact(false)
                }
            }
        ])
    }
    const handleDeleteCall = () => {
        Alert.alert(t.labels.PBNA_MOBILE_DELETE_CALL, t.labels.PBNA_MOBILE_DELETE_CALL_MESSAGE, [
            {
                text: t.labels.PBNA_MOBILE_CANCEL,
                style: 'cancel'
            },
            {
                text: t.labels.PBNA_MOBILE_DELETE,
                style: 'destructive',
                onPress: async () => {
                    try {
                        global.$globalModal.openModal()
                        await deleteTask(activity.Id, activity._soupEntryId)
                        onSave && onSave()
                        global.$globalModal.closeModal()
                        global.$globalModal.openModal(
                            <ProcessDoneModal type="success">
                                <PopMessage>{t.labels.PBNA_MOBILE_CALL_DELETE_SUCCESS_MSG}</PopMessage>
                            </ProcessDoneModal>
                        )
                        setEditMode(false)
                        setEditTask(false)
                        setEditContact(false)
                        setShowActivityDetail(false)
                        setTimeout(() => {
                            global.$globalModal.closeModal()
                        }, 3000)
                    } catch (e) {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'handleDeleteCall',
                            'delete call: ' + ErrorUtils.error2String(e)
                        )
                        global.$globalModal.closeModal()
                        global.$globalModal.openModal(
                            <ProcessDoneModal type="failed">
                                <PopMessage>{t.labels.PBNA_MOBILE_DELETE_CALL_FAILED}</PopMessage>
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
        <View style={styles.container}>
            <View style={styles.fullWidthPaddingHorizontal}>
                <View style={styles.titleContainer}>
                    <CText style={styles.title}>{t.labels.PBNA_MOBILE_CALL_DETAIL.toUpperCase()}</CText>
                </View>
                <View style={styles.splitter} />
                <View style={styles.subjectContainer}>
                    {!editMode && (
                        <View style={[commonStyle.flexRowSpaceCenter, commonStyle.fullWidth]}>
                            {activityToUpdate.Status !== 'Complete' ? (
                                <View style={commonStyle.halfWidth}>
                                    <LeadFieldTile
                                        fieldName={t.labels.PBNA_MOBILE_CALL_SUBJECT}
                                        fieldValue={
                                            activityToUpdate.Call_Subject__c || t.labels.PBNA_MOBILE_SCHEDULE_CALL
                                        }
                                        fieldValueStyle={styles.subject}
                                    />
                                </View>
                            ) : (
                                <CText style={styles.subject}>{activityToUpdate.Call_Subject__c}</CText>
                            )}
                            {showEditBtn() && (
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
                                    ...callSubjectPickList.map((v) => {
                                        return v.label
                                    })
                                ]}
                                label={t.labels.PBNA_MOBILE_CALL_SUBJECT_OPTIONAL}
                                labelStyle={styles.pickerTileLabel}
                                title={t.labels.PBNA_MOBILE_CALL_SUBJECT}
                                disabled={false}
                                defValue={activityToUpdate.Call_Subject__c || t.labels.PBNA_MOBILE_SCHEDULED_CALL}
                                placeholder={t.labels.PBNA_MOBILE_SELECT}
                                required={false}
                                borderStyle={styles.pickerTileBorder}
                                noPaddingHorizontal
                                onChange={(v) => {
                                    const changeSubject: Task = {
                                        ...activityToUpdate,
                                        Call_Subject__c: _.find(callSubjectPickList, (item: any) => item.label === v)
                                            ?.value
                                    }
                                    onEditContent(changeSubject)
                                    setActivityToUpdate(changeSubject)
                                }}
                                cRef={callSubjectRef}
                            />
                        </View>
                    )}
                </View>
                {!editMode && (
                    <View style={commonStyle.flexDirectionRow}>
                        <LeadBooleanFieldTile
                            fieldName={t.labels.PBNA_MOBILE_CONTACT_MADE}
                            fieldValue={activityToUpdate.Contact_Made__c === '1' ? t.labels.PBNA_MOBILE_YES : ''}
                        />
                        {completeEdit() &&
                            renderContactMadeUI(
                                t.labels.PBNA_MOBILE_HOTSHOT,
                                activityToUpdate.Hotshot__c === '1' ? t.labels.PBNA_MOBILE_YES : ''
                            )}
                        {renderContactMadeUI(
                            t.labels.PBNA_MOBILE_ONSITE,
                            activityToUpdate.Onsite__c === '1' ? t.labels.PBNA_MOBILE_YES : ''
                        )}
                    </View>
                )}
                {editMode && completeEdit() && (
                    <View style={commonStyle.flexDirectionRow}>
                        <LeadCheckBox
                            title={<CText style={styles.fontSize15}>{t.labels.PBNA_MOBILE_CONTACT_MADE}</CText>}
                            checked={activityToUpdate.Contact_Made__c === '1'}
                            editable
                            outerForm
                            customTrueValue={'1'}
                            customFalseValue={'0'}
                            onChange={(v: any) => {
                                const changedMade = {
                                    ...activityToUpdate,
                                    Contact_Made__c: v
                                }
                                onEditContent(changedMade)
                                setActivityToUpdate(changedMade)
                            }}
                        />
                        <LeadCheckBox
                            title={<CText style={styles.fontSize15}>{t.labels.PBNA_MOBILE_HOTSHOT}</CText>}
                            checked={activityToUpdate.Hotshot__c === '1'}
                            editable
                            outerForm
                            customTrueValue={'1'}
                            customFalseValue={'0'}
                            onChange={(v: any) => {
                                const changedHotshot = {
                                    ...activityToUpdate,
                                    Hotshot__c: v
                                }
                                onEditContent(changedHotshot)
                                setActivityToUpdate(changedHotshot)
                            }}
                        />
                        <LeadCheckBox
                            title={<CText style={styles.fontSize15}>{t.labels.PBNA_MOBILE_ONSITE}</CText>}
                            checked={activityToUpdate.Onsite__c === '1'}
                            editable={
                                activityToUpdate.Status === 'Complete' && activityToUpdate.Type !== 'Geofence visit'
                            }
                            outerForm
                            customTrueValue={'1'}
                            customFalseValue={'0'}
                            onChange={(v: any) => {
                                const changedOnsite = {
                                    ...activityToUpdate,
                                    Onsite__c: v
                                }
                                onEditContent(changedOnsite)
                                setActivityToUpdate(changedOnsite)
                            }}
                        />
                    </View>
                )}
                <View style={[commonStyle.fullWidth, commonStyle.flexDirectionRow]}>
                    {(activityToUpdate.Status !== 'Complete' || completeEdit()) && (
                        <View style={commonStyle.halfWidth}>
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_CALL_STATUS}
                                fieldValue={renderTaskStatus(
                                    activityToUpdate.Status,
                                    moment(activityToUpdate.ActivityDate).format(TIME_FORMAT.Y_MM_DD)
                                )}
                                fieldValueStyle={{ fontWeight: '500' }}
                            />
                        </View>
                    )}
                    <View style={commonStyle.halfWidth}>
                        {editMode && !completeEdit() && (
                            <View style={{ marginTop: 15 }}>
                                <LeadDateTimePicker
                                    fieldLabel={t.labels.PBNA_MOBILE_CALL_DATE}
                                    deferred
                                    onChange={(v) => {
                                        const changedDate = {
                                            ...activityToUpdate,
                                            Call_Date__c: `${moment(v).startOf('day').utc().toISOString()}`,
                                            ActivityDate: moment(v).format(TIME_FORMAT.Y_MM_DD)
                                        }
                                        onEditContent(changedDate)
                                        setActivityToUpdate(changedDate)
                                    }}
                                    value={moment(activityToUpdate.ActivityDate).utc().toISOString()}
                                />
                            </View>
                        )}
                        {(!editMode || (editMode && completeEdit())) && (
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_CALL_DATE}
                                redValue={
                                    activityToUpdate.ActivityDate < moment().format(TIME_FORMAT.Y_MM_DD) &&
                                    activityToUpdate.Status === 'Open'
                                }
                                fieldValue={moment(activityToUpdate.ActivityDate).format('MMM D, YYYY hh:mm A')}
                                fieldValueStyle={{ fontWeight: activityToUpdate.Status !== 'Complete' ? '500' : '400' }}
                                containerStyle={editMode && completeEdit() && styles.bottom22}
                            />
                        )}
                    </View>
                </View>
                <View style={commonStyle.fullWidth}>
                    {!editMode && (
                        <LeadFieldTile
                            fieldName={t.labels.PBNA_MOBILE_CONTACT}
                            fieldValue={activityToUpdate.Name_of_Contact__c}
                            fieldValueStyle={{ fontWeight: activityToUpdate.Status !== 'Complete' ? '500' : '400' }}
                        />
                    )}
                    {editMode && (
                        <View>
                            <CreatablePickList
                                label={t.labels.PBNA_MOBILE_SELECT_CONTACT_OPTIONAL}
                                data={contactList}
                                showValue={(v) => {
                                    return v?.Name
                                }}
                                defValue={activityToUpdate.Name_of_Contact__c}
                                onApply={(v: any) => {
                                    setEditContact(true)
                                    setActivityToUpdate({
                                        ...activityToUpdate,
                                        Name_of_Contact__c: v?.Name
                                    })
                                }}
                                lastListItem={picklistBottom()}
                                onLastItemClick={() => {
                                    handlePressAddContact()
                                }}
                                cRef={contactRef}
                                onClear={() => {
                                    if (activity.Name_of_Contact__c !== '') {
                                        setEditContact(true)
                                    } else {
                                        setEditContact(false)
                                    }
                                    setActivityToUpdate({
                                        ...activityToUpdate,
                                        Name_of_Contact__c: ''
                                    })
                                }}
                            />
                            {renderForm()}
                        </View>
                    )}
                </View>
                <View style={commonStyle.fullWidth}>
                    {!editMode && (
                        <LeadFieldTile
                            fieldName={t.labels.PBNA_MOBILE_CALL_DETAILS}
                            fieldValue={activityToUpdate.Call_Details__c}
                            fieldValueStyle={{ fontWeight: activityToUpdate.Status !== 'Complete' ? '500' : '400' }}
                        />
                    )}
                    {editMode && (
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_CALL_DETAILS}
                            initValue={activityToUpdate.Call_Details__c}
                            onChangeText={(v) => {
                                const changedDetails = { ...activityToUpdate, Call_Details__c: v }
                                onEditContent(changedDetails)
                                setActivityToUpdate(changedDetails)
                            }}
                            multiline
                            maxLength={765}
                        />
                    )}
                </View>
                {activityToUpdate.Status === 'Complete' && (
                    <View>
                        <CText style={styles.logged}>{t.labels.PBNA_MOBILE_LOGGED_BY}</CText>
                        <View style={commonStyle.flexDirectionRow}>
                            <CText style={styles.ownerName}>{activity['Owner.Name']}</CText>
                            <CText style={styles.time}>
                                |{' '}
                                {moment(isCompleted ? moment() : activityToUpdate.LastModifiedDate).format(
                                    'MMM D, YYYY hh:mm A'
                                )}
                            </CText>
                        </View>
                    </View>
                )}
                {renderCompleteAndDeleteButton(
                    activityToUpdate.Status !== 'Complete',
                    showCompleteAndDeleteBtn(),
                    geofenceVisitShowDelete(),
                    () => {
                        logCallFormRef?.current?.open()
                        setEditMode(false)
                        setEditTask(false)
                        setEditContact(false)
                    },
                    handleDeleteCall
                )}
                <View style={styles.extraHeight} />
            </View>
            <LogCallForm
                onAddContact={onAddContact}
                cRef={logCallFormRef}
                onSave={onSave}
                type={type}
                l={l}
                customer={l}
                isEdit
                editCall={activityToUpdate}
                setEditCall={setActivityToUpdate}
                setIsCompleted={setIsCompleted}
            />
            {editMode && (
                <View style={{ marginTop: 60 }}>
                    <FormBottomButton
                        disableSave={!(editTask || editContact)}
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

export default CallDetail

/**
 * @description Component for the user to log a call.
 * @author Shangmin Dou
 * @date 2021-04-21
 */
import React, { FC, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Modal, Image, View, SafeAreaView, StyleSheet } from 'react-native'
import CText from '../../../../common/components/CText'
import HeaderCircle from './HeaderCircle'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import LeadCheckBox from './common/LeadCheckBox'
import LeadInput from './common/LeadInput'
import PickerTile from './common/PickerTile'
import * as RNLocalize from 'react-native-localize'
import moment from 'moment'
import _ from 'lodash'
import { getRecordTypeId } from '../../../utils/CommonUtils'
import { syncUpObjCreateFromMem, syncUpObjUpdateFromMem } from '../../../api/SyncUtils'
import ProcessDoneModal from '../../common/ProcessDoneModal'
import { refreshKpiBarAction } from '../../../redux/action/LeadActionType'
import { useDispatch } from 'react-redux'
import { useContacts, useDisableLogCallSave, useLeadUpdate } from '../../../hooks/LeadHooks'
import { buildTaskAndLeadData } from '../../../helper/rep/LogCallFormHelper'
import { filterExistFields } from '../../../utils/SyncUtils'
import { Log } from '../../../../common/enums/Log'
import { t } from '../../../../common/i18n/t'
import { picklistBottom } from '../customer/equipment-tab/InstallOverviewForm'
import ContactForm from './ContactForm'
import CreatablePickList from '../customer/equipment-tab/CreatablePickList'
import LeadDateTimePicker from './common/LeadDateTimePicker'
import LeadFieldTile from './common/LeadFieldTile'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { spiltStringByLength } from '../../../utils/RepUtils'
import { LeadStatus } from '../../../enums/Lead'
import { Persona, isPersonaFSManager, judgePersona } from '../../../../common/enums/Persona'
import { CommonParam } from '../../../../common/CommonParam'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const timezone = RNLocalize.getTimeZone()
moment.tz.setDefault(timezone)

interface LogCallFormProps {
    cRef: any
    l?: any
    onSave: any
    onAddContact: () => void
    type: 'Lead' | 'RetailStore'
    customer?: any
    isEdit?: boolean
    editCall?: any
    setEditCall?: any
    isCopilot?: boolean
    setIsCompleted?: any
}
const styles = StyleSheet.create({
    checkedIcon: {
        width: 20,
        height: 20,
        marginRight: 5
    },
    width50: {
        width: '50%'
    },
    fontSize15: {
        fontSize: 15
    },
    emptyTextCon: {
        alignItems: 'center'
    },
    successImg: {
        width: 60,
        height: 57,
        marginBottom: 20
    },
    successText: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    },
    logCallFailed: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    },
    fullView: {
        width: '100%',
        height: '100%'
    },
    fullCon: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        marginTop: 15,
        paddingHorizontal: '5%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    logACallView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
    },
    lodACallText: {
        fontSize: 24,
        fontWeight: '900'
    },
    awareView: {
        marginTop: 70,
        height: '100%',
        width: '100%'
    },
    radioBtnCon: {
        flexDirection: 'row',
        marginBottom: 30
    },
    pickLabel: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    pickBorder: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        paddingRight: 12
    },
    margin20: {
        marginTop: 20
    },
    margin15: {
        marginTop: -15
    }
})

const initCall = (type) => {
    return {
        Contact_Made__c: '1',
        Onsite__c: '0',
        Name_of_Contact__c: '',
        Call_Details__c: '',
        Call_Details2__c: '',
        Call_Details3__c: '',
        Call_Date__c: new Date().toISOString(),
        ActivityDate: new Date().toISOString(),
        Call_Subject__c: '',
        RecordTypeId: null,
        Status: 'Open',
        Subject: type === 'Lead' ? 'Lead Logging Calls' : 'Customer Logging Calls',
        Lead__c: null
    }
}

const LogCallForm: FC<LogCallFormProps> = (props: LogCallFormProps) => {
    const {
        cRef,
        l,
        onSave,
        type,
        customer,
        onAddContact,
        isEdit,
        editCall,
        setEditCall,
        isCopilot = false,
        setIsCompleted
    } = props
    const paramsId = type === 'Lead' ? l?.ExternalId || l?.Lead__c : customer?.AccountId || customer?.WhatId
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
    const [isScheduleCall, setIsScheduleCall] = useState(false)
    const [showLogCallForm, setShowLogCallForm] = useState(false)
    const [call, setCall] = useState(initCall(type))
    const disableSave = useDisableLogCallSave(call, isScheduleCall)
    const [saveTimes, setSaveTimes] = useState(0)
    const contactCreationFormLeadRef = useRef(null)
    const contactCreationFormStoreRef = useRef(null)
    const callSubjectRef = useRef(null)
    const callDetailRef = useRef(null)
    const leadUpDateList = useLeadUpdate(isCopilot ? l.Lead__c : '')
    const dispatch = useDispatch()
    const contactRef = useRef(null)
    useImperativeHandle(cRef, () => ({
        open: () => {
            setShowLogCallForm(true)
        }
    }))

    const handlePressAddContact = () => {
        type === 'RetailStore' && contactCreationFormStoreRef.current.open()
        type === 'Lead' && contactCreationFormLeadRef.current.open()
    }

    const contactList = useContacts(type, paramsId, saveTimes, showLogCallForm)

    useEffect(() => {
        if (!showLogCallForm) {
            setCall(initCall(type))
            setIsScheduleCall(false)
            callSubjectRef.current?.reset()
        }
        if (isEdit) {
            setCall(_.cloneDeep(editCall))
        }
    }, [showLogCallForm, isEdit])

    const setCallData = (value) => {
        const temp = _.cloneDeep(call)
        temp.Name_of_Contact__c = `${value.FirstName} ${value.LastName}`
        contactRef.current?.setValue(temp.Name_of_Contact__c)
        setSaveTimes(saveTimes + 1)
        onAddContact()
        setCall(temp)
    }

    const renderForm = () => {
        return (
            <View>
                {type !== 'Lead' ? (
                    <ContactForm
                        cRef={contactCreationFormStoreRef}
                        fromLogCall
                        accountId={customer?.AccountId}
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
    const renderRadioButton = () => {
        return (
            <View style={commonStyle.flexDirectionRow}>
                <View style={styles.width50}>
                    <LeadCheckBox
                        title={<CText style={styles.fontSize15}>{t.labels.PBNA_MOBILE_LOG_CALL}</CText>}
                        checked={!isScheduleCall}
                        editable
                        checkedIcon={<Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />}
                        uncheckedIcon={<Image source={ImageSrc.IMG_UNCHECK_CIRCLE} style={styles.checkedIcon} />}
                        customFalseValue={'0'}
                        customTrueValue={'1'}
                        outerForm
                        onChange={() => {
                            setIsScheduleCall(false)
                            contactRef.current?.setValue('')
                            callSubjectRef.current?.resetNull()
                            callDetailRef.current?.reset()
                            setCall({
                                ...call,
                                Status: 'Complete',
                                Call_Date__c: new Date().toISOString(),
                                ActivityDate: new Date().toISOString(),
                                Contact_Made__c: '1',
                                Onsite__c: '0',
                                Name_of_Contact__c: '',
                                Call_Subject__c: '',
                                Call_Details__c: '',
                                Call_Details2__c: '',
                                Call_Details3__c: ''
                            })
                        }}
                    />
                </View>
                <LeadCheckBox
                    title={<CText style={styles.fontSize15}>{t.labels.PBNA_MOBILE_SCHEDULE_CALL}</CText>}
                    checked={isScheduleCall}
                    editable={
                        !(
                            (l?.Status__c === LeadStatus.OPEN &&
                                (judgePersona([Persona.PSR, Persona.FSR]) || CommonParam.leadFuncBundle)) ||
                            isPersonaFSManager()
                        )
                    }
                    checkedIcon={<Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />}
                    uncheckedIcon={<Image source={ImageSrc.IMG_UNCHECK_CIRCLE} style={styles.checkedIcon} />}
                    disableUncheckedIcon={
                        <Image source={ImageSrc.IMG_UNCHECK_CIRCLE_GRAY} style={styles.checkedIcon} />
                    }
                    customFalseValue={'0'}
                    customTrueValue={'1'}
                    outerForm
                    onChange={() => {
                        setIsScheduleCall(true)
                        contactRef.current?.setValue('')
                        callSubjectRef.current?.resetNull()
                        callDetailRef.current?.reset()
                        setCall({
                            ...call,
                            Status: 'Open',
                            Call_Date__c: '',
                            ActivityDate: '',
                            Contact_Made__c: '0',
                            Onsite__c: '0',
                            Name_of_Contact__c: '',
                            Call_Subject__c: '',
                            Call_Details__c: '',
                            Call_Details2__c: '',
                            Call_Details3__c: ''
                        })
                    }}
                />
            </View>
        )
    }
    const handlePressSave = async () => {
        setShowLogCallForm(false)
        global.$globalModal.openModal()
        const callToCreate = _.cloneDeep(call)
        const spiltCallDetail = spiltStringByLength(callToCreate.Call_Details__c, 255)
        callToCreate.Call_Details__c = spiltCallDetail?.[0] || ''
        callToCreate.Call_Details2__c = spiltCallDetail?.[1] || ''
        callToCreate.Call_Details3__c = spiltCallDetail?.[2] || ''
        const leadToUpdate = _.cloneDeep(isCopilot ? leadUpDateList : l)
        try {
            callToCreate.RecordTypeId = await getRecordTypeId(
                type === 'Lead' ? 'Lead Activity' : 'Customer Activity',
                'Task'
            )
            callToCreate.Contact_Made__c = isScheduleCall ? '' : callToCreate.Contact_Made__c
            callToCreate.Status = isScheduleCall ? 'Open' : 'Complete'
            const refreshKpiBar = buildTaskAndLeadData(type, callToCreate, leadToUpdate, customer)
            const leadSyncUpFields = [
                'Id',
                'Last_Task_Modified_Date_c__c',
                'Rep_Last_Modified_Date_c__c',
                'Call_Counter_c__c',
                'Lead_Sub_Status_c__c',
                'Contact_Made_Counter_c__c'
            ]
            const taskSyncUpFields =
                type === 'Lead'
                    ? [
                          'Contact_Made__c',
                          'Onsite__c',
                          'Name_of_Contact__c',
                          'Call_Details__c',
                          'Call_Details2__c',
                          'Call_Details3__c',
                          'Call_Date__c',
                          'ActivityDate',
                          'Call_Subject__c',
                          'RecordTypeId',
                          'Status',
                          'Subject',
                          'Lead__c'
                      ]
                    : [
                          'Contact_Made__c',
                          'Onsite__c',
                          'Name_of_Contact__c',
                          'Call_Details__c',
                          'Call_Details2__c',
                          'Call_Details3__c',
                          'Call_Date__c',
                          'ActivityDate',
                          'Call_Subject__c',
                          'RecordTypeId',
                          'Status',
                          'Subject',
                          'WhatId'
                      ]
            const taskUpdateFields =
                type === 'Lead'
                    ? [
                          'Id',
                          'Contact_Made__c',
                          'Onsite__c',
                          'Name_of_Contact__c',
                          'Call_Details__c',
                          'Call_Details2__c',
                          'Call_Details3__c',
                          'Call_Date__c',
                          'ActivityDate',
                          'Call_Subject__c',
                          'RecordTypeId',
                          'Status',
                          'Subject',
                          'Lead__c'
                      ]
                    : [
                          'Id',
                          'Contact_Made__c',
                          'Onsite__c',
                          'Name_of_Contact__c',
                          'Call_Details__c',
                          'Call_Details2__c',
                          'Call_Details3__c',
                          'Call_Date__c',
                          'ActivityDate',
                          'Call_Subject__c',
                          'RecordTypeId',
                          'Status',
                          'Subject',
                          'WhatId'
                      ]
            if (type === 'Lead') {
                await syncUpObjUpdateFromMem('Lead__x', filterExistFields('Lead__x', [leadToUpdate], leadSyncUpFields))
            }
            if (isEdit) {
                await syncUpObjUpdateFromMem('Task', filterExistFields('Task', [callToCreate], taskUpdateFields)).then(
                    () => {
                        if (setEditCall) {
                            const temp = _.cloneDeep(callToCreate)
                            temp.Call_Details__c = `${temp.Call_Details__c}${temp.Call_Details2__c}${temp.Call_Details3__c}`
                            setEditCall(temp)
                            if (setIsCompleted) {
                                setIsCompleted(true)
                            }
                        }
                    }
                )
            } else {
                await syncUpObjCreateFromMem('Task', filterExistFields('Task', [callToCreate], taskSyncUpFields))
            }
            if (refreshKpiBar) {
                dispatch(refreshKpiBarAction())
            }
            global.$globalModal.closeModal()
            global.$globalModal.openModal(
                <View style={styles.emptyTextCon}>
                    <Image style={styles.successImg} source={ImageSrc.ICON_SUCCESS} />
                    <CText style={styles.successText}>
                        {isScheduleCall
                            ? t.labels.PBNA_MOBILE_YOUR_CALL_HAS_BEEN_SUCCESSFULLY_SCHEDULED
                            : t.labels.PBNA_MOBILE_YOUR_CALL_HAS_BEEN_SUCCESSFULLY_LOGGED}
                    </CText>
                </View>
            )
            if (onSave) {
                onSave()
            }
            setTimeout(() => {
                global.$globalModal.closeModal()
            }, 3000)
        } catch (e) {
            global.$globalModal.openModal(
                <ProcessDoneModal type={'failed'}>
                    <CText numberOfLines={3} style={styles.logCallFailed}>
                        {t.labels.PBNA_MOBILE_LOG_A_CALL_FAILED}
                    </CText>
                </ProcessDoneModal>,
                t.labels.PBNA_MOBILE_OK
            )
            storeClassLog(
                Log.MOBILE_ERROR,
                'handlePressSave',
                'log a call: ' +
                    ErrorUtils.error2String(e) +
                    JSON.stringify(callToCreate) +
                    JSON.stringify(leadToUpdate)
            )
        }
    }
    return (
        <Modal visible={showLogCallForm}>
            <SafeAreaView style={styles.fullView}>
                <View style={styles.fullCon}>
                    <View style={styles.logACallView}>
                        <CText style={styles.lodACallText}>
                            {isEdit ? t.labels.PBNA_MOBILE_LOG_A_CALL : t.labels.PBNA_MOBILE_LOG_SCHEDULE_CALL}
                        </CText>
                        <HeaderCircle
                            onPress={() => {
                                setIsScheduleCall(false)
                                setShowLogCallForm(false)
                            }}
                            transform={[{ scale: 0.85 }, { rotate: '45deg' }]}
                            color={'#0098D4'}
                        />
                    </View>
                    <KeyboardAwareScrollView style={styles.awareView} showsVerticalScrollIndicator={false}>
                        {!isEdit && renderRadioButton()}
                        <View style={styles.radioBtnCon}>
                            <View style={styles.width50}>
                                <LeadCheckBox
                                    title={<CText style={styles.fontSize15}>{t.labels.PBNA_MOBILE_CONTACT_MADE}</CText>}
                                    checked={call.Contact_Made__c === '1' && !isScheduleCall}
                                    editable={!isScheduleCall}
                                    outerForm
                                    customTrueValue={'1'}
                                    customFalseValue={'0'}
                                    onChange={(v: any) => {
                                        if (v) {
                                            setCall({
                                                ...call,
                                                Contact_Made__c: v
                                            })
                                        }
                                    }}
                                />
                            </View>
                            <LeadCheckBox
                                title={<CText style={styles.fontSize15}>{t.labels.PBNA_MOBILE_ONSITE}</CText>}
                                checked={call.Onsite__c === '1' && !isScheduleCall}
                                editable={!isScheduleCall}
                                outerForm
                                customTrueValue={'1'}
                                customFalseValue={'0'}
                                onChange={(v: any) => {
                                    if (v) {
                                        setCall({
                                            ...call,
                                            Onsite__c: v
                                        })
                                    }
                                }}
                            />
                        </View>
                        <View>
                            <CreatablePickList
                                label={
                                    isScheduleCall
                                        ? t.labels.PBNA_MOBILE_SELECT_CONTACT_OPTIONAL
                                        : t.labels.PBNA_MOBILE_SELECT_CONTACT
                                }
                                data={contactList}
                                showValue={(v) => {
                                    return v?.Name
                                }}
                                defValue={isEdit ? editCall?.Name_of_Contact__c : ''}
                                onApply={(v: any) => {
                                    setCall({
                                        ...call,
                                        Name_of_Contact__c: v?.Name
                                    })
                                }}
                                lastListItem={picklistBottom()}
                                onLastItemClick={() => {
                                    handlePressAddContact()
                                }}
                                cRef={contactRef}
                                onClear={() => {
                                    setCall({
                                        ...call,
                                        Name_of_Contact__c: ''
                                    })
                                }}
                            />
                        </View>

                        {renderForm()}

                        <PickerTile
                            data={[
                                ...callSubjectPickList.map((v) => {
                                    return v.label
                                })
                            ]}
                            label={
                                isScheduleCall
                                    ? t.labels.PBNA_MOBILE_CALL_SUBJECT_OPTIONAL
                                    : t.labels.PBNA_MOBILE_CALL_SUBJECT
                            }
                            labelStyle={styles.pickLabel}
                            title={t.labels.PBNA_MOBILE_CALL_SUBJECT}
                            disabled={false}
                            defValue={isEdit ? editCall?.Call_Subject__c : call.Call_Subject__c}
                            placeholder={t.labels.PBNA_MOBILE_SELECT}
                            required={false}
                            borderStyle={styles.pickBorder}
                            noPaddingHorizontal
                            onChange={(v) => {
                                setCall({
                                    ...call,
                                    Call_Subject__c: _.find(callSubjectPickList, (item: any) => item.label === v)?.value
                                })
                            }}
                            cRef={callSubjectRef}
                        />
                        <View style={styles.margin20}>
                            <LeadInput
                                fieldName={
                                    call.Contact_Made__c === '1' && !isScheduleCall
                                        ? t.labels.PBNA_MOBILE_CALL_DETAILS
                                        : t.labels.PBNA_MOBILE_CALL_DETAILS_OPTIONAL
                                }
                                initValue={isEdit ? editCall?.Call_Details__c : ''}
                                fieldValue={call.Call_Details__c}
                                maxLength={765}
                                onChangeText={(v) => {
                                    setCall({
                                        ...call,
                                        Call_Details__c: v
                                    })
                                }}
                                multiline
                                placeholder={t.labels.PBNA_MOBILE_ENTER}
                                cRef={callDetailRef}
                            />
                        </View>
                        {isScheduleCall || isEdit ? (
                            <LeadDateTimePicker
                                fieldLabel={t.labels.PBNA_MOBILE_CALL_DATE}
                                deferred
                                onChange={(v) => {
                                    setCall({
                                        ...call,
                                        Call_Date__c: `${moment(v).startOf('day').utc().toISOString()}`,
                                        ActivityDate: moment(v).format(TIME_FORMAT.Y_MM_DD)
                                    })
                                }}
                                value={isEdit ? moment(editCall?.ActivityDate).format(TIME_FORMAT.Y_MM_DD) : ''}
                                inputDate={isEdit}
                            />
                        ) : (
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_CALL_DATE}
                                containerStyle={styles.margin15}
                                fieldValue={moment(new Date().toISOString()).format(TIME_FORMAT.MMM_DD_YYYY)}
                            />
                        )}
                    </KeyboardAwareScrollView>
                </View>
            </SafeAreaView>
            <FormBottomButton
                onPressCancel={() => {
                    setShowLogCallForm(false)
                }}
                disableSave={disableSave}
                onPressSave={handlePressSave}
                rightButtonLabel={
                    isScheduleCall ? t.labels.PBNA_MOBILE_SCHEDULE_CALL : t.labels.PBNA_MOBILE_LOG_CALL.toUpperCase()
                }
            />
        </Modal>
    )
}
export default LogCallForm

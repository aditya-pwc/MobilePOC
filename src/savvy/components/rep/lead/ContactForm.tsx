/**
 * @description Modal for editing contact.
 * @author Shangmin Dou
 * @date 2021-06-04
 */
import React, { useState, useRef, useEffect, useImperativeHandle, FC } from 'react'
import { StyleSheet, View, Modal, Alert, Image, SafeAreaView } from 'react-native'
import CText from '../../../../common/components/CText'
import { Input } from 'react-native-elements'
import HeaderCircle from './HeaderCircle'
import LeadInput from './common/LeadInput'
import PhoneNumberInput from './common/PhoneNumberInput'
import PickerTile from './common/PickerTile'
import EmailAddressInput from './common/EmailAddressInput'
import LeadCheckBox from './common/LeadCheckBox'
import _ from 'lodash'
import { filterExistFields } from '../../../utils/SyncUtils'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import ProcessDoneModal from '../../common/ProcessDoneModal'
import { useDisableContactSave, usePrimarySecondaryContacts } from '../../../hooks/LeadHooks'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { syncUpObjCreateFromMem, syncUpObjUpdateFromMem } from '../../../api/SyncUtils'
import DeleteButton from '../../common/DeleteButton'
import { deleteContactAndUpdateLead } from '../../../helper/rep/ContactFormHelper'
import { Log } from '../../../../common/enums/Log'
import { t } from '../../../../common/i18n/t'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

interface ContactCreationFormProps {
    cRef: any
    leadExternalId?: string
    onIngestFinished: any
    editMode?: boolean
    onCloseDetail?: any
    l?: any
    accountId?: string
    contactType: 'Lead' | 'RetailStore'
    onApply?: any
    globalModalRef?: any
    fromLogCall?: boolean
}

const styles = StyleSheet.create({
    labelStyle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    checkedIcon: {
        width: 20,
        height: 20,
        marginRight: 5
    },
    messageStyle: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    },
    editAContact: {
        fontSize: 24,
        fontWeight: '900'
    },
    contactContainer: {
        backgroundColor: 'white',
        marginTop: 15,
        paddingHorizontal: '5%'
    },
    marginTop70: {
        marginTop: 70
    },
    width48: {
        width: '48%'
    },
    marginTop15: {
        marginTop: 15
    },
    paddingHorizontal_0: {
        paddingHorizontal: 0
    },
    fontSize_14: {
        fontSize: 14
    },
    inputBorderBottomColor: {
        borderBottomColor: '#D3D3D3'
    },
    phoneOptionText: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    marginTop_25: {
        marginTop: 25
    },
    marginBottom_15: {
        marginBottom: 15
    },
    containerStyle: {
        marginBottom: 22,
        marginTop: 5
    },
    setContactAsText: {
        fontWeight: '700',
        fontSize: 12
    },
    fontSize_11: {
        fontSize: 11
    },
    leadContainer: {
        backgroundColor: '#FFFFFF',
        alignItems: 'flex-end'
    },
    placeholderStyle: {
        height: 150,
        width: '100%'
    }
})

const MAX_NOTE_LENGTH = 1000

const ContactForm: FC<ContactCreationFormProps> = (props: ContactCreationFormProps) => {
    const {
        cRef,
        leadExternalId,
        accountId,
        onIngestFinished,
        editMode,
        onCloseDetail,
        l,
        contactType,
        globalModalRef,
        fromLogCall = false
    } = props
    const [showContactForm, setShowContactForm] = useState(false)
    const { primaryContact, secondaryContact } = usePrimarySecondaryContacts(
        contactType,
        contactType === 'RetailStore' ? accountId : leadExternalId,
        showContactForm
    )
    const primaryPhoneTypeRef = useRef(null)
    const secondaryPhoneTypeRef = useRef(null)
    const emailInputRef = useRef(null)
    const [contactAs, setContactAs] = useState('0')
    const textMaxLength = 30
    const initContact = () => {
        const generalContractObj = {
            Id: null,
            FirstName: null,
            LastName: null,
            Phone: null,
            Primary_Phone_Type__c: null,
            MobilePhone: null,
            Second_Phone_Type__c: null,
            Email: null,
            Preferred_Contact_Method__c: null,
            Notes__c: null,
            Primary_Contact__c: null,
            Primary_Phone_Extension__c: null,
            Secondary_Contact__c: null,
            Second_Phone_Extension__c: null,
            Title: null
        }
        if (contactType === 'RetailStore') {
            return {
                ...generalContractObj,
                AccountId: accountId
            }
        }
        return {
            ...generalContractObj,
            Lead__c: leadExternalId !== null ? leadExternalId : null
        }
    }
    const [contact, setContact] = useState(initContact())
    const disableSave = useDisableContactSave(
        emailInputRef.current?.correct,
        contact,
        contactAs,
        primaryContact,
        editMode
    )
    const PHONE_TYPE = t.labels.PBNA_MOBILE_PHONE_TYPE
    const ENTER_TEXT = t.labels.PBNA_MOBILE_ENTER_TEXT
    const phoneTypeMapping = [
        { k: t.labels.PBNA_MOBILE_HOME, v: 'Home' },
        { k: t.labels.PBNA_MOBILE_MOBILE, v: 'Mobile' },
        { k: t.labels.PBNA_MOBILE_WORK, v: 'Work' }
    ]
    const contactMethodMapping = [
        { k: t.labels.PBNA_MOBILE_TEXT_PRIMARY, v: 'Text Primary' },
        { k: t.labels.PBNA_MOBILE_TEXT_SECONDARY, v: 'Text Secondary' },
        { k: t.labels.PBNA_MOBILE_PHONE_PRIMARY, v: 'Phone Primary' },
        { k: t.labels.PBNA_MOBILE_PHONE_SECONDARY, v: 'Phone Secondary' },
        { k: t.labels.PBNA_MOBILE_EMAIL, v: 'Email' }
    ]
    useImperativeHandle(cRef, () => ({
        open: (contactToEdit?) => {
            setShowContactForm(true)
            if (contactToEdit) {
                setContact({ ...contactToEdit })
            }
        }
    }))
    useEffect(() => {
        if (!editMode) {
            if (primaryContact === null) {
                setContact({ ...contact, Primary_Contact__c: '1' })
            } else {
                setContact({ ...contact, Primary_Contact__c: '0' })
            }
        }
    }, [leadExternalId, showContactForm])

    useEffect(() => {
        if (contactAs === '0') {
            setContact({ ...contact, Primary_Contact__c: '0', Secondary_Contact__c: '0' })
        }
    }, [contactAs])

    useEffect(() => {
        if (editMode && (contact.Primary_Contact__c === '1' || contact.Secondary_Contact__c === '1')) {
            setContactAs('1')
        }
    }, [showContactForm])

    const resetStoreConcat = () => {
        return {
            ...contact,
            Id: null,
            FirstName: '',
            LastName: '',
            Phone: null,
            Primary_Phone_Type__c: null,
            MobilePhone: null,
            Second_Phone_Type__c: null,
            Email: null,
            Preferred_Contact_Method__c: null,
            Notes__c: null,
            Primary_Contact__c: null,
            Primary_Phone_Extension__c: null,
            Secondary_Contact__c: null,
            Second_Phone_Extension__c: null,
            Title: null,
            AccountId: accountId !== null ? accountId : null
        }
    }
    const resetLeadConcat = () => {
        return {
            ...contact,
            Id: null,
            FirstName: '',
            LastName: '',
            Phone: null,
            Primary_Phone_Type__c: null,
            MobilePhone: null,
            Second_Phone_Type__c: null,
            Email: null,
            Preferred_Contact_Method__c: null,
            Notes__c: null,
            Primary_Contact__c: null,
            Primary_Phone_Extension__c: null,
            Secondary_Contact__c: null,
            Second_Phone_Extension__c: null,
            Title: null,
            Lead__c: leadExternalId !== null ? leadExternalId : null
        }
    }

    const resetData = () => {
        if (contactType === 'RetailStore') {
            setContact(resetStoreConcat())
        } else {
            setContact(resetLeadConcat())
        }
        setContactAs('0')
    }

    const handlePressCancel = () => {
        setShowContactForm(false)
        resetData()
    }

    const openOrCloseLoadingModal = (type) => {
        if (type === 'open') {
            if (globalModalRef) {
                globalModalRef.current?.openModal()
            } else {
                global.$globalModal.openModal()
            }
        }
        if (type === 'close') {
            if (globalModalRef) {
                globalModalRef.current?.closeModal()
            } else {
                global.$globalModal.closeModal()
            }
        }
    }

    const processAfterContactIngest = (type: 'success' | 'failed', message: string, newContact?) => {
        if (!fromLogCall) {
            // remove this unnecessary close modal since modal is singleton `openOrCloseLoadingModal('close')`
            if (globalModalRef) {
                globalModalRef.current?.openModal(
                    <ProcessDoneModal type={type}>
                        <CText numberOfLines={3} style={styles.messageStyle}>
                            {message}
                        </CText>
                    </ProcessDoneModal>,
                    type === 'failed' ? 'OK' : null
                )
            } else {
                global.$globalModal.openModal(
                    <ProcessDoneModal type={type}>
                        <CText numberOfLines={3} style={styles.messageStyle}>
                            {message}
                        </CText>
                    </ProcessDoneModal>,
                    type === 'failed' ? 'OK' : null
                )
            }
        }

        if (type === 'success') {
            !fromLogCall &&
                setTimeout(() => {
                    openOrCloseLoadingModal('close')
                }, 3000)
            onIngestFinished(_.cloneDeep(contact), _.cloneDeep(newContact))
        } else {
            if (contactType === 'RetailStore') {
                onIngestFinished(resetStoreConcat())
            } else {
                onIngestFinished(resetLeadConcat())
            }
        }
    }

    const processData = async (contactsToIngestArr: any[]) => {
        setShowContactForm(false)
        if (!fromLogCall) {
            openOrCloseLoadingModal('open')
        }
        const contactsToUpdate = []
        const contactsToCreate = []

        try {
            contactsToIngestArr.forEach((contactItem) => {
                if (contactType === 'RetailStore') {
                    contactItem.AccountId = accountId
                } else {
                    contactItem.Lead__c = leadExternalId
                }
                if (contactItem.Id) {
                    contactsToUpdate.push(contactItem)
                } else {
                    contactsToCreate.push(contactItem)
                }
            })
            // onApply(contact)
            const syncUpUpdateFields =
                contactType === 'RetailStore'
                    ? [
                          'Id',
                          'Title',
                          'Email',
                          'FirstName',
                          'LastName',
                          'MobilePhone',
                          'Phone',
                          'Primary_Phone_Extension__c',
                          'Primary_Phone_Type__c',
                          'Second_Phone_Extension__c',
                          'Second_Phone_Type__c',
                          'Primary_Contact__c',
                          'Preferred_Contact_Method__c',
                          'Notes__c',
                          'Secondary_Contact__c',
                          'AccountId'
                      ]
                    : [
                          'Id',
                          'Title',
                          'Email',
                          'FirstName',
                          'LastName',
                          'MobilePhone',
                          'Phone',
                          'Primary_Phone_Extension__c',
                          'Primary_Phone_Type__c',
                          'Second_Phone_Extension__c',
                          'Second_Phone_Type__c',
                          'Primary_Contact__c',
                          'Preferred_Contact_Method__c',
                          'Notes__c',
                          'Secondary_Contact__c',
                          'Lead__c'
                      ]
            let newContact = null
            if (contactsToCreate.length > 0) {
                // sync up fields depend on customer/lead
                const [data] = await syncUpObjCreateFromMem(
                    'Contact',
                    filterExistFields('Contact', contactsToCreate, syncUpUpdateFields)
                )
                newContact = data.data[0]
                setContact(data.data[0])
            }
            if (contactsToUpdate.length > 0) {
                await syncUpObjUpdateFromMem(
                    'Contact',
                    filterExistFields('Contact', contactsToUpdate, syncUpUpdateFields)
                )
            }
            const leadSyncUpFields = ['Id', 'Rep_Last_Modified_Date_c__c']
            // just for lead
            if (contactType !== 'RetailStore') {
                const leadToUpdate = _.cloneDeep(l)
                leadToUpdate.Rep_Last_Modified_Date_c__c = new Date().toISOString()
                await syncUpObjUpdateFromMem('Lead__x', filterExistFields('Lead__x', [leadToUpdate], leadSyncUpFields))
            }
            processAfterContactIngest(
                'success',
                editMode
                    ? t.labels.PBNA_MOBILE_UPDATE_CONTACT_SUCCESSFULLY
                    : t.labels.PBNA_MOBILE_CREATE_CONTACT_SUCCESSFULLY,
                newContact
            )
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'processData',
                editMode
                    ? 'edit contact: ' + contactsToUpdate
                    : 'create contact: ' + contactsToCreate + ErrorUtils.error2String(e),
                { Data__c: e }
            )
            processAfterContactIngest(
                'failed',
                editMode ? t.labels.PBNA_MOBILE_UPDATE_CONTACT_FAILED : t.labels.PBNA_MOBILE_CREATE_CONTACT_FAILED
            )
        }
    }

    const handleClickDelete = () => {
        const contactId = contact.Id
        // @ts-ignore
        // use soup entry id to delete the record.
        const contactSoupEntryId = contact._soupEntryId
        Alert.alert(t.labels.PBNA_MOBILE_DELETE_CONTACT, t.labels.PBNA_MOBILE_DELETE_CONTACT_MESSAGE, [
            {
                text: t.labels.PBNA_MOBILE_CANCEL,
                style: 'default'
            },
            {
                text: t.labels.PBNA_MOBILE_DELETE,
                style: 'default',
                onPress: async () => {
                    if (onCloseDetail) {
                        onCloseDetail()
                    }
                    setShowContactForm(false)
                    global.$globalModal.openModal()
                    try {
                        await deleteContactAndUpdateLead(contactType, contactId, contactSoupEntryId, l)
                        if (onIngestFinished) {
                            onIngestFinished()
                        }
                        global.$globalModal.openModal(
                            <ProcessDoneModal type={'success'}>
                                <CText numberOfLines={3} style={styles.messageStyle}>
                                    {t.labels.PBNA_MOBILE_DELETE_CONTACT_SUCCESS}
                                </CText>
                            </ProcessDoneModal>
                        )
                        setTimeout(() => {
                            global.$globalModal.closeModal()
                        }, 3000)
                    } catch (e) {
                        global.$globalModal.closeModal()
                        global.$globalModal.openModal(
                            <ProcessDoneModal type={'failed'}>
                                <CText numberOfLines={3} style={styles.messageStyle}>
                                    {t.labels.PBNA_MOBILE_DELETE_CONTACT_FAILED}
                                </CText>
                            </ProcessDoneModal>,
                            t.labels.PBNA_MOBILE_OK
                        )
                    }
                }
            }
        ])
    }

    const setAsPrimaryContact = (contactToDo) => {
        if (!editMode && primaryContact === null) {
            contactToDo.Primary_Contact__c = '1'
        }
    }

    const handlePressSave = async () => {
        const contactToDo = _.cloneDeep(contact)

        setAsPrimaryContact(contactToDo)
        const contactsToIngest = [contactToDo]
        if (contactToDo.Primary_Contact__c === '1' && primaryContact !== null && contactToDo.Id !== primaryContact.Id) {
            Alert.alert(
                t.labels.PBNA_MOBILE_PRIMARY_CONTACT_ALREADY_EXISTS,
                t.labels.PBNA_MOBILE_MAKE_PRIMARY_CONTACT_MSG,
                [
                    {
                        text: t.labels.PBNA_MOBILE_CANCEL,
                        style: 'cancel'
                    },
                    {
                        text: t.labels.PBNA_MOBILE_YES,
                        style: 'default',
                        onPress: async () => {
                            const primaryContactToUpdate = JSON.parse(JSON.stringify(primaryContact))
                            primaryContactToUpdate.Primary_Contact__c = '0'
                            contactsToIngest.push(primaryContactToUpdate)
                            await processData(contactsToIngest)
                            if (!editMode) {
                                resetData()
                            }
                        }
                    }
                ]
            )
        } else if (
            contactToDo.Secondary_Contact__c === '1' &&
            secondaryContact !== null &&
            contactToDo.Id !== secondaryContact.Id
        ) {
            Alert.alert(
                t.labels.PBNA_MOBILE_SECONDARY_CONTACT_ALREADY_EXISTS,
                t.labels.PBNA_MOBILE_MAKE_SECONDARY_CONTACT_MSG,
                [
                    {
                        text: t.labels.PBNA_MOBILE_CANCEL,
                        style: 'cancel'
                    },
                    {
                        text: t.labels.PBNA_MOBILE_YES,
                        style: 'default',
                        onPress: async () => {
                            const secondaryContactToUpdate = JSON.parse(JSON.stringify(secondaryContact))
                            secondaryContactToUpdate.Secondary_Contact__c = '0'
                            contactsToIngest.push(secondaryContactToUpdate)
                            await processData(contactsToIngest)
                            if (!editMode) {
                                resetData()
                            }
                        }
                    }
                ]
            )
        } else {
            await processData(contactsToIngest)
            if (!editMode) {
                resetData()
            }
        }
    }
    return (
        <Modal visible={showContactForm}>
            <SafeAreaView style={[commonStyle.fullWidth, commonStyle.fullHeight]}>
                <View style={[styles.contactContainer, commonStyle.fullWidth, commonStyle.fullHeight]}>
                    <View style={[commonStyle.flexRowSpaceCenter, commonStyle.fullWidth]}>
                        <CText style={styles.editAContact}>
                            {editMode ? t.labels.PBNA_MOBILE_EDIT_A_CONTACT : t.labels.PBNA_MOBILE_ADD_A_NEW_CONTACT}
                        </CText>
                        <HeaderCircle
                            onPress={() => {
                                setShowContactForm(false)
                                resetData()
                            }}
                            transform={[{ scale: 0.85 }, { rotate: '45deg' }]}
                            color={'#0098D4'}
                        />
                    </View>
                    <KeyboardAwareScrollView
                        style={styles.marginTop70}
                        extraHeight={200}
                        showsVerticalScrollIndicator={false}
                    >
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_FIRST_NAME}
                            onChangeText={(v: any) => {
                                setContact({ ...contact, FirstName: v })
                            }}
                            initValue={contact.FirstName}
                            noMargin
                            placeholder={t.labels.PBNA_MOBILE_ENTER_FIRST_NAME}
                        />
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_LAST_NAME}
                            onChangeText={(v: any) => {
                                setContact({ ...contact, LastName: v })
                            }}
                            initValue={contact.LastName}
                            noMargin
                            placeholder={t.labels.PBNA_MOBILE_ENTER_LAST_NAME}
                        />
                        <View style={commonStyle.flexRowSpaceBet}>
                            <View style={styles.width48}>
                                <PhoneNumberInput
                                    label={t.labels.PBNA_MOBILE_PRIMARY_PHONE}
                                    noPaddingHorizontal
                                    labelStyle={styles.labelStyle}
                                    placeholder={'(000) 000-0000'}
                                    onChange={(v: any) => {
                                        setContact({ ...contact, Phone: v })
                                        if (v === '') {
                                            primaryPhoneTypeRef.current?.resetNull()
                                            setContact({
                                                ...contact,
                                                Primary_Phone_Extension__c: '',
                                                Primary_Phone_Type__c: ''
                                            })
                                        }
                                    }}
                                    value={contact.Phone}
                                />
                            </View>
                            <View style={styles.width48}>
                                <PickerTile
                                    data={[
                                        `-- ${t.labels.PBNA_MOBILE_SELECT_PHONE_TYPE} --`,
                                        ...phoneTypeMapping.map((v) => {
                                            return v.k
                                        })
                                    ]}
                                    label={PHONE_TYPE}
                                    labelStyle={styles.labelStyle}
                                    title={PHONE_TYPE}
                                    disabled={false}
                                    defValue={contact.Primary_Phone_Type__c}
                                    placeholder={t.labels.PBNA_MOBILE_SELECT}
                                    required
                                    noPaddingHorizontal
                                    onChange={(v: any) => {
                                        setContact({
                                            ...contact,
                                            Primary_Phone_Type__c: _.find(phoneTypeMapping, (value) => value.k === v)?.v
                                        })
                                    }}
                                    cRef={primaryPhoneTypeRef}
                                />
                            </View>
                        </View>
                        <View style={[commonStyle.flexRowSpaceBet, styles.marginTop15]}>
                            <View style={commonStyle.flex_1}>
                                <Input
                                    label={t.labels.PBNA_MOBILE_PHONE_EXTENSION_OPTIONAL}
                                    labelStyle={styles.labelStyle}
                                    onChangeText={(v) => {
                                        if (v.length <= 10) {
                                            setContact({ ...contact, Primary_Phone_Extension__c: v })
                                        }
                                    }}
                                    containerStyle={styles.paddingHorizontal_0}
                                    inputContainerStyle={styles.inputBorderBottomColor}
                                    keyboardType={'numeric'}
                                    value={contact.Primary_Phone_Extension__c}
                                    inputStyle={styles.fontSize_14}
                                    placeholder={t.labels.PBNA_MOBILE_ENTER_NUMBER}
                                />
                            </View>
                        </View>
                        <View style={commonStyle.flexRowSpaceBet}>
                            <View style={styles.width48}>
                                <PhoneNumberInput
                                    label={t.labels.PBNA_MOBILE_SECONDARY_PHONE_OPTIONAL}
                                    noPaddingHorizontal
                                    labelStyle={styles.phoneOptionText}
                                    onChange={(v: any) => {
                                        setContact({ ...contact, MobilePhone: v })
                                        if (v === '') {
                                            secondaryPhoneTypeRef.current?.resetNull()
                                            setContact({
                                                ...contact,
                                                MobilePhone: '',
                                                Second_Phone_Type__c: '',
                                                Second_Phone_Extension__c: ''
                                            })
                                        }
                                    }}
                                    placeholder={'(000) 000-0000'}
                                    value={contact.MobilePhone}
                                />
                            </View>
                            <View style={styles.width48}>
                                <PickerTile
                                    data={[
                                        `-- ${t.labels.PBNA_MOBILE_SELECT_PHONE_TYPE} --`,
                                        ...phoneTypeMapping.map((v) => {
                                            return v.k
                                        })
                                    ]}
                                    cRef={secondaryPhoneTypeRef}
                                    label={PHONE_TYPE}
                                    labelStyle={styles.labelStyle}
                                    title={PHONE_TYPE}
                                    disabled={contact.MobilePhone?.replace(/\D/g, '').length !== 10}
                                    defValue={contact.Second_Phone_Type__c}
                                    placeholder={t.labels.PBNA_MOBILE_SELECT}
                                    required
                                    noPaddingHorizontal
                                    onChange={(v: any) => {
                                        setContact({
                                            ...contact,
                                            Second_Phone_Type__c: _.find(phoneTypeMapping, (value) => value.k === v)?.v
                                        })
                                    }}
                                />
                            </View>
                        </View>
                        <View style={[commonStyle.flexRowSpaceBet, styles.marginTop_25]}>
                            <View style={commonStyle.flex_1}>
                                <Input
                                    label={t.labels.PBNA_MOBILE_SECONDARY_PHONE_EXTENSION_OPTIONAL}
                                    labelStyle={styles.labelStyle}
                                    onChangeText={(value) => {
                                        if (value.length <= 10) {
                                            setContact({ ...contact, Second_Phone_Extension__c: value })
                                        }
                                    }}
                                    disabled={contact.MobilePhone?.replace(/\D/g, '').length !== 10}
                                    placeholder={t.labels.PBNA_MOBILE_ENTER_NUMBER}
                                    inputContainerStyle={styles.inputBorderBottomColor}
                                    containerStyle={styles.paddingHorizontal_0}
                                    keyboardType={'numeric'}
                                    inputStyle={styles.fontSize_14}
                                    value={contact.Second_Phone_Extension__c}
                                />
                            </View>
                        </View>
                        <View style={styles.marginBottom_15}>
                            <EmailAddressInput
                                labelStyle={styles.labelStyle}
                                cRef={emailInputRef}
                                noPaddingHorizontal
                                label={t.labels.PBNA_MOBILE_EMAIL_ADDRESS_OPTIONAL}
                                placeholder={ENTER_TEXT}
                                onChange={(v: any) => {
                                    setContact({ ...contact, Email: v })
                                }}
                                value={contact.Email}
                            />
                        </View>
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_CONTACT_ROLE_OPTIONAL}
                            onChangeText={(v: any) => {
                                setContact({ ...contact, Title: v })
                            }}
                            initValue={contact.Title}
                            noMargin
                            placeholder={ENTER_TEXT}
                        />
                        <PickerTile
                            data={[
                                `-- ${t.labels.PBNA_MOBILE_SELECT_PREFERRED_CONTACT_METHOD}  --`,
                                ...contactMethodMapping.map((v) => {
                                    return v.k
                                })
                            ]}
                            label={t.labels.PBNA_MOBILE_PREFERRED_CONTACT_METHOD}
                            labelStyle={styles.labelStyle}
                            title={t.labels.PBNA_MOBILE_PREFERRED_CONTACT_METHOD}
                            titleStyle={
                                t.labels.PBNA_MOBILE_PREFERRED_CONTACT_METHOD.length > textMaxLength
                                    ? { fontSize: 12, fontWeight: '400' }
                                    : ''
                            }
                            disabled={false}
                            defValue={contact.Preferred_Contact_Method__c}
                            placeholder={t.labels.PBNA_MOBILE_SELECT}
                            required={false}
                            noPaddingHorizontal
                            onChange={(v: any) => {
                                setContact({
                                    ...contact,
                                    Preferred_Contact_Method__c:
                                        _.find(contactMethodMapping, (value) => value.k === v)?.v || ''
                                })
                            }}
                            containerStyle={styles.containerStyle}
                        />
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_NOTES_OPTIONAL}
                            onChangeText={(v: any) => {
                                setContact({ ...contact, Notes__c: v })
                            }}
                            initValue={contact.Notes__c}
                            multiline
                            placeholder={ENTER_TEXT}
                            maxLength={MAX_NOTE_LENGTH}
                        />
                        {(primaryContact !== null || editMode) && (
                            <View
                                style={
                                    t.labels.PBNA_MOBILE_SET_CONTACT_AS.length > 20
                                        ? { flexDirection: 'column', alignItems: 'flex-start' }
                                        : { flexDirection: 'row', alignItems: 'center' }
                                }
                            >
                                <LeadCheckBox
                                    title={
                                        <CText style={styles.setContactAsText}>
                                            {t.labels.PBNA_MOBILE_SET_CONTACT_AS}
                                        </CText>
                                    }
                                    checked={contactAs === '1'}
                                    customFalseValue={'0'}
                                    customTrueValue={'1'}
                                    editable
                                    outerForm
                                    onChange={(v: any) => {
                                        setContactAs(v)
                                    }}
                                />
                                <View style={commonStyle.flexDirectionRow}>
                                    <LeadCheckBox
                                        title={<CText style={styles.fontSize_11}>{t.labels.PBNA_MOBILE_PRIMARY}</CText>}
                                        checked={contact.Primary_Contact__c === '1'}
                                        editable={contactAs === '1'}
                                        containerStyle={styles.leadContainer}
                                        checkedIcon={
                                            <Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />
                                        }
                                        uncheckedIcon={
                                            <Image source={ImageSrc.IMG_UNCHECK_CIRCLE} style={styles.checkedIcon} />
                                        }
                                        disableCheckedIcon={
                                            <Image source={ImageSrc.IMG_CHECK_CIRCLE_GRAY} style={styles.checkedIcon} />
                                        }
                                        disableUncheckedIcon={
                                            <Image
                                                source={ImageSrc.IMG_UNCHECK_CIRCLE_GRAY}
                                                style={styles.checkedIcon}
                                            />
                                        }
                                        customFalseValue={'0'}
                                        customTrueValue={'1'}
                                        outerForm
                                        onChange={(v: any) => {
                                            setContact({
                                                ...contact,
                                                Primary_Contact__c: v,
                                                Secondary_Contact__c: v === '1' ? '0' : '1'
                                            })
                                        }}
                                    />
                                    <LeadCheckBox
                                        title={
                                            <CText style={styles.fontSize_11}>{t.labels.PBNA_MOBILE_SECONDARY}</CText>
                                        }
                                        checked={contact.Secondary_Contact__c === '1'}
                                        editable={contactAs === '1'}
                                        containerStyle={styles.leadContainer}
                                        checkedIcon={
                                            <Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />
                                        }
                                        uncheckedIcon={
                                            <Image source={ImageSrc.IMG_UNCHECK_CIRCLE} style={styles.checkedIcon} />
                                        }
                                        disableCheckedIcon={
                                            <Image source={ImageSrc.IMG_CHECK_CIRCLE_GRAY} style={styles.checkedIcon} />
                                        }
                                        disableUncheckedIcon={
                                            <Image
                                                source={ImageSrc.IMG_UNCHECK_CIRCLE_GRAY}
                                                style={styles.checkedIcon}
                                            />
                                        }
                                        customFalseValue={'0'}
                                        customTrueValue={'1'}
                                        outerForm
                                        onChange={(v: any) => {
                                            setContact({
                                                ...contact,
                                                Secondary_Contact__c: v,
                                                Primary_Contact__c: v === '1' ? '0' : '1'
                                            })
                                        }}
                                    />
                                </View>
                            </View>
                        )}
                        {editMode && (
                            <DeleteButton
                                label={t.labels.PBNA_MOBILE_DELETE_CONTACT.toUpperCase()}
                                handlePress={handleClickDelete}
                            />
                        )}
                        <View style={styles.placeholderStyle} />
                    </KeyboardAwareScrollView>
                </View>
            </SafeAreaView>
            <FormBottomButton
                onPressCancel={handlePressCancel}
                onPressSave={handlePressSave}
                disableSave={disableSave}
                rightButtonLabel={editMode ? t.labels.PBNA_MOBILE_SAVE : t.labels.PBNA_MOBILE_ADD_CONTACT}
            />
        </Modal>
    )
}

export default ContactForm

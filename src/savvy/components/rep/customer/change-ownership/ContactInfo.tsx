/**
 * @description Component for the user to log a call.
 * @author Shangmin Dou
 * @date 2021-04-21
 */
import React, { FC, useEffect, useRef, useState } from 'react'
import { Dimensions, SafeAreaView, StyleSheet, View } from 'react-native'
import * as RNLocalize from 'react-native-localize'
import moment from 'moment'

import { picklistBottom } from '../equipment-tab/InstallOverviewForm'
import CreatablePickList from '../equipment-tab/CreatablePickList'
import { useContacts } from '../../../../hooks/LeadHooks'
import { t } from '../../../../../common/i18n/t'
import ContactForm from '../../lead/ContactForm'
import EmailAddressInput from '../../lead/common/EmailAddressInput'
import PhoneNumberInput from '../../lead/common/PhoneNumberInput'
import LeadInput from '../../lead/common/LeadInput'
import _ from 'lodash'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { OverviewLeadProps } from '../../../../utils/ChangeOfOwnershipUtils'
import { subTitle, styles as changeOfOwnershipCommonStyles } from '../ChangeOfOwnership'
import LeadFieldTile from '../../lead/common/LeadFieldTile'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const timezone = RNLocalize.getTimeZone()
moment.tz.setDefault(timezone)

interface ContactInfoProps {
    l: OverviewLeadProps
    activeStep: number
    externalId: string
    setContact: any
    globalModalRef: any
    contact: any
    setDisableNextBtn: any
    handleSetContactList: any
    readOnly: boolean
}

const styles = StyleSheet.create({
    ...changeOfOwnershipCommonStyles,
    checkedIcon: {
        width: 20,
        height: 20,
        marginRight: 5
    },
    generalView: {
        marginTop: 30,
        marginBottom: 44
    },
    labelStyle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    fieldContainer: { width: '50%' },
    safeViewContainer: {
        width: '100%',
        height: '100%',
        paddingHorizontal: '5%'
    },
    marginTop_20: { marginTop: -20 },
    container: {
        width: Dimensions.get('window').width,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: '2.25%',
        marginTop: -20
    }
})

const ContactInfo: FC<ContactInfoProps> = (props: ContactInfoProps) => {
    const {
        activeStep,
        l,
        externalId,
        contact,
        setContact,
        globalModalRef,
        setDisableNextBtn,
        handleSetContactList,
        readOnly
    } = props
    const contactCreationFormStoreRef = useRef(null)
    const contactRef = useRef(null)
    const emailInputRef = useRef(null)
    const phoneInputRef = useRef(null)
    const notesInputRef = useRef(null)
    const titleInputRef = useRef(null)

    const [saveTimes, setSaveTimes] = useState(0)

    const contactList = useContacts('Lead', externalId, saveTimes, activeStep === 1, 0, '', readOnly)

    useEffect(() => {
        if (readOnly) {
            setDisableNextBtn(false)
        }
        if (!readOnly) {
            if (!_.isEmpty(contact?.Id) && !_.isEmpty(contact?.Phone)) {
                setDisableNextBtn(false)
            } else {
                setDisableNextBtn(true)
            }
        }
    }, [contact, saveTimes])

    const handlePressAddContact = () => {
        contactCreationFormStoreRef.current.open()
    }

    useEffect(() => {
        if (!readOnly) {
            handleSetContactList(contactList)
        }
    }, [contactList])
    const setValToContact = (value, newContact) => {
        const temp = _.cloneDeep(newContact)
        contactRef.current?.setValue(temp.Name)
        emailInputRef.current?.setValue(temp?.Email || '')
        phoneInputRef.current?.setValue(temp.Phone)
        notesInputRef.current?.setValue(temp?.Notes__c || '')
        titleInputRef.current?.setValue(temp?.Title || '')
        setContact(temp)
        setSaveTimes(saveTimes + 1)
    }

    const renderContactForm = () => {
        return (
            <View>
                <ContactForm
                    cRef={contactCreationFormStoreRef}
                    leadExternalId={externalId}
                    onIngestFinished={setValToContact}
                    l={l}
                    globalModalRef={globalModalRef}
                    contactType={'Lead'}
                    fromLogCall
                />
            </View>
        )
    }

    const renderReadOnly = () => {
        if (contact) {
            return (
                <View style={styles.container}>
                    <View style={commonStyle.halfWidth}>
                        <LeadFieldTile
                            containerStyle={styles.halfLayout}
                            fieldName={t.labels.PBNA_MOBILE_SELECT_CONTACT}
                            fieldValue={contact.Name}
                        />
                        <LeadFieldTile
                            containerStyle={styles.halfLayout}
                            fieldName={t.labels.PBNA_MOBILE_EMAIL_ADDRESS_OPTIONAL}
                            fieldValue={contact?.Email}
                        />
                        <LeadFieldTile
                            containerStyle={styles.halfLayout}
                            fieldName={t.labels.PBNA_MOBILE_NOTES_OPTIONAL}
                            fieldValue={contact?.Notes__c}
                        />
                    </View>

                    <View style={commonStyle.halfWidth}>
                        <LeadFieldTile
                            containerStyle={styles.halfLayout}
                            fieldName={t.labels.PBNA_MOBILE_PHONE}
                            fieldValue={contact.Phone}
                        />
                        <LeadFieldTile
                            containerStyle={styles.halfLayout}
                            fieldName={t.labels.PBNA_MOBILE_CONTACT_ROLE_OPTIONAL}
                            fieldValue={contact?.Title}
                        />
                    </View>
                </View>
            )
        }
        return null
    }

    return (
        <SafeAreaView style={styles.safeViewContainer}>
            {subTitle(t.labels.PBNA_MOBILE_CHANGE_CONTACT_INFO)}

            {readOnly && renderReadOnly()}

            {!readOnly && (
                <KeyboardAwareScrollView>
                    <CreatablePickList
                        label={t.labels.PBNA_MOBILE_SELECT_CONTACT}
                        data={contactList}
                        showValue={(v) => {
                            return v?.Name
                        }}
                        defValue={contact?.Name || ''}
                        onApply={(v: any) => {
                            // Notice : contactRef, emailInputRef, phoneInputRef, notesInputRef, titleInputRef must be in front of setContact, otherwise setContact cannot be set successfully
                            contactRef.current?.setValue(v.Name)
                            emailInputRef.current?.setValue(v?.Email || '')
                            phoneInputRef.current?.setValue(v.Phone)
                            notesInputRef.current?.setValue(v?.Notes__c || '')
                            titleInputRef.current?.setValue(v?.Title || '')

                            setContact(v)
                            setSaveTimes(saveTimes + 1)
                        }}
                        lastListItem={picklistBottom()}
                        onLastItemClick={() => {
                            handlePressAddContact()
                        }}
                        cRef={contactRef}
                    />

                    {contact && (
                        <>
                            <PhoneNumberInput
                                label={t.labels.PBNA_MOBILE_PHONE}
                                noPaddingHorizontal
                                labelStyle={styles.labelStyle}
                                cRef={phoneInputRef}
                                placeholder={'(000) 000-0000'}
                                onChange={(v: any) => {
                                    setContact({ ...contact, Phone: v })
                                }}
                                value={contact.Phone}
                            />

                            <EmailAddressInput
                                labelStyle={styles.labelStyle}
                                cRef={emailInputRef}
                                noPaddingHorizontal
                                label={t.labels.PBNA_MOBILE_EMAIL_ADDRESS_OPTIONAL}
                                placeholder={t.labels.PBNA_MOBILE_ENTER_TEXT}
                                onChange={(v: any) => {
                                    setContact({ ...contact, Email: v })
                                }}
                                value={contact?.Email || ''}
                            />
                            <LeadInput
                                cRef={titleInputRef}
                                fieldName={t.labels.PBNA_MOBILE_CONTACT_ROLE_OPTIONAL}
                                onChangeText={(v: any) => {
                                    setContact({ ...contact, Title: v })
                                }}
                                initValue={contact?.Title || ''}
                                noMargin
                                placeholder={t.labels.PBNA_MOBILE_ENTER_TEXT}
                            />
                            <LeadInput
                                labelStyle={styles.marginTop_20}
                                cRef={notesInputRef}
                                fieldName={t.labels.PBNA_MOBILE_NOTES_OPTIONAL}
                                onChangeText={(v: any) => {
                                    setContact({ ...contact, Notes__c: v })
                                }}
                                initValue={contact?.Notes__c || ''}
                                multiline
                                placeholder={t.labels.PBNA_MOBILE_ENTER_TEXT}
                            />
                        </>
                    )}
                    {renderContactForm()}
                </KeyboardAwareScrollView>
            )}
        </SafeAreaView>
    )
}
export default ContactInfo

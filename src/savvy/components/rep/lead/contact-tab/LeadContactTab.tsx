/**
 * @description This component is the container of the contact tab.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 */
import React, { useImperativeHandle, useRef, useState } from 'react'
import { Alert, TouchableOpacity, View, StyleSheet } from 'react-native'
import ContactTile from './ContactTile'
import { useContacts } from '../../../../hooks/LeadHooks'
import ContactForm from '../ContactForm'
import ProcessDoneModal from '../../../common/ProcessDoneModal'
import CText from '../../../../../common/components/CText'
import ContactDetail from './ContactDetail'
import { LeadStatus } from '../../../../enums/Lead'
import { deleteContactAndUpdateLead } from '../../../../helper/rep/ContactFormHelper'
import { Log } from '../../../../../common/enums/Log'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { storeClassLog } from '../../../../../common/utils/LogUtils'

const styles = StyleSheet.create({
    successText: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    },
    contactDetailLabel: {
        marginTop: 24,
        fontSize: 14,
        fontWeight: '700',
        color: 'black',
        fontFamily: 'Gotham-Bold'
    },
    iconWrap: {
        position: 'absolute',
        left: 20,
        top: 23
    },
    icon: {
        marginLeft: 4,
        marginTop: 2,
        width: 16,
        height: 16,
        borderTopWidth: 2,
        borderRightWidth: 2,
        transform: [{ rotate: '-135deg' }],
        borderTopColor: '#00A2D9',
        borderRightColor: '#00A2D9'
    },
    noContactTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 25
    },
    noContactMessage: {
        fontSize: 14,
        fontWeight: '400',
        marginTop: 10,
        color: '#565656'
    }
})

interface LeadContactTabProps {
    leadExternalId?: string
    cRef?: any
    leadStatus: string
    cofTriggered: string
    onIngest: any
    l: any
    saveTimes: number
}

const LeadContactTab = (props: LeadContactTabProps) => {
    const { leadExternalId, cRef, leadStatus, cofTriggered, onIngest, l, saveTimes } = props
    const [contactIngestCount, setContactIngestCount] = useState(0)
    const [showContactDetail, setShowContactDetail] = useState(false)
    const contactList = useContacts('Lead', leadExternalId, contactIngestCount, saveTimes)
    const contactFormRef = useRef(null)
    const [contact, setContact] = useState({
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
        Lead__c: null,
        Title: null,
        Id: null,
        _soupEntryId: null
    })

    const handleEditContact = (editContact) => {
        contactFormRef.current.open(editContact)
    }
    const handleIngestFinished = (finishContact) => {
        if (finishContact) {
            setContact({ ...finishContact })
        } else {
            setShowContactDetail(false)
        }
        onIngest && onIngest()
        setContactIngestCount(contactIngestCount + 1)
    }
    useImperativeHandle(cRef, () => ({
        addCount: () => {
            setContactIngestCount(contactIngestCount + 1)
        }
    }))
    const handleClickDelete = (contactId, contactSoupEntryId) => {
        Alert.alert(
            t.labels.PBNA_MOBILE_DELETE_CONTACT,
            t.labels.PBNA_MOBILE_ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_CONTACT,
            [
                {
                    text: t.labels.PBNA_MOBILE_CANCEL,
                    style: 'default'
                },
                {
                    text: t.labels.PBNA_MOBILE_DELETE,
                    style: 'default',
                    onPress: async () => {
                        global.$globalModal.openModal()
                        try {
                            await deleteContactAndUpdateLead('Lead', contactId, contactSoupEntryId, l)
                            setContactIngestCount((prevContactIngestCount) => prevContactIngestCount + 1)
                            global.$globalModal.openModal(
                                <ProcessDoneModal type={'success'}>
                                    <CText numberOfLines={3} style={styles.successText}>
                                        {t.labels.PBNA_MOBILE_DELETE_CONTACT_SUCCESSFULLY}
                                    </CText>
                                </ProcessDoneModal>
                            )
                            if (onIngest) {
                                onIngest()
                            }
                            setTimeout(() => {
                                global.$globalModal.closeModal()
                            }, 3000)
                        } catch (e) {
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'handleClickDelete',
                                'delete contact from left scroll: ' + ErrorUtils.error2String(e)
                            )
                            global.$globalModal.closeModal()
                            global.$globalModal.openModal(
                                <ProcessDoneModal type={'failed'}>
                                    <CText numberOfLines={3} style={styles.successText}>
                                        {t.labels.PBNA_MOBILE_DELETE_CONTACT_FAILED}
                                    </CText>
                                </ProcessDoneModal>,
                                t.labels.PBNA_MOBILE_OK
                            )
                        }
                    }
                }
            ]
        )
    }
    const handleClickTile = (clickContact) => {
        setContact(clickContact)
        setShowContactDetail(true)
    }
    return (
        <View style={commonStyle.fullHeight}>
            {showContactDetail && (
                <View style={[commonStyle.fullWidth, commonStyle.bgWhite]}>
                    <View style={[commonStyle.fullWidth, commonStyle.alignCenter]}>
                        <CText style={styles.contactDetailLabel}>{t.labels.PBNA_MOBILE_CONTACT_DETAIL}</CText>
                        <TouchableOpacity
                            onPress={() => {
                                setShowContactDetail(false)
                            }}
                            hitSlop={{
                                left: 30,
                                right: 30,
                                top: 30,
                                bottom: 30
                            }}
                            style={styles.iconWrap}
                        >
                            <View style={styles.icon} />
                        </TouchableOpacity>
                    </View>
                    <ContactDetail
                        contact={contact}
                        showEdit={
                            (leadStatus === LeadStatus.NEGOTIATE || leadStatus === LeadStatus.NO_SALE) &&
                            cofTriggered !== '1'
                        }
                        onClickEdit={() => {
                            contactFormRef.current?.open(contact)
                        }}
                    />
                </View>
            )}
            {!showContactDetail && (
                <View>
                    {contactList.map((v) => {
                        return (
                            <ContactTile
                                contact={v}
                                key={v.Id}
                                onEdit={handleEditContact}
                                onDelete={handleClickDelete}
                                onClick={handleClickTile}
                                enable={
                                    (leadStatus === LeadStatus.NEGOTIATE || leadStatus === LeadStatus.NO_SALE) &&
                                    cofTriggered !== '1'
                                }
                            />
                        )
                    })}
                </View>
            )}
            {!showContactDetail && contactList.length === 0 && (
                <View style={[commonStyle.alignCenter, commonStyle.flex_1, { marginTop: 200 }]}>
                    <CText style={styles.noContactTitle}>{t.labels.PBNA_MOBILE_NO_CONTACT_TITLE}</CText>
                    <CText style={styles.noContactMessage}>{t.labels.PBNA_MOBILE_NO_CONTACT_MESSAGE}</CText>
                </View>
            )}
            <ContactForm
                cRef={contactFormRef}
                onIngestFinished={handleIngestFinished}
                leadExternalId={leadExternalId}
                editMode
                onCloseDetail={() => {
                    setShowContactDetail(false)
                }}
                l={l}
                contactType={'Lead'}
            />
        </View>
    )
}

export default LeadContactTab

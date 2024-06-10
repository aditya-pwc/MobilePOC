/**
 * @description The customer contact tab.
 * @author Shangmin Dou
 */
import React, { FC, useImperativeHandle, useRef, useState } from 'react'
import CollapseContainer from '../../common/CollapseContainer'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useContacts } from '../../../hooks/LeadHooks'
import { deleteContactAndUpdateLead } from '../../../helper/rep/ContactFormHelper'
import ProcessDoneModal from '../../common/ProcessDoneModal'
import CText from '../../../../common/components/CText'
import { Log } from '../../../../common/enums/Log'
import ContactDetail from '../lead/contact-tab/ContactDetail'
import ContactTile from '../lead/contact-tab/ContactTile'
import InternalContactTile from '../lead/contact-tab/InternalContactTile'
import ContactForm from '../lead/ContactForm'
import _ from 'lodash'
import { t } from '../../../../common/i18n/t'
import { isPersonaCRMBusinessAdmin } from '../../../../common/enums/Persona'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

interface CustomerContactTabProps {
    retailStore: any
    cRef: any
    userList: any
    onIngest: any
    setRefreshFlag?: any
}
const styles = StyleSheet.create({
    textStyle: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    },
    backgroundColor: {
        backgroundColor: 'white'
    },
    titleStyle: {
        marginTop: 24,
        fontSize: 14,
        fontWeight: '700',
        color: 'black',
        fontFamily: 'Gotham-Bold'
    },
    hitSlopSize: {
        left: 30,
        right: 30,
        top: 30,
        bottom: 30
    },
    goBackContainer: {
        position: 'absolute',
        left: 20,
        top: 23
    },
    goBackStyle: {
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
    padding: {
        height: 150,
        width: '100%'
    },
    contactContainer: {
        width: '100%',
        height: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '5%',
        backgroundColor: 'white'
    }
})
const CustomerContactTab: FC<CustomerContactTabProps> = (props: CustomerContactTabProps) => {
    const { retailStore, cRef, onIngest, userList, setRefreshFlag } = props
    const [contactIngestCount, setContactIngestCount] = useState(0)
    const [showContactDetail, setShowContactDetail] = useState(false)
    const [showCustomerContacts, setShowCustomerContacts] = useState(false)
    const [showInternalContacts, setShowInternalContacts] = useState(false)
    const contactList = useContacts('RetailStore', retailStore.AccountId, contactIngestCount)
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
        AccountId: null,
        Title: null,
        Id: null,
        _soupEntryId: null
    })

    const handleEditContact = (contact) => {
        contactFormRef.current.open(contact)
    }
    const handleIngestFinished = (contact) => {
        if (contact) {
            setContact({ ...contact })
        } else {
            setShowContactDetail(false)
        }
        onIngest && onIngest()
        setContactIngestCount((v) => v + 1)
        setRefreshFlag && setRefreshFlag((v) => v + 1)
        setShowCustomerContacts(false)
        setTimeout(() => {
            setShowCustomerContacts(true)
        }, 0)
    }
    useImperativeHandle(cRef, () => ({
        addCount: () => {
            setContactIngestCount((v) => v + 1)
            setRefreshFlag && setRefreshFlag((v) => v + 1)
            setShowCustomerContacts(false)
            setTimeout(() => {
                setShowCustomerContacts(true)
            }, 0)
        }
    }))
    const handleClickDelete = (contactId, contactSoupEntryId) => {
        Alert.alert(t.labels.PBNA_MOBILE_DELETE_CONTACT_TITLE, t.labels.PBNA_MOBILE_DELETE_CONTACT_MESSAGE, [
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
                        await deleteContactAndUpdateLead('RetailStore', contactId, contactSoupEntryId)
                        setContactIngestCount((contactIngestCount) => contactIngestCount + 1)
                        setRefreshFlag && setRefreshFlag((contactIngestCount) => contactIngestCount + 1)
                        global.$globalModal.openModal(
                            <ProcessDoneModal type={'success'}>
                                <CText numberOfLines={3} style={styles.textStyle}>
                                    {t.labels.PBNA_MOBILE_DELETE_CONTACT_SUCCESS}
                                </CText>
                            </ProcessDoneModal>
                        )
                        onIngest && onIngest()
                        setTimeout(() => {
                            global.$globalModal.closeModal()
                        }, 3000)
                    } catch (e) {
                        await storeClassLog(
                            Log.MOBILE_ERROR,
                            'handleClickDelete',
                            `delete contact ${contactId || contactSoupEntryId} from left scroll: ` +
                                ErrorUtils.error2String(e)
                        )
                        global.$globalModal.closeModal()
                        global.$globalModal.openModal(
                            <ProcessDoneModal type={'failed'}>
                                <CText numberOfLines={3} style={styles.textStyle}>
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
    const handleClickTile = (contact) => {
        setContact(contact)
        setShowContactDetail(true)
    }
    return (
        <View>
            <View
                style={{
                    display: !showContactDetail ? 'flex' : 'none',
                    width: '100%'
                }}
            >
                <CollapseContainer
                    showContent={showCustomerContacts}
                    setShowContent={setShowCustomerContacts}
                    title={t.labels.PBNA_MOBILE_CUSTOMER_CONTACTS}
                    reset={() => {}}
                    showReset={false}
                    containerStyle={styles.contactContainer}
                >
                    {contactList.map((v, i) => {
                        const lastIndex = contactList.length
                        return (
                            <ContactTile
                                contact={v}
                                key={v.Id}
                                onEdit={handleEditContact}
                                onDelete={handleClickDelete}
                                onClick={handleClickTile}
                                enable
                                disabledBottomLine={i + 1 === lastIndex}
                            />
                        )
                    })}
                </CollapseContainer>
                <CollapseContainer
                    noTopLine
                    noBottomLine
                    showContent={showInternalContacts}
                    setShowContent={setShowInternalContacts}
                    loading={userList.length === 0}
                    title={t.labels.PBNA_MOBILE_INTERNAL_CONTACTS}
                    reset={() => {}}
                    showReset={false}
                    containerStyle={styles.contactContainer}
                >
                    <View style={styles.backgroundColor}>
                        {userList.map((v, i) => {
                            const indexKey = i.toString()
                            const lastIndex = userList.length
                            if (_.isEmpty(v)) {
                                return null
                            }
                            return <InternalContactTile item={v} key={indexKey} bottomMargin={i + 1 === lastIndex} />
                        })}
                    </View>
                </CollapseContainer>
            </View>
            <View
                style={{
                    width: '100%',
                    backgroundColor: 'white',
                    display: showContactDetail ? 'flex' : 'none'
                }}
            >
                <View style={[commonStyle.fullWidth, commonStyle.alignCenter]}>
                    <CText style={styles.titleStyle}>{t.labels.PBNA_MOBILE_CONTACT_DETAIL}</CText>
                    <TouchableOpacity
                        onPress={() => {
                            setShowContactDetail(false)
                            setShowCustomerContacts(false)
                            setTimeout(() => {
                                setShowCustomerContacts(true)
                            }, 0)
                        }}
                        hitSlop={styles.hitSlopSize}
                        style={styles.goBackContainer}
                    >
                        <View style={styles.goBackStyle} />
                    </TouchableOpacity>
                </View>
                <ContactDetail
                    contact={contact}
                    showEdit={!isPersonaCRMBusinessAdmin()}
                    onClickEdit={() => {
                        contactFormRef.current?.open(contact)
                    }}
                />
            </View>
            <View style={styles.padding} />
            <ContactForm
                cRef={contactFormRef}
                onIngestFinished={handleIngestFinished}
                accountId={retailStore.AccountId}
                editMode
                onCloseDetail={() => {
                    setShowContactDetail(false)
                }}
                contactType={'RetailStore'}
            />
        </View>
    )
}

export default CustomerContactTab

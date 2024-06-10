/**
 * @description The component is to show the contact detail.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 */
import React, { useState } from 'react'
import { Linking, TouchableOpacity, View, StyleSheet } from 'react-native'
import CText from '../../../../../common/components/CText'
import ContactInfo from './ContactInfo'
import MessageSvg from '../../../../../../assets/image/icon_message.svg'
import CallSvg from '../../../../../../assets/image/icon_call.svg'
import EmailSvg from '../../../../../../assets/image/icon-email.svg'
import _ from 'lodash'
import { renderNotes } from '../../../../helper/rep/ContactDetailHelper'
import { renderBadge } from '../../../../helper/rep/ContactTileHelper'
import EditButton from '../../../common/EditButton'
import { t } from '../../../../../common/i18n/t'
import { isPersonaCRMBusinessAdmin, isPersonaFSR } from '../../../../../common/enums/Persona'
import { pickList } from '../../../../../common/i18n/picklist/allPicklist'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { callPhone, smsPhone } from '../../../../../common/helpers/IconHelper'
import { autoLogCall } from '../../../../utils/TaskUtils'
import { useAppDispatch } from '../../../../redux/ReduxHooks'
import { refreshCustomerActivityList } from '../../../../redux/Slice/CustomerDetailSlice'

const styles = StyleSheet.create({
    main: {
        paddingHorizontal: '5%',
        flexDirection: 'row',
        marginTop: 15,
        justifyContent: 'space-between',
        marginBottom: 15
    },
    width80Center: {
        justifyContent: 'center',
        width: '80%'
    },
    contactName: {
        fontWeight: '900',
        fontSize: 18
    },
    contactTitle: {
        marginTop: 5,
        color: 'gray'
    },
    editButton: {
        flexDirection: 'row',
        marginLeft: 5
    },
    marginRight25: {
        marginRight: 25
    },
    paddingHorizontal5: {
        paddingHorizontal: '5%'
    },
    colorGray: {
        color: '#575858'
    },
    marginTop5: {
        marginTop: 5
    },
    moreNotes: {
        margin: 0,
        padding: 0,
        alignItems: 'flex-end',
        justifyContent: 'flex-end'
    },
    moreNotesText: {
        color: '#00A2D9',
        fontSize: 12
    },
    bottomGap: {
        height: 20,
        width: '100%'
    }
})

interface ContactDetailProps {
    contact: any
    onClickEdit: any
    showEdit?: boolean
}

const getContactMethodI18nText = (value) => {
    const contactMethodMapping = pickList.Contact.PreferredContactMethod()
    return contactMethodMapping[value] || value
}
const getPhoneTypeI18nText = (value) => {
    const phoneTypeMapping = {
        Home: t.labels.PBNA_MOBILE_HOME,
        Mobile: t.labels.PBNA_MOBILE_MOBILE,
        Work: t.labels.PBNA_MOBILE_WORK
    }
    return phoneTypeMapping[value] || value
}
const ContactDetail = (props: ContactDetailProps) => {
    const MAX_NOTES_LENGTH = 129
    const { contact, onClickEdit, showEdit } = props
    const [renderMoreNotes, setRenderMoreNotes] = useState(false)
    const dispatch = useAppDispatch()
    const HIT_SLOP = {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
    }
    return (
        <View>
            <View style={styles.main}>
                <View style={styles.width80Center}>
                    <CText style={styles.contactName} numberOfLines={1}>
                        {contact.FirstName} {contact.LastName}
                    </CText>
                    {!_.isEmpty(contact.Title) && (
                        <CText style={styles.contactTitle} numberOfLines={1}>
                            {contact.Title}
                        </CText>
                    )}
                    {renderBadge(contact)}
                </View>
                {showEdit && (
                    <View style={styles.editButton}>
                        {!isPersonaCRMBusinessAdmin() && (
                            <EditButton
                                onClick={() => {
                                    onClickEdit && onClickEdit()
                                }}
                            />
                        )}
                    </View>
                )}
            </View>
            {!_.isEmpty(contact.Preferred_Contact_Method__c) && (
                <ContactInfo
                    label={t.labels.PBNA_MOBILE_PREFERRED_CONTACT_METHOD}
                    value={getContactMethodI18nText(contact.Preferred_Contact_Method__c)}
                />
            )}
            <ContactInfo
                label={
                    t.labels.PBNA_MOBILE_PRIMARY_PHONE +
                    (contact?.Primary_Phone_Type__c && ` - ${getPhoneTypeI18nText(contact?.Primary_Phone_Type__c)}`)
                }
                value={contact.Phone}
            >
                <View style={commonStyle.flexRowCenter}>
                    <TouchableOpacity
                        onPress={async () => {
                            await smsPhone(contact.Phone, async () => {
                                if (isPersonaFSR()) {
                                    await autoLogCall(contact.AccountId, contact.Name)
                                    dispatch(refreshCustomerActivityList())
                                }
                            })
                        }}
                        hitSlop={HIT_SLOP}
                    >
                        <MessageSvg width={25} height={25} style={styles.marginRight25} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={async () => {
                            await callPhone(contact.Phone, async () => {
                                if (isPersonaFSR()) {
                                    await autoLogCall(contact.AccountId, contact.Name)
                                    dispatch(refreshCustomerActivityList())
                                }
                            })
                        }}
                        hitSlop={HIT_SLOP}
                    >
                        <CallSvg />
                    </TouchableOpacity>
                </View>
            </ContactInfo>
            {!_.isEmpty(contact.Primary_Phone_Extension__c) && (
                <ContactInfo
                    label={t.labels.PBNA_MOBILE_PRIMARY_PHONE_EXTENSION}
                    value={contact.Primary_Phone_Extension__c}
                />
            )}
            {!_.isEmpty(contact.MobilePhone) && (
                <ContactInfo
                    label={
                        t.labels.PBNA_MOBILE_SECONDARY_PHONE +
                        (contact?.Second_Phone_Type__c && ` - ${getPhoneTypeI18nText(contact?.Second_Phone_Type__c)}`)
                    }
                    value={contact.MobilePhone}
                >
                    <View style={commonStyle.flexRowCenter}>
                        <TouchableOpacity
                            onPress={async () => {
                                await smsPhone(contact.MobilePhone, async () => {
                                    if (isPersonaFSR()) {
                                        await autoLogCall(contact.AccountId, contact.Name)
                                        dispatch(refreshCustomerActivityList())
                                    }
                                })
                            }}
                            hitSlop={HIT_SLOP}
                        >
                            <MessageSvg width={25} height={25} style={styles.marginRight25} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={async () => {
                                await callPhone(contact.MobilePhone, async () => {
                                    if (isPersonaFSR()) {
                                        await autoLogCall(contact.AccountId, contact.Name)
                                        dispatch(refreshCustomerActivityList())
                                    }
                                })
                            }}
                            hitSlop={HIT_SLOP}
                        >
                            <CallSvg />
                        </TouchableOpacity>
                    </View>
                </ContactInfo>
            )}
            {!_.isEmpty(contact.Second_Phone_Extension__c) && (
                <ContactInfo
                    label={t.labels.PBNA_MOBILE_SECONDARY_PHONE_EXTENSION}
                    value={contact.Second_Phone_Extension__c}
                />
            )}
            {!_.isEmpty(contact.Email) && (
                <ContactInfo label={t.labels.PBNA_MOBILE_EMAIL_ADDRESS} value={contact.Email}>
                    <View style={commonStyle.flexRowCenter}>
                        <TouchableOpacity
                            onPress={async () => {
                                await Linking.openURL('mailto:' + contact.Email)
                            }}
                            hitSlop={HIT_SLOP}
                        >
                            <EmailSvg />
                        </TouchableOpacity>
                    </View>
                </ContactInfo>
            )}
            {!_.isEmpty(contact.Notes__c) && (
                <View style={styles.paddingHorizontal5}>
                    <CText style={styles.colorGray}>{t.labels.PBNA_MOBILE_NOTES}</CText>
                    <CText style={styles.marginTop5}>
                        <CText>{renderNotes(contact.Notes__c, renderMoreNotes, MAX_NOTES_LENGTH)}</CText>
                        {contact.Notes__c?.length > MAX_NOTES_LENGTH && (
                            <TouchableOpacity
                                onPress={() => {
                                    setRenderMoreNotes(!renderMoreNotes)
                                }}
                                style={styles.moreNotes}
                                hitSlop={{
                                    left: 20,
                                    top: 20,
                                    bottom: 20,
                                    right: 20
                                }}
                            >
                                <CText style={styles.moreNotesText}>
                                    {renderMoreNotes
                                        ? ` ${t.labels.PBNA_MOBILE_LESS}`
                                        : ` ${_.capitalize(t.labels.PBNA_MOBILE_MORE)}`}
                                </CText>
                            </TouchableOpacity>
                        )}
                    </CText>
                </View>
            )}
            <View style={styles.bottomGap} />
        </View>
    )
}
export default ContactDetail

import { Linking, StyleSheet, TouchableOpacity } from 'react-native'
import EmailStarSvg from '../../../../assets/image/icon-email-star.svg'
import EmailSvg from '../../../../assets/image/icon-email.svg'
import EmailGraySvg from '../../../../assets/image/icon-email-gray.svg'
import _ from 'lodash'
import MessageStarSvg from '../../../../assets/image/icon-msg-star.svg'
import MessageSvg from '../../../../assets/image/icon_message.svg'
import CallStarSvg from '../../../../assets/image/icon-call-star.svg'
import CallSvg from '../../../../assets/image/icon_call.svg'
import React from 'react'
import { PreferredContactMethod } from '../../enums/Contact'
import Badge from '../../components/rep/lead/common/Badge'
import { t } from '../../../common/i18n/t'
import { callPhone, smsPhone } from '../../../common/helpers/IconHelper'
import { autoLogCall } from '../../utils/TaskUtils'
import { isPersonaFSR } from '../../../common/enums/Persona'
import { refreshCustomerActivityList } from '../../redux/Slice/CustomerDetailSlice'

const styles = StyleSheet.create({
    emailStarSvg: {
        marginRight: 20,
        marginBottom: 8
    },
    marginRight_25: {
        marginRight: 25
    },
    messageStarSvg: {
        marginRight: 25,
        marginBottom: 5
    },
    marginBottom3: {
        marginBottom: 3
    }
})

export const openText = async (contact, callback?: () => Promise<any>) => {
    await smsPhone(
        contact.Preferred_Contact_Method__c === PreferredContactMethod.TEXT_SECONDARY && !_.isEmpty(contact.MobilePhone)
            ? contact.MobilePhone
            : contact.Phone,
        callback
    )
}

export const openPhone = async (contact, callback?: () => Promise<any>) => {
    await callPhone(
        contact.Preferred_Contact_Method__c === PreferredContactMethod.PHONE_SECONDARY &&
            !_.isEmpty(contact.MobilePhone)
            ? contact.MobilePhone
            : contact.Phone,
        callback
    )
}

export const renderEmail = (contact, HIT_SLOP) => {
    if (contact.Email) {
        if (
            contact.Preferred_Contact_Method__c &&
            contact.Preferred_Contact_Method__c === PreferredContactMethod.EMAIL
        ) {
            return (
                <TouchableOpacity
                    onPress={async () => {
                        await Linking.openURL('mailto:' + contact.Email)
                    }}
                    hitSlop={HIT_SLOP}
                >
                    <EmailStarSvg style={styles.emailStarSvg} />
                </TouchableOpacity>
            )
        }
        return (
            <TouchableOpacity
                onPress={async () => {
                    await Linking.openURL('mailto:' + contact.Email)
                }}
                hitSlop={HIT_SLOP}
            >
                <EmailSvg style={styles.marginRight_25} />
            </TouchableOpacity>
        )
    }
    return <EmailGraySvg style={styles.marginRight_25} />
}

export const renderMessage = (contact, HIT_SLOP, dispatch) => {
    if (
        contact.Preferred_Contact_Method__c &&
        (contact.Preferred_Contact_Method__c === PreferredContactMethod.TEXT_PRIMARY ||
            contact.Preferred_Contact_Method__c === PreferredContactMethod.TEXT_SECONDARY)
    ) {
        return (
            <TouchableOpacity
                onPress={async () => {
                    await openText(contact, async () => {
                        if (isPersonaFSR()) {
                            await autoLogCall(contact.AccountId, contact.Name)
                            dispatch(refreshCustomerActivityList())
                        }
                    })
                }}
                hitSlop={HIT_SLOP}
            >
                <MessageStarSvg style={styles.messageStarSvg} height={25} width={25} />
            </TouchableOpacity>
        )
    }
    return (
        <TouchableOpacity
            onPress={async () => {
                await openText(contact, async () => {
                    if (isPersonaFSR()) {
                        await autoLogCall(contact.AccountId, contact.Name)
                        dispatch(refreshCustomerActivityList())
                    }
                })
            }}
            hitSlop={HIT_SLOP}
        >
            <MessageSvg style={styles.marginRight_25} height={25} width={25} />
        </TouchableOpacity>
    )
}

export const renderCall = (contact, HIT_SLOP, dispatch) => {
    if (
        contact.Preferred_Contact_Method__c &&
        (contact.Preferred_Contact_Method__c === PreferredContactMethod.PHONE_PRIMARY ||
            contact.Preferred_Contact_Method__c === PreferredContactMethod.PHONE_SECONDARY)
    ) {
        return (
            <TouchableOpacity
                onPress={async () => {
                    await openPhone(contact, async () => {
                        if (isPersonaFSR()) {
                            await autoLogCall(contact.AccountId, contact.Name)
                            dispatch(refreshCustomerActivityList())
                        }
                    })
                }}
                hitSlop={HIT_SLOP}
            >
                <CallStarSvg style={styles.marginBottom3} />
            </TouchableOpacity>
        )
    }
    return (
        <TouchableOpacity
            onPress={async () => {
                await openPhone(contact, async () => {
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
    )
}

export const renderBadge = (contact) => {
    if (contact.Primary_Contact__c === '1') {
        return <Badge label={t.labels.PBNA_MOBILE_PRIMARY} />
    }
    if (contact.Secondary_Contact__c === '1') {
        return <Badge label={t.labels.PBNA_MOBILE_SECONDARY} />
    }
}

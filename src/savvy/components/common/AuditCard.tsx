import { StyleSheet, View } from 'react-native'

import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import CText from '../../../common/components/CText'
import React from 'react'
import { renderCDAStoreIcon } from '../rep/customer/CustomerListTile'
import { t } from '../../../common/i18n/t'

const AuditCardStyle = StyleSheet.create({
    auditTopCard: {
        backgroundColor: baseStyle.color.white,
        marginHorizontal: 8,
        borderRadius: 6,
        padding: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#004C97',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.12,
        shadowRadius: 10
    },
    auditTopCardView: {
        width: 58,
        height: 58,
        borderRadius: 6,
        ...commonStyle.alignCenter
    },
    snapShotTopCardImage: {
        width: 58,
        height: 58
    },
    auditCardTextView: {
        marginLeft: 10
    },
    auditCardText: {
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: 18
    },
    auditCardSubText: {
        marginTop: 6,
        color: baseStyle.color.titleGray,
        fontSize: 12
    },
    auditCardContent: {
        paddingHorizontal: 22
    },
    auditCardStatus: {
        paddingHorizontal: 10,
        paddingVertical: 2,
        backgroundColor: baseStyle.color.green,
        borderRadius: 10
    },
    auditCardStatusText: {
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: 12,
        color: baseStyle.color.white,
        textTransform: 'uppercase'
    }
})

export const AuditCard = ({ medalOrTier }: { medalOrTier: any }) => {
    return (
        <>
            <View style={[AuditCardStyle.auditTopCard, AuditCardStyle.auditCardContent]}>
                <View style={[AuditCardStyle.auditTopCardView]}>
                    {renderCDAStoreIcon(medalOrTier || 'Platinum', AuditCardStyle.snapShotTopCardImage)}
                </View>
                <View style={AuditCardStyle.auditCardTextView}>
                    <CText style={AuditCardStyle.auditCardText}>{medalOrTier || 'Platinum'}</CText>
                    <CText style={AuditCardStyle.auditCardSubText}>{medalOrTier || 'Platinum'}</CText>
                    <View style={(commonStyle.flexRowCenter, commonStyle.marginTop_6)}>
                        <View style={AuditCardStyle.auditCardStatus}>
                            <CText style={AuditCardStyle.auditCardStatusText}>{t.labels.PBNA_MOBILE_COMPLIANT}</CText>
                        </View>
                    </View>
                </View>
            </View>
        </>
    )
}

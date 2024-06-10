/**
 * @description Component to show lead offer details.
 * @author Shangmin Dou
 * @date 2021-05-25
 */
import React, { useImperativeHandle } from 'react'
import { LeadDetailBaseProps } from '../../../../interface/LeadInterface'
import { View, StyleSheet } from 'react-native'
import LeadFieldTile from '../common/LeadFieldTile'
import BaseSection from '../../../common/BaseSection'
import LeadInput from '../common/LeadInput'
import { useDispatch } from 'react-redux'
import { updateTempLeadAction } from '../../../../redux/action/LeadActionType'
import { LeadDetailSection, LeadStatus } from '../../../../enums/Lead'
import { t } from '../../../../../common/i18n/t'
import { isPersonaCRMBusinessAdmin } from '../../../../../common/enums/Persona'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    width_48_percent: {
        width: '48%'
    },
    leadInputContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        justifyContent: 'space-between'
    },
    height_29_3: {
        height: 29.3
    },
    height_28_4: {
        height: 28.4
    }
})

const OfferDetails = (props: LeadDetailBaseProps) => {
    const { l, cRef } = props
    const dispatch = useDispatch()
    const resetData = () => {
        const originData = {
            Current_Price_BC_c__c: l.Current_Price_BC_c__c,
            Current_Price_FTN_c__c: l.Current_Price_FTN_c__c,
            Estimated_BC_Volume_c__c: l.Estimated_BC_Volume_c__c,
            Estimated_FTN_Volume_c__c: l.Estimated_FTN_Volume_c__c,
            Estimated_Vendor_Volume_c__c: l.Estimated_Vendor_Volume_c__c,
            Other_Volume_c__c: l.Other_Volume_c__c,
            POS_Needs_c__c: l.POS_Needs_c__c,
            Program_Offered_c__c: l.Program_Offered_c__c,
            Proposed_Price_BC_c__c: l.Proposed_Price_BC_c__c,
            Proposed_Price_FTN_c__c: l.Proposed_Price_FTN_c__c,
            Rebates_BC_c__c: l.Rebates_BC_c__c,
            Rebates_FTN_c__c: l.Rebates_FTN_c__c,
            offerDetailsEditCount: 0
        }
        dispatch(updateTempLeadAction(originData))
    }
    useImperativeHandle(cRef, () => ({
        resetData
    }))
    return (
        <BaseSection>
            <View style={commonStyle.fullWidth}>
                {(l.Status__c === LeadStatus.NO_SALE ||
                    l.COF_Triggered_c__c === '1' ||
                    l.Status__c === LeadStatus.BUSINESS_WON ||
                    l.Status__c === LeadStatus.OPEN ||
                    isPersonaCRMBusinessAdmin()) && (
                    <View style={commonStyle.marginBottom_15}>
                        <View style={commonStyle.flexDirectionRow}>
                            <View style={[commonStyle.halfWidth, commonStyle.marginBottom_15]}>
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_ESTIMATED_FTN_VOLUME.replace('(', '\n(')}
                                    fieldValue={l.Estimated_FTN_Volume_c__c}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_CURRENT_FTN_PRICING.replace('(', '\n(')}
                                    fieldValue={l.Current_Price_FTN_c__c}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_ESTIMATED_BC_VOLUME.replace('(', '\n(')}
                                    fieldValue={l.Estimated_BC_Volume_c__c}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_CURRENT_BC_PRICING.replace('(', '\n(')}
                                    fieldValue={l.Current_Price_BC_c__c}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_ESTIMATED_VENDOR_VOLUME}
                                    fieldValue={l.Estimated_Vendor_Volume_c__c}
                                />
                            </View>
                            <View style={[commonStyle.halfWidth, commonStyle.marginBottom_15]}>
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_PROPOSED_FTN_REBATES}
                                    fieldValue={l.Rebates_FTN_c__c}
                                    labelStyle={styles.height_29_3}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_PROPOSED_FTN_PRICING.replace('(', '\n(')}
                                    fieldValue={l.Proposed_Price_FTN_c__c}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_PROPOSED_BC_REBATES}
                                    fieldValue={l.Rebates_BC_c__c}
                                    labelStyle={styles.height_29_3}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_PROPOSED_BC_PRICING.replace('(', '\n(')}
                                    fieldValue={l.Proposed_Price_BC_c__c}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_OTHER_VOLUME}
                                    fieldValue={l.Other_Volume_c__c}
                                />
                            </View>
                        </View>
                        <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_POS_NEEDS} fieldValue={l.POS_Needs_c__c} />
                        <LeadFieldTile
                            fieldName={t.labels.PBNA_MOBILE_PROGRAM_OFFERED}
                            fieldValue={l.Program_Offered_c__c}
                        />
                    </View>
                )}
                {l.Status__c === LeadStatus.NEGOTIATE &&
                    l.COF_Triggered_c__c !== '1' &&
                    !isPersonaCRMBusinessAdmin() && (
                        <View style={[commonStyle.fullWidth, commonStyle.marginBottom_15]}>
                            <View style={styles.leadInputContainer}>
                                <View style={styles.width_48_percent}>
                                    <LeadInput
                                        fieldName={t.labels.PBNA_MOBILE_ESTIMATED_FTN_VOLUME.replace('(', '\n(')}
                                        fieldApiName={'Estimated_FTN_Volume_c__c'}
                                        number
                                        section={LeadDetailSection.OFFER_DETAILS}
                                    />

                                    <LeadInput
                                        fieldName={t.labels.PBNA_MOBILE_CURRENT_FTN_PRICING.replace('(', '\n(')}
                                        fieldApiName={'Current_Price_FTN_c__c'}
                                        currency
                                        section={LeadDetailSection.OFFER_DETAILS}
                                    />
                                    <LeadInput
                                        fieldName={t.labels.PBNA_MOBILE_ESTIMATED_BC_VOLUME.replace('(', '\n(')}
                                        fieldApiName={'Estimated_BC_Volume_c__c'}
                                        number
                                        section={LeadDetailSection.OFFER_DETAILS}
                                    />
                                    <LeadInput
                                        fieldName={t.labels.PBNA_MOBILE_CURRENT_BC_PRICING.replace('(', '\n(')}
                                        fieldApiName={'Current_Price_BC_c__c'}
                                        currency
                                        section={LeadDetailSection.OFFER_DETAILS}
                                    />
                                    <LeadInput
                                        fieldName={t.labels.PBNA_MOBILE_ESTIMATED_VENDOR_VOLUME}
                                        fieldApiName={'Estimated_Vendor_Volume_c__c'}
                                        number
                                        section={LeadDetailSection.OFFER_DETAILS}
                                    />
                                </View>
                                <View style={styles.width_48_percent}>
                                    <LeadInput
                                        fieldName={t.labels.PBNA_MOBILE_PROPOSED_FTN_REBATES}
                                        fieldApiName={'Rebates_FTN_c__c'}
                                        section={LeadDetailSection.OFFER_DETAILS}
                                        labelStyle={styles.height_28_4}
                                        currency
                                    />
                                    <LeadInput
                                        fieldName={t.labels.PBNA_MOBILE_PROPOSED_FTN_PRICING.replace('(', '\n(')}
                                        fieldApiName={'Proposed_Price_FTN_c__c'}
                                        currency
                                        section={LeadDetailSection.OFFER_DETAILS}
                                    />
                                    <LeadInput
                                        fieldName={t.labels.PBNA_MOBILE_PROPOSED_BC_REBATES}
                                        fieldApiName={'Rebates_BC_c__c'}
                                        section={LeadDetailSection.OFFER_DETAILS}
                                        labelStyle={styles.height_28_4}
                                        currency
                                    />
                                    <LeadInput
                                        fieldName={t.labels.PBNA_MOBILE_PROPOSED_BC_PRICING.replace('(', '\n(')}
                                        fieldApiName={'Proposed_Price_BC_c__c'}
                                        currency
                                        section={LeadDetailSection.OFFER_DETAILS}
                                    />
                                    <LeadInput
                                        fieldName={t.labels.PBNA_MOBILE_OTHER_VOLUME}
                                        fieldApiName={'Other_Volume_c__c'}
                                        number
                                        section={LeadDetailSection.OFFER_DETAILS}
                                    />
                                </View>
                            </View>
                            <LeadInput
                                fieldName={t.labels.PBNA_MOBILE_POS_NEEDS}
                                fieldApiName={'POS_Needs_c__c'}
                                multiline
                                section={LeadDetailSection.OFFER_DETAILS}
                            />
                            <LeadInput
                                fieldName={t.labels.PBNA_MOBILE_PROGRAM_OFFERED}
                                fieldApiName={'Program_Offered_c__c'}
                                multiline
                                section={LeadDetailSection.OFFER_DETAILS}
                            />
                        </View>
                    )}
            </View>
        </BaseSection>
    )
}

export default OfferDetails

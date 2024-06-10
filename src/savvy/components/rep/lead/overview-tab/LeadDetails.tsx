/**
 * @description Component to show lead details section.
 * @author Shangmin Dou
 * @date 2021-05-010
 */
import React, { useImperativeHandle, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import BaseSection from '../../../common/BaseSection'
import { LeadDetailBaseProps } from '../../../../interface/LeadInterface'
import LeadFieldTile from '../common/LeadFieldTile'
import { transferBooleanField } from '../../../../utils/CommonUtils'
import LeadDetailsNegotiate from './LeadDetailsNegotiate'
import _ from 'lodash'
import { LeadDetailSection, LeadStatus, LeadSubStatus } from '../../../../enums/Lead'
import LeadDateTimePicker from '../common/LeadDateTimePicker'
import { judgeLeadEditable, renderDeferredDateTile } from '../../../../helper/rep/CommonHelper'
import { t } from '../../../../../common/i18n/t'
import { useSuggestedRoute } from '../../../../hooks/LeadHooks'
import { isPersonaCRMBusinessAdmin } from '../../../../../common/enums/Persona'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    streetText: {
        fontSize: 12,
        fontWeight: '400',
        color: 'black',
        marginTop: 5
    },
    cityText: {
        fontSize: 12,
        fontWeight: '400',
        color: 'black'
    },
    leadDetailFieldTitle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400',
        marginTop: 15
    },
    dateTimePickerContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    dotView: {
        backgroundColor: '#6C0CC3',
        width: 8,
        height: 8,
        marginLeft: 10,
        marginTop: 3.5,
        borderRadius: 5
    },
    fsRouteLabel: {
        fontWeight: '700',
        marginTop: 20
    }
})
export const addressGroup = (l, label?) => {
    return (
        <View>
            <CText style={styles.leadDetailFieldTitle}>{label || `${t.labels.PBNA_MOBILE_ADDRESS} *`} </CText>
            <CText style={styles.streetText}>{l.Street__c ? l.Street__c : '-'}</CText>
            <CText style={styles.cityText}>
                {l.City__c ? l.City__c + ', ' : null}
                {l.State__c}
                {l.PostalCode__c ? ' ' + l.PostalCode__c : null}
            </CText>
            <CText style={styles.cityText}>{l.Country__c}</CText>
        </View>
    )
}

const LeadDetails = (props: LeadDetailBaseProps) => {
    const { l, cRef } = props
    const negotiateRef = useRef(null)
    const { localRoute, nationalRoute } = useSuggestedRoute(l)
    useImperativeHandle(cRef, () => ({
        resetData: () => {
            negotiateRef?.current?.resetData()
        }
    }))
    const judgeReengagementDateEditable = () => {
        return (
            l.Status__c === LeadStatus.NO_SALE &&
            (l.Lead_Sub_Status_c__c === LeadSubStatus.DEFERRED ||
                l.Lead_Sub_Status_c__c === LeadSubStatus.PROSPECT_LOST)
        )
    }
    return (
        <BaseSection>
            <View style={[commonStyle.paddingBottom_15, commonStyle.flex_1]}>
                {(judgeLeadEditable(l) || isPersonaCRMBusinessAdmin()) && (
                    <View>
                        <View style={commonStyle.flexDirectionRow}>
                            <View style={commonStyle.halfWidth}>
                                <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_LEAD_ID} fieldValue={l.LEAD_ID_c__c} />
                            </View>
                            <View style={commonStyle.halfWidth}>
                                {l.Status__c === LeadStatus.BUSINESS_WON && (
                                    <LeadFieldTile
                                        fieldName={t.labels.PBNA_MOBILE_CUSTOMER_NUMBER}
                                        fieldValue={l.Customer_Number_c__c}
                                    />
                                )}
                            </View>
                        </View>
                        <LeadFieldTile fieldName={`${t.labels.PBNA_MOBILE_COMPANY} *`} fieldValue={l.Company__c} />
                        {!_.isEmpty(l.Deferred_Resume_Date_c__c) && (
                            <View style={commonStyle.marginTop_30}>
                                {!judgeReengagementDateEditable() && renderDeferredDateTile(l)}
                                {judgeReengagementDateEditable() && (
                                    <View style={styles.dateTimePickerContainer}>
                                        <LeadDateTimePicker
                                            fieldLabel={t.labels.PBNA_MOBILE_DATE_FOR_RE_ENGAGEMENT}
                                            fieldApiName={'Deferred_Resume_Date_c__c'}
                                            section={LeadDetailSection.LEAD_DETAILS}
                                            deferred
                                        />
                                        <View style={styles.dotView} />
                                    </View>
                                )}
                            </View>
                        )}
                        {addressGroup(l)}
                        <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_PHONE_NUMBER} fieldValue={l.Phone__c} />
                        <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_COMPANY_EMAIL} fieldValue={l.Email__c} />
                        <View style={commonStyle.flexDirectionRow}>
                            <View style={commonStyle.flex_1}>
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_LEAD_SOURCE}
                                    fieldValue={l.LeadSource__c}
                                />
                            </View>
                        </View>
                        <View style={commonStyle.flex_1}>
                            <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_LEAD_TYPE} fieldValue={l.Lead_Type_c__c} />
                        </View>
                        {l.Lead_Type_c__c === 'Additional Outlet' && (
                            <View style={commonStyle.flex_1}>
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_ORIGINAL_CUSTOMER_OPTIONAL}
                                    fieldValue={l.relatedCustomerLabel}
                                />
                            </View>
                        )}
                        <View>
                            <CText style={styles.fsRouteLabel}>{t.labels.PBNA_MOBILE_SUGGESTED_FS_ROUTE}</CText>
                        </View>
                        <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_NATIONAL_ROUTE} fieldValue={nationalRoute} />
                        <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_LOCAL_ROUTE} fieldValue={localRoute} />
                        <LeadFieldTile
                            fieldName={t.labels.PBNA_MOBILE_MULTI_OUTLET}
                            fieldValue={transferBooleanField(l.Chain_c__c)}
                        />
                        {l.Status__c === 'No Sales' && (
                            <View>
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_DUPLICATE_COF}
                                    fieldValue={l.DUP_COF_c__c}
                                />
                            </View>
                        )}
                    </View>
                )}
                {l.Status__c === LeadStatus.NEGOTIATE &&
                    l.COF_Triggered_c__c !== '1' &&
                    !isPersonaCRMBusinessAdmin() && <LeadDetailsNegotiate l={l} cRef={negotiateRef} />}
            </View>
        </BaseSection>
    )
}

export default LeadDetails

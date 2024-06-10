/**
 * @description Component to show store operation section.
 * @author Shangmin Dou
 * @date 2021-05-010
 */
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LeadDetailBaseProps } from '../../../../interface/LeadInterface'
import LeadFieldTile from '../common/LeadFieldTile'
import BaseSection from '../../../common/BaseSection'
import LeadBooleanFieldTile from '../common/LeadBooleanFieldTile'
import CustomerAttributesEdit from './CustomerAttributesEdit'
import { LeadStatus } from '../../../../enums/Lead'
import { judgeLeadEditable } from '../../../../helper/rep/CommonHelper'
import { t } from '../../../../../common/i18n/t'
import { isPersonaCRMBusinessAdmin } from '../../../../../common/enums/Persona'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    custAttrContainer: {
        marginBottom: 15
    },
    upperContainer: {
        flexDirection: 'row',
        marginBottom: 20
    },
    harlWidth: {}
})

const CustomerAttributes = (props: LeadDetailBaseProps) => {
    const { l, cRef } = props
    return (
        <BaseSection>
            <View>
                {l.Status__c === LeadStatus.NEGOTIATE &&
                    l.COF_Triggered_c__c !== '1' &&
                    !isPersonaCRMBusinessAdmin() && (
                        <View>
                            <CustomerAttributesEdit l={l} cRef={cRef} />
                        </View>
                    )}
                {(judgeLeadEditable(l) || isPersonaCRMBusinessAdmin()) && (
                    <View style={styles.custAttrContainer}>
                        <View style={styles.upperContainer}>
                            <View style={commonStyle.halfWidth}>
                                <LeadBooleanFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_CATERING}
                                    fieldValue={l.Lodging_Catering_c__c}
                                />
                                <LeadBooleanFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_TAKEOUT}
                                    fieldValue={l.ff_MEAL_TAKEOUT_c__c}
                                />
                                <LeadBooleanFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_SERVES_ALCOHOL}
                                    fieldValue={l.Alcohol_c__c}
                                />
                                <LeadBooleanFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_GAS_STATION}
                                    fieldValue={l.gas_station_c__c}
                                />
                            </View>
                            <View style={commonStyle.halfWidth}>
                                <LeadBooleanFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_SERVES_BREAKFAST}
                                    fieldValue={l.ff_MEAL_BREAKFAST_c__c}
                                />
                                <LeadBooleanFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_SERVES_DINNER}
                                    fieldValue={l.ff_MEAL_DINNER_c__c}
                                />
                                <LeadBooleanFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_SERVES_LUNCH}
                                    fieldValue={l.ff_MEAL_LUNCH_c__c}
                                />
                            </View>
                        </View>
                        <View style={commonStyle.flexDirectionRow}>
                            <View style={commonStyle.halfWidth}>
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_NUMBER_OF_VENUES_ON_SITE}
                                    fieldValue={l.VENUES_ON_SITE_c__c}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_HOTEL_STAR_RATING}
                                    fieldValue={l.Star_Level_c__c}
                                />
                                {l.Chain_c__c === '1' && (
                                    <LeadFieldTile
                                        fieldName={t.labels.PBNA_MOBILE_NUMBER_OF_OUTLETS}
                                        fieldValue={l.Number_Units_c__c}
                                    />
                                )}
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_K_12_ENROLLMENT}
                                    fieldValue={l.K_12_Enrollment_c__c}
                                />
                                {l.Chain_c__c === '1' && (
                                    <View>
                                        <LeadFieldTile
                                            fieldName={t.labels.PBNA_MOBILE_HQ_ADDRESS_STREET}
                                            fieldValue={l.HQ_Address_Street_c__c}
                                        />
                                        <LeadFieldTile
                                            fieldName={t.labels.PBNA_MOBILE_HQ_ADDRESS_CITY}
                                            fieldValue={l.HQ_Address_City_c__c}
                                        />
                                        <LeadFieldTile
                                            fieldName={t.labels.PBNA_MOBILE_HQ_ADDRESS_STATE}
                                            fieldValue={l.HQ_Address_State_c__c}
                                        />
                                    </View>
                                )}
                            </View>
                            <View style={commonStyle.halfWidth}>
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_NUMBER_OF_ROOMS}
                                    fieldValue={l.Number_of_Rooms_c__c}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_YEARS_IN_BUSINESS}
                                    fieldValue={l.Years_In_Business_c__c}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_ACTIVE_BASE_POPULATION}
                                    fieldValue={l.Active_Base_Population_c__c}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_Annual_Sales}
                                    fieldValue={l.Annual_Sales_c__c}
                                />
                                {l.Chain_c__c === '1' && (
                                    <View>
                                        <LeadFieldTile
                                            fieldName={t.labels.PBNA_MOBILE_HQ_ADDRESS_ZIP_POSTAL_CODE}
                                            fieldValue={l.HQ_Address_Postal_Code_c__c}
                                        />
                                        <LeadFieldTile
                                            fieldName={t.labels.PBNA_MOBILE_HQ_ADDRESS_COUNTRY}
                                            fieldValue={l.HQ_Address_Country_c__c}
                                        />
                                        <LeadFieldTile
                                            fieldName={t.labels.PBNA_MOBILE_HQ_PHONE_NUMBER}
                                            fieldValue={l.HQ_Phone_c__c}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </BaseSection>
    )
}

export default CustomerAttributes

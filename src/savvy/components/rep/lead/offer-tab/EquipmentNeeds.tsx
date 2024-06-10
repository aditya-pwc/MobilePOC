/**
 * @description Component to show lead equipment needs.
 * @author Shangmin Dou
 * @date 2021-05-25
 */
import React, { useImperativeHandle } from 'react'
import { LeadDetailBaseProps } from '../../../../interface/LeadInterface'
import BaseSection from '../../../common/BaseSection'
import { View, StyleSheet } from 'react-native'
import LeadFieldTile from '../common/LeadFieldTile'
import LeadInput from '../common/LeadInput'
import { useDispatch } from 'react-redux'
import { updateTempLeadAction } from '../../../../redux/action/LeadActionType'
import { LeadDetailSection, LeadStatus } from '../../../../enums/Lead'
import { judgeLeadEditable } from '../../../../helper/rep/CommonHelper'
import { t } from '../../../../../common/i18n/t'
import { isPersonaCRMBusinessAdmin } from '../../../../../common/enums/Persona'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    width_48_percent: {
        width: '48%'
    },
    width_50_percent: {
        width: '50%'
    }
})

const EquipmentNeeds = (props: LeadDetailBaseProps) => {
    const { l, cRef } = props
    const dispatch = useDispatch()
    const resetData = () => {
        const originData = {
            Estimated_Fountain_c__c: l.Estimated_Fountain_c__c,
            Estimated_Coolers_c__c: l.Estimated_Coolers_c__c,
            Estimated_Other_Equip_c__c: l.Estimated_Other_Equip_c__c,
            Other_Equipment_Notes_c__c: l.Other_Equipment_Notes_c__c,
            equipmentNeedsEditCount: 0
        }
        dispatch(updateTempLeadAction(originData))
    }
    useImperativeHandle(cRef, () => ({
        resetData
    }))
    return (
        <BaseSection>
            <View style={commonStyle.fullWidth}>
                {(judgeLeadEditable(l) || isPersonaCRMBusinessAdmin()) && (
                    <View style={commonStyle.marginBottom_15}>
                        <View style={commonStyle.flexDirectionRow}>
                            <View style={styles.width_50_percent}>
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_ESTIMATED_FTN}
                                    fieldValue={l.Estimated_Fountain_c__c}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_ESTIMATED_COOLERS}
                                    fieldValue={l.Estimated_Coolers_c__c}
                                />
                            </View>
                            <View style={[commonStyle.marginBottom_15, styles.width_50_percent]}>
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_ESTIMATED_OF_OTHER_EQUIPMENT}
                                    fieldValue={l.Estimated_Other_Equip_c__c}
                                />
                            </View>
                        </View>
                        <LeadFieldTile
                            fieldName={t.labels.PBNA_MOBILE_OTHER_EQUIPMENT_NOTES}
                            fieldValue={l.Other_Equipment_Notes_c__c}
                        />
                    </View>
                )}
                {l.Status__c === LeadStatus.NEGOTIATE &&
                    l.COF_Triggered_c__c !== '1' &&
                    !isPersonaCRMBusinessAdmin() && (
                        <View style={commonStyle.marginBottom_15}>
                            <View style={commonStyle.flexRowSpaceBet}>
                                <View style={styles.width_48_percent}>
                                    <LeadInput
                                        fieldName={t.labels.PBNA_MOBILE_ESTIMATED_FTN}
                                        fieldApiName={'Estimated_Fountain_c__c'}
                                        number
                                        section={LeadDetailSection.EQUIPMENT_NEEDS}
                                    />
                                    <LeadInput
                                        fieldName={t.labels.PBNA_MOBILE_ESTIMATED_OF_OTHER_EQUIPMENT}
                                        fieldApiName={'Estimated_Other_Equip_c__c'}
                                        number
                                        section={LeadDetailSection.EQUIPMENT_NEEDS}
                                    />
                                </View>
                                <View style={[commonStyle.marginBottom_15, styles.width_48_percent]}>
                                    <LeadInput
                                        fieldName={t.labels.PBNA_MOBILE_ESTIMATED_COOLERS}
                                        fieldApiName={'Estimated_Coolers_c__c'}
                                        number
                                        section={LeadDetailSection.EQUIPMENT_NEEDS}
                                    />
                                </View>
                            </View>
                            <LeadInput
                                fieldName={t.labels.PBNA_MOBILE_OTHER_EQUIPMENT_NOTES}
                                fieldApiName={'Other_Equipment_Notes_c__c'}
                                multiline
                                section={LeadDetailSection.EQUIPMENT_NEEDS}
                            />
                        </View>
                    )}
            </View>
        </BaseSection>
    )
}
export default EquipmentNeeds

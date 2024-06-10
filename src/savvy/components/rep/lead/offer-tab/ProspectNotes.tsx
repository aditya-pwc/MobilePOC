/**
 * @description Component to show lead prospect notes.
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
import moment from 'moment'
import CText from '../../../../../common/components/CText'
import TickBlueSvg from '../../../../../../assets/image/icon-tick-blue.svg'
import { t } from '../../../../../common/i18n/t'
import { isPersonaCRMBusinessAdmin } from '../../../../../common/enums/Persona'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    noCheckBoxTextStyle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400',
        marginTop: 15
    },
    tickStyle: {
        height: 20,
        width: 200,
        marginTop: 5
    }
})

const ProspectNotes = (props: LeadDetailBaseProps) => {
    const { l, cRef } = props
    const dispatch = useDispatch()
    const resetData = () => {
        const originData = {
            Additional_Prospect_Comments_c__c: l.Additional_Prospect_Comments_c__c,
            prospectNotesEditCount: 0
        }
        dispatch(updateTempLeadAction(originData))
    }
    useImperativeHandle(cRef, () => ({
        resetData
    }))
    const layoutData = l.Pre_Qualified_Time_c__c || l.No_Go_Date_c__c
    const noGoDate = layoutData ? ` - ${moment(layoutData).format('MMM Do, YYYY')}` : ''
    return (
        <BaseSection>
            <View style={[commonStyle.fullWidth, commonStyle.marginBottom_15]}>
                {(judgeLeadEditable(l) || isPersonaCRMBusinessAdmin()) && (
                    <View style={commonStyle.flexDirectionColumn}>
                        <LeadFieldTile
                            fieldName={t.labels.PBNA_MOBILE_ADDITIONAL_PROSPECT_COMMENTS}
                            fieldValue={l.Additional_Prospect_Comments_c__c}
                            containerStyle={{ marginBottom: 5 }}
                        />
                        <LeadFieldTile
                            fieldName={`${t.labels.PBNA_MOBILE_PRE_CALL_COMMENTS}${noGoDate}`}
                            fieldValue={l.Pre_Call_Comments_c__c}
                            containerStyle={{ marginBottom: 5 }}
                        />
                    </View>
                )}
                {l.Status__c === LeadStatus.NEGOTIATE &&
                    l.COF_Triggered_c__c !== '1' &&
                    !isPersonaCRMBusinessAdmin() && (
                        <View style={commonStyle.flexDirectionColumn}>
                            <LeadInput
                                fieldName={t.labels.PBNA_MOBILE_ADDITIONAL_PROSPECT_COMMENTS}
                                fieldApiName={'Additional_Prospect_Comments_c__c'}
                                multiline
                                section={LeadDetailSection.PROSPECT_NOTES}
                            />
                            <LeadInput
                                disabled
                                multiline
                                fieldName={`${t.labels.PBNA_MOBILE_PRE_CALL_COMMENTS}${noGoDate}`}
                                fieldApiName={'Pre_Call_Comments_c__c'}
                                section={LeadDetailSection.PROSPECT_NOTES}
                            />
                        </View>
                    )}
                {l.No_Go_Checkbox_c__c === '1' && (
                    <View>
                        <View style={commonStyle.flexDirectionRow}>
                            <View style={commonStyle.halfWidth}>
                                <CText style={styles.noCheckBoxTextStyle}>{t.labels.PBNA_MOBILE_NO_GO_CHECKBOX}</CText>
                                <TickBlueSvg style={styles.tickStyle} />
                            </View>
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_NO_GO_DATE}
                                fieldValue={l.No_Go_Date_c__c ? moment(l.No_Go_Date_c__c).format('MMM DD, YYYY') : null}
                                containerStyle={{ marginBottom: 5 }}
                            />
                        </View>
                        <View style={commonStyle.flexDirectionRow}>
                            <View style={commonStyle.halfWidth}>
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_NO_GO_REASON}
                                    fieldValue={l.No_Go_Reason_c__c}
                                    containerStyle={{ marginBottom: 5 }}
                                />
                            </View>
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_NO_GO_CONTACT}
                                fieldValue={l.Pre_Qualified_Contact_c__c}
                                containerStyle={{ marginBottom: 5 }}
                            />
                        </View>
                    </View>
                )}
            </View>
        </BaseSection>
    )
}
export default ProspectNotes

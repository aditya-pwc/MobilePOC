/**
 * @description Component to show lead highlight panel.
 * @author Shangmin Dou
 * @date 2021-05-010
 */
import React from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import LeadFieldTile from '../common/LeadFieldTile'
import { LeadDetailBaseProps } from '../../../../interface/LeadInterface'
import { transferBooleanField } from '../../../../utils/CommonUtils'
import CText from '../../../../../common/components/CText'
import { useTasks } from '../../../../hooks/LeadHooks'
import moment from 'moment'
import _ from 'lodash'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    fontWeigh500: {
        fontWeight: '500'
    },
    container: {
        paddingHorizontal: '5%',
        paddingVertical: '4%'
    },
    insideUpperContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFC409',
        height: 45,
        justifyContent: 'space-between',
        borderRadius: 8,
        borderColor: 'white',
        borderWidth: 2,
        marginBottom: '5%',
        paddingHorizontal: 22
    },
    insideMiddleContainer: {
        flexDirection: 'row',
        backgroundColor: '#EB445A',
        height: 45,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 8,
        borderColor: 'white',
        borderWidth: 2,
        marginBottom: '5%',
        paddingHorizontal: 22
    },
    insideBottomContainer: {
        backgroundColor: '#FFBE06',
        padding: 5,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center'
    },
    preOpenText: {
        fontWeight: '700',
        color: '#000000'
    },
    width_100: {
        width: 100
    }
})

interface HighlightPanelProps extends LeadDetailBaseProps {
    onClickCofRejectedViewMore: () => void
}

const HighlightPanel = (props: HighlightPanelProps) => {
    const { l, saveTimes, onClickCofRejectedViewMore } = props
    const { latestCofRequestedDate } = useTasks(l.ExternalId, saveTimes)
    const renderDash = () => {
        if (l.Business_Type_c__c && l.Secondary_Cuisine_c__c) {
            return ' - '
        }
        return ''
    }

    return (
        <View style={styles.container}>
            {l.COF_Triggered_c__c === '1' && (
                <View style={styles.insideUpperContainer}>
                    <View style={commonStyle.flexRowAlignCenter}>
                        <CText style={commonStyle.colorBlack}>{t.labels.PBNA_MOBILE_SUBMITTED_CUSTOMER_NUMBER}</CText>
                    </View>
                    <View style={commonStyle.flexRowAlignCenter}>
                        <CText style={[styles.fontWeigh500, commonStyle.colorBlack]}>
                            {_.isEmpty(latestCofRequestedDate)
                                ? ''
                                : moment(latestCofRequestedDate).format('MMM D, YYYY')}
                        </CText>
                    </View>
                </View>
            )}
            {l.COF_Rejected_c__c === '1' && (
                <View style={styles.insideMiddleContainer}>
                    <View style={commonStyle.flexRowAlignCenter}>
                        <CText style={commonStyle.colorWhite}>{t.labels.PBNA_MOBILE_REJECTED_CUSTOMER_NUMBER}</CText>
                    </View>
                    <TouchableOpacity
                        style={commonStyle.flexRowAlignCenter}
                        onPress={() => {
                            if (onClickCofRejectedViewMore) {
                                onClickCofRejectedViewMore()
                            }
                        }}
                    >
                        <CText style={[commonStyle.colorWhite, styles.fontWeigh500]}>
                            {t.labels.PBNA_MOBILE_VIEW_MORE}
                        </CText>
                    </TouchableOpacity>
                </View>
            )}
            <View style={commonStyle.flexDirectionRow}>
                <View style={commonStyle.halfWidth}>
                    {(l.Status__c === 'Negotiate' || l.Status__c === 'No Sale') && (
                        <LeadFieldTile
                            fieldName={t.labels.PBNA_MOBILE_LEAD_STATUS}
                            fieldValue={l.Lead_Sub_Status_c__c}
                            highlight
                        />
                    )}
                    {(l.Status__c === 'Open' || l.Status__c === 'Business Won') && (
                        <LeadFieldTile
                            fieldName={t.labels.PBNA_MOBILE_LEAD_STATUS}
                            fieldValue={l.Status__c}
                            highlight
                        />
                    )}
                </View>
                <View style={commonStyle.halfWidth}>
                    <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_LEAD_TYPE} fieldValue={l.Lead_Type_c__c} highlight />
                </View>
            </View>
            <View style={[commonStyle.flexDirectionRow, commonStyle.marginTop_30]}>
                <View style={commonStyle.halfWidth}>
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_MULTI_OUTLET}
                        fieldValue={transferBooleanField(l.Chain_c__c)}
                        highlight
                    />
                </View>
                <View style={commonStyle.halfWidth}>
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_BUSINESS_TYPE}
                        fieldValue={`${l.Business_Type_c__c || ''}${renderDash()}${l.Secondary_Cuisine_c__c || ''}`}
                        highlight
                    />
                </View>
            </View>
            {l.Pre_Open_c__c === '1' && (
                <View style={[styles.width_100, commonStyle.marginTop_30]}>
                    <View style={styles.insideBottomContainer}>
                        <CText style={styles.preOpenText}>{t.labels.PBNA_MOBILE_PRE_OPEN}</CText>
                    </View>
                </View>
            )}
        </View>
    )
}

export default HighlightPanel

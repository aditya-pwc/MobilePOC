/*
 * @Description:
 * @LastEditors: Yi Li
 */
/**
 * @description Component to show store operation section.
 * @author Shangmin Dou
 * @date 2021-05-010
 */
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LeadDetailBaseProps } from '../../../../interface/LeadInterface'
import BaseSection from '../../../common/BaseSection'
import LeadFieldTile from '../common/LeadFieldTile'
import PepsiCoDataEdit from './PepsiCoDataEdit'
import { LeadStatus } from '../../../../enums/Lead'
import { judgeLeadEditable } from '../../../../helper/rep/CommonHelper'
import { t } from '../../../../../common/i18n/t'
import { isPersonaCRMBusinessAdmin } from '../../../../../common/enums/Persona'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { useFindKAName } from '../../../../hooks/LeadHooks'
import { renderCustomerPriceGroupDetail } from '../../../common/CustomerProfileTab'
import CText from '../../../../../common/components/CText'
import _ from 'lodash'
import { useAppSelector } from '../../../../redux/ReduxHooks'

const styles = StyleSheet.create({
    baseSection: {
        marginBottom: 15,
        flexDirection: 'row'
    },
    judgeCont: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: '5%'
    },
    container: {
        backgroundColor: 'white',
        flexDirection: 'row',
        width: '100%'
    },
    priceCont: {
        flexDirection: 'column'
    },
    priceTitle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400',
        marginTop: 15,
        paddingHorizontal: '5%'
    },
    priceCell: {
        fontSize: 14,
        color: 'black',
        fontWeight: '400'
    },
    priceCellPadding: {
        paddingHorizontal: '5%'
    }
})

const PepsiCoData = (props: LeadDetailBaseProps) => {
    const { l, cRef } = props
    const { KAName, KADName } = useFindKAName(l)
    const pgList = useAppSelector((state) => state.leadReducer.priceGroupSlice.pgList)
    return (
        <BaseSection containerStyle={styles.container}>
            <View style={styles.baseSection}>
                {l.Status__c === LeadStatus.NEGOTIATE &&
                    l.COF_Triggered_c__c !== '1' &&
                    !isPersonaCRMBusinessAdmin() && <PepsiCoDataEdit l={l} cRef={cRef} />}
                {(judgeLeadEditable(l) || isPersonaCRMBusinessAdmin()) && (
                    <View>
                        <View style={styles.judgeCont}>
                            <View style={commonStyle.halfWidth}>
                                <LeadFieldTile
                                    fieldName={`${t.labels.PBNA_MOBILE_BUSINESS_CHANNEL} *`}
                                    fieldValue={l.BUSN_SGMNTTN_LVL_3_NM_c__c}
                                />
                                <LeadFieldTile
                                    fieldName={`${t.labels.PBNA_MOBILE_BUSINESS_SEGMENT} *`}
                                    fieldValue={l.BUSN_SGMNTTN_LVL_2_NM_c__c}
                                />
                                <LeadFieldTile
                                    fieldName={`${t.labels.PBNA_MOBILE_BUSINESS_SUB_SEGMENT} *`}
                                    fieldValue={l.BUSN_SGMNTTN_LVL_1_NM_c__c}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_CUSTOMER_TYPE}
                                    fieldValue={l.Customer_Type_c__c}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_PROPOSED_KEY_ACCOUNT}
                                    fieldValue={KAName}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_PROPOSED_KEY_ACCOUNT_DIVISION}
                                    fieldValue={KADName}
                                />
                            </View>
                            <View style={commonStyle.halfWidth}>
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_REGION_NAME}
                                    fieldValue={l.Region_c__c}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_MARKET_NAME}
                                    fieldValue={l.Market_c__c}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_LOCATION_NAME}
                                    fieldValue={l.Location_c__c}
                                />
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_PRIMARY_LANGUAGE}
                                    fieldValue={l.Primary_Language_c__c}
                                />
                            </View>
                        </View>
                        <CText style={styles.priceTitle}>{t.labels.PBNA_MOBILE_PROPOSED_PRICE_GROUP}</CText>
                        {_.size(pgList) > 0 && renderCustomerPriceGroupDetail(pgList, false, styles.priceCell)}
                        {_.size(pgList) === 0 && <CText style={[styles.priceCell, styles.priceCellPadding]}>-</CText>}
                    </View>
                )}
            </View>
        </BaseSection>
    )
}

export default PepsiCoData

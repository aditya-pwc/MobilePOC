/**
 * @description The component is to show the detail of the cof rejected.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 */
import React from 'react'
import { StyleSheet, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import LeadFieldTile from '../common/LeadFieldTile'
import moment from 'moment'
import { ActivityDetailProps } from '../../../../interface/LeadInterface'
import { renderBaseReqInfo } from '../../../../helper/rep/CofHelper'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '5.5%'
    },
    rejectedNoText: {
        marginTop: 24,
        fontSize: 14,
        fontWeight: '700',
        color: 'black',
        fontFamily: 'Gotham-Bold'
    },
    baseReqInfoContainer: {
        height: 1,
        width: '100%',
        backgroundColor: '#D3D3D3',
        marginVertical: 20
    }
})

const CofRejectedDetail = (props: ActivityDetailProps) => {
    const { activity } = props
    return (
        <View style={styles.container}>
            <CText style={styles.rejectedNoText}>{t.labels.PBNA_MOBILE_REJECTED_CUSTOMER_NUMBER}</CText>
            <View style={styles.baseReqInfoContainer} />
            {renderBaseReqInfo(activity)}
            <View style={[commonStyle.flexDirectionRow, commonStyle.fullWidth]}>
                <View style={commonStyle.halfWidth}>
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_DATE_REVIEWED}
                        fieldValue={moment(activity.CreatedDate).format('MMM D, YYYY')}
                    />
                </View>
            </View>
            <View style={[commonStyle.flexDirectionRow, commonStyle.fullWidth]}>
                <View style={commonStyle.fullWidth}>
                    <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_DESCRIPTION} fieldValue={activity.Description} />
                </View>
            </View>
            <View style={[commonStyle.flexDirectionRow, commonStyle.fullWidth]}>
                <View style={commonStyle.fullWidth}>
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_REASON}
                        fieldValue={props?.l?.Rejection_Reason_Text_c__c || '-'}
                    />
                </View>
            </View>
        </View>
    )
}

export default CofRejectedDetail

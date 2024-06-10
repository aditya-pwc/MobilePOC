/**
 * @description The component is to show COF Requested Detail
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 */
import React from 'react'
import { StyleSheet, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import { ActivityDetailProps } from '../../../../interface/LeadInterface'
import { renderBaseReqInfo } from '../../../../helper/rep/CofHelper'
import { t } from '../../../../../common/i18n/t'

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '5.5%'
    },
    customerNoText: {
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

const CofRequestedDetail = (props: ActivityDetailProps) => {
    const { activity } = props
    return (
        <View style={styles.container}>
            <CText style={styles.customerNoText}>{t.labels.PBNA_MOBILE_SUBMITTED_CUSTOMER_NUMBER}</CText>
            <View style={styles.baseReqInfoContainer} />
            {renderBaseReqInfo(activity)}
        </View>
    )
}
export default CofRequestedDetail

import React from 'react'
import CText from '../../../../../common/components/CText'
import moment from 'moment'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { useTopKpiPanelData } from '../../../../hooks/LeadKpiHooks'
import { useIsFocused } from '@react-navigation/native'
import { t } from '../../../../../common/i18n/t'
import { isPersonaCRMBusinessAdmin, isPersonaFSManager, isPersonaFSR } from '../../../../../common/enums/Persona'
import _ from 'lodash'

const styles = StyleSheet.create({
    topContainer: {
        alignItems: 'flex-end',
        width: '100%'
    },
    topDateView: {
        color: 'white',
        fontWeight: '500',
        fontSize: 18
    },
    topKpiContainer: {
        backgroundColor: '#00569C',
        padding: '5%',
        marginTop: 30,
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    topKpiLabelView: {
        flex: 1,
        justifyContent: 'space-between'
    },
    topKpiLabelText: {
        color: 'white'
    },
    topKpiValueText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 18
    },
    lineContainer: {
        backgroundColor: '#549ddb',
        width: 1,
        height: '100%',
        marginRight: 10
    },
    paddingLeft10: {
        paddingLeft: 10
    }
})
interface TopKpiCRMManagerDataProps {
    myLeadsCount: string
    openLeadsCount: string
    customerSubmittedCount: string
}
interface TopKpiPanelProps {
    topKpiCRMManagerData?: TopKpiCRMManagerDataProps
    leftLabel?: string
    isTopKpiLoading?: boolean
    refreshTimes?: number
}
const TopKpiPanel = (props: TopKpiPanelProps) => {
    const { topKpiCRMManagerData, leftLabel, isTopKpiLoading, refreshTimes } = props
    const isFocused = useIsFocused()
    const topKpiPanelData = useTopKpiPanelData(isFocused, refreshTimes || 0, topKpiCRMManagerData)
    return (
        <View>
            <CText style={styles.topDateView}>
                {t.labels.PBNA_MOBILE_TODAY_COMMA} {moment().format('MMMM Do')}
                {isTopKpiLoading && isPersonaCRMBusinessAdmin() && <ActivityIndicator style={styles.paddingLeft10} />}
            </CText>

            <View style={styles.topKpiContainer}>
                <View style={styles.topKpiLabelView}>
                    <CText style={styles.topKpiLabelText}>
                        {leftLabel || `${t.labels.PBNA_MOBILE_MY}\n${_.capitalize(t.labels.PBNA_MOBILE_LEADS)}`}
                    </CText>
                    <CText style={styles.topKpiValueText}>{topKpiPanelData.myLeadsCount}</CText>
                </View>
                <View style={styles.lineContainer} />
                <View style={styles.topKpiLabelView}>
                    <CText style={styles.topKpiLabelText}>
                        {`${t.labels.PBNA_MOBILE_OPEN}\n${_.capitalize(t.labels.PBNA_MOBILE_LEADS)}`}
                    </CText>
                    <CText style={styles.topKpiValueText}>{topKpiPanelData.openLeadsCount}</CText>
                </View>
                <View style={styles.lineContainer} />
                <View style={styles.topKpiLabelView}>
                    <CText style={styles.topKpiLabelText}>
                        {`${t.labels.PBNA_MOBILE_CUST_NO}\n${t.labels.PBNA_MOBILE_SUBMITTED}`}
                    </CText>
                    <CText style={styles.topKpiValueText}>{topKpiPanelData.customerSubmittedCount}</CText>
                </View>
                {(isPersonaFSR() || isPersonaFSManager()) && (
                    <>
                        <View style={styles.lineContainer} />
                        <View style={styles.topKpiLabelView}>
                            <CText style={styles.topKpiLabelText}>
                                {`${t.labels.PBNA_MOBILE_OPEN}\n${t.labels.PBNA_MOBILE_PRE_Q_LOWER_CASE}`}
                            </CText>
                            <CText style={styles.topKpiValueText}>{topKpiPanelData?.openPreQCount}</CText>
                        </View>
                    </>
                )}
            </View>
        </View>
    )
}

export default TopKpiPanel

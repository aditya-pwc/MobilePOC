import React from 'react'
import CText from '../../../../../common/components/CText'
import PickerTile from '../common/PickerTile'
import moment from 'moment'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { t } from '../../../../../common/i18n/t'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { CommonParam } from '../../../../../common/CommonParam'

const styles = StyleSheet.create({
    topContainer: {
        marginTop: -30,
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
        color: 'white',
        fontSize: 12
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
        marginHorizontal: 8
    },
    width200: {
        width: 200
    },
    inputStyle: {
        color: 'white',
        textAlign: 'right'
    }
})

interface TopKpiFSManagerInterface {
    topKpiFSManagerData: any
    setTopKpiFilter: any
    teamList: any
    leadData: any
    isLoading: boolean
}

const TopKpiFSManager = (props: TopKpiFSManagerInterface) => {
    const { topKpiFSManagerData, setTopKpiFilter, teamList, leadData, isLoading } = props
    return (
        <View>
            <View style={styles.topContainer}>
                <View style={styles.width200}>
                    <PickerTile
                        data={['', t.labels.PBNA_MOBILE_MY_TEAM, ...teamList]}
                        label={''}
                        placeholder={t.labels.PBNA_MOBILE_SELECT}
                        title={t.labels.PBNA_MOBILE_FILTER_BY}
                        required
                        showWhiteIcon
                        disabled={false}
                        borderStyle={{}}
                        defValue={t.labels.PBNA_MOBILE_MY_TEAM}
                        onDone={(v: any) => {
                            setTopKpiFilter(v)
                            Instrumentation.reportMetric(
                                `${CommonParam.PERSONA__c} selects FSRs to view on co-pilot`,
                                1
                            )
                        }}
                        inputStyle={styles.inputStyle}
                    />
                </View>
            </View>
            <CText style={styles.topDateView}>
                {t.labels.PBNA_MOBILE_TODAY_COMMA} {moment().format('MMMM Do')}
            </CText>
            <View style={styles.topKpiContainer}>
                <View style={styles.topKpiLabelView}>
                    <CText style={styles.topKpiLabelText}>{t.labels.PBNA_MOBILE_MY_TEAM_LEADS}</CText>
                    <CText style={styles.topKpiValueText}>{topKpiFSManagerData.myTeamLeadsCount}</CText>
                </View>
                <View style={styles.lineContainer} />
                <View style={styles.topKpiLabelView}>
                    <CText style={styles.topKpiLabelText}>{t.labels.PBNA_MOBILE_OPEN_LEADS}</CText>
                    <CText style={styles.topKpiValueText}>
                        {isLoading ? <ActivityIndicator /> : leadData.openLeadsLength || 0}
                    </CText>
                </View>
                <View style={styles.lineContainer} />
                <View style={styles.topKpiLabelView}>
                    <CText style={styles.topKpiLabelText}>
                        {`${t.labels.PBNA_MOBILE_CUST_NO}\n${t.labels.PBNA_MOBILE_SUBMITTED}`}
                    </CText>
                    <CText style={styles.topKpiValueText}>{topKpiFSManagerData.customerSubmittedCount}</CText>
                </View>
                <View style={styles.lineContainer} />
                <View style={[styles.topKpiLabelView]}>
                    <CText style={styles.topKpiLabelText}>
                        {`${t.labels.PBNA_MOBILE_OPEN}\n${t.labels.PBNA_MOBILE_PRE_Q_LOWER_CASE}`}
                    </CText>
                    <CText style={styles.topKpiValueText}>
                        {isLoading ? <ActivityIndicator /> : leadData.openPQLead || 0}
                    </CText>
                </View>
            </View>
        </View>
    )
}

export default TopKpiFSManager

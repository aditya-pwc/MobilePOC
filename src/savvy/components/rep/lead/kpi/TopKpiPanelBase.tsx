import React from 'react'
import CText from '../../../../../common/components/CText'
import moment from 'moment'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { t } from '../../../../../common/i18n/t'
import { useSelector } from 'react-redux'

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
        flex: 1,
        backgroundColor: '#00569C',
        padding: '5%',
        marginTop: 20,
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    topKpiLabelView: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'column'
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
    },
    tileContainer: { flexDirection: 'row', flex: 1 },
    indicatorStyle: {
        height: 25,
        width: 20
    }
})

interface TopKpiCRMManagerDataProps {
    myLeadsCount: string
    openLeadsCount: string
    customerSubmittedCount: string
}

interface TopKpiPanelProps {
    data: TopKpiCRMManagerDataProps | any
    isLoading?: boolean
    refreshTimes?: number
}

const TopKpiPanelBase = (props: TopKpiPanelProps) => {
    const { data, isLoading } = props
    const wiringUpdateStatus = useSelector((state: any) => state.leadReducer.refreshKpiBarReducer.updatingLeadWiring)
    const renderItem = (item: { label: string; value: number }, index: number) => {
        return (
            <View style={styles.tileContainer} key={index}>
                <View style={styles.topKpiLabelView}>
                    <CText style={styles.topKpiLabelText}>{item.label}</CText>
                    <View>
                        {wiringUpdateStatus || isLoading ? (
                            <ActivityIndicator style={styles.indicatorStyle} />
                        ) : (
                            <CText style={styles.topKpiValueText}>{item.value}</CText>
                        )}
                    </View>
                </View>
                {index < data.length - 1 && <View style={styles.lineContainer} />}
            </View>
        )
    }

    return (
        <View>
            <CText style={styles.topDateView}>
                {t.labels.PBNA_MOBILE_TODAY_COMMA} {moment().format('MMMM Do')}
            </CText>

            <View style={styles.topKpiContainer}>{data.map(renderItem)}</View>
        </View>
    )
}

export default TopKpiPanelBase

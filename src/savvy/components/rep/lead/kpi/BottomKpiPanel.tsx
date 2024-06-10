import React, { useState } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import PickerTile from '../common/PickerTile'
import CText from '../../../../../common/components/CText'
import { useBottomKpiPanelData } from '../../../../hooks/LeadKpiHooks'
import { useIsFocused } from '@react-navigation/native'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    pickerContainer: {
        marginLeft: 10,
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        // alignItems: 'flex-end',
        width: '100%'
    },
    bottomKpiContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
        marginBottom: 30,
        borderRadius: 5,
        borderColor: 'white',
        borderWidth: 1,
        padding: '5%',
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    bottomKpiLabelView: {
        flex: 1,
        alignItems: 'center'
    },
    bottomKpiLabelText: {
        color: 'white'
    },
    bottomKpiValueText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 18
    },
    lineContainer: {
        backgroundColor: 'white',
        width: 2,
        height: '100%'
    },
    indicatorContainer: {
        paddingBottom: 10
    }
})
interface BottomKpiPanelProps {
    selectedLocationId?: string
    refreshTimes?: number
}

const BottomKpiPanel = (props: BottomKpiPanelProps) => {
    const { selectedLocationId, refreshTimes } = props
    const isFocused = useIsFocused()
    const [loading, setLoading] = useState(false)

    const { bottomKpiPanelData, setFilter } = useBottomKpiPanelData(
        isFocused,
        refreshTimes || 0,
        selectedLocationId || '',
        setLoading
    )

    const timePickerList = [
        t.labels.PBNA_MOBILE_SELECT_TIME_INTERVAL,
        t.labels.PBNA_MOBILE_LAST_THIRTY_DAYS,
        t.labels.PBNA_MOBILE_YTD
    ]
    return (
        <View>
            <View style={styles.pickerContainer}>
                <View style={[styles.indicatorContainer]}>{loading && <ActivityIndicator size="small" />}</View>

                <PickerTile
                    data={timePickerList}
                    label={''}
                    placeholder={t.labels.PBNA_MOBILE_SELECT}
                    title={t.labels.PBNA_MOBILE_TIME_INTERVAL_CAPITALIZE}
                    required
                    disabled={false}
                    borderStyle={{}}
                    defValue={t.labels.PBNA_MOBILE_LAST_THIRTY_DAYS}
                    onDone={(v: any) => {
                        setFilter(v)
                    }}
                    inputStyle={commonStyle.colorWhite}
                />
            </View>
            <View style={styles.bottomKpiContainer}>
                <View style={styles.bottomKpiLabelView}>
                    <View>
                        <CText style={styles.bottomKpiLabelText}>{t.labels.PBNA_MOBILE_ADDRESSED_LEADS}</CText>
                        <CText style={styles.bottomKpiValueText}>{bottomKpiPanelData.totalCount}</CText>
                    </View>
                </View>
                <View style={styles.lineContainer} />
                <View style={styles.bottomKpiLabelView}>
                    <View>
                        <CText style={styles.bottomKpiLabelText}>{t.labels.PBNA_MOBILE_BUSINESS_WON}</CText>
                        <CText style={styles.bottomKpiValueText}>{bottomKpiPanelData.businessWonCount}</CText>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default BottomKpiPanel

import React from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import PickerTile from '../common/PickerTile'
import CText from '../../../../../common/components/CText'
import { t } from '../../../../../common/i18n/t'
import _ from 'lodash'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    pickerContainer: {
        marginLeft: 10,
        marginTop: 10,
        alignItems: 'flex-end',
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
        marginLeft: 30
    },
    bottomKpiLabelText: {
        color: '#D3D3D3'
    },
    bottomKpiValueText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 18
    },
    lineContainer: {
        backgroundColor: '#D3D3D3',
        width: 2,
        height: '100%'
    }
})

interface BottomKpiFSManagerInterface {
    setBottomKpiFilter: any
    leadData: any
    isLoading: boolean
}

const BottomKpiFSManager = (props: BottomKpiFSManagerInterface) => {
    const { setBottomKpiFilter, leadData, isLoading } = props
    const timePickerLabelList = [
        t.labels.PBNA_MOBILE_SELECT_TIME_INTERVAL,
        t.labels.PBNA_MOBILE_LAST_THIRTY_DAYS,
        t.labels.PBNA_MOBILE_YTD
    ]
    const timePickerList = ['-- Select Time Interval --', 'Last 30 days', 'YTD']
    return (
        <View>
            <View style={styles.pickerContainer}>
                <PickerTile
                    data={timePickerLabelList}
                    label={''}
                    placeholder={t.labels.PBNA_MOBILE_SELECT}
                    title={t.labels.PBNA_MOBILE_TIME_INTERVAL_CAPITALIZE}
                    required
                    disabled={false}
                    borderStyle={{}}
                    defValue={t.labels.PBNA_MOBILE_LAST_THIRTY_DAYS}
                    onDone={(v: any) => {
                        setBottomKpiFilter(timePickerList[_.indexOf(timePickerList, v)])
                    }}
                    inputStyle={[commonStyle.textAlignRight, commonStyle.colorWhite]}
                />
            </View>
            <View style={styles.bottomKpiContainer}>
                <View style={styles.bottomKpiLabelView}>
                    <View>
                        <CText style={styles.bottomKpiLabelText}>{t.labels.PBNA_MOBILE_ADDRESSED_LEADS}</CText>
                        <CText style={styles.bottomKpiValueText}>
                            {isLoading ? <ActivityIndicator /> : leadData.addressedLead || 0}
                        </CText>
                    </View>
                </View>
                <View style={styles.lineContainer} />
                <View style={styles.bottomKpiLabelView}>
                    <View>
                        <CText style={styles.bottomKpiLabelText}>{t.labels.PBNA_MOBILE_BUSINESS_WON}</CText>
                        <CText style={styles.bottomKpiValueText}>
                            {isLoading ? <ActivityIndicator /> : leadData.businessWonLead || 0}
                        </CText>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default BottomKpiFSManager

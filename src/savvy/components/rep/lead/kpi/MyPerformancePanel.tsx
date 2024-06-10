import React, { useRef, useState } from 'react'
import CText from '../../../../../common/components/CText'
import { ActivityIndicator, ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native'
import { useAgingLeadsData, useAgingOpenPreQLeadsData, useBusinessWonLeadsData } from '../../../../hooks/LeadKpiHooks'
import { useIsFocused } from '@react-navigation/native'
import ChevronSvg from '../../../../../../assets/image/ios-chevron.svg'
import LeadPieChart from './LeadPieChart'
import { t } from '../../../../../common/i18n/t'
import { reportToolingDonut } from '../../../../utils/AppDynamicUtils'
import { isPersonaCRMBusinessAdmin, isPersonaFSManager, isPersonaFSR } from '../../../../../common/enums/Persona'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

export const styles = StyleSheet.create({
    pageTitle: {
        color: 'white',
        fontWeight: '500',
        fontSize: 18,
        marginTop: 40
    },
    activityIndicator: {
        paddingLeft: 10
    },
    main: {
        backgroundColor: 'white',
        width: '100%',
        borderRadius: 5,
        marginTop: 20,
        alignItems: 'center',
        height: 400
    },
    mainInner: {
        height: 60,
        width: '100%'
    },
    flex_2: {
        flex: 2
    },
    flex_7: {
        flex: 7
    },
    wonLeadWrap: {
        paddingTop: 18,
        paddingLeft: 20
    },
    wonLeadText: {
        fontSize: 12,
        fontWeight: '500'
    },
    wonLeadYTD: {
        fontWeight: 'normal'
    },
    wonLead: {
        width: '100%',
        height: 3,
        backgroundColor: '#00A2D9',
        marginTop: 8,
        borderRadius: 2
    },
    width80: {
        width: 80
    },
    chevronIcon: {
        transform: [{ rotate: '-90deg' }]
    },
    chevronIcon1: {
        transform: [{ rotate: '90deg' }]
    },
    pieChartLegend: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: '5%'
    },
    text: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#D1A2FF',
        marginRight: 10
    },
    bgOption1: {
        backgroundColor: '#FFB4E9'
    },
    bgOption2: {
        backgroundColor: '#7FD7DD'
    },
    bgOption3: {
        backgroundColor: '#8592FF'
    }
})

interface MyTeamPerformancePanelProps {
    selectedLocationId?: string
    refreshTimes?: number
}
const MyPerformancePanel = (props: MyTeamPerformancePanelProps) => {
    const { selectedLocationId, refreshTimes } = props
    enum PieChartType {
        AgingLeads = 0,
        AgingOpenPreQLeads = isPersonaFSR() || isPersonaFSManager() ? 1 : 3,
        BusinessWonLeads = isPersonaCRMBusinessAdmin() ? 1 : 2
    }
    const isFocused = useIsFocused()
    const scrollViewRef = useRef(null)
    const [showAgingLeads, setShowAgingLeads] = useState<PieChartType>(PieChartType.AgingLeads)
    const [isLoading, setIsLoading] = useState(false)
    const [labelLayout, setLabelLayout] = useState([])
    const businessWonLeadsData = useBusinessWonLeadsData(
        isFocused,
        refreshTimes || 0,
        selectedLocationId || '',
        setIsLoading
    )
    const agingLeadsData = useAgingLeadsData(isFocused, refreshTimes || 0, selectedLocationId || '')
    const agingOpenPreQ = useAgingOpenPreQLeadsData(isFocused, refreshTimes || 0)

    const HIT_SLOP = {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30
    }

    const onLabelChange = (index: PieChartType) => {
        setShowAgingLeads(index)
        if (scrollViewRef.current) {
            let x = 0
            for (let i = 0; i < index; i++) {
                x += labelLayout[i]?.width
            }
            scrollViewRef.current.scrollTo({ x, y: 0, animated: true })
        }
    }

    return (
        <View>
            <CText style={styles.pageTitle}>
                {t.labels.PBNA_MOBILE_MY_PERFORMANCE}
                {isLoading && isPersonaCRMBusinessAdmin() && <ActivityIndicator style={styles.activityIndicator} />}
            </CText>
            <View style={styles.main}>
                <View style={styles.mainInner}>
                    <ScrollView
                        style={commonStyle.fullWidth}
                        contentContainerStyle={[commonStyle.flexDirectionRow, commonStyle.fullHeight]}
                        horizontal
                        showsHorizontalScrollIndicator
                        ref={scrollViewRef}
                    >
                        <TouchableOpacity
                            style={styles.wonLeadWrap}
                            onPress={() => {
                                onLabelChange(PieChartType.AgingLeads)
                                reportToolingDonut(true)
                            }}
                            onLayout={(event) => {
                                const layout = labelLayout
                                layout[PieChartType.AgingLeads] = event.nativeEvent.layout
                                setLabelLayout(layout)
                            }}
                        >
                            <CText
                                style={[
                                    styles.wonLeadText,
                                    {
                                        color: showAgingLeads === PieChartType.AgingLeads ? '#00A2D9' : 'black'
                                    }
                                ]}
                            >
                                {t.labels.PBNA_MOBILE_AGING_MY_LEADS.toUpperCase()}
                            </CText>
                            {showAgingLeads === PieChartType.AgingLeads && <View style={styles.wonLead} />}
                        </TouchableOpacity>
                        {(isPersonaFSR() || isPersonaFSManager()) && (
                            <TouchableOpacity
                                style={styles.wonLeadWrap}
                                onPress={() => {
                                    onLabelChange(PieChartType.AgingOpenPreQLeads)
                                    reportToolingDonut(false)
                                }}
                                onLayout={(event) => {
                                    const layout = labelLayout
                                    layout[PieChartType.AgingOpenPreQLeads] = event.nativeEvent.layout
                                    setLabelLayout(layout)
                                }}
                            >
                                <CText
                                    style={[
                                        styles.wonLeadText,
                                        {
                                            color:
                                                showAgingLeads === PieChartType.AgingOpenPreQLeads ? '#00A2D9' : 'black'
                                        }
                                    ]}
                                >
                                    {t.labels.PBNA_MOBILE_AGING_OPEN_PRE_Q.toUpperCase()}
                                </CText>
                                {showAgingLeads === PieChartType.AgingOpenPreQLeads && <View style={styles.wonLead} />}
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.wonLeadWrap}
                            onPress={() => {
                                onLabelChange(PieChartType.BusinessWonLeads)
                                reportToolingDonut(false)
                            }}
                            onLayout={(event) => {
                                const layout = labelLayout
                                layout[PieChartType.BusinessWonLeads] = event.nativeEvent.layout
                                setLabelLayout(layout)
                            }}
                        >
                            <CText
                                style={[
                                    styles.wonLeadText,
                                    {
                                        color: showAgingLeads === PieChartType.BusinessWonLeads ? '#00A2D9' : 'black'
                                    }
                                ]}
                            >
                                {t.labels.PBNA_MOBILE_BUSINESS_WON.toUpperCase()}&nbsp;
                                <CText style={styles.wonLeadYTD}>({t.labels.PBNA_MOBILE_YTD})</CText>
                            </CText>
                            {showAgingLeads === PieChartType.BusinessWonLeads && <View style={styles.wonLead} />}
                        </TouchableOpacity>
                        <View style={styles.width80} />
                    </ScrollView>
                </View>
                <View style={commonStyle.flexRowCenter}>
                    <View style={[commonStyle.size_20, commonStyle.alignCenter]}>
                        {showAgingLeads !== PieChartType.AgingLeads && (
                            <TouchableOpacity
                                onPress={() => {
                                    onLabelChange(showAgingLeads - 1)
                                    reportToolingDonut(showAgingLeads === PieChartType.AgingLeads)
                                }}
                                hitSlop={HIT_SLOP}
                            >
                                <ChevronSvg width={19} height={20} style={styles.chevronIcon} />
                            </TouchableOpacity>
                        )}
                    </View>
                    {showAgingLeads === PieChartType.AgingLeads && (
                        <LeadPieChart pieData={agingLeadsData.pieData} total={agingLeadsData.total} />
                    )}
                    {showAgingLeads === PieChartType.AgingOpenPreQLeads && (isPersonaFSR() || isPersonaFSManager()) && (
                        <LeadPieChart pieData={agingOpenPreQ.pieData} total={agingOpenPreQ.total} />
                    )}
                    {showAgingLeads === PieChartType.BusinessWonLeads && (
                        <LeadPieChart pieData={businessWonLeadsData.pieData} total={businessWonLeadsData.total} />
                    )}
                    <View style={[commonStyle.size_20, commonStyle.alignCenter]}>
                        {showAgingLeads !== PieChartType.BusinessWonLeads && (
                            <TouchableOpacity
                                onPress={() => {
                                    onLabelChange(showAgingLeads + 1)
                                    reportToolingDonut(showAgingLeads === PieChartType.AgingLeads)
                                }}
                                hitSlop={HIT_SLOP}
                            >
                                <ChevronSvg width={19} height={20} style={styles.chevronIcon1} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <View style={styles.pieChartLegend}>
                    {showAgingLeads !== PieChartType.BusinessWonLeads && (
                        <View style={styles.flex_2}>
                            <CText>{t.labels.PBNA_MOBILE_DAYS}</CText>
                        </View>
                    )}
                    <View style={[commonStyle.flexRowSpaceCenter, styles.flex_7]}>
                        <View style={commonStyle.flexRowAlignCenter}>
                            <View style={styles.text} />
                            <CText>
                                {showAgingLeads !== PieChartType.BusinessWonLeads
                                    ? t.labels.PBNA_MOBILE_DAYS_NUMBER1
                                    : t.labels.PBNA_MOBILE_TIER_1}
                            </CText>
                        </View>
                        <View style={commonStyle.flexRowAlignCenter}>
                            <View style={[styles.text, styles.bgOption1]} />
                            <CText>
                                {showAgingLeads !== PieChartType.BusinessWonLeads
                                    ? t.labels.PBNA_MOBILE_DAYS_NUMBER2
                                    : t.labels.PBNA_MOBILE_TIER_2}
                            </CText>
                        </View>
                        <View style={commonStyle.flexRowAlignCenter}>
                            <View style={[styles.text, styles.bgOption2]} />
                            <CText>
                                {showAgingLeads !== PieChartType.BusinessWonLeads
                                    ? t.labels.PBNA_MOBILE_DAYS_NUMBER3
                                    : t.labels.PBNA_MOBILE_TIER_3}
                            </CText>
                        </View>
                        <View style={commonStyle.flexRowAlignCenter}>
                            <View style={[styles.text, styles.bgOption3]} />
                            <CText>
                                {showAgingLeads !== PieChartType.BusinessWonLeads
                                    ? t.labels.PBNA_MOBILE_DAYS_NUMBER4
                                    : t.labels.PBNA_MOBILE_UNDEFINED}
                            </CText>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default MyPerformancePanel

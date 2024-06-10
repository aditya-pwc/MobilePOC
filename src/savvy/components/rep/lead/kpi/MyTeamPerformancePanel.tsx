import React, { useState, useEffect, useRef } from 'react'
import CText from '../../../../../common/components/CText'
import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native'
import {
    useAgingLeadsData,
    useAgingOpenPreQLeadsData,
    useTeamBusinessWonLeadsData
} from '../../../../hooks/LeadKpiHooks'
import { useIsFocused } from '@react-navigation/native'
import ChevronSvg from '../../../../../../assets/image/ios-chevron.svg'
import ChevronDisableSvg from '../../../../../../assets/image/ios-chevron-disable.svg'
import LeadPieChart from './LeadPieChart'
import { t } from '../../../../../common/i18n/t'
import { fetchTeamBusinessWon } from '../../../../api/ApexApis'
import { reportToolingDonut } from '../../../../utils/AppDynamicUtils'
import { isPersonaFSManager, isPersonaFSR } from '../../../../../common/enums/Persona'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { styles as performanceStyles } from './MyPerformancePanel'
import { useSelector } from 'react-redux'

const styles = StyleSheet.create({
    borderColorRed: {
        borderColor: 'red'
    }
})
const MyTeamPerformancePanel = () => {
    const isFocused = useIsFocused()
    const refreshTimes = useSelector((state: any) => state.leadReducer.refreshKpiBarReducer.refreshTimes)
    enum PieChartType {
        AgingLeads,
        AgingOpenPreQLeads,
        BusinessWonLeads
    }
    const scrollViewRef = useRef(null)
    const [showAgingLeads, setShowAgingLeads] = useState<PieChartType>(PieChartType.AgingLeads)
    const [dataToUpdate, setDataToUpdate] = useState({
        tier1: 0,
        tier2: 0,
        tier3: 0,
        tierNull: 0
    })
    const businessWonLeadsData = useTeamBusinessWonLeadsData(isFocused, dataToUpdate)
    const agingLeadsData = useAgingLeadsData(isFocused, refreshTimes)
    const agingOpenPreQLeadsData = useAgingOpenPreQLeadsData(isFocused, refreshTimes)
    const [labelLayout, setLabelLayout] = useState([])
    const HIT_SLOP = {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30
    }
    useEffect(() => {
        fetchTeamBusinessWon().then((res) => {
            const result = res.data.businessWonLeadInfo
            const dataToUpdateObj = {
                tier1: 0,
                tier2: 0,
                tier3: 0,
                tierNull: 0
            }
            result.forEach((item) => {
                if (item.Tier_c__c === '1') {
                    dataToUpdateObj.tier1++
                } else if (item.Tier_c__c === '2') {
                    dataToUpdateObj.tier2++
                } else if (item.Tier_c__c === '3') {
                    dataToUpdateObj.tier3++
                } else {
                    dataToUpdateObj.tierNull++
                }
            })
            setDataToUpdate(dataToUpdateObj)
        })
    }, [])

    const onLabelChange = (index: PieChartType) => {
        setShowAgingLeads(index)
        if (scrollViewRef.current) {
            let x = 0
            for (let i = 0; i < index; i++) {
                x += labelLayout[i].width
            }
            scrollViewRef.current.scrollTo({ x, y: 0, animated: true })
        }
    }

    const calculateTextColor = (isSelected: boolean) => {
        return isSelected ? 'black' : '#00A2D9'
    }

    return (
        <View>
            <CText style={performanceStyles.pageTitle}>{t.labels.PBNA_MOBILE_MY_TEAM_PERFORMANCE}</CText>
            <View style={performanceStyles.main}>
                <View style={performanceStyles.mainInner}>
                    <ScrollView
                        style={commonStyle.fullWidth}
                        contentContainerStyle={[commonStyle.flexDirectionRow, commonStyle.fullHeight]}
                        horizontal
                        showsHorizontalScrollIndicator
                        ref={scrollViewRef}
                    >
                        <TouchableOpacity
                            style={performanceStyles.wonLeadWrap}
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
                                    performanceStyles.wonLeadText,
                                    {
                                        color: calculateTextColor(showAgingLeads === PieChartType.AgingLeads)
                                    }
                                ]}
                            >
                                {t.labels.PBNA_MOBILE_AGING_MY_LEADS.toUpperCase()}
                            </CText>
                            {showAgingLeads === PieChartType.AgingLeads && <View style={performanceStyles.wonLead} />}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={performanceStyles.wonLeadWrap}
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
                                    performanceStyles.wonLeadText,
                                    {
                                        color: calculateTextColor(showAgingLeads === PieChartType.AgingOpenPreQLeads)
                                    }
                                ]}
                            >
                                {t.labels.PBNA_MOBILE_AGING_OPEN_PRE_Q.toUpperCase()}
                            </CText>
                            {showAgingLeads === PieChartType.AgingOpenPreQLeads && (
                                <View style={performanceStyles.wonLead} />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={performanceStyles.wonLeadWrap}
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
                                    performanceStyles.wonLeadText,
                                    {
                                        color: calculateTextColor(showAgingLeads === PieChartType.BusinessWonLeads)
                                    }
                                ]}
                            >
                                {t.labels.PBNA_MOBILE_BUSINESS_WON.toUpperCase()}&nbsp;
                                <CText style={performanceStyles.wonLeadYTD}>({t.labels.PBNA_MOBILE_YTD})</CText>
                            </CText>
                            {showAgingLeads === PieChartType.BusinessWonLeads && (
                                <View style={performanceStyles.wonLead} />
                            )}
                        </TouchableOpacity>
                        <View style={performanceStyles.width80} />
                    </ScrollView>
                </View>
                <View style={commonStyle.flexRowCenter}>
                    <View style={[commonStyle.size_20, commonStyle.alignCenter]}>
                        {showAgingLeads === PieChartType.AgingLeads && (
                            <ChevronDisableSvg width={19} height={20} style={[{ transform: [{ rotate: '-90deg' }] }]} />
                        )}
                        {showAgingLeads !== PieChartType.AgingLeads && (
                            <TouchableOpacity
                                onPress={() => {
                                    onLabelChange(showAgingLeads - 1)
                                    reportToolingDonut(showAgingLeads === PieChartType.AgingLeads)
                                }}
                                hitSlop={HIT_SLOP}
                            >
                                <ChevronSvg
                                    width={19}
                                    height={20}
                                    style={[performanceStyles.chevronIcon, styles.borderColorRed]}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                    {showAgingLeads === PieChartType.AgingLeads && (
                        <LeadPieChart pieData={agingLeadsData.pieData} total={agingLeadsData.total} />
                    )}
                    {showAgingLeads === PieChartType.AgingOpenPreQLeads && (isPersonaFSR() || isPersonaFSManager()) && (
                        <LeadPieChart pieData={agingOpenPreQLeadsData.pieData} total={agingOpenPreQLeadsData.total} />
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
                                <ChevronSvg width={19} height={20} style={performanceStyles.chevronIcon1} />
                            </TouchableOpacity>
                        )}
                        {showAgingLeads === PieChartType.BusinessWonLeads && (
                            <ChevronDisableSvg width={19} height={20} style={performanceStyles.chevronIcon1} />
                        )}
                    </View>
                </View>
                <View style={performanceStyles.pieChartLegend}>
                    {showAgingLeads !== PieChartType.BusinessWonLeads && (
                        <View style={performanceStyles.flex_2}>
                            <CText>{t.labels.PBNA_MOBILE_DAYS}</CText>
                        </View>
                    )}
                    <View style={[commonStyle.flexRowSpaceCenter, performanceStyles.flex_7]}>
                        <View style={commonStyle.flexRowAlignCenter}>
                            <View style={performanceStyles.text} />
                            <CText>
                                {showAgingLeads !== PieChartType.BusinessWonLeads
                                    ? t.labels.PBNA_MOBILE_DAYS_NUMBER1
                                    : t.labels.PBNA_MOBILE_TIER_1}
                            </CText>
                        </View>
                        <View style={commonStyle.flexRowAlignCenter}>
                            <View style={[performanceStyles.text, performanceStyles.bgOption1]} />
                            <CText>
                                {showAgingLeads !== PieChartType.BusinessWonLeads
                                    ? t.labels.PBNA_MOBILE_DAYS_NUMBER2
                                    : t.labels.PBNA_MOBILE_TIER_2}
                            </CText>
                        </View>
                        <View style={commonStyle.flexRowAlignCenter}>
                            <View style={[performanceStyles.text, performanceStyles.bgOption2]} />
                            <CText>
                                {showAgingLeads !== PieChartType.BusinessWonLeads
                                    ? t.labels.PBNA_MOBILE_DAYS_NUMBER3
                                    : t.labels.PBNA_MOBILE_TIER_3}
                            </CText>
                        </View>
                        <View style={commonStyle.flexRowAlignCenter}>
                            <View style={[performanceStyles.text, performanceStyles.bgOption3]} />
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

export default MyTeamPerformancePanel

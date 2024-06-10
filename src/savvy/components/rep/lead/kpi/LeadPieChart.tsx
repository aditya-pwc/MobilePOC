import React, { FC } from 'react'
import { VictoryLabel, VictoryPie, VictoryTooltip } from 'victory-native'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import CText from '../../../../../common/components/CText'
import Svg from 'react-native-svg'
import { t } from '../../../../../common/i18n/t'

const styles = StyleSheet.create({
    flyoutStyle: {
        stroke: 'black',
        strokeWidth: 0.1,
        fill: 'white'
    },
    tooltipStyle: {
        fontFamily: 'Gotham-Book',
        padding: 5
    },
    chartWrap: {
        width: 300,
        height: 300,
        alignItems: 'center',
        justifyContent: 'center'
    },
    moreLeadTotalStyle: {
        position: 'absolute',
        left: 100,
        top: 120,
        alignItems: 'center',
        justifyContent: 'center',
        width: 100
    },
    leadTotalStyle: {
        position: 'absolute',
        left: 112,
        top: 132,
        alignItems: 'center',
        justifyContent: 'center'
    },
    totalText: {
        fontWeight: '500',
        fontSize: 18
    }
})
interface LeadPieChartProps {
    pieData: any[]
    total: number
}

const CustomLabel = (props) => {
    return (
        <Svg>
            <VictoryLabel
                {...props}
                text={({ datum }) => {
                    return datum.label.split('(')[1].replace(')', '')
                }}
                radius={50}
            />
            <VictoryTooltip
                {...props}
                text={({ datum }) => {
                    return `${t.labels.PBNA_MOBILE_LEAD}: ` + datum.label.split('(')[0]
                }}
                flyoutStyle={styles.flyoutStyle}
                style={styles.tooltipStyle}
                renderInPortal={false}
            />
        </Svg>
    )
}

CustomLabel.defaultEvents = VictoryTooltip.defaultEvents

const LeadPieChart: FC<LeadPieChartProps> = (props: LeadPieChartProps) => {
    const { pieData, total } = props
    let tooltipStatus = false
    return (
        <TouchableOpacity style={styles.chartWrap}>
            <VictoryPie
                labelComponent={<CustomLabel />}
                width={300}
                height={300}
                innerRadius={50}
                labelRadius={62.5}
                radius={95}
                data={pieData}
                style={{
                    data: {
                        // @ts-ignore
                        // Wrong interface definition of the third party component
                        fill: ({ slice }) => slice.data.color
                    }
                }}
                events={[
                    {
                        target: 'data',
                        eventHandlers: {
                            onPressIn: () => {
                                return [
                                    {
                                        target: 'labels',
                                        eventKey: 'all',
                                        mutation: (v) => {
                                            if (v.active) {
                                                tooltipStatus = v.active
                                            }
                                            return { active: false }
                                        }
                                    }
                                ]
                            },
                            onPressOut: () => {
                                return [
                                    {
                                        target: 'labels',
                                        mutation: () => {
                                            if (tooltipStatus) {
                                                tooltipStatus = false
                                                return { active: false }
                                            }
                                            return { active: true }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ]}
            />
            <View
                style={t.labels.PBNA_MOBILE_TOTAL_LEADS.length > 11 ? styles.moreLeadTotalStyle : styles.leadTotalStyle}
            >
                <CText numberOfLines={3}>{t.labels.PBNA_MOBILE_TOTAL_LEADS}</CText>
                <CText style={styles.totalText}>{total + ''}</CText>
            </View>
        </TouchableOpacity>
    )
}

export default LeadPieChart

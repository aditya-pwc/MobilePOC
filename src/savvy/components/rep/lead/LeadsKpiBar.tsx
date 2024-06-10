/**
 * @description Component to Leads KPI Bar.
 * @author Shangmin Dou
 * @date 2021-07-21
 */
import React, { FC } from 'react'
import { View, StyleSheet } from 'react-native'
import KpiBarTile from './KpiBarTile'
import _ from 'lodash'
import { commonStyle } from '../../../../common/styles/CommonStyle'

interface LeadsKpiBarProps {
    barData: any
}

const styles = StyleSheet.create({
    kpiBarContainer: {
        borderRadius: 20,
        borderWidth: 1,
        height: 12,
        width: '100%',
        flexDirection: 'row',
        borderColor: 'white',
        alignItems: 'center',
        overflow: 'hidden'
    },
    kpiBarFilterContainer: {
        width: '100%',
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'space-between'
    }
})

const LeadsKpiBar: FC<LeadsKpiBarProps> = (props: LeadsKpiBarProps) => {
    const { barData } = props
    return (
        <View style={commonStyle.fullWidth}>
            <View style={styles.kpiBarContainer}>
                {_.map(barData.bar, (v, k) => {
                    return (
                        <View
                            style={{
                                height: 18,
                                backgroundColor: v.color,
                                width: v.percentage + '%'
                            }}
                            key={k}
                        />
                    )
                })}
            </View>
            <View style={styles.kpiBarFilterContainer}>
                {_.map(barData.text, (v, k) => {
                    return (
                        <KpiBarTile leadCount={v.count} leadData={v.percentage} name={v.name} color={v.color} key={k} />
                    )
                })}
            </View>
        </View>
    )
}

export default LeadsKpiBar

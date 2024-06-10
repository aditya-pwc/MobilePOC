import React, { FC } from 'react'
import TopKpiPanelBase from './TopKpiPanelBase'
import { useIsFocused } from '@react-navigation/native'
import { useRepTopKpiPanelData } from '../../../../hooks/LeadKpiHooks'

interface RepTopKpiPanelProps {
    refreshTimes: number
}

export const RepTopKpiPanel: FC<RepTopKpiPanelProps> = ({ refreshTimes }) => {
    const isFocused = useIsFocused()
    const topKpiPanelData = useRepTopKpiPanelData(isFocused, refreshTimes)
    return <TopKpiPanelBase data={topKpiPanelData} />
}

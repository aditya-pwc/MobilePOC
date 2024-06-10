import React, { FC, useState } from 'react'
import TopKpiCRMManager from './lead/kpi/TopKpiCRMManager'
import MyPerformancePanel from './lead/kpi/MyPerformancePanel'
import BottomKpiPanel from './lead/kpi/BottomKpiPanel'
import { useTopKpiCRMManagerData } from '../../hooks/LeadKpiHooks'
import { useIsFocused } from '@react-navigation/native'
import { withPersonaCheck } from '../../../common/components/PersonaCheck'
import { checkPersonaPermission } from '../../utils/PermissionChecker'

const CrmaDashboard: FC = () => {
    const isFocused = useIsFocused()
    const [topKpiFilterLocation, setTopKpiFilterLocation] = useState({ UNIQ_ID_VAL__c: '' })
    const [isTopKpiLoading, setIsTopKpiLoading] = useState(false)
    const topKpiCRMManagerData = useTopKpiCRMManagerData(
        isFocused,
        topKpiFilterLocation.UNIQ_ID_VAL__c,
        setIsTopKpiLoading
    )
    return (
        <>
            <TopKpiCRMManager
                isTopKpiLoading={isTopKpiLoading}
                topKpiCRMManagerData={topKpiCRMManagerData}
                topKpiFilterLocation={topKpiFilterLocation}
                setTopKpiFilterLocation={setTopKpiFilterLocation}
            />
            <MyPerformancePanel selectedLocationId={topKpiFilterLocation.UNIQ_ID_VAL__c} />
            <BottomKpiPanel selectedLocationId={topKpiFilterLocation.UNIQ_ID_VAL__c} />
        </>
    )
}

CrmaDashboard.displayName = 'CrmaDashboard'

export const CrmaDashboardWithPersonaCheck = withPersonaCheck(CrmaDashboard, checkPersonaPermission)

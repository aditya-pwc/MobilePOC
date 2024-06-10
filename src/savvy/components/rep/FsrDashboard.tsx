import React, { FC } from 'react'
import MyPerformancePanel from './lead/kpi/MyPerformancePanel'
import BottomKpiPanel from './lead/kpi/BottomKpiPanel'
import { View } from 'react-native'
import { withPersonaCheck } from '../../../common/components/PersonaCheck'
import { checkPersonaPermission } from '../../utils/PermissionChecker'
import { RepTopKpiPanel } from './lead/kpi/RepTopKpiPanel'

interface FsrDashboardProps {
    refreshTimes: number
}

const FsrDashboard: FC<FsrDashboardProps> = ({ refreshTimes }) => {
    return (
        <>
            <View>
                <RepTopKpiPanel refreshTimes={refreshTimes} />
                <MyPerformancePanel refreshTimes={refreshTimes} />
                <BottomKpiPanel refreshTimes={refreshTimes} />
            </View>
        </>
    )
}

FsrDashboard.displayName = 'FsrDashboard'

export const FsrDashboardWithPersonaCheck = withPersonaCheck(FsrDashboard, checkPersonaPermission)

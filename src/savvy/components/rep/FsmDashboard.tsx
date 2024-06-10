import React, { FC, useMemo, useState } from 'react'
import TopKpiFSManager from './lead/kpi/TopKpiFSManager'
import MyTeamPerformancePanel from './lead/kpi/MyTeamPerformancePanel'
import BottomKpiFSManager from './lead/kpi/BottomKpiFSManager'
import { useTopKpiFSManagerData, useTopKpiFSManagerLeadData } from '../../hooks/LeadKpiHooks'
import { useMyTeamList } from '../../hooks/UserHooks'
import _ from 'lodash'
import { useIsFocused } from '@react-navigation/native'
import { withPersonaCheck } from '../../../common/components/PersonaCheck'
import { checkPersonaPermission } from '../../utils/PermissionChecker'

interface FsmDashboardProps {
    refreshTimes: number
}

export const FsmDashboard: FC<FsmDashboardProps> = ({ refreshTimes }) => {
    const isFocused = useIsFocused()
    const [isLoading, setIsLoading] = useState(false)
    const [topKpiFilter, setTopKpiFilter] = useState('My Team')
    const [bottomKpiFilter, setBottomKpiFilter] = useState('-30 days')
    const tempTeamList = useMyTeamList(isFocused)
    const teamList = useMemo(() => {
        return _.sortBy(tempTeamList.map((item) => item.Name))
    }, [tempTeamList])

    const selectedUserGPID = useMemo(() => {
        const selectedUser = tempTeamList.filter((item) => {
            return item.Name === topKpiFilter
        })
        return selectedUser.length ? selectedUser[0]?.GPID__c : ''
    }, [tempTeamList, topKpiFilter])

    const topKpiFSManagerData = useTopKpiFSManagerData(isFocused, selectedUserGPID, refreshTimes)
    const leadData = useTopKpiFSManagerLeadData(
        isFocused,
        selectedUserGPID,
        refreshTimes,
        tempTeamList,
        bottomKpiFilter,
        setIsLoading
    )

    return (
        <>
            <TopKpiFSManager
                topKpiFSManagerData={topKpiFSManagerData}
                setTopKpiFilter={setTopKpiFilter}
                teamList={teamList}
                leadData={leadData}
                isLoading={isLoading}
            />
            <MyTeamPerformancePanel />
            <BottomKpiFSManager setBottomKpiFilter={setBottomKpiFilter} leadData={leadData} isLoading={isLoading} />
        </>
    )
}

FsmDashboard.displayName = 'FsmDashboard'

export const FsmDashboardWithPersonaCheck = withPersonaCheck(FsmDashboard, checkPersonaPermission)

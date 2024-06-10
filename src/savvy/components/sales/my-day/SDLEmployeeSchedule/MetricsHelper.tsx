/*
 * @Date: 2022-01-24 21:23:43
 * @LastEditors: Matthew Huang
 * @LastEditTime: 2022-03-14 10:57:05
 */
import React, { useEffect, useState } from 'react'
import { useDropDown } from '../../../../../common/contexts/DropdownContext'
import { DropDownType } from '../../../../enums/Manager'
import { restApexCommonCall } from '../../../../api/SyncUtils'
import { LoadingView, SalesRepTopLineMetricsProp } from './SalesScheduleTopLineMetrics'
import { t } from '../../../../../common/i18n/t'
import { existParamsEmpty } from '../../../../api/ApiUtil'

const SDL = 'SDL'

export const useMetricsData = (Component, userId, date, routeId) => {
    const { dropDownRef } = useDropDown()

    const [loading, setLoading] = useState<boolean>(true)
    const [hasError, setHasError] = useState<boolean>(false)

    const [data, setData] = useState<SalesRepTopLineMetricsProp | {}>({})

    const composeDataPath = `getSalesRepSchedule/${userId}&${date}&${SDL}&${routeId || ''}`

    useEffect(() => {
        if (!existParamsEmpty([userId, date])) {
            restApexCommonCall(composeDataPath, 'GET')
                .then((res) => {
                    const dataTemp = JSON.parse(res.data)
                    setData({ ...dataTemp })
                })
                .catch((err) => {
                    dropDownRef.current.alertWithType(
                        DropDownType.ERROR,
                        t.labels.PBNA_MOBILE_SDL_SCHEDULE_TOP_LINE_METRICS,
                        err
                    )
                    setHasError(true)
                })
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [userId, date])

    if (hasError) {
        return <></>
    }

    if (loading) {
        return <LoadingView />
    }
    return <Component {...data} />
}

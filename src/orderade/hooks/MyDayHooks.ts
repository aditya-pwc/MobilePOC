import { useEffect } from 'react'
import { getRouteInfoMetrics } from '../service/MyDayService'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import { myDaySelectedDateSelector, setRouteInfo, setRouteInfoLoading } from '../redux/slice/MyDaySlice'
import type { AppDispatch } from '../../savvy/redux/store/Store'
import { useAppSelector } from '../../savvy/redux/ReduxHooks'

export const useRouteInfoMetrics = (dispatch: AppDispatch, routeInfoFlag: number) => {
    const selectedDate = useAppSelector(myDaySelectedDateSelector)
    useEffect(() => {
        dispatch(setRouteInfoLoading(true))
        getRouteInfoMetrics(selectedDate)
            .then((res) => {
                dispatch(
                    setRouteInfo({
                        orders: {
                            planned: res.plannedOrderCount,
                            completed: res.completedOrderCount
                        },
                        delivery: {
                            planned: res.plannedDeliveryCount,
                            completed: res.completedDeliveryCount
                        },
                        merchandising: {
                            planned: res.plannedMerchandisingCount,
                            completed: res.completedMerchandisingCount
                        }
                    })
                )
                dispatch(setRouteInfoLoading(false))
            })
            .catch((err) => {
                dispatch(
                    setRouteInfo({
                        orders: {
                            planned: 0,
                            completed: 0
                        },
                        delivery: {
                            planned: 0,
                            completed: 0
                        },
                        merchandising: {
                            planned: 0,
                            completed: 0
                        }
                    })
                )
                dispatch(setRouteInfoLoading(false))
                storeClassLog(Log.MOBILE_ERROR, 'usePlannedOrderCount', err)
            })
    }, [selectedDate, routeInfoFlag])
}

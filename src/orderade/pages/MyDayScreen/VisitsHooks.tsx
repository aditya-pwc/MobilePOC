import { useEffect, useState } from 'react'
import { MyDayVisitListModel, VisitList, VisitListDataModel } from '../../interface/VisitListModel'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import { VisitListStatus } from '../../enum/VisitListStatus'
import { useIsFocused } from '@react-navigation/native'
import { CommonParam } from '../../../common/CommonParam'
import moment from 'moment'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { formatWithTimeZone } from '../../../common/utils/TimeZoneUtils'
import { appendLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import VisitService from '../../service/VisitService'
import { MyDayTabEnum } from '../../redux/slice/MyDaySlice'
import OrderService from '../../service/OrderService'

export type startEndButtonStatus = {
    showStartButton: boolean
    startButtonDisabled: boolean
    showEndButton: boolean
}

// get my day data
export const useVisitsData = (selectedDate: string, needRefresh: boolean, setNeedRefresh: Function) => {
    const [allData, setAllData] = useState<VisitListDataModel>({
        myVisitsSectionList: [],
        metric: null,
        userVisitLists: []
    })
    const { dropDownRef } = useDropDown()
    const isFocused = useIsFocused()

    const logMsg = `Route Visit List has been loaded at ${formatWithTimeZone(
        moment(),
        TIME_FORMAT.YMDTHMS,
        true,
        true
    )}`

    const fetchVisitData = async (inputDate: string) => {
        const visitsData: VisitListDataModel = await VisitService.fetchVisitDataByDay(inputDate, dropDownRef)
        setAllData(visitsData)
        appendLog(Log.MOBILE_INFO, 'orderade: fetch visit list', logMsg)
    }

    useEffect(() => {
        if (isFocused) {
            fetchVisitData(selectedDate)
            setNeedRefresh(false)
        }
    }, [selectedDate, isFocused])

    useEffect(() => {
        if (needRefresh) {
            fetchVisitData(selectedDate)
            setNeedRefresh(false)
        }
    }, [needRefresh])

    return {
        allData
    }
}

export const getStartEndButtonStatus = (
    userVisitLists: VisitList[],
    isToday: boolean,
    tab: MyDayTabEnum
): startEndButtonStatus => {
    const startEndButtonStatus = {
        showStartButton: false,
        startButtonDisabled: false,
        showEndButton: false
    }
    // if not today, no start/end my day button
    // if in route info tab, no start/end my day button
    if (!isToday || tab === MyDayTabEnum.RouteInfo) {
        return startEndButtonStatus
    }

    // if visitDate is not selectedDate, means visitList is pending refresh, no start/end my day button
    // we use both userVl and routeVl for comparison, in case one is empty
    // if (!(routeVisitLists[0]?.VisitDate === selectedDate || userVisitLists[0]?.VisitDate === selectedDate)) {
    //     return startEndButtonStatus
    // }

    const inProgressVisit = userVisitLists.find((one) => {
        return one.Status === VisitListStatus.IN_PROGRESS
    })

    // start button is always shown for today only, except there is in progress vl
    // start button will be disabled if there is no route selected
    startEndButtonStatus.showStartButton = !inProgressVisit && !!CommonParam.userRouteId
    // start button is disabled when there is no routeVL to work on
    // startEndButtonStatus.startButtonDisabled = !routeVisitLists.length

    // only show end button when 1. there is in progress vl 2. there is no in progress visit 3. no log time event in progress
    // modification in story 9469797: even there is a in progress event, we can end my day
    startEndButtonStatus.showEndButton = !!inProgressVisit

    return startEndButtonStatus
}

interface OrderStatusType {
    total: number
    completed: number
}

export const useOrderStatus = (myVisitsSectionList: Array<MyDayVisitListModel>) => {
    const [orderStatus, setOrderStatus] = useState<OrderStatusType>({
        total: 0,
        completed: 0
    })
    const updateOrderStatus = async () => {
        const orderStatus = await OrderService.getTodayLocalOrdersStatus()
        setOrderStatus(orderStatus)
        return orderStatus
    }
    useEffect(() => {
        updateOrderStatus()
    }, [myVisitsSectionList])
    return {
        orderStatus,
        updateOrderStatus
    }
}

export const useRouteInfoData = (selectedDate: string, routeInfoFlag: number) => {
    const [routeInfoData, setRouteInfoData] = useState([])
    const getDataWithSql = () => {
        VisitService.getRouteInfoVisitData(selectedDate, setRouteInfoData)
    }
    useEffect(() => {
        getDataWithSql()
    }, [selectedDate, routeInfoFlag])
    return routeInfoData
}

/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-08-09 03:06:20
 * @LastEditTime: 2022-11-21 14:45:31
 * @LastEditors: Mary Qian
 */

import React, { useEffect, useRef, useState } from 'react'
import { Animated, View, AppState } from 'react-native'
import { CommonParam } from '../../../common/CommonParam'
import { t } from '../../../common/i18n/t'
import { todayDateWithTimeZone } from '../../utils/TimeZoneUtils'
import MyVisitMetricHeader from './MyVisitMetricHeader'
import { TodayMetricFrontProps, TodayMetricProps } from './VisitMetric'
import { DropDownType } from '../../enums/Manager'
import { restApexCommonCall } from '../../api/SyncUtils'
import MapDraggable from '../common/MapDraggable'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import { getLatestData } from '../../service/SyncService'
import Loading from '../../../common/components/Loading'
import { addDaysToToday } from '../../../common/utils/YMDUtils'
import { useIsFocused } from '@react-navigation/native'
import { CommonApi } from '../../../common/api/CommonApi'
import { renderSalesMyDayList, renderSalesMyDayMapView } from '../MyDay/SalesMyDay'
import { getSalesMyDayData, getWorkScheduleFromLocal } from '../MyDay/SalesMyDayHelper'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { VisitRecordType, VisitStatus } from '../../enums/Visit'
import { existParamsEmpty } from '../../api/ApiUtil'

interface PSRMyDayProps {
    props
    navigation
}

let workSchedule = {}
let refreshTimer = null

export const calculateVisitNum = (list) => {
    let totalNum = 0
    let completeNum = 0
    let orderTotalNum = 0
    let orderCompleteNum = 0
    list?.forEach((item) => {
        item?.data?.forEach((visit) => {
            totalNum++
            if (visit.status === VisitStatus.COMPLETE) {
                completeNum++
            }
            if (visit.RecordTypeName === VisitRecordType.SALES) {
                orderTotalNum++
            }
            if (visit.RecordTypeName === VisitRecordType.SALES && visit.status === VisitStatus.COMPLETE) {
                orderCompleteNum++
            }
        })
    })
    const remainNum = totalNum - completeNum
    return {
        totalNum,
        completeNum,
        remainNum,
        orderTotalNum,
        orderCompleteNum
    }
}

const PSRMyDay = (parentProps: PSRMyDayProps) => {
    const myVisitMetricHeaderRef: any = useRef()
    const animatedHeight = useRef(new Animated.Value(260)).current
    const { dropDownRef } = useDropDown()
    const isFocused = useIsFocused()

    const [todayMetric, setTodayMetric] = useState<TodayMetricProps>()
    const [selectedDate, setSelectedDate] = useState(todayDateWithTimeZone(true))
    const [visitList, setVisitList] = useState([])
    const [isMapView, setIsMapView] = useState(false)
    const [dataLoading, setDataLoading] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const appState = useRef(AppState.currentState)
    const [appStateVal, setAppStateVal] = useState(appState.current)
    const [visitNum, setVisitNum] = useState<TodayMetricFrontProps>()

    const { navigation } = parentProps

    const onMetricHeaderDateChanged = (date: string) => {
        setSelectedDate(date)
    }

    const getTotalEvent = async (isRefresh = false) => {
        !isRefresh && setIsLoading(true)

        const weekDays = [{ fullYearDate: addDaysToToday(-14, true) }, { fullYearDate: addDaysToToday(7, true) }]

        try {
            workSchedule = await getWorkScheduleFromLocal({ Id: CommonParam.userId })
            const { obj } = await getSalesMyDayData(CommonParam.userId, weekDays, workSchedule)
            const list = obj[selectedDate] || []
            const VisitNumList = calculateVisitNum(list)
            setVisitNum(VisitNumList)

            setVisitList(list)
        } catch (error) {
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_EMPLOYEE_SCHEDULE_LIST_FAILED_TO_QUERY,
                error
            )
        } finally {
            setIsLoading(false)
            setDataLoading(false)
            // Need a timer to refresh the screen data
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            startRefreshTimer()
        }
    }

    const refreshLocalDB = async () => {
        await getLatestData()
    }

    const getMetricData = () => {
        const composeDataPath = `getSalesRepSchedule/${CommonParam.userId}&${selectedDate}&${CommonParam.PERSONA__c}&${
            CommonParam.userRouteId || ''
        }`

        if (!existParamsEmpty([CommonParam.userId, selectedDate, CommonParam.PERSONA__c])) {
            restApexCommonCall(composeDataPath, 'GET')
                .then((res) => {
                    const dataTemp = JSON.parse(res.data)
                    const total = dataTemp?.visitDenominator || 0
                    const complete = dataTemp?.visitNum || 0
                    setTodayMetric({
                        statusTotal: {
                            total,
                            completed: complete,
                            remaining: total - complete
                        },
                        caseInfo: dataTemp
                    })
                })
                .catch((err) => {
                    dropDownRef.current.alertWithType(
                        DropDownType.ERROR,
                        'getSalesRepSchedule failed:',
                        JSON.stringify(err)
                    )
                })
        }
    }

    const getAllData = async (showListHeaderLoading, showCenterLoading) => {
        try {
            showCenterLoading && setIsLoading(true)
            showListHeaderLoading && setDataLoading(true)
            await refreshLocalDB()
            getMetricData()
            getTotalEvent(true)
        } catch (error) {
            setIsLoading(false)
            setDataLoading(false)
        }
    }

    const refresh = async () => {
        getAllData(true, false)
    }

    const refreshDataWhenDateChanged = async () => {
        getAllData(false, true)
    }

    const stopSyncTimer = () => {
        if (refreshTimer) {
            clearTimeout(refreshTimer)
        }
    }

    const startRefreshTimer = () => {
        clearTimeout(refreshTimer)
        refreshTimer = setTimeout(() => {
            refreshDataWhenDateChanged()
        }, 1000 * 60 * parseInt(CommonApi.PBNA_MOBILE_PSR_DAY_REFRESH))
    }

    useEffect(() => {
        return () => {
            stopSyncTimer()
        }
    }, [])

    useEffect(() => {
        if (isFocused && appStateVal === 'active') {
            refreshDataWhenDateChanged()
        } else {
            stopSyncTimer()
        }
    }, [selectedDate, isFocused, appStateVal])

    const handleAppStateChange = async (nextAppState) => {
        appState.current = nextAppState
        setAppStateVal(appState.current)
    }

    useEffect(() => {
        const appStateListener = AppState.addEventListener('change', handleAppStateChange)
        return () => {
            appStateListener.remove()
        }
    }, [])

    const renderMetricHeader = () => {
        return (
            <MyVisitMetricHeader
                cRef={myVisitMetricHeaderRef}
                onDateChanged={onMetricHeaderDateChanged}
                animatedHeight={animatedHeight}
                todayMetric={todayMetric}
                visitNum={visitNum}
            />
        )
    }

    const renderSectionList = () => {
        return renderSalesMyDayList(visitList, navigation, dataLoading, refresh, '', visitNum)
    }

    const renderMapView = () => {
        const employeeListData = visitList[0]?.data ? visitList : []
        const employeeData = {
            persona: CommonParam.PERSONA__c,
            buid: CommonParam.BU_ID__c,
            gpid: CommonParam.GPID__c
        }

        return renderSalesMyDayMapView(selectedDate, navigation, employeeListData, employeeData)
    }

    const renderMapViewAfterwards = () => {
        return <MapDraggable setIsMapView={setIsMapView} isMapView={isMapView} />
    }

    return (
        <View style={commonStyle.flex_1}>
            {renderMetricHeader()}

            {!isMapView ? renderSectionList() : renderMapView()}

            {selectedDate === ' ' && renderMapViewAfterwards()}

            <Loading isLoading={isLoading} />
        </View>
    )
}

export default PSRMyDay

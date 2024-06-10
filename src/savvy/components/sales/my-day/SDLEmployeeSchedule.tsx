/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-01-17 02:02:29
 * @LastEditTime: 2023-06-14 13:52:40
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 */

import React, { useEffect, useState, useRef } from 'react'
import { StyleSheet, View } from 'react-native'

import MonthWeekFilter from '../../common/MonthWeekFilter'
import NavigationBar from '../../common/NavigationBar'
import BackButton from '../../common/BackButton'

import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { DropDownType } from '../../../enums/Manager'
import { t } from '../../../../common/i18n/t'
import DelEmployeeHeader from '../../del-sup/deliveries/DelEmployeeHeader'
import RenderMetrics, { LoadingView as MetricLoadingView } from './SDLEmployeeSchedule/SalesScheduleTopLineMetrics'
import { useSelector } from 'react-redux'
import { getWeekLabelArrObj } from '../../../utils/MerchManagerUtils'
import MapDraggable from '../../common/MapDraggable'
import { getData } from '../../../utils/sync/ManagerSyncUtils'
import { renderSalesMyDayList, renderSalesMyDayMapView } from '../../MyDay/SalesMyDay'
import { getSalesMyDayData, getWorkScheduleFromLocal } from '../../MyDay/SalesMyDayHelper'
import { addGeoFenceFlag } from '../../del-sup/deliveries/DelEmployeeSchedule'
import { getGeoTimeConfig } from '../../manager/schedule/GeofenceBarHelper'
import _ from 'lodash'
import { getWeekDataAndSelectDay, setDayAndWeek } from '../../del-sup/deliveries/DelEmployeeScheduleHelper'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import moment from 'moment'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent'
    },
    headerContainer: {
        paddingLeft: 22,
        paddingRight: 22,
        marginTop: 44
    },
    paddingHorizontal_22: {
        paddingHorizontal: 22
    }
})

interface EmployeeScheduleListInterface {
    props: any
    route: any
    navigation: any
}

let currWeekDays = []

const managerReducer = (state) => state.manager

const SDLEmployeeSchedule = ({ route, navigation }: EmployeeScheduleListInterface) => {
    const employeeData = route.params.employeeData || {}
    const [selDay, setSelDay] = useState(moment().format(TIME_FORMAT.Y_MM_DD))
    const [visitList, setVisitList] = useState([])

    const monthWeekFilter = useRef(null)
    const { dropDownRef } = useDropDown()

    const [weekDaySel, setWeekDaysSel] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [dataLoading, setDataLoading] = useState(false)
    const [isMapView, setIsMapView] = useState(false)

    const manager = useSelector(managerReducer)
    const [workSchedule, setWorkSchedule] = useState({})

    const getTotalEvent = async (isRefresh: boolean, selectedDate: string) => {
        !isRefresh && setIsLoading(true)

        try {
            const { obj, geoFenceData } = await getSalesMyDayData(
                employeeData.Id,
                currWeekDays,
                workSchedule,
                !_.isEmpty(employeeData?.uniqUnassignRoutes)
                    ? employeeData?.uniqUnassignRoutes
                    : employeeData?.RouteSalesGeoId
            )
            const geoTimeConfig = await getGeoTimeConfig()
            const weekData = getWeekDataAndSelectDay(obj, currWeekDays, selectedDate, monthWeekFilter)
            let list = obj[selectedDate] || []
            if (_.isEmpty(list) && !_.isEmpty(obj)) {
                list = obj[Object.keys(obj)[0]]
            }
            addGeoFenceFlag(list, geoFenceData, geoTimeConfig)
            setVisitList(list)
            setWeekDaysSel({ ...weekData })
            setDataLoading(false)
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_EMPLOYEE_SCHEDULE_LIST_FAILED_TO_QUERY,
                error
            )
        }
    }

    const syncRefresh = async (selectedDate: string) => {
        try {
            setIsLoading(true)
            await getData(selectedDate)
            await getTotalEvent(true, selectedDate)
        } catch (error) {
            setIsLoading(false)
        }
    }

    const onChangeDate = async (date) => {
        setSelDay(date.format(TIME_FORMAT.Y_MM_DD))
        await syncRefresh(date.format(TIME_FORMAT.Y_MM_DD))
    }

    const refresh = async () => {
        setDataLoading(true)
        await getData(manager.selectedDate)
        await getTotalEvent(true, selDay)
    }

    const getWorkSchedule = async () => {
        const tempWorkSchedule = await getWorkScheduleFromLocal(employeeData)
        setWorkSchedule(tempWorkSchedule as Object)
    }

    useEffect(() => {
        const setDataRes = setDayAndWeek(manager, route, selDay, currWeekDays, getWeekLabelArrObj)
        currWeekDays = setDataRes.currWeekDays
        getTotalEvent(false, setDataRes.selDay)
    }, [manager.selectedDate, route.params?.reloadDate])

    useEffect(() => {
        getWorkSchedule()
    }, [employeeData])

    const renderCalendar = () => {
        return (
            <MonthWeekFilter
                cRef={monthWeekFilter}
                isShowWeek
                fromEmployeeSchedule
                tmpWeekArr={route.params.tmpWeekArr}
                weekDaySel={Object.values(weekDaySel)}
                onchangeDate={(date) => onChangeDate(date)}
                onSetWeekArr={(week) => {
                    currWeekDays = week
                }}
                isLoading={isLoading}
            />
        )
    }

    const renderMetrics = (userId, date, routeId, metricLoading) => {
        return metricLoading || !date ? (
            <MetricLoadingView />
        ) : (
            <RenderMetrics userId={userId} date={date} routeId={routeId} />
        )
    }

    const renderSectionList = () => {
        return renderSalesMyDayList(visitList, navigation, dataLoading, refresh, employeeData.firstName, {})
    }

    const renderMapView = () => {
        const employeeListData = visitList[0]?.data ? visitList : []
        if (employeeData?.visits?.[0]) {
            employeeData.visits[0].persona = employeeData?.persona || ''
        }
        return renderSalesMyDayMapView(selDay, navigation, employeeListData, employeeData)
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <NavigationBar
                    left={<BackButton navigation={navigation} />}
                    title={t.labels.PBNA_MOBILE_EMPLOYEE_SCHEDULE}
                />
            </View>

            <View style={styles.paddingHorizontal_22}>
                <DelEmployeeHeader employeeId={employeeData.Id} />
            </View>

            {renderCalendar()}

            {!isMapView &&
                renderMetrics(employeeData.Id, visitList[0]?.visitDate, employeeData?.RouteSalesGeoId, dataLoading)}

            {!isMapView ? renderSectionList() : renderMapView()}

            <MapDraggable setIsMapView={setIsMapView} isMapView={isMapView} />
        </View>
    )
}

export default SDLEmployeeSchedule

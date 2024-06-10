/*
 * @Author: Howard Xiao
 * @Date: 2023-10-25
 * @Description: As Merchandised As Scheduled click in page
 */

import moment from 'moment'
import React, { FC, useEffect, useRef, useState } from 'react'
import { View, FlatList, ListRenderItemInfo } from 'react-native'
import CText from '../../../../common/components/CText'
import { Log } from '../../../../common/enums/Log'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { t } from '../../../../common/i18n/t'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getCopilotAMASListData, getMangerCopilotPerformance } from '../../../helper/manager/AllManagerMyDayHelper'
import {
    getCurrentPeriod,
    getParamsDay,
    getPepsiCoPeriodCalendar,
    GreenUpArrow,
    RedDownArrow
} from '../../merchandiser/MyPerformance'
import CalendarWithTD from '../common/CalendarWithTD'
import { filterEmployees } from '../helper/MMSearchBarHelper'
import CopilotNavHeader from '../copilot/CopilotNavHeader'
import ASASEmployeeCard from '../copilot/SDL/ASASEmployeeCard'
import { DEFAULT_TARGET } from '../copilot/SDL/SDLCopilotPerformance'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { useDispatch } from 'react-redux'
import { compose } from '@reduxjs/toolkit'
import managerAction from '../../../redux/action/H01_Manager/managerAction'
import Loading from '../../../../common/components/Loading'
import { existParamsEmpty } from '../../../api/ApiUtil'
import { sortArrByParamsASC } from '../helper/MerchManagerHelper'
import { ASASStyles } from './SDL/SDLASASPage'
import { NavigationRoute } from '../../../enums/Manager'
import MMSearchBar from '../common/MMSearchBar'
import { getScheduleTotalSundays, getWeekArrByDate } from '../../../utils/MerchManagerUtils'

interface AMASProps {
    navigation: any
}

interface AMASMetrics {
    amasActual: number
    amasTarget: number
}

export interface AMASEmployee {
    actualAMAS: number
    firstName: string
    ftFlag: string
    lastName: string
    routeSalesGeoId: string
    targetAMAS: number
    title: string
    totalCount: string
    userGPID: string
    userID: string
    userStatsId: string
    gpid: string
}

const initResData: AMASMetrics = {
    amasActual: 0,
    amasTarget: DEFAULT_TARGET
}

const styles = ASASStyles
const PERCENT_LABEL = '%'

export const AMASPage: FC<AMASProps> = (props: AMASProps) => {
    const { navigation } = props
    const searchBarFilter: any = useRef()
    const [employeeOriginList, setEmployeeOriginList] = useState(Array<AMASEmployee>)
    const [employeeList, setEmployeeList] = useState(Array<AMASEmployee>)
    const [periodCalendar, setPeriodCalendar] = useState([])
    const [resData, setResData] = useState(initResData)
    const [currentDay, setCurrentDay] = useState(moment().format(TIME_FORMAT.Y_MM_DD))
    const dispatch = useDispatch()
    const selectManagerDate = compose(dispatch, managerAction.setSelectDate)
    const [isLoading, setIsLoading] = useState(false)

    /* get data of current day when first entering this page */
    const getAsMerchandisedAsScheduledDataByDate = async (date: string, periodCalendar: any[]) => {
        try {
            let startDay, endDay
            setIsLoading(true)
            if (date === t.labels.PBNA_MOBILE_PERIOD_TO_DATE || date === t.labels.PBNA_MOBILE_WEEK_TO_DATE) {
                startDay = getParamsDay(date, periodCalendar, getCurrentPeriod).firstDay
                endDay = getParamsDay(date, periodCalendar, getCurrentPeriod).secondDay
            } else {
                startDay = endDay = date
            }
            if (existParamsEmpty([startDay, endDay])) {
                setResData(initResData)
                setIsLoading(false)
                return
            }
            // top actual and target value
            getMangerCopilotPerformance(startDay, endDay, setResData)
            // employee list data
            const listData = await getCopilotAMASListData(startDay, endDay)
            listData.forEach((item) => {
                item.totalCount = Math.round(item.actualAMAS) + PERCENT_LABEL
                item.gpid = item.userGPID
            })
            sortArrByParamsASC(listData, 'actualAMAS')
            setEmployeeOriginList(listData)
            setEmployeeList(listData)
            selectManagerDate(moment(startDay))
            setIsLoading(false)
        } catch (e) {
            setIsLoading(false)
            storeClassLog(Log.MOBILE_ERROR, 'getAsMerchandisedAsScheduledDataByDate', ErrorUtils.error2String(e))
        }
    }

    useEffect(() => {
        getPepsiCoPeriodCalendar().then(async (result: any) => {
            setPeriodCalendar(result)
        })
    }, [])

    useEffect(() => {
        getAsMerchandisedAsScheduledDataByDate(currentDay, periodCalendar)
    }, [currentDay])

    const onEECardClick = (item: AMASEmployee) => {
        const selectedDate = moment(currentDay)
        const dayIndex = selectedDate.format('d')
        const selectSunday = selectedDate.clone().day(0).format('M/D')
        const sundays = getScheduleTotalSundays()
        const weekArr = getWeekArrByDate(selectedDate)
        navigation.navigate(NavigationRoute.EMPLOYEE_SCHEDULE_LIST, {
            navigation: navigation,
            employeeData: { id: item.userID, name: item.firstName + ' ' + item.lastName, ...item },
            selectedDay: parseInt(dayIndex),
            selectedWeek: sundays.indexOf(selectSunday),
            tmpWeekArr: weekArr
        })
    }

    const disabledClick =
        currentDay === t.labels.PBNA_MOBILE_PERIOD_TO_DATE || currentDay === t.labels.PBNA_MOBILE_WEEK_TO_DATE

    const renderItem = ({ item }: ListRenderItemInfo<AMASEmployee>) => {
        return (
            <ASASEmployeeCard
                item={item}
                showAMASTotal
                activeOpacity={disabledClick ? 1 : 0.2}
                onPressFunc={() => {
                    !disabledClick && onEECardClick(item)
                }}
            />
        )
    }

    return (
        <View style={styles.container}>
            <CopilotNavHeader navigation={navigation} title={t.labels.PBNA_MOBILE_COPILOT_AMAS?.split(' ')?.[0]} />
            <View style={styles.boxContainer}>
                <CalendarWithTD
                    needPTD
                    needWTD
                    onDateChange={(date: string) => {
                        setCurrentDay(date)
                    }}
                />
                <View style={styles.totalMetrics}>
                    <View>
                        <CText style={styles.metricsLabel}>{t.labels.PBNA_MOBILE_COPILOT_ACTUAL}</CText>
                        <View style={[commonStyle.flexDirectionRow, styles.alignItemsCenter]}>
                            <CText style={styles.metricsValue}>
                                {`${Math.round(resData?.amasActual) || 0}${PERCENT_LABEL}`}
                            </CText>
                            <View style={styles.arrow}>
                                {Math.round(resData?.amasActual) >= DEFAULT_TARGET ? GreenUpArrow : RedDownArrow}
                            </View>
                        </View>
                    </View>
                    <View>
                        <CText style={styles.metricsLabel}>{t.labels.PBNA_MOBILE_TARGET}</CText>
                        <CText style={[styles.metricsValue, styles.textRight]}>
                            {`${Math.round(resData?.amasTarget) || DEFAULT_TARGET}${PERCENT_LABEL}`}
                        </CText>
                    </View>
                </View>
            </View>
            <View style={styles.containerBox}>
                <View style={styles.searchContainer}>
                    <MMSearchBar
                        cRef={searchBarFilter}
                        placeholder={t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES}
                        originData={employeeOriginList}
                        setSearchResult={setEmployeeList}
                        onSearchTextChange={filterEmployees}
                    />
                </View>
                <FlatList data={employeeList} renderItem={renderItem} keyExtractor={(item) => item.userID} />
            </View>
            <Loading isLoading={isLoading} />
        </View>
    )
}

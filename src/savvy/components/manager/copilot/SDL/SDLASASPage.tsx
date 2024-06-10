/*
 * @Author: Howard Xiao
 * @Date: 2023-06-21
 * @Description: SDL Accounts Serviced As Scheduled list view
 */

import moment from 'moment'
import React, { FC, useEffect, useRef, useState } from 'react'
import { View, StyleSheet, FlatList, ListRenderItemInfo } from 'react-native'
import CText from '../../../../../common/components/CText'
import { Log } from '../../../../../common/enums/Log'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { t } from '../../../../../common/i18n/t'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { getSDLCopilotASASMetrics, getSDLCopilotASASEmployees } from '../../../../helper/manager/AllManagerMyDayHelper'
import {
    getCurrentPeriod,
    getParamsDay,
    getPepsiCoPeriodCalendar,
    GreenUpArrow,
    RedDownArrow
} from '../../../merchandiser/MyPerformance'
import CalendarWithTD from '../../common/CalendarWithTD'
import SearchBarFilter from '../../common/SearchBarFilter'
import { filterEmployees } from '../../helper/MMSearchBarHelper'
import CopilotNavHeader from '../CopilotNavHeader'
import ASASEmployeeCard, { ASASEmployee } from './ASASEmployeeCard'
import { DEFAULT_TARGET, initResData } from './SDLCopilotPerformance'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { useDispatch } from 'react-redux'
import { compose } from '@reduxjs/toolkit'
import managerAction from '../../../../redux/action/H01_Manager/managerAction'
import Loading from '../../../../../common/components/Loading'
import { existParamsEmpty } from '../../../../api/ApiUtil'
import { sortArrByParamsASC } from '../../helper/MerchManagerHelper'

interface ASASProps {
    navigation: any
    route: any
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    boxContainer: {
        width: '100%',
        backgroundColor: '#004C97'
    },
    totalMetrics: {
        marginTop: 24,
        marginBottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 22
    },
    metricsLabel: {
        color: baseStyle.color.borderGray,
        fontSize: 12
    },
    metricsValue: {
        fontSize: 18,
        fontWeight: '900',
        color: baseStyle.color.white,
        marginTop: 5
    },
    alignItemsCenter: {
        alignItems: 'center'
    },
    textRight: {
        textAlign: 'right'
    },
    arrow: {
        marginTop: 5
    },
    containerBox: {
        flex: 1,
        paddingTop: 22,
        backgroundColor: '#fff'
    },
    searchContainer: {
        paddingHorizontal: 22,
        paddingBottom: 20
    }
})

export const ASASStyles = styles

export const SDLASASPage: FC<ASASProps> = (props: ASASProps) => {
    const { navigation, route } = props
    const selectedTerritory = route?.params?.selectedTerritoryId
    const searchBarFilter: any = useRef()
    const [employeeOriginList, setEmployeeOriginList] = useState(Array<ASASEmployee>)
    const [employeeList, setEmployeeList] = useState(Array<ASASEmployee>)
    const [periodCalendar, setPeriodCalendar] = useState([])
    const [resData, setResData] = useState(initResData)
    const [currentDay, setCurrentDay] = useState(moment().format(TIME_FORMAT.Y_MM_DD))
    const dispatch = useDispatch()
    const selectManagerDate = compose(dispatch, managerAction.setSelectDate)
    const [isLoading, setIsLoading] = useState(false)

    /* get data of current day when first entering this page */
    const getAccountsServicedDataByDate = async (date: string, periodCalendar: any[]) => {
        try {
            let startDay, endDay
            setIsLoading(true)
            if (date === t.labels.PBNA_MOBILE_PERIOD_TO_DATE || date === t.labels.PBNA_MOBILE_WEEK_TO_DATE) {
                startDay = getParamsDay(date, periodCalendar, getCurrentPeriod).firstDay
                endDay = getParamsDay(date, periodCalendar, getCurrentPeriod).secondDay
            } else {
                startDay = endDay = date
            }
            if (existParamsEmpty([startDay, endDay, selectedTerritory])) {
                setResData(initResData)
                setIsLoading(false)
                return
            }
            getSDLCopilotASASMetrics(startDay, endDay, setResData, selectedTerritory)
            const listData = await getSDLCopilotASASEmployees(startDay, endDay, selectedTerritory, 'ASAS')
            sortArrByParamsASC(listData, 'actualASAS')
            setEmployeeOriginList(listData)
            setEmployeeList(listData)
            selectManagerDate(moment(startDay))
            setIsLoading(false)
        } catch (e) {
            setIsLoading(false)
            storeClassLog(Log.MOBILE_ERROR, getAccountsServicedDataByDate.name, ErrorUtils.error2String(e))
        }
    }

    useEffect(() => {
        getPepsiCoPeriodCalendar().then((result: any) => {
            setPeriodCalendar(result)
        })
    }, [])

    useEffect(() => {
        getAccountsServicedDataByDate(currentDay, periodCalendar)
    }, [currentDay])

    const onEECardClick = (item: ASASEmployee) => {
        navigation?.navigate('SDLEmployeeSchedule', {
            navigation: navigation,
            employeeData: { Id: item.userID, RouteSalesGeoId: item?.routeSalesGeoId, ...item }
        })
    }

    const renderItem = ({ item }: ListRenderItemInfo<ASASEmployee>) => {
        return (
            <ASASEmployeeCard
                item={item}
                showTargetAndActual
                onPressFunc={() => {
                    onEECardClick(item)
                }}
            />
        )
    }

    return (
        <View style={styles.container}>
            <CopilotNavHeader navigation={navigation} title={t.labels.PBNA_MOBILE_COPILOT_ASAS} />
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
                                {`${Math.round(resData?.decActualValue || 0)}${'%'}`}
                            </CText>
                            <View style={styles.arrow}>
                                {Math.round(resData?.decActualValue) >= DEFAULT_TARGET ? GreenUpArrow : RedDownArrow}
                            </View>
                        </View>
                    </View>
                    <View>
                        <CText style={styles.metricsLabel}>{t.labels.PBNA_MOBILE_TARGET}</CText>
                        <CText style={[styles.metricsValue, styles.textRight]}>
                            {`${Math.round(resData?.decTargetValueOfASAS || DEFAULT_TARGET)}${'%'}`}
                        </CText>
                    </View>
                </View>
            </View>
            <View style={styles.containerBox}>
                <View style={styles.searchContainer}>
                    <SearchBarFilter
                        cRef={searchBarFilter}
                        isEmployee
                        setListData={setEmployeeList}
                        originData={employeeOriginList}
                        originListData={employeeList}
                        disabledFilterBtn
                        placeholder={t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES}
                        searchTextChange={(text) => {
                            filterEmployees(employeeOriginList, text)
                        }}
                        notShowFilterBtn
                    />
                </View>
                <FlatList data={employeeList} renderItem={renderItem} keyExtractor={(item) => item.userID} />
            </View>
            <Loading isLoading={isLoading} />
        </View>
    )
}

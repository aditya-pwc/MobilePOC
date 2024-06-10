/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-01-05 03:05:17
 * @LastEditTime: 2024-01-05 15:43:22
 * @LastEditors: Yi Li
 */

import React, { useEffect, useRef, useState } from 'react'
import { ScrollView, SectionList, StyleSheet, View } from 'react-native'
import _ from 'lodash'
import moment from 'moment'

import MonthWeekFilter from '../../common/MonthWeekFilter'
import NavigationBar from '../../common/NavigationBar'
import BackButton from '../../common/BackButton'
import CText from '../../../../common/components/CText'

import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { diffDaysFromToday, formatWithTimeZone, todayDateWithTimeZone } from '../../../utils/TimeZoneUtils'
import ERROR_DELIVERY from '../../../../../assets/image/icon-error-visit-list.svg'
import { DropDownType } from '../../../enums/Manager'
import { NUMBER_VALUE } from '../../../enums/MerchandiserEnums'
import { t } from '../../../../common/i18n/t'
import RefreshControlM from '../../manager/common/RefreshControlM'
import DelScheduleVisitCard from './DelScheduleCard'
import {
    getOriginData,
    getWeekDataAndSelectDay,
    handleListData,
    noTimeValue,
    orderActualVisitList,
    orderPlannedVisitList,
    setDayAndWeek
} from './DelEmployeeScheduleHelper'
import DelEmployeeHeader from './DelEmployeeHeader'
import { getLatestData } from '../../../service/SyncService'
import DelTopLineCell from './DelTopLineCell'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { RowText } from './DelComponents'
import { convertMileData } from '../../common/UnitUtils'
import { VisitStatus } from '../../../enums/Visit'
import { restApexCommonCall } from '../../../api/SyncUtils'
import { CommonApi } from '../../../../common/api/CommonApi'
import { useSelector } from 'react-redux'
import { getRecordTypeIdByDeveloperName, getRound } from '../../../utils/CommonUtils'
import { RecordTypeEnum, VisitListRecordTypeEnum } from '../../../enums/RecordType'
import { getWeekLabelArrObj } from '../../../utils/MerchManagerUtils'
import MapDraggable from '../../common/MapDraggable'
import MapScreen from '../../../pages/MapScreen'
import { getIncomingVisits } from '../../../helper/manager/mapHelper'
import { Log } from '../../../../common/enums/Log'
import { CommonParam } from '../../../../common/CommonParam'
import { getGeoTimeConfig, getStartAndEndTimeForBreadcrumbRecord } from '../../manager/schedule/GeofenceBarHelper'
import { existParamsEmpty } from '../../../api/ApiUtil'
import { handleScroll, handleSwipeCollapsibleRef } from '../../../helper/manager/AllManagerMyDayHelper'
import SwipeCollapsible from '../../common/SwipeCollapsible'
import { calSCHeights } from '../../manager/schedule/NewScheduleList'
import { getWorkScheduleFromLocal } from '../../MyDay/SalesMyDayHelper'
import { VisitListStatus } from '../../../enums/VisitList'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

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
    selectTap: {
        marginTop: -22
    },
    flexPadding: {
        flex: 1,
        backgroundColor: '#F2F4F7'
    },
    paddingBottom22: {
        paddingBottom: 22
    },
    sectionHeader: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitle: {
        fontFamily: 'Gotham',
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    timeTitle: {
        fontFamily: 'Gotham',
        fontSize: 12,
        color: '#000000',
        fontWeight: '400'
    },
    overTime: {
        marginLeft: 7
    },
    sectionLine: {
        marginLeft: 38,
        marginRight: 38,
        height: 1,
        backgroundColor: '#D3D3D3',
        marginBottom: 15
    },
    sectionList: {
        paddingTop: 15
    },
    rowLeft: {
        flex: 1
    },
    rowCenter: {
        flex: 1,
        alignItems: 'center'
    },
    rowRight: {
        flex: 1,
        alignItems: 'flex-end'
    },
    mt_30: {
        marginTop: 30
    },
    topLineRow: {
        height: 130,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    row: {
        flexDirection: 'row'
    },
    topLineBarRow: {
        paddingVertical: 23
    },
    valText: {
        fontSize: 12
    },
    lineText: {
        fontSize: 12,
        color: '#D3D3D3'
    },
    redText: {
        color: 'red',
        fontSize: 12
    },
    greenText: {
        color: 'green',
        fontSize: 12
    },
    paddingHorizontal_22: {
        paddingHorizontal: 22
    },
    topLineContainer: {
        paddingHorizontal: 22,
        paddingTop: 24,
        backgroundColor: '#fff'
    },
    topTime: {
        marginTop: -10
    },
    bottomTime: {
        flexDirection: 'row'
    },
    marginTop10: {
        marginTop: 10
    },
    height60: {
        height: 60
    },
    height120: {
        height: 120
    },
    marginBottom10: {
        marginBottom: 10
    }
})

interface EmployeeScheduleListInterface {
    props: any
    route: any
    navigation: any
}

let selDay = ''
let currWeekDays = []
let workSchedule = {}
const HEIGHT_TO_SCROLL = 0
const HIDE_CARD_HEIGHT_DELES = 10
const SHOW_CARD_HEIGHT_DELES = 218
const PROPERTY_START_TIME_MAX = 20
const PROPERTY_END_TIME_MAX = 15

const initResData = {
    actualHours: null,
    casesDelivered: '0',
    dispatchedCases: '0',
    manifestHours: null,
    manifestMiles: 0,
    returnsCs: '0',
    returnsUn: '0',
    notStartFlag: false
}

const managerReducer = (state) => state.manager

export const getBreadcrumbInfo = (geoFenceData, geoTimeConfig, visit) => {
    geoFenceData.forEach((geofence) => {
        if (visit.storeId === geofence.Customer__c) {
            const recordTimeData = getStartAndEndTimeForBreadcrumbRecord(visit, geoTimeConfig)
            const startTime = recordTimeData.startTime
            const endTime = recordTimeData.endTime
            if (moment(geofence.Time__c) >= startTime && moment(geofence.Time__c) <= endTime) {
                visit.inGeoFence = true
            }
        }
    })
}

export const addGeoFenceFlag = (visitArr, geoFenceData, geoTimeConfig) => {
    visitArr?.forEach((vl) => {
        vl?.data?.forEach((visit) => {
            getBreadcrumbInfo(geoFenceData, geoTimeConfig, visit)
        })
    })
}

const DelEmployeeSchedule = ({ route, navigation }: EmployeeScheduleListInterface) => {
    const employeeData = route.params.employeeData || {}
    const [actualList, setActualList] = useState([])

    const monthWeekFilter = useRef(null)
    const { dropDownRef } = useDropDown()
    const manager = useSelector(managerReducer)

    const [weekDaySel, setWeekDaysSel] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [dataLoading, setDataLoading] = useState(false)
    const [stops, setStops] = useState({})
    const [resData, setResData] = useState(initResData)
    const [isMapView, setIsMapView] = useState(false)
    const topSwipeCollapsibleRef: any = useRef()
    const downSwipeCollapsibleRef: any = useRef()
    const [isListExpended, setIsListExpended] = useState(false)
    const [lastOffset, setLastOffset] = useState(0)

    const { toExpend, toInitialPosition } = handleSwipeCollapsibleRef(
        topSwipeCollapsibleRef,
        downSwipeCollapsibleRef,
        navigation
    )

    const orderVisitList = (list) => {
        setActualList(orderActualVisitList(list))

        // show empty list for future actual tab
        if (list.length > 0) {
            const visitDate = list[0].visitDate
            if (diffDaysFromToday(visitDate) > 0) {
                setActualList(orderPlannedVisitList(list))
            }
        }
    }

    const getStopObj = (list) => {
        let completeCount = 0
        let totalCount = 0
        const stopObj = {}

        for (const key in list) {
            const sortList = list[key].data
            for (const sortKey in sortList) {
                if (sortList[sortKey].status === VisitStatus.COMPLETE) {
                    completeCount++
                }
                totalCount++
            }

            stopObj[NUMBER_VALUE.ZERO_NUM] = completeCount
            stopObj[NUMBER_VALUE.ONE_NUM] = totalCount
        }

        return stopObj
    }

    const handleOriginData = async (data, geoFenceData) => {
        const obj: any = _.groupBy(data, 'VisitDate')
        for (const key in obj) {
            const element = obj[key] || []
            obj[key] = handleListData(element, workSchedule)
        }

        const weekData = getWeekDataAndSelectDay(obj, currWeekDays, selDay, monthWeekFilter)
        const list = obj[selDay] || []

        try {
            if (
                employeeData.Id &&
                !employeeData.unassign &&
                !existParamsEmpty([selDay, CommonParam.userLocationId]) &&
                employeeData?.LoadNum !== '-'
            ) {
                const result = await restApexCommonCall(
                    `${CommonApi.PBNA_MOBILE_API_EMPLOYEE_SCHEDULE}/${employeeData.Id}&${selDay}&${CommonParam.userLocationId}&${employeeData?.LoadNum}`,
                    'GET'
                )
                const res = JSON.parse(result.data)
                setResData(res)
                storeClassLog(Log.MOBILE_INFO, 'top line metrics', ErrorUtils.error2String(result.data))
            } else {
                // unassigned user do not call api
                setResData(initResData)
            }
            const geoTimeConfig = await getGeoTimeConfig()
            addGeoFenceFlag(list, geoFenceData, geoTimeConfig)
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'top line metrics', error)
        }
        setStops(getStopObj(list))
        orderVisitList(list)
        setWeekDaysSel({ ...weekData })
        setDataLoading(false)
        setIsLoading(false)
    }

    const getTotalEvent = async (isRefresh?: boolean) => {
        !isRefresh && setIsLoading(true)
        const dvlRecordTypeId = await getRecordTypeIdByDeveloperName(
            VisitListRecordTypeEnum.DeliveryDailyVisitList,
            'Visit_List__c'
        )
        const dvRecordTypeId = await getRecordTypeIdByDeveloperName(RecordTypeEnum.DELIVERY, 'Visit')

        const employeeId = employeeData.unassign ? null : employeeData.Id
        getOriginData(employeeId, currWeekDays, dvlRecordTypeId, dvRecordTypeId, employeeData.LoadNum)
            .then((res) => {
                handleOriginData(res.visitData, res.geoFenceData)
            })
            .catch((err) => {
                setIsLoading(false)
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_EMPLOYEE_SCHEDULE_LIST_FAILED_TO_QUERY,
                    err
                )
            })
    }

    const syncRefresh = async () => {
        try {
            setIsLoading(true)
            await getLatestData()
            getTotalEvent(true)
        } catch (error) {
            getTotalEvent(true)
            setIsLoading(false)
        }
    }

    const onChangeDate = async (date) => {
        selDay = date.format(TIME_FORMAT.Y_MM_DD)
        syncRefresh()
    }

    const fetchWorkSchedule = async () => {
        workSchedule = await getWorkScheduleFromLocal(employeeData)
    }

    useEffect(() => {
        const setRes = setDayAndWeek(manager, route, selDay, currWeekDays, getWeekLabelArrObj)
        selDay = setRes.selDay
        currWeekDays = setRes.currWeekDays
        getTotalEvent()
    }, [manager.selectedDate, route.params?.reloadDate])

    useEffect(() => {
        fetchWorkSchedule()
    }, [employeeData])

    const refresh = async () => {
        setDataLoading(true)
        await getLatestData()
        getTotalEvent(true)
    }

    const renderHeaderAndFooter = (title, section, isHeader) => {
        let timeAM = null
        let dateStr = ''
        let showHeader = false
        let showTime = false
        const timeMarker = '+000'
        const isVlNotStarted = section.status === VisitListStatus.NOT_STARTED
        const isVlCompleted = section.status === VisitListStatus.COMPLETED
        const titleStr = (isHeader ? section.title : section.footTitle) || ''

        const isToday = todayDateWithTimeZone(true) === section.visitDate

        const hadStarted = titleStr.indexOf(timeMarker) > -1
        const headerHadAtLeastOneValue =
            (section.gateCheckOut?.indexOf(timeMarker) > -1 || section.manifestStartTime?.indexOf(timeMarker) > -1) &&
            isHeader
        const footerHadAtLeastOneVal =
            (section.manifestEndTime?.indexOf(timeMarker) > -1 || section.gateCheckIn?.indexOf(timeMarker) > -1) &&
            isVlCompleted
        const isFirstSec = section.indexSection === 0
        const list = actualList[0]?.data ? actualList : []
        const isLastSec = section.indexSection === list.length - 1
        const gateCheckInTime = section.gateCheckIn
            ? ` ${formatWithTimeZone(section.gateCheckIn, TIME_FORMAT.HMMA, true, true)}`
            : noTimeValue
        const gateCheckOutTime = section.gateCheckOut
            ? ` ${formatWithTimeZone(section.gateCheckOut, TIME_FORMAT.HMMA, true, true)}`
            : noTimeValue
        const manifestStartTime = section.manifestStartTime
            ? ` ${formatWithTimeZone(section.manifestStartTime, TIME_FORMAT.HMMA, true, true)}`
            : noTimeValue
        const manifestEndTime = section.manifestEndTime
            ? ` ${formatWithTimeZone(section.manifestEndTime, TIME_FORMAT.HMMA, true, true)}`
            : noTimeValue
        const startPropertyStyle = section.fenceOut > PROPERTY_START_TIME_MAX && styles.redText
        const endPropertyStyle = section.fenceIn > PROPERTY_END_TIME_MAX && styles.redText
        if (isToday && !hadStarted && isHeader && isFirstSec) {
            timeAM = (employeeData.firstName || '') + ' ' + t.labels.PBNA_MOBILE_NOT_START
            showHeader = true
        } else if (hadStarted || headerHadAtLeastOneValue || footerHadAtLeastOneVal) {
            if (hadStarted) {
                timeAM = ` ${formatWithTimeZone(titleStr, TIME_FORMAT.HMMA, true, true)}`
                dateStr = ` | ${formatWithTimeZone(titleStr, TIME_FORMAT.DDD_MMM_DD_YYYY, true, false)}`
            } else {
                timeAM = ` ${noTimeValue}`
            }
            showHeader = true
            showTime = true
        }
        const showPunch = isHeader ? section.notHaveStartTime : section.notHaveEndTime

        if (showHeader) {
            return (
                <View>
                    <View style={[styles.sectionHeader, isHeader && { marginBottom: 20 }]}>
                        {showTime && showPunch && (
                            <View
                                style={[
                                    styles.topTime,
                                    styles.marginBottom10,
                                    section.notHaveStartTime && section.notHaveEndTime && { marginTop: 10 }
                                ]}
                            >
                                <CText style={styles.headerTitle}>{t.labels.PBNA_MOBILE_PUNCH_NOT_FEED}</CText>
                            </View>
                        )}
                        {!isHeader && isVlCompleted && (
                            <View
                                style={[
                                    commonStyle.alignCenter,
                                    showPunch && styles.topTime,
                                    isLastSec && !isHeader && styles.marginBottom10
                                ]}
                            >
                                <View style={styles.row}>
                                    <CText style={[styles.headerTitle, styles.marginTop10]}>
                                        {t.labels.PBNA_MOBILE_GATE_FENCE_IN}
                                    </CText>
                                    <CText style={[styles.timeTitle, styles.marginTop10]}>
                                        {` ${manifestEndTime}`}
                                    </CText>
                                </View>
                                <View style={styles.row}>
                                    <CText style={[styles.headerTitle, styles.marginTop10]}>
                                        {t.labels.PBNA_MOBILE_GATE_CHECK_IN}
                                    </CText>
                                    <CText style={[styles.timeTitle, styles.marginTop10]}>
                                        {` ${gateCheckInTime || noTimeValue}`}
                                    </CText>
                                </View>
                                {isLastSec && (
                                    <View style={[styles.row]}>
                                        <CText style={[styles.headerTitle, styles.marginTop10]}>
                                            {t.labels.PBNA_MOBILE_ACTUAL_ON_PROPERTY_TIME}
                                        </CText>
                                        <CText style={[styles.timeTitle, styles.marginTop10, endPropertyStyle]}>
                                            {' '}
                                            {`${section.fenceIn} `}
                                            {section.fenceIn !== noTimeValue ? t.labels.PBNA_MOBILE_MIN : ''}
                                        </CText>
                                    </View>
                                )}
                            </View>
                        )}
                        {((isFirstSec && isHeader) || (isLastSec && !isHeader)) && (
                            <View style={styles.bottomTime}>
                                {showTime && <CText style={styles.headerTitle}>{title}</CText>}
                                <CText style={styles.timeTitle}>{timeAM}</CText>
                                <CText style={styles.headerTitle}>{dateStr}</CText>
                                {isHeader && section.overTime && (
                                    <ERROR_DELIVERY width={12} height={12} style={styles.overTime} />
                                )}
                            </View>
                        )}
                        {isHeader && !isVlNotStarted && (
                            <View style={commonStyle.alignCenter}>
                                <View style={styles.row}>
                                    <CText style={[styles.headerTitle, styles.marginTop10]}>
                                        {t.labels.PBNA_MOBILE_GATE_CHECK_OUT}
                                    </CText>
                                    <CText style={[styles.timeTitle, styles.marginTop10]}>
                                        {` ${gateCheckOutTime || noTimeValue}`}
                                    </CText>
                                </View>
                                <View style={styles.row}>
                                    <CText style={[styles.headerTitle, styles.marginTop10]}>
                                        {t.labels.PBNA_MOBILE_GATE_FENCE_OUT}
                                    </CText>
                                    <CText style={[styles.timeTitle, styles.marginTop10]}>
                                        {` ${manifestStartTime || noTimeValue}`}
                                    </CText>
                                </View>
                                <View style={styles.row}>
                                    <CText style={[styles.headerTitle, styles.marginTop10]}>
                                        {t.labels.PBNA_MOBILE_ACTUAL_ON_PROPERTY_TIME}
                                    </CText>
                                    <CText
                                        style={[
                                            styles.timeTitle,
                                            styles.marginTop10,
                                            (typeof section.optTimeBetweenVL !== 'number' ||
                                                (typeof section.optTimeBetweenVL === 'number' &&
                                                    section.optTimeBetweenVL > PROPERTY_END_TIME_MAX)) &&
                                                startPropertyStyle
                                        ]}
                                    >
                                        {' '}
                                        {`${section.optTimeBetweenVL ? section.optTimeBetweenVL : section.fenceOut} `}
                                        {section.optTimeBetweenVL === noTimeValue || section.fenceOut === noTimeValue
                                            ? ''
                                            : t.labels.PBNA_MOBILE_MIN}
                                    </CText>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            )
        }
    }

    const calculateManifest = (visits, origin = -1, count = 0) => {
        if (visits.length === 0) {
            return count
        }
        let arr = visits.filter((v) => v >= origin)
        if (!arr || arr.length === 0) {
            arr = [-Infinity]
        }
        const first = visits.splice(0, 1)
        count += Number(first <= Math.min(...arr) || first <= Math.min(...visits))
        return calculateManifest(visits, first, count)
    }

    const getManifestCompliance = () => {
        if (actualList.length === 0 || !actualList[0].title) {
            return
        }
        const manifestData = actualList.reduce(
            (a, b) => {
                const visits = b.data?.filter((v) => v.sequence)
                const completedVisits = visits
                    .filter((v) => v.status === VisitStatus.COMPLETE)
                    .map((v) => parseInt(v.sequence))
                a.total += visits.length
                a.compliant += calculateManifest(completedVisits)
                return a
            },
            {
                total: 0,
                compliant: 0
            }
        )
        const manifest = Math.round((manifestData.compliant / (manifestData.total || 1)) * 100)

        return (
            <>
                <CText style={styles.lineText}> | </CText>
                <CText style={[manifest < 90 && styles.redText, manifest >= 90 && styles.greenText]}>
                    {manifest}%{' '}
                </CText>
                <CText style={styles.valText}>{t.labels.PBNA_MOBILE_MANIFEST}</CText>
            </>
        )
    }

    const renderItem = (item) => {
        return (
            <DelScheduleVisitCard
                key={item.Id}
                item={item}
                hideUserInfo
                showIndicator
                showPhoneAndLoc
                isEmployeeSchedule
                onItemPress={() => {
                    navigation?.navigate('DeliveryVisitDetail', {
                        navigation,
                        item
                    })
                }}
            />
        )
    }

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

    const renderSectionList = () => {
        const dataList = actualList
        const list = dataList[0]?.data ? dataList : []
        return (
            <ScrollView
                style={styles.flexPadding}
                onScrollBeginDrag={(e) =>
                    handleScroll(
                        e,
                        isListExpended,
                        setIsListExpended,
                        toExpend,
                        toInitialPosition,
                        lastOffset,
                        setLastOffset
                    )
                }
                onMomentumScrollBegin={(e) =>
                    handleScroll(
                        e,
                        isListExpended,
                        setIsListExpended,
                        toExpend,
                        toInitialPosition,
                        lastOffset,
                        setLastOffset
                    )
                }
            >
                <SectionList
                    style={styles.sectionList}
                    sections={list}
                    extraData={list}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => renderItem(item)}
                    keyExtractor={(item, index) => item + index}
                    renderSectionHeader={({ section }) => {
                        return renderHeaderAndFooter(t.labels.PBNA_MOBILE_DAY_STARTED_AT, section, true)
                    }}
                    renderSectionFooter={({ section }) => {
                        return renderHeaderAndFooter(t.labels.PBNA_MOBILE_DAY_ENDED_AT, section, false)
                    }}
                    contentContainerStyle={styles.paddingBottom22}
                    stickySectionHeadersEnabled={false}
                    refreshControl={<RefreshControlM loading={dataLoading} refreshAction={refresh} />}
                />
            </ScrollView>
        )
    }

    const getTimeString = (timeStr, unitNum = 60000) => {
        const timeNum = Number(timeStr || 0)
        const durationStr = _.ceil(timeNum / unitNum)
        const hourStr = _.floor(durationStr / 60)
        const minStr = _.floor(durationStr % 60)
        return hourStr + ' ' + t.labels.PBNA_MOBILE_HR + ' ' + minStr + ' ' + t.labels.PBNA_MOBILE_MIN
    }

    const renderTopLine = () => {
        return (
            <View style={styles.topLineRow}>
                <View style={[styles.row]}>
                    <DelTopLineCell
                        cellStyle={styles.rowLeft}
                        title={t.labels.PBNA_MOBILE_DISPATCHED_CASES}
                        subTitle={getRound(resData?.dispatchedCases, '0')}
                        unit={` ${t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}`}
                    />
                    <DelTopLineCell
                        cellStyle={styles.rowCenter}
                        title={t.labels.PBNA_MOBILE_CASES_DELIVERED}
                        subTitle={getRound(resData?.casesDelivered, '0')}
                        unit={` ${t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}`}
                    />
                    <DelTopLineCell
                        cellStyle={styles.rowRight}
                        title={t.labels.PBNA_MOBILE_RETURNS}
                        subTitle={getRound(resData?.returnsCs, '0')}
                        unit={` ${t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}`}
                        subString={' ' + getRound(resData?.returnsUn, '0')}
                        unitTwo={` ${t.labels.PBNA_MOBILE_ORDER_UN.toLocaleLowerCase()}`}
                    />
                </View>
                <View style={[styles.row, styles.mt_30]}>
                    <DelTopLineCell
                        cellStyle={styles.rowLeft}
                        title={t.labels.PBNA_MOBILE_MANIFEST_HOURS}
                        subTitle={getTimeString(resData?.manifestHours)}
                    />
                    <DelTopLineCell
                        cellStyle={styles.rowCenter}
                        title={t.labels.PBNA_MOBILE_ACTUAL_HOURS}
                        subTitle={getTimeString(resData?.actualHours)}
                    />
                    <DelTopLineCell
                        cellStyle={styles.rowRight}
                        title={t.labels.PBNA_MOBILE_MANIFEST_MILES}
                        subTitle={convertMileData(
                            Number(resData?.manifestMiles || 0),
                            t.labels.PBNA_MOBILE_MI_UNIT,
                            t.labels.PBNA_MOBILE_KM_UNIT
                        )}
                    />
                </View>
            </View>
        )
    }

    const renderTopLineBar = () => {
        return (
            <View style={styles.topLineBarRow}>
                <View style={styles.row}>
                    <View style={commonStyle.flexRowAlignCenter}>
                        <CText style={styles.valText}>
                            {` ${stops[NUMBER_VALUE.ZERO_NUM] || 0}/${stops[NUMBER_VALUE.ONE_NUM] || 0} ${
                                t.labels.PBNA_MOBILE_STOPS
                            }`}
                        </CText>
                        {getManifestCompliance()}
                    </View>
                    <View style={styles.rowLeft} />
                    <View style={[commonStyle.flexRowAlignCenter]}>
                        <RowText des={`${t.labels.PBNA_MOBILE_LOCAL} `} val={employeeData.LocalRoute} />
                        <CText style={styles.lineText}> | </CText>
                        <RowText des={`${t.labels.PBNA_MOBILE_NATIONAL_ID} `} val={employeeData.NationalId} />
                    </View>
                </View>
            </View>
        )
    }

    const renderMapView = () => {
        const employeeListData = actualList[0]?.data ? actualList : []
        return (
            <MapScreen
                selectedDay={selDay}
                navigation={navigation}
                mapScreenStyle={commonStyle.flex_1}
                incomingVisits={getIncomingVisits(false, employeeListData)}
                employeeListData={employeeListData}
                isMM
                employItem={employeeData}
            />
        )
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

            {!isMapView && (
                <SwipeCollapsible
                    cRef={downSwipeCollapsibleRef}
                    height={calSCHeights(
                        [],
                        !isListExpended,
                        HEIGHT_TO_SCROLL,
                        HIDE_CARD_HEIGHT_DELES,
                        SHOW_CARD_HEIGHT_DELES
                    )}
                >
                    <View style={styles.topLineContainer}>
                        {renderTopLine()}
                        {renderTopLineBar()}
                    </View>
                </SwipeCollapsible>
            )}

            {!isMapView ? renderSectionList() : renderMapView()}

            <MapDraggable setIsMapView={setIsMapView} isMapView={isMapView} />

            {/* <Loading isLoading={isLoading} /> */}
        </View>
    )
}

export default DelEmployeeSchedule

/**
 * @description landing page component.
 * @author Beichen Li
 * @email beichen.a.li@pwc.com
 * @date 2021-07-21
 */

import React, { useEffect, useRef, useState } from 'react'
import { View, TouchableOpacity, ScrollView, NativeAppEventEmitter } from 'react-native'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import CText from '../../../../common/components/CText'
import SelectTab from '../../common/SelectTab'
import ImageClock from '../../../../../assets/image/icon_clock.svg'
import ImageDollar from '../../../../../assets/image/icon_dollar.svg'
import ImageArrow from '../../../../../assets/image/icon_arrow.svg'
import Sunburst from './Sunburst'
import { useDispatch, useSelector } from 'react-redux'
import { formatStringByComma, queryCustomerList, queryEmployeeList } from '../../../utils/MerchManagerUtils'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import ReassignResultModal from '../common/ReassignResultModal'
import Loading from '../../../../common/components/Loading'
import _ from 'lodash'
import { database } from '../../../common/SmartSql'
import { UserType } from '../../../redux/types/H01_Manager/data-userType'
import {
    recalculateOrPublishSchedule,
    handleUnassignData,
    goBackAndRefreshInRNS,
    roundHours,
    getIdClause,
    getUnassignedEEInfo
} from '../helper/MerchManagerHelper'
import ScheduleSummaryStyle from '../../../styles/manager/ScheduleSummaryStyle'
import ErrorMsgModal from '../common/ErrorMsgModal'
import {
    DataCheckMsgIndex,
    DropDownType,
    EventEmitterType,
    LineCodeGroupType,
    NavigationPopNum,
    NavigationRoute
} from '../../../enums/Manager'
import { checkSVGDataModifiedById } from '../service/DataCheckService'
import { t } from '../../../../common/i18n/t'
import { compose } from '@reduxjs/toolkit'
import managerAction from '../../../redux/action/H01_Manager/managerAction'
import store from '../../../redux/store/Store'
import { getMeetingAttendsList } from '../service/MeetingService'
import { Log } from '../../../../common/enums/Log'
import { formatScheduleDate, getUnassignedRouteUserBySVGID } from '../helper/VisitHelper'
import { getStringValue } from '../../../utils/LandingUtils'
import { addLogInRNS, RNSAppStatus } from './ReviewNewSchedule'
import { CommonParam } from '../../../../common/CommonParam'
import { storeClassLog } from '../../../../common/utils/LogUtils'

const styles = ScheduleSummaryStyle

interface SummaryProps {
    navigation?: any
    route?: any
}

const ONE_HOUR = 60
const DELAY_TIME = 5000
const managerReducer = (state) => state.manager

const getTargetAndScheduledGap = (target, scheduled) => {
    return target - scheduled
}

const onPublishScheduleBtnClick = async (
    unassignedVisits,
    publishSchedule,
    visitListId,
    setErrorMsgType,
    setIsErrorShow
) => {
    const modified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
    if (modified) {
        return
    }
    await addLogInRNS(visitListId, new Date(), RNSAppStatus.PUBLISH)
    CommonParam.inRNSScreen = false
    publishSchedule()
}

const ScheduleSummary = (props: SummaryProps) => {
    const { navigation } = props
    const [activeTab, setActiveTab] = useState(0)
    const [activeTimeTab, setActiveTimeTab] = useState(0)
    const sunburstRef = useRef(null)
    const manager = useSelector(managerReducer)
    const scheduleVisitListId = manager.visitListId
    const [isLoading, setIsLoading] = useState(false)
    const { dropDownRef } = useDropDown()
    const reassignResultModal = useRef(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [employeeData, setEmployeeData] = useState([])
    const [allStatisticsData, setAllStatisticsData] = useState({})
    const [unassignCustomerList, setUnassignCustomerList] = useState([])
    const [unassignedVisits, setUnassignedVisits] = useState([])
    const initialEEInfo = {
        totalNumber: 0,
        totalTime: 0,
        totalCost: 0
    }
    const [unassignedEEInfo, setUnassignedEEInfo] = useState(initialEEInfo)
    const initialStatistics = {
        plannedCost: 0,
        targetCost: 0,
        plannedTime: 0,
        targetTime: 0
    }
    const [statisticsData, setStatisticsData] = useState(initialStatistics)
    const [isErrorShow, setIsErrorShow] = useState(false)
    const [errorMsgType, setErrorMsgType] = useState(DataCheckMsgIndex.COMMON_MSG)
    const dispatch = useDispatch()
    const getLineCodeMap = compose(dispatch, managerAction.getLineCodeMap)
    const [unassignedRoutes, setUnassignedRoutes] = useState([])

    const statisticsIndex = {
        0: 'merch',
        1: 'sales',
        2: 'all'
    }

    const topTabList = [
        { name: t.labels.PBNA_MOBILE_MERCH_AND_RELIEF.toLocaleUpperCase() },
        { name: t.labels.PBNA_MOBILE_SALES.toLocaleUpperCase() },
        { name: t.labels.PBNA_MOBILE_ALL.toLocaleUpperCase() }
    ]

    const timeTabList = [
        { name: t.labels.PBNA_MOBILE_ALL.toLocaleUpperCase() },
        { name: '50+ ' + t.labels.PBNA_MOBILE_HRS },
        { name: `40+ ${t.labels.PBNA_MOBILE_TO} 50 ${t.labels.PBNA_MOBILE_HRS}` },
        { name: `>0 ${t.labels.PBNA_MOBILE_TO} 40 ${t.labels.PBNA_MOBILE_HRS}` }
    ]

    const changeTimeTab = (index) => {
        setActiveTimeTab(index)
    }

    const jumpToUnassignVisit = () => {
        navigation?.navigate(NavigationRoute.UNASSIGN_VISIT, {
            originData: unassignCustomerList,
            isFromScheduleSummary: true
        })
    }

    const jumpToUnassignEmployee = () => {
        navigation?.navigate(NavigationRoute.UNASSIGN_EMPLOYEE, {
            scheduleVisitListId: scheduleVisitListId,
            isFromScheduleSummary: true,
            activeTab: activeTab
        })
    }

    const onCancelClick = async () => {
        setIsLoading(true)
        const modified = await checkSVGDataModifiedById(scheduleVisitListId, setErrorMsgType, setIsErrorShow)
        if (modified) {
            setIsLoading(false)
            return
        }
        setIsLoading(false)
        navigation.goBack()
    }

    const userLineCodes = store.getState().manager.lineCodeMap.get(LineCodeGroupType.LandingPageGroup)

    const isSalesTabEE = (e) => {
        return e.sales_visit__c === true || getIdClause(userLineCodes[UserType.UserType_Sales]).includes(e.LC_ID__c)
    }

    const getEmployeeData = async (index) => {
        try {
            await getLineCodeMap()
            const employeeMeetingList = await getMeetingAttendsList({
                visitListId: scheduleVisitListId,
                scheduleDate: manager.scheduleDate
            })
            let lineCodesQuery = ''
            if (!_.isEmpty(userLineCodes)) {
                if (index === 0) {
                    lineCodesQuery = `AND ({User:LC_ID__c} IN (${getIdClause(
                        userLineCodes[UserType.UserType_Merch]
                    )}) OR {User:LC_ID__c} IS NULL)`
                }
            }

            let employeeDataList: any = await queryEmployeeList({
                visitListId: scheduleVisitListId,
                dropDownRef,
                lineCodesQuery: lineCodesQuery
            })
            const employeeMeetingListAll: any = Object.values(employeeMeetingList)
            let filteredEEMeetingListIdMaps = {}
            // filter unassigned route user
            employeeDataList = employeeDataList.filter((e) => e.unassignedRoute === false)
            if (index === 0) {
                employeeDataList = employeeDataList.filter((e) => e.sales_visit__c === false)
                employeeMeetingListAll.forEach((el) => {
                    if (userLineCodes[UserType.UserType_Merch].includes(el.lineCode)) {
                        filteredEEMeetingListIdMaps[el.id] = el
                    }
                })
            } else if (index === 1) {
                employeeDataList = employeeDataList.filter(isSalesTabEE)
                employeeMeetingListAll.forEach((el) => {
                    if (userLineCodes[UserType.UserType_Sales].includes(el.lineCode)) {
                        filteredEEMeetingListIdMaps[el.id] = el
                    }
                })
            } else {
                filteredEEMeetingListIdMaps = employeeMeetingList
            }
            let onlyHaveMeetingEEs = []
            employeeDataList.forEach((el) => {
                if (Object.keys(filteredEEMeetingListIdMaps).includes(el.id)) {
                    el.totalHours += filteredEEMeetingListIdMaps[el.id].totalHours
                    el.totalMinus += filteredEEMeetingListIdMaps[el.id].totalMinus
                    delete filteredEEMeetingListIdMaps[el.id]
                }
            })
            onlyHaveMeetingEEs = Object.values(filteredEEMeetingListIdMaps)
            setEmployeeData(
                _.isEmpty(onlyHaveMeetingEEs)
                    ? employeeDataList
                    : employeeDataList.concat(Object.values(onlyHaveMeetingEEs)).sort((a, b) => {
                          return a.totalHours - b.totalHours
                      })
            )
            sunburstRef?.current?.setSunburstDatas()
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'ScheduleSummary.getEmployeeData', getStringValue(e))
        }
    }

    const changeTab = async (index) => {
        setIsLoading(true)
        setActiveTab(index)
        setStatisticsData(allStatisticsData[statisticsIndex[index]])
        await getEmployeeData(index)
        await getUnassignedEEInfo(scheduleVisitListId, setUnassignedEEInfo, index)
        setIsLoading(false)
    }

    const getAllViewData = async () => {
        setIsLoading(true)
        const whereClauseArr = []
        const clauseForSmartSql = {
            leftTable: 'Visit_List__c',
            leftField: 'Id',
            rightField: `'${scheduleVisitListId}'`,
            operator: '=',
            type: 'AND'
        }
        whereClauseArr.push(clauseForSmartSql)
        database()
            .use('Visit_List__c')
            .select()
            .where(whereClauseArr)
            .getData()
            .then((res: any) => {
                if (res?.length > 0) {
                    const visitList = res[0]
                    const tempData = {
                        all: {
                            plannedCost:
                                Number(visitList.Planned_Cost__c) + Number(visitList.Cost_Of_Unassigned_Visits__c),
                            targetCost: visitList.Target_Cost__c,
                            plannedTime: Number(visitList.Total_Planned_Time__c) + Number(visitList.Unassigned_Time__c),
                            targetTime: visitList.Target_Time__c
                        },
                        merch: {
                            plannedCost: visitList.Merch_Relief_Planned_Cost__c,
                            targetCost: visitList.Merch_Relief_Target_Cost__c,
                            plannedTime: visitList.Merch_Relief_Total_Planned_Time__c,
                            targetTime: visitList.Merch_Relief_Target_Time__c
                        },
                        sales: {
                            plannedCost: visitList.Sales_Planned_Cost__c,
                            targetCost: visitList.Sales_Target_Cost__c,
                            plannedTime: visitList.Sales_Total_Planned_Time__c,
                            targetTime: visitList.Sales_Target_Time__c
                        }
                    }
                    setStatisticsData(tempData[statisticsIndex[activeTab]])
                    setAllStatisticsData(tempData)
                }
            })
            .catch((err) => {
                setIsLoading(false)
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_SCHEDULE_SUMMARY_QUERY_SVL,
                    err
                )
            })
    }

    const getUnassignedData = async () => {
        const customerList = await queryCustomerList({
            visitListId: scheduleVisitListId,
            dropDownRef
        })
        handleUnassignData(customerList, setUnassignCustomerList, setUnassignedVisits)
    }

    const recalculateScheduleWithoutNav = (currentTab) => {
        setIsLoading(true)
        recalculateOrPublishSchedule(
            true,
            null,
            scheduleVisitListId,
            dropDownRef,
            navigation,
            setModalVisible,
            false
        ).then((res) => {
            if (res) {
                const timeoutId = setTimeout(async () => {
                    await getUnassignedData()
                    await getEmployeeData(currentTab)
                    await getAllViewData()
                    await getUnassignedEEInfo(scheduleVisitListId, setUnassignedEEInfo, currentTab)
                    setIsLoading(false)
                    clearTimeout(timeoutId)
                }, DELAY_TIME)
            }
        })
    }

    const publishSchedule = () => {
        recalculateOrPublishSchedule(
            false,
            setIsLoading,
            scheduleVisitListId,
            dropDownRef,
            navigation,
            setModalVisible,
            true
        )
    }

    const getUnassignedRouteUser = async () => {
        const unassignedRouteUser = await getUnassignedRouteUserBySVGID(scheduleVisitListId)
        setUnassignedRoutes(unassignedRouteUser)
    }

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            await getAllViewData()
            await getEmployeeData(activeTab)
            await getUnassignedData()
            await getUnassignedEEInfo(scheduleVisitListId, setUnassignedEEInfo, activeTab)
            await getUnassignedRouteUser()
            setIsLoading(false)
            clearTimeout(timeoutId)
        })
    }, [])

    useEffect(() => {
        const summaryDataListener = NativeAppEventEmitter.addListener(
            EventEmitterType.REFRESH_SCHEDULE_SUMMARY,
            async (isFromUnassignEE) => {
                if (isFromUnassignEE) {
                    await getAllViewData()
                    await getEmployeeData(activeTab)
                    await getUnassignedData()
                    await getUnassignedEEInfo(scheduleVisitListId, setUnassignedEEInfo, activeTab)
                    await getUnassignedRouteUser()
                    setIsLoading(false)
                } else {
                    recalculateScheduleWithoutNav(activeTab)
                }
            }
        )
        return () => {
            summaryDataListener && summaryDataListener.remove()
        }
    }, [activeTab])

    const getCostArrowColor = () => {
        return (
            getTargetAndScheduledGap(Math.round(statisticsData.targetCost), Math.round(statisticsData.plannedCost)) < 0
        )
    }

    const getHourArrowColor = () => {
        return getTargetAndScheduledGap(statisticsData.targetTime * ONE_HOUR, statisticsData.plannedTime) < 0
    }

    const goBackAndRefresh = async () => {
        goBackAndRefreshInRNS(NavigationPopNum.POP_TWO, errorMsgType, setIsLoading, navigation)
    }

    return (
        <View style={styles.flex_1}>
            <ScrollView style={[styles.bgWrap, styles.flex_1]}>
                <View style={styles.topBox}>
                    <View style={styles.titleWrap}>
                        <CText style={styles.title}>{t.labels.PBNA_MOBILE_SCHEDULE_SUMMARY_LOWER}</CText>
                    </View>
                    <View style={styles.subTitleWrap}>
                        <CText style={styles.subTitle}>{formatScheduleDate(manager.scheduleDate)}</CText>
                    </View>
                    <View style={styles.topTabsContainer}>
                        <SelectTab listData={topTabList} changeTab={changeTab} activeTab={activeTab} />
                    </View>
                    <View style={styles.infoCardWrap}>
                        <View style={styles.infoCard}>
                            <View style={[styles.pd_horizontal10]}>
                                <View style={styles.infoTitle}>
                                    <View style={styles.infoIconMargin}>
                                        <ImageDollar />
                                    </View>
                                    <CText style={styles.infoTitleTxt}>{t.labels.PBNA_MOBILE_COST}</CText>
                                </View>
                                <View style={styles.infoSubTitle}>
                                    <CText style={styles.infoSubTitleTxt}>{t.labels.PBNA_MOBILE_SCHEDULED}</CText>
                                </View>
                                <View style={styles.infoSubText}>
                                    <CText style={styles.infoSubTextTxt}>
                                        ${formatStringByComma(Math.round(statisticsData.plannedCost))}
                                    </CText>
                                </View>
                                <View style={styles.infoSubTitle}>
                                    <CText style={styles.infoSubTitleTxt}>{t.labels.PBNA_MOBILE_TARGET}</CText>
                                </View>
                                <View style={styles.infoSubText}>
                                    <CText style={styles.infoSubTextTxt}>
                                        ${formatStringByComma(Math.round(statisticsData.targetCost))}
                                    </CText>
                                </View>
                                <View style={styles.bottomBox}>
                                    <CText style={[styles.bottomText, getCostArrowColor() && styles.negativeRed]}>
                                        $
                                        {formatStringByComma(
                                            Math.round(
                                                Math.abs(
                                                    getTargetAndScheduledGap(
                                                        statisticsData.targetCost,
                                                        statisticsData.plannedCost
                                                    )
                                                )
                                            )
                                        )}
                                    </CText>
                                    <View style={styles.arrowIcon}>
                                        <ImageArrow
                                            color={
                                                getCostArrowColor() ? baseStyle.color.red : baseStyle.color.loadingGreen
                                            }
                                            style={getCostArrowColor() && styles.arrowIcon}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.infoCard}>
                            <View style={styles.pd_horizontal10}>
                                <View style={styles.infoTitle}>
                                    <View style={styles.infoIconMargin}>
                                        <ImageClock style={styles.clockIcon} />
                                    </View>
                                    <CText style={styles.infoTitleTxt}>
                                        {t.labels.PBNA_MOBILE_HOURS.toUpperCase()}
                                    </CText>
                                </View>
                                <View style={styles.infoSubTitle}>
                                    <CText style={styles.infoSubTitleTxt}>{t.labels.PBNA_MOBILE_SCHEDULED}</CText>
                                </View>
                                <View style={styles.infoSubText}>
                                    <CText style={styles.infoSubTextTxt}>
                                        {formatStringByComma(roundHours(statisticsData.plannedTime))}
                                        {` ${t.labels.PBNA_MOBILE_HRS}`}
                                    </CText>
                                </View>
                                <View style={styles.infoSubTitle}>
                                    <CText style={styles.infoSubTitleTxt}>{t.labels.PBNA_MOBILE_TARGET}</CText>
                                </View>
                                <View style={styles.infoSubText}>
                                    <CText style={styles.infoSubTextTxt}>
                                        {formatStringByComma(Math.round(statisticsData.targetTime))}
                                        {` ${t.labels.PBNA_MOBILE_HRS}`}
                                    </CText>
                                </View>
                                <View style={styles.bottomBox}>
                                    <CText style={[styles.bottomText, getHourArrowColor() && styles.negativeRed]}>
                                        {formatStringByComma(
                                            roundHours(
                                                Math.abs(
                                                    getTargetAndScheduledGap(
                                                        statisticsData.targetTime * ONE_HOUR,
                                                        statisticsData.plannedTime
                                                    )
                                                )
                                            )
                                        )}
                                        {` ${t.labels.PBNA_MOBILE_HRS}`}
                                    </CText>
                                    <View style={styles.arrowIcon}>
                                        <ImageArrow
                                            color={
                                                getHourArrowColor() ? baseStyle.color.red : baseStyle.color.loadingGreen
                                            }
                                            style={getHourArrowColor() && styles.arrowIcon}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.infoCard}>
                            <View style={styles.pd_horizontal7}>
                                <View style={styles.infoTitleUnassign}>
                                    <CText style={[styles.infoTitleTxt, styles.infoTxtRed]}>
                                        {t.labels.PBNA_MOBILE_UNASSIGNED}
                                    </CText>
                                </View>

                                <TouchableOpacity
                                    onPress={() => {
                                        ;(!_.isEmpty(unassignCustomerList) || !_.isEmpty(unassignedRoutes)) &&
                                            jumpToUnassignVisit()
                                    }}
                                    style={styles.unassignedBox}
                                    disabled={_.isEmpty(unassignCustomerList) && _.isEmpty(unassignedRoutes)}
                                >
                                    <View style={styles.unassignedItem}>
                                        <View style={styles.itemBox}>
                                            <View style={styles.infoSubTitle}>
                                                <CText style={styles.infoSubTitleTxt}>
                                                    {t.labels.PBNA_MOBILE_VISITS}
                                                </CText>
                                            </View>
                                            <View style={styles.itemText}>
                                                <CText style={styles.infoSubTextTxt}>
                                                    {formatStringByComma(unassignedVisits.length)}
                                                </CText>
                                            </View>
                                        </View>
                                        <View style={styles.itemBox}>
                                            <View style={styles.infoSubTitle}>
                                                <CText style={styles.infoSubTitleTxt}>
                                                    {t.labels.PBNA_MOBILE_ROUTES}
                                                </CText>
                                            </View>
                                            <View style={styles.itemText}>
                                                <CText style={styles.infoSubTextTxt}>{unassignedRoutes.length}</CText>
                                            </View>
                                        </View>
                                    </View>
                                    <View
                                        style={[
                                            styles.btnView,
                                            _.isEmpty(unassignCustomerList) &&
                                                _.isEmpty(unassignedRoutes) &&
                                                styles.disabledBtnBg
                                        ]}
                                    >
                                        <CText
                                            style={[
                                                styles.btnViewText,
                                                _.isEmpty(unassignCustomerList) &&
                                                    _.isEmpty(unassignedRoutes) &&
                                                    styles.disabledBtnText
                                            ]}
                                        >
                                            {t.labels.PBNA_MOBILE_VIEW}
                                        </CText>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.unassignedBox}
                                    onPress={() => {
                                        jumpToUnassignEmployee()
                                    }}
                                >
                                    <View style={styles.itemBox}>
                                        <View style={[styles.infoSubTitle, styles.marginLeft5]}>
                                            <CText style={styles.infoSubTitleTxt}>
                                                {t.labels.PBNA_MOBILE_EMPLOYEES}
                                            </CText>
                                        </View>
                                        <View style={styles.unassignedItem}>
                                            <CText style={styles.infoSubTextTxt} numberOfLines={1} ellipsizeMode="tail">
                                                {unassignedEEInfo.totalNumber}
                                            </CText>
                                            <CText style={styles.lineText}>|</CText>
                                            <View style={styles.costContainer}>
                                                <CText
                                                    style={styles.infoSubTextTxt}
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                >
                                                    ${formatStringByComma(Math.round(unassignedEEInfo.totalCost))}
                                                </CText>
                                            </View>
                                        </View>
                                        <View style={styles.btnView}>
                                            <CText style={styles.btnViewText}>{t.labels.PBNA_MOBILE_VIEW}</CText>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.timeTabContainer}>
                    <SelectTab
                        style={styles.selectTap}
                        listData={timeTabList}
                        changeTab={changeTimeTab}
                        activeTab={activeTimeTab}
                    />
                    <Sunburst
                        navigation={navigation}
                        sourceData={employeeData}
                        cRef={sunburstRef}
                        activeTab={activeTimeTab}
                    />
                </View>
            </ScrollView>

            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    onPress={() => {
                        onCancelClick()
                    }}
                    style={styles.btnCancel}
                >
                    <CText style={styles.textCancel}>{t.labels.PBNA_MOBILE_BACK_TO_EDIT}</CText>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        onPublishScheduleBtnClick(
                            unassignedVisits,
                            publishSchedule,
                            scheduleVisitListId,
                            setErrorMsgType,
                            setIsErrorShow
                        )
                    }}
                    style={styles.btnAccept}
                >
                    <CText style={styles.textAccept}>{t.labels.PBNA_MOBILE_PUBLISH_SCHEDULE}</CText>
                </TouchableOpacity>
            </View>
            <Loading isLoading={isLoading} />
            <ErrorMsgModal
                index={errorMsgType}
                visible={isErrorShow}
                setModalVisible={setIsErrorShow}
                handleClick={goBackAndRefresh}
            />
            <ReassignResultModal
                cRef={reassignResultModal}
                navigation={navigation}
                isPublishedSuccessfully
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
            />
        </View>
    )
}

export default ScheduleSummary

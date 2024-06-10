/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-10-27 01:29:53
 * @LastEditTime: 2022-12-08 14:49:48
 * @LastEditors: Mary Qian
 */

import React, { useState } from 'react'

import { StyleSheet, View, FlexAlignType, FlatList } from 'react-native'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import CText from '../../../../common/components/CText'
import { restApexCommonCall } from '../../../api/SyncUtils'
import { CommonParam } from '../../../../common/CommonParam'
import SelectTab from '../../common/SelectTab'
import CopilotPattern from '../../../../../assets/image/Copilot-pattern-MM.svg'
import VisitCard from '../../merchandiser/VisitCard'
import CopilotNavHeader from './CopilotNavHeader'
import CopilotDatePicker from './CopilotDatePicker'
import { getClockTime } from '../schedule/EmployeeScheduleListHelper'
import { SoupService } from '../../../service/SoupService'
import ScheduleQuery from '../../../queries/ScheduleQuery'
import Loading from '../../../../common/components/Loading'
import { Log } from '../../../../common/enums/Log'
import { refreshManager } from '../../../utils/MerchManagerUtils'
import { CommonApi } from '../../../../common/api/CommonApi'
import { t } from '../../../../common/i18n/t'
import { existParamsEmpty } from '../../../api/ApiUtil'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'
import { exeAsyncFunc } from '../../../../common/utils/CommonUtils'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#004C97'
    },
    datePickerContainer: {
        marginTop: 25,
        marginBottom: 30
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 82,
        paddingHorizontal: 22
    },
    statusItem: {
        flexDirection: 'column',
        width: 100
    },
    statusKey: {
        fontSize: 12,
        color: baseStyle.color.borderGray,
        lineHeight: 16
    },
    statusCount: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
        lineHeight: 22
    },
    bgImage: {
        position: 'absolute'
    },
    darkBlueContainer: {
        height: 166,
        backgroundColor: baseStyle.color.tabShadowBlue
    },
    tabContainer: {
        marginTop: -22
    },
    visitListContainer: {
        flex: 1,
        marginTop: 22,
        marginBottom: 20
    }
})

enum WorkOrderTab {
    TOTAL = 'Total',
    OPEN = 'Open',
    COMPLETE = 'Complete'
}

export const getI18nWorkOrderTab = (tab: WorkOrderTab) => {
    let result = ''
    switch (tab.toUpperCase()) {
        case WorkOrderTab.COMPLETE.toUpperCase():
            result = t.labels.PBNA_MOBILE_COMPLETE
            break
        case WorkOrderTab.OPEN.toUpperCase():
            result = t.labels.PBNA_MOBILE_OPEN
            break
        case WorkOrderTab.TOTAL.toUpperCase():
            result = t.labels.PBNA_MOBILE_TOTAL
            break
        default:
    }
    return result
}

const TAB_NAME = {
    0: WorkOrderTab.TOTAL.toUpperCase(),
    1: WorkOrderTab.OPEN.toUpperCase(),
    2: WorkOrderTab.COMPLETE.toUpperCase()
}

const addIfNotNull = (para: any, array: any[]) => {
    if (para?.length > 0) {
        array.push(para)
    }
}

const getCityStateZip = (res: any) => {
    const { city, state, postalCode } = res

    const address = []
    addIfNotNull(city, address)
    addIfNotNull(state, address)
    addIfNotNull(postalCode, address)
    return address.join(' ')
}

const getVisit = async (visitIdArr: string) => {
    if (!visitIdArr || visitIdArr.length === 0) {
        return []
    }

    const result = await SoupService.retrieveDataFromSoup(
        'Visit',
        {},
        ScheduleQuery.getPublishVisitList.f,
        ScheduleQuery.getPublishVisitList.baseQuery + ` WHERE {Visit:Id} IN (${visitIdArr})`
    )

    const visitListInSoup = []
    result.forEach((item) => {
        const address = JSON.parse(item.ShippingAddress)
        item.cityStateZip = getCityStateZip(address)
        item.address = address.street || ''
        item.Subject = item.name
        item.SubType__c = item.SubType
        item.StartDateTime = item.PlanStartTime
        item.EndDateTime = item.PlanEndTime
        item.PlannedVisitStartTime = item.PlanStartTime
        item.Actual_Start_Time__c = item.ActualVisitStartTime
        item.Actual_End_Time__c = item.ActualVisitEndTime
        item.inLocation = item.InLocation === '1'
        if (item.SubType === 'Visit' && item.ActualVisitStartTime && !item.ActualVisitEndTime) {
            item.clockTime = getClockTime(item, result)
        }
        item.showNew = item.Manager_Ad_Hoc__c === '1'
        item.showNewHollow = item.AdHoc === '1'
        visitListInSoup.push(item)
    })

    return visitListInSoup
}

const CopilotWorkOrder = (props: any) => {
    const { navigation } = props
    const [totalNum, setTotalNum] = useState(0)
    const [openNum, setOpenNum] = useState(0)
    const [completeNum, setCompleteNum] = useState(0)
    const [activeTab, setActiveTab] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [dataList, setDataList] = useState({})
    const [currentList, setCurrentList] = useState([])

    const TAB_DATA = [
        { name: getI18nWorkOrderTab(WorkOrderTab.TOTAL).toUpperCase() },
        { name: getI18nWorkOrderTab(WorkOrderTab.OPEN).toUpperCase() },
        { name: getI18nWorkOrderTab(WorkOrderTab.COMPLETE).toUpperCase() }
    ]

    const initSummaryData = async (date) => {
        if (existParamsEmpty([CommonParam.userLocationId, date])) {
            return
        }
        const res = await restApexCommonCall(
            `${CommonApi.PBNA_MOBILE_API_GET_MANAGER_KPI}/${CommonParam.userLocationId}&${date}`,
            'GET'
        )
        const resObj = JSON.parse(res.data)
        const taskObj = resObj.TASKS
        setTotalNum(taskObj.objTotal)
        setOpenNum(taskObj.objOpen)
        setCompleteNum(taskObj.objCompleted)
    }

    const handleData = (resArray: any[], soupData: any[]) => {
        const result = []

        resArray.forEach((item) => {
            const visits = soupData.filter((a) => a.Id === item.visitId)
            if (visits.length > 0) {
                const visit = visits[0]
                visit.workOrders = 0
                result.push(visit)
            }
        })

        return result
    }

    const fetchVisitList = async (date) => {
        await exeAsyncFunc(async () => {
            const workOrderUrl = `${CommonApi.PBNA_MOBILE_API_GET_MANAGER_WO}/${CommonParam.userLocationId}&${date}`
            const result = await restApexCommonCall(workOrderUrl, 'GET')
            const res = JSON.parse(result.data)
            const visitIdArray = res.TOTAL.map((v) => `'${v.visitId}'`).join(',')
            const soupData = await getVisit(visitIdArray)

            const list = {
                TOTAL: handleData(res.TOTAL, soupData),
                OPEN: handleData(res.OPEN, soupData),
                COMPLETE: handleData(res.COMPLETE, soupData)
            }

            setDataList(list)
            setCurrentList(list[TAB_NAME[activeTab]])
        }, 'fetchVisitList')
    }

    const onTabChanged = (index: number) => {
        setActiveTab(index)
        setCurrentList(dataList[TAB_NAME[index]])
    }

    const refreshData = async (date) => {
        setIsLoading(true)

        try {
            await refreshManager()
            await initSummaryData(date)
            await fetchVisitList(date)
        } catch (err) {
            storeClassLog(Log.MOBILE_ERROR, 'CopilotWorkOrder.refreshData', getStringValue(err))
        }

        setIsLoading(false)
    }

    const dateChanged = (date) => {
        refreshData(date)
    }

    const renderWOStatusNumber = () => {
        const renderKeyAndValue = (title: WorkOrderTab, value: number, align: FlexAlignType) => {
            return (
                <View style={[styles.statusItem, { alignItems: align }]}>
                    <CText style={styles.statusKey}>{getI18nWorkOrderTab(title)}</CText>
                    <CText style={styles.statusCount}>{value}</CText>
                </View>
            )
        }

        return (
            <View style={styles.statusContainer}>
                {renderKeyAndValue(WorkOrderTab.TOTAL, totalNum, 'flex-start')}
                {renderKeyAndValue(WorkOrderTab.OPEN, openNum, 'center')}
                {renderKeyAndValue(WorkOrderTab.COMPLETE, completeNum, 'flex-end')}
            </View>
        )
    }

    const renderTab = () => {
        return (
            <View style={styles.tabContainer}>
                <SelectTab listData={TAB_DATA} activeTab={activeTab} changeTab={onTabChanged} />
            </View>
        )
    }

    const renderList = () => {
        const renderItem = ({ item }) => {
            return (
                <VisitCard
                    navigation={props.navigation}
                    item={item}
                    withoutCallIcon
                    hasUserInfo
                    isVisitList
                    hideFooter
                    isAddVisit={false}
                    fromEmployeeSchedule
                />
            )
        }

        return (
            <FlatList
                style={styles.visitListContainer}
                data={currentList}
                renderItem={renderItem}
                keyExtractor={(item) => item.Id}
            />
        )
    }

    return (
        <View style={styles.container}>
            <CopilotPattern style={styles.bgImage} />
            <CopilotNavHeader navigation={navigation} title={t.labels.PBNA_MOBILE_WORK_ORDERS.toUpperCase()} />
            <View style={styles.darkBlueContainer}>
                <CopilotDatePicker containerStyle={styles.datePickerContainer} onDateChanged={dateChanged} />
                {renderWOStatusNumber()}
            </View>
            {renderTab()}
            {renderList()}
            <Loading isLoading={isLoading} />
        </View>
    )
}

export default CopilotWorkOrder

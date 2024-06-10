/*
 * @Author: Yuan Yue
 * @Date: 2021-09-06 17:52:48
 * @LastEditTime: 2023-08-17 10:20:05
 * @Description: SummaryCard in Copilot Page
 * @FilePath: /Halo_Mobile/src/components/manager/Copilot/SummaryCard.tsx
 */

import React, { FC, useEffect, useImperativeHandle, useState } from 'react'
import { View, TouchableOpacity } from 'react-native'
import CText from '../../../../../common/components/CText'
import { restApexCommonCall } from '../../../../api/SyncUtils'
import { CommonParam } from '../../../../../common/CommonParam'
import CopilotDatePicker from '../CopilotDatePicker'
import { CommonApi } from '../../../../../common/api/CommonApi'
import { t } from '../../../../../common/i18n/t'
import _ from 'lodash'
import Loading from '../../../../../common/components/Loading'
import { Log } from '../../../../../common/enums/Log'
import { getStringValue } from '../../../../utils/LandingUtils'
import { renderMetricBox, summaryCardStyles } from '../SummaryCard'
import { storeClassLog } from '../../../../../common/utils/LogUtils'

const styles = summaryCardStyles

const EMPLOYEES_NAME = t.labels.PBNA_MOBILE_EMPLOYEES.toLocaleUpperCase()
const VISITS_NAME = t.labels.PBNA_MOBILE_VISITS.toLocaleUpperCase()
const WORK_ORDERS_NAME = t.labels.PBNA_MOBILE_DELIVERY_ORDERS.toLocaleUpperCase()
const VOLUME_NAME = t.labels.PBNA_MOBILE_VOLUME.toLocaleUpperCase()

interface IProps {
    cRef: any
    subTypeArray?: any
    selectedSubType?: any
    selectedTerritoryId?: any
}

const SDLSummaryCard: FC<IProps> = (props: IProps) => {
    const { cRef, selectedTerritoryId } = props
    const [summaryCardDate, setSummaryCardDate] = useState('')
    const [currentTab, setCurrentTab] = useState(EMPLOYEES_NAME)
    const [currentTitleArr, setCurrentTitleArr] = useState([])
    const [currentSumValueArr, setCurrentSumValueArr] = useState([])
    const [currentValueALlObj, setCurrentValueAllObj] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [isInitLoaded, setIsInitLoaded] = useState(false)

    const backEndMap = {
        EMPLOYEES: ['objNotStarted', 'objStarted', 'objEnded'],
        VISITS: ['objYetToStart', 'objInProgress', 'objCompleted'],
        ORDERS: ['objTotal', 'objOpen', 'objCompleted'],
        VOLUME: ['objActual', 'objPlanned']
    }
    const summaryTitleMap = {
        EMPLOYEES: [
            t.labels.PBNA_MOBILE_YET_TO_START,
            t.labels.PBNA_MOBILE_IN_PROGRESS,
            t.labels.PBNA_MOBILE_COMPLETED
        ],
        VISITS: [t.labels.PBNA_MOBILE_YET_TO_START, t.labels.PBNA_MOBILE_IN_PROGRESS, t.labels.PBNA_MOBILE_COMPLETED],
        ORDERS: [t.labels.PBNA_MOBILE_TOTAL, t.labels.PBNA_MOBILE_OPEN, t.labels.PBNA_MOBILE_COMPLETED],
        VOLUME: [t.labels.PBNA_MOBILE_COPILOT_ACTUAL, t.labels.PBNA_MOBILE_PLANNED]
    }

    const initSummaryData = (currentDay) => {
        if (_.isEmpty(CommonParam.userLocationId) || _.isEmpty(currentDay) || _.isEmpty(selectedTerritoryId)) {
            setCurrentSumValueArr([])
            setCurrentValueAllObj([])
            return
        }
        if (!isInitLoaded) {
            !CommonParam.isSwitchLocation && setIsLoading(true)
            setIsInitLoaded(true)
        }
        restApexCommonCall(`${CommonApi.PBNA_MOBILE_API_GET_SALES_KPI}`, 'POST', {
            strLocation: CommonParam.userLocationId,
            datDate: currentDay,
            lstTerritoryId: selectedTerritoryId
        })
            .then((res) => {
                const resObj = JSON.parse(res.data)
                // resObj[WORK_ORDERS_NAME] = resObj.TASKS
                setCurrentValueAllObj(resObj)
                const currentTabObj = resObj[currentTab]
                if (!_.isEmpty(currentTabObj)) {
                    setCurrentSumValueArr([
                        currentTabObj[backEndMap[currentTab][0]],
                        currentTabObj[backEndMap[currentTab][1]],
                        currentTabObj[backEndMap[currentTab][2]]
                    ])
                }
            })
            .catch((err) => {
                storeClassLog(Log.MOBILE_ERROR, 'SDLSummaryCard.initSummaryData', getStringValue(err))
            })
            .finally(() => {
                setTimeout(() => {
                    setIsLoading(false)
                }, 1000)
            })
    }

    useImperativeHandle(cRef, () => ({
        pullToRefreshData: () => {
            initSummaryData(summaryCardDate)
        }
    }))

    useEffect(() => {
        setCurrentTab(EMPLOYEES_NAME)
    }, [])

    useEffect(() => {
        initSummaryData(summaryCardDate)
    }, [selectedTerritoryId])

    const dateChanged = (date) => {
        setSummaryCardDate(date)
        initSummaryData(date)
    }

    useEffect(() => {
        setCurrentTitleArr(summaryTitleMap[currentTab])
        const currentSumObj = currentValueALlObj[currentTab]
        currentSumObj &&
            setCurrentSumValueArr([
                currentSumObj[backEndMap[currentTab][0]],
                currentSumObj[backEndMap[currentTab][1]],
                currentSumObj[backEndMap[currentTab][2]]
            ])
    }, [currentTab])

    return (
        <View style={styles.container}>
            <View style={styles.titleContain}>
                <CopilotDatePicker onDateChanged={dateChanged} isShowWholeMonth />
            </View>

            {renderMetricBox(currentTitleArr, currentSumValueArr, currentTab)}

            <View style={styles.tabContainer}>
                <View style={styles.tabInnerContainer}>
                    <TouchableOpacity
                        onPress={() => {
                            setCurrentTab(EMPLOYEES_NAME)
                        }}
                    >
                        <CText
                            style={[
                                styles.tabContainerText,
                                currentTab === EMPLOYEES_NAME ? styles.whiteColor : styles.blueColor
                            ]}
                        >
                            {t.labels.PBNA_MOBILE_EMPLOYEES.toLocaleUpperCase()}
                        </CText>
                    </TouchableOpacity>

                    <View style={styles.tabItemCenterView}>
                        <TouchableOpacity
                            onPress={() => {
                                setCurrentTab(VISITS_NAME)
                            }}
                        >
                            <CText
                                style={[
                                    styles.tabContainerText,
                                    currentTab === VISITS_NAME ? styles.whiteColor : styles.blueColor
                                ]}
                            >
                                {t.labels.PBNA_MOBILE_VISITS.toLocaleUpperCase()}
                            </CText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.tabLineView}>
                        <TouchableOpacity
                            onPress={() => {
                                setCurrentTab(WORK_ORDERS_NAME)
                            }}
                        >
                            <CText
                                style={[
                                    styles.tabContainerText,
                                    currentTab === WORK_ORDERS_NAME ? styles.whiteColor : styles.blueColor
                                ]}
                            >
                                {t.labels.PBNA_MOBILE_DELIVERY_ORDERS.toLocaleUpperCase()}
                            </CText>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            setCurrentTab(VOLUME_NAME)
                        }}
                    >
                        <CText
                            style={[
                                styles.tabContainerText,
                                currentTab === VOLUME_NAME ? styles.whiteColor : styles.blueColor
                            ]}
                        >
                            {t.labels.PBNA_MOBILE_VOLUME.toLocaleUpperCase()}
                        </CText>
                    </TouchableOpacity>
                </View>
            </View>
            <Loading isLoading={isLoading} />
        </View>
    )
}

export default SDLSummaryCard

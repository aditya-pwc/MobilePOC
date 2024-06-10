/*
 * @Author: Yuan Yue
 * @Date: 2021-09-06 17:52:48
 * @LastEditTime: 2023-11-23 14:48:26
 * @Description: DelSup SummaryCard in Copilot Page
 */

import React, { FC, useEffect, useImperativeHandle, useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import CText from '../../../../../common/components/CText'
import { restApexCommonCall } from '../../../../api/SyncUtils'
import { CommonParam } from '../../../../../common/CommonParam'
import CopilotDatePicker from '../CopilotDatePicker'
import { COLOR_TYPE } from '../../../../enums/MerchandiserEnums'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { CommonApi } from '../../../../../common/api/CommonApi'
import { t } from '../../../../../common/i18n/t'
import _ from 'lodash'
import { getTimeFromMinsInitialCap } from '../../../../common/DateTimeUtils'
import Loading from '../../../../../common/components/Loading'
import { Log } from '../../../../../common/enums/Log'
import { getStringValue } from '../../../../utils/LandingUtils'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { getPortraitModeScreenWidthAndHeight } from '../../../../../common/utils/CommonUtils'

const screenWidth = getPortraitModeScreenWidthAndHeight().width
const styles = StyleSheet.create({
    container: {
        height: 230,
        backgroundColor: baseStyle.color.tabShadowBlue
    },
    colorGrey: {
        color: COLOR_TYPE.GRAY
    },

    titleContain: {
        flexDirection: 'row',
        width: screenWidth,
        marginTop: 25,
        marginBottom: 30
    },
    dataContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 22,
        marginBottom: 30,
        height: 80,
        width: screenWidth - 44,
        borderRadius: 6,
        backgroundColor: baseStyle.color.white
    },
    dataIcon: {
        flex: 1,
        paddingLeft: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    lineView: {
        marginTop: 20,
        height: 40,
        borderLeftWidth: StyleSheet.hairlineWidth,
        backgroundColor: COLOR_TYPE.GRAY
    },
    dataIconView: {
        flex: 1,
        height: 80,
        justifyContent: 'center'
    },
    dataTitle: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656'
    },
    dataSubTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
        marginTop: 4
    },
    tabContainer: {
        width: screenWidth,
        paddingHorizontal: 62,
        overflow: 'hidden'
    },
    tabInnerContainer: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    tabItemWithLeftBorder: {
        marginLeft: 20,
        paddingLeft: 20,
        borderLeftWidth: 1,
        borderLeftColor: COLOR_TYPE.GRAY,
        justifyContent: 'center'
    },
    tabContainerText: {
        fontSize: 12,
        lineHeight: 16,
        color: baseStyle.color.tabBlue,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    whiteColor: { color: baseStyle.color.white },
    blueColor: {
        color: COLOR_TYPE.BLUE
    }
})

const tabName = {
    EMPLOYEES_NAME: 'EMPLOYEES',
    DElIVERIES_NAME: 'DELIVERIES',
    CASES_NAME: 'CASES',
    HOURS_NAME: 'HOURS'
}

const backEndMap = {
    EMPLOYEES: ['objNotStarted', 'objStarted', 'objEnded'],
    DELIVERIES: ['objPlanned', 'objActual', 'objRemaining'],
    CASES: ['objPlanned', 'objActual', 'objRemaining'],
    HOURS: ['objPlanned', 'objActual', 'objRemaining']
}
const summaryTitleMapGen = () => {
    return {
        EMPLOYEES: [
            t.labels.PBNA_MOBILE_YET_TO_START,
            t.labels.PBNA_MOBILE_IN_PROGRESS,
            t.labels.PBNA_MOBILE_COMPLETED
        ],
        DELIVERIES: [t.labels.PBNA_MOBILE_PLANNED, t.labels.PBNA_MOBILE_IP_DELIVERED, t.labels.PBNA_MOBILE_REMAINING],
        CASES: [t.labels.PBNA_MOBILE_PLANNED, t.labels.PBNA_MOBILE_COPILOT_ACTUAL, t.labels.PBNA_MOBILE_REMAINING],
        HOURS: [t.labels.PBNA_MOBILE_PLANNED, t.labels.PBNA_MOBILE_COPILOT_ACTUAL, t.labels.PBNA_MOBILE_REMAINING]
    }
}

const translateFrenchToEnglish = (currentTab) => {
    let englishTab = ''
    const tabMapList = [
        { EMPLOYEES: 'EMPLOYÉS' },
        { DELIVERIES: 'LIVRAISONS' },
        { CASES: 'CAISSES' },
        { HOURS: 'HEURES' }
    ]
    tabMapList.forEach((tab) => {
        if (Object.values(tab)[0] === currentTab) {
            englishTab = Object.keys(tab)[0]
        }
    })
    if (!englishTab) {
        englishTab = currentTab
    }
    return englishTab
}

const DelSupSummaryCard: FC<any> = ({ cRef }) => {
    const summaryTitleMap = summaryTitleMapGen()
    const tab = [
        { tabName: t.labels.PBNA_MOBILE_EMPLOYEES.toLocaleUpperCase() },
        { tabName: t.labels.PBNA_MOBILE_DELIVERIES.toLocaleUpperCase() },
        { tabName: t.labels.PBNA_MOBILE_CASES.toLocaleUpperCase() },
        { tabName: t.labels.PBNA_MOBILE_HOURS.toLocaleUpperCase() }
    ]
    const [summaryCardDate, setSummaryCardDate] = useState('')
    const [currentTitleArr, setCurrentTitleArr] = useState([])
    const [currentSumValueArr, setCurrentSumValueArr] = useState({})
    const [currentValueALlObj, setCurrentValueAllObj] = useState({})
    const [currentTab, setCurrentTab] = useState(t.labels.PBNA_MOBILE_EMPLOYEES.toLocaleUpperCase())
    const [isRefresh, setIsRefresh] = useState(false)
    const [isInitLoaded, setIsInitLoaded] = useState(false)

    const initSummaryData = (currentDay) => {
        if (!isInitLoaded) {
            !CommonParam.isSwitchLocation && setIsRefresh(true)
            setIsInitLoaded(true)
        }
        const translateCurrentTab = translateFrenchToEnglish(currentTab)
        restApexCommonCall(
            `${CommonApi.PBNA_MOBILE_API_GET_DEL_SUP_KPI}/${CommonParam.userLocationId}&${currentDay}`,
            'GET'
        )
            .then((res) => {
                const resObj = JSON.parse(res.data)
                setCurrentValueAllObj(resObj)
                const currentTabObj = resObj[translateCurrentTab]
                if (!_.isEmpty(currentTabObj)) {
                    if (translateCurrentTab === tabName.HOURS_NAME) {
                        setCurrentSumValueArr([
                            getTimeFromMinsInitialCap(currentTabObj[backEndMap[translateCurrentTab][0]] / 1000 / 60),
                            getTimeFromMinsInitialCap(currentTabObj[backEndMap[translateCurrentTab][1]] / 1000 / 60),
                            getTimeFromMinsInitialCap(currentTabObj[backEndMap[translateCurrentTab][2]] / 1000 / 60)
                        ])
                    } else {
                        setCurrentSumValueArr([
                            currentTabObj[backEndMap[translateCurrentTab][0]],
                            currentTabObj[backEndMap[translateCurrentTab][1]],
                            currentTabObj[backEndMap[translateCurrentTab][2]]
                        ])
                    }
                }
                setIsRefresh(false)
            })
            .catch((err) => {
                setIsRefresh(false)
                storeClassLog(Log.MOBILE_ERROR, 'DelSupSummaryCard.initSummaryData', getStringValue(err))
            })
    }

    useImperativeHandle(cRef, () => ({
        pullToRefreshData: () => {
            initSummaryData(summaryCardDate)
        }
    }))

    const dateChanged = (date) => {
        setSummaryCardDate(date)
        initSummaryData(date)
    }

    useEffect(() => {
        const translateCurrentTab = translateFrenchToEnglish(currentTab)
        setCurrentTitleArr(summaryTitleMap[translateCurrentTab])
        const currentSumObj = currentValueALlObj[translateCurrentTab]
        if (!_.isEmpty(currentSumObj)) {
            if (translateCurrentTab === tabName.HOURS_NAME) {
                setCurrentSumValueArr([
                    getTimeFromMinsInitialCap(currentSumObj[backEndMap[translateCurrentTab][0]] / 1000 / 60),
                    getTimeFromMinsInitialCap(currentSumObj[backEndMap[translateCurrentTab][1]] / 1000 / 60),
                    getTimeFromMinsInitialCap(currentSumObj[backEndMap[translateCurrentTab][2]] / 1000 / 60)
                ])
            } else {
                setCurrentSumValueArr([
                    currentSumObj[backEndMap[translateCurrentTab][0]],
                    currentSumObj[backEndMap[translateCurrentTab][1]],
                    currentSumObj[backEndMap[translateCurrentTab][2]]
                ])
            }
        }
    }, [currentTab])

    return (
        <View style={styles.container}>
            <View style={styles.titleContain}>
                <CopilotDatePicker onDateChanged={dateChanged} isShowWholeMonth />
            </View>

            <View style={styles.dataContainer}>
                <View style={[styles.dataIcon, !currentTitleArr[2] && { paddingLeft: 29 }]}>
                    <View style={styles.dataIconView}>
                        <CText style={styles.dataTitle}>{currentTitleArr[0]}</CText>
                        <CText style={styles.dataSubTitle}>{currentSumValueArr[0]}</CText>
                    </View>
                </View>
                <View style={styles.lineView} />
                <View style={[styles.dataIcon, !currentTitleArr[2] && { paddingLeft: 29 }]}>
                    <View style={styles.dataIconView}>
                        <CText style={styles.dataTitle}>{currentTitleArr[1]}</CText>
                        <CText style={styles.dataSubTitle}>{currentSumValueArr[1]}</CText>
                    </View>
                </View>
                <View style={styles.lineView} />
                {currentTitleArr[2] && (
                    <View style={[styles.dataIcon, !currentTitleArr[2] && { paddingLeft: 29 }]}>
                        <View style={styles.dataIconView}>
                            <CText style={styles.dataTitle}>{currentTitleArr[2]}</CText>
                            <CText style={styles.dataSubTitle}>{currentSumValueArr[2]}</CText>
                        </View>
                    </View>
                )}
            </View>
            <View style={styles.tabContainer}>
                <View style={styles.tabInnerContainer}>
                    {tab.map((item, index) => {
                        return (
                            <View style={index === 0 ? {} : styles.tabItemWithLeftBorder} key={item.tabName}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setCurrentTab(item.tabName)
                                    }}
                                >
                                    <CText
                                        style={[
                                            styles.tabContainerText,
                                            currentTab === item.tabName ? styles.whiteColor : styles.blueColor
                                        ]}
                                    >
                                        {item.tabName}
                                    </CText>
                                </TouchableOpacity>
                            </View>
                        )
                    })}
                </View>
            </View>
            <Loading isLoading={isRefresh} />
        </View>
    )
}

export default DelSupSummaryCard

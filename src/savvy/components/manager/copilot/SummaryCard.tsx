/*
 * @Author: Yuan Yue
 * @Date: 2021-09-06 17:52:48
 * @LastEditTime: 2023-08-15 11:14:06
 * @Description: SummaryCard in Copilot Page
 * @FilePath: /Halo_Mobile/src/components/manager/Copilot/SummaryCard.tsx
 */

import React, { FC, useEffect, useImperativeHandle, useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import CText from '../../../../common/components/CText'
import { restApexCommonCall } from '../../../api/SyncUtils'
import { CommonParam } from '../../../../common/CommonParam'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import CopilotDatePicker from './CopilotDatePicker'
import { COLOR_TYPE } from '../../../enums/MerchandiserEnums'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { CommonApi } from '../../../../common/api/CommonApi'
import { t } from '../../../../common/i18n/t'
import _ from 'lodash'
import { Log } from '../../../../common/enums/Log'
import { CustomError } from '../../../enums/CustomError'
import { existParamsEmpty } from '../../../api/ApiUtil'
import { getStringValue } from '../../../utils/LandingUtils'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getPortraitModeScreenWidthAndHeight } from '../../../../common/utils/CommonUtils'

const screenWidth = getPortraitModeScreenWidthAndHeight().width
export const summaryCardStyles = StyleSheet.create({
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
        marginHorizontal: 22,
        marginBottom: 30,
        height: 80,
        width: screenWidth - 44,
        borderRadius: 6,
        backgroundColor: baseStyle.color.white,
        justifyContent: 'space-around'
    },
    dataIcon: {
        width: (screenWidth - 44) / 3,
        paddingLeft: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    lineView: {
        marginTop: 20,
        height: 40,
        borderRightWidth: StyleSheet.hairlineWidth,
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
    tabItemCenterView: {
        marginHorizontal: 20,
        paddingHorizontal: 20,
        borderRightWidth: 1,
        borderLeftWidth: 1,
        borderLeftColor: COLOR_TYPE.GRAY,
        justifyContent: 'center',
        borderRightColor: COLOR_TYPE.GRAY
    },
    tabLineView: {
        marginRight: 20,
        paddingRight: 20,
        borderRightWidth: 1,
        borderRightColor: COLOR_TYPE.GRAY,
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
    },
    paddingLeft0: {
        paddingLeft: 0,
        marginLeft: -10
    }
})

interface IProps {
    cRef: any
}

const VOLUME = 'VOLUME'

export const renderMetricBox = (currentTitleArr: any[], currentSumValueArr: any[], currentTab: string) => {
    let defaultValue = '0'
    return (
        <View style={summaryCardStyles.dataContainer}>
            {currentTitleArr.map((title, index) => {
                if (title === t.labels.PBNA_MOBILE_PLANNED && currentTab === VOLUME) {
                    defaultValue = t.labels.PBNA_MOBILE_COMING_SOON
                }
                return (
                    <React.Fragment key={title}>
                        <View
                            style={[
                                summaryCardStyles.dataIcon,
                                currentTitleArr.length === 2 && summaryCardStyles.paddingLeft0
                            ]}
                        >
                            <View style={summaryCardStyles.dataIconView}>
                                <CText style={summaryCardStyles.dataTitle}>{title}</CText>
                                <CText style={summaryCardStyles.dataSubTitle}>
                                    {currentSumValueArr[index] || defaultValue}
                                </CText>
                            </View>
                        </View>
                        {index < currentTitleArr?.length - 1 && <View style={summaryCardStyles.lineView} />}
                    </React.Fragment>
                )
            })}
        </View>
    )
}

const SummaryCard: FC<IProps> = (props: IProps) => {
    const EMPLOYEES_NAME = t.labels.PBNA_MOBILE_EMPLOYEES.toLocaleUpperCase()
    const VISITS_NAME = t.labels.PBNA_MOBILE_VISITS.toLocaleUpperCase()
    const WORK_ORDERS_NAME = t.labels.PBNA_MOBILE_WORK_ORDERS.toLocaleUpperCase()
    const { cRef } = props
    const { dropDownRef } = useDropDown()
    const [summaryCardDate, setSummaryCardDate] = useState('')
    const [currentTab, setCurrentTab] = useState(EMPLOYEES_NAME)
    const [currentTitleArr, setCurrentTitleArr] = useState([])
    const [currentSumValueArr, setCurrentSumValueArr] = useState([])
    const [currentValueALlObj, setCurrentValueAllObj] = useState({})
    const backEndMap = {
        [EMPLOYEES_NAME]: ['objStarted', 'objNotStarted', 'objEnded'],
        [VISITS_NAME]: ['objYetToStart', 'objInProgress', 'objCompleted'],
        [WORK_ORDERS_NAME]: ['objTotal', 'objOpen', 'objCompleted']
    }
    const summaryTitleMap = {
        [EMPLOYEES_NAME]: [
            t.labels.PBNA_MOBILE_COPILOT_STARTED,
            t.labels.PBNA_MOBILE_NOT_STARTED,
            t.labels.PBNA_MOBILE_COPILOT_ENDED
        ],
        [VISITS_NAME]: [
            t.labels.PBNA_MOBILE_YET_TO_START,
            t.labels.PBNA_MOBILE_IN_PROGRESS,
            t.labels.PBNA_MOBILE_COMPLETED
        ],
        [WORK_ORDERS_NAME]: [t.labels.PBNA_MOBILE_TOTAL, t.labels.PBNA_MOBILE_OPEN, t.labels.PBNA_MOBILE_COMPLETED]
    }

    const initSummaryData = (currentDay) => {
        if (existParamsEmpty([CommonParam.userLocationId, currentDay])) {
            return
        }
        restApexCommonCall(
            `${CommonApi.PBNA_MOBILE_API_GET_MANAGER_KPI}/${CommonParam.userLocationId}&${currentDay}`,
            'GET'
        )
            .then((res) => {
                const resObj = JSON.parse(res.data)
                resObj[WORK_ORDERS_NAME] = resObj.TASKS
                resObj[VISITS_NAME] = resObj.VISITS
                resObj[EMPLOYEES_NAME] = resObj.EMPLOYEES
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
                dropDownRef.current.alertWithType('error', CustomError.NETWORK_ERROR, '')
                storeClassLog(Log.MOBILE_ERROR, 'SummaryCard.initSummaryData', getStringValue(err))
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
        <View style={summaryCardStyles.container}>
            <View style={summaryCardStyles.titleContain}>
                <CopilotDatePicker onDateChanged={dateChanged} />
            </View>

            {renderMetricBox(currentTitleArr, currentSumValueArr, currentTab)}

            <View style={summaryCardStyles.tabContainer}>
                <View style={summaryCardStyles.tabInnerContainer}>
                    <TouchableOpacity
                        onPress={() => {
                            setCurrentTab(EMPLOYEES_NAME)
                        }}
                    >
                        <CText
                            style={[
                                summaryCardStyles.tabContainerText,
                                currentTab === EMPLOYEES_NAME
                                    ? summaryCardStyles.whiteColor
                                    : summaryCardStyles.blueColor
                            ]}
                        >
                            {t.labels.PBNA_MOBILE_EMPLOYEES.toLocaleUpperCase()}
                        </CText>
                    </TouchableOpacity>

                    <View style={summaryCardStyles.tabItemCenterView}>
                        <TouchableOpacity
                            onPress={() => {
                                setCurrentTab(VISITS_NAME)
                            }}
                        >
                            <CText
                                style={[
                                    summaryCardStyles.tabContainerText,
                                    currentTab === VISITS_NAME
                                        ? summaryCardStyles.whiteColor
                                        : summaryCardStyles.blueColor
                                ]}
                            >
                                {t.labels.PBNA_MOBILE_VISITS.toLocaleUpperCase()}
                            </CText>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            setCurrentTab(WORK_ORDERS_NAME)
                        }}
                    >
                        <CText
                            style={[
                                summaryCardStyles.tabContainerText,
                                currentTab === WORK_ORDERS_NAME
                                    ? summaryCardStyles.whiteColor
                                    : summaryCardStyles.blueColor
                            ]}
                        >
                            {t.labels.PBNA_MOBILE_WORK_ORDERS.toLocaleUpperCase()}
                        </CText>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default SummaryCard

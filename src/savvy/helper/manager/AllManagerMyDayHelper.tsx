/*
 * @Author: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Date: 2023-03-28 11:45:08
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @LastEditTime: 2023-08-22 14:33:18
 * @Description: my day and rns scroll function
 */
import moment from 'moment'
import { CommonApi } from '../../../common/api/CommonApi'
import { restApexCommonCall } from '../../api/SyncUtils'
import { CommonParam } from '../../../common/CommonParam'
import { CommonLabel } from '../../enums/CommonLabel'
import { t } from '../../../common/i18n/t'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { MOMENT_UNIT } from '../../../common/enums/MomentUnit'
import { Log } from '../../../common/enums/Log'
import { storeClassLog } from '../../../common/utils/LogUtils'
import BaseInstance from '../../../common/BaseInstance'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import React, { Dispatch, SetStateAction } from 'react'
import { ASASMetrics } from '../../components/manager/copilot/SDL/SDLCopilotPerformance'
import { ASASEmployee } from '../../components/manager/copilot/SDL/ASASEmployeeCard'
import { OffScheduleCustomerItem, OffScheduleMetrics } from '../../components/manager/copilot/SDL/SDLOffSchedulePage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { queryTerritory } from '../../components/sales/my-day/MydayHelper'
import _ from 'lodash'
import { AMASEmployee } from '../../components/manager/copilot/AMASPage'
import SORT_GREY from '../../../../assets/image/icon-sort-grey.svg'
import { View } from 'react-native'
import CText from '../../../common/components/CText'
import NewScheduleListStyle from '../../styles/manager/NewScheduleListStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { VisitStatus } from '../../enums/Visit'

const START_TIME_MODAL = 0
const END_TIME_MODAL = 1

export const handleScroll = (
    event,
    isListExpended,
    setIsListExpended,
    toExpend,
    toInitialPosition,
    lastOffset,
    setLastOffset
) => {
    const scrollOffsetY = event.nativeEvent.contentOffset.y
    setLastOffset(scrollOffsetY)
    const scrollDown = scrollOffsetY > lastOffset
    if (scrollDown && !isListExpended) {
        setIsListExpended(true)
        toExpend()
    } else if (!scrollDown && isListExpended) {
        if (((scrollOffsetY <= 60 || lastOffset <= 0) && CommonParam.inRNSScreen) || !CommonParam.inRNSScreen) {
            setIsListExpended(false)
            toInitialPosition()
        }
    }
}

export const handleSwipeCollapsibleRef = (topSwipeCollapsibleRef, downSwipeCollapsibleRef, navigation, cRef?) => {
    return {
        toExpend: () => {
            topSwipeCollapsibleRef.current?.toExpend()
            downSwipeCollapsibleRef.current?.toExpend()
            navigation.setOptions({ tabBarVisible: false })
            cRef?.current?.toExpend()
        },
        toInitialPosition: () => {
            topSwipeCollapsibleRef.current?.toInitialPosition()
            downSwipeCollapsibleRef.current?.toInitialPosition()
            navigation.setOptions({ tabBarVisible: true })
            cRef?.current?.toInitialPosition()
        }
    }
}

export const meetingClickFunction = (params: any) => {
    const {
        setStartTime,
        setStartModalVisible,
        setEndTime,
        setEndModalVisible,
        defaultStartTime,
        defaultEndTime,
        startTime
    } = params
    const onOutsideClick = (val: any) => {
        if (val === START_TIME_MODAL) {
            setStartTime(defaultStartTime)
            setStartModalVisible(false)
            setEndTime(
                moment(defaultStartTime, TIME_FORMAT.HMMA)
                    .add(CommonLabel.THIRTY_MINUTE, MOMENT_UNIT.MINUTES)
                    .format(TIME_FORMAT.HMMA)
            )
        } else if (val === END_TIME_MODAL) {
            setEndTime(defaultEndTime)
            setEndModalVisible(false)
        }
    }
    const onDoneClick = (val: any) => {
        if (val === START_TIME_MODAL) {
            if (startTime === CommonLabel.ELEVEN_THIRTY) {
                setEndTime(
                    moment(startTime, TIME_FORMAT.HMMA)
                        .add(CommonLabel.FIFTEEN_MINUTE, MOMENT_UNIT.MINUTES)
                        .format(TIME_FORMAT.HMMA)
                )
            } else {
                setEndTime(
                    moment(startTime, TIME_FORMAT.HMMA)
                        .add(CommonLabel.THIRTY_MINUTE, MOMENT_UNIT.MINUTES)
                        .format(TIME_FORMAT.HMMA)
                )
            }
            setStartModalVisible(false)
        } else if (val === END_TIME_MODAL) {
            setEndModalVisible(false)
        }
    }
    return {
        onOutsideClick,
        onDoneClick
    }
}

export const useHandleVisitSubtype = (params: any) => {
    const {
        setTypeModalVisible,
        typeModalVisible,
        subTypeArray,
        setSelectedSubType,
        selectedSubType,
        setSubTypeArray
    } = params
    let visitSubType: any = []
    const updateVisitSubType = () => {
        setTypeModalVisible(!typeModalVisible)
        visitSubType = JSON.parse(JSON.stringify(subTypeArray))
        setSelectedSubType(visitSubType)
    }

    const onCancelSubType = () => {
        setTypeModalVisible(!typeModalVisible)
        visitSubType = JSON.parse(JSON.stringify(selectedSubType))
        setSubTypeArray(visitSubType)
    }

    return {
        updateVisitSubType,
        onCancelSubType
    }
}

export const getMangerCopilotPerformance = (firstDay: any, secondDay: any, setResData: any, dropDownRef?: any) => {
    restApexCommonCall(
        `${CommonApi.PBNA_MOBILE_API_PERFORMANCE}/${CommonParam.userLocationId}&${firstDay}&${secondDay}`,
        'GET'
    )
        .then((res) => {
            const resultData = JSON.parse(res.data.replace(/null/g, 0) || {})
            setResData(resultData)
        })
        .catch((err) => {
            dropDownRef?.current?.alertWithType('error', t.labels.PBNA_MOBILE_GET_TEAM_PERFORMANCE_DETAILS, err)
        })
}

export const getSDLCopilotASASMetrics = (
    startDay: string,
    endDay: string,
    setResData: Dispatch<SetStateAction<ASASMetrics>>,
    selectedTerritoryId: any
) => {
    BaseInstance.sfHttpClient
        .callApex(`${CommonApi.PBNA_MOBILE_API_SDL_ASAS_METRICS}`, 'POST', {
            strLocation: CommonParam.userLocationId,
            datStartDate: startDay,
            datEndDate: endDay,
            lstTerritoryId: selectedTerritoryId
        })
        .then((res) => {
            const resultData = JSON.parse(res?.data)
            setResData(resultData)
        })
        .catch((err) => {
            storeClassLog(Log.MOBILE_ERROR, getSDLCopilotASASMetrics.name, ErrorUtils.error2String(err))
        })
}

export const getSDLOffScheduleData = (
    startDay: string,
    endDay: string,
    setResData: Dispatch<SetStateAction<OffScheduleMetrics>>,
    selectedTerritory: any
) => {
    BaseInstance.sfHttpClient
        .callApex(`${CommonApi.PBNA_MOBILE_API_SDL_OFF_CLICK_IN}`, 'POST', {
            strLocation: CommonParam.userLocationId,
            datStartDate: startDay,
            datEndDate: endDay,
            lstTerritoryId: selectedTerritory
        })
        .then((res) => {
            const resultData = JSON.parse(res?.data)
            setResData(resultData || {})
        })
        .catch((err) => {
            storeClassLog(Log.MOBILE_ERROR, getSDLOffScheduleData.name, ErrorUtils.error2String(err))
        })
}

export const defineProgressBarForm = (
    showRightView: any,
    ProgressBarWidth: any,
    blackLineScaleVal: any,
    progress: any
) => {
    let greenBarWidth = 0
    let greenBarBorderRadius: number | null = null
    let leftPosition: number | null = null
    let overflowBarWidth = 0
    const ZERO = 0
    const fullWidth = 1
    const lessThanOneRadius = 5.5
    const FIVE = 5
    const TWO = 2

    if (showRightView) {
        const totalWidth = ProgressBarWidth * blackLineScaleVal
        overflowBarWidth = (ProgressBarWidth - ProgressBarWidth * blackLineScaleVal) / TWO
        if (progress > fullWidth) {
            greenBarWidth = totalWidth + fullWidth
            leftPosition = totalWidth + overflowBarWidth - FIVE
            greenBarBorderRadius = ZERO
        } else if (progress === fullWidth) {
            greenBarWidth = totalWidth + fullWidth
            leftPosition = progress * totalWidth
            greenBarBorderRadius = ZERO
        } else if (progress === ZERO) {
            greenBarWidth = progress * totalWidth
            leftPosition = TWO
        } else {
            greenBarWidth = progress * totalWidth
            leftPosition = progress * totalWidth - FIVE
            greenBarBorderRadius = lessThanOneRadius
        }
    } else {
        if (progress === ZERO) {
            greenBarWidth = ZERO
            leftPosition = TWO
        } else {
            greenBarBorderRadius = lessThanOneRadius
            greenBarWidth = progress * ProgressBarWidth
            leftPosition = greenBarWidth - FIVE
            leftPosition = leftPosition > ProgressBarWidth ? ProgressBarWidth - FIVE : leftPosition
        }
    }

    return {
        greenBarWidth,
        leftPosition,
        greenBarBorderRadius,
        overflowBarWidth
    }
}

export const getSDLCopilotASASEmployees = async (
    startDay: string,
    endDay: string,
    selectedTerritory: any,
    strType: string
) => {
    return BaseInstance.sfHttpClient
        .callApex(`${CommonApi.PBNA_MOBILE_API_SDL_ASAS_CLICK_IN}`, 'POST', {
            strLocation: CommonParam.userLocationId,
            datStartDate: startDay,
            datEndDate: endDay,
            lstTerritoryId: selectedTerritory,
            strType
        })
        .then((res) => {
            const resultData = JSON.parse(res?.data) as Array<ASASEmployee>
            resultData.forEach((item) => {
                item.gpid = item.userGPID
            })
            return resultData
        })
        .catch((err) => {
            storeClassLog(Log.MOBILE_ERROR, getSDLCopilotASASEmployees.name, ErrorUtils.error2String(err))
            // to fix ts error
            return []
        })
}

export const getSDLCopilotOffScheduleCustomers = async (startDay: string, endDay: string, userId: string) => {
    return BaseInstance.sfHttpClient
        .callApex(
            `${CommonApi.PBNA_MOBILE_API_SDL_USER_CLICK_IN}/${CommonParam.userLocationId}&${startDay}&${endDay}&${userId}`,
            'GET'
        )
        .then((res) => {
            const resultData = JSON.parse(res?.data) as Array<OffScheduleCustomerItem>
            return resultData
        })
        .catch((err) => {
            storeClassLog(Log.MOBILE_ERROR, getSDLCopilotOffScheduleCustomers.name, ErrorUtils.error2String(err))
            // to fix ts error
            return []
        })
}

export const getSalesTerritory = async (setSubTypeArray: any, setSelectedSubType: any) => {
    const selectedTerritory = await AsyncStorage.getItem('SDLCopilotTerritoryList')
    const territory = await queryTerritory()
    if (!selectedTerritory) {
        territory.forEach((element) => {
            element.select = true
        })
    } else {
        territory.forEach((element) => {
            JSON.parse(selectedTerritory).forEach((territory: any) => {
                if (territory.name === element.name) {
                    element.select = territory.select
                }
            })
        })
    }
    setSubTypeArray(_.cloneDeep(territory))
    setSelectedSubType(_.cloneDeep(territory))
}

export const getCopilotAMASListData = (startDay: string, endDay: string): Promise<Array<AMASEmployee>> => {
    return new Promise((resolve, reject) => {
        BaseInstance.sfHttpClient
            .callApex(
                `${CommonApi.PBNA_MOBILE_API_GET_MM_AMAS}/${CommonParam.userLocationId}&${startDay}&${endDay}`,
                'GET'
            )
            .then((res) => {
                const resultData = JSON.parse(res?.data) as Array<AMASEmployee>
                resolve(resultData)
            })
            .catch((err) => {
                storeClassLog(Log.MOBILE_ERROR, 'getCopilotAMASListData', ErrorUtils.error2String(err))
                reject([])
            })
    })
}
export const COMPLETED = 'completed'
export const IN_PROGRESS = 'inProgress'
export const YET_2_START = 'yet2Start'
const styles = { ...NewScheduleListStyle, ...commonStyle }

export const renderStatusBarItem = (item: any, topMetrics: any) => {
    let status, statusNum, statusStyle
    if (item.status === YET_2_START) {
        status = t.labels.PBNA_MOBILE_YET_TO_START
        statusNum = topMetrics.yet2Start
        statusStyle = styles.yet2startStatus
    } else if (item.status === IN_PROGRESS) {
        status = t.labels.PBNA_MOBILE_IN_PROGRESS
        statusNum = topMetrics.inProgress
        statusStyle = styles.inProgressStatus
    } else {
        status = t.labels.PBNA_MOBILE_COMPLETED
        statusNum = topMetrics.completed
        statusStyle = styles.completedStatus
    }
    return (
        <View style={styles.countTitleWrap}>
            <View>
                <View style={styles.countTitleInner}>
                    <CText style={styles.countTitleText}>{status}</CText>
                    <View style={[styles.statusIcon, statusStyle, styles.dotStyle]} />
                </View>
                <CText style={[styles.countNumText, styles.marginTop4]}>{statusNum}</CText>
            </View>
            <SORT_GREY />
        </View>
    )
}

export const sortListByStatusArr = (
    activeTab: number,
    defaultTab: number,
    employeeList: any[],
    customerList: any[],
    visitStatusArr: any[],
    originEmployeeList: any[]
) => {
    const unassignedRoutes = []
    const yetToStartArr = []
    const inProgressArr = []
    const completedArr = []
    const wholeObj: any = {}
    let tempWholeArr: any = []
    if (activeTab === defaultTab) {
        for (const employee of employeeList) {
            if (employee.unassignedRoute || employee?.unassign) {
                unassignedRoutes.push(employee)
            } else if (employee.status === YET_2_START) {
                yetToStartArr.push(employee)
            } else if (employee.status === IN_PROGRESS) {
                inProgressArr.push(employee)
            } else {
                completedArr.push(employee)
            }
        }
        tempWholeArr = [...unassignedRoutes]
    } else {
        customerList.forEach((item: any) => {
            if (item.status === VisitStatus.PUBLISHED) {
                yetToStartArr.push(item)
            } else if (item.status === VisitStatus.IN_PROGRESS) {
                inProgressArr.push(item)
            } else {
                completedArr.push(item)
            }
        })
    }
    wholeObj[YET_2_START] = yetToStartArr
    wholeObj[IN_PROGRESS] = inProgressArr
    wholeObj[COMPLETED] = completedArr
    if (!_.isEmpty(visitStatusArr)) {
        visitStatusArr.forEach((item: any) => {
            tempWholeArr.push(...wholeObj[item.status])
        })
    } else {
        tempWholeArr.push(...[...yetToStartArr, ...inProgressArr, ...completedArr])
    }
    let tempFavoriteEmployees = []
    if (activeTab === defaultTab) {
        const tempFavorites: any = []
        const notFavorited: any = []
        tempWholeArr.forEach((item: any) => {
            if (item.isFavorited && !item.unassignedRoute) {
                tempFavorites.push(item)
            } else {
                notFavorited.push(item)
            }
        })
        tempWholeArr = notFavorited
        tempFavoriteEmployees = tempFavorites
    }
    // update origin employee list manually when favorite or unfavorite
    employeeList.forEach((employee: any) => {
        originEmployeeList.forEach((originEE: any) => {
            if (originEE.id === employee.id) {
                originEE.isFavorited = employee.isFavorited
            }
        })
    })
    // for customers whole array is whole, but for employee, it's unfavorite employees
    return { wholeArr: tempWholeArr, favoriteEmployees: tempFavoriteEmployees }
}

export enum MyDayStatusOrder {
    MERCH = 'MERCH_MY_DAY_STATUS_ORDER',
    SALES = 'SALES_MY_DAY_STATUS_ORDER'
}

export const updateLocalStatusSortArr = (item: any, setVisitStatusArr: any, type: string) => {
    const newSortArr = JSON.stringify(item)
    setVisitStatusArr(item)
    AsyncStorage.setItem(type, newSortArr)
}

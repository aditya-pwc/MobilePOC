/**
 * @description Search Bar component.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-03-19
 */

import React, { useEffect, useState, useImperativeHandle, useCallback } from 'react'
import { View, Image, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native'
import { SearchBar, CheckBox } from 'react-native-elements'
import CText from '../../../../common/components/CText'
import CCheckBox from '../../../../common/components/CCheckBox'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import store from '../../../redux/store/Store'
import { replaceSpace } from '../../../utils/MerchManagerUtils'
import SearchBarFilterStyle from '../../../styles/manager/SearchBarFilterStyle'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { VisitStatus, VisitRecordType } from '../../../enums/Visit'
import _, { debounce } from 'lodash'
import {
    checkVisitsTabAllError,
    compositeMyDayVisitListStatus,
    getWorkingStatusObj,
    orderCustomerListByLocId,
    sortByParamsASC,
    sortByParamsDESC
} from '../helper/MerchManagerHelper'
import { t } from '../../../../common/i18n/t'
import RedExclamation from '../../../../../assets/image/red-exclamation.svg'
import OrderFilterSelectTab from './OrderFilterSelectTab'
import { Input } from 'react-native-elements/dist/input/Input'
import { getOrderTopMetrics } from '../../del-sup/deliveries/DeliveriesHelper'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import {
    FavoriteEmployeeOnly,
    filterByFavoriteOnly,
    filterByMyDirectOnly,
    MyDirectEmployeesOnly,
    setFavoriteOnlyFilterStatus,
    setFiltersWhenRenderedFirstTime,
    setMyDirectOnlyFilterStatus
} from '../helper/MMSearchBarHelper'
import { getOrderSortOptions, onSelectOrderSort, sortOrdersByOptions } from './SearchBarOrderFilter'
import { OrderDeliveryMethodCode } from '../../../model/Order'

interface SearchBarProps {
    cRef?: any
    notShowFilterBtn?: boolean
    setListData?: any
    originListData?: any
    isEmployee?: boolean
    isDelivery?: boolean
    isMerch?: boolean
    isMyTeam?: boolean
    isCustomer?: boolean
    isAddVisit?: boolean
    isPublished?: boolean
    placeholder?: string
    isReview?: boolean
    shouldFilterReset?: boolean
    isDisabledFilter?: boolean
    employeeMetrics?: any
    setShouldFilterReset?: Function
    setEmployeeMetrics?: (metrics: any) => void
    searchTextChange?: (text?: string) => void
    reset?: () => void
    apply?: (boolean) => void
    onFilterClick?: () => void
    onFocus?: () => void
    originData?: any
    isLocation?: boolean
    addClick?: Function
    showErrBar?: boolean
    disabledFilterBtn?: boolean
    isAttendee?: boolean
    isOrder?: boolean
    setDaySchInfo?: any
    placeholderTextColor?: string
    needFavoriteOnly?: boolean
    isSDL?: boolean
    needMyDirectOnly?: boolean
    setSearchBarFilteredEmployeeList?: any
    isRNS?: boolean
}

// tempWeekArr for week filter
const getTempWeekArr = () => {
    return [
        { key: 'SUN', label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_SUNDAY, isActive: false },
        { key: 'MON', label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_MONDAY, isActive: false },
        { key: 'TUE', label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_TUESDAY, isActive: false },
        { key: 'WED', label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_WEDNESDAY, isActive: false },
        { key: 'THU', label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_THURSDAY, isActive: false },
        { key: 'FRI', label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_FRIDAY, isActive: false },
        { key: 'SAT', label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_SATURDAY, isActive: false },
        { key: 'ALL', label: t.labels.PBNA_MOBILE_ALL.toLocaleUpperCase(), isActive: true }
    ]
}
const getEmployeeType = () => {
    return [
        { key: 'F', label: t.labels.PBNA_MOBILE_FULL_TIME, isActive: false },
        { key: 'P', label: t.labels.PBNA_MOBILE_PART_TIME, isActive: false },
        { key: 'A', label: t.labels.PBNA_MOBILE_ALL.toLocaleUpperCase(), isActive: true }
    ]
}
const getStoreFormat = () => {
    return [
        { key: 'S', label: t.labels.PBNA_MOBILE_SMALL.toLocaleUpperCase(), isActive: false },
        { key: 'L', label: t.labels.PBNA_MOBILE_LARGE.toLocaleUpperCase(), isActive: false },
        { key: 'A', label: t.labels.PBNA_MOBILE_ALL.toLocaleUpperCase(), isActive: true }
    ]
}
const getAllLabel = () => {
    return t.labels.PBNA_MOBILE_ALL.toLocaleUpperCase()
}

const WEEK_NUM = 7
const TIME_NUM = 2
const STORE_NUM = 2
const IMG_SEARCH = ImageSrc.IMG_SEARCH
const IMG_SORT = ImageSrc.IMG_SORT
const IMG_CLEAR = ImageSrc.IMG_CLEAR
const CLEAR_TEXT = 'clearText'
const RESET = 'reset'
const DEFAULT = 'default'
const styles = SearchBarFilterStyle

enum DeliveryMethodType {
    BULK = 0,
    D_BAY = 1,
    ALL = 2
}
const MAX_BULK_CASES = 75
const MAX_DISPATCH_BAY_CASES = 15

const CHECK_CIRCLE = <Image style={styles.checkCircle} source={ImageSrc.IMG_CHECK_CIRCLE} />
const UNCHECK_CIRCLE = <Image style={styles.checkCircle} source={ImageSrc.IMG_UNCHECK_CIRCLE} />

const handleTempList = (tempList, newList, isMyTeam, originListData, isEmployee) => {
    if (isMyTeam || isEmployee) {
        tempList = JSON.parse(JSON.stringify(originListData))
        if (newList) {
            tempList = JSON.parse(JSON.stringify(newList))
        }
    }
    return tempList
}

const getReplacedNullList = (tempList) => {
    return tempList.map((item) => {
        if (item.firstName === null) {
            item.firstName = ''
        }
        if (item.lastName === null) {
            item.lastName = ''
        }
        if (item.name === null) {
            item.name = ''
        }
        return item
    })
}

const handleUserWorkingDay = (isSelect, replaceNullList, item, fitMap) => {
    let tempList = []
    if (!isSelect) {
        isSelect = true
    }
    tempList = replaceNullList.filter((userItem) => {
        if (!_.isEmpty(userItem.workingStatus)) {
            const visits = userItem.visits
            for (const workItem of userItem.workingStatus) {
                if (
                    (workItem.attend && item.key === workItem.name) ||
                    item.key === 'ALL' ||
                    (!userItem.unassignedRoute && visits && visits[item.key])
                ) {
                    return true
                }
            }
        }
        return false
    })
    tempList.forEach((fitItem) => {
        fitMap[fitItem.id] = fitItem
    })
    return isSelect
}

const handleWeekArr = (params) => {
    params.weekArr.forEach((item) => {
        if (item.isActive) {
            if (item.key !== 'ALL') {
                params.hasFilterSelected = true
            }
            params.isSelect = handleUserWorkingDay(params.isSelect, params.replaceNullList, item, params.fitMap)
        }
    })
    return { isSelect: params.isSelect, hasFilterSelected: params.hasFilterSelected }
}

const filterEmployees = (params) => {
    const filteredEmployees = []
    params.replaceNullList.forEach((employee) => {
        const fullName = (employee.firstName + ' ' + employee.lastName)?.toUpperCase()
        const gpId = employee.gpid?.toUpperCase()
        if (fullName?.indexOf(params.text) >= 0 || gpId?.indexOf(params.text) >= 0) {
            filteredEmployees.push(employee)
        }
    })
    return filteredEmployees
}

const filterNoNullList = (replaceNullList, fullTimeSelectedTemp, partTimeSelectedTemp) => {
    return replaceNullList.filter((userItem: any) => {
        if (
            (userItem.ftFlag === 'true' && fullTimeSelectedTemp) ||
            (userItem.ftFlag === 'false' && partTimeSelectedTemp)
        ) {
            return true
        }
        return fullTimeSelectedTemp && partTimeSelectedTemp
    })
}

const filterErrorEmployeeOnly = (replaceNullList, errorEmployeeOnly) => {
    if (errorEmployeeOnly) {
        return replaceNullList.filter((item: any) => {
            return (
                item.noWorkingDay ||
                item.terminateUser ||
                _.isEmpty(item.startTime) ||
                checkVisitsTabAllError(getWorkingStatusObj(item.workingStatus), item.serviceDetails)
            )
        })
    }
    return replaceNullList
}

const handleMyTeamOrRNSApplyList = (params) => {
    if (params.isMyTeam || params.isReview) {
        let fullTimeSelectedTemp = params.fullTimeSelected
        let partTimeSelectedTemp = params.partTimeSelected
        if (params.type === RESET) {
            fullTimeSelectedTemp = true
            partTimeSelectedTemp = true
            params.isLastSelectedTemp = true
            params.isFirstSelectedTemp = null
            params.errorEmployeeOnlyTemp = false
        }
        params.replaceNullList = filterEmployees(params)
        const fitMap = {}
        let isSelect = false
        const resObj = handleWeekArr({
            weekArr: params.weekArr,
            isSelect: isSelect,
            fitMap: fitMap,
            hasFilterSelected: params.hasFilterSelected,
            replaceNullList: params.replaceNullList
        })
        isSelect = resObj.isSelect
        params.hasFilterSelected = resObj.hasFilterSelected
        if (isSelect) {
            params.replaceNullList = Object.values(fitMap)
        }
        params.hasFilterSelected =
            params.hasFilterSelected ||
            !fullTimeSelectedTemp ||
            !partTimeSelectedTemp ||
            params.errorEmployeeOnlyTemp ||
            params.myDirectEmployeeOnly
        params.replaceNullList = filterNoNullList(params.replaceNullList, fullTimeSelectedTemp, partTimeSelectedTemp)
        if (params.isMyTeam) {
            params.replaceNullList = filterErrorEmployeeOnly(params.replaceNullList, params.errorEmployeeOnlyTemp)
            if (params.myDirectEmployeeOnly && params.type !== RESET) {
                params.replaceNullList = filterByMyDirectOnly(params.replaceNullList)
            }
        }
    }
    if (params.isEmployee) {
        if (params.type === RESET) {
            params.isLastSelectedTemp = true
            params.isFirstSelectedTemp = null
        }
        params.replaceNullList = filterEmployees(params)
    }
    return {
        replaceNullList: params.replaceNullList,
        isLastSelectedTemp: params.isLastSelectedTemp,
        isFirstSelectedTemp: params.isFirstSelectedTemp,
        hasFilterSelected: params.hasFilterSelected,
        errorEmployeeOnlyTemp: params.errorEmployeeOnlyTemp
    }
}

const calculateMetrics = (employeeListData) => {
    const tempMetrics = { completed: 0, inProgress: 0, yet2Start: 0 }
    for (const item of employeeListData) {
        compositeMyDayVisitListStatus(item, tempMetrics)
    }
    return tempMetrics
}

const handleSetEmployeeMetrics = (setEmployeeMetrics, listData, prevMetrics) => {
    if (!setEmployeeMetrics) {
        return
    }
    const outputMetrics = calculateMetrics(listData)
    if (prevMetrics && _.isEqual(prevMetrics, outputMetrics)) {
        return
    }
    setEmployeeMetrics(outputMetrics)
}

const handleEmployeeFilter = (params) => {
    const {
        replaceNullList,
        GeofenceIssuesOnly,
        merchRoleTypeOnly,
        otherRoleTypeOnly,
        salesRoleTypeOnly,
        isMerch,
        isDelivery,
        favoriteEmployeeOnly,
        myDirectEmployeeOnly
    } = params
    if (isMerch || isDelivery) {
        if (isMerch && !GeofenceIssuesOnly && !merchRoleTypeOnly && !otherRoleTypeOnly && !salesRoleTypeOnly) {
            return replaceNullList
        }
        const outputSet = new Set()
        if (GeofenceIssuesOnly) {
            if (isMerch) {
                replaceNullList.forEach((employee) => {
                    if (!_.isEmpty(employee.visits)) {
                        employee?.visits?.forEach((visit) => {
                            if (
                                visit?.AMAS_Compliant__c === '0' &&
                                !outputSet.has(employee) &&
                                visit?.Status__c === VisitStatus.COMPLETE
                            ) {
                                outputSet.add(employee)
                            }
                        })
                    }
                })
            }
            if (isDelivery) {
                replaceNullList.forEach((employee) => {
                    if (!_.isEmpty(employee.visits)) {
                        employee?.visits?.forEach((visit) => {
                            if (visit['RecordType.Name']) {
                                if (
                                    !outputSet.has(employee) &&
                                    visit['RecordType.Name'] === VisitRecordType.DELIVERY &&
                                    visit?.Status__c === VisitStatus.COMPLETE &&
                                    visit?.Check_In_Location_Flag__c === '0' &&
                                    visit?.Check_Out_Location_Flag__c === '0'
                                ) {
                                    outputSet.add(employee)
                                }
                            }
                        })
                    }
                })
            }
        }
        const geofenceOutput = GeofenceIssuesOnly ? Array.from(outputSet) : replaceNullList
        const myTeamLineCodeMap = store.getState().manager.lineCodeMap.get('MyTeamGroup')
        let outputArray = []
        if (myTeamLineCodeMap) {
            if (merchRoleTypeOnly && Array.isArray(geofenceOutput)) {
                const merchCopy = geofenceOutput?.filter((user) => {
                    for (const key of myTeamLineCodeMap?.Merch) {
                        if (user?.lineCode === key) {
                            return true
                        }
                    }
                    return false
                })
                outputArray = merchCopy
            }
            if (salesRoleTypeOnly && Array.isArray(geofenceOutput)) {
                const salesCopy = geofenceOutput?.filter((user) => {
                    for (const key of myTeamLineCodeMap?.Sales) {
                        if (user?.lineCode === key) {
                            return true
                        }
                    }
                    return false
                })
                outputArray = merchRoleTypeOnly ? outputArray.concat(salesCopy) : salesCopy
            }
            if (otherRoleTypeOnly && Array.isArray(geofenceOutput)) {
                const otherCopy = geofenceOutput?.filter((user) => {
                    for (const key of myTeamLineCodeMap?.Merch) {
                        if (user?.lineCode === key) {
                            return false
                        }
                    }
                    for (const key of myTeamLineCodeMap?.Sales) {
                        if (user?.lineCode === key) {
                            return false
                        }
                    }
                    return true
                })
                outputArray = merchRoleTypeOnly || salesRoleTypeOnly ? outputArray.concat(otherCopy) : otherCopy
            }
        }
        outputArray = !_.isEmpty(outputArray) ? outputArray : geofenceOutput
        if (favoriteEmployeeOnly) {
            outputArray = filterByFavoriteOnly(outputArray)
        }
        if (myDirectEmployeeOnly) {
            outputArray = filterByMyDirectOnly(outputArray)
        }
        return outputArray
    }
    if (favoriteEmployeeOnly) {
        return filterByFavoriteOnly(replaceNullList)
    }
    return replaceNullList
}

const handleEmployeeSort = (replaceNullList, isFirstSelectedTemp, isLastSelectedTemp, isReview, isHourSelected) => {
    return replaceNullList.sort((a, b) => {
        if (isFirstSelectedTemp) {
            return sortByParamsASC(a.firstName, b.firstName)
        } else if (isFirstSelectedTemp === false) {
            return sortByParamsDESC(a.firstName, b.firstName)
        }
        if (isLastSelectedTemp) {
            return sortByParamsASC(a.lastName, b.lastName)
        } else if (isLastSelectedTemp === false) {
            return sortByParamsDESC(a.lastName, b.lastName)
        }
        if (isReview) {
            if (isHourSelected) {
                return parseFloat(b.totalHours) - parseFloat(a.totalHours)
            } else if (isHourSelected === false) {
                return parseFloat(a.totalHours) - parseFloat(b.totalHours)
            }
        } else {
            if (isHourSelected) {
                return parseFloat(b.totalDuration) - parseFloat(a.totalDuration)
            } else if (isHourSelected === false) {
                return parseFloat(a.totalDuration) - parseFloat(b.totalDuration)
            }
        }
        return sortByParamsASC(b.name, a.name)
    })
}

const handleCustomerSort = (tempList, isCNameSelectedTemp) => {
    return tempList.sort((a, b) => {
        if (isCNameSelectedTemp) {
            return sortByParamsASC(a.name, b.name)
        } else if (isCNameSelectedTemp === false) {
            return sortByParamsDESC(a.name, b.name)
        }
        return 0
    })
}

const onSearchTextChange = (params, type = DEFAULT) => {
    const {
        text,
        setSearchBarFilterText,
        setIsCleared,
        searchTextChange,
        isEmployee,
        isCustomer,
        isOrder,
        isAddVisit,
        originData,
        handle
    } = params
    const searchText = text.replace(/[‘’`]/g, "'")
    setSearchBarFilterText(searchText)
    if (searchText) {
        setIsCleared(false)
    } else {
        setIsCleared(true)
        type = CLEAR_TEXT
    }
    searchTextChange && searchTextChange(searchText)
    if ((isEmployee || isCustomer || isOrder) && !isAddVisit) {
        handle(originData, searchText, type)
    }
}

const onResetClick = (params) => {
    const {
        modalVisible,
        setModalVisible,
        isCustomer,
        timeArr,
        weekArr,
        isEmployee,
        setFirstSelection,
        setLastSelection,
        setHourSelection,
        setCNameSelection,
        isMyTeam,
        setWeekArr,
        setTimeArr,
        setUnassignedChecked,
        setFullTimeSelected,
        setPartTimeSelected,
        setErrorEmployeeOnly,
        setGeofenceIssuesOnly,
        setMerchRoleTypeOnly,
        setSalesRoleTypeOnly,
        setOtherRoleTypeOnly,
        reset,
        setIsCleared,
        onApplyClick,
        originData,
        setHasFilterSelected,
        setStoreArr,
        setLargeSelected,
        setSmallSelected,
        setListData,
        setSearchBarFilterText,
        setErrChecked,
        isMerch,
        isOrder,
        resetOrderFilter,
        setDaySchInfo,
        isDelivery,
        isSDL,
        setFavoriteEmployeeOnly,
        setMyDirectEmployeeOnly,
        setSearchBarFilteredEmployeeList,
        isResetButtonClicked,
        setFavoriteOnlyFilterStatusCB,
        setMyDirectOnlyFilterStatusCB
    } = params
    if (modalVisible) {
        setModalVisible(false)
    }
    if (!isCustomer) {
        timeArr.forEach((item) => {
            item.isActive = false
        })
        weekArr.forEach((item) => {
            item.isActive = false
        })
    }

    if (isEmployee && (isMerch || isDelivery || isSDL)) {
        setFirstSelection(null)
        setLastSelection(true)
        setHourSelection(null)
        setGeofenceIssuesOnly(false)
        setMerchRoleTypeOnly(true)
        setSalesRoleTypeOnly(false)
        setOtherRoleTypeOnly(true)
        if (isResetButtonClicked) {
            setFavoriteEmployeeOnly(false)
            setMyDirectEmployeeOnly(false)
            setFavoriteOnlyFilterStatusCB && setFavoriteOnlyFilterStatusCB(false)
            setMyDirectOnlyFilterStatusCB && setMyDirectOnlyFilterStatusCB(false)
        }
        reset && reset()
        onApplyClick(originData, '', RESET)
        setHasFilterSelected(false)
    } else if ((isMyTeam || !isCustomer) && !isMerch && !isOrder) {
        setWeekArr(getTempWeekArr())
        setTimeArr(getEmployeeType())
        weekArr.forEach((item) => {
            item.isActive = item.key === 'ALL'
        })
        setFirstSelection(null)
        setLastSelection(true)
        setHourSelection(null)
        setFullTimeSelected(true)
        setPartTimeSelected(true)
        setErrorEmployeeOnly(false)
        if (isResetButtonClicked) {
            setMyDirectEmployeeOnly(false)
            setMyDirectOnlyFilterStatusCB && setMyDirectOnlyFilterStatusCB(false)
        }
        reset && reset()
        onApplyClick(originData, '', RESET)
        setHasFilterSelected(false)
    } else if (isCustomer) {
        setStoreArr(getStoreFormat())
        setUnassignedChecked(false)
        setCNameSelection(true)
        setLargeSelected(true)
        setSmallSelected(true)
        setErrChecked(false)
        reset && reset()
        setHasFilterSelected(false)
        onApplyClick(originData, '', RESET)
    } else if (isOrder) {
        resetOrderFilter()
        setListData(originData)
        const orderTopMetrics = getOrderTopMetrics(originData)
        setDaySchInfo(orderTopMetrics)
    } else {
        setHasFilterSelected(false)
        setListData(originData)
        setSearchBarFilteredEmployeeList && setSearchBarFilteredEmployeeList(originData)
    }
    setIsCleared(true)
    setSearchBarFilterText('')
}

const onWeekFilter = (params) => {
    const { item, weekArr, setWeekArr } = params
    item.isActive = !item.isActive
    const ALL_LABEL = getAllLabel()
    if (item.label === ALL_LABEL) {
        weekArr.forEach((week) => {
            week.isActive = false
        })
        item.isActive = true
    } else {
        weekArr[WEEK_NUM].isActive = false
        if (weekArr.filter((w) => w.isActive).length === WEEK_NUM) {
            weekArr.forEach((week) => {
                week.isActive = false
            })
            weekArr[WEEK_NUM].isActive = true
        }
        if (weekArr.filter((w) => !w.isActive).length === WEEK_NUM + 1) {
            weekArr.forEach((week) => {
                week.isActive = false
            })
            weekArr[WEEK_NUM].isActive = true
        }
    }
    setWeekArr((it) => [...it])
}

const handleFTPTFilter = (params) => {
    const { timeArr, setPartTimeSelected, setFullTimeSelected } = params
    timeArr.forEach((timeItem) => {
        if (timeItem.key === 'P') {
            if (timeItem.isActive) {
                setPartTimeSelected(true)
            } else {
                setPartTimeSelected(false)
            }
        }
        if (timeItem.key === 'F') {
            if (timeItem.isActive) {
                setFullTimeSelected(true)
            } else {
                setFullTimeSelected(false)
            }
        }
        if (timeItem.key === 'A' && timeItem.isActive) {
            setPartTimeSelected(true)
            setFullTimeSelected(true)
        }
    })
}

const onTimeFilter = (params) => {
    const { item, timeArr, setPartTimeSelected, setFullTimeSelected, setTimeArr } = params
    item.isActive = !item.isActive
    const ALL_LABEL = getAllLabel()
    if (item.label === ALL_LABEL) {
        timeArr.forEach((week) => {
            week.isActive = false
        })
        item.isActive = true
    } else {
        timeArr[TIME_NUM].isActive = false
        if (timeArr.filter((w) => !w.isActive).length === TIME_NUM + 1) {
            timeArr.forEach((week) => {
                week.isActive = false
            })
            timeArr[TIME_NUM].isActive = true
        } else {
            timeArr.forEach((week) => {
                week.isActive = item.label === week.label
            })
        }
    }
    handleFTPTFilter({ timeArr, setPartTimeSelected, setFullTimeSelected })
    setTimeArr((item) => [...item])
}

const handleSLFilter = (params) => {
    const { storeArr, setSmallSelected, setLargeSelected } = params
    storeArr.forEach((timeItem) => {
        if (timeItem.key === 'S') {
            if (timeItem.isActive) {
                setSmallSelected(true)
            } else {
                setSmallSelected(false)
            }
        }
        if (timeItem.key === 'L') {
            if (timeItem.isActive) {
                setLargeSelected(true)
            } else {
                setLargeSelected(false)
            }
        }
        if (timeItem.key === 'A' && timeItem.isActive) {
            setLargeSelected(true)
            setSmallSelected(true)
        }
    })
}

const onStoreFilter = (params) => {
    const { item, storeArr, setSmallSelected, setLargeSelected, setStoreArr } = params
    const ALL_LABEL = getAllLabel()
    item.isActive = !item.isActive
    if (item.label === ALL_LABEL) {
        storeArr.forEach((week) => {
            week.isActive = false
        })
        item.isActive = true
    } else {
        storeArr[STORE_NUM].isActive = false
        if (storeArr.filter((w) => !w.isActive).length === STORE_NUM + 1) {
            storeArr.forEach((week) => {
                week.isActive = false
            })
            storeArr[STORE_NUM].isActive = true
        } else {
            storeArr.forEach((week) => {
                week.isActive = item.label === week.label
            })
        }
    }
    handleSLFilter({ storeArr, setSmallSelected, setLargeSelected })
    setStoreArr((item) => [...item])
}

const handleText = (text, searchBarFilterText, type) => {
    text = text?.toUpperCase() || searchBarFilterText?.toUpperCase()
    if (type === CLEAR_TEXT || type === RESET) {
        text = ''
    }
    return text
}

const unassignedVisitFilter = (tempList, unassignedChecked, isPublished) => {
    if (!unassignedChecked || _.isEmpty(tempList)) {
        return tempList
    }
    const outputSet = new Set()
    tempList?.forEach((item) => {
        if (isPublished) {
            if (!item?.VisitorId && !item?.Visit_List__c && !outputSet.has(item)) {
                outputSet.add(item)
            }
        } else {
            if (item?.unassignedVisitCount !== 0 && !outputSet.has(item)) {
                outputSet.add(item)
            }
        }
    })
    return Array.from(outputSet)
}

const filteredCustomerByFormat = (tempList, smallSelectedTemp, largeSelectedTemp) => {
    return tempList.filter((customerItem: any) => {
        return (
            (customerItem.busnLvl3 === 'Small Format' && smallSelectedTemp) ||
            (customerItem.busnLvl3 === 'Large Format' && largeSelectedTemp) ||
            (smallSelectedTemp && largeSelectedTemp)
        )
    })
}

const filteredCustomerByField = (tempList, text) => {
    const filteredCustomers: Set<any> = new Set()
    let filteredCustomersByLocId = []
    const searchText = replaceSpace(text).toUpperCase()
    tempList.forEach((customer) => {
        const name = replaceSpace(customer.name)?.toUpperCase()
        const customNumber = replaceSpace(customer.customNumber)?.toUpperCase()
        const address = replaceSpace(customer.address + ', ' + customer.cityStateZip)?.toUpperCase()
        const cof = replaceSpace(customer.cof)?.toUpperCase()
        const userName = replaceSpace(customer.userName)?.toUpperCase()
        const repName = replaceSpace(customer.repName)?.toUpperCase()
        const salesRoute = replaceSpace(customer.salesRoute)?.toUpperCase()
        const nrid = replaceSpace(customer.nrid)?.toUpperCase()
        if (!_.isEmpty(customer.visits)) {
            const visitsObj = customer.visits
            Object.values(visitsObj).forEach((visits: any) => {
                visits?.forEach((visit) => {
                    const tmpUserName = replaceSpace(visit.user.name)?.toUpperCase()
                    if (tmpUserName?.indexOf(searchText) >= 0 && !_.isEmpty(searchText)) {
                        filteredCustomers.add(customer)
                    }
                })
            })
        }

        if (salesRoute?.indexOf(searchText) >= 0 && !_.isEmpty(searchText)) {
            filteredCustomersByLocId.push(customer)
        } else if (
            name.indexOf(searchText) >= 0 ||
            customNumber?.indexOf(searchText) >= 0 ||
            address?.indexOf(searchText) >= 0 ||
            cof?.indexOf(searchText) >= 0 ||
            userName?.indexOf(searchText) >= 0 ||
            repName?.indexOf(searchText) >= 0 ||
            nrid?.indexOf(searchText) >= 0
        ) {
            filteredCustomers.add(customer)
        }
    })
    filteredCustomersByLocId = orderCustomerListByLocId(filteredCustomersByLocId, searchText)
    return filteredCustomersByLocId.concat(Array.from(filteredCustomers))
}
const sortErrCustomerList = (tempList) => {
    const norList = []
    const errList = []
    const unassignedList = []
    tempList.forEach((store) => {
        if (store.unassignedVisitCount !== 0) {
            unassignedList.push(store)
        } else if (store.isError) {
            errList.push(store)
        } else {
            norList.push(store)
        }
    })
    return unassignedList.concat(errList.concat(norList))
}
const errCustomersFilter = (tempList, errChecked, type) => {
    if (errChecked && type !== RESET) {
        tempList = tempList.filter((item) => {
            return item.isError
        })
    }
    return tempList
}
const handleCustomerApply = (params, hasFilterSelected) => {
    const {
        originListData,
        newList,
        isCNameSelected,
        isCustomer,
        isPublished,
        smallSelected,
        largeSelected,
        unassignedChecked,
        type,
        text,
        setListData,
        errChecked
    } = params
    let tempList = JSON.parse(JSON.stringify(originListData))
    if (!_.isEmpty(newList)) {
        tempList = JSON.parse(JSON.stringify(newList))
    }
    let isCNameSelectedTemp = isCNameSelected
    if (isCustomer) {
        let unassignedCheckedTemp = unassignedChecked
        let smallSelectedTemp = smallSelected
        let largeSelectedTemp = largeSelected
        if (type === RESET) {
            unassignedCheckedTemp = false
            smallSelectedTemp = true
            largeSelectedTemp = true
            isCNameSelectedTemp = true
        }
        // no data change status
        hasFilterSelected = hasFilterSelected || !smallSelectedTemp || !largeSelectedTemp || unassignedCheckedTemp
        tempList = filteredCustomerByFormat(tempList, smallSelectedTemp, largeSelectedTemp)
        tempList = filteredCustomerByField(tempList, text)
        tempList = unassignedVisitFilter(tempList, unassignedCheckedTemp, isPublished)
    }
    hasFilterSelected = hasFilterSelected || isCNameSelectedTemp === false
    tempList = handleCustomerSort(tempList, isCNameSelectedTemp)
    tempList = sortErrCustomerList(tempList)
    hasFilterSelected = hasFilterSelected || (type !== 'reset' && errChecked)
    tempList = errCustomersFilter(tempList, errChecked, type)
    const uniqArr = _.uniqBy(tempList, 'id')
    setListData(tempList?.length === uniqArr?.length ? uniqArr : _.uniqBy(tempList, 'Id'))
    return hasFilterSelected
}

const filterUnassignedRouteUsers = (employeeLists) => {
    const tempUnassignedRouteUsers = []
    const tempOthers = []
    employeeLists?.forEach((employee) => {
        if (employee.unassignedRoute) {
            tempUnassignedRouteUsers.push(employee)
        } else {
            tempOthers.push(employee)
        }
    })
    return { unassignedRouteUsers: tempUnassignedRouteUsers, others: tempOthers }
}
const filterUnassignForRNSAndSetData = (eList, isRNS: boolean, setListData) => {
    if (isRNS) {
        const { unassignedRouteUsers, others } = filterUnassignedRouteUsers(eList)
        setListData([...unassignedRouteUsers, ...others])
    } else {
        setListData(eList)
    }
}

const handleApplyClick = (params, hasFilterSelected) => {
    const {
        isEmployee,
        originData,
        newList,
        isMyTeam,
        originListData,
        isFirstSelected,
        isLastSelected,
        isMerch,
        isDelivery,
        isPublished,
        type,
        text,
        weekArr,
        isReview,
        fullTimeSelected,
        partTimeSelected,
        errorEmployeeOnly,
        setEmployeeMetrics,
        GeofenceIssuesOnly,
        merchRoleTypeOnly,
        otherRoleTypeOnly,
        employeeMetrics,
        salesRoleTypeOnly,
        isHourSelected,
        setListData,
        isCNameSelected,
        unassignedChecked,
        isCustomer,
        smallSelected,
        largeSelected,
        setHasFilterSelected,
        apply,
        errChecked,
        isOrder,
        orderSortOptions,
        deliveryTypeIndex,
        localSalesRoute,
        isFirstCCheckBoxChecked,
        isSecondCCheckBoxChecked,
        isThirdCCheckBoxChecked,
        setDaySchInfo,
        favoriteEmployeeOnly,
        isSDL,
        myDirectEmployeeOnly,
        setSearchBarFilteredEmployeeList,
        isRNS
    } = params
    if (isEmployee) {
        let tempList = _.cloneDeep(originData)
        tempList = handleTempList(tempList, newList, isMyTeam, originListData, isEmployee)
        let replaceNullList = getReplacedNullList(tempList)
        let isFirstSelectedTemp = isFirstSelected
        let isLastSelectedTemp = isLastSelected
        const errorEmployeeOnlyTemp = errorEmployeeOnly
        const resObj = handleMyTeamOrRNSApplyList({
            type,
            text,
            weekArr,
            isMyTeam,
            isReview,
            fullTimeSelected,
            partTimeSelected,
            isLastSelectedTemp,
            isFirstSelectedTemp,
            replaceNullList,
            hasFilterSelected,
            errorEmployeeOnlyTemp,
            isEmployee,
            myDirectEmployeeOnly
        })
        replaceNullList = resObj.replaceNullList
        isLastSelectedTemp = resObj.isLastSelectedTemp
        isFirstSelectedTemp = resObj.isFirstSelectedTemp
        hasFilterSelected = resObj.hasFilterSelected
        // no data also change status
        hasFilterSelected = hasFilterSelected || isFirstSelectedTemp || isFirstSelectedTemp === false
        hasFilterSelected = hasFilterSelected || isLastSelectedTemp === false || isHourSelected
        hasFilterSelected = hasFilterSelected || isHourSelected === false
        hasFilterSelected =
            hasFilterSelected || GeofenceIssuesOnly || !merchRoleTypeOnly || !otherRoleTypeOnly || salesRoleTypeOnly
        if (isPublished || isDelivery || isSDL) {
            if (type === RESET) {
                replaceNullList = handleEmployeeFilter({
                    replaceNullList,
                    GeofenceIssuesOnly: false,
                    merchRoleTypeOnly: true,
                    otherRoleTypeOnly: true,
                    salesRoleTypeOnly: false,
                    isMerch,
                    isDelivery,
                    favoriteEmployeeOnly: false,
                    myDirectEmployeeOnly: false
                })
            } else {
                replaceNullList = handleEmployeeFilter({
                    replaceNullList,
                    GeofenceIssuesOnly,
                    merchRoleTypeOnly,
                    otherRoleTypeOnly,
                    salesRoleTypeOnly,
                    isMerch,
                    isDelivery,
                    favoriteEmployeeOnly,
                    myDirectEmployeeOnly
                })
            }
        }
        replaceNullList = handleEmployeeSort(
            replaceNullList,
            isFirstSelectedTemp,
            isLastSelectedTemp,
            isReview,
            isHourSelected
        )
        handleSetEmployeeMetrics(setEmployeeMetrics, replaceNullList, employeeMetrics)
        filterUnassignForRNSAndSetData(replaceNullList, isRNS, setListData)
        setSearchBarFilteredEmployeeList && setSearchBarFilteredEmployeeList(replaceNullList)
    } else if (isOrder) {
        // if filters changed, then highlights filter icon
        hasFilterSelected =
            deliveryTypeIndex === DeliveryMethodType.BULK ||
            deliveryTypeIndex === DeliveryMethodType.D_BAY ||
            !_.isEmpty(localSalesRoute) ||
            isFirstCCheckBoxChecked ||
            isSecondCCheckBoxChecked ||
            isThirdCCheckBoxChecked ||
            !_.isEqual(orderSortOptions, getOrderSortOptions())
        const searchText = replaceSpace(text).toUpperCase()
        const orderListForShow = originListData.filter((order) => {
            let isTextMatchOrderNumberOrCof = true
            if (searchText) {
                const isTextMatchOrderNumber = order?.OrderNumber?.indexOf(searchText) > -1
                const isTextMatchCOF = order?.COF?.indexOf(searchText) > -1
                const isTextMatchName = replaceSpace(order?.AccountName).toUpperCase().indexOf(searchText) > -1
                isTextMatchOrderNumberOrCof = isTextMatchOrderNumber || isTextMatchCOF || isTextMatchName
            }
            let isDeliveryTypeMatch
            switch (deliveryTypeIndex) {
                case DeliveryMethodType.BULK:
                    isDeliveryTypeMatch = order.DeliveryMethodCode === OrderDeliveryMethodCode.BULK
                    break
                case DeliveryMethodType.D_BAY:
                    isDeliveryTypeMatch = order.DeliveryMethodCode === OrderDeliveryMethodCode.DIS_BAY
                    break
                default:
                    isDeliveryTypeMatch = true
                    break
            }

            let isDeliveryRouteMatch = true
            if (localSalesRoute) {
                isDeliveryRouteMatch = order.RSG_LOCL_RTE_ID__c === localSalesRoute
            }

            let isOffScheduleMatch = true
            if (isThirdCCheckBoxChecked) {
                isOffScheduleMatch = order.OffSchedule === '1'
            }

            let isBulkLessMatch = true
            let isDBayLessMatch = true
            if (deliveryTypeIndex === DeliveryMethodType.ALL && (isFirstCCheckBoxChecked || isSecondCCheckBoxChecked)) {
                isBulkLessMatch = false
                isDBayLessMatch = false
            }
            if (isFirstCCheckBoxChecked) {
                const isBulk = order.DeliveryMethodCode === OrderDeliveryMethodCode.BULK
                const count = order.volume || 0
                isBulkLessMatch = isBulk && count < MAX_BULK_CASES
            }

            if (isSecondCCheckBoxChecked) {
                const isDBay = order.DeliveryMethodCode === OrderDeliveryMethodCode.DIS_BAY
                const count = order.volume || 0
                isDBayLessMatch = isDBay && count < MAX_DISPATCH_BAY_CASES
            }

            if (deliveryTypeIndex === DeliveryMethodType.ALL) {
                return (
                    isTextMatchOrderNumberOrCof &&
                    isDeliveryTypeMatch &&
                    isDeliveryRouteMatch &&
                    isOffScheduleMatch &&
                    (isBulkLessMatch || isDBayLessMatch)
                )
            }
            return (
                isTextMatchOrderNumberOrCof &&
                isDeliveryTypeMatch &&
                isDeliveryRouteMatch &&
                isOffScheduleMatch &&
                isBulkLessMatch &&
                isDBayLessMatch
            )
        })

        const newList = sortOrdersByOptions(orderSortOptions, orderListForShow)

        setListData(newList)
        const orderTopMetrics = getOrderTopMetrics(newList)
        setDaySchInfo(orderTopMetrics)
    } else {
        hasFilterSelected = handleCustomerApply(
            {
                originListData,
                newList,
                isCNameSelected,
                isCustomer,
                isPublished,
                unassignedChecked,
                smallSelected,
                largeSelected,
                type,
                text,
                setListData,
                errChecked
            },
            hasFilterSelected
        )
    }
    setHasFilterSelected(hasFilterSelected)
    apply && apply(hasFilterSelected)
}

const renderSortIcon = (params) => {
    const {
        isAddVisit,
        hasFilterSelected,
        isDisabledFilter,
        setModalVisible,
        modalVisible,
        onFilterClick,
        disabledFilterBtn
    } = params
    return (
        !isAddVisit && (
            <TouchableOpacity
                style={hasFilterSelected ? styles.imgSortActiveContainer : styles.imgSortNormalContainer}
                onPress={() => {
                    if (!disabledFilterBtn) {
                        !isDisabledFilter && setModalVisible(!modalVisible)
                        onFilterClick && onFilterClick()
                    }
                }}
            >
                <Image style={hasFilterSelected ? styles.imgSortActive : styles.imgSortNormal} source={IMG_SORT} />
            </TouchableOpacity>
        )
    )
}

const renderEmployeeSortBy = (params) => {
    const {
        isEmployee,
        isFirstSelected,
        setFirstSelection,
        setLastSelection,
        setHourSelection,
        isAddVisit,
        isLastSelected,
        isMyTeam,
        isHourSelected
    } = params
    const ascendingText = <CText>{t.labels.PBNA_MOBILE_ASCENDING}</CText>
    const descendingText = <CText>{t.labels.PBNA_MOBILE_DESCENDING}</CText>
    const high2lowText = <CText>{t.labels.PBNA_MOBILE_HIGH_TO_LOW}</CText>
    const low2highText = <CText>{t.labels.PBNA_MOBILE_LOW_TO_HIGH}</CText>

    return (
        isEmployee && (
            <View>
                <View style={styles.sortOption}>
                    <CText style={styles.sortLabel}>{t.labels.PBNA_MOBILE_FIRST_NAME}</CText>
                    <CheckBox
                        center
                        title={ascendingText}
                        checkedIcon={CHECK_CIRCLE}
                        uncheckedIcon={UNCHECK_CIRCLE}
                        containerStyle={styles.checkBoxStyle}
                        checked={isFirstSelected}
                        onPress={() => {
                            setFirstSelection(true)
                            setLastSelection(null)
                            setHourSelection(null)
                        }}
                    />
                    <CheckBox
                        center
                        title={descendingText}
                        checkedIcon={CHECK_CIRCLE}
                        uncheckedIcon={UNCHECK_CIRCLE}
                        containerStyle={styles.checkBoxStyle}
                        checked={!isFirstSelected && isFirstSelected !== null}
                        onPress={() => {
                            setFirstSelection(false)
                            setLastSelection(null)
                            setHourSelection(null)
                        }}
                    />
                </View>
                <View style={[styles.sortOption, isAddVisit && styles.borderBottomWidth0]}>
                    <CText style={styles.sortLabel}>{t.labels.PBNA_MOBILE_LAST_NAME}</CText>
                    <CheckBox
                        center
                        title={ascendingText}
                        checkedIcon={CHECK_CIRCLE}
                        uncheckedIcon={UNCHECK_CIRCLE}
                        containerStyle={styles.checkBoxStyle}
                        checked={isLastSelected}
                        onPress={() => {
                            setLastSelection(true)
                            setFirstSelection(null)
                            setHourSelection(null)
                        }}
                    />
                    <CheckBox
                        center
                        title={descendingText}
                        checkedIcon={CHECK_CIRCLE}
                        uncheckedIcon={UNCHECK_CIRCLE}
                        containerStyle={styles.checkBoxStyle}
                        checked={!isLastSelected && isLastSelected !== null}
                        onPress={() => {
                            setLastSelection(false)
                            setFirstSelection(null)
                            setHourSelection(null)
                        }}
                    />
                </View>
                {!isMyTeam && !isAddVisit && (
                    <View style={[styles.sortOption, styles.borderBottomWidth0]}>
                        <CText style={styles.sortLabel}>{t.labels.PBNA_MOBILE_PLANNED_DAILY_HOURS}</CText>
                        <CheckBox
                            center
                            title={high2lowText}
                            checkedIcon={CHECK_CIRCLE}
                            uncheckedIcon={UNCHECK_CIRCLE}
                            containerStyle={[styles.checkBoxStyle, styles.paddingLeft8]}
                            checked={isHourSelected}
                            onPress={() => {
                                setHourSelection(true)
                                setFirstSelection(null)
                                setLastSelection(null)
                            }}
                        />
                        <CheckBox
                            center
                            title={low2highText}
                            checkedIcon={CHECK_CIRCLE}
                            uncheckedIcon={UNCHECK_CIRCLE}
                            containerStyle={styles.checkBoxStyle}
                            checked={!isHourSelected && isHourSelected !== null}
                            onPress={() => {
                                setHourSelection(false)
                                setFirstSelection(null)
                                setLastSelection(null)
                            }}
                        />
                    </View>
                )}
            </View>
        )
    )
}

const renderOrderSortByCheckBox = (title: string, checked: boolean, onPress: () => void) => {
    const checkBoxText = <CText>{title}</CText>
    return (
        <CheckBox
            title={checkBoxText}
            checkedIcon={CHECK_CIRCLE}
            uncheckedIcon={UNCHECK_CIRCLE}
            containerStyle={styles.checkBoxStyle}
            checked={checked}
            onPress={onPress}
        />
    )
}

const renderOrderSortBy = (params) => {
    const { isOrder, orderSortOptions, setOrderSortOptions } = params

    return (
        isOrder &&
        orderSortOptions && (
            <View>
                {orderSortOptions.map((item) => {
                    return (
                        <View
                            key={item.key}
                            style={[styles.sortOption, styles.orderSortOption, styles.borderBottomWidth1]}
                        >
                            <CText style={styles.orderSortLabel}>{item.label}</CText>
                            {item.options &&
                                item.options.map((option) => {
                                    return renderOrderSortByCheckBox(option.label, option.selected, () => {
                                        onSelectOrderSort(item.key, option.key, orderSortOptions, setOrderSortOptions)
                                    })
                                })}
                        </View>
                    )
                })}
            </View>
        )
    )
}

const renderDeliveryOrderFilter = (params) => {
    const {
        deliveryTypeIndex,
        isOrder,
        changeTab,
        activeTab,
        localSalesRoute,
        isFirstCCheckBoxChecked,
        isSecondCCheckBoxChecked,
        isThirdCCheckBoxChecked,
        setLocalSalesRoute,
        setIsFirstCCheckBoxChecked,
        setIsSecondCCheckBoxChecked,
        setIsThirdCCheckBoxChecked
    } = params
    const redExclamationIconSize = 16
    const ORDER_DELIVERY_TYPE = [t.labels.PBNA_MOBILE_BULK, t.labels.PBNA_MOBILE_D_BAY, t.labels.PBNA_MOBILE_FILTER_ALL]

    return (
        isOrder && (
            <View>
                <View style={styles.filterContainer}>
                    <CText style={styles.sortTitle}>{t.labels.PBNA_MOBILE_FILTER_BY}</CText>
                    <View>
                        <CText style={styles.orderDeliveryType}>{t.labels.PBNA_MOBILE_DELIVERY_METHOD}</CText>
                        <OrderFilterSelectTab tabs={ORDER_DELIVERY_TYPE} changeTab={changeTab} activeTab={activeTab} />
                    </View>

                    <View style={styles.filterContainer}>
                        <CText style={styles.orderDeliveryType}>{t.labels.PBNA_MOBILE_SALES_ROUTE}</CText>
                        <Input
                            inputStyle={styles.orderFilterInput}
                            containerStyle={styles.noPaddingHorizontal}
                            inputContainerStyle={styles.orderFilterInputContainer}
                            leftIcon={<Image style={styles.imgSearchIcon} source={IMG_SEARCH} />}
                            leftIconContainerStyle={styles.noMarginVertical}
                            clearButtonMode={'while-editing'}
                            placeholder={t.labels.PBNA_MOBILE_SEARCH_SALES_ROUTE}
                            placeholderTextColor={baseStyle.color.titleGray}
                            value={localSalesRoute}
                            onChangeText={(text) => setLocalSalesRoute(text)}
                        />
                    </View>

                    <View style={styles.marginHorizontal_10}>
                        {deliveryTypeIndex !== DeliveryMethodType.D_BAY && (
                            <CCheckBox
                                title={<CText>{t.labels.PBNA_MOBILE_BULK_LESS_THAN_75_CASES}</CText>}
                                checked={isFirstCCheckBoxChecked}
                                containerStyle={styles.checkBoxMultiForOrder}
                                onPress={() => {
                                    setIsFirstCCheckBoxChecked(!isFirstCCheckBoxChecked)
                                }}
                            />
                        )}
                        {deliveryTypeIndex !== DeliveryMethodType.BULK && (
                            <CCheckBox
                                title={<CText>{t.labels.PBNA_MOBILE_DISPATCHABLE_BAY_LESS_THAN_15_CASES}</CText>}
                                checked={isSecondCCheckBoxChecked}
                                containerStyle={styles.checkBoxMultiForOrder}
                                onPress={() => {
                                    setIsSecondCCheckBoxChecked(!isSecondCCheckBoxChecked)
                                }}
                            />
                        )}
                        <CCheckBox
                            title={
                                <>
                                    <RedExclamation
                                        width={redExclamationIconSize}
                                        height={redExclamationIconSize}
                                        style={styles.redExclamationIcon}
                                    />
                                    <CText>
                                        {t.labels.PBNA_MOBILE_OFF_SCHEDULE + ' ' + t.labels.PBNA_MOBILE_DELIVERY_ORDERS}
                                    </CText>
                                </>
                            }
                            checked={isThirdCCheckBoxChecked}
                            containerStyle={styles.checkBoxMultiForOrder}
                            onPress={() => {
                                setIsThirdCCheckBoxChecked(!isThirdCCheckBoxChecked)
                            }}
                        />
                    </View>
                </View>
            </View>
        )
    )
}

const renderRNSEmployeeWorkingDayFilter = (params) => {
    const { isReview, isEmployee, weekArr, setWeekArr } = params
    return (
        isReview &&
        isEmployee && (
            <View>
                <View style={styles.filterContainer}>
                    <CText style={styles.sortTitle}>{t.labels.PBNA_MOBILE_FILTER_BY}</CText>
                    <CText
                        style={[styles.sortLabel, styles.fontWeight_400, styles.fontSize_12, styles.paddingBottom20]}
                    >
                        {t.labels.PBNA_MOBILE_WORKING_DAYS}
                    </CText>
                </View>
                <View style={styles.filterWeekContainer}>
                    {weekArr.map((item) => {
                        return (
                            <TouchableOpacity
                                key={item.key}
                                style={[styles.filterWeek, item.isActive && styles.filterWeekActive]}
                                onPress={() => onWeekFilter({ item, weekArr, setWeekArr })}
                            >
                                <CText style={[styles.textWeek, item.isActive && styles.textWeekActive]}>
                                    {item.label}
                                </CText>
                            </TouchableOpacity>
                        )
                    })}
                </View>
                {isEmployee && !isReview && (
                    <View style={styles.workType}>
                        <CCheckBox
                            title={<CText>{t.labels.PBNA_MOBILE_WORKING}</CText>}
                            checked
                            containerStyle={styles.checkBoxMulti}
                        />
                        <CCheckBox
                            title={<CText>{t.labels.PBNA_MOBILE_NO_VISITS_BEEN_SCHEDULED}</CText>}
                            checked={false}
                            containerStyle={styles.checkBoxMulti}
                        />
                        <CCheckBox
                            title={<CText>{t.labels.PBNA_MOBILE_DAY_OFF}</CText>}
                            checked={false}
                            containerStyle={styles.checkBoxMulti}
                        />
                    </View>
                )}
            </View>
        )
    )
}

const ErrorFilterCheckBox = (props: any) => {
    const { show, isCustomer, checked, onCheckBoxPress } = props
    if (!show) {
        return null
    }
    const errType = isCustomer
        ? _.capitalize(t.labels.PBNA_MOBILE_CUSTOMERS)
        : _.capitalize(t.labels.PBNA_MOBILE_EMPLOYEES)
    return (
        <CCheckBox
            onPress={() => onCheckBoxPress && onCheckBoxPress()}
            title={
                <View style={commonStyle.flexRowAlignCenter}>
                    <View style={styles.exclamationPoint}>
                        <CText style={[styles.fontWeight_700, styles.color_white, styles.fontSize_11]}>{'!'}</CText>
                    </View>
                    <CText>{`${t.labels.PBNA_MOBILE_ERR} ${errType} ${t.labels.PBNA_MOBILE_ONLY}`}</CText>
                </View>
            }
            checked={checked}
            containerStyle={[styles.checkBoxMulti, { marginLeft: 0, marginTop: 20 }]}
        />
    )
}

const UnassignedVisitCheckBox = (props: any) => {
    const { isCustomer, checked, onCheckBoxPress, isPublished, isReview } = props
    if (!isCustomer || (isReview && !isPublished)) {
        return null
    }
    return (
        <CCheckBox
            onPress={() => onCheckBoxPress && onCheckBoxPress()}
            title={
                <View style={commonStyle.flexRowAlignCenter}>
                    <Image source={ImageSrc.ICON_UNASSIGNED} style={styles.unassignedCheckBoxAvator} />
                    <CText>{t.labels.PBNA_MOBILE_CUSTOMERS_WITH_UNASSIGNED_VISITS}</CText>
                </View>
            }
            checked={checked}
            containerStyle={[styles.checkBoxMulti, styles.unassignedCheckBoxContainer]}
        />
    )
}

const GeofenceIssuesCheckBox = (props: any) => {
    const { checked, onCheckBoxPress } = props
    const redExclamationIconSize = 16
    return (
        <CCheckBox
            title={
                <View style={commonStyle.flexRowAlignCenter}>
                    <RedExclamation
                        width={redExclamationIconSize}
                        height={redExclamationIconSize}
                        style={styles.redExclamationIcon}
                    />
                    <CText>{t.labels.PBNA_MOBILE_GEOFENCE_ISSUES}</CText>
                </View>
            }
            onPress={() => onCheckBoxPress && onCheckBoxPress()}
            checked={checked}
            containerStyle={[styles.checkBoxMulti, styles.GeofenceIssueCheckBoxContainer]}
        />
    )
}

const renderMyTeamWorkingDayFilter = (params) => {
    const {
        isMyTeam,
        weekArr,
        setWeekArr,
        timeArr,
        setPartTimeSelected,
        setFullTimeSelected,
        setTimeArr,
        errorEmployeeOnly,
        setErrorEmployeeOnly,
        isAttendee
    } = params
    return (
        isMyTeam && (
            <View>
                <View style={styles.filterContainer}>
                    <CText style={styles.sortTitle}>{t.labels.PBNA_MOBILE_FILTER_BY}</CText>
                    <CText
                        style={[styles.sortLabel, styles.fontWeight_400, styles.fontSize_12, styles.paddingBottom20]}
                    >
                        {t.labels.PBNA_MOBILE_WORKING_DAYS}
                    </CText>
                </View>
                <View style={styles.filterWeekContainer}>
                    {weekArr.map((item) => {
                        return (
                            <TouchableOpacity
                                key={item.key}
                                style={[styles.filterWeek, item.isActive && styles.filterWeekActive]}
                                onPress={() => onWeekFilter({ item, weekArr, setWeekArr })}
                            >
                                <CText style={[styles.textWeek, item.isActive && styles.textWeekActive]}>
                                    {item.label}
                                </CText>
                            </TouchableOpacity>
                        )
                    })}
                </View>
                <CText
                    style={[
                        styles.sortLabel,
                        styles.fontWeight_400,
                        styles.fontSize_12,
                        styles.paddingBottom20,
                        { width: 200 }
                    ]}
                >
                    {t.labels.PBNA_MOBILE_EMPLOYEE_TYPE}
                </CText>
                <View style={[styles.filterWeekContainer, styles.filterTimeContainer]}>
                    {timeArr.map((item) => {
                        return (
                            <TouchableOpacity
                                key={item.key}
                                style={[styles.filterTime, item.isActive && styles.filterTimeActive]}
                                onPress={() =>
                                    onTimeFilter({
                                        item,
                                        timeArr,
                                        setPartTimeSelected,
                                        setFullTimeSelected,
                                        setTimeArr
                                    })
                                }
                            >
                                <CText style={[styles.textTimeNormal, item.isActive && styles.textWeekActive]}>
                                    {item.label}
                                </CText>
                            </TouchableOpacity>
                        )
                    })}
                </View>
                <ErrorFilterCheckBox
                    isCustomer={false}
                    show={!isAttendee}
                    checked={errorEmployeeOnly}
                    onCheckBoxPress={() => setErrorEmployeeOnly(!errorEmployeeOnly)}
                />
            </View>
        )
    )
}

const renderRoleTypeFilter = (params) => {
    const {
        isMerch,
        merchRoleTypeOnly,
        otherRoleTypeOnly,
        salesRoleTypeOnly,
        setMerchRoleTypeOnly,
        setSalesRoleTypeOnly,
        setOtherRoleTypeOnly
    } = params
    const oneLine = 1
    return (
        isMerch && (
            <View>
                <CText style={styles.filterSubtitleStyle} numberOfLines={oneLine}>
                    {`${t.labels.PBNA_MOBILE_ROLE_TYPE} (${t.labels.PBNA_MOBILE_CHOOSE_AT_LEAST_ONE})`}
                </CText>
                <View style={styles.filterCheckboxContainer}>
                    <CCheckBox
                        title={<CText>{_.capitalize(t.labels.PBNA_MOBILE_MERCH)}</CText>}
                        onPress={() => {
                            if (merchRoleTypeOnly && !otherRoleTypeOnly && !salesRoleTypeOnly) {
                                return
                            }
                            setMerchRoleTypeOnly(!merchRoleTypeOnly)
                        }}
                        checked={merchRoleTypeOnly}
                        containerStyle={[styles.checkBoxMulti]}
                    />
                    <CCheckBox
                        title={<CText>{t.labels.PBNA_MOBILE_OTHER}</CText>}
                        onPress={() => {
                            if (!merchRoleTypeOnly && otherRoleTypeOnly && !salesRoleTypeOnly) {
                                return
                            }
                            setOtherRoleTypeOnly(!otherRoleTypeOnly)
                        }}
                        checked={otherRoleTypeOnly}
                        containerStyle={[styles.checkBoxMulti]}
                    />
                    <CCheckBox
                        title={<CText>{_.capitalize(t.labels.PBNA_MOBILE_SALES)}</CText>}
                        onPress={() => {
                            if (!merchRoleTypeOnly && !otherRoleTypeOnly && salesRoleTypeOnly) {
                                return
                            }
                            setSalesRoleTypeOnly(!salesRoleTypeOnly)
                        }}
                        checked={salesRoleTypeOnly}
                        containerStyle={[styles.checkBoxMulti]}
                    />
                </View>
            </View>
        )
    )
}

const renderMyCustomersStoreFIlter = (params) => {
    const { isCustomer, storeArr, setSmallSelected, setLargeSelected, setStoreArr } = params
    return (
        isCustomer && (
            <View>
                <View style={styles.filterContainer}>
                    <CText style={styles.sortTitle}>{t.labels.PBNA_MOBILE_FILTER_BY}</CText>
                    <CText
                        style={[styles.sortLabel, styles.fontWeight_400, styles.fontSize_12, styles.paddingBottom20]}
                    >
                        {t.labels.PBNA_MOBILE_STORE_FORMAT}
                    </CText>
                </View>
                <View style={[styles.filterWeekContainer, styles.filterTimeContainer]}>
                    {storeArr.map((item) => {
                        return (
                            <TouchableOpacity
                                key={item.key}
                                style={[styles.filterTime, item.isActive && styles.filterTimeActive]}
                                onPress={() =>
                                    onStoreFilter({ item, storeArr, setSmallSelected, setLargeSelected, setStoreArr })
                                }
                            >
                                <CText style={[styles.textTimeNormal, item.isActive && styles.textWeekActive]}>
                                    {item.label}
                                </CText>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </View>
        )
    )
}

const SearchBarFilter = (props: SearchBarProps) => {
    const { cRef, disabledFilterBtn = false, notShowFilterBtn = false } = props
    const [isCleared, setIsCleared] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const {
        setListData,
        originListData,
        employeeMetrics,
        isEmployee,
        isReview,
        isPublished,
        isDisabledFilter,
        originData,
        searchTextChange,
        shouldFilterReset,
        setShouldFilterReset,
        isMerch,
        isDelivery,
        isMyTeam,
        isAddVisit,
        reset,
        apply,
        setEmployeeMetrics,
        isCustomer,
        onFilterClick,
        onFocus,
        showErrBar,
        addClick,
        isAttendee,
        isOrder,
        setDaySchInfo,
        needFavoriteOnly,
        isSDL,
        needMyDirectOnly,
        setSearchBarFilteredEmployeeList,
        isRNS
    } = { ...props }
    const [isFirstSelected, setFirstSelection] = useState(null)
    const [isLastSelected, setLastSelection] = useState(true)
    const [isHourSelected, setHourSelection] = useState(null)
    const [isCNameSelected, setCNameSelection] = useState(true)
    const [weekArr, setWeekArr] = useState(getTempWeekArr())
    const [timeArr, setTimeArr] = useState(getEmployeeType())
    const [storeArr, setStoreArr] = useState(getStoreFormat())
    const [fullTimeSelected, setFullTimeSelected] = useState(true)
    const [partTimeSelected, setPartTimeSelected] = useState(true)
    const [smallSelected, setSmallSelected] = useState(true)
    const [largeSelected, setLargeSelected] = useState(true)
    const [flag, setFlag] = useState(false)

    const [searchBarFilterText, setSearchBarFilterText] = useState('')
    const [hasFilterSelected, setHasFilterSelected] = useState(false)
    const [errorEmployeeOnly, setErrorEmployeeOnly] = useState(false)
    const [GeofenceIssuesOnly, setGeofenceIssuesOnly] = useState(false)
    const [merchRoleTypeOnly, setMerchRoleTypeOnly] = useState(true)
    const [salesRoleTypeOnly, setSalesRoleTypeOnly] = useState(false)
    const [otherRoleTypeOnly, setOtherRoleTypeOnly] = useState(true)
    const [errChecked, setErrChecked] = useState(false)
    const [unassignedChecked, setUnassignedChecked] = useState(false)
    const [deliveryTypeIndex, setDeliveryTypeIndex] = useState(DeliveryMethodType.ALL)
    const [isFirstCCheckBoxChecked, setIsFirstCCheckBoxChecked] = useState(false)
    const [isSecondCCheckBoxChecked, setIsSecondCCheckBoxChecked] = useState(false)
    const [isThirdCCheckBoxChecked, setIsThirdCCheckBoxChecked] = useState(false)
    const [orderSortOptions, setOrderSortOptions] = useState(() => getOrderSortOptions())
    const [localSalesRoute, setLocalSalesRoute] = useState('')
    const [favoriteEmployeeOnly, setFavoriteEmployeeOnly] = useState(false)
    const [myDirectEmployeeOnly, setMyDirectEmployeeOnly] = useState(false)

    const ascendingText = <CText>{t.labels.PBNA_MOBILE_ASCENDING}</CText>
    const descendingText = <CText>{t.labels.PBNA_MOBILE_DESCENDING}</CText>

    const onApplyClick = (newList, text = '', type = DEFAULT, localFavoriteOnly?, localMyDirectOnly?) => {
        const initialHasFilterSelected = false
        text = handleText(text, searchBarFilterText, type)
        setModalVisible(false)
        handleApplyClick(
            {
                isEmployee,
                originData,
                isMerch,
                isDelivery,
                newList,
                isMyTeam,
                originListData,
                isFirstSelected,
                isLastSelected,
                isPublished,
                employeeMetrics,
                type,
                text,
                weekArr,
                isReview,
                setEmployeeMetrics,
                fullTimeSelected,
                GeofenceIssuesOnly,
                merchRoleTypeOnly,
                otherRoleTypeOnly,
                unassignedChecked,
                salesRoleTypeOnly,
                partTimeSelected,
                errorEmployeeOnly,
                isHourSelected,
                setListData,
                isCNameSelected,
                isCustomer,
                smallSelected,
                largeSelected,
                setHasFilterSelected,
                apply,
                errChecked,
                isOrder,
                orderSortOptions,
                deliveryTypeIndex,
                localSalesRoute,
                isFirstCCheckBoxChecked,
                isSecondCCheckBoxChecked,
                isThirdCCheckBoxChecked,
                setDaySchInfo,
                favoriteEmployeeOnly: favoriteEmployeeOnly || localFavoriteOnly,
                isSDL,
                myDirectEmployeeOnly: myDirectEmployeeOnly || localMyDirectOnly,
                setSearchBarFilteredEmployeeList,
                isRNS
            },
            initialHasFilterSelected
        )
    }

    const handle = useCallback(
        debounce((newList, text, type) => onApplyClick(newList, text, type), 500),
        [props]
    )

    const clearIconMethod = () => {
        setIsCleared(true)
        setSearchBarFilterText('')
        searchTextChange && searchTextChange('')
        onSearchTextChange(
            {
                text: '',
                setSearchBarFilterText,
                setIsCleared,
                searchTextChange,
                isEmployee,
                isCustomer,
                isOrder,
                isAddVisit,
                originData,
                handle
            },
            CLEAR_TEXT
        )
    }

    const renderClearIcon = () => {
        if (props.isLocation && searchBarFilterText.trim() !== '') {
            return (
                !isCleared && (
                    <TouchableOpacity onPress={() => addClick(searchBarFilterText)}>
                        <CText style={[styles.addStyle]}>{t.labels.PBNA_MOBILE_ADD}</CText>
                    </TouchableOpacity>
                )
            )
        }
        return (
            !isCleared && (
                <TouchableOpacity onPress={clearIconMethod}>
                    <Image style={styles.imgClear} source={IMG_CLEAR} />
                </TouchableOpacity>
            )
        )
    }

    const resetOrderFilter = () => {
        if (!isOrder) {
            return
        }

        setOrderSortOptions(getOrderSortOptions())
        setDeliveryTypeIndex(DeliveryMethodType.ALL)
        setLocalSalesRoute('')
        setIsFirstCCheckBoxChecked(false)
        setIsSecondCCheckBoxChecked(false)
        setIsThirdCCheckBoxChecked(false)
        setHasFilterSelected(false)
    }

    useEffect(() => {
        if (flag) {
            onSearchTextChange({
                text: '',
                setSearchBarFilterText,
                setIsCleared,
                searchTextChange,
                isEmployee,
                isCustomer,
                isOrder,
                isAddVisit,
                originData,
                handle
            })
        } else {
            setFlag(true)
        }
        setListData(originData)
        setSearchBarFilteredEmployeeList && setSearchBarFilteredEmployeeList(originData)
    }, [])

    useEffect(() => {
        if (setShouldFilterReset && shouldFilterReset) {
            onResetClick({
                modalVisible,
                setModalVisible,
                isCustomer,
                timeArr,
                weekArr,
                isEmployee,
                setFirstSelection,
                setLastSelection,
                setHourSelection,
                setCNameSelection,
                isMyTeam,
                setWeekArr,
                setTimeArr,
                setUnassignedChecked,
                setFullTimeSelected,
                setPartTimeSelected,
                setErrorEmployeeOnly,
                setGeofenceIssuesOnly,
                setMerchRoleTypeOnly,
                setSalesRoleTypeOnly,
                setOtherRoleTypeOnly,
                reset,
                setIsCleared,
                onApplyClick,
                originData,
                setHasFilterSelected,
                setStoreArr,
                setLargeSelected,
                setSmallSelected,
                setListData,
                setSearchBarFilterText,
                setErrChecked,
                isOrder,
                resetOrderFilter,
                setDaySchInfo,
                isDelivery,
                setFavoriteEmployeeOnly,
                setMyDirectEmployeeOnly,
                setSearchBarFilteredEmployeeList
            })
            setShouldFilterReset(false)
        }
    }, [shouldFilterReset])

    useEffect(() => {
        if (needFavoriteOnly || needMyDirectOnly) {
            setFiltersWhenRenderedFirstTime(
                setFavoriteEmployeeOnly,
                setMyDirectEmployeeOnly,
                (isFavoriteOnlySelected, isMyDirectOnlySelected) =>
                    onApplyClick(
                        _.cloneDeep(originData),
                        searchBarFilterText,
                        DEFAULT,
                        isFavoriteOnlySelected,
                        isMyDirectOnlySelected
                    )
            )
        }
    }, [originData])

    useImperativeHandle(cRef, () => ({
        onResetClick: () => {
            onResetClick({
                modalVisible,
                setModalVisible,
                isCustomer,
                timeArr,
                weekArr,
                isEmployee,
                setFirstSelection,
                setLastSelection,
                setHourSelection,
                setCNameSelection,
                isMyTeam,
                setWeekArr,
                setTimeArr,
                setUnassignedChecked,
                setFullTimeSelected,
                setPartTimeSelected,
                setErrorEmployeeOnly,
                setGeofenceIssuesOnly,
                setMerchRoleTypeOnly,
                setSalesRoleTypeOnly,
                setOtherRoleTypeOnly,
                reset,
                setIsCleared,
                onApplyClick,
                originData,
                setHasFilterSelected,
                setStoreArr,
                setLargeSelected,
                setSmallSelected,
                setListData,
                setSearchBarFilterText,
                setErrChecked,
                isMerch,
                isOrder,
                resetOrderFilter,
                setDaySchInfo,
                isDelivery,
                setFavoriteEmployeeOnly,
                setMyDirectEmployeeOnly
            })
        },
        onApplyClick: (newList, text, type) => {
            onApplyClick(newList, text, type)
        },
        clearText: () => {
            onSearchTextChange({
                text: '',
                setSearchBarFilterText,
                setIsCleared,
                searchTextChange,
                isEmployee,
                isCustomer,
                isOrder,
                isAddVisit,
                originData,
                handle
            })
        },
        resetOrderFilter: () => {
            resetOrderFilter()
        }
    }))

    return (
        <View style={styles.searchContainer}>
            <SearchBar
                containerStyle={styles.searchBarContainer}
                inputContainerStyle={styles.inputContainerStyle}
                inputStyle={styles.inputStyle}
                leftIconContainerStyle={styles.leftIconContainerStyle}
                searchIcon={<Image style={styles.imgSearch} source={IMG_SEARCH} />}
                clearIcon={renderClearIcon()}
                placeholder={props.placeholder}
                placeholderTextColor={props.placeholderTextColor || '#565656'}
                onChangeText={(text) =>
                    onSearchTextChange({
                        text,
                        setSearchBarFilterText,
                        setIsCleared,
                        searchTextChange,
                        isEmployee,
                        isCustomer,
                        isOrder,
                        isAddVisit,
                        originData,
                        handle
                    })
                }
                // value={isMyTeam ? selectData.myTeamSearchText : selectData.searchText || ''}
                value={searchBarFilterText}
                allowFontScaling={false}
                platform={DEFAULT}
                onFocus={onFocus}
            />
            {!notShowFilterBtn &&
                renderSortIcon({
                    isAddVisit,
                    hasFilterSelected,
                    isDisabledFilter,
                    setModalVisible,
                    modalVisible,
                    onFilterClick,
                    disabledFilterBtn
                })}
            <Modal animationType="fade" transparent visible={modalVisible}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.centeredView}
                    onPressOut={() => {
                        if (!isEmployee && !isMyTeam && !isCustomer && !isReview) {
                            setModalVisible(!modalVisible)
                        }
                    }}
                >
                    <TouchableWithoutFeedback>
                        <View style={styles.modalView}>
                            <View style={styles.modalContainer}>
                                <View style={styles.modalTitle}>
                                    <CText style={[styles.sortTitle, styles.fontSize_12]}>
                                        {isReview || isMyTeam || isCustomer || isEmployee
                                            ? t.labels.PBNA_MOBILE_SORT_AND_FILTER
                                            : t.labels.PBNA_MOBILE_SORT}
                                    </CText>
                                </View>
                                {!isSDL && (
                                    <View style={styles.modalContent}>
                                        <CText style={styles.sortTitle}>{t.labels.PBNA_MOBILE_SORT_BY}</CText>
                                        {renderEmployeeSortBy({
                                            isEmployee,
                                            isFirstSelected,
                                            setFirstSelection,
                                            setLastSelection,
                                            setHourSelection,
                                            isAddVisit,
                                            isLastSelected,
                                            isMyTeam,
                                            isHourSelected
                                        })}
                                        {renderOrderSortBy({
                                            isOrder,
                                            orderSortOptions,
                                            setOrderSortOptions
                                        })}
                                        {!isEmployee && !isOrder && (
                                            <View>
                                                <View style={[styles.sortOption, styles.modalTitle]}>
                                                    <CText style={styles.sortLabel}>
                                                        {t.labels.PBNA_MOBILE_CUSTOMER_NAME}
                                                    </CText>
                                                    <CheckBox
                                                        center
                                                        title={ascendingText}
                                                        checkedIcon={CHECK_CIRCLE}
                                                        uncheckedIcon={UNCHECK_CIRCLE}
                                                        containerStyle={styles.checkBoxStyle}
                                                        checked={isCNameSelected}
                                                        onPress={() => {
                                                            setCNameSelection(true)
                                                        }}
                                                    />
                                                    <CheckBox
                                                        center
                                                        title={descendingText}
                                                        checkedIcon={CHECK_CIRCLE}
                                                        uncheckedIcon={UNCHECK_CIRCLE}
                                                        containerStyle={styles.checkBoxStyle}
                                                        checked={!isCNameSelected && isCNameSelected !== null}
                                                        onPress={() => {
                                                            setCNameSelection(false)
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                        )}
                                        {renderRNSEmployeeWorkingDayFilter({
                                            isReview,
                                            isEmployee,
                                            weekArr,
                                            setWeekArr
                                        })}
                                        {renderMyTeamWorkingDayFilter({
                                            isMyTeam,
                                            weekArr,
                                            setWeekArr,
                                            timeArr,
                                            setPartTimeSelected,
                                            setFullTimeSelected,
                                            setTimeArr,
                                            errorEmployeeOnly,
                                            setErrorEmployeeOnly,
                                            isAttendee
                                        })}
                                        {renderMyCustomersStoreFIlter({
                                            isCustomer,
                                            storeArr,
                                            setSmallSelected,
                                            setLargeSelected,
                                            setStoreArr
                                        })}
                                        <ErrorFilterCheckBox
                                            isCustomer={isCustomer}
                                            show={showErrBar}
                                            checked={errChecked}
                                            onCheckBoxPress={() => setErrChecked(!errChecked)}
                                        />
                                        <UnassignedVisitCheckBox
                                            isPublished={isPublished}
                                            isCustomer={isCustomer}
                                            isReview={isReview}
                                            checked={unassignedChecked}
                                            onCheckBoxPress={() => setUnassignedChecked(!unassignedChecked)}
                                        />
                                    </View>
                                )}
                                {isEmployee && (isMerch || isDelivery) && !isReview && !isMyTeam && (
                                    <View>
                                        <View style={styles.filterContainer}>
                                            <CText style={styles.sortTitle}>{t.labels.PBNA_MOBILE_FILTER_BY}</CText>
                                        </View>
                                        {renderRoleTypeFilter({
                                            deliveryTypeIndex,
                                            isMerch,
                                            merchRoleTypeOnly,
                                            otherRoleTypeOnly,
                                            salesRoleTypeOnly,
                                            setMerchRoleTypeOnly,
                                            setSalesRoleTypeOnly,
                                            setOtherRoleTypeOnly
                                        })}
                                        <GeofenceIssuesCheckBox
                                            checked={GeofenceIssuesOnly}
                                            onCheckBoxPress={() => setGeofenceIssuesOnly(!GeofenceIssuesOnly)}
                                        />
                                    </View>
                                )}
                                {isSDL && (
                                    <View style={styles.filterContainer}>
                                        <CText style={styles.sortTitle}>{t.labels.PBNA_MOBILE_FILTER_BY}</CText>
                                    </View>
                                )}
                                {needFavoriteOnly && (
                                    <FavoriteEmployeeOnly
                                        checked={favoriteEmployeeOnly}
                                        onCheckBoxPress={async () => {
                                            setFavoriteEmployeeOnly(!favoriteEmployeeOnly)
                                            await setFavoriteOnlyFilterStatus(!favoriteEmployeeOnly)
                                        }}
                                    />
                                )}
                                {needMyDirectOnly && (
                                    <MyDirectEmployeesOnly
                                        checked={myDirectEmployeeOnly}
                                        onCheckBoxPress={async () => {
                                            setMyDirectEmployeeOnly(!myDirectEmployeeOnly)
                                            await setMyDirectOnlyFilterStatus(!myDirectEmployeeOnly)
                                        }}
                                    />
                                )}
                                {renderDeliveryOrderFilter({
                                    deliveryTypeIndex,
                                    isOrder,
                                    changeTab: (index) => {
                                        setDeliveryTypeIndex(index)
                                        setIsFirstCCheckBoxChecked(false)
                                        setIsSecondCCheckBoxChecked(false)
                                    },
                                    activeTab: deliveryTypeIndex,
                                    localSalesRoute,
                                    setLocalSalesRoute,
                                    isFirstCCheckBoxChecked,
                                    setIsFirstCCheckBoxChecked,
                                    isSecondCCheckBoxChecked,
                                    setIsSecondCCheckBoxChecked,
                                    isThirdCCheckBoxChecked,
                                    setIsThirdCCheckBoxChecked
                                })}
                            </View>
                            <View style={styles.modalBtn}>
                                <TouchableOpacity
                                    style={styles.buttonReset}
                                    onPress={() =>
                                        onResetClick({
                                            modalVisible,
                                            setModalVisible,
                                            isCustomer,
                                            timeArr,
                                            weekArr,
                                            isEmployee,
                                            setFirstSelection,
                                            setLastSelection,
                                            setHourSelection,
                                            setCNameSelection,
                                            isMyTeam,
                                            setWeekArr,
                                            setTimeArr,
                                            setUnassignedChecked,
                                            setFullTimeSelected,
                                            setPartTimeSelected,
                                            setErrorEmployeeOnly,
                                            setGeofenceIssuesOnly,
                                            setMerchRoleTypeOnly,
                                            setSalesRoleTypeOnly,
                                            setOtherRoleTypeOnly,
                                            reset,
                                            setIsCleared,
                                            onApplyClick,
                                            originData,
                                            setHasFilterSelected,
                                            setStoreArr,
                                            setLargeSelected,
                                            setSmallSelected,
                                            setListData,
                                            setSearchBarFilterText,
                                            setErrChecked,
                                            isMerch,
                                            isOrder,
                                            resetOrderFilter,
                                            setDaySchInfo,
                                            isDelivery,
                                            isSDL,
                                            setFavoriteEmployeeOnly,
                                            setMyDirectEmployeeOnly,
                                            isResetButtonClicked: true,
                                            setFavoriteOnlyFilterStatusCB: setFavoriteOnlyFilterStatus,
                                            setMyDirectOnlyFilterStatusCB: setMyDirectOnlyFilterStatus
                                        })
                                    }
                                >
                                    <View>
                                        {isOrder && (
                                            <CText style={styles.resetText}>
                                                {t.labels.PBNA_MOBILE_RESET_FILTER.toLocaleUpperCase()}
                                            </CText>
                                        )}
                                        {!isOrder && (
                                            <CText style={styles.resetText}>{t.labels.PBNA_MOBILE_RESET}</CText>
                                        )}
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.buttonApply}
                                    onPress={() => {
                                        onApplyClick(originData, searchBarFilterText, DEFAULT)
                                    }}
                                >
                                    <View>
                                        <CText style={styles.applyText}>{t.labels.PBNA_MOBILE_APPLY}</CText>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default SearchBarFilter

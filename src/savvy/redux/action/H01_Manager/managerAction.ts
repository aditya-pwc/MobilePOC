/**
 * @description MerchManager reducer
 * @author Xupeng Bao
 * @date 2021-05-24
 */
import { ManagerType } from '../../types/H01_Manager/ManagerType'
import { myTeamDataProps } from '../../types/H01_Manager/myTeam'
import { GetDataInterface, GetDataForReassignInterface } from '../../../interface/MerchManagerInterface'
import {
    queryEmployeeList,
    queryCustomerList,
    queryEmployeeForReassign,
    queryUnassignedEEList
} from '../../../utils/MerchManagerUtils'
import { getMeetingAttendsList } from '../../../components/manager/service/MeetingService'
import { unionMListAndUser } from '../../../utils/MerchManagerComputeUtils'
import { getUnassignedRouteUserBySVGID } from '../../../components/manager/helper/VisitHelper'
import _ from 'lodash'
import { getGroupLineCode, getSQLFormatScheduleDateArr } from '../../../components/manager/helper/MerchManagerHelper'

const setSelectDate = (selectDate: any) => ({
    type: ManagerType.MANAGER_SELECTED_DATE,
    payload: selectDate
})

const setSearchText = (searchText: string) => ({
    type: ManagerType.MANAGER_SEARCH_TEXT,
    payload: searchText
})

const setScheduleDate = (scheduleDate: any) => ({
    type: ManagerType.MANAGER_SCHEDULE_DATE,
    payload: scheduleDate
})

const setIsCompleted = (isCompleted: boolean) => ({
    type: ManagerType.MANAGER_IS_COMPLETED,
    payload: isCompleted
})

const setIsCanceling = (isCanceling: boolean) => ({
    type: ManagerType.MANAGER_IS_CANCELING,
    payload: isCanceling
})

const setIsCanceled = (isCanceled: boolean) => ({
    type: ManagerType.MANAGER_IS_CANCELED,
    payload: isCanceled
})

const setVisitListId = (visitListId: string) => ({
    type: ManagerType.MANAGER_VISIT_LIST_ID,
    payload: visitListId
})

const setIsCancelBtnClicked = (isCancelBtnClicked: boolean) => ({
    type: ManagerType.MANAGER_IS_CANCEL_BTN_CLICKED,
    payload: isCancelBtnClicked
})

const setMyTeamData = (myTeamData: myTeamDataProps) => ({
    type: ManagerType.MANAGER_MY_TEAM_DATA,
    payload: myTeamData
})

const setEmployeeList = (employeeList: any) => ({
    type: ManagerType.MANAGER_EMPLOYEE_LIST,
    payload: employeeList
})

const setCustomerList = (customerList: any) => ({
    type: ManagerType.MANAGER_CUSTOMER_LIST,
    payload: customerList
})

const setEmployeeListForReassign = (employeeList: any) => ({
    type: ManagerType.MANAGER_EMPLOYEE_LIST_FOR_REASSIGN,
    payload: employeeList
})

const setRNSEmployeeList = (employeeList: any) => ({
    type: ManagerType.MANAGER_RNS_EMPLOYEE_LIST,
    payload: employeeList
})

const setRNSCustomerList = (customerList: any) => ({
    type: ManagerType.MANAGER_RNS_CUSTOMER_LIST,
    payload: customerList
})

const setLineCodeMap = (lineCodeMap: any) => ({
    type: ManagerType.MANAGER_LINE_CODE_MAP,
    payload: lineCodeMap
})

const setRefreshAvatarFlag = () => ({
    type: ManagerType.MANAGER_AVATAR_REFRESH,
    payload: new Date().getTime()
})

const setCompletedSVGList = (completedSVGList: Array<any>) => ({
    type: ManagerType.MANAGER_COMPLETED_SVG_LIST,
    payload: completedSVGList
})

const setPublishedSVGList = (publishedSVGList: Array<any>) => ({
    type: ManagerType.MANAGER_PUBLISHED_SVG_LIST,
    payload: publishedSVGList
})

const setUserLocationInfo = (locationInfo: any) => ({
    type: ManagerType.MANAGER_LOCATION_INFO,
    payload: locationInfo
})

const setIsInCanada = (isInCanada: boolean) => ({
    type: ManagerType.MANAGER_IS_IN_CANADA,
    payload: isInCanada
})

const getEmployeeList = async (getEmployeeData: GetDataInterface) => {
    const mAttObj = await getMeetingAttendsList(getEmployeeData)
    const userData = await queryEmployeeList(getEmployeeData)
    const list = unionMListAndUser(mAttObj, userData)
    if (list) {
        return setEmployeeList(list)
    }
    return []
}

const setNotificationData = (notificationData: any) => ({
    type: ManagerType.MANAGER_NOTIFICATION_DATA,
    payload: notificationData
})

const getCustomerList = async (getCustomerData: GetDataInterface) => {
    const customerData = await queryCustomerList(getCustomerData)
    if (customerData) {
        return setCustomerList(customerData)
    }
    return []
}

const getEmployeeListForReassign = async (getEmployeeForReassign: GetDataForReassignInterface) => {
    const data = await queryEmployeeForReassign(getEmployeeForReassign)
    if (data) {
        return setEmployeeListForReassign(data)
    }
    return []
}

const getRNSEmployeeList = async (getEmployeeData: GetDataInterface) => {
    const mAttObj = await getMeetingAttendsList(getEmployeeData)
    const userData = await queryEmployeeList(getEmployeeData)
    const userList = unionMListAndUser(mAttObj, userData) || []
    const scheduleDateArr = getSQLFormatScheduleDateArr(getEmployeeData?.scheduleDate, true)
    const unscheduledEE = (await queryUnassignedEEList(scheduleDateArr)) || []
    const unassignedRouteUsers = await getUnassignedRouteUserBySVGID(getEmployeeData.visitListId)
    const emptyPlaceholder = {
        totalCases: 0,
        totalDuration: 0,
        totalHours: 0,
        totalMiles: 0,
        totalMinus: 0,
        totalVisit: 0,
        travelTime: 0,
        visits: {},
        weeklyVisitList: {}
    }
    unscheduledEE.forEach((item) => {
        Object.assign(item, emptyPlaceholder)
    })
    for (const routeUser of unassignedRouteUsers) {
        for (const user of userList) {
            if (routeUser.id === user.id) {
                routeUser.visits = user.visits
            }
        }
    }
    return setRNSEmployeeList([..._.unionBy([...unassignedRouteUsers, ...userList], 'id'), ...unscheduledEE])
}

const getRNSCustomerList = async (getCustomerData: GetDataInterface) => {
    const customerData = await queryCustomerList(getCustomerData)
    if (customerData) {
        return setRNSCustomerList(customerData)
    }
    return []
}

const addVisit = async (params: GetDataForReassignInterface) => {
    const { visitListId, dropDownRef, userLocationId, scheduleDate } = params
    return [
        getEmployeeList({
            visitListId,
            dropDownRef,
            scheduleDate
        }),
        getCustomerList({
            visitListId,
            dropDownRef
        }),
        getEmployeeListForReassign({
            visitListId,
            dropDownRef,
            userLocationId
        })
    ]
}

const resetData = () => {
    return [setEmployeeList([]), setCustomerList([])]
}
const getLineCodeMap = async () => {
    const lineCodeMap = await getGroupLineCode()
    return setLineCodeMap(lineCodeMap)
}
export default {
    setSelectDate,
    setSearchText,
    setScheduleDate,
    setIsCompleted,
    setIsCanceling,
    setIsCanceled,
    setVisitListId,
    setIsCancelBtnClicked,
    setMyTeamData,
    setEmployeeList,
    setCustomerList,
    setEmployeeListForReassign,
    getEmployeeList,
    getCustomerList,
    getEmployeeListForReassign,
    addVisit,
    resetData,
    setRNSEmployeeList,
    setRNSCustomerList,
    getRNSEmployeeList,
    getRNSCustomerList,
    getLineCodeMap,
    setNotificationData,
    setRefreshAvatarFlag,
    setCompletedSVGList,
    setPublishedSVGList,
    setUserLocationInfo,
    setIsInCanada
}

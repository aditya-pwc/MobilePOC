/**
 * @description MerchManager reducer
 * @author Xupeng Bao
 * @date 2021-05-24
 */
import { combineReducers } from '@reduxjs/toolkit'
import { replaceReducer } from '../../common/common'
import { ManagerType } from '../../types/H01_Manager/ManagerType'
import { initMyTeamData } from '../../types/H01_Manager/myTeam'

export default combineReducers({
    selectedDate: replaceReducer(ManagerType.MANAGER_SELECTED_DATE, ''),
    searchText: replaceReducer(ManagerType.MANAGER_SEARCH_TEXT, ''),
    scheduleDate: replaceReducer(ManagerType.MANAGER_SCHEDULE_DATE, ''),
    isCompleted: replaceReducer(ManagerType.MANAGER_IS_COMPLETED, false),
    isCanceling: replaceReducer(ManagerType.MANAGER_IS_CANCELING, false),
    isCanceled: replaceReducer(ManagerType.MANAGER_IS_CANCELED, false),
    visitListId: replaceReducer(ManagerType.MANAGER_VISIT_LIST_ID, ''),
    isCancelBtnClicked: replaceReducer(ManagerType.MANAGER_IS_CANCEL_BTN_CLICKED, false),
    myTeamData: replaceReducer(ManagerType.MANAGER_MY_TEAM_DATA, initMyTeamData),
    employeeList: replaceReducer(ManagerType.MANAGER_EMPLOYEE_LIST, []),
    customerList: replaceReducer(ManagerType.MANAGER_CUSTOMER_LIST, []),
    employeeListForReassign: replaceReducer(ManagerType.MANAGER_EMPLOYEE_LIST_FOR_REASSIGN, []),
    RNSEmployeeList: replaceReducer(ManagerType.MANAGER_RNS_EMPLOYEE_LIST, []),
    RNSCustomerList: replaceReducer(ManagerType.MANAGER_RNS_CUSTOMER_LIST, []),
    lineCodeMap: replaceReducer(ManagerType.MANAGER_LINE_CODE_MAP, new Map()),
    notificationData: replaceReducer(ManagerType.MANAGER_NOTIFICATION_DATA, {}),
    avatarRefreshFlag: replaceReducer(ManagerType.MANAGER_AVATAR_REFRESH, ''),
    completedSVGList: replaceReducer(ManagerType.MANAGER_COMPLETED_SVG_LIST, []),
    publishedSVGList: replaceReducer(ManagerType.MANAGER_PUBLISHED_SVG_LIST, []),
    locationInfo: replaceReducer(ManagerType.MANAGER_LOCATION_INFO, {}),
    isInCanada: replaceReducer(ManagerType.MANAGER_IS_IN_CANADA, false)
})

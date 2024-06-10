import { combineReducers } from '@reduxjs/toolkit'
import { CustomerActionType } from '../action/CustomerActionType'
import equipmentSharePointReducer from '../Slice/EquipmentSharePointSlice'
import customerListStateReducer from '../Slice/CustomerListStateSlice'
import customerDetailReducer from '../Slice/CustomerDetailSlice'
import priorityCartReducer from '../Slice/PriorityCartSlice'

const customerActivityState = {
    pepsiDirectDate: []
}

const customerPOSRequestState = {
    posOverview: {},
    posDetailList: []
}
type ActionType = { type: any; payload: any }

const customerActivityReducer = (state = customerActivityState, action: ActionType) => {
    switch (action.type) {
        case CustomerActionType.UPDATE_CUSTOMER_ACTIVITY_PEPSICO_DIRECT:
            return {
                ...state,
                pepsiDirectDate: action.payload
            }
        case CustomerActionType.CLEAR_CUSTOMER_ACTIVITY_PEPSICO_DIRECT:
            return {
                ...state,
                pepsiDirectDate: customerActivityState.pepsiDirectDate
            }
        default:
            return state
    }
}

const customerPOSRequestReducer = (state = customerPOSRequestState, action: ActionType) => {
    switch (action.type) {
        case CustomerActionType.UPDATE_CUSTOMER_POS_OVERVIEW:
            return {
                ...state,
                posOverview: action.payload
            }
        case CustomerActionType.UPDATE_CUSTOMER_POS_DETAIL_LIST:
            return {
                ...state,
                posDetailList: action.payload
            }
        case CustomerActionType.CLEAR_CUSTOMER_POS_REQUEST:
            return {
                ...state,
                posOverview: customerPOSRequestState.posOverview,
                posDetailList: customerPOSRequestState.posDetailList
            }
        case CustomerActionType.CLEAR_CUSTOMER_POS_DETAIL_LIST:
            return {
                ...state,
                posDetailList: customerPOSRequestState.posDetailList
            }
        default:
            return state
    }
}

export const customerReducer = combineReducers({
    priorityCart: priorityCartReducer,
    customerActivityReducer,
    customerDetailReducer,
    customerPOSRequestReducer,
    equipmentSharePointReducer,
    customerListStateReducer
})

import { createSlice } from '@reduxjs/toolkit'

interface CustomerDetailState {
    customerDetail: {}
    activityListRefreshTime: number
    prioritiesNoSaleControl: { [key: string]: boolean }
    redirectAction: {
        reloadPriorities?: any
        goToArchive?: any
        archivedPriorityNoSaleShowMessage?: any
        archivedPriorityRetrieveShowDialog?: any
        showPriorityInCarousel?: any
    }
}

const initialState: CustomerDetailState = {
    customerDetail: {},
    activityListRefreshTime: 0,
    prioritiesNoSaleControl: {},
    redirectAction: {
        reloadPriorities: null,
        goToArchive: null,
        archivedPriorityNoSaleShowMessage: null,
        archivedPriorityRetrieveShowDialog: null,
        showPriorityInCarousel: null
    }
}

export const customerDetailStateSlice = createSlice({
    name: 'customerDetailState',
    initialState,
    reducers: {
        updateCustomerDetail: (state, action) => {
            state.customerDetail = action.payload
        },
        clearCustomerDetail: () => initialState,
        refreshCustomerActivityList: (state) => {
            state.activityListRefreshTime += 1
        },
        setPriorityNoSaleControl: (state, action) => {
            const { id, visited } = action.payload
            if (id && typeof visited === 'boolean') {
                state.prioritiesNoSaleControl[id] = visited
            }
        },
        setRedirectAction: (state, action) => {
            const { type, data } = action.payload
            if (type === 'goToArchive') {
                state.redirectAction.goToArchive = data
            } else if (type === 'archivedPriorityNoSaleShowMessage') {
                state.redirectAction.archivedPriorityNoSaleShowMessage = data
            } else if (type === 'reloadPriorities') {
                state.redirectAction.reloadPriorities = data
            } else if (type === 'archivedPriorityRetrieveShowDialog') {
                state.redirectAction.archivedPriorityRetrieveShowDialog = data
            } else if (type === 'showPriorityInCarousel') {
                state.redirectAction.showPriorityInCarousel = data
            }
        }
    }
})

export const selectCustomerDetailRoot = (state: any) =>
    state.customerReducer.customerDetailReducer as CustomerDetailState

export const selectCustomerDetail = (state: any) => state.customerReducer.customerDetailReducer.customerDetail

export const selectPrioritiesNoSaleControl = (state: any) => selectCustomerDetailRoot(state).prioritiesNoSaleControl

export const selectRedirectAction = (state: any) => selectCustomerDetailRoot(state).redirectAction

export const {
    updateCustomerDetail,
    clearCustomerDetail,
    refreshCustomerActivityList,
    setPriorityNoSaleControl,
    setRedirectAction
} = customerDetailStateSlice.actions

export default customerDetailStateSlice.reducer

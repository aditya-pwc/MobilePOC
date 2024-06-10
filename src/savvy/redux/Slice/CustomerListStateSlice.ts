import { createSlice } from '@reduxjs/toolkit'

interface CustomerListState {
    isLoaded: boolean
    refreshTimes: number
}

const initialState: CustomerListState = {
    isLoaded: false,
    refreshTimes: 0
}

export const customerListStateSlice = createSlice({
    name: 'customerListState',
    initialState,
    reducers: {
        startCustomerListLoading: (state) => {
            state.isLoaded = true
        },
        stopCustomerListLoading: (state) => {
            state.isLoaded = false
            state.refreshTimes += 1
        }
    }
})

export const { startCustomerListLoading, stopCustomerListLoading } = customerListStateSlice.actions

export default customerListStateSlice.reducer

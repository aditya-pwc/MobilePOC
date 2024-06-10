import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../../savvy/redux/store/Store'
import dayjs from 'dayjs'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { todayDateWithTimeZone } from '../../../common/utils/TimeZoneUtils'

export enum MyDayTabEnum {
    MyDay,
    RouteInfo
}

export enum MyDayTimeRangeEnum {
    Past = -1,
    Today = 0,
    Future = 1
}

interface MyDayState {
    timeRange: MyDayTimeRangeEnum
    selectedDate: string
    tab: MyDayTabEnum
    routeInfo: {
        orders: {
            planned: number
            completed: number
        }
        delivery: {
            planned: number
            completed: number
        }
        merchandising: {
            planned: number
            completed: number
        }
    }
    routeInfoLoading: boolean
}

const initialState: MyDayState = {
    timeRange: MyDayTimeRangeEnum.Today,
    selectedDate: todayDateWithTimeZone(true),
    tab: MyDayTabEnum.MyDay,
    routeInfo: {
        orders: {
            planned: 0,
            completed: 0
        },
        delivery: {
            planned: 0,
            completed: 0
        },
        merchandising: {
            planned: 0,
            completed: 0
        }
    },
    routeInfoLoading: false
}

export const myDaySlice = createSlice({
    name: 'myDayState',
    initialState,
    reducers: {
        selectTimeRange: (state, action: PayloadAction<MyDayTimeRangeEnum>) => {
            if (action.payload === MyDayTimeRangeEnum.Today) {
                state.selectedDate = dayjs().format(TIME_FORMAT.Y_MM_DD)
            }
            state.timeRange = action.payload
        },
        selectTab: (state, action: PayloadAction<MyDayTabEnum>) => {
            state.tab = action.payload
        },
        selectDate: (state, action: PayloadAction<string>) => {
            if (action.payload === todayDateWithTimeZone(true) && state.timeRange !== MyDayTimeRangeEnum.Today) {
                state.timeRange = MyDayTimeRangeEnum.Today
            }
            state.selectedDate = action.payload
        },
        setRouteInfo: (state, action: PayloadAction<MyDayState['routeInfo']>) => {
            state.routeInfo = action.payload
        },
        setRouteInfoLoading: (state, action: PayloadAction<boolean>) => {
            state.routeInfoLoading = action.payload
        },
        resetMyDayState: () => {
            return initialState
        }
    }
})

export const { selectTab, setRouteInfo, selectTimeRange, selectDate, setRouteInfoLoading, resetMyDayState } =
    myDaySlice.actions

export const myDayTimeRangeSelector = (state: RootState) => state.myDayStateReducer.timeRange
export const myDayTabSelector = (state: RootState) => state.myDayStateReducer.tab
export const myDaySelectedDateSelector = (state: RootState) => state.myDayStateReducer.selectedDate
export const myDayRouteInfoSelector = (state: RootState) => state.myDayStateReducer.routeInfo
export const myDayRouteInfoLoadingSelector = (state: RootState) => state.myDayStateReducer.routeInfoLoading

export default myDaySlice.reducer

/*
 * @Description:
 * @LastEditors: Yi Li
 */
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    pgList: [],
    withoutSellingDP: true,
    newPgList: [],
    searchOriginList: []
}

export const priceGroupSlice = createSlice({
    name: 'setPZ',
    initialState,
    reducers: {
        updatePriceGroupList: (state, action) => {
            state.pgList = action.payload
        },
        updateSellingDP: (state, action) => {
            state.withoutSellingDP = action.payload
        },
        updateNewPriceGroupList: (state, action) => {
            state.newPgList = action.payload
        },
        updateSearchOriginList: (state, action) => {
            state.searchOriginList = action.payload
        }
    }
})

export const { updatePriceGroupList, updateSellingDP, updateNewPriceGroupList, updateSearchOriginList } =
    priceGroupSlice.actions

export default priceGroupSlice.reducer

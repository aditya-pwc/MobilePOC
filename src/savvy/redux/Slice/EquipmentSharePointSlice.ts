import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import _ from 'lodash'

interface EquipmentImageMap {
    Id: string
    LinkFilename: string
    SubtypeCode: string
}

export interface EquipmentSharePointState {
    equipmentImageMap: { [key: string]: EquipmentImageMap }
    equipmentPdfMap: { [key: string]: EquipmentImageMap }
}
const initialState: EquipmentSharePointState = {
    equipmentImageMap: {},
    equipmentPdfMap: {}
}

export const equipmentSharePointSlice = createSlice({
    name: 'customerActivityDetail',
    initialState,
    reducers: {
        updateEquipmentSharePointImageMap: (state, action: PayloadAction<EquipmentImageMap[]>) => {
            state.equipmentImageMap = _.keyBy(action.payload, 'SubtypeCode')
        },
        resetEquipmentSharePointState: () => initialState,
        updateEquipmentPdfMap: (state, action: PayloadAction<EquipmentImageMap[]>) => {
            state.equipmentPdfMap = _.keyBy(action.payload, 'SubtypeCode')
        }
    }
})

export const { updateEquipmentSharePointImageMap, resetEquipmentSharePointState, updateEquipmentPdfMap } =
    equipmentSharePointSlice.actions

export default equipmentSharePointSlice.reducer

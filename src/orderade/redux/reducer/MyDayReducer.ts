import { MyDayActionType } from '../action/MyDayAction'
import { combineReducers } from '@reduxjs/toolkit'
import { replaceReducer } from '../common/common'

const myDayReducer = combineReducers({
    revampTooltipDisabledList: replaceReducer(MyDayActionType.RevampTooltipDisabledList, [])
})
// This reduce is left to leave an entrance to savvy reduce combine.
// When writing reduce later, please keep the rule like Slice(PriorityProductSelectSlice.ts).
export default myDayReducer

import { combineReducers } from '@reduxjs/toolkit'
import { nameReducer } from './NameReducer'
import { geoFenceReducer } from './GeoFenceReducer'
import { leadReducer } from './Lead'
import manager from './H01_Manager/manager'
import { equipmentSurveyDataReducer } from './EquipmentSurveyReducer'
import { customerReducer } from './Customer'
import { salesDocumentsReducer } from './SalesDocumentsReducer'
import contractReducer from './ContractReducer'
import AuditReducer from './AuditReducer'
import myDayReducer from '../../../orderade/redux/reducer/MyDayReducer'
import PriorityProductSelectSlice from '../Slice/PriorityProductSelectSlice'
import myDayStateReducer from '../../../orderade/redux/slice/MyDaySlice'

const rootReducer = combineReducers({
    nameReducer,
    geoFenceReducer,
    leadReducer,
    manager,
    equipmentSurveyDataReducer,
    customerReducer,
    priorityProductSelect: PriorityProductSelectSlice,
    salesDocumentsReducer,
    contractReducer,
    AuditReducer,
    myDayReducer,
    myDayStateReducer
})

export default rootReducer

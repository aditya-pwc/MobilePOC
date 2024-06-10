import _ from 'lodash'
import { SalesDocumentsActionType } from '../action/SalesDocumentsActionType'

const initialState = {
    fileUrls: []
}

export const salesDocumentsReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case SalesDocumentsActionType.ADD_SUCCESS_DOWNLOAD_FILES:
            return {
                ...state,
                fileUrls: _.uniq([...state.fileUrls, action.value])
            }
        case SalesDocumentsActionType.DELETE_EXECUTED_FILES:
            return {
                ...state,
                fileUrls: state.fileUrls.filter((url) => url !== action.value)
            }
        default:
            return state
    }
}

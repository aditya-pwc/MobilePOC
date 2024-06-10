import { ADD_NAME } from '../action/ActionType'

const initialState = {
    data: [
        {
            title: 'test0'
        }
    ]
}

export const nameReducer = (state = initialState, action) => {
    if (action.type === ADD_NAME) {
        return {
            ...state,
            data: state.data.concat(action.data)
        }
    }
    return state
}

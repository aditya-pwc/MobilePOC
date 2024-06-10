import { GeoFence } from '../action/ActionType'

const initialState = {
    data: [
        {
            title: 'geoFence'
        }
    ]
}

export const geoFenceReducer = (state = initialState, action) => {
    if (action.type === GeoFence) {
        return {
            ...state,
            data: state.data.concat(action.data)
        }
    }
    return state
}

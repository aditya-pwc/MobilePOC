/**
 * @description MerchManager reducer
 * @author Xupeng Bao
 * @date 2021-05-24
 */
import _ from 'lodash'

export type Reducer<S, A> = (state: S, action: A) => S

type ToggleAction = {
    type: string
}

export function toggleReducer(actionType: string, defaultValue: boolean = false): Reducer<boolean, ToggleAction> {
    return (state = defaultValue, action) => {
        if (action.type === actionType) {
            return !state
        }
        return state
    }
}

type PayloadAction<P> = {
    type: string
    payload: P
}

type ReplaceReducer<T> = Reducer<T, PayloadAction<T>>
export function replaceReducer<T>(actionType: string, defaultValue: T): ReplaceReducer<T> {
    return (state = defaultValue, action) => {
        if (action.type === actionType) {
            return action.payload
        }
        return state
    }
}

export function parseReducer<Object>(actionType: string, defaultValue: Object): ReplaceReducer<Object> {
    return (state = defaultValue, action) => {
        if (action.type === actionType) {
            return {
                ...state,
                ...action.payload
            }
        }
        return state
    }
}

export type ResetableReducer = Reducer<Object, { type: string }>

export const resetOn =
    (actionType: string, defaultValue: Object = {}) =>
    (reducer: ResetableReducer): ResetableReducer =>
    (state, action) => {
        if (action.type === actionType) {
            return reducer(defaultValue, action)
        }
        return reducer(state, action)
    }

type ItemAction<I> = {
    type: string
    key: string
    item: I
}

type OptionReducer<I> = Reducer<{ [key: string]: Array<I> }, ItemAction<I>>
export function addReducer<I>(actionType: string, defaultValue: { [key: string]: Array<I> }): OptionReducer<I> {
    return (state = defaultValue, action) => {
        if (action.type === actionType) {
            return {
                ...state,
                [action.key]: [...(state[action.key] || []), action.item]
            }
        }
        return state
    }
}

function updateItem<I>(list: Array<I>, newItem: I): Array<I> {
    const id = _.get(newItem, 'id') || ''
    return _.map(list, (item: any) => {
        if (item.id === id) {
            return newItem
        }
        return item
    })
}

export function updateReducer<I>(actionType: string, defaultValue: { [id: string]: Array<I> } = {}): OptionReducer<I> {
    return (state = defaultValue, action) => {
        if (action.type === actionType) {
            return {
                ...state,
                [action.key]: updateItem(state[action.key] || [], action.item)
            }
        }
        return state
    }
}

function removeItem<I>(list: Array<I>, id: string = ''): Array<I> {
    return _.filter(list, (item: any) => item.id !== id)
}

export function removeReducer<I>(actionType: string, defaultValue: { [id: string]: Array<I> } = {}): OptionReducer<I> {
    return (state = defaultValue, action) => {
        if (action.type === actionType) {
            return {
                ...state,
                [action.key]: removeItem(state[action.key] || [], _.get(action, 'item.id') || '')
            }
        }
        return state
    }
}

type ItemsAction<I> = {
    type: string
    key: string
    items: Array<I>
}

type UnionByReducer<I> = Reducer<{ [key: string]: Array<I> }, ItemsAction<I>>
export function unionByReducer<I>(
    actionType: string,
    defaultValue: { [id: string]: Array<I> } = {},
    unionByKey: string = 'id'
): UnionByReducer<I> {
    return (state = defaultValue, action) => {
        if (action.type === actionType) {
            return {
                ...state,
                [action.key]: _.unionBy(action.items || [], state[action.key] || [], unionByKey)
            }
        }
        return state
    }
}

export function merge<S, A>(reducers: Array<Reducer<S, A>>) {
    return (state: S, action: A) =>
        reducers.reduce((currentState: S, nextReducer: Reducer<S, A>) => nextReducer(currentState, action), state)
}

import _ from 'lodash'

function thunkState({ dispatch, getState }) {
    return (next) => (action) => {
        if (action && typeof action === 'function') {
            return dispatch(action(getState()))
        }
        return next(action)
    }
}

function promise({ dispatch }) {
    return (next) => (action) => {
        if (action && typeof action.then === 'function') {
            const finishLoadingAndDispatch = (input) => {
                dispatch(input)
            }
            return action.then(finishLoadingAndDispatch).catch(finishLoadingAndDispatch)
        }
        return next(action)
    }
}

function multiDispatcher({ dispatch }) {
    return (next) => (actions) => {
        if (Array.isArray(actions)) {
            return actions.map((action) => dispatch(action))
        }
        return next(actions)
    }
}

const filterNil = () => (next) => (action) => {
    if (action != null) {
        next(action)
    }
}

const businessHandle =
    ({ dispatch }) =>
    (next) =>
    (action) => {
        if (action && !_.isEmpty(action.action)) {
            return dispatch(action.method(action.params))
        }
        return next(action)
    }

export default [multiDispatcher, promise, thunkState, filterNil, businessHandle]

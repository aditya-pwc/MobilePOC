import rootReducer from '../reducer'
import { configureStore } from '@reduxjs/toolkit'
import middleware from '../middleware'

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }).concat(middleware),
    devTools: process.env.NODE_ENV === 'development'
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store

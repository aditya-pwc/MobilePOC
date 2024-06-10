import { createSelector, createSlice } from '@reduxjs/toolkit'

type State = {
    productsForCart: {
        groupName: string // data groupName for identifying the product
        quantity: string // data quantity
        data: any
    }[]
}

type RootState = {
    [key: string]: any
    priorityProductSelect: State
}

export type ProductForCart = State['productsForCart'][0]

const initialState: State = {
    productsForCart: []
}

// new slice
const priorityProductSelectSlice = createSlice({
    name: 'priorityProductSelect',
    initialState: initialState,
    reducers: {
        init(state, action) {
            const { productsForCart } = action.payload
            if (productsForCart) {
                state.productsForCart = productsForCart
            } else {
                state.productsForCart = []
            }
        },
        upsertProduct(state, action) {
            const { productsForCart } = state as State
            const { groupName, quantity, data } = action.payload as ProductForCart
            const productForCart = productsForCart.find(
                (prod) => prod.groupName === groupName && prod.data.Id === data.Id
            )
            if (productForCart) {
                productForCart.quantity = quantity
            } else {
                productsForCart.push({
                    groupName,
                    quantity,
                    data: data
                })
            }
        }
    }
})

// export actions
export const { init, upsertProduct } = priorityProductSelectSlice.actions

// export selector
const currentState = (state: RootState) => state.priorityProductSelect

export const selectProductsForCart = (state: RootState) => currentState(state).productsForCart

export const selectTotalCases = createSelector(selectProductsForCart, (productsForCart) => {
    return productsForCart.reduce((total, item) => {
        return total + Number(item.quantity)
    }, 0)
})

// export reducers
export default priorityProductSelectSlice.reducer

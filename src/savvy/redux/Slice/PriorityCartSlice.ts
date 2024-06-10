/**
 * PriorityCartSlice
 */
import { createSelector, createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'

export interface CartItemProductState {
    id: string
    subBrand: string
    productCode: string
    packageGroupName: string
    materialUniqueID: string
    quantity: number
    productSequence: number
}

export interface CartItemState {
    productAttributeId: string
    groupName: string
    products: CartItemProductState[]
}

interface PriorityCartState {
    customerId: string
    // Product Attribute cart items
    customerCart: {
        // customerId as Key
        [key: string]: {
            // productAttributeId as key
            [key: string]: CartItemState[]
        }
    }
    customerCelsiusCart: {
        [customerId: string]: {
            [inventoryId: string]: any
        }
    }
}

const initialState: PriorityCartState = {
    customerId: '', // identify current customer
    customerCart: {},
    customerCelsiusCart: {}
}

export const priorityCartSlice = createSlice({
    name: 'priorityCart',
    initialState,
    reducers: {
        setCurrentCustomer(state, action) {
            if (action.payload) {
                state.customerId = action.payload
            }
        },
        setCelsiusCartItems(state, action) {
            // for Celsius
            const { customerId, customerCelsiusCart } = state
            const { cartItems } = action.payload
            if (!customerCelsiusCart[customerId]) {
                customerCelsiusCart[customerId] = {}
            }
            const cart = customerCelsiusCart[customerId]
            cartItems.forEach((cartItem: any) => {
                cart[cartItem.inventoryId] = cartItem
            })
        },
        updateCelsiusCartItem(state, action) {
            // for Celsius
            const { customerId, customerCelsiusCart } = state
            const { inventoryId, quantity } = action.payload
            if (!customerCelsiusCart[customerId]) {
                customerCelsiusCart[customerId] = {}
            }
            if (!customerCelsiusCart[customerId][inventoryId]) {
                customerCelsiusCart[customerId][inventoryId] = {}
            }
            customerCelsiusCart[customerId][inventoryId].quantity = quantity
        },
        setCartItems(state, action) {
            const { productAttributeId, cartItems } = action.payload
            let customerCart = state.customerCart[state.customerId]

            if (!customerCart) {
                customerCart = {}
            }

            customerCart[productAttributeId] = cartItems
            state.customerCart[state.customerId] = customerCart
        },
        updateCartItem(state, action) {
            const { customerId } = state
            const { productAttributeId, productId, groupName, productQuantity } = action.payload
            if (!customerId) {
                return
            }
            const customerCart = state.customerCart[customerId]
            if (!customerCart) {
                return
            }
            const paCartItem = customerCart[productAttributeId]
            if (!paCartItem) {
                return
            }
            const groupCartItem = paCartItem.find((item) => item.groupName === groupName)
            if (!groupCartItem) {
                return
            }
            const product = groupCartItem.products.find((item) => item.id === productId)
            if (!product) {
                return
            }
            product.quantity = productQuantity
        },
        removeCartItem(state, action) {
            const { customerId } = state
            const { productAttributeId, productId, groupName } = action.payload

            const customerCart = state.customerCart[customerId]
            if (!customerCart || !customerCart[productAttributeId]) {
                return
            }

            const groupCartItem = customerCart[productAttributeId].find((item) => item.groupName === groupName)
            if (!groupCartItem) {
                return
            }
            const products = groupCartItem.products.filter((item) => item.id !== productId)
            groupCartItem.products = products
        },
        removeAllCartItem(state) {
            const { customerId } = state
            if (!customerId) {
                return
            }
            state.customerCart[customerId] = {}
            state.customerCelsiusCart[customerId] = {}
        }
    }
})

type RootStateWithPriorityCartState = { customerReducer: { priorityCart: PriorityCartState } }

export const selectCart = (state: RootStateWithPriorityCartState) => state.customerReducer.priorityCart

// for Celsius
export const selectCelsiusCart = createSelector(selectCart, (cart) => {
    return cart.customerCelsiusCart[cart.customerId]
})

export const selectCelsiusCartItem = (inventoryId: string) =>
    createSelector(selectCelsiusCart, (cart) => {
        return cart ? cart[inventoryId] : null
    })

export const selectHasCelsiusCartItem = createSelector(selectCelsiusCart, (cart) => {
    if (cart) {
        return _.some(Object.values(cart), (item) => {
            return item.quantity > 0
        })
    }
    return false
})

export const selectPAProducts = (productAttributeId: string) =>
    createSelector(selectCart, (cart) => {
        let products: CartItemProductState[] = []
        const customerCart = cart.customerCart[cart.customerId]
        if (!customerCart || !customerCart[productAttributeId]) {
            return []
        }

        for (const paGroupCartItem of customerCart[productAttributeId]) {
            products = products.concat(paGroupCartItem.products)
        }

        // feature(10944066): sort by Sub_Brand__c alphanumeric on priority details screen
        return products.sort((p1, p2) => p1.subBrand?.localeCompare(p2.subBrand))
    })

export const selectHasItems = createSelector(selectCart, (cart) => {
    const customerCart = cart.customerCart[cart.customerId]
    if (!customerCart) {
        return false
    }
    for (const paCartItemsList of Object.values(customerCart)) {
        for (const paCartItems of paCartItemsList) {
            if (paCartItems?.products.length > 0) {
                for (const cartItem of paCartItems?.products) {
                    if (cartItem.quantity > 0) {
                        return true
                    }
                }
            }
        }
    }
    return false
})

export const selectCelsiusCartSummary = createSelector(selectCelsiusCart, (cart) => {
    let csQty = 0
    let productQty = 0
    if (cart) {
        Object.values(cart).forEach((cartItem) => {
            if (cartItem.quantity > 0) {
                productQty++
                csQty += cartItem.quantity
            }
        })
    }
    return {
        csQty,
        productQty
    }
})

export const selectCartSummary = createSelector(selectCart, (cart) => {
    let csQty = 0

    // value is product sku
    const visitedProducts = new Set()

    const customerCart = cart.customerCart[cart.customerId]

    if (customerCart) {
        for (const paCartItems of Object.values(customerCart)) {
            for (const cartItem of paCartItems) {
                for (const product of cartItem?.products) {
                    if (Number(product.quantity) > 0) {
                        csQty += Number(product.quantity)
                        visitedProducts.add(product.productCode + '|' + product.materialUniqueID)
                    }
                }
            }
        }
    }

    return {
        productQty: visitedProducts.size,
        csQty
    }
})

export const selectAllPAProducts = () =>
    createSelector(selectCart, (cart) => {
        if (!cart.customerId) {
            return null
        }

        const customerCart = cart.customerCart[cart.customerId]
        if (!customerCart) {
            return null
        }

        const allPaIds = Object.keys(customerCart)
        const res: { [key: string]: CartItemProductState[] } = {}

        allPaIds.forEach((paId: string) => {
            let products: any[] = []

            if (customerCart[paId]) {
                for (const paGroupCartItem of customerCart[paId]) {
                    products = products.concat(paGroupCartItem.products)
                }
            }

            res[paId] = products
        })

        return res
    })

export const {
    setCurrentCustomer,
    setCelsiusCartItems, // for Celsius
    updateCelsiusCartItem, // for Celsius
    setCartItems,
    updateCartItem,
    removeCartItem,
    removeAllCartItem
} = priorityCartSlice.actions

export default priorityCartSlice.reducer

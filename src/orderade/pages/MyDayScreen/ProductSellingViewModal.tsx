import { StoreProduct } from '../../interface/StoreProduct'

export const getSectionQty = (products: Array<StoreProduct>): number => {
    return products
        .map((product) => parseInt(product.quantity || '0'))
        .reduce((a, b) => {
            return a + b
        }, 0)
}

import StoreProductData from './StoreProductData'

const storeProductData = new StoreProductData()

class StoreProductDM {
    public async getStoreProduct(condition: string[]) {
        return await storeProductData.getStoreProduct(condition)
    }
}

export default StoreProductDM

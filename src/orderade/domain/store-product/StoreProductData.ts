import BaseInstance from '../../../common/BaseInstance'
import { SoupNames } from '../../enum/SoupNames'

class StoreProductData {
    public async getStoreProduct(condition: string[]) {
        return await BaseInstance.sfSoupEngine.retrieve(SoupNames.StoreProduct, [], undefined, condition)
    }
}

export default StoreProductData

/*
 * @Description:
 * @LastEditors: Yi Li
 */

/**
 * @description Innovation Metrics Queries.
 * @author Qiulin Deng
 * @email qiulin.deng@pwc.com
 * @date 2022-05-03
 */

import { getRetailStoreQuery } from '../helper/rep/InnovationProductHelper'

const InnovationMetricsQueries = {
    getAllStoreProduct: {
        q:
            ' AND {StoreProduct:RetailStoreId} IN ' +
            '(SELECT {RetailStore:Id} FROM {RetailStore} ' +
            getRetailStoreQuery()
    },
    getOrderItem: {
        q:
            'AND {OrderItem:Order.RetailStore__c} IN ' +
            '(SELECT {RetailStore:Id} FROM {RetailStore} ' +
            getRetailStoreQuery()
    }
}

export default InnovationMetricsQueries

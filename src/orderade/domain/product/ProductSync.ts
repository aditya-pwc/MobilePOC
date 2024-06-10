import _ from 'lodash'
import BaseInstance from '../../../common/BaseInstance'
import { RecordTypeEnum } from '../../../savvy/enums/RecordType'
import { batchSynDown, syncDownCSV } from '../../utils/CommonUtil'
import { StoreProduct } from '../../interface/StoreProduct'
import { Log } from '../../../common/enums/Log'
import { storeClassLog } from '../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { ProductListingConstant } from '../../enum/Common'
import { CommonParam } from '../../../common/CommonParam'

class ProductSync {
    public async syncUpStoreProductsByFieldList(storeProductsToSync: StoreProduct[]) {
        try {
            return await this.removeStoreProductByUniqId(storeProductsToSync)
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'orderade: syncUpStoreProductsByFieldList', ErrorUtils.error2String(error))
        }
    }

    private async removeStoreProductByUniqId(storeProductsToSync: any[]) {
        try {
            const spSyncFields = BaseInstance.sfSoupEngine.getSoupFieldList('StoreProduct', 'Remote')
            const storeProductUniqueIds = _.uniq(storeProductsToSync.map((sp) => sp.AP_Unique_ID__c))
            const remoteStoreProductRes = await batchSynDown(storeProductUniqueIds, {
                name: 'StoreProduct',
                whereClause: `AP_Unique_ID__c IN {BatchIds} AND RecordType.DeveloperName = '${RecordTypeEnum.ACTIVE_PRODUCT}'`,
                updateLocalSoup: false,
                fields: spSyncFields,
                allOrNone: true
            })
            const remoteStoreProductsMap = (remoteStoreProductRes.flat() || []).reduce((a, b) => {
                a[b.AP_Unique_ID__c] = b.Id
                return a
            }, {})
            const storeProductsToPost = storeProductsToSync.filter((one) => {
                return !remoteStoreProductsMap[one.AP_Unique_ID__c]
            })
            const storeProductsToPatch = storeProductsToSync
                .filter((one) => {
                    return remoteStoreProductsMap[one.AP_Unique_ID__c]
                })
                .map((one) => {
                    return {
                        ...one,
                        Id: remoteStoreProductsMap[one.AP_Unique_ID__c]
                    }
                })
            // if a record don't have sf id, and it has sf id on sf remote
            // that record will be synced up using patch and will be written back with upsertWithSFId
            // which means initial local record with no sf id will not be deleted, need to check for these
            const dupApUniqIds = storeProductsToSync
                .filter((one) => {
                    return !one.Id && remoteStoreProductsMap[one.AP_Unique_ID__c]
                })
                .map((one) => one.AP_Unique_ID__c)
            storeProductsToPost.length &&
                (await BaseInstance.sfSyncEngine.syncUp({
                    name: 'StoreProduct',
                    records: storeProductsToPost,
                    type: 'POST',
                    queryLatestData: true
                }))
            storeProductsToPatch.length &&
                (await BaseInstance.sfSyncEngine.syncUp({
                    name: 'StoreProduct',
                    records: storeProductsToPatch,
                    type: 'PATCH',
                    queryLatestData: true
                }))
            return dupApUniqIds
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'orderade: removeStoreProductByUniqId', ErrorUtils.error2String(error))
        }
    }

    public async syncDownProductListDataByAPI(fields: string[], extraCondition = '', updateLocalSoup = true) {
        try {
            let condition = `Level__c = '${ProductListingConstant.PL_LEVEL}' AND Level_Value__c = '${CommonParam.userLocationId}'`
            if (extraCondition) {
                condition = `${condition} AND ${extraCondition}`
            }
            return await BaseInstance.sfSyncEngine.syncDown({
                name: 'Product_Listing__c',
                whereClause: condition,
                updateLocalSoup: updateLocalSoup,
                fields: fields,
                allOrNone: true
            })
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'syncDownProductListData',
                'syncDownProductListData failed' + ErrorUtils.error2String(e)
            )
            return []
        }
    }

    public async syncDownProductListDataByCSV(locationId: string) {
        return syncDownCSV({
            objName: 'Product_Listing__c',
            linkQuery: `LinkedEntityId = '${locationId}' 
                AND ContentDocument.FileType = 'CSV'
                AND ContentDocument.LatestPublishedVersion.ExternalDocumentInfo1 = 'Product Listing File'`,
            logInfo: `location: ${CommonParam.userLocationName}`,
            mapFunc: (el: string) => {
                // eslint-disable-next-line camelcase
                const [Id, Level_Value__c, Inven_Id__c, Inven_Avail_Flag__c] = el.split(',')
                // each data cell is padded with ' at the start
                return {
                    Id: Id.slice(1),
                    Level_Value__c: Level_Value__c.slice(1),
                    Inven_Id__c: Inven_Id__c.slice(1),
                    Inven_Avail_Flag__c: Inven_Avail_Flag__c.slice(1)
                }
            }
        })
    }

    public static async syncDownProductAndMarkAvailFlag(materialUniqIds: any[], productSyncFields: string[]) {
        await batchSynDown(materialUniqIds, {
            name: 'Product2',
            whereClause: `Material_Unique_ID__c IN 
                {BatchIds}
                AND IsActive = TRUE`,
            updateLocalSoup: true,
            fields: productSyncFields,
            allOrNone: true
        })
    }

    public async syncDownProductExclusionByAPI(routeAccountCustIds: string[]) {
        const productExclusionFields = BaseInstance.sfSoupEngine.getSoupFieldList('Product_Exclusion__c', 'Remote')
        return batchSynDown(routeAccountCustIds, {
            name: 'Product_Exclusion__c',
            whereClause: `Target_Value__c IN {BatchIds} AND Is_Active__c = TRUE`,
            updateLocalSoup: true,
            fields: productExclusionFields,
            allOrNone: true
        })
    }

    public async syncDownProductExclusionByCSV() {
        return syncDownCSV({
            objName: 'Product_Exclusion__c',
            linkQuery: `LinkedEntityId = '${CommonParam.userRouteId}' 
                    AND ContentDocument.FileType = 'CSV'
                    AND ContentDocument.LatestPublishedVersion.ExternalDocumentInfo1 = 'Product Exclusion File'`,
            logInfo: `route: ${CommonParam.userRouteGTMUId}`,
            mapFunc: (el: string) => {
                // eslint-disable-next-line camelcase
                const [Id, Target_Value__c, Inven_Id__c] = el.split(',')
                // each data cell is padded with ' at the start
                return {
                    Id: Id.slice(1),
                    Target_Value__c: Target_Value__c.slice(1),
                    Inven_Id__c: Inven_Id__c.slice(1)
                }
            }
        })
    }
}
export default ProductSync

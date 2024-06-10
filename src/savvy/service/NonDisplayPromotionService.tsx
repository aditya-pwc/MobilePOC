/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-08-18 17:20:35
 * @LastEditTime: 2022-12-12 18:58:42
 * @LastEditors: Mary Qian
 */

import _ from 'lodash'
import { syncDownObjByIdsAndClause } from '../api/SyncUtils'
import { CommonParam } from '../../common/CommonParam'
import { t } from '../../common/i18n/t'
import { formatWithTimeZone } from '../utils/TimeZoneUtils'
import InStoreMapDataService from './InStoreMapDataService'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { exeAsyncFunc } from '../../common/utils/CommonUtils'

const syncDownPromotionForNonDisplayPromotion = () => {
    const accountIdList = CommonParam.uniqueAccountIds
    if (accountIdList.length < 1) {
        return { data: [] }
    }

    const fields = CommonParam.objs.find((soup) => soup.name === 'Promotion').fieldList.map((i) => i.name)
    // 938 items will be 414 error: URL too long. length is 19850
    return syncDownObjByIdsAndClause(
        'Promotion',
        fields,
        accountIdList,
        false,
        true,
        'Active_Status__c = true ',
        'Cust_ID__c'
    )
}

const syncDownPromotionProductForNonDisplayPromotion = (promotionIdArray: string[]) => {
    const fields = CommonParam.objs.find((soup) => soup.name === 'PromotionProduct').fieldList.map((i) => i.name)
    return syncDownObjByIdsAndClause(
        'PromotionProduct',
        fields,
        promotionIdArray,
        false,
        true,
        'Active_Status__c = true ',
        'PromotionId'
    )
}

const syncDownNonDisplayPromotionData = async () => {
    await exeAsyncFunc(async () => {
        const promotionRes: any = await syncDownPromotionForNonDisplayPromotion()

        if (promotionRes?.length > 0) {
            const promotionIdArray = promotionRes.map((item) => `${item.Id}`)
            await syncDownPromotionProductForNonDisplayPromotion(promotionIdArray)
        }
    }, 'syncDownNonDisplayPromotionData')
}

const formatPromotionDate = (date) => {
    if (!date) {
        return '-'
    }

    return formatWithTimeZone(date, TIME_FORMAT.MMM_DD_YYYY, true)
}

const getPriceText = (priceArray: string[]) => {
    const newPriceList = _.uniq(priceArray)

    let priceText
    if (!newPriceList || newPriceList.length === 0) {
        priceText = '-'
    } else if (newPriceList.length === 1) {
        priceText = newPriceList[0]
    } else {
        priceText = t.labels.PBNA_MOBILE_Multi
    }

    return priceText
}

const getAllData = async (accountId: string, isOnline: boolean) => {
    const result = []
    await exeAsyncFunc(async () => {
        const promotionRes = await InStoreMapDataService.getNonDisplayPromotionsByCustomerId(accountId, isOnline)

        const promotionData = []
        for (const promotion of promotionRes) {
            promotion.products = await InStoreMapDataService.getPromotionProductsByPromotionIdArray(
                [promotion.Id],
                isOnline
            )
            promotionData.push(promotion)
        }

        for (const item of promotionData) {
            const { products } = item

            const groupedProducts = _.groupBy(products, 'Package_Type_Name__c')

            const finalProducts = []

            const promotionPriceArray = []

            Object.keys(groupedProducts).forEach((key) => {
                const products = groupedProducts[key]

                const tempPriceArray = []

                products.forEach((i) => {
                    i.name = i.Sub_Brand__c || '-'
                    let priceText
                    const price = parseFloat(i.Retail_Price__c).toFixed(2)
                    if (parseInt(i.Retail_Quantity__c) === 1) {
                        priceText = `$ ${price}`
                    } else {
                        priceText = `${parseInt(i.Retail_Quantity__c)} for $ ${price}`
                    }

                    i.priceText = priceText
                    tempPriceArray.push(`$ ${price}`)
                })

                const priceRange = getPriceText(tempPriceArray)
                promotionPriceArray.push(priceRange)

                finalProducts.push({
                    packageInfo: {
                        name: key,
                        price: priceRange
                    },
                    brandArray: products
                })
            })

            const startDate = formatPromotionDate(item.StartDate)
            const endDate = formatPromotionDate(item.EndDate)
            const deliveryDate = formatPromotionDate(item.First_Delivery_Date__c)

            const promotionInfo = {
                name: item.Name,
                priceText: getPriceText(promotionPriceArray),
                startDate,
                endDate,
                deliveryDate
            }

            result.push({
                promotionInfo,
                isExpand: false,
                products: finalProducts
            })
        }
    }, 'getAllData')

    return result
}

export const NonDisplayPromotionService = {
    syncDownNonDisplayPromotionData,
    getAllData
}

export default NonDisplayPromotionService

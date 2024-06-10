/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-08-24 05:16:16
 * @LastEditTime: 2022-11-27 12:05:36
 * @LastEditors: Mary Qian
 */
import _ from 'lodash'

const productPackage = (isPromotion: boolean) => {
    return isPromotion ? 'Package_Name__c' : 'Packaging__c'
}

export const formatProductData = (text: string, isNumber = false) => {
    if (typeof text === 'number') {
        return text
    }
    if (text?.length > 0) {
        return isNumber ? parseInt(text) : text
    }

    return '-'
}

export const transformToPackage = (element: Array<any>, isPromotion = false) => {
    if (element.length <= 0) {
        return { flavorList: [] }
    }
    const first = element[0]
    const flavors = element.map((item) => {
        let pro = {
            id: item.Id,
            name: formatProductData(item.Sub_Brand__c),
            DISPLAY_QUANTITY__c: formatProductData(item.Display_Quantity__c, true),
            isPromotion
        }

        if (isPromotion) {
            let price = '-'
            if (item.Retail_Price__c) {
                price = `$ ${Number(item.Retail_Price__c).toFixed(2)}`
            }
            pro = Object.assign(pro, {
                RET_QUANTITY__c: formatProductData(item.Retail_Quantity__c, true),
                RET_PRICE__c: price
            })
        }
        return pro
    })
    const packageNameProperty = productPackage(isPromotion)
    return {
        PACKAGING__c: formatProductData(first[packageNameProperty]),
        flavorList: flavors
    }
}

export const transformProducts = (products: Array<any>, isPromotion: boolean) => {
    const result = []
    const packageNameProperty = productPackage(isPromotion)
    const packageNullPackages = products.filter((item) => item[packageNameProperty] == null)
    const packageNotNullPackages = products.filter((item) => item[packageNameProperty] != null)

    const groupedProducts = _.groupBy(packageNotNullPackages, packageNameProperty)

    for (const packageName in groupedProducts) {
        if (Object.prototype.hasOwnProperty.call(groupedProducts, packageName)) {
            result.push(transformToPackage(groupedProducts[packageName], isPromotion))
        }
    }

    if (packageNullPackages.length > 0) {
        result.push(transformToPackage(packageNullPackages, isPromotion))
    }
    return result
}

import _ from 'lodash'
import { formatPrice000 } from './CommonUtil'

const calculateRowTotal = (cases: any, units: any, caseCount: any, unitPrice: any) => {
    if (caseCount && Number(caseCount) > 0) {
        return formatPrice000((Number(cases) + Number(units) / Number(caseCount)) * Number(unitPrice))
    }
    return formatPrice000(Number(cases) * Number(unitPrice))
}

export const calculateTotal = (product: any) => {
    product.breakageTotal = calculateRowTotal(
        product.breakageCases || 0,
        product.breakageUnits || 0,
        product.Config_Qty__c,
        product.unitPrice || 0
    )

    product.outOfDateTotal = calculateRowTotal(
        product.outOfDateCases || 0,
        product.outOfDateUnits || 0,
        product.Config_Qty__c,
        product.unitPrice || 0
    )
    product.saleableTotal = calculateRowTotal(
        product.saleableCases || 0,
        product.saleableUnits || 0,
        product.Config_Qty__c,
        product.unitPrice || 0
    )
}

export const useCalculateTotal = (productList: any, isOrderSummary?: boolean) => {
    if (productList && productList.length > 0) {
        const needCalculateList = isOrderSummary ? productList : productList.filter((item: any) => item.isActive)
        const productWithItemList = needCalculateList.filter((item: any) => {
            return item.products && item.products.length > 0
        })
        const prepareToCalculateList = productWithItemList.filter((item: any) => {
            return item.products.filter((product: any) => {
                return (
                    Number(product.unitPrice || 0) !== 0 ||
                    Number(product.breakageCases || 0) !== 0 ||
                    Number(product.breakageUnits || 0) !== 0 ||
                    Number(product.outOfDateCases || 0) !== 0 ||
                    Number(product.outOfDateUnits || 0) !== 0 ||
                    Number(product.saleableCases || 0) !== 0 ||
                    Number(product.saleableUnits || 0) !== 0 ||
                    Number(product.Config_Qty__c || 0) !== 0
                )
            })
        })
        prepareToCalculateList.forEach((item: any) => {
            if (item && item.products) {
                item.products.forEach((product: any) => {
                    calculateTotal(product)
                })
                item.packageCases = _.sumBy(item.products, function (a: any) {
                    return Number(a.breakageCases || 0) + Number(a.outOfDateCases || 0) + Number(a.saleableCases || 0)
                })
                item.packageUnits = _.sumBy(item.products, function (a: any) {
                    return Number(a.breakageUnits || 0) + Number(a.outOfDateUnits || 0) + Number(a.saleableUnits || 0)
                })
            }
        })
    }
    return productList
}

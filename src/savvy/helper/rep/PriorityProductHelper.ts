import React from 'react'
import _ from 'lodash'
import { getIdClause } from '../../../common/utils/CommonUtils'
import { syncDownObj, syncDownObjWithIds } from '../../api/SyncUtils'
import AsyncStorage from '@react-native-async-storage/async-storage'
export const isCelsiusPriority = (priority?: any) => priority?.Priority_Type_Other__c === 'Celsius Sold'

export const syncCelsiusPriorityProducts = async (
    attributeList: any[],
    retailStoreLocProdId: string,
    setIsFetchingProducts: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const uniqIds = attributeList.map((item) => item.Inven)
    setIsFetchingProducts(true)
    const productCodeQuery = `SELECT ProductCode, Material_Unique_ID__c FROM Product2 WHERE Material_Unique_ID__c IN (${getIdClause(
        uniqIds
    )})`
    const productListingQuery = `SELECT Inven_Id__c FROM Product_Listing__c WHERE Inven_Avail_Flag__c = TRUE AND Level__c = 'Location' AND Level_Value__c = '${retailStoreLocProdId}'`
    const productListingResult = await syncDownObj('Product_Listing__c', encodeURIComponent(productListingQuery), false)
    const productListingData = productListingResult?.data.map((dataItem) => dataItem.Inven_Id__c) || []

    const needAuthProducts: any[] = JSON.parse(
        ((await AsyncStorage.getItem('NeedAuthProducts')) as any) || JSON.stringify([])
    )

    const productCodeResult = await syncDownObj('Product2', productCodeQuery, false)
    const productCodeData =
        productCodeResult?.data.map((dataItem) => {
            attributeList = attributeList.map((attrItem) => {
                if (attrItem?.Inven === dataItem.Material_Unique_ID__c) {
                    attrItem.ProductCode = dataItem.ProductCode
                }
                return attrItem
            })
            return dataItem.ProductCode
        }) || []
    const celsiusProductList = await syncDownObjWithIds(
        'Product2',
        ['Id', 'Sub_Brand__c', 'Package_Type_Name__c', 'ProductCode', 'Material_Unique_ID__c', 'IsActive'],
        productCodeData,
        true,
        false,
        '',
        'ProductCode'
    )

    const groupByProducts = _.groupBy(celsiusProductList, 'ProductCode')
    const productList = Object.values(groupByProducts)
        .map((group) => {
            // filter active data for every UPC group
            const activeData = _.sortBy(
                _.filter(group, (item) => item.IsActive),
                'Material_Unique_ID__c'
            )
            if (!activeData.length) {
                return []
            }
            // filter data in Listing and not Excluded
            const matchedData = _.filter(activeData, (item) => {
                return (
                    productListingData.includes(item.Material_Unique_ID__c) &&
                    !needAuthProducts.includes(item.Material_Unique_ID__c)
                )
            })
            // if not, check Listing and then check Excluded
            if (!matchedData.length) {
                const inListingData = _.filter(activeData, (item) =>
                    productListingData.includes(item.Material_Unique_ID__c)
                )
                if (inListingData.length) {
                    return [inListingData[0]]
                }
                activeData[0].isOffInWhse = true
                const noNeedsAuthData = _.filter(
                    activeData,
                    (item) => !needAuthProducts.includes(item.Material_Unique_ID__c)
                )
                if (noNeedsAuthData.length) {
                    noNeedsAuthData[0].isOffInWhse = true
                    return [noNeedsAuthData[0]]
                }
                return [activeData[0]]
            }
            // else, return minimal Inven id
            const inListing = _.filter(matchedData, (item) => productListingData.includes(item.Material_Unique_ID__c))
            if (!inListing.length) {
                matchedData[0].isOffInWhse = true
            }
            return [matchedData[0]]
        })
        .flat()

    const result = productList?.map((productItem) => {
        const matchingItem = attributeList.find((item) => item.ProductCode === productItem.ProductCode)
        const productSequence = attributeList.findIndex((item) => item.ProductCode === productItem.ProductCode)
        let formatNum = 0
        if (matchingItem) {
            formatNum = _.isNaN(Number(matchingItem.Qty)) ? 0 : Number(matchingItem.Qty)
        }
        return {
            ...productItem,
            quantity: formatNum,
            productSequence: productSequence,
            PresoldQty: formatNum,
            isNeedsAuth: needAuthProducts?.includes(productItem.Material_Unique_ID__c)
        }
    })
    setIsFetchingProducts(false)
    return result || []
}

export const syncOrderItemsByStorePriorityId = async (storePriorityId?: string) => {
    let orders: { id: string }[] = []
    let orderItems: {
        id: string
        orderId: string
        order: {
            effectiveDate: string
        }
        product2Id: string
        productSequence: number
        quantity: number
        product: {
            name: string
            subBrand: string
            packageGroupName: string
            productCode: string
            materialUniqueId: string
        }
        createdById: string
        createdBy: {
            id: string
            name: string
        }
    }[] = []

    if (storePriorityId) {
        const ordersRes = await syncDownObj(
            'Order',
            `SELECT Id FROM Order WHERE StorePriority__c = '${storePriorityId}' AND IsDeleted = FALSE`,
            false
        )

        if (ordersRes?.data?.length > 0) {
            orders = ordersRes.data.map((order) => {
                return { id: order.Id }
            })

            const orderItemsRes = await syncDownObj(
                'OrderItem',
                `SELECT Id, OrderId, Order.EffectiveDate, Product2Id, Product2.Name, Product2.Sub_Brand__c, Product2.Package_Group_Name__c,
                 Product2.ProductCode, Product2.Material_Unique_ID__c, ProductSequence__c, Quantity,
                 CreatedById, CreatedBy.Name
                 FROM OrderItem WHERE OrderId IN (${getIdClause(orders.map((order) => order.id))})`,
                false
            )

            if (orderItemsRes?.data?.length > 0) {
                orderItems = orderItemsRes?.data?.map((orderItem) => {
                    return {
                        id: orderItem.Id,
                        orderId: orderItem.OrderId,
                        order: {
                            effectiveDate: orderItem.Order.EffectiveDate
                        },
                        product2Id: orderItem.Product2Id,
                        productSequence: orderItem.ProductSequence__c,
                        quantity: orderItem.Quantity,
                        product: {
                            id: orderItem.Product2Id,
                            name: orderItem.Product2.Name,
                            subBrand: orderItem.Product2.Sub_Brand__c,
                            packageGroupName: orderItem.Product2.Package_Group_Name__c,
                            productCode: orderItem.Product2.ProductCode,
                            materialUniqueId: orderItem.Product2.Material_Unique_ID__c
                        },
                        createdById: orderItem.CreatedById,
                        createdBy: {
                            id: orderItem.CreatedById,
                            name: orderItem.CreatedBy.Name
                        }
                    }
                })
            }
        }
    }

    return { orders, orderItems }
}

// call api to fetch Product Attribute details (sub items and cart info)
export const syncProductAttributeDetails = async (storePriorityId: string, paItems: any[]) => {
    const res = paItems
    const productSequences = Array.from(new Array(paItems.length), (_, index) => index)

    // calculation for summary
    if (productSequences?.length > 0) {
        // query orderItems, product2 and owner info
        const { orderItems } = await syncOrderItemsByStorePriorityId(storePriorityId)

        type PaItem = {
            [key: string]: any
            _pushedQty: number
            _pushedProducts: {
                [key: string]: any
                _pushedOrderItems: any[]
            }[]
        }

        // index as sequence number that is used in OrderItem.ProductSequence__c
        orderItems.forEach((orderItem) => {
            const paItem: PaItem = res[orderItem.productSequence]
            if (paItem) {
                // get summary for pa item
                paItem._pushedQty = (paItem._pushedQty || 0) + Number(orderItem.quantity)

                // find the product of cartItem is matching with
                const existedPushedProduct = (paItem._pushedProducts || []).find(
                    (item: any) =>
                        item.productCode === orderItem.product.productCode &&
                        item.materialUniqueId === orderItem.product.materialUniqueId
                )
                // add the cartItem into the cart item list of the pa[i].product[j] it is matching with
                if (existedPushedProduct) {
                    existedPushedProduct._pushedOrderItems.push(orderItem)
                    // sorting
                    existedPushedProduct._pushedOrderItems.sort((a, b) => {
                        return new Date(a.order?.effectiveDate).valueOf() - new Date(b.order?.effectiveDate).valueOf()
                    })
                } else {
                    // or as the first one in the cart item list of the pa[i].product[j]
                    paItem._pushedProducts = [
                        ...(paItem._pushedProducts || []),
                        {
                            ...orderItem.product,
                            _pushedOrderItems: [orderItem]
                        }
                    ]
                }
            }
        })
    }

    return res
}

// intelligently get the english name of month by part of it
export const intelGetMonthName = (partialMonthText: string): string => {
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ] as const
    const searchMonth = months.findIndex((monthText) => new RegExp(`^${partialMonthText}`, 'i').test(monthText))

    return searchMonth !== -1 ? String(searchMonth + 1).padStart(2, '0') : ''
}

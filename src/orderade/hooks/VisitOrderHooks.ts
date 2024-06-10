/*
 * @Author: Tom tong.jiang@pwc.com
 * @Date: 2023-06-22 02:19:33
 * @LastEditors: Tom tong.jiang@pwc.com
 * @LastEditTime: 2024-02-20 09:21:51
 */
// eslint disable reason: Keep object variable naming consistent with Salesforce.
/* eslint-disable camelcase */
import { useEffect, useState } from 'react'
import { Order } from '../interface/Order'
import { MyDayVisitModel } from '../interface/MyDayVisit'
import { OrderLineActivityCde } from '../enum/Common'
import _ from 'lodash'
import OrderService from '../service/OrderService'

export type OrderWithReturnOnly = Partial<Order> & {
    returnOnly: boolean
    ord_lne_actvy_cde__c: string
    index: number
    vDelDate?: string
}

export const useOrderData = (visit: MyDayVisitModel, isAdhoc: boolean, isFocused: boolean) => {
    const [orderData, setOrderData] = useState<Array<Partial<OrderWithReturnOnly>>>([])
    const fetchOrderData = async () => {
        let order: Array<Partial<OrderWithReturnOnly>> = await OrderService.getAllVisitRelatedOrderData(
            visit.Id,
            visit._soupEntryId
        )
        let returnIndex = 0
        let onGoingIndex = 0
        order?.forEach((item) => {
            if (item.ord_lne_actvy_cde__c === OrderLineActivityCde.DELIVERY) {
                item.returnOnly = false
                item.index = onGoingIndex
                onGoingIndex++
            } else {
                item.returnOnly = true
                item.index = returnIndex
                returnIndex++
            }
        })
        if (!isAdhoc) {
            const isOnlyHaveReturnOrder = order.filter((item) => !item.returnOnly)
            const firstOrder: Array<Partial<OrderWithReturnOnly>> = []
            if (_.isEmpty(isOnlyHaveReturnOrder) || _.isEmpty(order)) {
                const defaultTileInfo = visit.VDelGroup.map((item, index) => {
                    return {
                        index: index,
                        vDelDate: item
                    }
                })
                order.unshift(...defaultTileInfo)
            } else {
                const cloneOrder = _.cloneDeep(order)
                cloneOrder.forEach((item) => {
                    if (!item.returnOnly && firstOrder.length < visit.VDelGroup.length) {
                        firstOrder.push(item)
                    }
                })
                const defaultTileInfo: any = []
                if (firstOrder.length < visit.VDelGroup.length) {
                    visit.VDelGroup.forEach((item, index) => {
                        index > firstOrder.length - 1 && defaultTileInfo.push({ index: index, vDelDate: item })
                    })
                }
                order = order.filter((item2) => !firstOrder.some((item1) => item1.Id === item2.Id))
                order.unshift(...firstOrder, ...defaultTileInfo)
            }
        }

        // Since there will always be an inprogress local order for planned visit
        // We push an empty order on the top array each time unless it is adhoc
        setOrderData(order)
    }

    useEffect(() => {
        fetchOrderData()
    }, [isFocused, visit])

    return { orderData }
}

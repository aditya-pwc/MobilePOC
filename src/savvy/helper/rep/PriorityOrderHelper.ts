import { HttpStatusCode } from 'axios'
import { CommonParam } from '../../../common/CommonParam'
import { isPersonaPSR } from '../../../common/enums/Persona'
import { compositeCommonCall, syncDownObj } from '../../api/SyncUtils'
import { ATCStatus, OrderATCType, OrderStatus, PushType } from '../../enums/ATCRecordTypes'
import { calculateEDT } from './InnovationProductHelper'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import BaseInstance from '../../../common/BaseInstance'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'

export const syncDownStorePriorities = async (retailStoreId: string) => {
    const storePriorityFields = BaseInstance.sfSoupEngine.getSoupFieldList('StorePriority__c', 'Remote')
    try {
        await BaseInstance.sfSyncEngine.syncDown({
            name: 'StorePriority__c',
            whereClause: `RetailStoreId__c = '${retailStoreId}'`,
            updateLocalSoup: true,
            fields: storePriorityFields,
            allOrNone: true
        })
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, 'PriorityOrderHelper::syncDownStorePriorities', ErrorUtils.error2String(e))
    }
}

export const createPriorityOrderAndItem = async ({
    retailStore,
    products,
    startDate,
    endDate,
    storePriorityId,
    priorityTitle,
    isCelsiusPriority
}: {
    retailStore: any
    products: { [key: string]: any; id: string; quantity: number; productSequence: number; productCode: string }[]
    startDate: string
    endDate: string
    storePriorityId: string
    priorityTitle: string
    isCelsiusPriority: boolean
}) => {
    if (!products.length) {
        throw new Error('No Product Selected')
    }
    const rootQuery = `/services/data/${CommonParam.apiVersion}/`
    const orderPostURL = 'sobjects/Order'
    const orderItemPostURL = 'sobjects/OrderItem'

    const { userName, userInfo = { LastName: '', FirstName: '' } } = CommonParam
    const lastName = userInfo.LastName || userName
    const firstName = userInfo.FirstName || ''

    let orderName = `Savvy-${priorityTitle.slice(0, 20)}-${lastName.slice(0, 8)}`
    if (isCelsiusPriority) {
        orderName = `SAVVY-CelsiusSold-${firstName} ${lastName}`.slice(0, 35)
    }

    const orderItemReqs: any[] = []

    const priceBookQuery = `SELECT Id FROM Pricebook2 WHERE Name = 'Standard Price Book'`
    const priceBookResult = await syncDownObj('Pricebook2', priceBookQuery, false)

    products.forEach((product) => {
        const priceBookQuery =
            'query/?q=SELECT Id, Product2Id, Pricebook2Id FROM' +
            ` PricebookEntry WHERE Product2Id = '${product.id}' AND` +
            " Pricebook2.Name = 'Standard Price Book'"

        const insertOrderReq = {
            method: 'POST',
            url: `${rootQuery}${orderPostURL}`,
            referenceId: `newPriorityOrderRef${product.id}`,
            body: {
                EffectiveDate: startDate,
                EndDate: endDate,
                AccountId: retailStore.AccountId,
                RetailStore__c: retailStore.Id,
                ATC_Status__c: ATCStatus.PUSH_ACTIVE,
                Push_to_Smartr_Date__c: calculateEDT(startDate),
                Status: OrderStatus.DRAFT,
                Order_ATC_Type__c: OrderATCType.PRODUCT_PUSH,
                Push_Type__c: PushType.CORE_SALES_AGENDA,
                Name: orderName,
                Pricebook2Id: priceBookResult.data[0].Id,
                StorePriority__c: storePriorityId
            } as any
        }

        if (isPersonaPSR()) {
            insertOrderReq.body.RTE_ID__c = CommonParam.userRouteId
        }

        const getPriceBookEntryReq = {
            method: 'GET',
            url: `${rootQuery}${priceBookQuery}`,
            referenceId: `pricebookRef${product.id}`
        }

        const insertOrderItemReq = {
            method: 'POST',
            url: `${rootQuery}${orderItemPostURL}`,
            referenceId: `newPriorityOrderItem${product.id}`,
            body: {
                OrderId: `@{newPriorityOrderRef${product.id}.id}`,
                Product2Id: product.id,
                Quantity: product.quantity,
                ProductSequence__c: product.productSequence,
                UnitPrice: 0,
                PriceBookEntryId: `@{pricebookRef${product.id}.records[0].Id}`
            }
        }

        orderItemReqs.push(getPriceBookEntryReq, insertOrderReq, insertOrderItemReq)
    })

    const updateStorePriorityObj = {
        method: 'PATCH',
        url: `/services/data/${CommonParam.apiVersion}/sobjects/StorePriority__c/${storePriorityId}`,
        referenceId: 'refStorePriority',
        body: {
            AddedToCart__c: true
        }
    }

    // Up to 5 of these subrequests can be sObject Collections or query operations, including Query and QueryAll requests
    const splitCalls = []
    for (let i = 0; i < orderItemReqs.length; i += 3) {
        splitCalls.push(orderItemReqs.slice(i, i + 3))
    }
    for (const request of splitCalls) {
        const res = await compositeCommonCall([...request])
        if (![HttpStatusCode.Ok, HttpStatusCode.Created].includes(res.data.compositeResponse[1].httpStatusCode)) {
            throw new Error(ErrorUtils.error2String(res))
        }
    }

    const updateStorePriorityResult = await compositeCommonCall([updateStorePriorityObj])
    if (
        ![HttpStatusCode.Ok, HttpStatusCode.NoContent].includes(
            updateStorePriorityResult.data.compositeResponse[0].httpStatusCode
        )
    ) {
        throw new Error(ErrorUtils.error2String(updateStorePriorityResult))
    }
}

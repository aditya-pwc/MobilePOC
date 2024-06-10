import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import { StatusCode } from 'common-mobile-lib/@common-mobile-lib/sf-http-client/src/StatusCode'
import { pushOrderToOCH } from '../api/OCHService'
import { Order } from '../interface/Order'
import { OrderItem } from '../interface/OrderItem'
import moment from 'moment'
import _ from 'lodash'
import { CommonParam } from '../../common/CommonParam'
import { AxiosResponse } from 'axios'
import { todayDateWithTimeZone } from '../../savvy/utils/TimeZoneUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { OrderLineActivityCde } from '../enum/Common'
import OrderService from '../service/OrderService'
import { CommonLabel } from '../enum/CommonLabel'
import {
    OrderComSourceEnum,
    OrderCustomerPoTypeCode,
    OrderDefaultValue,
    OrderNoteChunk,
    OrderProcessingStatus,
    OrderStateCodeEnum,
    OrderSubTypeCode,
    OrderTypeCode
} from '../enum/OrderEnums'

export const round2Digit = (amount: number) => {
    return Math.round(amount * CommonLabel.ONE_HUNDRED_MILLISECONDS) / CommonLabel.ONE_HUNDRED_MILLISECONDS
}

const formatOCHTime = (date?: string) => {
    let outputVal
    if (_.isEmpty(date)) {
        outputVal = moment().utc().format()
    }
    outputVal = moment(date).utc().format()
    return outputVal
}

const generateOchOrder = (orders: Array<Order>, orderItems: Array<OrderItem>) => {
    try {
        return orders.map((o) => {
            const _orderItems = orderItems
                .filter((oi) => {
                    return oi.Order_Unique_Id__c === o.Order_Unique_Id__c
                })
                .sort((a, b) => {
                    return parseInt(a.Sequence__c) - parseInt(b.Sequence__c)
                })
            const noteChunk = OrderNoteChunk.Type254
            // Should use match to find all possible result, exec won't work
            const notes: Array<any> = _.isEmpty(o?.Order_Notes__c)
                ? []
                : (o?.Order_Notes__c.match(new RegExp('.{1,' + noteChunk + '}', 'g')) as RegExpMatchArray)
            const totalTaxAmount = round2Digit(parseFloat(o.Ordr_Tot_Tax_Amt__c))
            return {
                sourceOrderId: o.Order_Unique_Id__c,
                soldToCustomerId: o.ACCOUNT_CUST_UNIQ_ID_VAL__c,
                customerPoId: o.Cust_Po_Id__c,
                requestedDeliveryDateTime: formatOCHTime(o.Dlvry_Rqstd_Dtm__c),
                routeSalesRepWorkForceId: CommonParam.userName,
                totalTaxAmount: totalTaxAmount,
                orderProcessStageCode: OrderStateCodeEnum.OPN,
                sourceSystemId: o.Source_Sys_Id__c,
                createdById: CommonParam.GPID__c,
                modifiedById: CommonParam.GPID__c,
                orderSubTypeCode: OrderSubTypeCode.Type001,
                createdDateTime: formatOCHTime(o.Transaction_Time__c),
                // Not in the chart
                orderLocationId: o.RTE_Region_Code__c,
                routeId: o.Route_Id__c,
                requestedShippingMethod: o.CTR_DELY_MTHD_CDE__c,
                orderTypeCode: OrderTypeCode.Type003,
                recordId: CommonLabel.ZERO,
                customerPoTypeCode: OrderCustomerPoTypeCode.Type003,
                destinationSystemId: 'Sybase',
                orderProcessingStatus: OrderProcessingStatus.Type001,
                extendedAttributesMap: {
                    deleteFlg: OrderDefaultValue.NONE,
                    lockDteTime: formatOCHTime(),
                    timezone: CommonParam.currentLocationTimeZone,
                    stopDayId: o?.VisitId || CommonLabel.ZERO,
                    orderDwnldFlg: OrderDefaultValue.NONE,
                    transactionModified: OrderDefaultValue.NONE
                },
                extendedAttributesList: _.isEmpty(notes)
                    ? notes
                    : notes?.map((note, index) => {
                          return {
                              privateRemarksText: note,
                              ordCmntSeqNum: index + 1,
                              ordCmntBegTime: formatOCHTime(o?.Order_Com_Time__c),
                              ordCmntTypeCode: OrderTypeCode.Type001,
                              ordCmntDeleteFlag: OrderDefaultValue.NONE,
                              ordCmntSrcCode: OrderComSourceEnum.HHC,
                              lockDteTime: formatOCHTime(o.Transaction_Time__c)
                          }
                      }),
                items: _orderItems.map((oi, index) => {
                    const isDEL = oi.Ord_Lne_Actvy_Cde__c === OrderLineActivityCde.DELIVERY
                    return {
                        sourceOrderId: o?.Order_Unique_Id__c,
                        lineMaterialTypeCode: oi.Ord_Lne_Actvy_Cde__c,
                        requestedQty: isDEL ? parseInt(oi.Ordr_Ln_Rqstd_Qty__c) : CommonLabel.MAX_PROD_COUNT,
                        orderLineTypeCode: oi.Order_Line_Type_Code__c,
                        createdDateTime: formatOCHTime(o?.Transaction_Time__c),
                        returnReasonCode: oi.Inven_Cnd_Status_Code__c,
                        materialId: oi.Product_Id__c,
                        // not sure
                        totalGrossAmount: null,
                        totalTaxAmount: null,
                        totalNetAmount: oi.Ordr_Ln_Net_Amt__c,
                        totalDiscountAmount: oi.Order_Line_Discount_Amt__c,
                        sourceOrderLineId: index + 1,
                        extendedItemAttributesMap: {
                            deleteFlg: OrderDefaultValue.NONE,
                            sellInitiativeId: '',
                            selInitiativeQty: null,
                            lockDteTime: formatOCHTime(),
                            everyDayValue: '',
                            onHandyQty: null,
                            requestedQty: !isDEL ? parseFloat(oi.Ordr_Ln_Rqstd_Qty__c) : OrderDefaultValue.ZERO,
                            depositAmt: null
                        },
                        confirmedQtyCase: isDEL ? OrderDefaultValue.ZERO : parseInt(oi.Whole_Cases_Quantity__c),
                        confirmedQtyEa: isDEL ? OrderDefaultValue.ZERO : parseInt(oi.Remainder_Unit_Quantity__c),
                        discountDetails: [
                            {
                                discountTypeCode: oi.Deal_Id__c
                            }
                        ],
                        adjustments: [
                            {
                                reasonCode: '000'
                            }
                        ],
                        requestedQtyUom: oi.Material_UOM_Code_Value__c
                    }
                })
            }
        })
    } catch (e) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'Orderade: generateOchOrder',
            `Generate OCH Request Failed: ${ErrorUtils.error2String(e)}`
        )
        return []
    }
}

interface OrderLogData {
    // eslint disable reason: Keep object variable naming consistent with Salesforce.
    // eslint-disable-next-line camelcase
    Cust_Po_Id__c: string
    statusCode: number
    body: Object | null
    stage: string
}

const updateOrderSoupAndWriteLog = async (orders: Array<any>, ordersRes: any, statusCode: number, stage: string) => {
    if (!orders.length) {
        return
    }
    const ordersToUpdateSentToOchFlag: Array<Order> = []
    let ordersToWriteLog: Array<OrderLogData> = []
    // och could fail with no response body
    // then write logs for all orders
    if (!ordersRes) {
        ordersToWriteLog = orders.map((el) => {
            ordersToUpdateSentToOchFlag.push({
                _soupEntryId: el.SoupEntryId,
                Send_Outbound__c: true,
                OCH_Response_Code__c: `${statusCode}`
            })
            return {
                Cust_Po_Id__c: el.Order_Unique_Id__c,
                statusCode,
                body: null,
                stage
            }
        })
    } else {
        // if och returned something, need to check to each order response
        ordersRes.forEach((el: any) => {
            const statusCode = parseInt(el.statusCode)
            const originalOrder = orders.find((one) => one.Order_Unique_Id__c === el.sourceOrderId) || {}
            if (statusCode === StatusCode.SuccessOK || statusCode === StatusCode.SuccessCreated) {
                ordersToUpdateSentToOchFlag.push({
                    _soupEntryId: originalOrder.SoupEntryId,
                    Send_Outbound__c: false,
                    OCH_Response_Code__c: `${statusCode}`
                })
            } else {
                ordersToUpdateSentToOchFlag.push({
                    _soupEntryId: originalOrder.SoupEntryId,
                    Send_Outbound__c: true,
                    OCH_Response_Code__c: `${statusCode}`
                })
                ordersToWriteLog.push({
                    Cust_Po_Id__c: el.sourceOrderId,
                    statusCode: el.statusCode,
                    body: el,
                    stage
                })
            }
        })
    }
    return {
        ordersToUpdateSentToOchFlag,
        ordersToWriteLog
    }
}

const syncUpOchSingleBatch = async (requestBody: any, orders: Array<Order>) => {
    let result
    try {
        const res: AxiosResponse = await pushOrderToOCH(requestBody)
        storeClassLog(Log.MOBILE_INFO, 'Orderade: syncUpOchSingleBatch', `OCH Success Response: ${res}`)
        // this block should handle nested error code in response body, which is returned from vip
        // 201 from och only means connection is good between savvy and och, doesn't mean a success on vip end
        const { data, status } = res
        const ordersRes = data?.orders || []
        try {
            result = await updateOrderSoupAndWriteLog(orders, ordersRes, status, 'VIP')
        } catch (e) {}
    } catch (e: any) {
        // in this block, och has returned a error status code, with no response body
        // or a connection error nothing went back (code = 'ERR_NETWORK' or something else)
        // we upsert log for all orders associated with this req
        storeClassLog(Log.MOBILE_INFO, 'Orderade: syncUpOchSingleBatch', `OCH Failure Response: ${e}`)
        const { status, code } = e.error
        result = await updateOrderSoupAndWriteLog(orders, null, status || code, 'OCH')
    }
    return result
}

const OCH_MAX_ORDERS_PER_REQUEST = 15

export const syncUpOrdersToOch = async (isPast?: boolean) => {
    try {
        let returnVal: any = []
        // sync up all orders belongs to user, including orders in the past
        // Send_Outbound__c may be null, now when create an order, this value will be default false
        let orders = (await OrderService.getOrderForOCHByUser(CommonParam.GPID__c)) as unknown as Array<Order>
        if (isPast) {
            orders = orders.filter((o) => {
                return o.Transaction_Time__c < todayDateWithTimeZone(true)
            })
        } else {
            orders = orders.filter((o) => {
                return o.Transaction_Time__c >= todayDateWithTimeZone(true)
            })
        }
        // if the och failed, but push to sf succeeded, we associate using OrderId
        const orderIds = orders.map((el) => el.Order_Unique_Id__c)
        if (!orders.length) {
            return
        }
        let orderItems: Array<OrderItem> = []
        if (orderIds.length) {
            const matchField = 'Order_Unique_Id__c'
            const matchIds = orderIds
            const res = (await OrderService.getOrderItemByOrderForOCHRequest(
                matchField,
                matchIds
            )) as unknown as Array<OrderItem>
            orderItems = orderItems.concat(res)
        }
        const ordersChunked = _.chunk(orders, OCH_MAX_ORDERS_PER_REQUEST)
        const OCHReq = generateOchOrder(orders, orderItems)
        const requestBodyAndOrders = ordersChunked.map((orders) => {
            return {
                requestBody: OCHReq,
                orders
            }
        })
        const results = await Promise.all(
            requestBodyAndOrders.map((el) => {
                const { requestBody, orders } = el
                return syncUpOchSingleBatch(requestBody, orders)
            })
        )
        const ordersToUpdateSentToOchFlag = results.map((el) => el?.ordersToUpdateSentToOchFlag || []).flat()
        const ordersToWriteLog = results.map((el) => el?.ordersToWriteLog || []).flat()
        if (ordersToUpdateSentToOchFlag.length) {
            let localOrders = await OrderService.getOrderBySoupEntryId(ordersToUpdateSentToOchFlag)
            localOrders = localOrders.map((o) => {
                const locRecord = ordersToUpdateSentToOchFlag.find(
                    (updatedRecord) => updatedRecord._soupEntryId === o._soupEntryId
                )
                return {
                    ...o,
                    Send_Outbound__c: locRecord?.Send_Outbound__c,
                    OCH_Response_Code__c: locRecord?.OCH_Response_Code__c
                }
            })
            await OrderService.upsertOrderStaging(localOrders as Array<any>)
            returnVal = localOrders.map((o) => {
                return {
                    Order_Unique_Id__c: o.Order_Unique_Id__c,
                    RequestFile: OCHReq.find((OCHOrder) => OCHOrder.sourceOrderId === o.Order_Unique_Id__c),
                    Send_Outbound__c: o.Send_Outbound__c
                }
            })
        }
        await OrderService.syncOchLogs(ordersToWriteLog)
        return returnVal
    } catch (e) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'Orderade: fetchVisitRelatedDataByDate',
            `Fetch visits failed: ${ErrorUtils.error2String(e)}`
        )
    }
}

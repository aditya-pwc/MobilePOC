import BaseInstance from '../../common/BaseInstance'
import { MyDayVisitModel } from '../interface/MyDayVisit'
import OrderDM from '../domain/order/OrderDM'
import AccountDM from '../domain/account/AccountDM'
import React from 'react'
import _ from 'lodash'
import { CommonParam } from '../../common/CommonParam'
import CartDM from '../domain/order/CartDM'
import { t } from '../../common/i18n/t'
import { NavigationProp } from '@react-navigation/native'
import { ReturnOrderSuffix } from '../enum/Common'
import { formatWithTimeZone } from '../../common/utils/TimeZoneUtils'
import moment from 'moment'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { BreadcrumbVisibility, Instrumentation } from '@appdynamics/react-native-agent'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { ReturnCartItem } from '../interface/ReturnProduct'
import { getIdClause } from '../../common/utils/CommonUtils'

export default class CartService {
    static async getCartDetailWithDefaultDeliveryDate(orderCartIdentifier: string, visit: MyDayVisitModel) {
        const cartDetails = await CartDM.getCartDetail(orderCartIdentifier)
        const curDetail = cartDetails[0]
        const [dDate, nDDate] = await OrderDM.getDefaultDeliveryDateForVisit(visit)
        if (!curDetail) {
            const [newCartDetail] = await CartDM.upsertCartDetail({
                UserId: BaseInstance.userAccount.userId,
                RetailStoreId: visit.PlaceId,
                OrderCartIdentifier: orderCartIdentifier,
                DeliveryDate: dDate as string,
                NextDeliveryDate: nDDate as string
            })
            return newCartDetail
        } else if (!curDetail.DeliveryDate && dDate) {
            const [newCartDetail] = await CartDM.upsertCartDetail({
                ...curDetail,
                DeliveryDate: dDate as string,
                NextDeliveryDate: nDDate as string
            })
            return newCartDetail
        }
        return curDetail
    }

    public static async retrieveTaxForBCDCustomer(
        accountId: string,
        setTax: React.Dispatch<React.SetStateAction<number>>,
        qty: number,
        total: number
    ) {
        const res = await AccountDM.retrieveBCDTaxRate(accountId)
        if ((Array.isArray(res) && _.isEmpty(res)) || qty === 0) {
            setTax(0)
        } else {
            setTax(res[0]['Account.BCD_Tax_Rate__c'] ? Number(res[0]['Account.BCD_Tax_Rate__c']) * total : 0)
        }
    }

    static getCartItemsOnGoingOnly = CartDM.getCartItemsOnGoingOnly
    static cleanCartItem = CartDM.cleanCartItem
    static getCartItems = CartDM.getCartItems
    static checkCartItemPriceMissing = CartDM.checkCartItemPriceMissing
    static calcTotalForCartItems = CartDM.calcTotalForCartItems
    static checkIsCartDataModified = CartDM.checkIsCartDataModified
    static checkAllReturnCartItem = CartDM.checkAllReturnCartItem
    static removeSingleCartItem = CartDM.removeSingleCartItem
    static getCartItemsWithReturnType = CartDM.getCartItemsWithReturnType

    public static async retrieveCartDataByOrderCartIdentifier(item: any) {
        return await CartDM.retrieveCartDataByOrderCartIdentifier(item)
    }

    public static async retrieveCartItemBySoupEntryId(cartItemSoupEntryId: any) {
        return await CartDM.retrieveCartItemBySoupEntryId(cartItemSoupEntryId)
    }

    public static async upsertSingleCartItemIntoSoup(cartItemRecord: any) {
        return await CartDM.upsertSingleCartItemIntoSoup(cartItemRecord)
    }

    public static async removeCartItemFromSoupBySingleSoupEntryId(cartItemSoupEntryId: string) {
        await CartDM.removeCartItemFromSoupBySingleSoupEntryId(cartItemSoupEntryId)
    }

    public static async handleReturnItems(
        visit: Partial<MyDayVisitModel>,
        setShowAddSuccessModal: Function,
        navigation: NavigationProp<any>,
        returnType: string
    ) {
        try {
            const orderCartIdentifier =
                (visit.OrderCartIdentifier || visit.VisitLegacyId) + ReturnOrderSuffix.ONGOING_ORDER
            if (returnType === t.labels.PBNA_MOBILE_ADD_RETURN_TO_ONGOING_ORDER) {
                const now = Date.now()
                const custPoId = visit.CustUniqId + '_' + CommonParam.GPID__c + '_' + now
                const logMsg = `${
                    CommonParam.GPID__c
                } has clicked Save and Proceed button in Ongoing Return Order page : ${custPoId} at ${formatWithTimeZone(
                    moment(),
                    TIME_FORMAT.YMDTHMS,
                    true,
                    true
                )}`
                Instrumentation.leaveBreadcrumb(logMsg, BreadcrumbVisibility.CRASHES_AND_SESSIONS)
                storeClassLog(Log.MOBILE_INFO, 'orderade:place an ongoing return order', logMsg)
                await CartDM.clearNotApplyReturnItemForReturnPage(orderCartIdentifier)
                await CartDM.saveAddToCartItem(orderCartIdentifier)
                const DELAY_TIME_OUT = 1000
                const DELAY_TIME_OUT2 = 2000
                setTimeout(() => {
                    setShowAddSuccessModal(true)
                    setTimeout(() => {
                        setShowAddSuccessModal(false)
                        navigation.goBack()
                    }, DELAY_TIME_OUT2)
                }, DELAY_TIME_OUT)
            }
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: handleReturnItems',
                `handleReturnItems failed` + ErrorUtils.error2String(e)
            )
        }
    }

    public static async clearNotApplyReturnCart(
        visit: Partial<MyDayVisitModel>,
        originalCartItemsRef: React.MutableRefObject<ReturnCartItem[]>
    ) {
        try {
            const originalCartItems = originalCartItemsRef.current
            const orderCartIdentifier =
                (visit.OrderCartIdentifier || visit.VisitLegacyId) + ReturnOrderSuffix.ONGOING_ORDER
            const originalCartItemsProductIds = originalCartItems.map((cartItem) => cartItem.Product2Id)
            const extraCon =
                originalCartItems.length > 0
                    ? ` AND {CartItem:Product2Id} NOT IN (${getIdClause(originalCartItemsProductIds)})`
                    : ''
            await CartDM.clearNotApplyReturnCart(orderCartIdentifier, extraCon)
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: clearNotApplyReturnCart',
                `clearNotApplyReturnCart failed` + ErrorUtils.error2String(e)
            )
        }
    }

    public static async revertLocalCartData(
        visit: Partial<MyDayVisitModel>,
        originalCartItemsRef: React.MutableRefObject<ReturnCartItem[]>
    ) {
        await CartDM.revertLocalCartData(visit, originalCartItemsRef)
    }
}

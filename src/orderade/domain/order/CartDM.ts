import _ from 'lodash'
import { CartItem } from '../../interface/CartItem'
import CartData from './CartData'
import { ReturnCartItem } from '../../interface/ReturnProduct'
import { isTrueInDB } from '../../../common/utils/CommonUtils'
import { CartDetail } from '../../interface/CartDetail'
import { MyDayVisitModel } from '../../interface/MyDayVisit'
import { PriceIndexType, ReturnOrderSuffix } from '../../enum/Common'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import React from 'react'

const cartData = new CartData()
export default class CartDM {
    static checkCartItemPriceMissing(cartItem: CartItem, isReturn?: boolean) {
        if (!isReturn) {
            return _.toNumber(cartItem.PriceIndex) < 0 && _.toNumber(cartItem.Quantity)
        }
        const hasCases =
            _.toNumber(cartItem.BreakageCases) +
                _.toNumber(cartItem.BreakageUnits) +
                _.toNumber(cartItem.SaleableCases) +
                _.toNumber(cartItem.SaleableUnits) +
                _.toNumber(cartItem.OutOfDateCases) +
                _.toNumber(cartItem.OutOfDateUnits) >
            0
        return hasCases && _.toNumber(cartItem.PriceIndex) === PriceIndexType.UNSELECTED
    }

    static async checkAllReturnCartItem(orderCartIdentifier: string, isReturnOnly: boolean) {
        const cartItems = await CartData.getCartItemsWithReturnType(isReturnOnly, orderCartIdentifier)
        return {
            priceMissing: cartItems.some((cartItem) => {
                return CartDM.checkCartItemPriceMissing(cartItem, true)
            }),
            cartCount: cartItems.length
        }
    }

    /**
     * on return screen, check current soup cartItem with previously stored for change
     *
     * @static
     * @param {string} orderCartIdentifier
     * @param {ReturnCartItem[]} originalCartItems
     * @param {boolean} isReturnOnly
     * @return {*}  {Promise<boolean>}
     * @memberof CartDM
     */
    static async checkIsCartDataModified(
        orderCartIdentifier: string,
        originalCartItems: ReturnCartItem[],
        isReturnOnly: boolean
    ): Promise<boolean> {
        const cartData = (await CartData.getCartItemsWithReturnType(
            isReturnOnly,
            orderCartIdentifier
        )) as unknown as ReturnCartItem[]
        if (originalCartItems?.length) {
            if (cartData.length !== originalCartItems.length) {
                return true
            }

            return cartData.some((cartItem) => {
                const originalCartItem = originalCartItems.find((item) => item.Product2Id === cartItem.Product2Id)
                if (!originalCartItem) {
                    return true
                }
                return (
                    cartItem.BreakageCases !== originalCartItem.BreakageCases ||
                    cartItem.BreakageUnits !== originalCartItem.BreakageUnits ||
                    cartItem.OutOfDateCases !== originalCartItem.OutOfDateCases ||
                    cartItem.OutOfDateUnits !== originalCartItem.OutOfDateUnits ||
                    cartItem.SaleableCases !== originalCartItem.SaleableCases ||
                    cartItem.SaleableUnits !== originalCartItem.SaleableUnits ||
                    cartItem.UnitPrice !== originalCartItem.UnitPrice ||
                    cartItem.ReturnApplied !== originalCartItem.ReturnApplied
                )
            })
        }
        return false
    }

    static calcTotalForCartItems(cartItems: Array<CartItem | any>) {
        let qty = 0
        let returnCs = 0
        let returnUn = 0
        let returnPrice = 0
        let salePrice = 0
        cartItems?.forEach((item) => {
            if (isTrueInDB(item.ReturnApplied)) {
                returnCs =
                    returnCs +
                    parseInt(item.BreakageCases || item.breakageCases || '0') +
                    parseInt(item.OutOfDateCases || item.outOfDateCases || '0') +
                    parseInt(item.SaleableCases || item.saleableCases || '0')
                returnUn =
                    returnUn +
                    parseInt(item.BreakageUnits || item.breakageUnits || '0') +
                    parseInt(item.OutOfDateUnits || item.outOfDateUnits || '0') +
                    parseInt(item.SaleableUnits || item.saleableUnits || '0')
                const caseConvFctr =
                    parseInt(item.Config_Qty__c || item['Product.Config_Qty__c'] || '1') <= 1
                        ? 1
                        : parseInt(item.Config_Qty__c || item['Product.Config_Qty__c'] || '1')
                const totalCs =
                    parseInt(item.BreakageCases || item.breakageCases || '0') +
                    parseInt(item.OutOfDateCases || item.outOfDateCases || '0') +
                    parseInt(item.SaleableCases || item.saleableCases || '0') +
                    (parseInt(item.BreakageUnits || item.breakageUnits || '0') +
                        parseInt(item.OutOfDateUnits || item.outOfDateUnits || '0') +
                        parseInt(item.SaleableUnits || item.saleableUnits || '0')) /
                        caseConvFctr
                returnPrice = returnPrice + totalCs * parseFloat(item.UnitPrice || item.unitPrice || '0')
            } else {
                qty = qty + parseInt(item.Quantity || item.quantity || '0')
                salePrice =
                    salePrice +
                    parseInt(item.Quantity || item.quantity || '0') *
                        parseFloat(item.UnitPrice || item.unitPrice || '0')
            }
        })
        return {
            qty,
            returnCs,
            returnUn,
            returnPrice,
            salePrice
        }
    }

    public async clearCart(orderCartIdentifier: string, isReturnOnly?: boolean) {
        return await cartData.clearCart(orderCartIdentifier, isReturnOnly)
    }

    public async saveCart(cartItems: CartItem[]) {
        await cartData.saveCart(cartItems)
    }

    public async saveProductsToCart(storeId: string, finalProdLst: Array<CartItem>, orderCartIdentifier: string) {
        await cartData.saveProductsToCart(storeId, finalProdLst, orderCartIdentifier)
    }

    public async clearCartDetail(storeId: string) {
        await cartData.clearCartDetail(storeId)
    }

    public async saveCartDetail(storeId: string, cartDetail: CartDetail, orderCartIdentifier: string) {
        await cartData.saveCartDetail(storeId, cartDetail, orderCartIdentifier)
    }

    static getCartItemsOnGoingOnly = CartData.getCartItemsOnGoingOnly
    static getCartDetail = CartData.getCartDetail
    static upsertCartDetail = CartData.upsertCartDetail
    static getRawCartItems = CartData.getRawCartItems
    static getCartItems = CartData.getCartItems
    static removeSingleCartItem = CartData.removeSingleCartItem
    static getCartItemsWithReturnType = CartData.getCartItemsWithReturnType

    // clean unauthorized cartItem not clean all
    static cleanCartItem = CartData.cleanCartItem

    public static async retrieveCartDataByOrderCartIdentifier(item: any) {
        return await CartData.retrieveCartDataByOrderCartIdentifier(item)
    }

    public static async retrieveCartItemBySoupEntryId(cartItemSoupEntryId: any) {
        return await CartData.retrieveCartItemBySoupEntryId(cartItemSoupEntryId)
    }

    public static async upsertSingleCartItemIntoSoup(cartItemRecord: any) {
        const cartItemRecords = [cartItemRecord]
        return await CartData.upsertCartItemIntoSoup(cartItemRecords)
    }

    public static async removeCartItemFromSoupBySingleSoupEntryId(cartItemSoupEntryId: string) {
        const cartItemSoupEntryIds = [cartItemSoupEntryId + '']
        await CartData.removeCartItemFromSoup(cartItemSoupEntryIds)
    }

    public static async clearNotApplyReturnItemForReturnPage(orderCartIdentifier: string) {
        try {
            const cartItemRecord = await CartData.retrieveNotApplyReturnItemForReturnPage(orderCartIdentifier)
            const cartItemSoupEntryIds = cartItemRecord.map((v: any) => v._soupEntryId)
            await CartData.removeCartItemFromSoup(cartItemSoupEntryIds)
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: clearNotApplyReturnItemForReturnPage',
                `clearNotApplyReturnItemForReturnPage failed` + ErrorUtils.error2String(e)
            )
        }
    }

    public static async saveAddToCartItem(orderCartIdentifier: string) {
        try {
            const addToCartRecord = await CartData.retrieveApplyReturnCartItem(orderCartIdentifier)
            addToCartRecord.forEach((record: any) => {
                record.AddToCart = true
            })
            await CartData.upsertCartItemIntoSoup(addToCartRecord)
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: saveAddToCartItem',
                `saveAddToCartItem failed` + ErrorUtils.error2String(e)
            )
        }
    }

    public static async clearNotApplyReturnCart(orderCartIdentifier: string, extraCon: string) {
        try {
            const cartItemRecord = await CartData.retrieveNotApplyReturnCartItem(orderCartIdentifier, extraCon)
            const cartItemSoupEntryIds = cartItemRecord.map((v: any) => v._soupEntryId)
            await CartData.removeCartItemFromSoup(cartItemSoupEntryIds)
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
        try {
            const originalCartItems = originalCartItemsRef.current
            const orderCartIdentifier =
                (visit.OrderCartIdentifier || visit.VisitLegacyId) + ReturnOrderSuffix.ONGOING_ORDER
            const cartItemRecord = await CartData.retrieveCartItemByIdentifier(orderCartIdentifier)
            originalCartItems.forEach((cartItem: any) => {
                const index = cartItemRecord.findIndex((c: any) => c.Product2Id === cartItem.Product2Id)
                if (index === -1) {
                    delete cartItem._soupEntryId
                }
                return cartItem
            })
            await CartData.upsertCartItemIntoSoup(originalCartItems)
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: revertLocalCartData',
                `revertLocalCartData failed` + ErrorUtils.error2String(e)
            )
        }
    }
}

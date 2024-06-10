import _ from 'lodash'
import moment from 'moment'
import { ReturnOrderSuffix } from '../../enum/Common'
import BaseInstance from '../../../common/BaseInstance'
import { CartItem } from '../../interface/CartItem'
import { MyDayVisitModel } from '../../interface/MyDayVisit'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { ReturnCartItem } from '../../interface/ReturnProduct'
import { CartDetail } from '../../interface/CartDetail'
import { RecordTypeEnum } from '../../../savvy/enums/RecordType'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { SoupNames } from '../../enum/SoupNames'
import { todayDateWithTimeZone } from '../../../common/utils/TimeZoneUtils'

export default class CartData {
    /**
     * Get cartItems assembled with pricebook entry and Config_Qty__c
     * if isReturnOnly = false, will return both sellable prod cartItems and add to ongoing return cartItems
     *
     * @param {string} orderCartIdentifier
     * @param {boolean} [isReturnOnly]
     * @return {*}  {Promise<CartItem[]>}
     */

    static getCartItemsWithProduct(orderCartIdentifier: string, where: any) {
        return BaseInstance.sfSoupEngine
            .dynamicRetrieve('CartItem')
            .select()
            .join({
                table: 'PricebookEntry',
                options: {
                    mainField: 'Product2Id',
                    targetField: 'Product2Id',
                    targetTable: 'CartItem',
                    fieldList: ['Pricebook2Id', 'Id']
                },
                type: 'INNER',
                alias: 'PricebookEntry'
            })
            .join({
                table: 'Product2',
                options: {
                    mainField: 'Id',
                    targetField: 'Product2Id',
                    targetTable: 'CartItem',
                    fieldList: ['Config_Qty__c']
                },
                type: 'LEFT',
                alias: 'Product2'
            })
            .where(where as any[])
            .getData(false)
            .then((cartData) => {
                return cartData.map((cart) => {
                    // pricebook entry id is conflicting with the original cart item id, so we alias it and map it back
                    return {
                        ...cart,
                        PricebookEntryId: cart['PricebookEntry.Id'],
                        Pricebook2Id: cart['PricebookEntry.Pricebook2Id'],
                        Config_Qty__c: cart['Product2.Config_Qty__c']
                    } as unknown as ReturnCartItem
                })
            })
    }

    static getCartItems(orderCartIdentifier: string, isReturnOnly?: boolean): Promise<ReturnCartItem[]> {
        const where = isReturnOnly
            ? [
                  {
                      leftTable: 'CartItem',
                      leftField: 'OrderCartIdentifier',
                      operator: '=',
                      rightField: `'${orderCartIdentifier + ReturnOrderSuffix.RETURN_ONLY}'`
                  },
                  {
                      leftTable: 'CartItem',
                      type: 'AND',
                      leftField: 'ReturnApplied',
                      operator: '=',
                      rightField: 'TRUE'
                  }
              ]
            : [
                  {
                      leftTable: 'CartItem',
                      leftField: 'OrderCartIdentifier',
                      operator: '=',
                      rightField: `'${orderCartIdentifier}'`
                  },
                  {
                      leftTable: 'CartItem',
                      type: 'OR',
                      leftField: 'OrderCartIdentifier',
                      operator: '=',
                      rightField: `'${orderCartIdentifier + ReturnOrderSuffix.ONGOING_ORDER}'`
                  }
              ]
        return CartData.getCartItemsWithProduct(orderCartIdentifier, where)
    }

    static getCartItemsOnGoingOnly(orderCartIdentifier: string) {
        const where = [
            {
                leftTable: 'CartItem',
                leftField: 'OrderCartIdentifier',
                operator: '=',
                rightField: `'${orderCartIdentifier + ReturnOrderSuffix.ONGOING_ORDER}'`
            }
        ]
        return CartData.getCartItemsWithProduct(orderCartIdentifier, where)
    }

    /**
     * Get Returns cartItems that are either return only or add to ongoing
     *
     * @param {boolean} isReturnOnly
     * @param {string} orderCartIdentifier
     * @param {boolean} [returnApplied=true]
     * @return {*}  {Promise<ReturnCartItem[]>}
     */
    static getCartItemsWithReturnType(
        isReturnOnly: boolean,
        orderCartIdentifier: string,
        returnApplied = true
    ): Promise<ReturnCartItem[]> {
        const conditions =
            orderCartIdentifier + (isReturnOnly ? ReturnOrderSuffix.RETURN_ONLY : ReturnOrderSuffix.ONGOING_ORDER)
        const extraCon = returnApplied ? 'TRUE' : 'NOT TRUE'
        return BaseInstance.sfSoupEngine.retrieve(
            'CartItem',
            [],
            '',
            [`WHERE {CartItem:OrderCartIdentifier} = '${conditions}' AND {CartItem:ReturnApplied} IS ${extraCon}`],
            {},
            true,
            true
        ) as unknown as Promise<ReturnCartItem[]>
    }

    /**
     * Get raw cartItems
     *
     * @param {string} orderCartIdentifier
     * @return {*}  {Promise<CartItem[]>}
     */
    static getRawCartItems(orderCartIdentifier: string): Promise<ReturnCartItem[]> {
        return BaseInstance.sfSoupEngine.retrieve(
            'CartItem',
            [],
            '',
            [`WHERE {CartItem:OrderCartIdentifier} = '${orderCartIdentifier}'`],
            {},
            true,
            true
        ) as unknown as Promise<ReturnCartItem[]>
    }

    static async getQueriesDeliveryDate(store: Partial<MyDayVisitModel>): Promise<string> {
        const deliveryDateInfo: any = await BaseInstance.sfSoupEngine
            .dynamicRetrieve('CartDetail')
            .select(['Id', 'UserId', 'DeliveryDate', 'NextDeliveryDate', '_soupEntryId'])
            .where([
                {
                    leftField: 'OrderCartIdentifier',
                    operator: '=',
                    rightField: `'${store.OrderCartIdentifier || store.VisitLegacyId}'`
                },
                {
                    type: 'AND',
                    leftField: 'UserId',
                    operator: '=',
                    rightField: `'${BaseInstance.userAccount.userId}'`
                }
            ])
            .getData(false)

        return _.isEmpty(deliveryDateInfo[0]?.DeliveryDate)
            ? moment(store.VDelDate).format(TIME_FORMAT.Y_MM_DD)
            : moment(deliveryDateInfo[0]?.DeliveryDate).format(TIME_FORMAT.Y_MM_DD)
    }

    static getCartDetail(orderCartIdentifier: string) {
        return BaseInstance.sfSoupEngine
            .dynamicRetrieve('CartDetail')
            .select([
                'Id',
                'UserId',
                'DeliveryDate',
                'NextDeliveryDate',
                'OrderNotes',
                'Cust_Po_Id__c_Local',
                '_soupEntryId',
                'OrderNotesTime'
            ])
            .where([
                {
                    leftField: 'OrderCartIdentifier',
                    operator: '=',
                    rightField: `'${orderCartIdentifier}'`
                },
                {
                    type: 'AND',
                    leftField: 'UserId',
                    operator: '=',
                    rightField: `'${BaseInstance.userAccount.userId}'`
                }
            ])
            .getData(false) as unknown as Promise<CartDetail[]>
    }

    static upsertCartDetail(cartDetail: CartDetail): Promise<CartDetail[]> {
        return BaseInstance.sfSoupEngine.upsert('CartDetail', [cartDetail])
    }

    static async cleanCartItem(orderCartIdentifier: string, custUniqId: string, accountId: string) {
        try {
            const cartItemsToDelete = await BaseInstance.sfSoupEngine.retrieve(
                'CartItem',
                ['ProductId'],
                `
                SELECT
                    {CartItem:Product2Id},
                    {CartItem:_soupEntryId}
                FROM {CartItem}
                LEFT JOIN {Product2}
                    ON {Product2:Id} = {CartItem:Product2Id}
                LEFT JOIN {Product_Exclusion__c}
                    ON {Product_Exclusion__c:Inven_Id__c} = {Product2:Material_Unique_ID__c}
                    AND {Product_Exclusion__c:Target_Value__c} = '${custUniqId}'
                LEFT JOIN {StoreProduct}
                    ON {StoreProduct:ProductId} = {Product2:Id}
                    AND {StoreProduct:AccountId} = '${accountId}'
                    AND {StoreProduct:RecordType.DeveloperName} = '${RecordTypeEnum.ACTIVE_PRODUCT}'
                WHERE
                    {CartItem:OrderCartIdentifier} = '${orderCartIdentifier}'
                    AND ({Product2:Id} IS NULL
                    OR {Product_Exclusion__c:Inven_Id__c} IS NOT NULL
                    OR {StoreProduct:Is_Visible_Product__c} IS NOT TRUE)
            `
            )
            await BaseInstance.sfSoupEngine.removeRecords(
                'CartItem',
                _.uniq(cartItemsToDelete.map((v) => v._soupEntryId))
            )
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: delete unauthorized cart items',
                `Failed to delete unauthorized cart items, error: ${ErrorUtils.error2String(e)}`
            )
        }
    }

    public async clearCart(orderCartIdentifier: string, isReturnOnly?: boolean) {
        try {
            const where = isReturnOnly
                ? [
                      {
                          leftField: 'OrderCartIdentifier',
                          operator: '=',
                          rightField: `'${orderCartIdentifier + ReturnOrderSuffix.RETURN_ONLY}'`
                      }
                  ]
                : [
                      {
                          leftField: 'OrderCartIdentifier',
                          operator: '=',
                          rightField: `'${orderCartIdentifier}'`
                      },
                      {
                          leftField: 'OrderCartIdentifier',
                          operator: '=',
                          type: 'OR',
                          rightField: `'${orderCartIdentifier + ReturnOrderSuffix.ONGOING_ORDER}'`
                      }
                  ]

            const originRecords = await BaseInstance.sfSoupEngine
                .dynamicRetrieve('CartItem')
                .select(['_soupEntryId'])
                .where(where as any[])
                .getData(false)
            await BaseInstance.sfSoupEngine.removeRecords(
                'CartItem',
                originRecords.map((r) => r._soupEntryId)
            )
        } catch (err) {
            storeClassLog(Log.MOBILE_ERROR, 'clearCart', `clear cart failed: ${ErrorUtils.error2String(err)}`)
        }
    }

    public async saveCart(cartItems: CartItem[]) {
        await BaseInstance.sfSoupEngine.upsert(SoupNames.CartItem, cartItems)
    }

    public async saveProductsToCart(storeId: string, finalProdLst: Array<CartItem>, orderCartIdentifier: string) {
        try {
            await this.clearCart(orderCartIdentifier)
            const records = this.mapProductsToCart(storeId, finalProdLst)
            await this.saveCart(records)
        } catch (err) {
            storeClassLog(Log.MOBILE_ERROR, 'saveProductsToCart', `save cart failed: ${ErrorUtils.error2String(err)}`)
        }
    }

    public async clearCartDetail(storeId: string) {
        try {
            const orignRecords = await BaseInstance.sfSoupEngine
                .dynamicRetrieve('CartDetail')
                .select(['_soupEntryId'])
                .where([
                    {
                        leftField: 'RetailStoreId',
                        operator: '=',
                        rightField: `'${storeId}'`
                    },
                    {
                        type: 'AND',
                        leftField: 'UserId',
                        operator: '=',
                        rightField: `'${BaseInstance.userAccount.userId}'`
                    }
                ])
                .getData(false)
            await BaseInstance.sfSoupEngine.removeRecords(
                'CartDetail',
                orignRecords.map((r) => r._soupEntryId)
            )
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'clearCartDetail',
                `clear cart detail failed: ${ErrorUtils.error2String(err)}`
            )
        }
    }

    public async saveCartDetail(storeId: string, cartDetail: CartDetail, orderCartIdentifier: string) {
        try {
            const record = this.mapCartDetail(storeId, cartDetail, orderCartIdentifier)
            await BaseInstance.sfSoupEngine.upsert('CartDetail', record)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'saveCartDetail',
                `save cart detail failed: ${ErrorUtils.error2String(err)}`
            )
        }
    }

    private mapCartDetail(storeId: string, cartDetailItem: CartDetail, orderCartIdentifier: string) {
        const objsToDo: CartDetail = _.cloneDeep(cartDetailItem)
        objsToDo.UserId = BaseInstance.userAccount.userId
        objsToDo.RetailStoreId = storeId
        objsToDo.OrderCartIdentifier = orderCartIdentifier
        return [objsToDo]
    }

    private mapProductsToCart(storeId: string, finalProdLst: Array<CartItem>) {
        const objsToDo: Array<CartItem> = []
        finalProdLst.forEach((item) => {
            const cartItemObj: CartItem = {
                RetailStoreId: storeId,
                Product2Id: item.Product2Id,
                Quantity: parseInt(item.Quantity || '0') + '',
                Item_Type__c: 'Order Item',
                CreatedDate: todayDateWithTimeZone(true),
                OrderCartIdentifier: item.OrderCartIdentifier,
                UnitPrice: item.UnitPrice,
                PriceIndex: item.PriceIndex.toString(),
                Pricebook2Id: item.Pricebook2Id,
                PricebookEntryId: item.PricebookEntryId,
                BreakageCases: item.BreakageCases,
                BreakageUnits: item.BreakageUnits,
                OutOfDateCases: item.OutOfDateCases,
                OutOfDateUnits: item.OutOfDateUnits,
                SaleableCases: item.SaleableCases,
                SaleableUnits: item.SaleableUnits,
                ReturnApplied: item.ReturnApplied,
                AddToCart: item.AddToCart,
                Priority: item.Priority,
                Deal_Id__c: item.Deal_Id__c,
                Minimum_Quantity: item.Minimum_Quantity,
                Product2: {
                    // pulling has different rebuiltdepth passed in
                    Material_Unique_ID__c:
                        item['Product2.Material_Unique_ID__c'] || item?.Product2?.Material_Unique_ID__c || '',
                    Name: item['Product2.Name'] || item?.Product2?.Name || '',
                    Sub_Brand__c: item['Product2.Sub_Brand__c'] || item?.Product2?.Sub_Brand__c || '',
                    Package_Type_Name__c:
                        item['Product2.Package_Type_Name__c'] || item?.Product2?.Package_Type_Name__c || '',
                    ProductCode: item['Product2.ProductCode'] || item?.Product2?.ProductCode || ''
                }
            }
            objsToDo.push(cartItemObj)
        })
        return objsToDo
    }

    public static async retrieveCartDataByOrderCartIdentifier(item: any) {
        try {
            return await BaseInstance.sfSoupEngine.retrieve('CartItem', [], '', [
                `WHERE {CartItem:OrderCartIdentifier}='${item.OrderCartIdentifier || item.VisitLegacyId}'`
            ])
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'retrieveCartDataByOrderCartIdentifier',
                `fetch cart data failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async retrieveCartItemBySoupEntryId(cartItemSoupEntryId: any) {
        try {
            return (await BaseInstance.sfSoupEngine.retrieve(
                'CartItem',
                [],
                '',
                [`WHERE {CartItem:_soupEntryId} = '${cartItemSoupEntryId}'`],
                {},
                true,
                true
            )) as unknown as ReturnCartItem[]
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'retrieveCartItemBySoupEntryId',
                `fetch cart item failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async upsertCartItemIntoSoup(cartItemRecords: any[]) {
        try {
            return await BaseInstance.sfSoupEngine.upsert('CartItem', cartItemRecords)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'upsertCartItemIntoSoup',
                `upsert cart item failed: ${ErrorUtils.error2String(err)}`
            )
        }
    }

    public static async removeCartItemFromSoup(cartItemSoupEntryIds: any[]) {
        try {
            await BaseInstance.sfSoupEngine.removeRecords('CartItem', cartItemSoupEntryIds)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'removeCartItemFromSoup',
                `remove cart item failed: ${ErrorUtils.error2String(err)}`
            )
        }
    }

    static async removeSingleCartItem(materialId: string, orderCartIdentifier: string) {
        const toRemove = await BaseInstance.sfSoupEngine.retrieve(
            'CartItem',
            [],
            '',
            [
                `WHERE {CartItem:Product2.Material_Unique_ID__c} = '${materialId}'
                AND {CartItem:OrderCartIdentifier} = '${orderCartIdentifier}'
            `
            ],
            {},
            true,
            true
        )
        toRemove.length &&
            (await BaseInstance.sfSoupEngine.removeRecords(
                'CartItem',
                toRemove.map((el) => el._soupEntryId)
            ))
    }

    public static async retrieveNotApplyReturnItemForReturnPage(orderCartIdentifier: string) {
        try {
            return await BaseInstance.sfSoupEngine.retrieve(
                'CartItem',
                [],
                '',
                [
                    `WHERE {CartItem:OrderCartIdentifier} = '${orderCartIdentifier}' AND {CartItem:ReturnApplied} IS NOT TRUE`
                ],
                {},
                true,
                false
            )
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'retrieveNotApplyReturnItemForReturnPage',
                `retrieveNotApplyReturnItemForReturnPage failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async retrieveApplyReturnCartItem(orderCartIdentifier: string) {
        try {
            return await BaseInstance.sfSoupEngine.retrieve(
                'CartItem',
                [],
                '',
                [
                    `WHERE {CartItem:OrderCartIdentifier} = '${orderCartIdentifier}' AND {CartItem:ReturnApplied} IS TRUE`
                ],
                {},
                true,
                true
            )
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'retrieveApplyReturnCartItem',
                `retrieveApplyReturnCartItem failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async retrieveNotApplyReturnCartItem(orderCartIdentifier: string, extraCon: string) {
        try {
            return await BaseInstance.sfSoupEngine.retrieve(
                'CartItem',
                [],
                '',
                [`WHERE {CartItem:OrderCartIdentifier} = '${orderCartIdentifier}' ${extraCon}`],
                {},
                true,
                false
            )
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'retrieveNotApplyReturnCartItem',
                `retrieveNotApplyReturnCartItem failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async retrieveCartItemByIdentifier(orderCartIdentifier: string) {
        try {
            return await BaseInstance.sfSoupEngine.retrieve(
                'CartItem',
                [],
                '',
                [`WHERE {CartItem:OrderCartIdentifier} = '${orderCartIdentifier}'`],
                {},
                true,
                false
            )
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'retrieveCartItemByIdentifier',
                `retrieveCartItemByIdentifier failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }
}

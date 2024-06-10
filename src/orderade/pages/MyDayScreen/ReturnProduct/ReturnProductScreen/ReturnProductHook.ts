/* eslint-disable camelcase */
/**
 * @description return product hooks.
 * @author Alimu Kuerban
 * @email Kuerban.Alimu@pwc.com
 * @date 2023-11-17
 */
import { useEffect, useState } from 'react'
import _ from 'lodash'
import moment from 'moment'
import { CommonParam } from '../../../../../common/CommonParam'
import { formatWithTimeZone } from '../../../../../common/utils/TimeZoneUtils'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { appendLog } from '../../../../../common/utils/LogUtils'
import { Log } from '../../../../../common/enums/Log'
import { compareDateToToday } from '../../../../utils/CommonUtil'
import { ReturnOrderSuffix } from '../../../../enum/Common'
import { t } from '../../../../../common/i18n/t'
import { MyDayVisitModel } from '../../../../interface/MyDayVisit'
import {
    CardDetailEffectProp,
    ReturnProduct,
    ReturnProductListModel,
    ReturnProductProps
} from '../../../../interface/ReturnProduct'
import ProductService from '../../../../service/ProductService'
import { SoupNames } from '../../../../enum/SoupNames'
import { useRecordsPagination } from '../../MyDayHooks'
import { formatPrice } from '../../../../utils/PriceUtils'
import CartService from '../../../../service/CartService'
import PriceService from '../../../../service/PriceService'

export const useReturnProduct = (props: ReturnProductProps) => {
    const { searchStr, store, appliedList, setAppliedList, pageName, isReturnOnly, setIsLoading, deliveryDate } = props

    const relativeDelDate = deliveryDate ? compareDateToToday(deliveryDate) : -1
    const orderCartIdentifier =
        (store.OrderCartIdentifier || store.VisitLegacyId) +
        (isReturnOnly ? ReturnOrderSuffix.RETURN_ONLY : ReturnOrderSuffix.ONGOING_ORDER)
    const [curListActive, setCurListActive] = useState<boolean>(false)
    const { packageNameQuery, transformRecords } = ProductService.getProductForReturnScreen({
        searchText: searchStr,
        custUniqId: store.CustUniqId,
        orderCartIdentifier,
        pageName,
        relativeDelDate,
        curListActive,
        storeId: store.Id
    })
    const {
        records: prodLst,
        setRecords: setProdLst,
        setOffset,
        setNeedRefreshCursor
    } = useRecordsPagination(
        ['Package_Type_Name__c'],
        packageNameQuery,
        SoupNames.Product2,
        transformRecords,
        searchStr,
        setIsLoading,
        5
    )

    const setIsActive = (productType: string) => {
        setProdLst(
            prodLst.map((el) => {
                if (el.label === productType) {
                    return {
                        ...el,
                        isActive: !el.isActive
                    }
                }
                return el
            })
        )
    }

    const setAllIsActive = (isActive: boolean) => {
        setCurListActive(isActive)
        setProdLst(
            prodLst.map((el) => {
                return {
                    ...el,
                    isActive
                }
            })
        )
    }

    const getProdPriceLst = (products: Array<ReturnProductListModel>, id: string, patch: { [k: string]: any }) => {
        const toDoLst = products
        return toDoLst.map((el) => {
            if (!el.isActive) {
                return el
            }
            if (el.products?.find((one) => one.ProductId === id)) {
                el.products = el.products.map((product) => {
                    if (product.ProductId === id) {
                        const newProduct = {
                            ...product,
                            ...patch
                        }
                        const { priceIndex, priceArr } = newProduct
                        if (priceArr[priceIndex]) {
                            newProduct.unitPrice = priceArr[priceIndex]?.Price
                        }
                        return newProduct
                    }
                    return product
                })
            }
            return el
        })
    }

    const setCasePriceOrActiveReturn = async (id: string, patch: { [k: string]: any }, product: ReturnProduct) => {
        const { priceArr = [], priceIndex, unitPrice, cartItemSoupEntryId } = product

        patch.cartItemSoupEntryId = cartItemSoupEntryId
        if (patch.cartItemSoupEntryId) {
            setProdLst(getProdPriceLst(prodLst, id, patch))
        }
        // convert casing to be stored in soup
        const cartPatch: { [id: string]: any } = {}
        _.keys(patch).forEach((key) => {
            cartPatch[key.slice(0, 1).toUpperCase() + key.slice(1)] = patch[key]
        })
        cartPatch.PriceIndex = (isNaN(cartPatch.PriceIndex) ? priceIndex : cartPatch.PriceIndex).toString()
        cartPatch.UnitPrice = cartPatch.UnitPrice || unitPrice
        if (parseInt(cartPatch.PriceIndex) > -2) {
            cartPatch.UnitPrice = priceArr[cartPatch.PriceIndex]?.Price || 0
            cartPatch.Deal_Id__c = priceArr[cartPatch.PriceIndex]?.Deal_Id__c || ''
            cartPatch.Minimum_Quantity = priceArr[cartPatch.PriceIndex]?.Minimum_Quantity || '0'
            cartPatch.Priority = priceArr[cartPatch.PriceIndex]?.Priority || ''
        }

        let cartItemRecord
        if (cartItemSoupEntryId) {
            ;[cartItemRecord] = await CartService.retrieveCartItemBySoupEntryId(cartItemSoupEntryId)
            cartItemRecord = {
                ...cartItemRecord,
                ...cartPatch
            }
        } else {
            cartItemRecord = {
                RetailStoreId: store.PlaceId,
                Product2Id: id,
                Item_Type__c: 'Order Item',
                Pricebook2Id: product.pbId,
                OrderCartIdentifier: orderCartIdentifier,
                Product2: {
                    Material_Unique_ID__c: product['Product.Material_Unique_ID__c'],
                    Name: product['Product.Name'],
                    Sub_Brand__c: product['Product.Sub_Brand__c'],
                    ProductCode: product['Product.ProductCode'],
                    Package_Type_Name__c: product['Product.Package_Type_Name__c'],
                    Config_Qty__c: product['Product.Config_Qty__c'] || 1
                },
                ...cartPatch
            }
        }
        const [res] = await CartService.upsertSingleCartItemIntoSoup(cartItemRecord)
        if (!patch.cartItemSoupEntryId) {
            patch.cartItemSoupEntryId = res._soupEntryId
            setProdLst(getProdPriceLst(prodLst, id, patch))
        }
    }

    const setApplyReturn = async (prod: ReturnProduct, isApplyInReturnSection = false) => {
        const { cartItemSoupEntryId, ProductId, priceArr, priceIndex } = prod
        const [cartItemRecord] = await CartService.retrieveCartItemBySoupEntryId(cartItemSoupEntryId)
        cartItemRecord.ReturnApplied = true
        if (isApplyInReturnSection) {
            cartItemRecord.BreakageCases = prod.breakageCases
            cartItemRecord.BreakageUnits = prod.breakageUnits
            cartItemRecord.BreakageTotal = prod.breakageTotal
            cartItemRecord.OutOfDateCases = prod.outOfDateCases
            cartItemRecord.OutOfDateUnits = prod.outOfDateUnits
            cartItemRecord.OutOfDateTotal = prod.outOfDateTotal
            cartItemRecord.SaleableCases = prod.saleableCases
            cartItemRecord.SaleableUnits = prod.saleableUnits
            cartItemRecord.SaleableTotal = prod.saleableTotal
            cartItemRecord.UnitPrice = prod.unitPrice
            cartItemRecord.PriceIndex = (priceIndex ?? -1).toString()
            cartItemRecord.Deal_Id__c = priceArr[priceIndex]?.Deal_Id__c || ''
            cartItemRecord.Minimum_Quantity = priceArr[priceIndex]?.Minimum_Quantity || '0'
            cartItemRecord.Priority = priceArr[priceIndex]?.Priority || ''
        }
        await CartService.upsertSingleCartItemIntoSoup(cartItemRecord)

        if (isApplyInReturnSection) {
            // only need to trigger rerender and price check on list level
            setAppliedList([...appliedList])
            return
        }
        let existPackageInList: ReturnProductListModel | null = null
        let existProductInList: ReturnProduct | null = null
        const newProdLst = prodLst
            .map((one) => {
                const prodMatchIndex = one.products.findIndex((one: ReturnProduct) => one.ProductId === ProductId)
                if (prodMatchIndex > -1) {
                    existPackageInList = one
                    existProductInList = {
                        ...one.products.splice(prodMatchIndex, 1)[0],
                        isActiveReturn: false
                    }
                    if (one.products.length) {
                        return {
                            ...one
                        }
                    }
                    return null
                }
                return one
            })
            .filter((one) => !!one)
        setProdLst(newProdLst)

        const packageMatchIndexAppliedList = appliedList.findIndex((one) => one.label === existPackageInList?.label)
        if (packageMatchIndexAppliedList > -1) {
            setAppliedList(
                appliedList.map((pack, index) => {
                    if (index === packageMatchIndexAppliedList) {
                        return {
                            ...pack,
                            products: _.sortBy(
                                (pack.products || []).concat(existProductInList || []),
                                'Product.Sub_Brand__c'
                            )
                        }
                    }
                    return pack
                })
            )
        } else {
            const newAppliedList = _.sortBy(
                appliedList.concat([
                    {
                        label: existPackageInList?.label,
                        isActive: false,
                        products: [existProductInList as unknown as ReturnProduct]
                    }
                ]),
                'label'
            )
            setAppliedList(newAppliedList)
        }
    }

    const logMsg = `Products have loaded for ${CommonParam.GPID__c} at ${formatWithTimeZone(
        moment(),
        TIME_FORMAT.YMDTHMS,
        true,
        true
    )}`
    appendLog(Log.MOBILE_INFO, 'orderade: fetch products list', logMsg)

    return {
        prodLst,
        setCasePriceOrActiveReturn,
        setIsActive,
        setAllIsActive,
        setOffset,
        setNeedRefreshCursor,
        setApplyReturn,
        loading: false
    }
}

export const useCardDetailUpdateEffect = (cartDetail: any, setStartDate: any, setEndDate: any, setNotes: any) => {
    useEffect(() => {
        if (cartDetail) {
            setStartDate(cartDetail?.DeliveryDate)
            setEndDate(cartDetail?.NextDeliveryDate)
            setNotes(cartDetail.OrderNotes || '')
        }
    }, [cartDetail])
}

export const useAppliedList = (
    store: MyDayVisitModel,
    searchStr: string,
    isReturnOnly: boolean,
    deliveryDate?: string
) => {
    const relativeDelDate = deliveryDate ? compareDateToToday(deliveryDate) : -1
    const [appliedList, setAppliedList] = useState<ReturnProductListModel[]>([])
    const orderCartIdentifier =
        (store.OrderCartIdentifier || store.VisitLegacyId) +
        (isReturnOnly ? ReturnOrderSuffix.RETURN_ONLY : ReturnOrderSuffix.ONGOING_ORDER)
    const productQuery = ProductService.getAppliedListQuery(searchStr, store.CustUniqId, orderCartIdentifier)
    const refreshAppliedList = async () => {
        const allProducts = (await ProductService.getAppliedList(productQuery)) as unknown as ReturnProduct[]
        const finalReturnPackageList: ReturnProductListModel[] = []
        const priceGroup = await PriceService.getPriceGroupForAllProduct(allProducts, store.CustUniqId, true)
        let curPackage: string = ''
        await PriceService.initialize()
        allProducts.forEach((p) => {
            const priceArr = priceGroup[p['Product.Material_Unique_ID__c']] || []
            priceArr.forEach((el, index) => {
                el.index = index
                el.label = `${t.labels.PBNA_MOBILE_ORDER_D}${formatPrice(el.Price)} | ${el.Deal_Name__c || ''}`
            })
            let priceDisplayRange: string[] = []
            if (relativeDelDate >= 0) {
                ;({ priceDisplayRange } = PriceService.getDefaultPricing(priceArr, '0', relativeDelDate))
            }
            p.priceArr = priceArr
            p.priceDisplayRange = priceDisplayRange
            p.relativeDelDate = relativeDelDate
            p.custUniqId = store.CustUniqId
            const packageName = p['Product.Package_Type_Name__c']
            if (packageName === curPackage) {
                _.last(finalReturnPackageList)?.products?.push(p)
            } else {
                curPackage = packageName
                finalReturnPackageList.push({
                    label: packageName,
                    isActive: false,
                    products: [p]
                })
            }
        })
        setAppliedList(finalReturnPackageList)
    }

    const setAppliedListIsActive = (productType: string) => {
        setAppliedList(
            appliedList.map((el) => {
                if (el.label === productType) {
                    return {
                        ...el,
                        isActive: !el.isActive
                    }
                }
                return el
            })
        )
    }

    const setAppliedListActiveReturn = (id: string, patch: { [k: string]: any }) => {
        setAppliedList(
            appliedList.map((one) => {
                const productMatchIndex = one.products?.findIndex((p) => p.ProductId === id)
                if (productMatchIndex > -1) {
                    return {
                        ...one,
                        products: one.products.map((prod, index) => {
                            if (index === productMatchIndex) {
                                return {
                                    ...prod,
                                    ...patch
                                }
                            }
                            return prod
                        })
                    }
                }
                return one
            })
        )
    }

    useEffect(() => {
        refreshAppliedList()
    }, [productQuery])

    return {
        appliedList,
        setAppliedList,
        setAppliedListIsActive,
        setAppliedListActiveReturn,
        refreshAppliedList
    }
}

export const useClearReturnDataEffect = (visit: any, clearCart: Function) => {
    useEffect(() => {
        const orderCartIdentifier = (visit.OrderCartIdentifier || visit.VisitLegacyId) + '-Return'
        clearCart(orderCartIdentifier)
    }, [])
}

export const useCardDetailEffect = (props: CardDetailEffectProp) => {
    const { isReturnOnly, cartDetail, visit, setNotes, setStartDate, setPoNumber, setEndDate, setNotesRecordTime } =
        props
    useEffect(() => {
        if (!cartDetail) {
            return
        }
        if (!isReturnOnly) {
            setStartDate(cartDetail?.DeliveryDate)
            setEndDate(cartDetail?.NextDeliveryDate)
            setNotes(cartDetail?.OrderNotes || '')
            setPoNumber(cartDetail.Cust_Po_Id__c_Local || '')
            setNotesRecordTime(cartDetail.OrderNotesTime || null)
        } else {
            const dDate = visit.AdHoc ? null : visit.VDelDate || null
            const nDDate = visit.AdHoc ? null : visit.VNDelDate || null
            setStartDate(dDate)
            setEndDate(nDDate)
        }
    }, [cartDetail])
}

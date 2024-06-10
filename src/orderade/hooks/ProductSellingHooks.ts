/* eslint-disable camelcase */
/**
 * @description product selling hooks.
 * @author Qiulin Deng
 * @email qiulin.deng@pwc.com
 * @date 2023-03-20
 */
import _ from 'lodash'
import { StoreProduct } from '../interface/StoreProduct'
import { useRecordsPagination } from '../pages/MyDayScreen/MyDayHooks'
import { useEffect, useRef, useState } from 'react'
import { MyDayVisitModel } from '../interface/MyDayVisit'
import { appendLog, storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import { CommonParam } from '../../common/CommonParam'
import { formatWithTimeZone } from '../../common/utils/TimeZoneUtils'
import moment from 'moment'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { RecordTypeEnum } from '../../savvy/enums/RecordType'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { TmpFdPrc } from '../interface/TmpFdPrc'
import { PageNames } from '../enum/Common'
import ProductService from '../service/ProductService'
import { compareDateToToday } from '../utils/CommonUtil'
import { t } from '../../common/i18n/t'
import { isTrueInDB } from '../../savvy/utils/CommonUtils'
import { ReturnCartItem, ReturnKPI } from '../interface/ReturnProduct'
import { formatPrice } from '../utils/PriceUtils'
import PriceService from '../service/PriceService'
import SyncUpService from '../service/SyncUpService'

export interface ProductSKUType {
    label: string
    isActive?: boolean
    products: Array<StoreProduct>
}
export interface ReturnProduct {
    label: string
    ProductId: string
    returnData: ReturnKPI[]
    isNewItem: boolean
    isActive?: boolean
    isActiveReturn?: boolean
}
export interface ProductPatch {
    ProductId: string
    priceIndex: number
    unitPrice?: string
    product: StoreProduct
    quantity: string
    is_Visible_Product__c?: boolean
    EDV_Qty__c?: string
    EDV_Price__c?: string
}
export interface UseProductParams {
    searchStr: string
    store: MyDayVisitModel
    cartData: Array<ReturnCartItem>
    setCartData: Function
    pageName: string
    orderCartIdentifier: string
    setIsLoading?: Function
    deliveryDate?: string
}
export interface Product2Type {}
export const useProduct = (param: UseProductParams) => {
    const { searchStr, store, cartData, setCartData, pageName, orderCartIdentifier, setIsLoading, deliveryDate } = param
    const storeId = store.PlaceId
    const relativeDelDate = deliveryDate ? compareDateToToday(deliveryDate) : -1
    const curListActive = useRef<boolean>(true)
    const [totalProdNum, setTotalProdNum] = useState(0)
    // we use these two variable to achieve pagination on package name
    let packageNameQuery: string | undefined
    let paginationSoupName
    const pbnaExtraJoin = `LEFT JOIN {Product_Exclusion__c} ON
        {Product_Exclusion__c:Inven_Id__c} = {Product2:Material_Unique_ID__c}
        AND {Product_Exclusion__c:Target_Value__c} = '${store.CustUniqId}'`
    let pbnaExtraWhere = `AND {Product_Exclusion__c:_soupEntryId} IS NULL`
    switch (pageName) {
        case PageNames.INACTIVE_PROD:
            pbnaExtraWhere = `${pbnaExtraWhere} AND {StoreProduct:Is_Visible_Product__c} IS NOT TRUE AND {Product2:Inven_Avail_Flag_Local} IS TRUE`
            break
        case PageNames.ORDER_SUMMARY:
            pbnaExtraWhere = `${pbnaExtraWhere} AND {StoreProduct:Is_Visible_Product__c} IS TRUE`
            break
        case PageNames.PROD_SELLING:
            pbnaExtraWhere = `${pbnaExtraWhere} AND {StoreProduct:Is_Visible_Product__c} IS TRUE AND {Product2:Inven_Avail_Flag_Local} IS TRUE`
            break
        default:
            break
    }
    if (pageName !== PageNames.ORDER_SUMMARY) {
        packageNameQuery = `SELECT
            {Product2:Package_Type_Name__c}
        FROM {Product2}
        LEFT JOIN {PricebookEntry}
            ON {PricebookEntry:Product2.Material_Unique_ID__c} = {Product2:Material_Unique_ID__c}
        LEFT JOIN {StoreProduct}
            ON {StoreProduct:ProductId} = {Product2:Id}
            AND {StoreProduct:AccountId} = '${store.AccountId}'
            AND {StoreProduct:RecordType.DeveloperName} = '${RecordTypeEnum.ACTIVE_PRODUCT}'
        ${pbnaExtraJoin}
        WHERE
            {PricebookEntry:Id} IS NOT NULL
            AND {Product2:Package_Type_Name__c} IS NOT NULL
            AND ({Product2:Name} LIKE '%${searchStr}%'
            OR {Product2:Sub_Brand__c} LIKE '%${searchStr}%'
            OR {Product2:Package_Type_Name__c} LIKE '%${searchStr}%'
            OR {Product2:Material_Unique_ID__c} LIKE '%${searchStr}%')
            ${pbnaExtraWhere}
        GROUP BY {Product2:Package_Type_Name__c} 
        ORDER BY {Product2:Package_Type_Name__c} ASC`
        paginationSoupName = 'Product2'
    } else {
        // LEFT JOIN {CartItem}
        // ON {Product2:Id} = {CartItem:Product2Id}
        // AND {CartItem:RetailStoreId} = '${storeId}'
        packageNameQuery = `SELECT
            {Product2:Package_Type_Name__c}
        FROM {CartItem}
        LEFT JOIN {Product2}
            ON {Product2:Id} = {CartItem:Product2Id}
        LEFT JOIN {StoreProduct}
            ON {StoreProduct:ProductId} = {Product2:Id}
            AND {StoreProduct:AccountId} = '${store.AccountId}'
        ${pbnaExtraJoin}
        WHERE
            {CartItem:OrderCartIdentifier} = '${orderCartIdentifier}'
            AND {CartItem:Quantity} != '0'
            AND {Product2:Package_Type_Name__c} IS NOT NULL
            ${pbnaExtraWhere}
        GROUP BY {Product2:Package_Type_Name__c} 
        ORDER BY {Product2:Package_Type_Name__c} ASC`
        paginationSoupName = 'CartItem'
    }
    // after get package names, we pull products under that package name
    const transformRecords = async (
        packageNames: { Package_Type_Name__c: string }[]
    ): Promise<ProductSKUType[] | null> => {
        await PriceService.initialize()
        if (packageNames.length) {
            const allProducts = await ProductService.getAllProductsData(
                store,
                orderCartIdentifier,
                packageNames,
                searchStr,
                pageName
            )
            const generatedAt = Date.now()
            const priceGroup = await PriceService.getPriceGroupForAllProduct(allProducts, store.CustUniqId)
            return packageNames.map((packageName) => {
                const packageNameString = packageName.Package_Type_Name__c
                const products = allProducts
                    .filter((prod: any) => prod['Product.Package_Type_Name__c'] === packageNameString)
                    .map((prod: any) => {
                        const notSavedCartItem = cartData.find(
                            (one) =>
                                one.Product2Id === prod.ProductId && one.OrderCartIdentifier === orderCartIdentifier
                        )
                        const quantity = notSavedCartItem?.Quantity || prod.quantity || '0'
                        let index: number = -1
                        const priceArr = (priceGroup[prod['Product.Material_Unique_ID__c']] ||
                            []) as unknown as TmpFdPrc[]
                        priceArr.forEach((el, index) => {
                            const volumeHurdleMark =
                                _.toNumber(el.Minimum_Quantity) > 0
                                    ? t.labels.PBNA_MOBILE_VOLUME_HURDLE_MARK + ' - '
                                    : ''
                            const priceAndDealName =
                                t.labels.PBNA_MOBILE_ORDER_D + `${formatPrice(el.Price)} | ${el.Deal_Name__c || ''}`
                            el.label = volumeHurdleMark + priceAndDealName
                            el.index = index
                        })
                        // last selected pricing rule
                        const priceIndexInCartStr = notSavedCartItem
                            ? notSavedCartItem.PriceIndex
                            : (prod.priceIndex as string)
                        const priceIndexInCart = priceIndexInCartStr === null ? -1 : parseInt(priceIndexInCartStr)
                        let priceDisplayRange: string[] = []
                        if (relativeDelDate >= 0) {
                            ;({ index, priceDisplayRange } = PriceService.getDefaultPricing(
                                priceArr,
                                quantity,
                                relativeDelDate
                            ))
                        }
                        // if previously selected pricing, override the calculated default index
                        priceIndexInCart > -1 && (index = priceIndexInCart)
                        // override unitPrice immediately, otherwise total amount will be incorrect
                        const curPrice =
                            pageName === PageNames.INACTIVE_PROD ? prod.unitPrice : priceArr[index]?.Price || '0'
                        return {
                            ...prod,
                            quantity,
                            unitPrice: curPrice,
                            Is_Visible_Product__c: notSavedCartItem?.is_Visible_Product__c || false,
                            priceArr,
                            priceIndex: index,
                            priceDisplayRange,
                            visitId: store.Id,
                            relativeDelDate,
                            EDV_Qty__c: Number(prod.EDV_Qty__c),
                            EDV_Price__c: Number(prod.EDV_Price__c)
                        }
                    })
                // if on product summary, expand all packages
                // if on product listing, after user clicked on expand all, all following pages should follow
                const isActive = curListActive.current
                return {
                    label: packageNameString,
                    isActive,
                    products: _.sortBy(products, 'Product.Sub_Brand__c'),
                    generatedAt
                }
            })
        }
        return []
    }
    const pageSize = 2
    // data inside records pagination are array of package names, we are not using that
    const {
        records: prodLst,
        setRecords: setProdLst,
        setOffset,
        setNeedRefreshCursor
    } = useRecordsPagination(
        ['Package_Type_Name__c'],
        packageNameQuery,
        paginationSoupName,
        transformRecords,
        searchStr,
        setIsLoading,
        pageSize
    )

    const getTotalProductNum = async () => {
        if (!prodLst?.[0]) {
            setTotalProdNum(0)
            return
        }
        const allProductsCount = await ProductService.getAllProductCount(store, pbnaExtraWhere, searchStr)
        setTotalProdNum(allProductsCount || 0)
    }
    useEffect(() => {
        // this should be called after cursor created or refreshed
        // but not when list is expanded or collapsed
        // so we use construct a generatedAt field in productPackage
        pageName === PageNames.INACTIVE_PROD && getTotalProductNum()
    }, [prodLst?.[0]?.generatedAt])

    const getProdQtyLst = (packageName: string, patchLines: any[]) => {
        const toDoLst = prodLst as ProductSKUType[]
        return toDoLst.map((el) => {
            if (el.label !== packageName) {
                return el
            }
            el.products = el.products.map((product) => {
                const patch = patchLines.find((one) => one.ProductId === product.ProductId)
                if (patch) {
                    return {
                        ...product,
                        ...patch
                    }
                }
                return product
            })
            return el
        })
    }
    const updateProductLisByField = (
        field: any,
        fieldName: any,
        qty: any,
        price: any,
        isApplyAll?: boolean,
        ProductId?: string
    ) => {
        setProdLst(
            prodLst.map((el: any) => {
                if (!el.isActive) {
                    return el
                }
                if (
                    el.products?.find(
                        (one: any) =>
                            (one[fieldName] === field &&
                                (isApplyAll ? one.unitPrice !== 0 && one.unitPrice !== '0' : true)) ||
                            (ProductId && one.ProductId === ProductId)
                    )
                ) {
                    el.products = el.products.map((pro: any) => {
                        if (
                            (pro[fieldName] === field &&
                                (isApplyAll ? pro.unitPrice !== 0 && pro.unitPrice !== '0' : true)) ||
                            (ProductId && pro.ProductId === ProductId)
                        ) {
                            return {
                                ...pro,
                                EDV_Qty__c: qty,
                                EDV_Price__c: price
                            }
                        }
                        return pro
                    })
                }
                return el
            })
        )
    }

    const patchCart = (patchLines: ProductPatch[]) => {
        const patchProductIds = _.map(patchLines, 'ProductId')
        const oldCart = cartData.filter((cartItem) => {
            return !patchProductIds.includes(cartItem.Product2Id) || isTrueInDB(cartItem.ReturnApplied)
        })
        const appendCart = patchLines.map((patch) => {
            const existCart = cartData.find(
                (one) => one.Product2Id === patch.ProductId && !isTrueInDB(one.ReturnApplied)
            )
            const { priceIndex: index, quantity, product, ProductId } = patch
            const { priceArr, EDV_Qty__c, EDV_Price__c, AP_Unique_ID__c } = product
            const curPriceRule = priceArr[index]
            const newUnitPrice = curPriceRule?.Price || '0'
            const Deal_Id__c = curPriceRule?.Deal_Id__c || ''
            const Minimum_Quantity = curPriceRule?.Minimum_Quantity || '0'
            const Priority = curPriceRule?.Priority || ''
            const base = {
                Quantity: quantity + '',
                UnitPrice: newUnitPrice,
                PriceIndex: index.toString(),
                Deal_Id__c,
                Minimum_Quantity,
                Priority,
                is_Visible_Product__c: !!existCart?.is_Visible_Product__c,
                EDV_Qty__c,
                EDV_Price__c,
                AP_Unique_ID__c
            }
            if (patch.is_Visible_Product__c) {
                base.is_Visible_Product__c = true
            }
            if (existCart) {
                return {
                    ...existCart,
                    ...base
                }
            }
            return {
                ...base,
                RetailStoreId: storeId,
                Product2Id: ProductId,
                Item_Type__c: 'Order Item',
                Pricebook2Id: product.pbId,
                PricebookEntryId: product.pbeId,
                OrderCartIdentifier: orderCartIdentifier,
                Product2: {
                    Material_Unique_ID__c: product['Product.Material_Unique_ID__c'],
                    Name: product['Product.Name'],
                    Sub_Brand__c: product['Product.Sub_Brand__c'],
                    ProductCode: product['Product.ProductCode'],
                    Package_Type_Name__c: product['Product.Package_Type_Name__c']
                }
            }
        })
        setCartData([...oldCart, ...appendCart])
    }

    const setQuantity = async (quantity: string, product: StoreProduct, priceIndex: number = -2) => {
        const { ProductId: id, priceArr = [], priceIndex: oldPriceIndex } = product

        let index = -1

        const _oldPriceIndex = oldPriceIndex > -1 ? oldPriceIndex : -1
        let allPatches: ProductPatch[] = []
        if (priceIndex >= -1) {
            // if passed priceIndex >= -1, that means user is now selecting price
            // we need to check if unforced deal should be applied to all other products under the same package
            index = priceIndex
            const curPackage = prodLst.find((one) => one.label === product['Product.Package_Type_Name__c'])
            allPatches = PriceService.tryApplyVolumeHurdleToAll(curPackage, product, index)
        } else {
            // user is adjusting the quantity of the product, if forced deal with volume hurdle
            // we need to upgrade the pricing rule accordingly
            index = PriceService.tryUpgradeVolumeHurdleIfForceDeal(product, _oldPriceIndex, quantity, relativeDelDate)
            allPatches = [
                {
                    ProductId: id,
                    priceIndex: index,
                    quantity,
                    unitPrice: priceArr[index]?.Price || '0',
                    product
                }
            ]
        }
        setProdLst(getProdQtyLst(product['Product.Package_Type_Name__c'], allPatches))
        patchCart(allPatches)
    }

    const setIsProdVisible = (product: StoreProduct) => {
        // Set cart data to prevent the visible data is lost after rerender action such as search
        const allPatches = [
            {
                ProductId: product.ProductId,
                priceIndex: product.priceIndex,
                quantity: '0',
                unitPrice: product.priceArr[product.priceIndex]?.Price || '0',
                product,
                is_Visible_Product__c: true
            }
        ]
        patchCart(allPatches)
        // Set ProdData For Rendering
        const outputValue = _.cloneDeep(prodLst)
        outputValue.forEach((el) => {
            if (!_.isEmpty(el.products)) {
                el.products.forEach((curProd: StoreProduct) => {
                    if (curProd?.ProductId === product?.ProductId) {
                        curProd.Is_Visible_Product__c = true
                    }
                })
            }
        })
        setProdLst(outputValue)
    }

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
        curListActive.current = isActive
        setProdLst(
            prodLst.map((el) => {
                return {
                    ...el,
                    isActive
                }
            })
        )
    }

    const setEDV = async (qty: any, priceInput: any, applyAll: boolean, product: any) => {
        try {
            const price = formatPrice(priceInput)
            if (applyAll) {
                updateProductLisByField(
                    product['Product.Package_Type_Name__c'],
                    'Product.Package_Type_Name__c',
                    qty,
                    price,
                    applyAll,
                    product.ProductId
                )
                const packageProduct = prodLst.filter((a) => a.label === product['Product.Package_Type_Name__c'])

                if (
                    packageProduct &&
                    packageProduct.length > 0 &&
                    packageProduct[0].products &&
                    packageProduct[0].products.length > 0
                ) {
                    const updateProducts = packageProduct[0].products.filter(
                        (a: any) => a.unitPrice !== 0 && a.unitPrice !== '0'
                    )
                    const storeProductUniqIds = _.map(updateProducts, 'AP_Unique_ID__c')
                    !storeProductUniqIds.includes(product.AP_Unique_ID__c) &&
                        storeProductUniqIds.push(product.AP_Unique_ID__c)
                    await ProductService.updateStoreProductQTYAndPrice(storeProductUniqIds, qty, price)
                }
            } else {
                updateProductLisByField(product.ProductId, 'ProductId', qty, price)
                await ProductService.updateStoreProductQTYAndPrice([product.AP_Unique_ID__c], qty, price)
            }
            SyncUpService.syncUpLocalData()
        } catch (error) {
            storeClassLog(Log.MOBILE_INFO, 'orderade: setEDV', ErrorUtils.error2String(error))
        }
    }

    const logMsg = `Products have loaded for ${CommonParam.GPID__c} at ${formatWithTimeZone(
        moment(),
        TIME_FORMAT.YMDTHMS,
        true,
        true
    )}`
    appendLog(Log.MOBILE_INFO, 'orderade: fetch products list', logMsg)

    // when performing search, we reset collapse all
    // otherwise the results will show as 2 collapsed package, only cover half of the screen
    useEffect(() => {
        curListActive.current = true
    }, [searchStr])

    return {
        prodLst,
        loading: false,
        setQuantity,
        setIsActive,
        setAllIsActive,
        setOffset,
        setIsProdVisible,
        setNeedRefreshCursor,
        totalProdNum,
        setEDV
    }
}

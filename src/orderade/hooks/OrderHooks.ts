/**
 * @description Get Order or Order Item data hooks.
 * @author Qiulin Deng
 * @email qiulin.deng@pwc.com
 * @date 2023-06-27
 */
import _ from 'lodash'
import { StoreProduct } from '../interface/StoreProduct'
import { useEffect, useState } from 'react'
import { CommonLabel } from '../enum/CommonLabel'
import { OrderLineActivityCde } from '../enum/Common'
import OrderService from '../service/OrderService'

export interface ProductSKUType {
    label: string
    isActive?: boolean
    products?: Array<StoreProduct>
}
export interface OrderSummaryType {
    productsGrouped: Array<ProductSKUType>
    orderItemLst: Array<any>
}

export interface Product2Type {}

const processReturnData = (
    localReturnItemData: Array<any>,
    curProduct: StoreProduct,
    convertRatio: number,
    caseField: string,
    unitField: string
) => {
    const tempLocalReturnItemData = _.cloneDeep(localReturnItemData)
    const caseNum = Math.floor(parseFloat(`${curProduct?.quantity}`))
    const unitNum = Math.round((parseFloat(`${curProduct?.quantity}`) - caseNum) * convertRatio)
    const hasTargetProd =
        !_.isEmpty(tempLocalReturnItemData) &&
        !_.isEmpty(
            tempLocalReturnItemData?.find((localReturnItem) => localReturnItem?.Product2Id === curProduct?.Product2Id)
        )
    if (hasTargetProd) {
        tempLocalReturnItemData.forEach((returnItem) => {
            if (returnItem.Product2Id === curProduct.Product2Id) {
                returnItem[caseField] = caseNum
                returnItem[unitField] = unitNum
            }
        })
    } else {
        const prodToInsert: any = {
            ...curProduct,
            ReturnApplied: true
        }
        // delete prodToInsert?.Inven_Cnd_Status_Code__c
        prodToInsert[caseField] = caseNum
        prodToInsert[unitField] = unitNum
        tempLocalReturnItemData.push(prodToInsert)
    }
    return tempLocalReturnItemData
}

const mapReturnOrderItemToLocal = (rawOrderItemInfo: Array<any>) => {
    // Since if it is a return order,
    // there will be 3 back end order item map to 1 front end order item
    // we will reconstruct the data structure and delete the unnecessary data
    let rawOrderItemInfoCopy = _.cloneDeep(rawOrderItemInfo)
    if (!_.isEmpty(rawOrderItemInfoCopy)) {
        let localReturnItemData: Array<any> = []
        const removeArr: Array<number> = []
        rawOrderItemInfoCopy.forEach((product, index) => {
            if (product?.ord_lne_actvy_cde__c === OrderLineActivityCde.RETURN) {
                const convertRatio = parseFloat(`${product?.Config_Qty__c || 1}`) || 1
                switch (product?.Mtrl_Rtrn_Rsn_Cdv__c) {
                    case '001':
                        localReturnItemData = processReturnData(
                            localReturnItemData,
                            product,
                            convertRatio,
                            'saleableCases',
                            'saleableUnits'
                        )
                        break
                    case '002':
                        localReturnItemData = processReturnData(
                            localReturnItemData,
                            product,
                            convertRatio,
                            'breakageCases',
                            'breakageUnits'
                        )
                        break
                    case '003':
                        localReturnItemData = processReturnData(
                            localReturnItemData,
                            product,
                            convertRatio,
                            'outOfDateCases',
                            'outOfDateUnits'
                        )
                        break
                    default:
                        break
                }
                removeArr.push(index)
            }
        })
        if (!_.isEmpty(removeArr)) {
            for (const el of removeArr) {
                rawOrderItemInfoCopy.splice(el, CommonLabel.NUMBER_ONE)
            }
        }
        rawOrderItemInfoCopy = rawOrderItemInfo
            .filter((orderItem) => orderItem.ord_lne_actvy_cde__c === OrderLineActivityCde.DELIVERY)
            .concat(localReturnItemData)
    }
    return rawOrderItemInfoCopy
}

export const useOrderItem = (order: any) => {
    const [allOrderItem, setAllOrderItem] = useState<Array<any>>([])
    const [curListActive, setCurListActive] = useState<boolean>(true)

    // after get package names, we pull products under that package name
    const transformRecords = async (packageNames: Array<any>): Promise<ProductSKUType[]> => {
        let allProducts: Array<StoreProduct> = []
        let productsGrouped: Array<ProductSKUType> = []
        if (packageNames.length) {
            allProducts = await OrderService.retrieveOrderItemsForPackages(packageNames, order)
            productsGrouped = packageNames.map((packageName) => {
                const packageNameString = packageName.Package_Type_Name__c
                const products = allProducts
                    .filter((prod) => prod['Product.Package_Type_Name__c'] === packageNameString)
                    .map((prod) => {
                        return prod
                    })
                // on order information screen, collapsed all packages
                return {
                    label: packageNameString,
                    isActive: curListActive,
                    products: _.sortBy(mapReturnOrderItemToLocal(products), 'Product.Sub_Brand__c')
                }
            })
            productsGrouped = productsGrouped.filter((v: any) => !_.isEmpty(v.products))
        }
        return productsGrouped
    }

    const useOrderData = (
        fields: Array<string>,
        query: string,
        soupName: string,
        transformRecords: (packageNames: Array<any>) => Promise<ProductSKUType[]>
    ) => {
        const [records, setRecords] = useState<Array<any>>([])
        const [refresh, setNeedRefresh] = useState<boolean>(false)
        const refreshOrderData = () => {
            setNeedRefresh(!refresh)
        }
        useEffect(() => {
            OrderService.retrieveOrderData(fields, query, soupName, transformRecords, setRecords)
        }, [refresh])
        return {
            records,
            setRecords,
            refreshOrderData
        }
    }

    const packageNameQuery = `SELECT
            {OrderItem:Product2.Package_Type_Name__c}
        FROM {OrderItem}
        WHERE
            {OrderItem:Product2.Package_Type_Name__c} IS NOT NULL
            AND ({OrderItem:OrderId} = '${order.Id}' OR {OrderItem:oRefId} = '${order._soupEntryId}')
        GROUP BY {OrderItem:Product2.Package_Type_Name__c} 
        ORDER BY {OrderItem:Product2.Package_Type_Name__c} ASC`
    const paginationSoupName = 'OrderItem'

    // data inside records pagination are array of package names, we are not using that
    const {
        records: prodLst,
        setRecords: setProdLst,
        refreshOrderData
    } = useOrderData(['Package_Type_Name__c'], packageNameQuery, paginationSoupName, transformRecords)

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

    const setIsReturnListActive = (productType: string) => {
        setProdLst(
            prodLst.map((el) => {
                if (el.label === productType) {
                    return {
                        ...el,
                        isReturnActive: !el.isReturnActive
                    }
                }
                return el
            })
        )
    }

    const getUpdatedReturnLst = (products: Array<any>, id: string, patch: { [k: string]: any }) => {
        const toDoLst = _.cloneDeep(products)
        return toDoLst.map((el) => {
            if (!el?.isReturnActive) {
                return el
            }
            if (el.products?.find((one: any) => one.Product2Id === id)) {
                el.products = el.products.map((product: any) => {
                    if (product.Product2Id === id) {
                        const newProduct = {
                            ...product,
                            ...patch
                        }
                        return newProduct
                    }
                    return product
                })
            }
            return el
        })
    }

    const setSingleReturnProductActive = (id: string, patch: { [k: string]: any }) => {
        setProdLst(getUpdatedReturnLst(prodLst, id, patch))
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
    useEffect(() => {
        let orderItemLst: Array<any> = []
        if (!_.isEmpty(prodLst)) {
            prodLst.forEach((pkgGroup) => {
                if (!_.isEmpty(pkgGroup?.products)) {
                    orderItemLst = orderItemLst.concat(pkgGroup?.products)
                }
            })
        }
        setAllOrderItem(orderItemLst)
    }, [order, prodLst])
    return {
        prodLst,
        loading: false,
        allOrderItem,
        setIsActive,
        setAllIsActive,
        setSingleReturnProductActive,
        setIsReturnListActive,
        refreshOrderData
    }
}

export const useOrderUserInfo = (createdByGPId: string) => {
    const [userData, setUserData] = useState<any>(null)
    useEffect(() => {
        OrderService.setOrderUserData(createdByGPId, setUserData)
    }, [createdByGPId])
    return { userData }
}

export const useOrderCount = (orders: any[]) => {
    const [orderCount, setOrderCount] = useState({
        plannedCases: 0,
        orderCases: 0,
        returns: 0
    })

    useEffect(() => {
        if (orders) {
            OrderService.calculateOrderCasesForOrders(orders, setOrderCount)
        }
    }, [orders])

    return orderCount
}

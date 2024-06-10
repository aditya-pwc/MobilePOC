import { useEffect, useMemo, useState } from 'react'
import { syncDownObj, syncDownObjWithIds } from '../api/SyncUtils'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import { getStringValue } from '../utils/LandingUtils'
import _ from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { CartItemState, selectPAProducts, setCartItems } from '../redux/Slice/PriorityCartSlice'
import {
    ProductForCart,
    init as initPriorityProductSelect,
    selectProductsForCart,
    selectTotalCases,
    upsertProduct
} from '../redux/Slice/PriorityProductSelectSlice'
import AsyncStorage from '@react-native-async-storage/async-storage'
export const useGetKamPriorityProducts = (prodInfo: any, pageSize: number, retailStore: any, prodSequence?: number) => {
    // id: Product Attribute item Id that's generated on FE
    const {
        id: productAttributeId,
        channel,
        category,
        subCategory,
        pkgMaterial,
        pkgAggregate,
        pkgSize,
        trademark,
        brand,
        subBrand
    } = prodInfo
    const productsForCart = useSelector(selectProductsForCart)
    const totalAddedQuantity = useSelector(selectTotalCases)
    const dispatch = useDispatch()

    const [priorityProducts, setPriorityProducts] = useState<any[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [hasMoreData, setHasMoreData] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // searchKey should be the final value for searching, any debouncing or length condition
    // should be processed before setSearchKey
    const [searchKey, setSearchKey] = useState<string>('')

    const paProducts = useSelector(selectPAProducts(productAttributeId))
    const mapPaProducts = useMemo(() => {
        const map: { [key: string]: any } = {}
        if (paProducts) {
            paProducts.forEach((prod) => {
                map[prod.id] = prod
            })
        }
        return map
    }, [paProducts])

    const pkgAggregateQuery = pkgAggregate ? ` AND Package_Aggregate_Code__c = '${pkgAggregate}'` : ''
    const pkgSizeQuery = pkgSize ? ` AND Package_Group_Code__c = '${pkgSize}'` : ''
    const trademarkQuery = trademark ? ` AND Trademark_Code__c = '${trademark}'` : ''
    const brandQuery = brand ? ` AND Brand_Total_Code__c = '${brand}'` : ''
    const subBrandQuery = subBrand ? ` AND Sub_Brand_Code__c = '${subBrand}'` : ''
    const searchProductQuery = searchKey
        ? ' AND (' +
          ` ProductCode LIKE '%${searchKey}%'` +
          ` OR Material_Unique_Id__c LIKE '%${searchKey}%'` +
          ` OR Sub_brand__c LIKE '%${searchKey}%'` +
          ` OR Package_Group_Name__c LIKE '%${searchKey}%'` +
          ' )'
        : ' '

    const productListingQuery = `SELECT Inven_Id__c FROM Product_Listing__c WHERE Inven_Avail_Flag__c = TRUE AND Level__c = 'Location' AND Level_Value__c = '${retailStore.LOC_PROD_ID__c}'`

    const commonWhereStr =
        `WHERE IsActive = true AND PROD_MIX_CDE__c = '${channel[0]}' AND Category_Aggregate_Code__c = '${category}' AND Product_Group_Code__c = '${subCategory}' AND Material_Name__c = '${pkgMaterial}'` +
        pkgAggregateQuery +
        pkgSizeQuery +
        trademarkQuery +
        brandQuery +
        subBrandQuery +
        searchProductQuery

    const getProductsOfOneGroup = async (groupName: string, listingDataIds: string[]) => {
        const list = await syncDownObjWithIds(
            'Product2',
            ['Id', 'Sub_Brand__c', 'ProductCode', 'Package_Group_Name__c', 'Material_Unique_ID__c'],
            listingDataIds,
            true,
            false,
            ` ${commonWhereStr.replace(
                'WHERE ',
                ''
            )} AND Package_Group_Name__c = '${groupName}' ORDER BY Sub_Brand__c, Material_Unique_ID__c LIMIT 50`,
            'Material_Unique_ID__c'
        )

        return list || []
    }

    const fetchProductData = async (offsetQuery: string, newOffset: number) => {
        try {
            setIsLoading(true)
            const productListingResult = await syncDownObj(
                'Product_Listing__c',
                encodeURIComponent(productListingQuery),
                false
            )
            const productListingData = productListingResult?.data.map((dataItem) => dataItem.Inven_Id__c) || []
            if (productListingData.length) {
                const productGroupResult = await syncDownObjWithIds(
                    'Product2',
                    ['Package_Group_Name__c'],
                    productListingData,
                    true,
                    false,
                    ` ${commonWhereStr.replace('WHERE ', '')} GROUP BY Package_Group_Name__c ${offsetQuery}`,
                    'Material_Unique_ID__c'
                )

                const productGroupData = _.uniqBy(productGroupResult, 'Package_Group_Name__c') || []
                const result: any[] = []
                const needAuthProducts: any[] = JSON.parse(
                    ((await AsyncStorage.getItem('NeedAuthProducts')) as any) || JSON.stringify([])
                )
                for (const group of productGroupData) {
                    const productsOfOneGroup = await getProductsOfOneGroup(
                        group.Package_Group_Name__c,
                        productListingData
                    )
                    const groupByProducts = _.groupBy(productsOfOneGroup, 'ProductCode')
                    const productList = Object.values(groupByProducts)
                        .map((group) => {
                            const filteredGroup = _.filter(
                                group,
                                (item) => !needAuthProducts.includes(item.Material_Unique_ID__c)
                            )
                            return filteredGroup.length > 0 ? [filteredGroup[0]] : [group[0]]
                        })
                        .flat()
                    result.push({
                        groupName: group.Package_Group_Name__c,
                        isExpand: false,
                        products: productList.map((product) => {
                            let quantity = mapPaProducts[product.Id] ? mapPaProducts[product.Id].quantity : 0

                            const productForCart = productsForCart.find(
                                (item) => item.groupName === group.Package_Group_Name__c && item.data.Id === product.Id
                            )

                            if (productForCart) {
                                quantity = productForCart.quantity
                            }

                            return {
                                ...product,
                                // Combine cart quantity info
                                quantity: quantity,
                                isNeedsAuth: needAuthProducts?.includes(product.Material_Unique_ID__c)
                            }
                        })
                    })
                }

                if (newOffset > 0) {
                    setPriorityProducts((preList) => [...preList, ...result])
                } else {
                    setPriorityProducts(result)
                }
                setHasMoreData(productGroupData.length === pageSize)
                setIsLoading(false)
            }
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            setPriorityProducts([])
            await storeClassLog(
                Log.MOBILE_ERROR,
                'fetchProductData',
                'Get KAM Priority Produts:' + getStringValue(error)
            )
        }
    }

    useEffect(() => {
        // init productsForCart with user temporary cart
        const productsForCart: ProductForCart[] = []

        paProducts.forEach((cartItem) => {
            productsForCart.push({
                groupName: cartItem.packageGroupName,
                quantity: Number(cartItem.quantity),
                data: {
                    Id: cartItem.id,
                    Sub_Brand__c: cartItem.subBrand,
                    ProductCode: cartItem.productCode,
                    Package_Group_Name__c: cartItem.packageGroupName,
                    Material_Unique_ID__c: cartItem.materialUniqueID
                }
            } as unknown as ProductForCart)
        })
        dispatch(initPriorityProductSelect({ productsForCart }))

        return () => {
            dispatch(initPriorityProductSelect({ productsForCart: null }))
        }
    }, [])

    useEffect(() => {
        const newOffset = (currentPage - 1) * pageSize
        const offsetQuery = `LIMIT ${pageSize} OFFSET ${newOffset}`

        fetchProductData(offsetQuery, newOffset)
    }, [currentPage, searchKey])

    const setIsExpand = (needToExpandName?: string) => {
        setPriorityProducts(
            priorityProducts.map((el) => {
                if (el.groupName === needToExpandName) {
                    return {
                        ...el,
                        isExpand: !el.isExpand
                    }
                }
                return el
            })
        )
    }

    const setAllIsExpand = (isExpand: boolean) => {
        setPriorityProducts(
            priorityProducts.map((el) => {
                return {
                    ...el,
                    isExpand
                }
            })
        )
    }

    const setQuantity = (quantity: string, currentGroupName: string, Id: string) => {
        let theProduct = null

        priorityProducts.forEach((el) => {
            el.products.forEach((prodItem: any) => {
                if (el.groupName === currentGroupName && prodItem.Id === Id) {
                    theProduct = prodItem
                }
            })
        })

        if (theProduct) {
            dispatch(
                upsertProduct({
                    groupName: currentGroupName,
                    quantity: quantity,
                    data: theProduct
                })
            )
        } else {
            storeClassLog(
                Log.MOBILE_ERROR,
                'useGetKamPriorityProducts',
                `setQuantity: quantity=${quantity}, currentGroupName=${currentGroupName}, Id=${Id}`
            )
            return
        }

        const tempPriorityProducts = _.cloneDeep(priorityProducts)

        // quantity reacts to the ui
        const newPriorityProducts = tempPriorityProducts.map((el) => {
            el.products = el.products.map((prodItem: any) => {
                if (el.groupName === currentGroupName && prodItem.Id === Id) {
                    return {
                        ...prodItem,
                        quantity: quantity
                    }
                }
                return prodItem
            })
            return el
        })

        setPriorityProducts(newPriorityProducts)
    }

    const setCart = () => {
        const cartItems: CartItemState[] = []

        if (typeof prodSequence === 'number') {
            productsForCart.forEach((product) => {
                const newCartItem: CartItemState = {
                    groupName: product.groupName,
                    productAttributeId: product.data.Id,
                    products: [
                        {
                            id: product.data.Id,
                            subBrand: product.data.Sub_Brand__c,
                            productCode: product.data.ProductCode,
                            packageGroupName: product.data.Package_Group_Name__c,
                            materialUniqueID: product.data.Material_Unique_ID__c,
                            quantity: Number(product.quantity),
                            productSequence: prodSequence
                        }
                    ]
                }

                const groupCart = cartItems.find((item) => item.groupName === product.groupName)
                if (groupCart) {
                    groupCart.products.push(newCartItem.products[0])
                } else {
                    cartItems.push(newCartItem)
                }
            })

            // refresh the cart
            dispatch(setCartItems({ productAttributeId, cartItems }))
        }
    }

    return {
        priorityProducts,
        setIsExpand,
        setAllIsExpand,
        setQuantity,
        setCart,
        setCurrentPage,
        setSearchKey,
        hasMoreData,
        isLoading,
        totalAddedQuantity
    }
}

export const useStorageNeedAuthProducts = (retailStore: any) => {
    const [isFetchingProducts, setIsFetchingProducts] = useState<boolean>(false)
    const [needAuthProducts, setNeedAuthProducts] = useState<string[]>([])

    const fetchAndStorageNeedAuthProducts = async (uniqId: string) => {
        try {
            setIsFetchingProducts(true)
            const authProductsQuery = `SELECT Id, Inven_Id__c, Target_Value__c, Target_Level__c FROM Product_Exclusion__c WHERE Is_Active__c = TRUE AND Target_Value__c = '${uniqId}'`
            const authProductsResult = await syncDownObj('Product_Exclusion__c', authProductsQuery, false)
            const authProductsMaterialIds = authProductsResult?.data.map((item) => item.Inven_Id__c) || []
            setNeedAuthProducts(authProductsMaterialIds)
            await AsyncStorage.setItem('NeedAuthProducts', JSON.stringify(authProductsMaterialIds))
            setIsFetchingProducts(false)
        } catch (error) {
            setIsFetchingProducts(false)
            storeClassLog(
                Log.MOBILE_ERROR,
                'fetchAndStorageNeedAuthProducts',
                'Get Customer Needs Auth Products:' + getStringValue(error)
            )
        }
    }

    useEffect(() => {
        const customerUniqId = retailStore['Account.CUST_UNIQ_ID_VAL__c']
        customerUniqId && fetchAndStorageNeedAuthProducts(customerUniqId)
    }, [retailStore])

    return { isFetchingProducts, needAuthProducts }
}

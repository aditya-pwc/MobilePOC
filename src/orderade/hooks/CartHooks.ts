/**
 * @description product selling hooks.
 * @author Qiulin Deng
 * @email qiulin.deng@pwc.com
 * @date 2023-03-20
 */
import { useState, useEffect, useRef } from 'react'
import { CartDetail } from '../interface/CartDetail'
import _ from 'lodash'
import { MyDayVisitModel } from '../interface/MyDayVisit'
import CartService from '../service/CartService'
import { ReturnCartItem } from '../interface/ReturnProduct'

export const useCart = (visitUniqueId: string, visit?: MyDayVisitModel) => {
    const [cartData, setCartData] = useState<Array<ReturnCartItem>>([])
    const needCleanCartItem = useRef<boolean>(true)
    const cartRef = useRef(cartData)

    useEffect(() => {
        cartRef.current = cartData
    }, [cartData])

    const refresh = async () => {
        if (needCleanCartItem.current && visit) {
            const { CustUniqId, AccountId } = visit
            await CartService.cleanCartItem(visitUniqueId, CustUniqId, AccountId)
            needCleanCartItem.current = false
        }
        CartService.getCartItems(visitUniqueId).then((cartData) => {
            setCartData(cartData)
        })
    }

    const refreshOnGoingCartData = async () => {
        CartService.getCartItemsOnGoingOnly(visitUniqueId).then((onGoingCartData) => {
            setCartData([...cartData.filter((el) => el.OrderCartIdentifier === visitUniqueId), ...onGoingCartData])
        })
    }

    return { cartData, setCartData, refresh, refreshOnGoingCartData, cartRef }
}

export const useCartDetail = (visit: MyDayVisitModel, orderCartIdentifier: string) => {
    const [cartDetail, setCartDetail] = useState<CartDetail | null>(null)
    const cartDetailRef = useRef(cartDetail)

    useEffect(() => {
        cartDetailRef.current = cartDetail
    }, [cartDetail])

    const refreshCartDetail = async (): Promise<CartDetail> => {
        const cartDetail = await CartService.getCartDetailWithDefaultDeliveryDate(orderCartIdentifier, visit)
        setCartDetail(cartDetail)
        return cartDetail
    }

    return { cartDetail, setCartDetail, refreshCartDetail, cartDetailRef }
}

export const useActivatedProdNum = (prodLst: Array<any>) => {
    const [totalActivatedProd, setTotalActivatedProd] = useState(0)
    useEffect(() => {
        let count = 0
        if (!_.isEmpty(prodLst)) {
            prodLst.forEach((el) => {
                if (el?.Is_Visible_Product__c || el?.is_Visible_Product__c) {
                    count++
                }
            })
            setTotalActivatedProd(count)
        } else {
            setTotalActivatedProd(0)
        }
    }, [prodLst])
    return { totalActivatedProd }
}

export const useCartPrice = (cartData: Array<ReturnCartItem | any>, AccountId: string) => {
    const [totalQty, setTotalQty] = useState(0)
    const [saleTotalQty, setSaleTotalQty] = useState(0)
    const [returnTotalCs, setReturnTotalCs] = useState('')
    const [returnTotalUn, setReturnTotalUn] = useState(0)
    const [returnTotalPrice, setReturnTotalPrice] = useState(0)
    const [totalPrice, setTotalPrice] = useState(0)
    const [tax, setTax] = useState(0)

    const DESPOSITS = 0
    const CHARGES = 0
    const getGrandTotal = () => {
        return (
            parseFloat(totalPrice.toFixed(2)) +
            parseFloat(tax.toFixed(2)) +
            parseFloat(DESPOSITS.toFixed(2)) +
            parseFloat(CHARGES.toFixed(2))
        ).toFixed(2)
    }

    useEffect(() => {
        const { qty, returnCs, returnUn, returnPrice, salePrice } = CartService.calcTotalForCartItems(cartData)
        const negativeFlag = returnCs > 0 || returnUn > 0 ? '-' : ''
        setTotalQty(qty - returnCs)
        setSaleTotalQty(qty)
        setReturnTotalCs(`${negativeFlag}${returnCs}`)
        setReturnTotalUn(returnUn)
        setReturnTotalPrice(returnPrice)
        setTotalPrice(salePrice - returnPrice)
        CartService.retrieveTaxForBCDCustomer(AccountId, setTax, qty, salePrice - returnPrice)
    }, [cartData])

    return { totalQty, totalPrice, tax, getGrandTotal, saleTotalQty, returnTotalCs, returnTotalUn, returnTotalPrice }
}

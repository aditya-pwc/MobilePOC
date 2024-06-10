import { useEffect, useRef, useState } from 'react'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import ProductService from '../../service/ProductService'
import { CartItem } from '../../interface/CartItem'
import CartService from '../../service/CartService'
import CommonService from '../../service/CommonService'

export const PriceMissingCheckEffect = (
    cartData: CartItem[],
    orderCartIdentifier: string,
    setPriceMissingCheck?: Function,
    setReturnPriceMissingCheck?: Function
) => {
    useEffect(() => {
        const priceMissingCheck = cartData
            .filter((cartItem) => cartItem.OrderCartIdentifier === orderCartIdentifier)
            .some((cartItem) => {
                return CartService.checkCartItemPriceMissing(cartItem, false)
            })
        const returnPriceMissingCheck = cartData
            .filter((cartItem) => cartItem.OrderCartIdentifier !== orderCartIdentifier)
            .some((cartItem) => {
                return CartService.checkCartItemPriceMissing(cartItem, true)
            })
        setPriceMissingCheck?.(priceMissingCheck)
        setReturnPriceMissingCheck?.(returnPriceMissingCheck)
    }, [cartData])
}

export const useRecordsPagination = (
    fields: Array<string>,
    query: string,
    soupName: string,
    transformRecords?: Function,
    searchStr?: string,
    setIsLoading?: Function,
    pageSize?: number
) => {
    const PAGE_SIZE = pageSize || 2
    // need to wait for default delivery date to populate before loading list
    const readyToRender = useRef<boolean>(false)
    const [records, setRecords] = useState<Array<any>>([])
    // The original offset of the page is always 0.
    const totalPageRef = useRef<number>(0)
    // The cursor of the smart store.
    const cursorRef = useRef<any>(null)
    const currentPageRef = useRef<number>(0)
    const loading = useRef<boolean>(false)
    const [hasAdded, setHasAdded] = useState(false)
    const createNewCursor = async () => {
        try {
            !searchStr && global.$globalModal.openModal()
            setIsLoading && setIsLoading(true)
            const { cursor, result } = await ProductService.createNewCursorForProductList(
                soupName,
                query,
                fields,
                PAGE_SIZE
            )
            const _result = transformRecords ? await transformRecords(result) : result
            setRecords(_result)
            cursorRef.current = cursor
            totalPageRef.current = cursor.totalPages as number
            currentPageRef.current = cursor.currentPageIndex as number
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: useRecordPagination',
                `Failed to createNewCursor for ${soupName}, error: ${ErrorUtils.error2String(err)}, query: ${query}, `
            )
        } finally {
            setTimeout(() => {
                global.$globalModal.closeModal()
            }, 1000)
            setIsLoading && setIsLoading(false)
        }
    }

    const refresh = async () => {
        if (!readyToRender.current || loading?.current) {
            return
        }
        loading.current = true
        try {
            const cursor = cursorRef.current
            if (cursor) {
                try {
                    await CommonService.closePaginationCursor(cursor)
                    await createNewCursor()
                } catch (err) {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'Orderade: useRecordPagination',
                        `Failed to closeCursor for ${soupName}, error: ${ErrorUtils.error2String(err)}, query: ${query}`
                    )
                }
            } else {
                await createNewCursor()
            }
        } finally {
            loading.current = false
        }
    }

    useEffect(() => {
        refresh()
    }, [query])

    const setOffset = async () => {
        if (loading?.current) {
            return
        }
        loading.current = true
        await CommonService.moveCursorToNextPage({
            cursorRef,
            records,
            currentPageRef,
            setRecords,
            totalPageRef,
            fields,
            soupName,
            transformRecords
        })
        loading.current = false
    }

    const setNeedRefreshCursor = () => {
        readyToRender.current = true
        refresh()
    }

    return {
        records,
        setOffset,
        hasAdded,
        setHasAdded,
        setNeedRefreshCursor,
        setRecords
    }
}

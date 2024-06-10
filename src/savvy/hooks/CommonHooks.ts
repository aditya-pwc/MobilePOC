/**
 * @description Common hooks.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 * @date 2021-04-12
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { syncDownObj } from '../api/SyncUtils'
import { Log } from '../../common/enums/Log'
import BaseInstance from '../../common/BaseInstance'
import { isPersonaFSR } from '../../common/enums/Persona'
import { updateCustomerDataFields } from './MapHooks'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

/**
 * @example
 * import { useInput } from './useInput'
 * const email = useInput('')
 <TextInput
 placeholder={'Email'}
 value={email.value}
 onChangeText={email.onChangeText}
 />
 OR
 <TextInput
 placeholder={'Email'}
 {...email}
 />
 */
export const useInput = (initValue: string) => {
    const [value, setValue] = useState(initValue)

    const handleChange = (text) => {
        setValue(text)
    }

    return {
        value,
        onChangeText: handleChange
    }
}

export const useAsyncEffect = <T, U extends any[]>(method: () => Promise<T>, deps: U) => {
    useEffect(() => {
        ;(async () => {
            await method()
        })()
    }, deps)
}

/**
 * @description Common hooks for the records pagination.
 * @param isFocused
 * @param isLoading
 * @param fields
 * @param query
 * @param soupName
 * @param refreshTimes
 */
export const useRecordsPagination = (
    isFocused: boolean,
    isLoading: boolean,
    fields,
    query,
    soupName,
    refreshTimes?: number
) => {
    const PAGE_SIZE = isPersonaFSR() ? 20 : 5
    const [records, setRecords] = useState([])
    // The original offset of the page is always 0.
    const [offset, setOffset] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    // The cursor of the smart store.
    const [cursor, setCursor] = useState(null)
    const [currentPage, setCurrentPage] = useState(null)
    const [hasAdded, setHasAdded] = useState(false)
    const [needRefreshCursor, setNeedRefreshCursor] = useState(false)
    const createNewCursor = async () => {
        const {
            cursor,
            // enrtries,
            result
        } = await BaseInstance.sfSoupEngine.createNewCursor(soupName, query, fields, PAGE_SIZE)
        setRecords(result)
        setCursor(cursor)
        setTotalPages(cursor.totalPages)
        setCurrentPage(cursor.currentPageIndex)
    }

    useEffect(() => {
        if ((isFocused && currentPage === null) || (isFocused && needRefreshCursor) || (isFocused && !isLoading)) {
            setHasAdded(false)
            setNeedRefreshCursor(false)
            if (cursor) {
                BaseInstance.sfSoupEngine.closeCursor(cursor).then(() => {
                    createNewCursor()
                })
            } else {
                createNewCursor()
            }
        }
    }, [isLoading, hasAdded, needRefreshCursor, query, isFocused, refreshTimes])

    useEffect(() => {
        if (offset > 0 && currentPage + 1 < totalPages) {
            BaseInstance.sfSoupEngine.moveCursorToNextPage(cursor).then((newCursor) => {
                const entries = newCursor.currentPageOrderedEntries
                const result: any = [
                    ...records,
                    ...BaseInstance.sfSoupEngine.buildOriginQueryResults(soupName, entries, fields)
                ]
                setRecords(result)
                setCurrentPage((currentPage) => {
                    return currentPage + 1
                })
                setCursor(newCursor)
                if (newCursor.totalPages === newCursor.currentPageIndex + 1) {
                    BaseInstance.sfSoupEngine.closeCursor(newCursor)
                }
            })
        }
    }, [offset])
    return {
        records,
        offset,
        setOffset,
        hasAdded,
        setHasAdded,
        setNeedRefreshCursor
    }
}

export const useDebounce = (fn: Function, delay: number, dep: Array<any> = []) => {
    useEffect(() => {
        const timer = setTimeout(fn, delay)
        return () => clearTimeout(timer)
    }, [...dep])
}

export const useSafeMemoryEffect = <T, U extends any[]>(method: () => T, deps: U) => {
    useEffect(() => {
        let isUnmounted = false
        if (isUnmounted) {
            return
        }
        method()
        return () => {
            isUnmounted = true
        }
    }, deps)
}

export const useThrottle = (fn: Function, delay: number, dep: any[] = []) => {
    let timer: any = null
    return useCallback(() => {
        if (!timer) {
            timer = setTimeout(() => {
                fn()
                timer = null
            }, delay)
        }
    }, [...dep])
}

/**
 * common use online pagination hooks
 * @param limit page size
 * @param isRefreshing refresh data flag
 * @param setIsRefreshing React SetState
 * @param query SOQL query string
 * @param objectName object name
 * @param isSearching optional param, is searching flag
 * @param sort optional param, sort
 * @returns {Object}
 */
export const useRecordsPaginationOnline = (
    limit: number,
    isRefreshing: boolean,
    setIsRefreshing: any,
    query: string,
    objectName: string,
    isSearching?: boolean,
    sort?: string
) => {
    const [records, setRecords] = useState<any[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [hasMoreData, setHasMoreData] = useState<boolean>(true)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [needRefreshData, setNeedRefreshData] = useState<boolean>(false)

    useEffect(() => {
        if (isRefreshing) {
            if (currentPage === 1) {
                setNeedRefreshData((prevFlag) => !prevFlag)
            } else {
                setCurrentPage(1)
                setHasMoreData(true)
            }
        }
    }, [isRefreshing])

    useEffect(() => {
        if (currentPage === 1) {
            setNeedRefreshData((prevFlag) => !prevFlag)
        }
        setCurrentPage(1)
        setHasMoreData(true)
    }, [query, sort])

    useEffect(() => {
        if (isLoading) {
            isRefreshing && setIsRefreshing(false)
            return
        }
        !isSearching && setIsLoading(true)
        const newOffset = (currentPage - 1) * limit
        const offsetQuery = `LIMIT ${limit} OFFSET ${newOffset}`

        syncDownObj(objectName, encodeURIComponent(query + offsetQuery), false)
            .then((data) => {
                const list = data?.data ? updateCustomerDataFields(data?.data) : []
                if (newOffset > 0) {
                    setRecords((preList) => [...preList, ...list])
                } else {
                    setRecords(list)
                }
                setHasMoreData(list.length === limit)
                setIsLoading(false)
                isRefreshing && setIsRefreshing(false)
            })
            .catch(async (err) => {
                await storeClassLog(
                    Log.MOBILE_ERROR,
                    'useRecordsPaginationOnline',
                    `${objectName}:` + ErrorUtils.error2String(err)
                )
                setIsLoading(false)
                isRefreshing && setIsRefreshing(false)
            })
    }, [currentPage, needRefreshData])

    return {
        records,
        setCurrentPage,
        hasMoreData,
        isLoading
    }
}

/**
 * Custom React Hook to get the previous value of a variable/state, especially Object.
 *
 * @param value - The current value whose previous value needs to be tracked.
 * @returns The previous value of the input.
 */
export const usePrevious = (value: any) => {
    const ref = useRef()

    useEffect(() => {
        ref.current = value
    }, [value])

    return ref.current
}

/**
 * @description Change Ownership hooks.
 * @author Sylvia
 * @email shangmin.dou@pwc.com
 * @date 2021-04-12
 */
import { useState, useEffect } from 'react'
import { restDataCommonCall } from '../api/SyncUtils'
import { useDebounce } from './CommonHooks'

export const useKeyAccount = (searchV: string, hierarchy: Array<string>, parentId?: string) => {
    const [keyAccount, setKeyAccount] = useState([])
    const [searchValue, setSearchValue] = useState('')

    useDebounce(
        () => {
            setSearchValue(searchV)
        },
        500,
        [searchV]
    )
    const hierarchyLstId = hierarchy.map((v) => `'${v}'`).join(',')
    useEffect(() => {
        if (searchValue?.length > 1) {
            const searchText = searchValue?.replace(/[\\$()*+.[?^{|]/g, '.')

            const addParentIdQueryCondition = parentId ? ` AND  Parent.Id='${parentId}'` : ''

            const path =
                `query/?q=SELECT Id, CUST_LVL__c, Name FROM Account WHERE CUST_LVL__c IN (${hierarchyLstId})` +
                ` AND Name LIKE '%${searchText}%'` +
                `${addParentIdQueryCondition}`

            restDataCommonCall(path, 'GET').then((accountVal) => {
                setKeyAccount(accountVal.data.records)
            })
        } else {
            setKeyAccount([])
        }
    }, [searchValue])
    return keyAccount
}

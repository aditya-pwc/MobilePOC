/**
 * @description Add Visit hooks.
 * @author Qiulin Deng
 * @email qiulin.deng@pwc.com
 * @date 2023-03-16
 */
import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import { AddVisitModel } from '../interface/AddVisitModel'
import { t } from '../../common/i18n/t'
import VisitService from '../service/VisitService'

const changeSelectStatus = (searchRes: Array<AddVisitModel>, item: AddVisitModel, val: boolean) => {
    searchRes.forEach((element) => {
        if (element.Id === item.Id) {
            element.isAdded = val
        }
    })
    return searchRes
}

export const useRetailStoreBySearch = (
    searchStr: string,
    addVisitList: Array<AddVisitModel>,
    setAddVisitList: Function
) => {
    const [rsData, setRsData] = useState<Array<AddVisitModel>>([])

    const addVisits = (item: AddVisitModel, type: string) => {
        const newAddList = [...addVisitList]
        if (type === 'add' && newAddList.length < 10) {
            const newSearchRes = changeSelectStatus(rsData, item, true)
            setRsData(newSearchRes)
            if (addVisitList.findIndex((element) => element.Id === item.Id) === -1) {
                item.isAdded = true
                newAddList.push(item)
            }
        } else if (type === 'reduce' && newAddList.length <= 10) {
            const newSearchRes = changeSelectStatus(rsData, item, false)
            setRsData(newSearchRes)
            const index = addVisitList.findIndex((element) => element.Id === item.Id)
            newAddList.splice(index, 1)
        } else {
            return Alert.alert(t.labels.PBNA_MOBILE_ADD_VISIT_LIMIT)
        }

        setAddVisitList(newAddList)
    }

    useEffect(() => {
        VisitService.setRetailStoreDataBySearch(searchStr, addVisitList, setRsData)
    }, [searchStr])
    return { rsData, addVisits }
}

import { useEffect, useState } from 'react'
import { RetailStoreModel } from '../pages/MyDayScreen/MyVisitDetailViewModel'
import { useDropDown } from '../../common/contexts/DropdownContext'
import VisitService from '../service/VisitService'

export const useRetailStore = (storeId: string) => {
    const [visitStore, setVisitStore] = useState<RetailStoreModel>()
    const { dropDownRef } = useDropDown()

    const fetStoreData = async () => {
        const store = await VisitService.fetchRetailStoreData(storeId, dropDownRef)
        setVisitStore(store)
    }

    useEffect(() => {
        fetStoreData()
    }, [storeId])

    return visitStore
}

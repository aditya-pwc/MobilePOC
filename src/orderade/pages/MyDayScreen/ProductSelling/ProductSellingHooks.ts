import { useEffect } from 'react'
import ProductService from '../../../service/ProductService'

export const useFrequencyEffect = (accountId: string, setFrequency: Function) => {
    useEffect(() => {
        ProductService.getRouteFrequencyForVisit(accountId).then((frequency) => {
            setFrequency(frequency || 0)
        })
    }, [accountId])
}

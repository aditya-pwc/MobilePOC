import { CartDetail } from './CartDetail'
import { MyDayVisitModel } from './MyDayVisit'
import { ReturnCartItem } from './ReturnProduct'

export interface PushCartToSFParams {
    visit: MyDayVisitModel
    cartData: Array<ReturnCartItem>
    notes: string
    PONumber: string
    now: number
    cartDetail: CartDetail
    isReturnOnly?: boolean
    notesTime?: number | null
}

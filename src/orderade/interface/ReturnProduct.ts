import { t } from '../../common/i18n/t'
import { CartDetail } from './CartDetail'
import { CartItem } from './CartItem'
import { MyDayVisitModel } from './MyDayVisit'
import { StoreProduct } from './StoreProduct'

export interface ReturnProductProps {
    searchStr: string
    store: MyDayVisitModel
    appliedList: ReturnProductListModel[]
    setAppliedList: Function
    pageName: string
    isReturnOnly: boolean
    setIsLoading?: Function
    refreshAppliedList?: Function
    deliveryDate?: string
}

export interface ReturnProductListModel {
    label: string
    isActive: boolean
    packageCases?: number
    packageUnits?: number
    products: Array<ReturnProduct>
}

export interface ReturnKPI {
    name: string
    total: string | undefined
    cases: string | undefined
    units: string | undefined
}

export const initReturnData: ReturnKPI[] = [
    { name: t.labels.PBNA_MOBILE_BREAKAGE, total: '$ 0.00', cases: '', units: '' },
    { name: t.labels.PBNA_MOBILE_OUT_OF_DATE, total: '$ 0.00', cases: '', units: '' },
    { name: t.labels.PBNA_MOBILE_SALEABLE, total: '$ 0.00', cases: '', units: '' }
]

export interface ReturnCartItem extends CartItem {
    BreakageCases: string
    BreakageUnits: string
    BreakageTotal: string
    OutOfDateCases: string
    OutOfDateUnits: string
    OutOfDateTotal: string
    SaleableCases: string
    SaleableUnits: string
    SaleableTotal: string
    ReturnApplied: boolean
}

export interface ReturnProduct extends StoreProduct {
    breakageCases: string
    breakageUnits: string
    breakageTotal: string
    outOfDateCases: string
    outOfDateUnits: string
    outOfDateTotal: string
    saleableCases: string
    saleableUnits: string
    saleableTotal: string
    cartItemSoupEntryId?: string
    isActiveReturn: boolean
}

export interface CardDetailEffectProp {
    isReturnOnly: boolean
    cartDetail: CartDetail | null
    visit: MyDayVisitModel
    setNotes: Function
    setStartDate: Function
    setPoNumber: Function
    setEndDate: Function
    setNotesRecordTime: Function
}

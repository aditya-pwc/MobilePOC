import { Visit } from './VisitModel'

export interface MyDayVisitModel extends Partial<Visit> {
    Id: string
    Status: string
    StoreName: string
    City: string
    State: string
    StateCode: string
    PostalCode: string
    RetailStoreId: string
    Street: string
    PhoneNum: string
    Latitude: string
    Longitude: string
    CustUniqId: string
    Subject?: string
    ActualStartTime?: string
    ActualEndTime?: string
    ActualEndTimeUnix: number
    ReturnCs: number
    ReturnUn: number
    SoldQty: number
    PlannedCs: number
    totalOrder: number
    attributes?: {
        type: string
    }
    Geofence: string
    AccountId: string
    _soupEntryId: string
    User: string
    VlRefId: string
    VlSubType: string
    RteId: string
    GTMUId: string
    VlDate: string
    OrderCartIdentifier: string
    VisitLegacyId: string
    completedOrder: number
    VDelDate: string
    VDelDate2: string
    VDelDate3: string
    VNDelDate: string
    VNDelDate2: string
    VNDelDate3: string
    VDelGroup: Array<string>
    onGoingOrderNum: number
    DeliveryMethodCode: string
    isRouteInfo: boolean
    inGeoFence?: boolean
    ASASCompliant?: boolean
}

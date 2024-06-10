import { Visit } from './VisitModel'

export interface AddVisitModel extends Partial<Visit> {
    AccountId: string
    Name: string
    Street: string
    City: string
    State: string
    PostalCode: string
    Id: string
    isAdded: boolean
    CustomerId: string
    RouteId: string
    GTMUId: string
    Source?: 'online'
}

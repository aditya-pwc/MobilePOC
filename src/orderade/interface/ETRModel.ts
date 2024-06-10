import { RouteSalesGeo } from './RouteSalesGeoModel'
import { User } from './UserModel'

// eslint disable reason: Keep object variable naming consistent with Salesforce.
/* eslint-disable camelcase */
export interface EmployeeToRoute {
    Route__r: RouteSalesGeo
    User__r: User
}

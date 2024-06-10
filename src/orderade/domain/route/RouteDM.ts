import CommonData from '../common/CommonData'
import RouteSync from './RouteSync'

export default class RouteDM {
    static checkIfValidLocation = RouteSync.checkIfValidLocation
    static checkIfValidRoute = RouteSync.checkIfValidRoute

    static async syncDownCurRoute() {
        const routeFields = CommonData.getAllFieldsByObjName('Route_Sales_Geo__c', 'Remote')
        return RouteSync.syncDownCurRoute(routeFields)
    }
}

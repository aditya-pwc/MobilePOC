import moment from 'moment'
import BaseInstance from '../../../common/BaseInstance'
import { CommonParam } from '../../../common/CommonParam'
import { Log } from '../../../common/enums/Log'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { RouteSalesGEOConstant } from '../../enum/Common'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'

export default class RouteSync {
    static async checkIfValidLocation() {
        try {
            const locations = await BaseInstance.sfSyncEngine.syncDown({
                name: 'Route_Sales_Geo__c',
                whereClause: `HRCHY_LVL__c = '${RouteSalesGEOConstant.RSG_HL_LOCATION}'
                    AND SLS_UNIT_ACTV_FLG_VAL__c = '${RouteSalesGEOConstant.RSG_SLS_UNIT_FLG_ACTIVE}'
                    AND Operational_Location__c = TRUE
                    AND SLS_UNIT_ID__c = '${CommonParam.userLocationId}'`,
                updateLocalSoup: false,
                fields: [
                    'Id, ProdList_Batch_Fail_Date__c, ProdExcl_Batch_Fail_Date__c, CustDeal_Batch_Fail_Date__c, DealProdList_Batch_Fail_Date__c'
                ],
                allOrNone: true
            })
            return locations
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'checkIfValidLocation',
                'checkIfValidLocation failed' + ErrorUtils.error2String(e)
            )
            return []
        }
    }

    static async checkIfValidRoute() {
        try {
            const today = moment().format(TIME_FORMAT.Y_MM_DD)
            const routes = await BaseInstance.sfSyncEngine.syncDown({
                name: 'Route_Sales_Geo__c',
                whereClause: `HRCHY_LVL__c = '${RouteSalesGEOConstant.RSG_HL_ROUTE}' 
                    AND (RTE_END_DT__c = NULL OR RTE_END_DT__c >= ${today}) 
                    AND (
                            RTE_TYP_CDV__c = '${RouteSalesGEOConstant.RSG_RTE_TYPE_CDV_001}' 
                            OR RTE_TYP_CDV__c = '${RouteSalesGEOConstant.RSG_RTE_TYPE_CDV_003}'
                        ) 
                    AND RTE_STRT_DT__c <= ${today} 
                    AND Id = '${CommonParam.userRouteId}'`,
                updateLocalSoup: false,
                fields: [
                    'Id, ProdList_Batch_Fail_Date__c, ProdExcl_Batch_Fail_Date__c, CustDeal_Batch_Fail_Date__c, DealProdList_Batch_Fail_Date__c'
                ],
                allOrNone: true
            })
            return routes
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'checkIfValidRoute',
                'checkIfValidRoute failed' + ErrorUtils.error2String(e)
            )
            return []
        }
    }

    static syncDownCurRoute(routeFields: string[]) {
        return BaseInstance.sfSyncEngine.syncDown({
            name: 'Route_Sales_Geo__c',
            whereClause: `Id = '${CommonParam.userRouteId}'`,
            updateLocalSoup: true,
            fields: routeFields,
            allOrNone: true
        })
    }
}

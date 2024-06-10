import BaseInstance from '../../../common/BaseInstance'
import { CommonParam } from '../../../common/CommonParam'
import { Persona } from '../../../common/enums/Persona'
import { batchSynDown } from '../../utils/CommonUtil'
import CommonData from '../common/CommonData'

export default class UserSync {
    static async isOrderadePSR() {
        // Should change to common lib after PBNA changed pulling data lib
        let isPSR = false
        try {
            const res = await BaseInstance.sfHttpClient.callData(
                `query/?q=SELECT Persona__c FROM User WHERE Id='${CommonParam.userId}'`,
                'GET'
            )
            isPSR = res?.data?.records[0]?.PERSONA__c === Persona.PSR
        } catch {
            return isPSR
        }
        return isPSR
    }

    static synDownUser(visitorArrByUser: any[], userSyncFields: string[]) {
        return batchSynDown(visitorArrByUser, {
            name: 'User',
            whereClause: `Id IN {BatchIds}`,
            updateLocalSoup: true,
            fields: userSyncFields,
            allOrNone: true
        })
    }

    static synDownUserStats(visitorArrByUser: any[], userSyncFields: string[]) {
        return batchSynDown(visitorArrByUser, {
            name: 'User_Stats__c',
            whereClause: `User__c IN {BatchIds}`,
            updateLocalSoup: true,
            fields: userSyncFields,
            allOrNone: true
        })
    }

    static syncDownUserById(userGPIds: string, userSyncFiled: string[]) {
        return BaseInstance.sfSyncEngine.syncDown({
            name: 'User',
            whereClause: `GPID__c IN (${userGPIds})`,
            updateLocalSoup: true,
            fields: userSyncFiled,
            allOrNone: true
        })
    }

    static syncDownUserStatsById(userGPIds: string, userStatsSyncFiled: string[]) {
        return BaseInstance.sfSyncEngine.syncDown({
            name: 'User_Stats__c',
            whereClause: `User__r.GPID__c IN (${userGPIds})`,
            updateLocalSoup: true,
            fields: userStatsSyncFiled,
            allOrNone: true
        })
    }

    static syncDownEmployeeToRouteById(userGPIds: string) {
        const etrSyncFields = CommonData.getAllFieldsByObjName('Employee_To_Route__c', 'Remote')
        return BaseInstance.sfSyncEngine.syncDown({
            name: 'Employee_To_Route__c',
            whereClause: `User__r.GPID__c IN (${userGPIds}) 
            AND Active_Flag__c = TRUE
            ORDER BY RLTNSHP_STRT_DT__c DESC`,
            updateLocalSoup: false,
            fields: etrSyncFields,
            allOrNone: true
        })
    }

    static upsertEmployeeToRoute(etrToDoLst: any[]) {
        return BaseInstance.sfSoupEngine.upsertWithExternalId('Employee_To_Route__c', etrToDoLst, true, true)
    }
}

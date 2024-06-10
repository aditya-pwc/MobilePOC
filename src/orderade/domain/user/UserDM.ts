import UserSync from './UserSync'
import { getIdClause } from '../../../common/utils/CommonUtils'
import CommonData from '../common/CommonData'

export default class UserDM {
    static async syncDownOrderRelatedData(userGPIds: string[]) {
        const userSyncFiled = CommonData.getAllFieldsByObjName('User', 'Remote')
        const userStatsSyncFiled = CommonData.getAllFieldsByObjName('User_Stats__c', 'Remote')
        // we should sync down ourselves because this is executed as part of pull down refresh
        if (userGPIds.length) {
            const tasks = []
            tasks.push(UserSync.syncDownUserById(getIdClause(userGPIds), userSyncFiled))
            tasks.push(UserSync.syncDownUserStatsById(getIdClause(userGPIds), userStatsSyncFiled))
            tasks.push(
                UserSync.syncDownEmployeeToRouteById(getIdClause(userGPIds)).then((etrLst) => {
                    if (etrLst.length) {
                        const etrToDoLst: any[] = []
                        userGPIds.forEach((v) => {
                            const match = etrLst.find((etr) => etr['User__r.GPID__c'] === v)
                            match && etrToDoLst.push(match)
                        })
                        if (etrToDoLst.length) {
                            UserSync.upsertEmployeeToRoute(etrToDoLst)
                        }
                    }
                })
            )
            await Promise.all(tasks)
        }
    }

    public static async isOrderadePSR() {
        return await UserSync.isOrderadePSR()
    }

    public static async synDownUser(visitorArrByUser: any[]) {
        const userSyncFields = CommonData.getAllFieldsByObjName('User', 'Remote')
        return UserSync.synDownUser(visitorArrByUser, userSyncFields)
    }

    public static async synDownUserStats(visitorArrByUser: any[]) {
        const statsSyncFields = CommonData.getAllFieldsByObjName('User_Stats__c', 'Remote')
        return UserSync.synDownUserStats(visitorArrByUser, statsSyncFields)
    }
}

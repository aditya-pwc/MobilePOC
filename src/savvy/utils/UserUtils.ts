/**
 * @description User Utils
 * @author Sheng Huang
 * @date 2021/9/27
 */
import { restDataCommonCall, syncDownObj, syncUpObjCreateFromMem } from '../api/SyncUtils'
import { CommonParam } from '../../common/CommonParam'
import { getAllFieldsByObjName } from './SyncUtils'

export const getUserStats = async () => {
    const { data } = await syncDownObj(
        'User_Stats__c',
        `SELECT Id, User__c, OwnerId From User_Stats__c Where User__c = '${CommonParam.userId}' AND RecordType.DeveloperName = 'Stats' LIMIT 1`
    )
    if (data.length === 0) {
        const statsIdList = await restDataCommonCall(
            "query/?q=Select Id FROM RecordType WHERE DeveloperName='Stats' ",
            'GET'
        )
        const statsId = statsIdList.data?.records[0]?.Id
        const userStatsToCreate = {
            User__c: CommonParam.userId,
            OwnerId: CommonParam.userId,
            RecordTypeId: statsId
        }
        // sync up User Stats
        await syncUpObjCreateFromMem('User_Stats__c', [userStatsToCreate])
    }
}

export const genGetUserStats = getUserStats

export const retrieveFSRAndPSRUser = async () => {
    await syncDownObj(
        'User',
        `SELECT ${getAllFieldsByObjName('User').join()} ` + "FROM User WHERE PERSONA__c = 'PSR' OR  PERSONA__c = 'FSR'"
    )
}

import {
    buildSyncDownPromise,
    executePromiseQueueWithReturn,
    removeLocalOutOfDateRecords,
    syncDownObj,
    syncDownObjByIds,
    syncUpObjUpdateFromMem
} from '../api/SyncUtils'
import { getAllFieldsByObjName, filterExistFields } from './SyncUtils'
import { CommonParam } from '../../common/CommonParam'
import _ from 'lodash'
import { Log } from '../../common/enums/Log'
import { promiseQueue } from '../api/InitSyncUtils'
import { genSyncDownLeadsGroupReqs } from './LeadUtils'
import { SoupService } from '../service/SoupService'
import { retrieveRetailStoreRelatedObjs } from './CustomerSyncUtils'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const syncDownManagerUserStats = async () => {
    const result = await syncDownObj(
        'User_Stats__c',
        'SELECT Id,User__c,relationship_begin_date__c,' +
            'relationship_end_date__c,relationship_active__c,manager__c,RecordTypeId ' +
            'FROM User_Stats__c WHERE manager__c = ' +
            `'${CommonParam.userId}' AND relationship_active__c = true ` +
            "AND RecordTypeId IN (SELECT Id FROM RecordType WHERE DeveloperName = 'Manager_Relationship')"
    )
    return result.data?.map((v) => {
        return v.User__c
    })
}

export const retrieveTeamMemberDetail = async () => {
    const teamMemberId = await syncDownManagerUserStats()
    if (!_.isEmpty(teamMemberId)) {
        const lstId = teamMemberId.map((v) => `'${v}'`).join(',')
        await syncDownObjByIds('User', getAllFieldsByObjName('User'), teamMemberId)
        await syncDownObj(
            'User_Stats__c',
            `SELECT ${getAllFieldsByObjName('User_Stats__c').join()} ` +
                `FROM User_Stats__c WHERE User__c IN (${lstId})`
        )
        const ETRList = await syncDownObj(
            'Employee_To_Route__c',
            `SELECT ${getAllFieldsByObjName('Employee_To_Route__c').join()} ` +
                `FROM Employee_To_Route__c WHERE User__c IN (${lstId}) AND Route__c != null And User__c != null`
        )
        if (!_.isEmpty(ETRList.data)) {
            await syncDownObjByIds('Route_Sales_Geo__c', getAllFieldsByObjName('Route_Sales_Geo__c'), ETRList.data)
        }
    }
}

export const updateUserStatus = async (updateObj, callback) => {
    try {
        const userStatusSyncUpFields = ['Id', 'relationship_end_date__c']
        await syncUpObjUpdateFromMem(
            'User_Stats__c',
            filterExistFields('User_Stats__c', [updateObj], userStatusSyncUpFields)
        )
        callback && callback()
    } catch (err) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'updateUserStatus',
            'update userStatus to backend: ' + ErrorUtils.error2String(err) + JSON.stringify(updateObj)
        )
    }
}

export const retrieveTeamMemberCustomers = async (removeOutOfDateRecords = false) => {
    const teamMemberId = await syncDownManagerUserStats()
    if (!_.isEmpty(teamMemberId)) {
        const teamMemberReqs: (() => Promise<any>)[] = []
        const teamMemberIds = _.chunk(teamMemberId, 500)
        teamMemberIds.forEach((teamMemberGroup) => {
            const teamMemberIdSuffix = teamMemberGroup.map((v) => `'${v}'`).join(',')
            teamMemberReqs.push(
                buildSyncDownPromise(
                    'AccountTeamMember',
                    `SELECT ${getAllFieldsByObjName('AccountTeamMember').join()} ` +
                        `FROM AccountTeamMember WHERE UserId IN (${teamMemberIdSuffix})`
                )
            )
        })
        const accountList = _.flatten(await executePromiseQueueWithReturn(teamMemberReqs))
        if (removeOutOfDateRecords) {
            await removeLocalOutOfDateRecords('AccountTeamMember', accountList)
        }
        if (!_.isEmpty(accountList)) {
            const accountReqs: (() => Promise<any>)[] = []
            const retailStoreReqs: (() => Promise<any>)[] = []
            const requestReqs: (() => Promise<any>)[] = []
            const accountIds = _.chunk(accountList, 500)
            accountIds.forEach((accountGroup) => {
                const accountIdSuffix = accountGroup.map((subAccountIds) => `'${subAccountIds.AccountId}'`).join(',')
                accountReqs.push(
                    buildSyncDownPromise(
                        'Account',
                        `SELECT ${getAllFieldsByObjName('Account').join()} ` +
                            `FROM Account WHERE Id IN (${accountIdSuffix})`
                    )
                )
                retailStoreReqs.push(
                    buildSyncDownPromise(
                        'RetailStore',
                        `SELECT ${getAllFieldsByObjName('RetailStore').join()} ` +
                            `FROM RetailStore WHERE AccountId IN (${accountIdSuffix})`
                    )
                )
                requestReqs.push(
                    buildSyncDownPromise(
                        'Request__c',
                        `SELECT ${getAllFieldsByObjName('Request__c').join()} ` +
                            `FROM Request__c WHERE customer__c IN (${accountIdSuffix})`
                    )
                )
            })
            const accountsList = _.flatten(await executePromiseQueueWithReturn(accountReqs))
            const retailStoreList = _.flatten(await executePromiseQueueWithReturn(retailStoreReqs))
            await executePromiseQueueWithReturn(requestReqs)
            if (removeOutOfDateRecords) {
                await removeLocalOutOfDateRecords('Account', accountsList)
                await removeLocalOutOfDateRecords('RetailStore', retailStoreList)
            }
            // fetch Key Accounts
            const retailStores = await SoupService.retrieveDataFromSoup('RetailStore', {}, [])
            const keyAccountDivisionIds = _.uniq(_.compact(retailStores.map((v) => v['Account.ParentId'])))
            const keyAccountDivisionData = await syncDownObjByIds(
                'Account',
                ['Id', 'Name', 'CUST_LVL__c', 'ParentId'],
                keyAccountDivisionIds as string[]
            )
            const keyAccountIds = _.uniq(_.compact(keyAccountDivisionData.map((v) => v.ParentId)))
            await syncDownObjByIds('Account', ['Id', 'Name', 'CUST_LVL__c', 'ParentId'], keyAccountIds)
            // fetch Other Objs
            await retrieveRetailStoreRelatedObjs(retailStores)
        }
    }
}

export const retrieveNewTeamMember = async (removeOutOfDateRecords = false) => {
    await promiseQueue(await genSyncDownLeadsGroupReqs())
    await retrieveTeamMemberCustomers(removeOutOfDateRecords)
}

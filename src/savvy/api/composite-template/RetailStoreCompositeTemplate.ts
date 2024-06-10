import { getAllFieldsByObjName } from '../../utils/SyncUtils'
import { CommonParam } from '../../../common/CommonParam'

export const genSingleRetailStoreCompositeGroup = (accountId: string) => {
    return [
        {
            method: 'GET',
            q:
                `SELECT ${getAllFieldsByObjName(
                    'RetailStore'
                ).join()} FROM RetailStore WHERE AccountId = '${accountId}'` +
                ` AND AccountId IN (SELECT AccountId FROM AccountTeamMember WHERE UserId='${CommonParam.userId}')`,
            referenceId: 'refRetailStores',
            name: 'RetailStore'
        }
    ]
}

export const genSingleRetailStoreRelationshipCompositeGroup = (accountId: string) => {
    return [
        {
            method: 'GET',
            q: `SELECT ${getAllFieldsByObjName(
                'RetailStore'
            ).join()} FROM RetailStore WHERE AccountId = '${accountId}'`,
            referenceId: 'refRetailStores',
            name: 'RetailStore'
        },
        {
            method: 'GET',
            q: `SELECT ${getAllFieldsByObjName('Contact').join()} FROM Contact WHERE AccountId = '${accountId}'`,
            referenceId: 'refContacts',
            name: 'Contact'
        }
    ]
}

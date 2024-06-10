import { getAllFieldsByObjName } from '../../utils/SyncUtils'

export const genSingleCustomerCompositeGroup = (AccountId: string) => {
    return [
        {
            method: 'GET',
            q: `SELECT ${getAllFieldsByObjName('Account').join()} FROM Account WHERE Id='${AccountId}'`,
            referenceId: 'refAccount',
            name: 'Account'
        },
        {
            method: 'GET',
            q: `SELECT ${getAllFieldsByObjName(
                'RetailStore'
            ).join()} FROM RetailStore WHERE AccountId='@{refAccount.records[0].Id}'`,
            referenceId: 'refRetailStore',
            name: 'RetailStore'
        }
    ]
}

export const genCustomerActivityDetailCompositeGroup = (AccountId: string) => {
    return [
        {
            method: 'GET',
            q: `SELECT ${getAllFieldsByObjName('Account').join()} FROM Account WHERE Id='${AccountId}'`,
            referenceId: 'refAccount',
            name: 'Account'
        },
        {
            method: 'GET',
            q: `SELECT ${getAllFieldsByObjName(
                'RetailStore'
            ).join()} FROM RetailStore WHERE AccountId='@{refAccount.records[0].Id}'`,
            referenceId: 'refRetailStore',
            name: 'RetailStore'
        },
        {
            method: 'GET',
            q: `SELECT ${getAllFieldsByObjName(
                'Visit'
            ).join()} FROM Visit WHERE PlaceId='@{refRetailStore.records[0].Id}' AND PlannedVisitStartTime>=LAST_N_DAYS:8 AND Status__c!='Removed' AND Status__c!='Planned' AND Status__c!='Pre-Processed' AND Status__c != 'Failed'`,
            referenceId: 'refVisit',
            name: 'Visit'
        }
    ]
}

export const genCustomerActivityUserDataCompositeGroup = (visitorIdList) => {
    return [
        {
            method: 'GET',
            q: `SELECT ${getAllFieldsByObjName('User').join()} FROM User WHERE id IN ('${visitorIdList}')`,
            referenceId: 'refUser',
            name: 'User'
        },
        {
            method: 'GET',
            q: `SELECT ${getAllFieldsByObjName(
                'User_Stats__c'
            ).join()} FROM User_Stats__c WHERE User__c='@{refUser.records[0].Id}'`,
            referenceId: 'refUserStats',
            name: 'User_Stats__c'
        }
    ]
}

export const genRepContactDetailsCompositeGroup = (accountId: string) => {
    return [
        {
            method: 'GET',
            q:
                `SELECT ${getAllFieldsByObjName('User').join()} FROM User WHERE Id IN ` +
                `(SELECT UserId FROM AccountTeamMember where AccountId='${accountId}')` +
                " AND (PERSONA__c='PSR' OR PERSONA__c='FSR')",
            referenceId: 'refUser',
            name: 'User'
        },
        {
            method: 'GET',
            q:
                `SELECT ${getAllFieldsByObjName('User_Stats__c').join()} FROM User_Stats__c WHERE User__c IN (` +
                `SELECT UserId FROM AccountTeamMember where AccountId='${accountId}')`,
            referenceId: 'refUserStats',
            name: 'User_Stats__c'
        },
        {
            method: 'GET',
            q: `SELECT ${getAllFieldsByObjName(
                'Customer_to_Route__c'
            ).join()} FROM Customer_to_Route__c WHERE ACTV_FLG__c=true AND Customer__c='${accountId}'`,
            referenceId: 'refCustomerToRoute',
            name: 'Customer_to_Route__c'
        },
        {
            method: 'GET',
            q:
                `SELECT ${getAllFieldsByObjName('Route_Sales_Geo__c').join()} FROM Route_Sales_Geo__c WHERE Id IN ` +
                `(SELECT Route__c FROM Customer_to_Route__c where ACTV_FLG__c=true AND Customer__c='${accountId}')`,
            referenceId: 'refRouteSalesGeo',
            name: 'Route_Sales_Geo__c'
        },
        {
            method: 'GET',
            q:
                `SELECT ${getAllFieldsByObjName('Employee_To_Route__c').join()} FROM Employee_To_Route__c WHERE ` +
                `Route__c IN (SELECT Route__c FROM Customer_to_Route__c where ACTV_FLG__c=true AND Customer__c='${accountId}')`,
            referenceId: 'refEmployeeToRoute',
            name: 'Employee_To_Route__c'
        }
    ]
}

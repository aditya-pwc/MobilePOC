import { CommonParam } from '../../../common/CommonParam'
import { getAllFieldsByObjName } from '../../utils/SyncUtils'

export const genSingleLeadCompositeGroup = (id: string) => {
    return [
        {
            method: 'GET',
            q: `SELECT ${getAllFieldsByObjName('Lead__x').join()} FROM Lead__x WHERE Id='${id}'`,
            referenceId: 'refLeads',
            name: 'Lead__x'
        },
        {
            method: 'GET',
            q: `SELECT ${getAllFieldsByObjName(
                'Contact'
            ).join()} FROM Contact WHERE Lead__c='@{refLeads.records[0].ExternalId}'`,
            referenceId: 'refContacts',
            name: 'Contact'
        },
        {
            method: 'GET',
            q: `SELECT ${getAllFieldsByObjName(
                'Task'
            ).join()} FROM Task WHERE Lead__c='@{refLeads.records[0].ExternalId}'`,
            referenceId: 'refTasks',
            name: 'Task'
        },
        {
            method: 'GET',
            q: `SELECT ${getAllFieldsByObjName(
                'Customer_to_Route__c'
            ).join()} FROM Customer_to_Route__c WHERE Lead__c='@{refLeads.records[0].ExternalId}'`,
            referenceId: 'refDp',
            name: 'Customer_to_Route__c'
        }
    ]
}

export const tierCompositeGroup = (startOfYear: string, selectedLocation: string) => {
    const rootQuery = `/services/data/${CommonParam.apiVersion}/query/?q=`
    const queryTier1 =
        "SELECT COUNT() FROM Lead__x  WHERE Tier_c__c='1' AND Status__c='Business Won'" +
        `AND Business_Won_Date_c__c >= ${startOfYear}` +
        ` AND Location_ID_c__c = '${selectedLocation}' `
    const queryTier2 =
        "SELECT COUNT() FROM Lead__x  WHERE Tier_c__c='2' AND Status__c='Business Won'" +
        `AND Business_Won_Date_c__c >= ${startOfYear}` +
        ` AND Location_ID_c__c = '${selectedLocation}' `
    const queryTier3 =
        "SELECT COUNT() FROM Lead__x  WHERE Tier_c__c='3' AND Status__c='Business Won'" +
        `AND Business_Won_Date_c__c >= ${startOfYear}` +
        ` AND Location_ID_c__c = '${selectedLocation}' `
    const queryNullTier =
        "SELECT COUNT() FROM Lead__x  WHERE  Tier_c__c = NULL AND Status__c='Business Won'" +
        `AND Business_Won_Date_c__c >= ${startOfYear}` +
        ` AND Location_ID_c__c = '${selectedLocation}' `

    return [
        {
            method: 'GET',
            url: `${rootQuery}${queryTier1}`,
            referenceId: 'Tier1'
        },
        {
            method: 'GET',
            url: `${rootQuery}${queryTier2}`,
            referenceId: 'Tier2'
        },
        {
            method: 'GET',
            url: `${rootQuery}${queryTier3}`,
            referenceId: 'Tier3'
        },
        {
            method: 'GET',
            url: `${rootQuery}${queryNullTier}`,
            referenceId: 'TierNull'
        }
    ]
}

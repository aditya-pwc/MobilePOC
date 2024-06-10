/**
 * @description Utils for lead business.
 * @author Shangmin Dou
 * @date 2021-05-04
 */
import { filterExistFields, getAllFieldsByObjName } from './SyncUtils'
import { SoupService } from '../service/SoupService'
import { formatString } from './CommonUtils'
import {
    buildSyncDownObjPromise,
    compositeQueryObjsBySoql,
    restDataCommonCall,
    syncDownNotification,
    syncDownObj,
    syncUpObjUpdateFromMem
} from '../api/SyncUtils'
import { CommonParam } from '../../common/CommonParam'
import TaskQueries from '../queries/TaskQueries'
import { promiseQueue } from '../api/InitSyncUtils'
import { refreshKpiBarAction } from '../redux/action/LeadActionType'
import { LeadStatus } from '../enums/Lead'
import { database } from '../common/SmartSql'
import ContactQueries from '../queries/ContactQueries'
import moment from 'moment'
import { isPersonaCRMBusinessAdmin, Persona } from '../../common/enums/Persona'
import { genSingleLeadCompositeGroup } from '../api/composite-template/LeadCompositeTemplate'
import _ from 'lodash'
import { Log } from '../../common/enums/Log'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { checkLeadWiring, getWiredLeadIds, updateTaskOwner } from '../api/ApexApis'
import { getLatestNotificationTime } from '../api/connect/NotificationUtils'
import LeadQueries from '../queries/LeadQueries'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../common/enums/MomentStartOf'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import {
    PROD_GRP_NM_BC,
    PROD_GRP_NM_FOUNTAIN,
    SLS_MTHD_NM_PEPSI_DIRECT
} from '../components/rep/lead/offer-tab/DistributionPointModal'

export const updateLeadOwner = (leadToUpdate, userGPID) => {
    leadToUpdate.Owner_GPID_c__c = userGPID
    leadToUpdate.LastModifiedBy_GPID_c__c = userGPID
    leadToUpdate.Status__c = 'Negotiate'
    leadToUpdate.Lead_Sub_Status_c__c = 'Assigned'
    leadToUpdate.Moved_to_Negotiate_Time_c__c = new Date().toISOString()
}

export const unAssignLeadOwner = (leadToUpdate, userGPID) => {
    leadToUpdate.Owner_GPID_c__c = null
    leadToUpdate.LastModifiedBy_GPID_c__c = userGPID
    leadToUpdate.Status__c = 'Open'
    leadToUpdate.Lead_Sub_Status_c__c = ''
}

export const updateLeadToBackend = async (leadToUpdate, dropDownRef) => {
    try {
        const leadSyncUpFields = [
            'Id',
            'PD_Assigned_c__c',
            'Status__c',
            'Lead_Sub_Status_c__c',
            'Owner_GPID_c__c',
            'Moved_to_Negotiate_Time_c__c',
            'LastModifiedBy_GPID_c__c',
            'Rep_Last_Modified_Date_c__c',
            'CreatedDate__c',
            'Assigned_Date_c__c'
        ]
        await syncUpObjUpdateFromMem('Lead__x', filterExistFields('Lead__x', [leadToUpdate], leadSyncUpFields))
    } catch (err) {
        let errMsg = ''
        if (leadToUpdate.Status__c === 'Open') {
            errMsg = 'Un-Assign Lead Failed'
        } else if (leadToUpdate.Status__c === 'Negotiate') {
            errMsg = 'Add Lead Failed'
        }
        dropDownRef.current.alertWithType('error', errMsg, ErrorUtils.error2String([...err[0], ...err[1]]))
        storeClassLog(
            Log.MOBILE_ERROR,
            'updateLeadToBackend',
            'update lead to backend: ' + ErrorUtils.error2String(err) + ErrorUtils.error2String(leadToUpdate)
        )
    }
}

const MAX_ID_SIZE = 550
const MAX_LEAD_ID_SIZE = 300
export const chunkIdsAndExternalIds = (idsToChunk, externalIdsToChunk) => {
    const ids = _.chunk(idsToChunk, MAX_LEAD_ID_SIZE)
    const externalIds = _.chunk(externalIdsToChunk, MAX_ID_SIZE)
    return { ids, externalIds }
}

export const clearLeadsGroup = async () => {
    await Promise.all([
        SoupService.clearSoup('Lead__x'),
        SoupService.clearSoup('Task'),
        SoupService.clearSoup('Contact'),
        SoupService.clearSoup('Customer_to_Route__c')
    ])
}

export const genSyncDownLeadsGroupReqs = async () => {
    const { data } = await getWiredLeadIds()
    const { ids, externalIds } = chunkIdsAndExternalIds(data.ids, data.externalIds)
    const reqs = []
    ids.forEach((idGroup) => {
        const idSuffix = idGroup.map((subIds) => `'${subIds}'`).join(',')
        reqs.push(
            buildSyncDownObjPromise(
                'Lead__x',
                `SELECT ${getAllFieldsByObjName('Lead__x').join()} FROM Lead__x WHERE Id IN (${idSuffix})`
            )
        )
    })
    externalIds.forEach((externalIdGroup) => {
        const externalIdSuffix = externalIdGroup.map((subExternalIds) => `'${subExternalIds}'`).join(',')
        reqs.push(
            buildSyncDownObjPromise(
                'Contact',
                `SELECT ${getAllFieldsByObjName('Contact').join()} ` +
                    `FROM Contact WHERE Lead__c IN (${externalIdSuffix}) AND AccountId=null`
            )
        )
        reqs.push(
            buildSyncDownObjPromise(
                'Task',
                `SELECT ${getAllFieldsByObjName('Task').join()} ` + `FROM Task WHERE Lead__c IN (${externalIdSuffix})`
            )
        )
        reqs.push(
            buildSyncDownObjPromise(
                'Customer_to_Route__c',
                `SELECT ${getAllFieldsByObjName('Customer_to_Route__c').join()} ` +
                    `FROM Customer_to_Route__c WHERE Lead__c IN (${externalIdSuffix})`
            )
        )
    })
    return reqs
}

export const getSyncDownLeads = async () => {
    const { data } = await getWiredLeadIds()
    const leads = []
    const length = data.ids.length
    for (let i = 0; i < length; i++) {
        leads.push({
            Id: data.ids[i],
            ExternalId: data.externalIds[i]
        })
    }
    return leads
}

export const refreshAllLeads = async () => {
    const { data } = await checkLeadWiring()
    await AsyncStorage.setItem(
        'lead_wiring_check',
        JSON.stringify({
            date: moment().format(TIME_FORMAT.Y_MM_DD),
            wiring: data.leadWiring
        })
    )
    await clearLeadsGroup()
    const reqs = await genSyncDownLeadsGroupReqs()
    await promiseQueue(reqs)
}

export const buildLeadReqs = (reqs, ids) => {
    ids.forEach((idGroup) => {
        const idSuffix = idGroup.map((subIds) => `'${subIds}'`).join(',')
        reqs.push(
            buildSyncDownObjPromise(
                'Lead__x',
                `SELECT ${getAllFieldsByObjName('Lead__x').join()} FROM Lead__x WHERE Id IN (${idSuffix}) `
            )
        )
    })
}

export const refreshLeadsBackground = async () => {
    await syncDownNotification(moment().add(10, 'minute').toISOString(), await getLatestNotificationTime())
    const leadsAssignedRes = await restDataCommonCall(
        'query/?q=SELECT Id,ExternalId FROM Lead__x ' +
            `WHERE Owner_GPID_c__c='${CommonParam.GPID__c}' AND Lead_Sub_Status_c__c='Assigned' `,
        'GET'
    )
    const leadsAssignedResArray = leadsAssignedRes.data.records
    const res = await SoupService.retrieveDataFromSoup(
        'Lead__x',
        {},
        ['Id', 'ExternalId'],
        formatString(
            'SELECT {Lead__x:Id},{Lead__x:ExternalId} FROM {Lead__x} ' +
                "WHERE ({Lead__x:COF_Triggered_c__c}='1' OR {Lead__x:Lead_Sub_Status_c__c}='Assigned' " +
                'OR {Lead__x:Location_c__c} IS NULL) ' +
                "AND {Lead__x:Owner_GPID_c__c}='%s'",
            [CommonParam.GPID__c]
        )
    )
    const resToProcess = [...leadsAssignedResArray, ...res]
    if (resToProcess.length > 0) {
        const idsToChunk = new Set()
        const externalIdsToChunk = new Set()
        resToProcess.forEach((v) => {
            idsToChunk.add(v.Id)
            externalIdsToChunk.add(v.ExternalId)
        })
        const { ids, externalIds } = chunkIdsAndExternalIds(Array.from(idsToChunk), Array.from(externalIdsToChunk))
        const reqs = []
        externalIds.forEach((externalIdGroup) => {
            const externalIdSuffix = externalIdGroup.map((subExternalIds) => `'${subExternalIds}'`).join(',')
            reqs.push(
                buildSyncDownObjPromise(
                    'Task',
                    `SELECT ${getAllFieldsByObjName('Task').join()} ` +
                        `FROM Task WHERE Lead__c IN (${externalIdSuffix})`
                )
            )
        })
        !isPersonaCRMBusinessAdmin() && buildLeadReqs(reqs, ids)
        await Promise.all([promiseQueue(reqs)])
    }
}

export const getRecentCofRejectedActivity = async (leadExternalId: string) => {
    const [activity] = await SoupService.retrieveDataFromSoup(
        'Task',
        {},
        TaskQueries.getCofRejectedTaskByLeadExternalIdQuery.f,
        formatString(TaskQueries.getCofRejectedTaskByLeadExternalIdQuery.q, [leadExternalId])
    )
    return activity
}

export const checkLeadEdited = (tempLead) => {
    return (
        tempLead.leadDetailsEditCount > 0 ||
        tempLead.webSocialMediaEditCount > 0 ||
        tempLead.customerAttributesEditCount > 0 ||
        tempLead.pepsiCoDataEditCount > 0 ||
        tempLead.offerDetailsEditCount > 0 ||
        tempLead.equipmentNeedsEditCount > 0 ||
        tempLead.prospectNotesEditCount > 0 ||
        tempLead.deliveryExecutionEditCount > 0 ||
        tempLead.PriceGroupEditCount > 0
    )
}

const processNoSaleLead = async (updatedLeadTodo) => {
    if (
        updatedLeadTodo.Status__c === LeadStatus.NO_SALE &&
        moment(updatedLeadTodo.Deferred_Resume_Date_c__c).isSame(moment(), MOMENT_STARTOF.DAY)
    ) {
        updatedLeadTodo.Status__c = LeadStatus.NEGOTIATE
        updatedLeadTodo.Lead_Sub_Status_c__c = 'Assigned'
        updatedLeadTodo.Assigned_Date_c__c = moment().format(TIME_FORMAT.Y_MM_DD)
        updatedLeadTodo.Moved_to_Negotiate_Time_c__c = new Date().toISOString()
        const { data } = await restDataCommonCall(
            'query/?q=SELECT Id, Name, IsActive, PERSONA__c FROM User ' +
                `WHERE GPID__c='${updatedLeadTodo.Owner_GPID_c__c}'`,
            'GET'
        )
        if (
            data.totalSize === 0 ||
            !data.records[0]?.IsActive ||
            !(data.records[0]?.PERSONA__c === Persona.FSR || data.records[0]?.PERSONA__c === Persona.PSR)
        ) {
            updatedLeadTodo.Owner_GPID_c__c = CommonParam.GPID__c
        }
    }
}

export const updateLeadSubStatus = (leadInitSubStatus, updatedLeadTodo, subStatus) => {
    updatedLeadTodo.Lead_Sub_Status_c__c = subStatus
    if (leadInitSubStatus !== updatedLeadTodo.Lead_Sub_Status_c__c) {
        updatedLeadTodo.Last_Task_Modified_Date_c__c = moment().format(TIME_FORMAT.Y_MM_DD)
    }
}

export const updateLeadInfo = async (updatedLeadTodo, leadDetail, dispatch) => {
    updatedLeadTodo.Lead_Sub_Status_c__c = leadDetail.Lead_Sub_Status_c__c
    updatedLeadTodo.Call_Counter_c__c = leadDetail.Call_Counter_c__c
    updatedLeadTodo.Contact_Made_Counter_c__c = leadDetail.Contact_Made_Counter_c__c
    updatedLeadTodo.Last_Task_Modified_Date_c__c = leadDetail.Last_Task_Modified_Date_c__c
    const leadInitSubStatus = updatedLeadTodo.Lead_Sub_Status_c__c
    let refreshKpiBar = false
    if (
        (updatedLeadTodo.leadDetailsEditCount > 0 ||
            updatedLeadTodo.webSocialMediaEditCount > 0 ||
            updatedLeadTodo.customerAttributesEditCount > 0 ||
            updatedLeadTodo.pepsiCoDataEditCount > 0) &&
        leadDetail.Lead_Sub_Status_c__c !== 'Negotiate' &&
        leadDetail.Status__c !== LeadStatus.NO_SALE
    ) {
        updateLeadSubStatus(leadInitSubStatus, updatedLeadTodo, 'Discovery')
        refreshKpiBar = true
    }
    if (
        updatedLeadTodo.offerDetailsEditCount > 0 ||
        updatedLeadTodo.equipmentNeedsEditCount > 0 ||
        updatedLeadTodo.prospectNotesEditCount > 0 ||
        updatedLeadTodo.deliveryExecutionEditCount > 0
    ) {
        updateLeadSubStatus(leadInitSubStatus, updatedLeadTodo, 'Negotiate')
        refreshKpiBar = true
    }
    updatedLeadTodo.LastModifiedBy_GPID_c__c = CommonParam.GPID__c
    updatedLeadTodo.Rep_Last_Modified_Date_c__c = new Date().toISOString()
    await processNoSaleLead(updatedLeadTodo)
    await syncUpObjUpdateFromMem(
        'Lead__x',
        filterExistFields('Lead__x', [updatedLeadTodo], LeadQueries.syncUpLeadDetailFormQuery.f)
    )
    if (refreshKpiBar) {
        dispatch(refreshKpiBarAction())
    }
}

export const goToLeadDetail = async (navigation, lead) => {
    global.$globalModal.openModal()
    let needDeleteFlag = false
    try {
        const result = await SoupService.retrieveDataFromSoup(
            'Lead__x',
            {},
            ['Id', 'Status__c'],
            'SELECT {Lead__x:Id},{Lead__x:Status__c},{Lead__x:_soupEntryId}' +
                ` FROM {Lead__x} WHERE {Lead__x:Id} = '${lead.Id}'`
        )
        if (result.length === 0) {
            needDeleteFlag = true
        }
        await compositeQueryObjsBySoql(genSingleLeadCompositeGroup(lead.Id))
        global.$globalModal.closeModal()
    } catch (e) {
        global.$globalModal.closeModal()
        storeClassLog(Log.MOBILE_ERROR, 'goToLeadDetail', ErrorUtils.error2String(e))
    }
    navigation.navigate('LeadDetailScreen', {
        lead,
        type: lead.Status__c,
        goBackDp: true,
        needDelete: needDeleteFlag
    })
}

export const updateLeadInDp = (l) => {
    const leadToUpdate = _.cloneDeep(l)
    leadToUpdate.Rep_Last_Modified_Date_c__c = new Date().toISOString()
    if (leadToUpdate.Lead_Sub_Status_c__c !== LeadStatus.NEGOTIATE) {
        leadToUpdate.Lead_Sub_Status_c__c = 'Negotiate'
        leadToUpdate.Last_Task_Modified_Date_c__c = moment().format(TIME_FORMAT.Y_MM_DD)
    }
    return leadToUpdate
}

export const updateRelatedTask = async (leadExternalId, moveToNoSale) => {
    const taskToUpdate = await SoupService.retrieveDataFromSoup(
        'Task',
        {},
        TaskQueries.getOpenTaskToUpdateByLeadExternalIdQuery.f,
        formatString(TaskQueries.getOpenTaskToUpdateByLeadExternalIdQuery.q, [leadExternalId])
    )
    if (taskToUpdate.length > 0) {
        taskToUpdate.forEach((v) => {
            if (moveToNoSale) {
                v.Status = 'Complete'
            }
        })
        if (moveToNoSale) {
            const taskSyncUpFields = ['Id', 'OwnerId', 'Status']
            await syncUpObjUpdateFromMem('Task', filterExistFields('Task', taskToUpdate, taskSyncUpFields))
        } else {
            const taskIds = taskToUpdate.map((v) => v.Id)
            await updateTaskOwner(taskIds)
            const taskIdsString = taskIds.map((v) => `'${v}'`).join(',')
            await syncDownObj(
                'Task',
                `SELECT ${getAllFieldsByObjName('Task')} FROM Task WHERE ` + `Id IN (${taskIdsString}) `
            )
        }
    }
}

export const addZeroes = (
    num: string,
    decimalPlaces: number = 3,
    toFixedNum: number = 2,
    ignoreDecimalPlaces: boolean = false
) => {
    // Convert input string to a number and store as a variable.
    if (num !== null && num !== undefined) {
        const value = Number(num)
        // Split the input string into two arrays containing integers/decimals
        const res = num.split('.')
        // If there is no decimal point or only one decimal place found.
        if (res.length === 1 || res[1].length < decimalPlaces || ignoreDecimalPlaces) {
            // Set the number to two decimal places
            return value.toFixed(toFixedNum)
        }
        // Return updated or original number.
        return value
    }
    return num
}

export const getLeadDPs = async (externalId) => {
    let dps = []
    await database()
        .use('Customer_to_Route__c')
        .select()
        .where([
            {
                leftTable: 'Customer_to_Route__c',
                leftField: 'Lead__c',
                rightField: `'${externalId}'`,
                operator: '='
            }
        ])
        .getData()
        .then((res) => {
            dps = res
        })
    return dps
}
export const getLeadPrimaryContacts = async (externalId) => {
    let contacts = []
    await SoupService.retrieveDataFromSoup(
        'Contact',
        {},
        ContactQueries.getPrimaryContactByLeadExternalIdQuery.f,
        formatString(ContactQueries.getPrimaryContactByLeadExternalIdQuery.q, [externalId])
    ).then((res) => {
        contacts = res
    })
    return contacts
}
export const checkLeadContacts = async (leadDetail) => {
    const contacts = await getLeadPrimaryContacts(leadDetail.ExternalId)
    return contacts.length > 0
}
export const checkLeadDPs = async (leadDetail) => {
    const dps = await getLeadDPs(leadDetail.ExternalId)
    const flag = {
        hasFoodServiceCallsDP: false,
        hasSellingDP: false,
        hasBcDP: true
    }
    if (dps.length > 0) {
        if (
            _.find(dps, (v) => {
                return v.SLS_MTHD_NM__c === 'Food Service Calls'
            }) !== undefined
        ) {
            flag.hasFoodServiceCallsDP = true
        }
        const dpsToProcess = _.cloneDeep(dps)
        _.remove(dpsToProcess, (v: any) => {
            return v.SLS_MTHD_NM__c === 'Food Service Calls'
        })
        if (dpsToProcess.length > 0) {
            flag.hasSellingDP = true
        }
        if (
            _.some(dps, {
                SLS_MTHD_NM__c: SLS_MTHD_NM_PEPSI_DIRECT,
                PROD_GRP_NM__c: PROD_GRP_NM_FOUNTAIN
            })
        ) {
            flag.hasBcDP = _.some(dps, {
                SLS_MTHD_NM__c: SLS_MTHD_NM_PEPSI_DIRECT,
                PROD_GRP_NM__c: PROD_GRP_NM_BC
            })
        } else {
            flag.hasBcDP = true
        }
    }
    return flag
}

export const removeLevelIndicator = (v) => {
    return v?.replace(/_\D+$/, '')
}

export const getParentRoute = async (value: string, hierarchy: 'Region' | 'Market' | 'Location') => {
    const result = await restDataCommonCall(
        `query/?q=SELECT SLS_UNIT_NM__c,SLS_UNIT_ID__c,Parent_Node__r.SLS_UNIT_NM__c,Parent_Node__r.SLS_UNIT_ID__c,
    Parent_Node__r.Parent_Node__r.SLS_UNIT_NM__c,Parent_Node__r.Parent_Node__r.SLS_UNIT_ID__c 
        FROM Route_Sales_Geo__c WHERE HRCHY_LVL__c = '${hierarchy}' AND SLS_UNIT_ACTV_FLG_VAL__c = 'ACTIVE' AND (SLS_UNIT_ID__c = '${value}' 
        OR SLS_UNIT_ID__c = '${value}${(() => {
            if (hierarchy === 'Region') {
                return '_RE'
            }
            return hierarchy === 'Market' ? '_M' : ''
        })()}')`,
        'GET'
    )
    const data = _.cloneDeep(result.data?.records[0])
    // SLS_UNIT_ID__c in Route_Sales_Geo__c have level indicator in the end, like '1061_M'
    _.update(data, 'Parent_Node__r.SLS_UNIT_ID__c', removeLevelIndicator)
    _.update(data, 'Parent_Node__r.Parent_Node__r.SLS_UNIT_ID__c', removeLevelIndicator)
    return data
}

export const queryComment = (id, setOriginComment) => {
    const soql = `SELECT {Lead__x:Id}, {Lead__x:Additional_Prospect_Comments_c__c} FROM {Lead__x}  WHERE {Lead__x:Id}= '${id}'`

    SoupService.retrieveDataFromSoup('Lead__x', {}, ['Id', 'Additional_Prospect_Comments_c__c'], soql)
        .then((res) => {
            const comment = res[0]?.Additional_Prospect_Comments_c__c
            setOriginComment(!_.isEmpty(comment) ? comment.replace('No Sale Comments: ', '') : '')
        })
        .catch((e) => {
            storeClassLog(
                Log.MOBILE_ERROR,
                'lead_queryComment',
                `Query comment err
            ' ${ErrorUtils.error2String(e)}`
            )
        })
}

export const checkLeadWiringAndStore = async () => {
    const { data } = await checkLeadWiring()
    await AsyncStorage.setItem(
        'lead_wiring_check',
        JSON.stringify({
            date: moment().format(TIME_FORMAT.Y_MM_DD),
            wiring: data.leadWiring
        })
    )
}

import { SoupService } from '../service/SoupService'
import { restDataCommonCall, syncUpObjCreateFromMem, syncUpObjUpdate } from '../api/SyncUtils'
import { genSyncUpQueryByFields } from './SyncUtils'
import _ from 'lodash'
import { t } from '../../common/i18n/t'
import moment from 'moment/moment'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import dayjs from 'dayjs'
import { getRecordTypeIdByDeveloperName } from './CommonUtils'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

export const markTaskAsComplete = async (task) => {
    const activityToOperate = _.cloneDeep(task)
    activityToOperate.Status = 'Complete'
    await SoupService.upsertDataIntoSoup('Task', [activityToOperate])
    const fieldsToSyncUp = ['Id', 'Status']
    await syncUpObjUpdate('Task', fieldsToSyncUp, genSyncUpQueryByFields('Task', fieldsToSyncUp, 'update'))
}

export const deleteTask = async (taskId, taskSoupEntryId) => {
    await restDataCommonCall(`sobjects/Task/${taskId}`, 'DELETE')
    await SoupService.removeRecordFromSoup('Task', [taskSoupEntryId + ''])
}

export const LeadTaskSubjects = [
    { k: t.labels.PBNA_MOBILE_COMPLETE_BAM, v: 'Complete BAM' },
    { k: t.labels.PBNA_MOBILE_COMPLETE_REP, v: 'Complete RFP' },
    { k: t.labels.PBNA_MOBILE_GATHER_TAX_DOCUMENTS, v: 'Gather Tax Documents' },
    { k: t.labels.PBNA_MOBILE_RESUBMIT_EQUIPMENT_SITE_DETAILS, v: 'Resubmit Equipment Site Details' }
]

export const CustomerTaskSubjects = [
    { k: t.labels.PBNA_MOBILE_CONTRACT_CDA_RENEWAL, v: 'Contract/CDA Renewal' },
    { k: t.labels.PBNA_MOBILE_BUSINESS_REVIEW, v: 'Business Review' },
    { k: t.labels.PBNA_MOBILE_RESUBMIT_EQUIPMENT_SITE_DETAILS, v: 'Resubmit Equipment Site Details' },
    { k: t.labels.PBNA_MOBILE_FOLLOWUP_CUSTOMER_ISSUE, v: 'Follow-up/Customer Issue' }
]

export const renderTaskStatus = (status: string, activityDate: string) => {
    if (status === 'Complete') {
        return t.labels.PBNA_MOBILE_COMPLETED
    }
    if (status === 'Open') {
        if (activityDate < moment().format(TIME_FORMAT.Y_MM_DD)) {
            return t.labels.PBNA_MOBILE_OVERDUE
        }
        return t.labels.PBNA_MOBILE_OPEN
    }
    return ''
}

export const autoLogCall = async (AccountId: string, contactName?: string, physically = false) => {
    try {
        const callToCreate = {
            Contact_Made__c: true,
            Onsite__c: physically,
            Name_of_Contact__c: physically ? 'Geofence Visit' : contactName || 'Business Phone Number',
            Call_Subject__c: 'Automated Call',
            Call_Date__c: dayjs().toISOString(),
            ActivityDate: dayjs().toISOString(),
            Status: 'Complete',
            Type: physically ? 'Geofence visit' : 'Call',
            WhatId: AccountId,
            RecordTypeId: await getRecordTypeIdByDeveloperName('Customer_Activity', 'Task'),
            Subject: 'Customer Logging Calls'
        }
        await syncUpObjCreateFromMem('Task', [callToCreate])
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, 'autoLogCall', 'Auto log call failed: ' + ErrorUtils.error2String(e))
    }
}

/*
 * @Description: Helper for the log call form
 * @Author: Shangmin Dou
 * @Date: 2021-11-25 20:22:11
 * @LastEditTime: 2022-02-16 04:53:56
 * @LastEditors: Mary Qian
 */

import moment from 'moment'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'

export const buildTaskAndLeadData = async (type, callToCreate, leadToUpdate, customer) => {
    if (type === 'Lead') {
        callToCreate.Lead__c = leadToUpdate.ExternalId
        let refreshKpiBar = false
        if (leadToUpdate.Call_Counter_c__c === null || leadToUpdate.Call_Counter_c__c === 0) {
            leadToUpdate.Call_Counter_c__c = 1
        } else {
            leadToUpdate.Call_Counter_c__c = leadToUpdate.Call_Counter_c__c + 1
        }
        if (leadToUpdate.Lead_Sub_Status_c__c === 'Assigned') {
            leadToUpdate.Lead_Sub_Status_c__c = 'Engage'
            refreshKpiBar = true
        }
        if (callToCreate.Contact_Made__c === '1') {
            if (leadToUpdate.Contact_Made_Counter_c__c === null || leadToUpdate.Contact_Made_Counter_c__c === 0) {
                leadToUpdate.Contact_Made_Counter_c__c = 1
            } else {
                leadToUpdate.Contact_Made_Counter_c__c = leadToUpdate.Contact_Made_Counter_c__c + 1
            }
        }
        leadToUpdate.Rep_Last_Modified_Date_c__c = new Date().toISOString()
        leadToUpdate.Last_Task_Modified_Date_c__c = moment().format(TIME_FORMAT.Y_MM_DD)
        return refreshKpiBar
    }
    callToCreate.WhatId = customer.AccountId
    return false
}

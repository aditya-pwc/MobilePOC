/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2023-11-24 14:06:58
 * @LastEditTime: 2023-11-27 16:52:52
 * @LastEditors: Mary Qian
 */

/* eslint-disable camelcase */

import _ from 'lodash'
import { dataCheckWithAction } from '../service/DataCheckService'
import { SoupService } from '../../../service/SoupService'
import { restDataCommonCall, syncUpObjUpdate } from '../../../api/SyncUtils'
import { t } from '../../../../common/i18n/t'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { Log } from '../../../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { getObjByName } from '../../../utils/SyncUtils'

export interface EmployeeProfileStatsProps {
    Id: string
    Is_Night_Shift__c: string | boolean
    Start_Time__c: string
    Starting_Location__c: string
    User__c: string
    Monday__c: string | boolean
    Tuesday__c: string | boolean
    Wednesday__c: string | boolean
    Thursday__c: string | boolean
    Friday__c: string | boolean
    Saturday__c: string | boolean
    Sunday__c: string | boolean
}

const DEFAULT_MERCH_STARTING_TIME = '5:00 AM'
const DEFAULT_SALES_STARTING_TIME = '6:30 AM'
export const OPACITY = 1
export const CURRENT_OPACITY = 0.2

export const getOpacity = (params: any) => {
    const { noWorkingDay, currentOpacity } = params
    if (noWorkingDay) {
        return OPACITY
    }
    return currentOpacity
}

const transBackendTimeToFrontendTime = (time: string) => {
    if (_.isEmpty(time)) {
        return DEFAULT_SALES_STARTING_TIME
    }

    const hour = parseInt(time.split(':')[0])
    const minute = time.split(':')[1]
    if (hour === 0 || hour === 24) {
        return `12:${minute} AM`
    }

    if (hour === 12) {
        return `${hour}:${minute} PM`
    }

    if (hour < 12) {
        return `${hour}:${minute} AM`
    }

    return `${hour - 12}:${minute} PM`
}

export const getSalesDefaultStartTime = async () => {
    const url = `query/?q=SELECT id,Value__c from Application_Configuration__mdt where DeveloperName = 'Default_StartTime'`

    try {
        const res = await restDataCommonCall(url, 'GET')
        const records = res?.data?.records || []
        if (records.length > 0) {
            const time = records[0].Value__c
            return transBackendTimeToFrontendTime(time)
        }
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'getDefaultStartTime', 'failed: ' + ErrorUtils.error2String(error))
    }

    return DEFAULT_SALES_STARTING_TIME
}

export const getDefaultStartTime = async (isSales: boolean) => {
    if (isSales) {
        return await getSalesDefaultStartTime()
    }

    return DEFAULT_MERCH_STARTING_TIME
}

export const checkUserStats = (userId: string) => {
    if (_.isEmpty(userId)) {
        return true
    }

    return dataCheckWithAction(
        'User_Stats__c',
        `WHERE User__c='${userId}' AND RecordType.DeveloperName = 'Stats'`,
        '',
        false
    )
}

export const getUserStats = (userId: string) => {
    const { syncUpCreateFields, syncUpCreateQuery } = getObjByName('User_Stats__c')
    return SoupService.retrieveDataFromSoup(
        'User_Stats__c',
        {},
        syncUpCreateFields,
        syncUpCreateQuery + ` WHERE {User_Stats__c:User__c} = '${userId}'`
    )
}

export const updateLocalUserStats = (updatedWorkingHours: Array<EmployeeProfileStatsProps>) => {
    if (updatedWorkingHours.length > 0) {
        return SoupService.upsertDataIntoSoup('User_Stats__c', updatedWorkingHours, true, false)
    }
}

export const updateRemoteUserStats = () => {
    const { syncUpCreateFields, syncUpCreateQuery } = getObjByName('User_Stats__c')
    return syncUpObjUpdate(
        'User_Stats__c',
        syncUpCreateFields,
        syncUpCreateQuery + " WHERE {User_Stats__c:__locally_updated__} = '1'"
    )
}

export const syncUpUserStats = async (updatedWorkingHours: Array<EmployeeProfileStatsProps>, showError: Function) => {
    updateLocalUserStats(updatedWorkingHours)
        ?.then(() => {
            updateRemoteUserStats().catch((err) => {
                showError(t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_SYNC_USER, err)
            })
        })
        .catch((err) => {
            showError(t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_INSERT_USER, err)
        })
}

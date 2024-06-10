/**
 * @description Manager Data Check
 * @author Xupeng Bao
 * @email xupeng.bao@pwc.com
 * @date 2021-10-15
 */

import _ from 'lodash'
import moment from 'moment'
import { restDataCommonCall } from '../../../api/SyncUtils'
import { CommonParam } from '../../../../common/CommonParam'
import DataCheckConfig from '../../../config/DataCheckConfig'
import { Log } from '../../../../common/enums/Log'
import { BooleanStr, DataCheckMsgIndex, SVGDataCheckStatus } from '../../../enums/Manager'
import { VisitListStatus } from '../../../enums/VisitList'
import { SoupService } from '../../../service/SoupService'
import { getRecordTypeIdByDeveloperName, queryVisitList } from '../../../utils/MerchManagerUtils'
import { getIdClause } from '../helper/MerchManagerHelper'
import { getStringValue } from '../../../utils/LandingUtils'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../common/utils/LogUtils'

export const getDateClause = (dates: string[]) => {
    return dates.join(', ')
}

// return false for need sync
export const dataCheckWithAction = async (objName: string, q: string, localQ: string, isCreate: boolean) => {
    if (DataCheckConfig.enable) {
        try {
            const sfq = `SELECT Id, LastModifiedDate FROM ${objName} ${q}`
            const path = `query/?q=${sfq}`
            const res = await restDataCommonCall(path, 'GET')
            const totalSize = res?.data?.totalSize
            if (!totalSize) {
                return Promise.resolve(isCreate)
            }
            const records = res?.data?.records
            const ids = records.map((r) => {
                return `'${r.Id}'`
            })
            const idQ = ids.join(', ')
            const lq = localQ !== '' ? localQ : `WHERE {${objName}:Id} IN (${idQ})`
            const local = await SoupService.retrieveDataFromSoup(
                objName,
                {},
                ['Id', 'LastModifiedDate'],
                `
                    SELECT
                    {${objName}:Id},
                    {${objName}:LastModifiedDate}
                    FROM {${objName}} ${lq}
                `
            )
            if (totalSize !== local.length) {
                return Promise.resolve(false)
            }
            const sfData = {}
            records.forEach((r) => {
                if (!Object.keys(sfData).includes(r.Id)) {
                    sfData[r.Id] = r.LastModifiedDate
                }
            })
            const result = []
            local.forEach((l) => {
                if (sfData[l.Id] !== l.LastModifiedDate) {
                    result.push(0)
                }
            })
            const index = result.indexOf(0)
            const returnValue = index === -1
            return Promise.resolve(returnValue)
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'dataCheckWithAction', getStringValue(error))
            return Promise.resolve(false)
        }
    }
    return Promise.resolve(true)
}
export const checkDataForReassignSD = async (user, selectData, CTRRecordTypeId) => {
    if (DataCheckConfig.enable) {
        const createIds = []
        const accountIds = []
        const serviceIds = []
        for (const tmpData of selectData) {
            const accountId = tmpData?.accountId || tmpData?.customerData?.accountId
            if (!Object.keys(user.customerIdMap).includes(accountId) && !createIds.includes(accountId)) {
                createIds.push(accountId)
            }
            if (Object.keys(user.customerIdMap).includes(accountId) && !accountIds.includes(accountId)) {
                accountIds.push(accountId)
            }
            if (!serviceIds.includes(tmpData.id)) {
                serviceIds.push(tmpData.id)
            }
        }
        const createQ = getIdClause(createIds)
        let ctrCreateCheck = true
        if (createIds.length > 0) {
            ctrCreateCheck = await dataCheckWithAction(
                'Customer_to_Route__c',
                `WHERE OwnerId='${user.id}' AND Route__c='${user.routeId}' AND Customer__c IN (${createQ}) 
                AND IsRemoved__c=false AND RecordTypeId='${CTRRecordTypeId}'`,
                `
                WHERE {Customer_to_Route__c:OwnerId}='${user.id}'
                AND {Customer_to_Route__c:Route__c}='${user.routeId}'
                AND {Customer_to_Route__c:Customer__c} IN (${createQ})
                AND {Customer_to_Route__c:IsRemoved__c} IS FALSE
                AND {Customer_to_Route__c:RecordTypeId}='${CTRRecordTypeId}'
                `,
                true
            )
        }
        const updateQ = getIdClause(accountIds)
        let ctrUpdateCheck = true
        if (accountIds.length > 0) {
            ctrUpdateCheck = await dataCheckWithAction(
                'Customer_to_Route__c',
                `WHERE OwnerId='${user.id}' AND Route__c='${user.routeId}' AND Customer__c IN (${updateQ}) 
                AND IsRemoved__c=false AND RecordTypeId='${CTRRecordTypeId}'`,
                `
                WHERE {Customer_to_Route__c:OwnerId}='${user.id}'
                AND {Customer_to_Route__c:Route__c}='${user.routeId}'
                AND {Customer_to_Route__c:Customer__c} IN (${updateQ})
                AND {Customer_to_Route__c:IsRemoved__c} IS FALSE
                AND {Customer_to_Route__c:RecordTypeId}='${CTRRecordTypeId}'
                `,
                false
            )
        }
        const serviceQ = getIdClause(serviceIds)
        const serviceCheck = await dataCheckWithAction(
            'Service_Detail__c',
            `WHERE Id IN (${serviceQ}) AND IsRemoved__c=false`,
            `
            WHERE {Service_Detail__c:Id} IN (${serviceQ})
            AND {Service_Detail__c:IsRemoved__c} IS FALSE
            `,
            false
        )
        return ctrCreateCheck && ctrUpdateCheck && serviceCheck
    }
    return true
}

export const checkDataForCTRAndSD = async (selectData) => {
    if (DataCheckConfig.enable) {
        const ctrIds = []
        const serviceIds = []
        for (const tmpData of selectData) {
            if (!ctrIds.includes(tmpData.customer_to_route__c)) {
                ctrIds.push(tmpData.customer_to_route__c)
            }
            if (!serviceIds.includes(tmpData.id)) {
                serviceIds.push(tmpData.id)
            }
        }
        const ctrQ = getIdClause(ctrIds)
        const serviceQ = getIdClause(serviceIds)
        const ctrCheck = await dataCheckWithAction(
            'Customer_to_Route__c',
            `WHERE Id IN (${ctrQ}) AND IsRemoved__c=false`,
            `
            WHERE {Customer_to_Route__c:Id} IN (${ctrQ})
            AND {Customer_to_Route__c:IsRemoved__c} IS FALSE
            `,
            false
        )
        const serviceCheck = await dataCheckWithAction(
            'Service_Detail__c',
            `WHERE Id IN (${serviceQ}) AND IsRemoved__c=false`,
            `
            WHERE {Service_Detail__c:Id} IN (${serviceQ})
            AND {Service_Detail__c:IsRemoved__c} IS FALSE
            `,
            false
        )
        return ctrCheck && serviceCheck
    }
    return true
}

export const checkDataForSD = async (accountId, weekDayNum, CTRRecordTypeId) => {
    const result = []
    const checkDay = weekDayNum.filter((day) => day.numOfVisit !== 0)
    for (const weekDay of checkDay) {
        const sfq = `SELECT Id, LastModifiedDate FROM Service_Detail__c
                    WHERE Day_of_the_Week__c='${weekDay.label}' AND Customer_to_Route__r.Customer__c='${accountId}'
                    AND IsRemoved__c=false AND Customer_to_Route__r.Merch_Flag__c=true
                    AND Customer_to_Route__r.RecordTypeId='${CTRRecordTypeId}'`
        const path = `query/?q=${sfq}`
        const res = await restDataCommonCall(path, 'GET')
        const totalSize = res?.data?.totalSize
        const records = res?.data?.records
        const sdIDMap = new Map()
        let isModified = false
        const localSDs = await SoupService.retrieveDataFromSoup(
            'Service_Detail__c',
            {},
            ['Id', 'LastModifiedDate'],
            `SELECT
            {Service_Detail__c:Id},
            {Service_Detail__c:LastModifiedDate}
            FROM {Service_Detail__c}
            WHERE {Service_Detail__c:Customer_to_Route__r.Customer__c}='${accountId}'
            AND {Service_Detail__c:Day_of_the_Week__c}='${weekDay.label}'
            AND {Service_Detail__c:Customer_to_Route__r.Merch_Flag__c} IS TRUE
            AND {Service_Detail__c:IsRemoved__c} IS FALSE
            AND {Service_Detail__c:Customer_to_Route__r.RecordTypeId}='${CTRRecordTypeId}'
            `
        )
        if (!_.isEmpty(records)) {
            for (const record of records) {
                sdIDMap.set(record.Id, record.LastModifiedDate)
            }
            for (const localSD of localSDs) {
                if (
                    _.isEmpty(sdIDMap.get(localSD.Id)) ||
                    (!_.isEmpty(sdIDMap.get(localSD.Id)) && sdIDMap.get(localSD.Id) !== localSD.LastModifiedDate)
                ) {
                    isModified = true
                }
            }
        }
        result.push(totalSize + weekDay.numOfVisit > 4 || isModified || totalSize !== localSDs.length)
    }
    if (result.length === checkDay.length) {
        return !result.includes(true)
    }
}

export const checkAccountForAddSD = async (accountId: string) => {
    try {
        const account = await SoupService.retrieveDataFromSoup(
            'Account',
            {},
            ['Merchandising_Base__c'],
            `SELECT {Account:Merchandising_Base__c} FROM {Account} WHERE {Account:Id}='${accountId}'`
        )
        if (_.isEmpty(account)) {
            return false
        }
        const localCheck = account[0]?.Merchandising_Base__c !== BooleanStr.STR_FALSE
        const accountCheck = await dataCheckWithAction('Account', `WHERE Id='${accountId}'`, '', false)
        return localCheck && accountCheck
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'checkAccountForAddSD', getStringValue(error))
        return false
    }
}

export const checkDataForAddSD = async (employeeId, accountId, weekDayNum, CTRRecordTypeId) => {
    if (DataCheckConfig.enable) {
        const localCTR = await SoupService.retrieveDataFromSoup(
            'Customer_to_Route__c',
            {},
            ['Id'],
            `SELECT
            {Customer_to_Route__c:Id},
            {Customer_to_Route__c:_soupEntryId},
            {Customer_to_Route__c:__local__},
            {Customer_to_Route__c:__locally_created__},
            {Customer_to_Route__c:__locally_updated__},
            {Customer_to_Route__c:__locally_deleted__}
            FROM {Customer_to_Route__c}
            WHERE {Customer_to_Route__c:Customer__c}='${accountId}'
            AND {Customer_to_Route__c:OwnerId}='${employeeId}'
            AND {Customer_to_Route__c:Merch_Flag__c} IS TRUE
            AND {Customer_to_Route__c:IsRemoved__c} IS FALSE
            AND {Customer_to_Route__c:RecordTypeId}='${CTRRecordTypeId}'
            `
        )
        const ctrCheck = await dataCheckWithAction(
            'Customer_to_Route__c',
            `WHERE Customer__c='${accountId}' AND OwnerId='${employeeId}' AND Merch_Flag__c=true 
            AND IsRemoved__c=false AND RecordTypeId='${CTRRecordTypeId}'`,
            `
            WHERE {Customer_to_Route__c:Customer__c}='${accountId}'
            AND {Customer_to_Route__c:OwnerId}='${employeeId}'
            AND {Customer_to_Route__c:Merch_Flag__c} IS TRUE
            AND {Customer_to_Route__c:IsRemoved__c} IS FALSE
            AND {Customer_to_Route__c:RecordTypeId}='${CTRRecordTypeId}'
            `,
            _.isEmpty(localCTR)
        )
        const sdCheck = await checkDataForSD(accountId, weekDayNum, CTRRecordTypeId)
        const accountCheck = await checkAccountForAddSD(accountId)
        return ctrCheck && sdCheck && accountCheck
    }
    return true
}
/**
 * deleteIds  visit Id array
 * dvlIds: daily visit list Id array
 * */
export const checkDataForDeleteVisit = async (deleteIds, dvlIds, doNotNeedCheckVlStatus?) => {
    if (DataCheckConfig.enable) {
        try {
            let visitCheck = true
            let wvlCheck = true
            let dvlCheck = true
            if (!_.isEmpty(dvlIds)) {
                const dvlList = await SoupService.retrieveDataFromSoup(
                    'Visit_List__c',
                    {},
                    ['Id', 'wvlId'],
                    `SELECT
                    {Visit_List__c:Id},
                    {Visit_List__c:Visit_List_Group__c} 
                    FROM {Visit_List__c} WHERE {Visit_List__c:Id} IN (${getIdClause(dvlIds)})
                    `
                )
                const wvlIds = dvlList.map((item) => {
                    return item.wvlId
                })
                wvlCheck = await dataCheckWithAction('Visit_List__c', `WHERE Id IN (${getIdClause(wvlIds)})`, '', false)
                dvlCheck = await dataCheckWithAction('Visit_List__c', `WHERE Id IN (${getIdClause(dvlIds)})`, '', false)
            }
            if (!_.isEmpty(deleteIds)) {
                visitCheck = await dataCheckWithAction('Visit', `WHERE Id IN (${getIdClause(deleteIds)})`, '', false)
            }
            if (!doNotNeedCheckVlStatus) {
                return wvlCheck && visitCheck && dvlCheck
            }
            return visitCheck
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'checkDataForDeleteVisit', getStringValue(error))
            return false
        }
    }
    return true
}
/**
 * enum 0, 1, 2, 3, 4, 5
 * HARD_DELETE_OR_OTHER_ERROR: hard delete or other errors
 * CREATE_BUT_EXIST: create svg but exists same week
 * DATA_CHANGED_BUT_STATUS: data changed but status not
 * STATUS_CHANGED_TO_CANCELLED: status changed to cancelled
 * STATUS_CHANGED_TO_PUBLISHED: status changed to published
 * NO_CHANGES: no changes
 * */
export const dataCheckWithSVG = async (
    idsArr: Array<string>,
    isCreate: boolean,
    dropDownRef?: any,
    startDate?: string,
    endDate?: string
) => {
    if (DataCheckConfig.enable) {
        try {
            if (isCreate) {
                const scheduleRecordTypeId = await getRecordTypeIdByDeveloperName(
                    'Schedule_Visit_Group',
                    'Visit_List__c'
                )
                const q = `SELECT Id, LastModifiedDate, Status__c, Manager_Ad_Hoc__c FROM Visit_List__c WHERE OwnerId = '${CommonParam.userId}'
                    AND Start_Date__c = ${startDate}
                    AND End_Date__c = ${endDate}
                    AND Location_Id__c = '${CommonParam.userLocationId}'
                    AND RecordTypeId = '${scheduleRecordTypeId}'
                    AND Status__c != '${VisitListStatus.PRE_PROCESSED}'
                `
                const urlPath = `query/?q=${q}`
                const re = await restDataCommonCall(urlPath, 'GET')
                const size = re?.data?.totalSize
                if (!size) {
                    return Promise.resolve(SVGDataCheckStatus.NO_CHANGES)
                }
                const recordArr = re?.data?.records
                const statusArr = recordArr.map((r) => {
                    return r.Status__c
                })
                if (statusArr.includes(VisitListStatus.ACCEPTED)) {
                    return Promise.resolve(SVGDataCheckStatus.CREATE_BUT_EXIST)
                }
            }
            const sfq = `SELECT Id, LastModifiedDate, Status__c, Manager_Ad_Hoc__c FROM Visit_List__c WHERE Id IN (${getIdClause(
                idsArr
            )})`
            const path = `query/?q=${sfq}`
            const res = await restDataCommonCall(path, 'GET')
            const totalSize = res?.data?.totalSize
            if (!totalSize) {
                return Promise.resolve(SVGDataCheckStatus.HARD_DELETE_OR_OTHER_ERROR)
            }
            const records = res?.data?.records
            const lq = `WHERE {Visit_List__c:Id} IN (${getIdClause(idsArr)})`
            const local = await SoupService.retrieveDataFromSoup(
                'Visit_List__c',
                {},
                ['Id', 'LastModifiedDate', 'Status__c'],
                `
                    SELECT
                    {Visit_List__c:Id},
                    {Visit_List__c:LastModifiedDate},
                    {Visit_List__c:Status__c}
                    FROM {Visit_List__c} ${lq}
                `
            )
            if (totalSize !== local.length) {
                return Promise.resolve(SVGDataCheckStatus.HARD_DELETE_OR_OTHER_ERROR)
            }
            const sfData = {}
            records.forEach((item) => {
                if (!Object.keys(sfData).includes(item.Id)) {
                    sfData[item.Id] = item.LastModifiedDate
                }
            })
            let changed = false
            local.forEach((l) => {
                if (sfData[l.Id] !== l.LastModifiedDate) {
                    changed = true
                }
            })
            if (changed) {
                if (records[0]?.Status__c === local[0]?.Status__c) {
                    return Promise.resolve(SVGDataCheckStatus.DATA_CHANGED_BUT_STATUS)
                }
                if (
                    records[0]?.Status__c === VisitListStatus.CANCELLED ||
                    records[0]?.Status__c === VisitListStatus.CANCELING ||
                    (records[0]?.Manager_Ad_Hoc__c && records[0]?.Status__c === VisitListStatus.ACCEPTED)
                ) {
                    return Promise.resolve(SVGDataCheckStatus.STATUS_CHANGED_TO_CANCELLED)
                }
                if (records[0]?.Status__c === VisitListStatus.ACCEPTED && !records[0]?.Manager_Ad_Hoc__c) {
                    return Promise.resolve(SVGDataCheckStatus.STATUS_CHANGED_TO_PUBLISHED)
                }
            }
            return Promise.resolve(SVGDataCheckStatus.NO_CHANGES)
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'dataCheckWithSVG', getStringValue(error))
            return Promise.resolve(SVGDataCheckStatus.HARD_DELETE_OR_OTHER_ERROR)
        }
    }
    return Promise.resolve(SVGDataCheckStatus.NO_CHANGES)
}

/**
 * @params
 * svgId: string
 * setErrorMsgType: Function
 * setIsErrorShow: Function
 * @returns boolean
 * */
export const checkSVGDataModifiedById = async (svgId: string, setErrorMsgType: Function, setIsErrorShow: Function) => {
    if (DataCheckConfig.enable) {
        let modified = false
        const SVGRecordStatus = await dataCheckWithSVG([svgId], false)
        if (SVGRecordStatus === SVGDataCheckStatus.DATA_CHANGED_BUT_STATUS) {
            setErrorMsgType(DataCheckMsgIndex.COMMON_MSG)
            setIsErrorShow(true)
            modified = true
        } else if (SVGRecordStatus === SVGDataCheckStatus.STATUS_CHANGED_TO_CANCELLED) {
            setErrorMsgType(DataCheckMsgIndex.SVG_CANCELLED_MSG)
            setIsErrorShow(true)
            modified = true
        } else if (SVGRecordStatus === SVGDataCheckStatus.STATUS_CHANGED_TO_PUBLISHED) {
            setErrorMsgType(DataCheckMsgIndex.SVG_PUBLISHED_MSG)
            setIsErrorShow(true)
            modified = true
        }
        return modified
    }
    return false
}

export const checkDailyVisitList = async (userId: string, visitDates: string[]) => {
    const dailyRecordTypeId = await getRecordTypeIdByDeveloperName('Daily_Visit_List', 'Visit_List__c')
    const q = `WHERE OwnerId='${userId}' AND Visit_Date__c IN (${getDateClause(visitDates)}) AND IsRemoved__c = false 
    AND Status__c != '${VisitListStatus.PRE_PROCESSED}' AND RecordTypeId = '${dailyRecordTypeId}'`
    const localQ = ` WHERE {Visit_List__c:OwnerId}='${userId}' 
    AND {Visit_List__c:Visit_Date__c} IN (${getIdClause(visitDates)}) 
    AND {Visit_List__c:IsRemoved__c} IS FALSE
    AND {Visit_List__c:RecordTypeId} = '${dailyRecordTypeId}'`
    const daily = await SoupService.retrieveDataFromSoup('Visit_List__c', {}, [], null, [localQ])
    const queryDayRes = daily.map((item) => item.Visit_Date__c)

    if (daily.length === 0) {
        const emptyCheck = await dataCheckWithAction('Visit_List__c', q, localQ, true)
        return Promise.resolve(emptyCheck)
    }
    const createDate = []
    const updateDate = []
    visitDates.forEach((date) => {
        if (queryDayRes.includes(date)) {
            updateDate.push(date)
        } else {
            createDate.push(date)
        }
    })
    let createCheck = true
    let updateCheck = true
    if (!_.isEmpty(createDate)) {
        createCheck = await dataCheckWithAction(
            'Visit_List__c',
            `WHERE OwnerId='${userId}' AND Visit_Date__c IN (${getDateClause(createDate)}) AND IsRemoved__c = false 
            AND Status__c != '${VisitListStatus.PRE_PROCESSED}' AND RecordTypeId = '${dailyRecordTypeId}'`,
            ` WHERE {Visit_List__c:OwnerId}='${userId}' AND {Visit_List__c:Visit_Date__c} IN (${getIdClause(
                createDate
            )})
            AND {Visit_List__c:IsRemoved__c} IS FALSE AND {Visit_List__c:RecordTypeId} = '${dailyRecordTypeId}'
            `,
            true
        )
    }
    if (!_.isEmpty(updateDate)) {
        updateCheck = await dataCheckWithAction(
            'Visit_List__c',
            `WHERE OwnerId='${userId}' AND Visit_Date__c IN (${getDateClause(updateDate)}) AND IsRemoved__c = false 
            AND Status__c != '${VisitListStatus.PRE_PROCESSED}' AND RecordTypeId = '${dailyRecordTypeId}'`,
            ` WHERE {Visit_List__c:OwnerId} = '${userId}' AND {Visit_List__c:Visit_Date__c} IN (${getIdClause(
                updateDate
            )})
              AND {Visit_List__c:IsRemoved__c} IS FALSE AND {Visit_List__c:RecordTypeId} = '${dailyRecordTypeId}'
            `,
            false
        )
    }
    return createCheck && updateCheck
}

export const checkVisitListForReassignVisit = async (userId: string, visitDates: string[], setIsLoading: Function) => {
    if (DataCheckConfig.enable) {
        try {
            const startDate = moment(visitDates[0]).clone().day(0).format(TIME_FORMAT.Y_MM_DD)
            const endDate = moment(visitDates[0]).clone().day(6).format(TIME_FORMAT.Y_MM_DD)
            const weeklyRecordTypeId = await getRecordTypeIdByDeveloperName('Visit_List_Group', 'Visit_List__c')
            const originWeekVisitList: any = await queryVisitList(
                userId,
                startDate,
                endDate,
                weeklyRecordTypeId,
                setIsLoading
            )
            const wvlCheck = await dataCheckWithAction(
                'Visit_List__c',
                `
                WHERE OwnerId='${userId}'
                AND Start_Date__c=${startDate}
                AND End_Date__c=${endDate}
                AND Location_Id__c='${CommonParam.userLocationId}'
                AND RecordTypeId='${weeklyRecordTypeId}'
                AND IsRemoved__c = false
                AND Status__c != '${VisitListStatus.PRE_PROCESSED}'
                `,
                `
                WHERE {Visit_List__c:OwnerId}='${userId}'
                AND {Visit_List__c:Start_Date__c}='${startDate}'
                AND {Visit_List__c:End_Date__c}='${endDate}'
                AND {Visit_List__c:Location_Id__c}='${CommonParam.userLocationId}'
                AND {Visit_List__c:RecordTypeId}='${weeklyRecordTypeId}'
                AND {Visit_List__c:IsRemoved__c} IS FALSE
                `,
                originWeekVisitList.length === 0
            )
            const dailyCheck = await checkDailyVisitList(userId, visitDates)
            return wvlCheck && dailyCheck
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'checkVisitListForReassignVisit', getStringValue(error))
            return false
        }
    }
    return true
}
const meetingAttendeesVLCheck = async (userId: string, planDate: string, oldDate: string, setIsLoading: any) => {
    let oUserVlCheck = true
    const pCheck = await checkVisitListForReassignVisit(userId, [planDate], setIsLoading)
    oUserVlCheck = pCheck && oUserVlCheck
    if (oldDate && planDate !== oldDate) {
        const ovlCheck = await checkVisitListForReassignVisit(userId, [oldDate], setIsLoading)
        oUserVlCheck = oUserVlCheck && ovlCheck
    }
    return oUserVlCheck
}
export const checkMeetingDataCheck = async (
    eventIds: any,
    userIds: string[],
    planDate: string,
    oldDate: any,
    setIsLoading: any
) => {
    if (DataCheckConfig.enable) {
        // if no eventIds is new or is edit  or delete meeting
        try {
            let check = true
            if (eventIds) {
                const eventCheck = await dataCheckWithAction(
                    'Event',
                    `WHERE Id IN (${getIdClause(eventIds)})`,
                    '',
                    false
                )
                check = check && eventCheck
            }
            const vlPromises = []
            for (const userId of userIds) {
                vlPromises.push(meetingAttendeesVLCheck(userId, planDate, oldDate, setIsLoading))
            }
            const checkArr = await Promise.all(vlPromises)
            checkArr.forEach((vlCheck) => {
                check = check && vlCheck
            })
            return check
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'checkMeetingDataCheck', getStringValue(error))
            return false
        }
    }
    return true
}

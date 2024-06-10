/**
 * @description Add a visit service
 * @author Xupeng Bao
 * @email xupeng.bao@pwc.com
 * @date 2021-08-12
 */

import moment from 'moment'
import { syncUpObjCreate, syncUpObjUpdate, syncUpObjUpdateFromMem } from '../../../api/SyncUtils'
import { CommonParam } from '../../../../common/CommonParam'
import { Constants } from '../../../../common/Constants'
import { Log } from '../../../../common/enums/Log'
import { DropDownType } from '../../../enums/Manager'
import { VisitListStatus } from '../../../enums/VisitList'
import { QueryAndSyncWeeklyForAddInterface } from '../../../interface/MerchManagerInterface'
import { SoupService } from '../../../service/SoupService'
import {
    getRecordTypeIdByDeveloperName,
    initVisitList,
    queryVisitList,
    SLICE_START,
    TEXT_LENGTH_MAX
} from '../../../utils/MerchManagerUtils'
import { getStringValue } from '../../../utils/LandingUtils'
import { filterExistFields, getObjByName } from '../../../utils/SyncUtils'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../common/utils/LogUtils'

export const queryAndSyncWeeklyForAdd = async (props: QueryAndSyncWeeklyForAddInterface) => {
    const {
        employeeId,
        startDate,
        endDate,
        searchEmployeeText,
        scheduleAdHoc,
        durationTime,
        visitCase,
        setIsLoading,
        dropDownRef
    } = props
    try {
        const weeklyRecordTypeId = await getRecordTypeIdByDeveloperName('Visit_List_Group', 'Visit_List__c')
        const originWeeklyVisitList: any = await queryVisitList(
            employeeId,
            startDate,
            endDate,
            weeklyRecordTypeId,
            setIsLoading
        )
        if (originWeeklyVisitList.length === 0) {
            const newWeekly = {
                ...initVisitList,
                Name: `${startDate} - ${endDate} - ${searchEmployeeText}`.slice(SLICE_START, TEXT_LENGTH_MAX),
                OwnerId: employeeId,
                Start_Date__c: startDate,
                End_Date__c: endDate,
                RecordTypeId: weeklyRecordTypeId,
                Location_Id__c: CommonParam.userLocationId,
                Status__c: 'Not Started',
                Updated__c: true,
                Manager_Ad_Hoc__c: scheduleAdHoc,
                Number_of_Planned_Visits__c: 0,
                Planned_Service_Time__c: durationTime,
                Total_Planned_Cases__c: visitCase
            }
            await SoupService.upsertDataIntoSoup('Visit_List__c', [newWeekly])
            await syncUpObjCreate(
                'Visit_List__c',
                getObjByName('Visit_List__c').syncUpCreateFields,
                getObjByName('Visit_List__c').syncUpCreateQuery +
                    ` WHERE {Visit_List__c:OwnerId} = '${employeeId}'
                        AND {Visit_List__c:Start_Date__c} = '${startDate}'
                        AND {Visit_List__c:End_Date__c} = '${endDate}'
                        AND {Visit_List__c:Location_Id__c} = '${CommonParam.userLocationId}'
                        AND {Visit_List__c:RecordTypeId} = '${weeklyRecordTypeId}'
                        AND {Visit_List__c:IsRemoved__c} IS FALSE
                    `
            ).catch((err) => {
                storeClassLog(Log.MOBILE_ERROR, 'AddAVisitService.queryAndSyncWeeklyForAdd1', getStringValue(err))
                dropDownRef?.current?.alertWithType(
                    DropDownType.ERROR,
                    'queryAndSyncWeeklyForAdd - failed to create weekly visit list',
                    err
                )
            })
        } else {
            originWeeklyVisitList[0].OwnerId = employeeId
            originWeeklyVisitList[0].Updated__c = true
            originWeeklyVisitList[0].Manager_Ad_Hoc__c = scheduleAdHoc
            originWeeklyVisitList[0].Number_of_Planned_Visits__c =
                parseInt(originWeeklyVisitList[0]?.Number_of_Planned_Visits__c || 0) + 1
            originWeeklyVisitList[0].Planned_Service_Time__c =
                parseInt(originWeeklyVisitList[0]?.Planned_Service_Time__c || 0) + Number(durationTime)
            originWeeklyVisitList[0].Total_Planned_Cases__c =
                parseInt(originWeeklyVisitList[0]?.Total_Planned_Cases__c || 0) + Number(visitCase)
            await SoupService.upsertDataIntoSoup('Visit_List__c', originWeeklyVisitList)
            await syncUpObjUpdate(
                'Visit_List__c',
                getObjByName('Visit_List__c').syncUpCreateFields,
                getObjByName('Visit_List__c').syncUpCreateQuery +
                    ` WHERE {Visit_List__c:Id} = '${originWeeklyVisitList[0].Id}'
                      AND {Visit_List__c:RecordTypeId} = '${weeklyRecordTypeId}'
                      AND {Visit_List__c:IsRemoved__c} IS FALSE
                    `
            ).catch((err) => {
                storeClassLog(Log.MOBILE_ERROR, 'AddAVisitService.queryAndSyncWeeklyForAdd2', getStringValue(err))
                dropDownRef?.current?.alertWithType(
                    DropDownType.ERROR,
                    'queryAndSyncWeeklyForAdd - failed to update weekly visit list',
                    err
                )
            })
        }
        return queryVisitList(employeeId, startDate, endDate, weeklyRecordTypeId, setIsLoading)
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'AddAVisitService.queryAndSyncWeeklyForAdd3', getStringValue(error))
        setIsLoading(false)
    }
}

const computeDailyForAdd = (props) => {
    const {
        employeeId,
        visitDate,
        searchEmployeeText,
        weeklyVisitList,
        scheduleAdHoc,
        durationTime,
        visitCase,
        dailyRecordTypeId,
        setIsLoading
    } = props
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'Visit_List__c',
            {},
            getObjByName('Visit_List__c').syncUpCreateFields,
            getObjByName('Visit_List__c').syncUpCreateQuery +
                `
             WHERE {Visit_List__c:OwnerId} = '${employeeId}'
             AND {Visit_List__c:Visit_Date__c} = '${visitDate}'
             AND {Visit_List__c:Status__c} != '${VisitListStatus.COMPLETED}'
             AND {Visit_List__c:IsRemoved__c} IS FALSE
             AND {Visit_List__c:RecordTypeId} = '${dailyRecordTypeId}'
             `
        )
            .then((res: any) => {
                if (res.length === 0) {
                    const newDaily = {
                        ...initVisitList,
                        Name: `${visitDate} - ${searchEmployeeText}`.slice(SLICE_START, TEXT_LENGTH_MAX),
                        OwnerId: employeeId,
                        Visit_Date__c: visitDate,
                        Visit_List_Group__c: weeklyVisitList[0].Id,
                        RecordTypeId: dailyRecordTypeId,
                        Location_Id__c: CommonParam.userLocationId,
                        Status__c: 'Not Started',
                        Updated__c: true,
                        Manager_Ad_Hoc__c: scheduleAdHoc,
                        Number_of_Planned_Visits__c: 0,
                        Planned_Service_Time__c: durationTime,
                        Total_Planned_Cases__c: visitCase
                    }
                    res.push(newDaily)
                    resolve(res)
                } else {
                    res = res.map((visitListItem) => {
                        visitListItem.Visit_List_Group__c = weeklyVisitList[0].Id
                        visitListItem.Updated__c = true
                        visitListItem.Manager_Ad_Hoc__c = scheduleAdHoc
                        visitListItem.Number_of_Planned_Visits__c =
                            Number(visitListItem?.Number_of_Planned_Visits__c || 0) + 1
                        visitListItem.Planned_Service_Time__c =
                            Number(visitListItem?.Planned_Service_Time__c || 0) + Number(durationTime)
                        visitListItem.Total_Planned_Cases__c =
                            Number(visitListItem?.Total_Planned_Cases__c || 0) + Number(visitCase)
                        return visitListItem
                    })
                    resolve(res)
                }
            })
            .catch((err) => {
                setIsLoading(false)
                reject(err)
            })
    })
}

export const queryAndSyncDailyForAdd = async (props) => {
    const {
        employeeId,
        visitDate,
        searchEmployeeText,
        weeklyVisitList,
        scheduleAdHoc,
        durationTime,
        visitCase,
        setIsLoading,
        dropDownRef
    } = props
    try {
        const dailyRecordTypeId = await getRecordTypeIdByDeveloperName('Daily_Visit_List', 'Visit_List__c')
        const originDailyVisitList = await computeDailyForAdd({
            employeeId,
            visitDate,
            searchEmployeeText,
            weeklyVisitList,
            scheduleAdHoc,
            durationTime,
            visitCase,
            dailyRecordTypeId,
            setIsLoading
        })

        await SoupService.upsertDataIntoSoup('Visit_List__c', originDailyVisitList)

        if (originDailyVisitList[0]?.Id === 'NeedCreate') {
            await syncUpObjCreate(
                'Visit_List__c',
                getObjByName('Visit_List__c').syncUpCreateFields,
                getObjByName('Visit_List__c').syncUpCreateQuery +
                    `
                WHERE {Visit_List__c:OwnerId} = '${employeeId}'
                AND {Visit_List__c:Visit_Date__c} = '${visitDate}'
                AND {Visit_List__c:Status__c} != '${VisitListStatus.COMPLETED}'
                AND {Visit_List__c:RecordTypeId} = '${dailyRecordTypeId}'
                AND {Visit_List__c:IsRemoved__c} IS FALSE
                `
            ).catch((err) => {
                storeClassLog(Log.MOBILE_ERROR, 'AddAVisitService.queryAndSyncDailyForAdd1', getStringValue(err))
                dropDownRef?.current?.alertWithType(
                    DropDownType.ERROR,
                    'queryAndSyncDailyForAdd - failed to create daily visit list',
                    err
                )
            })
        }
        if (originDailyVisitList[0]?.Id !== 'NeedCreate') {
            await syncUpObjUpdate(
                'Visit_List__c',
                getObjByName('Visit_List__c').syncUpCreateFields,
                getObjByName('Visit_List__c').syncUpCreateQuery +
                    `
                WHERE {Visit_List__c:OwnerId} = '${employeeId}'
                AND {Visit_List__c:Visit_Date__c} = '${visitDate}'
                AND {Visit_List__c:Status__c} != '${VisitListStatus.COMPLETED}'
                AND {Visit_List__c:IsRemoved__c} IS FALSE
                AND {Visit_List__c:RecordTypeId} = '${dailyRecordTypeId}'
                `
            ).catch((err) => {
                storeClassLog(Log.MOBILE_ERROR, 'AddAVisitService.queryAndSyncDailyForAdd2', getStringValue(err))
                dropDownRef?.current?.alertWithType(
                    DropDownType.ERROR,
                    'queryAndSyncDailyForAdd - failed to update daily visit list',
                    err
                )
            })
        }

        return SoupService.retrieveDataFromSoup(
            'Visit_List__c',
            {},
            getObjByName('Visit_List__c').syncUpCreateFields,
            getObjByName('Visit_List__c').syncUpCreateQuery +
                `
            WHERE {Visit_List__c:OwnerId} = '${employeeId}'
            AND {Visit_List__c:Visit_Date__c} = '${visitDate}'
            AND {Visit_List__c:Status__c} != '${VisitListStatus.COMPLETED}'
            AND {Visit_List__c:IsRemoved__c} IS FALSE
            AND {Visit_List__c:RecordTypeId} = '${dailyRecordTypeId}'
            `
        )
    } catch (error) {
        setIsLoading(false)
        storeClassLog(Log.MOBILE_ERROR, 'AddAVisitService.queryAndSyncDailyForAdd3', getStringValue(error))
        dropDownRef.current.alertWithType(DropDownType.ERROR, 'AddAVisit Service - queryAndSyncDailyForAdd', error)
    }
}

export const recalculatePullNumberWithCustomerIdAndVisitDate = async (customerId: string, visitDate: string) => {
    try {
        const date = moment(visitDate).format(TIME_FORMAT.Y_MM_DD)
        const visits = await SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            getObjByName('Visit').syncUpCreateFields,
            getObjByName('Visit').syncUpCreateQuery +
                `
            WHERE {Visit:PlaceId} = '${customerId}' AND {Visit:Planned_Date__c} = '${date}'
            AND {Visit:Status__c} != 'Removed' AND {Visit:Status__c} != 'Failed' ORDER BY {Visit:Pull_Number__c}
            `
        )
        if (visits.length > 0) {
            visits.forEach((visit, index) => {
                visit.Pull_Number__c = index + Constants.ADD_NUMBER_ONE
            })
            const updateFields = ['Id', 'Pull_Number__c']
            await syncUpObjUpdateFromMem('Visit', filterExistFields('Visit', visits, updateFields))
        }
        return Promise.resolve()
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'AddAVisitService.recalculatePullNumberWithCustomerIdAndVisitDate',
            getStringValue(error)
        )
        return Promise.reject(error)
    }
}

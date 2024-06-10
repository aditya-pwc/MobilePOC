/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2023-12-13 15:32:12
 * @LastEditTime: 2024-02-07 17:39:54
 * @LastEditors: Mary Qian
 */
import _ from 'lodash'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { CommonParam } from '../../../../../common/CommonParam'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { Log } from '../../../../../common/enums/Log'
import { SoupService } from '../../../../service/SoupService'
import { t } from '../../../../../common/i18n/t'
import { uploadDataToSharePoint } from './EditGeoFence/SharePointHelper'
import { restDataCommonCall } from '../../../../api/SyncUtils'

export const NA = 'N/A'
export const DTW_DEFAULT_EMPTY_TIME = '00:00'
export const DTW_DEFAULT_START_TIME = '05:00'
export const DTW_DEFAULT_END_TIME = '17:00'
export const DTW_DEFAULT_START_TIME_2 = '13:00'
export const DTW_DEFAULT_END_TIME_2 = '17:00'

const CHANGE_TYPE = 'Time Window Change'

export interface DeliveryTimeProps {
    startTime1: string
    endTime1: string
    startTime2: string
    endTime2: string
    localStartTime1: string
    localEndTime1: string
    localStartTime2: string
    localEndTime2: string
    displayString: string
}

export interface DeliveryTimeObjProps {
    SUN: DeliveryTimeProps
    MON: DeliveryTimeProps
    TUE: DeliveryTimeProps
    WED: DeliveryTimeProps
    THU: DeliveryTimeProps
    FRI: DeliveryTimeProps
    SAT: DeliveryTimeProps
}
const DefaultTimeData = {
    startTime1: '',
    endTime1: '',
    startTime2: '',
    endTime2: '',
    localStartTime1: '',
    localEndTime1: '',
    localStartTime2: '',
    localEndTime2: '',
    displayString: DTW_DEFAULT_EMPTY_TIME + ' - ' + DTW_DEFAULT_EMPTY_TIME
}

export const DefaultDeliveryTimeWindow: DeliveryTimeObjProps = {
    SUN: DefaultTimeData,
    MON: DefaultTimeData,
    TUE: DefaultTimeData,
    WED: DefaultTimeData,
    THU: DefaultTimeData,
    FRI: DefaultTimeData,
    SAT: DefaultTimeData
}

export interface TimeBoxProps {
    week: string
    modalTitle: string
    defaultHour: number
    defaultMinute: number
}

export const DefaultTimeBox: TimeBoxProps = {
    week: '',
    modalTitle: '',
    defaultHour: 0,
    defaultMinute: 0
}

export const getDoubleString = (num: number) => {
    return `${num <= 9 ? '0' : ''}${num}`
}

const formatTimeForRIC = (time: string) => {
    return time?.substring(0, 5)
}

const getShortNameOfWeek = (weekDay: string): string => {
    switch (weekDay) {
        case 'MON':
            return 'M'
        case 'TUE':
            return 'T'
        case 'WED':
            return 'W'
        case 'THU':
            return 'R'
        case 'FRI':
            return 'F'
        case 'SAT':
            return 'S'
        case 'SUN':
            return 'U'
        default:
            return ''
    }
}

export const getFullNameOfWeek = (weekDay: string): string => {
    switch (weekDay) {
        case 'MON':
            return t.labels.PBNA_MOBILE_MONDAY
        case 'TUE':
            return t.labels.PBNA_MOBILE_TUESDAY
        case 'WED':
            return t.labels.PBNA_MOBILE_WEDNESDAY
        case 'THU':
            return t.labels.PBNA_MOBILE_THURSDAY
        case 'FRI':
            return t.labels.PBNA_MOBILE_FRIDAY
        case 'SAT':
            return t.labels.PBNA_MOBILE_SATURDAY
        case 'SUN':
            return t.labels.PBNA_MOBILE_SUNDAY
        default:
            return ''
    }
}

export const getDeliveryTimeObj = (
    startTime1: string,
    endTime1: string,
    startTime2: string,
    endTime2: string
): DeliveryTimeProps => {
    let displayString = ''
    const localStartTime1 = formatTimeForRIC(startTime1) || ''
    const localEndTime1 = formatTimeForRIC(endTime1) || ''
    const localStartTime2 = formatTimeForRIC(startTime2) || ''
    const localEndTime2 = formatTimeForRIC(endTime2) || ''

    if (_.isEmpty(startTime1) && _.isEmpty(endTime1) && _.isEmpty(startTime2) && _.isEmpty(endTime2)) {
        displayString = `${DTW_DEFAULT_EMPTY_TIME} - ${DTW_DEFAULT_EMPTY_TIME}`
    } else {
        const time1Str =
            (formatTimeForRIC(startTime1) || DTW_DEFAULT_EMPTY_TIME) +
            ' - ' +
            (formatTimeForRIC(endTime1) || DTW_DEFAULT_EMPTY_TIME)

        if (_.isEmpty(startTime2) && _.isEmpty(endTime2)) {
            displayString = time1Str
        } else {
            const time2Str =
                (formatTimeForRIC(startTime2) || DTW_DEFAULT_EMPTY_TIME) +
                ' - ' +
                (formatTimeForRIC(endTime2) || DTW_DEFAULT_EMPTY_TIME)
            displayString = time1Str + ' | ' + time2Str
        }
    }

    return {
        startTime1: localStartTime1,
        endTime1: localEndTime1,
        startTime2: localStartTime2,
        endTime2: localEndTime2,
        localStartTime1,
        localEndTime1,
        localStartTime2,
        localEndTime2,
        displayString
    }
}

interface UploadTimeWindowParamsProps {
    Location?: string
    Location0?: string
    COF?: string
    ChangeType?: string
    CustomerAddress?: string
    CustomerCity?: string
    CustomerName?: string
    CustomerState?: string
    RequestedBy?: string
    TimeWindowDaysSelection?: string
    TimeWindowStart1?: string
    TimeWindowClose1?: string
    TimeWindowStart2?: string
    TimeWindowClose2?: string
}
export const getLocationNameArrByLocId = async (accountLocId: string) => {
    return await restDataCommonCall(
        `query/?q=SELECT Id, SLS_UNIT_ID__c, SLS_UNIT_NM__c From Route_Sales_Geo__c WHERE SLS_UNIT_ID__c='${accountLocId}'`,
        'GET'
    )
}

export const getBody = async (groupedData: any, accountId: string): Promise<UploadTimeWindowParamsProps[]> => {
    try {
        const retailStore = await SoupService.retrieveDataFromSoup('RetailStore', {}, [], null, [
            ` WHERE {RetailStore:AccountId}='${accountId}'`
        ])

        if (_.isEmpty(retailStore)) {
            return []
        }

        const { City, State, Street, Name } = retailStore[0]

        const locationNameArr = await getLocationNameArrByLocId(retailStore[0]['Account.LOC_PROD_ID__c'] as string)

        const fields: UploadTimeWindowParamsProps = {
            Location0: locationNameArr?.data?.records[0]?.SLS_UNIT_NM__c || CommonParam.userLocationName,
            COF: retailStore[0]['Account.CUST_UNIQ_ID_VAL__c'] as string,
            ChangeType: CHANGE_TYPE,
            CustomerAddress: Street as string,
            CustomerCity: City as string,
            CustomerName: Name as string,
            CustomerState: State as string,
            RequestedBy: CommonParam.userName
        }

        const compositeBody = []
        for (const fullTimeString in groupedData) {
            if (Object.prototype.hasOwnProperty.call(groupedData, fullTimeString)) {
                const timeArr = fullTimeString.split('-')
                const weekString = groupedData[fullTimeString].map((i: any) => getShortNameOfWeek(i.week)).join('')
                const item = {
                    TimeWindowDaysSelection: weekString,
                    TimeWindowStart1: formatTimeForRIC(timeArr[0]),
                    TimeWindowClose1: formatTimeForRIC(timeArr[1]),
                    TimeWindowStart2: timeArr[2] === 'null' ? '' : formatTimeForRIC(timeArr[2]),
                    TimeWindowClose2: timeArr[3] === 'null' ? '' : formatTimeForRIC(timeArr[3]),
                    TimeWindowDays: weekString
                }

                compositeBody.push({
                    ...fields,
                    ...item
                })
            }
        }

        return compositeBody
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'DTW-getBody', ErrorUtils.error2String(error))
        return []
    }
}

export const uploadToSharePoint = async (data: UploadTimeWindowParamsProps[]) => {
    return uploadDataToSharePoint(data)
}

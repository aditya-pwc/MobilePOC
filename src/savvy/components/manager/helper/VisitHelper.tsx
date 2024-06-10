/**
 * @description Visit related common functions.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2022-05-26
 */

import _ from 'lodash'
import moment from 'moment'
import { restDataCommonCall } from '../../../api/SyncUtils'
import { Log } from '../../../../common/enums/Log'
import { DropDownType, WeekDayIndex } from '../../../enums/Manager'
import { t } from '../../../../common/i18n/t'
import { SoupService } from '../../../service/SoupService'
import { formatString } from '../../../utils/CommonUtils'
import { getTotalHours } from '../../../utils/MerchManagerComputeUtils'
import { getWorkingStatusConfig } from '../../../utils/MerchManagerUtils'
import { getIdClause } from './MerchManagerHelper'
import NEW_EN from '../../../../../assets/image/text-white-new-en.svg'
import NEW_FR from '../../../../../assets/image/text-white-new-fr.svg'
import NEW_AD_EN from '../../../../../assets/image/text-green-new-en.svg'
import NEW_AD_FR from '../../../../../assets/image/text-green-new-fr.svg'
import { CommonParam } from '../../../../common/CommonParam'
import { Locale } from '../../../enums/i18n'
import { CommonLabel } from '../../../enums/CommonLabel'
import { getStringValue } from '../../../utils/LandingUtils'
import { existParamsEmpty } from '../../../api/ApiUtil'

import { VisitListStatus } from '../../../enums/VisitList'
import LocationService from '../../../service/LocationService'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { FeatureToggle } from '../../../../common/enums/FeatureToggleName'

export const fetchUserInfo = async (userIds: string[]) => {
    try {
        if (_.isEmpty(userIds)) {
            return []
        }
        const query = `SELECT Id, Name, FirstName, LastName, GPID__c FROM User WHERE ID IN (${getIdClause(userIds)})`
        const path = `query/?q=${query}`
        const results = await restDataCommonCall(path, 'GET')
        return results.data.records || []
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, fetchUserInfo.name, getStringValue(e))
        return []
    }
}

const UnassignedRouteEEQuery = `SELECT 
        {Visit:Id},
        {Visit:GPID__c}, 
        {Visit:Route_Group__c}, 
        SUM({Visit:Planned_Duration_Minutes__c}), 
        SUM({Visit:Planned_Travel_Time__c}),
        SUM({Visit:Planned_Mileage__c}), 
        COUNT({Visit:Id}) 
    FROM {Visit}`

const UnassignedRouteEEField = [
    'id',
    'GPID__c',
    'Route_Group__c',
    'totalPlannedDurationMinutes',
    'totalTravelTime',
    'totalMiles',
    'totalVisit'
]

const retrieveUnassignedRouteEE = {
    q: UnassignedRouteEEQuery,
    f: UnassignedRouteEEField
}

const compositeRouteItem = (record, visitInfo) => {
    return {
        id: record.Id,
        gpid: record.GPID__c,
        name: record.Name,
        firstName: record.FirstName,
        lastName: record.LastName,
        totalMinutes: Number(visitInfo.totalPlannedDurationMinutes) + Number(visitInfo.totalTravelTime),
        totalDuration: Number(visitInfo.totalPlannedDurationMinutes) + Number(visitInfo.totalTravelTime),
        totalHours: getTotalHours(Number(visitInfo.totalPlannedDurationMinutes), Number(visitInfo.totalTravelTime)),
        totalMiles: visitInfo.totalMiles || 0,
        totalVisit: visitInfo.totalVisit,
        workingStatus: getWorkingStatusConfig(),
        unassignedRoute: true,
        visits: {}
    }
}

const handleRouteUserInfo = async (unassignedVisits) => {
    const routeGroups = []
    const routeGroupVisitInfoMap = new Map()
    unassignedVisits.forEach((item) => {
        routeGroups.push(item.Route_Group__c)
        routeGroupVisitInfoMap.set(item.Route_Group__c, item)
    })
    const routeUserInfo = await fetchUserInfo(routeGroups)
    const formatRouteUserInfo = []
    routeUserInfo.forEach((record) => {
        const visitInfo = routeGroupVisitInfoMap.get(record.Id)
        const item = compositeRouteItem(record, visitInfo)
        formatRouteUserInfo.push(item)
    })
    return formatRouteUserInfo
}

export const getUnassignedRouteUserBySVGID = async (scheduleVisitListId: string, isFromMyDay?: boolean) => {
    try {
        const unassignedVisits = await SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            retrieveUnassignedRouteEE.f,
            formatString(
                retrieveUnassignedRouteEE.q +
                    `
                WHERE {Visit:Schedule_Visit_Group__c} = '%s'
                AND {Visit:Status__c} != 'Removed' AND {Visit:Status__c} != 'Failed' AND {Visit:Status__c} ${
                    isFromMyDay ? '!' : ''
                }= 'Planned'
                AND {Visit:Route_Group__c} IS NOT NULL
                GROUP BY {Visit:Route_Group__c}
                ORDER BY COUNT({Visit:Id}) DESC
            `,
                [scheduleVisitListId]
            )
        )
        return await handleRouteUserInfo(unassignedVisits)
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, getUnassignedRouteUserBySVGID.name, getStringValue(e))
    }
}

export const getVisitDetailsUnassignedRouteInfo = async (
    routeGroup: string,
    scheduleVisitListId: string,
    isFromRNSView
) => {
    try {
        if (_.isEmpty(routeGroup)) {
            return []
        }
        const unassignedVisits = await SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            retrieveUnassignedRouteEE.f,
            formatString(
                retrieveUnassignedRouteEE.q +
                    `
                WHERE {Visit:Route_Group__c} = '%s'
                AND {Visit:Schedule_Visit_Group__c} = '%s'
                AND {Visit:Status__c} != 'Removed' AND {Visit:Status__c} != 'Failed' AND {Visit:Status__c} ${
                    isFromRNSView ? '' : '!'
                }= 'Planned'
                GROUP BY {Visit:Route_Group__c}
            `,
                [routeGroup, scheduleVisitListId]
            )
        )
        const routeUserInfo = await fetchUserInfo([routeGroup])
        unassignedVisits[0].name = routeUserInfo[0].Name
        unassignedVisits[0].totalMinutes =
            Number(unassignedVisits[0].totalPlannedDurationMinutes) + Number(unassignedVisits[0].totalTravelTime)
        return unassignedVisits
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, getVisitDetailsUnassignedRouteInfo.name, getStringValue(e))
    }
}

export const getUnassignedRouteUserByDate = async (date: string, isUGMPersona?) => {
    try {
        let query = formatString(
            retrieveUnassignedRouteEE.q +
                `
            WHERE {Visit:Planned_Date__c} = date('%s')
            AND {Visit:Status__c} != 'Removed' AND {Visit:Status__c} != 'Planned' AND {Visit:Status__c} != 'Failed'
            AND {Visit:Route_Group__c} IS NOT NULL
            GROUP BY {Visit:Route_Group__c}
            ORDER BY COUNT({Visit:Id}) DESC
        `,
            [date]
        )
        if (isUGMPersona) {
            query =
                retrieveUnassignedRouteEE.q +
                `
                WHERE DATE({Visit:Planned_Date__c}) >= DATE('now', 'weekday 0', '-7 days')
                AND {Visit:Status__c} != 'Removed' AND {Visit:Status__c} != 'Planned'
                AND {Visit:Status__c} != 'Failed'
                AND {Visit:Route_Group__c} IS NOT NULL
                GROUP BY {Visit:Route_Group__c}
                ORDER BY COUNT({Visit:Id}) DESC
            `
        }
        const unassignedVisits = await SoupService.retrieveDataFromSoup('Visit', {}, retrieveUnassignedRouteEE.f, query)
        return await handleRouteUserInfo(unassignedVisits)
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, getUnassignedRouteUserByDate.name, getStringValue(e))
    }
}

export const formatScheduleDate = (scheduleDateArr: Array<string>) => {
    const startDateStr = scheduleDateArr[0]
    let visitDate = moment(startDateStr)
    if (visitDate.format(TIME_FORMAT.Y_MM_DD) !== startDateStr) {
        visitDate = moment(startDateStr + CommonLabel.END_OF_DAY_TIME)
    }
    if (!_.isEmpty(visitDate)) {
        return (
            _.capitalize(
                visitDate.clone().day(WeekDayIndex.SUNDAY_NUM).format(TIME_FORMAT.SCHEDULE_DATE_FORMAT).toString()
            ) +
            ` ${t.labels.PBNA_MOBILE_TO.toLowerCase()} ` +
            _.capitalize(
                visitDate.clone().day(WeekDayIndex.SATURDAY_NUM).format(TIME_FORMAT.SCHEDULE_DATE_FORMAT).toString()
            )
        )
    }
    return ''
}

export const getVisitSubtypes = () => {
    return [
        { id: 'PREMIER', name: t.labels.PBNA_MOBILE_PREMIER, select: false },
        {
            id: 'Coolers Only',
            name: t.labels.PBNA_MOBILE_COOLERS_ONLY,
            desc: t.labels.PBNA_MOBILE_COOLERS_ONLY_DESC,
            select: false
        },
        { id: 'Merchandising Support', name: t.labels.PBNA_MOBILE_MERCHANDISING_SUPPORT, select: false },
        { id: 'Delivery Support', name: t.labels.PBNA_MOBILE_DELIVERY_SUPPORT, select: false },
        { id: 'Customer Inventory', name: t.labels.PBNA_MOBILE_CUSTOMER_INVENTORY, select: false },
        { id: 'Resets', name: t.labels.PBNA_MOBILE_RESETS, select: false },
        {
            id: 'Fresh & Front',
            name: t.labels.PBNA_MOBILE_FRESH_FRONT,
            desc: t.labels.PBNA_MOBILE_FNF_DESC,
            select: false
        },
        {
            id: 'Gatorade Only',
            name: t.labels.PBNA_MOBILE_GATORADE_ONLY,
            desc: t.labels.PBNA_MOBILE_GATORADE_ONLY_DESC,
            select: false
        },
        {
            id: 'Displays Only',
            name: t.labels.PBNA_MOBILE_DISPLAYS_ONLY,
            desc: t.labels.PBNA_MOBILE_DISPLAY_ONLY_DESC,
            select: false
        },
        {
            id: 'Chilled Only',
            name: t.labels.PBNA_MOBILE_CHILLED_ONLY,
            desc: t.labels.PBNA_MOBILE_CHILLED_ONLY_DESC,
            select: false
        },
        {
            id: 'BCD Pilot',
            name: t.labels.PBNA_MOBILE_BCD_PILOT,
            desc: t.labels.PBNA_MOBILE_BCD_PILOT_SELECT_STATES_ONLY_DESC,
            select: false
        }
    ]
}

export const getAdHocNewImage = () => {
    return CommonParam.locale === Locale.fr ? NEW_AD_FR : NEW_AD_EN
}
export const getManagerAdHocNewImage = () => {
    return CommonParam.locale === Locale.fr ? NEW_FR : NEW_EN
}

export const getDynamicFrequencyFlag = () => {
    if (existParamsEmpty([CommonParam.userLocationId])) {
        return false
    }
    return CommonParam.FeatureToggle[FeatureToggle.DYNAMIC_FREQUENCY]
}

export const queryCancelingScheduleVisitGroup = async (svgId) => {
    if (_.isEmpty(svgId)) {
        return false
    }
    try {
        const query = `SELECT Id, Status__c
        FROM Visit_List__c WHERE Id = '${svgId}'`
        const path = `query/?q=${query}`
        const res = await restDataCommonCall(path, 'GET')
        const svgData = res?.data?.records?.[0]
        return svgData?.Status__c === VisitListStatus.CANCELING
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, `${queryCancelingScheduleVisitGroup.name}:`, getStringValue(error))
        return false
    }
}
export const abortExecutionAndAlertWhenCanceling = async (visitListId, setIsLoading, dropDownRef) => {
    const isCanceling = await queryCancelingScheduleVisitGroup(visitListId)
    if (isCanceling) {
        setIsLoading && setIsLoading(false)
        dropDownRef?.current?.alertWithType(
            DropDownType.INFO,
            t.labels.PBNA_MOBILE_SCHEDULE_IS_CANCELING,
            t.labels.PBNA_MOBILE_SCHEDULE_IS_HANDLING_BY_OTHERS
        )
    }
    return isCanceling
}
export const SCHEDULE_VISIT_GROUP_IS_BEING_USED = 'Schedule Visit List Being Used'

export const formatScheduleDateWithSlash = (scheduleDateArr: Array<string>) => {
    if (!_.isEmpty(scheduleDateArr)) {
        return (
            moment(scheduleDateArr[0]).format(TIME_FORMAT.MM_DD_YYYY).toString() +
            '-' +
            moment(scheduleDateArr[1]).format(TIME_FORMAT.MM_DD_YYYY).toString()
        )
    }
    return ''
}

export const updateVisitSubType = (setTypeModalVisible, typeModalVisible, subTypeArray, setSelectedSubType) => {
    setTypeModalVisible(!typeModalVisible)
    setSelectedSubType(_.cloneDeep(subTypeArray))
}

export const onCancelSubType = (setTypeModalVisible, typeModalVisible, selectedSubType, setSubTypeArray) => {
    setTypeModalVisible(!typeModalVisible)
    setSubTypeArray(_.cloneDeep(selectedSubType))
}

export const onRemoveSubType = (item, subTypeArray, setSubTypeArray, setSelectedSubType) => {
    subTypeArray.find((sub) => sub.id === item.id).select = false
    const visitSubType = _.cloneDeep(subTypeArray)
    setSubTypeArray(visitSubType)
    setSelectedSubType(visitSubType)
}

export const getLocationPosition = (setMapInfo: Function) => {
    LocationService.getCurrentPosition().then((position: any) => {
        // default location is World Trade Center, New York, NY 10006
        let pos = {
            latitude: 40.7121001,
            longitude: -74.0125118
        }
        if (position && position.coords && position.coords.latitude && position.coords.longitude) {
            pos = position.coords
        }
        const bounding = LocationService.getBoundingBox(pos, [])
        setMapInfo({
            region: bounding.initialRegion
        })
    })
}

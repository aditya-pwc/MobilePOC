/*
 * @Description:
 * @Author: Shangmin Dou
 * @Date: 2021-11-11 08:52:40
 * @LastEditTime: 2023-10-11 18:04:41
 * @LastEditors: Yi Li
 */
/**
 * @description This file is to place custom apex apis.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 */
import { restApexCommonCall } from './SyncUtils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
    CommonSyncRes,
    MobileSyncServiceProps,
    PushNotificationToMerchProps
} from '../../common/interface/SyncInterface'
import { CommonApi } from '../../common/api/CommonApi'
import { CommonParam } from '../../common/CommonParam'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'

/**
 * @description Get leads for the init sync.
 */
export const getWiredLeadIds = () => {
    return new Promise<CommonSyncRes>((resolve, reject) => {
        restApexCommonCall('leadinfo', 'GET')
            .then(async (res) => {
                const leads = res.data
                resolve({ status: 'E0', data: leads })
            })
            .catch((err) => {
                reject({ status: 'E3', error: err })
            })
    })
}

/**
 * @description sync down a series of business metadata for the lead form.
 */
export const syncDownBusinessSegmentPicklistItem = () => {
    return new Promise<CommonSyncRes>((resolve, reject) => {
        restApexCommonCall('SegmentInfo', 'GET')
            .then((res) => {
                AsyncStorage.setItem('Business_Segment_Hierarchy', res.data)
                    .then(() => {
                        resolve({ status: 'E0' })
                    })
                    .catch((err) => {
                        storeClassLog(Log.MOBILE_ERROR, 'syncDownBusinessSegmentPicklistItem', err)
                    })
            })
            .catch((err) => {
                reject({ status: 'E2', error: err })
            })
    })
}
/**
 * @description Update the task owner for lead owner change.
 * @param ids
 */
export const updateTaskOwner = (ids) => {
    return new Promise<CommonSyncRes>((resolve, reject) => {
        restApexCommonCall('updatetaskowner', 'PATCH', { ids })
            .then(() => {
                resolve({ status: 'E0' })
            })
            .catch((err) => {
                reject({ status: 'E2', error: err })
            })
    })
}

export const checkLeadWiring = () => {
    return restApexCommonCall('leadwiring', 'GET')
}

export const getWiredRetailStoreIds = () => {
    return new Promise<CommonSyncRes>((resolve, reject) => {
        restApexCommonCall('customerinfoforrep', 'GET')
            .then(async (res) => {
                const retailStoreIds = res.data
                resolve({ status: 'E0', data: retailStoreIds.ids })
            })
            .catch((err) => {
                reject({ status: 'E3', error: err })
            })
    })
}

export const fetchAssessmentTask = (id: string) => {
    return restApexCommonCall(`${CommonApi.PBNA_MOBILE_API_ASSESSMENT_TASK}/${id}`, 'GET')
}

export const uploadAssessmentTask = (body) => {
    return restApexCommonCall(`${CommonApi.PBNA_MOBILE_API_ASSESSMENT_TASK}/`, 'POST', body)
}

export const fetchStaticResources = () => {
    return restApexCommonCall(`${CommonApi.PBNA_MOBILE_API_STATIC_RESOURCE}/`, 'GET')
}

export const fetchCredentialBreadcrumbs = () => {
    return restApexCommonCall(`${CommonApi.PBNA_MOBILE_API_SSO_LOGIN_CREDENTIAL}/`, 'GET')
}

export const recalculateMeeting = (body: any) => {
    return restApexCommonCall(CommonApi.PBNA_MOBILE_RECALCULATE_MEETING_API, 'PATCH', body)
}

export const recalculateSchedule = (body: any) => {
    return restApexCommonCall(CommonApi.PBNA_MOBILE_RECALCULATE_SCHEDULE_API, 'PATCH', body)
}

export const publishSchedule = (body: any) => {
    return restApexCommonCall(CommonApi.PBNA_MOBILE_PUBLISH_SCHEDULE_API, 'PATCH', body)
}

export const getMeetingInfo = (meetingInfo) => {
    return restApexCommonCall(CommonApi.PBNA_MOBILE_EVENT_GENERATION_API, 'POST', meetingInfo)
}

export const cancelSchedule = (body) => {
    return restApexCommonCall(CommonApi.PBNA_MOBILE_CANCEL_SCHEDULE_API, 'PATCH', body)
}

export const cancelGeneratingSchedule = (body) => {
    return restApexCommonCall(CommonApi.PBNA_MOBILE_CANCEL_GENERATING_API, 'PATCH', body)
}

export const visitGeneration = (body) => {
    return restApexCommonCall(CommonApi.PBNA_MOBILE_VISIT_GENERATION_API, 'POST', body)
}

export const addMultiVisits = (body) => {
    return restApexCommonCall('createVisitApi', 'POST', body)
}

export const fetchRecommendedProducts = (selectedEquipSetupId: string) => {
    return restApexCommonCall('getrecommendedproduct/?selectedEquipSetupId=' + selectedEquipSetupId, 'GET')
}

export const fetchLeadInfoByGpid = (gpid: string, filterdate: string) => {
    return new Promise<CommonSyncRes>((resolve, reject) => {
        restApexCommonCall(`leadinfobygpid?gpid=${gpid}&filterdate=${filterdate}`, 'GET')
            .then(async (res) => {
                resolve({ status: 'E0', data: res.data })
            })
            .catch((err) => {
                reject({ status: 'E3', error: err })
            })
    })
}

export const fetchTeamBusinessWon = () => {
    return new Promise<CommonSyncRes>((resolve, reject) => {
        restApexCommonCall('leadbwinfo', 'GET')
            .then(async (res) => {
                resolve({ status: 'E0', data: res.data })
            })
            .catch((err) => {
                reject({ status: 'E3', error: err })
            })
    })
}

export const fetchBrandings = (
    businessTypeCode: string,
    locationProductId: string,
    equipmentTypeCode: string,
    equipmentSubTypeCode: string,
    leadType: string
) => {
    return new Promise<CommonSyncRes>((resolve, reject) => {
        restApexCommonCall(
            `getproductcategory/?type=${equipmentTypeCode}&subType=${equipmentSubTypeCode}&busTypeCode=${businessTypeCode}&localProductId=${locationProductId}&leadType=${leadType}`,
            'GET'
        )
            .then(async (res) => {
                resolve({ status: 'E0', data: res.data })
            })
            .catch((err) => {
                reject({ status: 'E3', error: err })
            })
    })
}

export const checkAppVersion = (currentMobileAppVersion, currentDatabaseVersion) => {
    return restApexCommonCall(
        `getinitializationcheck/?currentAppVersion=${currentMobileAppVersion}&currentDatabaseVersion=${currentDatabaseVersion}`,
        'GET'
    )
}

export const fetchAggregateList = (code: string) => {
    return restApexCommonCall(`getaggregatelist/?PROD_MIX_CDE__C=${code}`, 'GET')
}

export const fetchBrandList = (code: string) => {
    return restApexCommonCall(`getbrandlist/?PROD_MIX_CDE__C=${code}`, 'GET')
}

export const updateLastViewedLocation = (body) => {
    return restApexCommonCall(CommonApi.PBNA_MOBILE_UPDATE_LAST_LOCATION, 'PATCH', body)
}

export const pushNotificationToMerch = (body: PushNotificationToMerchProps) => {
    return restApexCommonCall('pushNotificationToMerch', 'POST', body)
}

export const mobileCustomSyncService = (body: MobileSyncServiceProps) => {
    return restApexCommonCall(CommonApi.PBNA_MOBILE_SYNC_SERVICE, 'POST', body)
}

export const getMobileSyncConfig = () => {
    return restApexCommonCall(CommonApi.PBNA_MOBILE_SYNC_SERVICE, 'GET')
}

export const getCommissionStruct = (assetId: string) => {
    return restApexCommonCall(`getCommissionStruct/?assetId=${assetId}`, 'GET')
}

export const getUserCDAViewToggle = () => {
    return restApexCommonCall(`getUserCDAViewToggle/?persona=${CommonParam.PERSONA__c}`, 'GET')
}

export const addResetVisit = (body: any) => {
    return restApexCommonCall('createResetsVisitApi', 'POST', body)
}

export const getTruckVolume = (body: any) => {
    return restApexCommonCall(`CDA/TruckVolume`, 'POST', body, {
        headers: { okta_access_token: `Bearer ${CommonParam.breadcrumbsAccessToken}` }
    })
}

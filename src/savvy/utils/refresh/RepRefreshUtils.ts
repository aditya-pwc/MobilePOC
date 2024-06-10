import { CommonSyncRes } from '../../../common/interface/SyncInterface'
import { buildSyncDownObjPromise, restDataCommonCall } from '../../api/SyncUtils'
import { CommonParam } from '../../../common/CommonParam'
import { getAllFieldsByObjName } from '../SyncUtils'
import { promiseQueue } from '../../api/InitSyncUtils'
import { refreshKpiBarAction, updatingLeadWiringAction } from '../../redux/action/LeadActionType'
import moment from 'moment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Log } from '../../../common/enums/Log'
import { buildLeadReqs, chunkIdsAndExternalIds, clearLeadsGroup, genSyncDownLeadsGroupReqs } from '../LeadUtils'
import { checkLeadWiring } from '../../api/ApexApis'
import { retrieveInternalContact } from '../../hooks/CustomerHooks'
import {
    getPriorityIdsFromStorePriority,
    refreshInnovationProduct,
    refreshMetricsInnovationProduct
} from '../InnovationProductUtils'
import { retrieveTeamMemberDetail } from '../FSManagerSyncUtils'
import { fetchCustomerDetailScreenDataByConfig } from '../CustomerSyncUtils'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { isPersonaPSR, isPersonaKAM, isPersonaUGMOrSDL } from '../../../common/enums/Persona'
import { retrieveEquipmentAssets } from '../../hooks/EquipmentHooks'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { Dispatch, AnyAction } from 'redux'
import _ from 'lodash'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { startCustomerListLoading, stopCustomerListLoading } from '../../redux/Slice/CustomerListStateSlice'

export type RepPosition =
    | 'MyLeadsList'
    | 'OpenLeadsList'
    | 'LeadDetailScreen'
    | 'CustomerDetailScreenTabSALES ACTIONS'
    | 'CustomerDetailScreenTabSALES SNAPSHOT'
    | 'CustomerDetailScreenTabMY STORE'
    | 'CustomerDetailScreenTabACTIVITIES'
    | 'CustomerDetailScreenTabEQUIPMENT'
    | 'CustomerDetailScreenTabCONTRACT'
    | 'CustomerDetailScreenTabCONTACTS'
    | 'CustomerDetailScreenTabPROFILE'
    | 'CustomerDetailScreenTabPOS'
    | 'RepNotification'
    | 'ExploreScreen'
    | 'CustomersList'
    | 'MetricsInnovationProduct'
    | 'SalesMyTeam'

export const refreshMyLeads = async (dispatch) => {
    try {
        const { data } = await restDataCommonCall(
            `query/?q=SELECT Id, ExternalId FROM Lead__x
         WHERE Owner_GPID_c__c='${CommonParam.GPID__c}' AND Status__c='Negotiate'`,
            'GET'
        )
        if (data.totalSize > 0) {
            const idsToChunk = []
            const externalIdsToChunk = []
            const records = data.records
            records.forEach((v) => {
                idsToChunk.push(v.Id)
                externalIdsToChunk.push(v.ExternalId)
            })
            const { ids, externalIds } = chunkIdsAndExternalIds(idsToChunk, externalIdsToChunk)
            const reqs = []
            externalIds.forEach((externalIdGroup) => {
                const externalIdSuffix = externalIdGroup.map((subExternalIds) => `'${subExternalIds}'`).join(',')
                reqs.push(
                    buildSyncDownObjPromise(
                        'Contact',
                        `SELECT ${getAllFieldsByObjName('Contact').join()} ` +
                            `FROM Contact WHERE Lead__c IN (${externalIdSuffix}) AND LastModifiedDate>${CommonParam.lastMyLeadsRefreshDate}`
                    )
                )
                reqs.push(
                    buildSyncDownObjPromise(
                        'Task',
                        `SELECT ${getAllFieldsByObjName('Task').join()} ` +
                            `FROM Task WHERE Lead__c IN (${externalIdSuffix}) AND LastModifiedDate>${CommonParam.lastMyLeadsRefreshDate}`
                    )
                )
                reqs.push(
                    buildSyncDownObjPromise(
                        'Customer_to_Route__c',
                        `SELECT ${getAllFieldsByObjName('Customer_to_Route__c').join()} ` +
                            `FROM Customer_to_Route__c WHERE Lead__c IN (${externalIdSuffix}) AND LastModifiedDate>${CommonParam.lastMyLeadsRefreshDate}`
                    )
                )
            })
            buildLeadReqs(reqs, ids)
            await promiseQueue(reqs)
            dispatch && dispatch(refreshKpiBarAction())
            const lastMyLeadsRefreshDate = moment().subtract(10, 'minute').toISOString()
            CommonParam.lastMyLeadsRefreshDate = lastMyLeadsRefreshDate
            await AsyncStorage.setItem('lastMyLeadsRefreshDate ', lastMyLeadsRefreshDate)
        }
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, 'refreshMyLeads', 'My leads refresh failed: ' + ErrorUtils.error2String(e))
    }
}

export const refreshAllLeads = async (dispatch: Dispatch<AnyAction>) => {
    const { data } = await checkLeadWiring()
    await AsyncStorage.setItem(
        'lead_wiring_check',
        JSON.stringify({
            date: moment().format(TIME_FORMAT.Y_MM_DD),
            wiring: data.leadWiring
        })
    )
    dispatch && dispatch(updatingLeadWiringAction(true))
    await clearLeadsGroup()
    const reqs = await genSyncDownLeadsGroupReqs()
    await promiseQueue(reqs)
    dispatch && dispatch(updatingLeadWiringAction(false))
    dispatch && dispatch(refreshKpiBarAction())
}

export const refreshCustomers = async () => {
    await fetchCustomerDetailScreenDataByConfig()
}

export const processRepRefresh = (
    position: RepPosition,
    dispatch: Dispatch<AnyAction>,
    isPullDown: boolean,
    syncObj: object
) => {
    return new Promise<CommonSyncRes>((resolve, reject) => {
        switch (position) {
            case 'MyLeadsList':
                refreshMyLeads(dispatch)
                    .then(() => {
                        resolve({ status: 'E0' })
                    })
                    .catch((error) => {
                        reject({
                            status: 'E1',
                            position: 'MyLeadsList',
                            error: ErrorUtils.error2String(error)
                        })
                    })
                break
            case 'OpenLeadsList':
                refreshAllLeads(dispatch)
                    .then(() => {
                        resolve({ status: 'E0' })
                    })
                    .catch((error) => {
                        reject({
                            status: 'E1',
                            position: 'OpenLeadsList',
                            error: ErrorUtils.error2String(error)
                        })
                    })
                break
            case 'CustomersList':
                !isPullDown && dispatch(startCustomerListLoading())
                refreshCustomers()
                    .then(() => {
                        !isPullDown && dispatch(stopCustomerListLoading())
                        resolve({ status: 'E0' })
                    })
                    .catch((error) => {
                        !isPullDown && dispatch(stopCustomerListLoading())
                        reject({
                            status: 'E1',
                            position: 'CustomersList',
                            error: ErrorUtils.error2String(error)
                        })
                    })
                break
            case 'LeadDetailScreen':
                break
            case 'CustomerDetailScreenTabSALES ACTIONS':
                {
                    Instrumentation.startTimer('PSR Pull Down Refresh Customer Detail Page')
                    const reqBody = []
                    reqBody.push(refreshInnovationProduct(syncObj.Id))
                    if (isPersonaPSR() || isPersonaKAM() || isPersonaUGMOrSDL()) {
                        reqBody.push(getPriorityIdsFromStorePriority(syncObj.Id))
                    }
                    Promise.all(reqBody)
                        .then(() => {
                            Instrumentation.stopTimer('PSR Pull Down Refresh Customer Detail Page')
                            resolve({ status: 'E0' })
                        })
                        .catch((error) => {
                            reject({
                                status: 'E1',
                                position: 'CustomerDetailScreenTabSALES ACTIONS',
                                error: ErrorUtils.error2String(error)
                            })
                        })
                }
                break
            case 'CustomerDetailScreenTabACTIVITIES':
                resolve({ status: 'E0' })
                break
            case 'CustomerDetailScreenTabEQUIPMENT':
                if (_.isEmpty(syncObj.AccountId)) {
                    reject({ status: 'E1', message: 'AccountId is empty' })
                } else {
                    retrieveEquipmentAssets(syncObj.AccountId)
                        .then(() => {
                            resolve({ status: 'E0' })
                        })
                        .catch((error) => {
                            reject({
                                status: 'E1',
                                position: 'CustomerDetailScreenTabEQUIPMENT',
                                error: ErrorUtils.error2String(error)
                            })
                        })
                }

                break
            case 'CustomerDetailScreenTabCONTACTS':
                retrieveInternalContact(syncObj.AccountId)
                    .then(() => {
                        resolve({ status: 'E0' })
                    })
                    .catch((error) => {
                        reject({
                            status: 'E1',
                            position: 'CustomerDetailScreenTabCONTACTS',
                            error: ErrorUtils.error2String(error)
                        })
                    })
                break
            case 'RepNotification':
                break
            case 'ExploreScreen':
                break
            case 'MetricsInnovationProduct':
                refreshMetricsInnovationProduct()
                    .then(() => {
                        resolve({ status: 'E0' })
                    })
                    .catch((error) => {
                        reject({
                            status: 'E1',
                            position: 'MetricsInnovationProduct',
                            error: ErrorUtils.error2String(error)
                        })
                    })
                break
            case 'SalesMyTeam':
                retrieveTeamMemberDetail()
                    .then(() => {
                        resolve({ status: 'E0' })
                    })
                    .catch((error) => {
                        reject({
                            status: 'E1',
                            position: 'SalesMyTeam',
                            error: ErrorUtils.error2String(error)
                        })
                    })
                break
            default:
                resolve({ status: 'E0' })
        }
    })
}

/**
 * @description Utils for the init sync
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 */
import { checkLeadWiring, syncDownBusinessSegmentPicklistItem } from './ApexApis'
import { buildSyncDownObjPromise, syncDownNotification, syncDownObj, syncUpObjCreateFromMem } from './SyncUtils'
import { CommonParam } from '../../common/CommonParam'
import { genSyncDownLeadsGroupReqs } from '../utils/LeadUtils'
import moment from 'moment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { formatString } from '../utils/CommonUtils'
import { getUserStats, retrieveFSRAndPSRUser } from '../utils/UserUtils'
import {
    getDAMAccessToken,
    getPriorityIdsFromStorePriority,
    initSyncInnovationProductData,
    clearTotalSalesDocuments
} from '../utils/InnovationProductUtils'
import { isPersonaCRMBusinessAdmin, isPersonaFSManager, judgePersona, Persona } from '../../common/enums/Persona'
import { fetchCustomerListScreenData } from '../utils/CustomerSyncUtils'
import { retrieveTeamMemberCustomers, retrieveTeamMemberDetail } from '../utils/FSManagerSyncUtils'

import { generateSurveyData } from '../utils/SurveyUtils'
import InStoreMapService from '../service/InStoreMapService'
import { buildSyncDownQuery, condRegExMap } from '../service/SyncService'
import { retrieveEquipmentRequest } from '../hooks/EquipmentHooks'
import { exeSyncDown } from '../utils/sync/SyncDispatchUtils'
import { Dispatch, SetStateAction } from 'react'
import { getAllFieldsByObjName } from '../utils/SyncUtils'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import SyncDownService from '../../orderade/service/SyncDownService'
import PriceService from '../../orderade/service/PriceService'
import RouteInfoService from '../../orderade/service/RouteInfoService'

/**
 * @description Execute an array of promise one by one.
 * @param list
 * @param setProgress
 */
export const promiseQueue = async (list, setProgress?) => {
    let index = 0
    const length = list.length
    const block = 1 / length
    while (index >= 0 && index < length) {
        await list[index]()
        setProgress && setProgress((progress) => progress + block)
        index++
    }
}
/**
 * @description init sync utils for the sales rep
 * @param setProgress
 */
export const initSyncForRep = async (setProgress?) => {
    const reqs = []
    const objs = CommonParam.objs
    const regExpMap = condRegExMap()
    objs.forEach((v) => {
        if (v.initQuery) {
            const soupName = v.soupName
            let initQuery = v.initQuery
            switch (soupName) {
                case 'Account':
                case 'Route_Sales_Geo__c':
                case 'Employee_To_Route__c':
                case 'User':
                case 'Segment_Hierarchy_Image_Mapping__mdt':
                    initQuery = formatString(initQuery, [CommonParam.userId, CommonParam.userRouteId])
                    break
                case 'Visit':
                case 'RetailStore':
                case 'Visit_List__c':
                case 'Event':
                    initQuery = buildSyncDownQuery(v.initQuery, regExpMap)
                    break
                default:
                    break
            }
            reqs.push(buildSyncDownObjPromise(soupName, initQuery))
        }
    })

    const allReqs = [
        ...reqs,
        ...(await genSyncDownLeadsGroupReqs()),
        async () => getUserStats(),
        async () => fetchCustomerListScreenData(),
        async () => syncDownBusinessSegmentPicklistItem(),
        async () => syncDownNotification(new Date().toISOString(), moment().subtract(90, 'day').toISOString()),
        async () => generateSurveyData(),
        async () => InStoreMapService.downloadImages()
    ]

    if (CommonParam.PERSONA__c === Persona.PSR) {
        allReqs.push(async () => getDAMAccessToken())
        allReqs.push(async () => initSyncInnovationProductData())
        allReqs.push(async () => clearTotalSalesDocuments())
        allReqs.push(async () => getPriorityIdsFromStorePriority())
        if (CommonParam.OrderingFeatureToggle) {
            allReqs.push(async () => SyncDownService.getExtraDataForMyDayScreen())
            allReqs.push(async () => PriceService.getTodayPlannedVisitPrice())
            allReqs.push(async () => RouteInfoService.syncMyDayRoutInfoData())
        }
    }

    if (isPersonaFSManager()) {
        allReqs.push(async () => await retrieveTeamMemberDetail())
        allReqs.push(async () => await retrieveTeamMemberCustomers())
    }

    if (isPersonaCRMBusinessAdmin()) {
        allReqs.push(async () => await retrieveFSRAndPSRUser())
    }

    const { data } = await checkLeadWiring()
    await AsyncStorage.setItem(
        'lead_wiring_check',
        JSON.stringify({
            date: moment().format(TIME_FORMAT.Y_MM_DD),
            wiring: data.leadWiring
        })
    )
    await promiseQueue(allReqs, setProgress)
}

export const initSyncForFsrAndFsm = async (setProgress?) => {
    const dateString = await AsyncStorage.getItem('configLastSyncTime')
    const newDateString = new Date().toISOString()
    const config =
        CommonParam.PERSONA__c === Persona.FSR
            ? CommonParam.syncConfig.FSR.syncArray
            : CommonParam.syncConfig.FSM.syncArray
    // const config = CommonParam.PERSONA__c === Persona.FSR ? SyncConfig.FSR.syncArray : SyncConfig.FSM.syncArray
    if (dateString) {
        await exeSyncDown(config, true, dateString, setProgress)
    } else {
        await exeSyncDown(config, false, '', setProgress)
    }
    await AsyncStorage.setItem('configLastSyncTime', newDateString)
    if (judgePersona([Persona.FSR, Persona.FS_MANAGER])) {
        await AsyncStorage.setItem('customerDetailScreenLastSyncTime', newDateString)
    }
}

export const initSyncForKAM = async (setProgress: Dispatch<SetStateAction<number>>) => {
    await clearTotalSalesDocuments()
    const allReqs = [
        async () => InStoreMapService.downloadImages(),
        async () => generateSurveyData(),
        async () => syncDownBusinessSegmentPicklistItem(),
        async () => getDAMAccessToken(),
        async () => await retrieveEquipmentRequest()
    ]
    await syncDownObj('RecordType', 'SELECT Id, Name, DeveloperName, SobjectType FROM RecordType')
    // sync down PepsiCo_Period_Calendar__mdt
    await syncDownObj(
        'PepsiCo_Period_Calendar__mdt',
        `SELECT ${getAllFieldsByObjName('PepsiCo_Period_Calendar__mdt').join()} ` + 'FROM PepsiCo_Period_Calendar__mdt'
    )
    await syncDownObj(
        'Mission_Id__mdt',
        `SELECT ${getAllFieldsByObjName('Mission_Id__mdt').join()} ` + 'FROM Mission_Id__mdt'
    )
    const userStats = await syncDownObj(
        'User_Stats__c',
        `SELECT Id FROM User_Stats__c WHERE User__c = '${CommonParam.userId}'`
    )
    if (userStats.data.length > 0) {
        await AsyncStorage.setItem('kam_user_stats_id', userStats.data[0].Id)
    } else {
        const res = await syncUpObjCreateFromMem('User_Stats__c', [
            {
                OwnerId: CommonParam.userId,
                User__c: CommonParam.userId
            }
        ])
        const id = res[0]?.data[0]?.Id
        await AsyncStorage.setItem('kam_user_stats_id', id)
    }
    await promiseQueue(allReqs, setProgress)
}

export const initSyncForCRM = async (setProgress?) => {
    const reqs = []
    const objs = CommonParam.objs
    objs.forEach((v) => {
        if (v.initQuery) {
            const soupName = v.soupName
            let initQuery = v.initQuery
            switch (soupName) {
                case 'Account':
                case 'Route_Sales_Geo__c':
                case 'Employee_To_Route__c':
                case 'User':
                case 'Segment_Hierarchy_Image_Mapping__mdt':
                    initQuery = formatString(initQuery, [CommonParam.userId])
                    break
                default:
                    break
            }
            reqs.push(buildSyncDownObjPromise(soupName, initQuery))
        }
    })

    const allReqs = [
        ...reqs,
        async () => await retrieveEquipmentRequest(),
        async () => await syncDownBusinessSegmentPicklistItem(),
        async () => await syncDownNotification(new Date().toISOString(), moment().subtract(90, 'day').toISOString()),
        async () => await generateSurveyData(),
        async () => await retrieveFSRAndPSRUser(),
        async () => InStoreMapService.downloadImages()
    ]

    const { data } = await checkLeadWiring()
    await AsyncStorage.setItem(
        'lead_wiring_check',
        JSON.stringify({
            date: moment().format(TIME_FORMAT.Y_MM_DD),
            wiring: data.leadWiring
        })
    )
    await promiseQueue(allReqs, setProgress)
}

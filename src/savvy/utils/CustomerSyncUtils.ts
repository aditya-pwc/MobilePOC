/*
 * @Description:
 * @LastEditors: Yi Li
 */
import { buildSyncDownObjPromise, syncDownObj, syncDownObjByIds, syncDownObjWithIds } from '../api/SyncUtils'
import _ from 'lodash'
import { getAllFieldsByObjName, getObjByName } from './SyncUtils'
import { promiseQueue } from '../api/InitSyncUtils'
import { formatString } from './CommonUtils'
import { CommonParam } from '../../common/CommonParam'
import { Persona } from '../../common/enums/Persona'
import moment from 'moment'
import { retrieveEquipmentRequest } from '../hooks/EquipmentHooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { SyncConfig } from '../config/SyncConfig'
import { exeSyncDown } from './sync/SyncDispatchUtils'
import { Log } from '../../common/enums/Log'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

export const retrieveRetailStoreRelatedObjs = async (retailStores) => {
    const retailStoreIds = _.chunk(
        retailStores.map((v) => v.Id),
        500
    )
    const reqs = []
    retailStoreIds.forEach((retailStoreIdGroup) => {
        const retailStoreIdSuffix = retailStoreIdGroup.map((subRetailStoreIds) => `'${subRetailStoreIds}'`).join(',')
        reqs.push(
            buildSyncDownObjPromise(
                'Order',
                `SELECT ${getAllFieldsByObjName('Order').join()} ` +
                    `FROM Order WHERE RetailStore__c IN (${retailStoreIdSuffix}) AND Order_ATC_Type__c = 'Normal'`
            )
        )
        reqs.push(
            buildSyncDownObjPromise(
                'Shipment',
                `SELECT ${getAllFieldsByObjName('Shipment').join()} ` +
                    `FROM Shipment WHERE Retail_Store__c IN (${retailStoreIdSuffix})`
            )
        )
        reqs.push(
            buildSyncDownObjPromise(
                'Visit',
                `SELECT ${getAllFieldsByObjName('Visit').join()} ` +
                    `FROM Visit WHERE PlaceId IN (${retailStoreIdSuffix}) AND PlannedVisitStartTime>${moment()
                        .add(-8, 'days')
                        .toISOString()} AND Status__c!='Removed' AND Status__c!='Planned' AND Status__c!='Pre-Processed' AND Status__c != 'Failed'`
            )
        )
        reqs.push(
            buildSyncDownObjPromise(
                'Task',
                `SELECT ${getAllFieldsByObjName('Task').join()} ` +
                    `FROM Task WHERE WhatId IN (${retailStoreIdSuffix}) AND RecordType.Name='Customer Activity'`
            )
        )
    })
    const accountIds = _.chunk(
        retailStores.map((v) => v.AccountId),
        500
    )
    accountIds.forEach((accountIdGroup) => {
        const accountIdSuffix = accountIdGroup.map((subAccountIds) => `'${subAccountIds}'`).join(',')
        reqs.push(
            buildSyncDownObjPromise(
                'Task',
                `SELECT ${getAllFieldsByObjName('Task').join()} ` +
                    `FROM Task WHERE WhatId IN (${accountIdSuffix}) AND RecordType.Name='Customer Activity'`
            )
        )
    })
    await promiseQueue(reqs)
}

export const retrieveRetailStoresAndRelatedKeyAccounts = async () => {
    const additionalCondition =
        CommonParam.PERSONA__c === Persona.KEY_ACCOUNT_MANAGER
            ? 'AND kam_active_flag__c = true AND If_Populated_By_KAM__c = true'
            : ''
    const { data } =
        CommonParam.PERSONA__c === Persona.PSR
            ? await syncDownObj(
                  'RetailStore',
                  formatString(
                      `SELECT ${getAllFieldsByObjName(
                          'RetailStore'
                      ).join()} FROM RetailStore WHERE AccountId IN (SELECT Customer__c FROM Customer_to_Route__c WHERE Route__c='%s' AND ACTV_FLG__c=true AND Merch_Flag__c=false AND RecordType.Name = 'CTR') AND Account.IS_ACTIVE__c=true`,
                      [CommonParam.userRouteId]
                  )
              )
            : await syncDownObj(
                  'RetailStore',
                  `SELECT ${getAllFieldsByObjName(
                      'RetailStore'
                  ).join()} FROM RetailStore WHERE AccountId IN (SELECT AccountId FROM AccountTeamMember WHERE UserId='${
                      CommonParam.userId
                  }'${additionalCondition}) AND Account.IS_ACTIVE__c=true`
              )
    const keyAccountDivisionIds = _.uniq(_.compact(data.map((v) => v.Account.ParentId)))
    const keyAccountDivisionData = await syncDownObjByIds(
        'Account',
        ['Id', 'Name', 'CUST_LVL__c', 'ParentId'],
        keyAccountDivisionIds as string[]
    )
    const keyAccountIds = _.uniq(_.compact(keyAccountDivisionData.map((v) => v.ParentId)))
    await syncDownObjByIds('Account', ['Id', 'Name', 'CUST_LVL__c', 'ParentId'], keyAccountIds)
    return data
}

export const deleteUselessSurveyPhoto = async () => {
    const deleteImg = []
    const tempPhotoByRequestId = await AsyncStorage.getItem('survey_photos_group')
    const tempEquipmentSurveyPhotosString = await AsyncStorage.getItem('equipment_survey_photos')
    const imgGroup = tempPhotoByRequestId ? JSON.parse(tempPhotoByRequestId) : {}
    const imgBase64 = tempEquipmentSurveyPhotosString ? JSON.parse(tempEquipmentSurveyPhotosString) : {}
    const imgGroupKeys = _.keys(imgGroup)
    if (imgGroupKeys.length > 0) {
        const data = await syncDownObjWithIds(
            'Request__c',
            ['Id'],
            imgGroupKeys,
            true,
            false,
            "(status__c = 'CLOSED' OR status__c = 'COMPLETED' OR status__c = 'CANCELED')",
            'Id'
        )
        for (const id in imgGroup) {
            data.forEach((item) => {
                if (item.Id === id) {
                    deleteImg.push(imgGroup[id])
                    delete imgGroup[id]
                }
            })
        }
        for (const img in imgBase64) {
            deleteImg.forEach((item) => {
                if (item === img) {
                    delete imgBase64[img]
                }
            })
        }
        await AsyncStorage.setItem('survey_photos_group', JSON.stringify(imgGroup))
        await AsyncStorage.setItem('equipment_survey_photos', JSON.stringify(imgBase64))
    }
}

export const fetchCustomerListScreenData = async () => {
    Instrumentation.startTimer(`${CommonParam.PERSONA__c} fetchCustomerListScreenData`)
    const data = await retrieveRetailStoresAndRelatedKeyAccounts()
    await retrieveRetailStoreRelatedObjs(data)
    if (CommonParam.PERSONA__c === Persona.PSR) {
        Instrumentation.startTimer('PSR Initial Sync - SF objects Request__c Asset_Attribute__c')
    }
    await retrieveEquipmentRequest()
    await deleteUselessSurveyPhoto()
    if (CommonParam.PERSONA__c === Persona.PSR) {
        Instrumentation.stopTimer('PSR Initial Sync - SF objects Request__c Asset_Attribute__c')
    }
    if (CommonParam.PERSONA__c === Persona.PSR) {
        await syncDownObj(
            'Account',
            formatString(getObjByName('Account').initQuery, [CommonParam.userId, CommonParam.userRouteId])
        )
    }
    Instrumentation.stopTimer(`${CommonParam.PERSONA__c} fetchCustomerListScreenData`)
}

export const fetchCustomerDetailScreenDataByConfig = async () => {
    try {
        const config = (() => {
            switch (CommonParam.PERSONA__c) {
                case Persona.FSR:
                    return SyncConfig.FSR.customerListScreenArray
                case Persona.PSR:
                    return SyncConfig.PSR.customerListScreenArray
                case Persona.FS_MANAGER:
                    return SyncConfig.FSM.customerListScreenArray
                default:
                    return SyncConfig.FSR.customerListScreenArray
            }
        })()

        const dateString = await AsyncStorage.getItem('customerDetailScreenLastSyncTime')
        const newDateString = new Date().toISOString()
        if (dateString) {
            await exeSyncDown(config, true, dateString)
        } else {
            await exeSyncDown(config, false, '')
        }
        await AsyncStorage.setItem('customerDetailScreenLastSyncTime', newDateString)
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, 'fetchCustomerDetailScreenDataByConfig', ErrorUtils.error2String(e))
    }
}

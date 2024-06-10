/*
 * @Description:
 * @Author: Shangmin Dou
 * @Date: 2021-11-25 20:22:11
 * @LastEditTime: 2024-01-17 16:27:13
 * @LastEditors: Tom tong.jiang@pwc.com
 */
import { oauth } from 'react-native-force'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonParam } from '../../common/CommonParam'
import {
    isPersonaCRMBusinessAdmin,
    isPersonaFSManager,
    isPersonaSDLOrPsrOrMDOrKAM,
    Persona
} from '../../common/enums/Persona'
import BreadcrumbsService from '../service/BreadcrumbsService'
import { clearCustomLabel } from '../i18n/Utils'
import { Log } from '../../common/enums/Log'
import { clearDatabase } from './InitUtils'
import BaseInstance from '../../common/BaseInstance'
import { UserAccount } from 'common-mobile-lib/@common-mobile-lib/sf-oauth-engine/src/Interface'
import SyncUpService from '../../orderade/service/SyncUpService'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Alert } from 'react-native'
import _ from 'lodash'
import { t } from '../../common/i18n/t'
import CommonService from '../../orderade/service/CommonService'

export const oauthSf = () => {
    return new Promise<any>((resolve, reject) => {
        oauth.authenticate(
            async (res) => {
                await AsyncStorage.setItem('clientInfo', JSON.stringify(res))
                CommonParam.user = res
                CommonParam.userId = res.userId
                CommonParam.accessToken = res.accessToken
                CommonParam.endpoint = res.instanceUrl
                if (
                    CommonParam.PERSONA__c !== Persona.FSR &&
                    CommonParam.PERSONA__c !== Persona.PSR &&
                    !isPersonaFSManager() &&
                    !isPersonaCRMBusinessAdmin()
                ) {
                    CommonParam.isFirstTimeUser = true
                    AsyncStorage.removeItem('clientInfo')
                    AsyncStorage.removeItem('user')
                    AsyncStorage.removeItem('isSyncSuccessfully')
                }
                if (CommonParam.PERSONA__c === Persona.MERCHANDISER) {
                    BreadcrumbsService.logout()
                }
                resolve(res)
            },
            (err) => {
                reject(err)
            }
        )
    })
}

export const oauthCallback = async (userAccount: UserAccount) => {
    BaseInstance.userAccount = userAccount
    await AsyncStorage.setItem('clientInfo', JSON.stringify(userAccount))
    await AsyncStorage.setItem('user_account', JSON.stringify(userAccount))
    CommonParam.user = userAccount
    CommonParam.userId = userAccount.userId
    CommonParam.accessToken = userAccount.accessToken
    CommonParam.endpoint = userAccount.instanceUrl
    if (
        CommonParam.PERSONA__c !== Persona.FSR &&
        CommonParam.PERSONA__c !== Persona.PSR &&
        !isPersonaFSManager() &&
        !isPersonaCRMBusinessAdmin()
    ) {
        CommonParam.isFirstTimeUser = true
        AsyncStorage.removeItem('clientInfo')
        AsyncStorage.removeItem('user')
        AsyncStorage.removeItem('isSyncSuccessfully')
    }
    if (CommonParam.PERSONA__c === Persona.MERCHANDISER) {
        BreadcrumbsService.logout()
    }
}

export const refreshTokenCallback = async (accessToken: string) => {
    const clientInfo = JSON.parse((await AsyncStorage.getItem('clientInfo')) as string)
    clientInfo.accessToken = accessToken
    CommonParam.accessToken = accessToken
    BaseInstance.userAccount = {
        ...BaseInstance.userAccount,
        accessToken
    }
    await AsyncStorage.multiSet([
        ['clientInfo', JSON.stringify(clientInfo)],
        ['user_account', JSON.stringify(BaseInstance.userAccount)]
    ])
}

export const logout = async (removeLocalDB = true) => {
    global.$globalModal.openModal()
    CommonParam.userId = null
    CommonParam.user = null
    CommonParam.lastModifiedDate = new Date('2021-01-01').toISOString()
    CommonParam.isFirstTimeUser = true
    if (removeLocalDB) {
        await clearDatabase()
    }
    if (await CommonService.isOrderadePSR()) {
        await SyncUpService.syncUpLocalData()
    }
    const itemsToRemove = [
        'clientInfo',
        'user',
        'locationConsent',
        'isSyncSuccessfully',
        'etrForPSR',
        'planogramPath',
        'PlanogramLocal',
        'configLastSyncTime',
        'lastSyncDependentIds',
        'user_account'
    ]
    Promise.all([
        clearCustomLabel(),
        AsyncStorage.multiRemove(itemsToRemove),
        AsyncStorage.setItem('lastModifiedDate', new Date().toISOString())
    ])
        .then(() => {
            global.$globalModal.closeModal()
            BaseInstance.sfOauthEngine.logout()
        })
        .catch(() => {
            global.$globalModal.closeModal()
        })
}

export const areContractSubmitted = async (title: string) => {
    if (!isPersonaSDLOrPsrOrMDOrKAM()) {
        return true
    }
    const json = await AsyncStorage.getItem('NewCDAPendingUploads')
    const jobs = await JSON.parse(json || '{}')
    if (!_.isEmpty(jobs)) {
        Alert.alert('', title)
        return false
    }
    return true
}

export const logoutWithClearingDatabase = async () => {
    const isSubmittedContractOK = await areContractSubmitted(t.labels.PBNA_MOBILE_CONTRACT_NOT_COMMIT_WHEN_LOGOUT)
    if (!isSubmittedContractOK) {
        return
    }

    global.$globalModal.openModal()
    CommonParam.userId = null
    CommonParam.user = null
    CommonParam.lastModifiedDate = new Date('2021-01-01').toISOString()
    CommonParam.isFirstTimeUser = true
    try {
        await clearDatabase(false, true)
        const itemsToRemove = [
            'clientInfo',
            'user',
            'isSyncSuccessfully',
            'PlanogramLocal',
            'configLastSyncTime',
            'lastSyncDependentIds',
            'user_account'
        ]
        await Promise.all([
            AsyncStorage.multiRemove(itemsToRemove),
            AsyncStorage.setItem('lastModifiedDate', new Date().toISOString())
        ])
        BaseInstance.sfOauthEngine.logout()
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, 'SessionUtils.logoutWithClearingDatabase', JSON.stringify(e))
    } finally {
        global.$global.closeModal()
    }
}

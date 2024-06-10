/*
 * @Description:
 * @Author: Shangmin Dou
 * @Date: 2021-11-20 01:59:23
 * @LastEditTime: 2023-12-15 09:23:40
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 */
import { DEFAULT_LOCALE, LOCALE_LIST } from '../../common/i18n/Config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { restApexCommonCall, syncDownObj } from '../api/SyncUtils'
import { Log } from '../../common/enums/Log'
import { CommonSyncRes } from '../../common/interface/SyncInterface'
import { t } from '../../common/i18n/t'
import { CommonParam } from '../../common/CommonParam'
import _ from 'lodash'
import moment from 'moment'
import { getStringValue } from '../utils/LandingUtils'
import { storeClassLog } from '../../common/utils/LogUtils'

const CUSTOM_LABEL = 'custom_label'
export const CURRENT_LANGUAGE = 'current_language'
const DEFAULT_LANGUAGE = 'English'

export const getCurrentLocale = () => {
    return LOCALE_LIST[DEFAULT_LOCALE]
}

export const clearCustomLabel = async () => {
    CommonParam.isFirstTimeUser = true
    await AsyncStorage.removeItem(CUSTOM_LABEL)
}

const handleLanguageLabels = (data: any) => {
    const labels = data.map((d) => {
        return {
            Name: d.Label_ID__c,
            English: d.English_Label__c ? d.English_Label__c : '',
            French: d.French_Label__c ? d.French_Label__c : ''
        }
    })
    return labels
}

const setMomentLocale = (language: string) => {
    let locale
    switch (language) {
        case 'English':
            locale = 'en'
            break
        case 'French':
            locale = 'fr'
            require('moment/locale/fr')
            break
        default:
            locale = 'en'
            break
    }
    moment.locale(locale, {
        week: {
            dow: 0 // Sunday is the fist day of the week
        }
    })
    CommonParam.locale = locale
}

export const getUserLanguage = async () => {
    let language = DEFAULT_LANGUAGE
    try {
        const localLanguage = await AsyncStorage.getItem(CURRENT_LANGUAGE)
        if (localLanguage) {
            language = localLanguage
        } else {
            const userLanguage = await syncDownObj(
                'User',
                `SELECT Id,Mobile_Language__c FROM User WHERE Id = '${CommonParam.userId}'`,
                false
            )
            language = userLanguage?.data[0]?.Mobile_Language__c || DEFAULT_LANGUAGE
        }
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, 'getUserLanguageSync', `fetch customLanguage failed: ${getStringValue(e)}`)
    }
    try {
        await AsyncStorage.setItem(CURRENT_LANGUAGE, language)
    } catch (err) {
        storeClassLog(Log.MOBILE_ERROR, 'getUserLanguage', `set localLanguage failed: ${getStringValue(err)}`)
    }
    return language
}

export const reGetUserLanguage = async () => {
    let language = DEFAULT_LANGUAGE
    try {
        const userLanguage = await syncDownObj(
            'User',
            `SELECT Id,Mobile_Language__c FROM User WHERE Id = '${CommonParam.userId}'`,
            false
        )
        language = userLanguage?.data[0]?.Mobile_Language__c || DEFAULT_LANGUAGE
        CommonParam.currentLanguage = language
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, 'reGetUserLanguage', `get localLanguage failed: ${getStringValue(e)}`)
    }
    try {
        await AsyncStorage.setItem(CURRENT_LANGUAGE, language)
    } catch (err) {
        storeClassLog(Log.MOBILE_ERROR, 'reGetUserLanguage', `set localLanguage failed: ${getStringValue(err)}`)
    }
    return language
}

export const getCustomLabel = (callBackend: boolean) => {
    return new Promise<CommonSyncRes>((resolve, reject) => {
        AsyncStorage.getItem(CUSTOM_LABEL, (err, data) => {
            getUserLanguage().then((selectedLanguage) => {
                setMomentLocale(selectedLanguage)
                if (!err && data) {
                    const labels = JSON.parse(data)
                    if (Array.isArray(labels) && labels.length > 0) {
                        labels.forEach((label) => {
                            t.labels[label.Name] = label[selectedLanguage] || ''
                        })
                        resolve({ status: 'E0', message: 'Load local labels' })
                    } else {
                        callBackend = true
                    }
                }
                if (callBackend) {
                    // restDataCommonCall(url, 'GET')
                    syncDownObj(
                        'Multi_Language__c',
                        'Select English_Label__c,French_Label__c,Label_ID__c FROM Multi_Language__c',
                        false
                    )
                        .then((res) => {
                            const records = res?.data || []
                            const labels = handleLanguageLabels(records)
                            labels.forEach((label) => {
                                t.labels[label.Name] = label[selectedLanguage]
                            })
                            AsyncStorage.setItem(CUSTOM_LABEL, JSON.stringify(labels))
                            AsyncStorage.setItem(CURRENT_LANGUAGE, selectedLanguage)
                            resolve({ status: 'E0', message: 'Load remote labels' })
                        })
                        .catch((er) => {
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'getCustomLabel',
                                `fetch customLabel failed: ${getStringValue(er)}`
                            )
                            reject({ status: 'E1', er })
                        })
                } else {
                    resolve({ status: 'E0', message: 'Load remote labels' })
                }
            })
        })
    })
}

export const getLanguageOptions = () => {
    return [
        {
            value: 'English',
            text: t.labels.PBNA_MOBILE_ENGLISH
        },
        {
            value: 'French',
            text: t.labels.PBNA_MOBILE_FRENCH
        }
    ]
}

export const getLanguageI18nText = (language) => {
    const languageItem = getLanguageOptions().find((item) => {
        return item.value === language
    })
    return languageItem.text
}

export const switchLanguage = async (language: string) => {
    const updateNotificationLanguage = (language) => {
        const body = {
            strUserId: CommonParam.userId,
            strLanguage: language
        }
        return new Promise<void>((resolve, reject) => {
            restApexCommonCall('doUserMobileLanguage', 'PATCH', body)
                .then(() => resolve())
                .catch((error) => reject(error))
        })
    }
    return new Promise<CommonSyncRes>((resolve, reject) => {
        updateNotificationLanguage(language)
            .then(() => {
                AsyncStorage.getItem(CUSTOM_LABEL, (error, data) => {
                    if (!error && data) {
                        const labels = JSON.parse(data)
                        if (!language || _.isEmpty(data)) {
                            storeClassLog(
                                Log.MOBILE_INFO,
                                'switchLanguage.updateNotificationLanguage',
                                `no language available: ${getStringValue(error)}`
                            )
                            reject({ status: 'E1', error })
                        } else {
                            labels.forEach((label) => {
                                t.labels[label.Name] = label[language]
                            })
                            setMomentLocale(language)
                            AsyncStorage.setItem(CURRENT_LANGUAGE, language)
                        }
                    } else {
                        reject({ status: 'E1', error })
                    }
                    resolve({ status: 'E0', message: 'Load remote labels' })
                })
            })
            .catch((error) => reject(error))
    })
}

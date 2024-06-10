import BaseInstance from '../../common/BaseInstance'
import _ from 'lodash'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Linking, Dimensions } from 'react-native'
import { DefaultNumber, DropDownType } from '../enum/Common'
import { CommonParam } from '../../common/CommonParam'
import DeviceInfo from 'react-native-device-info'
import { appendLog, storeClassLog } from '../../common/utils/LogUtils'
import { StatusCode } from 'common-mobile-lib/@common-mobile-lib/sf-http-client/src/StatusCode'
import { t } from '../../common/i18n/t'
import { getIdClause } from '../../common/utils/CommonUtils'
import { Log } from '../../common/enums/Log'
import { formatWithTimeZone, todayDateWithTimeZone } from '../../common/utils/TimeZoneUtils'
import moment from 'moment'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { SFRecord } from 'common-mobile-lib/@common-mobile-lib/sf-soup-engine/src/SfSoupInterface'
import CommonService from '../service/CommonService'
import SyncUpService from '../service/SyncUpService'

const isTablet = DeviceInfo.isTablet()

const dim = Dimensions.get('screen')
const isPortrait = dim.height >= dim.width
const MAX_BATCH_LIMIT = 500
const vsprintf = require('sprintf-js').vsprintf

export const formatString = (src: string, array: string[]) => {
    return vsprintf(src, array)
}

export const judgeInsertOrderSuccess = (res: any) => {
    return res.every(
        (v: any) => v.httpStatusCode === StatusCode.SuccessOK || v.httpStatusCode === StatusCode.SuccessCreated
    )
}

// the syncdown will fail with too many ids in query string
// because extra long query is passed using request url
export const batchSynDown = async (ids: Array<string | number>, options: any, getIdClauseOverride?: Function) => {
    if (ids.length === 0 || _.isEmpty(ids) || _.isEmpty(options.fields)) {
        return []
    }
    const idBatches = _.chunk(ids, options.batchLimit || MAX_BATCH_LIMIT)
    const _getIdClause = getIdClauseOverride || getIdClause
    return Promise.all(
        idBatches.map(async (idBatch) => {
            return await CommonService.syncDown({
                ...options,
                whereClause: options.whereClause.replace('{BatchIds}', `(${_getIdClause(idBatch)})`)
            })
        })
    )
}

export const logout = async (dropDownRef: any, skipLogout?: boolean) => {
    try {
        await SyncUpService.syncUpLocalData()
        await Promise.all([
            AsyncStorage.removeItem('isSyncSuccessfully'),
            AsyncStorage.setItem('lastModifiedDate', new Date().toISOString()),
            CommonService.emptyLocalSoup(!skipLogout)
        ])
        if (!skipLogout) {
            AsyncStorage.removeItem('clientInfo')
            AsyncStorage.removeItem('userRouteId')
            AsyncStorage.removeItem('user_account')
            BaseInstance.sfOauthEngine.logout()
        }
        const logMsg = `${CommonParam.GPID__c} logged out of Savvy at ${formatWithTimeZone(
            moment(),
            TIME_FORMAT.YMDTHMS,
            true,
            true
        )}`
        appendLog(Log.MOBILE_INFO, 'orderade:log out app', logMsg)
    } catch (err) {
        dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_INIT_SYNC_ERR, err)
    }
}

const checkPhone = (phone: string) => {
    return !(!phone || phone.length === 0)
}

export const callByPhone = (phone: string) => {
    if (!checkPhone(phone)) {
        return
    }
    Linking.openURL('tel://' + phone)
}
export const openUrl = (url: string): Promise<any> => {
    return Linking.openURL(url)
}
export const openSmsUrl = (phone: string): Promise<any> => {
    return openUrl(`sms://${phone}`)
}

export const getRound = (number: string | number, nullValue = '-') => {
    if (!number || !Number(number)) {
        return nullValue
    }
    return Math.round(Number(number)).toString()
}

export const Utils = {
    isTablet,
    isPortrait
}

export const getPortraitModeScreenWidthAndHeight = () => {
    let width
    let height
    const windowWidth = Dimensions.get('window').width
    const windowHeight = Dimensions.get('window').height
    if (windowHeight < windowWidth) {
        width = windowHeight
        height = windowWidth
    } else {
        width = windowWidth
        height = windowHeight
    }
    return {
        width,
        height
    }
}

export const getObjByName = (objName: string) => {
    return CommonParam.objs.find((obj: any) => {
        return obj.name === objName
    })
}

export const compareDateToToday = (date: string) => {
    const today = moment(todayDateWithTimeZone(true))
    const compareDate = moment(date, TIME_FORMAT.Y_MM_DD)
    return compareDate.diff(today, 'days')
}

export const ellipsisWithMaxSize = (text: string, maxSize: number) => {
    if (text.includes('.')) {
        if (text.length > maxSize + 2) {
            return text.substring(0, maxSize) + '...'
        }
    } else {
        if (text.length > maxSize) {
            return text.substring(0, maxSize) + '...'
        }
    }
    return text
}

export const formatPrice000 = (input: number) => {
    if (isNaN(input)) {
        return DefaultNumber.stringZero000
    }
    return input.toFixed(2)
}

export const getValidFieldData = (Data: Array<any>, FieldName: string) => {
    return _.uniq(Data.map((record) => `${record[FieldName]}`).filter((Id) => Id !== null && Id !== 'null'))
}

export interface SyncDownCSVParams {
    objName: string
    linkQuery: string
    logInfo: string
    mapFunc: Function
    withId?: boolean
}

export const syncDownCSV = async (params: SyncDownCSVParams): Promise<Array<SFRecord>> => {
    const { objName, linkQuery, logInfo, mapFunc, withId } = params
    try {
        const contentVersionIds = await CommonService.syncDown({
            name: 'ContentDocumentLink',
            whereClause: linkQuery,
            updateLocalSoup: false,
            fields: ['ContentDocument.LatestPublishedVersionId'],
            allOrNone: true
        })
        if (!contentVersionIds.length) {
            storeClassLog(Log.MOBILE_WARN, `Orderade: sync down ${objName} CSV`, `No file found for ${logInfo}`)
            return []
        }
        const fields = CommonService.getFieldsWithParams(objName)
        const fieldsNeedBooleanTranslate = fields.filter((field) => field.type === 'boolean').map((field) => field.name)
        const records = await Promise.all(
            contentVersionIds.map((el) => {
                const id = el.ContentDocument.LatestPublishedVersionId
                return new Promise((resolve, reject) => {
                    CommonService.restDataCommonCall(
                        `sobjects/ContentVersion/${id}/VersionData`,
                        'GET',
                        {},
                        {
                            responseType: 'text'
                        }
                    )
                        .then((res) => {
                            if (res?.data?.length) {
                                return (
                                    res.data
                                        .split('\n')
                                        // skip csv header line
                                        .slice(1)
                                        // last line is empty
                                        .filter((line: string) => !!line)
                                        .map(mapFunc)
                                        .map((record: SFRecord) => {
                                            fieldsNeedBooleanTranslate.forEach((field) => {
                                                record[field] = record[field] === 'true'
                                            })
                                            return record
                                        })
                                )
                            }
                            return []
                        })
                        .then((records) => {
                            if (withId) {
                                return CommonService.upsertDataIntoSoupWithExternalId(objName, records)
                            }
                            return CommonService.upsertDataIntoSoup(objName, records)
                        })
                        .then((data) => {
                            resolve(data)
                        })
                        .catch((e) => {
                            reject(e)
                        })
                })
            })
        )
        return records.flat() as Array<SFRecord>
    } catch (e) {
        storeClassLog(
            Log.MOBILE_ERROR,
            `Orderade: sync down ${objName} CSV`,
            `Sync down failed for ${logInfo} ${ErrorUtils.error2String(e)}`
        )
        return []
    }
}

export const formatPhoneNumber = (phone: string) => {
    const ONE_PLUS_PHONE_NUM_LENGTH = 11
    const WANTED_PHONE_NUM_LENGTH = 10
    const MAX_PHONE_NUM_LENGTH = 30
    if (phone) {
        if (phone.length >= MAX_PHONE_NUM_LENGTH) {
            return phone.substring(0, MAX_PHONE_NUM_LENGTH) + '...'
        }
        let phoneNum = phone
            .replace(/\+/g, '')
            .replace(/-/g, '')
            .replace(/\(/g, '')
            .replace(/\)/g, '')
            .replace(/\s/g, '')
        if (phoneNum.length === ONE_PLUS_PHONE_NUM_LENGTH) {
            phoneNum = phoneNum.substring(1, phoneNum.length)
        }
        if (phoneNum.length === WANTED_PHONE_NUM_LENGTH) {
            return (
                '(' +
                phoneNum.substring(0, 3) +
                ') ' +
                phoneNum.substring(3, 6) +
                ' ' +
                phoneNum.substring(6, phoneNum.length)
            )
        }
        return phone
    }
    return ''
}

import { BreadcrumbVisibility, Instrumentation } from '@appdynamics/react-native-agent'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import moment from 'moment'
import DeviceInfo from 'react-native-device-info'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import BaseInstance from '../BaseInstance'
import { CommonParam } from '../CommonParam'
import { Log } from '../enums/Log'
import { getISO8601StringWithoutTimezone } from './DateUtils'
import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo'
import { formatByGMT, formatWithTimeZone } from './TimeZoneUtils'
import { compositeCommonCall } from '../../savvy/api/SyncUtils'
import { BCDAccessType } from '../../orderade/enum/Common'
import { zip } from 'react-native-zip-archive'
import StatusCode from 'common-mobile-lib/@common-mobile-lib/sf-http-client/src/StatusCode'
import { Persona } from '../enums/Persona'

const RNFS = require('react-native-fs')

export const syncUpLogs = async () => {
    try {
        await BaseInstance.sfSyncEngine.syncUp({
            name: 'SDF_LGR_Log__c',
            type: 'POST',
            queryLatestData: false,
            localQuery:
                'SELECT {SDF_LGR_Log__c:Message__c},{SDF_LGR_Log__c:Level__c},' +
                '{SDF_LGR_Log__c:Data__c},{SDF_LGR_Log__c:Class__c},{SDF_LGR_Log__c:Reference__c} ' +
                'FROM {SDF_LGR_Log__c} LIMIT 199',
            localFields: ['Message__c', 'Level__c', 'Data__c', 'Class__c', 'Reference__c']
        })
        await BaseInstance.sfSoupEngine.clearDataSoup('SDF_LGR_Log__c')
    } catch (e) {}
}

export const appendLog = async (level: string, className: string, message: any, referenceId = '', params = {}) => {
    // only execute this method for PSR, fix bug:12120811
    if (CommonParam.PERSONA__c === Persona.PSR) {
        const logToStore = {
            Level__c: level,
            Message__c: JSON.stringify(ErrorUtils.error2String(message).slice(0, 1200)),
            Reference__c: referenceId || formatWithTimeZone(moment(), TIME_FORMAT.YMDTHMS, true, true),
            Class__c: className || '',
            Params: JSON.stringify(params),
            TimeStamp: formatWithTimeZone(moment(), TIME_FORMAT.YMDTHMS, true, true)
        }
        try {
            await BaseInstance.sfSoupEngine.upsert('LogItem', [logToStore])
        } catch (e) {}
    }
}

const getErrorCode = (messageErr: string, flagString: string) => {
    let errCode = ''
    const codeIndex = messageErr.indexOf(flagString)
    if (codeIndex > -1) {
        errCode = messageErr.substring(codeIndex + flagString.length, codeIndex + 3 + flagString.length)
    }
    return errCode
}
export const belongToMobileInfo = (message: string, level: Log) => {
    const messageStr = ErrorUtils.error2String(message).slice(0, 1200)
    let levelRes = level
    const messageArr = [
        'no internet',
        'The network connection was lost',
        'Network Error',
        'Unable to retrieve location due to a network failure',
        '502 Bad Gateway'
    ]
    for (const messageItem of messageArr) {
        if (messageStr.indexOf(messageItem) > -1) {
            levelRes = Log.MOBILE_INFO
        }
    }
    const netWorkIssue =
        messageStr.indexOf('404') > -1 &&
        (messageStr.indexOf('NOT_FOUND') > -1 || messageStr.indexOf('EMPTY_DATA') > -1)
    const regex = /^5\d{2}$/
    if (
        netWorkIssue ||
        regex.test(getErrorCode(messageStr, `"errorCode":"`)) ||
        regex.test(getErrorCode(messageStr, `"error_code":"`))
    ) {
        levelRes = Log.MOBILE_INFO
    }
    return levelRes
}

/**
 * @deprecated use `storeClassLog` instead
 */
export const storeLog = async (level: Log, message: any, params = {}) => {
    const levelRes = belongToMobileInfo(message, level)
    const logToStore = {
        Level__c: levelRes,
        Message__c: ErrorUtils.error2String(message).slice(0, 1200),
        Reference__c: getISO8601StringWithoutTimezone(),
        ...params
    }
    try {
        await BaseInstance.sfSoupEngine.upsert('SDF_LGR_Log__c', [logToStore])
        appendLog(level, (params as any).Class__c, message, logToStore.Reference__c, params)
    } catch (e) {}
}

export const storeClassLog = async (level: Log, className: string, message: any, params = {}) => {
    const levelRes = belongToMobileInfo(message, level)
    const logToStore = {
        Level__c: levelRes,
        Message__c: ErrorUtils.error2String(message).slice(0, 1200),
        Reference__c: getISO8601StringWithoutTimezone(),
        Class__c: className,
        ...params
    }
    try {
        await BaseInstance.sfSoupEngine.upsert('SDF_LGR_Log__c', [logToStore])
        appendLog(level, className, message, logToStore.Reference__c, params)
    } catch (e) {}
}

export const deleteLocalLogsExceed48Hours = async () => {
    const twoDaysAgo = formatWithTimeZone(moment().subtract(2, 'days'), TIME_FORMAT.YMDTHMS, true, true)
    const toDeleteLogs = await BaseInstance.sfSoupEngine
        .dynamicRetrieve('LogItem')
        .select(['_soupEntryId'])
        .where([
            {
                leftTable: 'LogItem',
                leftField: 'TimeStamp',
                operator: '<',
                rightField: `'${twoDaysAgo}'`
            }
        ])
        .getData()
    const toDeleteLogIds = toDeleteLogs.map((log: any) => log._soupEntryId)
    try {
        await BaseInstance.sfSoupEngine.removeRecords('LogItem', toDeleteLogIds)
    } catch (e) {}
}

export const retrieveLocalLog = async () => {
    try {
        const twoDaysAgo = formatWithTimeZone(moment().subtract(2, 'days'), TIME_FORMAT.YMDTHMS, true, true)
        const result = await BaseInstance.sfSoupEngine
            .dynamicRetrieve('LogItem')
            .select(['Message__c', 'Level__c', 'Class__c', 'TimeStamp', '_soupEntryId'])
            .where([
                {
                    leftTable: 'LogItem',
                    leftField: 'TimeStamp',
                    operator: '>=',
                    rightField: `'${twoDaysAgo}'`
                }
            ])
            .getData()
        const logs = result.map((item) => {
            return {
                Level__c: item.Level__c,
                Class__c: item.Class__c,
                TimeStamp: item.TimeStamp,
                Message__c: item.Message__c
            }
        })
        return logs
    } catch (e) {
        return null
    }
}

const buildDataToWrite = (logs: any, timeStamp: string) => {
    let toWriteString = ''
    if (logs && logs.length > 0) {
        // build user related information
        const userInfo = {
            UserID: CommonParam.userName,
            GPID: `${CommonParam.GPID__c}`,
            Location: `${CommonParam.userLocationId}-${CommonParam.userLocationName}`,
            Route: CommonParam.userRouteGTMUId,
            PhoneNumber: `${CommonParam.MobilePhone}`,
            Email: CommonParam.UserEmail,
            TimeStamp: timeStamp
        }
        const userHeader = Object.keys(userInfo)
        const userValues = Object.values(userInfo)
        userHeader.forEach((key, index) => {
            toWriteString = `${toWriteString}${key}:${userValues[index]}\n`
        })
        toWriteString = toWriteString + '\n'
        // build table head
        const headers = Object.keys(logs[0])
        const csvHeaders = `${headers.join('|')}\n`
        // build table body
        const csvBody = logs
            .map((log: any) => {
                return headers
                    .map((header) => {
                        return log[header]
                    })
                    .join('|')
            })
            .join('\n')
        toWriteString = `sep=|\n${toWriteString}${csvHeaders}${csvBody}`
    }
    return toWriteString
}

export const sendLogs = async () => {
    // create log directory of current user
    const logDir = `${RNFS.DocumentDirectoryPath}/${CommonParam.GPID__c}`
    await RNFS.mkdir(logDir)
    const logs = await retrieveLocalLog()
    if (!logs || logs.length === 0) {
        return
    }
    const currentTime = formatWithTimeZone(moment(), TIME_FORMAT.YMDTHMS, true, true)
    const fileTimeStamp = formatWithTimeZone(moment(), TIME_FORMAT.YYMMDDTHHMMSS, true, false)
    const fileName = `${CommonParam.GPID__c}_${fileTimeStamp}.csv`
    const zipFileName = `${logDir}/${CommonParam.GPID__c}_${fileTimeStamp}.zip`
    const path = `${logDir}/${fileName}`
    const dataToWrite = buildDataToWrite(logs, currentTime)
    if (!dataToWrite) {
        return
    }
    let base64String = ''
    try {
        await RNFS.writeFile(path, dataToWrite, 'utf8')
        const targetPath = zipFileName
        const zipPath = await zip(logDir, targetPath)
        base64String = await RNFS.readFile(zipPath, 'base64')
    } catch (e) {
        return
    }

    const configInfo = await BaseInstance.sfHttpClient.callData(
        `query/?q=SELECT Value__c FROM Application_Configuration__mdt WHERE DeveloperName = '${BCDAccessType.PBNALogDevelopmentName}'`,
        'GET'
    )

    const externalDocumentInfo1 = (configInfo.data.records[0] && configInfo.data.records[0].Value__c) || ''

    const title = `${CommonParam.GPID__c}-${fileTimeStamp}`
    const contentVersionBody = {
        method: 'POST',
        url: `/services/data/${CommonParam.apiVersion}/sobjects/ContentVersion`,
        referenceId: 'refContentVersion',
        body: {
            Title: title,
            PathOnClient: `${title}.zip`,
            VersionData: base64String,
            FirstPublishLocationId: CommonParam.userId,
            ExternalDocumentInfo1: externalDocumentInfo1,
            ExternalDocumentInfo2: `${CommonParam.userLocationId};${CommonParam.userLocationName};${CommonParam.userRouteGTMUId};${currentTime}`
        }
    }

    const res = await compositeCommonCall([contentVersionBody])
    // delete log file if upload to salesforce successfully
    const responseStatus = res.data.compositeResponse[0].httpStatusCode
    if (responseStatus === StatusCode.SuccessOK || responseStatus === StatusCode.SuccessCreated) {
        try {
            const files = await RNFS.readDir(logDir)
            files.forEach((file: any) => {
                if (!file.isDirectory()) {
                    RNFS.unlink(file.path)
                }
            })
        } catch (e) {}
    }
}

export const addADLog = (message: string) => {
    try {
        const time = moment().format('YYYY-MM-DDTHH:mm:ss.SSSS Z')
        Instrumentation.leaveBreadcrumb(message + time, BreadcrumbVisibility.CRASHES_AND_SESSIONS)
    } catch (err) {}
}

export const fetchLogInfo = async () => {
    let agent = ''
    let deviceName = ''
    let netInfo = ''
    let netInfoType: NetInfoStateType = NetInfoStateType.other
    try {
        agent = await DeviceInfo.getUserAgent()
        deviceName = await DeviceInfo.getDeviceName()
        const netWork = await NetInfo.fetch()
        netInfoType = netWork.type
        netInfo = netWork.type
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'LOGIN - ' + CommonParam.userId,
            ErrorUtils.error2String(error) + ErrorUtils.error2String(netInfoType)
        )
    }

    return {
        user: {
            id: CommonParam.userId,
            gpid: CommonParam.GPID__c,
            countryCode: CommonParam.CountryCode,
            userTimeZone: CommonParam.userTimeZone,
            name: CommonParam.userName,
            persona: CommonParam.PERSONA__c,
            locationId: CommonParam.userLocationId
        },
        login: {
            loginTimeInGMT: formatByGMT(moment(), TIME_FORMAT.DMMMYYYYHHMMSS),
            loginTimeInPhone: formatWithTimeZone(moment(), TIME_FORMAT.DMMMYYYYHHMMSS, false, true)
        },
        app: {
            version: DeviceInfo.getVersion(),
            buildNumber: DeviceInfo.getBuildNumber(),
            bundleID: DeviceInfo.getBundleId(),
            endpoint: CommonParam.endpoint,
            apiVersion: CommonParam.apiVersion
        },
        device: {
            uniqueId: DeviceInfo.getUniqueId(),
            deviceId: DeviceInfo.getDeviceId(),
            deviceName: deviceName,
            iOSVersion: `${DeviceInfo.getSystemName()} ${DeviceInfo.getSystemVersion()}`,
            agent,
            netInfo
        }
    }
}

export const recordLogWhenLogin = async () => {
    const info = await fetchLogInfo()
    // Use sql like this to query login logs
    // SELECT Id, Level__c, Message__c, Class__c, CreatedDate FROM SDF_LGR_Log__c  WHERE Class__c like 'LOGIN%' order by CreatedDate desc
    storeClassLog(Log.MOBILE_INFO, 'LOGIN - ' + CommonParam.userId, ErrorUtils.error2String(info))
}

import _ from 'lodash'
import { compositeCommonCall } from '../api/SyncUtils'
import { CommonParam } from '../../common/CommonParam'
import { Log } from '../../common/enums/Log'
import { getISO8601StringWithoutTimezone } from '../../common/utils/DateUtils'
import { getStringValue } from './LandingUtils'
import BaseInstance from '../../common/BaseInstance'

const Buffer = require('buffer').Buffer

export const fetchContentVersion = (contentVersionId: string) => {
    return new Promise((resolve, reject) => {
        BaseInstance.sfHttpClient
            .callData(
                `sobjects/ContentVersion/${contentVersionId}/VersionData`,
                'GET',
                {},
                {
                    responseType: 'blob'
                }
            )
            .then((response) => {
                const reader = new window.FileReader()
                reader.readAsDataURL(response.data)
                reader.onload = function () {
                    const imageDataUrl = reader.result
                    resolve(imageDataUrl)
                }
                reader.onerror = function () {
                    reject(reader.error)
                }
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const fetchLogContentVersion = (logString = {}) => {
    if (!_.isEmpty(logString)) {
        const sdfLog = {
            method: 'POST',
            url: `/services/data/${CommonParam.apiVersion}/sobjects/SDF_LGR_Log__c`,
            referenceId: 'refSdfLog',
            body: {
                Level__c: Log.NATIVE_LOG,
                Message__c: getStringValue('Native Log'),
                Reference__c: getISO8601StringWithoutTimezone()
            }
        }
        const logBody = {
            method: 'POST',
            url: `/services/data/${CommonParam.apiVersion}/sobjects/ContentVersion`,
            referenceId: 'refContentVersion',
            body: {
                Title: `${CommonParam.userId} - ${getISO8601StringWithoutTimezone()}`,
                PathOnClient: `${CommonParam.userId}_${getISO8601StringWithoutTimezone()}.json`,
                VersionData: Buffer.from(JSON.stringify(logString)).toString('base64'),
                FirstPublishLocationId: '@{refSdfLog.id}'
            }
        }
        compositeCommonCall([sdfLog, logBody])
    }
}

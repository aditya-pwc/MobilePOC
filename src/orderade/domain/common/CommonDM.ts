import { FieldMode } from 'common-mobile-lib/@common-mobile-lib/sf-soup-engine/src/SfSoupInterface'
import { RecordType } from '../../interface/RecordTypeModel'
import CommonData from './CommonData'
import _ from 'lodash'
import CommonSync from './CommonSync'
import { SyncDownConfig } from 'common-mobile-lib/@common-mobile-lib/sf-sync-engine/src/Interface'
import { RestMethod } from 'common-mobile-lib/@common-mobile-lib/sf-http-client/src/Interface'
import { AxiosRequestConfig } from 'axios'

class CommonDM {
    public static async getRecordTypeIdByRecordTypeName(recordTypeName: string) {
        const recordTypes: Partial<RecordType>[] = await CommonData.getRecordTypeIdByRecordTypeName(recordTypeName)
        if (_.isEmpty(recordTypes)) {
            return ''
        }
        return recordTypes[0].Id || ''
    }

    public static getAllFieldsByObjName(objName: string = '', type?: FieldMode | undefined) {
        return CommonData.getAllFieldsByObjName(objName, type)
    }

    public static getAllModelsFromSoup() {
        return CommonData.getAllModelsFromSoup()
    }

    public static async removeStoreNameFromSoup(storeName: string) {
        return await CommonData.removeStoreNameFromSoup(storeName)
    }

    public static async upsertDataIntoSoupWithExternalId(
        soupName: string,
        records: any,
        setAttr = true,
        fromSync?: boolean
    ) {
        return await CommonData.upsertDataIntoSoupWithExternalId(soupName, records, setAttr, fromSync)
    }

    public static async syncDown(config: SyncDownConfig) {
        return await CommonSync.syncDown(config)
    }

    public static getFieldsWithParams(soupName: any) {
        return CommonData.getFieldsWithParams(soupName)
    }

    public static async upsertDataIntoSoup(
        soupName: string,
        records: any,
        setAttr = true,
        fromSync?: boolean,
        withFullData = false,
        executor?: (records: any) => void
    ) {
        return await CommonData.upsertDataIntoSoup(soupName, records, setAttr, fromSync, withFullData, executor)
    }

    public static restDataCommonCall(path: string, method: RestMethod, body?: object, config?: AxiosRequestConfig) {
        return CommonSync.restDataCommonCall(path, method, body, config)
    }

    public static async moveCursorToNextPage(cursor: any, soupName: string) {
        return await CommonData.moveCursorToNextPage(cursor, soupName)
    }

    public static buildOriginQueryResults(
        soupName: string,
        currentPageOrderedEntries: Array<any>,
        fields: Array<string>
    ) {
        return CommonData.buildOriginQueryResults(soupName, currentPageOrderedEntries, fields)
    }

    public static async closePaginationCursor(cursor: any) {
        return await CommonData.closePaginationCursor(cursor)
    }
}

export default CommonDM

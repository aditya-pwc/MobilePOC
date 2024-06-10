import { FieldMode } from 'common-mobile-lib/@common-mobile-lib/sf-soup-engine/src/SfSoupInterface'
import BaseInstance from '../../../common/BaseInstance'
import { Log } from '../../../common/enums/Log'
import { storeClassLog } from '../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

class CommonData {
    public static async getRecordTypeIdByRecordTypeName(recordTypeName: string) {
        try {
            return await BaseInstance.sfSoupEngine
                .dynamicRetrieve('RecordType')
                .select(['Id', 'Name'])
                .where([
                    {
                        leftField: 'Name',
                        operator: '=',
                        rightField: `'${recordTypeName}'`
                    }
                ])
                .getData(false)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getRecordTypeIdByRecordTypeName',
                `getRecordTypeIdByRecordTypeName failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static getAllFieldsByObjName(objName: string = '', type?: FieldMode | undefined) {
        try {
            return BaseInstance.sfSoupEngine.getSoupFieldList(objName, type)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getAllFieldsByObjName',
                `getAllFieldsByObjName failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static getAllModelsFromSoup() {
        try {
            return BaseInstance.sfSoupEngine.getAllModels()
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getAllModelsFromSoup',
                `getAllModelsFromSoup failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async removeStoreNameFromSoup(storeName: string) {
        try {
            return await BaseInstance.sfSoupEngine.remove(storeName)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: removeStoreNameFromSoup',
                `removeStoreNameFromSoup failed: ${ErrorUtils.error2String(err)}`
            )
        }
    }

    public static async upsertDataIntoSoupWithExternalId(
        soupName: string,
        records: any,
        setAttr = true,
        fromSync?: boolean
    ) {
        try {
            return await BaseInstance.sfSoupEngine.upsertWithExternalId(soupName, records, setAttr, fromSync)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: upsertDataIntoSoupWithExternalId',
                `upsertDataIntoSoupWithExternalId failed: ${ErrorUtils.error2String(err)}`
            )
        }
    }

    public static getFieldsWithParams(soupName: any) {
        try {
            return BaseInstance.sfSoupEngine.getFieldsWithParams(soupName)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getFieldsWithParams',
                `getFieldsWithParams failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async upsertDataIntoSoup(
        soupName: string,
        records: any,
        setAttr = true,
        fromSync?: boolean,
        withFullData = false,
        executor?: (records: any) => void
    ) {
        try {
            return await BaseInstance.sfSoupEngine.upsert(soupName, records, setAttr, fromSync, withFullData, executor)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: upsertDataIntoSoup',
                `upsertDataIntoSoup failed: ${ErrorUtils.error2String(err)}`
            )
        }
    }

    public static async moveCursorToNextPage(cursor: any, soupName: string) {
        try {
            return await BaseInstance.sfSoupEngine.moveCursorToNextPage(cursor)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: useRecordPagination',
                `Failed to moveCursorToNextPage for ${soupName}, error: ${ErrorUtils.error2String(err)}`
            )
        }
    }

    public static buildOriginQueryResults(
        soupName: string,
        currentPageOrderedEntries: Array<any>,
        fields: Array<string>
    ) {
        try {
            return BaseInstance.sfSoupEngine.buildOriginQueryResults(soupName, currentPageOrderedEntries, fields)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: buildOriginQueryResults',
                `buildOriginQueryResults failed: ${ErrorUtils.error2String(err)}`
            )
            return []
        }
    }

    public static async closePaginationCursor(cursor: any) {
        try {
            return await BaseInstance.sfSoupEngine.closeCursor(cursor)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: closePaginationCursor',
                `closePaginationCursor failed: ${ErrorUtils.error2String(err)}`
            )
        }
    }
}
export default CommonData

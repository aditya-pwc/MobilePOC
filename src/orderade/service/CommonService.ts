import { FieldMode } from 'common-mobile-lib/@common-mobile-lib/sf-soup-engine/src/SfSoupInterface'
import CommonDM from '../domain/common/CommonDM'
import _ from 'lodash'
import { SyncDownConfig } from 'common-mobile-lib/@common-mobile-lib/sf-sync-engine/src/Interface'
import { RestMethod } from 'common-mobile-lib/@common-mobile-lib/sf-http-client/src/Interface'
import { AxiosRequestConfig } from 'axios'
import UserDM from '../domain/user/UserDM'
import { MoveCursorToNextInput } from '../interface/RecordsPagination'
import NetInfo from '@react-native-community/netinfo'
import { CommonParam } from '../../common/CommonParam'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BooleanStr } from '../enum/Common'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { FeatureToggle } from '../../common/enums/FeatureToggleName'

class CommonService {
    public static getAllFieldsByObjName(objName: string = '', type?: FieldMode | undefined) {
        return CommonDM.getAllFieldsByObjName(objName, type)
    }

    public static async emptyLocalSoup(isNeedToClearAllData = true) {
        const req: any = []
        const skipArray = ['CartDetail', 'CartItem', 'Order', 'OrderItem', 'LogItem']
        const stores = CommonDM.getAllModelsFromSoup()
        if (Array.isArray(stores) && !_.isEmpty(stores)) {
            stores.forEach((storeName) => {
                if (!isNeedToClearAllData) {
                    if (!skipArray.includes(`${storeName}`)) {
                        req.push(CommonDM.removeStoreNameFromSoup(storeName))
                    }
                } else {
                    if (storeName !== 'LogItem') {
                        req.push(CommonDM.removeStoreNameFromSoup(storeName))
                    }
                }
            })
        }
        await Promise.all(req)
    }

    public static async upsertDataIntoSoupWithExternalId(
        soupName: string,
        records: any,
        setAttr = true,
        fromSync?: boolean
    ) {
        return await CommonDM.upsertDataIntoSoupWithExternalId(soupName, records, setAttr, fromSync)
    }

    public static async syncDown(config: SyncDownConfig) {
        return await CommonDM.syncDown(config)
    }

    public static async isOrderadePSR() {
        return await UserDM.isOrderadePSR()
    }

    public static getFieldsWithParams(soupName: any) {
        return CommonDM.getFieldsWithParams(soupName)
    }

    public static async upsertDataIntoSoup(
        soupName: string,
        records: any,
        setAttr = true,
        fromSync?: boolean,
        withFullData = false,
        executor?: (records: any) => void
    ) {
        return await CommonDM.upsertDataIntoSoup(soupName, records, setAttr, fromSync, withFullData, executor)
    }

    public static restDataCommonCall(path: string, method: RestMethod, body?: object, config?: AxiosRequestConfig) {
        return CommonDM.restDataCommonCall(path, method, body, config)
    }

    public static async closePaginationCursor(cursor: any) {
        return await CommonDM.closePaginationCursor(cursor)
    }

    public static async moveCursorToNextPage(inputData: MoveCursorToNextInput) {
        const { cursorRef, records, currentPageRef, setRecords, totalPageRef, fields, soupName, transformRecords } =
            inputData
        const offset = currentPageRef.current + 1
        const cursor = cursorRef.current
        if (offset > 0 && currentPageRef.current + 1 < totalPageRef.current) {
            const newCursor: any = await CommonDM.moveCursorToNextPage(cursor, soupName)
            if (newCursor) {
                let entries = CommonDM.buildOriginQueryResults(soupName, newCursor.currentPageOrderedEntries, fields)
                transformRecords && (entries = await transformRecords(entries))
                const result: any = [...records, ...entries]
                setRecords(result)
                currentPageRef.current = offset
                cursorRef.current = newCursor
                if (newCursor.totalPages === (newCursor.currentPageIndex as number) + 1) {
                    CommonDM.closePaginationCursor(newCursor)
                }
            }
        }
    }

    public static async isAbleToConnect() {
        try {
            const state = await NetInfo.fetch()
            return state.isInternetReachable
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'orderade: isAbleToConnect', ErrorUtils.error2String(error))
            return false
        }
    }

    public static async getOrderingFeatureToggle() {
        try {
            CommonParam.OrderingFeatureToggle = CommonParam.FeatureToggle[FeatureToggle.ORDERING]
            await AsyncStorage.setItem(
                'Ordering_Feature_Toggle',
                CommonParam.OrderingFeatureToggle ? BooleanStr.STR_TRUE : BooleanStr.STR_FALSE
            )
            return CommonParam.OrderingFeatureToggle
        } catch (e) {
            await AsyncStorage.setItem(
                'Ordering_Feature_Toggle',
                CommonParam.OrderingFeatureToggle ? BooleanStr.STR_TRUE : BooleanStr.STR_FALSE
            )
            storeClassLog(Log.MOBILE_ERROR, 'Orderade: getOrderingFeatureToggle', ErrorUtils.error2String(e))
            return CommonParam.OrderingFeatureToggle
        }
    }
}

export default CommonService

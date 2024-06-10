import { CommonParam } from '../../../common/CommonParam'
import { Log } from '../../../common/enums/Log'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { compositeCommonCall, restApexCommonCall, restDataCommonCall } from '../../api/SyncUtils'
import { HttpStatusCode } from 'axios'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
export const handleChangeRealogramVisit = async (visitId: string) => {
    await restDataCommonCall(`sobjects/Visit/${visitId}/`, 'PATCH', {
        Status__c: 'Removed'
    })
}

export const handleUpdateInStoreLocation = async ({
    inStoreLocationId,
    strVisitInStoreLocationId,
    startTime,
    endTime,
    description,
    category,
    sellDownMethod,
    retailStoreId,
    strRetailStoreName,
    visitId
}: {
    inStoreLocationId: string
    strVisitInStoreLocationId: string
    startTime: string
    endTime: string
    description: any
    category: string
    sellDownMethod: string
    retailStoreId: any
    strRetailStoreName: string
    visitId: any
}) => {
    const response = await restDataCommonCall(`sobjects/InStoreLocation/${inStoreLocationId}/`, 'PATCH', {
        Visit_Id__c: visitId,
        Start_Date__c: startTime,
        End_Date__c: endTime,
        Description: description,
        Category: category,
        SellDownMethod__c: sellDownMethod,
        Name: strRetailStoreName + '_' + category,
        Display_Id__c: Math.round(Math.random() * 100000000) + '_' + retailStoreId,
        Wo_Id__c: '0'
    })
    if (response.status === HttpStatusCode.NoContent && inStoreLocationId && !strVisitInStoreLocationId) {
        await restDataCommonCall(`sobjects/Visit/${visitId}/`, 'PATCH', {
            InStoreLocation__c: inStoreLocationId
        })
    }
}

export const handleSaveInStoreLocation = async ({
    startTime,
    endTime,
    description,
    category,
    sellDownMethod,
    retailStoreId,
    strRetailStoreName,
    realogramVisit,
    visitId
}: {
    realogramVisit: string
    startTime: string
    endTime: string
    description: string
    category: string
    sellDownMethod: string
    retailStoreId: any
    strRetailStoreName: string
    visitId: any
}) => {
    const insertInStoreLocationObj = {
        method: 'POST',
        url: `/services/data/${CommonParam.apiVersion}/sobjects/InStoreLocation/`,
        referenceId: 'refInStoreLocations',
        body: {
            Visit_Id__c: realogramVisit,
            Start_Date__c: startTime,
            End_Date__c: endTime,
            Description: description,
            Category: category,
            SellDownMethod__c: sellDownMethod,
            RetailStoreId: retailStoreId,
            Name: strRetailStoreName + '_' + category,
            Display_Id__c: Math.round(Math.random() * 100000000) + '_' + retailStoreId,
            Wo_Id__c: '0'
        }
    }
    const res = await compositeCommonCall([insertInStoreLocationObj])
    if (res.status === HttpStatusCode.Ok && res.data.compositeResponse[0].httpStatusCode === HttpStatusCode.Created) {
        await restDataCommonCall(`sobjects/Visit/${visitId}/`, 'PATCH', {
            InStoreLocation__c: res.data.compositeResponse[0].body.id
        })
    } else {
        throw new Error(JSON.stringify(res))
    }
}
export const deleteStockingLocation = async (realogramVisitId: string, strInStoreLocationId: string) => {
    try {
        await restApexCommonCall(`createSalesRealogramVisit/${strInStoreLocationId}`, 'GET') // To all visit records which related to InStoreLocation, this method will make its Status__c = 'Removed'
        await restDataCommonCall(`sobjects/InStoreLocation/${strInStoreLocationId}`, 'DELETE')
        await restDataCommonCall(`sobjects/Visit/${realogramVisitId}`, 'PATCH', {
            Status__c: 'Removed'
        })
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            `RealogramScreen-deleteStockingLocation`,
            `Delete Data Fail` + ErrorUtils.error2String(error)
        )
    }
}

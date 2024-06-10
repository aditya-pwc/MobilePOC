import { useState, useEffect } from 'react'
import { compositeCommonCall, syncDownObj } from '../api/SyncUtils'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import { getStringValue } from '../utils/LandingUtils'
import { CommonParam } from '../../common/CommonParam'
import { HttpStatusCode } from 'axios'

export const syncExternalDataSourceId = async () => {
    const query = `SELECT Id FROM ExternalDataSource WHERE DeveloperName = 'Savvy_SharePoint_Connection'`
    const res = await syncDownObj('ExternalDataSource', query, false)
    return res?.data[0].Id || ''
}

export const syncSharePointSiteInfo = async () => {
    let SITE_NAME = ''
    let PATH = ''
    const siteQueryBody = {
        method: 'GET',
        url: `/services/data/${CommonParam.apiVersion}/query/?q=SELECT Id, Name, Category__c, Type__c, Value__c FROM Integration_Setting__c WHERE Name = 'PBNA_Sharepoint_Site_Name'`,
        referenceId: 'refIntegration'
    }
    const pathQueryBody = {
        method: 'GET',
        url: `/services/data/${CommonParam.apiVersion}/query/?q=SELECT Id, Label, Value__c FROM Application_Configuration__mdt WHERE DeveloperName = 'PBNA_SharePoint_Savvy_Support_File_Path'`,
        referenceId: 'refApplicationConfiguration'
    }
    const results = await compositeCommonCall([siteQueryBody, pathQueryBody])
    const response = results?.data?.compositeResponse
    const OK =
        response?.[0]?.httpStatusCode === HttpStatusCode.Ok && response?.[1]?.httpStatusCode === HttpStatusCode.Ok
    if (OK) {
        SITE_NAME = response?.[0].body.records[0].Value__c
        PATH = response?.[1].body.records[0].Value__c
    }
    return {
        SITE_NAME,
        PATH
    }
}

export const useSPExternalDataSourceId = (isFocused: boolean) => {
    const [spExternalDataSourceId, setSpExternalDataSourceId] = useState<string>('')

    const fetchExternalDataSourceId = async () => {
        try {
            const externalDataSourceId = await syncExternalDataSourceId()
            setSpExternalDataSourceId(externalDataSourceId)
        } catch (error) {
            setSpExternalDataSourceId('')
            storeClassLog(
                Log.MOBILE_ERROR,
                `fetchExternalDataSourceId`,
                `Get ExternalDataSource Id Failed: ${getStringValue(error)}`
            )
        }
    }

    useEffect(() => {
        if (isFocused) {
            fetchExternalDataSourceId()
        }
    }, [isFocused])

    return spExternalDataSourceId
}

export const useSPUrlInfo = (isFocused: boolean) => {
    const [sharePointSiteName, setSharePointSiteName] = useState<string>('')
    const [sharePointPath, setSharePointPath] = useState<string>('')

    const fetchSharePointSiteInfo = async () => {
        try {
            const { SITE_NAME, PATH } = await syncSharePointSiteInfo()
            setSharePointSiteName(SITE_NAME)
            setSharePointPath(PATH)
        } catch (error) {
            setSharePointSiteName('')
            setSharePointPath('')
            storeClassLog(
                Log.MOBILE_ERROR,
                `fetchSharePointSiteInfo`,
                `Get SPUrl Info Failed: ${getStringValue(error)}`
            )
        }
    }

    useEffect(() => {
        if (isFocused) {
            fetchSharePointSiteInfo()
        }
    }, [isFocused])

    return {
        sharePointSiteName,
        sharePointPath
    }
}

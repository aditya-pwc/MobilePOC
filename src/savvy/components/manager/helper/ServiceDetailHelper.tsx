/**
 * @description Reuseable code snippets.
 * @author Hao Chen
 * @email hao.c.chen@pwc.com
 * @date 2022-3-02
 */

import _ from 'lodash'
import React from 'react'
import { getObjByName, restDataCommonCall, syncUpObjCreate, syncUpObjUpdate } from '../../../api/SyncUtils'
import { CommonParam } from '../../../../common/CommonParam'
import { Log } from '../../../../common/enums/Log'
import { BooleanStr, DropDownType } from '../../../enums/Manager'
import { t } from '../../../../common/i18n/t'
import { SoupService } from '../../../service/SoupService'
import { getRecordTypeIdByDeveloperName } from '../../../utils/MerchManagerUtils'
import { checkDataForCTRAndSD } from '../service/DataCheckService'
import { getIdClause } from './MerchManagerHelper'
import DropDownModal from '../common/DropDownModal'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'
/**
 *  sync up service detail data
 */
const updateSDData = async (serviceDetailIds) => {
    SoupService.retrieveDataFromSoup(
        'Service_Detail__c',
        {},
        getObjByName('Service_Detail__c').syncUpCreateFields,
        getObjByName('Service_Detail__c').syncUpCreateQuery +
            `
            WHERE {Service_Detail__c:Id} IN (${getIdClause(serviceDetailIds)})
        `
    )
        .then(async (res: Array<any>) => {
            if (!_.isEmpty(res)) {
                res.forEach((serviceDetail) => {
                    serviceDetail.Unassigned__c = BooleanStr.STR_TRUE
                })
                await SoupService.upsertDataIntoSoup('Service_Detail__c', res)
                await syncUpObjUpdate(
                    'Service_Detail__c',
                    getObjByName('Service_Detail__c').syncUpCreateFields,
                    getObjByName('Service_Detail__c').syncUpCreateQuery +
                        `
                WHERE {Service_Detail__c:Id} IN (${getIdClause(serviceDetailIds)})
                `
                )
            }
        })
        .catch((err) => {
            storeClassLog(Log.MOBILE_ERROR, 'updateSDData', getStringValue(err))
        })
}

export const unassignSDData = async (params) => {
    const { selectData, setSelectData, setIsErrorShow, setUploadLoading } = params
    const serviceDetailIds = []

    setUploadLoading(true)
    const dataCheck = await checkDataForCTRAndSD(selectData)
    if (!dataCheck) {
        setUploadLoading(false)
        setIsErrorShow(true)
        return false
    }

    for (const item of selectData) {
        serviceDetailIds.push(item.id)
        item.isUnassigned = true
        item.select = false
    }

    await updateSDData(serviceDetailIds)
    setUploadLoading(false)
    setSelectData([])
    return true
}

export const handleRouteSalesGeo = async (params) => {
    const { dropDownRef, selectedUser, setIsLoading } = params
    const recordTypeId = await getRecordTypeIdByDeveloperName('Route', 'Route_Sales_Geo__c')
    return new Promise((resolve, reject) => {
        // create Route Sales Geo logic
        SoupService.retrieveDataFromSoup(
            'Route_Sales_Geo__c',
            {},
            getObjByName('Route_Sales_Geo__c').syncUpCreateFields,
            getObjByName('Route_Sales_Geo__c').syncUpCreateQuery +
                ` WHERE {Route_Sales_Geo__c:OwnerId} = '${selectedUser.id}' 
        AND {Route_Sales_Geo__c:RecordTypeId} = '${recordTypeId}' 
        AND {Route_Sales_Geo__c:Merch_Flag__c} = '1'`
        )
            .then(async (routeRes: any) => {
                if (routeRes.length === 0) {
                    const routeObj = {
                        Id: 'NeedCreate',
                        OwnerId: selectedUser.id,
                        RecordTypeId: recordTypeId,
                        LOC_ID__c: CommonParam.userLocationId,
                        Merch_Flag__c: true
                    }
                    SoupService.upsertDataIntoSoup('Route_Sales_Geo__c', [routeObj], true, false)
                        .then(async (result) => {
                            // sync up Route Sales Geo
                            syncUpObjCreate(
                                'Route_Sales_Geo__c',
                                getObjByName('Route_Sales_Geo__c').syncUpCreateFields,
                                getObjByName('Route_Sales_Geo__c').syncUpCreateQuery +
                                    ` WHERE {Route_Sales_Geo__c:OwnerId} = '${selectedUser.id}' 
                    AND {Route_Sales_Geo__c:RecordTypeId} = '${recordTypeId}' 
                    AND {Route_Sales_Geo__c:__locally_updated__} = '1'`
                            )
                                .then((res) => {
                                    resolve(res)
                                })
                                .catch((err) => {
                                    if (result[0]?._soupEntryId) {
                                        SoupService.removeRecordFromSoup('Route_Sales_Geo__c', [result[0]._soupEntryId])
                                    }
                                    setIsLoading(false)
                                    dropDownRef.current.alertWithType(
                                        DropDownType.ERROR,
                                        t.labels.PBNA_MOBILE_ADD_EMPLOYEE_ADD_EMPLOYEE_LABEL +
                                            t.labels.PBNA_MOBILE_ADD_EMPLOYEE_CREATE_ROUTE_SALES_GEO,
                                        err
                                    )
                                })
                        })
                        .catch((err) => {
                            setIsLoading(false)
                            dropDownRef.current.alertWithType(
                                DropDownType.ERROR,
                                t.labels.PBNA_MOBILE_ADD_EMPLOYEE_ADD_EMPLOYEE_LABEL +
                                    t.labels.PBNA_MOBILE_ADD_EMPLOYEE_INSERT_ROUTE_SALES_GEO,
                                err
                            )
                        })
                } else {
                    resolve(1)
                }
            })
            .catch((err) => {
                setIsLoading(false)
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_ADD_EMPLOYEE_ADD_EMPLOYEE_LABEL +
                        t.labels.PBNA_MOBILE_ADD_EMPLOYEE_QUERY_ROUTE_SALES_GEO,
                    err
                )
                reject(err)
            })
    })
}

export const getMyTeamUnassignedServiceDetail = async () => {
    try {
        const unassignedServiceDetails = await SoupService.retrieveDataFromSoup(
            'Service_Detail__c',
            {},
            ['Id', 'Route_Group__c', 'TotalVisit'],
            `SELECT {Service_Detail__c:Id}, {Service_Detail__c:Route_Group__c}, COUNT({Service_Detail__c:Id}) 
            FROM {Service_Detail__c} WHERE {Service_Detail__c:Route_Group__c} IS NOT NULL
            AND {Service_Detail__c:Unassigned__c} IS TRUE
            AND {Service_Detail__c:IsRemoved__c} IS FALSE
            GROUP BY {Service_Detail__c:Route_Group__c}
            `
        )
        const routeGroups = []
        const routeGroupServiceDetailCountMap = new Map()
        unassignedServiceDetails.forEach((item) => {
            routeGroups.push(item.Route_Group__c)
            routeGroupServiceDetailCountMap.set(item.Route_Group__c, item.TotalVisit)
        })
        if (_.isEmpty(routeGroups)) {
            return []
        }
        const query = `SELECT Id, Name, FirstName, LastName, GPID__c FROM User WHERE ID IN (${getIdClause(
            routeGroups
        )})`
        const path = `query/?q=${query}`
        const results = await restDataCommonCall(path, 'GET')
        const routeUserInfo = results.data.records
        routeUserInfo.forEach((record) => {
            record.TotalVisit = routeGroupServiceDetailCountMap.get(record.Id)
        })
        return routeUserInfo
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, getMyTeamUnassignedServiceDetail.name, getStringValue(e))
    }
}

export const renderDropdownBtnList = (dropDownModalVisible, onAddBtnClick, setDropDownModalVisible) => {
    const dropDownModalList = [
        `${t.labels.PBNA_MOBILE_ADD_EMPLOYEE.toUpperCase()}`,
        `${t.labels.PBNA_MOBILE_ADD_RECURRING_VISITS.toUpperCase()}`
    ]
    return (
        <DropDownModal
            visible={dropDownModalVisible}
            list={dropDownModalList}
            handleClick={(index) => {
                onAddBtnClick(index)
            }}
            setDropDownVisible={setDropDownModalVisible}
        />
    )
}

export const composeServiceDetailQuery = (fields) => {
    const whereClauseArr = []
    for (const key of Object.keys(fields)) {
        const value = fields[key]
        if (key === 'Id') {
            const clauseForSmartSql = {
                leftTable: 'Service_Detail__c',
                leftField: key,
                rightField: value,
                operator: '=',
                type: 'IN'
            }
            whereClauseArr.push(clauseForSmartSql)
        } else {
            const clauseForSmartSql = {
                leftTable: 'Service_Detail__c',
                leftField: key,
                rightField: `'${value}'`,
                operator: '=',
                type: 'AND'
            }
            whereClauseArr.push(clauseForSmartSql)
        }
    }
    return whereClauseArr
}

export const isAllWeekSelectSD = (data) => {
    if (_.isEmpty(data)) {
        return
    }
    if (Object.keys(data).length > 0) {
        let hasData = false
        for (const weekKey in data) {
            const sortList = data[weekKey]
            for (const key in sortList) {
                hasData = true
                if (!sortList[key].select) {
                    return false
                }
            }
        }
        return hasData
    }
    return false
}

export const handleDeleteSelectData = (selectData, setDeleteSelectData, deleteSelectData) => {
    for (const tmpData of selectData) {
        tmpData.isDelete = true
        tmpData.select = false
    }
    setDeleteSelectData(
        Object.assign(
            deleteSelectData,
            ...selectData.map((item) => {
                const obj = {}
                obj[item.id] = item
                return obj
            })
        )
    )
}

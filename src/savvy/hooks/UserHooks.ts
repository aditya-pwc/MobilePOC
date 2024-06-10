/**
 * @description UserHooks
 * @author Sheng Huang
 * @date 2021/9/27
 */

import { useEffect, useState } from 'react'
import { SoupService } from '../service/SoupService'
import _ from 'lodash'
import { compositeCommonCall, restDataCommonCall } from '../api/SyncUtils'
import { CommonParam } from '../../common/CommonParam'
import { formatString, getRecordTypeIdByDeveloperName } from '../utils/CommonUtils'
import { getProfile } from './CustomerHooks'
import { isPersonaCRMBusinessAdmin, Persona } from '../../common/enums/Persona'
import { useDebounce } from './CommonHooks'
import { t } from '../../common/i18n/t'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Log } from '../../common/enums/Log'
import { getStringValue } from '../utils/LandingUtils'
import { storeClassLog } from '../../common/utils/LogUtils'
import { useSelector } from 'react-redux'

export const useUserStatsId = () => {
    const [userStatsId, setUserStatsId] = useState(null)
    useEffect(() => {
        if (CommonParam.PERSONA__c === Persona.KEY_ACCOUNT_MANAGER) {
            AsyncStorage.getItem('kam_user_stats_id').then((id) => {
                setUserStatsId(id)
            })
        } else {
            SoupService.retrieveDataFromSoup('User_Stats__c', {}, [])
                .then((res) => {
                    setUserStatsId(res[0]?.Id)
                })
                .catch((e) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'Rep-useUserStatsId',
                        'use User Stats Id Error: ' + getStringValue(e)
                    )
                })
        }
    }, [])
    return userStatsId
}

export const useRouteSalesGeo = (userId: string) => {
    const [routeNumber, setRouteNumber] = useState([])
    useEffect(() => {
        SoupService.retrieveDataFromSoup(
            'Route_Sales_Geo__c',
            {},
            ['Id', 'GTMU_RTE_ID__c', 'RTE_TYP_GRP_NM__c', 'LOCL_RTE_ID__c', 'RTE_TYP_CDV__c'],
            'SELECT {Route_Sales_Geo__c:Id},{Route_Sales_Geo__c:GTMU_RTE_ID__c},' +
                '{Route_Sales_Geo__c:RTE_TYP_GRP_NM__c},{Route_Sales_Geo__c:LOCL_RTE_ID__c},' +
                '{Route_Sales_Geo__c:RTE_TYP_CDV__c} FROM {Route_Sales_Geo__c} WHERE {Route_Sales_Geo__c:Id} IN ' +
                '(SELECT {Employee_To_Route__c:Route__c} FROM {Employee_To_Route__c} WHERE ' +
                `{Employee_To_Route__c:User__c} = '${userId}' AND {Employee_To_Route__c:Active_Flag__c} is true AND {Employee_To_Route__c:Status__c} = 'Processed')`
        )
            .then((res) => {
                const routeNumbers = []
                res.forEach((r) => {
                    if (r.GTMU_RTE_ID__c || r.LOCL_RTE_ID__c) {
                        routeNumbers.push({
                            NationalId: r.GTMU_RTE_ID__c ? `${r.GTMU_RTE_ID__c} ${r.RTE_TYP_GRP_NM__c || '-'}` : null,
                            LocalId: r.LOCL_RTE_ID__c ? `${r.LOCL_RTE_ID__c} ${r.RTE_TYP_GRP_NM__c || '-'}` : null,
                            GTMUId: r.GTMU_RTE_ID__c,
                            RouteTypeCode: r.RTE_TYP_CDV__c
                        })
                    }
                })
                setRouteNumber(routeNumbers)
            })
            .catch((e) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'Rep-useRouteSalesGeo',
                    'use Route Sales Geo Error: ' + getStringValue(e)
                )
            })
    }, [])
    return routeNumber
}
const ROUTE_TYPE_CODE = '005'
export const useFilterRoute = (userId: string) => {
    const [routeList, setRouteList] = useState([])
    const route = useRouteSalesGeo(userId)
    useEffect(() => {
        const lstRoute = _.cloneDeep(route)
        _.remove(lstRoute, (v) => {
            return v.RouteTypeCode !== ROUTE_TYPE_CODE
        })
        setRouteList(lstRoute)
    }, [route])
    return routeList
}

export const useUserMobilePhone = () => {
    const [phone, setPhone] = useState(null)
    useEffect(() => {
        AsyncStorage.getItem('Persona').then((res) => {
            setPhone(JSON.parse(res)?.userInfo?.MobilePhone)
        })
    }, [])
    return phone
}

export const useDpPicklistData = (salesMethod, locationId, searchValue) => {
    const [routeNumber, setRouteNumber] = useState([])
    const [searchV, setSearchV] = useState('')
    useDebounce(() => setSearchV(encodeURIComponent(searchValue)), 500, [searchValue])
    useEffect(() => {
        if (searchV?.length > 0) {
            if (salesMethod === 'Food Service Calls') {
                compositeCommonCall([
                    {
                        method: 'GET',
                        url:
                            `/services/data/${CommonParam.apiVersion}/query/?q=SELECT Id,GTMU_RTE_ID__c,RTE_TYP_GRP_NM__c,` +
                            '(SELECT User__r.Name FROM Employee_to_Routes__r WHERE User__r.Name != null AND ' +
                            "Active_Flag__c = true AND Status__c = 'Processed' LIMIT 1) " +
                            "FROM Route_Sales_Geo__c WHERE RTE_TYP_NM__c = 'Food Service' AND HRCHY_LVL__c = 'Route' AND " +
                            `(GTMU_RTE_ID__c LIKE '%25${searchV}%25' OR RTE_TYP_GRP_NM__c LIKE '%25${searchV}%25') AND ` +
                            '(RTE_END_DT__c = null OR RTE_END_DT__c >= TODAY) AND ' +
                            '(RTE_STRT_DT__c = null OR RTE_STRT_DT__c <= TODAY) ' +
                            'ORDER BY GTMU_RTE_ID__c LIMIT 100',
                        referenceId: 'ref1'
                    },
                    {
                        method: 'GET',
                        url:
                            `/services/data/${CommonParam.apiVersion}/query/?q=SELECT Id,GTMU_RTE_ID__c,RTE_TYP_GRP_NM__c,` +
                            '(SELECT User__r.Name FROM Employee_to_Routes__r WHERE User__r.Name != null AND ' +
                            "Active_Flag__c = true AND Status__c = 'Processed' LIMIT 1) " +
                            "FROM Route_Sales_Geo__c WHERE RTE_TYP_NM__c = 'Food Service' AND HRCHY_LVL__c = 'Route' AND " +
                            `Id IN (SELECT Route__c FROM Employee_to_Route__c WHERE User__r.Name LIKE '%25${searchV}%25' ` +
                            "AND Active_Flag__c = true AND Status__c = 'Processed') AND " +
                            '(RTE_END_DT__c = null OR RTE_END_DT__c >= TODAY) AND ' +
                            '(RTE_STRT_DT__c = null OR RTE_STRT_DT__c <= TODAY) ' +
                            'ORDER BY GTMU_RTE_ID__c LIMIT 100',
                        referenceId: 'ref2'
                    }
                ])
                    .then((res) => {
                        const data = res.data.compositeResponse
                        const temp = data.map((v) => {
                            return v.body?.records
                        })
                        if (temp[0] && temp[1]) {
                            const values = _.flatten(temp)
                            setRouteNumber(values)
                        } else {
                            setRouteNumber([])
                        }
                    })
                    .catch((e) => {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'Rep-useDpPicklistData',
                            'use FSC Dp Picklist Data Error:' + getStringValue(e)
                        )
                    })
            } else {
                compositeCommonCall([
                    {
                        method: 'GET',
                        url:
                            `/services/data/${CommonParam.apiVersion}/query/?q=SELECT Id,GTMU_RTE_ID__c,RTE_TYP_GRP_NM__c,` +
                            '(SELECT User__r.Name FROM Employee_to_Routes__r WHERE User__r.Name != null AND ' +
                            "Active_Flag__c = true AND Status__c = 'Processed' LIMIT 1) " +
                            "FROM Route_Sales_Geo__c WHERE (RTE_TYP_CDV__c = '001' OR RTE_TYP_CDV__c = '003' OR RTE_TYP_CDV__c = '006') AND " +
                            `(GTMU_RTE_ID__c LIKE '%25${searchV}%25' OR RTE_TYP_GRP_NM__c LIKE '%25${searchV}%25') ` +
                            `AND HRCHY_LVL__c = 'Route' AND Parent_Node__r.Parent_Node__r.SLS_UNIT_ID__c = '${locationId}' AND ` +
                            '(RTE_END_DT__c = null OR RTE_END_DT__c >= TODAY) AND ' +
                            '(RTE_STRT_DT__c = null OR RTE_STRT_DT__c <= TODAY) ' +
                            'ORDER BY GTMU_RTE_ID__c LIMIT 100',
                        referenceId: 'ref1'
                    },
                    {
                        method: 'GET',
                        url:
                            `/services/data/${CommonParam.apiVersion}/query/?q=SELECT Id,GTMU_RTE_ID__c,RTE_TYP_GRP_NM__c,` +
                            '(SELECT User__r.Name FROM Employee_to_Routes__r WHERE User__r.Name != null AND ' +
                            "Active_Flag__c = true AND Status__c = 'Processed' LIMIT 1) " +
                            "FROM Route_Sales_Geo__c WHERE (RTE_TYP_CDV__c = '001' OR RTE_TYP_CDV__c = '003' OR RTE_TYP_CDV__c = '006') AND " +
                            `Id IN (SELECT Route__c FROM Employee_to_Route__c WHERE User__r.Name LIKE '%25${searchV}%25' ` +
                            "AND Active_Flag__c = true AND Status__c = 'Processed') " +
                            `AND HRCHY_LVL__c = 'Route' AND Parent_Node__r.Parent_Node__r.SLS_UNIT_ID__c = '${locationId}' AND ` +
                            '(RTE_END_DT__c = null OR RTE_END_DT__c >= TODAY) AND ' +
                            '(RTE_STRT_DT__c = null OR RTE_STRT_DT__c <= TODAY) ' +
                            'ORDER BY GTMU_RTE_ID__c LIMIT 100',
                        referenceId: 'ref2'
                    }
                ])
                    .then((res) => {
                        const data = res.data.compositeResponse
                        const temp = data.map((v) => {
                            return v.body?.records
                        })
                        if (temp[0] && temp[1]) {
                            const values = _.uniqBy(_.flatten(temp), (item) => {
                                // @ts-ignore
                                return item.Id
                            })
                            setRouteNumber(values)
                        } else {
                            setRouteNumber([])
                        }
                    })
                    .catch((e) => {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'Rep-useDpPicklistData',
                            'use Dp Picklist Data Error:' + getStringValue(e)
                        )
                    })
            }
        } else {
            setRouteNumber([])
        }
    }, [salesMethod, locationId, searchV])
    return routeNumber
}

export const searchUsersFromBackend = async (searchV: string) => {
    const searchValue = encodeURIComponent(
        searchV.replace("'", '%').replace('`', '%').replace("'", '%').replace('‘', '%')
    )
    const searchQuery =
        'SELECT+Id,PERSONA__c,Name,FirstName,LastName,FT_EMPLYE_FLG_VAL__c,MobilePhone,Title,' +
        '%28SELECT+Id,Start_Time__c,Sunday__c,Monday__c,Tuesday__c,Wednesday__c,Thursday__c,Friday__c,' +
        'Saturday__c,RecordTypeId,relationship_end_date__c,manager__c+FROM+User_Stats__r%29+' +
        'FROM+User+WHERE+' +
        `(Name+LIKE+%27%25${searchValue}%25%27+OR+GPID__c+LIKE+'${searchValue}')+AND+isActive=TRUE` +
        '+AND+Id+NOT+IN+%28SELECT+User__c+FROM+User_Stats__c+WHERE+' +
        `manager__c=%27${CommonParam.userId}%27+AND+relationship_active__c=TRUE%29+` +
        `AND+%28PERSONA__c=%27${Persona.FSR}%27+OR+PERSONA__c=%27${Persona.PSR}%27%29` +
        '+ORDER+BY+Name+LIMIT+2500'
    const path = `query/?q=${searchQuery}`
    const res = await restDataCommonCall(path, 'GET')
    return res.data?.records
}

const getRouteFromBackendById = async (searchV: string) => {
    const searchValue = encodeURIComponent(
        searchV.replace("'", '%').replace('`', '%').replace("'", '%').replace('‘', '%')
    )
    const routeQuery =
        'query/?q=SELECT+User__c,Route__c,User__r.Name,User__r.Id,Route__r.GTMU_RTE_ID__c,' +
        `Route__r.LOCL_RTE_ID__c FROM Employee_To_Route__c WHERE User__r.Name LIKE '%${searchValue}%' AND Active_Flag__c = true`
    const res = await restDataCommonCall(routeQuery, 'GET')
    return res.data?.records
}

const getWorkingStatus = (v) => {
    if (v === '1') {
        return true
    } else if (v === '0') {
        return false
    }
    return false
}

export const useUserListFromBackEnd = (searchValue, setIsLoading) => {
    const [userList, setUserList] = useState([])

    const doSearch = async (searchVal) => {
        const res = await searchUsersFromBackend(searchVal)
        const routeList = await getRouteFromBackendById(searchVal)
        const statsId = await getRecordTypeIdByDeveloperName('Stats', 'User_Stats__c')
        const relationshipId = await getRecordTypeIdByDeveloperName('Manager_Relationship', 'User_Stats__c')
        const tempList = []
        res.forEach((value) => {
            const route = _.find(routeList, { User__r: { Id: value.Id } })
            tempList.push({
                Id: value.Id,
                phone: value.MobilePhone,
                Name: value.Name,
                title: value.Title,
                ftFlag: value.FT_EMPLYE_FLG_VAL__c,
                startTime: value.Start_Time__c,
                firstName: value.FirstName,
                lastName: value.LastName,
                PERSONA_DESC: getProfile(value.PERSONA__c),
                GTMU_RTE_ID__c: route?.Route__r?.GTMU_RTE_ID__c,
                LOCL_RTE_ID__c: route?.Route__r?.LOCL_RTE_ID__c,
                userStatsId: _.filter(value.User_Stats__r?.records, { RecordTypeId: statsId })[0]?.Id,
                managerRelationshipId: _.filter(value.User_Stats__r?.records, {
                    RecordTypeId: relationshipId,
                    manager__c: CommonParam.userId
                })[0]?.Id,
                relationship_end_date__c: _.filter(value.User_Stats__r?.records, {
                    RecordTypeId: relationshipId,
                    manager__c: CommonParam.userId
                })[0]?.relationship_end_date__c,
                workingStatus: [
                    {
                        label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_SUNDAY,
                        attend: getWorkingStatus(value.Sunday__c)
                    },
                    {
                        label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_MONDAY,
                        attend: getWorkingStatus(value.Monday__c)
                    },
                    {
                        label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_TUESDAY,
                        attend: getWorkingStatus(value.Tuesday__c)
                    },
                    {
                        label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_WEDNESDAY,
                        attend: getWorkingStatus(value.Wednesday__c)
                    },
                    {
                        label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_THURSDAY,
                        attend: getWorkingStatus(value.Thursday__c)
                    },
                    {
                        label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_FRIDAY,
                        attend: getWorkingStatus(value.Friday__c)
                    },
                    {
                        label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_SATURDAY,
                        attend: getWorkingStatus(value.Saturday__c)
                    }
                ]
            })
        })
        return tempList
    }

    useEffect(() => {
        if (searchValue.length >= 3) {
            setIsLoading(true)
            doSearch(searchValue)
                .then((result) => {
                    setUserList(result)
                })
                .catch((e) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'Rep-useUserListFromBackEnd',
                        'use User List From BackEnd Error: ' + getStringValue(e)
                    )
                })
                .finally(() => {
                    setIsLoading(false)
                })
        } else {
            setUserList([])
        }
    }, [searchValue])

    return userList
}

export const useMyTeamList = (isLoading?: boolean, refreshFlag?: number, searchValue?, isFocused?) => {
    const [teamList, setTeamList] = useState([])

    const getList = async () => {
        const teamFields = [
            'Id',
            'PERSONA__c',
            'Name',
            'FT_EMPLYE_FLG_VAL__c',
            'MobilePhone',
            'Title',
            'GPID__c',
            'FirstName',
            'LastName',
            'userStatsId',
            'managerRelationshipId',
            'relationship_begin_date__c',
            'relationship_end_date__c',
            'relationship_active__c',
            'manager__c',
            'LOCL_RTE_ID__c',
            'GTMU_RTE_ID__c',
            'Route__c',
            'User__c'
        ]
        let teamQuery = `SELECT {User:Id},
        {User:PERSONA__c},
        {User:Name},
        {User:FT_EMPLYE_FLG_VAL__c},
        {User:MobilePhone},
        {User:Title},
        {User:GPID__c},
        {User:FirstName},
        {User:LastName},
        STA.{User_Stats__c:Id},
        MAN.{User_Stats__c:Id},
        MAN.{User_Stats__c:relationship_begin_date__c},
        MAN.{User_Stats__c:relationship_end_date__c},
        MAN.{User_Stats__c:relationship_active__c},
        MAN.{User_Stats__c:manager__c},
        {Route_Sales_Geo__c:LOCL_RTE_ID__c},
        {Route_Sales_Geo__c:GTMU_RTE_ID__c},
        {Employee_To_Route__c:Route__c},
        {Employee_To_Route__c:User__c}
    FROM {User}
        LEFT JOIN (
                SELECT * 
                FROM {User_Stats__c}
                WHERE {User_Stats__c:RecordTypeId} = '%s') MAN 
            ON MAN.{User_Stats__c:User__c} = {User:Id}
        LEFT JOIN (
                SELECT * 
                FROM {User_Stats__c}
                WHERE {User_Stats__c:RecordTypeId} = '%s') STA 
            ON STA.{User_Stats__c:User__c} = {User:Id}
        LEFT JOIN (
            SELECT {Employee_To_Route__c:Route__c},
                {Employee_To_Route__c:User__c}
            FROM {Employee_To_Route__c} 
            WHERE {Employee_To_Route__c:Active_Flag__c} IS TRUE 
            GROUP BY {Employee_To_Route__c:User__c}
        ) ON {Employee_To_Route__c:User__c} = {User:Id}
        LEFT JOIN {Route_Sales_Geo__c} ON {Route_Sales_Geo__c:Id} = {Employee_To_Route__c:Route__c}
 `
        if (!isPersonaCRMBusinessAdmin()) {
            teamQuery += `WHERE {User:Id} IN (
                SELECT {User_Stats__c:User__c}
                FROM {User_Stats__c} 
                WHERE {User_Stats__c:manager__c} = '%s'
                    AND {User_Stats__c:relationship_active__c} = '1'
                    AND {User_Stats__c:RecordTypeId} = '%s'
            )
                AND MAN.{User_Stats__c:manager__c}= '%s'
                AND MAN.{User_Stats__c:relationship_active__c} = '1'`
        } else {
            teamQuery += `WHERE {User:Id} !='${CommonParam.userId}'`
        }
        const managerId = await getRecordTypeIdByDeveloperName('Manager_Relationship', 'User_Stats__c')
        const statsId = await getRecordTypeIdByDeveloperName('Stats', 'User_Stats__c')
        if (searchValue) {
            return SoupService.retrieveDataFromSoup(
                'User__c',
                {},
                teamFields,
                formatString(teamQuery, [managerId, statsId, CommonParam.userId, managerId, CommonParam.userId]) +
                    ` AND {User:Name} like '%${searchValue}%' COLLATE NOCASE`
            )
        }
        return SoupService.retrieveDataFromSoup(
            'User__c',
            {},
            teamFields,
            formatString(teamQuery, [managerId, statsId, CommonParam.userId, managerId, CommonParam.userId])
        )
    }
    useEffect(() => {
        getList()
            .then((res) => {
                setTeamList(res)
            })
            .catch((e) => {
                storeClassLog(Log.MOBILE_ERROR, 'Rep-useMyTeamList', 'use My Team List Error: ' + getStringValue(e))
            })
    }, [isLoading, refreshFlag, searchValue, isFocused])

    return teamList
}

const managerReducer = (state: any) => state.manager

export const useUserAvatarRefresh = () => {
    const manager = useSelector(managerReducer)
    const refreshFlag = manager.avatarRefreshFlag

    return refreshFlag
}

export const useUserCountryCode = () => {
    const [countryCode, setCountryCode] = useState<string>('')
    useEffect(() => {
        AsyncStorage.getItem('Persona').then((res: any) => {
            setCountryCode(JSON.parse(res)?.CountryCode)
        })
    }, [])
    return countryCode
}

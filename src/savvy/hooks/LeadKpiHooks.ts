import { SetStateAction, useEffect, useState } from 'react'
import { SoupService } from '../service/SoupService'
import { CommonParam } from '../../common/CommonParam'
import moment from 'moment'
import { t } from '../../common/i18n/t'
import _ from 'lodash'
import { compositeCommonCall, restDataCommonCall } from '../api/SyncUtils'
import { Log } from '../../common/enums/Log'
import { useDropDown } from '../../common/contexts/DropdownContext'
import { tierCompositeGroup } from '../api/composite-template/LeadCompositeTemplate'
import { isPersonaCRMBusinessAdmin, isPersonaFSManager, Persona } from '../../common/enums/Persona'
import { storeClassLog } from '../../common/utils/LogUtils'
import { fetchLeadInfoByGpid } from '../api/ApexApis'
import { getRecordTypeIdByDeveloperName } from '../utils/MerchManagerUtils'
import { formatString } from '../utils/CommonUtils'
import { teamQuery } from '../queries/LeadQueries'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

export const useTopKpiPanelData = (isFocused: boolean, refreshTimes: number, topKpiCRMManagerData: any) => {
    const [topKpiPanelData, setTopKpiPanelData] = useState({
        myLeadsCount: 0,
        openLeadsCount: 0,
        customerSubmittedCount: 0,
        openPreQCount: 0
    })
    useEffect(() => {
        if (isPersonaCRMBusinessAdmin()) {
            setTopKpiPanelData(topKpiCRMManagerData)
        } else if (isFocused && !isPersonaCRMBusinessAdmin()) {
            const dataToSet = {
                myLeadsCount: 0,
                openLeadsCount: 0,
                customerSubmittedCount: 0,
                openPreQCount: 0
            }
            SoupService.retrieveDataFromSoup(
                'Lead__x',
                {},
                ['count', 'status'],
                "SELECT COUNT(*) FROM {Lead__x} WHERE {Lead__x:Status__c}='Open'"
            )
                .then((res) => {
                    dataToSet.openLeadsCount = res[0].count
                    return SoupService.retrieveDataFromSoup(
                        'Lead__x',
                        {},
                        ['count', 'status'],
                        'SELECT COUNT(*) FROM {Lead__x} ' +
                            `WHERE {Lead__x:Status__c}='Negotiate' AND {Lead__x:Lead_Type_c__c} != 'Change of Ownership' AND {Lead__x:Owner_GPID_c__c}='${CommonParam.GPID__c}'`
                    )
                })
                .then((res) => {
                    dataToSet.myLeadsCount = res[0].count
                    return SoupService.retrieveDataFromSoup(
                        'Lead__x',
                        {},
                        ['count', 'status'],
                        'SELECT COUNT(*) FROM {Lead__x} ' +
                            `WHERE {Lead__x:Status__c}='Negotiate' AND {Lead__x:Lead_Type_c__c} != 'Change of Ownership' AND {Lead__x:Owner_GPID_c__c}='${CommonParam.GPID__c}'` +
                            ' AND {Lead__x:COF_Triggered_c__c} IS TRUE'
                    )
                })
                .then((res) => {
                    dataToSet.customerSubmittedCount = res[0].count
                    return SoupService.retrieveDataFromSoup(
                        'Lead__x',
                        {},
                        ['count', 'status'],
                        'SELECT COUNT(*) FROM {Lead__x} ' +
                            "WHERE {Lead__x:Status__c}='Open' AND {Lead__x:Pre_qualified_c__c} IS TRUE"
                    )
                })
                .then((res) => {
                    dataToSet.openPreQCount = res[0].count
                })
                .then(() => {
                    setTopKpiPanelData(dataToSet)
                })
        }
    }, [isFocused, refreshTimes, topKpiCRMManagerData])

    return topKpiPanelData
}

export const useRepTopKpiPanelData = (isFocused: boolean, refreshTimes: number) => {
    const data = [
        { label: `${t.labels.PBNA_MOBILE_MY}\n${_.capitalize(t.labels.PBNA_MOBILE_LEADS)}`, value: 0 },
        { label: `${t.labels.PBNA_MOBILE_OPEN}\n${_.capitalize(t.labels.PBNA_MOBILE_LEADS)}`, value: 0 },
        { label: `${t.labels.PBNA_MOBILE_CUST_NO}\n${t.labels.PBNA_MOBILE_SUBMITTED}`, value: 0 },
        { label: `${t.labels.PBNA_MOBILE_OPEN}\n${t.labels.PBNA_MOBILE_PRE_Q_LOWER_CASE}`, value: 0 }
    ]
    const [topKpiPanelData, setTopKpiPanelData] = useState(data)

    useEffect(() => {
        if (isFocused) {
            const dataToSet = [...data]
            SoupService.retrieveDataFromSoup(
                'Lead__x',
                {},
                ['count', 'status'],
                "SELECT COUNT(*) FROM {Lead__x} WHERE {Lead__x:Status__c}='Open'"
            )
                .then((res) => {
                    dataToSet[1].value = res[0].count
                    return SoupService.retrieveDataFromSoup(
                        'Lead__x',
                        {},
                        ['count', 'status'],
                        'SELECT COUNT(*) FROM {Lead__x} ' +
                            `WHERE {Lead__x:Status__c}='Negotiate' AND {Lead__x:Lead_Type_c__c} != 'Change of Ownership' AND {Lead__x:Owner_GPID_c__c}='${CommonParam.GPID__c}'`
                    )
                })
                .then((res) => {
                    dataToSet[0].value = res[0].count
                    return SoupService.retrieveDataFromSoup(
                        'Lead__x',
                        {},
                        ['count', 'status'],
                        'SELECT COUNT(*) FROM {Lead__x} ' +
                            `WHERE {Lead__x:Status__c}='Negotiate' AND {Lead__x:Lead_Type_c__c} != 'Change of Ownership' AND {Lead__x:Owner_GPID_c__c}='${CommonParam.GPID__c}'` +
                            ' AND {Lead__x:COF_Triggered_c__c} IS TRUE'
                    )
                })
                .then((res) => {
                    dataToSet[2].value = res[0].count
                    return SoupService.retrieveDataFromSoup(
                        'Lead__x',
                        {},
                        ['count', 'status'],
                        'SELECT COUNT(*) FROM {Lead__x} ' +
                            "WHERE {Lead__x:Status__c}='Open' AND {Lead__x:Pre_qualified_c__c} IS TRUE"
                    )
                })
                .then((res) => {
                    dataToSet[3].value = res[0].count
                })
                .then(() => {
                    setTopKpiPanelData(dataToSet)
                })
        }
    }, [isFocused, refreshTimes])
    return topKpiPanelData
}

export const useTopKpiFSManagerData = (isFocused, selectedUserGPID, refreshTimes) => {
    const [topKpiFSManagerData, setTopKpiFSManagerData] = useState({
        myTeamLeadsCount: 0,
        customerSubmittedCount: 0
    })
    const getKpiData = async () => {
        const managerId = await getRecordTypeIdByDeveloperName('Manager_Relationship', 'User_Stats__c')
        const dataToSet = {
            myTeamLeadsCount: 0,
            customerSubmittedCount: 0
        }
        const filterInQuery = !selectedUserGPID
            ? formatString(teamQuery, [managerId || '', CommonParam.userId])
            : ` AND {Lead__x:Owner_GPID_c__c}='${selectedUserGPID}'`
        SoupService.retrieveDataFromSoup(
            'Lead__x',
            {},
            ['count', 'status'],
            `SELECT COUNT(*) FROM {Lead__x} WHERE {Lead__x:Status__c}='Negotiate' AND {Lead__x:Lead_Type_c__c} != 'Change of Ownership' ${filterInQuery}`
        )
            .then((res) => {
                dataToSet.myTeamLeadsCount = res[0].count
                return SoupService.retrieveDataFromSoup(
                    'Lead__x',
                    {},
                    ['count', 'status'],
                    `SELECT COUNT(*) FROM {Lead__x} WHERE {Lead__x:Status__c}='Negotiate' AND {Lead__x:Lead_Type_c__c} != 'Change of Ownership' 
                     AND {Lead__x:COF_Triggered_c__c} IS TRUE ${filterInQuery}`
                )
            })
            .then((res) => {
                dataToSet.customerSubmittedCount = res[0].count
            })
            .then(() => {
                setTopKpiFSManagerData(dataToSet)
            })
    }
    useEffect(() => {
        if (isFocused && CommonParam.PERSONA__c === Persona.FS_MANAGER) {
            getKpiData()
        }
    }, [selectedUserGPID, isFocused, refreshTimes])

    return topKpiFSManagerData
}

export const useTopKpiFSManagerLeadData = (
    isFocused,
    selectedUserGPID,
    refreshTimes,
    tempTeamList,
    bottomKpiFilter,
    setIsLoading
) => {
    const [leadData, setLeadData] = useState({})
    useEffect(() => {
        if (isPersonaFSManager()) {
            setIsLoading(true)
            fetchLeadInfoByGpid(selectedUserGPID, bottomKpiFilter)
                .then((res) => {
                    setLeadData(res.data)
                })
                .finally(() => {
                    setIsLoading(false)
                })
        }
    }, [tempTeamList, selectedUserGPID, bottomKpiFilter, refreshTimes])
    return leadData
}

const generateLabel = (value, total) => {
    return value + ' (' + (Math.round((value / total) * 100) + '%)')
}

const handleRes = (res: any, setAgingLeadsData: SetStateAction<any>) => {
    if (res.length > 0) {
        const dataToUpdate = {
            scenario7: 0,
            scenario14: 0,
            scenario21: 0,
            scenario28: 0,
            total: 0
        }
        for (const lead of res) {
            const assignedDate = lead.Assigned_Date_c__c
            const dateDiff = moment().diff(moment(assignedDate), 'days')
            if (dateDiff <= 7) {
                dataToUpdate.scenario7 = dataToUpdate.scenario7 + 1
            } else if (dateDiff > 7 && dateDiff <= 14) {
                dataToUpdate.scenario14 = dataToUpdate.scenario14 + 1
            } else if (dateDiff > 14 && dateDiff <= 28) {
                dataToUpdate.scenario21 = dataToUpdate.scenario21 + 1
            } else if (dateDiff > 28) {
                dataToUpdate.scenario28 = dataToUpdate.scenario28 + 1
            }
        }
        dataToUpdate.total =
            dataToUpdate.scenario7 + dataToUpdate.scenario14 + dataToUpdate.scenario21 + dataToUpdate.scenario28
        if (dataToUpdate.total > 0) {
            const dataToShow = []
            if (dataToUpdate.scenario7 > 0) {
                dataToShow.push({
                    y: dataToUpdate.scenario7,
                    label: generateLabel(dataToUpdate.scenario7, dataToUpdate.total),
                    color: '#D1A2FF'
                })
            }
            if (dataToUpdate.scenario14 > 0) {
                dataToShow.push({
                    y: dataToUpdate.scenario14,
                    label: generateLabel(dataToUpdate.scenario14, dataToUpdate.total),
                    color: '#FFB4E9'
                })
            }
            if (dataToUpdate.scenario21 > 0) {
                dataToShow.push({
                    y: dataToUpdate.scenario21,
                    label: generateLabel(dataToUpdate.scenario21, dataToUpdate.total),
                    color: '#7FD7DD'
                })
            }
            if (dataToUpdate.scenario28 > 0) {
                dataToShow.push({
                    y: dataToUpdate.scenario28,
                    label: generateLabel(dataToUpdate.scenario28, dataToUpdate.total),
                    color: '#8592FF'
                })
            }
            setAgingLeadsData({
                pieData: dataToShow,
                total: dataToUpdate.total
            })
        }
    } else {
        setAgingLeadsData({
            pieData: [],
            total: 0
        })
    }
}

export const useAgingLeadsData = (isFocused: boolean, refreshTimes: number, selectedLocation: string) => {
    const [agingLeadsData, setAgingLeadsData] = useState({
        pieData: [],
        total: 0
    })
    const agingLeadsQueryMap = {
        FSR:
            'SELECT {Lead__x:Assigned_Date_c__c} FROM {Lead__x} ' +
            `WHERE {Lead__x:Owner_GPID_c__c}='${CommonParam.GPID__c}' AND {Lead__x:Status__c}='Negotiate' AND {Lead__x:Lead_Type_c__c} != 'Change of Ownership' ` +
            'AND {Lead__x:Assigned_Date_c__c} IS NOT NULL',
        'FS Manager':
            'SELECT {Lead__x:Assigned_Date_c__c} FROM {Lead__x} ' +
            "WHERE {Lead__x:Status__c}='Negotiate' AND {Lead__x:Lead_Type_c__c} != 'Change of Ownership' " +
            'AND {Lead__x:Assigned_Date_c__c} IS NOT NULL ' +
            `AND {Lead__x:Owner_GPID_c__c} IN (SELECT {User:GPID__c} FROM {User}
        LEFT JOIN (SELECT * FROM {User_Stats__c} WHERE {User_Stats__c:relationship_active__c}=TRUE AND {User_Stats__c:RecordType.Name}='Manager Relationship' AND {User_Stats__c:manager__c} = '${CommonParam.userId}') ON {User_Stats__c:User__c} = {User:Id})`
    }
    const queryStr = CommonParam.PERSONA__c && agingLeadsQueryMap[CommonParam.PERSONA__c]

    const queryCRMStr =
        'SELECT Assigned_Date_c__c FROM Lead__x ' +
        `WHERE  Status__c='Negotiate' AND Lead_Type_c__c != 'Change of Ownership' AND Location_ID_c__c ='${selectedLocation}'` +
        'AND Assigned_Date_c__c != null'

    useEffect(() => {
        if (isFocused && selectedLocation && isPersonaCRMBusinessAdmin()) {
            restDataCommonCall(`query/?q=${queryCRMStr}`, 'GET')
                .then((res) => {
                    handleRes(res.data.records, setAgingLeadsData)
                })
                .catch((err) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'useCRMAgingLeadsData',
                        `Get  Performance failed: ${ErrorUtils.error2String(err)}`
                    )
                })
        } else if (isFocused && queryStr) {
            SoupService.retrieveDataFromSoup('Lead__x', {}, ['Assigned_Date_c__c'], queryStr).then((res) => {
                handleRes(res, setAgingLeadsData)
            })
        }
    }, [isFocused, refreshTimes, selectedLocation])
    return agingLeadsData
}

const handleTier = (
    dataToUpdate: {
        tier1: any
        tier2: any
        tier3: any
        tierNull: any
        total: any
    },
    setBusinessWonLeadsData: SetStateAction<any>
) => {
    if (dataToUpdate.total > 0) {
        const dataToShow = []
        if (dataToUpdate.tierNull > 0) {
            dataToShow.push({
                y: dataToUpdate.tierNull,
                label: generateLabel(dataToUpdate.tierNull, dataToUpdate.total),
                color: '#8592FF'
            })
        }
        if (dataToUpdate.tier1 > 0) {
            dataToShow.push({
                y: dataToUpdate.tier1,
                label: generateLabel(dataToUpdate.tier1, dataToUpdate.total),
                color: '#D1A2FF'
            })
        }
        if (dataToUpdate.tier2 > 0) {
            dataToShow.push({
                y: dataToUpdate.tier2,
                label: generateLabel(dataToUpdate.tier2, dataToUpdate.total),
                color: '#FFB4E9'
            })
        }
        if (dataToUpdate.tier3 > 0) {
            dataToShow.push({
                y: dataToUpdate.tier3,
                label: generateLabel(dataToUpdate.tier3, dataToUpdate.total),
                color: '#7FD7DD'
            })
        }
        setBusinessWonLeadsData({
            pieData: dataToShow,
            total: dataToUpdate.total
        })
    } else {
        setBusinessWonLeadsData({
            pieData: [],
            total: 0
        })
    }
}

export const useBusinessWonLeadsData = (
    isFocused: boolean,
    refreshTimes: number,
    selectedLocation: string,
    setIsLoading: (boolean) => void
) => {
    const [businessWonLeadsData, setBusinessWonLeadsData] = useState({
        pieData: [],
        total: 0
    })

    const getLeadsDataWithCRMBusinessAdminPersona = () => {
        if (isFocused && selectedLocation) {
            const dataToUpdate = {
                tier1: 0,
                tier2: 0,
                tier3: 0,
                tierNull: 0,
                total: 0
            }

            const startOfYear = moment().startOf('year').format('YYYY-MM-DD')
            setIsLoading(true)

            compositeCommonCall(tierCompositeGroup(startOfYear, selectedLocation), { allOrNone: false })
                .then((res) => {
                    const tierResult = res.data.compositeResponse
                    dataToUpdate.tier1 = tierResult[0]?.body?.totalSize
                    dataToUpdate.tier2 = tierResult[1]?.body?.totalSize
                    dataToUpdate.tier3 = tierResult[2]?.body?.totalSize
                    dataToUpdate.tierNull = tierResult[3]?.body?.totalSize
                    dataToUpdate.total =
                        dataToUpdate.tier1 + dataToUpdate.tier2 + dataToUpdate.tier3 + dataToUpdate.tierNull
                    handleTier(dataToUpdate, setBusinessWonLeadsData)
                })
                .catch((err) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'useCRMBusinessWonLeadsData',
                        `Get  Tier failed: ${ErrorUtils.error2String(err)}`
                    )
                })
                .finally(() => {
                    setIsLoading(false)
                })
        }
    }
    const getLeadsData = () => {
        if (isFocused) {
            const dataToUpdate = {
                tier1: 0,
                tier2: 0,
                tier3: 0,
                tierNull: 0,
                total: 0
            }
            SoupService.retrieveDataFromSoup(
                'Lead__x',
                {},
                ['count', 'status'],
                'SELECT COUNT(*) FROM {Lead__x} ' +
                    'WHERE {Lead__x:Tier_c__c}=1 AND {Lead__x:Status__c}="Business Won" AND ' +
                    `{Lead__x:Owner_GPID_c__c}="${CommonParam.GPID__c}" AND ` +
                    '(date("now","start of year")<=date({Lead__x:Business_Won_Date_c__c}))'
            )
                .then((res) => {
                    dataToUpdate.tier1 = res[0].count
                    return SoupService.retrieveDataFromSoup(
                        'Lead__x',
                        {},
                        ['count', 'status'],
                        'SELECT COUNT(*) FROM {Lead__x} ' +
                            'WHERE {Lead__x:Tier_c__c}=2 AND {Lead__x:Status__c}="Business Won" AND ' +
                            `{Lead__x:Owner_GPID_c__c}="${CommonParam.GPID__c}" AND ` +
                            '(date("now","start of year")<=date({Lead__x:Business_Won_Date_c__c}))'
                    )
                })
                .then((res) => {
                    dataToUpdate.tier2 = res[0].count
                    return SoupService.retrieveDataFromSoup(
                        'Lead__x',
                        {},
                        ['count', 'status'],
                        'SELECT COUNT(*) FROM {Lead__x} ' +
                            'WHERE {Lead__x:Tier_c__c}=3 AND {Lead__x:Status__c}="Business Won" AND ' +
                            `{Lead__x:Owner_GPID_c__c}="${CommonParam.GPID__c}" AND ` +
                            '(date("now","start of year")<=date({Lead__x:Business_Won_Date_c__c}))'
                    )
                })
                .then((res) => {
                    dataToUpdate.tier3 = res[0].count
                    return SoupService.retrieveDataFromSoup(
                        'Lead__x',
                        {},
                        ['count', 'status'],
                        'SELECT COUNT(*), {Lead__x:Tier_c__c} ' +
                            'FROM {Lead__x} WHERE {Lead__x:Status__c}="Business Won" AND {Lead__x:Tier_c__c} IS NULL AND ' +
                            `{Lead__x:Owner_GPID_c__c}="${CommonParam.GPID__c}" AND ` +
                            '(date("now","start of year")<=date({Lead__x:Business_Won_Date_c__c}))'
                    )
                })
                .then((res) => {
                    dataToUpdate.tierNull = res[0].count
                    dataToUpdate.total =
                        dataToUpdate.tier1 + dataToUpdate.tier2 + dataToUpdate.tier3 + dataToUpdate.tierNull
                    handleTier(dataToUpdate, setBusinessWonLeadsData)
                })
        }
    }
    useEffect(() => {
        if (isPersonaCRMBusinessAdmin()) {
            getLeadsDataWithCRMBusinessAdminPersona()
        } else {
            getLeadsData()
        }
    }, [isFocused, refreshTimes, selectedLocation])
    return businessWonLeadsData
}

export const useAgingOpenPreQLeadsData = (isFocused: boolean, refreshTimes: number) => {
    const [agingOpenPreQLeadsData, setAgingOpenPreQLeadsData] = useState({
        pieData: [],
        total: 0
    })
    useEffect(() => {
        if (isFocused && !isPersonaCRMBusinessAdmin()) {
            SoupService.retrieveDataFromSoup(
                'Lead__x',
                {},
                ['Pre_Qualified_Time_c__c'],
                'SELECT {Lead__x:Pre_Qualified_Time_c__c} FROM {Lead__x} ' +
                    "WHERE {Lead__x:Pre_qualified_c__c} IS TRUE AND {Lead__x:Status__c}='Open' " +
                    'AND {Lead__x:Pre_Qualified_Time_c__c} IS NOT NULL'
            ).then((res) => {
                if (res.length > 0) {
                    const dataToUpdate = {
                        scenario7: 0,
                        scenario14: 0,
                        scenario28: 0,
                        scenario29: 0,
                        total: 0
                    }
                    for (const lead of res) {
                        const assignedDate = lead.Pre_Qualified_Time_c__c
                        const dateDiff = moment().diff(moment(assignedDate), 'days')
                        if (dateDiff <= 7) {
                            dataToUpdate.scenario7 = dataToUpdate.scenario7 + 1
                        } else if (dateDiff > 7 && dateDiff <= 14) {
                            dataToUpdate.scenario14 = dataToUpdate.scenario14 + 1
                        } else if (dateDiff > 14 && dateDiff <= 28) {
                            dataToUpdate.scenario28 = dataToUpdate.scenario28 + 1
                        } else if (dateDiff > 28) {
                            dataToUpdate.scenario29 = dataToUpdate.scenario29 + 1
                        }
                    }
                    dataToUpdate.total =
                        dataToUpdate.scenario7 +
                        dataToUpdate.scenario14 +
                        dataToUpdate.scenario28 +
                        dataToUpdate.scenario29
                    if (dataToUpdate.total > 0) {
                        const dataToShow = []
                        if (dataToUpdate.scenario7 > 0) {
                            dataToShow.push({
                                y: dataToUpdate.scenario7,
                                label: generateLabel(dataToUpdate.scenario7, dataToUpdate.total),
                                color: '#D1A2FF'
                            })
                        }
                        if (dataToUpdate.scenario14 > 0) {
                            dataToShow.push({
                                y: dataToUpdate.scenario14,
                                label: generateLabel(dataToUpdate.scenario14, dataToUpdate.total),
                                color: '#FFB4E9'
                            })
                        }
                        if (dataToUpdate.scenario28 > 0) {
                            dataToShow.push({
                                y: dataToUpdate.scenario28,
                                label: generateLabel(dataToUpdate.scenario28, dataToUpdate.total),
                                color: '#7FD7DD'
                            })
                        }
                        if (dataToUpdate.scenario29 > 0) {
                            dataToShow.push({
                                y: dataToUpdate.scenario29,
                                label: generateLabel(dataToUpdate.scenario29, dataToUpdate.total),
                                color: '#8592FF'
                            })
                        }
                        setAgingOpenPreQLeadsData({
                            pieData: dataToShow,
                            total: dataToUpdate.total
                        })
                    }
                } else {
                    setAgingOpenPreQLeadsData({
                        pieData: [],
                        total: 0
                    })
                }
            })
        }
    }, [isFocused, refreshTimes])

    return agingOpenPreQLeadsData
}

export const useBottomKpiPanelData = (
    isFocused: boolean,
    refreshTimes: number,
    selectedLocation: string,
    setLoading: (boolean) => void
) => {
    const [bottomKpiPanelData, setBottomKpiPanelData] = useState({
        businessWonCount: 0,
        noSaleCount: 0,
        totalCount: 0
    })
    const [filter, setFilter] = useState(t.labels.PBNA_MOBILE_LAST_THIRTY_DAYS)
    const timePickerList = [t.labels.PBNA_MOBILE_LAST_THIRTY_DAYS, t.labels.PBNA_MOBILE_YTD]
    const timePickerMapping = ['Last 30 days', 'YTD']
    const filterItem = timePickerMapping[_.indexOf(timePickerList, filter)]
    const { dropDownRef } = useDropDown()

    const getBottomKpiPanelDataWithCRM = () => {
        if (isFocused && selectedLocation) {
            setLoading(true)
            const dataToUpdate = {
                businessWonCount: 0,
                noSaleCount: 0,
                totalCount: 0
            }

            const rootQuery = `/services/data/${CommonParam.apiVersion}/`
            const filterInQuery =
                filterItem === 'Last 30 days'
                    ? moment().subtract(30, 'days').format('YYYY-MM-DD')
                    : moment().startOf('year').format('YYYY-MM-DD')

            const queryBusinessWon =
                "query/?q=SELECT COUNT() FROM Lead__x WHERE  Status__c='Business Won'" +
                ' AND Business_Won_Date_c__c != null ' +
                ` AND Business_Won_Date_c__c >= ${filterInQuery}` +
                ` AND Location_ID_c__c = '${selectedLocation}' `

            const queryNoSale =
                "query/?q=SELECT COUNT() FROM Lead__x  WHERE Status__c='No Sale'" +
                'AND Move_To_No_Sale_Date_c__c != null ' +
                ` AND Move_To_No_Sale_Date_c__c >= ${filterInQuery}` +
                ` AND Location_ID_c__c = '${selectedLocation}' `

            compositeCommonCall(
                [
                    {
                        url: `${rootQuery}${queryBusinessWon}`,
                        method: 'GET',
                        referenceId: 'Business_Won'
                    },
                    {
                        url: `${rootQuery}${queryNoSale}`,
                        method: 'GET',
                        referenceId: 'No_Sale'
                    }
                ],
                { allOrNone: false }
            )
                .then((res) => {
                    const resData = res.data.compositeResponse
                    dataToUpdate.businessWonCount = resData[0]?.body?.totalSize
                    dataToUpdate.noSaleCount = resData[1]?.body?.totalSize
                    dataToUpdate.totalCount = dataToUpdate.noSaleCount + dataToUpdate.businessWonCount
                    setBottomKpiPanelData(dataToUpdate)
                })
                .catch((err) => {
                    dropDownRef.current.alertWithType('error', 'Fetch CRM Bottom Kpi Panel Data err ', err)
                })
                .finally(() => {
                    setLoading(false)
                })
        }
    }
    const getBottomKpiPanelData = () => {
        if (isFocused) {
            const dataToUpdate = {
                businessWonCount: 0,
                noSaleCount: 0,
                totalCount: 0
            }
            const filterInQuery = filterItem === 'Last 30 days' ? '-30 days' : 'start of year'
            SoupService.retrieveDataFromSoup(
                'Lead__x',
                {},
                ['count'],
                'SELECT COUNT(*) ' +
                    'FROM {Lead__x} WHERE {Lead__x:Status__c}="Business Won" ' +
                    'AND {Lead__x:Business_Won_Date_c__c} IS NOT NULL AND ' +
                    `(date("now","${filterInQuery}")<=date({Lead__x:Business_Won_Date_c__c})) ` +
                    `AND {Lead__x:Owner_GPID_c__c}="${CommonParam.GPID__c}"`
            )
                .then((res) => {
                    dataToUpdate.businessWonCount = res[0].count
                    return SoupService.retrieveDataFromSoup(
                        'Lead__x',
                        {},
                        ['count'],
                        'SELECT COUNT(*) ' +
                            'FROM {Lead__x} WHERE {Lead__x:Status__c}="No Sale" ' +
                            'AND {Lead__x:Move_To_No_Sale_Date_c__c} IS NOT NULL AND ' +
                            `(date("now","${filterInQuery}")<=date({Lead__x:Move_To_No_Sale_Date_c__c})) ` +
                            `AND {Lead__x:Owner_GPID_c__c}="${CommonParam.GPID__c}"`
                    )
                })
                .then((res) => {
                    dataToUpdate.noSaleCount = res[0].count
                    dataToUpdate.totalCount = dataToUpdate.noSaleCount + dataToUpdate.businessWonCount
                    setBottomKpiPanelData(dataToUpdate)
                })
        }
    }
    useEffect(() => {
        if (isPersonaCRMBusinessAdmin()) {
            getBottomKpiPanelDataWithCRM()
        } else {
            getBottomKpiPanelData()
        }
    }, [filter, isFocused, filterItem, refreshTimes, selectedLocation])
    return {
        bottomKpiPanelData,
        setFilter
    }
}

export const useTeamBusinessWonLeadsData = (isFocused: boolean, dataToUpdate: any) => {
    const [businessWonLeadsData, setBusinessWonLeadsData] = useState({
        pieData: [],
        total: 0
    })
    useEffect(() => {
        if (isFocused && dataToUpdate) {
            dataToUpdate.total = dataToUpdate.tier1 + dataToUpdate.tier2 + dataToUpdate.tier3 + dataToUpdate.tierNull
            handleTier(dataToUpdate, setBusinessWonLeadsData)
        }
    }, [isFocused, dataToUpdate])
    return businessWonLeadsData
}

export const useTopKpiCRMManagerData = (isFocused, selectedLocation, setIsLoading) => {
    const [topKpiCRMManagerData, setTopKpiCRMManagerData] = useState({
        myLeadsCount: 0,
        openLeadsCount: 0,
        customerSubmittedCount: 0
    })
    useEffect(() => {
        if (isFocused && selectedLocation && isPersonaCRMBusinessAdmin()) {
            const dataToSet = {
                myLeadsCount: 0,
                openLeadsCount: 0,
                customerSubmittedCount: 0
            }

            const idCondition = ` AND Location_ID_c__c = '${selectedLocation}'`
            const rootQuery = `/services/data/${CommonParam.apiVersion}/query/?q=`
            const currentLocationLeadsCountQuery = `SELECT COUNT() FROM Lead__x  WHERE  Status__c ='Negotiate' AND Lead_Type_c__c != 'Change of Ownership' ${idCondition}`
            const openLeadsLengthQuery = `SELECT COUNT() FROM Lead__x  WHERE Status__c ='Open' ${idCondition}`
            const customerSubmittedCountQuery = `SELECT COUNT() FROM Lead__x  WHERE Status__c ='Negotiate' AND Lead_Type_c__c != 'Change of Ownership' AND COF_Triggered_c__c=true ${idCondition}`
            setIsLoading(true)
            compositeCommonCall(
                [
                    {
                        method: 'GET',
                        url: `${rootQuery}${currentLocationLeadsCountQuery}`,
                        referenceId: 'count1'
                    },
                    {
                        method: 'GET',
                        url: `${rootQuery}${openLeadsLengthQuery}`,
                        referenceId: 'count2'
                    },
                    {
                        method: 'GET',
                        url: `${rootQuery}${customerSubmittedCountQuery}`,
                        referenceId: 'count3'
                    }
                ],
                { allOrNone: false }
            )
                .then((res) => {
                    const countResult = res.data.compositeResponse
                    dataToSet.myLeadsCount = countResult[0]?.body?.totalSize
                    dataToSet.openLeadsCount = countResult[1]?.body?.totalSize
                    dataToSet.customerSubmittedCount = countResult[2]?.body?.totalSize
                })
                .catch((err) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'useTopKpiCRMManagerData',
                        `Get Top Count failed: ${ErrorUtils.error2String(err)}`
                    )
                })
                .finally(() => {
                    setIsLoading(false)
                    setTopKpiCRMManagerData(dataToSet)
                })
        }
    }, [selectedLocation, isFocused])
    return topKpiCRMManagerData
}

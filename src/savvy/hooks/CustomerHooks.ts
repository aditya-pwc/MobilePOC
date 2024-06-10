/**
 * @description Hooks for the customer/retailstore.
 * @author Shangmin Dou
 */
import { SetStateAction, useEffect, useMemo, useState } from 'react'
import { SoupService } from '../service/SoupService'
import { database } from '../common/SmartSql'
import { formatString, getRecordTypeId, getRecordTypeIdByDeveloperName } from '../utils/CommonUtils'
import { compositeQueryObjsBySoql, restDataCommonCall, syncDownObj } from '../api/SyncUtils'
import { useRecordsPagination } from './CommonHooks'
import TaskQueries from '../queries/TaskQueries'
import {
    genCustomerActivityDetailCompositeGroup,
    genCustomerActivityUserDataCompositeGroup,
    genRepContactDetailsCompositeGroup
} from '../api/composite-template/CustomerCompositeTemplate'
import { getAllFieldsByObjName } from '../utils/SyncUtils'
import { getPriorityIdsFromStorePriority, refreshInnovationProduct } from '../utils/InnovationProductUtils'
import _ from 'lodash'
import moment from 'moment'
import { Log } from '../../common/enums/Log'
import { CommonParam } from '../../common/CommonParam'
import {
    isPersonaCRMBusinessAdmin,
    isPersonaFSROrFSMOrCRM,
    isPersonaPSR,
    isPersonaUGMOrSDL,
    judgePersona,
    Persona
} from '../../common/enums/Persona'
import { retrieveEquipmentAssets, retrieveEquipRequest } from './EquipmentHooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { updateSurveyDataAction } from '../redux/action/EquipmentSurveyActionType'
import { t } from '../../common/i18n/t'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { getLocationData } from '../components/manager/helper/MerchManagerHelper'
import { BooleanStr } from '../enums/Manager'
import { getCTRBaseQuery } from '../helper/rep/InnovationProductHelper'
import { updatePepsiDirectOrder } from '../redux/action/CustomerActionType'
import { getStringValue } from '../utils/LandingUtils'
import { replaceQuotesToWildcard } from '../utils/RepUtils'
import { storeClassLog } from '../../common/utils/LogUtils'
import { exeAsyncFunc } from '../../common/utils/CommonUtils'
import CustomerListQueries from '../queries/CustomerListQueries'
import { Dispatch, AnyAction } from '@reduxjs/toolkit'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { setPepsicoCalendar } from '../redux/action/ContractAction'
import { getPepsiCoPeriodCalendar } from '../components/merchandiser/MyPerformance'
import { useDispatch } from 'react-redux'
import dayjs from 'dayjs'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { updateCustomerDetail } from '../redux/Slice/CustomerDetailSlice'

export const useFetchCustomersFromBackend = (searchValue: string) => {
    const [customers, setCustomers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const controller = new AbortController()
    useEffect(() => {
        if (
            _.isFinite(Number(searchValue)) &&
            searchValue?.length >= 4 && // Asset number is at least 4 digits
            judgePersona([Persona.FSR, Persona.KEY_ACCOUNT_MANAGER])
        ) {
            setIsLoading(true)
            restDataCommonCall(
                `query/?q=SELECT ${CustomerListQueries.getCustomerList.fields.join(
                    ','
                )} FROM RetailStore WHERE AccountId IN (SELECT AccountId From Asset WHERE ident_asset_num__c = '${searchValue}') AND AccountId IN (SELECT AccountId FROM AccountTeamMember WHERE UserId='${
                    CommonParam.userId
                }') AND Account.IS_ACTIVE__c=true`,
                'GET',
                { signal: controller.signal }
            )
                .then((res) => {
                    setCustomers(res?.data?.records || [])
                    setIsLoading(false)
                })
                .catch((e) => {
                    setCustomers([])
                    setIsLoading(false)
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'Rep-fetchCustomersFromBackend',
                        `search customers from backend failed: ${getStringValue(e)}`
                    )
                })
        } else {
            setCustomers([])
            setIsLoading(false)
        }
        return () => {
            controller.abort()
        }
    }, [searchValue])

    return { customers, isLoading }
}

export const useCustomers = (
    isFocused: boolean,
    isLoading: boolean,
    filterQuery: string,
    sortValue: string,
    searchValue: string,
    myCustomerQuery: string,
    refreshTimes: number
) => {
    const fsrCondition = () => {
        return `AND {RetailStore:AccountId} IN (SELECT {AccountTeamMember:AccountId} FROM {AccountTeamMember} WHERE 
        {AccountTeamMember:UserId}='${CommonParam.userId}') `
    }
    const fsmCondition = () => {
        return `AND {RetailStore:AccountId} IN (SELECT {AccountTeamMember:AccountId} FROM {AccountTeamMember} WHERE 
        {AccountTeamMember:UserId} IN (SELECT {User_Stats__c:User__c} FROM {User_Stats__c} WHERE 
        {User_Stats__c:manager__c} = '${CommonParam.userId}' AND {User_Stats__c:relationship_active__c} IS TRUE 
         AND {User_Stats__c:RecordTypeId} IN (SELECT {RecordType:Id} FROM {RecordType} 
         WHERE {RecordType:DeveloperName} = 'Manager_Relationship' AND {RecordType:SobjectType} = 'User_Stats__c')))`
    }
    const psrCondition = () => {
        return `AND {RetailStore:AccountId} IN ${getCTRBaseQuery()} `
    }
    const condition = useMemo(() => {
        switch (CommonParam.PERSONA__c) {
            case Persona.FSR:
                return fsrCondition()
            case Persona.PSR:
                return psrCondition() + filterQuery
            case Persona.FS_MANAGER:
                return fsmCondition()
            default:
                return fsrCondition()
        }
    }, [CommonParam.userId, CommonParam.userRouteId, filterQuery])
    const psrSort = () => {
        return `ORDER BY {RetailStore:Name} COLLATE NOCASE ${sortValue || 'ASC'} NULLS LAST`
    }
    const sort = useMemo(() => {
        switch (CommonParam.PERSONA__c) {
            case Persona.FSR:
            case Persona.FS_MANAGER:
                return CustomerListQueries.getCustomerList.fsrSort
            case Persona.PSR:
                return psrSort()
            default:
                return CustomerListQueries.getCustomerList.fsrSort
        }
    }, [sortValue])
    const searchCondition = useMemo(() => {
        const searchText = replaceQuotesToWildcard(searchValue)
        return searchValue
            ? `AND ({RetailStore:Name} LIKE '%${searchText}%' ` +
                  `OR {RetailStore:Account.CUST_UNIQ_ID_VAL__c} LIKE '%${searchText}%' ` +
                  `OR {RetailStore:Street} LIKE '%${searchText}%' ` +
                  `OR {RetailStore:State} LIKE '%${searchText}%' ` +
                  `OR {RetailStore:Country} LIKE '%${searchText}%' ` +
                  `OR {RetailStore:PostalCode} LIKE '%${searchText}%' ` +
                  `OR {RetailStore:City} LIKE '%${searchText}%' ` +
                  `OR {RetailStore:Account.RTLR_STOR_NUM__c} LIKE '%${searchText}%') `
            : ''
    }, [searchValue])
    const query = useMemo(() => {
        return myCustomerQuery || CustomerListQueries.getCustomerList.query + condition + searchCondition + sort
    }, [condition, sort, psrSort, searchCondition, myCustomerQuery])
    const { records, setOffset } = useRecordsPagination(
        isFocused,
        isLoading,
        CustomerListQueries.getCustomerList.fields,
        query,
        'RetailStore',
        refreshTimes
    )
    const backendResult = useFetchCustomersFromBackend(searchValue)
    return {
        customers: _.unionBy(backendResult.customers, records, 'Id'),
        setOffset,
        isBackendSearchLoading: backendResult.isLoading
    }
}
export const useCustomerDetailTabs = (customerDetail: any) => {
    const initTabs = () => {
        if (CommonParam.PERSONA__c === Persona.PSR || CommonParam.PERSONA__c === Persona.KEY_ACCOUNT_MANAGER) {
            return [
                {
                    name: t.labels.PBNA_MOBILE_SALES_ACTIONS.toUpperCase(),
                    value: 'SALES ACTIONS',
                    dot: false
                },
                {
                    name: t.labels.PBNA_MOBILE_SALES_SNAPSHOT.toUpperCase(),
                    value: 'SALES SNAPSHOT',
                    dot: false
                },
                {
                    name: t.labels.PBNA_MOBILE_MY_STORE.toUpperCase(),
                    value: 'MY STORE',
                    dot: false
                },
                {
                    name: t.labels.PBNA_MOBILE_ACTIVITIES.toUpperCase(),
                    value: 'ACTIVITIES',
                    dot: false
                },

                {
                    name: t.labels.PBNA_MOBILE_EQUIPMENT.toUpperCase(),
                    value: 'EQUIPMENT',
                    dot: false
                },
                {
                    name: t.labels.PBNA_MOBILE_CONTACTS.toUpperCase(),
                    value: 'CONTACTS',
                    dot: false
                },
                {
                    name: t.labels.PBNA_MOBILE_PROFILE.toUpperCase(),
                    value: 'PROFILE',
                    dot: false
                }
            ]
        } else if (isPersonaUGMOrSDL()) {
            return [
                {
                    name: t.labels.PBNA_MOBILE_SALES_SNAPSHOT.toUpperCase(),
                    value: 'SALES SNAPSHOT',
                    dot: false
                },
                {
                    name: t.labels.PBNA_MOBILE_SALES_ACTIONS.toUpperCase(),
                    value: 'SALES ACTIONS',
                    dot: false
                },
                {
                    name: t.labels.PBNA_MOBILE_MY_STORE.toUpperCase(),
                    value: 'MY STORE',
                    dot: false
                },
                {
                    name: t.labels.PBNA_MOBILE_ACTIVITIES.toUpperCase(),
                    value: 'ACTIVITIES',
                    dot: false
                },
                {
                    name: t.labels.PBNA_MOBILE_EQUIPMENT.toUpperCase(),
                    value: 'EQUIPMENT',
                    dot: false
                },
                {
                    name: t.labels.PBNA_MOBILE_CONTACTS.toUpperCase(),
                    value: 'CONTACTS',
                    dot: false
                },
                {
                    name: t.labels.PBNA_MOBILE_PROFILE.toUpperCase(),
                    value: 'PROFILE',
                    dot: false
                }
            ]
        }
        return [
            {
                name: t.labels.PBNA_MOBILE_SALES_SNAPSHOT.toUpperCase(),
                value: 'SALES SNAPSHOT',
                dot: false
            },
            {
                name: t.labels.PBNA_MOBILE_MY_STORE.toUpperCase(),
                value: 'MY STORE',
                dot: false
            },
            {
                name: t.labels.PBNA_MOBILE_ACTIVITIES.toUpperCase(),
                value: 'ACTIVITIES',
                dot: false
            },
            {
                name: t.labels.PBNA_MOBILE_EQUIPMENT.toUpperCase(),
                value: 'EQUIPMENT',
                dot: false
            },
            {
                name: t.labels.PBNA_MOBILE_CONTACTS.toUpperCase(),
                value: 'CONTACTS',
                dot: false
            },
            {
                name: t.labels.PBNA_MOBILE_PROFILE.toUpperCase(),
                value: 'PROFILE',
                dot: false
            }
        ]
    }
    const [tabs, setTabs] = useState<any[]>([])
    useEffect(() => {
        const tabsClone = _.cloneDeep(initTabs())
        if ((customerDetail && customerDetail['Account.BUSN_SGMNTTN_LVL_3_CDV__c'] === '003') || isPersonaPSR()) {
            tabsClone.push({
                name: t.labels.PBNA_MOBILE_POS.toUpperCase(),
                value: 'POS',
                dot: false
            })
        }
        const activitiesIndex = tabsClone.findIndex((tab) => tab.value === 'EQUIPMENT')
        if (activitiesIndex !== -1) {
            tabsClone.splice(activitiesIndex + 1, 0, {
                name: t.labels.PBNA_MOBILE_CONTRACT_AUDIT.toUpperCase(),
                value: 'CONTRACT',
                dot: false
            })
        }
        setTabs(tabsClone)
    }, [customerDetail])
    return { tabs }
}
export const useCustomerDetail = (
    customer: any,
    refreshFlag: number,
    dispatch?: Dispatch<any>,
    retailStoreDetail?: any
) => {
    const initCustomerDetail = () => {
        return {
            Id: null,
            'Account.change_initiated__c': null,
            Name: null,
            'Account.Phone': null,
            'Account.Merchandising_Delivery_Days__c': null,
            'Account.Merchandising_Order_Days__c': null,
            'Account.IsOTSCustomer__c': null,
            'Account.BUSN_SGMNTTN_LVL_3_CDV__c': null,
            City: null,
            AccountId: null,
            Country: null,
            Latitude: null,
            Longitude: null,
            PostalCode: null,
            State: null,
            Street: null,
            Customer_Latitude__c: null,
            Customer_Longitude__c: null,
            LOC_PROD_ID__c: null,
            CUST_UNIQ_ID_VAL__c: null,
            __local__: null,
            __locally_created__: null,
            __locally_deleted__: null,
            __locally_updated__: null,
            _soupEntryId: null,
            COF_Triggered_c__c: '0',
            attributes: { type: 'Account' },
            Go_Kart_Flag__c: null,
            ...customer
        }
    }
    const [customerDetail, setCustomerDetail] = useState(initCustomerDetail())
    useEffect(() => {
        if (
            customer._soupEntryId !== undefined ||
            customer.Id !== undefined ||
            customer.AccountId !== undefined ||
            customer.accountId !== undefined
        ) {
            database()
                .use('RetailStore')
                .select()
                .where([
                    {
                        leftTable: 'RetailStore',
                        leftField: '_soupEntryId',
                        rightField: customer._soupEntryId || "'a'",
                        operator: '='
                    },
                    {
                        type: 'OR',
                        leftTable: 'RetailStore',
                        leftField: 'Id',
                        rightField: "'" + (customer.Id || '123') + "'",
                        operator: '='
                    },
                    {
                        type: 'OR',
                        leftTable: 'RetailStore',
                        leftField: 'AccountId',
                        rightField: "'" + (customer.AccountId || '123') + "'",
                        operator: '='
                    }
                ])
                .getData()
                .then((res) => {
                    if (res.length) {
                        const updateCustomerDetailData = retailStoreDetail
                            ? { ...res[0], ...retailStoreDetail }
                            : res[0]
                        setCustomerDetail(updateCustomerDetailData)
                        dispatch && dispatch(updateCustomerDetail(updateCustomerDetailData))
                    }
                })
        }
    }, [refreshFlag, retailStoreDetail])
    return customerDetail
}

export const useKeyAccount = (searchV) => {
    const [keyAccount, setKeyAccount] = useState([])
    useEffect(() => {
        SoupService.retrieveDataFromSoup(
            'Account',
            {},
            ['Id', 'Name'],
            'SELECT {Account:Id},{Account:Name} from {Account} ' +
                "WHERE {Account:CUST_LVL__c} = 'Key Account' AND " +
                `{Account:Name} LIKE '%${searchV}%'`
        ).then((res) => {
            setKeyAccount(res)
        })
    }, [searchV])
    return keyAccount
}

export const useVisit = (id, isLoading, refreshFlag) => {
    const [deliveryDetailList, setDeliveryDetailList] = useState([])
    const [preSellDetailList, setPreSellDetailList] = useState([])
    const [merDetailList, setMerDetailList] = useState([])

    useEffect(() => {
        SoupService.retrieveDataFromSoup('Visit', {}, [], '', [
            `WHERE {Visit:PlaceId} = '${id}' AND {Visit:RecordType.Name} = 'Sales' AND  {Visit:Status__c} != 'Planned' AND {Visit:Status__c} != 'Removed' AND {Visit:Status__c} != 'Pre-Processed' AND {Visit:Status__c} != 'Failed'` +
                'ORDER BY {Visit:PlannedVisitStartTime} DESC NULLS LAST'
        ]).then((res) => {
            setPreSellDetailList(res)
        })
        SoupService.retrieveDataFromSoup('Visit', {}, [], '', [
            `WHERE {Visit:PlaceId} = '${id}' AND {Visit:RecordType.Name} = 'Merchandising' AND  {Visit:Status__c} != 'Planned' AND {Visit:Status__c} != 'Removed' AND {Visit:Status__c} != 'Pre-Processed' AND {Visit:Status__c} != 'Failed'` +
                'ORDER BY {Visit:PlannedVisitStartTime} DESC NULLS LAST'
        ]).then((res) => {
            setMerDetailList(res)
        })
        SoupService.retrieveDataFromSoup('Visit', {}, [], '', [
            `WHERE {Visit:PlaceId} = '${id}' AND {Visit:RecordType.Name} = 'Delivery' AND  {Visit:Status__c} != 'Planned' AND {Visit:Status__c} != 'Removed' AND {Visit:Status__c} != 'Pre-Processed' AND {Visit:Status__c} != 'Failed'` +
                'ORDER BY {Visit:PlannedVisitStartTime} DESC NULLS LAST'
        ]).then((res) => {
            setDeliveryDetailList(res)
        })
    }, [id, isLoading, refreshFlag])

    return {
        deliveryDetailList,
        preSellDetailList,
        merDetailList
    }
}

export const useShipment = (id, isLoading, refreshFlag) => {
    const [shipmentData, setShipmentData] = useState([])
    useEffect(() => {
        SoupService.retrieveDataFromSoup('Shipment', {}, [], '', [
            `WHERE {Shipment:Retail_Store__c} = '${id}' AND {Shipment:Status} != 'Cancelled' AND {Shipment:Status} != 'Rescheduled'`
        ]).then((res) => {
            setShipmentData(res)
        })
    }, [id, isLoading, refreshFlag])
    return shipmentData
}
export const useTasks = (id: string, isLoading, refreshFlag) => {
    const [historyTaskList, setHistoryTaskList] = useState([
        {
            ActivityDate: null,
            COF_Requested_Date__c: null,
            Call_Date__c: null,
            Call_Details__c: null,
            Call_Details2__c: null,
            Call_Details3__c: null,
            Call_Subject__c: null,
            Contact_Made__c: null,
            CreatedDate: null,
            Description: null,
            Id: null,
            Lead__c: null,
            Name_of_Contact__c: null,
            Onsite__c: null,
            OwnerId: null,
            RecordTypeId: null,
            Status: null,
            Subject: null,
            Type: null,
            'CreatedBy.GPID__c': null,
            Hotshot__c: null
        }
    ])
    const [openTaskList, setOpenTaskList] = useState([])
    const [latestCofRequestedDate, setLatestCofRequestedDate] = useState('')
    const hisField = TaskQueries.getHistoryTaskByWhatIdQuery.f
    const hisQuery = TaskQueries.getHistoryTaskByWhatIdQuery.q
    const openField = TaskQueries.getOpenTaskByWhatIdQuery.f
    const openQuery = TaskQueries.getOpenTaskByWhatIdQuery.q
    useEffect(() => {
        getRecordTypeId('Customer Activity', 'Task')
            .then((recordTypeId) => {
                SoupService.retrieveDataFromSoup('Task', {}, hisField, formatString(hisQuery, [id, recordTypeId])).then(
                    (res) => {
                        setLatestCofRequestedDate('')
                        const temp = res.map((v) => {
                            return {
                                ...v,
                                Call_Details__c: `${v.Call_Details__c || ''}${v.Call_Details2__c || ''}${
                                    v.Call_Details3__c || ''
                                }`
                            }
                        })
                        setHistoryTaskList(temp)
                        if (temp.length > 0) {
                            for (const task of temp) {
                                if (task.Subject === 'Customer Requested') {
                                    setLatestCofRequestedDate(task.COF_Requested_Date__c)
                                    break
                                }
                            }
                        }
                    }
                )
                SoupService.retrieveDataFromSoup('Task', {}, openField, formatString(openQuery, [id])).then((res) => {
                    const temp = res.map((v) => {
                        return {
                            ...v,
                            Call_Details__c: `${v.Call_Details__c || ''}${v.Call_Details2__c || ''}${
                                v.Call_Details3__c || ''
                            }`
                        }
                    })
                    setOpenTaskList(temp)
                })
            })
            .catch((e) => {
                storeClassLog(Log.MOBILE_ERROR, 'Rep-useTask', 'retrieve task error:' + getStringValue(e))
            })
    }, [id, isLoading, refreshFlag])
    return {
        openTaskList,
        historyTaskList,
        latestCofRequestedDate
    }
}

export const useOrder = (id, isLoading, refreshFlag) => {
    const [OrderData, setOrderData] = useState([])
    useEffect(() => {
        SoupService.retrieveDataFromSoup('Order', {}, [], '', [`WHERE {Order:RetailStore__c} = '${id}'`]).then(
            (res) => {
                setOrderData(res)
            }
        )
    }, [id, isLoading, refreshFlag])
    return OrderData
}

export const usePepsiDirectOrder = (
    custId: string,
    isLoading: boolean,
    refreshFlag: number,
    dispatch: Dispatch<any>
) => {
    useEffect(() => {
        if (custId) {
            restDataCommonCall(
                `query/?q=SELECT EffectiveDate, Id, Sls_Mthd_Descr__c FROM Order WHERE Account.Cust_ID__c = '${custId}' ` +
                    "and Sls_Mthd_Descr__c = 'Pepsi Direct' ORDER BY EffectiveDate DESC",
                'GET'
            )
                .then((res) => {
                    dispatch(updatePepsiDirectOrder(res?.data?.records))
                })
                .catch((e) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'retrieve Pepsi Direct Order failed',
                        `retrieve Pepsi Direct Order failed:` + ErrorUtils.error2String(e)
                    )
                })
        }
    }, [custId, isLoading, refreshFlag])
}

export const useCustomerActivity = (customerDetail: any, isLoading: boolean, refreshFlag: number) => {
    const { deliveryDetailList, preSellDetailList, merDetailList } = useVisit(
        customerDetail?.Id,
        isLoading,
        refreshFlag
    )
    const { historyTaskList, openTaskList } = useTasks(customerDetail?.AccountId, isLoading, refreshFlag)
    const orderData = useOrder(customerDetail?.Id, isLoading, refreshFlag)
    const shipmentData = useShipment(customerDetail?.Id, isLoading, refreshFlag)
    const [deliveryList, setDeliveryList] = useState([])

    useEffect(() => {
        const tempList = _.cloneDeep(deliveryDetailList)
        tempList.forEach((deliveryValue: any) => {
            let palletCount = 0
            let totalOrdered = 0
            orderData.forEach((orderValue: any) => {
                if (
                    moment(deliveryValue.Planned_Date__c).diff(
                        moment(orderValue?.Dlvry_Rqstd_Dtm__c?.slice(0, 10)),
                        'days'
                    ) === 0
                ) {
                    palletCount =
                        palletCount + parseInt(orderValue?.Pallet_Total_IntCount__c || orderValue?.Pallet_Count__c || 0)
                    totalOrdered = totalOrdered + parseInt(orderValue?.Total_Ordered_IntCount__c || 0)
                    _.assign(deliveryValue, {
                        Pallet_Count__c: palletCount.toString(),
                        TotalOrdered: totalOrdered.toString()
                    })
                }
            })
        })
        setDeliveryList(tempList)
    }, [orderData, deliveryDetailList, refreshFlag])

    return {
        preSellDetailList,
        merDetailList,
        shipmentData,
        historyTaskList,
        openTaskList,
        deliveryList
    }
}

export const useCustomerInvoice = () => {
    useEffect(() => {}, [])
}

export const getProfile = (key) => {
    const profileMap = {
        PSR: 'Sales Representative',
        FSR: 'Food Service Representative',
        Merchandiser: 'Merchandiser'
    }
    return (key && profileMap[key]) || ''
}

const getWorkingStatus = (v) => {
    if (v === '1') {
        return true
    } else if (v === '0') {
        return false
    }
    return false
}
const getMerchandiserList = (list) => {
    return _.map(list, (item) => {
        const { Id, Name, MobilePhone, Title, FirstName, LastName, userStatsId } = item
        return {
            Id,
            phone: MobilePhone,
            Name: Name,
            title: Title,
            ftFlag: item.FT_EMPLYE_FLG_VAL__c,
            startTime: item.Start_Time__c,
            firstName: FirstName,
            lastName: LastName,
            workingStatus: [
                {
                    label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_SUNDAY,
                    attend: getWorkingStatus(item.Sunday__c)
                },
                {
                    label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_MONDAY,
                    attend: getWorkingStatus(item.Monday__c)
                },
                {
                    label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_TUESDAY,
                    attend: getWorkingStatus(item.Tuesday__c)
                },
                {
                    label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_WEDNESDAY,
                    attend: getWorkingStatus(item.Wednesday__c)
                },
                {
                    label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_THURSDAY,
                    attend: getWorkingStatus(item.Thursday__c)
                },
                {
                    label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_FRIDAY,
                    attend: getWorkingStatus(item.Friday__c)
                },
                {
                    label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_SATURDAY,
                    attend: getWorkingStatus(item.Saturday__c)
                }
            ],
            PERSONA_DESC: getProfile(item.PERSONA__c),
            userStatsId: userStatsId
        }
    })
}
const getSalesList = (list) => {
    return _.map(list, (item) => {
        const { Id, Name, MobilePhone, Title, FirstName, LastName } = item
        return {
            Id,
            phone: MobilePhone,
            Name: Name,
            title: Title,
            ftFlag: item.FT_EMPLYE_FLG_VAL__c,
            startTime: item.Start_Time__c,
            firstName: FirstName,
            lastName: LastName,
            PERSONA_DESC: getProfile(item.PERSONA__c),
            GTMU_RTE_ID__c: item.GTMU_RTE_ID__c,
            LOCL_RTE_ID__c: item.LOCL_RTE_ID__c,
            userStatsId: item.userStatsId
        }
    })
}

export const useInternalContacts = (
    accountId: string,
    isLoading: boolean,
    refreshFlag,
    searchValue?: string,
    isOnline?: boolean
) => {
    const [contacts, setContacts] = useState([])

    const getInternalContacts = async () => {
        const merchFields = [
            'Id',
            'PERSONA__c',
            'Name',
            'FT_EMPLYE_FLG_VAL__c',
            'MobilePhone',
            'Title',
            'userStatsId',
            'Start_Time__c',
            'Sunday__c',
            'Monday__c',
            'Tuesday__c',
            'Wednesday__c',
            'Thursday__c',
            'Friday__c',
            'Saturday__c'
        ]
        const merchQuery =
            'SELECT {User:Id},{User:PERSONA__c},{User:Name},{User:FT_EMPLYE_FLG_VAL__c},{User:MobilePhone},{User:Title},' +
            '{User_Stats__c:Id},{User_Stats__c:Start_Time__c},' +
            '{User_Stats__c:Sunday__c},{User_Stats__c:Monday__c},' +
            '{User_Stats__c:Tuesday__c},{User_Stats__c:Wednesday__c},' +
            '{User_Stats__c:Thursday__c},{User_Stats__c:Friday__c},{User_Stats__c:Saturday__c}' +
            " FROM {User} LEFT JOIN (SELECT * FROM {User_Stats__c} WHERE {User_Stats__c:RecordTypeId} = '%s') ON " +
            '{User:Id} = {User_Stats__c:User__c} ' +
            'WHERE {User:Id} IN (SELECT {Service_Detail__c:OwnerId} FROM {Service_Detail__c} WHERE ' +
            '{Service_Detail__c:Customer_to_Route__c} IN (SELECT {Customer_to_Route__c:Id} FROM {Customer_to_Route__c} WHERE ' +
            `{Customer_to_Route__c:Customer__c} = '${accountId}') AND {Service_Detail__c:IsRemoved__c} = '0' ` +
            "GROUP BY {Service_Detail__c:OwnerId}) AND {User:PERSONA__c}='Merchandiser' AND {User:IsActive} IS TRUE"
        const repFields = [
            'Id',
            'PERSONA__c',
            'Name',
            'FT_EMPLYE_FLG_VAL__c',
            'MobilePhone',
            'Title',
            'userStatsId',
            'Start_Time__c',
            'Sunday__c',
            'Monday__c',
            'Tuesday__c',
            'Wednesday__c',
            'Thursday__c',
            'Friday__c',
            'Saturday__c',
            'LOCL_RTE_ID__c',
            'GTMU_RTE_ID__c',
            'Route__c',
            'User__c'
        ]
        const repQuery =
            'SELECT {User:Id},{User:PERSONA__c},{User:Name},{User:FT_EMPLYE_FLG_VAL__c},{User:MobilePhone},{User:Title},' +
            '{User_Stats__c:Id},{User_Stats__c:Start_Time__c},' +
            '{User_Stats__c:Sunday__c},{User_Stats__c:Monday__c},' +
            '{User_Stats__c:Tuesday__c},{User_Stats__c:Wednesday__c},' +
            '{User_Stats__c:Thursday__c},{User_Stats__c:Friday__c},{User_Stats__c:Saturday__c},' +
            '{Route_Sales_Geo__c:LOCL_RTE_ID__c},{Route_Sales_Geo__c:GTMU_RTE_ID__c},' +
            '{Employee_To_Route__c:Route__c},{Employee_To_Route__c:User__c}' +
            " FROM {User} LEFT JOIN (SELECT * FROM {User_Stats__c} WHERE {User_Stats__c:RecordTypeId} = '%s') ON " +
            '{User:Id} = {User_Stats__c:User__c} ' +
            'LEFT JOIN (SELECT {Employee_To_Route__c:Route__c},{Employee_To_Route__c:User__c} ' +
            'FROM {Employee_To_Route__c} ' +
            'WHERE {Employee_To_Route__c:Route__c} IN (' +
            'SELECT {Customer_to_Route__c:Route__c} ' +
            'FROM {Customer_to_Route__c} ' +
            "WHERE {Customer_to_Route__c:ACTV_FLG__c}='1' " +
            `AND {Customer_to_Route__c:Customer__c}='${accountId}') ` +
            'GROUP BY {Employee_To_Route__c:User__c}' +
            ') ON {User:Id} = {Employee_To_Route__c:User__c}  ' +
            'LEFT JOIN {Route_Sales_Geo__c} ON {Route_Sales_Geo__c:Id} = {Employee_To_Route__c:Route__c} ' +
            'WHERE {User:Id} IN ' +
            `(SELECT {AccountTeamMember:UserId} FROM {AccountTeamMember} WHERE {AccountTeamMember:AccountId}='${accountId}')` +
            " AND ({User:PERSONA__c}='PSR' OR {User:PERSONA__c}='FSR' OR {User:PERSONA__c}='Key Account Manager') AND {User:IsActive} IS TRUE"
        const statsId = await getRecordTypeIdByDeveloperName('Stats', 'User_Stats__c')
        return await Promise.all([
            SoupService.retrieveDataFromSoup(
                'User',
                {},
                merchFields,
                formatString(merchQuery, [statsId]) +
                    (searchValue ? ` AND {User:Name} like '%${searchValue}%' COLLATE NOCASE` : '')
            ),
            SoupService.retrieveDataFromSoup(
                'User',
                {},
                repFields,
                formatString(repQuery, [statsId]) +
                    (searchValue ? ` AND {User:Name} like '%${searchValue}%' COLLATE NOCASE` : '')
            )
        ])
    }

    useEffect(() => {
        getInternalContacts()
            .then((resArr) => {
                const [rawMerchandiserList, rawSaleList] = resArr
                const list1 = rawSaleList
                const merchandiserList = getMerchandiserList(rawMerchandiserList) || []
                const psrList = []
                const fsrList = []
                getSalesList(list1) &&
                    getSalesList(list1).length &&
                    getSalesList(list1).forEach((element) => {
                        if (element && element.PERSONA_DESC === 'Sales Representative') {
                            psrList.push(element)
                        }
                        if (element && element.PERSONA_DESC === 'Food Service Representative') {
                            fsrList.push(element)
                        }
                    })
                const internalList = [...psrList, ...merchandiserList, ...fsrList]
                if (_.isEmpty(internalList)) {
                    internalList.push({})
                }
                setContacts(internalList)
            })
            .catch((e) => {
                setContacts([{}])
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'getInternalContacts',
                    `refresh internal contact list:` + ErrorUtils.error2String(e)
                )
            })
    }, [accountId, isLoading, refreshFlag, searchValue, isOnline])
    return contacts
}

const retrieveRepContact = async (accountId: string) => {
    await syncDownObj(
        'AccountTeamMember',
        `SELECT ${getAllFieldsByObjName(
            'AccountTeamMember'
        ).join()} FROM AccountTeamMember WHERE AccountId='${accountId}'`
    )
    await compositeQueryObjsBySoql(genRepContactDetailsCompositeGroup(accountId))
}

const retrieveMerchContact = async (accountId: string) => {
    const customerList = await syncDownObj(
        'Customer_to_Route__c',
        `SELECT ${getAllFieldsByObjName('Customer_to_Route__c').join()} FROM Customer_to_Route__c WHERE` +
            ` Customer__c = '${accountId}'`
    )
    const customerIdList = []
    customerList.data?.forEach((v) => {
        customerIdList.push(`'${v.Id}'`)
    })
    if (!_.isEmpty(customerIdList)) {
        const serviceList = await syncDownObj(
            'Service_Detail__c',
            `SELECT ${getAllFieldsByObjName('Service_Detail__c').join()} FROM Service_Detail__c WHERE ` +
                `Customer_to_Route__c IN (${customerIdList.join(',')}) AND IsRemoved__c = false`
        )
        const serviceIdList = []
        serviceList.data?.forEach((v) => {
            serviceIdList.push(`'${v.OwnerId}'`)
        })
        if (!_.isEmpty(serviceIdList)) {
            const userList = await syncDownObj(
                'User',
                `SELECT ${getAllFieldsByObjName('User').join()} FROM User WHERE Id ` + `IN (${serviceIdList.join(',')})`
            )
            const userIdList = []
            userList.data?.forEach((v) => {
                userIdList.push(`'${v.Id}'`)
            })
            if (!_.isEmpty(userIdList)) {
                await syncDownObj(
                    'User_Stats__c',
                    `SELECT ${getAllFieldsByObjName('User_Stats__c').join()} ` +
                        `FROM User_Stats__c WHERE User__c IN (${userIdList.join(',')})`
                )
            }
        }
    }
}

export const retrieveInternalContact = async (accountId: string) => {
    if (!_.isEmpty(accountId)) {
        await retrieveMerchContact(accountId)
        await retrieveRepContact(accountId)
    }
}

export const retrieveCustomerActivityDetail = async (accountId) => {
    const { data } = await compositeQueryObjsBySoql(genCustomerActivityDetailCompositeGroup(accountId))
    const visitData = data?.[2]
    const visitsList = visitData?.body?.records
    const visitorIdList = visitsList
        .filter((visit) => {
            return !_.isEmpty(visit?.VisitorId)
        })
        .map((visit) => visit.VisitorId)
    if (visitData?.referenceId === 'refVisit' && visitorIdList.length > 0) {
        await compositeQueryObjsBySoql(genCustomerActivityUserDataCompositeGroup(visitorIdList.join(`','`)))
    }
}

export const useInitStoreProductData = async (
    retailStoreId: string,
    setRefreshFlag: {
        (value: SetStateAction<number>): void
        (value: SetStateAction<number>): void
        (arg0: (v: number) => number): void
    }
) => {
    const init = async () => {
        await refreshInnovationProduct(retailStoreId)
    }
    useEffect(() => {
        if (!_.isEmpty(retailStoreId)) {
            init().finally(() => {
                setRefreshFlag((v: number) => v + 1)
            })
        }
    }, [retailStoreId])
}

export const useInitCustomerDetail = (
    accountId: string,
    retailStoreId: string,
    setRefreshFlag: {
        (value: SetStateAction<number>): void
        (value: SetStateAction<number>): void
        (arg0: (v: number) => number): void
    },
    setShowInitLoadingIndicator: {
        (value: SetStateAction<boolean>): void
        (value: SetStateAction<boolean>): void
        (arg0: boolean): void
    },
    dispatch: Dispatch<AnyAction>,
    submitChangeOfOwnership: boolean = false
) => {
    const init = async () => {
        Instrumentation.startTimer(`${CommonParam.PERSONA__c} sync down customer details`)
        await exeAsyncFunc(async () => {
            await syncDownObj(
                'Task',
                `SELECT ${getAllFieldsByObjName('Task').join()} ` +
                    `FROM Task WHERE WhatId = '${accountId}' AND RecordType.Name='Customer Activity'`
            )
        })
        if (isPersonaCRMBusinessAdmin()) {
            await exeAsyncFunc(async () => {
                await syncDownObj(
                    'Visit',
                    `SELECT ${getAllFieldsByObjName('Visit').join()} ` +
                        `FROM Visit WHERE PlaceId = '${retailStoreId}'  AND Planned_Date__c>=LAST_N_DAYS:7 AND Status__c != 'Pre-Processed' AND Status__c != 'Removed' AND Status__c != 'Failed'`
                )
            })
        }

        if (judgePersona([Persona.SALES_DISTRICT_LEADER, Persona.UNIT_GENERAL_MANAGER, Persona.KEY_ACCOUNT_MANAGER])) {
            // sync down Account
            await exeAsyncFunc(async () => {
                await syncDownObj(
                    'Account',
                    `SELECT ${getAllFieldsByObjName('Account').join()} ` + `FROM Account WHERE Id = '${accountId}'`
                )
            })
        }
        if (
            judgePersona([
                Persona.SALES_DISTRICT_LEADER,
                Persona.UNIT_GENERAL_MANAGER,
                Persona.KEY_ACCOUNT_MANAGER,
                Persona.PSR
            ])
        ) {
            // sync down Executional_Framework__c
            await exeAsyncFunc(async () => {
                await getPriorityIdsFromStorePriority(retailStoreId)
            })
        }
        if (isPersonaCRMBusinessAdmin()) {
            await exeAsyncFunc(async () => {
                await syncDownObj(
                    'Visit',
                    `SELECT ${getAllFieldsByObjName('Visit').join()} ` +
                        `FROM Visit WHERE PlaceId = '${retailStoreId}'  AND Planned_Date__c>=LAST_N_DAYS:7 AND Status__c != 'Pre-Processed' AND Status__c != 'Removed' AND Status__c != 'Failed'`
                )
            })
        }

        await exeAsyncFunc(async () => {
            await syncDownObj(
                'Contact',
                `SELECT ${getAllFieldsByObjName('Contact').join()} ` + `FROM Contact WHERE AccountId = '${accountId}'`
            )
        })
        await exeAsyncFunc(async () => {
            await syncDownObj(
                'Customer_to_Route__c',
                `SELECT ${getAllFieldsByObjName('Customer_to_Route__c').join()} ` +
                    `FROM Customer_to_Route__c WHERE Customer__c = '${accountId}' AND RecordType.Name = 'CTR' AND ACTV_FLG__c = True AND Merch_flag__c = False`
            )
        })
        await exeAsyncFunc(async () => {
            await syncDownObj(
                'Employee_To_Route__c',
                `SELECT ${getAllFieldsByObjName('Employee_To_Route__c').join()} ` +
                    'FROM Employee_To_Route__c WHERE User__r.Name != null AND Active_Flag__c = true AND Route__c IN ' +
                    `(SELECT Route__c FROM Customer_to_Route__c WHERE Customer__c = '${accountId}' 
                AND RecordType.Name = 'CTR' AND ACTV_FLG__c = True AND Merch_flag__c = False)`
            )
        })
        await exeAsyncFunc(async () => {
            await retrieveEquipmentAssets(accountId)
        })
        await exeAsyncFunc(async () => {
            await retrieveInternalContact(accountId)
        })
        await exeAsyncFunc(async () => {
            await retrieveEquipRequest(accountId)
        })
        await exeAsyncFunc(async () => {
            await retrieveCustomerActivityDetail(accountId)
        })
        await exeAsyncFunc(async () => {
            await syncDownObj(
                'Order',
                `SELECT ${getAllFieldsByObjName('Order').join()} ` +
                    `FROM Order WHERE RetailStore__c='${retailStoreId}' AND Order_ATC_Type__c = 'Normal'`
            )
        })
        await exeAsyncFunc(async () => {
            await syncDownObj(
                'Shipment',
                `SELECT ${getAllFieldsByObjName('Shipment').join()} ` +
                    `FROM Shipment WHERE Retail_Store__c='${retailStoreId}'`
            )
        })
        await exeAsyncFunc(async () => {
            const surveyData = JSON.parse(await AsyncStorage.getItem('equipment_survey_data'))
            if (surveyData) {
                dispatch && dispatch(updateSurveyDataAction(surveyData))
            }
        })

        Instrumentation.stopTimer(`${CommonParam.PERSONA__c} sync down customer details`)
    }

    useEffect(() => {
        if (!_.isEmpty(accountId) && !_.isEmpty(retailStoreId)) {
            setShowInitLoadingIndicator(true)
            init().finally(() => {
                setShowInitLoadingIndicator(false)
                setRefreshFlag((v: number) => v + 1)
            })
        }
    }, [accountId, retailStoreId, submitChangeOfOwnership])
}

export const syncDownVisitDetail = async (data) => {
    const queryRetailStore =
        `SELECT ${getAllFieldsByObjName('RetailStore').join()} FROM RetailStore ` + `WHERE Id = '${data.PlaceId}'`
    const queryUserStats =
        `SELECT ${getAllFieldsByObjName('User_Stats__c').join()} FROM User_Stats__c ` + "WHERE User__c = '%s'"
    const queryUser = `SELECT ${getAllFieldsByObjName('User').join()} FROM User WHERE ` + "Id = '%s'"
    const lstRetailStore = await syncDownObj('RetailStore', queryRetailStore)
    if (lstRetailStore.data[0]?.Account.Sales_Route__c) {
        const queryRoute =
            `SELECT ${getAllFieldsByObjName('Route_Sales_Geo__c').join()} FROM Route_Sales_Geo__c ` +
            `WHERE Id = '${lstRetailStore.data[0]?.Account.Sales_Route__c}'`
        await syncDownObj('Route_Sales_Geo__c', queryRoute)
    }
    if (lstRetailStore.data[0]?.Account.Sales_Rep__c) {
        await syncDownObj('User', formatString(queryUser, [lstRetailStore.data[0]?.Account.Sales_Rep__c]))
        await syncDownObj('User_Stats__c', formatString(queryUserStats, [lstRetailStore.data[0]?.Account.Sales_Rep__c]))
    }
    const visitorId = data.VisitorId || data.OwnerId
    if (visitorId) {
        await syncDownObj('User', formatString(queryUser, [visitorId]))
        await syncDownObj('User_Stats__c', formatString(queryUserStats, [visitorId]))
        const queryTimestamps =
            `SELECT ${getAllFieldsByObjName('Breadcrumb_Timestamps__c').join()} FROM ` +
            `Breadcrumb_Timestamps__c WHERE Customer__c = '${data.PlaceId}' AND User__c = '${visitorId}'` +
            'ORDER BY Time__c ASC'
        await syncDownObj('Breadcrumb_Timestamps__c', queryTimestamps)
    }
    if (data.Visit_List__c) {
        const queryVisitList =
            `SELECT ${getAllFieldsByObjName('Visit_List__c').join()} FROM Visit_List__c ` +
            `WHERE Id='${data.Visit_List__c}'`
        await syncDownObj('Visit_List__c', queryVisitList)
    }
    if (data.Visit_Subtype__c === 'Delivery Visit') {
        const queryOrderItem =
            `SELECT ${getAllFieldsByObjName('OrderItem').join()} FROM OrderItem ` +
            'WHERE Order.Dlvry_Rqstd_Dtm__c >= LAST_WEEK AND Order.Dlvry_Rqstd_Dtm__c <= NEXT_N_WEEKS:2 ' +
            `AND Order.Visit__c='${data.Id}' AND Order.Order_ATC_Type__c = 'Normal'`
        const queryShipmentItem =
            'SELECT Id,Product2Id,ShipmentId,Shipment.ActualDeliveryDate,Shipment.Retail_Store__c,Delivered_Quantity__c,Shipment.Order_Id__c  FROM ShipmentItem ' +
            'WHERE ((Shipment.ExpectedDeliveryDate >= LAST_WEEK AND Shipment.ExpectedDeliveryDate <= NEXT_N_WEEKS:2)' +
            'OR (Shipment.ActualDeliveryDate >= LAST_WEEK AND Shipment.ActualDeliveryDate <= NEXT_N_WEEKS:2))' +
            "AND Activity_Code__c = 'DEL'" +
            `AND Shipment.Visit__c='${data.Id}'`
        await syncDownObj('OrderItem', queryOrderItem)
        await syncDownObj('ShipmentItem', queryShipmentItem)
    }
}

export const useLocationLevelGoCart = () => {
    const [goCartFlag, setGoCartFlag] = useState(false)
    useEffect(() => {
        getRecordTypeIdByDeveloperName('Sales_Unit', 'Route_Sales_Geo__c').then((recordTypeId) => {
            getLocationData(recordTypeId).then((res) => {
                setGoCartFlag(res[0]?.Go_Kart_Flag__c === BooleanStr.STR_TRUE)
            })
        })
    })
    return goCartFlag
}

export const usePDOrderDetail = (orderId: string) => {
    const [orderDetail, setOrderDetail] = useState<any>({})
    const [lineItems, setLineItems] = useState<any>({})

    useEffect(() => {
        if (orderId) {
            Promise.all([
                restDataCommonCall(
                    'query/?q=SELECT Dlvry_Rqstd_Dtm__c,EffectiveDate,OrderNumber,Ordr_Id__c,TotalAmount,' +
                        `Total_Ordered_IntCount__c FROM Order WHERE Order.Id = '${orderId}'`,
                    'GET'
                ),
                restDataCommonCall(
                    'query/?q=SELECT Product2.package_type_name__c,product2.productcode, ' +
                        'product2.material_unique_id__c, product2.name, Quantity,TotalPrice ' +
                        `FROM OrderItem where order.id = '${orderId}' AND ord_lne_actvy_cde__c != 'RET' and Item_type__c = 'Order Item'`,
                    'GET'
                )
            ])
                .then(([res1, res2]) => {
                    setOrderDetail(res1?.data?.records[0])
                    const rawLineItem = res2?.data?.records
                    const groupedLineItem = _.groupBy(rawLineItem, (v) => {
                        return v.Product2.Package_Type_Name__c
                    })
                    setLineItems(groupedLineItem)
                })
                .catch((e) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'usePDOrderDetail',
                        `retrieve Pepsi Direct Order Detail failed:` + ErrorUtils.error2String(e)
                    )
                })
        }
    }, [orderId])

    return { orderDetail, lineItems }
}

export const useTaskDetail = (showDetail: boolean | undefined, taskId: string | undefined) => {
    const [activity, setActivity] = useState({
        ActivityDate: null,
        COF_Requested_Date__c: null,
        Call_Date__c: null,
        Call_Details__c: null,
        Call_Details2__c: null,
        Call_Details3__c: null,
        Call_Subject__c: null,
        Contact_Made__c: null,
        CreatedDate: null,
        Description: null,
        Id: null,
        Lead__c: null,
        Name_of_Contact__c: null,
        Onsite__c: null,
        OwnerId: null,
        RecordTypeId: null,
        Status: null,
        Subject: null,
        Type: null,
        'CreatedBy.GPID__c': null,
        Hotshot__c: null
    })
    const [showActivityDetail, setShowActivityDetail] = useState(false)

    useEffect(() => {
        if (showDetail && taskId) {
            const taskQuery = TaskQueries.getTaskByOwnerIdQuery.q + ` AND {Task:Id} = '${taskId}' `
            SoupService.retrieveDataFromSoup(
                'Task',
                {},
                TaskQueries.getTaskByOwnerIdQuery.f,
                formatString(taskQuery, [CommonParam.userId])
            ).then((res: any) => {
                const temp = _.cloneDeep(res[0])
                temp.Call_Details__c = `${temp.Call_Details__c || ''}${temp.Call_Details2__c || ''}${
                    temp.Call_Details3__c || ''
                }`
                setActivity(temp)
                setShowActivityDetail(true)
            })
        }
    }, [showDetail, taskId])

    return { activity, showActivityDetail, setActivity, setShowActivityDetail }
}

export const usePepsiCoPeriodCalendar = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        getPepsiCoPeriodCalendar().then((result: any) => {
            dispatch(setPepsicoCalendar(result))
        })
    }, [])
}

export const useCustomerTileDelivery = (id: string, refreshFlag: number, isLoading: boolean) => {
    const [upcomingDelivery, setUpcomingDelivery] = useState({ upcomingCount: 0, completeCount: 0 })

    const query =
        'SELECT {Visit:Id}, {Visit:PlannedVisitStartTime}, {Visit:ActualVisitStartTime}, {Visit:Status__c} FROM {Visit} ' +
        `WHERE {Visit:PlaceId} = '${id}' AND {Visit:RecordType.Name} = 'Delivery' AND  {Visit:Status__c} != 'Planned' ` +
        `AND {Visit:Status__c} != 'Removed' AND {Visit:Status__c} != 'Pre-Processed' AND {Visit:Status__c} != 'Failed' AND (` +
        `CASE
            WHEN {Visit:ActualVisitStartTime} IS NOT NULL THEN (
            {Visit:ActualVisitStartTime} >= '${dayjs().startOf('day').utc().format(TIME_FORMAT.YMDTHMSZZ)}'
            AND {Visit:ActualVisitStartTime} <= '${dayjs().endOf('day').utc().format(TIME_FORMAT.YMDTHMSZZ)}')
            WHEN {Visit:ActualVisitStartTime} IS NULL
            AND {Visit:PlannedVisitStartTime} IS NOT NULL THEN (
            {Visit:PlannedVisitStartTime} >= '${dayjs().startOf('day').utc().format(TIME_FORMAT.YMDTHMSZZ)}'
            AND {Visit:PlannedVisitStartTime} <= '${dayjs().endOf('day').utc().format(TIME_FORMAT.YMDTHMSZZ)}')
            ELSE 0
        END)`

    const fetchData = async () => {
        try {
            const res = await SoupService.retrieveDataFromSoup(
                'Visit',
                {},
                ['Id', 'PlannedVisitStartTime', 'ActualVisitStartTime', 'Status__c'],
                query
            )
            if (res.length > 0) {
                setUpcomingDelivery({
                    upcomingCount: res.length,
                    completeCount: res.filter((item) => item.Status__c === 'Complete').length
                })
            } else {
                setUpcomingDelivery({ upcomingCount: 0, completeCount: 0 })
            }
        } catch (err) {
            storeClassLog(Log.MOBILE_ERROR, 'Rep-useCustomerTileDelivery', ErrorUtils.error2String(err))
        }
    }

    useEffect(() => {
        if (id && isPersonaFSROrFSMOrCRM()) {
            fetchData()
        }
    }, [id, refreshFlag, isLoading])

    return upcomingDelivery
}

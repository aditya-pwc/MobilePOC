/**
 * @description Utils for filter lead and customer
 * @author Sheng Huang
 * @date 2021/10/29
 */
import _ from 'lodash'
import { CommonParam } from '../../common/CommonParam'
import moment from 'moment'
import { isPersonaCRMBusinessAdmin, isPersonaFSManager } from '../../common/enums/Persona'
import { t } from '../../common/i18n/t'
import {
    getCancelRepairRequestCustomerFilter,
    getCancelRequestCustomerFilter,
    getRepairRequestCustomerFilter,
    getRequestCustomerFilter
} from '../hooks/EquipmentHooks'
import { Dispatch, SetStateAction } from 'react'
import { restApexCommonCall, syncDownObjByIds } from '../api/SyncUtils'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import dayjs from 'dayjs'

export interface FilterValue {
    fieldName: string
    value: string
    params?: string
    operator?: string
    complex?: boolean
    inActive?: boolean
    label?: string
}

export interface SortValue {
    title: string
    fieldName: string
    order: string
    value: string
    complex?: boolean
    label?: string
}

export interface LeadFilter {
    leads: Array<FilterValue>
    preQualified: Array<FilterValue>
    leadStatus: Array<FilterValue>
    customerNumber: Array<FilterValue>
    leadType: Array<FilterValue>
    suggestedFSRoute: Array<FilterValue>
    tier: Array<FilterValue>
    scheduledTasks: Array<FilterValue>
}

export interface CustomerFilter {
    customerCreatedDate: Array<FilterValue>
    nationalFlag: Array<FilterValue>
    keyAccount: Array<FilterValue>
    scheduledTasks: Array<FilterValue>
    deliveryTimeframes: Array<FilterValue>
}

export interface RequestFilter {
    request: Array<FilterValue>
    requestCancel: Array<FilterValue>
}

export interface BusinessSegmentFilter {
    businessSegment: Array<FilterValue>
}

export interface EmployeesFilter {
    employees: Array<FilterValue & { GPID?: string }>
}

export interface CityZipFilter {
    city: Array<FilterValue>
    zip: Array<FilterValue>
}

export interface SortCustomerList {
    title: string
    button1: SortValue
    button2: SortValue
}

export type FilterObject =
    | LeadFilter
    | CustomerFilter
    | RequestFilter
    | BusinessSegmentFilter
    | EmployeesFilter
    | CityZipFilter

export type FilterGroupName = keyof (LeadFilter &
    CustomerFilter &
    RequestFilter &
    BusinessSegmentFilter &
    EmployeesFilter &
    CityZipFilter)

export type FilterOptions = {
    label: string
    groupName: FilterGroupName
    value: FilterValue
}
export type SegmentOption = {
    CHANNEL_CODE: Array<any>
    SEGMENT_CODE: Array<any>
    SUB_SEGMENT_CODE: Array<any>
}

export const leadFilterObj: LeadFilter = {
    leads: [],
    preQualified: [],
    leadStatus: [],
    customerNumber: [],
    leadType: [],
    suggestedFSRoute: [],
    tier: [],
    scheduledTasks: []
}

export const customerFilterObj: CustomerFilter = {
    customerCreatedDate: [],
    nationalFlag: [],
    keyAccount: [],
    scheduledTasks: [],
    deliveryTimeframes: []
}
export const requestFilterObj: RequestFilter = {
    request: [],
    requestCancel: []
}

export const businessSegmentFilterObj: BusinessSegmentFilter = {
    businessSegment: []
}

export const employeesFilterObj: EmployeesFilter = {
    employees: []
}

export const cityZipFilterObj: CityZipFilter = {
    city: [],
    zip: []
}

export const setFilterText = (
    groupName: FilterGroupName,
    value: FilterValue,
    filterList: FilterObject,
    setFilterList: Dispatch<SetStateAction<FilterObject>>
) => {
    const filter = _.cloneDeep(filterList)
    filter[groupName] = [value]
    setFilterList(filter)
}

export const getFilterText = (groupName: FilterGroupName, fieldName: string, filterList: FilterObject) => {
    const filter = _.cloneDeep(filterList)
    return _.find(filter[groupName], { fieldName: fieldName })?.value?.replace(/(^%%)|(%%$)/g, '') || ''
}

export const getFilterLabel = (groupName: FilterGroupName, fieldName: string, filterList: FilterObject) => {
    const filter = _.cloneDeep(filterList)
    return _.find(filter[groupName], { fieldName: fieldName })?.label || ''
}

export const setFilterSelected = (
    groupName: FilterGroupName,
    v: FilterValue,
    filterList: FilterObject,
    setFilterList: Dispatch<SetStateAction<FilterObject>>
) => {
    const filter = _.cloneDeep(filterList)
    const index = filter[groupName]?.findIndex((value) => {
        return _.isEqual(v.value, value.value) && _.isEqual(v.fieldName, value.fieldName)
    })
    if (index === -1) {
        filter[groupName]?.push(v)
    } else if (index === undefined) {
        Object.assign(filter, { [groupName]: [v] })
    } else {
        filter[groupName]?.splice(index, 1)
    }
    setFilterList(filter)
}

export const setFilterListSelected = (
    groupName: FilterGroupName,
    v: Array<FilterValue>,
    filterList: FilterObject,
    setFilterList: Dispatch<SetStateAction<FilterObject>>,
    originFilterList?: FilterObject
) => {
    const filter = originFilterList ? _.cloneDeep(originFilterList) : _.cloneDeep(filterList)
    v.forEach((item) => {
        const index = filter[groupName]?.findIndex((value) => {
            return _.isEqual(item, value)
        })
        if (index === -1) {
            filter[groupName]?.push(item)
        } else if (index === undefined) {
            Object.assign(filter, { [groupName]: [item] })
        } else {
            filter[groupName]?.push(item)
        }
    })
    setFilterList(filter)
}

export const getFilterSelected = (groupName: FilterGroupName, v: FilterValue, filterList: FilterObject) => {
    const filter = _.cloneDeep(filterList)
    const result = filter[groupName]?.findIndex((value) => {
        return _.isEqual(v.value, value.value) && _.isEqual(v.fieldName, value.fieldName)
    })
    return result !== -1 && result !== undefined
}

export const setSort = (title, button, weight, sortList, setSortList) => {
    const sort = _.cloneDeep(sortList)
    sort[weight] = {
        fieldName: button.fieldName,
        label: button.label || `${title} ${button.title}`,
        order: button.order,
        complex: button.complex,
        value: button.value
    }
    setSortList(sort)
}

export const getSort = (weight, sortList) => {
    return sortList[weight]
}

export const getSortSelected = (fieldName, order, sortList) => {
    for (const v of sortList) {
        if (v.fieldName === fieldName) {
            if (v.order === order) {
                return true
            }
        }
    }
    return false
}
export const getFilterQuery = (filter: FilterObject, query, formName) => {
    const queryList = []
    _.keys(filter).forEach((k) => {
        const tempList = []
        filter[k].forEach((v) => {
            if (!v.inActive) {
                if (v.complex) {
                    tempList.push(`(${v.params})`)
                } else {
                    tempList.push(`({${formName}:${v.fieldName}} ${v.operator || '='} '${v.value}' ${v.params || ''})`)
                }
            }
        })
        if (tempList.length !== 0) {
            queryList.push(`(${_.join(tempList, ' OR ')})`)
        }
    })
    if (_.isEmpty(queryList)) {
        return query
    }
    return `${query}AND ${_.join(queryList, ' AND ')}`
}

export const getSortQuery = (sort, formName) => {
    const sortList = []
    sort.forEach((v) => {
        if (v.complex) {
            sortList.push(`${v.order}`)
        } else {
            sortList.push(`{${formName}:${v.fieldName}} ${v.order}`)
        }
    })
    return `ORDER BY ${_.join(sortList, ', ')}`
}

const processFilterTextForBackend = (value) => {
    if (value) {
        value = value.replace(/(^%%)|(%%$)/g, '')
    }
    return value
}

export const changeBusSegNameToCde = (
    busSegNameList: BusinessSegmentFilter,
    segmentOption: SegmentOption,
    type?: 'Lead' | 'Customer'
) => {
    busSegNameList.businessSegment.forEach((value) => {
        if (type) {
            value.fieldName = type === 'Lead' ? 'BUSN_SGMNTTN_LVL_2_CDV_c__c' : 'Account.BUSN_SGMNTTN_LVL_2_CDV__c'
        }
        value.value =
            _.findKey(segmentOption?.SEGMENT_CODE, (v) => {
                return v === value.value
            }) || ''
    })
}

export const assembleLeadFilterForBackend = (
    leadFilter: LeadFilter,
    leadSort: Array<SortValue>,
    busSegFilter: BusinessSegmentFilter,
    cityZipFilter: CityZipFilter,
    employeesFilter: EmployeesFilter,
    showAllLeads: boolean,
    segmentOption: SegmentOption
) => {
    const allLead: boolean =
        _.isEqual(leadFilter, leadFilterObj) &&
        _.isEqual(busSegFilter, businessSegmentFilterObj) &&
        _.isEqual(cityZipFilter, cityZipFilterObj) &&
        _.isEmpty(leadSort)
    const tempLeadFilter = showAllLeads ? _.cloneDeep(leadFilter) : leadFilterObj
    changeBusSegNameToCde(busSegFilter, segmentOption)
    return {
        employee: employeesFilter.employees.map((v) => {
            return v.value
        }),
        filter: {
            isAllLead: allLead,
            lead: {
                preQualified: tempLeadFilter.preQualified[0]?.value
                    ? tempLeadFilter.preQualified[0]?.value === '1'
                    : tempLeadFilter.preQualified[0]?.value,
                leadStatus: tempLeadFilter.leadStatus.map((v) => {
                    return v.value
                }),
                tier: tempLeadFilter.tier.map((v) => {
                    return v.value
                }),
                customerNumber: tempLeadFilter.customerNumber.map((v) => {
                    return v.fieldName
                }),
                leadType: tempLeadFilter.leadType.map((v) => {
                    return v.value
                }),
                scheduledTasks: tempLeadFilter.scheduledTasks[0]?.value
            },
            businessSegment: busSegFilter.businessSegment.map((v) => {
                return v.value
            }),
            city: processFilterTextForBackend(cityZipFilter.city[0]?.value),
            zip: processFilterTextForBackend(cityZipFilter.zip[0]?.value)
        },
        sortOrder: {
            lead: leadSort.map((v) => {
                return { order: v.value, fieldName: v.fieldName }
            })
        }
    }
}

export const getFilteredSortedLeadFromBackend = async (body) => {
    return await restApexCommonCall('getleadinfoforcrm', 'POST', body)
}

export const sortCRMMapLead = (idList, data) => {
    const records = []
    const idListGroups = _.chunk(idList, 200)
    const dataGroups = _.chunk(data, 200)
    idListGroups.forEach((ids, groupIndex) => {
        ids.forEach((id) => {
            const tempData = _.remove(dataGroups[groupIndex], (item) => {
                // @ts-ignore
                return item.Id === id
            })
            records.push(tempData)
        })
    })
    return _.flatten(records)
}

export const retrieveCRMFilteredSortedLead = async (idList) => {
    return await syncDownObjByIds(
        'Lead__x',
        [
            'Id',
            'ExternalId',
            'Lead_Latitude_c__c',
            'Lead_Longitude_c__c',
            'Pre_qualified_c__c',
            'Tier_c__c',
            'Company__c',
            'PD_Contact_Made_Counter_c__c',
            'PD_Call_Counter_c__c',
            'COF_Rejected_c__c',
            'Contact_Made_Counter_c__c',
            'Deferred_Resume_Date_c__c',
            'Status__c',
            'Phone__c',
            'Call_Counter_c__c',
            'Owner_GPID_c__c',
            'City__c',
            'Country__c',
            'Street__c',
            'State__c',
            'Last_Task_Modified_Date_c__c',
            'PostalCode__c',
            'COF_Triggered_c__c'
        ],
        idList,
        false,
        false
    )
}

export const assembleCustomerFilterForBackend = (
    customerFilter: CustomerFilter,
    customerSort: Array<SortValue>,
    busSegFilter: BusinessSegmentFilter,
    cityZipFilter: CityZipFilter,
    employeesFilter: EmployeesFilter,
    requestFilter: RequestFilter,
    showAllCustomer: boolean,
    segmentOption: SegmentOption
) => {
    const allCustomer: boolean =
        _.isEqual(customerFilter, customerFilterObj) &&
        _.isEqual(busSegFilter, businessSegmentFilterObj) &&
        _.isEqual(cityZipFilter, cityZipFilterObj) &&
        _.isEqual(requestFilter, requestFilterObj) &&
        _.isEmpty(customerSort)
    const tempCustomerFilter = showAllCustomer ? _.cloneDeep(customerFilter) : customerFilterObj
    // process change of ownership under scheduled tasks
    let changeOfOwnership = null
    if (tempCustomerFilter.scheduledTasks[0]?.fieldName === 'Account.change_initiated__c') {
        changeOfOwnership = true
        tempCustomerFilter.scheduledTasks = []
    }
    changeBusSegNameToCde(busSegFilter, segmentOption)
    return {
        employee: employeesFilter.employees.map((v) => {
            return v.value
        }),
        filter: {
            isAllCustomer: allCustomer,
            customer: {
                customerCreatedDate: tempCustomerFilter.customerCreatedDate[0]?.value,
                openEquipmentRequests: requestFilter.request.map((v) => {
                    return v.value
                }),
                cancelledEquipmentRequests: requestFilter.requestCancel.map((v) => {
                    return v.value
                }),
                nationalFlag: tempCustomerFilter.nationalFlag[0]?.value
                    ? tempCustomerFilter.nationalFlag[0]?.value === '1'
                    : tempCustomerFilter.nationalFlag[0]?.value,
                keyAccount: tempCustomerFilter.keyAccount[0]?.value,
                scheduledTasks: tempCustomerFilter.scheduledTasks[0]?.value,
                deliveryTimeframes: tempCustomerFilter?.deliveryTimeframes[0]?.value,
                changeOfOwnershipFlag: changeOfOwnership
            },
            businessSegment: busSegFilter.businessSegment.map((v) => {
                return v.value
            }),
            city: processFilterTextForBackend(cityZipFilter.city[0]?.value),
            zip: processFilterTextForBackend(cityZipFilter.zip[0]?.value)
        },
        sortOrder: {
            customer: customerSort.map((v) => {
                return { order: v.value, fieldName: v.fieldName }
            })
        }
    }
}

export const getFilteredSortedCustomerFromBackend = async (body) => {
    return await restApexCommonCall('getcustomerinfo', 'POST', body)
}

export const getLeadSortList = (isAllLead, isMap?) => {
    return _.compact([
        {
            title: t.labels.PBNA_MOBILE_NAME,
            button1: {
                title: t.labels.PBNA_MOBILE_A_Z,
                order: 'COLLATE NOCASE ASC',
                fieldName: 'Company__c',
                value: 'ASC'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_Z_A,
                order: 'COLLATE NOCASE DESC',
                fieldName: 'Company__c',
                value: 'DESC'
            }
        },
        (isAllLead || isMap) && {
            title: t.labels.PBNA_MOBILE_LEAD_TIER,
            button1: {
                title: '1 - 3',
                order: 'ASC NULLS LAST',
                fieldName: 'Tier_c__c',
                value: 'ASC'
            },
            button2: {
                title: '3 - 1',
                order: 'DESC NULLS LAST',
                fieldName: 'Tier_c__c',
                value: 'DESC'
            }
        },
        {
            title: t.labels.PBNA_MOBILE_CREATE_DATE,
            button1: {
                title: t.labels.PBNA_MOBILE_OLD_NEW,
                order: 'ASC NULLS LAST',
                fieldName: 'CreatedDate__c',
                value: 'ASC'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_NEW_OLD,
                order: 'DESC NULLS LAST',
                fieldName: 'CreatedDate__c',
                value: 'DESC'
            }
        },
        {
            title: t.labels.PBNA_MOBILE_LAST_MODIFIED,
            button1: {
                title: t.labels.PBNA_MOBILE_OLD_NEW,
                order: 'ASC NULLS LAST',
                fieldName: 'Last_Task_Modified_Date_c__c',
                value: 'ASC'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_NEW_OLD,
                order: 'DESC NULLS LAST',
                fieldName: 'Last_Task_Modified_Date_c__c',
                value: 'DESC'
            }
        },
        {
            title: t.labels.PBNA_MOBILE_CALL_COUNT,
            button1: {
                title: t.labels.PBNA_MOBILE_SORT_HIGH_LOW,
                order: 'DESC NULLS LAST',
                fieldName: 'Call_Counter_c__c',
                value: 'DESC'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_SORT_LOW_HIGH,
                order: 'ASC NULLS LAST',
                fieldName: 'Call_Counter_c__c',
                value: 'ASC'
            }
        },
        !isAllLead &&
            !isMap && {
                title: t.labels.PBNA_MOBILE_CUSTOMER_NUMBER,
                button1: {
                    title: t.labels.PBNA_MOBILE_SUBMITTED,
                    order: 'DESC NULLS LAST',
                    fieldName: 'COF_Triggered_c__c',
                    label: 'Customer Request Submitted',
                    value: 'DESC'
                },
                button2: {
                    title: t.labels.PBNA_MOBILE_REJECTED,
                    order: 'DESC NULLS LAST',
                    fieldName: 'COF_Rejected_c__c',
                    label: 'Customer Request Rejected',
                    value: 'DESC'
                }
            },
        {
            title: t.labels.PBNA_MOBILE_PRE_QUALIFIED_DATE,
            button1: {
                title: t.labels.PBNA_MOBILE_OLD_NEW,
                order: 'ASC NULLS LAST',
                fieldName: 'Pre_Qualified_Time_c__c',
                value: 'ASC'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_NEW_OLD,
                order: 'DESC NULLS LAST',
                fieldName: 'Pre_Qualified_Time_c__c',
                value: 'DESC'
            }
        },
        !isPersonaCRMBusinessAdmin() && {
            title: t.labels.PBNA_MOBILE_DISTANCE,
            button1: {
                title: t.labels.PBNA_MOBILE_NEAR_FAR,
                order: 'Distance ASC NULLS LAST',
                fieldName: 'Distance',
                complex: true,
                value: 'ASC'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_FAR_NEAR,
                order: 'Distance DESC NULLS LAST',
                fieldName: 'Distance',
                complex: true,
                value: 'DESC'
            }
        }
    ])
}

export const getPreQList = (): Array<FilterOptions> => {
    return [
        {
            label: t.labels.PBNA_MOBILE_VIEW_ONLY_PRE_QUALIFIED_LEADS,
            groupName: 'preQualified',
            value: {
                fieldName: 'Pre_qualified_c__c',
                value: '1'
            }
        }
    ]
}

export const getLeadList = (): Array<FilterOptions> => {
    if (!isPersonaFSManager() && !isPersonaCRMBusinessAdmin()) {
        return [
            {
                label: t.labels.PBNA_MOBILE_MY_LEADS,
                groupName: 'leads',
                value: { fieldName: 'Status__c', value: 'MyLeads', inActive: true }
            },
            {
                label: t.labels.PBNA_MOBILE_OPEN_LEADS,
                groupName: 'leads',
                value: { fieldName: 'Status__c', value: 'OpenLeads', inActive: true }
            }
        ]
    }
    return [
        {
            label: t.labels.PBNA_MOBILE_MY_TEAM_LEADS,
            groupName: 'leads',
            value: { fieldName: 'Status__c', value: 'MyTeamLeads', inActive: true }
        },
        {
            label: t.labels.PBNA_MOBILE_OPEN_LEADS,
            groupName: 'leads',
            value: { fieldName: 'Status__c', value: 'OpenLeads', inActive: true }
        }
    ]
}

export const getTierList = (): Array<FilterOptions> => {
    return [
        {
            label: t.labels.PBNA_MOBILE_TIER_1,
            groupName: 'tier',
            value: { fieldName: 'Tier_c__c', value: '1' }
        },
        {
            label: t.labels.PBNA_MOBILE_TIER_2,
            groupName: 'tier',
            value: { fieldName: 'Tier_c__c', value: '2' }
        },
        {
            label: t.labels.PBNA_MOBILE_TIER_3,
            groupName: 'tier',
            value: { fieldName: 'Tier_c__c', value: '3' }
        }
    ]
}

export const getLeadStatusList = (isAllLead, isMap = false): Array<FilterOptions> => {
    const NOT_MY_LEAD = `AND {Lead__x:Owner_GPID_c__c} != '${CommonParam.GPID__c}'`
    const NO_SALE = "AND {Lead__x:Status__c} = 'No Sale'"
    const NEGOTIATE = "AND {Lead__x:Status__c} = 'Negotiate'"
    let params = ''
    if (isAllLead) {
        params = NOT_MY_LEAD
    } else if (isMap) {
        params = NO_SALE
    }
    return _.compact([
        {
            label: t.labels.PBNA_MOBILE_OPEN,
            groupName: 'leadStatus',
            value: { fieldName: 'Status__c', value: 'Open' }
        },
        {
            label: t.labels.PBNA_MOBILE_ASSIGNED,
            groupName: 'leadStatus',
            value: {
                fieldName: 'Lead_Sub_Status_c__c',
                value: 'Assigned',
                params: NEGOTIATE
            }
        },
        {
            label: t.labels.PBNA_MOBILE_DISCOVERY,
            groupName: 'leadStatus',
            value: {
                fieldName: 'Lead_Sub_Status_c__c',
                value: 'Discovery',
                params: NEGOTIATE
            }
        },
        {
            label: t.labels.PBNA_MOBILE_ENGAGE,
            groupName: 'leadStatus',
            value: {
                fieldName: 'Lead_Sub_Status_c__c',
                value: 'Engage',
                params: NEGOTIATE
            }
        },
        {
            label: t.labels.PBNA_MOBILE_NEGOTIATE,
            groupName: 'leadStatus',
            value: {
                fieldName: 'Lead_Sub_Status_c__c',
                value: 'Negotiate',
                params: NEGOTIATE
            }
        },
        {
            label: t.labels.PBNA_MOBILE_DEFERRED,
            groupName: 'leadStatus',
            value: {
                fieldName: 'Lead_Sub_Status_c__c',
                value: 'Deferred',
                params: params
            }
        },
        {
            label: t.labels.PBNA_MOBILE_CORPORATE_DECISION,
            groupName: 'leadStatus',
            value: {
                fieldName: 'Lead_Sub_Status_c__c',
                value: 'Corporate Decision',
                params: params
            }
        },
        {
            label: t.labels.PBNA_MOBILE_PROSPECT_LOST,
            groupName: 'leadStatus',
            value: {
                fieldName: 'Lead_Sub_Status_c__c',
                value: 'Prospect Lost',
                params: params
            }
        },
        {
            label: t.labels.PBNA_MOBILE_UNQUALIFIED_FOR_BUSINESS,
            groupName: 'leadStatus',
            value: {
                fieldName: 'Lead_Sub_Status_c__c',
                value: 'Unqualified for Business',
                params: params
            }
        },
        {
            label: t.labels.PBNA_MOBILE_DUPLICATE_CUSTOMER_FOUND,
            groupName: 'leadStatus',
            value: {
                fieldName: 'Lead_Sub_Status_c__c',
                value: 'Duplicate Customer Found',
                params: params
            }
        },
        !isMap && {
            label: t.labels.PBNA_MOBILE_BUSINESS_WON,
            groupName: 'leadStatus',
            value: {
                fieldName: 'Status__c',
                value: 'Business Won',
                params: params
            }
        },
        {
            label: t.labels.PBNA_MOBILE_BUSINESS_CLOSED,
            groupName: 'leadStatus',
            value: {
                fieldName: 'Lead_Sub_Status_c__c',
                value: 'Business Closed',
                params: params
            }
        }
    ])
}

export const getCustomerNumberList = (): Array<FilterOptions> => {
    return [
        {
            label: t.labels.PBNA_MOBILE_REJECTED,
            groupName: 'customerNumber',
            value: {
                fieldName: 'COF_Rejected_c__c',
                value: '1'
            }
        },
        {
            label: t.labels.PBNA_MOBILE_SUBMITTED,
            groupName: 'customerNumber',
            value: {
                fieldName: 'COF_Triggered_c__c',
                value: '1'
            }
        }
    ]
}

export const getLeadTypeList = (): Array<FilterOptions> => {
    return [
        {
            label: t.labels.PBNA_MOBILE_PRE_OPEN_LABEL,
            groupName: 'leadType',
            value: { fieldName: 'Lead_Type_c__c', value: 'Pre Open' }
        },
        {
            label: t.labels.PBNA_MOBILE_CONVERSION,
            groupName: 'leadType',
            value: { fieldName: 'Lead_Type_c__c', value: 'Conversion' }
        },
        {
            label: t.labels.PBNA_MOBILE_ADDITIONAL_OUTLET,
            groupName: 'leadType',
            value: { fieldName: 'Lead_Type_c__c', value: 'Additional Outlet' }
        },
        {
            label: t.labels.PBNA_MOBILE_REPAIR_ONLY,
            groupName: 'leadType',
            value: { fieldName: 'Lead_Type_c__c', value: 'Repair Only' }
        }
    ]
}

export const getScheduleList = (type: string = 'lead'): Array<FilterOptions> => {
    const joinCondition =
        type === 'lead' ? ' {Task:Lead__c} = {Lead__x:ExternalId} ' : ' {Task:WhatId} = {RetailStore:AccountId} '
    return _.compact([
        {
            label: t.labels.PBNA_MOBILE_SCHEDULE_TASK_ALL,
            groupName: 'scheduledTasks',
            value: {
                complex: true,
                fieldName: 'scheduledTasks',
                value: 'All',
                params: '(SELECT count(*) FROM {Task} WHERE ' + joinCondition + "AND {Task:Status} = 'Open') > 0"
            }
        },
        {
            label: t.labels.PBNA_MOBILE_OVERDUE,
            groupName: 'scheduledTasks',
            value: {
                complex: true,
                fieldName: 'scheduledTasks',
                value: 'Overdue',
                params:
                    '(SELECT count(*) FROM {Task} WHERE ' +
                    joinCondition +
                    `AND {Task:ActivityDate} < '${moment().format(TIME_FORMAT.Y_MM_DD)}' ` +
                    "AND {Task:Status} = 'Open') > 0"
            }
        },
        {
            label: t.labels.PBNA_MOBILE_TODAY,
            groupName: 'scheduledTasks',
            value: {
                complex: true,
                fieldName: 'scheduledTasks',
                value: 'Today',
                params:
                    '(SELECT count(*) FROM {Task} WHERE ' +
                    joinCondition +
                    `AND ({Task:ActivityDate} = '${moment().format(TIME_FORMAT.Y_MM_DD)}' ` +
                    `OR {Task:ActivityDate} < '${moment().format(TIME_FORMAT.Y_MM_DD)}') ` +
                    "AND {Task:Status} = 'Open') > 0"
            }
        },
        {
            label: t.labels.PBNA_MOBILE_TOMORROW,
            groupName: 'scheduledTasks',
            value: {
                complex: true,
                fieldName: 'scheduledTasks',
                value: 'Tomorrow',
                params:
                    '(SELECT count(*) FROM {Task} WHERE ' +
                    joinCondition +
                    'AND ({Task:ActivityDate} = ' +
                    `'${moment().add(1, 'd').format(TIME_FORMAT.Y_MM_DD)}' ` +
                    `OR {Task:ActivityDate} < '${moment().format(TIME_FORMAT.Y_MM_DD)}') ` +
                    "AND {Task:Status} = 'Open') > 0"
            }
        },
        {
            label: t.labels.PBNA_MOBILE_THIS_WEEK,
            groupName: 'scheduledTasks',
            value: {
                complex: true,
                fieldName: 'scheduledTasks',
                value: 'This Week',
                params:
                    '(SELECT count(*) FROM {Task} WHERE ' +
                    joinCondition +
                    `AND (({Task:ActivityDate} >= '${moment().day(0).format(TIME_FORMAT.Y_MM_DD)}' ` +
                    'AND {Task:ActivityDate} <= ' +
                    `'${moment().day(0).add(6, 'd').format(TIME_FORMAT.Y_MM_DD)}') ` +
                    `OR {Task:ActivityDate} < '${moment().format(TIME_FORMAT.Y_MM_DD)}') ` +
                    "AND {Task:Status} = 'Open') > 0"
            }
        },
        {
            label: t.labels.PBNA_MOBILE_NEXT_4_WEEKS,
            groupName: 'scheduledTasks',
            value: {
                complex: true,
                fieldName: 'scheduledTasks',
                value: 'Next 4 Weeks',
                params:
                    '(SELECT count(*) FROM {Task} WHERE ' +
                    joinCondition +
                    'AND (({Task:ActivityDate} >= ' +
                    `'${moment().day(0).add(1, 'w').format(TIME_FORMAT.Y_MM_DD)}' ` +
                    'AND {Task:ActivityDate} <= ' +
                    `'${moment().day(6).add(4, 'w').format(TIME_FORMAT.Y_MM_DD)}') ` +
                    `OR {Task:ActivityDate} < '${moment().format(TIME_FORMAT.Y_MM_DD)}') ` +
                    "AND {Task:Status} = 'Open') > 0"
            }
        },
        type !== 'lead' && {
            label: t.labels.PBNA_MOBILE_CHANGE_OF_OWNERSHIP,
            groupName: 'scheduledTasks',
            value: {
                fieldName: 'Account.change_initiated__c',
                value: '1'
            }
        }
    ])
}

export const getNationalFlagList = (): Array<FilterOptions> => {
    return [
        {
            label: t.labels.PBNA_MOBILE_YES,
            groupName: 'nationalFlag',
            value: {
                fieldName: 'Account.PEPSI_COLA_NATNL_ACCT__c',
                value: '1'
            }
        },
        {
            label: t.labels.PBNA_MOBILE_NO,
            groupName: 'nationalFlag',
            value: {
                fieldName: 'Account.PEPSI_COLA_NATNL_ACCT__c',
                value: '0'
            }
        }
    ]
}
export const getOpenEquipmentRequestsList = async (): Promise<Array<FilterOptions>> => {
    const installRequestCustomer = await getRequestCustomerFilter('Move Request', 'INS')
    const onsiteMoveRequestCustomer = await getRequestCustomerFilter('Move Request', 'ONS')
    const pickupRequestCustomer = await getRequestCustomerFilter('Move Request', 'PIC')
    const exchangeRequestCustomer = await getRequestCustomerFilter('Move Request', 'EXI')
    const repairRequestCustomer = await getRepairRequestCustomerFilter('Service_Request')
    const installRequestAccountId = installRequestCustomer.map((item) => item.customer__c).join("', '")
    const onsiteRequestAccountId = onsiteMoveRequestCustomer.map((item) => item.customer__c).join("', '")
    const pickupRequestAccountId = pickupRequestCustomer.map((item) => item.customer__c).join("', '")
    const exchangeRequestAccountId = exchangeRequestCustomer.map((item) => item.customer__c).join("', '")
    const repairRequestAccountId = repairRequestCustomer.map((item) => item.customer__c).join("', '")
    const tempInstall = `{RetailStore:AccountId} in ('${installRequestAccountId}')`
    const tempOnsiteMove = `{RetailStore:AccountId} in ('${onsiteRequestAccountId}')`
    const tempPickup = `{RetailStore:AccountId} in ('${pickupRequestAccountId}')`
    const tempExchange = `{RetailStore:AccountId} in ('${exchangeRequestAccountId}')`
    const tempRepair = `{RetailStore:AccountId} in ('${repairRequestAccountId}')`
    return _.compact([
        {
            label: t.labels.PBNA_MOBILE_INSTALL,
            groupName: 'request',
            value: {
                value: 'Request',
                fieldName: 'Request',
                complex: true,
                params: tempInstall
            }
        },
        {
            label: t.labels.PBNA_MOBILE_ONSITE_MOVE,
            groupName: 'request',
            value: {
                value: 'OnsiteMove',
                fieldName: 'Request',
                complex: true,
                params: tempOnsiteMove
            }
        },
        {
            label: t.labels.PBNA_MOBILE_PICKUP,
            groupName: 'request',
            value: {
                value: 'Pickup',
                fieldName: 'Request',
                complex: true,
                params: tempPickup
            }
        },
        {
            label: t.labels.PBNA_MOBILE_EXCHANGE,
            groupName: 'request',
            value: {
                value: 'Exchange',
                fieldName: 'Request',
                complex: true,
                params: tempExchange
            }
        },
        {
            label: t.labels.PBNA_MOBILE_REPAIR,
            groupName: 'request',
            value: {
                value: 'Repair',
                fieldName: 'Request',
                complex: true,
                params: tempRepair
            }
        }
    ])
}
export const getCancelEquipmentRequestsList = async (): Promise<Array<FilterOptions>> => {
    const installRequestCustomer = await getCancelRequestCustomerFilter('Move Request Line Item', 'INS')
    const onsiteMoveRequestCustomer = await getCancelRequestCustomerFilter('Move Request Line Item', 'ONS')
    const pickupRequestCustomer = await getCancelRequestCustomerFilter('Move Request Line Item', 'PIC')
    const exchangeRequestCustomer = await getCancelRequestCustomerFilter('Move Request Line Item', 'EXI')
    const repairRequestCustomer = await getCancelRepairRequestCustomerFilter('Service_Request')
    const installRequestAccountId = installRequestCustomer.map((item) => item.customer__c).join("', '")
    const onsiteRequestAccountId = onsiteMoveRequestCustomer.map((item) => item.customer__c).join("', '")
    const pickupRequestAccountId = pickupRequestCustomer.map((item) => item.customer__c).join("', '")
    const exchangeRequestAccountId = exchangeRequestCustomer.map((item) => item.customer__c).join("', '")
    const repairRequestAccountId = repairRequestCustomer.map((item) => item.customer__c).join("', '")
    const tempInstall = `{RetailStore:AccountId} in ('${installRequestAccountId}')`
    const tempOnsiteMove = `{RetailStore:AccountId} in ('${onsiteRequestAccountId}')`
    const tempPickup = `{RetailStore:AccountId} in ('${pickupRequestAccountId}')`
    const tempExchange = `{RetailStore:AccountId} in ('${exchangeRequestAccountId}')`
    const tempRepair = `{RetailStore:AccountId} in ('${repairRequestAccountId}')`
    return _.compact([
        {
            label: t.labels.PBNA_MOBILE_INSTALL,
            groupName: 'requestCancel',
            value: {
                value: 'Request',
                fieldName: 'Request',
                complex: true,
                params: tempInstall
            }
        },
        {
            label: t.labels.PBNA_MOBILE_ONSITE_MOVE,
            groupName: 'requestCancel',
            value: {
                value: 'OnsiteMove',
                fieldName: 'Request',
                complex: true,
                params: tempOnsiteMove
            }
        },
        {
            label: t.labels.PBNA_MOBILE_PICKUP,
            groupName: 'requestCancel',
            value: {
                value: 'Pickup',
                fieldName: 'Request',
                complex: true,
                params: tempPickup
            }
        },
        {
            label: t.labels.PBNA_MOBILE_EXCHANGE,
            groupName: 'requestCancel',
            value: {
                value: 'Exchange',
                fieldName: 'Request',
                complex: true,
                params: tempExchange
            }
        },
        {
            label: t.labels.PBNA_MOBILE_REPAIR,
            groupName: 'requestCancel',
            value: {
                value: 'Repair',
                fieldName: 'Request',
                complex: true,
                params: tempRepair
            }
        }
    ])
}

export const getCustomerCreatedDateMap = () => {
    return {
        1: {
            label: t.labels.PBNA_MOBILE_LAST_30_DAYS,
            fieldName: 'CUST_STRT_DT__c',
            value: 'Last 30 Days',
            complex: true,
            params:
                '{RetailStore:Account.CUST_STRT_DT__c} > ' +
                `'${moment().subtract(30, 'd').format(TIME_FORMAT.Y_MM_DD)}' ` +
                'AND {RetailStore:Account.CUST_STRT_DT__c} <= ' +
                `'${moment().format(TIME_FORMAT.Y_MM_DD)}'`
        },
        2: {
            label: t.labels.PBNA_MOBILE_31_60_DAYS,
            fieldName: 'CUST_STRT_DT__c',
            value: '31-60 Days',
            complex: true,
            params:
                '{RetailStore:Account.CUST_STRT_DT__c} > ' +
                `'${moment().subtract(60, 'd').format(TIME_FORMAT.Y_MM_DD)}' ` +
                'AND {RetailStore:Account.CUST_STRT_DT__c} <= ' +
                `'${moment().subtract(30, 'd').format(TIME_FORMAT.Y_MM_DD)}'`
        },
        3: {
            label: t.labels.PBNA_MOBILE_61_90_DAYS,
            fieldName: 'CUST_STRT_DT__c',
            value: '61-90 Days',
            complex: true,
            params:
                '{RetailStore:Account.CUST_STRT_DT__c} > ' +
                `'${moment().subtract(90, 'd').format(TIME_FORMAT.Y_MM_DD)}' ` +
                'AND {RetailStore:Account.CUST_STRT_DT__c} <= ' +
                `'${moment().subtract(60, 'd').format(TIME_FORMAT.Y_MM_DD)}'`
        },
        4: {
            label: t.labels.PBNA_MOBILE_90_PLUS_DAYS,
            fieldName: 'CUST_STRT_DT__c',
            value: '90+ Days',
            complex: true,
            params:
                '{RetailStore:Account.CUST_STRT_DT__c} <= ' +
                `'${moment().subtract(90, 'd').format(TIME_FORMAT.Y_MM_DD)}'`
        }
    }
}

export const getCustomerDateTextList = () => {
    return [
        `----${t.labels.PBNA_MOBILE_SELECT}----`,
        t.labels.PBNA_MOBILE_LAST_30_DAYS,
        t.labels.PBNA_MOBILE_31_60_DAYS,
        t.labels.PBNA_MOBILE_61_90_DAYS,
        t.labels.PBNA_MOBILE_90_PLUS_DAYS
    ]
}

export const getDeliveryTimeframeList = (): Array<FilterOptions> => {
    return _.compact([
        {
            label: t.labels.PBNA_MOBILE_PREVIOUS_7_DAYS,
            groupName: 'deliveryTimeframes',
            value: {
                complex: true,
                fieldName: 'deliveryTimeframes',
                value: 'Previous 7 Days',
                params: `
                CASE 
                    WHEN {Visit:ActualVisitStartTime} IS NOT NULL THEN (
                    {Visit:ActualVisitStartTime} >= '${dayjs()
                        .subtract(7, 'd')
                        .startOf('day')
                        .utc()
                        .format(TIME_FORMAT.YMDTHMSZZ)}'
                        AND {Visit:ActualVisitStartTime} <= '${dayjs()
                            .subtract(1, 'd')
                            .endOf('day')
                            .utc()
                            .format(TIME_FORMAT.YMDTHMSZZ)}')
                    WHEN {Visit:ActualVisitStartTime} IS NULL AND {Visit:PlannedVisitStartTime} IS NOT NULL THEN (
                    {Visit:PlannedVisitStartTime} >= '${dayjs()
                        .subtract(7, 'd')
                        .startOf('day')
                        .utc()
                        .format(TIME_FORMAT.YMDTHMSZZ)}'
                        AND {Visit:PlannedVisitStartTime} <= '${dayjs()
                            .subtract(1, 'd')
                            .endOf('day')
                            .utc()
                            .format(TIME_FORMAT.YMDTHMSZZ)}')
                    ELSE 0
                END`
            }
        },
        {
            label: t.labels.PBNA_MOBILE_YESTERDAY,
            groupName: 'deliveryTimeframes',
            value: {
                complex: true,
                fieldName: 'deliveryTimeframes',
                value: 'Yesterday',
                params: `
                CASE 
                    WHEN {Visit:ActualVisitStartTime} IS NOT NULL THEN (
                    {Visit:ActualVisitStartTime} >= '${dayjs()
                        .subtract(1, 'd')
                        .startOf('day')
                        .utc()
                        .format(TIME_FORMAT.YMDTHMSZZ)}' 
                        AND {Visit:ActualVisitStartTime} <= '${dayjs()
                            .subtract(1, 'd')
                            .endOf('day')
                            .utc()
                            .format(TIME_FORMAT.YMDTHMSZZ)}')
                    WHEN {Visit:ActualVisitStartTime} IS NULL AND {Visit:PlannedVisitStartTime} IS NOT NULL THEN (
                    {Visit:PlannedVisitStartTime} >= '${dayjs()
                        .subtract(1, 'd')
                        .startOf('day')
                        .utc()
                        .format(TIME_FORMAT.YMDTHMSZZ)}' 
                        AND {Visit:PlannedVisitStartTime} <= '${dayjs()
                            .subtract(1, 'd')
                            .endOf('day')
                            .utc()
                            .format(TIME_FORMAT.YMDTHMSZZ)}')
                    ELSE 0
                END`
            }
        },
        {
            label: t.labels.PBNA_MOBILE_TODAY,
            groupName: 'deliveryTimeframes',
            value: {
                complex: true,
                fieldName: 'deliveryTimeframes',
                value: 'Today',
                params: `
                CASE 
                    WHEN {Visit:ActualVisitStartTime} IS NOT NULL THEN (
                    {Visit:ActualVisitStartTime} >= '${dayjs().startOf('day').utc().format(TIME_FORMAT.YMDTHMSZZ)}' 
                        AND {Visit:ActualVisitStartTime} <= '${dayjs()
                            .endOf('day')
                            .utc()
                            .format(TIME_FORMAT.YMDTHMSZZ)}')
                    WHEN {Visit:ActualVisitStartTime} IS NULL AND {Visit:PlannedVisitStartTime} IS NOT NULL THEN (
                    {Visit:PlannedVisitStartTime} >= '${dayjs().startOf('day').utc().format(TIME_FORMAT.YMDTHMSZZ)}' 
                        AND {Visit:PlannedVisitStartTime} <= '${dayjs()
                            .endOf('day')
                            .utc()
                            .format(TIME_FORMAT.YMDTHMSZZ)}')
                    ELSE 0
                END`
            }
        },
        {
            label: t.labels.PBNA_MOBILE_TOMORROW,
            groupName: 'deliveryTimeframes',
            value: {
                complex: true,
                fieldName: 'deliveryTimeframes',
                value: 'Tomorrow',
                params: `
                CASE 
                    WHEN {Visit:ActualVisitStartTime} IS NOT NULL THEN (
                    {Visit:ActualVisitStartTime} >= '${dayjs()
                        .add(1, 'd')
                        .startOf('day')
                        .utc()
                        .format(TIME_FORMAT.YMDTHMSZZ)}' 
                        AND {Visit:ActualVisitStartTime} <= '${dayjs()
                            .add(1, 'd')
                            .endOf('day')
                            .utc()
                            .format(TIME_FORMAT.YMDTHMSZZ)}')
                    WHEN {Visit:ActualVisitStartTime} IS NULL AND {Visit:PlannedVisitStartTime} IS NOT NULL THEN (
                    {Visit:PlannedVisitStartTime} >= '${dayjs()
                        .add(1, 'd')
                        .startOf('day')
                        .utc()
                        .format(TIME_FORMAT.YMDTHMSZZ)}' 
                        AND {Visit:PlannedVisitStartTime} <= '${dayjs()
                            .add(1, 'd')
                            .endOf('day')
                            .utc()
                            .format(TIME_FORMAT.YMDTHMSZZ)}')
                    ELSE 0
                END`
            }
        },
        {
            label: t.labels.PBNA_MOBILE_THIS_WEEK,
            groupName: 'deliveryTimeframes',
            value: {
                complex: true,
                fieldName: 'deliveryTimeframes',
                value: 'This Week',
                params: `
                CASE 
                    WHEN {Visit:ActualVisitStartTime} IS NOT NULL THEN (
                    {Visit:ActualVisitStartTime} >= '${dayjs()
                        .day(0)
                        .startOf('day')
                        .utc()
                        .format(TIME_FORMAT.YMDTHMSZZ)}'
                        AND {Visit:ActualVisitStartTime} <= '${dayjs()
                            .day(6)
                            .endOf('day')
                            .utc()
                            .format(TIME_FORMAT.YMDTHMSZZ)}')
                    WHEN {Visit:ActualVisitStartTime} IS NULL AND {Visit:PlannedVisitStartTime} IS NOT NULL THEN (
                    {Visit:PlannedVisitStartTime} >= '${dayjs()
                        .day(0)
                        .startOf('day')
                        .utc()
                        .format(TIME_FORMAT.YMDTHMSZZ)}'
                        AND {Visit:PlannedVisitStartTime} <= '${dayjs()
                            .day(6)
                            .endOf('day')
                            .utc()
                            .format(TIME_FORMAT.YMDTHMSZZ)}')
                    ELSE 0
                END`
            }
        }
    ])
}

import { useEffect, useState } from 'react'
import { SoupService } from '../service/SoupService'
import { compositeQueryObjsBySoql, restDataCommonCall, syncDownObj } from '../api/SyncUtils'
import _ from 'lodash'
import { genQueryAllFieldsString, getAllFieldsByObjName } from '../utils/SyncUtils'
import {
    fetchAggregateList,
    fetchBrandings,
    fetchBrandList,
    fetchRecommendedProducts,
    getCommissionStruct
} from '../api/ApexApis'
import { Log } from '../../common/enums/Log'
import CustomerEquipmentQueries from '../queries/CustomerEquipmentQueries'
import { formatString, getRecordTypeId, getRecordTypeIdByDeveloperName } from '../utils/CommonUtils'
import { getEquipmentAssetCompositeGroup } from '../api/composite-template/EquipmentCompositeTemplate'
import { CommonParam } from '../../common/CommonParam'
import CustomerRequestQueries from '../queries/CustomerRequestQueries'
import moment from 'moment'
import { initInstallRequestHeader } from '../utils/EquipmentUtils'
import { t } from '../../common/i18n/t'
import { useDebounce } from './CommonHooks'
import { addZeroes } from '../utils/LeadUtils'
import { getStringValue } from '../utils/LandingUtils'
import { formatWithTimeZone } from '../utils/TimeZoneUtils'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { Persona } from '../../common/enums/Persona'
import { getIdClause } from '../../common/utils/CommonUtils'

export const useEquipmentMovePurposePicklist = (insOrAll?) => {
    const [movePurposePicklist, setMovePurposePicklist] = useState([])
    const [movePurposeMapping, setMovePurposeMapping] = useState({})
    useEffect(() => {
        const q = insOrAll
            ? 'SELECT {Asset_Attribute__c:equip_move_purp_cde__c},{Asset_Attribute__c:equip_move_purp_descr__c} ' +
              "FROM {Asset_Attribute__c} WHERE {Asset_Attribute__c:master_data_type__c} = 'MovePurpose' AND " +
              '{Asset_Attribute__c:active_flag__c} IS TRUE AND {Asset_Attribute__c:equip_move_purp_descr__c} IS NOT NULL'
            : 'SELECT {Asset_Attribute__c:equip_move_purp_cde__c},{Asset_Attribute__c:equip_move_purp_descr__c} ' +
              "FROM {Asset_Attribute__c} WHERE {Asset_Attribute__c:master_data_type__c} = 'MovePurpose' AND {Asset_Attribute__c:equip_move_type_cde__c} = 'INS' AND " +
              '{Asset_Attribute__c:active_flag__c} IS TRUE AND {Asset_Attribute__c:equip_move_purp_descr__c} IS NOT NULL'
        SoupService.retrieveDataFromSoup(
            'Asset_Attribute__c',
            {},
            ['equip_move_purp_cde__c', 'equip_move_purp_descr__c'],
            q
        )
            .then((res) => {
                const mapping = {}
                const picklist = [`-- ${t.labels.PBNA_MOBILE_SELECT_MOVE_PURPOSE} --`].concat(
                    res.map((v) => {
                        mapping[v.equip_move_purp_descr__c] = v.equip_move_purp_cde__c
                        return v.equip_move_purp_descr__c
                    })
                )
                if (picklist.length === 1) {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'Rep-MovePurposePicklist',
                        'Move Purpose Picklist Empty: ' + ErrorUtils.error2String(res)
                    )
                }
                setMovePurposePicklist(picklist)
                setMovePurposeMapping(mapping)
            })
            .catch((error) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'Rep-useEquipmentMovePurposePicklist',
                    'use Move Purpose Error: ' + error
                )
            })
    }, [])
    return {
        movePurposePicklist,
        movePurposeMapping
    }
}

export const useExistingAccessoryRequests = (parentRequestId: string, clearTimes: number, showModal?: boolean) => {
    const [accessoryRequests, setAccessoryRequests] = useState([])
    useEffect(() => {
        if (parentRequestId) {
            SoupService.retrieveDataFromSoup(
                'Request__c',
                {},
                ['Id', 'std_attr_cde__c'],
                'SELECT {Request__c:Id},{Request__c:std_attr_cde__c},{Request__c:_soupEntryId} FROM {Request__c}' +
                    ` WHERE {Request__c:parent_request_record__c}='${parentRequestId}' ` +
                    "AND {Request__c:request_subtype__c}='Move Request Accessory'"
            ).then((res) => {
                if (res.length > 0) {
                    setAccessoryRequests(res)
                } else {
                    return []
                }
            })
        } else {
            setAccessoryRequests([])
        }
    }, [parentRequestId, clearTimes, showModal])
    return accessoryRequests
}

export const retrieveProductRequests = async (parentRequestId: string) => {
    return await SoupService.retrieveDataFromSoup(
        'Request__c',
        {},
        [
            'Id',
            'inven_id__c',
            'inven_label__c',
            'equip_mech_rte_amt__c',
            'slct_num__c',
            'FSV_UNIT_T1__c',
            'FSV_COMM_RATE_T1__c'
        ],
        '' +
            'SELECT {Request__c:Id},{Request__c:inven_id__c},{Request__c:inven_label__c},' +
            '{Request__c:equip_mech_rte_amt__c},{Request__c:slct_num__c},{Request__c:FSV_UNIT_T1__c},{Request__c:FSV_COMM_RATE_T1__c},' +
            '{Request__c:_soupEntryId} FROM {Request__c} ' +
            `WHERE {Request__c:parent_request_record__c}='${parentRequestId}' ` +
            "AND {Request__c:request_subtype__c}='Move Request Product' ORDER BY CAST({Request__c:slct_num__c} as INTEGER)"
    )
}

export const useExistingProductRequests = (parentRequestId: string, clearTimes: number, showModal?: boolean) => {
    const [productRequests, setProductRequests] = useState([])
    useEffect(() => {
        if (parentRequestId) {
            retrieveProductRequests(parentRequestId).then((res) => {
                if (res.length > 0) {
                    setProductRequests(res)
                } else {
                    return []
                }
            })
        } else {
            setProductRequests([])
        }
    }, [parentRequestId, clearTimes, showModal])
    return productRequests
}

export const retrieveSalesPlanNamePicklist = async (containFSRFSV?, FSVToggle?) => {
    let q
    const baseQuery = `SELECT {Asset_Attribute__c:Sls_plan_desc__c}, {Asset_Attribute__c:sls_plan_cde__c} 
                   FROM {Asset_Attribute__c} 
                   WHERE {Asset_Attribute__c:master_data_type__c} = 'SalesPlan' 
                   AND {Asset_Attribute__c:active_flag__c} IS TRUE 
                   AND {Asset_Attribute__c:Sls_plan_desc__c} IS NOT NULL
                   AND {Asset_Attribute__c:sls_plan_cde__c} IS NOT NULL `
    if (FSVToggle) {
        q =
            baseQuery +
            `AND ({Asset_Attribute__c:sls_plan_cde__c} = 'FSV' 
             OR {Asset_Attribute__c:sls_plan_cde__c} = 'FSR')`
    } else if (containFSRFSV) {
        q = baseQuery
    } else {
        q =
            baseQuery +
            `AND {Asset_Attribute__c:sls_plan_cde__c} != 'FSV' 
             AND {Asset_Attribute__c:sls_plan_cde__c} != 'FSR'`
    }

    return await SoupService.retrieveDataFromSoup('Asset_Attribute__c', {}, ['Sls_plan_desc__c', 'sls_plan_cde__c'], q)
}

export const useSalesPlanNamePicklist = (containFSRFSV?, FSVToggle?) => {
    const [salesPlanNamePicklist, setSalesPlanNamePicklist] = useState([])
    const [salesPlanNamePicklistObject, setSalesPlanNamePicklistObject] = useState({})
    useEffect(() => {
        retrieveSalesPlanNamePicklist(containFSRFSV, FSVToggle).then((res) => {
            if (res?.length > 0) {
                setSalesPlanNamePicklist(res)
                const tempListObject = {}
                res.forEach((v) => {
                    tempListObject[v.Sls_plan_desc__c] = v.sls_plan_cde__c
                })
                setSalesPlanNamePicklistObject(tempListObject)
            } else {
                setSalesPlanNamePicklist([])
                setSalesPlanNamePicklistObject({})
            }
        })
    }, [containFSRFSV, FSVToggle])
    return {
        salesPlanNamePicklist,
        salesPlanNamePicklistObject
    }
}

export const useServiceNameContractPicklist = (retailStore) => {
    const [serviceNameContractPicklist, setServiceNameContractPicklist] = useState([])
    const [serviceNameContractPicklistObject, setServiceNameContractPicklistObject] = useState({})
    useEffect(() => {
        const canadaCondition =
            retailStore?.CountryCode === 'CA' ? "OR {Asset_Attribute__c:serv_ctrct_org_id__c}='1326'" : ''
        const q = `SELECT {Asset_Attribute__c:serv_ctrct_nme__c}, {Asset_Attribute__c:serv_ctrct_id__c} 
                   FROM {Asset_Attribute__c} 
                   WHERE {Asset_Attribute__c:master_data_type__c} = 'ServiceContract' 
                   AND {Asset_Attribute__c:active_flag__c} IS TRUE 
                   AND {Asset_Attribute__c:serv_ctrct_nme__c} IS NOT NULL
                   AND {Asset_Attribute__c:serv_ctrct_id__c} IS NOT NULL
                   AND {Asset_Attribute__c:serv_ctrct_typ_cde__c}='SER'
                   AND ({Asset_Attribute__c:serv_ctrct_org_id__c}='1' ${canadaCondition})`
        SoupService.retrieveDataFromSoup('Asset_Attribute__c', {}, ['serv_ctrct_nme__c', 'serv_ctrct_id__c'], q).then(
            (res) => {
                if (res?.length > 0) {
                    setServiceNameContractPicklist(res)
                    const tempListObject = {}
                    res.forEach((v) => {
                        tempListObject[v.serv_ctrct_nme__c] = v.serv_ctrct_id__c
                    })
                    setServiceNameContractPicklistObject(tempListObject)
                } else {
                    setServiceNameContractPicklist([])
                    setServiceNameContractPicklistObject({})
                }
            }
        )
    }, [])
    return {
        serviceNameContractPicklist,
        serviceNameContractPicklistObject
    }
}

export const useInstallRequestLineItems = (headerRequestId: string, refreshTimes: number) => {
    const [items, setItems] = useState([])
    const { allFields, allFieldsString } = genQueryAllFieldsString('Request__c')
    useEffect(() => {
        if (headerRequestId) {
            SoupService.retrieveDataFromSoup(
                'Request__c',
                {},
                allFields,
                `SELECT ${allFieldsString},{Request__c:_soupEntryId}` +
                    ` FROM {Request__c} WHERE {Request__c:request_id__c}='${headerRequestId}'` +
                    " AND {Request__c:request_subtype__c}='Move Request Line Item'" +
                    ' ORDER BY {Request__c:order_line_num__c}'
            ).then((res) => {
                const groupedLineItems = _.groupBy(res, (item) => item.std_setup_equip_id__c)
                const newLineItems = []
                _.forEach(groupedLineItems, (item) => {
                    item.forEach((v) => {
                        v.copyCount = item.length > 1 ? item.length : null
                        v.FSV_Line_Item__c = v.FSV_Line_Item__c === '1'
                        v.Deduct_Deposit__c = v.Deduct_Deposit__c === '1'
                        v.Deposit_Amount__c = v.Deposit_Amount__c ? addZeroes(v.Deposit_Amount__c + '') : ''
                        if (v.Contract_Type__c === 'Revenue') {
                            v.FSV_UNIT_T1__c = v.FSV_UNIT_T1__c ? addZeroes(v.FSV_UNIT_T1__c + '') : ''
                            v.FSV_UNIT_T2__c = v.FSV_UNIT_T2__c ? addZeroes(v.FSV_UNIT_T2__c + '') : ''
                            v.FSV_UNIT_T3__c = v.FSV_UNIT_T3__c ? addZeroes(v.FSV_UNIT_T3__c + '') : ''
                            v.FSV_UNIT_T4__c = v.FSV_UNIT_T4__c ? addZeroes(v.FSV_UNIT_T4__c + '') : ''
                            v.FSV_UNIT_T5__c = v.FSV_UNIT_T5__c ? addZeroes(v.FSV_UNIT_T5__c + '') : ''
                        }
                        v.FSV_COMM_RATE_T1__c = v.FSV_COMM_RATE_T1__c ? addZeroes(v.FSV_COMM_RATE_T1__c + '') : ''
                        v.FSV_COMM_RATE_T2__c = v.FSV_COMM_RATE_T2__c ? addZeroes(v.FSV_COMM_RATE_T2__c + '') : ''
                        v.FSV_COMM_RATE_T3__c = v.FSV_COMM_RATE_T3__c ? addZeroes(v.FSV_COMM_RATE_T3__c + '') : ''
                        v.FSV_COMM_RATE_T4__c = v.FSV_COMM_RATE_T4__c ? addZeroes(v.FSV_COMM_RATE_T4__c + '') : ''
                        v.FSV_COMM_RATE_T5__c = v.FSV_COMM_RATE_T5__c ? addZeroes(v.FSV_COMM_RATE_T5__c + '') : ''
                        newLineItems.push(v)
                    })
                })
                setItems(newLineItems)
            })
        }
    }, [headerRequestId, refreshTimes])
    return items
}

export const useAllInstallRequestLineItems = (customerId: string, leadId: string, refreshTimes: number, visible) => {
    const [items, setItems] = useState([])
    useEffect(() => {
        const leadCustomerFilterClause = customerId
            ? `{Request__c:customer__c}='${customerId}'`
            : `{Request__c:Lead__c}='${leadId}'`
        if ((customerId || leadId) && visible) {
            SoupService.retrieveDataFromSoup(
                'Request__c',
                {},
                [
                    'Id',
                    'equip_styp_desc__c',
                    'equip_type_desc__c',
                    'std_setup_equip_id__c',
                    'Equip_type_cde__c',
                    'Equip_styp_cde__c',
                    'order_line_num__c',
                    'request_id__c',
                    'equip_site_desc__c'
                ],
                'SELECT {Request__c:Id}, {Request__c:equip_styp_desc__c}, {Request__c:equip_type_desc__c},' +
                    '{Request__c:std_setup_equip_id__c}, {Request__c:Equip_type_cde__c}, {Request__c:Equip_styp_cde__c},' +
                    '{Request__c:order_line_num__c},{Request__c:request_id__c},{Request__c:equip_site_desc__c},{Request__c:_soupEntryId}' +
                    ` FROM {Request__c} WHERE {Request__c:request_id__c} IN (SELECT {Request__c:Id} FROM {Request__c} WHERE ${leadCustomerFilterClause})` +
                    " AND {Request__c:request_subtype__c}='Move Request Line Item' AND ({Request__c:status__c}='DRAFT' OR {Request__c:status__c}='SUBMITTED' OR {Request__c:status__c}='INCOMPLETE') " +
                    ' ORDER BY {Request__c:order_line_num__c} DESC'
            ).then((res) => {
                setItems(res)
            })
        }
    }, [refreshTimes, customerId, leadId, visible])
    return items
}

export const useEquipmentTypeList = (colaNationalAccount) => {
    const [list, setList] = useState([])
    useEffect(() => {
        // setShowLoading(true)
        const colaFilterClause =
            colaNationalAccount === '1' ? "AND (equip_type_cde__c='COO' OR equip_type_cde__c='VEN')" : ''
        const path =
            'query/?q=SELECT Id, equip_type_desc__c, equip_type_cde__c FROM Asset_Attribute__c ' +
            "WHERE master_data_type__c = 'EquipmentType' AND active_flag__c = TRUE " +
            `${colaFilterClause} ORDER BY equip_type_desc__c`
        restDataCommonCall(path, 'GET')
            .then((res) => {
                setList(res.data.records)
            })
            .finally(() => {
                // setTimeout(() => {
                //     setShowLoading(false)
                // }, 0)
            })
    }, [])
    return list
}

export const useEquipmentSubTypeList = (equipmentTypeCode: string, localProdId: string, busSegCde: string) => {
    const [list, setList] = useState([])
    useEffect(() => {
        if (equipmentTypeCode) {
            // setShowLoading(true)
            const path =
                'query/?q=SELECT equip_styp_cde__c FROM Asset_Configuration__c WHERE ' +
                `equip_type_cde__c='${equipmentTypeCode}' AND prod_loc_id__c = '${localProdId}' 
                AND bus_type_cde__c LIKE '%${busSegCde}%' AND actv_stts_flg__c = true GROUP BY equip_styp_cde__c`
            restDataCommonCall(path, 'GET')
                .then((res) => {
                    const equipmentTypeCdeList = res.data.records.map((v) => {
                        return `'${v.equip_styp_cde__c}'`
                    })
                    SoupService.retrieveDataFromSoup(
                        'Asset_Attribute__c',
                        {},
                        ['Id', 'equip_styp_desc__c', 'equip_styp_cde__c'],
                        'SELECT {Asset_Attribute__c:Id}, {Asset_Attribute__c:equip_styp_desc__c}, {Asset_Attribute__c:equip_styp_cde__c} ' +
                            "FROM {Asset_Attribute__c} WHERE {Asset_Attribute__c:master_data_type__c} = 'EquipmentSubType' " +
                            `AND {Asset_Attribute__c:active_flag__c} IS TRUE AND {Asset_Attribute__c:equip_styp_cde__c} IN (${equipmentTypeCdeList.join(
                                ','
                            )})`
                    ).then((descRes) => {
                        const tempList = []
                        res.data.records.forEach((v) => {
                            const desc = descRes.find((descV) => {
                                return descV.equip_styp_cde__c === v.equip_styp_cde__c
                            })
                            if (desc) {
                                tempList.push({ ...v, equip_styp_desc__c: desc?.equip_styp_desc__c })
                            }
                        })
                        setList(tempList)
                    })
                })
                .finally(() => {
                    setTimeout(() => {
                        // setShowLoading(false)
                    }, 0)
                })
        }
    }, [equipmentTypeCode])
    return list
}

export const useEquipmentBrandingList = (
    businessTypeCode: string,
    locationProductId: string,
    equipmentTypeCode: string,
    equipmentSubTypeCode: string,
    leadType: string
) => {
    const [list, setList] = useState([])
    useEffect(() => {
        if (equipmentTypeCode && equipmentSubTypeCode) {
            fetchBrandings(businessTypeCode, locationProductId, equipmentTypeCode, equipmentSubTypeCode, leadType)
                .then((data) => {
                    setList(data?.data)
                })
                .catch((e) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'useEquipmentBrandingList',
                        `useEquipmentBrandingList: ${ErrorUtils.error2String(e)}`
                    )
                })
        }
    }, [equipmentTypeCode, equipmentSubTypeCode])
    return list
}

export const getMoveTypeMapping = () => {
    return {
        CNV: 'Conversion',
        EXI: 'Exchange',
        EXP: 'Exchange',
        INS: 'Install',
        ONS: 'Onsite Move',
        PIC: 'Pickup',
        PIN: 'Paper Install',
        PPI: 'Paper Pickup',
        Repair: 'Repair'
    }
}

const useEquipOwnerMapping = () => {
    return {
        CUS: 'Customer Owned',
        PEP: 'Pepsi Owned',
        SUP: 'Supplier'
    }
}
export const useEquipmentAssets = (isLoading: boolean, accountId: string, refreshFlag, searchValue?: string) => {
    const [equipmentList, setEquipmentList] = useState([])
    const [isEquipmentListLoading, setIsEquipmentListLoading] = useState(false)
    const moveMap = getMoveTypeMapping()
    const ownerMap = useEquipOwnerMapping()
    useEffect(() => {
        if (!isLoading) {
            setIsEquipmentListLoading(true)
            let condition = ''
            if (searchValue?.length > 2) {
                condition = `AND {Asset:ident_asset_num__c} LIKE '%${searchValue}%'`
            }
            SoupService.retrieveDataFromSoup(
                'Asset',
                {},
                CustomerEquipmentQueries.getEquipmentAssetByCustomerId.f,
                formatString(CustomerEquipmentQueries.getEquipmentAssetByCustomerId.q, [
                    accountId,
                    moment().format(TIME_FORMAT.Y_MM_DD),
                    condition
                ])
            )
                .then((res: any) => {
                    setEquipmentList(
                        res.map((v) => {
                            return {
                                ...v,
                                equip_ownr_nm__c: ownerMap[v.equip_ownr_cde__c],
                                equip_move_type_desc__c: moveMap[v.equip_move_type_cde__c] || ''
                            }
                        })
                    )
                })
                .finally(() => {
                    setIsEquipmentListLoading(false)
                })
        }
    }, [isLoading, refreshFlag, accountId, searchValue])
    return { equipmentList, isEquipmentListLoading }
}
export const useIdentItemIdList = (accountId) => {
    const [identItemIdList, setIdentItemIdList] = useState([])
    useEffect(() => {
        if (!_.isEmpty(accountId)) {
            const path = 'query/?q=SELECT Id ' + `FROM Request__c WHERE customer__c= '${accountId}'`
            restDataCommonCall(path, 'GET').then((res) => {
                const temp = res.data.records.map((v) => {
                    return { Id: v.Id }
                })
                setIdentItemIdList(temp)
            })
        }
    }, [accountId])
    return identItemIdList?.map((item) => item.Id).join("', '")
}
export const retrieveEquipRequest = async (accountId) => {
    await syncDownObj(
        'Request__c',
        `SELECT ${getAllFieldsByObjName('Request__c').join(',')} From Request__c WHERE Customer__c='${accountId}' `
    )
}

export const retrieveLeadEquipRequest = async (leadId) => {
    await syncDownObj(
        'Request__c',
        `SELECT ${getAllFieldsByObjName('Request__c').join(',')} From Request__c WHERE Lead__c='${leadId}' `
    )
}

export const calculateFailedDate = (item) => {
    return formatWithTimeZone(
        item.request_subtype__c === 'Move Request Line Item' ? item.order_cancelled_date__c : item.LastModifiedDate,
        TIME_FORMAT.MMM_DD_YYYY
    )
}

export const checkLocalDataCount = async () => {
    let assetAttributeCount
    let recordTypeCount
    let retailStoreCount
    const query =
        'SELECT (SELECT COUNT() FROM {Asset_Attribute__c}) AS AssetAttributeCount,' +
        '(SELECT COUNT() FROM {RecordType}) AS RecordTypeCount,' +
        '(SELECT COUNT() FROM {RetailStore}) AS RetailStoreCount FROM {Asset_Attribute__c} LIMIT 1'

    await SoupService.retrieveDataFromSoup(
        'Asset_Attribute__c',
        {},
        ['AssetAttributeCount', 'RecordTypeCount', 'RetailStoreCount'],
        query
    )
        .then((res) => {
            assetAttributeCount = res?.[0]?.AssetAttributeCount || 0
            recordTypeCount = res?.[0]?.RecordTypeCount || 0
            retailStoreCount = res?.[0]?.RetailStoreCount || 0
            if (assetAttributeCount === 0 || recordTypeCount === 0) {
                storeClassLog(
                    Log.MOBILE_WARN,
                    'checkLocalData',
                    'checkLocalData zero: AssetAttributeCount ' +
                        assetAttributeCount +
                        'RecordTypeCount' +
                        recordTypeCount +
                        CommonParam.PERSONA__c +
                        CommonParam.GPID__c
                )
            }
        })
        .catch((error) => {
            storeClassLog(Log.MOBILE_ERROR, 'Rep-checkLocalDataCount', 'checkLocalDataCount Error: ' + error)
        })

    return { assetAttributeCount, recordTypeCount, retailStoreCount }
}

export const useService = (accountId, isLoading, refreshFlag, type) => {
    const moveMap = getMoveTypeMapping()
    const [request, setRequest] = useState([])
    useEffect(() => {
        if (accountId) {
            const leadCustomerFilterClause =
                type === 'RetailStore'
                    ? `{Request__c:customer__c}='${accountId}'`
                    : `{Request__c:Lead__c}='${accountId}'`
            SoupService.retrieveDataFromSoup(
                'Request__c',
                {},
                CustomerEquipmentQueries.getEquipmentServiceByAccountId.f,
                formatString(CustomerEquipmentQueries.getEquipmentServiceByAccountId.q, [leadCustomerFilterClause])
            ).then((res) => {
                if (res) {
                    const requestList = _.map(res, (item) => {
                        return {
                            Id: item.Id,
                            serv_ord_type_cde__c: item.serv_ord_type_cde__c,
                            createdDate: moment(item.CreatedDate).format(TIME_FORMAT.MMM_DD_YYYY),
                            customer__c: item.customer__c || '',
                            Lead__c: item.Lead__c || '',
                            customer_id__c: item.customer_id__c || '',
                            Lead_id__c: item.Lead_id__c || '',
                            request_gpid__c: item.request_gpid__c,
                            caller_name__c: item.caller_name__c,
                            equip_move_type_cde__c: item.equip_move_type_cde__c,
                            equip_move_type_desc__c: moveMap[item.equip_move_type_cde__c] || '',
                            move_purpose_cde__c: item.move_purpose_cde__c,
                            move_request_date__c: item.move_request_date__c,
                            comments__c: item.comments__c,
                            wndw_beg_tme__c: item.wndw_beg_tme__c,
                            wndw_end_tme__c: item.wndw_end_tme__c,
                            status__c: item.status__c,
                            createdName: item['CreatedBy.Name'] || '',
                            submitted_date__c: item.submitted_date__c
                                ? moment(item.submitted_date__c).format(TIME_FORMAT.MMM_DD_YYYY)
                                : null,
                            requestedByName: item['requested_by__r.Name'],
                            LastModifiedDate: item.LastModifiedDate
                                ? moment(item.LastModifiedDate).format(TIME_FORMAT.MMM_DD_YYYY)
                                : null,
                            request_subtype__c: item.request_subtype__c,
                            CompletedCount: item.CompletedCount,
                            TotalCount: item.TotalCount,
                            ord_rcv_dte_tme__c: item.ord_rcv_dte_tme__c
                                ? moment(item.ord_rcv_dte_tme__c).format(TIME_FORMAT.MMM_DD_YYYY)
                                : null,
                            equip_site_id__c: item.equip_site_id__c,
                            prev_equip_site_id__c: item.prev_equip_site_id__c,
                            failedDate: calculateFailedDate(item)
                        }
                    })
                    setRequest(requestList)
                }
            })
        }
    }, [accountId, isLoading, refreshFlag, type])
    return request
}
export const useInstallHeaderRequest = (Id, accountId, customerId, lead, leadId) => {
    const [request, setRequest] = useState(initInstallRequestHeader(accountId, customerId, lead, leadId))
    useEffect(() => {
        if (Id) {
            SoupService.retrieveDataFromSoup(
                'Request__c',
                {},
                CustomerEquipmentQueries.getEquipmentRequestByRequestId.f,
                formatString(CustomerEquipmentQueries.getEquipmentRequestByRequestId.q, [Id])
            )
                .then((res) => {
                    const temp = {
                        Email: null,
                        Id: res[0]?.Id,
                        Phone: null,
                        RecordTypeId: res[0]?.RecordTypeId,
                        Title: null,
                        caller_name__c: res[0]?.caller_name__c,
                        comments__c: res[0]?.comments__c,
                        customer__c: accountId,
                        Lead__c: res[0]?.Lead__c || lead,
                        customer_id__c: customerId,
                        Lead_id__c: res[0]?.Lead_id__c || leadId,
                        display_in_asset_tab__c: res[0]?.display_in_asset_tab__c,
                        display_in_service_tab__c: res[0]?.display_in_service_tab__c,
                        equip_move_type_cde__c: 'INS',
                        move_purpose_cde__c: res[0]?.move_purpose_cde__c,
                        move_request_date__c: res[0]?.move_request_date__c,
                        request_gpid__c: CommonParam.GPID__c,
                        request_subtype__c: 'Move Request',
                        requested_by__c: CommonParam.userId,
                        saleRepName: res[0]['requested_by__r.Name'],
                        saleRepPhone: res[0]['requested_by__r.MobilePhone'],
                        status__c: res[0]?.status__c,
                        survey_response__c: res[0]?.survey_response__c,
                        wndw_beg_tme__c: res[0]?.wndw_beg_tme__c,
                        wndw_end_tme__c: res[0]?.wndw_end_tme__c,
                        caller_phone_num__c: res[0]?.caller_phone_num__c,
                        email_addr_txt__c: res[0]?.email_addr_txt__c,
                        details_revision_num__c: res[0]?.details_revision_num__c,
                        sched_beg_dte__c: res[0]?.sched_beg_dte__c,
                        survey_general_equip_details_response__c: res[0]?.survey_general_equip_details_response__c
                    }
                    setRequest(temp)
                })
                .catch(() => {})
        } else {
            setRequest(initInstallRequestHeader(accountId, customerId, lead, leadId))
        }
    }, [Id])
    return {
        request,
        setRequest
    }
}
export const useRequestContact = (paramsId, name, type) => {
    const [requestContact, setRequestContact] = useState([])
    useEffect(() => {
        SoupService.retrieveDataFromSoup(
            'Contact',
            {},
            CustomerRequestQueries.getRequestContactByCustomerId.f,
            formatString(
                type === 'Lead'
                    ? CustomerRequestQueries.getRequestContactByCustomerId.qLead
                    : CustomerRequestQueries.getRequestContactByCustomerId.q,
                [paramsId, name]
            )
        ).then((res) => {
            setRequestContact(res)
        })
    }, [paramsId, name])
    return requestContact
}
export const getRequestCustomerFilter = (requestSubtype: string, equipMoveType: string) => {
    return new Promise((resolve) => {
        SoupService.retrieveDataFromSoup(
            'Request__c',
            {},
            CustomerEquipmentQueries.getRequestCustomerFilter.f,
            formatString(CustomerEquipmentQueries.getRequestCustomerFilter.q, [requestSubtype, equipMoveType])
        )
            .then((res) => {
                resolve(
                    res.map((v) => {
                        return { customer__c: v.customer__c }
                    })
                )
            })
            .catch((err) => {
                storeClassLog(Log.MOBILE_ERROR, 'useRequestCustomerFilter', err)
                resolve([])
            })
    })
}
export const getRepairRequestCustomerFilter = async (recordTypeName: string) => {
    return new Promise((resolve) => {
        getRecordTypeIdByDeveloperName(recordTypeName, 'Request__c')
            .then((res) => {
                SoupService.retrieveDataFromSoup(
                    'Request__c',
                    {},
                    CustomerEquipmentQueries.getRepairRequestCustomerFilter.f,
                    formatString(CustomerEquipmentQueries.getRepairRequestCustomerFilter.q, [res])
                ).then((repairCustomerRes) => {
                    resolve(
                        repairCustomerRes.map((v) => {
                            return { customer__c: v.customer__c }
                        })
                    )
                })
            })
            .catch((e) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'Rep-useRepairRequestCustomerFilter',
                    'use Repair Request Customer Filter Error: ' + getStringValue(e)
                )
                resolve([])
            })
    })
}
export const getCancelRequestCustomerFilter = async (requestSubtype: string, equipMoveType: string) => {
    return new Promise((resolve) => {
        SoupService.retrieveDataFromSoup(
            'Request__c',
            {},
            CustomerEquipmentQueries.getCancelRequestCustomerFilter.f,
            formatString(CustomerEquipmentQueries.getCancelRequestCustomerFilter.q, [requestSubtype, equipMoveType])
        )
            .then((res) => {
                resolve(
                    res.map((v) => {
                        return { customer__c: v.customer__c }
                    })
                )
            })
            .catch((e) => {
                storeClassLog(Log.MOBILE_ERROR, 'useCancelRequestCustomerFilter', e)
                resolve([])
            })
    })
}
export const getCancelRepairRequestCustomerFilter = async (recordTypeName: string) => {
    return new Promise((resolve) => {
        getRecordTypeIdByDeveloperName(recordTypeName, 'Request__c')
            .then((res) => {
                SoupService.retrieveDataFromSoup(
                    'Request__c',
                    {},
                    CustomerEquipmentQueries.getCancelRepairRequestCustomerFilter.f,
                    formatString(CustomerEquipmentQueries.getCancelRepairRequestCustomerFilter.q, [res])
                ).then((cancelCustomerRes) => {
                    resolve(
                        cancelCustomerRes.map((v) => {
                            return { customer__c: v.customer__c }
                        })
                    )
                })
            })
            .catch((e) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'Rep-useCancelRepairRequestCustomerFilter',
                    'use Cancel Repair Request Customer Filter Error: ' + getStringValue(e)
                )
                resolve([])
            })
    })
}
export const retrieveEquipmentAssets = async (customerId) => {
    await compositeQueryObjsBySoql(getEquipmentAssetCompositeGroup(customerId))
}

export const useAggregateList = (code = '002') => {
    const [aggregateList, setAggregateList] = useState([])
    useEffect(() => {
        fetchAggregateList(code)
            .then((res) => {
                if (res?.data?.length > 0) {
                    const result = res.data
                    const arr = result.map((item) => {
                        return {
                            Name: item.Package_Type_Name__c,
                            Type: item.Package_Type__c
                        }
                    })
                    setAggregateList(arr)
                }
            })
            .catch((e) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'useAggregateList',
                    `refresh aggregate list: ${ErrorUtils.error2String(e)}`
                )
            })
    }, [])
    return aggregateList
}
export const useBrandList = (code = '002') => {
    const [brandList, setBrandList] = useState([])
    useEffect(() => {
        fetchBrandList(code)
            .then((res) => {
                if (res?.data?.length > 0) {
                    const result = res.data
                    const arr = result.map((item) => item.Sub_Brand__c)
                    setBrandList(arr)
                }
            })
            .catch((e) => {
                storeClassLog(Log.MOBILE_ERROR, 'useBrandList', `refresh brand list: ${ErrorUtils.error2String(e)}`)
            })
    }, [])
    return brandList
}

export const useAccessory = (equipType, id) => {
    const [additionalAccessoryList, setAdditionalAccessoryList] = useState([])
    const [requiredAccessoryList, setRequiredAccessoryList] = useState([])
    let reAccessoryList = []
    let adFromAssetList = []
    useEffect(() => {
        if (equipType && id) {
            // setShowLoading(true)
            const assetConfigurationPath =
                'SELECT std_attr_desc__c,std_attr_cde__c,std_attr_flg__c ' +
                "FROM Asset_Configuration__c WHERE RecordType.DeveloperName = 'StandardSetupAccessory'" +
                `AND std_equip_setup_id__c = '${id}' ` +
                'AND actv_stts_flg__c = TRUE '
            syncDownObj('Asset_Configuration__c', assetConfigurationPath, false).then((res) => {
                const temp = res.data.map((v) => {
                    return {
                        id: v.std_attr_cde__c,
                        name: v.std_attr_desc__c,
                        stdFlg: v.std_attr_flg__c,
                        select: false
                    }
                })
                reAccessoryList = _.filter(temp, (item) => item.stdFlg)
                adFromAssetList = _.filter(temp, (item) => !item.stdFlg)
                setRequiredAccessoryList(reAccessoryList)
                const reAccessory = reAccessoryList.map((item) => item.id).join("', '")
                const adAccessory = adFromAssetList.map((item) => item.id)
                getRecordTypeId('Accessory', 'Product2').then((typeIdRes) => {
                    const productPath =
                        `SELECT std_attr_cde__c,attr_desc__c FROM Product2 WHERE RecordTypeId = '${typeIdRes}' ` +
                        `AND equip_type_cde__c = '${equipType}' ` +
                        'AND IsActive = TRUE AND std_attr_cde__c != NULL AND attr_desc__c != NULL ' +
                        (!_.isEmpty(reAccessory) ? `AND std_attr_cde__c NOT IN ('${reAccessory}')` : '')
                    syncDownObj('Product2', productPath, false)
                        .then((resDate) => {
                            const tempAdditionalAccessory = resDate.data.map((v) => {
                                return {
                                    id: v.std_attr_cde__c,
                                    name: v.attr_desc__c,
                                    select: false
                                }
                            })
                            setAdditionalAccessoryList(
                                _.concat(
                                    adFromAssetList,
                                    _.filter(tempAdditionalAccessory, (v) => {
                                        return !_.includes(adAccessory, v.id)
                                    })
                                )
                            )
                        })
                        .finally(() => {
                            // setShowLoading(false)
                        })
                })
            })
        } else {
            setRequiredAccessoryList([])
        }
    }, [equipType, id])
    return { requiredAccessoryList, additionalAccessoryList }
}
export const useRecommendedProduct = (selectedEquipSetupId) => {
    const [originalRecommendedProduct, setOriginalRecommendedProduct] = useState([])
    const [maxSelectNumber, setMaxSelectNumber] = useState(1)
    useEffect(() => {
        // setShowLoading(true)
        fetchRecommendedProducts(selectedEquipSetupId)
            .then((res) => {
                const list = res.data
                if (list.length > 0) {
                    setOriginalRecommendedProduct(list)
                    const tempMaxSelectNumberObj = _.maxBy(list, (v) => {
                        // @ts-ignore
                        return parseInt(v.slct_num__c)
                    })
                    if (tempMaxSelectNumberObj) {
                        // @ts-ignore
                        setMaxSelectNumber(parseInt(tempMaxSelectNumberObj.slct_num__c))
                    } else {
                        setMaxSelectNumber(1)
                    }
                } else {
                    setOriginalRecommendedProduct([])
                    setMaxSelectNumber(1)
                }
            })
            .catch((e) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'useRecommendedProduct',
                    `useRecommendedProduct: ${ErrorUtils.error2String(e)}`
                )
            })
    }, [selectedEquipSetupId])

    return {
        originalRecommendedProduct,
        maxSelectNumber
    }
}

export const useMaximum = (selectedEquipSetupId) => {
    const [maxProdNum, setMaxProdNum] = useState(0)
    useEffect(() => {
        getRecordTypeIdByDeveloperName('StandardEquipSetup', 'Asset_Configuration__c')
            .then((res) => {
                const path =
                    'query/?q=SELECT max_prod__c ' +
                    `FROM Asset_Configuration__c WHERE RecordType.Id= '${res}' ` +
                    `AND std_equip_setup_id__c= '${selectedEquipSetupId}' AND actv_stts_flg__c = TRUE   LIMIT 1`
                restDataCommonCall(path, 'GET').then((result: any) => {
                    setMaxProdNum(result?.data?.records[0]?.max_prod__c || 0)
                })
            })
            .catch((e) => {
                storeClassLog(Log.MOBILE_ERROR, 'Rep-useMaximum', 'use Maximum Error: ' + getStringValue(e))
            })
    }, [selectedEquipSetupId])
    return maxProdNum
}

export const useRequestRecordTypeId = () => {
    const [requestRecordTypeId, setRequestRecordTypeId] = useState(null)
    useEffect(() => {
        getRecordTypeIdByDeveloperName('Move_Request', 'Request__c')
            .then((res) => {
                setRequestRecordTypeId(res)
            })
            .catch((e) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'Rep-useRequestRecordTypeId',
                    'use Request RecordType Id Error: ' + getStringValue(e)
                )
            })
    }, [])
    return requestRecordTypeId
}
export const useServiceInformation = (identItemId) => {
    const [serviceDraftList, setServiceDraftList] = useState([])
    const [serviceSubmittedList, setServiceSubmittedList] = useState([])
    const [serviceCancelledList, setServiceCancelledList] = useState([])
    const [serviceClosedList, setServiceClosedList] = useState([])
    const [serviceFailedList, setServiceFailedList] = useState([])
    useEffect(() => {
        SoupService.retrieveDataFromSoup(
            'Request__c',
            {},
            CustomerEquipmentQueries.getServiceInfoByIdentId.f,
            formatString(CustomerEquipmentQueries.getServiceInfoByIdentId.q, [
                identItemId,
                'DRAFT',
                'DRAFT',
                '{Request__c: CreatedDate}'
            ])
        ).then((res) => {
            setServiceDraftList(res)
        })
        SoupService.retrieveDataFromSoup(
            'Request__c',
            {},
            CustomerEquipmentQueries.getServiceInfoByIdentId.f,
            formatString(CustomerEquipmentQueries.getServiceInfoByIdentId.q, [
                identItemId,
                'SUBMITTED',
                'SUBMITTED',
                '{Request__c: submitted_date__c}'
            ])
        ).then((res) => {
            setServiceSubmittedList(res)
        })
        SoupService.retrieveDataFromSoup(
            'Request__c',
            {},
            CustomerEquipmentQueries.getServiceInfoByIdentId.f,
            formatString(CustomerEquipmentQueries.getServiceInfoByIdentId.qCancelled, [identItemId])
        ).then((res) => {
            setServiceCancelledList(res)
        })
        SoupService.retrieveDataFromSoup(
            'Request__c',
            {},
            CustomerEquipmentQueries.getServiceInfoByIdentId.f,
            formatString(CustomerEquipmentQueries.getServiceInfoByIdentId.q, [
                identItemId,
                'CLOSED',
                'CLOSED',
                '{Request__c: LastModifiedDate}'
            ])
        ).then((res) => {
            setServiceClosedList(res)
        })
        SoupService.retrieveDataFromSoup(
            'Request__c',
            {},
            CustomerEquipmentQueries.getServiceInfoByIdentId.f,
            formatString(CustomerEquipmentQueries.getServiceInfoByIdentId.q, [
                identItemId,
                'FAILED',
                'FAILED',
                '{Request__c: LastModifiedDate}'
            ])
        ).then((res) => {
            setServiceFailedList(res)
        })
    }, [identItemId])
    return {
        serviceDraftList,
        serviceSubmittedList,
        serviceCancelledList,
        serviceClosedList,
        serviceFailedList
    }
}
export const useInProgressEquipmentList = (
    accountId: string,
    leadId: string,
    refreshTimes: number,
    equipmentList: any[]
) => {
    const [list, setList] = useState([])
    const moveMap = getMoveTypeMapping()
    useEffect(() => {
        if (accountId || leadId) {
            const leadCustomerFilterClause = accountId
                ? `{Request__c:customer__c}='${accountId}'`
                : `{Request__c:Lead__c}='${leadId}'`
            SoupService.retrieveDataFromSoup(
                'Request__c',
                {},
                [
                    'Id',
                    'equip_type_desc__c',
                    'CreatedDate',
                    'parent_request_record__c',
                    'equip_setup_desc__c',
                    'equip_move_type_cde__c',
                    'CreatedBy.Name',
                    'cets_ord_stat_cde__c',
                    'status__c',
                    'request_subtype__c',
                    'equip_move_type_desc__c',
                    'submitted_date__c',
                    'sched_beg_dte__c',
                    'ident_item_id__c',
                    'equip_site_desc__c',
                    'requested_by__r.Name',
                    'ord_rcv_dte_tme__c',
                    'Equip_type_cde__c',
                    'order_cancelled_date__c',
                    'LastModifiedDate',
                    'Equip_styp_cde__c'
                ],
                'SELECT {Request__c:Id},{Request__c:equip_type_desc__c},' +
                    '{Request__c:CreatedDate},{Request__c:parent_request_record__c},{Request__c:equip_setup_desc__c},' +
                    '{Request__c:equip_move_type_cde__c},{Request__c:CreatedBy.Name},{Request__c:cets_ord_stat_cde__c},' +
                    '{Request__c:status__c},{Request__c:request_subtype__c},{Request__c:equip_move_type_desc__c},' +
                    '{Request__c:submitted_date__c},{Request__c:sched_beg_dte__c},{Request__c:ident_item_id__c},' +
                    '{Request__c:equip_site_desc__c},{Request__c:requested_by__r.Name},{Request__c:ord_rcv_dte_tme__c},' +
                    '{Request__c:Equip_type_cde__c}, {Request__c:order_cancelled_date__c}, {Request__c:LastModifiedDate},' +
                    '{Request__c:Equip_styp_cde__c} ' +
                    'FROM {Request__c} ' +
                    `WHERE {Request__c:parent_request_record__c} IN (SELECT {Request__c:Id} FROM {Request__c} WHERE ${leadCustomerFilterClause}) 
                 AND {Request__c:display_in_asset_tab__c} IS TRUE AND {Request__c:request_subtype__c}='Move Request Line Item' AND 
                {Request__c:status__c} != 'CLOSED' AND {Request__c:status__c} != 'CANCELLED' AND {Request__c:equip_move_type_cde__c}='INS' 
                ORDER BY {Request__c:LastModifiedDate} DESC`
            ).then((res) => {
                setList(
                    res.map((v) => {
                        return {
                            ...v,
                            equip_move_type_desc__c: moveMap[v.equip_move_type_cde__c] || '',
                            failedDate: calculateFailedDate(v)
                        }
                    })
                )
            })
        }
    }, [accountId, leadId, refreshTimes, equipmentList])
    return list
}

export const useShowDuplicateInStoreLocationErrorMessage = (
    installRequestLineItems,
    assets,
    value,
    requestId,
    itemToExchange?
) => {
    const [showMessage, setShowMessage] = useState(true)
    useEffect(() => {
        if (value) {
            if (installRequestLineItems.length > 0 || assets.length > 0) {
                const itemToCompare = [...installRequestLineItems, ...assets].map((v) => {
                    if (v.Id !== requestId) {
                        return v.equip_site_desc__c
                    }
                    return undefined
                })
                if (
                    itemToCompare.find((item) => {
                        return item?.toLowerCase() === value.toLowerCase()
                    }) &&
                    itemToExchange?.equip_site_desc__c.toLowerCase() !== value.toLowerCase()
                ) {
                    setShowMessage(true)
                } else {
                    setShowMessage(false)
                }
            } else {
                setShowMessage(false)
            }
        } else {
            setShowMessage(false)
        }
    }, [installRequestLineItems, assets, value])
    return showMessage
}

export const useDisableEquipmentAdditionalInformationConfirmButton = (
    showDuplicateInStoreLocationErrorMessage,
    subEquipment,
    salesPlanNamePicklistObject
) => {
    const [disable, setDisable] = useState(true)
    const getNameByCode = (code, picklistObj) => {
        let name = ''
        _.forEach(picklistObj, (v, k) => {
            if (v === code) {
                name = k
            }
        })
        return name
    }
    useEffect(() => {
        setDisable(
            _.isEmpty(getNameByCode(subEquipment.Sls_plan_cde__c, salesPlanNamePicklistObject)) ||
                _.isEmpty(subEquipment.Serv_ctrct_id__c) ||
                _.isEmpty(subEquipment.equip_site_desc__c) ||
                ((subEquipment.Sls_plan_cde__c === 'FSR' || subEquipment.Sls_plan_cde__c === 'REN') &&
                    _.isEmpty(subEquipment.Mnth_pymt_amt__c)) ||
                showDuplicateInStoreLocationErrorMessage
        )
    }, [subEquipment, showDuplicateInStoreLocationErrorMessage, salesPlanNamePicklistObject])
    return disable
}

export const useEquipmentTypeCodeDesc = () => {
    const [equipTypeDescObj, setEquipTypeDescObj] = useState({})
    useEffect(() => {
        const queryPath =
            'query/?q=SELECT equip_type_cde__c,equip_type_desc__c FROM Asset_Attribute__c where ' +
            "master_data_type__c = 'EquipmentType' and " +
            'equip_type_desc__c!=null and equip_type_cde__c!=null and active_flag__c=true ' +
            'group by equip_type_cde__c,equip_type_desc__c'
        restDataCommonCall(queryPath, 'GET').then((res) => {
            if (res?.data?.records?.length > 0) {
                const obj = {}
                res.data.records.forEach((item) => {
                    obj[item.equip_type_cde__c] = item.equip_type_desc__c
                })
                setEquipTypeDescObj(obj)
            }
        })
    }, [])
    return equipTypeDescObj
}

export const retrieveAssetAttributeWithoutTroubleCodes = async (lastModifiedDate?: string) => {
    await syncDownObj(
        'Asset_Attribute__c',
        `SELECT ${getAllFieldsByObjName('Asset_Attribute__c').join(',')} ` +
            "FROM Asset_Attribute__c WHERE (master_data_type__c = 'MovePurpose' OR master_data_type__c='ServiceContract' " +
            "OR master_data_type__c = 'SalesPlan' OR master_data_type__c = 'EquipmentType' " +
            "OR master_data_type__c = 'EquipmentSubType' OR master_data_type__c = 'EquipmentGraphic' OR master_data_type__c = 'SupplierAddress')" +
            ' AND active_flag__c = TRUE' +
            (lastModifiedDate ? ' AND LastModifiedDate >= ' + lastModifiedDate : '')
    )
}

export const retrieveAssetAttributeWithTroubleCodes = async (lastModifiedDate?: string) => {
    await syncDownObj(
        'Asset_Attribute__c',
        `SELECT ${getAllFieldsByObjName('Asset_Attribute__c').join(',')} ` +
            "FROM Asset_Attribute__c WHERE (master_data_type__c = 'MovePurpose' OR master_data_type__c='ServiceContract' " +
            "OR master_data_type__c = 'TroubleCodes' OR master_data_type__c = 'SalesPlan' " +
            "OR master_data_type__c = 'EquipmentType' OR master_data_type__c = 'EquipmentSubType' " +
            "OR master_data_type__c = 'EquipmentGraphic' OR master_data_type__c = 'Supplier' OR master_data_type__c = 'SupplierAddress')" +
            ' AND active_flag__c = TRUE' +
            (lastModifiedDate ? ' AND LastModifiedDate >= ' + lastModifiedDate : '')
    )
}

export const retrieveAssetAttribute = async (lastModifiedDate?: string) => {
    if (CommonParam.PERSONA__c === Persona.SALES_DISTRICT_LEADER) {
        await retrieveAssetAttributeWithoutTroubleCodes(lastModifiedDate)
    } else {
        await retrieveAssetAttributeWithTroubleCodes(lastModifiedDate)
    }
}

export const retrieveEquipmentRequest = async () => {
    await syncDownObj(
        'Request__c',
        `SELECT ${getAllFieldsByObjName('Request__c').join(
            ','
        )} From Request__c WHERE Customer__c IN (SELECT AccountId FROM AccountTeamMember WHERE UserId='${
            CommonParam.userId
        }' AND Account.IS_ACTIVE__c=true) `
    )
    await retrieveAssetAttribute()
}

export const useEquipmentGrphcPicklist = () => {
    const [equipmentGrphcPicklist, setEquipmentGrphcPicklist] = useState([])
    const [equipmentGrphcPicklistObject, setEquipmentGrphcPicklistObject] = useState({})
    useEffect(() => {
        const q = `SELECT {Asset_Attribute__c:equip_grphc_desc__c}, {Asset_Attribute__c:equip_grphc_id__c} 
                   FROM {Asset_Attribute__c} 
                   WHERE {Asset_Attribute__c:active_flag__c} IS TRUE 
                   AND {Asset_Attribute__c:equip_grphc_desc__c} IS NOT NULL
                   AND {Asset_Attribute__c:equip_grphc_id__c} IS NOT NULL`
        SoupService.retrieveDataFromSoup(
            'Asset_Attribute__c',
            {},
            ['equip_grphc_desc__c', 'equip_grphc_id__c'],
            q
        ).then((res) => {
            if (res?.length > 0) {
                setEquipmentGrphcPicklist(res)
                const tempListObject = {}
                res.forEach((v) => {
                    tempListObject[v.equip_grphc_desc__c] = v.equip_grphc_id__c
                })
                setEquipmentGrphcPicklistObject(tempListObject)
            } else {
                setEquipmentGrphcPicklist([])
                setEquipmentGrphcPicklistObject({})
            }
        })
    }, [])
    return {
        equipmentGrphcPicklist,
        equipmentGrphcPicklistObject
    }
}

export const useFSVDistributionPoint = (
    accountId: string,
    leadExternalId: string,
    refreshTimes: number,
    checkBox: any
) => {
    const [distributionPoints, setDistributionPoints] = useState([])
    useEffect(() => {
        const leadCustomerFilterClause = accountId
            ? `{Customer_to_Route__c:Customer__c} = '${accountId}'`
            : `{Customer_to_Route__c:Lead__c} = '${leadExternalId}'`
        if (accountId || leadExternalId) {
            getRecordTypeIdByDeveloperName(accountId ? 'Requested_Customer_DP' : 'Lead_DP', 'Customer_to_Route__c')
                .then((recordTypeId) => {
                    SoupService.retrieveDataFromSoup(
                        'Customer_to_Route__c',
                        {},
                        [
                            'Id',
                            'SLS_MTHD_NM__c',
                            'PROD_GRP_NM__c',
                            'DLVRY_MTHD_NM__c',
                            'DELY_DAYS__c',
                            'Route_Text__c',
                            'RecordTypeId',
                            'CUST_RTE_FREQ_CDE__c',
                            'SLS_MTHD_CDE__c',
                            'DELY_MTHD_CDE__c',
                            'PROD_GRP_CDE__c',
                            'Route__r.GTMU_RTE_ID__c',
                            'Route__r.RTE_TYP_GRP_NM__c',
                            'ORD_DAYS__c',
                            'User__r.Name',
                            'Customer__c',
                            'CUST_ID__c',
                            'Send_New_DP__c',
                            'Request__c',
                            'Request__r.status__c',
                            'Lead_DP_Route_Disp_NM__c',
                            'created_by_savvy__c'
                        ],
                        'SELECT {Customer_to_Route__c:Id},{Customer_to_Route__c:SLS_MTHD_NM__c}, ' +
                            '{Customer_to_Route__c:PROD_GRP_NM__c}, {Customer_to_Route__c:DLVRY_MTHD_NM__c}, ' +
                            '{Customer_to_Route__c:DELY_DAYS__c}, {Customer_to_Route__c:Route_Text__c},' +
                            '{Customer_to_Route__c:RecordTypeId},{Customer_to_Route__c:CUST_RTE_FREQ_CDE__c},' +
                            '{Customer_to_Route__c:SLS_MTHD_CDE__c},{Customer_to_Route__c:DELY_MTHD_CDE__c},' +
                            '{Customer_to_Route__c:PROD_GRP_CDE__c},{Customer_to_Route__c:Route__r.GTMU_RTE_ID__c},' +
                            '{Customer_to_Route__c:Route__r.RTE_TYP_GRP_NM__c},' +
                            '{Customer_to_Route__c:ORD_DAYS__c},{Employee_To_Route__c:User__r.Name},{Customer_to_Route__c:Customer__c},' +
                            '{Customer_to_Route__c:CUST_ID__c},{Customer_to_Route__c:Send_New_DP__c},{Customer_to_Route__c:Request__c},' +
                            '{Customer_to_Route__c:Request__r.status__c},{Customer_to_Route__c:Lead_DP_Route_Disp_NM__c},' +
                            '{Customer_to_Route__c:created_by_savvy__c},{Customer_to_Route__c:_soupEntryId},' +
                            '{Customer_to_Route__c:__local__},{Customer_to_Route__c:__locally_created__},' +
                            '{Customer_to_Route__c:__locally_updated__}, {Customer_to_Route__c:__locally_deleted__} ' +
                            'FROM {Customer_to_Route__c} ' +
                            'LEFT JOIN (SELECT * FROM {Employee_To_Route__c} WHERE ' +
                            '{Employee_To_Route__c:User__r.Name} IS NOT NULL AND {Employee_To_Route__c:Active_Flag__c} IS TRUE AND ' +
                            "{Employee_To_Route__c:Status__c} = 'Processed' GROUP BY {Employee_To_Route__c:Route__c}) " +
                            'ON {Employee_To_Route__c:Route__c} = {Customer_to_Route__c:Route__c} ' +
                            `WHERE ${leadCustomerFilterClause} ` +
                            "AND {Customer_to_Route__c:SLS_MTHD_NM__c} = 'FSV' " +
                            `AND ({Customer_to_Route__c:RecordTypeId} = '${recordTypeId}' OR {Customer_to_Route__c:ACTV_FLG__c} IS TRUE) ` +
                            'ORDER BY {Customer_to_Route__c:DSTRB_PT_CREATE_DTE__c} DESC LIMIT 1 '
                    ).then((res) => {
                        const newRes = []
                        const temp = _.cloneDeep(res)
                        temp.forEach((v) => {
                            v.created_by_savvy__c = v.created_by_savvy__c === '1'
                            newRes.push(v)
                        })
                        setDistributionPoints(newRes)
                    })
                })
                .catch((e) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'Rep-useFSVDistributionPoint',
                        'use FSV Distribution Point Error: ' + getStringValue(e)
                    )
                })
        }
    }, [accountId, leadExternalId, refreshTimes, checkBox])
    return distributionPoints
}

export const getSupplierWithSupplier = (searchValue: any, setSupplierList: Function) => {
    SoupService.retrieveDataFromSoup(
        'Asset_Attribute__c',
        {},
        [
            'Id',
            'supplier_name__c',
            'supplier_no__c',
            'splr_site_addr1_txt__c',
            'splr_site_city_nme__c',
            'splr_site_st_cde__c',
            'splr_site_zip_cde__c'
        ],
        `SELECT SUP.{Asset_Attribute__c:Id},
                             SUP.{Asset_Attribute__c:supplier_name__c},
                             SUP.{Asset_Attribute__c:supplier_no__c},
                             ADDER.{Asset_Attribute__c:splr_site_addr1_txt__c},
                             ADDER.{Asset_Attribute__c:splr_site_city_nme__c},
                             ADDER.{Asset_Attribute__c:splr_site_st_cde__c},
                             ADDER.{Asset_Attribute__c:splr_site_zip_cde__c} 
                     FROM {Asset_Attribute__c} SUP 
                        LEFT JOIN (
                            SELECT * 
                            FROM {Asset_Attribute__c} 
                            WHERE {Asset_Attribute__c:master_data_type__c} = 'SupplierAddress' 
                            AND {Asset_Attribute__c:active_flag__c} IS TRUE 
                            ) ADDER 
                        ON ADDER.{Asset_Attribute__c:supplier_no__c} = SUP.{Asset_Attribute__c:supplier_no__c} 
                     WHERE SUP.{Asset_Attribute__c:active_flag__c} IS TRUE 
                        AND SUP.{Asset_Attribute__c:master_data_type__c} = 'Supplier' 
                        AND SUP.{Asset_Attribute__c:supplier_name__c} IS NOT NULL 
                        AND SUP.{Asset_Attribute__c:supplier_no__c} IS NOT NULL 
                        AND (SUP.{Asset_Attribute__c:supplier_name__c} LIKE '%${searchValue}%' 
                            OR SUP.{Asset_Attribute__c:supplier_no__c} LIKE '%${searchValue}%')`
    )
        .then((res) => {
            setSupplierList(res)
        })
        .catch((e) => {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Rep-getSupplierWithSupplier',
                'use Supplier With Supplier Error: ' + ErrorUtils.error2String(e)
            )
        })
}

export const getSupplierWithoutSupplier = (searchValue: any, setSupplierList: Function) => {
    const path =
        `query/?q=SELECT Id, supplier_name__c, supplier_no__c FROM Asset_Attribute__c ` +
        `WHERE active_flag__c = TRUE ` +
        `AND master_data_type__c = 'Supplier' AND supplier_name__c != NULL ` +
        `AND (supplier_name__c LIKE '%${searchValue}%' OR supplier_no__c LIKE '%${searchValue}%') LIMIT 30`
    restDataCommonCall(path, 'GET')
        .then((res) => {
            const resData = res.data.records
            if (resData?.length > 0) {
                SoupService.retrieveDataFromSoup(
                    'Asset_Attribute__c',
                    {},
                    ['supplier_no__c', 'splr_site_addr1_txt__c'],
                    `SELECT {Asset_Attribute__c:supplier_no__c}, {Asset_Attribute__c:splr_site_addr1_txt__c}
                            FROM {Asset_Attribute__c}
                            WHERE {Asset_Attribute__c:master_data_type__c} = 'SupplierAddress'
                            AND {Asset_Attribute__c:active_flag__c} IS TRUE
                            AND {Asset_Attribute__c:supplier_no__c} IN (${getIdClause(
                                resData.map((v) => v.supplier_no__c)
                            )})`
                ).then((res) => {
                    const supplierAddressList = res
                    if (supplierAddressList.length > 0) {
                        const mergedArray = resData.map((res) => {
                            const resList = supplierAddressList.find(
                                (list) => list.supplier_no__c === res.supplier_no__c
                            )
                            return { ...res, ...resList }
                        })
                        setSupplierList(mergedArray)
                    } else {
                        setSupplierList(resData)
                    }
                })
            } else {
                setSupplierList(resData)
            }
        })
        .catch((e) => {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Rep-getSupplierWithoutSupplier',
                'use Supplier Without Supplier Error: ' + ErrorUtils.error2String(e)
            )
        })
}

export const useSupplier = (searchV: any) => {
    const [supplierList, setSupplierList] = useState([])
    const [searchValue, setSearchValue] = useState('')
    useDebounce(() => setSearchValue(searchV), 500, [searchV])
    useEffect(() => {
        if (searchValue.length > 1) {
            if (CommonParam.PERSONA__c === Persona.SALES_DISTRICT_LEADER) {
                getSupplierWithoutSupplier(searchValue, setSupplierList)
            } else {
                getSupplierWithSupplier(searchValue, setSupplierList)
            }
        }
    }, [searchValue])
    return supplierList
}

export const retrieveSupplierById = async (Id) => {
    return await SoupService.retrieveDataFromSoup(
        'Asset_Attribute__c',
        {},
        ['Id', 'supplier_name__c', 'supplier_no__c'],
        `SELECT {Asset_Attribute__c:Id},
                         {Asset_Attribute__c:supplier_name__c},
                         {Asset_Attribute__c:supplier_no__c}
                  FROM {Asset_Attribute__c} 
                  WHERE {Asset_Attribute__c:Id} = '${Id}' AND
                        {Asset_Attribute__c:active_flag__c} IS TRUE
                        LIMIT 1`
    )
}

export const retrieveSuppliersByIds = async (Ids: any) => {
    const queryPath = `query/?q=SELECT Id, supplier_name__c, supplier_no__c FROM Asset_Attribute__c WHERE Id IN (${Ids.map(
        (id: any) => `'${id}'`
    ).join(',')}) AND active_flag__c = true`
    return await restDataCommonCall(queryPath, 'GET')
        .then((res) => res.data.records)
        .catch((error) => {
            storeClassLog(Log.MOBILE_ERROR, 'Rep-retrieveSuppliersByIds', 'retrieve suppliers by ids Error: ' + error)
        })
}

type commissionStructType = {
    supplier: string
    supplierId: string
    supplierName: string
    assetAttributeId: string
    rateType: string
    productList: Array<any>
    calcMethod: string
    assetConfig: Array<any>
    accDescription: Array<string>
    equipmentSupplier: Array<any>
}
export const useCommissionStruct = (assetId: string) => {
    const [commissionStruct, setCommissionStruct] = useState<commissionStructType>({
        supplier: '',
        supplierId: '',
        supplierName: '',
        assetAttributeId: '',
        rateType: '',
        productList: [],
        calcMethod: '',
        assetConfig: [],
        accDescription: [],
        equipmentSupplier: []
    })
    useEffect(() => {
        if (assetId) {
            getCommissionStruct(assetId)
                .then((res) => {
                    setCommissionStruct(JSON.parse(res.data))
                })
                .catch((e) => {
                    setCommissionStruct({
                        supplier: '',
                        supplierId: '',
                        supplierName: '',
                        assetAttributeId: '',
                        rateType: '',
                        productList: [],
                        calcMethod: '',
                        assetConfig: [],
                        accDescription: [],
                        equipmentSupplier: []
                    })
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'useCommissionStruct',
                        `retrieve commission structure: ${ErrorUtils.error2String(e)}`
                    )
                })
        }
    }, [assetId])
    return commissionStruct
}

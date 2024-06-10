import { useEffect, useState } from 'react'
import { SoupService } from '../service/SoupService'
import CustomerEquipmentQueries from '../queries/CustomerEquipmentQueries'
import { formatString } from '../utils/CommonUtils'
import { restDataCommonCall } from '../api/SyncUtils'
import _ from 'lodash'
import moment from 'moment'
import { isPersonaCRMBusinessAdmin } from '../../common/enums/Persona'
import { genQueryAllFieldsString } from '../utils/SyncUtils'
import { initServiceRequestHeader, validateSurveyResponse } from '../utils/EquipmentUtils'
import { t } from '../../common/i18n/t'
import { Log } from '../../common/enums/Log'
import { addZeroes } from '../utils/LeadUtils'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../common/enums/MomentStartOf'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

export const useServiceHeaderRequest = (Id, accountId, customerId, visible) => {
    const [request, setRequest] = useState(initServiceRequestHeader(accountId, customerId))
    useEffect(() => {
        if (visible) {
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
                            _soupEntryId: res[0]?._soupEntryId,
                            caller_name__c: res[0]?.caller_name__c,
                            caller_phone_num__c: res[0]?.caller_phone_num__c,
                            canc_reas_cde_descri__c: res[0]?.canc_reas_cde_descri__c,
                            comments__c: res[0]?.comments__c,
                            customer__c: res[0]?.customer__c,
                            customer_id__c: res[0]?.customer_id__c,
                            display_in_asset_tab__c: res[0]?.display_in_asset_tab__c,
                            display_in_service_tab__c: res[0]?.display_in_service_tab__c,
                            email_addr_txt__c: res[0]?.email_addr_txt__c,
                            equip_move_type_cde__c: res[0]?.equip_move_type_cde__c,
                            move_purpose_cde__c: res[0]?.move_purpose_cde__c,
                            move_request_date__c: res[0]?.move_request_date__c,
                            request_gpid__c: res[0]?.request_gpid__c,
                            request_subtype__c: res[0]?.request_subtype__c,
                            requested_by__c: res[0]?.requested_by__c,
                            saleRepName: res[0]?.['requested_by__r.Name'],
                            saleRepPhone: res[0]?.['requested_by__r.MobilePhone'],
                            status__c: res[0]?.status__c,
                            survey_response__c: res[0]?.survey_response__c,
                            trbl_type_cde__c: res[0]?.trbl_type_cde__c,
                            wndw_beg_tme__c: res[0]?.wndw_beg_tme__c,
                            wndw_end_tme__c: res[0]?.wndw_end_tme__c,
                            details_revision_num__c: res[0]?.details_revision_num__c,
                            sched_beg_dte__c: res[0]?.sched_beg_dte__c,
                            survey_general_equip_details_response__c: res[0]?.survey_general_equip_details_response__c,
                            cets_ord_stat_cde__c: res[0]?.cets_ord_stat_cde__c,
                            order_id__c: res[0]?.order_id__c,
                            cets_ord_lne_num__c: res[0]?.cets_ord_lne_num__c,
                            tech_cmnt_txt__c: res[0]?.tech_cmnt_txt__c
                        }
                        setRequest(temp)
                    })
                    .catch((e) => {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'useServiceHeaderRequest',
                            `useServiceHeaderRequest: ${ErrorUtils.error2String(e)}`
                        )
                    })
            } else {
                setRequest(initServiceRequestHeader(accountId, customerId))
            }
        }
    }, [Id, visible])
    return {
        request,
        setRequest
    }
}

export const useServiceRequestMovePurposePicklist = (serviceType: string) => {
    const serviceTypeMapping = {
        Move: 'ONS',
        Pickup: 'PIC',
        Exchange: 'EXI'
    }
    const [movePurposePicklist, setMovePurposePicklist] = useState([])
    const [movePurposeMapping, setMovePurposeMapping] = useState({})
    useEffect(() => {
        if (serviceType) {
            const q =
                'SELECT {Asset_Attribute__c:equip_move_purp_cde__c},{Asset_Attribute__c:equip_move_purp_descr__c} ' +
                "FROM {Asset_Attribute__c} WHERE {Asset_Attribute__c:master_data_type__c} = 'MovePurpose' AND " +
                `{Asset_Attribute__c:equip_move_type_cde__c} = '${serviceTypeMapping[serviceType]}' AND ` +
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
                            'Rep-ServiceMovePurposePicklist',
                            'Move Purpose Picklist Empty: ' + ErrorUtils.error2String(res)
                        )
                    }
                    setMovePurposePicklist(picklist)
                    setMovePurposeMapping(mapping)
                })
                .catch((error) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'Rep-useServiceRequestMovePurposePicklist',
                        'use Move Purpose Error: ' + error
                    )
                })
        }
    }, [serviceType])
    return {
        movePurposePicklist,
        movePurposeMapping
    }
}

export const useRepairRequestTroublePicklist = (serviceType, equipmentTypeCode, equipmentSubTypeCode, troubleCode?) => {
    const [troublePickList, setTroublePickList] = useState([])
    const [troublePickListMapping, setTroublePickListMapping] = useState({})
    useEffect(() => {
        if (serviceType === 'Repair' && equipmentTypeCode && equipmentSubTypeCode) {
            const path =
                'query/?q=SELECT trbl_type_desc__c,trbl_type_cde__c FROM Asset_Attribute__c WHERE master_data_type__c = ' +
                `'TroubleCodes' AND active_flag__c = TRUE AND equip_type_cde__c='${equipmentTypeCode}' AND equip_styp_cde__c='${equipmentSubTypeCode}' AND serv_ord_type_cde__c='GS'`
            restDataCommonCall(path, 'GET').then((res) => {
                const temp = ['-- Select Trouble Type --'].concat(
                    res.data.records.map((v) => {
                        return v.trbl_type_desc__c
                    })
                )
                const tempMapping = {}
                res.data.records.forEach((v) => {
                    tempMapping[v.trbl_type_desc__c] = v.trbl_type_cde__c
                })
                setTroublePickListMapping(tempMapping)
                setTroublePickList(temp)
            })
        } else if (!_.isEmpty(troubleCode)) {
            const path =
                'query/?q=SELECT trbl_type_desc__c,trbl_type_cde__c FROM Asset_Attribute__c WHERE master_data_type__c = ' +
                `'TroubleCodes' AND active_flag__c = TRUE AND trbl_type_cde__c='${troubleCode}' AND serv_ord_type_cde__c='GS'`
            restDataCommonCall(path, 'GET').then((res) => {
                const temp = ['-- Select Trouble Type --'].concat(
                    res.data.records.map((v) => {
                        return v.trbl_type_desc__c
                    })
                )
                const tempMapping = {}
                res.data.records.forEach((v) => {
                    tempMapping[v.trbl_type_desc__c] = v.trbl_type_cde__c
                })
                setTroublePickListMapping(tempMapping)
                setTroublePickList(temp)
            })
        }
    }, [serviceType, equipmentTypeCode, equipmentSubTypeCode, troubleCode])
    return {
        troublePickList,
        troublePickListMapping
    }
}

interface EquipmentDisableSaveInterface {
    overview: any
    activeStep: number
    serviceType: string
    existingServiceLineItems: Array<any>
    exchangeLineItemsEvenSequential: Array<any>
    activePart: number
    moveInStoreLocationList: Array<any>
    moveInStoreLocationDuplicateMessageList: Array<any>
    products: any
    surveyResponse: any
    tempLineItemIndex: number
    changeSurveyAnswer: boolean
    tempRequestLineItem: any
    readonly: boolean
}
export const useDisableSave = (props: EquipmentDisableSaveInterface) => {
    const {
        overview,
        activeStep,
        serviceType,
        existingServiceLineItems,
        exchangeLineItemsEvenSequential,
        activePart,
        moveInStoreLocationList,
        moveInStoreLocationDuplicateMessageList,
        products,
        surveyResponse,
        tempLineItemIndex,
        changeSurveyAnswer,
        tempRequestLineItem,
        readonly
    } = props

    const [disableSave, setDisableSave] = useState(true)
    useEffect(() => {
        if (isPersonaCRMBusinessAdmin() || readonly) {
            if (serviceType === 'Repair') {
                setDisableSave(true)
            } else {
                activeStep === 2 ? setDisableSave(true) : setDisableSave(false)
            }
        } else {
            if (activeStep === 0) {
                if (overview.status__c === 'DRAFT') {
                    if (serviceType === 'Repair') {
                        setDisableSave(_.isEmpty(overview.caller_name__c) || _.isEmpty(overview.trbl_type_cde__c))
                    } else {
                        setDisableSave(
                            !(
                                !_.isEmpty(overview.caller_name__c) &&
                                !_.isEmpty(overview.move_purpose_cde__c) &&
                                !(
                                    !_.isEmpty(overview.wndw_beg_tme__c) &&
                                    !_.isEmpty(overview.wndw_end_tme__c) &&
                                    !moment(
                                        `${moment().utc(true).format(TIME_FORMAT.Y_MM_DD)}T${
                                            overview.wndw_beg_tme__c
                                        }`.slice(0, -1)
                                    ).isBefore(
                                        `${moment().utc(true).format(TIME_FORMAT.Y_MM_DD)}T${
                                            overview.wndw_end_tme__c
                                        }`.slice(0, -1)
                                    )
                                ) &&
                                !_.isEmpty(overview.move_request_date__c) &&
                                moment(overview.move_request_date__c)
                                    .endOf(MOMENT_STARTOF.DAY)
                                    .isAfter(moment().add(serviceType === 'Exchange' ? 7 : 1, 'days'))
                            )
                        )
                    }
                } else {
                    if (overview.equip_move_type_cde__c === 'Repair') {
                        setDisableSave(true)
                    } else {
                        setDisableSave(false)
                    }
                }
            } else if (activeStep === 1) {
                if (overview.status__c === 'DRAFT') {
                    setDisableSave(false)
                    if (serviceType === 'Exchange') {
                        if (activePart === 6) {
                            setDisableSave(true)
                        } else if (activePart !== 4) {
                            const originLength = existingServiceLineItems.length
                            const exchangeLength = exchangeLineItemsEvenSequential.length
                            if (originLength > 0 && exchangeLength === originLength) {
                                setDisableSave(false)
                            } else {
                                setDisableSave(true)
                            }
                        } else {
                            if (existingServiceLineItems[tempLineItemIndex].Equip_type_cde__c === 'VEN') {
                                setDisableSave(
                                    !(
                                        _.isEmpty(_.filter(products, (item) => item.equip_mech_rte_amt__c === null)) &&
                                        _.isEmpty(_.filter(products, (item) => item.equip_mech_rte_amt__c === 0)) &&
                                        _.isEmpty(_.filter(products, (item) => item.equip_mech_rte_amt__c === ''))
                                    ) ||
                                        _.isEmpty(products) ||
                                        tempRequestLineItem.FSV_Line_Item__c
                                )
                            } else if (existingServiceLineItems[tempLineItemIndex].Equip_type_cde__c === 'POS') {
                                setDisableSave(_.isEmpty(products))
                            } else {
                                setDisableSave(false)
                            }
                        }
                    } else if (serviceType === 'Move') {
                        if (
                            moveInStoreLocationList.includes('') ||
                            moveInStoreLocationList.includes(undefined) ||
                            moveInStoreLocationList.includes(null) ||
                            moveInStoreLocationList.length !== existingServiceLineItems.length ||
                            moveInStoreLocationDuplicateMessageList.includes(true)
                        ) {
                            setDisableSave(true)
                        } else {
                            setDisableSave(false)
                        }
                    } else {
                        setDisableSave(false)
                    }
                } else {
                    setDisableSave(false)
                }
            } else if (activeStep === 2) {
                if (overview.status__c === 'DRAFT' || changeSurveyAnswer) {
                    setDisableSave(!validateSurveyResponse(surveyResponse))
                } else {
                    setDisableSave(true)
                }
            } else {
                setDisableSave(false)
            }
        }
    }, [
        overview,
        activeStep,
        serviceType,
        existingServiceLineItems,
        exchangeLineItemsEvenSequential,
        activePart,
        moveInStoreLocationList,
        moveInStoreLocationDuplicateMessageList,
        products,
        surveyResponse,
        tempLineItemIndex,
        changeSurveyAnswer,
        tempRequestLineItem
    ])
    return disableSave
}
export const useEnableReminder = (overview, headerRequestId, activeStep) => {
    const [enableSave, setEnableSave] = useState(true)
    useEffect(() => {
        if (headerRequestId) {
            SoupService.retrieveDataFromSoup(
                'Request__c',
                {},
                ['sched_beg_dte__c'],
                'SELECT {Request__c:sched_beg_dte__c},{Request__c:_soupEntryId}' +
                    ` FROM {Request__c} WHERE {Request__c:request_id__c}='${headerRequestId}'` +
                    " AND {Request__c:request_subtype__c}='Move Request Line Item'" +
                    ' ORDER BY {Request__c:sched_beg_dte__c} ASC NULLS LAST'
            ).then((res) => {
                if (activeStep === 2) {
                    if (overview.status__c === 'DRAFT') {
                        setEnableSave(true)
                    } else if (overview.status__c === 'SUBMITTED') {
                        const item = _.filter(res, function (n) {
                            return n.sched_beg_dte__c !== '1900-01-01'
                        })
                        setEnableSave(
                            _.isEmpty(item[0]?.sched_beg_dte__c) ||
                                moment(item[0]?.sched_beg_dte__c)
                                    .endOf(MOMENT_STARTOF.DAY)
                                    .isAfter(moment().add(7, 'days'))
                        )
                    } else {
                        setEnableSave(false)
                    }
                } else {
                    setEnableSave(false)
                }
            })
        }
    }, [activeStep, overview, headerRequestId])
    return enableSave
}

export const useExistingServiceLineItems = (request, refreshTimes, serviceType) => {
    const [list, setList] = useState([])
    const today = moment().format(TIME_FORMAT.Y_MM_DD)
    useEffect(() => {
        if (request?.Id) {
            const q =
                serviceType === 'Exchange'
                    ? 'SELECT R.{Request__c:Id},R.{Request__c:equip_site_id__c},R.{Request__c:prev_equip_site_id__c}, R.{Request__c:Sls_plan_cde__c},R.{Request__c:Serv_ctrct_id__c},R.{Request__c:equip_site_desc__c},' +
                      'R.{Request__c:Equip_type_cde__c},R.{Request__c:Equip_styp_cde__c},R.{Request__c:order_line_num__c}, CAST(R.{Request__c:order_line_num__c} AS integer) AS orderLineNumber,' +
                      'A.{Asset:equip_site_id__c},A.{Asset:equip_styp_cde__c},A.{Asset:Id},A.{Asset:Name},A.{Asset:ident_asset_num__c},A.{Asset:mnth_pymt_amt__c},R.{Request__c:sched_beg_dte__c},R.{Request__c:submitted_date__c},' +
                      'R.{Request__c:requested_by__r.Name},R.{Request__c:order_closed_date__c},R.{Request__c:order_cancelled_date__c},R.{Request__c:status__c},' +
                      'R.{Request__c:canc_reas_cde_descri__c},R.{Request__c:ord_rcv_dte_tme__c},R.{Request__c:equip_styp_desc__c},R.{Request__c:equip_type_desc__c},R.{Request__c:equip_grphc_id__c},R.{Request__c:request_subtype__c},' +
                      'R.{Request__c:LastModifiedDate},R.{Request__c:_soupEntryId} ' +
                      `FROM {Request__c} R JOIN (SELECT * FROM {Asset} WHERE ({Asset:agree_end_dte__c} > '${today}' OR {Asset:agree_end_dte__c} IS NULL) GROUP BY {Asset:ident_item_id__c}) A ON R.{Request__c:ident_item_id__c} = A.{Asset:ident_item_id__c} ` +
                      `WHERE {Request__c:parent_request_record__c}='${request.Id}' AND {Request__c:request_subtype__c}='Move Request Line Item' ` +
                      'AND (orderLineNumber%2)!=0 ORDER BY orderLineNumber ASC'
                    : 'SELECT R.{Request__c:Id},R.{Request__c:survey_response__c},R.{Request__c:equip_site_desc__c},R.{Request__c:Equip_type_cde__c},R.{Request__c:Equip_styp_cde__c},' +
                      'R.{Request__c:order_line_num__c}, CAST(R.{Request__c:order_line_num__c} AS integer) AS orderLineNumber,' +
                      'A.{Asset:Name},A.{Asset:ident_asset_num__c},R.{Request__c:sched_beg_dte__c},R.{Request__c:submitted_date__c},' +
                      'R.{Request__c:requested_by__r.Name},R.{Request__c:order_closed_date__c},R.{Request__c:order_cancelled_date__c},R.{Request__c:status__c},' +
                      'R.{Request__c:canc_reas_cde_descri__c},R.{Request__c:ord_rcv_dte_tme__c},R.{Request__c:equip_styp_desc__c},R.{Request__c:equip_type_desc__c},R.{Request__c:Sls_plan_cde__c},R.{Request__c:equip_grphc_id__c},' +
                      'R.{Request__c:request_subtype__c},R.{Request__c:LastModifiedDate},R.{Request__c:_soupEntryId} ' +
                      `FROM {Request__c} R JOIN (SELECT * FROM {Asset} WHERE ({Asset:agree_end_dte__c} > '${today}' OR {Asset:agree_end_dte__c} IS NULL) GROUP BY {Asset:ident_item_id__c}) A ON R.{Request__c:ident_item_id__c} = A.{Asset:ident_item_id__c} ` +
                      `WHERE {Request__c:parent_request_record__c}='${request.Id}' AND {Request__c:request_subtype__c}='Move Request Line Item' ` +
                      'ORDER BY orderLineNumber ASC'
            SoupService.retrieveDataFromSoup(
                'Request__c',
                {},
                serviceType === 'Exchange'
                    ? [
                          'Id',
                          'equip_site_id__c',
                          'prev_equip_site_id__c',
                          'Sls_plan_cde__c',
                          'Serv_ctrct_id__c',
                          'equip_site_desc__c',
                          'Equip_type_cde__c',
                          'Equip_styp_cde__c',
                          'order_line_num__c',
                          'orderLineNumber',
                          'asset_equip_site_id__c',
                          'equip_styp_cde__c',
                          'assetId',
                          'Name',
                          'ident_asset_num__c',
                          'Mnth_pymt_amt__c',
                          'sched_beg_dte__c',
                          'submitted_date__c',
                          'requested_by__r.Name',
                          'order_closed_date__c',
                          'order_cancelled_date__c',
                          'status__c',
                          'canc_reas_cde_descri__c',
                          'ord_rcv_dte_tme__c',
                          'equip_styp_desc__c',
                          'equip_type_desc__c',
                          'equip_grphc_id__c',
                          'request_subtype__c',
                          'LastModifiedDate'
                      ]
                    : [
                          'Id',
                          'survey_response__c',
                          'equip_site_desc__c',
                          'Equip_type_cde__c',
                          'Equip_styp_cde__c',
                          'order_line_num__c',
                          'orderLineNumber',
                          'Name',
                          'ident_asset_num__c',
                          'sched_beg_dte__c',
                          'submitted_date__c',
                          'requested_by__r.Name',
                          'order_closed_date__c',
                          'order_cancelled_date__c',
                          'status__c',
                          'canc_reas_cde_descri__c',
                          'ord_rcv_dte_tme__c',
                          'equip_styp_desc__c',
                          'equip_type_desc__c',
                          'Sls_plan_cde__c',
                          'equip_grphc_id__c',
                          'request_subtype__c',
                          'LastModifiedDate'
                      ],
                q
            ).then((res) => {
                setList(res)
            })
        }
    }, [request, refreshTimes, serviceType])
    return list
}

export const useEquipmentTypeListByTypeCode = (typeCode) => {
    const [list, setList] = useState([])
    useEffect(() => {
        // setShowLoading(true)
        if (typeCode) {
            const path =
                'query/?q=SELECT Id, equip_type_desc__c, equip_type_cde__c FROM Asset_Attribute__c ' +
                "WHERE master_data_type__c = 'EquipmentType' AND active_flag__c = TRUE " +
                `AND equip_type_cde__c = '${typeCode}' ORDER BY equip_type_desc__c`
            restDataCommonCall(path, 'GET')
                .then((res) => {
                    setList(res.data.records)
                })
                .finally(() => {
                    // setTimeout(() => {
                    //     setShowLoading(false)
                    // }, 0)
                })
        }
    }, [])
    return list
}

export const useExchangeLineItemsEvenSequential = (headerRequestId: string, refreshTimes: number) => {
    const [items, setItems] = useState([])
    const { allFields, allFieldsString } = genQueryAllFieldsString('Request__c')
    useEffect(() => {
        if (headerRequestId) {
            SoupService.retrieveDataFromSoup(
                'Request__c',
                {},
                [...allFields, 'orderLineNumber'],
                `SELECT ${allFieldsString}, CAST({Request__c:order_line_num__c} AS integer) AS orderLineNumber,` +
                    '{Request__c:_soupEntryId}' +
                    ` FROM {Request__c} WHERE {Request__c:request_id__c}='${headerRequestId}'` +
                    " AND {Request__c:request_subtype__c}='Move Request Line Item'" +
                    ' AND (orderLineNumber%2)=0 ORDER BY orderLineNumber ASC'
            )
                .then((res) => {
                    const temp = _.cloneDeep(res)
                    const newRes = []
                    temp.forEach((v) => {
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
                        newRes.push(v)
                    })
                    setItems(newRes)
                })
                .catch((e) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'useExchangeLineItemsEvenSequential',
                        `useExchangeLineItemsEvenSequential: ${ErrorUtils.error2String(e)}`
                    )
                })
        } else {
            setItems([])
        }
    }, [headerRequestId, refreshTimes])
    return items
}

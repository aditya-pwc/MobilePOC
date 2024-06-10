/**
 * @description Lead hooks.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 * @date 2021-04-12
 */
import { useEffect, useState } from 'react'
import LeadQueries, { teamLeadsQ } from '../queries/LeadQueries'
import { database } from '../common/SmartSql'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SoupService } from '../service/SoupService'
import { formatString } from '../utils/CommonUtils'
import TaskQueries from '../queries/TaskQueries'
import CustomerToRouteQueries from '../queries/CustomerToRouteQueries'
import ContactQueries from '../queries/ContactQueries'
import { CommonParam } from '../../common/CommonParam'
import store from '../redux/store/Store'
import _ from 'lodash'
import { calculateRadioGroup, validatePhone } from '../helper/rep/ContactFormHelper'
import { addZeroes, checkLeadEdited, removeLevelIndicator } from '../utils/LeadUtils'
import { Instrumentation } from '@appdynamics/react-native-agent'
import moment from 'moment'
import { t } from '../../common/i18n/t'
import {
    restApexCommonCall,
    restDataCommonCall,
    syncUpObjCreateFromMem,
    syncUpObjUpdateFromMem
} from '../api/SyncUtils'
import { useDebounce } from './CommonHooks'
import {
    isPersonaCRMBusinessAdmin,
    isPersonaFSManager,
    isPersonaFSR,
    isPersonaPSR,
    judgePersona,
    Persona
} from '../../common/enums/Persona'
import BaseInstance from '../../common/BaseInstance'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../common/enums/MomentStartOf'
import { getRecordTypeIdByDeveloperName } from '../utils/MerchManagerUtils'
import FilterSortQueries from '../queries/FilterSortQueries'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import { CommonApi } from '../../common/api/CommonApi'
import dayjs from 'dayjs'
import { SELLING_DP_SLS_METH_LIST } from './DistributionPointHooks'

const getAllLeadsSearchQuery = (searchV) => {
    const searchValue = searchV.replaceAll("'", '%').replaceAll('`', '%').replaceAll('‘', '%').replaceAll('’', '%')
    return (
        'SELECT {Lead__x:Id},{Lead__x:ExternalId},{Lead__x:PD_Contact_Made_Counter_c__c},{Lead__x:PD_Call_Counter_c__c},' +
        '{Lead__x:COF_Rejected_c__c},{Lead__x:Contact_Made_Counter_c__c},{Lead__x:Deferred_Resume_Date_c__c} ' +
        'IS NOT NULL AND (date("now","-30 days")<date({Lead__x:Deferred_Resume_Date_c__c}) ' +
        'and date({Lead__x:Deferred_Resume_Date_c__c})<=date("now")) as Active,{Lead__x:Deferred_Resume_Date_c__c},' +
        '{Lead__x:Status__c},{Lead__x:Phone__c}, {Lead__x:Company__c}, {Lead__x:Tier_c__c}, ' +
        '{Lead__x:Call_Counter_c__c}, {Lead__x:Owner_GPID_c__c}, {Lead__x:City__c}, {Lead__x:Country__c}, ' +
        '{Lead__x:Street__c}, {Lead__x:State__c},' +
        '{Lead__x:Last_Task_Modified_Date_c__c}, {Lead__x:PostalCode__c}, {Lead__x:Pre_qualified_c__c}, ' +
        '{Lead__x:_soupEntryId},{Lead__x:__local__},{Lead__x:__locally_created__},{Lead__x:__locally_updated__},' +
        '{Lead__x:__locally_deleted__} ' +
        'FROM {Lead__x} WHERE {Lead__x:Status__c}="Open" ' +
        'AND ({Lead__x:Is_Removed_c__c} IS NOT TRUE OR {Lead__x:Pre_qualified_c__c} IS TRUE) ' +
        `AND ({Lead__x:Company__c} LIKE '%${searchValue}%' OR {Lead__x:City__c} LIKE '%${searchValue}%' ` +
        `OR {Lead__x:Phone__c} LIKE '%${searchValue}%' OR {Lead__x:Street__c} LIKE '%${searchValue}%' ` +
        `OR {Lead__x:State__c} LIKE '%${searchValue}%' OR {Lead__x:PostalCode__c} LIKE '%${searchValue}%') ` +
        'ORDER BY Active DESC NULLS LAST,' +
        '{Lead__x:Pre_qualified_c__c} DESC NULLS LAST, {Lead__x:Tier_c__c} ASC NULLS LAST,' +
        '{Lead__x:Company__c} COLLATE NOCASE'
    )
}

export const useAllLeadsPagination = (
    isFocused: boolean,
    isLoading: boolean,
    dropDownRef,
    searchValue,
    filterQuery
) => {
    const [allLeads, setAllLeads] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [cursor, setCursor] = useState(null)
    const [currentPage, setCurrentPage] = useState(null)
    const [hasAdded, setHasAdded] = useState(false)
    const [needRefreshCursor, setNeedRefreshCursor] = useState(false)

    const createNewCursor = async () => {
        let query
        if (searchValue.length >= 3) {
            query = getAllLeadsSearchQuery(searchValue)
        } else {
            query = filterQuery || LeadQueries.getAllLeadsQuery.q
        }
        const { cursor, result } = await BaseInstance.sfSoupEngine.createNewCursor(
            'Lead__x',
            query,
            LeadQueries.getAllLeadsQuery.f,
            5
        )
        setAllLeads(result)
        setCursor(cursor)
        setTotalPages(cursor.totalPages)
        setCurrentPage(cursor.currentPageIndex)
    }

    useEffect(() => {
        if (
            (isFocused && currentPage === null) ||
            (isFocused && needRefreshCursor) ||
            (isFocused && searchValue.length >= 3) ||
            (isFocused && searchValue === '') ||
            (isFocused && !isLoading)
        ) {
            setHasAdded(false)
            setNeedRefreshCursor(false)
            if (cursor) {
                BaseInstance.sfSoupEngine.closeCursor(cursor).then(() => {
                    createNewCursor()
                })
            } else {
                createNewCursor()
            }
        }
    }, [isLoading, hasAdded, needRefreshCursor, searchValue, filterQuery, isFocused])

    useEffect(() => {
        if (offset > 0 && currentPage + 1 < totalPages) {
            BaseInstance.sfSoupEngine.moveCursorToNextPage(cursor).then((newCursor) => {
                const entries = newCursor.currentPageOrderedEntries
                const result: any = [
                    ...allLeads,
                    ...BaseInstance.sfSoupEngine.buildOriginQueryResults(
                        'Lead__x',
                        entries,
                        LeadQueries.getAllLeadsQuery.f
                    )
                ]
                setAllLeads(result)
                setCurrentPage((currentPage) => {
                    return currentPage + 1
                })
                setCursor(newCursor)
                if (newCursor.totalPages === newCursor.currentPageIndex + 1) {
                    BaseInstance.sfSoupEngine.closeCursor(newCursor)
                }
            })
        }
    }, [offset])
    return {
        allLeads,
        offset,
        setOffset,
        hasAdded,
        setHasAdded,
        setNeedRefreshCursor
    }
}

const getMyLeadsSearchQuery = (searchV: string, recordTypeId: string) => {
    const searchValue = searchV.replaceAll("'", '%').replaceAll('`', '%').replaceAll('‘', '%').replaceAll('’', '%')
    const filterQ = isPersonaFSManager()
        ? formatString(teamLeadsQ, [recordTypeId || '', CommonParam.userId])
        : `FROM {Lead__x} WHERE {Lead__x:Owner_GPID_c__c}='${CommonParam.GPID__c}' AND {Lead__x:Status__c}!='Open'  AND {Lead__x:Lead_Type_c__c}!='Change of Ownership' `
    return (
        'SELECT {Lead__x:Id}, {Lead__x:Lead_Type_c__c},{Lead__x:PD_Call_Counter_c__c}, {Lead__x:PD_Contact_Made_Counter_c__c},' +
        '{Lead__x:COF_Rejected_c__c},{Lead__x:Contact_Made_Counter_c__c},' +
        '({Lead__x:Deferred_Resume_Date_c__c} IS NOT NULL ' +
        'AND (date("now","-30 days")<date({Lead__x:Deferred_Resume_Date_c__c}) ' +
        'AND date({Lead__x:Deferred_Resume_Date_c__c})<=date("now"))) ' +
        "OR ({Lead__x:COF_Rejected_c__c} IS NOT NULL AND {Lead__x:COF_Rejected_c__c}='1') as Active, " +
        '{Lead__x:Status__c},{Lead__x:COF_Triggered_c__c},{Lead__x:Deferred_Resume_Date_c__c},{Lead__x:Phone__c}, ' +
        '{Lead__x:Company__c}, {Lead__x:Tier_c__c}, ' +
        '{Lead__x:Call_Counter_c__c}, {Lead__x:Owner_GPID_c__c}, {Lead__x:City__c}, {Lead__x:Country__c}, ' +
        '{Lead__x:Street__c}, {Lead__x:State__c},' +
        '{Lead__x:Last_Task_Modified_Date_c__c}, {Lead__x:PostalCode__c}, {Lead__x:Pre_qualified_c__c}, ' +
        '{Lead__x:Lead_Longitude_c__c}, {Lead__x:Lead_Latitude_c__c}, ' +
        '{Lead__x:_soupEntryId},{Lead__x:__local__},{Lead__x:__locally_created__},{Lead__x:__locally_updated__},' +
        '{Lead__x:__locally_deleted__} ' +
        filterQ +
        `AND ({Lead__x:Company__c} LIKE '%${searchValue}%' OR {Lead__x:City__c} LIKE '%${searchValue}%' ` +
        `OR {Lead__x:Phone__c} LIKE '%${searchValue}%' OR {Lead__x:Street__c} LIKE '%${searchValue}%' ` +
        `OR {Lead__x:State__c} LIKE '%${searchValue}%' OR {Lead__x:PostalCode__c} LIKE '%${searchValue}%')` +
        'ORDER BY {Lead__x:COF_Triggered_c__c} NULLS FIRST, Active DESC NULLS LAST,' +
        '{Lead__x:Last_Task_Modified_Date_c__c} NULLS LAST,{Lead__x:Company__c} COLLATE NOCASE'
    )
}

export const useMyLeads = (
    isFocused: boolean,
    userGPID: string,
    isLoading: boolean,
    isMounted,
    searchValue,
    filterQuery
) => {
    const [myLeads, setMyLeads] = useState([])
    const [refreshTimes, setRefreshTimes] = useState(0)
    const queryMyLeads = async () => {
        const managerId = await getRecordTypeIdByDeveloperName('Manager_Relationship', 'User_Stats__c')
        let query
        let fields = LeadQueries.getMyLeadsQuery.f
        if (searchValue.length >= 3) {
            query = getMyLeadsSearchQuery(searchValue, managerId || '')
        } else {
            if (filterQuery) {
                query = filterQuery
                fields = FilterSortQueries.filterMyLeadsQuery.f
            } else {
                query = isPersonaFSManager()
                    ? formatString(LeadQueries.getMyLeadsQuery.qTeam, [managerId || '', CommonParam.userId])
                    : formatString(LeadQueries.getMyLeadsQuery.q, [userGPID])
            }
        }
        SoupService.retrieveDataFromSoup('Lead__x', {}, fields, query).then((res) => {
            setMyLeads(res)
        })
    }
    useEffect(() => {
        if (isFocused) {
            queryMyLeads()
        }
    }, [isLoading, isMounted, refreshTimes, searchValue, filterQuery, isFocused])
    return {
        myLeads,
        setRefreshTimes
    }
}

export const findAccountName = async (Id) => {
    if (Id) {
        const result = await restDataCommonCall(`query/?q=SELECT Id,Name FROM Account WHERE Id = '${Id}'`, 'GET')

        return result.data?.records[0].Name
    }
    return ''
}

export const useFindKAName = (l) => {
    const [KAName, setKAName] = useState('')
    const [KADName, setKADName] = useState('')
    useEffect(() => {
        if (l.Proposed_Key_Account_c__c) {
            findAccountName(l.Proposed_Key_Account_c__c).then((res) => {
                setKAName(res)
            })
        }
        if (l.Proposed_Key_Account_Division_c__c) {
            findAccountName(l.Proposed_Key_Account_Division_c__c).then((res) => {
                setKADName(res)
            })
        } else {
            setKADName('')
        }
    }, [l])
    return {
        KAName,
        KADName
    }
}
export const filterRelaterCustomerMapLabel = async (Id) => {
    let relatedCustomerLabel = ''
    if (Id) {
        const path = `query/?q=SELECT Id,CUST_UNIQ_ID_VAL__c,Name FROM Account WHERE Id='${Id}'`
        const list = restDataCommonCall(path, 'GET')
        const v = list?.data?.records[0]
        relatedCustomerLabel = `${v?.Name} ${v?.CUST_UNIQ_ID_VAL__c}`
    }

    return relatedCustomerLabel
}

export const useLeadDetail = (leadSoupEntryId, saveTimes, Id, ExternalId) => {
    // Missing field in the placeholder below:
    // CreatedBy_GPID_c__c: string,
    // Device_Source_c__c: string,
    // LastModifiedBy_GPID_c__c: string,
    // Source_ID_c__c: string
    const leadPlaceholder = {
        Action_Required_c__c: null,
        Active_Base_Population_c__c: null,
        Additional_Prospect_Comments_c__c: null,
        Alcohol_c__c: null,
        Annual_Sales_c__c: null,
        BUSN_SGMNTTN_LVL_1_NM_c__c: null,
        BUSN_SGMNTTN_LVL_2_NM_c__c: null,
        BUSN_SGMNTTN_LVL_3_NM_c__c: null,
        BUSN_SGMNTTN_LVL_4_NM_c__c: null,
        BUSN_SGMNTTN_LVL_1_CDV_c__c: null,
        BUSN_SGMNTTN_LVL_2_CDV_c__c: null,
        BUSN_SGMNTTN_LVL_3_CDV_c__c: null,
        BUSN_SGMNTTN_LVL_4_CDV_c__c: null,
        Billing_Address_City_c__c: null,
        Billing_Address_Country_c__c: null,
        Billing_Address_Same_as_Shipping_c__c: null,
        Billing_Address_State_c__c: null,
        Billing_Address_Street_c__c: null,
        Billing_Address_Zip_c__c: null,
        Business_Type_c__c: null,
        CMB_Notes_c__c: null,
        COF_Rejected_c__c: null,
        COF_Triggered_c__c: null,
        Call_Counter_c__c: null,
        Chain_Store_Number_c__c: null,
        Chain_c__c: null,
        City__c: null,
        Company__c: null,
        Contact_Made_Counter_c__c: null,
        Country__c: null,
        CreatedDate__c: null,
        Current_Distributor_c__c: null,
        Current_Price_BC_c__c: null,
        Current_Price_FTN_c__c: null,
        Customer_Number_c__c: null,
        Customer_Type_c__c: null,
        DUP_COF_c__c: null,
        Days_Open_c__c: null,
        Deferred_Resume_Date_c__c: null,
        Delivery_Days_c__c: null,
        Delivery_Frequency_c__c: null,
        Delivery_Method_c__c: null,
        Email__c: null,
        Estimated_BC_Volume_c__c: null,
        Estimated_Coolers_c__c: null,
        Estimated_FTN_Volume_c__c: null,
        Estimated_Fountain_c__c: null,
        Estimated_Other_Equip_c__c: null,
        Estimated_Vendor_Volume_c__c: null,
        Ethnicity_c__c: null,
        ExternalId: null,
        FF_LINK_c__c: null,
        Friday_Delivery_End_c__c: null,
        Friday_Delivery_Start_c__c: null,
        Friday_End_Hours_of_Operation_c__c: null,
        Friday_Start_Hours_of_Operation_c__c: null,
        HQ_Address_City_c__c: null,
        HQ_Address_Country_c__c: null,
        HQ_Address_Postal_Code_c__c: null,
        HQ_Address_State_c__c: null,
        HQ_Address_Street_c__c: null,
        HQ_Phone_c__c: null,
        Id: null,
        K_12_Enrollment_c__c: null,
        LEAD_ID_c__c: null,
        LastModifiedDate__c: null,
        LastName__c: null,
        Last_Task_Modified_Date_c__c: null,
        LeadSource__c: null,
        Lead_Sub_Status_c__c: null,
        Lead_Type_c__c: null,
        original_customer_c__c: null,
        original_customer_number_c__c: null,
        Lead_Unique_Id_c__c: null,
        Location_c__c: null,
        Location_ID_c__c: null,
        Lodging_Catering_c__c: null,
        Market_c__c: null,
        Market_ID_c__c: null,
        Monday_Delivery_End_c__c: null,
        Monday_Delivery_Start_c__c: null,
        Monday_End_Hours_of_Operation_c__c: null,
        Monday_Start_Hours_of_Operation_c__c: null,
        Moved_to_Negotiate_Time_c__c: null,
        Number_Units_c__c: null,
        Number_of_Rooms_c__c: null,
        Other_Equipment_Notes_c__c: null,
        Other_Volume_c__c: null,
        OwnerId__c: null,
        Owner_GPID_c__c: null,
        Owner_Name_c__c: null,
        PD_Assigned_c__c: null,
        PD_Call_Counter_c__c: null,
        PD_Contact_Made_Counter_c__c: null,
        POS_Needs_c__c: null,
        Payment_Method_c__c: null,
        Phone__c: null,
        PostalCode__c: null,
        Pre_Call_Comments_c__c: null,
        Pre_Open_c__c: null,
        Pre_qualified_c__c: null,
        Primary_Language_c__c: null,
        Product_Group_c__c: null,
        Program_Offered_c__c: null,
        Proposed_Key_Account_Division_c__c: null,
        Proposed_Key_Account_c__c: null,
        Proposed_Price_BC_c__c: null,
        Proposed_Price_FTN_c__c: null,
        Rating_c__c: null,
        Rebates_BC_c__c: null,
        Rebates_FTN_c__c: null,
        Region_c__c: null,
        Region_ID_c__c: null,
        Rep_Last_Modified_Date_c__c: null,
        Route_c__c: null,
        Sales_Method_c__c: null,
        Saturday_Delivery_End_c__c: null,
        Saturday_Delivery_Start_c__c: null,
        Saturday_End_Hours_of_Operation_c__c: null,
        Saturday_Start_Hours_of_Operation_c__c: null,
        Seasonal_Close_End_Date_c__c: null,
        Seasonal_Close_Start_Date_c__c: null,
        Secondary_Cuisine_c__c: null,
        Send_for_COF_c__c: null,
        Service_Location_c__c: null,
        Star_Level_c__c: null,
        State__c: null,
        Status__c: null,
        Street__c: null,
        Suggested_FSR_Nat_Route_Number_c__c: null,
        Suggested_FSR_Loc_Route_Number_c__c: null,
        Sunday_Delivery_End_c__c: null,
        Sunday_Delivery_Start_c__c: null,
        Sunday_End_Hours_of_Operation_c__c: null,
        Sunday_Start_Hours_of_Operation_c__c: null,
        Temp_Charge_c__c: null,
        Thursday_Delivery_End_c__c: null,
        Thursday_Delivery_Start_c__c: null,
        Thursday_End_Hours_of_Operation_c__c: null,
        Thursday_Start_Hours_of_Operation_c__c: null,
        Tier_c__c: null,
        Tuesday_Delivery_End_c__c: null,
        Tuesday_Delivery_Start_c__c: null,
        Tuesday_End_Hours_of_Operation_c__c: null,
        Tuesday_Start_Hours_of_Operation_c__c: null,
        User_Link_1_c__c: null,
        User_Link_2_c__c: null,
        User_Link_3_c__c: null,
        User_Link_Label_1_c__c: null,
        User_Link_Label_2_c__c: null,
        User_Link_Label_3_c__c: null,
        VENUES_ON_SITE_c__c: null,
        Website__c: null,
        Wednesday_Delivery_End_c__c: null,
        Wednesday_Delivery_Start_c__c: null,
        Wednesday_End_Hours_of_Operation_c__c: null,
        Wednesday_Start_Hours_of_Operation_c__c: null,
        YELP_HOT_AND_NEW_c__c: null,
        Years_In_Business_c__c: null,
        __local__: '1',
        __locally_created__: '0',
        __locally_deleted__: '0',
        __locally_updated__: '0',
        _soupEntryId: null,
        attributes: { type: 'Lead__x' },
        ff_DOORDASH_c__c: null,
        ff_FACEBOOK_c__c: null,
        ff_FOURSQUARE_c__c: null,
        ff_GRUBHUB_c__c: null,
        ff_MEAL_BREAKFAST_c__c: null,
        ff_MEAL_DINNER_c__c: null,
        ff_MEAL_LUNCH_c__c: null,
        ff_MEAL_TAKEOUT_c__c: null,
        ff_POSTMATES_c__c: null,
        ff_UBEREATS_c__c: null,
        ff_YELP_c__c: null,
        gas_station_c__c: null,
        Assigned_Date_c__c: null,
        Business_Won_Date_c__c: null,
        Customer_Submitted_Date_c__c: null,
        Move_To_No_Sale_Date_c__c: null,
        No_Go_Checkbox_c__c: null,
        No_Go_Date_c__c: null,
        No_Go_Reason_c__c: null,
        Pre_Qualified_Contact_c__c: null,
        Lead_Latitude_c__c: null,
        Lead_Longitude_c__c: null,
        Pre_Qualified_Time_c__c: null,
        Rejection_Reason_Text_c__c: null
    }
    const [leadDetail, setLeadDetail] = useState(leadPlaceholder)
    const [refreshTimes, setRefreshTimes] = useState(0)
    useEffect(() => {
        if (leadSoupEntryId !== undefined || Id !== undefined || ExternalId !== undefined) {
            database()
                .use('Lead__x')
                .select()
                .where([
                    {
                        leftTable: 'Lead__x',
                        leftField: '_soupEntryId',
                        rightField: leadSoupEntryId || "'a'",
                        operator: '='
                    },
                    {
                        type: 'OR',
                        leftTable: 'Lead__x',
                        leftField: 'Id',
                        rightField: "'" + (Id || '123') + "'",
                        operator: '='
                    },
                    {
                        type: 'OR',
                        leftTable: 'Lead__x',
                        leftField: 'ExternalId',
                        rightField: "'" + (ExternalId || '123') + "'",
                        operator: '='
                    }
                ])
                .getData()
                .then(async (res) => {
                    if (res.length > 0) {
                        const newValue = _.cloneDeep(res[0])
                        newValue.Rebates_FTN_c__c = newValue.Rebates_FTN_c__c
                            ? addZeroes(newValue.Rebates_FTN_c__c + '')
                            : null
                        newValue.Current_Price_FTN_c__c = newValue.Current_Price_FTN_c__c
                            ? addZeroes(newValue.Current_Price_FTN_c__c + '')
                            : null
                        newValue.Proposed_Price_FTN_c__c = newValue.Proposed_Price_FTN_c__c
                            ? addZeroes(newValue.Proposed_Price_FTN_c__c + '')
                            : null
                        newValue.Current_Price_BC_c__c = newValue.Current_Price_BC_c__c
                            ? addZeroes(newValue.Current_Price_BC_c__c + '')
                            : null
                        newValue.Rebates_BC_c__c = newValue.Rebates_BC_c__c
                            ? addZeroes(newValue.Rebates_BC_c__c + '')
                            : null
                        newValue.Proposed_Price_BC_c__c = newValue.Proposed_Price_BC_c__c
                            ? addZeroes(newValue.Proposed_Price_BC_c__c + '')
                            : null

                        newValue.Proposed_Key_Account_Name = null
                        newValue.Proposed_Key_Account_Division_Name = null

                        return newValue
                    }
                })
                .then((val) => {
                    if (val.original_customer_c__c) {
                        const path = `query/?q=SELECT Id,CUST_UNIQ_ID_VAL__c,Name FROM Account WHERE Id='${val.original_customer_c__c}'`
                        restDataCommonCall(path, 'GET').then((list) => {
                            const v = list.data.records[0]
                            val.relatedCustomerLabel = `${v?.Name} ${v?.CUST_UNIQ_ID_VAL__c}`
                            setLeadDetail(val)
                        })
                    } else {
                        val.relatedCustomerLabel = ''
                        setLeadDetail(val)
                    }
                })
        }
    }, [leadSoupEntryId, saveTimes, Id, refreshTimes, ExternalId])
    return {
        leadDetail,
        setLeadDetail,
        setRefreshTimes
    }
}

export const useBusinessSegmentPicklist = () => {
    const [channelList, setChannelList] = useState([])
    const [segmentList, setSegmentList] = useState<any>({
        Channel1: [],
        Channel2: []
    })
    const [subSegmentList, setSubSegmentList] = useState<any>({
        Segment1: [],
        Segment2: [],
        Segment3: [],
        Segment4: []
    })
    const [countryList, setCountryList] = useState([])
    const [stateList, setStateList] = useState<any>({ 'United States': [] })
    const [dpOptions, setDpOptions] = useState<any>({
        DELIVERY_FREQUENCY_MAPPING: {},
        DELIVERY_FREQUENCY_OPTIONS: [],
        DELIVERY_METHOD_MAPPING: {},
        DELIVERY_METHOD_PTION: [],
        PRODUCT_GROUP_MAPPING: {},
        PRODUCT_GROUP_OPTIONS: [],
        SALES_DELIVERY_MAPPING: {},
        SALES_METHOD_MAPPING: {},
        SALES_METHOD_OPTIONS: [],
        DELIVERY_FREQUENCY_MAPPING_CODE: {},
        SALES_DELIVERY_METHOD_MAPPING: {},
        SALES_DELIVERY_FREQUENCY_MAPPING: {},
        SALES_PRODUCT_GROUP_MAPPING: {}
    })
    const [segmentOption, setSegmentOption] = useState<any>({
        CHANNEL_CODE: {},
        SEGMENT_CODE: {},
        SUB_SEGMENT_CODE: {}
    })
    useEffect(() => {
        AsyncStorage.getItem('Business_Segment_Hierarchy')
            .then((param) => {
                const paramBody = JSON.parse(param)
                setDpOptions(paramBody.DP_OPTIONS)
                setChannelList(JSON.parse(paramBody.CHANNEL_OPTIONS))
                setSegmentList(JSON.parse(paramBody.SEGMENT_OPTIONS))
                setSubSegmentList(JSON.parse(paramBody.SUB_SEGMENT_OPTIONS))
                setCountryList(JSON.parse(paramBody.COUNTRY_OPTIONS))
                setStateList(JSON.parse(paramBody.COUNTRY_STATE_OPTIONS))
                setSegmentOption({
                    CHANNEL_CODE: paramBody.CHANNEL_CODE,
                    SEGMENT_CODE: paramBody.SEGMENT_CODE,
                    SUB_SEGMENT_CODE: paramBody.SUB_SEGMENT_CODE
                })
            })
            .catch((err) => {
                storeClassLog(Log.MOBILE_ERROR, 'useBusinessSegmentPicklist', err)
            })
    }, [])
    return {
        channelList,
        segmentList,
        subSegmentList,
        countryList,
        stateList,
        dpOptions,
        segmentOption
    }
}

export const useDpOptions = (type, lead, customer, showDistributionPointModal) => {
    const dpOriginalOptions = useBusinessSegmentPicklist().dpOptions
    const [dpOptions, setDpOptions] = useState(useBusinessSegmentPicklist().dpOptions)
    _.remove(dpOriginalOptions.SALES_METHOD_OPTIONS, (v) => {
        return v === 'FSV'
    })
    useEffect(() => {
        if (lead || customer) {
            SoupService.retrieveDataFromSoup(
                'Customer_to_Route__c',
                {},
                CustomerToRouteQueries.getFoodServiceDistributionPointsByLeadExternalId.f,
                formatString(
                    type === 'Lead'
                        ? CustomerToRouteQueries.getFoodServiceDistributionPointsByLeadExternalId.qWithFSV
                        : CustomerToRouteQueries.getFoodServiceDistributionPointsByLeadExternalId.qCustomer,
                    [type === 'Lead' ? lead.ExternalId : customer.AccountId]
                )
            ).then((res) => {
                if (res.length > 0) {
                    const typeList = _.uniq(
                        _.map(res, (value) => {
                            return value.SLS_MTHD_NM__c
                        })
                    )
                    const salesMethodOptions = _.cloneDeep(dpOriginalOptions.SALES_METHOD_OPTIONS)
                    if (salesMethodOptions.length > 0) {
                        _.remove(salesMethodOptions, (v) => {
                            return _.includes(typeList, v)
                        })
                        setDpOptions({
                            ...dpOriginalOptions,
                            SALES_METHOD_OPTIONS: salesMethodOptions
                        })
                    } else {
                        setDpOptions(dpOriginalOptions)
                    }
                } else {
                    setDpOptions(dpOriginalOptions)
                }
            })
        } else {
            setDpOptions(dpOriginalOptions)
        }
    }, [type, lead, customer, showDistributionPointModal, dpOriginalOptions])
    return dpOptions
}

export const useContacts = (
    type: 'RetailStore' | 'Lead',
    id: string,
    contactEditCount?: number,
    showContactForm?: boolean,
    saveTimes?: number,
    searchValue?: string,
    readOnly?: boolean
) => {
    const [contacts, setContacts] = useState([])
    useEffect(() => {
        if (!readOnly) {
            let q
            if (type === 'RetailStore') {
                q = searchValue
                    ? ContactQueries.getAllContactsByAccountIdQuery.qSearch
                    : ContactQueries.getAllContactsByAccountIdQuery.q
            } else {
                q = searchValue
                    ? ContactQueries.getAllContactsByLeadExternalIdQuery.qSearch
                    : ContactQueries.getAllContactsByLeadExternalIdQuery.q
            }
            SoupService.retrieveDataFromSoup(
                'Contact',
                {},
                ContactQueries.getAllContactsByAccountIdQuery.f,
                formatString(q, [id, `%${searchValue}%` || ''])
            ).then((res) => {
                setContacts(res)
            })
        }
    }, [id, contactEditCount, showContactForm, saveTimes, searchValue])
    return contacts
}

export const usePrimarySecondaryContacts = (type: 'RetailStore' | 'Lead', id: string, showContactForm?: boolean) => {
    const [primaryContact, setPrimaryContact] = useState(null)
    const [secondaryContact, setSecondaryContact] = useState(null)
    useEffect(() => {
        const q =
            type === 'RetailStore'
                ? ContactQueries.getPrimarySecondaryContactByAccountIdQuery.q
                : ContactQueries.getPrimarySecondaryContactByLeadExternalIdQuery.q
        SoupService.retrieveDataFromSoup(
            'Contact',
            {},
            ContactQueries.getPrimarySecondaryContactByLeadExternalIdQuery.f,
            formatString(q, [id])
        ).then((res) => {
            setPrimaryContact(null)
            setSecondaryContact(null)
            if (res.length > 0) {
                res.forEach((v) => {
                    if (v.Primary_Contact__c === '1') {
                        setPrimaryContact(v)
                    } else if (v.Secondary_Contact__c === '1') {
                        setSecondaryContact(v)
                    }
                })
            }
        })
    }, [id, showContactForm])
    return {
        primaryContact,
        secondaryContact
    }
}

export const useDistributionPoints = (
    leadExternalId: string,
    showDistributionForm: boolean,
    refreshCount: number,
    saveTimes: number
) => {
    const [distributionPoints, setDistributionPoints] = useState([])
    useEffect(() => {
        if (leadExternalId) {
            SoupService.retrieveDataFromSoup(
                'Customer_to_Route__c',
                {},
                CustomerToRouteQueries.getDistributionPointsByLeadExternalId.f,
                formatString(CustomerToRouteQueries.getDistributionPointsByLeadExternalId.q, [leadExternalId])
            ).then((res) => {
                setDistributionPoints(res)
            })
        }
    }, [leadExternalId, showDistributionForm, refreshCount, saveTimes])
    return distributionPoints
}

export const useTasks = (leadExternalId: string, saveTimes: number, taskSaveTimes: number) => {
    const [historyTaskList, setHistoryTaskList] = useState([])
    const [openTaskList, setOpenTaskList] = useState([])
    const [latestCofRequestedDate, setLatestCofRequestedDate] = useState('')
    useEffect(() => {
        SoupService.retrieveDataFromSoup(
            'Task',
            {},
            TaskQueries.getHistoryTaskByLeadExternalIdQuery.f,
            formatString(TaskQueries.getHistoryTaskByLeadExternalIdQuery.q, [leadExternalId])
        ).then((res) => {
            setLatestCofRequestedDate('')
            const temp = res.map((v) => {
                return {
                    ...v,
                    Call_Details__c: `${v.Call_Details__c || ''}${v.Call_Details2__c || ''}${v.Call_Details3__c || ''}`
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
        })
        SoupService.retrieveDataFromSoup(
            'Task',
            {},
            TaskQueries.getOpenTaskByLeadExternalIdQuery.f,
            formatString(TaskQueries.getOpenTaskByLeadExternalIdQuery.q, [leadExternalId])
        ).then((res) => {
            const temp = res.map((v) => {
                return {
                    ...v,
                    Call_Details__c: `${v.Call_Details__c || ''}${v.Call_Details2__c || ''}${v.Call_Details3__c || ''}`
                }
            })
            setOpenTaskList(temp)
        })
    }, [leadExternalId, saveTimes, taskSaveTimes])
    return {
        openTaskList,
        historyTaskList,
        latestCofRequestedDate
    }
}

export const useGetOpenTasks = (
    ownerId: string,
    times: string,
    taskSaveTimes: number,
    type: string,
    isFocused: boolean,
    refreshTimes: number
) => {
    const [openTaskList, setOpenTaskList] = useState([])
    const [openTaskListSize, setOpenTaskListSize] = useState(0)
    const [openCustomerTaskList, setOpenCustomerTaskList] = useState([])
    const [openCustomerTaskListSize, setOpenCustomerTaskListSize] = useState(0)
    useEffect(() => {
        if (isFocused) {
            let startWeekDate = ''
            let endWeekDate
            let openLeadTaskQuery
            let openCustomerTaskQuery
            if (times === 'Next Week') {
                startWeekDate = moment()
                    .add(7 - moment().day(), MOMENT_STARTOF.DAY)
                    .format(TIME_FORMAT.Y_MM_DD)
                endWeekDate = moment()
                    .add(13 - moment().day(), MOMENT_STARTOF.DAY)
                    .format(TIME_FORMAT.Y_MM_DD)
                openLeadTaskQuery =
                    TaskQueries.getOpenTaskByOwnerIdQuery.q +
                    ` AND ({Task:ActivityDate} >= '${startWeekDate}' AND {Task:ActivityDate} <= '${endWeekDate}')`
                openCustomerTaskQuery =
                    TaskQueries.getOpenTaskByAccountIdQuery.q +
                    ` AND ({Task:ActivityDate} >= '${startWeekDate}' AND {Task:ActivityDate} <= '${endWeekDate}')`
            } else {
                endWeekDate = moment()
                    .add(6 - moment().day(), MOMENT_STARTOF.DAY)
                    .format(TIME_FORMAT.Y_MM_DD)
                openLeadTaskQuery =
                    TaskQueries.getOpenTaskByOwnerIdQuery.q + ` AND ({Task:ActivityDate} <= '${endWeekDate}')`
                openCustomerTaskQuery =
                    TaskQueries.getOpenTaskByAccountIdQuery.q + ` AND ({Task:ActivityDate} <= '${endWeekDate}')`
            }
            if (type !== 'All Types') {
                if (type === 'Scheduled Call') {
                    openLeadTaskQuery = openLeadTaskQuery + " AND {Task:Subject} = 'Lead Logging Calls'"
                    openCustomerTaskQuery = openCustomerTaskQuery + " AND {Task:Subject} = 'Customer Logging Calls'"
                } else {
                    openLeadTaskQuery = openLeadTaskQuery + ` AND {Task:Type} = '${type}'`
                    openCustomerTaskQuery = openCustomerTaskQuery + ` AND {Task:Type} = '${type}'`
                }
            }
            openLeadTaskQuery =
                openLeadTaskQuery +
                ` AND {Lead__x:Owner_GPID_c__c}='${CommonParam.GPID__c}' ORDER BY {Task:ActivityDate} ASC`
            openCustomerTaskQuery = openCustomerTaskQuery + ' ORDER BY {Task:ActivityDate} ASC'
            SoupService.retrieveDataFromSoup(
                'Task',
                {},
                TaskQueries.getOpenTaskByAccountIdQuery.f,
                formatString(openCustomerTaskQuery, [ownerId])
            ).then((res) => {
                setOpenCustomerTaskListSize(res.length)
                setOpenCustomerTaskList(res)
            })
            SoupService.retrieveDataFromSoup(
                'Task',
                {},
                TaskQueries.getOpenTaskByOwnerIdQuery.f,
                formatString(openLeadTaskQuery, [ownerId])
            ).then((res) => {
                setOpenTaskListSize(res.length)
                setOpenTaskList(res)
            })
        }
    }, [times, taskSaveTimes, isFocused, ownerId, refreshTimes])
    return {
        openTaskList,
        openTaskListSize,
        openCustomerTaskList,
        openCustomerTaskListSize
    }
}

const ACTION_REQUIRED = 'Action Required'

const getKpiData = async (type) => {
    let res = []
    if (type) {
        const actionRequiredRes = await SoupService.retrieveDataFromSoup(
            'Lead__x',
            {},
            ['count', 'status'],
            'SELECT COUNT(*), {Lead__x:Deferred_Resume_Date_c__c} IS NOT NULL ' +
                'AND (date("now","-1 month")<date({Lead__x:Deferred_Resume_Date_c__c}) ' +
                'and date({Lead__x:Deferred_Resume_Date_c__c})<=date("now")) as Active FROM {Lead__x} ' +
                'WHERE Active IS TRUE AND {Lead__x:Status__c}="Open"'
        )
        res.push({
            count: actionRequiredRes[0]?.count,
            status: ACTION_REQUIRED
        })
        const tierRes = await SoupService.retrieveDataFromSoup(
            'Lead__x',
            {},
            ['count', 'status'],
            'SELECT COUNT(*), {Lead__x:Tier_c__c}, ' +
                '{Lead__x:Deferred_Resume_Date_c__c} IS NOT NULL ' +
                'AND (date("now","-1 month")<date({Lead__x:Deferred_Resume_Date_c__c}) ' +
                'and date({Lead__x:Deferred_Resume_Date_c__c})<=date("now")) as Active FROM {Lead__x} ' +
                'WHERE {Lead__x:Status__c}="Open" AND ({Lead__x:Tier_c__c}=1 ' +
                'OR {Lead__x:Tier_c__c}=2 OR {Lead__x:Tier_c__c}=3 OR {Lead__x:Tier_c__c} IS NULL) ' +
                'AND Active IS NOT TRUE GROUP BY {Lead__x:Tier_c__c}'
        )
        res = [...res, ...tierRes]
    } else {
        res = await SoupService.retrieveDataFromSoup(
            'Lead__x',
            {},
            ['count', 'status'],
            formatString(
                'SELECT COUNT(*), {Lead__x:Lead_Sub_Status_c__c} ' +
                    'FROM {Lead__x} WHERE {Lead__x:Owner_GPID_c__c}=\'%s\' AND {Lead__x:Status__c}="Negotiate" ' +
                    'AND ({Lead__x:Lead_Sub_Status_c__c}="Assigned" OR {Lead__x:Lead_Sub_Status_c__c}="Engage" ' +
                    'OR {Lead__x:Lead_Sub_Status_c__c}="Discovery" OR {Lead__x:Lead_Sub_Status_c__c}="Negotiate") ' +
                    "AND {Lead__x:Lead_Type_c__c} != 'Change of Ownership' GROUP BY {Lead__x:Lead_Sub_Status_c__c}",
                [CommonParam.GPID__c]
            )
        )
    }
    return res
}

const generateBarData = (type, case0, case1, case2, case3) => {
    return [
        {
            count: case0,
            percentage: (case0 / (case0 + case1 + case2 + case3)) * 100,
            name: type ? t.labels.PBNA_MOBILE_ACTION_REQUIRED : t.labels.PBNA_MOBILE_ASSIGNED,
            color: type ? '#6C0CC3' : '#C6EAF6'
        },
        {
            count: case1,
            percentage: (case1 / (case0 + case1 + case2 + case3)) * 100,
            name: type ? t.labels.PBNA_MOBILE_TIER_1 : t.labels.PBNA_MOBILE_ENGAGE,
            color: '#5B8BBB'
        },
        {
            count: case2,
            percentage: (case2 / (case0 + case1 + case2 + case3)) * 100,
            name: type ? t.labels.PBNA_MOBILE_TIER_2 : t.labels.PBNA_MOBILE_DISCOVERY,
            color: '#2A65A4'
        },
        {
            count: case3,
            percentage: (case3 / (case0 + case1 + case2 + case3)) * 100,
            name: type ? t.labels.PBNA_MOBILE_TIER_3 : t.labels.PBNA_MOBILE_NEGOTIATE,
            color: '#11457B'
        }
    ]
}

const generateTextData = (type, case0, case1, case2, case3, all) => {
    if (type) {
        Instrumentation.reportMetric('FSR/PSR Open Leads Count', all - case0)
        Instrumentation.setUserData(`FSR/PSR-${CommonParam.GPID__c}-Open Leads Count`, all - case0 + '')
    }
    return [
        {
            count: case0,
            percentage: (case0 / all) * 100,
            name: type ? t.labels.PBNA_MOBILE_ACTION_REQUIRED : t.labels.PBNA_MOBILE_ASSIGNED,
            color: type ? '#6C0CC3' : '#C6EAF6'
        },
        {
            count: case1,
            percentage: (case1 / all) * 100,
            name: type ? t.labels.PBNA_MOBILE_TIER_1 : t.labels.PBNA_MOBILE_ENGAGE,
            color: '#5B8BBB'
        },
        {
            count: case2,
            percentage: (case2 / all) * 100,
            name: type ? t.labels.PBNA_MOBILE_TIER_2 : t.labels.PBNA_MOBILE_DISCOVERY,
            color: '#2A65A4'
        },
        {
            count: case3,
            percentage: (case3 / all) * 100,
            name: type ? t.labels.PBNA_MOBILE_TIER_3 : t.labels.PBNA_MOBILE_NEGOTIATE,
            color: '#11457B'
        }
    ]
}

export const useKpiBar = (type: boolean) => {
    const initState = () => {
        const placeholder = [
            {
                count: 0,
                percentage: 0,
                name: type ? t.labels.PBNA_MOBILE_ACTION_REQUIRED : t.labels.PBNA_MOBILE_ASSIGNED,
                color: type ? '#6C0CC3' : '#C6EAF6'
            },
            {
                count: 0,
                percentage: 0,
                name: type ? t.labels.PBNA_MOBILE_TIER_1 : t.labels.PBNA_MOBILE_ENGAGE,
                color: '#5B8BBB'
            },
            {
                count: 0,
                percentage: 0,
                name: type ? t.labels.PBNA_MOBILE_TIER_2 : t.labels.PBNA_MOBILE_DISCOVERY,
                color: '#2A65A4'
            },
            {
                count: 0,
                percentage: 0,
                name: type ? t.labels.PBNA_MOBILE_TIER_3 : t.labels.PBNA_MOBILE_NEGOTIATE,
                color: '#11457B'
            }
        ]

        return {
            bar: placeholder,
            text: placeholder
        }
    }

    const [barData, setBarData] = useState(initState())

    const refresh = async () => {
        const res = await getKpiData(type)
        if (res.length > 0) {
            let all = 0
            let case0 = 0
            let case1 = 0
            let case2 = 0
            let case3 = 0
            res.forEach((v) => {
                switch (v.status) {
                    case ACTION_REQUIRED:
                    case 'Assigned':
                        case0 = v.count
                        break
                    case 1:
                    case 'Engage':
                        case1 = v.count
                        break
                    case 2:
                    case 'Discovery':
                        case2 = v.count
                        break
                    case 3:
                    case 'Negotiate':
                        case3 = v.count
                        break
                    default:
                        break
                }
                all = all + v.count
            })
            if (all > 0) {
                if (isPersonaFSManager()) {
                    setBarData(initState())
                } else {
                    setBarData({
                        bar: generateBarData(type, case0, case1, case2, case3),
                        text: generateTextData(type, case0, case1, case2, case3, all)
                    })
                }
            } else {
                setBarData(initState())
            }
        } else {
            setBarData(initState())
        }
    }

    useEffect(() => {
        refresh()
        return store.subscribe(async () => {
            refresh()
        })
    }, [type])
    return barData
}

export const useDisableLogCallSave = (call, isScheduleCall) => {
    const [disableSave, setDisableSave] = useState(true)
    const calDisableSave = () => {
        if (isScheduleCall) {
            return _.isEmpty(call.ActivityDate)
        }
        if (!_.isEmpty(call.Call_Subject__c)) {
            if (call.Contact_Made__c === '1') {
                return !(!_.isEmpty(call.Name_of_Contact__c) && !_.isEmpty(call.Call_Details__c))
            }
            return false
        }
        return true
    }
    useEffect(() => {
        setDisableSave(calDisableSave())
    }, [call])
    return disableSave
}

export const useDisableContactSave = (validEmail, contact, contactAs, primaryContact, editMode) => {
    const [disableSave, setDisableSave] = useState(true)

    const calculateDisableSave = () => {
        return (
            !_.isEmpty(contact.Primary_Phone_Type__c) &&
            !_.isEmpty(contact.FirstName) &&
            !_.isEmpty(contact.LastName) &&
            !_.isEmpty(contact.Phone) &&
            !_.isEmpty(contact.Primary_Phone_Type__c) &&
            validatePhone(contact.Phone) &&
            validatePhone(contact.MobilePhone) &&
            (!_.isEmpty(contact.Email) ? validEmail : true) &&
            (!_.isEmpty(contact.MobilePhone) ? !_.isEmpty(contact.Second_Phone_Type__c) : true) &&
            calculateRadioGroup(contactAs, contact, primaryContact, editMode)
        )
    }
    useEffect(() => {
        setDisableSave(!calculateDisableSave())
    }, [contact, contactAs])
    return disableSave
}

export const useLeadLocationCorrect = (leadDetail, saveTimes) => {
    const [isLocationCorrect, setIsLocationCorrect] = useState(false)
    useEffect(() => {
        if (!_.isEmpty(leadDetail)) {
            setIsLocationCorrect(!_.isEmpty(leadDetail.Location_c__c))
        }
    }, [leadDetail, saveTimes])
    return isLocationCorrect
}

export const useLeadAddressCorrect = (leadDetail, saveTimes) => {
    const [isAddressCorrect, setIsAddressCorrect] = useState(false)
    useEffect(() => {
        if (!_.isEmpty(leadDetail)) {
            setIsAddressCorrect(
                !_.isEmpty(leadDetail.Company__c) &&
                    !_.isEmpty(leadDetail.Street__c) &&
                    !_.isEmpty(leadDetail.City__c) &&
                    !_.isEmpty(leadDetail.State__c) &&
                    !_.isEmpty(leadDetail.Country__c) &&
                    !_.isEmpty(leadDetail.PostalCode__c)
            )
        }
    }, [leadDetail, saveTimes])
    return isAddressCorrect
}

export const useLeadSubSegmentCorrect = (leadDetail, saveTimes) => {
    const [isSubSegmentCorrect, setIsSubSegmentCorrect] = useState(false)
    useEffect(() => {
        if (!_.isEmpty(leadDetail)) {
            setIsSubSegmentCorrect(!_.isEmpty(leadDetail.BUSN_SGMNTTN_LVL_1_NM_c__c))
        }
    }, [leadDetail, saveTimes])
    return isSubSegmentCorrect
}

export const useLeadPaymentMethodCorrect = (leadDetail, saveTimes) => {
    const [isPaymentMethodCorrect, setIsPaymentMethodCorrect] = useState(false)
    useEffect(() => {
        if (!_.isEmpty(leadDetail)) {
            setIsPaymentMethodCorrect(!_.isEmpty(leadDetail.Payment_Method_c__c))
        }
    }, [leadDetail, saveTimes])
    return isPaymentMethodCorrect
}

export const useSeasonalDateCorrect = (leadDetail, saveTimes) => {
    const [isSeasonalDateCorrect, setIsSeasonalDateCorrect] = useState(false)
    useEffect(() => {
        if (!_.isEmpty(leadDetail)) {
            setIsSeasonalDateCorrect(
                (_.isEmpty(leadDetail.Seasonal_Close_Start_Date_c__c) &&
                    _.isEmpty(leadDetail.Seasonal_Close_End_Date_c__c)) ||
                    (!_.isEmpty(leadDetail.Seasonal_Close_Start_Date_c__c) &&
                        !_.isEmpty(leadDetail.Seasonal_Close_End_Date_c__c))
            )
        }
    }, [leadDetail, saveTimes])
    return isSeasonalDateCorrect
}

export const useCofCheckData = (leadDetail: any, saveTimes: number) => {
    const locationCheck = useLeadLocationCorrect(leadDetail, saveTimes)
    const addressCheck = useLeadAddressCorrect(leadDetail, saveTimes)
    const subSegmentCheck = useLeadSubSegmentCorrect(leadDetail, saveTimes)
    const paymentMethodCheck = useLeadPaymentMethodCorrect(leadDetail, saveTimes)
    const seasonalDateCheck = useSeasonalDateCorrect(leadDetail, saveTimes)

    return {
        isLocationCorrect: locationCheck,
        isAddressCorrect: addressCheck,
        isSubSegmentCorrect: subSegmentCheck,
        isPaymentMethodCorrect: paymentMethodCheck,
        isSeasonalDateCorrect: seasonalDateCheck
    }
}
export const useLeadDetailTabs = () => {
    const initTabs = (unread?) => {
        return [
            {
                name: t.labels.PBNA_MOBILE_OVERVIEW.toUpperCase(),
                value: 'OVERVIEW',
                dot: false
            },
            {
                name: t.labels.PBNA_MOBILE_OFFERS.toUpperCase(),
                value: 'OFFERS',
                dot: false
            },
            {
                name: t.labels.PBNA_MOBILE_CONTACTS.toUpperCase(),
                value: 'CONTACTS',
                dot: false
            },
            {
                name: t.labels.PBNA_MOBILE_ACTIVITIES.toUpperCase(),
                value: 'ACTIVITIES',
                dot: unread
            },
            {
                name: t.labels.PBNA_MOBILE_EQUIPMENT.toUpperCase(),
                value: 'EQUIPMENT',
                dot: unread
            }
        ]
    }
    const [tasks] = useState([])
    const [tabs] = useState(initTabs(false))
    return {
        tabs,
        tasks
    }
}

export const useLeadDetailSaveButton = (leadDetail) => {
    const [disableSave, setDisableSave] = useState(false)
    const [showBottomButton, setShowBottomButton] = useState(false)
    const subscribeValidation = () => {
        const tempLead = store.getState().leadReducer.negotiateLeadEditReducer
        const seasonalDateFlag =
            leadDetail.Seasonal_Close_Start_Date_c__c === tempLead.Seasonal_Close_Start_Date_c__c &&
            leadDetail.Seasonal_Close_End_Date_c__c === tempLead.Seasonal_Close_End_Date_c__c
                ? true
                : (_.isEmpty(tempLead.Seasonal_Close_Start_Date_c__c) &&
                      _.isEmpty(tempLead.Seasonal_Close_End_Date_c__c)) ||
                  (!_.isEmpty(tempLead.Seasonal_Close_Start_Date_c__c) &&
                      !_.isEmpty(tempLead.Seasonal_Close_End_Date_c__c))
        const companyInputFlag = tempLead.Company__c !== ''
        const phoneValidationFlag = tempLead.phoneValidationFlag
        const emailValidationFlag = tempLead.emailValidationFlag
        const addressValidationFlag = tempLead.addressValidationFlag
        const deliveryExecutionZipCodeValidationFlag = tempLead.deliveryExecutionZipCodeValidationFlag
        if (
            phoneValidationFlag &&
            addressValidationFlag &&
            deliveryExecutionZipCodeValidationFlag &&
            companyInputFlag &&
            emailValidationFlag &&
            seasonalDateFlag
        ) {
            setDisableSave(false)
        } else {
            setDisableSave(true)
        }
    }
    const renderBottomButton = () => {
        const tempLead = store.getState().leadReducer.negotiateLeadEditReducer
        if (checkLeadEdited(tempLead)) {
            setShowBottomButton(true)
        } else {
            setShowBottomButton(false)
        }
    }
    useEffect(() => {
        return store.subscribe(() => {
            renderBottomButton()
            subscribeValidation()
        })
    })
    return {
        disableSave,
        showBottomButton
    }
}

export const useFilterBusinessSegment = () => {
    const { segmentList } = useBusinessSegmentPicklist()
    const [businessSegList, setBusinessSegList] = useState([])
    useEffect(() => {
        const tempList = []
        _.remove(_.sortBy(segmentList.Select), (v) => {
            return v !== '-- Select Segment --'
        }).forEach((v) => {
            tempList.push({
                label: v,
                groupName: 'businessSegment',
                value: {
                    fieldName: 'BUSN_SGMNTTN_LVL_2_NM_c__c',
                    value: v
                }
            })
        })
        setBusinessSegList(tempList)
    }, [segmentList])
    return businessSegList
}

export const useRouteLists = (
    searchV: string,
    hierarchy: Array<string>,
    isEditPage: boolean = false,
    parentId?: string,
    grandParentId?: string
) => {
    const [locationRoute, setLocationRoute] = useState([])
    const [searchValue, setSearchValue] = useState('')
    useDebounce(
        () => {
            setSearchValue(searchV)
        },
        500,
        [searchV]
    )
    useEffect(() => {
        if (searchValue?.length > 1) {
            const searchText = searchValue?.replace(/[\\$()*+.[?^{|]/g, '%')
            const hierarchyLst = hierarchy.map((v) => `'${v}'`).join(',')
            const locationQueryCondition = 'AND Operational_Location__c=TRUE'
            const canAddLocationQueryConditionPersonal = isEditPage
                ? isPersonaFSR() || isPersonaPSR() || isPersonaFSManager()
                : isPersonaFSR() || isPersonaPSR() || isPersonaCRMBusinessAdmin()
            const addLocationQueryCondition = _.includes(hierarchy, 'Location') && canAddLocationQueryConditionPersonal
            const querycon = ` AND (Parent_Node__r.SLS_UNIT_ID__c = '${parentId}' OR Parent_Node__r.SLS_UNIT_ID__c = '${parentId}${
                _.includes(hierarchy, 'Market') ? '_RE' : '_M'
            }')`
            const path = `query/?q=SELECT SLS_UNIT_NM__c,SLS_UNIT_ID__c,UNIQ_ID_VAL__c,HRCHY_LVL__c FROM Route_Sales_Geo__c WHERE 
            HRCHY_LVL__c IN (${hierarchyLst}) AND SLS_UNIT_ACTV_FLG_VAL__c = 'ACTIVE' AND SLS_UNIT_NM__c LIKE '%${searchText}%'
            ${
                addLocationQueryCondition && hierarchy?.length > 1
                    ? " AND ((HRCHY_LVL__c = 'Location' AND Operational_Location__c=TRUE) OR HRCHY_LVL__c != 'Location')"
                    : ''
            }
            ${parentId ? querycon : ''}
            ${
                grandParentId
                    ? ` AND (Parent_Node__r.Parent_Node__r.SLS_UNIT_ID__c = '${grandParentId}' OR Parent_Node__r.Parent_Node__r.SLS_UNIT_ID__c = '${grandParentId}_RE')`
                    : ''
            }
            ${addLocationQueryCondition && hierarchy?.length === 1 ? locationQueryCondition : ''}`

            restDataCommonCall(path, 'GET').then((routeValue) => {
                // SLS_UNIT_ID__c in Route_Sales_Geo__c have level indicator in the end, like '1061_M'
                const routeListData = _.map(routeValue.data.records, (routeItem) => {
                    return _.update(routeItem, 'SLS_UNIT_ID__c', removeLevelIndicator)
                })
                setLocationRoute(routeListData)
            })
        } else {
            setLocationRoute([])
        }
    }, [searchValue])
    return locationRoute
}

export const useRelatedCustomerList = (relatedCustomerSearchVal: string) => {
    const [relatedCustomerList, setRelatedCustomerList] = useState([])
    useEffect(() => {
        if (relatedCustomerSearchVal) {
            const searchText = relatedCustomerSearchVal.replace(/[\\$()*+.[?^{|]/g, '.')
            const path = `query/?q=SELECT Id,CUST_UNIQ_ID_VAL__c,Name FROM Account WHERE CUST_UNIQ_ID_VAL__c LIKE '%${searchText}%' OR Name LIKE '%${searchText}%' `
            restDataCommonCall(path, 'GET').then((list) => {
                setRelatedCustomerList(list.data.records)
            })
        } else {
            setRelatedCustomerList([])
        }
    }, [relatedCustomerSearchVal])

    return relatedCustomerList
}

export const useSuggestedRoute = (l) => {
    const [localRoute, setLocalRoute] = useState(null)
    const [nationalRoute, setNationalRoute] = useState(null)

    useEffect(() => {
        if (l) {
            if (l.Suggested_FSR_Nat_Route_Number_c__c) {
                SoupService.retrieveDataFromSoup(
                    'Route_Sales_Geo__c',
                    {},
                    ['Id', 'GTMU_RTE_ID__c', 'RTE_TYP_GRP_NM__c', 'LOCL_RTE_ID__c', 'User__r.Name'],
                    'SELECT {Route_Sales_Geo__c:Id},{Route_Sales_Geo__c:GTMU_RTE_ID__c},' +
                        '{Route_Sales_Geo__c:RTE_TYP_GRP_NM__c},{Route_Sales_Geo__c:LOCL_RTE_ID__c},' +
                        '{Employee_To_Route__c:User__r.Name} ' +
                        'FROM {Route_Sales_Geo__c} ' +
                        'LEFT JOIN (SELECT * FROM {Employee_To_Route__c} WHERE ' +
                        '{Employee_To_Route__c:User__r.Name} IS NOT NULL AND {Employee_To_Route__c:Active_Flag__c} IS TRUE ' +
                        "AND {Employee_To_Route__c:Status__c} = 'Processed') " +
                        'ON {Employee_To_Route__c:Route__c} = {Route_Sales_Geo__c:Id} ' +
                        `WHERE {Route_Sales_Geo__c:GTMU_RTE_ID__c} = '${l.Suggested_FSR_Nat_Route_Number_c__c}'`
                ).then((res) => {
                    setNationalRoute(
                        !_.isEmpty(res[0]?.GTMU_RTE_ID__c) && !_.isEmpty(res[0]?.RTE_TYP_GRP_NM__c)
                            ? `${res[0].GTMU_RTE_ID__c} ${res[0].RTE_TYP_GRP_NM__c || '-'} ${
                                  res[0]['User__r.Name'] || ''
                              }`
                            : l.Suggested_FSR_Nat_Route_Number_c__c
                    )
                    setLocalRoute(
                        !_.isEmpty(res[0]?.LOCL_RTE_ID__c) && !_.isEmpty(res[0]?.RTE_TYP_GRP_NM__c)
                            ? `${res[0].LOCL_RTE_ID__c} ${res[0].RTE_TYP_GRP_NM__c || '-'}`
                            : l.Suggested_FSR_Loc_Route_Number_c__c
                    )
                })
            } else {
                setNationalRoute(l.Suggested_FSR_Nat_Route_Number_c__c)
                setLocalRoute(l.Suggested_FSR_Loc_Route_Number_c__c)
            }
        }
    }, [l])

    return { localRoute, nationalRoute }
}
export const useLeadUpdate = (id) => {
    const [leadToUpdate, setLeadToUpdate] = useState({})
    useEffect(() => {
        if (id) {
            const path =
                'query/?q=SELECT Id,Last_Task_Modified_Date_c__c,Rep_Last_Modified_Date_c__c,' +
                'Call_Counter_c__c,Lead_Sub_Status_c__c,Contact_Made_Counter_c__c,ExternalId FROM Lead__x ' +
                `WHERE ExternalId = '${id}' `
            restDataCommonCall(path, 'GET').then((res: any) => {
                setLeadToUpdate(res.data?.records[0])
            })
        } else {
            setLeadToUpdate({})
        }
    }, [id])
    return leadToUpdate
}

export const useDisableExportContact = (
    selectedTempArr,
    customerContacts,
    internalContacts,
    exportType,
    type,
    showInitLoadingIndicator
) => {
    const [disableSave, setDisableSave] = useState(true)
    useEffect(() => {
        if (!showInitLoadingIndicator) {
            if (type === 'Lead') {
                if (exportType === '0') {
                    setDisableSave(false)
                } else if (exportType === '1') {
                    setDisableSave(selectedTempArr.length <= 0)
                } else {
                    setDisableSave(true)
                }
            } else {
                if (customerContacts || internalContacts) {
                    if (exportType === '0') {
                        setDisableSave(false)
                    } else if (exportType === '1') {
                        setDisableSave(selectedTempArr.length <= 0)
                    } else {
                        setDisableSave(true)
                    }
                } else if (customerContacts === false && internalContacts === false) {
                    setDisableSave(true)
                } else {
                    setDisableSave(exportType !== '0')
                }
            }
        } else {
            setDisableSave(true)
        }
    }, [selectedTempArr, customerContacts, internalContacts, exportType, type, showInitLoadingIndicator])
    return disableSave
}

export const useFilterRelaterCustomerMapLabel = (Id) => {
    const [relatedCustomerLabel, setRelatedCustomerLabel] = useState('')

    useEffect(() => {
        if (Id) {
            const path = `query/?q=SELECT Id,CUST_UNIQ_ID_VAL__c,Name FROM Account WHERE Id='${Id}'`
            restDataCommonCall(path, 'GET').then((list) => {
                const v = list.data.records[0]
                setRelatedCustomerLabel(`${v?.Name} ${v?.CUST_UNIQ_ID_VAL__c}`)
            })
        }
    }, [Id])

    return { relatedCustomerLabel }
}

export const useLeadDetailFromCopilot = (leadId) => {
    const [leadDetailList, setLeadDetailList] = useState([])
    useEffect(() => {
        if (leadId) {
            SoupService.retrieveDataFromSoup(
                'Lead__x',
                {},
                ['Id', 'Owner_GPID_c__c', 'Status__c', 'COF_Triggered_c__c'],
                'SELECT {Lead__x:Id},{Lead__x:Owner_GPID_c__c},{Lead__x:Status__c},{Lead__x:COF_Triggered_c__c} FROM {Lead__x} ' +
                    `WHERE {Lead__x:ExternalId} = '${leadId}'`
            ).then((res) => {
                if (res) {
                    setLeadDetailList(res[0])
                }
            })
        }
    }, [leadId])
    return leadDetailList
}

const getBaseDealQ = () => {
    return `query/?q=SELECT Id, Lead_id__c, Target_Id__c, Target_Name__c,
     Status__c,Send_outbound__c,CreatedById, Pricing_Level_Id__c,Type__c,
     External_Id__c, CreatedDate FROM Customer_Deal__c`
}

export const usePriceGroupTotalList = (locationId: string, isLead: boolean) => {
    const [priceGroupSearchList, setPriceGroupSearchList] = useState([])
    const [pricingLevelId, setPricingLevelId] = useState('')
    const urlEndpoint = isLead ? `?ifAccount=false&locId=${locationId}` : `?ifAccount=true&accId=${locationId}`
    const getPriceNameWithSearch = async () => {
        restApexCommonCall(`${CommonApi.PBNA_MOBILE_API_PRICE_GROUP_INFO}` + '/' + urlEndpoint, 'GET')
            .then((dealDes) => {
                const priceGroupData = JSON.parse(dealDes?.data || '{}')
                setPriceGroupSearchList(priceGroupData?.priceGroupInfo || [])
                setPricingLevelId(priceGroupData?.pricingLevelId || '')
            })
            .catch((err) => {
                setPriceGroupSearchList([])
                setPricingLevelId('')
                storeClassLog(Log.MOBILE_ERROR, 'getPriceNameWithSearch', err)
            })
    }
    useEffect(() => {
        if (
            locationId &&
            judgePersona([
                Persona.FSR,
                Persona.PSR,
                Persona.FS_MANAGER,
                Persona.KEY_ACCOUNT_MANAGER,
                Persona.UNIT_GENERAL_MANAGER,
                Persona.DELIVERY_SUPERVISOR,
                Persona.SALES_DISTRICT_LEADER,
                Persona.MERCH_MANAGER
            ])
        ) {
            getPriceNameWithSearch()
        } else {
            setPriceGroupSearchList([])
            setPricingLevelId('')
        }
    }, [locationId])
    return {
        priceGroupSearchList,
        pricingLevelId
    }
}

const dpNum = -1

export const useFilterPriceGroupDataWithSearchText = (
    totalPgList: any[],
    searchInput: string,
    currentPgList: any[]
) => {
    const [priceGroupFilterList, setPriceGroupFilterList] = useState([])
    const filterSearchResult = () => {
        if (!_.isEmpty(searchInput) && searchInput.length > 2) {
            const searchText = searchInput?.replace(/[\\$()*+.[?^{|]/g, '%')
            const resPgList: any[] = []
            totalPgList.forEach((ele: any) => {
                const indexId = currentPgList.findIndex((i) => i.Target_Id__c === ele.Target_Id__c)
                const indexSearch = (ele?.Target_Name__c || '').toLowerCase().indexOf(searchText.toLowerCase())
                if (indexId < 0 && indexSearch > dpNum) {
                    resPgList.push(ele)
                }
            })
            setPriceGroupFilterList(resPgList)
        } else {
            setPriceGroupFilterList([])
        }
    }

    useEffect(() => {
        filterSearchResult()
    }, [searchInput])
    return priceGroupFilterList
}

export const useSellingDpCount = (leadDetail: any, saveTimes?: number) => {
    const [dpCount, setDpCount] = useState(dpNum)
    const getDPCount = async () => {
        const salesMethodNameString = SELLING_DP_SLS_METH_LIST.map((item) => `'${item}'`).join(',')
        await restDataCommonCall(
            `query/?q=SELECT count(id) FROM Customer_to_Route__c
            WHERE recordtype.name='lead DP' and SLS_MTHD_NM__c in (${salesMethodNameString}) and lead__c='${leadDetail?.ExternalId}'`,
            'GET'
        )
            .then((res) => {
                const countData = _.size(res?.data?.records) > 0 ? res?.data?.records[0] : {}
                setDpCount(countData?.expr0)
            })
            .catch((err) => {
                setDpCount(dpNum)
                storeClassLog(Log.MOBILE_ERROR, 'useSellingDpCount', err)
            })
    }

    useEffect(() => {
        if (leadDetail && !_.isEmpty(leadDetail?.ExternalId)) {
            getDPCount()
        } else {
            setDpCount(dpNum)
        }
    }, [leadDetail, saveTimes])

    return dpCount
}

export const usePriceOriginListWithLead = (
    leadDetail: any,
    dpCount: number,
    saveTimes: number,
    setHadQueried: Function
) => {
    const [dealData, setDealData] = useState([])
    const getDealData = async () => {
        await restDataCommonCall(
            getBaseDealQ() + ` WHERE Lead_id__c='${leadDetail?.ExternalId}' AND Is_removed__c=false`,
            'GET'
        )
            .then((res) => {
                setDealData(res?.data?.records || [])
            })
            .catch((err) => {
                setDealData([])
                storeClassLog(Log.MOBILE_ERROR, 'usePriceOriginListWithLead', err)
            })
            .finally(() => {
                setHadQueried(true)
            })
    }

    useEffect(() => {
        if (!_.isEmpty(leadDetail?.ExternalId || '') && dpCount > 0) {
            getDealData()
        } else {
            setDealData([])
        }
    }, [leadDetail, dpCount, saveTimes])

    return dealData
}

export const syncUpCustomerDeal = (leadDetail: any, idPz: string, priceGroupList: any[]) => {
    return new Promise((resolve, reject) => {
        const dataList = priceGroupList.map((item) => {
            return {
                Lead_id__c: leadDetail?.ExternalId,
                Target_Id__c: item.Target_Id__c,
                Target_Name__c: item.Target_Name__c,
                Status__c: 'Draft',
                Send_outbound__c: false,
                Pricing_Level_Id__c: idPz,
                Type__c: 'prc_grp_request',
                External_Id__c: `${leadDetail?.ExternalId}_${item.Target_Id__c}_${dayjs().format(
                    TIME_FORMAT.YMDTHMSSZZ
                )}`
            }
        })
        syncUpObjCreateFromMem('Customer_Deal__c', dataList, false)
            .then((res) => {
                resolve(res)
            })
            .catch((err) => {
                storeClassLog(Log.MOBILE_ERROR, 'syncUpCustomerDeal', err)
                reject(err)
            })
    })
}

export const deleteCustomerDeal = (priceGroupList: any[], funName: string, dpCount = -1, locationId?: string) => {
    return new Promise((resolve, reject) => {
        const dataList = priceGroupList.map((item) => {
            return {
                Id: item.Id,
                Is_removed__c: true
            }
        })
        syncUpObjUpdateFromMem('Customer_Deal__c', dataList, false)
            .then((res) => {
                storeClassLog(
                    Log.MOBILE_INFO,
                    `${funName} deleteCustomerDeal With DP ${dpCount} and ${locationId || ''}`,
                    dataList
                )
                resolve(res)
            })
            .catch((err) => {
                storeClassLog(Log.MOBILE_ERROR, 'deleteCustomerDeal', err)
                reject(err)
            })
    })
}

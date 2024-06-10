import { baseObjects } from '../../common/config/BaseObjects'
import { syncDownObj } from '../api/SyncUtils'
import { buildSingleSyncDownQuery } from '../service/SyncService'
import { VisitList } from './QueryConfig'
import { fetchAssessmentTaskAndContentDocument } from '../service/AssessmentTaskService'
import { CommonLabel } from '../enums/CommonLabel'
import StoreProduct from './StoreProduct'
// eslint disable reason: Keep object variable naming consistent with Salesforce.
/* eslint-disable camelcase */
import Executional_Framework__c from './psr/objects/Executional_Framework__c'
import StorePriority__c from './psr/objects/StorePriority__c'
import Contract from './psr/objects/Contract'
import RetailVisitKpi from './psr/objects/RetailVisitKpi'
import Mission_Id__mdt from './psr/objects/Mission_Id__mdt'
import CustomerDeal from './CustomerDeal'

const UGMConfig = {
    name: 'UGM',
    tab: [
        CommonLabel.COPILOT,
        CommonLabel.MY_DAY,
        CommonLabel.MY_TEAM,
        CommonLabel.LEADS,
        CommonLabel.MY_CUSTOMERS,
        CommonLabel.NOTIFICATIONS
    ],
    objs: [
        ...baseObjects,
        Contract,
        RetailVisitKpi,
        Mission_Id__mdt,
        {
            name: 'Event',
            soupName: 'Event',
            initQuery:
                'SELECT Id, OwnerId, StartDateTime, EndDateTime, Type, Subject, Visit_List__c, SubType__c, Actual_Start_Time__c, Actual_End_Time__c,' +
                ' Location, Description, MeetingName__c, VirtualLocation__c, Manager_Scheduled__c, LastModifiedDate, ' +
                ' ActivityDate, Parent_Event__c, Planned_Duration__c, Location__c, WhatId, Planned_Cost__c, Aggregate_Duration__c, IsRemoved__c' +
                ' FROM Event WHERE isChild = false AND StartDateTime >= LAST_WEEK AND Location__c = APPLY_USER_LOCATION',
            optimization: true,
            optimizationQuery: ' AND IsRemoved__c = false',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'OwnerId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'StartDateTime',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'EndDateTime',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Type',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Subject',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Visit_List__c',
                    type: 'string'
                },
                {
                    name: 'SubType__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Actual_Start_Time__c',
                    type: 'string'
                },
                {
                    name: 'Actual_End_Time__c',
                    type: 'string'
                },
                {
                    name: 'Location',
                    type: 'string'
                },
                {
                    name: 'Description',
                    type: 'string'
                },
                {
                    name: 'MeetingName__c',
                    type: 'string'
                },
                {
                    name: 'VirtualLocation__c',
                    type: 'string'
                },
                {
                    name: 'Manager_Scheduled__c',
                    type: 'boolean'
                },
                {
                    name: 'ActivityDate',
                    type: 'string'
                },
                {
                    name: 'Parent_Event__c',
                    type: 'string'
                },
                {
                    name: 'Planned_Duration__c',
                    type: 'string'
                },
                {
                    name: 'Location__c',
                    type: 'string'
                },
                {
                    name: 'Aggregate_Duration__c',
                    type: 'String'
                },
                {
                    name: 'Planned_Cost__c',
                    type: 'string'
                },
                {
                    name: 'WhatId',
                    type: 'string'
                },
                {
                    name: 'IsRemoved__c',
                    type: 'boolean'
                }
            ],
            syncUpCreateFields: [
                'Id',
                'StartDateTime',
                'EndDateTime',
                'Type',
                'Subject',
                'Location',
                'Description',
                'MeetingName__c',
                'VirtualLocation__c',
                'Manager_Scheduled__c',
                'ActivityDate',
                'Parent_Event__c',
                'Planned_Duration__c',
                'Location__c',
                'Aggregate_Duration__c',
                'Planned_Cost__c',
                'Visit_List__c',
                'WhatId',
                'IsRemoved__c'
            ],
            syncUpCreateQuery: `
                SELECT
                {Event:Id},
                {Event:StartDateTime},
                {Event:EndDateTime},
                {Event:Type},
                {Event:Subject},
                {Event:Location},
                {Event:Description},
                {Event:MeetingName__c},
                {Event:VirtualLocation__c},
                {Event:Manager_Scheduled__c},
                {Event:ActivityDate},
                {Event:Parent_Event__c},
                {Event:Planned_Duration__c},
                {Event:Location__c},
                {Event:Aggregate_Duration__c},
                {Event:Planned_Cost__c},
                {Event:Visit_List__c},
                {Event:WhatId},
                {Event:IsRemoved__c},
                {Event:_soupEntryId},
                {Event:__local__},
                {Event:__locally_created__},
                {Event:__locally_updated__},
                {Event:__locally_deleted__}
                FROM {Event}
                `
        },
        {
            name: 'RetailStore',
            soupName: 'RetailStore',
            initQuery: `SELECT Id, CountryCode, Name, Street, City, State, Country, PostalCode, Latitude, Longitude, 
                Store_Location__c, RetailLocationGroupId, AccountId, Account.Name, Owner.Name, OwnerId, 
                LocationId, CreatedDate, Account.CUST_GEOFNC__c, Account.CUST_UNIQ_ID_VAL__c, LastModifiedDate, 
                RTLR_STOR_NUM__c, Account.RTLR_STOR_NUM__c, LOC_PROD_ID__c, Account.Merchandising_Base_Minimum_Requirement__c, 
                Account.Phone, Geofence__c, Account.BUSN_SGMNTTN_LVL_3_NM__c, Account.Merchandising_Base__c, 
                Account.ShippingAddress, Account.ShippingLatitude, Account.ShippingLongitude, 
                Account.CUST_ID__c, Account.Merchandising_Order_Days__c, Account.Merchandising_Delivery_Days__c, 
                Account.Sales_Route__c, Account.Sales_Rep__c, Account.IS_ACTIVE__c, Account.Active_Dist_Points__c, 
                Account.Sales_Rep_Info__c, Account.Indicator_2P__c, Account.PEPSI_COLA_NATNL_ACCT__c, 
                Account.CUST_LVL__c, Account.CUST_STRT_DT__c, Account.ParentId, Account.LOC_PROD_ID__c, 
                Account.BUSN_SGMNTTN_LVL_1_CDV__c,Account.BUSN_SGMNTTN_LVL_2_CDV__c, Account.BUSN_SGMNTTN_LVL_3_CDV__c,
                Account.BUSN_SGMNTTN_LVL_2_NM__c, Account.SSONL_CLSD_STRT_DT__c, 
                Account.SSONL_CLSD_END_DT__c, Account.CUST_BUSN_LANG_ISO_NM__c, Account.Business_Type__c, 
                Account.Secondary_Cuisine__c, Account.VENUES_ON_SITE__c, Account.Star_Level__c, Account.Number_of_Rooms__c, 
                Account.Years_In_Business__c, Account.K_12_Enrollment__c, Account.Active_Base_Population__c, 
                Account.Annual_Sales__c, Account.LGL_RGSTRTN_NUM_VAL__c, Account.BUSN_SGMNTTN_LVL_1_NM__c, 
                Account.PAYMT_MTHD_NM__c, Account.Send_Outbound__c, Account.Website, Account.ff_FACEBOOK__c, 
                Account.ff_FOURSQUARE__c, Account.ff_YELP__c, Account.FF_LINK__c, Account.Rating__c, 
                Account.ff_UBEREATS__c, Account.ff_POSTMATES__c, Account.ff_GRUBHUB__c, Account.ff_DOORDASH__c, 
                Account.User_Link_Label_1__c, Account.User_Link_1__c, Account.User_Link_Label_2__c, Account.User_Link_2__c, 
                Account.User_Link_Label_3__c, Account.User_Link_3__c, Account.Parent.Name, Account.Parent.Parent.Name, 
                Account.Parent.Parent.Parent.Name, Account.Catering__c, Account.Takeout__c, 
                Account.Serves_Alcohol__c, Account.Gas_Station__c, Account.Serves_Breakfast__c, Account.Serves_Lunch__c, 
                Account.Serves_Dinner__c, Account.Go_Kart_Flag__c, Account.IsOTSCustomer__c,Account.change_initiated__c,Account.IsCDACustomer__c,Account.CDA_Medal__c, 
                Customer_Latitude__c, Customer_Longitude__c FROM RetailStore WHERE Account.LOC_PROD_ID__c = APPLY_USER_LOCATION`,
            optimization: true,
            optimizationQuery: ' ',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'CountryCode',
                    type: 'string'
                },
                {
                    name: 'Name',
                    type: 'string',
                    skipSyncUp: true
                },
                // {name: "Location.CDFO_Address_Object__c", type: "string", skipSyncUp: true},
                {
                    name: 'Street',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'City',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'State',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Country',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'PostalCode',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Latitude',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Longitude',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Store_Location__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RetailLocationGroupId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'AccountId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Name',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Owner.Name',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'OwnerId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LocationId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'CreatedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.CUST_GEOFNC__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.CUST_UNIQ_ID_VAL__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RTLR_STOR_NUM__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.RTLR_STOR_NUM__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LOC_PROD_ID__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Merchandising_Base_Minimum_Requirement__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Phone',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Geofence__c',
                    type: 'string'
                },
                {
                    name: 'Account.BUSN_SGMNTTN_LVL_3_NM__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Merchandising_Base__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'Account.ShippingAddress',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.ShippingLatitude',
                    type: 'double',
                    skipSyncUp: true
                },
                {
                    name: 'Account.ShippingLongitude',
                    type: 'double',
                    skipSyncUp: true
                },
                {
                    name: 'Account.CUST_ID__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Merchandising_Order_Days__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Merchandising_Delivery_Days__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Sales_Route__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Sales_Rep__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.IS_ACTIVE__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Active_Dist_Points__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Sales_Rep_Info__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Indicator_2P__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.PEPSI_COLA_NATNL_ACCT__c',
                    type: 'boolean'
                },
                {
                    name: 'Account.CUST_LVL__c',
                    type: 'string'
                },
                {
                    name: 'Account.CUST_STRT_DT__c',
                    type: 'string'
                },
                {
                    name: 'Account.ParentId',
                    type: 'string'
                },
                {
                    name: 'Account.LOC_PROD_ID__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.BUSN_SGMNTTN_LVL_1_CDV__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.BUSN_SGMNTTN_LVL_2_CDV__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.BUSN_SGMNTTN_LVL_3_CDV__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.BUSN_SGMNTTN_LVL_2_NM__c',
                    type: 'string'
                },
                {
                    name: 'Account.SSONL_CLSD_STRT_DT__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.SSONL_CLSD_END_DT__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.CUST_BUSN_LANG_ISO_NM__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Business_Type__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Secondary_Cuisine__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.VENUES_ON_SITE__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Star_Level__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Number_of_Rooms__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Years_In_Business__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.K_12_Enrollment__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Active_Base_Population__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Annual_Sales__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.LGL_RGSTRTN_NUM_VAL__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.BUSN_SGMNTTN_LVL_1_NM__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.PAYMT_MTHD_NM__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Send_Outbound__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'Account.Website',
                    type: 'string'
                },
                {
                    name: 'Account.ff_FACEBOOK__c',
                    type: 'string'
                },
                {
                    name: 'Account.ff_FOURSQUARE__c',
                    type: 'string'
                },
                {
                    name: 'Account.ff_YELP__c',
                    type: 'string'
                },
                {
                    name: 'Account.FF_LINK__c',
                    type: 'string'
                },
                {
                    name: 'Account.Rating__c',
                    type: 'floating'
                },
                {
                    name: 'Account.ff_UBEREATS__c',
                    type: 'string'
                },
                {
                    name: 'Account.ff_POSTMATES__c',
                    type: 'string'
                },
                {
                    name: 'Account.ff_GRUBHUB__c',
                    type: 'string'
                },
                {
                    name: 'Account.ff_DOORDASH__c',
                    type: 'string'
                },
                {
                    name: 'Account.User_Link_Label_1__c',
                    type: 'string'
                },
                {
                    name: 'Account.User_Link_1__c',
                    type: 'string'
                },
                {
                    name: 'Account.User_Link_Label_2__c',
                    type: 'string'
                },
                {
                    name: 'Account.User_Link_2__c',
                    type: 'string'
                },
                {
                    name: 'Account.User_Link_Label_3__c',
                    type: 'string'
                },
                {
                    name: 'Account.User_Link_3__c',
                    type: 'string'
                },
                {
                    name: 'Account.Parent.Name',
                    type: 'string'
                },
                {
                    name: 'Account.Parent.Parent.Name',
                    type: 'string'
                },
                {
                    name: 'Account.Parent.Parent.Parent.Name',
                    type: 'string'
                },
                {
                    name: 'Account.Catering__c',
                    type: 'boolean'
                },
                {
                    name: 'Account.Takeout__c',
                    type: 'boolean'
                },
                {
                    name: 'Account.Serves_Alcohol__c',
                    type: 'boolean'
                },
                {
                    name: 'Account.Gas_Station__c',
                    type: 'boolean'
                },
                {
                    name: 'Account.Serves_Breakfast__c',
                    type: 'boolean'
                },
                {
                    name: 'Account.Serves_Lunch__c',
                    type: 'boolean'
                },
                {
                    name: 'Account.Serves_Dinner__c',
                    type: 'boolean'
                },
                {
                    name: 'Account.Go_Kart_Flag__c',
                    type: 'boolean'
                },
                {
                    name: 'Account.IsOTSCustomer__c',
                    type: 'string'
                },
                {
                    name: 'Account.change_initiated__c',
                    type: 'string'
                },
                {
                    name: 'Account.CUST_SRVC_FLG__c',
                    type: 'boolean'
                },

                {
                    name: 'Account.CUST_PROD_FLG__c',
                    type: 'boolean'
                },
                {
                    name: 'Account.CUST_BLG_FLG__c',
                    type: 'boolean'
                },
                {
                    name: 'Account.resale_cert__c',
                    type: 'string'
                },
                {
                    name: 'Account.credit_status__c',
                    type: 'string'
                },
                {
                    name: 'Account.tax_exempt_flg__c',
                    type: 'boolean'
                },
                {
                    name: 'Account.IsCDACustomer__c',
                    type: 'boolean'
                },
                {
                    name: 'Account.Delta_Revenue_Percentage__c',
                    type: 'number'
                },
                {
                    name: 'Account.CDA_Medal__c',
                    type: 'string'
                },
                {
                    name: 'Customer_Latitude__c',
                    type: 'string'
                },
                {
                    name: 'Customer_Longitude__c',
                    type: 'string'
                }
            ],
            syncUpCreateFields: [
                'Id',
                'Name',
                'Street',
                'City',
                'State',
                'Country',
                'PostalCode',
                'Latitude',
                'Longitude',
                'RetailLocationGroupId',
                'AccountId',
                'Owner.Name',
                'OwnerId',
                'LocationId',
                'Account.CUST_GEOFNC__c',
                'Account.CUST_UNIQ_ID_VAL__c',
                'LastModifiedDate',
                'RTLR_STOR_NUM__c',
                'LOC_PROD_ID__c',
                'Store_Location__c',
                'Account.Merchandising_Base_Minimum_Requirement__c',
                'Account.Phone',
                'Account.BUSN_SGMNTTN_LVL_3_NM__c',
                'Account.Merchandising_Base__c',
                'Account.ShippingAddress',
                'Account.ShippingLatitude',
                'Account.ShippingLongitude',
                'Account.Name',
                'Account.CUST_ID__c',
                'Account.Merchandising_Order_Days__c',
                'Account.Merchandising_Delivery_Days__c',
                'Account.Sales_Route__c',
                'Account.Sales_Rep__c',
                'Account.IS_ACTIVE__c',
                'Account.Active_Dist_Points__c',
                'Account.Sales_Rep_Info__c',
                'Account.Indicator_2P__c'
            ],
            syncUpCreateQuery: `
                SELECT
                {RetailStore:Id},
                {RetailStore:Name},
                {RetailStore:Street},
                {RetailStore:City},
                {RetailStore:State},
                {RetailStore:Country},
                {RetailStore:PostalCode},
                {RetailStore:Latitude},
                {RetailStore:Longitude},
                {RetailStore:RetailLocationGroupId},
                {RetailStore:AccountId},
                {RetailStore:Owner.Name},
                {RetailStore:OwnerId},
                {RetailStore:LocationId},
                {RetailStore:Account.CUST_GEOFNC__c},
                {RetailStore:Account.CUST_UNIQ_ID_VAL__c},
                {RetailStore:LastModifiedDate},
                {RetailStore:RTLR_STOR_NUM__c},
                {RetailStore:LOC_PROD_ID__c},
                {RetailStore:Store_Location__c},
                {RetailStore:Account.Merchandising_Base_Minimum_Requirement__c},
                {RetailStore:Account.Phone},
                {RetailStore:Account.BUSN_SGMNTTN_LVL_3_NM__c},
                {RetailStore:Account.Merchandising_Base__c},
                {RetailStore:Account.ShippingAddress},
                {RetailStore:Account.ShippingLatitude},
                {RetailStore:Account.ShippingLongitude},
                {RetailStore:Account.Name},
                {RetailStore:Account.CUST_ID__c},
                {RetailStore:Account.Merchandising_Order_Days__c},
                {RetailStore:Account.Merchandising_Delivery_Days__c},
                {RetailStore:Account.Sales_Route__c},
                {RetailStore:Account.Sales_Rep__c},
                {RetailStore:Account.IS_ACTIVE__c},
                {RetailStore:Account.Active_Dist_Points__c},
                {RetailStore:Account.Sales_Rep_Info__c},
                {RetailStore:Account.Indicator_2P__c},
                {RetailStore:_soupEntryId},
                {RetailStore:__local__},
                {RetailStore:__locally_created__},
                {RetailStore:__locally_updated__},
                {RetailStore:__locally_deleted__}
                FROM {RetailStore}
            `
        },
        {
            name: 'User',
            soupName: 'User',
            initQuery:
                'SELECT Id, Name, FirstName, LastName, Profile.Name, Phone, MobilePhone, GM_LOC_ID__c, ' +
                'GM_LOC_NM__c, PERSONA__c, GPID__c, BU_ID__c,IsActive, Title, FT_EMPLYE_FLG_VAL__c, EMPLYMT_TYP_NM__c, USER_ACTIVE__c, ProfileId, ' +
                'SmallPhotoUrl, Merchandising_Base_Minimum_Requirement__c, LC_ID__c, WRKFRC_EMPLYMT_TRMNTN_DT__c, ' +
                'ADDR_LN_1_TXT__c, ADDR_LN_2_TXT__c, CITY_NM__c, PSTL_AREA_VAL__c, ' +
                'LastModifiedDate FROM User WHERE GM_LOC_ID__c = APPLY_USER_LOCATION',
            optimization: false,
            optimizationQuery: ' AND Merchandising_Base_Minimum_Requirement__c = true',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Name',
                    type: 'string'
                },
                {
                    name: 'EMPLYMT_TYP_NM__c',
                    type: 'string'
                },
                {
                    name: 'FirstName',
                    type: 'string'
                },
                {
                    name: 'LastName',
                    type: 'string'
                },
                {
                    name: 'Profile.Name',
                    type: 'string'
                },
                {
                    name: 'Phone',
                    type: 'string'
                },
                {
                    name: 'MobilePhone',
                    type: 'string'
                },
                {
                    name: 'GM_LOC_ID__c',
                    type: 'string'
                },
                {
                    name: 'GM_LOC_NM__c',
                    type: 'string'
                },
                {
                    name: 'PERSONA__c',
                    type: 'string'
                },
                {
                    name: 'GPID__c',
                    type: 'string'
                },
                {
                    name: 'BU_ID__c',
                    type: 'string'
                },
                {
                    name: 'IsActive',
                    type: 'boolean'
                },
                {
                    name: 'Title',
                    type: 'string'
                },
                {
                    name: 'FT_EMPLYE_FLG_VAL__c',
                    type: 'string'
                },
                {
                    name: 'USER_ACTIVE__c',
                    type: 'boolean'
                },
                {
                    name: 'ProfileId',
                    type: 'string'
                },
                {
                    name: 'SmallPhotoUrl',
                    type: 'string'
                },
                {
                    name: 'Merchandising_Base_Minimum_Requirement__c',
                    type: 'boolean'
                },
                {
                    name: 'LC_ID__c',
                    type: 'string'
                },
                {
                    name: 'WRKFRC_EMPLYMT_TRMNTN_DT__c',
                    type: 'boolean'
                },
                {
                    name: 'ADDR_LN_1_TXT__c',
                    type: 'string'
                },
                {
                    name: 'ADDR_LN_2_TXT__c',
                    type: 'string'
                },
                {
                    name: 'CITY_NM__c',
                    type: 'string'
                },
                {
                    name: 'PSTL_AREA_VAL__c',
                    type: 'string'
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                }
            ],
            syncUpCreateFields: [
                'Id',
                'FirstName',
                'LastName',
                'Phone',
                'GM_LOC_ID__c',
                'GM_LOC_NM__c',
                'PERSONA__c',
                'GPID__c',
                'IsActive',
                'Title',
                'FT_EMPLYE_FLG_VAL__c',
                'USER_ACTIVE__c',
                'ProfileId'
            ],
            syncUpCreateQuery: `
                SELECT
                {User:Id},
                {User:FirstName},
                {User:LastName},
                {User:Phone},
                {User:GM_LOC_ID__c},
                {User:GM_LOC_NM__c},
                {User:PERSONA__c},
                {User:GPID__c},
                {User:IsActive},
                {User:Title},
                {User:FT_EMPLYE_FLG_VAL__c},
                {User:USER_ACTIVE__c},
                {User:ProfileId},
                {User:_soupEntryId},
                {User:__local__},
                {User:__locally_created__},
                {User:__locally_updated__},
                {User:__locally_deleted__}
                FROM {User}
            `
        },
        {
            name: 'Visit',
            soupName: 'Visit',
            initQuery:
                'SELECT Id, Name, OwnerId, PlaceId, VisitorId, Visitor.Name, Status__c, ' +
                'ActualVisitEndTime, ActualVisitStartTime, LastModifiedDate, PlannedVisitEndTime, ' +
                'PlannedVisitStartTime, Ad_Hoc__c, RecordTypeId, RecordType.Id, RecordType.Name, RecordType.DeveloperName, Planned_Date__c, Sequence__c, Visit_List__c, ' +
                'Planned_Duration_Minutes__c, Actual_Duration_Minutes__c, Planned_Travel_Time__c, Planned_Mileage__c, ' +
                'Scheduled_Case_Quantity__c, Cases_Goal_Quantity__c, Schedule_Visit_Group__c,Visit_Subtype__c, Take_Order_Flag__c, AMAS_Compliant__c,' +
                'InstructionDescription, Check_In_Location_Flag__c, Pull_Number__c, Manager_Ad_Hoc__c, Check_Out_Location_Flag__c, ' +
                'Customer_ID__c, Sales_Visit__c, RTE_ID__c, Route_Group__c, Reassigned_Flag__c, Dynamic_Frequency_Add__c, Dynamic_Frequency_Remove__c, Reassigned__c FROM Visit WHERE Retail_Store__r.LOC_PROD_ID__c = APPLY_USER_LOCATION AND Planned_Date__c >= LAST_WEEK ' +
                "AND Status__c != 'Pre-Processed' AND Status__c != 'Failed'",
            optimization: true,
            optimizationQuery:
                " AND ((Status__c != 'Removed' AND Dynamic_Frequency_Remove__c = false) OR (Dynamic_Frequency_Remove__c = true AND Status__c = 'Removed'))",
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Name',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'OwnerId',
                    type: 'string'
                },
                {
                    name: 'PlaceId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'VisitorId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Visitor.Name',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Status__c',
                    type: 'string'
                },
                {
                    name: 'ActualVisitEndTime',
                    type: 'string'
                },
                {
                    name: 'ActualVisitStartTime',
                    type: 'string'
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'PlannedVisitEndTime',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'PlannedVisitStartTime',
                    type: 'string'
                },
                {
                    name: 'Ad_Hoc__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'RecordTypeId',
                    type: 'string'
                },

                {
                    name: 'RecordType.Id',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RecordType.Name',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RecordType.DeveloperName',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Planned_Date__c',
                    type: 'string'
                },
                {
                    name: 'Sequence__c',
                    type: 'integer'
                },
                {
                    name: 'Visit_List__c',
                    type: 'string'
                },
                {
                    name: 'Planned_Duration_Minutes__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Actual_Duration_Minutes__c',
                    type: 'string'
                },
                {
                    name: 'Planned_Travel_Time__c',
                    type: 'floating'
                },
                {
                    name: 'Planned_Mileage__c',
                    type: 'floating'
                },
                {
                    name: 'Scheduled_Case_Quantity__c',
                    type: 'floating'
                },
                {
                    name: 'Schedule_Visit_Group__c',
                    type: 'string'
                },
                {
                    name: 'Visit_Subtype__c',
                    type: 'string'
                },
                {
                    name: 'Take_Order_Flag__c',
                    type: 'boolean'
                },
                {
                    name: 'AMAS_Compliant__c',
                    type: 'boolean'
                },
                {
                    name: 'InstructionDescription',
                    type: 'string'
                },
                {
                    name: 'Check_In_Location_Flag__c',
                    type: 'boolean'
                },
                {
                    name: 'Pull_Number__c',
                    type: 'integer'
                },
                {
                    name: 'Manager_Ad_Hoc__c',
                    type: 'boolean'
                },
                {
                    name: 'Check_Out_Location_Flag__c',
                    type: 'boolean'
                },
                {
                    name: 'Customer_ID__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Sales_Visit__c',
                    type: 'boolean'
                },
                {
                    name: 'Cases_Goal_Quantity__c',
                    type: 'floating',
                    skipSyncUp: true
                },
                {
                    name: 'RTE_ID__c',
                    type: 'string'
                },
                {
                    name: 'Route_Group__c',
                    type: 'string'
                },
                {
                    name: 'Reassigned_Flag__c',
                    type: 'string'
                },
                {
                    name: 'Dynamic_Frequency_Add__c',
                    type: 'boolean'
                },
                {
                    name: 'Dynamic_Frequency_Remove__c',
                    type: 'boolean'
                },
                {
                    name: 'Reassigned__c',
                    type: 'boolean'
                }
            ],
            sysFields: ['LastModifiedDate', 'Name', 'Actual_Duration_Minutes__c'],
            syncUpCreateFields: [
                'Id',
                'OwnerId',
                'PlaceId',
                'VisitorId',
                'Status__c',
                'ActualVisitEndTime',
                'ActualVisitStartTime',
                'PlannedVisitEndTime',
                'PlannedVisitStartTime',
                'Ad_Hoc__c',
                'RecordTypeId',
                'Planned_Date__c',
                'Sequence__c',
                'Pull_Number__c',
                'Planned_Travel_Time__c',
                'Scheduled_Case_Quantity__c',
                'Planned_Mileage__c',
                'Planned_Duration_Minutes__c',
                'Schedule_Visit_Group__c',
                'Visit_List__c',
                'Visit_Subtype__c',
                'Take_Order_Flag__c',
                'InstructionDescription',
                'Manager_Ad_Hoc__c',
                'Sales_Visit__c',
                'Route_Group__c',
                'Dynamic_Frequency_Add__c',
                'Dynamic_Frequency_Remove__c',
                'Reassigned__c'
            ],
            syncUpCreateQuery: `
            SELECT
            {Visit:Id},
            {Visit:OwnerId},
            {Visit:PlaceId},
            {Visit:VisitorId},
            {Visit:Status__c},
            {Visit:ActualVisitEndTime},
            {Visit:ActualVisitStartTime},
            {Visit:PlannedVisitEndTime},
            {Visit:PlannedVisitStartTime},
            {Visit:Ad_Hoc__c},
            {Visit:RecordTypeId},
            {Visit:Planned_Date__c},
            {Visit:Sequence__c},
            {Visit:Pull_Number__c},
            {Visit:Planned_Travel_Time__c},
            {Visit:Scheduled_Case_Quantity__c},
            {Visit:Planned_Mileage__c},
            {Visit:Planned_Duration_Minutes__c},
            {Visit:Schedule_Visit_Group__c},
            {Visit:Visit_List__c},
            {Visit:Visit_Subtype__c},
            {Visit:Take_Order_Flag__c},
            {Visit:InstructionDescription},
            {Visit:Manager_Ad_Hoc__c},
            {Visit:Sales_Visit__c},
            {Visit:Route_Group__c},
            {Visit:Dynamic_Frequency_Add__c},
            {Visit:Dynamic_Frequency_Remove__c},
            {Visit:Reassigned__c},
            {Visit:_soupEntryId},
            {Visit:__local__},
            {Visit:__locally_created__},
            {Visit:__locally_updated__},
            {Visit:__locally_deleted__}
            FROM {Visit}
            `,
            syncDownCB: () => {
                fetchAssessmentTaskAndContentDocument()
            }
        },
        {
            name: 'Visit_List__c',
            soupName: 'Visit_List__c',
            initQuery: VisitList.baseQuery + VisitList.baseCondition,
            optimization: true,
            optimizationQuery: ' AND IsRemoved__c = false',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Name',
                    type: 'string'
                },
                {
                    name: 'OwnerId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Start_Date__c',
                    type: 'string'
                },
                {
                    name: 'End_Date__c',
                    type: 'string'
                },
                {
                    name: 'Start_Time__c',
                    type: 'string'
                },
                {
                    name: 'Start_Date_Time__c',
                    type: 'string'
                },
                {
                    name: 'End_Time__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'End_Date_Time__c',
                    type: 'string'
                },
                {
                    name: 'Visit_Date__c',
                    type: 'string'
                },
                {
                    name: 'RecordTypeId',
                    type: 'string'
                },
                {
                    name: 'Status__c',
                    type: 'string'
                },
                {
                    name: 'Visit_List_Group__c',
                    type: 'string'
                },
                {
                    name: 'Location_Id__c',
                    type: 'string'
                },
                {
                    name: 'Updated__c',
                    type: 'boolean'
                },
                {
                    name: 'Total_Planned_Time__c',
                    type: 'integer'
                },
                {
                    name: 'Planned_Mileage__c',
                    type: 'string'
                },
                {
                    name: 'Planned_Travel_Time__c',
                    type: 'string'
                },
                {
                    name: 'Number_of_Planned_Visits__c',
                    type: 'string'
                },
                {
                    name: 'Manager_Ad_Hoc__c',
                    type: 'boolean'
                },
                {
                    name: 'Merch_Relief_Planned_Cost__c',
                    type: 'floating'
                },
                {
                    name: 'Merch_Relief_Target_Cost__c',
                    type: 'floating'
                },
                {
                    name: 'Merch_Relief_Total_Planned_Time__c',
                    type: 'integer'
                },
                {
                    name: 'Merch_Relief_Target_Time__c',
                    type: 'integer'
                },
                {
                    name: 'Sales_Planned_Cost__c',
                    type: 'floating'
                },
                {
                    name: 'Sales_Target_Cost__c',
                    type: 'floating'
                },
                {
                    name: 'Sales_Total_Planned_Time__c',
                    type: 'integer'
                },
                {
                    name: 'Sales_Target_Time__c',
                    type: 'integer'
                },
                {
                    name: 'Planned_Cost__c',
                    type: 'floating'
                },
                {
                    name: 'Target_Cost__c',
                    type: 'floating'
                },
                {
                    name: 'Target_Time__c',
                    type: 'integer'
                },
                {
                    name: 'Planned_Service_Time__c',
                    type: 'integer'
                },
                {
                    name: 'Total_Planned_Cases__c',
                    type: 'integer'
                },
                {
                    name: 'Planned_Meeting_Time__c',
                    type: 'integer'
                },
                {
                    name: 'IsRemoved__c',
                    type: 'boolean'
                },
                {
                    name: 'Resequenced__c',
                    type: 'boolean'
                },
                {
                    name: 'Unscheduled__c',
                    type: 'boolean'
                },
                {
                    name: 'Unassigned_Employee_Cost__c',
                    type: 'floating'
                },
                {
                    name: 'Unassigned_Employee_Time__c',
                    type: 'integer'
                },
                {
                    name: 'Count_of_Unassigned_Employees__c',
                    type: 'integer'
                },
                {
                    name: 'Unscheduled_Cost_Inclusion__c',
                    type: 'boolean'
                },
                {
                    name: 'Sales_Unassigned_Employee_Time__c',
                    type: 'integer'
                },
                {
                    name: 'Merch_Relief_Unassigned_Employee_Time__c',
                    type: 'integer'
                },
                {
                    name: 'Sales_Count_of_Unassigned_Employees__c',
                    type: 'integer'
                },
                {
                    name: 'MerchRelief_Count_of_UnassignedEmployees__c',
                    type: 'integer'
                },
                {
                    name: 'Sales_Unassigned_Employee_Cost__c',
                    type: 'floating'
                },
                {
                    name: 'Merch_Relief_Unassigned_Employee_Cost__c',
                    type: 'floating'
                },
                {
                    name: 'Load_Number__c',
                    type: 'string'
                },
                {
                    name: 'Manifest_End_Time__c',
                    type: 'string'
                },
                {
                    name: 'Manifest_Start_Time__c',
                    type: 'string'
                },
                {
                    name: 'RecordType.DeveloperName',
                    type: 'string'
                },
                {
                    name: 'Start_Gap__c',
                    type: 'floating'
                },
                {
                    name: 'End_Gap__c',
                    type: 'floating'
                },
                {
                    name: 'Gate_Check_Out__c',
                    type: 'string'
                },
                {
                    name: 'Gate_Check_In__c',
                    type: 'string'
                },
                {
                    name: 'Manifest_Fence_Check_In__c',
                    type: 'string'
                },
                {
                    name: 'Manifest_Fence_Check_Out__c',
                    type: 'string'
                },
                {
                    name: 'Cost_Of_Unassigned_Visits__c',
                    type: 'floating'
                },
                {
                    name: 'Kronos_Punch_Out__c',
                    type: 'string'
                },
                {
                    name: 'Kronos_Punch_In__c',
                    type: 'string'
                },
                {
                    name: 'Unassigned_Time__c',
                    type: 'floating'
                }
            ],
            sysFields: ['LastModifiedDate'],
            syncUpCreateFields: [
                'Id',
                'Name',
                'OwnerId',
                'Start_Date__c',
                'End_Date__c',
                'Start_Time__c',
                'End_Time__c',
                'Visit_Date__c',
                'RecordTypeId',
                'Status__c',
                'Visit_List_Group__c',
                'Location_Id__c',
                'Updated__c',
                'Manager_Ad_Hoc__c',
                'Planned_Travel_Time__c',
                'Planned_Mileage__c',
                'Number_of_Planned_Visits__c',
                'Planned_Service_Time__c',
                'Total_Planned_Cases__c',
                'Planned_Meeting_Time__c',
                'IsRemoved__c',
                'Resequenced__c',
                'Unscheduled__c',
                'Unassigned_Employee_Cost__c',
                'Unassigned_Employee_Time__c',
                'Count_of_Unassigned_Employees__c',
                'Unscheduled_Cost_Inclusion__c',
                'Sales_Unassigned_Employee_Time__c',
                'Merch_Relief_Unassigned_Employee_Time__c',
                'Sales_Count_of_Unassigned_Employees__c',
                'MerchRelief_Count_of_UnassignedEmployees__c',
                'Sales_Unassigned_Employee_Cost__c',
                'Merch_Relief_Unassigned_Employee_Cost__c',
                'Cost_Of_Unassigned_Visits__c',
                'Kronos_Punch_Out__c',
                'Kronos_Punch_In__c'
            ],
            syncUpCreateQuery: `
            SELECT
            {Visit_List__c:Id},
            {Visit_List__c:Name},
            {Visit_List__c:OwnerId},
            {Visit_List__c:Start_Date__c},
            {Visit_List__c:End_Date__c},
            {Visit_List__c:Start_Time__c},
            {Visit_List__c:End_Time__c},
            {Visit_List__c:Visit_Date__c},
            {Visit_List__c:RecordTypeId},
            {Visit_List__c:Status__c},
            {Visit_List__c:Visit_List_Group__c},
            {Visit_List__c:Location_Id__c},
            {Visit_List__c:Updated__c},
            {Visit_List__c:Manager_Ad_Hoc__c},
            {Visit_List__c:Planned_Travel_Time__c},
            {Visit_List__c:Planned_Mileage__c},
            {Visit_List__c:Number_of_Planned_Visits__c},
            {Visit_List__c:Planned_Service_Time__c},
            {Visit_List__c:Total_Planned_Cases__c},
            {Visit_List__c:Planned_Meeting_Time__c},
            {Visit_List__c:IsRemoved__c},
            {Visit_List__c:Resequenced__c},
            {Visit_List__c:Unscheduled__c},
            {Visit_List__c:Unassigned_Employee_Cost__c},
            {Visit_List__c:Unassigned_Employee_Time__c},
            {Visit_List__c:Count_of_Unassigned_Employees__c},
            {Visit_List__c:Unscheduled_Cost_Inclusion__c},
            {Visit_List__c:Sales_Unassigned_Employee_Time__c},
            {Visit_List__c:Merch_Relief_Unassigned_Employee_Time__c},
            {Visit_List__c:Sales_Count_of_Unassigned_Employees__c},
            {Visit_List__c:MerchRelief_Count_of_UnassignedEmployees__c},
            {Visit_List__c:Sales_Unassigned_Employee_Cost__c},
            {Visit_List__c:Merch_Relief_Unassigned_Employee_Cost__c},
            {Visit_List__c:Cost_Of_Unassigned_Visits__c},
            {Visit_List__c:Kronos_Punch_Out__c},
            {Visit_List__c:Kronos_Punch_In__c},
            {Visit_List__c:_soupEntryId},
            {Visit_List__c:__local__},
            {Visit_List__c:__locally_created__},
            {Visit_List__c:__locally_updated__},
            {Visit_List__c:__locally_deleted__}
            FROM {Visit_List__c}
            `,
            syncDownCB: async () => {
                const query = buildSingleSyncDownQuery(VisitList.baseQuery + VisitList.cbCondition)
                await Promise.all(
                    query.map((q) => {
                        return syncDownObj('Visit_List__c', q)
                    })
                )
            }
        },
        {
            name: 'Task',
            soupName: 'Task',
            initQuery: `SELECT Id, OwnerId, Display_Id_Instore__c, Display_Id_Instore__r.End_Date__c, Location_Formula__c, LastModifiedDate,
            ActivityDate, WhatId, Wo_Ordered_By_ID__c, Wo_Ordered_By_Name__c, Wo_Approver_Id__c, Wo_Approver_Name__c, 
            Wo_Subject__c, Wo_Comments__c, Description, Merch_Comments__c, Subject, Status, Type, Wo_Location__c,
            RecordTypeId, RecordType.Id, RecordType.Name, RecordType.DeveloperName, Wo_Cmplt_Dte__c, Completed_By_User__c FROM Task
            WHERE What.type = 'RetailStore' AND RecordType.Name = 'Work Order' 
            AND (Display_Id_Instore__r.End_Date__c = null or Display_Id_Instore__r.End_Date__c >= LAST_N_DAYS:14:DATE) 
            AND (
                (Status = 'Complete' AND Wo_Cmplt_Dte__c >= LAST_N_DAYS:14:TIME AND Wo_Cmplt_Dte__c <= NEXT_N_DAYS:1:TIME)
                OR Status = 'Open'
            )
            AND WhatId IN (SELECT Id FROM RetailStore WHERE Account.LOC_PROD_ID__c = APPLY_USER_LOCATION)`,
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'OwnerId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Display_Id_Instore__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Display_Id_Instore__r.End_Date__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Location_Formula__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'ActivityDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'WhatId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Wo_Ordered_By_ID__c',
                    type: 'string'
                },
                {
                    name: 'Wo_Ordered_By_Name__c',
                    type: 'sting'
                },
                {
                    name: 'Wo_Approver_Id__c',
                    type: 'string'
                },
                {
                    name: 'Wo_Approver_Name__c',
                    type: 'string'
                },
                {
                    name: 'Wo_Subject__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Wo_Comments__c',
                    type: 'string'
                },
                {
                    name: 'Description',
                    type: 'string'
                },
                {
                    name: 'Merch_Comments__c',
                    type: 'string'
                },
                {
                    name: 'Subject',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Status',
                    type: 'string'
                },
                {
                    name: 'Type',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Wo_Location__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RecordTypeId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RecordType.Id',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RecordType.Name',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'RecordType.DeveloperName',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Wo_Cmplt_Dte__c',
                    type: 'string'
                },
                {
                    name: 'Completed_By_User__c',
                    type: 'string'
                },
                {
                    name: 'COF_Requested_Date__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Owner.Name',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Lead__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Call_Date__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Call_Details__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Call_Details2__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Call_Details3__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Call_Subject__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Contact_Made__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'Name_of_Contact__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Onsite__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'CreatedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'CreatedBy.Name',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'CompletedDateTime',
                    type: 'string'
                }
            ],
            syncUpCreateFields: [
                'Id',
                'OwnerId',
                'WhatId',
                'Merch_Comments__c',
                'Status',
                'Wo_Cmplt_Dte__c',
                'Completed_By_User__c'
            ],
            syncUpCreateQuery:
                'SELECT ' +
                '{Task:Id}, ' +
                '{Task:OwnerId},' +
                '{Task:WhatId}' +
                '{Task:Merch_Comments__c},' +
                '{Task:Status},' +
                '{Task:Wo_Cmplt_Dte__c} ' +
                '{Task:Completed_By_User__c} ' +
                "FROM {Task} WHERE {Task:__locally_updated__}='1'"
        },
        {
            name: 'Overtime_Rule__mdt',
            soupName: 'Overtime_Rule__mdt',
            noLastModifiedField: true,
            initQuery:
                'SELECT Id, DeveloperName, LocationID__c, Location_or_Global__c, Rule__c, Value__c FROM Overtime_Rule__mdt',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'DeveloperName',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LocationID__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Location_or_Global__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Rule__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Value__c',
                    type: 'integer',
                    skipSyncUp: true
                }
            ]
        },
        {
            name: 'User_Stats__c',
            soupName: 'User_Stats__c',
            initQuery:
                'SELECT Id, Start_Time__c, Sunday__c, Monday__c, Tuesday__c, Wednesday__c, ' +
                'Thursday__c, Friday__c, Saturday__c, Friday_Start_Time__c, Monday_Start_Time__c, ' +
                'Saturday_Start_Time__c, Sunday_Start_Time__c, Thursday_Start_Time__c, Tuesday_Start_Time__c, ' +
                'Wednesday_Start_Time__c, User__c, OwnerId, Starting_Location__c, Sales_Function__c, ' +
                'Merchandising_Base__c, LastModifiedDate, Notification_Preference__c, RecordTypeId, ' +
                'Schedule_Favorited__c, Manager_Directs__c, Is_Night_Shift__c FROM User_Stats__c ' +
                "WHERE USER__r.GM_LOC_ID__c = APPLY_USER_LOCATION AND RecordType.DeveloperName = 'Stats'",
            optimization: true,
            optimizationQuery: ' AND User__r.IsActive = true',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Start_Time__c',
                    type: 'string'
                },
                {
                    name: 'Sunday__c',
                    type: 'boolean'
                },
                {
                    name: 'Monday__c',
                    type: 'boolean'
                },
                {
                    name: 'Tuesday__c',
                    type: 'boolean'
                },
                {
                    name: 'Wednesday__c',
                    type: 'boolean'
                },
                {
                    name: 'Thursday__c',
                    type: 'boolean'
                },
                {
                    name: 'Friday__c',
                    type: 'boolean'
                },
                {
                    name: 'Saturday__c',
                    type: 'boolean'
                },
                {
                    name: 'Friday_Start_Time__c',
                    type: 'string'
                },
                {
                    name: 'Monday_Start_Time__c',
                    type: 'string'
                },
                {
                    name: 'Saturday_Start_Time__c',
                    type: 'string'
                },
                {
                    name: 'Sunday_Start_Time__c',
                    type: 'string'
                },
                {
                    name: 'Thursday_Start_Time__c',
                    type: 'string'
                },
                {
                    name: 'Tuesday_Start_Time__c',
                    type: 'string'
                },
                {
                    name: 'Wednesday_Start_Time__c',
                    type: 'string'
                },
                {
                    name: 'User__c',
                    type: 'string'
                },
                {
                    name: 'OwnerId',
                    type: 'string'
                },
                {
                    name: 'Starting_Location__c',
                    type: 'string'
                },
                {
                    name: 'Sales_Function__c',
                    type: 'string'
                },
                {
                    name: 'Merchandising_Base__c',
                    type: 'boolean'
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Notification_Preference__c',
                    type: 'string'
                },
                {
                    name: 'RecordTypeId',
                    type: 'string'
                },
                {
                    name: 'Schedule_Favorited__c',
                    type: 'string'
                },
                {
                    name: 'Manager_Directs__c',
                    type: 'string'
                },
                {
                    name: 'Is_Night_Shift__c',
                    type: 'boolean'
                }
            ],
            syncUpCreateFields: [
                'Id',
                'Start_Time__c',
                'Sunday__c',
                'Monday__c',
                'Tuesday__c',
                'Wednesday__c',
                'Thursday__c',
                'Friday__c',
                'Saturday__c',
                'User__c',
                'Friday_Start_Time__c',
                'Monday_Start_Time__c',
                'Saturday_Start_Time__c',
                'Sunday_Start_Time__c',
                'Thursday_Start_Time__c',
                'Tuesday_Start_Time__c',
                'Wednesday_Start_Time__c',
                'Starting_Location__c',
                'Sales_Function__c',
                'Merchandising_Base__c',
                'OwnerId',
                'Notification_Preference__c',
                'Schedule_Favorited__c',
                'Is_Night_Shift__c'
            ],
            syncUpCreateQuery: `
                SELECT
                {User_Stats__c:Id},
                {User_Stats__c:Start_Time__c},
                {User_Stats__c:Sunday__c},
                {User_Stats__c:Monday__c},
                {User_Stats__c:Tuesday__c},
                {User_Stats__c:Wednesday__c},
                {User_Stats__c:Thursday__c},
                {User_Stats__c:Friday__c},
                {User_Stats__c:Saturday__c},
                {User_Stats__c:User__c},
                {User_Stats__c:Friday_Start_Time__c},
                {User_Stats__c:Monday_Start_Time__c},
                {User_Stats__c:Saturday_Start_Time__c},
                {User_Stats__c:Sunday_Start_Time__c},
                {User_Stats__c:Thursday_Start_Time__c},
                {User_Stats__c:Tuesday_Start_Time__c},
                {User_Stats__c:Wednesday_Start_Time__c},
                {User_Stats__c:Starting_Location__c},
                {User_Stats__c:Sales_Function__c},
                {User_Stats__c:Merchandising_Base__c},
                {User_Stats__c:OwnerId},
                {User_Stats__c:Notification_Preference__c},
                {User_Stats__c:Schedule_Favorited__c},
                {User_Stats__c:Is_Night_Shift__c},
                {User_Stats__c:_soupEntryId},
                {User_Stats__c:__local__},
                {User_Stats__c:__locally_created__},
                {User_Stats__c:__locally_updated__},
                {User_Stats__c:__locally_deleted__}
                FROM {User_Stats__c}
            `
        },
        {
            name: 'Route_Sales_Geo__c',
            soupName: 'Route_Sales_Geo__c',
            initQuery: `
                SELECT Id, Name, OwnerId, RecordTypeId, SLS_UNIT_ACTV_FLG_VAL__c, SYS_ID__c, LOC_ID__c, Merch_Flag__c,
                LOCL_RTE_ID__c, GTMU_RTE_ID__c, SLS_UNIT_NM__c, ADDR_LN_1_TXT__c, ADDR_LN_2_TXT__c, CITY_NM__c, PSTL_AREA_VAL__c, SLS_UNIT_ID__c,
                Default_Start_Time__c, Default_Starting_Location__c, LastModifiedDate, CTRY_NM__c, HRCHY_LVL__c, Parent_Node__c, RTE_TERR_NM__c,
                Go_Kart_Flag__c FROM Route_Sales_Geo__c WHERE 
                ((LOC_ID__c = APPLY_USER_LOCATION OR SLS_UNIT_ID__c = APPLY_USER_LOCATION) OR 
                (Parent_Node__r.LOC_ID__c = APPLY_USER_LOCATION OR Parent_Node__r.SLS_UNIT_ID__c = APPLY_USER_LOCATION) OR
                (Parent_Node__r.Parent_Node__r.LOC_ID__c = APPLY_USER_LOCATION OR Parent_Node__r.Parent_Node__r.SLS_UNIT_ID__c = APPLY_USER_LOCATION))
            `,
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Name',
                    type: 'string'
                },
                {
                    name: 'OwnerId',
                    type: 'string'
                },
                {
                    name: 'RecordTypeId',
                    type: 'string'
                },
                {
                    name: 'SLS_UNIT_ACTV_FLG_VAL__c',
                    type: 'string'
                },
                {
                    name: 'SYS_ID__c',
                    type: 'string'
                },
                {
                    name: 'LOC_ID__c',
                    type: 'string'
                },
                {
                    name: 'Merch_Flag__c',
                    type: 'boolean'
                },
                {
                    name: 'LOCL_RTE_ID__c',
                    type: 'string'
                },
                {
                    name: 'GTMU_RTE_ID__c',
                    type: 'string'
                },
                {
                    name: 'SLS_UNIT_NM__c',
                    type: 'string'
                },
                {
                    name: 'ADDR_LN_1_TXT__c',
                    type: 'string'
                },
                {
                    name: 'ADDR_LN_2_TXT__c',
                    type: 'string'
                },
                {
                    name: 'CITY_NM__c',
                    type: 'string'
                },
                {
                    name: 'PSTL_AREA_VAL__c',
                    type: 'string'
                },
                {
                    name: 'SLS_UNIT_ID__c',
                    type: 'string'
                },
                {
                    name: 'Default_Start_Time__c',
                    type: 'string'
                },
                {
                    name: 'Default_Starting_Location__c',
                    type: 'string'
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'CTRY_NM__c',
                    type: 'string'
                },
                {
                    name: 'HRCHY_LVL__c',
                    type: 'string'
                },
                {
                    name: 'Parent_Node__c',
                    type: 'string'
                },
                {
                    name: 'RTE_TERR_NM__c',
                    type: 'string'
                },
                {
                    name: 'Go_Kart_Flag__c',
                    type: 'boolean'
                },
                {
                    name: 'RTE_TYP_GRP_NM__c',
                    type: 'string'
                },
                {
                    name: 'RTE_TYP_CDV__c',
                    type: 'string'
                },
                {
                    name: 'Location__c',
                    type: 'string'
                }
            ],
            syncUpCreateFields: [
                'Id',
                'OwnerId',
                'RecordTypeId',
                'LOC_ID__c',
                'Merch_Flag__c',
                'Default_Start_Time__c',
                'Default_Starting_Location__c',
                'Go_Kart_Flag__c'
            ],
            syncUpCreateQuery: `
                SELECT
                    {Route_Sales_Geo__c:Id},
                    {Route_Sales_Geo__c:OwnerId},
                    {Route_Sales_Geo__c:RecordTypeId},
                    {Route_Sales_Geo__c:LOC_ID__c},
                    {Route_Sales_Geo__c:Merch_Flag__c},
                    {Route_Sales_Geo__c:Default_Start_Time__c},
                    {Route_Sales_Geo__c:Default_Starting_Location__c},
                    {Route_Sales_Geo__c:Go_Kart_Flag__c},
                    {Route_Sales_Geo__c:_soupEntryId},
                    {Route_Sales_Geo__c:__local__},
                    {Route_Sales_Geo__c:__locally_created__},
                    {Route_Sales_Geo__c:__locally_updated__},
                    {Route_Sales_Geo__c:__locally_deleted__}
                FROM {Route_Sales_Geo__c}
            `
        },
        {
            name: 'Account',
            soupName: 'Account',
            initQuery:
                'SELECT Id, Name, Phone, ParentId, Parent.ParentId, Merchandising_Base__c, BUSN_SGMNTTN_LVL_1_NM__c, ' +
                'BUSN_SGMNTTN_LVL_2_NM__c, BUSN_SGMNTTN_LVL_3_NM__c, BUSN_SGMNTTN_LVL_4_NM__c, Sales_Route__c, Sales_Rep__c, ' +
                'BUSN_SGMNTTN_LVL_1_CDV__c, BUSN_SGMNTTN_LVL_2_CDV__c, BUSN_SGMNTTN_LVL_3_CDV__c, BUSN_SGMNTTN_LVL_4_CDV__c, ' +
                'LastModifiedDate, Indicator_2P__c, ' +
                'Sales_Rep_Info__c, ShippingAddress, Go_Kart_Flag__c, LOC_PROD_ID__c, CUST_ID__c, RTLR_STOR_NUM__c, CUST_UNIQ_ID_VAL__c, CUST_GEOFNC__c, change_initiated__c, Delta_Revenue_Percentage__c ' +
                'FROM Account ' +
                'WHERE LOC_PROD_ID__c = APPLY_USER_LOCATION',
            optimization: true,
            optimizationQuery: " AND IS_ACTIVE__c = true AND CUST_LVL__C =  'Customer Outlet'",
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Name',
                    type: 'string'
                },
                {
                    name: 'Phone',
                    type: 'string'
                },
                {
                    name: 'ParentId',
                    type: 'string'
                },
                {
                    name: 'Parent.ParentId',
                    type: 'string'
                },
                {
                    name: 'Merchandising_Base__c',
                    type: 'boolean'
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_1_NM__c',
                    type: 'string'
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_2_NM__c',
                    type: 'string'
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_3_NM__c',
                    type: 'string'
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_4_NM__c',
                    type: 'string'
                },
                {
                    name: 'Sales_Route__c',
                    type: 'string'
                },
                {
                    name: 'Sales_Rep__c',
                    type: 'string'
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_1_CDV__c',
                    type: 'string'
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_2_CDV__c',
                    type: 'string'
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_3_CDV__c',
                    type: 'string'
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_4_CDV__c',
                    type: 'string'
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Indicator_2P__c',
                    type: 'boolean'
                },
                {
                    name: 'Sales_Rep_Info__c',
                    type: 'string'
                },
                {
                    name: 'ShippingAddress',
                    type: 'string'
                },
                {
                    name: 'Go_Kart_Flag__c',
                    type: 'boolean'
                },
                {
                    name: 'LOC_PROD_ID__c',
                    type: 'string'
                },
                {
                    name: 'CUST_ID__c',
                    type: 'string'
                },
                {
                    name: 'RTLR_STOR_NUM__c',
                    type: 'string'
                },
                {
                    name: 'CUST_UNIQ_ID_VAL__c',
                    type: 'string'
                },
                {
                    name: 'CUST_GEOFNC__c',
                    type: 'string'
                },
                {
                    name: 'change_initiated__c',
                    type: 'boolean'
                },
                {
                    name: 'Delta_Revenue_Percentage__c',
                    type: 'number'
                }
            ],
            syncUpCreateFields: [
                'Id',
                'Name',
                'Phone',
                'Merchandising_Base__c',
                'Sales_Route__c',
                'Sales_Rep__c',
                'BUSN_SGMNTTN_LVL_1_NM__c',
                'BUSN_SGMNTTN_LVL_2_NM__c',
                'BUSN_SGMNTTN_LVL_3_NM__c',
                'Go_Kart_Flag__c'
            ],
            syncUpCreateQuery: `
                SELECT
                {Account:Id},
                {Account:Name},
                {Account:Phone},
                {Account:Merchandising_Base__c},
                {Account:Sales_Route__c},
                {Account:Sales_Rep__c},
                {Account:BUSN_SGMNTTN_LVL_1_NM__c},
                {Account:BUSN_SGMNTTN_LVL_2_NM__c},
                {Account:BUSN_SGMNTTN_LVL_3_NM__c},
                {Account:Go_Kart_Flag__c},
                {Account:_soupEntryId},
                {Account:__local__},
                {Account:__locally_created__},
                {Account:__locally_updated__},
                {Account:__locally_deleted__}
                FROM {Account}
            `
        },
        {
            name: 'Service_Detail__c',
            soupName: 'Service_Detail__c',
            initQuery:
                'SELECT Id, Day_of_the_Week__c, Pull_Number__c, Take_Order_Flag__c, Visit_Subtype__c, ' +
                'Customer_to_Route__r.Customer__c,Customer_to_Route__r.Merch_Flag__c,Customer_to_Route__r.RecordTypeId, ' +
                'Owner.Name, OwnerId, Customer_to_Route__c, IsRemoved__c, Unassigned__c, LastModifiedDate, Route_Group__c FROM Service_Detail__c ' +
                'WHERE Customer_to_Route__r.Customer__r.LOC_PROD_ID__c = APPLY_USER_LOCATION',
            optimization: true,
            optimizationQuery: ' AND Customer_to_Route__r.Customer__r.IS_ACTIVE__c = true AND IsRemoved__c = false',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Day_of_the_Week__c',
                    type: 'string'
                },
                {
                    name: 'Pull_Number__c',
                    type: 'integer'
                },
                {
                    name: 'Take_Order_Flag__c',
                    type: 'boolean'
                },
                {
                    name: 'Visit_Subtype__c',
                    type: 'string'
                },
                {
                    name: 'Customer_to_Route__r.Customer__c',
                    type: 'string'
                },
                {
                    name: 'Customer_to_Route__r.Merch_Flag__c',
                    type: 'string'
                },
                {
                    name: 'Customer_to_Route__r.RecordTypeId',
                    type: 'string'
                },
                {
                    name: 'Owner.Name',
                    type: 'string'
                },
                {
                    name: 'OwnerId',
                    type: 'string'
                },
                {
                    name: 'Customer_to_Route__c',
                    type: 'string'
                },
                {
                    name: 'IsRemoved__c',
                    type: 'boolean'
                },
                {
                    name: 'Unassigned__c',
                    type: 'boolean'
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Route_Group__c',
                    type: 'string'
                }
            ],
            syncUpCreateFields: [
                'Id',
                'Day_of_the_Week__c',
                'Pull_Number__c',
                'Take_Order_Flag__c',
                'Visit_Subtype__c',
                'OwnerId',
                'Customer_to_Route__c',
                'IsRemoved__c',
                'Unassigned__c',
                'Route_Group__c'
            ],
            syncUpCreateQuery: `
                SELECT
                {Service_Detail__c:Id},
                {Service_Detail__c:Day_of_the_Week__c},
                {Service_Detail__c:Pull_Number__c},
                {Service_Detail__c:Take_Order_Flag__c},
                {Service_Detail__c:Visit_Subtype__c},
                {Service_Detail__c:OwnerId},
                {Service_Detail__c:Customer_to_Route__c},
                {Service_Detail__c:IsRemoved__c},
                {Service_Detail__c:Unassigned__c},
                {Service_Detail__c:Route_Group__c},
                {Service_Detail__c:_soupEntryId},
                {Service_Detail__c:__local__},
                {Service_Detail__c:__locally_created__},
                {Service_Detail__c:__locally_updated__},
                {Service_Detail__c:__locally_deleted__}
                FROM {Service_Detail__c}
            `
        },
        {
            name: 'Line_Code_Grouping_Definition__mdt',
            soupName: 'Line_Code_Grouping_Definition__mdt',
            noLastModifiedField: true,
            initQuery:
                'SELECT Id, Line_Code_ID__c, My_Team_Grouping__c, Landing_Page_Grouping__c FROM Line_Code_Grouping_Definition__mdt',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Line_Code_ID__c',
                    type: 'string'
                },
                {
                    name: 'My_Team_Grouping__c',
                    type: 'string'
                },
                {
                    name: 'Landing_Page_Grouping__c',
                    type: 'string'
                }
            ]
        },
        {
            name: 'Customer_to_Route__c',
            soupName: 'Customer_to_Route__c',
            initQuery: `SELECT Id,
            Customer__r.Id,
            Route__r.Parent_Node__r.Parent_Node__r.SLS_UNIT_ID__c,
            Route__r.Id,
            Route__r.RTE_TERR_NM__c,
            Route__r.LOCL_RTE_ID__c,
            Route__r.GTMU_RTE_ID__c,
            Route__r.RTE_TYP_GRP_NM__c,
            Customer__r.Name,
            Customer__r.Phone,
            Customer__r.Sales_Route__c,
            Customer__r.Sales_Rep_Info__c,
            Customer__r.ShippingAddress,
            Customer__r.CUST_ID__c,
            Customer__r.IsCDACustomer__c,
            Customer__r.IsOTSCustomer__c,
            Customer__r.CDA_Medal__c,
            Customer__r.IS_ACTIVE__c,
            Customer__r.Delta_Revenue_Percentage__c,
            Customer__r.RTLR_STOR_NUM__c,
            Customer__r.CUST_UNIQ_ID_VAL__c,
            Customer__r.CUST_GEOFNC__c,
            OwnerId, Route__c, Merch_Flag__c, Customer__c, ACTV_FLG__c, RecordTypeId, CUST_RTE_FREQ_CDE__c,
            SLS_MTHD_CDE__c, ORD_DAYS__c, IsRemoved__c, LastModifiedDate, SLS_MTHD_NM__c, PROD_GRP_NM__c,
            DLVRY_MTHD_NM__c, DELY_DAYS__c, Route_Text__c, Lead__c,
            DELY_MTHD_CDE__c, PROD_GRP_CDE__c, Lead_DP_Route_Disp_NM__c,
            Pending__c, RecordType.Name, updated_dp__c
            FROM Customer_to_Route__c WHERE Route__c IN (SELECT Id FROM Route_Sales_Geo__c WHERE LOC_ID__c = APPLY_USER_LOCATION)`,
            optimization: true,
            optimizationQuery: ' AND ACTV_FLG__c = true AND IsRemoved__c = false',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Route__r.Id',
                    type: 'string'
                },
                {
                    name: 'Route__r.Parent_Node__r.Parent_Node__r.SLS_UNIT_ID__c',
                    type: 'string'
                },
                {
                    name: 'Route__r.RTE_TERR_NM__c',
                    type: 'string'
                },
                {
                    name: 'Route__r.LOCL_RTE_ID__c',
                    type: 'string'
                },
                {
                    name: 'Route__r.GTMU_RTE_ID__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Route__r.RTE_TYP_GRP_NM__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Customer__r.Id',
                    type: 'string'
                },
                {
                    name: 'Customer__r.Name',
                    type: 'string'
                },
                {
                    name: 'Customer__r.Phone',
                    type: 'string'
                },
                {
                    name: 'Customer__r.Sales_Route__c',
                    type: 'string'
                },
                {
                    name: 'Customer__r.Sales_Rep_Info__c',
                    type: 'string'
                },
                {
                    name: 'Customer__r.ShippingAddress',
                    type: 'string'
                },
                {
                    name: 'Customer__r.CUST_ID__c',
                    type: 'string'
                },
                {
                    name: 'Customer__r.RTLR_STOR_NUM__c',
                    type: 'string'
                },
                {
                    name: 'Customer__r.CUST_UNIQ_ID_VAL__c',
                    type: 'string'
                },
                {
                    name: 'Customer__r.CUST_GEOFNC__c',
                    type: 'string'
                },
                {
                    name: 'OwnerId',
                    type: 'string'
                },
                {
                    name: 'Route__c',
                    type: 'string'
                },
                {
                    name: 'Merch_Flag__c',
                    type: 'boolean'
                },
                {
                    name: 'Customer__c',
                    type: 'string'
                },
                {
                    name: 'ACTV_FLG__c',
                    type: 'boolean'
                },
                {
                    name: 'RecordTypeId',
                    type: 'string'
                },
                {
                    name: 'CUST_RTE_FREQ_CDE__c',
                    type: 'string'
                },
                {
                    name: 'SLS_MTHD_CDE__c',
                    type: 'string'
                },
                {
                    name: 'ORD_DAYS__c',
                    type: 'string'
                },
                {
                    name: 'IsRemoved__c',
                    type: 'boolean'
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'SLS_MTHD_NM__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'PROD_GRP_NM__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'DLVRY_MTHD_NM__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'DELY_DAYS__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Route_Text__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Lead__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'DELY_MTHD_CDE__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'PROD_GRP_CDE__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Lead_DP_Route_Disp_NM__c',
                    type: 'string'
                },
                {
                    name: 'Pending__c',
                    type: 'string'
                },
                {
                    name: 'RecordType.Name',
                    type: 'string'
                },
                {
                    name: 'Send_New_DP__c',
                    type: 'boolean'
                },
                {
                    name: 'DSTRB_PT_CREATE_DTE__c',
                    type: 'string'
                },
                {
                    name: 'CUST_ID__c',
                    type: 'string'
                },
                {
                    name: 'Customer__r.IsCDACustomer__c',
                    type: 'string'
                },
                {
                    name: 'Customer__r.CDA_Medal__c',
                    type: 'string'
                },
                {
                    name: 'Customer__r.IS_ACTIVE__c',
                    type: 'string'
                },
                {
                    name: 'Customer__r.Delta_Revenue_Percentage__c',
                    type: 'number'
                },
                {
                    name: 'Customer__r.IsOTSCustomer__c',
                    type: 'number'
                },
                {
                    name: 'CreatedById',
                    type: 'string'
                },
                {
                    name: 'Request__c',
                    type: 'string'
                },
                {
                    name: 'Request__r.status__c',
                    type: 'string'
                },
                {
                    name: 'created_by_savvy__c',
                    type: 'boolean'
                },
                {
                    name: 'updated_dp__c',
                    type: 'string'
                },
                {
                    name: 'Route__r.RTE_TYP_NM__c',
                    type: 'string',
                    skipSyncUp: true
                }
            ],
            syncUpCreateFields: [
                'Id',
                'OwnerId',
                'Route__c',
                'Merch_Flag__c',
                'Customer__c',
                'ACTV_FLG__c',
                'RecordTypeId',
                'IsRemoved__c'
            ],
            syncUpCreateQuery: `
                SELECT
                {Customer_to_Route__c:Id},
                {Customer_to_Route__c:OwnerId},
                {Customer_to_Route__c:Route__c},
                {Customer_to_Route__c:Merch_Flag__c},
                {Customer_to_Route__c:Customer__c},
                {Customer_to_Route__c:ACTV_FLG__c},
                {Customer_to_Route__c:RecordTypeId},
                {Customer_to_Route__c:IsRemoved__c},
                {Customer_to_Route__c:_soupEntryId},
                {Customer_to_Route__c:__local__},
                {Customer_to_Route__c:__locally_created__},
                {Customer_to_Route__c:__locally_updated__},
                {Customer_to_Route__c:__locally_deleted__}
                FROM {Customer_to_Route__c}
            `
        },
        {
            name: 'Route_Frequency_Mapping__mdt',
            soupName: 'Route_Frequency_Mapping__mdt',
            lastmodifiedlField: '',
            noLastModifiedField: true,
            initQuery: 'SELECT Id, Code__c, Label FROM Route_Frequency_Mapping__mdt',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Code__c',
                    type: 'string'
                },
                {
                    name: 'Label',
                    type: 'string'
                }
            ]
        },
        {
            name: 'Shipment',
            soupName: 'Shipment',
            initQuery:
                'SELECT Id, CreatedById, Retail_Store__c, Customer_Id__c, Visit__c, ' +
                'DeliveredToId, Delivery_Id__c, Employee_Id__c, Order_Id__c, OwnerId, ' +
                'Pallet_Count__c, ExpectedDeliveryDate, ActualDeliveryDate, CreatedDate, TotalItemsQuantity, ' +
                'ShipToName, Description, Status, Total_Certified__c, Total_Delivered__c, Total_Ordered__c, Total_Shipment_Return_Cs__c, Total_Shipment_Return_Un__c ' +
                'FROM Shipment WHERE Retail_Store__r.LOC_PROD_ID__c = APPLY_USER_LOCATION AND ' +
                "Status IN ('Open','Closed') AND Retail_Store__r.Account.Merchandising_Base_Minimum_Requirement__c = true " +
                'AND ((ExpectedDeliveryDate >= LAST_WEEK AND ExpectedDeliveryDate <= NEXT_N_WEEKS:4) OR ' +
                '(ActualDeliveryDate >= LAST_WEEK AND ActualDeliveryDate <= NEXT_N_WEEKS:4))',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'CreatedById',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Retail_Store__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Customer_Id__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Visit__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'DeliveredToId',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Delivery_Id__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Employee_Id__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Order_Id__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'OwnerId',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Pallet_Count__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'ExpectedDeliveryDate',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'ActualDeliveryDate',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'CreatedDate',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'TotalItemsQuantity',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'ShipToName',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Description',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Status',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Total_Certified__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Total_Delivered__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Total_Ordered__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Total_Shipment_Return_Cs__c',
                    type: 'floating',
                    syncUpCreate: true
                },
                {
                    name: 'Total_Shipment_Return_Un__c',
                    type: 'floating',
                    syncUpCreate: true
                }
            ]
        },
        {
            name: 'ShipmentItem',
            soupName: 'ShipmentItem',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Shipment.Order_Id__c',
                    type: 'string'
                },
                {
                    name: 'Shipment.Status',
                    type: 'string'
                },
                {
                    name: 'Description',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Certified_Quantity__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'CreatedById',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Delivered_Quantity__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Delivery_Id__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Ordered_Quantity__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Pallet_Number__c',
                    type: 'number',
                    syncUpCreate: true
                },
                {
                    name: 'Product2Id',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Quantity',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'ShipmentId',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Package_Type__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Product_Name__c',
                    type: 'string',
                    syncUpCreate: true
                }
            ]
        },
        {
            name: 'AssessmentTask',
            soupName: 'AssessmentTask',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'ParentId',
                    type: 'string'
                },
                {
                    name: 'Reason__c',
                    type: 'string'
                },
                {
                    name: 'Store_Manager_Name__c',
                    type: 'string'
                }
            ]
        },
        {
            name: 'ContentDocumentLink',
            soupName: 'ContentDocumentLink',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'ContentDocumentId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LinkedEntityId',
                    type: 'string',
                    skipSyncUp: true
                }
            ]
        },
        {
            name: 'Notification',
            soupName: 'Notification',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'additionalData',
                    type: 'string'
                },
                {
                    name: 'communityId',
                    type: 'string'
                },
                {
                    name: 'communityName',
                    type: 'string'
                },
                {
                    name: 'count',
                    type: 'string'
                },
                {
                    name: 'id',
                    type: 'string'
                },
                {
                    name: 'image',
                    type: 'string'
                },
                {
                    name: 'lastModified',
                    type: 'string'
                },
                {
                    name: 'messageBody',
                    type: 'string'
                },
                {
                    name: 'messageTitle',
                    type: 'string'
                },
                {
                    name: 'modefyDay',
                    type: 'string'
                },
                {
                    name: 'mostRecentActivityDate',
                    type: 'string'
                },
                {
                    name: 'organizationId',
                    type: 'string'
                },
                {
                    name: 'read',
                    type: 'boolean'
                },
                {
                    name: 'recipientId',
                    type: 'string'
                },
                {
                    name: 'seen',
                    type: 'boolean'
                },
                {
                    name: 'target',
                    type: 'string'
                },
                {
                    name: 'targetPageRef',
                    type: 'string'
                },
                {
                    name: 'type',
                    type: 'string'
                },
                {
                    name: 'url',
                    type: 'string'
                },
                {
                    name: 'delete',
                    type: 'boolean'
                },
                {
                    name: 'UserId',
                    type: 'string'
                },
                {
                    name: 'LastTime',
                    type: 'string'
                },
                {
                    name: 'mmId',
                    type: 'string'
                }
            ]
        },
        {
            name: 'Segment_Hierarchy_Image_Mapping__mdt',
            soupName: 'Segment_Hierarchy_Image_Mapping__mdt',
            noLastModifiedField: true,
            afterInitQuery:
                'SELECT Id, Channel__c, Segment__c, Sub_Segment__c, Template__c FROM Segment_Hierarchy_Image_Mapping__mdt',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Channel__c',
                    type: 'string'
                },
                {
                    name: 'Segment__c',
                    type: 'string'
                },
                {
                    name: 'Sub_Segment__c',
                    type: 'string'
                },
                {
                    name: 'Template__c',
                    type: 'string'
                }
            ]
        },
        {
            name: 'Employee_To_Route__c',
            soupName: 'Employee_To_Route__c',
            initQuery: `SELECT Id, Name, Route__c, User__c, LastModifiedDate, User__r.Name, Active_Flag__c, Status__c 
                FROM Employee_To_Route__c where route__c in (SELECT Id FROM Route_Sales_Geo__c WHERE 
                LOC_ID__c = APPLY_USER_LOCATION)`,
            optimization: true,
            optimizationQuery: ' AND Active_Flag__c = true',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Name',
                    type: 'string'
                },
                {
                    name: 'Route__c',
                    type: 'string'
                },
                {
                    name: 'User__c',
                    type: 'string'
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string'
                },
                {
                    name: 'User__r.Name',
                    type: 'string'
                },
                {
                    name: 'Active_Flag__c',
                    type: 'boolean'
                },
                {
                    name: 'Status__c',
                    type: 'string'
                }
            ]
        },
        {
            name: 'PepsiCo_Period_Calendar__mdt',
            soupName: 'PepsiCo_Period_Calendar__mdt',
            noLastModifiedField: true,
            initQuery: 'SELECT Id, End_Date__c, Sequence__c, Start_Date__c, Year__c FROM PepsiCo_Period_Calendar__mdt',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'End_Date__c',
                    type: 'string'
                },
                {
                    name: 'Sequence__c',
                    type: 'string'
                },
                {
                    name: 'Start_Date__c',
                    type: 'string'
                },
                {
                    name: 'Year__c',
                    type: 'string'
                }
            ]
        },
        {
            name: 'Breadcrumb_Timestamps__c',
            soupName: 'Breadcrumb_Timestamps__c',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Customer__c',
                    type: 'string'
                },
                {
                    name: 'Geofence_Direction__c',
                    type: 'string'
                },
                {
                    name: 'Time__c',
                    type: 'string'
                },
                {
                    name: 'User__c',
                    type: 'string'
                },
                {
                    name: 'Visit__c',
                    type: 'string'
                },
                {
                    name: 'Visit_List__c',
                    type: 'string'
                }
            ]
        },
        {
            name: 'Travel_Time_Buffer__mdt',
            soupName: 'Travel_Time_Buffer__mdt',
            noLastModifiedField: true,
            initQuery: 'SELECT Id, Location_ID__c, Time_In_Minutes__c, Type__c FROM Travel_Time_Buffer__mdt',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Location_ID__c',
                    type: 'string'
                },
                {
                    name: 'Time_In_Minutes__c',
                    type: 'floating'
                },
                {
                    name: 'Type__c',
                    type: 'string'
                }
            ]
        },
        {
            name: 'Time_Interval_Configuration__mdt',
            soupName: 'Time_Interval_Configuration__mdt',
            noLastModifiedField: true,
            initQuery:
                'SELECT Id, AfterEndTime__c, BeforeStartTime__c, Persona__c, Status__c FROM Time_Interval_Configuration__mdt',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'AfterEndTime__c',
                    type: 'string'
                },
                {
                    name: 'BeforeStartTime__c',
                    type: 'string'
                },
                {
                    name: 'Persona__c',
                    type: 'string'
                },
                {
                    name: 'Status__c',
                    type: 'string'
                }
            ]
        },
        {
            name: 'Regular_Working_Hours__mdt',
            soupName: 'Regular_Working_Hours__mdt',
            noLastModifiedField: true,
            initQuery: 'SELECT Id, Hours_Worked__c, LocationID__c, Type__c FROM Regular_Working_Hours__mdt',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Hours_Worked__c',
                    type: 'integer'
                },
                {
                    name: 'LocationID__c',
                    type: 'string'
                },
                {
                    name: 'Type__c',
                    type: 'string'
                }
            ]
        },
        {
            name: 'Asset_Attribute__c',
            soupName: 'Asset_Attribute__c',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'master_data_type__c',
                    type: 'string'
                },
                {
                    name: 'equip_move_type_cde__c',
                    type: 'string'
                },
                {
                    name: 'equip_move_type_desc__c',
                    type: 'string'
                },
                {
                    name: 'equip_move_purp_cde__c',
                    type: 'string'
                },
                {
                    name: 'equip_move_purp_descr__c',
                    type: 'string'
                },
                {
                    name: 'active_flag__c',
                    type: 'boolean'
                },
                {
                    name: 'serv_ctrct_id__c',
                    type: 'string'
                },
                {
                    name: 'serv_ctrct_nme__c',
                    type: 'string'
                },
                {
                    name: 'Sls_plan_desc__c',
                    type: 'string'
                },
                {
                    name: 'sls_plan_cde__c',
                    type: 'string'
                },
                {
                    name: 'serv_ctrct_typ_cde__c',
                    type: 'string'
                },
                {
                    name: 'serv_ctrct_org_id__c',
                    type: 'string'
                },
                {
                    name: 'equip_grphc_desc__c',
                    type: 'string'
                },
                {
                    name: 'equip_grphc_id__c',
                    type: 'string'
                },
                {
                    name: 'equip_type_desc__c',
                    type: 'string'
                },
                {
                    name: 'equip_styp_desc__c',
                    type: 'string'
                },
                {
                    name: 'equip_type_cde__c',
                    type: 'string'
                },
                {
                    name: 'equip_styp_cde__c',
                    type: 'string'
                },
                {
                    name: 'splr_site_addr1_txt__c',
                    type: 'string'
                },
                {
                    name: 'splr_site_city_nme__c',
                    type: 'string'
                },
                {
                    name: 'splr_site_st_cde__c',
                    type: 'string'
                },
                {
                    name: 'splr_site_zip_cde__c',
                    type: 'string'
                },
                {
                    name: 'supplier_name__c',
                    type: 'string'
                },
                {
                    name: 'supplier_no__c',
                    type: 'string'
                }
            ]
        },
        {
            name: 'AccountTeamMember',
            soupName: 'AccountTeamMember',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'UserId',
                    type: 'string'
                },
                {
                    name: 'AccountId',
                    type: 'string'
                }
            ]
        },
        {
            name: 'Asset',
            soupName: 'Asset',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Name',
                    type: 'string'
                },
                {
                    name: 'AccountId',
                    type: 'string'
                },
                {
                    name: 'ident_asset_num__c',
                    type: 'string'
                },
                {
                    name: 'serv_cntrt_nm__c',
                    type: 'string'
                },
                {
                    name: 'equip_site_desc__c',
                    type: 'string'
                },
                {
                    name: 'equip_inst_dte__c',
                    type: 'string'
                },
                {
                    name: 'equip_last_svc_dte__c',
                    type: 'string'
                },
                {
                    name: 'equip_type_desc__c',
                    type: 'string'
                },
                {
                    name: 'equip_styp_desc__c',
                    type: 'string'
                },
                {
                    name: 'SerialNumber',
                    type: 'string'
                },
                {
                    name: 'equip_ownr_nm__c',
                    type: 'string'
                },
                {
                    name: 'net_book_val_amt__c',
                    type: 'string'
                },
                {
                    name: 'equip_type_cde__c',
                    type: 'string'
                },
                {
                    name: 'equip_styp_cde__c',
                    type: 'string'
                },
                {
                    name: 'equip_grphc_id__c',
                    type: 'string'
                },
                {
                    name: 'equip_config_type_cde__c',
                    type: 'string'
                },
                {
                    name: 'ident_item_id__c',
                    type: 'string'
                },
                {
                    name: 'serv_ctrct_id__c',
                    type: 'string'
                },
                {
                    name: 'equip_ownr_cde__c',
                    type: 'string'
                },
                {
                    name: 'sls_plan_cde__c',
                    type: 'string'
                },
                {
                    name: 'agree_end_dte__c',
                    type: 'string'
                },
                {
                    name: 'equip_site_id__c',
                    type: 'string'
                },
                {
                    name: 'mnth_pymt_amt__c',
                    type: 'number'
                }
            ]
        },
        {
            name: 'Contact',
            soupName: 'Contact',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Email',
                    type: 'string'
                },
                {
                    name: 'FirstName',
                    type: 'string'
                },
                {
                    name: 'LastName',
                    type: 'string'
                },
                {
                    name: 'MobilePhone',
                    type: 'string'
                },
                {
                    name: 'Name',
                    type: 'string'
                },
                {
                    name: 'OwnerId',
                    type: 'string'
                },
                {
                    name: 'Phone',
                    type: 'string'
                },
                {
                    name: 'Primary_Phone_Extension__c',
                    type: 'string'
                },
                {
                    name: 'Primary_Phone_Type__c',
                    type: 'string'
                },
                {
                    name: 'Second_Phone_Extension__c',
                    type: 'string'
                },
                {
                    name: 'Second_Phone_Type__c',
                    type: 'string'
                },
                {
                    name: 'Primary_Contact__c',
                    type: 'boolean'
                },
                {
                    name: 'Preferred_Contact_Method__c',
                    type: 'string'
                },
                {
                    name: 'Notes__c',
                    type: 'string'
                },
                {
                    name: 'Secondary_Contact__c',
                    type: 'boolean'
                },
                {
                    name: 'AccountId',
                    type: 'string'
                },
                {
                    name: 'Lead__c',
                    type: 'string'
                },
                {
                    name: 'Title',
                    type: 'string'
                },
                {
                    name: 'CreatedDate',
                    type: 'string'
                }
            ]
        },
        {
            name: 'Request__c',
            soupName: 'Request__c',

            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'customer__c',
                    type: 'string'
                },
                {
                    name: 'customer_id__c',
                    type: 'string'
                },
                {
                    name: 'request_gpid__c',
                    type: 'string'
                },
                {
                    name: 'caller_name__c',
                    type: 'string'
                },
                {
                    name: 'move_purpose_cde__c',
                    type: 'string'
                },
                {
                    name: 'move_request_date__c',
                    type: 'string'
                },
                {
                    name: 'comments__c',
                    type: 'string'
                },
                {
                    name: 'wndw_beg_tme__c',
                    type: 'string'
                },
                {
                    name: 'wndw_end_tme__c',
                    type: 'string'
                },
                {
                    name: 'status__c',
                    type: 'string'
                },
                {
                    name: 'display_in_asset_tab__c',
                    type: 'string'
                },
                {
                    name: 'display_in_service_tab__c',
                    type: 'string'
                },
                {
                    name: 'equip_move_type_cde__c',
                    type: 'string'
                },
                {
                    name: 'equip_move_type_desc__c',
                    type: 'string'
                },
                {
                    name: 'CreatedDate',
                    type: 'string'
                },
                {
                    name: 'CreatedBy.Name',
                    type: 'string'
                },
                {
                    name: 'request_subtype__c',
                    type: 'string'
                },
                {
                    name: 'inven_id__c',
                    type: 'string'
                },
                {
                    name: 'Equip_type_cde__c',
                    type: 'string'
                },
                {
                    name: 'equip_type_desc__c',
                    type: 'string'
                },
                {
                    name: 'Equip_styp_cde__c',
                    type: 'string'
                },
                {
                    name: 'equip_styp_desc__c',
                    type: 'string'
                },
                {
                    name: 'std_setup_equip_id__c',
                    type: 'string'
                },
                {
                    name: 'std_attr_cde__c',
                    type: 'string'
                },
                {
                    name: 'request_id__c',
                    type: 'string'
                },
                {
                    name: 'parent_request_record__c',
                    type: 'string'
                },
                {
                    name: 'equip_site_desc__c',
                    type: 'string'
                },
                {
                    name: 'Send_to_CETS__c',
                    type: 'string'
                },
                {
                    name: 'equip_setup_desc__c',
                    type: 'string'
                },
                {
                    name: 'submitted_date__c',
                    type: 'string'
                },
                {
                    name: 'inven_label__c',
                    type: 'string'
                },
                {
                    name: 'Sls_plan_cde__c',
                    type: 'string'
                },
                {
                    name: 'Mnth_pymt_amt__c',
                    type: 'string'
                },
                {
                    name: 'Serv_ctrct_id__c',
                    type: 'string'
                },
                {
                    name: 'ident_item_id__c',
                    type: 'string'
                },
                {
                    name: 'order_line_num__c',
                    type: 'string'
                },
                {
                    name: 'equip_grphc_id__c',
                    type: 'string'
                },
                {
                    name: 'equip_config_type_cde__c',
                    type: 'string'
                },
                {
                    name: 'cets_ord_stat_cde__c',
                    type: 'string'
                },
                {
                    name: 'cets_ord_lne_num__c',
                    type: 'string'
                },
                {
                    name: 'tech_cmnt_txt__c',
                    type: 'string'
                },
                {
                    name: 'RecordTypeId',
                    type: 'string'
                },
                {
                    name: 'parent_request_record__r.status__c',
                    type: 'string'
                },
                {
                    name: 'requested_by__c',
                    string: 'string'
                },
                {
                    name: 'asset_id__c',
                    string: 'string'
                },
                {
                    name: 'caller_phone_num__c',
                    string: 'string'
                },
                {
                    name: 'email_addr_txt__c',
                    string: 'string'
                },
                {
                    name: 'trbl_type_cde__c',
                    string: 'string'
                },
                {
                    name: 'requester_phone_num__c',
                    string: 'string'
                },
                {
                    name: 'sched_beg_dte__c',
                    type: 'string'
                },
                {
                    name: 'order_closed_date__c',
                    type: 'string'
                },
                {
                    name: 'order_cancelled_date__c',
                    type: 'string'
                },
                {
                    name: 'requested_by__r.Name',
                    type: 'string'
                },
                {
                    name: 'canc_reas_cde_descri__c',
                    type: 'string'
                },
                {
                    name: 'ord_rcv_dte_tme__c',
                    type: 'string'
                },
                {
                    name: 'survey_response__c',
                    type: 'string'
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string'
                },
                {
                    name: 'requested_by__r.MobilePhone',
                    type: 'string'
                },
                {
                    name: 'slct_num__c',
                    type: 'string'
                },
                {
                    name: 'Lead__c',
                    type: 'string'
                },
                {
                    name: 'Lead_id__c',
                    type: 'string'
                },
                {
                    name: 'equip_mech_rte_amt__c',
                    type: 'string'
                },
                {
                    name: 'details_revision_num__c',
                    type: 'string'
                },
                {
                    name: 'FSV_Line_Item__c',
                    type: 'boolean'
                },
                {
                    name: 'Rate_Type__c',
                    type: 'string'
                },
                {
                    name: 'Contract_Type__c',
                    type: 'string'
                },
                {
                    name: 'Commission_Basis__c',
                    type: 'string'
                },
                {
                    name: 'Payment_Schedule__c',
                    type: 'string'
                },
                {
                    name: 'Deposit_Amount__c',
                    type: 'string'
                },
                {
                    name: 'Deduct_Deposit__c',
                    type: 'boolean'
                },
                {
                    name: 'Supplier__c',
                    type: 'string'
                },
                {
                    name: 'FSV_Notes__c',
                    type: 'string'
                },
                {
                    name: 'Supplier__r.supplier_name__c',
                    type: 'string'
                },
                {
                    name: 'Supplier__r.supplier_no__c',
                    type: 'string'
                },
                {
                    name: 'Commission_Basis_CDE__c',
                    type: 'string'
                },
                {
                    name: 'FSV_UNIT_T1__c',
                    type: 'string'
                },
                {
                    name: 'FSV_COMM_RATE_T1__c',
                    type: 'string'
                },
                {
                    name: 'FSV_UNIT_T2__c',
                    type: 'string'
                },
                {
                    name: 'FSV_COMM_RATE_T2__c',
                    type: 'string'
                },
                {
                    name: 'FSV_UNIT_T3__c',
                    type: 'string'
                },
                {
                    name: 'FSV_COMM_RATE_T3__c',
                    type: 'string'
                },
                {
                    name: 'FSV_UNIT_T4__c',
                    type: 'string'
                },
                {
                    name: 'FSV_COMM_RATE_T4__c',
                    type: 'string'
                },
                {
                    name: 'FSV_UNIT_T5__c',
                    type: 'string'
                },
                {
                    name: 'FSV_COMM_RATE_T5__c',
                    type: 'string'
                },
                {
                    name: 'fsv_contract__c',
                    type: 'boolean'
                },
                {
                    name: 'equip_site_id__c',
                    type: 'string'
                },
                {
                    name: 'prev_equip_site_id__c',
                    type: 'string'
                },
                {
                    name: 'survey_general_equip_details_response__c',
                    type: 'string'
                },
                {
                    name: 'serv_ord_type_cde__c',
                    type: 'string'
                },
                {
                    name: 'Created_By_Savvy__c',
                    type: 'boolean'
                },
                {
                    name: 'Order_Quantity__c',
                    type: 'number'
                },
                {
                    name: 'Spcl_Inst__c',
                    type: 'string'
                },
                {
                    name: 'Name',
                    type: 'string'
                },
                {
                    name: 'Send_Outbound__c',
                    type: 'boolean'
                },
                {
                    name: 'order_id__c',
                    type: 'string'
                },
                {
                    name: 'Zip__c',
                    type: 'string'
                },
                {
                    name: 'State__c',
                    type: 'string'
                },
                {
                    name: 'City__c',
                    type: 'string'
                },
                {
                    name: 'Address__c',
                    type: 'string'
                },
                {
                    name: 'Reason_Cde__c',
                    type: 'string'
                },
                {
                    name: 'Inquiry_Id__c',
                    type: 'string'
                },
                {
                    name: 'Siebel_Status__c',
                    type: 'string'
                },
                {
                    name: 'Tracking_Number__c',
                    type: 'string'
                },
                {
                    name: 'Email_Address__c',
                    type: 'string'
                }
            ]
        },
        {
            name: 'Lead__x',
            soupName: 'Lead__x',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Tier_c__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'Company__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Call_Counter_c__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'Owner_GPID_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'City__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Country__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'PostalCode__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'State__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Street__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LastModifiedDate__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Last_Task_Modified_Date_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Pre_qualified_c__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'Status__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LastName__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Lead_Type_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Phone__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Email__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_1_NM_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_2_NM_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_3_NM_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_4_NM_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_1_CDV_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_2_CDV_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_3_CDV_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'BUSN_SGMNTTN_LVL_4_CDV_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LeadSource__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Moved_to_Negotiate_Time_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Lead_Sub_Status_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Chain_c__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'Pre_Open_c__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'Business_Type_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Secondary_Cuisine_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'COF_Triggered_c__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'COF_Rejected_c__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'Lead_Unique_Id_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'OwnerId__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Chain_Store_Number_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Deferred_Resume_Date_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'DUP_COF_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Website__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'ff_YELP_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'YELP_HOT_AND_NEW_c__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'ff_FOURSQUARE_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'ff_FACEBOOK_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Rating_c__c',
                    type: 'floating',
                    skipSyncUp: true
                },
                {
                    name: 'FF_LINK_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'ff_UBEREATS_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'ff_POSTMATES_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'ff_GRUBHUB_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'ff_DOORDASH_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'User_Link_1_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'User_Link_Label_1_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'User_Link_2_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'User_Link_Label_2_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'User_Link_3_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'User_Link_Label_3_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Lodging_Catering_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'ff_MEAL_TAKEOUT_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Alcohol_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'gas_station_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'ff_MEAL_BREAKFAST_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'ff_MEAL_DINNER_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'ff_MEAL_LUNCH_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'VENUES_ON_SITE_c__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'Star_Level_c__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'Number_of_Rooms_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Years_In_Business_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'K_12_Enrollment_c__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'Active_Base_Population_c__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'Annual_Sales_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Number_Units_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'HQ_Address_Street_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'HQ_Address_City_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'HQ_Address_State_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'HQ_Address_Postal_Code_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'HQ_Address_Country_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'HQ_Phone_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Region_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Region_ID_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Market_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Market_ID_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Location_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Location_ID_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Route_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Ethnicity_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Service_Location_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Primary_Language_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Estimated_Fountain_c__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'Estimated_Coolers_c__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'Estimated_Other_Equip_c__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'Other_Equipment_Notes_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Estimated_FTN_Volume_c__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'Estimated_BC_Volume_c__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'Estimated_Vendor_Volume_c__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'Other_Volume_c__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'Current_Price_BC_c__c',
                    type: 'floating',
                    skipSyncUp: true
                },
                {
                    name: 'Current_Price_FTN_c__c',
                    type: 'floating',
                    skipSyncUp: true
                },
                {
                    name: 'Proposed_Price_BC_c__c',
                    type: 'floating',
                    skipSyncUp: true
                },
                {
                    name: 'Proposed_Price_FTN_c__c',
                    type: 'floating',
                    skipSyncUp: true
                },
                {
                    name: 'Rebates_BC_c__c',
                    type: 'floating',
                    skipSyncUp: true
                },
                {
                    name: 'Rebates_FTN_c__c',
                    type: 'floating',
                    skipSyncUp: true
                },
                {
                    name: 'POS_Needs_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Program_Offered_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Current_Distributor_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Sales_Method_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Delivery_Method_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Product_Group_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Delivery_Frequency_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Delivery_Days_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Monday_Delivery_Start_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Monday_Delivery_End_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Tuesday_Delivery_Start_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Tuesday_Delivery_End_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Wednesday_Delivery_Start_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Wednesday_Delivery_End_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Thursday_Delivery_Start_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Thursday_Delivery_End_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Friday_Delivery_Start_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Friday_Delivery_End_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Saturday_Delivery_Start_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Saturday_Delivery_End_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Sunday_Delivery_Start_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Sunday_Delivery_End_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Monday_Start_Hours_of_Operation_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Monday_End_Hours_of_Operation_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Tuesday_Start_Hours_of_Operation_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Tuesday_End_Hours_of_Operation_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Wednesday_Start_Hours_of_Operation_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Wednesday_End_Hours_of_Operation_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Thursday_Start_Hours_of_Operation_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Thursday_End_Hours_of_Operation_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Friday_Start_Hours_of_Operation_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Friday_End_Hours_of_Operation_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Saturday_Start_Hours_of_Operation_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Saturday_End_Hours_of_Operation_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Sunday_Start_Hours_of_Operation_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Sunday_End_Hours_of_Operation_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'CMB_Notes_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Payment_Method_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Temp_Charge_c__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'Billing_Address_Same_as_Shipping_c__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'Billing_Address_Street_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Billing_Address_City_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Billing_Address_State_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Billing_Address_Zip_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Billing_Address_Country_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Days_Open_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Seasonal_Close_Start_Date_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Seasonal_Close_End_Date_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Proposed_Key_Account_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Proposed_Key_Account_Division_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Additional_Prospect_Comments_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Pre_Call_Comments_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Customer_Type_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Owner_Name_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'ExternalId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'CreatedBy_GPID_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'LastModifiedBy_GPID_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Device_Source_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Source_ID_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Contact_Made_Counter_c__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'Send_for_COF_c__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'Rep_Last_Modified_Date_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'CreatedDate__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'PD_Call_Counter_c__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'PD_Contact_Made_Counter_c__c',
                    type: 'integer',
                    skipSyncUp: true
                },
                {
                    name: 'Action_Required_c__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'My_Lead_Action_Required_c__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'PD_Assigned_c__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'LEAD_ID_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Lead_Longitude_c__c',
                    type: 'floating',
                    skipSyncUp: true
                },
                {
                    name: 'Lead_Latitude_c__c',
                    type: 'floating',
                    skipSyncUp: true
                },
                {
                    name: 'Customer_Number_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Suggested_FSR_Nat_Route_Number_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Suggested_FSR_Loc_Route_Number_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Assigned_Date_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Business_Won_Date_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Customer_Submitted_Date_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Move_To_No_Sale_Date_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'No_Go_Checkbox_c__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'No_Go_Date_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'No_Go_Reason_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Pre_Qualified_Contact_c__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Is_Removed_c__c',
                    type: 'boolean',
                    skipSyncUp: true
                },
                {
                    name: 'Rejection_Reason_Text_c__c',
                    type: 'string',
                    skipSyncUp: true
                }
            ]
        },
        {
            name: 'Order',
            soupName: 'Order',
            initQuery: `SELECT Id, Ordr_Id__c, OrderNumber, Dlvry_Rqstd_Dtm__c, Off_Schedule__c, 
            RetailStore__c, Pallet_Total_IntCount__c, Visit__c, Total_Ordered_IntCount__c, Total_Certified_IntCount__c, 
            RTE_ID__c, RTE_ID__r.LOCL_RTE_ID__c, Delivery_Method_Code__c, AccountId, Total_Return_Cs_IntCount__c,
            Total_Return_Un_IntCount__c, Order_ATC_Type__c FROM Order 
            WHERE Account.LOC_PROD_ID__c = APPLY_USER_LOCATION 
            AND Dlvry_Rqstd_Dtm__c >= LAST_N_DAYS:14:TIME 
            AND Dlvry_Rqstd_Dtm__c <= NEXT_N_DAYS:35:TIME 
            AND Order_ATC_Type__c = 'Normal'`,
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'Ordr_Id__c',
                    type: 'string'
                },
                {
                    name: 'Dlvry_Rqstd_Dtm__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Off_Schedule__c',
                    type: 'boolean'
                },
                {
                    name: 'RetailStore__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Pallet_Total_IntCount__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Visit__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Total_Ordered_IntCount__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'Total_Certified_IntCount__c',
                    type: 'string',
                    syncUpCreate: true
                },
                {
                    name: 'OrderNumber',
                    type: 'string'
                },
                {
                    name: 'RTE_ID__c',
                    type: 'string'
                },
                {
                    name: 'RTE_ID__r.LOCL_RTE_ID__c',
                    type: 'number',
                    skipSyncUp: true
                },
                {
                    name: 'Delivery_Method_Code__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'AccountId',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Total_Return_Cs_IntCount__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Total_Return_Un_IntCount__c',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Order_ATC_Type__c',
                    type: 'string'
                }
            ]
        },
        {
            name: 'OrderItem',
            soupName: 'OrderItem',
            fieldList: [
                {
                    name: 'Id',
                    type: 'string'
                },
                {
                    name: 'OrderId',
                    type: 'string'
                },
                {
                    name: 'Order_Item__c',
                    type: 'string'
                },
                {
                    name: 'Order.Ordr_Id__c',
                    type: 'string'
                },
                {
                    name: 'Quantity',
                    type: 'string'
                },
                {
                    name: 'Certified_Quantity__c',
                    type: 'string'
                },
                {
                    name: 'Order.RetailStore__c',
                    type: 'string'
                },
                {
                    name: 'Product2Id',
                    type: 'string'
                },
                {
                    name: 'Pallet_Number__c',
                    type: 'string'
                },
                {
                    name: 'Product2.Package_Type_Name__c',
                    type: 'string'
                },
                {
                    name: 'Product2.Name',
                    type: 'string'
                },
                {
                    name: 'LastModifiedDate',
                    type: 'string',
                    skipSyncUp: true
                },
                {
                    name: 'Item_Type__c',
                    type: 'string'
                },
                {
                    name: 'Order.EffectiveDate',
                    type: 'string'
                },
                {
                    name: 'Product2.ProductCode',
                    type: 'string'
                },
                {
                    name: 'Product2.Innov_Flag__c',
                    type: 'string'
                },
                {
                    name: 'Product2.Sub_Brand__c',
                    type: 'string'
                }
            ]
        },
        StoreProduct,
        Executional_Framework__c,
        StorePriority__c,
        CustomerDeal
    ]
}

export default UGMConfig

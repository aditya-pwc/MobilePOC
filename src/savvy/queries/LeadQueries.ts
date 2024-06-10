export const teamQuery = `AND {Lead__x:Owner_GPID_c__c} IN (SELECT {User:GPID__c} FROM {User}
    LEFT JOIN (SELECT * FROM {User_Stats__c} WHERE {User_Stats__c:RecordTypeId} = '%s'
    AND {User_Stats__c:manager__c} = '%s') ON {User_Stats__c:User__c} = {User:Id}) `
export const teamLeadsQ =
    "FROM {Lead__x} WHERE {Lead__x:Status__c}='Negotiate' AND {Lead__x:Lead_Type_c__c} != 'Change of Ownership' " +
    teamQuery
const baseMyLeadsQ =
    'SELECT {Lead__x:Id},{Lead__x:Lead_Type_c__c},{Lead__x:PD_Call_Counter_c__c}, {Lead__x:PD_Contact_Made_Counter_c__c},' +
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
    '{Lead__x:__locally_deleted__} '
const baseOrderMyLeads =
    'ORDER BY {Lead__x:COF_Triggered_c__c} NULLS FIRST, Active DESC NULLS LAST,' +
    '{Lead__x:Last_Task_Modified_Date_c__c} NULLS LAST,{Lead__x:Company__c} COLLATE NOCASE'
const LeadQueries = {
    getAllLeadsQuery: {
        q:
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
            'ORDER BY Active DESC NULLS LAST,' +
            '{Lead__x:Pre_qualified_c__c} DESC NULLS LAST, {Lead__x:Tier_c__c} ASC NULLS LAST,' +
            '{Lead__x:Company__c} COLLATE NOCASE',
        f: [
            'Id',
            'ExternalId',
            'PD_Contact_Made_Counter_c__c',
            'PD_Call_Counter_c__c',
            'COF_Rejected_c__c',
            'Contact_Made_Counter_c__c',
            'Active',
            'Deferred_Resume_Date_c__c',
            'Status__c',
            'Phone__c',
            'Company__c',
            'Tier_c__c',
            'Call_Counter_c__c',
            'Owner_GPID_c__c',
            'City__c',
            'Country__c',
            'Street__c',
            'State__c',
            'Last_Task_Modified_Date_c__c',
            'PostalCode__c',
            'Pre_qualified_c__c',
            '_soupEntryId',
            '__local__',
            '__locally_created__',
            '__locally_updated__',
            '__locally_deleted__'
        ]
    },
    getMyLeadsQuery: {
        q:
            baseMyLeadsQ +
            "FROM {Lead__x} WHERE {Lead__x:Owner_GPID_c__c}='%s'  AND {Lead__x:Lead_Type_c__c}!='Change of Ownership' AND {Lead__x:Status__c}='Negotiate'  " +
            baseOrderMyLeads,
        qTeam: baseMyLeadsQ + teamLeadsQ + baseOrderMyLeads,
        f: [
            'Id',
            'Lead_Type_c__c',
            'PD_Call_Counter_c__c',
            'PD_Contact_Made_Counter_c__c',
            'COF_Rejected_c__c',
            'Contact_Made_Counter_c__c',
            'Active',
            'Status__c',
            'COF_Triggered_c__c',
            'Deferred_Resume_Date_c__c',
            'Phone__c',
            'Company__c',
            'Tier_c__c',
            'Call_Counter_c__c',
            'Owner_GPID_c__c',
            'City__c',
            'Country__c',
            'Street__c',
            'State__c',
            'Last_Task_Modified_Date_c__c',
            'PostalCode__c',
            'Pre_qualified_c__c',
            'Lead_Longitude_c__c',
            'Lead_Latitude_c__c'
        ]
    },
    syncUpLeadDetailFormQuery: {
        q:
            'SELECT {Lead__x:Id},{Lead__x:Rep_Last_Modified_Date_c__c}, {Lead__x:LastModifiedBy_GPID_c__c},' +
            '{Lead__x:Lead_Type_c__c},{Lead__x:original_customer_c__c},{Lead__x:original_customer_number_c__c},{Lead__x:Chain_c__c},{Lead__x:Tier_c__c},{Lead__x:Company__c},' +
            '{Lead__x:Call_Counter_c__c},{Lead__x:Owner_GPID_c__c},{Lead__x:City__c},{Lead__x:Country__c},' +
            '{Lead__x:PostalCode__c},{Lead__x:State__c},{Lead__x:Street__c},{Lead__x:Last_Task_Modified_Date_c__c},' +
            '{Lead__x:Pre_qualified_c__c},{Lead__x:Status__c},{Lead__x:LastName__c},{Lead__x:Phone__c},' +
            '{Lead__x:Email__c},{Lead__x:BUSN_SGMNTTN_LVL_1_NM_c__c},{Lead__x:BUSN_SGMNTTN_LVL_2_NM_c__c},' +
            '{Lead__x:BUSN_SGMNTTN_LVL_3_NM_c__c},{Lead__x:BUSN_SGMNTTN_LVL_4_NM_c__c},' +
            '{Lead__x:BUSN_SGMNTTN_LVL_1_CDV_c__c},{Lead__x:BUSN_SGMNTTN_LVL_2_CDV_c__c},' +
            '{Lead__x:BUSN_SGMNTTN_LVL_3_CDV_c__c},{Lead__x:BUSN_SGMNTTN_LVL_4_CDV_c__c},' +
            '{Lead__x:Moved_to_Negotiate_Time_c__c},{Lead__x:Lead_Sub_Status_c__c},{Lead__x:Lead_Unique_Id_c__c},' +
            '{Lead__x:Chain_Store_Number_c__c},{Lead__x:Deferred_Resume_Date_c__c},{Lead__x:Website__c},' +
            '{Lead__x:ff_YELP_c__c},{Lead__x:ff_FOURSQUARE_c__c},{Lead__x:ff_FACEBOOK_c__c},' +
            '{Lead__x:Lodging_Catering_c__c},{Lead__x:ff_MEAL_TAKEOUT_c__c},{Lead__x:Alcohol_c__c},' +
            '{Lead__x:gas_station_c__c},{Lead__x:ff_MEAL_BREAKFAST_c__c},{Lead__x:ff_MEAL_DINNER_c__c},' +
            '{Lead__x:ff_MEAL_LUNCH_c__c},{Lead__x:VENUES_ON_SITE_c__c},{Lead__x:Number_of_Rooms_c__c},' +
            '{Lead__x:Number_Units_c__c},{Lead__x:Region_c__c},{Lead__x:Region_ID_c__c},' +
            '{Lead__x:Market_c__c},{Lead__x:Market_ID_c__c},{Lead__x:Location_c__c},{Lead__x:Location_ID_c__c},' +
            '{Lead__x:Route_c__c},{Lead__x:Ethnicity_c__c},{Lead__x:Service_Location_c__c},' +
            '{Lead__x:Primary_Language_c__c},{Lead__x:Estimated_Fountain_c__c},{Lead__x:Estimated_Coolers_c__c},' +
            '{Lead__x:Estimated_Other_Equip_c__c},{Lead__x:Other_Equipment_Notes_c__c},' +
            '{Lead__x:Estimated_FTN_Volume_c__c},{Lead__x:Estimated_BC_Volume_c__c},' +
            '{Lead__x:Estimated_Vendor_Volume_c__c},{Lead__x:Other_Volume_c__c},{Lead__x:Current_Price_BC_c__c},' +
            '{Lead__x:Current_Price_FTN_c__c},{Lead__x:Proposed_Price_BC_c__c},{Lead__x:Proposed_Price_FTN_c__c},' +
            '{Lead__x:Rebates_BC_c__c},{Lead__x:Rebates_FTN_c__c},{Lead__x:POS_Needs_c__c},' +
            '{Lead__x:Program_Offered_c__c},{Lead__x:Current_Distributor_c__c},{Lead__x:Sales_Method_c__c},' +
            '{Lead__x:Delivery_Method_c__c},{Lead__x:Product_Group_c__c},{Lead__x:Delivery_Frequency_c__c},' +
            '{Lead__x:Delivery_Days_c__c},{Lead__x:Monday_Delivery_Start_c__c},{Lead__x:Monday_Delivery_End_c__c},' +
            '{Lead__x:Tuesday_Delivery_Start_c__c},{Lead__x:Tuesday_Delivery_End_c__c},' +
            '{Lead__x:Wednesday_Delivery_Start_c__c},{Lead__x:Wednesday_Delivery_End_c__c},' +
            '{Lead__x:Thursday_Delivery_Start_c__c},{Lead__x:Thursday_Delivery_End_c__c},' +
            '{Lead__x:Friday_Delivery_Start_c__c},{Lead__x:Friday_Delivery_End_c__c},' +
            '{Lead__x:Saturday_Delivery_Start_c__c},{Lead__x:Saturday_Delivery_End_c__c},' +
            '{Lead__x:Sunday_Delivery_Start_c__c},{Lead__x:Sunday_Delivery_End_c__c},' +
            '{Lead__x:Monday_Start_Hours_of_Operation_c__c},{Lead__x:Monday_End_Hours_of_Operation_c__c},' +
            '{Lead__x:Tuesday_Start_Hours_of_Operation_c__c},{Lead__x:Tuesday_End_Hours_of_Operation_c__c},' +
            '{Lead__x:Wednesday_Start_Hours_of_Operation_c__c},{Lead__x:Wednesday_End_Hours_of_Operation_c__c},' +
            '{Lead__x:Thursday_Start_Hours_of_Operation_c__c},{Lead__x:Thursday_End_Hours_of_Operation_c__c},' +
            '{Lead__x:Friday_Start_Hours_of_Operation_c__c},{Lead__x:Friday_End_Hours_of_Operation_c__c},' +
            '{Lead__x:Saturday_Start_Hours_of_Operation_c__c},{Lead__x:Saturday_End_Hours_of_Operation_c__c},' +
            '{Lead__x:Sunday_Start_Hours_of_Operation_c__c},{Lead__x:Sunday_End_Hours_of_Operation_c__c},' +
            '{Lead__x:CMB_Notes_c__c},{Lead__x:Payment_Method_c__c},{Lead__x:Temp_Charge_c__c},' +
            '{Lead__x:Billing_Address_Same_as_Shipping_c__c},{Lead__x:Billing_Address_Street_c__c},' +
            '{Lead__x:Billing_Address_City_c__c},{Lead__x:Billing_Address_State_c__c},' +
            '{Lead__x:Billing_Address_Zip_c__c},{Lead__x:Billing_Address_Country_c__c},{Lead__x:Days_Open_c__c},' +
            '{Lead__x:Seasonal_Close_Start_Date_c__c},{Lead__x:Seasonal_Close_End_Date_c__c},' +
            '{Lead__x:Proposed_Key_Account_c__c},{Lead__x:Proposed_Key_Account_Division_c__c},' +
            '{Lead__x:Additional_Prospect_Comments_c__c},{Lead__x:Customer_Type_c__c},{Lead__x:_soupEntryId},' +
            '{Lead__x:__local__},{Lead__x:__locally_created__},{Lead__x:__locally_updated__},' +
            "{Lead__x:__locally_deleted__} FROM {Lead__x} WHERE {Lead__x:__locally_updated__}='1'",
        f: [
            'Id',
            'Rep_Last_Modified_Date_c__c',
            'LastModifiedBy_GPID_c__c',
            'Lead_Type_c__c',
            'original_customer_c__c',
            'original_customer_number_c__c',
            'Chain_c__c',
            'Tier_c__c',
            'Company__c',
            'Call_Counter_c__c',
            'Owner_GPID_c__c',
            'City__c',
            'Country__c',
            'PostalCode__c',
            'State__c',
            'Street__c',
            'Last_Task_Modified_Date_c__c',
            'Pre_qualified_c__c',
            'Status__c',
            'LastName__c',
            'Phone__c',
            'Email__c',
            'BUSN_SGMNTTN_LVL_1_NM_c__c',
            'BUSN_SGMNTTN_LVL_2_NM_c__c',
            'BUSN_SGMNTTN_LVL_3_NM_c__c',
            'BUSN_SGMNTTN_LVL_4_NM_c__c',
            'BUSN_SGMNTTN_LVL_1_CDV_c__c',
            'BUSN_SGMNTTN_LVL_2_CDV_c__c',
            'BUSN_SGMNTTN_LVL_3_CDV_c__c',
            'BUSN_SGMNTTN_LVL_4_CDV_c__c',
            'Moved_to_Negotiate_Time_c__c',
            'Lead_Sub_Status_c__c',
            'Lead_Unique_Id_c__c',
            'Chain_Store_Number_c__c',
            'Deferred_Resume_Date_c__c',
            'Website__c',
            'ff_YELP_c__c',
            'ff_FOURSQUARE_c__c',
            'ff_FACEBOOK_c__c',
            'Lodging_Catering_c__c',
            'ff_MEAL_TAKEOUT_c__c',
            'Alcohol_c__c',
            'gas_station_c__c',
            'ff_MEAL_BREAKFAST_c__c',
            'ff_MEAL_DINNER_c__c',
            'ff_MEAL_LUNCH_c__c',
            'VENUES_ON_SITE_c__c',
            'ff_UBEREATS_c__c',
            'ff_POSTMATES_c__c',
            'ff_GRUBHUB_c__c',
            'ff_DOORDASH_c__c',
            'User_Link_1_c__c',
            'User_Link_Label_1_c__c',
            'User_Link_2_c__c',
            'User_Link_Label_2_c__c',
            'User_Link_3_c__c',
            'User_Link_Label_3_c__c',
            'Number_of_Rooms_c__c',
            'Number_Units_c__c',
            'Region_c__c',
            'Region_ID_c__c',
            'Market_c__c',
            'Market_ID_c__c',
            'Location_c__c',
            'Location_ID_c__c',
            'Route_c__c',
            'Ethnicity_c__c',
            'Service_Location_c__c',
            'Primary_Language_c__c',
            'Estimated_Fountain_c__c',
            'Estimated_Coolers_c__c',
            'Estimated_Other_Equip_c__c',
            'Other_Equipment_Notes_c__c',
            'Estimated_FTN_Volume_c__c',
            'Estimated_BC_Volume_c__c',
            'Estimated_Vendor_Volume_c__c',
            'Other_Volume_c__c',
            'Current_Price_BC_c__c',
            'Current_Price_FTN_c__c',
            'Proposed_Price_BC_c__c',
            'Proposed_Price_FTN_c__c',
            'Rebates_BC_c__c',
            'Rebates_FTN_c__c',
            'POS_Needs_c__c',
            'Program_Offered_c__c',
            'Current_Distributor_c__c',
            'Sales_Method_c__c',
            'Delivery_Method_c__c',
            'Product_Group_c__c',
            'Delivery_Frequency_c__c',
            'Delivery_Days_c__c',
            'Monday_Delivery_Start_c__c',
            'Monday_Delivery_End_c__c',
            'Tuesday_Delivery_Start_c__c',
            'Tuesday_Delivery_End_c__c',
            'Wednesday_Delivery_Start_c__c',
            'Wednesday_Delivery_End_c__c',
            'Thursday_Delivery_Start_c__c',
            'Thursday_Delivery_End_c__c',
            'Friday_Delivery_Start_c__c',
            'Friday_Delivery_End_c__c',
            'Saturday_Delivery_Start_c__c',
            'Saturday_Delivery_End_c__c',
            'Sunday_Delivery_Start_c__c',
            'Sunday_Delivery_End_c__c',
            'Monday_Start_Hours_of_Operation_c__c',
            'Monday_End_Hours_of_Operation_c__c',
            'Tuesday_Start_Hours_of_Operation_c__c',
            'Tuesday_End_Hours_of_Operation_c__c',
            'Wednesday_Start_Hours_of_Operation_c__c',
            'Wednesday_End_Hours_of_Operation_c__c',
            'Thursday_Start_Hours_of_Operation_c__c',
            'Thursday_End_Hours_of_Operation_c__c',
            'Friday_Start_Hours_of_Operation_c__c',
            'Friday_End_Hours_of_Operation_c__c',
            'Saturday_Start_Hours_of_Operation_c__c',
            'Saturday_End_Hours_of_Operation_c__c',
            'Sunday_Start_Hours_of_Operation_c__c',
            'Sunday_End_Hours_of_Operation_c__c',
            'CMB_Notes_c__c',
            'Payment_Method_c__c',
            'Temp_Charge_c__c',
            'Billing_Address_Same_as_Shipping_c__c',
            'Billing_Address_Street_c__c',
            'Billing_Address_City_c__c',
            'Billing_Address_State_c__c',
            'Billing_Address_Zip_c__c',
            'Billing_Address_Country_c__c',
            'Days_Open_c__c',
            'Seasonal_Close_Start_Date_c__c',
            'Seasonal_Close_End_Date_c__c',
            'Proposed_Key_Account_c__c',
            'Proposed_Key_Account_Division_c__c',
            'Additional_Prospect_Comments_c__c',
            'Customer_Type_c__c',
            'Assigned_Date_c__c'
        ]
    },
    getLeadsForMapQuery: {
        q:
            'SELECT {Lead__x:Id},{Lead__x:Lead_Latitude_c__c},{Lead__x:Lead_Longitude_c__c},{Lead__x:ExternalId},{Lead__x:PD_Contact_Made_Counter_c__c},{Lead__x:PD_Call_Counter_c__c},' +
            '{Lead__x:COF_Rejected_c__c},{Lead__x:Contact_Made_Counter_c__c},{Lead__x:Deferred_Resume_Date_c__c},' +
            '{Lead__x:Status__c},{Lead__x:Phone__c}, {Lead__x:Company__c}, {Lead__x:Tier_c__c}, ' +
            '{Lead__x:Call_Counter_c__c}, {Lead__x:Owner_GPID_c__c}, {Lead__x:City__c}, {Lead__x:Country__c}, ' +
            '{Lead__x:Street__c}, {Lead__x:State__c},' +
            '{Lead__x:Last_Task_Modified_Date_c__c}, {Lead__x:PostalCode__c}, {Lead__x:Pre_qualified_c__c}, ' +
            '{Lead__x:_soupEntryId},{Lead__x:__local__},{Lead__x:__locally_created__},{Lead__x:__locally_updated__},' +
            '{Lead__x:__locally_deleted__} ' +
            'FROM {Lead__x} WHERE {Lead__x:Lead_Latitude_c__c} IS NOT NULL AND {Lead__x:Lead_Longitude_c__c} IS NOT NULL ' +
            'AND ({Lead__x:Is_Removed_c__c} IS NOT TRUE OR {Lead__x:Pre_qualified_c__c} IS TRUE) ' +
            "AND ({Lead__x:Status__c}='Open' OR {Lead__x:Status__c}='Negotiate') ",
        s: 'ORDER BY {Lead__x:Pre_qualified_c__c} DESC NULLS LAST, {Lead__x:Tier_c__c} ASC NULLS LAST, {Lead__x:Company__c} COLLATE NOCASE',
        f: [
            'Id',
            'Lead_Latitude_c__c',
            'Lead_Longitude_c__c',
            'ExternalId',
            'PD_Contact_Made_Counter_c__c',
            'PD_Call_Counter_c__c',
            'COF_Rejected_c__c',
            'Contact_Made_Counter_c__c',
            'Deferred_Resume_Date_c__c',
            'Status__c',
            'Phone__c',
            'Company__c',
            'Tier_c__c',
            'Call_Counter_c__c',
            'Owner_GPID_c__c',
            'City__c',
            'Country__c',
            'Street__c',
            'State__c',
            'Last_Task_Modified_Date_c__c',
            'PostalCode__c',
            'Pre_qualified_c__c',
            '_soupEntryId',
            '__local__',
            '__locally_created__',
            '__locally_updated__',
            '__locally_deleted__'
        ]
    }
}

export default LeadQueries

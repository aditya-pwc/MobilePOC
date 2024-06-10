const CustomerEquipmentQueries = {
    getEquipmentAssetByCustomerId: {
        f: [
            'Id',
            'Name',
            'AccountId',
            'ident_asset_num__c',
            'serv_cntrt_nm__c',
            'equip_site_desc__c',
            'equip_inst_dte__c',
            'equip_last_svc_dte__c',
            'SerialNumber',
            'net_book_val_amt__c',
            'equip_type_cde__c',
            'equip_styp_cde__c',
            'equip_grphc_id__c',
            'equip_config_type_cde__c',
            'ident_item_id__c',
            'serv_ctrct_id__c',
            'equip_ownr_cde__c',
            'sls_plan_cde__c',
            'mnth_pymt_amt__c',
            'equip_type_desc__c',
            'equip_styp_desc__c',
            'Sls_plan_desc__c',
            'serv_ctrct_nme__c',
            'RequestId',
            'serv_ord_type_cde__c',
            'equip_move_type_cde__c',
            'status__c',
            'CreatedDate',
            'CreatedBy.Name',
            'submitted_date__c',
            'requested_by__r.Name',
            'sched_beg_dte__c',
            'ord_rcv_dte_tme__c',
            'request_subtype__c',
            'LastModifiedDate',
            'cets_ord_stat_cde__c'
        ],
        q:
            'SELECT ASE.{Asset:Id},ASE.{Asset:Name}, ' +
            'ASE.{Asset:AccountId}, ' +
            'ASE.{Asset:ident_asset_num__c}, ASE.{Asset:serv_cntrt_nm__c}, ASE.{Asset:equip_site_desc__c},' +
            'ASE.{Asset:equip_inst_dte__c}, ASE.{Asset:equip_last_svc_dte__c}, ' +
            'ASE.{Asset:SerialNumber}, ASE.{Asset:net_book_val_amt__c}, ' +
            'ASE.{Asset:equip_type_cde__c}, ASE.{Asset:equip_styp_cde__c}, ASE.{Asset:equip_grphc_id__c}, ' +
            'ASE.{Asset:equip_config_type_cde__c}, ASE.{Asset:ident_item_id__c}, ASE.{Asset:serv_ctrct_id__c},' +
            'ASE.{Asset:equip_ownr_cde__c},ASE.{Asset:sls_plan_cde__c},ASE.{Asset:mnth_pymt_amt__c},' +
            'ATT.{Asset_Attribute__c:equip_type_desc__c}, ATST.{Asset_Attribute__c:equip_styp_desc__c}, ASST.{Asset_Attribute__c:Sls_plan_desc__c}, ' +
            'AT.{Asset_Attribute__c:serv_ctrct_nme__c},{Request__c:Id},' +
            '{Request__c:serv_ord_type_cde__c},{Request__c:equip_move_type_cde__c},{Request__c:status__c},{Request__c:CreatedDate},{Request__c:CreatedBy.Name},' +
            '{Request__c:submitted_date__c},{Request__c:requested_by__r.Name},{Request__c:sched_beg_dte__c},' +
            '{Request__c:ord_rcv_dte_tme__c},{Request__c:request_subtype__c},{Request__c:LastModifiedDate},{Request__c:cets_ord_stat_cde__c},' +
            'ASE.{Asset:_soupEntryId},ASE.{Asset:__local__},ASE.{Asset:__locally_created__},' +
            'ASE.{Asset:__locally_updated__}, ASE.{Asset:__locally_deleted__} ' +
            'FROM {Asset} ASE ' +
            'LEFT JOIN (SELECT * FROM {Asset_Attribute__c} WHERE ' +
            "{Asset_Attribute__c:master_data_type__c} = 'ServiceContract' " +
            "AND {Asset_Attribute__c:active_flag__c} = '1') AT ON ASE.{Asset:serv_ctrct_id__c}=AT.{Asset_Attribute__c:serv_ctrct_id__c} " +
            'LEFT JOIN (SELECT * FROM {Asset_Attribute__c} WHERE {Asset_Attribute__c:master_data_type__c} = ' +
            "'EquipmentType' AND {Asset_Attribute__c:active_flag__c} = '1') ATT ON " +
            'ASE.{Asset:equip_type_cde__c}=ATT.{Asset_Attribute__c:equip_type_cde__c} ' +
            'LEFT JOIN (SELECT * FROM {Asset_Attribute__c} WHERE ' +
            "{Asset_Attribute__c:master_data_type__c} = 'EquipmentSubType' " +
            "AND {Asset_Attribute__c:active_flag__c} = '1') ATST ON " +
            'ASE.{Asset:equip_styp_cde__c}=ATST.{Asset_Attribute__c:equip_styp_cde__c} ' +
            "LEFT JOIN (SELECT * FROM {Request__c} WHERE {Request__c:status__c} != 'CLOSED' AND {Request__c:status__c} != 'CANCELLED' " +
            'GROUP BY {Request__c:ident_item_id__c} HAVING MAX({Request__c:LastModifiedDate})) ON ASE.{Asset:ident_item_id__c}={Request__c:ident_item_id__c} ' +
            'LEFT JOIN (SELECT * FROM {Asset_Attribute__c} WHERE ' +
            "{Asset_Attribute__c:master_data_type__c} = 'SalesPlan' " +
            "AND {Asset_Attribute__c:active_flag__c} = '1') ASST ON " +
            'ASE.{Asset:sls_plan_cde__c}=ASST.{Asset_Attribute__c:sls_plan_cde__c} ' +
            "WHERE {Asset:AccountId} = '%s' AND ({Asset:agree_end_dte__c}>'%s' OR {Asset:agree_end_dte__c} IS NULL) %s " +
            'GROUP BY {Asset:Id} ORDER BY {Asset:Name} ASC'
    },
    getEquipmentServiceByAccountId: {
        f: [
            'customer__c',
            'serv_ord_type_cde__c',
            'Lead__c',
            'Id',
            'customer_id__c',
            'Lead_id__c',
            'equip_move_type_cde__c',
            'equip_move_type_desc__c',
            'CreatedDate',
            'request_gpid__c',
            'caller_name__c',
            'move_purpose_cde__c',
            'move_request_date__c',
            'comments__c',
            'wndw_beg_tme__c',
            'wndw_end_tme__c',
            'display_in_asset_tab__c',
            'display_in_service_tab__c',
            'status__c',
            'submitted_date__c',
            'requested_by__c',
            'LastModifiedDate',
            'requested_by__r.Name',
            'CreatedBy.Name',
            'request_subtype__c',
            'ord_rcv_dte_tme__c',
            'sched_beg_dte__c',
            'equip_site_id__c',
            'prev_equip_site_id__c',
            'order_cancelled_date__c',
            'LastModifiedDate',
            'CompletedCount',
            'TotalCount'
        ],
        q:
            'SELECT {Request__c:customer__c}, ' +
            '{Request__c:serv_ord_type_cde__c}, ' +
            '{Request__c:Lead__c}, ' +
            '{Request__c:Id}, ' +
            '{Request__c:customer_id__c}, ' +
            '{Request__c:Lead_id__c}, ' +
            '{Request__c:equip_move_type_cde__c}, ' +
            '{Request__c:equip_move_type_desc__c}, ' +
            '{Request__c:CreatedDate}, ' +
            '{Request__c:request_gpid__c}, ' +
            '{Request__c:caller_name__c}, ' +
            '{Request__c:move_purpose_cde__c}, ' +
            '{Request__c:move_request_date__c}, ' +
            '{Request__c:comments__c}, ' +
            '{Request__c:wndw_beg_tme__c}, ' +
            '{Request__c:wndw_end_tme__c}, ' +
            '{Request__c:display_in_asset_tab__c}, ' +
            '{Request__c:display_in_service_tab__c}, ' +
            '{Request__c:status__c}, ' +
            '{Request__c:submitted_date__c}, ' +
            '{Request__c:requested_by__c}, ' +
            '{Request__c:LastModifiedDate}, ' +
            '{Request__c:requested_by__r.Name}, ' +
            '{Request__c:CreatedBy.Name}, ' +
            '{Request__c:request_subtype__c}, ' +
            '{Request__c:ord_rcv_dte_tme__c}, ' +
            '{Request__c:sched_beg_dte__c}, ' +
            '{Request__c:equip_site_id__c}, ' +
            '{Request__c:prev_equip_site_id__c}, ' +
            '{Request__c:order_cancelled_date__c}, ' +
            '{Request__c:LastModifiedDate}, ' +
            '(SELECT COUNT(*) FROM {Request__c} WHERE {Request__c:parent_request_record__c} = ORG.{Request__c:Id} ' +
            "AND {Request__c:status__c} = 'CLOSED' AND {Request__c:request_subtype__c} = 'Move Request Line Item') " +
            'AS CompleteCount, ' +
            '(SELECT COUNT(*) FROM {Request__c} WHERE {Request__c:parent_request_record__c} = ORG.{Request__c:Id} ' +
            "AND {Request__c:request_subtype__c} = 'Move Request Line Item' )" +
            'AS TotalCount ' +
            'From {Request__c} ORG ' +
            'WHERE %s ' +
            "and {Request__c:display_in_service_tab__c}='1' " +
            "AND ({Request__c:request_subtype__c} = 'Move Request' OR {Request__c:request_subtype__c} = 'Service Request') " +
            'ORDER BY {Request__c:CreatedDate} DESC'
    },
    getEquipmentRequestByRequestId: {
        f: [
            'customer__c',
            'Lead__c',
            'Id',
            'customer_id__c',
            'Lead_id__c',
            'equip_move_type_cde__c',
            'equip_move_type_desc__c',
            'CreatedDate',
            'request_gpid__c',
            'caller_name__c',
            'move_purpose_cde__c',
            'move_request_date__c',
            'comments__c',
            'wndw_beg_tme__c',
            'wndw_end_tme__c',
            'display_in_asset_tab__c',
            'display_in_service_tab__c',
            'status__c',
            'CreatedBy.Name',
            'requested_by__c',
            'RecordTypeId',
            'request_subtype__c',
            'trbl_type_cde__c',
            'canc_reas_cde_descri__c',
            'survey_response__c',
            'requested_by__r.Name',
            'requested_by__r.MobilePhone',
            'caller_phone_num__c',
            'email_addr_txt__c',
            'details_revision_num__c',
            'sched_beg_dte__c',
            'survey_general_equip_details_response__c',
            'cets_ord_stat_cde__c',
            'order_id__c',
            'cets_ord_lne_num__c',
            'tech_cmnt_txt__c'
        ],
        q:
            'SELECT {Request__c:customer__c}, ' +
            '{Request__c:Lead__c}, ' +
            '{Request__c:Id}, ' +
            '{Request__c:customer_id__c}, ' +
            '{Request__c:Lead_id__c}, ' +
            '{Request__c:equip_move_type_cde__c}, ' +
            '{Request__c:equip_move_type_desc__c}, ' +
            '{Request__c:CreatedDate}, ' +
            '{Request__c:request_gpid__c}, ' +
            '{Request__c:caller_name__c}, ' +
            '{Request__c:move_purpose_cde__c}, ' +
            '{Request__c:move_request_date__c}, ' +
            '{Request__c:comments__c}, ' +
            '{Request__c:wndw_beg_tme__c}, ' +
            '{Request__c:wndw_end_tme__c}, ' +
            '{Request__c:display_in_asset_tab__c}, ' +
            '{Request__c:display_in_service_tab__c}, ' +
            '{Request__c:status__c}, ' +
            '{Request__c:CreatedBy.Name}, ' +
            '{Request__c:requested_by__c}, ' +
            '{Request__c:RecordTypeId}, ' +
            '{Request__c:request_subtype__c}, ' +
            '{Request__c:trbl_type_cde__c}, ' +
            '{Request__c:canc_reas_cde_descri__c},' +
            '{Request__c:survey_response__c},' +
            '{Request__c:requested_by__r.Name},' +
            '{Request__c:requested_by__r.MobilePhone},' +
            '{Request__c:caller_phone_num__c},' +
            '{Request__c:email_addr_txt__c},' +
            '{Request__c:details_revision_num__c},' +
            '{Request__c:sched_beg_dte__c},' +
            '{Request__c:survey_general_equip_details_response__c},' +
            '{Request__c:cets_ord_stat_cde__c},' +
            '{Request__c:order_id__c},' +
            '{Request__c:cets_ord_lne_num__c},' +
            '{Request__c:tech_cmnt_txt__c},' +
            '{Request__c:_soupEntryId} ' +
            'From {Request__c} ' +
            "WHERE {Request__c:Id} = '%s' and {Request__c:display_in_service_tab__c}='1' " +
            'ORDER BY {Request__c:CreatedDate} DESC'
    },
    getEquipmentRequestBySubType: {
        f: [
            'customer__c',
            'Id',
            'customer_id__c',
            'equip_move_type_cde__c',
            'equip_move_type_desc__c',
            'CreatedDate',
            'request_gpid__c',
            'caller_name__c',
            'move_purpose_cde__c',
            'move_request_date__c',
            'comments__c',
            'wndw_beg_tme__c',
            'wndw_end_tme__c',
            'display_in_asset_tab__c',
            'display_in_service_tab__c',
            'status__c',
            'CreatedBy.Name',
            'requested_by__c',
            'RecordTypeId',
            'request_subtype__c',
            'request_id__c'
        ],
        q:
            'SELECT {Request__c:customer__c}, ' +
            '{Request__c:Id}, ' +
            '{Request__c:customer_id__c}, ' +
            '{Request__c:equip_move_type_cde__c}, ' +
            '{Request__c:equip_move_type_desc__c}, ' +
            '{Request__c:CreatedDate}, ' +
            '{Request__c:request_gpid__c}, ' +
            '{Request__c:caller_name__c}, ' +
            '{Request__c:move_purpose_cde__c}, ' +
            '{Request__c:move_request_date__c}, ' +
            '{Request__c:comments__c}, ' +
            '{Request__c:wndw_beg_tme__c}, ' +
            '{Request__c:wndw_end_tme__c}, ' +
            '{Request__c:display_in_asset_tab__c}, ' +
            '{Request__c:display_in_service_tab__c}, ' +
            '{Request__c:status__c}, ' +
            '{Request__c:CreatedBy.Name}, ' +
            '{Request__c:requested_by__c}, ' +
            '{Request__c:RecordTypeId}, ' +
            '{Request__c:request_subtype__c}, ' +
            '{Request__c:request_id__c} ' +
            'From {Request__c} ' +
            "WHERE {Request__c:request_id__c} = '%s' AND {Request__c:request_subtype__c} = '%s' " +
            'ORDER BY {Request__c:CreatedDate} DESC LIMIT 1'
    },
    getEquipmentAssetByRequest: {
        f: [
            'Id',
            'equip_move_type_cde__c',
            'equip_move_type_desc__c',
            'equip_move_purp_cde__c',
            'equip_move_purp_descr__c'
        ],
        q:
            'SELECT {Asset_Attribute__c:Id}, ' +
            '{Asset_Attribute__c:equip_move_type_cde__c}, ' +
            '{Asset_Attribute__c:equip_move_type_desc__c}, ' +
            '{Asset_Attribute__c:equip_move_purp_cde__c}, ' +
            '{Asset_Attribute__c:equip_move_purp_descr__c} ' +
            'From {Asset_Attribute__c} ' +
            "WHERE {Asset_Attribute__c:master_data_type__c}= 'MovePurpose' AND " +
            "{Asset_Attribute__c:equip_move_type_cde__c} = 'INS'" +
            "AND {Asset_Attribute__c:active_flag__c} = '1' " +
            "AND {Asset_Attribute__c:equip_move_purp_cde__c} = '%s'"
    },
    getEquipmentAssetByServiceRequest: {
        f: [
            'Id',
            'equip_move_type_cde__c',
            'equip_move_type_desc__c',
            'equip_move_purp_cde__c',
            'equip_move_purp_descr__c'
        ],
        q:
            'SELECT {Asset_Attribute__c:Id}, ' +
            '{Asset_Attribute__c:equip_move_type_cde__c}, ' +
            '{Asset_Attribute__c:equip_move_type_desc__c}, ' +
            '{Asset_Attribute__c:equip_move_purp_cde__c}, ' +
            '{Asset_Attribute__c:equip_move_purp_descr__c} ' +
            'From {Asset_Attribute__c} ' +
            "WHERE {Asset_Attribute__c:master_data_type__c}= 'MovePurpose' AND " +
            "{Asset_Attribute__c:equip_move_type_cde__c} = '%s' " +
            "AND {Asset_Attribute__c:active_flag__c} = '1' " +
            "AND {Asset_Attribute__c:equip_move_purp_cde__c} = '%s'"
    },
    getRequestCustomerFilter: {
        f: ['customer__c', 'Id', 'equip_move_type_cde__c', 'status__c', 'RecordTypeId', 'request_subtype__c'],
        q:
            'SELECT {Request__c:customer__c} ' +
            'FROM {Request__c} ' +
            "WHERE {Request__c:request_subtype__c} = '%s' " +
            "AND {Request__c:equip_move_type_cde__c} = '%s' " +
            "AND {Request__c:status__c} != 'CLOSED' AND {Request__c:status__c} != 'CANCELLED' " +
            'GROUP BY {Request__c:customer__c}'
    },
    getRepairRequestCustomerFilter: {
        f: ['customer__c', 'serv_ord_type_cde__c'],
        q:
            'SELECT {Request__c:customer__c}, {Request__c:serv_ord_type_cde__c} ' +
            'FROM {Request__c} ' +
            "WHERE {Request__c:RecordTypeId} = '%s' " +
            "AND ({Request__c:serv_ord_type_cde__c} != 'PM' OR {Request__c:serv_ord_type_cde__c} IS NULL)   " +
            "AND {Request__c:status__c} != 'CLOSED' AND {Request__c:status__c} != 'CANCELLED' " +
            'GROUP BY {Request__c:customer__c}'
    },
    getCancelRequestCustomerFilter: {
        f: [
            'customer__c',
            'Id',
            'equip_move_type_cde__c',
            'status__c',
            'request_subtype__c',
            'cets_ord_stat_cde__c',
            'order_cancelled_date__c'
        ],
        q:
            'SELECT {Request__c:customer__c} ' +
            'FROM {Request__c} ' +
            "WHERE {Request__c:request_subtype__c} = '%s' " +
            "AND {Request__c:equip_move_type_cde__c} = '%s' " +
            "AND {Request__c:cets_ord_stat_cde__c} = 'CNL' " +
            'AND (date("now","-30 days")<=date(replace({Request__c:order_cancelled_date__c},\'+0000\',\'\'))) ' +
            'GROUP BY {Request__c:customer__c}'
    },
    getCancelRepairRequestCustomerFilter: {
        f: ['customer__c', 'Id', 'equip_move_type_cde__c', 'status__c', 'RecordTypeId', 'request_subtype__c'],
        q:
            'SELECT {Request__c:customer__c} ' +
            'FROM {Request__c} ' +
            "WHERE {Request__c:RecordTypeId} = '%s' " +
            "AND {Request__c:cets_ord_stat_cde__c} = 'CNL' " +
            "AND ({Request__c:serv_ord_type_cde__c} != 'PM' OR {Request__c:serv_ord_type_cde__c} IS NULL)   " +
            'AND (date("now","-30 days")<=date(replace({Request__c:order_cancelled_date__c},\'+0000\',\'\'))) ' +
            'GROUP BY {Request__c:customer__c}'
    },
    getServiceInfoByIdentId: {
        f: [
            'Id',
            'serv_ord_type_cde__c',
            'CreatedBy.Name',
            'CreatedDate',
            'equip_move_type_cde__c',
            'submitted_date__c',
            'requested_by__c',
            'requested_by__r.Name',
            'LastModifiedDate',
            'request_subtype__c',
            'parent_request_record__c',
            'equip_move_type_desc__c',
            'parent_request_record__r.status__c',
            'ident_item_id__c',
            'status__c',
            'request_id__c',
            'sched_beg_dte__c',
            'ord_rcv_dte_tme__c',
            'totalCount',
            'completedCount'
        ],
        q:
            'SELECT {Request__c:Id},' +
            '{Request__c:serv_ord_type_cde__c},' +
            '{Request__c:CreatedBy.Name},' +
            '{Request__c:CreatedDate},' +
            '{Request__c:equip_move_type_cde__c},' +
            '{Request__c:submitted_date__c},' +
            '{Request__c:requested_by__c},' +
            '{Request__c:requested_by__r.Name},' +
            '{Request__c:LastModifiedDate},' +
            '{Request__c:request_subtype__c},' +
            '{Request__c:parent_request_record__c}, ' +
            '{Request__c:equip_move_type_desc__c},' +
            '{Request__c:parent_request_record__r.status__c}, ' +
            '{Request__c:ident_item_id__c},' +
            '{Request__c:status__c},' +
            '{Request__c:request_id__c},' +
            '{Request__c:sched_beg_dte__c},' +
            '{Request__c:ord_rcv_dte_tme__c},' +
            "(SELECT COUNT(*) FROM {Request__c} WHERE {Request__c:request_subtype__c} = 'Move Request Line Item' " +
            'AND {Request__c:parent_request_record__c} = ORG.{Request__c:request_id__c}) AS totalCount, ' +
            "(SELECT COUNT(*) FROM {Request__c} WHERE {Request__c:request_subtype__c} = 'Move Request Line Item' " +
            'AND {Request__c:parent_request_record__c} = ORG.{Request__c:request_id__c} ' +
            "AND {Request__c:status__c} = 'CLOSED') AS completeCount " +
            'FROM {Request__c} ORG ' +
            "WHERE {Request__c:ident_item_id__c} ='%s' " +
            "AND (({Request__c:request_subtype__c} = 'Move Request Line Item' " +
            "AND {Request__c:parent_request_record__r.status__c} = '%s') " +
            "OR ({Request__c:request_subtype__c} = 'Service Request' AND {Request__c:status__c} = '%s')) " +
            'ORDER BY %s DESC',
        qCancelled:
            'SELECT {Request__c:Id}, ' +
            '{Request__c:serv_ord_type_cde__c},' +
            '{Request__c:CreatedBy.Name},' +
            '{Request__c:CreatedDate},' +
            '{Request__c:equip_move_type_cde__c},' +
            '{Request__c:submitted_date__c},' +
            '{Request__c:requested_by__c},' +
            '{Request__c:requested_by__r.Name},' +
            '{Request__c:LastModifiedDate},' +
            '{Request__c:request_subtype__c},' +
            '{Request__c:parent_request_record__c}, ' +
            '{Request__c:equip_move_type_desc__c},' +
            '{Request__c:parent_request_record__r.status__c}, ' +
            '{Request__c:ident_item_id__c},' +
            '{Request__c:status__c},' +
            '{Request__c:request_id__c},' +
            '{Request__c:sched_beg_dte__c},' +
            '{Request__c:ord_rcv_dte_tme__c},' +
            "(SELECT COUNT(*) FROM {Request__c} WHERE {Request__c:request_subtype__c} = 'Move Request Line Item' " +
            'AND {Request__c:parent_request_record__c} = ORG.{Request__c:request_id__c}) AS totalCount, ' +
            "(SELECT COUNT(*) FROM {Request__c} WHERE {Request__c:request_subtype__c} = 'Move Request Line Item' " +
            'AND {Request__c:parent_request_record__c} = ORG.{Request__c:request_id__c} ' +
            "AND {Request__c:status__c} = 'CLOSED') AS completeCount " +
            'FROM {Request__c} ORG ' +
            "WHERE {Request__c:ident_item_id__c} ='%s' " +
            "AND {Request__c:request_subtype__c} = 'Service Request' AND {Request__c:status__c} = 'CANCELLED'" +
            'ORDER BY {Request__c:LastModifiedDate} DESC'
    }
}

export default CustomerEquipmentQueries

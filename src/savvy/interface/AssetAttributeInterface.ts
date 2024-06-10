/* eslint-disable camelcase */
import { BaseSoupInterface } from './SoupModel'

// The naming following the Salesforce object.
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface Asset_Attribute__c extends BaseSoupInterface {
    active_flag__c: boolean
    equip_cond_cde__c: string
    equip_cond_desc__c: string
    equip_config_type_cde__c: string
    equip_config_type_desc__c: string
    equip_grphc_desc__c: string
    equip_grphc_id__c: string
    equip_move_purp_cde__c: string
    equip_move_purp_descr__c: string
    equip_move_type_cde__c: string
    equip_move_type_desc__c: string
    equip_styp_cde__c: string
    equip_styp_desc__c: string
    equip_type_cde__c: string
    equip_type_desc__c: string
    master_data_type__c: string
    natl_svc_plan_flg__c: boolean
    sls_plan_cde__c: string
    Sls_plan_desc__c: string
    serv_ctrct_id__c: string
    serv_ctrct_nme__c: string
    serv_ctrct_org_id__c: string
    serv_ctrct_typ_cde__c: string
    serv_ctrct_vrbg_txt__c: string
    serv_ctrct_vrbg_id__c: string
    serv_ctrct_vrbg_shrt_desc__c: string
    serv_ord_type_cde__c: string
    svc_srce_cde__c: string
    trbl_type_cde__c: string
    trbl_type_desc__c: string
}

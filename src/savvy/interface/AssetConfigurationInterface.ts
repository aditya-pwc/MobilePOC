/* eslint-disable camelcase */

import { BaseSoupInterface } from './SoupModel'

// The naming following the Salesforce object.
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface Asset_Configuration__c extends BaseSoupInterface {
    actv_stts_flg__c: boolean
    attr_desc__c: string
    attr_seq_num__c: string
    bus_type_cde__c: string
    delete_flg__c: boolean
    equip_config_type_cde__c: string
    equip_depth__c: number
    equip_grphc_id__c: string
    equip_hgt__c: number
    equip_hub_loc_id__c: string
    hub_nme__c: string
    equip_mech_rte_amt__c: number
    equip_styp_cde__c: string
    equip_type_cde__c: string
    equip_wdth__c: number
    inven_id__c: string
    move_loc_id__c: string
    move_lod_nme__c: string
    org_unit_id__c: string
    prod_loc_nme__c: string
    slct_num__c: string
    serv_loc_id__c: string
    serv_lod_nme__c: string
    std_attr_cde__c: string
    std_attr_desc__c: string
    std_attr_flg__c: boolean
    description__c: string
    abc_anlys_prrty_cde__c: string
}

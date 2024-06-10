/* eslint-disable camelcase */
import { BaseSoupInterface } from './SoupModel'

export interface Product2 extends BaseSoupInterface {
    std_attr_cde__c: string
    attr_desc__c: string
    IsActive: boolean
    Brand_Code__c: string
    Brand_Name__c: string
    Brand_Trademark_Family_Code__c: string
    Brand_Trademark_Family_Name__c: string
    Product_Depth__c: number
    equip_type_cde__c: string
    Flavor_Name__c: string
    Formatted_Brand__c: string
    Formatted_Flavor__c: string
    Formatted_Package__c: string
    Formatted_Sub_Brand_Name__c: string
    Product_Height__c: number
    Innovation_Flag__c: string
    Innov_Flag__c: boolean
    Product_Length__c: number
    Material_ID__c: string
    Material_Type_Name__c: string
    Material_Unique_ID__c: string
    Material_UOM_Code_Value__c: string
    Material_UOM_Name__c: string
    Package_Type__c: string
    Package_Type_Name__c: string
    Product_Category__c: string
    Description: string
    Product_Group_Code__c: string
    PROD_MIX_CDE__c: string
    Sub_Brand__c: string
    Sub_Brand_Code__c: string
    UOM_Code_Value__c: string
    Product_Width__c: number
}

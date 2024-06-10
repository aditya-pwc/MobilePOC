/*
 * @Author: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Date: 2023-10-27 15:56:38
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @LastEditTime: 2023-12-14 13:40:41
 */
export default {
    name: 'Account',
    soupName: 'Account',
    fieldList: [
        {
            name: 'Id',
            type: 'string'
        },
        {
            name: 'BCD_Tax_Rate__c',
            type: 'string'
        },
        {
            name: 'CUST_UNIQ_ID_VAL__c',
            type: 'string'
        },
        {
            name: 'tax_exempt_flg__c',
            type: 'string'
        },
        {
            name: 'Is_Natl_Acct__c',
            type: 'boolean'
        },
        {
            name: 'Pz_Id__c',
            type: 'string'
        }
    ]
}

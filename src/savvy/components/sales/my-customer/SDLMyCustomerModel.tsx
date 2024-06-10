/*
 * @Description: SDL my customer model
 * @Author: Yi Li
 * @Date: 2021-12-01 20:39:20
 * @LastEditTime: 2023-10-30 17:54:58
 * @LastEditors: Mary Qian
 */

export interface SDLMyCustomerCellModel {
    index?: number // index of cell, not necessary field
    title?: string // title of cell
    subTitle?: string // subTitle of cell
    contentTitle?: string // contentTitle of cell
    phone?: string // phoneNumber of cell
    userId?: string // userId of user , to search user heard image
    lastName?: string // lastName of user
    firstName?: string // firstName of user
    userName?: string // userName of cell , to show userName in cell footer
    salesRoute?: string // salesRoute of cell, to show salesRoute in cell footer
    ctrFrequency?: string
    ctrOrderDay?: string
    UserStatsId?: string
    AccountId?: string
    'Account.IsCDACustomer__c': '1' | '0' | null
    'Account.IsOTSCustomer__c': '1' | '0' | null
    'Account.CDA_Medal__c': string | null
    latitude?: number | string
    longitude?: number | string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Delta_Revenue_Percentage__c?: number
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    CUST_UNIQ_ID_VAL__c?: number
    distanceFromMe?: number
}

/*
 * @Description:
 * @Author: Aimee Zhang
 * @Date: 2021-12-03 11:38:30
 * @LastEditTime: 2021-12-03 14:00:19
 * @LastEditors: Aimee Zhang
 */

import { getWorkingStatusConfig } from '../../../utils/MerchManagerUtils'

export const handleCustomerFrequency = (accountId: string, ctrList: any[], rfmList: any[]) => {
    if (ctrList.length <= 0) {
        return
    }
    const data = ctrList.find((i) => i.Customer__c === accountId)
    if (data && data.CUST_RTE_FREQ_CDE__c) {
        const t = rfmList.find((ty) => ty.Code__c === data.CUST_RTE_FREQ_CDE__c)
        return t?.Label
    }
    return ''
}

export const handleCTROrderDay = (accountId: string, ctrList: any[]) => {
    if (ctrList.length <= 0) {
        return
    }
    const originData = JSON.parse(JSON.stringify(getWorkingStatusConfig()))
    const data = ctrList.find((i) => i.Customer__c === accountId)
    if (data && data.ORD_DAYS__c) {
        let orderDay = data.ORD_DAYS__c
        if (orderDay) {
            orderDay = orderDay.toLocaleUpperCase()
            const dayArray = orderDay.split(';')
            originData.forEach((item) => {
                if (dayArray.includes(item.name)) {
                    item.attend = true
                }
            })
        }
    }

    return originData
}

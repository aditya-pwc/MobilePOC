/* eslint-disable camelcase */
/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-01-12 19:21:26
 * @LastEditTime: 2022-01-18 05:54:31
 * @LastEditors: Mary Qian
 */

import { SFBase } from './SFBase'

export class SFVisitList extends SFBase {
    Start_Date_Time__c: string = ''
    Visit_Date__c: string = ''
    Total_Planned_Time__c: string = ''
    Planned_Mileage__c: string = ''
    End_Date_Time__c: string = ''
}

export const sfVisitListSelect = () => {
    const vl = new SFVisitList()
    return Object.keys(vl).join(', ')
}

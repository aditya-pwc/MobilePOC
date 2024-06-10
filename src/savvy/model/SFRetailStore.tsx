/* eslint-disable camelcase */
/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-01-12 19:21:42
 * @LastEditTime: 2022-01-18 06:24:00
 * @LastEditors: Mary Qian
 */

import { SFBase } from './SFBase'

export class SFRetailStore extends SFBase {
    Name: string = ''
    Street: string = ''
    City: string = ''
    State: string = ''
    PostalCode: string = ''
    Latitude: string = ''
    Longitude: string = ''
    Store_Location__c: string = ''
    'Account.Phone': string = ''
}

export const sfRetailStoreSelect = () => {
    const store = new SFRetailStore()
    return Object.keys(store).join(', ')
}

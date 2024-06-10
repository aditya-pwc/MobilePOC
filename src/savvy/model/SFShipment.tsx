/* eslint-disable camelcase */
/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-01-18 06:07:23
 * @LastEditTime: 2022-01-18 06:07:24
 * @LastEditors: Mary Qian
 */

import { SFBase } from './SFBase'

export class SFShipment extends SFBase {
    Total_Ordered_IntCount__c: string = ''
    Total_Delivered__c: string = ''
    Pallet_Total_IntCount__c: string = ''
}

export const sfShipmentSelect = () => {
    const shipment = new SFShipment()
    return Object.keys(shipment).join(', ')
}

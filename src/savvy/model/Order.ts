/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-11-29 13:48:02
 * @LastEditTime: 2022-11-29 13:57:37
 * @LastEditors: Mary Qian
 */
import _ from 'lodash'
import { t } from '../../common/i18n/t'

export enum OrderDeliveryMethodCode {
    DIS_BAY = '001',
    NON_DIS_BAY = '002',
    BULK = '003',
    WAREHOUSE = '004',
    UNDEFINED = '005'
}

export const OrderDeliveryMethod = {
    DIS_BAY: {
        code: OrderDeliveryMethodCode.DIS_BAY,
        name: 'Dispatchable Bay',
        i18nKey: 'PBNA_MOBILE_DISP_BAY'
    },
    NON_DIS_BAY: {
        code: OrderDeliveryMethodCode.NON_DIS_BAY,
        name: 'Non-Dispatchable Bay',
        i18nKey: 'PBNA_MOBILE_NON_DISP_BAY'
    },
    BULK: {
        code: OrderDeliveryMethodCode.BULK,
        name: 'Bulk',
        i18nKey: 'PBNA_MOBILE_BULK'
    },
    WAREHOUSE: {
        code: OrderDeliveryMethodCode.WAREHOUSE,
        name: 'Warehouse',
        i18nKey: 'PBNA_MOBILE_WAREHOUSE'
    },
    UNDEFINED: {
        code: OrderDeliveryMethodCode.UNDEFINED,
        name: 'Undefined',
        i18nKey: 'PBNA_MOBILE_UNDEFINED'
    }
}

export const TWO_DASH_PLACEHOLDER = '--'

export const getDeliveryMethodByCode = (code: string) => {
    if (_.isEmpty(code)) {
        return TWO_DASH_PLACEHOLDER
    }

    const find = Object.keys(OrderDeliveryMethod).find((i) => OrderDeliveryMethod[i].code === code)

    if (_.isEmpty(find)) {
        return TWO_DASH_PLACEHOLDER
    }

    const multiLanguageKey = OrderDeliveryMethod[find].i18nKey

    return t.labels[multiLanguageKey]
}

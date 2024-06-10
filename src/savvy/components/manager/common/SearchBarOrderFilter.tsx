/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-11-24 17:38:22
 * @LastEditTime: 2022-11-24 19:20:38
 * @LastEditors: Mary Qian
 */

import _ from 'lodash'
import { t } from '../../../../common/i18n/t'

enum OrderSortType {
    CUSTOMER_NAME = 'Customer Name',
    DELIVERY_DATE = 'Delivery Date',
    VOLUME = 'Volume'
}

enum AlphabeticallySortOptions {
    A_TO_Z = 'A-To-Z',
    Z_TO_A = 'Z-To-A'
}

enum TimeSortOptions {
    OLD_TO_NEW = 'Old - New',
    NEW_TO_OLD = 'New - Old'
}

enum SizeSortOptions {
    ASCENDING = 'Ascending',
    DESCENDING = 'Descending'
}

const getInitialOrderSortOptions = () => [
    {
        key: OrderSortType.CUSTOMER_NAME,
        label: t.labels.PBNA_MOBILE_CUSTOMER_NAME,
        selected: false,
        options: [
            { key: AlphabeticallySortOptions.A_TO_Z, label: t.labels.PBNA_MOBILE_A_Z, selected: false },
            { key: AlphabeticallySortOptions.Z_TO_A, label: t.labels.PBNA_MOBILE_Z_A, selected: false }
        ]
    },
    {
        key: OrderSortType.DELIVERY_DATE,
        label: t.labels.PBNA_MOBILE_DELIVERY_DATE,
        selected: false,
        options: [
            { key: TimeSortOptions.OLD_TO_NEW, label: t.labels.PBNA_MOBILE_SORT_OLD_NEW, selected: false },
            { key: TimeSortOptions.NEW_TO_OLD, label: t.labels.PBNA_MOBILE_SORT_NEW_OLD, selected: false }
        ]
    },
    {
        key: OrderSortType.VOLUME,
        label: t.labels.PBNA_MOBILE_VOLUME,
        selected: true,
        options: [
            { key: SizeSortOptions.ASCENDING, label: t.labels.PBNA_MOBILE_ASCENDING, selected: true },
            { key: SizeSortOptions.DESCENDING, label: t.labels.PBNA_MOBILE_DESCENDING, selected: false }
        ]
    }
]

export const getOrderSortOptions = () => {
    return _.cloneDeep(getInitialOrderSortOptions())
}

export const onSelectOrderSort = (sortKey: '', optionKey: '', orderSortOptions, setOrderSortOptions) => {
    const temp = _.cloneDeep(orderSortOptions)
    temp.forEach((item) => {
        item.selected = item.key === sortKey
        if (item.selected) {
            item.options.forEach((option) => {
                option.selected = option.key === optionKey
            })
        } else {
            item.options.forEach((option) => {
                option.selected = false
            })
        }
    })

    setOrderSortOptions(temp)
}

const orderListByCustomerName = (optionKey, dataList) => {
    if (optionKey === AlphabeticallySortOptions.A_TO_Z) {
        dataList.sort((a, b) => (a.AccountName < b.AccountName ? -1 : 1))
    }
    if (optionKey === AlphabeticallySortOptions.Z_TO_A) {
        dataList.sort((a, b) => (a.AccountName > b.AccountName ? -1 : 1))
    }
}

const orderListByDeliveryDate = (optionKey, dataList) => {
    if (optionKey === TimeSortOptions.OLD_TO_NEW) {
        dataList.sort((a, b) => (a.OrderDlvryRqstdDtm < b.OrderDlvryRqstdDtm ? -1 : 1))
    }
    if (optionKey === TimeSortOptions.NEW_TO_OLD) {
        dataList.sort((a, b) => (b.OrderDlvryRqstdDtm < a.OrderDlvryRqstdDtm ? -1 : 1))
    }
}

const orderListByVolume = (optionKey, dataList) => {
    dataList.sort((a, b) => {
        const aVolume = a.volume || 0
        const bVolume = b.volume || 0
        if (optionKey === SizeSortOptions.ASCENDING) {
            return aVolume - bVolume
        }
        if (optionKey === SizeSortOptions.DESCENDING) {
            return bVolume - aVolume
        }
        return 0
    })
}

export const sortOrdersByOptions = (orderSortOptions, orderListForShow) => {
    orderSortOptions.forEach((sortOption) => {
        if (sortOption.selected) {
            const selectedOption = sortOption.options.find((item) => item.selected)

            if (selectedOption) {
                switch (sortOption.key) {
                    case OrderSortType.CUSTOMER_NAME:
                        orderListByCustomerName(selectedOption.key, orderListForShow)
                        break
                    case OrderSortType.DELIVERY_DATE:
                        orderListByDeliveryDate(selectedOption.key, orderListForShow)
                        break
                    case OrderSortType.VOLUME:
                        orderListByVolume(selectedOption.key, orderListForShow)
                        break
                    default:
                        break
                }
            }

            return orderListForShow
        }
    })

    return orderListForShow
}

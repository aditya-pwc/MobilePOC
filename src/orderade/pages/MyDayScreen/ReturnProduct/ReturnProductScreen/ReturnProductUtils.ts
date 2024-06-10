/*
 * @Author: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Date: 2023-12-05 10:00:47
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @LastEditTime: 2024-01-15 15:44:59
 */
import { NavigationProp } from '@react-navigation/native'
import { t } from '../../../../../common/i18n/t'
import { MyDayVisitModel } from '../../../../interface/MyDayVisit'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { Log } from '../../../../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { DropDownType } from '../../../../enum/Common'
import DropdownAlert from 'react-native-dropdownalert'
import React from 'react'
import { CommonParam } from '../../../../../common/CommonParam'
import { formatWithTimeZone } from '../../../../../common/utils/TimeZoneUtils'
import moment from 'moment'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { BreadcrumbVisibility, Instrumentation } from '@appdynamics/react-native-agent'
import { ReturnCartItem, ReturnProductListModel } from '../../../../interface/ReturnProduct'
import _ from 'lodash'
import { calculateTotal } from '../../../../utils/ProductUtils'
import OrderService from '../../../../service/OrderService'
import CartService from '../../../../service/CartService'

export const submitReturnOnlyOrder = async (
    store: MyDayVisitModel,
    cartDetail: {
        notes: string
        DeliveryDate: string
        PONumber: string
        notesRecordTime: number | string | null
    },
    dropDownRef: React.RefObject<DropdownAlert>,
    navigation: NavigationProp<any>,
    setShowModal: Function
) => {
    if (CommonParam.isSyncing) {
        dropDownRef?.current?.alertWithType(DropDownType.INFO, t.labels.PBNA_MOBILE_COPILOT_SYNC_IN_PROGRESS, '')
        return
    }
    const now = Date.now()
    const notesTime = cartDetail.notesRecordTime ?? parseInt(cartDetail.notesRecordTime + '')
    const custPoId = store.CustUniqId + '_' + CommonParam.GPID__c + '_' + now
    const logMsg = `${
        CommonParam.GPID__c
    } has clicked Submit button in return only order page: ${custPoId} at ${formatWithTimeZone(
        moment(),
        TIME_FORMAT.YMDTHMS,
        true,
        true
    )}`
    Instrumentation.leaveBreadcrumb(logMsg, BreadcrumbVisibility.CRASHES_AND_SESSIONS)
    storeClassLog(Log.MOBILE_INFO, 'orderade:place an return only order', logMsg)
    let success = false
    try {
        const orderCartIdentifier = store.OrderCartIdentifier || store.VisitLegacyId
        const cartData = (await CartService.getCartItems(orderCartIdentifier, true)) as unknown as ReturnCartItem[]
        global.$globalModal.openModal()
        await OrderService.pushCartToSF({
            visit: store,
            cartData,
            notes: cartDetail.notes,
            PONumber: cartDetail.PONumber,
            now,
            cartDetail,
            isReturnOnly: true,
            notesTime
        })
        success = true
        setTimeout(() => {
            global.$globalModal.closeModal()
            setShowModal(true)
        }, 1000)
        setTimeout(() => {
            setShowModal(false)
            navigation.goBack()
        }, 3000)
    } catch (err) {
        global.$globalModal.closeModal()
        const errorStr = ErrorUtils.error2String(err)
        Instrumentation.leaveBreadcrumb(
            `User submit return only order failed: ${errorStr}`,
            BreadcrumbVisibility.CRASHES_AND_SESSIONS
        )
        storeClassLog(
            Log.MOBILE_ERROR,
            'Orderade: submitReturnOnlyOrder',
            `User submit return only order failed: ${errorStr}`
        )
        dropDownRef?.current?.alertWithType(DropDownType.ERROR, 'Create Order Fail', errorStr)
    }
    return success
}

export const formatPriceWithComma = (input: string) => {
    return input.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const calculateReturnTotal = async (
    productList: ReturnProductListModel[],
    setCalculateResult: Function,
    setFinalReturnList: Function
) => {
    let [totalTotal, totalCases, totalUnits] = [0, 0, 0]
    ;(productList || []).forEach((item: ReturnProductListModel) => {
        if (item.products && item.products.length > 0) {
            item.products.forEach((product: any) => {
                calculateTotal(product)
            })
            totalCases += item.packageCases = _.sumBy(item.products, function (a: any) {
                return Number(a.breakageCases || 0) + Number(a.outOfDateCases || 0) + Number(a.saleableCases || 0)
            })
            totalUnits += item.packageUnits = _.sumBy(item.products, function (a: any) {
                return Number(a.breakageUnits || 0) + Number(a.outOfDateUnits || 0) + Number(a.saleableUnits || 0)
            })
            totalTotal += _.sumBy(item.products, function (a: any) {
                return Number(a.breakageTotal || 0) + Number(a.outOfDateTotal || 0) + Number(a.saleableTotal || 0)
            })
        }
    })
    setCalculateResult({ totalTotal, totalCases, totalUnits })
    setFinalReturnList(productList)
}

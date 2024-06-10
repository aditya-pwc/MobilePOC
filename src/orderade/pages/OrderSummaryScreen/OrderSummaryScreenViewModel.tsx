import { ProductSKUType } from '../../hooks/ProductSellingHooks'
import _ from 'lodash'
import { MyDayVisitModel } from '../../interface/MyDayVisit'
import { CartDetail } from '../../interface/CartDetail'
import { DropDownType } from '../../enum/Common'
import { CommonParam } from '../../../common/CommonParam'
import { t } from '../../../common/i18n/t'
import { BreadcrumbVisibility, Instrumentation } from '@appdynamics/react-native-agent'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { VisitStatus } from '../../enum/VisitType'
import { appendLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import { formatWithTimeZone } from '../../../common/utils/TimeZoneUtils'
import moment from 'moment'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { isTrueInDB } from '../../../common/utils/CommonUtils'
import { ReturnCartItem } from '../../interface/ReturnProduct'
import OrderService from '../../service/OrderService'
import VisitService from '../../service/VisitService'
import SyncDownService from '../../service/SyncDownService'

export const getCartList = (productList: Array<ProductSKUType>) => {
    const toDoLst = _.cloneDeep(productList)

    toDoLst.forEach((item) => {
        item.products = item.products?.filter((v) => v.quantity !== '0')
    })
    return toDoLst.filter((v) => !_.isEmpty(v.products))
}

export const checkPlaceOrderIsAvailable = (cartData: Array<ReturnCartItem>) => {
    return (
        cartData.length === 0 ||
        (cartData.every((v) => v.Quantity === '0') && cartData.every((v) => !isTrueInDB(v.ReturnApplied)))
    )
}

interface OnConfirmParamsType {
    Store: MyDayVisitModel
    CartData: Array<ReturnCartItem>
    Navigation: any
    SetShowModal: Function
    DropDownRef: any
    Notes: string
    PONumber: string
    CartDetail?: CartDetail
    IsFromCompletedVisit?: boolean
    NotesRecordTime: number | null
}
// Async arrow function has too many parameters (8). Maximum allowed is 7.
export const onConfirm = async (params: OnConfirmParamsType) => {
    const {
        Store: store,
        CartData: cartData,
        Navigation: navigation,
        SetShowModal: setShowModal,
        DropDownRef: dropDownRef,
        Notes: notes,
        CartDetail: cartDetail,
        IsFromCompletedVisit: isFromCompletedVisit,
        PONumber,
        NotesRecordTime: notesRecordTime
    } = params
    // if current syncing do not let user to submit order
    // it might cause Sent_To_OCH__c flag update overwritten by on-going sync process
    if (CommonParam.isSyncing) {
        dropDownRef.current.alertWithType('info', t.labels.PBNA_MOBILE_COPILOT_SYNC_IN_PROGRESS)
        return
    }
    const now = Date.now()
    const notesTime = notesRecordTime ? parseInt(notesRecordTime + '') : null
    const custPoId = store.CustUniqId + '_' + CommonParam.GPID__c + '_' + now
    const logMsg = `User placed an order: ${custPoId} at ${formatWithTimeZone(
        moment(),
        TIME_FORMAT.YMDTHMS,
        true,
        true
    )}`
    Instrumentation.leaveBreadcrumb(logMsg, BreadcrumbVisibility.CRASHES_AND_SESSIONS)
    appendLog(Log.MOBILE_INFO, 'orderade:place an order', logMsg)
    try {
        global.$globalModal.openModal()
        await SyncDownService.syncDownVisitAndRelatedOrder(store.Id)
        const currentVisit = await VisitService.getCurrentVisitByVisitId(store.Id)
        await OrderService.pushCartToSF({
            visit: store,
            cartData,
            notes,
            PONumber,
            now,
            cartDetail,
            isReturnOnly: false,
            notesTime
        })
        setTimeout(() => {
            global.$globalModal.closeModal()
            setShowModal(true)
        }, 1000)
        setTimeout(() => {
            setShowModal(false)
            if (currentVisit && currentVisit.length > 0 && currentVisit[0].Status__c === VisitStatus.COMPLETE) {
                navigation.navigate('CompletedVisitScreen', {
                    isGoBackToMyDay: true,
                    storeId: store.PlaceId,
                    visit: {
                        ...store,
                        Status: currentVisit[0].Status__c,
                        ActualStartTime: currentVisit[0].ActualVisitStartTime,
                        ActualEndTime: currentVisit[0].ActualVisitEndTime
                    },
                    isToday: isFromCompletedVisit
                })
            } else if (isFromCompletedVisit) {
                navigation.navigate('CompletedVisitScreen', {
                    storeId: store.PlaceId,
                    visit: store,
                    isToday: isFromCompletedVisit
                })
            } else {
                navigation.navigate('BCDMyVisitDetail', {
                    visitId: store.Id,
                    storeId: store.PlaceId,
                    visit: store
                })
            }
        }, 3000)
    } catch (err) {
        global.$globalModal.closeModal()
        Instrumentation.leaveBreadcrumb(
            `User submit order failed: ${ErrorUtils.error2String(err)}`,
            BreadcrumbVisibility.CRASHES_AND_SESSIONS
        )
        dropDownRef.current.alertWithType(DropDownType.ERROR, 'Create Order Fail', err)
    }
}

export const onClearCart = async (
    storeId: string,
    dropDownRef: any,
    cartDetail: CartDetail | any,
    setShowRemoveModal: Function,
    orderCartIdentifier: string,
    store: MyDayVisitModel
) => {
    try {
        global.$globalModal.openModal()
        await SyncDownService.syncDownVisitAndRelatedOrder(store.Id)
        await OrderService.clearCart(orderCartIdentifier)
        await OrderService.saveCartDetail(
            storeId,
            {
                ...cartDetail,
                OrderNotes: ''
            },
            orderCartIdentifier
        )
        setTimeout(() => {
            global.$globalModal.closeModal()
            setShowRemoveModal(true)
        }, 1000)
        setTimeout(() => {
            setShowRemoveModal(false)
        }, 3000)
    } catch (err) {
        global.$globalModal.closeModal()
        Instrumentation.leaveBreadcrumb(
            `User clear cart failed: ${ErrorUtils.error2String(err)}`,
            BreadcrumbVisibility.CRASHES_AND_SESSIONS
        )
        dropDownRef.current.alertWithType(DropDownType.ERROR, 'Clear Cart Fail', err)
    }
}
